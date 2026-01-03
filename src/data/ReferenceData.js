/**
 * Reference Data for Sprint Predictor
 */

// --- 1. INPUT DEFINITIONS (Form Generation) ---
export const INPUT_GROUPS = [
    {
        id: 'pbs',
        title: 'Records Personnels (PB)',
        icon: '⏱️',
        description: 'Vos meilleures performances officielles.',
        fields: [
            { id: 'pb_50m', label: 'PB 50m', unit: 's', placeholder: '6.xx', step: 0.01 },
            { id: 'pb_60m', label: 'PB 60m', unit: 's', placeholder: '7.xx', step: 0.01 },
            { id: 'pb_50mh', label: 'PB 50m Haies', unit: 's', placeholder: '6.xx', step: 0.01 },
            { id: 'pb_60mh', label: 'PB 60m Haies', unit: 's', placeholder: '7.xx', step: 0.01 },
            { id: 'pb_100m', label: 'PB 100m', unit: 's', placeholder: '10.xx', step: 0.01 },
            { id: 'pb_200m', label: 'PB 200m', unit: 's', placeholder: '21.xx', step: 0.01 },
            { id: 'pb_400m', label: 'PB 400m', unit: 's', placeholder: '48.xx', step: 0.01 },
            { id: 'pb_100mh', label: 'PB 100m Haies', unit: 's', placeholder: '13.xx', step: 0.01 },
            { id: 'pb_110mh', label: 'PB 110m Haies', unit: 's', placeholder: '14.xx', step: 0.01 },
            { id: 'pb_400mh', label: 'PB 400m Haies', unit: 's', placeholder: '52.xx', step: 0.01 }
        ]
    },
    {
        id: 'tests_sprint',
        title: 'Tests Vitesse & Accélération',
        icon: '⚡',
        description: 'Tests chronométrés à l\'entraînement (Cellules/Timing Gates).',
        fields: [
            { id: 'test_20m_block', label: '20m Block', unit: 's', placeholder: '3.xx', step: 0.01, tooltip: 'Départ arrêté en block.' },
            { id: 'test_30m_block', label: '30m Block', unit: 's', placeholder: '4.xx', step: 0.01, tooltip: 'Départ arrêté en block. Indicateur clé d\'accélération.' },
            { id: 'test_20m_fly', label: '20m Lancé (Fly)', unit: 's', placeholder: '1.xx', step: 0.01, tooltip: 'Distance lancée. Vitesse maximale pure.' },
            { id: 'test_30m_fly', label: '30m Lancé (Fly)', unit: 's', placeholder: '2.xx', step: 0.01, tooltip: 'Distance lancée. Vitesse maximale pure.' },
            { id: 'test_60m', label: '60m (Entraînement)', unit: 's', placeholder: '7.xx', step: 0.01 },
            { id: 'test_80m', label: '80m', unit: 's', placeholder: '9.xx', step: 0.01 },
            { id: 'test_120m', label: '120m', unit: 's', placeholder: '13.xx', step: 0.01, tooltip: 'Indicateur d\'endurance de vitesse.' }
        ]
    },
    {
        id: 'tests_biomech',
        title: 'Biomécanique (Optojump/Freelap)',
        icon: '📐',
        description: 'Données techniques avancées.',
        fields: [
            { id: 'contact_time_r', label: 'Temps Contact (D)', unit: 'ms', placeholder: '1xx', step: 1, tooltip: 'Temps au sol à vitesse max.' },
            { id: 'contact_time_l', label: 'Temps Contact (G)', unit: 'ms', placeholder: '1xx', step: 1 },
            { id: 'step_len_avg_r', label: 'Long. Moy. Pas (D)', unit: 'm', placeholder: '2.xx', step: 0.01 },
            { id: 'step_len_avg_l', label: 'Long. Moy. Pas (G)', unit: 'm', placeholder: '2.xx', step: 0.01 },
            { id: 'first_contact_dist', label: 'Dist. 1er Appui', unit: 'm', placeholder: '0.xx', step: 0.01, tooltip: 'Distance entre la ligne et le 1er pied.' },
            { id: 'time_to_first_contact', label: 'Temps 1er Appui', unit: 's', placeholder: '0.xx', step: 0.01 }
        ]
    },
    {
        id: 'tests_power',
        title: 'Puissance & Force',
        icon: '🚀',
        description: 'Tests physiques généraux.',
        fields: [
            { id: 'cmj_height', label: 'CMJ (Saut)', unit: 'cm', placeholder: '50.0', step: 0.5, tooltip: 'Counter Movement Jump (Mains sur les hanches).' },
            { id: 'sj_height', label: 'Squat Jump (SJ)', unit: 'cm', placeholder: '45.0', step: 0.5, tooltip: 'Saut sans élan (Départ fléchi arrêté).' },
            { id: 'cmj_power', label: 'Puissance CMJ', unit: 'W/kg', placeholder: '50.0', step: 0.1 },
            { id: 'bound_test', label: '5 Foulées (Bonds)', unit: 'm', placeholder: '14.xx', step: 0.1, tooltip: 'Distance totale sur 5 foulées bondissantes.' },
            { id: 'shot_toss_fwd', label: 'Lancer Avant', unit: 'm', placeholder: '15.xx', step: 0.1 },
            { id: 'shot_toss_bwd', label: 'Lancer Arrière', unit: 'm', placeholder: '16.xx', step: 0.1 }
        ]
    }
];

