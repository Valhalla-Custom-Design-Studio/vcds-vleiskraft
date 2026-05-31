import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { PaywallGate } from '../../src/components/PaywallGate';

export default function MealPlannerIndex() {
  const router = useRouter();
  return (
    <PaywallGate
      appId="vleiskraft"
      feature="meal_planner"
      requiredTier="starter"
      accentColor="#8B0000"
      onUpgrade={() => router.push('/subscriptions')}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Maaltydplanner</Text>
      </View>
    </PaywallGate>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', padding: 16 },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '700' },
});
