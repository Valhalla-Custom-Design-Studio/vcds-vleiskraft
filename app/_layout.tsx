import { useEffect, useState } from "react";
import { Stack, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator } from "react-native";
import { Colors } from "../src/theme/colors";

export default function RootLayout() {
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    AsyncStorage.getItem("token").then(token => {
      if (!token) router.replace("/auth/login");
      setChecking(false);
    });
  }, []);
  if (checking) return <View style={{ flex:1, justifyContent:"center", alignItems:"center", backgroundColor: Colors.background }}><ActivityIndicator color={Colors.primary} size="large" /></View>;
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/register" />
    </Stack>
  );
}
