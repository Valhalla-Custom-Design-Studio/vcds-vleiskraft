import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { EmptyState } from '@/components/ui/EmptyState';
import { Colors, Spacing, Radius } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/locales';
import api from '@/lib/api';
import { Notification } from '@/types';
import { format } from 'date-fns';

export default function NotificationsScreen() {
  const { language } = useAuthStore();
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    api.get('/api/notifications').then(r => setItems(r.data));
  }, []);

  const markRead = async (id: string) => {
    await api.patch(`/api/notifications/${id}/read`);
    setItems(prev => prev.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>{t('notifications', language)}</Text></View>
      {items.length === 0
        ? <EmptyState icon="notifications-outline" title={t('noNotifications', language)} />
        : <FlatList data={items} keyExtractor={i => i.id} renderItem={({ item }) => (
          <TouchableOpacity style={[styles.item, !item.readAt && styles.unread]} onPress={() => markRead(item.id)}>
            <Text style={styles.notifTitle}>{item.title}</Text>
            <Text style={styles.notifBody}>{item.body}</Text>
            <Text style={styles.date}>{format(new Date(item.sentAt), 'dd MMM HH:mm')}</Text>
          </TouchableOpacity>
        )} />
      }
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 60, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  title: { color: Colors.textPrimary, fontSize: 24, fontWeight: '800' },
  item: { backgroundColor: Colors.card, marginHorizontal: Spacing.md, marginBottom: Spacing.sm, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  unread: { borderLeftWidth: 3, borderLeftColor: Colors.primary },
  notifTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 2 },
  notifBody: { color: Colors.textSecondary, fontSize: 13, marginBottom: 4 },
  date: { color: Colors.textSecondary, fontSize: 11 },
});
