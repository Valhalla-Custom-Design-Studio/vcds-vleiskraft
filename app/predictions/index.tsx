
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
const Spacing = { sm: 8, md: 16, lg: 24 };
const Radius = { sm: 8, md: 12, lg: 16 };
import { GlassCard } from '../../src/components/ui/GlassCard';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { SkeletonBox } from '../../src/components/ui/SkeletonBox';
import { GradientButton } from '../../src/components/ui/GradientButton';
import { useAuthStore } from '../../src/store/authStore';
import { useCartStore } from '../../src/store/cartStore';
import { t } from '../../src/locales';
import api from '../../src/lib/api';

function PredictionsScreenInner() {
  const { language } = useAuthStore();
  const { addItem } = useCartStore();
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/api/predictions/user');
      setPredictions(data.predictions ?? data);
    } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <View style={styles.container}>{[...Array(4)].map((_, i) => <SkeletonBox key={i} height={80} style={{ margin: Spacing.md }} />)}</View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📈 {t('predict', language)}</Text>
        <Text style={styles.sub}>AI voorspellings gebaseer op jou geskiedenis</Text>
      </View>
      {predictions.length === 0
        ? <EmptyState icon="trending-up-outline" title={t('stillLearning', language)} />
        : (
          <>
            <FlatList
              data={predictions}
              keyExtractor={(i, idx) => i.productId ?? idx.toString()}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
              renderItem={({ item }) => (
                <GlassCard style={styles.card}>
                  <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.productName}>{item.name ?? item.productName}</Text>
                      <Text style={styles.meta}>R{item.price} • {item.confidence ? Math.round(item.confidence * 100) + '% match' : ''}</Text>
                    </View>
                    <TouchableOpacity style={styles.addBtn} onPress={() => addItem(item.productId)}>
                      <Ionicons name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </GlassCard>
              )}
              contentContainerStyle={{ padding: Spacing.md }}
            />
            <GradientButton
              label={t('addAllToTrolley', language)}
              onPress={() => predictions.forEach(p => p.productId && addItem(p.productId))}
              style={{ margin: Spacing.md }}
            />
          </>
        )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 60, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  title: { color: Colors.textPrimary, fontSize: 26, fontWeight: '800' },
  sub: { color: Colors.textSecondary, fontSize: 13, marginTop: 4 },
  card: { padding: Spacing.md, marginBottom: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center' },
  productName: { color: Colors.textPrimary, fontSize: 16, fontWeight: '600' },
  meta: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  addBtn: { width: 40, height: 40, backgroundColor: Colors.primary, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});

import { ButcherPaywallGate } from '../../src/components/ButcherPaywallGate';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PredictionsScreen() {
  const [butcherTier, setButcherTier] = React.useState<any>('free');
  React.useEffect(() => {
    AsyncStorage.getItem('plan').then(p => { if (p) setButcherTier(p); });
  }, []);
  return (
    <ButcherPaywallGate required="business" currentTier={butcherTier} featureName="Vraagvoorspelling">
      <PredictionsScreenInner />
    </ButcherPaywallGate>
  );
}
