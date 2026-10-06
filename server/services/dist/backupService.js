"use strict";
/**
 * Comprehensive Backup & Restore Service
 * Handles full database backups, selective table backups, and restoration
 */
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
exports.getAvailableTables = exports.scheduleBackup = exports.getBackupHistory = exports.restoreBackup = exports.createBackup = void 0;
var db_1 = require("../db");
var server_1 = require("@trpc/server");
var schema = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
// Get all table schemas dynamically
var getAllTables = function () {
    var tables = [];
    // Iterate through all exports from schema
    Object.entries(schema).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        if (value && typeof value === 'object' && 'tableName' in value) {
            tables.push({
                name: value.tableName || key.toLowerCase(),
                schema: value
            });
        }
    });
    return tables;
};
// Tables that should not be backed up (sensitive/system data)
var EXCLUDED_TABLES = new Set([
    'backup_history',
    'backup_schedules',
    'user_sessions',
    'active_sessions',
    'system_logs',
    'security_events',
    'security_incidents',
    'api_keys',
    'webhooks',
]);
// Tables that should be handled carefully during restore
var SENSITIVE_TABLES = new Set([
    'users',
    'user_permissions',
    'role_permissions',
    'custom_roles',
    'user_roles',
    'permissions',
    'permission_metadata',
    'permission_audit_log',
    'audit_logs',
    'activity_log',
    'system_logs',
    'security_events',
    'security_incidents',
]);
/**
 * Create a comprehensive database backup
 */
function createBackup(userId, options) {
    if (options === void 0) { options = {}; }
    return __awaiter(this, void 0, Promise, function () {
        var db, _a, scope, _b, requestedTables, _c, includeSensitive, _d, compress, _e, format, backupId, timestamp, dateStr, allTables, tablesToBackup, backupData, totalRecords, _i, tablesToBackup_1, table, records, error_1, backupContent, fileExtension, sizeBytes, filename;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _f.sent();
                    if (!db) {
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
                    }
                    _a = options.scope, scope = _a === void 0 ? 'full' : _a, _b = options.tables, requestedTables = _b === void 0 ? [] : _b, _c = options.includeSensitive, includeSensitive = _c === void 0 ? false : _c, _d = options.compress, compress = _d === void 0 ? true : _d, _e = options.format, format = _e === void 0 ? 'json' : _e;
                    backupId = uuid_1.v4();
                    timestamp = new Date().toISOString();
                    dateStr = new Date().toISOString().split('T')[0];
                    allTables = getAllTables();
                    tablesToBackup = allTables;
                    if (scope === 'selective' && requestedTables.length > 0) {
                        tablesToBackup = allTables.filter(function (table) {
                            return requestedTables.includes(table.name);
                        });
                    }
                    // Exclude sensitive tables unless explicitly requested
                    if (!includeSensitive) {
                        tablesToBackup = tablesToBackup.filter(function (table) {
                            return !EXCLUDED_TABLES.has(table.name) &&
                                (!SENSITIVE_TABLES.has(table.name) || requestedTables.includes(table.name));
                        });
                    }
                    backupData = {
                        metadata: {
                            id: backupId,
                            version: '2.0',
                            timestamp: timestamp,
                            userId: userId,
                            scope: scope,
                            options: options,
                            format: format,
                            compressed: compress
                        },
                        data: {},
                        stats: {
                            totalRecords: 0,
                            tableCount: 0,
                            sizeBytes: 0
                        }
                    };
                    totalRecords = 0;
                    _i = 0, tablesToBackup_1 = tablesToBackup;
                    _f.label = 2;
                case 2:
                    if (!(_i < tablesToBackup_1.length)) return [3 /*break*/, 7];
                    table = tablesToBackup_1[_i];
                    _f.label = 3;
                case 3:
                    _f.trys.push([3, 5, , 6]);
                    console.log("Backing up table: " + table.name);
                    return [4 /*yield*/, db.select().from(table.schema)];
                case 4:
                    records = _f.sent();
                    if (records.length > 0) {
                        backupData.data[table.name] = records;
                        backupData.stats.totalRecords += records.length;
                        totalRecords += records.length;
                    }
                    backupData.stats.tableCount++;
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _f.sent();
                    console.warn("Warning: Could not backup table " + table.name + ":", error_1.message);
                    return [3 /*break*/, 6];
                case 6:
                    _i++;
                    return [3 /*break*/, 2];
                case 7:
                    if (format === 'sql') {
                        // Generate SQL dump
                        backupContent = generateSQLDump(backupData);
                        fileExtension = 'sql';
                    }
                    else {
                        // JSON format
                        backupContent = JSON.stringify(backupData, null, 2);
                        fileExtension = 'json';
                    }
                    sizeBytes = Buffer.byteLength(backupContent, 'utf8');
                    filename = "backup_" + scope + "_" + dateStr + "_" + backupId.slice(0, 8) + "." + fileExtension;
                    // Update stats
                    backupData.stats.sizeBytes = sizeBytes;
                    return [2 /*return*/, {
                            id: backupId,
                            filename: filename,
                            size: sizeBytes,
                            recordCount: totalRecords,
                            tableCount: backupData.stats.tableCount,
                            tables: Object.keys(backupData.data),
                            createdAt: timestamp,
                            metadata: backupData.metadata
                        }];
            }
        });
    });
}
exports.createBackup = createBackup;
/**
 * Generate SQL dump from backup data
 */
