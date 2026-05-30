import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, SafeAreaView, StatusBar, RefreshControl, ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useI18n } from "../../src/i18n";

const API = process.env.EXPO_PUBLIC_API_URL || "https://vcds-vleiskraft.onrender.com";
const GOLD = "#C9A84C";
const BG = "#0A0A0A";
const SURFACE = "#141414";
const BORDER = "rgba(255,255,255,0.06)";
const TEXT = "#FFFFFF";
const MUTED = "#888888";

const CATEGORIES_EN = ["All","Beef","Lamb","Pork","Chicken","Sausage","Cured"];
const CATEGORIES_AF = ["Alles","Bees","Lam","Vark","Hoender","Wors","Gedroog"];
const CAT_KEYS = ["all","beef","lamb","pork","chicken","sausage","cured"];

export default function ShopScreen() {
  const { t, lang, toggleLang } = useI18n();
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("token").then(setToken);
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const params = new URLSearchParams();
      if (activeCategory !== "all") params.set("category", activeCategory);
      if (search) params.set("search", search);
      const res = await fetch(`${API}/api/meat?${params}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : data.products ?? []);
      }
    } catch (e) {
      console.warn("Products load failed:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, activeCategory, search]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  async function addToCart(product: any) {
    const existing = cart.find(i => i.id === product.id);
    const updated = existing
      ? cart.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      : [...cart, { ...product, qty: 1 }];
    setCart(updated);
    await AsyncStorage.setItem("cart", JSON.stringify(updated));
  }

  const categories = lang === "af" ? CATEGORIES_AF : CATEGORIES_EN;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <LinearGradient colors={["#0A0A0A", "#111111"]} style={s.container}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.logo}>VleisKraft™</Text>
            <Text style={s.sub}>{t("shop.title")}</Text>
          </View>
          <View style={s.headerRight}>
            <TouchableOpacity onPress={toggleLang} style={s.langBtn}>
              <Text style={s.langText}>{lang === "en" ? "AF" : "EN"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/(tabs)/cart")} style={s.cartBtn}>
              <Ionicons name="cart-outline" size={24} color={GOLD} />
              {cart.length > 0 && (
                <View style={s.badge}><Text style={s.badgeText}>{cart.reduce((a,i)=>a+i.qty,0)}</Text></View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={s.searchRow}>
          <Ionicons name="search-outline" size={18} color={MUTED} style={s.searchIcon} />
          <TextInput
            style={s.searchInput}
            placeholder={t("common.search")}
            placeholderTextColor={MUTED}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Category Pills */}
        <FlatList
          horizontal showsHorizontalScrollIndicator={false}
          data={CAT_KEYS}
          keyExtractor={i => i}
          style={s.catList}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[s.catChip, activeCategory === item && s.catActive]}
              onPress={() => setActiveCategory(item)}
            >
              <Text style={[s.catText, activeCategory === item && s.catTextActive]}>
                {categories[index]}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Products */}
        {loading ? (
          <View style={s.center}><ActivityIndicator color={GOLD} size="large" /></View>
        ) : products.length === 0 ? (
          <View style={s.center}>
            <Ionicons name="storefront-outline" size={48} color={MUTED} />
            <Text style={s.emptyText}>{t("common.noResults")}</Text>
            <TouchableOpacity onPress={loadProducts} style={s.retryBtn}>
              <Text style={s.retryText}>{t("common.tryAgain")}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={i => String(i.id)}
            numColumns={2}
            columnWrapperStyle={s.row}
            contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadProducts(); }} tintColor={GOLD} />}
            renderItem={({ item }) => {
              const name = lang === "af" ? (item.nameAf ?? item.name) : (item.nameEn ?? item.name);
              return (
                <TouchableOpacity style={s.card} onPress={() => router.push(`/product/${item.id}`)}>
                  <LinearGradient colors={["#1A1A1A","#141414"]} style={s.cardGrad}>
                    <Text style={s.productIcon}>{item.icon ?? "🥩"}</Text>
                    <Text style={s.productName} numberOfLines={2}>{name}</Text>
                    <Text style={s.productUnit}>{item.unit ?? ""}</Text>
                    <View style={s.priceRow}>
                      <Text style={s.price}>R{Number(item.price ?? 0).toFixed(2)}</Text>
                      <Text style={s.perKg}>{t("shop.perKg")}</Text>
                    </View>
                    <TouchableOpacity style={s.addBtn} onPress={() => addToCart(item)}>
                      <Ionicons name="add" size={18} color={BG} />
                      <Text style={s.addText}>{t("shop.addToCart")}</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0A0A0A" },
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  logo: { fontSize: 22, fontWeight: "800", color: GOLD, letterSpacing: 1 },
  sub: { fontSize: 12, color: MUTED, marginTop: 2 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  langBtn: { backgroundColor: "rgba(201,168,76,0.15)", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: "rgba(201,168,76,0.3)" },
  langText: { color: GOLD, fontSize: 12, fontWeight: "700" },
  cartBtn: { position: "relative" },
  badge: { position: "absolute", top: -6, right: -6, backgroundColor: GOLD, borderRadius: 10, minWidth: 18, height: 18, alignItems: "center", justifyContent: "center" },
  badgeText: { color: "#000", fontSize: 10, fontWeight: "800" },
  searchRow: { flexDirection: "row", alignItems: "center", backgroundColor: SURFACE, borderRadius: 12, marginHorizontal: 16, marginVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: BORDER },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: TEXT, fontSize: 14, paddingVertical: 12 },
  catList: { maxHeight: 48, marginBottom: 4 },
  catChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: SURFACE, marginRight: 8, borderWidth: 1, borderColor: BORDER },
  catActive: { backgroundColor: GOLD, borderColor: GOLD },
  catText: { color: MUTED, fontSize: 13, fontWeight: "600" },
  catTextActive: { color: "#000" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyText: { color: MUTED, fontSize: 15, marginTop: 8 },
  retryBtn: { backgroundColor: "rgba(201,168,76,0.15)", borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10, borderWidth: 1, borderColor: GOLD },
  retryText: { color: GOLD, fontWeight: "700" },
  row: { justifyContent: "space-between" },
  card: { width: "48%", marginBottom: 12, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: BORDER },
  cardGrad: { padding: 14 },
  productIcon: { fontSize: 32, marginBottom: 8 },
  productName: { color: TEXT, fontSize: 14, fontWeight: "700", marginBottom: 2 },
  productUnit: { color: MUTED, fontSize: 11, marginBottom: 8 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 4, marginBottom: 10 },
  price: { color: GOLD, fontSize: 18, fontWeight: "800" },
  perKg: { color: MUTED, fontSize: 10 },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: GOLD, borderRadius: 10, paddingVertical: 8, gap: 4 },
  addText: { color: "#000", fontSize: 12, fontWeight: "800" },
});
