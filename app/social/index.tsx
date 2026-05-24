import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonBox } from '@/components/ui/SkeletonBox';
import { Colors, Spacing, Radius } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/locales';
import api from '@/lib/api';
import { SocialPost } from '@/types';
import { format } from 'date-fns';

export default function SocialScreen() {
  const { language } = useAuthStore();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { const { data } = await api.get('/api/social/posts'); setPosts(data); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, []);

  const like = async (id: string) => {
    await api.post(`/api/social/posts/${id}/like`);
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likesCount: p.liked ? p.likesCount - 1 : p.likesCount + 1, liked: !p.liked } : p));
  };

  if (loading) return <View style={styles.container}>{[...Array(3)].map((_, i) => <SkeletonBox key={i} height={200} style={{ margin: Spacing.md }} />)}</View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>🔥 {t('dieVuurherd', language)}</Text>
          <Text style={styles.sub}>{t('vuurherdSubtitle', language)}</Text>
        </View>
        <TouchableOpacity style={styles.newPost} onPress={() => router.push('/social/create' as any)}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      {posts.length === 0
        ? <EmptyState icon="flame-outline" title={t('vuurherdEmpty', language)} subtitle={t('beFirst', language)} ctaLabel={t('newPost', language)} onCta={() => router.push('/social/create' as any)} />
        : (
          <FlatList
            data={posts} keyExtractor={p => p.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
            renderItem={({ item }) => (
              <View style={styles.card}>
                {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.postImage} />}
                <View style={styles.cardBody}>
                  <Text style={styles.author}>{item.user?.firstName} {item.user?.lastName}</Text>
                  <Text style={styles.caption}>{item.caption}</Text>
                  <View style={styles.actions}>
                    <TouchableOpacity style={styles.likeBtn} onPress={() => like(item.id)}>
                      <Ionicons name={item.liked ? 'heart' : 'heart-outline'} size={20} color={item.liked ? Colors.primary : Colors.textSecondary} />
                      <Text style={styles.likeCount}>{item.likesCount}</Text>
                    </TouchableOpacity>
                    <Text style={styles.date}>{format(new Date(item.createdAt), 'dd MMM')}</Text>
                  </View>
                </View>
              </View>
            )}
          />
        )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  title: { color: Colors.textPrimary, fontSize: 22, fontWeight: '800' },
  sub: { color: Colors.textSecondary, fontSize: 12 },
  newPost: { backgroundColor: Colors.primary, borderRadius: Radius.full, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: Colors.card, marginHorizontal: Spacing.md, marginBottom: Spacing.md, borderRadius: Radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  postImage: { width: '100%', height: 220 },
  cardBody: { padding: Spacing.md },
  author: { color: Colors.secondary, fontSize: 13, fontWeight: '700', marginBottom: 4 },
  caption: { color: Colors.textPrimary, fontSize: 15, lineHeight: 22 },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.sm },
  likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  likeCount: { color: Colors.textSecondary, fontSize: 13 },
  date: { color: Colors.textSecondary, fontSize: 12 },
});
