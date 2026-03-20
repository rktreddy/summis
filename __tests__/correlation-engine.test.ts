import { pearson, computeHabitCorrelations } from '../lib/correlation-engine';
import type { HabitWithCompletions, DailyScore } from '../types';

describe('pearson', () => {
  it('returns 1 for perfectly correlated data', () => {
    const x = [1, 2, 3, 4, 5];
    const y = [2, 4, 6, 8, 10];
    expect(pearson(x, y)).toBeCloseTo(1.0, 5);
  });

  it('returns -1 for perfectly inversely correlated data', () => {
    const x = [1, 2, 3, 4, 5];
    const y = [10, 8, 6, 4, 2];
    expect(pearson(x, y)).toBeCloseTo(-1.0, 5);
  });

  it('returns ~0 for uncorrelated data', () => {
    const x = [1, 2, 3, 4, 5];
    const y = [5, 1, 4, 2, 3];
    expect(Math.abs(pearson(x, y))).toBeLessThan(0.5);
  });

  it('returns 0 for arrays shorter than 2', () => {
    expect(pearson([1], [2])).toBe(0);
    expect(pearson([], [])).toBe(0);
  });

  it('returns 0 when all values are the same (zero variance)', () => {
    expect(pearson([5, 5, 5], [1, 2, 3])).toBe(0);
    expect(pearson([1, 2, 3], [5, 5, 5])).toBe(0);
  });

  it('returns 0 when both arrays are constant', () => {
    expect(pearson([3, 3, 3], [7, 7, 7])).toBe(0);
  });
});

describe('computeHabitCorrelations', () => {
  function makeDaysAgo(d: number): string {
    const date = new Date();
    date.setDate(date.getDate() - d);
    return date.toISOString();
  }

  function makeDateString(d: number): string {
    const date = new Date();
    date.setDate(date.getDate() - d);
    return date.toISOString().split('T')[0];
  }

  const makeHabit = (
    id: string,
    completedDays: number[]
  ): HabitWithCompletions => ({
    id,
    user_id: 'u1',
    title: `Habit ${id}`,
    description: null,
    science_note: null,
    category: 'focus',
    frequency: 'daily',
    target_time: null,
    color: null,
    icon: null,
    difficulty: 'moderate',
    trigger_cue: null,
    is_active: true,
    sort_order: 0,
    created_at: makeDaysAgo(30),
    completions: completedDays.map((d) => ({
      id: `c-${id}-${d}`,
      habit_id: id,
      user_id: 'u1',
      completed_at: makeDaysAgo(d),
      note: null,
      quality_rating: null,
    })),
    currentStreak: 0,
  });

  const makeScores = (count: number): DailyScore[] =>
    Array.from({ length: count }, (_, i) => ({
      date: makeDateString(count - 1 - i),
      overallScore: 50 + Math.round(Math.sin(i) * 20),
      habitScore: 50,
      focusScore: 50,
      consistencyScore: 50,
    }));

  it('sorts significant correlations first', () => {
    // One habit completed on high-score days, one on random days
    const scores = makeScores(25);
    const habits = [
      makeHabit('h1', [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24]),
      makeHabit('h2', [1, 3, 5]),
    ];
    const results = computeHabitCorrelations(habits, scores, 25);
    expect(results.length).toBe(2);
    // At least one should come back with sampleSize 25
    expect(results[0].sampleSize).toBe(25);
  });

  it('marks high completers as not significant', () => {
    // Habit done every single day
    const scores = makeScores(25);
    const allDays = Array.from({ length: 25 }, (_, i) => i);
    const habits = [makeHabit('hAll', allDays)];
    const results = computeHabitCorrelations(habits, scores, 25);
    expect(results[0].highCompleter).toBe(true);
    expect(results[0].isSignificant).toBe(false);
  });

  it('marks low completers as not significant', () => {
    const scores = makeScores(25);
    const habits = [makeHabit('hLow', [0])]; // Only 1 out of 25
    const results = computeHabitCorrelations(habits, scores, 25);
    expect(results[0].lowCompleter).toBe(true);
    expect(results[0].isSignificant).toBe(false);
  });

  it('returns empty for no habits', () => {
    expect(computeHabitCorrelations([], makeScores(25))).toEqual([]);
  });

  it('requires minimum 20 data points for significance', () => {
    const scores = makeScores(15);
    const habits = [makeHabit('h1', [0, 2, 4, 6, 8, 10, 12])];
    const results = computeHabitCorrelations(habits, scores, 15);
    expect(results[0].isSignificant).toBe(false);
    expect(results[0].sampleSize).toBe(15);
  });
});
