/**
 * Bulk Operations Router
 * 
 * Provides bulk update, delete, and status change operations across modules
 */

import { router, protectedProcedure } from "../_core/trpc";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { z } from "zod";
import { getDb } from "../db";
import {
  invoices,
  expenses,
  payments,
  projects,
} from "../../drizzle/schema";
import { inArray, eq } from "drizzle-orm";

// Feature-based procedures
const invoiceUpdateProcedure = createFeatureRestrictedProcedure("invoices:edit");
const invoiceDeleteProcedure = createFeatureRestrictedProcedure("invoices:delete");
const expenseUpdateProcedure = createFeatureRestrictedProcedure("expenses:edit");
const expenseDeleteProcedure = createFeatureRestrictedProcedure("expenses:delete");
const projectUpdateProcedure = createFeatureRestrictedProcedure("projects:edit");
const projectDeleteProcedure = createFeatureRestrictedProcedure("projects:delete");
const paymentUpdateProcedure = createFeatureRestrictedProcedure("payments:edit");
const paymentDeleteProcedure = createFeatureRestrictedProcedure("payments:delete");

export const bulkOperationsRouter = router({
  /**
   * Bulk update invoice status
   */
  updateInvoiceStatus: invoiceUpdateProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
        status: z.enum(["draft", "sent", "paid", "partial", "overdue", "cancelled"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, updated: 0 };

      try {
        const result = await db
          .update(invoices)
          .set({ status: input.status })
          .where(inArray(invoices.id, input.ids));

        return { success: true, updated: input.ids.length };
      } catch (error) {
        console.error("Bulk update error:", error);
        return { success: false, updated: 0 };
      }
    }),

  /**
   * Bulk delete invoices
   */
  deleteInvoices: invoiceDeleteProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, deleted: 0 };

      try {
        await db.delete(invoices).where(inArray(invoices.id, input.ids));
        return { success: true, deleted: input.ids.length };
      } catch (error) {
        console.error("Bulk delete error:", error);
        return { success: false, deleted: 0 };
      }
    }),

  /**
   * Bulk update expense status
   */
  updateExpenseStatus: expenseUpdateProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
        status: z.enum(["pending", "approved", "rejected", "paid"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, updated: 0 };

      try {
        await db
          .update(expenses)
          .set({ status: input.status })
          .where(inArray(expenses.id, input.ids));

        return { success: true, updated: input.ids.length };
      } catch (error) {
        console.error("Bulk update error:", error);
        return { success: false, updated: 0 };
      }
    }),

  /**
   * Bulk delete expenses
   */
  deleteExpenses: expenseDeleteProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, deleted: 0 };

      try {
        await db.delete(expenses).where(inArray(expenses.id, input.ids));
        return { success: true, deleted: input.ids.length };
      } catch (error) {
        console.error("Bulk delete error:", error);
        return { success: false, deleted: 0 };
      }
    }),

  /**
   * Bulk update project status
   */
  updateProjectStatus: projectUpdateProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
        status: z.enum(["planning", "active", "on_hold", "completed", "cancelled"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, updated: 0 };

      try {
        await db
          .update(projects)
          .set({ status: input.status })
          .where(inArray(projects.id, input.ids));

        return { success: true, updated: input.ids.length };
      } catch (error) {
        console.error("Bulk update error:", error);
        return { success: false, updated: 0 };
      }
    }),

  /**
   * Bulk delete projects
   */
  deleteProjects: projectDeleteProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, deleted: 0 };

      try {
        await db.delete(projects).where(inArray(projects.id, input.ids));
        return { success: true, deleted: input.ids.length };
      } catch (error) {
        console.error("Bulk delete error:", error);
        return { success: false, deleted: 0 };
      }
    }),

  /**
   * Bulk update payment status
   */
  updatePaymentStatus: paymentUpdateProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
        status: z.enum(["pending", "completed", "failed", "cancelled"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, updated: 0 };

      try {
        await db
          .update(payments)
          .set({ status: input.status })
          .where(inArray(payments.id, input.ids));

        return { success: true, updated: input.ids.length };
      } catch (error) {
        console.error("Bulk update error:", error);
        return { success: false, updated: 0 };
      }
    }),

  /**
   * Bulk delete payments
   */
  deletePayments: paymentDeleteProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, deleted: 0 };

      try {
        await db.delete(payments).where(inArray(payments.id, input.ids));
        return { success: true, deleted: input.ids.length };
      } catch (error) {
        console.error("Bulk delete error:", error);
        return { success: false, deleted: 0 };
      }
    }),
});
