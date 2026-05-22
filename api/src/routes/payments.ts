import { Router, Request, Response } from "express";
import crypto from "crypto";
import { authenticate } from "../middleware/auth";

const router = Router();

const PAYFAST_LIVE_URL = "https://www.payfast.co.za/eng/process";
const MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || "11910323";
const MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY || "f61uspt7vtdta";
const PASSPHRASE = process.env.PAYFAST_PASSPHRASE || "ValhallaCustoms1986";
const APP_ORIGIN = process.env.APP_ORIGIN || "https://vleiskraft.vcds.co.za";

function generateSignature(data: Record<string, string>, passphrase: string): string {
  const str = Object.entries(data)
    .filter(([, v]) => v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(v).replace(/%20/g, "+")}`)
    .join("&") + `&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}`;
  return crypto.createHash("md5").update(str).digest("hex");
}

// KAN-32: Returns PayFast redirect URL so frontend can open it
router.post("/checkout", authenticate, async (req: Request, res: Response) => {
  try {
    const { amount, item_name, email, first_name, last_name } = req.body;
    if (!amount || !item_name) {
      return res.status(400).json({ error: "amount and item_name required" });
    }

    const paymentData: Record<string, string> = {
      merchant_id: MERCHANT_ID,
      merchant_key: MERCHANT_KEY,
      return_url: `${APP_ORIGIN}/payment/success`,
      cancel_url: `${APP_ORIGIN}/payment/cancel`,
      notify_url: `${APP_ORIGIN}/api/payments/itn`,
      name_first: first_name || "",
      name_last: last_name || "",
      email_address: email || "",
      amount: parseFloat(amount).toFixed(2),
      item_name: item_name,
    };

    paymentData.signature = generateSignature(paymentData, PASSPHRASE);

    const queryString = Object.entries(paymentData)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");

    // KAN-31: Live PayFast URL
    const redirectUrl = `${PAYFAST_LIVE_URL}?${queryString}`;

    res.json({ redirectUrl, paymentData });
  } catch (err) {
    res.status(500).json({ error: "Payment initiation failed" });
  }
});

// ITN handler
router.post("/itn", async (req: Request, res: Response) => {
  try {
    const { payment_status, pf_payment_id, amount_gross, item_name } = req.body;
    console.log("PayFast ITN received:", { payment_status, pf_payment_id, amount_gross, item_name });
    // TODO: verify signature, update subscription status in DB
    res.status(200).send("OK");
  } catch (err) {
    res.status(500).send("ITN error");
  }
});

router.get("/status/:id", authenticate, async (req: Request, res: Response) => {
  res.json({ payment_id: req.params.id, status: "pending", message: "Check PayFast dashboard" });
});

export default router;
