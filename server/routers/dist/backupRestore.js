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
exports.backupRestoreRouter = void 0;
/**
 * Full System Backup & Restore Router
 * Exports/imports ALL data: settings, line items, users, everything.
 */
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var server_1 = require("@trpc/server");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema = require("../../drizzle/schema");
var schemaExtended = require("../../drizzle/schema-extended");
var uuid_1 = require("uuid");
var drizzle_orm_1 = require("drizzle-orm");
var adminProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("system:backup");
/** Tables included in a full backup (order matters for restore FK constraints) */
var BACKUP_TABLES = [
    { name: "settings", table: schema.settings },
    { name: "systemSettings", table: schema.systemSettings },
    { name: "defaultSettings", table: schema.defaultSettings },
    { name: "documentNumberFormats", table: schema.documentNumberFormats },
    { name: "userRoles", table: schema.userRoles },
    { name: "rolePermissions", table: schema.rolePermissions },
    { name: "userPermissions", table: schema.userPermissions },
    { name: "clients", table: schema.clients },
    { name: "products", table: schema.products },
    { name: "services", table: schema.services },
    { name: "departments", table: schema.departments },
    { name: "jobGroups", table: schema.jobGroups },
    { name: "employees", table: schema.employees },
    { name: "invoices", table: schema.invoices },
    { name: "invoiceItems", table: schema.invoiceItems },
    { name: "estimates", table: schema.estimates },
    { name: "estimateItems", table: schema.estimateItems },
    { name: "receipts", table: schema.receipts },
    { name: "payments", table: schema.payments },
    { name: "expenses", table: schema.expenses },
    { name: "budgets", table: schema.budgets },
    { name: "projects", table: schema.projects },
    { name: "projectTasks", table: schema.projectTasks },
    { name: "projectMilestones", table: schema.projectMilestones },
    { name: "timeEntries", table: schema.timeEntries },
    { name: "opportunities", table: schema.opportunities },
    { name: "payroll", table: schema.payroll },
    { name: "attendance", table: schema.attendance },
    { name: "leaveRequests", table: schema.leaveRequests },
    { name: "deliveryNotes", table: schema.deliveryNotes },
    { name: "deliveryNoteLineItems", table: schemaExtended.deliveryNoteLineItems },
    { name: "grnRecords", table: schema.grnRecords },
    { name: "grnLineItems", table: schemaExtended.grnLineItems },
    { name: "lpos", table: schemaExtended.lpos },
    { name: "lpoLineItems", table: schemaExtended.lpoLineItems },
    { name: "tickets", table: schema.tickets },
    { name: "ticketResponses", table: schema.ticketResponses },
    { name: "activityLog", table: schema.activityLog },
    { name: "auditLogs", table: schema.auditLogs },
];
exports.backupRestoreRouter = trpc_1.router({
    /** Create a full JSON backup of all system data */
    createBackup: adminProcedure
        .input(zod_1.z.object({
        includeActivityLogs: zod_1.z.boolean()["default"](false),
        label: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, backup, errors, _i, BACKUP_TABLES_1, _b, name, table, _c, _d, e_1, metadata, totalRecords, backupSize;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _e.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
                        backup = {};
                        errors = [];
                        _i = 0, BACKUP_TABLES_1 = BACKUP_TABLES;
                        _e.label = 2;
                    case 2:
                        if (!(_i < BACKUP_TABLES_1.length)) return [3 /*break*/, 7];
                        _b = BACKUP_TABLES_1[_i], name = _b.name, table = _b.table;
                        if (!input.includeActivityLogs && (name === "activityLog" || name === "auditLogs"))
                            return [3 /*break*/, 6];
                        _e.label = 3;
                    case 3:
                        _e.trys.push([3, 5, , 6]);
                        _c = backup;
                        _d = name;
                        return [4 /*yield*/, db.select().from(table)];
                    case 4:
                        _c[_d] = _e.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        e_1 = _e.sent();
                        errors.push(name + ": " + e_1.message);
                        backup[name] = [];
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7:
                        metadata = {
                            version: "2.0",
                            createdAt: new Date().toISOString(),
                            createdBy: ctx.user.id,
                            label: input.label || "backup_" + new Date().toISOString().split("T")[0],
                            tableCount: BACKUP_TABLES.length,
                            errors: errors,
                            recordCounts: Object.fromEntries(Object.entries(backup).map(function (_a) {
                                var k = _a[0], v = _a[1];
                                return [k, v.length];
                            }))
                        };
                        totalRecords = Object.values(backup).reduce(function (sum, arr) { return sum + arr.length; }, 0);
                        backupSize = JSON.stringify({ metadata: metadata, data: backup }).length;
                        return [4 /*yield*/, db.insert(schema.backupHistory).values({
                                id: uuid_1.v4(),
                                name: metadata.label,
                                backupType: "full",
                                scope: "full",
                                status: "completed",
                                tablesList: JSON.stringify(Object.keys(backup)),
                                recordCount: totalRecords,
                                sizeBytes: backupSize,
                                fileName: metadata.label + ".json",
                                createdBy: ctx.user.id,
                                completedAt: new Date().toISOString()
                            })];
                    case 8:
                        _e.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "backup_created",
                                entityType: "system",
                                entityId: "backup",
                                description: "System backup created: " + totalRecords + " records from " + Object.keys(backup).length + " tables"
                            })];
                    case 9:
                        // Log activity
                        _e.sent();
                        return [2 /*return*/, { metadata: metadata, data: backup }];
                }
            });
        });
    }),
    /** Restore from a full JSON backup */
    restoreBackup: adminProcedure
        .input(zod_1.z.object({
        backup: zod_1.z.object({
            metadata: zod_1.z.object({ version: zod_1.z.string() }),
            data: zod_1.z.record(zod_1.z.string(), zod_1.z.any())
        }),
        dryRun: zod_1.z.boolean()["default"](true),
        tables: zod_1.z.array(zod_1.z.string()).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, normaliseRows, results, requestedTables, _i, BACKUP_TABLES_2, _b, name, table, rows, tableErrors, inserted, chunkSize, i, chunk, _c, _d, chunk_1, row, _e, totalRestored, tablesRestored;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _f.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
                        normaliseRows = function (v) {
                            if (Array.isArray(v))
                                return v;
                            if (typeof v === 'string') {
                                try {
                                    var p = JSON.parse(v);
                                    return Array.isArray(p) ? p : [];
                                }
                                catch (_a) {
                                    return [];
                                }
                            }
                            return [];
                        };
                        if (input.dryRun) {
                            return [2 /*return*/, {
                                    dryRun: true,
                                    message: "Dry run complete — no data modified",
                                    tablesFound: Object.keys(input.backup.data),
                                    recordCounts: Object.fromEntries(Object.entries(input.backup.data).map(function (_a) {
                                        var k = _a[0], v = _a[1];
                                        return [k, normaliseRows(v).length];
                                    }))
                                }];
                        }
                        results = {};
                        requestedTables = input.tables || BACKUP_TABLES.map(function (t) { return t.name; });
                        _i = 0, BACKUP_TABLES_2 = BACKUP_TABLES;
                        _f.label = 2;
                    case 2:
                        if (!(_i < BACKUP_TABLES_2.length)) return [3 /*break*/, 16];
                        _b = BACKUP_TABLES_2[_i], name = _b.name, table = _b.table;
                        if (!requestedTables.includes(name))
                            return [3 /*break*/, 15];
                        rows = normaliseRows(input.backup.data[name]);
                        if (!rows || rows.length === 0) {
                            results[name] = { inserted: 0, errors: [] };
                            return [3 /*break*/, 15];
                        }
                        tableErrors = [];
                        inserted = 0;
                        chunkSize = 50;
                        i = 0;
                        _f.label = 3;
                    case 3:
                        if (!(i < rows.length)) return [3 /*break*/, 14];
                        chunk = rows.slice(i, i + chunkSize);
                        _f.label = 4;
                    case 4:
                        _f.trys.push([4, 6, , 13]);
                        // Fast path: insert entire chunk
                        return [4 /*yield*/, db.insert(table).values(chunk)];
                    case 5:
                        // Fast path: insert entire chunk
                        _f.sent();
                        inserted += chunk.length;
                        return [3 /*break*/, 13];
                    case 6:
                        _c = _f.sent();
                        _d = 0, chunk_1 = chunk;
                        _f.label = 7;
                    case 7:
                        if (!(_d < chunk_1.length)) return [3 /*break*/, 12];
                        row = chunk_1[_d];
                        _f.label = 8;
                    case 8:
                        _f.trys.push([8, 10, , 11]);
                        return [4 /*yield*/, db.insert(table).values([row])];
                    case 9:
                        _f.sent();
                        inserted++;
                        return [3 /*break*/, 11];
                    case 10:
                        _e = _f.sent();
                        return [3 /*break*/, 11];
                    case 11:
                        _d++;
                        return [3 /*break*/, 7];
                    case 12: return [3 /*break*/, 13];
                    case 13:
                        i += chunkSize;
                        return [3 /*break*/, 3];
                    case 14:
                        results[name] = { inserted: inserted, errors: tableErrors };
                        _f.label = 15;
                    case 15:
                        _i++;
                        return [3 /*break*/, 2];
                    case 16:
                        totalRestored = Object.values(results).reduce(function (sum, r) { return sum + r.inserted; }, 0);
                        tablesRestored = Object.keys(results).length;
                        return [4 /*yield*/, db.insert(schema.backupHistory).values({
                                id: uuid_1.v4(),
                                name: "Restore from " + input.backup.metadata.label,
                                backupType: "restore",
                                scope: "full",
                                status: "completed",
                                tablesList: JSON.stringify(Object.keys(results)),
                                recordCount: totalRestored,
                                sizeBytes: 0,
                                createdBy: ctx.user.id,
                                completedAt: new Date().toISOString()
                            })];
                    case 17:
                        _f.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "backup_restored",
                                entityType: "system",
                                entityId: "backup",
                                description: "System backup restored: " + totalRestored + " records to " + tablesRestored + " tables"
                            })];
                    case 18:
                        // Log activity
                        _f.sent();
                        return [2 /*return*/, { dryRun: false, results: results, restoredAt: new Date().toISOString() }];
                }
            });
        });
    }),
    /** List backup history */
    listBackups: adminProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, rows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db.select().from(schema.backupHistory).orderBy(drizzle_orm_1.desc(schema.backupHistory.completedAt))];
                case 2:
                    rows = _a.sent();
                    return [2 /*return*/, rows.map(function (row) { return ({
                            id: row.id,
                            name: row.name,
                            backupType: row.backupType,
                            scope: row.scope,
                            status: row.status,
                            recordCount: row.recordCount,
                            sizeBytes: row.sizeBytes,
                            createdAt: row.createdAt,
                            completedAt: row.completedAt,
                            createdBy: row.createdBy,
                            tables: row.tablesList ? JSON.parse(row.tablesList) : []
                        }); })];
            }
        });
    }); }),
    /** Delete a backup from history */
    deleteBackup: adminProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
                        return [4 /*yield*/, db["delete"](schema.backupHistory).where(drizzle_orm_1.eq(schema.backupHistory.id, input))];
                    case 2:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "backup_deleted",
                                entityType: "backupHistory",
                                entityId: input,
                                description: "Backup history entry deleted: " + input
                            })];
                    case 3:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    /** List backup schedules */
    listBackupSchedules: adminProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, rows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db.select().from(schema.backupSchedules).orderBy(drizzle_orm_1.desc(schema.backupSchedules.createdAt))];
                case 2:
                    rows = _a.sent();
                    return [2 /*return*/, rows];
            }
        });
    }); }),
    /** Create a backup schedule */
    createBackupSchedule: adminProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string().min(1),
        backupType: zod_1.z["enum"](["FULL", "INCREMENTAL"])["default"]("FULL"),
        schedule: zod_1.z.string().min(1),
        retentionDays: zod_1.z.number().min(1)["default"](30)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
                        id = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema.backupSchedules).values({
                                id: id,
                                name: input.name,
                                backupType: input.backupType,
                                schedule: input.schedule,
                                retentionDays: input.retentionDays,
                                status: "SCHEDULED",
                                createdBy: ctx.user.id
                            })];
                    case 2:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "backup_schedule_created",
                                entityType: "backupSchedule",
                                entityId: id,
                                description: "Backup schedule created: " + input.name
                            })];
                    case 3:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, { id: id }];
                }
            });
        });
    }),
    /** Update a backup schedule */
    updateBackupSchedule: adminProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string().optional(),
        backupType: zod_1.z["enum"](["FULL", "INCREMENTAL"]).optional(),
        schedule: zod_1.z.string().optional(),
        retentionDays: zod_1.z.number().min(1).optional(),
        status: zod_1.z["enum"](["SCHEDULED", "PAUSED", "DISABLED"]).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, updateData;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
                        updateData = {};
                        if (input.name !== undefined)
                            updateData.name = input.name;
                        if (input.backupType !== undefined)
                            updateData.backupType = input.backupType;
                        if (input.schedule !== undefined)
                            updateData.schedule = input.schedule;
                        if (input.retentionDays !== undefined)
                            updateData.retentionDays = input.retentionDays;
                        if (input.status !== undefined)
                            updateData.status = input.status;
                        if (Object.keys(updateData).length === 0) {
                            throw new server_1.TRPCError({ code: "BAD_REQUEST", message: "No fields to update" });
                        }
                        return [4 /*yield*/, db.update(schema.backupSchedules).set(updateData).where(drizzle_orm_1.eq(schema.backupSchedules.id, input.id))];
                    case 2:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "backup_schedule_updated",
                                entityType: "backupSchedule",
                                entityId: input.id,
                                description: "Backup schedule updated: " + input.id
                            })];
                    case 3:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    /** Delete a backup schedule */
    deleteBackupSchedule: adminProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
                        return [4 /*yield*/, db["delete"](schema.backupSchedules).where(drizzle_orm_1.eq(schema.backupSchedules.id, input))];
                    case 2:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "backup_schedule_deleted",
                                entityType: "backupSchedule",
                                entityId: input,
                                description: "Backup schedule deleted: " + input
                            })];
                    case 3:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    })
});
