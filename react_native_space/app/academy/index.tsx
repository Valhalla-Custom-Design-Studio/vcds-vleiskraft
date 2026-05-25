import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { api } from '../../src/services/api';

export default function AcademyScreen() {
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    api.get('/academy/courses').then(r => setCourses(r.data.courses || [])).catch(() => {
      // Fallback static content
      setCourses([
        { id: '1', title: 'Meat Cuts 101', duration: '45 min', level: 'Beginner', emoji: '🥩' },
        { id: '2', title: 'Braai Mastery', duration: '60 min', level: 'Intermediate', emoji: '🔥' },
        { id: '3', title: 'Cold Chain Management', duration: '30 min', level: 'Advanced', emoji: '❄️' },
        { id: '4', title: 'Butchery Business', duration: '90 min', level: 'Advanced', emoji: '🏪' },
        { id: '5', title: 'Spice & Marinade Science', duration: '40 min', level: 'Beginner', emoji: '🌶️' },
      ]);
    });
  }, []);

  return (
    <ScrollView style={s.container}>
      <Text style={s.title}>📚 VleisKraft Academy</Text>
      <Text style={s.sub}>Learn from SA meat industry experts</Text>
      {courses.map(c => (
        <TouchableOpacity key={c.id} style={s.card}>
          <Text style={s.emoji}>{c.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{c.title}</Text>
            <Text style={s.meta}>{c.duration} • {c.level}</Text>
          </View>
          <Text style={s.arrow}>›</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d', padding: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4, marginTop: 48 },
  sub: { color: '#888', fontSize: 13, marginBottom: 20 },
  card: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  emoji: { fontSize: 28, marginRight: 14 },
  name: { color: '#fff', fontWeight: '600', fontSize: 15 },
  meta: { color: '#888', fontSize: 12, marginTop: 2 },
  arrow: { color: '#c0392b', fontSize: 24, fontWeight: '700' },
});
