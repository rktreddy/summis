import { FEATURES, canAccess, canStartSprint } from '@/lib/features';

describe('Subscription & Feature Gating', () => {
  describe('canAccess', () => {
    it('allows free users access to basic features', () => {
      expect(canAccess('mits', 'free')).toBe(true);
      expect(canAccess('sprint_timer', 'free')).toBe(true);
      expect(canAccess('basic_hygiene', 'free')).toBe(true);
      expect(canAccess('basic_score', 'free')).toBe(true);
    });

    it('blocks free users from Pro features', () => {
      expect(canAccess('ai_insights', 'free')).toBe(false);
      expect(canAccess('correlation_insights', 'free')).toBe(false);
      expect(canAccess('trend_analysis', 'free')).toBe(false);
      expect(canAccess('weekly_report', 'free')).toBe(false);
      expect(canAccess('science_protocols', 'free')).toBe(false);
      expect(canAccess('advanced_analytics', 'free')).toBe(false);
      expect(canAccess('custom_hygiene', 'free')).toBe(false);
      expect(canAccess('data_export', 'free')).toBe(false);
    });

    it('allows Pro users access to all features', () => {
      expect(canAccess('ai_insights', 'pro')).toBe(true);
      expect(canAccess('correlation_insights', 'pro')).toBe(true);
      expect(canAccess('trend_analysis', 'pro')).toBe(true);
      expect(canAccess('weekly_report', 'pro')).toBe(true);
    });

    it('allows Lifetime users access to all features', () => {
      expect(canAccess('ai_insights', 'lifetime')).toBe(true);
      expect(canAccess('correlation_insights', 'lifetime')).toBe(true);
    });

    it('returns false for unknown features', () => {
      expect(canAccess('nonexistent_feature', 'pro')).toBe(false);
    });

    it('treats numeric features (daily_sprints) as accessible', () => {
      expect(canAccess('daily_sprints', 'free')).toBe(true);
    });
  });

  describe('sprint limits', () => {
    it('free tier gets 3 sprints per day', () => {
      expect(FEATURES.daily_sprints).toBe(3);
    });

    it('canStartSprint: free user below limit can start', () => {
      expect(canStartSprint('free', 0)).toBe(true);
      expect(canStartSprint('free', 2)).toBe(true);
    });

    it('canStartSprint: free user at limit cannot start', () => {
      expect(canStartSprint('free', 3)).toBe(false);
      expect(canStartSprint('free', 5)).toBe(false);
    });

    it('canStartSprint: pro user has no limit', () => {
      expect(canStartSprint('pro', 3)).toBe(true);
      expect(canStartSprint('pro', 100)).toBe(true);
    });

    it('canStartSprint: lifetime user has no limit', () => {
      expect(canStartSprint('lifetime', 3)).toBe(true);
      expect(canStartSprint('lifetime', 100)).toBe(true);
    });
  });
});
