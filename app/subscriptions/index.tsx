
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
const Spacing = { sm: 8, md: 16, lg: 24 };
const Radius = { sm: 8, md: 12, lg: 16 };
import { GlassCard } from '../../src/components/ui/GlassCard';
import { GradientButton } from '../../src/components/ui/GradientButton';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { SkeletonBox } from '../../src/components/ui/SkeletonBox';
import { useAuthStore } from '../../src/store/authStore';
import { t } from '../../src/locales';
import api from '../../src/lib/api';
import { format } from 'date-fns';

export default function SubscriptionsScreen() {
  const { language } = useAuthStore();
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    try { const { data } = await api.get('/api/subscriptions/my'); setSubs(data); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const createSub = async () => {
    setCreating(true);
    try {
      await api.post('/api/subscriptions', { frequency: 'WEEKLY', budget: 500, householdSize: 4, preferences: '' });
      load();
    } catch { Alert.alert('Error', 'Could not create subscription'); }
    finally { setCreating(false); }
  };

  const cancel = (id: string) => {
    Alert.alert(t('cancel', language), 'Cancel this subscription?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes', style: 'destructive', onPress: async () => {
        await api.patch(`/api/subscriptions/${id}/cancel`);
        load();
      }},
    ]);
  };

  if (loading) return <View style={styles.container}>{[...Array(2)].map((_, i) => <SkeletonBox key={i} height={120} style={{ margin: Spacing.md }} />)}</View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📦 {t('meatBox', language)}</Text>
      </View>
      <GradientButton label={creating ? t('loading', language) : t('generateBox', language)} onPress={createSub} loading={creating} style={{ marginHorizontal: Spacing.md, marginBottom: Spacing.md }} />
      {subs.length === 0
        ? <EmptyState icon="cube-outline" title={t('noSubscriptions', language)} />
        : (
          <FlatList
            data={subs}
            keyExtractor={i => i.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
            renderItem={({ item }) => (
              <GlassCard style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.freq}>{item.frequency}</Text>
                  <View style={[styles.badge, { backgroundColor: item.status === 'ACTIVE' ? Colors.successBright + '33' : Colors.error + '33' }]}>
                    <Text style={[styles.badgeText, { color: item.status === 'ACTIVE' ? Colors.successBright : Colors.error }]}>{item.status}</Text>
                  </View>
                </View>
                <Text style={styles.meta}>Budget: R{item.budget} • {item.householdSize} {t('household', language)}</Text>
                {item.nextDelivery && <Text style={styles.next}>Next: {format(new Date(item.nextDelivery), 'dd MMM yyyy')}</Text>}
                {item.status === 'ACTIVE' && (
                  <TouchableOpacity onPress={() => cancel(item.id)} style={styles.cancelBtn}>
                    <Text style={styles.cancelText}>{t('cancel', language)}</Text>
                  </TouchableOpacity>
                )}
              </GlassCard>
            )}
            contentContainerStyle={{ padding: Spacing.md }}
          />
        )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 60, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  title: { color: Colors.textPrimary, fontSize: 26, fontWeight: '800' },
  card: { padding: Spacing.md, marginBottom: Spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  freq: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  badge: { borderRadius: Radius.full, paddingVertical: 3, paddingHorizontal: 10 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  meta: { color: Colors.textSecondary, fontSize: 13 },
  next: { color: Colors.secondary, fontSize: 14, fontWeight: '600', marginTop: 4 },
  cancelBtn: { marginTop: Spacing.sm, padding: Spacing.sm, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.error, alignItems: 'center' },
  cancelText: { color: Colors.error, fontWeight: '700' },
});
