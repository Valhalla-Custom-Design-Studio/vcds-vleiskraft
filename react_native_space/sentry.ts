import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';

const getDSN = (): string => {
  if (Platform.OS === 'android') {
    return process.env.EXPO_PUBLIC_SENTRY_DSN_ANDROID || process.env.EXPO_PUBLIC_SENTRY_DSN || '';
  }
  if (Platform.OS === 'ios') {
    return process.env.EXPO_PUBLIC_SENTRY_DSN_IOS || process.env.EXPO_PUBLIC_SENTRY_DSN || '';
  }
  // web / Expo Go
  return process.env.EXPO_PUBLIC_SENTRY_DSN_REACT || process.env.EXPO_PUBLIC_SENTRY_DSN || '';
};

export const initSentry = () => {
  const dsn = getDSN();
  if (!dsn) {
    return;
  }
  Sentry.init({
    dsn,
    environment: process.env.EXPO_PUBLIC_ENV || 'production',
    release: 'vleiskraft@1.0.0',
    dist: '1',
    tracesSampleRate: process.env.EXPO_PUBLIC_ENV === 'production' ? 0.2 : 1.0,
    enableNative: Platform.OS !== 'web',
    enableNativeCrashHandling: Platform.OS !== 'web',
    attachStacktrace: true,
    beforeSend(event) {
      if (event.user) delete event.user.email;
      return event;
    },
  });
};

export { Sentry };
