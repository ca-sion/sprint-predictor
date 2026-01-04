/**
 * Physics Service
 * Centralizes all athletic and biomechanical calculations.
 */
export class PhysicsService {
    
    /**
     * Calculates the Anaerobic Speed Reserve (ASR) / Fatigue Index
     */
    static calculateFatigueIndex(metrics) {
        if (!metrics.test_30m_fly) return 0;
        
        let tLong = metrics.test_120m || metrics.test_80m || metrics.test_60m || 0;
        let dLong = metrics.test_120m ? 120 : metrics.test_80m ? 80 : metrics.test_60m ? 60 : 0;
        
        return (tLong > 0) ? (30 / metrics.test_30m_fly) / (dLong / tLong) : 0;
    }

    /**
     * Calculates the Stretch-Shortening Cycle (SSC) efficiency index (Prestige)
     */
    static calculatePrestigeIndex(metrics) {
        if (!metrics.cmj_height || !metrics.sj_height) return 0;
        return ((metrics.cmj_height - metrics.sj_height) / metrics.sj_height) * 100;
    }

    /**
     * Calculates relative horizontal force (F0) from Vmax and Tau
     */
    static calculateF0(vmax, tau) {
        return vmax / tau;
    }

    /**
     * Calculates relative maximal power (Pmax)
     */
    static calculatePmax(vmax, tau) {
        const f0 = this.calculateF0(vmax, tau);
        return (f0 * vmax) / 4;
    }
}
