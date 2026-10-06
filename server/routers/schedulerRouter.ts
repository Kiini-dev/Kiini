/**
 * Job Scheduler Router
 * tRPC endpoints for job management, health monitoring, and alerting
 * 
 * Endpoints:
 * - schedulerRouter.listJobs() - List all scheduled jobs
 * - schedulerRouter.getJobDetails() - Get job details and execution stats
 * - schedulerRouter.triggerJobNow() - Manually trigger a job (admin only)
 * - schedulerRouter.getExecutionHistory() - View job execution history
 * - schedulerRouter.getHealthStatus() - Get scheduler health status
 * - schedulerRouter.getAlertRules() - View alert configuration (admin only)
 * - schedulerRouter.updateAlertRules() - Modify alert rules (admin only)
 * - schedulerRouter.getMetrics() - Get performance metrics
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '../_core/trpc';
import * as db from '../db';
import { and, eq, desc, gte, count } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { initializeScheduler } from '../services/jobScheduler';

// Feature-restricted procedure for scheduler operations
const schedulerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!ctx.user?.id) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User authentication required' });
  }
  return next({ ctx });
});

// Admin-only procedure for sensitive scheduler operations
const schedulerAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user?.role !== 'super_admin' && ctx.user?.role !== 'ict_manager' && ctx.user?.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Super Admin, Admin or ICT Manager access required' });
  }
  return next({ ctx });
});

export const schedulerRouter = router({
  /** Create a custom email, SMS, or reminder schedule. */
  createCustomSchedule: schedulerAdminProcedure.input(z.object({
    name: z.string().min(3).max(255),
    channel: z.enum(['email', 'sms', 'reminder']),
    cronExpression: z.string().min(9).max(255),
    timezone: z.string().max(100).default('UTC'),
    recipients: z.array(z.string().min(3)).min(1).max(500),
    subject: z.string().max(255).optional(),
    message: z.string().min(1).max(5000),
    templateId: z.string().max(100).optional(),
    templateVariables: z.record(z.string(), z.unknown()).optional(),
  })).mutation(async ({ input, ctx }) => {
    const database = await db.getDb();
    if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
    const scheduledJobs = (await import('../../drizzle/schema')).scheduledJobs;
    const id = uuidv4();
    await database.insert(scheduledJobs).values({
      id,
      organizationId: ctx.user.organizationId || 'global',
      jobName: input.name,
      jobType: `custom_${input.channel}`,
      schedule: input.cronExpression,
      cronExpression: input.cronExpression,
      timezone: input.timezone,
      description: `Custom ${input.channel} schedule`,
      handler: JSON.stringify({ recipients: input.recipients, subject: input.subject, message: input.message, templateId: input.templateId, templateVariables: input.templateVariables }),
      isActive: 1,
      createdBy: ctx.user.id,
    });
    await initializeScheduler();
    return { success: true, jobId: id, message: 'Custom schedule created and registered.' };
  }),
  /**
   * List all scheduled jobs
   */
  listJobs: schedulerProcedure.query(async () => {
    try {
      const database = await db.getDb();
      if (!database) throw new Error('Database unavailable');

      const scheduledJobs = (await import('../../drizzle/schema')).scheduledJobs;
      const jobs = await database.select().from(scheduledJobs);

      return jobs.map((job) => ({
        jobId: job.id,
        jobName: job.jobName,
        jobType: job.jobType,
        description: job.description,
        cronExpression: job.cronExpression,
        timezone: job.timezone || 'UTC',
        isActive: job.isActive,
        isManualOnly: job.isManualOnly,
        lastExecutedAt: job.lastExecutedAt,
        nextExecutionAt: job.nextExecutionAt,
        failureCount: job.failureCount || 0,
      }));
    } catch (error) {
      console.error('[schedulerRouter] listJobs error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch jobs list',
      });
    }
  }),

  /**
   * Get job details with recent execution stats
   */
  getJobDetails: schedulerProcedure.input(
    z.object({
      jobId: z.string(),
    })
  ).query(async ({ input }) => {
    try {
      const database = await db.getDb();
      if (!database) throw new Error('Database unavailable');

      const scheduledJobs = (await import('../../drizzle/schema')).scheduledJobs;
      const jobLogs = (await import('../../drizzle/schema')).jobExecutionLogs;

      const jobRows = await database.select().from(scheduledJobs).where(eq(scheduledJobs.id, input.jobId)).limit(1);
      const job = jobRows[0];

      if (!job) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Job not found',
        });
      }

      // Get last 10 executions
      const recentExecutions = await database.select()
        .from(jobLogs)
        .where(eq(jobLogs.jobId, input.jobId))
        .orderBy(desc(jobLogs.executedAt))
        .limit(10);

      // Calculate stats
      const successCount = recentExecutions.filter((e) => e.status === 'success').length;
      const failureCount = recentExecutions.filter((e) => e.status === 'failed').length;
      const avgDuration = recentExecutions.length > 0
        ? recentExecutions.reduce((sum, e) => sum + (e.durationMs || 0), 0) / recentExecutions.length
        : 0;

      return {
        jobId: job.id,
        jobName: job.jobName,
        jobType: job.jobType,
        description: job.description,
        cronExpression: job.cronExpression,
        timezone: job.timezone || 'UTC',
        isActive: job.isActive,
        isManualOnly: job.isManualOnly,
        lastExecutedAt: job.lastExecutedAt,
        nextExecutionAt: job.nextExecutionAt,
        stats: {
          totalExecutions: recentExecutions.length,
          successCount,
          failureCount,
          successRate: recentExecutions.length > 0 ? (successCount / recentExecutions.length) * 100 : 0,
          averageDuration: Math.round(avgDuration),
          lastStatus: recentExecutions[0]?.status || 'unknown',
        },
        recentExecutions: recentExecutions.slice(0, 5).map((e) => ({
          executedAt: e.executedAt,
          status: e.status,
          durationMs: e.durationMs,
          itemsProcessed: e.itemsProcessed,
          itemsFailed: e.itemsFailed,
          errorMessage: e.errorMessage,
        })),
      };
    } catch (error) {
      console.error('[schedulerRouter] getJobDetails error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch job details',
      });
    }
  }),

  /**
   * Manually trigger a job execution (admin only)
   */
  triggerJobNow: schedulerAdminProcedure.input(
    z.object({
      jobId: z.string(),
    })
  ).mutation(async ({ input }) => {
    try {
      const database = await db.getDb();
      if (!database) throw new Error('Database unavailable');

      const scheduledJobs = (await import('../../drizzle/schema')).scheduledJobs;
      const [job] = await database.select().from(scheduledJobs).where(eq(scheduledJobs.id, input.jobId)).limit(1);

      if (!job) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Job not found',
        });
      }

      if (!job.isActive) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot trigger inactive job',
        });
      }

      // Execute the job based on jobName
      const jobLogs = (await import('../../drizzle/schema')).jobExecutionLogs;
      const logId = `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const startTime = Date.now();
      let jobResult: { success: boolean; itemsProcessed: number; itemsFailed: number; message: string; errors: string[] } = { success: false, itemsProcessed: 0, itemsFailed: 0, message: '', errors: [] };

      try {
        switch (job.jobName) {
          case 'generateRecurringExpenses': {
            const { generateDueRecurringExpenses } = await import('../jobs/recurringExpensesJob');
            const result = await generateDueRecurringExpenses();
            const resultAny = result as any;
            jobResult = { success: resultAny.success, itemsProcessed: resultAny.itemsProcessed || 0, itemsFailed: resultAny.itemsFailed || 0, message: resultAny.message || '', errors: resultAny.errors || [] };
            break;
          }
          case 'generateRecurringInvoices':
          case 'generateInvoices': {
            const { generateDueRecurringInvoices } = await import('../jobs/recurringInvoicesJob');
            const result: any = await generateDueRecurringInvoices();
            jobResult = { success: result?.success ?? true, itemsProcessed: result?.itemsProcessed || 0, itemsFailed: result?.itemsFailed || 0, message: result?.message || '', errors: result?.errors || [] };
            break;
          }
          case 'markOverdueInvoices': {
            const { markOverdueInvoices } = await import('../jobs/overdueInvoicesJob');
            const result: any = await markOverdueInvoices();
            jobResult = { success: result?.success ?? true, itemsProcessed: Number(result?.count ?? 0), itemsFailed: Number(result?.errors?.length ?? 0), message: result?.message || '', errors: result?.errors || [] };
            break;
          }
          case 'sendInvoiceReminders': {
            const invoiceReminderModule: any = await import('../jobs/invoiceReminders');
            const processInvoiceReminders = invoiceReminderModule.processInvoiceReminders ?? invoiceReminderModule.default?.processInvoiceReminders;
            if (typeof processInvoiceReminders !== 'function') {
              throw new Error('Invoice reminder processor is unavailable');
            }
            await processInvoiceReminders();
            jobResult = { success: true, itemsProcessed: 1, itemsFailed: 0, message: 'Invoice reminders processed', errors: [] };
            break;
          }
          case 'sendUsageReminders': {
            const { sendUsageReminders } = await import('../jobs/usageReminders');
            const result = await sendUsageReminders();
            const resultAny = result as any;
            jobResult = { success: true, itemsProcessed: resultAny.sent || 0, itemsFailed: resultAny.errors || 0, message: `Usage reminders: ${resultAny.sent || 0} sent, ${resultAny.skipped || 0} skipped`, errors: [] };
            break;
          }
          default:
            jobResult = { success: false, itemsProcessed: 0, itemsFailed: 0, message: `Unknown job type: ${job.jobName}`, errors: [`No handler registered for job: ${job.jobName}`] };
        }

        const durationMs = Date.now() - startTime;

        // Log execution result
        const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
        await database.insert(jobLogs).values({
          id: logId,
          jobId: job.id,
          executedAt: timestamp,
          status: jobResult.success ? 'success' : 'failed',
          durationMs,
          itemsProcessed: jobResult.itemsProcessed,
          itemsFailed: jobResult.itemsFailed,
          errorMessage: jobResult.errors.length > 0 ? jobResult.errors.join('; ') : null,
          stdout: jobResult.message,
        } as any);

        // Update job's lastExecutedAt
        await database.update(scheduledJobs).set({ lastExecutedAt: timestamp } as any).where(eq(scheduledJobs.id, job.id));

        console.log(`[Scheduler] Job "${job.jobName}" completed: ${jobResult.message}`);
      } catch (execError: any) {
        const durationMs = Date.now() - startTime;
        const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
        await database.insert(jobLogs).values({
          id: logId,
          jobId: job.id,
          executedAt: timestamp,
          status: 'failed',
          durationMs,
          itemsProcessed: 0,
          itemsFailed: 1,
          errorMessage: execError?.message || 'Unknown execution error',
        } as any).catch(() => {});
        console.error(`[Scheduler] Job "${job.jobName}" failed:`, execError);
      }

      return {
        success: jobResult.success,
        message: jobResult.success ? `Job "${job.jobName}" completed: ${jobResult.message}` : `Job "${job.jobName}" failed: ${jobResult.message}`,
        jobId: job.id,
        itemsProcessed: jobResult.itemsProcessed,
        itemsFailed: jobResult.itemsFailed,
      };
    } catch (error) {
      console.error('[schedulerRouter] triggerJobNow error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to trigger job',
      });
    }
  }),

  /**
   * Get job execution history with filtering
   */
  getExecutionHistory: schedulerProcedure.input(
    z.object({
      jobId: z.string().optional(),
      status: z.enum(['success', 'failed', 'partial', 'timeout']).optional(),
      limit: z.number().max(500).default(100),
      offset: z.number().default(0),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
    })
  ).query(async ({ input }) => {
    try {
      const database = await db.getDb();
      if (!database) throw new Error('Database unavailable');

      const jobLogs = (await import('../../drizzle/schema')).jobExecutionLogs;

      const conditions = [];
      if (input.jobId) conditions.push(eq(jobLogs.jobId, input.jobId));
      if (input.status) conditions.push(eq(jobLogs.status, input.status));
      if (input.startDate) conditions.push(gte(jobLogs.executedAt, input.startDate.toISOString().slice(0, 19).replace('T', ' ')));
      if (input.endDate) conditions.push(gte(jobLogs.executedAt, input.endDate.toISOString().slice(0, 19).replace('T', ' ')));

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const records = await database.select()
        .from(jobLogs)
        .where(where)
        .orderBy(desc(jobLogs.executedAt))
        .limit(input.limit)
        .offset(input.offset);

      return records.map((log) => ({
        logId: log.id,
        jobId: log.jobId,
        executedAt: log.executedAt,
        status: log.status,
        durationMs: log.durationMs,
        itemsProcessed: log.itemsProcessed,
        itemsFailed: log.itemsFailed,
        errorMessage: log.errorMessage,
        stdout: log.stdout ? log.stdout.substring(0, 200) : null,
      }));
    } catch (error) {
      console.error('[schedulerRouter] getExecutionHistory error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch execution history',
      });
    }
  }),

  /**
   * Get overall scheduler health status
   */
  getHealthStatus: schedulerProcedure.query(async () => {
    try {
      const database = await db.getDb();
      if (!database) throw new Error('Database unavailable');

      const scheduledJobs = (await import('../../drizzle/schema')).scheduledJobs;
      const jobHeartbeat = (await import('../../drizzle/schema')).jobHeartbeat;

      // Get active jobs count
      const activeJobsCount = await database.select({ count: count() })
        .from(scheduledJobs)
        .where(eq(scheduledJobs.isActive, 1 as any));

      // Get latest heartbeat
      const heartbeats = await database.select()
        .from(jobHeartbeat)
        .orderBy(desc(jobHeartbeat.lastHeartbeatAt))
        .limit(1);

      const latestHeartbeat = heartbeats[0];
      const lastHeartbeatTime = latestHeartbeat?.lastHeartbeatAt ? new Date(latestHeartbeat.lastHeartbeatAt).getTime() : null;
      const isHealthy = !!(lastHeartbeatTime && (Date.now() - lastHeartbeatTime) < 5 * 60 * 1000); // 5 minutes

      // Get recent failures
      const jobLogs = (await import('../../drizzle/schema')).jobExecutionLogs;
      const recentFailures = await database.select({ count: count() })
        .from(jobLogs)
        .where(
          and(
            eq(jobLogs.status, 'failed'),
            gte(jobLogs.executedAt, new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '))
          )
        );

      return {
        isHealthy,
        statusMessage: isHealthy ? 'Scheduler running normally' : 'Scheduler health check stale',
        activeJobsCount: activeJobsCount[0]?.count || 0,
        lastHeartbeatAt: latestHeartbeat?.lastHeartbeatAt,
        recentFailuresLastHour: recentFailures[0]?.count || 0,
        uptime: lastHeartbeatTime ? Date.now() - lastHeartbeatTime : null,
      };
    } catch (error) {
      console.error('[schedulerRouter] getHealthStatus error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch health status',
      });
    }
  }),

  /**
   * Get alert rules configuration (admin only)
   */
  getAlertRules: schedulerAdminProcedure.query(async () => {
    try {
      const database = await db.getDb();
      if (!database) throw new Error('Database unavailable');

      const alertRules = (await import('../../drizzle/schema')).jobAlertRules;
      const rules = await database.select().from(alertRules);

      return rules.map((rule) => ({
        ruleId: rule.id,
        jobId: rule.jobId,
        triggerCondition: rule.triggerCondition,
        failureThreshold: rule.failureThreshold,
        durationThresholdMs: rule.durationThresholdMs,
        notificationChannels: rule.notificationChannels as string[],
        isActive: rule.isActive,
        createdAt: rule.createdAt,
      }));
    } catch (error) {
      console.error('[schedulerRouter] getAlertRules error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch alert rules',
      });
    }
  }),

  /**
   * Update alert rules (admin only)
   */
  updateAlertRules: schedulerAdminProcedure.input(
    z.object({
      ruleId: z.string(),
      triggerCondition: z.enum(['on_failure', 'on_duration_threshold', 'on_multiple_failures']).optional(),
      failureThreshold: z.number().min(1).max(10).optional(),
      durationThresholdMs: z.number().min(1000).optional(),
      notificationChannels: z.array(z.enum(['email', 'sms', 'slack', 'webhook'])).optional(),
      isActive: z.boolean().optional(),
    })
  ).mutation(async ({ input }) => {
    try {
      const database = await db.getDb();
      if (!database) throw new Error('Database unavailable');

      const alertRules = (await import('../../drizzle/schema')).jobAlertRules;
      const [rule] = await database.select().from(alertRules).where(eq(alertRules.id, input.ruleId)).limit(1);

      if (!rule) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Alert rule not found',
        });
      }

      await database.update(alertRules)
        .set({
          triggerCondition: input.triggerCondition ?? rule.triggerCondition,
          failureThreshold: input.failureThreshold ?? rule.failureThreshold,
          durationThresholdMs: input.durationThresholdMs ?? rule.durationThresholdMs,
          notificationChannels: input.notificationChannels ?? rule.notificationChannels,
          isActive: input.isActive ?? rule.isActive,
        })
        .where(eq(alertRules.id, input.ruleId));

      return {
        success: true,
        message: 'Alert rule updated successfully',
      };
    } catch (error) {
      console.error('[schedulerRouter] updateAlertRules error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update alert rules',
      });
    }
  }),

  /**
   * Get scheduler performance metrics
   */
  getMetrics: schedulerProcedure.query(async () => {
    try {
      const database = await db.getDb();
      if (!database) throw new Error('Database unavailable');

      const jobLogs = (await import('../../drizzle/schema')).jobExecutionLogs;

      // Last 24 hours stats
      const lastDay = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const logsLastDay = await database.select()
        .from(jobLogs)
        .where(gte(jobLogs.executedAt, lastDay.toISOString().slice(0, 19).replace('T', ' ')));
      const successCount = logsLastDay.filter((e) => e.status === 'success').length;
      const failureCount = logsLastDay.filter((e) => e.status === 'failed').length;
      const avgDuration = logsLastDay.length > 0
        ? logsLastDay.reduce((sum, e) => sum + (e.durationMs || 0), 0) / logsLastDay.length
        : 0;

      // Last 7 days trend
      const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const logsLast7Days = await database.select()
        .from(jobLogs)
        .where(gte(jobLogs.executedAt, last7Days.toISOString().slice(0, 19).replace('T', ' ')));

      return {
        lastTwentyFourHours: {
          totalExecutions: logsLastDay.length,
          successCount,
          failureCount,
          successRate: logsLastDay.length > 0 ? (successCount / logsLastDay.length) * 100 : 0,
          averageDurationMs: Math.round(avgDuration),
        },
        last7Days: {
          totalExecutions: logsLast7Days.length,
          averageExecutionsPerDay: Math.round(logsLast7Days.length / 7),
          successRate: logsLast7Days.length > 0
            ? (logsLast7Days.filter((e) => e.status === 'success').length / logsLast7Days.length) * 100
            : 0,
        },
        topFailingJobs: [], // Placeholder - calculate from data if needed
      };
    } catch (error) {
      console.error('[schedulerRouter] getMetrics error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch metrics',
      });
    }
  }),
});
