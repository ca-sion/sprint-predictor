/**
 * Prediction Engine
 * The physics and statistical core.
 * Implements "The Velocity Reserve Model" logic.
 * Updated for Standards 2026 - ATHLETICS_DATA Unified Structure
 */
import { ATHLETICS_DATA, CONTACT_TIME_TARGETS } from '../data/ReferenceData.js';

export class PredictionEngine {
    constructor() {
        // Constants from literature (Mero et al, Morin et al)
        this.CONSTANTS = {
            REACTION_TIME: 0.15, // Default reaction time
            ACCEL_TAU_DEFAULT: 0.9, // Default time constant for acceleration
            VMAX_DEFAULT: 9.0, // m/s
        };
    }

    /**
     * Helper to safely access the new ATHLETICS_DATA tree
     * @param {string} event 
     * @param {string} gender 
     * @param {string} category 
     */
    getRefData(event, gender, category) {
        const eventNode = ATHLETICS_DATA[event];
        if (!eventNode) return null;
        const genderNode = eventNode[gender] || eventNode['M'];
        if (!genderNode) return null;
        return genderNode[category] || genderNode['ELITE'];
    }

    /**
     * Main prediction method
     * @param {Athlete} athlete 
     * @param {string} targetEvent 
     */
    predict(athlete, targetEvent) {
        const metrics = athlete.metrics;
        
        // 1. Establish Profile (Vmax, Tau, Endurance) with Coherence Check
        const profile = this.calculateProfile(metrics);
        
        // 2. Predict specific event
        let result = {
            time: 0,
            range: 0,
            splits: [],
            method: 'Model',
            tags: [],
            warnings: profile.warnings || [],
            sources: profile.sources || []
        };

        switch (targetEvent) {
            case '60m':
                result = this.predictFlatSprint(profile, 60, athlete);
                break;
            case '100m':
                result = this.predictFlatSprint(profile, 100, athlete);
                break;
            case '200m':
                result = this.predict200m(profile, athlete);
                break;
            case '400m':
                result = this.predict400m(profile, athlete);
                break;
            case '100mH': // Women
                result = this.predictHurdles(profile, '100mH', athlete);
                break;
            case '110mH': // Men
                result = this.predictHurdles(profile, '110mH', athlete);
                break;
            case '400mH':
                result = this.predictHurdlesLong(profile, '400mH', athlete);
                break;
        }

        // Add warnings from profile to result
        if (profile.warnings && profile.warnings.length > 0) {
            result.warnings = [...(result.warnings || []), ...profile.warnings];
        }
        
        // Add sources to result
        if (profile.sources && profile.sources.length > 0) {
            result.sources = [...(result.sources || []), ...profile.sources];
        }

        // 3. Analyze Consistency (PBs vs Prediction)
        const consistency = this.analyzeConsistency(result.time, targetEvent, metrics);

        // 4. Assess Level
        const level = this.assessLevel(result.time, targetEvent, athlete);

        // 5. Generate Analysis Grid (Ranges check)
        const analysisGrid = this.generateAnalysisGrid(athlete, result.time, targetEvent, profile);

        return { ...result, profile, consistency, level, analysisGrid };
    }

