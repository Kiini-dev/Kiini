/**
 * Enhanced Role-Based Access Control (RBAC) Middleware
 * 
 * This module provides factory functions to create TRPC procedures
 * with built-in permission enforcement at the API level.
 * Supports both hardcoded system roles AND dynamic custom roles.
 */

import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { customRoles, organizationFeatures, organizations, userPermissions, users } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  ACCOUNTANT: "accountant",
  HR: "hr",
  STAFF: "staff",
  CLIENT: "client",
  PROJECT_MANAGER: "project_manager",
  PROCUREMENT_MANAGER: "procurement_manager",
  ICT_MANAGER: "ict_manager",
  SALES_MANAGER: "sales_manager",
  USER: "user",
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

const ORGANIZATION_FEATURE_MODULES: Array<[string, string]> = [
  ["invoicing", "invoicing"],
  ["payments", "payments"],
  ["expenses", "expenses"],
  ["procurement", "procurement"],
  ["projects", "projects"],
  ["hr", "hr"],
  ["payroll", "payroll"],
  ["leave", "leave"],
  ["attendance", "attendance"],
  ["crm:clients", "crm"],
  ["crm:contacts", "crm"],
  ["crm:leads", "crm"],
  ["sales:leads:view", "crm"],
  ["sales:leads:create", "crm"],
  ["sales:leads:update", "crm"],
  ["crm:opportunities", "crm"],
  ["crm", "crm"],
  ["accounting:invoices", "invoicing"],
  ["accounting:estimates", "invoicing"],
  ["accounting:credit_notes", "invoicing"],
  ["accounting:debit_notes", "invoicing"],
  ["accounting:payments", "payments"],
  ["accounting:expenses", "expenses"],
  ["accounting:reports", "reports"],
  ["accounting:chart_of_accounts", "accounting"],
  ["accounting:reconciliation", "accounting"],
  ["accounting", "accounting"],
  ["clients", "crm"],
  ["contacts", "crm"],
  ["leads", "crm"],
  ["opportunities", "crm"],
  ["sales", "crm"],
  ["projects", "projects"],
  ["tasks", "projects"],
  ["hr:employees", "hr"],
  ["hr:departments", "hr"],
  ["employees", "hr"],
  ["departments", "hr"],
  ["jobGroups", "hr"],
  ["payroll", "payroll"],
  ["leave", "leave"],
  ["attendance", "attendance"],
  ["procurement", "procurement"],
  ["suppliers", "procurement"],
  ["purchase_orders", "procurement"],
  ["orders", "procurement"],
  ["lpos", "procurement"],
  ["inventory", "procurement"],
  ["products", "procurement"],
  ["services", "work_orders"],
  ["warehouses", "procurement"],
  ["delivery_notes", "procurement"],
  ["grn", "procurement"],
  ["tickets", "tickets"],
  ["communications", "communications"],
  ["documents", "communications"],
  ["contracts", "contracts"],
  ["assets", "contracts"],
  ["warranty", "contracts"],
  ["work_orders", "work_orders"],
  ["budgets", "budgets"],
  ["analytics", "reports"],
  ["reports", "reports"],
  ["ai", "ai_hub"],
];

const TIER_DEFAULT_MODULES: Record<string, Record<string, boolean>> = {
  trial: { crm: true, invoicing: true, reports: true },
  starter: { crm: true, invoicing: true, payments: true, expenses: true, tickets: true, reports: true },
  professional: { crm: true, invoicing: true, payments: true, expenses: true, tickets: true, reports: true, projects: true, hr: true, leave: true, attendance: true, accounting: true, budgets: true, communications: true },
  enterprise: { crm: true, projects: true, hr: true, payroll: true, leave: true, attendance: true, invoicing: true, payments: true, expenses: true, procurement: true, accounting: true, budgets: true, reports: true, ai_hub: true, communications: true, tickets: true, contracts: true, work_orders: true },
  custom: { crm: true, projects: true, hr: true, payroll: true, leave: true, attendance: true, invoicing: true, payments: true, expenses: true, procurement: true, accounting: true, budgets: true, reports: true, ai_hub: true, communications: true, tickets: true, contracts: true, work_orders: true },
};

export function getAllowedTierFeatures(plan: string | null | undefined): Set<string> {
  const normalizedPlan = String(plan || "trial").toLowerCase();
  const defaults = TIER_DEFAULT_MODULES[normalizedPlan] ?? TIER_DEFAULT_MODULES.trial;
  return new Set(
    Object.entries(defaults)
      .filter(([, enabled]) => Boolean(enabled))
      .map(([featureKey]) => featureKey)
  );
}

export function isFeatureAllowedForTier(plan: string | null | undefined, featureKey: string): boolean {
  const normalizedKey = String(featureKey || "").trim().toLowerCase();
  if (!normalizedKey) return false;
  const normalizedPlan = String(plan || "trial").toLowerCase();
  if (normalizedPlan === "custom") {
    return true;
  }
  const allowed = getAllowedTierFeatures(normalizedPlan);
  const directKey = normalizedKey.replace(/^org:/, "");
  return allowed.has(directKey) || allowed.has(directKey.split(":")[0]);
}

function getOrganizationModule(feature: string): string | null {
  const normalized = feature.replace(/^org:/, "");
  const match = ORGANIZATION_FEATURE_MODULES.find(([prefix]) => normalized === prefix || normalized.startsWith(`${prefix}:`));
  return match?.[1] ?? null;
}

async function requireOrganizationFeatureAccess(organizationId: string, features: string[]) {
  const modules = Array.from(new Set(features.map(getOrganizationModule).filter((module): module is string => Boolean(module))));
  if (modules.length === 0) return;

  const db = await getDb();
  if (!db) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Unable to verify organization feature access" });
  }

  const [organization] = await db.select({ plan: organizations.plan, isActive: organizations.isActive })
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1);
  if (!organization || !organization.isActive) {
    throw new TRPCError({ code: "FORBIDDEN", message: "This organization is inactive or unavailable" });
  }

  const enabledRows = await db.select({ featureKey: organizationFeatures.featureKey, isEnabled: organizationFeatures.isEnabled })
    .from(organizationFeatures)
    .where(eq(organizationFeatures.organizationId, organizationId));
  const explicit = new Map(enabledRows.map((row) => [row.featureKey, Boolean(row.isEnabled)]));
  const defaults = TIER_DEFAULT_MODULES[String(organization.plan || "trial")] ?? TIER_DEFAULT_MODULES.trial;
  const planAllowed = getAllowedTierFeatures(String(organization.plan || "trial"));
  const hasAccess = modules.some((module) => {
    if (String(organization.plan || "trial").toLowerCase() !== "custom" && !planAllowed.has(module)) {
      return false;
    }
    return explicit.has(module) ? explicit.get(module) : defaults[module] === true;
  });
  if (!hasAccess) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Your organization subscription does not include this feature" });
  }
}

/**
 * Role-based access permissions mapping
 * Defines which roles can access which features
 */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: [
    "admin:manage_users",
    "admin:manage_roles",
    "admin:settings",
    "admin:system",
    "accounting:*",
    "hr:*",
    "sales:*",
    "projects:*",
    "clients:*",
    "procurement:*",
    "billing:*",
    "subscriptions:*",
    "org:billing:*",
  ],
  admin: [
    "accounting:*",
    "hr:manage_staff",
    "sales:*",
    "projects:*",
    "clients:*",
    "procurement:*",
    "billing:*",
    "subscriptions:*",
    "org:billing:read",
    "org:billing:edit",
    "org:billing:create",
  ],
  accountant: [
    "accounting:invoices",
    "accounting:payments",
    "accounting:expenses",
    "accounting:reports",
    "accounting:chart_of_accounts",
    "accounting:reconciliation",
    "billing:read",
    "billing:edit",
    "subscriptions:read",
  ],
  hr: [
    "hr:employees",
    "hr:payroll",
    "hr:leave",
    "hr:attendance",
    "hr:departments",
  ],
  project_manager: [
    "projects:*",
    "clients:view",
    "sales:view",
    "accounting:view_invoices",
  ],
  staff: [
    "projects:view_own",
    "clients:view",
    "hr:view_own_records",
  ],
  client: [
    "client_portal:dashboard",
    "client_portal:invoices",
    "client_portal:projects",
    "client_portal:payments",
  ],
  procurement_manager: [
    "procurement:*",
    "accounting:view",
    "accounting:expenses:view",
    "accounting:payments:view",
    "clients:view",
    "products:view",
    "suppliers:*",
  ],
  ict_manager: [
    // Views for core data - read-only access to overview data
    "accounting:invoices:view",
    "accounting:payments:view",
    "accounting:expenses:view",
    "accounting:reports:view",
    "hr:employees:view",
    "hr:departments:view",
    "projects:view",
    "clients:view",
    "procurement:lpo:view",
    "procurement:imprest:view",
    "analytics:view",
    // System & Technical Management - full control
    "admin:system",
    "admin:settings",
    "admin:maintenance",
    "communications:email_queue",
    "auth:sessions",
    "auth:manage_sessions",
    "auth:export_user_data",
    "system:health",
    "system:monitoring",
    "system:logs",
    "system:backups",
    "users:view",
    "users:deactivate",
    "audit:view",
    "audit:export",
    "settings:integrations",
    "settings:security",
    "settings:notifications",
  ],
  sales_manager: [
    "sales:*",
    "clients:*",
    "projects:view",
    "accounting:invoices:view",
    "accounting:invoices:create",
    "accounting:payments:view",
    "accounting:expenses:view",
    "accounting:reports:view",
    "estimates:*",
    "opportunities:*",
    "receipts:view",
    "analytics:view",
  ],
  user: [
    "tickets:read",
    "tickets:create",
  ],
};

