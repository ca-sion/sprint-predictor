/**
 * Prediction Engine
 * The physics and statistical core.
 * Implements "The Velocity Reserve Model" logic.
 * Driven by DISCIPLINES configuration.
 */
import { ATHLETICS_DATA } from '../data/definitions/Standards.js';
import { DISCIPLINES } from '../data/definitions/Disciplines.js';

export class PredictionEngine {
    constructor() {
        this.CONSTANTS = {
            REACTION_TIME: 0.15, 
            ACCEL_TAU_DEFAULT: 0.9, 
            VMAX_DEFAULT: 9.0, 
        };
    }

    /**
     * Main prediction entry point
     */
    predict(athlete, targetEvent) {
        const config = DISCIPLINES[targetEvent];
        if (!config) throw new Error(`Discipline ${targetEvent} non supportée.`);

        const metrics = athlete.metrics;
        const profile = this.calculateProfile(metrics);
        
        let result = {
            time: 0,
            range: 0,
            splits: [],
            method: 'Model',
            tags: [],
            warnings: profile.warnings || [],
            sources: profile.sources || []
        };

        // Dispatch based on discipline type
        switch (config.type) {
            case 'flat':
                result = this.predictFlat(profile, config, athlete);
                break;
            case 'flat_long': // 200m
                result = this.predictFlatLong(profile, config, athlete);
                break;
            case 'long_sprint': // 400m
                result = this.predictLongSprint(profile, config, athlete);
                break;
            case 'hurdles':
                result = this.predictHurdles(profile, config, athlete);
                break;
            case 'hurdles_long': // 400mH
                result = this.predictHurdlesLong(profile, config, athlete);
                break;
        }

        if (profile.warnings?.length > 0) result.warnings = [...(result.warnings || []), ...profile.warnings];
        if (profile.sources?.length > 0) result.sources = [...(result.sources || []), ...profile.sources];

        return { ...result, profile };
    }

    /**
     * Physics-based prediction for flat sprints (50m, 60m, 100m)
     */
    predictFlat(profile, config, athlete) {
        const { vmax, tau } = profile;
        const { distance, params } = config;
        
        const rawTime = this.calculateTimeAtDistance(distance, vmax, tau);
        let physicsTime = rawTime + this.CONSTANTS.REACTION_TIME;
        
        let flyTime = null;
        let flySource = '';
        
        // Resolve K Factor from config
        let K = params.kFactor?.default || 0.20;
        if (athlete.category === 'U16') K = params.kFactor?.U16 || K;
        else if (['U18', 'U20'].includes(athlete.category) || athlete.gender === 'F') K = params.kFactor?.U18 || params.kFactor?.F || K;
        
        const metrics = athlete.metrics;

        // Model A: Fly-to-Sprint (usually for 100m)
        if (distance === 100 && params.baseStartCost) {
            if (metrics.test_30m_fly) {
                flyTime = (metrics.test_30m_fly * 3.33) + params.baseStartCost + K;
                flySource = `Fly-to-100 (K=${K}s)`;
            } else if (metrics.test_20m_fly) {
                flyTime = (metrics.test_20m_fly * 5.0) + params.baseStartCost + K;
                flySource = `Fly-to-100 (20m)`;
            }
        }

        // Model B: Mero Power Law (if ratio defined)
        let meroTime = null;
        if (params.meroRatio) {
            let t60 = metrics.pb_60m || (this.calculateTimeAtDistance(60, vmax, tau) + this.CONSTANTS.REACTION_TIME);
            meroTime = t60 * params.meroRatio;
        }

        // Model C: Acceleration Bonus
        let accelBonus = (params.accelBonusThreshold && metrics.test_30m_block && metrics.test_30m_block < params.accelBonusThreshold) ? 0.15 : 0;

        let finalTime = physicsTime;
        let usedMethod = 'Modèle Physique';

        if (flyTime) {
            finalTime = flyTime;
            usedMethod = flySource;
            if (meroTime && (meroTime - flyTime) > 0.15) {
                finalTime = (flyTime * 0.7) + (meroTime * 0.3);
                usedMethod += ' + Mero-correction';
            }
            if (accelBonus > 0) {
                finalTime -= accelBonus;
                usedMethod += ' + Accel-bonus';
            }
        } else if (meroTime && distance === 100) {
            finalTime = meroTime;
            usedMethod = 'Loi de Mero';
        }
        
        // PB sanity check (100m)
        if (metrics.pb_100m && distance === 100 && (metrics.pb_100m - finalTime) > 0.5) {
            finalTime = (finalTime + metrics.pb_100m) / 2;
            usedMethod = "Moyenne (Potentiel vs Réalisé)";
        }

        const splits = this.generateSplits(finalTime, physicsTime, distance, vmax, tau, metrics.step_len_avg_r || 2.0);

        return { time: finalTime.toFixed(2), range: 0.10, splits, scaleFactor: finalTime / physicsTime, tags: [usedMethod] };
    }

