import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../src/theme/colors";
import { useI18n } from "../../../src/i18n";
import { formatZAR, isPriced } from "../../../src/utils/formatZAR";

const API = process.env.EXPO_PUBLIC_API_URL || "https://vcds-vleiskraft.onrender.com";

export default function CartScreen() {
  const { t } = useI18n();
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    AsyncStorage.getItem("vleiskraft_cart")
      .then(d => { if (d) setCart(JSON.parse(d)); })
      .catch(() => {});
  }, []);

  const total = cart.reduce((sum, i) => sum + (isPriced(i.price) ? i.price * i.qty : 0), 0);

  async function removeItem(id: string) {
    const updated = cart.filter(i => i.id !== id);
    setCart(updated);
    await AsyncStorage.setItem("vleiskraft_cart", JSON.stringify(updated));
  }

  async function checkout() {
    try {
      const token = await AsyncStorage.getItem("token");
      const r = await fetch(`${API}/api/orders`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart, total }),
      });
      if (r.ok) {
        await AsyncStorage.removeItem("vleiskraft_cart");
        setCart([]);
        Alert.alert("✓ Bestelling Geplaas", "Jou bestelling is ingedien.");
        router.push("/(tabs)/orders/index");
      } else {
        Alert.alert("Fout", "Kon nie bestelling plaas nie. Probeer weer.");
      }
    } catch {
      Alert.alert("Fout", "Netwerk fout. Probeer weer.");
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mandjie</Text>
      </View>
      {cart.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="cart-outline" size={64} color="#333333" />
          <Text style={styles.emptyText}>Jou mandjie is leeg</Text>
          <Text style={styles.emptySub}>Voeg produkte by om te begin</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={i => i.id}
            contentContainerStyle={{ padding: 12 }}
            renderItem={({ item }) => {
              const lineTotal = isPriced(item.price) ? item.price * item.qty : null;
              return (
                <View style={styles.item}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.nameAf || item.nameEn || item.name}</Text>
                    <Text style={styles.itemSub}>{item.unit} × {item.qty}</Text>
                  </View>
                  <Text style={[styles.itemPrice, !lineTotal && styles.itemPriceMuted]}>
                    {lineTotal ? formatZAR(lineTotal) : "—"}
                  </Text>
                  <TouchableOpacity onPress={() => removeItem(item.id)} style={{ marginLeft: 12 }}>
                    <Ionicons name="trash-outline" size={20} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              );
            }}
          />
          <View style={styles.footer}>
            <Text style={styles.total}>Totaal: {total > 0 ? formatZAR(total) : "—"}</Text>
            <TouchableOpacity style={styles.checkoutBtn} onPress={checkout}>
              <Text style={styles.checkoutText}>Betaal</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  header: { padding: 20, paddingTop: 56, backgroundColor: Colors.primary },
  title: { fontSize: 22, fontWeight: "700", color: "#FFFFFF" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#888888", fontSize: 16, fontWeight: "600", marginTop: 12 },
  emptySub: { color: "#555555", fontSize: 13, marginTop: 6 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#141414",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  itemName: { fontSize: 15, fontWeight: "600", color: "#FFFFFF" },
  itemSub: { fontSize: 12, color: "#888888", marginTop: 2 },
  itemPrice: { fontSize: 16, fontWeight: "700", color: Colors.primary },
  itemPriceMuted: { color: "#555555" },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    backgroundColor: "#0F0F0F",
  },
  total: { fontSize: 18, fontWeight: "800", color: "#FFFFFF", marginBottom: 14 },
  checkoutBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  checkoutText: { color: "#000000", fontSize: 16, fontWeight: "800" },
});
