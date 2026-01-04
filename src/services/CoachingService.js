/**
 * Coaching Service
 * Handles the interpretation of physical data into actionable advice and analysis.
 * Purely numeric return values for the grid.
 */
import { ATHLETICS_DATA, CONTACT_TIME_TARGETS, QUALITY_BENCHMARKS, NORMALIZATION_RANGES, ADVICE_THRESHOLDS } from '../data/definitions/Standards.js';
import { PhysicsService } from './PhysicsService.js';

export class CoachingService {
    
    /**
     * Helper to safely access ATHLETICS_DATA
     */
    static getRefData(event, gender, category) {
        const eventNode = ATHLETICS_DATA[event];
        if (!eventNode) return null;
        const genderNode = eventNode[gender] || eventNode['M'];
        if (!genderNode) return null;
        return genderNode[category] || genderNode['ELITE'];
    }

    /**
     * Normalization engine: transforms raw physical values into 0-100 scores.
     */
    static normalizeQuality(key, val) {
        const range = NORMALIZATION_RANGES[key];
        if (!range) return 50;
        return Math.max(0, Math.min(100, 100 * (val - range.min) / (range.max - range.min)));
    }

    /**
     * Find the best matching level for a value across all categories
     */
    static findBestLevel(val, event, gender, subPath) {
        const eventNode = ATHLETICS_DATA[event];
        if (!eventNode) return null;
        const genderNode = eventNode[gender] || eventNode['M'];
        if (!genderNode) return null;

        const categories = ['ELITE', 'U23', 'U20', 'U18', 'U16'];
        for (const cat of categories) {
            const catData = genderNode[cat];
            if (!catData) continue;

            const parts = subPath.split('.');
            let metricRange = catData;
            for (const part of parts) {
                metricRange = metricRange ? metricRange[part] : null;
            }

            if (metricRange && metricRange.min !== undefined && metricRange.max !== undefined) {
                if (val <= metricRange.max && val >= metricRange.min) return cat;
            } else if (metricRange && metricRange.target !== undefined) {
                if (val <= metricRange.target) return cat;
            }
        }
        return 'Loisir';
    }

