"use strict";
/**
 * Comprehensive Backup & Restore Router
 * Provides full database backup, selective backup, and restore functionality
 */
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
exports.__esModule = true;
exports.backupRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var server_1 = require("@trpc/server");
var backupService_1 = require("../services/backupService");
var db_1 = require("../db");
var schema = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var backupProcedure = trpc_1.createFeatureRestrictedProcedure("system:backup");
var restoreProcedure = trpc_1.createFeatureRestrictedProcedure("system:restore");
exports.backupRouter = trpc_1.router({
    /**
     * Create a full database backup
     */
    createFullBackup: backupProcedure
        .mutation(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var options, result, db, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        options = {
                            scope: 'full',
                            includeSensitive: false,
                            compress: true,
                            format: 'json'
                        };
                        return [4 /*yield*/, backupService_1.createBackup(ctx.user.id, options)];
                    case 1:
                        result = _b.sent();
                        return [4 /*yield*/, db_1.getDb()];
                    case 2:
                        db = _b.sent();
                        if (!db) return [3 /*break*/, 4];
                        return [4 /*yield*/, db.insert(schema.backupHistory).values({
                                id: result.id,
                                name: "Full Backup " + new Date().toLocaleDateString(),
                                backupType: 'full',
                                scope: 'full',
                                recordCount: result.recordCount,
                                sizeBytes: result.size,
                                fileName: result.filename,
                                status: 'completed',
                                createdBy: ctx.user.id,
                                completedAt: new Date().toISOString()
                            })];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4: return [2 /*return*/, {
                            success: true,
                            backup: result,
                            message: "Backup created successfully with " + result.recordCount + " records from " + result.tableCount + " tables"
                        }];
                    case 5:
                        error_1 = _b.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Backup failed: " + error_1.message
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Create a selective backup of specific tables
     */
    createSelectiveBackup: backupProcedure
        .input(zod_1.z.object({
        tables: zod_1.z.array(zod_1.z.string()).min(1, "At least one table must be selected"),
        includeSensitive: zod_1.z.boolean()["default"](false),
        format: zod_1.z["enum"](['json', 'sql'])["default"]('json')
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var options, result, db, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        options = {
                            scope: 'selective',
                            tables: input.tables,
                            includeSensitive: input.includeSensitive,
                            compress: true,
                            format: input.format
                        };
                        return [4 /*yield*/, backupService_1.createBackup(ctx.user.id, options)];
                    case 1:
                        result = _b.sent();
                        return [4 /*yield*/, db_1.getDb()];
                    case 2:
                        db = _b.sent();
                        if (!db) return [3 /*break*/, 4];
                        return [4 /*yield*/, db.insert(schema.backupHistory).values({
                                id: result.id,
                                name: "Selective Backup " + new Date().toLocaleDateString(),
                                backupType: 'partial',
                                scope: 'selective',
                                scopeEntityId: input.tables.join(','),
                                recordCount: result.recordCount,
                                sizeBytes: result.size,
                                fileName: result.filename,
                                status: 'completed',
                                createdBy: ctx.user.id,
                                completedAt: new Date().toISOString()
                            })];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4: return [2 /*return*/, {
                            success: true,
                            backup: result,
                            message: "Selective backup created successfully with " + result.recordCount + " records from " + result.tableCount + " tables"
                        }];
                    case 5:
                        error_2 = _b.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Backup failed: " + error_2.message
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Restore database from backup data
     */
    restoreFromBackup: restoreProcedure
        .input(zod_1.z.object({
        backupData: zod_1.z.string().min(1, "Backup data is required"),
        mode: zod_1.z["enum"](['merge', 'replace'])["default"]('merge'),
        skipExisting: zod_1.z.boolean()["default"](true),
        validateOnly: zod_1.z.boolean()["default"](false),
        tableWhitelist: zod_1.z.array(zod_1.z.string()).optional(),
        tableBlacklist: zod_1.z.array(zod_1.z.string()).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var backupData, options, result, db, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        backupData = void 0;
                        try {
                            backupData = JSON.parse(input.backupData);
                        }
                        catch (e) {
                            throw new server_1.TRPCError({ code: "BAD_REQUEST", message: "Invalid backup file format" });
                        }
                        // Validate backup structure
                        if (!backupData.metadata || !backupData.data) {
                            throw new server_1.TRPCError({ code: "BAD_REQUEST", message: "Backup file is missing required fields" });
                        }
                        options = {
                            mode: input.mode,
                            skipExisting: input.skipExisting,
                            validateOnly: input.validateOnly,
                            tableWhitelist: input.tableWhitelist,
                            tableBlacklist: input.tableBlacklist
                        };
                        return [4 /*yield*/, backupService_1.restoreBackup(backupData, ctx.user.id, options)];
                    case 1:
                        result = _b.sent();
                        return [4 /*yield*/, db_1.getDb()];
                    case 2:
                        db = _b.sent();
                        if (!(db && !input.validateOnly)) return [3 /*break*/, 4];
                        return [4 /*yield*/, db.insert(schema.backupHistory).values({
                                id: uuid_1.v4(),
                                name: "Restore " + new Date().toLocaleDateString(),
                                backupType: 'restore',
                                scope: 'full',
                                recordCount: result.restored,
                                status: result.errors.length > 0 ? 'completed_with_errors' : 'completed',
                                errorMessage: result.errors.length > 0 ? "Errors: " + result.errors.length : undefined,
                                createdBy: ctx.user.id,
                                completedAt: new Date().toISOString()
                            })];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4: return [2 /*return*/, {
                            success: true,
                            result: result,
                            message: input.validateOnly
                                ? "Validation completed: " + result.imported + " records would be imported"
                                : "Restore completed: " + result.restored + " records imported, " + result.skipped + " skipped, " + result.errors.length + " errors"
                        }];
                    case 5:
                        error_3 = _b.sent();
                        if (error_3 instanceof server_1.TRPCError)
                            throw error_3;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Restore failed: " + error_3.message
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get backup history
     */
    getBackupHistory: trpc_1.protectedProcedure
        .query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var isAdmin, history;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        isAdmin = ctx.user.role === 'admin' || ctx.user.role === 'super_admin';
                        if (!isAdmin) {
                            throw new server_1.TRPCError({ code: "FORBIDDEN", message: "Only administrators can view backup history" });
                        }
                        return [4 /*yield*/, backupService_1.getBackupHistory()];
                    case 1:
                        history = _b.sent();
                        return [2 /*return*/, history];
                }
            });
        });
    }),
    /**
     * Schedule automated backups
     */
    scheduleBackup: backupProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string().min(1, "Backup name is required"),
        schedule: zod_1.z.string().min(1, "Schedule is required"),
        tables: zod_1.z.array(zod_1.z.string()).optional(),
        includeSensitive: zod_1.z.boolean()["default"](false)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var options, scheduleId, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        options = {
                            scope: input.tables && input.tables.length > 0 ? 'selective' : 'full',
                            tables: input.tables,
                            includeSensitive: input.includeSensitive,
                            compress: true,
                            format: 'json'
                        };
                        return [4 /*yield*/, backupService_1.scheduleBackup(ctx.user.id, input.name, input.schedule, options)];
                    case 1:
                        scheduleId = _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                scheduleId: scheduleId,
                                message: "Backup schedule created successfully"
                            }];
                    case 2:
                        error_4 = _b.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to schedule backup: " + error_4.message
                        });
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get available tables for backup
     */
    getAvailableTables: trpc_1.protectedProcedure
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, backupService_1.getAvailableTables()];
        });
    }); }),
    /**
     * Get backup schedules
     */
    getBackupSchedules: trpc_1.protectedProcedure
        .query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var isAdmin, db, schedules, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        isAdmin = ctx.user.role === 'admin' || ctx.user.role === 'super_admin';
                        if (!isAdmin) {
                            throw new server_1.TRPCError({ code: "FORBIDDEN", message: "Only administrators can view backup schedules" });
                        }
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db
                                .select()
                                .from(schema.backupSchedules)
                                .orderBy(schema.backupSchedules.createdAt)];
                    case 3:
                        schedules = _b.sent();
                        return [2 /*return*/, schedules];
                    case 4:
                        error_5 = _b.sent();
                        console.error('Failed to get backup schedules:', error_5);
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Delete a backup schedule
     */
    deleteBackupSchedule: backupProcedure
        .input(zod_1.z.object({
        scheduleId: zod_1.z.string().min(1, "Schedule ID is required")
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db) {
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
                        }
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db["delete"](schema.backupSchedules)
                                .where(drizzle_orm_1.eq(schema.backupSchedules.id, input.scheduleId))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: "Backup schedule deleted successfully"
                            }];
                    case 4:
                        error_6 = _b.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to delete backup schedule: " + error_6.message
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get backup statistics
     */
    getBackupStats: trpc_1.protectedProcedure
        .query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var isAdmin, db, totalBackups, successfulBackups, sizeResult, totalSize, recentBackups, error_7;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        isAdmin = ctx.user.role === 'admin' || ctx.user.role === 'super_admin';
                        if (!isAdmin) {
                            throw new server_1.TRPCError({ code: "FORBIDDEN", message: "Only administrators can view backup statistics" });
                        }
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 7, , 8]);
                        return [4 /*yield*/, db.$count(schema.backupHistory)];
                    case 3:
                        totalBackups = _c.sent();
                        return [4 /*yield*/, db.$count(schema.backupHistory, drizzle_orm_1.eq(schema.backupHistory.status, 'completed'))];
                    case 4:
                        successfulBackups = _c.sent();
                        return [4 /*yield*/, db
                                .select({ totalSize: sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["SUM(", ")"], ["SUM(", ")"])), schema.backupHistory.sizeBytes) })
                                .from(schema.backupHistory)
                                .where(drizzle_orm_1.eq(schema.backupHistory.status, 'completed'))];
                    case 5:
                        sizeResult = _c.sent();
                        totalSize = ((_b = sizeResult[0]) === null || _b === void 0 ? void 0 : _b.totalSize) || 0;
                        return [4 /*yield*/, db
                                .select()
                                .from(schema.backupHistory)
                                .orderBy(sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["", " DESC"], ["", " DESC"])), schema.backupHistory.createdAt))
                                .limit(5)];
                    case 6:
                        recentBackups = _c.sent();
                        return [2 /*return*/, {
                                totalBackups: totalBackups,
                                successfulBackups: successfulBackups,
                                failedBackups: totalBackups - successfulBackups,
                                totalSize: totalSize,
                                recentBackups: recentBackups
                            }];
                    case 7:
                        error_7 = _c.sent();
                        console.error('Failed to get backup stats:', error_7);
                        return [2 /*return*/, null];
                    case 8: return [2 /*return*/];
                }
            });
        });
    })
});
/content>
    < parameter;
name = "filePath" > e;
Kiini;
server;
routers;
backup.ts;
var templateObject_1, templateObject_2;
