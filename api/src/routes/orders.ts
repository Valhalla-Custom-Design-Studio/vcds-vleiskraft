import { Router, Request, Response } from "express";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// KAN-32: /api/orders now returns PayFast redirect URL
router.post("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { items, total, email } = req.body;
    if (!items || !total) {
      return res.status(400).json({ error: "items and total required" });
    }

    // Delegate to payments/checkout
    res.json({
      message: "Order received. Proceed to payment.",
      nextStep: "POST /api/payments/checkout",
      order: { items, total, email, status: "pending_payment" }
    });
  } catch (err) {
    res.status(500).json({ error: "Order creation failed" });
  }
});

router.get("/:id", authenticateToken, async (req: Request, res: Response) => {
  res.json({ order_id: req.params.id, status: "pending", message: "Order lookup coming soon" });
});

export default router;
