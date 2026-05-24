import React from 'react';
import { View, Text, FlatList, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useI18n } from '../../src/i18n';

const STATUS_COLORS: Record<string, string> = {
  delivered: '#22c55e', processing: '#f59e0b', cancelled: '#ef4444', pending: '#888',
};

const MOCK_ORDERS = [
  { id: 'ORD-001', date: '2026-05-18', total: 429.97, status: 'delivered',
    items: [{ nameEn: 'Ribeye Steak', nameAf: 'Riboog-steak', qty: 2 }, { nameEn: 'Boerewors', nameAf: 'Boerewors', qty: 1 }] },
  { id: 'ORD-002', date: '2026-05-20', total: 149.99, status: 'processing',
    items: [{ nameEn: 'Lamb Chops', nameAf: 'Lamtjops', qty: 1 }] },
  { id: 'ORD-003', date: '2026-05-21', total: 79.99, status: 'pending',
    items: [{ nameEn: 'Chicken Braai Pack', nameAf: 'Hoender Braai-pak', qty: 1 }] },
];

const STATUS_LABELS: Record<string, { en: string; af: string }> = {
  delivered: { en: 'Delivered', af: 'Afgelewer' },
  processing: { en: 'Processing', af: 'Verwerk' },
  cancelled: { en: 'Cancelled', af: 'Gekanselleer' },
  pending: { en: 'Pending', af: 'Hangende' },
};

export default function OrdersScreen() {
  const { t, lang, toggleLang } = useI18n();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.nav?.orders ?? (lang === 'af' ? 'Bestellings' : 'Orders')}</Text>
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

      <FlatList
        data={MOCK_ORDERS}
        keyExtractor={o => o.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} accessibilityRole="button">
            <View style={styles.cardTop}>
              <Text style={styles.orderId}>{item.id}</Text>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '22' }]}>
                <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
                  {STATUS_LABELS[item.status]?.[lang] ?? item.status}
                </Text>
              </View>
            </View>
            <Text style={styles.orderDate}>{item.date}</Text>
            <View style={styles.divider} />
            {item.items.map((i, idx) => (
              <Text key={idx} style={styles.itemLine}>
                • {lang === 'af' ? i.nameAf : i.nameEn} × {i.qty}
              </Text>
            ))}
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{lang === 'af' ? 'Totaal' : 'Total'}</Text>
              <Text style={styles.totalValue}>R{item.total.toFixed(2)}</Text>
            </View>
          </TouchableOpacity>
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
  list: { padding: 16 },
  card: {
    backgroundColor: '#2a2a2a', borderRadius: 12, padding: 16, marginBottom: 12,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  orderId: { color: '#fff', fontSize: 15, fontWeight: '700' },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontSize: 12, fontWeight: '700' },
  orderDate: { color: '#888', fontSize: 12, marginBottom: 10 },
  divider: { height: 1, backgroundColor: '#333', marginVertical: 8 },
  itemLine: { color: '#ccc', fontSize: 13, marginBottom: 3 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { color: '#aaa', fontSize: 14 },
  totalValue: { color: '#B22222', fontSize: 15, fontWeight: '700' },
});
