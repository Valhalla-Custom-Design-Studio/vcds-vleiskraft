import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { api } from '../../src/services/api';

export default function WeatherScreen() {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/weather/current').then(r => setWeather(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={s.center}><ActivityIndicator color="#c0392b" size="large" /></View>;

  return (
    <ScrollView style={s.container}>
      <Text style={s.title}>🌤️ Weather & Braai Conditions</Text>
      {weather && (
        <>
          <View style={s.mainCard}>
            <Text style={s.temp}>{weather.temperature}°C</Text>
            <Text style={s.desc}>{weather.description}</Text>
            <Text style={s.braai}>Braai Score: {weather.braai_score}/10 🔥</Text>
          </View>
          <View style={s.grid}>
            {[
              { label: 'Wind', val: `${weather.wind_speed} km/h` },
              { label: 'Humidity', val: `${weather.humidity}%` },
              { label: 'UV Index', val: weather.uv_index },
              { label: 'Feels Like', val: `${weather.feels_like}°C` },
            ].map(item => (
              <View key={item.label} style={s.gridItem}>
                <Text style={s.gridLabel}>{item.label}</Text>
                <Text style={s.gridVal}>{item.val}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d', padding: 16 },
  center: { flex: 1, backgroundColor: '#0d0d0d', justifyContent: 'center', alignItems: 'center' },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 16, marginTop: 48 },
  mainCard: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16 },
  temp: { color: '#fff', fontSize: 56, fontWeight: '800' },
  desc: { color: '#888', fontSize: 16, marginTop: 4 },
  braai: { color: '#c0392b', fontSize: 18, fontWeight: '700', marginTop: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridItem: { width: '47%', backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14 },
  gridLabel: { color: '#888', fontSize: 12 },
  gridVal: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 4 },
});
