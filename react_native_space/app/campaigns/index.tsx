import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { api } from '../../src/services/api';

export default function CampaignsScreen() {
  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    api.get('/campaigns').then(r => setCampaigns(r.data.campaigns || [])).catch(() => {});
  }, []);

  const claim = async (id: string) => {
    try { await api.post(`/campaigns/${id}/claim`); Alert.alert('🎉', 'Voucher claimed!'); }
    catch (e: any) { Alert.alert('Error', e.message); }
  };

  return (
    <ScrollView style={s.container}>
      <Text style={s.title}>🎯 Promotions & Campaigns</Text>
      {campaigns.map(c => (
        <View key={c.id} style={s.card}>
          <View style={s.badge}><Text style={s.badgeTxt}>{c.discount}% OFF</Text></View>
          <Text style={s.name}>{c.title}</Text>
          <Text style={s.desc}>{c.description}</Text>
          <Text style={s.expires}>Expires: {new Date(c.expires_at).toLocaleDateString('af-ZA')}</Text>
          <TouchableOpacity style={s.btn} onPress={() => claim(c.id)}>
            <Text style={s.btnText}>Claim Voucher</Text>
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
  badge: { backgroundColor: '#c0392b', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 8 },
  badgeTxt: { color: '#fff', fontWeight: '800', fontSize: 12 },
  name: { color: '#fff', fontWeight: '700', fontSize: 16, marginBottom: 4 },
  desc: { color: '#888', fontSize: 13, marginBottom: 6 },
  expires: { color: '#555', fontSize: 11, marginBottom: 10 },
  btn: { backgroundColor: '#c0392b', borderRadius: 8, padding: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
});
