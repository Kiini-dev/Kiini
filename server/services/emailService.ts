/**
 * Email Service with Queue Management
 * Handles email queuing, retry logic, template rendering, and delivery tracking
 * 
 * SMTP configuration is resolved from environment variables first,
 * then falls back to database settings (Settings → Email).
 */

import { TRPCError } from '@trpc/server';
import { sendEmail } from '../_core/mail';
import * as db from '../db';
import { v4 as uuidv4 } from 'uuid';
import { renderNotificationTemplate } from './notificationRenderer';

interface QueueEmailInput {
  toEmail: string;
  subject: string;
  templateId?: string;
  templateVariables?: Record<string, any>;
  htmlContent?: string;
  plainTextContent?: string;
  attachments?: any[];
  relatedEntityType?: string;
  relatedEntityId?: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  plainTextContent?: string;
  variables?: string[];
}

function restoreQueuedAttachments(value: unknown): Array<{ filename: string; content: string | Buffer; contentType?: string; cid?: string }> | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.map((attachment: any) => ({
    ...attachment,
    content: attachment?.content?.type === "Buffer" && Array.isArray(attachment.content.data)
      ? Buffer.from(attachment.content.data)
      : typeof attachment?.contentBase64 === "string"
        ? Buffer.from(attachment.contentBase64, "base64")
        : attachment?.content,
  })).filter((attachment) => typeof attachment.filename === "string" && attachment.content !== undefined);
}

class EmailService {
  private emailFrom: string;

  constructor() {
    this.emailFrom = process.env.EMAIL_FROM || 'noreply@crm.local';
  }

