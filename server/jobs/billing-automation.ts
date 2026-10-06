/**
 * Billing Automation Jobs Orchestrator
 * Manages all scheduled billing tasks: trial expiration, renewal invoices, payment reminders
 * Uses node-cron for scheduling
 */

import cron from "node-cron";
import { getDb } from "../db";
import { sql } from "drizzle-orm";
import {
  organizationSubscriptions,
  auditLogs,
  paymentTriggers,
  invoices,
} from "../../drizzle/schema";

/**
 * Job Results Tracking
 */
export interface BillingJobResult {
  jobName: string;
  timestamp: Date;
  success: boolean;
  itemsProcessed: number;
  message: string;
  errors: string[];
}

/**
 * Trial Expiration Job (runs daily at 2 AM UTC)
 * 1. Sends warning email 7 days before trial ends
 * 2. Sends critical warning 24 hours before
 * 3. Marks org as suspended 1 day after trial ends (no payment)
 */
export async function handleTrialExpiration(): Promise<BillingJobResult> {
  const db = await getDb();
  if (!db) {
    return {
      jobName: "trial_expiration",
      timestamp: new Date(),
      success: false,
      itemsProcessed: 0,
      message: "Database unavailable",
      errors: ["DB connection failed"],
    };
  }

  const errors: string[] = [];
  let processedCount = 0;

  try {
    // Get all organizations with active trials
    const expiringTrials = await db.execute(
      sql`SELECT 
        os.organizationId, 
        os.trialEndDate,
        o.organizationName,
        o.email,
        DATEDIFF(os.trialEndDate, NOW()) as daysRemaining
      FROM organizationSubscriptions os
      JOIN organizations o ON os.organizationId = o.id
      WHERE os.trialEndDate IS NOT NULL 
        AND os.subscriptionStatus = 'trial'
        AND os.trialEndDate > NOW()`
    );

    const trials = (expiringTrials as any).records || [];

    for (const trial of trials) {
      const daysRemaining = trial.daysRemaining || 0;

      // 7 days warning
      if (Math.abs(daysRemaining - 7) < 1) {
        await createPaymentTrigger(
          trial.organizationId,
          "trial_warning_7d",
          "email_reminder",
          trial
        );
        processedCount++;
        console.log(`📧 Trial 7-day warning scheduled for ${trial.organizationName}`);
      }

      // 24 hours critical warning
      if (Math.abs(daysRemaining - 1) < 1) {
        await createPaymentTrigger(
          trial.organizationId,
          "trial_warning_24h",
          "email_critical",
          trial
        );
        processedCount++;
        console.log(`🔴 Trial critical warning scheduled for ${trial.organizationName}`);
      }

      // Trial expired - suspend org
      if (daysRemaining < -1) {
        await db.execute(
          sql`UPDATE organizationSubscriptions 
              SET subscriptionStatus = 'suspended'
              WHERE organizationId = ${trial.organizationId}`
        );

        // Disable all features
        await db.execute(
          sql`UPDATE organizations 
              SET isActive = false 
              WHERE id = ${trial.organizationId}`
        );

        await createAuditLog(
          trial.organizationId,
          "subscription_suspended",
          "organization",
          trial.organizationId,
          "Trial period ended without conversion to paid"
        );

        processedCount++;
        console.log(`⚠️ Organization suspended due to trial expiration: ${trial.organizationName}`);
      }
    }

    return {
      jobName: "trial_expiration",
      timestamp: new Date(),
      success: true,
      itemsProcessed: processedCount,
      message: `Processed ${processedCount} trial expiration events`,
      errors,
    };

  } catch (error: any) {
    errors.push(error.message);
    return {
      jobName: "trial_expiration",
      timestamp: new Date(),
      success: false,
      itemsProcessed: 0,
      message: "Error processing trial expirations",
      errors,
    };
  }
}

/**
 * Subscription Renewal Job (runs daily at 3 AM UTC)
 * Generates invoices for organizations on auto-renew whose renewal date has arrived
 */
