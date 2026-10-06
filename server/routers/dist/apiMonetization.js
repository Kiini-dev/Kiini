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
exports.apiMonetizationRouter = void 0;
/**
 * API Monetization Router - DB-backed
 */
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var featureViewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure('api:view');
var featureEditProcedure = enhancedRbac_1.createFeatureRestrictedProcedure('api:edit');
exports.apiMonetizationRouter = trpc_1.router({
    listApiMarketplace: featureViewProcedure
        .input(zod_1.z.object({ category: zod_1.z.string().optional(), limit: zod_1.z.number()["default"](20) }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        db = db_1.getDb();
                        return [4 /*yield*/, db.select().from(schema_1.apiPricingConfigs).orderBy(drizzle_orm_1.desc(schema_1.apiPricingConfigs.createdAt)).limit(input.limit)];
                    case 1:
                        rows = _b.sent();
                        return [2 /*return*/, { totalApis: rows.length, apis: rows.map(function (r) { return ({ id: r.id, name: r.name, pricingModel: r.pricingModel, basePrice: r.basePrice, status: r.status }); }) }];
                }
            });
        });
    }),
    configureApiPricing: featureEditProcedure
        .input(zod_1.z.object({ apiId: zod_1.z.string(), pricingModel: zod_1.z["enum"](["FIXED", "USAGE_BASED", "TIERED"]), basePrice: zod_1.z.number().optional() }))
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
                        return [4 /*yield*/, db.insert(schema_1.apiPricingConfigs).values({ id: id, apiId: input.apiId, name: 'API ' + input.apiId, pricingModel: input.pricingModel, basePrice: String(input.basePrice || 99), currency: 'USD', rateLimit: 10000, status: 'ACTIVE', createdBy: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || 'system' })];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, { priceConfigId: id, apiId: input.apiId, pricingModel: input.pricingModel, basePrice: input.basePrice || 99, currency: 'USD', status: 'ACTIVE', effectiveDate: new Date() }];
                }
            });
        });
    }),
    trackUsageMetrics: featureViewProcedure
        .input(zod_1.z.object({ apiId: zod_1.z.string(), timeRange: zod_1.z.string()["default"]("30d") }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rows, cfg;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        db = db_1.getDb();
                        return [4 /*yield*/, db.select().from(schema_1.apiPricingConfigs).where(drizzle_orm_1.eq(schema_1.apiPricingConfigs.apiId, input.apiId))];
                    case 1:
                        rows = _b.sent();
                        cfg = rows[0];
                        return [2 /*return*/, { apiId: input.apiId, timeRange: input.timeRange, totalRequests: 0, successfulRequests: 0, failedRequests: 0, errorRate: 0, avgResponseTime: 0, uniqueConsumers: 0, config: cfg || null }];
                }
            });
        });
    }),
    generateBillingReport: featureViewProcedure
        .input(zod_1.z.object({ period: zod_1.z.string(), format: zod_1.z["enum"](["JSON", "CSV", "PDF"])["default"]("JSON") }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        db = db_1.getDb();
                        return [4 /*yield*/, db.select().from(schema_1.apiPricingConfigs).where(drizzle_orm_1.eq(schema_1.apiPricingConfigs.status, 'ACTIVE'))];
                    case 1:
                        rows = _b.sent();
                        return [2 /*return*/, { reportId: uuid_1.v4(), period: input.period, format: input.format, generatedAt: new Date(), totalApis: rows.length, apis: rows.map(function (r) { return ({ name: r.name, pricingModel: r.pricingModel, basePrice: r.basePrice }); }) }];
                }
            });
        });
    }),
    manageApiKeys: featureEditProcedure
        .input(zod_1.z.object({ action: zod_1.z["enum"](["create", "revoke", "rotate"]), apiId: zod_1.z.string() }))
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
                        return [4 /*yield*/, db.insert(schema_1.apiPricingConfigs).values({ id: id, apiId: input.apiId, name: 'Key for ' + input.apiId, pricingModel: 'FIXED', status: 'ACTIVE', config: JSON.stringify({ action: input.action, keyType: 'API_KEY' }), createdBy: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || 'system' })];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, { keyId: id, action: input.action, apiId: input.apiId, status: 'ACTIVE', createdAt: new Date() }];
                }
            });
        });
    }),
    getMonetizationDashboard: featureViewProcedure
        .input(zod_1.z.object({}))
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, rows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    db = db_1.getDb();
                    return [4 /*yield*/, db.select().from(schema_1.apiPricingConfigs).where(drizzle_orm_1.eq(schema_1.apiPricingConfigs.status, 'ACTIVE'))];
                case 1:
                    rows = _a.sent();
                    return [2 /*return*/, { activeApis: rows.length, totalConfigs: rows.length, configs: rows }];
            }
        });
    }); })
});
