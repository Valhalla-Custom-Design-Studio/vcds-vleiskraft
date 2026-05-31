import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, StatusBar, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const GOLD = '#C9A84C';
const BG = '#0A0A0A';
const SURFACE = '#141414';
const BORDER = 'rgba(255,255,255,0.08)';
const TEXT = '#FFFFFF';
const MUTED = '#888888';
const RED = '#C0392B';

const PLAN_COLORS: Record<string, string> = {
  free: '#555555',
  starter: '#C0392B',
  pro: '#8B0000',
  business: '#1a3a5c',
  enterprise: GOLD,
  consumer_premium: GOLD,
};

const PLAN_LABELS: Record<string, { en: string; af: string }> = {
  free: { en: 'Freemium', af: 'Gratis' },
  starter: { en: 'Starter', af: 'Beginners' },
  pro: { en: 'Pro', af: 'Pro' },
  business: { en: 'Business', af: 'Besigheid' },
  enterprise: { en: 'Enterprise', af: 'Onderneming' },
  consumer_premium: { en: 'Premium Consumer', af: 'Premium Verbruiker' },
};

type Lang = 'en' | 'af';

export default function ProfileScreen() {
  const [lang, setLang] = useState<Lang>('af');
  const [user, setUser] = useState<any>(null);
  const [plan, setPlan] = useState<string>('free');
  const [userType, setUserType] = useState<string>('butcher');

  useEffect(() => {
    async function load() {
      const u = await AsyncStorage.getItem('user');
      const p = await AsyncStorage.getItem('plan');
      const ut = await AsyncStorage.getItem('userType');
      if (u) setUser(JSON.parse(u));
      if (p) setPlan(p);
      if (ut) setUserType(ut);
    }
    load();
  }, []);

  async function handleLogout() {
    Alert.alert(
      'VleisKraft™',
      lang === 'af' ? 'Wil jy uitteken?' : 'Log out?',
      [
        { text: lang === 'af' ? 'Nee' : 'No', style: 'cancel' },
        {
          text: lang === 'af' ? 'Ja' : 'Yes',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove(['token', 'user', 'userType', 'plan']);
            router.replace('/auth/login');
          },
        },
      ]
    );
  }

  const planColor = PLAN_COLORS[plan] || MUTED;
  const planLabel = PLAN_LABELS[plan]?.[lang] || plan;
  const isButcher = userType === 'butcher';
  const canUpgrade = isButcher && plan !== 'enterprise';

  const sections = [
    {
      title: lang === 'af' ? 'Rekening' : 'Account',
      items: [
        { icon: 'person-outline', label: lang === 'af' ? 'Persoonlike Besonderhede' : 'Personal Details', onPress: () => {} },
        { icon: 'lock-closed-outline', label: lang === 'af' ? 'Wagwoord Verander' : 'Change Password', onPress: () => {} },
        { icon: 'language-outline', label: lang === 'af' ? 'Taal' : 'Language', onPress: () => setLang(lang === 'af' ? 'en' : 'af') },
      ],
    },
    ...(isButcher ? [{
      title: lang === 'af' ? 'Slagtery' : 'Butchery',
      items: [
        { icon: 'storefront-outline', label: lang === 'af' ? 'Slagtery Profiel' : 'Butchery Profile', onPress: () => router.push('/admin/index') },
        { icon: 'receipt-outline', label: lang === 'af' ? 'Bestellings' : 'Orders', onPress: () => router.push('/(tabs)/orders/index') },
        { icon: 'megaphone-outline', label: lang === 'af' ? 'Veldtogte' : 'Campaigns', onPress: () => router.push('/campaigns/index') },
      ],
    }] : []),
    {
      title: lang === 'af' ? 'Ondersteuning' : 'Support',
      items: [
        { icon: 'help-circle-outline', label: lang === 'af' ? 'Hulp & FAQ' : 'Help & FAQ', onPress: () => {} },
        { icon: 'chatbubble-outline', label: lang === 'af' ? 'Kontak Ons' : 'Contact Us', onPress: () => {} },
      ],
    },
  ];

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Avatar + Plan Badge */}
        <LinearGradient colors={['#1a0a00', BG]} style={s.hero}>
          <View style={[s.avatar, { shadowColor: planColor }]}>
            <Text style={s.avatarText}>
              {user?.firstName?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={s.name}>{user ? `${user.firstName} ${user.lastName}` : '—'}</Text>
          <Text style={s.email}>{user?.email || '—'}</Text>

          {/* Plan badge */}
          <LinearGradient colors={[planColor + '33', planColor + '11']} style={[s.planBadge, { borderColor: planColor + '55' }]}>
            <Ionicons name={isButcher ? 'storefront' : 'person'} size={13} color={planColor} />
            <Text style={[s.planBadgeText, { color: planColor }]}>
              {isButcher ? '🔪 ' : '🛒 '}{planLabel}
            </Text>
          </LinearGradient>

          {/* Upgrade CTA for butchers not on enterprise */}
          {canUpgrade && (
            <TouchableOpacity onPress={() => router.push('/paywall/butcher-plans')} style={s.upgradeBtn}>
              <LinearGradient colors={[GOLD, '#A07830']} style={s.upgradeBtnGrad}>
                <Ionicons name="arrow-up-circle" size={16} color="#000" />
                <Text style={s.upgradeBtnText}>{lang === 'af' ? 'Gradeer Op' : 'Upgrade Plan'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </LinearGradient>

        {/* Sections */}
        {sections.map((section) => (
          <View key={section.title} style={s.section}>
            <Text style={s.sectionTitle}>{section.title}</Text>
            <View style={s.sectionCard}>
              {section.items.map((item, i) => (
                <TouchableOpacity key={item.label} onPress={item.onPress} style={[s.row, i < section.items.length - 1 && s.rowBorder]}>
                  <View style={s.rowIcon}>
                    <Ionicons name={item.icon as any} size={18} color={GOLD} />
                  </View>
                  <Text style={s.rowLabel}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color={MUTED} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity onPress={handleLogout} style={s.logoutBtn}>
          <Ionicons name="log-out-outline" size={18} color={RED} />
          <Text style={s.logoutText}>{lang === 'af' ? 'Uitteken' : 'Log Out'}</Text>
        </TouchableOpacity>

        <Text style={s.version}>VleisKraft™ v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  scroll: { paddingBottom: 40 },
  hero: { alignItems: 'center', paddingTop: 32, paddingBottom: 28, paddingHorizontal: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1a0a00', borderWidth: 2, borderColor: GOLD, alignItems: 'center', justifyContent: 'center', marginBottom: 12, shadowOpacity: 0.6, shadowRadius: 16, elevation: 10 },
  avatarText: { fontSize: 32, fontWeight: '900', color: GOLD },
  name: { fontSize: 22, fontWeight: '800', color: TEXT, marginBottom: 4 },
  email: { fontSize: 14, color: MUTED, marginBottom: 14 },
  planBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 14 },
  planBadgeText: { fontSize: 13, fontWeight: '700' },
  upgradeBtn: { borderRadius: 12, overflow: 'hidden' },
  upgradeBtnGrad: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 10 },
  upgradeBtnText: { fontSize: 14, fontWeight: '800', color: '#000' },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: MUTED, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 },
  sectionCard: { backgroundColor: SURFACE, borderRadius: 16, borderWidth: 1, borderColor: BORDER, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: BORDER },
  rowIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(201,168,76,0.1)', alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontSize: 15, color: TEXT },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 16, marginTop: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(192,57,43,0.3)' },
  logoutText: { fontSize: 15, fontWeight: '700', color: RED },
  version: { textAlign: 'center', color: MUTED, fontSize: 12, marginTop: 16 },
});
