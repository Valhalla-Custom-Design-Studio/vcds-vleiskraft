import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
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
    await prisma.pushToken.upsert({
      where: { userId_token: { userId, token } },
      update: { platform, updatedAt: new Date() },
      create: { userId, token, platform },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register token' });
  }
});

// Send push notification (internal use)
export async function sendPushNotification(userId: string, title: string, body: string, data?: Record<string, unknown>) {
  try {
    const tokens = await prisma.pushToken.findMany({ where: { userId } });
    const messages = tokens
      .filter(t => Expo.isExpoPushToken(t.token))
      .map(t => ({ to: t.token, sound: 'default' as const, title, body, data }));
    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk).catch(() => {});
    }
  } catch {}
}

export default router;
