import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { track } from '../services/posthog';
import { captureError } from '../services/sentry';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://vleiskraft-api.onrender.com';

interface Challenge {
  id: string;
  title: string;
  description: string;
  prize: string;
  endsAt: string;
  entryCount: number;
  hasEntered: boolean;
  imageUrl?: string;
  category: 'braai' | 'recipe' | 'photo' | 'loyalty';
}

export default function CommunityChallengesScreen() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchChallenges(); }, []);

  async function fetchChallenges() {
    try {
      const res = await fetch(`${API_BASE}/api/challenges`);
      const data = await res.json();
      setChallenges(data.challenges || []);
    } catch (e) {
      captureError(e, { screen: 'CommunityChallenges' });
    } finally {
      setLoading(false);
    }
  }

  async function enterChallenge(id: string, title: string) {
    try {
      const res = await fetch(`${API_BASE}/api/challenges/${id}/enter`, { method: 'POST' });
      if (!res.ok) throw new Error('Inskrywing misluk');
      track('competition_entered', { challengeId: id, title });
      Alert.alert('✅ Ingeskryf!', `Jy is ingeskryf vir "${title}". Sterkte!`);
      fetchChallenges();
    } catch (e) {
      captureError(e, { screen: 'CommunityChallenges', action: 'enter' });
      Alert.alert('Misluk', String(e));
    }
  }

  const categoryIcon = (cat: Challenge['category']) => {
    const map = { braai: '🔥', recipe: '📖', photo: '📸', loyalty: '⭐' };
    return map[cat] || '🏆';
  };

  const daysLeft = (endsAt: string) => {
    const diff = new Date(endsAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86400000));
  };

  if (loading) return <ActivityIndicator size="large" color="#D4A017" style={{ flex: 1, backgroundColor: '#0B0612' }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🏆 Gemeenskapskompetisies</Text>
      <Text style={styles.subheader}>Wen pryse deur deel te neem aan ons maandelikse uitdagings</Text>
      <FlatList
        data={challenges}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16, gap: 16 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Geen aktiewe kompetisies nie</Text>
            <Text style={styles.emptySubtext}>Kyk later vir nuwe uitdagings</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />}
            <View style={styles.cardBody}>
              <View style={styles.cardHeader}>
                <Text style={styles.categoryBadge}>{categoryIcon(item.category)}</Text>
                <View style={styles.timerBadge}>
                  <Ionicons name="time-outline" size={12} color="#D4A017" />
                  <Text style={styles.timerText}>{daysLeft(item.endsAt)} dae oor</Text>
                </View>
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <View style={styles.prizeRow}>
                <Ionicons name="gift" size={16} color="#D4A017" />
                <Text style={styles.prize}>{item.prize}</Text>
              </View>
              <View style={styles.footer}>
                <Text style={styles.entryCount}>{item.entryCount} inskrywings</Text>
                <TouchableOpacity
                  style={[styles.enterBtn, item.hasEntered && styles.enteredBtn]}
                  onPress={() => !item.hasEntered && enterChallenge(item.id, item.title)}
                  disabled={item.hasEntered}
                >
                  <Text style={styles.enterBtnText}>
                    {item.hasEntered ? '✅ Ingeskryf' : 'Skryf In'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0612' },
  header: { fontSize: 22, fontWeight: 'bold', color: '#F5F0FF', padding: 16, paddingBottom: 4 },
  subheader: { fontSize: 13, color: '#8B7BA0', paddingHorizontal: 16, paddingBottom: 8 },
  card: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cardImage: { width: '100%', height: 160 },
  cardBody: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  categoryBadge: { fontSize: 24 },
  timerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(212,160,23,0.15)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  timerText: { color: '#D4A017', fontSize: 12 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#F5F0FF', marginBottom: 6 },
  description: { fontSize: 14, color: '#C4B5D4', lineHeight: 20, marginBottom: 12 },
  prizeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  prize: { color: '#D4A017', fontWeight: 'bold', fontSize: 15 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  entryCount: { color: '#8B7BA0', fontSize: 13 },
  enterBtn: { backgroundColor: '#6B21A8', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  enteredBtn: { backgroundColor: 'rgba(34,197,94,0.2)', borderWidth: 1, borderColor: '#22C55E' },
  enterBtnText: { color: '#fff', fontWeight: 'bold' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#F5F0FF', fontSize: 16, fontWeight: 'bold' },
  emptySubtext: { color: '#8B7BA0', marginTop: 8 },
});
