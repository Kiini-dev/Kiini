/**
 * Organization-Level Permission and Access Control Utilities
 * 
 * This module provides utilities for:
 * - Checking org-level feature access
 * - Org-scoped role-based access control
 * - Feature availability in org context
 * - Navigation filtering based on org features
 */

import type { UserRole } from "./permissions";

/**
 * Features available in org dashboards
 * Maps to the global feature set with org-level scoping
 */
export const ORG_FEATURE_ACCESS: Record<string, UserRole[]> = {
  // CRM Features
  "org:crm": ["super_admin", "admin", "staff", "project_manager", "sales_manager"],
  "org:crm:view": ["super_admin", "admin", "staff", "project_manager", "sales_manager"],
  "org:crm:manage": ["super_admin", "admin", "project_manager"],
  "org:clients": ["super_admin", "admin", "project_manager", "staff"],
  "org:contacts": ["super_admin", "admin", "project_manager", "staff"],
  "org:leads": ["super_admin", "admin", "sales_manager", "project_manager"],
  "org:pipeline": ["super_admin", "admin", "sales_manager", "project_manager"],
  "org:calendar": ["super_admin", "admin", "staff", "project_manager"],
  "org:activity": ["super_admin", "admin", "staff"],
  "org:approvals": ["super_admin", "admin", "accountant", "hr"],

  // Finance Features
  "org:invoicing": ["super_admin", "admin", "accountant", "project_manager"],
  "org:invoicing:view": ["super_admin", "admin", "accountant", "project_manager"],
  "org:invoicing:create": ["super_admin", "admin", "accountant"],
  "org:invoicing:edit": ["super_admin", "admin", "accountant"],
  "org:invoicing:approve": ["super_admin", "admin", "accountant"],
  "org:payments": ["super_admin", "admin", "accountant"],
  "org:payments:view": ["super_admin", "admin", "accountant"],
  "org:payments:record": ["super_admin", "admin", "accountant"],
  "org:expenses": ["super_admin", "admin", "accountant", "project_manager", "staff"],
  "org:expenses:view": ["super_admin", "admin", "accountant", "project_manager", "staff"],
  "org:expenses:create": ["super_admin", "admin", "accountant", "staff"],
  "org:expenses:approve": ["super_admin", "admin", "accountant"],
  "org:receipts": ["super_admin", "admin", "accountant"],
  "org:receipts:view": ["super_admin", "admin", "accountant"],
  "org:receipts:create": ["super_admin", "admin", "accountant"],
  "org:estimates": ["super_admin", "admin", "accountant", "project_manager"],
  "org:estimates:view": ["super_admin", "admin", "accountant", "project_manager"],
  "org:estimates:create": ["super_admin", "admin", "accountant"],
  "org:credit_notes": ["super_admin", "admin", "accountant"],
  "org:debit_notes": ["super_admin", "admin", "accountant"],
  "org:subscriptions": ["super_admin", "admin", "accountant"],

  // Accounting Features
  "org:accounting": ["super_admin", "admin", "accountant"],
  "org:accounting:view": ["super_admin", "admin", "accountant"],
  "org:chart_of_accounts": ["super_admin", "admin", "accountant"],
  "org:bank_reconciliation": ["super_admin", "admin", "accountant"],
  "org:financial_dashboard": ["super_admin", "admin", "accountant", "project_manager"],
  "org:forecasting": ["super_admin", "admin", "accountant"],
  "org:tax_compliance": ["super_admin", "admin", "accountant"],
  "org:budgets": ["super_admin", "admin", "accountant", "project_manager"],

  // Purchasing Features
  "org:procurement": ["super_admin", "admin", "procurement_manager"],
  "org:procurement:view": ["super_admin", "admin", "procurement_manager"],
  "org:procurement:create": ["super_admin", "admin", "procurement_manager"],
  "org:suppliers": ["super_admin", "admin", "procurement_manager"],
  "org:purchase_orders": ["super_admin", "admin", "procurement_manager"],
  "org:orders": ["super_admin", "admin", "procurement_manager"],
  "org:lpos": ["super_admin", "admin", "procurement_manager"],

  // Projects Features
  "org:projects": ["super_admin", "admin", "project_manager", "staff"],
  "org:projects:view": ["super_admin", "admin", "project_manager", "staff"],
  "org:projects:create": ["super_admin", "admin", "project_manager"],
  "org:projects:manage": ["super_admin", "admin", "project_manager"],
  "org:tasks": ["super_admin", "admin", "project_manager", "staff"],
  "org:tasks:view": ["super_admin", "admin", "project_manager", "staff"],
  "org:tasks:create": ["super_admin", "admin", "project_manager", "staff"],

  // HR Features
  "org:hr": ["super_admin", "admin", "hr"],
  "org:hr:view": ["super_admin", "admin", "hr", "staff"],
  "org:employees": ["super_admin", "admin", "hr"],
  "org:employees:view": ["super_admin", "admin", "hr", "staff", "project_manager"],
  "org:employees:manage": ["super_admin", "admin", "hr"],
  "org:attendance": ["super_admin", "admin", "hr", "staff"],
  "org:attendance:view": ["super_admin", "admin", "hr", "staff"],
  "org:attendance:create": ["super_admin", "admin", "hr", "staff"],
  "org:leave": ["super_admin", "admin", "hr", "staff"],
  "org:leave:view": ["super_admin", "admin", "hr", "staff"],
  "org:leave:request": ["super_admin", "admin", "hr", "staff"],
  "org:leave:approve": ["super_admin", "hr"],
  "org:payroll": ["super_admin", "admin", "hr"],
  "org:payroll:view": ["super_admin", "admin", "hr"],
  "org:payroll:manage": ["super_admin", "admin", "hr"],
  "org:departments": ["super_admin", "admin", "hr"],
  "org:job_groups": ["super_admin", "admin", "hr"],
  "org:performance_reviews": ["super_admin", "admin", "hr"],

  // Inventory Features
  "org:inventory": ["super_admin", "admin", "procurement_manager"],
  "org:inventory:view": ["super_admin", "admin", "procurement_manager"],
  "org:products": ["super_admin", "admin", "procurement_manager"],
  "org:services": ["super_admin", "admin", "procurement_manager"],
  "org:warehouses": ["super_admin", "admin", "procurement_manager"],

  // Support Features
  "org:tickets": ["super_admin", "admin", "staff"],
  "org:tickets:view": ["super_admin", "admin", "staff"],
  "org:tickets:create": ["super_admin", "admin", "staff"],
  "org:tickets:manage": ["super_admin", "admin"],
  "org:knowledgebase": ["super_admin", "admin", "staff"],
  "org:knowledgebase:view": ["super_admin", "admin", "staff"],

  // Analytics & Reporting
  "org:analytics": ["super_admin", "admin", "accountant", "project_manager"],
  "org:analytics:view": ["super_admin", "admin", "accountant", "project_manager"],
  "org:reports": ["super_admin", "admin", "accountant", "project_manager"],
  "org:reports:view": ["super_admin", "admin", "accountant", "project_manager"],

  // Communications
  "org:communications": ["super_admin", "admin", "staff"],
  "org:communications:view": ["super_admin", "admin", "staff"],
  "org:documents": ["super_admin", "admin", "staff"],
  "org:documents:view": ["super_admin", "admin", "staff"],
  "org:documents:create": ["super_admin", "admin", "staff"],

  // Settings
  "org:settings": ["super_admin", "admin"],
  "org:settings:view": ["super_admin", "admin"],
  "org:settings:manage": ["super_admin", "admin"],
  "org:billing": ["super_admin", "admin"],
  "org:billing:view": ["super_admin", "admin"],
  "org:billing:manage": ["super_admin", "admin"],
  "org:staff": ["super_admin", "admin"],
};

