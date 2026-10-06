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
exports.enterpriseSecurityRouter = void 0;
/**
 * Enterprise Security Router - DB-backed
 */
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
exports.enterpriseSecurityRouter = trpc_1.router({
    detectThreats: trpc_1.featureEditProcedure
        .input(zod_1.z.object({ scanType: zod_1.z["enum"](['full', 'quick', 'targeted'])["default"]('quick'), target: zod_1.z.string().optional() }))
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
                        return [4 /*yield*/, db.insert(schema_1.securityIncidents).values({ id: id, type: 'threat_detection', severity: 'medium', title: "Threat scan: " + input.scanType, description: input.scanType + " scan" + (input.target ? " targeting " + input.target : ''), status: 'investigating', detectedBy: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || 'system' })];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, { success: true, scanId: id, scanType: input.scanType, threatsFound: 0, status: 'scanning', startedAt: new Date() }];
                }
            });
        });
    }),
    performVulnerabilityScan: trpc_1.featureEditProcedure
        .input(zod_1.z.object({ scope: zod_1.z["enum"](['application', 'infrastructure', 'network', 'full'])["default"]('application'), priority: zod_1.z["enum"](['low', 'medium', 'high', 'critical'])["default"]('medium') }))
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
                        return [4 /*yield*/, db.insert(schema_1.securityIncidents).values({ id: id, type: 'vulnerability_scan', severity: input.priority, title: "Vulnerability scan: " + input.scope, description: "Scope: " + input.scope + ", Priority: " + input.priority, status: 'investigating', detectedBy: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || 'system' })];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, { success: true, scanId: id, scope: input.scope, vulnerabilitiesFound: 0, status: 'scanning', startedAt: new Date() }];
                }
            });
        });
    }),
    conductPenTesting: trpc_1.featureEditProcedure
        .input(zod_1.z.object({ testType: zod_1.z["enum"](['black-box', 'white-box', 'grey-box'])["default"]('grey-box'), targetSystems: zod_1.z.array(zod_1.z.string()).optional() }))
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
                        return [4 /*yield*/, db.insert(schema_1.securityIncidents).values({ id: id, type: 'pen_test', severity: 'high', title: "Pen test: " + input.testType, description: JSON.stringify({ testType: input.testType, targets: input.targetSystems }), status: 'investigating', detectedBy: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || 'system' })];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, { success: true, testId: id, testType: input.testType, status: 'in-progress', startedAt: new Date() }];
                }
            });
        });
    }),
    listSecurityIncidents: trpc_1.featureViewProcedure
        .input(zod_1.z.object({ limit: zod_1.z.number()["default"](50), severity: zod_1.z.string().optional() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, query, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        db = db_1.getDb();
                        query = db.select().from(schema_1.securityIncidents).orderBy(drizzle_orm_1.desc(schema_1.securityIncidents.createdAt)).limit(input.limit);
                        if (input.severity) {
                            query = db.select().from(schema_1.securityIncidents).where(drizzle_orm_1.eq(schema_1.securityIncidents.severity, input.severity)).orderBy(drizzle_orm_1.desc(schema_1.securityIncidents.createdAt)).limit(input.limit);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        rows = _b.sent();
                        return [2 /*return*/, { incidents: rows, total: rows.length }];
                }
            });
        });
    }),
    resolveIncident: trpc_1.featureEditProcedure
        .input(zod_1.z.object({ incidentId: zod_1.z.string(), resolution: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        db = db_1.getDb();
                        return [4 /*yield*/, db.update(schema_1.securityIncidents).set({ status: 'resolved', resolution: input.resolution, resolvedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) }).where(drizzle_orm_1.eq(schema_1.securityIncidents.id, input.incidentId))];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, { success: true, incidentId: input.incidentId, status: 'resolved' }];
                }
            });
        });
    })
});
