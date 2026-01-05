/**
 * ExportService
 * Gère l'export et l'import des données (Fichiers et URL).
 */
import { Athlete } from '../models/Athlete.js';
import { Race } from '../models/Race.js';
import { StorageManager } from '../models/StorageManager.js';

export class ExportService {
    /**
     * Exporte un athlète et toutes ses courses dans un fichier JSON
     */
    static exportAthlete(athleteId) {
        const athlete = Athlete.load(athleteId);
        if (!athlete) return;

        const races = Race.getByAthlete(athleteId);
        
        const exportData = {
            type: 'sprint-predictor-athlete',
            version: 1,
            exportDate: new Date().toISOString(),
            athlete: athlete,
            races: races
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `athlete_${athlete.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    /**
     * Exporte toute la base de données dans un fichier JSON
     */
    static exportGlobalBackup() {
        const db = StorageManager.getDB();
        
        const exportData = {
            type: 'sprint_predictor_export',
            version: 1,
            scope: 'all',
            exportDate: new Date().toISOString(),
            db: db
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `sprint_predictor_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    /**
     * Importe des données depuis un texte JSON
     */
    static async importData(jsonText) {
        try {
            const data = JSON.parse(jsonText);
            
            if (data.type === 'sprint-predictor-athlete') {
                return this.importAthletePackage(data);
            } else if (data.type === 'sprint_predictor_export') {
                return this.importGlobalBackup(data);
            } else if (data.type === 'sprint-predictor-race') {
                return this.importSingleRace(data);
            }
            
            throw new Error('Format de fichier non reconnu');
        } catch (e) {
            console.error('Erreur import:', e);
            throw e;
        }
    }

    static importGlobalBackup(data) {
        if (data.scope === 'all' && data.db) {
            const currentDB = StorageManager.getDB();
            const incomingDB = data.db;

            // Fusion intelligente des athlètes
            const mergedAthletes = { ...currentDB.athletes, ...incomingDB.athletes };
            
            // Fusion intelligente des courses
            const mergedRaces = { ...currentDB.races, ...incomingDB.races };

            const finalDB = {
                ...incomingDB, // Garde la version et autres méta du fichier
                athletes: mergedAthletes,
                races: mergedRaces,
                lastUpdated: new Date().toISOString()
            };

            StorageManager.saveDB(finalDB);
            return { type: 'global', count: Object.keys(incomingDB.athletes || {}).length };
        }
        throw new Error("Contenu de sauvegarde invalide");
    }

    static importAthletePackage(data) {
        const { athlete, races } = data;
        
        // On sauvegarde l'athlète
        const newAthlete = new Athlete(athlete);
        newAthlete.save();
        
        // On sauvegarde les courses
        races.forEach(raceData => {
            const newRace = new Race(raceData);
            newRace.save();
        });
        
        return { type: 'athlete', athleteId: newAthlete.id, count: races.length };
    }

    /**
     * Génère un lien de partage pour une seule course
     * Utilise une compression rudimentaire des clés pour économiser l'URL
     */
    static generateShareLink(raceId) {
        const race = Race.load(raceId);
        if (!race) return null;

        const athlete = Athlete.load(race.athleteId);
        
        // On crée un objet compact
        const compact = {
            t: 'spr', // type: sprint-predictor-race
            v: 1,
            a: athlete ? { n: athlete.name, g: athlete.gender, b: athlete.birthYear } : null,
            r: {
                id: race.id,
                d: race.discipline,
                da: race.date,
                n: race.name,
                m: race.milestones.map(m => [m.distance, m.time, m.type === 'split' ? 0 : 1]), // 0=split, 1=touchdown
                s: race.stepCounts,
                no: race.note
            }
        };

        const json = JSON.stringify(compact);
        const encoded = btoa(unescape(encodeURIComponent(json)));
        
        const url = new URL(window.location.origin + window.location.pathname);
        url.hash = `#/import?data=${encoded}`;
        
        return url.toString();
    }

    /**
     * Génère un lien de partage pour un athlète complet (attention à la taille !)
     */
    static generateAthleteShareLink(athleteId) {
        const athlete = Athlete.load(athleteId);
        if (!athlete) return null;

        const races = Race.getByAthlete(athleteId);
        
        // On limite aux 3 dernières courses pour éviter d'exploser l'URL
        const limitedRaces = races.slice(0, 3);

        const compact = {
            t: 'spa', // type: sprint-predictor-athlete
            v: 1,
            a: { id: athlete.id, n: athlete.name, g: athlete.gender, b: athlete.birthYear, no: athlete.notes, m: athlete.metrics },
            rs: limitedRaces.map(r => ({
                id: r.id,
                d: r.discipline,
                da: r.date,
                n: r.name,
                m: r.milestones.map(m => [m.distance, m.time, m.type === 'split' ? 0 : 1]),
                s: r.stepCounts
            }))
        };

        const json = JSON.stringify(compact);
        const encoded = btoa(unescape(encodeURIComponent(json)));
        
        const url = new URL(window.location.origin + window.location.pathname);
        url.hash = `#/import?data=${encoded}`;
        
        return {
            url: url.toString(),
            count: races.length,
            isLimited: races.length > 3
        };
    }

    /**
     * Décode les données depuis l'URL
     */
    static decodeShareData(encoded) {
        try {
            const json = decodeURIComponent(escape(atob(encoded)));
            const data = JSON.parse(json);
            
            if (data.t === 'spr') {
                return this.parseCompactRace(data);
            } else if (data.t === 'spa') {
                return this.parseCompactAthlete(data);
            }
        } catch (e) {
            console.error('Erreur décodage URL:', e);
        }
        return null;
    }

    static parseCompactRace(data) {
        const raceData = {
            id: data.r.id || crypto.randomUUID(),
            discipline: data.r.d,
            date: data.r.da,
            name: data.r.n,
            note: data.r.no,
            milestones: data.r.m.map(m => ({
                distance: m[0],
                time: m[1],
                type: m[2] === 0 ? 'split' : 'touchdown',
                label: `${m[0]}m`
            })),
            stepCounts: data.r.s
        };
        
        return {
            type: 'race',
            athlete: data.a ? { name: data.a.n, gender: data.a.g, birthYear: data.a.b } : null,
            race: raceData
        };
    }

    static parseCompactAthlete(data) {
        return {
            type: 'athlete',
            athlete: {
                id: data.a.id,
                name: data.a.n,
                gender: data.a.g,
                birthYear: data.a.b,
                notes: data.a.no,
                metrics: data.a.m
            },
            races: data.rs.map(r => ({
                id: r.id,
                discipline: r.d,
                date: r.da,
                name: r.n,
                milestones: r.m.map(m => ({
                    distance: m[0],
                    time: m[1],
                    type: m[2] === 0 ? 'split' : 'touchdown',
                    label: `${m[0]}m`
                })),
                stepCounts: r.s
            }))
        };
    }
}
