import { Router, Request, Response } from 'express';
import { pool } from '../db/pool';
import { authenticate } from '../middleware/auth';
import Expo from 'expo-server-sdk';

const router = Router();
const expo = new Expo();

// Register push token
router.post('/register', authenticate, async (req: Request, res: Response) => {
  try {
    const { token, platform } = req.body;
    const userId = (req as any).user?.id;
    if (!token || !Expo.isExpoPushToken(token)) {
      return res.status(400).json({ error: 'Invalid push token' });
    }
    await pool.query(
      `INSERT INTO push_tokens (user_id, token, platform, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, token) DO UPDATE SET platform = $3, updated_at = NOW()`,
      [userId, token, platform]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register token' });
  }
});

// Send push notification (internal use)
export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
) {
  try {
    const { rows } = await pool.query<{ token: string }>(
      'SELECT token FROM push_tokens WHERE user_id = $1',
      [userId]
    );
    const messages = rows
      .filter((r: { token: string }) => Expo.isExpoPushToken(r.token))
      .map((r: { token: string }) => ({ to: r.token, sound: 'default' as const, title, body, data }));
    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk).catch(() => {});
    }
  } catch {}
}

export default router;
