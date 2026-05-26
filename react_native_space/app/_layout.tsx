import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../src/hooks/useAuth';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { posthog } from '../src/lib/posthog';
import { initSentry } from '../src/lib/sentry';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { token, loading } = useAuth();
  useEffect(() => {
    if (!loading) SplashScreen.hideAsync();
  }, [loading]);
  if (loading) return null;
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!token ? (
        <>
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/register" />
        </>
      ) : (
        <Stack.Screen name="(tabs)" />
      )}
    </Stack>
  );
}

initSentry();
posthog.capture('app_opened');

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
