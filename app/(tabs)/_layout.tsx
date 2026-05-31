import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GOLD = '#C9A84C';

export default function TabLayout() {
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('userType').then(setUserType);
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: GOLD,
        tabBarInactiveTintColor: '#555555',
        tabBarStyle: {
          backgroundColor: '#0D0D0D',
          borderTopColor: 'rgba(255,255,255,0.06)',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      {/* Shared: Home/Shop */}
      <Tabs.Screen
        name="index"
        options={{
          title: userType === 'butcher' ? 'Dashboard' : 'Winkel',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={userType === 'butcher' ? 'grid' : 'storefront'} size={size} color={color} />
          ),
        }}
      />

      {/* Consumer: Cart | Butcher: Orders */}
      <Tabs.Screen
        name="cart/index"
        options={{
          title: 'Mandjie',
          tabBarIcon: ({ color, size }) => <Ionicons name="cart" size={size} color={color} />,
          href: userType === 'butcher' ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="orders/index"
        options={{
          title: userType === 'butcher' ? 'Bestellings' : 'My Bestellings',
          tabBarIcon: ({ color, size }) => <Ionicons name="receipt" size={size} color={color} />,
        }}
      />

      {/* VleisAI — both */}
      <Tabs.Screen
        name="vleisgpt/index"
        options={{
          title: 'VleisAI™',
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-ellipses" size={size} color={color} />,
        }}
      />

      {/* Profile */}
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profiel',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