  /**
   * Queue an email for sending
   */
  async queueEmail(input: QueueEmailInput): Promise<{ queueId: string }> {
    try {
      const database = await db.getDb();
      if (!database) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database connection failed',
        });
      }

      const emailQueue = (await import('../../drizzle/schema')).emailQueue;
      const queueId = uuidv4();

      await database.insert(emailQueue).values({
        id: queueId,
        recipientEmail: input.toEmail,
        subject: input.subject,
        htmlContent: input.htmlContent ?? '',
        textContent: input.plainTextContent,
        eventType: input.templateId || 'manual',
        status: 'pending',
        entityType: input.relatedEntityType,
        entityId: input.relatedEntityId,
        metadata: JSON.stringify({ templateId: input.templateId, templateVariables: input.templateVariables, attachments: input.attachments }),
      });

      return { queueId };
    } catch (error) {
      console.error('[Email] Queue error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to queue email',
      });
    }
  }

  /**
   * Send email immediately (bypasses queue)
   */
  async sendEmailImmediately(input: QueueEmailInput): Promise<{ success: boolean; messageId?: string }> {
    try {
      let subject = input.subject;
      let html = input.htmlContent;
      let text = input.plainTextContent;

      if (input.templateId) {
        const rendered = await renderNotificationTemplate(
          input.templateId,
          { ...(input.templateVariables || {}), recipientEmail: input.toEmail },
          { subject, html: html || "", text },
        );
        subject = rendered.subject;
        html = rendered.html;
        text = rendered.text;
      }

      const result = await sendEmail({
        to: input.toEmail,
        subject,
        html,
        text,
        attachments: input.attachments,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to send email');
      }

      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('[Email] Send error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to send email',
      });
    }
  }

  /**
   * Process email queue (background job)
   */
  async processEmailQueue(batchSize: number = 10): Promise<{ sent: number; failed: number }> {
    try {
      const database = await db.getDb();
      if (!database) {
        throw new Error('Database connection lost');
      }

      const emailQueue = (await import('../../drizzle/schema')).emailQueue;
      const { eq, and, lt, isNull, or } = await import('drizzle-orm');

      // Get pending emails that are ready to retry
      const nowDate = new Date();
      const now = nowDate.toISOString().replace('T', ' ').substring(0, 19);
      const pendingEmails = await database.select()
        .from(emailQueue)
        .where(
          and(
            eq(emailQueue.status, 'pending' as any),
            or(
              isNull(emailQueue.nextRetryAt),
              lt(emailQueue.nextRetryAt, now)
            )
          )
        )
        .limit(batchSize);

      let sent = 0;
      let failed = 0;

      for (const email of pendingEmails) {
        try {
          // Update status to sending
          await database.update(emailQueue)
            .set({ status: 'retrying' as any })
            .where(eq(emailQueue.id, email.id));

          let subject = email.subject;
          let html = email.htmlContent;
          let text = email.textContent;
          let attachments: ReturnType<typeof restoreQueuedAttachments>;
          if (email.metadata) {
            const metadata = JSON.parse(email.metadata);
            attachments = restoreQueuedAttachments(metadata.attachments);
            if (metadata.templateId) {
              const rendered = await renderNotificationTemplate(
                metadata.templateId,
                { ...(metadata.templateVariables || {}), recipientEmail: email.recipientEmail },
                { subject, html, text: text || undefined },
              );
              subject = rendered.subject;
              html = rendered.html;
              text = rendered.text;
            }
          }

          // Send email via shared mail module (reads SMTP from env + DB settings)
          const result = await sendEmail({
            to: email.recipientEmail,
            subject,
            html,
            text: text || undefined,
            attachments,
          });

          if (!result.success) {
            throw new Error(result.error || 'Send failed');
          }

          // Mark as sent
          await database.update(emailQueue)
            .set({
              status: 'sent' as any,
              sentAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
            })
            .where(eq(emailQueue.id, email.id));

          sent++;
        } catch (error) {
          failed++;
          const attemptCount = (email.attempts || 0) + 1;
          const maxAttempts = email.maxAttempts || 3;

          if (attemptCount < maxAttempts) {
            // Schedule retry (exponential backoff: 5min, 15min, 60min)
            const delayMinutes = [5, 15, 60][attemptCount - 1] || 60;
            const nextRetry = new Date(nowDate.getTime() + delayMinutes * 60 * 1000);
            const nextRetryStr = nextRetry.toISOString().replace('T', ' ').substring(0, 19);

            await database.update(emailQueue)
              .set({
                status: 'pending' as any,
                attempts: attemptCount,
                nextRetryAt: nextRetryStr,
                errorMessage: error instanceof Error ? error.message : String(error),
              })
              .where(eq(emailQueue.id, email.id));
          } else {
            // Max retries exhausted
            await database.update(emailQueue)
              .set({
                status: 'failed' as any,
                attempts: attemptCount,
                errorMessage: `Failed after ${maxAttempts} attempts: ${error instanceof Error ? error.message : String(error)}`,
              })
              .where(eq(emailQueue.id, email.id));
          }
        }
      }

      return { sent, failed };
    } catch (error) {
      console.error('[Email] Queue processing error:', error);
      return { sent: 0, failed: 0 };
    }
  }

  /**
   * Get email queue status
   */
  async getQueueStatus() {
    try {
      const database = await db.getDb();
      if (!database) throw new Error('Database connection lost');

      const emailQueue = (await import('../../drizzle/schema')).emailQueue;

      const counts = await database.select()
        .from(emailQueue);

      const statuses = {
        pending: counts.filter((e) => e.status === 'pending').length,
        sending: counts.filter((e) => e.status === 'retrying').length,
        sent: counts.filter((e) => e.status === 'sent').length,
        failed: counts.filter((e) => e.status === 'failed').length,
        bounced: counts.filter((e) => e.status === 'failed').length,
      };

      return statuses;
    } catch (error) {
      console.error('[Email] Queue status error:', error);
      return { pending: 0, sending: 0, sent: 0, failed: 0, bounced: 0 };
    }
  }

  /**
   * Get configured status
   */
  getStatus() {
    return {
      isConfigured: true, // Config is resolved lazily from env + DB settings
      emailFrom: this.emailFrom,
    };
  }
}

// Singleton instance
const emailService = new EmailService();

export default emailService;
export const queueEmail = (input: QueueEmailInput) => emailService.queueEmail(input);
export const sendEmailImmediately = (input: QueueEmailInput) => emailService.sendEmailImmediately(input);
export const processEmailQueue = (batchSize?: number) => emailService.processEmailQueue(batchSize);
export const getEmailQueueStatus = () => emailService.getQueueStatus();
export const getEmailStatus = () => emailService.getStatus();
