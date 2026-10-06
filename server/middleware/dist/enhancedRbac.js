"use strict";
/**
 * Enhanced Role-Based Access Control (RBAC) Middleware
 *
 * This module provides factory functions to create TRPC procedures
 * with built-in permission enforcement at the API level.
 * Supports both hardcoded system roles AND dynamic custom roles.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.createOrgScopedProcedure = exports.checkOrgScopeAccess = exports.getAccessibleFeatures = exports.createFeatureRestrictedProcedure = exports.createRoleRestrictedProcedure = exports.resolveUserPermission = exports.customRoleCanAccessFeature = exports.canAccessFeature = exports.FEATURE_ACCESS = exports.ROLE_PERMISSIONS = exports.ROLES = void 0;
var server_1 = require("@trpc/server");
var trpc_1 = require("../_core/trpc");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
exports.ROLES = {
    SUPER_ADMIN: "super_admin",
    ADMIN: "admin",
    ACCOUNTANT: "accountant",
    HR: "hr",
    STAFF: "staff",
    CLIENT: "client",
    PROJECT_MANAGER: "project_manager",
    PROCUREMENT_MANAGER: "procurement_manager",
    ICT_MANAGER: "ict_manager",
    SALES_MANAGER: "sales_manager"
};
/**
 * Role-based access permissions mapping
 * Defines which roles can access which features
 */
exports.ROLE_PERMISSIONS = {
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
    ]
};
/**
 * Feature-based access mapping
 * Maps features and modules to required roles
 */
exports.FEATURE_ACCESS = {
    // Admin Features
    "admin:manage_users": ["super_admin"],
    "admin:manage_roles": ["super_admin"],
    "admin:settings": ["super_admin", "admin", "ict_manager"],
    "admin:maintenance": ["super_admin", "ict_manager"],
    "admin:system": ["super_admin", "admin", "ict_manager"],
    // Enterprise / Multi-Tenancy (global platform only)
    "enterprise:view": ["super_admin", "ict_manager"],
    "enterprise:create": ["super_admin", "ict_manager"],
    "enterprise:edit": ["super_admin", "ict_manager"],
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
    "hr:jobGroups:create": ["super_admin", "admin", "hr"],
    "hr:jobGroups:edit": ["super_admin", "admin", "hr"],
    "hr:jobGroups:delete": ["super_admin", "admin"],
    // Standalone job groups (used by jobGroups router)
    "jobGroups:read": ["super_admin", "admin", "hr"],
    "jobGroups:create": ["super_admin", "admin", "hr"],
    "jobGroups:edit": ["super_admin", "admin", "hr"],
    "jobGroups:delete": ["super_admin", "admin"],
    "hr:payroll": ["super_admin", "admin", "hr"],
    "hr:payroll:view": ["super_admin", "admin", "hr"],
    "hr:payroll:create": ["super_admin", "admin", "hr"],
    "hr:payroll:approve": ["super_admin", "admin", "hr"],
    // Standalone payroll features (used by payslips router)
    "payroll:view": ["super_admin", "admin", "hr", "accountant"],
    "payroll:edit": ["super_admin", "admin", "hr"],
    "hr:leave": ["super_admin", "admin", "hr"],
    "hr:leave:approve": ["super_admin", "admin", "hr"],
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
    "settings:integrations": ["super_admin", "admin", "ict_manager"],
    "settings:security": ["super_admin", "ict_manager"],
    "settings:roles": ["super_admin"],
    "settings:audit": ["super_admin", "admin", "ict_manager"],
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
    "tools:automation": ["super_admin", "admin", "ict_manager"],
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
    "approvals:delete": ["super_admin", "admin"],
    // Chart of Accounts Features
    "chartOfAccounts:read": ["super_admin", "admin", "accountant"],
    "chartOfAccounts:create": ["super_admin", "admin", "accountant"],
    "chartOfAccounts:edit": ["super_admin", "admin", "accountant"],
    "chartOfAccounts:delete": ["super_admin", "admin"],
    // Budgets Features (prefix: budgets)
    "budgets:view": ["super_admin", "admin", "accountant", "project_manager"],
    "budgets:create": ["super_admin", "admin", "accountant"],
    "budgets:edit": ["super_admin", "admin", "accountant"],
    "budgets:delete": ["super_admin", "admin"],
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
    "expenses:view": ["super_admin", "admin", "accountant", "project_manager"],
    "expenses:create": ["super_admin", "admin", "accountant", "staff"],
    "expenses:edit": ["super_admin", "admin", "accountant"],
    "expenses:delete": ["super_admin", "admin"],
    "expenses:read": ["super_admin", "admin", "accountant", "project_manager"],
    // Payment Features
    "payments:view": ["super_admin", "admin", "accountant", "project_manager"],
    "payments:create": ["super_admin", "admin", "accountant"],
    "payments:edit": ["super_admin", "admin", "accountant"],
    "payments:delete": ["super_admin", "admin"],
    "payments:read": ["super_admin", "admin", "accountant", "project_manager"],
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
    "suppliers:delete": ["super_admin", "admin"],
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
    "leave:approve": ["super_admin", "admin", "hr"],
    "leave:create": ["super_admin", "admin", "hr", "staff"],
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
    "org:hr:leave:approve": ["super_admin", "admin", "hr"],
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
    "org:leave:approve": ["super_admin", "admin", "hr"],
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
    "org:settings:backup": ["super_admin", "admin", "ict_manager"]
};
/**
 * Check if user has permission for a feature
 * Supports both explicit features and wildcard permissions
 *
 * Examples:
 * - canAccessFeature("super_admin", "clients:read")
 * - With ROLE_PERMISSIONS["super_admin"] = ["clients:*"], this returns true
 */
