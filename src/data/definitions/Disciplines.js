import { ATHLETICS_DATA } from './Standards.js';

/**
 * Unified Discipline Configuration
 * Source of truth for Prediction Engine, Capture Tool, and Analysis.
 */
export const DISCIPLINES = {
  "50m": {
    id: "50m",
    name: "50m",
    type: "flat",
    distance: 50,
    params: {
      kFactor: { U16: 0.70, default: 0.37 }
    },
    capture: [
      { label: "Départ (0m)", type: "split", distance: 0 },
      { label: "20m", type: "split", distance: 20 },
      { label: "30m", type: "split", distance: 30 },
      { label: "Arrivée (50m)", type: "split", distance: 50 },
    ],
    analysis: [
      { label: "Départ (0-20)", start: 0, end: 20, type: "accel" },
      { label: "Vitesse (20-50)", start: 20, end: 50, type: "total" },
    ]
  },
  "60m": {
    id: "60m",
    name: "60m",
    type: "flat",
    distance: 60,
    params: {
      kFactor: { U16: 0.70, default: 0.37 }
    },
    capture: [
      { label: "Départ (0m)", type: "split", distance: 0 },
      { label: "30m", type: "split", distance: 30 },
      { label: "Arrivée (60m)", type: "split", distance: 60 },
    ],
    analysis: [
      { label: "Départ (0-30)", start: 0, end: 30, type: "accel" },
      { label: "Transition (30-60)", start: 30, end: 60, type: "vmax" },
      { label: "60m", start: 0, end: 60, type: "total" },
    ]
  },
  "100m": {
    id: "100m",
    name: "100m",
    type: "flat",
    distance: 100,
    params: {
      baseStartCost: 0.92,
      kFactor: { U16: 0.70, U18: 0.37, U20: 0.37, F: 0.37, default: 0.20 },
      meroRatio: 1.54,
      accelBonusThreshold: 4.25
    },
    capture: [
      { label: "Départ (0m)", type: "split", distance: 0 },
      { label: "30m", type: "split", distance: 30 },
      { label: "50m", type: "split", distance: 50 },
      { label: "60m", type: "split", distance: 60 },
      { label: "Arrivée (100m)", type: "split", distance: 100 },
    ],
    analysis: [
      { label: "Départ (0-30)", start: 0, end: 30, type: "accel" },
      { label: "Transition / Vmax (30-60)", start: 30, end: 60, type: "vmax" },
      { label: "Maintien vitesse (60-100)", start: 60, end: 100, type: "speed_maint" },
      { label: "60m", start: 0, end: 60, type: "total" },
      { label: "100m", start: 0, end: 100, type: "total" },
      { label: "Endurance (50-100)", start: 50, end: 100, type: "endurance" },
    ]
  },
  "200m": {
    id: "200m",
    name: "200m",
    type: "flat_long",
    distance: 200,
    params: {
      fatigueIndexThresholds: { speed: 1.25, endurance: 1.15 },
      deltas: { speed: 0.2, endurance: -0.3, neutral: -0.1 }
    },
    capture: [
      { label: "Départ (0m)", type: "split", distance: 0 },
      { label: "30m", type: "split", distance: 30 },
      { label: "100m", type: "split", distance: 100 },
      { label: "Arrivée (200m)", type: "split", distance: 200 },
    ],
    analysis: [
      { label: "Virage", start: 0, end: 100, type: "vmax" },
      { label: "Ligne droite", start: 100, end: 200, type: "speed_maint" },
      { label: "200m", start: 0, end: 200, type: "total" },
    ]
  },
  "400m": {
    id: "400m",
    name: "400m",
    type: "long_sprint",
    distance: 400,
    params: {
      fatigueIndexThresholds: { sprinter: 1.20, resistant: 1.10 },
      margins: { U16_sprinter: 5.5, sprinter: 5.0, resistant: 2.8, default: 3.6 }
    },
    capture: [
      { label: "Départ (0m)", type: "split", distance: 0 },
      { label: "100m", type: "split", distance: 100 },
      { label: "200m", type: "split", distance: 200 },
      { label: "300m", type: "split", distance: 300 },
      { label: "Arrivée (400m)", type: "split", distance: 400 },
    ],
    analysis: [
      { label: "1er 200m", start: 0, end: 200, type: "total" },
      { label: "2e 200m", start: 200, end: 400, type: "total" },
      { label: "Différentiel (2-1)", isDiff: true, startRef: 0, endRef: 200, startComp: 200, endComp: 400 },
      { label: "400m", start: 0, end: 400, type: "total" },
    ]
  },
  "50mH": {
    id: "50mH",
    name: "50m Haies",
    type: "hurdles",
    distance: 50,
    hurdleCount: 4,
    params: {
      ieTarget: { U18: 1.4, U20: 1.4, U16: 1.8, M: 1.0, F: 0.95 }
    },
    capture: [
      { label: "Départ (0m)", type: "split", distance: 0 },
      ...Array.from({ length: 4 }, (_, i) => [
        { label: `H${i + 1} Take-off`, type: "takeoff", distance: 13.0 + i * 8.5 - 2 },
        { label: `H${i + 1} Touchdown`, type: "touchdown", distance: 13.0 + i * 8.5 },
      ]).flat(),
      { label: "Arrivée (50m)", type: "split", distance: 50 },
    ],
    analysis: [
      { label: "Départ (H1)", start: 0, end: null, type: "accel" },
      { label: "Inter-haies (H1-H4)", start: null, end: null, type: "rhythm" },
      { label: "Final", start: null, end: 50, type: "finish" },
    ]
  },
  "60mH": {
    id: "60mH",
    name: "60m Haies",
    type: "hurdles",
    distance: 60,
    hurdleCount: 5,
    params: {
      ieTarget: { U18: 1.4, U20: 1.4, U16: 1.8, M: 1.0, F: 0.95 }
    },
    capture: [
      { label: "Départ (0m)", type: "split", distance: 0 },
      ...Array.from({ length: 5 }, (_, i) => [
        { label: `H${i + 1} Take-off`, type: "takeoff", distance: 13.0 + i * 8.5 - 2 },
        { label: `H${i + 1} Touchdown`, type: "touchdown", distance: 13.0 + i * 8.5 },
      ]).flat(),
      { label: "Arrivée (60m)", type: "split", distance: 60 },
    ],
    analysis: [
      { label: "Départ (H1)", start: 0, end: null, type: "accel" },
      { label: "Inter-haies (H1-H5)", start: null, end: null, type: "rhythm" },
      { label: "Final", start: null, end: 60, type: "finish" },
    ]
  },
  "100mH": {
    id: "100mH",
    name: "100m Haies (F)",
    type: "hurdles",
    distance: 100,
    hurdleCount: 10,
    params: {
      ieTarget: { U18: 1.4, U20: 1.4, U16: 1.8, F: 0.95, default: 1.0 }
    },
    capture: [
      { label: "Départ (0m)", type: "split", distance: 0 },
      ...Array.from({ length: 10 }, (_, i) => [
        { label: `H${i + 1} Take-off`, type: "takeoff", distance: 13.0 + i * 8.5 - 2 },
        { label: `H${i + 1} Touchdown`, type: "touchdown", distance: 13.0 + i * 8.5 },
      ]).flat(),
      { label: "Arrivée (100m)", type: "split", distance: 100 },
    ],
    analysis: [
      { label: "Départ (H1)", start: 0, end: null, type: "accel" },
      { label: "Inter-haies (H1-H10)", start: null, end: null, type: "rhythm" },
      { label: "Finale (H10-Arrivée)", start: null, end: 100, type: "finish" },
    ]
  },
  "110mH": {
    id: "110mH",
    name: "110m Haies (M)",
    type: "hurdles",
    distance: 110,
    hurdleCount: 10,
    params: {
      ieTarget: { U18: 1.4, U20: 1.4, U16: 1.8, M: 1.0, default: 1.0 }
    },
    capture: [
      { label: "Départ (0m)", type: "split", distance: 0 },
      ...Array.from({ length: 10 }, (_, i) => [
        { label: `H${i + 1} Take-off`, type: "takeoff", distance: 13.72 + i * 9.14 - 2 },
        { label: `H${i + 1} Touchdown`, type: "touchdown", distance: 13.72 + i * 9.14 },
      ]).flat(),
      { label: "Arrivée (110m)", type: "split", distance: 110 },
    ],
    analysis: [
      { label: "Départ (H1)", start: 0, end: null, type: "accel" },
      { label: "Inter-haies (H1-H10)", start: null, end: null, type: "rhythm" },
      { label: "Finale (H10-Arrivée)", start: null, end: 110, type: "finish" },
    ]
  },
  "400mH": {
    id: "400mH",
    name: "400m Haies",
    type: "hurdles_long",
    distance: 400,
    hurdleCount: 10,
    params: {
      diff400: { F: 4.5, M: 4.0, U18_bonus: 1.0 }
    },
    capture: [
      { label: "Départ (0m)", type: "split", distance: 0 },
      ...Array.from({ length: 10 }, (_, i) => [{ label: `H${i + 1} Touchdown`, type: "touchdown", distance: 45.0 + i * 35.0 }]).flat(),
      { label: "Arrivée (400m)", type: "split", distance: 400 },
    ],
    analysis: [
      { label: "Départ (H1)", start: 0, end: 45.0, type: "accel" },
      { label: "Inter-haies (H1-H10", start: 45.0, end: 360.0, type: "rhythm" },
      { label: "Finale", start: 360.0, end: 400, type: "finish" },
    ]
  }
};