/**
 * Check if a user role has access to an org feature
 * @param userRole The user's role
 * @param feature The feature to check access for
 * @returns Whether the user has access to the feature
 */
export const ORG_ROUTE_FEATURE_KEYS: Record<string, string> = {
  "crm": "crm",
  "contacts": "crm",
  "leads": "crm",
  "pipeline": "crm",
  "calendar": "crm",
  "clients": "crm",
  "invoices": "invoicing",
  "payments": "payments",
  "expenses": "expenses",
  "projects": "projects",
  "tasks": "projects",
  "tickets": "tickets",
  "knowledge-base": "tickets",
  "hr": "hr",
  "employees": "hr",
  "departments": "hr",
  "attendance": "attendance",
  "payroll": "hr",
  "leave": "leave",
  "job-groups": "hr",
  "performance-reviews": "hr",
  "reports": "reports",
  "communications": "communications",
  "ai": "ai_hub",
  "procurement": "procurement",
  "contracts": "contracts",
  "work-orders": "work_orders",
  "budgets": "budgets",
  "accounting": "accounting",
  "billing": "org:billing",
  "settings": "org:settings",
  "subscriptions": "org:subscriptions",
};

export function getOrgFeatureKeyForRoute(routePath: string): string | null {
  const normalized = routePath.replace(/^\/+|\/+$/g, "");
  if (!normalized || normalized === "org") return null;
  const segments = normalized.split("/").filter(Boolean);
  if (segments.length >= 2 && segments[0] === "org") {
    const route = segments.slice(2).join("/");
    if (!route) return null;
    const routeKey = route.split("/")[0];
    return ORG_ROUTE_FEATURE_KEYS[routeKey] ?? null;
  }
  return null;
}

