import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { api } from '../../src/services/api';

export default function DiaryScreen() {
  const [entries, setEntries] = useState<any[]>([]);
  const [note, setNote] = useState('');
  const [adding, setAdding] = useState(false);

  const load = () => api.get('/diary').then(r => setEntries(r.data.entries || [])).catch(() => {});
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!note.trim()) return;
    try {
      await api.post('/diary', { note, date: new Date().toISOString() });
      setNote(''); setAdding(false); load();
    } catch { Alert.alert('Error', 'Could not save entry'); }
  };

  return (
    <ScrollView style={s.container}>
      <Text style={s.title}>📓 Meat Diary</Text>
      <TouchableOpacity style={s.addBtn} onPress={() => setAdding(!adding)}>
        <Text style={s.addText}>{adding ? '✕ Cancel' : '+ New Entry'}</Text>
      </TouchableOpacity>
      {adding && (
        <View style={s.form}>
          <TextInput style={s.input} placeholder="What did you cook/buy today?" placeholderTextColor="#666"
            value={note} onChangeText={setNote} multiline numberOfLines={4} />
          <TouchableOpacity style={s.saveBtn} onPress={save}><Text style={s.saveTxt}>Save</Text></TouchableOpacity>
        </View>
      )}
      {entries.map((e, i) => (
        <View key={i} style={s.card}>
          <Text style={s.date}>{new Date(e.date).toLocaleDateString('af-ZA')}</Text>
          <Text style={s.note}>{e.note}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d', padding: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 16, marginTop: 48 },
  addBtn: { backgroundColor: '#1a1a1a', borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#c0392b' },
  addText: { color: '#c0392b', fontWeight: '700' },
  form: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14, marginBottom: 16 },
  input: { color: '#fff', backgroundColor: '#111', borderRadius: 8, padding: 12, marginBottom: 10, minHeight: 80, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: '#c0392b', borderRadius: 8, padding: 12, alignItems: 'center' },
  saveTxt: { color: '#fff', fontWeight: '700' },
  card: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14, marginBottom: 10 },
  date: { color: '#c0392b', fontSize: 12, marginBottom: 4 },
  note: { color: '#fff', fontSize: 14 },
});
