"use strict";
/**
 * Comprehensive CSV Import/Export Service
 * Handles dynamic CSV generation and parsing for all database tables
 */
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
exports.getAvailableCSVTables = exports.importCSVToTable = exports.exportTableToCSV = exports.generateCSVTemplate = void 0;
var db_1 = require("../db");
var server_1 = require("@trpc/server");
var schema = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
// Get all table schemas dynamically
var getAllTables = function () {
    var tables = [];
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
// Tables that should not be exported (sensitive/system data)
var EXCLUDED_EXPORT_TABLES = new Set([
    'backup_history',
    'backup_schedules',
    'user_sessions',
    'active_sessions',
    'system_logs',
    'security_events',
    'security_incidents',
    'api_keys',
    'webhooks',
    'audit_logs',
    'activity_log',
]);
// Sensitive columns that should be excluded from exports
var SENSITIVE_COLUMNS = new Set([
    'password',
    'passwordResetToken',
    'emailVerificationToken',
    'resetToken',
    'verificationToken',
    'apiKey',
    'secret',
    'webhookSecret',
    'accessToken',
    'refreshToken',
]);
/**
 * Generate CSV template for a table
 */
function generateCSVTemplate(tableName) {
    return __awaiter(this, void 0, Promise, function () {
        var tables, table, columns, safeColumns, headers, sampleData, sampleRows;
        return __generator(this, function (_a) {
            tables = getAllTables();
            table = tables.find(function (t) { return t.name === tableName; });
            if (!table) {
                throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Table '" + tableName + "' not found" });
            }
            columns = getTableColumns(table.schema);
            safeColumns = columns.filter(function (col) { return !SENSITIVE_COLUMNS.has(col.name); });
            headers = safeColumns.map(function (col) { return ({
                name: col.name,
                type: col.type,
                required: col.required,
                example: getColumnExample(col),
                description: getColumnDescription(col),
                "enum": col["enum"]
            }); });
            sampleData = [];
            // Add header row
            sampleData.push(headers.map(function (h) { return h.name; }));
            sampleRows = generateSampleData(headers);
            sampleData.push.apply(sampleData, sampleRows);
            return [2 /*return*/, {
                    table: tableName,
                    headers: headers,
                    sampleData: sampleData
                }];
        });
    });
}
exports.generateCSVTemplate = generateCSVTemplate;
/**
 * Export table data to CSV
 */
function exportTableToCSV(options) {
    return __awaiter(this, void 0, Promise, function () {
        var db, tableName, _a, filters, requestedColumns, _b, includeHeaders, _c, delimiter, _d, quoteChar, _e, escapeChar, tables, table, query_1, records, allColumns, safeColumns, exportColumns_1, lines_1, content, filename, error_1;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _f.sent();
                    if (!db) {
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
                    }
                    tableName = options.table, _a = options.filters, filters = _a === void 0 ? {} : _a, requestedColumns = options.columns, _b = options.includeHeaders, includeHeaders = _b === void 0 ? true : _b, _c = options.delimiter, delimiter = _c === void 0 ? ',' : _c, _d = options.quoteChar, quoteChar = _d === void 0 ? '"' : _d, _e = options.escapeChar, escapeChar = _e === void 0 ? '"' : _e;
                    tables = getAllTables();
                    table = tables.find(function (t) { return t.name === tableName; });
                    if (!table) {
                        throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Table '" + tableName + "' not found" });
                    }
                    if (EXCLUDED_EXPORT_TABLES.has(tableName)) {
                        throw new server_1.TRPCError({ code: "FORBIDDEN", message: "Table '" + tableName + "' cannot be exported" });
                    }
                    _f.label = 2;
                case 2:
                    _f.trys.push([2, 4, , 5]);
                    query_1 = db.select().from(table.schema);
                    // Apply filters
                    Object.entries(filters).forEach(function (_a) {
                        var key = _a[0], value = _a[1];
                        if (value !== undefined && value !== null && value !== '') {
                            // Simple equality filter for now
                            var column = table.schema[key];
                            if (column) {
                                query_1 = query_1.where(drizzle_orm_1.eq(column, value));
                            }
                        }
                    });
                    return [4 /*yield*/, query_1];
                case 3:
                    records = _f.sent();
                    if (records.length === 0) {
                        return [2 /*return*/, {
                                filename: tableName + "_export_" + Date.now() + ".csv",
                                content: includeHeaders ? getTableColumns(table.schema).map(function (c) { return c.name; }).join(delimiter) + '\n' : '',
                                recordCount: 0,
                                columns: []
                            }];
                    }
                    allColumns = getTableColumns(table.schema);
                    safeColumns = allColumns.filter(function (col) { return !SENSITIVE_COLUMNS.has(col.name); });
                    exportColumns_1 = requestedColumns
                        ? safeColumns.filter(function (col) { return requestedColumns.includes(col.name); })
                        : safeColumns;
                    lines_1 = [];
                    if (includeHeaders) {
                        lines_1.push(exportColumns_1.map(function (col) { return escapeCSVValue(col.name, delimiter, quoteChar, escapeChar); }).join(delimiter));
                    }
                    // Add data rows
                    records.forEach(function (record) {
                        var row = exportColumns_1.map(function (col) {
                            var value = record[col.name];
                            return escapeCSVValue(formatValue(value, col), delimiter, quoteChar, escapeChar);
                        });
                        lines_1.push(row.join(delimiter));
                    });
                    content = lines_1.join('\n');
                    filename = tableName + "_export_" + new Date().toISOString().split('T')[0] + "_" + Date.now() + ".csv";
                    return [2 /*return*/, {
                            filename: filename,
                            content: content,
                            recordCount: records.length,
                            columns: exportColumns_1.map(function (col) { return col.name; })
                        }];
                case 4:
                    error_1 = _f.sent();
                    throw new server_1.TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Export failed: " + error_1.message
                    });
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.exportTableToCSV = exportTableToCSV;
/**
 * Import CSV data into a table
 */
function importCSVToTable(options) {
    var _a;
    return __awaiter(this, void 0, Promise, function () {
        var db, tableName, data, _b, hasHeaders, _c, skipDuplicates, _d, updateExisting, _e, validateOnly, _f, delimiter, _g, quoteChar, _h, escapeChar, _j, columnMapping, result, tables, table, lines, headerLine, headers_1, tableColumns, columnMap_1, mappedColumns_1, _loop_1, i, error_2;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _k.sent();
                    if (!db) {
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
                    }
                    tableName = options.table, data = options.data, _b = options.hasHeaders, hasHeaders = _b === void 0 ? true : _b, _c = options.skipDuplicates, skipDuplicates = _c === void 0 ? true : _c, _d = options.updateExisting, updateExisting = _d === void 0 ? false : _d, _e = options.validateOnly, validateOnly = _e === void 0 ? false : _e, _f = options.delimiter, delimiter = _f === void 0 ? ',' : _f, _g = options.quoteChar, quoteChar = _g === void 0 ? '"' : _g, _h = options.escapeChar, escapeChar = _h === void 0 ? '"' : _h, _j = options.columnMapping, columnMapping = _j === void 0 ? {} : _j;
                    result = {
                        imported: 0,
                        skipped: 0,
                        errors: [],
                        validationErrors: []
                    };
                    tables = getAllTables();
                    table = tables.find(function (t) { return t.name === tableName; });
                    if (!table) {
                        throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Table '" + tableName + "' not found" });
                    }
                    _k.label = 2;
                case 2:
                    _k.trys.push([2, 7, , 8]);
                    lines = data.trim().split('\n');
                    if (lines.length === 0) {
                        throw new server_1.TRPCError({ code: "BAD_REQUEST", message: "CSV data is empty" });
                    }
                    headerLine = hasHeaders ? lines.shift() : null;
                    headers_1 = headerLine ? parseCSVLine(headerLine, delimiter, quoteChar, escapeChar) : [];
                    tableColumns = getTableColumns(table.schema);
                    columnMap_1 = new Map(tableColumns.map(function (col) { return [col.name, col]; }));
                    mappedColumns_1 = [];
                    if (hasHeaders) {
                        headers_1.forEach(function (header, index) {
                            var mappedName = columnMapping[header] || header;
                            var columnDef = columnMap_1.get(mappedName);
                            if (columnDef) {
                                mappedColumns_1.push({
                                    csvIndex: index,
                                    tableColumn: mappedName,
                                    columnDef: columnDef
                                });
                            }
                        });
                    }
                    else {
                        // Assume columns are in order
                        tableColumns.forEach(function (col, index) {
                            if (index < headers_1.length) {
                                mappedColumns_1.push({
                                    csvIndex: index,
                                    tableColumn: col.name,
                                    columnDef: col
                                });
                            }
                        });
                    }
                    if (mappedColumns_1.length === 0) {
                        throw new server_1.TRPCError({ code: "BAD_REQUEST", message: "No valid columns found in CSV" });
                    }
                    _loop_1 = function (i) {
                        var line, values_1, record_1, hasValidData_1, missingRequired, error_3, error_4;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    line = lines[i].trim();
                                    if (!line)
                                        return [2 /*return*/, "continue"];
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 11, , 12]);
                                    values_1 = parseCSVLine(line, delimiter, quoteChar, escapeChar);
                                    record_1 = {};
                                    hasValidData_1 = false;
                                    mappedColumns_1.forEach(function (_a) {
                                        var csvIndex = _a.csvIndex, tableColumn = _a.tableColumn, columnDef = _a.columnDef;
                                        if (csvIndex < values_1.length) {
                                            var rawValue = values_1[csvIndex];
                                            var parsedValue = parseValue(rawValue, columnDef);
                                            if (parsedValue !== null && parsedValue !== undefined && parsedValue !== '') {
                                                record_1[tableColumn] = parsedValue;
                                                hasValidData_1 = true;
                                            }
                                        }
                                    });
                                    if (!hasValidData_1) {
                                        result.errors.push({
                                            row: i + 1,
                                            message: 'Row contains no valid data',
                                            severity: 'warning'
                                        });
                                        return [2 /*return*/, "continue"];
                                    }
                                    missingRequired = mappedColumns_1
                                        .filter(function (_a) {
                                        var tableColumn = _a.tableColumn, columnDef = _a.columnDef;
                                        return columnDef.required && !record_1[tableColumn];
                                    })
                                        .map(function (_a) {
                                        var tableColumn = _a.tableColumn;
                                        return tableColumn;
                                    });
                                    if (missingRequired.length > 0) {
                                        result.errors.push({
                                            row: i + 1,
                                            message: "Missing required fields: " + missingRequired.join(', '),
                                            severity: 'error'
                                        });
                                        return [2 /*return*/, "continue"];
                                    }
                                    if (!!validateOnly) return [3 /*break*/, 9];
                                    _a.label = 2;
                                case 2:
                                    _a.trys.push([2, 7, , 8]);
                                    if (!(updateExisting && record_1.id)) return [3 /*break*/, 4];
                                    // Update existing record
                                    return [4 /*yield*/, db.update(table.schema)
                                            .set(record_1)
                                            .where(drizzle_orm_1.eq(table.schema.id, record_1.id))];
                                case 3:
                                    // Update existing record
                                    _a.sent();
                                    return [3 /*break*/, 6];
                                case 4: 
                                // Insert new record
                                return [4 /*yield*/, db.insert(table.schema).values(record_1)];
                                case 5:
                                    // Insert new record
                                    _a.sent();
                                    _a.label = 6;
                                case 6:
                                    result.imported++;
                                    return [3 /*break*/, 8];
                                case 7:
                                    error_3 = _a.sent();
                                    if (skipDuplicates && (error_3.code === 'ER_DUP_ENTRY' || ((_a = error_3.message) === null || _a === void 0 ? void 0 : _a.includes('Duplicate entry')))) {
                                        result.skipped++;
                                    }
                                    else {
                                        result.errors.push({
                                            row: i + 1,
                                            message: "Database error: " + error_3.message,
                                            severity: 'error'
                                        });
                                    }
                                    return [3 /*break*/, 8];
                                case 8: return [3 /*break*/, 10];
                                case 9:
                                    // Validation only - just count as imported
                                    result.imported++;
                                    _a.label = 10;
                                case 10: return [3 /*break*/, 12];
                                case 11:
                                    error_4 = _a.sent();
                                    result.errors.push({
                                        row: i + 1,
                                        message: "Parse error: " + error_4.message,
                                        severity: 'error'
                                    });
                                    return [3 /*break*/, 12];
                                case 12: return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _k.label = 3;
                case 3:
                    if (!(i < lines.length)) return [3 /*break*/, 6];
                    return [5 /*yield**/, _loop_1(i)];
                case 4:
                    _k.sent();
                    _k.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 3];
                case 6: return [2 /*return*/, result];
                case 7:
                    error_2 = _k.sent();
                    if (error_2 instanceof server_1.TRPCError)
                        throw error_2;
                    throw new server_1.TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Import failed: " + error_2.message
                    });
                case 8: return [2 /*return*/];
            }
        });
    });
}
exports.importCSVToTable = importCSVToTable;
/**
 * Get table columns from schema
 */
