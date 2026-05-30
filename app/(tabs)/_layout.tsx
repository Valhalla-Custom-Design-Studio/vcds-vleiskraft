import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GOLD = '#C9A84C';
const RED = '#C0392B';

export default function TabLayout() {
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('userType').then(setUserType);
  }, []);

  const isButcher = userType === 'butcher';

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
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      {/* Home: Shop (consumer) | Dashboard (butcher) */}
      <Tabs.Screen
        name="index"
        options={{
          title: isButcher ? 'Dashboard' : 'Winkel',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={isButcher ? 'grid' : 'storefront'} size={size} color={color} />
          ),
        }}
      />

      {/* Consumer only: Cart */}
      <Tabs.Screen
        name="cart/index"
        options={{
          title: 'Mandjie',
          tabBarIcon: ({ color, size }) => <Ionicons name="cart" size={size} color={color} />,
          href: isButcher ? null : undefined,
        }}
      />

      {/* Orders — both, different label */}
      <Tabs.Screen
        name="orders/index"
        options={{
          title: isButcher ? 'Bestellings' : 'My Bestellings',
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

      {/* Profile — both */}
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
