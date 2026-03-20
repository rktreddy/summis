export const FEATURES = {
  habits_limit: 5,
  journal: true,
  focus_timer: true,
  basic_streaks: true,
  habits_unlimited: 'pro',
  ai_insights: 'pro',
  performance_analytics: 'pro',
  journal_export: 'pro',
  advanced_charts: 'pro',
  science_protocols: 'pro',
  weekly_report: 'pro',
} as const;

export function canAccess(
  feature: string,
  tier: 'free' | 'pro' | 'lifetime'
): boolean {
  const value = FEATURES[feature as keyof typeof FEATURES];
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return true;
  if (value === 'pro') return tier === 'pro' || tier === 'lifetime';
  return false;
}
