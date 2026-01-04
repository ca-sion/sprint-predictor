/**
 * Coaching Service
 * Handles the interpretation of physical data into actionable advice and analysis.
 * Purely numeric return values for the grid.
 */
import { ATHLETICS_DATA, CONTACT_TIME_TARGETS, QUALITY_BENCHMARKS } from '../data/definitions/Standards.js';
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
     * Ranges expanded to prevent saturation at elite levels.
     */
    static normalizeQuality(key, val) {
        switch (key) {
            case 'tau':       // Explosivity (Time constant): 0.70s = 100, 1.5s = 0
                return Math.max(0, Math.min(100, 100 * (1.5 - val) / (1.5 - 0.70)));
            case 'vmax':      // Speed: 12.5m/s = 100, 7.0m/s = 0
                return Math.max(0, Math.min(100, 100 * (val - 7.0) / (12.5 - 7.0)));
            case 'pmax':      // Power: 45W/kg = 100, 10W/kg = 0
                return Math.max(0, Math.min(100, 100 * (val - 10) / (45 - 10)));
            case 'endurance': // Index: 1.05 = 100, 1.35 = 0
                return Math.max(0, Math.min(100, 100 * (1.35 - val) / (1.35 - 1.05)));
            case 'reactivity':// Prestige % (SSC): 25% = 100, 5% = 0
                return Math.max(0, Math.min(100, 100 * (val - 5) / (25 - 5)));
            default: return 50;
        }
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
        if (profile.pmax) {
            const bench = this.getBenchmarkForAthlete(athlete);
            const targetPmax = bench.pmax;
            grid.push({
                id: 'pmax',
                label: 'Puissance (Pmax)',
                value: profile.pmax,
                target: [targetPmax - 2, targetPmax + 2],
                status: profile.pmax > targetPmax + 1 ? 'excellent' : (profile.pmax < targetPmax - 2 ? 'bad' : 'good'),
                unit: 'power'
            });
        }
        
        return grid;
    }

    /**
     * Generates coaching advice.
     */
    static generateAdvice(profile, metrics, athlete) {
        const advice = [];
        const strengths = [];
        const weaknesses = [];

        const vmax = profile.vmax;
        const tau = profile.tau;
        const gender = athlete.gender || 'M';

        // 1. Force-Velocity Profile
        const f0_rel = PhysicsService.calculateF0(vmax, tau);
        if (f0_rel > 11.5) {
            strengths.push("Profil explosif : Excellente capacité de production de force horizontale initiale.");
            if (vmax < 9.5) advice.push("Orientation Vitesse Max : Votre profil est 'Force-Dominant'. Privilégiez le sprint lancé.");
        } else if (f0_rel < 9.0) {
            weaknesses.push("Déficit de puissance initiale : Capacité de projection horizontale limitée.");
            advice.push("Développement de la Force Explosive : Travaillez la force maximale combinée à des départs avec charges.");
        }

        // 2. Velocity Reserve Index (VRI)
        if (metrics.pb_100m) {
            const vAvg = 100 / metrics.pb_100m;
            const vri = vmax / vAvg;
            if (vri > 1.22) {
                weaknesses.push("Sous-exploitation de la Vmax : Écart trop important entre Vmax et chrono.");
                advice.push("Priorité Endurance de Vitesse : Intégrez des répétitions de 80m-120m à haute intensité.");
            } else if (vri < 1.14 && vri > 0) {
                strengths.push("Efficacité temporelle : Optimisation remarquable de la Vmax sur la distance.");
                advice.push("Élévation du Plafond : Progression via l'augmentation de la vitesse de pointe absolue.");
            }
        }

        // 3. SSC Efficiency
        const prestigeIndex = PhysicsService.calculatePrestigeIndex(metrics);
        if (prestigeIndex > 0) {
            if (prestigeIndex < 8) {
                weaknesses.push("Déficit de réactivité (SSC lent).");
                advice.push("Travail Pliométrique : Accentuez la pliométrie basse.");
            } else if (prestigeIndex > 15) {
                strengths.push("Réactivité élastique supérieure (SSC rapide).");
            }
        }

        // 4. Vertical Stiffness
        if (metrics.contact_time_r || metrics.contact_time_l) {
            const ct = (metrics.contact_time_r || metrics.contact_time_l) > 10 ? (metrics.contact_time_r || metrics.contact_time_l) : (metrics.contact_time_r || metrics.contact_time_l) * 1000;
            const match = CONTACT_TIME_TARGETS[gender]?.find(t => ct >= t.min && ct <= t.max);
            if (match) advice.push(`Analyse de l'appui : Votre temps de contact est '${match.label}'.`);
            if (ct > 105 && vmax > 9.0) {
                weaknesses.push("Temps de sol excessifs : Manque de raideur verticale.");
                advice.push("Renforcement de la Stiffness : Intégrez des pogos et multibonds.");
            } else if (ct < 90) strengths.push("Stiffness verticale d'élite.");
        }

        // 5. Kinematic Balance
        if (metrics.step_len_avg_r && vmax > 0) {
            const freq = vmax / metrics.step_len_avg_r;
            if (freq < 3.8 && gender === 'M') advice.push("Optimisation Fréquence : Travail de vélocité gestuelle conseillé.");
            else if (freq > 4.8) advice.push("Optimisation Amplitude : Travaillez la force de poussée horizontale.");
            else if (freq >= 4.0 && freq <= 4.6) strengths.push("Équilibre cinématique optimal.");
        }

        // 6. Fatigue Index
        const fatigueIndex = PhysicsService.calculateFatigueIndex(metrics);
        if (fatigueIndex > 1.28) {
            weaknesses.push("Décroissance de vitesse précoce.");
            advice.push("Capacité Tampon : Intégrez des séances de résistance lactique.");
        }

        return { advice, strengths, weaknesses };
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

        if (ratio > 1.15) {
            return {
                label: "Force-Dominant",
                color: "text-blue-400",
                description: "Forte capacité d'accélération initiale mais plafond de vitesse atteint rapidement.",
                advice: "Priorité : Sprint lancé, survitesse et travail de fréquence gestuelle."
            };
        } else if (ratio < 0.85) {
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
