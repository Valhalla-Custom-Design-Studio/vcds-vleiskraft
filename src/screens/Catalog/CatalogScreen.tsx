import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { formatZAR } from "../../utils/formatZAR";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
type Nav = NativeStackNavigationProp<RootStackParamList>;
const PRODUCTS = [
  { id: "1", name: "Beesvleis Maalvleis / Beef Mince", pricePerKg: 8900, category: "Beesvleis" },
  { id: "2", name: "Varkvleis Ribbetjies / Pork Ribs", pricePerKg: 12000, category: "Varkvleis" },
  { id: "3", name: "Lamskotelette / Lamb Chops", pricePerKg: 18500, category: "Lam" },
  { id: "4", name: "Hoenderborsies / Chicken Breasts", pricePerKg: 6500, category: "Hoender" },
  { id: "5", name: "Droewors (500g)", pricePerKg: 22000, category: "Verwerkte Vleis" },
  { id: "6", name: "Boerewors (1kg)", pricePerKg: 9500, category: "Verwerkte Vleis" },
];
export default function CatalogScreen() {
  const [search, setSearch] = useState("");
  const navigation = useNavigation<Nav>();
  const filtered = PRODUCTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <View style={s.container}>
      <TextInput style={s.search} placeholder="Soek vleis... / Search meat..." value={search} onChangeText={setSearch} accessibilityLabel="Soek produk" />
      <FlatList data={filtered} keyExtractor={i => i.id} renderItem={({ item }) => (
        <TouchableOpacity style={s.card} onPress={() => navigation.navigate("BulkOrder")} accessibilityRole="button" accessibilityLabel={`${item.name}, ${formatZAR(item.pricePerKg)} per kg`}>
          <Text style={s.name}>{item.name}</Text>
          <Text style={s.cat}>{item.category}</Text>
          <Text style={s.price}>{formatZAR(item.pricePerKg)}/kg</Text>
          <Text style={s.cta}>Bestel / Order →</Text>
        </TouchableOpacity>
      )} ItemSeparatorComponent={() => <View style={{ height: 10 }} />} />
    </View>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa", padding: 16 },
  search: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16, minHeight: 44 },
  card: { backgroundColor: "#fff", borderRadius: 10, padding: 16, borderLeftWidth: 4, borderLeftColor: "#8B0000" },
  name: { fontSize: 16, fontWeight: "700", color: "#1a1a1a" },
  cat: { fontSize: 13, color: "#666", marginTop: 2 },
  price: { fontSize: 18, fontWeight: "800", color: "#8B0000", marginTop: 6 },
  cta: { fontSize: 14, color: "#8B0000", marginTop: 8, fontWeight: "600" },
});
