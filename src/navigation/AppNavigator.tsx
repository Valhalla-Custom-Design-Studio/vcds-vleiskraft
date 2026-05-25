import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import CatalogScreen from "../screens/Catalog/CatalogScreen";
import SubscriptionScreen from "../screens/Subscription/SubscriptionScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import BulkOrderScreen from "../screens/B2B/BulkOrderScreen";
import AccountDashboard from "../screens/B2B/AccountDashboard";
import InvoiceScreen from "../screens/B2B/InvoiceScreen";
import QuoteRequestScreen from "../screens/B2B/QuoteRequestScreen";
import VolumePricingScreen from "../screens/B2B/VolumePricingScreen";
import DeliverySchedulerScreen from "../screens/B2B/DeliverySchedulerScreen";

export type RootStackParamList = {
  Main: undefined; Subscription: undefined; BulkOrder: undefined;
  AccountDashboard: undefined; Invoices: undefined; QuoteRequest: undefined;
  VolumePricing: undefined; DeliveryScheduler: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: "#8B0000", headerStyle: { backgroundColor: "#8B0000" }, headerTintColor: "#fff" }}>
      <Tab.Screen name="Katalogus" component={CatalogScreen} />
      <Tab.Screen name="Inskrywing" component={SubscriptionScreen} />
      <Tab.Screen name="Profiel" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: "#8B0000" }, headerTintColor: "#fff" }}>
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="BulkOrder" component={BulkOrderScreen} options={{ title: "Grootmaat Bestelling" }} />
        <Stack.Screen name="AccountDashboard" component={AccountDashboard} options={{ title: "B2B Rekening" }} />
        <Stack.Screen name="Invoices" component={InvoiceScreen} options={{ title: "Fakture" }} />
        <Stack.Screen name="QuoteRequest" component={QuoteRequestScreen} options={{ title: "Kwotasie Versoek" }} />
        <Stack.Screen name="VolumePricing" component={VolumePricingScreen} options={{ title: "Volume Pryse" }} />
        <Stack.Screen name="DeliveryScheduler" component={DeliverySchedulerScreen} options={{ title: "Afleweringskedule" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
