/**
 * Subscription Service Management
 * Handles subscription lifecycle: activation, suspension, resumption, termination
 * Manages feature access and service provisioning/deprovisioning
 */

import { v4 as uuidv4 } from "uuid";
import { getDb } from "../db";
import { subscriptions, dunningEvents } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export type SubscriptionStatus = "trial" | "active" | "suspended" | "cancelled" | "expired";
export type SuspensionReason = "payment_overdue" | "manual" | "abuse" | "other";

export interface SubscriptionStateChange {
  subscriptionId: string;
  previousStatus: SubscriptionStatus;
  newStatus: SubscriptionStatus;
  reason: string;
  triggeredBy: "system" | "manual" | "admin";
  metadata?: Record<string, any>;
}

/**
 * Suspend a subscription due to payment overdue
 * Prevents access to services but maintains data integrity
 */
export async function suspendSubscription(
  subscriptionId: string,
  organizationId: string,
  reason: SuspensionReason = "payment_overdue",
  metadata?: Record<string, any>
): Promise<{
  success: boolean;
  previousStatus: SubscriptionStatus;
  newStatus: SubscriptionStatus;
  message: string;
  error?: string;
}> {
  try {
    const db = await getDb();
    if (!db) {
      return {
        success: false,
        previousStatus: "active",
        newStatus: "active",
        message: "Database connection failed",
        error: "DB_CONNECTION_FAILED",
      };
    }

    // Get current subscription
    const sub = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, subscriptionId))
      .limit(1);

    if (!sub.length) {
      return {
        success: false,
        previousStatus: "active",
        newStatus: "active",
        message: `Subscription ${subscriptionId} not found`,
        error: "SUBSCRIPTION_NOT_FOUND",
      };
    }

    const currentSub = sub[0];

    // Don't suspend if already suspended or cancelled
    if (currentSub.status === "suspended" || currentSub.status === "cancelled") {
      return {
        success: false,
        previousStatus: currentSub.status as SubscriptionStatus,
        newStatus: currentSub.status as SubscriptionStatus,
        message: `Subscription is already ${currentSub.status}`,
        error: "INVALID_STATE_TRANSITION",
      };
    }

    // Update subscription status
    const updatedAt = new Date().toISOString();
    await db
      .update(subscriptions)
      .set({
        status: "suspended",
        isLocked: 1,
        updatedAt: updatedAt,
      })
      .where(eq(subscriptions.id, subscriptionId));

    // Record suspension event
    const eventId = uuidv4();
    await db.insert(dunningEvents).values({
      id: eventId,
      subscriptionId,
      organizationId,
      eventType: "subscription_suspended",
      details: {
        previousStatus: currentSub.status,
        suspensionReason: reason,
        timestamp: updatedAt,
        ...metadata,
      },
      triggeredBy: "system",
      createdAt: updatedAt,
      updatedAt: updatedAt,
    } as any);

    console.log(
      `[Subscription] ${subscriptionId} suspended - Reason: ${reason}`
    );

    // TODO: Trigger service pause logic
    // - Revoke API keys / tokens
    // - Disable feature access
    // - Pause automated jobs
    // - Notify organization admins

    return {
      success: true,
      previousStatus: currentSub.status as SubscriptionStatus,
      newStatus: "suspended",
      message: `Subscription suspended due to ${reason}`,
    };
  } catch (error) {
    console.error("[Subscription] Error suspending subscription:", error);
    return {
      success: false,
      previousStatus: "active",
      newStatus: "active",
      message: "Failed to suspend subscription",
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
    };
  }
}

/**
 * Resume a suspended subscription (typically after payment is received)
 */
export async function resumeSubscription(
  subscriptionId: string,
  organizationId: string,
  reason: string = "payment_received"
): Promise<{
  success: boolean;
  previousStatus: SubscriptionStatus;
  newStatus: SubscriptionStatus;
  message: string;
  error?: string;
}> {
  try {
    const db = await getDb();
    if (!db) {
      return {
        success: false,
        previousStatus: "suspended",
        newStatus: "suspended",
        message: "Database connection failed",
        error: "DB_CONNECTION_FAILED",
      };
    }

    // Get current subscription
    const sub = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, subscriptionId))
      .limit(1);

    if (!sub.length) {
      return {
        success: false,
        previousStatus: "suspended",
        newStatus: "suspended",
        message: `Subscription ${subscriptionId} not found`,
        error: "SUBSCRIPTION_NOT_FOUND",
      };
    }

    const currentSub = sub[0];

    // Only resume if suspended
    if (currentSub.status !== "suspended") {
      return {
        success: false,
        previousStatus: currentSub.status as SubscriptionStatus,
        newStatus: currentSub.status as SubscriptionStatus,
        message: `Cannot resume subscription with status: ${currentSub.status}`,
        error: "INVALID_STATE_TRANSITION",
      };
    }

    // Update subscription status back to active
    const updatedAt = new Date().toISOString();
    await db
      .update(subscriptions)
      .set({
        status: "active",
        isLocked: 0,
        updatedAt: updatedAt,
      })
      .where(eq(subscriptions.id, subscriptionId));

    // Record resumption event
    const eventId = uuidv4();
    await db.insert(dunningEvents).values({
      id: eventId,
      subscriptionId,
      organizationId,
      eventType: "payment_recovered",
      details: {
        previousStatus: "suspended",
        resumptionReason: reason,
        timestamp: updatedAt,
      },
      triggeredBy: "system",
      createdAt: updatedAt,
      updatedAt: updatedAt,
    } as any);

    console.log(`[Subscription] ${subscriptionId} resumed - Reason: ${reason}`);

    // TODO: Trigger service restoration logic
    // - Restore API keys / tokens
    // - Re-enable feature access
    // - Resume automated jobs
    // - Notify organization admins

    return {
      success: true,
      previousStatus: "suspended",
      newStatus: "active",
      message: `Subscription resumed - ${reason}`,
    };
  } catch (error) {
    console.error("[Subscription] Error resuming subscription:", error);
    return {
      success: false,
      previousStatus: "suspended",
      newStatus: "suspended",
      message: "Failed to resume subscription",
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
    };
  }
}

