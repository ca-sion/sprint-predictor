/**
 * @file Race.js
 * @description Modèle Race pour la gestion des analyses de course.
 */
import { StorageManager } from './StorageManager.js';

/**
 * Classe représentant une course et son analyse.
 */
export class Race {
  /**
   * Crée une instance de Race.
   * @param {Object} data - Données initiales de la course.
   */
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

    // Steps: { segment: string, count: number, leadLeg: 'L'|'R'|null }
    this.steps = data.steps || [];

    // Video reference
    this.videoUrl = data.videoUrl || '';

    this.lastUpdated = data.lastUpdated || new Date().toISOString();
  }

  /**
   * Ajoute ou met à jour un jalon (milestone).
   * @param {number} distance - Distance du jalon.
   * @param {number} time - Temps au passage.
   * @param {string} type - Type de jalon ('split', 'touchdown', etc.).
   * @param {string|null} label - Libellé personnalisé.
   */
  setMilestone(distance, time, type = 'split', label = null) {
    const index = this.milestones.findIndex((m) => m.distance === distance && m.type === type);
    const milestone = {
      distance: parseFloat(distance),
      time: parseFloat(time),
      type,
      label: label || `${distance}m`,
    };

    if (index !== -1) {
      this.milestones[index] = milestone;
    } else {
      this.milestones.push(milestone);
      this.milestones.sort((a, b) => a.time - b.time);
    }
    this.lastUpdated = new Date().toISOString();
  }

  /**
   * Supprime un jalon.
   * @param {number} distance - Distance du jalon à supprimer.
   * @param {string} type - Type du jalon.
   */
  removeMilestone(distance, type) {
    this.milestones = this.milestones.filter((m) => !(m.distance === distance && m.type === type));
    this.lastUpdated = new Date().toISOString();
  }

  /**
   * Calcule les métriques de vitesse par segment.
   * @returns {Array} Liste des segments avec leurs statistiques.
   */
  get segmentSpeeds() {
    const results = [];
    const sortedMilestones = [...this.milestones]
      .filter((m) => m.type === 'split' || m.type === 'touchdown')
      .sort((a, b) => a.distance - b.distance);

    const points = sortedMilestones[0]?.distance > 0
      ? [{ distance: 0, time: 0 }, ...sortedMilestones]
      : sortedMilestones;

    for (let i = 1; i < points.length; i++) {
      const d = points[i].distance - points[i - 1].distance;
      const t = points[i].time - points[i - 1].time;
      const segmentId = `${points[i - 1].distance}-${points[i].distance}`;

      if (t > 0) {
        const steps = this.stepCounts[segmentId] || 0;
        results.push({
          id: segmentId,
          segment: `${points[i - 1].distance}-${points[i].distance}m`,
          label: points[i].label,
          speed: d / t,
          time: t,
          distance: d,
          steps: steps,
          frequency: steps > 0 ? steps / t : 0,
          stepLength: steps > 0 ? d / steps : 0,
        });
      }
    }
    return results;
  }

  /**
   * Analyse spécialisée pour les courses de haies.
   * @returns {Array} Analyse par intervalle de haies.
   */
  get hurdleAnalysis() {
    const results = [];
    const isHurdle = this.discipline.toLowerCase().includes('h');
    if (!isHurdle) return [];

    const touchdowns = this.milestones.filter((m) => m.type === 'touchdown').sort((a, b) => a.distance - b.distance);
    const start = this.milestones.find((m) => m.distance === 0) || { distance: 0, time: 0 };
    const raceDist = parseInt(this.discipline);
    const finish = this.milestones.find((m) => m.distance === raceDist);

    if (touchdowns.length > 0) {
      const h1 = touchdowns[0];
      const t = h1.time - start.time;
      const d = h1.distance - start.distance;
      const segmentId = `0-${h1.distance}`;
      results.push({
        id: segmentId,
        label: 'Start - H1',
        time: t,
        distance: d,
        distance_start: 0,
        distance_end: h1.distance,
        speed: d / t,
        steps: this.stepCounts[segmentId] || 0,
      });
    }

    for (let i = 1; i < touchdowns.length; i++) {
      const m1 = touchdowns[i - 1];
      const m2 = touchdowns[i];
      const t = m2.time - m1.time;
      const d = m2.distance - m1.distance;
      const segmentId = `${m1.distance}-${m2.distance}`;

      results.push({
        id: segmentId,
        label: `H${i} - H${i + 1}`,
        time: t,
        distance: d,
        distance_start: m1.distance,
        distance_end: m2.distance,
        speed: d / t,
        steps: this.stepCounts[segmentId] || 0,
      });
    }

    if (touchdowns.length > 0 && finish) {
      const lastH = touchdowns[touchdowns.length - 1];
      if (finish.distance > lastH.distance) {
        const t = finish.time - lastH.time;
        const d = finish.distance - lastH.distance;
        const segmentId = `${lastH.distance}-${finish.distance}`;
        results.push({
          id: segmentId,
          label: `H${touchdowns.length} - Finish`,
          time: t,
          distance: d,
          distance_start: lastH.distance,
          distance_end: finish.distance,
          speed: d / t,
          steps: this.stepCounts[segmentId] || 0,
        });
      }
    }

    return results;
  }

  /**
   * Calcule des intervalles personnalisés basés sur un modèle.
   * @param {Array} template - Liste de { label, start, end }.
   * @returns {Array} Intervalles calculés.
   */
  calculateIntervals(template = []) {
    if (!template) return [];
    const EPSILON = 0.1;

    return template.map((item) => {
      const mStart = this.milestones.find((m) => Math.abs(m.distance - item.start) < EPSILON);
      const mEnd = this.milestones.find((m) => Math.abs(m.distance - item.end) < EPSILON);

      const startTime = item.start === 0 ? (mStart ? mStart.time : 0) : (mStart ? mStart.time : null);

      if (startTime === null || !mEnd || mEnd.time <= startTime) return null;

      const time = mEnd.time - startTime;
      const distance = mEnd.distance - (mStart ? mStart.distance : 0);
      const speed = distance / time;

      let totalSteps = 0;
      let stepsFound = false;

      const primitives = this.segmentSpeeds;
      primitives.forEach((p) => {
        const [pStart, pEnd] = p.id.split('-').map(Number);
        if (pStart >= item.start - EPSILON && pEnd <= item.end + EPSILON) {
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
        stepLength: (stepsFound && totalSteps > 0) ? distance / totalSteps : 0,
      };
    });
  }

  /**
   * Obtient le temps interpolé à une distance spécifique.
   * @param {number} distance - Distance cible.
   * @returns {number|null} Temps interpolé ou null.
   */
  getTimeAtDistance(distance) {
    if (distance === 0) return 0;

    const exact = this.milestones.find((m) => Math.abs(m.distance - distance) < 0.01);
    if (exact) return exact.time;

    const after = this.milestones.find((m) => m.distance > distance);
    const before = [...this.milestones].reverse().find((m) => m.distance <= distance) || { distance: 0, time: 0 };

    if (!after) return null;

    const ratio = (distance - before.distance) / (after.distance - before.distance);
    return before.time + ratio * (after.time - before.time);
  }

  /**
   * Sauvegarde la course via le StorageManager.
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
      lastUpdated: this.lastUpdated,
    });
  }

  /**
   * Supprime la course du stockage.
   */
  delete() {
    StorageManager.deleteRace(this.id);
  }

  /**
   * Récupère toutes les courses d'un athlète.
   * @param {string} athleteId - L'identifiant de l'athlète.
   * @returns {Array} Liste des instances de Race.
   */
  static getByAthlete(athleteId) {
    const racesMap = StorageManager.getRaces();
    return Object.values(racesMap)
      .filter((r) => r.athleteId === athleteId)
      .map((r) => new Race(r))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  /**
   * Charge une course par son identifiant.
   * @param {string} id - L'identifiant de la course.
   * @returns {Race|null} L'instance de Race ou null.
   */
  static load(id) {
    const racesMap = StorageManager.getRaces();
    const data = racesMap[id];
    return data ? new Race(data) : null;
  }
}