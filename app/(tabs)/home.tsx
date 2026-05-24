import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, FlatList, Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProductImage } from '@/components/shop/ProductImage';
import { SkeletonBox } from '@/components/ui/SkeletonBox';
import { GradientButton } from '@/components/ui/GradientButton';
import { Colors, Spacing, Radius } from '@/constants/colors';
import { t } from '@/locales';
import api from '@/lib/api';
import { Product, Category } from '@/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.lg * 3) / 2;

const SMART_TOOLS = (lang: 'af'|'en') => [
  { label: 'VleisGPT™', icon: 'chatbubble-ellipses-outline' as const, route: '/vleisgpt', paid: true },
  { label: t('smartBundle', lang), icon: 'gift-outline' as const, route: '/bundles', paid: true },
  { label: t('weeklyMenu', lang), icon: 'calendar-outline' as const, route: '/meal-planner', paid: true },
  { label: t('braaiWeather', lang), icon: 'partly-sunny-outline' as const, route: '/weather', paid: true },
  { label: t('predict', lang), icon: 'trending-up-outline' as const, route: '/predictions', paid: true },
  { label: t('smartReorder', lang), icon: 'refresh-outline' as const, route: '/reorder', paid: true },
  { label: t('whatsappOrder', lang), icon: 'logo-whatsapp' as const, route: '/whatsapp', paid: false },
  { label: t('shoppingList', lang), icon: 'list-outline' as const, route: '/shopping-list', paid: false },
];

const COMMUNITY_ITEMS = (lang: 'af'|'en') => [
  { label: t('dieVuurherd', lang), icon: 'flame' as const, route: '/social', color: Colors.primary },
  { label: t('braaiDiary', lang), icon: 'journal-outline' as const, route: '/diary', color: Colors.secondary },
  { label: t('ousRecipes', lang), icon: 'restaurant-outline' as const, route: '/recipes', color: Colors.success },
  { label: t('stockvel', lang), icon: 'people-outline' as const, route: '/stockvel', color: Colors.secondary },
  { label: t('competitions', lang), icon: 'trophy-outline' as const, route: '/competitions', color: Colors.primary },
  { label: t('meatAcademy', lang), icon: 'school-outline' as const, route: '/academy', color: Colors.successBright },
];