    /**
     * Generates a detailed analysis grid exploiting all ATHLETICS_DATA properties.
     */
    generateAnalysisGrid(athlete, predictedTime, event, profile) {
        const grid = [];
        const gender = athlete.gender || 'M';
        const athleteCategory = athlete.category || 'U20';
        
        const data = this.getRefData(event, gender, athleteCategory);
        const sprintRef = this.getRefData('100m', gender, athleteCategory);

        // Helper: Find the best matching level for a value across all categories
        const findBestLevel = (val, eventKey, subPath) => {
            const eventNode = ATHLETICS_DATA[eventKey];
            if (!eventNode) return null;
            const genderNode = eventNode[gender] || eventNode['M'];
            if (!genderNode) return null;

            // Categories sorted from Elite down to U16
            const categories = ['ELITE', 'U23', 'U20', 'U18', 'U16'];
            
            for (const cat of categories) {
                const catData = genderNode[cat];
                if (!catData) continue;

                // Navigate to the target metrics (e.g., performance_ranges or tests.fly30m)
                const parts = subPath.split('.');
                let metricRange = catData;
                for (const part of parts) {
                    metricRange = metricRange ? metricRange[part] : null;
                }

                if (metricRange && metricRange.min !== undefined && metricRange.max !== undefined) {
                    // Check if value fits or is BETTER than this category
                    // Note: for time, better is smaller.
                    if (val <= metricRange.max && val >= metricRange.min) {
                      return cat;
                    }
                } else if (metricRange && metricRange.target !== undefined) {
                    // For single target values (like block30m)
                    if (val <= metricRange.target) {
                        return cat;
                    }
                }
            }
            return 'Loisir';
        };

        // 1. Performance Target
        if (data && data.performance_ranges) {
            const { min, max } = data.performance_ranges;
            const t = parseFloat(predictedTime);
            let status = t < min ? 'excellent' : (t > max ? 'bad' : 'good');
            let diff = t < min ? t - min : (t > max ? t - max : 0);

            // Dynamically find the real level
            const actualLevel = findBestLevel(t, event, 'performance_ranges');

            grid.push({
                label: `Perf. Cible (${event})`,
                value: `${t.toFixed(2)}s`,
                target: `${min.toFixed(2)}-${max.toFixed(2)}s`,
                diff: diff !== 0 ? (diff > 0 ? `+${diff.toFixed(2)}s` : `${diff.toFixed(2)}s`) : 'Dans la cible',
                status: status,
                level: actualLevel,
                obs: status === 'excellent' ? 'Niveau supérieur' : (status === 'bad' ? 'En retrait' : 'Conforme')
            });
        }

        // 2. Fly 30m Check
        if (athlete.metrics.test_30m_fly) {
            const val = athlete.metrics.test_30m_fly;
            const actualLevel = findBestLevel(val, '100m', 'tests.fly30m');
            
            if (sprintRef?.tests?.fly30m) {
                const { min, max } = sprintRef.tests.fly30m;
                let status = val < min ? 'excellent' : (val > max ? 'bad' : 'good');
                grid.push({
                    label: 'Vitesse Max (Fly 30m)',
                    value: `${val.toFixed(2)}s`,
                    target: `${min.toFixed(2)}-${max.toFixed(2)}s`,
                    diff: (val - min).toFixed(2) + 's',
                    status: status,
                    level: actualLevel
                });
            }
        }

        // 3. Block 30m Check
        if (athlete.metrics.test_30m_block) {
            const val = athlete.metrics.test_30m_block;
            const actualLevel = findBestLevel(val, '100m', 'tests.block30m');

            if (sprintRef?.tests?.block30m) {
                const target = sprintRef.tests.block30m.target;
                let status = val <= target ? 'good' : 'bad';
                grid.push({
                    label: 'Accélération (Block 30m)',
                    value: `${val.toFixed(2)}s`,
                    target: `< ${target.toFixed(2)}s`,
                    diff: (val - target).toFixed(2) + 's',
                    status: status,
                    level: actualLevel,
                    obs: val - target > 0.3 ? 'Gros gain possible' : 'Point fort'
                });
            }
        }

        // 4. Contact Time
        if ((athlete.metrics.contact_time_r || athlete.metrics.contact_time_l)) {
            const val = athlete.metrics.contact_time_r || athlete.metrics.contact_time_l;
            const ct = val > 10 ? val : val * 1000;
            const actualLevel = findBestLevel(ct, '100m', 'mechanics.contactTime');
            
            if (sprintRef?.mechanics?.contactTime) {
                const { min, max } = sprintRef.mechanics.contactTime;
                let status = ct < min ? 'excellent' : (ct > max ? 'bad' : 'good');

                grid.push({
                    label: 'Stiffness (Contact)',
                    value: `${ct.toFixed(0)}ms`,
                    target: `${min}-${max}ms`,
                    diff: ct > max ? `+${(ct-max).toFixed(0)}ms` : 'OK',
                    status: status,
                    level: actualLevel,
                    obs: sprintRef.mechanics.obs || ''
                });
            }
        }

        // 5. CMJ Analysis
        if (athlete.metrics.cmj_height) {
            const val = athlete.metrics.cmj_height;
            const actualLevel = findBestLevel(val, event, "tests.cmj");
            
            if (sprintRef?.tests?.cmj) {
              const { min, max } = sprintRef.tests.cmj;
              let status = val > min ? "excellent" : val < max ? "bad" : "good";
              let diff = val < min ? val - min : val > max ? val - max : 0;

              grid.push({
                id: "cmj",
                label: "Détente Verticale (CMJ)",
                value: `${val.toFixed(1)} cm`,
                target: `${min}-${max} cm`,
                diff: diff !== 0 ? (diff > 0 ? `+${diff.toFixed(2)}cm` : `${diff.toFixed(2)}cm`) : "Dans la cible",
                status: status,
                level: actualLevel,
                context: "Puissance",
                obs: status === "excellent" ? "Excellent" : status === "bad" ? "Renforcement nécessaire" : "Bonne base",
              });
            }
        }

        // 6. Vmax Analysis (m/s)
        if (profile.vmax) {
            const val = profile.vmax;
            const actualLevel = findBestLevel(val, '100m', 'mechanics.vMax');

            if (sprintRef?.mechanics?.vMax) {
                const { min, max } = sprintRef.mechanics.vMax;
                let status = val > max ? 'excellent' : (val < min ? 'bad' : 'good');
                let diff = val > max ? val - max : (val < min ? val - min : 0);

                grid.push({
                    label: 'Vitesse Max (Vmax)',
                    value: `${val.toFixed(2)} m/s`,
                    target: `${min.toFixed(2)}-${max.toFixed(2)} m/s`,
                    diff: diff !== 0 ? (diff > 0 ? `+${diff.toFixed(2)}m/s` : `${diff.toFixed(2)}m/s`) : 'Dans la cible',
                    status: status,
                    level: actualLevel,
                    obs: status === 'excellent' ? 'Vitesse d\'élite' : (status === 'bad' ? 'Plafond à élever' : 'Conforme')
                });
            }
        }

        // 7. Tau Analysis (Acceleration Constant)
        if (profile.tau) {
            const val = profile.tau;
            let status = val < 0.9 ? 'excellent' : (val > 1.2 ? 'bad' : 'good');
            
            grid.push({
                label: 'Accélération (Tau)',
                value: `${val.toFixed(2)}s`,
                target: `0.80 - 1.10s`,
                diff: val < 0.9 ? 'Explosif' : (val > 1.2 ? 'Progressif' : 'Standard'),
                status: status,
                obs: val < 0.9 ? 'Profil très explosif' : (val > 1.2 ? 'Manque d\'explosivité initiale' : 'Profil équilibré')
            });
        }
        
        return grid;
    }

