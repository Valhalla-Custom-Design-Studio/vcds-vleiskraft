// Checkout redirect helper — KAN-32
// Opens PayFast payment URL in browser after order creation

import { Linking } from 'react-native';
import { PAYFAST_CONFIG } from '../config/payfast.config';

export async function redirectToPayFast(paymentData: Record<string, string>) {
  const params = new URLSearchParams(paymentData).toString();
  const url = `${PAYFAST_CONFIG.paymentUrl}?${params}`;
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  } else {
    throw new Error('Cannot open PayFast payment URL');
  }
}
