/**
 * SMS Automation Router
 * Handles SMS templates, scheduling, sending, and automation triggers
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../_core/trpc";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import { getDb } from "../db";
import * as smsService from "../services/smsService";
import { smsQueue, smsTemplates, smsAutomationRules } from "../../drizzle/schema";
import { v4 as uuidv4 } from "uuid";

const smsReadProcedure = createFeatureRestrictedProcedure("communications:read");
const smsWriteProcedure = createFeatureRestrictedProcedure("communications:write");

export const smsAutomationRouter = router({
  /**
   * Create SMS template
   */
  createTemplate: smsWriteProcedure
    .input(z.object({
      name: z.string().min(1).max(255),
      content: z.string().min(1).max(1600),
      category: z.enum([
        'invoice_notification',
        'payment_reminder',
        'delivery_notification',
        'appointment_reminder',
        'promotional',
        'transactional',
        'custom',
      ]),
      variables: z.array(z.string()).optional(),
      isActive: z.boolean().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

        const templateId = uuidv4();
        const template = {
          id: templateId,
          organizationId: ctx.user?.organizationId || ctx.user?.id,
          name: input.name,
          content: input.content,
          category: input.category as any,
          variables: input.variables || [],
          isActive: Number(input.isActive),
          usageCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await database.insert(smsTemplates).values(template as any);

        return {
          template,
          success: true,
          message: 'SMS template created successfully',
        };
      } catch (error) {
        console.error("[SMS] Error creating template:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create SMS template',
        });
      }
    }),

  /**
   * Get all SMS templates
   */
  getTemplates: smsReadProcedure
    .input(z.object({
      category: z.string().optional(),
      limit: z.number().int().default(20),
      offset: z.number().int().default(0),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

        const organizationId = ctx.user?.organizationId || ctx.user?.id;
        
        // Start with base condition
        let query = database.select({ total: count() }).from(smsTemplates)
          .where(eq(smsTemplates.organizationId, organizationId)) as any;
        if (input.category) {
          query = query.where(eq(smsTemplates.category as any, input.category as any));
        }
        const [countRow] = await query;

        // Build template query
        let templateQuery = database.select().from(smsTemplates)
          .where(eq(smsTemplates.organizationId, organizationId)) as any;
        if (input.category) {
          templateQuery = templateQuery.where(eq(smsTemplates.category as any, input.category as any));
        }
        const templates = await templateQuery
          .orderBy(desc(smsTemplates.createdAt))
          .limit(input.limit)
          .offset(input.offset);

        return {
          templates,
          total: Number(countRow?.total ?? 0),
          limit: input.limit,
          offset: input.offset,
          success: true,
        };
      } catch (error) {
        console.error("[SMS] Error fetching templates:", error);
        if (error instanceof TRPCError) throw error;
        return { templates: [], total: 0, limit: input.limit, offset: input.offset, success: false };
      }
    }),

  /**
   * Update SMS template
   */
  updateTemplate: smsWriteProcedure
    .input(z.object({
      templateId: z.string(),
      name: z.string().optional(),
      content: z.string().optional(),
      category: z.string().optional(),
      variables: z.array(z.string()).optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

        const organizationId = ctx.user?.organizationId || ctx.user?.id;
        const existing = await database.select().from(smsTemplates).where(and(eq(smsTemplates.id, input.templateId), eq(smsTemplates.organizationId, organizationId))).limit(1);
        if (!existing.length) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'SMS template not found' });
        }

        const updates: any = {
          updatedAt: new Date().toISOString(),
        };

        if (input.name !== undefined) updates.name = input.name;
        if (input.content !== undefined) updates.content = input.content;
        if (input.category !== undefined) updates.category = input.category as any;
        if (input.variables !== undefined) updates.variables = input.variables;
        if (input.isActive !== undefined) updates.isActive = Number(input.isActive);

        await database.update(smsTemplates).set(updates).where(and(eq(smsTemplates.id, input.templateId), eq(smsTemplates.organizationId, organizationId)));

        return {
          success: true,
          message: 'SMS template updated successfully',
        };
      } catch (error) {
        console.error("[SMS] Error updating template:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update SMS template',
        });
      }
    }),

  /**
   * Delete SMS template
   */
  deleteTemplate: smsWriteProcedure
    .input(z.object({ templateId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

        const organizationId = ctx.user?.organizationId || ctx.user?.id;
        const inUse = await database.select().from(smsAutomationRules).where(eq(smsAutomationRules.templateId, input.templateId)).limit(1);
        if (inUse.length) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Template is in use by automation rules' });
        }

        await database.delete(smsTemplates).where(and(eq(smsTemplates.id, input.templateId), eq(smsTemplates.organizationId, organizationId)));

        return {
          success: true,
          message: 'SMS template deleted successfully',
        };
      } catch (error) {
        console.error("[SMS] Error deleting template:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete SMS template',
        });
      }
    }),

  /**
   * Send SMS immediately
   */
  sendSMS: smsWriteProcedure
    .input(z.object({
      toNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/),
      templateId: z.string().optional(),
      content: z.string().optional(),
      variables: z.record(z.string(), z.string()).optional(),
      metadata: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (!input.templateId && !input.content) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Either templateId or content must be provided',
          });
        }

        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

        let finalContent = input.content || '';
        if (input.templateId) {
          const [template] = await database.select().from(smsTemplates).where(eq(smsTemplates.id, input.templateId)).limit(1);
          if (!template) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'SMS template not found' });
          }
          finalContent = template.content;
          if (input.variables) {
            Object.entries(input.variables).forEach(([key, value]) => {
              const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              finalContent = finalContent.replace(new RegExp(`{{\\s*${escapedKey}\\s*}}`, 'g'), String(value));
            });
          }

          await database.update(smsTemplates)
            .set({ usageCount: sql`${smsTemplates.usageCount} + 1`, updatedAt: new Date().toISOString() })
            .where(eq(smsTemplates.id, input.templateId));
        }

        if (!finalContent) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'SMS content cannot be empty',
          });
        }

        const queueResult = await smsService.queueSms({
          phoneNumber: input.toNumber,
          message: finalContent,
          organizationId: ctx.user?.organizationId || ctx.user?.id,
          createdBy: ctx.user?.id,
          templateId: input.templateId,
          metadata: input.metadata || {},
        });

        const sms = {
          id: queueResult.queueId,
          organizationId: ctx.user?.organizationId || ctx.user?.id,
          toNumber: input.toNumber,
          content: finalContent,
          status: 'pending' as const,
          templateId: input.templateId,
          sentAt: null as string | null,
          deliveredAt: null as string | null,
          failureReason: null as string | null,
          metadata: input.metadata || {},
          createdAt: new Date().toISOString(),
        };

        return {
          sms,
          success: true,
          message: 'SMS queued for sending',
        };
      } catch (error) {
        console.error("[SMS] Error sending SMS:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send SMS',
        });
      }
    }),

  /**
   * Schedule SMS for later delivery
   */
  scheduleSMS: smsWriteProcedure
    .input(z.object({
      toNumber: z.string(),
      templateId: z.string().optional(),
      content: z.string().optional(),
      variables: z.record(z.string(), z.string()).optional(),
      scheduleTime: z.string().datetime(),
      recurring: z.enum(['once', 'daily', 'weekly', 'monthly']).optional(),
      recurringEnd: z.string().datetime().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const scheduleId = uuidv4();
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

        let message = input.content || '';
        let templateId = input.templateId;
        if (input.templateId) {
          const [template] = await database.select().from(smsTemplates).where(eq(smsTemplates.id, input.templateId)).limit(1);
          if (!template) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'SMS template not found' });
          }
          message = template.content;
          if (input.variables) {
            Object.entries(input.variables).forEach(([key, value]) => {
              const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              message = message.replace(new RegExp(`{{\\s*${escapedKey}\\s*}}`, 'g'), String(value));
            });
          }
          await database.update(smsTemplates)
            .set({ usageCount: sql`${smsTemplates.usageCount} + 1`, updatedAt: new Date().toISOString() })
            .where(eq(smsTemplates.id, input.templateId));
        }

        if (!message) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'SMS content is required for scheduling',
          });
        }

        const schedule = {
          id: scheduleId,
          phoneNumber: input.toNumber,
          message,
          status: 'pending' as const,
          retryCount: 0,
          provider: process.env.SMS_PROVIDER || 'africa_talking',
          externalId: null,
          error: null,
          failureReason: null,
          relatedEntityType: null,
          relatedEntityId: null,
          sentAt: null,
          nextRetryAt: input.scheduleTime,
          organizationId: ctx.user?.organizationId || ctx.user?.id,
          createdBy: ctx.user?.id,
          templateId,
          batchId: null,
          metadata: null,
          attemptCount: 0,
          maxAttempts: 3,
          providerReference: null,
          deliveryStatus: 'pending' as const,
          deliveredAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await database.insert(smsQueue).values(schedule);

        return {
          schedule,
          success: true,
          message: 'SMS scheduled successfully',
        };
      } catch (error) {
        console.error("[SMS] Error scheduling SMS:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to schedule SMS',
        });
      }
    }),

  /**
   * Send bulk SMS
   */
  sendBulkSMS: smsWriteProcedure
    .input(z.object({
      recipients: z.array(z.object({
        toNumber: z.string(),
        variables: z.record(z.string(), z.string()).optional(),
      })),
      templateId: z.string().optional(),
      content: z.string().optional(),
      variables: z.record(z.string(), z.string()).optional(),
      scheduleTime: z.string().datetime().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const batchId = uuidv4();
        const count = input.recipients.length;

        if (count === 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'At least one recipient is required',
          });
        }

        if (count > 10000) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Maximum 10,000 recipients per batch',
          });
        }

        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

        let template: any = null;
        if (input.templateId) {
          const [foundTemplate] = await database.select().from(smsTemplates).where(eq(smsTemplates.id, input.templateId)).limit(1);
          if (!foundTemplate) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'SMS template not found' });
          }
          template = foundTemplate;
          await database.update(smsTemplates)
            .set({ usageCount: sql`${smsTemplates.usageCount} + ${count}`, updatedAt: new Date().toISOString() })
            .where(eq(smsTemplates.id, input.templateId));
        }

        const records = input.recipients.map((recipient) => {
          let message = input.content || '';
          if (template) {
            message = template.content;
            const variables = { ...(input.variables || {}), ...(recipient.variables || {}) };
            Object.entries(variables).forEach(([key, value]) => {
              const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              message = message.replace(new RegExp(`{{\\s*${escapedKey}\\s*}}`, 'g'), String(value));
            });
          }

          if (!message) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Bulk SMS requires a template or static content' });
          }

          return {
            id: uuidv4(),
            phoneNumber: recipient.toNumber,
            message,
            status: 'pending' as const,
            retryCount: 0,
            attemptCount: 0,
            maxAttempts: 3,
            provider: process.env.SMS_PROVIDER || 'africa_talking',
            externalId: null,
            providerReference: null,
            deliveryStatus: 'pending' as const,
            deliveredAt: null,
            error: null,
            failureReason: null,
            relatedEntityType: null,
            relatedEntityId: null,
            batchId,
            templateId: input.templateId,
            metadata: null,
            sentAt: null,
            nextRetryAt: input.scheduleTime || null,
            organizationId: ctx.user?.organizationId || ctx.user?.id,
            createdBy: ctx.user?.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        });

        await database.insert(smsQueue).values(records);

        return {
          batchId,
          recipientCount: count,
          status: 'processing',
          success: true,
          message: `Bulk SMS queued for ${count} recipients`,
        };
      } catch (error) {
        console.error("[SMS] Error sending bulk SMS:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send bulk SMS',
        });
      }
    }),

  /**
   * Get SMS delivery status
   */
  getDeliveryStatus: smsReadProcedure
    .input(z.object({ smsId: z.string() }))
    .query(async ({ input }) => {
      try {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

        const [message] = await database.select().from(smsQueue).where(eq(smsQueue.id, input.smsId)).limit(1);
        if (!message) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'SMS message not found' });
        }

        const status = {
          smsId: input.smsId,
          status: message.status,
          sentAt: message.sentAt,
          deliveredAt: message.deliveredAt,
          failureReason: message.failureReason,
        };

        return { status, success: true };
      } catch (error) {
        console.error("[SMS] Error fetching delivery status:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch SMS status',
        });
      }
    }),

  /**
   * Get SMS history
   */
  getHistory: smsReadProcedure
    .input(z.object({
      limit: z.number().int().default(50),
      offset: z.number().int().default(0),
      status: z.string().optional(),
      dateRange: z.object({
        start: z.string().datetime(),
        end: z.string().datetime(),
      }).optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

        const organizationId = ctx.user?.organizationId || ctx.user?.id;
        
        // Build count query
        let countQuery = database.select({ total: count() }).from(smsQueue)
          .where(eq(smsQueue.organizationId, organizationId)) as any;
        if (input.status) {
          countQuery = countQuery.where(eq(smsQueue.status as any, input.status as any));
        }
        if (input.dateRange) {
          countQuery = countQuery.where(gte(smsQueue.createdAt as any, input.dateRange.start as any))
            .where(lte(smsQueue.createdAt as any, input.dateRange.end as any));
        }
        const [countRow] = await countQuery;

        // Build history query
        let historyQuery = database.select().from(smsQueue)
          .where(eq(smsQueue.organizationId, organizationId)) as any;
        if (input.status) {
          historyQuery = historyQuery.where(eq(smsQueue.status as any, input.status as any));
        }
        if (input.dateRange) {
          historyQuery = historyQuery.where(gte(smsQueue.createdAt as any, input.dateRange.start as any))
            .where(lte(smsQueue.createdAt as any, input.dateRange.end as any));
        }
        const history = await (historyQuery as any)
          .orderBy(desc(smsQueue.createdAt))
          .limit(input.limit)
          .offset(input.offset);

        return {
          history,
          total: Number(countRow?.total ?? 0),
          limit: input.limit,
          offset: input.offset,
          success: true,
        };
      } catch (error) {
        console.error("[SMS] Error fetching history:", error);
        if (error instanceof TRPCError) throw error;
        return { history: [], total: 0, limit: input.limit, offset: input.offset, success: false };
      }
    }),

  /**
   * Create SMS automation rule
   */
  createAutomationRule: smsWriteProcedure
    .input(z.object({
      name: z.string().min(1),
      trigger: z.enum([
        'invoice_created',
        'payment_failed',
        'payment_received',
        'subscription_expiring',
        'appointment_reminder',
        'custom_event',
      ]),
      templateId: z.string(),
      conditions: z.record(z.string(), z.any()).optional(),
      isActive: z.boolean().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

        const ruleId = uuidv4();
        const rule = {
          id: ruleId,
          organizationId: ctx.user?.organizationId || ctx.user?.id,
          name: input.name,
          trigger: input.trigger as any,
          templateId: input.templateId,
          conditions: input.conditions || {},
          isActive: Number(input.isActive),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await database.insert(smsAutomationRules).values(rule as any);

        return {
          rule,
          success: true,
          message: 'SMS automation rule created successfully',
        };
      } catch (error) {
        console.error("[SMS] Error creating automation rule:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create SMS automation rule',
        });
      }
    }),

  /**
   * Get SMS automation rules
   */
  getAutomationRules: smsReadProcedure.query(async ({ ctx }) => {
    try {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

      const organizationId = ctx.user?.organizationId || ctx.user?.id;
      const rules = await database.select().from(smsAutomationRules).where(eq(smsAutomationRules.organizationId, organizationId));

      return { rules, success: true };
    } catch (error) {
      console.error("[SMS] Error fetching automation rules:", error);
      return { rules: [], success: false };
    }
  }),
});
