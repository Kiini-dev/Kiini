/**
 * Organization Subscription Lifecycle Management
 * Handles automated renewal, overdue detection, and email notifications
 */

import cron from "node-cron";
import { getDb } from "../db";
import { subscriptions, billingInvoices, payments, organizations } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { sendSystemEmail } from "../services/systemEmailService";
import { dispatchSystemAlert } from "../services/systemReportingService";
import { createSaaSIncomeInvoice } from "../services/saasIncomeLedger";
import { toMajorCurrencyAmount } from "../../shared/currency";

const logger = console;

function emailCompany(org: any) {
  return {
    name: org?.name,
    email: org?.billingEmail || org?.contactEmail,
    address: org?.address,
    website: org?.website,
    logo: org?.logoUrl,
    currency: org?.currency,
  };
}

function organizationBillingUrl(org: any) {
  const baseUrl = (process.env.APP_URL || process.env.PUBLIC_APP_URL || "https://kiini.africa").replace(/\/$/, "");
  return `${baseUrl}${org?.slug ? `/org/${encodeURIComponent(org.slug)}/billing` : "/billing"}`;
}

/**
 * Daily task: Check subscriptions for renewal dates and auto-pay
 * Runs at 2 AM UTC every day
 */
async function processSubscriptionRenewals() {
  try {
    logger.log("[OrgBilling] Starting subscription renewal check...");
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    // Get all active subscriptions with autoRenew enabled
    const activeSubscriptions = await database
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.autoRenew, 1),
          eq(subscriptions.status, "active")
        )
      );

    const now = new Date();
    let processedCount = 0;

    for (const sub of activeSubscriptions) {
      const renewalDate = new Date(sub.renewalDate!);
      
      // Only process if renewal date has passed or is within 24 hours
      const hoursUntilRenewal = (renewalDate.getTime() - now.getTime()) / (60 * 60 * 1000);
      if (hoursUntilRenewal > 24) continue;

      // Get organization details
      const org = await database
        .select()
        .from(organizations)
        .where(eq(organizations.id, sub.organizationId || ""))
        .limit(1);

      if (!org.length) {
        logger.warn(`[OrgBilling] Organization not found for subscription ${sub.id}`);
        continue;
      }

      try {
        const renewalDay = renewalDate.toISOString().slice(0, 10);
        const latestInvoice = await database
          .select({ billingPeriodEnd: billingInvoices.billingPeriodEnd })
          .from(billingInvoices)
          .where(eq(billingInvoices.subscriptionId, sub.id))
          .orderBy(desc(billingInvoices.billingPeriodEnd))
          .limit(1);
        const latestPeriodEnd = latestInvoice[0]?.billingPeriodEnd
          ? new Date(latestInvoice[0].billingPeriodEnd).toISOString().slice(0, 10)
          : null;

        if (latestPeriodEnd && latestPeriodEnd > renewalDay) {
          await database.update(subscriptions)
            .set({ renewalDate: `${latestPeriodEnd}T${renewalDate.toISOString().slice(11, 19)}Z` })
            .where(eq(subscriptions.id, sub.id));
          logger.log(`[OrgBilling] Existing invoice already covers ${sub.id} through ${latestPeriodEnd}`);
          continue;
        }

        const periodStart = latestPeriodEnd || new Date(sub.startDate).toISOString().slice(0, 10);
        if (periodStart >= renewalDay) {
          logger.warn(`[OrgBilling] Invalid billing period for subscription ${sub.id}: ${periodStart} to ${renewalDay}`);
          continue;
        }

        const ratedInvoice = await createSaaSIncomeInvoice({
          subscription: {
            id: sub.id,
            organizationId: sub.organizationId!,
            planId: sub.planId,
            billingCycle: sub.billingCycle,
            renewalDate: sub.renewalDate!,
          },
          organization: org[0],
          periodStart,
          periodEnd: renewalDay,
        });

        const newRenewalDate = new Date(renewalDate);
        if (sub.billingCycle === "monthly") newRenewalDate.setMonth(newRenewalDate.getMonth() + 1);
        else newRenewalDate.setFullYear(newRenewalDate.getFullYear() + 1);
        await database.update(subscriptions)
          .set({ renewalDate: newRenewalDate.toISOString() })
          .where(eq(subscriptions.id, sub.id));

        if (ratedInvoice.created) {
          const invoiceAmount = toMajorCurrencyAmount(ratedInvoice.amountCents, "minor").toFixed(2);
          if (org[0].billingEmail) {
            await sendSystemEmail("admin/admin_general_notice", {
              recipientEmail: org[0].billingEmail,
              recipientName: org[0].name,
              recipient_first_name: org[0].name,
              company: emailCompany(org[0]),
              app_name: "Kiini",
              notice_title: `Invoice ${ratedInvoice.invoiceNumber} is ready`,
              notice_category: "Subscription billing",
              notice_message: "Your subscription renewal invoice has been generated.",
              notice_details: `Billing period: ${periodStart} - ${renewalDay}. Amount due: ${org[0].currency || "KES"} ${invoiceAmount}. Due date: ${renewalDay}.`,
              action_label: "Open billing",
              action_url: organizationBillingUrl(org[0]),
              sent_at: now.toLocaleString(),
            }, {
              subject: `Invoice ${ratedInvoice.invoiceNumber} is ready`,
              html: `<p>Your subscription renewal invoice ${ratedInvoice.invoiceNumber} has been generated.</p>`,
              text: `Your subscription renewal invoice ${ratedInvoice.invoiceNumber} has been generated.`,
            });
          }
          processedCount++;
          logger.log(`[OrgBilling] Created rated renewal invoice for org ${org[0].id}`);
        } else if (ratedInvoice.noCharge) {
          logger.log(`[OrgBilling] No charge due for subscription ${sub.id}; usage and seats were recorded as zero-rated.`);
        }
      } catch (error) {
        logger.error(`[OrgBilling] Failed to rate subscription ${sub.id}:`, error);
      }
    }

    logger.log(`[OrgBilling] Processed ${processedCount} subscription renewals`);
    return { success: true, count: processedCount };
  } catch (error) {
    logger.error("[OrgBilling] Subscription renewal check failed:", error);
  }
}

