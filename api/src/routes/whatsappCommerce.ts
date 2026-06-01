/**
 * VleisKraft(TM) WhatsApp Commerce Webhook
 * Tier 4+5: Zero-app butchery ordering for township markets
 */
import { Router, Request, Response } from "express";
import { parseWhatsAppOrder, formatOrderConfirmation } from "../services/WhatsAppCommerceService";
import { pool } from "../db/pool";
import axios from "axios";

const router = Router();
const WA_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WA_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "vleiskraft-commerce-2026";

// Webhook verification
router.get("/webhook", (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.status(403).send("Forbidden");
});

// Process incoming orders
router.post("/webhook", async (req: Request, res: Response) => {
  res.status(200).send("EVENT_RECEIVED");

  try {
    const message = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message || message.type !== "text") return;

    const from = message.from;
    const text = message.text?.body || "";

    // Handle confirm/cancel
    if (text.toUpperCase() === "BEVESTIG" || text.toUpperCase() === "CONFIRM") {
      await sendWhatsAppReply(from, "✅ Bestelling bevestig! / Order confirmed! PayFast betaalskakels word gestuur. / payment link being sent. 🥩");
      return;
    }
    if (text.toUpperCase() === "KANSELLEER" || text.toUpperCase() === "CANCEL") {
      await sendWhatsAppReply(from, "❌ Bestelling gekanselleer. / Order cancelled. Stuur enige tyd \'n nuwe bestelling! / Send a new order anytime!");
      return;
    }

    // Parse order (use default butchery for demo)
    const butcheryId = process.env.DEFAULT_WHATSAPP_BUTCHERY_ID || "default";
    const parsed = await parseWhatsAppOrder(text, butcheryId);

    if (parsed.confidence > 0.6 && parsed.items.length > 0) {
      const confirmation = await formatOrderConfirmation(parsed, "VleisKraft(TM) Winkel", parsed.language);
      await sendWhatsAppReply(from, confirmation);
    } else {
      await sendWhatsAppReply(from, getMenuMessage());
    }
  } catch (err) {
    console.error("WhatsApp Commerce webhook error:", err);
  }
});

async function sendWhatsAppReply(to: string, message: string) {
  if (!WA_TOKEN || !WA_PHONE_ID) return;
  await axios.post(
    `https://graph.facebook.com/v19.0/${WA_PHONE_ID}/messages`,
    { messaging_product: "whatsapp", to, type: "text", text: { body: message } },
    { headers: { Authorization: `Bearer ${WA_TOKEN}` } }
  );
}

function getMenuMessage(): string {
  return `🥩 *Welkom by VleisKraft(TM)!*

Stuur jou bestelling in Afrikaans of Engels:
"Ek wil 2kg rump en 1kg boerewors bestel"

_Send your order in Afrikaans or English:_
_"I want 2kg rump and 1kg boerewors"_

📦 Aflewering via Pargo (Checkers, PEP)
💳 Betaal via PayFast

_VleisKraft(TM)  -  Die Slim Slaghuis App(TM)_`;
}

export default router;
