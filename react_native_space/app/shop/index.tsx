
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Switch, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const API = process.env.EXPO_PUBLIC_API_URL || 'https://vcds-vleiskraft.up.railway.app';
const SPECIES = ['all','beef','lamb','pork','chicken','game','biltong'];
const T = {
  en: { title:'VleisKraft™', subtitle:'B2B Meat Marketplace', search:'Search meat...', cart:'Cart', add:'Add to Cart', noProducts:'No products found', halaal:'Halaal', freeRange:'Free Range', grassFed:'Grass Fed', trace:'Trace', order:'Place Order', priceIntel:'Price Intelligence', supplier:'Supplier', grade:'Grade', stock:'In Stock' },
  af: { title:'VleisKraft™', subtitle:'B2B Vleis Markplek', search:'Soek vleis...', cart:'Mandjie', add:'Voeg By', noProducts:'Geen produkte gevind', halaal:'Halaal', freeRange:'Vrylopend', grassFed:'Grasgevoed', trace:'Spoor', order:'Plaas Bestelling', priceIntel:'Prys Intelligensie', supplier:'Verskaffer', grade:'Graad', stock:'In Voorraad' },
};

export default function ShopScreen() {
  const [lang, setLang] = useState<'en'|'af'>('af');
  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [species, setSpecies] = useState('all');
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const t = T[lang];

  useEffect(() => { AsyncStorage.getItem('lang').then(v => v && setLang(v as any)); }, []);
  const toggleLang = (v: boolean) => { const l = v ? 'af' : 'en'; setLang(l); AsyncStorage.setItem('lang', l); };

  const load = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const params = new URLSearchParams();
      if (species !== 'all') params.set('species', species);
      if (search) params.set('search', search);
      const res = await fetch(`${API}/api/meat/catalogue?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setProducts(data.products || []);
      setFiltered(data.products || []);
    } catch { } finally { setLoading(false); setRefreshing(false); }
  }, [species, search]);

  useEffect(() => { load(); }, [load]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const placeOrder = async () => {
    if (!cart.length) return;
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items: cart.map(i => ({ product_id: i.id, quantity: i.qty })) }),
      });
      if (res.ok) { setCart([]); Alert.alert('✅', lang === 'af' ? 'Bestelling geplaas!' : 'Order placed!'); }
    } catch { Alert.alert('Error', 'Order failed'); }
  };

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#B22222" /></View>;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={{flex:1}}><Text style={s.title}>{t.title}</Text><Text style={s.subtitle}>{t.subtitle}</Text></View>
        <View style={s.langRow}><Text style={s.langLabel}>EN</Text><Switch value={lang==='af'} onValueChange={toggleLang} trackColor={{true:'#B22222'}} thumbColor="#fff"/><Text style={s.langLabel}>AF</Text></View>
      </View>

      <TextInput style={s.search} value={search} onChangeText={setSearch} placeholder={t.search} placeholderTextColor="#B2222266" />

      {/* Species filter */}
      <FlatList horizontal data={SPECIES} keyExtractor={i => i} showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.speciesRow}
        renderItem={({ item }) => (
          <TouchableOpacity style={[s.speciesBtn, species===item && s.speciesActive]} onPress={() => setSpecies(item)}>
            <Text style={[s.speciesTxt, species===item && s.speciesActiveTxt]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Cart badge */}
      {cart.length > 0 && (
        <TouchableOpacity style={s.cartBadge} onPress={placeOrder}>
          <Text style={s.cartTxt}>🛒 {cart.reduce((a,i) => a+i.qty, 0)} items — {t.order}</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={filtered}
        keyExtractor={p => p.id}
        numColumns={2}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#B22222" />}
        ListEmptyComponent={<Text style={s.empty}>{t.noProducts}</Text>}
        contentContainerStyle={s.grid}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.cardEmoji}><Text style={s.emoji}>🥩</Text></View>
            <Text style={s.productName}>{lang === 'af' && item.name_af ? item.name_af : item.name}</Text>
            <Text style={s.productSub}>{item.cut || item.species} {item.grade ? `· ${item.grade}` : ''}</Text>
            {item.weight_kg && <Text style={s.productSub}>{item.weight_kg}kg</Text>}
            <View style={s.badges}>
              {item.is_halaal && <View style={s.badge}><Text style={s.badgeTxt}>{t.halaal}</Text></View>}
              {item.is_free_range && <View style={[s.badge,{backgroundColor:'#15803d'}]}><Text style={s.badgeTxt}>{t.freeRange}</Text></View>}
            </View>
            <Text style={s.price}>R{Number(item.price_per_kg || item.price_unit || 0).toFixed(2)}{item.price_per_kg ? '/kg' : ''}</Text>
            <View style={s.cardActions}>
              <TouchableOpacity style={s.addBtn} onPress={() => addToCart(item)}>
                <Text style={s.addTxt}>{t.add}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.traceBtn} onPress={() => router.push(`/trace/${item.id}` as any)}>
                <Text style={s.traceTxt}>🔍</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:'#1a0000'}, center:{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#1a0000'},
  header:{flexDirection:'row',alignItems:'center',padding:16,paddingTop:50},
  title:{fontSize:24,fontWeight:'bold',color:'#fff'}, subtitle:{fontSize:12,color:'#B22222'},
  langRow:{flexDirection:'row',alignItems:'center',gap:4}, langLabel:{color:'#B22222',fontSize:11},
  search:{margin:12,backgroundColor:'#2d0000',borderRadius:8,padding:12,color:'#fff',fontSize:14},
  speciesRow:{paddingHorizontal:12,gap:8,paddingBottom:8},
  speciesBtn:{backgroundColor:'#2d0000',paddingHorizontal:14,paddingVertical:7,borderRadius:20},
  speciesActive:{backgroundColor:'#B22222'},
  speciesTxt:{color:'#B22222',fontSize:12}, speciesActiveTxt:{color:'#fff',fontWeight:'bold'},
  cartBadge:{margin:8,marginHorizontal:12,backgroundColor:'#B22222',padding:12,borderRadius:8,alignItems:'center'},
  cartTxt:{color:'#fff',fontWeight:'bold',fontSize:14},
  grid:{padding:8},
  card:{flex:1,backgroundColor:'#2d0000',margin:6,borderRadius:10,padding:12},
  cardEmoji:{alignItems:'center',marginBottom:8}, emoji:{fontSize:32},
  productName:{color:'#fff',fontSize:13,fontWeight:'bold',textAlign:'center'},
  productSub:{color:'#B22222',fontSize:11,textAlign:'center',marginTop:2},
  badges:{flexDirection:'row',flexWrap:'wrap',gap:4,justifyContent:'center',marginTop:4},
  badge:{backgroundColor:'#7c3aed',paddingHorizontal:6,paddingVertical:2,borderRadius:4},
  badgeTxt:{color:'#fff',fontSize:9,fontWeight:'bold'},
  price:{color:'#fbbf24',fontSize:16,fontWeight:'bold',textAlign:'center',marginTop:6},
  cardActions:{flexDirection:'row',gap:6,marginTop:8},
  addBtn:{flex:1,backgroundColor:'#B22222',padding:8,borderRadius:6,alignItems:'center'},
  addTxt:{color:'#fff',fontSize:11,fontWeight:'bold'},
  traceBtn:{backgroundColor:'#44403c',padding:8,borderRadius:6,alignItems:'center'},
  traceTxt:{fontSize:14},
  empty:{color:'#B22222',textAlign:'center',marginTop:40,fontSize:16},
});
