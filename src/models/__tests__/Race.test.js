import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Race } from '../Race.js';
import { StorageManager } from '../StorageManager.js';

// Mock StorageManager
vi.mock('../StorageManager.js', () => ({
  StorageManager: {
    saveRace: vi.fn(),
    getRaces: vi.fn(() => ({})),
    deleteRace: vi.fn(),
  },
}));

describe('Race Model', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a race with default values', () => {
    const race = new Race();
    expect(race.id).toBeDefined();
    expect(race.discipline).toBe('100m');
    expect(race.milestones).toEqual([]);
  });

  it('should add and sort milestones correctly', () => {
    const race = new Race();
    race.setMilestone(20, 2.5);
    race.setMilestone(10, 1.2);
    
    expect(race.milestones[0].distance).toBe(10);
    expect(race.milestones[1].distance).toBe(20);
  });

  it('should remove a milestone', () => {
    const race = new Race();
    race.setMilestone(10, 1.2, 'split');
    race.removeMilestone(10, 'split');
    expect(race.milestones).toHaveLength(0);
  });

  it('should calculate segment speeds correctly', () => {
    const race = new Race();
    race.setMilestone(0, 0, 'split');
    race.setMilestone(10, 1.5, 'split');
    race.setMilestone(20, 2.5, 'split');
    
    const segments = race.segmentSpeeds;
    expect(segments).toHaveLength(2);
    expect(segments[0].speed).toBe(10 / 1.5);
    expect(segments[1].speed).toBe(10 / 1.0);
  });

  it('should perform hurdle analysis correctly', () => {
    const race = new Race({ discipline: '110mH' });
    race.setMilestone(0, 0, 'split');
    race.setMilestone(13.72, 2.0, 'touchdown'); // H1
    race.setMilestone(110, 13.5, 'split'); // Finish
    
    const analysis = race.hurdleAnalysis;
    expect(analysis).toHaveLength(2);
    expect(analysis[0].label).toBe('Start - H1');
    expect(analysis[1].label).toBe('H1 - Finish');
  });

  it('should calculate intervals based on a template', () => {
    const race = new Race();
    race.setMilestone(0, 0, 'split');
    race.setMilestone(30, 4.0, 'split');
    race.setMilestone(60, 7.0, 'split');
    
    // We need segmentSpeeds to have data for steps/frequency calculation if needed
    // The current implementation of calculateIntervals uses segmentSpeeds for steps
    
    const template = [{ label: '30-60m', start: 30, end: 60 }];
    const intervals = race.calculateIntervals(template);
    
    expect(intervals[0].time).toBe(3.0);
    expect(intervals[0].speed).toBe(10.0);
  });

  it('should interpolate time at distance', () => {
    const race = new Race();
    race.setMilestone(0, 0, 'split');
    race.setMilestone(10, 1.0, 'split');
    
    expect(race.getTimeAtDistance(5)).toBe(0.5);
    expect(race.getTimeAtDistance(0)).toBe(0);
    expect(race.getTimeAtDistance(15)).toBeNull();
  });

  it('should save race via StorageManager', () => {
    const race = new Race({ name: 'Regional Finals' });
    race.save();
    expect(StorageManager.saveRace).toHaveBeenCalled();
  });
});
