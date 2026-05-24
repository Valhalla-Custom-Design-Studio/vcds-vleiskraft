import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { Colors, Spacing, Radius } from '@/constants/colors';
import { t } from '@/locales';

const MENU_ITEMS = (lang: 'af'|'en', role: string) => {
  const items = [
    { label: 'VleisGPT™', icon: 'chatbubble-ellipses-outline' as const, route: '/vleisgpt' },
    { label: t('shoppingList', lang), icon: 'list-outline' as const, route: '/shopping-list' },
    { label: t('stampCard', lang), icon: 'card-outline' as const, route: '/stamp-card' },
    { label: t('vleiskraftPoints', lang), icon: 'trophy-outline' as const, route: '/loyalty' },
    { label: t('meatBox', lang), icon: 'cube-outline' as const, route: '/subscriptions' },
    { label: t('meatCredit', lang), icon: 'cash-outline' as const, route: '/layby' },
    { label: t('meatAcademy', lang), icon: 'school-outline' as const, route: '/academy' },
    { label: t('referFriend', lang), icon: 'share-social-outline' as const, route: '/loyalty' },
    { label: t('whatsappOrder', lang), icon: 'logo-whatsapp' as const, route: '/whatsapp' },
    { label: t('spitbraai', lang), icon: 'bonfire-outline' as const, route: '/spitbraai' },
    { label: t('storeInfo', lang), icon: 'location-outline' as const, route: '/store' },
    { label: t('supportTitle', lang), icon: 'help-circle-outline' as const, route: '/support' },
    { label: t('legal', lang), icon: 'document-text-outline' as const, route: '/legal' },
  ];
  if (role === 'ADMIN' || role === 'STAFF') {
    items.splice(0, 0, { label: t('adminPanel', lang), icon: 'shield-outline' as const, route: '/admin' });
  }
  return items;
};

export default function ProfileScreen() {
  const { user, language, setLanguage, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(t('logOut', language), 'Wil jy regtig uitstaan?', [
      { text: t('cancelBtn', language), style: 'cancel' },
      { text: t('logOut', language), style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/login'); } },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('profile', language)}</Text>
      </View>
      <GlassCard style={styles.userCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={36} color={Colors.secondary} />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.role}>{user?.role}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/profile/edit' as any)}>
          <Ionicons name="pencil-outline" size={20} color={Colors.secondary} />
        </TouchableOpacity>
      </GlassCard>

      {/* Language Toggle */}
      <GlassCard style={styles.langCard}>
        <Text style={styles.langLabel}>{t('language', language)}</Text>
        <View style={styles.langRow}>
          <Text style={[styles.langOpt, language === 'af' && styles.langActive]}>Afrikaans</Text>
          <Switch
            value={language === 'en'}
            onValueChange={(v) => setLanguage(v ? 'en' : 'af')}
            trackColor={{ false: Colors.primary, true: Colors.secondary }}
            thumbColor="#fff"
          />
          <Text style={[styles.langOpt, language === 'en' && styles.langActive]}>English</Text>
        </View>
      </GlassCard>

      {/* Menu Items */}
      <GlassCard style={styles.menuCard}>
        {MENU_ITEMS(language, user?.role ?? 'CUSTOMER').map((item, i) => (
          <TouchableOpacity key={i} style={[styles.menuItem, i > 0 && styles.menuBorder]} onPress={() => router.push(item.route as any)}>
            <Ionicons name={item.icon} size={20} color={Colors.secondary} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </GlassCard>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        <Text style={styles.logoutText}>{t('logOut', language)}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingTop: 60, paddingBottom: Spacing.xxl },
  header: { marginBottom: Spacing.md },
  title: { color: Colors.textPrimary, fontSize: 28, fontWeight: '800' },
  userCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.elevated, alignItems: 'center', justifyContent: 'center' },
  userInfo: { flex: 1 },
  name: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700' },
  email: { color: Colors.textSecondary, fontSize: 13 },
  role: { color: Colors.secondary, fontSize: 11, fontWeight: '600', marginTop: 2 },
  langCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  langLabel: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600' },
  langRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  langOpt: { color: Colors.textSecondary, fontSize: 13 },
  langActive: { color: Colors.textPrimary, fontWeight: '700' },
  menuCard: { marginBottom: Spacing.md, padding: 0 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md },
  menuBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  menuLabel: { flex: 1, color: Colors.textPrimary, fontSize: 15 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, justifyContent: 'center', padding: Spacing.md, backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.error + '44' },
  logoutText: { color: Colors.error, fontSize: 16, fontWeight: '600' },
});
