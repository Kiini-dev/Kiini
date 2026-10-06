/**
 * Job Scheduler Service
 * Manages scheduled background jobs, monitoring, and alerting
 * Supports cron-based scheduling, manual triggers, and health checks
 */

import * as CronJob from 'cron';
import cron from 'node-cron';
import * as db from '../db';
import { v4 as uuidv4 } from 'uuid';
import { TRPCError } from '@trpc/server';
import { eq, sql } from 'drizzle-orm';
import { getBackupTableRegistry } from '../data/tableRegistry';

const backupScheduleJobs = new Map<string, cron.ScheduledTask>();

export interface ScheduledJobConfig {
  jobName: string;
  description?: string;
  jobType: string;
  cronExpression: string;
  handler: () => Promise<any>;
  isActive?: boolean;
  isManualOnly?: boolean;
  timezone?: string;
}

/** Persist the default automation schedule created with a document. */
export async function scheduleDocumentAutomation(input: {
  documentType: string;
  documentId: string;
  organizationId?: string | null;
  createdBy?: string | null;
  createdAt?: Date | string;
}) {
  const database = await db.getDb();
  if (!database) return null;
  const scheduledJobs = (await import('../../drizzle/schema')).scheduledJobs;
  const id = uuidv4();
  const createdAt = input.createdAt ? new Date(input.createdAt) : new Date();
  await database.insert(scheduledJobs).values({
    id,
    organizationId: input.organizationId || 'global',
    jobName: `${input.documentType}_${input.documentId}_automation`,
    jobType: 'document_automation',
    schedule: '0 9 * * *',
    cronExpression: '0 9 * * *',
    handler: JSON.stringify({ documentType: input.documentType, documentId: input.documentId, createdAt: createdAt.toISOString() }),
    description: `Automatic ${input.documentType} reminders and follow-up automation`,
    isActive: 1,
    nextScheduledRun: createdAt.toISOString().replace('T', ' ').substring(0, 19),
    createdBy: input.createdBy || 'system',
    createdAt: createdAt.toISOString().replace('T', ' ').substring(0, 19),
  });
  registerDocumentAutomationJob(input.documentType, input.documentId);
  return id;
}

export interface JobExecutionResult {
  jobId: string;
  status: 'success' | 'failed' | 'partial' | 'timeout';
  duration: number;
  itemsProcessed: number;
  itemsFailed: number;
  errorMessage?: string;
  stdout?: string;
  stderr?: string;
}

class JobSchedulerService {
  private jobs: Map<string, CronJob.CronJob> = new Map();
  private jobHandlers: Map<string, () => Promise<any>> = new Map();
  private tickInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize scheduler and load jobs from database
   */
  async initialize() {
    console.log('[JobScheduler] Initializing...');
    
    try {
      const database = await db.getDb();
      if (!database) {
        console.warn('[JobScheduler] Database not available - jobs will not be scheduled');
        return;
      }

      const scheduledJobs = (await import('../../drizzle/schema')).scheduledJobs;
      const { eq } = await import('drizzle-orm');

      // Load active jobs from database
      const jobs = await database.select()
        .from(scheduledJobs)
        .where(eq(scheduledJobs.isActive, 1));

      for (const job of jobs) {
        // Register standard job handlers
        const handler = this.getJobHandler(job.jobType, job);
        if (handler) {
          this.registerJob({
            jobName: job.jobName,
            description: job.description || undefined,
            jobType: job.jobType,
            cronExpression: job.cronExpression || job.schedule || '0 9 * * *',
            handler,
            isActive: true,
            timezone: job.timezone || 'UTC',
          });
        }
      }

      // Start health check tick
      this.startHealthCheckTick();

      console.log(`[JobScheduler] Initialized with ${this.jobs.size} active jobs`);
    } catch (error) {
      console.error('[JobScheduler] Initialization error:', error);
    }
  }

  /**
   * Register a new scheduled job
   */
  registerJob(config: ScheduledJobConfig): { success: boolean; jobId?: string } {
    try {
      // Stop existing job if any
      if (this.jobs.has(config.jobName)) {
        const existing = this.jobs.get(config.jobName);
        existing?.stop();
        this.jobs.delete(config.jobName);
      }

      // Create and start cron job
      const cronJob = CronJob.CronJob.from({
        cronTime: config.cronExpression,
        onTick: () => this.executeJob(config.jobName, config.handler),
        start: config.isActive !== false,
        timeZone: config.timezone || 'UTC',
      });

      this.jobs.set(config.jobName, cronJob);
      this.jobHandlers.set(config.jobName, config.handler);

      console.log(`[JobScheduler] Registered job: ${config.jobName} (${config.cronExpression})`);
      return { success: true, jobId: config.jobName };
    } catch (error) {
      console.error(`[JobScheduler] Failed to register job ${config.jobName}:`, error);
      return { success: false };
    }
  }

