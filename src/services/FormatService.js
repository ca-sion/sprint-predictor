/**
 * Format Service
 * Centralizes all UI formatting for consistency.
 */
export class FormatService {
    
    /**
     * Format a duration in seconds
     */
    static time(val, decimals = 2) {
        if (val === undefined || val === null || val === 0) return '-';
        return val.toFixed(decimals) + 's';
    }

    /**
     * Format velocity in m/s
     */
    static speed(val, decimals = 2) {
        if (val === undefined || val === null || val === 0) return '-';
        return val.toFixed(decimals) + ' m/s';
    }

    /**
     * Format frequency in Hz
     */
    static frequency(val, decimals = 2) {
        if (val === undefined || val === null || val === 0) return '-';
        return val.toFixed(decimals) + ' Hz';
    }

    /**
     * Format step length in meters
     */
    static distance(val, decimals = 2) {
        if (val === undefined || val === null || val === 0) return '-';
        return val.toFixed(decimals) + ' m';
    }

    /**
     * Format delta/diff values (+0.10s, -0.05s)
     */
    static diff(val, decimals = 2) {
        if (val === undefined || val === null || val === 0) return '0.00';
        const sign = val > 0 ? '+' : '';
        return sign + val.toFixed(decimals);
    }

    /**
     * Clean numeric value for generic display
     */
    static number(val, decimals = 2) {
        if (val === undefined || val === null || val === 0) return '-';
        return val.toFixed(decimals);
    }
}
