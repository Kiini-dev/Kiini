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
exports.workflowAutomationRouter = void 0;
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var drizzle_orm_1 = require("drizzle-orm");
var schema_extended_1 = require("../../drizzle/schema-extended");
var uuid_1 = require("uuid");
var db = require("../db");
var server_1 = require("@trpc/server");
/**
 * Workflow Automation Router
 * Coordinates automatic transitions between accounting documents
 * Implements: Quote→Proposal→Contract→Invoice→Payment→Receipt chain
 */
var automationProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:automation:manage");
var readProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:automation:read");
exports.workflowAutomationRouter = trpc_1.router({
    // Configure workflow automation rules
    getAutomationRules: readProcedure
        .input(zod_1.z.object({
        workflowType: zod_1.z.string().optional()
    }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, conditions, where, error_1;
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
                        conditions = orgId ? [drizzle_orm_1.eq(schema_extended_1.automationConfigs.organizationId, orgId)] : [];
                        if (input === null || input === void 0 ? void 0 : input.workflowType) {
                            conditions.push(drizzle_orm_1.eq(schema_extended_1.automationConfigs.workflowType, input.workflowType));
                        }
                        where = conditions.length > 0 ? drizzle_orm_1.and.apply(void 0, conditions) : undefined;
                        return [4 /*yield*/, database.select().from(schema_extended_1.automationConfigs)
                                .where(where)
                                .orderBy(drizzle_orm_1.desc(schema_extended_1.automationConfigs.createdAt))];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3:
                        error_1 = _b.sent();
                        console.error("Error fetching automation rules:", error_1);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    // Execute workflow automation
    executeAutomation: automationProcedure
        .input(zod_1.z.object({
        workflowType: zod_1.z.string(),
        sourceEntityId: zod_1.z.string(),
        sourceEntityType: zod_1.z.string(),
        targetData: zod_1.z.record(zod_1.z.any()).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, automationId, now, targetEntityId, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        orgId = ctx.user.organizationId;
                        automationId = uuid_1.v4();
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        targetEntityId = uuid_1.v4();
                        // Log automation execution
                        return [4 /*yield*/, database.insert(schema_extended_1.workflowAutomationLogs).values({
                                id: automationId,
                                organizationId: orgId,
                                workflowType: input.workflowType,
                                sourceEntityId: input.sourceEntityId,
                                sourceEntityType: input.sourceEntityType,
                                targetEntityId: targetEntityId,
                                status: "completed",
                                executedBy: ctx.user.id,
                                executedAt: now,
                                createdAt: now
                            })];
                    case 3:
                        // Log automation execution
                        _b.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "workflow_automation_executed",
                                entityType: "automation",
                                entityId: automationId,
                                description: "Workflow automation executed: " + input.workflowType
                            })];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                automationId: automationId,
                                targetEntityId: targetEntityId,
                                message: "Successfully executed " + input.workflowType
                            }];
                    case 5:
                        error_2 = _b.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Automation failed: " + error_2.message
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    // Get automation execution history
    getAutomationHistory: readProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().optional(),
        offset: zod_1.z.number().optional()
    }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db_2, orgId, error_3;
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
                        return [4 /*yield*/, db_2.select().from(schema_extended_1.workflowAutomationLogs)
                                .where(drizzle_orm_1.eq(schema_extended_1.workflowAutomationLogs.organizationId, orgId))
                                .orderBy(drizzle_orm_1.desc(schema_extended_1.workflowAutomationLogs.executedAt))
                                .limit((input === null || input === void 0 ? void 0 : input.limit) || 50)
                                .offset((input === null || input === void 0 ? void 0 : input.offset) || 0)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3:
                        error_3 = _b.sent();
                        console.error("Error fetching automation history:", error_3);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    // Enable/disable automation
    toggleAutomation: automationProcedure
        .input(zod_1.z.object({
        workflowType: zod_1.z.string(),
        enabled: zod_1.z.boolean()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, now, existing, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 8, , 9]);
                        orgId = ctx.user.organizationId;
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, database.select().from(schema_extended_1.automationConfigs)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_extended_1.automationConfigs.organizationId, orgId), drizzle_orm_1.eq(schema_extended_1.automationConfigs.workflowType, input.workflowType))).limit(1)];
                    case 3:
                        existing = _b.sent();
                        if (!(existing.length > 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, database.update(schema_extended_1.automationConfigs).set({
                                enabled: input.enabled,
                                updatedAt: now
                            }).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_extended_1.automationConfigs.organizationId, orgId), drizzle_orm_1.eq(schema_extended_1.automationConfigs.workflowType, input.workflowType)))];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, database.insert(schema_extended_1.automationConfigs).values({
                            id: uuid_1.v4(),
                            organizationId: orgId,
                            workflowType: input.workflowType,
                            enabled: input.enabled,
                            createdAt: now
                        })];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7: return [2 /*return*/, { success: true }];
                    case 8:
                        error_4 = _b.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to toggle automation: " + error_4.message
                        });
                    case 9: return [2 /*return*/];
                }
            });
        });
    })
});
// Helper functions
function convertQuotationToProposal(database, quotationId, orgId, userId) {
    return __awaiter(this, void 0, Promise, function () {
        var quotation, q, proposalId, now, proposalNumber;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, database.select().from("quotations")
                        .where(drizzle_orm_1.eq("quotations.id", quotationId)).limit(1)];
                case 1:
                    quotation = _a.sent();
                    if (!quotation.length)
                        throw new Error("Quotation not found");
                    q = quotation[0];
                    proposalId = uuid_1.v4();
                    now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                    proposalNumber = "PROP-" + new Date().getFullYear() + "-" + String(Math.random() * 100000).padStart(6, '0');
                    return [4 /*yield*/, database.insert("proposals").values({
                            id: proposalId,
                            organizationId: orgId,
                            proposalNumber: proposalNumber,
                            clientId: q.supplierId,
                            clientName: q.supplierName,
                            amount: q.amount,
                            status: "sent",
                            createdBy: userId,
                            createdAt: now,
                            updatedAt: now
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, proposalId];
            }
        });
    });
}
function convertProposalToContract(database, proposalId, orgId, userId) {
    return __awaiter(this, void 0, Promise, function () {
        var proposal, p, contractId, now, contractNumber;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, database.select().from("proposals")
                        .where(drizzle_orm_1.eq("proposals.id", proposalId)).limit(1)];
                case 1:
                    proposal = _a.sent();
                    if (!proposal.length)
                        throw new Error("Proposal not found");
                    p = proposal[0];
                    contractId = uuid_1.v4();
                    now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                    contractNumber = "CTR-" + new Date().getFullYear() + "-" + String(Math.random() * 100000).padStart(6, '0');
                    return [4 /*yield*/, database.insert("contracts").values({
                            id: contractId,
                            organizationId: orgId,
                            contractNumber: contractNumber,
                            vendorId: p.clientId,
                            vendorName: p.clientName,
                            value: p.amount,
                            status: "active",
                            createdBy: userId,
                            createdAt: now,
                            updatedAt: now
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, contractId];
            }
        });
    });
}
function convertContractToInvoice(database, contractId, orgId, userId, targetData) {
    return __awaiter(this, void 0, Promise, function () {
        var contract, c, invoiceId, now, invoiceNumber;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, database.select().from("contracts")
                        .where(drizzle_orm_1.eq("contracts.id", contractId)).limit(1)];
                case 1:
                    contract = _a.sent();
                    if (!contract.length)
                        throw new Error("Contract not found");
                    c = contract[0];
                    invoiceId = uuid_1.v4();
                    now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                    invoiceNumber = "INV-" + new Date().getFullYear() + "-" + String(Math.random() * 100000).padStart(6, '0');
                    return [4 /*yield*/, database.insert("invoices").values({
                            id: invoiceId,
                            organizationId: orgId,
                            invoiceNumber: invoiceNumber,
                            clientId: c.vendorId,
                            clientName: c.vendorName,
                            amount: c.value,
                            total: c.value,
                            status: "sent",
                            invoiceDate: now.substring(0, 10),
                            dueDate: (targetData === null || targetData === void 0 ? void 0 : targetData.dueDate) || now.substring(0, 10),
                            createdBy: userId,
                            createdAt: now,
                            updatedAt: now
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, invoiceId];
            }
        });
    });
}
function createReceiptFromPayment(database, paymentId, orgId, userId) {
    return __awaiter(this, void 0, Promise, function () {
        var payment, p, receiptId, now, receiptNumber;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, database.select().from("payments")
                        .where(drizzle_orm_1.eq("payments.id", paymentId)).limit(1)];
                case 1:
                    payment = _a.sent();
                    if (!payment.length)
                        throw new Error("Payment not found");
                    p = payment[0];
                    receiptId = uuid_1.v4();
                    now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                    receiptNumber = "REC-" + new Date().getFullYear() + "-" + String(Math.random() * 100000).padStart(6, '0');
                    return [4 /*yield*/, database.insert("receipts").values({
                            id: receiptId,
                            organizationId: orgId,
                            receiptNumber: receiptNumber,
                            clientId: p.clientId,
                            paymentId: paymentId,
                            amount: p.amount,
                            createdBy: userId,
                            createdAt: now,
                            updatedAt: now
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, receiptId];
            }
        });
    });
}
function createPaymentFromExpense(database, expenseId, orgId, userId) {
    return __awaiter(this, void 0, Promise, function () {
        var expense, e, paymentId, now, paymentRef;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, database.select().from("expenses")
                        .where(drizzle_orm_1.eq("expenses.id", expenseId)).limit(1)];
                case 1:
                    expense = _a.sent();
                    if (!expense.length)
                        throw new Error("Expense not found");
                    e = expense[0];
                    paymentId = uuid_1.v4();
                    now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                    paymentRef = "PAY-" + new Date().getFullYear() + "-" + String(Math.random() * 100000).padStart(6, '0');
                    return [4 /*yield*/, database.insert("payments").values({
                            id: paymentId,
                            organizationId: orgId,
                            paymentRef: paymentRef,
                            amount: e.amount,
                            status: "pending",
                            expenseId: expenseId,
                            createdBy: userId,
                            createdAt: now,
                            updatedAt: now
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, paymentId];
            }
        });
    });
}
function createPaymentFromImprest(database, imprestId, orgId, userId) {
    return __awaiter(this, void 0, Promise, function () {
        var imprest, i, paymentId, now, paymentRef;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, database.select().from("imprests")
                        .where(drizzle_orm_1.eq("imprests.id", imprestId)).limit(1)];
                case 1:
                    imprest = _a.sent();
                    if (!imprest.length)
                        throw new Error("Imprest not found");
                    i = imprest[0];
                    paymentId = uuid_1.v4();
                    now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                    paymentRef = "PAY-" + new Date().getFullYear() + "-" + String(Math.random() * 100000).padStart(6, '0');
                    return [4 /*yield*/, database.insert("payments").values({
                            id: paymentId,
                            organizationId: orgId,
                            paymentRef: paymentRef,
                            amount: i.amount,
                            status: "completed",
                            imprestId: imprestId,
                            createdBy: userId,
                            createdAt: now,
                            updatedAt: now
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, paymentId];
            }
        });
    });
}