    /**
     * 200m Model (Fatigue Index + Detailed Splits)
     */
    predictFlatLong(profile, config, athlete) {
        const { params, distance } = config;
        let t100 = athlete.metrics.pb_100m || parseFloat(this.predictFlat(profile, DISCIPLINES['100m'], athlete).time);
        
        let delta = params.deltas.neutral; 
        let bias = "Neutre";
        
        const ifIndex = this.calculateFatigueIndex(athlete.metrics);
        if (ifIndex > params.fatigueIndexThresholds.speed) { 
            delta = params.deltas.speed; 
            bias = "Speed-Biased"; 
        } else if (ifIndex < params.fatigueIndexThresholds.endurance && ifIndex > 0) { 
            delta = params.deltas.endurance; 
            bias = "Endurance-Biased"; 
        }
        
        const predictedTime = (t100 * 2) + delta;
        
        // Splits Generation
        const splits = [];
        const flatPred = this.predictFlat(profile, DISCIPLINES['100m'], athlete);
        const s50 = flatPred.splits.find(s => s.distance === 50) || { time: t100 * 0.6, velocity: 0 };
        
        splits.push({ distance: 50, time: s50.time, segmentTime: s50.time, velocity: s50.velocity });
        splits.push({ distance: 100, time: t100, segmentTime: t100 - s50.time, velocity: 50 / (t100 - s50.time) });
        
        const tSecond100 = predictedTime - t100;
        const t100_150 = tSecond100 * 0.49;
        const t150 = t100 + t100_150;
        splits.push({ distance: 150, time: t150, segmentTime: t100_150, velocity: 50 / t100_150 });
        splits.push({ distance: 200, time: predictedTime, segmentTime: predictedTime - t150, velocity: 50 / (predictedTime - t150) });

        return { time: predictedTime.toFixed(2), range: 0.25, splits, scaleFactor: 1.0, tags: [bias, `Base 100m + Delta ${delta}s`] };
    }

    /**
     * 400m Model (ASR logic)
     */
    predictLongSprint(profile, config, athlete) {
        const { params } = config;
        let t200 = athlete.metrics.pb_200m || parseFloat(this.predictFlatLong(profile, DISCIPLINES['200m'], athlete).time);
        const ifIndex = this.calculateFatigueIndex(athlete.metrics);
        
        let margin = params.margins.default;
        if (ifIndex > params.fatigueIndexThresholds.sprinter) {
            margin = (athlete.category === "U16") ? params.margins.U16_sprinter : params.margins.sprinter;
        } else if (ifIndex < params.fatigueIndexThresholds.resistant && ifIndex > 0) {
            margin = params.margins.resistant;
        }

        const predictedTime = (t200 * 2) + margin;
        const pacing200 = t200 + 1.0;
        const splits = [
            { distance: 200, time: pacing200, segmentTime: pacing200, velocity: 200/pacing200 },
            { distance: 400, time: predictedTime, segmentTime: predictedTime - pacing200, velocity: 200/(predictedTime - pacing200) }
        ];

        return { time: predictedTime.toFixed(2), range: 0.8, splits, scaleFactor: 1.0, tags: ["ASR Model", `Margin +${margin}s`] };
    }

    /**
     * Short Hurdles (IE Target + Specs)
     */
    predictHurdles(profile, config, athlete) {
        const pFlat = this.predictFlat(profile, config, athlete);
        const tFlat = parseFloat(pFlat.time);
        
        const ieMap = config.params.ieTarget;
        let ie = ieMap.default || 1.0;
        if (athlete.category === 'U16') ie = ieMap.U16 || ie;
        else if (['U18', 'U20'].includes(athlete.category)) ie = ieMap.U18 || ie;
        else if (athlete.gender === 'F') ie = ieMap.F || ie;
        else if (athlete.gender === 'M') ie = ieMap.M || ie;
        
        return { 
            time: (tFlat + ie).toFixed(2), 
            range: 0.3, 
            splits: pFlat.splits, 
            tags: ['Technique Index', `IE Target: +${ie}s`]
        };
    }

