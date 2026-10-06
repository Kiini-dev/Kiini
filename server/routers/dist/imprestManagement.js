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
exports.imprestsRouter = void 0;
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var db = require("../db");
var server_1 = require("@trpc/server");
/**
 * Imprest Management Router
 * Handles petty cash and imprest requests/surrenders
 * Common in African organizations for employee advances
 */
var viewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:imprests:view");
var createProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:imprests:create");
var approveProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:imprests:approve");
var settleProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:imprests:settle");
exports.imprestsRouter = trpc_1.router({
    list: viewProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().optional(),
        offset: zod_1.z.number().optional(),
        status: zod_1.z.string().optional(),
        employeeId: zod_1.z.string().optional()
    }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db_2, orgId, conditions, where, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db_2 = _b.sent();
                        if (!db_2)
                            return [2 /*return*/, []];
                        orgId = ctx.user.organizationId;
                        conditions = [];
                        if (orgId)
                            conditions.push(drizzle_orm_1.eq("imprests.organizationId", orgId));
                        if (input === null || input === void 0 ? void 0 : input.status)
                            conditions.push(drizzle_orm_1.eq("imprests.status", input.status));
                        if (input === null || input === void 0 ? void 0 : input.employeeId)
                            conditions.push(drizzle_orm_1.eq("imprests.employeeId", input.employeeId));
                        where = conditions.length > 0 ? drizzle_orm_1.and.apply(void 0, conditions) : undefined;
                        return [4 /*yield*/, db_2.select().from("imprests")
                                .where(where)
                                .orderBy(drizzle_orm_1.desc("imprests.createdAt"))
                                .limit((input === null || input === void 0 ? void 0 : input.limit) || 50)
                                .offset((input === null || input === void 0 ? void 0 : input.offset) || 0)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3:
                        error_1 = _b.sent();
                        console.error("Error listing imprests:", error_1);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    getById: viewProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db_3, orgId, where, result, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db_3 = _b.sent();
                        if (!db_3)
                            return [2 /*return*/, null];
                        orgId = ctx.user.organizationId;
                        where = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq("imprests.id", input), drizzle_orm_1.eq("imprests.organizationId", orgId))
                            : drizzle_orm_1.eq("imprests.id", input);
                        return [4 /*yield*/, db_3.select().from("imprests").where(where).limit(1)];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, result[0] || null];
                    case 3:
                        error_2 = _b.sent();
                        console.error("Error fetching imprest:", error_2);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    create: createProcedure
        .input(zod_1.z.object({
        employeeId: zod_1.z.string(),
        employeeName: zod_1.z.string(),
        amount: zod_1.z.number().positive(),
        purpose: zod_1.z.string(),
        requestDate: zod_1.z.date().or(zod_1.z.string()),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, id, now, imprestNumber, error_3;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error("Database not available");
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 5, , 6]);
                        id = uuid_1.v4();
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        imprestNumber = "IMP-" + new Date().getFullYear() + "-" + String(Math.random() * 10000).padStart(6, '0');
                        return [4 /*yield*/, database.insert("imprests").values({
                                id: id,
                                organizationId: (_b = ctx.user.organizationId) !== null && _b !== void 0 ? _b : null,
                                imprestNumber: imprestNumber,
                                employeeId: input.employeeId,
                                employeeName: input.employeeName,
                                amount: input.amount,
                                purpose: input.purpose,
                                requestDate: typeof input.requestDate === 'string'
                                    ? new Date(input.requestDate).toISOString().replace('T', ' ').substring(0, 19)
                                    : input.requestDate.toISOString().replace('T', ' ').substring(0, 19),
                                status: "pending",
                                notes: input.notes || null,
                                createdBy: ctx.user.id,
                                createdAt: now,
                                updatedAt: now
                            })];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "imprest_requested",
                                entityType: "imprest",
                                entityId: id,
                                description: "Imprest request " + imprestNumber + " for Ksh " + input.amount + " by " + input.employeeName
                            })];
                    case 4:
                        _c.sent();
                        return [2 /*return*/, { id: id, imprestNumber: imprestNumber }];
                    case 5:
                        error_3 = _c.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to create imprest: " + error_3.message
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    approve: approveProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var imprestId = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, result, imprest, now, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 6, , 7]);
                        return [4 /*yield*/, database.select().from("imprests").where(drizzle_orm_1.eq("imprests.id", imprestId)).limit(1)];
                    case 3:
                        result = _b.sent();
                        if (!result.length)
                            throw new Error("Imprest not found");
                        imprest = result[0];
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, database.update("imprests").set({
                                status: "approved",
                                approvedBy: ctx.user.id,
                                approvedAt: now,
                                updatedAt: now
                            }).where(drizzle_orm_1.eq("imprests.id", imprestId))];
                    case 4:
                        _b.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "imprest_approved",
                                entityType: "imprest",
                                entityId: imprestId,
                                description: "Approved imprest " + imprest.imprestNumber + " for Ksh " + imprest.amount
                            })];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, { success: true, imprestId: imprestId }];
                    case 6:
                        error_4 = _b.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to approve imprest: " + error_4.message
                        });
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    // Settle imprest with expense submission
    settleImprest: settleProcedure
        .input(zod_1.z.object({
        imprestId: zod_1.z.string(),
        expenses: zod_1.z.array(zod_1.z.object({
            description: zod_1.z.string(),
            amount: zod_1.z.number(),
            receipt: zod_1.z.string().optional()
        })),
        returnedAmount: zod_1.z.number()["default"](0)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, result, imprest, now, totalExpensed_1, variance, settlementId, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 7, , 8]);
                        return [4 /*yield*/, database.select().from("imprests").where(drizzle_orm_1.eq("imprests.id", input.imprestId)).limit(1)];
                    case 3:
                        result = _b.sent();
                        if (!result.length)
                            throw new Error("Imprest not found");
                        imprest = result[0];
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        totalExpensed_1 = 0;
                        input.expenses.forEach(function (exp) { return totalExpensed_1 += exp.amount; });
                        variance = imprest.amount - totalExpensed_1 - input.returnedAmount;
                        settlementId = uuid_1.v4();
                        return [4 /*yield*/, database.insert("imprestSurrenders").values({
                                id: settlementId,
                                imprestId: input.imprestId,
                                totalExpensed: totalExpensed_1,
                                variance: variance,
                                returnedAmount: input.returnedAmount,
                                settledBy: ctx.user.id,
                                settledAt: now,
                                status: variance === 0 ? "settled" : "variance_pending",
                                createdAt: now
                            })];
                    case 4:
                        _b.sent();
                        // Update imprest status
                        return [4 /*yield*/, database.update("imprests").set({
                                status: "settled",
                                settledAt: now,
                                updatedAt: now
                            }).where(drizzle_orm_1.eq("imprests.id", input.imprestId))];
                    case 5:
                        // Update imprest status
                        _b.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "imprest_settled",
                                entityType: "imprest",
                                entityId: input.imprestId,
                                description: "Settled imprest " + imprest.imprestNumber + ". Expenses: Ksh " + totalExpensed_1 + ", Variance: Ksh " + variance
                            })];
                    case 6:
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                settlementId: settlementId,
                                totalExpensed: totalExpensed_1,
                                returnedAmount: input.returnedAmount,
                                variance: variance
                            }];
                    case 7:
                        error_5 = _b.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to settle imprest: " + error_5.message
                        });
                    case 8: return [2 /*return*/];
                }
            });
        });
    })
});
