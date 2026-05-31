
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
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

const CATEGORIES = ['All', 'Cuts', 'Braai', 'Storage', 'Recipes', 'Business'];

export default function AcademyScreen() {
  const { language } = useAuthStore();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cat, setCat] = useState('All');

  const load = async () => {
    try {
      const { data } = await api.get('/api/academy' + (cat !== 'All' ? `?category=${cat}` : ''));
      setArticles(data);
    } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, [cat]);

  if (loading) return <View style={styles.container}>{[...Array(4)].map((_, i) => <SkeletonBox key={i} height={80} style={{ margin: Spacing.md }} />)}</View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎓 {t('meatAcademy', language)}</Text>
      </View>
      <FlatList
        horizontal showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={i => i}
        style={styles.catList}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.catChip, cat === item && styles.catActive]} onPress={() => setCat(item)}>
            <Text style={[styles.catText, cat === item && styles.catTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />
      {articles.length === 0
        ? <EmptyState icon="school-outline" title={t('noArticles', language)} />
        : (
          <FlatList
            data={articles}
            keyExtractor={i => i.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => router.push(`/academy/${item.id}`)}>
                <GlassCard style={styles.card}>
                  <Text style={styles.category}>{item.category}</Text>
                  <Text style={styles.articleTitle}>{language === 'af' ? item.titleAf : item.titleEn}</Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} style={styles.chevron} />
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
  header: { paddingTop: 60, paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  title: { color: Colors.textPrimary, fontSize: 26, fontWeight: '800' },
  catList: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, maxHeight: 50 },
  catChip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.card, marginRight: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  catActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  catTextActive: { color: '#fff' },
  card: { padding: Spacing.md, marginBottom: Spacing.sm, flexDirection: 'row', alignItems: 'center' },
  category: { color: Colors.secondary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 },
  articleTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '600', flex: 1 },
  chevron: { marginLeft: 'auto' },
});
