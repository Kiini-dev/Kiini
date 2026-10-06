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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
exports.paymentPlansRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var schema_1 = require("../../drizzle/schema");
var db_1 = require("../db");
var drizzle_orm_1 = require("drizzle-orm");
var nanoid_1 = require("nanoid");
var server_1 = require("@trpc/server");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var createProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("payments:create");
var viewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("payments:read");
var updateProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("payments:edit");
var deleteProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("payments:delete");
var createPaymentPlanSchema = zod_1.z.object({
    invoiceId: zod_1.z.string(),
    numInstallments: zod_1.z.number().int().min(2).max(24),
    frequencyDays: zod_1.z.number().int().min(1).max(365),
    startDate: zod_1.z.string().datetime(),
    notes: zod_1.z.string().optional()
});
var updatePaymentPlanSchema = zod_1.z.object({
    id: zod_1.z.string(),
    status: zod_1.z["enum"](["active", "paused", "completed", "cancelled"]).optional(),
    notes: zod_1.z.string().optional()
});
var recordInstallmentPaymentSchema = zod_1.z.object({
    installmentId: zod_1.z.string(),
    paidAmount: zod_1.z.number().int().min(0),
    paymentId: zod_1.z.string(),
    notes: zod_1.z.string().optional()
});
exports.paymentPlansRouter = trpc_1.router({
    createFromInvoice: createProcedure
        .input(createPaymentPlanSchema)
        .mutation(function (opts) { return __awaiter(void 0, void 0, void 0, function () {
        var input, ctx, db, invoice, inv, planId, installmentAmount, startDate, installments, i, dueDate, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    input = opts.input, ctx = opts.ctx;
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 6, , 7]);
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.invoices)
                            .where(drizzle_orm_1.eq(schema_1.invoices.id, input.invoiceId))
                            .limit(1)];
                case 3:
                    invoice = _a.sent();
                    if (!invoice.length) {
                        throw new server_1.TRPCError({
                            code: "NOT_FOUND",
                            message: "Invoice not found"
                        });
                    }
                    inv = invoice[0];
                    planId = nanoid_1.nanoid();
                    installmentAmount = Math.ceil(inv.total / input.numInstallments);
                    startDate = new Date(input.startDate);
                    // Create payment plan
                    return [4 /*yield*/, db.insert(schema_1.paymentPlans).values({
                            id: planId,
                            invoiceId: input.invoiceId,
                            clientId: inv.clientId,
                            numInstallments: input.numInstallments,
                            installmentAmount: installmentAmount,
                            frequencyDays: input.frequencyDays,
                            startDate: input.startDate,
                            nextInstallmentDue: startDate.toISOString().replace('T', ' ').substring(0, 19),
                            completedInstallments: 0,
                            totalPaid: 0,
                            status: "active",
                            notes: input.notes,
                            createdBy: ctx.user.id
                        })];
                case 4:
                    // Create payment plan
                    _a.sent();
                    installments = [];
                    for (i = 1; i <= input.numInstallments; i++) {
                        dueDate = new Date(startDate);
                        dueDate.setDate(dueDate.getDate() + (i - 1) * input.frequencyDays);
                        installments.push({
                            id: nanoid_1.nanoid(),
                            paymentPlanId: planId,
                            installmentNumber: i,
                            dueDate: dueDate.toISOString().replace('T', ' ').substring(0, 19),
                            amount: i === input.numInstallments
                                ? inv.total - installmentAmount * (input.numInstallments - 1)
                                : installmentAmount,
                            status: "pending",
                            paidDate: null,
                            paidAmount: null,
                            paymentId: null,
                            notes: null,
                            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        });
                    }
                    return [4 /*yield*/, db.insert(schema_1.paymentPlanInstallments).values(installments)];
                case 5:
                    _a.sent();
                    return [2 /*return*/, {
                            id: planId,
                            success: true,
                            installmentAmount: installmentAmount,
                            totalInstallments: input.numInstallments
                        }];
                case 6:
                    error_1 = _a.sent();
                    console.error("[PAYMENT_PLANS] Create error:", error_1);
                    if (error_1 instanceof server_1.TRPCError)
                        throw error_1;
                    throw new server_1.TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to create payment plan"
                    });
                case 7: return [2 /*return*/];
            }
        });
    }); }),
    list: viewProcedure
        .input(zod_1.z.object({
        invoiceId: zod_1.z.string().optional(),
        clientId: zod_1.z.string().optional(),
        status: zod_1.z["enum"](["active", "paused", "completed", "cancelled"]).optional()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, filters, result, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        filters = [];
                        if (input.invoiceId) {
                            filters.push(drizzle_orm_1.eq(schema_1.paymentPlans.invoiceId, input.invoiceId));
                        }
                        if (input.clientId) {
                            filters.push(drizzle_orm_1.eq(schema_1.paymentPlans.clientId, input.clientId));
                        }
                        if (input.status) {
                            filters.push(drizzle_orm_1.eq(schema_1.paymentPlans.status, input.status));
                        }
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.paymentPlans)
                                .where(filters.length > 0 ? drizzle_orm_1.and.apply(void 0, filters) : undefined)
                                .orderBy(drizzle_orm_1.desc(schema_1.paymentPlans.createdAt))];
                    case 3:
                        result = _b.sent();
                        return [2 /*return*/, result];
                    case 4:
                        error_2 = _b.sent();
                        console.error("[PAYMENT_PLANS] List error:", error_2);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to fetch payment plans"
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    getById: viewProcedure.input(zod_1.z.string()).query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, plan, installments, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.paymentPlans)
                                .where(drizzle_orm_1.eq(schema_1.paymentPlans.id, input))
                                .limit(1)];
                    case 3:
                        plan = _b.sent();
                        if (!plan.length) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Payment plan not found"
                            });
                        }
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.paymentPlanInstallments)
                                .where(drizzle_orm_1.eq(schema_1.paymentPlanInstallments.paymentPlanId, input))
                                .orderBy(schema_1.paymentPlanInstallments.installmentNumber)];
                    case 4:
                        installments = _b.sent();
                        return [2 /*return*/, __assign(__assign({}, plan[0]), { installments: installments })];
                    case 5:
                        error_3 = _b.sent();
                        console.error("[PAYMENT_PLANS] GetById error:", error_3);
                        if (error_3 instanceof server_1.TRPCError)
                            throw error_3;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to fetch payment plan"
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    update: updateProcedure
        .input(updatePaymentPlanSchema)
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, updateData, existing, updates, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        id = input.id, updateData = __rest(input, ["id"]);
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.paymentPlans)
                                .where(drizzle_orm_1.eq(schema_1.paymentPlans.id, id))
                                .limit(1)];
                    case 3:
                        existing = _b.sent();
                        if (!existing.length) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Payment plan not found"
                            });
                        }
                        updates = {
                            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        };
                        if (updateData.status) {
                            updates.status = updateData.status;
                        }
                        if (updateData.notes !== undefined) {
                            updates.notes = updateData.notes;
                        }
                        return [4 /*yield*/, db
                                .update(schema_1.paymentPlans)
                                .set(updates)
                                .where(drizzle_orm_1.eq(schema_1.paymentPlans.id, id))];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 5:
                        error_4 = _b.sent();
                        console.error("[PAYMENT_PLANS] Update error:", error_4);
                        if (error_4 instanceof server_1.TRPCError)
                            throw error_4;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to update payment plan"
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    "delete": deleteProcedure.input(zod_1.z.string()).mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        // Delete installments first
                        return [4 /*yield*/, db["delete"](schema_1.paymentPlanInstallments)
                                .where(drizzle_orm_1.eq(schema_1.paymentPlanInstallments.paymentPlanId, input))];
                    case 3:
                        // Delete installments first
                        _b.sent();
                        // Delete payment plan
                        return [4 /*yield*/, db["delete"](schema_1.paymentPlans).where(drizzle_orm_1.eq(schema_1.paymentPlans.id, input))];
                    case 4:
                        // Delete payment plan
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 5:
                        error_5 = _b.sent();
                        console.error("[PAYMENT_PLANS] Delete error:", error_5);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to delete payment plan"
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    recordInstallmentPayment: updateProcedure
        .input(recordInstallmentPaymentSchema)
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, installment, inst, plan, pln, allInstallments, updatedInstallments, completedCount, totalPaid, planUpdates, nextPending, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 8, , 9]);
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.paymentPlanInstallments)
                                .where(drizzle_orm_1.eq(schema_1.paymentPlanInstallments.id, input.installmentId))
                                .limit(1)];
                    case 3:
                        installment = _b.sent();
                        if (!installment.length) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Installment not found"
                            });
                        }
                        inst = installment[0];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.paymentPlans)
                                .where(drizzle_orm_1.eq(schema_1.paymentPlans.id, inst.paymentPlanId))
                                .limit(1)];
                    case 4:
                        plan = _b.sent();
                        if (!plan.length) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Payment plan not found"
                            });
                        }
                        pln = plan[0];
                        // Update installment
                        return [4 /*yield*/, db
                                .update(schema_1.paymentPlanInstallments)
                                .set({
                                status: "paid",
                                paidDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                paidAmount: input.paidAmount,
                                paymentId: input.paymentId,
                                notes: input.notes
                            })
                                .where(drizzle_orm_1.eq(schema_1.paymentPlanInstallments.id, input.installmentId))];
                    case 5:
                        // Update installment
                        _b.sent();
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.paymentPlanInstallments)
                                .where(drizzle_orm_1.eq(schema_1.paymentPlanInstallments.paymentPlanId, inst.paymentPlanId))];
                    case 6:
                        allInstallments = _b.sent();
                        updatedInstallments = allInstallments.map(function (i) {
                            return i.id === input.installmentId ? __assign(__assign({}, i), { status: "paid" }) : i;
                        });
                        completedCount = updatedInstallments.filter(function (i) { return i.status === "paid"; }).length;
                        totalPaid = updatedInstallments.reduce(function (sum, i) { return sum + (i.paidAmount || 0); }, 0);
                        planUpdates = {
                            completedInstallments: completedCount,
                            totalPaid: totalPaid,
                            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        };
                        if (completedCount === pln.numInstallments) {
                            planUpdates.status = "completed";
                        }
                        nextPending = updatedInstallments.find(function (i) { return i.status === "pending"; });
                        if (nextPending) {
                            planUpdates.nextInstallmentDue = nextPending.dueDate;
                        }
                        return [4 /*yield*/, db
                                .update(schema_1.paymentPlans)
                                .set(planUpdates)
                                .where(drizzle_orm_1.eq(schema_1.paymentPlans.id, inst.paymentPlanId))];
                    case 7:
                        _b.sent();
                        return [2 /*return*/, { success: true, planCompleted: completedCount === pln.numInstallments }];
                    case 8:
                        error_6 = _b.sent();
                        console.error("[PAYMENT_PLANS] RecordPayment error:", error_6);
                        if (error_6 instanceof server_1.TRPCError)
                            throw error_6;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to record installment payment"
                        });
                    case 9: return [2 /*return*/];
                }
            });
        });
    }),
    getInstallments: viewProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, installments, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.paymentPlanInstallments)
                                .where(drizzle_orm_1.eq(schema_1.paymentPlanInstallments.paymentPlanId, input))
                                .orderBy(schema_1.paymentPlanInstallments.installmentNumber)];
                    case 3:
                        installments = _b.sent();
                        return [2 /*return*/, installments];
                    case 4:
                        error_7 = _b.sent();
                        console.error("[PAYMENT_PLANS] GetInstallments error:", error_7);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to fetch installments"
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    getUpcomingInstallments: viewProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, now, thirtyDaysFromNow, upcoming, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    now = new Date();
                    thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                    return [4 /*yield*/, db
                            .select({
                            installment: schema_1.paymentPlanInstallments,
                            plan: schema_1.paymentPlans
                        })
                            .from(schema_1.paymentPlanInstallments)
                            .innerJoin(schema_1.paymentPlans, drizzle_orm_1.eq(schema_1.paymentPlanInstallments.paymentPlanId, schema_1.paymentPlans.id))
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.paymentPlanInstallments.status, "pending"), drizzle_orm_1.gte(schema_1.paymentPlanInstallments.dueDate, now.toISOString().replace('T', ' ').substring(0, 19)), drizzle_orm_1.lte(schema_1.paymentPlanInstallments.dueDate, thirtyDaysFromNow.toISOString().replace('T', ' ').substring(0, 19)), drizzle_orm_1.eq(schema_1.paymentPlans.status, "active")))
                            .orderBy(schema_1.paymentPlanInstallments.dueDate)];
                case 3:
                    upcoming = _a.sent();
                    return [2 /*return*/, upcoming];
                case 4:
                    error_8 = _a.sent();
                    console.error("[PAYMENT_PLANS] GetUpcoming error:", error_8);
                    throw new server_1.TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to fetch upcoming installments"
                    });
                case 5: return [2 /*return*/];
            }
        });
    }); }),
    getOverdueInstallments: viewProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, now, overdue, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    now = new Date();
                    return [4 /*yield*/, db
                            .select({
                            installment: schema_1.paymentPlanInstallments,
                            plan: schema_1.paymentPlans
                        })
                            .from(schema_1.paymentPlanInstallments)
                            .innerJoin(schema_1.paymentPlans, drizzle_orm_1.eq(schema_1.paymentPlanInstallments.paymentPlanId, schema_1.paymentPlans.id))
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.paymentPlanInstallments.status, "pending"), drizzle_orm_1.lte(schema_1.paymentPlanInstallments.dueDate, now.toISOString().replace('T', ' ').substring(0, 19)), drizzle_orm_1.eq(schema_1.paymentPlans.status, "active")))
                            .orderBy(schema_1.paymentPlanInstallments.dueDate)];
                case 3:
                    overdue = _a.sent();
                    return [2 /*return*/, overdue];
                case 4:
                    error_9 = _a.sent();
                    console.error("[PAYMENT_PLANS] GetOverdue error:", error_9);
                    throw new server_1.TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to fetch overdue installments"
                    });
                case 5: return [2 /*return*/];
            }
        });
    }); })
});
