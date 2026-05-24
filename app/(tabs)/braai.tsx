import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/locales';

const TOOLS = (lang: 'af'|'en') => [
  { key: 'coalCheck', icon: 'bonfire-outline' as const, route: '/braai/kole-kyk', gradient: ['#C8102E','#8B0A1E'] as [string,string], desc: 'AI analyseers jou kole' },
  { key: 'meatCheck', icon: 'nutrition-outline' as const, route: '/braai/vleis-kyk', gradient: ['#D4A56A','#B8864A'] as [string,string], desc: 'AI bepaal gaarvlak' },
  { key: 'portionCalc', icon: 'calculator-outline' as const, route: '/braai/vleis-rekenaar', gradient: ['#4A7C59','#27AE60'] as [string,string], desc: 'AI berekeninge vir jou braai' },
  { key: 'woodAdvisor', icon: 'leaf-outline' as const, route: '/braai/hout-raadgewer', gradient: ['#6B4226','#8B5E3C'] as [string,string], desc: 'Beste hout vir jou vleis' },
];

export default function BraaiScreen() {
  const { language } = useAuthStore();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>🔥 {t('braaiTitle', language)}</Text>
        <Text style={styles.sub}>AI-aangedrewe braai intelligensie</Text>
      </View>
      {TOOLS(language).map((tool) => (
        <TouchableOpacity key={tool.key} onPress={() => router.push(tool.route as any)} style={styles.card}>
          <LinearGradient colors={tool.gradient} style={styles.iconBg}>
            <Ionicons name={tool.icon} size={36} color="#fff" />
          </LinearGradient>
          <View style={styles.cardContent}>
            <Text style={styles.toolName}>{t(tool.key as any, language)}</Text>
            <Text style={styles.toolDesc}>{tool.desc}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingTop: 60, paddingBottom: Spacing.xxl },
  header: { marginBottom: Spacing.xl },
  title: { color: Colors.textPrimary, fontSize: 28, fontWeight: '800' },
  sub: { color: Colors.textSecondary, fontSize: 14, marginTop: 4 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: Spacing.md },
  iconBg: { width: 64, height: 64, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  cardContent: { flex: 1 },
  toolName: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700' },
  toolDesc: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
});
