import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, Alert, SafeAreaView, StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useI18n } from "../../src/i18n";

const API = process.env.EXPO_PUBLIC_API_URL || "https://vcds-vleiskraft.onrender.com";

const GOLD = "#C9A84C";
const BG = "#0A0A0A";
const SURFACE = "#141414";
const BORDER = "rgba(255,255,255,0.06)";
const TEXT = "#FFFFFF";
const MUTED = "#888888";

const MOCK_PRODUCTS = [
  { id: "1", nameEn: "Ribeye Steak", nameAf: "Riboog-steak", price: 189.99, unit: "500g", category: "beef", icon: "🐄" },
  { id: "2", nameEn: "Boerewors", nameAf: "Boerewors", price: 89.99, unit: "1kg", category: "sausage", icon: "🌭" },
  { id: "3", nameEn: "Lamb Chops", nameAf: "Lamtjops", price: 149.99, unit: "500g", category: "lamb", icon: "🐑" },
  { id: "4", nameEn: "Chicken Braai Pack", nameAf: "Hoender Braai-pak", price: 79.99, unit: "1.5kg", category: "chicken", icon: "🐔" },
  { id: "5", nameEn: "Pork Belly", nameAf: "Varkpens", price: 99.99, unit: "1kg", category: "pork", icon: "🐷" },
  { id: "6", nameEn: "Biltong", nameAf: "Biltong", price: 129.99, unit: "250g", category: "cured", icon: "🥩" },
  { id: "7", nameEn: "T-Bone Steak", nameAf: "T-Been Steak", price: 219.99, unit: "600g", category: "beef", icon: "🐄" },
  { id: "8", nameEn: "Pork Ribs", nameAf: "Varkrib", price: 119.99, unit: "1kg", category: "pork", icon: "🐷" },
];

const CATEGORIES = [
  { key: "all", label: "Alles" },
  { key: "beef", label: "Bees" },
  { key: "lamb", label: "Lam" },
  { key: "pork", label: "Vark" },
  { key: "chicken", label: "Hoender" },
  { key: "sausage", label: "Wors" },
  { key: "cured", label: "Gedroog" },
];

export default function ShopScreen() {
  const { t, lang, toggleLang } = useI18n();
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = MOCK_PRODUCTS.filter(p => {
    const name = lang === "en" ? p.nameEn : p.nameAf;
    const matchSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "all" || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  async function addToCart(product: any) {
    const existing = cart.find(c => c.id === product.id);
    const updated = existing
      ? cart.map(c => c.id === product.id ? { ...c, qty: c.qty + 1 } : c)
      : [...cart, { ...product, qty: 1 }];
    setCart(updated);
    await AsyncStorage.setItem("vleiskraft_cart", JSON.stringify(updated));
    Alert.alert("✓", lang === "en" ? "Added to cart" : "By mandjie gevoeg");
  }

  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {/* Hero Header */}
      <LinearGradient
        colors={["#1A0800", "#2D1200", "#0A0A0A"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroContent}>
          <View>
            <Text style={styles.heroLabel}>VLEISKRAFT™</Text>
            <Text style={styles.heroTitle}>Vars Vleis, Elke Dag</Text>
          </View>
          <View style={styles.cartBadge}>
            <Ionicons name="cart" size={22} color={GOLD} />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <Ionicons name="search" size={16} color={MUTED} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder={lang === "en" ? "Search products..." : "Soek produkte..."}
            placeholderTextColor={MUTED}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </LinearGradient>

      {/* Category Pills */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={c => c.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillsContainer}
        renderItem={({ item }) => {
          const active = activeCategory === item.key;
          return (
            <TouchableOpacity
              style={[styles.pill, active && styles.pillActive]}
              onPress={() => setActiveCategory(item.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Product List */}
      <FlatList
        data={filtered}
        keyExtractor={p => p.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <View style={styles.productIcon}>
              <Text style={{ fontSize: 28 }}>{item.icon}</Text>
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{lang === "en" ? item.nameEn : item.nameAf}</Text>
              <Text style={styles.productUnit}>{item.unit}</Text>
            </View>
            <View style={styles.productRight}>
              <Text style={styles.productPrice}>R{item.price.toFixed(2)}</Text>
              <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item)}>
                <Ionicons name="add" size={18} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  hero: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 },
  heroContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  heroLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 2, color: GOLD, marginBottom: 2 },
  heroTitle: { fontSize: 22, fontWeight: "800", color: TEXT },
  cartBadge: { position: "relative", padding: 8 },
  badge: {
    position: "absolute", top: 2, right: 2,
    backgroundColor: "#EF4444", borderRadius: 8,
    minWidth: 16, height: 16, alignItems: "center", justifyContent: "center",
  },
  badgeText: { fontSize: 10, fontWeight: "700", color: "#fff" },
  searchRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: BORDER,
  },
  searchInput: { flex: 1, fontSize: 14, color: TEXT },
  pillsContainer: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: BORDER,
    backgroundColor: SURFACE,
  },
  pillActive: {
    backgroundColor: GOLD, borderColor: GOLD,
    shadowColor: GOLD, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 8, elevation: 6,
  },
  pillText: { fontSize: 13, color: MUTED, fontWeight: "600" },
  pillTextActive: { color: "#000" },
  listContent: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  productCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: SURFACE, borderRadius: 14,
    padding: 14, borderWidth: 1, borderColor: BORDER,
  },
  productIcon: {
    width: 52, height: 52, borderRadius: 12,
    backgroundColor: "rgba(201,168,76,0.08)",
    alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  productInfo: { flex: 1 },
  productName: { fontSize: 15, fontWeight: "600", color: TEXT, marginBottom: 2 },
  productUnit: { fontSize: 12, color: MUTED },
  productRight: { alignItems: "flex-end", gap: 8 },
  productPrice: { fontSize: 16, fontWeight: "700", color: GOLD },
  addBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: GOLD, alignItems: "center", justifyContent: "center",
  },
});
