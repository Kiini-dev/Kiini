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
      const orgId = ctx.user.organizationId;

      try {
        // Get all active employees
        const [empRows] = await p.query(
          `SELECT id FROM employees WHERE organizationId = ? AND status = 'active'`,
          [orgId]
        ) as [any[], any];

        const employees = empRows || [];
        let generated = 0;
        let errors: string[] = [];

        // Generate P9 for each employee
        for (const emp of employees as any[]) {
          const result = await generateP9Form(
            {
              employeeId: emp.id,
              organizationId: orgId,
              taxYear: input.taxYear,
            },
            ctx.user.id
          );

          if (result) {
            generated++;
          } else {
            errors.push(`Failed to generate P9 for employee ${emp.id}`);
          }
        }

        console.log(
          `[P9-ROUTER] Generated ${generated} P9 forms for ${input.taxYear}, errors: ${errors.length}`
        );

        return {
          generated,
          total: employees.length,
          errors,
          message: `Generated ${generated} of ${employees.length} P9 forms`,
        };
      } catch (error: any) {
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
      const orgId = ctx.user.organizationId;

      try {
        let query = `
          SELECT p.*, e.firstName, e.lastName, e.email, e.employeeNumber
          FROM p9_forms p
          LEFT JOIN employees e ON p.employeeId = e.id
          WHERE p.organizationId = ?
        `;
        const params: any[] = [orgId];

        if (input.taxYear) {
          query += ` AND p.taxYear = ?`;
          params.push(input.taxYear);
        }
        if (input.employeeId) {
          query += ` AND p.employeeId = ?`;
          params.push(input.employeeId);
        }
        if (input.status) {
          query += ` AND p.status = ?`;
          params.push(input.status);
        }

        query += ` ORDER BY p.taxYear DESC, e.lastName ASC LIMIT ? OFFSET ?`;
        params.push(input.limit, input.offset);

        const [rows] = await p.query(query, params) as [any[], any];

        // Get total count
        let countQuery = `SELECT COUNT(*) as total FROM p9_forms WHERE organizationId = ?`;
        const countParams: any[] = [orgId];

        if (input.taxYear) {
          countQuery += ` AND taxYear = ?`;
          countParams.push(input.taxYear);
        }
        if (input.employeeId) {
          countQuery += ` AND employeeId = ?`;
          countParams.push(input.employeeId);
        }
        if (input.status) {
          countQuery += ` AND status = ?`;
          countParams.push(input.status);
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
      const orgId = ctx.user.organizationId;

      try {
        const [rows] = await p.query(
          `SELECT p.*, e.firstName, e.lastName, e.email, e.department
           FROM p9_forms p
           LEFT JOIN employees e ON p.employeeId = e.id
           WHERE p.id = ? AND p.organizationId = ? LIMIT 1`,
          [input.id, orgId]
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
      const orgId = ctx.user.organizationId;

      try {
        const [rows] = await p.query(
          `SELECT p.*, e.firstName, e.lastName FROM p9_forms p
           LEFT JOIN employees e ON p.employeeId = e.id
           WHERE p.id = ? AND p.organizationId = ? LIMIT 1`,
          [input.id, orgId]
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
      const orgId = ctx.user.organizationId;

      try {
        const [rows] = await p.query(
          `SELECT p.*, e.firstName, e.lastName, e.email
           FROM p9_forms p
           LEFT JOIN employees e ON p.employeeId = e.id
           WHERE p.id = ? AND p.organizationId = ? LIMIT 1`,
          [input.id, orgId]
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
           WHERE id = ?`,
          [p9.email, input.id]
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
      const orgId = ctx.user.organizationId;

      try {
        // Get employee ID
        const [empRows] = await p.query(
          `SELECT id FROM employees WHERE userId = ? AND organizationId = ? LIMIT 1`,
          [ctx.user.id, orgId]
        ) as [any[], any];

        const emp = (empRows as any[])?.[0];
        if (!emp) return { p9Forms: [] };

        let query = `
          SELECT * FROM p9_forms
          WHERE employeeId = ? AND organizationId = ?
        `;
        const params: any[] = [emp.id, orgId];

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