function getTableColumns(tableSchema) {
    var columns = [];
    if (tableSchema && typeof tableSchema === 'object') {
        Object.entries(tableSchema).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            if (value && typeof value === 'object' && 'columnType' in value) {
                columns.push({
                    name: key,
                    type: getColumnType(value),
                    required: !value.notNull || value.notNull === false ? false : !value["default"],
                    "enum": value.enumValues,
                    "default": value["default"]
                });
            }
        });
    }
    return columns;
}
/**
 * Get column type as string
 */
function getColumnType(columnDef) {
    if (columnDef.enumValues)
        return 'enum';
    if (columnDef.dataType)
        return columnDef.dataType;
    if (columnDef.columnType)
        return columnDef.columnType;
    return 'string';
}
/**
 * Generate example value for column
 */
function getColumnExample(column) {
    if (column["enum"] && column["enum"].length > 0) {
        return column["enum"][0];
    }
    switch (column.type) {
        case 'string':
        case 'varchar':
        case 'text':
            return 'Sample text';
        case 'number':
        case 'int':
        case 'bigint':
            return '123';
        case 'boolean':
        case 'tinyint':
            return '1';
        case 'date':
        case 'datetime':
        case 'timestamp':
            return '2024-01-15';
        case 'email':
            return 'user@example.com';
        default:
            return 'Sample value';
    }
}
/**
 * Get column description
 */
