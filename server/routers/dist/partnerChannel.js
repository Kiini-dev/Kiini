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
exports.partnerChannelRouter = void 0;
/**
 * Partner Channel Router - DB-backed
 */
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var partnerViewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure('partners:view');
var partnerEditProcedure = enhancedRbac_1.createFeatureRestrictedProcedure('partners:edit');
exports.partnerChannelRouter = trpc_1.router({
    registerPartner: partnerEditProcedure
        .input(zod_1.z.object({ partnerName: zod_1.z.string(), tier: zod_1.z["enum"](['bronze', 'silver', 'gold', 'platinum'])["default"]('bronze'), commissionRate: zod_1.z.number().optional() }))
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
                        return [4 /*yield*/, db.insert(schema_1.partnerDeals).values({ id: id, partnerId: uuid_1.v4(), partnerName: input.partnerName, dealName: "Partnership: " + input.partnerName, dealValue: '0', tier: input.tier, commissionRate: String(input.commissionRate || 10), status: 'active', createdBy: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || 'system' })];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, { success: true, partnerId: id, partnerName: input.partnerName, tier: input.tier, registeredAt: new Date() }];
                }
            });
        });
    }),
    createDeal: partnerEditProcedure
        .input(zod_1.z.object({ partnerName: zod_1.z.string(), dealName: zod_1.z.string(), dealValue: zod_1.z.number(), customerId: zod_1.z.string().optional(), commissionRate: zod_1.z.number().optional() }))
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
                        return [4 /*yield*/, db.insert(schema_1.partnerDeals).values({ id: id, partnerId: uuid_1.v4(), partnerName: input.partnerName, dealName: input.dealName, dealValue: String(input.dealValue), customerId: input.customerId || null, commissionRate: String(input.commissionRate || 10), status: 'pending', createdBy: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || 'system' })];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, { success: true, dealId: id, dealName: input.dealName, dealValue: input.dealValue, status: 'pending' }];
                }
            });
        });
    }),
    listDeals: partnerViewProcedure
        .input(zod_1.z.object({ partnerName: zod_1.z.string().optional(), status: zod_1.z.string().optional(), limit: zod_1.z.number()["default"](50) }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, query, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        db = db_1.getDb();
                        if (input.partnerName) {
                            query = db.select().from(schema_1.partnerDeals).where(drizzle_orm_1.eq(schema_1.partnerDeals.partnerName, input.partnerName)).orderBy(drizzle_orm_1.desc(schema_1.partnerDeals.createdAt)).limit(input.limit);
                        }
                        else if (input.status) {
                            query = db.select().from(schema_1.partnerDeals).where(drizzle_orm_1.eq(schema_1.partnerDeals.status, input.status)).orderBy(drizzle_orm_1.desc(schema_1.partnerDeals.createdAt)).limit(input.limit);
                        }
                        else {
                            query = db.select().from(schema_1.partnerDeals).orderBy(drizzle_orm_1.desc(schema_1.partnerDeals.createdAt)).limit(input.limit);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        rows = _b.sent();
                        return [2 /*return*/, { deals: rows, total: rows.length }];
                }
            });
        });
    }),
    updateDealStatus: partnerEditProcedure
        .input(zod_1.z.object({ dealId: zod_1.z.string(), status: zod_1.z["enum"](['pending', 'active', 'won', 'lost', 'closed']) }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        db = db_1.getDb();
                        return [4 /*yield*/, db.update(schema_1.partnerDeals).set({ status: input.status }).where(drizzle_orm_1.eq(schema_1.partnerDeals.id, input.dealId))];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, { success: true, dealId: input.dealId, status: input.status }];
                }
            });
        });
    }),
    getPartnerPerformance: partnerViewProcedure
        .input(zod_1.z.object({ partnerName: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rows, totalValue, wonDeals;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        db = db_1.getDb();
                        return [4 /*yield*/, db.select().from(schema_1.partnerDeals).where(drizzle_orm_1.eq(schema_1.partnerDeals.partnerName, input.partnerName))];
                    case 1:
                        rows = _b.sent();
                        totalValue = rows.reduce(function (sum, r) { return sum + parseFloat(r.dealValue || '0'); }, 0);
                        wonDeals = rows.filter(function (r) { return r.status === 'won'; });
                        return [2 /*return*/, { partnerName: input.partnerName, totalDeals: rows.length, wonDeals: wonDeals.length, totalValue: totalValue, avgDealValue: rows.length > 0 ? totalValue / rows.length : 0 }];
                }
            });
        });
    })
});
