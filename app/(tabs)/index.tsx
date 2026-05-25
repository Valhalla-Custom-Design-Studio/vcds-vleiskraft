import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../src/theme/colors";
import { useI18n } from "../../src/i18n";

const API = process.env.EXPO_PUBLIC_API_URL || "https://vcds-vleiskraft.railway.app";

const MOCK_PRODUCTS = [
  { id: "1", nameEn: "Ribeye Steak", nameAf: "Riboog-steak", price: 189.99, unit: "500g", category: "beef" },
  { id: "2", nameEn: "Boerewors", nameAf: "Boerewors", price: 89.99, unit: "1kg", category: "sausage" },
  { id: "3", nameEn: "Lamb Chops", nameAf: "Lamtjops", price: 149.99, unit: "500g", category: "lamb" },
  { id: "4", nameEn: "Chicken Braai Pack", nameAf: "Hoender Braai-pak", price: 79.99, unit: "1.5kg", category: "chicken" },
  { id: "5", nameEn: "Pork Belly", nameAf: "Varkpens", price: 99.99, unit: "1kg", category: "pork" },
  { id: "6", nameEn: "Biltong", nameAf: "Biltong", price: 129.99, unit: "250g", category: "cured" },
  { id: "7", nameEn: "T-Bone Steak", nameAf: "T-Been Steak", price: 219.99, unit: "600g", category: "beef" },
  { id: "8", nameEn: "Pork Ribs", nameAf: "Varkrib", price: 119.99, unit: "1kg", category: "pork" },
];

export default function ShopScreen() {
  const { t, lang, toggleLang } = useI18n();
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<any[]>([]);

  const filtered = MOCK_PRODUCTS.filter(p =>
    (lang === "en" ? p.nameEn : p.nameAf).toLowerCase().includes(search.toLowerCase())
  );

  async function addToCart(product: any) {
    const existing = cart.find(c => c.id === product.id);
    const updated = existing
      ? cart.map(c => c.id === product.id ? { ...c, qty: c.qty + 1 } : c)
      : [...cart, { ...product, qty: 1 }];
    setCart(updated);
    await AsyncStorage.setItem("vleiskraft_cart", JSON.stringify(updated));
    Alert.alert("✓", `${lang === "en" ? product.nameEn : product.nameAf} added to cart`);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>VleisKraft™</Text>
          <Text style={styles.subtitle}>B2B Meat Marketplace</Text>
        </View>
        <TouchableOpacity onPress={toggleLang} style={styles.langBtn}>
          <Text style={styles.langText}>{lang === "en" ? "AF" : "EN"}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={Colors.textSecondary} />
        <TextInput style={styles.searchInput} placeholder="Search products..." value={search} onChangeText={setSearch} />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        numColumns={2}
        contentContainerStyle={{ padding: 8 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardIcon}><Ionicons name="restaurant" size={32} color={Colors.primary} /></View>
            <Text style={styles.productName}>{lang === "en" ? item.nameEn : item.nameAf}</Text>
            <Text style={styles.productUnit}>{item.unit}</Text>
            <Text style={styles.productPrice}>R{item.price.toFixed(2)}</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item)}>
              <Text style={styles.addBtnText}>{t("shop.addToCart")}</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingTop: 56, backgroundColor: Colors.primary },
  title: { fontSize: 22, fontWeight: "700", color: Colors.white },
  subtitle: { fontSize: 12, color: Colors.accent, marginTop: 2 },
  langBtn: { backgroundColor: Colors.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  langText: { color: Colors.white, fontWeight: "700", fontSize: 13 },
  searchBox: { flexDirection: "row", alignItems: "center", margin: 12, backgroundColor: Colors.surface, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: Colors.text },
  card: { flex: 1, margin: 4, backgroundColor: Colors.surface, borderRadius: 12, padding: 12, elevation: 2, alignItems: "center" },
  cardIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#FEE2E2", justifyContent: "center", alignItems: "center", marginBottom: 8 },
  productName: { fontSize: 13, fontWeight: "700", color: Colors.text, textAlign: "center" },
  productUnit: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  productPrice: { fontSize: 16, fontWeight: "800", color: Colors.primary, marginTop: 4 },
  addBtn: { marginTop: 8, backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, width: "100%", alignItems: "center" },
  addBtnText: { color: Colors.white, fontSize: 12, fontWeight: "700" },
});
