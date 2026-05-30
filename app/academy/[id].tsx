import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '@/constants/colors';
import { GlassCard } from '@/components/ui/GlassCard';
import { HeatBar } from '@/components/ui/HeatBar';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/locales';
import api from '@/lib/api';

export default function AcademyArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { language } = useAuthStore();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/academy/${id}`).then(({ data }) => setArticle(data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <View style={s.center}><ActivityIndicator color={Colors.primary} size="large" /></View>;
  if (!article) return <View style={s.center}><Text style={s.err}>Article not found</Text></View>;

  const title = language === 'af' ? article.titleAf : article.titleEn;
  const body = language === 'af' ? article.bodyAf : article.bodyEn;
  const tips = language === 'af' ? article.tipsAf : article.tipsEn;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <TouchableOpacity style={s.back} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        <Text style={s.backText}>{t('back', language)}</Text>
      </TouchableOpacity>

      <View style={s.badge}>
        <Text style={s.badgeText}>{article.category?.toUpperCase()}</Text>
      </View>

      <Text style={s.title}>{title}</Text>

      {article.heatLevel != null && (
        <GlassCard style={s.heatCard}>
          <Text style={s.heatLabel}>{language === 'af' ? 'Hitte Vlak' : 'Heat Level'}</Text>
          <HeatBar level={article.heatLevel} />
        </GlassCard>
      )}

      <Text style={s.body}>{body}</Text>

      {tips && tips.length > 0 && (
        <GlassCard style={s.tipsCard}>
          <Text style={s.tipsTitle}>💡 {language === 'af' ? 'Pro Wenke' : 'Pro Tips'}</Text>
          {tips.map((tip: string, i: number) => (
            <View key={i} style={s.tipRow}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
              <Text style={s.tipText}>{tip}</Text>
            </View>
          ))}
        </GlassCard>
      )}

      {article.relatedCuts && article.relatedCuts.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>{language === 'af' ? 'Verwante Snitte' : 'Related Cuts'}</Text>
          {article.relatedCuts.map((cut: string, i: number) => (
            <View key={i} style={s.cutRow}>
              <Ionicons name="restaurant-outline" size={14} color={Colors.primary} />
              <Text style={s.cutText}>{cut}</Text>
            </View>
          ))}
        </View>
      )}

      {article.videoUrl && (
        <GlassCard style={s.videoCard}>
          <Ionicons name="play-circle-outline" size={40} color={Colors.primary} />
          <Text style={s.videoText}>{language === 'af' ? 'Video Beskikbaar' : 'Video Available'}</Text>
        </GlassCard>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 60 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  err: { color: Colors.textSecondary },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.md },
  backText: { color: Colors.primary, fontSize: 15 },
  badge: { backgroundColor: Colors.primary + '20', borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: Spacing.sm },
  badgeText: { color: Colors.primary, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.md, lineHeight: 32 },
  heatCard: { marginBottom: Spacing.md },
  heatLabel: { color: Colors.textSecondary, fontSize: 12, marginBottom: 6 },
  body: { color: Colors.textPrimary, fontSize: 15, lineHeight: 24, marginBottom: Spacing.lg },
  tipsCard: { marginBottom: Spacing.lg },
  tipsTitle: { color: Colors.textPrimary, fontWeight: '700', fontSize: 15, marginBottom: Spacing.sm },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  tipText: { color: Colors.textSecondary, fontSize: 14, flex: 1 },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { color: Colors.textPrimary, fontWeight: '700', fontSize: 15, marginBottom: Spacing.sm },
  cutRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  cutText: { color: Colors.textSecondary, fontSize: 14 },
  videoCard: { alignItems: 'center', gap: 8, paddingVertical: Spacing.lg },
  videoText: { color: Colors.textSecondary, fontSize: 14 },
});
