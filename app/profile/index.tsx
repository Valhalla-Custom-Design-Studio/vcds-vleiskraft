import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  SafeAreaView, Alert, Switch,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ButcherySelector } from '../../src/components/ButcherySelector';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://vleiskraft-api.onrender.com';

interface User {
  id: string; email: string; first_name: string; last_name: string;
  tier: string; preferred_locale: string; butchery_id?: string;
}

interface Butchery {
  id: string; name: string; city: string; province: string;
  address?: string; phone?: string; is_verified: boolean; tier: string;
}

const L = {
  en: {
    title: 'My Profile', edit: 'Edit Profile', logout: 'Log Out',
    tier: 'Subscription', butchery: 'My Butchery',
    butcheryHint: 'Change your assigned butchery at any time.',
    savingButchery: 'Saving...', butcherySaved: 'Butchery updated!',
    lang: 'Language', langEn: 'English', langAf: 'Afrikaans',
    upgrade: 'Upgrade to Pro', free: 'Free', pro: 'Pro', platinum: 'Platinum',
    logoutConfirm: 'Are you sure you want to log out?',
    yes: 'Yes', no: 'No',
  },
  af: {
    title: 'My Profiel', edit: 'Wysig Profiel', logout: 'Teken Uit',
    tier: 'Intekening', butchery: 'My Slagtery',
    butcheryHint: 'Verander jou toegewysde slagtery enige tyd.',
    savingButchery: 'Stoor...', butcherySaved: 'Slagtery opgedateer!',
    lang: 'Taal', langEn: 'Engels', langAf: 'Afrikaans',
    upgrade: 'Opgradeer na Pro', free: 'Gratis', pro: 'Pro', platinum: 'Platinum',
    logoutConfirm: 'Is jy seker jy wil uitteken?',
    yes: 'Ja', no: 'Nee',
  },
};

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [lang, setLang] = useState<'en' | 'af'>('en');
  const [selectedButchery, setSelectedButchery] = useState<Butchery | null>(null);
  const [savingButchery, setSavingButchery] = useState(false);
  const t = L[lang];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) { router.replace('/auth/login'); return; }
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setLang(data.user.preferred_locale === 'af' ? 'af' : 'en');
        // Load assigned butchery if any
        if (data.user.butchery_id) {
          const bRes = await fetch(`${API_BASE}/api/butcheries/${data.user.butchery_id}`);
          const bData = await bRes.json();
          if (bData.success) setSelectedButchery(bData.butchery);
        }
      }
    } catch (err) {
      console.error('[Profile] Load error:', err);
    }
  };

  const handleButcheryChange = async (butchery: Butchery | null) => {
    setSelectedButchery(butchery);
    setSavingButchery(true);
    try {
      const token = await AsyncStorage.getItem('token');
      await fetch(`${API_BASE}/api/butcheries/me/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ butcheryId: butchery?.id || null }),
      });
      Alert.alert('✅', t.butcherySaved);
    } catch {
      Alert.alert('Error', 'Failed to update butchery');
    } finally {
      setSavingButchery(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('', t.logoutConfirm, [
      { text: t.no, style: 'cancel' },
      {
        text: t.yes, style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('token');
          router.replace('/auth/login');
        },
      },
    ]);
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.first_name?.[0]}{user.last_name?.[0]}
            </Text>
          </View>
          <Text style={styles.name}>{user.first_name} {user.last_name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={[styles.tierBadge, user.tier === 'platinum' && styles.tierPlatinum,
            user.tier === 'pro' && styles.tierPro]}>
            <Text style={styles.tierText}>{t[user.tier as keyof typeof t] || user.tier}</Text>
          </View>
        </View>

        {/* Language toggle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.lang}</Text>
          <View style={styles.langRow}>
            <Text style={[styles.langLabel, lang === 'en' && styles.langActive]}>{t.langEn}</Text>
            <Switch
              value={lang === 'af'}
              onValueChange={v => setLang(v ? 'af' : 'en')}
              trackColor={{ false: '#333', true: '#B22222' }}
              thumbColor="#fff"
              accessibilityLabel="Toggle language"
            />
            <Text style={[styles.langLabel, lang === 'af' && styles.langActive]}>{t.langAf}</Text>
          </View>
        </View>

        {/* Butchery selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.butchery}</Text>
          <Text style={styles.sectionHint}>{t.butcheryHint}</Text>
          <ButcherySelector
            value={selectedButchery}
            onChange={handleButcheryChange}
            lang={lang}
            required={false}
          />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>{t.logout}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A14' },
  scroll: { padding: 20, paddingBottom: 48 },
  avatarWrap: { alignItems: 'center', marginBottom: 32 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(178,34,34,0.2)',
    borderWidth: 2, borderColor: '#B22222',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { color: '#B22222', fontSize: 28, fontWeight: '800' },
  name: { color: '#F5F0FF', fontSize: 20, fontWeight: '700', marginBottom: 4 },
  email: { color: '#9CA3AF', fontSize: 14, marginBottom: 10 },
  tierBadge: {
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  tierPro: { backgroundColor: 'rgba(178,34,34,0.2)' },
  tierPlatinum: { backgroundColor: 'rgba(212,160,23,0.2)' },
  tierText: { color: '#F5F0FF', fontSize: 13, fontWeight: '700' },
  section: {
    marginBottom: 24, padding: 16, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  sectionTitle: { color: '#F5F0FF', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  sectionHint: { color: '#6B7280', fontSize: 13, marginBottom: 12 },
  langRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  langLabel: { color: '#6B7280', fontSize: 15, fontWeight: '600' },
  langActive: { color: '#F5F0FF' },
  logoutBtn: {
    height: 52, borderRadius: 12,
    borderWidth: 1.5, borderColor: 'rgba(239,68,68,0.4)',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: '700' },
});