export default function HomeScreen() {
  const { user, language } = useAuthStore();
  const { itemCount, addItem } = useCartStore();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [weekly, setWeekly] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unread, setUnread] = useState(0);
  const [braaiTip, setBraaiTip] = useState(t('perfectBraai', language));

  const load = useCallback(async () => {
    try {
      const [f, c, w, u] = await Promise.allSettled([
        api.get('/api/products?featured=true&limit=10'),
        api.get('/api/categories'),
        api.get('/api/products/weekly-special'),
        api.get('/api/notifications/unread-count'),
      ]);
      if (f.status === 'fulfilled') setFeatured(f.value.data);
      if (c.status === 'fulfilled') setCategories(c.value.data);
      if (w.status === 'fulfilled') setWeekly(w.value.data);
      if (u.status === 'fulfilled') setUnread(u.value.data.count ?? 0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  const onRefresh = () => { setRefreshing(true); load(); };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>🥩 La Oma™</Text>
          <Text style={styles.name}>Howzit, {user?.firstName ?? 'daar'}!</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.bell}>
            <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
            {unread > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{unread}</Text></View>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/cart')} style={styles.bell}>
            <Ionicons name="cart-outline" size={24} color={Colors.textPrimary} />
            {itemCount() > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{itemCount()}</Text></View>}
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Banner */}
      <LinearGradient colors={[Colors.primaryDark, '#1A0000']} style={styles.hero}>
        <Text style={styles.heroTip}>🔥 {braaiTip}</Text>
        {weekly && (
          <TouchableOpacity onPress={() => router.push(`/shop/product/${weekly.id}`)}>
            <Text style={styles.heroPickLabel}>{t('todaysPick', language)}</Text>
            <Text style={styles.heroPickName}>{language === 'af' ? weekly.nameAf : weekly.nameEn}</Text>
            <Text style={styles.heroPickPrice}>R{weekly.specialPrice ?? weekly.price}</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* Specials Carousel */}
      {featured.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('specials', language)}</Text>
          <FlatList
            data={featured} horizontal showsHorizontalScrollIndicator={false}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.specialCard} onPress={() => router.push(`/shop/product/${item.id}`)}>
                <ProductImage uri={item.imageUrl} size={80} />
                <Text style={styles.specialName} numberOfLines={1}>{language === 'af' ? item.nameAf : item.nameEn}</Text>
                <Text style={styles.specialPrice}>R{item.specialPrice ?? item.price}</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => addItem(item.id)}>
                  <Ionicons name="add" size={18} color="#fff" />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('categories', language)}</Text>
          <View style={styles.catGrid}>
            {categories.slice(0, 6).map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.catCard} onPress={() => router.push(`/shop/category/${cat.id}`)}>
                <Ionicons name="restaurant-outline" size={24} color={Colors.secondary} />
                <Text style={styles.catName} numberOfLines={1}>{language === 'af' ? cat.nameAf : cat.nameEn}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Community */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('community', language)}</Text>
        <View style={styles.grid2}>
          {COMMUNITY_ITEMS(language).map((item) => (
            <TouchableOpacity key={item.label} style={styles.communityCard} onPress={() => router.push(item.route as any)}>
              <Ionicons name={item.icon} size={28} color={item.color} />
              <Text style={styles.communityLabel} numberOfLines={1}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Smart Tools */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('smartTools', language)}</Text>
        <View style={styles.grid2}>
          {SMART_TOOLS(language).map((tool) => (
            <TouchableOpacity key={tool.label} style={styles.toolCard} onPress={() => router.push(tool.route as any)}>
              <Ionicons name={tool.icon} size={24} color={Colors.secondary} />
              <Text style={styles.toolLabel} numberOfLines={1}>{tool.label}</Text>
              {tool.paid && <View style={styles.platBadge}><Text style={styles.platText}>✨</Text></View>}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing.xxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, paddingTop: 60 },
  greeting: { fontSize: 16, color: Colors.secondary, fontWeight: '700' },
  name: { fontSize: 22, color: Colors.textPrimary, fontWeight: '800' },
  headerRight: { flexDirection: 'row', gap: Spacing.sm },
  bell: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  badge: { position: 'absolute', top: 6, right: 6, backgroundColor: Colors.primary, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  hero: { margin: Spacing.md, borderRadius: Radius.lg, padding: Spacing.lg, minHeight: 120 },
  heroTip: { color: Colors.textPrimary, fontSize: 13, marginBottom: Spacing.sm },
  heroPickLabel: { color: Colors.secondary, fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  heroPickName: { color: Colors.textPrimary, fontSize: 20, fontWeight: '800' },
  heroPickPrice: { color: Colors.successBright, fontSize: 18, fontWeight: '700' },
  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.lg },
  sectionTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: Spacing.sm },
  specialCard: { width: 140, backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.sm, marginRight: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  specialName: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600', marginTop: Spacing.xs },
  specialPrice: { color: Colors.secondary, fontSize: 15, fontWeight: '700' },
  addBtn: { position: 'absolute', bottom: Spacing.sm, right: Spacing.sm, backgroundColor: Colors.primary, borderRadius: Radius.full, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  catCard: { width: CARD_WIDTH, backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  catName: { color: Colors.textPrimary, fontSize: 12, fontWeight: '600', marginTop: Spacing.xs, textAlign: 'center' },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  communityCard: { width: CARD_WIDTH, backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  communityLabel: { color: Colors.textPrimary, fontSize: 12, fontWeight: '600', marginTop: Spacing.xs, textAlign: 'center' },
  toolCard: { width: CARD_WIDTH, backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border, position: 'relative' },
  toolLabel: { color: Colors.textPrimary, fontSize: 12, fontWeight: '600', marginTop: Spacing.xs, textAlign: 'center' },
  platBadge: { position: 'absolute', top: 6, right: 6 },
  platText: { fontSize: 12 },
});