// --- 2. GLOSSARY ---
export const GLOSSARY = {
    'Vmax': { 
        term: 'Vitesse Maximale (Vmax)', 
        def: 'La vitesse de pointe absolue atteinte par l\'athlète, exprimée en m/s. Scientifiquement, elle représente la limite supérieure de la capacité contractile des muscles à produire de la force à haute vélocité. C\'est l\'indicateur de performance brute le plus critique pour le 100m et le 200m.' 
    },
    'Tau': { 
        term: 'Constante de Temps (Tau)', 
        def: 'Paramètre du modèle de Morin/Samozino représentant l\'accélération initiale. Un Tau faible (ex: 0.8s) signifie que l\'athlète atteint sa Vmax très rapidement (profil explosif). Il sert à quantifier l\'efficacité de la mise en action et la production de force horizontale lors des premiers appuis.' 
    },
    'Stiffness': { 
        term: 'Raideur Musculo-Tendineuse (Stiffness)', 
        def: 'Capacité du complexe muscle-tendon à agir comme un ressort rigide lors de l\'impact au sol. Une raideur élevée se traduit par des temps de contact très courts (<100ms) et une meilleure restitution de l\'énergie élastique, essentielle pour maintenir la vitesse en fin de course.' 
    },
    'Fly': { 
        term: 'Sprint Lancé (Fly)', 
        def: 'Méthode d\'évaluation de la vitesse maximale où le chronométrage débute après une zone d\'élan. Cela permet d\'isoler la capacité de vélocité pure en éliminant la variable de l\'accélération initiale depuis les blocs.' 
    },
    'CMJ': { 
        term: 'Counter Movement Jump (CMJ)', 
        def: 'Saut vertical avec contre-mouvement testant la puissance explosive des membres inférieurs. Il mesure l\'utilisation du Cycle Étirement-Détente (SSC). Un score élevé est fortement corrélé à la capacité d\'accélération initiale en sprint.' 
    },
    'ASR': { 
        term: 'Anaerobic Speed Reserve (ASR)', 
        def: 'Différence entre la vitesse maximale de sprint et la vitesse à VO2max. Sur 400m, une ASR élevée permet à l\'athlète de courir à une fraction plus faible de sa vitesse maximale, retardant ainsi l\'apparition de la fatigue neuromusculaire.' 
    },
    'SSC': { 
        term: 'Cycle Étirement-Détente (SSC)', 
        def: 'Phénomène physiologique où une contraction excentrique (étirement) est immédiatement suivie d\'une contraction concentrique. Ce cycle permet de produire une force bien supérieure à une contraction simple grâce à l\'énergie élastique stockée.' 
    },
    'Modèle Physique': { 
        term: 'Modèle de Dynamique Physique', 
        def: 'Calcul prédictif utilisant les lois de la physique (F=ma) adaptées au sprint. Il intègre la résistance de l\'air et les constantes physiologiques individuelles pour simuler une course idéale basée sur votre profil de force.' 
    },
    'Loi de Mero': { 
        term: 'Modèle Statistique de Mero', 
        def: 'Équation issue des recherches du Pr. Antti Mero. Elle utilise des corrélations historiques entre les temps de passage au 60m et le résultat final au 100m pour prédire la capacité de maintien de la vitesse.' 
    },
    'Fly-to-100': { 
        term: 'Projection Fly-to-100', 
        def: 'Méthode de calcul estimant le temps sur 100m à partir d\'un test de vitesse lancé (ex: Fly 30m). Elle permet de dissocier le potentiel de vitesse pure de la technique de départ.' 
    },
    'Speed-Biased': { 
        term: 'Profil Vitesse (Speed-Biased)', 
        def: 'Désigne un athlète dont la performance repose sur une Vmax très élevée mais qui possède une endurance de vitesse limitée. Ce profil excelle souvent sur 60m et 100m mais nécessite un travail spécifique pour le 200m.' 
    },
    'Endurance-Biased': { 
        term: 'Profil Endurance (Endurance-Biased)', 
        def: 'Désigne un athlète capable de maintenir un haut pourcentage de sa Vmax sur de longues durées. Moins explosif au départ, ce profil est redoutable sur les fins de course de 100m et sur le 200m/400m.' 
    },
    'Profil Sprinter': { 
        term: 'Profil Sprinter (400m)', 
        def: 'Athlète de 400m venant des disciplines de vitesse pure. Sa stratégie de course repose sur un passage rapide au 200m pour capitaliser sur sa réserve de vitesse.' 
    },
    'Profil Résistant': { 
        term: 'Profil Résistant (400m)', 
        def: 'Athlète de 400m avec un profil physiologique orienté vers le 800m. Sa force réside dans sa capacité à tolérer des niveaux d\'acidose très élevés en fin de course.' 
    },
    'Technique Index': { 
        term: 'Indice de Technique de Haie', 
        def: 'Ratio calculé entre le temps sur les haies et le temps sur plat. Il quantifie la perte de temps spécifique au franchissement. Un indice optimal suggère que la technique de haie ne limite pas l\'expression de la vitesse de l\'athlète.' 
    },
    'IE Target': { 
        term: 'Index d\'Efficacité (IE)', 
        def: 'La différence de temps cible entre un sprint plat et une course de haies. C\'est l\'objectif technique à atteindre pour que le passage d\'obstacle soit considéré comme "transparent" vis-à-vis de la vitesse de course.' 
    },
    'T400': { 
        term: 'Base de Temps 400m (T400)', 
        def: 'Le temps de référence sur 400m plat utilisé pour calculer le potentiel sur 400m haies. Il sert de fondation pour évaluer l\'endurance spécifique à l\'effort long du tour de piste.' 
    },
    'Margin': { 
        term: 'Marge de Segment (Margin)', 
        def: 'Écart temporel ajouté entre deux segments de course (ex: entre le premier et le second 200m d\'un 400m). Elle représente le coût énergétique et la fatigue accumulée au cours de l\'épreuve.' 
    },
    '400mH Differential': { 
        term: 'Différentiel 400m Haies', 
        def: 'L\'écart typique entre le record sur 400m plat et le 400m haies. Il mesure l\'aptitude de l\'athlète à maintenir son rythme malgré les 10 obstacles, combinant technique et gestion de l\'effort.' 
    },
    'Moyenne (Potentiel vs Réalisé)': { 
        term: 'Pondération Réaliste', 
        def: 'Algorithme qui équilibre votre potentiel physique théorique (ce que vos muscles peuvent faire) avec vos records actuels (ce que vous avez déjà prouvé). Cela évite les prédictions trop optimistes ou déconnectées de la réalité du terrain.' 
    }
};

