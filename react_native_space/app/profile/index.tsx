import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch
} from 'react-native';
import { useI18n } from '../../src/i18n';

export default function ProfileScreen() {
  const { t, lang, toggleLang } = useI18n();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ── Language Toggle ── */}
      <View style={styles.langRow} accessibilityRole="switch" accessibilityLabel="Toggle language">
        <Text style={styles.langLabel}>🇬🇧 EN</Text>
        <Switch
          value={lang === 'af'}
          onValueChange={toggleLang}
          trackColor={{ false: '#ccc', true: '#B22222' }}
          thumbColor="#fff"
          accessibilityLabel={lang === 'en' ? 'Switch to Afrikaans' : 'Skakel na Engels'}
        />
        <Text style={styles.langLabel}>🇿🇦 AF</Text>
      </View>

      {/* ── Profile Header ── */}
      <View style={styles.avatarBlock}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>SL</Text>
        </View>
        <Text style={styles.name}>Stephan Lombard</Text>
        <Text style={styles.role}>{t.profile?.role ?? (lang === 'af' ? 'Slagter' : 'Butcher')}</Text>
      </View>

      {/* ── Subscription Tier ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t.profile?.subscription ?? (lang === 'af' ? 'Intekening' : 'Subscription')}</Text>
        <Text style={styles.tierBadge}>VleisKraft™ Pro</Text>
        <Text style={styles.cardSub}>{t.profile?.renewsOn ?? (lang === 'af' ? 'Hernu op' : 'Renews on')} 1 Jul 2026</Text>
      </View>

      {/* ── Settings ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t.profile?.settings ?? (lang === 'af' ? 'Instellings' : 'Settings')}</Text>
        {[
          t.profile?.editProfile ?? (lang === 'af' ? 'Wysig Profiel' : 'Edit Profile'),
          t.profile?.notifications ?? (lang === 'af' ? 'Kennisgewings' : 'Notifications'),
          t.profile?.privacy ?? (lang === 'af' ? 'Privaatheid' : 'Privacy'),
          t.profile?.support ?? (lang === 'af' ? 'Ondersteuning' : 'Support'),
        ].map((item, i) => (
          <TouchableOpacity key={i} style={styles.settingsRow} accessibilityRole="button">
            <Text style={styles.settingsText}>{item}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Sign Out ── */}
      <TouchableOpacity style={styles.signOutBtn} accessibilityRole="button">
        <Text style={styles.signOutText}>
          {t.profile?.signOut ?? (lang === 'af' ? 'Teken Uit' : 'Sign Out')}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  content: { padding: 20, paddingBottom: 40 },
  langRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end',
    gap: 8, marginBottom: 20,
  },
  langLabel: { color: '#ccc', fontSize: 13, fontWeight: '600' },
  avatarBlock: { alignItems: 'center', marginBottom: 28 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#B22222', alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '700' },
  name: { color: '#fff', fontSize: 20, fontWeight: '700' },
  role: { color: '#aaa', fontSize: 14, marginTop: 4 },
  card: {
    backgroundColor: '#2a2a2a', borderRadius: 12, padding: 16, marginBottom: 16,
  },
  cardTitle: { color: '#B22222', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 10 },
  tierBadge: {
    color: '#fff', fontSize: 16, fontWeight: '700',
    backgroundColor: '#B22222', alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20,
  },
  cardSub: { color: '#aaa', fontSize: 12, marginTop: 6 },
  settingsRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#333',
  },
  settingsText: { color: '#fff', fontSize: 15 },
  chevron: { color: '#666', fontSize: 18 },
  signOutBtn: {
    backgroundColor: '#333', borderRadius: 12, padding: 16,
    alignItems: 'center', marginTop: 8,
  },
  signOutText: { color: '#ff4444', fontSize: 16, fontWeight: '600' },
});
