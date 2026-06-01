import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const BG = '#0A0A0A';
const GOLD = '#C9A84C';

/**
 * VleisKraft(TM) Auth Gate
 * - No token → /auth/login
 * - Consumer, no active sub → /paywall/consumer
 * - Butcher, plan=free → /(tabs) (freemium access)
 * - Butcher, paid plan → /(tabs)
 * - Consumer, active sub → /(tabs)
 */
export function useAuthGate() {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          router.replace('/auth/login');
          return;
        }
        const userType = await AsyncStorage.getItem('userType');
        const plan = await AsyncStorage.getItem('plan');

        if (userType === 'consumer') {
          // Consumer must have active subscription
          if (!plan || plan !== 'consumer_premium') {
            router.replace('/paywall/consumer');
            return;
          }
        }
        // Butchers (free or paid) get access  -  plan gates features inside the app
        setChecked(true);
      } catch {
        router.replace('/auth/login');
      }
    }
    check();
  }, []);

  return checked;
}

export function AuthGateLoader() {
  return (
    <View style={s.root}>
      <ActivityIndicator color={GOLD} size="large" />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center' },
});
