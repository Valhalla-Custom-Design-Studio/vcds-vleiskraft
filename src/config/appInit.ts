/**
 * App initialisation — called once on startup
 * Wires Sentry error tracking + PostHog analytics
 */
import { initSentry } from '../services/sentry';
import { initPostHog } from '../services/posthog';

export function initApp() {
  initSentry();
  initPostHog();
}
