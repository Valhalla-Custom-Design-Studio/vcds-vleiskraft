// PayFast Service — VCDS VleisKraft™
// KAN-31: Switched to LIVE endpoint. KAN-32: APP_ORIGIN must be set in Abacus secrets.

export const PAYFAST_CONFIG = {
  merchantId: process.env.PAYFAST_MERCHANT_ID || '11910323',
  merchantKey: process.env.PAYFAST_MERCHANT_KEY || 'f61uspt7vtdta',
  passPhrase: process.env.PAYFAST_PASSPHRASE || 'ValhallaCustoms1986',
  // ✅ KAN-31: LIVE endpoint (was sandbox.payfast.co.za)
  paymentUrl: 'https://www.payfast.co.za/eng/process',
  // ✅ KAN-31: ITN notify URL — set APP_ORIGIN in Abacus secrets
  notifyUrl: `${process.env.APP_ORIGIN || 'https://vleiskraft.abacusai.app'}/api/payments/payfast/notify`,
  returnUrl: `${process.env.APP_ORIGIN || 'https://vleiskraft.abacusai.app'}/payment/success`,
  cancelUrl: `${process.env.APP_ORIGIN || 'https://vleiskraft.abacusai.app'}/payment/cancel`,
};
