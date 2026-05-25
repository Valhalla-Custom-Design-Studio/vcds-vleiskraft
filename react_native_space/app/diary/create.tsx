import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize } from '../../src/constants/theme';

export default function DiaryCreate() {
  const [title, setTitle] = useState('');
  const [meat, setMeat] = useState('');
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) { Alert.alert('Required', 'Give your braai a title'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/diary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${global.authToken}` },
        body: JSON.stringify({ title, meat_type: meat, notes, duration_minutes: Number(duration) || 0 }),
      });
      if (res.ok) { Alert.alert('Saved!', 'Braai logged.'); router.back(); }
      else Alert.alert('Error', 'Could not save entry.');
    } catch (_) { Alert.alert('Error', 'Network error.'); }
    setSaving(false);
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: Spacing.lg, paddingTop: 60 }}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.title}>Log a Braai</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={s.label}>Title *</Text>
      <TextInput style={s.input} value={title} onChangeText={setTitle} placeholder="e.g. Sunday Lamb Ribs" placeholderTextColor={Colors.textSecondary} />

      <Text style={s.label}>Meat Type</Text>
      <TextInput style={s.input} value={meat} onChangeText={setMeat} placeholder="e.g. Lamb, Boerewors, Chicken" placeholderTextColor={Colors.textSecondary} />

      <Text style={s.label}>Duration (minutes)</Text>
      <TextInput style={s.input} value={duration} onChangeText={setDuration} placeholder="e.g. 120" placeholderTextColor={Colors.textSecondary} keyboardType="number-pad" />

      <Text style={s.label}>Notes</Text>
      <TextInput style={[s.input, s.textarea]} value={notes} onChangeText={setNotes} placeholder="Marinade, wood type, tips..." placeholderTextColor={Colors.textSecondary} multiline numberOfLines={5} textAlignVertical="top" />

      <TouchableOpacity style={s.btn} onPress={save} disabled={saving}>
        <Ionicons name="flame-outline" size={20} color="#fff" />
        <Text style={s.btnText}>{saving ? 'Saving...' : 'Save Braai'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg },
  title: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  label: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.xs, marginTop: Spacing.md },
  input: { backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.md, color: Colors.textPrimary, fontSize: FontSize.md },
  textarea: { height: 120 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.primary, borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.xl },
  btnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },
});
