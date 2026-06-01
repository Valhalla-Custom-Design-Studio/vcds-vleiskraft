/**
 * Cron Job 3: Sentiment Digest
 * Daily at 06:00 SAST  -  aggregates VleisAI chat sentiment, sends digest to butchery admins
 */
import { pool } from '../db/pool';
import { Expo } from 'expo-server-sdk';

const expo = new Expo();

interface DigestRow {
  butchery_id: string;
  butchery_name: string;
  push_token: string;
  preferred_locale: string;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  total_queries: number;
}

export async function runSentimentDigest(): Promise<void> {
  // Aggregate VleisAI query sentiment from last 24h
  // sentiment stored in vleisai_queries table (if exists)
  const tableCheck = await pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_name = 'vleisai_queries'
    ) AS exists
  `);

  if (!tableCheck.rows[0]?.exists) {
    return;
  }

  const { rows } = await pool.query<DigestRow>(`
    SELECT
      b.id AS butchery_id,
      b.name AS butchery_name,
      pt.token AS push_token,
      u.preferred_locale,
      COUNT(CASE WHEN vq.sentiment = 'positive' THEN 1 END)::int AS positive_count,
      COUNT(CASE WHEN vq.sentiment = 'negative' THEN 1 END)::int AS negative_count,
      COUNT(CASE WHEN vq.sentiment = 'neutral' THEN 1 END)::int AS neutral_count,
      COUNT(vq.id)::int AS total_queries
    FROM butcheries b
    JOIN users u ON u.butchery_id = b.id AND u.business_type = 'butcher'
    JOIN push_tokens pt ON pt.user_id = u.id
    LEFT JOIN vleisai_queries vq ON vq.butchery_id = b.id
      AND vq.created_at > NOW() - INTERVAL '24 hours'
    WHERE b.is_active = true
    GROUP BY b.id, b.name, pt.token, u.preferred_locale
    HAVING COUNT(vq.id) > 0
    LIMIT 100
  `);

  if (!rows.length) return;

  const messages: any[] = [];
  for (const row of rows) {
    if (!Expo.isExpoPushToken(row.push_token)) continue;
    const isAf = row.preferred_locale === 'af';
    const score = row.total_queries > 0
      ? Math.round((row.positive_count / row.total_queries) * 100)
      : 0;

    messages.push({
      to: row.push_token,
      title: isAf ? `📊 ${row.butchery_name}  -  Daaglikse Oorsig` : `📊 ${row.butchery_name}  -  Daily Digest`,
      body: isAf
        ? `${row.total_queries} VleisAI vrae gister. Sentiment: ${score}% positief.`
        : `${row.total_queries} VleisAI queries yesterday. Sentiment: ${score}% positive.`,
      data: { type: 'sentiment_digest', butcheryId: row.butchery_id, score },
      sound: 'default',
    });
  }

  if (messages.length) {
    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk).catch(console.error);
    }
  }
}
