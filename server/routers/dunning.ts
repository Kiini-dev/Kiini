/**
 * Dunning Management Router
 * Handles payment retry logic, policies, and subscription lifecycle management
 * Integrates with dunning schedule service for payment reminders
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import * as db from "../db";
import { v4 as uuidv4 } from "uuid";
import {
  processDunningForInvoice,
  processDunningForSubscription,
  processDunningForOrganization,
  getDunningStatus as getDunningStatusFromProcessor,
} from "../services/dunningEventProcessor";
import {
  suspendSubscription,
  resumeSubscription,
  terminateSubscription,
} from "../services/subscriptionServiceManagement";
import {
  getDaysDueDate,
  shouldSuspendService,
  shouldTerminateSubscription,
} from "../services/dunningScheduleService";
import { processDunningNotifications, processDunningForInvoiceManual } from "../services/dunningCronJob";

const billingReadProcedure = createFeatureRestrictedProcedure("billing:read");
const billingWriteProcedure = createFeatureRestrictedProcedure("billing:edit");

export const dunningRouter = router({
  /**
   * Create a dunning policy
   */
  createPolicy: billingWriteProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      maxRetries: z.number().int().min(1).max(10).default(3),
      retryIntervalDays: z.number().int().min(1).default(3),
      finalRetryDays: z.number().int().min(1).default(14),
      suspendAfterDays: z.number().int().min(1).default(21),
      cancelAfterDays: z.number().int().min(1).default(30),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const policyId = uuidv4();
        const policy = {
          id: policyId,
          organizationId: ctx.user?.organizationId || ctx.user?.id,
          name: input.name,
          description: input.description,
          maxRetries: input.maxRetries,
          retryIntervalDays: input.retryIntervalDays,
          finalRetryDays: input.finalRetryDays,
          suspendAfterDays: input.suspendAfterDays,
          cancelAfterDays: input.cancelAfterDays,
          isActive: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        const savedPolicy = await db.createDunningPolicy(policy);
        
        return { policy: savedPolicy, success: true };
      } catch (error) {
        console.error("[Dunning] Error creating policy:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create dunning policy',
        });
      }
    }),

  // ===== NEW DUNNING SCHEDULE-BASED PROCEDURES =====

        /**
         * Process dunning for a single invoice
         * Sends notifications and manages service suspension/termination
         */
        processInvoiceDunning: billingWriteProcedure
          .input(z.object({
            invoiceId: z.string(),
            organizationId: z.string(),
            isMultiTenant: z.boolean().optional(),
          }))
          .mutation(async ({ input, ctx }) => {
            try {
              const result = await processDunningForInvoice(
                input.invoiceId,
                input.organizationId,
                { isMultiTenant: input.isMultiTenant }
              );

              return {
                success: result.success,
                noticesSent: result.noticesSent,
                suspensionApplied: result.suspensionApplied,
                terminationApplied: result.terminationApplied,
                events: result.events,
                errors: result.errors,
              };
            } catch (error) {
              console.error("[Dunning Router] Error processing invoice:", error);
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to process invoice dunning",
              });
            }
          }),

        /**
         * Process dunning for a subscription (all related invoices)
         */
        processSubscriptionDunning: billingWriteProcedure
          .input(z.object({
            subscriptionId: z.string(),
            organizationId: z.string(),
            isMultiTenant: z.boolean().optional(),
          }))
          .mutation(async ({ input, ctx }) => {
            try {
              const result = await processDunningForSubscription(
                input.subscriptionId,
                input.organizationId,
                { isMultiTenant: input.isMultiTenant }
              );

              return {
                success: result.success,
                noticesSent: result.noticesSent,
                suspensionApplied: result.suspensionApplied,
                terminationApplied: result.terminationApplied,
                events: result.events,
                errors: result.errors,
              };
            } catch (error) {
              console.error("[Dunning Router] Error processing subscription:", error);
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to process subscription dunning",
              });
            }
          }),

        /**
         * Get dunning status for a subscription
         */
        getDunningStatus: billingReadProcedure
          .input(z.object({
            subscriptionId: z.string(),
            organizationId: z.string(),
          }))
          .query(async ({ input, ctx }) => {
            try {
              const status = await getDunningStatusFromProcessor(
                input.subscriptionId,
                input.organizationId
              );

              return {
                success: true,
                status,
              };
            } catch (error) {
              console.error("[Dunning Router] Error getting dunning status:", error);
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to get dunning status",
              });
            }
          }),

        /**
         * Suspend subscription due to payment overdue
         */
        suspendForOverdue: billingWriteProcedure
          .input(z.object({
            subscriptionId: z.string(),
            organizationId: z.string(),
            reason: z.enum(["payment_overdue", "manual", "abuse", "other"]).default("payment_overdue"),
          }))
          .mutation(async ({ input, ctx }) => {
            try {
              const result = await suspendSubscription(
                input.subscriptionId,
                input.organizationId,
                input.reason
              );

              return {
                success: result.success,
                previousStatus: result.previousStatus,
                newStatus: result.newStatus,
                message: result.message,
                error: result.error,
              };
            } catch (error) {
              console.error("[Dunning Router] Error suspending subscription:", error);
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to suspend subscription",
              });
            }
          }),

        /**
         * Resume a suspended subscription (after payment received)
         */
        resumeAfterPayment: billingWriteProcedure
          .input(z.object({
            subscriptionId: z.string(),
            organizationId: z.string(),
            reason: z.string().default("payment_received"),
          }))
          .mutation(async ({ input, ctx }) => {
            try {
              const result = await resumeSubscription(
                input.subscriptionId,
                input.organizationId,
                input.reason
              );

              return {
                success: result.success,
                previousStatus: result.previousStatus,
                newStatus: result.newStatus,
                message: result.message,
                error: result.error,
              };
            } catch (error) {
              console.error("[Dunning Router] Error resuming subscription:", error);
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to resume subscription",
              });
            }
          }),

        /**
         * Terminate subscription (final action after max overdue days)
         */
        terminateForNonPayment: billingWriteProcedure
          .input(z.object({
            subscriptionId: z.string(),
            organizationId: z.string(),
            reason: z.string().default("payment_overdue_21_days"),
          }))
          .mutation(async ({ input, ctx }) => {
            try {
              const result = await terminateSubscription(
                input.subscriptionId,
                input.organizationId,
                input.reason
              );

              return {
                success: result.success,
                previousStatus: result.previousStatus,
                newStatus: result.newStatus,
                message: result.message,
                error: result.error,
              };
            } catch (error) {
              console.error("[Dunning Router] Error terminating subscription:", error);
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to terminate subscription",
              });
            }
          }),

        /**
         * Process all dunning notifications for an organization
         * Admin/ICT Manager only - triggers the full dunning workflow
         */
        processOrganizationDunning: adminProcedure
          .input(z.object({
            organizationId: z.string(),
            isMultiTenant: z.boolean().optional(),
          }))
          .mutation(async ({ input, ctx }) => {
            try {
              const result = await processDunningForOrganization(
                input.organizationId,
                { isMultiTenant: input.isMultiTenant }
              );

              return {
                success: result.success,
                processedInvoices: result.processedInvoices,
                totalNoticesSent: result.totalNoticesSent,
                totalSuspensions: result.totalSuspensions,
                totalTerminations: result.totalTerminations,
                errors: result.errors,
              };
            } catch (error) {
              console.error("[Dunning Router] Error processing organization dunning:", error);
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to process organization dunning",
              });
            }
          }),

        /**
         * Trigger dunning notifications job manually
         * Admin/ICT Manager only - for testing or manual intervention
         */
        runDunningJob: adminProcedure
          .input(z.object({
            organizationId: z.string().optional(),
          }))
          .mutation(async ({ input, ctx }) => {
            try {
              const result = await processDunningNotifications({
                organizationId: input.organizationId,
              });

              return {
                success: result.success,
                startTime: result.startTime,
                endTime: result.endTime,
                durationMs: result.durationMs,
                organizationsProcessed: result.organizationsProcessed,
                totalInvoicesProcessed: result.totalInvoicesProcessed,
                totalNoticesSent: result.totalNoticesSent,
                totalSuspensions: result.totalSuspensions,
                totalTerminations: result.totalTerminations,
                errors: result.errors,
              };
            } catch (error) {
              console.error("[Dunning Router] Error running dunning job:", error);
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to run dunning job",
              });
            }
          }),

  /**
   * Get all dunning policies for organization
   */
  getPolicies: billingReadProcedure.query(async ({ ctx }) => {
    try {
      const policies = await db.getDunningPolicies(ctx.user?.organizationId || ctx.user?.id);
      return { policies, success: true };
    } catch (error) {
      console.error("[Dunning] Error fetching policies:", error);
      return { policies: [], success: false };
    }
  }),

  /**
   * Record a payment retry attempt
   */
  recordRetryAttempt: billingWriteProcedure
    .input(z.object({
      invoiceId: z.string(),
      subscriptionId: z.string(),
      paymentMethod: z.string().optional(),
      failureReason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const retryId = uuidv4();
        const retry = {
          id: retryId,
          invoiceId: input.invoiceId,
          subscriptionId: input.subscriptionId,
          attemptNumber: 1,
          status: 'pending' as const,
          failureReason: input.failureReason,
          paymentMethod: input.paymentMethod,
          attemptedAt: null,
          nextRetryAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          metadata: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const savedRetry = await db.recordPaymentRetry(retry);

        const event = {
          id: uuidv4(),
          subscriptionId: input.subscriptionId,
          invoiceId: input.invoiceId,
          eventType: 'retry_scheduled' as const,
          details: { retryId, attemptNumber: 1 },
          triggeredBy: 'system',
          createdAt: new Date().toISOString(),
        };

        await db.logDunningEvent(event);

        return { retry: savedRetry, success: true };
      } catch (error) {
        console.error("[Dunning] Error recording retry:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to record payment retry',
        });
      }
    }),

  /**
   * Get retry history for invoice
   */
  getRetryHistory: billingReadProcedure
    .input(z.object({ invoiceId: z.string() }))
    .query(async ({ input }) => {
      try {
        const retries = await db.getRetryHistory(input.invoiceId);
        const latestAttempt = retries[0] || null;

        return {
          retries,
          totalAttempts: retries.length,
          lastAttemptAt: latestAttempt?.attemptedAt || null,
          nextRetryAt: latestAttempt?.nextRetryAt || null,
          success: true,
        };
      } catch (error) {
        console.error("[Dunning] Error fetching retry history:", error);
        return { retries: [], totalAttempts: 0, lastAttemptAt: null, nextRetryAt: null, success: false };
      }
    }),

  /**
   * Get dunning status for subscription
   */
  getStatus: billingReadProcedure
    .input(z.object({ subscriptionId: z.string() }))
    .query(async ({ input }) => {
      try {
        const status = await db.getDunningStatus(input.subscriptionId);
        return { status: status || {
          subscriptionId: input.subscriptionId,
          isDunning: false,
          overdueDays: 0,
          retryCount: 0,
          nextRetryAt: null,
          dunningPhase: 'none' as const,
          events: [],
        }, success: true };
      } catch (error) {
        console.error("[Dunning] Error fetching dunning status:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch dunning status',
        });
      }
    }),

  /**
   * Execute dunning workflow (automatic retry scheduler)
   */
  executeDunningWorkflow: billingWriteProcedure
    .input(z.object({
      subscriptionId: z.string(),
      policyId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const workflowId = uuidv4();
        const status = await db.getDunningStatus(input.subscriptionId);
        const policy = input.policyId
          ? await db.getDunningPolicy(input.policyId)
          : await db.getActiveDunningPolicy(ctx.user?.organizationId || ctx.user?.id);

        if (!policy) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'No active dunning policy found',
          });
        }

        const now = new Date();
        const nextRetryAt = status?.nextRetryAt
          ? new Date(status.nextRetryAt)
          : new Date(now.getTime() + policy.retryIntervalDays * 24 * 60 * 60 * 1000);

        const event = {
          id: uuidv4(),
          subscriptionId: input.subscriptionId,
          invoiceId: status?.events?.[0]?.invoiceId || null,
          eventType: 'retry_scheduled' as const,
          details: {
            policyId: policy.id,
            nextRetryAt: nextRetryAt.toISOString(),
            retryCount: status?.retryCount ?? 0,
          },
          triggeredBy: 'system',
          createdAt: new Date().toISOString(),
        };

        await db.logDunningEvent(event);

        const result = {
          workflowId,
          status: 'scheduled' as const,
          actionsScheduled: 1,
          nextAction: `Retry scheduled for ${nextRetryAt.toISOString()}`,
        };

        return { result, success: true };
      } catch (error) {
        console.error("[Dunning] Error executing workflow:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to execute dunning workflow',
        });
      }
    }),

  /**
   * Recover payment for subscription (manual intervention)
   */
  recoverPayment: billingWriteProcedure
    .input(z.object({
      subscriptionId: z.string(),
      invoiceId: z.string(),
      method: z.enum(['email', 'manual', 'retry_now']),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // TODO: Process payment recovery based on method
        // 1. If retry_now: trigger immediate payment attempt
        // 2. If email: send recovery email
        // 3. If manual: mark for manual processing

        const event = {
          id: uuidv4(),
          subscriptionId: input.subscriptionId,
          invoiceId: input.invoiceId,
          eventType: 'payment_recovered' as const,
          details: { method: input.method, recoveredBy: ctx.user?.id },
          triggeredBy: ctx.user?.id,
          createdAt: new Date().toISOString(),
        };

        await db.logDunningEvent(event);

        return {
          success: true,
          message: `Payment recovery initiated via ${input.method}`,
        };
      } catch (error) {
        console.error("[Dunning] Error recovering payment:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to recover payment',
        });
      }
    }),

  /**
   * Suspend subscription due to non-payment
   */
  suspendSubscription: billingWriteProcedure
    .input(z.object({
      subscriptionId: z.string(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const updated = await db.updateSubscription(input.subscriptionId, {
          status: 'suspended',
          updatedAt: new Date().toISOString(),
        });

        const event = {
          id: uuidv4(),
          subscriptionId: input.subscriptionId,
          eventType: 'subscription_suspended' as const,
          details: { reason: input.reason || 'Non-payment' },
          triggeredBy: ctx.user?.id,
          createdAt: new Date().toISOString(),
        };

        await db.logDunningEvent(event);

        return {
          success: true,
          message: 'Subscription suspended',
          subscription: updated,
        };
      } catch (error) {
        console.error("[Dunning] Error suspending subscription:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to suspend subscription',
        });
      }
    }),

  /**
   * Cancel subscription due to non-payment
   */
  cancelSubscription: billingWriteProcedure
    .input(z.object({
      subscriptionId: z.string(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const updated = await db.updateSubscription(input.subscriptionId, {
          status: 'cancelled',
          updatedAt: new Date().toISOString(),
        });

        const event = {
          id: uuidv4(),
          subscriptionId: input.subscriptionId,
          eventType: 'subscription_cancelled' as const,
          details: { reason: input.reason || 'Non-payment' },
          triggeredBy: ctx.user?.id,
          createdAt: new Date().toISOString(),
        };

        await db.logDunningEvent(event);

        return {
          success: true,
          message: 'Subscription cancelled',
          subscription: updated,
        };
      } catch (error) {
        console.error("[Dunning] Error cancelling subscription:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to cancel subscription',
        });
      }
    }),

  /**
   * Get dunning events audit log
   */
  getEventLog: billingReadProcedure
    .input(z.object({
      subscriptionId: z.string().optional(),
      limit: z.number().int().default(20),
      offset: z.number().int().default(0),
    }))
    .query(async ({ input }) => {
      try {
        const events = await db.getDunningEvents(input.subscriptionId || '', input.limit, input.offset);
        const total = events.length;

        return {
          events,
          total,
          limit: input.limit,
          offset: input.offset,
          success: true,
        };
      } catch (error) {
        console.error("[Dunning] Error fetching event log:", error);
        return { events: [], total: 0, limit: input.limit, offset: input.offset, success: false };
      }
    }),
});
