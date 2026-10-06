"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.rolesRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db = require("../db");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var organizationIsolationEnforcer_1 = require("../middleware/organizationIsolationEnforcer");
exports.rolesRouter = trpc_1.router({
    // List system roles (from userRoles table) + custom roles for the user's org
    list: trpc_1.protectedProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, systemRoles, normalizedSystem, orgFilter, whereClause, orgCustomRoles, normalizedCustom;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, db.getRoles()];
                    case 2:
                        systemRoles = _b.sent();
                        normalizedSystem = (systemRoles || []).map(function (r) { return ({
                            id: r.id,
                            name: r.role || r.roleName || r.name || r.displayName || '',
                            displayName: r.roleName || r.displayName || r.name || r.role || '',
                            description: r.description || '',
                            permissions: r.permissions || [],
                            isSystem: true,
                            isCustom: false,
                            isAdvanced: false,
                            baseRole: null,
                            createdAt: r.createdAt || r.created_at || new Date().toISOString().replace('T', ' ').substring(0, 19),
                            updatedAt: r.updatedAt || r.updated_at || null
                        }); });
                        orgFilter = organizationIsolationEnforcer_1.enforceOrganizationIsolation(ctx.user, schema_1.customRoles.organizationId, false);
                        whereClause = orgFilter ? drizzle_orm_1.and(orgFilter, drizzle_orm_1.eq(schema_1.customRoles.isActive, 1)) : drizzle_orm_1.eq(schema_1.customRoles.isActive, 1);
                        return [4 /*yield*/, database.select().from(schema_1.customRoles).where(whereClause)];
                    case 3:
                        orgCustomRoles = _b.sent();
                        normalizedCustom = orgCustomRoles.map(function (r) {
                            var perms = [];
                            try {
                                perms = r.permissions ? JSON.parse(r.permissions) : [];
                            }
                            catch (_a) { }
                            return {
                                id: r.id,
                                name: r.name,
                                displayName: r.displayName,
                                description: r.description || '',
                                permissions: perms,
                                isSystem: !!r.isSystem,
                                isCustom: true,
                                isAdvanced: !!r.isAdvanced,
                                baseRole: r.baseRole,
                                createdAt: r.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 19),
                                updatedAt: r.updatedAt || null
                            };
                        });
                        return [2 /*return*/, __spreadArrays(normalizedSystem, normalizedCustom)];
                }
            });
        });
    }),
    getPermissions: trpc_1.protectedProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db.getPermissions()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); }),
    // Get all available permission features from FEATURE_ACCESS for the custom role UI
    getAvailableFeatures: trpc_1.protectedProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var features, advancedActions, _loop_1, _i, _a, feature;
        return __generator(this, function (_b) {
            features = [];
            advancedActions = ['delete', 'approve', 'reject', 'reconcile', 'refund', 'manage', 'export'];
            _loop_1 = function (feature) {
                var parts = feature.split(':');
                var category = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
                var action = parts.slice(1).join(':');
                var isAdvanced = advancedActions.some(function (a) { return action.includes(a); });
                features.push({
                    key: feature,
                    label: category + ": " + action.replace(/_/g, ' ').replace(/:/g, ' > '),
                    category: category,
                    isAdvanced: isAdvanced
                });
            };
            for (_i = 0, _a = Object.entries(enhancedRbac_1.FEATURE_ACCESS); _i < _a.length; _i++) {
                feature = _a[_i][0];
                _loop_1(feature);
            }
            return [2 /*return*/, features];
        });
    }); }),
    getUserCounts: trpc_1.protectedProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, results, _b, counts;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            return [2 /*return*/, {}];
                        orgId = ctx.user.organizationId;
                        if (!orgId) return [3 /*break*/, 3];
                        return [4 /*yield*/, database.select({ role: schema_1.users.role, count: drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["count(*)"], ["count(*)"]))) })
                                .from(schema_1.users).where(drizzle_orm_1.eq(schema_1.users.organizationId, orgId)).groupBy(schema_1.users.role)];
                    case 2:
                        _b = _c.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, database.select({ role: schema_1.users.role, count: drizzle_orm_1.sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["count(*)"], ["count(*)"]))) })
                            .from(schema_1.users).groupBy(schema_1.users.role)];
                    case 4:
                        _b = _c.sent();
                        _c.label = 5;
                    case 5:
                        results = _b;
                        counts = {};
                        results.forEach(function (r) { if (r.role)
                            counts[r.role] = Number(r.count); });
                        return [2 /*return*/, counts];
                }
            });
        });
    }),
    // Create a custom role for the user's organization
    createCustomRole: trpc_1.createFeatureRestrictedProcedure("settings:roles")
        .input(zod_1.z.object({
        name: zod_1.z.string().min(1).max(100),
        displayName: zod_1.z.string().min(1).max(255),
        description: zod_1.z.string().optional(),
        permissions: zod_1.z.array(zod_1.z.string()),
        baseRole: zod_1.z["enum"](['user', 'admin', 'staff', 'accountant', 'client', 'super_admin', 'project_manager', 'hr', 'ict_manager', 'procurement_manager', 'sales_manager'])["default"]('staff'),
        isAdvanced: zod_1.z.boolean()["default"](false)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, id, now;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error('Database not available');
                        orgId = ctx.user.organizationId;
                        if (!orgId) {
                            // Global admins can create org-less custom roles (platform level)
                            if (ctx.user.role !== 'super_admin') {
                                throw new Error('Organization context required to create custom roles');
                            }
                        }
                        id = uuid_1.v4();
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, database.insert(schema_1.customRoles).values({
                                id: id,
                                organizationId: orgId || null,
                                name: input.name.toLowerCase().replace(/\s+/g, '_'),
                                displayName: input.displayName,
                                description: input.description || null,
                                permissions: JSON.stringify(input.permissions),
                                baseRole: input.baseRole,
                                isAdvanced: input.isAdvanced ? 1 : 0,
                                isSystem: 0,
                                isActive: 1,
                                createdBy: ctx.user.id,
                                createdAt: now,
                                updatedAt: now
                            })];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, db.logActivity({ userId: ctx.user.id, action: 'custom_role_created', entityType: 'customRole', entityId: id, description: "Created custom role: " + input.displayName })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { id: id, name: input.name, displayName: input.displayName }];
                }
            });
        });
    }),
    // Update a custom role
    updateCustomRole: trpc_1.createFeatureRestrictedProcedure("settings:roles")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        displayName: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        permissions: zod_1.z.array(zod_1.z.string()).optional(),
        baseRole: zod_1.z["enum"](['user', 'admin', 'staff', 'accountant', 'client', 'super_admin', 'project_manager', 'hr', 'ict_manager', 'procurement_manager', 'sales_manager']).optional(),
        isAdvanced: zod_1.z.boolean().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, existing, updateSet;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error('Database not available');
                        return [4 /*yield*/, database.select().from(schema_1.customRoles).where(drizzle_orm_1.eq(schema_1.customRoles.id, input.id)).limit(1)];
                    case 2:
                        existing = _b.sent();
                        if (!existing.length)
                            throw new Error('Custom role not found');
                        if (existing[0].isSystem)
                            throw new Error('System roles cannot be modified');
                        organizationIsolationEnforcer_1.validateOwnership(ctx.user, existing[0].organizationId, input.id);
                        updateSet = { updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) };
                        if (input.displayName !== undefined)
                            updateSet.displayName = input.displayName;
                        if (input.description !== undefined)
                            updateSet.description = input.description;
                        if (input.permissions !== undefined)
                            updateSet.permissions = JSON.stringify(input.permissions);
                        if (input.baseRole !== undefined)
                            updateSet.baseRole = input.baseRole;
                        if (input.isAdvanced !== undefined)
                            updateSet.isAdvanced = input.isAdvanced ? 1 : 0;
                        return [4 /*yield*/, database.update(schema_1.customRoles).set(updateSet).where(drizzle_orm_1.eq(schema_1.customRoles.id, input.id))];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, db.logActivity({ userId: ctx.user.id, action: 'custom_role_updated', entityType: 'customRole', entityId: input.id, description: "Updated custom role: " + input.id })];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // Delete a custom role
    deleteCustomRole: trpc_1.createFeatureRestrictedProcedure("settings:roles")
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, existing;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error('Database not available');
                        return [4 /*yield*/, database.select().from(schema_1.customRoles).where(drizzle_orm_1.eq(schema_1.customRoles.id, input)).limit(1)];
                    case 2:
                        existing = _b.sent();
                        if (!existing.length)
                            throw new Error('Custom role not found');
                        if (existing[0].isSystem)
                            throw new Error('System roles cannot be deleted');
                        organizationIsolationEnforcer_1.validateOwnership(ctx.user, existing[0].organizationId, input);
                        // Soft-delete: mark as inactive
                        return [4 /*yield*/, database.update(schema_1.customRoles).set({ isActive: 0, updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) }).where(drizzle_orm_1.eq(schema_1.customRoles.id, input))];
                    case 3:
                        // Soft-delete: mark as inactive
                        _b.sent();
                        // Unassign users from this custom role
                        return [4 /*yield*/, database.update(schema_1.users).set({ customRoleId: null }).where(drizzle_orm_1.eq(schema_1.users.customRoleId, input))];
                    case 4:
                        // Unassign users from this custom role
                        _b.sent();
                        return [4 /*yield*/, db.logActivity({ userId: ctx.user.id, action: 'custom_role_deleted', entityType: 'customRole', entityId: input, description: "Deleted custom role: " + input })];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // Assign a custom role to a user
    assignCustomRole: trpc_1.createFeatureRestrictedProcedure("settings:roles")
        .input(zod_1.z.object({ userId: zod_1.z.string(), customRoleId: zod_1.z.string().nullable() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, role;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error('Database not available');
                        if (!input.customRoleId) return [3 /*break*/, 3];
                        return [4 /*yield*/, database.select().from(schema_1.customRoles).where(drizzle_orm_1.eq(schema_1.customRoles.id, input.customRoleId)).limit(1)];
                    case 2:
                        role = _b.sent();
                        if (!role.length)
                            throw new Error('Custom role not found');
                        organizationIsolationEnforcer_1.validateOwnership(ctx.user, role[0].organizationId, input.customRoleId);
                        _b.label = 3;
                    case 3: return [4 /*yield*/, database.update(schema_1.users).set({ customRoleId: input.customRoleId }).where(drizzle_orm_1.eq(schema_1.users.id, input.userId))];
                    case 4:
                        _b.sent();
                        return [4 /*yield*/, db.logActivity({ userId: ctx.user.id, action: 'custom_role_assigned', entityType: 'user', entityId: input.userId, description: "Assigned custom role " + input.customRoleId + " to user " + input.userId })];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // Set default role for a department
    setDepartmentDefaultRole: trpc_1.createFeatureRestrictedProcedure("departments:edit")
        .input(zod_1.z.object({ departmentId: zod_1.z.string(), defaultRole: zod_1.z.string().nullable() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, dept;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error('Database not available');
                        return [4 /*yield*/, database.select().from(schema_1.departments).where(drizzle_orm_1.eq(schema_1.departments.id, input.departmentId)).limit(1)];
                    case 2:
                        dept = _b.sent();
                        if (!dept.length)
                            throw new Error('Department not found');
                        organizationIsolationEnforcer_1.validateOwnership(ctx.user, dept[0].organizationId, input.departmentId);
                        return [4 /*yield*/, database.update(schema_1.departments).set({ defaultRole: input.defaultRole }).where(drizzle_orm_1.eq(schema_1.departments.id, input.departmentId))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // Legacy: create system role (kept for backward compatibility)
    create: trpc_1.createFeatureRestrictedProcedure("settings:roles")
        .input(zod_1.z.object({
        name: zod_1.z.string(),
        displayName: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        permissions: zod_1.z.array(zod_1.z.string().optional()).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var id, perms, allPerms, _loop_2, _i, perms_1, pName;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db.createRole(input.name, input.description)];
                    case 1:
                        id = _b.sent();
                        perms = (input.permissions || []).filter(function (p) { return typeof p === 'string' && p !== ''; });
                        if (!perms.length) return [3 /*break*/, 6];
                        return [4 /*yield*/, db.getPermissions()];
                    case 2:
                        allPerms = _b.sent();
                        _loop_2 = function (pName) {
                            var perm;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        perm = allPerms.find(function (pp) { return pp.permissionName === pName || pp.name === pName; });
                                        if (!(perm && perm.id)) return [3 /*break*/, 2];
                                        return [4 /*yield*/, db.assignPermissionToRole(id, perm.id)];
                                    case 1:
                                        _a.sent();
                                        _a.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        };
                        _i = 0, perms_1 = perms;
                        _b.label = 3;
                    case 3:
                        if (!(_i < perms_1.length)) return [3 /*break*/, 6];
                        pName = perms_1[_i];
                        return [5 /*yield**/, _loop_2(pName)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [4 /*yield*/, db.logActivity({ userId: ctx.user.id, action: 'role_created', entityType: 'role', entityId: id, description: "Created role: " + input.name })];
                    case 7:
                        _b.sent();
                        return [2 /*return*/, { id: id, name: input.name, displayName: input.displayName || input.name, description: input.description }];
                }
            });
        });
    }),
    update: trpc_1.createFeatureRestrictedProcedure("settings:roles")
        .input(zod_1.z.object({ id: zod_1.z.string(), displayName: zod_1.z.string().optional(), description: zod_1.z.string().optional(), permissions: zod_1.z.array(zod_1.z.string().optional()).optional() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var updateSet, dbconn, existing, _i, existing_1, rp, perms, allPerms, _loop_3, _b, perms_2, pName;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        updateSet = {};
                        if (input.displayName !== undefined)
                            updateSet.roleName = input.displayName;
                        if (input.description !== undefined)
                            updateSet.description = input.description;
                        if (!(Object.keys(updateSet).length > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        dbconn = _c.sent();
                        if (!dbconn) return [3 /*break*/, 3];
                        return [4 /*yield*/, dbconn.update(schema_1.userRoles).set(updateSet).where(drizzle_orm_1.eq(schema_1.userRoles.id, input.id))];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3:
                        if (!input.permissions) return [3 /*break*/, 13];
                        return [4 /*yield*/, db.getRolePermissions(input.id)];
                    case 4:
                        existing = _c.sent();
                        _i = 0, existing_1 = existing;
                        _c.label = 5;
                    case 5:
                        if (!(_i < existing_1.length)) return [3 /*break*/, 8];
                        rp = existing_1[_i];
                        if (!rp.permissionId) return [3 /*break*/, 7];
                        return [4 /*yield*/, db.removePermissionFromRole(input.id, rp.permissionId)];
                    case 6:
                        _c.sent();
                        _c.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 5];
                    case 8:
                        perms = (input.permissions || []).filter(function (p) { return typeof p === 'string' && p !== ''; });
                        return [4 /*yield*/, db.getPermissions()];
                    case 9:
                        allPerms = _c.sent();
                        _loop_3 = function (pName) {
                            var perm;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        perm = allPerms.find(function (pp) { return pp.permissionName === pName || pp.name === pName; });
                                        if (!(perm && perm.id)) return [3 /*break*/, 2];
                                        return [4 /*yield*/, db.assignPermissionToRole(input.id, perm.id)];
                                    case 1:
                                        _a.sent();
                                        _a.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        };
                        _b = 0, perms_2 = perms;
                        _c.label = 10;
                    case 10:
                        if (!(_b < perms_2.length)) return [3 /*break*/, 13];
                        pName = perms_2[_b];
                        return [5 /*yield**/, _loop_3(pName)];
                    case 11:
                        _c.sent();
                        _c.label = 12;
                    case 12:
                        _b++;
                        return [3 /*break*/, 10];
                    case 13: return [4 /*yield*/, db.logActivity({ userId: ctx.user.id, action: 'role_updated', entityType: 'role', entityId: input.id, description: "Updated role: " + input.id })];
                    case 14:
                        _c.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    "delete": trpc_1.createFeatureRestrictedProcedure("settings:roles")
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var dbconn, role;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        dbconn = _b.sent();
                        if (!dbconn)
                            throw new Error('Database not available');
                        return [4 /*yield*/, dbconn.select().from(schema_1.userRoles).where(drizzle_orm_1.eq(schema_1.userRoles.id, input)).limit(1)];
                    case 2:
                        role = _b.sent();
                        if (role.length && role[0].roleName && ['super_admin', 'admin'].includes(role[0].roleName)) {
                            throw new Error('Cannot delete system role');
                        }
                        return [4 /*yield*/, dbconn["delete"](schema_1.userRoles).where(drizzle_orm_1.eq(schema_1.userRoles.id, input))];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, db.logActivity({ userId: ctx.user.id, action: 'role_deleted', entityType: 'role', entityId: input, description: "Deleted role: " + input })];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    })
});
var templateObject_1, templateObject_2;
