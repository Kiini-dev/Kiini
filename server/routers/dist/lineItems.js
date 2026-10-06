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
exports.lineItemsRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var db = require("../db");
// Define typed procedures
var createProcedure = trpc_1.createFeatureRestrictedProcedure("lineItems:create");
exports.lineItemsRouter = trpc_1.router({
    // Get line items for a specific document
    getByDocumentId: trpc_1.createFeatureRestrictedProcedure("lineItems:view")
        .input(zod_1.z.object({
        documentId: zod_1.z.string(),
        documentType: zod_1.z["enum"](['invoice', 'estimate', 'receipt'])
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, database.select().from(schema_1.lineItems).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.lineItems.documentId, input.documentId), drizzle_orm_1.eq(schema_1.lineItems.documentType, input.documentType)))];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    // Get single line item
    getById: trpc_1.createFeatureRestrictedProcedure("lineItems:view")
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, database.select().from(schema_1.lineItems).where(drizzle_orm_1.eq(schema_1.lineItems.id, input)).limit(1)];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, result[0] || null];
                }
            });
        });
    }),
    // Create line item
    create: trpc_1.createFeatureRestrictedProcedure("lineItems:create")
        .input(zod_1.z.object({
        documentId: zod_1.z.string(),
        documentType: zod_1.z["enum"](['invoice', 'estimate', 'receipt']),
        description: zod_1.z.string().min(1).max(500),
        quantity: zod_1.z.number().positive(),
        rate: zod_1.z.number().positive(),
        amount: zod_1.z.number().nonnegative().optional(),
        productId: zod_1.z.string().optional(),
        serviceId: zod_1.z.string().optional(),
        taxRate: zod_1.z.number().nonnegative().optional(),
        taxAmount: zod_1.z.number().nonnegative().optional(),
        lineNumber: zod_1.z.number().nonnegative().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, id, amount, taxAmount, lineNumber;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        id = uuid_1.v4();
                        amount = input.amount || (input.quantity * input.rate);
                        taxAmount = input.taxAmount || (amount * (input.taxRate || 0) / 100);
                        lineNumber = input.lineNumber || 1;
                        return [4 /*yield*/, database.insert(schema_1.lineItems).values({
                                id: id,
                                documentId: input.documentId,
                                documentType: input.documentType,
                                description: input.description,
                                quantity: input.quantity,
                                rate: input.rate,
                                amount: amount,
                                productId: input.productId,
                                serviceId: input.serviceId,
                                taxRate: input.taxRate || 0,
                                taxAmount: taxAmount,
                                lineNumber: lineNumber,
                                createdBy: ctx.user.id
                            })];
                    case 2:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "line_item_created",
                                entityType: "lineItem",
                                entityId: id,
                                description: "Created line item: " + input.description
                            })];
                    case 3:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, { id: id }];
                }
            });
        });
    }),
    // Update line item
    update: trpc_1.createFeatureRestrictedProcedure("lineItems:edit")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        description: zod_1.z.string().min(1).max(500).optional(),
        quantity: zod_1.z.number().positive().optional(),
        rate: zod_1.z.number().positive().optional(),
        amount: zod_1.z.number().nonnegative().optional(),
        taxRate: zod_1.z.number().nonnegative().optional(),
        taxAmount: zod_1.z.number().nonnegative().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, lineItem, updateData, qty, rate;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database.select().from(schema_1.lineItems).where(drizzle_orm_1.eq(schema_1.lineItems.id, input.id)).limit(1)];
                    case 2:
                        lineItem = _b.sent();
                        if (!lineItem.length)
                            throw new Error("Line item not found");
                        updateData = {};
                        if (input.description)
                            updateData.description = input.description;
                        if (input.quantity)
                            updateData.quantity = input.quantity;
                        if (input.rate)
                            updateData.rate = input.rate;
                        // Recalculate amount if quantity or rate changed
                        if (input.quantity || input.rate) {
                            qty = input.quantity || lineItem[0].quantity;
                            rate = input.rate || lineItem[0].rate;
                            updateData.amount = qty * rate;
                        }
                        if (input.amount !== undefined)
                            updateData.amount = input.amount;
                        if (input.taxRate !== undefined)
                            updateData.taxRate = input.taxRate;
                        if (input.taxAmount !== undefined)
                            updateData.taxAmount = input.taxAmount;
                        return [4 /*yield*/, database.update(schema_1.lineItems).set(updateData).where(drizzle_orm_1.eq(schema_1.lineItems.id, input.id))];
                    case 3:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "line_item_updated",
                                entityType: "lineItem",
                                entityId: input.id,
                                description: "Updated line item: " + lineItem[0].description
                            })];
                    case 4:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // Delete line item
    "delete": trpc_1.createFeatureRestrictedProcedure("lineItems:delete")
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, lineItem;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database.select().from(schema_1.lineItems).where(drizzle_orm_1.eq(schema_1.lineItems.id, input)).limit(1)];
                    case 2:
                        lineItem = _b.sent();
                        if (!lineItem.length)
                            throw new Error("Line item not found");
                        return [4 /*yield*/, database["delete"](schema_1.lineItems).where(drizzle_orm_1.eq(schema_1.lineItems.id, input))];
                    case 3:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "line_item_deleted",
                                entityType: "lineItem",
                                entityId: input,
                                description: "Deleted line item: " + lineItem[0].description
                            })];
                    case 4:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // Get line items summary for a document
    getSummary: trpc_1.createFeatureRestrictedProcedure("lineItems:view")
        .input(zod_1.z.object({
        documentId: zod_1.z.string(),
        documentType: zod_1.z["enum"](['invoice', 'estimate', 'receipt'])
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, items, subtotal, totalTax, total;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, {
                                    subtotal: 0,
                                    totalTax: 0,
                                    total: 0,
                                    itemCount: 0
                                }];
                        return [4 /*yield*/, database.select().from(schema_1.lineItems).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.lineItems.documentId, input.documentId), drizzle_orm_1.eq(schema_1.lineItems.documentType, input.documentType)))];
                    case 2:
                        items = _b.sent();
                        subtotal = items.reduce(function (sum, item) { return sum + (item.amount || 0); }, 0);
                        totalTax = items.reduce(function (sum, item) { return sum + (item.taxAmount || 0); }, 0);
                        total = subtotal + totalTax;
                        return [2 /*return*/, {
                                subtotal: subtotal,
                                totalTax: totalTax,
                                total: total,
                                itemCount: items.length
                            }];
                }
            });
        });
    }),
    // Bulk create line items
    bulkCreate: createProcedure
        .input(zod_1.z.object({
        documentId: zod_1.z.string(),
        documentType: zod_1.z["enum"](['invoice', 'estimate', 'receipt']),
        items: zod_1.z.array(zod_1.z.object({
            description: zod_1.z.string().min(1).max(500),
            quantity: zod_1.z.number().positive(),
            rate: zod_1.z.number().positive(),
            taxRate: zod_1.z.number().nonnegative().optional()
        })).min(1)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, results, i, item, id, amount, taxAmount, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        results = {
                            created: 0,
                            failed: 0,
                            errors: [],
                            ids: []
                        };
                        i = 0;
                        _b.label = 2;
                    case 2:
                        if (!(i < input.items.length)) return [3 /*break*/, 8];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 6, , 7]);
                        item = input.items[i];
                        id = uuid_1.v4();
                        amount = item.quantity * item.rate;
                        taxAmount = amount * (item.taxRate || 0) / 100;
                        return [4 /*yield*/, database.insert(schema_1.lineItems).values({
                                id: id,
                                documentId: input.documentId,
                                documentType: input.documentType,
                                description: item.description,
                                quantity: item.quantity,
                                rate: item.rate,
                                amount: amount,
                                taxRate: item.taxRate || 0,
                                taxAmount: taxAmount,
                                lineNumber: i + 1,
                                createdBy: ctx.user.id
                            })];
                    case 4:
                        _b.sent();
                        results.created++;
                        results.ids.push(id);
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "line_item_created",
                                entityType: "lineItem",
                                entityId: id,
                                description: "Bulk created line item: " + item.description
                            })];
                    case 5:
                        // Log activity
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _b.sent();
                        results.failed++;
                        results.errors.push("Error creating line item " + (i + 1) + ": " + error_1);
                        return [3 /*break*/, 7];
                    case 7:
                        i++;
                        return [3 /*break*/, 2];
                    case 8: return [2 /*return*/, results];
                }
            });
        });
    }),
    // Bulk delete line items
    bulkDelete: trpc_1.createFeatureRestrictedProcedure("lineItems:delete")
        .input(zod_1.z.array(zod_1.z.string()).min(1))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, results, _i, input_1, itemId, lineItem, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        results = {
                            deleted: 0,
                            failed: 0,
                            errors: []
                        };
                        _i = 0, input_1 = input;
                        _b.label = 2;
                    case 2:
                        if (!(_i < input_1.length)) return [3 /*break*/, 9];
                        itemId = input_1[_i];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 7, , 8]);
                        return [4 /*yield*/, database.select().from(schema_1.lineItems).where(drizzle_orm_1.eq(schema_1.lineItems.id, itemId)).limit(1)];
                    case 4:
                        lineItem = _b.sent();
                        if (!lineItem.length) {
                            results.failed++;
                            results.errors.push("Line item " + itemId + " not found");
                            return [3 /*break*/, 8];
                        }
                        return [4 /*yield*/, database["delete"](schema_1.lineItems).where(drizzle_orm_1.eq(schema_1.lineItems.id, itemId))];
                    case 5:
                        _b.sent();
                        results.deleted++;
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "line_item_deleted",
                                entityType: "lineItem",
                                entityId: itemId,
                                description: "Bulk deleted line item: " + lineItem[0].description
                            })];
                    case 6:
                        // Log activity
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        error_2 = _b.sent();
                        results.failed++;
                        results.errors.push("Error deleting " + itemId + ": " + error_2);
                        return [3 /*break*/, 8];
                    case 8:
                        _i++;
                        return [3 /*break*/, 2];
                    case 9: return [2 /*return*/, results];
                }
            });
        });
    })
});
