/**
 * Race Service
 * Handles multi-race analysis, virtual records, and theoretical vs reality comparisons.
 */
import { Race } from '../models/Race.js';
import { DISCIPLINES } from '../data/definitions/Disciplines.js';

export class RaceService {
    
    /**
     * Generate non-overlapping atomic segments for a discipline
     * Useful for consistent timeline displays.
     */
    static getAtomicSegments(disciplineId, analysisTemplate = []) {
        const points = new Set([0]);
        analysisTemplate.forEach(s => { 
            if (s.start !== null) points.add(s.start); 
            if (s.end !== null) points.add(s.end); 
        });
        
        const sortedPoints = Array.from(points).sort((a, b) => a - b);
        const atomic = [];
        const maxDist = DISCIPLINES[disciplineId]?.distance || sortedPoints[sortedPoints.length - 1];

        for (let i = 1; i < sortedPoints.length; i++) {
            const start = sortedPoints[i-1];
            const end = sortedPoints[i];
            if (end > maxDist) continue;
            atomic.push({ start, end, label: `${end}m` });
        }
        return atomic;
    }

    /**
     * Calculate Virtual Best (VB) total time and segment data
     */
    static calculateVirtualBest(races, segmentsTemplate, metric = 'speed') {
        if (!races || races.length === 0) return null;

        // 1. TRUE Virtual Best total time (using primitive non-overlapping segments)
        const primitiveBestTimes = new Map();
        races.forEach(race => {
            const raceInstance = race instanceof Race ? race : new Race(race);
            raceInstance.segmentSpeeds.forEach(seg => {
                const currentBest = primitiveBestTimes.get(seg.id) || 999;
                if (seg.time > 0 && seg.time < currentBest) {
                    primitiveBestTimes.set(seg.id, seg.time);
                }
            });
        });
        const totalTime = Array.from(primitiveBestTimes.values()).reduce((a, b) => a + b, 0);

        // 2. Best values for each segment in the provided template
        const isHigherBetter = metric !== 'time';
        const segments = segmentsTemplate.map(t => {
            const allValues = races.map(race => {
                const raceInstance = race instanceof Race ? race : new Race(race);
                const calculated = raceInstance.calculateIntervals([t]);
                return calculated[0] ? calculated[0][metric] : null;
            }).filter(v => v !== null && v > 0);

            if (allValues.length === 0) return 0;
            return isHigherBetter ? Math.max(...allValues) : Math.min(...allValues);
        });

        return { totalTime, segments };
    }

    /**
     * Project Prediction Engine results onto specific segments
     */
    static projectPredictionToSegments(prediction, segmentsTemplate, metric = 'speed', engine) {
        if (!prediction || !prediction.profile) return null;
        
        const { vmax, tau } = prediction.profile;
        const scaleFactor = prediction.scaleFactor || 1.0;
        
        const segments = segmentsTemplate.map(t => {
            const tStartRaw = engine.calculateTimeAtDistance(t.start, vmax, tau);
            const tEndRaw = engine.calculateTimeAtDistance(t.end, vmax, tau);
            
            let segmentTime = (tEndRaw - tStartRaw) * scaleFactor;
            if (t.start === 0) segmentTime += (engine.CONSTANTS.REACTION_TIME * scaleFactor);

            const segmentDist = t.end - t.start;
            
            if (metric === 'speed') return segmentDist / segmentTime;
            if (metric === 'time') return segmentTime;
            
            // For frequency and step length, average of splits in range
            const splitsInRange = prediction.splits.filter(s => s.distance > t.start && s.distance <= t.end);
            if (splitsInRange.length > 0) {
                return splitsInRange.reduce((acc, s) => acc + (s[metric] || 0), 0) / splitsInRange.length;
            }
            return 0;
        });

        return {
            totalTime: parseFloat(prediction.time),
            segments
        };
    }

    /**
     * Get race total time helper
     */
    static getRaceTotalTime(race) {
        if (!race) return 0;
        const raceInstance = race instanceof Race ? race : new Race(race);
        const dist = parseInt(race.discipline);
        const result = raceInstance.calculateIntervals([{ start: 0, end: dist }])[0];
        return result ? result.time : 0;
    }

    /**
     * Get the start offset (time of 0m milestone) for a race
     */
    static getStartOffset(race) {
        if (!race || !race.milestones) return 0;
        const startNode = race.milestones.find(m => m.distance === 0);
        return startNode ? startNode.time : 0;
    }

    /**
     * Format a raw time into race time (relative to start)
     */
    static formatRaceTime(rawTime, race) {
        const offset = this.getStartOffset(race);
        const time = rawTime - offset;
        return time < -0.001 ? '---' : time.toFixed(3) + 's';
    }
}
