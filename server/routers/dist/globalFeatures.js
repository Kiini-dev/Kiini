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
exports.globalFeaturesRouter = void 0;
/**
 * Global Features Router - DB-backed
 */
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
exports.globalFeaturesRouter = trpc_1.router({
    configureInternationalization: trpc_1.featureEditProcedure
        .input(zod_1.z.object({ defaultLocale: zod_1.z.string(), supportedLocales: zod_1.z.array(zod_1.z.string()), fallbackLocale: zod_1.z.string().optional() }))
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
                        return [4 /*yield*/, db.insert(schema_1.globalConfigs).values({ id: id, configType: 'i18n', name: 'localization', config: JSON.stringify({ defaultLocale: input.defaultLocale, supportedLocales: input.supportedLocales, fallbackLocale: input.fallbackLocale || 'en' }), status: 'ACTIVE', createdBy: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || 'system' })];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, { success: true, configId: id, defaultLocale: input.defaultLocale, supportedLocales: input.supportedLocales, configuredAt: new Date() }];
                }
            });
        });
    }),
    manageRegionalCompliance: trpc_1.featureEditProcedure
        .input(zod_1.z.object({ region: zod_1.z.string(), regulations: zod_1.z.array(zod_1.z.string()), dataResidency: zod_1.z.string().optional() }))
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
                        return [4 /*yield*/, db.insert(schema_1.globalConfigs).values({ id: id, configType: 'compliance', name: "region_" + input.region, region: input.region, config: JSON.stringify({ regulations: input.regulations, dataResidency: input.dataResidency }), status: 'ACTIVE', createdBy: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || 'system' })];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, { success: true, configId: id, region: input.region, regulations: input.regulations, configuredAt: new Date() }];
                }
            });
        });
    }),
    configureTimezones: trpc_1.featureEditProcedure
        .input(zod_1.z.object({ defaultTimezone: zod_1.z.string(), autoDetect: zod_1.z.boolean()["default"](true), displayFormat: zod_1.z["enum"](['12h', '24h'])["default"]('24h') }))
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
                        return [4 /*yield*/, db.insert(schema_1.globalConfigs).values({ id: id, configType: 'timezone', name: 'timezone_settings', config: JSON.stringify(input), status: 'ACTIVE', createdBy: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || 'system' })];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, { success: true, configId: id, defaultTimezone: input.defaultTimezone, autoDetect: input.autoDetect, configuredAt: new Date() }];
                }
            });
        });
    }),
    handleCurrencyConversion: trpc_1.featureViewProcedure
        .input(zod_1.z.object({ from: zod_1.z.string(), to: zod_1.z.string(), amount: zod_1.z.number() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var rates, fromRate, toRate, converted;
            return __generator(this, function (_b) {
                rates = { USD: 1, EUR: 0.85, GBP: 0.73, KES: 130.5, JPY: 110.0, CAD: 1.25, AUD: 1.35 };
                fromRate = rates[input.from] || 1;
                toRate = rates[input.to] || 1;
                converted = (input.amount / fromRate) * toRate;
                return [2 /*return*/, { from: input.from, to: input.to, amount: input.amount, convertedAmount: Math.round(converted * 100) / 100, rate: toRate / fromRate, timestamp: new Date() }];
            });
        });
    }),
    listConfigs: trpc_1.featureViewProcedure
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
                            query = db.select().from(schema_1.globalConfigs).where(drizzle_orm_1.eq(schema_1.globalConfigs.configType, input.configType)).orderBy(drizzle_orm_1.desc(schema_1.globalConfigs.createdAt)).limit(input.limit);
                        }
                        else {
                            query = db.select().from(schema_1.globalConfigs).orderBy(drizzle_orm_1.desc(schema_1.globalConfigs.createdAt)).limit(input.limit);
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