function generateSQLDump(backupData) {
    var lines = [];
    lines.push('-- Kiini Database Backup');
    lines.push("-- Generated: " + backupData.metadata.timestamp);
    lines.push("-- User: " + backupData.metadata.userId);
    lines.push("-- Version: " + backupData.metadata.version);
    lines.push('');
    lines.push('SET FOREIGN_KEY_CHECKS = 0;');
    lines.push('SET AUTOCOMMIT = 0;');
    lines.push('START TRANSACTION;');
    lines.push('');
    // Generate INSERT statements for each table
    Object.entries(backupData.data).forEach(function (_a) {
        var tableName = _a[0], records = _a[1];
        if (records.length === 0)
            return;
        lines.push("-- Table: " + tableName);
        lines.push("DELETE FROM `" + tableName + "`;");
        // Process records in batches to avoid memory issues
        var batchSize = 100;
        for (var i = 0; i < records.length; i += batchSize) {
            var batch = records.slice(i, i + batchSize);
            var values = batch.map(function (record) {
                var columns = Object.keys(record);
                var values = columns.map(function (col) {
                    var value = record[col];
                    if (value === null)
                        return 'NULL';
                    if (typeof value === 'string')
                        return "'" + value.replace(/'/g, "''") + "'";
                    if (typeof value === 'boolean')
                        return value ? '1' : '0';
                    return value.toString();
                });
                return "(" + values.join(', ') + ")";
            });
            var columns = Object.keys(batch[0]);
            lines.push("INSERT INTO `" + tableName + "` (`" + columns.join('`, `') + "`) VALUES");
            lines.push(values.join(',\n') + ";");
            lines.push('');
        }
    });
    lines.push('SET FOREIGN_KEY_CHECKS = 1;');
    lines.push('COMMIT;');
    lines.push('');
    return lines.join('\n');
}
/**
 * Restore database from backup
 */
function restoreBackup(backupData, userId, options) {
    var _a;
    return __awaiter(this, void 0, Promise, function () {
        var db, _b, mode, _c, skipExisting, _d, validateOnly, _e, tableWhitelist, _f, tableBlacklist, result, allTables, tableMap, tablesToRestore, _i, tablesToRestore_1, tableName, _g, tablesToRestore_2, tableName, records, tableSchema, error_2, _h, records_1, record, cleanRecord, error_3, error_4;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _j.sent();
                    if (!db) {
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
                    }
                    _b = options.mode, mode = _b === void 0 ? 'merge' : _b, _c = options.skipExisting, skipExisting = _c === void 0 ? true : _c, _d = options.validateOnly, validateOnly = _d === void 0 ? false : _d, _e = options.tableWhitelist, tableWhitelist = _e === void 0 ? [] : _e, _f = options.tableBlacklist, tableBlacklist = _f === void 0 ? [] : _f;
                    result = {
                        restored: 0,
                        skipped: 0,
                        errors: [],
                        tablesProcessed: 0,
                        validationErrors: []
                    };
                    // Validate backup structure
                    if (!backupData.metadata || !backupData.data) {
                        throw new server_1.TRPCError({ code: "BAD_REQUEST", message: "Invalid backup format" });
                    }
                    allTables = getAllTables();
                    tableMap = new Map(allTables.map(function (t) { return [t.name, t.schema]; }));
                    tablesToRestore = Object.keys(backupData.data);
                    if (tableWhitelist.length > 0) {
                        tablesToRestore = tablesToRestore.filter(function (table) { return tableWhitelist.includes(table); });
                    }
                    if (tableBlacklist.length > 0) {
                        tablesToRestore = tablesToRestore.filter(function (table) { return !tableBlacklist.includes(table); });
                    }
                    // Validate tables exist in current schema
                    for (_i = 0, tablesToRestore_1 = tablesToRestore; _i < tablesToRestore_1.length; _i++) {
                        tableName = tablesToRestore_1[_i];
                        if (!tableMap.has(tableName)) {
                            result.validationErrors.push("Table '" + tableName + "' does not exist in current schema");
                        }
                    }
                    if (result.validationErrors.length > 0 && validateOnly) {
                        return [2 /*return*/, result];
                    }
                    _g = 0, tablesToRestore_2 = tablesToRestore;
                    _j.label = 2;
                case 2:
                    if (!(_g < tablesToRestore_2.length)) return [3 /*break*/, 18];
                    tableName = tablesToRestore_2[_g];
                    _j.label = 3;
                case 3:
                    _j.trys.push([3, 16, , 17]);
                    records = backupData.data[tableName];
                    if (!records || records.length === 0)
                        return [3 /*break*/, 17];
                    tableSchema = tableMap.get(tableName);
                    if (!tableSchema)
                        return [3 /*break*/, 17];
                    console.log("Restoring table: " + tableName + " (" + records.length + " records)");
                    if (!(mode === 'replace' && !SENSITIVE_TABLES.has(tableName))) return [3 /*break*/, 8];
                    _j.label = 4;
                case 4:
                    _j.trys.push([4, 7, , 8]);
                    if (!!validateOnly) return [3 /*break*/, 6];
                    return [4 /*yield*/, db["delete"](tableSchema)];
                case 5:
                    _j.sent();
                    _j.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_2 = _j.sent();
                    result.errors.push({
                        table: tableName,
                        error: "Failed to clear table: " + error_2.message
                    });
                    return [3 /*break*/, 17];
                case 8:
                    _h = 0, records_1 = records;
                    _j.label = 9;
                case 9:
                    if (!(_h < records_1.length)) return [3 /*break*/, 15];
                    record = records_1[_h];
                    _j.label = 10;
                case 10:
                    _j.trys.push([10, 13, , 14]);
                    cleanRecord = cleanRecordForRestore(record, tableName);
                    if (!!validateOnly) return [3 /*break*/, 12];
                    return [4 /*yield*/, db.insert(tableSchema).values(cleanRecord).onDuplicateKeyUpdate(cleanRecord)];
                case 11:
                    _j.sent();
                    _j.label = 12;
                case 12:
                    result.restored++;
                    return [3 /*break*/, 14];
                case 13:
                    error_3 = _j.sent();
                    if (skipExisting && (error_3.code === 'ER_DUP_ENTRY' || ((_a = error_3.message) === null || _a === void 0 ? void 0 : _a.includes('Duplicate entry')))) {
                        result.skipped++;
                    }
                    else {
                        result.errors.push({
                            table: tableName,
                            error: error_3.message,
                            recordId: record.id
                        });
                    }
                    return [3 /*break*/, 14];
                case 14:
                    _h++;
                    return [3 /*break*/, 9];
                case 15:
                    result.tablesProcessed++;
                    return [3 /*break*/, 17];
                case 16:
                    error_4 = _j.sent();
                    result.errors.push({
                        table: tableName,
                        error: "Table restoration failed: " + error_4.message
                    });
                    return [3 /*break*/, 17];
                case 17:
                    _g++;
                    return [3 /*break*/, 2];
                case 18: return [2 /*return*/, result];
            }
        });
    });
}
exports.restoreBackup = restoreBackup;
/**
 * Clean record data for safe restoration
 */
