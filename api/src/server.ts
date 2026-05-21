import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth";
import subscriptionRoutes from "./routes/subscriptions";
import paymentRoutes from "./routes/payments";
import healthRoutes from "./routes/health";
import vleisaiRoutes from "./routes/vleisai";
import meatRoutes from "./routes/meat";
import orderRoutes from "./routes/orders";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// KAN-38: Restrict CORS to production origins only
const allowedOrigins = [
  process.env.APP_ORIGIN || "https://vleiskraft.vcds.co.za",
  "https://vleiskraft.co.za",
  "http://localhost:3000",
  "http://localhost:8081"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true
}));

app.use(helmet());
app.use(express.json());
app.use(requestLogger);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/vleisai", vleisaiRoutes);       // KAN-33: VleisAI (was vleisgpt)
app.use("/api/meat", meatRoutes);
app.use("/api/orders", orderRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`VleisKraft™ API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`PayFast: ${process.env.PAYFAST_URL || "https://www.payfast.co.za/eng/process"}`);
});

export default app;
