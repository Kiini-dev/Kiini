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
exports.procurementRouter = void 0;
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var server_1 = require("@trpc/server");
var uuid_1 = require("uuid");
/** Execute raw SQL via mysql2 pool. Returns the rows array. */
function rawQuery(query, params) {
    return __awaiter(this, void 0, Promise, function () {
        var pool, rows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pool = db_1.getPool();
                    if (!pool)
                        throw new Error("Database pool not available");
                    return [4 /*yield*/, pool.execute(query, params !== null && params !== void 0 ? params : [])];
                case 1:
                    rows = (_a.sent())[0];
                    return [2 /*return*/, rows];
            }
        });
    });
}
// Feature-based procedures
var readProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("procurement:read");
var writeProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("procurement:write");
/**
 * Comprehensive Procurement Router
 * Handles LPOs, Purchase Orders, Imprests, and related operations
 * with full CRUD, status management, and approval workflows
 */
// ============================================================================
// SCHEMAS
// ============================================================================
var lpoCreateSchema = zod_1.z.object({
    vendorName: zod_1.z.string().min(1),
    vendorId: zod_1.z.string().optional(),
    lpoNumber: zod_1.z.string().optional(),
    description: zod_1.z.string(),
    items: zod_1.z.array(zod_1.z.object({
        description: zod_1.z.string(),
        quantity: zod_1.z.number().positive(),
        unitPrice: zod_1.z.number().positive(),
        amount: zod_1.z.number().positive()
    })),
    totalAmount: zod_1.z.number().positive(),
    budgetLine: zod_1.z.string().optional(),
    expectedDelivery: zod_1.z.string().optional(),
    terms: zod_1.z.string().optional(),
    status: zod_1.z["enum"](['draft', 'submitted', 'approved', 'rejected'])["default"]('draft')
});
var orderCreateSchema = zod_1.z.object({
    orderNumber: zod_1.z.string().optional(),
    supplierId: zod_1.z.string(),
    supplierName: zod_1.z.string(),
    description: zod_1.z.string(),
    items: zod_1.z.array(zod_1.z.object({
        description: zod_1.z.string(),
        quantity: zod_1.z.number().positive(),
        unitPrice: zod_1.z.number().positive(),
        amount: zod_1.z.number().positive()
    })),
    totalAmount: zod_1.z.number().positive(),
    deliveryAddress: zod_1.z.string(),
    expectedDelivery: zod_1.z.string().optional(),
    paymentTerms: zod_1.z.string().optional(),
    status: zod_1.z["enum"](['draft', 'sent', 'confirmed', 'delivered', 'invoiced'])["default"]('draft')
});
var imprestCreateSchema = zod_1.z.object({
    employeeId: zod_1.z.string(),
    employeeName: zod_1.z.string(),
    purpose: zod_1.z.string(),
    amount: zod_1.z.number().positive(),
    justification: zod_1.z.string().optional(),
    expectedReturnDate: zod_1.z.string().optional(),
    status: zod_1.z["enum"](['requested', 'approved', 'rejected', 'issued', 'surrendered'])["default"]('requested')
});
var budgetUpdateSchema = zod_1.z.object({
    budgetName: zod_1.z.string(),
    amount: zod_1.z.number().positive(),
    departmentId: zod_1.z.string(),
    fiscalYear: zod_1.z.number(),
    description: zod_1.z.string().optional(),
    status: zod_1.z["enum"](['draft', 'active', 'inactive', 'closed']).optional()
});
// ============================================================================
// UTILITIES
// ============================================================================
function generateLPONumber() {
    return __awaiter(this, void 0, Promise, function () {
        var result, seq, match, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, rawQuery("SELECT lpoNumber FROM lpos ORDER BY createdAt DESC LIMIT 1")];
                case 1:
                    result = _a.sent();
                    seq = 0;
                    if (result && result[0] && result[0].lpoNumber) {
                        match = result[0].lpoNumber.match(/(\d+)$/);
                        if (match)
                            seq = parseInt(match[1]);
                    }
                    return [2 /*return*/, "LPO-" + String(++seq).padStart(6, '0')];
                case 2:
                    e_1 = _a.sent();
                    return [2 /*return*/, "LPO-" + String(Date.now()).slice(-6)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function generateOrderNumber() {
    return __awaiter(this, void 0, Promise, function () {
        var result, seq, match, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, rawQuery("SELECT orderNumber FROM purchase_orders ORDER BY createdAt DESC LIMIT 1")];
                case 1:
                    result = _a.sent();
                    seq = 0;
                    if (result && result[0] && result[0].orderNumber) {
                        match = result[0].orderNumber.match(/(\d+)$/);
                        if (match)
                            seq = parseInt(match[1]);
                    }
                    return [2 /*return*/, "PO-" + String(++seq).padStart(6, '0')];
                case 2:
                    e_2 = _a.sent();
                    return [2 /*return*/, "PO-" + String(Date.now()).slice(-6)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// ============================================================================
// ROUTER
// ============================================================================
exports.procurementRouter = trpc_1.router({
    // ====== LPO OPERATIONS ======
    lpoList: readProcedure
        .input(zod_1.z.object({
        search: zod_1.z.string().optional(),
        status: zod_1.z.string().optional(),
        vendorId: zod_1.z.string().optional(),
        limit: zod_1.z.number()["default"](50),
        offset: zod_1.z.number()["default"](0)
    }).optional())
        .query(function (_a) {
        var _b = _a.input, input = _b === void 0 ? {} : _b;
        return __awaiter(void 0, void 0, void 0, function () {
            var organizationId, query, params, search, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        organizationId = ctx.user.organizationId;
                        if (!organizationId) {
                            throw new Error("Organization context required");
                        }
                        query = "SELECT * FROM lpos WHERE organizationId = ?";
                        params = [organizationId];
                        if (input.search) {
                            query += " AND (lpoNumber LIKE ? OR vendorName LIKE ? OR description LIKE ?)";
                            search = "%" + input.search + "%";
                            params.push(search, search, search);
                        }
                        if (input.status) {
                            query += " AND status = ?";
                            params.push(input.status);
                        }
                        if (input.vendorId) {
                            query += " AND vendorId = ?";
                            params.push(input.vendorId);
                        }
                        query += " ORDER BY createdAt DESC LIMIT ? OFFSET ?";
                        params.push(input.limit, input.offset);
                        return [4 /*yield*/, rawQuery(query, params)];
                    case 1: return [2 /*return*/, (_c.sent()) || []];
                    case 2:
                        error_1 = _c.sent();
                        console.error("LPO list error:", error_1);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    lpoGetById: readProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var result, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, rawQuery("SELECT * FROM lpos WHERE id = ? LIMIT 1", [input])];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, (result === null || result === void 0 ? void 0 : result[0]) || null];
                    case 2:
                        error_2 = _b.sent();
                        console.error("LPO getById error:", error_2);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    lpoCreate: writeProcedure
        .input(lpoCreateSchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var id, lpoNumber, _b, now, error_3;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 5, , 6]);
                        id = uuid_1.v4();
                        _b = input.lpoNumber;
                        if (_b) return [3 /*break*/, 2];
                        return [4 /*yield*/, generateLPONumber()];
                    case 1:
                        _b = (_e.sent());
                        _e.label = 2;
                    case 2:
                        lpoNumber = _b;
                        now = new Date().toISOString();
                        return [4 /*yield*/, rawQuery("INSERT INTO lpos (id, lpoNumber, vendorName, vendorId, description, items, totalAmount, budgetLine, expectedDelivery, terms, status, createdBy, createdAt, updatedAt)\n           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                                id, lpoNumber, input.vendorName, input.vendorId || null, input.description,
                                JSON.stringify(input.items), input.totalAmount, input.budgetLine || null,
                                input.expectedDelivery || null, input.terms || null, input.status,
                                ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id) || 'system',
                                now, now
                            ])];
                    case 3:
                        _e.sent();
                        // Log activity
                        return [4 /*yield*/, rawQuery("INSERT INTO activity_logs (id, userId, action, entityType, entityId, description, createdAt)\n           VALUES (?, ?, ?, ?, ?, ?, ?)", [uuid_1.v4(), ((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id) || 'system', 'CREATE_LPO', 'LPO', id, "Created LPO " + lpoNumber, now])];
                    case 4:
                        // Log activity
                        _e.sent();
                        return [2 /*return*/, { id: id, lpoNumber: lpoNumber, success: true }];
                    case 5:
                        error_3 = _e.sent();
                        console.error("LPO create error:", error_3);
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create LPO" });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    lpoUpdate: writeProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        vendorName: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        items: zod_1.z.array(zod_1.z.object({
            description: zod_1.z.string(),
            quantity: zod_1.z.number().positive(),
            unitPrice: zod_1.z.number().positive(),
            amount: zod_1.z.number().positive()
        })).optional(),
        totalAmount: zod_1.z.number().positive().optional(),
        status: zod_1.z["enum"](['draft', 'submitted', 'approved', 'rejected']).optional(),
        expectedDelivery: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var now, updates, values, error_4;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        now = new Date().toISOString();
                        updates = [];
                        values = [];
                        if (input.vendorName) {
                            updates.push('vendorName = ?');
                            values.push(input.vendorName);
                        }
                        if (input.description) {
                            updates.push('description = ?');
                            values.push(input.description);
                        }
                        if (input.items) {
                            updates.push('items = ?');
                            values.push(JSON.stringify(input.items));
                        }
                        if (input.totalAmount) {
                            updates.push('totalAmount = ?');
                            values.push(input.totalAmount);
                        }
                        if (input.status) {
                            updates.push('status = ?');
                            values.push(input.status);
                        }
                        if (input.expectedDelivery) {
                            updates.push('expectedDelivery = ?');
                            values.push(input.expectedDelivery);
                        }
                        updates.push('updatedAt = ?');
                        values.push(now);
                        values.push(input.id);
                        return [4 /*yield*/, rawQuery("UPDATE lpos SET " + updates.join(', ') + " WHERE id = ?", values)];
                    case 1:
                        _c.sent();
                        // Log activity
                        return [4 /*yield*/, rawQuery("INSERT INTO activity_logs (id, userId, action, entityType, entityId, description, createdAt)\n           VALUES (?, ?, ?, ?, ?, ?, ?)", [uuid_1.v4(), ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || 'system', 'UPDATE_LPO', 'LPO', input.id, "Updated LPO " + input.id, now])];
                    case 2:
                        // Log activity
                        _c.sent();
                        return [2 /*return*/, { success: true }];
                    case 3:
                        error_4 = _c.sent();
                        console.error("LPO update error:", error_4);
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update LPO" });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    lpoDelete: writeProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var now, error_5;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        now = new Date().toISOString();
                        return [4 /*yield*/, rawQuery("DELETE FROM lpos WHERE id = ?", [input])];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, rawQuery("INSERT INTO activity_logs (id, userId, action, entityType, entityId, description, createdAt)\n           VALUES (?, ?, ?, ?, ?, ?, ?)", [uuid_1.v4(), ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || 'system', 'DELETE_LPO', 'LPO', input, "Deleted LPO", now])];
                    case 2:
                        _c.sent();
                        return [2 /*return*/, { success: true }];
                    case 3:
                        error_5 = _c.sent();
                        console.error("LPO delete error:", error_5);
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete LPO" });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    // ====== PURCHASE ORDER OPERATIONS ======
    orderList: readProcedure
        .input(zod_1.z.object({
        search: zod_1.z.string().optional(),
        status: zod_1.z.string().optional(),
        supplierId: zod_1.z.string().optional(),
        limit: zod_1.z.number()["default"](50),
        offset: zod_1.z.number()["default"](0)
    }).optional())
        .query(function (_a) {
        var _b = _a.input, input = _b === void 0 ? {} : _b;
        return __awaiter(void 0, void 0, void 0, function () {
            var query, params, search, error_6;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        query = "SELECT * FROM purchase_orders WHERE 1=1";
                        params = [];
                        if (input.search) {
                            query += " AND (orderNumber LIKE ? OR supplierName LIKE ? OR description LIKE ?)";
                            search = "%" + input.search + "%";
                            params.push(search, search, search);
                        }
                        if (input.status) {
                            query += " AND status = ?";
                            params.push(input.status);
                        }
                        if (input.supplierId) {
                            query += " AND supplierId = ?";
                            params.push(input.supplierId);
                        }
                        query += " ORDER BY createdAt DESC LIMIT ? OFFSET ?";
                        params.push(input.limit, input.offset);
                        return [4 /*yield*/, rawQuery(query, params)];
                    case 1: return [2 /*return*/, (_c.sent()) || []];
                    case 2:
                        error_6 = _c.sent();
                        console.error("Order list error:", error_6);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    orderGetById: readProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var result, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, rawQuery("SELECT * FROM purchase_orders WHERE id = ? LIMIT 1", [input])];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, (result === null || result === void 0 ? void 0 : result[0]) || null];
                    case 2:
                        error_7 = _b.sent();
                        console.error("Order getById error:", error_7);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    orderCreate: writeProcedure
        .input(orderCreateSchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var id, orderNumber, _b, now, error_8;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 5, , 6]);
                        id = uuid_1.v4();
                        _b = input.orderNumber;
                        if (_b) return [3 /*break*/, 2];
                        return [4 /*yield*/, generateOrderNumber()];
                    case 1:
                        _b = (_e.sent());
                        _e.label = 2;
                    case 2:
                        orderNumber = _b;
                        now = new Date().toISOString();
                        return [4 /*yield*/, rawQuery("INSERT INTO purchase_orders (id, orderNumber, supplierId, supplierName, description, items, totalAmount, deliveryAddress, expectedDelivery, paymentTerms, status, createdBy, createdAt, updatedAt)\n           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                                id, orderNumber, input.supplierId, input.supplierName, input.description,
                                JSON.stringify(input.items), input.totalAmount, input.deliveryAddress,
                                input.expectedDelivery || null, input.paymentTerms || null, input.status,
                                ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id) || 'system',
                                now, now
                            ])];
                    case 3:
                        _e.sent();
                        // Log activity
                        return [4 /*yield*/, rawQuery("INSERT INTO activity_logs (id, userId, action, entityType, entityId, description, createdAt)\n           VALUES (?, ?, ?, ?, ?, ?, ?)", [uuid_1.v4(), ((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id) || 'system', 'CREATE_ORDER', 'PurchaseOrder', id, "Created Order " + orderNumber, now])];
                    case 4:
                        // Log activity
                        _e.sent();
                        return [2 /*return*/, { id: id, orderNumber: orderNumber, success: true }];
                    case 5:
                        error_8 = _e.sent();
                        console.error("Order create error:", error_8);
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create order" });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    orderUpdate: writeProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        supplierName: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        items: zod_1.z.array(zod_1.z.object({
            description: zod_1.z.string(),
            quantity: zod_1.z.number().positive(),
            unitPrice: zod_1.z.number().positive(),
            amount: zod_1.z.number().positive()
        })).optional(),
        totalAmount: zod_1.z.number().positive().optional(),
        status: zod_1.z["enum"](['draft', 'sent', 'confirmed', 'delivered', 'invoiced']).optional(),
        expectedDelivery: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var now, updates, values, error_9;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        now = new Date().toISOString();
                        updates = [];
                        values = [];
                        if (input.supplierName) {
                            updates.push('supplierName = ?');
                            values.push(input.supplierName);
                        }
                        if (input.description) {
                            updates.push('description = ?');
                            values.push(input.description);
                        }
                        if (input.items) {
                            updates.push('items = ?');
                            values.push(JSON.stringify(input.items));
                        }
                        if (input.totalAmount) {
                            updates.push('totalAmount = ?');
                            values.push(input.totalAmount);
                        }
                        if (input.status) {
                            updates.push('status = ?');
                            values.push(input.status);
                        }
                        if (input.expectedDelivery) {
                            updates.push('expectedDelivery = ?');
                            values.push(input.expectedDelivery);
                        }
                        updates.push('updatedAt = ?');
                        values.push(now);
                        values.push(input.id);
                        return [4 /*yield*/, rawQuery("UPDATE purchase_orders SET " + updates.join(', ') + " WHERE id = ?", values)];
                    case 1:
                        _c.sent();
                        // Log activity
                        return [4 /*yield*/, rawQuery("INSERT INTO activity_logs (id, userId, action, entityType, entityId, description, createdAt)\n           VALUES (?, ?, ?, ?, ?, ?, ?)", [uuid_1.v4(), ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || 'system', 'UPDATE_ORDER', 'PurchaseOrder', input.id, "Updated Order", now])];
                    case 2:
                        // Log activity
                        _c.sent();
                        return [2 /*return*/, { success: true }];
                    case 3:
                        error_9 = _c.sent();
                        console.error("Order update error:", error_9);
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update order" });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    orderDelete: writeProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var now, error_10;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        now = new Date().toISOString();
                        return [4 /*yield*/, rawQuery("DELETE FROM purchase_orders WHERE id = ?", [input])];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, rawQuery("INSERT INTO activity_logs (id, userId, action, entityType, entityId, description, createdAt)\n           VALUES (?, ?, ?, ?, ?, ?, ?)", [uuid_1.v4(), ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || 'system', 'DELETE_ORDER', 'PurchaseOrder', input, "Deleted Order", now])];
                    case 2:
                        _c.sent();
                        return [2 /*return*/, { success: true }];
                    case 3:
                        error_10 = _c.sent();
                        console.error("Order delete error:", error_10);
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete order" });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    // ====== IMPREST OPERATIONS ======
    imprestList: readProcedure
        .input(zod_1.z.object({
        search: zod_1.z.string().optional(),
        status: zod_1.z.string().optional(),
        employeeId: zod_1.z.string().optional(),
        limit: zod_1.z.number()["default"](50),
        offset: zod_1.z.number()["default"](0)
    }).optional())
        .query(function (_a) {
        var _b = _a.input, input = _b === void 0 ? {} : _b;
        return __awaiter(void 0, void 0, void 0, function () {
            var query, params, search, error_11;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        query = "SELECT * FROM imprests WHERE 1=1";
                        params = [];
                        if (input.search) {
                            query += " AND (imprestNumber LIKE ? OR employeeName LIKE ? OR purpose LIKE ?)";
                            search = "%" + input.search + "%";
                            params.push(search, search, search);
                        }
                        if (input.status) {
                            query += " AND status = ?";
                            params.push(input.status);
                        }
                        if (input.employeeId) {
                            query += " AND employeeId = ?";
                            params.push(input.employeeId);
                        }
                        query += " ORDER BY createdAt DESC LIMIT ? OFFSET ?";
                        params.push(input.limit, input.offset);
                        return [4 /*yield*/, rawQuery(query, params)];
                    case 1: return [2 /*return*/, (_c.sent()) || []];
                    case 2:
                        error_11 = _c.sent();
                        console.error("Imprest list error:", error_11);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    imprestCreate: writeProcedure
        .input(imprestCreateSchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var id, now, imprestNumber, error_12;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 3, , 4]);
                        id = uuid_1.v4();
                        now = new Date().toISOString();
                        imprestNumber = "IMP-" + String(Date.now()).slice(-6);
                        return [4 /*yield*/, rawQuery("INSERT INTO imprests (id, imprestNumber, employeeId, employeeName, purpose, amount, justification, expectedReturnDate, status, createdBy, createdAt, updatedAt)\n           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                                id, imprestNumber, input.employeeId, input.employeeName, input.purpose,
                                input.amount, input.justification || null, input.expectedReturnDate || null,
                                input.status,
                                ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || 'system',
                                now, now
                            ])];
                    case 1:
                        _d.sent();
                        // Log activity
                        return [4 /*yield*/, rawQuery("INSERT INTO activity_logs (id, userId, action, entityType, entityId, description, createdAt)\n           VALUES (?, ?, ?, ?, ?, ?, ?)", [uuid_1.v4(), ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id) || 'system', 'CREATE_IMPREST', 'Imprest', id, "Created Imprest " + imprestNumber, now])];
                    case 2:
                        // Log activity
                        _d.sent();
                        return [2 /*return*/, { id: id, imprestNumber: imprestNumber, success: true }];
                    case 3:
                        error_12 = _d.sent();
                        console.error("Imprest create error:", error_12);
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create imprest" });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    imprestUpdate: writeProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        status: zod_1.z["enum"](['requested', 'approved', 'rejected', 'issued', 'surrendered']).optional(),
        amount: zod_1.z.number().positive().optional(),
        purpose: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var now, updates, values, error_13;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        now = new Date().toISOString();
                        updates = [];
                        values = [];
                        if (input.status) {
                            updates.push('status = ?');
                            values.push(input.status);
                        }
                        if (input.amount) {
                            updates.push('amount = ?');
                            values.push(input.amount);
                        }
                        if (input.purpose) {
                            updates.push('purpose = ?');
                            values.push(input.purpose);
                        }
                        updates.push('updatedAt = ?');
                        values.push(now);
                        values.push(input.id);
                        return [4 /*yield*/, rawQuery("UPDATE imprests SET " + updates.join(', ') + " WHERE id = ?", values)];
                    case 1:
                        _c.sent();
                        // Log activity
                        return [4 /*yield*/, rawQuery("INSERT INTO activity_logs (id, userId, action, entityType, entityId, description, createdAt)\n           VALUES (?, ?, ?, ?, ?, ?, ?)", [uuid_1.v4(), ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || 'system', 'UPDATE_IMPREST', 'Imprest', input.id, "Updated Imprest status to " + input.status, now])];
                    case 2:
                        // Log activity
                        _c.sent();
                        return [2 /*return*/, { success: true }];
                    case 3:
                        error_13 = _c.sent();
                        console.error("Imprest update error:", error_13);
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update imprest" });
                    case 4: return [2 /*return*/];
                }
            });
        });
    })
});