    /**
     * Calculates the Force-Velocity profile parameters (Vmax, Tau)
     * AND checks for data coherence.
     */
    calculateProfile(metrics) {
        let vmax = 0;
        let tau = this.CONSTANTS.ACCEL_TAU_DEFAULT;
        let sources = [];
        let warnings = [];

        // --- Step A: Determine Max Velocity (Vmax) / MSS ---
        // Priority: 30m Fly > 20m Fly > PBs
        let vmaxSources = [];
        if (metrics.test_30m_fly) vmaxSources.push({ val: 30 / metrics.test_30m_fly, type: '30m Fly' });
        if (metrics.test_20m_fly) vmaxSources.push({ val: 20 / metrics.test_20m_fly, type: '20m Fly' });
        if (metrics.pb_100m) {
             // 100m PB gives a floor for average speed, Vmax is usually 1.15-1.18x Avg
             const avgSpeed = 100 / metrics.pb_100m;
             vmaxSources.push({ val: avgSpeed * 1.16, type: 'Est. from 100m PB' });
        }

        // Intelligent selection for Vmax
        if (vmaxSources.length > 0) {
            // Pick the "Best" measured source (Fly) over estimation
            const measured = vmaxSources.filter(s => s.type.includes('Fly'));
            if (measured.length > 0) {
                const best = measured.reduce((prev, current) => (prev.val > current.val) ? prev : current);
                vmax = best.val;
                sources.push(best.type);

                // Consistency Check: Does Fly match PB?
                const estimated = vmaxSources.find(s => s.type.includes('PB'));
                if (estimated) {
                    const diff = (best.val - estimated.val) / estimated.val;
                    if (diff > 0.10) {
                        warnings.push(`Votre vitesse test (${best.type}) est beaucoup plus élevée que celle estimée par votre PB 100m. Potentiel inexploité ou problème d'endurance de vitesse.`);
                    } else if (diff < -0.10) {
                        warnings.push(`Votre PB 100m suggère une vitesse max supérieure à vos tests actuels. Fatigue ou sous-performance lors du test ?`);
                    }
                }
            } else {
                vmax = vmaxSources[0].val;
                sources.push(vmaxSources[0].type);
            }
        } else {
             vmax = this.CONSTANTS.VMAX_DEFAULT;
             sources.push('Default');
        }

        // --- Step B: Determine Acceleration (Tau) ---
        let tauSources = [];
        
        // Calculate Tau from Block tests
        if (metrics.test_30m_block) {
            const t = this.solveTau(30, metrics.test_30m_block - this.CONSTANTS.REACTION_TIME, vmax);
            tauSources.push({ val: t, type: '30m Block' });
        }
        if (metrics.test_20m_block) {
            const t = this.solveTau(20, metrics.test_20m_block - this.CONSTANTS.REACTION_TIME, vmax);
            tauSources.push({ val: t, type: '20m Block' });
        }
        
        if (tauSources.length > 0) {
             // Prefer 30m block as it's more stable
             const best = tauSources.find(s => s.type === '30m Block') || tauSources[0];
             tau = best.val;
             sources.push(best.type);
             
             // Cross-check with CMJ (Power) (PRESERVED)
             if (metrics.cmj_height > 60 && tau > 1.0) {
                 warnings.push("Votre CMJ est excellent (>60cm) mais votre départ semble lent. Problème technique en block ?");
             }
        } else {
            if (metrics.pb_60m) {
                 tau = this.solveTau(60, metrics.pb_60m - this.CONSTANTS.REACTION_TIME, vmax);
                 sources.push('Est. from 60m PB');
            } else {
                sources.push('Default Tau');
            }
        }

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

    /**
     * Flat Sprint (Heuristic Models: Mero, Samozino, Cost K)
     * PRESERVES all domain logic and usedMethod accumulation.
     */
    predictFlatSprint(profile, distance, athlete) {
        const { vmax, tau } = profile;
        const rawTime = this.calculateTimeAtDistance(distance, vmax, tau);
        let physicsTime = rawTime + this.CONSTANTS.REACTION_TIME;
        
        let flyTime = null;
        let flySource = '';
        const BASE_START_COST = 0.92; 
        
        let K = 0.20; 
        if (athlete.category === 'U16') K = 0.70;
        else if (athlete.category === 'U18' || athlete.category === 'U20' || athlete.gender === 'F') K = 0.37;
        
        const metrics = athlete.metrics;

        // Model A: Fly-to-100
        if (distance === 100) {
            if (metrics.test_30m_fly) {
                flyTime = (metrics.test_30m_fly * 3.33) + BASE_START_COST + K;
                flySource = `Fly-to-100 (K=${K}s)`;
            } else if (metrics.test_20m_fly) {
                flyTime = (metrics.test_20m_fly * 5.0) + BASE_START_COST + K;
                flySource = `Fly-to-100 (20m)`;
            }
        }

        // Model B: Mero Power Law
        let meroTime = null;
        if (distance === 100) {
            let t60 = metrics.pb_60m || (this.calculateTimeAtDistance(60, vmax, tau) + this.CONSTANTS.REACTION_TIME);
            meroTime = t60 * 1.54;
        }

        // Model C: Acceleration Bonus (Samozino)
        let accelBonus = (metrics.test_30m_block && metrics.test_30m_block < 4.25) ? 0.15 : 0;

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
        } else if (meroTime) {
            finalTime = meroTime;
            usedMethod = 'Loi de Mero';
        }
        
        // Final PB sanity check
        if (metrics.pb_100m && distance === 100 && (metrics.pb_100m - finalTime) > 0.5) {
            finalTime = (finalTime + metrics.pb_100m) / 2;
            usedMethod = "Moyenne (Potentiel vs Réalisé)";
        }

        // Splits Scaling
        const splits = [];
        let prevTime = this.CONSTANTS.REACTION_TIME;
        const scaleFactor = finalTime / physicsTime; 
        for(let d=10; d<=distance; d+=10) {
            const st = (this.calculateTimeAtDistance(d, vmax, tau) + this.CONSTANTS.REACTION_TIME) * scaleFactor;
            splits.push({ distance: d, time: st, segmentTime: st - prevTime, velocity: 10/(st - prevTime) });
            prevTime = st;
        }

        return { time: finalTime.toFixed(2), range: 0.10, splits, tags: [usedMethod], sources: [] };
    }

