
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/colors';
import { GradientButton } from '@/components/ui/GradientButton';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/locales';
import api from '@/lib/api';

export default function DiaryCreateScreen() {
  const { language } = useAuthStore();
  const [meats, setMeats] = useState('');
  const [wood, setWood] = useState('');
  const [weather, setWeather] = useState('');
  const [rating, setRating] = useState(5);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (!meats) { Alert.alert('Error', 'Enter meats used'); return; }
    setLoading(true);
    try {
      await api.post('/api/diary/entries', {
        date: new Date().toISOString(),
        meats: meats.split(',').map(m => m.trim()),
        woodUsed: wood,
        weather,
        rating,
        notes,
      });
      router.back();
    } catch { Alert.alert('Error', 'Could not save entry'); }
    finally { setLoading(false); }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>📔 {t('newEntry', language)}</Text>
      </View>
      <TextInput style={styles.input} placeholder="Meats (e.g. Boerewors, Lamb Chops)" placeholderTextColor={Colors.textSecondary} value={meats} onChangeText={setMeats} />
      <TextInput style={styles.input} placeholder="Wood used (e.g. Rooikrans)" placeholderTextColor={Colors.textSecondary} value={wood} onChangeText={setWood} />
      <TextInput style={styles.input} placeholder="Weather (e.g. Sunny, 28°C)" placeholderTextColor={Colors.textSecondary} value={weather} onChangeText={setWeather} />
      <Text style={styles.label}>Rating</Text>
      <View style={styles.stars}>
        {[1,2,3,4,5].map(s => (
          <Ionicons key={s} name={s <= rating ? 'star' : 'star-outline'} size={32} color={Colors.secondary} onPress={() => setRating(s)} />
        ))}
      </View>
      <TextInput style={[styles.input, styles.textarea]} placeholder="Notes..." placeholderTextColor={Colors.textSecondary} value={notes} onChangeText={setNotes} multiline numberOfLines={4} />
      <GradientButton label={loading ? t('loading', language) : t('save', language)} onPress={save} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingTop: 60, paddingBottom: Spacing.xxl },
  header: { marginBottom: Spacing.lg },
  title: { color: Colors.textPrimary, fontSize: 26, fontWeight: '800' },
  input: { height: 52, backgroundColor: Colors.elevated, borderRadius: Radius.sm, paddingHorizontal: Spacing.md, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md, fontSize: 15 },
  textarea: { height: 100, textAlignVertical: 'top', paddingTop: Spacing.md },
  label: { color: Colors.textSecondary, fontSize: 13, marginBottom: Spacing.sm },
  stars: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
});
