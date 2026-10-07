import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, createFeatureRestrictedProcedure } from "../_core/trpc";
import { getPool } from "../db";
import { groupPayslipTaxRows, payslipsToKraCsv, summarizePayslipTaxRows } from "../utils/payrollCompliance";

// Define typed procedures
const readProcedure = createFeatureRestrictedProcedure("tax:read");

// Input type shared by most report procedures
const dateRangeSchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
  employeeId: z.string().optional(),
  departmentId: z.string().optional(),
}).refine(({ from, to }) => from <= to, {
  message: "The start date must be on or before the end date",
  path: ["to"],
});

async function getPayslipRows(
  organizationId: string | null | undefined,
  input: { from: Date; to: Date; employeeId?: string; departmentId?: string },
  includeEmployeeDetails = false,
) {
  const pool = getPool();
  if (!pool) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
  }

  const conditions = [
    "p.payPeriod BETWEEN ? AND ?",
    "p.status IN ('generated', 'sent', 'viewed', 'downloaded')",
  ];
  const params: unknown[] = [input.from.toISOString().slice(0, 7), input.to.toISOString().slice(0, 7)];
  conditions.push(organizationId ? "p.organizationId = ?" : "p.organizationId IS NULL");
  if (organizationId) params.push(organizationId);
  if (input.employeeId) {
    conditions.push("p.employeeId = ?");
    params.push(input.employeeId);
  }
  if (input.departmentId) {
    conditions.push("e.department = ?");
    params.push(input.departmentId);
  }
  const joinEmployees = includeEmployeeDetails || Boolean(input.departmentId);
  const employeeSelection = joinEmployees
    ? ", e.employeeNumber, e.firstName, e.lastName, e.department"
    : "";
  const employeeJoin = joinEmployees ? "LEFT JOIN employees e ON e.id = p.employeeId" : "";
  const employeeOrdering = joinEmployees ? ", e.lastName, e.firstName" : "";

  try {
    const [rows] = await pool.query(
      `SELECT p.*${employeeSelection}
       FROM payslips p
       ${employeeJoin}
       WHERE ${conditions.join(" AND ")}
       ORDER BY p.payPeriod${employeeOrdering}`,
      params,
    );
    return rows as any[];
  } catch (error: any) {
    console.error("[TaxCompliance] Failed to read persisted payslips:", error);
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Unable to load payroll tax records" });
  }
}

export const taxComplianceRouter = router({
  /**
   * Return PAYE withholdings aggregated by month (or per record if needed)
   */
  getPAYEReport: readProcedure
    .input(dateRangeSchema)
    .query(async ({ input, ctx }) => {
      const rows = await getPayslipRows(ctx.user.organizationId, input);
      return groupPayslipTaxRows(rows).map(({ month, totalPayee }) => ({ month, totalPayee }));
    }),

  /**
   * NSSF contributions report
   */
  getNSSFReport: readProcedure
    .input(dateRangeSchema)
    .query(async ({ input, ctx }) => {
      const rows = await getPayslipRows(ctx.user.organizationId, input);
      return groupPayslipTaxRows(rows).map(({ month, totalNSSF }) => ({ month, totalNSSF }));
    }),

  /**
   * SHIF contributions report
   */
  getSHIFReport: readProcedure
    .input(dateRangeSchema)
    .query(async ({ input, ctx }) => {
      const rows = await getPayslipRows(ctx.user.organizationId, input);
      return groupPayslipTaxRows(rows).map(({ month, totalSHIF }) => ({ month, totalSHIF }));
    }),

  /**
   * Housing levy report
   */
  getHousingLevyReport: readProcedure
    .input(dateRangeSchema)
    .query(async ({ input, ctx }) => {
      const rows = await getPayslipRows(ctx.user.organizationId, input);
      return groupPayslipTaxRows(rows).map(({ month, totalHousing }) => ({ month, totalHousing }));
    }),

  /**
   * Export KRA filing format (simple CSV) - returns base64 string
   */
  getKRAFilingFormat: readProcedure
    .input(dateRangeSchema)
    .query(async ({ input, ctx }) => {
      const rows = await getPayslipRows(ctx.user.organizationId, input, true);
      return Buffer.from(payslipsToKraCsv(rows)).toString("base64");
    }),

  /**
   * Year-to-date tax summary (leverages existing calculation utility)
   */
  getYearToDateSummary: readProcedure
    .input(z.object({ employeeId: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const now = new Date();
      const rows = await getPayslipRows(ctx.user.organizationId, {
        from: new Date(now.getFullYear(), 0, 1),
        to: now,
        employeeId: input.employeeId,
      });
      return summarizePayslipTaxRows(rows);
    }),
});
