import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../services/mailer';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import { pool } from '../db/pool';

// WAVE 2: Migrate to NestJS + Prisma  -  tracked in KAN backlog
// Logic ported from nodejs_space/src/auth/auth.service.ts (NestJS → Express)

export const authRouter = Router();

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().min(1).max(50).required(),
  lastName: Joi.string().min(1).max(50).required(),
  phone: Joi.string().optional().allow(''),
  preferredLocale: Joi.string().valid('en', 'af').default('af'),
  accountType: Joi.string().valid('consumer', 'butchery').default('consumer'),
  plan: Joi.string().valid('free', 'starter', 'pro', 'platinum').default('free'),
  butcheryId: Joi.string().uuid().optional().allow(null, ''),
  butcheryName: Joi.string().optional().allow(''),
  butcheryType: Joi.string().optional().allow(''),
  regNumber: Joi.string().optional().allow(''),
});

function formatUser(user: any, butchery?: any) {
  return {
    id: user.id,
    email: user.email,
    name: `${user.first_name} ${user.last_name}`,
    firstName: user.first_name,
    lastName: user.last_name,
    phone: user.phone,
    role: user.role ?? (user.business_type === 'butcher' ? 'ADMIN' : 'USER'),
    language: user.preferred_locale ?? 'af',
    accountType: user.business_type === 'butcher' ? 'butchery' : 'consumer',
    tier: user.tier,
    butcheryId: user.butchery_id,
    butchery: butchery
      ? { id: butchery.id, name: butchery.name, slug: butchery.slug, subscriptionStatus: butchery.subscription_status }
      : undefined,
  };
}

