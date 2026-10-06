import { CronJob } from "cron";
import { sendOverdueReminders } from "../routers/paymentReminders";
import { processEmailQueue } from "../routers/emailQueue";
import { sendUsageReminders } from "../jobs/usageReminders";
import { processDueReminders } from "../routers/reminders";
import { dispatchSystemReport } from "../services/systemReportingService";
import { processERPIntegrationEvents } from "../jobs/erpIntegrationJob";

/**
 * Scheduler configuration for automated background jobs
 * Run this in your main server initialization
 */

export function initializeSchedulers() {
  console.log("[SCHEDULER] Initializing background job schedulers...");

  // ============================================================================
  // EMAIL QUEUE PROCESSOR - Every 5 minutes
  // Process pending emails from queue and handle retries
  // ============================================================================
  const emailQueueJob = new CronJob("*/5 * * * *", async () => {
    try {
      console.log("[SCHEDULER] Running email queue processor...");
      const result = await processEmailQueue();
      if (result.success) {
        console.log(
          `[SCHEDULER] Email queue processed: ${result.processed} sent, ${result.failed} failed out of ${result.total}`
        );
      } else {
        console.error("[SCHEDULER] Email queue processor failed:", result.error);
      }
    } catch (error) {
      console.error("[SCHEDULER] Error in email queue processor:", error);
    }
  });

  // ============================================================================
  // OVERDUE INVOICE REMINDERS - Daily at 09:00 AM
  // Check for overdue invoices and send reminders
  // Respects reminder history to avoid duplicate emails
  // ============================================================================
  const overdueRemindersJob = new CronJob("0 9 * * *", async () => {
    try {
      console.log("[SCHEDULER] Running overdue invoice reminder check...");
      const result = await sendOverdueReminders();
      console.log(
        `[SCHEDULER] Overdue reminders processed: ${result.sent} sent, ${result.skipped} skipped, ${result.errors} errors`
      );
    } catch (error) {
      console.error("[SCHEDULER] Error in overdue reminders processor:", error);
    }
  });

  // ============================================================================
  // USAGE REMINDERS - Weekly on Monday at 10:00 AM
  // Remind users to create clients, invoices, and complete their profile
  // ============================================================================
  const usageReminderJob = new CronJob("0 10 * * 1", async () => {
    try {
      console.log("[SCHEDULER] Running usage reminder check...");
      const result = await sendUsageReminders();
      console.log(
        `[SCHEDULER] Usage reminders: ${result.sent} sent, ${result.skipped} skipped, ${result.errors} errors`
      );
    } catch (error) {
      console.error("[SCHEDULER] Error in usage reminders:", error);
    }
  });

  const remindersJob = new CronJob("*/5 * * * *", async () => {
    try {
      const result = await processDueReminders();
      if (result.processed > 0) console.log(`[SCHEDULER] Reminders: ${result.delivered}/${result.processed} delivered`);
    } catch (error) {
      console.error("[SCHEDULER] Error in reminders processor:", error);
    }
  });

  const weeklySystemReportJob = new CronJob("0 8 * * 1", async () => {
    try {
      const result = await dispatchSystemReport("weekly");
      console.log(`[SCHEDULER] Weekly system reports delivered: ${result.delivered}`);
    } catch (error) {
      console.error("[SCHEDULER] Error in weekly system reports:", error);
    }
  });

  const monthlySystemReportJob = new CronJob("0 8 1 * *", async () => {
    try {
      const result = await dispatchSystemReport("monthly");
      console.log(`[SCHEDULER] Monthly system reports delivered: ${result.delivered}`);
    } catch (error) {
      console.error("[SCHEDULER] Error in monthly system reports:", error);
    }
  });

  const erpIntegrationJob = new CronJob("*/2 * * * *", async () => {
    try {
      const result = await processERPIntegrationEvents();
      if (result.processed > 0) console.log(`[SCHEDULER] ERP integrations: ${result.succeeded} succeeded, ${result.failed} retrying, ${result.deadLettered} dead-lettered`);
    } catch (error) {
      console.error("[SCHEDULER] Error in ERP integration processor:", error);
    }
  });

  // Start all registered jobs
  emailQueueJob.start();
  overdueRemindersJob.start();
  usageReminderJob.start();
  remindersJob.start();
  weeklySystemReportJob.start();
  monthlySystemReportJob.start();
  erpIntegrationJob.start();

  console.log("[SCHEDULER] Background jobs started:");
  console.log("  - Email queue processor: Every 5 minutes");
  console.log("  - Overdue invoice reminders: Daily at 09:00 AM");
  console.log("  - Usage reminders: Weekly on Monday at 10:00 AM");
  console.log("  - System reports: Weekly Monday 08:00 and monthly 1st at 08:00");
  console.log("  - ERP integration events: Every 2 minutes with bounded retries");

  return {
    emailQueueJob,
    overdueRemindersJob,
    usageReminderJob,
    remindersJob,
    weeklySystemReportJob,
    monthlySystemReportJob,
    erpIntegrationJob,
  };
}

/**
 * Manual job triggers for testing/admin use
 */
export const manualTriggers = {
  async processEmailQueue() {
    return await processEmailQueue();
  },

  async sendOverdueReminders() {
    return await sendOverdueReminders();
  },

  async sendUsageReminders() {
    return await sendUsageReminders();
  },

  async processERPIntegrationEvents() {
    return await processERPIntegrationEvents();
  },
};
