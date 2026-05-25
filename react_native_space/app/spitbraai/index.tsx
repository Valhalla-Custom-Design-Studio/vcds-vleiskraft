import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { api } from '../../src/services/api';

export default function SpitbraaiScreen() {
  const [guests, setGuests] = useState('20');
  const [animal, setAnimal] = useState('lamb');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    setLoading(true);
    try {
      const r = await api.post('/spitbraai/calculate', { guests: parseInt(guests), animal });
      setResult(r.data);
    } catch {
      // Fallback calculation
      const g = parseInt(guests) || 20;
      const kgPerPerson = animal === 'lamb' ? 0.35 : animal === 'pig' ? 0.4 : 0.3;
      setResult({
        total_kg: (g * kgPerPerson).toFixed(1),
        cooking_time: animal === 'lamb' ? '4-5 hours' : '6-8 hours',
        wood_kg: (g * 0.5).toFixed(0),
        salt_kg: (g * kgPerPerson * 0.02).toFixed(2),
        estimated_cost: `R${(g * kgPerPerson * 120).toFixed(0)}`,
      });
    }
    setLoading(false);
  };

  return (
    <ScrollView style={s.container}>
      <Text style={s.title}>🔥 Spitbraai Calculator</Text>
      <Text style={s.label}>Number of Guests</Text>
      <TextInput style={s.input} value={guests} onChangeText={setGuests} keyboardType="numeric" />
      <Text style={s.label}>Animal</Text>
      <View style={s.animalRow}>
        {['lamb', 'pig', 'goat'].map(a => (
          <TouchableOpacity key={a} style={[s.animalBtn, animal === a && s.animalActive]} onPress={() => setAnimal(a)}>
            <Text style={[s.animalTxt, animal === a && s.animalTxtActive]}>{a.charAt(0).toUpperCase() + a.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={s.btn} onPress={calculate} disabled={loading}>
        <Text style={s.btnText}>{loading ? 'Calculating...' : '🔥 Calculate'}</Text>
      </TouchableOpacity>
      {result && (
        <View style={s.result}>
          {Object.entries(result).map(([k, v]) => (
            <View key={k} style={s.row}>
              <Text style={s.key}>{k.replace(/_/g, ' ').replace(/\w/g, c => c.toUpperCase())}</Text>
              <Text style={s.val}>{String(v)}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d', padding: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 20, marginTop: 48 },
  label: { color: '#888', fontSize: 13, marginBottom: 6 },
  input: { backgroundColor: '#1a1a1a', color: '#fff', borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#333' },
  animalRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  animalBtn: { flex: 1, backgroundColor: '#1a1a1a', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  animalActive: { borderColor: '#c0392b', backgroundColor: '#2a0a0a' },
  animalTxt: { color: '#888', fontWeight: '600' },
  animalTxtActive: { color: '#c0392b' },
  btn: { backgroundColor: '#c0392b', borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 20 },
  btnText: { color: '#fff', fontWeight: '700' },
  result: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  key: { color: '#888', fontSize: 13 },
  val: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
