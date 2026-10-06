/**
 * M-Pesa Webhook Handlers
 * Handles payment callbacks from M-Pesa: STK completion, balance query, transaction confirmation
 * Integrates with organization subscription and payment procedures
 */

import { getDb } from "../db";
import { resumeSubscription } from "../services/subscriptionServiceManagement";
import { sql } from "drizzle-orm";
import { Router, Request, Response } from "express";
import { invoices, subscriptions, auditLogs, paymentRetries } from "../../drizzle/schema";
import crypto from "crypto";

export const mpesaWebhookRouter = Router();

/**
 * M-Pesa Callback Interface
 */
interface MpesaCallbackData {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{ Name: string; Value: any }>;
      };
    };
  };
}

interface MpesaConfirmationData {
  TransactionType: string;
  TransID: string;
  TransTime: string;
  TransAmount: string;
  BusinessShortCode: string;
  BillRefNumber: string;
  InvoiceNumber: string;
  OrgAccountID: string;
  ThirdPartyTransID: string;
  MSISDN: string;
  FirstName: string;
  MiddleName: string;
  LastName: string;
}

/**
 * Verify M-Pesa signature (optional but recommended)
 */
function verifyMpesaSignature(data: any, signature: string, shortcode: string, timestamp: string): boolean {
  if (!process.env.MPESA_PASSKEY) return false;

  const input = shortcode + process.env.MPESA_PASSKEY + timestamp;
  const hash = crypto.createHash("sha256").update(input).digest("base64");

  return hash === signature;
}

/**
 * Extract M-Pesa callback data
 */
function extractCallbackData(callbackData: MpesaCallbackData): { [key: string]: any } {
  const result: { [key: string]: any } = {};

  if (callbackData.Body?.stkCallback?.CallbackMetadata?.Item) {
    callbackData.Body.stkCallback.CallbackMetadata.Item.forEach((item: any) => {
      result[item.Name] = item.Value;
    });
  }

  return result;
}

/**
 * Handle STK Push Callback (user completes payment on phone)
 */
