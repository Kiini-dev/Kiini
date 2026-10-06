import { router, protectedProcedure, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb, getPool } from "../db";
import { jobGroups } from "../../drizzle/schema";
import { eq, and, or, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

async function getLiveJobGroupColumns(db: any): Promise<Set<string>> {
  const [rows] = await db.execute("SHOW COLUMNS FROM `jobGroups`");
  return new Set((Array.isArray(rows) ? rows : []).map((row: any) => String(row.Field || row.field || "")));
}

function filterLiveColumns(values: Record<string, unknown>, liveColumns: Set<string>) {
  return Object.fromEntries(Object.entries(values).filter(([key]) => liveColumns.has(key)));
}

export function normalizeJobGroupSalaryFields<T extends Record<string, any>>(payload: T) {
  const minimumGrossSalary =
    payload.minimumGrossSalary ?? payload.minSalary ?? payload.minimumSalary ?? undefined;
  const maximumGrossSalary =
    payload.maximumGrossSalary ?? payload.maxSalary ?? payload.maximumSalary ?? undefined;

  return {
    ...payload,
    ...(minimumGrossSalary !== undefined ? { minimumGrossSalary } : {}),
    ...(maximumGrossSalary !== undefined ? { maximumGrossSalary } : {}),
    ...(payload.minSalary !== undefined ? { minSalary: undefined } : {}),
    ...(payload.maxSalary !== undefined ? { maxSalary: undefined } : {}),
  } as T & {
    minimumGrossSalary?: number;
    maximumGrossSalary?: number;
  };
}

export const jobGroupsRouter = router({
  list: createFeatureRestrictedProcedure("jobGroups:read")
    .input(z.object({ 
      limit: z.number().optional(), 
      offset: z.number().optional(),
      isActive: z.boolean().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const pool = getPool();
        if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database pool unavailable" });
        const conditions: string[] = [];
        const params: unknown[] = [];
        if (ctx.user.organizationId) {
          conditions.push("(`organizationId` = ? OR `organizationId` IS NULL)");
          params.push(ctx.user.organizationId);
        }
        if (input?.isActive !== undefined) {
          conditions.push("`isActive` = ?");
          params.push(input.isActive ? 1 : 0);
        }
        const where = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";
        const limit = Math.max(1, Math.min(input?.limit || 50, 100));
        const offset = Math.max(0, input?.offset || 0);
        const [rows] = await pool.query(
          `SELECT * FROM \`jobGroups\`${where} ORDER BY \`name\` LIMIT ? OFFSET ?`,
          [...params, limit, offset]
        );
        return rows;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[JobGroups] Failed to fetch job groups:", error);
        return [];
      }
    }),

  getById: createFeatureRestrictedProcedure("jobGroups:read")
    .input(z.string())
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const pool = getPool();
        if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database pool unavailable" });
        const [rows] = await pool.query("SELECT * FROM `jobGroups` WHERE `id` = ? LIMIT 1", [input]);
        return (rows as any[])[0] || null;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch job group" });
      }
    }),

  create: createFeatureRestrictedProcedure("jobGroups:create")
    .input(
      z.object({
        name: z.string().min(1),
        minimumGrossSalary: z.number().positive().optional(),
        maximumGrossSalary: z.number().positive().optional(),
        minSalary: z.number().positive().optional(),
        maxSalary: z.number().positive().optional(),
        defaultBasicSalary: z.number().nonnegative().optional(),
        defaultAnnualLeaveDays: z.number().int().nonnegative().optional(),
        defaultAllowances: z.array(z.object({ type: z.string().min(1), amount: z.number().nonnegative().optional(), percentage: z.number().min(0).max(100).optional(), frequency: z.enum(["monthly", "quarterly", "annual", "one_time"]).optional() }).refine((item) => item.amount !== undefined || item.percentage !== undefined, "Amount or percentage is required")).optional(),
        defaultDeductions: z.array(z.object({ type: z.string().min(1), amount: z.number().nonnegative().optional(), percentage: z.number().min(0).max(100).optional(), frequency: z.enum(["monthly", "quarterly", "annual", "one_time"]).optional() }).refine((item) => item.amount !== undefined || item.percentage !== undefined, "Amount or percentage is required")).optional(),
        defaultBenefits: z.array(z.object({ type: z.string().min(1), amount: z.number().nonnegative().optional(), percentage: z.number().min(0).max(100).optional() }).refine((item) => item.amount !== undefined || item.percentage !== undefined, "Amount or percentage is required")).optional(),
        description: z.string().optional(),
        managerId: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        const normalized = normalizeJobGroupSalaryFields(input);
        const minimumGrossSalary = normalized.minimumGrossSalary ?? normalized.minSalary;
        const maximumGrossSalary = normalized.maximumGrossSalary ?? normalized.maxSalary;

        if (!minimumGrossSalary || !maximumGrossSalary) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Minimum and maximum salary are required" });
        }

        if (minimumGrossSalary > maximumGrossSalary) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Minimum salary cannot be greater than maximum salary" });
        }

        const id = uuidv4();
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
        
        const jobGroupValues = {
          id,
          organizationId: ctx.user.organizationId ?? null,
          name: normalized.name,
          managerId: normalized.managerId || null,
          minimumGrossSalary,
          maximumGrossSalary,
          defaultBasicSalary: normalized.defaultBasicSalary ?? null,
          defaultAnnualLeaveDays: normalized.defaultAnnualLeaveDays ?? 21,
          defaultAllowances: normalized.defaultAllowances ? JSON.stringify(normalized.defaultAllowances) : null,
          defaultDeductions: normalized.defaultDeductions ? JSON.stringify(normalized.defaultDeductions) : null,
          defaultBenefits: normalized.defaultBenefits ? JSON.stringify(normalized.defaultBenefits) : null,
          description: normalized.description || null,
          isActive: 1,
          createdAt: now,
          updatedAt: now,
        };
        const liveColumns = await getLiveJobGroupColumns(db);
        const insertValues = filterLiveColumns(jobGroupValues, liveColumns);
        const insertColumns = Object.keys(insertValues);
        const insertParams = insertColumns.map((column) => insertValues[column]);
        const pool = getPool();
        if (!pool) throw new Error("Database pool unavailable");
        await pool.query(
          `INSERT INTO \`jobGroups\` (${insertColumns.map((column) => `\`${column}\``).join(", ")}) VALUES (${insertColumns.map(() => "?").join(", ")})`,
          insertParams
        );
        
        return { id };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Failed to create job group: ${error instanceof Error ? error.message : String(error)}` });
      }
    }),

  update: createFeatureRestrictedProcedure("jobGroups:edit")
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        minimumGrossSalary: z.number().positive().optional(),
        maximumGrossSalary: z.number().positive().optional(),
        minSalary: z.number().positive().optional(),
        maxSalary: z.number().positive().optional(),
        defaultBasicSalary: z.number().nonnegative().optional(),
        defaultAnnualLeaveDays: z.number().int().nonnegative().optional(),
        defaultAllowances: z.array(z.object({ type: z.string().min(1), amount: z.number().nonnegative().optional(), percentage: z.number().min(0).max(100).optional(), frequency: z.enum(["monthly", "quarterly", "annual", "one_time"]).optional() }).refine((item) => item.amount !== undefined || item.percentage !== undefined, "Amount or percentage is required")).optional(),
        defaultDeductions: z.array(z.object({ type: z.string().min(1), amount: z.number().nonnegative().optional(), percentage: z.number().min(0).max(100).optional(), frequency: z.enum(["monthly", "quarterly", "annual", "one_time"]).optional() }).refine((item) => item.amount !== undefined || item.percentage !== undefined, "Amount or percentage is required")).optional(),
        defaultBenefits: z.array(z.object({ type: z.string().min(1), amount: z.number().nonnegative().optional(), percentage: z.number().min(0).max(100).optional() }).refine((item) => item.amount !== undefined || item.percentage !== undefined, "Amount or percentage is required")).optional(),
        description: z.string().optional(),
        managerId: z.string().nullable().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        const normalized = normalizeJobGroupSalaryFields(input);
        const { id, ...data } = normalized;
        const minSalary = data.minimumGrossSalary ?? data.minSalary;
        const maxSalary = data.maximumGrossSalary ?? data.maxSalary;
        
        // Validate salary ranges if both are provided
        if (minSalary !== undefined && maxSalary !== undefined && minSalary > maxSalary) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Minimum salary cannot be greater than maximum salary" });
        }

        const updateData: any = {
          ...data,
          minimumGrossSalary: minSalary,
          maximumGrossSalary: maxSalary,
          defaultBasicSalary: data.defaultBasicSalary,
          defaultAnnualLeaveDays: data.defaultAnnualLeaveDays,
          defaultAllowances: data.defaultAllowances ? JSON.stringify(data.defaultAllowances) : undefined,
          defaultDeductions: data.defaultDeductions ? JSON.stringify(data.defaultDeductions) : undefined,
          defaultBenefits: data.defaultBenefits ? JSON.stringify(data.defaultBenefits) : undefined,
          minSalary: undefined,
          maxSalary: undefined,
          isActive: data.isActive !== undefined ? (data.isActive ? 1 : 0) : undefined,
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };
        if (data.managerId !== undefined) updateData.managerId = data.managerId;

        const liveColumns = await getLiveJobGroupColumns(db);
        await db.update(jobGroups)
          .set(filterLiveColumns(updateData, liveColumns) as any)
          .where(eq(jobGroups.id, id));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update job group" });
      }
    }),

  delete: createFeatureRestrictedProcedure("jobGroups:delete")
    .input(z.string())
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        // Check if any employees belong to this job group
        const { employees } = await import("../../drizzle/schema");
        const employeeCount = await db.select({ count: employees.id })
          .from(employees)
          .where(eq(employees.jobGroupId, input));
        
        if (employeeCount && employeeCount.length > 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot delete job group that has employees assigned to it" });
        }

        await db.delete(jobGroups).where(eq(jobGroups.id, input));
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete job group" });
      }
    }),
});
