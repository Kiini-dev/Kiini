/**
 * Dunning Event Processor
 * Processes dunning notices, sends notifications, and manages service suspension/termination
 * Integrates with email queue, database, and subscription management
 */

import { v4 as uuidv4 } from "uuid";
import { getDb } from "../db";
import {
  getDueNotices,
  getSuspensionStatus,
  getDaysDueDate,
} from "./dunningScheduleService";
import { billingInvoices, subscriptions, dunningEvents, organizations, settings } from "../../drizzle/schema";
import { eq, and, inArray, lte } from "drizzle-orm";
import { queueEmail } from "./emailService";
import { renderNotificationTemplate } from "./notificationRenderer";
import { resumeSubscription, suspendSubscription, terminateSubscription } from "./subscriptionServiceManagement";

export interface DunningProcessorOptions {
  invoiceId?: string;
  subscriptionId?: string;
  clientId?: string;
  organizationId: string;
  isMultiTenant?: boolean;
}

export interface DunningProcessResult {
  success: boolean;
  noticesSent: number;
  suspensionApplied: boolean;
  terminationApplied: boolean;
  events: Array<{
    eventType: string;
    status: "sent" | "pending" | "error";
    message: string;
  }>;
  errors: string[];
}

/**
 * Process dunning for a single invoice
 * Sends all due notices and manages service state
 */
export async function processDunningForInvoice(
  invoiceId: string,
  organizationId: string,
  options?: { isMultiTenant?: boolean; processNotifications?: boolean }
): Promise<DunningProcessResult> {
  const result: DunningProcessResult = {
    success: false,
    noticesSent: 0,
    suspensionApplied: false,
    terminationApplied: false,
    events: [],
    errors: [],
  };

  try {
    const db = await getDb();
    if (!db) {
      result.errors.push("Database connection failed");
      return result;
    }

    // Fetch invoice details
    const invoice = await db
      .select()
      .from(billingInvoices)
      .where(eq(billingInvoices.id, invoiceId))
      .limit(1);

    if (!invoice.length) {
      result.errors.push(`Invoice ${invoiceId} not found`);
      return result;
    }

    const inv = invoice[0];
    if (inv.status === "paid") {
      if (inv.subscriptionId) {
        await resumeSubscription(inv.subscriptionId, organizationId);
      }
      result.success = true;
      return result;
    }
    const dueDate = new Date(inv.dueDate);
    const isMultiTenant = options?.isMultiTenant || false;
    const policyRows = await db.select().from(settings).where(eq(settings.category, "dunning_policy"));
    const policyEnabled = policyRows.find((row) => row.key === "enabled")?.value;
    if (policyEnabled === "false" || policyEnabled === "0") {
      result.success = true;
      return result;
    }
    const policy: Record<string, number> = { standardSuspendAfterDays: 5, multitenantSuspendAfterDays: 3, terminateAfterDays: 21 };
    for (const row of policyRows) if (row.key in policy && row.value) policy[row.key] = Number(row.value);
    const suspensionDays = isMultiTenant ? policy.multitenantSuspendAfterDays : policy.standardSuspendAfterDays;

    // Get previously sent notices
    const previousEvents = await db
      .select()
      .from(dunningEvents)
      .where(
        and(
          eq(dunningEvents.invoiceId, invoiceId)
        )
      );

    const sentLevels = previousEvents
      .map((e) => {
        // Extract level from eventType
        const match = e.eventType.match(/_(\d+)d/);
        return match ? parseInt(match[1]) : null;
      })
      .filter((l): l is number => l !== null);

    // Get all due notices
    const dueNotices = getDueNotices(dueDate, isMultiTenant, sentLevels);

    // Process each due notice
    for (const notice of dueNotices) {
      if (options?.processNotifications !== false) {
        const emailSent = await sendDunningNotification(inv, notice, organizationId);
        if (emailSent) {
          result.noticesSent++;
          result.events.push({
            eventType: notice.eventType,
            status: "sent",
            message: `${notice.label} notification sent`,
          });
        } else {
          result.events.push({
            eventType: notice.eventType,
            status: "pending",
            message: `${notice.label} notification queued`,
          });
        }
      }

      // Record dunning event
      const eventId = uuidv4();
      await db.insert(dunningEvents).values({
        id: eventId,
        subscriptionId: inv.subscriptionId,
        invoiceId: invoiceId,
        organizationId,
        eventType: notice.eventType as any,
        details: {
          daysOverdue: getDaysDueDate(dueDate),
          invoiceAmount: inv.totalAmount,
          noticeLevel: notice.level,
        },
        triggeredBy: "system",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any);
    }

    // Handle service suspension
    if (inv.subscriptionId) {
      const shouldSuspend = getDaysDueDate(dueDate) >= suspensionDays;
      if (shouldSuspend) {
        const subscription = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.id, inv.subscriptionId))
          .limit(1);

        if (subscription.length && subscription[0].status !== "suspended") {
          // Update subscription status to suspended
          const suspension = await suspendSubscription(inv.subscriptionId, organizationId, "payment_overdue", {
            invoiceId,
            daysOverdue: getDaysDueDate(dueDate),
          });
          result.suspensionApplied = suspension.success;
          result.events.push({
            eventType: "subscription_suspended",
            status: "sent",
            message: "Subscription suspended due to overdue payment",
          });

        }
      }

      // Handle service termination
      const shouldTerminate = getDaysDueDate(dueDate) >= policy.terminateAfterDays;
      if (shouldTerminate) {
        const subscription = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.id, inv.subscriptionId))
          .limit(1);

        if (subscription.length && subscription[0].status !== "cancelled") {
          // Update subscription status to cancelled
          const termination = await terminateSubscription(inv.subscriptionId, organizationId, "payment_overdue_21_days");
          result.terminationApplied = termination.success;
          result.events.push({
            eventType: "subscription_cancelled",
            status: "sent",
            message: "Subscription cancelled after 21 days overdue",
          });

        }
      }
    }

    result.success = true;
    return result;
  } catch (error) {
    console.error("[Dunning Processor] Error processing invoice:", error);
    result.errors.push(error instanceof Error ? error.message : "Unknown error");
    return result;
  }
}

