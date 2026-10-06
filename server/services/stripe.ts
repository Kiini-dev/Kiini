/**
 * Stripe Payment Service
 * Handles all Stripe payment processing, webhook verification, and reconciliation
 * 
 * Environment Variables Required:
 * - STRIPE_SECRET_KEY: Stripe secret API key
 * - STRIPE_PUBLISHABLE_KEY: Stripe publishable key (for frontend)
 * - STRIPE_WEBHOOK_SECRET: Webhook signing secret
 */

import Stripe from 'stripe';
import { TRPCError } from '@trpc/server';
import * as db from '../db';
import { getDb } from '../db';
import { settings } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// Helper: read a Stripe setting from DB (category "payment_stripe")
async function getStripeSetting(key: string): Promise<string | undefined> {
  try {
    const database = await getDb();
    if (!database) return undefined;
    const rows = await database.select().from(settings)
      .where(and(eq(settings.category, "payment_stripe"), eq(settings.key, key)))
      .limit(1);
    return (rows[0]?.value as string) || undefined;
  } catch { return undefined; }
}

let stripeSecretKey = process.env.STRIPE_SECRET_KEY;
let stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
let stripe: Stripe | null = null;
let stripeInitialized = false;

async function getStripe(): Promise<Stripe | null> {
  if (stripeInitialized) return stripe;
  // If env var not set, try settings table
  if (!stripeSecretKey) {
    stripeSecretKey = await getStripeSetting("secretKey");
  }
  if (!stripeWebhookSecret) {
    stripeWebhookSecret = await getStripeSetting("webhookSecret");
  }
  if (!stripeSecretKey) {
    console.warn('[Stripe] STRIPE_SECRET_KEY not configured - Stripe payments will be disabled');
    stripeInitialized = true;
    return null;
  }
  stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-04-10' });
  stripeInitialized = true;
  return stripe;
}

interface CreatePaymentIntentInput {
  invoiceId: string;
  clientId: string;
  amount: number;
  currency?: string;
  receiptEmail?: string;
  description?: string;
}

interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
  status: string;
  amount: number;
  databaseId: string;
}

/**
 * Create a new payment intent for an invoice
 */
export async function createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult> {
  const stripeClient = await getStripe();
  if (!stripeClient) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Stripe integration is not configured',
    });
  }

  try {
    const { invoiceId, clientId, amount, currency = 'KES', receiptEmail, description } = input;

    // Check if payment intent already exists for this invoice
    const database = await db.getDb();
    if (!database) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Database connection failed',
      });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      receipt_email: receiptEmail,
      description: description || `Invoice ${invoiceId}`,
      metadata: {
        invoiceId,
        clientId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Store intent in database for tracking
    const databaseId = uuidv4();
    const stripePaymentIntents = (await import('../../drizzle/schema')).stripePaymentIntents;
    const { eq } = await import('drizzle-orm');
    
    // Check and delete existing if needed
    const existing = await database.select()
      .from(stripePaymentIntents)
      .where(eq(stripePaymentIntents.invoiceId, invoiceId));
    
    if (existing.length > 0) {
      await database.delete(stripePaymentIntents)
        .where(eq(stripePaymentIntents.invoiceId, invoiceId));
    }

    await database.insert(stripePaymentIntents).values({
      id: databaseId,
      invoiceId,
      stripePaymentIntentId: paymentIntent.id,
      clientId,
      amount: Math.round(amount * 100),
      currency: currency.toUpperCase(),
      status: paymentIntent.status as any,
      receiptEmail,
      metadata: { description } as any,
    });

    return {
      clientSecret: paymentIntent.client_secret || '',
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      databaseId,
    };
  } catch (error) {
    console.error('[Stripe] Error creating payment intent:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error instanceof Error ? error.message : 'Failed to create payment intent',
    });
  }
}

/**
 * Get payment intent status
 */
export async function getPaymentIntentStatus(paymentIntentId: string) {
  const stripeClient = await getStripe();
  if (!stripeClient) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Stripe integration is not configured',
    });
  }

  try {
    const paymentIntent = await stripeClient.paymentIntents.retrieve(paymentIntentId);
    return {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      receiptEmail: paymentIntent.receipt_email,
      chargeId: null,
    };
  } catch (error) {
    console.error('[Stripe] Error retrieving payment intent:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to retrieve payment intent status',
    });
  }
}

/**
 * Process refund for a payment
 */
