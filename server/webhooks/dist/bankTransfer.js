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
exports.sendBankTransferReminder = exports.getPendingBankTransferInvoices = exports.getBankTransferDetails = exports.recordBankTransferPayment = void 0;
var db_1 = require("~/server/db");
var schema_1 = require("~/server/db/schema");
var drizzle_orm_1 = require("drizzle-orm");
var emailService_1 = require("~/server/email/emailService");
var logger_1 = require("~/server/utils/logger");
/**
 * Record a bank transfer payment
 * Called by super-admin after receiving bank confirmation
 */
function recordBankTransferPayment(request) {
    return __awaiter(this, void 0, Promise, function () {
        var invoiceId, organizationId, amount, bankName, accountHolder, referenceNumber, paymentDate, processedBy, invoice, paidDate, subscription, nextBillingDate, org, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 9, , 10]);
                    invoiceId = request.invoiceId, organizationId = request.organizationId, amount = request.amount, bankName = request.bankName, accountHolder = request.accountHolder, referenceNumber = request.referenceNumber, paymentDate = request.paymentDate, processedBy = request.processedBy;
                    logger_1.logger.info('[Bank Transfer] Recording payment', {
                        invoiceId: invoiceId,
                        organizationId: organizationId,
                        amount: amount,
                        bankName: bankName,
                        referenceNumber: referenceNumber
                    });
                    return [4 /*yield*/, db_1.db.query.invoices.findFirst({
                            where: drizzle_orm_1.eq(schema_1.invoices.id, invoiceId)
                        })];
                case 1:
                    invoice = _a.sent();
                    if (!invoice) {
                        logger_1.logger.warn('[Bank Transfer] Invoice not found', { invoiceId: invoiceId });
                        return [2 /*return*/, { success: false, error: 'Invoice not found' }];
                    }
                    if (Math.abs(invoice.totalAmount - amount) > 0.01) {
                        logger_1.logger.warn('[Bank Transfer] Amount mismatch', { expected: invoice.totalAmount, received: amount });
                        return [2 /*return*/, { success: false, error: 'Amount mismatch' }];
                    }
                    paidDate = new Date(paymentDate);
                    return [4 /*yield*/, db_1.db
                            .update(schema_1.invoices)
                            .set({
                            status: 'paid',
                            paidDate: paidDate,
                            paymentMethod: 'bank_transfer',
                            bankTransferReference: referenceNumber,
                            bankName: bankName,
                            accountHolder: accountHolder,
                            updatedAt: new Date()
                        })
                            .where(drizzle_orm_1.eq(schema_1.invoices.id, invoiceId))];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, db_1.db.query.organizationSubscriptions.findFirst({
                            where: drizzle_orm_1.eq(schema_1.organizationSubscriptions.organizationId, organizationId)
                        })];
                case 3:
                    subscription = _a.sent();
                    if (!subscription) return [3 /*break*/, 5];
                    nextBillingDate = new Date(paidDate);
                    nextBillingDate.setMonth(nextBillingDate.getMonth() + (subscription.billingCycleMonths || 1));
                    return [4 /*yield*/, db_1.db
                            .update(schema_1.organizationSubscriptions)
                            .set({
                            renewalDate: nextBillingDate,
                            nextBillingDate: nextBillingDate,
                            autoRenewEnabled: true,
                            updatedAt: new Date()
                        })
                            .where(drizzle_orm_1.eq(schema_1.organizationSubscriptions.organizationId, organizationId))];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [4 /*yield*/, db_1.db.query.organizations.findFirst({
                        where: drizzle_orm_1.eq(schema_2.organizations.id, organizationId)
                    })];
                case 6:
                    org = _a.sent();
                    if (!org) return [3 /*break*/, 8];
                    return [4 /*yield*/, emailService_1.sendEmail({
                            to: org.billingEmail || org.email || '',
                            subject: 'Bank Transfer Payment Received - Invoice Receipt',
                            template: 'payment-received-bank',
                            context: {
                                organizationName: org.name,
                                invoiceId: invoiceId,
                                amount: amount.toFixed(2),
                                currency: org.currency || 'KES',
                                bankName: bankName,
                                referenceNumber: referenceNumber,
                                date: paidDate.toLocaleDateString()
                            }
                        })];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8:
                    logger_1.logger.info('[Bank Transfer] Payment recorded successfully', { invoiceId: invoiceId, amount: amount, referenceNumber: referenceNumber });
                    return [2 /*return*/, { success: true }];
                case 9:
                    error_1 = _a.sent();
                    logger_1.logger.error('[Bank Transfer] Error recording payment:', error_1);
                    return [2 /*return*/, { success: false, error: error_1 instanceof Error ? error_1.message : 'Unknown error' }];
                case 10: return [2 /*return*/];
            }
        });
    });
}
exports.recordBankTransferPayment = recordBankTransferPayment;
/**
 * Get expected bank transfer details for customer
 * Shows where to transfer money from an invoice
 */
