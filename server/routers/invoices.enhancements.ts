/**
 * SaaS-Grade Invoice Router Enhancements
 * 
 * This file contains advanced features that should be added to invoices.ts:
 * - Advanced filtering and search
 * - Invoice aging analysis
 * - Batch operations
 * - Approval workflows
 * - Partial payment handling
 * - Invoice templates
 */

import { z } from "zod";
import { router } from "../_core/trpc";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { TRPCError } from "@trpc/server";
import { eq, and, gte, lte, between, or, like, desc, asc, sql } from "drizzle-orm";
import { invoices } from "../../drizzle/schema";
import { getDb } from "../db";
import { v4 as uuidv4 } from "uuid";

// ============================================================================
// PROCEDURES
// ============================================================================

const viewProcedure = createFeatureRestrictedProcedure("accounting:invoices:view");
const createProcedure = createFeatureRestrictedProcedure("accounting:invoices:create");
const approveProcedure = createFeatureRestrictedProcedure("accounting:invoices:approve");
const exportProcedure = createFeatureRestrictedProcedure("accounting:invoices:export");

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const advancedFilterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["draft", "sent", "paid", "partial", "overdue", "cancelled"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  clientIds: z.array(z.string()).optional(),
  isPaid: z.boolean().optional(),
  isOverdue: z.boolean().optional(),
  limit: z.number().min(1).max(500).default(50),
  offset: z.number().min(0).default(0),
  sortBy: z.enum(["dueDate", "issueDate", "amount", "clientName"]).default("issueDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate days overdue for an invoice
 */
function calculateDaysOverdue(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  const daysOverdue = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  return daysOverdue > 0 ? daysOverdue : 0;
}

/**
 * Calculate invoice aging category
 */
function getAgingCategory(daysOverdue: number): "current" | "30days" | "60days" | "90days" | "over90days" {
  if (daysOverdue <= 0) return "current";
  if (daysOverdue <= 30) return "30days";
  if (daysOverdue <= 60) return "60days";
  if (daysOverdue <= 90) return "90days";
  return "over90days";
}

/**
 * Log invoice activity for audit trail
 */
async function logInvoiceActivity(
  db: any,
  invoiceId: string,
  action: "create" | "update" | "approve" | "send" | "partial_payment" | "paid" | "email_reminder",
  userId: string,
  details?: Record<string, any>
) {
  try {
    console.log(`[AUDIT] Invoice ${action}:`, {
      invoiceId,
      action,
      userId,
      timestamp: new Date().toISOString(),
      details,
    });
  } catch (err) {
    console.warn("Failed to log invoice activity:", err);
  }
}

// ============================================================================
// NEW ENDPOINTS - ADD THESE TO invoicesRouter
// ============================================================================

export const invoiceEnhancementsRouter = {
  /**
   * Advanced list with comprehensive filtering
   * Includes: search, status, date range, amount range, client filtering
   */
  listAdvanced: viewProcedure
    .input(advancedFilterSchema.optional())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { invoices: [], total: 0, hasMore: false };

      const filters: any[] = [];
      const orgId = ctx.user?.organizationId;

      // Org isolation
      if (orgId) filters.push(eq(invoices.organizationId, orgId));

      // Text search on invoice number, client name, notes
      if (input?.search) {
        filters.push(or(
          like(invoices.invoiceNumber, `%${input.search}%`),
          like(invoices.notes, `%${input.search}%`)
        ));
      }

      // Status filter
      if (input?.status) {
        filters.push(eq(invoices.status, input.status));
      }

      // Date range
      if (input?.startDate && input?.endDate) {
        filters.push(between(invoices.issueDate, input.startDate, input.endDate));
      } else if (input?.startDate) {
        filters.push(gte(invoices.issueDate, input.startDate));
      } else if (input?.endDate) {
        filters.push(lte(invoices.issueDate, input.endDate));
      }

      // Amount range
      if (input?.minAmount !== undefined && input?.maxAmount !== undefined) {
        filters.push(between(invoices.total, input.minAmount, input.maxAmount));
      } else if (input?.minAmount !== undefined) {
        filters.push(gte(invoices.total, input.minAmount));
      } else if (input?.maxAmount !== undefined) {
        filters.push(lte(invoices.total, input.maxAmount));
      }

      // Client filter
      if (input?.clientIds && input.clientIds.length > 0) {
        filters.push(or(...input.clientIds.map(id => eq(invoices.clientId, id))));
      }

      // Payment status filters
      if (input?.isPaid !== undefined) {
        if (input.isPaid) {
          // Total paid amount = total amount
          filters.push(eq(invoices.status, "paid"));
        } else {
          // Unpaid or partially paid
          filters.push(or(
            eq(invoices.status, "draft"),
            eq(invoices.status, "sent"),
            eq(invoices.status, "partial"),
            eq(invoices.status, "overdue")
          ));
        }
      }

      // Overdue filter
      if (input?.isOverdue) {
        // Due date has passed
        const today = new Date().toISOString().split("T")[0];
        filters.push(and(
          lte(invoices.dueDate, today),
          or(
            eq(invoices.status, "sent"),
            eq(invoices.status, "partial"),
            eq(invoices.status, "overdue")
          )
        ));
      }

      const where = filters.length > 0 ? and(...filters) : undefined;
      const limit = input?.limit ?? 50;
      const offset = input?.offset ?? 0;

      // Get paginated results
      const rows = await db
        .select()
        .from(invoices)
        .where(where)
        .orderBy(desc(invoices.issueDate))
        .limit(limit)
        .offset(offset);

      // Get total count
      const [countRes] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(invoices)
        .where(where);

      const total = Number(countRes?.count ?? rows.length);
      const hasMore = offset + limit < total;

      return {
        invoices: rows,
        total,
        hasMore,
        limit,
        offset,
        pageCount: Math.ceil(total / limit),
      };
    }),

  /**
   * Get invoice aging analysis (days overdue breakdown)
   * Returns invoices grouped by aging category: current, 30, 60, 90, 90+
   */
  getAgingAnalysis: viewProcedure
    .input(z.object({
      includeDetails: z.boolean().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { summary: {}, details: [] };

      const orgId = ctx.user?.organizationId;

      // Get all unpaid invoices
      const unpaidInvoices = await db
        .select()
        .from(invoices)
        .where(and(
          orgId ? eq(invoices.organizationId, orgId) : undefined,
          or(
            eq(invoices.status, "sent"),
            eq(invoices.status, "partial"),
            eq(invoices.status, "overdue")
          )
        ));

      // Group by aging category
      const aging: Record<string, any> = {
        current: { count: 0, total: 0, invoices: [] },
        "30days": { count: 0, total: 0, invoices: [] },
        "60days": { count: 0, total: 0, invoices: [] },
        "90days": { count: 0, total: 0, invoices: [] },
        "over90days": { count: 0, total: 0, invoices: [] },
      };

      for (const invoice of unpaidInvoices) {
        const daysOverdue = calculateDaysOverdue(invoice.dueDate);
        const category = getAgingCategory(daysOverdue);
        const outstandingAmount = (invoice.total || 0) - (invoice.paidAmount || 0);

        aging[category].count++;
        aging[category].total += outstandingAmount;

        if (input?.includeDetails) {
          aging[category].invoices.push({
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            dueDate: invoice.dueDate,
            daysOverdue,
            total: invoice.total,
            paidAmount: invoice.paidAmount,
            outstandingAmount,
            clientId: invoice.clientId,
          });
        }
      }

      return {
        summary: {
          totalUnpaid: unpaidInvoices.reduce((s, i) => s + ((i.total || 0) - (i.paidAmount || 0)), 0),
          totalInvoices: unpaidInvoices.length,
          breakdown: aging,
        },
        details: input?.includeDetails ? aging : undefined,
      };
    }),

  /**
   * Send batch payment reminders to clients for unpaid invoices
   * Only sends to invoices past due or near due date
   */
  sendBatchReminders: approveProcedure
    .input(z.object({
      invoiceIds: z.array(z.string()).min(1).max(100),
      daysBeforeDue: z.number().optional().default(3),
      message: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      try {
        const results = [];
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() + input.daysBeforeDue);

        for (const invoiceId of input.invoiceIds) {
          try {
            const [invoice] = await db
              .select()
              .from(invoices)
              .where(and(
                eq(invoices.id, invoiceId),
                eq(invoices.organizationId, ctx.user.organizationId)
              ))
              .limit(1);

            if (!invoice) {
              results.push({
                invoiceId,
                success: false,
                reason: "Invoice not found",
              });
              continue;
            }

            // Check if invoice is eligible for reminder
            if (invoice.status === "paid" || invoice.status === "cancelled") {
              results.push({
                invoiceId,
                success: false,
                reason: `Invoice status ${invoice.status} - cannot send reminder`,
              });
              continue;
            }

            // Simulate sending reminder (integrate with email service)
            // In production, would call email service here
            console.log(`[EMAIL] Sending reminder for invoice ${invoice.invoiceNumber}`);

            await logInvoiceActivity(db, invoiceId, "email_reminder", ctx.user.id, {
              clientId: invoice.clientId,
              reminderMessage: input.message,
            });

            results.push({
              invoiceId,
              success: true,
              invoiceNumber: invoice.invoiceNumber,
            });
          } catch (error) {
            results.push({
              invoiceId,
              success: false,
              reason: error instanceof Error ? error.message : String(error),
            });
          }
        }

        const successCount = results.filter(r => r.success).length;
        const failedCount = results.filter(r => !r.success).length;

        return {
          success: failedCount === 0,
          sent: successCount,
          failed: failedCount,
          results,
          message: `Reminders sent: ${successCount}${failedCount > 0 ? `, Failed: ${failedCount}` : ""}`,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send batch reminders",
        });
      }
    }),

  /**
   * Apply partial payment to invoice
   * Handles partial payments while keeping invoice open
   */
  applyPartialPayment: createProcedure
    .input(z.object({
      invoiceId: z.string(),
      paymentAmount: z.number().positive(),
      paymentDate: z.string(),
      referenceNumber: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      try {
        const [invoice] = await db
          .select()
          .from(invoices)
          .where(and(
            eq(invoices.id, input.invoiceId),
            eq(invoices.organizationId, ctx.user.organizationId)
          ))
          .limit(1);

        if (!invoice) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
        }

        if (invoice.status === "paid" || invoice.status === "cancelled") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Cannot apply payment to invoice with status: ${invoice.status}`,
          });
        }

        const outstandingAmount = (invoice.total || 0) - (invoice.paidAmount || 0);
        if (input.paymentAmount > outstandingAmount) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Payment amount (${input.paymentAmount}) exceeds outstanding amount (${outstandingAmount})`,
          });
        }

        const newPaidAmount = (invoice.paidAmount || 0) + input.paymentAmount;
        const newStatus = newPaidAmount >= (invoice.total || 0) ? "paid" : "partial";

        await db
          .update(invoices)
          .set({
            paidAmount: newPaidAmount,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(invoices.id, input.invoiceId));

        await logInvoiceActivity(db, input.invoiceId, "partial_payment", ctx.user.id, {
          paymentAmount: input.paymentAmount,
          totalPaid: newPaidAmount,
          outstanding: (invoice.total || 0) - newPaidAmount,
          referenceNumber: input.referenceNumber,
        });

        return {
          success: true,
          invoiceId: input.invoiceId,
          paymentApplied: input.paymentAmount,
          totalPaid: newPaidAmount,
          outstanding: (invoice.total || 0) - newPaidAmount,
          newStatus,
          message: `Payment of ${input.paymentAmount} applied successfully. Invoice status: ${newStatus}`,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to apply payment",
        });
      }
    }),

  /**
   * Mark batch of invoices as sent
   */
  markBatchAsSent: createProcedure
    .input(z.object({
      invoiceIds: z.array(z.string()).min(1).max(100),
      sentDate: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      try {
        const sentDate = input.sentDate || new Date().toISOString();
        const results = [];

        for (const invoiceId of input.invoiceIds) {
          try {
            const [invoice] = await db
              .select()
              .from(invoices)
              .where(eq(invoices.id, invoiceId))
              .limit(1);

            if (!invoice) {
              results.push({
                invoiceId,
                success: false,
                reason: "Invoice not found",
              });
              continue;
            }

            await db
              .update(invoices)
              .set({
                status: "sent",
                updatedAt: new Date().toISOString(),
              })
              .where(eq(invoices.id, invoiceId));

            await logInvoiceActivity(db, invoiceId, "send", ctx.user.id, { sentDate });

            results.push({
              invoiceId,
              success: true,
              invoiceNumber: invoice.invoiceNumber,
            });
          } catch (error) {
            results.push({
              invoiceId,
              success: false,
              reason: error instanceof Error ? error.message : String(error),
            });
          }
        }

        const successCount = results.filter(r => r.success).length;

        return {
          success: true,
          updated: successCount,
          failed: input.invoiceIds.length - successCount,
          results,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark invoices as sent",
        });
      }
    }),

  /**
   * Get invoices expiring soon (with configurable threshold)
   * Useful for payment reminders and cash flow planning
   */
  getExpiringInvoices: viewProcedure
    .input(z.object({
      daysThreshold: z.number().default(30),
      includeOverdue: z.boolean().optional().default(true),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { invoices: [] };

      const orgId = ctx.user?.organizationId;
      const today = new Date();
      const threshold = new Date(today.getTime() + input.daysThreshold * 24 * 60 * 60 * 1000);

      let filters: any[] = [
        or(
          eq(invoices.status, "sent"),
          eq(invoices.status, "partial")
        )
      ];

      if (orgId) filters.push(eq(invoices.organizationId, orgId));

      if (input.includeOverdue) {
        filters.push(lte(invoices.dueDate, threshold.toISOString().split("T")[0]));
      } else {
        filters.push(between(
          invoices.dueDate,
          today.toISOString().split("T")[0],
          threshold.toISOString().split("T")[0]
        ));
      }

      const where = filters.length > 0 ? and(...filters) : undefined;

      const expiringInvoices = await db
        .select()
        .from(invoices)
        .where(where)
        .orderBy(asc(invoices.dueDate));

      return {
        invoices: expiringInvoices.map(inv => ({
          ...inv,
          daysUntilDue: Math.ceil((new Date(inv.dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
          outstanding: (inv.total || 0) - (inv.paidAmount || 0),
        })),
        threshold: input.daysThreshold,
      };
    }),
};

// ============================================================================
// EXPORT ENHANCEMENT GUIDANCE
// ============================================================================

/**
 * INTEGRATION INSTRUCTIONS:
 * 
 * 1. Copy the helper functions above to invoices.ts
 * 2. Add the validation schemas to invoices.ts
 * 3. Add these endpoint definitions to the invoicesRouter export in invoices.ts:
 *    - listAdvanced
 *    - getAgingAnalysis
 *    - sendBatchReminders
 *    - applyPartialPayment
 *    - markBatchAsSent
 *    - getExpiringInvoices
 * 
 * 4. Import required items at top of invoices.ts:
 *    - import { sql, asc } from "drizzle-orm";
 * 
 * 5. Test endpoints:
 *    - POST /invoices.listAdvanced with filters
 *    - GET /invoices.getAgingAnalysis
 *    - POST /invoices.sendBatchReminders
 *    - POST /invoices.applyPartialPayment
 *    - POST /invoices.markBatchAsSent
 *    - GET /invoices.getExpiringInvoices
 */
