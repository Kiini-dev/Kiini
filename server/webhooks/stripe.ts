import Stripe from 'stripe';
import { db } from '../db';
import { invoices, paymentMethods, subscriptions, organizations } from '../../drizzle/schema';
import { and, eq } from 'drizzle-orm';
import { logger } from '../_core/logger';
import { sendEmail } from '../_core/mail';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10',
});

/**
 * Stripe Webhook Handler
 * Processes payment events from Stripe
 * Events: payment_intent.succeeded, payment_intent.payment_failed, charge.refunded
 */
export async function handleStripeWebhook(
  event: Stripe.Event
): Promise<{ received: boolean; processed: boolean; error?: string }> {
  try {
    logger.info(`[Stripe] Processing event: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded':
        return await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);

      case 'payment_intent.payment_failed':
        return await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);

      case 'charge.refunded':
        return await handleChargeRefunded(event.data.object as Stripe.Charge);

      case 'customer.subscription.updated':
        return await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);

      case 'customer.subscription.deleted':
        return await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);

      default:
        logger.info(`[Stripe] Unhandled event type: ${event.type}`);
        return { received: true, processed: false };
    }
  } catch (error) {
    logger.error('[Stripe] Webhook error:', error);
    return {
      received: true,
      processed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const invoiceId = paymentIntent.metadata?.invoiceId;
    const organizationId = paymentIntent.metadata?.organizationId;

    if (!invoiceId || !organizationId) {
      logger.warn('[Stripe] Missing metadata in payment intent', { paymentIntent });
      return { received: true, processed: false, error: 'Missing metadata' };
    }

    // Update invoice status to paid
    const invoice = await db
      .update(invoices)
      .set({
        status: 'paid',
        paidDate: new Date(),
        paymentMethod: 'stripe',
        stripePaymentIntentId: paymentIntent.id,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, invoiceId));

    // Update subscription renewal date and next billing date
    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.organizationId, organizationId),
    });

    if (subscription) {
      const nextBillingDate = new Date();
      nextBillingDate.setMonth(nextBillingDate.getMonth() + (subscription.billingCycleMonths || 1));

      await db
        .update(subscriptions)
        .set({
          renewalDate: nextBillingDate.toISOString().replace('T', ' ').substring(0, 19),
          nextBillingDate: nextBillingDate.toISOString().replace('T', ' ').substring(0, 19),
          autoRenewEnabled: 1,
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        })
        .where(eq(subscriptions.organizationId, organizationId));
    }

    // Send payment receipt email
    await sendEmail({
      to: paymentIntent.metadata?.customerEmail || '',
      subject: 'Payment Received - Invoice Receipt',
      html: `<p>Thank you for your payment of ${(paymentIntent.amount / 100).toFixed(2)} ${(paymentIntent.currency || 'USD').toUpperCase()} for invoice ${invoiceId}.</p>`,
    });

    logger.info('[Stripe] Payment succeeded', { invoiceId, organizationId });
    return { received: true, processed: true };
  } catch (error) {
    logger.error('[Stripe] Error handling payment succeeded:', error);
    return {
      received: true,
      processed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const invoiceId = paymentIntent.metadata?.invoiceId;
    const organizationId = paymentIntent.metadata?.organizationId;

    if (!invoiceId || !organizationId) {
      return { received: true, processed: false, error: 'Missing metadata' };
    }

    // Update invoice status to failed
    await db
      .update(invoices)
      .set({
        status: 'overdue' as any,
        failureReason: paymentIntent.last_payment_error?.message || 'Payment declined',
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      })
      .where(eq(invoices.id, invoiceId));

    // Send payment failure notification email
    await sendEmail({
      to: paymentIntent.metadata?.customerEmail || '',
      subject: 'Payment Failed - Action Required',
      html: `<p>We were unable to process your payment for invoice ${invoiceId}. Please contact support.</p>`,
    });

    logger.warn('[Stripe] Payment failed', { invoiceId, organizationId });
    return { received: true, processed: true };
  } catch (error) {
    logger.error('[Stripe] Error handling payment failed:', error);
    return {
      received: true,
      processed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle refund
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  try {
    const invoiceId = charge.metadata?.invoiceId;
    const organizationId = charge.metadata?.organizationId;

    if (!invoiceId || !organizationId) {
      return { received: true, processed: false, error: 'Missing metadata' };
    }

    // Update invoice status to refunded
    await db
      .update(invoices)
      .set({
        status: 'partial' as any,
        refundedAmount: charge.amount_refunded / 100,
        refundedDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      })
      .where(eq(invoices.id, invoiceId));

    // Send refund notification email
    await sendEmail({
      to: charge.billing_details?.email || '',
      subject: 'Refund Processed',
      html: `<p>Your refund of ${(charge.amount_refunded / 100).toFixed(2)} ${(charge.currency || 'USD').toUpperCase()} has been processed for invoice ${invoiceId}.</p>`,
    });

    logger.info('[Stripe] Refund processed', { invoiceId, organizationId });
    return { received: true, processed: true };
  } catch (error) {
    logger.error('[Stripe] Error handling refund:', error);
    return {
      received: true,
      processed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle subscription update (e.g., plan upgrade during trial)
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const organizationId = subscription.metadata?.organizationId;

    if (!organizationId) {
      return { received: true, processed: false, error: 'Missing organizationId' };
    }

    logger.info('[Stripe] Subscription updated', { organizationId });
    return { received: true, processed: true };
  } catch (error) {
    logger.error('[Stripe] Error handling subscription update:', error);
    return {
      received: true,
      processed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const organizationId = subscription.metadata?.organizationId;

    if (!organizationId) {
      return { received: true, processed: false, error: 'Missing organizationId' };
    }

    // Update organization subscription status
    await db
      .update(subscriptions)
      .set({
        autoRenewEnabled: 0,
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      })
      .where(eq(subscriptions.organizationId, organizationId));

    logger.info('[Stripe] Subscription cancelled', { organizationId });
    return { received: true, processed: true };
  } catch (error) {
    logger.error('[Stripe] Error handling subscription deletion:', error);
    return {
      received: true,
      processed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Verify Stripe webhook signature
 */
export function verifyStripeSignature(
  body: string,
  signature: string,
  secret: string
): Stripe.Event | null {
  try {
    return stripe.webhooks.constructEvent(body, signature, secret);
  } catch (error) {
    logger.error('[Stripe] Signature verification failed:', error);
    return null;
  }
}
