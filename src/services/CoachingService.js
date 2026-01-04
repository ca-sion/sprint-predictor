/**
 * Coaching Service
 * Handles the interpretation of physical data into actionable advice and analysis.
 */
import { ATHLETICS_DATA, CONTACT_TIME_TARGETS, QUALITY_BENCHMARKS } from '../data/definitions/Standards.js';

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
        switch (key) {
            case 'tau':       // Explosivity: 0.80s = 100, 1.5s = 0
                return Math.max(0, Math.min(100, 100 * (1.5 - val) / (1.5 - 0.80)));
            case 'vmax':      // Speed: 12.0m/s = 100, 7.5m/s = 0
                return Math.max(0, Math.min(100, 100 * (val - 7.5) / (12.0 - 7.5)));
            case 'pmax':      // Power: 32W/kg = 100, 10W/kg = 0
                return Math.max(0, Math.min(100, 100 * (val - 10) / (32 - 10)));
            case 'endurance': // Index: 1.05 = 100, 1.35 = 0
                return Math.max(0, Math.min(100, 100 * (1.35 - val) / (1.35 - 1.05)));
            case 'reactivity':// Prestige %: 18% = 100, 5% = 0
                return Math.max(0, Math.min(100, 100 * (val - 5) / (18 - 5)));
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
    }

    /**
     * Generates a detailed analysis grid exploiting all ATHLETICS_DATA properties.
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
            let diff = t < min ? t - min : (t > max ? t - max : 0);

            // Dynamically find the real level
            const actualLevel = this.findBestLevel(t, event, gender, 'performance_ranges');

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
            const actualLevel = this.findBestLevel(val, '100m', gender, 'tests.fly30m');
            
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
            const actualLevel = this.findBestLevel(val, '100m', gender, 'tests.block30m');

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
            const actualLevel = this.findBestLevel(ct, '100m', gender, 'mechanics.contactTime');
            
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
            const actualLevel = this.findBestLevel(val, event, gender, "tests.cmj");
            
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
            const actualLevel = this.findBestLevel(val, '100m', gender, 'mechanics.vMax');

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
     * Generates coaching advice based on ratios and biomechanics.
     * Integrating F-V Profile, SSC efficiency, and Velocity Reserve logic.
     */
    static generateAdvice(profile, metrics, athlete) {
        const advice = [];
        const strengths = [];
        const weaknesses = [];

        const vmax = profile.vmax;
        const tau = profile.tau;
        const gender = athlete.gender || 'M';

        // 1. Force-Velocity Profile Interpretation (Morin & Samozino)
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
            
            if (match) advice.push(`Analyse de l\'appui : Votre temps de contact est catégorisé comme '${match.label}'. ${match.obs}`);
            
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
        // Need to calculate fatigue index here as PredictionEngine logic is gone
        let fatigueIndex = 0;
        if (metrics.test_30m_fly) {
             let tLong = metrics.test_120m || metrics.test_80m || metrics.test_60m || 0;
             let dLong = metrics.test_120m ? 120 : metrics.test_80m ? 80 : metrics.test_60m ? 60 : 0;
             if (tLong > 0) {
                 fatigueIndex = (30 / metrics.test_30m_fly) / (dLong / tLong);
             }
        }

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

    /**
     * Checks for anomalies between prediction and real PB
     */
    static analyzeConsistency(predTime, event, metrics) {
        const messages = [];
        const pb = metrics[`pb_${event.toLowerCase()}`];
        if (pb) {
            const diff = pb - parseFloat(predTime);
            if (diff > 0.3) messages.push({ type: 'opportunity', text: `Potentiel théorique (${predTime}s) bien supérieur au record actuel (${pb}s).` });
            else if (diff < -0.2) messages.push({ type: 'anomaly', text: `Record actuel plus rapide que la prédiction physique. Vérifiez la précision des tests.` });
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
     * Calculates normalized scores (0-100) for athletic qualities radar.
     */
    static calculateQualities(physics, metrics, athlete) {
        if (!physics) return null;

        // 1. Athlete Current Profile
        let fatigueIndex = 0;
        if (metrics.test_30m_fly) {
             let tLong = metrics.test_120m || metrics.test_80m || metrics.test_60m || 0;
             let dLong = metrics.test_120m ? 120 : metrics.test_80m ? 80 : metrics.test_60m ? 60 : 0;
             if (tLong > 0) fatigueIndex = (30 / metrics.test_30m_fly) / (dLong / tLong);
        }

        let prestige = 5;
        if (metrics.cmj_height && metrics.sj_height) {
            prestige = ((metrics.cmj_height - metrics.sj_height) / metrics.sj_height) * 100;
        }

        const scores = [
            { label: 'Explosivité', score: this.normalizeQuality('tau', physics.tau) },
            { label: 'Vitesse Max', score: this.normalizeQuality('vmax', physics.vmax) },
            { label: 'Endurance',   score: this.normalizeQuality('endurance', fatigueIndex || 1.25) },
            { label: 'Réactivité',  score: this.normalizeQuality('reactivity', prestige) },
            { label: 'Puissance',   score: this.normalizeQuality('pmax', physics.pmax) }
        ];

        // 2. Category Benchmarks
        const gender = athlete.gender || 'M';
        const cat = athlete.category || 'ELITE';
        const targets = QUALITY_BENCHMARKS[gender]?.[cat] || QUALITY_BENCHMARKS[gender]?.['ELITE'];

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
        const f0 = vmax / tau; // Relative Force (N/kg)
        const pmax = (f0 * vmax) / 4; // Relative Power (W/kg)
        
        return {
            f0,
            vmax,
            pmax,
            tau,
            slope: -f0 / vmax
        };
    }

    /**
     * Interprets the FV profile to give a specific orientation
     */
    static interpretFVProfile(physics) {
        if (!physics) return null;
        const { f0, vmax } = physics;
        const ratio = f0 / vmax; // Index of the slope

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