export async function handleSubscriptionRenewal(): Promise<BillingJobResult> {
  const db = await getDb();
  if (!db) {
    return {
      jobName: "subscription_renewal",
      timestamp: new Date(),
      success: false,
      itemsProcessed: 0,
      message: "Database unavailable",
      errors: ["DB connection failed"],
    };
  }

  const errors: string[] = [];
  let processedCount = 0;

  try {
    // Get subscriptions due for renewal
    const renewalDue = await db.execute(
      sql`SELECT 
        os.organizationId,
        os.nextBillingDate,
        os.pricingTier,
        o.organizationName,
        o.email,
        ptd.monthlyPrice,
        ptd.annualPrice
      FROM organizationSubscriptions os
      JOIN organizations o ON os.organizationId = o.id
      JOIN pricingTierDescriptions ptd ON os.pricingTier = ptd.tier
      WHERE os.nextBillingDate <= NOW()
        AND os.subscriptionStatus IN ('active', 'past_due')
        AND os.autoRenewEnabled = true`
    );

    const renewals = (renewalDue as any).records || [];

    for (const renewal of renewals) {
      try {
        // Calculate renewal amount
        const amount = renewal.monthlyPrice; // Default to monthly

        // Generate invoice
        const invoiceId = crypto.randomUUID();
        const invoiceNumber = `INV-${Date.now()}`;

        await db.execute(
          sql`INSERT INTO invoices (
            id, organizationId, invoiceNumber, amount, status, 
            invoiceDate, dueDate, description, type
          ) VALUES (
            ${invoiceId}, ${renewal.organizationId}, ${invoiceNumber},
            ${amount}, 'pending', NOW(), DATE_ADD(NOW(), INTERVAL 10 DAY),
            'Subscription Renewal - ${renewal.pricingTier}', 'subscription'
          )`
        );

        // Update next billing date
        const nextBillingDate = new Date();
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

        await db.execute(
          sql`UPDATE organizationSubscriptions 
              SET nextBillingDate = ${nextBillingDate}
              WHERE organizationId = ${renewal.organizationId}`
        );

        // Create payment trigger to send invoice
        await createPaymentTrigger(
          renewal.organizationId,
          "subscription_renewal",
          "send_invoice",
          renewal,
          invoiceId
        );

        // Create audit log
        await createAuditLog(
          renewal.organizationId,
          "subscription_renewed",
          "subscription",
          renewal.organizationId,
          `Invoice ${invoiceNumber} generated for renewal`
        );

        processedCount++;
        console.log(`✅ Renewal invoice generated for ${renewal.organizationName}: ${invoiceNumber}`);

      } catch (itemError: any) {
        errors.push(`Failed to renew ${renewal.organizationName}: ${itemError.message}`);
      }
    }

    return {
      jobName: "subscription_renewal",
      timestamp: new Date(),
      success: true,
      itemsProcessed: processedCount,
      message: `Generated ${processedCount} renewal invoices`,
      errors,
    };

  } catch (error: any) {
    errors.push(error.message);
    return {
      jobName: "subscription_renewal",
      timestamp: new Date(),
      success: false,
      itemsProcessed: 0,
      message: "Error processing subscription renewals",
      errors,
    };
  }
}

/**
 * Payment Reminder Job (runs daily at 4 AM UTC)
 * Sends reminders for overdue and upcoming due invoices
 */
