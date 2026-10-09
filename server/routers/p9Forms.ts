/**
 * P9 Forms Router
 * Generate, view, and send annual tax forms
 */
import { router, protectedProcedure } from "../_core/trpc";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { z } from "zod";
import { getPool } from "../db";
import { TRPCError } from "@trpc/server";
import { generateP9Form } from "../utils/p9-forms";
import { sendEmailImmediately } from "../routers/emailQueue";
import { resolveP9OrganizationScope } from "../services/p9OrganizationScope";

function pool() {
  const p = getPool();
  if (!p) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
  return p;
}

const hrManage = createFeatureRestrictedProcedure("hr:manage");
const payrollView = createFeatureRestrictedProcedure("payroll:view");

export const p9FormRouter = router({
  // ── HR: Generate P9 forms for all employees in a tax year ──────────────
  generateForTaxYear: hrManage
    .input(z.object({ taxYear: z.number().min(2000).max(2100) }))
    .mutation(async ({ ctx, input }) => {
      const p = pool();
      const orgId = resolveP9OrganizationScope(ctx.user);

      try {
        const [empRows] = await p.query(
          `SELECT id, organizationId, firstName, lastName FROM employees
           WHERE ${orgId ? "organizationId = ?" : "organizationId IS NULL"}
           ORDER BY lastName, firstName`,
          orgId ? [orgId] : []
        ) as [any[], any];

        const employees = empRows || [];
        let generated = 0;
        const errors: string[] = [];
        const skipped: string[] = [];

        for (const emp of employees as any[]) {
          const employeeName = `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || emp.id;
          try {
            const result = await generateP9Form({
              employeeId: emp.id,
              organizationId: emp.organizationId ?? null,
              taxYear: input.taxYear,
            }, ctx.user.id);

            if (result) generated++;
            else skipped.push(`${employeeName}: no processed payroll or generated payslips found for ${input.taxYear}`);
          } catch (error: any) {
            const reason = error?.message || "Unknown generation error";
            errors.push(`${employeeName}: ${reason}`);
            console.error(`[P9-ROUTER] Failed to generate P9 for ${employeeName} (${input.taxYear}):`, error);
          }
        }

        const message = `Generated or refreshed ${generated} of ${employees.length} P9 forms for ${input.taxYear}; ${skipped.length} skipped; ${errors.length} failed.`;
        console.log(`[P9-ROUTER] ${message}`);

        return {
          generated,
          total: employees.length,
          errors,
          skipped,
          message,
        };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        console.error(`[P9-ROUTER] Failed to generate P9 forms for ${input.taxYear}:`, error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to generate P9 forms: ${error?.message}`,
        });
      }
    }),

  // ── HR: List P9 forms ─────────────────────────────────────────────────
  list: payrollView
    .input(
      z.object({
        taxYear: z.number().optional(),
        employeeId: z.string().nullish(),
        status: z.enum(["draft", "generated", "sent", "received"]).nullish(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const p = pool();
      const orgId = resolveP9OrganizationScope(ctx.user);

      try {
        const conditions: string[] = [orgId ? "p.organizationId = ?" : "p.organizationId IS NULL"];
        const params: any[] = [];
        if (orgId) {
          params.push(orgId);
        }
        if (input.taxYear) {
          conditions.push("p.taxYear = ?");
          params.push(input.taxYear);
        }
        if (input.employeeId) {
          conditions.push("p.employeeId = ?");
          params.push(input.employeeId);
        }
        if (input.status) {
          conditions.push("p.status = ?");
          params.push(input.status);
        }
        const countParams = [...params];

        let query = `
          SELECT p.*, e.firstName, e.lastName, e.email, e.employeeNumber
          FROM p9_forms p
          LEFT JOIN employees e ON p.employeeId = e.id
        `;
        if (conditions.length) query += ` WHERE ${conditions.join(" AND ")}`;

        query += ` ORDER BY p.taxYear DESC, e.lastName ASC LIMIT ? OFFSET ?`;
        params.push(input.limit, input.offset);

        const [rows] = await p.query(query, params) as [any[], any];

        // Get total count
        let countQuery = `SELECT COUNT(*) as total FROM p9_forms`;
        if (conditions.length) {
          countQuery += ` WHERE ${conditions.map((condition) => condition.replace(/^p\./, "")).join(" AND ")}`;
        }
        const [countRows] = await p.query(countQuery, countParams) as [any[], any];
        const total = Number((countRows as any[])?.[0]?.total ?? 0);

        return {
          p9Forms: (rows || []).map((p: any) => ({
            ...p,
            grossIncome: p.grossIncome / 100,
            netTaxPayable: p.netTaxPayable / 100,
            paye: p.paye / 100,
            nssf: p.nssf / 100,
            shif: p.shif / 100,
            housingLevy: p.housingLevy / 100,
            totalDeductions: p.totalDeductions / 100,
          })),
          total,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch P9 forms: ${error?.message}`,
        });
      }
    }),

  // ── HR: Get specific P9 form ───────────────────────────────────────────
  getById: payrollView
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const p = pool();
      const orgId = resolveP9OrganizationScope(ctx.user);

      try {
        const [rows] = await p.query(
          `SELECT p.*, e.firstName, e.lastName, e.email, e.department
           FROM p9_forms p
           LEFT JOIN employees e ON p.employeeId = e.id
           WHERE p.id = ? AND ${orgId ? "p.organizationId = ?" : "p.organizationId IS NULL"} LIMIT 1`,
          orgId ? [input.id, orgId] : [input.id]
        ) as [any[], any];

        const p9 = (rows as any[])?.[0];
        if (!p9) throw new TRPCError({ code: "NOT_FOUND", message: "P9 form not found" });

        return {
          ...p9,
          grossIncome: p9.grossIncome / 100,
          netTaxPayable: p9.netTaxPayable / 100,
          paye: p9.paye / 100,
          nssf: p9.nssf / 100,
          shif: p9.shif / 100,
          housingLevy: p9.housingLevy / 100,
          totalDeductions: p9.totalDeductions / 100,
        };
      } catch (error: any) {
        if (error.code === "NOT_FOUND") throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch P9 form: ${error?.message}`,
        });
      }
    }),

  // ── HR: Download P9 form ───────────────────────────────────────────────
  download: payrollView
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const p = pool();
      const orgId = resolveP9OrganizationScope(ctx.user);

      try {
        const [rows] = await p.query(
          `SELECT p.*, e.firstName, e.lastName FROM p9_forms p
           LEFT JOIN employees e ON p.employeeId = e.id
           WHERE p.id = ? AND ${orgId ? "p.organizationId = ?" : "p.organizationId IS NULL"} LIMIT 1`,
          orgId ? [input.id, orgId] : [input.id]
        );

        const p9 = (rows as any[])?.[0];
        if (!p9) throw new TRPCError({ code: "NOT_FOUND", message: "P9 form not found" });

        return {
          htmlContent: p9.htmlContent,
          fileName: `P9_${p9.taxYear}_${p9.firstName}_${p9.lastName}.html`,
          taxYear: p9.taxYear,
        };
      } catch (error: any) {
        if (error.code === "NOT_FOUND") throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to download P9: ${error?.message}`,
        });
      }
    }),

  // ── HR: Send P9 form to employee via email ────────────────────────────
  sendToEmployee: hrManage
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const p = pool();
      const orgId = resolveP9OrganizationScope(ctx.user);

      try {
        const [rows] = await p.query(
          `SELECT p.*, e.firstName, e.lastName, e.email
           FROM p9_forms p
           LEFT JOIN employees e ON p.employeeId = e.id
           WHERE p.id = ? AND ${orgId ? "p.organizationId = ?" : "p.organizationId IS NULL"} LIMIT 1`,
          orgId ? [input.id, orgId] : [input.id]
        ) as [any[], any];

        const p9 = (rows as any[])?.[0];
        if (!p9) throw new TRPCError({ code: "NOT_FOUND", message: "P9 form not found" });

        // Send email
        await sendEmailImmediately({
          to: p9.email,
          subject: `Your P9 Tax Form for ${p9.taxYear}`,
          htmlContent: `
            <p>Dear ${p9.firstName} ${p9.lastName},</p>
            <p>Please find attached your annual P9 tax form for the year ${p9.taxYear}.</p>
            <p>This form is required for your personal tax filing with Kenya Revenue Authority.</p>
            <p>Key Information:</p>
            <ul>
              <li>Total Gross Income: KES ${(p9.grossIncome / 100).toLocaleString("en-KE")}</li>
              <li>PAYE Tax Deducted: KES ${(p9.paye / 100).toLocaleString("en-KE")}</li>
              <li>NSSF Contributions: KES ${(p9.nssf / 100).toLocaleString("en-KE")}</li>
              <li>Housing Levy: KES ${(p9.housingLevy / 100).toLocaleString("en-KE")}</li>
            </ul>
            <p>If you have any questions, please contact your HR department.</p>
            <p>Best regards,<br/>HR Department</p>
          `,
          textContent: `Your P9 tax form for ${p9.taxYear} is ready. Please contact HR if you need assistance.`,
        });

        // Update status to sent
        await p.query(
          `UPDATE p9_forms SET status = 'sent', sentTo = ?, sentAt = NOW(), updatedAt = NOW()
           WHERE id = ? AND ${orgId ? "organizationId = ?" : "organizationId IS NULL"}`,
          orgId ? [p9.email, input.id, orgId] : [p9.email, input.id]
        );

        console.log(`[P9-ROUTER] Sent P9 form to ${p9.email}`);

        return { success: true, message: `P9 form sent to ${p9.email}` };
      } catch (error: any) {
        if (error.code === "NOT_FOUND") throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to send P9 form: ${error?.message}`,
        });
      }
    }),

  // ── Staff: View their own P9 forms ────────────────────────────────────
  viewMine: protectedProcedure
    .input(z.object({ taxYear: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const p = pool();
      const orgId = ctx.user.organizationId || null;

      try {
        // Get employee ID
        const [empRows] = await p.query(
          `SELECT id FROM employees
           WHERE userId = ? AND ${orgId ? "organizationId = ?" : "organizationId IS NULL"} LIMIT 1`,
          orgId ? [ctx.user.id, orgId] : [ctx.user.id]
        ) as [any[], any];

        const emp = (empRows as any[])?.[0];
        if (!emp) return { p9Forms: [] };

        let query = `
          SELECT * FROM p9_forms
          WHERE employeeId = ? AND ${orgId ? "organizationId = ?" : "organizationId IS NULL"}
        `;
        const params: any[] = orgId ? [emp.id, orgId] : [emp.id];

        if (input.taxYear) {
          query += ` AND taxYear = ?`;
          params.push(input.taxYear);
        }

        query += ` ORDER BY taxYear DESC`;

        const [rows] = await p.query(query, params) as [any[], any];

        return {
          p9Forms: (rows || []).map((p: any) => ({
            ...p,
            grossIncome: p.grossIncome / 100,
            netTaxPayable: p.netTaxPayable / 100,
            paye: p.paye / 100,
            nssf: p.nssf / 100,
            shif: p.shif / 100,
            housingLevy: p.housingLevy / 100,
          })),
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch your P9 forms: ${error?.message}`,
        });
      }
    }),
});
