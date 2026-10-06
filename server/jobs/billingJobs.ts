import cron from 'node-cron';
import { db } from '../db';
import { invoices, organizations, organizationSubscriptions, paymentTriggers } from '../../drizzle/schema';
import { and, eq, lt, lte, gte, isNull } from 'drizzle-orm';
import { sendSystemEmail } from '../services/systemEmailService';
import { logger } from '../_core/logger';

const safeOrgEmail = (org: any) => org?.billingEmail || org?.contactEmail || org?.email || '';
const emailCompany = (org: any) => ({
  name: org?.name,
  email: safeOrgEmail(org),
  address: org?.address,
  website: org?.website,
  logo: org?.logoUrl,
  currency: org?.currency,
});
const orgBillingUrl = (org: any) => {
  const baseUrl = (process.env.APP_URL || process.env.PUBLIC_APP_URL || 'https://kiini.africa').replace(/\/$/, '');
  return `${baseUrl}${org?.slug ? `/org/${encodeURIComponent(org.slug)}/billing` : '/billing'}`;
};

/**
 * Billing Automation Jobs
 * Runs automated billing tasks via cron schedule
 */

/**
 * Daily job: Check trial expirations and convert to paid
 * Runs at 2 AM UTC every day
 */
export function scheduleTrialExpirationCheck() {
  cron.schedule('0 2 * * *', async () => {
    try {
      logger.info('[Cron] Starting trial expiration check...');

      // Find orgs with trials ending today
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const expiringTrials = await db.query.organizationSubscriptions.findMany({
        where: and(
          gte((organizationSubscriptions as any).trialEndDate, today.toISOString().slice(0, 10)),
          lt((organizationSubscriptions as any).trialEndDate, tomorrow.toISOString().slice(0, 10)),
          eq((organizationSubscriptions as any).status, 'trial')
        ),
        with: { organization: true },
      });

      logger.info(`[Cron] Found ${expiringTrials.length} expiring trials`);

      for (const subscription of expiringTrials) {
        try {
          // Generate first invoice
          const invoiceId = `INV-${subscription.organizationId}-${Date.now()}`;

          const org = subscription.organization as typeof organizations.$inferSelect;
          const invoice = await db.insert(invoices).values({
            id: invoiceId,
            organizationId: subscription.organizationId,
            invoiceNumber: `INV-${new Date().getFullYear()}-${Math.random().toString().slice(2, 6)}`,
            status: 'pending',
            issueDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
            total: getPricingTierPrice((subscription as any).currentTier || 'Starter'),
            taxAmount: 0,
            discountAmount: 0,
            createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
            updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
          } as any);

          // Update subscription to paid status
          await db
            .update(organizationSubscriptions)
            .set({
              status: 'active',
              renewalDate: new Date(),
              updatedAt: new Date(),
            } as any)
            .where(eq((organizationSubscriptions as any).organizationId, subscription.organizationId));

          // Send notification email
          await sendSystemEmail('admin/admin_general_notice', {
            recipientEmail: safeOrgEmail(org),
            recipientName: org.name,
            recipient_first_name: org.name,
            company: emailCompany(org),
            app_name: 'Kiini',
            notice_title: 'Your trial has ended',
            notice_category: 'Subscription billing',
            notice_message: 'Your subscription has been converted to a paid plan.',
            notice_details: `Invoice: ${invoiceId}`,
            action_label: 'Open billing',
            action_url: orgBillingUrl(org),
            sent_at: new Date().toLocaleString(),
          }, {
            subject: 'Trial ended - subscription converted to paid',
            html: `<p>Your trial has ended. Invoice: ${invoiceId}</p>`,
            text: `Your trial has ended and your subscription has been converted to a paid plan. Invoice: ${invoiceId}`,
          });

          logger.info(`[Cron] Trial converted to paid: ${subscription.organizationId}`);
        } catch (error) {
          logger.error(`[Cron] Error processing trial expiration: ${subscription.organizationId}`, error);
        }
      }
    } catch (error) {
      logger.error('[Cron] Trial expiration check error:', error);
    }
  });

  logger.info('[Cron] Trial expiration check scheduled (daily at 2 AM UTC)');
}

/**
 * Daily job: Check for invoices due for renewal
 * Runs at 3 AM UTC every day
 */
