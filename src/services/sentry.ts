import * as Sentry from '@sentry/react-native';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || '';

export function initSentry() {
  if (!SENTRY_DSN) return;
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.EXPO_PUBLIC_ENV || 'production',
    tracesSampleRate: 0.2,
    enableNative: true,
    attachStacktrace: true,
    beforeSend(event) {
      // Strip PII
      if (event.user) delete event.user.email;
      return event;
    },
  });
}

export const captureError = (err: unknown, context?: Record<string, unknown>) => {
  Sentry.withScope((scope) => {
    if (context) scope.setExtras(context);
    Sentry.captureException(err);
  });
};

export const captureMessage = (msg: string, level: Sentry.SeverityLevel = 'info') =>
  Sentry.captureMessage(msg, level);

export const setSentryUser = (id: string, role: string) =>
  Sentry.setUser({ id, role });

export const clearSentryUser = () => Sentry.setUser(null);