function cleanRecordForRestore(record, tableName) {
    var cleanRecord = __assign({}, record);
    // Remove or clean sensitive fields
    if (tableName === 'users') {
        // Don't restore passwords - users will need to reset
        delete cleanRecord.password;
        delete cleanRecord.passwordResetToken;
        delete cleanRecord.emailVerificationToken;
    }
    // Remove auto-generated timestamps if they exist
    if (cleanRecord.createdAt && typeof cleanRecord.createdAt === 'string') {
        // Keep original timestamps for historical data
    }
    return cleanRecord;
}
/**
 * Get backup history
 */
function getBackupHistory(userId) {
    return __awaiter(this, void 0, Promise, function () {
        var db, history, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db
                            .select()
                            .from(schema.backupHistory)
                            .orderBy(drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["", " DESC"], ["", " DESC"])), schema.backupHistory.createdAt))
                            .limit(100)];
                case 3:
                    history = _a.sent();
                    return [2 /*return*/, history];
                case 4:
                    error_5 = _a.sent();
                    console.error('Failed to get backup history:', error_5);
                    return [2 /*return*/, []];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.getBackupHistory = getBackupHistory;
/**
 * Schedule a backup
 */
function scheduleBackup(userId, name, schedule, options) {
    return __awaiter(this, void 0, Promise, function () {
        var db, scheduleId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
                    }
                    scheduleId = uuid_1.v4();
                    return [4 /*yield*/, db.insert(schema.backupSchedules).values({
                            id: scheduleId,
                            name: name,
                            backupType: options.scope === 'full' ? 'FULL' : 'PARTIAL',
                            schedule: schedule,
                            config: JSON.stringify(options),
                            createdBy: userId,
                            status: 'SCHEDULED'
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, scheduleId];
            }
        });
    });
}
exports.scheduleBackup = scheduleBackup;
/**
 * Get available tables for backup/export
 */
