import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Linking, Alert } from 'react-native';
import { api } from '../../src/services/api';

export default function WhatsAppOrderScreen() {
  const [order, setOrder] = useState('');
  const [parsed, setParsed] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const parseOrder = async () => {
    if (!order.trim()) return;
    setLoading(true);
    try {
      const r = await api.post('/voice-order/parse', { text: order });
      setParsed(r.data);
    } catch { Alert.alert('Error', 'Could not parse order'); }
    finally { setLoading(false); }
  };

  const sendWhatsApp = () => {
    const msg = encodeURIComponent(`VleisKraft Order:
${order}`);
    Linking.openURL(`whatsapp://send?phone=+27000000000&text=${msg}`);
  };

  return (
    <ScrollView style={s.container}>
      <Text style={s.title}>💬 WhatsApp Order</Text>
      <Text style={s.sub}>Type your order in plain language — AI will parse it</Text>
      <TextInput style={s.input} placeholder="e.g. 2kg beef brisket and 1kg lamb chops..."
        placeholderTextColor="#666" value={order} onChangeText={setOrder} multiline numberOfLines={4} />
      <TouchableOpacity style={s.btn} onPress={parseOrder} disabled={loading}>
        <Text style={s.btnText}>{loading ? 'Parsing...' : '🤖 Parse with AI'}</Text>
      </TouchableOpacity>
      {parsed && (
        <View style={s.result}>
          <Text style={s.resultTitle}>Parsed Order:</Text>
          {parsed.items?.map((item: any, i: number) => (
            <Text key={i} style={s.item}>• {item.quantity} {item.unit} {item.name} — R{item.price?.toFixed(2)}</Text>
          ))}
          <Text style={s.total}>Total: R{parsed.total?.toFixed(2)}</Text>
        </View>
      )}
      <TouchableOpacity style={[s.btn, { backgroundColor: '#25D366', marginTop: 10 }]} onPress={sendWhatsApp}>
        <Text style={s.btnText}>📲 Send via WhatsApp</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d', padding: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4, marginTop: 48 },
  sub: { color: '#888', fontSize: 13, marginBottom: 16 },
  input: { backgroundColor: '#1a1a1a', color: '#fff', borderRadius: 10, padding: 14, minHeight: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: '#333', marginBottom: 12 },
  btn: { backgroundColor: '#c0392b', borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 12 },
  btnText: { color: '#fff', fontWeight: '700' },
  result: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 12 },
  resultTitle: { color: '#c0392b', fontWeight: '700', marginBottom: 8 },
  item: { color: '#fff', fontSize: 14, marginBottom: 4 },
  total: { color: '#c0392b', fontWeight: '800', fontSize: 16, marginTop: 8 },
});
