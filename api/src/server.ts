// cache-bust: 2026-05-28T11:29:15.964559
import { runMigrations } from './db/migrate';
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import * as Sentry from "@sentry/node";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";
import { authRouter as authRoutes } from "./routes/auth";
import subscriptionRoutes from "./routes/subscriptions";
import paymentRoutes from "./routes/payments";
import { healthRouter as healthRoutes } from "./routes/health";
import vleisaiRoutes from "./routes/vleisai";
import vleisaiIdentifyRoutes from "./routes/vleisaiIdentify";
import meatRoutes from "./routes/meat";
import orderRoutes from "./routes/orders";
import woocommerceRoutes from "./routes/woocommerce";
import brandingRoutes from "./routes/branding";
import butcheriesRoutes from "./routes/butcheries";
import voiceOrderRoutes from "./routes/voiceOrder";
import streamRoutes from "./routes/stream";
import challengesRoutes from "./routes/challenges";
import campaignsRoutes from "./routes/campaigns";
import stockvelRoutes from "./routes/stockvel";
import laybyRoutes from "./routes/layby";
import spitbraaiRoutes from "./routes/spitbraai";
import mealPlannerRoutes from "./routes/mealPlanner";
import demandIntelligenceRoutes from "./routes/demandIntelligence";
import whatsappCommerceRoutes from "./routes/whatsappCommerce";
import vleistoForkRoutes from "./routes/vleistofork.routes";

import { startCronJobs } from "./cron";

dotenv.config();

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || "production",
  release: "vleiskraft@" + (process.env.npm_package_version || "1.0.0"),
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
  integrations: [Sentry.httpIntegration(), Sentry.expressIntegration()],
});

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
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(requestLogger);

// ─── Routes ─────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/vleisai", vleisaiRoutes);
app.use("/api/vleisai", vleisaiIdentifyRoutes);
app.use("/api/meat", meatRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/woocommerce", woocommerceRoutes);
app.use("/api/branding", brandingRoutes);
app.use("/api/butcheries", butcheriesRoutes);
app.use("/api/voice-order", voiceOrderRoutes);
app.use("/api/stream", streamRoutes);
app.use("/api/challenges", challengesRoutes);
app.use("/api/campaigns", campaignsRoutes);
app.use("/api/stockvel", stockvelRoutes);
app.use("/api/layby", laybyRoutes);
app.use("/api/spitbraai", spitbraaiRoutes);
app.use("/api/meal-planner", mealPlannerRoutes);
app.use("/api/demand-intelligence", demandIntelligenceRoutes);
app.use("/api/whatsapp-commerce", whatsappCommerceRoutes);

app.use("/api/vleistofork", vleistoForkRoutes);
app.use(errorHandler);

async function bootstrap() {
  try {
    await runMigrations();
  } catch (err) {
    console.error("⚠️  Migration warning (non-fatal):", err);
  }
  startCronJobs();
  app.listen(PORT, () => {
    // server started
  });
}

bootstrap();
export default app;
