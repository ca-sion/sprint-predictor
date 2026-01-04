import { ATHLETICS_DATA } from './Standards.js';

export const DISCIPLINE_TYPES = {
    FLAT: 'flat',
    FLAT_LONG: 'flat_long',
    LONG_SPRINT: 'long_sprint',
    HURDLES: 'hurdles',
    HURDLES_LONG: 'hurdles_long'
};

export const HURDLE_CONSTANTS = {
    DEFAULT_TAKEOFF_OFFSET: 2.0
};

/**
 * Unified Discipline Configuration
 * Source of truth for Prediction Engine, Capture Tool, and Analysis.
 */
export const DISCIPLINES = {
  "50m": {
    id: "50m",
    name: "50m",
    type: DISCIPLINE_TYPES.FLAT,
    distance: 50,
    params: {
      kFactor: { U16: 0.7, default: 0.37 },
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
    ],
  },
  "60m": {
    id: "60m",
    name: "60m",
    type: DISCIPLINE_TYPES.FLAT,
    distance: 60,
    params: {
      kFactor: { U16: 0.7, default: 0.37 },
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
    ],
  },
  "100m": {
    id: "100m",
    name: "100m",
    type: DISCIPLINE_TYPES.FLAT,
    distance: 100,
    params: {
      baseStartCost: 0.92,
      kFactor: { U16: 0.7, U18: 0.37, U20: 0.37, F: 0.37, default: 0.2 },
      meroRatio: 1.54,
      accelBonusThreshold: 4.25,
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
    ],
  },
  "200m": {
    id: "200m",
    name: "200m",
    type: DISCIPLINE_TYPES.FLAT_LONG,
    distance: 200,
    params: {
      fatigueIndexThresholds: { speed: 1.25, endurance: 1.15 },
      deltas: { speed: 0.2, endurance: -0.3, neutral: -0.1 },
    },
    capture: [
      { label: "Départ (0m)", type: "split", distance: 0 },
      { label: "30m", type: "split", distance: 30 },
      { label: "100m", type: "split", distance: 100 },
      { label: "150m", type: "split", distance: 150 },
      { label: "Arrivée (200m)", type: "split", distance: 200 },
    ],
    analysis: [
      { label: "Virage (0-100m)", start: 0, end: 100, type: "vmax" },
      { label: "Sortie virage (100-150m)", start: 100, end: 150, type: "speed_maint" },
      { label: "Maintien / Décélération (150-200m)", start: 150, end: 200, type: "endurance" },
      { label: "200m", start: 0, end: 200, type: "total" },
    ],
  },
  "400m": {
    id: "400m",
    name: "400m",
    type: DISCIPLINE_TYPES.LONG_SPRINT,
    distance: 400,
    params: {
      fatigueIndexThresholds: { sprinter: 1.2, resistant: 1.1 },
      margins: { U16_sprinter: 5.5, sprinter: 5.0, resistant: 2.8, default: 3.6 },
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
    ],
  },
  "50mH": {
    id: "50mH",
    name: "50m Haies",
    type: DISCIPLINE_TYPES.HURDLES,
    distance: 50,
    hurdleCount: 4,
    params: {
      ieTarget: { U18: 1.4, U20: 1.4, U16: 1.8, M: 1.0, F: 0.95 },
    }
  },
  "60mH": {
    id: "60mH",
    name: "60m Haies",
    type: DISCIPLINE_TYPES.HURDLES,
    distance: 60,
    hurdleCount: 5,
    params: {
      ieTarget: { U18: 1.4, U20: 1.4, U16: 1.8, M: 1.0, F: 0.95 },
    }
  },
  "100mH": {
    id: "100mH",
    name: "100m Haies (F)",
    type: DISCIPLINE_TYPES.HURDLES,
    distance: 100,
    hurdleCount: 10,
    params: {
      ieTarget: { U18: 1.4, U20: 1.4, U16: 1.8, F: 0.95, default: 1.0 },
    }
  },
  "110mH": {
    id: "110mH",
    name: "110m Haies (M)",
    type: DISCIPLINE_TYPES.HURDLES,
    distance: 110,
    hurdleCount: 10,
    params: {
      ieTarget: { U18: 1.4, U20: 1.4, U16: 1.8, M: 1.0, default: 1.0 },
    }
  },
  "400mH": {
    id: "400mH",
    name: "400m Haies",
    type: DISCIPLINE_TYPES.HURDLES_LONG,
    distance: 400,
    hurdleCount: 10,
    params: {
      diff400: { F: 4.5, M: 4.0, U18_bonus: 1.0 },
    }
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

    if (config.type === DISCIPLINE_TYPES.HURDLES || config.type === DISCIPLINE_TYPES.HURDLES_LONG) {
        const specs = getHurdleSpecs(disciplineId, gender, category);
        if (specs && specs.start && specs.space) {
            const { start, space } = specs;
            const milestones = [{ label: "Départ (0m)", type: "split", distance: 0 }];
            
            for (let i = 0; i < config.hurdleCount; i++) {
                const hurdleDist = start + i * space;
                
                // Différenciation : Haies courtes (take-off + touchdown), Haies longues (touchdown uniquement)
                if (config.type === DISCIPLINE_TYPES.HURDLES) {
                    milestones.push({ 
                        label: `H${i + 1} Take-off`, 
                        type: "takeoff", 
                        distance: hurdleDist - HURDLE_CONSTANTS.DEFAULT_TAKEOFF_OFFSET 
                    });
                }
                milestones.push({ label: `H${i + 1} Touchdown`, type: "touchdown", distance: hurdleDist });
            }
            
            milestones.push({ label: `Arrivée (${config.distance}m)`, type: "split", distance: config.distance });
            return milestones;
        }
    }
    return config.capture || [];
};

/**
 * Helper to generate analysis templates
 */
export const getDynamicAnalysisTemplate = (disciplineId, gender = 'M', category = 'ELITE') => {
    const config = DISCIPLINES[disciplineId];
    if (!config) return [];

    // Hurdles (Short & Long): generate granular segments touchdown-to-touchdown
    if (config.type === DISCIPLINE_TYPES.HURDLES || config.type === DISCIPLINE_TYPES.HURDLES_LONG) {
        const specs = getHurdleSpecs(disciplineId, gender, category);

        if (specs && specs.start && specs.space) {
            const { start, space } = specs;
            const template = [
                { label: "Départ-H1", start: 0, end: start, type: "accel" }
            ];
            
            for (let i = 1; i < config.hurdleCount; i++) {
                const s = start + (i - 1) * space;
                const e = start + i * space;
                template.push({ label: `H${i}-H${i+1}`, start: s, end: e, type: "rhythm" });
            }
            
            const lastH = start + (config.hurdleCount - 1) * space;

            template.push({ label: "Final", start: lastH, end: config.distance, type: "finish" });
            template.push({ label: config.name, start: 0, end: config.distance, type: "total" });

            return template;
        }
    }

    return config.analysis || [];
};
