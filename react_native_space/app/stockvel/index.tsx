import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { api } from '../../src/services/api';

export default function StockvelScreen() {
  const [groups, setGroups] = useState<any[]>([]);
  const [myGroup, setMyGroup] = useState<any>(null);

  useEffect(() => {
    api.get('/stockvel/groups').then(r => setGroups(r.data.groups || [])).catch(() => {});
    api.get('/stockvel/my').then(r => setMyGroup(r.data.group)).catch(() => {});
  }, []);

  const join = async (id: string) => {
    try { await api.post(`/stockvel/groups/${id}/join`); Alert.alert('✅', 'Joined group!'); }
    catch (e: any) { Alert.alert('Error', e.message); }
  };

  return (
    <ScrollView style={s.container}>
      <Text style={s.title}>👥 Stockvel Buying Groups</Text>
      {myGroup && (
        <View style={s.myCard}>
          <Text style={s.myTitle}>Your Group: {myGroup.name}</Text>
          <Text style={s.mySub}>Members: {myGroup.member_count} | Pool: R{myGroup.pool_amount?.toFixed(2)}</Text>
        </View>
      )}
      <Text style={s.sectionTitle}>Available Groups</Text>
      {groups.map(g => (
        <View key={g.id} style={s.card}>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{g.name}</Text>
            <Text style={s.sub}>{g.member_count}/{g.max_members} members • R{g.monthly_contribution}/mo</Text>
          </View>
          <TouchableOpacity style={s.joinBtn} onPress={() => join(g.id)}>
            <Text style={s.joinText}>Join</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d', padding: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 16, marginTop: 48 },
  myCard: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#c0392b' },
  myTitle: { color: '#c0392b', fontWeight: '700', fontSize: 16 },
  mySub: { color: '#888', marginTop: 4 },
  sectionTitle: { color: '#fff', fontWeight: '700', marginBottom: 12 },
  card: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  name: { color: '#fff', fontWeight: '600' },
  sub: { color: '#888', fontSize: 12, marginTop: 2 },
  joinBtn: { backgroundColor: '#c0392b', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  joinText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
