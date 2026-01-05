/**
 * SyncService
 * Gère la synchronisation Local-First avec la File System Access API.
 */
import { get, set, del } from 'idb-keyval';
import { StorageManager } from '../models/StorageManager.js';

const HANDLE_KEY = 'sprint_predictor_file_handle';

export class SyncService {
    static isSupported() {
        return 'showOpenFilePicker' in window;
    }

    static async getHandle() {
        return await get(HANDLE_KEY);
    }

    static async setHandle(handle) {
        await set(HANDLE_KEY, handle);
        window.dispatchEvent(new CustomEvent('sync-status-changed'));
    }

    static async unlinkFile() {
        await del(HANDLE_KEY);
        window.dispatchEvent(new CustomEvent('sync-status-changed'));
    }

    /**
     * Vérifie si on a les permissions ou demande l'accès
     */
    static async verifyPermission(handle, withRequest = false) {
        if (!handle) return false;
        
        const options = { mode: 'readwrite' };
        try {
            if ((await handle.queryPermission(options)) === 'granted') {
                return true;
            }
            
            if (withRequest) {
                if ((await handle.requestPermission(options)) === 'granted') {
                    return true;
                }
            }
        } catch (e) {
            console.error('Erreur permission FSA:', e);
        }
        
        return false;
    }

    /**
     * Ouvre le sélecteur de fichier pour lier un nouveau fichier
     */
    static async linkFile() {
        if (!this.isSupported()) {
            alert("Votre navigateur ne supporte pas la File System Access API. Utilisez Chrome, Edge ou Opera.");
            return null;
        }

        try {
            const [handle] = await window.showOpenFilePicker({
                types: [{
                    description: 'Fichier JSON de données Sprint Predictor',
                    accept: { 'application/json': ['.json'] },
                }],
                multiple: false
            });
            
            await this.setHandle(handle);
            return handle;
        } catch (e) {
            console.error('Erreur liaison fichier:', e);
            return null;
        }
    }

    /**
     * Sauvegarde les données sur le disque
     */
    static async saveToDisk(db = null) {
        if (!this.isSupported()) return;

        const handle = await this.getHandle();
        if (!handle) return;

        if (!(await this.verifyPermission(handle))) {
            console.warn('Synchro impossible : Permission révoquée');
            window.dispatchEvent(new CustomEvent('sync-permission-required'));
            return;
        }

        try {
            window.dispatchEvent(new CustomEvent('sync-started'));
            const data = db || StorageManager.getDB();
            const writable = await handle.createWritable();
            
            // Formatage standardisé avec ExportService
            const exportData = {
                type: 'sprint_predictor_export',
                version: 1,
                scope: 'all',
                exportDate: new Date().toISOString(),
                db: data
            };

            await writable.write(JSON.stringify(exportData, null, 2));
            await writable.close();
            
            window.dispatchEvent(new CustomEvent('sync-finished', { detail: { success: true } }));
        } catch (e) {
            console.error('Erreur écriture disque:', e);
            window.dispatchEvent(new CustomEvent('sync-finished', { detail: { success: false, error: e.message } }));
        }
    }

    /**
     * Charge les données depuis le disque
     */
    static async loadFromDisk() {
        if (!this.isSupported()) return null;

        const handle = await this.getHandle();
        if (!handle) return null;

        if (!(await this.verifyPermission(handle, true))) {
            return null;
        }

        try {
            const file = await handle.getFile();
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (data.type === 'sprint_predictor_export' && data.db) {
                return data.db;
            }
        } catch (e) {
            console.error('Erreur lecture disque:', e);
        }
        return null;
    }
}
