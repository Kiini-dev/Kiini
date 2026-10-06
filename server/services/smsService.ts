/**
 * SMS Service with Queue Management (Africa's Talking)
 * Handles SMS queuing, delivery tracking, and customer preferences
 * 
 * Environment Variables Required:
 * - SMS_PROVIDER: 'africa_talking', 'twilio', or 'custom'
 * - AFRICA_TALKING_API_KEY: Africa's Talking API key
 * - AFRICA_TALKING_USERNAME: Africa's Talking username
 * - AFRICA_TALKING_SHORT_CODE: SMS short code
 */

import axios, { AxiosInstance } from 'axios';
import { TRPCError } from '@trpc/server';
import * as db from '../db';
import { v4 as uuidv4 } from 'uuid';
import { isNull } from 'drizzle-orm';

interface QueueSmsInput {
  phoneNumber: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  organizationId?: string;
  createdBy?: string;
  templateId?: string;
  batchId?: string;
  metadata?: any;
}

interface SendSmsResponse {
  queueId: string;
  success: boolean;
}

class SMSService {
  private apiClient: AxiosInstance;
  private provider: 'africa_talking' | 'twilio' | 'custom';
  private isConfigured: boolean = false;
  private apiKey: string;
  private username: string;
  private shortCode: string;
  private customEndpoint: string;
  private customApiKeyHeader: string;

  constructor() {
    this.provider = (process.env.SMS_PROVIDER as any) || 'africa_talking';
    this.apiKey = process.env.AFRICA_TALKING_API_KEY || '';
    this.username = process.env.AFRICA_TALKING_USERNAME || '';
    this.shortCode = process.env.AFRICA_TALKING_SHORT_CODE || '';
    this.customEndpoint = process.env.CUSTOM_SMS_ENDPOINT || process.env.NOTIFICATION_SMS_ENDPOINT || '';
    this.customApiKeyHeader = process.env.CUSTOM_SMS_API_KEY_HEADER || process.env.NOTIFICATION_SMS_API_KEY_HEADER || 'x-api-key';
    if (this.provider === 'custom') {
      this.apiKey = process.env.CUSTOM_SMS_API_KEY || process.env.NOTIFICATION_SMS_API_KEY || process.env.SMS_API_KEY || '';
    }

    this.apiClient = axios.create({
      baseURL: 'https://api.africastalking.com/version1',
      timeout: 10000,
    });

    if (this.provider === 'custom' && this.apiKey && this.customEndpoint || this.provider === 'africa_talking' && this.apiKey && this.username && this.shortCode) {
      this.isConfigured = true;
      console.log('[SMS] Service initialized successfully');
    } else {
      console.warn('[SMS] SMS credentials not configured - SMS will be queued but not sent');
    }
  }

