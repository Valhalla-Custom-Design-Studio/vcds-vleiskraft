/**
 * Cron Job 2: Smart Reorder Nudge
 * Daily at 09:00 SAST — checks order history, nudges users who haven't ordered in 14+ days
 */
import { pool } from '../db/pool';
import { Expo } from 'expo-server-sdk';
import { sendSmartReorderAlert } from '../services/bulkSms';

const expo = new Expo();

interface ReorderRow {
  user_id: string;
  push_token: string;
  phone: string;
  preferred_locale: string;
  last_product: string;
  days_since: number;
}

export async function runSmartReorder(): Promise<void> {
  const { rows } = await pool.query<ReorderRow>(`
    SELECT DISTINCT ON (u.id)
      u.id AS user_id,
      pt.token AS push_token,
      u.phone,
      u.preferred_locale,
      mp.name AS last_product,
      EXTRACT(DAY FROM NOW() - o.created_at)::int AS days_since
    FROM users u
    JOIN orders o ON o.buyer_id = u.id
    JOIN order_items oi ON oi.order_id = o.id
    JOIN meat_products mp ON mp.id = oi.product_id
    JOIN push_tokens pt ON pt.user_id = u.id
    WHERE o.status = 'delivered'
      AND o.created_at < NOW() - INTERVAL '14 days'
      AND u.is_active = true
    ORDER BY u.id, o.created_at DESC
    LIMIT 200
  `);

  if (!rows.length) return;

  const messages: any[] = [];

  for (const row of rows) {
    const isAf = row.preferred_locale === 'af';
    const product = row.last_product;

    if (Expo.isExpoPushToken(row.push_token)) {
      messages.push({
        to: row.push_token,
        title: isAf ? '🥩 Tyd om te herbestel!' : '🥩 Time to reorder!',
        body: isAf
          ? `Jy het ${row.days_since} dae gelede ${product} bestel. Bestel weer?`
          : `You ordered ${product} ${row.days_since} days ago. Ready to reorder?`,
        data: { type: 'smart_reorder', product },
        sound: 'default',
      });
    }

    // Also send SMS for high-value nudge
    if (row.phone && row.days_since > 21) {
      await sendSmartReorderAlert(row.phone, product).catch(console.error);
    }
  }

  if (messages.length) {
    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk).catch(console.error);
    }
  }
}
