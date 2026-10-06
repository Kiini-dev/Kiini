/**
 * Comprehensive Permission Definitions for Role Management
 * Defines all available permissions with clear labels and descriptions
 */

export interface PermissionDefinition {
  id: string;
  label: string;
  description: string;
  category: string;
  icon: string;
}

export const PERMISSION_CATEGORIES = {
  INVOICES: "Invoices",
  ESTIMATES: "Estimates",
  PAYMENTS: "Payments",
  EXPENSES: "Expenses",
  CLIENTS: "Clients",
  EMPLOYEES: "Employees",
  PAYROLL: "Payroll",
  REPORTS: "Reports",
  USERS: "Users",
  ROLES: "Roles & Permissions",
  SETTINGS: "Settings",
  WORKFLOWS: "Workflows",
  DASHBOARD: "Dashboard",
} as const;

export const PERMISSION_ACTIONS = {
  VIEW: "View",
  CREATE: "Create",
  EDIT: "Edit",
  DELETE: "Delete",
  APPROVE: "Approve",
  REJECT: "Reject",
  EXPORT: "Export",
  IMPORT: "Import",
  MANAGE: "Manage",
} as const;

export const PERMISSIONS: Record<string, PermissionDefinition> = {
  // Invoices Permissions
  "invoice.view": {
    id: "invoice.view",
    label: "View Invoices",
    description: "Can view and list invoices",
    category: PERMISSION_CATEGORIES.INVOICES,
    icon: "Eye",
  },
  "invoice.create": {
    id: "invoice.create",
    label: "Create Invoices",
    description: "Can create new invoices",
    category: PERMISSION_CATEGORIES.INVOICES,
    icon: "Plus",
  },
  "invoice.edit": {
    id: "invoice.edit",
    label: "Edit Invoices",
    description: "Can edit existing invoices",
    category: PERMISSION_CATEGORIES.INVOICES,
    icon: "Edit",
  },
  "invoice.delete": {
    id: "invoice.delete",
    label: "Delete Invoices",
    description: "Can delete invoices (soft delete)",
    category: PERMISSION_CATEGORIES.INVOICES,
    icon: "Trash2",
  },
  "invoice.approve": {
    id: "invoice.approve",
    label: "Approve Invoices",
    description: "Can approve pending invoices",
    category: PERMISSION_CATEGORIES.INVOICES,
    icon: "CheckCircle2",
  },
  "invoice.export": {
    id: "invoice.export",
    label: "Export Invoices",
    description: "Can export invoices to PDF/Excel",
    category: PERMISSION_CATEGORIES.INVOICES,
    icon: "Download",
  },

  // Estimates Permissions
  "estimate.view": {
    id: "estimate.view",
    label: "View Estimates",
    description: "Can view and list estimates",
    category: PERMISSION_CATEGORIES.ESTIMATES,
    icon: "Eye",
  },
  "estimate.create": {
    id: "estimate.create",
    label: "Create Estimates",
    description: "Can create new estimates",
    category: PERMISSION_CATEGORIES.ESTIMATES,
    icon: "Plus",
  },
  "estimate.edit": {
    id: "estimate.edit",
    label: "Edit Estimates",
    description: "Can edit existing estimates",
    category: PERMISSION_CATEGORIES.ESTIMATES,
    icon: "Edit",
  },
  "estimate.delete": {
    id: "estimate.delete",
    label: "Delete Estimates",
    description: "Can delete estimates",
    category: PERMISSION_CATEGORIES.ESTIMATES,
    icon: "Trash2",
  },
  "estimate.approve": {
    id: "estimate.approve",
    label: "Approve Estimates",
    description: "Can approve estimates and convert to invoices",
    category: PERMISSION_CATEGORIES.ESTIMATES,
    icon: "CheckCircle2",
  },
  "estimate.reject": {
    id: "estimate.reject",
    label: "Reject Estimates",
    description: "Can reject pending estimates",
    category: PERMISSION_CATEGORIES.ESTIMATES,
    icon: "XCircle",
  },

  // Payments Permissions
  "payment.view": {
    id: "payment.view",
    label: "View Payments",
    description: "Can view and list payments",
    category: PERMISSION_CATEGORIES.PAYMENTS,
    icon: "Eye",
  },
  "payment.create": {
    id: "payment.create",
    label: "Record Payments",
    description: "Can create new payment records",
    category: PERMISSION_CATEGORIES.PAYMENTS,
    icon: "Plus",
  },
  "payment.edit": {
    id: "payment.edit",
    label: "Edit Payments",
    description: "Can edit payment details",
    category: PERMISSION_CATEGORIES.PAYMENTS,
    icon: "Edit",
  },
  "payment.delete": {
    id: "payment.delete",
    label: "Delete Payments",
    description: "Can delete payment records",
    category: PERMISSION_CATEGORIES.PAYMENTS,
    icon: "Trash2",
  },
  "payment.approve": {
    id: "payment.approve",
    label: "Approve Payments",
    description: "Can approve pending payments",
    category: PERMISSION_CATEGORIES.PAYMENTS,
    icon: "CheckCircle2",
  },

  // Expenses Permissions
  "expense.view": {
    id: "expense.view",
    label: "View Expenses",
    description: "Can view and list expenses",
    category: PERMISSION_CATEGORIES.EXPENSES,
    icon: "Eye",
  },
  "expense.create": {
    id: "expense.create",
    label: "Create Expenses",
    description: "Can create new expense records",
    category: PERMISSION_CATEGORIES.EXPENSES,
    icon: "Plus",
  },
  "expense.edit": {
    id: "expense.edit",
    label: "Edit Expenses",
    description: "Can edit existing expenses",
    category: PERMISSION_CATEGORIES.EXPENSES,
    icon: "Edit",
  },
  "expense.delete": {
    id: "expense.delete",
    label: "Delete Expenses",
    description: "Can delete expense records",
    category: PERMISSION_CATEGORIES.EXPENSES,
    icon: "Trash2",
  },
  "expense.approve": {
    id: "expense.approve",
    label: "Approve Expenses",
    description: "Can approve pending expenses",
    category: PERMISSION_CATEGORIES.EXPENSES,
    icon: "CheckCircle2",
  },

  // Clients Permissions
  "client.view": {
    id: "client.view",
    label: "View Clients",
    description: "Can view and list clients",
    category: PERMISSION_CATEGORIES.CLIENTS,
    icon: "Eye",
  },
  "client.create": {
    id: "client.create",
    label: "Create Clients",
    description: "Can add new clients",
    category: PERMISSION_CATEGORIES.CLIENTS,
    icon: "Plus",
  },
  "client.edit": {
    id: "client.edit",
    label: "Edit Clients",
    description: "Can update client information",
    category: PERMISSION_CATEGORIES.CLIENTS,
    icon: "Edit",
  },
  "client.delete": {
    id: "client.delete",
    label: "Delete Clients",
    description: "Can deactivate/delete clients",
    category: PERMISSION_CATEGORIES.CLIENTS,
    icon: "Trash2",
  },
  "client.manage": {
    id: "client.manage",
    label: "Manage Client Settings",
    description: "Can manage client-specific settings and limits",
    category: PERMISSION_CATEGORIES.CLIENTS,
    icon: "Settings",
  },

  // Employees Permissions
  "employee.view": {
    id: "employee.view",
    label: "View Employees",
    description: "Can view and list employees",
    category: PERMISSION_CATEGORIES.EMPLOYEES,
    icon: "Eye",
  },
  "employee.create": {
    id: "employee.create",
    label: "Add Employees",
    description: "Can add new employees",
    category: PERMISSION_CATEGORIES.EMPLOYEES,
    icon: "Plus",
  },
  "employee.edit": {
    id: "employee.edit",
    label: "Edit Employees",
    description: "Can update employee information",
    category: PERMISSION_CATEGORIES.EMPLOYEES,
    icon: "Edit",
  },
  "employee.delete": {
    id: "employee.delete",
    label: "Deactivate Employees",
    description: "Can deactivate employees",
    category: PERMISSION_CATEGORIES.EMPLOYEES,
    icon: "Trash2",
  },
  "employee.manage": {
    id: "employee.manage",
    label: "Manage Employee Settings",
    description: "Can manage employee records and settings",
    category: PERMISSION_CATEGORIES.EMPLOYEES,
    icon: "Settings",
  },

  // Payroll Permissions
  "payroll.view": {
    id: "payroll.view",
    label: "View Payroll",
    description: "Can view payroll, salary structures, allowances, deductions, benefits, and payslips",
    category: PERMISSION_CATEGORIES.PAYROLL,
    icon: "Eye",
  },
  "payroll.create": {
    id: "payroll.create",
    label: "Create Payroll",
    description: "Can create payroll and compensation records",
    category: PERMISSION_CATEGORIES.PAYROLL,
    icon: "Plus",
  },
  "payroll.edit": {
    id: "payroll.edit",
    label: "Edit Payroll",
    description: "Can edit payroll and compensation records",
    category: PERMISSION_CATEGORIES.PAYROLL,
    icon: "Edit",
  },
  "payroll.delete": {
    id: "payroll.delete",
    label: "Delete Payroll",
    description: "Can delete payroll and compensation records",
    category: PERMISSION_CATEGORIES.PAYROLL,
    icon: "Trash2",
  },

  // Reports Permissions
  "report.view": {
    id: "report.view",
    label: "View Reports",
    description: "Can view and generate reports",
    category: PERMISSION_CATEGORIES.REPORTS,
    icon: "Eye",
  },
  "report.create": {
    id: "report.create",
    label: "Create Reports",
    description: "Can create custom reports",
    category: PERMISSION_CATEGORIES.REPORTS,
    icon: "Plus",
  },
  "report.export": {
    id: "report.export",
    label: "Export Reports",
    description: "Can export reports to PDF/Excel",
    category: PERMISSION_CATEGORIES.REPORTS,
    icon: "Download",
  },

  // Users Permissions
  "user.view": {
    id: "user.view",
    label: "View Users",
    description: "Can view system users",
    category: PERMISSION_CATEGORIES.USERS,
    icon: "Eye",
  },
  "user.create": {
    id: "user.create",
    label: "Create Users",
    description: "Can create new user accounts",
    category: PERMISSION_CATEGORIES.USERS,
    icon: "Plus",
  },
  "user.edit": {
    id: "user.edit",
    label: "Edit Users",
    description: "Can edit user information",
    category: PERMISSION_CATEGORIES.USERS,
    icon: "Edit",
  },
  "user.delete": {
    id: "user.delete",
    label: "Delete Users",
    description: "Can deactivate user accounts",
    category: PERMISSION_CATEGORIES.USERS,
    icon: "Trash2",
  },
  "user.manage": {
    id: "user.manage",
    label: "Manage User Roles",
    description: "Can assign roles and permissions to users",
    category: PERMISSION_CATEGORIES.USERS,
    icon: "Settings",
  },

  // Roles & Permissions Permissions
  "role.view": {
    id: "role.view",
    label: "View Roles",
    description: "Can view system roles",
    category: PERMISSION_CATEGORIES.ROLES,
    icon: "Eye",
  },
  "role.create": {
    id: "role.create",
    label: "Create Roles",
    description: "Can create new roles",
    category: PERMISSION_CATEGORIES.ROLES,
    icon: "Plus",
  },
  "role.edit": {
    id: "role.edit",
    label: "Edit Roles",
    description: "Can modify existing roles",
    category: PERMISSION_CATEGORIES.ROLES,
    icon: "Edit",
  },
  "role.delete": {
    id: "role.delete",
    label: "Delete Roles",
    description: "Can delete custom roles",
    category: PERMISSION_CATEGORIES.ROLES,
    icon: "Trash2",
  },
  "permission.manage": {
    id: "permission.manage",
    label: "Manage Permissions",
    description: "Can create and assign permissions",
    category: PERMISSION_CATEGORIES.ROLES,
    icon: "Settings",
  },

  // Settings Permissions
  "settings.view": {
    id: "settings.view",
    label: "View Settings",
    description: "Can view system settings",
    category: PERMISSION_CATEGORIES.SETTINGS,
    icon: "Eye",
  },
  "settings.manage": {
    id: "settings.manage",
    label: "Manage Settings",
    description: "Can modify system settings",
    category: PERMISSION_CATEGORIES.SETTINGS,
    icon: "Settings",
  },

  // Workflows Permissions
  "workflow.view": {
    id: "workflow.view",
    label: "View Workflows",
    description: "Can view system workflows",
    category: PERMISSION_CATEGORIES.WORKFLOWS,
    icon: "Eye",
  },
  "workflow.create": {
    id: "workflow.create",
    label: "Create Workflows",
    description: "Can create custom workflows",
    category: PERMISSION_CATEGORIES.WORKFLOWS,
    icon: "Plus",
  },
  "workflow.edit": {
    id: "workflow.edit",
    label: "Edit Workflows",
    description: "Can modify existing workflows",
    category: PERMISSION_CATEGORIES.WORKFLOWS,
    icon: "Edit",
  },
  "workflow.delete": {
    id: "workflow.delete",
    label: "Delete Workflows",
    description: "Can delete workflows",
    category: PERMISSION_CATEGORIES.WORKFLOWS,
    icon: "Trash2",
  },

  // Dashboard Permissions
  "dashboard.view": {
    id: "dashboard.view",
    label: "View Dashboard",
    description: "Can view the main dashboard",
    category: PERMISSION_CATEGORIES.DASHBOARD,
    icon: "Eye",
  },
  "dashboard.customize": {
    id: "dashboard.customize",
    label: "Customize Dashboard",
    description: "Can drag & drop and customize dashboard widgets",
    category: PERMISSION_CATEGORIES.DASHBOARD,
    icon: "Edit",
  },
};

/**
 * Get permissions by category
 */
export function getPermissionsByCategory(
  category: string
): PermissionDefinition[] {
  return Object.values(PERMISSIONS).filter(
    (perm) => perm.category === category
  );
}

/**
 * Get all categories
 */
export function getAllCategories(): string[] {
  return Object.values(PERMISSION_CATEGORIES);
}

/**
 * Get all permission IDs
 */
export function getAllPermissionIds(): string[] {
  return Object.keys(PERMISSIONS);
}

/**
 * Get permission definition by ID
 */
export function getPermissionDefinition(
  id: string
): PermissionDefinition | undefined {
  return PERMISSIONS[id];
}
