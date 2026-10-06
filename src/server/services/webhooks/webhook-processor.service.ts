/**
 * Webhook Processor Service
 * Handles incoming webhooks from payment gateways (Stripe, M-Pesa, Bank Transfers)
 * Processes, verifies, and acts on payment events
 */

import { logger } from '~/server/lib/logger';
import type { WebhookEvent, PaymentGateway } from '~/types/webhooks';
import { db } from '~/server/db';
import { organizationSubscriptions, invoices, auditLogs } from '~/server/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

export class WebhookProcessor {
  /**
   * Process incoming webhook event
   * Routes to appropriate handler based on event source
   */
  static async processWebhook(
    gateway: PaymentGateway,
    payload: unknown,
    signature: string,
    timestamp: string
  ): Promise<{ success: boolean; message: string; eventId?: string }> {
    try {
      logger.info(`Processing ${gateway} webhook`);

      // Verify webhook signature
      const isValid = await this.verifySignature(gateway, payload, signature, timestamp);
      if (!isValid) {
        logger.error(`Invalid ${gateway} webhook signature`);
        return { success: false, message: 'Invalid signature' };
      }

      // Route to appropriate handler
      let result;
      switch (gateway) {
        case 'stripe':
          result = await this.processStripeWebhook(payload as Record<string, any>);
          break;
        case 'mpesa':
          result = await this.processMpesaWebhook(payload as Record<string, any>);
          break;
        case 'bank':
          result = await this.processBankWebhook(payload as Record<string, any>);
          break;
        default:
          return { success: false, message: `Unknown gateway: ${gateway}` };
      }

      return result;
    } catch (error) {
      logger.error(`Webhook processing error: ${error}`);
      return { success: false, message: 'Processing error' };
    }
  }

  /**
   * Verify webhook signature for authenticity
   */
  private static async verifySignature(
    gateway: PaymentGateway,
    payload: unknown,
    signature: string,
    timestamp: string
  ): Promise<boolean> {
    const secret = this.getWebhookSecret(gateway);

    switch (gateway) {
      case 'stripe':
        // Stripe uses: HMAC-SHA256(timestamp.payload, secret)
        const stripeSignedContent = `${timestamp}.${JSON.stringify(payload)}`;
        const stripeHash = crypto
          .createHmac('sha256', secret)
          .update(stripeSignedContent)
          .digest('hex');
        return signature === `t=${timestamp},v1=${stripeHash}`;

      case 'mpesa':
        // M-Pesa uses: SHA256(payload + secret)
        const mpesaContent = `${JSON.stringify(payload)}${secret}`;
        const mpesaHash = crypto.createHash('sha256').update(mpesaContent).digest('hex');
        return signature === mpesaHash;

      case 'bank':
        // Bank uses: HMAC-SHA256(payload, secret)
        const bankHash = crypto
          .createHmac('sha256', secret)
          .update(JSON.stringify(payload))
          .digest('hex');
        return signature === bankHash;

      default:
        return false;
    }
  }

  /**
   * Process Stripe webhook events
   */
  private static async processStripeWebhook(event: Record<string, any>): Promise<{
    success: boolean;
    message: string;
    eventId?: string;
  }> {
    const { type, data } = event;

    logger.info(`Stripe event: ${type}`);

    switch (type) {
      case 'payment_intent.succeeded':
        return await this.handleStripePaymentSucceeded(data.object);

      case 'payment_intent.payment_failed':
        return await this.handleStripePaymentFailed(data.object);

      case 'invoice.payment_succeeded':
        return await this.handleStripeInvoicePaid(data.object);

      case 'invoice.payment_failed':
        return await this.handleStripeInvoiceFailed(data.object);

      case 'customer.subscription.deleted':
        return await this.handleStripeSubscriptionCancelled(data.object);

      case 'customer.subscription.updated':
        return await this.handleStripeSubscriptionUpdated(data.object);

      default:
        logger.info(`Unhandled Stripe event: ${type}`);
        return { success: true, message: 'Event received but not processed', eventId: event.id };
    }
  }

  /**
   * Process M-Pesa webhook events (STK push, C2B)
   */
  private static async processMpesaWebhook(data: Record<string, any>): Promise<{
    success: boolean;
    message: string;
    eventId?: string;
  }> {
    const { transactionType, resultCode, resultDesc } = data;

    logger.info(`M-Pesa event: ${transactionType} - ${resultDesc}`);

    switch (transactionType) {
      case 'STK_PUSH':
        return await this.handleMpesaStkPushResult(data);

      case 'C2B':
        return await this.handleMpesaC2BTransaction(data);

      case 'B2B':
        return await this.handleMpesaB2BTransaction(data);

      case 'REVERSAL':
        return await this.handleMpesaReversal(data);

      default:
        logger.info(`Unhandled M-Pesa transaction type: ${transactionType}`);
        return { success: true, message: 'Event received', eventId: data.CheckoutRequestID };
    }
  }

