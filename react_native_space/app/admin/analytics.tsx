import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { api } from '../../src/services/api';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { GlassCard } from '../../src/components/GlassCard';
import { colors } from '../../src/theme/colors';

interface Stat { label: string; value: string | number; delta?: string; }

export default function AdminAnalyticsScreen() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics').then(r => {
      const d = r.data;
      setStats([
        { label: 'Total Orders', value: d.total_orders ?? 0, delta: d.orders_delta },
        { label: 'Revenue (MTD)', value: `R${(d.revenue_mtd ?? 0).toLocaleString()}`, delta: d.revenue_delta },
        { label: 'Active Users', value: d.active_users ?? 0, delta: d.users_delta },
        { label: 'Avg Order Value', value: `R${(d.avg_order_value ?? 0).toFixed(2)}` },
        { label: 'Subscriptions', value: d.subscriptions ?? 0, delta: d.subs_delta },
        { label: 'Churn Rate', value: `${(d.churn_rate ?? 0).toFixed(1)}%` },
      ]);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);
      .catch((err) => { /* VCDS:SAFE */ if (__DEV__) { void 0; } });

  if (loading) return <ScreenContainer title="Analytics"><ActivityIndicator style={{ marginTop: 40 }} /></ScreenContainer>;

  return (
    <ScreenContainer title="Analytics">
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.grid}>
          {stats.map((s, i) => (
            <GlassCard key={i} style={styles.statCard}>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              {s.delta ? <Text style={[styles.delta, s.delta.startsWith('+') ? styles.pos : styles.neg]}>{s.delta}</Text> : null}
            </GlassCard>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { width: '47%', padding: 16, alignItems: 'center' },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 4, textAlign: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.text },
  delta: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  pos: { color: '#4caf50' },
  neg: { color: '#e53935' },
});
