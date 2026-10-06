import { db } from '../db';
import { invoices, subscriptions, organizations } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { logger } from '../_core/logger';
import { sendEmail } from '../_core/mail';
/**
 * Bank Transfer Payment Handler
 * For manual bank transfer payments processed by super-admin
 * Super-admin receives notification, matches payment to invoice, records it
 */

export interface BankTransferPaymentRequest {
  invoiceId: string;
  organizationId: string;
  amount: number;
  bankName: string;
  accountHolder: string;
  referenceNumber: string; // Bank transfer reference
  paymentDate: string;
  processedBy: string; // Super-admin user ID
}

/**
 * Record a bank transfer payment
 * Called by super-admin after receiving bank confirmation
 */
export async function recordBankTransferPayment(
  request: BankTransferPaymentRequest
): Promise<{ success: boolean; error?: string }> {
  try {
    const { invoiceId, organizationId, amount, bankName, accountHolder, referenceNumber, paymentDate, processedBy } =
      request;

    logger.info('[Bank Transfer] Recording payment', {
      invoiceId,
      organizationId,
      amount,
      bankName,
      referenceNumber,
    });

    // Verify invoice exists and matches amount
    const invoice = await db.query.invoices.findFirst({
      where: eq(invoices.id, invoiceId),
    });

    if (!invoice) {
      logger.warn('[Bank Transfer] Invoice not found', { invoiceId });
      return { success: false, error: 'Invoice not found' };
    }

    if (Math.abs(invoice.totalAmount - amount) > 0.01) {
      logger.warn('[Bank Transfer] Amount mismatch', { expected: invoice.totalAmount, received: amount });
      return { success: false, error: 'Amount mismatch' };
    }

    // Update invoice
    const paidDate = new Date(paymentDate);
    await db
      .update(invoices)
      .set({
        status: 'paid',
        paidDate,
        paymentMethod: 'bank_transfer',
        bankTransferReference: referenceNumber,
        bankName,
        accountHolder,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, invoiceId));

    // Update subscription
    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.organizationId, organizationId),
    });

    if (subscription) {
      const nextBillingDate = new Date(paidDate);
      nextBillingDate.setMonth(nextBillingDate.getMonth() + (subscription.billingCycle === 'annual' ? 12 : 1));

      await db
        .update(subscriptions)
        .set({
          renewalDate: nextBillingDate,
          autoRenew: 1,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.organizationId, organizationId));
    }

    // Send confirmation email to customer
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, organizationId),
    });

    if (org) {
      await sendEmail({
        to: org.billingEmail || org.email || '',
        subject: 'Bank Transfer Payment Received - Invoice Receipt',
        html: `<p>Payment received for invoice ${invoiceId}.</p><p>Amount: ${(org.currency || 'KES')} ${amount.toFixed(2)}</p><p>Reference: ${referenceNumber}</p>`,
      });
    }

    logger.info('[Bank Transfer] Payment recorded successfully', { invoiceId, amount, referenceNumber });
    return { success: true };
  } catch (error) {
    logger.error('[Bank Transfer] Error recording payment:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get expected bank transfer details for customer
 * Shows where to transfer money from an invoice
 */
export async function getBankTransferDetails(): Promise<{
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode: string;
  bankCode: string;
  branch: string;
  instructions: string;
}> {
  return {
    bankName: process.env.BANK_NAME || 'Equity Bank Kenya',
    accountName: process.env.BANK_ACCOUNT_NAME || 'Kiini Ltd',
    accountNumber: process.env.BANK_ACCOUNT_NUMBER || '2010234567',
    swiftCode: process.env.BANK_SWIFT_CODE || 'EQBLKENA',
    bankCode: process.env.BANK_CODE || '043',
    branch: process.env.BANK_BRANCH || 'Nairobi',
    instructions: `
      Please transfer the invoice amount to our bank account and include the invoice ID in the transfer reference.
      Our team will verify and confirm the payment within 24 hours.
    `,
  };
}

/**
 * Super-admin endpoint to view pending bank transfer payments
 * Helps identify which invoices are waiting for payment
 */
export async function getPendingBankTransferInvoices(): Promise<
  Array<{
    invoiceId: string;
    organizationId: string;
    organizationName: string;
    amount: number;
    currency: string;
    dueDate: Date;
    createdDate: Date;
    customerEmail: string;
    customerPhone: string;
  }>
> {
  try {
    const pendingInvoices = await db.query.invoices.findMany({
      where: eq(invoices.status, 'draft' as any),
    });

    return pendingInvoices.map((inv: any) => ({
      invoiceId: inv.id,
      organizationId: inv.organizationId,
      organizationName: inv.organization?.name || 'Unknown',
      amount: inv.totalAmount,
      currency: inv.organization?.currency || 'KES',
      dueDate: inv.dueDate,
      createdDate: inv.createdAt,
      customerEmail: inv.organization?.billingEmail || inv.organization?.email || '',
      customerPhone: inv.organization?.phoneNumber || '',
    }));
  } catch (error) {
    logger.error('[Bank Transfer] Error fetching pending invoices:', error);
    throw error;
  }
}

/**
 * Send bank transfer payment reminder email
 */
export async function sendBankTransferReminder(
  organizationId: string,
  invoiceId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const invoice = await db.query.invoices.findFirst({
      where: eq(invoices.id, invoiceId),
    });

    if (!invoice) {
      return { success: false, error: 'Invoice not found' };
    }

    const bankDetails = getBankTransferDetails();

    await sendEmail({
      to: invoice.organization?.billingEmail || invoice.organization?.email || '',
      subject: `Payment Reminder - Invoice ${invoiceId}`,
      html: `<p>This is a reminder for invoice ${invoiceId}.</p><p>Amount due: ${(invoice.organization?.currency || 'KES')} ${invoice.totalAmount.toFixed(2)}</p><p>${(await bankDetails).instructions}</p>`,
    });

    logger.info('[Bank Transfer] Reminder sent', { invoiceId, organizationId });
    return { success: true };
  } catch (error) {
    logger.error('[Bank Transfer] Error sending reminder:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