/**
 * Daily task: Send payment reminders and overdue warnings
 * Runs at 3 AM UTC every day
 */
async function sendBillingReminders() {
  try {
    logger.log("[OrgBilling] Starting billing reminders check...");
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    const activeSubscriptions = await database
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.status, "active"));

    const now = new Date();
    let remindersSent = 0;

    for (const sub of activeSubscriptions) {
      const renewalDate = new Date(sub.renewalDate!);
      const daysUntilDue = Math.ceil((renewalDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

      const org = await database
        .select()
        .from(organizations)
        .where(eq(organizations.id, sub.organizationId || ""))
        .limit(1);

      if (!org.length || !org[0].billingEmail) continue;

      let shouldSendReminder = false;
      let reminderType = "";
      let message = "";

      // 7 days before due
      if (daysUntilDue === 7) {
        shouldSendReminder = true;
        reminderType = "payment_due_7d";
        message = `Your subscription payment is due in 7 days (${renewalDate.toLocaleDateString()}). Please ensure your payment method is up to date.`;
      }
      // 3 days before due
      else if (daysUntilDue === 3) {
        shouldSendReminder = true;
        reminderType = "payment_due_3d";
        message = `Your subscription payment is due in 3 days (${renewalDate.toLocaleDateString()}). Please update your payment method if needed.`;
      }
      // 1 day before due
      else if (daysUntilDue === 1) {
        shouldSendReminder = true;
        reminderType = "payment_due_1d";
        message = `Your subscription payment is due tomorrow (${renewalDate.toLocaleDateString()}). Your service will be suspended if payment is not made.`;
      }
      // 1 day overdue
      else if (daysUntilDue === -1) {
        shouldSendReminder = true;
        reminderType = "payment_overdue_1d";
        message = `Your subscription payment is now 1 day overdue. Please make payment immediately to avoid service suspension.`;
      }
      // 3 days overdue
      else if (daysUntilDue === -3) {
        shouldSendReminder = true;
        reminderType = "payment_overdue_3d";
        message = `Your subscription payment is 3 days overdue. Your account will be suspended in 24 hours if payment is not made.`;
      }

      if (shouldSendReminder) {
        await sendSystemEmail("admin/admin_subscription_expiry", {
          recipientEmail: org[0].billingEmail,
          recipientName: org[0].name,
          recipient_first_name: org[0].name,
          company: emailCompany(org[0]),
          app_name: "Kiini",
          tenant_name: org[0].name,
          plan_name: sub.planName || sub.planId || "Subscription",
          days_remaining: String(Math.max(0, daysUntilDue)),
          expiry_date: renewalDate.toLocaleDateString(),
          renewal_amount: String(sub.currentPrice || 0),
          currency: org[0].currency || "KES",
          subscription_url: organizationBillingUrl(org[0]),
        }, {
          subject: `Subscription payment reminder - ${org[0].name}`,
          html: `<p>${message}</p><a href="${organizationBillingUrl(org[0])}">Open billing</a>`,
          text: `${message} ${organizationBillingUrl(org[0])}`,
        });

        remindersSent++;
        logger.log(`[OrgBilling] Sent ${reminderType} reminder to org ${org[0].id}`);
      }
    }

    logger.log(`[OrgBilling] Sent ${remindersSent} billing reminders`);
    return { success: true, count: remindersSent };
  } catch (error) {
    logger.error("[OrgBilling] Billing reminders check failed:", error);
  }
}

