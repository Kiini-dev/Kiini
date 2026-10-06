"use strict";
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
exports.userManagementRouter = void 0;
var base_js_1 = require("./base.js");
var trpc_js_1 = require("../_core/trpc.js");
var zod_1 = require("zod");
var db_js_1 = require("../db.js");
var drizzle_orm_1 = require("drizzle-orm");
var schema_js_1 = require("../../drizzle/schema.js");
var enhancedRbac_js_1 = require("../middleware/enhancedRbac.js");
var nanoid_1 = require("nanoid");
/**
 * User Management Router
 * Handles user deletion, restoration, and admin functions
 */
exports.userManagementRouter = base_js_1.router({
    /**
     * Delete a user (soft delete) - requires super_admin or ict_manager
     */
    deleteUser: enhancedRbac_js_1.createFeatureRestrictedProcedure("users:delete")
        .input(zod_1.z.object({
        userId: zod_1.z.string(),
        reason: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, userToDelete, deletion, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_js_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database connection failed");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 6, , 7]);
                        return [4 /*yield*/, db.query.users.findFirst({
                                where: drizzle_orm_1.eq(schema_js_1.users.id, input.userId)
                            })];
                    case 3:
                        userToDelete = _b.sent();
                        if (!userToDelete) {
                            throw new Error("User not found");
                        }
                        deletion = {
                            id: nanoid_1.nanoid(16),
                            userId: input.userId,
                            userName: userToDelete.name || "Unknown",
                            userEmail: userToDelete.email || "unknown@example.com",
                            deletedReason: input.reason || "Deleted by admin",
                            deletedBy: ctx.user.id,
                            archived: 1,
                            deletedAt: new Date().toISOString()
                        };
                        // Insert deletion record
                        return [4 /*yield*/, db.insert(schema_js_1.userDeletions).values(deletion)];
                    case 4:
                        // Insert deletion record
                        _b.sent();
                        // Mark user as inactive (soft delete)
                        return [4 /*yield*/, db
                                .update(schema_js_1.users)
                                .set({
                                isActive: 0,
                                lastSignedIn: new Date().toISOString()
                            })
                                .where(drizzle_orm_1.eq(schema_js_1.users.id, input.userId))];
                    case 5:
                        // Mark user as inactive (soft delete)
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: "User " + userToDelete.email + " has been archived",
                                deletionId: deletion.id
                            }];
                    case 6:
                        error_1 = _b.sent();
                        console.error("[User Management] Delete user error:", error_1);
                        throw error_1;
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * List all deleted users
     */
    listDeletedUsers: trpc_js_1.protectedProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number()["default"](50),
        offset: zod_1.z.number()["default"](0)
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, deletedUsers, total, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_js_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database connection failed");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, db.query.userDeletions.findMany({
                                limit: input.limit,
                                offset: input.offset,
                                orderBy: function (ud, _a) {
                                    var desc = _a.desc;
                                    return desc(ud.deletedAt);
                                }
                            })];
                    case 3:
                        deletedUsers = _b.sent();
                        return [4 /*yield*/, db.query.userDeletions.findMany()];
                    case 4:
                        total = _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                data: deletedUsers,
                                pagination: {
                                    total: total.length,
                                    limit: input.limit,
                                    offset: input.offset
                                }
                            }];
                    case 5:
                        error_2 = _b.sent();
                        console.error("[User Management] List deleted users error:", error_2);
                        throw error_2;
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Restore a deleted user
     */
    restoreUser: enhancedRbac_js_1.createFeatureRestrictedProcedure("users:edit")
        .input(zod_1.z.object({ userId: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, deletion, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_js_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database connection failed");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 6, , 7]);
                        return [4 /*yield*/, db.query.userDeletions.findFirst({
                                where: drizzle_orm_1.eq(schema_js_1.userDeletions.userId, input.userId)
                            })];
                    case 3:
                        deletion = _b.sent();
                        if (!deletion) {
                            throw new Error("No deletion record found for this user");
                        }
                        // Update deletion record
                        return [4 /*yield*/, db
                                .update(schema_js_1.userDeletions)
                                .set({
                                archived: 0,
                                restoredAt: new Date().toISOString(),
                                restoredBy: ctx.user.id
                            })
                                .where(drizzle_orm_1.eq(schema_js_1.userDeletions.userId, input.userId))];
                    case 4:
                        // Update deletion record
                        _b.sent();
                        // Reactivate user
                        return [4 /*yield*/, db
                                .update(schema_js_1.users)
                                .set({ isActive: 1 })
                                .where(drizzle_orm_1.eq(schema_js_1.users.id, input.userId))];
                    case 5:
                        // Reactivate user
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: "User has been restored successfully"
                            }];
                    case 6:
                        error_3 = _b.sent();
                        console.error("[User Management] Restore user error:", error_3);
                        throw error_3;
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Permanently delete a user (hard delete - irreversible)
     */
    permanentlyDeleteUser: enhancedRbac_js_1.createFeatureRestrictedProcedure("users:delete")
        .input(zod_1.z.object({
        userId: zod_1.z.string(),
        confirmationPhrase: zod_1.z.literal("PERMANENT_DELETE")
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, userToDelete, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_js_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database connection failed");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        // Safety check - user must confirm
                        if (input.confirmationPhrase !== "PERMANENT_DELETE") {
                            throw new Error("Confirmation phrase incorrect");
                        }
                        return [4 /*yield*/, db.query.users.findFirst({
                                where: drizzle_orm_1.eq(schema_js_1.users.id, input.userId)
                            })];
                    case 3:
                        userToDelete = _b.sent();
                        if (!userToDelete) {
                            throw new Error("User not found");
                        }
                        // Delete from database (irreversible)
                        return [4 /*yield*/, db["delete"](schema_js_1.users).where(drizzle_orm_1.eq(schema_js_1.users.id, input.userId))];
                    case 4:
                        // Delete from database (irreversible)
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: "User " + userToDelete.email + " has been permanently deleted"
                            }];
                    case 5:
                        error_4 = _b.sent();
                        console.error("[User Management] Permanent delete error:", error_4);
                        throw error_4;
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get users with inactive status (candidates for deletion)
     */
    getInactiveUsers: trpc_js_1.protectedProcedure
        .input(zod_1.z.object({
        inactiveDays: zod_1.z.number()["default"](90),
        limit: zod_1.z.number()["default"](100)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, sinceDate, result, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_js_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database connection failed");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        sinceDate = new Date();
                        sinceDate.setDate(sinceDate.getDate() - input.inactiveDays);
                        return [4 /*yield*/, db.query.users.findMany({
                                where: drizzle_orm_1.and(drizzle_orm_1.eq(schema_js_1.users.isActive, 1), db.raw("lastSignedIn < '" + sinceDate.toISOString() + "' OR lastSignedIn IS NULL")),
                                limit: input.limit
                            })];
                    case 3:
                        result = _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                data: result || [],
                                inactiveSince: sinceDate.toISOString()
                            }];
                    case 4:
                        error_5 = _b.sent();
                        console.error("[User Management] Get inactive users error:", error_5);
                        throw error_5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Enable password change requirement on first login
     */
    requirePasswordChange: enhancedRbac_js_1.createFeatureRestrictedProcedure("users:edit")
        .input(zod_1.z.object({ userId: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_js_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database connection failed");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db
                                .update(schema_js_1.users)
                                .set({ requiresPasswordChange: 1 })
                                .where(drizzle_orm_1.eq(schema_js_1.users.id, input.userId))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: "User will be required to change password on next login"
                            }];
                    case 4:
                        error_6 = _b.sent();
                        console.error("[User Management] Require password change error:", error_6);
                        throw error_6;
                    case 5: return [2 /*return*/];
                }
            });
        });
    })
});
