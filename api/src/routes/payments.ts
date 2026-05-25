import { Router, Request, Response } from "express";
import crypto from "crypto";
import { pool } from "../db/pool";
import { authenticate } from "../middleware/auth";
import * as Sentry from "@sentry/node";

const router = Router();

const PAYFAST_LIVE_URL = process.env.PAYFAST_URL || "https://www.payfast.co.za/eng/process";
const MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || "";
const MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY || "";
const PASSPHRASE = process.env.PAYFAST_PASSPHRASE || "";
const APP_ORIGIN = process.env.APP_ORIGIN || "https://vleiskraft.vcds.co.za";
const NOTIFY_URL = process.env.PAYFAST_NOTIFY_URL || `${APP_ORIGIN}/api/payments/itn`;
const RETURN_URL = process.env.PAYFAST_RETURN_URL || `${APP_ORIGIN}/payment/success`;
const CANCEL_URL = process.env.PAYFAST_CANCEL_URL || `${APP_ORIGIN}/payment/cancel`;

function generateSignature(data: Record<string, string>, passphrase: string): string {
  const str = Object.entries(data)
    .filter(([, v]) => v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(v).replace(/%20/g, "+")}`)
    .join("&") + `&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}`;
  return crypto.createHash("md5").update(str).digest("hex");
}

function verifyItnSignature(body: Record<string, string>, passphrase: string): boolean {
  const { signature, ...rest } = body;
  const expected = generateSignature(rest, passphrase);
  return expected === signature;
}

// Checkout — generate PayFast redirect URL
router.post("/checkout", authenticate, async (req: Request, res: Response) => {
  try {
    const { amount, item_name, email, first_name, last_name, subscription_type } = req.body;
    if (!amount || !item_name) return res.status(400).json({ error: "amount and item_name required" });

    const paymentData: Record<string, string> = {
      merchant_id: MERCHANT_ID,
      merchant_key: MERCHANT_KEY,
      return_url: `${APP_ORIGIN}/payment/success`,
      cancel_url: `${APP_ORIGIN}/payment/cancel`,
      notify_url: `${process.env.API_URL || APP_ORIGIN}/api/payments/itn`,
      name_first: first_name || "",
      name_last: last_name || "",
      email_address: email || "",
      amount: parseFloat(amount).toFixed(2),
      item_name,
    };

    // Subscription billing
    if (subscription_type === "monthly" || subscription_type === "annual") {
      paymentData.subscription_type = "1";
      paymentData.billing_date = new Date().toISOString().split("T")[0];
      paymentData.recurring_amount = parseFloat(amount).toFixed(2);
      paymentData.frequency = subscription_type === "monthly" ? "3" : "6";
      paymentData.cycles = "0"; // indefinite
    }

    paymentData.signature = generateSignature(paymentData, PASSPHRASE);
    const queryString = Object.entries(paymentData)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");

    res.json({ redirectUrl: `${PAYFAST_LIVE_URL}?${queryString}`, paymentData });
  } catch (err) {
    Sentry.captureException(err);
    res.status(500).json({ error: "Payment initiation failed" });
  }
});

// ITN (Instant Transaction Notification) — PayFast webhook
router.post("/itn", async (req: Request, res: Response) => {
  try {
    const body = req.body as Record<string, string>;
    const { payment_status, pf_payment_id, amount_gross, item_name, email_address, token } = body;

    // Verify signature
    if (!verifyItnSignature(body, PASSPHRASE)) {
      console.error("[PayFast ITN] Invalid signature");
      return res.status(400).send("Invalid signature");
    }

    if (payment_status === "COMPLETE") {
      // Find user by email
      const userResult = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email_address]
      );

      if (userResult.rows.length > 0) {
        const userId = userResult.rows[0].id;

        // Determine tier from item_name
        let tier = "free";
        if (item_name?.toLowerCase().includes("platinum")) tier = "platinum";
        else if (item_name?.toLowerCase().includes("pro")) tier = "pro";
        else if (item_name?.toLowerCase().includes("starter")) tier = "starter";

        // Update user tier
        await pool.query(
          "UPDATE users SET tier = $1, updated_at = NOW() WHERE id = $2",
          [tier, userId]
        );

        // Record payment
        await pool.query(`
          INSERT INTO payments (user_id, plan_id, amount_zar, status, payfast_payment_id)
          SELECT $1, p.id, $2, 'completed', $3
          FROM plans p WHERE p.tier_name = $4
          LIMIT 1
          ON CONFLICT (payfast_payment_id) DO NOTHING
        `, [userId, parseFloat(amount_gross), pf_payment_id, tier]);

        // Update or create subscription
        if (token) {
          await pool.query(`
            INSERT INTO subscriptions (user_id, plan_id, status, payfast_subscription_token)
            SELECT $1, p.id, 'active', $2
            FROM plans p WHERE p.tier_name = $3
            LIMIT 1
            ON CONFLICT (user_id) DO UPDATE SET
              status = 'active',
              payfast_subscription_token = EXCLUDED.payfast_subscription_token,
              next_billing_date = NOW() + INTERVAL '1 month'
          `, [userId, token, tier]);
        }

        console.log(`[PayFast ITN] User ${userId} upgraded to ${tier}`);
      }
    } else if (payment_status === "CANCELLED") {
      // Downgrade user to free
      const userResult = await pool.query("SELECT id FROM users WHERE email = $1", [email_address]);
      if (userResult.rows.length > 0) {
        await pool.query(
          "UPDATE users SET tier = 'free', updated_at = NOW() WHERE id = $1",
          [userResult.rows[0].id]
        );
        await pool.query(
          "UPDATE subscriptions SET status = 'cancelled' WHERE user_id = $1",
          [userResult.rows[0].id]
        );
      }
    }

    res.status(200).send("OK");
  } catch (err) {
    console.error("[PayFast ITN] Error:", err);
    res.status(500).send("ITN error");
  }
});

router.get("/status/:id", authenticate, async (req: Request, res: Response) => {
  const result = await pool.query(
    "SELECT status, amount_zar, created_at FROM payments WHERE payfast_payment_id = $1",
    [req.params.id]
  );
  if (!result.rows.length) return res.status(404).json({ error: "Payment not found" });
  res.json(result.rows[0]);
});

export default router;
