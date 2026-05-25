/**
 * SA Meat Demand Intelligence API — Tier 1 Data Moat
 */
import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { requirePlatinum } from "../middleware/requirePlatinum";
import { generateDemandForecast } from "../services/MeatIntelligenceService";

const router = Router();

router.get("/forecast", requireAuth, requirePlatinum, async (req: Request, res: Response) => {
  try {
    const butcheryId = (req as any).user.butchery_id || undefined;
    const report = await generateDemandForecast(butcheryId);
    res.json({ success: true, report });
  } catch (error: any) {
    res.status(500).json({ error: "Demand forecast failed", details: error.message });
  }
});

export default router;