export function canAccessOrgFeature(userRole: UserRole | string, feature: string): boolean {
  if (!userRole) return false;
  
  const requiredRoles = ORG_FEATURE_ACCESS[feature];
  if (!requiredRoles) {
    // Feature not defined, deny by default for security
    return false;
  }
  
  return requiredRoles.includes(userRole as UserRole);
}

/**
 * Get all accessible features for a user role
 * @param userRole The user's role
 * @returns Array of accessible features
 */
export function getAccessibleOrgFeatures(userRole: UserRole | string): string[] {
  return Object.entries(ORG_FEATURE_ACCESS)
    .filter(([_, roles]) => roles.includes(userRole as UserRole))
    .map(([feature]) => feature);
}

/**
 * Check if org has feature enabled via featureMap
 * @param orgFeatureMap The org's feature map
 * @param feature The feature key (without org: prefix)
 * @returns Whether the org has the feature enabled
 */
export function isOrgFeatureEnabled(orgFeatureMap: Record<string, boolean>, feature: string): boolean {
  // Remove 'org:' prefix if present
  const cleanFeature = feature.startsWith("org:") ? feature.slice(4) : feature;
  return orgFeatureMap[cleanFeature] === true;
}

/**
 * Check both role AND org feature availability
 * @param userRole The user's role
 * @param orgFeatureMap The org's feature map
 * @param feature The feature to check (with or without 'org:' prefix)
 * @returns Whether user has access AND org has feature enabled
 */
export function canAccessOrgFeatureComplete(
  userRole: UserRole | string,
  orgFeatureMap: Record<string, boolean> | null | undefined,
  feature: string,
  effectivePermissions?: string[]
): boolean {
  if (userRole === "super_admin") return true;

  const normalizedFeature = feature.startsWith("org:") ? feature.slice(4) : feature;
  const orgFeature = `org:${normalizedFeature}`;

  // Role permission matrix remains the first gate.
  if (!canAccessOrgFeature(userRole, orgFeature)) {
    return false;
  }

  const explicitPermission = effectivePermissions?.some(
    (p) => p === orgFeature || p === normalizedFeature || p === `org:${normalizedFeature}:view` || p === `${normalizedFeature}:view`
  );
  if (effectivePermissions && effectivePermissions.length > 0 && explicitPermission === false) {
    return false;
  }

  // Org feature state is optional in the backend defaults, but an explicit false must deny access.
  if (!orgFeatureMap) return true;
  const state = orgFeatureMap[normalizedFeature];
  return state !== false;
}