  /**
   * Execute a job immediately
   */
  private async executeJob(jobName: string, handler: () => Promise<any>) {
    const database = await db.getDb();
    if (!database) {
      console.error('[JobScheduler] Database not available - cannot execute job');
      return;
    }

    const logId = uuidv4();
    const startTime = new Date();
    const jobExecutionLogs = (await import('../../drizzle/schema')).jobExecutionLogs;
    const scheduledJobs = (await import('../../drizzle/schema')).scheduledJobs;
    const { eq } = await import('drizzle-orm');

    try {
      console.log(`[JobScheduler] Executing job: ${jobName}`);

      // Get job ID
      const jobRecord = await database.select()
        .from(scheduledJobs)
        .where(eq(scheduledJobs.jobName, jobName))
        .limit(1);

      if (!jobRecord.length) {
        console.warn(`[JobScheduler] Job record not found: ${jobName}`);
        return;
      }

      const jobId = jobRecord[0].id;

      // Create execution log entry
      await database.insert(jobExecutionLogs).values({
        id: logId,
        jobId,
        status: 'running',
      });

      // Execute job with timeout (2 hours)
      const result = await Promise.race([
        handler(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Job execution timeout (2h)')), 2 * 60 * 60 * 1000)
        ),
      ]);

      const duration = Date.now() - startTime.getTime();

      // Update execution log
      await database.update(jobExecutionLogs)
        .set({
          status: 'success',
          duration,
          itemsProcessed: result?.itemsProcessed || 0,
          itemsFailed: result?.itemsFailed || 0,
          endTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
          stdout: JSON.stringify(result, null, 2),
        })
        .where(eq(jobExecutionLogs.id, logId));

      // Update job metadata
      await database.update(scheduledJobs)
        .set({
          lastRunAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          lastRunStatus: 'success',
          lastRunDuration: duration,
          nextScheduledRun: this.getNextCronTime(jobName),
        })
        .where(eq(scheduledJobs.id, jobId));

      console.log(`[JobScheduler] Job completed: ${jobName} (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime.getTime();
      const errorMsg = error instanceof Error ? error.message : String(error);

      console.error(`[JobScheduler] Job failed: ${jobName}`, error);

      // Update execution log
      await database.update(jobExecutionLogs)
        .set({
          status: 'failed',
          duration,
          endTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
          errorMessage: errorMsg,
          stderr: errorMsg,
        })
        .where(eq(jobExecutionLogs.id, logId));

      // Update job metadata
      const jobRecord = await database.select()
        .from(scheduledJobs)
        .where(eq(scheduledJobs.jobName, jobName))
        .limit(1);

      if (jobRecord.length) {
        await database.update(scheduledJobs)
          .set({
            lastRunAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
            lastRunStatus: 'failed',
            lastRunDuration: duration,
            lastFailureReason: errorMsg,
            nextScheduledRun: this.getNextCronTime(jobName),
          })
          .where(eq(scheduledJobs.id, jobRecord[0].id));

        // Trigger alerts if configured
        await this.triggerJobAlert(jobRecord[0].id, 'failure', errorMsg);
      }
    }
  }

  /**
   * Execute job manually
   */
  async executeJobManually(jobName: string): Promise<JobExecutionResult> {
    const handler = this.jobHandlers.get(jobName);
    if (!handler) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Job not found: ${jobName}`,
      });
    }

