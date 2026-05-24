import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { api } from '../../src/services/api';

const STEPS = ['Order Placed', 'Confirmed', 'Processing', 'Dispatched', 'Out for Delivery', 'Delivered'];

export default function DeliveryTrackingScreen() {
  const { orderId } = useLocalSearchParams();
  const [tracking, setTracking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${orderId}/tracking`).then(r => setTracking(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <View style={s.center}><ActivityIndicator color="#c0392b" size="large" /></View>;

  const currentStep = STEPS.indexOf(tracking?.status || 'Order Placed');

  return (
    <ScrollView style={s.container}>
      <Text style={s.title}>🚚 Delivery Tracking</Text>
      <Text style={s.orderId}>Order #{orderId}</Text>
      <View style={s.timeline}>
        {STEPS.map((step, i) => (
          <View key={step} style={s.step}>
            <View style={[s.dot, i <= currentStep && s.dotActive]} />
            {i < STEPS.length - 1 && <View style={[s.line, i < currentStep && s.lineActive]} />}
            <Text style={[s.stepText, i <= currentStep && s.stepActive]}>{step}</Text>
          </View>
        ))}
      </View>
      {tracking?.eta && <Text style={s.eta}>ETA: {tracking.eta}</Text>}
      {tracking?.driver && <Text style={s.driver}>Driver: {tracking.driver}</Text>}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d', padding: 16 },
  center: { flex: 1, backgroundColor: '#0d0d0d', justifyContent: 'center', alignItems: 'center' },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4, marginTop: 48 },
  orderId: { color: '#888', marginBottom: 24 },
  timeline: { paddingLeft: 16 },
  step: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 0 },
  dot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#333', marginRight: 12, marginTop: 2 },
  dotActive: { backgroundColor: '#c0392b' },
  line: { position: 'absolute', left: 7, top: 18, width: 2, height: 32, backgroundColor: '#333' },
  lineActive: { backgroundColor: '#c0392b' },
  stepText: { color: '#555', fontSize: 14, paddingBottom: 28 },
  stepActive: { color: '#fff', fontWeight: '600' },
  eta: { color: '#2ecc71', fontSize: 16, fontWeight: '700', marginTop: 20 },
  driver: { color: '#888', marginTop: 8 },
});
