
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
const Spacing = { sm: 8, md: 16, lg: 24 };
const Radius = { sm: 8, md: 12, lg: 16 };
import { GlassCard } from '../../src/components/ui/GlassCard';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { SkeletonBox } from '../../src/components/ui/SkeletonBox';
import { useAuthStore } from '../../src/store/authStore';
import { useCartStore } from '../../src/store/cartStore';
import { t } from '../../src/locales';
import api from '../../src/lib/api';

export default function ReorderScreen() {
  const { language } = useAuthStore();
  const { addItem } = useCartStore();
  const [nudges, setNudges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try { const { data } = await api.get('/api/reorder/nudges'); setNudges(data.nudges ?? data); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <View style={styles.container}>{[...Array(4)].map((_, i) => <SkeletonBox key={i} height={80} style={{ margin: Spacing.md }} />)}</View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔄 {t('smartReorder', language)}</Text>
        <Text style={styles.sub}>Produkte wat jy gereeld bestel</Text>
      </View>
      {nudges.length === 0
        ? <EmptyState icon="refresh-outline" title={t('orderMoreSuggestions', language)} />
        : (
          <FlatList
            data={nudges}
            keyExtractor={(i, idx) => i.productId ?? idx.toString()}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
            renderItem={({ item }) => (
              <GlassCard style={styles.card}>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.name ?? item.productName}</Text>
                    <Text style={styles.meta}>{item.daysSince} {t('daysAgo', language)} • {item.orderCount} {t('ordered', language)}</Text>
                  </View>
                  <TouchableOpacity style={styles.addBtn} onPress={() => addItem(item.productId)}>
                    <Ionicons name="cart-outline" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
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
  sub: { color: Colors.textSecondary, fontSize: 13, marginTop: 4 },
  card: { padding: Spacing.md, marginBottom: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center' },
  name: { color: Colors.textPrimary, fontSize: 16, fontWeight: '600' },
  meta: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  addBtn: { width: 44, height: 44, backgroundColor: Colors.primary, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
