/**
 * Payslip Generation Router
 * Generate, view, and send employee payslips
 */
import { router, protectedProcedure } from "../_core/trpc";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { z } from "zod";
import { getPool } from "../db";
import { v4 as uuidv4 } from "uuid";
import { TRPCError } from "@trpc/server";
import { calculateKenyanPayroll } from "../utils/kenyan-payroll-calculator";
import { generatePayslipHTML } from "../utils/payslip-template";
import { getCompanyInfo } from "../utils/company-info";
import { renderNotificationTemplate } from "../services/notificationRenderer";
import { createNotification } from "../_core/notification";
import { processMonthlyPayroll } from "../jobs/payrollJobs";
import { renderHtmlToPdf } from "../services/documentPdf";

function pool(): any {
  const p = getPool();
  if (!p) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
  return p;
}

async function renderSavedPayslipTemplate(connection: any, fallback: string, values: Record<string, string>, organizationId?: string | null) {
  try {
    const [rows] = await connection.query(
      "SELECT content FROM documentTemplates WHERE type = 'payslip' AND isDefault = 1 AND (organizationId = ? OR organizationId IS NULL) ORDER BY organizationId IS NULL ASC LIMIT 1",
      [organizationId || null]
    );
    const template = (rows as any[])?.[0]?.content;
    if (!template) return fallback;
    const normalizeToken = (token: string) => token
      .trim()
      .replace(/^[{\[$\s]+|[}\]$\s]+$/g, "")
      .replace(/([a-z\d])([A-Z])/g, "$1_$2")
      .replace(/[\s\-.]+/g, "_")
      .replace(/_+/g, "_")
      .toLowerCase();
    const rendered = template.replace(/\{\{\s*([^{}]+?)\s*\}\}|\$\{\s*([^{}]+?)\s*\}|\[\s*([^\]]+?)\s*\]/g, (_match: string, moustache: string, dollar: string, bracket: string) => {
      return values[normalizeToken(moustache || dollar || bracket)] ?? "";
    });
    const figureSizing = `<style>.section{min-width:0;container-type:inline-size}.section table{width:100%;table-layout:fixed}.section th,.section td{overflow-wrap:anywhere;word-break:break-word}.section .amount{white-space:nowrap;overflow:visible;font-size:clamp(7px,3.5cqw,9px)}</style>`;
    return rendered.includes("</head>") ? rendered.replace("</head>", `${figureSizing}</head>`) : `${figureSizing}${rendered}`;
  } catch {
    return fallback;
  }
}