async function handleStkPushCallback(event: any) {
  const db = await getDb() as any;
  if (!db) {
    console.error("❌ Database connection unavailable");
    return;
  }

  const stkCallback = event.Body?.stkCallback;
  const resultCode = stkCallback?.ResultCode;
  const resultDesc = stkCallback?.ResultDesc;

  try {
    const metadata = extractCallbackData(event);
    const invoiceId = metadata.InvoiceID;
    const organizationId = metadata.OrganizationID;
    const amount = metadata.Amount;
    const mpesaCode = metadata.MpesaReceiptNumber;
    const phoneNumber = metadata.PhoneNumber;

    if (!invoiceId || !organizationId) {
      console.warn("⚠️ STK callback missing invoiceId or organizationId");
      return;
    }

    // Success: ResultCode 0 = transaction completed
    if (resultCode === 0) {
      console.log(`✅ M-Pesa payment successful: ${mpesaCode}`);

      // Update invoice status to paid
      await db.execute(
        sql`UPDATE invoices 
            SET status = 'paid', 
                paymentDate = NOW(),
                paymentMethod = 'mpesa',
                transactionReference = ${mpesaCode}
            WHERE id = ${invoiceId}`
      );

      const paidSubscription = await db.query.subscriptions.findFirst({
        where: (sub: any, { eq }: any) => eq(sub.organizationId, organizationId),
      });
      if (paidSubscription) {
        await resumeSubscription(paidSubscription.id, organizationId);
      }

      // Create audit log
      await db.insert(auditLogs).values({
        id: crypto.randomUUID(),
        userId: "mpesa-webhook",
        action: "payment_received",
        resourceType: "invoice",
        resourceId: String(invoiceId),
        changes: JSON.stringify({
          mpesaCode,
          phoneNumber,
          amount,
          transactionType: "STK Push",
        }),
        ipAddress: "mpesa",
        userAgent: "M-Pesa Webhook",
        createdAt: new Date().toISOString(),
      });

      // Check if this is trial conversion
      const subscriptionData = await db.query.subscriptions.findFirst({
        where: (sub: any, { eq }: any) => eq(sub.organizationId, organizationId),
      });

      if (subscriptionData?.expiryDate && new Date(subscriptionData.expiryDate) > new Date()) {
        // Convert trial to paid
        await db.execute(
          sql`UPDATE subscriptions 
              SET status = 'active',
                  renewalDate = DATE_ADD(NOW(), INTERVAL 1 MONTH),
                  updatedAt = NOW()
              WHERE organizationId = ${organizationId}`
        );

        console.log(`✅ Trial converted to paid via M-Pesa for organization ${organizationId}`);
      }

    } else {
      // Payment failed (ResultCode > 0)
      console.warn(`⚠️ M-Pesa payment failed: ${resultDesc} (Code: ${resultCode})`);

      // Schedule retry
      const retryDate = new Date();
      retryDate.setDate(retryDate.getDate() + 2); // Retry in 2 days

      const defaultSubscription = await db.query.subscriptions.findFirst({
        where: (sub: any, { eq }: any) => eq(sub.organizationId, organizationId),
      });

      await db.insert(paymentRetries).values({
        id: crypto.randomUUID(),
        invoiceId: String(invoiceId),
        subscriptionId: defaultSubscription?.id ?? "system",
        attemptNumber: 1,
        status: "pending",
        failureReason: resultDesc,
        paymentMethod: "mpesa",
        attemptedAt: new Date().toISOString(),
        nextRetryAt: retryDate.toISOString(),
        metadata: JSON.stringify({
          failureReason: resultDesc,
          resultCode: resultCode,
          mpesaCheckoutRequestId: stkCallback.CheckoutRequestID,
        }),
      });

      // Create audit log for failure
      await db.insert(auditLogs).values({
        id: crypto.randomUUID(),
        userId: "mpesa-webhook",
        action: "payment_failed",
        resourceType: "invoice",
        resourceId: String(invoiceId),
        changes: JSON.stringify({
          resultCode,
          resultDesc,
          retryScheduledFor: retryDate.toISOString(),
        }),
        ipAddress: "mpesa",
        userAgent: "M-Pesa Webhook",
        createdAt: new Date().toISOString(),
      });
    }

  } catch (error) {
    console.error("❌ Error handling STK Push callback:", error);
  }
}

/**
 * Handle C2B Confirmation (Direct Payment)
 * Used when customer sends money directly to paybill
 */
