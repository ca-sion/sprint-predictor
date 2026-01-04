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
            if (typeof s.start === 'number') points.add(s.start); 
            if (typeof s.end === 'number') points.add(s.end); 
        });
        
        const sortedPoints = Array.from(points).filter(p => p !== null && !isNaN(p)).sort((a, b) => a - b);
        const atomic = [];
        const discipline = DISCIPLINES[disciplineId];
        const maxDist = discipline?.distance || sortedPoints[sortedPoints.length - 1];

        for (let i = 1; i < sortedPoints.length; i++) {
            const start = sortedPoints[i-1];
            const end = sortedPoints[i];
            if (end > maxDist) continue;
            if (Math.abs(end - start) < 0.01) continue; // Avoid zero-length segments
            atomic.push({ start, end, label: `${start}-${end}m` });
        }

        // Final safety: ensure we reach the finish line
        const lastPoint = sortedPoints[sortedPoints.length - 1];
        if (lastPoint < maxDist) {
            atomic.push({ start: lastPoint, end: maxDist, label: `${lastPoint}-${maxDist}m` });
        }

        return atomic;
    }

    /**
     * Calculate Virtual Best (VB) total time and segment data
     */
    static calculateVirtualBest(races, segmentsTemplate, metric = 'speed') {
        if (!races || races.length === 0) return null;

        // 1. Calculate TRUE Virtual Best total time
        // We use the most granular segments available (atomic) to avoid overlapping
        const disciplineId = races[0].discipline;
        const atomicTemplate = this.getAtomicSegments(disciplineId, segmentsTemplate);
        
        let totalTime = 0;
        let isTotalTimeComplete = true;

        atomicTemplate.forEach(atomicSeg => {
            const bestSegmentTime = Math.min(...races.map(race => {
                const raceInstance = race instanceof Race ? race : new Race(race);
                const result = raceInstance.calculateIntervals([atomicSeg])[0];
                return (result && result.time > 0) ? result.time : 999;
            }));

            if (bestSegmentTime === 999) isTotalTimeComplete = false;
            else totalTime += bestSegmentTime;
        });

        // 2. Best values for each segment in the provided template (for UI display)
        const isHigherBetter = metric !== 'time';
        const segments = segmentsTemplate.map(t => {
            const allValues = races.map(race => {
                const raceInstance = race instanceof Race ? race : new Race(race);
                const calculated = raceInstance.calculateIntervals([t]);
                return calculated[0] ? calculated[0][metric] : null;
            }).filter(v => v !== null && v > 0);

            if (allValues.length === 0) return null; // Return null if no data
            return isHigherBetter ? Math.max(...allValues) : Math.min(...allValues);
        });

        return { 
            totalTime: isTotalTimeComplete ? totalTime : 0, 
            segments 
        };
    }

    /**
     * Project Prediction Engine results onto specific segments
     */
    static projectPredictionToSegments(prediction, segmentsTemplate, metric = 'speed', engine) {
        if (!prediction || !prediction.profile) return null;
        
        const { vmax, tau, rt } = prediction.profile;
        const scaleFactor = prediction.scaleFactor || 1.0;
        
        const segments = segmentsTemplate.map(t => {
            const tStartRaw = engine.calculateTimeAtDistance(t.start, vmax, tau);
            const tEndRaw = engine.calculateTimeAtDistance(t.end, vmax, tau);
            
            let segmentTime = (tEndRaw - tStartRaw) * scaleFactor;
            if (t.start === 0) segmentTime += (rt * scaleFactor);

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