// --- 3. BIBLIOGRAPHY & CATEGORIES ---
export const BIBLIOGRAPHY = [
  "Swiss Athletics - Tableaux de Performance & Standards (2026).",
  "Haugen, T. A., & Buchheit, M. (2016). Sprint Running Performance Monitoring: Methodological and Practical Considerations.",
  "Weyand, P. G., et al. (2000). Faster top running speeds are achieved with greater ground forces not more rapid leg movements.",
  "Morin, J. B., & Samozino, P. (2016). Interpreting Power-Force-Velocity profiles for individualized training. IJSPP.",
  "Mero, A., Komi, P. V., & Gregor, R. J. (1992). Biomechanics of sprint running. A review.",
  "Letzelter, M. & Letzelter, S. (1990). Entraînement de force.",
  "Di Prampero, P. E., et al. (2005). Sprint running: a new energetic approach.",
];

export const AGE_CATEGORIES = {
    U16: { maxAge: 15, label: 'U16 (Cadets B)' },
    U18: { maxAge: 17, label: 'U18 (Cadets A)' },
    U20: { maxAge: 19, label: 'U20 (Juniors)' },
    U23: { maxAge: 22, label: 'U23 (Espoirs)' },
    ELITE: { maxAge: 100, label: 'Elite' }
};

