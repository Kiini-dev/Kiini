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
exports.paymentsRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var db = require("../db");
var server_1 = require("@trpc/server");
var emailNotifications_1 = require("./emailNotifications");
var triggerEngine_1 = require("../workflows/triggerEngine");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
// Permission-restricted procedure instances
var viewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:payments:view");
var createProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:payments:create");
var approveProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:payments:approve");
var deleteProcedure = enhancedRbac_1.createRoleRestrictedProcedure(["super_admin", "admin"]);
// Helper function to generate next payment reference number in format PAY-000000
function generateNextPaymentReferenceNumber(database) {
    return __awaiter(this, void 0, Promise, function () {
        var result, maxSequence, match, nextSequence, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, database.select({ payNum: schema_1.payments.referenceNumber })
                            .from(schema_1.payments)
                            .orderBy(drizzle_orm_1.desc(schema_1.payments.referenceNumber))
                            .limit(1)];
                case 1:
                    result = _a.sent();
                    maxSequence = 0;
                    if (result && result.length > 0 && result[0].payNum) {
                        match = result[0].payNum.match(/(\d+)$/);
                        if (match) {
                            maxSequence = parseInt(match[1]);
                        }
                    }
                    nextSequence = maxSequence + 1;
                    return [2 /*return*/, "PAY-" + String(nextSequence).padStart(6, '0')];
                case 2:
                    err_1 = _a.sent();
                    console.warn("Error generating payment reference number, using default:", err_1);
                    return [2 /*return*/, "PAY-000001"];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Helper function to send payment notifications
function sendPaymentNotification(database, userId, action, amount, invoiceNumber, paymentId) {
    return __awaiter(this, void 0, void 0, function () {
        var amountFormatted, messages, titles, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    amountFormatted = (amount / 100).toLocaleString("en-KE", {
                        style: "currency",
                        currency: "KES"
                    });
                    messages = {
                        recorded: "Payment of " + amountFormatted + " received for invoice " + invoiceNumber,
                        approved: "Payment of " + amountFormatted + " for invoice " + invoiceNumber + " has been approved"
                    };
                    titles = {
                        recorded: "Payment Recorded",
                        approved: "Payment Approved"
                    };
                    return [4 /*yield*/, db_1.createNotification({
                            userId: userId,
                            title: titles[action],
                            message: messages[action],
                            type: "success",
                            category: "payment",
                            entityType: "payment",
                            entityId: paymentId,
                            actionUrl: "/payments/" + paymentId,
                            priority: "normal"
                        })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    err_2 = _a.sent();
                    console.warn("Failed to create payment notification:", err_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.paymentsRouter = trpc_1.router({
    list: viewProcedure
        .input(zod_1.z.object({ limit: zod_1.z.number().optional(), offset: zod_1.z.number().optional() }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, query, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        orgId = ctx.user.organizationId;
                        query = orgId
                            ? database.select().from(schema_1.payments).where(drizzle_orm_1.eq(schema_1.payments.organizationId, orgId))
                            : database.select().from(schema_1.payments);
                        return [4 /*yield*/, query.limit((input === null || input === void 0 ? void 0 : input.limit) || 50).offset((input === null || input === void 0 ? void 0 : input.offset) || 0)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3:
                        error_1 = _b.sent();
                        console.error("Error fetching payments list:", error_1);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    getNextPaymentReferenceNumber: viewProcedure
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, nextNumber;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        throw new Error("Database not available");
                    return [4 /*yield*/, generateNextPaymentReferenceNumber(database)];
                case 2:
                    nextNumber = _a.sent();
                    return [2 /*return*/, { referenceNumber: nextNumber }];
            }
        });
    }); }),
    getById: viewProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, where, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, null];
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.payments.id, input), drizzle_orm_1.eq(schema_1.payments.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.payments.id, input);
                        return [4 /*yield*/, database.select().from(schema_1.payments).where(where).limit(1)];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, result[0] || null];
                }
            });
        });
    }),
    byInvoice: viewProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, where, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.payments.invoiceId, input), drizzle_orm_1.eq(schema_1.payments.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.payments.invoiceId, input);
                        return [4 /*yield*/, database.select().from(schema_1.payments).where(where)];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    }),
    byClient: viewProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, where, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.payments.clientId, input), drizzle_orm_1.eq(schema_1.payments.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.payments.clientId, input);
                        return [4 /*yield*/, database.select().from(schema_1.payments).where(where)];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    }),
    create: createProcedure
        .input(zod_1.z.object({
        invoiceId: zod_1.z.string(),
        clientId: zod_1.z.string(),
        amount: zod_1.z.number(),
        paymentDate: zod_1.z.date().or(zod_1.z.string()),
        paymentMethod: zod_1.z["enum"](["cash", "bank_transfer", "cheque", "mpesa", "card", "other"]),
        referenceNumber: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional(),
        status: zod_1.z["enum"](["pending", "completed", "failed", "cancelled"]).optional(),
        estimateId: zod_1.z.string().optional(),
        receiptId: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, referenceNumber, id, estimateId, receiptId, paymentData, convertToMySQLDateTime, now, invoiceResult, invoice, currentPaidAmount, newPaidAmount, invoiceTotal, newInvoiceStatus, estimateResult, estimate, receiptResult, receipt, dueDate, err_3, err_4, error_2;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error("Database not available");
                        referenceNumber = input.referenceNumber;
                        if (!!referenceNumber) return [3 /*break*/, 3];
                        return [4 /*yield*/, generateNextPaymentReferenceNumber(database)];
                    case 2:
                        referenceNumber = _c.sent();
                        _c.label = 3;
                    case 3:
                        id = uuid_1.v4();
                        estimateId = input.estimateId, receiptId = input.receiptId, paymentData = __rest(input, ["estimateId", "receiptId"]);
                        convertToMySQLDateTime = function (date) {
                            if (!date)
                                return new Date().toISOString().replace('T', ' ').substring(0, 19);
                            if (typeof date === 'string')
                                return new Date(date).toISOString().replace('T', ' ').substring(0, 19);
                            if (date instanceof Date)
                                return date.toISOString().replace('T', ' ').substring(0, 19);
                            return new Date().toISOString().replace('T', ' ').substring(0, 19);
                        };
                        _c.label = 4;
                    case 4:
                        _c.trys.push([4, 26, , 27]);
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, database.insert(schema_1.payments).values({
                                id: id,
                                organizationId: (_b = ctx.user.organizationId) !== null && _b !== void 0 ? _b : null,
                                invoiceId: paymentData.invoiceId,
                                clientId: paymentData.clientId,
                                accountId: null,
                                amount: paymentData.amount,
                                paymentDate: convertToMySQLDateTime(input.paymentDate),
                                paymentMethod: paymentData.paymentMethod,
                                referenceNumber: referenceNumber,
                                chartOfAccountType: 'debit',
                                notes: paymentData.notes || null,
                                status: input.status || "pending",
                                approvedBy: null,
                                approvedAt: null,
                                createdBy: ctx.user.id,
                                createdAt: now
                            })];
                    case 5:
                        _c.sent();
                        return [4 /*yield*/, database.select().from(schema_1.invoices).where(drizzle_orm_1.eq(schema_1.invoices.id, input.invoiceId)).limit(1)];
                    case 6:
                        invoiceResult = _c.sent();
                        invoice = invoiceResult[0];
                        if (!invoice) return [3 /*break*/, 9];
                        currentPaidAmount = invoice.paidAmount || 0;
                        newPaidAmount = currentPaidAmount + input.amount;
                        invoiceTotal = invoice.total || 0;
                        newInvoiceStatus = invoice.status;
                        if (newPaidAmount >= invoiceTotal) {
                            newInvoiceStatus = 'paid';
                        }
                        else if (newPaidAmount > 0) {
                            newInvoiceStatus = 'partial';
                        }
                        return [4 /*yield*/, database.update(schema_1.invoices).set({
                                paidAmount: newPaidAmount,
                                status: newInvoiceStatus
                            }).where(drizzle_orm_1.eq(schema_1.invoices.id, input.invoiceId))];
                    case 7:
                        _c.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "payment_created",
                                entityType: "payment",
                                entityId: id,
                                description: "Created payment of Ksh " + input.amount / 100 + " for invoice: " + invoice.invoiceNumber + ". Invoice status updated to " + newInvoiceStatus
                            })];
                    case 8:
                        _c.sent();
                        _c.label = 9;
                    case 9:
                        if (!estimateId) return [3 /*break*/, 13];
                        return [4 /*yield*/, database.select().from(schema_1.estimates).where(drizzle_orm_1.eq(schema_1.estimates.id, estimateId)).limit(1)];
                    case 10:
                        estimateResult = _c.sent();
                        estimate = estimateResult[0];
                        if (!(estimate && estimate.status === 'accepted')) return [3 /*break*/, 13];
                        return [4 /*yield*/, database.update(schema_1.estimates).set({
                                status: 'completed'
                            }).where(drizzle_orm_1.eq(schema_1.estimates.id, estimateId))];
                    case 11:
                        _c.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "estimate_completed",
                                entityType: "estimate",
                                entityId: estimateId,
                                description: "Estimate " + estimate.estimateNumber + " marked as completed due to payment received"
                            })];
                    case 12:
                        _c.sent();
                        _c.label = 13;
                    case 13:
                        if (!receiptId) return [3 /*break*/, 17];
                        return [4 /*yield*/, database.select().from(schema_1.receipts).where(drizzle_orm_1.eq(schema_1.receipts.id, receiptId)).limit(1)];
                    case 14:
                        receiptResult = _c.sent();
                        receipt = receiptResult[0];
                        if (!receipt) return [3 /*break*/, 17];
                        return [4 /*yield*/, database.update(schema_1.receipts).set({
                                paymentId: id
                            }).where(drizzle_orm_1.eq(schema_1.receipts.id, receiptId))];
                    case 15:
                        _c.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "receipt_linked",
                                entityType: "receipt",
                                entityId: receiptId,
                                description: "Receipt " + receipt.receiptNumber + " linked to payment " + id
                            })];
                    case 16:
                        _c.sent();
                        _c.label = 17;
                    case 17:
                        if (!invoice) return [3 /*break*/, 25];
                        return [4 /*yield*/, sendPaymentNotification(database, ctx.user.id, "recorded", input.amount, invoice.invoiceNumber, id)];
                    case 18:
                        _c.sent();
                        _c.label = 19;
                    case 19:
                        _c.trys.push([19, 21, , 22]);
                        dueDate = invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'Not set';
                        return [4 /*yield*/, emailNotifications_1.triggerEventNotification({
                                userId: ctx.user.id,
                                eventType: "payment_received",
                                recipientEmail: "client@example.com",
                                recipientName: "Client",
                                subject: "Payment Received - Invoice " + invoice.invoiceNumber,
                                htmlContent: "\n                <h2>Payment Received</h2>\n                <p>Thank you! We have received your payment of <strong>Ksh " + (input.amount / 100).toLocaleString("en-KE") + "</strong> for invoice <strong>" + invoice.invoiceNumber + "</strong>.</p>\n                " + (input.referenceNumber ? "<p><strong>Reference Number:</strong> " + input.referenceNumber + "</p>" : "") + "\n                <p>Your payment has been recorded and your receipt is available for download.</p>\n              ",
                                entityType: "payment",
                                entityId: id,
                                actionUrl: "/invoices/" + input.invoiceId
                            })];
                    case 20:
                        _c.sent();
                        return [3 /*break*/, 22];
                    case 21:
                        err_3 = _c.sent();
                        console.error("Failed to send payment received email:", err_3);
                        return [3 /*break*/, 22];
                    case 22:
                        _c.trys.push([22, 24, , 25]);
                        return [4 /*yield*/, triggerEngine_1.workflowTriggerEngine.trigger({
                                triggerType: "payment_received",
                                entityType: "payment",
                                entityId: id,
                                data: { paymentId: id, invoiceId: input.invoiceId, amount: input.amount },
                                userId: ctx.user.id
                            })];
                    case 23:
                        _c.sent();
                        return [3 /*break*/, 25];
                    case 24:
                        err_4 = _c.sent();
                        console.error("Workflow trigger (payment_received) failed:", err_4);
                        return [3 /*break*/, 25];
                    case 25: return [2 /*return*/, {
                            id: id,
                            invoiceStatus: invoice === null || invoice === void 0 ? void 0 : invoice.status,
                            message: "Payment recorded successfully and documents updated"
                        }];
                    case 26:
                        error_2 = _c.sent();
                        console.error("Error creating payment:", error_2);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to record payment: " + error_2.message
                        });
                    case 27: return [2 /*return*/];
                }
            });
        });
    }),
    update: createProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        invoiceId: zod_1.z.string().optional(),
        clientId: zod_1.z.string().optional(),
        amount: zod_1.z.number().optional(),
        paymentDate: zod_1.z.date().or(zod_1.z.string()).optional(),
        paymentMethod: zod_1.z["enum"](["cash", "bank_transfer", "cheque", "mpesa", "card", "other"]).optional(),
        referenceNumber: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional(),
        status: zod_1.z["enum"](["pending", "completed", "failed", "cancelled"]).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, id, updateData, convertToMySQLDateTime, formattedData, orgId, ownerCheck, currentPayment, payment, invoiceResult, invoice, paidPayments, totalPaid, invoiceTotal, newInvoiceStatus, err_5, err_6, err_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        id = input.id, updateData = __rest(input, ["id"]);
                        convertToMySQLDateTime = function (date) {
                            if (!date)
                                return undefined;
                            if (typeof date === 'string')
                                return new Date(date).toISOString().replace('T', ' ').substring(0, 19);
                            if (date instanceof Date)
                                return date.toISOString().replace('T', ' ').substring(0, 19);
                            return undefined;
                        };
                        formattedData = __assign({}, updateData);
                        if (updateData.paymentDate) {
                            formattedData.paymentDate = convertToMySQLDateTime(updateData.paymentDate);
                        }
                        orgId = ctx.user.organizationId;
                        ownerCheck = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.payments.id, id), drizzle_orm_1.eq(schema_1.payments.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.payments.id, id);
                        return [4 /*yield*/, database.select().from(schema_1.payments).where(ownerCheck).limit(1)];
                    case 2:
                        currentPayment = _b.sent();
                        if (!currentPayment.length)
                            throw new Error("Payment not found");
                        payment = currentPayment[0];
                        return [4 /*yield*/, database.update(schema_1.payments).set(formattedData).where(drizzle_orm_1.eq(schema_1.payments.id, id))];
                    case 3:
                        _b.sent();
                        if (!(updateData.status === "completed" && (payment === null || payment === void 0 ? void 0 : payment.invoiceId))) return [3 /*break*/, 18];
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 17, , 18]);
                        return [4 /*yield*/, database.select().from(schema_1.invoices).where(drizzle_orm_1.eq(schema_1.invoices.id, payment.invoiceId)).limit(1)];
                    case 5:
                        invoiceResult = _b.sent();
                        invoice = invoiceResult[0];
                        if (!invoice) return [3 /*break*/, 16];
                        return [4 /*yield*/, database
                                .select({ total: schema_1.payments.amount })
                                .from(schema_1.payments)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.payments.invoiceId, payment.invoiceId), drizzle_orm_1.eq(schema_1.payments.status, 'completed')))];
                    case 6:
                        paidPayments = _b.sent();
                        totalPaid = paidPayments.reduce(function (sum, p) { return sum + (p.total || 0); }, 0);
                        invoiceTotal = invoice.total || 0;
                        newInvoiceStatus = invoice.status;
                        if (totalPaid >= invoiceTotal) {
                            newInvoiceStatus = 'paid';
                        }
                        else if (totalPaid > 0) {
                            newInvoiceStatus = 'partial';
                        }
                        // Update invoice with new paid amount and status
                        return [4 /*yield*/, database.update(schema_1.invoices).set({
                                paidAmount: totalPaid,
                                status: newInvoiceStatus
                            }).where(drizzle_orm_1.eq(schema_1.invoices.id, payment.invoiceId))];
                    case 7:
                        // Update invoice with new paid amount and status
                        _b.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "invoice_updated_via_payment",
                                entityType: "invoice",
                                entityId: payment.invoiceId,
                                description: "Invoice status updated to " + newInvoiceStatus + " with paid amount: Ksh " + totalPaid / 100
                            })];
                    case 8:
                        _b.sent();
                        _b.label = 9;
                    case 9:
                        _b.trys.push([9, 11, , 12]);
                        return [4 /*yield*/, triggerEngine_1.workflowTriggerEngine.trigger({
                                triggerType: "payment_received",
                                entityType: "payment",
                                entityId: id,
                                data: {
                                    paymentId: id,
                                    invoiceId: payment.invoiceId,
                                    amount: payment.amount,
                                    invoiceStatus: newInvoiceStatus
                                },
                                userId: ctx.user.id
                            })];
                    case 10:
                        _b.sent();
                        return [3 /*break*/, 12];
                    case 11:
                        err_5 = _b.sent();
                        console.error("Workflow trigger (payment_received) failed during payment update:", err_5);
                        return [3 /*break*/, 12];
                    case 12:
                        if (!(newInvoiceStatus === "paid")) return [3 /*break*/, 16];
                        _b.label = 13;
                    case 13:
                        _b.trys.push([13, 15, , 16]);
                        return [4 /*yield*/, triggerEngine_1.workflowTriggerEngine.trigger({
                                triggerType: "invoice_paid",
                                entityType: "invoice",
                                entityId: invoice.id,
                                data: {
                                    invoiceId: invoice.id,
                                    invoiceNumber: invoice.invoiceNumber,
                                    paidAmount: totalPaid
                                },
                                userId: ctx.user.id
                            })];
                    case 14:
                        _b.sent();
                        return [3 /*break*/, 16];
                    case 15:
                        err_6 = _b.sent();
                        console.error("Workflow trigger (invoice_paid) failed during payment update:", err_6);
                        return [3 /*break*/, 16];
                    case 16: return [3 /*break*/, 18];
                    case 17:
                        err_7 = _b.sent();
                        console.error("Error updating invoice from payment:", err_7);
                        return [3 /*break*/, 18];
                    case 18: return [4 /*yield*/, db.logActivity({
                            userId: ctx.user.id,
                            action: "payment_updated",
                            entityType: "payment",
                            entityId: id,
                            description: "Updated payment: " + id + ". New status: " + (updateData.status || 'unchanged')
                        })];
                    case 19:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    "delete": deleteProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, where;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.payments.id, input), drizzle_orm_1.eq(schema_1.payments.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.payments.id, input);
                        return [4 /*yield*/, database["delete"](schema_1.payments).where(where)];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "payment_deleted",
                                entityType: "payment",
                                entityId: input,
                                description: "Deleted payment: " + input
                            })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    recordPayment: approveProcedure
        .input(zod_1.z.object({
        invoiceId: zod_1.z.string(),
        clientId: zod_1.z.string(),
        amount: zod_1.z.number(),
        paymentDate: zod_1.z.date().or(zod_1.z.string()),
        paymentMethod: zod_1.z["enum"](["cash", "bank_transfer", "cheque", "mpesa", "card", "other"]),
        referenceNumber: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional(),
        autoMatch: zod_1.z.boolean().optional()["default"](true)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, paymentId, autoMatch, paymentData, convertToMySQLDateTime, invoiceResult, invoice, currentPaidAmount, newPaidAmount, invoiceTotal, invoiceStatus, isPaid, matchedDocuments, relatedEstimates, _i, relatedEstimates_1, estimate, receiptId, err_8, err_9, err_10, error_3;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error("Database not available");
                        paymentId = uuid_1.v4();
                        autoMatch = input.autoMatch, paymentData = __rest(input, ["autoMatch"]);
                        convertToMySQLDateTime = function (date) {
                            if (!date)
                                return new Date().toISOString().replace('T', ' ').substring(0, 19);
                            if (typeof date === 'string')
                                return new Date(date).toISOString().replace('T', ' ').substring(0, 19);
                            if (date instanceof Date)
                                return date.toISOString().replace('T', ' ').substring(0, 19);
                            return new Date().toISOString().replace('T', ' ').substring(0, 19);
                        };
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 28, , 29]);
                        return [4 /*yield*/, database.insert(schema_1.payments).values(__assign(__assign({ id: paymentId, organizationId: (_b = ctx.user.organizationId) !== null && _b !== void 0 ? _b : null }, paymentData), { paymentDate: convertToMySQLDateTime(input.paymentDate), createdBy: ctx.user.id }))];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, database.select().from(schema_1.invoices).where(drizzle_orm_1.eq(schema_1.invoices.id, input.invoiceId)).limit(1)];
                    case 4:
                        invoiceResult = _c.sent();
                        invoice = invoiceResult[0];
                        if (!invoice) {
                            throw new Error("Invoice not found");
                        }
                        currentPaidAmount = invoice.paidAmount || 0;
                        newPaidAmount = currentPaidAmount + input.amount;
                        invoiceTotal = invoice.total || 0;
                        invoiceStatus = invoice.status;
                        isPaid = false;
                        if (newPaidAmount >= invoiceTotal) {
                            invoiceStatus = 'paid';
                            isPaid = true;
                        }
                        else if (newPaidAmount > 0) {
                            invoiceStatus = 'partial';
                        }
                        return [4 /*yield*/, database.update(schema_1.invoices).set({
                                paidAmount: newPaidAmount,
                                status: invoiceStatus
                            }).where(drizzle_orm_1.eq(schema_1.invoices.id, input.invoiceId))];
                    case 5:
                        _c.sent();
                        matchedDocuments = {
                            invoice: {
                                id: invoice.id,
                                number: invoice.invoiceNumber,
                                status: invoiceStatus,
                                paidAmount: newPaidAmount,
                                total: invoiceTotal
                            },
                            estimates: [],
                            receipts: []
                        };
                        if (!(autoMatch && isPaid)) return [3 /*break*/, 14];
                        return [4 /*yield*/, database.select().from(schema_1.estimates).where(drizzle_orm_1.eq(schema_1.estimates.clientId, input.clientId))];
                    case 6:
                        relatedEstimates = _c.sent();
                        _i = 0, relatedEstimates_1 = relatedEstimates;
                        _c.label = 7;
                    case 7:
                        if (!(_i < relatedEstimates_1.length)) return [3 /*break*/, 11];
                        estimate = relatedEstimates_1[_i];
                        if (!(estimate.status === 'accepted' && estimate.total === invoiceTotal)) return [3 /*break*/, 10];
                        return [4 /*yield*/, database.update(schema_1.estimates).set({
                                status: 'completed'
                            }).where(drizzle_orm_1.eq(schema_1.estimates.id, estimate.id))];
                    case 8:
                        _c.sent();
                        matchedDocuments.estimates.push({
                            id: estimate.id,
                            number: estimate.estimateNumber,
                            status: 'completed'
                        });
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "estimate_auto_matched",
                                entityType: "estimate",
                                entityId: estimate.id,
                                description: "Estimate " + estimate.estimateNumber + " auto-matched and marked as completed"
                            })];
                    case 9:
                        _c.sent();
                        _c.label = 10;
                    case 10:
                        _i++;
                        return [3 /*break*/, 7];
                    case 11:
                        receiptId = uuid_1.v4();
                        return [4 /*yield*/, database.insert(schema_1.receipts).values({
                                id: receiptId,
                                receiptNumber: "RCP-" + Date.now(),
                                clientId: input.clientId,
                                paymentId: paymentId,
                                amount: input.amount,
                                paymentMethod: input.paymentMethod,
                                receiptDate: convertToMySQLDateTime(input.paymentDate),
                                notes: input.notes,
                                createdBy: ctx.user.id
                            })];
                    case 12:
                        _c.sent();
                        matchedDocuments.receipts.push({
                            id: receiptId,
                            number: "RCP-" + Date.now(),
                            status: 'created'
                        });
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "receipt_auto_created",
                                entityType: "receipt",
                                entityId: receiptId,
                                description: "Receipt automatically created for payment " + paymentId
                            })];
                    case 13:
                        _c.sent();
                        _c.label = 14;
                    case 14: return [4 /*yield*/, db.logActivity({
                            userId: ctx.user.id,
                            action: "payment_recorded",
                            entityType: "payment",
                            entityId: paymentId,
                            description: "Recorded payment of Ksh " + input.amount / 100 + " for invoice " + invoice.invoiceNumber
                        })];
                    case 15:
                        _c.sent();
                        // Send notification
                        return [4 /*yield*/, sendPaymentNotification(database, ctx.user.id, "recorded", input.amount, invoice.invoiceNumber, paymentId)];
                    case 16:
                        // Send notification
                        _c.sent();
                        _c.label = 17;
                    case 17:
                        _c.trys.push([17, 19, , 20]);
                        return [4 /*yield*/, emailNotifications_1.triggerEventNotification({
                                userId: ctx.user.id,
                                eventType: "payment_received",
                                recipientEmail: "client@example.com",
                                recipientName: "Client",
                                subject: "Payment Received - Invoice " + invoice.invoiceNumber,
                                htmlContent: "\n              <h2>Payment Received</h2>\n              <p>Thank you! We have received your payment of <strong>Ksh " + (input.amount / 100).toLocaleString("en-KE") + "</strong> for invoice <strong>" + invoice.invoiceNumber + "</strong>.</p>\n              " + (input.referenceNumber ? "<p><strong>Reference Number:</strong> " + input.referenceNumber + "</p>" : "") + "\n              <p>Your payment has been recorded and your receipt is available for download.</p>\n            ",
                                entityType: "payment",
                                entityId: paymentId,
                                actionUrl: "/invoices/" + input.invoiceId
                            })];
                    case 18:
                        _c.sent();
                        return [3 /*break*/, 20];
                    case 19:
                        err_8 = _c.sent();
                        console.error("Failed to send payment received email:", err_8);
                        return [3 /*break*/, 20];
                    case 20:
                        _c.trys.push([20, 22, , 23]);
                        return [4 /*yield*/, triggerEngine_1.workflowTriggerEngine.trigger({
                                triggerType: "payment_received",
                                entityType: "payment",
                                entityId: paymentId,
                                data: {
                                    paymentId: paymentId,
                                    invoiceId: input.invoiceId,
                                    amount: input.amount,
                                    referenceNumber: input.referenceNumber,
                                    invoiceStatus: invoiceStatus
                                },
                                userId: ctx.user.id
                            })];
                    case 21:
                        _c.sent();
                        return [3 /*break*/, 23];
                    case 22:
                        err_9 = _c.sent();
                        console.error("Workflow trigger (payment_received) failed:", err_9);
                        return [3 /*break*/, 23];
                    case 23:
                        if (!isPaid) return [3 /*break*/, 27];
                        _c.label = 24;
                    case 24:
                        _c.trys.push([24, 26, , 27]);
                        return [4 /*yield*/, triggerEngine_1.workflowTriggerEngine.trigger({
                                triggerType: "invoice_paid",
                                entityType: "invoice",
                                entityId: invoice.id,
                                data: {
                                    invoiceId: invoice.id,
                                    invoiceNumber: invoice.invoiceNumber,
                                    paidAmount: newPaidAmount
                                },
                                userId: ctx.user.id
                            })];
                    case 25:
                        _c.sent();
                        return [3 /*break*/, 27];
                    case 26:
                        err_10 = _c.sent();
                        console.error("Workflow trigger (invoice_paid) failed:", err_10);
                        return [3 /*break*/, 27];
                    case 27: return [2 /*return*/, {
                            paymentId: paymentId,
                            matchedDocuments: matchedDocuments,
                            message: "Payment recorded and documents matched successfully"
                        }];
                    case 28:
                        error_3 = _c.sent();
                        console.error("Error recording payment:", error_3);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to record payment: " + error_3.message
                        });
                    case 29: return [2 /*return*/];
                }
            });
        });
    })
});