function money(value: unknown): string {
  return `KES ${((Number(value) || 0) / 100).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function parseBreakdown(value: unknown): any[] {
  if (Array.isArray(value)) return value;
  try { return value ? JSON.parse(String(value)) : []; } catch { return []; }
}

function firstAmount(...values: unknown[]): number {
  for (const value of values) {
    const amount = Number(value);
    if (Number.isFinite(amount) && amount !== 0) return amount;
  }
  return 0;
}

function payslipAmounts(payslip: any) {
  const basicSalary = Number(payslip.basicSalary || 0);
  const allowances = firstAmount(
    payslip.allowances,
    payslip.totalAllowances,
    parseBreakdown(payslip.allowancesBreakdown).reduce((sum, item) => sum + Number(item.amount || 0), 0)
  );
  const grossSalary = firstAmount(
    payslip.grossPay,
    payslip.grossSalary,
    basicSalary + allowances + Number(payslip.bonuses || 0)
  );
  const totalDeductions = Number(payslip.totalDeductions || 0);
  const netSalary = firstAmount(payslip.netPay, payslip.netSalary, grossSalary - totalDeductions);
  return { ...payslip, grossSalary, grossPay: grossSalary, netSalary, netPay: netSalary };
}

function employeeSlugKey(value: unknown): string {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function isStatutoryDeduction(item: any): boolean {
  if (item.type === "statutory") return true;
  const name = String(item.name || item.component || item.deductionType || "").trim().toLowerCase();
  return /^(?:paye|payee)(?:\b|$)|^nssf(?:\s+tier\s+[12]|\s+contribution)?$|^(?:nhif|shif|nhif\/shif)$|^(?:housing levy(?:\s+\(ahl\))?|ahl)$/.test(name);
}

function payPeriodDates(period: unknown): { start: string; end: string; label: string } {
  const value = String(period || "");
  const match = value.match(/^(\d{4})-(\d{2})$/);
  if (!match) return { start: "", end: "", label: value || "-" };
  const year = Number(match[1]);
  const month = Number(match[2]);
  const pad = (part: number) => String(part).padStart(2, "0");
  const start = `${year}-${pad(month)}-01`;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const end = `${year}-${pad(month)}-${pad(lastDay)}`;
  return { start, end, label: `${start} to ${end}` };
}

async function renderPayslipForRow(connection: any, payslip: any, employee: any, organizationId?: string | null): Promise<string> {
  const company = await getCompanyInfo();
  payslip = payslipAmounts(payslip);
  const allowances = parseBreakdown(payslip.allowancesBreakdown);
  const deductions = parseBreakdown(payslip.deductionsBreakdown);
  const additionalDeductions = deductions.filter((item) => !isStatutoryDeduction(item) && item.type !== "benefit");
  const employeeName = `${employee?.firstName || ""} ${employee?.lastName || ""}`.trim() || payslip.employeeId;
  const basicSalary = Number(payslip.basicSalary || 0);
  const grossSalary = firstAmount(payslip.grossSalary, payslip.grossPay);
  const totalDeductions = Number(payslip.totalDeductions || 0);
  const netSalary = firstAmount(payslip.netSalary, payslip.netPay);
  const paye = firstAmount(payslip.paye, payslip.payeDeduction, deductions.find((item) => /paye/i.test(item.name || ""))?.amount);
  const nssf = firstAmount(payslip.nssf, payslip.nssfDeduction, deductions.find((item) => /nssf/i.test(item.name || ""))?.amount);
  const shif = firstAmount(payslip.shif, payslip.nhifDeduction, deductions.find((item) => /nhif|shif/i.test(item.name || ""))?.amount);
  const housingLevy = firstAmount(payslip.housingLevy, deductions.find((item) => /housing/i.test(item.name || ""))?.amount);
  const periodDates = payPeriodDates(payslip.payPeriod || payslip.payMonth);
  const benefits = parseBreakdown(payslip.benefitsBreakdown);
  const employerBenefits = firstAmount(
    payslip.employerBenefits,
    benefits.reduce((sum, item) => sum + Number(item.employerCost || 0), 0)
  );
  const employerContributions = nssf + housingLevy + employerBenefits;
  const employerContributionRows = [
    ...(nssf > 0 ? [{ name: "Employer NSSF", amount: nssf }] : []),
    ...(housingLevy > 0 ? [{ name: "Employer Housing Levy", amount: housingLevy }] : []),
    ...benefits
      .filter((item) => Number(item.employerCost || 0) > 0)
      .map((item) => ({ name: `${item.name || item.benefitType || "Benefit"} (Employer)`, amount: Number(item.employerCost) })),
  ];
  const values: Record<string, string> = {
    company_name: company.name,
    company_email: company.email,
    company_phone: company.phone,
    company_address: company.address,
    company_website: company.website,
    company_logo: company.logo,
    payslip_number: payslip.payslipNumber || `${employee?.employeeNumber || payslip.employeeId}-${payslip.payPeriod}`,
    pay_period: periodDates.label,
    pay_period_start: periodDates.start,
    pay_period_end: periodDates.end,
    pay_date: String(payslip.payPeriodEnd || payslip.payDate || payslip.payMonth || "").slice(0, 10),
    employee_name: employeeName,
    employee_number: employee?.employeeNumber || payslip.employeeId || "",
    department: employee?.department || "",
    position: employee?.position || "",
    bank_name: employee?.bankName || payslip.bankName || "",
    bank_account: employee?.bankAccountNumber || payslip.bankAccountNumber || "",
    basic_salary: money(basicSalary),
    allowances: money(Number(payslip.allowances || allowances.reduce((sum, item) => sum + Number(item.amount || 0), 0))),
    bonuses: money(Number(payslip.bonuses || 0)),
    gross_salary: money(grossSalary),
    gross_pay: money(grossSalary),
    paye: money(paye),
    nssf: money(nssf),
    nhif: money(shif),
    shif: money(shif),
    loan_deduction: money(Number(payslip.loanDeduction || 0)),
    other_deductions: money(Number(payslip.otherDeductions || 0)),
    total_deductions: money(totalDeductions),
    net_salary: money(netSalary),
    net_pay: money(netSalary),
    employer_nssf: money(nssf),
    employer_housing_levy: money(housingLevy),
    employer_benefits: money(employerBenefits),
    total_company_contribution: money(employerContributions),
    company_contribution_balance: money(0),
    employer_contribution_balance: money(0),
  };
  allowances.forEach((item, index) => {
    values[`allowance_${index + 1}_name`] = item.name || item.allowanceType || item.allowanceName || "Allowance";
    values[`allowance_${index + 1}_amount`] = money(item.amount);
  });
  const fallback = generatePayslipHTML({
    payPeriod: payslip.payPeriod || String(payslip.payMonth || "").slice(0, 7),
    payDate: values.pay_date,
    employee: { name: employeeName, id: values.employee_number, department: values.department, position: values.position, bankName: values.bank_name, bankAccount: values.bank_account, nssfNumber: employee?.nssfNumber || "", nhifNumber: employee?.nhifNumber || "", taxPin: employee?.taxId || "", nationalId: employee?.nationalId || "" },
    company: { name: values.company_name, address: values.company_address, logo: values.company_logo, employerContributions: employerContributionRows },
    earnings: { basicSalary, allowances, grossSalary },
    deductions: { paye, nssf, nssfTier1: 0, nssfTier2: 0, shif, housingLevy, personalRelief: 0, total: totalDeductions, additional: additionalDeductions },
    netSalary,
  });
  return renderSavedPayslipTemplate(connection, fallback, values, organizationId);
}

function staffPayslipValues(payslip: any) {
  const normalizedPayslip = payslipAmounts(payslip);
  const grossSalary = normalizedPayslip.grossSalary / 100;
  const netSalary = normalizedPayslip.netSalary / 100;
  return {
    ...normalizedPayslip,
    basicSalary: Number(normalizedPayslip.basicSalary || 0) / 100,
    grossSalary,
    grossPay: grossSalary,
    totalDeductions: Number(payslip.totalDeductions || 0) / 100,
    netSalary,
    netPay: netSalary,
  };
}

function isPayslipManager(user: { role?: unknown; effectiveRole?: unknown }): boolean {
  const normalizedRoles = [user.role, user.effectiveRole].map((role) =>
    String(role || "").trim().toLowerCase().replace(/[\s-]+/g, "_")
  );
  return normalizedRoles.some((role) =>
    ["admin", "super_admin", "superadmin", "hr", "hr_manager"].includes(role)
  );
}

function isGlobalSuperAdmin(user: { role?: unknown; effectiveRole?: unknown }): boolean {
  return [user.role, user.effectiveRole].some((role) =>
    ["super_admin", "superadmin"].includes(String(role || "").trim().toLowerCase().replace(/[\s-]+/g, "_"))
  );
}

function displayBreakdown(value: unknown): any[] {
  return parseBreakdown(value).map((item) => ({
    ...item,
    amount: Number(item.amount ?? item.cost ?? 0) / 100,
    ...(item.cost === undefined ? {} : { cost: Number(item.cost) / 100 }),
  }));
}

const payrollView = createFeatureRestrictedProcedure("payroll:view");
const payrollWrite = createFeatureRestrictedProcedure("payroll:edit");

export const payslipRouter = router({
  // ── STAFF: List own payslips ──────────────────────────────────────────────
  listMine: protectedProcedure
    .input(z.object({
      limit: z.number().default(12),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const p = pool();
      if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });

      try {
        // Get employee ID from user
        const [empRows] = await p.query(
          `SELECT id, organizationId FROM employees WHERE userId = ? LIMIT 1`,
          [ctx.user.id]
        );

        const emp = (empRows as any[])?.[0];
        if (!emp) {
          return { payslips: [], total: 0, message: "No employee record found for this user" };
        }

        // Get payslips
        const [rows] = await p.query(
          `SELECT id, payMonth AS payPeriod, payMonth AS payDate, basicSalary, grossSalary AS grossPay, totalDeductions, netSalary AS netPay, status, createdAt
           FROM payslips 
           WHERE employeeId = ? 
           ORDER BY payMonth DESC
           LIMIT ? OFFSET ?`,
          [emp.id, input.limit, input.offset]
        );

        const [countRows] = await p.query(
          `SELECT COUNT(*) as total FROM payslips WHERE employeeId = ?`,
          [emp.id]
        );

        return {
          payslips: (rows || []).map((p: any) => ({
            ...p,
            basicSalary: p.basicSalary / 100,
            grossPay: p.grossPay / 100,
            totalDeductions: p.totalDeductions / 100,
            netPay: p.netPay / 100,
          })),
          total: (countRows as any[])?.[0]?.total || 0,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch payslips: ${error?.message}`,
        });
      }
    }),

  // ── STAFF: Get payslip details ────────────────────────────────────────────
  getOneForStaff: protectedProcedure
    .input(z.object({ payslipId: z.string() }))
    .query(async ({ ctx, input }) => {
      const p = pool();
      if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });

      try {
        // Get employee
        const [empRows] = await p.query(
          `SELECT id, firstName, lastName, email, department, position FROM employees WHERE userId = ? LIMIT 1`,
          [ctx.user.id]
        );

        const emp = (empRows as any[])?.[0];
        if (!emp) throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found" });

        // Get payslip
        const [rows] = await p.query(
          `SELECT * FROM payslips WHERE id = ? AND employeeId = ? LIMIT 1`,
          [input.payslipId, emp.id]
        );

        const payslip = (rows as any[])?.[0];
        if (!payslip) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Payslip not found" });
        }

        return {
          ...staffPayslipValues(payslip),
          employee: {
            name: `${emp.firstName} ${emp.lastName}`,
            email: emp.email,
            department: emp.department,
            position: emp.position,
          },
          allowancesBreakdown: parseBreakdown(payslip.allowancesBreakdown),
          deductionsBreakdown: parseBreakdown(payslip.deductionsBreakdown),
          htmlContent: await renderPayslipForRow(p, payslip, emp, ctx.user.organizationId),
        };
      } catch (error: any) {
        if (error.code && error.code.startsWith("NOT_FOUND")) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch payslip: ${error?.message}`,
        });
      }
    }),

  // ── STAFF: Download payslip PDF ────────────────────────────────────────────
  downloadPayslip: protectedProcedure
    .input(z.object({ payslipId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const p = pool();
      if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });

      try {
        // Get employee
        const [empRows] = await p.query(
          `SELECT id, firstName, lastName, email, employeeNumber FROM employees WHERE userId = ? LIMIT 1`,
          [ctx.user.id]
        );

        const emp = (empRows as any[])?.[0];
        if (!emp) throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found" });

        // Get payslip
        const [rows] = await p.query(
          `SELECT * FROM payslips WHERE id = ? AND employeeId = ? LIMIT 1`,
          [input.payslipId, emp.id]
        );

        const payslip = (rows as any[])?.[0];
        if (!payslip) throw new TRPCError({ code: "NOT_FOUND", message: "Payslip not found" });

        // Return HTML content for client-side PDF generation or direct HTML view
        return {
          htmlContent: await renderPayslipForRow(p, payslip, emp, ctx.user.organizationId),
          fileName: `Payslip_${emp.employeeNumber}_${payslip.payPeriod}.pdf`,
          payPeriod: payslip.payPeriod,
        };
      } catch (error: any) {
        if (error.code && error.code.startsWith("NOT_FOUND")) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to download payslip: ${error?.message}`,
        });
      }
    }),

  // ── STAFF: Get payslip statistics ─────────────────────────────────────────
  getMyStats: protectedProcedure
    .query(async ({ ctx }) => {
      const p = pool();
      if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });

      try {
        // Get employee
        const [empRows] = await p.query(
          `SELECT id FROM employees WHERE userId = ? LIMIT 1`,
          [ctx.user.id]
        );

        const emp = (empRows as any[])?.[0];
        if (!emp) return { totalPayslips: 0, recentPayslips: [] };

        // Count payslips
        const [countRows] = await p.query(
          `SELECT COUNT(*) as total, SUM(netSalary) as totalEarned FROM payslips WHERE employeeId = ?`,
          [emp.id]
        );

        // Get recent payslips (last 6 months)
        const [recentRows] = await p.query(
          `SELECT id, payMonth AS payPeriod, payMonth AS payDate, basicSalary, grossSalary AS grossPay, netSalary AS netPay, status 
           FROM payslips WHERE employeeId = ? 
           ORDER BY payMonth DESC LIMIT 6`,
          [emp.id]
        );

        const count = (countRows as any[])?.[0];
        return {
          totalPayslips: count?.total || 0,
          totalEarned: (count?.totalEarned || 0) / 100,
          recentPayslips: (recentRows || []).map((p: any) => ({
            ...p,
            basicSalary: p.basicSalary / 100,
            grossPay: p.grossPay / 100,
            netPay: p.netPay / 100,
          })),
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch stats: ${error?.message}`,
        });
      }
    }),

  listAll: payrollView
    .input(z.object({
      employeeId: z.string().optional(),
      payPeriod: z.string().nullable().optional(),
      startDate: z.string().nullable().optional(),
      endDate: z.string().nullable().optional(),
      status: z.enum(["draft", "generated", "sent", "viewed"]).nullable().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }).optional())
    .query(async ({ input, ctx }) => {
      const p = pool();
      const orgId = isGlobalSuperAdmin(ctx.user) ? null : ctx.user.organizationId;
      const canViewAll = isPayslipManager(ctx.user);
      let query = `SELECT p.*, e.firstName, e.lastName, e.employeeNumber, e.department, e.position
        FROM payslips p
        LEFT JOIN employees e ON p.employeeId = e.id
        WHERE 1 = 1`;
      const params: any[] = [];

      if (orgId) {
        query += ` AND (p.organizationId = ? OR (p.organizationId IS NULL AND e.organizationId = ?))`;
        params.push(orgId, orgId);
      } else {
        query += " AND p.organizationId IS NULL AND e.organizationId IS NULL";
      }
      if (!canViewAll) {
        query += ` AND e.userId = ?`;
        params.push(ctx.user.id);
      }

      if (input?.employeeId) { query += ` AND p.employeeId = ?`; params.push(input.employeeId); }
      if (input?.payPeriod) { query += ` AND DATE_FORMAT(p.payMonth, '%Y-%m') = ?`; params.push(input.payPeriod); }
      if (input?.startDate) { query += ` AND p.payMonth >= ?`; params.push(input.startDate); }
      if (input?.endDate) { query += ` AND p.payMonth <= ?`; params.push(input.endDate); }
      if (input?.status) { query += ` AND p.status = ?`; params.push(input.status); }
      query += ` ORDER BY p.payMonth DESC LIMIT ? OFFSET ?`;
      params.push(input?.limit || 50, input?.offset || 0);

      const [rows] = await p.query(query, params);
      const employeeIds = [...new Set((rows || []).map((row: any) => row.employeeId).filter(Boolean))];
      const benefitsByEmployee = new Map<string, any[]>();
      if (employeeIds.length) {
        const [benefitRows] = await p.query(
          `SELECT employeeId, benefitType AS name, cost AS amount, employerCost, provider, coverage
           FROM employeeBenefits WHERE employeeId IN (${employeeIds.map(() => "?").join(",")}) AND isActive = 1`,
          employeeIds
        );
        for (const benefit of benefitRows || []) {
          const benefits = benefitsByEmployee.get(benefit.employeeId) || [];
          benefits.push(benefit);
          benefitsByEmployee.set(benefit.employeeId, benefits);
        }
      }
      return Promise.all((rows || []).map(async (row: any) => {
        const payslip = payslipAmounts({
          ...row,
          benefitsBreakdown: JSON.stringify(benefitsByEmployee.get(row.employeeId) || []),
        });
        return {
          ...payslip,
          htmlContent: await renderPayslipForRow(p, payslip, row, orgId),
        };
      }));
    }),

  getById: payrollView
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const p = pool();
      const canViewAll = isPayslipManager(ctx.user);
      let scope = "";
      const params: unknown[] = [input.id];
      if (ctx.user.organizationId && !isGlobalSuperAdmin(ctx.user)) {
        scope = " AND (p.organizationId = ? OR (p.organizationId IS NULL AND e.organizationId = ?))";
        params.push(ctx.user.organizationId, ctx.user.organizationId);
      } else {
        scope = " AND p.organizationId IS NULL AND e.organizationId IS NULL";
      }
      if (!canViewAll) {
        scope += " AND e.userId = ?";
        params.push(ctx.user.id);
      }
      const [rows] = await p.query(
        `SELECT p.*, e.firstName, e.lastName, e.employeeNumber, e.department, e.position,
                e.bankName, e.bankBranch, e.bankAccountNumber, e.nhifNumber, e.nssfNumber, e.taxId
         FROM payslips p
         LEFT JOIN employees e ON p.employeeId = e.id
         WHERE p.id = ?${scope}`, params
      );
      const row = rows?.[0];
      if (!row) return null;
      const [benefitRows] = await p.query(
        `SELECT benefitType AS name, cost AS amount, provider, coverage FROM employeeBenefits WHERE employeeId = ? AND isActive = 1`,
        [row.employeeId]
      );
      const payslip = payslipAmounts({ ...row, benefitsBreakdown: JSON.stringify(benefitRows || []) });
      return { ...payslip, htmlContent: await renderPayslipForRow(p, payslip, row, ctx.user.organizationId) };
    }),

  getAccessible: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const p = pool();
      const canViewAll = isPayslipManager(ctx.user);
      const slugMatch = input.id.match(/^payslip-([a-z]+)-(\d{4})(?:-(.*))?$/i);
      const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
      const slugPeriod = slugMatch ? `${slugMatch[2]}-${String(monthNames.indexOf(slugMatch[1].toLowerCase()) + 1).padStart(2, "0")}` : null;
      const employeeSlug = slugMatch?.[3] || "";
      const params: any[] = slugPeriod ? [slugPeriod, slugPeriod] : [input.id];
      let query = `SELECT p.*, e.firstName, e.lastName, e.employeeNumber, e.department, e.position,
                e.bankName, e.bankBranch, e.bankAccountNumber, e.nhifNumber, e.nssfNumber, e.taxId
         FROM payslips p
         LEFT JOIN employees e ON p.employeeId = e.id
         WHERE ${slugPeriod ? "(p.payPeriod = ? OR DATE_FORMAT(p.payMonth, '%Y-%m') = ?)" : "p.id = ?"}`;
      if (ctx.user.organizationId && !isGlobalSuperAdmin(ctx.user)) {
        query += " AND (p.organizationId = ? OR (p.organizationId IS NULL AND e.organizationId = ?))";
        params.push(ctx.user.organizationId, ctx.user.organizationId);
      } else {
        query += " AND p.organizationId IS NULL AND e.organizationId IS NULL";
      }
      if (!canViewAll) {
        query += " AND e.userId = ?";
        params.push(ctx.user.id);
      }
      const [rows] = await p.query(query, params);
      const row = employeeSlug
        ? (rows || []).find((candidate: any) =>
          employeeSlugKey(`${candidate.firstName}-${candidate.lastName}`) === employeeSlugKey(employeeSlug)
        )
        : rows?.[0];
      if (!row) return null;
      const [benefitRows] = await p.query(
        `SELECT benefitType AS name, cost AS amount, provider, coverage FROM employeeBenefits WHERE employeeId = ? AND isActive = 1`,
        [row.employeeId]
      );
      return {
        ...staffPayslipValues(row),
        allowancesBreakdown: displayBreakdown(row.allowancesBreakdown),
        deductionsBreakdown: displayBreakdown(row.deductionsBreakdown),
        benefitsBreakdown: displayBreakdown(benefitRows || []),
        htmlContent: await renderPayslipForRow(
          p,
          { ...row, benefitsBreakdown: JSON.stringify(benefitRows || []) },
          row,
          ctx.user.organizationId
        ),
      };
    }),

  // Generate payslips for a payroll period
  generate: payrollWrite
    .input(z.object({
      payPeriod: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/), // YYYY-MM
      payDate: z.string(),
      employeeIds: z.array(z.string()).optional(), // if empty, all active employees
    }))
    .mutation(async ({ input, ctx }) => {
      const p = pool();
      const orgId = ctx.user.organizationId;
      const company = await getCompanyInfo();
      const [year, month] = input.payPeriod.split("-").map(Number);
      const payrollRun = await processMonthlyPayroll(year, month, ctx.user.id, orgId ?? null);

      // Get employees
      let empQuery = `SELECT * FROM employees WHERE status = 'active'`;
      const empParams: any[] = [];
      if (orgId) {
        empQuery += ` AND organizationId = ?`;
        empParams.push(orgId);
      } else {
        empQuery += " AND organizationId IS NULL";
      }
      if (input.employeeIds?.length) {
        empQuery += ` AND id IN (${input.employeeIds.map(() => "?").join(",")})`;
        empParams.push(...input.employeeIds);
      }
      const [employees] = await p.query(empQuery, empParams);

      const generated: string[] = [];
      const errors: string[] = payrollRun.errors.map((message) => `Payroll processing: ${message}`);

      if (!employees?.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: input.employeeIds?.length
            ? "No active employees matching the selected employees were found"
            : `No active employees were found for ${input.payPeriod}`,
        });
      }

      for (const emp of (employees || [])) {
        try {
          // Check if payslip already exists
          const [existing] = await p.query(
            `SELECT id FROM payslips WHERE employeeId = ? AND DATE_FORMAT(payMonth, '%Y-%m') = ?`, [emp.id, input.payPeriod]
          );
          if (existing?.length > 0) { errors.push(`Payslip already exists for ${emp.firstName} ${emp.lastName}`); continue; }

          const [payrollRows] = await p.query(
            `SELECT id FROM payroll
             WHERE employeeId = ? AND DATE_FORMAT(payPeriodStart, '%Y-%m') = ?
             ORDER BY createdAt DESC LIMIT 1`,
            [emp.id, input.payPeriod]
          );
          const payrollRecord = (payrollRows as any[])[0];
          if (!payrollRecord) {
            throw new Error(`No payroll record exists for ${input.payPeriod}; check salary setup and run payroll first`);
          }

          // Employee master salary is stored in whole KES; payslip amounts use cents.
          const basicSalary = Math.round(Number(emp.salary || 0) * 100);

          // Get allowances
          const [allowances] = await p.query(
            `SELECT * FROM salaryAllowances WHERE employeeId = ? AND isActive = 1`, [emp.id]
          );
          let totalAllowances = 0;
          const allowancesBreakdown: any[] = [];
          for (const a of (allowances || [])) {
            const monthlyAmountInCents = a.frequency === "quarterly"
              ? Number(a.amount || 0) / 3
              : a.frequency === "annual"
                ? Number(a.amount || 0) / 12
                : Number(a.amount || 0);
            const amount = Math.round(monthlyAmountInCents);
            totalAllowances += amount;
            allowancesBreakdown.push({ name: a.allowanceType || a.allowanceName || a.type, amount });
          }

          // Get deductions
          const [deductions] = await p.query(
            `SELECT * FROM salaryDeductions WHERE employeeId = ? AND isActive = 1`, [emp.id]
          );
          let customDeductions = 0;
          const deductionsBreakdown: any[] = [];
          for (const d of (deductions || [])) {
            const monthlyAmountInCents = d.frequency === "quarterly"
              ? Number(d.amount || 0) / 3
              : d.frequency === "annual"
                ? Number(d.amount || 0) / 12
                : Number(d.amount || 0);
            const amount = Math.round(monthlyAmountInCents);
            customDeductions += amount;
            deductionsBreakdown.push({ name: d.deductionType || d.deductionName || d.type, amount });
          }

          const calculation = calculateKenyanPayroll({ basicSalary, allowances: totalAllowances });
          const grossPay = calculation.grossSalary;
          const nssf = calculation.nssfContribution;
          const nhif = calculation.shifContribution;
          const housingLevy = calculation.housingLevyDeduction;
          const paye = calculation.payeeTax;

          deductionsBreakdown.push({ name: "PAYE", amount: paye });
          deductionsBreakdown.push({ name: "NSSF Tier 1", amount: calculation.details.nssfTier1 });
          deductionsBreakdown.push({ name: "NSSF Tier 2", amount: calculation.details.nssfTier2 });
          deductionsBreakdown.push({ name: "NHIF/SHIF", amount: nhif });
          deductionsBreakdown.push({ name: "Housing Levy", amount: housingLevy });

          const totalDeductions = paye + nssf + nhif + housingLevy + customDeductions;
          const netPay = grossPay - totalDeductions;

          const [benefits] = await p.query(
            `SELECT benefitType AS name, employerCost FROM employeeBenefits WHERE employeeId = ? AND isActive = 1`,
            [emp.id]
          );
          const employerContributionRows = [
            ...(nssf > 0 ? [{ name: "Employer NSSF", amount: nssf }] : []),
            ...(housingLevy > 0 ? [{ name: "Employer Housing Levy", amount: housingLevy }] : []),
            ...(benefits || [])
              .filter((benefit: any) => Number(benefit.employerCost || 0) > 0)
              .map((benefit: any) => ({ name: `${benefit.name || "Benefit"} (Employer)`, amount: Number(benefit.employerCost) })),
          ];
          const generatedHtml = generatePayslipHTML({
            payPeriod: input.payPeriod,
            payDate: input.payDate,
            employee: { name: `${emp.firstName} ${emp.lastName}`, id: emp.employeeNumber, department: emp.department || "", position: emp.position || "", bankName: emp.bankName || "", bankAccount: emp.bankAccountNumber || "", nssfNumber: emp.nssfNumber || "", nhifNumber: emp.nhifNumber || "", taxPin: emp.taxId || "", nationalId: emp.nationalId || "" },
            company: { name: company.name, address: company.address, logo: company.logo, employerContributions: employerContributionRows },
            earnings: { basicSalary, allowances: allowancesBreakdown, grossSalary: grossPay },
            deductions: {
              paye, nssf, nssfTier1: calculation.details.nssfTier1, nssfTier2: calculation.details.nssfTier2,
              shif: nhif, housingLevy, personalRelief: calculation.personalRelief, total: totalDeductions,
              additional: deductionsBreakdown.filter((item) => !isStatutoryDeduction(item) && item.type !== "benefit"),
            },
            netSalary: netPay,
          });
          const htmlContent = await renderSavedPayslipTemplate(p, generatedHtml, {
            company_name: company.name, company_email: company.email, company_phone: company.phone, company_address: company.address, company_website: company.website, company_logo: company.logo, employee_name: `${emp.firstName} ${emp.lastName}`, employee_number: emp.employeeNumber || "", department: emp.department || "", position: emp.position || "", pay_period: input.payPeriod, pay_date: input.payDate, payslip_number: `${emp.employeeNumber}-${input.payPeriod}`, basic_salary: `KES ${(basicSalary / 100).toLocaleString()}`, allowances: `KES ${(totalAllowances / 100).toLocaleString()}`, gross_salary: `KES ${(grossPay / 100).toLocaleString()}`, paye: `KES ${(paye / 100).toLocaleString()}`, nssf: `KES ${(nssf / 100).toLocaleString()}`, nhif: `KES ${(nhif / 100).toLocaleString()}`, total_deductions: `KES ${(totalDeductions / 100).toLocaleString()}`, net_salary: `KES ${(netPay / 100).toLocaleString()}`,
          }, orgId);

          const id = uuidv4();
          const [year, month] = input.payPeriod.split("-").map(Number);
          const payPeriodStart = `${input.payPeriod}-01 00:00:00`;
          const payPeriodEnd = new Date(Date.UTC(year, month, 0)).toISOString().replace("T", " ").substring(0, 19);
          const payMonth = payPeriodStart;
          const payslipNumber = `${emp.employeeNumber || emp.id}-${input.payPeriod}-${id.slice(0, 8)}`;
          const payDate = `${input.payDate.slice(0, 10)} 00:00:00`;
          const payslipOrganizationId = emp.organizationId || orgId || null;
          await p.query(
            `INSERT INTO payslips (
              id, payrollId, organizationId, employeeId, payslipNumber,
              payPeriod, payDate, payPeriodStart, payPeriodEnd, payMonth, basicSalary,
              allowances, bonuses, grossSalary, nssfDeduction, nhifDeduction,
              payeDeduction, totalDeductions, netSalary, bankName, bankAccountNumber,
              allowancesBreakdown, deductionsBreakdown, htmlContent, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'generated')`,
            [id, payrollRecord.id, payslipOrganizationId, emp.id, payslipNumber, input.payPeriod, payDate, payPeriodStart, payPeriodEnd, payMonth, basicSalary, totalAllowances, grossPay, nssf, nhif, paye, totalDeductions, netPay, emp.bankName || null, emp.bankAccountNumber || null, JSON.stringify(allowancesBreakdown), JSON.stringify(deductionsBreakdown), htmlContent]
          );
          generated.push(id);
        } catch (err: any) {
          console.error(`[PAYSLIPS] Generation failed for employee ${emp.id} (${input.payPeriod}):`, err);
          errors.push(`Error for ${emp.firstName} ${emp.lastName}: ${err?.message || "Payslip could not be saved"}`);
        }
      }

      if (generated.length === 0 && errors.length > 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `No payslips were generated. ${errors.slice(0, 3).join("; ")}`,
        });
      }

      return { generated: generated.length, errors, payslipIds: generated };
    }),

  // Send payslips to employees via email
  sendPayslips: payrollWrite
    .input(z.object({
      payslipIds: z.array(z.string()),
    }))
    .mutation(async ({ input, ctx }) => {
      const p = pool();
      let sent = 0;
      const errors: string[] = [];

      for (const payslipId of input.payslipIds) {
        try {
          const [rows] = await p.query(
            `SELECT p.*, e.email, e.firstName, e.lastName, e.employeeNumber, e.department, e.position, e.bankName, e.bankAccountNumber FROM payslips p LEFT JOIN employees e ON p.employeeId = e.id WHERE p.id = ?`,
            [payslipId]
          );
          const payslip = rows?.[0];
          if (!payslip?.email) { errors.push(`No email for payslip ${payslipId}`); continue; }

          const company = await getCompanyInfo();
          const renderedPayslipHtml = await renderPayslipForRow(p, payslip, payslip, ctx.user.organizationId);
          const periodDates = payPeriodDates(payslip.payPeriod);
          const pdfFilename = `payslip-${payslip.payPeriod || "period"}-${payslip.firstName || "employee"}-${payslip.lastName || ""}.pdf`.replace(/\s+/g, "-");
          const renderedEmail = await renderNotificationTemplate("payslip", {
            company: { ...company },
            company_name: company.name,
            company_email: company.email,
            company_phone: company.phone,
            company_address: company.address,
            company_logo: company.logo,
            company_logo_url: company.logo,
            app_name: company.name,
            employee_name: `${payslip.firstName} ${payslip.lastName}`,
            recipient_name: `${payslip.firstName} ${payslip.lastName}`,
            pay_period: payslip.payPeriod,
            pay_period_label: periodDates.label,
            pay_period_start: periodDates.start,
            pay_period_end: periodDates.end,
            pay_date: payslip.payDate,
            payment_date: payslip.payDate,
            basic_salary: money(payslip.basicSalary),
            allowances: money(Number(payslip.totalAllowances || 0)),
            gross_salary: money(firstAmount(payslip.grossSalary, payslip.grossPay)),
            gross_pay: money(firstAmount(payslip.grossSalary, payslip.grossPay)),
            total_deductions: money(payslip.totalDeductions),
            net_salary: money(firstAmount(payslip.netSalary, payslip.netPay)),
            net_pay: money(firstAmount(payslip.netSalary, payslip.netPay)),
            payslip_pdf_filename: pdfFilename,
            payslip_url: "",
            organizationId: ctx.user.organizationId,
          }, {
            subject: `Payslip - ${payslip.payPeriod}`,
            html: `<p>Dear {{employee_name}},</p><p>Your payslip for {{pay_period}} is ready.</p><p>Net Pay: <strong>{{net_salary}}</strong></p>`,
          });
          const { sendEmail } = await import("../_core/mail");
          const emailResult = await sendEmail({
            to: payslip.email,
            subject: renderedEmail.subject,
            html: renderedEmail.html,
            text: renderedEmail.text,
            attachments: [{ filename: pdfFilename, content: await renderHtmlToPdf(renderedPayslipHtml), contentType: "application/pdf" }],
          });
          if (!emailResult.success) {
            throw new Error(emailResult.error || "Email provider did not confirm delivery");
          }

          await p.query(`UPDATE payslips SET status = 'sent', sentAt = NOW() WHERE id = ?`, [payslipId]);
          sent++;
        } catch (err: any) {
          errors.push(`Failed to send ${payslipId}: ${err.message}`);
        }
      }

      return { sent, errors, total: input.payslipIds.length };
    }),

  // Delete a payslip
  delete: payrollWrite
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const p = pool();
      await p.query(`DELETE FROM payslips WHERE id = ?`, [input.id]);
      return { success: true };
    }),

  // Bulk generate for all active employees
  bulkGenerate: payrollWrite
    .input(z.object({
      payPeriod: z.string(),
      payDate: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const result = await payslipRouter.createCaller(ctx).generate({
        payPeriod: input.payPeriod,
        payDate: input.payDate,
      });
      return { ...result, employeeCount: result.generated };
    }),

  // ── STAFF: Add or update notes on payslip ──────────────────────────────
  addNote: protectedProcedure
    .input(z.object({
      payslipId: z.string(),
      note: z.string().max(500),
    }))
    .mutation(async ({ ctx, input }) => {
      const p = pool();
      if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });

      try {
        // Verify user is the employee who owns this payslip
        const [rows] = await p.query(
          `SELECT p.id FROM payslips p
           INNER JOIN employees e ON p.employeeId = e.id
           WHERE p.id = ? AND e.userId = ? LIMIT 1`,
          [input.payslipId, ctx.user.id]
        );

        if (!rows || (rows as any[]).length === 0) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You don't have access to this payslip" });
        }

        // Update notes
        await p.query(
          `UPDATE payslips SET notes = ? WHERE id = ?`,
          [input.note, input.payslipId]
        );

        return { success: true, message: "Note added to payslip" };
      } catch (error: any) {
        if (error.code) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to add note: ${error?.message}`,
        });
      }
    }),

  // ── HR: Export payslip as PDF ──────────────────────────────────────────
  exportAsPDF: payrollView
    .input(z.object({ payslipId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const p = pool();
      const orgId = ctx.user.organizationId;
      const canViewAll = isPayslipManager(ctx.user);

      try {
        let query = `SELECT p.*, e.firstName, e.lastName, e.email FROM payslips p
           LEFT JOIN employees e ON p.employeeId = e.id
           WHERE p.id = ?`;
        const params: unknown[] = [input.payslipId];
        if (orgId) {
          query += " AND (p.organizationId = ? OR (p.organizationId IS NULL AND e.organizationId = ?))";
          params.push(orgId, orgId);
        } else {
          query += " AND p.organizationId IS NULL AND e.organizationId IS NULL";
        }
        if (!canViewAll) {
          query += " AND e.userId = ?";
          params.push(ctx.user.id);
        }
        query += " LIMIT 1";
        const [rows] = await p.query(query, params);

        const payslip = (rows as any[])?.[0];
        if (!payslip) throw new TRPCError({ code: "NOT_FOUND", message: "Payslip not found" });

        // Return HTML content that client can convert to PDF using html2pdf or similar
        // The actual PDF conversion happens on the client side with a library like html2pdf
        return {
          htmlContent: await renderPayslipForRow(p, payslip, payslip, orgId),
          fileName: `Payslip_${payslip.firstName}_${payslip.lastName}_${payslip.payPeriod}.pdf`,
          employeeName: `${payslip.firstName} ${payslip.lastName}`,
          payPeriod: payslip.payPeriod,
        };
      } catch (error: any) {
        if (error.code === "NOT_FOUND") throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to export payslip: ${error?.message}`,
        });
      }
    }),

  // ── STAFF: Request reprint of previous payslip ──────────────────────────
  requestReprint: protectedProcedure
    .input(z.object({
      payslipId: z.string(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const p = pool();
      if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });

      try {
        // Verify user owns this payslip
        const [rows] = await p.query(
          `SELECT p.id, p.payMonth AS payPeriod FROM payslips p
           INNER JOIN employees e ON p.employeeId = e.id
           WHERE p.id = ? AND e.userId = ? LIMIT 1`,
          [input.payslipId, ctx.user.id]
        );

        if (!rows || (rows as any[]).length === 0) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You don't have access to this payslip" });
        }

        const payslip = (rows as any[])[0];

        // Create a notification for HR
        await createNotification({
          userId: ctx.user.id,
          title: "Payslip Reprint Requested",
          message: `Reprint requested for payslip ${payslip.payPeriod}. ${input.reason ? `Reason: ${input.reason}` : ""}`,
          type: "info",
          organizationId: ctx.user.organizationId,
        });

        console.log(
          `[PAYSLIPS] Reprint requested for payslip ${input.payslipId} by employee ${ctx.user.id}`
        );

        return {
          success: true,
          message: "Reprint request submitted. HR will contact you soon.",
        };
      } catch (error: any) {
        if (error.code) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to request reprint: ${error?.message}`,
        });
      }
    }),

  // ── HR: Get payslip reprint requests ───────────────────────────────────
  getReprintRequests: payrollView.query(async ({ ctx }) => {
    const p = pool();
    const orgId = ctx.user.organizationId;

    try {
      // This would require a separate reprintRequests table to track
      // For now, we'll return a placeholder
      return {
        requests: [],
        message: "Reprint requests are tracked via notifications system",
      };
    } catch (error: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to fetch requests: ${error?.message}`,
      });
    }
  }),
});
