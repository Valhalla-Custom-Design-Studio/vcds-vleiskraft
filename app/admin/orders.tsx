
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/colors';
import { SkeletonBox } from '@/components/ui/SkeletonBox';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/locales';
import api from '@/lib/api';
import { format } from 'date-fns';

const STATUSES = ['PENDING','CONFIRMED','PREPARING','READY','COLLECTED','DELIVERED','CANCELLED'];
const STATUS_COLOR: Record<string, string> = {
  PENDING: Colors.warning, CONFIRMED: Colors.secondary, PREPARING: Colors.secondary,
  READY: Colors.successBright, COLLECTED: Colors.success, DELIVERED: Colors.success, CANCELLED: Colors.error,
};

export default function AdminOrdersScreen() {
  const { language } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/api/admin/orders');
      setOrders(data);
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, []);

  const updateStatus = (orderId: string, current: string) => {
    const idx = STATUSES.indexOf(current);
    const next = STATUSES[idx + 1];
    if (!next || next === 'CANCELLED') return;
    Alert.alert('Update Status', `Move to ${next}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: async () => {
        await api.patch(`/api/admin/orders/${orderId}`, { status: next });
        load();
      }},
    ]);
  };

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  if (loading) return <View style={styles.container}>{[...Array(5)].map((_, i) => <SkeletonBox key={i} height={80} style={{ margin: Spacing.md }} />)}</View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>📋 {t('manageOrders', language)}</Text></View>
      <FlatList
        horizontal showsHorizontalScrollIndicator={false}
        data={['ALL', ...STATUSES]}
        keyExtractor={i => i}
        style={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.filterChip, filter === item && styles.filterActive]} onPress={() => setFilter(item)}>
            <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />
      {filtered.length === 0
        ? <EmptyState icon="receipt-outline" title="No orders" />
        : (
          <FlatList
            data={filtered}
            keyExtractor={i => i.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.card} onPress={() => updateStatus(item.id, item.status)}>
                <View style={styles.row}>
                  <Text style={styles.orderId}>#{item.id.slice(-6).toUpperCase()}</Text>
                  <View style={[styles.badge, { backgroundColor: STATUS_COLOR[item.status] + '33' }]}>
                    <Text style={[styles.badgeText, { color: STATUS_COLOR[item.status] }]}>{item.status}</Text>
                  </View>
                </View>
                <View style={styles.row}>
                  <Text style={styles.meta}>{item.user?.firstName} {item.user?.lastName} • {format(new Date(item.createdAt), 'dd MMM HH:mm')}</Text>
                  <Text style={styles.total}>R{item.totalAmount?.toFixed(2)}</Text>
                </View>
                <Text style={styles.tap}>Tap to advance status →</Text>
              </TouchableOpacity>
            )}
          />
        )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 60, paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  title: { color: Colors.textPrimary, fontSize: 24, fontWeight: '800' },
  filterList: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, maxHeight: 50 },
  filterChip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.card, marginRight: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  filterActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  card: { backgroundColor: Colors.card, marginHorizontal: Spacing.md, marginBottom: Spacing.sm, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  orderId: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  badge: { borderRadius: Radius.full, paddingVertical: 3, paddingHorizontal: 10 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  meta: { color: Colors.textSecondary, fontSize: 12 },
  total: { color: Colors.secondary, fontSize: 16, fontWeight: '700' },
  tap: { color: Colors.textSecondary, fontSize: 11, marginTop: 4, fontStyle: 'italic' },
});
