/**
 * BulkSMS.co.za integration
 * Sends order confirmations, OTPs, and promotional SMS
 */

const BULKSMS_TOKEN = process.env.BULKSMS_TOKEN || '';
const BULKSMS_URL = 'https://api.bulksms.com/v1/messages';

interface SmsPayload {
  to: string;   // SA format: +27XXXXXXXXX
  body: string;
}

async function sendSms(payload: SmsPayload): Promise<void> {
  if (!BULKSMS_TOKEN) {
    return;
  }
  const res = await fetch(BULKSMS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(BULKSMS_TOKEN).toString('base64')}`,
    },
    body: JSON.stringify([{ to: payload.to, body: payload.body }]),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('[BulkSMS] Send failed:', err);
  }
}

export async function sendOrderConfirmation(phone: string, orderRef: string, total: string): Promise<void> {
  await sendSms({
    to: phone,
    body: `VleisKraft(TM) Bestelling Bevestig! Ref: ${orderRef} | Totaal: R${total}. Ons sal jou kontak wanneer jou bestelling gereed is. Dankie!`,
  });
}

export async function sendOrderReady(phone: string, orderRef: string): Promise<void> {
  await sendSms({
    to: phone,
    body: `VleisKraft(TM): Jou bestelling ${orderRef} is gereed vir afhaal / aflewering is onderweg. Geniet jou vleis!`,
  });
}

export async function sendLayByReminder(phone: string, amount: string, dueDate: string): Promise<void> {
  await sendSms({
    to: phone,
    body: `VleisKraft(TM) Lay-By: Jou volgende paaiement van R${amount} is verskuldig op ${dueDate}. Kontak ons by jou slagter.`,
  });
}

export async function sendStockvelPayout(phone: string, amount: string): Promise<void> {
  await sendSms({
    to: phone,
    body: `VleisKraft(TM) Stockvel: Jou uitbetaling van R${amount} is verwerk. Geniet jou vleis!`,
  });
}

export async function sendSmartReorderAlert(phone: string, product: string): Promise<void> {
  await sendSms({
    to: phone,
    body: `VleisKraft(TM): Tyd om ${product} te herbestel! Tik hier om te bestel: vleiskraft://reorder`,
  });
}
