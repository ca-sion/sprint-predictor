/**
 * Athlete Model
 * Handles data structure, storage, and retrieval.
 */

export class Athlete {
    constructor(data = {}) {
        this.id = data.id || crypto.randomUUID();
        this.name = data.name || '';
        this.birthYear = data.birthYear || new Date().getFullYear() - 20; // Default approx 20yo
        this.gender = data.gender || 'M';
        this.metrics = data.metrics || {}; // Stores all input values
        this.lastUpdated = data.lastUpdated || new Date().toISOString();
    }

    /**
     * Calculate age based on current year
     */
    get age() {
        const currentYear = new Date().getFullYear();
        return currentYear - this.birthYear;
    }

    /**
     * Get Age Category
     */
    get category() {
        const age = this.age;
        if (age < 16) return 'U16';
        if (age < 18) return 'U18';
        if (age < 20) return 'U20';
        if (age < 23) return 'U23';
        return 'ELITE';
    }

    /**
     * Set a specific metric value
     * @param {string} key - Input ID
     * @param {string|number} value - Input value
     */
    setMetric(key, value) {
        if (value === '' || value === null) {
            delete this.metrics[key];
        } else {
            this.metrics[key] = parseFloat(value);
        }
        this.lastUpdated = new Date().toISOString();
    }

    getMetric(key) {
        return this.metrics[key];
    }

    /**
     * Save to LocalStorage
     */
    save() {
        const athletes = JSON.parse(localStorage.getItem('casion_athletes') || '{}');
        athletes[this.id] = {
            id: this.id,
            name: this.name,
            birthYear: this.birthYear,
            gender: this.gender,
            metrics: this.metrics,
            lastUpdated: this.lastUpdated
        };
        localStorage.setItem('casion_athletes', JSON.stringify(athletes));
    }

    /**
     * Load from LocalStorage
     * @param {string} id 
     */
    static load(id) {
        const athletes = JSON.parse(localStorage.getItem('casion_athletes') || '{}');
        if (athletes[id]) {
            return new Athlete(athletes[id]);
        }
        return null;
    }

    static getAll() {
        return JSON.parse(localStorage.getItem('casion_athletes') || '{}');
    }
}
