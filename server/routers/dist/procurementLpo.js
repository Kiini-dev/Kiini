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
exports.__esModule = true;
exports.lpoRouter = void 0;
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_extended_1 = require("../../drizzle/schema-extended");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
// Feature-based procedures
var readProcedure = trpc_1.protectedProcedure;
var createProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("lpo:create");
var updateProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("lpo:edit");
var deleteProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("lpo:delete");
exports.lpoRouter = trpc_1.router({
    list: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().optional(),
        offset: zod_1.z.number().optional(),
        status: zod_1.z["enum"](['draft', 'approved', 'sent', 'partially_received', 'received', 'cancelled', 'closed']).optional(),
        supplierId: zod_1.z.string().optional(),
        searchTerm: zod_1.z.string().optional()
    }).optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, query, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        query = database.select().from(schema_extended_1.lpos);
                        if (input === null || input === void 0 ? void 0 : input.status) {
                            query = query.where(drizzle_orm_1.eq(schema_extended_1.lpos.status, input.status));
                        }
                        if (input === null || input === void 0 ? void 0 : input.supplierId) {
                            query = query.where(drizzle_orm_1.eq(schema_extended_1.lpos.supplierId, input.supplierId));
                        }
                        return [4 /*yield*/, query.limit((input === null || input === void 0 ? void 0 : input.limit) || 100).offset((input === null || input === void 0 ? void 0 : input.offset) || 0)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3:
                        error_1 = _b.sent();
                        console.error("Error fetching LPO list:", error_1);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    getById: trpc_1.protectedProcedure
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
                        return [4 /*yield*/, database.select().from(schema_extended_1.lpos).where(drizzle_orm_1.eq(schema_extended_1.lpos.id, input)).limit(1)];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, result[0] || null];
                }
            });
        });
    }),
    getWithLineItems: trpc_1.protectedProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, lpoData;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, database.select().from(schema_extended_1.lpos).where(drizzle_orm_1.eq(schema_extended_1.lpos.id, input)).limit(1)];
                    case 2:
                        lpoData = _b.sent();
                        if (!lpoData.length)
                            return [2 /*return*/, null];
                        // lpoLineItems table doesn't exist - return LPO data without line items
                        return [2 /*return*/, __assign(__assign({}, lpoData[0]), { lineItems: [] })];
                }
            });
        });
    }),
    create: createProcedure
        .input(zod_1.z.object({
        lpoNumber: zod_1.z.string().min(1).max(100),
        supplierId: zod_1.z.string(),
        departmentId: zod_1.z.string().optional(),
        issueDate: zod_1.z.string(),
        expectedDeliveryDate: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        paymentTerms: zod_1.z.string().optional(),
        deliveryAddress: zod_1.z.string().optional(),
        lineItems: zod_1.z.array(zod_1.z.object({
            productId: zod_1.z.string().optional(),
            description: zod_1.z.string(),
            quantity: zod_1.z.number().positive(),
            unit: zod_1.z.string()["default"]('pcs'),
            unitPrice: zod_1.z.number().positive(),
            taxRate: zod_1.z.number().nonnegative().optional()["default"](0)
        }))
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, existing, lpoId, totalAmount, totalTaxAmount, netAmount, discountAmount, _i, _b, item, lineTotal;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database.select().from(schema_extended_1.lpos)
                                .where(drizzle_orm_1.eq(schema_extended_1.lpos.lpoNumber, input.lpoNumber))
                                .limit(1)];
                    case 2:
                        existing = _c.sent();
                        if (existing.length > 0) {
                            throw new Error("LPO with number '" + input.lpoNumber + "' already exists");
                        }
                        lpoId = uuid_1.v4();
                        totalAmount = 0;
                        totalTaxAmount = 0;
                        input.lineItems.forEach(function (item) {
                            var lineAmount = item.quantity * item.unitPrice;
                            var taxAmount = lineAmount * (item.taxRate || 0) / 100;
                            totalAmount += lineAmount;
                            totalTaxAmount += taxAmount;
                        });
                        netAmount = totalAmount + totalTaxAmount;
                        discountAmount = 0;
                        // Create LPO header
                        return [4 /*yield*/, database.insert(schema_extended_1.lpos).values({
                                id: lpoId,
                                lpoNumber: input.lpoNumber,
                                supplierId: input.supplierId,
                                departmentId: input.departmentId,
                                issueDate: new Date(input.issueDate),
                                expectedDeliveryDate: input.expectedDeliveryDate ? new Date(input.expectedDeliveryDate) : undefined,
                                description: input.description,
                                totalAmount: Math.round(totalAmount),
                                taxAmount: Math.round(totalTaxAmount),
                                discountAmount: discountAmount,
                                netAmount: Math.round(netAmount),
                                paymentTerms: input.paymentTerms,
                                status: 'draft',
                                createdBy: ctx.user.id
                            })];
                    case 3:
                        // Create LPO header
                        _c.sent();
                        _i = 0, _b = input.lineItems;
                        _c.label = 4;
                    case 4:
                        if (!(_i < _b.length)) return [3 /*break*/, 7];
                        item = _b[_i];
                        lineTotal = Math.round(item.quantity * item.unitPrice);
                        return [4 /*yield*/, database.insert(schema_extended_1.lpoLineItems).values({
                                id: uuid_1.v4(),
                                lpoId: lpoId,
                                productId: item.productId,
                                description: item.description,
                                quantity: item.quantity,
                                unit: item.unit,
                                unitPrice: Math.round(item.unitPrice),
                                taxRate: item.taxRate || 0,
                                lineTotal: lineTotal
                            })];
                    case 5:
                        _c.sent();
                        _c.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7: 
                    // Log activity
                    return [4 /*yield*/, db_1.logActivity({
                            userId: ctx.user.id,
                            action: "lpo_created",
                            entityType: "lpo",
                            entityId: lpoId,
                            description: "Created LPO: " + input.lpoNumber
                        })];
                    case 8:
                        // Log activity
                        _c.sent();
                        return [2 /*return*/, { id: lpoId }];
                }
            });
        });
    }),
    update: updateProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        lpoNumber: zod_1.z.string().optional(),
        expectedDeliveryDate: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        paymentTerms: zod_1.z.string().optional(),
        deliveryAddress: zod_1.z.string().optional(),
        status: zod_1.z["enum"](['draft', 'approved', 'sent', 'partially_received', 'received', 'cancelled', 'closed']).optional(),
        approvedBy: zod_1.z.string().optional(),
        approvalDate: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, lpoData, updateData;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database.select().from(schema_extended_1.lpos)
                                .where(drizzle_orm_1.eq(schema_extended_1.lpos.id, input.id))
                                .limit(1)];
                    case 2:
                        lpoData = _b.sent();
                        if (!lpoData.length)
                            throw new Error("LPO not found");
                        updateData = {};
                        if (input.lpoNumber)
                            updateData.lpoNumber = input.lpoNumber;
                        if (input.expectedDeliveryDate !== undefined)
                            updateData.expectedDeliveryDate = input.expectedDeliveryDate ? new Date(input.expectedDeliveryDate) : null;
                        if (input.description !== undefined)
                            updateData.description = input.description;
                        if (input.paymentTerms !== undefined)
                            updateData.paymentTerms = input.paymentTerms;
                        if (input.deliveryAddress !== undefined)
                            updateData.deliveryAddress = input.deliveryAddress;
                        if (input.status)
                            updateData.status = input.status;
                        if (input.approvedBy)
                            updateData.approvedBy = input.approvedBy;
                        if (input.approvalDate)
                            updateData.approvalDate = new Date(input.approvalDate);
                        return [4 /*yield*/, database.update(schema_extended_1.lpos).set(updateData).where(drizzle_orm_1.eq(schema_extended_1.lpos.id, input.id))];
                    case 3:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db_1.logActivity({
                                userId: ctx.user.id,
                                action: "lpo_updated",
                                entityType: "lpo",
                                entityId: input.id,
                                description: "Updated LPO: " + lpoData[0].lpoNumber
                            })];
                    case 4:
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
            var database, lpoData;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database.select().from(schema_extended_1.lpos)
                                .where(drizzle_orm_1.eq(schema_extended_1.lpos.id, input))
                                .limit(1)];
                    case 2:
                        lpoData = _b.sent();
                        if (!lpoData.length)
                            throw new Error("LPO not found");
                        // Delete line items first
                        return [4 /*yield*/, database["delete"](schema_extended_1.lpoLineItems).where(drizzle_orm_1.eq(schema_extended_1.lpoLineItems.lpoId, input))];
                    case 3:
                        // Delete line items first
                        _b.sent();
                        // Delete LPO
                        return [4 /*yield*/, database["delete"](schema_extended_1.lpos).where(drizzle_orm_1.eq(schema_extended_1.lpos.id, input))];
                    case 4:
                        // Delete LPO
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db_1.logActivity({
                                userId: ctx.user.id,
                                action: "lpo_deleted",
                                entityType: "lpo",
                                entityId: input,
                                description: "Deleted LPO: " + lpoData[0].lpoNumber
                            })];
                    case 5:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    getByStatus: readProcedure
        .input(zod_1.z["enum"](['draft', 'approved', 'sent', 'partially_received', 'received', 'cancelled', 'closed']))
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
                        return [4 /*yield*/, database.select().from(schema_extended_1.lpos)
                                .where(drizzle_orm_1.eq(schema_extended_1.lpos.status, input))];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    getBySupplier: readProcedure
        .input(zod_1.z.string())
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
                        return [4 /*yield*/, database.select().from(schema_extended_1.lpos)
                                .where(drizzle_orm_1.eq(schema_extended_1.lpos.supplierId, input))];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    getSummary: readProcedure
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, allLPOs, draftCount, approvedCount, totalValue;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        return [2 /*return*/, {
                                totalLPOs: 0,
                                draftLPOs: 0,
                                approvedLPOs: 0,
                                totalValue: 0
                            }];
                    return [4 /*yield*/, database.select().from(lpo)];
                case 2:
                    allLPOs = _a.sent();
                    draftCount = allLPOs.filter(function (l) { return l.status === 'draft'; }).length;
                    approvedCount = allLPOs.filter(function (l) { return l.status === 'approved' || l.status === 'sent'; }).length;
                    totalValue = allLPOs.reduce(function (sum, l) { return sum + (l.netAmount || 0); }, 0);
                    return [2 /*return*/, {
                            totalLPOs: allLPOs.length,
                            draftLPOs: draftCount,
                            approvedLPOs: approvedCount,
                            totalValue: totalValue
                        }];
            }
        });
    }); }),
    updateLineItem: updateProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        description: zod_1.z.string().optional(),
        quantity: zod_1.z.number().optional(),
        unit: zod_1.z.string().optional(),
        unitPrice: zod_1.z.number().optional(),
        taxRate: zod_1.z.number().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, lineItem, updateData;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database.select().from(schema_extended_1.lpoLineItems)
                                .where(drizzle_orm_1.eq(schema_extended_1.lpoLineItems.id, input.id))
                                .limit(1)];
                    case 2:
                        lineItem = _b.sent();
                        if (!lineItem.length)
                            throw new Error("Line item not found");
                        updateData = {};
                        if (input.description)
                            updateData.description = input.description;
                        if (input.quantity !== undefined)
                            updateData.quantity = input.quantity;
                        if (input.unit)
                            updateData.unit = input.unit;
                        if (input.unitPrice !== undefined)
                            updateData.unitPrice = Math.round(input.unitPrice);
                        if (input.taxRate !== undefined)
                            updateData.taxRate = input.taxRate;
                        if (input.quantity && input.unitPrice) {
                            updateData.lineTotal = Math.round(input.quantity * input.unitPrice);
                        }
                        return [4 /*yield*/, database.update(schema_extended_1.lpoLineItems).set(updateData).where(drizzle_orm_1.eq(schema_extended_1.lpoLineItems.id, input.id))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    deleteLineItem: deleteProcedure
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
                        return [4 /*yield*/, database.select().from(schema_extended_1.lpoLineItems)
                                .where(drizzle_orm_1.eq(schema_extended_1.lpoLineItems.id, input))
                                .limit(1)];
                    case 2:
                        lineItem = _b.sent();
                        if (!lineItem.length)
                            throw new Error("Line item not found");
                        return [4 /*yield*/, database["delete"](schema_extended_1.lpoLineItems).where(drizzle_orm_1.eq(schema_extended_1.lpoLineItems.id, input))];
                    case 3:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db_1.logActivity({
                                userId: ctx.user.id,
                                action: "lpo_line_item_deleted",
                                entityType: "lpo",
                                entityId: input,
                                description: "Deleted LPO line item"
                            })];
                    case 4:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    })
});
