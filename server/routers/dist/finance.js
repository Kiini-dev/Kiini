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
exports.financeRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_extended_1 = require("../../drizzle/schema-extended");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
/**
 * Simple finance utilities: account mapping and reconciliation.
 * Mappings are stored as settings using keys:
 *   vendor_{vendorId}_expenseAccount
 *   vendor_{vendorId}_payableAccount
 * Falling back to general settings defaultExpenseAccount and accountsPayableAccount.
 */
exports.financeRouter = trpc_1.router({
    setVendorAccounts: trpc_1.createFeatureRestrictedProcedure("finance:manage")
        .input(zod_1.z.object({ vendorId: zod_1.z.string(), expenseAccountId: zod_1.z.string(), payableAccountId: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("DB not available");
                        return [4 /*yield*/, db.setSetting("vendor_" + input.vendorId + "_expenseAccount", input.expenseAccountId, 'accounting')];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, db.setSetting("vendor_" + input.vendorId + "_payableAccount", input.payableAccountId, 'accounting')];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    getVendorAccounts: trpc_1.createFeatureRestrictedProcedure("finance:read")
        .input(zod_1.z.string()) // vendorId
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, exp, pay;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { expense: null, payable: null }];
                        return [4 /*yield*/, db.getSetting("vendor_" + input + "_expenseAccount")];
                    case 2:
                        exp = _b.sent();
                        return [4 /*yield*/, db.getSetting("vendor_" + input + "_payableAccount")];
                    case 3:
                        pay = _b.sent();
                        return [2 /*return*/, { expense: (exp === null || exp === void 0 ? void 0 : exp.value) || null, payable: (pay === null || pay === void 0 ? void 0 : pay.value) || null }];
                }
            });
        });
    }),
    reconcileEntry: trpc_1.createFeatureRestrictedProcedure("finance:reconcile")
        .input(zod_1.z.object({ journalEntryId: zod_1.z.string(), notes: zod_1.z.string().optional() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("DB not available");
                        id = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_extended_1.journalEntryReconciliations).values({
                                id: id,
                                journalEntryId: input.journalEntryId,
                                reconciledBy: ctx.user.id,
                                notes: input.notes || null
                            })];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, db.logActivity({ userId: ctx.user.id, action: 'entry_reconciled', entityType: 'journalEntry', entityId: input.journalEntryId, description: input.notes || '' })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { id: id }];
                }
            });
        });
    }),
    listReconciliations: trpc_1.createFeatureRestrictedProcedure("finance:read")
        .input(zod_1.z.object({ journalEntryId: zod_1.z.string().optional(), notesSearch: zod_1.z.string().optional() }).optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, q;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        q = db.select().from(schema_extended_1.journalEntryReconciliations);
                        if (input === null || input === void 0 ? void 0 : input.journalEntryId)
                            q = q.where(drizzle_orm_1.eq(schema_extended_1.journalEntryReconciliations.journalEntryId, input.journalEntryId));
                        if (input === null || input === void 0 ? void 0 : input.notesSearch)
                            q = q.where(schema_extended_1.journalEntryReconciliations.notes.like("%" + input.notesSearch + "%"));
                        return [4 /*yield*/, q];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    exportReconciliations: trpc_1.createFeatureRestrictedProcedure("finance:export")
        .input(zod_1.z.object({ journalEntryId: zod_1.z.string().optional() }).optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, q, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        q = db.select().from(schema_extended_1.journalEntryReconciliations);
                        if (input === null || input === void 0 ? void 0 : input.journalEntryId)
                            q = q.where(drizzle_orm_1.eq(schema_extended_1.journalEntryReconciliations.journalEntryId, input.journalEntryId));
                        return [4 /*yield*/, q];
                    case 2:
                        rows = _b.sent();
                        // convert to CSV-like array of objects
                        return [2 /*return*/, rows.map(function (r) { return ({
                                id: r.id,
                                journalEntryId: r.journalEntryId,
                                reconciledBy: r.reconciledBy,
                                reconciledAt: r.reconciledAt,
                                notes: r.notes
                            }); })];
                }
            });
        });
    }),
    updateReconciliation: trpc_1.createFeatureRestrictedProcedure("finance:reconcile")
        .input(zod_1.z.object({ id: zod_1.z.string(), notes: zod_1.z.string().optional() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("DB not available");
                        return [4 /*yield*/, db.update(schema_extended_1.journalEntryReconciliations)
                                .set({ notes: input.notes || null })
                                .where(drizzle_orm_1.eq(schema_extended_1.journalEntryReconciliations.id, input.id))];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, db.logActivity({ userId: ctx.user.id, action: 'entry_reconciliation_updated', entityType: 'journalEntry', entityId: input.id, description: input.notes || '' })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    undoReconciliation: trpc_1.createFeatureRestrictedProcedure("finance:reconcile")
        .input(zod_1.z.string()) // reconciliation id
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("DB not available");
                        return [4 /*yield*/, db["delete"](schema_extended_1.journalEntryReconciliations).where(drizzle_orm_1.eq(schema_extended_1.journalEntryReconciliations.id, input))];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, db.logActivity({ userId: ctx.user.id, action: 'entry_reconciliation_undone', entityType: 'journalEntry', entityId: input, description: '' })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // placeholder export function for accounting software integration
    exportVendorAccounts: trpc_1.createFeatureRestrictedProcedure("finance:export")
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, settings;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db.getSettingsByCategory('accounting')];
                case 2:
                    settings = _a.sent();
                    return [2 /*return*/, settings.filter(function (s) { return s.key.startsWith('vendor_'); })];
            }
        });
    }); }),
    autoPostFromModule: trpc_1.createFeatureRestrictedProcedure("finance:manage")
        .input(zod_1.z.object({ module: zod_1.z.string(), recordId: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error('DB not ready');
                        // real implementation would look at module and recordId and generate appropriate entry
                        return [4 /*yield*/, db.logActivity({ userId: ctx.user.id, action: 'auto_post', entityType: input.module, entityId: input.recordId, description: '' })];
                    case 2:
                        // real implementation would look at module and recordId and generate appropriate entry
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // retrieve default account IDs stored in settings
    getDefaults: trpc_1.createFeatureRestrictedProcedure("finance:read")
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, exp, pay;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, { expense: null, payable: null }];
                    return [4 /*yield*/, db.getDefaultSetting('accounting', 'defaultExpenseAccount')];
                case 2:
                    exp = _a.sent();
                    return [4 /*yield*/, db.getDefaultSetting('accounting', 'accountsPayableAccount')];
                case 3:
                    pay = _a.sent();
                    return [2 /*return*/, { expense: (exp === null || exp === void 0 ? void 0 : exp.value) || null, payable: (pay === null || pay === void 0 ? void 0 : pay.value) || null }];
            }
        });
    }); }),
    // list all vendor-specific account mappings in the accounting category
    listVendorAccounts: trpc_1.createFeatureRestrictedProcedure("finance:read")
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, settings, result, map;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db.getSettingsByCategory('accounting')];
                case 2:
                    settings = _a.sent();
                    result = [];
                    map = {};
                    settings.forEach(function (s) {
                        if (s.key.startsWith('vendor_')) {
                            var m = s.key.match(/^vendor_(.+?)_(expense|payable)Account$/);
                            if (m) {
                                var vid = m[1];
                                var type = m[2];
                                map[vid] = map[vid] || {};
                                map[vid][type === 'expense' ? 'expense' : 'payable'] = s.value;
                            }
                        }
                    });
                    Object.entries(map).forEach(function (_a) {
                        var vid = _a[0], v = _a[1];
                        result.push({ vendorId: vid, expense: v.expense || null, payable: v.payable || null });
                    });
                    return [2 /*return*/, result];
            }
        });
    }); }),
    /**
     * AUTO-GENERATE RECEIPT: Called when invoice is marked as PAID
     * Creates receipt immediately and notifies customer
     */
    generateReceiptFromInvoice: trpc_1.createFeatureRestrictedProcedure("finance:manage")
        .input(zod_1.z.string()) // invoiceId
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, invoice, existingReceipt, receiptId, receiptNumber, receipt, emailError_1, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 10, , 11]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("DB not available");
                        return [4 /*yield*/, db.getInvoice(input)];
                    case 2:
                        invoice = _b.sent();
                        if (!invoice) {
                            throw new Error("Invoice not found");
                        }
                        return [4 /*yield*/, db.getReceiptByInvoiceId(input)];
                    case 3:
                        existingReceipt = _b.sent();
                        if (existingReceipt) {
                            return [2 /*return*/, {
                                    success: true,
                                    receipt: existingReceipt,
                                    message: "Receipt already generated for this invoice"
                                }];
                        }
                        receiptId = uuid_1.v4();
                        receiptNumber = "RCP-" + Date.now() + "-" + receiptId.substring(0, 8);
                        return [4 /*yield*/, db.createReceipt({
                                id: receiptId,
                                invoiceId: input,
                                receiptNumber: receiptNumber,
                                issuedDate: new Date().toISOString(),
                                totalAmount: invoice.totalAmount,
                                paymentStatus: "fully_paid",
                                notes: "Receipt auto-generated from Invoice #" + invoice.invoiceNumber + " on payment"
                            })];
                    case 4:
                        receipt = _b.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: "system",
                                action: "receipt_auto_generated",
                                entityType: "receipt",
                                entityId: receiptId,
                                description: "Receipt #" + receiptNumber + " automatically generated for Invoice #" + invoice.invoiceNumber
                            })];
                    case 5:
                        // Log activity
                        _b.sent();
                        _b.label = 6;
                    case 6:
                        _b.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, db.createCommunication({
                                id: uuid_1.v4(),
                                type: "email",
                                recipientEmail: invoice.clientEmail || process.env.COMPANY_EMAIL || "",
                                subject: "Receipt #" + receiptNumber + " - Payment Confirmation",
                                body: "Your payment has been received successfully. Please find attached your receipt #" + receiptNumber + " for amount " + invoice.totalAmount,
                                status: "pending",
                                reference: receiptId
                            })];
                    case 7:
                        _b.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        emailError_1 = _b.sent();
                        console.warn("[Finance] Email queue warning:", emailError_1);
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/, {
                            success: true,
                            receipt: receipt,
                            message: "Receipt generated and customer notified"
                        }];
                    case 10:
                        error_1 = _b.sent();
                        console.error("[Finance] Generate receipt error:", error_1);
                        throw new Error((error_1 === null || error_1 === void 0 ? void 0 : error_1.message) || "Failed to generate receipt");
                    case 11: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get all receipts for a client
     */
    getClientReceipts: trpc_1.createFeatureRestrictedProcedure("finance:read")
        .input(zod_1.z.object({
        limit: zod_1.z.number()["default"](50),
        offset: zod_1.z.number()["default"](0)
    }))
        .query(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, user, receipts, total, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { receipts: [], total: 0, success: true }];
                        return [4 /*yield*/, db.getUserById(ctx.user.id)];
                    case 2:
                        user = _b.sent();
                        if (!(user === null || user === void 0 ? void 0 : user.clientId)) {
                            return [2 /*return*/, { receipts: [], total: 0, success: true }];
                        }
                        return [4 /*yield*/, db.getClientReceipts(user.clientId, input.limit, input.offset)];
                    case 3:
                        receipts = _b.sent();
                        return [4 /*yield*/, db.getClientReceiptCount(user.clientId)];
                    case 4:
                        total = _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                receipts: receipts,
                                total: total,
                                page: Math.ceil(input.offset / input.limit) + 1,
                                pageSize: input.limit
                            }];
                    case 5:
                        error_2 = _b.sent();
                        console.error("[Finance] Get receipts error:", error_2);
                        return [2 /*return*/, {
                                success: false,
                                receipts: [],
                                total: 0,
                                error: error_2 === null || error_2 === void 0 ? void 0 : error_2.message
                            }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Download receipt as PDF
     */
    downloadReceiptPDF: trpc_1.createFeatureRestrictedProcedure("finance:read")
        .input(zod_1.z.string()) // receiptId
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, receipt, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("DB not available");
                        return [4 /*yield*/, db.getReceiptById(input)];
                    case 2:
                        receipt = _b.sent();
                        if (!receipt) {
                            throw new Error("Receipt not found");
                        }
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "receipt_downloaded",
                                entityType: "receipt",
                                entityId: input,
                                description: "Receipt #" + receipt.receiptNumber + " downloaded as PDF"
                            })];
                    case 3:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                receipt: receipt,
                                downloadUrl: "/api/receipts/" + input + "/pdf"
                            }];
                    case 4:
                        error_3 = _b.sent();
                        console.error("[Finance] Download receipt error:", error_3);
                        throw new Error((error_3 === null || error_3 === void 0 ? void 0 : error_3.message) || "Failed to download receipt");
                    case 5: return [2 /*return*/];
                }
            });
        });
    })
});
