import { and, desc, eq, gte, inArray, isNull, lte } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createHash } from "node:crypto";
import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import { departments, employeeCostAllocations, employees, payrollCostCenters, payrollLedgerEntries, reportExportAuditLogs } from "../../drizzle/schema";
import { createFeatureRestrictedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { toAllocationBasisPoints } from "../services/payrollCostAllocationService";
import { resolvePayrollCostCenterScope } from "../services/payrollCostCenterScope";
import { v4 as uuidv4 } from "uuid";

const readProcedure = createFeatureRestrictedProcedure("payroll:read");
const manageProcedure = createFeatureRestrictedProcedure("payroll:create");
const requireOrganizationId = (organizationId?: string | null) => {
  if (!organizationId) throw new Error("An organization context is required");
  return organizationId;
};
const requireCostCenterScope = (user: { organizationId?: string | null; role?: string | null; effectiveRole?: string | null }) => {
  const organizationId = resolvePayrollCostCenterScope(user);
  if (organizationId === undefined) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Payroll cost centers require an organization or global super-admin scope." });
  }
  return organizationId;
};
const costCenterScopeCondition = (organizationId: string | null) =>
  organizationId === null ? isNull(payrollCostCenters.organizationId) : eq(payrollCostCenters.organizationId, organizationId);
const departmentScopeCondition = (organizationId: string | null) =>
  organizationId === null ? isNull(departments.organizationId) : eq(departments.organizationId, organizationId);

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD dates");

