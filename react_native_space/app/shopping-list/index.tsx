import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { api } from '../../src/services/api';

export default function ShoppingListScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState('');

  const load = () => api.get('/shopping-list').then(r => setItems(r.data.items || [])).catch(() => {});
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!newItem.trim()) return;
    try { await api.post('/shopping-list', { name: newItem }); setNewItem(''); load(); }
    catch { Alert.alert('Error', 'Could not add item'); }
  };

  const toggle = async (id: string, checked: boolean) => {
    try { await api.patch(`/shopping-list/${id}`, { checked: !checked }); load(); }
    catch {}
  };

  const remove = async (id: string) => {
    try { await api.delete(`/shopping-list/${id}`); load(); }
    catch {}
  };

  return (
    <ScrollView style={s.container}>
      <Text style={s.title}>🛒 Shopping List</Text>
      <View style={s.inputRow}>
        <TextInput style={s.input} placeholder="Add item..." placeholderTextColor="#666"
          value={newItem} onChangeText={setNewItem} />
        <TouchableOpacity style={s.addBtn} onPress={add}><Text style={s.addTxt}>+</Text></TouchableOpacity>
      </View>
      {items.map(item => (
        <View key={item.id} style={s.item}>
          <TouchableOpacity onPress={() => toggle(item.id, item.checked)} style={s.check}>
            <Text style={s.checkTxt}>{item.checked ? '✅' : '⬜'}</Text>
          </TouchableOpacity>
          <Text style={[s.name, item.checked && s.checked]}>{item.name}</Text>
          <TouchableOpacity onPress={() => remove(item.id)}>
            <Text style={s.del}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d', padding: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 16, marginTop: 48 },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  input: { flex: 1, backgroundColor: '#1a1a1a', color: '#fff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#333' },
  addBtn: { backgroundColor: '#c0392b', borderRadius: 10, width: 44, justifyContent: 'center', alignItems: 'center' },
  addTxt: { color: '#fff', fontSize: 24, fontWeight: '700' },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 10, padding: 12, marginBottom: 8 },
  check: { marginRight: 10 },
  checkTxt: { fontSize: 18 },
  name: { flex: 1, color: '#fff', fontSize: 15 },
  checked: { textDecorationLine: 'line-through', color: '#555' },
  del: { color: '#555', fontSize: 16, paddingLeft: 10 },
});
