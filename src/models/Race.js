/**
 * Race Model
 * Handles individual race analysis data, milestones, and metrics.
 */
import { StorageManager } from './StorageManager.js';

export class Race {
    constructor(data = {}) {
        this.id = data.id || crypto.randomUUID();
        this.athleteId = data.athleteId || null;
        this.discipline = data.discipline || '100m';
        this.date = data.date || new Date().toISOString().split('T')[0];
        this.name = data.name || '';
        this.note = data.note || '';
        
        // Milestones: { distance: number, time: number, type: 'split'|'touchdown'|'takeoff', label: string }
        this.milestones = data.milestones || [];
        
        // stepCounts: { "0-30": 15, "30-60": 12 }
        this.stepCounts = data.stepCounts || {};
        
        // Steps: { segment: string, count: number, leadLeg: 'L'|'R'|null } (mostly for 400m/400mH)
        this.steps = data.steps || [];
        
        // Video reference
        this.videoUrl = data.videoUrl || '';
        
        this.lastUpdated = data.lastUpdated || new Date().toISOString();
    }

    /**
     * Add or update a milestone
     */
    setMilestone(distance, time, type = 'split', label = null) {
        const index = this.milestones.findIndex(m => m.distance === distance && m.type === type);
        const milestone = {
            distance: parseFloat(distance),
            time: parseFloat(time),
            type,
            label: label || `${distance}m`
        };

        if (index !== -1) {
            this.milestones[index] = milestone;
        } else {
            this.milestones.push(milestone);
            // Sort by time/distance
            this.milestones.sort((a, b) => a.time - b.time);
        }
        this.lastUpdated = new Date().toISOString();
    }

    /**
     * Remove a milestone
     */
    removeMilestone(distance, type) {
        this.milestones = this.milestones.filter(m => !(m.distance === distance && m.type === type));
        this.lastUpdated = new Date().toISOString();
    }

    /**
     * Calculate comprehensive metrics for segments
     */
    get segmentSpeeds() {
        const results = [];
        // Filter for both standard splits AND hurdle touchdowns to have a complete view
        const sortedMilestones = [...this.milestones]
            .filter(m => m.type === 'split' || m.type === 'touchdown')
            .sort((a, b) => a.distance - b.distance);
        
        // Add 0m if not present
        const points = sortedMilestones[0]?.distance > 0 
            ? [{ distance: 0, time: 0 }, ...sortedMilestones]
            : sortedMilestones;

        for (let i = 1; i < points.length; i++) {
            const d = points[i].distance - points[i-1].distance;
            const t = points[i].time - points[i-1].time;
            const segmentId = `${points[i-1].distance}-${points[i].distance}`;
            
            if (t > 0) {
                const steps = this.stepCounts[segmentId] || 0;
                results.push({
                    id: segmentId,
                    segment: `${points[i-1].distance}-${points[i].distance}m`,
                    label: points[i].label,
                    speed: d / t, // m/s
                    time: t,
                    distance: d,
                    steps: steps,
                    frequency: steps > 0 ? steps / t : 0, // steps/sec
                    stepLength: steps > 0 ? d / steps : 0 // meters
                });
            }
        }
        return results;
    }

