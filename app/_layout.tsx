import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import AnimatedSplash from '../src/components/AnimatedSplash';

const GOLD = '#C9A84C';
const BG = '#0A0A0A';

// Module-level flag — survives re-mounts caused by router.replace()
let splashHasPlayed = false;

export default function RootLayout() {
  const [splashDone, setSplashDone] = useState(splashHasPlayed);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!splashDone) return;
    async function gate() {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          router.replace('/auth/login');
          setReady(true);
          return;
        }
        const userType = await AsyncStorage.getItem('userType');
        const plan = await AsyncStorage.getItem('plan');

        if (userType === 'consumer' && plan !== 'consumer_premium') {
          router.replace('/paywall/consumer');
          setReady(true);
          return;
        }
        setReady(true);
      } catch {
        router.replace('/auth/login');
        setReady(true);
      }
    }
    gate();
  }, [splashDone]);

  if (!splashDone) {
    return (
      <AnimatedSplash
        onFinish={() => {
          splashHasPlayed = true;
          setSplashDone(true);
        }}
      />
    );
  }

  if (!ready) {
    return (
      <View style={s.loader}>
        <ActivityIndicator color={GOLD} size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/register" />
      <Stack.Screen name="paywall/consumer" />
      <Stack.Screen name="paywall/butcher-plans" />
      <Stack.Screen name="payments/index" />
      <Stack.Screen name="subscriptions/index" />
      <Stack.Screen name="admin/index" />
      <Stack.Screen name="admin/orders" />
      <Stack.Screen name="admin/branding" />
      <Stack.Screen name="admin/woocommerce" />
      <Stack.Screen name="academy/index" />
      <Stack.Screen name="vleisgpt/index" />
      <Stack.Screen name="spitbraai/index" />
      <Stack.Screen name="diary/index" />
      <Stack.Screen name="diary/create" />
      <Stack.Screen name="meal-planner/index" />
      <Stack.Screen name="shopping-list/index" />
      <Stack.Screen name="campaigns/index" />
      <Stack.Screen name="stockvel/index" />
      <Stack.Screen name="predictions/index" />
      <Stack.Screen name="weather/index" />
      <Stack.Screen name="bundles/index" />
      <Stack.Screen name="competitions/index" />
      <Stack.Screen name="reorder/index" />
      <Stack.Screen name="whatsapp/index" />
      <Stack.Screen name="layby/index" />
      <Stack.Screen name="order/[orderId]" />
      <Stack.Screen name="order-confirmation/[orderId]" />
      <Stack.Screen name="delivery-tracking/[orderId]" />
    </Stack>
  );
}

const s = StyleSheet.create({
  loader: { flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center' },
});
