/**
 * Feature-Based Access Control - Feature Mapping Reference
 * 
 * This document defines all features in the system and which roles
 * have access to each feature.
 * 
 * Format:
 * FEATURE NAME = "module:action"
 * ALLOWED ROLES = ["role1", "role2", ...]
 * 
 * Usage:
 * - Reference when testing specific endpoints
 * - Verify role permissions match expected access
 * - Add new features following this pattern
 */

/**
 * COMPLETE FEATURE ACCESS MAPPING
 * ================================
 */

const FEATURE_ACCESS = {
  // ========================================================================
  // ADMIN & MANAGEMENT FEATURES (Super Admin, Admin only)
  // ========================================================================
  
  "admin:manage_users": ["super_admin"],
  "admin:manage_roles": ["super_admin"],
  "admin:audit_logs": ["super_admin", "admin"],
  "admin:system_settings": ["super_admin"],
  "admin:api_keys": ["super_admin", "admin"],
  
  // ========================================================================
  // SETTINGS & CONFIGURATION (Admin + ICT Manager)
  // ========================================================================
  
  "settings:view": ["super_admin", "admin"],
  "settings:edit": ["super_admin", "admin"],
  "settings:branding": ["super_admin", "admin"],
  "settings:notifications": ["super_admin", "admin", "ict_manager"],
  "settings:integrations": ["super_admin", "admin"],
  
  // ========================================================================
  // ROLE & PERMISSION MANAGEMENT (Admin only)
  // ========================================================================
  
  "roles:read": ["super_admin", "admin"],
  "roles:create": ["super_admin"],
  "roles:update": ["super_admin"],
  "roles:delete": ["super_admin"],
  
  "permissions:read": ["super_admin", "admin"],
  "permissions:edit": ["super_admin"],
  
  // ========================================================================
  // ACCOUNTING & FINANCIAL FEATURES
  // ========================================================================
  
  // Invoices
  "invoices:view": ["super_admin", "admin", "accountant", "project_manager"],
  "invoices:create": ["super_admin", "admin", "accountant"],
  "invoices:edit": ["super_admin", "admin", "accountant"],
  "invoices:delete": ["super_admin", "admin"],
  "invoices:approve": ["super_admin", "admin"],
  
  // Payments
  "payments:view": ["super_admin", "admin", "accountant", "project_manager"],
  "payments:create": ["super_admin", "admin", "accountant"],
  "payments:process": ["super_admin", "admin", "accountant"],
  "payments:approve": ["super_admin", "admin"],
  
  // Budgeting
  "budgets:view": ["super_admin", "admin", "accountant", "project_manager"],
  "budgets:create": ["super_admin", "admin", "accountant"],
  "budgets:edit": ["super_admin", "admin", "accountant"],
  "budgets:approve": ["super_admin", "admin"],
  
  // Chart of Accounts
  "coa:view": ["super_admin", "admin", "accountant"],
  "coa:edit": ["super_admin", "admin"],
  
  // ========================================================================
  // REPORTING & ANALYTICS
  // ========================================================================
  
  "reports:view": ["super_admin", "admin", "accountant", "project_manager", "hr", "ict_manager"],
  "reports:create": ["super_admin", "admin"],
  "reports:financial": ["super_admin", "admin", "accountant"],
  "reports:export": ["super_admin", "admin", "accountant", "project_manager"],
  "reports:schedule": ["super_admin", "admin"],
  
  "analytics:view": ["super_admin", "admin", "accountant", "project_manager", "hr", "ict_manager"],
  "analytics:export": ["super_admin", "admin", "accountant", "project_manager"],
  
  // ========================================================================
  // FILTERS & SAVED CONFIGURATIONS
  // ========================================================================
  
  "filters:create": [
    "super_admin", "admin", "accountant", "project_manager", 
    "hr", "staff", "ict_manager", "procurement_manager", "client"
  ],
  "filters:read": [
    "super_admin", "admin", "accountant", "project_manager", 
    "hr", "staff", "ict_manager", "procurement_manager", "client"
  ],
  "filters:update": [
    "super_admin", "admin", "accountant", "project_manager", 
    "hr", "staff", "ict_manager", "procurement_manager", "client"
  ],
  "filters:delete": [
    "super_admin", "admin", "accountant", "project_manager", 
    "hr", "staff", "ict_manager", "procurement_manager", "client"
  ],
  
  // ========================================================================
  // PROJECT MANAGEMENT
  // ========================================================================
  
  "projects:view": ["super_admin", "admin", "project_manager", "staff", "ict_manager"],
  "projects:create": ["super_admin", "admin", "project_manager"],
  "projects:edit": ["super_admin", "admin", "project_manager"],
  "projects:manage_team": ["super_admin", "admin", "project_manager"],
  "projects:close": ["super_admin", "admin", "project_manager"],
  
  // ========================================================================
  // SALES & BUSINESS MANAGEMENT
  // ========================================================================
  
  "leads:view": ["super_admin", "admin", "project_manager", "staff"],
  "leads:create": ["super_admin", "admin", "project_manager", "staff"],
  "leads:convert": ["super_admin", "admin", "project_manager"],
  
  "opportunities:view": ["super_admin", "admin", "project_manager", "staff"],
  "opportunities:create": ["super_admin", "admin", "project_manager"],
  "opportunities:manage": ["super_admin", "admin", "project_manager"],
  
  "sales:view": ["super_admin", "admin", "project_manager"],
  "sales:create": ["super_admin", "admin", "project_manager"],
  "sales:forecast": ["super_admin", "admin", "project_manager"],
  
  // ========================================================================
  // HR & EMPLOYEE MANAGEMENT
  // ========================================================================
  
  "employees:view": ["super_admin", "admin", "hr", "project_manager"],
  "employees:create": ["super_admin", "admin", "hr"],
  "employees:edit": ["super_admin", "admin", "hr"],
  "employees:delete": ["super_admin", "admin"],
  
  "hr:employees:view": ["super_admin", "admin", "hr", "project_manager"],
  "hr:employees:edit": ["super_admin", "admin", "hr"],
  "hr:employees:manage": ["super_admin", "admin", "hr"],
  
  "hr:payroll:view": ["super_admin", "admin", "hr"],
  "hr:payroll:create": ["super_admin", "admin", "hr"],
  "hr:payroll:process": ["super_admin", "admin", "hr"],
  "hr:payroll:approve": ["super_admin", "admin"],
  
  "hr:attendance:view": ["super_admin", "admin", "hr", "project_manager"],
  "hr:attendance:edit": ["super_admin", "admin", "hr"],
  
  "hr:leave:view": ["super_admin", "admin", "hr", "staff"],
  "hr:leave:request": ["super_admin", "admin", "hr", "staff"],
  "hr:leave:approve": ["super_admin", "admin", "hr"],
  
  "hr:performance:view": ["super_admin", "admin", "hr"],
  "hr:performance:create": ["super_admin", "admin", "hr"],
  "hr:performance:edit": ["super_admin", "admin", "hr"],
  
  // ========================================================================
  // COMMUNICATIONS & NOTIFICATIONS
  // ========================================================================
  
  "communications:view": ["super_admin", "admin", "staff", "project_manager", "hr", "ict_manager"],
  "communications:send": ["super_admin", "admin", "staff", "project_manager", "hr", "ict_manager"],
  "communications:create_template": ["super_admin", "admin"],
  "communications:manage_channels": ["super_admin", "admin"],
  
  "email:send": ["super_admin", "admin", "staff", "project_manager", "hr"],
  "sms:send": ["super_admin", "admin"],
  
  // ========================================================================
  // TIME & TIMESHEET MANAGEMENT
  // ========================================================================
  
  "time:view": ["super_admin", "admin", "hr", "project_manager", "staff"],
  "time:create": ["super_admin", "admin", "hr", "project_manager", "staff"],
  "time:edit": ["super_admin", "admin", "hr", "project_manager"],
  "time:approve": ["super_admin", "admin", "hr", "project_manager"],
  
  "timesheets:view": ["super_admin", "admin", "hr", "project_manager", "staff"],
  "timesheets:create": ["super_admin", "admin", "hr", "staff"],
  "timesheets:approve": ["super_admin", "admin", "hr", "project_manager"],
  
  // ========================================================================
  // PERFORMANCE & REVIEWS
  // ========================================================================
  
  "reviews:view": ["super_admin", "admin", "hr", "project_manager"],
  "reviews:create": ["super_admin", "admin", "hr", "project_manager"],
  "reviews:edit": ["super_admin", "admin", "hr"],
  "reviews:submit": ["super_admin", "admin", "hr", "project_manager"],
  
  // ========================================================================
  // IMPREST & EXPENSE MANAGEMENT
  // ========================================================================
  
  "imprest:view": ["super_admin", "admin", "accountant", "project_manager"],
  "imprest:request": ["super_admin", "admin", "accountant", "project_manager", "staff"],
  "imprest:process": ["super_admin", "admin", "accountant"],
  "imprest:approve": ["super_admin", "admin"],
  
  "expenses:view": ["super_admin", "admin", "accountant", "project_manager", "staff"],
  "expenses:create": ["super_admin", "admin", "accountant", "project_manager", "staff"],
  "expenses:edit": ["super_admin", "admin", "accountant", "project_manager"],
  "expenses:approve": ["super_admin", "admin", "accountant"],
  
  // ========================================================================
  // PROCUREMENT
  // ========================================================================
  
  "procurement:view": ["super_admin", "admin", "procurement_manager", "accountant", "project_manager"],
  "procurement:create": ["super_admin", "admin", "procurement_manager"],
  "procurement:manage": ["super_admin", "admin", "procurement_manager"],
  "procurement:approve": ["super_admin", "admin"],
  
  "suppliers:view": ["super_admin", "admin", "procurement_manager", "accountant"],
  "suppliers:edit": ["super_admin", "admin", "procurement_manager"],
  
  // ========================================================================
  // CLIENT MANAGEMENT & CRM
  // ========================================================================
  
  "clients:view": ["super_admin", "admin", "project_manager", "staff", "client"],
  "clients:create": ["super_admin", "admin", "project_manager"],
  "clients:edit": ["super_admin", "admin", "project_manager"],
  "clients:manage": ["super_admin", "admin", "project_manager"],
  
  // ========================================================================
  // AUTOMATION & WORKFLOWS
  // ========================================================================
  
  "workflows:view": ["super_admin", "admin"],
  "workflows:create": ["super_admin", "admin"],
  "workflows:edit": ["super_admin", "admin"],
  "workflows:manage": ["super_admin", "admin"],
  
  "automation:jobs": ["super_admin", "admin"],
  "automation:triggers": ["super_admin", "admin"],
  "automation:actions": ["super_admin", "admin"],
  
  // ========================================================================
  // BRANDING & CUSTOMIZATION
  // ========================================================================
  
  "branding:view": ["super_admin", "admin"],
  "branding:edit": ["super_admin", "admin"],
  "customization:view": ["super_admin", "admin"],
  "customization:edit": ["super_admin"],
  
  // ========================================================================
  // DASHBOARD & BASIC ACCESS
  // ========================================================================
  
  "dashboard:view": ["super_admin", "admin", "accountant", "project_manager", "hr", "staff", "client", "ict_manager", "procurement_manager"],
  "dashboard:edit": ["super_admin", "admin"],
  
  // ========================================================================
  // ICT & SYSTEM MANAGEMENT
  // ========================================================================
  
  "system:logs": ["super_admin", "admin", "ict_manager"],
  "system:monitoring": ["super_admin", "admin", "ict_manager"],
  "system:backup": ["super_admin", "ict_manager"],
  "system:restore": ["super_admin"],
  
  // ========================================================================
  // DOCUMENT & FILE MANAGEMENT
  // ========================================================================
  
  "documents:view": ["super_admin", "admin", "project_manager", "staff", "client"],
  "documents:upload": ["super_admin", "admin", "project_manager", "staff"],
  "documents:share": ["super_admin", "admin", "project_manager", "staff"],
  "documents:delete": ["super_admin", "admin"],
};

