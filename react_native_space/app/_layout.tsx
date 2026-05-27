import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../src/hooks/useAuth';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PostHogProvider } from 'posthog-react-native';
import { posthog } from '../src/lib/posthog';
import { initSentry, Sentry } from '../src/lib/sentry';

SplashScreen.preventAutoHideAsync();
initSentry();

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

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PostHogProvider client={posthog}>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </PostHogProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(App);
