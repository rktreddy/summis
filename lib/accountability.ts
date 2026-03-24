import type { AccountabilityPartner, StreakChallenge } from '@/types';

/**
 * Partner status summary — privacy-safe data to share with partner.
 * Never includes: journal entries, mood, individual habit details.
 */
export interface PartnerSummary {
  displayName: string;
  activeStreaks: number;
  longestStreak: number;
  status: AccountabilityPartner['status'];
}

/**
 * Derive a privacy-safe summary from a partner relationship.
 */
export function getPartnerSummary(
  partner: AccountabilityPartner,
  partnerStreaks: { current: number; longest: number }
): PartnerSummary {
  return {
    displayName: partner.partner_name ?? 'Partner',
    activeStreaks: partnerStreaks.current,
    longestStreak: partnerStreaks.longest,
    status: partner.status,
  };
}

/**
 * Check if a challenge is complete.
 */
export function isChallengeComplete(challenge: StreakChallenge): boolean {
  return challenge.completed_at != null ||
    (challenge.user_progress >= challenge.target_days && challenge.partner_progress >= challenge.target_days);
}

/**
 * Get challenge progress as percentage for both sides.
 */
export function getChallengeProgress(challenge: StreakChallenge): {
  userPercent: number;
  partnerPercent: number;
  bothComplete: boolean;
} {
  const userPercent = Math.min(100, Math.round((challenge.user_progress / challenge.target_days) * 100));
  const partnerPercent = Math.min(100, Math.round((challenge.partner_progress / challenge.target_days) * 100));
  return {
    userPercent,
    partnerPercent,
    bothComplete: challenge.user_progress >= challenge.target_days && challenge.partner_progress >= challenge.target_days,
  };
}

export const CHALLENGE_DURATIONS = [
  { days: 7, label: '1 Week' },
  { days: 14, label: '2 Weeks' },
  { days: 30, label: '30 Days' },
] as const;
