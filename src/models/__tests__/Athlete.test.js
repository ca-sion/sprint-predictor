import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Athlete } from '../Athlete.js';
import { StorageManager } from '../StorageManager.js';

// Mock StorageManager
vi.mock('../StorageManager.js', () => ({
  StorageManager: {
    saveAthlete: vi.fn(),
    getAthletes: vi.fn(() => ({})),
    deleteAthlete: vi.fn(),
  },
}));

describe('Athlete Model', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create an athlete with default values', () => {
    const athlete = new Athlete();
    expect(athlete.id).toBeDefined();
    expect(athlete.name).toBe('');
    expect(athlete.gender).toBe('M');
    expect(athlete.metrics).toEqual({});
  });

  it('should calculate age correctly', () => {
    const currentYear = new Date().getFullYear();
    const athlete = new Athlete({ birthYear: currentYear - 25 });
    expect(athlete.age).toBe(25);
  });

  it('should determine the correct category', () => {
    const currentYear = new Date().getFullYear();
    
    const u16 = new Athlete({ birthYear: currentYear - 15 });
    expect(u16.category).toBe('U16');

    const u18 = new Athlete({ birthYear: currentYear - 17 });
    expect(u18.category).toBe('U18');

    const u20 = new Athlete({ birthYear: currentYear - 19 });
    expect(u20.category).toBe('U20');

    const u23 = new Athlete({ birthYear: currentYear - 22 });
    expect(u23.category).toBe('U23');

    const elite = new Athlete({ birthYear: currentYear - 25 });
    expect(elite.category).toBe('ELITE');
  });

  it('should set and get metrics correctly', () => {
    const athlete = new Athlete();
    athlete.setMetric('weight', '75.5');
    expect(athlete.getMetric('weight')).toBe(75.5);
    expect(athlete.metrics.weight).toBe(75.5);

    athlete.setMetric('weight', null);
    expect(athlete.getMetric('weight')).toBeUndefined();
  });

  it('should save athlete via StorageManager', () => {
    const athlete = new Athlete({ name: 'John Doe' });
    athlete.save();
    expect(StorageManager.saveAthlete).toHaveBeenCalledWith(expect.objectContaining({
      name: 'John Doe'
    }));
  });

  it('should load an athlete by id', () => {
    const mockAthleteData = { id: '123', name: 'Jane Doe' };
    StorageManager.getAthletes.mockReturnValue({ '123': mockAthleteData });

    const athlete = Athlete.load('123');
    expect(athlete).toBeInstanceOf(Athlete);
    expect(athlete.name).toBe('Jane Doe');
  });

  it('should return null when loading non-existent athlete', () => {
    StorageManager.getAthletes.mockReturnValue({});
    expect(Athlete.load('999')).toBeNull();
  });
});