// --- 4. THE CORE DATA TREE ---
export const ATHLETICS_DATA = {
    '50m': {
        'M': {
            'ELITE': { standards: { INTERNATIONAL: 5.65, NATIONAL: 5.85 }, performance_ranges: { min: 5.70, max: 5.90 } },
            'U20': { standards: { NATIONAL: 6.10 }, performance_ranges: { min: 6.00, max: 6.30 } }
        },
        'F': {
            'ELITE': { standards: { INTERNATIONAL: 6.20, NATIONAL: 6.45 }, performance_ranges: { min: 6.25, max: 6.55 } },
            'U20': { standards: { NATIONAL: 6.75 }, performance_ranges: { min: 6.65, max: 6.95 } }
        }
    },
    '60m': {
        'M': {
            'ELITE': {
                standards: { INTERNATIONAL: 6.55, NATIONAL: 6.75 },
                performance_ranges: { min: 6.60, max: 6.80 },
                tests: { fly30m: { min: 2.85, max: 2.95 }, block30m: { target: 3.80 } }
            },
            'U20': {
                standards: { NATIONAL: 6.95 },
                performance_ranges: { min: 6.90, max: 7.15 }
            }
        },
        'F': {
            'ELITE': {
                standards: { INTERNATIONAL: 7.15, NATIONAL: 7.40 },
                performance_ranges: { min: 7.20, max: 7.50 },
                tests: { fly30m: { min: 3.20, max: 3.35 }, block30m: { target: 4.15 } }
            },
            'U20': {
                standards: { NATIONAL: 7.70 },
                performance_ranges: { min: 7.60, max: 7.95 }
            }
        }
    },
    '50mH': {
        'M': {
            'ELITE': { standards: { INTERNATIONAL: 6.45, NATIONAL: 6.75 }, performance_ranges: { min: 6.50, max: 6.85 }, specs: { start: 13.72, space: 9.14, height: 1.06 } },
            'U20': { specs: { start: 13.72, space: 9.14, height: 0.99 } },
            'U18': { specs: { start: 13.72, space: 9.14, height: 0.91 } }
        },
        'F': {
            'ELITE': { standards: { INTERNATIONAL: 6.85, NATIONAL: 7.20 }, performance_ranges: { min: 6.95, max: 7.30 }, specs: { start: 13.0, space: 8.5, height: 0.84 } },
            'U20': { specs: { start: 13.0, space: 8.5, height: 0.84 } },
            'U18': { specs: { start: 13.0, space: 8.5, height: 0.76 } }
        }
    },
    '60mH': {
        'M': {
            'ELITE': { standards: { INTERNATIONAL: 7.55, NATIONAL: 7.95 }, performance_ranges: { min: 7.60, max: 8.10 }, specs: { start: 13.72, space: 9.14, height: 1.06 } },
            'U20': { standards: { NATIONAL: 8.30 }, specs: { start: 13.72, space: 9.14, height: 0.99 } },
            'U18': { specs: { start: 13.72, space: 9.14, height: 0.91 } }
        },
        'F': {
            'ELITE': { standards: { INTERNATIONAL: 8.05, NATIONAL: 8.50 }, performance_ranges: { min: 8.10, max: 8.65 }, specs: { start: 13.0, space: 8.5, height: 0.84 } },
            'U20': { standards: { NATIONAL: 8.90 }, specs: { start: 13.0, space: 8.5, height: 0.84 } },
            'U18': { specs: { start: 13.0, space: 8.5, height: 0.76 } }
        }
    },
    '100m': {
        'M': {
            'ELITE': {
                standards: { INTERNATIONAL: 10.05, NATIONAL: 10.40, REGIONAL: 10.90 },
                performance_ranges: { min: 10.20, max: 10.50 },
                tests: { fly30m: { min: 2.85, max: 2.95 }, block30m: { target: 3.80 }, cmj: { min: 58, max: 65, target: 62 } },
                mechanics: { contactTime: { min: 80, max: 90 }, vMax: { min: 11.60, max: 12.20 } }
            },
            'U23': {
                standards: { INTERNATIONAL: 10.20, NATIONAL: 10.60, REGIONAL: 11.00 },
                performance_ranges: { min: 10.40, max: 10.80 },
                tests: { fly30m: { min: 2.95, max: 3.05 }, block30m: { target: 3.95 }, cmj: { min: 52, max: 58 } },
                mechanics: { contactTime: { min: 90, max: 100 }, vMax: { min: 11.20, max: 11.60 } }
            },
            'U20': {
                standards: { INTERNATIONAL: 10.45, NATIONAL: 10.85, REGIONAL: 11.30 },
                performance_ranges: { min: 10.80, max: 11.20 },
                tests: { fly30m: { min: 3.05, max: 3.15 }, block30m: { target: 4.15 }, cmj: { min: 48, max: 54 } },
                mechanics: { contactTime: { min: 105, max: 115 }, vMax: { min: 10.60, max: 11.20 } }
            },
            'U18': {
                standards: { INTERNATIONAL: 10.70, NATIONAL: 11.10, REGIONAL: 11.60 },
                performance_ranges: { min: 11.30, max: 11.60 },
                tests: { fly30m: { min: 3.20, max: 3.40 }, block30m: { target: 4.25 }, cmj: { min: 42, max: 48 } },
                mechanics: { contactTime: { min: 115, max: 130 }, vMax: { min: 10.00, max: 10.60 } }
            },
            'U16': {
                standards: { INTERNATIONAL: 11.20, NATIONAL: 11.60, REGIONAL: 12.20 },
                performance_ranges: { min: 9.40, max: 9.90, note: "Basé sur 80m" },
                tests: { fly30m: { min: 3.50, max: 3.70 }, block30m: { target: 4.40 }, cmj: { min: 36, max: 42 } },
                mechanics: { contactTime: { min: 130, max: 150 }, vMax: { min: 8.80, max: 10.00 } }
            }
        },
        'F': {
            'ELITE': {
                standards: { INTERNATIONAL: 11.15, NATIONAL: 11.60, REGIONAL: 12.30 },
                performance_ranges: { min: 11.20, max: 11.60 },
                tests: { fly30m: { min: 3.20, max: 3.35 }, block30m: { target: 4.15 }, cmj: { min: 45, max: 52, target: 48 } },
                mechanics: { contactTime: { min: 95, max: 105 }, vMax: { min: 10.50, max: 11.00 } }
            },
            'U23': {
                standards: { INTERNATIONAL: 11.30, NATIONAL: 11.80, REGIONAL: 12.50 },
                performance_ranges: { min: 11.50, max: 12.00 },
                tests: { fly30m: { min: 3.30, max: 3.45 }, block30m: { target: 4.35 }, cmj: { min: 40, max: 46 } },
                mechanics: { contactTime: { min: 105, max: 115 }, vMax: { min: 10.10, max: 10.60 } }
            },
            'U20': {
                standards: { INTERNATIONAL: 11.60, NATIONAL: 12.10, REGIONAL: 12.80 },
                performance_ranges: { min: 11.80, max: 12.30 },
                tests: { fly30m: { min: 3.40, max: 3.55 }, block30m: { target: 4.60 }, cmj: { min: 36, max: 42 } },
                mechanics: { contactTime: { min: 115, max: 125 }, vMax: { min: 9.60, max: 10.20 } }
            },
            'U18': {
                standards: { INTERNATIONAL: 11.90, NATIONAL: 12.40, REGIONAL: 13.10 },
                performance_ranges: { min: 12.40, max: 13.00 },
                tests: { fly30m: { min: 3.60, max: 3.80 }, block30m: { target: 4.80 }, cmj: { min: 32, max: 38 } },
                mechanics: { contactTime: { min: 125, max: 140 }, vMax: { min: 9.00, max: 9.60 } }
            },
            'U16': {
                standards: { INTERNATIONAL: 12.30, NATIONAL: 12.90, REGIONAL: 13.60 },
                performance_ranges: { min: 10.20, max: 10.80, note: "Basé sur 80m" },
                tests: { fly30m: { min: 3.90, max: 4.10 }, block30m: { target: 5.10 }, cmj: { min: 28, max: 34 } },
                mechanics: { contactTime: { min: 135, max: 155 }, vMax: { min: 8.20, max: 8.90 } }
            }
        }
    },
    '200m': {
        'M': {
            'ELITE': { standards: { INTERNATIONAL: 20.30, NATIONAL: 21.00, REGIONAL: 22.00 }, performance_ranges: { min: 20.50, max: 21.10 }, tests: { cmj: { min: 55, max: 62 } } },
            'U20': { standards: { INTERNATIONAL: 21.00, NATIONAL: 21.80, REGIONAL: 22.80 }, performance_ranges: { min: 21.80, max: 22.50 }, tests: { cmj: { min: 46, max: 52 } } },
            'U18': { standards: { INTERNATIONAL: 21.60, NATIONAL: 22.40, REGIONAL: 23.50 }, performance_ranges: { min: 22.80, max: 23.80 }, tests: { cmj: { min: 40, max: 46 } } },
            'U16': { performance_ranges: { min: 24.50, max: 26.00 }, tests: { cmj: { min: 35, max: 40 } } }
        },
        'F': {
            'ELITE': { standards: { INTERNATIONAL: 22.80, NATIONAL: 23.80, REGIONAL: 25.00 }, performance_ranges: { min: 22.80, max: 23.60 }, tests: { cmj: { min: 42, max: 48 } } },
            'U20': { standards: { INTERNATIONAL: 23.60, NATIONAL: 24.60, REGIONAL: 25.80 }, performance_ranges: { min: 24.20, max: 25.20 }, tests: { cmj: { min: 35, max: 41 } } },
            'U18': { standards: { INTERNATIONAL: 24.20, NATIONAL: 25.20, REGIONAL: 26.50 }, performance_ranges: { min: 25.50, max: 26.80 }, tests: { cmj: { min: 30, max: 36 } } },
            'U16': { performance_ranges: { min: 27.50, max: 29.00 }, tests: { cmj: { min: 27, max: 32 } } }
        }
    },
    '400m': {
        'M': {
            'ELITE': {
                standards: { INTERNATIONAL: 45.30, NATIONAL: 47.00, REGIONAL: 49.50 },
                performance_ranges: { min: 45.80, max: 46.80 },
                tests: { cmj: { min: 50, max: 58 } },
                model: { target: 46.00, splits: { 100: 11.1, 200: 22.0, 300: 33.5, 400: 46.0 }, diff: 2.0 }
            },
            'U20': {
                standards: { INTERNATIONAL: 46.80, NATIONAL: 48.50, REGIONAL: 51.00 },
                performance_ranges: { min: 48.50, max: 49.80 },
                tests: { cmj: { min: 45, max: 52 } },
                model: { target: 49.00, splits: { 100: 11.8, 200: 23.5, 300: 35.8, 400: 49.0 }, diff: 2.0 }
            },
            'U18': {
                standards: { INTERNATIONAL: 48.00, NATIONAL: 50.00, REGIONAL: 53.00 },
                performance_ranges: { min: 50.50, max: 53.00 },
                tests: { cmj: { min: 40, max: 46 } },
                model: { target: 51.50, splits: { 100: 12.2, 200: 24.5, 300: 37.5, 400: 51.5 }, diff: 2.5 }
            }
        },
        'F': {
            'ELITE': {
                standards: { INTERNATIONAL: 51.50, NATIONAL: 53.50, REGIONAL: 56.50 },
                performance_ranges: { min: 51.50, max: 53.50 },
                tests: { cmj: { min: 38, max: 44 } },
                model: { target: 52.00, splits: { 100: 12.5, 200: 24.8, 300: 37.8, 400: 52.0 }, diff: 2.4 }
            },
            'U20': {
                standards: { INTERNATIONAL: 53.50, NATIONAL: 56.00, REGIONAL: 59.00 },
                performance_ranges: { min: 54.50, max: 57.00 },
                tests: { cmj: { min: 34, max: 39 } },
                model: { target: 56.00, splits: { 100: 13.2, 200: 26.5, 300: 40.5, 400: 56.0 }, diff: 3.0 }
            },
            'U18': {
                standards: { INTERNATIONAL: 55.00, NATIONAL: 57.50, REGIONAL: 61.00 },
                performance_ranges: { min: 57.50, max: 61.00 },
                tests: { cmj: { min: 30, max: 35 } },
                model: { target: 59.50, splits: { 100: 14.0, 200: 28.2, 300: 43.5, 400: 59.5 }, diff: 3.1 }
            }
        }
    },
    '100mH': {
        'F': {
            'ELITE': { standards: { INTERNATIONAL: 12.80, NATIONAL: 13.80 }, performance_ranges: { min: 13.00, max: 13.60 }, tests: { cmj: { min: 44, max: 50 } }, specs: { start: 13.0, space: 8.5, height: 0.84 } },
            'U23': { standards: { INTERNATIONAL: 13.00, NATIONAL: 14.20 }, performance_ranges: { min: 13.50, max: 14.10 }, tests: { cmj: { min: 39, max: 45 } } },
            'U20': { standards: { INTERNATIONAL: 13.50, NATIONAL: 14.80 }, performance_ranges: { min: 14.00, max: 14.60 }, tests: { cmj: { min: 35, max: 41 } }, specs: { height: 0.84 } },
            'U18': { standards: { INTERNATIONAL: 13.80, NATIONAL: 15.00 }, performance_ranges: { min: 14.50, max: 15.20 }, tests: { cmj: { min: 31, max: 37 } }, specs: { height: 0.76 } }
        }
    },
    '110mH': {
        'M': {
            'ELITE': { standards: { INTERNATIONAL: 13.20, NATIONAL: 13.90 }, performance_ranges: { min: 13.40, max: 13.80 }, tests: { cmj: { min: 56, max: 64 } }, specs: { start: 13.72, space: 9.14, height: 1.06 } },
            'U23': { standards: { INTERNATIONAL: 13.50, NATIONAL: 14.30 }, performance_ranges: { min: 13.80, max: 14.20 }, tests: { cmj: { min: 51, max: 57 } } },
            'U20': { standards: { INTERNATIONAL: 13.80, NATIONAL: 14.80 }, performance_ranges: { min: 14.20, max: 14.70 }, tests: { cmj: { min: 47, max: 53 } }, specs: { height: 0.99 } },
            'U18': { standards: { INTERNATIONAL: 14.20, NATIONAL: 15.50 }, performance_ranges: { min: 14.80, max: 15.40 }, tests: { cmj: { min: 41, max: 47 } }, specs: { height: 0.91 } }
        }
    },
    '400mH': {
        'M': { 'ELITE': { standards: { INTERNATIONAL: 49.00, NATIONAL: 52.00 }, tests: { cmj: { min: 50, max: 57 } }, specs: { height: 0.91 } } },
        'F': { 'ELITE': { standards: { INTERNATIONAL: 55.00, NATIONAL: 59.00 }, tests: { cmj: { min: 38, max: 45 } }, specs: { height: 0.76 } } }
    }
};