// ============================================================================
// Feature Access Summary by Role
// ============================================================================

const ROLE_FEATURE_SUMMARY = {
  super_admin: {
    description: "System administrator - Full system access",
    featureCount: "All features",
    keyword: "Can do anything",
    restrictions: "None",
  },
  
  admin: {
    description: "Administrator - Most system features except super admin only",
    canAccess: [
      "User/role management (view only)",
      "Settings and configuration",
      "All reporting and analytics",
      "Financial management",
      "Project and sales management",
      "HR management",
      "Communications",
      "Automation and workflows",
    ],
    cannotAccess: [
      "Manage other admins",
      "System backup/restore",
      "Some ICT functions",
    ],
  },
  
  accountant: {
    description: "Accountant - Financial and accounting focused",
    canAccess: [
      "View and create invoices",
      "Process payments",
      "Manage budgets",
      "View chart of accounts",
      "Access financial reports",
      "View and manage imprest",
      "Manage expenses",
      "Create filters and dashboards",
    ],
    cannotAccess: [
      "Create reports (view only)",
      "HR management",
      "Project management (view only)",
      "System settings",
    ],
  },
  
  project_manager: {
    description: "Project Manager - Project and business focused",
    canAccess: [
      "Manage projects and teams",
      "View sales opportunities",
      "View financial information",
      "View employee information",
      "Approve timesheets",
      "Create reports and exports",
      "View communications",
      "Create filters and dashboards",
    ],
    cannotAccess: [
      "Create reports (view only)",
      "Manage payroll",
      "Manage system settings",
      "Manage users or roles",
    ],
  },
  
  hr: {
    description: "HR Manager - Human resources focused",
    canAccess: [
      "Manage employees",
      "Process payroll",
      "Track attendance",
      "Manage leave requests",
      "Create performance reviews",
      "View analytics and reports",
      "Create communications",
      "Create filters and dashboards",
    ],
    cannotAccess: [
      "Financial management (accounting)",
      "Project management",
      "System settings",
      "Manage other users",
    ],
  },
  
  staff: {
    description: "Staff Member - Limited operational access",
    canAccess: [
      "View dashboard",
      "Send communications",
      "Submit time entries",
      "Request leave",
      "Create and use filters",
      "View limited projects",
    ],
    cannotAccess: [
      "Financial management",
      "HR management",
      "System settings",
      "User management",
      "Reporting (most)",
    ],
  },
  
  client: {
    description: "External Client - Client portal access",
    canAccess: [
      "View own projects",
      "View linked documents",
      "View own information",
      "Create filters for own data",
    ],
    cannotAccess: [
      "Any system management",
      "Other users' data",
      "Financial information",
      "HR information",
    ],
  },
  
  ict_manager: {
    description: "ICT Manager - System and technology focused",
    canAccess: [
      "System monitoring and logs",
      "API key management",
      "Notification settings",
      "View reports and analytics",
      "Create communications",
      "Create filters",
    ],
    cannotAccess: [
      "Financial management",
      "User management",
      "Projects (limited to read)",
      "HR management",
    ],
  },
  
  procurement_manager: {
    description: "Procurement Manager - Procurement focused",
    canAccess: [
      "Manage procurement",
      "Manage suppliers",
      "Process purchase orders",
      "View financial information (limited)",
      "Create filters",
      "View reports",
    ],
    cannotAccess: [
      "Financial management (accounting)",
      "HR management",
      "Project management",
      "System settings",
    ],
  },
};