    /**
     * 200m Model (PRESERVED: Fatigue Index + Detailed Splits)
     */
    predict200m(profile, athlete) {
        let t100 = athlete.metrics.pb_100m || parseFloat(this.predictFlatSprint(profile, 100, athlete).time);
        let delta = -0.1; 
        let bias = "Neutre";
        
        const ifIndex = this.calculateFatigueIndex(athlete.metrics, profile.vmax);
        if (ifIndex > 1.25) { delta = 0.2; bias = "Speed-Biased"; }
        else if (ifIndex < 1.15 && ifIndex > 0) { delta = -0.3; bias = "Endurance-Biased"; }
        
        const predictedTime = (t100 * 2) + delta;
        
        // Splits Generation (PRESERVED)
        const splits = [];
        const flatPred = this.predictFlatSprint(profile, 100, athlete);
        const s50 = flatPred.splits.find(s => s.distance === 50) || { time: t100 * 0.6, velocity: 0 };
        splits.push({ distance: 50, time: s50.time, segmentTime: s50.time, velocity: s50.velocity });
        splits.push({ distance: 100, time: t100, segmentTime: t100 - s50.time, velocity: 50 / (t100 - s50.time) });
        
        const tSecond100 = predictedTime - t100;
        const t100_150 = tSecond100 * 0.49;
        const t150 = t100 + t100_150;
        splits.push({ distance: 150, time: t150, segmentTime: t100_150, velocity: 50 / t100_150 });
        splits.push({ distance: 200, time: predictedTime, segmentTime: predictedTime - t150, velocity: 50 / (predictedTime - t150) });

        return { time: predictedTime.toFixed(2), range: 0.25, splits, tags: [bias, `Base 100m + Delta ${delta}s`], sources: [] };
    }

