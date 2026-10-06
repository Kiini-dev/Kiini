import { router, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getPool, logActivity } from "../db";
import { v4 as uuidv4 } from "uuid";
import { TRPCError } from "@trpc/server";

function pool() {
  const p = getPool();
  if (!p) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
  return p;
}

const readProcedure = createFeatureRestrictedProcedure("hr:view");
const writeProcedure = createFeatureRestrictedProcedure("hr:edit");

export const performanceReviewsRouter = router({
  list: readProcedure
    .input(z.object({
      employeeId: z.string().optional(),
      reviewerId: z.string().optional(),
      status: z.string().optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      try {
        const conditions: string[] = [];
        const params: any[] = [];
        if (input?.employeeId) { conditions.push("pr.employeeId = ?"); params.push(input.employeeId); }
        if (input?.reviewerId) { conditions.push("pr.reviewerId = ?"); params.push(input.reviewerId); }
        if (input?.status) { conditions.push("pr.status = ?"); params.push(input.status); }
        if (ctx.user.organizationId) { conditions.push("e.organizationId = ?"); params.push(ctx.user.organizationId); }
        const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
        const limit = input?.limit || 100;
        const offset = input?.offset || 0;
        const [rows] = await pool().query(
          `SELECT pr.*, 
            CONCAT(e.firstName, ' ', e.lastName) as employeeName,
            CONCAT(r.firstName, ' ', r.lastName) as reviewerName
           FROM performanceReviews pr
           LEFT JOIN employees e ON pr.employeeId = e.id
           LEFT JOIN employees r ON pr.reviewerId = r.id
           ${where} ORDER BY pr.createdAt DESC LIMIT ? OFFSET ?`,
          [...params, limit, offset]
        );
        return rows as any[];
      } catch (err) {
        console.error('Error listing performance reviews', err);
        return [];
      }
    }),

  getById: readProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const [rows] = await pool().query(
        `SELECT pr.*, 
          CONCAT(e.firstName, ' ', e.lastName) as employeeName,
          CONCAT(r.firstName, ' ', r.lastName) as reviewerName
         FROM performanceReviews pr
         LEFT JOIN employees e ON pr.employeeId = e.id
         LEFT JOIN employees r ON pr.reviewerId = r.id
         WHERE pr.id = ? ${ctx.user.organizationId ? "AND e.organizationId = ?" : ""} LIMIT 1`, ctx.user.organizationId ? [input, ctx.user.organizationId] : [input]
      );
      return (rows as any[])[0] || null;
    }),

  create: writeProcedure
    .input(z.object({
      employeeId: z.string(),
      reviewerId: z.string(),
      overallRating: z.number().min(1).max(5).optional(),
      comments: z.string().optional(),
      goals: z.string().optional(),
      status: z.enum(["draft", "in_progress", "completed", "archived"]).optional(),
      reviewDate: z.coerce.date().optional(),
      period: z.string().optional(),
      strengths: z.string().optional(),
      improvements: z.string().optional(),
      kpiScore: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const p = pool();
      const [employees] = await p.query(
        `SELECT id FROM employees WHERE id IN (?, ?) ${ctx.user.organizationId ? "AND organizationId = ?" : ""}`,
        ctx.user.organizationId ? [input.employeeId, input.reviewerId, ctx.user.organizationId] : [input.employeeId, input.reviewerId]
      );
      if ((employees as any[]).length !== 2) throw new TRPCError({ code: "BAD_REQUEST", message: "Employee and reviewer must belong to your organization" });
      const id = uuidv4();
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      await pool().query(
        `INSERT INTO performanceReviews (id, employeeId, reviewerId, overallRating, comments, goals, status, period, reviewDate, strengths, improvements, kpiScore, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, input.employeeId, input.reviewerId, input.overallRating ?? 0, input.comments || null, input.goals || null, input.status || 'draft', input.period || new Date().getFullYear().toString(), input.reviewDate ? input.reviewDate.toISOString().replace('T', ' ').substring(0, 19) : now, input.strengths || null, input.improvements || null, input.kpiScore ?? null, now, now]
      );
      await logActivity({ userId: ctx.user.id, action: 'performance_review_created', entityType: 'performanceReview', entityId: id, description: `Created performance review for ${input.employeeId}` });
      return { id };
    }),

  update: writeProcedure
    .input(z.object({
      id: z.string(),
      overallRating: z.number().min(1).max(5).optional(),
      comments: z.string().optional(),
      goals: z.string().optional(),
      status: z.enum(["draft", "in_progress", "completed", "archived"]).optional(),
      reviewDate: z.coerce.date().optional(),
      strengths: z.string().optional(),
      improvements: z.string().optional(),
      kpiScore: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const p = pool();
      const [rows] = await p.query(
        `SELECT pr.id FROM performanceReviews pr JOIN employees e ON e.id = pr.employeeId WHERE pr.id = ? ${ctx.user.organizationId ? "AND e.organizationId = ?" : ""}`,
        ctx.user.organizationId ? [input.id, ctx.user.organizationId] : [input.id]
      );
      if (!(rows as any[]).length) throw new TRPCError({ code: "NOT_FOUND", message: "Performance review not found" });
      const [currentRows] = await p.query(`SELECT status FROM performanceReviews WHERE id = ?`, [input.id]);
      const currentStatus = (currentRows as any[])[0]?.status;
      if (currentStatus === "archived" && input.status !== "archived") throw new TRPCError({ code: "BAD_REQUEST", message: "Archived reviews cannot be reopened" });
      const sets: string[] = ["updatedAt = ?"];
      const params: any[] = [new Date().toISOString().replace('T', ' ').substring(0, 19)];
      if (input.overallRating !== undefined) { sets.push("overallRating = ?"); params.push(input.overallRating); }
      if (input.comments !== undefined) { sets.push("comments = ?"); params.push(input.comments); }
      if (input.goals !== undefined) { sets.push("goals = ?"); params.push(input.goals); }
      if (input.status !== undefined) { sets.push("status = ?"); params.push(input.status); }
      if (input.reviewDate !== undefined) { sets.push("reviewDate = ?"); params.push(input.reviewDate.toISOString().replace('T', ' ').substring(0, 19)); }
      if (input.strengths !== undefined) { sets.push("strengths = ?"); params.push(input.strengths); }
      if (input.improvements !== undefined) { sets.push("improvements = ?"); params.push(input.improvements); }
      if (input.kpiScore !== undefined) { sets.push("kpiScore = ?"); params.push(input.kpiScore); }
      params.push(input.id);
      await pool().query(`UPDATE performanceReviews SET ${sets.join(", ")} WHERE id = ?`, params);
      await logActivity({ userId: ctx.user.id, action: 'performance_review_updated', entityType: 'performanceReview', entityId: input.id, description: `Updated performance review ${input.id}` });
      return { success: true };
    }),

  delete: writeProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const orgClause = ctx.user.organizationId ? " AND e.organizationId = ?" : "";
      const params = ctx.user.organizationId ? [input, ctx.user.organizationId] : [input];
      const [existing] = await pool().query(`SELECT pr.id FROM performanceReviews pr JOIN employees e ON e.id = pr.employeeId WHERE pr.id = ?${orgClause}`, params);
      if (!(existing as any[]).length) throw new TRPCError({ code: "NOT_FOUND", message: "Performance review not found" });
      await pool().query(`DELETE pr FROM performanceReviews pr JOIN employees e ON e.id = pr.employeeId WHERE pr.id = ?${orgClause}`, params);
      await logActivity({ userId: ctx.user.id, action: 'performance_review_deleted', entityType: 'performanceReview', entityId: input, description: `Deleted performance review ${input}` });
      return { success: true };
    }),

  stats: readProcedure
    .query(async ({ ctx }) => {
      try {
        const [rows] = await pool().query(`
          SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
            SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as inProgress,
            SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
            AVG(overallRating) as avgRating
          FROM performanceReviews pr JOIN employees e ON e.id = pr.employeeId
          ${ctx.user.organizationId ? "WHERE e.organizationId = ?" : ""}
        `, ctx.user.organizationId ? [ctx.user.organizationId] : []);
        const r = (rows as any[])[0];
        return { total: Number(r.total || 0), completed: Number(r.completed || 0), inProgress: Number(r.inProgress || 0), draft: Number(r.draft || 0), avgRating: Number(r.avgRating || 0) };
      } catch { return { total: 0, completed: 0, inProgress: 0, draft: 0, avgRating: 0 }; }
    }),
});
