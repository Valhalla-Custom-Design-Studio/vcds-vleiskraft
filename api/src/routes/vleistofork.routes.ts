import { Router, Request, Response } from "express";
import { generateQRPayload, verifyBlockchainHash, calculateCarbonFootprint } from "../services/VleisToForkService";

const router = Router();

/**
 * POST /api/vleistofork/generate
 * Generate a Vleis-to-Fork™ QR traceability record
 */
router.post("/generate", async (req: Request, res: Response) => {
  try {
    const record = req.body;
    if (!record.animal || !record.slaughter) {
      return res.status(400).json({ error: "animal and slaughter records required" });
    }
    const result = generateQRPayload(record);
    return res.json({ success: true, data: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
});

/**
 * POST /api/vleistofork/verify
 * Verify blockchain hash integrity of a record
 */
router.post("/verify", (req: Request, res: Response) => {
  const { record } = req.body;
  const valid = verifyBlockchainHash(record);
  return res.json({ success: true, valid, message: valid ? "Record integrity verified ✅" : "Record tampered ❌" });
});

/**
 * GET /api/vleistofork/carbon
 * Calculate carbon footprint
 */
router.get("/carbon", (req: Request, res: Response) => {
  const { feed_type, weight_kg, transport_km } = req.query;
  const co2 = calculateCarbonFootprint(
    feed_type as "grass_fed",
    parseFloat(weight_kg as string),
    parseFloat(transport_km as string)
  );
  return res.json({ success: true, carbon_kg_co2: co2 });
});

export default router;