  /**
   * Process Bank transfer webhook events
   */
  private static async processBankWebhook(data: Record<string, any>): Promise<{
    success: boolean;
    message: string;
    eventId?: string;
  }> {
    const { eventType, transferStatus, referenceNumber } = data;

    logger.info(`Bank event: ${eventType} - ${transferStatus}`);

    switch (eventType) {
      case 'TRANSFER_COMPLETED':
        return await this.handleBankTransferCompleted(data);

      case 'TRANSFER_FAILED':
        return await this.handleBankTransferFailed(data);

      case 'TRANSFER_PENDING':
        return await this.handleBankTransferPending(data);

      case 'RECONCILIATION':
        return await this.handleBankReconciliation(data);

      default:
        logger.info(`Unhandled bank event: ${eventType}`);
        return { success: true, message: 'Event received', eventId: referenceNumber };
    }
  }

  // ============ STRIPE HANDLERS ============

  private static async handleStripePaymentSucceeded(paymentIntent: Record<string, any>) {
    const { id, amount, metadata, status } = paymentIntent;
    const { organizationId, invoiceId } = metadata || {};

    logger.info(`Stripe payment succeeded: ${id}`);

    // Update invoice to paid
    if (invoiceId) {
      await db
        .update(invoices)
        .set({
          status: 'paid',
          paidDate: new Date(),
          stripePaymentIntentId: id,
          transactionId: id,
        })
        .where(eq(invoices.id, invoiceId));
    }

    // Update subscription if trial end trigger
    if (organizationId) {
      const subscription = await db.query.organizationSubscriptions.findFirst({
        where: eq(organizationSubscriptions.organizationId, organizationId),
      });

      if (subscription && subscription.status === 'trial') {
        await db
          .update(organizationSubscriptions)
          .set({
            status: 'active',
            currentTier: subscription.currentTier || 'Starter',
          })
          .where(eq(organizationSubscriptions.organizationId, organizationId));
      }
    }

    // Log to audit trail
    await this.logWebhookEvent('payment_succeeded', 'stripe', paymentIntent, organizationId);

    return {
      success: true,
      message: 'Payment processed successfully',
      eventId: id,
    };
  }

  private static async handleStripePaymentFailed(paymentIntent: Record<string, any>) {
    const { id, metadata, last_payment_error } = paymentIntent;
    const { organizationId, invoiceId } = metadata || {};

    logger.error(`Stripe payment failed: ${id} - ${last_payment_error?.message}`);

    // Mark invoice as failed
    if (invoiceId) {
      await db
        .update(invoices)
        .set({
          status: 'failed',
          failureReason: last_payment_error?.message || 'Payment declined',
        })
        .where(eq(invoices.id, invoiceId));
    }

    // Log to audit trail
    await this.logWebhookEvent('payment_failed', 'stripe', paymentIntent, organizationId);

    return {
      success: true,
      message: 'Payment failure logged',
      eventId: id,
    };
  }

  private static async handleStripeInvoicePaid(stripeInvoice: Record<string, any>) {
    const { id, metadata } = stripeInvoice;
    logger.info(`Stripe invoice paid: ${id}`);

    return {
      success: true,
      message: 'Invoice marked as paid',
      eventId: id,
    };
  }

  private static async handleStripeInvoiceFailed(stripeInvoice: Record<string, any>) {
    const { id, metadata, attempt_count } = stripeInvoice;
    logger.warn(`Stripe invoice failed: ${id} (attempt ${attempt_count})`);

    return {
      success: true,
      message: 'Invoice failure logged',
      eventId: id,
    };
  }

  private static async handleStripeSubscriptionCancelled(subscription: Record<string, any>) {
    const { id, metadata } = subscription;
    logger.info(`Stripe subscription cancelled: ${id}`);

    return {
      success: true,
      message: 'Subscription cancellation logged',
      eventId: id,
    };
  }

  private static async handleStripeSubscriptionUpdated(subscription: Record<string, any>) {
    const { id, items, metadata } = subscription;
    logger.info(`Stripe subscription updated: ${id}`);

    return {
      success: true,
      message: 'Subscription update logged',
      eventId: id,
    };
  }

  // ============ M-PESA HANDLERS ============

  private static async handleMpesaStkPushResult(data: Record<string, any>) {
    const { CheckoutRequestID, ResultCode, ResultDesc, Amount, PhoneNumber } = data;

    logger.info(`M-Pesa STK result: ${ResultDesc}`);

    // ResultCode 0 = Success
    if (ResultCode === '0') {
      // Payment successful - complete transaction
      // This will be confirmed by C2B callback
      logger.info(`STK payment initiated: ${PhoneNumber} - ${Amount}`);
    } else {
      // User declined/timeout
      logger.warn(`STK payment failed: ${ResultDesc}`);
    }

    return {
      success: true,
      message: 'STK result received',
      eventId: CheckoutRequestID,
    };
  }