export async function handlePaymentReminders(): Promise<BillingJobResult> {
  const db = await getDb();
  if (!db) {
    return {
      jobName: "payment_reminders",
      timestamp: new Date(),
      success: false,
      itemsProcessed: 0,
      message: "Database unavailable",
      errors: ["DB connection failed"],
    };
  }

  const errors: string[] = [];
  let processedCount = 0;

  try {
    // Get overdue invoices (past due date)
    const overdueInvoices = await db.execute(
      sql`SELECT 
        i.id, i.organizationId, i.invoiceNumber, i.amount, i.dueDate, i.invoiceDate,
        o.organizationName, o.email,
        DATEDIFF(NOW(), i.dueDate) as daysOverdue
      FROM invoices i
      JOIN organizations o ON i.organizationId = o.id
      WHERE i.status = 'pending' 
        AND i.dueDate < NOW()
        AND (i.lastReminderSent IS NULL OR DATEDIFF(NOW(), i.lastReminderSent) >= 3)`
    );

    const overdue = (overdueInvoices as any).records || [];

    for (const invoice of overdue) {
      try {
        const daysOverdue = invoice.daysOverdue || 0;

        // Escalate based on days overdue
        let triggerType = "payment_reminder_overdue";
        let actionType = "email_reminder";

        if (daysOverdue > 14) {
          triggerType = "payment_critical_overdue";
          actionType = "email_critical_overdue";
        } else if (daysOverdue > 7) {
          triggerType = "payment_escalation";
          actionType = "email_escalation";
        }

        await createPaymentTrigger(
          invoice.organizationId,
          triggerType,
          actionType,
          {
            invoiceNumber: invoice.invoiceNumber,
            amount: invoice.amount,
            organizationName: invoice.organizationName,
            daysOverdue,
          },
          invoice.id
        );

        // Update last reminder sent
        await db.execute(
          sql`UPDATE invoices SET lastReminderSent = NOW() WHERE id = ${invoice.id}`
        );

        processedCount++;
        console.log(
          `📧 ${triggerType} scheduled for invoice ${invoice.invoiceNumber} (${daysOverdue}d overdue)`
        );

      } catch (itemError: any) {
        errors.push(`Failed to process reminder for ${invoice.invoiceNumber}: ${itemError.message}`);
      }
    }

    // Get invoices due soon (within 7 days)
    const upcomingDue = await db.execute(
      sql`SELECT 
        i.id, i.organizationId, i.invoiceNumber, i.amount, i.dueDate,
        o.organizationName, o.email,
        DATEDIFF(i.dueDate, NOW()) as daysToDue
      FROM invoices i
      JOIN organizations o ON i.organizationId = o.id
      WHERE i.status = 'pending'
        AND i.dueDate > NOW()
        AND DATEDIFF(i.dueDate, NOW()) <= 7
        AND DATEDIFF(i.dueDate, NOW()) > 0
        AND (i.lastReminderSent IS NULL OR DATEDIFF(NOW(), i.lastReminderSent) >= 1)`
    );

    const upcoming = (upcomingDue as any).records || [];

    for (const invoice of upcoming) {
      try {
        const daysToDue = invoice.daysToDue || 0;

        // Only send if in specific windows (2 days, 1 day)
        if (daysToDue <= 2) {
          await createPaymentTrigger(
            invoice.organizationId,
            "payment_reminder_upcoming",
            "email_reminder",
            {
              invoiceNumber: invoice.invoiceNumber,
              amount: invoice.amount,
              organizationName: invoice.organizationName,
              daysToDue,
            },
            invoice.id
          );

          await db.execute(
            sql`UPDATE invoices SET lastReminderSent = NOW() WHERE id = ${invoice.id}`
          );

          processedCount++;
          console.log(
            `📧 Upcoming due reminder scheduled for invoice ${invoice.invoiceNumber} (${daysToDue}d away)`
          );
        }

      } catch (itemError: any) {
        errors.push(
          `Failed to process upcoming reminder for ${invoice.invoiceNumber}: ${itemError.message}`
        );
      }
    }

    return {
      jobName: "payment_reminders",
      timestamp: new Date(),
      success: true,
      itemsProcessed: processedCount,
      message: `Processed ${processedCount} payment reminders`,
      errors,
    };

  } catch (error: any) {
    errors.push(error.message);
    return {
      jobName: "payment_reminders",
      timestamp: new Date(),
      success: false,
      itemsProcessed: 0,
      message: "Error processing payment reminders",
      errors,
    };
  }
}

/**
 * Payment Retry Job (runs every 6 hours)
 * Processes failed payments scheduled for retry via payment_triggers table
 */
export async function handlePaymentRetries(): Promise<BillingJobResult> {
  const db = await getDb();
  if (!db) {
    return {
      jobName: "payment_retries",
      timestamp: new Date(),
      success: false,
      itemsProcessed: 0,
      message: "Database unavailable",
      errors: ["DB connection failed"],
    };
  }

  const errors: string[] = [];
  let processedCount = 0;

  try {
    // Get all pending payment triggers due for execution
    const dueRetries = await db.execute(
      sql`SELECT 
        pt.id, pt.organizationId, pt.invoiceId, pt.triggerType, 
        pt.actionType, pt.retryCount, pt.metadata,
        i.invoiceNumber, i.amount, o.organizationName
      FROM paymentTriggers pt
      LEFT JOIN invoices i ON pt.invoiceId = i.id
      LEFT JOIN organizations o ON pt.organizationId = o.id
      WHERE pt.status = 'pending'
        AND pt.triggerDate <= NOW()
        AND pt.retryCount <= 3`
    );

    const retries = (dueRetries as any).records || [];

    for (const trigger of retries) {
      try {
        // Execute based on action type
        switch (trigger.actionType) {
          case "email_reminder":
          case "email_critical_overdue":
          case "email_escalation":
            // Trigger email job
            await createPaymentTrigger(
              trigger.organizationId,
              trigger.triggerType,
              trigger.actionType,
              JSON.parse(trigger.metadata || "{}")
            );
            break;

          case "send_invoice":
            // Trigger invoice send
            console.log(`📄 Resending invoice ${trigger.invoiceNumber}`);
            break;

          default:
            console.log(`⚠️ Unknown action type: ${trigger.actionType}`);
        }

        // Mark as triggered
        await db.execute(
          sql`UPDATE paymentTriggers 
              SET status = 'triggered',
                  lastRetryAt = NOW(),
                  retryCount = retryCount + 1
              WHERE id = ${trigger.id}`
        );

        processedCount++;
        console.log(`✅ Payment trigger executed: ${trigger.triggerType} for ${trigger.organizationName}`);

      } catch (itemError: any) {
        errors.push(`Failed to process trigger ${trigger.id}: ${itemError.message}`);

        // Increment retry count and reschedule if under limit
        const currentRetries = trigger.retryCount || 0;
        if (currentRetries < 3) {
          const nextRetry = new Date();
          nextRetry.setHours(nextRetry.getHours() + 6); // Retry in 6 hours

          await db.execute(
            sql`UPDATE paymentTriggers 
                SET retryCount = retryCount + 1,
                    triggerDate = ${nextRetry}
                WHERE id = ${trigger.id}`
          );
        } else {
          // Max retries exceeded - mark as failed
          await db.execute(
            sql`UPDATE paymentTriggers SET status = 'failed' WHERE id = ${trigger.id}`
          );
        }
      }
    }

    return {
      jobName: "payment_retries",
      timestamp: new Date(),
      success: true,
      itemsProcessed: processedCount,
      message: `Processed ${processedCount} payment retries`,
      errors,
    };

  } catch (error: any) {
    errors.push(error.message);
    return {
      jobName: "payment_retries",
      timestamp: new Date(),
      success: false,
      itemsProcessed: 0,
      message: "Error processing payment retries",
      errors,
    };
  }
}