function getColumnDescription(column) {
    var descriptions = {
        id: 'Unique identifier',
        name: 'Display name',
        email: 'Email address',
        phone: 'Phone number',
        address: 'Physical address',
        status: 'Current status',
        createdAt: 'Creation timestamp',
        updatedAt: 'Last update timestamp'
    };
    return descriptions[column.name] || "" + column.name.replace(/([A-Z])/g, ' $1').toLowerCase();
}
/**
 * Generate sample data rows
 */
function generateSampleData(headers) {
    var sampleRows = [];
    // Generate 3 sample rows
    for (var i = 0; i < 3; i++) {
        var row = headers.map(function (header) {
            if (header.name === 'id')
                return uuid_1.v4().slice(0, 8);
            if (header.name === 'createdAt' || header.name === 'updatedAt') {
                return new Date().toISOString();
            }
            return header.example;
        });
        sampleRows.push(row);
    }
    return sampleRows;
}
/**
 * Parse CSV line handling quotes and escaping
 */
function parseCSVLine(line, delimiter, quoteChar, escapeChar) {
    var result = [];
    var current = '';
    var inQuotes = false;
    var i = 0;
    while (i < line.length) {
        var char = line[i];
        if (char === quoteChar) {
            if (inQuotes && line[i + 1] === quoteChar) {
                // Escaped quote
                current += quoteChar;
                i += 2;
            }
            else {
                // Toggle quote state
                inQuotes = !inQuotes;
                i++;
            }
        }
        else if (char === delimiter && !inQuotes) {
            // Field separator
            result.push(current);
            current = '';
            i++;
        }
        else {
            current += char;
            i++;
        }
    }
    result.push(current);
    return result;
}
/**
 * Escape CSV value
 */