function canAccessFeature(userRole, feature) {
    // Super admin has unrestricted access to all features
    if (userRole === exports.ROLES.SUPER_ADMIN)
        return true;
    // First, check if the exact feature is in FEATURE_ACCESS
    var allowedRoles = exports.FEATURE_ACCESS[feature];
    if (allowedRoles && allowedRoles.includes(userRole)) {
        return true;
    }
    // Second, check if user has explicit permission for this feature
    var userPermissions = exports.ROLE_PERMISSIONS[userRole];
    if (!userPermissions)
        return false;
    if (userPermissions.includes(feature))
        return true;
    // Third, check if user has wildcard permission for this module
    // Example: feature="clients:read", userRole has "clients:*" in ROLE_PERMISSIONS
    var modulePrefix = feature.split(":")[0];
    return userPermissions.includes(modulePrefix + ":*");
}
exports.canAccessFeature = canAccessFeature;
/**
 * Check if a custom role's permissions include a specific feature
 * Supports wildcards in the custom role's permission list
 */
function customRoleCanAccessFeature(customPermissions, feature) {
    if (!customPermissions || customPermissions.length === 0)
        return false;
    // Direct match
    if (customPermissions.includes(feature))
        return true;
    // Wildcard match (e.g., "clients:*" matches "clients:read")
    var modulePrefix = feature.split(":")[0];
    if (customPermissions.includes(modulePrefix + ":*"))
        return true;
    return false;
}
exports.customRoleCanAccessFeature = customRoleCanAccessFeature;
/**
 * Resolve user permissions - checks custom role first, then falls back to system role
 * This is the primary permission check that should be used in procedures
 */
function resolveUserPermission(userId, userRole, customRoleId, feature) {
    return __awaiter(this, void 0, Promise, function () {
        var db, roles, perms, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Super admin always has access
                    if (userRole === exports.ROLES.SUPER_ADMIN)
                        return [2 /*return*/, true];
                    if (!customRoleId) return [3 /*break*/, 6];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, db_1.getDb()];
                case 2:
                    db = _a.sent();
                    if (!db) return [3 /*break*/, 4];
                    return [4 /*yield*/, db.select().from(schema_1.customRoles)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.customRoles.id, customRoleId), drizzle_orm_1.eq(schema_1.customRoles.isActive, 1)))
                            .limit(1)];
                case 3:
                    roles = _a.sent();
                    if (roles.length > 0 && roles[0].permissions) {
                        perms = JSON.parse(roles[0].permissions);
                        if (customRoleCanAccessFeature(perms, feature))
                            return [2 /*return*/, true];
                        // If custom role has a baseRole, also check baseRole permissions
                        if (roles[0].baseRole) {
                            return [2 /*return*/, canAccessFeature(roles[0].baseRole, feature)];
                        }
                        return [2 /*return*/, false];
                    }
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    e_1 = _a.sent();
                    return [3 /*break*/, 6];
                case 6: 
                // Fall back to system role
                return [2 /*return*/, canAccessFeature(userRole, feature)];
            }
        });
    });
}
exports.resolveUserPermission = resolveUserPermission;
/**
 * Create a role-restricted procedure
 */