/**
 * Helper: Create payment trigger
 */
async function createPaymentTrigger(
  organizationId: string,
  triggerType: string,
  actionType: string,
  metadata: any,
  invoiceId?: string
) {
  const db = await getDb();
  if (!db) return;

  const triggerDate = new Date();
  triggerDate.setHours(triggerDate.getHours() + 1); // Execute in 1 hour

  try {
    await db.insert(paymentTriggers).values({
      organizationId,
      invoiceId: invoiceId || undefined,
      triggerType: triggerType as any,
      triggerDate,
      status: "pending",
      actionType: actionType as any,
      retryCount: 0,
      metadata: JSON.stringify(metadata),
    });
  } catch (error: any) {
    console.error(`Error creating payment trigger: ${error.message}`);
  }
}

/**
 * Helper: Create audit log
 */
async function createAuditLog(
  organizationId: string,
  action: string,
  entityType: string,
  entityId: string,
  details: string
) {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(auditLogs).values({
      organizationId,
      userId: "billing-job",
      action,
      entityType,
      entityId,
      severity: "info",
      ipAddress: "internal-job",
      userAgent: "Billing Automation",
      timestamp: new Date(),
      details: JSON.stringify({ message: details }),
    });
  } catch (error: any) {
    console.error(`Error creating audit log: ${error.message}`);
  }
}

/**
 * Initialize and start all cron jobs
 */
export function initializeBillingJobs() {
  console.log("🚀 Initializing billing automation jobs...");

  // Trial expiration check (daily at 2 AM UTC)
  cron.schedule("0 2 * * *", async () => {
    console.log("\n⏰ [CRON] Running trial expiration job...");
    const result = await handleTrialExpiration();
    console.log(
      `${result.success ? "✅" : "❌"} ${result.jobName}: ${result.message}\n`
    );
  });

  // Subscription renewal (daily at 3 AM UTC)
  cron.schedule("0 3 * * *", async () => {
    console.log("\n⏰ [CRON] Running subscription renewal job...");
    const result = await handleSubscriptionRenewal();
    console.log(
      `${result.success ? "✅" : "❌"} ${result.jobName}: ${result.message}\n`
    );
  });

  // Payment reminders (daily at 4 AM UTC)
  cron.schedule("0 4 * * *", async () => {
    console.log("\n⏰ [CRON] Running payment reminders job...");
    const result = await handlePaymentReminders();
    console.log(
      `${result.success ? "✅" : "❌"} ${result.jobName}: ${result.message}\n`
    );
  });

  // Payment retry processing (every 6 hours)
  cron.schedule("0 */6 * * *", async () => {
    console.log("\n⏰ [CRON] Running payment retries job...");
    const result = await handlePaymentRetries();
    console.log(
      `${result.success ? "✅" : "❌"} ${result.jobName}: ${result.message}\n`
    );
  });

  console.log("✅ All billing jobs initialized successfully");
}

export default {
  initializeBillingJobs,
  handleTrialExpiration,
  handleSubscriptionRenewal,
  handlePaymentReminders,
  handlePaymentRetries,
};
