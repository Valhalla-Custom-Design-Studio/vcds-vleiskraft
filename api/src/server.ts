import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
dotenv.config();

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
import voiceOrderRoutes from "./routes/voiceOrder";
import challengeRoutes from "./routes/challenges";
import streamRoutes from "./routes/stream";
import vleisaiIdentifyRoutes from "./routes/vleisaiIdentify";
import { startCronJobs } from "./cron";

// ─── Sentry (must init before routes) ─────────────────────
const SENTRY_DSN = process.env.SENTRY_DSN_BACKEND || process.env.SENTRY_DSN || "";
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || "production",
    release: "vleiskraft@" + (process.env.npm_package_version || "1.0.0"),
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
    integrations: [Sentry.httpIntegration(), Sentry.expressIntegration()],
  });
  console.log("[Sentry] Backend error tracking initialised");
} else {
  console.warn("[Sentry] No DSN — backend error tracking disabled");
}

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  process.env.APP_ORIGIN || "https://vleiskraft.vcds.co.za",
  "https://vleiskraft.co.za",
  "http://localhost:3000",
  "http://localhost:8081",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
  })
);

app.use(helmet());
app.use(express.json());
app.use(requestLogger);

// ─── Routes ───────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/health", healthRoutes);
app.use("/health", healthRoutes); // Render health check alias
app.use("/api/vleisai", vleisaiRoutes);
app.use("/api/vleisgpt", vleisaiRoutes);          // backward compat
app.use("/api/meat", meatRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/woocommerce", woocommerceRoutes);
app.use("/api/tenant", brandingRoutes);
app.use("/api/voice-order", voiceOrderRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/stream", streamRoutes);
app.use("/api/identify", vleisaiIdentifyRoutes);

// ─── Sentry error handler (must be last) ──────────────────
if (SENTRY_DSN) {
  app.use(Sentry.expressErrorHandler());
}
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`VleisKraft™ API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`PayFast: ${process.env.PAYFAST_URL || "https://www.payfast.co.za/eng/process"}`);
  startCronJobs();
});

export default app;
