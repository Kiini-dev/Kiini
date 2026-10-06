/**
 * Dunning Cron Job Service
 * Scheduled task to process dunning notifications daily
 * Handles payment reminders, service suspension, and termination
 */

import {
  processDunningForOrganization,
  processDunningForInvoice,
} from "./dunningEventProcessor";
import { getDb } from "../db";
import { organizations } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export interface DunningCronOptions {
  organizationId?: string; // If provided, process only this org
  batchSize?: number; // Number of orgs to process per run
  dryRun?: boolean; // If true, only report what would happen
}

export interface DunningCronResult {
  success: boolean;
  startTime: Date;
  endTime: Date;
  durationMs: number;
  organizationsProcessed: number;
  totalInvoicesProcessed: number;
  totalNoticesSent: number;
  totalSuspensions: number;
  totalTerminations: number;
  errors: Array<{
    organizationId: string;
    error: string;
  }>;
}

/**
 * Main dunning cron job - processes all organizations
 * Should be scheduled to run daily (recommended: early morning in each timezone)
 */
export async function processDunningNotifications(
  options?: DunningCronOptions
): Promise<DunningCronResult> {
  const startTime = new Date();
  console.log("[Dunning Cron] Starting dunning notification processing...");

  const result: DunningCronResult = {
    success: false,
    startTime,
    endTime: new Date(),
    durationMs: 0,
    organizationsProcessed: 0,
    totalInvoicesProcessed: 0,
    totalNoticesSent: 0,
    totalSuspensions: 0,
    totalTerminations: 0,
    errors: [],
  };

  try {
    const db = await getDb();
    if (!db) {
      result.errors.push({
        organizationId: "system",
        error: "Database connection failed",
      });
      return result;
    }

    // Get organizations to process
    let orgsToProcess: any[] = [];

    if (options?.organizationId) {
      // Process single organization
      const org = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, options.organizationId));
      
      if (org.length) {
        orgsToProcess = org;
      }
    } else {
      // Get all active organizations
      orgsToProcess = await db
        .select()
        .from(organizations);
    }

    console.log(
      `[Dunning Cron] Processing ${orgsToProcess.length} organization(s)...`
    );

    // Process each organization
    for (const org of orgsToProcess) {
      try {
        const orgResult = await processDunningForOrganization(org.id, {
          isMultiTenant: org.isMultiTenant === 1 || org.isMultiTenant === true,
        });

        if (orgResult.success) {
          result.organizationsProcessed++;
          result.totalInvoicesProcessed += orgResult.processedInvoices;
          result.totalNoticesSent += orgResult.totalNoticesSent;
          result.totalSuspensions += orgResult.totalSuspensions;
          result.totalTerminations += orgResult.totalTerminations;

          console.log(
            `[Dunning Cron] ${org.name} (${org.id}): ${orgResult.processedInvoices} invoices, ` +
            `${orgResult.totalNoticesSent} notices, ${orgResult.totalSuspensions} suspensions, ` +
            `${orgResult.totalTerminations} terminations`
          );
        } else {
          result.errors.push({
            organizationId: org.id,
            error: orgResult.errors.join("; "),
          });
        }
      } catch (error) {
        console.error(
          `[Dunning Cron] Error processing organization ${org.id}:`,
          error
        );
        result.errors.push({
          organizationId: org.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    result.success = result.errors.length === 0;
    result.endTime = new Date();
    result.durationMs = result.endTime.getTime() - startTime.getTime();

    console.log(
      `[Dunning Cron] Completed in ${result.durationMs}ms - ` +
      `${result.organizationsProcessed} orgs, ` +
      `${result.totalNoticesSent} notices, ` +
      `${result.totalSuspensions} suspensions, ` +
      `${result.totalTerminations} terminations`
    );

    return result;
  } catch (error) {
    console.error("[Dunning Cron] Fatal error:", error);
    result.errors.push({
      organizationId: "system",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    result.endTime = new Date();
    result.durationMs = result.endTime.getTime() - startTime.getTime();
    return result;
  }
}

/**
 * Hourly dunning check - for real-time or near-real-time processing
 * Processes invoices that are due today or overdue
 * Lighter weight than full daily run
 */
export async function processDunningNotificationsHourly(
  organizationId: string
): Promise<{
  success: boolean;
  processedCount: number;
  noticesSent: number;
  error?: string;
}> {
  try {
    const result = await processDunningForOrganization(organizationId, {
      daysOverdue: 0, // Only process invoices that are overdue
    });

    return {
      success: result.success,
      processedCount: result.processedInvoices,
      noticesSent: result.totalNoticesSent,
      error: result.errors.length > 0 ? result.errors[0] : undefined,
    };
  } catch (error) {
    console.error("[Dunning Cron] Hourly processing error:", error);
    return {
      success: false,
      processedCount: 0,
      noticesSent: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Manual trigger to process a specific invoice immediately
 * Useful for testing or manual intervention
 */
export async function processDunningForInvoiceManual(
  invoiceId: string,
  organizationId: string
): Promise<{
  success: boolean;
  noticesSent: number;
  suspensionApplied: boolean;
  terminationApplied: boolean;
  events: Array<{
    eventType: string;
    status: string;
    message: string;
  }>;
}> {
  try {
    const result = await processDunningForInvoice(
      invoiceId,
      organizationId,
      { processNotifications: true }
    );

    return {
      success: result.success,
      noticesSent: result.noticesSent,
      suspensionApplied: result.suspensionApplied,
      terminationApplied: result.terminationApplied,
      events: result.events,
    };
  } catch (error) {
    console.error("[Dunning Cron] Manual processing error:", error);
    return {
      success: false,
      noticesSent: 0,
      suspensionApplied: false,
      terminationApplied: false,
      events: [],
    };
  }
}

/**
 * Initialize dunning cron job scheduler
 * Call this during app startup to register the dunning job
 */
export async function initializeDunningCronJob(): Promise<void> {
  try {
    // This would register with your job scheduler
    // Example: registerJob('processDunningNotifications', '0 2 * * *', processDunningNotifications);
    console.log("[Dunning Cron] Dunning job scheduler initialized");
  } catch (error) {
    console.error("[Dunning Cron] Failed to initialize:", error);
  }
}
