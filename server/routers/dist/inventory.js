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
exports.inventoryRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var server_1 = require("@trpc/server");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var db = require("../db");
/**
 * Inventory Management Router
 * Handles inventory tracking, stock adjustments, and reorder management
 * Uses Drizzle ORM with proper database access via getDb()
 */
var inventoryCreateSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1),
    quantity: zod_1.z.number().int().nonnegative(),
    reorderLevel: zod_1.z.number().int().nonnegative(),
    unitCost: zod_1.z.number().int().nonnegative(),
    warehouseLocation: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional()
});
var stockAdjustmentSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1),
    quantityChange: zod_1.z.number().int(),
    reason: zod_1.z["enum"](["adjustment", "damage", "loss", "recount", "return"]),
    notes: zod_1.z.string().optional()
});
exports.inventoryRouter = trpc_1.router({
    /**
     * List all inventory items with product details
     */
    list: trpc_1.publicProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, inventories, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database) {
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
                        }
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.products)["catch"](function () { return []; })];
                    case 2:
                        inventories = _b.sent();
                        return [2 /*return*/, (inventories || []).map(function (item) { return ({
                                id: item.id,
                                sku: item.sku,
                                productName: item.name,
                                category: item.category,
                                quantity: item.stockQuantity || 0,
                                reorderLevel: item.reorderPoint || 0,
                                unitCost: item.unitPrice || 0,
                                costPrice: item.costPrice || 0,
                                createdAt: item.createdAt,
                                updatedAt: item.updatedAt
                            }); })];
                    case 3:
                        error_1 = _b.sent();
                        console.error("Error fetching inventory:", error_1);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to fetch inventory"
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get single inventory item
     */
    getById: trpc_1.publicProcedure
        .input(zod_1.z.object({ productId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, product, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database) {
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
                        }
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.products)
                                .where(drizzle_orm_1.eq(schema_1.products.id, input.productId))
                                .limit(1)
                                .then(function (result) { return result[0] || null; })["catch"](function () { return null; })];
                    case 2:
                        product = _b.sent();
                        if (!product) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Product not found"
                            });
                        }
                        return [2 /*return*/, {
                                id: product.id,
                                sku: product.sku,
                                productName: product.name,
                                category: product.category,
                                quantity: product.stockQuantity || 0,
                                reorderLevel: product.reorderPoint || 0,
                                unitCost: product.unitPrice || 0
                            }];
                    case 3:
                        error_2 = _b.sent();
                        console.error("Error fetching inventory:", error_2);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to fetch inventory"
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Create or update inventory record
     */
    create: trpc_1.publicProcedure
        .input(inventoryCreateSchema)
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, updated, error_3;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database) {
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
                        }
                        // Update product with inventory data
                        return [4 /*yield*/, database
                                .update(schema_1.products)
                                .set({
                                stockQuantity: input.quantity,
                                reorderPoint: input.reorderLevel,
                                unitPrice: input.unitCost,
                                updatedAt: new Date().toISOString().split('T')[0]
                            })
                                .where(drizzle_orm_1.eq(schema_1.products.id, input.productId))];
                    case 2:
                        // Update product with inventory data
                        _c.sent();
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.products)
                                .where(drizzle_orm_1.eq(schema_1.products.id, input.productId))
                                .limit(1)
                                .then(function (result) { return result[0] || null; })["catch"](function () { return null; })];
                    case 3:
                        updated = _c.sent();
                        if (!updated) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Product not found"
                            });
                        }
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || "system",
                                action: "inventory_updated",
                                description: "Updated inventory for product: " + updated.name,
                                entityType: "product",
                                entityId: input.productId
                            })];
                    case 4:
                        // Log activity
                        _c.sent();
                        return [2 /*return*/, {
                                success: true,
                                productId: updated.id,
                                message: "Inventory updated successfully"
                            }];
                    case 5:
                        error_3 = _c.sent();
                        console.error("Error creating inventory:", error_3);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: error_3 instanceof Error ? error_3.message : "Failed to create inventory"
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Adjust stock quantity (increase or decrease)
     */
    adjustStock: trpc_1.publicProcedure
        .input(stockAdjustmentSchema)
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, product, newQuantity, error_4;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database) {
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
                        }
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.products)
                                .where(drizzle_orm_1.eq(schema_1.products.id, input.productId))
                                .limit(1)
                                .then(function (result) { return result[0] || null; })["catch"](function () { return null; })];
                    case 2:
                        product = _c.sent();
                        if (!product) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Product not found"
                            });
                        }
                        newQuantity = Math.max(0, (product.stockQuantity || 0) + input.quantityChange);
                        // Update product quantity
                        return [4 /*yield*/, database
                                .update(schema_1.products)
                                .set({
                                stockQuantity: newQuantity,
                                updatedAt: new Date().toISOString().split('T')[0]
                            })
                                .where(drizzle_orm_1.eq(schema_1.products.id, input.productId))];
                    case 3:
                        // Update product quantity
                        _c.sent();
                        // Log stock movement
                        return [4 /*yield*/, db.logActivity({
                                userId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || "system",
                                action: "stock_adjusted",
                                description: "Stock adjusted by " + input.quantityChange + " units (" + input.reason + ")",
                                entityType: "product",
                                entityId: input.productId
                            })];
                    case 4:
                        // Log stock movement
                        _c.sent();
                        return [2 /*return*/, {
                                success: true,
                                productId: product.id,
                                productName: product.name,
                                oldQuantity: product.stockQuantity || 0,
                                newQuantity: newQuantity,
                                quantityChange: input.quantityChange,
                                reason: input.reason,
                                message: "Stock adjusted by " + input.quantityChange + " units"
                            }];
                    case 5:
                        error_4 = _c.sent();
                        console.error("Error adjusting stock:", error_4);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: error_4 instanceof Error ? error_4.message : "Failed to adjust stock"
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get low stock items (below reorder level)
     */
    getLowStockItems: trpc_1.publicProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, lowStockItems, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database) {
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
                        }
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.products)["catch"](function () { return []; })];
                    case 2:
                        lowStockItems = _b.sent();
                        return [2 /*return*/, (lowStockItems || [])
                                .filter(function (item) { return (item.stockQuantity || 0) <= (item.reorderPoint || 0); })
                                .map(function (item) { return ({
                                id: item.id,
                                sku: item.sku,
                                productName: item.name,
                                category: item.category,
                                quantity: item.stockQuantity || 0,
                                reorderLevel: item.reorderPoint || 0,
                                toOrder: Math.max(0, (item.reorderPoint || 0) - (item.stockQuantity || 0)),
                                unitCost: item.unitPrice || 0
                            }); })
                                .sort(function (a, b) { return a.quantity - b.quantity; })];
                    case 3:
                        error_5 = _b.sent();
                        console.error("Error fetching low stock items:", error_5);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get inventory value report
     */
    getInventoryValue: trpc_1.publicProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, productsData, items, totalValue, byCategory, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database) {
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
                        }
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.products)["catch"](function () { return []; })];
                    case 2:
                        productsData = _b.sent();
                        items = (productsData || []).map(function (item) { return ({
                            id: item.id,
                            name: item.name,
                            quantity: item.stockQuantity || 0,
                            unitPrice: item.unitPrice || 0,
                            totalValue: ((item.stockQuantity || 0) * (item.unitPrice || 0)) / 100,
                            category: item.category
                        }); });
                        totalValue = items.reduce(function (sum, item) { return sum + item.totalValue; }, 0);
                        byCategory = items.reduce(function (acc, item) {
                            acc[item.category] = (acc[item.category] || 0) + item.totalValue;
                            return acc;
                        }, {});
                        return [2 /*return*/, {
                                totalValue: totalValue,
                                totalItems: items.length,
                                byCategory: byCategory,
                                items: items
                            }];
                    case 3:
                        error_6 = _b.sent();
                        console.error("Error calculating inventory value:", error_6);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to calculate inventory value"
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Bulk adjust stock from CSV import
     */
    bulkAdjust: trpc_1.publicProcedure
        .input(zod_1.z.object({
        adjustments: zod_1.z.array(zod_1.z.object({
            productId: zod_1.z.string(),
            quantityChange: zod_1.z.number().int(),
            reason: zod_1.z.string()
        }))
    }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, results, _i, _b, adjustment, product, newQuantity, error_7, error_8;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 10, , 11]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _d.sent();
                        if (!database) {
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
                        }
                        results = [];
                        _i = 0, _b = input.adjustments;
                        _d.label = 2;
                    case 2:
                        if (!(_i < _b.length)) return [3 /*break*/, 8];
                        adjustment = _b[_i];
                        _d.label = 3;
                    case 3:
                        _d.trys.push([3, 6, , 7]);
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.products)
                                .where(drizzle_orm_1.eq(schema_1.products.id, adjustment.productId))
                                .limit(1)
                                .then(function (result) { return result[0] || null; })["catch"](function () { return null; })];
                    case 4:
                        product = _d.sent();
                        if (!product) {
                            results.push({
                                productId: adjustment.productId,
                                success: false,
                                error: "Product not found"
                            });
                            return [3 /*break*/, 7];
                        }
                        newQuantity = Math.max(0, (product.stockQuantity || 0) + adjustment.quantityChange);
                        return [4 /*yield*/, database
                                .update(schema_1.products)
                                .set({
                                stockQuantity: newQuantity,
                                updatedAt: new Date().toISOString().split('T')[0]
                            })
                                .where(drizzle_orm_1.eq(schema_1.products.id, adjustment.productId))];
                    case 5:
                        _d.sent();
                        results.push({
                            productId: adjustment.productId,
                            productName: product.name,
                            success: true,
                            oldQuantity: product.stockQuantity || 0,
                            newQuantity: newQuantity
                        });
                        return [3 /*break*/, 7];
                    case 6:
                        error_7 = _d.sent();
                        results.push({
                            productId: adjustment.productId,
                            success: false,
                            error: error_7 instanceof Error ? error_7.message : "Unknown error"
                        });
                        return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 2];
                    case 8: 
                    // Log bulk activity
                    return [4 /*yield*/, db.logActivity({
                            userId: ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id) || "system",
                            action: "inventory_bulk_adjusted",
                            description: "Bulk adjusted " + results.filter(function (r) { return r.success; }).length + "/" + input.adjustments.length + " items",
                            entityType: "inventory",
                            entityId: "bulk"
                        })];
                    case 9:
                        // Log bulk activity
                        _d.sent();
                        return [2 /*return*/, {
                                success: true,
                                totalAdjustments: input.adjustments.length,
                                successCount: results.filter(function (r) { return r.success; }).length,
                                results: results
                            }];
                    case 10:
                        error_8 = _d.sent();
                        console.error("Error bulk adjusting stock:", error_8);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to bulk adjust stock"
                        });
                    case 11: return [2 /*return*/];
                }
            });
        });
    })
});