function createRoleRestrictedProcedure(allowedRoles) {
    return trpc_1.protectedProcedure.use(function (_a) {
        var ctx = _a.ctx, next = _a.next;
        if (!allowedRoles.includes(ctx.user.role)) {
            throw new server_1.TRPCError({
                code: "FORBIDDEN",
                message: "Access denied. Required roles: " + allowedRoles.join(", ") + ". Your role: " + ctx.user.role
            });
        }
        return next({ ctx: ctx });
    });
}
exports.createRoleRestrictedProcedure = createRoleRestrictedProcedure;
/**
 * Create a feature-restricted procedure
 * Supports both system roles and custom roles with dynamic permission lookup
 */
function createFeatureRestrictedProcedure(feature) {
    var _this = this;
    return trpc_1.protectedProcedure.use(function (_a) {
        var ctx = _a.ctx, next = _a.next;
        return __awaiter(_this, void 0, void 0, function () {
            var userRole, customRoleId, features, hasAccess, _i, features_1, f, access, GLOBAL_ONLY_PREFIXES, hasGlobalOnly;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        userRole = ctx.user.role;
                        customRoleId = ctx.user.customRoleId;
                        features = Array.isArray(feature) ? feature : [feature];
                        hasAccess = false;
                        _i = 0, features_1 = features;
                        _b.label = 1;
                    case 1:
                        if (!(_i < features_1.length)) return [3 /*break*/, 4];
                        f = features_1[_i];
                        return [4 /*yield*/, resolveUserPermission(ctx.user.id, userRole, customRoleId, f)];
                    case 2:
                        access = _b.sent();
                        if (access) {
                            hasAccess = true;
                            return [3 /*break*/, 4];
                        }
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        if (!hasAccess) {
                            throw new server_1.TRPCError({
                                code: "FORBIDDEN",
                                message: "Access denied. You don't have permission to access: " + (Array.isArray(feature) ? feature.join(', ') : feature)
                            });
                        }
                        GLOBAL_ONLY_PREFIXES = ["enterprise:", "admin:manage_"];
                        hasGlobalOnly = features.some(function (f) { return GLOBAL_ONLY_PREFIXES.some(function (p) { return f.startsWith(p); }); });
                        if (ctx.user.organizationId && hasGlobalOnly) {
                            throw new server_1.TRPCError({
                                code: "FORBIDDEN",
                                message: "This resource is only accessible to platform administrators"
                            });
                        }
                        return [2 /*return*/, next({ ctx: ctx })];
                }
            });
        });
    });
}
exports.createFeatureRestrictedProcedure = createFeatureRestrictedProcedure;
/**
 * Get all accessible features for a user role
 */
function getAccessibleFeatures(userRole) {
    // Super admin has access to all features
    if (userRole === exports.ROLES.SUPER_ADMIN) {
        return Object.keys(exports.FEATURE_ACCESS);
    }
    return Object.entries(exports.FEATURE_ACCESS)
        .filter(function (_a) {
        var _ = _a[0], roles = _a[1];
        return roles.includes(userRole);
    })
        .map(function (_a) {
        var feature = _a[0];
        return feature;
    });
}
exports.getAccessibleFeatures = getAccessibleFeatures;
/**
 * Check if organization scopes match (for multi-org systems).
 *
 * Only Kiini platform admins (super_admin with NO organizationId) can
 * access any org.  Org-scoped super_admins (who have an organizationId) are
 * restricted to their own organization.
 */
function checkOrgScopeAccess(ctx, targetOrgId) {
    // Kiini platform admin — has super_admin role but belongs to no org
    if (ctx.user.role === "super_admin" && !ctx.user.organizationId)
        return true;
    // Everyone else (including org super_admins) can only access their own org
    return ctx.user.organizationId === targetOrgId;
}
exports.checkOrgScopeAccess = checkOrgScopeAccess;
/**
 * Create an org-scoped procedure
 */
function createOrgScopedProcedure() {
    return trpc_1.protectedProcedure.use(function (_a) {
        var ctx = _a.ctx, next = _a.next;
        if (!ctx.user.organizationId) {
            throw new server_1.TRPCError({
                code: "FORBIDDEN",
                message: "User must be part of an organization to access this resource"
            });
        }
        return next({ ctx: ctx });
    });
}
exports.createOrgScopedProcedure = createOrgScopedProcedure;
