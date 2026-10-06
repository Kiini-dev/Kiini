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
exports.estimatesRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var document_numbering_1 = require("../utils/document-numbering");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
// Permission-restricted procedure instances
var viewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:estimates:view");
var createProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:estimates:create");
var approveProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:estimates:approve");
// Use shared settings-aware document numbering
function generateNextEstimateNumber(db) {
    return __awaiter(this, void 0, Promise, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, document_numbering_1.generateNextDocumentNumber(db, "estimate")];
        });
    });
}
// Validation schema for line items
var lineItemSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    itemType: zod_1.z["enum"](['product', 'service', 'custom']),
    itemId: zod_1.z.string().optional(),
    description: zod_1.z.string(),
    quantity: zod_1.z.number().positive(),
    unitPrice: zod_1.z.number().nonnegative(),
    taxRate: zod_1.z.number().nonnegative()["default"](0),
    discountPercent: zod_1.z.number().nonnegative()["default"](0),
    total: zod_1.z.number().nonnegative()
});
exports.estimatesRouter = trpc_1.router({
    list: viewProcedure
        .input(zod_1.z.object({ limit: zod_1.z.number().optional(), offset: zod_1.z.number().optional() }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, baseQuery;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        orgId = ctx.user.organizationId;
                        baseQuery = orgId
                            ? db.select({
                                id: schema_1.estimates.id,
                                estimateNumber: schema_1.estimates.estimateNumber,
                                clientId: schema_1.estimates.clientId,
                                title: schema_1.estimates.title,
                                status: schema_1.estimates.status,
                                issueDate: schema_1.estimates.issueDate,
                                expiryDate: schema_1.estimates.expiryDate,
                                subtotal: schema_1.estimates.subtotal,
                                taxAmount: schema_1.estimates.taxAmount,
                                discountAmount: schema_1.estimates.discountAmount,
                                total: schema_1.estimates.total,
                                notes: schema_1.estimates.notes,
                                terms: schema_1.estimates.terms,
                                createdBy: schema_1.estimates.createdBy,
                                createdAt: schema_1.estimates.createdAt,
                                updatedAt: schema_1.estimates.updatedAt
                            }).from(schema_1.estimates).where(drizzle_orm_1.eq(schema_1.estimates.organizationId, orgId))
                            : db.select({
                                id: schema_1.estimates.id,
                                estimateNumber: schema_1.estimates.estimateNumber,
                                clientId: schema_1.estimates.clientId,
                                title: schema_1.estimates.title,
                                status: schema_1.estimates.status,
                                issueDate: schema_1.estimates.issueDate,
                                expiryDate: schema_1.estimates.expiryDate,
                                subtotal: schema_1.estimates.subtotal,
                                taxAmount: schema_1.estimates.taxAmount,
                                discountAmount: schema_1.estimates.discountAmount,
                                total: schema_1.estimates.total,
                                notes: schema_1.estimates.notes,
                                terms: schema_1.estimates.terms,
                                createdBy: schema_1.estimates.createdBy,
                                createdAt: schema_1.estimates.createdAt,
                                updatedAt: schema_1.estimates.updatedAt
                            }).from(schema_1.estimates);
                        return [4 /*yield*/, baseQuery.limit((input === null || input === void 0 ? void 0 : input.limit) || 50).offset((input === null || input === void 0 ? void 0 : input.offset) || 0)];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    getNextEstimateNumber: enhancedRbac_1.createFeatureRestrictedProcedure("estimates:read")
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, nextNumber;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    return [4 /*yield*/, generateNextEstimateNumber(db)];
                case 2:
                    nextNumber = _a.sent();
                    return [2 /*return*/, { estimateNumber: nextNumber }];
            }
        });
    }); }),
    getById: enhancedRbac_1.createFeatureRestrictedProcedure("estimates:read")
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, where, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.estimates.id, input), drizzle_orm_1.eq(schema_1.estimates.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.estimates.id, input);
                        return [4 /*yield*/, db
                                .select({
                                id: schema_1.estimates.id,
                                estimateNumber: schema_1.estimates.estimateNumber,
                                clientId: schema_1.estimates.clientId,
                                title: schema_1.estimates.title,
                                status: schema_1.estimates.status,
                                issueDate: schema_1.estimates.issueDate,
                                expiryDate: schema_1.estimates.expiryDate,
                                subtotal: schema_1.estimates.subtotal,
                                taxAmount: schema_1.estimates.taxAmount,
                                discountAmount: schema_1.estimates.discountAmount,
                                total: schema_1.estimates.total,
                                notes: schema_1.estimates.notes,
                                terms: schema_1.estimates.terms,
                                createdBy: schema_1.estimates.createdBy,
                                createdAt: schema_1.estimates.createdAt,
                                updatedAt: schema_1.estimates.updatedAt
                            })
                                .from(schema_1.estimates)
                                .where(where)
                                .limit(1)];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, result[0] || null];
                }
            });
        });
    }),
    // Get estimate with all line items
    getWithItems: enhancedRbac_1.createFeatureRestrictedProcedure("estimates:read")
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, where, estimate, items;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.estimates.id, input), drizzle_orm_1.eq(schema_1.estimates.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.estimates.id, input);
                        return [4 /*yield*/, db
                                .select({
                                id: schema_1.estimates.id,
                                estimateNumber: schema_1.estimates.estimateNumber,
                                clientId: schema_1.estimates.clientId,
                                title: schema_1.estimates.title,
                                status: schema_1.estimates.status,
                                issueDate: schema_1.estimates.issueDate,
                                expiryDate: schema_1.estimates.expiryDate,
                                subtotal: schema_1.estimates.subtotal,
                                taxAmount: schema_1.estimates.taxAmount,
                                discountAmount: schema_1.estimates.discountAmount,
                                total: schema_1.estimates.total,
                                notes: schema_1.estimates.notes,
                                terms: schema_1.estimates.terms,
                                createdBy: schema_1.estimates.createdBy,
                                createdAt: schema_1.estimates.createdAt,
                                updatedAt: schema_1.estimates.updatedAt
                            })
                                .from(schema_1.estimates)
                                .where(where)
                                .limit(1)];
                    case 2:
                        estimate = _b.sent();
                        if (!estimate[0])
                            return [2 /*return*/, null];
                        return [4 /*yield*/, db.select().from(schema_1.estimateItems).where(drizzle_orm_1.eq(schema_1.estimateItems.estimateId, input))];
                    case 3:
                        items = _b.sent();
                        return [2 /*return*/, __assign(__assign({}, estimate[0]), { lineItems: items })];
                }
            });
        });
    }),
    byClient: enhancedRbac_1.createFeatureRestrictedProcedure("estimates:read")
        .input(zod_1.z.object({ clientId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, where, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.estimates.clientId, input.clientId), drizzle_orm_1.eq(schema_1.estimates.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.estimates.clientId, input.clientId);
                        return [4 /*yield*/, db
                                .select({
                                id: schema_1.estimates.id,
                                estimateNumber: schema_1.estimates.estimateNumber,
                                clientId: schema_1.estimates.clientId,
                                title: schema_1.estimates.title,
                                status: schema_1.estimates.status,
                                issueDate: schema_1.estimates.issueDate,
                                expiryDate: schema_1.estimates.expiryDate,
                                subtotal: schema_1.estimates.subtotal,
                                taxAmount: schema_1.estimates.taxAmount,
                                discountAmount: schema_1.estimates.discountAmount,
                                total: schema_1.estimates.total,
                                notes: schema_1.estimates.notes,
                                terms: schema_1.estimates.terms,
                                createdBy: schema_1.estimates.createdBy,
                                createdAt: schema_1.estimates.createdAt,
                                updatedAt: schema_1.estimates.updatedAt
                            })
                                .from(schema_1.estimates)
                                .where(where)];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    }),
    create: enhancedRbac_1.createFeatureRestrictedProcedure("estimates:create")
        .input(zod_1.z.object({
        estimateNumber: zod_1.z.string().optional(),
        clientId: zod_1.z.string(),
        title: zod_1.z.string().optional(),
        status: zod_1.z["enum"](["draft", "sent", "accepted", "rejected", "expired"]).optional(),
        issueDate: zod_1.z.date(),
        expiryDate: zod_1.z.date().optional(),
        subtotal: zod_1.z.number(),
        taxAmount: zod_1.z.number().optional(),
        discountAmount: zod_1.z.number().optional(),
        total: zod_1.z.number(),
        notes: zod_1.z.string().optional(),
        terms: zod_1.z.string().optional(),
        lineItems: zod_1.z.array(lineItemSchema).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, estimateNumber, id, lineItems, estimateData, issueDate, expiryDate, now, _i, lineItems_1, item, itemId;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            throw new Error("Database not available");
                        estimateNumber = input.estimateNumber;
                        if (!!estimateNumber) return [3 /*break*/, 3];
                        return [4 /*yield*/, generateNextEstimateNumber(db)];
                    case 2:
                        estimateNumber = _c.sent();
                        _c.label = 3;
                    case 3:
                        id = uuid_1.v4();
                        lineItems = input.lineItems, estimateData = __rest(input, ["lineItems"]);
                        issueDate = estimateData.issueDate instanceof Date
                            ? estimateData.issueDate.toISOString().replace('T', ' ').substring(0, 19)
                            : estimateData.issueDate;
                        expiryDate = estimateData.expiryDate instanceof Date
                            ? estimateData.expiryDate.toISOString().replace('T', ' ').substring(0, 19)
                            : estimateData.expiryDate;
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, db.insert(schema_1.estimates).values(__assign(__assign({ id: id, organizationId: (_b = ctx.user.organizationId) !== null && _b !== void 0 ? _b : null, estimateNumber: estimateNumber }, estimateData), { issueDate: issueDate,
                                expiryDate: expiryDate, createdBy: ctx.user.id, createdAt: now, updatedAt: now }))];
                    case 4:
                        _c.sent();
                        if (!(lineItems && lineItems.length > 0)) return [3 /*break*/, 8];
                        _i = 0, lineItems_1 = lineItems;
                        _c.label = 5;
                    case 5:
                        if (!(_i < lineItems_1.length)) return [3 /*break*/, 8];
                        item = lineItems_1[_i];
                        itemId = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_1.estimateItems).values({
                                id: itemId,
                                estimateId: id,
                                itemType: item.itemType,
                                itemId: item.itemId,
                                description: item.description,
                                quantity: item.quantity,
                                unitPrice: item.unitPrice,
                                taxRate: item.taxRate,
                                discountPercent: item.discountPercent,
                                total: item.total
                            })];
                    case 6:
                        _c.sent();
                        _c.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 5];
                    case 8: return [4 /*yield*/, db.insert(schema_1.activityLog).values({
                            id: uuid_1.v4(),
                            userId: ctx.user.id,
                            action: "estimate_created",
                            entityType: "estimate",
                            entityId: id,
                            description: "Created estimate: " + estimateData.estimateNumber,
                            createdAt: now
                        })];
                    case 9:
                        _c.sent();
                        return [2 /*return*/, { id: id }];
                }
            });
        });
    }),
    update: enhancedRbac_1.createFeatureRestrictedProcedure("estimates:edit")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        estimateNumber: zod_1.z.string().optional(),
        clientId: zod_1.z.string().optional(),
        title: zod_1.z.string().optional(),
        status: zod_1.z["enum"](["draft", "sent", "accepted", "rejected", "expired"]).optional(),
        issueDate: zod_1.z.date().optional(),
        expiryDate: zod_1.z.date().optional(),
        subtotal: zod_1.z.number().optional(),
        taxAmount: zod_1.z.number().optional(),
        discountAmount: zod_1.z.number().optional(),
        total: zod_1.z.number().optional(),
        notes: zod_1.z.string().optional(),
        terms: zod_1.z.string().optional(),
        lineItems: zod_1.z.array(lineItemSchema).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, lineItems, data, updateData, orgId, updateWhere, _i, lineItems_2, item, itemId, now;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        id = input.id, lineItems = input.lineItems, data = __rest(input, ["id", "lineItems"]);
                        updateData = {};
                        Object.keys(data).forEach(function (key) {
                            var value = data[key];
                            if (value !== undefined) {
                                // Convert date fields to MySQL format
                                if ((key === 'issueDate' || key === 'expiryDate') && (value instanceof Date)) {
                                    updateData[key] = value.toISOString().replace('T', ' ').substring(0, 19);
                                }
                                else {
                                    updateData[key] = value;
                                }
                            }
                        });
                        updateData.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        orgId = ctx.user.organizationId;
                        updateWhere = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.estimates.id, id), drizzle_orm_1.eq(schema_1.estimates.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.estimates.id, id);
                        return [4 /*yield*/, db.update(schema_1.estimates).set(updateData).where(updateWhere)];
                    case 2:
                        _b.sent();
                        if (!(lineItems !== undefined)) return [3 /*break*/, 7];
                        // Delete existing line items
                        return [4 /*yield*/, db["delete"](schema_1.estimateItems).where(drizzle_orm_1.eq(schema_1.estimateItems.estimateId, id))];
                    case 3:
                        // Delete existing line items
                        _b.sent();
                        if (!(lineItems.length > 0)) return [3 /*break*/, 7];
                        _i = 0, lineItems_2 = lineItems;
                        _b.label = 4;
                    case 4:
                        if (!(_i < lineItems_2.length)) return [3 /*break*/, 7];
                        item = lineItems_2[_i];
                        itemId = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_1.estimateItems).values({
                                id: itemId,
                                estimateId: id,
                                itemType: item.itemType,
                                itemId: item.itemId,
                                description: item.description,
                                quantity: item.quantity,
                                unitPrice: item.unitPrice,
                                taxRate: item.taxRate,
                                discountPercent: item.discountPercent,
                                total: item.total
                            })];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7:
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, db.insert(schema_1.activityLog).values({
                                id: uuid_1.v4(),
                                userId: ctx.user.id,
                                action: "estimate_updated",
                                entityType: "estimate",
                                entityId: id,
                                description: "Updated estimate: " + input.estimateNumber,
                                createdAt: now
                            })];
                    case 8:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    "delete": enhancedRbac_1.createFeatureRestrictedProcedure("estimates:delete")
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, deleteWhere, now;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        // Delete line items first
                        return [4 /*yield*/, db["delete"](schema_1.estimateItems).where(drizzle_orm_1.eq(schema_1.estimateItems.estimateId, input))];
                    case 2:
                        // Delete line items first
                        _b.sent();
                        orgId = ctx.user.organizationId;
                        deleteWhere = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.estimates.id, input), drizzle_orm_1.eq(schema_1.estimates.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.estimates.id, input);
                        return [4 /*yield*/, db["delete"](schema_1.estimates).where(deleteWhere)];
                    case 3:
                        _b.sent();
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, db.insert(schema_1.activityLog).values({
                                id: uuid_1.v4(),
                                userId: ctx.user.id,
                                action: "estimate_deleted",
                                entityType: "estimate",
                                entityId: input,
                                description: "Deleted estimate: " + input,
                                createdAt: now
                            })];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // Get line items for an estimate
    getLineItems: enhancedRbac_1.createFeatureRestrictedProcedure("estimates:read")
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, db.select().from(schema_1.estimateItems).where(drizzle_orm_1.eq(schema_1.estimateItems.estimateId, input))];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    }),
    // Add line item to estimate
    addLineItem: enhancedRbac_1.createFeatureRestrictedProcedure("estimates:create")
        .input(zod_1.z.object({
        estimateId: zod_1.z.string(),
        itemType: zod_1.z["enum"](['product', 'service', 'custom']),
        itemId: zod_1.z.string().optional(),
        description: zod_1.z.string(),
        quantity: zod_1.z.number().positive(),
        unitPrice: zod_1.z.number().nonnegative(),
        taxRate: zod_1.z.number().nonnegative()["default"](0),
        discountPercent: zod_1.z.number().nonnegative()["default"](0),
        total: zod_1.z.number().nonnegative()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, estimateId, itemData, now;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        id = uuid_1.v4();
                        estimateId = input.estimateId, itemData = __rest(input, ["estimateId"]);
                        return [4 /*yield*/, db.insert(schema_1.estimateItems).values(__assign({ id: id,
                                estimateId: estimateId }, itemData))];
                    case 2:
                        _b.sent();
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, db.insert(schema_1.activityLog).values({
                                id: uuid_1.v4(),
                                userId: ctx.user.id,
                                action: "estimate_item_added",
                                entityType: "estimateItem",
                                entityId: id,
                                description: "Added line item to estimate: " + estimateId,
                                createdAt: now
                            })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { id: id }];
                }
            });
        });
    }),
    // Update line item
    updateLineItem: enhancedRbac_1.createFeatureRestrictedProcedure("estimates:edit")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        estimateId: zod_1.z.string(),
        itemType: zod_1.z["enum"](['product', 'service', 'custom']).optional(),
        itemId: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        quantity: zod_1.z.number().positive().optional(),
        unitPrice: zod_1.z.number().nonnegative().optional(),
        taxRate: zod_1.z.number().nonnegative().optional(),
        discountPercent: zod_1.z.number().nonnegative().optional(),
        total: zod_1.z.number().nonnegative().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, estimateId, data, now;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        id = input.id, estimateId = input.estimateId, data = __rest(input, ["id", "estimateId"]);
                        return [4 /*yield*/, db.update(schema_1.estimateItems).set(data).where(drizzle_orm_1.eq(schema_1.estimateItems.id, id))];
                    case 2:
                        _b.sent();
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, db.insert(schema_1.activityLog).values({
                                id: uuid_1.v4(),
                                userId: ctx.user.id,
                                action: "estimate_item_updated",
                                entityType: "estimateItem",
                                entityId: id,
                                description: "Updated line item in estimate: " + estimateId,
                                createdAt: now
                            })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // Delete line item
    deleteLineItem: enhancedRbac_1.createFeatureRestrictedProcedure("estimates:delete")
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, now;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        return [4 /*yield*/, db["delete"](schema_1.estimateItems).where(drizzle_orm_1.eq(schema_1.estimateItems.id, input))];
                    case 2:
                        _b.sent();
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, db.insert(schema_1.activityLog).values({
                                id: uuid_1.v4(),
                                userId: ctx.user.id,
                                action: "estimate_item_deleted",
                                entityType: "estimateItem",
                                entityId: input,
                                description: "Deleted line item: " + input,
                                createdAt: now
                            })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // Submit estimate for approval
    submitForApproval: enhancedRbac_1.createFeatureRestrictedProcedure("estimates:submit_for_approval")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, estimate, now;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        return [4 /*yield*/, db.select().from(schema_1.estimates).where(drizzle_orm_1.eq(schema_1.estimates.id, input.id)).limit(1)];
                    case 2:
                        estimate = _b.sent();
                        if (!estimate.length)
                            throw new Error("Estimate not found");
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, db.update(schema_1.estimates).set({
                                status: "sent",
                                updatedAt: now
                            }).where(drizzle_orm_1.eq(schema_1.estimates.id, input.id))];
                    case 3:
                        _b.sent();
                        // Create an approval record - NOTE: approvals table will be created when approval workflow is implemented
                        // const approvalId = uuidv4();
                        // await db.insert(approvals).values({
                        //   id: approvalId,
                        //   type: "estimate",
                        //   referenceId: input.id,
                        //   referenceNo: estimate[0].estimateNumber,
                        //   amount: estimate[0].total,
                        //   requestedBy: ctx.user.id,
                        //   requestedAt: now,
                        //   status: "pending",
                        //   priority: "medium",
                        //   description: `Estimate ${estimate[0].estimateNumber} submitted for approval${input.notes ? ` - ${input.notes}` : ''}`,
                        // } as any);
                        return [4 /*yield*/, db.insert(schema_1.activityLog).values({
                                id: uuid_1.v4(),
                                userId: ctx.user.id,
                                action: "estimate_submitted_for_approval",
                                entityType: "estimate",
                                entityId: input.id,
                                description: "Submitted estimate for approval: " + estimate[0].estimateNumber + (input.notes ? " (Notes: " + input.notes + ")" : ''),
                                createdAt: now
                            })];
                    case 4:
                        // Create an approval record - NOTE: approvals table will be created when approval workflow is implemented
                        // const approvalId = uuidv4();
                        // await db.insert(approvals).values({
                        //   id: approvalId,
                        //   type: "estimate",
                        //   referenceId: input.id,
                        //   referenceNo: estimate[0].estimateNumber,
                        //   amount: estimate[0].total,
                        //   requestedBy: ctx.user.id,
                        //   requestedAt: now,
                        //   status: "pending",
                        //   priority: "medium",
                        //   description: `Estimate ${estimate[0].estimateNumber} submitted for approval${input.notes ? ` - ${input.notes}` : ''}`,
                        // } as any);
                        _b.sent();
                        return [2 /*return*/, { success: true, approvalId: uuid_1.v4(), message: "Estimate submitted for approval" }];
                }
            });
        });
    }),
    generateHTML: viewProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        templateId: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var renderEstimateTemplate, result, db, now, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../utils/template-renderer'); })];
                    case 1:
                        renderEstimateTemplate = (_b.sent()).renderEstimateTemplate;
                        return [4 /*yield*/, renderEstimateTemplate(input.id, ctx.user.organizationId, input.templateId)];
                    case 2:
                        result = _b.sent();
                        if (!result) {
                            throw new Error('Failed to generate estimate HTML - no template found');
                        }
                        return [4 /*yield*/, db_1.getDb()];
                    case 3:
                        db = _b.sent();
                        if (!db) return [3 /*break*/, 5];
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, db.insert(schema_1.activityLog).values({
                                id: uuid_1.v4(),
                                userId: ctx.user.id,
                                action: "estimate_previewed",
                                entityType: "estimate",
                                entityId: input.id,
                                description: "Previewed estimate HTML",
                                createdAt: now
                            })];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5: return [2 /*return*/, {
                            success: true,
                            html: result.html,
                            title: result.title
                        }];
                    case 6:
                        error_1 = _b.sent();
                        throw new Error("Failed to generate estimate HTML: " + error_1);
                    case 7: return [2 /*return*/];
                }
            });
        });
    })
});
