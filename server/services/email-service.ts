/**
 * Email Notification Templates & Service
 * SendGrid/Mailgun integration for all billing and subscription emails
 */

import sgMail from "@sendgrid/mail";
import { getDb } from "../db";
import { sql } from "drizzle-orm";
import { auditLogs } from "../../drizzle/schema";
import { randomUUID } from "node:crypto";
import { formatMinorCurrencyAmount } from "../../shared/currency";

sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

function formatCurrency(amount: number, currency: string = "KES"): string {
  const code = /^[A-Z]{3}$/.test(currency) ? currency : "KES";
  return formatMinorCurrencyAmount(amount, code, { symbol: currency });
}

/**
 * Email template types
 */
type EmailTemplate =
  | "trial_7day_warning"
  | "trial_24h_critical"
  | "trial_expired"
  | "renewal_invoice"
  | "payment_reminder_upcoming"
  | "payment_reminder_overdue"
  | "payment_critical_overdue"
  | "payment_received"
  | "payment_failed"
  | "invoice_generated"
  | "subscription_upgraded"
  | "subscription_downgraded"
  | "subscription_canceled";

interface EmailContext {
  organizationId: string;
  organizationName: string;
  email: string;
  contactName?: string;
  [key: string]: any;
}

/**
 * Email template registry with subject and body generators
 */