    /**
     * 400m Model (PRESERVED: ASR logic + model matching)
     */
    predict400m(profile, athlete) {
        let t200 = athlete.metrics.pb_200m || parseFloat(this.predict200m(profile, athlete).time);
        const ifIndex = this.calculateFatigueIndex(athlete.metrics, profile.vmax);
        
        const data = this.getRefData('400m', athlete.gender, athlete.category);
        let margin = (ifIndex > 1.20) ? (athlete.category === 'U16' ? 5.5 : 5.0) : (ifIndex < 1.10 && ifIndex > 0) ? 2.8 : 3.6;
        if (data?.model?.diff) margin = data.model.diff; // Use explicit margin from ref data if defined

        let profileType = "Profil 400 pur";
        if (ifIndex > 1.2) {
          profileType = "Profil Sprinter (100-200)";
          if (athlete.category === "U16") margin = 5.5;
        } else if (ifIndex < 1.1 && ifIndex > 0) {
          profileType = "Profil Résistant (400-800)";
        } else {
          profileType = "Profil 400 pur (200-400)";
        }

        const predictedTime = (t200 * 2) + margin;
        
        // Splits logic (PRESERVED)
        const splits = [];
        const pacing200 = t200 + 1.0;
        splits.push({ distance: 200, time: pacing200, segmentTime: pacing200, velocity: 200/pacing200 });
        splits.push({ distance: 400, time: predictedTime, segmentTime: predictedTime - pacing200, velocity: 200/(predictedTime - pacing200) });

        return { time: predictedTime.toFixed(2), range: 0.8, splits, tags: ["ASR Model", profileType, `Margin +${margin}s`], sources: [], model: data?.model };
    }

