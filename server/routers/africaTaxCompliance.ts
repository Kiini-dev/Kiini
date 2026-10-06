import { router, protectedProcedure } from "../_core/trpc";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { z } from "zod";
import { getDb } from "../db";
import { eq, and, desc, gte, lte, sum } from "drizzle-orm";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

/**
 * Africa-focused Tax Compliance & Statutory Reporting Router
 * Supports compliance requirements for multiple African countries
 * Includes: VAT, PAYE, Corporate Tax, Housing Levy, NSSF, etc.
 */

const readProcedure = createFeatureRestrictedProcedure("accounting:taxCompliance:read");
const reportProcedure = createFeatureRestrictedProcedure("accounting:taxCompliance:report");
const exportProcedure = createFeatureRestrictedProcedure("accounting:taxCompliance:export");

// Country-specific tax configuration
const TAX_CONFIG: any = {
  KE: {
    countryName: "Kenya",
    currency: "KES",
    vat: 0.16,
    vat_exempt: 0.0,
    corporate_tax: 0.30,
    paye_min: 0,
    paye_max: 0.30,
    housing_levy: 0.015,
    nssf: 0.06,
    shif: 0.005,
    regulatory_body: "KRA (Kenya Revenue Authority)",
    filing_frequency: "monthly",
    fiscal_year: "01-01 to 12-31",
  },
  UG: {
    countryName: "Uganda",
    currency: "UGX",
    vat: 0.18,
    corporate_tax: 0.30,
    paye_min: 0,
    paye_max: 0.30,
    nssf: 0.10,
    regulatory_body: "URA (Uganda Revenue Authority)",
    filing_frequency: "monthly",
    fiscal_year: "01-01 to 12-31",
  },
  NG: {
    countryName: "Nigeria",
    currency: "NGN",
    vat: 0.075,
    corporate_tax: 0.30,
    paye_min: 0,
    paye_max: 0.24,
    regulatory_body: "FIRS (Federal Inland Revenue Service)",
    filing_frequency: "quarterly",
    fiscal_year: "01-01 to 12-31",
  },
  GH: {
    countryName: "Ghana",
    currency: "GHS",
    vat: 0.125,
    corporate_tax: 0.25,
    paye_min: 0,
    paye_max: 0.21,
    regulatory_body: "GRA (Ghana Revenue Authority)",
    filing_frequency: "monthly",
    fiscal_year: "01-01 to 12-31",
  },
  TZ: {
    countryName: "Tanzania",
    currency: "TZS",
    vat: 0.18,
    corporate_tax: 0.30,
    paye_min: 0,
    paye_max: 0.30,
    nssf: 0.10,
    regulatory_body: "TRA (Tanzania Revenue Authority)",
    filing_frequency: "monthly",
    fiscal_year: "01-01 to 12-31",
  },
  ZA: {
    countryName: "South Africa",
    currency: "ZAR",
    vat: 0.15,
    corporate_tax: 0.28,
    paye_min: 0,
    paye_max: 0.45,
    regulatory_body: "SARS (South African Revenue Service)",
    filing_frequency: "monthly",
    fiscal_year: "03-01 to 02-28",
  },
};

