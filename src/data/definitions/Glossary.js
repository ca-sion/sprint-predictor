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
        def: 'La différence de temps cible entre un sprint plat et une course de haies. C\'est l\'objectif technique à atteindre pour que le passage d\'obstacle soit considéré comme \"transparent\" vis-à-vis de la vitesse de course.'
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

export const BIBLIOGRAPHY = [
  "Swiss Athletics - Tableaux de Performance & Standards (2026).\n",
  "Haugen, T. A., & Buchheit, M. (2016). Sprint Running Performance Monitoring: Methodological and Practical Considerations.",
  "Weyand, P. G., et al. (2000). Faster top running speeds are achieved with greater ground forces not more rapid leg movements.",
  "Morin, J. B., & Samozino, P. (2016). Interpreting Power-Force-Velocity profiles for individualized training. IJSPP.",
  "Mero, A., Komi, P. V., & Gregor, R. J. (1992). Biomechanics of sprint running. A review.",
  "Letzelter, M. & Letzelter, S. (1990). Entraînement de force.",
  "Di Prampero, P. E., et al. (2005). Sprint running: a new energetic approach.",
];
