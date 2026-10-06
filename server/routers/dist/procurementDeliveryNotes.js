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
exports.deliveryNotesRouter = void 0;
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
exports.deliveryNotesRouter = trpc_1.router({
    list: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().optional(),
        offset: zod_1.z.number().optional(),
        status: zod_1.z["enum"](['draft', 'in_transit', 'delivered', 'partially_delivered', 'failed', 'returned']).optional(),
        lpoId: zod_1.z.string().optional(),
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
                        query = database.select().from(schema_1.deliveryNotes);
                        if (input === null || input === void 0 ? void 0 : input.status) {
                            query = query.where(drizzle_orm_1.eq(schema_1.deliveryNotes.deliveryStatus, input.status));
                        }
                        if (input === null || input === void 0 ? void 0 : input.lpoId) {
                            query = query.where(drizzle_orm_1.eq(schema_1.deliveryNotes.lpoId, input.lpoId));
                        }
                        if (input === null || input === void 0 ? void 0 : input.supplierId) {
                            query = query.where(drizzle_orm_1.eq(schema_1.deliveryNotes.supplierId, input.supplierId));
                        }
                        return [4 /*yield*/, query.limit((input === null || input === void 0 ? void 0 : input.limit) || 100).offset((input === null || input === void 0 ? void 0 : input.offset) || 0)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3:
                        error_1 = _b.sent();
                        console.error("Error fetching delivery notes list:", error_1);
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
                        return [4 /*yield*/, database.select().from(schema_1.deliveryNotes).where(drizzle_orm_1.eq(schema_1.deliveryNotes.id, input)).limit(1)];
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
            var database, noteData, lineItems;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, database.select().from(schema_1.deliveryNotes).where(drizzle_orm_1.eq(schema_1.deliveryNotes.id, input)).limit(1)];
                    case 2:
                        noteData = _b.sent();
                        if (!noteData.length)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, database.select().from(schema_extended_1.deliveryNoteLineItems).where(drizzle_orm_1.eq(schema_extended_1.deliveryNoteLineItems.deliveryNoteId, input))];
                    case 3:
                        lineItems = _b.sent();
                        return [2 /*return*/, __assign(__assign({}, noteData[0]), { lineItems: lineItems })];
                }
            });
        });
    }),
    create: createProcedure
        .input(zod_1.z.object({
        deliveryNoteNumber: zod_1.z.string().min(1).max(100),
        lpoId: zod_1.z.string(),
        supplierId: zod_1.z.string(),
        deliveryDate: zod_1.z.string(),
        driverId: zod_1.z.string().optional(),
        vehicleNumber: zod_1.z.string().optional(),
        receivedBy: zod_1.z.string().optional(),
        condition: zod_1.z["enum"](['good', 'damaged', 'partial', 'incomplete']).optional()["default"]('good'),
        notes: zod_1.z.string().optional(),
        lineItems: zod_1.z.array(zod_1.z.object({
            productId: zod_1.z.string().optional(),
            description: zod_1.z.string(),
            expectedQuantity: zod_1.z.number().positive(),
            receivedQuantity: zod_1.z.number().nonnegative(),
            damagedQuantity: zod_1.z.number().nonnegative().optional()["default"](0),
            unit: zod_1.z.string()["default"]('pcs'),
            unitPrice: zod_1.z.number().optional(),
            batchNumber: zod_1.z.string().optional(),
            expiryDate: zod_1.z.string().optional()
        }))
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, existing, noteId, totalExpecting, totalReceived, totalDamaged, _i, _b, item;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database.select().from(schema_1.deliveryNotes)
                                .where(drizzle_orm_1.eq(schema_1.deliveryNotes.deliveryNoteNumber, input.deliveryNoteNumber))
                                .limit(1)];
                    case 2:
                        existing = _c.sent();
                        if (existing.length > 0) {
                            throw new Error("Delivery note with number '" + input.deliveryNoteNumber + "' already exists");
                        }
                        noteId = uuid_1.v4();
                        totalExpecting = 0;
                        totalReceived = 0;
                        totalDamaged = 0;
                        input.lineItems.forEach(function (item) {
                            totalExpecting += item.expectedQuantity;
                            totalReceived += item.receivedQuantity;
                            totalDamaged += (item.damagedQuantity || 0);
                        });
                        // Create delivery note header
                        return [4 /*yield*/, database.insert(schema_1.deliveryNotes).values({
                                id: noteId,
                                deliveryNoteNumber: input.deliveryNoteNumber,
                                lpoId: input.lpoId,
                                supplierId: input.supplierId,
                                deliveryDate: new Date(input.deliveryDate),
                                driverId: input.driverId,
                                vehicleNumber: input.vehicleNumber,
                                deliveryStatus: 'draft',
                                receivedBy: input.receivedBy,
                                condition: input.condition,
                                totalItems: totalExpecting,
                                receivedItems: totalReceived,
                                damagedItems: totalDamaged,
                                notes: input.notes,
                                createdBy: ctx.user.id
                            })];
                    case 3:
                        // Create delivery note header
                        _c.sent();
                        _i = 0, _b = input.lineItems;
                        _c.label = 4;
                    case 4:
                        if (!(_i < _b.length)) return [3 /*break*/, 7];
                        item = _b[_i];
                        return [4 /*yield*/, database.insert(schema_extended_1.deliveryNoteLineItems).values({
                                id: uuid_1.v4(),
                                deliveryNoteId: noteId,
                                productId: item.productId,
                                description: item.description,
                                expectedQuantity: item.expectedQuantity,
                                receivedQuantity: item.receivedQuantity,
                                damagedQuantity: item.damagedQuantity || 0,
                                unit: item.unit,
                                unitPrice: item.unitPrice,
                                batchNumber: item.batchNumber,
                                expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined
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
                            action: "delivery_note_created",
                            entityType: "delivery_note",
                            entityId: noteId,
                            description: "Created delivery note: " + input.deliveryNoteNumber
                        })];
                    case 8:
                        // Log activity
                        _c.sent();
                        return [2 /*return*/, { id: noteId }];
                }
            });
        });
    }),
    update: updateProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        deliveryNoteNumber: zod_1.z.string().optional(),
        driverId: zod_1.z.string().optional(),
        vehicleNumber: zod_1.z.string().optional(),
        deliveryStatus: zod_1.z["enum"](['draft', 'in_transit', 'delivered', 'partially_delivered', 'failed', 'returned']).optional(),
        receivedBy: zod_1.z.string().optional(),
        receivedDate: zod_1.z.string().optional(),
        condition: zod_1.z["enum"](['good', 'damaged', 'partial', 'incomplete']).optional(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, note, updateData;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database.select().from(schema_1.deliveryNotes)
                                .where(drizzle_orm_1.eq(schema_1.deliveryNotes.id, input.id))
                                .limit(1)];
                    case 2:
                        note = _b.sent();
                        if (!note.length)
                            throw new Error("Delivery note not found");
                        updateData = {};
                        if (input.deliveryNoteNumber)
                            updateData.deliveryNoteNumber = input.deliveryNoteNumber;
                        if (input.driverId !== undefined)
                            updateData.driverId = input.driverId;
                        if (input.vehicleNumber !== undefined)
                            updateData.vehicleNumber = input.vehicleNumber;
                        if (input.deliveryStatus)
                            updateData.deliveryStatus = input.deliveryStatus;
                        if (input.receivedBy !== undefined)
                            updateData.receivedBy = input.receivedBy;
                        if (input.receivedDate)
                            updateData.receivedDate = new Date(input.receivedDate);
                        if (input.condition)
                            updateData.condition = input.condition;
                        if (input.notes !== undefined)
                            updateData.notes = input.notes;
                        return [4 /*yield*/, database.update(schema_1.deliveryNotes).set(updateData).where(drizzle_orm_1.eq(schema_1.deliveryNotes.id, input.id))];
                    case 3:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db_1.logActivity({
                                userId: ctx.user.id,
                                action: "delivery_note_updated",
                                entityType: "delivery_note",
                                entityId: input.id,
                                description: "Updated delivery note: " + note[0].deliveryNoteNumber
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
            var database, note;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database.select().from(schema_1.deliveryNotes)
                                .where(drizzle_orm_1.eq(schema_1.deliveryNotes.id, input))
                                .limit(1)];
                    case 2:
                        note = _b.sent();
                        if (!note.length)
                            throw new Error("Delivery note not found");
                        // Delete line items first
                        return [4 /*yield*/, database["delete"](schema_extended_1.deliveryNoteLineItems).where(drizzle_orm_1.eq(schema_extended_1.deliveryNoteLineItems.deliveryNoteId, input))];
                    case 3:
                        // Delete line items first
                        _b.sent();
                        // Delete delivery note
                        return [4 /*yield*/, database["delete"](schema_1.deliveryNotes).where(drizzle_orm_1.eq(schema_1.deliveryNotes.id, input))];
                    case 4:
                        // Delete delivery note
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db_1.logActivity({
                                userId: ctx.user.id,
                                action: "delivery_note_deleted",
                                entityType: "delivery_note",
                                entityId: input,
                                description: "Deleted delivery note: " + note[0].deliveryNoteNumber
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
        .input(zod_1.z["enum"](['draft', 'in_transit', 'delivered', 'partially_delivered', 'failed', 'returned']))
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
                        return [4 /*yield*/, database.select().from(schema_1.deliveryNotes)
                                .where(drizzle_orm_1.eq(schema_1.deliveryNotes.deliveryStatus, input))];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    getByLPO: readProcedure
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
                        return [4 /*yield*/, database.select().from(schema_1.deliveryNotes)
                                .where(drizzle_orm_1.eq(schema_1.deliveryNotes.lpoId, input))];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    getSummary: readProcedure
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, allNotes, deliveredCount, pendingCount, problemCount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        return [2 /*return*/, {
                                totalDeliveries: 0,
                                deliveredCount: 0,
                                pendingCount: 0,
                                problemCount: 0
                            }];
                    return [4 /*yield*/, database.select().from(schema_1.deliveryNotes)];
                case 2:
                    allNotes = _a.sent();
                    deliveredCount = allNotes.filter(function (d) { return d.deliveryStatus === 'delivered'; }).length;
                    pendingCount = allNotes.filter(function (d) { return ['draft', 'in_transit'].includes(d.deliveryStatus); }).length;
                    problemCount = allNotes.filter(function (d) { return ['failed', 'returned', 'partially_delivered'].includes(d.deliveryStatus); }).length;
                    return [2 /*return*/, {
                            totalDeliveries: allNotes.length,
                            deliveredCount: deliveredCount,
                            pendingCount: pendingCount,
                            problemCount: problemCount
                        }];
            }
        });
    }); }),
    updateLineItem: updateProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        receivedQuantity: zod_1.z.number().optional(),
        damagedQuantity: zod_1.z.number().optional(),
        batchNumber: zod_1.z.string().optional(),
        expiryDate: zod_1.z.string().optional()
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
                        return [4 /*yield*/, database.select().from(schema_extended_1.deliveryNoteLineItems)
                                .where(drizzle_orm_1.eq(schema_extended_1.deliveryNoteLineItems.id, input.id))
                                .limit(1)];
                    case 2:
                        lineItem = _b.sent();
                        if (!lineItem.length)
                            throw new Error("Line item not found");
                        updateData = {};
                        if (input.receivedQuantity !== undefined)
                            updateData.receivedQuantity = input.receivedQuantity;
                        if (input.damagedQuantity !== undefined)
                            updateData.damagedQuantity = input.damagedQuantity;
                        if (input.batchNumber !== undefined)
                            updateData.batchNumber = input.batchNumber;
                        if (input.expiryDate !== undefined)
                            updateData.expiryDate = input.expiryDate ? new Date(input.expiryDate) : null;
                        return [4 /*yield*/, database.update(schema_extended_1.deliveryNoteLineItems).set(updateData).where(drizzle_orm_1.eq(schema_extended_1.deliveryNoteLineItems.id, input.id))];
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
                        return [4 /*yield*/, database.select().from(schema_extended_1.deliveryNoteLineItems)
                                .where(drizzle_orm_1.eq(schema_extended_1.deliveryNoteLineItems.id, input))
                                .limit(1)];
                    case 2:
                        lineItem = _b.sent();
                        if (!lineItem.length)
                            throw new Error("Line item not found");
                        return [4 /*yield*/, database["delete"](schema_extended_1.deliveryNoteLineItems).where(drizzle_orm_1.eq(schema_extended_1.deliveryNoteLineItems.id, input))];
                    case 3:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db_1.logActivity({
                                userId: ctx.user.id,
                                action: "delivery_note_line_deleted",
                                entityType: "delivery_note",
                                entityId: input,
                                description: "Deleted delivery note line item"
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
