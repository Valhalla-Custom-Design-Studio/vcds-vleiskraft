
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/colors';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/locales';
import api from '@/lib/api';

export default function ShoppingListScreen() {
  const { language } = useAuthStore();
  const [items, setItems] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { const { data } = await api.get('/api/shopping-list'); setItems(data); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const addItem = async () => {
    if (!input.trim()) return;
    try {
      const { data } = await api.post('/api/shopping-list', { customName: input.trim(), quantity: 1 });
      setItems(prev => [...prev, data]);
      setInput('');
    } catch {}
  };

  const toggle = async (item: any) => {
    try {
      await api.patch(`/api/shopping-list/${item.id}`, { checked: !item.checked });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, checked: !i.checked } : i));
    } catch {}
  };

  const remove = async (id: string) => {
    try {
      await api.delete(`/api/shopping-list/${id}`);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch {}
  };

  const aiSuggest = async () => {
    try {
      const { data } = await api.post('/api/shopping-list/ai-suggest');
      setItems(prev => [...prev, ...(data.suggestions ?? [])]);
    } catch { Alert.alert('Error', 'Could not get suggestions'); }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📋 {t('shoppingList', language)}</Text>
        <TouchableOpacity onPress={aiSuggest} style={styles.aiBtn}>
          <Ionicons name="sparkles-outline" size={20} color={Colors.secondary} />
          <Text style={styles.aiBtnText}>AI</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder={t('addItem', language)}
          placeholderTextColor={Colors.textSecondary}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={addItem}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addBtn} onPress={addItem}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      {items.length === 0
        ? <EmptyState icon="list-outline" title={t('listEmpty', language)} />
        : (
          <FlatList
            data={items}
            keyExtractor={i => i.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.item} onPress={() => toggle(item)}>
                <Ionicons name={item.checked ? 'checkbox' : 'square-outline'} size={24} color={item.checked ? Colors.successBright : Colors.textSecondary} />
                <Text style={[styles.itemText, item.checked && styles.checked]}>{item.customName ?? item.product?.nameEn}</Text>
                <TouchableOpacity onPress={() => remove(item.id)}>
                  <Ionicons name="trash-outline" size={18} color={Colors.error} />
                </TouchableOpacity>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  title: { color: Colors.textPrimary, fontSize: 26, fontWeight: '800' },
  aiBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.card, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 8, borderWidth: 1, borderColor: Colors.border },
  aiBtnText: { color: Colors.secondary, fontWeight: '700' },
  inputRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.md },
  input: { flex: 1, height: 52, backgroundColor: Colors.elevated, borderRadius: Radius.sm, paddingHorizontal: Spacing.md, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border, fontSize: 15 },
  addBtn: { width: 52, height: 52, backgroundColor: Colors.primary, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  itemText: { flex: 1, color: Colors.textPrimary, fontSize: 16 },
  checked: { textDecorationLine: 'line-through', color: Colors.textSecondary },
});
