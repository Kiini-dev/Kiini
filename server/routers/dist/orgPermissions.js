"use strict";
/**
 * Organization Permissions Management Router
 *
 * Handles CRUD operations for organization-level permission management,
 * allowing org admins to manage role-based access control within their organization.
 */
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
exports.orgPermissionsRouter = void 0;
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var server_1 = require("@trpc/server");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
// Permission-restricted procedures
var viewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("org:settings:roles");
var editProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("org:settings:roles");
var permissionsProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("org:settings:permissions");
/**
 * Organization permission management schema
 */
var RoleInput = zod_1.z.object({
    name: zod_1.z.string().min(1, "Role name required"),
    displayName: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    baseRole: zod_1.z.string().optional(),
    permissions: zod_1.z.array(zod_1.z.string()).optional(),
    isActive: zod_1.z.boolean().optional()
});
var PermissionInput = zod_1.z.object({
    userId: zod_1.z.string(),
    permissions: zod_1.z.record(zod_1.z.string(), zod_1.z.boolean())
});
exports.orgPermissionsRouter = trpc_1.router({
    /**
     * List all custom roles in the organization
     */
    listRoles: viewProcedure
        .input(zod_1.z.object({ organizationId: zod_1.z.string().optional() }).optional())
        .query(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, roles, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        orgId = (input === null || input === void 0 ? void 0 : input.organizationId) || ctx.user.organizationId;
                        if (!orgId) {
                            throw new server_1.TRPCError({
                                code: "BAD_REQUEST",
                                message: "Organization ID required"
                            });
                        }
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.customRoles)
                                .where(drizzle_orm_1.eq(schema_1.customRoles.organizationId, orgId))];
                    case 2:
                        roles = _b.sent();
                        return [2 /*return*/, roles.map(function (role) { return ({
                                id: role.id,
                                name: role.name,
                                displayName: role.displayName,
                                description: role.description,
                                baseRole: role.baseRole,
                                permissions: role.permissions ? JSON.parse(role.permissions) : [],
                                isActive: role.isActive === 1,
                                createdAt: role.createdAt,
                                updatedAt: role.updatedAt
                            }); })];
                    case 3:
                        error_1 = _b.sent();
                        console.error("Error fetching roles:", error_1);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to fetch roles"
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Create a new custom role in the organization
     */
    createRole: editProcedure
        .input(RoleInput)
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, existing, roleId, now, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db) {
                            throw new server_1.TRPCError({
                                code: "INTERNAL_SERVER_ERROR",
                                message: "Database connection failed"
                            });
                        }
                        orgId = ctx.user.organizationId;
                        if (!orgId) {
                            throw new server_1.TRPCError({
                                code: "BAD_REQUEST",
                                message: "Organization context required"
                            });
                        }
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.customRoles)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.customRoles.organizationId, orgId), drizzle_orm_1.eq(schema_1.customRoles.name, input.name)))
                                .limit(1)];
                    case 2:
                        existing = _b.sent();
                        if (existing.length > 0) {
                            throw new server_1.TRPCError({
                                code: "CONFLICT",
                                message: "Role with this name already exists in your organization"
                            });
                        }
                        roleId = uuid_1.v4();
                        now = new Date().toISOString().replace("T", " ").substring(0, 19);
                        return [4 /*yield*/, db.insert(schema_1.customRoles).values({
                                id: roleId,
                                organizationId: orgId,
                                name: input.name,
                                displayName: input.displayName || input.name,
                                description: input.description || "",
                                baseRole: input.baseRole || "staff",
                                permissions: JSON.stringify(input.permissions || []),
                                isActive: 1,
                                createdAt: now,
                                updatedAt: now
                            })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, {
                                id: roleId,
                                name: input.name,
                                displayName: input.displayName || input.name,
                                description: input.description || "",
                                baseRole: input.baseRole || "staff",
                                permissions: input.permissions || [],
                                isActive: true,
                                createdAt: now,
                                updatedAt: now
                            }];
                    case 4:
                        error_2 = _b.sent();
                        console.error("Error creating role:", error_2);
                        if (error_2 instanceof server_1.TRPCError)
                            throw error_2;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to create role"
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Update an existing custom role
     */
    updateRole: editProcedure
        .input(zod_1.z.object(__assign({ roleId: zod_1.z.string() }, RoleInput.omit({ name: true }).shape)))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, existing, now, updateData, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db) {
                            throw new server_1.TRPCError({
                                code: "INTERNAL_SERVER_ERROR",
                                message: "Database connection failed"
                            });
                        }
                        orgId = ctx.user.organizationId;
                        if (!orgId) {
                            throw new server_1.TRPCError({
                                code: "BAD_REQUEST",
                                message: "Organization context required"
                            });
                        }
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.customRoles)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.customRoles.id, input.roleId), drizzle_orm_1.eq(schema_1.customRoles.organizationId, orgId)))
                                .limit(1)];
                    case 2:
                        existing = _b.sent();
                        if (existing.length === 0) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Role not found"
                            });
                        }
                        now = new Date().toISOString().replace("T", " ").substring(0, 19);
                        updateData = {
                            updatedAt: now
                        };
                        if (input.displayName !== undefined)
                            updateData.displayName = input.displayName;
                        if (input.description !== undefined)
                            updateData.description = input.description;
                        if (input.baseRole !== undefined)
                            updateData.baseRole = input.baseRole;
                        if (input.permissions !== undefined)
                            updateData.permissions = JSON.stringify(input.permissions);
                        if (input.isActive !== undefined)
                            updateData.isActive = input.isActive ? 1 : 0;
                        return [4 /*yield*/, db.update(schema_1.customRoles).set(updateData).where(drizzle_orm_1.eq(schema_1.customRoles.id, input.roleId))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, {
                                id: input.roleId,
                                name: existing[0].name,
                                displayName: updateData.displayName || existing[0].displayName,
                                description: updateData.description || existing[0].description,
                                baseRole: updateData.baseRole || existing[0].baseRole,
                                permissions: updateData.permissions ? JSON.parse(updateData.permissions) : JSON.parse(existing[0].permissions || "[]"),
                                isActive: updateData.isActive === 1,
                                updatedAt: now
                            }];
                    case 4:
                        error_3 = _b.sent();
                        console.error("Error updating role:", error_3);
                        if (error_3 instanceof server_1.TRPCError)
                            throw error_3;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to update role"
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Delete a custom role
     */
    deleteRole: editProcedure
        .input(zod_1.z.object({ roleId: zod_1.z.string() }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, usersWithRole, result, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db) {
                            throw new server_1.TRPCError({
                                code: "INTERNAL_SERVER_ERROR",
                                message: "Database connection failed"
                            });
                        }
                        orgId = ctx.user.organizationId;
                        if (!orgId) {
                            throw new server_1.TRPCError({
                                code: "BAD_REQUEST",
                                message: "Organization context required"
                            });
                        }
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.users)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.users.customRoleId, input.roleId), drizzle_orm_1.eq(schema_1.users.organizationId, orgId)))];
                    case 2:
                        usersWithRole = _b.sent();
                        if (usersWithRole.length > 0) {
                            throw new server_1.TRPCError({
                                code: "CONFLICT",
                                message: "Cannot delete role: " + usersWithRole.length + " user(s) are assigned to this role. Reassign users first."
                            });
                        }
                        return [4 /*yield*/, db["delete"](schema_1.customRoles)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.customRoles.id, input.roleId), drizzle_orm_1.eq(schema_1.customRoles.organizationId, orgId)))];
                    case 3:
                        result = _b.sent();
                        return [2 /*return*/, { success: true, message: "Role deleted successfully" }];
                    case 4:
                        error_4 = _b.sent();
                        console.error("Error deleting role:", error_4);
                        if (error_4 instanceof server_1.TRPCError)
                            throw error_4;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to delete role"
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Assign a custom role to a user
     */
    assignRoleToUser: editProcedure
        .input(zod_1.z.object({
        userId: zod_1.z.string(),
        roleId: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, userRecord, roleRecord, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db) {
                            throw new server_1.TRPCError({
                                code: "INTERNAL_SERVER_ERROR",
                                message: "Database connection failed"
                            });
                        }
                        orgId = ctx.user.organizationId;
                        if (!orgId) {
                            throw new server_1.TRPCError({
                                code: "BAD_REQUEST",
                                message: "Organization context required"
                            });
                        }
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.users)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.users.id, input.userId), drizzle_orm_1.eq(schema_1.users.organizationId, orgId)))
                                .limit(1)];
                    case 2:
                        userRecord = _b.sent();
                        if (userRecord.length === 0) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "User not found"
                            });
                        }
                        if (!input.roleId) return [3 /*break*/, 4];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.customRoles)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.customRoles.id, input.roleId), drizzle_orm_1.eq(schema_1.customRoles.organizationId, orgId)))
                                .limit(1)];
                    case 3:
                        roleRecord = _b.sent();
                        if (roleRecord.length === 0) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Role not found"
                            });
                        }
                        _b.label = 4;
                    case 4: 
                    // Update user's custom role
                    return [4 /*yield*/, db
                            .update(schema_1.users)
                            .set({
                            customRoleId: input.roleId || null,
                            updatedAt: new Date()
                        })
                            .where(drizzle_orm_1.eq(schema_1.users.id, input.userId))];
                    case 5:
                        // Update user's custom role
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                userId: input.userId,
                                roleId: input.roleId || null,
                                message: input.roleId
                                    ? "Role assigned successfully"
                                    : "Custom role removed successfully"
                            }];
                    case 6:
                        error_5 = _b.sent();
                        console.error("Error assigning role:", error_5);
                        if (error_5 instanceof server_1.TRPCError)
                            throw error_5;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to assign role"
                        });
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get permission matrix for a role
     */
    getRolePermissions: viewProcedure
        .input(zod_1.z.object({ roleId: zod_1.z.string() }))
        .query(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, role, permissions, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { roleId: input.roleId, permissions: {} }];
                        orgId = ctx.user.organizationId;
                        if (!orgId) {
                            throw new server_1.TRPCError({
                                code: "BAD_REQUEST",
                                message: "Organization context required"
                            });
                        }
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.customRoles)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.customRoles.id, input.roleId), drizzle_orm_1.eq(schema_1.customRoles.organizationId, orgId)))
                                .limit(1)];
                    case 2:
                        role = _b.sent();
                        if (role.length === 0) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Role not found"
                            });
                        }
                        permissions = role[0].permissions
                            ? JSON.parse(role[0].permissions)
                            : [];
                        return [2 /*return*/, {
                                roleId: input.roleId,
                                roleName: role[0].name,
                                baseRole: role[0].baseRole,
                                permissions: permissions
                            }];
                    case 3:
                        error_6 = _b.sent();
                        console.error("Error fetching role permissions:", error_6);
                        if (error_6 instanceof server_1.TRPCError)
                            throw error_6;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to fetch role permissions"
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get organization feature access overview
     */
    getFeatureAccessMatrix: viewProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, roles, featureCategories, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { features: {}, roles: [] }];
                        orgId = ctx.user.organizationId;
                        if (!orgId) {
                            throw new server_1.TRPCError({
                                code: "BAD_REQUEST",
                                message: "Organization context required"
                            });
                        }
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.customRoles)
                                .where(drizzle_orm_1.eq(schema_1.customRoles.organizationId, orgId))];
                    case 2:
                        roles = _b.sent();
                        featureCategories = {
                            "org:settings:general": { label: "General Settings", category: "Settings" },
                            "org:settings:company": { label: "Company Details", category: "Settings" },
                            "org:settings:email": { label: "Email Configuration", category: "Settings" },
                            "org:settings:security": { label: "Security Settings", category: "Security" },
                            "org:settings:roles": { label: "Roles & Permissions", category: "Security" },
                            "org:settings:backup": { label: "Backup & Restore", category: "Data" }
                        };
                        return [2 /*return*/, {
                                features: featureCategories,
                                roles: roles.map(function (r) { return ({
                                    id: r.id,
                                    name: r.name,
                                    displayName: r.displayName,
                                    permissions: r.permissions ? JSON.parse(r.permissions) : []
                                }); })
                            }];
                    case 3:
                        error_7 = _b.sent();
                        console.error("Error fetching feature access matrix:", error_7);
                        if (error_7 instanceof server_1.TRPCError)
                            throw error_7;
                        return [2 /*return*/, { features: {}, roles: [] }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    })
});
