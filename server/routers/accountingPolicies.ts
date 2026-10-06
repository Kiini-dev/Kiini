import { router, protectedProcedure } from "../_core/trpc";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { z } from "zod";
import { getDb, getPool } from "../db";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import * as db from "../db";
import { TRPCError } from "@trpc/server";
import { globalAccountingPolicies, organizationAccountingPolicies } from "../../drizzle/schema";

/**
 * Accounting Policies Configuration Router
 * Allows organizations to define and enforce accounting policies
 * Supports multi-country compliance requirements
 */

const readProcedure = createFeatureRestrictedProcedure("accounting:policies:read");
const updateProcedure = createFeatureRestrictedProcedure("accounting:policies:update");

type PolicyUser = { id: string; role?: string; effectiveRole?: string; organizationId?: string | null };

export function resolveOrganizationPolicyScope(user: PolicyUser) {
  if (!user.organizationId) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Organization accounting policies require an organization context. Open this page from the organization workspace.",
    });
  }
  return user.organizationId;
}

export function assertGlobalPolicyScope(user: PolicyUser) {
  if (user.organizationId || (user.role !== "super_admin" && user.effectiveRole !== "super_admin")) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Global accounting policies are only available to Kiini platform administrators." });
  }
}

function countryCode(country?: string | null) {
  const normalized = country?.trim().toLowerCase();
  const codes: Record<string, string> = {
    kenya: "KE",
    nigeria: "NG",
    "south africa": "ZA",
    uganda: "UG",
  };
  if (!normalized) return "KE";
  const code = codes[normalized] ?? normalized.toUpperCase();
  return ["KE", "NG", "ZA", "UG"].includes(code) ? code : "KE";
}