function escapeCSVValue(value, delimiter, quoteChar, escapeChar) {
    if (value === null || value === undefined)
        return '';
    var str = String(value);
    // Check if value needs quoting
    if (str.includes(delimiter) || str.includes(quoteChar) || str.includes('\n') || str.includes('\r')) {
        // Escape quotes by doubling them
        var escaped = str.replace(new RegExp(quoteChar, 'g'), quoteChar + quoteChar);
        return quoteChar + escaped + quoteChar;
    }
    return str;
}
/**
 * Parse value based on column type
 */
function parseValue(value, column) {
    if (!value || value.trim() === '')
        return null;
    var trimmed = value.trim();
    switch (column.type) {
        case 'number':
        case 'int':
        case 'bigint':
            var num = Number(trimmed);
            return isNaN(num) ? null : num;
        case 'boolean':
        case 'tinyint':
            if (trimmed.toLowerCase() === 'true' || trimmed === '1')
                return true;
            if (trimmed.toLowerCase() === 'false' || trimmed === '0')
                return false;
            return null;
        case 'date':
        case 'datetime':
        case 'timestamp':
            var date = new Date(trimmed);
            return isNaN(date.getTime()) ? null : date.toISOString();
        case 'enum':
            return column["enum"] && column["enum"].includes(trimmed) ? trimmed : null;
        default:
            return trimmed;
    }
}
/**
 * Format value for CSV export
 */
function formatValue(value, column) {
    if (value === null || value === undefined)
        return '';
    switch (column.type) {
        case 'boolean':
        case 'tinyint':
            return value ? '1' : '0';
        case 'date':
        case 'datetime':
        case 'timestamp':
            if (value instanceof Date)
                return value.toISOString();
            if (typeof value === 'string')
                return value;
            return String(value);
        default:
            return String(value);
    }
}
/**
 * Get available tables for CSV operations
 */
function getAvailableCSVTables() {
    var tables = getAllTables();
    return tables
        .filter(function (table) { return !EXCLUDED_EXPORT_TABLES.has(table.name); })
        .map(function (table) { return ({
        name: table.name,
        description: getTableDescription(table.name),
        canImport: true,
        canExport: !EXCLUDED_EXPORT_TABLES.has(table.name)
    }); });
}
exports.getAvailableCSVTables = getAvailableCSVTables;
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
csvService.ts;
