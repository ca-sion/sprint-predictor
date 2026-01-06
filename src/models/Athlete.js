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
    this.notes = data.notes || '';
    this.lastUpdated = data.lastUpdated || new Date().toISOString();
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
   */
  save() {
    this.lastUpdated = new Date().toISOString();
    StorageManager.saveAthlete({
      id: this.id,
      name: this.name,
      birthYear: this.birthYear,
      gender: this.gender,
      metrics: this.metrics,
      notes: this.notes,
      lastUpdated: this.lastUpdated,
    });
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