    const startTime = Date.now();
    try {
      await this.executeJob(jobName, handler);
      return {
        jobId: jobName,
        status: 'success',
        duration: Date.now() - startTime,
        itemsProcessed: 0,
        itemsFailed: 0,
      };
    } catch (error) {
      return {
        jobId: jobName,
        status: 'failed',
        duration: Date.now() - startTime,
        itemsProcessed: 0,
        itemsFailed: 0,
        errorMessage: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get job execution history
   */
  async getJobHistory(jobId: string, limit: number = 10) {
    try {
      const database = await db.getDb();
      if (!database) throw new Error('Database connection lost');

      const jobExecutionLogs = (await import('../../drizzle/schema')).jobExecutionLogs;
      const { eq, desc } = await import('drizzle-orm');

      const logs = await database.select()
        .from(jobExecutionLogs)
        .where(eq(jobExecutionLogs.jobId, jobId))
        .orderBy(desc(jobExecutionLogs.startTime))
        .limit(limit);

      return logs;
    } catch (error) {
      console.error('[JobScheduler] History retrieval error:', error);
      return [];
    }
  }

  /**
   * Health check tick (runs every 5 minutes)
   */
  private startHealthCheckTick() {
    if (this.tickInterval) clearInterval(this.tickInterval);

    this.tickInterval = setInterval(async () => {
      try {
        await this.checkJobHealth();
      } catch (error) {
        console.error('[JobScheduler] Health check error:', error);
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Check job health and trigger alerts
   */
  private async checkJobHealth() {
    try {
      const database = await db.getDb();
      if (!database) return;

      const jobHeartbeat = (await import('../../drizzle/schema')).jobHeartbeat;
      const scheduledJobs = (await import('../../drizzle/schema')).scheduledJobs;
      const { eq } = await import('drizzle-orm');

      const heartbeats = await database.select().from(jobHeartbeat);

      for (const hb of heartbeats) {
        const jobRecord = await database.select()
          .from(scheduledJobs)
          .where(eq(scheduledJobs.id, hb.jobId))
          .limit(1);

        if (!jobRecord.length) continue;

        const expectedInterval = hb.expectedHeartbeatInterval || 86400; // Default 1 day
        const timeSinceLastHeartbeat = hb.lastHeartbeatAt
          ? (Date.now() - new Date(hb.lastHeartbeatAt).getTime()) / 1000
          : Number.POSITIVE_INFINITY;

        if (timeSinceLastHeartbeat > expectedInterval) {
          // Job hasn't executed within expected interval
          const newConsecutiveFailures = (hb.consecutiveFailures || 0) + 1;

          await database.update(jobHeartbeat)
            .set({
              isHealthy: 0,
              consecutiveFailures: newConsecutiveFailures,
            })
            .where(eq(jobHeartbeat.id, hb.id));

          // Trigger alert
          if (newConsecutiveFailures >= 2) {
            await this.triggerJobAlert(
              hb.jobId,
              'no_execution',
              `Job ${jobRecord[0].jobName} hasn't executed in ${timeSinceLastHeartbeat}s`
            );
          }
        }
      }
    } catch (error) {
      console.error('[JobScheduler] Health check failed:', error);
    }
  }

  /**
   * Trigger job alert
   */
  private async triggerJobAlert(jobId: string, alertType: string, message: string) {
    try {
      const database = await db.getDb();
      if (!database) return;

      const jobAlertRules = (await import('../../drizzle/schema')).jobAlertRules;
      const jobAlertHistory = (await import('../../drizzle/schema')).jobAlertHistory;
      const { eq, and } = await import('drizzle-orm');

      const rules = await database.select()
        .from(jobAlertRules)
        .where(
          and(
            eq(jobAlertRules.jobId, jobId),
            eq(jobAlertRules.isActive, 1)
          )
        );

      for (const rule of rules) {
        const recipients = Array.isArray(rule.recipients) ? (rule.recipients as string[]) : [];

        // Log alert
        await database.insert(jobAlertHistory).values({
          id: uuidv4(),
          ruleId: rule.id,
          alertMessage: message,
        });

        // Send notification (email, SMS, webhook)
        console.log(`[JobScheduler] Alert triggered: ${alertType} for job ${jobId}`);

        if (rule.action === 'email' || rule.action === 'both') {
          // Queue email notification
          const emailService = await import('./emailService');
          for (const recipient of recipients) {
            await emailService.queueEmail({
              toEmail: recipient,
              subject: `[ALERT] Job Scheduler: ${alertType}`,
              htmlContent: `<p>${message}</p>`,
              relatedEntityType: 'job',
              relatedEntityId: jobId,
            });
          }
        }

        if (rule.action === 'sms' || rule.action === 'both') {
          // Queue SMS notification
          const smsService = await import('./smsService');
          for (const recipient of recipients) {
            await smsService.queueSms({
              phoneNumber: recipient,
              message: `Alert: ${alertType} - ${message}`,
              relatedEntityType: 'job',
              relatedEntityId: jobId,
            });
          }
        }
      }
    } catch (error) {
      console.error('[JobScheduler] Alert trigger error:', error);
    }
  }

  /**
   * Get next cron execution time
   */
  private getNextCronTime(jobName: string): string {
    const job = this.jobs.get(jobName);
    if (!job) return new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    return job.nextDate().toJSDate().toISOString().replace('T', ' ').substring(0, 19);
  }

  /**
   * Get job handler by type
   */
  private getJobHandler(jobType: string, job?: any): (() => Promise<any>) | null {
    const handlers: Record<string, () => Promise<any>> = {
      recurringInvoice: async () => {
        const { generateDueRecurringInvoices } = await import('../jobs/recurringInvoicesJob');
        return generateDueRecurringInvoices();
      },

      recurringExpense: async () => {
        const { generateDueRecurringExpenses } = await import('../jobs/recurringExpensesJob');
        return generateDueRecurringExpenses();
      },

      overdue_invoices: async () => {
        const { markOverdueInvoices } = await import('../jobs/overdueInvoicesJob');
        return markOverdueInvoices();
      },

      payment_reminder: async () => {
        const { handlePaymentReminders } = await import('../jobs/billing-automation');
        return handlePaymentReminders();
      },

      email_queue: async () => {
        const emailService = await import('./emailService');
        return emailService.processEmailQueue(20);
      },

      sms_queue: async () => {
        const smsService = await import('./smsService');
        return smsService.processSmsQueue(20);
      },

      document_automation: async () => {
        console.log(`[JobScheduler] Document automation check: ${job?.jobName || 'unknown'}`);
        return { itemsProcessed: 1, itemsFailed: 0 };
      },

      custom_email: async () => {
        const emailService = await import('./emailService');
        const config = job?.handler ? JSON.parse(job.handler) : {};
        const recipients = Array.isArray(config.recipients) ? config.recipients : [];
        let processed = 0;
        for (const recipient of recipients) {
          await emailService.queueEmail({
            toEmail: recipient,
            subject: config.subject || job?.jobName || 'Scheduled email',
            templateId: config.templateId,
            templateVariables: config.templateVariables || {},
            htmlContent: config.htmlContent || `<p>${config.message || ''}</p>`,
            plainTextContent: config.message,
            relatedEntityType: 'scheduled_job',
            relatedEntityId: job?.id,
          });
          processed++;
        }
        return { itemsProcessed: processed, itemsFailed: 0 };
      },

      custom_sms: async () => {
        const smsService = await import('./smsService');
        const { renderNotificationTemplate } = await import('./notificationRenderer');
        const config = job?.handler ? JSON.parse(job.handler) : {};
        const recipients = Array.isArray(config.recipients) ? config.recipients : [];
        let message = String(config.message || job?.jobName || 'Scheduled reminder');
        if (config.templateId) {
          const rendered = await renderNotificationTemplate(config.templateId, config.templateVariables || {}, { subject: config.subject || '', html: message, text: message });
          message = rendered.text;
        }
        let processed = 0;
        for (const recipient of recipients) {
          await smsService.queueSms({
            phoneNumber: recipient,
            message: message.slice(0, 160),
            relatedEntityType: 'scheduled_job',
            relatedEntityId: job?.id,
            organizationId: job?.organizationId,
            createdBy: job?.createdBy,
            templateId: config.templateId,
          });
          processed++;
        }
        return { itemsProcessed: processed, itemsFailed: 0 };
      },

      custom_reminder: async () => {
        const emailHandler = this.getJobHandler('custom_email', job);
        return emailHandler ? emailHandler() : { itemsProcessed: 0, itemsFailed: 0 };
      },

      custom: async () => {
        console.log(`[JobScheduler] Running custom job: ${job?.jobName || 'unknown'}`);
        return { itemsProcessed: 0, itemsFailed: 0 };
      },

      cleanup: async () => {
        console.log('[JobScheduler] Running cleanup job');
        return { itemsProcessed: 0 };
      },

      reconciliation: async () => {
        console.log('[JobScheduler] Running reconciliation job');
        return { itemsProcessed: 0 };
      },

      subscription_renewal: async () => {
        console.log('[JobScheduler] Running subscription renewal job');
        return { itemsProcessed: 0 };
      },
    };

    return handlers[jobType] || null;
  }

  /**
   * Get all jobs and their status
   */
  async getAllJobsStatus() {
    try {
      const database = await db.getDb();
      if (!database) throw new Error('Database connection lost');

      const scheduledJobs = (await import('../../drizzle/schema')).scheduledJobs;

      const jobs = await database.select().from(scheduledJobs);

      return jobs.map((job) => ({
        id: job.id,
        name: job.jobName,
        type: job.jobType,
        isActive: job.isActive,
        cron: job.cronExpression,
        lastRun: job.lastRunAt,
        lastStatus: job.lastRunStatus,
        nextRun: job.nextScheduledRun,
        duration: job.lastRunDuration,
      }));
    } catch (error) {
      console.error('[JobScheduler] Get status error:', error);
      return [];
    }
  }

  /**
   * Shutdown scheduler
   */
  shutdown() {
    console.log('[JobScheduler] Shutting down...');
    
    // Stop all cron jobs
    for (const job of this.jobs.values()) {
      job.stop();
    }
    this.jobs.clear();

    // Stop health check tick
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }

    console.log('[JobScheduler] Stopped');
  }
}

// Singleton instance
const scheduler = new JobSchedulerService();

function registerDocumentAutomationJob(documentType: string, documentId: string) {
  scheduler.registerJob({
    jobName: `${documentType}_${documentId}_automation`,
    description: `Automatic ${documentType} reminders and follow-up automation`,
    jobType: 'document_automation',
    cronExpression: '0 9 * * *',
    handler: async () => ({ itemsProcessed: 1, itemsFailed: 0 }),
    isActive: true,
  });
}

export async function createSystemBackupSnapshot(input: { name?: string; scope?: 'full' | 'organization' | 'tables'; organizationId?: string; selectedTables?: string[]; createdBy?: string } = {}) {
  const database = await db.getDb();
  if (!database) throw new Error('Database unavailable');

  const backupId = uuidv4();
  const timestamp = new Date().toISOString();
  const name = input.name || `scheduled_backup_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}`;
  const createdBy = input.createdBy || 'system';
  const scope = input.scope || 'full';

  await database.execute(sql`INSERT INTO backup_history (id, name, backupType, scope, scopeEntityId, status, createdBy) VALUES (${backupId}, ${name}, 'scheduled', ${scope}, ${input.organizationId || null}, 'running', ${createdBy})`);

  const ALL_TABLES = getBackupTableRegistry();
  let tablesToBackup = ALL_TABLES;
  if (scope === 'tables' && input.selectedTables?.length) {
    tablesToBackup = ALL_TABLES.filter((table) => input.selectedTables!.includes(table.name));
  }

  const backupData: Record<string, unknown> = {
    metadata: {
      version: '2.0',
      id: backupId,
      name,
      scope,
      organizationId: input.organizationId || null,
      timestamp,
      createdBy,
    },
    data: {} as Record<string, unknown[]>,
  };

  let totalRecords = 0;
  const backedUpTables: string[] = [];

  for (const table of tablesToBackup) {
    try {
      let records: unknown[];
      if (scope === 'organization' && input.organizationId) {
        try {
          records = await database.select().from(table.schema as any)
            .where(eq((table.schema as any).organizationId, input.organizationId));
        } catch {
          records = await database.select().from(table.schema as any);
        }
      } else {
        records = await database.select().from(table.schema as any);
      }
      if (records.length > 0) {
        (backupData.data as Record<string, unknown[]>)[table.name] = records;
        totalRecords += records.length;
        backedUpTables.push(table.name);
      }
    } catch {
      // Skip tables that are missing or cannot be queried.
    }
  }

  const jsonStr = JSON.stringify(backupData);
  const sizeBytes = Buffer.byteLength(jsonStr, 'utf8');
  const fileName = `backup_${scope}_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const tablesListStr = JSON.stringify(backedUpTables);

  await database.execute(sql`UPDATE backup_history SET status = 'completed', tablesList = ${tablesListStr}, recordCount = ${totalRecords}, sizeBytes = ${sizeBytes}, fileName = ${fileName}, completedAt = NOW() WHERE id = ${backupId}`);

  return { success: true, backupId, fileName, stats: { totalRecords, tablesBackedUp: backedUpTables.length, sizeBytes } };
}

export async function triggerScheduledBackup(scheduleRecord: { id: string; name?: string; schedule?: string; backupType?: string; retentionDays?: number; createdBy?: string; }) {
  const backupName = scheduleRecord.name || 'scheduled_backup';
  return createSystemBackupSnapshot({ name: `${backupName} ${new Date().toISOString().slice(0, 19)}`, scope: 'full', createdBy: scheduleRecord.createdBy || 'system' });
}

export function isValidBackupSchedule(expression: string) {
  return cron.validate(expression);
}

export function unregisterBackupSchedule(scheduleId: string) {
  const job = backupScheduleJobs.get(scheduleId);
  if (!job) return false;
  job.stop();
  backupScheduleJobs.delete(scheduleId);
  console.log(`[BackupScheduler] Unregistered ${scheduleId}`);
  return true;
}

export function registerBackupSchedule(scheduleRecord: { id: string; name?: string; schedule?: string; backupType?: string; createdBy?: string }) {
  const expr = String(scheduleRecord.schedule || '0 2 * * *');
  if (!isValidBackupSchedule(expr)) {
    console.warn(`[BackupScheduler] Invalid cron expression for ${scheduleRecord.name}: ${expr}`);
    return false;
  }

  unregisterBackupSchedule(scheduleRecord.id);

  const job = cron.schedule(expr, async () => {
    try {
      const database = await db.getDb();
      if (!database) throw new Error('Database unavailable; scheduled backup skipped');
      const backupSchedules = (await import('../../drizzle/schema')).backupSchedules;
      const [currentSchedule] = await database.select({ status: backupSchedules.status })
        .from(backupSchedules)
        .where(eq(backupSchedules.id, scheduleRecord.id))
        .limit(1);
      if (!currentSchedule || String(currentSchedule.status).toLowerCase() !== 'scheduled') {
        unregisterBackupSchedule(scheduleRecord.id);
        return;
      }
      await triggerScheduledBackup(scheduleRecord);
      console.log(`[BackupScheduler] Scheduled backup succeeded for ${scheduleRecord.name || scheduleRecord.id}`);
    } catch (error: any) {
      console.error(`[BackupScheduler] Scheduled backup failed for ${scheduleRecord.name || scheduleRecord.id}:`, error?.message || error);
    }
  }, { timezone: 'UTC' });

  job.start();
  backupScheduleJobs.set(scheduleRecord.id, job);
  console.log(`[BackupScheduler] Registered ${scheduleRecord.name || scheduleRecord.id} (${expr})`);
  return true;
}

export async function initializeBackupScheduler() {
  const database = await db.getDb();
  if (!database) {
    console.warn('[BackupScheduler] Database unavailable - backup schedules not initialized');
    return;
  }

  try {
    const backupSchedules = (await import('../../drizzle/schema')).backupSchedules;
    const smokeName = 'deployment_smoke_test';
    const smokeSchedules = await database.select({ id: backupSchedules.id })
      .from(backupSchedules)
      .where(eq(backupSchedules.name, smokeName));
    for (const schedule of smokeSchedules) {
      unregisterBackupSchedule(schedule.id);
    }
    if (smokeSchedules.length) {
      await database.delete(backupSchedules).where(eq(backupSchedules.name, smokeName));
      console.warn(`[BackupScheduler] Removed ${smokeSchedules.length} obsolete deployment smoke schedule(s).`);
    }

    const allRows = await database.select().from(backupSchedules);
    const rows = allRows.filter((row) => String(row.status).toLowerCase() === 'scheduled');
    for (const row of rows) {
      registerBackupSchedule({
        id: row.id,
        name: row.name || 'Scheduled Backup',
        schedule: row.schedule || '0 2 * * *',
        backupType: row.backupType || 'full',
        createdBy: row.createdBy || 'system',
      });
    }
    console.log(`[BackupScheduler] Initialized ${rows.length} scheduled backup tasks`);
  } catch (error) {
    console.error('[BackupScheduler] Initialization error:', error);
  }
}

export default scheduler;
export const initializeScheduler = () => scheduler.initialize();
export const registerJob = (config: ScheduledJobConfig) => scheduler.registerJob(config);
export const executeJobManually = (jobName: string) => scheduler.executeJobManually(jobName);
export const getJobHistory = (jobId: string, limit?: number) =>
  scheduler.getJobHistory(jobId, limit);
export const getAllJobsStatus = () => scheduler.getAllJobsStatus();
export const shutdownScheduler = () => scheduler.shutdown();