export const CONTACT_TIME_TARGETS = {
  M: [
    { label: "Élite Mondiale", min: 80, max: 90, vmax: "> 11.5" },
    { label: "National / Élite", min: 90, max: 105, vmax: "10.5 - 11" },
    { label: "U20", min: 105, max: 115, vmax: "9.5 - 10.5" },
    { label: "U18", min: 115, max: 130, vmax: "8.5 - 9.5" },
    { label: "U16", min: 130, max: 150, vmax: "7.5 - 8.5" },
  ],
  F: [
    { label: "Élite Mondiale", min: 95, max: 105, vmax: "> 10.8" },
    { label: "National / Élite", min: 110, max: 120, vmax: "9.8 - 10.5" },
    { label: "U20", min: 115, max: 125, vmax: "9.0 - 9.8" },
    { label: "U18", min: 125, max: 140, vmax: "8.2 - 9.0" },
  ],
};

// --- 5. DISCIPLINES CONFIG (Milestones for Capture) ---
export const DISCIPLINES_CONFIG = {
  "50m": [
    { label: "Départ (0m)", type: "split", distance: 0 },
    { label: "20m", type: "split", distance: 20 },
    { label: "30m", type: "split", distance: 30 },
    { label: "Arrivée (50m)", type: "split", distance: 50 },
  ],
  "60m": [
    { label: "Départ (0m)", type: "split", distance: 0 },
    { label: "30m", type: "split", distance: 30 },
    { label: "Arrivée (60m)", type: "split", distance: 60 },
  ],
  "50mH": [
    { label: "Départ (0m)", type: "split", distance: 0 },
    ...Array.from({ length: 4 }, (_, i) => [
      { label: `H${i + 1} Take-off`, type: "takeoff", distance: 13.0 + i * 8.5 - 2 },
      { label: `H${i + 1} Touchdown`, type: "touchdown", distance: 13.0 + i * 8.5 },
    ]).flat(),
    { label: "Arrivée (50m)", type: "split", distance: 50 },
  ],
  "60mH": [
    { label: "Départ (0m)", type: "split", distance: 0 },
    ...Array.from({ length: 5 }, (_, i) => [
      { label: `H${i + 1} Take-off`, type: "takeoff", distance: 13.0 + i * 8.5 - 2 },
      { label: `H${i + 1} Touchdown`, type: "touchdown", distance: 13.0 + i * 8.5 },
    ]).flat(),
    { label: "Arrivée (60m)", type: "split", distance: 60 },
  ],
  "100m": [
    { label: "Départ (0m)", type: "split", distance: 0 },
    { label: "30m", type: "split", distance: 30 },
    { label: "50m", type: "split", distance: 50 },
    { label: "60m", type: "split", distance: 60 },
    { label: "Arrivée (100m)", type: "split", distance: 100 },
  ],
  "110mH": [
    { label: "Départ (0m)", type: "split", distance: 0 },
    ...Array.from({ length: 10 }, (_, i) => [
      { label: `H${i + 1} Take-off`, type: "takeoff", distance: 13.72 + i * 9.14 - 2 },
      { label: `H${i + 1} Touchdown`, type: "touchdown", distance: 13.72 + i * 9.14 },
    ]).flat(),
    { label: "Arrivée (110m)", type: "split", distance: 110 },
  ],
  "100mH": [
    { label: "Départ (0m)", type: "split", distance: 0 },
    ...Array.from({ length: 10 }, (_, i) => [
      { label: `H${i + 1} Take-off`, type: "takeoff", distance: 13.0 + i * 8.5 - 2 },
      { label: `H${i + 1} Touchdown`, type: "touchdown", distance: 13.0 + i * 8.5 },
    ]).flat(),
    { label: "Arrivée (100m)", type: "split", distance: 100 },
  ],
  "200m": [
    { label: "Départ (0m)", type: "split", distance: 0 },
    { label: "30m", type: "split", distance: 30 },
    { label: "100m", type: "split", distance: 100 },
    { label: "Arrivée (200m)", type: "split", distance: 200 },
  ],
  "400m": [
    { label: "Départ (0m)", type: "split", distance: 0 },
    { label: "100m", type: "split", distance: 100 },
    { label: "200m", type: "split", distance: 200 },
    { label: "300m", type: "split", distance: 300 },
    { label: "Arrivée (400m)", type: "split", distance: 400 },
  ],
  "400mH": [
    { label: "Départ (0m)", type: "split", distance: 0 },
    ...Array.from({ length: 10 }, (_, i) => [{ label: `H${i + 1} Touchdown`, type: "touchdown", distance: 45.0 + i * 35.0 }]).flat(),
    { label: "Arrivée (400m)", type: "split", distance: 400 },
  ],
};