    /**
     * Generates a detailed analysis grid.
     * Returns pure numeric values and semantic metadata.
     */
    static generateAnalysisGrid(athlete, predictedTime, event, profile) {
        const grid = [];
        const gender = athlete.gender || 'M';
        const athleteCategory = athlete.category || 'U20';
        
        const data = this.getRefData(event, gender, athleteCategory);
        const sprintRef = this.getRefData('100m', gender, athleteCategory);

        // 1. Performance Target
        if (data && data.performance_ranges) {
            const { min, max } = data.performance_ranges;
            const t = parseFloat(predictedTime);
            let status = t < min ? 'excellent' : (t > max ? 'bad' : 'good');
            const actualLevel = this.findBestLevel(t, event, gender, 'performance_ranges');

            grid.push({
                id: 'perf',
                label: `Perf. Cible (${event})`,
                value: t,
                target: [min, max],
                status: status,
                level: actualLevel,
                unit: 's'
            });
        }

        // 2. Fly 30m Check
        if (athlete.metrics.test_30m_fly) {
            const val = athlete.metrics.test_30m_fly;
            if (sprintRef?.tests?.fly30m) {
                const { min, max } = sprintRef.tests.fly30m;
                grid.push({
                    id: 'fly30',
                    label: 'Vitesse Max (Fly 30m)',
                    value: val,
                    target: [min, max],
                    status: val < min ? 'excellent' : (val > max ? 'bad' : 'good'),
                    level: this.findBestLevel(val, '100m', gender, 'tests.fly30m'),
                    unit: 's'
                });
            }
        }

        // 3. Block 30m Check
        if (athlete.metrics.test_30m_block) {
            const val = athlete.metrics.test_30m_block;
            if (sprintRef?.tests?.block30m) {
                const target = sprintRef.tests.block30m.target;
                grid.push({
                    id: 'block30',
                    label: 'Accélération (Block 30m)',
                    value: val,
                    target: target,
                    status: val <= target ? 'good' : 'bad',
                    level: this.findBestLevel(val, '100m', gender, 'tests.block30m'),
                    unit: 's_target'
                });
            }
        }

        // 4. Contact Time
        if ((athlete.metrics.contact_time_r || athlete.metrics.contact_time_l)) {
            const val = athlete.metrics.contact_time_r || athlete.metrics.contact_time_l;
            const ct = val > 10 ? val : val * 1000;
            if (sprintRef?.mechanics?.contactTime) {
                const { min, max } = sprintRef.mechanics.contactTime;
                grid.push({
                    id: 'contact',
                    label: 'Stiffness (Contact)',
                    value: ct,
                    target: [min, max],
                    status: ct < min ? 'excellent' : (ct > max ? 'bad' : 'good'),
                    level: this.findBestLevel(ct, '100m', gender, 'mechanics.contactTime'),
                    unit: 'ms'
                });
            }
        }

        // 5. CMJ Analysis
        if (athlete.metrics.cmj_height) {
            const val = athlete.metrics.cmj_height;
            if (sprintRef?.tests?.cmj) {
              const { min, max } = sprintRef.tests.cmj;
              grid.push({
                id: "cmj",
                label: "Détente Verticale (CMJ)",
                value: val,
                target: [min, max],
                status: val > min ? "excellent" : val < max ? "bad" : "good",
                level: this.findBestLevel(val, event, gender, "tests.cmj"),
                unit: "cm"
              });
            }
        }

        // 6. Vmax Analysis (m/s)
        if (profile.vmax) {
            const val = profile.vmax;
            if (sprintRef?.mechanics?.vMax) {
                const { min, max } = sprintRef.mechanics.vMax;
                grid.push({
                    id: 'vmax',
                    label: 'Vitesse Max (Vmax)',
                    value: val,
                    target: [min, max],
                    status: val > max ? 'excellent' : (val < min ? 'bad' : 'good'),
                    level: this.findBestLevel(val, '100m', gender, 'mechanics.vMax'),
                    unit: 'speed'
                });
            }
        }

        // 7. Tau Analysis (Acceleration)
        if (profile.tau) {
            const bench = this.getBenchmarkForAthlete(athlete);
            const targetTau = bench.tau;
            grid.push({
                id: 'tau',
                label: 'Accélération (Tau)',
                value: profile.tau,
                target: [targetTau - 0.05, targetTau + 0.05],
                status: profile.tau < targetTau - 0.02 ? 'excellent' : (profile.tau > targetTau + 0.05 ? 'bad' : 'good'),
                unit: 's'
            });
        }

        // 8. Power Analysis (Pmax)
        const pmax = profile.pmax || PhysicsService.calculatePmax(profile.vmax, profile.tau);
        if (pmax) {
            const bench = this.getBenchmarkForAthlete(athlete);
            const targetPmax = bench.pmax;
            grid.push({
                id: 'pmax',
                label: 'Puissance (Pmax)',
                value: pmax,
                target: [targetPmax - 2, targetPmax + 2],
                status: pmax > targetPmax + 1 ? 'excellent' : (pmax < targetPmax - 2 ? 'bad' : 'good'),
                unit: 'power'
            });
        }
        
        return grid;
    }

    /**
     * Generates coaching advice.
     * Modularized for better maintenance.
     */
    static generateAdvice(profile, metrics, athlete) {
        const context = { profile, metrics, athlete, advice: [], strengths: [], weaknesses: [] };

        this._analyzeFVProfile(context);
        this._analyzeVelocityReserve(context);
        this._analyzeSSCEfficiency(context);
        this._analyzeVerticalStiffness(context);
        this._analyzeKinematicBalance(context);
        this._analyzeFatigue(context);

        return { 
            advice: context.advice, 
            strengths: context.strengths, 
            weaknesses: context.weaknesses 
        };
    }

    static _analyzeFVProfile(ctx) {
        const { profile, athlete } = ctx;
        const f0_rel = profile.f0;
        const vmax = profile.vmax;
        const gender = athlete.gender || 'M';

        if (f0_rel > ADVICE_THRESHOLDS.f0.high) {
            ctx.strengths.push("Profil explosif : Excellente capacité de production de force horizontale initiale.");
            if (vmax < ADVICE_THRESHOLDS.vmax.low) {
                ctx.advice.push("Orientation Vitesse Max : Votre profil est 'Force-Dominant'. Privilégiez le sprint lancé.");
            }
        } else if (f0_rel < ADVICE_THRESHOLDS.f0.low) {
            ctx.weaknesses.push("Déficit de puissance initiale : Capacité de projection horizontale limitée.");
            ctx.advice.push("Développement de la Force Explosive : Travaillez la force maximale combinée à des départs avec charges.");
        }
    }