/**
 * Feature-based access mapping
 * Maps features and modules to required roles
 */
export const FEATURE_ACCESS: Record<string, UserRole[]> = {
  // Client-owned support workflow
  "tickets:read": ["super_admin", "admin", "staff", "accountant", "user", "project_manager", "hr", "client"],
  "tickets:create": ["super_admin", "admin", "staff", "accountant", "user", "project_manager", "hr", "client"],
  "tickets:edit": ["super_admin", "admin", "staff", "accountant", "user", "project_manager", "hr", "client"],
  "tickets:delete": ["super_admin", "admin"],
  // Admin Features
  "admin:manage_users": ["super_admin", "admin", "ict_manager"],
  "admin:manage_roles": ["super_admin"],
  "admin:settings": ["super_admin", "admin"],
  "admin:maintenance": ["super_admin", "ict_manager"],
  "admin:system": ["super_admin", "admin", "ict_manager"],

  // ICT portal capabilities shared by the super-admin and ICT manager portals
  "ict:system_health": ["super_admin", "ict_manager"],
  "ict:system_health:view": ["super_admin", "ict_manager"],
  "ict:system_health:edit": ["super_admin", "ict_manager"],
  "ict:users": ["super_admin", "admin", "ict_manager"],
  "ict:users:view": ["super_admin", "admin", "ict_manager"],
  "ict:users:manage": ["super_admin", "admin", "ict_manager"],
  "ict:users:disable": ["super_admin", "admin", "ict_manager"],
  "ict:users:sessions": ["super_admin", "ict_manager"],
  "ict:security": ["super_admin", "ict_manager"],
  "ict:security:view": ["super_admin", "ict_manager"],
  "ict:security:policies": ["super_admin", "ict_manager"],
  "ict:security:access_control": ["super_admin", "ict_manager"],
  "ict:security:audit": ["super_admin", "ict_manager"],
  "ict:backups": ["super_admin", "admin", "ict_manager"],
  "ict:backups:view": ["super_admin", "admin", "ict_manager"],
  "ict:backups:create": ["super_admin", "admin", "ict_manager"],
  "ict:backups:restore": ["super_admin", "admin", "ict_manager"],
  "ict:logs": ["super_admin", "ict_manager"],
  "ict:logs:view": ["super_admin", "ict_manager"],
  "ict:logs:download": ["super_admin", "ict_manager"],
  "ict:logs:archive": ["super_admin", "ict_manager"],
  "ict:database": ["super_admin", "admin", "ict_manager"],
  "ict:database:view": ["super_admin", "admin", "ict_manager"],
  "ict:database:query": ["super_admin", "admin", "ict_manager"],
  "ict:database:maintenance": ["super_admin", "admin", "ict_manager"],
  "ict:network": ["super_admin", "admin", "ict_manager"],
  "ict:network:view": ["super_admin", "admin", "ict_manager"],
  "ict:notifications": ["super_admin", "admin", "ict_manager"],
  "ict:notifications:view": ["super_admin", "admin", "ict_manager"],
  "ict:notifications:config": ["super_admin", "admin", "ict_manager"],
  "ict:dashboard": ["super_admin", "admin", "ict_manager"],

  // Enterprise / Multi-Tenancy (global platform only)
  "enterprise:view": ["super_admin", "admin", "ict_manager"],
  "enterprise:create": ["super_admin", "admin", "ict_manager"],
  "enterprise:edit": ["super_admin", "admin", "ict_manager"],
  "enterprise:delete": ["super_admin"],
  "admin:view": ["super_admin", "admin", "ict_manager"],
  "admin:edit": ["super_admin", "admin"],

  // User Management & Permissions
  "users:edit": ["super_admin", "admin", "ict_manager"],
  "users:view": ["super_admin", "admin", "ict_manager"],
  "users:create": ["super_admin", "admin", "ict_manager"],
  "users:delete": ["super_admin", "admin"],
  "users:update": ["super_admin", "admin", "ict_manager"],
  "users:permissions": ["super_admin"],
  "users:permissions:edit": ["super_admin", "ict_manager"],
  "users:permissions:view": ["super_admin", "admin", "ict_manager"],
  "users:roles": ["super_admin"],
  "users:roles:edit": ["super_admin"],
  "users:read": ["super_admin", "admin", "ict_manager"],

  // Accounting Features
  "accounting:invoices": ["super_admin", "admin", "accountant", "project_manager", "sales_manager", "ict_manager"],
  "accounting:invoices:view": ["super_admin", "admin", "accountant", "project_manager", "sales_manager", "ict_manager"],
  "accounting:invoices:create": ["super_admin", "admin", "accountant", "sales_manager", "ict_manager"],
  "accounting:invoices:edit": ["super_admin", "admin", "accountant", "ict_manager"],
  "accounting:invoices:delete": ["super_admin", "admin"],
  "accounting:invoices:approve": ["super_admin", "admin", "accountant"],
  
  // Generic accounting permissions (used by bankReconciliation)
  "accounting:read": ["super_admin", "admin", "accountant", "project_manager", "ict_manager"],
  "accounting:create": ["super_admin", "admin", "accountant"],
  "accounting:edit": ["super_admin", "admin", "accountant"],
  "accounting:delete": ["super_admin", "admin"],
  "accounting:policies:read": ["super_admin", "admin", "accountant", "project_manager", "ict_manager"],
  "accounting:policies:create": ["super_admin", "admin", "accountant"],
  "accounting:policies:update": ["super_admin", "admin", "accountant"],

  "accounting:receipts": ["super_admin", "admin", "accountant", "project_manager", "ict_manager"],
  "accounting:receipts:view": ["super_admin", "admin", "accountant", "project_manager", "ict_manager"],
  "accounting:receipts:create": ["super_admin", "admin", "accountant"],
  "accounting:receipts:edit": ["super_admin", "admin", "accountant"],
  "accounting:receipts:delete": ["super_admin", "admin"],

  "accounting:payments": ["super_admin", "admin", "accountant"],
  "accounting:payments:view": ["super_admin", "admin", "accountant", "project_manager", "sales_manager"],
  "accounting:payments:record": ["super_admin", "admin", "accountant"],
  "accounting:payments:create": ["super_admin", "admin", "accountant"],
  "accounting:payments:edit": ["super_admin", "admin", "accountant"],
  "accounting:payments:delete": ["super_admin", "admin"],
  "accounting:payments:approve": ["super_admin", "admin", "accountant"],
  "accounting:payments:reconcile": ["super_admin", "admin", "accountant"],
  "accounting:payments:refund": ["super_admin", "admin"],

  "accounting:expenses": ["super_admin", "admin", "accountant", "project_manager"],
  "accounting:expenses:view": ["super_admin", "admin", "accountant", "project_manager"],
  "accounting:expenses:create": ["super_admin", "admin", "accountant", "staff"],
  "accounting:expenses:edit": ["super_admin", "admin", "accountant"],
  "accounting:expenses:approve": ["super_admin", "admin", "accountant"],
  "accounting:expenses:reject": ["super_admin", "admin", "accountant"],
  "accounting:expenses:delete": ["super_admin", "admin"],
  "accounting:expenses:budget": ["super_admin", "admin", "accountant"],

  "accounting:reports": ["super_admin", "admin", "accountant"],
  "accounting:reports:view": ["super_admin", "admin", "accountant"],
  "accounting:chart_of_accounts": ["super_admin", "admin", "accountant"],
  "accounting:chart_of_accounts:view": ["super_admin", "admin", "accountant"],
  "accounting:reconciliation": ["super_admin", "admin", "accountant"],
  "accounting:reconciliation:view": ["super_admin", "admin", "accountant"],

  // HR Features
  "hr:view": ["super_admin", "admin", "hr"],
  "hr:edit": ["super_admin", "admin", "hr"],
  "hr:employees": ["super_admin", "admin", "hr"],
  "hr:employees:view": ["super_admin", "admin", "hr", "project_manager"],
  "hr:employees:create": ["super_admin", "admin", "hr"],
  "hr:employees:edit": ["super_admin", "admin", "hr"],
  "hr:employees:delete": ["super_admin", "admin"],

  // Standalone employee read/write features (used by employees router directly)
  "employees:read": ["super_admin", "admin", "hr", "project_manager", "ict_manager"],
  "employees:view": ["super_admin", "admin", "hr", "project_manager"],
  "employees:edit": ["super_admin", "admin", "hr"],
  "employees:create": ["super_admin", "admin", "hr"],
  "employees:update": ["super_admin", "admin", "hr"],
  "employees:delete": ["super_admin", "admin"],

  "hr:departments": ["super_admin", "admin", "hr"],
  "hr:departments:view": ["super_admin", "admin", "hr"],
  "hr:departments:create": ["super_admin", "admin", "hr"],
  "hr:departments:edit": ["super_admin", "admin", "hr"],
  "hr:departments:delete": ["super_admin", "admin"],

  "hr:jobGroups": ["super_admin", "admin", "hr"],
  "hr:jobGroups:view": ["super_admin", "admin", "hr"],
  "hr:jobGroups:create": ["super_admin", "hr"],
  "hr:jobGroups:edit": ["super_admin", "hr"],
  "hr:jobGroups:delete": ["super_admin", "hr"],

  // Standalone job groups (used by jobGroups router)
  "jobGroups:read": ["super_admin", "admin", "hr"],
  "jobGroups:create": ["super_admin", "admin", "hr"],
  "jobGroups:edit": ["super_admin", "admin", "hr"],
  "jobGroups:delete": ["super_admin", "admin"],

  "hr:payroll": ["super_admin", "hr"],
  "hr:payroll:view": ["super_admin", "hr"],
  "hr:payroll:create": ["super_admin", "hr"],
  "hr:payroll:approve": ["super_admin", "hr"],

  // Standalone payroll features (used by payslips router)
  "payroll:view": ["super_admin", "admin", "hr", "accountant"],
  "payroll:read": ["super_admin", "admin", "hr", "accountant"],
  "payroll:create": ["super_admin", "admin", "hr"],
  "payroll:edit": ["super_admin", "admin", "hr"],
  "payroll:delete": ["super_admin", "admin"],

  "hr:leave": ["super_admin", "admin", "hr"],
  "hr:leave:approve": ["super_admin", "hr"],

  "hr:attendance": ["super_admin", "admin", "hr"],

  // Generic HR attendance permissions
  "attendance:read": ["super_admin", "admin", "hr"],
  "attendance:create": ["super_admin", "admin", "hr"],
  "attendance:edit": ["super_admin", "admin", "hr"],
  "attendance:delete": ["super_admin", "admin"],

  // Standalone estimate features (used by estimates router)
  "estimates:read": ["super_admin", "admin", "project_manager", "accountant", "sales_manager"],
  "estimates:create": ["super_admin", "admin", "project_manager", "sales_manager"],
  "estimates:edit": ["super_admin", "admin", "project_manager", "sales_manager"],
  "estimates:delete": ["super_admin", "admin"],
  "estimates:approve": ["super_admin", "admin", "project_manager", "sales_manager"],
  "estimates:send": ["super_admin", "admin", "project_manager", "sales_manager"],
  "estimates:view": ["super_admin", "admin", "project_manager", "accountant", "sales_manager"],

  // Estimates to Approvals (route estimates through approval system)
  "estimates:submit_for_approval": ["super_admin", "admin", "project_manager", "sales_manager"],
  "estimates:approvals": ["super_admin", "admin", "accountant"],

  "sales:receipts": ["super_admin", "admin", "accountant", "project_manager", "sales_manager"],


  // Procurement
  "procurement:view": ["super_admin", "admin", "procurement_manager"],
  "procurement:suppliers": ["super_admin", "admin"],
  "procurement:suppliers:view": ["super_admin", "admin"],
  "procurement:suppliers:create": ["super_admin", "admin"],
  "procurement:suppliers:edit": ["super_admin", "admin"],
  "procurement:suppliers:delete": ["super_admin", "admin"],

  "procurement:lpo": ["super_admin", "admin"],
  "procurement:lpo:view": ["super_admin", "admin", "accountant", "project_manager"],
  "procurement:lpo:create": ["super_admin", "admin", "project_manager"],
  "procurement:lpo:edit": ["super_admin", "admin", "project_manager"],
  "procurement:lpo:delete": ["super_admin", "admin"],
  "procurement:lpo:approve": ["super_admin", "admin"],

  "procurement:imprest": ["super_admin", "admin"],
  "procurement:imprest:view": ["super_admin", "admin", "accountant"],
  "procurement:imprest:create": ["super_admin", "admin", "staff"],
  "procurement:imprest:edit": ["super_admin", "admin"],
  "procurement:imprest:delete": ["super_admin", "admin"],
  "procurement:imprest:approve": ["super_admin", "admin"],

  "procurement:orders": ["super_admin", "admin"],
  "procurement:orders:view": ["super_admin", "admin", "procurement_manager"],
  "procurement:orders:create": ["super_admin", "admin", "procurement_manager"],
  "procurement:orders:edit": ["super_admin", "admin", "procurement_manager"],
  "procurement:orders:delete": ["super_admin", "admin"],
  // Analytics view permission used by dashboard and reports
  "analytics:view": ["super_admin", "admin", "accountant", "project_manager", "ict_manager", "sales_manager"],

  // Communications / email queue management
  "communications:email_queue": ["super_admin", "admin", "ict_manager"],

  // Authentication utilities
  "auth:sessions": ["super_admin", "admin", "ict_manager"],
  "auth:export_user_data": ["super_admin", "admin", "ict_manager"],

  // Clients Features
  "clients:view": ["super_admin", "admin", "accountant", "project_manager", "procurement_manager", "sales_manager"],
  "clients:create": ["super_admin", "admin", "project_manager", "sales_manager"],
  "clients:edit": ["super_admin", "admin", "project_manager", "sales_manager"],
  "clients:delete": ["super_admin", "admin"],
  "clients:manage_relationships": ["super_admin", "admin", "project_manager", "sales_manager"],

  // Products & Services
  "products:view": ["super_admin", "admin", "accountant", "project_manager", "staff", "procurement_manager"],
  "products:create": ["super_admin", "admin"],
  "products:edit": ["super_admin", "admin"],
  "products:delete": ["super_admin", "admin"],
  "products:manage_inventory": ["super_admin", "admin", "procurement_manager"],

  "services:view": ["super_admin", "admin", "project_manager", "staff"],
  "services:create": ["super_admin", "admin"],
  "services:edit": ["super_admin", "admin"],
  "services:delete": ["super_admin", "admin"],

  // Projects Features
  "projects:view": ["super_admin", "admin", "project_manager", "staff"],
  "projects:create": ["super_admin", "admin", "project_manager"],
  "projects:edit": ["super_admin", "admin", "project_manager"],
  "projects:delete": ["super_admin", "admin"],
  "projects:manage_team": ["super_admin", "admin", "project_manager"],
  "projects:manage_milestones": ["super_admin", "admin", "project_manager"],
  "projects:manage_budget": ["super_admin", "admin", "accountant", "project_manager"],

  // Sales Features
  "sales:view": ["super_admin", "admin", "project_manager", "accountant", "sales_manager"],
  "sales:create": ["super_admin", "admin", "project_manager", "sales_manager"],
  "sales:edit": ["super_admin", "admin", "project_manager", "sales_manager"],
  "sales:delete": ["super_admin", "admin"],
  "sales:pipeline": ["super_admin", "admin", "project_manager", "sales_manager"],
  "sales:opportunities": ["super_admin", "admin", "project_manager", "sales_manager"],
  "sales:opportunities:create": ["super_admin", "admin", "project_manager", "sales_manager"],
  "sales:opportunities:edit": ["super_admin", "admin", "project_manager", "sales_manager"],
  "sales:opportunities:delete": ["super_admin", "admin"],

  // Dashboard Features
  "dashboard:view": ["super_admin", "admin", "accountant", "project_manager", "hr", "staff", "ict_manager", "sales_manager"],
  "dashboard:customize": ["super_admin", "admin", "project_manager", "sales_manager"],
  "dashboard:edit": ["super_admin", "admin"],

  // Departments Features
  "departments:view": ["super_admin", "admin", "hr", "project_manager"],
  "departments:create": ["super_admin", "admin", "hr"],
  "departments:edit": ["super_admin", "admin", "hr"],
  "departments:delete": ["super_admin", "admin"],
  "departments:read": ["super_admin", "admin", "hr", "project_manager"],

  // Reports Features (with department access)
  "reports:view": ["super_admin", "admin", "accountant", "project_manager", "hr", "sales_manager", "ict_manager"],
  "reports:create": ["super_admin", "admin"],
  "reports:financial": ["super_admin", "admin", "accountant"],
  "reports:sales": ["super_admin", "admin", "project_manager", "accountant", "sales_manager"],
  "reports:projects": ["super_admin", "admin", "project_manager"],
  "reports:hr": ["super_admin", "admin", "hr"],
  "reports:procurement": ["super_admin", "admin", "procurement_manager"],
  "reports:export": ["super_admin", "admin", "accountant", "project_manager", "hr"],
  "reports:departments": ["super_admin", "admin", "hr"],

  // AI Features - Chat & Assistance
  "ai:access": ["super_admin", "admin", "project_manager", "sales_manager", "accountant", "hr", "staff", "ict_manager"],
  "ai:summarize": ["super_admin", "admin", "project_manager", "sales_manager", "accountant", "hr", "staff", "ict_manager"],
  "ai:generateEmail": ["super_admin", "admin", "project_manager", "sales_manager", "accountant", "hr", "staff", "ict_manager"],
  "ai:chat": ["super_admin", "admin", "project_manager", "sales_manager", "accountant", "hr", "staff", "ict_manager"],
  "ai:financial": ["super_admin", "admin", "project_manager", "sales_manager", "accountant", "hr", "ict_manager"],
  "ai:modal": ["super_admin", "admin", "project_manager", "sales_manager", "accountant", "hr", "staff", "ict_manager"],

  // Chat/IntraChat Features
  "communications:chat": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager", "ict_manager"],
  "communications:intrachat": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager", "ict_manager"],
  "communications:ai_assistant": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager", "ict_manager"],

  // Support & Communications
  "communications:view": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager", "ict_manager"],
  "communications:manage": ["super_admin", "admin", "ict_manager", "hr", "accountant", "sales_manager", "project_manager"],

  // Notifications
  "notifications:read": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager", "ict_manager"],
  "notifications:create": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager", "ict_manager"],
  "communications:email": ["super_admin", "admin", "ict_manager", "hr", "accountant", "sales_manager", "project_manager"],
  "communications:notifications": ["super_admin", "admin", "ict_manager", "hr", "accountant", "sales_manager", "project_manager", "staff"],
  "communications:tickets": ["super_admin", "admin", "staff"],
  "communications:tickets:create": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager", "ict_manager", "procurement_manager", "client"],
  "communications:tickets:resolve": ["super_admin", "admin", "ict_manager", "project_manager", "hr", "accountant", "sales_manager", "procurement_manager"],

  // System Settings
  "settings:view": ["super_admin", "admin", "ict_manager"],
  "settings:edit": ["super_admin", "admin", "ict_manager"],
  "settings:company": ["super_admin", "admin"],
  "settings:billing": ["super_admin", "admin"],
  "settings:integrations": ["super_admin", "ict_manager"],
  "settings:security": ["super_admin", "ict_manager"],
  "settings:roles": ["super_admin"],
  "settings:audit": ["super_admin", "ict_manager"],

  // Tools & Utilities
  "tools:import_export": ["super_admin", "admin", "accountant", "project_manager", "sales_manager", "procurement_manager", "ict_manager", "hr", "staff", "client"],
  "import:create": ["super_admin", "admin", "accountant", "project_manager", "sales_manager", "procurement_manager", "ict_manager", "hr", "staff", "client"],
  "import:read": ["super_admin", "admin", "accountant", "project_manager", "sales_manager", "procurement_manager", "ict_manager", "hr", "staff", "client"],
  "import:restore": ["super_admin", "admin"],
  "export:create": ["super_admin", "admin", "accountant", "project_manager", "sales_manager", "procurement_manager", "ict_manager", "hr", "staff", "client"],
  "data:import": ["super_admin", "admin", "accountant", "project_manager", "sales_manager", "procurement_manager", "ict_manager", "hr", "staff", "client"],
  "data:export": ["super_admin", "admin", "accountant", "project_manager", "sales_manager", "procurement_manager", "ict_manager", "hr", "staff", "client"],
  "tools:data_backup": ["super_admin", "admin", "ict_manager"],
  "tools:system_health": ["super_admin", "admin", "ict_manager"],
  "tools:api_management": ["super_admin", "admin", "ict_manager"],
  "tools:automation": ["super_admin", "admin", "ict_manager", "accountant", "staff", "project_manager", "hr", "procurement_manager", "sales_manager"],
  "tools:workflows": ["super_admin", "admin", "ict_manager"],

  // Client Portal
  "client_portal:dashboard": ["client"],
  "client_portal:invoices": ["client"],
  "client_portal:projects": ["client"],
  "client_portal:payments": ["client"],

  // Approvals Features
  "approvals:view": ["super_admin", "admin", "accountant", "hr"],
  "approvals:read": ["super_admin", "admin", "accountant", "hr"],
  "approvals:approve": ["super_admin", "admin", "accountant", "hr"],
  "approvals:reject": ["super_admin", "admin", "accountant", "hr"],
  "approvals:delete": ["super_admin"],

  // Chart of Accounts Features
  "chartOfAccounts:read": ["super_admin", "admin", "accountant"],
  "chartOfAccounts:create": ["super_admin", "admin", "accountant"],
  "chartOfAccounts:edit": ["super_admin", "admin", "accountant"],
  "chartOfAccounts:delete": ["super_admin", "admin"],

  // Budgets Features (prefix: budgets)
  "budgets:view": ["super_admin", "admin", "accountant", "project_manager"],
  "budgets:create": ["super_admin", "admin", "accountant", "sales_manager", "procurement_manager", "ict_manager"],
  "budgets:edit": ["super_admin", "admin", "accountant", "sales_manager", "procurement_manager", "ict_manager"],
  "budgets:delete": ["super_admin", "accountant"],

  // Budget Features (prefix: budget - used by budget router)
  "budget:read": ["super_admin", "admin", "accountant", "project_manager"],
  "budget:edit": ["super_admin", "admin", "accountant"],

  // Invoice Features
  "invoices:view": ["super_admin", "admin", "accountant", "project_manager"],
  "invoices:create": ["super_admin", "admin", "accountant"],
  "invoices:edit": ["super_admin", "admin", "accountant"],
  "invoices:delete": ["super_admin", "admin"],
  "invoices:read": ["super_admin", "admin", "accountant", "project_manager"],

  // Expense Features
  "expenses:view": ["super_admin", "admin", "accountant"],
  "expenses:create": ["super_admin", "admin", "accountant", "staff", "procurement_manager", "ict_manager", "sales_manager", "hr", "project_manager"],
  "expenses:edit": ["super_admin", "admin", "accountant"],
  "expenses:delete": ["super_admin", "admin"],
  "expenses:read": ["super_admin", "admin", "accountant", "project_manager"],

  // Payment Features
  "payments:view": ["super_admin", "admin", "accountant", "sales_manager"],
  "payments:create": ["super_admin", "admin", "accountant"],
  "payments:edit": ["super_admin", "accountant"],
  "payments:delete": ["super_admin"],
  "payments:read": ["super_admin", "admin", "accountant"],
  "payments:reconcile": ["super_admin", "admin", "accountant"],

  // Client Features (ensure all CRUD operations exist)
  "clients:read": ["super_admin", "admin", "project_manager", "accountant", "procurement_manager", "ict_manager", "sales_manager"],

  // Communications Features
  "communications:read": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager", "ict_manager", "procurement_manager"],
  "communications:messaging": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager", "ict_manager", "procurement_manager"],
  "communications:send": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager", "ict_manager", "procurement_manager"],

  // Filters & Saved Views
  "filters:create": ["super_admin", "admin", "accountant", "project_manager", "hr", "staff", "ict_manager", "procurement_manager", "sales_manager", "client"],
  "filters:read": ["super_admin", "admin", "accountant", "project_manager", "hr", "staff", "ict_manager", "procurement_manager", "sales_manager", "client"],
  "filters:update": ["super_admin", "admin", "accountant", "project_manager", "hr", "staff", "ict_manager", "procurement_manager", "sales_manager", "client"],
  "filters:delete": ["super_admin", "admin", "accountant", "project_manager", "hr", "staff", "ict_manager", "procurement_manager", "sales_manager", "client"],

  // Phase 20 - Business Intelligence & Analytics
  "analytics:reports": ["super_admin", "admin", "accountant", "project_manager", "hr", "sales_manager"],
  "analytics:dashboards": ["super_admin", "admin", "project_manager", "accountant"],
  "analytics:export": ["super_admin", "admin", "accountant"],

  // Phase 20 - Supplier Management
  "suppliers:view": ["super_admin", "admin", "procurement_manager"],
  "suppliers:create": ["super_admin", "admin", "procurement_manager"],
  "suppliers:edit": ["super_admin", "admin", "procurement_manager"],
  "suppliers:delete": ["super_admin", "admin", "procurement_manager"],
  "suppliers:read": ["super_admin", "admin", "procurement_manager"],

  // Phase 20 - Quotations/RFQs
  "quotations:view": ["super_admin", "admin", "procurement_manager", "accountant"],
  "quotations:create": ["super_admin", "admin", "procurement_manager"],
  "quotations:edit": ["super_admin", "admin", "procurement_manager"],
  "quotations:delete": ["super_admin", "admin"],
  "quotations:approve": ["super_admin", "admin"],

  // Phase 20 - Delivery Notes  
  "delivery_notes:view": ["super_admin", "admin", "procurement_manager", "accountant", "staff"],
  "delivery_notes:create": ["super_admin", "admin", "procurement_manager", "staff"],
  "delivery_notes:edit": ["super_admin", "admin", "procurement_manager"],
  "delivery_notes:delete": ["super_admin", "admin"],

  // Phase 20 - Goods Received Notes
  "grn:view": ["super_admin", "admin", "procurement_manager", "accountant", "staff"],
  "grn:create": ["super_admin", "admin", "procurement_manager", "staff"],
  "grn:edit": ["super_admin", "admin", "procurement_manager"],
  "grn:delete": ["super_admin", "admin"],

  // Phase 20 - Warranty Management
  "warranty:view": ["super_admin", "admin", "ict_manager", "procurement_manager"],
  "warranty:create": ["super_admin", "admin", "ict_manager", "procurement_manager"],
  "warranty:edit": ["super_admin", "admin", "ict_manager", "procurement_manager"],
  "warranty:delete": ["super_admin", "admin"],

  // Phase 20 - Asset Management
  "assets:view": ["super_admin", "admin", "ict_manager", "procurement_manager"],
  "assets:create": ["super_admin", "admin", "ict_manager", "procurement_manager"],
  "assets:edit": ["super_admin", "admin", "ict_manager", "procurement_manager"],
  "assets:delete": ["super_admin", "admin"],

  // Phase 20 - Document Management
  "documents:view": ["super_admin", "admin", "staff", "project_manager"],
  "documents:create": ["super_admin", "admin", "staff", "project_manager"],
  "documents:edit": ["super_admin", "admin", "project_manager"],
  "documents:delete": ["super_admin", "admin"],
  "documents:upload": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant"],

  // Phase 20 - Contract Management
  "contracts:view": ["super_admin", "admin", "procurement_manager", "accountant"],
  "contracts:create": ["super_admin", "admin", "procurement_manager"],
  "contracts:edit": ["super_admin", "admin", "procurement_manager"],
  "contracts:delete": ["super_admin", "admin"],
  "contracts:approve": ["super_admin", "admin"],

  // Remaining missing features
  "leave:read": ["super_admin", "admin", "hr"],
  "leave:approve": ["super_admin", "hr"],
  "leave:create": ["super_admin", "admin", "hr", "staff", "project_manager", "ict_manager", "accountant", "sales_manager", "procurement_manager"],
  "leave:delete": ["super_admin", "admin", "hr"],
  
  // Organization Permissions
  // Organization Admin Features
  "org:admin:manage_users": ["super_admin"],
  "org:admin:manage_roles": ["super_admin"],
  "org:admin:settings": ["super_admin", "admin", "ict_manager"],

  // Organization User Management & Permissions
  "org:users:edit": ["super_admin", "admin", "ict_manager"],
  "org:users:view": ["super_admin", "admin", "ict_manager"],
  "org:users:create": ["super_admin", "admin", "ict_manager"],
  "org:users:delete": ["super_admin", "admin"],
  "org:users:update": ["super_admin", "admin", "ict_manager"],
  "org:users:permissions": ["super_admin"],
  "org:users:permissions:edit": ["super_admin", "ict_manager"],
  "org:users:permissions:view": ["super_admin", "admin", "ict_manager"],
  "org:users:roles": ["super_admin"],
  "org:users:roles:edit": ["super_admin"],
  "org:users:read": ["super_admin", "admin", "ict_manager"],

  // Organization Accounting Features
  "org:accounting:invoices": ["super_admin", "admin", "accountant", "project_manager", "sales_manager", "ict_manager"],
  "org:accounting:invoices:view": ["super_admin", "admin", "accountant", "project_manager", "sales_manager", "ict_manager"],
  "org:accounting:invoices:create": ["super_admin", "admin", "accountant", "sales_manager", "ict_manager"],
  "org:accounting:invoices:edit": ["super_admin", "admin", "accountant", "ict_manager"],
  "org:accounting:invoices:delete": ["super_admin", "admin"],
  "org:accounting:invoices:approve": ["super_admin", "admin", "accountant"],
  
  // Generic Organization accounting permissions (used by bankReconciliation)
  "org:accounting:read": ["super_admin", "admin", "accountant", "project_manager", "ict_manager"],
  "org:accounting:create": ["super_admin", "admin", "accountant"],
  "org:accounting:edit": ["super_admin", "admin", "accountant"],
  "org:accounting:delete": ["super_admin", "admin"],

  "org:accounting:receipts": ["super_admin", "admin", "accountant", "project_manager", "ict_manager"],
  "org:accounting:receipts:view": ["super_admin", "admin", "accountant", "project_manager", "ict_manager"],
  "org:accounting:receipts:create": ["super_admin", "admin", "accountant"],
  "org:accounting:receipts:edit": ["super_admin", "admin", "accountant"],
  "org:accounting:receipts:delete": ["super_admin", "admin"],

  "org:accounting:payments": ["super_admin", "admin", "accountant"],
  "org:accounting:payments:view": ["super_admin", "admin", "accountant", "project_manager", "sales_manager"],
  "org:accounting:payments:record": ["super_admin", "admin", "accountant"],
  "org:accounting:payments:create": ["super_admin", "admin", "accountant"],
  "org:accounting:payments:edit": ["super_admin", "admin", "accountant"],
  "org:accounting:payments:delete": ["super_admin", "admin"],
  "org:accounting:payments:approve": ["super_admin", "admin", "accountant"],
  "org:accounting:payments:reconcile": ["super_admin", "admin", "accountant"],
  "org:accounting:payments:refund": ["super_admin", "admin"],

  "org:accounting:expenses": ["super_admin", "admin", "accountant", "project_manager"],
  "org:accounting:expenses:view": ["super_admin", "admin", "accountant", "project_manager"],
  "org:accounting:expenses:create": ["super_admin", "admin", "accountant", "staff"],
  "org:accounting:expenses:edit": ["super_admin", "admin", "accountant"],
  "org:accounting:expenses:approve": ["super_admin", "admin", "accountant"],
  "org:accounting:expenses:reject": ["super_admin", "admin", "accountant"],
  "org:accounting:expenses:delete": ["super_admin", "admin"],
  "org:accounting:expenses:budget": ["super_admin", "admin", "accountant"],

  "org:accounting:reports": ["super_admin", "admin", "accountant"],
  "org:accounting:reports:view": ["super_admin", "admin", "accountant"],
  "org:accounting:chart_of_accounts": ["super_admin", "admin", "accountant"],
  "org:accounting:chart_of_accounts:view": ["super_admin", "admin", "accountant"],
  "org:accounting:reconciliation": ["super_admin", "admin", "accountant"],
  "org:accounting:reconciliation:view": ["super_admin", "admin", "accountant"],

  // Organization HR Features
  "org:hr:view": ["super_admin", "admin", "hr"],
  "org:hr:edit": ["super_admin", "admin", "hr"],
  "org:hr:employees": ["super_admin", "admin", "hr"],
  "org:hr:employees:view": ["super_admin", "admin", "hr", "project_manager"],
  "org:hr:employees:create": ["super_admin", "admin", "hr"],
  "org:hr:employees:edit": ["super_admin", "admin", "hr"],
  "org:hr:employees:delete": ["super_admin", "admin"],

  // Standalone Organization employee read/write features (used by employees router directly)
  "org:employees:read": ["super_admin", "admin", "hr", "project_manager", "ict_manager"],
  "org:employees:view": ["super_admin", "admin", "hr", "project_manager"],
  "org:employees:edit": ["super_admin", "admin", "hr"],
  "org:employees:create": ["super_admin", "admin", "hr"],
  "org:employees:update": ["super_admin", "admin", "hr"],
  "org:employees:delete": ["super_admin", "admin"],

  "org:hr:departments": ["super_admin", "admin", "hr"],
  "org:hr:departments:view": ["super_admin", "admin", "hr"],
  "org:hr:departments:create": ["super_admin", "admin", "hr"],
  "org:hr:departments:edit": ["super_admin", "admin", "hr"],
  "org:hr:departments:delete": ["super_admin", "admin"],

  "org:hr:jobGroups": ["super_admin", "admin", "hr"],
  "org:hr:jobGroups:view": ["super_admin", "admin", "hr"],
  "org:hr:jobGroups:create": ["super_admin", "admin", "hr"],
  "org:hr:jobGroups:edit": ["super_admin", "admin", "hr"],
  "org:hr:jobGroups:delete": ["super_admin", "admin"],

  // Standalone Organization job groups (used by jobGroups router)
  "org:jobGroups:read": ["super_admin", "admin", "hr"],
  "org:jobGroups:create": ["super_admin", "admin", "hr"],
  "org:jobGroups:edit": ["super_admin", "admin", "hr"],
  "org:jobGroups:delete": ["super_admin", "admin"],

  "org:hr:payroll": ["super_admin", "admin", "hr"],
  "org:hr:payroll:view": ["super_admin", "admin", "hr"],
  "org:hr:payroll:create": ["super_admin", "admin", "hr"],
  "org:hr:payroll:approve": ["super_admin", "admin", "hr"],

  // Standalone Organization payroll features (used by payslips router)
  "org:payroll:view": ["super_admin", "admin", "hr", "accountant"],
  "org:payroll:edit": ["super_admin", "admin", "hr"],

  "org:hr:leave": ["super_admin", "admin", "hr"],
  "org:hr:leave:approve": ["super_admin", "hr"],

  "org:hr:attendance": ["super_admin", "admin", "hr"],

  // Generic Organization HR attendance permissions
  "org:attendance:read": ["super_admin", "admin", "hr"],
  "org:attendance:create": ["super_admin", "admin", "hr"],
  "org:attendance:edit": ["super_admin", "admin", "hr"],
  "org:attendance:delete": ["super_admin", "admin"],

  // Standalone Organization estimate features (used by estimates router)
  "org:estimates:read": ["super_admin", "admin", "project_manager", "accountant", "sales_manager"],
  "org:estimates:create": ["super_admin", "admin", "project_manager", "sales_manager"],
  "org:estimates:edit": ["super_admin", "admin", "project_manager", "sales_manager"],
  "org:estimates:delete": ["super_admin", "admin"],
  "org:estimates:approve": ["super_admin", "admin", "project_manager", "sales_manager"],
  "org:estimates:send": ["super_admin", "admin", "project_manager", "sales_manager"],
  "org:estimates:view": ["super_admin", "admin", "project_manager", "accountant", "sales_manager"],

  // Organization Estimates to Approvals (route estimates through approval system)
  "org:estimates:submit_for_approval": ["super_admin", "admin", "project_manager", "sales_manager"],
  "org:estimates:approvals": ["super_admin", "admin", "accountant"],

  "org:sales:receipts": ["super_admin", "admin", "accountant", "project_manager", "sales_manager"],


  // Organization Procurement
  "org:procurement:view": ["super_admin", "admin", "procurement_manager"],
  "org:procurement:suppliers": ["super_admin", "admin"],
  "org:procurement:suppliers:view": ["super_admin", "admin"],
  "org:procurement:suppliers:create": ["super_admin", "admin"],
  "org:procurement:suppliers:edit": ["super_admin", "admin"],
  "org:procurement:suppliers:delete": ["super_admin", "admin"],

  "org:procurement:lpo": ["super_admin", "admin"],
  "org:procurement:lpo:view": ["super_admin", "admin", "accountant", "project_manager"],
  "org:procurement:lpo:create": ["super_admin", "admin", "project_manager"],
  "org:procurement:lpo:edit": ["super_admin", "admin", "project_manager"],
  "org:procurement:lpo:delete": ["super_admin", "admin"],
  "org:procurement:lpo:approve": ["super_admin", "admin"],

  "org:procurement:imprest": ["super_admin", "admin"],
  "org:procurement:imprest:view": ["super_admin", "admin", "accountant"],
  "org:procurement:imprest:create": ["super_admin", "admin", "staff"],
  "org:procurement:imprest:edit": ["super_admin", "admin"],
  "org:procurement:imprest:delete": ["super_admin", "admin"],
  "org:procurement:imprest:approve": ["super_admin", "admin"],

  "org:procurement:orders": ["super_admin", "admin"],
  "org:procurement:orders:view": ["super_admin", "admin", "procurement_manager"],
  "org:procurement:orders:create": ["super_admin", "admin", "procurement_manager"],
  "org:procurement:orders:edit": ["super_admin", "admin", "procurement_manager"],
  "org:procurement:orders:delete": ["super_admin", "admin"],
  // Analytics view permission used by dashboard and reports
  "org:analytics:view": ["super_admin", "admin", "accountant", "project_manager", "ict_manager", "sales_manager"],

  // Organization Communications / email queue management
  "org:communications:email_queue": ["super_admin", "admin", "ict_manager"],

  // Organization Authentication utilities
  "org:auth:sessions": ["super_admin", "admin", "ict_manager"],
  "org:auth:export_user_data": ["super_admin", "admin", "ict_manager"],

  // Clients Features
  "org:clients:view": ["super_admin", "admin", "accountant", "project_manager", "procurement_manager", "sales_manager"],
  "org:clients:create": ["super_admin", "admin", "project_manager", "sales_manager"],
  "org:clients:edit": ["super_admin", "admin", "project_manager", "sales_manager"],
  "org:clients:delete": ["super_admin", "admin"],
  "org:clients:manage_relationships": ["super_admin", "admin", "project_manager", "sales_manager"],

  // Products & Services
  "org:products:view": ["super_admin", "admin", "accountant", "project_manager", "staff", "procurement_manager"],
  "org:products:create": ["super_admin", "admin"],
  "org:products:edit": ["super_admin", "admin"],
  "org:products:delete": ["super_admin", "admin"],
  "org:products:manage_inventory": ["super_admin", "admin", "procurement_manager"],

  "org:services:view": ["super_admin", "admin", "project_manager", "staff"],
  "org:services:create": ["super_admin", "admin"],
  "org:services:edit": ["super_admin", "admin"],
  "org:services:delete": ["super_admin", "admin"],

  // Organization Projects Features
  "org:projects:view": ["super_admin", "admin", "project_manager", "staff"],
  "org:projects:create": ["super_admin", "admin", "project_manager"],
  "org:projects:edit": ["super_admin", "admin", "project_manager"],
  "org:projects:delete": ["super_admin", "admin"],
  "org:projects:manage_team": ["super_admin", "admin", "project_manager"],
  "org:projects:manage_milestones": ["super_admin", "admin", "project_manager"],
  "org:projects:manage_budget": ["super_admin", "admin", "accountant", "project_manager"],

  // Organization Sales Features
  "org:sales:view": ["super_admin", "admin", "project_manager", "accountant", "sales_manager"],
  "org:sales:create": ["super_admin", "admin", "project_manager", "sales_manager"],
  "org:sales:edit": ["super_admin", "admin", "project_manager", "sales_manager"],
  "org:sales:delete": ["super_admin", "admin"],
  "org:sales:pipeline": ["super_admin", "admin", "project_manager", "sales_manager"],
  "org:sales:opportunities": ["super_admin", "admin", "project_manager", "sales_manager"],
  "org:sales:opportunities:create": ["super_admin", "admin", "project_manager", "sales_manager"],
  "org:sales:opportunities:edit": ["super_admin", "admin", "project_manager", "sales_manager"],
  "org:sales:opportunities:delete": ["super_admin", "admin"],

  // Organization Dashboard Features
  "org:dashboard:view": ["super_admin", "admin", "accountant", "project_manager", "hr", "staff", "ict_manager", "sales_manager"],
  "org:dashboard:customize": ["super_admin", "admin", "project_manager", "sales_manager"],
  "org:dashboard:edit": ["super_admin", "admin"],

  // Organization Departments Features
  "org:departments:view": ["super_admin", "admin", "hr", "project_manager"],
  "org:departments:create": ["super_admin", "admin", "hr"],
  "org:departments:edit": ["super_admin", "admin", "hr"],
  "org:departments:delete": ["super_admin", "admin"],
  "org:departments:read": ["super_admin", "admin", "hr", "project_manager"],

  // Organization Reports Features (with department access)
  "org:reports:view": ["super_admin", "admin", "accountant", "project_manager", "hr", "sales_manager", "ict_manager"],
  "org:reports:create": ["super_admin", "admin"],
  "org:reports:financial": ["super_admin", "admin", "accountant"],
  "org:reports:sales": ["super_admin", "admin", "project_manager", "accountant", "sales_manager"],
  "org:reports:projects": ["super_admin", "admin", "project_manager"],
  "org:reports:hr": ["super_admin", "admin", "hr"],
  "org:reports:procurement": ["super_admin", "admin", "procurement_manager"],
  "org:reports:export": ["super_admin", "admin", "accountant", "project_manager", "hr"],
  "org:reports:departments": ["super_admin", "admin", "hr"],

  // Organization AI Features - Chat & Assistance
  "org:ai:access": ["super_admin", "admin", "project_manager", "sales_manager", "accountant", "hr", "staff", "ict_manager"],
  "org:ai:summarize": ["super_admin", "admin", "project_manager", "sales_manager", "accountant", "hr", "staff", "ict_manager"],
  "org:ai:generateEmail": ["super_admin", "admin", "project_manager", "sales_manager", "accountant", "hr", "staff", "ict_manager"],
  "org:ai:chat": ["super_admin", "admin", "project_manager", "sales_manager", "accountant", "hr", "staff", "ict_manager"],
  "org:ai:financial": ["super_admin", "admin", "project_manager", "sales_manager", "accountant", "hr", "ict_manager"],
  "org:ai:modal": ["super_admin", "admin", "project_manager", "sales_manager", "accountant", "hr", "staff", "ict_manager"],

  // Organization Chat/IntraChat Features
  "org:communications:chat": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager", "ict_manager"],
  "org:communications:intrachat": ["super_admin", "admin", "staff", "project_manager", 'sales_manager', 'accountant', 'hr', 'staff', 'ict_manager'],
  "org:communications:ai_assistant": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager", "ict_manager"],
  // Organization Support & Communications
  "org:communications:view": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager", "ict_manager"],
  "org:communications:manage": ["super_admin", "admin", "ict_manager", "hr", "accountant", "sales_manager", "project_manager"],

  // Organization Notifications
  "org:notifications:read": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager", "ict_manager"],
  "org:notifications:create": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager", "ict_manager"],
  "org:communications:email": ["super_admin", "admin", "ict_manager", "hr", "accountant", "sales_manager", "project_manager"],
  "org:communications:notifications": ["super_admin", "admin", 'project_manager', 'sales_manager', 'accountant', 'hr', 'staff', 'ict_manager'],
  "org:communications:tickets": ["super_admin", 'project_manager', 'sales_manager', 'accountant', 'hr', 'staff', 'ict_manager'],
  "org:communications:tickets:create": ["super_admin", "admin", 'project_manager', 'sales_manager', 'accountant', 'hr', 'staff', 'ict_manager'],
  "org:communications:tickets:resolve": ['super_admin', 'admin', 'project_manager', 'sales_manager', 'accountant', 'hr', 'staff', 'ict_manager'],

  // Organization Tools & Utilities
  "org:tools:import_export": ["super_admin", "admin", "accountant", "project_manager", "sales_manager", "procurement_manager", "ict_manager", "hr", "staff", "client"],
  "org:tools:import:create": ["super_admin", "admin", "accountant", "project_manager", "sales_manager", "procurement_manager", "ict_manager", "hr", "staff", "client"],
  "org:tools:import:read": ["super_admin", "admin", "accountant", "project_manager", "sales_manager", "procurement_manager", "ict_manager", "hr", "staff", "client"],
  "org:tools:import:restore": ["super_admin", "admin"],
  "org:tools:export:create": ["super_admin", "admin", "accountant", "project_manager", "sales_manager", "procurement_manager", "ict_manager", "hr", "staff", "client"],
  "org:tools:data_export": ["super_admin", "admin", "accountant", "project_manager", "sales_manager", "procurement_manager", "ict_manager", "hr", "staff", "client"],
  "org:tools:data_backup": ["super_admin", "admin", "ict_manager"],
  "org:tools:system_health": ["super_admin", "admin", "ict_manager"],
  "org:tools:api_management": ["super_admin", "admin", "ict_manager"],
  "org:tools:automation": ["super_admin", "admin", "ict_manager"],
  "org:tools:workflows": ["super_admin", "admin", "ict_manager"],

  // Organization Client Portal
  "org:client_portal:dashboard": ["client"],
  "org:client_portal:invoices": ["client"],
  "org:client_portal:projects": ["client"],
  "org:client_portal:payments": ["client"],

  // Organization Approvals Features
  "org:approvals:view": ["super_admin", "admin", "accountant", "hr"],
  "org:approvals:read": ["super_admin", "admin", "accountant", "hr"],
  "org:approvals:approve": ["super_admin", "admin", "accountant", "hr"],
  "org:approvals:reject": ["super_admin", "admin", "accountant", "hr"],
  "org:approvals:delete": ["super_admin", "admin"],

  // Organization Chart of Accounts Features
  "org:chartOfAccounts:read": ["super_admin", "admin", "accountant"],
  "org:chartOfAccounts:create": ["super_admin", "admin", "accountant"],
  "org:chartOfAccounts:edit": ["super_admin", "admin", "accountant"],
  "org:chartOfAccounts:delete": ["super_admin", "admin"],

  // Organization Budgets Features (prefix: budgets)
  "org:budgets:view": ["super_admin", "admin", "accountant", "project_manager"],
  "org:budgets:create": ["super_admin", "admin", "accountant"],
  "org:budgets:edit": ["super_admin", "admin", "accountant"],
  "org:budgets:delete": ["super_admin", "admin"],

  // Organization Budget Features (prefix: budget - used by budget router)
  "org:budget:read": ["super_admin", "admin", "accountant", "project_manager"],
  "org:budget:edit": ["super_admin", "admin", "accountant"],

  // Organization Invoice Features
  "org:invoices:view": ["super_admin", "admin", "accountant", "project_manager"],
  "org:invoices:create": ["super_admin", "admin", "accountant"],
  "org:invoices:edit": ["super_admin", "admin", "accountant"],
  "org:invoices:delete": ["super_admin", "admin"],
  "org:invoices:read": ["super_admin", "admin", "accountant", "project_manager"],

  // Organization Expense Features
  "org:expenses:view": ["super_admin", "admin", "accountant", "project_manager"],
  "org:expenses:create": ["super_admin", "admin", "accountant", "staff"],
  "org:expenses:edit": ["super_admin", "admin", "accountant"],
  "org:expenses:delete": ["super_admin", "admin"],
  "org:expenses:read": ["super_admin", "admin", "accountant", "project_manager"],

  // Organization Payment Features
  "org:payments:view": ["super_admin", "admin", "accountant", "project_manager"],
  "org:payments:create": ["super_admin", "admin", "accountant"],
  "org:payments:edit": ["super_admin", "admin", "accountant"],
  "org:payments:delete": ["super_admin", "admin"],
  "org:payments:read": ["super_admin", "admin", "accountant", "project_manager"],
  "org:payments:reconcile": ["super_admin", "admin", "accountant"],

  // Organization Client Features (ensure all CRUD operations exist)
  "org:clients:read": ["super_admin", "admin", "project_manager", "accountant", "procurement_manager", "ict_manager", "sales_manager"],

  // Organization Communications Features
  "org:communications:read": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager", "ict_manager", "procurement_manager"],
  "org:communications:messaging": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager", "ict_manager", "procurement_manager"],
  "org:communications:send": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager", "ict_manager", "procurement_manager"],

  // Organization Filters & Saved Views
  "org:filters:create": ["super_admin", "admin", "accountant", "project_manager", "hr", "staff", "ict_manager", "procurement_manager", "sales_manager", "client"],
  "org:filters:read": ["super_admin", "admin", "accountant", "project_manager", "hr", "staff", "ict_manager", "procurement_manager", "sales_manager", "client"],
  "org:filters:update": ["super_admin", "admin", "accountant", "project_manager", "hr", "staff", "ict_manager", "procurement_manager", "sales_manager", "client"],
  "org:filters:delete": ["super_admin", "admin", "accountant", "project_manager", "hr", "staff", "ict_manager", "procurement_manager", "sales_manager", "client"],

  // Phase 20 - Organization Business Intelligence & Analytics
  "org:analytics:reports": ["super_admin", "admin", "accountant", "project_manager", "hr", "sales_manager"],
  "org:analytics:dashboards": ["super_admin", "admin", "project_manager", "accountant"],
  "org:analytics:export": ["super_admin", "admin", "accountant"],

  // Phase 20 - Organization Supplier Management
  "org:suppliers:view": ["super_admin", "admin", "procurement_manager"],
  "org:suppliers:create": ["super_admin", "admin", "procurement_manager"],
  "org:suppliers:edit": ["super_admin", "admin", "procurement_manager"],
  "org:suppliers:delete": ["super_admin", "admin"],
  "org:suppliers:read": ["super_admin", "admin", "procurement_manager"],

  //  Phase 20 - Organization Quotations/RFQs
  "org:quotations:view": ["super_admin", "admin", "procurement_manager", "accountant"],
  "org:quotations:create": ["super_admin", "admin", "procurement_manager"],
  "org:quotations:edit": ["super_admin", "admin", "procurement_manager"],
  "org:quotations:delete": ["super_admin", "admin"],
  "org:quotations:approve": ["super_admin", "admin"],

  // Phase 20 - Organization Delivery Notes  
  "org:delivery_notes:view": ["super_admin", "admin", "procurement_manager", "accountant", "staff"],
  "org:delivery_notes:create": ["super_admin", "admin", "procurement_manager", "staff"],
  "org:delivery_notes:edit": ["super_admin", "admin", "procurement_manager"],
  "org:delivery_notes:delete": ["super_admin", "admin"],

  // Phase 20 - Organization Goods Received Notes
  "org:grn:view": ["super_admin", "admin", "procurement_manager", "accountant", "staff"],
  "org:grn:create": ["super_admin", "admin", "procurement_manager", "staff"],
  "org:grn:edit": ["super_admin", "admin", "procurement_manager"],
  "org:grn:delete": ["super_admin", "admin"],

  // Phase 20 - Organization Warranty Management
  "org:warranty:view": ["super_admin", "admin", "ict_manager", "procurement_manager"],
  "org:warranty:create": ["super_admin", "admin", "ict_manager", "procurement_manager"],
  "org:warranty:edit": ["super_admin", "admin", "ict_manager", "procurement_manager"],
  "org:warranty:delete": ["super_admin", "admin"],

  // Phase 20 - Organization Asset Management
  "org:assets:view": ["super_admin", "admin", "ict_manager", "procurement_manager"],
  "org:assets:create": ["super_admin", "admin", "ict_manager", "procurement_manager"],
  "org:assets:edit": ["super_admin", "admin", "ict_manager", "procurement_manager"],
  "org:assets:delete": ["super_admin", "admin"],

  // Phase 20 - Organization Document Management
  "org:documents:view": ["super_admin", "admin", "staff", "project_manager"],
  "org:documents:create": ["super_admin", "admin", "staff", "project_manager"],
  "org:documents:edit": ["super_admin", "admin", "project_manager"],
  "org:documents:delete": ["super_admin", "admin"],
  "org:documents:upload": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant"],

  // Phase 20 - Organization Contract Management
  "org:contracts:view": ["super_admin", "admin", "procurement_manager", "accountant"],
  "org:contracts:create": ["super_admin", "admin", "procurement_manager"],
  "org:contracts:edit": ["super_admin", "admin", "procurement_manager"],
  "org:contracts:delete": ["super_admin", "admin"],
  "org:contracts:approve": ["super_admin", "admin"],

  // Organization Remaining missing features
  "org:leave:read": ["super_admin", "admin", "hr"],
  "org:leave:approve": ["super_admin", "hr"],
  "org:leave:create": ["super_admin", "admin", "hr", "staff"],
  "org:leave:delete": ["super_admin", "admin", "hr"],

  // Organization Settings Features
  "org:settings:view": ["super_admin", "admin", "ict_manager"],
  "org:settings:edit": ["super_admin", "admin"],
  "org:settings:general": ["super_admin", "admin"],
  "org:settings:company": ["super_admin", "admin"],
  "org:settings:currency": ["super_admin", "admin"],
  "org:settings:theme": ["super_admin", "admin"],
  "org:settings:branding": ["super_admin", "admin"],
  "org:settings:email": ["super_admin", "admin", "ict_manager"],
  "org:settings:email_templates": ["super_admin", "admin", "ict_manager"],
  "org:settings:security": ["super_admin", "admin", "ict_manager"],
  "org:settings:security_password": ["super_admin", "admin", "ict_manager"],
  "org:settings:security_2fa": ["super_admin", "admin", "ict_manager"],
  "org:settings:security_sessions": ["super_admin", "admin", "ict_manager"],
  "org:settings:security_log": ["super_admin", "admin", "ict_manager"],
  "org:settings:roles": ["super_admin", "admin"],
  "org:settings:permissions": ["super_admin"],
  "org:settings:notifications": ["super_admin", "admin"],
  "org:settings:sms": ["super_admin", "admin", "ict_manager"],
  "org:settings:sms_templates": ["super_admin", "admin", "ict_manager"],
  "org:settings:backup": ["super_admin", "admin", "ict_manager"],
};

