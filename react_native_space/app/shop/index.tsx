import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Switch
} from 'react-native';
import { useI18n } from '../../src/i18n';

const MOCK_PRODUCTS = [
  { id: '1', nameEn: 'Ribeye Steak', nameAf: 'Riboog-steak', price: 189.99, unit: '500g' },
  { id: '2', nameEn: 'Boerewors', nameAf: 'Boerewors', price: 89.99, unit: '1kg' },
  { id: '3', nameEn: 'Lamb Chops', nameAf: 'Lamtjops', price: 149.99, unit: '500g' },
  { id: '4', nameEn: 'Chicken Braai Pack', nameAf: 'Hoender Braai-pak', price: 79.99, unit: '1.5kg' },
  { id: '5', nameEn: 'Pork Belly', nameAf: 'Varkpens', price: 99.99, unit: '1kg' },
  { id: '6', nameEn: 'Biltong', nameAf: 'Biltong', price: 129.99, unit: '250g' },
];

export default function ShopScreen() {
  const { t, lang, toggleLang } = useI18n();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<string[]>([]);

  const filtered = MOCK_PRODUCTS.filter(p =>
    (lang === 'af' ? p.nameAf : p.nameEn).toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (id: string) => setCart(prev => [...prev, id]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.nav?.shop ?? (lang === 'af' ? 'Winkel' : 'Shop')}</Text>
        <View style={styles.langRow}>
          <Text style={styles.langLabel}>EN</Text>
          <Switch
            value={lang === 'af'}
            onValueChange={toggleLang}
            trackColor={{ false: '#555', true: '#B22222' }}
            thumbColor="#fff"
            accessibilityLabel={lang === 'en' ? 'Switch to Afrikaans' : 'Skakel na Engels'}
          />
          <Text style={styles.langLabel}>AF</Text>
        </View>
      </View>

      {/* Search */}
      <TextInput
        style={styles.search}
        value={search}
        onChangeText={setSearch}
        placeholder={lang === 'af' ? 'Soek vleis...' : 'Search meat...'}
        placeholderTextColor="#666"
        accessibilityLabel={lang === 'af' ? 'Soek produkte' : 'Search products'}
      />

      {/* Cart Badge */}
      {cart.length > 0 && (
        <TouchableOpacity style={styles.cartBadge} accessibilityRole="button">
          <Text style={styles.cartBadgeText}>
            🛒 {cart.length} {lang === 'af' ? 'items in mandjie' : 'items in cart'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Product Grid */}
      <FlatList
        data={filtered}
        keyExtractor={p => p.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardImg}>
              <Text style={styles.cardEmoji}>🥩</Text>
            </View>
            <Text style={styles.productName}>
              {lang === 'af' ? item.nameAf : item.nameEn}
            </Text>
            <Text style={styles.productUnit}>{item.unit}</Text>
            <Text style={styles.productPrice}>R{item.price.toFixed(2)}</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => addToCart(item.id)}
              accessibilityRole="button"
              accessibilityLabel={lang === 'af' ? `Voeg ${item.nameAf} by mandjie` : `Add ${item.nameEn} to cart`}
            >
              <Text style={styles.addBtnText}>
                {lang === 'af' ? '+ Mandjie' : '+ Cart'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#111', borderBottomWidth: 1, borderBottomColor: '#333',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  langRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  langLabel: { color: '#aaa', fontSize: 12, fontWeight: '600' },
  search: {
    margin: 12, backgroundColor: '#2a2a2a', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 10, color: '#fff', fontSize: 15,
  },
  cartBadge: {
    marginHorizontal: 12, marginBottom: 8, backgroundColor: '#B22222',
    borderRadius: 8, padding: 10, alignItems: 'center',
  },
  cartBadgeText: { color: '#fff', fontWeight: '700' },
  grid: { paddingHorizontal: 8, paddingBottom: 20 },
  card: {
    flex: 1, margin: 6, backgroundColor: '#2a2a2a',
    borderRadius: 12, padding: 12, alignItems: 'center',
  },
  cardImg: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: '#333', alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  cardEmoji: { fontSize: 32 },
  productName: { color: '#fff', fontSize: 13, fontWeight: '600', textAlign: 'center', marginBottom: 2 },
  productUnit: { color: '#888', fontSize: 11, marginBottom: 4 },
  productPrice: { color: '#B22222', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  addBtn: {
    backgroundColor: '#B22222', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  addBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