// --- 6. ANALYSIS TEMPLATES (Custom Intervals) ---
export const ANALYSIS_TEMPLATES = {
  "50m": [
    { label: "Mise en action", start: 0, end: 20, type: "accel" },
    { label: "Vitesse", start: 20, end: 50, type: "total" },
  ],
  "60m": [
    { label: "Départ", start: 0, end: 30, type: "accel" },
    { label: "Transition", start: 30, end: 60, type: "vmax" },
    { label: "60m", start: 0, end: 60, type: "total" },
  ],
  "50mH": [
    { label: "Mise en action (H1)", start: 0, end: 13.0, type: "accel" },
    { label: "Inter-haies (H1-H4)", start: 13.0, end: 38.5, type: "rhythm" },
    { label: "Final", start: 38.5, end: 50, type: "finish" },
  ],
  "60mH": [
    { label: "Mise en action (H1)", start: 0, end: 13.0, type: "accel" },
    { label: "Inter-haies (H1-H5)", start: 13.0, end: 47.0, type: "rhythm" },
    { label: "Final", start: 47.0, end: 60, type: "finish" },
  ],
  "100m": [
    { label: "Départ", start: 0, end: 30, type: "accel" },
    { label: "Transition / Vmax", start: 30, end: 60, type: "vmax" },
    { label: "Maintien de vitesse", start: 60, end: 100, type: "speed_maint" },
    { label: "60m", start: 0, end: 60, type: "total" },
    { label: "Fly", start: 50, end: 100, type: "endurance" },
    { label: "100m", start: 0, end: 100, type: "total" },
  ],
  "200m": [
    { label: "Virage", start: 0, end: 100, type: "vmax" },
    { label: "Ligne Droite", start: 100, end: 200, type: "speed_maint" },
    { label: "200m", start: 0, end: 200, type: "total" },
  ],
  "400m": [
    { label: "1er 200m", start: 0, end: 200, type: "total" },
    { label: "2nd 200m", start: 200, end: 400, type: "total" },
    { label: "Différentiel (2-1)", isDiff: true, startRef: 0, endRef: 200, startComp: 200, endComp: 400 },
    { label: "Performance Totale", start: 0, end: 400, type: "total" },
  ],
  "110mH": [
    { label: "Mise en action (H1)", start: 0, end: 13.72, type: "accel" },
    { label: "Inter-haies (H1-H10)", start: 13.72, end: 96.0, type: "rhythm" },
    { label: "Final (H10-Arrivée)", start: 96.0, end: 110, type: "finish" },
  ],
  "100mH": [
    { label: "Mise en action (H1)", start: 0, end: 13.0, type: "accel" },
    { label: "Inter-haies (H1-H10)", start: 13.0, end: 89.5, type: "rhythm" },
    { label: "Final (H10-Arrivée)", start: 89.5, end: 100, type: "finish" },
  ],
  "400mH": [
    { label: "H1", start: 0, end: 45.0, type: "accel" },
    { label: "H1-H10", start: 45.0, end: 360.0, type: "rhythm" },
    { label: "Final", start: 360.0, end: 400, type: "finish" },
  ],
};