/**
 * Check if user has permission for a feature
 * Supports both explicit features and wildcard permissions
 * 
 * Examples:
 * - canAccessFeature("super_admin", "clients:read")
 * - With ROLE_PERMISSIONS["super_admin"] = ["clients:*"], this returns true
 */
export function canAccessFeature(userRole: UserRole, feature: string): boolean {
  // Super admin has unrestricted access to all features
  if (userRole === ROLES.SUPER_ADMIN) return true;

  // First, check if the exact feature is in FEATURE_ACCESS
  const allowedRoles = FEATURE_ACCESS[feature];
  if (allowedRoles && allowedRoles.includes(userRole)) {
    return true;
  }

  // Second, check if user has explicit permission for this feature
  const userPermissions = ROLE_PERMISSIONS[userRole];
  if (!userPermissions) return false;
  if (userPermissions.includes(feature)) return true;

  // Third, check if user has wildcard permission for this module
  // Example: feature="clients:read", userRole has "clients:*" in ROLE_PERMISSIONS
  const modulePrefix = feature.split(":")[0];
  return userPermissions.includes(`${modulePrefix}:*`);
}

/**
 * Check if a custom role's permissions include a specific feature
 * Supports wildcards in the custom role's permission list
 */
function getPermissionAliases(feature: string): Set<string> {
  const normalized = feature.replace(/^org:/, "");
  const parts = normalized.split(":");
  const module = parts[0];
  const resource = parts.length > 2 ? parts[1] : parts[0];
  const action = parts.length > 1 ? parts[parts.length - 1] : "";
  const aliases = new Set([feature, normalized]);

  if (!action) return aliases;

  const actionAliases: Record<string, string[]> = {
    view: ["view", "read"],
    read: ["read", "view"],
    edit: ["edit", "update"],
    update: ["update", "edit"],
  };
  const normalizedActions = actionAliases[action] || [action];
  for (const actionAlias of normalizedActions) {
    aliases.add(`${resource}:${actionAlias}`);
    aliases.add(`${resource}_${actionAlias}`);
    if (module !== resource) {
      aliases.add(`${module}:${resource}:${actionAlias}`);
      aliases.add(`${module}_${resource}_${actionAlias}`);
    }
  }

  if ((resource === "employees" || module === "employees") && ["read", "view", "edit", "update"].includes(action)) {
    aliases.add("hr_employees_manage");
    aliases.add("hr_view");
  }

  return aliases;
}

