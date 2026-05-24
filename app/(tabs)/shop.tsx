import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ProductImage } from '@/components/shop/ProductImage';
import { SkeletonBox } from '@/components/ui/SkeletonBox';
import { EmptyState } from '@/components/ui/EmptyState';
import { Colors, Spacing, Radius } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { t } from '@/locales';
import api from '@/lib/api';
import { Product } from '@/types';

export default function ShopScreen() {
  const { language } = useAuthStore();
  const { addItem } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/api/products');
      setProducts(data); setFiltered(data);
    } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const onSearch = (q: string) => {
    setSearch(q);
    if (!q.trim()) { setFiltered(products); return; }
    const lq = q.toLowerCase();
    setFiltered(products.filter(p =>
      p.nameAf.toLowerCase().includes(lq) || p.nameEn.toLowerCase().includes(lq)
    ));
  };

  if (loading) {
    return (
      <View style={styles.container}>
        {[...Array(6)].map((_, i) => <SkeletonBox key={i} height={80} style={{ margin: Spacing.md }} />)}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('shop', language)}</Text>
      </View>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput} placeholder={t('searchProducts', language)}
          placeholderTextColor={Colors.textSecondary} value={search} onChangeText={onSearch}
        />
      </View>
      {filtered.length === 0
        ? <EmptyState icon="search-outline" title={t('noResults', language)} />
        : (
          <FlatList
            data={filtered} keyExtractor={(i) => i.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
            numColumns={2} columnWrapperStyle={styles.row}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.card} onPress={() => router.push(`/shop/product/${item.id}`)}>
                <ProductImage uri={item.imageUrl} size={100} />
                <Text style={styles.name} numberOfLines={2}>{language === 'af' ? item.nameAf : item.nameEn}</Text>
                <Text style={styles.price}>R{item.price}/{t('perKg', language)}</Text>
                {!item.inStock
                  ? <Text style={styles.oos}>{t('outOfStock', language)}</Text>
                  : (
                    <TouchableOpacity style={styles.addBtn} onPress={() => addItem(item.id)}>
                      <Ionicons name="add" size={16} color="#fff" />
                      <Text style={styles.addText}>{t('addToCart', language)}</Text>
                    </TouchableOpacity>
                  )
                }
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
  title: { color: Colors.textPrimary, fontSize: 28, fontWeight: '800' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.elevated, margin: Spacing.md, borderRadius: Radius.sm, paddingHorizontal: Spacing.md, height: 48, borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, color: Colors.textPrimary, marginLeft: Spacing.sm, fontSize: 15 },
  row: { paddingHorizontal: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.sm },
  card: { flex: 1, backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  name: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600', marginTop: Spacing.xs },
  price: { color: Colors.secondary, fontSize: 15, fontWeight: '700', marginTop: 2 },
  oos: { color: Colors.error, fontSize: 11, marginTop: Spacing.xs },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, borderRadius: Radius.sm, paddingVertical: 6, paddingHorizontal: Spacing.sm, marginTop: Spacing.xs, gap: 4 },
  addText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
