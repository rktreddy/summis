import { FEATURES, canAccess } from '@/lib/features';

describe('Subscription & Feature Gating', () => {
  describe('canAccess', () => {
    it('allows free users access to basic features', () => {
      expect(canAccess('journal', 'free')).toBe(true);
      expect(canAccess('focus_timer', 'free')).toBe(true);
      expect(canAccess('basic_streaks', 'free')).toBe(true);
    });

    it('blocks free users from Pro features', () => {
      expect(canAccess('ai_insights', 'free')).toBe(false);
      expect(canAccess('performance_analytics', 'free')).toBe(false);
      expect(canAccess('journal_export', 'free')).toBe(false);
      expect(canAccess('weekly_report', 'free')).toBe(false);
      expect(canAccess('science_protocols', 'free')).toBe(false);
      expect(canAccess('advanced_charts', 'free')).toBe(false);
    });

    it('allows Pro users access to all features', () => {
      expect(canAccess('ai_insights', 'pro')).toBe(true);
      expect(canAccess('performance_analytics', 'pro')).toBe(true);
      expect(canAccess('journal_export', 'pro')).toBe(true);
      expect(canAccess('weekly_report', 'pro')).toBe(true);
    });

    it('allows Lifetime users access to all features', () => {
      expect(canAccess('ai_insights', 'lifetime')).toBe(true);
      expect(canAccess('performance_analytics', 'lifetime')).toBe(true);
    });

    it('returns false for unknown features', () => {
      expect(canAccess('nonexistent_feature', 'pro')).toBe(false);
    });
  });

  describe('habit limit', () => {
    const limit = FEATURES.habits_limit;

    it('free tier limit is 5', () => {
      expect(limit).toBe(5);
    });

    it('canAddHabit logic: free user below limit can add', () => {
      const isPro = false;
      const canAdd = (count: number) => isPro || count < limit;
      expect(canAdd(0)).toBe(true);
      expect(canAdd(4)).toBe(true);
    });

    it('canAddHabit logic: free user at limit cannot add', () => {
      const isPro = false;
      const canAdd = (count: number) => isPro || count < limit;
      expect(canAdd(5)).toBe(false);
      expect(canAdd(10)).toBe(false);
    });

    it('canAddHabit logic: pro user has no limit', () => {
      const isPro = true;
      const canAdd = (count: number) => isPro || count < limit;
      expect(canAdd(5)).toBe(true);
      expect(canAdd(100)).toBe(true);
    });
  });
});
