import { Router, Request, Response } from "express";
import { authenticateToken } from "../middleware/auth";

const router = Router();

/**
 * VleisAI™ — AI-powered meat intelligence
 * KAN-33: Renamed from VleisGPT (OpenAI trademark risk)
 */
router.post("/chat", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body;
    if (!message) return res.status(400).json({ error: "message required" });

    // TODO: wire to OpenAI / custom LLM
    res.json({
      reply: `VleisAI™ received: "${message}". AI integration pending.`,
      context: context || null,
      model: "vleisai-v1"
    });
  } catch (err) {
    res.status(500).json({ error: "VleisAI service error" });
  }
});

router.get("/status", (_req: Request, res: Response) => {
  res.json({ service: "VleisAI™", status: "online", version: "1.0.0" });
});

export default router;
