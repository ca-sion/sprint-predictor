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