/**
 * Process dunning for a subscription (handles all related invoices)
 */
export async function processDunningForSubscription(
  subscriptionId: string,
  organizationId: string,
  options?: { isMultiTenant?: boolean }
): Promise<DunningProcessResult> {
  const result: DunningProcessResult = {
    success: false,
    noticesSent: 0,
    suspensionApplied: false,
    terminationApplied: false,
    events: [],
    errors: [],
  };

  try {
    const db = await getDb();
    if (!db) {
      result.errors.push("Database connection failed");
      return result;
    }

    // Get all invoices for this subscription
    const invoices = await db
      .select()
      .from(billingInvoices)
      .where(
        and(
          eq(billingInvoices.subscriptionId, subscriptionId)
        )
      );

    // Process each invoice
    for (const invoice of invoices) {
      const invoiceResult = await processDunningForInvoice(invoice.id, organizationId, options);
      
      result.noticesSent += invoiceResult.noticesSent;
      if (invoiceResult.suspensionApplied) result.suspensionApplied = true;
      if (invoiceResult.terminationApplied) result.terminationApplied = true;
      result.events.push(...invoiceResult.events);
      result.errors.push(...invoiceResult.errors);
    }

    result.success = result.errors.length === 0;
    return result;
  } catch (error) {
    console.error("[Dunning Processor] Error processing subscription:", error);
    result.errors.push(error instanceof Error ? error.message : "Unknown error");
    return result;
  }
}

/**
 * Process dunning for all overdue invoices in an organization
 */
export async function processDunningForOrganization(
  organizationId: string,
  options?: { isMultiTenant?: boolean; daysOverdue?: number }
): Promise<{
  success: boolean;
  processedInvoices: number;
  totalNoticesSent: number;
  totalSuspensions: number;
  totalTerminations: number;
  errors: string[];
}> {
  const result = {
    success: false,
    processedInvoices: 0,
    totalNoticesSent: 0,
    totalSuspensions: 0,
    totalTerminations: 0,
    errors: [] as string[],
  };

  try {
    const db = await getDb();
    if (!db) {
      result.errors.push("Database connection failed");
      return result;
    }

    const organizationSubscriptions = await db.select({ id: subscriptions.id })
      .from(subscriptions)
      .where(eq(subscriptions.organizationId, organizationId));
    const subscriptionIds = organizationSubscriptions.map((subscription) => subscription.id);
    if (!subscriptionIds.length) {
      result.success = true;
      return result;
    }

    // Include advance notices through 20 days before the due date as well as overdue invoices.
    const now = new Date();
    const noticeWindowEnd = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000);
    const invoices = await db
      .select()
      .from(billingInvoices)
      .where(
        and(
          inArray(billingInvoices.subscriptionId, subscriptionIds),
          inArray(billingInvoices.status, ["pending", "sent", "viewed"] as any),
          lte(billingInvoices.dueDate, noticeWindowEnd.toISOString())
        )
      );

    // Process each invoice
    for (const invoice of invoices) {
      const invoiceResult = await processDunningForInvoice(invoice.id, organizationId, options);
      
      if (invoiceResult.success) {
        result.processedInvoices++;
        result.totalNoticesSent += invoiceResult.noticesSent;
        if (invoiceResult.suspensionApplied) result.totalSuspensions++;
        if (invoiceResult.terminationApplied) result.totalTerminations++;
      } else {
        result.errors.push(`Failed to process invoice ${invoice.id}: ${invoiceResult.errors.join(", ")}`);
      }
    }

    result.success = result.errors.length === 0;
    return result;
  } catch (error) {
    console.error("[Dunning Processor] Error processing organization:", error);
    result.errors.push(error instanceof Error ? error.message : "Unknown error");
    return result;
  }
}

/**
 * Send dunning notification email
 * Integrates with email queue system
 */