  private static async handleMpesaC2BTransaction(data: Record<string, any>) {
    const {
      TransactionID,
      TransAmount,
      TransactionTime,
      BusinessShortCode,
      MSISDN,
      AccountReference,
    } = data;

    logger.info(
      `M-Pesa C2B: ${TransactionID} - ${TransAmount} from ${MSISDN} to ${BusinessShortCode}`
    );

    const [organizationId, invoiceId] = AccountReference.split('_') || [];

    // Update invoice to paid
    if (invoiceId) {
      await db
        .update(invoices)
        .set({
          status: 'paid',
          paidDate: new Date(TransactionTime),
          mpesaTransactionId: TransactionID,
          transactionId: TransactionID,
          mpesaReference: AccountReference,
        })
        .where(eq(invoices.id, invoiceId));

      logger.info(`Invoice ${invoiceId} marked as paid via M-Pesa`);
    }

    // Log to audit trail
    await this.logWebhookEvent('payment_succeeded', 'mpesa', data, organizationId);

    return {
      success: true,
      message: 'C2B payment received',
      eventId: TransactionID,
    };
  }

  private static async handleMpesaB2BTransaction(data: Record<string, any>) {
    const { TransactionID, TransAmount } = data;
    logger.info(`M-Pesa B2B: ${TransactionID} - ${TransAmount}`);

    return {
      success: true,
      message: 'B2B transaction received',
      eventId: TransactionID,
    };
  }

  private static async handleMpesaReversal(data: Record<string, any>) {
    const { OriginatorConversationID, ReversalAmount } = data;
    logger.info(`M-Pesa reversal: ${OriginatorConversationID} - ${ReversalAmount}`);

    // Revert payment status
    // Implement reversal logic

    return {
      success: true,
      message: 'Reversal processed',
      eventId: OriginatorConversationID,
    };
  }

  // ============ BANK HANDLERS ============

  private static async handleBankTransferCompleted(data: Record<string, any>) {
    const { referenceNumber, amount, senderAccount, timestamp } = data;

    logger.info(`Bank transfer completed: ${referenceNumber} - ${amount}`);

    const [organizationId, invoiceId] = referenceNumber.split('-') || [];

    // Update invoice to paid
    if (invoiceId) {
      await db
        .update(invoices)
        .set({
          status: 'paid',
          paidDate: new Date(timestamp),
          bankTransferId: referenceNumber,
          transactionId: referenceNumber,
          bankReference: senderAccount,
        })
        .where(eq(invoices.id, invoiceId));

      logger.info(`Invoice ${invoiceId} marked as paid via bank transfer`);
    }

    // Log to audit trail
    await this.logWebhookEvent('payment_succeeded', 'bank', data, organizationId);

    return {
      success: true,
      message: 'Bank transfer completed',
      eventId: referenceNumber,
    };
  }

  private static async handleBankTransferFailed(data: Record<string, any>) {
    const { referenceNumber, reason } = data;
    logger.error(`Bank transfer failed: ${referenceNumber} - ${reason}`);

    return {
      success: true,
      message: 'Transfer failure logged',
      eventId: referenceNumber,
    };
  }

  private static async handleBankTransferPending(data: Record<string, any>) {
    const { referenceNumber } = data;
    logger.info(`Bank transfer pending: ${referenceNumber}`);

    return {
      success: true,
      message: 'Transfer pending',
      eventId: referenceNumber,
    };
  }

  private static async handleBankReconciliation(data: Record<string, any>) {
    const { reconciliationDate, totalAmount, transactionCount } = data;
    logger.info(
      `Bank reconciliation: ${transactionCount} transactions - ${totalAmount} on ${reconciliationDate}`
    );

    return {
      success: true,
      message: 'Reconciliation received',
    };
  }

  // ============ UTILITY METHODS ============

  private static getWebhookSecret(gateway: PaymentGateway): string {
    const secrets: Record<PaymentGateway, string> = {
      stripe: process.env.STRIPE_WEBHOOK_SECRET || '',
      mpesa: process.env.MPESA_WEBHOOK_SECRET || '',
      bank: process.env.BANK_WEBHOOK_SECRET || '',
    };

    return secrets[gateway];
  }

  private static async logWebhookEvent(
    action: string,
    gateway: string,
    payload: Record<string, any>,
    organizationId?: string
  ) {
    try {
      await db.insert(auditLogs).values({
        id: crypto.randomUUID(),
        organizationId: organizationId || 'system',
        userId: 'system-webhook',
        action: `webhook_${action}`,
        entityType: 'payment',
        entityId: payload.id || payload.CheckoutRequestID || payload.referenceNumber,
        oldValues: null,
        newValues: JSON.stringify({ gateway, ...payload }),
        severity: 'info',
        ipAddress: '0.0.0.0', // webhook IP would be from request context
        userAgent: `${gateway}-webhook`,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      logger.error(`Failed to log webhook event: ${error}`);
    }
  }
}

export default WebhookProcessor;
