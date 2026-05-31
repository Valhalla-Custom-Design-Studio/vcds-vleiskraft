
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
const Spacing = { sm: 8, md: 16, lg: 24 };
const Radius = { sm: 8, md: 12, lg: 16 };
import { GlassCard } from '../../src/components/ui/GlassCard';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { SkeletonBox } from '../../src/components/ui/SkeletonBox';
import { useAuthStore } from '../../src/store/authStore';
import { t } from '../../src/locales';
import api from '../../src/lib/api';
import { format } from 'date-fns';

export default function DiaryScreen() {
  const { language } = useAuthStore();
  const [entries, setEntries] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [e, s] = await Promise.allSettled([api.get('/api/diary/entries'), api.get('/api/diary/stats')]);
      if (e.status === 'fulfilled') setEntries(e.value.data);
      if (s.status === 'fulfilled') setStats(s.value.data);
    } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const deleteEntry = (id: string) => {
    Alert.alert(t('delete', language), 'Delete this entry?', [
      { text: t('cancel', language), style: 'cancel' },
      { text: t('delete', language), style: 'destructive', onPress: async () => {
        await api.delete(`/api/diary/entries/${id}`);
        setEntries(prev => prev.filter(e => e.id !== id));
      }},
    ]);
  };

  if (loading) return <View style={styles.container}>{[...Array(3)].map((_, i) => <SkeletonBox key={i} height={100} style={{ margin: Spacing.md }} />)}</View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📔 {t('braaiDiaryTitle', language)}</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/diary/create')}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      {stats && (
        <View style={styles.statsRow}>
          <GlassCard style={styles.stat}><Text style={styles.statNum}>{stats.totalBraais ?? 0}</Text><Text style={styles.statLabel}>{t('totalBraais', language)}</Text></GlassCard>
          <GlassCard style={styles.stat}><Text style={styles.statNum}>{stats.favouriteMeat ?? '—'}</Text><Text style={styles.statLabel}>{t('favouriteMeat', language)}</Text></GlassCard>
          <GlassCard style={styles.stat}><Text style={styles.statNum}>{stats.avgRating?.toFixed(1) ?? '—'}</Text><Text style={styles.statLabel}>{t('avgRating', language)}</Text></GlassCard>
        </View>
      )}
      {entries.length === 0
        ? <EmptyState icon="journal-outline" title={t('diaryEmpty', language)} ctaLabel={t('newEntry', language)} onCta={() => router.push('/diary/create')} />
        : (
          <FlatList
            data={entries}
            keyExtractor={i => i.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
            renderItem={({ item }) => (
              <GlassCard style={styles.card}>
                <View style={styles.cardRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.date}>{format(new Date(item.date), 'dd MMM yyyy')}</Text>
                    <Text style={styles.meats}>{Array.isArray(item.meats) ? item.meats.join(', ') : item.meats}</Text>
                    {item.wood && <Text style={styles.meta}>🪵 {item.wood}</Text>}
                  </View>
                  <View style={styles.ratingRow}>
                    {[1,2,3,4,5].map(s => <Ionicons key={s} name={s <= item.rating ? 'star' : 'star-outline'} size={14} color={Colors.secondary} />)}
                  </View>
                  <TouchableOpacity onPress={() => deleteEntry(item.id)} style={{ padding: 4 }}>
                    <Ionicons name="trash-outline" size={18} color={Colors.error} />
                  </TouchableOpacity>
                </View>
                {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  title: { color: Colors.textPrimary, fontSize: 26, fontWeight: '800' },
  addBtn: { width: 44, height: 44, backgroundColor: Colors.primary, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  stat: { flex: 1, padding: Spacing.sm, alignItems: 'center' },
  statNum: { color: Colors.secondary, fontSize: 20, fontWeight: '800' },
  statLabel: { color: Colors.textSecondary, fontSize: 11, textAlign: 'center', marginTop: 2 },
  card: { padding: Spacing.md, marginBottom: Spacing.sm },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  date: { color: Colors.secondary, fontSize: 13, fontWeight: '600' },
  meats: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700', marginTop: 2 },
  meta: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  ratingRow: { flexDirection: 'row', gap: 2 },
  notes: { color: Colors.textSecondary, fontSize: 13, marginTop: Spacing.sm, fontStyle: 'italic' },
});
