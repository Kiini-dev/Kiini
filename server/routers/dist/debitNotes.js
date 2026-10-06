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
exports.debitNotesRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var schema_2 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var autoNumbering_1 = require("../lib/autoNumbering");
var viewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:debit-notes:view");
var createProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:debit-notes:create");
var editProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:debit-notes:edit");
var deleteProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:debit-notes:delete");
var debitNoteLineItemSchema = zod_1.z.object({
    description: zod_1.z.string().min(1),
    quantity: zod_1.z.number().positive(),
    unitPrice: zod_1.z.number().nonnegative(),
    total: zod_1.z.number().nonnegative(),
    taxRate: zod_1.z.number().nonnegative().optional(),
    taxAmount: zod_1.z.number().nonnegative().optional()
});
var issueDateSchema = zod_1.z.preprocess(function (value) {
    if (value instanceof Date) {
        return value.toISOString().replace('T', ' ').substring(0, 19);
    }
    if (typeof value === "string") {
        var d = new Date(value);
        if (!Number.isNaN(d.getTime())) {
            return d.toISOString().replace('T', ' ').substring(0, 19);
        }
        return value;
    }
    return value;
}, zod_1.z.string());
var nullableNumberSchema = zod_1.z.preprocess(function (value) {
    if (value === undefined || value === null || value === "")
        return undefined;
    if (typeof value === "number")
        return value;
    if (typeof value === "string") {
        var n = Number(value);
        return Number.isFinite(n) ? n : value;
    }
    return value;
}, zod_1.z.number().nonnegative().optional());
var createDebitNoteSchema = zod_1.z.object({
    debitNoteNumber: zod_1.z.string().optional(),
    issueDate: issueDateSchema,
    supplierId: zod_1.z.string().min(1),
    supplierName: zod_1.z.string().min(1),
    purchaseOrderId: zod_1.z.string().optional(),
    reason: zod_1.z["enum"](["quality-shortage", "price-adjustment", "damaged", "underdelivery", "penalty"]),
    items: zod_1.z.array(debitNoteLineItemSchema).min(1),
    subtotal: nullableNumberSchema,
    taxAmount: nullableNumberSchema,
    total: zod_1.z.number().nonnegative(),
    notes: zod_1.z.string().optional(),
    status: zod_1.z["enum"](["draft", "approved", "settled", "void"])["default"]("draft")
});
exports.debitNotesRouter = trpc_1.router({
    list: viewProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, where, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.eq(schema_1.debitNotes.organizationId, orgId) : undefined;
                        return [4 /*yield*/, db.select().from(schema_1.debitNotes).where(where).orderBy(drizzle_orm_1.desc(schema_1.debitNotes.createdAt))];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3:
                        error_1 = _b.sent();
                        console.error("Error listing debit notes:", error_1);
                        throw new Error("Failed to list debit notes");
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    get: viewProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, conditions, dn, items;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        orgId = ctx.user.organizationId;
                        conditions = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.debitNotes.id, input.id), drizzle_orm_1.eq(schema_1.debitNotes.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_1.debitNotes.id, input.id);
                        return [4 /*yield*/, db.select().from(schema_1.debitNotes).where(conditions)];
                    case 2:
                        dn = (_b.sent())[0];
                        if (!dn)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, db.select().from(schema_2.lineItems).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_2.lineItems.documentId, input.id), drizzle_orm_1.eq(schema_2.lineItems.documentType, 'debit_note')))];
                    case 3:
                        items = _b.sent();
                        return [2 /*return*/, __assign(__assign({}, dn), { items: items })];
                }
            });
        });
    }),
    create: createProcedure
        .input(createDebitNoteSchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, autoNumber, _b, computedSubtotal, subtotal, _i, _c, item, error_2;
            var _d, _e, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        _h.trys.push([0, 9, , 10]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _h.sent();
                        id = uuid_1.v4();
                        _b = input.debitNoteNumber;
                        if (_b) return [3 /*break*/, 3];
                        return [4 /*yield*/, autoNumbering_1.generateNextNumber('debit-notes')];
                    case 2:
                        _b = (_h.sent());
                        _h.label = 3;
                    case 3:
                        autoNumber = _b;
                        computedSubtotal = input.items.reduce(function (sum, item) { return sum + item.total; }, 0);
                        subtotal = (_d = input.subtotal) !== null && _d !== void 0 ? _d : computedSubtotal;
                        return [4 /*yield*/, db.insert(schema_1.debitNotes).values({
                                id: id,
                                organizationId: (_f = (_e = ctx.user) === null || _e === void 0 ? void 0 : _e.organizationId) !== null && _f !== void 0 ? _f : null,
                                debitNoteNumber: autoNumber,
                                supplierId: input.supplierId,
                                supplierName: input.supplierName,
                                purchaseOrderId: input.purchaseOrderId || null,
                                issueDate: input.issueDate,
                                reason: input.reason,
                                subtotal: subtotal,
                                taxAmount: input.taxAmount || 0,
                                total: input.total,
                                status: input.status,
                                notes: input.notes || null,
                                createdBy: (_g = ctx.user) === null || _g === void 0 ? void 0 : _g.id
                            })];
                    case 4:
                        _h.sent();
                        _i = 0, _c = input.items;
                        _h.label = 5;
                    case 5:
                        if (!(_i < _c.length)) return [3 /*break*/, 8];
                        item = _c[_i];
                        return [4 /*yield*/, db.insert(schema_2.lineItems).values({
                                id: uuid_1.v4(),
                                documentId: id,
                                documentType: 'debit_note',
                                description: item.description,
                                quantity: item.quantity,
                                rate: item.unitPrice,
                                amount: item.total,
                                taxRate: item.taxRate || 0,
                                taxAmount: item.taxAmount || 0
                            })];
                    case 6:
                        _h.sent();
                        _h.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 5];
                    case 8: return [2 /*return*/, { id: id, debitNoteNumber: autoNumber }];
                    case 9:
                        error_2 = _h.sent();
                        console.error("Error creating debit note:", error_2);
                        throw new Error("Failed to create debit note");
                    case 10: return [2 /*return*/];
                }
            });
        });
    }),
    update: editProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }).merge(createDebitNoteSchema))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, idCondition, computedSubtotal, subtotal, _i, _b, item, error_3;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 8, , 9]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _d.sent();
                        orgId = ctx.user.organizationId;
                        idCondition = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.debitNotes.id, input.id), drizzle_orm_1.eq(schema_1.debitNotes.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_1.debitNotes.id, input.id);
                        computedSubtotal = input.items.reduce(function (sum, item) { return sum + item.total; }, 0);
                        subtotal = (_c = input.subtotal) !== null && _c !== void 0 ? _c : computedSubtotal;
                        return [4 /*yield*/, db.update(schema_1.debitNotes).set({
                                debitNoteNumber: input.debitNoteNumber,
                                supplierId: input.supplierId,
                                supplierName: input.supplierName,
                                purchaseOrderId: input.purchaseOrderId || null,
                                issueDate: input.issueDate,
                                reason: input.reason,
                                subtotal: subtotal,
                                taxAmount: input.taxAmount || 0,
                                total: input.total,
                                status: input.status,
                                notes: input.notes || null
                            }).where(idCondition)];
                    case 2:
                        _d.sent();
                        // Replace line items
                        return [4 /*yield*/, db["delete"](schema_2.lineItems).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_2.lineItems.documentId, input.id), drizzle_orm_1.eq(schema_2.lineItems.documentType, 'debit_note')))];
                    case 3:
                        // Replace line items
                        _d.sent();
                        _i = 0, _b = input.items;
                        _d.label = 4;
                    case 4:
                        if (!(_i < _b.length)) return [3 /*break*/, 7];
                        item = _b[_i];
                        return [4 /*yield*/, db.insert(schema_2.lineItems).values({
                                id: uuid_1.v4(),
                                documentId: input.id,
                                documentType: 'debit_note',
                                description: item.description,
                                quantity: item.quantity,
                                rate: item.unitPrice,
                                amount: item.total,
                                taxRate: item.taxRate || 0,
                                taxAmount: item.taxAmount || 0
                            })];
                    case 5:
                        _d.sent();
                        _d.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7: return [2 /*return*/, { id: input.id }];
                    case 8:
                        error_3 = _d.sent();
                        console.error("Error updating debit note:", error_3);
                        throw new Error("Failed to update debit note");
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
            var db, orgId, idCondition, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        orgId = ctx.user.organizationId;
                        idCondition = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.debitNotes.id, input.id), drizzle_orm_1.eq(schema_1.debitNotes.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_1.debitNotes.id, input.id);
                        return [4 /*yield*/, db["delete"](schema_2.lineItems).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_2.lineItems.documentId, input.id), drizzle_orm_1.eq(schema_2.lineItems.documentType, 'debit_note')))];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, db["delete"](schema_1.debitNotes).where(idCondition)];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true, id: input.id }];
                    case 4:
                        error_4 = _b.sent();
                        console.error("Error deleting debit note:", error_4);
                        throw new Error("Failed to delete debit note");
                    case 5: return [2 /*return*/];
                }
            });
        });
    })
});
