import { router } from "../_core/trpc";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { z } from "zod";
import { getDb } from "../db";
import { activityLog, users } from "../../drizzle/schema";
import { eq, desc, and, gte, sql } from "drizzle-orm";

function buildAuditLogsFromClause(ctx: any) {
  return ctx.user.organizationId
    ? sql`FROM activityLog LEFT JOIN users ON activityLog.userId = users.id`
    : sql`FROM activityLog`;
}

function addAuditLogsOrgFilter(ctx: any, whereConditions: any[]) {
  if (ctx.user.organizationId) {
    whereConditions.push(sql`users.organizationId = ${ctx.user.organizationId}`);
  }
}

export const auditLogsRouter = router({
  list: createFeatureRestrictedProcedure("admin:audit-logs:view")
    .input(z.object({
      limit: z.number().optional().default(50),
      offset: z.number().optional().default(0),
      severity: z.enum(["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"]).optional().default("ALL"),
      dateRange: z.enum(["24h", "7d", "30d", "90d"]).optional().default("7d"),
      actionFilter: z.string().optional(),
    }).optional())
    .query(async ({ input = {}, ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          console.error("[AuditLogs] Database connection not available");
          return {
            logs: [],
            total: 0,
            stats: {
              totalEvents: 0,
              criticalEvents: 0,
              failedAttempts: 0,
              successfulActions: 0,
            },
          };
        }

        // Calculate date range
        let dateFilter: Date | null = null;
        const now = new Date();
        switch (input.dateRange) {
          case "24h":
            dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case "7d":
            dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "30d":
            dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case "90d":
            dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
        }

        // Build where clause
        let whereConditions: any[] = [];
        if (dateFilter) {
          whereConditions.push(gte(activityLog.createdAt, dateFilter.toISOString()));
        }
        if (input.actionFilter) {
          whereConditions.push(
            eq(activityLog.action, input.actionFilter)
          );
        }

        const filterConditions = [...whereConditions];
        addAuditLogsOrgFilter(ctx, filterConditions);
        const finalWhere = filterConditions.length > 0 ? and(...filterConditions) : undefined;

        const logs = await db
          .select({
            id: activityLog.id,
            timestamp: activityLog.createdAt,
            userId: activityLog.userId,
            userName: users.name,
            userEmail: users.email,
            action: activityLog.action,
            resourceType: activityLog.entityType,
            resourceId: activityLog.entityId,
            ipAddress: activityLog.ipAddress,
            changes: activityLog.description,
          })
          .from(activityLog)
          .leftJoin(users, eq(activityLog.userId, users.id))
          .where(finalWhere)
          .orderBy(desc(activityLog.createdAt))
          .limit(input.limit!)
          .offset(input.offset!);

        // Get total count
        const countResult = await db
          .select({ count: sql<number>`count(*)`.as('count') })
          .from(activityLog)
          .leftJoin(users, eq(activityLog.userId, users.id))
          .where(finalWhere);
        const total = Number(countResult[0]?.count ?? 0);

        // Determine severity based on action
        const enrichedLogs = logs.map((log: any) => {
          let severity = "LOW";
          if (
            log.action.includes("Delete") ||
            log.action.includes("Permission") ||
            log.action.includes("Role") ||
            log.action.includes("Admin")
          ) {
            severity = "CRITICAL";
          } else if (
            log.action.includes("Update") ||
            log.action.includes("Modify") ||
            log.action.includes("Edit")
          ) {
            severity = "HIGH";
          } else if (log.action.includes("Failed")) {
            severity = "MEDIUM";
          }

          return {
            ...log,
            user: log.userName || log.userEmail || log.userId,
            userName: log.userName || null,
            userEmail: log.userEmail || null,
            severity,
            status: log.action.includes("Failed") ? "FAILED" : "SUCCESS",
          };
        });

        // Calculate stats
        const stats = {
          totalEvents: total,
          criticalEvents: enrichedLogs.filter((l: any) => l.severity === "CRITICAL").length,
          failedAttempts: enrichedLogs.filter((l: any) => l.status === "FAILED").length,
          successfulActions: enrichedLogs.filter((l: any) => l.status === "SUCCESS").length,
        };

        return {
          logs: enrichedLogs,
          total,
          stats,
        };
      } catch (err) {
        console.error("[AuditLogs] Error fetching logs:", err);
        return {
          logs: [],
          total: 0,
          stats: {
            totalEvents: 0,
            criticalEvents: 0,
            failedAttempts: 0,
            successfulActions: 0,
          },
        };
      }
    }),

  getStats: createFeatureRestrictedProcedure("admin:audit-logs:view")
    .input(z.object({
      dateRange: z.enum(["24h", "7d", "30d", "90d"]).optional().default("7d"),
    }).optional())
    .query(async ({ input = {}, ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          return {
            totalEvents: 0,
            criticalEvents: 0,
            failedAttempts: 0,
            successfulActions: 0,
          };
        }

        // Calculate date range
        let dateFilter: Date | null = null;
        const now = new Date();
        switch (input.dateRange) {
          case "24h":
            dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case "7d":
            dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "30d":
            dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case "90d":
            dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
        }

        const filterConditions = [] as any[];
        if (dateFilter) {
          filterConditions.push(gte(activityLog.createdAt, dateFilter.toISOString()));
        }
        addAuditLogsOrgFilter(ctx, filterConditions);
        const finalWhere = filterConditions.length > 0 ? and(...filterConditions) : undefined;

        const logs = await db
          .select()
          .from(activityLog)
          .leftJoin(users, eq(activityLog.userId, users.id))
          .where(finalWhere);

        const criticalCount = logs.filter(
          (l: any) =>
            l.action.includes("Delete") ||
            l.action.includes("delete") ||
            l.action.includes("Permission") ||
            l.action.includes("Role")
        ).length;

        const failedCount = logs.filter((l: any) => l.action.includes("Failed") || l.action.includes("failed")).length;

        return {
          totalEvents: logs.length,
          criticalEvents: criticalCount,
          failedAttempts: failedCount,
          successfulActions: logs.length - failedCount,
        };
      } catch (err) {
        console.error("[AuditLogs] Error fetching stats:", err);
        return {
          totalEvents: 0,
          criticalEvents: 0,
          failedAttempts: 0,
          successfulActions: 0,
        };
      }
    }),

  export: createFeatureRestrictedProcedure("admin:audit-logs:export")
    .input(z.object({
      dateRange: z.enum(["24h", "7d", "30d", "90d"]).optional().default("7d"),
    }).optional())
    .query(async ({ input = {}, ctx }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        let dateFilter: Date | null = null;
        const now = new Date();
        switch (input?.dateRange) {
          case "24h":
            dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case "7d":
            dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "30d":
            dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case "90d":
            dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
        }

        const filterConditions = [] as any[];
        if (dateFilter) {
          filterConditions.push(gte(activityLog.createdAt, dateFilter.toISOString()));
        }
        addAuditLogsOrgFilter(ctx, filterConditions);
        const finalWhere = filterConditions.length > 0 ? and(...filterConditions) : undefined;

        const logs = await db
          .select()
          .from(activityLog)
          .leftJoin(users, eq(activityLog.userId, users.id))
          .where(finalWhere)
          .orderBy(desc(activityLog.createdAt));

        return logs.map((log: any) => ({
          timestamp: log.createdAt,
          user: log.userId,
          action: log.action,
          resourceType: log.entityType,
          resourceId: log.entityId,
          ipAddress: log.ipAddress,
          status: log.action.includes("Failed") || log.action.includes("failed") ? "FAILED" : "SUCCESS",
        }));
      } catch (err) {
        console.error("[AuditLogs] Error exporting logs:", err);
        return [];
      }
    }),
});
