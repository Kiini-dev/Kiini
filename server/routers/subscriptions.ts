/**
 * Main Application Subscription Management Router
 * Handles organization subscription lifecycle, upgrades, downgrades, and management
 * Global permissions-based access for admins and accountants
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import * as db from "../db";
import { getDb } from "../db";
import {
  subscriptions,
  billingInvoices,
  pricingPlans,
} from "../../drizzle/schema";
import { eq, and, desc, lte } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// Feature-based procedures
const subscriptionReadProcedure = createFeatureRestrictedProcedure("subscriptions:read");
const subscriptionWriteProcedure = createFeatureRestrictedProcedure("subscriptions:write");
const billingReadProcedure = createFeatureRestrictedProcedure("billing:read");

export const subscriptionsRouter = router({
  /**
   * List all subscriptions (admin/accountant only)
   */
  list: subscriptionReadProcedure
    .input(
      z.object({
        status: z.enum(["trial", "active", "suspended", "cancelled", "expired"]).optional(),
        tier: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().max(100).default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        let conditions: any[] = [];

        if (input.status) {
          conditions.push(eq(subscriptions.status, input.status as any));
        }

        const query = conditions.length > 0
          ? database.select().from(subscriptions).where(and(...conditions))
          : database.select().from(subscriptions);

        const subs = await (query as any)
          .orderBy(desc(subscriptions.createdAt))
          .limit(input.limit)
          .offset(input.offset);

        return {
          success: true,
          subscriptions: subs,
          count: subs.length,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to fetch subscriptions",
        });
      }
    }),

  /**
   * Get subscription details
   */
  getDetail: subscriptionReadProcedure
    .input(z.object({ subscriptionId: z.string() }))
    .query(async ({ input }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        const sub = await database
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.id, input.subscriptionId))
          .limit(1);

        if (!sub.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Subscription not found",
          });
        }

        const plan = await database
          .select()
          .from(pricingPlans)
          .where(eq(pricingPlans.id, sub[0].planId as any))
          .limit(1);

        const invoices = await database
          .select()
          .from(billingInvoices)
          .where(eq(billingInvoices.subscriptionId, input.subscriptionId))
          .orderBy(desc(billingInvoices.createdAt))
          .limit(10);

        return {
          success: true,
          subscription: sub[0],
          plan: plan[0] || null,
          recentInvoices: invoices,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to fetch subscription details",
        });
      }
    }),

  /**
   * Upgrade or downgrade subscription plan
   */
  changeplan: subscriptionWriteProcedure
    .input(
      z.object({
        subscriptionId: z.string(),
        newPlanId: z.string(),
        effectiveDate: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        // Get current subscription
        const currentSub = await database
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.id, input.subscriptionId))
          .limit(1);

        if (!currentSub.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Subscription not found",
          });
        }

        // Get new plan
        const newPlan = await database
          .select()
          .from(pricingPlans)
          .where(eq(pricingPlans.id, input.newPlanId))
          .limit(1);

        if (!newPlan.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Pricing plan not found",
          });
        }

        const now = new Date().toISOString();
        const effectiveDate = input.effectiveDate || now;

        // Create change record (invoice for difference)
        const invoiceId = uuidv4();
        const currentPrice = currentSub[0].currentPrice as any;
        const newPrice = currentSub[0].billingCycle === "monthly" 
          ? (newPlan[0].monthlyPrice as any)
          : (newPlan[0].annualPrice as any);

        const priceDifference = newPrice - currentPrice;

        // Update subscription
        await database
          .update(subscriptions)
          .set({
            planId: input.newPlanId,
            currentPrice: newPrice,
            updatedAt: now,
          } as any)
          .where(eq(subscriptions.id, input.subscriptionId));

        // Create adjustment invoice if there's a price difference
        if (priceDifference !== 0) {
          await database.insert(billingInvoices).values({
            id: invoiceId,
            subscriptionId: input.subscriptionId,
            invoiceNumber: `ADJ-${Date.now()}-${currentSub[0].id.slice(0, 8)}`,
            amount: Math.abs(priceDifference),
            tax: 0,
            totalAmount: Math.abs(priceDifference),
            currency: "KES",
            status: priceDifference > 0 ? "pending" : "paid",
            billingPeriodStart: effectiveDate,
            billingPeriodEnd: currentSub[0].renewalDate as any,
            dueDate: effectiveDate,
            sentAt: now,
            paidAt: priceDifference <= 0 ? now : null,
            paymentMethod: null,
            paymentReference: null,
            notes: `Plan upgrade/downgrade from ${currentSub[0].planId} to ${input.newPlanId}`,
            createdAt: now,
            updatedAt: now,
          } as any);
        }

        await db.logActivity({
          userId: ctx.user.id,
          action: "subscription.plan_changed",
          entityType: "Subscription",
          entityId: input.subscriptionId,
          description: `Changed subscription plan from ${currentSub[0].planId} to ${input.newPlanId}`,
          metadata: JSON.stringify({ newPlanId: input.newPlanId, priceDifference }),
          ipAddress: ctx.req?.ip ?? null,
        });

        return {
          success: true,
          subscriptionId: input.subscriptionId,
          priceDifference,
          message:
            priceDifference > 0
              ? "Plan upgraded. Additional charges will be applied."
              : "Plan downgraded. Credit will be applied to next invoice.",
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to change subscription plan",
        });
      }
    }),

  /**
   * Toggle auto-renewal
   */
  toggleAutoRenew: subscriptionWriteProcedure
    .input(
      z.object({
        subscriptionId: z.string(),
        autoRenew: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        await database
          .update(subscriptions)
          .set({
            autoRenew: input.autoRenew ? 1 : 0,
            updatedAt: new Date().toISOString(),
          } as any)
          .where(eq(subscriptions.id, input.subscriptionId));

        await db.logActivity({
          userId: ctx.user.id,
          action: "subscription.auto_renew_toggled",
          entityType: "Subscription",
          entityId: input.subscriptionId,
          description: `Auto-renew ${input.autoRenew ? "enabled" : "disabled"}`,
          metadata: JSON.stringify({ autoRenew: input.autoRenew }),
          ipAddress: ctx.req?.ip ?? null,
        });

        return {
          success: true,
          autoRenew: input.autoRenew,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to toggle auto-renewal",
        });
      }
    }),

  /**
   * Suspend subscription
   */
  suspend: subscriptionWriteProcedure
    .input(
      z.object({
        subscriptionId: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        await database
          .update(subscriptions)
          .set({
            status: "suspended",
            isLocked: 1,
            updatedAt: new Date().toISOString(),
          } as any)
          .where(eq(subscriptions.id, input.subscriptionId));

        return {
          success: true,
          message: `Subscription suspended${input.reason ? `: ${input.reason}` : ""}`,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to suspend subscription",
        });
      }
    }),

  /**
   * Reactivate suspended subscription
   */
  reactivate: subscriptionWriteProcedure
    .input(z.object({ subscriptionId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        const sub = await database
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.id, input.subscriptionId))
          .limit(1);

        if (!sub.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Subscription not found",
          });
        }

        // Check if there are overdue payments
        const overduePay = await database
          .select()
          .from(billingInvoices)
          .where(
            and(
              eq(billingInvoices.subscriptionId, input.subscriptionId),
              eq(billingInvoices.status, "pending"),
              lte(billingInvoices.dueDate, new Date().toISOString())
            )
          );

        if (overduePay.length > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Cannot reactivate: ${overduePay.length} overdue invoice(s) must be paid first`,
          });
        }

        await database
          .update(subscriptions)
          .set({
            status: "active",
            isLocked: 0,
            updatedAt: new Date().toISOString(),
          } as any)
          .where(eq(subscriptions.id, input.subscriptionId));

        return {
          success: true,
          message: "Subscription reactivated",
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to reactivate subscription",
        });
      }
    }),

  /**
   * Cancel subscription
   */
  cancel: subscriptionWriteProcedure
    .input(
      z.object({
        subscriptionId: z.string(),
        reason: z.string().optional(),
        refundPending: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        const sub = await database
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.id, input.subscriptionId))
          .limit(1);

        if (!sub.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Subscription not found",
          });
        }

        const now = new Date().toISOString();

        await database
          .update(subscriptions)
          .set({
            status: "cancelled",
            isLocked: 1,
            autoRenew: 0,
            updatedAt: now,
          } as any)
          .where(eq(subscriptions.id, input.subscriptionId));

        // If refund is pending, create a refund invoice
        if (input.refundPending && sub[0].currentPrice) {
          const refundId = uuidv4();
          const refundAmount = (sub[0].currentPrice as any) * 0.1; // 10% cancellation fee

          await database.insert(billingInvoices).values({
            id: refundId,
            subscriptionId: input.subscriptionId,
            invoiceNumber: `REFUND-${Date.now()}-${sub[0].id.slice(0, 8)}`,
            amount: refundAmount,
            tax: 0,
            totalAmount: refundAmount,
            currency: "KES",
            status: "pending",
            billingPeriodStart: now,
            billingPeriodEnd: now,
            dueDate: now,
            sentAt: now,
            paidAt: null,
            paymentMethod: null,
            paymentReference: null,
            notes: `Subscription cancellation${input.reason ? `: ${input.reason}` : ""}. Refund after 10% processing fee.`,
            createdAt: now,
            updatedAt: now,
          } as any);
        }

        return {
          success: true,
          message: `Subscription cancelled${input.reason ? `: ${input.reason}` : ""}`,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to cancel subscription",
        });
      }
    }),

  /**
   * Get subscription analytics
   */
  getAnalytics: subscriptionReadProcedure
    .input(
      z.object({
        dateRange: z.enum(["7d", "30d", "90d", "1y"]).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        // Calculate date range
        const now = new Date();
        let startDate = new Date();
        switch (input.dateRange) {
          case "7d":
            startDate.setDate(now.getDate() - 7);
            break;
          case "30d":
            startDate.setDate(now.getDate() - 30);
            break;
          case "90d":
            startDate.setDate(now.getDate() - 90);
            break;
          case "1y":
            startDate.setFullYear(now.getFullYear() - 1);
            break;
          default:
            startDate.setDate(now.getDate() - 30);
        }

        const allSubs = await database.select().from(subscriptions);
        const activeCount = allSubs.filter((s) => s.status === "active").length;
        const trialCount = allSubs.filter((s) => s.status === "trial").length;
        const suspendedCount = allSubs.filter((s) => s.status === "suspended").length;
        const cancelledCount = allSubs.filter((s) => s.status === "cancelled").length;

        // Calculate MRR
        const activeWithMonthly = allSubs.filter(
          (s) => s.status === "active" && s.billingCycle === "monthly"
        );
        const mrr = activeWithMonthly.reduce(
          (sum, s) => sum + (parseFloat(s.currentPrice as any) || 0),
          0
        );

        return {
          success: true,
          analytics: {
            totalSubscriptions: allSubs.length,
            activeCount,
            trialCount,
            suspendedCount,
            cancelledCount,
            mrr: Math.round(mrr * 100) / 100,
            activePercentage: Math.round((activeCount / allSubs.length) * 100),
          },
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to fetch subscription analytics",
        });
      }
    }),

  /**
   * Export subscriptions to CSV
   */
  export: subscriptionReadProcedure.query(async () => {
    try {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const subs = await database.select().from(subscriptions).orderBy(desc(subscriptions.createdAt));

      // Format as CSV
      const headers = [
        "ID",
        "Client ID",
        "Plan ID",
        "Status",
        "Billing Cycle",
        "Current Price",
        "Start Date",
        "Renewal Date",
        "Auto Renew",
        "Created At",
      ];

      const rows = subs.map((s) => [
        s.id,
        s.clientId,
        s.planId,
        s.status,
        s.billingCycle,
        s.currentPrice,
        s.startDate,
        s.renewalDate,
        s.autoRenew ? "Yes" : "No",
        s.createdAt,
      ]);

      const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

      return {
        success: true,
        data: csv,
        filename: `subscriptions_${new Date().toISOString().split("T")[0]}.csv`,
      };
    } catch (error: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Failed to export subscriptions",
      });
    }
  }),
});
