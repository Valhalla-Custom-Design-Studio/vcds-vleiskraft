import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Switch
} from 'react-native';
import { useI18n } from '../../src/i18n';

const MOCK_CART = [
  { id: '1', nameEn: 'Ribeye Steak', nameAf: 'Riboog-steak', price: 189.99, qty: 2 },
  { id: '2', nameEn: 'Boerewors', nameAf: 'Boerewors', price: 89.99, qty: 1 },
  { id: '3', nameEn: 'Lamb Chops', nameAf: 'Lamtjops', price: 149.99, qty: 1 },
];

export default function CartScreen() {
  const { t, lang, toggleLang } = useI18n();
  const [items, setItems] = useState(MOCK_CART);

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const updateQty = (id: string, delta: number) => {
    setItems(prev =>
      prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i)
          .filter(i => i.qty > 0)
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.nav?.cart ?? (lang === 'af' ? 'Mandjie' : 'Cart')}</Text>
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

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyText}>
            {lang === 'af' ? 'Jou mandjie is leeg.' : 'Your cart is empty.'}
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={i => i.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <View style={styles.rowInfo}>
                  <Text style={styles.itemName}>
                    {lang === 'af' ? item.nameAf : item.nameEn}
                  </Text>
                  <Text style={styles.itemPrice}>R{(item.price * item.qty).toFixed(2)}</Text>
                </View>
                <View style={styles.qtyRow}>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, -1)}>
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyNum}>{item.qty}</Text>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, 1)}>
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          {/* Summary */}
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {lang === 'af' ? 'Subtotaal' : 'Subtotal'}
              </Text>
              <Text style={styles.summaryValue}>R{total.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {lang === 'af' ? 'Aflewering' : 'Delivery'}
              </Text>
              <Text style={styles.summaryValue}>R0.00</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>
                {lang === 'af' ? 'Totaal' : 'Total'}
              </Text>
              <Text style={styles.totalValue}>R{total.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn} accessibilityRole="button">
              <Text style={styles.checkoutText}>
                {lang === 'af' ? '💳 Betaal via PayFast' : '💳 Pay via PayFast'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
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
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#888', fontSize: 16 },
  list: { padding: 16 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#2a2a2a', borderRadius: 12, padding: 14, marginBottom: 10,
  },
  rowInfo: { flex: 1 },
  itemName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  itemPrice: { color: '#B22222', fontSize: 14, marginTop: 4 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#333', alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  qtyNum: { color: '#fff', fontSize: 16, fontWeight: '700', minWidth: 20, textAlign: 'center' },
  summary: {
    backgroundColor: '#111', borderTopWidth: 1, borderTopColor: '#333', padding: 20,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { color: '#aaa', fontSize: 14 },
  summaryValue: { color: '#fff', fontSize: 14 },
  totalRow: { borderTopWidth: 1, borderTopColor: '#333', paddingTop: 10, marginTop: 4 },
  totalLabel: { color: '#fff', fontSize: 16, fontWeight: '700' },
  totalValue: { color: '#B22222', fontSize: 18, fontWeight: '700' },
  checkoutBtn: {
    backgroundColor: '#B22222', borderRadius: 12, padding: 16,
    alignItems: 'center', marginTop: 14,
  },
  checkoutText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