export async function processRefund(chargeId: string, amount?: number) {
  const stripeClient = await getStripe();
  if (!stripeClient) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Stripe integration is not configured',
    });
  }

  try {
    const refund = await stripeClient.refunds.create({
      charge: chargeId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });

    return {
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount,
      charge: refund.charge,
    };
  } catch (error) {
    console.error('[Stripe] Error processing refund:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to process refund',
    });
  }
}

/**
 * Get payment methods for a customer
 */
export async function getPaymentMethods(stripeCustomerId: string) {
  const stripeClient = await getStripe();
  if (!stripeClient) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Stripe integration is not configured',
    });
  }

  try {
    const paymentMethods = await stripeClient.paymentMethods.list({
      customer: stripeCustomerId,
      type: 'card',
    });

    return paymentMethods.data.map((pm) => ({
      id: pm.id,
      brand: (pm.card as any)?.brand || '',
      lastFourDigits: (pm.card as any)?.last4 || '',
      expMonth: (pm.card as any)?.exp_month || 0,
      expYear: (pm.card as any)?.exp_year || 0,
    }));
  } catch (error) {
    console.error('[Stripe] Error fetching payment methods:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch payment methods',
    });
  }
}

/**
 * Handle Stripe webhook events
 */
export async function handleWebhookEvent(
  body: Buffer,
  signature: string
): Promise<{ processed: boolean; eventType?: string; invoiceId?: string }> {
  const stripeClient = await getStripe();
  if (!stripeClient || !stripeWebhookSecret) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Stripe webhook is not configured',
    });
  }

  try {
    const event = stripeClient.webhooks.constructEvent(body, signature, stripeWebhookSecret);
    const database = await db.getDb();
    if (!database) {
      throw new Error('Database connection lost');
    }

    const stripeWebhookEvents = (await import('../../drizzle/schema')).stripeWebhookEvents;
    const stripePaymentIntents = (await import('../../drizzle/schema')).stripePaymentIntents;
    const payments = (await import('../../drizzle/schema')).payments;
    const { eq } = await import('drizzle-orm');

    // Store event
    await database.insert(stripeWebhookEvents).values({
      id: uuidv4(),
      stripeEventId: event.id,
      type: event.type,
      data: event.data as any,
      processed: 0,
    });

    let invoiceId: string | undefined;

    // Handle specific event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Find related payment intent in our DB
        const dbIntent = await database.select()
          .from(stripePaymentIntents)
          .where(eq(stripePaymentIntents.stripePaymentIntentId, paymentIntent.id))
          .limit(1);

        if (dbIntent.length > 0) {
          invoiceId = dbIntent[0].invoiceId;
          if (!invoiceId) break;

          // Update payment status to completed
          const existingPayments = await database.select()
            .from(payments)
            .where(eq(payments.invoiceId, invoiceId))
            .limit(1);

          if (existingPayments.length > 0) {
            await database.update(payments)
              .set({
                status: 'completed',
                paymentDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
              })
              .where(eq(payments.id, existingPayments[0].id));
          }

          // Update stripe intent status
          await database.update(stripePaymentIntents)
            .set({ status: 'succeeded' as any })
            .where(eq(stripePaymentIntents.id, dbIntent[0].id));
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        const dbIntent = await database.select()
          .from(stripePaymentIntents)
          .where(eq(stripePaymentIntents.stripePaymentIntentId, paymentIntent.id))
          .limit(1);

        if (dbIntent.length > 0) {
          invoiceId = dbIntent[0].invoiceId;
          await database.update(stripePaymentIntents)
            .set({ status: 'canceled' as any })
            .where(eq(stripePaymentIntents.id, dbIntent[0].id));
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        // Find payment by charge ID and mark as refunded
        // Implementation depends on your payment tracking
        console.log('[Stripe] Charge refunded:', charge.id);
        break;
      }
    }

    // Mark event as processed
    await database.update(stripeWebhookEvents)
      .set({ processed: 1, processedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) })
      .where(eq(stripeWebhookEvents.stripeEventId, event.id));

    return { processed: true, eventType: event.type, invoiceId };
  } catch (error) {
    console.error('[Stripe] Webhook processing error:', error);
    throw error;
  }
}

/**
 * Get Stripe API status
 */
export async function getStripeStatus() {
  const stripeClient = await getStripe();
  return {
    isConfigured: !!stripeClient,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || await getStripeSetting("publishableKey") || null,
    hasWebhookSecret: !!stripeWebhookSecret,
    environment: stripeSecretKey?.startsWith('sk_test_') ? 'test' : 'production',
  };
}

