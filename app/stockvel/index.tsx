import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { PaywallGate } from '../../src/components/PaywallGate';

export default function StockvelIndex() {
  const router = useRouter();
  return (
    <PaywallGate
      appId="vleiskraft"
      feature="stockvel_management"
      requiredTier="pro"
      accentColor="#8B0000"
      onUpgrade={() => router.push('/subscriptions')}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Stokvel Bestuur</Text>
      </View>
    </PaywallGate>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', padding: 16 },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '700' },
});
