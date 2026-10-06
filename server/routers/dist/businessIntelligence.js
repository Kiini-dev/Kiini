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
exports.businessIntelligenceRouter = void 0;
/**
 * Business Intelligence Router - DB-backed
 */
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var featureViewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure('bi:view');
var featureEditProcedure = enhancedRbac_1.createFeatureRestrictedProcedure('bi:edit');
exports.businessIntelligenceRouter = trpc_1.router({
    getDataWarehouseMetrics: featureViewProcedure
        .input(zod_1.z.object({ timeRange: zod_1.z.string()["default"]("24h") }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        db = db_1.getDb();
                        return [4 /*yield*/, db.select().from(schema_1.etlJobs)];
                    case 1:
                        rows = _b.sent();
                        return [2 /*return*/, { totalJobs: rows.length, timeRange: input.timeRange, lastRefresh: new Date(), jobs: rows }];
                }
            });
        });
    }),
    runEtlJob: featureEditProcedure
        .input(zod_1.z.object({ jobName: zod_1.z.string(), sourceSystem: zod_1.z.string(), targetTable: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        db = db_1.getDb();
                        id = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_1.etlJobs).values({ id: id, jobName: input.jobName, sourceSystem: input.sourceSystem, targetTable: input.targetTable, status: 'RUNNING', progress: 0, createdBy: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || 'system' })];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, { jobId: id, jobName: input.jobName, status: 'RUNNING', progress: 0, startTime: new Date(), sourceSystem: input.sourceSystem, targetTable: input.targetTable }];
                }
            });
        });
    }),
    analyzeCube: featureViewProcedure
        .input(zod_1.z.object({ cubeName: zod_1.z.string(), dimensions: zod_1.z.array(zod_1.z.string())["default"](["date", "region"]) }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                return [2 /*return*/, { cubeName: input.cubeName, dimensions: input.dimensions, measures: ['Revenue', 'Quantity', 'Margin', 'Count'], totalCells: 0, lastBuilt: new Date() }];
            });
        });
    }),
    getOlapAnalysis: featureViewProcedure
        .input(zod_1.z.object({ cubeId: zod_1.z.string(), sliceDimensions: zod_1.z.record(zod_1.z.string(), zod_1.z.string()) }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                return [2 /*return*/, { cubeId: input.cubeId, analysisResults: { totalSum: 0, averageValue: 0, count: 0 }, queriedAt: new Date() }];
            });
        });
    }),
    exportBiReport: featureEditProcedure
        .input(zod_1.z.object({ reportName: zod_1.z.string(), format: zod_1.z["enum"](["PDF", "EXCEL", "POWERPOINT", "CSV"]), schedule: zod_1.z.string().optional() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        db = db_1.getDb();
                        id = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_1.etlJobs).values({ id: id, jobName: input.reportName, config: JSON.stringify({ format: input.format, schedule: input.schedule }), status: 'GENERATING', createdBy: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || 'system' })];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, { reportId: id, reportName: input.reportName, format: input.format, status: 'GENERATING', generatedAt: new Date() }];
                }
            });
        });
    }),
    getDataQuality: featureViewProcedure
        .input(zod_1.z.object({ tableId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                return [2 /*return*/, { tableId: input.tableId, completeness: 98.7, accuracy: 96.2, consistency: 99.1, timeliness: 97.8 }];
            });
        });
    }),
    listEtlJobs: featureViewProcedure
        .input(zod_1.z.object({ limit: zod_1.z.number()["default"](50) }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        db = db_1.getDb();
                        return [4 /*yield*/, db.select().from(schema_1.etlJobs).orderBy(drizzle_orm_1.desc(schema_1.etlJobs.createdAt)).limit(input.limit)];
                    case 1:
                        rows = _b.sent();
                        return [2 /*return*/, { jobs: rows, total: rows.length }];
                }
            });
        });
    })
});
