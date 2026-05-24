
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/colors';
import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonBox } from '@/components/ui/SkeletonBox';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/locales';
import api from '@/lib/api';

export default function StockvelScreen() {
  const { language } = useAuthStore();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try { const { data } = await api.get('/api/stockvel/groups'); setGroups(data); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <View style={styles.container}>{[...Array(3)].map((_, i) => <SkeletonBox key={i} height={100} style={{ margin: Spacing.md }} />)}</View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🤝 {t('stockvel', language)}</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/stockvel/create')}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      {groups.length === 0
        ? <EmptyState icon="people-outline" title={t('noStockvel', language)} ctaLabel={t('newGroup', language)} onCta={() => router.push('/stockvel/create')} />
        : (
          <FlatList
            data={groups}
            keyExtractor={i => i.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => router.push(`/stockvel/${item.id}`)}>
                <GlassCard style={styles.card}>
                  <Text style={styles.groupName}>{item.name}</Text>
                  <View style={styles.progressBg}>
                    <View style={[styles.progressFill, { width: `${Math.min(100, (item.balance / item.targetAmount) * 100)}%` }]} />
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.balance}>R{item.balance?.toFixed(2)} / R{item.targetAmount?.toFixed(2)}</Text>
                    <Text style={styles.members}>{item._count?.members ?? 0} {t('members', language)}</Text>
                  </View>
                </GlassCard>
              </TouchableOpacity>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  title: { color: Colors.textPrimary, fontSize: 26, fontWeight: '800' },
  addBtn: { width: 44, height: 44, backgroundColor: Colors.primary, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  card: { padding: Spacing.md, marginBottom: Spacing.sm },
  groupName: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: Spacing.sm },
  progressBg: { height: 8, backgroundColor: Colors.elevated, borderRadius: 4, marginBottom: Spacing.sm },
  progressFill: { height: 8, backgroundColor: Colors.successBright, borderRadius: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  balance: { color: Colors.secondary, fontSize: 14, fontWeight: '600' },
  members: { color: Colors.textSecondary, fontSize: 13 },
});
