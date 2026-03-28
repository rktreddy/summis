// Error logging via Sentry
// Requires: @sentry/react-native
//   npx expo install @sentry/react-native

import * as Sentry from '@sentry/react-native';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN ?? '';

export function initErrorLogging(): void {
  if (!SENTRY_DSN) {
    console.warn('Sentry: EXPO_PUBLIC_SENTRY_DSN not set, error logging disabled');
    return;
  }
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.2,
    enableAutoSessionTracking: true,
  });
}

export function captureException(error: unknown, context?: Record<string, string>): void {
  if (!SENTRY_DSN) {
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
  if (!SENTRY_DSN) return;
  Sentry.setUser({ id: userId, email });
}

export function clearUser(): void {
  if (!SENTRY_DSN) return;
  Sentry.setUser(null);
}
