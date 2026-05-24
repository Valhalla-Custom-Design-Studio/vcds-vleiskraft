import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: "#111", borderTopColor: "#2A2A2A", height: 60 },
      tabBarActiveTintColor: "#C0392B",
      tabBarInactiveTintColor: "#888",
    }}>
      <Tabs.Screen name="index" options={{ title: "Shop", tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🥩</Text> }} />
      <Tabs.Screen name="orders" options={{ title: "Orders", tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📦</Text> }} />
      <Tabs.Screen name="vleisgpt" options={{ title: "VleisGPT", tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🤖</Text> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text> }} />
    </Tabs>
  );
}