export const taxComplianceRouter = router({
  // Get tax configuration for a country
  getTaxConfig: readProcedure
    .input(z.object({
      country: z.string().default("KE"),
    }))
    .query(async ({ input }) => {
      return TAX_CONFIG[input.country] || TAX_CONFIG.KE;
    }),

  // Get VAT report
  getVATReport: reportProcedure
    .input(z.object({
      startDate: z.string(),
      endDate: z.string(),
      country: z.string().default("KE"),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) return null;

        const orgId = ctx.user.organizationId;
        const config = TAX_CONFIG[input.country];

        // Get all invoices in period
        const invoices = await (db.select().from("invoices" as any)
          .where(and(
            orgId ? eq("invoices.organizationId" as any, orgId) : undefined,
            gte("invoices.createdAt" as any, input.startDate),
            lte("invoices.createdAt" as any, input.endDate)
          )) as any);

        let totalSales = 0;
        let totalVAT = 0;
        let exemptSales = 0;

        invoices.forEach((inv: any) => {
          totalSales += inv.total || 0;
          totalVAT += inv.taxAmount || 0;
        });

        const vatPayable = totalVAT;

        return {
          country: input.country,
          period: { startDate: input.startDate, endDate: input.endDate },
          totalSales,
          exemptSales,
          standardRatedSales: totalSales - exemptSales,
          vatRate: (config.vat * 100) + "%",
          totalVAT,
          vatPayable,
          dueDate: new Date(new Date(input.endDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: "Due for Filing",
        };
      } catch (error) {
        console.error("VAT Report error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate VAT report",
        });
      }
    }),

  // Get Corporate Tax report
  getCorporateTaxReport: reportProcedure
    .input(z.object({
      startDate: z.string(),
      endDate: z.string(),
      country: z.string().default("KE"),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) return null;

        const orgId = ctx.user.organizationId;
        const config = TAX_CONFIG[input.country];

        // Calculate taxable income
        const invoices = await (db.select({ total: sum("invoices.total" as any) }).from("invoices" as any)
          .where(and(
            orgId ? eq("invoices.organizationId" as any, orgId) : undefined,
            gte("invoices.createdAt" as any, input.startDate),
            lte("invoices.createdAt" as any, input.endDate)
          )) as any).limit(1);

        const expenses = await (db.select({ total: sum("expenses.amount" as any) }).from("expenses" as any)
          .where(and(
            orgId ? eq("expenses.organizationId" as any, orgId) : undefined,
            gte("expenses.expenseDate" as any, input.startDate),
            lte("expenses.expenseDate" as any, input.endDate)
          )) as any).limit(1);

        const grossIncome = invoices[0]?.total || 0;
        const allowableExpenses = expenses[0]?.total || 0;
        const taxableIncome = Math.max(0, grossIncome - allowableExpenses);
        const corporateTax = taxableIncome * config.corporate_tax;

        return {
          country: input.country,
          period: { startDate: input.startDate, endDate: input.endDate },
          grossIncome,
          allowableExpenses,
          taxableIncome,
          taxRate: (config.corporate_tax * 100) + "%",
          corporateTaxPayable: corporateTax,
          dueDate: new Date(new Date(input.endDate).getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: "Due for Assessment",
        };
      } catch (error) {
        console.error("Corporate Tax error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate corporate tax report",
        });
      }
    }),

  // Get Payroll Tax Summary (PAYE, NSSF, SHIF, Housing Levy)
  getPayrollTaxSummary: reportProcedure
    .input(z.object({
      startDate: z.string(),
      endDate: z.string(),
      country: z.string().default("KE"),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) return null;

        const config = TAX_CONFIG[input.country];

        // Get payroll data
        const payrolls = await (db.select().from("payroll" as any)
          .where(and(
            gte("payroll.date" as any, input.startDate),
            lte("payroll.date" as any, input.endDate)
          )) as any);

        let totalPAYE = 0;
        let totalNSSF = 0;
        let totalSHIF = 0;
        let totalHousingLevy = 0;
        let totalGrossSalary = 0;

        payrolls.forEach((p: any) => {
          totalGrossSalary += p.grossSalary || 0;
          totalPAYE += p.payeeTax || 0;
          totalNSSF += p.nssfContribution || 0;
          totalSHIF += p.shifContribution || 0;
          totalHousingLevy += p.housingLevyDeduction || 0;
        });

        return {
          country: input.country,
          period: { startDate: input.startDate, endDate: input.endDate },
          totalGrossSalary,
          paye: {
            amount: totalPAYE,
            rate: (config.paye_max * 100) + "%",
            dueDate: new Date(new Date(input.endDate).getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          },
          nssf: {
            amount: totalNSSF,
            rate: config.nssf ? (config.nssf * 100) + "%" : "N/A",
            dueDate: new Date(new Date(input.endDate).getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          },
          shif: {
            amount: totalSHIF,
            rate: config.shif ? (config.shif * 100) + "%" : "N/A",
            dueDate: new Date(new Date(input.endDate).getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          },
          housingLevy: {
            amount: totalHousingLevy,
            rate: config.housing_levy ? (config.housing_levy * 100) + "%" : "N/A",
            dueDate: new Date(new Date(input.endDate).getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          },
          totalDeductions: totalPAYE + totalNSSF + totalSHIF + totalHousingLevy,
        };
      } catch (error) {
        console.error("Payroll Tax Summary error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate payroll tax summary",
        });
      }
    }),

  // Export compliance checklist
  getComplianceChecklist: readProcedure
    .input(z.object({
      country: z.string().default("KE"),
      year: z.number().default(new Date().getFullYear()),
    }))
    .query(async ({ input }) => {
      const config = TAX_CONFIG[input.country];

      // Return country-specific compliance requirements
      const checklists: any = {
        KE: [
          { item: "VAT Registration", frequency: "Once", status: "Completed" },
          { item: "Monthly VAT Returns (Form 201)", frequency: "Monthly", status: "Pending" },
          { item: "Quarterly PAYE Returns (P10)", frequency: "Quarterly", status: "Pending" },
          { item: "Monthly NSSF Contributions", frequency: "Monthly", status: "Pending" },
          { item: "Annual Income Tax Return (ITR)", frequency: "Annual", status: "Pending" },
          { item: "Annual Audit (if required)", frequency: "Annual", status: "Pending" },
          { item: "Corporation Tax Estimate", frequency: "Quarterly", status: "Pending" },
          { item: "Housing Levy Payments", frequency: "Monthly", status: "Pending" },
        ],
        UG: [
          { item: "VAT Registration", frequency: "Once", status: "Completed" },
          { item: "Monthly VAT Returns", frequency: "Monthly", status: "Pending" },
          { item: "Monthly PAYE Returns", frequency: "Monthly", status: "Pending" },
          { item: "Annual Income Tax Return", frequency: "Annual", status: "Pending" },
        ],
        NG: [
          { item: "VAT Registration", frequency: "Once", status: "Completed" },
          { item: "Quarterly VAT Returns", frequency: "Quarterly", status: "Pending" },
          { item: "Quarterly Payroll Tax Returns", frequency: "Quarterly", status: "Pending" },
          { item: "Annual Company Income Tax Return", frequency: "Annual", status: "Pending" },
        ],
      };

      return {
        country: input.country,
        countryName: config.countryName,
        year: input.year,
        regulatoryBody: config.regulatory_body,
        fiscalYear: config.fiscal_year,
        checklist: checklists[input.country] || checklists.KE,
      };
    }),

  // Auto-generate compliance report for audit trail
  generateAuditTrail: exportProcedure
    .input(z.object({
      startDate: z.string(),
      endDate: z.string(),
      country: z.string().default("KE"),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) return null;

        const orgId = ctx.user.organizationId;

        // Get all transactional data for audit trail
        const invoices = await (db.select().from("invoices" as any)
          .where(and(
            orgId ? eq("invoices.organizationId" as any, orgId) : undefined,
            gte("invoices.createdAt" as any, input.startDate),
            lte("invoices.createdAt" as any, input.endDate)
          )) as any);

        const payments = await (db.select().from("payments" as any)
          .where(and(
            orgId ? eq("payments.organizationId" as any, orgId) : undefined,
            gte("payments.paymentDate" as any, input.startDate),
            lte("payments.paymentDate" as any, input.endDate)
          )) as any);

        const expenses = await (db.select().from("expenses" as any)
          .where(and(
            orgId ? eq("expenses.organizationId" as any, orgId) : undefined,
            gte("expenses.expenseDate" as any, input.startDate),
            lte("expenses.expenseDate" as any, input.endDate)
          )) as any);

        return {
          success: true,
          auditTrail: {
            period: { startDate: input.startDate, endDate: input.endDate },
            country: input.country,
            totalInvoices: invoices.length,
            totalPayments: payments.length,
            totalExpenses: expenses.length,
            generatedAt: new Date().toISOString(),
            generatedBy: ctx.user.id,
          },
          message: "Audit trail generated successfully for compliance review",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate audit trail",
        });
      }
    }),
});
