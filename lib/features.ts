export const FEATURES = {
  // Free tier
  daily_sprints: 3,
  mits: true,
  basic_hygiene: true,
  sprint_timer: true,
  basic_score: true,

  // Pro tier
  sprints_unlimited: 'pro',
  correlation_insights: 'pro',
  trend_analysis: 'pro',
  ai_insights: 'pro',
  custom_hygiene: 'pro',
  advanced_analytics: 'pro',
  science_protocols: 'pro',
  data_export: 'pro',
  weekly_report: 'pro',
} as const;

export type FeatureKey = keyof typeof FEATURES;

export function canAccess(
  feature: string,
  tier: 'free' | 'pro' | 'lifetime'
): boolean {
  const value = FEATURES[feature as FeatureKey];
  if (value === undefined) return false;
  if (typeof value === 'boolean') return value;
  // Numeric values represent free-tier limits — feature is accessible, but capped.
  // Use canStartSprint() for limit checks. canAccess returns true for availability.
  if (typeof value === 'number') return true;
  if (value === 'pro') return tier === 'pro' || tier === 'lifetime';
  return false;
}

/**
 * Check if user can start another sprint today.
 */
export function canStartSprint(
  tier: 'free' | 'pro' | 'lifetime',
  todaySprintCount: number
): boolean {
  if (tier === 'pro' || tier === 'lifetime') return true;
  return todaySprintCount < FEATURES.daily_sprints;
}