async function handleC2bConfirmation(event: MpesaConfirmationData) {
  const db = await getDb() as any;
  if (!db) {
    console.error("❌ Database connection unavailable");
    return;
  }

  try {
    // Extract organization ID from bill reference or invoice number
    const billRef = event.BillRefNumber || event.InvoiceNumber;
    const organizationId = event.OrgAccountID;
    const amount = parseFloat(event.TransAmount);
    const mpesaCode = event.TransID;
    const phoneNumber = event.MSISDN;

    if (!organizationId || !billRef) {
      console.warn("⚠️ C2B confirmation missing organizationId or billRef");
      return;
    }

    console.log(`✅ C2B Confirmation received: ${mpesaCode} for ${billRef}`);

    // Find invoice by bill reference
    const targetInvoice = await db.query.invoices.findFirst({
      where: (inv: any, { eq }: any) => eq(inv.referenceNumber, billRef),
    });

    if (!targetInvoice) {
      console.warn(`⚠️ No invoice found for bill reference: ${billRef}`);
      
      // Create audit log for unmatched payment
      await db.insert(auditLogs).values({
        id: crypto.randomUUID(),
        userId: "mpesa-webhook",
        action: "payment_unmatched",
        resourceType: "payment",
        resourceId: mpesaCode,
        changes: JSON.stringify({
          mpesaCode,
          phoneNumber,
          amount,
          billRef,
          message: "Payment received but no matching invoice found",
        }),
        ipAddress: "mpesa",
        userAgent: "M-Pesa Webhook",
        createdAt: new Date().toISOString(),
      });

      return;
    }

    // Update invoice
    await db.execute(
      sql`UPDATE invoices 
          SET status = 'paid',
              paymentDate = NOW(),
              paymentMethod = 'mpesa',
              transactionReference = ${mpesaCode},
              amountPaid = ${amount}
          WHERE id = ${targetInvoice.id}`
    );

    // Create audit log
    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      userId: "mpesa-webhook",
      action: "payment_received",
      resourceType: "invoice",
      resourceId: String(targetInvoice.id),
      changes: JSON.stringify({
        mpesaCode,
        phoneNumber,
        amount,
        transactionType: "C2B Confirmation",
      }),
      ipAddress: "mpesa",
      userAgent: "M-Pesa Webhook",
      createdAt: new Date().toISOString(),
    });

    // Check for trial conversion
    const subscriptionData = await db.query.subscriptions.findFirst({
      where: (sub: any, { eq }: any) => eq(sub.organizationId, organizationId),
    });

    if (subscriptionData?.expiryDate && new Date(subscriptionData.expiryDate) > new Date()) {
      await db.execute(
        sql`UPDATE subscriptions 
            SET status = 'active',
                renewalDate = DATE_ADD(NOW(), INTERVAL 1 MONTH),
                updatedAt = NOW()
            WHERE organizationId = ${organizationId}`
      );

      console.log(`✅ Trial converted via C2B for organization ${organizationId}`);
    }

  } catch (error) {
    console.error("❌ Error handling C2B confirmation:", error);
  }
}

/**
 * Handle Validation Request
 * M-Pesa sends this to validate before processing C2B
 */
async function handleValidationRequest(event: any) {
  const db = await getDb() as any;
  if (!db) {
    console.error("❌ Database connection unavailable");
    return;
  }

  try {
    const billRef = event.BillRefNumber || event.InvoiceNumber;

    // Check if invoice exists
    const invoice = await db.query.invoices.findFirst({
      where: (inv: any, { eq }: any) => eq(inv.referenceNumber, billRef),
    });

    if (invoice) {
      // Validation successful - M-Pesa will proceed with confirmation
      console.log(`✅ Validation successful for invoice: ${billRef}`);
      return { ResultCode: 0, ResultDesc: "Validation successful" };
    } else {
      // Validation failed - reject the payment
      console.warn(`⚠️ Validation failed for invoice: ${billRef}`);
      return { ResultCode: 1, ResultDesc: "Invalid bill reference" };
    }

  } catch (error) {
    console.error("❌ Error handling validation request:", error);
    return { ResultCode: 1, ResultDesc: "Validation error" };
  }
}

/**
 * Main M-Pesa webhook endpoint
 */
mpesaWebhookRouter.post("/mpesa", async (req: Request, res: Response) => {
  try {
    console.log(`📨 Received M-Pesa webhook event`);

    const event = req.body;

    // Determine event type and route accordingly
    if (event.Body?.stkCallback) {
      // STK Push callback
      await handleStkPushCallback(event);
    } else if (event.TransactionType) {
      // Could be C2B Confirmation or Validation Request
      if (event.TransactionType === "Pay Bill Online") {
        await handleC2bConfirmation(event);
      }
    }

    // Always return 200 OK
    res.status(200).json({
      ResultCode: 0,
      ResultDesc: "Webhook received successfully",
    });

  } catch (error) {
    console.error("❌ Error processing M-Pesa webhook:", error);
    res.status(200).json({
      ResultCode: 1,
      ResultDesc: "Webhook processing error",
    });
  }
});

export default mpesaWebhookRouter;
