"use strict";
/**
 * Bulk Operations Router
 *
 * Provides bulk update, delete, and status change operations across modules
 */
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
exports.bulkOperationsRouter = void 0;
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
// Feature-based procedures
var invoiceUpdateProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("invoices:edit");
var invoiceDeleteProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("invoices:delete");
var expenseUpdateProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("expenses:edit");
var expenseDeleteProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("expenses:delete");
var projectUpdateProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("projects:edit");
var projectDeleteProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("projects:delete");
var paymentUpdateProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("payments:edit");
var paymentDeleteProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("payments:delete");
exports.bulkOperationsRouter = trpc_1.router({
    /**
     * Bulk update invoice status
     */
    updateInvoiceStatus: invoiceUpdateProcedure
        .input(zod_1.z.object({
        ids: zod_1.z.array(zod_1.z.string()),
        status: zod_1.z["enum"](["draft", "sent", "paid", "partial", "overdue", "cancelled"])
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, result, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { success: false, updated: 0 }];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db
                                .update(schema_1.invoices)
                                .set({ status: input.status })
                                .where(drizzle_orm_1.inArray(schema_1.invoices.id, input.ids))];
                    case 3:
                        result = _b.sent();
                        return [2 /*return*/, { success: true, updated: input.ids.length }];
                    case 4:
                        error_1 = _b.sent();
                        console.error("Bulk update error:", error_1);
                        return [2 /*return*/, { success: false, updated: 0 }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Bulk delete invoices
     */
    deleteInvoices: invoiceDeleteProcedure
        .input(zod_1.z.object({
        ids: zod_1.z.array(zod_1.z.string())
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { success: false, deleted: 0 }];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db["delete"](schema_1.invoices).where(drizzle_orm_1.inArray(schema_1.invoices.id, input.ids))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true, deleted: input.ids.length }];
                    case 4:
                        error_2 = _b.sent();
                        console.error("Bulk delete error:", error_2);
                        return [2 /*return*/, { success: false, deleted: 0 }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Bulk update expense status
     */
    updateExpenseStatus: expenseUpdateProcedure
        .input(zod_1.z.object({
        ids: zod_1.z.array(zod_1.z.string()),
        status: zod_1.z["enum"](["pending", "approved", "rejected", "paid"])
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { success: false, updated: 0 }];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db
                                .update(schema_1.expenses)
                                .set({ status: input.status })
                                .where(drizzle_orm_1.inArray(schema_1.expenses.id, input.ids))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true, updated: input.ids.length }];
                    case 4:
                        error_3 = _b.sent();
                        console.error("Bulk update error:", error_3);
                        return [2 /*return*/, { success: false, updated: 0 }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Bulk delete expenses
     */
    deleteExpenses: expenseDeleteProcedure
        .input(zod_1.z.object({
        ids: zod_1.z.array(zod_1.z.string())
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { success: false, deleted: 0 }];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db["delete"](schema_1.expenses).where(drizzle_orm_1.inArray(schema_1.expenses.id, input.ids))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true, deleted: input.ids.length }];
                    case 4:
                        error_4 = _b.sent();
                        console.error("Bulk delete error:", error_4);
                        return [2 /*return*/, { success: false, deleted: 0 }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Bulk update project status
     */
    updateProjectStatus: projectUpdateProcedure
        .input(zod_1.z.object({
        ids: zod_1.z.array(zod_1.z.string()),
        status: zod_1.z["enum"](["planning", "active", "on_hold", "completed", "cancelled"])
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { success: false, updated: 0 }];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db
                                .update(schema_1.projects)
                                .set({ status: input.status })
                                .where(drizzle_orm_1.inArray(schema_1.projects.id, input.ids))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true, updated: input.ids.length }];
                    case 4:
                        error_5 = _b.sent();
                        console.error("Bulk update error:", error_5);
                        return [2 /*return*/, { success: false, updated: 0 }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Bulk delete projects
     */
    deleteProjects: projectDeleteProcedure
        .input(zod_1.z.object({
        ids: zod_1.z.array(zod_1.z.string())
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { success: false, deleted: 0 }];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db["delete"](schema_1.projects).where(drizzle_orm_1.inArray(schema_1.projects.id, input.ids))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true, deleted: input.ids.length }];
                    case 4:
                        error_6 = _b.sent();
                        console.error("Bulk delete error:", error_6);
                        return [2 /*return*/, { success: false, deleted: 0 }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Bulk update payment status
     */
    updatePaymentStatus: paymentUpdateProcedure
        .input(zod_1.z.object({
        ids: zod_1.z.array(zod_1.z.string()),
        status: zod_1.z["enum"](["pending", "completed", "failed", "cancelled"])
    }))
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
                            return [2 /*return*/, { success: false, updated: 0 }];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db
                                .update(schema_1.payments)
                                .set({ status: input.status })
                                .where(drizzle_orm_1.inArray(schema_1.payments.id, input.ids))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true, updated: input.ids.length }];
                    case 4:
                        error_7 = _b.sent();
                        console.error("Bulk update error:", error_7);
                        return [2 /*return*/, { success: false, updated: 0 }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Bulk export quotes to CSV
     */
    exportQuotesToCSV: enhancedRbac_1.createFeatureRestrictedProcedure("quotes:view")
        .input(zod_1.z.object({
        filters: zod_1.z.object({
            status: zod_1.z["enum"](["draft", "sent", "accepted", "declined", "expired", "converted"]).optional(),
            dateFrom: zod_1.z.date().optional(),
            dateTo: zod_1.z.date().optional()
        }).optional()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, quotesSchema, query, quotesList, csv, error_8;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            return [2 /*return*/, { success: false, data: "", fileName: "", count: 0 }];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        quotesSchema = require("../../drizzle/schema").quotes;
                        query = db.select().from(quotesSchema);
                        // Apply filters
                        if ((_b = input === null || input === void 0 ? void 0 : input.filters) === null || _b === void 0 ? void 0 : _b.status) {
                            query = query.where(drizzle_orm_1.eq(quotesSchema.status, input.filters.status));
                        }
                        return [4 /*yield*/, query];
                    case 3:
                        quotesList = _c.sent();
                        csv = __spreadArrays([
                            ["Quote Number", "Client Name", "Subject", "Amount", "Tax", "Total", "Status", "Valid Until", "Created Date"].join(",")
                        ], quotesList.map(function (q) {
                            var _a, _b;
                            return [
                                q.quoteNumber || "",
                                "\"" + (((_a = q.clientName) === null || _a === void 0 ? void 0 : _a.replace(/"/g, '""')) || '') + "\"",
                                "\"" + (((_b = q.subject) === null || _b === void 0 ? void 0 : _b.replace(/"/g, '""')) || '') + "\"",
                                q.amount || "0",
                                q.taxAmount || "0",
                                q.total || "0",
                                q.status || "draft",
                                q.validUntil || "",
                                q.createdAt || "",
                            ].join(",");
                        })).join("\n");
                        return [2 /*return*/, {
                                success: true,
                                data: csv,
                                fileName: "quotes_export_" + new Date().toISOString().split("T")[0] + ".csv",
                                count: quotesList.length
                            }];
                    case 4:
                        error_8 = _c.sent();
                        console.error("Quote export error:", error_8);
                        return [2 /*return*/, { success: false, data: "", fileName: "", count: 0 }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Bulk import quotes from CSV
     */
    bulkImportQuotes: enhancedRbac_1.createFeatureRestrictedProcedure("quotes:edit")
        .input(zod_1.z.object({
        quotes: zod_1.z.array(zod_1.z.object({
            quoteNumber: zod_1.z.string(),
            clientId: zod_1.z.string().optional(),
            subject: zod_1.z.string(),
            subtotal: zod_1.z.number(),
            taxRate: zod_1.z.number()["default"](0),
            expirationDays: zod_1.z.number()["default"](30),
            items: zod_1.z.array(zod_1.z.object({
                description: zod_1.z.string(),
                quantity: zod_1.z.number(),
                unitPrice: zod_1.z.number()
            })).optional()
        })),
        dryRun: zod_1.z.boolean()["default"](false)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, quotesSchema, uuidv4, results, _i, _b, quoteData, id, taxAmount, total, error_9, error_10;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            return [2 /*return*/, { success: false, imported: 0, failed: [] }];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 11, , 12]);
                        quotesSchema = require("../../drizzle/schema").quotes;
                        uuidv4 = require("uuid").v4;
                        results = { imported: 0, failed: [] };
                        if (!!input.dryRun) return [3 /*break*/, 9];
                        _i = 0, _b = input.quotes;
                        _c.label = 3;
                    case 3:
                        if (!(_i < _b.length)) return [3 /*break*/, 8];
                        quoteData = _b[_i];
                        _c.label = 4;
                    case 4:
                        _c.trys.push([4, 6, , 7]);
                        id = uuidv4();
                        taxAmount = (quoteData.subtotal * quoteData.taxRate) / 100;
                        total = quoteData.subtotal + taxAmount;
                        return [4 /*yield*/, db.insert(quotesSchema).values({
                                id: id,
                                quoteNumber: quoteData.quoteNumber,
                                clientId: quoteData.clientId || null,
                                subject: quoteData.subject,
                                amount: quoteData.subtotal,
                                taxAmount: taxAmount,
                                total: total,
                                status: "draft",
                                validUntil: new Date(Date.now() + quoteData.expirationDays * 24 * 60 * 60 * 1000),
                                createdBy: ctx.user.id,
                                createdAt: new Date()
                            })];
                    case 5:
                        _c.sent();
                        results.imported++;
                        return [3 /*break*/, 7];
                    case 6:
                        error_9 = _c.sent();
                        results.failed.push({
                            quoteNumber: quoteData.quoteNumber,
                            error: error_9.message
                        });
                        return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 3];
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        results.imported = input.quotes.length;
                        _c.label = 10;
                    case 10: return [2 /*return*/, { success: true, imported: results.imported, failed: results.failed }];
                    case 11:
                        error_10 = _c.sent();
                        console.error("Quote import error:", error_10);
                        return [2 /*return*/, { success: false, imported: 0, failed: [] }];
                    case 12: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Bulk delete payments
     */
    deletePayments: paymentDeleteProcedure
        .input(zod_1.z.object({
        ids: zod_1.z.array(zod_1.z.string())
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, error_11;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { success: false, deleted: 0 }];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db["delete"](schema_1.payments).where(drizzle_orm_1.inArray(schema_1.payments.id, input.ids))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true, deleted: input.ids.length }];
                    case 4:
                        error_11 = _b.sent();
                        console.error("Bulk delete error:", error_11);
                        return [2 /*return*/, { success: false, deleted: 0 }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    })
});
