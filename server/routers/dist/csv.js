"use strict";
/**
 * Comprehensive CSV Import/Export Router
 * Provides CSV template generation, import, and export for all database tables
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
exports.csvRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var server_1 = require("@trpc/server");
var csvService_1 = require("../services/csvService");
var db_1 = require("../db");
var schema = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var csvProcedure = trpc_1.createFeatureRestrictedProcedure("data:export");
var importProcedure = trpc_1.createFeatureRestrictedProcedure("data:import");
exports.csvRouter = trpc_1.router({
    /**
     * Get available tables for CSV operations
     */
    getAvailableTables: trpc_1.protectedProcedure
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, csvService_1.getAvailableCSVTables()];
        });
    }); }),
    /**
     * Generate CSV template for a specific table
     */
    generateTemplate: csvProcedure
        .input(zod_1.z.object({
        table: zod_1.z.string().min(1, "Table name is required")
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var template, csvContent, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, csvService_1.generateCSVTemplate(input.table)];
                    case 1:
                        template = _b.sent();
                        csvContent = template.sampleData
                            .map(function (row) { return row.map(function (cell) { return "\"" + cell + "\""; }).join(','); })
                            .join('\n');
                        return [2 /*return*/, {
                                success: true,
                                template: template,
                                csvContent: csvContent,
                                filename: input.table + "_template_" + Date.now() + ".csv"
                            }];
                    case 2:
                        error_1 = _b.sent();
                        if (error_1 instanceof server_1.TRPCError)
                            throw error_1;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Template generation failed: " + error_1.message
                        });
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Export table data to CSV
     */
    exportTable: csvProcedure
        .input(zod_1.z.object({
        table: zod_1.z.string().min(1, "Table name is required"),
        filters: zod_1.z.record(zod_1.z.any()).optional(),
        columns: zod_1.z.array(zod_1.z.string()).optional(),
        includeHeaders: zod_1.z.boolean()["default"](true),
        delimiter: zod_1.z.string()["default"](','),
        quoteChar: zod_1.z.string()["default"]('"'),
        escapeChar: zod_1.z.string()["default"]('"')
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var options, result, db, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        options = {
                            table: input.table,
                            filters: input.filters,
                            columns: input.columns,
                            includeHeaders: input.includeHeaders,
                            delimiter: input.delimiter,
                            quoteChar: input.quoteChar,
                            escapeChar: input.escapeChar
                        };
                        return [4 /*yield*/, csvService_1.exportTableToCSV(options)];
                    case 1:
                        result = _b.sent();
                        return [4 /*yield*/, db_1.getDb()];
                    case 2:
                        db = _b.sent();
                        if (!db) return [3 /*break*/, 4];
                        return [4 /*yield*/, db.insert(schema.exportJobs).values({
                                id: crypto.randomUUID(),
                                name: "CSV Export: " + input.table,
                                type: 'csv',
                                status: 'completed',
                                recordCount: result.recordCount,
                                fileName: result.filename,
                                config: JSON.stringify({
                                    table: input.table,
                                    filters: input.filters,
                                    columns: input.columns
                                }),
                                createdBy: ctx.user.id,
                                completedAt: new Date().toISOString()
                            })];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4: return [2 /*return*/, {
                            success: true,
                            "export": result,
                            message: "Exported " + result.recordCount + " records from " + input.table
                        }];
                    case 5:
                        error_2 = _b.sent();
                        if (error_2 instanceof server_1.TRPCError)
                            throw error_2;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Export failed: " + error_2.message
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Import CSV data into a table
     */
    importTable: importProcedure
        .input(zod_1.z.object({
        table: zod_1.z.string().min(1, "Table name is required"),
        csvData: zod_1.z.string().min(1, "CSV data is required"),
        hasHeaders: zod_1.z.boolean()["default"](true),
        skipDuplicates: zod_1.z.boolean()["default"](true),
        updateExisting: zod_1.z.boolean()["default"](false),
        validateOnly: zod_1.z.boolean()["default"](false),
        delimiter: zod_1.z.string()["default"](','),
        quoteChar: zod_1.z.string()["default"]('"'),
        escapeChar: zod_1.z.string()["default"]('"'),
        columnMapping: zod_1.z.record(zod_1.z.string()).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var options, result, db, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        options = {
                            table: input.table,
                            data: input.csvData,
                            hasHeaders: input.hasHeaders,
                            skipDuplicates: input.skipDuplicates,
                            updateExisting: input.updateExisting,
                            validateOnly: input.validateOnly,
                            delimiter: input.delimiter,
                            quoteChar: input.quoteChar,
                            escapeChar: input.escapeChar,
                            columnMapping: input.columnMapping
                        };
                        return [4 /*yield*/, csvService_1.importCSVToTable(options)];
                    case 1:
                        result = _b.sent();
                        if (!!input.validateOnly) return [3 /*break*/, 4];
                        return [4 /*yield*/, db_1.getDb()];
                    case 2:
                        db = _b.sent();
                        if (!db) return [3 /*break*/, 4];
                        return [4 /*yield*/, db.insert(schema.exportJobs).values({
                                id: crypto.randomUUID(),
                                name: "CSV Import: " + input.table,
                                type: 'csv_import',
                                status: result.errors.length > 0 ? 'completed_with_errors' : 'completed',
                                recordCount: result.imported,
                                config: JSON.stringify({
                                    table: input.table,
                                    hasHeaders: input.hasHeaders,
                                    skipDuplicates: input.skipDuplicates
                                }),
                                createdBy: ctx.user.id,
                                completedAt: new Date().toISOString(),
                                errorMessage: result.errors.length > 0 ? "Errors: " + result.errors.length : undefined
                            })];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4: return [2 /*return*/, {
                            success: true,
                            result: result,
                            message: input.validateOnly
                                ? "Validation completed: " + result.imported + " records would be imported"
                                : "Import completed: " + result.imported + " records imported, " + result.skipped + " skipped, " + result.errors.length + " errors"
                        }];
                    case 5:
                        error_3 = _b.sent();
                        if (error_3 instanceof server_1.TRPCError)
                            throw error_3;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Import failed: " + error_3.message
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Validate CSV data before import
     */
    validateCSV: importProcedure
        .input(zod_1.z.object({
        table: zod_1.z.string().min(1, "Table name is required"),
        csvData: zod_1.z.string().min(1, "CSV data is required"),
        hasHeaders: zod_1.z.boolean()["default"](true),
        delimiter: zod_1.z.string()["default"](','),
        quoteChar: zod_1.z.string()["default"]('"'),
        escapeChar: zod_1.z.string()["default"]('"'),
        columnMapping: zod_1.z.record(zod_1.z.string()).optional()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var options, result, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        options = {
                            table: input.table,
                            data: input.csvData,
                            hasHeaders: input.hasHeaders,
                            validateOnly: true,
                            delimiter: input.delimiter,
                            quoteChar: input.quoteChar,
                            escapeChar: input.escapeChar,
                            columnMapping: input.columnMapping
                        };
                        return [4 /*yield*/, csvService_1.importCSVToTable(options)];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                valid: result.errors.length === 0,
                                result: result,
                                message: result.errors.length === 0
                                    ? "CSV is valid: " + result.imported + " records can be imported"
                                    : "CSV has validation errors: " + result.errors.length + " errors found"
                            }];
                    case 2:
                        error_4 = _b.sent();
                        if (error_4 instanceof server_1.TRPCError)
                            throw error_4;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Validation failed: " + error_4.message
                        });
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get CSV import/export history
     */
    getHistory: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        type: zod_1.z["enum"](['export', 'import', 'all'])["default"]('all'),
        limit: zod_1.z.number().min(1).max(100)["default"](50)
    }))
        .query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, query, jobType, history, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        query = db
                            .select()
                            .from(schema.exportJobs)
                            .where(drizzle_orm_1.eq(schema.exportJobs.createdBy, ctx.user.id))
                            .orderBy(drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["", " DESC"], ["", " DESC"])), schema.exportJobs.createdAt))
                            .limit(100);
                        // Filter by type if specified
                        if (input.type !== 'all') {
                            jobType = input.type === 'export' ? 'csv' : 'csv_import';
                            query = query.where(drizzle_orm_1.eq(schema.exportJobs.type, jobType));
                        }
                        return [4 /*yield*/, query];
                    case 3:
                        history = _b.sent();
                        return [2 /*return*/, history];
                    case 4:
                        error_5 = _b.sent();
                        console.error('Failed to get CSV history:', error_5);
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get table schema information for CSV operations
     */
    getTableSchema: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        table: zod_1.z.string().min(1, "Table name is required")
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var template, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, csvService_1.generateCSVTemplate(input.table)];
                    case 1:
                        template = _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                schema: {
                                    table: input.table,
                                    columns: template.headers,
                                    sampleData: template.sampleData
                                }
                            }];
                    case 2:
                        error_6 = _b.sent();
                        if (error_6 instanceof server_1.TRPCError)
                            throw error_6;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to get table schema: " + error_6.message
                        });
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Bulk export multiple tables
     */
    bulkExport: csvProcedure
        .input(zod_1.z.object({
        tables: zod_1.z.array(zod_1.z.string()).min(1, "At least one table must be selected"),
        includeHeaders: zod_1.z.boolean()["default"](true),
        delimiter: zod_1.z.string()["default"](','),
        createZip: zod_1.z.boolean()["default"](false)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var results, totalRecords, _i, _b, tableName, options, result, error_7, db, error_8;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 10, , 11]);
                        results = [];
                        totalRecords = 0;
                        _i = 0, _b = input.tables;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _b.length)) return [3 /*break*/, 6];
                        tableName = _b[_i];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        options = {
                            table: tableName,
                            includeHeaders: input.includeHeaders,
                            delimiter: input.delimiter
                        };
                        return [4 /*yield*/, csvService_1.exportTableToCSV(options)];
                    case 3:
                        result = _c.sent();
                        results.push(result);
                        totalRecords += result.recordCount;
                        return [3 /*break*/, 5];
                    case 4:
                        error_7 = _c.sent();
                        results.push({
                            table: tableName,
                            error: error_7.message,
                            recordCount: 0,
                            columns: []
                        });
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [4 /*yield*/, db_1.getDb()];
                    case 7:
                        db = _c.sent();
                        if (!db) return [3 /*break*/, 9];
                        return [4 /*yield*/, db.insert(schema.exportJobs).values({
                                id: crypto.randomUUID(),
                                name: "Bulk CSV Export: " + input.tables.length + " tables",
                                type: 'bulk_csv',
                                status: 'completed',
                                recordCount: totalRecords,
                                config: JSON.stringify({
                                    tables: input.tables,
                                    createZip: input.createZip
                                }),
                                createdBy: ctx.user.id,
                                completedAt: new Date().toISOString()
                            })];
                    case 8:
                        _c.sent();
                        _c.label = 9;
                    case 9: return [2 /*return*/, {
                            success: true,
                            results: results,
                            summary: {
                                totalTables: input.tables.length,
                                successfulExports: results.filter(function (r) { return !('error' in r); }).length,
                                failedExports: results.filter(function (r) { return 'error' in r; }).length,
                                totalRecords: totalRecords
                            },
                            message: "Bulk export completed: " + results.filter(function (r) { return !('error' in r); }).length + " successful, " + results.filter(function (r) { return 'error' in r; }).length + " failed"
                        }];
                    case 10:
                        error_8 = _c.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Bulk export failed: " + error_8.message
                        });
                    case 11: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get CSV statistics
     */
    getStats: trpc_1.protectedProcedure
        .query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, totalExports, totalImports, exportStats, totalRecordsExported, recentOperations, error_9;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 7, , 8]);
                        return [4 /*yield*/, db.$count(schema.exportJobs, drizzle_orm_1.eq(schema.exportJobs.type, 'csv'))];
                    case 3:
                        totalExports = _c.sent();
                        return [4 /*yield*/, db.$count(schema.exportJobs, drizzle_orm_1.eq(schema.exportJobs.type, 'csv_import'))];
                    case 4:
                        totalImports = _c.sent();
                        return [4 /*yield*/, db
                                .select({ totalRecords: drizzle_orm_1.sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["SUM(", ")"], ["SUM(", ")"])), schema.exportJobs.recordCount) })
                                .from(schema.exportJobs)
                                .where(drizzle_orm_1.eq(schema.exportJobs.type, 'csv'))];
                    case 5:
                        exportStats = _c.sent();
                        totalRecordsExported = ((_b = exportStats[0]) === null || _b === void 0 ? void 0 : _b.totalRecords) || 0;
                        return [4 /*yield*/, db
                                .select()
                                .from(schema.exportJobs)
                                .where(drizzle_orm_1.sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["", " IN ('csv', 'csv_import')"], ["", " IN ('csv', 'csv_import')"])), schema.exportJobs.type))
                                .orderBy(drizzle_orm_1.sql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["", " DESC"], ["", " DESC"])), schema.exportJobs.createdAt))
                                .limit(10)];
                    case 6:
                        recentOperations = _c.sent();
                        return [2 /*return*/, {
                                totalExports: totalExports,
                                totalImports: totalImports,
                                totalRecordsExported: totalRecordsExported,
                                recentOperations: recentOperations
                            }];
                    case 7:
                        error_9 = _c.sent();
                        console.error('Failed to get CSV stats:', error_9);
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
csv.ts;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4;
