"use strict";
/**
 * Document Management Router
 *
 * Handles document preview, bulk operations, and line items
 */
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.documentManagementRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
exports.documentManagementRouter = trpc_1.router({
    /**
     * Get invoice with line items
     */
    getInvoiceWithLineItems: trpc_1.createFeatureRestrictedProcedure("reports:export")
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, invoice, items, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.invoices)
                                .where(drizzle_orm_1.eq(schema_1.invoices.id, input.id))
                                .limit(1)];
                    case 3:
                        invoice = _b.sent();
                        if (!invoice.length)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.lineItems)
                                .where(drizzle_orm_1.eq(schema_1.lineItems.documentId, input.id))];
                    case 4:
                        items = _b.sent();
                        return [2 /*return*/, __assign(__assign({}, invoice[0]), { lineItems: items })];
                    case 5:
                        error_1 = _b.sent();
                        console.error("Get invoice error:", error_1);
                        return [2 /*return*/, null];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get receipt with line items
     */
    getReceiptWithLineItems: trpc_1.createFeatureRestrictedProcedure("reports:export")
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, receipt, items, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.receipts)
                                .where(drizzle_orm_1.eq(schema_1.receipts.id, input.id))
                                .limit(1)];
                    case 3:
                        receipt = _b.sent();
                        if (!receipt.length)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.lineItems)
                                .where(drizzle_orm_1.eq(schema_1.lineItems.documentId, input.id))];
                    case 4:
                        items = _b.sent();
                        return [2 /*return*/, __assign(__assign({}, receipt[0]), { lineItems: items })];
                    case 5:
                        error_2 = _b.sent();
                        console.error("Get receipt error:", error_2);
                        return [2 /*return*/, null];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get estimate with line items
     */
    getEstimateWithLineItems: trpc_1.createFeatureRestrictedProcedure("reports:export")
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, estimate, items, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.estimates)
                                .where(drizzle_orm_1.eq(schema_1.estimates.id, input.id))
                                .limit(1)];
                    case 3:
                        estimate = _b.sent();
                        if (!estimate.length)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.lineItems)
                                .where(drizzle_orm_1.eq(schema_1.lineItems.documentId, input.id))];
                    case 4:
                        items = _b.sent();
                        return [2 /*return*/, __assign(__assign({}, estimate[0]), { lineItems: items })];
                    case 5:
                        error_3 = _b.sent();
                        console.error("Get estimate error:", error_3);
                        return [2 /*return*/, null];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get line items for a document
     */
    getLineItems: trpc_1.createFeatureRestrictedProcedure("reports:export")
        .input(zod_1.z.object({ documentId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, items, error_4;
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
                                .from(schema_1.lineItems)
                                .where(drizzle_orm_1.eq(schema_1.lineItems.documentId, input.documentId))];
                    case 3:
                        items = _b.sent();
                        return [2 /*return*/, items];
                    case 4:
                        error_4 = _b.sent();
                        console.error("Get line items error:", error_4);
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Create line item
     */
    createLineItem: trpc_1.createFeatureRestrictedProcedure("reports:export")
        .input(zod_1.z.object({
        documentId: zod_1.z.string(),
        itemDescription: zod_1.z.string(),
        quantity: zod_1.z.number(),
        unitPrice: zod_1.z.number(),
        tax: zod_1.z.number().optional(),
        unitOfMeasure: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, lineTotal, taxAmount, result, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        lineTotal = input.quantity * input.unitPrice;
                        taxAmount = input.tax ? (lineTotal * input.tax) / 100 : 0;
                        return [4 /*yield*/, db.insert(schema_1.lineItems).values({
                                id: "li-" + Date.now(),
                                documentId: input.documentId,
                                documentType: 'invoice',
                                description: input.itemDescription,
                                quantity: input.quantity,
                                rate: input.unitPrice,
                                amount: Math.round(lineTotal + taxAmount),
                                taxRate: input.tax || 0,
                                taxAmount: Math.round(taxAmount)
                            })];
                    case 3:
                        result = _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 4:
                        error_5 = _b.sent();
                        console.error("Create line item error:", error_5);
                        return [2 /*return*/, { success: false }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Update line item
     */
    updateLineItem: trpc_1.createFeatureRestrictedProcedure("reports:export")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        itemDescription: zod_1.z.string().optional(),
        quantity: zod_1.z.number().optional(),
        unitPrice: zod_1.z.number().optional(),
        tax: zod_1.z.number().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, updateData, item, qty, price, tax, lineTotal, taxSafe, taxAmount, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 6, , 7]);
                        updateData = {};
                        if (input.itemDescription)
                            updateData.description = input.itemDescription;
                        if (input.quantity)
                            updateData.quantity = input.quantity;
                        if (input.unitPrice)
                            updateData.unitPrice = input.unitPrice;
                        if (input.tax !== undefined)
                            updateData.taxRate = input.tax;
                        if (!(input.quantity || input.unitPrice)) return [3 /*break*/, 4];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.lineItems)
                                .where(drizzle_orm_1.eq(schema_1.lineItems.id, input.id))
                                .limit(1)];
                    case 3:
                        item = _b.sent();
                        if (item.length) {
                            qty = input.quantity || item[0].quantity;
                            price = input.unitPrice || item[0].rate;
                            tax = input.tax !== undefined ? input.tax : item[0].taxRate;
                            lineTotal = qty * price;
                            taxSafe = tax !== null && tax !== void 0 ? tax : 0;
                            taxAmount = (lineTotal * taxSafe) / 100;
                            updateData.amount = Math.round(lineTotal + taxAmount);
                            updateData.taxRate = tax;
                            updateData.taxAmount = Math.round(taxAmount);
                        }
                        _b.label = 4;
                    case 4: return [4 /*yield*/, db.update(schema_1.lineItems).set(updateData).where(drizzle_orm_1.eq(schema_1.lineItems.id, input.id))];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 6:
                        error_6 = _b.sent();
                        console.error("Update line item error:", error_6);
                        return [2 /*return*/, { success: false }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Delete line item
     */
    deleteLineItem: trpc_1.createFeatureRestrictedProcedure("reports:export")
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db["delete"](schema_1.lineItems).where(drizzle_orm_1.eq(schema_1.lineItems.id, input.id))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 4:
                        error_7 = _b.sent();
                        console.error("Delete line item error:", error_7);
                        return [2 /*return*/, { success: false }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get document preview data
     */
    getDocumentPreview: trpc_1.createFeatureRestrictedProcedure("reports:export")
        .input(zod_1.z.object({
        documentType: zod_1.z["enum"](["invoice", "receipt", "estimate"]),
        documentId: zod_1.z.string()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, document, items, _b, inv, rec, est, clientInfo, clientData, error_8;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 18, , 19]);
                        document = null;
                        items = [];
                        _b = input.documentType;
                        switch (_b) {
                            case "invoice": return [3 /*break*/, 3];
                            case "receipt": return [3 /*break*/, 7];
                            case "estimate": return [3 /*break*/, 11];
                        }
                        return [3 /*break*/, 15];
                    case 3: return [4 /*yield*/, db
                            .select()
                            .from(schema_1.invoices)
                            .where(drizzle_orm_1.eq(schema_1.invoices.id, input.documentId))
                            .limit(1)];
                    case 4:
                        inv = _c.sent();
                        if (!inv.length) return [3 /*break*/, 6];
                        document = inv[0];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.lineItems)
                                .where(drizzle_orm_1.eq(schema_1.lineItems.documentId, input.documentId))];
                    case 5:
                        items = _c.sent();
                        _c.label = 6;
                    case 6: return [3 /*break*/, 15];
                    case 7: return [4 /*yield*/, db
                            .select()
                            .from(schema_1.receipts)
                            .where(drizzle_orm_1.eq(schema_1.receipts.id, input.documentId))
                            .limit(1)];
                    case 8:
                        rec = _c.sent();
                        if (!rec.length) return [3 /*break*/, 10];
                        document = rec[0];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.lineItems)
                                .where(drizzle_orm_1.eq(schema_1.lineItems.documentId, input.documentId))];
                    case 9:
                        items = _c.sent();
                        _c.label = 10;
                    case 10: return [3 /*break*/, 15];
                    case 11: return [4 /*yield*/, db
                            .select()
                            .from(schema_1.estimates)
                            .where(drizzle_orm_1.eq(schema_1.estimates.id, input.documentId))
                            .limit(1)];
                    case 12:
                        est = _c.sent();
                        if (!est.length) return [3 /*break*/, 14];
                        document = est[0];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.lineItems)
                                .where(drizzle_orm_1.eq(schema_1.lineItems.documentId, input.documentId))];
                    case 13:
                        items = _c.sent();
                        _c.label = 14;
                    case 14: return [3 /*break*/, 15];
                    case 15:
                        if (!document)
                            return [2 /*return*/, null];
                        clientInfo = null;
                        if (!document.clientId) return [3 /*break*/, 17];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.clients)
                                .where(drizzle_orm_1.eq(schema_1.clients.id, document.clientId))
                                .limit(1)];
                    case 16:
                        clientData = _c.sent();
                        if (clientData.length) {
                            clientInfo = clientData[0];
                        }
                        _c.label = 17;
                    case 17: return [2 /*return*/, {
                            document: document,
                            lineItems: items,
                            client: clientInfo
                        }];
                    case 18:
                        error_8 = _c.sent();
                        console.error("Get document preview error:", error_8);
                        return [2 /*return*/, null];
                    case 19: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get documents for bulk operations
     */
    getDocumentsForBulk: trpc_1.createFeatureRestrictedProcedure("reports:export")
        .input(zod_1.z.object({
        documentType: zod_1.z["enum"](["invoice", "receipt", "estimate"]),
        ids: zod_1.z.array(zod_1.z.string())
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, documents, _b, error_9;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 10, , 11]);
                        documents = [];
                        _b = input.documentType;
                        switch (_b) {
                            case "invoice": return [3 /*break*/, 3];
                            case "receipt": return [3 /*break*/, 5];
                            case "estimate": return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 9];
                    case 3: return [4 /*yield*/, db
                            .select()
                            .from(schema_1.invoices)
                            .where(drizzle_orm_1.inArray(schema_1.invoices.id, input.ids))];
                    case 4:
                        documents = _c.sent();
                        return [3 /*break*/, 9];
                    case 5: return [4 /*yield*/, db
                            .select()
                            .from(schema_1.receipts)
                            .where(drizzle_orm_1.inArray(schema_1.receipts.id, input.ids))];
                    case 6:
                        documents = _c.sent();
                        return [3 /*break*/, 9];
                    case 7: return [4 /*yield*/, db
                            .select()
                            .from(schema_1.estimates)
                            .where(drizzle_orm_1.inArray(schema_1.estimates.id, input.ids))];
                    case 8:
                        documents = _c.sent();
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/, documents];
                    case 10:
                        error_9 = _c.sent();
                        console.error("Get documents for bulk error:", error_9);
                        return [2 /*return*/, []];
                    case 11: return [2 /*return*/];
                }
            });
        });
    }),
    // Client-facing helper: get documents belonging to a client (invoices/receipts/estimates)
    getClientDocuments: trpc_1.createFeatureRestrictedProcedure("reports:export")
        .input(zod_1.z.object({ clientId: zod_1.z.string().optional() }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, clientId, invoiceDocs, receiptDocs, estimateDocs, tagged, error_10;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        clientId = (input === null || input === void 0 ? void 0 : input.clientId) || ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.clientId) || ctx.user.id;
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 6, , 7]);
                        return [4 /*yield*/, db.select().from(schema_1.invoices).where(drizzle_orm_1.eq(schema_1.invoices.clientId, clientId))];
                    case 3:
                        invoiceDocs = _c.sent();
                        return [4 /*yield*/, db.select().from(schema_1.receipts).where(drizzle_orm_1.eq(schema_1.receipts.clientId, clientId))];
                    case 4:
                        receiptDocs = _c.sent();
                        return [4 /*yield*/, db.select().from(schema_1.estimates).where(drizzle_orm_1.eq(schema_1.estimates.clientId, clientId))];
                    case 5:
                        estimateDocs = _c.sent();
                        tagged = __spreadArrays(invoiceDocs.map(function (d) { return (__assign(__assign({}, d), { documentType: 'invoice' })); }), receiptDocs.map(function (d) { return (__assign(__assign({}, d), { documentType: 'receipt' })); }), estimateDocs.map(function (d) { return (__assign(__assign({}, d), { documentType: 'estimate' })); }));
                        return [2 /*return*/, tagged];
                    case 6:
                        error_10 = _c.sent();
                        console.error('Get client documents error:', error_10);
                        return [2 /*return*/, []];
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get document status workflow
     */
    getDocumentWorkflow: trpc_1.createFeatureRestrictedProcedure("reports:export")
        .input(zod_1.z.object({
        documentType: zod_1.z["enum"](["invoice", "receipt", "estimate"]),
        documentId: zod_1.z.string()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var workflows, workflow;
            return __generator(this, function (_b) {
                workflows = {
                    invoice: {
                        draft: ["draft", "sent", "paid"],
                        sent: ["sent", "paid", "overdue"],
                        paid: ["paid"],
                        overdue: ["overdue", "paid"],
                        cancelled: ["cancelled"]
                    },
                    receipt: {
                        draft: ["draft", "issued"],
                        issued: ["issued", "void"],
                        "void": ["void"],
                        cancelled: ["cancelled"]
                    },
                    estimate: {
                        draft: ["draft", "sent", "accepted"],
                        sent: ["sent", "accepted", "rejected"],
                        accepted: ["accepted"],
                        rejected: ["rejected"],
                        expired: ["expired"]
                    }
                };
                workflow = workflows[input.documentType] || {};
                return [2 /*return*/, workflow];
            });
        });
    })
});
