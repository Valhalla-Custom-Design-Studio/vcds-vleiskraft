
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/colors';
import { GlassCard } from '@/components/ui/GlassCard';
import { SkeletonBox } from '@/components/ui/SkeletonBox';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/locales';
import api from '@/lib/api';

const STEPS = ['PREPARING', 'ON_THE_WAY', 'ARRIVED', 'DELIVERED'];
const STEP_LABELS: Record<string, string> = {
  PREPARING: 'preparing', ON_THE_WAY: 'onTheWay', ARRIVED: 'arrived', DELIVERED: 'delivered',
};

export default function DeliveryTrackingScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { language } = useAuthStore();
  const [tracking, setTracking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () => api.get(`/api/delivery-tracking/${orderId}`).then(({ data }) => setTracking(data)).finally(() => setLoading(false));
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) return <View style={styles.container}><SkeletonBox height={300} style={{ margin: Spacing.md }} /></View>;

  const currentStep = STEPS.indexOf(tracking?.status ?? 'PREPARING');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📍 {t('deliveryTracker', language)}</Text>
      </View>
      <GlassCard style={styles.card}>
        {STEPS.map((step, i) => (
          <View key={step} style={styles.step}>
            <View style={[styles.stepDot, i <= currentStep && styles.stepDotActive]}>
              {i < currentStep && <Ionicons name="checkmark" size={14} color="#fff" />}
              {i === currentStep && <View style={styles.stepDotInner} />}
            </View>
            {i < STEPS.length - 1 && <View style={[styles.stepLine, i < currentStep && styles.stepLineActive]} />}
            <Text style={[styles.stepLabel, i <= currentStep && styles.stepLabelActive]}>
              {t(STEP_LABELS[step] as any, language)}
            </Text>
          </View>
        ))}
      </GlassCard>
      {tracking?.lat && tracking?.lng && (
        <TouchableOpacity
          style={styles.mapBtn}
          onPress={() => Linking.openURL(`https://maps.google.com/?q=${tracking.lat},${tracking.lng}`)}
        >
          <Ionicons name="map-outline" size={20} color={Colors.primary} />
          <Text style={styles.mapBtnText}>View on Google Maps</Text>
        </TouchableOpacity>
      )}
      {!tracking && <Text style={styles.waiting}>{t('waitingDelivery', language)}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 60, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  title: { color: Colors.textPrimary, fontSize: 26, fontWeight: '800' },
  card: { margin: Spacing.md, padding: Spacing.lg },
  step: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  stepDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.elevated, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  stepDotActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  stepDotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  stepLine: { position: 'absolute', left: 11, top: 24, width: 2, height: 24, backgroundColor: Colors.border },
  stepLineActive: { backgroundColor: Colors.primary },
  stepLabel: { color: Colors.textSecondary, fontSize: 16 },
  stepLabelActive: { color: Colors.textPrimary, fontWeight: '700' },
  mapBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, margin: Spacing.md, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.primary },
  mapBtnText: { color: Colors.primary, fontWeight: '700' },
  waiting: { color: Colors.textSecondary, textAlign: 'center', padding: Spacing.xl, fontSize: 16 },
});