export async function createSetupIntent(input: { organizationId: string; email: string }) {
  const stripeClient = await getStripe();
  if (!stripeClient) {
    throw new TRPCError({ code: 'PRECONDITION_FAILED', message: 'Stripe integration is not configured' });
  }
  const database = await db.getDb();
  if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database connection failed' });

  const { stripeCustomers } = await import('../../drizzle/schema');
  const { eq } = await import('drizzle-orm');
  let customer = (await database.select().from(stripeCustomers)
    .where(eq(stripeCustomers.organizationId, input.organizationId)).limit(1))[0];
  if (!customer) {
    const stripeCustomer = await stripeClient.customers.create({
      email: input.email,
      metadata: { organizationId: input.organizationId },
    });
    await database.insert(stripeCustomers).values({
      id: uuidv4(),
      organizationId: input.organizationId,
      stripeCustomerId: stripeCustomer.id,
      email: input.email,
      status: 'active',
      metadata: { source: 'subscription_checkout' },
    } as any);
    customer = { stripeCustomerId: stripeCustomer.id } as any;
  }

  const setupIntent = await stripeClient.setupIntents.create({
    customer: customer.stripeCustomerId,
    payment_method_types: ['card'],
    usage: 'off_session',
    metadata: { organizationId: input.organizationId },
  });
  return { clientSecret: setupIntent.client_secret, setupIntentId: setupIntent.id };
}

export async function saveSetupIntentPaymentMethod(input: { organizationId: string; setupIntentId: string; paymentMethodId: string; holderName: string }) {
  const stripeClient = await getStripe();
  if (!stripeClient) throw new TRPCError({ code: 'PRECONDITION_FAILED', message: 'Stripe integration is not configured' });
  const setupIntent = await stripeClient.setupIntents.retrieve(input.setupIntentId);
  if (setupIntent.status !== 'succeeded' || setupIntent.metadata?.organizationId !== input.organizationId || setupIntent.payment_method !== input.paymentMethodId) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Card setup was not completed for this organization' });
  }
  const paymentMethod = await stripeClient.paymentMethods.retrieve(input.paymentMethodId);
  if (paymentMethod.type !== 'card' || !paymentMethod.card) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'A card payment method is required' });
  }

  const database = await db.getDb();
  if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database connection failed' });
  const { paymentMethods } = await import('../../drizzle/schema');
  const { eq } = await import('drizzle-orm');
  await database.update(paymentMethods).set({ isDefault: 0 }).where(eq(paymentMethods.clientId, input.organizationId));
  await database.insert(paymentMethods).values({
    id: uuidv4(),
    clientId: input.organizationId,
    type: 'credit_card',
    provider: 'stripe',
    lastFourDigits: paymentMethod.card.last4,
    expiryMonth: paymentMethod.card.exp_month,
    expiryYear: paymentMethod.card.exp_year,
    holderName: input.holderName.trim(),
    isDefault: 1,
    isActive: 1,
    providerMethodId: paymentMethod.id,
  } as any);
  return { id: paymentMethod.id, lastFourDigits: paymentMethod.card.last4, brand: paymentMethod.card.brand };
}

export async function chargeSavedPaymentMethod(input: { organizationId: string; paymentMethodId: string; amount: number; description: string; email?: string }) {
  const stripeClient = await getStripe();
  if (!stripeClient) throw new TRPCError({ code: 'PRECONDITION_FAILED', message: 'Stripe integration is not configured' });
  if (input.amount <= 0) return null;
  const database = await db.getDb();
  if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database connection failed' });
  const { stripeCustomers } = await import('../../drizzle/schema');
  const { eq } = await import('drizzle-orm');
  const customer = (await database.select().from(stripeCustomers)
    .where(eq(stripeCustomers.organizationId, input.organizationId)).limit(1))[0];
  if (!customer) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Stripe customer is not configured' });

  try {
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(input.amount * 100),
      currency: 'kes',
      customer: customer.stripeCustomerId,
      payment_method: input.paymentMethodId,
      confirm: true,
      off_session: true,
      receipt_email: input.email,
      description: input.description,
      metadata: { organizationId: input.organizationId },
    });
    if (paymentIntent.status !== 'succeeded') {
      throw new TRPCError({ code: 'PAYMENT_REQUIRED', message: `Payment is ${paymentIntent.status}` });
    }
    return { id: paymentIntent.id, status: paymentIntent.status };
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    throw new TRPCError({ code: 'PAYMENT_REQUIRED', message: error instanceof Error ? error.message : 'Payment failed' });
  }
}

export default {
  createPaymentIntent,
  getPaymentIntentStatus,
  processRefund,
  getPaymentMethods,
  handleWebhookEvent,
  getStripeStatus,
  createSetupIntent,
  saveSetupIntentPaymentMethod,
  chargeSavedPaymentMethod,
};
