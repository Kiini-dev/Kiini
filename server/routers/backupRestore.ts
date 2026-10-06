/**
 * Full System Backup & Restore Router
 * Exports/imports ALL data: settings, line items, users, everything.
 */
import { router, protectedProcedure } from "../_core/trpc";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb, logActivity } from "../db";
import * as schema from "../../drizzle/schema";
import * as schemaExtended from "../../drizzle/schema-extended";
import { v4 as uuidv4 } from "uuid";
import { eq, desc, getTableColumns } from "drizzle-orm";
import { getBackupTableRegistry } from "../data/tableRegistry";
import { isValidBackupSchedule, registerBackupSchedule, unregisterBackupSchedule } from "../services/jobScheduler";

const adminProcedure = createFeatureRestrictedProcedure("system:backup");

function parseBackupTables(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    return value.split(",").map((table) => table.trim()).filter(Boolean);
  }
  return [];
}

/** All schema tables included in a full backup. */
const BACKUP_TABLES = getBackupTableRegistry();

async function getLiveTableColumns(db: any, tableName: string): Promise<Set<string>> {
  const [rows] = await db.execute(`SHOW COLUMNS FROM \`${tableName.replace(/`/g, "") }\``);
  return new Set((Array.isArray(rows) ? rows : []).map((row: any) => String(row.Field || row.field || "")));
}
/*
  { name: "settings",          table: schema.settings },
  { name: "organizations",     table: schema.organizations },
  { name: "users",              table: schema.users },
  { name: "systemSettings",    table: schema.systemSettings },
  { name: "defaultSettings",   table: schema.defaultSettings },
  { name: "documentNumberFormats", table: schema.documentNumberFormats },
  { name: "userRoles",         table: schema.userRoles },
  { name: "rolePermissions",   table: schema.rolePermissions },
  { name: "userPermissions",   table: schema.userPermissions },
  { name: "clients",           table: schema.clients },
  { name: "products",          table: schema.products },
  { name: "services",          table: schema.services },
  { name: "departments",       table: schema.departments },
  { name: "jobGroups",         table: schema.jobGroups },
  { name: "employees",         table: schema.employees },
  { name: "invoices",          table: schema.invoices },
  { name: "invoiceItems",      table: schema.invoiceItems },
  { name: "estimates",         table: schema.estimates },
  { name: "estimateItems",     table: schema.estimateItems },
  { name: "receipts",          table: schema.receipts },
  { name: "lineItems",         table: schema.lineItems },
  { name: "payments",          table: schema.payments },
  { name: "expenses",          table: schema.expenses },
  { name: "budgets",           table: schema.budgets },
  { name: "projects",          table: schema.projects },
  { name: "projectTasks",      table: schema.projectTasks },
  { name: "projectMilestones", table: schema.projectMilestones },
  { name: "timeEntries",       table: schema.timeEntries },
  { name: "opportunities",     table: schema.opportunities },
  { name: "payroll",           table: schema.payroll },
  { name: "attendance",        table: schema.attendance },
  { name: "leaveRequests",     table: schema.leaveRequests },
  { name: "deliveryNotes",     table: schema.deliveryNotes },
  { name: "deliveryNoteLineItems", table: schemaExtended.deliveryNoteLineItems },
  { name: "grnRecords",        table: schema.grnRecords },
  { name: "grnLineItems",      table: schemaExtended.grnLineItems },
  { name: "lpos",              table: schemaExtended.lpos },
  { name: "lpoLineItems",      table: schemaExtended.lpoLineItems },
  { name: "tickets",           table: schema.tickets },
  { name: "ticketResponses",   table: schema.ticketResponses },
  { name: "activityLog",       table: schema.activityLog },
  { name: "auditLogs",         table: schema.auditLogs },
  { name: "pricingPlans",      table: schema.pricingPlans },
  { name: "emailQueue",        table: schema.emailQueue },
  { name: "systemLogs",        table: schema.systemLogs },
  { name: "activeSessions",    table: schema.activeSessions },
]; */

