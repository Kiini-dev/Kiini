"use strict";
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
exports.sysAdminRouter = void 0;
/**
 * SysAdmin Router - Full Backup & Restore
 */
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var db = require("../db");
var schema_1 = require("../../drizzle/schema");
var schema_extended_1 = require("../../drizzle/schema-extended");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var server_1 = require("@trpc/server");
var adminViewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure('admin:view');
var adminEditProcedure = enhancedRbac_1.createFeatureRestrictedProcedure('admin:edit');
// All tables available for backup
var ALL_TABLES = [
    { key: 'users', schema: schema_1.users, label: 'Users' },
    { key: 'employees', schema: schema_1.employees, label: 'Employees' },
    { key: 'departments', schema: schema_1.departments, label: 'Departments' },
    { key: 'jobGroups', schema: schema_1.jobGroups, label: 'Job Groups' },
    { key: 'clients', schema: schema_1.clients, label: 'Clients' },
    { key: 'suppliers', schema: schema_extended_1.suppliers, label: 'Suppliers' },
    { key: 'services', schema: schema_1.services, label: 'Services' },
    { key: 'products', schema: schema_1.products, label: 'Products' },
    { key: 'invoices', schema: schema_1.invoices, label: 'Invoices' },
    { key: 'estimates', schema: schema_1.estimates, label: 'Estimates' },
    { key: 'receipts', schema: schema_1.receipts, label: 'Receipts' },
    { key: 'expenses', schema: schema_1.expenses, label: 'Expenses' },
    { key: 'payroll', schema: schema_1.payroll, label: 'Payroll' },
    { key: 'recurringInvoices', schema: schema_1.recurringInvoices, label: 'Recurring Invoices' },
    { key: 'bankAccounts', schema: schema_1.bankAccounts, label: 'Bank Accounts' },
    { key: 'journalEntries', schema: schema_1.journalEntries, label: 'Journal Entries' },
    { key: 'accounts', schema: schema_1.accounts, label: 'Accounts' },
    { key: 'communicationLogs', schema: schema_1.communicationLogs, label: 'Communication Logs' },
    { key: 'organizations', schema: schema_1.organizations, label: 'Organizations' },
    { key: 'organizationFeatures', schema: schema_1.organizationFeatures, label: 'Organization Features' },
];
exports.sysAdminRouter = trpc_1.router({
    // ─── Dashboard Stats ──────────────────────────────────────────────
    getBackupStats: adminViewProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, historyRows, lastBackup, schedRrows, totalSize;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _e.sent();
                    return [4 /*yield*/, database.select({ count: drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["COUNT(*)"], ["COUNT(*)"]))) }).from(schema_1.backupHistory)];
                case 2:
                    historyRows = (_e.sent())[0];
                    return [4 /*yield*/, database.select().from(schema_1.backupHistory).where(drizzle_orm_1.eq(schema_1.backupHistory.status, 'completed')).orderBy(drizzle_orm_1.desc(schema_1.backupHistory.completedAt)).limit(1)];
                case 3:
                    lastBackup = _e.sent();
                    return [4 /*yield*/, database.select({ count: drizzle_orm_1.sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["COUNT(*)"], ["COUNT(*)"]))) }).from(schema_1.backupSchedules)];
                case 4:
                    schedRrows = (_e.sent())[0];
                    return [4 /*yield*/, database.select({ total: drizzle_orm_1.sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["COALESCE(SUM(sizeBytes), 0)"], ["COALESCE(SUM(sizeBytes), 0)"]))) }).from(schema_1.backupHistory).where(drizzle_orm_1.eq(schema_1.backupHistory.status, 'completed'))];
                case 5:
                    totalSize = (_e.sent())[0];
                    return [2 /*return*/, {
                            totalBackups: (_a = historyRows === null || historyRows === void 0 ? void 0 : historyRows.count) !== null && _a !== void 0 ? _a : 0,
                            totalSchedules: (_b = schedRrows === null || schedRrows === void 0 ? void 0 : schedRrows.count) !== null && _b !== void 0 ? _b : 0,
                            lastBackup: (_c = lastBackup[0]) !== null && _c !== void 0 ? _c : null,
                            totalSizeBytes: (_d = totalSize === null || totalSize === void 0 ? void 0 : totalSize.total) !== null && _d !== void 0 ? _d : 0
                        }];
            }
        });
    }); }),
    // ─── List Organizations (for scoped backup) ───────────────────────
    listOrganizations: adminViewProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, orgs, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _b.sent();
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, database.select({
                            id: schema_1.organizations.id,
                            name: schema_1.organizations.name,
                            slug: schema_1.organizations.slug,
                            isActive: schema_1.organizations.isActive
                        }).from(schema_1.organizations).orderBy(schema_1.organizations.name)];
                case 3:
                    orgs = _b.sent();
                    return [2 /*return*/, orgs];
                case 4:
                    _a = _b.sent();
                    return [2 /*return*/, []];
                case 5: return [2 /*return*/];
            }
        });
    }); }),
    // ─── List available tables ────────────────────────────────────────
    listTables: adminViewProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, ALL_TABLES.map(function (t) { return ({ key: t.key, label: t.label }); })];
        });
    }); }),
    // ─── Create Backup ────────────────────────────────────────────────
    createBackup: adminEditProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string().min(1).max(200),
        scope: zod_1.z["enum"](['full', 'organization', 'tables'])["default"]('full'),
        organizationId: zod_1.z.string().optional(),
        selectedTables: zod_1.z.array(zod_1.z.string()).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, id, timestamp, createdBy, scopeEntityId, backupData, tablesToBackup, totalRecords, backedUpTables, _i, tablesToBackup_1, table, records, _b, err_1, jsonStr, sizeBytes, fileName, _c, err_2, updateErr_1;
            var _d, _e, _f, _g, _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _j.sent();
                        id = uuid_1.v4();
                        timestamp = new Date().toISOString();
                        createdBy = ((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id) || 'system';
                        scopeEntityId = input.organizationId || null;
                        return [4 /*yield*/, database.execute(drizzle_orm_1.sql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["INSERT INTO backup_history (id, name, backupType, scope, scopeEntityId, status, createdBy) VALUES (", ", ", ", 'manual', ", ", ", ", 'running', ", ")"], ["INSERT INTO backup_history (id, name, backupType, scope, scopeEntityId, status, createdBy) VALUES (", ", ", ", 'manual', ", ", ", ", 'running', ", ")"])), id, input.name, input.scope, scopeEntityId, createdBy))];
                    case 2:
                        _j.sent();
                        _j.label = 3;
                    case 3:
                        _j.trys.push([3, 22, , 27]);
                        backupData = {
                            metadata: {
                                version: '2.0',
                                id: id,
                                name: input.name,
                                scope: input.scope,
                                organizationId: input.organizationId || null,
                                timestamp: timestamp,
                                createdBy: ((_e = ctx.user) === null || _e === void 0 ? void 0 : _e.id) || 'system',
                                createdByEmail: ((_f = ctx.user) === null || _f === void 0 ? void 0 : _f.email) || ''
                            },
                            data: {}
                        };
                        tablesToBackup = ALL_TABLES;
                        // Filter by selected tables
                        if (input.scope === 'tables' && ((_g = input.selectedTables) === null || _g === void 0 ? void 0 : _g.length)) {
                            tablesToBackup = ALL_TABLES.filter(function (t) { return input.selectedTables.includes(t.key); });
                        }
                        totalRecords = 0;
                        backedUpTables = [];
                        _i = 0, tablesToBackup_1 = tablesToBackup;
                        _j.label = 4;
                    case 4:
                        if (!(_i < tablesToBackup_1.length)) return [3 /*break*/, 16];
                        table = tablesToBackup_1[_i];
                        _j.label = 5;
                    case 5:
                        _j.trys.push([5, 14, , 15]);
                        records = void 0;
                        if (!(input.scope === 'organization' && input.organizationId)) return [3 /*break*/, 11];
                        _j.label = 6;
                    case 6:
                        _j.trys.push([6, 8, , 10]);
                        return [4 /*yield*/, database.select().from(table.schema)
                                .where(drizzle_orm_1.eq(table.schema.organizationId, input.organizationId))];
                    case 7:
                        records = _j.sent();
                        return [3 /*break*/, 10];
                    case 8:
                        _b = _j.sent();
                        return [4 /*yield*/, database.select().from(table.schema)];
                    case 9:
                        // Table doesn't have organizationId column, backup all rows
                        records = _j.sent();
                        return [3 /*break*/, 10];
                    case 10: return [3 /*break*/, 13];
                    case 11: return [4 /*yield*/, database.select().from(table.schema)];
                    case 12:
                        records = _j.sent();
                        _j.label = 13;
                    case 13:
                        if (records.length > 0) {
                            backupData.data[table.key] = records;
                            totalRecords += records.length;
                            backedUpTables.push(table.key);
                        }
                        return [3 /*break*/, 15];
                    case 14:
                        err_1 = _j.sent();
                        console.warn("Backup: skipping table " + table.key + ": " + err_1.message);
                        return [3 /*break*/, 15];
                    case 15:
                        _i++;
                        return [3 /*break*/, 4];
                    case 16:
                        jsonStr = JSON.stringify(backupData);
                        sizeBytes = Buffer.byteLength(jsonStr, 'utf8');
                        fileName = "backup_" + input.scope + "_" + new Date().toISOString().replace(/[:.]/g, '-') + ".json";
                        // Update history record using raw SQL to avoid ORM issues
                        return [4 /*yield*/, database.execute(drizzle_orm_1.sql(templateObject_5 || (templateObject_5 = __makeTemplateObject(["UPDATE backup_history SET status = 'completed', tablesList = ", ", recordCount = ", ", sizeBytes = ", ", fileName = ", ", completedAt = NOW() WHERE id = ", ""], ["UPDATE backup_history SET status = 'completed', tablesList = ", ", recordCount = ", ", sizeBytes = ", ", fileName = ", ", completedAt = NOW() WHERE id = ", ""])), backedUpTables.join(','), totalRecords, sizeBytes, fileName, id))];
                    case 17:
                        // Update history record using raw SQL to avoid ORM issues
                        _j.sent();
                        _j.label = 18;
                    case 18:
                        _j.trys.push([18, 20, , 21]);
                        return [4 /*yield*/, db.logActivity({
                                userId: ((_h = ctx.user) === null || _h === void 0 ? void 0 : _h.id) || 'system',
                                action: 'backup_created',
                                entityType: 'backup',
                                entityId: id,
                                description: "Backup \"" + input.name + "\" created: " + totalRecords + " records from " + backedUpTables.length + " tables (" + input.scope + ")"
                            })];
                    case 19:
                        _j.sent();
                        return [3 /*break*/, 21];
                    case 20:
                        _c = _j.sent();
                        return [3 /*break*/, 21];
                    case 21: return [2 /*return*/, {
                            success: true,
                            backupId: id,
                            backup: backupData,
                            fileName: fileName,
                            stats: { totalRecords: totalRecords, tablesBackedUp: backedUpTables.length, sizeBytes: sizeBytes }
                        }];
                    case 22:
                        err_2 = _j.sent();
                        console.error('Backup error:', err_2);
                        _j.label = 23;
                    case 23:
                        _j.trys.push([23, 25, , 26]);
                        return [4 /*yield*/, database.execute(drizzle_orm_1.sql(templateObject_6 || (templateObject_6 = __makeTemplateObject(["UPDATE backup_history SET status = 'failed', errorMessage = ", " WHERE id = ", ""], ["UPDATE backup_history SET status = 'failed', errorMessage = ", " WHERE id = ", ""])), err_2.message, id))];
                    case 24:
                        _j.sent();
                        return [3 /*break*/, 26];
                    case 25:
                        updateErr_1 = _j.sent();
                        console.error('Failed to update backup status:', updateErr_1);
                        return [3 /*break*/, 26];
                    case 26: throw new server_1.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "Backup failed: " + err_2.message });
                    case 27: return [2 /*return*/];
                }
            });
        });
    }),
    // ─── Restore Backup ───────────────────────────────────────────────
    restoreBackup: adminEditProcedure
        .input(zod_1.z.object({
        backupData: zod_1.z.string(),
        mode: zod_1.z["enum"](['merge', 'replace'])["default"]('merge'),
        selectedTables: zod_1.z.array(zod_1.z.string()).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, backup, results, dataKeys, tablesToRestore, _loop_1, _i, tablesToRestore_1, key, id, name, scope, status, tablesStr, createdBy, _b, _c;
            var _d, _e, _f, _g, _h, _j, _k;
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _l.sent();
                        try {
                            backup = JSON.parse(input.backupData);
                        }
                        catch (_m) {
                            throw new server_1.TRPCError({ code: 'BAD_REQUEST', message: 'Invalid backup file: not valid JSON' });
                        }
                        if (!backup.metadata || !backup.data) {
                            throw new server_1.TRPCError({ code: 'BAD_REQUEST', message: 'Invalid backup file: missing metadata or data' });
                        }
                        results = { restored: 0, skipped: 0, errors: [], tablesProcessed: 0 };
                        dataKeys = Object.keys(backup.data);
                        tablesToRestore = ((_d = input.selectedTables) === null || _d === void 0 ? void 0 : _d.length) ? dataKeys.filter(function (k) { return input.selectedTables.includes(k); })
                            : dataKeys;
                        _loop_1 = function (key) {
                            var tableDef, records, schemaColumns, validColNames, _loop_2, _i, records_1, record, err_3;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        tableDef = ALL_TABLES.find(function (t) { return t.key === key; });
                                        if (!tableDef)
                                            return [2 /*return*/, "continue"];
                                        records = backup.data[key];
                                        if (!Array.isArray(records) || records.length === 0)
                                            return [2 /*return*/, "continue"];
                                        schemaColumns = drizzle_orm_1.getTableColumns(tableDef.schema);
                                        validColNames = new Set(Object.keys(schemaColumns));
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([1, 8, , 9]);
                                        if (!(input.mode === 'replace')) return [3 /*break*/, 3];
                                        return [4 /*yield*/, database.execute(drizzle_orm_1.sql.raw("DELETE FROM `" + key + "`"))];
                                    case 2:
                                        _a.sent();
                                        _a.label = 3;
                                    case 3:
                                        _loop_2 = function (record) {
                                            var cleanRecord_1, cols, colStr, valueParts, valuesSql, insertKeyword, insertSql, insertResult, affected, err_4;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        _a.trys.push([0, 2, , 3]);
                                                        cleanRecord_1 = __assign({}, record);
                                                        // Don't restore password hashes for security
                                                        if (key === 'users')
                                                            delete cleanRecord_1.password;
                                                        cols = Object.keys(cleanRecord_1).filter(function (c) { return validColNames.has(c); });
                                                        if (cols.length === 0)
                                                            return [2 /*return*/, "continue"];
                                                        colStr = cols.map(function (c) { return "`" + c + "`"; }).join(', ');
                                                        valueParts = cols.map(function (c) { return drizzle_orm_1.sql(templateObject_7 || (templateObject_7 = __makeTemplateObject(["", ""], ["", ""])), cleanRecord_1[c]); });
                                                        valuesSql = drizzle_orm_1.sql.join(valueParts, drizzle_orm_1.sql.raw(', '));
                                                        insertKeyword = input.mode === 'merge' ? 'INSERT IGNORE' : 'INSERT';
                                                        insertSql = drizzle_orm_1.sql.join([
                                                            drizzle_orm_1.sql.raw(insertKeyword + " INTO `" + key + "` (" + colStr + ") VALUES ("),
                                                            valuesSql,
                                                            drizzle_orm_1.sql.raw(')')
                                                        ]);
                                                        return [4 /*yield*/, database.execute(insertSql)];
                                                    case 1:
                                                        insertResult = _a.sent();
                                                        affected = (_g = (_f = (_e = insertResult === null || insertResult === void 0 ? void 0 : insertResult[0]) === null || _e === void 0 ? void 0 : _e.affectedRows) !== null && _f !== void 0 ? _f : insertResult === null || insertResult === void 0 ? void 0 : insertResult.affectedRows) !== null && _g !== void 0 ? _g : 1;
                                                        if (affected > 0) {
                                                            results.restored++;
                                                        }
                                                        else {
                                                            results.skipped++;
                                                        }
                                                        return [3 /*break*/, 3];
                                                    case 2:
                                                        err_4 = _a.sent();
                                                        if (((_h = err_4 === null || err_4 === void 0 ? void 0 : err_4.message) === null || _h === void 0 ? void 0 : _h.includes('Duplicate entry')) || (err_4 === null || err_4 === void 0 ? void 0 : err_4.code) === 'ER_DUP_ENTRY') {
                                                            results.skipped++;
                                                        }
                                                        else {
                                                            results.errors.push(key + ": " + err_4.message);
                                                        }
                                                        return [3 /*break*/, 3];
                                                    case 3: return [2 /*return*/];
                                                }
                                            });
                                        };
                                        _i = 0, records_1 = records;
                                        _a.label = 4;
                                    case 4:
                                        if (!(_i < records_1.length)) return [3 /*break*/, 7];
                                        record = records_1[_i];
                                        return [5 /*yield**/, _loop_2(record)];
                                    case 5:
                                        _a.sent();
                                        _a.label = 6;
                                    case 6:
                                        _i++;
                                        return [3 /*break*/, 4];
                                    case 7:
                                        results.tablesProcessed++;
                                        return [3 /*break*/, 9];
                                    case 8:
                                        err_3 = _a.sent();
                                        results.errors.push("Table " + key + ": " + err_3.message);
                                        return [3 /*break*/, 9];
                                    case 9: return [2 /*return*/];
                                }
                            });
                        };
                        _i = 0, tablesToRestore_1 = tablesToRestore;
                        _l.label = 2;
                    case 2:
                        if (!(_i < tablesToRestore_1.length)) return [3 /*break*/, 5];
                        key = tablesToRestore_1[_i];
                        return [5 /*yield**/, _loop_1(key)];
                    case 3:
                        _l.sent();
                        _l.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        id = uuid_1.v4();
                        _l.label = 6;
                    case 6:
                        _l.trys.push([6, 8, , 9]);
                        name = "Restore: " + (backup.metadata.name || 'uploaded backup');
                        scope = backup.metadata.scope || 'full';
                        status = results.errors.length === 0 ? 'completed' : 'completed_with_errors';
                        tablesStr = tablesToRestore.join(',');
                        createdBy = ((_j = ctx.user) === null || _j === void 0 ? void 0 : _j.id) || 'system';
                        return [4 /*yield*/, database.execute(drizzle_orm_1.sql(templateObject_8 || (templateObject_8 = __makeTemplateObject(["INSERT INTO backup_history (id, name, backupType, scope, status, recordCount, tablesList, createdBy, completedAt) VALUES (", ", ", ", 'restore', ", ", ", ", ", ", ", ", ", ", NOW())"], ["INSERT INTO backup_history (id, name, backupType, scope, status, recordCount, tablesList, createdBy, completedAt) VALUES (", ", ", ", 'restore', ", ", ", ", ", ", ", ", ", ", NOW())"])), id, name, scope, status, results.restored, tablesStr, createdBy))];
                    case 7:
                        _l.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        _b = _l.sent();
                        return [3 /*break*/, 9];
                    case 9:
                        _l.trys.push([9, 11, , 12]);
                        return [4 /*yield*/, db.logActivity({
                                userId: ((_k = ctx.user) === null || _k === void 0 ? void 0 : _k.id) || 'system',
                                action: 'backup_restored',
                                entityType: 'backup',
                                entityId: id,
                                description: "Backup restored (" + input.mode + "): " + results.restored + " records, " + results.skipped + " skipped, " + results.errors.length + " errors"
                            })];
                    case 10:
                        _l.sent();
                        return [3 /*break*/, 12];
                    case 11:
                        _c = _l.sent();
                        return [3 /*break*/, 12];
                    case 12: return [2 /*return*/, {
                            success: results.errors.length === 0,
                            results: results,
                            message: "Restored " + results.restored + " records from " + results.tablesProcessed + " tables"
                        }];
                }
            });
        });
    }),
    // ─── Backup History ───────────────────────────────────────────────
    listHistory: adminViewProcedure
        .input(zod_1.z.object({ limit: zod_1.z.number()["default"](50), status: zod_1.z.string().optional() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, rows, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 7, , 8]);
                        rows = void 0;
                        if (!input.status) return [3 /*break*/, 4];
                        return [4 /*yield*/, database.select().from(schema_1.backupHistory)
                                .where(drizzle_orm_1.eq(schema_1.backupHistory.status, input.status))
                                .orderBy(drizzle_orm_1.desc(schema_1.backupHistory.createdAt)).limit(input.limit)];
                    case 3:
                        rows = _c.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, database.select().from(schema_1.backupHistory)
                            .orderBy(drizzle_orm_1.desc(schema_1.backupHistory.createdAt)).limit(input.limit)];
                    case 5:
                        rows = _c.sent();
                        _c.label = 6;
                    case 6: return [2 /*return*/, rows];
                    case 7:
                        _b = _c.sent();
                        return [2 /*return*/, []];
                    case 8: return [2 /*return*/];
                }
            });
        });
    }),
    // ─── Delete History Entry ─────────────────────────────────────────
    deleteHistoryEntry: adminEditProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        return [4 /*yield*/, database["delete"](schema_1.backupHistory).where(drizzle_orm_1.eq(schema_1.backupHistory.id, input.id))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // ─── Backup Schedules CRUD ────────────────────────────────────────
    scheduleBackup: adminEditProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string(),
        backupType: zod_1.z["enum"](['full', 'incremental', 'differential'])["default"]('full'),
        schedule: zod_1.z.string(),
        retentionDays: zod_1.z.number()["default"](30)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, id, createdBy;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        id = uuid_1.v4();
                        createdBy = ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || 'system';
                        return [4 /*yield*/, database.execute(drizzle_orm_1.sql(templateObject_9 || (templateObject_9 = __makeTemplateObject(["INSERT INTO backup_schedules (id, name, backupType, schedule, retentionDays, status, nextRun, createdBy) VALUES (", ", ", ", ", ", ", ", ", ", 'scheduled', NOW(), ", ")"], ["INSERT INTO backup_schedules (id, name, backupType, schedule, retentionDays, status, nextRun, createdBy) VALUES (", ", ", ", ", ", ", ", ", ", 'scheduled', NOW(), ", ")"])), id, input.name, input.backupType, input.schedule, input.retentionDays, createdBy))];
                    case 2:
                        _c.sent();
                        return [2 /*return*/, { success: true, backupId: id }];
                }
            });
        });
    }),
    listSchedules: adminViewProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _b.sent();
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, database.select().from(schema_1.backupSchedules).orderBy(drizzle_orm_1.desc(schema_1.backupSchedules.createdAt))];
                case 3: return [2 /*return*/, _b.sent()];
                case 4:
                    _a = _b.sent();
                    return [2 /*return*/, []];
                case 5: return [2 /*return*/];
            }
        });
    }); }),
    deleteSchedule: adminEditProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        return [4 /*yield*/, database["delete"](schema_1.backupSchedules).where(drizzle_orm_1.eq(schema_1.backupSchedules.id, input.id))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // ─── System Health ────────────────────────────────────────────────
    getSystemHealth: adminViewProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, {
                    status: 'healthy',
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    cpu: process.cpuUsage(),
                    nodeVersion: process.version,
                    timestamp: new Date()
                }];
        });
    }); })
});
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9;
