import { computeMultipliers } from '../lib/multiplier';
import type { HabitWithCompletions, FocusSession } from '../types';

function daysAgo(d: number): string {
  const date = new Date();
  date.setDate(date.getDate() - d);
  return date.toISOString();
}

function makeHabit(id: string, category: string, completedDays: number[]): HabitWithCompletions {
  return {
    id,
    user_id: 'u1',
    title: `Habit ${id}`,
    description: null,
    science_note: null,
    category: category as HabitWithCompletions['category'],
    frequency: 'daily',
    target_time: null,
    color: null,
    icon: null,
    difficulty: 'moderate',
    trigger_cue: null,
    is_active: true,
    sort_order: 0,
    created_at: daysAgo(30),
    completions: completedDays.map((d) => ({
      id: `c-${id}-${d}`,
      habit_id: id,
      user_id: 'u1',
      completed_at: daysAgo(d),
      note: null,
      quality_rating: null,
    })),
    currentStreak: 0,
  };
}

describe('computeMultipliers', () => {
  it('returns 1.0x for all domains with no data', () => {
    const result = computeMultipliers([], []);
    expect(result.totalMultiplier).toBe(1.0);
    expect(result.domains).toHaveLength(5);
    result.domains.forEach((d) => {
      expect(d.multiplier).toBe(1.0);
    });
  });

  it('caps multipliers at 2.0x', () => {
    // Habit with no completions in baseline but lots in recent = max ratio
    const habit = makeHabit('h1', 'exercise', [0, 1, 2, 3, 4, 5, 6]);
    // No baseline completions (days 24-30 have nothing)
    const result = computeMultipliers([habit], []);
    const exercise = result.domains.find((d) => d.domain === 'exercise');
    expect(exercise?.multiplier).toBeLessThanOrEqual(2.0);
  });

  it('totalMultiplier is the product of all domains', () => {
    const result = computeMultipliers([], []);
    const product = result.domains.reduce((p, d) => p * d.multiplier, 1);
    expect(result.totalMultiplier).toBeCloseTo(product, 5);
  });

  it('daysToTenX is null when total is 1.0', () => {
    const result = computeMultipliers([], []);
    expect(result.daysToTenX).toBeNull();
  });

  it('projectedAnnual uses 1% daily compounding', () => {
    const result = computeMultipliers([], []);
    const expected = 1.0 * Math.pow(1.01, 365);
    expect(result.projectedAnnual).toBeCloseTo(expected, 1);
  });

  it('returns 5 domains: sleep, exercise, focus, habits, recovery', () => {
    const result = computeMultipliers([], []);
    const domainNames = result.domains.map((d) => d.domain);
    expect(domainNames).toEqual(['sleep', 'exercise', 'focus', 'habits', 'recovery']);
  });
});
