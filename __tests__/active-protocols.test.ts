import { getProtocolHabits, getProtocolProgress, type ActiveProtocol } from '../lib/active-protocols';

describe('getProtocolHabits', () => {
  it('returns habits for ultradian-focus protocol', () => {
    const habits = getProtocolHabits('ultradian-focus');
    expect(habits.length).toBeGreaterThanOrEqual(2);
    expect(habits[0].title).toContain('Ultradian');
    expect(habits[0].category).toBe('focus');
  });

  it('returns habits for all 8 protocols', () => {
    const ids = ['ultradian-focus', 'tiny-habits', 'spaced-repetition', 'morning-prime',
      'sleep-consistency', 'zone2-cardio', 'caffeine-timing', 'cold-exposure'];
    for (const id of ids) {
      const habits = getProtocolHabits(id);
      expect(habits.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('returns empty array for unknown protocol', () => {
    expect(getProtocolHabits('nonexistent')).toEqual([]);
  });

  it('all preset habits have required fields', () => {
    const habits = getProtocolHabits('morning-prime');
    for (const h of habits) {
      expect(h.title).toBeTruthy();
      expect(h.description).toBeTruthy();
      expect(h.category).toBeTruthy();
      expect(['easy', 'moderate', 'hard']).toContain(h.difficulty);
    }
  });
});

describe('getProtocolProgress', () => {
  function makeProtocol(daysAgo: number, completed = false): ActiveProtocol {
    const started = new Date();
    started.setDate(started.getDate() - daysAgo);
    return {
      id: 'ap-1',
      user_id: 'u1',
      protocol_id: 'ultradian-focus',
      started_at: started.toISOString(),
      completed_at: completed ? new Date().toISOString() : null,
      baseline_score: 60,
      final_score: completed ? 80 : null,
      is_active: !completed,
    };
  }

  it('returns day 1 on the first day', () => {
    const progress = getProtocolProgress(makeProtocol(0));
    expect(progress.dayNumber).toBe(1);
    expect(progress.totalDays).toBe(30);
    expect(progress.isComplete).toBe(false);
  });

  it('returns roughly day 15 on day 14-15', () => {
    const progress = getProtocolProgress(makeProtocol(14));
    expect(progress.dayNumber).toBeGreaterThanOrEqual(14);
    expect(progress.dayNumber).toBeLessThanOrEqual(15);
    expect(progress.percentComplete).toBeGreaterThanOrEqual(46);
    expect(progress.percentComplete).toBeLessThanOrEqual(50);
  });

  it('caps at day 30', () => {
    const progress = getProtocolProgress(makeProtocol(45));
    expect(progress.dayNumber).toBe(30);
    expect(progress.isComplete).toBe(true);
  });

  it('marks completed protocols as complete', () => {
    const progress = getProtocolProgress(makeProtocol(10, true));
    expect(progress.isComplete).toBe(true);
  });
});
