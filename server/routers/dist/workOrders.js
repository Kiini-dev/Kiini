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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
exports.workOrdersRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var uuid_1 = require("uuid");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var numbering_1 = require("../utils/numbering");
var viewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("operations:work-orders:view");
var createProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("operations:work-orders:create");
var editProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("operations:work-orders:edit");
var deleteProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("operations:work-orders:delete");
var materialSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    description: zod_1.z.string(),
    quantity: zod_1.z.number().positive(),
    unitCost: zod_1.z.number().nonnegative(),
    total: zod_1.z.number().nonnegative()
});
var createWorkOrderSchema = zod_1.z.object({
    workOrderNumber: zod_1.z.string().optional(),
    issueDate: zod_1.z.date(),
    description: zod_1.z.string(),
    assignedTo: zod_1.z.string(),
    priority: zod_1.z["enum"](["low", "medium", "high", "critical"])["default"]("medium"),
    startDate: zod_1.z.date(),
    targetEndDate: zod_1.z.date(),
    materials: zod_1.z.array(materialSchema).optional(),
    laborCost: zod_1.z.number().nonnegative()["default"](0),
    serviceCost: zod_1.z.number().nonnegative()["default"](0),
    total: zod_1.z.number().nonnegative(),
    notes: zod_1.z.string().optional(),
    status: zod_1.z["enum"](["draft", "open", "in-progress", "completed", "cancelled"])["default"]("draft")
});
exports.workOrdersRouter = trpc_1.router({
    list: viewProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, records, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        orgId = ctx.user.organizationId;
                        return [4 /*yield*/, db.select().from(schema_1.workOrders)
                                .where(orgId ? drizzle_orm_1.eq(schema_1.workOrders.organizationId, orgId) : undefined)
                                .orderBy(drizzle_orm_1.desc(schema_1.workOrders.createdAt))];
                    case 3:
                        records = _b.sent();
                        return [2 /*return*/, records || []];
                    case 4:
                        error_1 = _b.sent();
                        console.error("Error listing work orders:", error_1);
                        throw new Error("Failed to list work orders");
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    get: viewProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, records, record, materials, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, db.select().from(schema_1.workOrders).where(drizzle_orm_1.eq(schema_1.workOrders.id, input.id)).limit(1)];
                    case 3:
                        records = _b.sent();
                        record = records[0] || null;
                        return [4 /*yield*/, db.select().from(schema_1.workOrderMaterials).where(drizzle_orm_1.eq(schema_1.workOrderMaterials.workOrderId, input.id))];
                    case 4:
                        materials = _b.sent();
                        return [2 /*return*/, record ? __assign(__assign({}, record), { materials: materials }) : null];
                    case 5:
                        error_2 = _b.sent();
                        console.error("Error fetching work order:", error_2);
                        throw new Error("Failed to fetch work order");
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    create: createProcedure
        .input(createWorkOrderSchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id_1, autoWorkOrderNumber, _b, newRecord, createdRows, error_3;
            var _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _g.sent();
                        if (!db)
                            throw new Error("Database not available");
                        _g.label = 2;
                    case 2:
                        _g.trys.push([2, 9, , 10]);
                        id_1 = uuid_1.v4();
                        _b = input.workOrderNumber;
                        if (_b) return [3 /*break*/, 4];
                        return [4 /*yield*/, numbering_1.nextNumber(db, schema_1.workOrders, schema_1.workOrders.workOrderNumber, "WO")];
                    case 3:
                        _b = (_g.sent());
                        _g.label = 4;
                    case 4:
                        autoWorkOrderNumber = _b;
                        return [4 /*yield*/, db.insert(schema_1.workOrders).values({
                                id: id_1,
                                workOrderNumber: autoWorkOrderNumber,
                                issueDate: new Date(input.issueDate).toISOString().replace('T', ' ').substring(0, 19),
                                description: input.description,
                                assignedTo: input.assignedTo,
                                priority: input.priority,
                                startDate: new Date(input.startDate).toISOString().replace('T', ' ').substring(0, 19),
                                targetEndDate: new Date(input.targetEndDate).toISOString(),
                                laborCost: Math.round(input.laborCost * 100),
                                serviceCost: Math.round(input.serviceCost * 100),
                                total: Math.round(input.total * 100),
                                notes: input.notes || null,
                                status: input.status,
                                createdBy: ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id) || "",
                                organizationId: (_e = (_d = ctx.user) === null || _d === void 0 ? void 0 : _d.organizationId) !== null && _e !== void 0 ? _e : null
                            })];
                    case 5:
                        newRecord = _g.sent();
                        if (!(input.materials && input.materials.length > 0)) return [3 /*break*/, 7];
                        return [4 /*yield*/, Promise.all(input.materials.map(function (material) {
                                return db.insert(schema_1.workOrderMaterials).values({
                                    id: uuid_1.v4(),
                                    workOrderId: id_1,
                                    description: material.description,
                                    quantity: material.quantity,
                                    unitCost: Math.round(material.unitCost * 100),
                                    total: Math.round(material.total * 100)
                                });
                            }))];
                    case 6:
                        _g.sent();
                        _g.label = 7;
                    case 7: return [4 /*yield*/, db.select().from(schema_1.workOrders).where(drizzle_orm_1.eq(schema_1.workOrders.id, id_1)).limit(1)];
                    case 8:
                        createdRows = _g.sent();
                        return [2 /*return*/, createdRows[0] || __assign(__assign({ id: id_1 }, input), { createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19), createdBy: (_f = ctx.user) === null || _f === void 0 ? void 0 : _f.id })];
                    case 9:
                        error_3 = _g.sent();
                        console.error("Error creating work order:", error_3);
                        throw new Error("Failed to create work order");
                    case 10: return [2 /*return*/];
                }
            });
        });
    }),
    update: editProcedure
        .input(zod_1.z.object(__assign({ id: zod_1.z.string() }, createWorkOrderSchema.shape)))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id_2, materials, rest, updatedRows, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 8, , 9]);
                        id_2 = input.id, materials = input.materials, rest = __rest(input, ["id", "materials"]);
                        return [4 /*yield*/, db.update(schema_1.workOrders).set(__assign(__assign({}, rest), { issueDate: new Date(rest.issueDate).toISOString().replace('T', ' ').substring(0, 19), startDate: new Date(rest.startDate).toISOString().replace('T', ' ').substring(0, 19), targetEndDate: new Date(rest.targetEndDate).toISOString().replace('T', ' ').substring(0, 19), laborCost: Math.round(rest.laborCost * 100), serviceCost: Math.round(rest.serviceCost * 100), total: Math.round(rest.total * 100) })).where(drizzle_orm_1.eq(schema_1.workOrders.id, id_2))];
                    case 3:
                        _b.sent();
                        if (!(materials && materials.length > 0)) return [3 /*break*/, 6];
                        return [4 /*yield*/, db["delete"](schema_1.workOrderMaterials).where(drizzle_orm_1.eq(schema_1.workOrderMaterials.workOrderId, id_2))];
                    case 4:
                        _b.sent();
                        return [4 /*yield*/, Promise.all(materials.map(function (material) {
                                return db.insert(schema_1.workOrderMaterials).values({
                                    id: uuid_1.v4(),
                                    workOrderId: id_2,
                                    description: material.description,
                                    quantity: material.quantity,
                                    unitCost: Math.round(material.unitCost * 100),
                                    total: Math.round(material.total * 100)
                                });
                            }))];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6: return [4 /*yield*/, db.select().from(schema_1.workOrders).where(drizzle_orm_1.eq(schema_1.workOrders.id, id_2)).limit(1)];
                    case 7:
                        updatedRows = _b.sent();
                        return [2 /*return*/, updatedRows[0] || __assign({ id: id_2 }, rest)];
                    case 8:
                        error_4 = _b.sent();
                        console.error("Error updating work order:", error_4);
                        throw new Error("Failed to update work order");
                    case 9: return [2 /*return*/];
                }
            });
        });
    }),
    "delete": deleteProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        // Delete materials first
                        return [4 /*yield*/, db["delete"](schema_1.workOrderMaterials).where(drizzle_orm_1.eq(schema_1.workOrderMaterials.workOrderId, input.id))];
                    case 3:
                        // Delete materials first
                        _b.sent();
                        // Delete work order
                        return [4 /*yield*/, db["delete"](schema_1.workOrders).where(drizzle_orm_1.eq(schema_1.workOrders.id, input.id))];
                    case 4:
                        // Delete work order
                        _b.sent();
                        return [2 /*return*/, { success: true, id: input.id }];
                    case 5:
                        error_5 = _b.sent();
                        console.error("Error deleting work order:", error_5);
                        throw new Error("Failed to delete work order");
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    updateStatus: editProcedure
        .input(zod_1.z.object({ id: zod_1.z.string(), status: zod_1.z["enum"](["draft", "open", "in-progress", "completed", "cancelled"]) }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.update(schema_1.workOrders).set({ status: input.status }).where(drizzle_orm_1.eq(schema_1.workOrders.id, input.id))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true, id: input.id, status: input.status }];
                    case 4:
                        error_6 = _b.sent();
                        console.error("Error updating work order status:", error_6);
                        throw new Error("Failed to update status");
                    case 5: return [2 /*return*/];
                }
            });
        });
    })
});
