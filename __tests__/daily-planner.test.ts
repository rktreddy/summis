import { createEmptyPriority, getPlanCompletionRate, getTodayDateString } from '../lib/daily-planner';
import type { DailyPriority } from '../types';

describe('createEmptyPriority', () => {
  it('creates a priority with default values', () => {
    const p = createEmptyPriority(0);
    expect(p.title).toBe('');
    expect(p.session_type).toBe('deep_work');
    expect(p.estimated_minutes).toBe(45);
    expect(p.completed).toBe(false);
    expect(p.id).toBeTruthy();
  });

  it('suggests timing when chronotype data is provided', () => {
    const p0 = createEmptyPriority(0, '07:00', 'moderate');
    expect(p0.suggested_time).toBeTruthy();
    expect(p0.suggested_time).toContain(':'); // has time format

    const p1 = createEmptyPriority(1, '07:00', 'moderate');
    expect(p1.suggested_time).toBeTruthy();

    const p2 = createEmptyPriority(2, '07:00', 'moderate');
    expect(p2.suggested_time).toBeTruthy();
  });

  it('returns null suggested_time without chronotype', () => {
    const p = createEmptyPriority(0);
    expect(p.suggested_time).toBeNull();
  });
});

describe('getPlanCompletionRate', () => {
  it('returns 0 for empty priorities', () => {
    expect(getPlanCompletionRate([])).toBe(0);
  });

  it('returns 100 when all complete', () => {
    const priorities: DailyPriority[] = [
      { id: '1', title: 'A', session_type: 'deep_work', estimated_minutes: 45, suggested_time: null, completed: true },
      { id: '2', title: 'B', session_type: 'study', estimated_minutes: 25, suggested_time: null, completed: true },
    ];
    expect(getPlanCompletionRate(priorities)).toBe(100);
  });

  it('returns correct percentage for partial completion', () => {
    const priorities: DailyPriority[] = [
      { id: '1', title: 'A', session_type: 'deep_work', estimated_minutes: 45, suggested_time: null, completed: true },
      { id: '2', title: 'B', session_type: 'study', estimated_minutes: 25, suggested_time: null, completed: false },
      { id: '3', title: 'C', session_type: 'creative', estimated_minutes: 90, suggested_time: null, completed: false },
    ];
    expect(getPlanCompletionRate(priorities)).toBe(33);
  });
});

describe('getTodayDateString', () => {
  it('returns YYYY-MM-DD format', () => {
    const date = getTodayDateString();
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
