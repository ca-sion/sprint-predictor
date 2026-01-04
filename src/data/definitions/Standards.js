export const AGE_CATEGORIES = {
    U16: { maxAge: 15, label: 'U16 (Cadets B)' },
    U18: { maxAge: 17, label: 'U18 (Cadets A)' },
    U20: { maxAge: 19, label: 'U20 (Juniors)' },
    U23: { maxAge: 22, label: 'U23 (Espoirs)' },
    ELITE: { maxAge: 100, label: 'Elite' }
};

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

/**
 * Quality Benchmarks (Target values for Radar Chart)
 * Defined by Category and Gender.
 * Revised for National/Regional Elite levels.
 */
export const QUALITY_BENCHMARKS = {
  M: {
    ELITE: { tau: 0.90, vmax: 11.6, pmax: 28, endurance: 1.10, reactivity: 15 },
    U23:   { tau: 0.94, vmax: 11.2, pmax: 25, endurance: 1.12, reactivity: 14 },
    U20:   { tau: 0.98, vmax: 10.8, pmax: 22, endurance: 1.14, reactivity: 12 },
    U18:   { tau: 1.05, vmax: 10.2, pmax: 19, endurance: 1.18, reactivity: 10 },
    U16:   { tau: 1.15, vmax: 9.2,  pmax: 15, endurance: 1.22, reactivity: 8 }
  },
  F: {
    ELITE: { tau: 0.96, vmax: 10.6, pmax: 23, endurance: 1.12, reactivity: 13 },
    U23:   { tau: 1.00, vmax: 10.2, pmax: 20, endurance: 1.14, reactivity: 12 },
    U20:   { tau: 1.05, vmax: 9.8,  pmax: 18, endurance: 1.16, reactivity: 11 },
    U18:   { tau: 1.10, vmax: 9.2,  pmax: 15, endurance: 1.20, reactivity: 9 },
    U16:   { tau: 1.20, vmax: 8.4,  pmax: 12, endurance: 1.24, reactivity: 7 }
  }
};