const emailTemplates: Record<EmailTemplate, (ctx: EmailContext) => { subject: string; html: string }> = {
  trial_7day_warning: (ctx) => ({
    subject: "⏰ Your Kiini Trial Ends in 7 Days",
    html: `
      <h2>Hi ${ctx.contactName || "there"},</h2>
      <p>Your <strong>${ctx.organizationName}</strong> trial for Kiini ends in <strong>7 days</strong>.</p>
      <p>Don't lose access! Upgrade to a paid plan now to keep using all features.</p>
      <div style="margin: 30px 0;">
        <a href="${process.env.APP_URL}/pricing" 
           style="background-color: #007bff; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;">
          View Pricing Plans →
        </a>
      </div>
      <h4>Your trial includes:</h4>
      <ul>
        <li>✅ Full CRM access with 5 users</li>
        <li>✅ Invoice management</li>
        <li>✅ Customer database</li>
        <li>✅ Basic reporting</li>
      </ul>
      <p><strong>Need more time?</strong> Reply to this email and we'll work something out.</p>
      <hr style="margin-top: 30px;"/>
      <p style="font-size: 12px; color: #666;">
        Trial expires on <strong>${new Date(ctx.trialEndDate).toLocaleDateString()}</strong><br/>
        Organization: ${ctx.organizationName}
      </p>
    `,
  }),

  trial_24h_critical: (ctx) => ({
    subject: "🚨 URGENT: Your Kiini Trial Expires Tomorrow",
    html: `
      <h2 style="color: #d32f2f;">Your trial expires in 24 hours!</h2>
      <p>Hi ${ctx.contactName || "there"},</p>
      <p>Your trial access to Kiini will end <strong>tomorrow midnight</strong>.</p>
      <p style="background-color: #fff3e0; padding: 15px; border-left: 4px solid #ff9800;">
        <strong>⚠️ Act now:</strong> After midnight, you'll lose access to all CRM data and features until you upgrade.
      </p>
      <div style="margin: 30px 0;">
        <a href="${process.env.APP_URL}/pricing" 
           style="background-color: #d32f2f; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold; font-size: 16px;">
          Upgrade Now - Don't Lose Access ✕
        </a>
      </div>
      <p style="margin-top: 20px;">Have questions? <a href="mailto:support@kiini.africa">Contact our support team</a>.</p>
      <hr style="margin-top: 30px;"/>
      <p style="font-size: 12px; color: #666;">
        Trial expires on <strong>${new Date(ctx.trialEndDate).toLocaleString()}</strong>
      </p>
    `,
  }),

  trial_expired: (ctx) => ({
    subject: "Your Trial Has Ended 🔒",
    html: `
      <h2>Your trial access has ended</h2>
      <p>Hi ${ctx.contactName || "there"},</p>
      <p>Unfortunately, your Kiini trial for <strong>${ctx.organizationName}</strong> expired on ${new Date(ctx.trialEndDate).toLocaleDateString()}.</p>
      <p>Your data is safe and waiting for you! Upgrade anytime to regain access.</p>
      <div style="margin: 30px 0;">
        <a href="${process.env.APP_URL}/pricing" 
           style="background-color: #007bff; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;">
          Choose Your Plan & Reactivate
        </a>
      </div>
      <h4>Popular plans:</h4>
      <ul>
        <li><strong>Accounting Only - $49/mo</strong>: Perfect for invoicing and accounting</li>
        <li><strong>Starter - $99/mo</strong>: Full CRM with HR basics (most popular)</li>
        <li><strong>Professional - $399/mo</strong>: Everything + Procurement + Payroll</li>
      </ul>
      <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
        <strong>Special offer:</strong> First month 50% off when you upgrade today!<br/>
        Use code: <code style="background-color: #f5f5f5; padding: 2px 6px;">RESTART50</code>
      </p>
    `,
  }),

  renewal_invoice: (ctx) => ({
    subject: `🧾 Your Subscription Renewal Invoice`,
    html: `
      <h2>Subscription Renewal Invoice</h2>
      <p>Hi ${ctx.contactName || "there"},</p>
      <p>Your subscription renewal invoice for <strong>${ctx.organizationName}</strong> is ready.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd;">Plan</td>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>${ctx.pricingTier}</strong></td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Amount</td>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>${formatCurrency(ctx.amount)}</strong></td>
        </tr>
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd;">Billing Period</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${new Date(ctx.invoiceDate).toLocaleDateString()} - ${new Date(ctx.nextBillingDate).toLocaleDateString()}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Due Date</td>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>${new Date(ctx.dueDate).toLocaleDateString()}</strong></td>
        </tr>
      </table>
      <div style="margin: 30px 0;">
        <a href="${process.env.APP_URL}/invoices/${ctx.invoiceId}" 
           style="background-color: #007bff; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;">
          View & Pay Invoice
        </a>
      </div>
      <p><strong>Payment options:</strong></p>
      <ul>
        <li>💳 Stripe: Secure card payment</li>
        <li>📱 M-Pesa: Pay via STK or Paybill (Business Short Code: <code>246247</code>)</li>
        <li>🏦 Bank Transfer: Check your account for details</li>
      </ul>
    `,
  }),

  payment_reminder_upcoming: (ctx) => ({
    subject: `💰 Payment Due in ${ctx.daysToDue} Day(s): Invoice ${ctx.invoiceNumber}`,
    html: `
      <h3>Friendly Payment Reminder</h3>
      <p>Hi ${ctx.contactName || "there"},</p>
      <p>Payment for invoice <strong>${ctx.invoiceNumber}</strong> is due <strong>${ctx.daysToDue} day(s)</strong> from now.</p>
      <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
        <tr style="background-color: #e8f5e9;">
          <td style="padding: 10px; border: 1px solid #ddd;">Invoice Number</td>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>${ctx.invoiceNumber}</strong></td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Amount</td>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>${formatCurrency(ctx.amount)}</strong></td>
        </tr>
        <tr style="background-color: #e8f5e9;">
          <td style="padding: 10px; border: 1px solid #ddd;">Due</td>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>${ctx.dueDate}</strong></td>
        </tr>
      </table>
      <div style="margin: 30px 0;">
        <a href="${process.env.APP_URL}/invoices/${ctx.invoiceId}" 
           style="background-color: #4caf50; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;">
          Pay Now
        </a>
      </div>
      <p>Thank you for your business!</p>
    `,
  }),

  payment_reminder_overdue: (ctx) => ({
    subject: `⏰ Invoice ${ctx.invoiceNumber} Payment is Overdue`,
    html: `
      <h3>Payment Reminder</h3>
      <p>Hi ${ctx.contactName || "there"},</p>
      <p>Invoice <strong>${ctx.invoiceNumber}</strong> is now <strong>${ctx.daysOverdue} days overdue</strong>.</p>
      <p style="background-color: #fff3e0; padding: 15px; border-left: 4px solid #ff9800;">
        Please settle this payment to avoid service interruption.
      </p>
      <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Invoice</td>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>${ctx.invoiceNumber}</strong></td>
        </tr>
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd;">Amount Due</td>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>${formatCurrency(ctx.amount)}</strong></td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Days Overdue</td>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong style="color: #d32f2f;">${ctx.daysOverdue} days</strong></td>
        </tr>
      </table>
      <div style="margin: 30px 0;">
        <a href="${process.env.APP_URL}/invoices/${ctx.invoiceId}" 
           style="background-color: #ff9800; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;">
          Settle Payment Now
        </a>
      </div>
    `,
  }),

  payment_critical_overdue: (ctx) => ({
    subject: `🚨 CRITICAL: Invoice ${ctx.invoiceNumber} is ${ctx.daysOverdue}+ Days Overdue`,
    html: `
      <h2 style="color: #d32f2f;">URGENT: Payment is Critically Overdue</h2>
      <p>Hi ${ctx.contactName || "there"},</p>
      <p style="background-color: #ffebee; padding: 15px; border-left: 4px solid #d32f2f;">
        <strong>Invoice ${ctx.invoiceNumber} is ${ctx.daysOverdue} days overdue.</strong> Your account is at risk of suspension if payment is not received immediately.
      </p>
      <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
        <tr style="background-color: #ffcdd2;">
          <td style="padding: 10px; border: 1px solid #f44336;">Invoice</td>
          <td style="padding: 10px; border: 1px solid #f44336;"><strong>${ctx.invoiceNumber}</strong></td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Amount Due</td>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>${formatCurrency(ctx.amount)}</strong></td>
        </tr>
        <tr style="background-color: #ffcdd2;">
          <td style="padding: 10px; border: 1px solid #f44336;">Days Overdue</td>
          <td style="padding: 10px; border: 1px solid #f44336;"><strong>${ctx.daysOverdue} days</strong></td>
        </tr>
      </table>
      <div style="margin: 30px 0;">
        <a href="${process.env.APP_URL}/invoices/${ctx.invoiceId}" 
           style="background-color: #d32f2f; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold; font-size: 16px;">
          PAY NOW TO AVOID SERVICE SUSPENSION
        </a>
      </div>
      <p style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd;">
        <strong>Need to discuss payment arrangements?</strong><br/>
        Contact our billing team: <a href="mailto:support@kiini.africa">support@kiini.africa</a> or call <strong>+254 (0)726-123456</strong>
      </p>
    `,
  }),

  payment_received: (ctx) => ({
    subject: `✅ Payment Received - Invoice ${ctx.invoiceNumber}`,
    html: `
      <h2 style="color: #4caf50;">Payment Received ✓</h2>
      <p>Hi ${ctx.contactName || "there"},</p>
      <p>Thank you! We've received your payment.</p>
      <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
        <tr style="background-color: #e8f5e9;">
          <td style="padding: 10px; border: 1px solid #ddd;">Invoice Number</td>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>${ctx.invoiceNumber}</strong></td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Amount</td>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>${formatCurrency(ctx.amount)}</strong></td>
        </tr>
        <tr style="background-color: #e8f5e9;">
          <td style="padding: 10px; border: 1px solid #ddd;">Payment Date</td>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>${new Date().toLocaleDateString()}</strong></td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Reference</td>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>${ctx.transactionReference || "See receipt"}</strong></td>
        </tr>
      </table>
      <p>Your receipt has been sent separately. Keep it for your records.</p>
      <div style="margin: 30px 0;">
        <a href="${process.env.APP_URL}/invoices/${ctx.invoiceId}" 
           style="background-color: #007bff; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;">
          View Invoice & Receipt
        </a>
      </div>
    `,
  }),

  payment_failed: (ctx) => ({
    subject: `⚠️ Payment Failed - Invoice ${ctx.invoiceNumber}`,
    html: `
      <h3>Your Payment Could Not Be Processed</h3>
      <p>Hi ${ctx.contactName || "there"},</p>
      <p>Your payment attempt for invoice <strong>${ctx.invoiceNumber}</strong> was unsuccessful.</p>
      <p style="background-color: #fff3e0; padding: 15px; border-left: 4px solid #ff9800;">
        <strong>Reason:</strong> ${ctx.failureReason || "Card was declined or payment processor returned an error"}
      </p>
      <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Invoice</td>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>${ctx.invoiceNumber}</strong></td>
        </tr>
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd;">Amount</td>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>${formatCurrency(ctx.amount)}</strong></td>
        </tr>
      </table>
      <p><strong>We will automatically retry your payment in 3 days.</strong></p>
      <p>If you'd like to try again now:</p>
      <div style="margin: 30px 0;">
        <a href="${process.env.APP_URL}/invoices/${ctx.invoiceId}" 
           style="background-color: #007bff; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;">
          Retry Payment
        </a>
      </div>
      <p style="margin-top: 30px;">
        <strong>Having issues?</strong><br/>
        Try a different payment method or contact <a href="mailto:support@kiini.africa">support@kiini.africa</a>
      </p>
    `,
  }),

  invoice_generated: (ctx) => ({
    subject: `📄 New Invoice: ${ctx.invoiceNumber}`,
    html: `
      <h2>New Invoice Ready</h2>
      <p>Hi ${ctx.contactName || "there"},</p>
      <p>A new invoice has been generated for <strong>${ctx.organizationName}</strong>.</p>
      <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd;">Invoice Number</td>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>${ctx.invoiceNumber}</strong></td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Amount</td>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>${formatCurrency(ctx.amount)}</strong></td>
        </tr>
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd;">Due Date</td>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>${ctx.dueDate}</strong></td>
        </tr>
      </table>
      <div style="margin: 30px 0;">
        <a href="${process.env.APP_URL}/invoices/${ctx.invoiceId}" 
           style="background-color: #007bff; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;">
          View Invoice
        </a>
      </div>
    `,
  }),

  subscription_upgraded: (ctx) => ({
    subject: `🎉 Welcome to ${ctx.newPricingTier}!`,
    html: `
      <h2>Congratulations on Your Upgrade!</h2>
      <p>Hi ${ctx.contactName || "there"},</p>
      <p>Your Kiini subscription has been successfully upgraded to <strong>${ctx.newPricingTier}</strong>.</p>
      <h4>New Features Now Available:</h4>
      <ul>
        ${ctx.newFeatures?.map((f: string) => `<li>✅ ${f}</li>`).join("") || ""}
      </ul>
      <p>Your team of <strong>${ctx.maxUsers} users</strong> can now access all advanced features.</p>
      <div style="margin: 30px 0;">
        <a href="${process.env.APP_URL}/admin/features" 
           style="background-color: #4caf50; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;">
          Explore New Features
        </a>
      </div>
    `,
  }),

  subscription_downgraded: (ctx) => ({
    subject: `Plan Downgrade Complete`,
    html: `
      <h2>Your Plan Has Been Downgraded</h2>
      <p>Hi ${ctx.contactName || "there"},</p>
      <p>Your subscription has been downgraded to <strong>${ctx.newPricingTier}</strong> effective immediately.</p>
      <p style="background-color: #fff3e0; padding: 15px;">
        <strong>Note:</strong> Some features may no longer be available at this tier. Users above your new limit will need to be archived.
      </p>
    `,
  }),

  subscription_canceled: (ctx) => ({
    subject: `Subscription Canceled`,
    html: `
      <h2>Your Subscription Has Been Canceled</h2>
      <p>Hi ${ctx.contactName || "there"},</p>
      <p>Your Kiini subscription has been canceled effective <strong>${ctx.effectiveDate}</strong>.</p>
      <p>Your data will be retained for 30 days. You can reactivate your account anytime by upgrading to a paid plan.</p>
      <div style="margin: 30px 0;">
        <a href="${process.env.APP_URL}/pricing" 
           style="background-color: #007bff; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;">
          Reactivate Your Account
        </a>
      </div>
    `,
  }),
};

