/**
 * M-Pesa Payment Router
 * tRPC endpoints for M-Pesa STK Push and payment processing
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as mpesaService from "../services/mpesa";
import * as db from "../db";
import { TRPCError } from "@trpc/server";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { v4 as uuidv4 } from "uuid";

// Feature-based access control
const mpesaPaymentsProcedure = createFeatureRestrictedProcedure("accounting:payments:create");
const mpesaViewProcedure = createFeatureRestrictedProcedure("accounting:payments:view");

export const mpesaRouter = router({
  /**
   * Get M-Pesa configuration status
   */
  getStatus: protectedProcedure.query(async () => {
    return mpesaService.getMPesaStatus();
  }),

  /**
   * Initiate STK Push (SMS payment prompt to customer phone)
   */
  initiateStKPush: mpesaPaymentsProcedure
    .input(z.object({
      invoiceId: z.string().uuid(),
      phoneNumber: z.string().regex(
        /^(?:\+254|254|0)[1-9]\d{8,9}$/,
        "Invalid Kenyan phone number"
      ),
      amount: z.number().positive("Amount must be positive"),
      accountReference: z.string().max(50),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user?.clientId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not associated with a client",
          });
        }

        const result = await mpesaService.initiateSTKPush({
          invoiceId: input.invoiceId,
          clientId: ctx.user.clientId,
          phoneNumber: input.phoneNumber,
          amount: input.amount,
          accountReference: input.accountReference,
          description: input.description,
        });

        return result;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to initiate STK Push",
        });
      }
    }),

  /**
   * Query the status of an STK Push transaction
   */
  queryTransactionStatus: mpesaViewProcedure
    .input(z.object({
      checkoutRequestId: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        return await mpesaService.queryTransactionStatus(input.checkoutRequestId);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to query transaction status",
        });
      }
    }),

  /**
   * Poll transaction status (frontend calls this to check if payment completed)
   */
  pollTransactionStatus: mpesaViewProcedure
    .input(z.object({
      checkoutRequestId: z.string(),
      invoiceId: z.string().uuid(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const database = await db.getDb();
        if (!database) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database connection failed",
          });
        }

        const mpesaTransactions = (await import('../../drizzle/schema')).mpesaTransactions;
        const { eq } = await import('drizzle-orm');

        // Get transaction from database
        const transaction = await database.select()
          .from(mpesaTransactions)
          .where(eq(mpesaTransactions.checkoutRequestId, input.checkoutRequestId))
          .limit(1);

        if (!transaction.length || transaction[0].clientId !== ctx.user?.clientId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Transaction not found or access denied",
          });
        }

        const txn = transaction[0];

        return {
          checkoutRequestId: txn.checkoutRequestId,
          status: txn.status,
          amount: txn.amount,
          phoneNumber: txn.phoneNumber,
          mpesaReceiptNumber: txn.mpesaReceiptNumber,
          transactionDate: (txn as any).transactionTime || txn.createdAt,
          resultDescription: (txn as any).resultDescription,
          completedAt: (txn as any).completedAt || txn.createdAt,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to poll transaction status",
        });
      }
    }),

  /**
   * Confirm payment after M-Pesa callback received
   * Called when customer completes payment via phone prompt
   */
  confirmPayment: mpesaPaymentsProcedure
    .input(z.object({
      checkoutRequestId: z.string(),
      invoiceId: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const database = await db.getDb();
        if (!database) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database connection failed",
          });
        }

        const mpesaTransactions = (await import('../../drizzle/schema')).mpesaTransactions;
        const payments = (await import('../../drizzle/schema')).payments;
        const invoices = (await import('../../drizzle/schema')).invoices;
        const { eq } = await import('drizzle-orm');

        // Verify transaction exists and belongs to user's client
        const transaction = await database.select()
          .from(mpesaTransactions)
          .where(eq(mpesaTransactions.checkoutRequestId, input.checkoutRequestId))
          .limit(1);

        if (!transaction.length || transaction[0].clientId !== ctx.user?.clientId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Transaction not found or access denied",
          });
        }

        const txn = transaction[0];

        // Verify transaction was completed
        if (txn.status !== 'completed') {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Transaction status is '${txn.status}', cannot confirm. Expected 'completed'.`,
          });
        }

        // Create payment record
        const existingPayment = await database.select()
          .from(payments)
          .where(eq(payments.invoiceId, input.invoiceId))
          .limit(1);

        if (!existingPayment.length) {
          // Get invoice to determine amount
          const invoice = await database.select()
            .from(invoices)
            .where(eq(invoices.id, input.invoiceId))
            .limit(1);

          if (!invoice.length) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Invoice not found",
            });
          }

          await database.insert(payments).values({
            id: uuidv4(),
            invoiceId: input.invoiceId,
            clientId: ctx.user.clientId,
            amount: invoice[0].total || 0,
            paymentDate: txn.transactionDate || new Date().toISOString().slice(0, 19).replace('T', ' '),
            paymentMethod: 'mpesa',
            status: 'completed',
            referenceNumber: txn.mpesaReceiptNumber || `MPESA-${input.checkoutRequestId.slice(0, 20)}`,
            createdBy: ctx.user.id,
          });
        }

        return { success: true, message: "M-Pesa payment confirmed" };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to confirm payment",
        });
      }
    }),

  /**
   * Get M-Pesa transaction history for customer
   */
  getTransactionHistory: mpesaViewProcedure
    .input(z.object({
      limit: z.number().max(50).default(10),
      status: z.enum(['pending', 'completed', 'failed', 'cancelled', 'expired', 'retry']).optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const database = await db.getDb();
        if (!database) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database connection failed",
          });
        }

        const mpesaTransactions = (await import('../../drizzle/schema')).mpesaTransactions;
        const { eq, desc, and } = await import('drizzle-orm');

        let query = database.select().from(mpesaTransactions);

        if (input.status) {
          query = database.select()
            .from(mpesaTransactions)
            .where(eq(mpesaTransactions.status, input.status as any));
        }

        const transactions = await query
          .orderBy(desc(mpesaTransactions.transactionTime))
          .limit(input.limit);

        return transactions.map((t) => ({
          id: t.id,
          checkoutRequestId: t.checkoutRequestId,
          invoiceId: t.invoiceId,
          phoneNumber: t.phoneNumber,
          amount: t.amount,
          status: t.status,
          mpesaReceiptNumber: t.mpesaReceiptNumber,
          transactionDate: t.transactionTime,
          completedAt: t.transactionTime,
          resultDescription: t.mpesaReceiptNumber || "completed",
        }));
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch transaction history",
        });
      }
    }),

  /**
   * Retry failed M-Pesa transaction
   */
  retryTransaction: mpesaPaymentsProcedure
    .input(z.object({
      checkoutRequestId: z.string(),
      phoneNumber: z.string(),
      amount: z.number().positive(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const database = await db.getDb();
        if (!database) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database connection failed",
          });
        }

        const mpesaTransactions = (await import('../../drizzle/schema')).mpesaTransactions;
        const { eq } = await import('drizzle-orm');

        // Get original transaction
        const transaction = await database.select()
          .from(mpesaTransactions)
          .where(eq(mpesaTransactions.checkoutRequestId, input.checkoutRequestId))
          .limit(1);

        if (!transaction.length || transaction[0].clientId !== ctx.user?.clientId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Transaction not found or access denied",
          });
        }

        // Initiate new STK Push for same invoice
        const result = await mpesaService.initiateSTKPush({
          invoiceId: transaction[0].invoiceId,
          clientId: ctx.user.clientId,
          phoneNumber: input.phoneNumber,
          amount: input.amount,
          accountReference: `RETRY-${transaction[0].invoiceId}`,
          description: `Retry payment for invoice ${transaction[0].invoiceId}`,
        });

        return result;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retry transaction",
        });
      }
    }),

  /**
   * Get M-Pesa account settings (admin only)
   */
  getSettings: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Require admin/super_admin role
      if (!["admin", "super_admin"].includes(ctx.user?.role || "")) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Admin access required",
        });
      }

      const database = await db.getDb();
      if (!database) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      const settings = await database.select().from((await import('../../drizzle/schema')).mpesaTransactions as any).limit(1);

      if (!settings.length) {
        return {
          isActive: false,
          environment: 'sandbox',
          message: 'M-Pesa not configured',
        };
      }

      const setting = settings[0];
      return {
        businessShortCode: setting.businessShortCode,
        environment: setting.environment,
        callbackUrl: setting.callbackUrl,
        isActive: setting.isActive,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get M-Pesa settings",
      });
    }
  }),
});

export default mpesaRouter;
