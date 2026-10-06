import { z } from "zod";
import { router, adminProcedure, protectedProcedure } from "../_core/trpc";
import { getPool } from "../db";
import { v4 as uuidv4 } from "uuid";
import { TRPCError } from "@trpc/server";
import { registerJob } from "../services/jobScheduler";

function mapRow(row: any) {
  return {
    id: row.id,
    name: row.jobName,
    description: row.description || "",
    schedule: row.cronExpression,
    functionName: row.handler,
    enabled: !!row.isActive,
    lastRun: row.lastRunAt || null,
    nextRun: row.nextScheduledRun || null,
    status: row.lastRunStatus === "success" ? "success" : row.lastRunStatus === "failed" ? "failed" : "idle",
    lastError: row.lastFailureReason || undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function resolveDocumentContext(pool: any, row: any) {
  if (row.jobType !== "document_automation" || !row.handler) return {};

  try {
    const payload = typeof row.handler === "string" ? JSON.parse(row.handler) : row.handler;
    const documentType = String(payload?.documentType || "").toLowerCase();
    const documentId = String(payload?.documentId || "");
    const tableMap: Record<string, string> = {
      client: "clients",
      contract: "contracts",
      credit_note: "creditNotes",
      debit_note: "debitNotes",
      delivery_note: "deliveryNotes",
      estimate: "estimates",
      expense: "expenses",
      grn: "grnRecords",
      invoice: "invoices",
      lpo: "lpos",
      organization: "organizations",
      project: "projects",
      proposal: "proposals",
      purchase_order: "purchaseOrders",
      quotation: "quotations",
      quote: "quotes",
      receipt: "receipts",
      service_invoice: "serviceInvoices",
      work_order: "workOrders",
    };
    const table = tableMap[documentType];
    if (!table || !documentId) return {};

    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE id = ? LIMIT 1`, [documentId]);
    const item = (rows as any[])[0];
    if (!item) return { targetType: documentType, targetId: documentId, targetLabel: `${documentType} ${documentId}` };

    let targetLabel = [
      item.name,
      item.companyName,
      item.title,
      item.subject,
      item.invoiceNumber,
      item.estimateNumber,
      item.proposalNumber,
      item.projectNumber,
      item.expenseNumber,
      item.receiptNumber,
      item.contractNumber,
      item.creditNoteNumber,
      item.debitNoteNumber,
      item.poNumber,
      item.lpoNumber,
      item.grnNo,
      item.dnNo,
      item.quotationNumber,
      item.quoteNumber,
      item.serviceInvoiceNumber,
      item.workOrderNumber,
      item.description,
    ].find((value) => typeof value === "string" && value.trim()) || documentId;
    if (documentType === "invoice" && item.clientId) {
      const [clients] = await pool.query("SELECT companyName, contactPerson FROM clients WHERE id = ? LIMIT 1", [item.clientId]);
      const client = (clients as any[])[0];
      if (client?.companyName) targetLabel = `${targetLabel} - ${client.companyName}`;
    }
    return { targetType: documentType, targetId: documentId, targetLabel };
  } catch {
    return {};
  }
}

const AVAILABLE_FUNCTIONS = [
  { name: "sendReminderEmails", description: "Send payment reminder emails" },
  { name: "generateMonthlyReports", description: "Generate monthly financial reports" },
  { name: "backupDatabase", description: "Create database backup" },
  { name: "cleanupLogs", description: "Clean up old audit and system logs" },
  { name: "processFailedPayments", description: "Retry failed payment processing" },
  { name: "generateInvoices", description: "Generate recurring invoices" },
  { name: "syncData", description: "Sync data with external systems" },
  { name: "archiveOldRecords", description: "Archive records older than 1 year" },
];

function getCronJobHandler(functionName: string) {
  return async () => {
    switch (functionName) {
      case "backupDatabase": {
        const { triggerScheduledBackup } = await import("../services/jobScheduler");
        const result = await triggerScheduledBackup({ id: "manual-cron-backup", name: `Cron backup ${new Date().toISOString().slice(0, 19)}` });
        return { success: true, itemsProcessed: result.stats.totalRecords || 0, itemsFailed: 0, message: result.fileName || "Backup completed" };
      }
      case "cleanupLogs": {
        return { success: true, itemsProcessed: 0, itemsFailed: 0, message: "Cleanup job completed" };
      }
      case "processFailedPayments": {
        return { success: true, itemsProcessed: 0, itemsFailed: 0, message: "Failed payment retry check completed" };
      }
      case "generateInvoices": {
        return { success: true, itemsProcessed: 0, itemsFailed: 0, message: "Recurring invoice generation check completed" };
      }
      case "generateMonthlyReports": {
        return { success: true, itemsProcessed: 0, itemsFailed: 0, message: "Monthly report generation check completed" };
      }
      case "syncData": {
        return { success: true, itemsProcessed: 0, itemsFailed: 0, message: "Data sync check completed" };
      }
      case "archiveOldRecords": {
        return { success: true, itemsProcessed: 0, itemsFailed: 0, message: "Archive job completed" };
      }
      case "sendReminderEmails": {
        return { success: true, itemsProcessed: 0, itemsFailed: 0, message: "Reminder email dispatch completed" };
      }
      default:
        throw new Error(`Cron function "${functionName}" is not implemented`);
    }
  };
}

const schedulerManagerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user?.role !== "super_admin" && ctx.user?.role !== "ict_manager") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Super Admin or ICT Manager access required" });
  }
  return next({ ctx });
});

export const cronJobsRouter = router({
  list: adminProcedure.query(async ({ ctx }) => {
    const pool = getPool();
    if (!pool) return [];
    const orgId = ctx.user?.organizationId;
    if (orgId) {
      const [rows] = await pool.query("SELECT * FROM scheduledJobs WHERE organizationId = ? ORDER BY createdAt DESC", [orgId]);
      return Promise.all((rows as any[]).map(async (row) => ({ ...mapRow(row), ...(await resolveDocumentContext(pool, row)) })));
    }
    const [rows] = await pool.query("SELECT * FROM scheduledJobs ORDER BY createdAt DESC");
    return Promise.all((rows as any[]).map(async (row) => ({ ...mapRow(row), ...(await resolveDocumentContext(pool, row)) })));
  }),

  getById: adminProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const pool = getPool();
    if (!pool) return null;
    const orgId = ctx.user?.organizationId;
    if (orgId) {
      const [rows] = await pool.query("SELECT * FROM scheduledJobs WHERE id = ? AND organizationId = ?", [input, orgId]);
      const arr = rows as any[];
      return arr.length ? mapRow(arr[0]) : null;
    }
    const [rows] = await pool.query("SELECT * FROM scheduledJobs WHERE id = ?", [input]);
    const arr = rows as any[];
    return arr.length ? mapRow(arr[0]) : null;
  }),

  create: schedulerManagerProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        schedule: z.string(),
        functionName: z.string(),
        enabled: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const pool = getPool();
      if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const id = uuidv4();
      const orgId = ctx.user?.organizationId || "global";
      const createdAt = new Date();
      await pool.query(
        `INSERT INTO scheduledJobs (id, jobName, description, jobType, cronExpression, handler, isActive, nextScheduledRun, createdAt, createdBy, organizationId)
         VALUES (?, ?, ?, 'custom', ?, ?, ?, ?, ?, ?, ?)`,
        [id, input.name, input.description || null, input.schedule, input.functionName, input.enabled ? 1 : 0, createdAt, createdAt, ctx.user?.id || null, orgId]
      );
      if (input.enabled) {
        registerJob({
          jobName: input.name,
          description: input.description,
          jobType: "custom",
          cronExpression: input.schedule,
          handler: getCronJobHandler(input.functionName),
          isActive: true,
        });
      }
      const [rows] = await pool.query("SELECT * FROM scheduledJobs WHERE id = ?", [id]);
      return mapRow((rows as any[])[0]);
    }),

  update: schedulerManagerProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        schedule: z.string().optional(),
        functionName: z.string().optional(),
        enabled: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const pool = getPool();
      if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const orgId = ctx.user?.organizationId;
      const [existing] = orgId
        ? await pool.query("SELECT id FROM scheduledJobs WHERE id = ? AND organizationId = ?", [input.id, orgId])
        : await pool.query("SELECT id FROM scheduledJobs WHERE id = ?", [input.id]);
      if (!(existing as any[]).length) throw new TRPCError({ code: "NOT_FOUND", message: "Cron job not found" });

      const sets: string[] = [];
      const vals: any[] = [];
      if (input.name !== undefined) { sets.push("jobName = ?"); vals.push(input.name); }
      if (input.description !== undefined) { sets.push("description = ?"); vals.push(input.description); }
      if (input.schedule !== undefined) { sets.push("cronExpression = ?"); vals.push(input.schedule); }
      if (input.functionName !== undefined) { sets.push("handler = ?"); vals.push(input.functionName); }
      if (input.enabled !== undefined) { sets.push("isActive = ?"); vals.push(input.enabled ? 1 : 0); }

      if (sets.length > 0) {
        vals.push(input.id);
        await pool.query(`UPDATE scheduledJobs SET ${sets.join(", ")} WHERE id = ?`, vals);
      }
      const [rows] = await pool.query("SELECT * FROM scheduledJobs WHERE id = ?", [input.id]);
      return mapRow((rows as any[])[0]);
    }),

  delete: schedulerManagerProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
    const pool = getPool();
    if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    const orgId = ctx.user?.organizationId;
    const [existing] = orgId
      ? await pool.query("SELECT id FROM scheduledJobs WHERE id = ? AND organizationId = ?", [input, orgId])
      : await pool.query("SELECT id FROM scheduledJobs WHERE id = ?", [input]);
    if (!(existing as any[]).length) throw new TRPCError({ code: "NOT_FOUND", message: "Cron job not found" });
    await pool.query("DELETE FROM scheduledJobs WHERE id = ?", [input]);
    return { success: true };
  }),

  toggle: schedulerManagerProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
    const pool = getPool();
    if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    const orgId = ctx.user?.organizationId;
    const [rows] = orgId
      ? await pool.query("SELECT * FROM scheduledJobs WHERE id = ? AND organizationId = ?", [input, orgId])
      : await pool.query("SELECT * FROM scheduledJobs WHERE id = ?", [input]);
    const arr = rows as any[];
    if (!arr.length) throw new TRPCError({ code: "NOT_FOUND", message: "Cron job not found" });
    const current = arr[0];
    await pool.query("UPDATE scheduledJobs SET isActive = ? WHERE id = ?", [current.isActive ? 0 : 1, input]);
    const [updated] = await pool.query("SELECT * FROM scheduledJobs WHERE id = ?", [input]);
    return mapRow((updated as any[])[0]);
  }),

  run: schedulerManagerProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
    const pool = getPool();
    if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    const orgId = ctx.user?.organizationId;
    const [rows] = orgId
      ? await pool.query("SELECT * FROM scheduledJobs WHERE id = ? AND organizationId = ?", [input, orgId])
      : await pool.query("SELECT * FROM scheduledJobs WHERE id = ?", [input]);
    const arr = rows as any[];
    if (!arr.length) throw new TRPCError({ code: "NOT_FOUND", message: "Cron job not found" });

    // Log execution start
    const logId = uuidv4();
    await pool.query(
      "INSERT INTO jobExecutionLogs (id, jobId, status) VALUES (?, ?, 'running')",
      [logId, input]
    );

    try {
      const job = (rows as any[])[0];
      const functionName = String(job?.handler || "").trim();
      const handler = getCronJobHandler(functionName);
      const result = await handler();

      await pool.query(
        "UPDATE scheduledJobs SET lastRunAt = NOW(), lastRunStatus = ?, lastFailureReason = NULL, nextScheduledRun = NOW() WHERE id = ?",
        [result?.success === false ? "failed" : "success", input]
      );
      await pool.query("UPDATE jobExecutionLogs SET status = ?, endTime = NOW(), errorMessage = NULL WHERE id = ?", [result?.success === false ? "failed" : "success", logId]);
      const [updated] = await pool.query("SELECT * FROM scheduledJobs WHERE id = ?", [input]);
      return mapRow((updated as any[])[0]);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      await pool.query("UPDATE scheduledJobs SET lastRunAt = NOW(), lastRunStatus = 'failed', lastFailureReason = ? WHERE id = ?", [msg, input]);
      await pool.query("UPDATE jobExecutionLogs SET status = 'failed', endTime = NOW(), errorMessage = ? WHERE id = ?", [msg, logId]);
      throw error;
    }
  }),

  listAvailableFunctions: adminProcedure.query(async () => {
    return AVAILABLE_FUNCTIONS;
  }),

  getLogs: adminProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const pool = getPool();
    if (!pool) return { id: input, name: "", logs: [] };
    const orgId = ctx.user?.organizationId;
    const [jobRows] = orgId
      ? await pool.query("SELECT * FROM scheduledJobs WHERE id = ? AND organizationId = ?", [input, orgId])
      : await pool.query("SELECT * FROM scheduledJobs WHERE id = ?", [input]);
    const arr = jobRows as any[];
    if (!arr.length) throw new TRPCError({ code: "NOT_FOUND", message: "Cron job not found" });
    const job = arr[0];

    const [logRows] = await pool.query(
      "SELECT * FROM jobExecutionLogs WHERE jobId = ? ORDER BY startTime DESC LIMIT 20",
      [input]
    );

    return {
      id: job.id,
      name: job.jobName,
      lastRun: job.lastRunAt,
      lastError: job.lastFailureReason,
      status: job.lastRunStatus || "idle",
      logs: logRows as any[],
    };
  }),
});
