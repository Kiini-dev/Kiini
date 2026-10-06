/**
 * Stripe Webhook Handlers
 * Handles payment events from Stripe: succeeded, failed, disputed, etc.
 * Integrates with organization subscription and payment procedures
 */

import { getDb } from "../db";
import { resumeSubscription } from "../services/subscriptionServiceManagement";
import { sql } from "drizzle-orm";
import Stripe from "stripe";
import { Router, Request, Response } from "express";
import { invoices, organizations, subscriptions, auditLogs, paymentRetries } from "../../drizzle/schema";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-04-10" });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export const stripeWebhookRouter = Router();

/**
 * Verify Stripe webhook signature
 */
function verifyStripeWebhookSignature(req: Request, webhookSecret: string): Stripe.Event | null {
  const sig = req.headers["stripe-signature"] as string;
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      sig,
      webhookSecret
    );
    return event;
  } catch (err: any) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return null;
  }
}

/**
 * Handle successful payment (payment_intent.succeeded)
 * Updates invoice status and organization subscription
 */
async function handlePaymentSucceeded(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const db = await getDb() as any;
  
  if (!db) {
    console.error("❌ Database connection unavailable");
    return;
  }

  try {
    const invoiceId = paymentIntent.metadata?.invoiceId;
    const organizationId = paymentIntent.metadata?.organizationId;

    if (!invoiceId || !organizationId) {
      console.warn("⚠️ Payment succeeded but missing invoiceId or organizationId in metadata");
      return;
    }

    // Update the invoice status to 'paid'
    await db.execute(
      sql`UPDATE invoices SET status = 'paid', paymentDate = NOW() WHERE id = ${invoiceId}`
    );

    const paidSubscription = await db.query.subscriptions.findFirst({
      where: (sub: any, { eq }: any) => eq(sub.organizationId, organizationId),
    });
    if (paidSubscription) {
      await resumeSubscription(paidSubscription.id, organizationId);
    }

    // Create audit log entry
    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      userId: "stripe-webhook",
      action: "payment_received",
      resourceType: "invoice",
      resourceId: String(invoiceId),
      changes: JSON.stringify({
        stripePaymentIntentId: paymentIntent.id,
        chargeId: (paymentIntent as any).charges?.data?.[0]?.id,
        amount: paymentIntent.amount / 100,
      }),
      ipAddress: "stripe",
      userAgent: "Stripe Webhook",
      createdAt: new Date().toISOString(),
    });

    console.log(`✅ Payment succeeded for invoice ${invoiceId}`);

    // Check if this is a trial conversion or subscription renewal
    const subscriptionData = await db.query.subscriptions.findFirst({
      where: (sub: any, { eq }: any) => eq(sub.organizationId, organizationId),
    });

    if (subscriptionData?.expiryDate && new Date(subscriptionData.expiryDate) > new Date()) {
      // Trial converted to paid - clear trial date
      await db.execute(
        sql`UPDATE subscriptions 
            SET status = 'active',
                renewalDate = DATE_ADD(NOW(), INTERVAL 1 MONTH),
                updatedAt = NOW()
            WHERE organizationId = ${organizationId}`
      );

      console.log(`✅ Trial converted to paid for organization ${organizationId}`);
    }

  } catch (error) {
    console.error("❌ Error handling payment_intent.succeeded:", error);
  }
}

/**
 * Handle failed payment (payment_intent.payment_failed)
 * Creates reminder alert and schedules retry
 */
async function handlePaymentFailed(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const db = await getDb() as any;

  if (!db) {
    console.error("❌ Database connection unavailable");
    return;
  }

  try {
    const invoiceId = paymentIntent.metadata?.invoiceId;
    const organizationId = paymentIntent.metadata?.organizationId;

    if (!invoiceId || !organizationId) {
      console.warn("⚠️ Payment failed but missing metadata");
      return;
    }

    // Create payment trigger for retry (schedule for 3 days later)
    const retryDate = new Date();
    retryDate.setDate(retryDate.getDate() + 3);

    const subscriptionData = await db.query.subscriptions.findFirst({
      where: (sub: any, { eq }: any) => eq(sub.organizationId, organizationId),
    });

    await db.insert(paymentRetries).values({
      id: crypto.randomUUID(),
      invoiceId: String(invoiceId),
      subscriptionId: subscriptionData?.id ?? "system",
      attemptNumber: (paymentIntent as any).charges?.data?.[0]?.payment_error_codes?.length || 1,
      status: "pending",
      failureReason: paymentIntent.last_payment_error?.message,
      paymentMethod: "card",
      attemptedAt: new Date().toISOString(),
      nextRetryAt: retryDate.toISOString(),
      metadata: JSON.stringify({
        failureReason: paymentIntent.last_payment_error?.message,
        stripePaymentIntentId: paymentIntent.id,
        chargeId: (paymentIntent as any).charges?.data?.[0]?.id,
      }),
    });

    // Create audit log
    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      userId: "stripe-webhook",
      action: "payment_failed",
      resourceType: "invoice",
      resourceId: String(invoiceId),
      changes: JSON.stringify({
        reason: paymentIntent.last_payment_error?.message,
        stripePaymentIntentId: paymentIntent.id,
      }),
      ipAddress: "stripe",
      userAgent: "Stripe Webhook",
      createdAt: new Date().toISOString(),
    });

    console.log(`⚠️ Payment failed for invoice ${invoiceId}, retry scheduled for ${retryDate.toISOString()}`);

  } catch (error) {
    console.error("❌ Error handling payment_intent.payment_failed:", error);
  }
}

