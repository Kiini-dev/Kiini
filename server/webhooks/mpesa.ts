import { db } from '../db';
import { invoices, subscriptions } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../_core/logger';
import crypto from 'crypto';
import { sendEmail } from '../_core/mail';

/**
 * M-Pesa Webhook Handler
 * Processes payment events from M-Pesa (Safaricom)
 * Handles: confirmation responses, callback events
 */

export interface MpesaCallbackData {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: string | number;
        }>;
      };
    };
  };
}

export interface MpesaConfirmationData {
  TransactionType: string;
  TransID: string;
  TransTime: string;
  TransAmount: number;
  BusinessShortCode: string;
  BillRefNumber: string; // Our invoice ID
  InvokedTimestamp: string;
  OrgAccountBalance: string;
  ThirdPartyTransID: string;
  MSISDN: string;
  FirstName: string;
  MiddleName?: string;
  LastName: string;
}

/**
 * Handle M-Pesa STK Pop callback (from mobile device)
 */
export async function handleMpesaCallback(callbackData: MpesaCallbackData) {
  try {
    const stkCallback = callbackData.Body.stkCallback;
    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;

    logger.info('[M-Pesa] Processing STK callback', { checkoutRequestId, resultCode });

    if (resultCode === 0) {
      // Payment successful
      return await processMpesaPaymentSuccess(stkCallback);
    } else {
      // Payment failed
      return await processMpesaPaymentFailure(stkCallback);
    }
  } catch (error) {
    logger.error('[M-Pesa] Callback processing error:', error);
    return { received: true, processed: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Handle M-Pesa C2B confirmation (for payment confirmation)
 */
export async function handleMpesaConfirmation(confirmationData: MpesaConfirmationData) {
  try {
    const invoiceId = confirmationData.BillRefNumber;
    const amount = confirmationData.TransAmount;
    const transactionId = confirmationData.TransID;

    logger.info('[M-Pesa] Processing confirmation', { invoiceId, amount, transactionId });

    // Find invoice
    const invoice = await db.query.invoices.findFirst({
      where: eq(invoices.id, invoiceId),
    });

    if (!invoice) {
      logger.warn('[M-Pesa] Invoice not found', { invoiceId });
      return { received: true, processed: false, error: 'Invoice not found' };
    }

    // Verify amount matches
    if (Math.abs(invoice.totalAmount - amount) > 0.01) {
      logger.warn('[M-Pesa] Amount mismatch', { expected: invoice.totalAmount, received: amount });
      return { received: true, processed: false, error: 'Amount mismatch' };
    }

    // Update invoice
    await db
      .update(invoices)
      .set({
        status: 'paid',
        paidDate: new Date(),
        paymentMethod: 'mpesa',
        mpesaTransactionId: transactionId,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, invoiceId));

    // Update subscription
    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.organizationId, invoice.organizationId || ''),
    });

    if (subscription) {
      const nextBillingDate = new Date();
      nextBillingDate.setMonth(nextBillingDate.getMonth() + (subscription.billingCycle === 'annual' ? 12 : 1));

      await db
        .update(subscriptions)
        .set({
          renewalDate: nextBillingDate,
          autoRenew: 1,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.organizationId, invoice.organizationId || ''));
    }

    // Send receipt email
    await sendEmail({
      to: `${confirmationData.MSISDN}@mpesa.local` || '', // Would be customer email in real system
      subject: 'Payment Received - M-Pesa Receipt',
      html: `<p>Payment received for invoice ${invoiceId}.</p><p>Amount: KES ${amount.toFixed(2)}</p><p>Transaction: ${transactionId}</p>`,
    });

    logger.info('[M-Pesa] Payment confirmed', { invoiceId, amount });
    return { received: true, processed: true };
  } catch (error) {
    logger.error('[M-Pesa] Confirmation processing error:', error);
    return { received: true, processed: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Process successful M-Pesa payment from STK callback
 */
async function processMpesaPaymentSuccess(stkCallback: any) {
  try {
    // Extract metadata from callback
    const callbackMetadata = stkCallback.CallbackMetadata?.Item || [];
    const metadataMap = callbackMetadata.reduce(
      (acc: Record<string, any>, item: any) => {
        acc[item.Name] = item.Value;
        return acc;
      },
      {} as Record<string, any>
    );

    const invoiceId = metadataMap.BillRefNumber;
    const amount = metadataMap.Amount;
    const mpesaReceiptNumber = metadataMap.MpesaReceiptNumber;
    const phoneNumber = metadataMap.PhoneNumber;

    if (!invoiceId || !amount) {
      logger.warn('[M-Pesa] Missing metadata', { metadataMap });
      return { received: true, processed: false, error: 'Missing metadata' };
    }

    // Update invoice
    await db
      .update(invoices)
      .set({
        status: 'paid',
        paidDate: new Date(),
        paymentMethod: 'mpesa',
        mpesaTransactionId: mpesaReceiptNumber,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, invoiceId));

    logger.info('[M-Pesa] Payment success processed', { invoiceId, amount });
    return { received: true, processed: true };
  } catch (error) {
    logger.error('[M-Pesa] Error processing payment success:', error);
    return { received: true, processed: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Process failed M-Pesa payment
 */
async function processMpesaPaymentFailure(stkCallback: any) {
  try {
    const resultDesc = stkCallback.ResultDesc;

    logger.warn('[M-Pesa] Payment failed', { resultDesc });

    // Could log failed attempt for analytics
    return { received: true, processed: true };
  } catch (error) {
    logger.error('[M-Pesa] Error processing payment failure:', error);
    return { received: true, processed: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Validate M-Pesa webhook signature (if using signed webhooks)
 */
export function validateMpesaSignature(body: string, signature: string, publicKey: string): boolean {
  try {
    const verifier = crypto.createVerify('sha256');
    verifier.update(body);
    return verifier.verify(publicKey, signature, 'base64');
  } catch (error) {
    logger.error('[M-Pesa] Signature validation error:', error);
    return false;
  }
}

/**
 * M-Pesa Payment Request (to initiate STK push)
 * Called by frontend to trigger M-Pesa payment
 */
export async function initiateM2MPayment(
  organizationId: string,
  invoiceId: string,
  phoneNumber: string,
  amount: number
): Promise<{ success: boolean; checkoutRequestId?: string; error?: string }> {
  try {
    // Call M-Pesa API to initiate STK push
    const accessToken = await getM2MAccessToken();

    const response = await fetch('https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: generateMpesaPassword(),
        Timestamp: new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14),
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount),
        PartyA: `254${phoneNumber.slice(-9)}`, // Convert to Kenya format
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: `254${phoneNumber.slice(-9)}`,
        CallBackURL: `${process.env.API_URL}/webhooks/mpesa/callback`,
        AccountReference: invoiceId,
        TransactionDesc: `Invoice ${invoiceId} for Organization ${organizationId}`,
      }),
    });

    const data = (await response.json()) as any;

    if (data.ResponseCode === '0') {
      logger.info('[M-Pesa] STK push initiated', { invoiceId, phoneNumber });
      return { success: true, checkoutRequestId: data.CheckoutRequestID };
    } else {
      logger.warn('[M-Pesa] STK push failed', { error: data.errorMessage });
      return { success: false, error: data.errorMessage };
    }
  } catch (error) {
    logger.error('[M-Pesa] Error initiating payment:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get M-Pesa OAuth token
 */
async function getM2MAccessToken(): Promise<string> {
  try {
    const auth = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString('base64');

    const response = await fetch('https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    const data = (await response.json()) as any;
    return data.access_token;
  } catch (error) {
    logger.error('[M-Pesa] Error getting access token:', error);
    throw error;
  }
}

/**
 * Generate M-Pesa password
 */
function generateMpesaPassword(): string {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const data = `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`;
  return Buffer.from(data).toString('base64');
}
