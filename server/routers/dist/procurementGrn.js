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
exports.grnRouter = void 0;
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var schema_extended_1 = require("../../drizzle/schema-extended");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
// Feature-based procedures
var readProcedure = trpc_1.protectedProcedure;
var createProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("procurementLpo:create");
var updateProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("procurementLpo:edit");
var deleteProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("procurementLpo:delete");
exports.grnRouter = trpc_1.router({
    list: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().optional(),
        offset: zod_1.z.number().optional(),
        status: zod_1.z["enum"](['draft', 'received', 'inspected', 'approved', 'posted', 'rejected', 'partial']).optional(),
        qualityStatus: zod_1.z["enum"](['approved', 'rejected', 'partial', 'pending_inspection']).optional(),
        lpoId: zod_1.z.string().optional(),
        supplierId: zod_1.z.string().optional(),
        warehouseId: zod_1.z.string().optional(),
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
                        query = database.select().from(schema_1.grnRecords);
                        if (input === null || input === void 0 ? void 0 : input.status) {
                            query = query.where(drizzle_orm_1.eq(schema_1.grnRecords.status, input.status));
                        }
                        if (input === null || input === void 0 ? void 0 : input.qualityStatus) {
                            query = query.where(drizzle_orm_1.eq(schema_1.grnRecords.qualityStatus, input.qualityStatus));
                        }
                        if (input === null || input === void 0 ? void 0 : input.lpoId) {
                            query = query.where(drizzle_orm_1.eq(schema_1.grnRecords.lpoId, input.lpoId));
                        }
                        if (input === null || input === void 0 ? void 0 : input.supplierId) {
                            query = query.where(drizzle_orm_1.eq(schema_1.grnRecords.supplierId, input.supplierId));
                        }
                        if (input === null || input === void 0 ? void 0 : input.warehouseId) {
                            query = query.where(drizzle_orm_1.eq(schema_1.grnRecords.warehouseId, input.warehouseId));
                        }
                        return [4 /*yield*/, query.limit((input === null || input === void 0 ? void 0 : input.limit) || 100).offset((input === null || input === void 0 ? void 0 : input.offset) || 0)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3:
                        error_1 = _b.sent();
                        console.error("Error fetching GRN list:", error_1);
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
                        return [4 /*yield*/, database.select().from(schema_1.grnRecords).where(drizzle_orm_1.eq(schema_1.grnRecords.id, input)).limit(1)];
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
            var database, grnData, lineItems;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, database.select().from(schema_1.grnRecords).where(drizzle_orm_1.eq(schema_1.grnRecords.id, input)).limit(1)];
                    case 2:
                        grnData = _b.sent();
                        if (!grnData.length)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, database.select().from(schema_extended_1.grnLineItems).where(drizzle_orm_1.eq(schema_extended_1.grnLineItems.grnId, input))];
                    case 3:
                        lineItems = _b.sent();
                        return [2 /*return*/, __assign(__assign({}, grnData[0]), { lineItems: lineItems })];
                }
            });
        });
    }),
    create: createProcedure
        .input(zod_1.z.object({
        grnNumber: zod_1.z.string().min(1).max(100),
        lpoId: zod_1.z.string(),
        deliveryNoteId: zod_1.z.string().optional(),
        supplierId: zod_1.z.string(),
        grnDate: zod_1.z.string(),
        warehouseId: zod_1.z.string(),
        receivedBy: zod_1.z.string(),
        inspectedBy: zod_1.z.string().optional(),
        inspectionDate: zod_1.z.string().optional(),
        approvedBy: zod_1.z.string().optional(),
        approvalDate: zod_1.z.string().optional(),
        qualityStatus: zod_1.z["enum"](['approved', 'rejected', 'partial', 'pending_inspection'])["default"]('pending_inspection'),
        rejectionReason: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional(),
        lineItems: zod_1.z.array(zod_1.z.object({
            productId: zod_1.z.string(),
            description: zod_1.z.string(),
            orderedQuantity: zod_1.z.number().positive(),
            receivedQuantity: zod_1.z.number().nonnegative(),
            unit: zod_1.z.string()["default"]('pcs'),
            unitCost: zod_1.z.number().nonnegative(),
            batchNumber: zod_1.z.string().optional(),
            expiryDate: zod_1.z.string().optional(),
            warehouseLocation: zod_1.z.string().optional(),
            condition: zod_1.z["enum"](['good', 'damaged', 'expired', 'defective'])["default"]('good'),
            remarks: zod_1.z.string().optional()
        }))
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, existing, grnId, totalQty, totalCost, _i, _b, item;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database.select().from(schema_1.grnRecords)
                                .where(drizzle_orm_1.eq(schema_1.grnRecords.grnNumber, input.grnNumber))
                                .limit(1)];
                    case 2:
                        existing = _c.sent();
                        if (existing.length > 0) {
                            throw new Error("GRN with number '" + input.grnNumber + "' already exists");
                        }
                        grnId = uuid_1.v4();
                        totalQty = 0;
                        totalCost = 0;
                        input.lineItems.forEach(function (item) {
                            totalQty += item.receivedQuantity;
                            totalCost += (item.receivedQuantity * item.unitCost);
                        });
                        // Create GRN header
                        return [4 /*yield*/, database.insert(schema_1.grnRecords).values({
                                id: grnId,
                                grnNumber: input.grnNumber,
                                lpoId: input.lpoId,
                                deliveryNoteId: input.deliveryNoteId,
                                supplierId: input.supplierId,
                                grnDate: new Date(input.grnDate),
                                receivedDate: new Date(),
                                warehouseId: input.warehouseId,
                                receivedBy: input.receivedBy,
                                inspectedBy: input.inspectedBy,
                                inspectionDate: input.inspectionDate ? new Date(input.inspectionDate) : undefined,
                                approvedBy: input.approvedBy,
                                approvalDate: input.approvalDate ? new Date(input.approvalDate) : undefined,
                                status: 'received',
                                qualityStatus: input.qualityStatus,
                                totalQuantity: totalQty,
                                totalCost: totalCost,
                                rejectionReason: input.rejectionReason,
                                notes: input.notes,
                                createdBy: ctx.user.id
                            })];
                    case 3:
                        // Create GRN header
                        _c.sent();
                        _i = 0, _b = input.lineItems;
                        _c.label = 4;
                    case 4:
                        if (!(_i < _b.length)) return [3 /*break*/, 7];
                        item = _b[_i];
                        return [4 /*yield*/, database.insert(schema_extended_1.grnLineItems).values({
                                id: uuid_1.v4(),
                                grnId: grnId,
                                productId: item.productId,
                                description: item.description,
                                orderedQuantity: item.orderedQuantity,
                                receivedQuantity: item.receivedQuantity,
                                unit: item.unit,
                                unitCost: item.unitCost,
                                totalCost: item.receivedQuantity * item.unitCost,
                                batchNumber: item.batchNumber,
                                expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
                                warehouseLocation: item.warehouseLocation,
                                condition: item.condition,
                                remarks: item.remarks
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
                            action: "grn_created",
                            entityType: "grn",
                            entityId: grnId,
                            description: "Created GRN: " + input.grnNumber
                        })];
                    case 8:
                        // Log activity
                        _c.sent();
                        return [2 /*return*/, { id: grnId }];
                }
            });
        });
    }),
    update: updateProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        status: zod_1.z["enum"](['draft', 'received', 'inspected', 'approved', 'posted', 'rejected', 'partial']).optional(),
        qualityStatus: zod_1.z["enum"](['approved', 'rejected', 'partial', 'pending_inspection']).optional(),
        inspectedBy: zod_1.z.string().optional(),
        inspectionDate: zod_1.z.string().optional(),
        approvedBy: zod_1.z.string().optional(),
        approvalDate: zod_1.z.string().optional(),
        rejectionReason: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, grnRecord, updateData;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database.select().from(schema_1.grnRecords)
                                .where(drizzle_orm_1.eq(schema_1.grnRecords.id, input.id))
                                .limit(1)];
                    case 2:
                        grnRecord = _b.sent();
                        if (!grnRecord.length)
                            throw new Error("GRN not found");
                        updateData = {};
                        if (input.status)
                            updateData.status = input.status;
                        if (input.qualityStatus)
                            updateData.qualityStatus = input.qualityStatus;
                        if (input.inspectedBy !== undefined)
                            updateData.inspectedBy = input.inspectedBy;
                        if (input.inspectionDate)
                            updateData.inspectionDate = new Date(input.inspectionDate);
                        if (input.approvedBy !== undefined)
                            updateData.approvedBy = input.approvedBy;
                        if (input.approvalDate)
                            updateData.approvalDate = new Date(input.approvalDate);
                        if (input.rejectionReason !== undefined)
                            updateData.rejectionReason = input.rejectionReason;
                        if (input.notes !== undefined)
                            updateData.notes = input.notes;
                        return [4 /*yield*/, database.update(schema_1.grnRecords).set(updateData).where(drizzle_orm_1.eq(schema_1.grnRecords.id, input.id))];
                    case 3:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db_1.logActivity({
                                userId: ctx.user.id,
                                action: "grn_updated",
                                entityType: "grn",
                                entityId: input.id,
                                description: "Updated GRN: " + grnRecord[0].grnNumber
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
            var database, grnRecord;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database.select().from(schema_1.grnRecords)
                                .where(drizzle_orm_1.eq(schema_1.grnRecords.id, input))
                                .limit(1)];
                    case 2:
                        grnRecord = _b.sent();
                        if (!grnRecord.length)
                            throw new Error("GRN not found");
                        // Delete line items first
                        return [4 /*yield*/, database["delete"](schema_extended_1.grnLineItems).where(drizzle_orm_1.eq(schema_extended_1.grnLineItems.grnId, input))];
                    case 3:
                        // Delete line items first
                        _b.sent();
                        // Delete GRN
                        return [4 /*yield*/, database["delete"](schema_1.grnRecords).where(drizzle_orm_1.eq(schema_1.grnRecords.id, input))];
                    case 4:
                        // Delete GRN
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db_1.logActivity({
                                userId: ctx.user.id,
                                action: "grn_deleted",
                                entityType: "grn",
                                entityId: input,
                                description: "Deleted GRN: " + grnRecord[0].grnNumber
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
        .input(zod_1.z["enum"](['draft', 'received', 'inspected', 'approved', 'posted', 'rejected', 'partial']))
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
                        return [4 /*yield*/, database.select().from(schema_1.grnRecords)
                                .where(drizzle_orm_1.eq(schema_1.grnRecords.status, input))];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    getByQualityStatus: readProcedure
        .input(zod_1.z["enum"](['approved', 'rejected', 'partial', 'pending_inspection']))
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
                        return [4 /*yield*/, database.select().from(schema_1.grnRecords)
                                .where(drizzle_orm_1.eq(schema_1.grnRecords.qualityStatus, input))];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    getByWarehouse: readProcedure
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
                        return [4 /*yield*/, database.select().from(schema_1.grnRecords)
                                .where(drizzle_orm_1.eq(schema_1.grnRecords.warehouseId, input))];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    getSummary: readProcedure
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, allGRNs, approvedCount, pendingInspection, rejectedCount, totalValue;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        return [2 /*return*/, {
                                totalGRNs: 0,
                                approvedCount: 0,
                                pendingInspection: 0,
                                rejectedCount: 0,
                                totalValue: 0
                            }];
                    return [4 /*yield*/, database.select().from(schema_1.grnRecords)];
                case 2:
                    allGRNs = _a.sent();
                    approvedCount = allGRNs.filter(function (g) { return g.qualityStatus === 'approved'; }).length;
                    pendingInspection = allGRNs.filter(function (g) { return g.qualityStatus === 'pending_inspection'; }).length;
                    rejectedCount = allGRNs.filter(function (g) { return g.qualityStatus === 'rejected'; }).length;
                    totalValue = allGRNs.reduce(function (sum, g) { return sum + (g.totalCost || 0); }, 0);
                    return [2 /*return*/, {
                            totalGRNs: allGRNs.length,
                            approvedCount: approvedCount,
                            pendingInspection: pendingInspection,
                            rejectedCount: rejectedCount,
                            totalValue: totalValue
                        }];
            }
        });
    }); }),
    updateLineItem: updateProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        receivedQuantity: zod_1.z.number().optional(),
        warehouseLocation: zod_1.z.string().optional(),
        condition: zod_1.z["enum"](['good', 'damaged', 'expired', 'defective']).optional(),
        remarks: zod_1.z.string().optional()
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
                        return [4 /*yield*/, database.select().from(schema_extended_1.grnLineItems)
                                .where(drizzle_orm_1.eq(schema_extended_1.grnLineItems.id, input.id))
                                .limit(1)];
                    case 2:
                        lineItem = _b.sent();
                        if (!lineItem.length)
                            throw new Error("Line item not found");
                        updateData = {};
                        if (input.receivedQuantity !== undefined)
                            updateData.receivedQuantity = input.receivedQuantity;
                        if (input.warehouseLocation !== undefined)
                            updateData.warehouseLocation = input.warehouseLocation;
                        if (input.condition !== undefined)
                            updateData.condition = input.condition;
                        if (input.remarks !== undefined)
                            updateData.remarks = input.remarks;
                        // Recalculate total cost if received quantity changed
                        if (input.receivedQuantity !== undefined) {
                            updateData.totalCost = input.receivedQuantity * (lineItem[0].unitCost || 0);
                        }
                        return [4 /*yield*/, database.update(schema_extended_1.grnLineItems).set(updateData).where(drizzle_orm_1.eq(schema_extended_1.grnLineItems.id, input.id))];
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
                        return [4 /*yield*/, database.select().from(schema_extended_1.grnLineItems)
                                .where(drizzle_orm_1.eq(schema_extended_1.grnLineItems.id, input))
                                .limit(1)];
                    case 2:
                        lineItem = _b.sent();
                        if (!lineItem.length)
                            throw new Error("Line item not found");
                        return [4 /*yield*/, database["delete"](schema_extended_1.grnLineItems).where(drizzle_orm_1.eq(schema_extended_1.grnLineItems.id, input))];
                    case 3:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db_1.logActivity({
                                userId: ctx.user.id,
                                action: "grn_line_deleted",
                                entityType: "grn",
                                entityId: input,
                                description: "Deleted GRN line item"
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