    static _analyzeVelocityReserve(ctx) {
        const { metrics, profile } = ctx;
        if (!metrics.pb_100m) return;

        const vAvg = 100 / metrics.pb_100m;
        const vri = profile.vmax / vAvg;

        if (vri > ADVICE_THRESHOLDS.vri.high) {
            ctx.weaknesses.push("Sous-exploitation de la Vmax : Écart trop important entre Vmax et chrono.");
            ctx.advice.push("Priorité Endurance de Vitesse : Intégrez des répétitions de 80m-120m à haute intensité.");
        } else if (vri < ADVICE_THRESHOLDS.vri.low && vri > 0) {
            ctx.strengths.push("Efficacité temporelle : Optimisation remarquable de la Vmax sur la distance.");
            ctx.advice.push("Élévation du Plafond : Progression via l'augmentation de la vitesse de pointe absolue.");
        }
    }

    static _analyzeSSCEfficiency(ctx) {
        const { metrics } = ctx;
        const prestigeIndex = PhysicsService.calculatePrestigeIndex(metrics);
        if (prestigeIndex <= 0) return;

        if (prestigeIndex < ADVICE_THRESHOLDS.prestige.low) {
            ctx.weaknesses.push("Déficit de réactivité (SSC lent).");
            ctx.advice.push("Travail Pliométrique : Accentuez la pliométrie basse.");
        } else if (prestigeIndex > ADVICE_THRESHOLDS.prestige.high) {
            ctx.strengths.push("Réactivité élastique supérieure (SSC rapide).");
        }
    }

    static _analyzeVerticalStiffness(ctx) {
        const { metrics, profile, athlete } = ctx;
        const gender = athlete.gender || 'M';
        const raw_ct = metrics.contact_time_r || metrics.contact_time_l;
        if (!raw_ct) return;

        const ct = raw_ct > 10 ? raw_ct : raw_ct * 1000;
        const match = CONTACT_TIME_TARGETS[gender]?.find(t => ct >= t.min && ct <= t.max);
        
        if (match) ctx.advice.push(`Analyse de l'appui : Votre temps de contact est '${match.label}'.`);
        
        if (ct > ADVICE_THRESHOLDS.stiffness.high_ct && profile.vmax > ADVICE_THRESHOLDS.stiffness.vmax_threshold) {
            ctx.weaknesses.push("Temps de sol excessifs : Manque de raideur verticale.");
            ctx.advice.push("Renforcement de la Stiffness : Intégrez des pogos et multibonds.");
        } else if (ct < ADVICE_THRESHOLDS.stiffness.elite_ct) {
            ctx.strengths.push("Stiffness verticale d'élite.");
        }
    }

    static _analyzeKinematicBalance(ctx) {
        const { metrics, profile, athlete } = ctx;
        if (!metrics.step_len_avg_r || profile.vmax <= 0) return;

        const freq = profile.vmax / metrics.step_len_avg_r;
        const gender = athlete.gender || 'M';
        const thresholds = ADVICE_THRESHOLDS.kinematic.freq[gender];

        if (freq < thresholds.low) {
            ctx.advice.push("Optimisation Fréquence : Travail de vélocité gestuelle conseillé.");
        } else if (freq > thresholds.high) {
            ctx.advice.push("Optimisation Amplitude : Travaillez la force de poussée horizontale.");
        } else if (freq >= thresholds.opt_min && freq <= thresholds.opt_max) {
            ctx.strengths.push("Équilibre cinématique optimal.");
        }
    }

    static _analyzeFatigue(ctx) {
        const { profile } = ctx;
        if (profile.endurance > ADVICE_THRESHOLDS.fatigue.high) {
            ctx.weaknesses.push("Décroissance de vitesse précoce.");
            ctx.advice.push("Capacité Tampon : Intégrez des séances de résistance lactique.");
        }
    }

    /**
     * Checks for anomalies between prediction and real PB
     */
    static analyzeConsistency(predTime, event, metrics) {
        const messages = [];
        const pb = metrics[`pb_${event.toLowerCase()}`];
        if (pb) {
            const diff = pb - predTime;
            if (diff > 0.3) messages.push({ type: 'opportunity', text: `Potentiel théorique supérieur au record actuel.` });
            else if (diff < -0.2) messages.push({ type: 'anomaly', text: `Record actuel plus rapide que la prédiction physique.` });
        }
        return messages;
    }

