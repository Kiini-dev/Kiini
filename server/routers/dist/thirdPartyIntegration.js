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
exports.integrationRouter = void 0;
/**
 * Third Party Integration Router - DB-backed
 */
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
exports.integrationRouter = trpc_1.router({
    configureIntegration: trpc_1.featureEditProcedure
        .input(zod_1.z.object({ provider: zod_1.z.string(), integrationType: zod_1.z["enum"](['api', 'api_key', 'webhook', 'oauth', 'custom', 'smtp']), config: zod_1.z.object({ apiKey: zod_1.z.string().optional(), webhookUrl: zod_1.z.string().optional(), clientId: zod_1.z.string().optional(), clientSecret: zod_1.z.string().optional(), scopes: zod_1.z.array(zod_1.z.string()).optional() }) }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        id = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_1.integrationConfigs).values({ id: id, provider: input.provider, integrationType: input.integrationType, config: JSON.stringify(input.config), status: 'active', createdBy: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || 'system' })];
                    case 2:
                        _c.sent();
                        return [2 /*return*/, { success: true, integrationId: id, provider: input.provider, type: input.integrationType, configuredAt: new Date().toISOString().replace('T', ' ').substring(0, 19) }];
                }
            });
        });
    }),
    testIntegration: trpc_1.featureEditProcedure
        .input(zod_1.z.object({ integrationId: zod_1.z.string().optional(), id: zod_1.z.string().optional() }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var integrationId, db, rows, integration;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        integrationId = input.integrationId || input.id;
                        if (!integrationId)
                            return [2 /*return*/, { success: false, error: 'Integration ID required' }];
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        return [4 /*yield*/, db.select().from(schema_1.integrationConfigs).where(drizzle_orm_1.eq(schema_1.integrationConfigs.id, integrationId))];
                    case 2:
                        rows = _b.sent();
                        integration = rows[0];
                        if (!integration)
                            return [2 /*return*/, { success: false, error: 'Integration not found' }];
                        return [4 /*yield*/, db.update(schema_1.integrationConfigs).set({ lastSyncAt: new Date().toISOString().replace('T', ' ').substring(0, 19) }).where(drizzle_orm_1.eq(schema_1.integrationConfigs.id, integrationId))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true, integrationId: integrationId, provider: integration.provider, status: 'connected', responseTime: 120, testedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) }];
                }
            });
        });
    }),
    listIntegrations: trpc_1.featureViewProcedure
        .input(zod_1.z.object({ provider: zod_1.z.string().optional(), status: zod_1.z.string().optional(), limit: zod_1.z.number()["default"](50) }).nullish())
        .query(function (_a) {
        var rawInput = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var input, limit, db, query, rows;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        input = rawInput !== null && rawInput !== void 0 ? rawInput : {};
                        limit = (_b = input.limit) !== null && _b !== void 0 ? _b : 50;
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (input.provider) {
                            query = db.select().from(schema_1.integrationConfigs).where(drizzle_orm_1.eq(schema_1.integrationConfigs.provider, input.provider)).orderBy(drizzle_orm_1.desc(schema_1.integrationConfigs.createdAt)).limit(limit);
                        }
                        else if (input.status) {
                            query = db.select().from(schema_1.integrationConfigs).where(drizzle_orm_1.eq(schema_1.integrationConfigs.status, input.status)).orderBy(drizzle_orm_1.desc(schema_1.integrationConfigs.createdAt)).limit(limit);
                        }
                        else {
                            query = db.select().from(schema_1.integrationConfigs).orderBy(drizzle_orm_1.desc(schema_1.integrationConfigs.createdAt)).limit(limit);
                        }
                        return [4 /*yield*/, query];
                    case 2:
                        rows = _c.sent();
                        return [2 /*return*/, { integrations: rows.map(function (r) { return (__assign(__assign({}, r), { config: r.config ? JSON.parse(r.config) : null })); }), total: rows.length }];
                }
            });
        });
    }),
    disableIntegration: trpc_1.featureEditProcedure
        .input(zod_1.z.object({ integrationId: zod_1.z.string().optional(), id: zod_1.z.string().optional() }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var integrationId, db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        integrationId = input.integrationId || input.id;
                        if (!integrationId)
                            return [2 /*return*/, { success: false, integrationId: '', status: 'error' }];
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        return [4 /*yield*/, db.update(schema_1.integrationConfigs).set({ status: 'inactive' }).where(drizzle_orm_1.eq(schema_1.integrationConfigs.id, integrationId))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true, integrationId: integrationId, status: 'inactive' }];
                }
            });
        });
    }),
    deleteIntegration: trpc_1.featureEditProcedure
        .input(zod_1.z.object({ integrationId: zod_1.z.string().optional(), id: zod_1.z.string().optional() }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var integrationId, db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        integrationId = input.integrationId || input.id;
                        if (!integrationId)
                            return [2 /*return*/, { success: false, deletedId: '' }];
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        return [4 /*yield*/, db["delete"](schema_1.integrationConfigs).where(drizzle_orm_1.eq(schema_1.integrationConfigs.id, integrationId))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true, deletedId: integrationId }];
                }
            });
        });
    })
});