/**
 * Get dashboard URL based on user role
 * @param userRole The user's role
 * @returns The appropriate dashboard URL
 */
export function getOrgDashboardUrl(userRole: UserRole | string, orgSlug: string): string {
  switch (userRole) {
    case "hr":
      return `/org/${orgSlug}/hr`;
    case "accountant":
      return `/org/${orgSlug}/accounting`;
    case "procurement_manager":
      return `/org/${orgSlug}/procurement`;
    case "project_manager":
      return `/org/${orgSlug}/projects`;
    case "sales_manager":
      return `/org/${orgSlug}/pipeline`;
    case "ict_manager":
      return `/org/${orgSlug}/settings`;
    default:
      return `/org/${orgSlug}/dashboard`;
  }
}

/**
 * Feature metadata for navigation building
 */
export const ORG_FEATURE_METADATA: Record<string, {
  label: string;
  description: string;
  icon: string;
  category: string;
}> = {
  "crm": { label: "CRM", description: "Customer relationship management", icon: "Users", category: "Sales & Marketing" },
  "clients": { label: "Clients", description: "Manage client information", icon: "Users", category: "CRM" },
  "contacts": { label: "Contacts", description: "Manage contacts", icon: "Phone", category: "CRM" },
  "leads": { label: "Leads", description: "Lead management", icon: "Phone", category: "CRM" },
  "pipeline": { label: "Sales Pipeline", description: "Track sales pipeline", icon: "KanbanSquare", category: "CRM" },
  "invoicing": { label: "Invoicing", description: "Create and manage invoices", icon: "FileText", category: "Finance" },
  "payments": { label: "Payments", description: "Record payments", icon: "DollarSign", category: "Finance" },
  "expenses": { label: "Expenses", description: "Manage expenses", icon: "Receipt", category: "Finance" },
  "receipts": { label: "Receipts", description: "Manage receipts", icon: "Receipt", category: "Finance" },
  "accounting": { label: "Accounting", description: "Accounting management", icon: "BookOpen", category: "Finance" },
  "hr": { label: "HR", description: "Human resources management", icon: "Users", category: "HR" },
  "employees": { label: "Employees", description: "Manage employees", icon: "Users", category: "HR" },
  "attendance": { label: "Attendance", description: "Track attendance", icon: "Calendar", category: "HR" },
  "leave": { label: "Leave", description: "Manage leave requests", icon: "Calendar", category: "HR" },
  "payroll": { label: "Payroll", description: "Payroll management", icon: "DollarSign", category: "HR" },
  "projects": { label: "Projects", description: "Project management", icon: "FolderKanban", category: "Operations" },
  "tasks": { label: "Tasks", description: "Task management", icon: "CheckSquare", category: "Operations" },
  "procurement": { label: "Procurement", description: "Procurement management", icon: "ShoppingCart", category: "Purchasing" },
  "suppliers": { label: "Suppliers", description: "Manage suppliers", icon: "Users2", category: "Purchasing" },
  "tickets": { label: "Support Tickets", description: "Support ticket management", icon: "MessageSquare", category: "Support" },
  "analytics": { label: "Analytics", description: "View analytics and insights", icon: "BarChart3", category: "Analytics" },
  "reports": { label: "Reports", description: "Generate reports", icon: "FileText", category: "Analytics" },
  "settings": { label: "Settings", description: "Organization settings", icon: "Settings", category: "Administration" },
};
