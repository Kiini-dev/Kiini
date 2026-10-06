/**
 * Departmental Heads Router
 * Manage department head assignments and auto-update department records
 */
import { router, protectedProcedure } from "../_core/trpc";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { z } from "zod";
import { getPool } from "../db";
import { v4 as uuidv4 } from "uuid";
import { TRPCError } from "@trpc/server";
import { ensureManagerHasEmployeeRecord } from "../utils/manager-employee-mapper";
import { createNotification } from "../_core/notification";
import { promoteDepartmentHead } from "../utils/department-head-promotion";

function pool() {
  const p = getPool();
  if (!p) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
  return p;
}

const hrManage = createFeatureRestrictedProcedure("hr:manage");

export const departmentalHeadsRouter = router({
  // ── HR: List department heads ──────────────────────────────────────────
  list: hrManage
    .input(
      z.object({
        departmentId: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const p = pool();
      const orgId = ctx.user.organizationId;

      let query = `
        SELECT dh.*, e.firstName, e.lastName, e.email, e.position, d.name as departmentName
        FROM departmental_heads dh
        LEFT JOIN employees e ON dh.employeeId = e.id
        LEFT JOIN departments d ON dh.departmentId = d.id
        WHERE dh.organizationId = ? AND dh.removedAt IS NULL
      `;
      const params: any[] = [orgId];

      if (input.departmentId) {
        query += ` AND dh.departmentId = ?`;
        params.push(input.departmentId);
      }

      query += ` ORDER BY d.name ASC LIMIT ? OFFSET ?`;
      params.push(input.limit, input.offset);

      const [rows] = await p.query(query, params);
      return (rows || []) as any[];
    }),

  // ── HR: Assign department head ──────────────────────────────────────────
  assign: hrManage
    .input(
      z.object({
        departmentId: z.string(),
        employeeId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const p = pool();
      const orgId = ctx.user.organizationId;

      try {
        // Verify employee exists and belongs to org
        const [empRows] = await p.query(
          `SELECT id, userId, firstName, lastName, email, department FROM employees WHERE id = ? AND organizationId = ? LIMIT 1`,
          [input.employeeId, orgId]
        );

        const emp = (empRows as any[])?.[0];
        if (!emp) throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found" });

        // Verify department exists and belongs to org
        const [deptRows] = await p.query(
          `SELECT id, name FROM departments WHERE id = ? AND organizationId = ? LIMIT 1`,
          [input.departmentId, orgId]
        );

        const dept = (deptRows as any[])?.[0];
        if (!dept) throw new TRPCError({ code: "NOT_FOUND", message: "Department not found" });

        // Check if already assigned
        const [existingRows] = await p.query(
          `SELECT id FROM departmental_heads WHERE departmentId = ? AND employeeId = ? AND removedAt IS NULL LIMIT 1`,
          [input.departmentId, input.employeeId]
        );

        if (existingRows && (existingRows as any[]).length > 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Already assigned as department head" });
        }

        // Ensure manager has employee record
        await ensureManagerHasEmployeeRecord(
          emp.userId,
          orgId,
          emp.email,
          emp.firstName,
          emp.lastName
        );

        // Create departmental head record
        const headId = uuidv4();
        await p.query(
          `INSERT INTO departmental_heads (
            id, organizationId, departmentId, employeeId, userId, assignedBy, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [headId, orgId, input.departmentId, input.employeeId, emp.userId, ctx.user.id]
        );

        // Update department's headId
        await p.query(
          `UPDATE departments SET headId = ? WHERE id = ?`,
          [input.employeeId, input.departmentId]
        );

        await promoteDepartmentHead(emp.userId, dept.name);

        // Send notification
        await createNotification({
          userId: emp.userId,
          title: `Department Head Assignment`,
          message: `You have been assigned as head of ${dept.name}`,
          type: "info",
          organizationId: orgId,
        });

        console.log(
          `[DEPT-HEADS] ${emp.email} assigned as head of ${dept.name} by ${ctx.user.id}`
        );

        return { success: true, message: `${emp.firstName} assigned as department head` };
      } catch (error: any) {
        if (error.code) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to assign department head: ${error?.message}`,
        });
      }
    }),

  // ── HR: Remove department head ──────────────────────────────────────────
  remove: hrManage
    .input(z.object({ headId: z.string(), reason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const p = pool();
      const orgId = ctx.user.organizationId;

      try {
        // Get the departmental head record
        const [rows] = await p.query(
          `SELECT dh.*, e.email, e.firstName, e.lastName FROM departmental_heads dh
           LEFT JOIN employees e ON dh.employeeId = e.id
           WHERE dh.id = ? AND dh.organizationId = ? LIMIT 1`,
          [input.headId, orgId]
        );

        const head = (rows as any[])?.[0];
        if (!head) throw new TRPCError({ code: "NOT_FOUND", message: "Department head assignment not found" });

        // Mark as removed
        await p.query(
          `UPDATE departmental_heads SET removedAt = NOW(), removedBy = ?, removalReason = ?, updatedAt = NOW()
           WHERE id = ?`,
          [ctx.user.id, input.reason || null, input.headId]
        );

        // Clear department's headId
        await p.query(
          `UPDATE departments SET headId = NULL WHERE id = ?`,
          [head.departmentId]
        );

        // Send notification
        await createNotification({
          userId: head.userId,
          title: "Department Head Role Removed",
          message: `You are no longer a department head. ${input.reason ? `Reason: ${input.reason}` : ""}`,
          type: "warning",
          organizationId: orgId,
        });

        console.log(
          `[DEPT-HEADS] ${head.email} removed as department head by ${ctx.user.id}`
        );

        return { success: true, message: `${head.firstName} removed as department head` };
      } catch (error: any) {
        if (error.code) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to remove department head: ${error?.message}`,
        });
      }
    }),

  // ── HR: Get department head for a specific department ──────────────────
  getByDepartment: protectedProcedure
    .input(z.object({ departmentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const p = pool();
      const orgId = ctx.user.organizationId;

      try {
        const [rows] = await p.query(
          `SELECT dh.*, e.firstName, e.lastName, e.email, e.position
           FROM departmental_heads dh
           LEFT JOIN employees e ON dh.employeeId = e.id
           WHERE dh.departmentId = ? AND dh.organizationId = ? AND dh.removedAt IS NULL LIMIT 1`,
          [input.departmentId, orgId]
        );

        return (rows as any[])?.[0] || null;
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch department head: ${error?.message}`,
        });
      }
    }),
});
