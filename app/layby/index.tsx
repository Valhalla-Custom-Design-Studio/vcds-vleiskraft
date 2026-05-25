
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Colors, Spacing, Radius } from '@/constants/colors';
import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonBox } from '@/components/ui/SkeletonBox';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/locales';
import api from '@/lib/api';
import { format } from 'date-fns';

export default function LaybyScreen() {
  const { language } = useAuthStore();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try { const { data } = await api.get('/api/layby/my'); setPlans(data); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const pay = (id: string) => {
    Alert.prompt('Make Payment', 'Enter amount (R)', async (amount) => {
      if (!amount) return;
      try {
        await api.post(`/api/layby/${id}/pay`, { amount: Number(amount) });
        load();
      } catch { Alert.alert('Error', 'Payment failed'); }
    });
  };

  if (loading) return <View style={styles.container}>{[...Array(2)].map((_, i) => <SkeletonBox key={i} height={120} style={{ margin: Spacing.md }} />)}</View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💳 {t('meatCredit', language)}</Text>
      </View>
      {plans.length === 0
        ? <EmptyState icon="cash-outline" title={t('noLayby', language)} />
        : (
          <FlatList
            data={plans}
            keyExtractor={i => i.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
            renderItem={({ item }) => {
              const pct = Math.min(100, (item.paidAmount / item.totalAmount) * 100);
              return (
                <GlassCard style={styles.card}>
                  <View style={styles.row}>
                    <Text style={styles.amount}>R{item.totalAmount?.toFixed(2)}</Text>
                    <Text style={styles.status}>{item.status}</Text>
                  </View>
                  <View style={styles.progressBg}>
                    <View style={[styles.progressFill, { width: `${pct}%` }]} />
                  </View>
                  <Text style={styles.meta}>R{item.paidAmount?.toFixed(2)} {t('paid', language)} • {item.installments} {t('installments', language)}</Text>
                  {item.nextDue && <Text style={styles.nextDue}>{t('nextDue', language)}: {format(new Date(item.nextDue), 'dd MMM yyyy')}</Text>}
                  {item.status === 'ACTIVE' && (
                    <TouchableOpacity style={styles.payBtn} onPress={() => pay(item.id)}>
                      <Text style={styles.payBtnText}>Make Payment</Text>
                    </TouchableOpacity>
                  )}
                </GlassCard>
              );
            }}
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
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  amount: { color: Colors.textPrimary, fontSize: 20, fontWeight: '800' },
  status: { color: Colors.secondary, fontSize: 14, fontWeight: '600' },
  progressBg: { height: 8, backgroundColor: Colors.elevated, borderRadius: 4, marginBottom: Spacing.sm },
  progressFill: { height: 8, backgroundColor: Colors.successBright, borderRadius: 4 },
  meta: { color: Colors.textSecondary, fontSize: 13 },
  nextDue: { color: Colors.warning, fontSize: 13, marginTop: 4 },
  payBtn: { marginTop: Spacing.sm, backgroundColor: Colors.primary, borderRadius: Radius.sm, padding: Spacing.sm, alignItems: 'center' },
  payBtnText: { color: '#fff', fontWeight: '700' },
});