export const backupRestoreRouter = router({
  /** Create a full JSON backup of all system data */
  createBackup: adminProcedure
    .input(z.object({
      includeActivityLogs: z.boolean().default(true),
      label: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const backup: Record<string, any[]> = {};
      const errors: string[] = [];

      for (const { name, schema: table } of BACKUP_TABLES) {
        if (!input.includeActivityLogs && (name === "activityLog" || name === "auditLogs")) continue;
        try {
          try {
            backup[name] = await db.select().from(table as any);
          } catch {
            const liveColumns = await getLiveTableColumns(db, name);
            const [rows] = await db.execute(`SELECT * FROM \`${name.replace(/`/g, "") }\``);
            backup[name] = (Array.isArray(rows) ? rows : []).map((row: any) =>
              Object.fromEntries(Object.entries(row).filter(([key]) => liveColumns.has(key)))
            );
          }
        } catch (e: any) {
          errors.push(`${name}: ${e.message}`);
          backup[name] = [];
        }
      }

      const metadata = {
        version: "2.0",
        createdAt: new Date().toISOString(),
        createdBy: ctx.user.id,
        label: input.label || `backup_${new Date().toISOString().split("T")[0]}`,
        tableCount: BACKUP_TABLES.length,
        errors,
        recordCounts: Object.fromEntries(
          Object.entries(backup).map(([k, v]) => [k, v.length])
        ),
      };

      // Log backup to history
      const totalRecords = Object.values(backup).reduce((sum, arr) => sum + arr.length, 0);
      const backupSize = JSON.stringify({ metadata, data: backup }).length;

      await db.insert(schema.backupHistory).values({
        id: uuidv4(),
        name: metadata.label,
        backupType: "full",
        scope: "full",
        status: "completed",
        tablesList: JSON.stringify(Object.keys(backup)),
        recordCount: totalRecords,
        sizeBytes: backupSize,
        fileName: `${metadata.label}.json`,
        createdBy: ctx.user.id,
        completedAt: new Date().toISOString(),
      });

      // Log activity
      await logActivity({
        userId: ctx.user.id,
        action: "backup_created",
        entityType: "system",
        entityId: "backup",
        description: `System backup created: ${totalRecords} records from ${Object.keys(backup).length} tables`,
      });

      return { metadata, data: backup };
    }),

  /** Restore from a full JSON backup */
  restoreBackup: adminProcedure
    .input(z.object({
      backup: z.object({
        metadata: z.object({ version: z.string() }),
        data: z.record(z.string(), z.any()),
      }),
      dryRun: z.boolean().default(true),
      tables: z.array(z.string()).optional(), // restore only specific tables
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Normalise: each data entry may be an array already or a JSON-stringified array
      const normaliseRows = (v: any): any[] => {
        if (Array.isArray(v)) return v;
        if (typeof v === 'string') { try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; } }
        return [];
      };

      if (input.dryRun) {
        return {
          dryRun: true,
          message: "Dry run complete — no data modified",
          tablesFound: Object.keys(input.backup.data),
          recordCounts: Object.fromEntries(
            Object.entries(input.backup.data).map(([k, v]) => [k, normaliseRows(v).length])
          ),
        };
      }

      const results: Record<string, { inserted: number; errors: string[] }> = {};
      const requestedTables = input.tables || BACKUP_TABLES.map(t => t.name);

      for (const { name, schema: table } of BACKUP_TABLES) {
        if (!requestedTables.includes(name)) continue;
        const rows = normaliseRows(input.backup.data[name]);
        if (!rows || rows.length === 0) {
          results[name] = { inserted: 0, errors: [] };
          continue;
        }

        const tableErrors: string[] = [];
        let inserted = 0;

        // Insert in chunks of 50 to avoid query size limits
        const chunkSize = 50;
        for (let i = 0; i < rows.length; i += chunkSize) {
          const chunk = rows.slice(i, i + chunkSize);
          try {
            const allowedColumns = new Set(Object.keys(getTableColumns(table as any)));
            const liveColumns = await getLiveTableColumns(db, name);
            const sanitizedChunk = chunk.map((row) =>
              Object.fromEntries(Object.entries(row).filter(([key]) => allowedColumns.has(key) && liveColumns.has(key)))
            );
            // Fast path: insert entire chunk using only current schema columns.
            await (db as any).insert(table).values(sanitizedChunk);
            inserted += chunk.length;
          } catch (error: any) {
            // Chunk failed (likely duplicate keys) — fall back to row-by-row
            for (const row of chunk) {
              try {
                const allowedColumns = new Set(Object.keys(getTableColumns(table as any)));
                const liveColumns = await getLiveTableColumns(db, name);
                const sanitizedRow = Object.fromEntries(
                  Object.entries(row).filter(([key]) => allowedColumns.has(key) && liveColumns.has(key))
                );
                await (db as any).insert(table).values([sanitizedRow]);
                inserted++;
              } catch (rowError: any) {
                tableErrors.push(`${name}: ${rowError?.message || error?.message || "row restore failed"}`);
              }
            }
          }
        }

        results[name] = { inserted, errors: tableErrors };
      }

      // Log restore to history
      const totalRestored = Object.values(results).reduce((sum, r) => sum + r.inserted, 0);
      const tablesRestored = Object.keys(results).length;

      await db.insert(schema.backupHistory).values({
        id: uuidv4(),
        name: `Restore from ${((input.backup as any)?.metadata?.label ?? (input.backup as any)?.name ?? "backup")}`,
        backupType: "restore",
        scope: "full",
        status: "completed",
        tablesList: JSON.stringify(Object.keys(results)),
        recordCount: totalRestored,
        sizeBytes: 0, // Not applicable for restores
        createdBy: ctx.user.id,
        completedAt: new Date().toISOString(),
      });

      // Log activity
      await logActivity({
        userId: ctx.user.id,
        action: "backup_restored",
        entityType: "system",
        entityId: "backup",
        description: `System backup restored: ${totalRestored} records to ${tablesRestored} tables`,
      });

      return { dryRun: false, results, restoredAt: new Date().toISOString() };
    }),

  /** List backup history */
  listBackups: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db.select().from(schema.backupHistory).orderBy(desc(schema.backupHistory.completedAt));
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      backupType: row.backupType,
      scope: row.scope,
      status: row.status,
      recordCount: row.recordCount,
      sizeBytes: row.sizeBytes,
      createdAt: row.createdAt,
      completedAt: row.completedAt,
      createdBy: row.createdBy,
      tables: parseBackupTables(row.tablesList),
    }));
  }),

  /** Delete a backup from history */
  deleteBackup: adminProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db.delete(schema.backupHistory).where(eq(schema.backupHistory.id, input));

      // Log activity
      await logActivity({
        userId: ctx.user.id,
        action: "backup_deleted",
        entityType: "backupHistory",
        entityId: input,
        description: `Backup history entry deleted: ${input}`,
      });

      return { success: true };
    }),

  /** List backup schedules */
  listBackupSchedules: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db.select().from(schema.backupSchedules).orderBy(desc(schema.backupSchedules.createdAt));
    return rows;
  }),

  /** Create a backup schedule */
  createBackupSchedule: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      backupType: z.enum(["FULL", "INCREMENTAL"]).default("FULL"),
      schedule: z.string().min(1), // cron expression or simple schedule
      retentionDays: z.number().min(1).default(30),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      if (!isValidBackupSchedule(input.schedule)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Enter a valid cron schedule." });
      }

      const id = uuidv4();
      await db.insert(schema.backupSchedules).values({
        id,
        name: input.name,
        backupType: input.backupType,
        schedule: input.schedule,
        retentionDays: input.retentionDays,
        status: "SCHEDULED",
        createdBy: ctx.user.id,
      });
      registerBackupSchedule({ id, name: input.name, schedule: input.schedule, backupType: input.backupType, createdBy: ctx.user.id });

      // Log activity
      await logActivity({
        userId: ctx.user.id,
        action: "backup_schedule_created",
        entityType: "backupSchedule",
        entityId: id,
        description: `Backup schedule created: ${input.name}`,
      });

      return { id };
    }),

  /** Update a backup schedule */
  updateBackupSchedule: adminProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      backupType: z.enum(["FULL", "INCREMENTAL"]).optional(),
      schedule: z.string().optional(),
      retentionDays: z.number().min(1).optional(),
      status: z.enum(["SCHEDULED", "PAUSED", "DISABLED"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [existing] = await db.select().from(schema.backupSchedules)
        .where(eq(schema.backupSchedules.id, input.id)).limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Backup schedule not found" });

      const updateData: any = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.backupType !== undefined) updateData.backupType = input.backupType;
      if (input.schedule !== undefined) updateData.schedule = input.schedule;
      if (input.retentionDays !== undefined) updateData.retentionDays = input.retentionDays;
      if (input.status !== undefined) updateData.status = input.status;

      const updatedSchedule = { ...existing, ...updateData };
      if (!isValidBackupSchedule(String(updatedSchedule.schedule || ""))) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Enter a valid cron schedule." });
      }

      if (Object.keys(updateData).length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No fields to update" });
      }

      await db.update(schema.backupSchedules).set(updateData).where(eq(schema.backupSchedules.id, input.id));
      if (String(updatedSchedule.status).toLowerCase() === "scheduled") {
        registerBackupSchedule({
          id: updatedSchedule.id,
          name: updatedSchedule.name || "Scheduled Backup",
          schedule: updatedSchedule.schedule || undefined,
          backupType: updatedSchedule.backupType,
          createdBy: updatedSchedule.createdBy,
        });
      } else {
        unregisterBackupSchedule(input.id);
      }

      // Log activity
      await logActivity({
        userId: ctx.user.id,
        action: "backup_schedule_updated",
        entityType: "backupSchedule",
        entityId: input.id,
        description: `Backup schedule updated: ${input.id}`,
      });

      return { success: true };
    }),

  /** Delete a backup schedule */
  deleteBackupSchedule: adminProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db.delete(schema.backupSchedules).where(eq(schema.backupSchedules.id, input));
      unregisterBackupSchedule(input);

      // Log activity
      await logActivity({
        userId: ctx.user.id,
        action: "backup_schedule_deleted",
        entityType: "backupSchedule",
        entityId: input,
        description: `Backup schedule deleted: ${input}`,
      });

      return { success: true };
    }),
});