// --- POST /register -----------------------------------------------------------
authRouter.post('/register', async (req: Request, res: Response) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    res.status(400).json({ success: false, message: error.details[0].message });
    return;
  }
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [value.email]);
    if (existing.rows.length > 0) {
      res.status(409).json({ success: false, message: 'E-posadres reeds geregistreer / Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(value.password, 12);
    const userId = uuidv4();
    let butcheryId = value.butcheryId || null;
    let role = 'USER';

    if (value.accountType === 'butchery') {
      // -- Butchery owner: create new butchery record --
      if (!value.butcheryName?.trim()) {
        res.status(400).json({ success: false, message: 'Slaghuisnaam benodig / Butchery name required' });
        return;
      }
      const slug = value.butcheryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const existingSlug = await pool.query('SELECT id FROM butcheries WHERE slug = $1', [slug]);
      const finalSlug = existingSlug.rows.length ? `${slug}-${userId.slice(0, 8)}` : slug;

      const butcheryResult = await pool.query(
        `INSERT INTO butcheries (id, name, slug, province, city, is_active, is_verified, tier, subscription_status)
         VALUES ($1,$2,$3,'Unknown','Unknown',true,false,$4,'pending_payment') RETURNING id`,
        [uuidv4(), value.butcheryName.trim(), finalSlug, value.plan]
      );
      butcheryId = butcheryResult.rows[0].id;
      role = 'ADMIN';
    } else if (butcheryId) {
      // -- Consumer: validate provided butchery --
      const bCheck = await pool.query('SELECT id FROM butcheries WHERE id = $1 AND is_active = true', [butcheryId]);
      if (!bCheck.rows.length) butcheryId = null;
    } else {
      // -- Consumer: link to first available butchery --
      const defaultButchery = await pool.query('SELECT id FROM butcheries WHERE is_active = true ORDER BY created_at ASC LIMIT 1');
      if (defaultButchery.rows.length) butcheryId = defaultButchery.rows[0].id;
    }

    await pool.query(
      `INSERT INTO users (id, email, password_hash, first_name, last_name, phone, preferred_locale, tier, business_type, butchery_id, role)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        userId, value.email, passwordHash,
        value.firstName, value.lastName, value.phone || null,
        value.preferredLocale, value.plan,
        value.accountType === 'butchery' ? 'butcher' : 'consumer',
        butcheryId, role,
      ]
    );

    const userRow = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    let butcheryRow = null;
    if (butcheryId) {
      const br = await pool.query('SELECT * FROM butcheries WHERE id = $1', [butcheryId]);
      butcheryRow = br.rows[0] ?? null;
    }

    const token = jwt.sign(
      { id: userId, email: value.email, tier: value.plan, role, butcheryId },
      process.env.JWT_SECRET as string,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    );

    res.status(201).json({ success: true, token, user: formatUser(userRow.rows[0], butcheryRow) });
  } catch (err) {
    console.error('[Auth] Register error:', err);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// --- POST /login --------------------------------------------------------------
authRouter.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Email and password required' });
    return;
  }
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (!result.rows.length) {
      res.status(401).json({ success: false, message: 'Ongeldige aanmeldbesonderhede / Invalid credentials' });
      return;
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ success: false, message: 'Ongeldige aanmeldbesonderhede / Invalid credentials' });
      return;
    }

    // -- Butchery subscription gate (ported from NestJS auth.service.ts) --
    let butcheryRow = null;
    if (user.butchery_id) {
      const br = await pool.query('SELECT * FROM butcheries WHERE id = $1', [user.butchery_id]);
      butcheryRow = br.rows[0] ?? null;
      if (user.business_type === 'butcher' && butcheryRow?.subscription_status === 'pending_payment') {
        res.status(401).json({
          success: false,
          message: 'Betaling uitstaande. Voltooi asb jou betaling om toegang te kry / Payment pending. Please complete payment to access your account.',
          code: 'PAYMENT_PENDING',
        });
        return;
      }
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, tier: user.tier, role: user.role, butcheryId: user.butchery_id },
      process.env.JWT_SECRET as string,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    );

    res.json({ success: true, token, user: formatUser(user, butcheryRow) });
  } catch (err) {
    console.error('[Auth] Login error:', err);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// --- GET /me ------------------------------------------------------------------
authRouter.get('/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'No token' });
    return;
  }
  try {
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    if (!result.rows.length) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    const user = result.rows[0];
    let butcheryRow = null;
    if (user.butchery_id) {
      const br = await pool.query('SELECT * FROM butcheries WHERE id = $1', [user.butchery_id]);
      butcheryRow = br.rows[0] ?? null;
    }
    res.json({ success: true, user: formatUser(user, butcheryRow) });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

authRouter.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) { res.status(400).json({ success: false, message: 'Email required' }); return; }
  try {
    const { rows } = await pool.query('SELECT id FROM users WHERE email=$1', [email.toLowerCase()]);
    if (!rows.length) { res.json({ success: true, message: 'If that email exists, a reset link was sent' }); return; }
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000);
    await pool.query('UPDATE users SET reset_token=$1,reset_token_expires=$2 WHERE id=$3', [resetToken, expires, rows[0].id]);
    if (process.env.NODE_ENV !== 'development') {
      await sendPasswordResetEmail(email.toLowerCase(), resetToken, 'VleisKraft(TM)');
    }
    res.json({ success: true, message: 'If that email exists, a reset link was sent', debug_token: process.env.NODE_ENV === 'development' ? resetToken : undefined });
  } catch(e) { res.status(500).json({ success: false, message: 'Failed' }); }
});

authRouter.post('/reset-password', async (req: Request, res: Response) => {
  const { token, password } = req.body;
  if (!token || !password) { res.status(400).json({ success: false, message: 'Token and password required' }); return; }
  if (password.length < 8) { res.status(400).json({ success: false, message: 'Password must be at least 8 characters' }); return; }
  try {
    const { rows } = await pool.query('SELECT id FROM users WHERE reset_token=$1 AND reset_token_expires>NOW()', [token]);
    if (!rows.length) { res.status(400).json({ success: false, message: 'Invalid or expired token' }); return; }
    const hash = await bcrypt.hash(password, 12);
    await pool.query('UPDATE users SET password_hash=$1,reset_token=NULL,reset_token_expires=NULL WHERE id=$2', [hash, rows[0].id]);
    res.json({ success: true, message: 'Password reset successful' });
  } catch(e) { res.status(500).json({ success: false, message: 'Failed' }); }
});