// Backward Compatibility Exports
export const STANDARDS = {}; // Will be handled dynamically in engine to avoid redundancy
export const PERFORMANCE_DATA = {};
export const SPLIT_MODELS = {};

// --- 7. HELPERS ---

/**
 * Get hurdle specifications for a specific context
 */
export const getHurdleSpecs = (event, gender = 'M', category = 'ELITE') => {
    const eventNode = ATHLETICS_DATA[event];
    if (!eventNode) return null;
    
    const genderNode = eventNode[gender] || eventNode['M'];
    if (!genderNode) return null;
    
    // Try to find specs in the specific category, then fall back to ELITE
    const catData = genderNode[category] || genderNode['ELITE'];
    if (catData?.specs) {
        // Ensure start and space are present, if not, try to get them from ELITE
        const specs = { ...catData.specs };
        if (!specs.start || !specs.space) {
            const eliteSpecs = genderNode['ELITE']?.specs || {};
            specs.start = specs.start || eliteSpecs.start;
            specs.space = specs.space || eliteSpecs.space;
        }
        return specs;
    }
    
    return genderNode['ELITE']?.specs || null;
};

/**
 * Get dynamic discipline milestones based on athlete profile
 */
export const getDynamicDisciplineConfig = (discipline, gender = 'M', category = 'ELITE') => {
    // If it's a hurdle race, we might need to adjust distances
    if (discipline.toLowerCase().includes('h')) {
        const specs = getHurdleSpecs(discipline, gender, category);
        if (specs && specs.start && specs.space) {
            const { start, space } = specs;
            const hCount = (discipline === '50mH' ? 4 : (discipline === '60mH' ? 5 : 10));
            const totalDist = parseInt(discipline);
            
            return [
                { label: "Départ (0m)", type: "split", distance: 0 },
                ...Array.from({ length: hCount }, (_, i) => [
                    { label: `H${i + 1} Take-off`, type: "takeoff", distance: start + i * space - 2 },
                    { label: `H${i + 1} Touchdown`, type: "touchdown", distance: start + i * space },
                ]).flat(),
                { label: `Arrivée (${totalDist}m)`, type: "split", distance: totalDist },
            ];
        }
    }
    
    // Default to static config
    return DISCIPLINES_CONFIG[discipline] || [];
};

/**
 * Get dynamic analysis template based on athlete profile
 */
export const getDynamicAnalysisTemplate = (discipline, gender = 'M', category = 'ELITE') => {
    const template = ANALYSIS_TEMPLATES[discipline];
    if (!template) return [];

    // For hurdles, we might need to adjust the start/end distances in the template
    if (discipline.toLowerCase().includes('h')) {
        const specs = getHurdleSpecs(discipline, gender, category);
        if (specs && specs.start && specs.space) {
            const { start, space } = specs;
            const hCount = (discipline === '50mH' ? 4 : (discipline === '60mH' ? 5 : 10));
            
            return template.map(item => {
                const newItem = { ...item };
                if (item.label.includes('H1')) {
                    newItem.end = start;
                } else if (item.label.includes('Inter-haies')) {
                    newItem.start = start;
                    newItem.end = start + (hCount - 1) * space;
                } else if (item.type === 'finish') {
                    newItem.start = start + (hCount - 1) * space;
                }
                return newItem;
            });
        }
    }

    return template;
};