function getBankTransferDetails() {
    return __awaiter(this, void 0, Promise, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, {
                    bankName: process.env.BANK_NAME || 'Equity Bank Kenya',
                    accountName: process.env.BANK_ACCOUNT_NAME || 'Company Account',
                    accountNumber: process.env.BANK_ACCOUNT_NUMBER || '2010234567',
                    swiftCode: process.env.BANK_SWIFT_CODE || 'EQBLKENA',
                    bankCode: process.env.BANK_CODE || '043',
                    branch: process.env.BANK_BRANCH || 'Nairobi',
                    instructions: "\n      Please transfer the invoice amount to our bank account and include the invoice ID in the transfer reference.\n      Our team will verify and confirm the payment within 24 hours.\n    "
                }];
        });
    });
}
exports.getBankTransferDetails = getBankTransferDetails;
/**
 * Super-admin endpoint to view pending bank transfer payments
 * Helps identify which invoices are waiting for payment
 */
function getPendingBankTransferInvoices() {
    return __awaiter(this, void 0, Promise, function () {
        var pendingInvoices, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db_1.db.query.invoices.findMany({
                            where: drizzle_orm_2.and(drizzle_orm_1.eq(schema_1.invoices.status, 'pending'), drizzle_orm_1.eq(schema_1.invoices.paymentMethod, 'bank_transfer')),
                            "with": {
                                organization: true
                            },
                            orderBy: function (inv) { return inv.dueDate; }
                        })];
                case 1:
                    pendingInvoices = _a.sent();
                    return [2 /*return*/, pendingInvoices.map(function (inv) {
                            var _a, _b, _c, _d, _e;
                            return ({
                                invoiceId: inv.id,
                                organizationId: inv.organizationId,
                                organizationName: ((_a = inv.organization) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown',
                                amount: inv.totalAmount,
                                currency: ((_b = inv.organization) === null || _b === void 0 ? void 0 : _b.currency) || 'KES',
                                dueDate: inv.dueDate,
                                createdDate: inv.createdAt,
                                customerEmail: ((_c = inv.organization) === null || _c === void 0 ? void 0 : _c.billingEmail) || ((_d = inv.organization) === null || _d === void 0 ? void 0 : _d.email) || '',
                                customerPhone: ((_e = inv.organization) === null || _e === void 0 ? void 0 : _e.phoneNumber) || ''
                            });
                        })];
                case 2:
                    error_2 = _a.sent();
                    logger_1.logger.error('[Bank Transfer] Error fetching pending invoices:', error_2);
                    throw error_2;
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getPendingBankTransferInvoices = getPendingBankTransferInvoices;
/**
 * Send bank transfer payment reminder email
 */
function sendBankTransferReminder(organizationId, invoiceId) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, Promise, function () {
        var invoice, bankDetails, _e, _f, _g, error_3;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    _h.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, db_1.db.query.invoices.findFirst({
                            where: drizzle_orm_1.eq(schema_1.invoices.id, invoiceId),
                            "with": { organization: true }
                        })];
                case 1:
                    invoice = _h.sent();
                    if (!invoice) {
                        return [2 /*return*/, { success: false, error: 'Invoice not found' }];
                    }
                    bankDetails = getBankTransferDetails();
                    _e = emailService_1.sendEmail;
                    _f = {
                        to: ((_a = invoice.organization) === null || _a === void 0 ? void 0 : _a.billingEmail) || ((_b = invoice.organization) === null || _b === void 0 ? void 0 : _b.email) || '',
                        subject: "Payment Reminder - Invoice " + invoiceId,
                        template: 'bank-transfer-reminder'
                    };
                    _g = {
                        organizationName: (_c = invoice.organization) === null || _c === void 0 ? void 0 : _c.name,
                        invoiceId: invoiceId,
                        amount: invoice.totalAmount.toFixed(2),
                        currency: ((_d = invoice.organization) === null || _d === void 0 ? void 0 : _d.currency) || 'KES',
                        dueDate: invoice.dueDate.toLocaleDateString()
                    };
                    return [4 /*yield*/, bankDetails];
                case 2: return [4 /*yield*/, _e.apply(void 0, [(_f.context = (_g.bankDetails = _h.sent(),
                            _g),
                            _f)])];
                case 3:
                    _h.sent();
                    logger_1.logger.info('[Bank Transfer] Reminder sent', { invoiceId: invoiceId, organizationId: organizationId });
                    return [2 /*return*/, { success: true }];
                case 4:
                    error_3 = _h.sent();
                    logger_1.logger.error('[Bank Transfer] Error sending reminder:', error_3);
                    return [2 /*return*/, { success: false, error: error_3 instanceof Error ? error_3.message : 'Unknown error' }];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.sendBankTransferReminder = sendBankTransferReminder;
// Import required entities
var schema_2 = require("~/server/db/schema");
var drizzle_orm_2 = require("drizzle-orm");
