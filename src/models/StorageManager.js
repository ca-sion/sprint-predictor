/**
 * StorageManager
 * Gère la persistance centrale des données dans LocalStorage.
 */
import { SyncService } from '../services/SyncService.js';

const STORAGE_KEY = 'sprint_predictor_db';
const OLD_ATHLETES_KEY = 'sprint_predictor_athletes';
const OLD_RACES_KEY = 'sprint_predictor_races';

export class StorageManager {
    static getDB() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return this.initializeDB();
        }
        return JSON.parse(raw);
    }

    static saveDB(db) {
        db.lastUpdated = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
        window.dispatchEvent(new CustomEvent('db-updated'));
        
        // Synchro Local-First
        SyncService.saveToDisk(db);
    }

    static initializeDB() {
        // Tentative de migration si les anciennes clés existent
        const oldAthletes = JSON.parse(localStorage.getItem(OLD_ATHLETES_KEY) || '{}');
        const oldRaces = JSON.parse(localStorage.getItem(OLD_RACES_KEY) || '[]');

        const db = {
            version: 1,
            lastUpdated: new Date().toISOString(),
            athletes: oldAthletes,
            races: {}
        };

        // Conversion du tableau de courses en objet indexé
        oldRaces.forEach(race => {
            db.races[race.id] = race;
        });

        this.saveDB(db);
        
        return db;
    }

    static getAthletes() {
        return this.getDB().athletes || {};
    }

    static getRaces() {
        return this.getDB().races || {};
    }

    static saveAthlete(athleteData) {
        const db = this.getDB();
        db.athletes[athleteData.id] = athleteData;
        this.saveDB(db);
    }

    static saveRace(raceData) {
        const db = this.getDB();
        db.races[raceData.id] = raceData;
        this.saveDB(db);
    }

    static deleteAthlete(id) {
        const db = this.getDB();
        delete db.athletes[id];
        // Nettoyage optionnel des courses orphelines
        Object.keys(db.races).forEach(raceId => {
            if (db.races[raceId].athleteId === id) {
                delete db.races[raceId];
            }
        });
        this.saveDB(db);
    }

    static deleteRace(id) {
        const db = this.getDB();
        delete db.races[id];
        this.saveDB(db);
    }

    static setCurrentAthlete(id) {
        if (id) {
            localStorage.setItem('sprint_predictor_current_athlete', id);
        } else {
            localStorage.removeItem('sprint_predictor_current_athlete');
        }
        window.dispatchEvent(new CustomEvent('athlete-updated'));
    }

    static getCurrentAthleteId() {
        return localStorage.getItem('sprint_predictor_current_athlete');
    }
}
