/**
 * Billing Email Templates
 * HTML email templates for invoices, receipts, and payment notifications
 */

import { formatCurrencyAmount } from "../../shared/currency";

export interface BillingEmailContext {
  organizationName: string;
  organizationLogo?: string;
  billingEmail: string;
  supportEmail?: string;
  appName?: string;
  dashboardUrl?: string;
}

export interface InvoiceEmailData extends BillingEmailContext {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  amount: number;
  tax: number;
  totalAmount: number;
  currency: string;
  paymentLink?: string;
  planName: string;
  billingCycle: string;
}

export interface PaymentReceiptEmailData extends BillingEmailContext {
  invoiceNumber: string;
  paymentDate: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  planName: string;
  nextBillingDate: string;
}

export interface OverdueNoticeEmailData extends BillingEmailContext {
  invoiceNumber: string;
  dueDate: string;
  amount: number;
  currency: string;
  daysOverdue: number;
  suspensionDate: string;
}

export interface PaymentReminderEmailData extends BillingEmailContext {
  invoiceNumber: string;
  dueDate: string;
  amount: number;
  currency: string;
  daysUntilDue: number;
  planName: string;
}

function formatBillingAmount(value: number, currency: string): string {
  const code = /^[A-Z]{3}$/.test(currency) ? currency : "KES";
  return formatCurrencyAmount(value, code, {
    symbol: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Invoice notification email template
 */
export function invoiceEmailTemplate(data: InvoiceEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
    .invoice-details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .detail-row:last-child { border-bottom: none; }
    .label { font-weight: 600; color: #666; }
    .value { color: #333; }
    .amount { font-size: 18px; font-weight: bold; color: #667eea; }
    .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 4px; text-decoration: none; margin: 20px 0; }
    .footer { color: #999; font-size: 12px; text-align: center; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Invoice Notification</h1>
    </div>
    
    <div class="content">
      <p>Dear ${data.organizationName},</p>
      
      <p>Your subscription invoice is now ready. Please find the details below:</p>
      
      <div class="invoice-details">
        <div class="detail-row">
          <span class="label">Invoice Number:</span>
          <span class="value">${data.invoiceNumber}</span>
        </div>
        <div class="detail-row">
          <span class="label">Invoice Date:</span>
          <span class="value">${new Date(data.invoiceDate).toLocaleDateString()}</span>
        </div>
        <div class="detail-row">
          <span class="label">Due Date:</span>
          <span class="value">${new Date(data.dueDate).toLocaleDateString()}</span>
        </div>
        <div class="detail-row">
          <span class="label">Billing Period:</span>
          <span class="value">${new Date(data.billingPeriodStart).toLocaleDateString()} - ${new Date(data.billingPeriodEnd).toLocaleDateString()}</span>
        </div>
        <div class="detail-row">
          <span class="label">Plan:</span>
          <span class="value">${data.planName} (${data.billingCycle})</span>
        </div>
        <div class="detail-row">
          <span class="label">Subtotal:</span>
          <span class="value">${formatBillingAmount(data.amount, data.currency)}</span>
        </div>
        <div class="detail-row">
          <span class="label">Tax:</span>
          <span class="value">${formatBillingAmount(data.tax, data.currency)}</span>
        </div>
        <div class="detail-row" style="border-bottom: 2px solid #ddd; padding-top: 20px; margin-top: 10px;">
          <span class="label" style="font-size: 16px;">Total Amount:</span>
          <span class="value amount">${formatBillingAmount(data.totalAmount, data.currency)}</span>
        </div>
      </div>
      
      <p>Please make payment by the due date to ensure uninterrupted service. You can pay through multiple methods including credit card, M-Pesa, and bank transfer.</p>
      
      ${data.paymentLink ? `<a href="${data.paymentLink}" class="cta-button">Pay Now</a>` : ''}
      
      <p>If you have any questions about this invoice, please don't hesitate to contact our billing support team.</p>
      
      <div class="footer">
        <p>© ${new Date().getFullYear()} ${data.appName || 'Kiini: One Hub. Total Control'}. All rights reserved.</p>
        <p>For support, contact: ${data.supportEmail || 'support@kiini.africa'}</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Payment receipt email template
 */
export function paymentReceiptEmailTemplate(data: PaymentReceiptEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
    .success-badge { background: #10b981; color: white; display: inline-block; padding: 10px 20px; border-radius: 20px; margin: 20px 0; font-weight: 600; }
    .receipt-details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .detail-row:last-child { border-bottom: none; }
    .label { font-weight: 600; color: #666; }
    .value { color: #333; }
    .amount { font-size: 18px; font-weight: bold; color: #10b981; }
    .footer { color: #999; font-size: 12px; text-align: center; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Payment Receipt</h1>
    </div>
    
    <div class="content">
      <p>Dear ${data.organizationName},</p>
      
      <div class="success-badge">✓ Payment Received</div>
      
      <p>Thank you! Your payment has been successfully processed. Here are the details:</p>
      
      <div class="receipt-details">
        <div class="detail-row">
          <span class="label">Invoice Number:</span>
          <span class="value">${data.invoiceNumber}</span>
        </div>
        <div class="detail-row">
          <span class="label">Payment Date:</span>
          <span class="value">${new Date(data.paymentDate).toLocaleDateString()}</span>
        </div>
        <div class="detail-row">
          <span class="label">Payment Method:</span>
          <span class="value">${data.paymentMethod}</span>
        </div>
        <div class="detail-row">
          <span class="label">Transaction ID:</span>
          <span class="value" style="font-family: monospace;">${data.transactionId}</span>
        </div>
        <div class="detail-row">
          <span class="label">Plan:</span>
          <span class="value">${data.planName}</span>
        </div>
        <div class="detail-row">
          <span class="label">Next Billing Date:</span>
          <span class="value">${new Date(data.nextBillingDate).toLocaleDateString()}</span>
        </div>
        <div class="detail-row" style="border-bottom: 2px solid #ddd; padding-top: 20px; margin-top: 10px;">
          <span class="label" style="font-size: 16px;">Amount Paid:</span>
          <span class="value amount">${formatBillingAmount(data.amount, data.currency)}</span>
        </div>
      </div>
      
      <p>Your account is now active and you can continue enjoying our services without interruption.</p>
      
      <p>If you have any questions about this payment or your account, please contact our support team.</p>
      
      <div class="footer">
        <p>© ${new Date().getFullYear()} Kiini: One Hub. Total Control. All rights reserved.</p>
        <p>For support: support@kiini.africa</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Overdue payment notice email template
 */
export function overdueNoticeEmailTemplate(data: OverdueNoticeEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #fef2f2; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
    .warning-badge { background: #dc2626; color: white; display: inline-block; padding: 10px 20px; border-radius: 4px; margin: 20px 0; font-weight: 600; }
    .invoice-details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #ef4444; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .detail-row:last-child { border-bottom: none; }
    .label { font-weight: 600; color: #666; }
    .value { color: #333; }
    .amount { font-size: 18px; font-weight: bold; color: #ef4444; }
    .cta-button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; border-radius: 4px; text-decoration: none; margin: 20px 0; }
    .footer { color: #999; font-size: 12px; text-align: center; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠ Payment Overdue</h1>
    </div>
    
    <div class="content">
      <p>Dear ${data.organizationName},</p>
      
      <div class="warning-badge">Your payment is ${data.daysOverdue} day(s) overdue</div>
      
      <p>Your subscription payment is now overdue and your account is at risk of suspension.</p>
      
      <div class="invoice-details">
        <div class="detail-row">
          <span class="label">Invoice Number:</span>
          <span class="value">${data.invoiceNumber}</span>
        </div>
        <div class="detail-row">
          <span class="label">Original Due Date:</span>
          <span class="value">${new Date(data.dueDate).toLocaleDateString()}</span>
        </div>
        <div class="detail-row">
          <span class="label">Days Overdue:</span>
          <span class="value" style="color: #ef4444; font-weight: bold;">${data.daysOverdue}</span>
        </div>
        <div class="detail-row">
          <span class="label">Account Suspension Date:</span>
          <span class="value" style="color: #dc2626; font-weight: bold;">${new Date(data.suspensionDate).toLocaleDateString()}</span>
        </div>
        <div class="detail-row" style="border-bottom: 2px solid #ddd; padding-top: 20px; margin-top: 10px;">
          <span class="label" style="font-size: 16px;">Amount Due:</span>
          <span class="value amount">${formatBillingAmount(data.amount, data.currency)}</span>
        </div>
      </div>
      
      <p><strong>Please make payment immediately to avoid service suspension and loss of data.</strong></p>
      
      <p>You can pay through:</p>
      <ul>
        <li>Credit/Debit Card (Visa, Mastercard)</li>
        <li>M-Pesa</li>
        <li>Bank Transfer</li>
        <li>Cheque</li>
      </ul>
      
      <a href="#" class="cta-button">Pay Now</a>
      
      <p>If you have any questions or need a payment arrangement, please contact our billing support team immediately.</p>
      
      <div class="footer">
        <p>© ${new Date().getFullYear()} Kiini. All rights reserved.</p>
        <p>For urgent support: support@kiini.africa | +254 (0) XXX XXX XXX</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Payment reminder email template
 */
export function paymentReminderEmailTemplate(data: PaymentReminderEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #fffbeb; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
    .invoice-details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .detail-row:last-child { border-bottom: none; }
    .label { font-weight: 600; color: #666; }
    .value { color: #333; }
    .amount { font-size: 18px; font-weight: bold; color: #d97706; }
    .cta-button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; border-radius: 4px; text-decoration: none; margin: 20px 0; }
    .footer { color: #999; font-size: 12px; text-align: center; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Payment Due Soon</h1>
    </div>
    
    <div class="content">
      <p>Dear ${data.organizationName},</p>
      
      <p>This is a friendly reminder that your subscription payment is due soon.</p>
      
      <div class="invoice-details">
        <div class="detail-row">
          <span class="label">Invoice Number:</span>
          <span class="value">${data.invoiceNumber}</span>
        </div>
        <div class="detail-row">
          <span class="label">Due Date:</span>
          <span class="value">${new Date(data.dueDate).toLocaleDateString()}</span>
        </div>
        <div class="detail-row">
          <span class="label">Days Until Due:</span>
          <span class="value" style="color: #d97706; font-weight: bold;">${data.daysUntilDue}</span>
        </div>
        <div class="detail-row">
          <span class="label">Plan:</span>
          <span class="value">${data.planName}</span>
        </div>
        <div class="detail-row" style="border-bottom: 2px solid #ddd; padding-top: 20px; margin-top: 10px;">
          <span class="label" style="font-size: 16px;">Amount Due:</span>
          <span class="value amount">${formatBillingAmount(data.amount, data.currency)}</span>
        </div>
      </div>
      
      <p>Payment is easy and secure through multiple channels:</p>
      <ul>
        <li>Credit/Debit Card</li>
        <li>M-Pesa</li>
        <li>Bank Transfer</li>
      </ul>
      
      <a href="#" class="cta-button">Pay Now</a>
      
      <p>If you have any questions or need to update your payment method, please log into your account.</p>
      
      <div class="footer">
        <p>© ${new Date().getFullYear()} Kiini. All rights reserved.</p>
        <p>For support: support@kiini.africa</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