/**
 * Helper to get hurdle specifications
 */
export const getHurdleSpecs = (event, gender = 'M', category = 'ELITE') => {
    const eventNode = ATHLETICS_DATA[event];
    if (!eventNode) return null;
    const genderNode = eventNode[gender] || eventNode['M'];
    const catData = genderNode[category] || genderNode['ELITE'];
    if (catData?.specs) {
        const specs = { ...catData.specs };
        const eliteSpecs = genderNode['ELITE']?.specs || {};
        specs.start = specs.start || eliteSpecs.start;
        specs.space = specs.space || eliteSpecs.space;
        return specs;
    }
    return genderNode['ELITE']?.specs || null;
};

/**
 * Helper to generate capture milestones
 */
export const getDynamicDisciplineConfig = (disciplineId, gender = 'M', category = 'ELITE') => {
    const config = DISCIPLINES[disciplineId];
    if (!config) return [];

    if (config.type === 'hurdles') {
        const specs = getHurdleSpecs(disciplineId, gender, category);
        if (specs && specs.start && specs.space) {
            const { start, space } = specs;
            return [
                { label: "Départ (0m)", type: "split", distance: 0 },
                ...Array.from({ length: config.hurdleCount }, (_, i) => [
                    { label: `H${i + 1} Take-off`, type: "takeoff", distance: start + i * space - 2 },
                    { label: `H${i + 1} Touchdown`, type: "touchdown", distance: start + i * space },
                ]).flat(),
                { label: `Arrivée (${config.distance}m)`, type: "split", distance: config.distance },
            ];
        }
    }
    return config.capture || [];
};

/**
 * Helper to generate analysis templates
 */
export const getDynamicAnalysisTemplate = (disciplineId, gender = 'M', category = 'ELITE') => {
    const config = DISCIPLINES[disciplineId];
    if (!config || !config.analysis) return [];

    if (config.type === 'hurdles') {
        const specs = getHurdleSpecs(disciplineId, gender, category);
        if (specs && specs.start && specs.space) {
            const { start, space } = specs;
            return config.analysis.map(item => {
                const newItem = { ...item };
                if (item.label.includes('H1')) newItem.end = start;
                else if (item.label.includes('Inter-haies')) {
                    newItem.start = start;
                    newItem.end = start + (config.hurdleCount - 1) * space;
                } else if (item.type === 'finish') {
                    newItem.start = start + (config.hurdleCount - 1) * space;
                }
                return newItem;
            });
        }
    }
    return config.analysis;
};
