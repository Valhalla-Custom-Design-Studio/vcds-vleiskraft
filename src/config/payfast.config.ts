// PayFast Config — VleisKraft™
// KAN-31: LIVE endpoint. KAN-32: APP_ORIGIN from env.

export const PAYFAST_CONFIG = {
  merchantId: process.env.PAYFAST_MERCHANT_ID || '',
  merchantKey: process.env.PAYFAST_MERCHANT_KEY || '',
  passPhrase: process.env.PAYFAST_PASSPHRASE || '',
  // ✅ KAN-31: LIVE endpoint
  paymentUrl: 'https://www.payfast.co.za/eng/process',
  notifyUrl: process.env.PAYFAST_NOTIFY_URL || 'https://vleiskraft.vcds.co.za/api/payments/itn',
  returnUrl: process.env.PAYFAST_RETURN_URL || 'https://vleiskraft.vcds.co.za/payment/success',
  cancelUrl: process.env.PAYFAST_CANCEL_URL || 'https://vleiskraft.vcds.co.za/payment/cancel',
};
