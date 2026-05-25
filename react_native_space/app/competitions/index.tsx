import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { api } from '../../src/services/api';

export default function CompetitionsScreen() {
  const [comps, setComps] = useState<any[]>([]);

  useEffect(() => {
    api.get('/challenges').then(r => setComps(r.data.challenges || [])).catch(() => {});
  }, []);

  const enter = async (id: string) => {
    try { await api.post(`/challenges/${id}/enter`); Alert.alert('🏆', 'Entered!'); }
    catch (e: any) { Alert.alert('Error', e.message); }
  };

  return (
    <ScrollView style={s.container}>
      <Text style={s.title}>🏆 Competitions & Challenges</Text>
      {comps.map(c => (
        <View key={c.id} style={s.card}>
          <Text style={s.name}>{c.title}</Text>
          <Text style={s.desc}>{c.description}</Text>
          <View style={s.row}>
            <Text style={s.prize}>Prize: R{c.prize_value?.toFixed(0)}</Text>
            <Text style={s.ends}>Ends: {new Date(c.ends_at).toLocaleDateString('af-ZA')}</Text>
          </View>
          <TouchableOpacity style={s.btn} onPress={() => enter(c.id)}>
            <Text style={s.btnText}>Enter Now</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d', padding: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 16, marginTop: 48 },
  card: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 12 },
  name: { color: '#fff', fontWeight: '700', fontSize: 16, marginBottom: 4 },
  desc: { color: '#888', fontSize: 13, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  prize: { color: '#c0392b', fontWeight: '700' },
  ends: { color: '#888', fontSize: 12 },
  btn: { backgroundColor: '#c0392b', borderRadius: 8, padding: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
});
