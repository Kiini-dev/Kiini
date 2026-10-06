"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
exports.creditNotesRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var autoNumbering_1 = require("../lib/autoNumbering");
var viewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:credit-notes:view");
var createProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:credit-notes:create");
var editProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:credit-notes:edit");
var deleteProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:credit-notes:delete");
var creditNoteItemSchema = zod_1.z.object({
    description: zod_1.z.string().min(1),
    quantity: zod_1.z.number().positive(),
    rate: zod_1.z.number().nonnegative(),
    amount: zod_1.z.number().nonnegative(),
    taxRate: zod_1.z.number().nonnegative().optional(),
    taxAmount: zod_1.z.number().nonnegative().optional()
});
var createCreditNoteSchema = zod_1.z.object({
    creditNoteNumber: zod_1.z.string().optional(),
    issueDate: zod_1.z.string(),
    clientId: zod_1.z.string().min(1),
    clientName: zod_1.z.string().min(1),
    invoiceId: zod_1.z.string().optional(),
    reason: zod_1.z["enum"](["goods-returned", "service-cancelled", "discount", "quality-issue", "error", "other"]),
    items: zod_1.z.array(creditNoteItemSchema).min(1),
    subtotal: zod_1.z.number().nonnegative(),
    taxAmount: zod_1.z.number().nonnegative().optional(),
    total: zod_1.z.number().nonnegative(),
    notes: zod_1.z.string().optional(),
    status: zod_1.z["enum"](["draft", "approved"])["default"]("draft")
});
exports.creditNotesRouter = trpc_1.router({
    list: viewProcedure
        .query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, where, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.eq(schema_1.creditNotes.organizationId, orgId) : undefined;
                        return [4 /*yield*/, db.select().from(schema_1.creditNotes).where(where).orderBy(drizzle_orm_1.desc(schema_1.creditNotes.createdAt))];
                    case 2:
                        rows = _b.sent();
                        return [2 /*return*/, rows];
                }
            });
        });
    }),
    get: viewProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, conditions, cn, items;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        orgId = ctx.user.organizationId;
                        conditions = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.creditNotes.id, input.id), drizzle_orm_1.eq(schema_1.creditNotes.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_1.creditNotes.id, input.id);
                        return [4 /*yield*/, db.select().from(schema_1.creditNotes).where(conditions)];
                    case 2:
                        cn = (_b.sent())[0];
                        if (!cn)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, db.select().from(schema_1.lineItems).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.lineItems.documentId, input.id), drizzle_orm_1.eq(schema_1.lineItems.documentType, 'credit_note')))];
                    case 3:
                        items = _b.sent();
                        return [2 /*return*/, __assign(__assign({}, cn), { items: items })];
                }
            });
        });
    }),
    create: createProcedure
        .input(createCreditNoteSchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, autoNumber, _b, _i, _c, item;
            var _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _g.sent();
                        id = uuid_1.v4();
                        _b = input.creditNoteNumber;
                        if (_b) return [3 /*break*/, 3];
                        return [4 /*yield*/, autoNumbering_1.generateNextNumber('credit-notes')];
                    case 2:
                        _b = (_g.sent());
                        _g.label = 3;
                    case 3:
                        autoNumber = _b;
                        return [4 /*yield*/, db.insert(schema_1.creditNotes).values({
                                id: id,
                                organizationId: (_e = (_d = ctx.user) === null || _d === void 0 ? void 0 : _d.organizationId) !== null && _e !== void 0 ? _e : null,
                                creditNoteNumber: autoNumber,
                                clientId: input.clientId,
                                clientName: input.clientName,
                                invoiceId: input.invoiceId || null,
                                issueDate: input.issueDate,
                                reason: input.reason,
                                subtotal: input.subtotal,
                                taxAmount: input.taxAmount || 0,
                                total: input.total,
                                status: input.status,
                                notes: input.notes || null,
                                createdBy: (_f = ctx.user) === null || _f === void 0 ? void 0 : _f.id
                            })];
                    case 4:
                        _g.sent();
                        _i = 0, _c = input.items;
                        _g.label = 5;
                    case 5:
                        if (!(_i < _c.length)) return [3 /*break*/, 8];
                        item = _c[_i];
                        return [4 /*yield*/, db.insert(schema_1.lineItems).values({
                                id: uuid_1.v4(),
                                documentId: id,
                                documentType: 'credit_note',
                                description: item.description,
                                quantity: item.quantity,
                                rate: item.rate,
                                amount: item.amount,
                                taxRate: item.taxRate || 0,
                                taxAmount: item.taxAmount || 0
                            })];
                    case 6:
                        _g.sent();
                        _g.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 5];
                    case 8: return [2 /*return*/, { id: id, creditNoteNumber: autoNumber }];
                }
            });
        });
    }),
    update: editProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }).merge(createCreditNoteSchema))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, idCondition, _i, _b, item;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        orgId = ctx.user.organizationId;
                        idCondition = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.creditNotes.id, input.id), drizzle_orm_1.eq(schema_1.creditNotes.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_1.creditNotes.id, input.id);
                        return [4 /*yield*/, db.update(schema_1.creditNotes).set({
                                creditNoteNumber: input.creditNoteNumber,
                                clientId: input.clientId,
                                clientName: input.clientName,
                                invoiceId: input.invoiceId || null,
                                issueDate: input.issueDate,
                                reason: input.reason,
                                subtotal: input.subtotal,
                                taxAmount: input.taxAmount || 0,
                                total: input.total,
                                status: input.status,
                                notes: input.notes || null
                            }).where(idCondition)];
                    case 2:
                        _c.sent();
                        // Replace line items
                        return [4 /*yield*/, db["delete"](schema_1.lineItems).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.lineItems.documentId, input.id), drizzle_orm_1.eq(schema_1.lineItems.documentType, 'credit_note')))];
                    case 3:
                        // Replace line items
                        _c.sent();
                        _i = 0, _b = input.items;
                        _c.label = 4;
                    case 4:
                        if (!(_i < _b.length)) return [3 /*break*/, 7];
                        item = _b[_i];
                        return [4 /*yield*/, db.insert(schema_1.lineItems).values({
                                id: uuid_1.v4(),
                                documentId: input.id,
                                documentType: 'credit_note',
                                description: item.description,
                                quantity: item.quantity,
                                rate: item.rate,
                                amount: item.amount,
                                taxRate: item.taxRate || 0,
                                taxAmount: item.taxAmount || 0
                            })];
                    case 5:
                        _c.sent();
                        _c.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7: return [2 /*return*/, { id: input.id }];
                }
            });
        });
    }),
    "delete": deleteProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, idCondition;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        orgId = ctx.user.organizationId;
                        idCondition = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.creditNotes.id, input.id), drizzle_orm_1.eq(schema_1.creditNotes.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_1.creditNotes.id, input.id);
                        return [4 /*yield*/, db["delete"](schema_1.lineItems).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.lineItems.documentId, input.id), drizzle_orm_1.eq(schema_1.lineItems.documentType, 'credit_note')))];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, db["delete"](schema_1.creditNotes).where(idCondition)];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true, id: input.id }];
                }
            });
        });
    }),
    getNextNumber: viewProcedure
        .query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, where, result, num;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.eq(schema_1.creditNotes.organizationId, orgId) : undefined;
                        return [4 /*yield*/, db.select({ count: drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["COUNT(*)"], ["COUNT(*)"]))) }).from(schema_1.creditNotes).where(where)];
                    case 2:
                        result = (_b.sent())[0];
                        num = ((result === null || result === void 0 ? void 0 : result.count) || 0) + 1;
                        return [2 /*return*/, "CN-" + String(num).padStart(5, '0')];
                }
            });
        });
    })
});
var templateObject_1;
