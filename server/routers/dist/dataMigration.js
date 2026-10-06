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
exports.dataMigrationRouter = void 0;
var zod_1 = require("zod");
var server_1 = require("@trpc/server");
var trpc_1 = require("../_core/trpc");
var trpc_2 = require("../_core/trpc");
var dataMigrationService_1 = require("../services/dataMigrationService");
var db_1 = require("../db");
var dataMigrationService = dataMigrationService_1.createDataMigrationService(db_1.getDb());
// Validation schemas
var ImportSchema = zod_1.z.object({
    entityType: zod_1.z.string().min(1, 'Entity type is required'),
    format: zod_1.z["enum"](['csv', 'xlsx', 'json']),
    data: zod_1.z.string().or(zod_1.z["instanceof"](Buffer)),
    options: zod_1.z
        .object({
        skipValidation: zod_1.z.boolean().optional(),
        skipDuplicates: zod_1.z.boolean().optional(),
        updateIfExists: zod_1.z.boolean().optional(),
        batchSize: zod_1.z.number().min(1).max(1000).optional()
    })
        .optional()
});
var ExportSchema = zod_1.z.object({
    entityType: zod_1.z.string().min(1),
    format: zod_1.z["enum"](['csv', 'xlsx', 'json']),
    filters: zod_1.z.record(zod_1.z.any()).optional()
});
var ValidationRuleSchema = zod_1.z.object({
    field: zod_1.z.string().min(1),
    type: zod_1.z["enum"](['string', 'number', 'date', 'email', 'phone', 'enum']),
    required: zod_1.z.boolean().optional(),
    pattern: zod_1.z.string().optional(),
    minLength: zod_1.z.number().optional(),
    maxLength: zod_1.z.number().optional(),
    enumValues: zod_1.z.array(zod_1.z.string()).optional()
});
exports.dataMigrationRouter = trpc_2.router({
    /**
     * Register validation rules for an entity type
     */
    registerValidationRules: trpc_1.createFeatureRestrictedProcedure('data-migration:write')
        .input(zod_1.z.object({
        entityType: zod_1.z.string().min(1),
        rules: zod_1.z.array(ValidationRuleSchema)
    }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                try {
                    dataMigrationService.registerValidationRules(input.entityType, input.rules);
                    return [2 /*return*/, {
                            success: true,
                            message: "Validation rules registered for " + input.entityType
                        }];
                }
                catch (error) {
                    throw new server_1.TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: "Failed to register validation rules: " + error.message
                    });
                }
                return [2 /*return*/];
            });
        });
    }),
    /**
     * Import data from file (CSV, Excel, or JSON)
     */
    importData: trpc_1.createFeatureRestrictedProcedure('data-migration:write')
        .input(ImportSchema)
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var parsedData, content, buffer, content, processor, result, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 8, , 9]);
                        parsedData = void 0;
                        if (!(input.format === 'csv')) return [3 /*break*/, 2];
                        content = typeof input.data === 'string' ? input.data : input.data.toString();
                        return [4 /*yield*/, dataMigrationService.parseCSV(content)];
                    case 1:
                        parsedData = _b.sent();
                        return [3 /*break*/, 6];
                    case 2:
                        if (!(input.format === 'xlsx')) return [3 /*break*/, 4];
                        buffer = typeof input.data === 'string' ? Buffer.from(input.data) : input.data;
                        return [4 /*yield*/, dataMigrationService.parseExcel(buffer)];
                    case 3:
                        parsedData = _b.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        content = typeof input.data === 'string' ? input.data : input.data.toString();
                        return [4 /*yield*/, dataMigrationService.parseJSON(content)];
                    case 5:
                        parsedData = _b.sent();
                        _b.label = 6;
                    case 6:
                        if (parsedData.length === 0) {
                            throw new server_1.TRPCError({
                                code: 'BAD_REQUEST',
                                message: 'No data found in file'
                            });
                        }
                        processor = function (record) { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                // TODO: Implement entity-specific processor
                                // For now, just validate the record
                                console.log("Processing " + input.entityType + ":", record);
                                return [2 /*return*/];
                            });
                        }); };
                        return [4 /*yield*/, dataMigrationService.importData(input.entityType, parsedData, processor, input.options || {})];
                    case 7:
                        result = _b.sent();
                        return [2 /*return*/, __assign(__assign({}, result), { report: dataMigrationService.generateMigrationReport(result), success: result.failedRecords === 0 })];
                    case 8:
                        error_1 = _b.sent();
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: "Failed to import data: " + error_1.message
                        });
                    case 9: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Export data to file (CSV, Excel, or JSON)
     */
    exportData: trpc_1.createFeatureRestrictedProcedure('data-migration:read')
        .input(ExportSchema)
        .query(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var mockData, exportOptions, exportedData, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        mockData = [
                            { id: '1', name: 'Sample 1', value: 100 },
                            { id: '2', name: 'Sample 2', value: 200 },
                        ];
                        exportOptions = {
                            format: input.format,
                            includeMetadata: true
                        };
                        return [4 /*yield*/, dataMigrationService.exportData(mockData, exportOptions)];
                    case 1:
                        exportedData = _b.sent();
                        return [2 /*return*/, {
                                data: typeof exportedData === 'string' ? exportedData : exportedData.toString('base64'),
                                format: input.format,
                                recordCount: mockData.length,
                                success: true,
                                message: "Exported " + mockData.length + " records as " + input.format.toUpperCase()
                            }];
                    case 2:
                        error_2 = _b.sent();
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: "Failed to export data: " + error_2.message
                        });
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Preview import data without saving
     */
    previewImport: trpc_1.createFeatureRestrictedProcedure('data-migration:read')
        .input(zod_1.z.object({
        entityType: zod_1.z.string().min(1),
        format: zod_1.z["enum"](['csv', 'xlsx', 'json']),
        data: zod_1.z.string(),
        limit: zod_1.z.number().min(1).max(100)["default"](10)
    }))
        .query(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var parsedData, previewRecords, validRecords, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 7, , 8]);
                        parsedData = void 0;
                        if (!(input.format === 'csv')) return [3 /*break*/, 2];
                        return [4 /*yield*/, dataMigrationService.parseCSV(input.data)];
                    case 1:
                        parsedData = _b.sent();
                        return [3 /*break*/, 6];
                    case 2:
                        if (!(input.format === 'xlsx')) return [3 /*break*/, 4];
                        return [4 /*yield*/, dataMigrationService.parseExcel(Buffer.from(input.data))];
                    case 3:
                        parsedData = _b.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, dataMigrationService.parseJSON(input.data)];
                    case 5:
                        parsedData = _b.sent();
                        _b.label = 6;
                    case 6:
                        previewRecords = parsedData.slice(0, input.limit).map(function (record, index) {
                            var validation = dataMigrationService.validateRecord(input.entityType, record, index + 1);
                            return {
                                record: record,
                                isValid: validation.isValid,
                                errors: validation.errors,
                                warnings: validation.warnings
                            };
                        });
                        validRecords = previewRecords.filter(function (p) { return p.isValid; }).length;
                        return [2 /*return*/, {
                                totalRecords: parsedData.length,
                                previewRecords: previewRecords,
                                validRecords: validRecords,
                                invalidRecords: previewRecords.length - validRecords,
                                estimatedSuccess: parsedData.length > 0
                                    ? Math.round((validRecords / previewRecords.length) * 100)
                                    : 0,
                                success: true
                            }];
                    case 7:
                        error_3 = _b.sent();
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: "Failed to preview import: " + error_3.message
                        });
                    case 8: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get import/export history
     */
    getMigrationHistory: trpc_1.createFeatureRestrictedProcedure('data-migration:read')
        .input(zod_1.z.object({
        limit: zod_1.z.number().min(1).max(100)["default"](20),
        offset: zod_1.z.number().min(0)["default"](0)
    }))
        .query(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                try {
                    // TODO: Query migration history from database
                    // const history = await db.query.migrationHistory.findMany({
                    //   where: eq(migrationHistory.organizationId, ctx.user.organizationId),
                    //   orderBy: desc(migrationHistory.createdAt),
                    //   limit: input.limit,
                    //   offset: input.offset,
                    // });
                    return [2 /*return*/, {
                            history: [],
                            total: 0,
                            limit: input.limit,
                            offset: input.offset,
                            success: true
                        }];
                }
                catch (error) {
                    throw new server_1.TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: "Failed to fetch migration history: " + error.message
                    });
                }
                return [2 /*return*/];
            });
        });
    })
});
