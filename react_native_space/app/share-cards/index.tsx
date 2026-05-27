import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Share, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/services/api';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { GlassCard } from '../../src/components/GlassCard';
import { colors } from '../../src/theme/colors';

interface ShareCard { id: string; title: string; description: string; url: string; type: string; }

export default function ShareCardsScreen() {
  const [cards, setCards] = useState<ShareCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/share-cards').then(r => setCards(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function shareCard(card: ShareCard) {
    await Share.share({ title: card.title, message: `${card.description}\n${card.url}` });
  }

  if (loading) return <ScreenContainer title="Share Cards"><ActivityIndicator style={{ marginTop: 40 }} /></ScreenContainer>;

  return (
    <ScreenContainer title="Share Cards">
      <FlatList
        data={cards}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <GlassCard style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardType}>{item.type.toUpperCase()}</Text>
              <TouchableOpacity onPress={() => shareCard(item)}>
                <Ionicons name="share-social-outline" size={22} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc}>{item.description}</Text>
          </GlassCard>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No share cards available</Text>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12 },
  card: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardType: { fontSize: 11, fontWeight: '700', color: colors.primary, letterSpacing: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 },
  cardDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  empty: { textAlign: 'center', color: colors.textSecondary, marginTop: 40 },
});
