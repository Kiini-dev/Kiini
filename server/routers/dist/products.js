"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
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
exports.__esModule = true;
exports.productsRouter = void 0;
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var db = require("../db");
// Feature-based procedures
var readProcedure = trpc_1.protectedProcedure;
var createProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("products:create");
var updateProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("products:edit");
var deleteProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("products:delete");
exports.productsRouter = trpc_1.router({
    list: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().optional(),
        offset: zod_1.z.number().optional(),
        category: zod_1.z.string().optional()
    }).optional())
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
                        query = void 0;
                        if (orgId && (input === null || input === void 0 ? void 0 : input.category)) {
                            query = database.select().from(schema_1.products).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.products.organizationId, orgId), drizzle_orm_1.eq(schema_1.products.category, input.category)));
                        }
                        else if (orgId) {
                            query = database.select().from(schema_1.products).where(drizzle_orm_1.eq(schema_1.products.organizationId, orgId));
                        }
                        else if (input === null || input === void 0 ? void 0 : input.category) {
                            query = database.select().from(schema_1.products).where(drizzle_orm_1.eq(schema_1.products.category, input.category));
                        }
                        else {
                            query = database.select().from(schema_1.products);
                        }
                        return [4 /*yield*/, query.limit((input === null || input === void 0 ? void 0 : input.limit) || 100).offset((input === null || input === void 0 ? void 0 : input.offset) || 0)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3:
                        error_1 = _b.sent();
                        console.error("Error fetching products list:", error_1);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    getById: trpc_1.protectedProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, conditions, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, null];
                        orgId = ctx.user.organizationId;
                        conditions = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.products.id, input), drizzle_orm_1.eq(schema_1.products.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_1.products.id, input);
                        return [4 /*yield*/, database.select().from(schema_1.products).where(conditions).limit(1)];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, result[0] || null];
                }
            });
        });
    }),
    create: createProcedure
        .input(zod_1.z.object({
        productName: zod_1.z.string().min(1).max(255),
        description: zod_1.z.string().optional(),
        sku: zod_1.z.string().max(100).optional(),
        unitPrice: zod_1.z.number().nonnegative(),
        costPrice: zod_1.z.number().nonnegative().optional(),
        quantity: zod_1.z.number().nonnegative().optional(),
        minStockLevel: zod_1.z.number().nonnegative().optional(),
        maxStockLevel: zod_1.z.number().nonnegative().optional(),
        reorderLevel: zod_1.z.number().nonnegative().optional(),
        reorderQuantity: zod_1.z.number().nonnegative().optional(),
        category: zod_1.z.string().max(100).optional(),
        unit: zod_1.z.string().max(50).optional(),
        taxRate: zod_1.z.number().nonnegative().optional(),
        supplier: zod_1.z.string().max(255).optional(),
        location: zod_1.z.string().max(255).optional(),
        imageUrl: zod_1.z.string().url().optional().or(zod_1.z.literal("")),
        status: zod_1.z["enum"](['active', 'inactive']).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, existing, id, unitPriceInCents, costPriceInCents;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error("Database not available");
                        if (!input.sku) return [3 /*break*/, 3];
                        return [4 /*yield*/, database.select().from(schema_1.products).where(drizzle_orm_1.eq(schema_1.products.sku, input.sku)).limit(1)];
                    case 2:
                        existing = _c.sent();
                        if (existing.length > 0) {
                            throw new Error("Product with SKU '" + input.sku + "' already exists");
                        }
                        _c.label = 3;
                    case 3:
                        id = uuid_1.v4();
                        unitPriceInCents = Math.round((input.unitPrice || 0) * 100);
                        costPriceInCents = input.costPrice ? Math.round(input.costPrice * 100) : null;
                        return [4 /*yield*/, database.insert(schema_1.products).values({
                                id: id,
                                organizationId: (_b = ctx.user.organizationId) !== null && _b !== void 0 ? _b : null,
                                name: input.productName,
                                description: input.description || '',
                                sku: input.sku,
                                unitPrice: unitPriceInCents,
                                costPrice: costPriceInCents !== null && costPriceInCents !== void 0 ? costPriceInCents : undefined,
                                stockQuantity: input.quantity || 0,
                                minStockLevel: input.minStockLevel || 0,
                                maxStockLevel: input.maxStockLevel || undefined,
                                reorderLevel: input.reorderLevel || undefined,
                                reorderQuantity: input.reorderQuantity || undefined,
                                category: input.category,
                                unit: input.unit || 'pcs',
                                taxRate: input.taxRate ? Math.round(input.taxRate * 100) : 0,
                                supplier: input.supplier,
                                location: input.location,
                                imageUrl: input.imageUrl || undefined,
                                isActive: input.status === 'inactive' ? 0 : 1,
                                createdBy: ctx.user.id
                            })];
                    case 4:
                        _c.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "product_created",
                                entityType: "product",
                                entityId: id,
                                description: "Created product: " + input.productName
                            })];
                    case 5:
                        // Log activity
                        _c.sent();
                        return [2 /*return*/, { id: id }];
                }
            });
        });
    }),
    update: updateProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        productName: zod_1.z.string().min(1).max(255).optional(),
        description: zod_1.z.string().optional(),
        sku: zod_1.z.string().max(100).optional(),
        unitPrice: zod_1.z.number().nonnegative().optional(),
        costPrice: zod_1.z.number().nonnegative().optional(),
        quantity: zod_1.z.number().nonnegative().optional(),
        minStockLevel: zod_1.z.number().nonnegative().optional(),
        maxStockLevel: zod_1.z.number().nonnegative().optional(),
        reorderLevel: zod_1.z.number().nonnegative().optional(),
        reorderQuantity: zod_1.z.number().nonnegative().optional(),
        category: zod_1.z.string().max(100).optional(),
        unit: zod_1.z.string().max(50).optional(),
        taxRate: zod_1.z.number().nonnegative().optional(),
        supplier: zod_1.z.string().max(255).optional(),
        location: zod_1.z.string().max(255).optional(),
        imageUrl: zod_1.z.string().url().optional().or(zod_1.z.literal("")),
        status: zod_1.z["enum"](['active', 'inactive']).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, idCondition, product, existing, updateData;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        orgId = ctx.user.organizationId;
                        idCondition = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.products.id, input.id), drizzle_orm_1.eq(schema_1.products.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_1.products.id, input.id);
                        return [4 /*yield*/, database.select().from(schema_1.products).where(idCondition).limit(1)];
                    case 2:
                        product = _b.sent();
                        if (!product.length)
                            throw new Error("Product not found");
                        if (!(input.sku && input.sku !== product[0].sku)) return [3 /*break*/, 4];
                        return [4 /*yield*/, database.select().from(schema_1.products).where(drizzle_orm_1.eq(schema_1.products.sku, input.sku)).limit(1)];
                    case 3:
                        existing = _b.sent();
                        if (existing.length > 0) {
                            throw new Error("Product with SKU '" + input.sku + "' already exists");
                        }
                        _b.label = 4;
                    case 4:
                        updateData = {};
                        if (input.productName !== undefined)
                            updateData.name = input.productName;
                        if (input.description !== undefined)
                            updateData.description = input.description;
                        if (input.sku !== undefined)
                            updateData.sku = input.sku;
                        if (input.unitPrice !== undefined)
                            updateData.unitPrice = Math.round(input.unitPrice * 100);
                        if (input.costPrice !== undefined)
                            updateData.costPrice = input.costPrice ? Math.round(input.costPrice * 100) : null;
                        if (input.quantity !== undefined)
                            updateData.stockQuantity = input.quantity;
                        if (input.minStockLevel !== undefined)
                            updateData.minStockLevel = input.minStockLevel;
                        if (input.maxStockLevel !== undefined)
                            updateData.maxStockLevel = input.maxStockLevel;
                        if (input.reorderLevel !== undefined)
                            updateData.reorderLevel = input.reorderLevel;
                        if (input.reorderQuantity !== undefined)
                            updateData.reorderQuantity = input.reorderQuantity;
                        if (input.category !== undefined)
                            updateData.category = input.category;
                        if (input.unit !== undefined)
                            updateData.unit = input.unit;
                        if (input.taxRate !== undefined)
                            updateData.taxRate = input.taxRate ? Math.round(input.taxRate * 100) : 0;
                        if (input.supplier !== undefined)
                            updateData.supplier = input.supplier;
                        if (input.location !== undefined)
                            updateData.location = input.location;
                        if (input.imageUrl !== undefined)
                            updateData.imageUrl = input.imageUrl || undefined;
                        if (input.status !== undefined)
                            updateData.isActive = input.status === 'inactive' ? 0 : 1;
                        return [4 /*yield*/, database.update(schema_1.products).set(updateData).where(idCondition)];
                    case 5:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "product_updated",
                                entityType: "product",
                                entityId: input.id,
                                description: "Updated product: " + product[0].name
                            })];
                    case 6:
                        // Log activity
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
            var database, orgId, idCondition, product;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        orgId = ctx.user.organizationId;
                        idCondition = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.products.id, input), drizzle_orm_1.eq(schema_1.products.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_1.products.id, input);
                        return [4 /*yield*/, database.select().from(schema_1.products).where(idCondition).limit(1)];
                    case 2:
                        product = _b.sent();
                        if (!product.length)
                            throw new Error("Product not found");
                        return [4 /*yield*/, database["delete"](schema_1.products).where(idCondition)];
                    case 3:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "product_deleted",
                                entityType: "product",
                                entityId: input,
                                description: "Deleted product: " + product[0].name
                            })];
                    case 4:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    getByCategory: readProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, conditions;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        orgId = ctx.user.organizationId;
                        conditions = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.products.category, input), drizzle_orm_1.eq(schema_1.products.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_1.products.category, input);
                        return [4 /*yield*/, database.select().from(schema_1.products).where(conditions)];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    getActive: readProcedure
        .query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, conditions;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        orgId = ctx.user.organizationId;
                        conditions = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.products.isActive, 1), drizzle_orm_1.eq(schema_1.products.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_1.products.isActive, 1);
                        return [4 /*yield*/, database.select().from(schema_1.products).where(conditions)];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    getSummary: readProcedure
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, allProducts, totalValue, activeProducts, lowStockCount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        return [2 /*return*/, {
                                totalProducts: 0,
                                activeProducts: 0,
                                totalValue: 0,
                                lowStockCount: 0
                            }];
                    return [4 /*yield*/, database.select().from(schema_1.products)];
                case 2:
                    allProducts = _a.sent();
                    totalValue = allProducts.reduce(function (sum, p) { return sum + ((p.unitPrice || 0) * (p.stockQuantity || 0)); }, 0);
                    activeProducts = allProducts.filter(function (p) { return p.isActive === 1; }).length;
                    lowStockCount = allProducts.filter(function (p) { return (p.stockQuantity || 0) < 10; }).length;
                    return [2 /*return*/, {
                            totalProducts: allProducts.length,
                            activeProducts: activeProducts,
                            totalValue: totalValue,
                            lowStockCount: lowStockCount
                        }];
            }
        });
    }); }),
    bulkDelete: deleteProcedure
        .input(zod_1.z.array(zod_1.z.string()).min(1))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, results, _i, input_1, productId, product, error_2;
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
                        productId = input_1[_i];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 7, , 8]);
                        return [4 /*yield*/, database.select().from(schema_1.products).where(drizzle_orm_1.eq(schema_1.products.id, productId)).limit(1)];
                    case 4:
                        product = _b.sent();
                        if (!product.length) {
                            results.failed++;
                            results.errors.push("Product " + productId + " not found");
                            return [3 /*break*/, 8];
                        }
                        return [4 /*yield*/, database["delete"](schema_1.products).where(drizzle_orm_1.eq(schema_1.products.id, productId))];
                    case 5:
                        _b.sent();
                        results.deleted++;
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "product_deleted",
                                entityType: "product",
                                entityId: productId,
                                description: "Bulk deleted product: " + product[0].name
                            })];
                    case 6:
                        // Log activity
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        error_2 = _b.sent();
                        results.failed++;
                        results.errors.push("Error deleting " + productId + ": " + error_2);
                        return [3 /*break*/, 8];
                    case 8:
                        _i++;
                        return [3 /*break*/, 2];
                    case 9: return [2 /*return*/, results];
                }
            });
        });
    }),
    // Get categories for dropdown
    getCategories: readProcedure
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, result, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, database.selectDistinct({ category: schema_1.products.category })
                            .from(schema_1.products)
                            .where(drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["", " IS NOT NULL AND ", " != ''"], ["", " IS NOT NULL AND ", " != ''"])), schema_1.products.category, schema_1.products.category))
                            .orderBy(schema_1.products.category)];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result.map(function (r) { return r.category; }).filter(Boolean)];
                case 3:
                    error_3 = _a.sent();
                    console.error("Error fetching product categories:", error_3);
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    }); })
});
var templateObject_1;
