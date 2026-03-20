// Error logging via Sentry
// Requires: @sentry/react-native
//   npx expo install @sentry/react-native

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN ?? '';

export async function initErrorLogging(): Promise<void> {
  if (!SENTRY_DSN) {
    console.warn('Sentry: EXPO_PUBLIC_SENTRY_DSN not set, error logging disabled');
    return;
  }
  // TODO: Uncomment when @sentry/react-native is installed
  // const Sentry = await import('@sentry/react-native');
  // Sentry.init({ dsn: SENTRY_DSN, tracesSampleRate: 0.2, enableAutoSessionTracking: true });
  console.log('Sentry: Initialized (stub)');
}

export function captureException(error: Error, context?: Record<string, string>): void {
  if (!SENTRY_DSN) {
    console.error('[Error]', error.message, context);
    return;
  }
  // TODO: Uncomment when @sentry/react-native is installed
  // const Sentry = require('@sentry/react-native');
  // Sentry.captureException(error);
  console.error('[Sentry stub]', error.message, context);
}

export function setUser(userId: string, _email?: string): void {
  if (!SENTRY_DSN) return;
  // TODO: Uncomment when @sentry/react-native is installed
  // const Sentry = require('@sentry/react-native');
  // Sentry.setUser({ id: userId, email });
  console.log('Sentry: User set (stub):', userId);
}

export function clearUser(): void {
  if (!SENTRY_DSN) return;
  // TODO: Uncomment when @sentry/react-native is installed
  // const Sentry = require('@sentry/react-native');
  // Sentry.setUser(null);
}
