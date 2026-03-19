import { isToday, isCompletedToday, findTodayCompletion } from '../lib/date-utils';
import type { HabitCompletion } from '../types';

function makeCompletion(daysAgo: number, id = 'c1'): HabitCompletion {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(12, 0, 0, 0);
  return {
    id,
    habit_id: 'h1',
    user_id: 'u1',
    completed_at: d.toISOString(),
    note: null,
    quality_rating: null,
  };
}

describe('isToday', () => {
  it('returns true for a timestamp from today', () => {
    expect(isToday(new Date().toISOString())).toBe(true);
  });

  it('returns false for a timestamp from yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isToday(yesterday.toISOString())).toBe(false);
  });
});

describe('isCompletedToday', () => {
  it('returns true when list includes a today completion', () => {
    expect(isCompletedToday([makeCompletion(0)])).toBe(true);
  });

  it('returns false when list has no today completion', () => {
    expect(isCompletedToday([makeCompletion(1)])).toBe(false);
  });

  it('returns false for an empty list', () => {
    expect(isCompletedToday([])).toBe(false);
  });
});

describe('findTodayCompletion', () => {
  it('returns the completion from today', () => {
    const today = makeCompletion(0, 'today');
    const yesterday = makeCompletion(1, 'yesterday');
    expect(findTodayCompletion([yesterday, today])?.id).toBe('today');
  });

  it('returns undefined when no today completion exists', () => {
    expect(findTodayCompletion([makeCompletion(2)])).toBeUndefined();
  });
});
