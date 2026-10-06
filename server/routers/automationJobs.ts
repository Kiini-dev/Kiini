/**
 * Automation Jobs Router
 * 
 * Manages scheduled and manual triggers for automation jobs like:
 * - Recurring invoice generation
 * - Payment reminders
 * - Overdue notifications
 * - Other automated workflows
 */

import { router, publicProcedure, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { generateDueRecurringInvoices } from "../jobs/recurringInvoicesJob";
import { getDb } from "../db";

const readProcedure = createFeatureRestrictedProcedure("tools:automation");

export const automationJobsRouter = router({
  /**
   * Generate due recurring invoices (can be triggered manually or by cron)
   */
  generateRecurringInvoices: publicProcedure
    .input(z.object({
      apiKey: z.string().optional(), // For webhook/cron trigger
    }).optional())
    .mutation(async ({ input, ctx }) => {
      // Verify API key if provided (for external cron triggers)
      if (input?.apiKey) {
        const expectedKey = process.env.CRON_API_KEY;
        if (!expectedKey || input.apiKey !== expectedKey) {
          return {
            success: false,
            message: "Unauthorized",
            invoicesGenerated: 0,
            invoiceIds: [],
            errors: ["Invalid API key"],
          };
        }
      } else if (!ctx.user || !["super_admin", "admin"].includes(ctx.user.role)) {
        // Require admin role for authenticated calls
        return {
          success: false,
          message: "Unauthorized",
          invoicesGenerated: 0,
          invoiceIds: [],
          errors: ["Admin access required"],
        };
      }

      try {
        const result = await generateDueRecurringInvoices();
        return result;
      } catch (error) {
        return {
          success: false,
          message: "Failed to generate recurring invoices",
          invoicesGenerated: 0,
          invoiceIds: [],
          errors: [error instanceof Error ? error.message : String(error)],
        };
      }
    }),

  /**
   * Get automation job status and last run time
   */
  getJobStatus: readProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) {
        return {
          recurringInvoices: {
            lastRun: null,
            nextScheduledRun: null,
            status: "unknown",
          },
        };
      }

      try {
        // Check for recent recurring invoice generations
        const { activityLog } = await import("../../drizzle/schema");
        const { eq, desc } = await import("drizzle-orm");

        const lastRun = await db.select()
          .from(activityLog)
          .where(eq(activityLog.action, "recurring_invoice_generated"))
          .orderBy(desc(activityLog.createdAt))
          .limit(1);

        const lastRunTime = lastRun.length > 0 ? lastRun[0].createdAt : null;

        // Calculate next scheduled run (assuming daily at 2 AM)
        const now = new Date();
        const nextRun = new Date(now);
        nextRun.setDate(nextRun.getDate() + 1);
        nextRun.setHours(2, 0, 0, 0);

        return {
          recurringInvoices: {
            lastRun: lastRunTime,
            nextScheduledRun: nextRun.toISOString(),
            status: lastRunTime ? "active" : "pending",
          },
        };
      } catch (error) {
        console.error("Error getting job status:", error);
        return {
          recurringInvoices: {
            lastRun: null,
            nextScheduledRun: null,
            status: "error",
          },
        };
      }
    }),

  /**
   * Send payment reminders for overdue invoices
   */
  sendPaymentReminders: readProcedure
    .input(z.object({
      daysOverdue: z.number().default(7).optional(),
    }).optional())
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return {
          success: false,
          message: "Database not available",
          remindersSent: 0,
        };
      }

      try {
        const { invoices, clients, notifications } = await import("../../drizzle/schema");
        const { eq, ne, lt, and } = await import("drizzle-orm");
        const { v4: uuidv4 } = await import("uuid");

        const daysOverdue = input?.daysOverdue || 7;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOverdue);
        const cutoffStr = cutoffDate.toISOString().replace('T', ' ').substring(0, 19);

        // Get overdue invoices
        const overdueInvoices = await db.select()
          .from(invoices)
          .innerJoin(clients, eq(invoices.clientId, clients.id))
          .where(
            and(
              lt(invoices.dueDate, cutoffStr),
              ne(invoices.status, 'paid'),
              ne(invoices.status, 'cancelled')
            )
          );

        let remindersSent = 0;

        for (const inv of overdueInvoices) {
          try {
            const paid = inv.invoices.paidAmount || 0;
            const total = inv.invoices.total || 0;
            const remaining = total - paid;

            if (remaining <= 0) continue;

            // Create reminder notification
            const notifId = uuidv4();
            const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

            await db.insert(notifications).values({
              id: notifId,
              userId: inv.invoices.createdBy || "system",
              title: `Payment Reminder: Invoice ${inv.invoices.invoiceNumber} Overdue`,
              message: `Invoice ${inv.invoices.invoiceNumber} for ${inv.clients.companyName} is overdue. Remaining balance: KES ${remaining}`,
              type: "warning" as any,
              category: "invoice_overdue",
              entityType: "invoice",
              entityId: inv.invoices.id,
              actionUrl: `/invoices/${inv.invoices.id}`,
              isRead: 0,
              priority: "high",
              createdAt: now,
            });

            remindersSent++;
          } catch (err) {
            console.warn("Error sending reminder for invoice:", err);
            continue;
          }
        }

        return {
          success: true,
          message: `Sent ${remindersSent} payment reminder(s)`,
          remindersSent,
        };
      } catch (error) {
        console.error("Error in sendPaymentReminders:", error);
        return {
          success: false,
          message: "Failed to send payment reminders",
          remindersSent: 0,
        };
      }
    }),
});
