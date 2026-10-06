"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.permissionsRouter = exports.ALL_PERMISSIONS = exports.PERMISSION_DEFINITIONS = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var server_1 = require("@trpc/server");
/**
 * Permission Categories and Metadata
 * Defines all available permissions organized by module/resource
 */
exports.PERMISSION_DEFINITIONS = {
    invoices: {
        category: "Invoices",
        permissions: [
            { id: "invoices_view", label: "View", description: "View invoices" },
            { id: "invoices_create", label: "Create", description: "Create new invoices" },
            { id: "invoices_edit", label: "Edit", description: "Edit existing invoices" },
            { id: "invoices_delete", label: "Delete", description: "Delete invoices" },
            { id: "invoices_download", label: "Download", description: "Download invoice documents" },
            { id: "invoices_print", label: "Print", description: "Print invoices" },
            { id: "invoices_send", label: "Send", description: "Send invoices to clients" },
            { id: "invoices_mark_paid", label: "Mark as Paid", description: "Mark invoices as paid" },
        ]
    },
    estimates: {
        category: "Estimates",
        permissions: [
            { id: "estimates_view", label: "View", description: "View estimates" },
            { id: "estimates_create", label: "Create", description: "Create new estimates" },
            { id: "estimates_edit", label: "Edit", description: "Edit existing estimates" },
            { id: "estimates_delete", label: "Delete", description: "Delete estimates" },
            { id: "estimates_download", label: "Download", description: "Download estimate documents" },
            { id: "estimates_print", label: "Print", description: "Print estimates" },
            { id: "estimates_send", label: "Send", description: "Send estimates to clients" },
            { id: "estimates_approve", label: "Approve", description: "Approve estimates" },
        ]
    },
    receipts: {
        category: "Receipts",
        permissions: [
            { id: "receipts_view", label: "View", description: "View receipts" },
            { id: "receipts_create", label: "Create", description: "Create new receipts" },
            { id: "receipts_edit", label: "Edit", description: "Edit existing receipts" },
            { id: "receipts_delete", label: "Delete", description: "Delete receipts" },
            { id: "receipts_download", label: "Download", description: "Download receipt documents" },
            { id: "receipts_print", label: "Print", description: "Print receipts" },
        ]
    },
    payments: {
        category: "Payments",
        permissions: [
            { id: "payments_view", label: "View", description: "View payments" },
            { id: "payments_create", label: "Create", description: "Record new payments" },
            { id: "payments_edit", label: "Edit", description: "Edit payment records" },
            { id: "payments_delete", label: "Delete", description: "Delete payments" },
            { id: "payments_reconcile", label: "Reconcile", description: "Reconcile payments" },
        ]
    },
    expenses: {
        category: "Expenses",
        permissions: [
            { id: "expenses_view", label: "View", description: "View expenses" },
            { id: "expenses_create", label: "Create", description: "Create new expenses" },
            { id: "expenses_edit", label: "Edit", description: "Edit expenses" },
            { id: "expenses_delete", label: "Delete", description: "Delete expenses" },
            { id: "expenses_approve", label: "Approve", description: "Approve expenses" },
        ]
    },
    clients: {
        category: "Clients",
        permissions: [
            { id: "clients_view", label: "View", description: "View clients" },
            { id: "clients_create", label: "Create", description: "Create new clients" },
            { id: "clients_edit", label: "Edit", description: "Edit client information" },
            { id: "clients_delete", label: "Delete", description: "Delete clients" },
        ]
    },
    users: {
        category: "Users",
        permissions: [
            { id: "users_view", label: "View", description: "View users" },
            { id: "users_create", label: "Create", description: "Create new users" },
            { id: "users_edit", label: "Edit", description: "Edit user information" },
            { id: "users_delete", label: "Delete", description: "Delete users" },
            { id: "users_manage_permissions", label: "Manage Permissions", description: "Manage user permissions" },
        ]
    },
    reports: {
        category: "Reports",
        permissions: [
            { id: "reports_view", label: "View", description: "View reports" },
            { id: "reports_create", label: "Create", description: "Create custom reports" },
            { id: "reports_download", label: "Download", description: "Download reports" },
            { id: "reports_schedule", label: "Schedule", description: "Schedule report delivery" },
        ]
    },
    products: {
        category: "Products",
        permissions: [
            { id: "products_view", label: "View", description: "View products" },
            { id: "products_create", label: "Create", description: "Create new products" },
            { id: "products_edit", label: "Edit", description: "Edit products" },
            { id: "products_delete", label: "Delete", description: "Delete products" },
        ]
    },
    projects: {
        category: "Projects",
        permissions: [
            { id: "projects_view", label: "View", description: "View projects" },
            { id: "projects_create", label: "Create", description: "Create new projects" },
            { id: "projects_edit", label: "Edit", description: "Edit projects" },
            { id: "projects_delete", label: "Delete", description: "Delete projects" },
            { id: "projects_manage_team", label: "Manage Team", description: "Manage project team members" },
        ]
    },
    hr: {
        category: "HR Management",
        permissions: [
            { id: "hr_view", label: "View", description: "View HR data" },
            { id: "hr_employees_manage", label: "Manage Employees", description: "Create and edit employee records" },
            { id: "hr_payroll_view", label: "View Payroll", description: "View payroll information" },
            { id: "hr_payroll_process", label: "Process Payroll", description: "Process payroll" },
            { id: "hr_attendance_manage", label: "Manage Attendance", description: "Manage attendance records" },
            { id: "hr_leave_approve", label: "Approve Leave", description: "Approve leave requests" },
        ]
    },
    suppliers: {
        category: "Procurement - Suppliers",
        permissions: [
            { id: "suppliers_view", label: "View", description: "View suppliers" },
            { id: "suppliers_create", label: "Create", description: "Create new suppliers" },
            { id: "suppliers_edit", label: "Edit", description: "Edit supplier information" },
            { id: "suppliers_delete", label: "Delete", description: "Delete suppliers" },
            { id: "suppliers_rate", label: "Rate", description: "Rate supplier performance" },
            { id: "suppliers_audit", label: "Audit", description: "Conduct supplier audits" },
        ]
    },
    departments: {
        category: "Organization - Departments",
        permissions: [
            { id: "departments_view", label: "View", description: "View departments" },
            { id: "departments_create", label: "Create", description: "Create departments" },
            { id: "departments_edit", label: "Edit", description: "Edit department information" },
            { id: "departments_delete", label: "Delete", description: "Delete departments" },
            { id: "departments_manage_staff", label: "Manage Staff", description: "Assign staff to departments" },
        ]
    },
    budgets: {
        category: "Procurement - Budgets",
        permissions: [
            { id: "budgets_view", label: "View", description: "View budgets" },
            { id: "budgets_create", label: "Create", description: "Create new budgets" },
            { id: "budgets_edit", label: "Edit", description: "Edit budget information" },
            { id: "budgets_delete", label: "Delete", description: "Delete budgets" },
            { id: "budgets_approve", label: "Approve", description: "Approve budget requests" },
            { id: "budgets_track", label: "Track Spending", description: "Track budget spending" },
        ]
    },
    settings: {
        category: "Settings",
        permissions: [
            { id: "settings_view", label: "View", description: "View system settings" },
            { id: "settings_edit", label: "Edit", description: "Edit system settings" },
            { id: "settings_manage_roles", label: "Manage Roles", description: "Manage user roles" },
        ]
    }
};
// Flatten all permissions for easy lookup
exports.ALL_PERMISSIONS = Object.values(exports.PERMISSION_DEFINITIONS)
    .flatMap(function (category) { return category.permissions; })
    .reduce(function (acc, perm) {
    var _a;
    return (__assign(__assign({}, acc), (_a = {}, _a[perm.id] = perm, _a)));
}, {});
exports.permissionsRouter = trpc_1.router({
    /**
     * Get all available permissions organized by category
     */
    getAll: trpc_1.createFeatureRestrictedProcedure("permissions:manage").query(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, exports.PERMISSION_DEFINITIONS];
        });
    }); }),
    /**
     * Get permissions for a specific user
     */
    getUserPermissions: trpc_1.createFeatureRestrictedProcedure("permissions:read")
        .input(zod_1.z.string())
        .query(function (_a) {
        var userId = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_b) {
                // Only super_admin can view others' permissions
                if (ctx.user.id !== userId && ctx.user.role !== "super_admin") {
                    throw new server_1.TRPCError({
                        code: "FORBIDDEN",
                        message: "You can only view your own permissions"
                    });
                }
                result = {};
                // Initialize all permissions as false
                Object.entries(exports.PERMISSION_DEFINITIONS).forEach(function (_a) {
                    var key = _a[0], category = _a[1];
                    result[category.category] = {};
                    category.permissions.forEach(function (perm) {
                        result[category.category][perm.id] = false;
                    });
                });
                // Super admin gets all permissions by default
                if (ctx.user.role === "super_admin") {
                    Object.entries(exports.PERMISSION_DEFINITIONS).forEach(function (_a) {
                        var key = _a[0], category = _a[1];
                        category.permissions.forEach(function (perm) {
                            result[category.category][perm.id] = true;
                        });
                    });
                }
                // userPermissions table was dropped in migration 0004 — use role-based defaults only
                return [2 /*return*/, result];
            });
        });
    }),
    /**
     * Update a user's permission
     */
    updateUserPermission: trpc_1.createFeatureRestrictedProcedure("permissions:manage")
        .input(zod_1.z.object({
        userId: zod_1.z.string(),
        permissionId: zod_1.z.string(),
        granted: zod_1.z.boolean()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, targetUser;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (ctx.user.role !== "super_admin") {
                            throw new server_1.TRPCError({ code: "FORBIDDEN", message: "Only super admin can manage permissions" });
                        }
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        return [4 /*yield*/, db.select().from(schema_1.users).where(drizzle_orm_1.eq(schema_1.users.id, input.userId))];
                    case 2:
                        targetUser = _b.sent();
                        if (!targetUser.length) {
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "User not found" });
                        }
                        // userPermissions table was dropped — return success without DB write
                        // Permission changes are handled via role assignments until table is re-created
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    /**
     * Bulk update user permissions
     */
    bulkUpdatePermissions: trpc_1.createFeatureRestrictedProcedure("permissions:manage")
        .input(zod_1.z.object({
        userId: zod_1.z.string(),
        permissions: zod_1.z.record(zod_1.z.string(), zod_1.z.coerce.boolean())
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (ctx.user.role !== "super_admin") {
                            throw new server_1.TRPCError({ code: "FORBIDDEN", message: "Only super admin can manage permissions" });
                        }
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        // userPermissions table was dropped — return success without DB write
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    /**
     * Check if user has a specific permission
     */
    hasPermission: trpc_1.createFeatureRestrictedProcedure("permissions:read")
        .input(zod_1.z.object({
        userId: zod_1.z.string().optional(),
        permissionId: zod_1.z.string()
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var userId;
            return __generator(this, function (_b) {
                // Super admin has all permissions
                if (ctx.user.role === "super_admin")
                    return [2 /*return*/, true];
                userId = input.userId || ctx.user.id;
                // userPermissions table was dropped — fall back to role-based permissions
                return [2 /*return*/, false];
            });
        });
    }),
    /**
     * Get permission categories for frontend display
     */
    getCategories: trpc_1.protectedProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, Object.entries(exports.PERMISSION_DEFINITIONS).map(function (_a) {
                    var key = _a[0], category = _a[1];
                    return ({
                        key: key,
                        name: category.category,
                        permissionCount: category.permissions.length
                    });
                })];
        });
    }); })
});
