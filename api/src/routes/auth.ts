import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import { pool } from '../db/pool';

export const authRouter = Router();

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().min(1).max(50).required(),
  lastName: Joi.string().min(1).max(50).required(),
  phone: Joi.string().optional().allow(''),
  preferredLocale: Joi.string().valid('en', 'af').default('en'),
  userType: Joi.string().valid('consumer', 'butchery').default('consumer'),
  plan: Joi.string().valid('free', 'starter', 'pro', 'platinum').default('free'),
  butcheryId: Joi.string().uuid().optional().allow(null, ''),
  // Butchery owner fields
  butcheryName: Joi.string().optional().allow(''),
  butcheryType: Joi.string().optional().allow(''),
  regNumber: Joi.string().optional().allow(''),
});

authRouter.post('/register', async (req: Request, res: Response) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    res.status(400).json({ success: false, message: error.details[0].message });
    return;
  }
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [value.email]);
    if (existing.rows.length > 0) {
      res.status(409).json({ success: false, message: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(value.password, 12);
    const userId = uuidv4();

    // Validate butchery_id if provided
    let butcheryId = value.butcheryId || null;
    if (butcheryId) {
      const bCheck = await pool.query('SELECT id FROM butcheries WHERE id = $1 AND is_active = true', [butcheryId]);
      if (!bCheck.rows.length) butcheryId = null; // silently ignore invalid
    }

    await pool.query(
      `INSERT INTO users (id, email, password_hash, first_name, last_name, preferred_locale, tier, business_type, butchery_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        userId, value.email, passwordHash,
        value.firstName, value.lastName,
        value.preferredLocale, value.plan,
        value.userType === 'butchery' ? 'butcher' : 'consumer',
        butcheryId,
      ]
    );

    // If butchery owner, create butchery record
    if (value.userType === 'butchery' && value.butcheryName) {
      const slug = value.butcheryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      await pool.query(
        `INSERT INTO butcheries (name, slug, province, city, is_active, is_verified, tier)
         VALUES ($1, $2, 'Unknown', 'Unknown', true, false, 'free')
         ON CONFLICT (slug) DO NOTHING`,
        [value.butcheryName, `${slug}-${userId.slice(0, 8)}`]
      );
    }

    const token = jwt.sign(
      { id: userId, email: value.email, tier: value.plan },
      process.env.JWT_SECRET as string,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    );

    res.status(201).json({
      success: true, token,
      user: { id: userId, email: value.email, tier: value.plan, butcheryId },
    });
  } catch (err) {
    console.error('[Auth] Register error:', err);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

authRouter.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Email and password required' });
    return;
  }
  try {
    const result = await pool.query(
      'SELECT id, email, password_hash, tier, butchery_id FROM users WHERE email = $1',
      [email]
    );
    if (!result.rows.length) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, tier: user.tier },
      process.env.JWT_SECRET as string,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    );
    res.json({
      success: true, token,
      user: { id: user.id, email: user.email, tier: user.tier, butcheryId: user.butchery_id },
    });
  } catch {
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

authRouter.get('/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'No token' });
    return;
  }
  try {
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, tier, preferred_locale, butchery_id,
              business_name, business_type, phone
       FROM users WHERE id = $1`,
      [decoded.id]
    );
    if (!result.rows.length) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({ success: true, user: result.rows[0] });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});