    /**
     * Hurdles (PRESERVED: IE Target + Specs)
     */
    predictHurdles(profile, event, athlete) {
        const pFlat = this.predictFlatSprint(profile, event === '110mH' ? 110 : 100, athlete);
        const tFlat = parseFloat(pFlat.time);
        const data = this.getRefData(event, athlete.gender, athlete.category);
        
        let ie = (athlete.category === 'U18' || athlete.category === 'U20') ? 1.4 : (athlete.category === 'U16') ? 1.8 : (athlete.gender === 'M' ? 1.0 : 0.95);
        
        return { 
            time: (tFlat + ie).toFixed(2), 
            range: 0.3, 
            splits: pFlat.splits, 
            tags: ['Technique Index', `IE Target: +${ie}s`],
            specs: data?.specs
        };
    }

    predictHurdlesLong(profile, event, athlete) {
        const p400 = this.predict400m(profile, athlete);
        const t400 = parseFloat(p400.time);
        let diff = (athlete.gender === 'F' ? 4.5 : 4.0) + (athlete.category === 'U18' ? 1.0 : 0);
        return { 
            time: (t400 + diff).toFixed(2), 
            range: 1.0, 
            splits: p400.splits, 
            tags: ["400mH Differential", `T400 + ${diff}s`], 
            sources: [] 
        };
    }

    calculateFatigueIndex(metrics, vmax) {
        if (!metrics.test_30m_fly) return 0;
        let tLong = metrics.test_120m || metrics.test_80m || metrics.test_60m || 0;
        let dLong = metrics.test_120m ? 120 : metrics.test_80m ? 80 : metrics.test_60m ? 60 : 0;
        if (tLong <= 0) return 0;
        return (30 / metrics.test_30m_fly) / (dLong / tLong);
    }

    analyzeConsistency(predTime, event, metrics) {
        const messages = [];
        const pb = metrics[`pb_${event.toLowerCase()}`];
        if (pb) {
            const diff = pb - parseFloat(predTime);
            if (diff > 0.3) messages.push({ type: 'opportunity', text: `Potentiel théorique (${predTime}s) bien supérieur au record actuel (${pb}s).` });
            else if (diff < -0.2) messages.push({ type: 'anomaly', text: `Record actuel plus rapide que la prédiction physique. Vérifiez la précision des tests.` });
        }
        return messages;
    }

    assessLevel(time, event, athlete) {
        const t = parseFloat(time);
        const node = ATHLETICS_DATA[event]?.[athlete.gender || 'M'];
        if (!node) return { label: 'NC', color: 'text-gray-400' };

        for (const cat of ['ELITE', 'U23', 'U20', 'U18', 'U16']) {
            const s = node[cat]?.standards;
            if (s) {
                if (t <= s.INTERNATIONAL) return { label: `Elite Int. (${cat})`, color: 'text-purple-600' };
                if (t <= s.NATIONAL) return { label: `National (${cat})`, color: 'text-emerald-600' };
                if (t <= s.REGIONAL) return { label: `Régional (${cat})`, color: 'text-blue-600' };
            }
        }
        return { label: 'Club / Régional', color: 'text-slate-500' };
    }