export function scheduleRenewalInvoiceGeneration() {
  cron.schedule('0 3 * * *', async () => {
    try {
      logger.info('[Cron] Starting renewal invoice generation...');

      // Find subscriptions where next billing date is today
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const renewalDue = await db.query.organizationSubscriptions.findMany({
        where: and(
          gte((organizationSubscriptions as any).nextBillingDate, today.toISOString().slice(0, 10)),
          lt((organizationSubscriptions as any).nextBillingDate, tomorrow.toISOString().slice(0, 10)),
          eq((organizationSubscriptions as any).autoRenew, true),
          eq((organizationSubscriptions as any).status, 'active')
        ),
        with: { organization: true },
      });

      logger.info(`[Cron] Found ${renewalDue.length} renewals due`);

      for (const subscription of renewalDue) {
        try {
          const org = subscription.organization as typeof organizations.$inferSelect;
          const invoiceId = `INV-${subscription.organizationId}-REN-${Date.now()}`;

          // Create renewal invoice
          await db.insert(invoices).values({
            id: invoiceId,
            organizationId: subscription.organizationId,
            invoiceNumber: `INV-${new Date().getFullYear()}-${Math.random().toString().slice(2, 6)}`,
            status: 'pending',
            issueDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
            total: getPricingTierPrice((subscription as any).currentTier || 'Starter'),
            taxAmount: 0,
            discountAmount: 0,
            createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
            updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
          } as any);

          // Update next billing date
          const nextDate = new Date();
          nextDate.setMonth(nextDate.getMonth() + (subscription.billingCycleMonths || 1));

          await db
            .update(organizationSubscriptions)
            .set({
              nextBillingDate: nextDate,
              updatedAt: new Date(),
            })
            .where(eq(organizationSubscriptions.organizationId, subscription.organizationId));

          // Send notification
          await sendSystemEmail('admin/admin_general_notice', {
            recipientEmail: safeOrgEmail(org),
            recipientName: org.name,
            recipient_first_name: org.name,
            company: emailCompany(org),
            app_name: 'Kiini',
            notice_title: 'Renewal invoice generated',
            notice_category: 'Subscription billing',
            notice_message: 'A renewal invoice has been generated for your subscription.',
            notice_details: `Invoice: ${invoiceId}`,
            action_label: 'Open billing',
            action_url: orgBillingUrl(org),
            sent_at: new Date().toLocaleString(),
          }, {
            subject: 'Renewal invoice generated',
            html: `<p>A renewal invoice has been generated. Invoice: ${invoiceId}</p>`,
            text: `A renewal invoice has been generated for your subscription. Invoice: ${invoiceId}`,
          });

          logger.info(`[Cron] Renewal invoice generated: ${subscription.organizationId}`);
        } catch (error) {
          logger.error(`[Cron] Error generating renewal invoice: ${subscription.organizationId}`, error);
        }
      }
    } catch (error) {
      logger.error('[Cron] Renewal invoice generation error:', error);
    }
  });

  logger.info('[Cron] Renewal invoice generation scheduled (daily at 3 AM UTC)');
}

/**
 * Daily job: Send payment reminders
 * - 7 days before due date
 * - 1 day before due date
 * - On overdue date
 * Runs at 4 AM UTC every day
 */
