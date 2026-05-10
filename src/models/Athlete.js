/**
 * @file Athlete.js
 * @description Modèle Athlete pour la gestion des données des athlètes.
 */
import { StorageManager } from './StorageManager.js';

/**
 * Classe représentant un athlète.
 */
export class Athlete {
  /**
   * Crée une instance d'Athlète.
   * @param {Object} data - Données initiales de l'athlète.
   */
  constructor(data = {}) {
    this.id = data.id || crypto.randomUUID();
    this.name = data.name || '';
    this.birthYear = data.birthYear || new Date().getFullYear() - 20;
    this.gender = data.gender || 'M';
    this.metrics = data.metrics || {};
    this.history = data.history || [];
    this.notes = data.notes || '';
    this.lastUpdated = data.lastUpdated || new Date().toISOString();

    // Rétrocompatibilité : si des métriques existent mais pas d'historique, on crée un premier snapshot
    if (this.history.length === 0 && Object.keys(this.metrics).length > 0) {
      this.history.push({
        date: this.lastUpdated.split('T')[0],
        metrics: { ...this.metrics }
      });
    }

    // Réparation & Cohérence : on s'assure que this.metrics est bien la fusion
    // de tout l'historique au chargement de l'athlète.
    if (this.history.length > 0) {
      this.recomputeLatestMetrics();
    }
  }

  /**
   * Calcule l'âge de l'athlète basé sur l'année en cours.
   * @returns {number} L'âge calculé.
   */
  get age() {
    const currentYear = new Date().getFullYear();
    return currentYear - this.birthYear;
  }

  /**
   * Détermine la catégorie d'âge de l'athlète.
   * @returns {string} Le libellé de la catégorie.
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
   * Définit une métrique spécifique pour l'athlète.
   * @param {string} key - Identifiant de la métrique.
   * @param {string|number|null} value - Valeur de la métrique.
   */
  setMetric(key, value) {
    if (value === '' || value === null || value === undefined) {
      delete this.metrics[key];
    } else {
      this.metrics[key] = parseFloat(value);
    }
    this.lastUpdated = new Date().toISOString();
  }

  /**
   * Récupère la valeur d'une métrique.
   * @param {string} key - Identifiant de la métrique.
   * @returns {number|undefined} La valeur de la métrique.
   */
  getMetric(key) {
    return this.metrics[key];
  }

  /**
   * Sauvegarde les données de l'athlète via le StorageManager.
   * @param {boolean} autoSnapshot - Si true, crée un snapshot automatique pour la date du jour.
   */
  save(autoSnapshot = true) {
    this.lastUpdated = new Date().toISOString();
    
    if (autoSnapshot) {
      // Gestion de l'historique : on met à jour ou on crée le snapshot du jour
      const today = this.lastUpdated.split('T')[0];
      const todayIndex = this.history.findIndex(h => h.date === today);
      
      // On clone les métriques pour éviter les références
      const metricsSnapshot = JSON.parse(JSON.stringify(this.metrics));

      if (todayIndex >= 0) {
        this.history[todayIndex].metrics = metricsSnapshot;
      } else {
        // On n'ajoute pas un snapshot vide si l'athlète vient d'être créé sans métriques
        if (Object.keys(metricsSnapshot).length > 0) {
          this.history.push({
            date: today,
            metrics: metricsSnapshot
          });
          // S'assurer que l'historique reste trié par date croissante
          this.history.sort((a, b) => new Date(a.date) - new Date(b.date));
        }
      }
    }

    StorageManager.saveAthlete({
      id: this.id,
      name: this.name,
      birthYear: this.birthYear,
      gender: this.gender,
      metrics: this.metrics,
      history: this.history,
      notes: this.notes,
      lastUpdated: this.lastUpdated,
    });
  }

  /**
   * Ajoute ou met à jour une session historique à une date précise.
   * @param {string} date - La date (YYYY-MM-DD).
   * @param {Object} metricsObj - Les métriques de cette session.
   */
  updateHistory(date, metricsObj) {
    const index = this.history.findIndex(h => h.date === date);
    const metricsSnapshot = JSON.parse(JSON.stringify(metricsObj));
    
    // Nettoyer les valeurs vides
    Object.keys(metricsSnapshot).forEach(key => {
      if (metricsSnapshot[key] === null || metricsSnapshot[key] === '') {
        delete metricsSnapshot[key];
      }
    });

    if (index >= 0) {
      this.history[index].metrics = metricsSnapshot;
    } else {
      this.history.push({ date, metrics: metricsSnapshot });
    }

    // Garder l'historique trié par date (du plus ancien au plus récent)
    this.history.sort((a, b) => new Date(a.date) - new Date(b.date));

    // On recalcule les métriques actuelles pour toujours avoir la dernière valeur connue de CHAQUE test
    this.recomputeLatestMetrics();

    this.save(false);
  }

  /**
   * Recalcule this.metrics en fusionnant tout l'historique chronologiquement.
   * Ainsi, la page principale dispose toujours de la dernière valeur enregistrée pour chaque métrique,
   * et cela répare les données si elles étaient corrompues.
   */
  recomputeLatestMetrics() {
    const merged = {};
    const sortedHistory = [...this.history].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    for (const session of sortedHistory) {
      Object.assign(merged, session.metrics);
    }
    
    // Préserver la réactivité de Vue :
    // 1. On supprime les clés obsolètes
    for (const key of Object.keys(this.metrics)) {
      if (!(key in merged)) {
        delete this.metrics[key];
      }
    }
    // 2. On assigne les nouvelles valeurs
    for (const key of Object.keys(merged)) {
      this.metrics[key] = merged[key];
    }
  }

  /**
   * Supprime une session de l'historique.
   * @param {string} date - La date de la session à supprimer.
   */
  deleteHistory(date) {
    this.history = this.history.filter(h => h.date !== date);
    
    // On recalcule les métriques globales
    this.recomputeLatestMetrics();
    
    this.save(false);
  }

  /**
   * Charge un athlète par son identifiant.
   * @param {string} id - L'identifiant de l'athlète.
   * @returns {Athlete|null} L'instance de l'athlète ou null.
   */
  static load(id) {
    const athletes = StorageManager.getAthletes();
    if (athletes[id]) {
      return new Athlete(athletes[id]);
    }
    return null;
  }

  /**
   * Récupère tous les athlètes stockés.
   * @returns {Object} Un dictionnaire des athlètes.
   */
  static getAll() {
    return StorageManager.getAthletes();
  }

  /**
   * Supprime un athlète par son identifiant.
   * @param {string} id - L'identifiant de l'athlète à supprimer.
   */
  static delete(id) {
    StorageManager.deleteAthlete(id);
  }
}