export const accountingPoliciesRouter = router({
  // Get organization's accounting policies
  getOrgPolicies: readProcedure
    .query(async ({ ctx }) => {
      const orgId = resolveOrganizationPolicyScope(ctx.user);
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const organization = await db.getOrganization(orgId);
      const result = await database.select().from(organizationAccountingPolicies)
        .where(eq(organizationAccountingPolicies.organizationId, orgId)).limit(1);

      return result[0] || {
        organizationId: orgId,
        country: countryCode(organization?.country),
        fiscalYearStart: "01-01",
        fiscalYearEnd: "12-31",
        accountingMethod: "accrual",
        defaultCurrency: "KES",
        taxInclusiveInvoicing: true,
        autoReconciliation: false,
        requireInvoiceApproval: true,
        requireExpenseApproval: true,
        defaultPaymentTerms: "net30",
        depreciationMethod: "straight_line",
        capitalizedAssetThreshold: 50000,
        roundingMethod: "round",
        retentionPeriod: 7,
        auditTrailRequired: true,
        allowManualJournalEntries: true,
      };
    }),

  getGlobalPolicies: readProcedure
    .query(async ({ ctx }) => {
      assertGlobalPolicyScope(ctx.user);
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const [policy] = await database.select().from(globalAccountingPolicies)
        .where(eq(globalAccountingPolicies.id, "global")).limit(1);
      return policy || {
        id: "global",
        country: "KE",
        fiscalYearStart: "01-01",
        fiscalYearEnd: "12-31",
        accountingMethod: "accrual",
        defaultCurrency: "KES",
        taxInclusiveInvoicing: true,
        autoReconciliation: false,
        requireInvoiceApproval: true,
        requireExpenseApproval: true,
        defaultPaymentTerms: "net30",
        depreciationMethod: "straight_line",
        capitalizedAssetThreshold: 50000,
        roundingMethod: "round",
        retentionPeriod: 7,
        auditTrailRequired: true,
        allowManualJournalEntries: true,
      };
    }),

  // Create/Update policies
  updatePolicies: updateProcedure
    .input(z.object({
      country: z.string(),
      fiscalYearStart: z.string().optional(),
      fiscalYearEnd: z.string().optional(),
      accountingMethod: z.enum(["accrual", "cash"]).optional(),
      defaultCurrency: z.string().optional(),
      taxInclusiveInvoicing: z.boolean().optional(),
      autoReconciliation: z.boolean().optional(),
      requireInvoiceApproval: z.boolean().optional(),
      requireExpenseApproval: z.boolean().optional(),
      defaultPaymentTerms: z.string().optional(),
      depreciationMethod: z.enum(["straight_line", "declining_balance", "units_of_production"]).optional(),
      capitalizedAssetThreshold: z.number().optional(),
      roundingMethod: z.enum(["round", "truncate"]).optional(),
      retentionPeriod: z.number().optional(), // in years
      auditTrailRequired: z.boolean().optional(),
      allowManualJournalEntries: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const orgId = resolveOrganizationPolicyScope(ctx.user);
      const policyInput = input;
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

      const existing = await database.select({ id: organizationAccountingPolicies.id })
        .from(organizationAccountingPolicies)
        .where(eq(organizationAccountingPolicies.organizationId, orgId)).limit(1);

      const policyData = {
        organizationId: orgId,
        country: policyInput.country,
        fiscalYearStart: policyInput.fiscalYearStart ?? "01-01",
        fiscalYearEnd: policyInput.fiscalYearEnd ?? "12-31",
        accountingMethod: policyInput.accountingMethod ?? "accrual",
        defaultCurrency: policyInput.defaultCurrency ?? "KES",
        taxInclusiveInvoicing: policyInput.taxInclusiveInvoicing ?? true,
        autoReconciliation: policyInput.autoReconciliation ?? false,
        requireInvoiceApproval: policyInput.requireInvoiceApproval ?? true,
        requireExpenseApproval: policyInput.requireExpenseApproval ?? true,
        defaultPaymentTerms: policyInput.defaultPaymentTerms ?? "net30",
        depreciationMethod: policyInput.depreciationMethod ?? "straight_line",
        capitalizedAssetThreshold: policyInput.capitalizedAssetThreshold ?? 50000,
        roundingMethod: policyInput.roundingMethod ?? "round",
        retentionPeriod: policyInput.retentionPeriod ?? 7,
        auditTrailRequired: policyInput.auditTrailRequired ?? true,
        allowManualJournalEntries: policyInput.allowManualJournalEntries ?? true,
        updatedBy: ctx.user.id,
        updatedAt: now,
      };

      if (existing.length > 0) {
        await database.update(organizationAccountingPolicies).set(policyData)
          .where(eq(organizationAccountingPolicies.organizationId, orgId));
      } else {
        await database.insert(organizationAccountingPolicies).values({
          id: uuidv4(),
          ...policyData,
          createdBy: ctx.user.id,
          createdAt: now,
        });
      }

      await db.logActivity({
        userId: ctx.user.id,
        action: "accounting_policies_updated",
        entityType: "organizationPolicy",
        entityId: orgId,
        description: `Accounting policies updated for ${policyInput.country}`,
      });

      return { success: true };
    }),

  updateGlobalPolicies: updateProcedure
    .input(z.object({
      country: z.string(),
      fiscalYearStart: z.string().optional(),
      fiscalYearEnd: z.string().optional(),
      accountingMethod: z.enum(["accrual", "cash"]).optional(),
      defaultCurrency: z.string().optional(),
      taxInclusiveInvoicing: z.boolean().optional(),
      autoReconciliation: z.boolean().optional(),
      requireInvoiceApproval: z.boolean().optional(),
      requireExpenseApproval: z.boolean().optional(),
      defaultPaymentTerms: z.string().optional(),
      depreciationMethod: z.enum(["straight_line", "declining_balance", "units_of_production"]).optional(),
      capitalizedAssetThreshold: z.number().optional(),
      roundingMethod: z.enum(["round", "truncate"]).optional(),
      retentionPeriod: z.number().optional(),
      auditTrailRequired: z.boolean().optional(),
      allowManualJournalEntries: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      assertGlobalPolicyScope(ctx.user);
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const [existing] = await database.select({ id: globalAccountingPolicies.id })
        .from(globalAccountingPolicies)
        .where(eq(globalAccountingPolicies.id, "global")).limit(1);

      const policyData = {
        country: input.country,
        fiscalYearStart: input.fiscalYearStart ?? "01-01",
        fiscalYearEnd: input.fiscalYearEnd ?? "12-31",
        accountingMethod: input.accountingMethod ?? "accrual",
        defaultCurrency: input.defaultCurrency ?? "KES",
        taxInclusiveInvoicing: input.taxInclusiveInvoicing ?? true,
        autoReconciliation: input.autoReconciliation ?? false,
        requireInvoiceApproval: input.requireInvoiceApproval ?? true,
        requireExpenseApproval: input.requireExpenseApproval ?? true,
        defaultPaymentTerms: input.defaultPaymentTerms ?? "net30",
        depreciationMethod: input.depreciationMethod ?? "straight_line",
        capitalizedAssetThreshold: input.capitalizedAssetThreshold ?? 50000,
        roundingMethod: input.roundingMethod ?? "round",
        retentionPeriod: input.retentionPeriod ?? 7,
        auditTrailRequired: input.auditTrailRequired ?? true,
        allowManualJournalEntries: input.allowManualJournalEntries ?? true,
        updatedBy: ctx.user.id,
        updatedAt: now,
      };

      if (existing) {
        await database.update(globalAccountingPolicies).set(policyData)
          .where(eq(globalAccountingPolicies.id, "global"));
      } else {
        await database.insert(globalAccountingPolicies).values({
          id: "global",
          ...policyData,
          createdBy: ctx.user.id,
          createdAt: now,
        });
      }

      await db.logActivity({
        userId: ctx.user.id,
        action: "global_accounting_policies_updated",
        entityType: "globalAccountingPolicy",
        entityId: "global",
        description: `Global accounting policies updated for ${input.country}`,
      });
      return { success: true };
    }),

  // Get country-specific policy templates
  getPolicyTemplate: readProcedure
    .input(z.object({
      country: z.string(),
    }))
    .query(async ({ input }) => {
      const templates: any = {
        KE: {
          country: "Kenya",
          fiscalYearStart: "01-01",
          fiscalYearEnd: "12-31",
          accountingMethod: "accrual",
          defaultCurrency: "KES",
          taxInclusiveInvoicing: true,
          autoReconciliation: true,
          requireInvoiceApproval: true,
          requireExpenseApproval: true,
          defaultPaymentTerms: "net30",
          depreciationMethod: "straight_line",
          capitalizedAssetThreshold: 50000,
          retentionPeriod: 5,
          auditTrailRequired: true,
          allowManualJournalEntries: false,
          complianceNotes: "Align with Kenya Revenue Authority requirements",
        },
        NG: {
          country: "Nigeria",
          fiscalYearStart: "01-01",
          fiscalYearEnd: "12-31",
          accountingMethod: "accrual",
          defaultCurrency: "NGN",
          taxInclusiveInvoicing: false,
          autoReconciliation: true,
          requireInvoiceApproval: true,
          requireExpenseApproval: true,
          defaultPaymentTerms: "net30",
          depreciationMethod: "declining_balance",
          capitalizedAssetThreshold: 100000,
          retentionPeriod: 5,
          auditTrailRequired: true,
          allowManualJournalEntries: false,
          complianceNotes: "Align with FIRS requirements",
        },
        ZA: {
          country: "South Africa",
          fiscalYearStart: "03-01",
          fiscalYearEnd: "02-28",
          accountingMethod: "accrual",
          defaultCurrency: "ZAR",
          taxInclusiveInvoicing: true,
          autoReconciliation: true,
          requireInvoiceApproval: true,
          requireExpenseApproval: true,
          defaultPaymentTerms: "net30",
          depreciationMethod: "straight_line",
          capitalizedAssetThreshold: 100000,
          retentionPeriod: 5,
          auditTrailRequired: true,
          allowManualJournalEntries: false,
          complianceNotes: "Align with SARS requirements",
        },
        UG: {
          country: "Uganda",
          fiscalYearStart: "07-01",
          fiscalYearEnd: "06-30",
          accountingMethod: "accrual",
          defaultCurrency: "UGX",
          taxInclusiveInvoicing: true,
          autoReconciliation: true,
          requireInvoiceApproval: true,
          requireExpenseApproval: true,
          defaultPaymentTerms: "net30",
          depreciationMethod: "straight_line",
          capitalizedAssetThreshold: 5000000,
          retentionPeriod: 5,
          auditTrailRequired: true,
          allowManualJournalEntries: false,
          complianceNotes: "Align with URA requirements",
        },
      };

      return templates[input.country] || templates.KE;
    }),

  // Enforce policy compliance check
  checkPolicyCompliance: readProcedure
    .input(z.object({
      entityType: z.enum(["invoice", "expense"]),
      entityId: z.string(),
      organizationId: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const organizationId = ctx.user.organizationId || null;
      let policy: any;
      if (organizationId) {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const [organizationPolicy] = await database.select().from(organizationAccountingPolicies)
          .where(eq(organizationAccountingPolicies.organizationId, organizationId)).limit(1);
        policy = organizationPolicy;
      } else {
        assertGlobalPolicyScope(ctx.user);
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const [globalPolicy] = await database.select().from(globalAccountingPolicies)
          .where(eq(globalAccountingPolicies.id, "global")).limit(1);
        policy = globalPolicy;
      }
      const pool = getPool();
      if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const approvalSetting = input.entityType === "invoice"
        ? policy?.requireInvoiceApproval
        : policy?.requireExpenseApproval;
      const requireApproval = approvalSetting == null ? true : Number(approvalSetting) === 1;
      const issues: string[] = [];
      const scopeSql = organizationId ? "organizationId=?" : "organizationId IS NULL";
      const parameters = organizationId ? [input.entityId, organizationId] : [input.entityId];

      if (input.entityType === "invoice") {
        const [rows] = await pool.query(
          `SELECT id, approvedBy FROM invoices WHERE id=? AND ${scopeSql} LIMIT 1`,
          parameters,
        );
        const invoice = (rows as any[])[0];
        if (!invoice) throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found in the selected organization." });
        if (requireApproval && !invoice.approvedBy) issues.push("Invoice requires approval before finalizing");
      } else {
        const [rows] = await pool.query(
          `SELECT id, status, approvedBy FROM expenses WHERE id=? AND ${scopeSql} LIMIT 1`,
          parameters,
        );
        const expense = (rows as any[])[0];
        if (!expense) throw new TRPCError({ code: "NOT_FOUND", message: "Expense not found in the selected organization." });
        if (requireApproval && (expense.status !== "approved" || !expense.approvedBy)) {
          issues.push("Expense requires approval before recording");
        }
      }

      return {
        compliant: issues.length === 0,
        issues,
        policy: {
          country: policy?.country ?? "KE",
          accountingMethod: policy?.accountingMethod ?? "accrual",
          auditTrailRequired: policy?.auditTrailRequired ?? 1,
        },
      };
    }),
});