// ============================================================================
// Feature Grouping by Module
// ============================================================================

const FEATURES_BY_MODULE = {
  admin: [
    "admin:manage_users",
    "admin:manage_roles",
    "admin:audit_logs",
    "admin:system_settings",
    "admin:api_keys",
  ],
  
  settings: [
    "settings:view",
    "settings:edit",
    "settings:branding",
    "settings:notifications",
    "settings:integrations",
  ],
  
  roles_permissions: [
    "roles:read",
    "roles:create",
    "roles:update",
    "roles:delete",
    "permissions:read",
    "permissions:edit",
  ],
  
  accounting: [
    "invoices:view",
    "invoices:create",
    "invoices:edit",
    "invoices:delete",
    "invoices:approve",
    "payments:view",
    "payments:create",
    "payments:process",
    "payments:approve",
  ],
  
  budgeting: [
    "budgets:view",
    "budgets:create",
    "budgets:edit",
    "budgets:approve",
    "coa:view",
    "coa:edit",
  ],
  
  reporting: [
    "reports:view",
    "reports:create",
    "reports:financial",
    "reports:export",
    "reports:schedule",
    "analytics:view",
    "analytics:export",
  ],
  
  // ... continue for all modules
};

// ============================================================================
// Feature Testing Endpoints
// ============================================================================

const FEATURE_TO_ENDPOINT_MAPPING = {
  "admin:manage_users": "/api/trpc/admin.manageUsers",
  "roles:read": "/api/trpc/roles.read",
  "permissions:read": "/api/trpc/permissions.read",
  "settings:edit": "/api/trpc/brandCustomization.update",
  "reports:create": "/api/trpc/reportExport.create",
  "filters:create": "/api/trpc/savedFilters.create",
  "workflows:create": "/api/trpc/workflows.create",
  "employees:edit": "/api/trpc/performanceReviews.update",
  "communications:send": "/api/trpc/communications.send",
  "timesheets:create": "/api/trpc/timeEntries.create",
  
  // ... add more as needed
};

export {
  FEATURE_ACCESS,
  ROLE_FEATURE_SUMMARY,
  FEATURES_BY_MODULE,
  FEATURE_TO_ENDPOINT_MAPPING,
};
