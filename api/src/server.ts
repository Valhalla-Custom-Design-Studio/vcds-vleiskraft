import { runMigrations } from './db/migrate';
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import * as Sentry from "@sentry/node";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";
import { authRouter as authRoutes } from "./routes/auth";
import { subscriptionRouter as subscriptionRoutes } from "./routes/subscriptions";
import paymentRoutes from "./routes/payments";
import { healthRouter as healthRoutes } from "./routes/health";
import vleisaiRoutes from "./routes/vleisai";
import meatRoutes from "./routes/meat";
import orderRoutes from "./routes/orders";
import woocommerceRoutes from "./routes/woocommerce";
import brandingRoutes from "./routes/branding";
import butcheriesRoutes from "./routes/butcheries";
import voiceOrderRoutes from "./routes/voiceOrder";
import streamRoutes from "./routes/stream";
import challengesRoutes from "./routes/challenges";
import { startCronJobs } from "./cron";
import stockvelRoutes from "./routes/stockvel";
import laybyRoutes from "./routes/layby";
import spitbraaiRoutes from "./routes/spitbraai";
import mealPlannerRoutes from "./routes/mealPlanner";
import demandIntelligenceRoutes from "./routes/demandIntelligence";
import whatsappCommerceRoutes from "./routes/whatsappCommerce";

dotenv.config();

// ─── Sentry Error Monitoring ───────────────────────────────────
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || "production",
  release: "vleiskraft@" + (process.env.npm_package_version || "1.0.0"),
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
  integrations: [
    Sentry.httpIntegration(),
    Sentry.expressIntegration(),
  ],
});
// ──────────────────────────────────────────────────────────────

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  process.env.APP_ORIGIN || "https://vleiskraft.vcds.co.za",
  "https://vleiskraft.co.za",
  "http://localhost:3000",
  "http://localhost:8081",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
}));

app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(requestLogger);

// ─── Routes ───────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/vleisai", vleisaiRoutes);
app.use("/api/vleisgpt", vleisaiRoutes);       // KAN-33: backward compat alias
app.use("/api/meat", meatRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/woocommerce", woocommerceRoutes);
app.use("/api/tenant", brandingRoutes);
app.use("/api/butcheries", butcheriesRoutes);  // KAN-40: Butchery selector
app.use("/api/voice-order", voiceOrderRoutes); // Voice Ordering™
app.use("/api/stream", streamRoutes);          // Stream.io chat
app.use("/api/challenges", challengesRoutes);  // Community Challenges
app.use("/api/stockvel", stockvelRoutes);        // Stockvel Savings Groups
app.use("/api/layby", laybyRoutes);              // Lay-By System
app.use("/api/spitbraai", spitbraaiRoutes);      // SpitBraai Bookings
app.use("/api/meal-planner", mealPlannerRoutes); // AI Meal Planner
app.use("/api/demand-intelligence", demandIntelligenceRoutes);
app.use("/api/whatsapp", whatsappCommerceRoutes);

// ─── Sentry error handler (must be last) ──────────────────
if (process.env.SENTRY_DSN) {
  app.use(Sentry.expressErrorHandler());
}
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`VleisKraft™ API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`PayFast: ${process.env.PAYFAST_URL || "https://www.payfast.co.za/eng/process"}`);

  // Start all 5 cron jobs
  startCronJobs();
});

export default app;
