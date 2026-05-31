import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { PaywallGate } from '../../src/components/PaywallGate';

export default function CampaignsIndex() {
  const router = useRouter();
  return (
    <PaywallGate
      appId="vleiskraft"
      feature="campaigns_promotions"
      requiredTier="pro"
      accentColor="#8B0000"
      onUpgrade={() => router.push('/subscriptions')}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Veldtogte & Promosies</Text>
      </View>
    </PaywallGate>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', padding: 16 },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '700' },
});
