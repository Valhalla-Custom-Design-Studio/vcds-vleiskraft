
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Image, Alert } from 'react-native';
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

export default function CompetitionsScreen() {
  const { language } = useAuthStore();
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try { const { data } = await api.get('/api/competitions'); setCompetitions(data); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <View style={styles.container}>{[...Array(2)].map((_, i) => <SkeletonBox key={i} height={120} style={{ margin: Spacing.md }} />)}</View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏆 {t('competitions', language)}</Text>
      </View>
      {competitions.length === 0
        ? <EmptyState icon="trophy-outline" title={t('noCompetitions', language)} />
        : (
          <FlatList
            data={competitions}
            keyExtractor={i => i.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
            renderItem={({ item }) => (
              <GlassCard style={styles.card}>
                <Text style={styles.compTitle}>{language === 'af' ? item.titleAf : item.titleEn}</Text>
                <Text style={styles.desc}>{language === 'af' ? item.descAf : item.descEn}</Text>
                <View style={styles.row}>
                  <Text style={styles.entries}>{item._count?.entries ?? 0} {t('entries', language)}</Text>
                  <View style={[styles.badge, { backgroundColor: item.status === 'OPEN' ? Colors.successBright + '33' : Colors.warning + '33' }]}>
                    <Text style={[styles.badgeText, { color: item.status === 'OPEN' ? Colors.successBright : Colors.warning }]}>{item.status}</Text>
                  </View>
                </View>
                {item.status === 'OPEN' && (
                  <TouchableOpacity style={styles.enterBtn}>
                    <Text style={styles.enterText}>{t('enter', language)}</Text>
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
  card: { padding: Spacing.md, marginBottom: Spacing.md },
  compTitle: { color: Colors.secondary, fontSize: 18, fontWeight: '700', marginBottom: 4 },
  desc: { color: Colors.textSecondary, fontSize: 14, marginBottom: Spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  entries: { color: Colors.textSecondary, fontSize: 13 },
  badge: { borderRadius: Radius.full, paddingVertical: 3, paddingHorizontal: 10 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  enterBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center' },
  enterText: { color: '#fff', fontWeight: '700' },
});