    /**
     * Generates coaching advice based on ratios and biomechanics.
     * Integrating F-V Profile, SSC efficiency, and Velocity Reserve logic.
     */
    generateAdvice(profile, metrics, athlete) {
        const advice = [];
        const strengths = [];
        const weaknesses = [];

        const vmax = profile.vmax;
        const tau = profile.tau;
        const gender = athlete.gender || 'M';

        // 1. Force-Velocity Profile Interpretation (Morin & Samozino)
        // f0_rel is a proxy for the relative initial horizontal force (N/kg)
        const f0_rel = vmax / tau; 
        
        if (f0_rel > 11.5) {
            strengths.push("Profil explosif : Excellente capacité de production de force horizontale initiale (f0 élevé).");
            if (vmax < 9.5) {
                advice.push("Orientation Vitesse Max : Votre profil est 'Force-Dominant'. Pour progresser, privilégiez le sprint lancé et le travail de survitesse afin d'élever votre plafond de vitesse.");
            }
        } else if (f0_rel < 9.0) {
            weaknesses.push("Déficit de puissance initiale : Votre capacité à projeter le centre de masse vers l'avant en sortie de blocks est limitée.");
            advice.push("Développement de la Force Explosive : Travaillez la force maximale (Squat/Deadlift) combinée à des départs avec charges (Heavy Sled) pour améliorer votre f0.");
        }

        // 2. Velocity Reserve Index (VRI)
        if (metrics.pb_100m) {
            const vAvg = 100 / metrics.pb_100m;
            const vri = vmax / vAvg;
            
            if (vri > 1.22) {
                weaknesses.push("Sous-exploitation de la Vmax : Écart trop important entre votre vitesse de pointe et votre performance chronométrique.");
                advice.push("Priorité Endurance de Vitesse : Votre 'moteur' est puissant mais s'épuise vite. Intégrez des répétitions de 80m-120m à 95% de l'intensité maximale.");
            } else if (vri < 1.14 && vri > 0) {
                strengths.push("Efficacité temporelle : Optimisation remarquable de la vitesse maximale sur l'ensemble de la distance.");
                advice.push("Élévation du Plafond : Votre index de réserve est excellent. La progression passera désormais par une augmentation de votre vitesse de pointe absolue.");
            }
        }

        // 3. Stretch-Shortening Cycle (SSC) Efficiency
        if (metrics.cmj_height && metrics.sj_height) {
            const prestigeIndex = ((metrics.cmj_height - metrics.sj_height) / metrics.sj_height) * 100;
            if (prestigeIndex < 8) {
                weaknesses.push("Déficit de réactivité (SSC lent) : Utilisation inefficace de l'énergie élastique lors de la transition excentrique-concentrique.");
                advice.push("Travail Pliométrique : Accentuez la pliométrie basse et les sauts avec contre-mouvement rapide pour améliorer la raideur musculo-tendineuse.");
            } else if (prestigeIndex > 15) {
                strengths.push("Réactivité élastique supérieure : Excellente exploitation du cycle étirement-détente (SSC rapide).");
            }
        }

        // 4. Vertical Stiffness (Contact Time vs Vmax)
        if (metrics.contact_time_r || metrics.contact_time_l) {
            const val = metrics.contact_time_r || metrics.contact_time_l;
            const ct = val > 10 ? val : val * 1000;
            const targets = CONTACT_TIME_TARGETS[gender];
            let match = targets?.find(t => ct >= t.min && ct <= t.max);
            
            if (match) advice.push(`Analyse de l'appui : Votre temps de contact est catégorisé comme '${match.label}'. ${match.obs}`);
            
            if (ct > 105 && vmax > 9.0) {
                weaknesses.push("Temps de sol excessifs : Manque de raideur verticale (stiffness) à haute vitesse.");
                advice.push("Renforcement de la Stiffness : Intégrez des 'pogos' et des multibonds techniques pour réduire le temps de contact et augmenter la force de réaction au sol.");
            } else if (ct < 90) {
                strengths.push("Stiffness verticale d'élite : Temps de contact très courts favorisant le maintien de la vélocité.");
            }
        }

        // 5. Kinematic Balance: Step Rate vs Step Length
        if (metrics.step_len_avg_r && vmax > 0) {
            const freq = vmax / metrics.step_len_avg_r;
            if (freq < 3.8 && gender === 'M') {
                advice.push("Optimisation Fréquence : Votre profil privilégie l'amplitude. Un travail de vélocité gestuelle (skipping rapide, griffé de sol) pourrait débloquer votre chrono.");
            } else if (freq > 4.8) {
                advice.push("Optimisation Amplitude : Votre fréquence est très élevée mais vos appuis manquent de projection. Travaillez la force de poussée horizontale.");
            } else if (freq >= 4.0 && freq <= 4.6) {
                strengths.push("Équilibre cinématique : Excellent ratio entre la fréquence de foulée et l'amplitude.");
            }
        }

        // 6. Asymmetry and Injury Prevention
        if (metrics.step_len_avg_r && metrics.step_len_avg_l) {
            const diff = Math.abs(metrics.step_len_avg_r - metrics.step_len_avg_l);
            const asym = diff / Math.max(metrics.step_len_avg_r, metrics.step_len_avg_l);
            if (asym > 0.05) {
                weaknesses.push(`Asymétrie fonctionnelle marquée (${(asym * 100).toFixed(1)}%) : Déséquilibre significatif entre la jambe gauche et droite.`);
                advice.push("Prévention Blessure : Cette asymétrie augmente les risques de lésions (ischios). Un travail unilatéral et un bilan postural sont conseillés.");
            }
        }

        // 7. Start Efficiency (Block Exit)
        if (metrics.time_to_first_contact && metrics.first_contact_dist) {
            const vFirstStep = metrics.first_contact_dist / metrics.time_to_first_contact;
            if (vFirstStep < 1.5 || metrics.first_contact_dist < 0.50) {
                weaknesses.push("Sortie de blocks 'subie' : Manque de projection horizontale lors du premier appui.");
                advice.push("Géométrie du Départ : Cherchez une extension complète de la jambe arrière et un angle de projection plus rasant pour gagner en efficacité.");
            }
        }

        // 8. Anaerobic Speed Reserve & Fatigue
        const fatigueIndex = this.calculateFatigueIndex(metrics, vmax);
        if (fatigueIndex > 1.28) {
            weaknesses.push("Décroissance de vitesse précoce : Difficulté à maintenir l'intensité après la phase de transition (60m).");
            advice.push("Capacité Tampon : Intégrez des séances de résistance lactique (150m-250m) pour mieux tolérer la fatigue en fin de course.");
        }

        // 9. Relative Power
        if (metrics.cmj_power) {
            if (metrics.cmj_power < 45) {
                weaknesses.push("Puissance relative insuffisante : Votre rapport force/poids limite votre explosivité.");
            } else if (metrics.cmj_power > 75) {
                strengths.push("Puissance relative exceptionnelle : Moteur hautement performant par rapport à votre masse corporelle.");
            }
        }

        // 10. Specific Bounds
        if (metrics.bound_test && metrics.bound_test < 13) {
            advice.push("Capacité de Bonds : Votre force horizontale est en retrait. Le travail de multibonds (penta-bond) est une priorité pour le sprint.");
        }

        // 11. Youth Specific & Talent ID
        if (athlete.age < 18 && vmax > 10.0) {
            strengths.push("Très bonne vitesse max pour votre âge.");
            advice.push("Focus sur la gainage postural et la technique pour stabiliser ce potentiel de vitesse élevé pour votre âge.");
        }

        return { advice, strengths, weaknesses };
    }
}