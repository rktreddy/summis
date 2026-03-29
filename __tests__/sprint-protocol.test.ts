import {
  getRestDuration,
  getNextPhase,
  isFinalPhase,
  getRestSuggestion,
  REST_SUGGESTIONS,
  FOCUS_QUALITY_LABELS,
  SPRINT_DURATIONS,
  SPRINT_PHASES,
} from '@/lib/sprint-protocol';

describe('Sprint Protocol', () => {
  describe('getRestDuration', () => {
    it('returns 5 min rest for 30 min sprint', () => {
      expect(getRestDuration(30)).toBe(5);
    });

    it('returns 8 min rest for 45 min sprint', () => {
      expect(getRestDuration(45)).toBe(8);
    });

    it('returns 10 min rest for 50 min sprint', () => {
      expect(getRestDuration(50)).toBe(10);
    });

    it('returns 5 min for sprints under 30 min', () => {
      expect(getRestDuration(15)).toBe(5);
      expect(getRestDuration(1)).toBe(5);
    });

    it('returns 10 min for sprints over 50 min', () => {
      expect(getRestDuration(60)).toBe(10);
      expect(getRestDuration(90)).toBe(10);
    });
  });

  describe('getNextPhase', () => {
    it('intention → focus', () => {
      expect(getNextPhase('intention')).toBe('focus');
    });

    it('focus → rest', () => {
      expect(getNextPhase('rest')).toBe('reflection');
    });

    it('rest → reflection', () => {
      expect(getNextPhase('rest')).toBe('reflection');
    });

    it('reflection → null (final phase)', () => {
      expect(getNextPhase('reflection')).toBeNull();
    });
  });

  describe('isFinalPhase', () => {
    it('reflection is the final phase', () => {
      expect(isFinalPhase('reflection')).toBe(true);
    });

    it('other phases are not final', () => {
      expect(isFinalPhase('intention')).toBe(false);
      expect(isFinalPhase('focus')).toBe(false);
      expect(isFinalPhase('rest')).toBe(false);
    });
  });

  describe('getRestSuggestion', () => {
    it('returns a string from REST_SUGGESTIONS', () => {
      const suggestion = getRestSuggestion();
      expect(REST_SUGGESTIONS).toContain(suggestion);
    });
  });

  describe('constants', () => {
    it('has 3 sprint duration options', () => {
      expect(SPRINT_DURATIONS).toHaveLength(3);
      expect(SPRINT_DURATIONS.map((d) => d.minutes)).toEqual([30, 45, 50]);
    });

    it('has 4 sprint phases in order', () => {
      expect(SPRINT_PHASES).toHaveLength(4);
      expect(SPRINT_PHASES.map((p) => p.phase)).toEqual([
        'intention', 'focus', 'rest', 'reflection',
      ]);
    });

    it('has focus quality labels for ratings 1-5', () => {
      for (let i = 1; i <= 5; i++) {
        expect(FOCUS_QUALITY_LABELS[i]).toBeDefined();
        expect(typeof FOCUS_QUALITY_LABELS[i]).toBe('string');
      }
    });
  });
});
