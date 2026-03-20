// Analytics via Mixpanel
// Requires: mixpanel-react-native
//   npm install mixpanel-react-native

const MIXPANEL_TOKEN = process.env.EXPO_PUBLIC_MIXPANEL_TOKEN ?? '';

export async function initAnalytics(): Promise<void> {
  if (!MIXPANEL_TOKEN) {
    console.warn('Mixpanel: EXPO_PUBLIC_MIXPANEL_TOKEN not set, analytics disabled');
    return;
  }
  // TODO: Uncomment when mixpanel-react-native is installed
  // const { Mixpanel } = await import('mixpanel-react-native');
  // const mixpanel = new Mixpanel(MIXPANEL_TOKEN, true);
  // await mixpanel.init();
  console.log('Mixpanel: Initialized (stub)');
}

export const AnalyticsEvents = {
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_GOAL_SELECTED: 'onboarding_goal_selected',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  HABIT_CREATED: 'habit_created',
  HABIT_COMPLETED: 'habit_completed',
  HABIT_DELETED: 'habit_deleted',
  STREAK_MILESTONE: 'streak_milestone',
  FOCUS_SESSION_STARTED: 'focus_session_started',
  FOCUS_SESSION_COMPLETED: 'focus_session_completed',
  FOCUS_SESSION_INTERRUPTED: 'focus_session_interrupted',
  JOURNAL_ENTRY_CREATED: 'journal_entry_created',
  PAYWALL_VIEWED: 'paywall_viewed',
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_RESTORED: 'subscription_restored',
  AI_INSIGHTS_VIEWED: 'ai_insights_viewed',
  PROTOCOLS_VIEWED: 'protocols_viewed',
} as const;

export function trackEvent(
  event: string,
  properties?: Record<string, string | number | boolean>
): void {
  if (!MIXPANEL_TOKEN) {
    if (__DEV__) console.log('[Analytics]', event, properties);
    return;
  }
  // TODO: Uncomment when mixpanel-react-native is installed
  // const { Mixpanel } = require('mixpanel-react-native');
  // const mixpanel = new Mixpanel(MIXPANEL_TOKEN, true);
  // mixpanel.track(event, properties);
}

export function identifyUser(
  userId: string,
  _traits?: Record<string, string | number>
): void {
  if (!MIXPANEL_TOKEN) return;
  // TODO: Uncomment when mixpanel-react-native is installed
  // const { Mixpanel } = require('mixpanel-react-native');
  // const mixpanel = new Mixpanel(MIXPANEL_TOKEN, true);
  // mixpanel.identify(userId);
  console.log('Mixpanel: Identified (stub):', userId);
}

export function resetAnalytics(): void {
  if (!MIXPANEL_TOKEN) return;
}
