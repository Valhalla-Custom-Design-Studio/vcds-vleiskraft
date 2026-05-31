import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { PaywallGate } from '../../src/components/PaywallGate';

export default function PredictionsIndex() {
  const router = useRouter();
  return (
    <PaywallGate
      appId="vleiskraft"
      feature="demand_forecasting"
      requiredTier="pro"
      accentColor="#8B0000"
      onUpgrade={() => router.push('/subscriptions')}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Vraagvoorspelling</Text>
      </View>
    </PaywallGate>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', padding: 16 },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '700' },
});
