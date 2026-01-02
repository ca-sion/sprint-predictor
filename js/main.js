/**
 * Main Application Entry Point
 */

import { Athlete } from './models/Athlete.js';
import { PredictionEngine } from './models/PredictionEngine.js';
import { Forms } from './ui/Forms.js';
import { Dashboard } from './ui/Dashboard.js';

class App {
    constructor() {
        this.athlete = new Athlete();
        this.engine = new PredictionEngine();
        this.dashboard = new Dashboard();
        
        // UI Components
        this.forms = new Forms('inputs-container', (key, value) => {
            this.athlete.setMetric(key, value);
            this.saveState();
        });

        // DOM Elements
        this.els = {
            name: document.getElementById('athlete-name'),
            year: document.getElementById('athlete-year'),
            gender: document.getElementById('athlete-gender'),
            btnCalculate: document.getElementById('btn-calculate'),
            btnNew: document.getElementById('btn-new-athlete'),
            btnLoad: document.getElementById('btn-load-athlete'),
            targetEvent: document.getElementById('target-event')
        };

        this.init();
    }

    init() {
        // Load last session if available
        const savedId = localStorage.getItem('casion_current_athlete');
        if (savedId) {
            const loaded = Athlete.load(savedId);
            if (loaded) this.athlete = loaded;
        }

        this.renderForms();
        this.bindEvents();
        this.updateHeader();
    }

    renderForms() {
        // Basic Info
        this.els.name.value = this.athlete.name;
        this.els.year.value = this.athlete.birthYear;
        this.els.gender.value = this.athlete.gender;

        // Metrics
        this.forms.render(this.athlete);
    }

    bindEvents() {
        // Basic Info Changes
        ['name', 'year', 'gender'].forEach(field => {
            this.els[field].addEventListener('change', (e) => {
                if (field === 'year') this.athlete.birthYear = parseInt(e.target.value);
                else if (field === 'gender') this.athlete.gender = e.target.value;
                else this.athlete.name = e.target.value;
                
                this.saveState();
                this.updateHeader();
            });
        });

        // Calculate
        this.els.btnCalculate.addEventListener('click', () => this.runAnalysis());
        
        // Target Event Change (Auto re-calc if results valid)
        this.els.targetEvent.addEventListener('change', () => {
             // Optional: Auto-calc on switch
             this.runAnalysis();
        });

        // New Athlete
        this.els.btnNew.addEventListener('click', () => {
            if(confirm('Créer un nouveau profil ? Les données actuelles sont sauvegardées.')) {
                this.athlete = new Athlete();
                localStorage.removeItem('casion_current_athlete');
                this.renderForms();
                this.updateHeader();
                document.getElementById('result-hero').classList.add('hidden');
                document.getElementById('result-placeholder').classList.remove('hidden');
                document.getElementById('analysis-grid').classList.add('hidden');
            }
        });
        
        // Load Athlete (Simple prompt for now)
        this.els.btnLoad.addEventListener('click', () => {
             const all = Athlete.getAll();
             const ids = Object.keys(all);
             if (ids.length === 0) {
                 alert("Aucun athlète sauvegardé.");
                 return;
             }
             
             // Simple selector logic (could be improved with a modal)
             const names = ids.map(id => `${all[id].name || 'Sans nom'} (${id.substr(0,4)})`).join('\n');
             const nameToFind = prompt(`Entrez le nom de l'athlète à charger:\n${names}`);
             
             if (nameToFind) {
                 const foundId = ids.find(id => (all[id].name || '').toLowerCase() === nameToFind.toLowerCase());
                 if (foundId) {
                     this.athlete = new Athlete(all[foundId]);
                     this.renderForms();
                     this.updateHeader();
                     this.saveState(); // Set as current
                 }
             }
        });
    }

    saveState() {
        this.athlete.save();
        localStorage.setItem('casion_current_athlete', this.athlete.id);
    }

    updateHeader() {
        this.dashboard.updateHeader(this.athlete);
    }

    runAnalysis() {
        this.els.btnCalculate.textContent = "Calcul en cours...";
        this.els.btnCalculate.classList.add('opacity-75');
        
        // Small timeout to allow UI to update (spinner effect)
        setTimeout(() => {
            try {
                const target = this.els.targetEvent.value;
                const prediction = this.engine.predict(this.athlete, target);
                
                // Generate specific advice based on the profile
                const analysis = this.engine.generateAdvice(prediction.profile, this.athlete.metrics, this.athlete);
                
                this.dashboard.showResults(prediction, analysis, this.athlete);
            } catch (e) {
                console.error(e);
                alert("Erreur lors du calcul. Vérifiez les données d'entrée.");
            } finally {
                this.els.btnCalculate.textContent = "Lancer l'Analyse";
                this.els.btnCalculate.classList.remove('opacity-75');
            }
        }, 100);
    }
}

// Start
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
