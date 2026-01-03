/**
 * Race Model
 * Handles individual race analysis data, milestones, and metrics.
 */

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
        const sortedMilestones = [...this.milestones].filter(m => m.type === 'split').sort((a, b) => a.distance - b.distance);
        
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
     * Save to LocalStorage
     */
    save() {
        const races = JSON.parse(localStorage.getItem('sprint_predictor_races') || '[]');
        const index = races.findIndex(r => r.id === this.id);
        
        const raceData = {
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
        };

        if (index !== -1) {
            races[index] = raceData;
        } else {
            races.push(raceData);
        }
        
        localStorage.setItem('sprint_predictor_races', JSON.stringify(races));
    }

    /**
     * Delete from LocalStorage
     */
    delete() {
        let races = JSON.parse(localStorage.getItem('sprint_predictor_races') || '[]');
        races = races.filter(r => r.id !== this.id);
        localStorage.setItem('sprint_predictor_races', JSON.stringify(races));
    }

    /**
     * Load all races for an athlete
     */
    static getByAthlete(athleteId) {
        const races = JSON.parse(localStorage.getItem('sprint_predictor_races') || '[]');
        return races
            .filter(r => r.athleteId === athleteId)
            .map(r => new Race(r))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    /**
     * Load a single race
     */
    static load(id) {
        const races = JSON.parse(localStorage.getItem('sprint_predictor_races') || '[]');
        const data = races.find(r => r.id === id);
        return data ? new Race(data) : null;
    }
}