function permissionKeyMatches(grantedKey: string, feature: string): boolean {
  if (!grantedKey) return false;
  if (grantedKey === "*") return true;

  return Array.from(getPermissionAliases(feature)).some((alias) =>
    grantedKey === alias ||
    (grantedKey.endsWith(":*") && alias.startsWith(grantedKey.slice(0, -1)))
  );
}

export function customRoleCanAccessFeature(customPermissions: string[], feature: string): boolean {
  if (!customPermissions || customPermissions.length === 0) return false;
  return customPermissions.some((permission) => permissionKeyMatches(permission, feature));
}

function normalizeSystemRole(role: unknown): UserRole {
  return String(role || "").trim().toLowerCase().replace(/[\s-]+/g, "_") as UserRole;
}

/**
 * Resolve user permissions - checks custom role first, then falls back to system role
 * This is the primary permission check that should be used in procedures
 */
export async function resolveUserPermission(
  userId: string,
  userRole: UserRole,
  customRoleId: string | null | undefined,
  feature: string
): Promise<boolean> {
  userRole = normalizeSystemRole(userRole);
  // Super admin always has access
  if (userRole === ROLES.SUPER_ADMIN) return true;

  const featureAliases: Record<string, string[]> = {
    "chat:read": ["communications:read", "communications:chat", "communications:intrachat"],
    "chat:send": ["communications:send", "communications:messaging", "communications:chat"],
    "chat:delete": ["communications:manage", "communications:messaging"],
    "admin:settings": ["settings_view", "settings_edit", "settings_manage_roles"],
    "permissions:read": ["users_manage_permissions", "settings_manage_roles", "settings_view"],
    "permissions:manage": ["users_manage_permissions", "settings_manage_roles"],
  };
  const candidateFeatures = [feature, ...(featureAliases[feature] || [])];

  // Explicit user grants take precedence over role defaults. The permissions
  // table has existed with both (resource, action) and full permission-key
  // values, so accept both representations here.
  try {
    const db = await getDb();
    if (db) {
      const explicitPermissions = await db.select({
        resource: userPermissions.resource,
        action: userPermissions.action,
        granted: userPermissions.granted,
      }).from(userPermissions).where(eq(userPermissions.userId, userId));
      const userRows = await db.select({ permissions: users.permissions }).from(users).where(eq(users.id, userId)).limit(1);
      const storedPermissions: string[] = userRows[0]?.permissions
        ? JSON.parse(String(userRows[0].permissions))
        : [];

      const matches = candidateFeatures.some((candidate) =>
        explicitPermissions.some((permission) => {
          if (!Number(permission.granted)) return false;
          const storedResource = String(permission.resource || "");
          const storedAction = String(permission.action || "");
          return permissionKeyMatches(storedResource, candidate)
            || (storedAction !== "access" && (
              permissionKeyMatches(`${storedResource}:${storedAction}`, candidate)
              || permissionKeyMatches(`${storedResource}_${storedAction}`, candidate)
            ))
            || (storedResource === "*" && storedAction === "*");
        })
      );

      if (matches || candidateFeatures.some((candidate) =>
        storedPermissions.some((permission) => permissionKeyMatches(permission, candidate))
      )) return true;
    }
  } catch {
    // Continue with custom and system role resolution if the explicit grant
    // lookup is unavailable during a migration or partial schema state.
  }

  // If user has a custom role, check custom role permissions
  if (customRoleId) {
    try {
      const db = await getDb();
      if (db) {
        const normalizedCustomRoleId = String(customRoleId).replace(/^custom_/, "");
        const roles = await db.select().from(customRoles)
          .where(and(eq(customRoles.id, normalizedCustomRoleId), eq(customRoles.isActive, 1)))
          .limit(1);
        
        if (roles.length > 0 && roles[0].permissions) {
          const perms: string[] = JSON.parse(roles[0].permissions as string);
          if (candidateFeatures.some((candidate) => customRoleCanAccessFeature(perms, candidate))) return true;
          
          // If custom role has a baseRole, also check baseRole permissions
          if (roles[0].baseRole) {
            return candidateFeatures.some((candidate) => canAccessFeature(roles[0].baseRole as UserRole, candidate));
          }
          return false;
        }
      }
    } catch (e) {
      // Fall through to system role check on error
    }
  }

  // Fall back to system role
  return candidateFeatures.some((candidate) => canAccessFeature(userRole, candidate));
}

