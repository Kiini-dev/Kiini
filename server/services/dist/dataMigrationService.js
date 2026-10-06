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
exports.createDataMigrationService = exports.DataMigrationService = void 0;
var json2csv_1 = require("json2csv");
var XLSX = require("xlsx");
/**
 * DataMigrationService - Bulk import/export and data transformation
 * Supports CSV, Excel, and JSON formats with validation and error handling
 */
var DataMigrationService = /** @class */ (function () {
    function DataMigrationService(db) {
        this.validationRules = new Map();
        this.db = db;
    }
    /**
     * Register validation rules for an entity type
     */
    DataMigrationService.prototype.registerValidationRules = function (entityType, rules) {
        this.validationRules.set(entityType, rules);
    };
    /**
     * Parse CSV file
     */
    DataMigrationService.prototype.parseCSV = function (fileContent) {
        return __awaiter(this, void 0, Promise, function () {
            var lines, headers, data, _loop_1, i;
            return __generator(this, function (_a) {
                lines = fileContent.trim().split('\n');
                if (lines.length < 1)
                    return [2 /*return*/, []];
                headers = lines[0].split(',').map(function (h) { return h.trim(); });
                data = [];
                _loop_1 = function (i) {
                    var values = lines[i].split(',').map(function (v) { return v.trim(); });
                    var record = {};
                    headers.forEach(function (header, index) {
                        record[header] = values[index] || null;
                    });
                    data.push(record);
                };
                for (i = 1; i < lines.length; i++) {
                    _loop_1(i);
                }
                return [2 /*return*/, data];
            });
        });
    };
    /**
     * Parse Excel file
     */
    DataMigrationService.prototype.parseExcel = function (fileBuffer, sheetName) {
        return __awaiter(this, void 0, Promise, function () {
            var workbook, sheet;
            return __generator(this, function (_a) {
                workbook = XLSX.read(fileBuffer, { type: 'buffer' });
                sheet = sheetName ? workbook.Sheets[sheetName] : workbook.Sheets[workbook.SheetNames[0]];
                if (!sheet) {
                    throw new Error('Sheet not found');
                }
                return [2 /*return*/, XLSX.utils.sheet_to_json(sheet)];
            });
        });
    };
    /**
     * Parse JSON data
     */
    DataMigrationService.prototype.parseJSON = function (jsonContent) {
        return __awaiter(this, void 0, Promise, function () {
            var data;
            return __generator(this, function (_a) {
                try {
                    data = JSON.parse(jsonContent);
                    return [2 /*return*/, Array.isArray(data) ? data : [data]];
                }
                catch (error) {
                    throw new Error("Invalid JSON: " + error.message);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Validate a record against rules
     */
    DataMigrationService.prototype.validateRecord = function (entityType, record, recordIndex) {
        var rules = this.validationRules.get(entityType) || [];
        var errors = [];
        var warnings = [];
        for (var _i = 0, rules_1 = rules; _i < rules_1.length; _i++) {
            var rule = rules_1[_i];
            var value = record[rule.field];
            // Check required fields
            if (rule.required && (value === null || value === undefined || value === '')) {
                errors.push("Field '" + rule.field + "' is required (row " + recordIndex + ")");
                continue;
            }
            if (value === null || value === undefined || value === '') {
                continue;
            }
            // Type validation
            switch (rule.type) {
                case 'string':
                    if (typeof value !== 'string') {
                        errors.push("Field '" + rule.field + "' must be a string (row " + recordIndex + ")");
                    }
                    else {
                        if (rule.minLength && value.length < rule.minLength) {
                            errors.push("Field '" + rule.field + "' must be at least " + rule.minLength + " characters (row " + recordIndex + ")");
                        }
                        if (rule.maxLength && value.length > rule.maxLength) {
                            errors.push("Field '" + rule.field + "' must be at most " + rule.maxLength + " characters (row " + recordIndex + ")");
                        }
                    }
                    break;
                case 'number':
                    if (isNaN(Number(value))) {
                        errors.push("Field '" + rule.field + "' must be a number (row " + recordIndex + ")");
                    }
                    break;
                case 'date':
                    if (isNaN(new Date(value).getTime())) {
                        errors.push("Field '" + rule.field + "' must be a valid date (row " + recordIndex + ")");
                    }
                    break;
                case 'email':
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                        errors.push("Field '" + rule.field + "' must be a valid email (row " + recordIndex + ")");
                    }
                    break;
                case 'phone':
                    if (!/^[\d\s\-\+\(\)]+$/.test(value) || value.length < 10) {
                        errors.push("Field '" + rule.field + "' must be a valid phone number (row " + recordIndex + ")");
                    }
                    break;
                case 'enum':
                    if (rule.enumValues && !rule.enumValues.includes(value)) {
                        errors.push("Field '" + rule.field + "' must be one of: " + rule.enumValues.join(', ') + " (row " + recordIndex + ")");
                    }
                    break;
            }
            // Pattern validation
            if (rule.pattern && !rule.pattern.test(String(value))) {
                errors.push("Field '" + rule.field + "' format is invalid (row " + recordIndex + ")");
            }
            // Custom validation
            if (rule.customValidator && !rule.customValidator(value)) {
                errors.push("Field '" + rule.field + "' failed custom validation (row " + recordIndex + ")");
            }
        }
        return {
            isValid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };
    };
    /**
     * Import data with validation
     */
    DataMigrationService.prototype.importData = function (entityType, data, processor, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, Promise, function () {
            var startTime, result, batchSize, _loop_2, this_1, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        result = {
                            totalRecords: data.length,
                            successfulRecords: 0,
                            failedRecords: 0,
                            errors: [],
                            warnings: [],
                            duration: 0
                        };
                        batchSize = options.batchSize || 100;
                        _loop_2 = function (i) {
                            var record, validation, error_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        record = data[i];
                                        // Validate record
                                        if (!options.skipValidation) {
                                            validation = this_1.validateRecord(entityType, record, i + 1);
                                            if (!validation.isValid) {
                                                result.failedRecords++;
                                                validation.errors.forEach(function (error) {
                                                    result.errors.push({ recordIndex: i + 1, error: error });
                                                });
                                                return [2 /*return*/, "continue"];
                                            }
                                            validation.warnings.forEach(function (warning) {
                                                result.warnings.push({ recordIndex: i + 1, warning: warning });
                                            });
                                        }
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([1, 3, , 4]);
                                        // Process record
                                        return [4 /*yield*/, processor(record)];
                                    case 2:
                                        // Process record
                                        _a.sent();
                                        result.successfulRecords++;
                                        return [3 /*break*/, 4];
                                    case 3:
                                        error_1 = _a.sent();
                                        result.failedRecords++;
                                        result.errors.push({
                                            recordIndex: i + 1,
                                            error: error_1.message
                                        });
                                        return [3 /*break*/, 4];
                                    case 4:
                                        // Batch processing
                                        if ((i + 1) % batchSize === 0) {
                                            console.log("Processed " + (i + 1) + "/" + data.length + " records...");
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < data.length)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_2(i)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        result.duration = Date.now() - startTime;
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Export data to format
     */
    DataMigrationService.prototype.exportData = function (data, options) {
        if (options === void 0) { options = { format: 'csv' }; }
        return __awaiter(this, void 0, Promise, function () {
            var parser, worksheet, workbook, buffer;
            return __generator(this, function (_a) {
                if (data.length === 0) {
                    return [2 /*return*/, options.format === 'json' ? '[]' : ''];
                }
                switch (options.format) {
                    case 'csv': {
                        try {
                            parser = new json2csv_1.Parser();
                            return [2 /*return*/, parser.parse(data)];
                        }
                        catch (error) {
                            throw new Error("CSV export failed: " + error.message);
                        }
                    }
                    case 'xlsx': {
                        try {
                            worksheet = XLSX.utils.json_to_sheet(data);
                            workbook = XLSX.utils.book_new();
                            XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
                            buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
                            return [2 /*return*/, buffer];
                        }
                        catch (error) {
                            throw new Error("Excel export failed: " + error.message);
                        }
                    }
                    case 'json': {
                        return [2 /*return*/, JSON.stringify(data, null, 2)];
                    }
                    default:
                        throw new Error("Unsupported export format: " + options.format);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Generate migration report
     */
    DataMigrationService.prototype.generateMigrationReport = function (result) {
        var report = ("\n=== DATA MIGRATION REPORT ===\nTotal Records: " + result.totalRecords + "\nSuccessful: " + result.successfulRecords + "\nFailed: " + result.failedRecords + "\nSuccess Rate: " + ((result.successfulRecords / result.totalRecords) * 100).toFixed(2) + "%\nDuration: " + (result.duration / 1000).toFixed(2) + "s\n\nERRORS (" + result.errors.length + "):\n" + result.errors.map(function (e) { return "  Row " + e.recordIndex + ": " + e.error; }).join('\n') + "\n\nWARNINGS (" + result.warnings.length + "):\n" + result.warnings.map(function (w) { return "  Row " + w.recordIndex + ": " + w.warning; }).join('\n') + "\n    ").trim();
        return report;
    };
    return DataMigrationService;
}());
exports.DataMigrationService = DataMigrationService;
exports.createDataMigrationService = function (db) { return new DataMigrationService(db); };
