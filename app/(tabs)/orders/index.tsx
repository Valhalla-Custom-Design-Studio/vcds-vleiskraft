import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../../../src/theme/colors";
import { useI18n } from "../../../src/i18n";

const API = process.env.EXPO_PUBLIC_API_URL || "https://vcds-vleiskraft.railway.app";

const STATUS_COLORS: any = { pending: Colors.warning, confirmed: Colors.info, delivered: Colors.success, cancelled: Colors.error };

export default function OrdersScreen() {
  const { t } = useI18n();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const token = await AsyncStorage.getItem("token");
      const r = await fetch(`${API}/api/orders`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) setOrders(await r.json());
    } catch {}
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>{t("orders.title")}</Text></View>
      {loading ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} /> : (
        <FlatList
          data={orders}
          keyExtractor={i => i.id}
          contentContainerStyle={{ padding: 12 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.orderId}>#{item.id?.slice(0,8)}</Text>
                <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] || Colors.info }]}>
                  <Text style={styles.badgeText}>{t(`orders.${item.status}`)}</Text>
                </View>
              </View>
              <Text style={styles.total}>R{Number(item.total).toFixed(2)}</Text>
              <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString("af-ZA")}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Geen bestellings nie.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 20, paddingTop: 56, backgroundColor: Colors.primary },
  title: { fontSize: 22, fontWeight: "700", color: Colors.white },
  card: { backgroundColor: Colors.surface, borderRadius: 10, padding: 14, marginBottom: 8, elevation: 1 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  orderId: { fontSize: 13, fontWeight: "700", color: Colors.text },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  badgeText: { color: Colors.white, fontSize: 11, fontWeight: "700" },
  total: { fontSize: 18, fontWeight: "800", color: Colors.primary },
  date: { fontSize: 11, color: Colors.textSecondary, marginTop: 4 },
  empty: { textAlign: "center", color: Colors.textSecondary, marginTop: 40 },
});
