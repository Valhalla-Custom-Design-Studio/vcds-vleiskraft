import { useEffect } from "react";
import { Stack, router } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { Colors } from "../src/theme/colors";
import { useAuthStore } from "../src/store/authStore";
import { useCartStore } from "../src/store/cartStore";

export default function RootLayout() {
  const { isLoading, token, init } = useAuthStore();
  const { init: cartInit } = useCartStore();

  useEffect(() => {
    Promise.all([init(), cartInit()]);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!token) {
        router.replace("/auth/login");
      }
    }
  }, [isLoading, token]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background }}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/register" />
      <Stack.Screen name="order/[orderId]" />
      <Stack.Screen name="order-confirmation/[orderId]" />
      <Stack.Screen name="delivery-tracking/[orderId]" />
      <Stack.Screen name="vleisgpt/index" />
      <Stack.Screen name="admin/index" />
      <Stack.Screen name="admin/orders" />
      <Stack.Screen name="admin/branding" />
      <Stack.Screen name="admin/woocommerce" />
      <Stack.Screen name="profile/index" />
      <Stack.Screen name="subscriptions/index" />
      <Stack.Screen name="payments/index" />
      <Stack.Screen name="shopping-list/index" />
      <Stack.Screen name="meal-planner/index" />
      <Stack.Screen name="diary/index" />
      <Stack.Screen name="diary/create" />
      <Stack.Screen name="academy/index" />
      <Stack.Screen name="spitbraai/index" />
      <Stack.Screen name="stockvel/index" />
      <Stack.Screen name="layby/index" />
      <Stack.Screen name="bundles/index" />
      <Stack.Screen name="campaigns/index" />
      <Stack.Screen name="competitions/index" />
      <Stack.Screen name="predictions/index" />
      <Stack.Screen name="weather/index" />
      <Stack.Screen name="reorder/index" />
      <Stack.Screen name="whatsapp/index" />
    </Stack>
  );
}