/**
 * Terminate a subscription permanently
 * Used after final dunning notice and grace period
 */
export async function terminateSubscription(
  subscriptionId: string,
  organizationId: string,
  reason: string = "payment_overdue_21_days"
): Promise<{
  success: boolean;
  previousStatus: SubscriptionStatus;
  newStatus: SubscriptionStatus;
  message: string;
  error?: string;
}> {
  try {
    const db = await getDb();
    if (!db) {
      return {
        success: false,
        previousStatus: "active",
        newStatus: "active",
        message: "Database connection failed",
        error: "DB_CONNECTION_FAILED",
      };
    }

    // Get current subscription
    const sub = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, subscriptionId))
      .limit(1);

    if (!sub.length) {
      return {
        success: false,
        previousStatus: "active",
        newStatus: "active",
        message: `Subscription ${subscriptionId} not found`,
        error: "SUBSCRIPTION_NOT_FOUND",
      };
    }

    const currentSub = sub[0];

    // Don't terminate if already cancelled
    if (currentSub.status === "cancelled") {
      return {
        success: false,
        previousStatus: "cancelled",
        newStatus: "cancelled",
        message: "Subscription is already cancelled",
        error: "INVALID_STATE_TRANSITION",
      };
    }

    // Update subscription status to cancelled
    const updatedAt = new Date().toISOString();
    await db
      .update(subscriptions)
      .set({
        status: "cancelled",
        expiryDate: updatedAt,
        updatedAt: updatedAt,
      })
      .where(eq(subscriptions.id, subscriptionId));

    // Record termination event
    const eventId = uuidv4();
    await db.insert(dunningEvents).values({
      id: eventId,
      subscriptionId,
      organizationId,
      eventType: "subscription_cancelled",
      details: {
        previousStatus: currentSub.status,
        terminationReason: reason,
        terminatedAt: updatedAt,
      },
      triggeredBy: "system",
      createdAt: updatedAt,
      updatedAt: updatedAt,
    } as any);

    console.log(`[Subscription] ${subscriptionId} terminated - Reason: ${reason}`);

    // TODO: Trigger service deprovisioning logic
    // - Revoke all API keys / tokens
    // - Disable all feature access
    // - Archive/backup data (based on retention policy)
    // - Notify organization admins
    // - Schedule data cleanup/deletion if applicable

    return {
      success: true,
      previousStatus: currentSub.status as SubscriptionStatus,
      newStatus: "cancelled",
      message: `Subscription terminated - ${reason}`,
    };
  } catch (error) {
    console.error("[Subscription] Error terminating subscription:", error);
    return {
      success: false,
      previousStatus: "active",
      newStatus: "active",
      message: "Failed to terminate subscription",
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
    };
  }
}

/**
 * Get subscription status details
 */
export async function getSubscriptionStatus(
  subscriptionId: string
): Promise<{
  subscriptionId: string;
  status: SubscriptionStatus;
  isActive: boolean;
  isSuspended: boolean;
  isTerminated: boolean;
  startDate: string;
  renewalDate: string;
  expiryDate?: string;
  gracePeriodEnd?: string;
  planId: string;
  error?: string;
}> {
  try {
    const db = await getDb();
    if (!db) {
      return {
        subscriptionId,
        status: "active",
        isActive: false,
        isSuspended: false,
        isTerminated: false,
        startDate: "",
        renewalDate: "",
        planId: "",
        error: "DB_CONNECTION_FAILED",
      };
    }

    const sub = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, subscriptionId))
      .limit(1);

    if (!sub.length) {
      return {
        subscriptionId,
        status: "active",
        isActive: false,
        isSuspended: false,
        isTerminated: false,
        startDate: "",
        renewalDate: "",
        planId: "",
        error: "SUBSCRIPTION_NOT_FOUND",
      };
    }

    const s = sub[0];
    return {
      subscriptionId,
      status: s.status as SubscriptionStatus,
      isActive: s.status === "active" || s.status === "trial",
      isSuspended: s.status === "suspended",
      isTerminated: s.status === "cancelled" || s.status === "expired",
      startDate: s.startDate,
      renewalDate: s.renewalDate,
      expiryDate: s.expiryDate || undefined,
      gracePeriodEnd: s.gracePeriodEnd || undefined,
      planId: s.planId,
    };
  } catch (error) {
    console.error("[Subscription] Error getting status:", error);
    return {
      subscriptionId,
      status: "active",
      isActive: false,
      isSuspended: false,
      isTerminated: false,
      startDate: "",
      renewalDate: "",
      planId: "",
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
    };
  }
}
