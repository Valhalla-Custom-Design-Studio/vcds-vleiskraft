import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PaymentsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'cancelled' | 'failed'>('loading');

  useEffect(() => {
    // PayFast redirects here with ?payment_status=COMPLETE|CANCELLED|FAILED
    const paymentStatus = params.payment_status as string | undefined;
    if (!paymentStatus) {
      // Params not yet hydrated — keep spinner
      return;
    }
    if (paymentStatus === 'COMPLETE') {
      setStatus('success');
    } else if (paymentStatus === 'CANCELLED') {
      setStatus('cancelled');
    } else {
      setStatus('failed');
    }
  }, [params]);

  const handleHome = () => router.replace('/(tabs)');
  const handleOrders = () => router.replace('/(tabs)/orders');

  if (status === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#c0392b" />
        <Text style={styles.text}>Verifying payment...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Ionicons
        name={status === 'success' ? 'checkmark-circle' : 'close-circle'}
        size={80}
        color={status === 'success' ? '#27ae60' : '#c0392b'}
      />
      <Text style={styles.title}>
        {status === 'success' ? 'Payment Successful!' : status === 'cancelled' ? 'Payment Cancelled' : 'Payment Failed'}
      </Text>
      <Text style={styles.subtitle}>
        {status === 'success'
          ? 'Your order has been placed. Check your email for confirmation.'
          : status === 'cancelled'
          ? 'Your payment was cancelled. No charge was made.'
          : 'Something went wrong. Please try again or contact support.'}
      </Text>
      <TouchableOpacity style={styles.button} onPress={status === 'success' ? handleOrders : handleHome}>
        <Text style={styles.buttonText}>{status === 'success' ? 'View Orders' : 'Back to Home'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d', justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 16, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#999', marginTop: 8, textAlign: 'center', lineHeight: 22 },
  text: { color: '#999', marginTop: 12 },
  button: { marginTop: 32, backgroundColor: '#c0392b', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