/**
 * Daily task: Check and suspend overdue subscriptions
 * Runs at 4 AM UTC every day
 */
async function checkAndSuspendOverdue() {
  try {
    logger.log("[OrgBilling] Starting overdue subscription check...");
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    const allSubscriptions = await database.select().from(subscriptions);
    const now = new Date();
    let suspendedCount = 0;

    for (const sub of allSubscriptions) {
      // Skip already suspended/cancelled subscriptions
      if (sub.status === "suspended" || sub.status === "cancelled" || sub.isLocked) {
        continue;
      }

      const renewalDate = new Date(sub.renewalDate!);
      const gracePeriodEnd = new Date(renewalDate);
      gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 3); // 3 day grace period

      // Check if past grace period
      if (now > gracePeriodEnd) {
        await database
          .update(subscriptions)
          .set({
            status: "suspended",
            isLocked: 1,
            updatedAt: now,
          })
          .where(eq(subscriptions.id, sub.id));

        // Get org and send notification
        const org = await database
          .select()
          .from(organizations)
          .where(eq(organizations.id, sub.organizationId || ""))
          .limit(1);

        if (org.length && org[0].billingEmail) {
          const daysOverdue = Math.ceil((now.getTime() - gracePeriodEnd.getTime()) / (24 * 60 * 60 * 1000));
          await sendSystemEmail("user/account_suspended", {
            recipientEmail: org[0].billingEmail,
            recipientName: org[0].name,
            recipient_first_name: org[0].name,
            company: emailCompany(org[0]),
            app_name: "Kiini",
            suspension_date: now.toLocaleDateString(),
            suspension_reason: `Subscription payment is ${daysOverdue} days past the grace period.`,
            restoration_steps: `Open ${organizationBillingUrl(org[0])}, update your payment method, and pay the outstanding invoice to restore service. Contact billing support if you need help.`,
          }, {
            subject: `Account suspended - overdue payment`,
            html: `<p>Your subscription has been suspended due to non-payment.</p><a href="${organizationBillingUrl(org[0])}">Open billing</a>`,
            text: `Your subscription has been suspended due to non-payment. ${organizationBillingUrl(org[0])}`,
          });
        }

        suspendedCount++;
        await dispatchSystemAlert({
          title: "Organization Subscription Suspended",
          message: `Subscription ${sub.id} for organization ${sub.organizationId || "unknown"} was suspended after the grace period expired.`,
          organizationId: sub.organizationId,
          category: "subscription_suspended",
          priority: "critical",
        });
        logger.log(`[OrgBilling] Suspended subscription ${sub.id} (org: ${sub.organizationId})`);
      }
    }

    logger.log(`[OrgBilling] Suspended ${suspendedCount} overdue subscriptions`);
    return { success: true, count: suspendedCount };
  } catch (error) {
    logger.error("[OrgBilling] Overdue subscription check failed:", error);
  }
}

/**
 * Initialize all billing-related cron jobs
 */
export function initializeBillingCronJobs() {
  logger.log("[OrgBilling] Initializing billing cron jobs...");

  // Subscription renewal processing - 2 AM UTC daily
  cron.schedule("0 2 * * *", () => {
    processSubscriptionRenewals().catch((err) =>
      logger.error("[OrgBilling] Renewal processing error:", err)
    );
  });

  // Billing reminders - 3 AM UTC daily
  cron.schedule("0 3 * * *", () => {
    sendBillingReminders().catch((err) =>
      logger.error("[OrgBilling] Reminder sending error:", err)
    );
  });

  // Overdue suspension check - 4 AM UTC daily
  cron.schedule("0 4 * * *", () => {
    checkAndSuspendOverdue().catch((err) =>
      logger.error("[OrgBilling] Suspension check error:", err)
    );
  });

  logger.log("[OrgBilling] Billing cron jobs initialized successfully");
}

export { processSubscriptionRenewals, sendBillingReminders, checkAndSuspendOverdue };