/**
 * Create a role-restricted procedure
 */
export function createRoleRestrictedProcedure(allowedRoles: UserRole[]) {
  return protectedProcedure.use(({ ctx, next }) => {
    if (!allowedRoles.includes(ctx.user.role as UserRole)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Access denied. Required roles: ${allowedRoles.join(", ")}. Your role: ${ctx.user.role}`,
      });
    }
    return next({ ctx });
  });
}

/**
 * Create a feature-restricted procedure
 * Supports both system roles and custom roles with dynamic permission lookup
 */
export function createFeatureRestrictedProcedure(feature: string | string[], ...additionalFeatures: string[]) {
  return protectedProcedure.use(async ({ ctx, next }) => {
    const baseRole = normalizeSystemRole(ctx.user.role);
    const effectiveRole = normalizeSystemRole((ctx.user as any).effectiveRole);
    const userRole = baseRole === ROLES.SUPER_ADMIN || effectiveRole === ROLES.SUPER_ADMIN
      ? ROLES.SUPER_ADMIN
      : effectiveRole || baseRole;
    const customRoleId = (ctx.user as any).customRoleId;
    
    const features = [...(Array.isArray(feature) ? feature : [feature]), ...additionalFeatures];
    let hasAccess = false;
    
    for (const f of features) {
      const access = await resolveUserPermission(ctx.user.id, userRole, customRoleId, f);
      if (access) {
        hasAccess = true;
        break;
      }
    }
    
    if (!hasAccess) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Access denied. You don't have permission to access: ${Array.isArray(feature) ? feature.join(', ') : feature}`,
      });
    }
    if (ctx.user.organizationId && userRole !== ROLES.SUPER_ADMIN) {
      await requireOrganizationFeatureAccess(ctx.user.organizationId, features);
    }
    // Block org-scoped users from global-only features (enterprise, admin:manage_*)
    const GLOBAL_ONLY_PREFIXES = ["enterprise:", "admin:manage_"];
    const hasGlobalOnly = features.some(f => GLOBAL_ONLY_PREFIXES.some(p => f.startsWith(p)));
    if (ctx.user.organizationId && userRole !== ROLES.SUPER_ADMIN && hasGlobalOnly) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "This resource is only accessible to platform administrators",
      });
    }
    return next({ ctx });
  });
}

