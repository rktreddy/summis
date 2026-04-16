// Error logging via Sentry
// Requires: @sentry/react-native
//   npx expo install @sentry/react-native

import * as Sentry from '@sentry/react-native';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN ?? '';
const isSentryEnabled = SENTRY_DSN.startsWith('https://');

export function initErrorLogging(): void {
  if (!isSentryEnabled) {
    console.warn('Sentry: EXPO_PUBLIC_SENTRY_DSN not configured, error logging disabled');
    return;
  }
  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      tracesSampleRate: 0.2,
      enableAutoSessionTracking: true,
    });
  } catch (err) {
    console.warn('Sentry initialization failed:', err);
  }
}

export function captureException(error: unknown, context?: Record<string, string>): void {
  if (!isSentryEnabled) {
    console.error('[Error]', error instanceof Error ? error.message : String(error), context);
    return;
  }
  if (context) {
    Sentry.withScope((scope) => {
      for (const [key, value] of Object.entries(context)) {
        scope.setExtra(key, value);
      }
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

export function setUser(userId: string, email?: string): void {
  if (!isSentryEnabled) return;
  Sentry.setUser({ id: userId, email });
}

export function clearUser(): void {
  if (!isSentryEnabled) return;
  Sentry.setUser(null);
}
