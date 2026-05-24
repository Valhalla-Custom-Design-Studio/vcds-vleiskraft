import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/locales';

export default function TabsLayout() {
  const { language } = useAuthStore();

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: Colors.card, borderTopColor: Colors.border, height: 60 },
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textSecondary,
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    }}>
      <Tabs.Screen name="home" options={{
        title: t('home', language),
        tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
      }} />
      <Tabs.Screen name="shop" options={{
        title: t('shop', language),
        tabBarIcon: ({ color, size }) => <Ionicons name="storefront-outline" size={size} color={color} />,
      }} />
      <Tabs.Screen name="braai" options={{
        title: t('braai', language),
        tabBarIcon: ({ color, size }) => <Ionicons name="flame-outline" size={size} color={color} />,
      }} />
      <Tabs.Screen name="orders" options={{
        title: t('orders', language),
        tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" size={size} color={color} />,
      }} />
      <Tabs.Screen name="profile" options={{
        title: t('profile', language),
        tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
      }} />
    </Tabs>
  );
}