  /**
   * Queue an SMS for sending
   */
  async queueSms(input: QueueSmsInput): Promise<SendSmsResponse> {
    try {
      const database = await db.getDb();
      if (!database) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database connection failed',
        });
      }

      // Validate phone number
      if (!this.isValidPhoneNumber(input.phoneNumber)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid phone number format',
        });
      }

      const smsQueue = (await import('../../drizzle/schema')).smsQueue;
      const queueId = uuidv4();

      await database.insert(smsQueue).values({
        id: queueId,
        phoneNumber: input.phoneNumber,
        message: input.message,
        provider: this.provider as any,
        status: 'pending',
        relatedEntityType: input.relatedEntityType,
        relatedEntityId: input.relatedEntityId,
        organizationId: input.organizationId,
        createdBy: input.createdBy,
        templateId: input.templateId,
        batchId: input.batchId,
        metadata: input.metadata || null,
        attemptCount: 0,
        maxAttempts: 3,
      });

      return { queueId, success: true };
    } catch (error) {
      console.error('[SMS] Queue error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to queue SMS',
      });
    }
  }

  /**
   * Send SMS immediately (bypasses queue)
   */
  async sendSmsImmediately(
    phoneNumberOrInput: string | { phoneNumber: string; message: string; relatedEntityType?: string; relatedEntityId?: string },
    maybeMessage?: string
  ): Promise<{ success: boolean; reference?: string }> {
    const phoneNumber = typeof phoneNumberOrInput === 'string' ? phoneNumberOrInput : phoneNumberOrInput.phoneNumber;
    const message = typeof phoneNumberOrInput === 'string' ? (maybeMessage ?? '') : phoneNumberOrInput.message;

    if (!this.isConfigured) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'SMS service is not configured',
      });
    }

    try {
      if (this.provider === 'custom') {
        const response = await axios.post(this.customEndpoint, {
          to: this.formatPhoneNumber(phoneNumber),
          phoneNumber: this.formatPhoneNumber(phoneNumber),
          message: message.slice(0, 160),
        }, {
          timeout: 10000,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            [this.customApiKeyHeader]: this.apiKey,
          },
        });
        return {
          success: response.status >= 200 && response.status < 300,
          reference: response.data?.messageId || response.data?.id || response.data?.reference || 'accepted',
        };
      }

      const response = await this.apiClient.post(
        '/messaging',
        {
          username: this.username,
          to: this.formatPhoneNumber(phoneNumber),
          message: message.slice(0, 160), // SMS length limit
        },
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            apiKey: this.apiKey,
          },
        }
      );

      const responseData = response.data.SMSMessageData?.Recipients?.[0];
      const success = responseData?.statusCode === 0;

      return {
        success,
        reference: responseData?.messageId,
      };
    } catch (error) {
      console.error('[SMS] Send error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to send SMS',
      });
    }
  }

  /**
   * Process SMS queue (background job)
   */
  async processSmsQueue(batchSize: number = 20): Promise<{ sent: number; failed: number }> {
    if (!this.isConfigured) {
      console.warn('[SMS] SMS service not configured - skipping queue processing');
      return { sent: 0, failed: 0 };
    }

    try {
      const database = await db.getDb();
      if (!database) {
        throw new Error('Database connection lost');
      }

      const smsQueue = (await import('../../drizzle/schema')).smsQueue;
      const { eq, and, or, lt } = await import('drizzle-orm');

      // Get pending SMS ready to retry
      const now = new Date();
      const nowStr = now.toISOString().replace('T', ' ').substring(0, 19);
      const pendingSms = await database.select()
        .from(smsQueue)
        .where(
          and(
            eq(smsQueue.status, 'pending' as any),
            or(
              isNull(smsQueue.nextRetryAt),
              lt(smsQueue.nextRetryAt, nowStr)
            )
          )
        )
        .limit(batchSize);

      let sent = 0;
      let failed = 0;

      for (const sms of pendingSms) {
        try {
          // Update status to sending
          await database.update(smsQueue)
            .set({ status: 'queued' as any })
            .where(eq(smsQueue.id, sms.id));

          // Send SMS
          const result = await this.sendSmsImmediately(sms.phoneNumber, sms.message);

          if (result.success) {
            // Mark as sent (delivery status will be updated by callback)
            await database.update(smsQueue)
              .set({
                status: 'sent' as any,
                sentAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                providerReference: result.reference,
              })
              .where(eq(smsQueue.id, sms.id));

            sent++;
          } else {
            throw new Error('Provider returned non-success status');
          }
        } catch (error) {
          failed++;
          const attemptCount = (sms.attemptCount || 0) + 1;
          const maxAttempts = sms.maxAttempts || 3;

          if (attemptCount < maxAttempts) {
            // Schedule retry
            const delaySeconds = [60, 300, 900][attemptCount - 1] || 900; // 1min, 5min, 15min
            const nextRetry = new Date(now.getTime() + delaySeconds * 1000);
            const nextRetryStr = nextRetry.toISOString().replace('T', ' ').substring(0, 19);

            await database.update(smsQueue)
              .set({
                status: 'pending' as any,
                attemptCount,
                nextRetryAt: nextRetryStr,
                failureReason: error instanceof Error ? error.message : String(error),
              })
              .where(eq(smsQueue.id, sms.id));
          } else {
            // Max retries exhausted
            await database.update(smsQueue)
              .set({
                status: 'failed' as any,
                attemptCount,
                failureReason: `Failed after ${maxAttempts} attempts`,
              })
              .where(eq(smsQueue.id, sms.id));
          }
        }
      }

      return { sent, failed };
    } catch (error) {
      console.error('[SMS] Queue processing error:', error);
      return { sent: 0, failed: 0 };
    }
  }

  /**
   * Get SMS queue status
   */
  async getQueueStatus() {
    try {
      const database = await db.getDb();
      if (!database) throw new Error('Database connection lost');

      const smsQueue = (await import('../../drizzle/schema')).smsQueue;

      const messages = await database.select().from(smsQueue);

      return {
        pending: messages.filter((m) => m.status === 'pending').length,
        queued: messages.filter((m) => m.status === 'queued').length,
            sent: messages.filter((m) => m.deliveryStatus === 'sent').length,
        delivered: messages.filter((m) => m.status === 'delivered').length,
        failed: messages.filter((m) => m.status === 'failed').length,
      };
    } catch (error) {
      console.error('[SMS] Queue status error:', error);
      return { pending: 0, queued: 0, sent: 0, delivered: 0, failed: 0 };
    }
  }

  /**
   * Get customer SMS preferences
   */
  async getCustomerPreferences(clientId: string) {
    try {
      const database = await db.getDb();
      if (!database) throw new Error('Database connection lost');

      const smsCustomerPreferences = (await import('../../drizzle/schema')).smsCustomerPreferences;
      const { eq } = await import('drizzle-orm');

      const prefs = await database.select()
        .from(smsCustomerPreferences)
        .where(eq(smsCustomerPreferences.clientId, clientId))
        .limit(1);

      return prefs[0] || null;
    } catch (error) {
      console.error('[SMS] Get preferences error:', error);
      return null;
    }
  }

  /**
   * Update customer SMS preferences
   */
  async updateCustomerPreferences(clientId: string, preferences: Partial<any>) {
    try {
      const database = await db.getDb();
      if (!database) throw new Error('Database connection lost');

      const smsCustomerPreferences = (await import('../../drizzle/schema')).smsCustomerPreferences;
      const { eq } = await import('drizzle-orm');

      const existing = await database.select()
        .from(smsCustomerPreferences)
        .where(eq(smsCustomerPreferences.clientId, clientId));

      if (existing.length > 0) {
        await database.update(smsCustomerPreferences)
          .set(preferences)
          .where(eq(smsCustomerPreferences.clientId, clientId));
      } else {
        await database.insert(smsCustomerPreferences).values({
          id: uuidv4(),
          clientId,
          phoneNumber: '',
          optedIn: (preferences.optedIn ?? true) as any,
          marketingOptedIn: (preferences.marketingOptedIn ?? false) as any,
          transactionalOptedIn: (preferences.transactionalOptedIn ?? true) as any,
          reminderPreferences: preferences.reminderPreferences,
        });
      }

      return { success: true };
    } catch (error) {
      console.error('[SMS] Update preferences error:', error);
      throw error;
    }
  }

  /**
   * Handle delivery callback
   */
  async handleDeliveryCallback(data: any) {
    try {
      const database = await db.getDb();
      if (!database) throw new Error('Database connection lost');

      const smsQueue = (await import('../../drizzle/schema')).smsQueue;
      const smsDeliveryEvents = (await import('../../drizzle/schema')).smsDeliveryEvents;
      const { eq } = await import('drizzle-orm');

      // Update message status
      const message = await database.select()
        .from(smsQueue)
        .where(eq(smsQueue.providerReference, data.id))
        .limit(1);

      if (message.length > 0) {
        const status = data.status === 'Success' ? 'delivered' : 'failed';
        
        await database.update(smsQueue)
          .set({
            status: status as any,
            deliveredAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
            deliveryStatus: data.status,
          })
          .where(eq(smsQueue.id, message[0].id));

        // Log event
        await database.insert(smsDeliveryEvents).values({
          id: uuidv4(),
          queueId: message[0].id,
          eventType: status as any,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          metadata: { data } as any,
        });
      }

      return { processed: true };
    } catch (error) {
      console.error('[SMS] Callback processing error:', error);
      throw error;
    }
  }

  /**
   * Validate phone number format
   */
  private isValidPhoneNumber(phoneNumber: string): boolean {
    // Simplified validation for Kenyan and broader African numbers
    const pattern = /^(?:\+254|254|0)[1-9]\d{8,9}$/;
    return pattern.test(phoneNumber.replace(/[\s-]/g, ''));
  }

  /**
   * Format phone number to Africa's Talking standard
   */
  private formatPhoneNumber(phoneNumber: string): string {
    let formatted = phoneNumber.replace(/[\s-]/g, '');
    if (formatted.startsWith('0')) {
      formatted = '+254' + formatted.slice(1);
    } else if (formatted.startsWith('254')) {
      formatted = '+' + formatted;
    } else if (!formatted.startsWith('+')) {
      formatted = '+' + formatted;
    }
    return formatted;
  }

  /**
   * Get configured status
   */
  getStatus() {
    return {
      isConfigured: this.isConfigured,
      provider: this.provider,
      username: this.username,
    };
  }
}

// Singleton instance
const smsService = new SMSService();

export default smsService;
export const queueSms = (input: QueueSmsInput) => smsService.queueSms(input);
export const sendSmsImmediately = (
  phoneOrInput: string | { phoneNumber: string; message: string; relatedEntityType?: string; relatedEntityId?: string },
  msg?: string
) => smsService.sendSmsImmediately(phoneOrInput as any, msg as any);
export const processSmsQueue = (batchSize?: number) => smsService.processSmsQueue(batchSize);
export const getSmsQueueStatus = () => smsService.getQueueStatus();
export const getSmsStatus = () => smsService.getStatus();
export const getCustomerPreferences = (clientId: string) => 
  smsService.getCustomerPreferences(clientId);
export const updateCustomerPreferences = (clientId: string, prefs: any) =>
  smsService.updateCustomerPreferences(clientId, prefs);
