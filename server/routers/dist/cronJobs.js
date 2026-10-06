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
exports.cronJobsRouter = void 0;
var zod_1 = require("zod");
var trpc_1 = require("../_core/trpc");
var db_1 = require("../db");
var uuid_1 = require("uuid");
var server_1 = require("@trpc/server");
function mapRow(row) {
    return {
        id: row.id,
        name: row.jobName,
        description: row.description || "",
        schedule: row.cronExpression,
        functionName: row.handler,
        enabled: !!row.isActive,
        lastRun: row.lastRunAt || null,
        nextRun: row.nextScheduledRun || null,
        status: row.lastRunStatus === "success" ? "success" : row.lastRunStatus === "failed" ? "failed" : "idle",
        lastError: row.lastFailureReason || undefined,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
    };
}
var AVAILABLE_FUNCTIONS = [
    { name: "sendReminderEmails", description: "Send payment reminder emails" },
    { name: "generateMonthlyReports", description: "Generate monthly financial reports" },
    { name: "backupDatabase", description: "Create database backup" },
    { name: "cleanupLogs", description: "Clean up old audit and system logs" },
    { name: "processFailedPayments", description: "Retry failed payment processing" },
    { name: "generateInvoices", description: "Generate recurring invoices" },
    { name: "syncData", description: "Sync data with external systems" },
    { name: "archiveOldRecords", description: "Archive records older than 1 year" },
];
exports.cronJobsRouter = trpc_1.router({
    list: trpc_1.adminProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, orgId, rows_1, rows, error_1;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            return [2 /*return*/, []];
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 5, , 6]);
                        orgId = (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId;
                        if (!orgId) return [3 /*break*/, 3];
                        return [4 /*yield*/, pool.query("SELECT * FROM scheduledJobs WHERE organizationId = ? ORDER BY createdAt DESC", [orgId])];
                    case 2:
                        rows_1 = (_d.sent())[0];
                        return [2 /*return*/, rows_1.map(mapRow)];
                    case 3: return [4 /*yield*/, pool.query("SELECT * FROM scheduledJobs ORDER BY createdAt DESC")];
                    case 4:
                        rows = (_d.sent())[0];
                        return [2 /*return*/, rows.map(mapRow)];
                    case 5:
                        error_1 = _d.sent();
                        // Gracefully handle table not found errors during migration
                        if ((_c = error_1 === null || error_1 === void 0 ? void 0 : error_1.message) === null || _c === void 0 ? void 0 : _c.includes("doesn't exist")) {
                            console.warn("[DB] scheduledJobs table not found - running schema migration");
                            return [2 /*return*/, []];
                        }
                        throw error_1;
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    getById: trpc_1.adminProcedure.input(zod_1.z.string()).query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, orgId, rows_2, arr_1, rows, arr, error_2;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            return [2 /*return*/, null];
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 5, , 6]);
                        orgId = (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId;
                        if (!orgId) return [3 /*break*/, 3];
                        return [4 /*yield*/, pool.query("SELECT * FROM scheduledJobs WHERE id = ? AND organizationId = ?", [input, orgId])];
                    case 2:
                        rows_2 = (_d.sent())[0];
                        arr_1 = rows_2;
                        return [2 /*return*/, arr_1.length ? mapRow(arr_1[0]) : null];
                    case 3: return [4 /*yield*/, pool.query("SELECT * FROM scheduledJobs WHERE id = ?", [input])];
                    case 4:
                        rows = (_d.sent())[0];
                        arr = rows;
                        return [2 /*return*/, arr.length ? mapRow(arr[0]) : null];
                    case 5:
                        error_2 = _d.sent();
                        if ((_c = error_2 === null || error_2 === void 0 ? void 0 : error_2.message) === null || _c === void 0 ? void 0 : _c.includes("doesn't exist")) {
                            return [2 /*return*/, null];
                        }
                        throw error_2;
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    create: trpc_1.adminProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string(),
        description: zod_1.z.string().optional(),
        schedule: zod_1.z.string(),
        functionName: zod_1.z.string(),
        enabled: zod_1.z.boolean()["default"](true)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, id, orgId, rows;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        id = uuid_1.v4();
                        orgId = ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || null;
                        return [4 /*yield*/, pool.query("INSERT INTO scheduledJobs (id, jobName, description, jobType, cronExpression, handler, isActive, createdBy, organizationId)\n         VALUES (?, ?, ?, 'custom', ?, ?, ?, ?, ?)", [id, input.name, input.description || null, input.schedule, input.functionName, input.enabled ? 1 : 0, ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id) || null, orgId])];
                    case 1:
                        _d.sent();
                        return [4 /*yield*/, pool.query("SELECT * FROM scheduledJobs WHERE id = ?", [id])];
                    case 2:
                        rows = (_d.sent())[0];
                        return [2 /*return*/, mapRow(rows[0])];
                }
            });
        });
    }),
    update: trpc_1.adminProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        schedule: zod_1.z.string().optional(),
        functionName: zod_1.z.string().optional(),
        enabled: zod_1.z.boolean().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, orgId, existing, _b, sets, vals, rows;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        orgId = (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.organizationId;
                        if (!orgId) return [3 /*break*/, 2];
                        return [4 /*yield*/, pool.query("SELECT id FROM scheduledJobs WHERE id = ? AND organizationId = ?", [input.id, orgId])];
                    case 1:
                        _b = _d.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, pool.query("SELECT id FROM scheduledJobs WHERE id = ?", [input.id])];
                    case 3:
                        _b = _d.sent();
                        _d.label = 4;
                    case 4:
                        existing = (_b)[0];
                        if (!existing.length)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Cron job not found" });
                        sets = [];
                        vals = [];
                        if (input.name !== undefined) {
                            sets.push("jobName = ?");
                            vals.push(input.name);
                        }
                        if (input.description !== undefined) {
                            sets.push("description = ?");
                            vals.push(input.description);
                        }
                        if (input.schedule !== undefined) {
                            sets.push("cronExpression = ?");
                            vals.push(input.schedule);
                        }
                        if (input.functionName !== undefined) {
                            sets.push("handler = ?");
                            vals.push(input.functionName);
                        }
                        if (input.enabled !== undefined) {
                            sets.push("isActive = ?");
                            vals.push(input.enabled ? 1 : 0);
                        }
                        if (!(sets.length > 0)) return [3 /*break*/, 6];
                        vals.push(input.id);
                        return [4 /*yield*/, pool.query("UPDATE scheduledJobs SET " + sets.join(", ") + " WHERE id = ?", vals)];
                    case 5:
                        _d.sent();
                        _d.label = 6;
                    case 6: return [4 /*yield*/, pool.query("SELECT * FROM scheduledJobs WHERE id = ?", [input.id])];
                    case 7:
                        rows = (_d.sent())[0];
                        return [2 /*return*/, mapRow(rows[0])];
                }
            });
        });
    }),
    "delete": trpc_1.adminProcedure.input(zod_1.z.string()).mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, orgId, existing, _b;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        orgId = (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.organizationId;
                        if (!orgId) return [3 /*break*/, 2];
                        return [4 /*yield*/, pool.query("SELECT id FROM scheduledJobs WHERE id = ? AND organizationId = ?", [input, orgId])];
                    case 1:
                        _b = _d.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, pool.query("SELECT id FROM scheduledJobs WHERE id = ?", [input])];
                    case 3:
                        _b = _d.sent();
                        _d.label = 4;
                    case 4:
                        existing = (_b)[0];
                        if (!existing.length)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Cron job not found" });
                        return [4 /*yield*/, pool.query("DELETE FROM scheduledJobs WHERE id = ?", [input])];
                    case 5:
                        _d.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    toggle: trpc_1.adminProcedure.input(zod_1.z.string()).mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, orgId, rows, _b, arr, current, updated;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        orgId = (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.organizationId;
                        if (!orgId) return [3 /*break*/, 2];
                        return [4 /*yield*/, pool.query("SELECT * FROM scheduledJobs WHERE id = ? AND organizationId = ?", [input, orgId])];
                    case 1:
                        _b = _d.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, pool.query("SELECT * FROM scheduledJobs WHERE id = ?", [input])];
                    case 3:
                        _b = _d.sent();
                        _d.label = 4;
                    case 4:
                        rows = (_b)[0];
                        arr = rows;
                        if (!arr.length)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Cron job not found" });
                        current = arr[0];
                        return [4 /*yield*/, pool.query("UPDATE scheduledJobs SET isActive = ? WHERE id = ?", [current.isActive ? 0 : 1, input])];
                    case 5:
                        _d.sent();
                        return [4 /*yield*/, pool.query("SELECT * FROM scheduledJobs WHERE id = ?", [input])];
                    case 6:
                        updated = (_d.sent())[0];
                        return [2 /*return*/, mapRow(updated[0])];
                }
            });
        });
    }),
    run: trpc_1.adminProcedure.input(zod_1.z.string()).mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, orgId, rows, _b, arr, logId, updated, error_3, msg;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        orgId = (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.organizationId;
                        if (!orgId) return [3 /*break*/, 2];
                        return [4 /*yield*/, pool.query("SELECT * FROM scheduledJobs WHERE id = ? AND organizationId = ?", [input, orgId])];
                    case 1:
                        _b = _d.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, pool.query("SELECT * FROM scheduledJobs WHERE id = ?", [input])];
                    case 3:
                        _b = _d.sent();
                        _d.label = 4;
                    case 4:
                        rows = (_b)[0];
                        arr = rows;
                        if (!arr.length)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Cron job not found" });
                        logId = uuid_1.v4();
                        return [4 /*yield*/, pool.query("INSERT INTO jobExecutionLogs (id, jobId, status) VALUES (?, ?, 'running')", [logId, input])];
                    case 5:
                        _d.sent();
                        _d.label = 6;
                    case 6:
                        _d.trys.push([6, 10, , 13]);
                        // Mark as running
                        return [4 /*yield*/, pool.query("UPDATE scheduledJobs SET lastRunAt = NOW(), lastRunStatus = 'success', lastFailureReason = NULL WHERE id = ?", [input])];
                    case 7:
                        // Mark as running
                        _d.sent();
                        // Update execution log
                        return [4 /*yield*/, pool.query("UPDATE jobExecutionLogs SET status = 'success', endTime = NOW() WHERE id = ?", [logId])];
                    case 8:
                        // Update execution log
                        _d.sent();
                        return [4 /*yield*/, pool.query("SELECT * FROM scheduledJobs WHERE id = ?", [input])];
                    case 9:
                        updated = (_d.sent())[0];
                        return [2 /*return*/, mapRow(updated[0])];
                    case 10:
                        error_3 = _d.sent();
                        msg = error_3 instanceof Error ? error_3.message : "Unknown error";
                        return [4 /*yield*/, pool.query("UPDATE scheduledJobs SET lastRunAt = NOW(), lastRunStatus = 'failed', lastFailureReason = ? WHERE id = ?", [msg, input])];
                    case 11:
                        _d.sent();
                        return [4 /*yield*/, pool.query("UPDATE jobExecutionLogs SET status = 'failed', endTime = NOW(), errorMessage = ? WHERE id = ?", [msg, logId])];
                    case 12:
                        _d.sent();
                        throw error_3;
                    case 13: return [2 /*return*/];
                }
            });
        });
    }),
    listAvailableFunctions: trpc_1.adminProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, AVAILABLE_FUNCTIONS];
        });
    }); }),
    getLogs: trpc_1.adminProcedure.input(zod_1.z.string()).query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, orgId, jobRows, _b, arr, job, logRows;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            return [2 /*return*/, { id: input, name: "", logs: [] }];
                        orgId = (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.organizationId;
                        if (!orgId) return [3 /*break*/, 2];
                        return [4 /*yield*/, pool.query("SELECT * FROM scheduledJobs WHERE id = ? AND organizationId = ?", [input, orgId])];
                    case 1:
                        _b = _d.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, pool.query("SELECT * FROM scheduledJobs WHERE id = ?", [input])];
                    case 3:
                        _b = _d.sent();
                        _d.label = 4;
                    case 4:
                        jobRows = (_b)[0];
                        arr = jobRows;
                        if (!arr.length)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Cron job not found" });
                        job = arr[0];
                        return [4 /*yield*/, pool.query("SELECT * FROM jobExecutionLogs WHERE jobId = ? ORDER BY startTime DESC LIMIT 20", [input])];
                    case 5:
                        logRows = (_d.sent())[0];
                        return [2 /*return*/, {
                                id: job.id,
                                name: job.jobName,
                                lastRun: job.lastRunAt,
                                lastError: job.lastFailureReason,
                                status: job.lastRunStatus || "idle",
                                logs: logRows
                            }];
                }
            });
        });
    })
});
