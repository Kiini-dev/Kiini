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
exports.enhancedPermissionsRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var readProcedure = trpc_1.createFeatureRestrictedProcedure("permissions:read");
var writeProcedure = trpc_1.createFeatureRestrictedProcedure("permissions:edit");
exports.enhancedPermissionsRouter = trpc_1.router({
    /**
     * List all permissions with metadata
     */
    list: readProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, permissions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db.select().from(schema_1.permissionMetadata)];
                case 2:
                    permissions = _a.sent();
                    return [2 /*return*/, permissions.map(function (p) { return ({
                            id: p.permissionId,
                            label: p.label,
                            description: p.description,
                            category: p.category,
                            icon: p.icon,
                            isSystem: !!p.isSystem
                        }); })];
            }
        });
    }); }),
    /**
     * Get permissions by category
     */
    getByCategory: readProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var category = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, permissions;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.permissionMetadata)
                                .where(drizzle_orm_1.eq(schema_1.permissionMetadata.category, category))];
                    case 2:
                        permissions = _b.sent();
                        return [2 /*return*/, permissions.map(function (p) { return ({
                                id: p.permissionId,
                                label: p.label,
                                description: p.description,
                                category: p.category,
                                icon: p.icon,
                                isSystem: !!p.isSystem
                            }); })];
                }
            });
        });
    }),
    /**
     * Get all permission categories
     */
    getCategories: readProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, permissions, categories;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db.select().from(schema_1.permissionMetadata)];
                case 2:
                    permissions = _a.sent();
                    categories = Array.from(new Set(permissions.map(function (p) { return p.category; })));
                    return [2 /*return*/, categories.sort()];
            }
        });
    }); }),
    /**
     * Get permission details
     */
    getDetail: readProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var permissionId = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, permission, p;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.permissionMetadata)
                                .where(drizzle_orm_1.eq(schema_1.permissionMetadata.permissionId, permissionId))];
                    case 2:
                        permission = _b.sent();
                        if (!permission || permission.length === 0)
                            return [2 /*return*/, null];
                        p = permission[0];
                        return [2 /*return*/, {
                                id: p.permissionId,
                                label: p.label,
                                description: p.description,
                                category: p.category,
                                icon: p.icon,
                                isSystem: !!p.isSystem
                            }];
                }
            });
        });
    }),
    /**
     * Search permissions by label or description
     */
    search: readProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var query = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, permissions;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.permissionMetadata)
                                .where(or(drizzle_orm_1.like(schema_1.permissionMetadata.label, "%" + query + "%"), drizzle_orm_1.like(schema_1.permissionMetadata.description, "%" + query + "%")))];
                    case 2:
                        permissions = _b.sent();
                        return [2 /*return*/, permissions.map(function (p) { return ({
                                id: p.permissionId,
                                label: p.label,
                                description: p.description,
                                category: p.category,
                                icon: p.icon,
                                isSystem: !!p.isSystem
                            }); })];
                }
            });
        });
    }),
    /**
     * Get permissions for a role
     */
    getForRole: readProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var roleId = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rolePerms, permIds, permissions;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.rolePermissions)
                                .where(drizzle_orm_1.eq(schema_1.rolePermissions.roleId, roleId))];
                    case 2:
                        rolePerms = _b.sent();
                        permIds = rolePerms.map(function (rp) { return rp.permissionId; }).filter(Boolean);
                        if (permIds.length === 0)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.permissionMetadata)
                                .where(schema_1.permissionMetadata.permissionId.inList ?
                                schema_1.permissionMetadata.permissionId.inList(permIds) : or.apply(void 0, permIds.map(function (id) { return drizzle_orm_1.eq(schema_1.permissionMetadata.permissionId, id); })))];
                    case 3:
                        permissions = _b.sent();
                        return [2 /*return*/, permissions.map(function (p) { return ({
                                id: p.permissionId,
                                label: p.label,
                                description: p.description,
                                category: p.category,
                                icon: p.icon,
                                isSystem: !!p.isSystem
                            }); })];
                }
            });
        });
    }),
    /**
     * Assign permission to role
     */
    assignToRole: writeProcedure
        .input(zod_1.z.object({
        roleId: zod_1.z.string(),
        permissionId: zod_1.z.string()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, existing, permDetail, permLabel;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.rolePermissions)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.rolePermissions.roleId, input.roleId), drizzle_orm_1.eq(schema_1.rolePermissions.permissionId, input.permissionId)))];
                    case 2:
                        existing = _b.sent();
                        if (existing && existing.length > 0) {
                            return [2 /*return*/, { success: false, message: "Permission already assigned" }];
                        }
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.permissionMetadata)
                                .where(drizzle_orm_1.eq(schema_1.permissionMetadata.permissionId, input.permissionId))];
                    case 3:
                        permDetail = _b.sent();
                        // Assign permission
                        return [4 /*yield*/, db.insert(schema_1.rolePermissions).values({
                                id: uuid_1.v4(),
                                roleId: input.roleId,
                                permissionId: input.permissionId,
                                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 4:
                        // Assign permission
                        _b.sent();
                        permLabel = permDetail && permDetail.length > 0 ? permDetail[0].label : input.permissionId;
                        return [4 /*yield*/, db.insert(schema_1.permissionAuditLog).values({
                                id: uuid_1.v4(),
                                roleId: input.roleId,
                                permissionId: input.permissionId,
                                permissionLabel: permLabel,
                                action: "assign",
                                changedBy: ctx.user.id,
                                newValue: "assigned",
                                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, { success: true, message: "Permission assigned successfully" }];
                }
            });
        });
    }),
    /**
     * Remove permission from role
     */
    removeFromRole: writeProcedure
        .input(zod_1.z.object({
        roleId: zod_1.z.string(),
        permissionId: zod_1.z.string()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, permDetail, permLabel;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.permissionMetadata)
                                .where(drizzle_orm_1.eq(schema_1.permissionMetadata.permissionId, input.permissionId))];
                    case 2:
                        permDetail = _b.sent();
                        // Remove permission
                        return [4 /*yield*/, db["delete"](schema_1.rolePermissions)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.rolePermissions.roleId, input.roleId), drizzle_orm_1.eq(schema_1.rolePermissions.permissionId, input.permissionId)))];
                    case 3:
                        // Remove permission
                        _b.sent();
                        permLabel = permDetail && permDetail.length > 0 ? permDetail[0].label : input.permissionId;
                        return [4 /*yield*/, db.insert(schema_1.permissionAuditLog).values({
                                id: uuid_1.v4(),
                                roleId: input.roleId,
                                permissionId: input.permissionId,
                                permissionLabel: permLabel,
                                action: "remove",
                                changedBy: ctx.user.id,
                                oldValue: "assigned",
                                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, { success: true, message: "Permission removed successfully" }];
                }
            });
        });
    }),
    /**
     * Get audit log for permissions
     */
    getAuditLog: readProcedure
        .input(zod_1.z.object({
        roleId: zod_1.z.string().optional(),
        limit: zod_1.z.number()["default"](100),
        offset: zod_1.z.number()["default"](0)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, query, logs;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        query = db.select().from(schema_1.permissionAuditLog);
                        if (input.roleId) {
                            query = query.where(drizzle_orm_1.eq(schema_1.permissionAuditLog.roleId, input.roleId));
                        }
                        return [4 /*yield*/, query.limit(input.limit).offset(input.offset)];
                    case 2:
                        logs = _b.sent();
                        return [2 /*return*/, logs];
                }
            });
        });
    })
});
// Helper function for OR conditions
function or() {
    var conditions = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        conditions[_i] = arguments[_i];
    }
    if (conditions.length === 0)
        return undefined;
    if (conditions.length === 1)
        return conditions[0];
    return conditions.reduce(function (acc, cond) { return (__assign(__assign({}, acc), cond)); });
}
