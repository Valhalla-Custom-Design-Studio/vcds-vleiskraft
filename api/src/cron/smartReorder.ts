/**
 * Cron Job 2: Smart Reorder Nudge
 * Analyses order history to predict when a user is likely to reorder
 * Sends push + SMS nudge 2 days before predicted reorder date
 */
export async function runSmartReorder(): Promise<void> {
  console.log('[SmartReorder] Analysing order patterns...');
  // 1. Query orders grouped by userId + productId
  // 2. Calculate average days between orders
  // 3. If (lastOrderDate + avgInterval - 2 days) === today → send nudge
  // 4. Track in reorder_nudges table to avoid duplicate sends
}
