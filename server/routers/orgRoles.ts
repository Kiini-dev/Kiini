/**
 * Organization Roles & Access Control Router
 * Handles org-level role assignments and feature enablement/disablement
 */

import { router, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { organizations, users } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Features that require admin access to manage
const ADMIN_ONLY_FEATURES = [
  "staff",
  "billing",
  "settings",
] as const;

// All available org features for management
const ORG_MANAGEABLE_FEATURES = [
  "crm",
  "crm:view",
  "crm:manage",
  "clients",
  "leads",
  "pipeline",
  "calendar",
  "activity",
  "approvals",
  "invoicing",
  "invoicing:view",
  "invoicing:create",
  "payments",
  "expenses",
  "receipts",
  "estimates",
  "credit_notes",
  "debit_notes",
  "subscriptions",
  "accounting",
  "accounting:view",
  "chart_of_accounts",
  "bank_reconciliation",
  "financial_dashboard",
  "forecasting",
  "tax_compliance",
  "budgets",
  "procurement",
  "procurement:view",
  "suppliers",
  "purchase_orders",
  "orders",
  "lpos",
  "projects",
  "projects:view",
  "tasks",
  "hr",
  "hr:view",
  "employees",
  "attendance",
  "leave",
  "payroll",
  "departments",
  "job_groups",
  "performance_reviews",
  "inventory",
  "inventory:view",
  "products",
  "services",
  "warehouses",
  "support",
  "support:view",
  "tickets",
  "knowledgebase",
  "analytics",
  "analytics:view",
  "reports",
  "communications",
  "communications:view",
  "documents",
  "documents:view",
] as const;

// Procedures with feature access control
const orgSettingsViewProcedure = createFeatureRestrictedProcedure("settings:view");
const orgSettingsEditProcedure = createFeatureRestrictedProcedure("settings:edit");

// Schema for validating role assignments
const RoleAssignmentSchema = z.object({
  organizationId: z.string().min(1, "Organization ID required"),
  userId: z.string().min(1, "User ID required"),
  role: z.enum([
    "super_admin",
    "admin",
    "accountant",
    "hr",
    "staff",
    "client",
    "project_manager",
    "procurement_manager",
    "ict_manager",
    "sales_manager",
  ]),
});

const FeatureMapSchema = z.record(
  z.string(),
  z.boolean()
);

async function getRequiredDb() {
  const database = await getDb();
  if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
  return database;
}

function assertOrganizationAccess(user: { role: string; organizationId?: string | null }, organizationId: string) {
  if (user.role !== "super_admin" && user.organizationId !== organizationId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Organization context does not match the current user" });
  }
}

export const orgRolesRouter = router({
  /**
   * Get all members in an organization with their roles
   */
  getOrgMembers: orgSettingsViewProcedure
    .input(z.string().min(1))
    .query(async ({ ctx, input: organizationId }) => {
      const db = await getRequiredDb();
      assertOrganizationAccess(ctx.user, organizationId);
      
      // Get org to verify access
      const [org] = await db.select().from(organizations).where(eq(organizations.id, organizationId)).limit(1);

      if (!org) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found",
        });
      }

      // Get all members (users linked to org via user.organization_id)
      const members = await db.select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
      }).from(users).where(eq(users.organizationId, organizationId));

      return members;
    }),

  /**
   * Get the feature map for an organization
   * Shows which features are enabled/disabled for this org
   */
  getOrgFeatures: orgSettingsViewProcedure
    .input(z.string().min(1))
    .query(async ({ ctx, input: organizationId }) => {
      const db = await getRequiredDb();
      assertOrganizationAccess(ctx.user, organizationId);

      const [org] = await db.select({ settings: organizations.settings })
        .from(organizations).where(eq(organizations.id, organizationId)).limit(1);

      if (!org) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found",
        });
      }

      const settings = (org.settings as any) || {};
      const featureMap = settings.featureMap || {};

      return {
        organizationId,
        featureMap,
        availableFeatures: ORG_MANAGEABLE_FEATURES,
      };
    }),

  /**
   * Update the feature map for an organization
   * Enable/disable features for all org members
   */
  updateOrgFeatures: orgSettingsEditProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        featureMap: FeatureMapSchema,
      })
    )
    .mutation(async ({ ctx, input: { organizationId, featureMap } }) => {
      const db = await getRequiredDb();
      assertOrganizationAccess(ctx.user, organizationId);

      // Verify user is org admin
      if (ctx.user?.role !== "super_admin" && ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only admins can manage org features",
        });
      }

      // Get org
      const [org] = await db.select().from(organizations).where(eq(organizations.id, organizationId)).limit(1);

      if (!org) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found",
        });
      }

      // Update org settings with new feature map
      const settings = (org.settings as any) || {};
      const updatedSettings = {
        ...settings,
        featureMap: {
          ...settings.featureMap,
          ...featureMap,
        },
      };

      await db.update(organizations)
        .set({ settings: updatedSettings as any })
        .where(eq(organizations.id, organizationId));

      return {
        success: true,
        organizationId,
        featureMap: updatedSettings.featureMap,
      };
    }),

  /**
   * Enable a specific feature for an organization
   */
  enableOrgFeature: orgSettingsEditProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        feature: z.enum(ORG_MANAGEABLE_FEATURES),
      })
    )
    .mutation(async ({ ctx, input: { organizationId, feature } }) => {
      const db = await getRequiredDb();
      assertOrganizationAccess(ctx.user, organizationId);

      // Verify user is org admin
      if (ctx.user?.role !== "super_admin" && ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only admins can enable features",
        });
      }

      const [org] = await db.select().from(organizations).where(eq(organizations.id, organizationId)).limit(1);

      if (!org) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found",
        });
      }

      const settings = (org.settings as any) || {};
      const updatedSettings = {
        ...settings,
        featureMap: {
          ...settings.featureMap,
          [feature]: true,
        },
      };

      await db.update(organizations)
        .set({ settings: updatedSettings as any })
        .where(eq(organizations.id, organizationId));

      return {
        success: true,
        feature,
        enabled: true,
      };
    }),

  /**
   * Disable a specific feature for an organization
   */
  disableOrgFeature: orgSettingsEditProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        feature: z.enum(ORG_MANAGEABLE_FEATURES),
      })
    )
    .mutation(async ({ ctx, input: { organizationId, feature } }) => {
      const db = await getRequiredDb();
      assertOrganizationAccess(ctx.user, organizationId);

      // Verify user is org admin
      if (ctx.user?.role !== "super_admin" && ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only admins can disable features",
        });
      }

      const [org] = await db.select().from(organizations).where(eq(organizations.id, organizationId)).limit(1);

      if (!org) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found",
        });
      }

      const settings = (org.settings as any) || {};
      const updatedSettings = {
        ...settings,
        featureMap: {
          ...settings.featureMap,
          [feature]: false,
        },
      };

      await db.update(organizations)
        .set({ settings: updatedSettings as any })
        .where(eq(organizations.id, organizationId));

      return {
        success: true,
        feature,
        enabled: false,
      };
    }),

  /**
   * Get feature status for an org (which are enabled/disabled)
   */
  getFeatureStatus: orgSettingsViewProcedure
    .input(z.string().min(1))
    .query(async ({ ctx, input: organizationId }) => {
      const db = await getRequiredDb();
      assertOrganizationAccess(ctx.user, organizationId);

      const [org] = await db.select().from(organizations).where(eq(organizations.id, organizationId)).limit(1);

      if (!org) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found",
        });
      }

      const settings = (org.settings as any) || {};
      const featureMap = settings.featureMap || {};

      // Return status of each available feature
      const status = ORG_MANAGEABLE_FEATURES.reduce((acc, feature) => {
        acc[feature] = featureMap[feature] === true;
        return acc;
      }, {} as Record<string, boolean>);

      return status;
    }),

  /**
   * Get list of available features that can be toggled
   * Useful for UI to show feature management options
   */
  getAvailableFeatures: orgSettingsViewProcedure
    .input(z.void())
    .query(async () => {
      // Group features by category for UI display
      const crmFeatures = ORG_MANAGEABLE_FEATURES.filter(f => f.startsWith("crm") || ["clients", "leads", "pipeline"].includes(f));
      const financeFeatures = ORG_MANAGEABLE_FEATURES.filter(f => 
        ["invoicing", "payments", "expenses", "receipts", "estimates", "credit_notes", "debit_notes", "subscriptions", "accounting", "budgets", "chart_of_accounts", "bank_reconciliation", "financial_dashboard", "forecasting", "tax_compliance"].includes(f)
      );
      const hrFeatures = ORG_MANAGEABLE_FEATURES.filter(f => f.startsWith("hr") || ["employees", "attendance", "leave", "payroll", "departments", "job_groups", "performance_reviews"].includes(f));
      const procurementFeatures = ORG_MANAGEABLE_FEATURES.filter(f => f.startsWith("procurement") || ["suppliers", "purchase_orders", "orders", "lpos"].includes(f));
      const otherFeatures = ORG_MANAGEABLE_FEATURES.filter(f => 
        !crmFeatures.includes(f as any) && 
        !financeFeatures.includes(f as any) && 
        !hrFeatures.includes(f as any) && 
        !procurementFeatures.includes(f as any)
      );

      return {
        crm: crmFeatures,
        finance: financeFeatures,
        hr: hrFeatures,
        procurement: procurementFeatures,
        other: otherFeatures,
        all: ORG_MANAGEABLE_FEATURES,
      };
    }),

  /**
   * Get user's current role in organization
   */
  getUserOrgRole: orgSettingsViewProcedure
    .input(z.string().min(1))
    .query(async ({ ctx, input: organizationId }) => {
      if (!ctx.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const db = await getRequiredDb();
      assertOrganizationAccess(ctx.user, organizationId);

      const [user] = await db.select({
        id: users.id,
        role: users.role,
        name: users.name,
        email: users.email,
      }).from(users).where(and(
        eq(users.id, ctx.user.id),
        eq(users.organizationId, organizationId),
      )).limit(1);

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found in this organization",
        });
      }

      return user;
    }),

  /**
   * Check if org admin can manage a specific feature
   * (some features are admin-only like billing/staff settings)
   */
  canManageFeature: orgSettingsViewProcedure
    .input(z.enum(ORG_MANAGEABLE_FEATURES))
    .query(async ({ ctx, input: feature }) => {
      // Only super_admin and admin roles can manage features
      const canManage = ctx.user?.role === "super_admin" || ctx.user?.role === "admin";
      
      // Some features require super_admin
      const requiresSuperAdmin = ADMIN_ONLY_FEATURES.includes(feature as any);
      const canManageSuperAdminFeature = ctx.user?.role === "super_admin";

      return {
        feature,
        canManage: canManage && (!requiresSuperAdmin || canManageSuperAdminFeature),
        requiresSuperAdmin,
      };
    }),
});