/**
 * Handle charge dispute (charge.dispute.created)
 * Escalates to super admin for manual review
 */
async function handleChargeDispute(event: Stripe.Event) {
  const dispute = event.data.object as Stripe.Dispute;
  const db = await getDb() as any;

  if (!db) {
    console.error("❌ Database connection unavailable");
    return;
  }

  try {
    const organizationId = dispute.metadata?.organizationId;
    const chargeId = dispute.charge as string;

    if (organizationId) {
      // Create high-priority audit log for manual review
      await db.insert(auditLogs).values({
        id: crypto.randomUUID(),
        userId: "stripe-webhook",
        action: "payment_disputed",
        resourceType: "charge",
        resourceId: chargeId,
        changes: JSON.stringify({
          disputeId: dispute.id,
          reason: dispute.reason,
          amount: dispute.amount,
          evidence_due_by: (dispute as any).evidence_due_by,
        }),
        ipAddress: "stripe",
        userAgent: "Stripe Webhook",
        createdAt: new Date().toISOString(),
      });

      console.log(`🚨 Charge dispute created: ${dispute.id} for organization ${organizationId}`);
    }

  } catch (error) {
    console.error("❌ Error handling charge.dispute.created:", error);
  }
}

/**
 * Handle customer subscription update (customer.subscription.updated)
 * Syncs Stripe subscription changes with our database
 */
async function handleSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const db = await getDb() as any;

  if (!db) {
    console.error("❌ Database connection unavailable");
    return;
  }

  try {
    const organizationId = subscription.metadata?.organizationId;

    if (!organizationId) {
      console.warn("⚠️ Subscription updated but missing organizationId in metadata");
      return;
    }

    const nextBillingDate = new Date(subscription.current_period_end * 1000);
    const status = subscription.status; // active, past_due, canceled, unpaid

    await db.execute(
      sql`UPDATE subscriptions 
          SET status = ${status},
              renewalDate = ${nextBillingDate},
              updatedAt = NOW()
          WHERE organizationId = ${organizationId}`
    );

    // Create audit log
    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      userId: "stripe-webhook",
      action: "subscription_updated",
      resourceType: "subscription",
      resourceId: subscription.id,
      changes: JSON.stringify({
        stripeStatus: status,
        nextBillingDate: nextBillingDate.toISOString(),
      }),
      ipAddress: "stripe",
      userAgent: "Stripe Webhook",
      createdAt: new Date().toISOString(),
    });

    console.log(`✅ Subscription updated for organization ${organizationId}: ${status}`);

  } catch (error) {
    console.error("❌ Error handling customer.subscription.updated:", error);
  }
}

/**
 * Main webhook handler endpoint
 */
stripeWebhookRouter.post("/stripe", (req: Request, res: Response) => {
  // Parse raw body for signature verification
  let event: Stripe.Event | null = null;

  if (typeof req.body === "string") {
    event = verifyStripeWebhookSignature(req, webhookSecret);
  }

  if (!event) {
    res.status(400).json({ error: "Invalid webhook signature" });
    return;
  }

  console.log(`📨 Received Stripe webhook event: ${event.type}`);

  // Route to appropriate handler
  switch (event.type) {
    case "payment_intent.succeeded":
      handlePaymentSucceeded(event);
      break;
    case "payment_intent.payment_failed":
      handlePaymentFailed(event);
      break;
    case "charge.dispute.created":
      handleChargeDispute(event);
      break;
    case "customer.subscription.updated":
      handleSubscriptionUpdated(event);
      break;
    case "charge.refunded":
      console.log("📝 Charge refunded - logging for audit");
      break;
    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }

  // Always return 200 to acknowledge receipt
  res.status(200).json({ received: true, eventId: event.id });
});

export default stripeWebhookRouter;