export function schedulePaymentReminders() {
  cron.schedule('0 4 * * *', async () => {
    try {
      logger.info('[Cron] Starting payment reminder sending...');

      const now = new Date();

      // 7 days reminder
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const sevenDaysStart = new Date(sevenDaysFromNow.getFullYear(), sevenDaysFromNow.getMonth(), sevenDaysFromNow.getDate());
      const sevenDaysEnd = new Date(sevenDaysStart);
      sevenDaysEnd.setDate(sevenDaysEnd.getDate() + 1);

      const sevenDaysPending = await db.query.invoices.findMany({
        where: and(
          gte(invoices.dueDate, sevenDaysStart.toISOString().slice(0, 19).replace('T', ' ')),
          lt(invoices.dueDate, sevenDaysEnd.toISOString().slice(0, 19).replace('T', ' ')),
          eq(invoices.status, 'pending'),
          isNull((invoices as any).reminderSent7Days)
        ),
        with: { organization: true },
      });

      for (const invoice of sevenDaysPending) {
        try {
          const org = invoice.organization as typeof organizations.$inferSelect;

          await sendSystemEmail('admin/admin_subscription_expiry', {
            recipientEmail: safeOrgEmail(org),
            recipientName: org.name,
            recipient_first_name: org.name,
            company: emailCompany(org),
            app_name: 'Kiini',
            tenant_name: org.name,
            plan_name: 'Subscription',
            days_remaining: '7',
            expiry_date: new Date(invoice.dueDate).toLocaleDateString(),
            renewal_amount: String(invoice.total || 0),
            currency: org.currency || 'KES',
            subscription_url: orgBillingUrl(org),
          }, {
            subject: `Payment due soon - Invoice ${invoice.invoiceNumber}`,
            html: `<p>Your invoice ${invoice.invoiceNumber} is due in 7 days.</p>`,
            text: `Your invoice ${invoice.invoiceNumber} is due in 7 days.`,
          });

          // Mark as sent
          await db
            .update(invoices)
            .set({
              reminderSent7Days: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(invoices.id, invoice.id));

          logger.info(`[Cron] 7-day reminder sent: ${invoice.id}`);
        } catch (error) {
          logger.error(`[Cron] Error sending 7-day reminder: ${invoice.id}`, error);
        }
      }

      // 1 day reminder (similar logic)
      const oneDayFromNow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
      const oneDayStart = new Date(oneDayFromNow.getFullYear(), oneDayFromNow.getMonth(), oneDayFromNow.getDate());
      const oneDayEnd = new Date(oneDayStart);
      oneDayEnd.setDate(oneDayEnd.getDate() + 1);

      const oneDayPending = await db.query.invoices.findMany({
        where: and(
          gte(invoices.dueDate, oneDayStart.toISOString().slice(0, 19).replace('T', ' ')),
          lt(invoices.dueDate, oneDayEnd.toISOString().slice(0, 19).replace('T', ' ')),
          eq(invoices.status, 'pending'),
          isNull((invoices as any).reminderSent1Day)
        ),
        with: { organization: true },
      });

      for (const invoice of oneDayPending) {
        try {
          const org = invoice.organization as typeof organizations.$inferSelect;

          await sendSystemEmail('admin/admin_subscription_expiry', {
            recipientEmail: safeOrgEmail(org),
            recipientName: org.name,
            recipient_first_name: org.name,
            company: emailCompany(org),
            app_name: 'Kiini',
            tenant_name: org.name,
            plan_name: 'Subscription',
            days_remaining: '1',
            expiry_date: new Date(invoice.dueDate).toLocaleDateString(),
            renewal_amount: String(invoice.total || 0),
            currency: org.currency || 'KES',
            subscription_url: orgBillingUrl(org),
          }, {
            subject: `Payment due tomorrow - Invoice ${invoice.invoiceNumber}`,
            html: `<p>Your invoice ${invoice.invoiceNumber} is due tomorrow.</p>`,
            text: `Your invoice ${invoice.invoiceNumber} is due tomorrow.`,
          });

          await db
            .update(invoices)
            .set({
              reminderSent1Day: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(invoices.id, invoice.id));

          logger.info(`[Cron] 1-day reminder sent: ${invoice.id}`);
        } catch (error) {
          logger.error(`[Cron] Error sending 1-day reminder: ${invoice.id}`, error);
        }
      }
    } catch (error) {
      logger.error('[Cron] Payment reminder error:', error);
    }
  });

  logger.info('[Cron] Payment reminders scheduled (daily at 4 AM UTC)');
}

/**
 * Daily job: Lock overdue subscriptions
 * If payment is overdue 3+ days, lock subscription access
 * Runs at 5 AM UTC every day
 */
export function scheduleOverdueSubscriptionLock() {
  cron.schedule('0 5 * * *', async () => {
    try {
      logger.info('[Cron] Starting overdue subscription lock...');

      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

      // Find pending invoices overdue 3+ days
      const overdueInvoices = await db.query.invoices.findMany({
        where: and(
          lte(invoices.dueDate, threeDaysAgo.toISOString().slice(0, 19).replace('T', ' ')),
          eq(invoices.status, 'pending')
        ),
        with: { organization: true },
      });

      logger.info(`[Cron] Found ${overdueInvoices.length} overdue invoices`);

      for (const invoice of overdueInvoices) {
        try {
          const org = invoice.organization as typeof organizations.$inferSelect;

          // Lock subscription
          await db
            .update(organizationSubscriptions)
            .set({
              status: 'suspended',
              updatedAt: new Date(),
            } as any)
            .where(eq((organizationSubscriptions as any).organizationId, invoice.organizationId));

          // Send urgent payment required email
          await sendSystemEmail('user/account_suspended', {
            recipientEmail: safeOrgEmail(org),
            recipientName: org.name,
            recipient_first_name: org.name,
            company: emailCompany(org),
            app_name: 'Kiini',
            suspension_date: new Date().toLocaleDateString(),
            suspension_reason: `Payment overdue on invoice ${invoice.invoiceNumber}.`,
            restoration_steps: `Open ${orgBillingUrl(org)}, pay the outstanding invoice, and contact billing support if you need help restoring service.`,
          }, {
            subject: 'Account suspended - payment required',
            html: `<p>Your account has been suspended due to overdue payment on invoice ${invoice.invoiceNumber}.</p>`,
            text: `Your account has been suspended due to overdue payment on invoice ${invoice.invoiceNumber}.`,
          });

          logger.info(`[Cron] Subscription locked (overdue): ${invoice.organizationId}`);
        } catch (error) {
          logger.error(`[Cron] Error locking subscription: ${invoice.organizationId}`, error);
        }
      }
    } catch (error) {
      logger.error('[Cron] Overdue subscription lock error:', error);
    }
  });

  logger.info('[Cron] Overdue subscription lock scheduled (daily at 5 AM UTC)');
}

/**
 * Initialize all billing automation jobs
 */
export function initializeBillingAutomation() {
  logger.info('[Cron] Initializing billing automation jobs...');

  scheduleTrialExpirationCheck();
  scheduleRenewalInvoiceGeneration();
  schedulePaymentReminders();
  scheduleOverdueSubscriptionLock();

  logger.info('[Cron] All billing automation jobs initialized');
}

/**
 * Get pricing for tier
 * TODO: Fetch from pricingTierDescriptions table
 */
function getPricingTierPrice(tier: string): number {
  const prices: Record<string, number> = {
    Trial: 0,
    'Accounting-Only': 49,
    Starter: 99,
    Growth: 199,
    Professional: 399,
    Enterprise: 999, // Placeholder for custom
  };

  return prices[tier] || 0;
}