async function sendDunningNotification(
  invoice: any,
  notice: any,
  organizationId: string
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;
    const daysOverdue = getDaysDueDate(new Date(invoice.dueDate));
    const subscription = await db.select().from(subscriptions).where(eq(subscriptions.id, invoice.subscriptionId)).limit(1);
    const organization = subscription[0]?.organizationId
      ? await db.select().from(organizations).where(eq(organizations.id, subscription[0].organizationId)).limit(1)
      : [];
    const recipientEmail = organization[0]?.billingEmail || organization[0]?.contactEmail;
    if (!recipientEmail) return false;
    const subscriptionStatus = subscription[0]?.status;
    const invoiceTag = subscriptionStatus === "cancelled" || subscriptionStatus === "expired"
      ? "Terminated"
      : subscriptionStatus === "suspended"
        ? "Suspended"
        : invoice.status === "paid"
          ? "Paid"
          : daysOverdue > 0 ? "Overdue" : "Due";

    const rendered = await renderNotificationTemplate(notice.emailTemplate, {
      organizationId,
      organization: organization[0] || {},
      invoice: invoice,
      clientName: invoice.clientName || organization[0]?.name || "Valued Client",
      invoiceNumber: invoice.invoiceNumber,
      invoiceStatus: invoice.status,
      invoiceTag,
      amount: invoice.totalAmount,
      dueDate: invoice.dueDate,
      daysOverdue: Math.max(0, daysOverdue),
      invoiceUrl: `${process.env.APP_URL || ""}/invoices/${invoice.id}`,
    }, {
      subject: `Payment Reminder: Invoice ${invoice.invoiceNumber}`,
      html: `<p>Invoice <strong>${invoice.invoiceNumber}</strong> requires your attention.</p>`,
    });
    await queueEmail({
      toEmail: recipientEmail,
      subject: rendered.subject,
      htmlContent: rendered.html,
      plainTextContent: rendered.text,
      templateId: notice.emailTemplate,
      templateVariables: { invoiceNumber: invoice.invoiceNumber, organizationId, invoiceTag },
      relatedEntityType: "billing_invoice",
      relatedEntityId: invoice.id,
    });

    console.log(`[Dunning] Notification queued for invoice ${invoice.id}: ${notice.label}`);
    return true;
  } catch (error) {
    console.error("[Dunning] Error sending notification:", error);
    return false;
  }
}

/**
 * Get dunning status for a subscription
 */
export async function getDunningStatus(
  subscriptionId: string,
  organizationId: string
): Promise<{
  subscriptionId: string;
  status: string;
  overdueDays: number;
  isSuspended: boolean;
  isTerminated: boolean;
  nextNoticeDue: string | null;
  events: any[];
}> {
  try {
    const db = await getDb();
    if (!db) {
      return {
        subscriptionId,
        status: "error",
        overdueDays: 0,
        isSuspended: false,
        isTerminated: false,
        nextNoticeDue: null,
        events: [],
      };
    }

    // Get subscription
    const sub = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, subscriptionId))
      .limit(1);

    if (!sub.length) {
      return {
        subscriptionId,
        status: "not_found",
        overdueDays: 0,
        isSuspended: false,
        isTerminated: false,
        nextNoticeDue: null,
        events: [],
      };
    }

    // Get latest overdue invoice
    const invoices = await db
      .select()
      .from(billingInvoices)
      .where(eq(billingInvoices.subscriptionId, subscriptionId))
      .orderBy((t) => t.dueDate);

    const overdueInvoice = invoices.find(
      (inv) => new Date(inv.dueDate) < new Date()
    );

    if (!overdueInvoice) {
      return {
        subscriptionId,
        status: "active",
        overdueDays: 0,
        isSuspended: false,
        isTerminated: false,
        nextNoticeDue: null,
        events: [],
      };
    }

    // Get dunning events
    const events = await db
      .select()
      .from(dunningEvents)
      .where(eq(dunningEvents.subscriptionId, subscriptionId));

    const daysOverdue = getDaysDueDate(new Date(overdueInvoice.dueDate));
    const suspensionStatus = getSuspensionStatus(new Date(overdueInvoice.dueDate));

    return {
      subscriptionId,
      status: sub[0].status,
      overdueDays: Math.max(0, daysOverdue),
      isSuspended: suspensionStatus.isSuspended,
      isTerminated: sub[0].status === "cancelled",
      nextNoticeDue: suspensionStatus.daysUntilTermination > 0
        ? new Date(Date.now() + suspensionStatus.daysUntilTermination * 24 * 60 * 60 * 1000).toISOString()
        : null,
      events: events.map((e) => ({
        eventType: e.eventType,
        createdAt: e.createdAt,
      })),
    };
  } catch (error) {
    console.error("[Dunning] Error getting status:", error);
    return {
      subscriptionId,
      status: "error",
      overdueDays: 0,
      isSuspended: false,
      isTerminated: false,
      nextNoticeDue: null,
      events: [],
    };
  }
}
