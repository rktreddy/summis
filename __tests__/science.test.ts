import {
  getNextPeakWindow,
  getAlertnessPeak,
  calculateHabitStackScore,
  calculateConsistencyScore,
  calculateStreak,
} from '../lib/science';
import type { HabitCompletion } from '../types';

// Helper to create a completion at a specific date/time
function makeCompletion(
  daysAgo: number,
  hoursOffset = 12,
  minutesOffset = 0
): HabitCompletion {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hoursOffset, minutesOffset, 0, 0);
  return {
    id: `c-${daysAgo}-${hoursOffset}-${minutesOffset}`,
    habit_id: 'h1',
    user_id: 'u1',
    completed_at: d.toISOString(),
    note: null,
    quality_rating: null,
  };
}

// ── getNextPeakWindow ──────────────────────────────────────────────────

describe('getNextPeakWindow', () => {
  it('returns a time 2.5 hours after the given time', () => {
    const wake = new Date(2026, 2, 19, 7, 0, 0); // 7:00 AM
    const peak = getNextPeakWindow(wake);
    expect(peak.getHours()).toBe(9);
    expect(peak.getMinutes()).toBe(30);
  });

  it('does not mutate the input date', () => {
    const wake = new Date(2026, 2, 19, 6, 0, 0);
    const original = wake.getTime();
    getNextPeakWindow(wake);
    expect(wake.getTime()).toBe(original);
  });
});

// ── getAlertnessPeak ───────────────────────────────────────────────────

describe('getAlertnessPeak', () => {
  it('returns peak 3 hours after wake with 90-min window', () => {
    const wake = new Date(2026, 2, 19, 6, 0, 0);
    const { peak, window } = getAlertnessPeak(wake);
    expect(peak.getHours()).toBe(9);
    expect(window).toBe(90);
  });

  it('does not mutate the input date', () => {
    const wake = new Date(2026, 2, 19, 6, 0, 0);
    const original = wake.getTime();
    getAlertnessPeak(wake);
    expect(wake.getTime()).toBe(original);
  });
});

// ── calculateHabitStackScore ───────────────────────────────────────────

describe('calculateHabitStackScore', () => {
  it('returns 0 for fewer than 2 completions', () => {
    expect(calculateHabitStackScore([])).toBe(0);
    expect(calculateHabitStackScore([makeCompletion(0)])).toBe(0);
  });

  it('returns 100 when all completions are within 30 minutes', () => {
    const completions = [
      makeCompletion(0, 9, 0),
      makeCompletion(0, 9, 10),
      makeCompletion(0, 9, 25),
    ];
    expect(calculateHabitStackScore(completions)).toBe(100);
  });

  it('returns 0 when no completions are within 30 minutes of each other', () => {
    const completions = [
      makeCompletion(0, 8, 0),
      makeCompletion(0, 10, 0),
      makeCompletion(0, 14, 0),
    ];
    expect(calculateHabitStackScore(completions)).toBe(0);
  });

  it('returns partial score for mixed clustering', () => {
    const completions = [
      makeCompletion(0, 9, 0),
      makeCompletion(0, 9, 15),  // clustered with first
      makeCompletion(0, 14, 0),  // not clustered
    ];
    // 1 out of 2 pairs = 50%
    expect(calculateHabitStackScore(completions)).toBe(50);
  });
});

// ── calculateConsistencyScore ──────────────────────────────────────────

describe('calculateConsistencyScore', () => {
  it('returns 0 for 0 days', () => {
    expect(calculateConsistencyScore([], 0)).toBe(0);
  });

  it('returns 0 for no completions', () => {
    expect(calculateConsistencyScore([], 7)).toBe(0);
  });

  it('returns 100 when every day has a completion', () => {
    const completions = Array.from({ length: 7 }, (_, i) => makeCompletion(i));
    expect(calculateConsistencyScore(completions, 7)).toBe(100);
  });

  it('weights recent days more heavily', () => {
    // Completions only in the first half (most recent days)
    const recentOnly = Array.from({ length: 4 }, (_, i) => makeCompletion(i));
    // Completions only in the second half (oldest days)
    const oldOnly = Array.from({ length: 4 }, (_, i) => makeCompletion(i + 4));

    const recentScore = calculateConsistencyScore(recentOnly, 8);
    const oldScore = calculateConsistencyScore(oldOnly, 8);

    // Recent completions should produce a higher score due to recency weighting
    expect(recentScore).toBeGreaterThan(oldScore);
  });
});

// ── calculateStreak ────────────────────────────────────────────────────

describe('calculateStreak', () => {
  it('returns 0 for no completions', () => {
    expect(calculateStreak([])).toBe(0);
  });

  it('returns 1 for a single completion today', () => {
    expect(calculateStreak([makeCompletion(0)])).toBe(1);
  });

  it('counts consecutive days from today backward', () => {
    const completions = [
      makeCompletion(0),
      makeCompletion(1),
      makeCompletion(2),
    ];
    expect(calculateStreak(completions)).toBe(3);
  });

  it('allows today to be incomplete (starts counting from yesterday)', () => {
    const completions = [
      makeCompletion(1),
      makeCompletion(2),
      makeCompletion(3),
    ];
    expect(calculateStreak(completions)).toBe(3);
  });

  it('breaks streak on a missed day', () => {
    const completions = [
      makeCompletion(0),
      makeCompletion(1),
      // day 2 skipped
      makeCompletion(3),
      makeCompletion(4),
    ];
    expect(calculateStreak(completions)).toBe(2);
  });

  it('handles duplicate completions on the same day', () => {
    const completions = [
      makeCompletion(0, 9, 0),
      makeCompletion(0, 14, 0), // same day, different time
      makeCompletion(1),
    ];
    expect(calculateStreak(completions)).toBe(2);
  });

  it('caps at 365 days', () => {
    const completions = Array.from({ length: 400 }, (_, i) => makeCompletion(i));
    expect(calculateStreak(completions)).toBeLessThanOrEqual(365);
  });
});
