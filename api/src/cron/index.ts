/**
 * VleisKraft™ Cron Job Scheduler
 * All 5 scheduled jobs — runs on API server startup
 */
import cron from 'node-cron';
import { runWeatherAlert } from './weatherAlert';
import { runSmartReorder } from './smartReorder';
import { runSentimentDigest } from './sentimentDigest';
import { runDynamicPricing } from './dynamicPricing';
import { runPredictions } from './predictions';

export function startCronJobs() {
  console.log('[CRON] Starting all VleisKraft™ cron jobs...');

  // Job 1: Weather Alert — every 3 hours
  cron.schedule('0 */3 * * *', async () => {
    console.log('[CRON] Running weather alert job');
    await runWeatherAlert().catch(console.error);
  });

  // Job 2: Smart Reorder Nudge — daily at 09:00 SAST
  cron.schedule('0 7 * * *', async () => {
    console.log('[CRON] Running smart reorder job');
    await runSmartReorder().catch(console.error);
  });

  // Job 3: Sentiment Digest — daily at 06:00 SAST
  cron.schedule('0 4 * * *', async () => {
    console.log('[CRON] Running sentiment digest job');
    await runSentimentDigest().catch(console.error);
  });

  // Job 4: Dynamic Pricing — every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    console.log('[CRON] Running dynamic pricing job');
    await runDynamicPricing().catch(console.error);
  });

  // Job 5: Predictions — daily at 02:00 SAST (midnight UTC)
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Running predictions job');
    await runPredictions().catch(console.error);
  });

  console.log('[CRON] All 5 jobs scheduled ✅');
}