    /**
     * UI Helpers for consistency
     */
    static getStatusClasses(status) {
        if (status === 'excellent') return 'border-purple-200 bg-purple-50/30';
        if (status === 'good') return 'border-emerald-200 bg-emerald-50/30';
        if (status === 'bad') return 'border-red-200 bg-red-50/30';
        return 'border-slate-200 bg-white';
    }

    static getBadgeClasses(status) {
        if (status === 'excellent') return 'bg-purple-600 text-white';
        if (status === 'good') return 'bg-emerald-600 text-white';
        if (status === 'bad') return 'bg-red-600 text-white';
        return 'bg-slate-100 text-slate-600';
    }

    /**
     * Resolves the correct benchmark targets for an athlete.
     */
    static getBenchmarkForAthlete(athlete) {
        const gender = athlete.gender || 'M';
        const cat = athlete.category || 'ELITE';
        return QUALITY_BENCHMARKS[gender]?.[cat] || QUALITY_BENCHMARKS[gender]?.['ELITE'];
    }

    /**
     * Calculates normalized scores (0-100) for athletic qualities radar.
     */
    static calculateQualities(physics, metrics, athlete) {
        if (!physics) return null;

        // 1. Athlete Current Profile
        const fatigueIndex = PhysicsService.calculateFatigueIndex(metrics);
        const prestige = PhysicsService.calculatePrestigeIndex(metrics);

        const scores = [
            { label: 'Explosivité', score: this.normalizeQuality('tau', physics.tau), isMissing: !metrics.test_30m_block && !metrics.pb_60m },
            { label: 'Vitesse Max', score: this.normalizeQuality('vmax', physics.vmax), isMissing: !metrics.test_30m_fly && !metrics.test_20m_fly },
            { label: 'Endurance',   score: this.normalizeQuality('endurance', fatigueIndex || 1.25), isMissing: !fatigueIndex },
            { label: 'Réactivité',  score: this.normalizeQuality('reactivity', prestige || 5), isMissing: !metrics.cmj_height || !metrics.sj_height },
            { label: 'Puissance',   score: this.normalizeQuality('pmax', physics.pmax), isMissing: !physics.tau }
        ];

        // 2. Category Benchmarks
        const targets = this.getBenchmarkForAthlete(athlete);

        const benchmarks = [
            { label: 'Explosivité', score: this.normalizeQuality('tau', targets.tau) },
            { label: 'Vitesse Max', score: this.normalizeQuality('vmax', targets.vmax) },
            { label: 'Endurance',   score: this.normalizeQuality('endurance', targets.endurance) },
            { label: 'Réactivité',  score: this.normalizeQuality('reactivity', targets.reactivity) },
            { label: 'Puissance',   score: this.normalizeQuality('pmax', targets.pmax) }
        ];

        return { scores, benchmarks };
    }

    /**
     * Extracts physical profile metrics (F0, Vmax, Pmax)
     */
    static getPhysicsProfile(profile) {
        if (!profile || !profile.vmax || !profile.tau) return null;
        
        const vmax = profile.vmax;
        const tau = profile.tau;
        const f0 = PhysicsService.calculateF0(vmax, tau);
        const pmax = PhysicsService.calculatePmax(vmax, tau);
        
        return { f0, vmax, pmax, tau };
    }

    /**
     * Interprets the FV profile to give a specific orientation
     */
    static interpretFVProfile(physics) {
        if (!physics) return null;
        const ratio = physics.f0 / physics.vmax; 

        if (ratio > ADVICE_THRESHOLDS.fv_ratio.high) {
            return {
                label: "Force-Dominant",
                color: "text-blue-400",
                description: "Forte capacité d'accélération initiale mais plafond de vitesse atteint rapidement.",
                advice: "Priorité : Sprint lancé, survitesse et travail de fréquence gestuelle."
            };
        } else if (ratio < ADVICE_THRESHOLDS.fv_ratio.low) {
            return {
                label: "Velocity-Dominant",
                color: "text-emerald-400",
                description: "Excellente vitesse de pointe théorique mais manque d'explosivité en sortie de blocks.",
                advice: "Priorité : Force maximale (Squat), charges lourdes (Heavy Sled) et puissance initiale."
            };
        } else {
            return {
                label: "Profil Équilibré",
                color: "text-purple-400",
                description: "Bonne harmonie entre la force produite au départ et la vitesse de pointe.",
                advice: "Continuez le développement parallèle des deux qualités pour élever le niveau global."
            };
        }
    }
}
