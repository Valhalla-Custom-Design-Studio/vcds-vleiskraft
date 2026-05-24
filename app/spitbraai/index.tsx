
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/colors';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonBox } from '@/components/ui/SkeletonBox';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/locales';
import api from '@/lib/api';
import { format } from 'date-fns';

const STATUS_COLOR: Record<string, string> = {
  PENDING: Colors.warning, CONFIRMED: Colors.successBright, CANCELLED: Colors.error, COMPLETED: Colors.success,
};

export default function SpitbraaiScreen() {
  const { language } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try { const { data } = await api.get('/api/spitbraai/bookings'); setBookings(data); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <View style={styles.container}>{[...Array(2)].map((_, i) => <SkeletonBox key={i} height={120} style={{ margin: Spacing.md }} />)}</View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔥 {t('spitbraai', language)}</Text>
      </View>
      <GradientButton label={t('bookSpitbraai', language)} onPress={() => router.push('/spitbraai/book')} style={{ marginHorizontal: Spacing.md, marginBottom: Spacing.md }} />
      {bookings.length === 0
        ? <EmptyState icon="bonfire-outline" title="No bookings yet" ctaLabel={t('bookSpitbraai', language)} onCta={() => router.push('/spitbraai/book')} />
        : (
          <FlatList
            data={bookings}
            keyExtractor={i => i.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
            renderItem={({ item }) => (
              <GlassCard style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.venue}>{item.venue}</Text>
                  <View style={[styles.badge, { backgroundColor: (STATUS_COLOR[item.status] ?? Colors.warning) + '33' }]}>
                    <Text style={[styles.badgeText, { color: STATUS_COLOR[item.status] ?? Colors.warning }]}>{item.status}</Text>
                  </View>
                </View>
                <Text style={styles.meta}>{format(new Date(item.eventDate), 'dd MMM yyyy')} • {item.guestCount} guests</Text>
                <Text style={styles.quote}>Quote: R{item.totalQuote?.toFixed(2)}</Text>
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
  venue: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  badge: { borderRadius: Radius.full, paddingVertical: 3, paddingHorizontal: 10 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  meta: { color: Colors.textSecondary, fontSize: 13 },
  quote: { color: Colors.secondary, fontSize: 15, fontWeight: '700', marginTop: 4 },
});
