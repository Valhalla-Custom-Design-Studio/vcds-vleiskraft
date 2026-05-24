import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../src/theme/colors";
import { useI18n } from "../../../src/i18n";

const API = process.env.EXPO_PUBLIC_API_URL || "https://vcds-vleiskraft.railway.app";

export default function CartScreen() {
  const { t } = useI18n();
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    AsyncStorage.getItem("vleiskraft_cart").then(d => { if (d) setCart(JSON.parse(d)); });
  }, []);

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

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
        Alert.alert("✓ Order Placed", "Your order has been submitted.");
        router.push("/(tabs)/orders/index");
      } else Alert.alert(t("common.error"), t("common.failedToSave"));
    } catch { Alert.alert(t("common.error"), t("common.failedToSave")); }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>{t("shop.cart")}</Text></View>
      {cart.length === 0 ? (
        <View style={styles.empty}><Ionicons name="cart-outline" size={64} color={Colors.border} /><Text style={styles.emptyText}>{t("shop.empty")}</Text></View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={i => i.id}
            contentContainerStyle={{ padding: 12 }}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.nameEn}</Text>
                  <Text style={styles.itemSub}>{item.unit} × {item.qty}</Text>
                </View>
                <Text style={styles.itemPrice}>R{(item.price * item.qty).toFixed(2)}</Text>
                <TouchableOpacity onPress={() => removeItem(item.id)} style={{ marginLeft: 12 }}>
                  <Ionicons name="trash-outline" size={20} color={Colors.error} />
                </TouchableOpacity>
              </View>
            )}
          />
          <View style={styles.footer}>
            <Text style={styles.total}>{t("shop.total")}: R{total.toFixed(2)}</Text>
            <TouchableOpacity style={styles.checkoutBtn} onPress={checkout}>
              <Text style={styles.checkoutText}>{t("shop.checkout")}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 20, paddingTop: 56, backgroundColor: Colors.primary },
  title: { fontSize: 22, fontWeight: "700", color: Colors.white },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: Colors.textSecondary, marginTop: 12, fontSize: 15 },
  item: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.surface, borderRadius: 10, padding: 14, marginBottom: 8, elevation: 1 },
  itemName: { fontSize: 15, fontWeight: "700", color: Colors.text },
  itemSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  itemPrice: { fontSize: 15, fontWeight: "700", color: Colors.primary },
  footer: { padding: 16, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border },
  total: { fontSize: 18, fontWeight: "800", color: Colors.text, marginBottom: 12 },
  checkoutBtn: { backgroundColor: Colors.primary, padding: 16, borderRadius: 12, alignItems: "center" },
  checkoutText: { color: Colors.white, fontWeight: "700", fontSize: 16 },
});
