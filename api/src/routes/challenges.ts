import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/challenges
router.get('/', requireAuth, async (req: Request, res: Response) => {
  // In production: query challenges table with active status
  const mockChallenges = [
    {
      id: '1',
      title: 'Beste Braai Foto™',
      description: 'Deel jou beste braai foto en wen R500 se vleis!',
      prize: 'R500 VleisKraft™ voucher',
      endsAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      entryCount: 47,
      hasEntered: false,
      category: 'photo',
    },
    {
      id: '2',
      title: 'Boerewors Resep Uitdaging',
      description: 'Deel jou geheime boerewors resep en wen 5kg premium boerewors',
      prize: '5kg Premium Boerewors',
      endsAt: new Date(Date.now() + 14 * 86400000).toISOString(),
      entryCount: 23,
      hasEntered: false,
      category: 'recipe',
    },
  ];
  res.json({ challenges: mockChallenges });
});

// POST /api/challenges/:id/enter
router.post('/:id/enter', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;
  // In production: insert into challenge_entries table
  res.json({ success: true, challengeId: id, userId: user.id });
});

export default router;