    /**
     * Specialized analysis for hurdle races
     */
    get hurdleAnalysis() {
        const results = [];
        const isHurdle = this.discipline.toLowerCase().includes('h');
        if (!isHurdle) return [];

        const touchdowns = this.milestones.filter(m => m.type === 'touchdown').sort((a, b) => a.distance - b.distance);
        const start = this.milestones.find(m => m.distance === 0) || { distance: 0, time: 0 };
        
        // Find finish milestone - use the distance corresponding to the discipline name
        const raceDist = parseInt(this.discipline);
        const finish = this.milestones.find(m => m.distance === raceDist);

        // 1. Start to H1
        if (touchdowns.length > 0) {
            const h1 = touchdowns[0];
            const t = h1.time - start.time;
            const d = h1.distance - start.distance;
            results.push({
                label: 'Start - H1',
                time: t,
                distance: d,
                distance_start: 0,
                distance_end: h1.distance,
                speed: d / t,
                steps: this.stepCounts[`0-${h1.distance}`] || 0
            });
        }

        // 2. Inter-hurdles
        for (let i = 1; i < touchdowns.length; i++) {
            const m1 = touchdowns[i-1];
            const m2 = touchdowns[i];
            const t = m2.time - m1.time;
            const d = m2.distance - m1.distance;
            const segmentId = `${m1.distance}-${m2.distance}`;
            
            results.push({
                label: `H${i} - H${i+1}`,
                time: t,
                distance: d,
                distance_start: m1.distance,
                distance_end: m2.distance,
                speed: d / t,
                steps: this.stepCounts[segmentId] || 0
            });
        }

        // 3. Last H to Finish
        if (touchdowns.length > 0 && finish) {
            const lastH = touchdowns[touchdowns.length - 1];
            if (finish.distance > lastH.distance) {
                const t = finish.time - lastH.time;
                const d = finish.distance - lastH.distance;
                results.push({
                    label: `H${touchdowns.length} - Finish`,
                    time: t,
                    distance: d,
                    distance_start: lastH.distance,
                    distance_end: finish.distance,
                    speed: d / t,
                    steps: this.stepCounts[`${lastH.distance}-${finish.distance}`] || 0
                });
            }
        }

        return results;
    }

    /**
     * Calculate custom intervals based on a template
     * @param {Array} template - Array of { label, start, end }
     */
    calculateIntervals(template = []) {
        if (!template) return [];
        
        return template.map(item => {
            const mStart = this.milestones.find(m => m.distance === item.start);
            const mEnd = this.milestones.find(m => m.distance === item.end);
            
            if (!mStart || !mEnd || mEnd.time <= mStart.time) return null;
            
            const time = mEnd.time - mStart.time;
            const distance = mEnd.distance - mStart.distance;
            const speed = distance / time;
            
            // Calculate total steps for this range by summing primitive segments
            let totalSteps = 0;
            let stepsFound = false;
            
            // Logic: we look at all primitive segments that fit within [start, end]
            const primitives = this.segmentSpeeds;
            primitives.forEach(p => {
                const [pStart, pEnd] = p.id.split('-').map(Number);
                if (pStart >= item.start && pEnd <= item.end) {
                    if (p.steps > 0) {
                        totalSteps += p.steps;
                        stepsFound = true;
                    }
                }
            });

            return {
                ...item,
                time,
                distance,
                speed,
                steps: stepsFound ? totalSteps : 0,
                frequency: (stepsFound && time > 0) ? totalSteps / time : 0,
                stepLength: (stepsFound && totalSteps > 0) ? distance / totalSteps : 0
            };
        }).filter(res => res !== null);
    }

    /**
     * Save to LocalStorage via StorageManager
     */
    save() {
        this.lastUpdated = new Date().toISOString();
        StorageManager.saveRace({
            id: this.id,
            athleteId: this.athleteId,
            discipline: this.discipline,
            date: this.date,
            name: this.name,
            note: this.note,
            milestones: this.milestones,
            stepCounts: this.stepCounts,
            steps: this.steps,
            videoUrl: this.videoUrl,
            lastUpdated: this.lastUpdated
        });
    }

    /**
     * Delete from LocalStorage via StorageManager
     */
    delete() {
        StorageManager.deleteRace(this.id);
    }

    /**
     * Load all races for an athlete
     */
    static getByAthlete(athleteId) {
        const racesMap = StorageManager.getRaces();
        return Object.values(racesMap)
            .filter(r => r.athleteId === athleteId)
            .map(r => new Race(r))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    /**
     * Load a single race
     */
    static load(id) {
        const racesMap = StorageManager.getRaces();
        const data = racesMap[id];
        return data ? new Race(data) : null;
    }
}