export const payrollAllocationsRouter = router({
  listCostCenters: readProcedure
    .input(z.object({ includeInactive: z.boolean().optional().default(false) }).optional())
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const organizationId = requireCostCenterScope(ctx.user);
      const conditions = [costCenterScopeCondition(organizationId)];
      if (!input?.includeInactive) conditions.push(eq(payrollCostCenters.isActive, 1));
      return database.select({
        id: payrollCostCenters.id,
        organizationId: payrollCostCenters.organizationId,
        departmentId: payrollCostCenters.departmentId,
        code: payrollCostCenters.code,
        name: payrollCostCenters.name,
        type: payrollCostCenters.type,
        isActive: payrollCostCenters.isActive,
      }).from(payrollCostCenters).where(and(...conditions)).orderBy(payrollCostCenters.code);
    }),

  createCostCenter: manageProcedure
    .input(z.object({
      code: z.string().trim().min(1).max(50),
      name: z.string().trim().min(1).max(100),
      type: z.enum(["COGS", "R&D", "S&M", "G&A", "PROGRAMMATIC"]),
      departmentId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const organizationId = requireCostCenterScope(ctx.user);
      if (input.departmentId) {
        const department = await database.select({ id: departments.id })
          .from(departments)
          .where(and(eq(departments.id, input.departmentId), departmentScopeCondition(organizationId)))
          .limit(1);
        if (!department.length) throw new Error("Department not found in this organization");
      }
      const id = uuidv4();
      await database.insert(payrollCostCenters).values({
        id,
        organizationId,
        departmentId: input.departmentId ?? null,
        code: input.code,
        name: input.name,
        type: input.type,
        isActive: 1,
        createdBy: ctx.user.id,
      });
      return { id };
    }),

  updateCostCenter: manageProcedure
    .input(z.object({
      id: z.string(),
      code: z.string().trim().min(1).max(50).optional(),
      name: z.string().trim().min(1).max(100).optional(),
      type: z.enum(["COGS", "R&D", "S&M", "G&A", "PROGRAMMATIC"]).optional(),
      departmentId: z.string().nullable().optional(),
      isActive: z.boolean().optional(),
    }).refine((input) => Object.keys(input).some((key) => key !== "id"), "Provide a field to update"))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const organizationId = requireCostCenterScope(ctx.user);
      if (input.departmentId) {
        const department = await database.select({ id: departments.id })
          .from(departments)
          .where(and(eq(departments.id, input.departmentId), departmentScopeCondition(organizationId)))
          .limit(1);
        if (!department.length) throw new Error("Department not found in this organization");
      }
      const { id, isActive, ...fields } = input;
      const result = await database.update(payrollCostCenters)
        .set({ ...fields, ...(isActive === undefined ? {} : { isActive: isActive ? 1 : 0 }) })
        .where(and(eq(payrollCostCenters.id, id), costCenterScopeCondition(organizationId)));
      return { success: true, result };
    }),

  getEmployeeAllocations: readProcedure
    .input(z.object({ employeeId: z.string() }))
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const organizationId = requireOrganizationId(ctx.user.organizationId);
      const employee = await database.select({ id: employees.id })
        .from(employees)
        .where(and(eq(employees.id, input.employeeId), eq(employees.organizationId, organizationId)))
        .limit(1);
      if (!employee.length) throw new Error("Employee not found in this organization");
      const rows = await database.select({
        id: employeeCostAllocations.id,
        costCenterId: employeeCostAllocations.costCenterId,
        allocationBasisPoints: employeeCostAllocations.allocationBasisPoints,
        effectiveDate: employeeCostAllocations.effectiveDate,
        costCenterCode: payrollCostCenters.code,
        costCenterName: payrollCostCenters.name,
        costCenterType: payrollCostCenters.type,
      }).from(employeeCostAllocations)
        .innerJoin(payrollCostCenters, eq(employeeCostAllocations.costCenterId, payrollCostCenters.id))
        .where(and(
          eq(employeeCostAllocations.organizationId, organizationId),
          eq(employeeCostAllocations.employeeId, input.employeeId),
        ))
        .orderBy(desc(employeeCostAllocations.effectiveDate));
      return rows.map((row) => ({ ...row, allocationPercentage: row.allocationBasisPoints / 100 }));
    }),

  setEmployeeAllocations: manageProcedure
    .input(z.object({
      employeeId: z.string(),
      effectiveDate: dateSchema,
      allocations: z.array(z.object({
        costCenterId: z.string(),
        allocationPercentage: z.number().positive().max(100),
      })).min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const organizationId = requireOrganizationId(ctx.user.organizationId);
      const employee = await database.select({ id: employees.id })
        .from(employees)
        .where(and(eq(employees.id, input.employeeId), eq(employees.organizationId, organizationId)))
        .limit(1);
      if (!employee.length) throw new Error("Employee not found in this organization");
      const allocations = toAllocationBasisPoints(input.allocations);
      const centerIds = allocations.map((allocation) => allocation.costCenterId);
      const centers = await database.select({ id: payrollCostCenters.id })
        .from(payrollCostCenters)
        .where(and(
          eq(payrollCostCenters.organizationId, organizationId),
          eq(payrollCostCenters.isActive, 1),
          inArray(payrollCostCenters.id, centerIds),
        ));
      if (centers.length !== centerIds.length) throw new Error("Select active cost centers belonging to this organization");
      await database.transaction(async (transaction: any) => {
        const existing = await transaction.select({ id: employeeCostAllocations.id })
          .from(employeeCostAllocations)
          .where(and(
            eq(employeeCostAllocations.organizationId, organizationId),
            eq(employeeCostAllocations.employeeId, input.employeeId),
            eq(employeeCostAllocations.effectiveDate, input.effectiveDate),
          ))
          .limit(1);
        if (existing.length) throw new Error("An allocation set already exists for that employee and effective date");
        await transaction.insert(employeeCostAllocations).values(allocations.map((allocation) => ({
          id: uuidv4(),
          organizationId,
          employeeId: input.employeeId,
          costCenterId: allocation.costCenterId,
          allocationBasisPoints: allocation.allocationBasisPoints,
          effectiveDate: input.effectiveDate,
          createdBy: ctx.user.id,
        })));
      });
      return { success: true, allocationCount: allocations.length };
    }),

  getLedger: readProcedure
    .input(z.object({
      startDate: dateSchema.optional(),
      endDate: dateSchema.optional(),
      employeeId: z.string().optional(),
      costCenterId: z.string().optional(),
      limit: z.number().int().min(1).max(500).default(100),
    }).optional())
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const organizationId = requireOrganizationId(ctx.user.organizationId);
      const filters = [eq(payrollLedgerEntries.organizationId, organizationId)];
      if (input?.startDate) filters.push(gte(payrollLedgerEntries.payrollPeriodEnd, input.startDate));
      if (input?.endDate) filters.push(lte(payrollLedgerEntries.payrollPeriodEnd, input.endDate));
      if (input?.employeeId) filters.push(eq(payrollLedgerEntries.employeeId, input.employeeId));
      if (input?.costCenterId) filters.push(eq(payrollLedgerEntries.costCenterId, input.costCenterId));
      return database.select({
        id: payrollLedgerEntries.id,
        payrollId: payrollLedgerEntries.payrollId,
        employeeId: payrollLedgerEntries.employeeId,
        costCenterId: payrollLedgerEntries.costCenterId,
        costCenterCode: payrollCostCenters.code,
        costCenterName: payrollCostCenters.name,
        costCenterType: payrollCostCenters.type,
        payrollPeriodStart: payrollLedgerEntries.payrollPeriodStart,
        payrollPeriodEnd: payrollLedgerEntries.payrollPeriodEnd,
        allocationBasisPoints: payrollLedgerEntries.allocationBasisPoints,
        grossPayCents: payrollLedgerEntries.grossPayCents,
        employerStatutoryCents: payrollLedgerEntries.employerStatutoryCents,
        employerBenefitsCents: payrollLedgerEntries.employerBenefitsCents,
        fullyBurdenedCostCents: payrollLedgerEntries.fullyBurdenedCostCents,
        employeeTaxCents: payrollLedgerEntries.employeeTaxCents,
        netPayoutCents: payrollLedgerEntries.netPayoutCents,
        employeeName: employees.firstName,
        employeeLastName: employees.lastName,
      }).from(payrollLedgerEntries)
        .innerJoin(payrollCostCenters, eq(payrollLedgerEntries.costCenterId, payrollCostCenters.id))
        .innerJoin(employees, eq(payrollLedgerEntries.employeeId, employees.id))
        .where(and(...filters))
        .orderBy(desc(payrollLedgerEntries.payrollPeriodEnd))
        .limit(input?.limit ?? 100);
    }),

  getCostCenterSummary: readProcedure
    .input(z.object({ startDate: dateSchema.optional(), endDate: dateSchema.optional() }).optional())
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const filters = [eq(payrollLedgerEntries.organizationId, requireOrganizationId(ctx.user.organizationId))];
      if (input?.startDate) filters.push(gte(payrollLedgerEntries.payrollPeriodEnd, input.startDate));
      if (input?.endDate) filters.push(lte(payrollLedgerEntries.payrollPeriodEnd, input.endDate));
      const rows = await database.select({
        costCenterId: payrollCostCenters.id,
        code: payrollCostCenters.code,
        name: payrollCostCenters.name,
        type: payrollCostCenters.type,
        grossPayCents: payrollLedgerEntries.grossPayCents,
        employerStatutoryCents: payrollLedgerEntries.employerStatutoryCents,
        employerBenefitsCents: payrollLedgerEntries.employerBenefitsCents,
        fullyBurdenedCostCents: payrollLedgerEntries.fullyBurdenedCostCents,
      }).from(payrollLedgerEntries)
        .innerJoin(payrollCostCenters, eq(payrollLedgerEntries.costCenterId, payrollCostCenters.id))
        .where(and(...filters));
      const summary = new Map<string, {
        costCenterId: string; code: string; name: string; type: string;
        grossPayCents: number; employerStatutoryCents: number; employerBenefitsCents: number;
        fullyBurdenedCostCents: number; employeeCount: number;
      }>();
      for (const row of rows) {
        const current = summary.get(row.costCenterId) ?? {
          costCenterId: row.costCenterId, code: row.code, name: row.name, type: row.type,
          grossPayCents: 0, employerStatutoryCents: 0, employerBenefitsCents: 0,
          fullyBurdenedCostCents: 0, employeeCount: 0,
        };
        current.grossPayCents += row.grossPayCents;
        current.employerStatutoryCents += row.employerStatutoryCents;
        current.employerBenefitsCents += row.employerBenefitsCents;
        current.fullyBurdenedCostCents += row.fullyBurdenedCostCents;
        current.employeeCount++;
        summary.set(row.costCenterId, current);
      }
      return [...summary.values()];
    }),

  exportLedger: readProcedure
    .input(z.object({
      startDate: dateSchema,
      endDate: dateSchema,
      format: z.enum(["CSV", "XLSX", "PDF"]),
    }).refine((input) => input.startDate <= input.endDate, {
      message: "End date must be on or after start date",
      path: ["endDate"],
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const organizationId = requireOrganizationId(ctx.user.organizationId);
      const managerEmail = ctx.user.email?.trim();
      if (!managerEmail) throw new Error("Your user account needs an email address to create an audited export");
      const rows = await database.select({
        periodStart: payrollLedgerEntries.payrollPeriodStart,
        periodEnd: payrollLedgerEntries.payrollPeriodEnd,
        employeeId: payrollLedgerEntries.employeeId,
        employeeFirstName: employees.firstName,
        employeeLastName: employees.lastName,
        centerCode: payrollCostCenters.code,
        centerName: payrollCostCenters.name,
        allocationBasisPoints: payrollLedgerEntries.allocationBasisPoints,
        grossPayCents: payrollLedgerEntries.grossPayCents,
        employerStatutoryCents: payrollLedgerEntries.employerStatutoryCents,
        employerBenefitsCents: payrollLedgerEntries.employerBenefitsCents,
        fullyBurdenedCostCents: payrollLedgerEntries.fullyBurdenedCostCents,
        employeeTaxCents: payrollLedgerEntries.employeeTaxCents,
        netPayoutCents: payrollLedgerEntries.netPayoutCents,
      }).from(payrollLedgerEntries)
        .innerJoin(payrollCostCenters, eq(payrollLedgerEntries.costCenterId, payrollCostCenters.id))
        .innerJoin(employees, eq(payrollLedgerEntries.employeeId, employees.id))
        .where(and(
          eq(payrollLedgerEntries.organizationId, organizationId),
          gte(payrollLedgerEntries.payrollPeriodEnd, input.startDate),
          lte(payrollLedgerEntries.payrollPeriodEnd, input.endDate),
        ))
        .orderBy(payrollLedgerEntries.payrollPeriodEnd, payrollCostCenters.code)
        .limit(10_000);

      const headers = [
        "Period start", "Period end", "Employee ID", "Employee", "Cost center", "Allocation %",
        "Gross pay cents", "Employer statutory cents", "Employer benefits cents",
        "Fully burdened cost cents", "Employee tax cents", "Net payout cents",
      ];
      const values = rows.map((row) => [
        row.periodStart,
        row.periodEnd,
        row.employeeId,
        `${row.employeeFirstName} ${row.employeeLastName}`,
        `${row.centerCode} — ${row.centerName}`,
        (row.allocationBasisPoints / 100).toFixed(2),
        row.grossPayCents,
        row.employerStatutoryCents,
        row.employerBenefitsCents,
        row.fullyBurdenedCostCents,
        row.employeeTaxCents,
        row.netPayoutCents,
      ]);

      let bytes: Uint8Array;
      let extension: string;
      let mimeType: string;
      if (input.format === "CSV") {
        const quote = (value: unknown) => {
          const safe = String(value ?? "").replace(/^[=+\-@]/, "'$&");
          return `"${safe.replace(/"/g, '""')}"`;
        };
        bytes = Buffer.from([headers, ...values].map((row) => row.map(quote).join(",")).join("\r\n"), "utf8");
        extension = "csv";
        mimeType = "text/csv";
      } else if (input.format === "XLSX") {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Payroll Allocations");
        sheet.addRow(headers);
        for (const row of values) sheet.addRow(row);
        sheet.getRow(1).font = { bold: true };
        sheet.columns.forEach((column) => { column.width = 22; });
        bytes = new Uint8Array(await workbook.xlsx.writeBuffer());
        extension = "xlsx";
        mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      } else {
        const pdf = new jsPDF({ orientation: "landscape" });
        pdf.setFontSize(9);
        let y = 14;
        pdf.text(`Payroll allocation ledger: ${input.startDate} to ${input.endDate}`, 12, y);
        y += 8;
        for (const row of values) {
          const line = `${row[1]} | ${row[3]} | ${row[4]} | ${row[5]}% | Fully burdened cents: ${row[9]}`;
          if (y > 195) { pdf.addPage(); y = 14; }
          pdf.text(String(line).slice(0, 160), 12, y);
          y += 6;
        }
        bytes = new Uint8Array(pdf.output("arraybuffer"));
        extension = "pdf";
        mimeType = "application/pdf";
      }

      const ipHeader = ctx.req.headers["x-forwarded-for"];
      const ipAddress = (Array.isArray(ipHeader) ? ipHeader[0] : ipHeader)?.split(",")[0]?.trim()
        || ctx.req.socket?.remoteAddress
        || "unknown";
      const userAgent = String(ctx.req.headers["user-agent"] ?? "unknown");
      const generatedFileSha256 = createHash("sha256").update(bytes).digest("hex");
      await database.insert(reportExportAuditLogs).values({
        id: uuidv4(),
        organizationId,
        managerUserId: ctx.user.id,
        managerEmail,
        reportType: "PAYROLL_COST_ALLOCATION_DETAIL",
        exportFormat: input.format,
        dateRangeStart: input.startDate,
        dateRangeEnd: input.endDate,
        ipAddress: ipAddress.slice(0, 45),
        userAgent,
        generatedFileSha256,
      });
      return {
        filename: `payroll-allocation-${input.startDate}-${input.endDate}.${extension}`,
        mimeType,
        data: Buffer.from(bytes).toString("base64"),
        sha256: generatedFileSha256,
        rows: values.length,
      };
    }),
});
