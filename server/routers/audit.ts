/**
 * Backend Implementation: Permission Audit Logging
 * Add this to server/routers/audit.ts
 */

import { z } from "zod";
import { router, protectedProcedure, orgScopedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { permissionAuditLogs } from "../../drizzle/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { getCompanyInfo } from "../utils/company-info";

export const auditRouter = router({
  /**
   * Log a permission action (called from frontend)
   */
  logPermissionAction: protectedProcedure
    .input(
      z.object({
        feature: z.string(),
        action: z.enum(["CHECK", "GRANT", "DENY", "CREATE", "UPDATE", "DELETE", "DELEGATE"]),
        allowed: z.boolean(),
        reason: z.string().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.id) throw new Error("Unauthorized");

      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Insert audit log entry
      const logId = `audit_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      await db.insert(permissionAuditLogs).values({
        id: logId,
        userId: ctx.user.id,
        orgId: ctx.user.orgId || "default",
        feature: input.feature,
        action: input.action,
        allowed: input.allowed,
        reason: input.reason || null,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        timestamp: new Date().toISOString(),
        ipAddress: ctx.req?.ip || ctx.req?.headers["x-forwarded-for"] || "unknown",
        userAgent: ctx.req?.headers["user-agent"] || null,
      });

      return { success: true, logId };
    }),

  /**
   * Get permission audit logs (admin only)
   */
  getPermissionLogs: orgScopedProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        feature: z.string().optional(),
        action: z.enum(["CHECK", "GRANT", "DENY", "CREATE", "UPDATE", "DELETE", "DELEGATE"]).optional(),
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
        limit: z.number().default(100),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      // Only admins can view logs
      if (!["admin", "super_admin"].includes(ctx.user?.role || "")) {
        throw new Error("Forbidden: Only admins can view audit logs");
      }

      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Build query filters
      const filters = [eq(permissionAuditLogs.orgId, ctx.user?.orgId || "default")];

      if (input.userId) {
        filters.push(eq(permissionAuditLogs.userId, input.userId));
      }
      if (input.feature) {
        filters.push(eq(permissionAuditLogs.feature, input.feature));
      }
      if (input.action) {
        filters.push(eq(permissionAuditLogs.action, input.action));
      }
      if (input.startDate) {
        filters.push(gte(permissionAuditLogs.timestamp, input.startDate.toISOString()));
      }
      if (input.endDate) {
        filters.push(lte(permissionAuditLogs.timestamp, input.endDate.toISOString()));
      }

      const logs = await db
        .select()
        .from(permissionAuditLogs)
        .where(and(...filters))
        .orderBy(desc(permissionAuditLogs.timestamp))
        .limit(input.limit)
        .offset(input.offset);

      return logs;
    }),

  /**
   * Export audit logs for compliance (CSV format)
   */
  exportPermissionLogs: orgScopedProcedure
    .input(
      z.object({
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
        format: z.enum(["csv", "json"]).default("csv"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Only admins can export logs
      if (!["admin", "super_admin"].includes(ctx.user?.role || "")) {
        throw new Error("Forbidden: Only admins can export audit logs");
      }

      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const filters = [eq(permissionAuditLogs.orgId, ctx.user?.orgId || "default")];

      if (input.startDate) {
        filters.push(gte(permissionAuditLogs.timestamp, input.startDate.toISOString()));
      }
      if (input.endDate) {
        filters.push(lte(permissionAuditLogs.timestamp, input.endDate.toISOString()));
      }

      const logs = await db
        .select()
        .from(permissionAuditLogs)
        .where(and(...filters))
        .orderBy(desc(permissionAuditLogs.timestamp));

      if (input.format === "csv") {
        const companyInfo = await getCompanyInfo();
        const csv = convertLogsToCSV(logs, companyInfo);
        return new Blob([csv], { type: "text/csv" });
      } else {
        return new Blob([JSON.stringify(logs, null, 2)], { type: "application/json" });
      }
    }),

  /**
   * Get audit log statistics
   */
  getAuditStatistics: orgScopedProcedure
    .input(
      z.object({
        period: z.enum(["day", "week", "month"]).default("week"),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!["admin", "super_admin"].includes(ctx.user?.role || "")) {
        throw new Error("Forbidden");
      }

      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Calculate period start date
      const now = new Date();
      const periodStart = new Date();
      if (input.period === "day") {
        periodStart.setDate(now.getDate() - 1);
      } else if (input.period === "week") {
        periodStart.setDate(now.getDate() - 7);
      } else {
        periodStart.setMonth(now.getMonth() - 1);
      }

      // Get logs for period
      const logs = await db
        .select()
        .from(permissionAuditLogs)
        .where(
          and(
            eq(permissionAuditLogs.orgId, ctx.user?.orgId || "default"),
            gte(permissionAuditLogs.timestamp, periodStart.toISOString())
          )
        );

      // Calculate statistics
      const stats = {
        totalChecks: logs.filter((l) => l.action === "CHECK").length,
        totalGrants: logs.filter((l) => l.action === "GRANT").length,
        totalDenials: logs.filter((l) => l.action === "DENY").length,
        denialRate: logs.length > 0 ? (logs.filter((l) => !l.allowed).length / logs.length) * 100 : 0,
        topDeniedFeatures: getTopFeatures(logs.filter((l) => !l.allowed), 5),
        topUsers: getTopUsers(logs, 5),
      };

      return stats;
    }),
});

/**
 * Convert logs to CSV format
 */
function convertLogsToCSV(logs: any[], companyInfo: { name: string; phone: string; email: string; website: string; address: string; tagline: string }): string {
  const headers = ["ID", "User ID", "Org ID", "Feature", "Action", "Allowed", "Reason", "Timestamp", "IP Address"];
  const rows = logs.map((log) => [
    log.id,
    log.userId,
    log.orgId,
    log.feature,
    log.action,
    log.allowed ? "Yes" : "No",
    log.reason || "",
    log.timestamp,
    log.ipAddress || "",
  ]);

  const companyLines = [
    ["Company", companyInfo.name],
    ["Phone", companyInfo.phone],
    ["Email", companyInfo.email],
    ["Website", companyInfo.website],
    ["Address", companyInfo.address],
    ["Tagline", companyInfo.tagline],
    ["Report", "Permission Audit Logs"],
    [],
  ].map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","));
  const headerLine = headers.join(",");
  const dataLines = rows.map((row) => row.map((cell) => `"${cell}"`).join(","));

  return [...companyLines, headerLine, ...dataLines].join("\n");
}

/**
 * Get top denied features
 */
function getTopFeatures(logs: any[], limit: number): Array<{ feature: string; count: number }> {
  const features = logs.reduce<Record<string, number>>((acc, log) => {
    const key = String(log.feature ?? "unknown");
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(features)
    .map(([feature, count]) => ({ feature, count: Number(count) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Get top users by audit activity
 */
function getTopUsers(logs: any[], limit: number): Array<{ userId: string; count: number }> {
  const usersById = logs.reduce<Record<string, number>>((acc, log) => {
    const key = String(log.userId ?? "unknown");
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(usersById)
    .map(([userId, count]) => ({ userId, count: Number(count) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
