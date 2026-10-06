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
exports.performanceScalingRouter = void 0;
/**
 * Performance Scaling Router - DB-backed
 */
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
exports.performanceScalingRouter = trpc_1.router({
    configureAutoScaling: trpc_1.featureEditProcedure
        .input(zod_1.z.object({ minInstances: zod_1.z.number()["default"](1), maxInstances: zod_1.z.number()["default"](10), targetCpu: zod_1.z.number()["default"](70), targetMemory: zod_1.z.number()["default"](80) }))
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
                        return [4 /*yield*/, db.insert(schema_1.perfConfigs).values({ id: id, configType: 'auto_scaling', name: 'scaling_policy', strategy: 'auto_scale', config: JSON.stringify(input), status: 'ACTIVE', createdBy: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || 'system' })];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, { success: true, configId: id, minInstances: input.minInstances, maxInstances: input.maxInstances, configuredAt: new Date() }];
                }
            });
        });
    }),
    configureLoadBalancing: trpc_1.featureEditProcedure
        .input(zod_1.z.object({ algorithm: zod_1.z["enum"](['round-robin', 'least-connections', 'ip-hash', 'weighted'])["default"]('round-robin'), healthCheck: zod_1.z.boolean()["default"](true), healthCheckInterval: zod_1.z.number()["default"](30) }))
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
                        return [4 /*yield*/, db.insert(schema_1.perfConfigs).values({ id: id, configType: 'load_balancing', name: "lb_" + input.algorithm, strategy: input.algorithm, config: JSON.stringify(input), status: 'ACTIVE', createdBy: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || 'system' })];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, { success: true, configId: id, algorithm: input.algorithm, healthCheck: input.healthCheck, configuredAt: new Date() }];
                }
            });
        });
    }),
    getScalingMetrics: trpc_1.featureViewProcedure
        .input(zod_1.z.object({ timeRange: zod_1.z["enum"](['1h', '6h', '24h', '7d'])["default"]('24h') }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                return [2 /*return*/, { timeRange: input.timeRange, metrics: { currentInstances: 3, avgCpu: 45, avgMemory: 62, requestsPerSecond: 1500, avgLatency: 32, scalingEvents: 2 }, timestamp: new Date() }];
            });
        });
    }),
    listScalingConfigs: trpc_1.featureViewProcedure
        .input(zod_1.z.object({ configType: zod_1.z.string().optional(), limit: zod_1.z.number()["default"](50) }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, query, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        db = db_1.getDb();
                        if (input.configType) {
                            query = db.select().from(schema_1.perfConfigs).where(drizzle_orm_1.eq(schema_1.perfConfigs.configType, input.configType)).orderBy(drizzle_orm_1.desc(schema_1.perfConfigs.createdAt)).limit(input.limit);
                        }
                        else {
                            query = db.select().from(schema_1.perfConfigs).orderBy(drizzle_orm_1.desc(schema_1.perfConfigs.createdAt)).limit(input.limit);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        rows = _b.sent();
                        return [2 /*return*/, { configs: rows.map(function (r) { return (__assign(__assign({}, r), { config: r.config ? JSON.parse(r.config) : null })); }), total: rows.length }];
                }
            });
        });
    })
});
