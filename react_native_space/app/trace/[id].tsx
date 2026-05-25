
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';

const API = process.env.EXPO_PUBLIC_API_URL || 'https://vcds-vleiskraft.up.railway.app';

export default function TraceScreen() {
  const { id } = useLocalSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API}/api/meat/catalogue/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setData(await res.json());
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#B22222" /></View>;

  const { product, traceability } = data || {};

  return (
    <ScrollView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.back}>←</Text></TouchableOpacity>
        <Text style={s.title}>🔍 Blockchain Traceability</Text>
      </View>

      {product && (
        <View style={s.productCard}>
          <Text style={s.productName}>{product.name}</Text>
          <Text style={s.productSub}>{product.species} · {product.cut} · Grade {product.grade}</Text>
          <Text style={s.hash}>🔐 Hash: {product.blockchain_hash?.substring(0,20)}...</Text>
          <Text style={s.qr}>📱 QR: {product.qr_code}</Text>
        </View>
      )}

      <Text style={s.sectionTitle}>📋 Chain of Custody</Text>
      {traceability?.length ? traceability.map((t: any, i: number) => (
        <View key={t.id} style={s.traceCard}>
          <Text style={s.traceStep}>Step {i+1}</Text>
          {t.farm_name && <Text style={s.traceItem}>🌾 Farm: {t.farm_name}</Text>}
          {t.animal_tag && <Text style={s.traceItem}>🐄 Animal Tag: {t.animal_tag}</Text>}
          {t.slaughter_date && <Text style={s.traceItem}>📅 Slaughter: {t.slaughter_date}</Text>}
          {t.abattoir_name && <Text style={s.traceItem}>🏭 Abattoir: {t.abattoir_name}</Text>}
          {t.vet_cert_number && <Text style={s.traceItem}>✅ Vet Cert: {t.vet_cert_number}</Text>}
          {t.cold_chain_temp && <Text style={s.traceItem}>🌡️ Cold Chain: {t.cold_chain_temp}°C</Text>}
          <Text style={s.traceHash}>🔐 {t.blockchain_hash?.substring(0,24)}...</Text>
        </View>
      )) : <Text style={s.noTrace}>No traceability records yet</Text>}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:'#1a0000'}, center:{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#1a0000'},
  header:{flexDirection:'row',alignItems:'center',padding:16,paddingTop:50,gap:12},
  back:{color:'#B22222',fontSize:22}, title:{color:'#fff',fontSize:18,fontWeight:'bold'},
  productCard:{margin:16,backgroundColor:'#2d0000',borderRadius:10,padding:16},
  productName:{color:'#fff',fontSize:20,fontWeight:'bold'}, productSub:{color:'#B22222',fontSize:14,marginTop:4},
  hash:{color:'#4ade80',fontSize:11,marginTop:8,fontFamily:'monospace'}, qr:{color:'#60a5fa',fontSize:11,marginTop:4},
  sectionTitle:{color:'#B22222',fontSize:16,fontWeight:'700',marginHorizontal:16,marginTop:16,marginBottom:8},
  traceCard:{margin:8,marginHorizontal:16,backgroundColor:'#2d0000',borderRadius:10,padding:14,borderLeftWidth:3,borderLeftColor:'#B22222'},
  traceStep:{color:'#fbbf24',fontSize:13,fontWeight:'bold',marginBottom:8},
  traceItem:{color:'#fff',fontSize:13,marginBottom:4}, traceHash:{color:'#4ade80',fontSize:10,marginTop:8,fontFamily:'monospace'},
  noTrace:{color:'#B22222',textAlign:'center',marginTop:20,fontSize:14},
});
