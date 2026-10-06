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
exports.purchaseOrdersRouter = void 0;
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
 * Purchase Orders Router
 * Handles purchase order lifecycle with supplier linking and invoice matching
 */
var viewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("procurement:purchaseOrders:view");
var createProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("procurement:purchaseOrders:create");
var approveProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("procurement:purchaseOrders:approve");
var receiveProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("procurement:purchaseOrders:receive");
exports.purchaseOrdersRouter = trpc_1.router({
    list: viewProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().optional(),
        offset: zod_1.z.number().optional(),
        status: zod_1.z.string().optional(),
        supplierId: zod_1.z.string().optional()
    }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db_2, orgId, conditions, where, error_1;
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
                        conditions = [];
                        if (orgId)
                            conditions.push(drizzle_orm_1.eq(schema_extended_1.purchaseOrders.organizationId, orgId));
                        if (input === null || input === void 0 ? void 0 : input.status)
                            conditions.push(drizzle_orm_1.eq(schema_extended_1.purchaseOrders.status, input.status));
                        if (input === null || input === void 0 ? void 0 : input.supplierId)
                            conditions.push(drizzle_orm_1.eq(schema_extended_1.purchaseOrders.supplierId, input.supplierId));
                        where = conditions.length > 0 ? drizzle_orm_1.and.apply(void 0, conditions) : undefined;
                        return [4 /*yield*/, db_2.select().from(schema_extended_1.purchaseOrders)
                                .where(where)
                                .orderBy(drizzle_orm_1.desc(schema_extended_1.purchaseOrders.createdAt))
                                .limit((input === null || input === void 0 ? void 0 : input.limit) || 50)
                                .offset((input === null || input === void 0 ? void 0 : input.offset) || 0)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3:
                        error_1 = _b.sent();
                        console.error("Error listing purchase orders:", error_1);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    getById: viewProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db_3, orgId, where, result, po, items, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db_3 = _b.sent();
                        if (!db_3)
                            return [2 /*return*/, null];
                        orgId = ctx.user.organizationId;
                        where = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_extended_1.purchaseOrders.id, input), drizzle_orm_1.eq(schema_extended_1.purchaseOrders.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_extended_1.purchaseOrders.id, input);
                        return [4 /*yield*/, db_3.select().from(schema_extended_1.purchaseOrders).where(where).limit(1)];
                    case 2:
                        result = _b.sent();
                        if (!result.length)
                            return [2 /*return*/, null];
                        po = result[0];
                        return [4 /*yield*/, db_3.select().from(schema_extended_1.purchaseOrderItems)
                                .where(drizzle_orm_1.eq(schema_extended_1.purchaseOrderItems.purchaseOrderId, input))];
                    case 3:
                        items = _b.sent();
                        return [2 /*return*/, __assign(__assign({}, po), { items: items })];
                    case 4:
                        error_2 = _b.sent();
                        console.error("Error fetching purchase order:", error_2);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    create: createProcedure
        .input(zod_1.z.object({
        supplierId: zod_1.z.string(),
        supplierName: zod_1.z.string(),
        poDate: zod_1.z.string(),
        deliveryDate: zod_1.z.string(),
        items: zod_1.z.array(zod_1.z.object({
            description: zod_1.z.string(),
            quantity: zod_1.z.number().positive(),
            rate: zod_1.z.number().positive(),
            amount: zod_1.z.number().nonnegative()
        })).min(1),
        subtotal: zod_1.z.number().nonnegative(),
        taxAmount: zod_1.z.number().nonnegative().optional(),
        total: zod_1.z.number().nonnegative(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, id, now, poNumber, _i, _b, item, error_3;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _d.sent();
                        if (!database)
                            throw new Error("Database not available");
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 9, , 10]);
                        id = uuid_1.v4();
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        poNumber = "PO-" + new Date().getFullYear() + "-" + String(Math.random() * 100000).padStart(6, '0');
                        return [4 /*yield*/, database.insert(schema_extended_1.purchaseOrders).values({
                                id: id,
                                organizationId: (_c = ctx.user.organizationId) !== null && _c !== void 0 ? _c : null,
                                poNumber: poNumber,
                                supplierId: input.supplierId,
                                supplierName: input.supplierName,
                                poDate: input.poDate,
                                deliveryDate: input.deliveryDate,
                                subtotal: input.subtotal,
                                taxAmount: input.taxAmount || 0,
                                total: input.total,
                                status: "draft",
                                notes: input.notes || null,
                                createdBy: ctx.user.id,
                                createdAt: now,
                                updatedAt: now
                            })];
                    case 3:
                        _d.sent();
                        _i = 0, _b = input.items;
                        _d.label = 4;
                    case 4:
                        if (!(_i < _b.length)) return [3 /*break*/, 7];
                        item = _b[_i];
                        return [4 /*yield*/, database.insert(schema_extended_1.purchaseOrderItems).values({
                                id: uuid_1.v4(),
                                purchaseOrderId: id,
                                description: item.description,
                                quantity: item.quantity,
                                rate: item.rate,
                                amount: item.amount,
                                lineNumber: input.items.indexOf(item) + 1,
                                createdBy: ctx.user.id,
                                createdAt: now
                            })];
                    case 5:
                        _d.sent();
                        _d.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7: return [4 /*yield*/, db.logActivity({
                            userId: ctx.user.id,
                            action: "purchaseOrder_created",
                            entityType: "purchaseOrder",
                            entityId: id,
                            description: "Purchase order " + poNumber + " created for " + input.supplierName + ". Total: Ksh " + input.total
                        })];
                    case 8:
                        _d.sent();
                        return [2 /*return*/, { id: id, poNumber: poNumber }];
                    case 9:
                        error_3 = _d.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to create purchase order: " + error_3.message
                        });
                    case 10: return [2 /*return*/];
                }
            });
        });
    }),
    approve: approveProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var poId = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, result, po, now, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 6, , 7]);
                        return [4 /*yield*/, database.select().from(schema_extended_1.purchaseOrders)
                                .where(drizzle_orm_1.eq(schema_extended_1.purchaseOrders.id, poId)).limit(1)];
                    case 3:
                        result = _b.sent();
                        if (!result.length)
                            throw new Error("Purchase order not found");
                        po = result[0];
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, database.update(schema_extended_1.purchaseOrders).set({
                                status: "approved",
                                approvedBy: ctx.user.id,
                                approvedAt: now,
                                updatedAt: now
                            }).where(drizzle_orm_1.eq(schema_extended_1.purchaseOrders.id, poId))];
                    case 4:
                        _b.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "purchaseOrder_approved",
                                entityType: "purchaseOrder",
                                entityId: poId,
                                description: "Purchase order " + po.poNumber + " approved"
                            })];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 6:
                        error_4 = _b.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to approve purchase order: " + error_4.message
                        });
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    // Receive goods
    receiveGoods: receiveProcedure
        .input(zod_1.z.object({
        poId: zod_1.z.string(),
        receivedDate: zod_1.z.string(),
        receivedItems: zod_1.z.array(zod_1.z.object({
            itemId: zod_1.z.string(),
            quantityReceived: zod_1.z.number().positive()
        })),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, result, po, now, grno, grnId, allReceived, items, _loop_1, _i, items_1, item, state_1, error_5;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _d.sent();
                        if (!database)
                            throw new Error("Database not available");
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 11, , 12]);
                        return [4 /*yield*/, database.select().from(schema_extended_1.purchaseOrders)
                                .where(drizzle_orm_1.eq(schema_extended_1.purchaseOrders.id, input.poId)).limit(1)];
                    case 3:
                        result = _d.sent();
                        if (!result.length)
                            throw new Error("Purchase order not found");
                        po = result[0];
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        grno = "GRN-" + new Date().getFullYear() + "-" + String(Math.random() * 100000).padStart(6, '0');
                        grnId = uuid_1.v4();
                        return [4 /*yield*/, database.insert(schema_extended_1.goodsReceiptNotes).values({
                                id: grnId,
                                organizationId: (_b = ctx.user.organizationId) !== null && _b !== void 0 ? _b : null,
                                grno: grno,
                                purchaseOrderId: input.poId,
                                receivedDate: input.receivedDate,
                                totalQuantity: input.receivedItems.reduce(function (sum, item) { return sum + item.quantityReceived; }, 0),
                                notes: input.notes || null,
                                createdBy: ctx.user.id,
                                createdAt: now
                            })];
                    case 4:
                        _d.sent();
                        allReceived = true;
                        return [4 /*yield*/, database.select().from(schema_extended_1.purchaseOrderItems)
                                .where(drizzle_orm_1.eq(schema_extended_1.purchaseOrderItems.purchaseOrderId, input.poId))];
                    case 5:
                        items = _d.sent();
                        _loop_1 = function (item) {
                            var received = ((_c = input.receivedItems.find(function (r) { return r.itemId === item.id; })) === null || _c === void 0 ? void 0 : _c.quantityReceived) || 0;
                            if (received < item.quantity) {
                                allReceived = false;
                                return "break";
                            }
                        };
                        for (_i = 0, items_1 = items; _i < items_1.length; _i++) {
                            item = items_1[_i];
                            state_1 = _loop_1(item);
                            if (state_1 === "break")
                                break;
                        }
                        if (!allReceived) return [3 /*break*/, 7];
                        return [4 /*yield*/, database.update(schema_extended_1.purchaseOrders).set({
                                status: "received",
                                receivedAt: now,
                                updatedAt: now
                            }).where(drizzle_orm_1.eq(schema_extended_1.purchaseOrders.id, input.poId))];
                    case 6:
                        _d.sent();
                        return [3 /*break*/, 9];
                    case 7: return [4 /*yield*/, database.update(schema_extended_1.purchaseOrders).set({
                            status: "partially_received",
                            updatedAt: now
                        }).where(drizzle_orm_1.eq(schema_extended_1.purchaseOrders.id, input.poId))];
                    case 8:
                        _d.sent();
                        _d.label = 9;
                    case 9: return [4 /*yield*/, db.logActivity({
                            userId: ctx.user.id,
                            action: "purchaseOrder_goodsReceived",
                            entityType: "purchaseOrder",
                            entityId: input.poId,
                            description: "Goods received for PO " + po.poNumber + ". GRN: " + grno
                        })];
                    case 10:
                        _d.sent();
                        return [2 /*return*/, { success: true, grnId: grnId, grno: grno }];
                    case 11:
                        error_5 = _d.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to receive goods: " + error_5.message
                        });
                    case 12: return [2 /*return*/];
                }
            });
        });
    })
});