/**
 * Send email using SendGrid
 */
export async function sendEmail(
  to: string,
  template: EmailTemplate,
  context: EmailContext
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const templateGenerator = emailTemplates[template];
    if (!templateGenerator) {
      throw new Error(`Unknown email template: ${template}`);
    }

    const { subject, html } = templateGenerator(context);

    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL || "info@kiini.africa",
      subject,
      html,
      replyTo: "support@kiini.africa",
    };

    const response = await sgMail.send(msg);

    console.log(`📧 Email sent (${template}) to ${to}`);

    // Log email in database
    try {
      const db = await getDb();
      if (db) {
        await db.insert(auditLogs).values({
          id: randomUUID(),
          userId: "email-service",
          action: "email_sent",
          resourceType: "email",
          resourceId: template,
          changes: JSON.stringify({ organizationId: context.organizationId, to, template, subject, status: "sent" }),
          ipAddress: "internal",
          userAgent: "SendGrid",
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        });
      }
    } catch (logError) {
      console.warn("Failed to log email send:", logError);
    }

    return {
      success: true,
      messageId: response[0].headers["x-message-id"],
    };

  } catch (error: any) {
    console.error(`❌ Error sending email (${template}):`, error.message);

    // Log error
    try {
      const db = await getDb();
      if (db && context.organizationId) {
        await db.insert(auditLogs).values({
          id: randomUUID(),
          userId: "email-service",
          action: "email_failed",
          resourceType: "email",
          resourceId: template,
          changes: JSON.stringify({ organizationId: context.organizationId, to: context.email, template, error: error.message }),
          ipAddress: "internal",
          userAgent: "SendGrid",
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        });
      }
    } catch (logError) {
      // Ignore logging errors
    }

    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Send batch emails
 */
export async function sendEmailBatch(
  recipients: Array<{ email: string; context: EmailContext }>,
  template: EmailTemplate
) {
  console.log(`📧 Sending ${recipients.length} emails (${template})...`);

  const results = {
    sent: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const recipient of recipients) {
    const result = await sendEmail(recipient.email, template, recipient.context);
    if (result.success) {
      results.sent++;
    } else {
      results.failed++;
      results.errors.push(`${recipient.email}: ${result.error}`);
    }

    // Rate limiting: 10 emails per second max
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log(
    `✅ Batch complete: ${results.sent} sent, ${results.failed} failed`
  );
  return results;
}

export default {
  sendEmail,
  sendEmailBatch,
  emailTemplates,
};