/**
 * Get all accessible features for a user role
 */
export function getAccessibleFeatures(userRole: UserRole): string[] {
  // Super admin has access to all features
  if (userRole === ROLES.SUPER_ADMIN) {
    return Object.keys(FEATURE_ACCESS);
  }

  return Object.entries(FEATURE_ACCESS)
    .filter(([_, roles]) => roles.includes(userRole))
    .map(([feature]) => feature);
}

/**
 * Check if organization scopes match (for multi-org systems).
 * 
 * Only Kiini platform admins (super_admin with NO organizationId) can
 * access any org.  Org-scoped super_admins (who have an organizationId) are
 * restricted to their own organization.
 */
export function checkOrgScopeAccess(ctx: any, targetOrgId: string): boolean {
  // Kiini platform admin — has super_admin role but belongs to no org
  if (ctx.user.role === "super_admin" && !ctx.user.organizationId) return true;

  // Everyone else (including org super_admins) can only access their own org
  return ctx.user.organizationId === targetOrgId;
}

/**
 * Create an org-scoped procedure
 */
export function createOrgScopedProcedure() {
  return protectedProcedure.use(({ ctx, next }) => {
    if (!ctx.user.organizationId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "User must be part of an organization to access this resource",
      });
    }
    return next({ ctx });
  });
}
