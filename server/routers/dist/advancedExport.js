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
exports.advancedExportRouter = void 0;
/**
 * Advanced Data Export Router - DB-backed
 */
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var exportViewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure('export:view');
var exportEditProcedure = enhancedRbac_1.createFeatureRestrictedProcedure('export:edit');
exports.advancedExportRouter = trpc_1.router({
    exportData: exportEditProcedure
        .input(zod_1.z.object({
        dataType: zod_1.z["enum"](['invoices', 'clients', 'payments', 'employees', 'all']),
        format: zod_1.z["enum"](['csv', 'excel', 'json', 'xml', 'pdf']),
        dateRange: zod_1.z.object({ start: zod_1.z.string(), end: zod_1.z.string() }).optional(),
        includeRelated: zod_1.z.boolean().optional(),
        anonymize: zod_1.z.boolean().optional()
    }))
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
                        return [4 /*yield*/, db.insert(schema_1.exportJobs).values({
                                id: id,
                                dataType: input.dataType,
                                format: input.format,
                                filters: input.dateRange ? JSON.stringify({ dateRange: input.dateRange, includeRelated: input.includeRelated, anonymize: input.anonymize }) : null,
                                status: 'processing',
                                createdBy: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || 'system'
                            })];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, { success: true, exportId: id, dataType: input.dataType, format: input.format, status: 'processing', estimatedRows: 0, estimatedCompletion: new Date(Date.now() + 30000) }];
                }
            });
        });
    }),
    getExportStatus: exportViewProcedure
        .input(zod_1.z.object({ exportId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rows, job;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        db = db_1.getDb();
                        return [4 /*yield*/, db.select().from(schema_1.exportJobs).where(drizzle_orm_1.eq(schema_1.exportJobs.id, input.exportId))];
                    case 1:
                        rows = _b.sent();
                        job = rows[0];
                        if (!job)
                            return [2 /*return*/, { exportId: input.exportId, status: 'not_found' }];
                        return [2 /*return*/, { exportId: job.id, status: job.status, dataType: job.dataType, format: job.format, rowsExported: job.rowsExported, fileSize: job.fileSize, fileUrl: job.fileUrl, expiresAt: job.expiresAt, createdAt: job.createdAt }];
                }
            });
        });
    }),
    scheduleRecurringExport: exportEditProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string(),
        dataType: zod_1.z.string(),
        format: zod_1.z.string(),
        schedule: zod_1.z["enum"](['daily', 'weekly', 'monthly']),
        recipients: zod_1.z.array(zod_1.z.string())
    }))
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
                        return [4 /*yield*/, db.insert(schema_1.exportJobs).values({
                                id: id,
                                name: input.name,
                                dataType: input.dataType,
                                format: input.format,
                                schedule: input.schedule,
                                recipients: JSON.stringify(input.recipients),
                                status: 'scheduled',
                                createdBy: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || 'system'
                            })];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, { success: true, scheduleId: id, name: input.name, schedule: input.schedule, status: 'scheduled', nextRun: new Date(Date.now() + 86400000) }];
                }
            });
        });
    }),
    listExports: exportViewProcedure
        .input(zod_1.z.object({ limit: zod_1.z.number()["default"](50) }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        db = db_1.getDb();
                        return [4 /*yield*/, db.select().from(schema_1.exportJobs).orderBy(drizzle_orm_1.desc(schema_1.exportJobs.createdAt)).limit(input.limit)];
                    case 1:
                        rows = _b.sent();
                        return [2 /*return*/, { exports: rows, total: rows.length }];
                }
            });
        });
    })
});
