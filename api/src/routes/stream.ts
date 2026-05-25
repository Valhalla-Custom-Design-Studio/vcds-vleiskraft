import { Router, Request, Response } from 'express';
import { StreamChat } from 'stream-chat';
import { requireAuth } from '../middleware/auth';

const router = Router();
const STREAM_KEY = process.env.STREAM_API_KEY || 'xdpp6ngtjmpz';
const STREAM_SECRET = process.env.STREAM_API_SECRET || '';

router.get('/token', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!STREAM_SECRET) return res.status(500).json({ error: 'Stream not configured' });
  const client = StreamChat.getInstance(STREAM_KEY, STREAM_SECRET);
  const token = client.createToken(user.id);
  res.json({ token, userId: user.id });
});

export default router;
