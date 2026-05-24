import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors, Spacing } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/locales';
import api from '@/lib/api';

export default function LegalScreen() {
  const { language } = useAuthStore();
  const [tab, setTab] = useState<'privacy'|'terms'>('privacy');
  const [content, setContent] = useState('');

  useEffect(() => {
    api.get(`/api/legal/${tab}`).then(r => setContent(r.data.content ?? '')).catch(() => setContent(''));
  }, [tab]);

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>{t('legal', language)}</Text></View>
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'privacy' && styles.activeTab]} onPress={() => setTab('privacy')}>
          <Text style={[styles.tabText, tab === 'privacy' && styles.activeTabText]}>{t('privacyPolicy', language)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'terms' && styles.activeTab]} onPress={() => setTab('terms')}>
          <Text style={[styles.tabText, tab === 'terms' && styles.activeTabText]}>{t('terms', language)}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.body}>{content || 'Laai...'}</Text>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 60, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  title: { color: '#F5F0EB', fontSize: 24, fontWeight: '800' },
  tabs: { flexDirection: 'row', paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  tab: { flex: 1, padding: Spacing.sm, alignItems: 'center', borderRadius: 8, backgroundColor: '#1A1A1A' },
  activeTab: { backgroundColor: '#C8102E' },
  tabText: { color: '#A89B8C', fontWeight: '600' },
  activeTabText: { color: '#fff' },
  content: { padding: Spacing.md },
  body: { color: '#A89B8C', fontSize: 14, lineHeight: 22 },
});
