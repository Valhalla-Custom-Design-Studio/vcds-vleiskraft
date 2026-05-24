import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { EmptyState } from '@/components/ui/EmptyState';
import { Colors, Spacing, Radius } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/locales';
import api from '@/lib/api';
import { Recipe } from '@/types';

const CATS = ['Braai','Potjie','Biltong','Sauces','Sides'];

export default function RecipesScreen() {
  const { language } = useAuthStore();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [cat, setCat] = useState('Braai');

  useEffect(() => { api.get(`/api/recipes?category=${cat}`).then(r => setRecipes(r.data)).catch(() => {}); }, [cat]);

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>🍖 {t('ousRecipes', language)}</Text></View>
      <FlatList horizontal data={CATS} keyExtractor={c => c} showsHorizontalScrollIndicator={false} style={styles.tabs}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.tab, cat === item && styles.activeTab]} onPress={() => setCat(item)}>
            <Text style={[styles.tabText, cat === item && styles.activeTabText]}>{item}</Text>
          </TouchableOpacity>
        )} />
      {recipes.length === 0
        ? <EmptyState icon="restaurant-outline" title={t('noResults', language)} />
        : <FlatList data={recipes} keyExtractor={r => r.id} contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.card} onPress={() => router.push(`/recipes/${item.id}` as any)}>
                {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.img} />}
                <View style={styles.info}>
                  <Text style={styles.name}>{language === 'af' ? item.nameAf : item.nameEn}</Text>
                  <Text style={styles.meta}>{item.prepTime + item.cookTime}min • {t(item.difficulty.toLowerCase() as any, language)}</Text>
                </View>
              </TouchableOpacity>
            )} />
      }
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 60, paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  title: { color: Colors.textPrimary, fontSize: 24, fontWeight: '800' },
  tabs: { paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: Radius.full, backgroundColor: Colors.elevated, marginRight: Spacing.sm },
  activeTab: { backgroundColor: Colors.primary },
  tabText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  activeTabText: { color: '#fff' },
  list: { padding: Spacing.md, gap: Spacing.sm },
  card: { backgroundColor: Colors.card, borderRadius: Radius.md, flexDirection: 'row', overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  img: { width: 90, height: 90 },
  info: { flex: 1, padding: Spacing.sm },
  name: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
  meta: { color: Colors.textSecondary, fontSize: 12, marginTop: 4 },
});