    /**
     * 400m Hurdles
     */
    predictHurdlesLong(profile, config, athlete) {
        const p400 = this.predictLongSprint(profile, DISCIPLINES['400m'], athlete);
        const t400 = parseFloat(p400.time);
        const diffMap = config.params.diff400;
        let diff = (athlete.gender === 'F' ? diffMap.F : diffMap.M) + (athlete.category === 'U18' ? diffMap.U18_bonus : 0);
        
        return { 
            time: (t400 + diff).toFixed(2), 
            range: 1.0, 
            splits: p400.splits, 
            tags: ["400mH Differential", `T400 + ${diff}s`] 
        };
    }

    /**
     * Helper to generate standardized splits
     */
    generateSplits(finalTime, physicsTime, distance, vmax, tau, baseStepLen) {
        const splits = [];
        const scaleFactor = finalTime / physicsTime; 
        let prevTime = this.CONSTANTS.REACTION_TIME * scaleFactor;
        const res = distance <= 110 ? 5 : 10;

        for(let d=res; d<=distance; d+=res) {
            const st = (this.calculateTimeAtDistance(d, vmax, tau) + this.CONSTANTS.REACTION_TIME) * scaleFactor;
            const segmentTime = st - prevTime;
            const velocity = res / segmentTime;
            const theoreticalSL = baseStepLen * (0.85 + 0.15 * (velocity / vmax));
            const theoreticalFreq = velocity / theoreticalSL;

            splits.push({ distance: d, time: st, segmentTime, velocity, frequency: theoreticalFreq, stepLength: theoreticalSL });
            prevTime = st;
        }
        return splits;
    }

    /**
     * Core Profile Calculation (unchanged physical logic)
     */
    calculateProfile(metrics) {
        let vmax = this.CONSTANTS.VMAX_DEFAULT;
        let tau = this.CONSTANTS.ACCEL_TAU_DEFAULT;
        let sources = [];
        let warnings = [];

        let vmaxSources = [];
        if (metrics.test_30m_fly) vmaxSources.push({ val: 30 / metrics.test_30m_fly, type: '30m Fly' });
        if (metrics.test_20m_fly) vmaxSources.push({ val: 20 / metrics.test_20m_fly, type: '20m Fly' });
        if (metrics.pb_100m) vmaxSources.push({ val: (100 / metrics.pb_100m) * 1.16, type: 'Est. from 100m PB' });

        if (vmaxSources.length > 0) {
            const measured = vmaxSources.filter(s => s.type.includes('Fly'));
            const best = measured.length > 0 ? measured.reduce((prev, curr) => (prev.val > curr.val) ? prev : curr) : vmaxSources[0];
            vmax = best.val;
            sources.push(best.type);
        }

        if (metrics.test_30m_block) tau = this.solveTau(30, metrics.test_30m_block - this.CONSTANTS.REACTION_TIME, vmax);
        else if (metrics.pb_60m) tau = this.solveTau(60, metrics.pb_60m - this.CONSTANTS.REACTION_TIME, vmax);

        return { vmax, tau, sources, warnings };
    }

    solveTau(d, t, vmax) {
        let tau = 1.0; 
        for(let i=0; i<15; i++) {
            let exp = Math.exp(-t/tau);
            let f = vmax * (t + tau * exp - tau) - d;
            let df = vmax * (exp * (1 + t/tau) - 1);
            if(Math.abs(df) < 0.0001) break;
            let newTau = tau - f/df;
            if (Math.abs(newTau - tau) < 0.0001) return newTau;
            tau = newTau;
        }
        return Math.max(0.5, Math.min(tau, 2.5)); 
    }

    calculateTimeAtDistance(d, vmax, tau) {
        let t = d / (vmax * 0.7); 
        for(let i=0; i<15; i++) {
            let exp = Math.exp(-t/tau);
            let f = vmax * (t + tau * exp - tau) - d;
            let df = vmax * (1 - exp); 
            if (Math.abs(f) < 0.001) return t;
            t = t - f/df;
        }
        return t;
    }

    calculateFatigueIndex(metrics) {
        if (!metrics.test_30m_fly) return 0;
        let tLong = metrics.test_120m || metrics.test_80m || metrics.test_60m || 0;
        let dLong = metrics.test_120m ? 120 : metrics.test_80m ? 80 : metrics.test_60m ? 60 : 0;
        return (tLong > 0) ? (30 / metrics.test_30m_fly) / (dLong / tLong) : 0;
    }
}