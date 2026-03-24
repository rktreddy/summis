import { getChallengeProgress, isChallengeComplete, getPartnerSummary } from '../lib/accountability';
import type { AccountabilityPartner, StreakChallenge } from '../types';

describe('getChallengeProgress', () => {
  const challenge: StreakChallenge = {
    id: 'sc-1',
    partnership_id: 'ap-1',
    habit_title: 'Meditation',
    target_days: 7,
    user_progress: 5,
    partner_progress: 3,
    started_at: new Date().toISOString(),
    completed_at: null,
  };

  it('computes percentage correctly', () => {
    const progress = getChallengeProgress(challenge);
    expect(progress.userPercent).toBe(71);
    expect(progress.partnerPercent).toBe(43);
    expect(progress.bothComplete).toBe(false);
  });

  it('caps at 100%', () => {
    const progress = getChallengeProgress({ ...challenge, user_progress: 10 });
    expect(progress.userPercent).toBe(100);
  });

  it('reports both complete when both hit target', () => {
    const progress = getChallengeProgress({ ...challenge, user_progress: 7, partner_progress: 7 });
    expect(progress.bothComplete).toBe(true);
  });
});

describe('isChallengeComplete', () => {
  it('returns true when completed_at is set', () => {
    expect(isChallengeComplete({
      id: 'sc-1', partnership_id: 'ap-1', habit_title: 'X', target_days: 7,
      user_progress: 3, partner_progress: 2, started_at: '', completed_at: new Date().toISOString(),
    })).toBe(true);
  });

  it('returns true when both hit target', () => {
    expect(isChallengeComplete({
      id: 'sc-1', partnership_id: 'ap-1', habit_title: 'X', target_days: 7,
      user_progress: 7, partner_progress: 7, started_at: '', completed_at: null,
    })).toBe(true);
  });

  it('returns false when incomplete', () => {
    expect(isChallengeComplete({
      id: 'sc-1', partnership_id: 'ap-1', habit_title: 'X', target_days: 7,
      user_progress: 5, partner_progress: 3, started_at: '', completed_at: null,
    })).toBe(false);
  });
});

describe('getPartnerSummary', () => {
  it('returns privacy-safe data', () => {
    const partner: AccountabilityPartner = {
      id: 'ap-1', user_id: 'u1', partner_id: 'u2',
      partner_name: 'Jordan', status: 'active', created_at: '',
    };
    const summary = getPartnerSummary(partner, { current: 5, longest: 14 });
    expect(summary.displayName).toBe('Jordan');
    expect(summary.activeStreaks).toBe(5);
    expect(summary.longestStreak).toBe(14);
    expect(summary.status).toBe('active');
    // Ensure no sensitive fields leak
    expect(Object.keys(summary)).toEqual(['displayName', 'activeStreaks', 'longestStreak', 'status']);
  });
});
