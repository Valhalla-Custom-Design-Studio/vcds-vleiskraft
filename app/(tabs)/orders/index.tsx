import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../../../src/theme/colors";
import { useI18n } from "../../../src/i18n";
import { formatZAR } from "../../../src/utils/formatZAR";

const API = process.env.EXPO_PUBLIC_API_URL || "https://vcds-vleiskraft.onrender.com";

const STATUS_COLORS: any = {
  pending: Colors.warning,
  confirmed: Colors.info,
  delivered: Colors.success,
  cancelled: Colors.error,
};

const STATUS_LABELS: any = {
  pending: "Hangende",
  confirmed: "Bevestig",
  delivered: "Afgelewer",
  cancelled: "Gekanselleer",
};

export default function OrdersScreen() {
  const { t } = useI18n();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const token = await AsyncStorage.getItem("token");
      const r = await fetch(`${API}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) setOrders(await r.json());
    } catch {}
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bestellings</Text>
      </View>
      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={i => i.id}
          contentContainerStyle={{ padding: 12 }}
          renderItem={({ item }) => {
            const total = Number(item.total);
            const hasPrice = total > 0;
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.orderId}>#{item.id?.slice(0, 8)}</Text>
                  <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] || Colors.info }]}>
                    <Text style={styles.badgeText}>
                      {STATUS_LABELS[item.status] || item.status}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.total, !hasPrice && styles.totalMuted]}>
                  {hasPrice ? formatZAR(total) : "Prys onbekend"}
                </Text>
                <Text style={styles.date}>
                  {new Date(item.created_at).toLocaleDateString("af-ZA")}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.empty}>Geen bestellings nie.</Text>
              <Text style={styles.emptySub}>Jou bestellings sal hier verskyn.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 20, paddingTop: 56, backgroundColor: Colors.primary },
  title: { fontSize: 22, fontWeight: "700", color: "#FFFFFF" },
  card: {
    backgroundColor: "#141414",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  orderId: { fontSize: 13, fontWeight: "700", color: "#FFFFFF" },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  badgeText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },
  total: { fontSize: 18, fontWeight: "800", color: Colors.primary },
  totalMuted: { color: "#666666", fontSize: 14, fontWeight: "500" },
  date: { fontSize: 11, color: "#888888", marginTop: 4 },
  emptyWrap: { alignItems: "center", marginTop: 60 },
  empty: { textAlign: "center", color: "#888888", fontSize: 16, fontWeight: "600" },
  emptySub: { textAlign: "center", color: "#555555", fontSize: 13, marginTop: 6 },
});