function getAvailableTables() {
    var allTables = getAllTables();
    return allTables
        .filter(function (table) { return !EXCLUDED_TABLES.has(table.name); })
        .map(function (table) { return ({
        name: table.name,
        description: getTableDescription(table.name),
        recordCount: undefined // Will be populated when needed
    }); });
}
exports.getAvailableTables = getAvailableTables;
/**
 * Get human-readable table description
 */
function getTableDescription(tableName) {
    var descriptions = {
        users: 'User accounts and authentication',
        employees: 'Employee records and information',
        clients: 'Client companies and contacts',
        invoices: 'Invoice records and billing',
        receipts: 'Payment receipts',
        expenses: 'Expense records',
        products: 'Product catalog',
        services: 'Service offerings',
        projects: 'Project management data',
        departments: 'Organizational departments',
        payroll: 'Payroll and salary data',
        bankAccounts: 'Bank account information',
        journalEntries: 'Accounting journal entries',
        accounts: 'Chart of accounts',
        auditLogs: 'System audit trail',
        activityLog: 'User activity logs',
        notifications: 'System notifications',
        settings: 'System and user settings'
    };
    return descriptions[tableName] || "" + tableName.replace(/([A-Z])/g, ' $1').toLowerCase();
}
/content>
    < parameter;
name = "filePath" > e;
Kiini;
server;
services;
backupService.ts;
var templateObject_1;
