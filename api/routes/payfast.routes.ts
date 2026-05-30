/**
 * DEPRECATED — This file is intentionally disabled.
 *
 * VleisKraft has TWO canonical PayFast handlers:
 *   1. POST /api/payments/itn       → api/src/routes/payments.ts   (checkout flow)
 *   2. POST /api/subscriptions/webhook → api/src/routes/subscriptions.ts (subscription flow)
 *
 * This legacy duplicate has been removed to prevent double-processing of ITN events.
 * Do NOT re-enable this file. Route all PayFast webhooks to the handlers above.
 */

import { Router } from 'express';
const router = Router();
// No routes registered — file kept for import compatibility only
export default router;
