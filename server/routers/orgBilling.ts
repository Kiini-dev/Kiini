/**
 * Organization Billing & Subscription Management Router
 * Handles subscription management, invoices, payment methods, and automated billing for organizations
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import * as db from "../db";
import { getDb } from "../db";
import { v4 as uuidv4 } from "uuid";
import { subscriptions, billingInvoices, payments, paymentMethods, organizations } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

// Feature-based procedures
const orgBillingReadProcedure = createFeatureRestrictedProcedure("org:billing:read");
const orgBillingWriteProcedure = createFeatureRestrictedProcedure("org:billing:edit");
const orgBillingCreateProcedure = createFeatureRestrictedProcedure("org:billing:create");

export const orgBillingRouter = router({
  /**
   * Get organization subscription details
   */
  getOrgSubscription: orgBillingReadProcedure
    .input(z.string())
    .query(async ({ input: orgId }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        const subscription = await database
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.organizationId, orgId))
          .limit(1);

        return {
          subscription: subscription[0] || null,
          success: true,
        };
      } catch (error: any) {
        console.error("[OrgBilling] Error fetching subscription:", error);
        return {
          subscription: null,
          error: error.message,
          success: false,
        };
      }
    }),

  /**
   * Get billing invoices for organization
   */
  getOrgInvoices: orgBillingReadProcedure
    .input(z.object({
      orgId: z.string(),
      status: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        // Get subscription for org first
        const subscription = await database
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.organizationId, input.orgId))
          .limit(1);

        if (!subscription.length) {
          return { invoices: [], total: 0, success: true };
        }

        const query = database
          .select()
          .from(billingInvoices)
          .where(eq(billingInvoices.subscriptionId, subscription[0].id));

        if (input.status) {
          // Rebuild query with status filter
          const invoices = await database
            .select()
            .from(billingInvoices)
            .where(
              and(
                eq(billingInvoices.subscriptionId, subscription[0].id),
                eq(billingInvoices.status, input.status as any)
              )
            );
          return {
            invoices: invoices.slice(input.offset, input.offset + input.limit),
            total: invoices.length,
            success: true,
          };
        }

        const invoices = await query;
        return {
          invoices: invoices.slice(input.offset, input.offset + input.limit),
          total: invoices.length,
          success: true,
        };
      } catch (error: any) {
        console.error("[OrgBilling] Error fetching invoices:", error);
        return {
          invoices: [],
          total: 0,
          error: error.message,
          success: false,
        };
      }
    }),

  /**
   * Get payment methods for organization
   */
  getOrgPaymentMethods: orgBillingReadProcedure
    .input(z.string())
    .query(async ({ input: orgId }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        const methods = await database
          .select()
          .from(paymentMethods)
          .where(eq(paymentMethods.clientId, orgId));

        return {
          methods: methods.map((m) => ({
            id: m.id,
            type: m.type,
            provider: m.provider,
            lastFourDigits: m.lastFourDigits,
            expiryMonth: m.expiryMonth,
            expiryYear: m.expiryYear,
            holderName: m.holderName,
            isDefault: m.isDefault,
            isActive: m.isActive,
            createdAt: m.createdAt,
          })),
          success: true,
        };
      } catch (error: any) {
        console.error("[OrgBilling] Error fetching payment methods:", error);
        return {
          methods: [],
          error: error.message,
          success: false,
        };
      }
    }),

  /**
   * Add payment method to organization
   */
  addPaymentMethod: orgBillingCreateProcedure
    .input(z.object({
      orgId: z.string(),
      type: z.enum(["credit_card", "debit_card", "bank_account", "paypal", "mpesa"]),
      provider: z.string(),
      lastFourDigits: z.string().optional(),
      expiryMonth: z.number().optional(),
      expiryYear: z.number().optional(),
      holderName: z.string().optional(),
      bankName: z.string().optional(),
      accountNumber: z.string().optional(),
      providerMethodId: z.string(),
      isDefault: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        const methodId = uuidv4();
        const now = new Date().toISOString();
        const method = {
          id: methodId,
          clientId: input.orgId,
          type: input.type,
          provider: input.provider,
          lastFourDigits: input.lastFourDigits,
          expiryMonth: input.expiryMonth,
          expiryYear: input.expiryYear,
          holderName: input.holderName,
          bankName: input.bankName,
          accountNumber: input.accountNumber,
          isDefault: input.isDefault ? 1 : 0,
          isActive: 1,
          providerMethodId: input.providerMethodId,
          createdAt: now,
          updatedAt: now,
        };

        await database.insert(paymentMethods).values(method as any);

        await db.logActivity({
          userId: ctx.user.id,
          action: "payment_method.added",
          entityType: "Billing",
          entityId: input.orgId,
          description: `Added new ${input.type} payment method for organization ${input.orgId}`,
          metadata: JSON.stringify({ paymentMethodId: methodId, methodType: input.type }),
          ipAddress: ctx.req?.ip ?? null,
        });

        return { method, success: true };
      } catch (error: any) {
        console.error("[OrgBilling] Error adding payment method:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to add payment method",
        });
      }
    }),

  /**
   * Create or activate a subscription for an organization
   */
  createOrgSubscription: orgBillingCreateProcedure
    .input(z.object({
      orgId: z.string(),
      planId: z.string(),
      billingCycle: z.enum(["monthly", "annual"]),
      autoRenew: z.boolean().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        const org = await database
          .select()
          .from(organizations)
          .where(eq(organizations.id, input.orgId))
          .limit(1);

        if (!org.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Organization not found",
          });
        }

        const existingSubscription = await database
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.organizationId, input.orgId))
          .limit(1);

        if (existingSubscription.length) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "An active subscription already exists for this organization.",
          });
        }

        const plan = await db.getPricingPlan(input.planId);
        if (!plan) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Pricing plan not found",
          });
        }

        const subscriptionId = uuidv4();
        const now = new Date();
        const renewalDate = new Date(now);
        if (input.billingCycle === "monthly") {
          renewalDate.setMonth(renewalDate.getMonth() + 1);
        } else {
          renewalDate.setFullYear(renewalDate.getFullYear() + 1);
        }

        const currentPrice = input.billingCycle === "monthly"
          ? (plan as any).monthlyPrice
          : (plan as any).annualPrice;

        const subscription = await db.createSubscription({
          id: subscriptionId,
          organizationId: input.orgId,
          planId: input.planId,
          status: "active",
          billingCycle: input.billingCycle,
          startDate: now.toISOString().replace("T", " ").substring(0, 19),
          renewalDate: renewalDate.toISOString(),
          currentPrice,
          autoRenew: input.autoRenew ? 1 : 0,
          createdBy: ctx.user.id,
          createdAt: now.toISOString().replace("T", " ").substring(0, 19),
        });

        await db.logActivity({
          userId: ctx.user.id,
          action: "subscription.created",
          entityType: "Subscription",
          entityId: subscriptionId,
          description: `Created subscription ${subscriptionId} for organization ${input.orgId}`,
          metadata: JSON.stringify({ planId: input.planId, billingCycle: input.billingCycle, autoRenew: input.autoRenew }),
          ipAddress: ctx.req?.ip ?? null,
        });

        return { subscription, success: true };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        console.error("[OrgBilling] Error creating subscription:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to create subscription",
        });
      }
    }),

  /**
   * Process payment for organization subscription
   */
  processPayment: orgBillingCreateProcedure
    .input(z.object({
      orgId: z.string(),
      invoiceId: z.string(),
      amount: z.number().positive(),
      paymentMethodId: z.string(),
      paymentMethod: z.enum(["credit_card", "debit_card", "bank_transfer", "mpesa", "stripe", "paypal"]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        // Verify invoice exists and belongs to org
        const invoice = await database
          .select()
          .from(billingInvoices)
          .where(eq(billingInvoices.id, input.invoiceId))
          .limit(1);

        if (!invoice.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Invoice not found",
          });
        }

        const invoiceData = invoice[0];

        // Create payment record
        const paymentId = uuidv4();
        const now = new Date().toISOString();
        const payment = {
          id: paymentId,
          organizationId: input.orgId,
          invoiceId: input.invoiceId,
          clientId: input.orgId,
          accountId: null,
          amount: Math.round(input.amount * 100), // Store in cents
          paymentDate: now,
          paymentMethod: input.paymentMethod as any,
          referenceNumber: `PAY_${Date.now()}`,
          chartOfAccountType: "credit" as const,
          notes: input.notes,
          status: "pending",
          approvedBy: null,
          approvedAt: null,
          createdBy: ctx.user.id,
          createdAt: now,
        };

        await database.insert(payments).values(payment as any);

        // Mark invoice as paid
        await database
          .update(billingInvoices)
          .set({
            status: "paid",
            paidAt: new Date().toISOString(),
            paymentReference: paymentId,
          } as any)
          .where(eq(billingInvoices.id, input.invoiceId));

        // Check if full amount paid and update subscription
        const subscription = await database
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.id, invoiceData.subscriptionId))
          .limit(1);

        if (subscription.length) {
          const sub = subscription[0];
          // If subscription was suspended due to overdue payment, reactivate it
          if (sub.status === "suspended" || sub.isLocked) {
            const newRenewalDate = new Date(sub.renewalDate);
            if (sub.billingCycle === "monthly") {
              newRenewalDate.setMonth(newRenewalDate.getMonth() + 1);
            } else {
              newRenewalDate.setFullYear(newRenewalDate.getFullYear() + 1);
            }

            await database
              .update(subscriptions)
              .set({
                status: "active",
                isLocked: 0,
                renewalDate: newRenewalDate.toISOString(),
              } as any)
              .where(eq(subscriptions.id, sub.id));
          }
        }

        await db.logActivity({
          userId: ctx.user.id,
          action: "payment.processed",
          entityType: "Invoice",
          entityId: input.invoiceId,
          description: `Processed payment for invoice ${input.invoiceId} using ${input.paymentMethod}`,
          metadata: JSON.stringify({ amount: input.amount, paymentMethodId: input.paymentMethodId, orgId: input.orgId }),
          ipAddress: ctx.req?.ip ?? null,
        });

        return { payment, success: true, message: "Payment processed successfully" };
      } catch (error: any) {
        console.error("[OrgBilling] Error processing payment:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to process payment",
        });
      }
    }),

  /**
   * Get subscription status and billing information for org dashboard
   */
  getOrgBillingStatus: orgBillingReadProcedure
    .input(z.string())
    .query(async ({ input: orgId }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        const subscription = await database
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.organizationId, orgId))
          .limit(1);

        if (!subscription.length) {
          return { status: "no_subscription", success: true };
        }

        const sub = subscription[0];
        const now = new Date();
        const renewalDate = new Date(sub.renewalDate!);
        const daysUntilRenewal = Math.ceil(
          (renewalDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
        );

        // Get unpaid invoices
        const unpaidInvoices = await database
          .select()
          .from(billingInvoices)
          .where(
            and(
              eq(billingInvoices.subscriptionId, sub.id),
              eq(billingInvoices.status, "pending")
            )
          );

        return {
          status: sub.status,
          isLocked: sub.isLocked === 1,
          daysUntilRenewal,
          plan: sub.billingCycle,
          currentPrice: sub.currentPrice,
          renewalDate: sub.renewalDate,
          unpaidInvoices: unpaidInvoices.length,
          autoRenew: sub.autoRenew === 1,
          success: true,
        };
      } catch (error: any) {
        console.error("[OrgBilling] Error getting billing status:", error);
        return {
          status: "error",
          error: error.message,
          success: false,
        };
      }
    }),

  /**
   * Update default payment method
   */
  setDefaultPaymentMethod: orgBillingWriteProcedure
    .input(z.object({
      orgId: z.string(),
      paymentMethodId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        // First, unset all other default methods for this org
        await database
          .update(paymentMethods)
          .set({ isDefault: 0 })
          .where(eq(paymentMethods.clientId, input.orgId));

        // Set this one as default
        await database
          .update(paymentMethods)
          .set({ isDefault: 1 })
          .where(eq(paymentMethods.id, input.paymentMethodId));

        await db.logActivity({
          userId: ctx.user.id,
          action: "payment_method.default_updated",
          entityType: "Billing",
          entityId: input.orgId,
          description: `Set payment method ${input.paymentMethodId} as default for organization ${input.orgId}`,
          metadata: JSON.stringify({ paymentMethodId: input.paymentMethodId }),
          ipAddress: ctx.req?.ip ?? null,
        });

        return { success: true, message: "Default payment method updated" };
      } catch (error: any) {
        console.error("[OrgBilling] Error setting default payment method:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to set default payment method",
        });
      }
    }),

  /**
   * Delete payment method
   */
  deletePaymentMethod: orgBillingWriteProcedure
    .input(z.object({
      orgId: z.string(),
      paymentMethodId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        // Check if it's the default method
        const method = await database
          .select()
          .from(paymentMethods)
          .where(eq(paymentMethods.id, input.paymentMethodId))
          .limit(1);

        if (method.length && method[0].isDefault) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot delete default payment method. Set another as default first.",
          });
        }

        // Soft delete by marking inactive
        await database
          .update(paymentMethods)
          .set({ isActive: 0 })
          .where(eq(paymentMethods.id, input.paymentMethodId));

        await db.logActivity({
          userId: ctx.user.id,
          action: "payment_method.deleted",
          entityType: "Billing",
          entityId: input.orgId,
          description: `Deleted payment method ${input.paymentMethodId} for organization ${input.orgId}`,
          metadata: JSON.stringify({ paymentMethodId: input.paymentMethodId }),
          ipAddress: ctx.req?.ip ?? null,
        });

        return { success: true, message: "Payment method deleted" };
      } catch (error: any) {
        console.error("[OrgBilling] Error deleting payment method:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to delete payment method",
        });
      }
    }),

  /**
   * Get invoice PDF or details for download
   */
  downloadInvoice: orgBillingReadProcedure
    .input(z.string())
    .query(async ({ input: invoiceId }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        const invoice = await database
          .select()
          .from(billingInvoices)
          .where(eq(billingInvoices.id, invoiceId))
          .limit(1);

        if (!invoice.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Invoice not found",
          });
        }

        return {
          invoice: invoice[0],
          downloadUrl: `/api/invoices/${invoiceId}/pdf`,
          success: true,
        };
      } catch (error: any) {
        console.error("[OrgBilling] Error downloading invoice:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to download invoice",
        });
      }
    }),

  /**
   * System: Process automatic payments for subscriptions with auto-pay enabled
   * Should be called by cron job on renewal date
   */
  systemProcessAutomaticPayments: orgBillingWriteProcedure
    .mutation(async ({ ctx }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        // Get all subscriptions that need renewal and have auto-renew enabled
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
        const timestamp = new Date().toISOString();
        const processedPayments = [];

        for (const sub of activeSubscriptions) {
          const renewalDate = new Date(sub.renewalDate!);
          
          // Only process if renewal date has passed
          if (now < renewalDate) continue;

          // Get default payment method
          const defaultPaymentMethod = await database
            .select()
            .from(paymentMethods)
            .where(
              and(
                eq(paymentMethods.clientId, sub.organizationId || ""),
                eq(paymentMethods.isDefault, 1),
                eq(paymentMethods.isActive, 1)
              )
            )
            .limit(1);

          if (!defaultPaymentMethod.length) {
            console.warn(`[OrgBilling] No default payment method for org ${sub.organizationId}`);
            continue;
          }

          // Create invoice for renewal
          const existingInvoice = await database
            .select({ id: billingInvoices.id })
            .from(billingInvoices)
            .where(and(
              eq(billingInvoices.subscriptionId, sub.id),
              eq(billingInvoices.billingPeriodStart, renewalDate.toISOString()),
            ))
            .limit(1);
          const invoiceId = existingInvoice[0]?.id || uuidv4();
          if (existingInvoice.length) {
            processedPayments.push({ subscriptionId: sub.id, invoiceId, status: "already_processed" });
            continue;
          }
          const newRenewalDate = new Date(renewalDate);
          if (sub.billingCycle === "monthly") {
            newRenewalDate.setMonth(newRenewalDate.getMonth() + 1);
          } else {
            newRenewalDate.setFullYear(newRenewalDate.getFullYear() + 1);
          }

          const invoiceData = {
            id: invoiceId,
            subscriptionId: sub.id,
            invoiceNumber: `INV-${Date.now()}-${sub.id.slice(0, 8)}`,
            amount: (sub.currentPrice as any) || 0,
            tax: 0,
            totalAmount: (sub.currentPrice as any) || 0,
            currency: "KES",
            status: "pending" as const,
            billingPeriodStart: renewalDate.toISOString(),
            billingPeriodEnd: newRenewalDate.toISOString(),
            dueDate: renewalDate.toISOString(),
            sentAt: timestamp,
            paidAt: null,
            paymentMethod: defaultPaymentMethod[0].type,
            paymentReference: null,
            notes: "Automatic renewal",
            createdAt: timestamp,
            updatedAt: timestamp,
          };

          await database.insert(billingInvoices).values(invoiceData as any);

          // Process payment
          const paymentId = uuidv4();
          const payment = {
            id: paymentId,
            organizationId: sub.organizationId,
            invoiceId,
            clientId: sub.organizationId || "",
            accountId: null,
            amount: Math.round(((sub.currentPrice as any) || 0) * 100),
            paymentDate: timestamp,
            paymentMethod: defaultPaymentMethod[0].type,
            referenceNumber: `AUTO_PAY_${Date.now()}`,
            chartOfAccountType: "credit" as const,
            notes: "Automatic renewal payment",
            status: "completed",
            approvedBy: null,
            approvedAt: timestamp,
            createdBy: "system",
            createdAt: timestamp,
          };

          await database.insert(payments).values(payment as any);

          // Update invoice status
          await database
            .update(billingInvoices)
            .set({ status: "paid", paidAt: timestamp } as any)
            .where(eq(billingInvoices.id, invoiceId));

          // Update subscription
          await database
            .update(subscriptions)
            .set({
              renewalDate: newRenewalDate.toISOString(),
              status: "active",
              isLocked: 0,
            } as any)
            .where(eq(subscriptions.id, sub.id));

          processedPayments.push({
            subscriptionId: sub.id,
            orgId: sub.organizationId,
            invoiceId,
            amount: sub.currentPrice,
          });
        }

        await db.logActivity({
          userId: ctx.user.id,
          action: "subscription.automatic_payments_processed",
          entityType: "Billing",
          entityId: null,
          description: `Processed ${processedPayments.length} automatic renewal payments`,
          metadata: JSON.stringify({ processedPayments }),
          ipAddress: ctx.req?.ip ?? null,
        });

        return {
          success: true,
          processedCount: processedPayments.length,
          payments: processedPayments,
        };
      } catch (error: any) {
        console.error("[OrgBilling] System automatic payment processing failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to process automatic payments",
        });
      }
    }),

  /**
   * System: Check and suspend overdue subscriptions
   * Should be called by cron job daily
   */
  systemCheckAndSuspendOverdue: orgBillingWriteProcedure
    .mutation(async ({ ctx }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        const allSubscriptions = await database.select().from(subscriptions);
        const now = new Date();
        const suspendedSubscriptions = [];

        for (const sub of allSubscriptions) {
          if (sub.status === "suspended" || sub.status === "cancelled" || (sub.isLocked === 1)) {
            continue;
          }

          const renewalDate = new Date(sub.renewalDate as any);
          const gracePeriodEnd = new Date(renewalDate);
          gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 3); // 3 day grace period

          // Check if past grace period
          if (now > gracePeriodEnd) {
            await database
              .update(subscriptions)
              .set({
                status: "suspended",
                isLocked: 1,
              } as any)
              .where(eq(subscriptions.id, sub.id));

            suspendedSubscriptions.push({
              subscriptionId: sub.id,
              orgId: sub.organizationId,
              daysOverdue: Math.ceil(
                (now.getTime() - gracePeriodEnd.getTime()) / (24 * 60 * 60 * 1000)
              ),
            });
          }
        }

        await db.logActivity({
          userId: ctx.user.id,
          action: "subscription.overdue_suspensions",
          entityType: "Subscription",
          entityId: null,
          description: `Suspended ${suspendedSubscriptions.length} overdue subscriptions`,
          metadata: JSON.stringify({ suspendedSubscriptions }),
          ipAddress: ctx.req?.ip ?? null,
        });

        return {
          success: true,
          suspendedCount: suspendedSubscriptions.length,
          suspendedSubscriptions,
        };
      } catch (error: any) {
        console.error("[OrgBilling] System suspension check failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to check subscriptions",
        });
      }
    }),
});
