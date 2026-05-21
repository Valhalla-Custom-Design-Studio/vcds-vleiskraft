import { Router, Request, Response } from "express";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// KAN-39: Graceful stubs — returns 501 instead of crashing

router.get("/catalogue", authenticateToken, (_req: Request, res: Response) => {
  res.status(200).json({ items: [], message: "Meat catalogue — coming soon" });
});

router.get("/cuts", authenticateToken, (_req: Request, res: Response) => {
  res.status(200).json({ cuts: [], message: "Meat cuts database — coming soon" });
});

router.post("/order", authenticateToken, (_req: Request, res: Response) => {
  res.status(501).json({ error: "Meat ordering not yet implemented", code: "NOT_IMPLEMENTED" });
});

router.get("/suppliers", authenticateToken, (_req: Request, res: Response) => {
  res.status(200).json({ suppliers: [], message: "Supplier directory — coming soon" });
});

export default router;
