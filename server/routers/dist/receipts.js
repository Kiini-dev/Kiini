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
exports.receiptsRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var emailNotifications_1 = require("./emailNotifications");
var triggerEngine_1 = require("../workflows/triggerEngine");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
// Permission-restricted procedure instances
var viewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:receipts:view");
var createProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:receipts:create");
var deleteProcedure = enhancedRbac_1.createRoleRestrictedProcedure(["super_admin", "admin"]);
// Helper function to generate next receipt number in format REC-000000
function generateNextReceiptNumber(db) {
    return __awaiter(this, void 0, Promise, function () {
        var result, maxSequence, match, nextSequence, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db.select({ recNum: schema_1.receipts.receiptNumber })
                            .from(schema_1.receipts)
                            .orderBy(drizzle_orm_1.desc(schema_1.receipts.receiptNumber))
                            .limit(1)];
                case 1:
                    result = _a.sent();
                    maxSequence = 0;
                    if (result && result.length > 0 && result[0].recNum) {
                        match = result[0].recNum.match(/(\d+)$/);
                        if (match) {
                            maxSequence = parseInt(match[1]);
                        }
                    }
                    nextSequence = maxSequence + 1;
                    return [2 /*return*/, "REC-" + String(nextSequence).padStart(6, '0')];
                case 2:
                    err_1 = _a.sent();
                    console.warn("Error generating receipt number, using default:", err_1);
                    return [2 /*return*/, "REC-000001"];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.receiptsRouter = trpc_1.router({
    list: viewProcedure
        .input(zod_1.z.object({ limit: zod_1.z.number().optional(), offset: zod_1.z.number().optional() }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, limit, offset, orgId, result, _b, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 7, , 8]);
                        limit = Math.min((input === null || input === void 0 ? void 0 : input.limit) || 50, 1000);
                        offset = (input === null || input === void 0 ? void 0 : input.offset) || 0;
                        orgId = ctx.user.organizationId;
                        if (!orgId) return [3 /*break*/, 4];
                        return [4 /*yield*/, db
                                .select({
                                id: schema_1.receipts.id,
                                receiptNumber: schema_1.receipts.receiptNumber,
                                clientId: schema_1.receipts.clientId,
                                paymentId: schema_1.receipts.paymentId,
                                amount: schema_1.receipts.amount,
                                subtotal: schema_1.receipts.subtotal,
                                taxAmount: schema_1.receipts.taxAmount,
                                discountAmount: schema_1.receipts.discountAmount,
                                paymentMethod: schema_1.receipts.paymentMethod,
                                receiptDate: schema_1.receipts.receiptDate,
                                status: schema_1.receipts.status,
                                notes: schema_1.receipts.notes,
                                createdBy: schema_1.receipts.createdBy,
                                createdAt: schema_1.receipts.createdAt
                            })
                                .from(schema_1.receipts)
                                .where(drizzle_orm_1.eq(schema_1.receipts.organizationId, orgId))
                                .orderBy(drizzle_orm_1.desc(schema_1.receipts.createdAt))
                                .limit(limit)
                                .offset(offset)];
                    case 3:
                        _b = _c.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, db
                            .select({
                            id: schema_1.receipts.id,
                            receiptNumber: schema_1.receipts.receiptNumber,
                            clientId: schema_1.receipts.clientId,
                            paymentId: schema_1.receipts.paymentId,
                            amount: schema_1.receipts.amount,
                            subtotal: schema_1.receipts.subtotal,
                            taxAmount: schema_1.receipts.taxAmount,
                            discountAmount: schema_1.receipts.discountAmount,
                            paymentMethod: schema_1.receipts.paymentMethod,
                            receiptDate: schema_1.receipts.receiptDate,
                            status: schema_1.receipts.status,
                            notes: schema_1.receipts.notes,
                            createdBy: schema_1.receipts.createdBy,
                            createdAt: schema_1.receipts.createdAt
                        })
                            .from(schema_1.receipts)
                            .orderBy(drizzle_orm_1.desc(schema_1.receipts.createdAt))
                            .limit(limit)
                            .offset(offset)];
                    case 5:
                        _b = _c.sent();
                        _c.label = 6;
                    case 6:
                        result = _b;
                        return [2 /*return*/, result || []];
                    case 7:
                        error_1 = _c.sent();
                        console.error("Error fetching receipts:", error_1);
                        return [2 /*return*/, []];
                    case 8: return [2 /*return*/];
                }
            });
        });
    }),
    getNextReceiptNumber: viewProcedure
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, nextNumber;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    return [4 /*yield*/, generateNextReceiptNumber(db)];
                case 2:
                    nextNumber = _a.sent();
                    return [2 /*return*/, { receiptNumber: nextNumber }];
            }
        });
    }); }),
    getById: viewProcedure
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
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.receipts.id, input), drizzle_orm_1.eq(schema_1.receipts.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.receipts.id, input);
                        return [4 /*yield*/, db
                                .select({
                                id: schema_1.receipts.id,
                                receiptNumber: schema_1.receipts.receiptNumber,
                                clientId: schema_1.receipts.clientId,
                                paymentId: schema_1.receipts.paymentId,
                                amount: schema_1.receipts.amount,
                                subtotal: schema_1.receipts.subtotal,
                                taxAmount: schema_1.receipts.taxAmount,
                                discountAmount: schema_1.receipts.discountAmount,
                                paymentMethod: schema_1.receipts.paymentMethod,
                                receiptDate: schema_1.receipts.receiptDate,
                                status: schema_1.receipts.status,
                                notes: schema_1.receipts.notes,
                                createdBy: schema_1.receipts.createdBy,
                                createdAt: schema_1.receipts.createdAt
                            })
                                .from(schema_1.receipts)
                                .where(where)
                                .limit(1)];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, result[0] || null];
                }
            });
        });
    }),
    byClient: viewProcedure
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
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.receipts.clientId, input.clientId), drizzle_orm_1.eq(schema_1.receipts.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.receipts.clientId, input.clientId);
                        return [4 /*yield*/, db
                                .select({
                                id: schema_1.receipts.id,
                                receiptNumber: schema_1.receipts.receiptNumber,
                                clientId: schema_1.receipts.clientId,
                                paymentId: schema_1.receipts.paymentId,
                                amount: schema_1.receipts.amount,
                                paymentMethod: schema_1.receipts.paymentMethod,
                                receiptDate: schema_1.receipts.receiptDate,
                                notes: schema_1.receipts.notes,
                                createdBy: schema_1.receipts.createdBy,
                                createdAt: schema_1.receipts.createdAt
                            })
                                .from(schema_1.receipts)
                                .where(where)];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    }),
    getWithItems: viewProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, where, receiptResult, items;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.receipts.id, input), drizzle_orm_1.eq(schema_1.receipts.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.receipts.id, input);
                        return [4 /*yield*/, db
                                .select({
                                id: schema_1.receipts.id,
                                receiptNumber: schema_1.receipts.receiptNumber,
                                clientId: schema_1.receipts.clientId,
                                paymentId: schema_1.receipts.paymentId,
                                amount: schema_1.receipts.amount,
                                paymentMethod: schema_1.receipts.paymentMethod,
                                receiptDate: schema_1.receipts.receiptDate,
                                notes: schema_1.receipts.notes,
                                createdBy: schema_1.receipts.createdBy,
                                createdAt: schema_1.receipts.createdAt
                            })
                                .from(schema_1.receipts)
                                .where(where)
                                .limit(1)];
                    case 2:
                        receiptResult = _b.sent();
                        if (!receiptResult.length)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, db.select().from(schema_1.lineItems).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.lineItems.documentId, input), drizzle_orm_1.eq(schema_1.lineItems.documentType, 'receipt')))];
                    case 3:
                        items = _b.sent();
                        return [2 /*return*/, __assign(__assign({}, receiptResult[0]), { lineItems: items })];
                }
            });
        });
    }),
    create: createProcedure
        .input(zod_1.z.object({
        receiptNumber: zod_1.z.string().optional(),
        clientId: zod_1.z.string(),
        paymentId: zod_1.z.string().optional(),
        amount: zod_1.z.number(),
        subtotal: zod_1.z.number(),
        taxAmount: zod_1.z.number()["default"](0),
        discountAmount: zod_1.z.number()["default"](0),
        paymentMethod: zod_1.z["enum"](["cash", "bank_transfer", "cheque", "mpesa", "card", "other"]),
        receiptDate: zod_1.z.date().or(zod_1.z.string()),
        notes: zod_1.z.string().optional(),
        lineItems: zod_1.z.array(zod_1.z.object({
            description: zod_1.z.string(),
            quantity: zod_1.z.number(),
            unitPrice: zod_1.z.number(),
            taxRate: zod_1.z.number().optional(),
            total: zod_1.z.number()
        })).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, receiptNumber, id, items, receiptData, convertToMySQLDateTime, formattedDate, now, i, item, err_2, err_3;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            throw new Error("Database not available");
                        receiptNumber = input.receiptNumber;
                        if (!!receiptNumber) return [3 /*break*/, 3];
                        return [4 /*yield*/, generateNextReceiptNumber(db)];
                    case 2:
                        receiptNumber = _c.sent();
                        _c.label = 3;
                    case 3:
                        id = uuid_1.v4();
                        items = input.lineItems, receiptData = __rest(input, ["lineItems"]);
                        convertToMySQLDateTime = function (date) {
                            if (!date)
                                return new Date().toISOString().replace('T', ' ').substring(0, 19);
                            if (typeof date === 'string')
                                return new Date(date).toISOString().replace('T', ' ').substring(0, 19);
                            if (date instanceof Date)
                                return date.toISOString().replace('T', ' ').substring(0, 19);
                            return new Date().toISOString().replace('T', ' ').substring(0, 19);
                        };
                        formattedDate = typeof receiptData.receiptDate === 'string'
                            ? new Date(receiptData.receiptDate)
                            : receiptData.receiptDate instanceof Date
                                ? receiptData.receiptDate
                                : new Date();
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, db.insert(schema_1.receipts).values(__assign(__assign({ id: id, organizationId: (_b = ctx.user.organizationId) !== null && _b !== void 0 ? _b : null, receiptNumber: receiptNumber }, receiptData), { receiptDate: formattedDate, createdBy: ctx.user.id, createdAt: now }))];
                    case 4:
                        _c.sent();
                        if (!(items && items.length > 0)) return [3 /*break*/, 8];
                        i = 0;
                        _c.label = 5;
                    case 5:
                        if (!(i < items.length)) return [3 /*break*/, 8];
                        item = items[i];
                        return [4 /*yield*/, db.insert(schema_1.lineItems).values({
                                id: uuid_1.v4(),
                                documentId: id,
                                documentType: 'receipt',
                                description: item.description,
                                quantity: item.quantity,
                                rate: item.unitPrice,
                                amount: item.total,
                                taxRate: item.taxRate || 0,
                                lineNumber: i + 1,
                                createdBy: ctx.user.id
                            })];
                    case 6:
                        _c.sent();
                        _c.label = 7;
                    case 7:
                        i++;
                        return [3 /*break*/, 5];
                    case 8:
                        _c.trys.push([8, 10, , 11]);
                        return [4 /*yield*/, emailNotifications_1.triggerEventNotification({
                                userId: ctx.user.id,
                                eventType: "receipt_created",
                                recipientEmail: "client@example.com",
                                recipientName: "Client",
                                subject: "Receipt " + receiptNumber + " Created",
                                htmlContent: "\n            <h2>Receipt Created</h2>\n            <p>Receipt <strong>" + receiptNumber + "</strong> has been created for amount <strong>Ksh " + (receiptData.amount / 100).toLocaleString("en-KE") + "</strong>.</p>\n            " + (receiptData.paymentId ? "<p><strong>Payment ID:</strong> " + receiptData.paymentId + "</p>" : "") + "\n            <p><a href=\"/receipts/" + id + "\">View Receipt</a></p>\n          ",
                                entityType: "receipt",
                                entityId: id,
                                actionUrl: "/receipts/" + id
                            })];
                    case 9:
                        _c.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        err_2 = _c.sent();
                        console.error("Failed to send receipt created notification:", err_2);
                        return [3 /*break*/, 11];
                    case 11:
                        _c.trys.push([11, 13, , 14]);
                        return [4 /*yield*/, triggerEngine_1.workflowTriggerEngine.trigger({
                                triggerType: "receipt_created",
                                entityType: "receipt",
                                entityId: id,
                                data: {
                                    receiptId: id,
                                    paymentId: receiptData.paymentId,
                                    amount: receiptData.amount,
                                    clientId: receiptData.clientId
                                },
                                userId: ctx.user.id
                            })];
                    case 12:
                        _c.sent();
                        return [3 /*break*/, 14];
                    case 13:
                        err_3 = _c.sent();
                        console.error("Workflow trigger (receipt_created) failed:", err_3);
                        return [3 /*break*/, 14];
                    case 14: return [2 /*return*/, { id: id }];
                }
            });
        });
    }),
    update: createProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        receiptNumber: zod_1.z.string().optional(),
        clientId: zod_1.z.string().optional(),
        paymentId: zod_1.z.string().optional(),
        amount: zod_1.z.number().optional(),
        subtotal: zod_1.z.number().optional(),
        taxAmount: zod_1.z.number().optional(),
        discountAmount: zod_1.z.number().optional(),
        paymentMethod: zod_1.z["enum"](["cash", "bank_transfer", "cheque", "mpesa", "card", "other"]).optional(),
        status: zod_1.z["enum"](["draft", "issued", "void"]).optional(),
        receiptDate: zod_1.z.date().or(zod_1.z.string()).optional(),
        notes: zod_1.z.string().optional(),
        lineItems: zod_1.z.array(zod_1.z.object({
            description: zod_1.z.string(),
            quantity: zod_1.z.number(),
            unitPrice: zod_1.z.number(),
            taxRate: zod_1.z.number().optional(),
            total: zod_1.z.number()
        })).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, items, data, orgId, existing, convertToMySQLDateTime, updateData, i, item;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        id = input.id, items = input.lineItems, data = __rest(input, ["id", "lineItems"]);
                        orgId = ctx.user.organizationId;
                        if (!orgId) return [3 /*break*/, 3];
                        return [4 /*yield*/, db.select({ orgId: schema_1.receipts.organizationId }).from(schema_1.receipts).where(drizzle_orm_1.eq(schema_1.receipts.id, id)).limit(1)];
                    case 2:
                        existing = _b.sent();
                        if (!existing.length || existing[0].orgId !== orgId)
                            throw new Error("Receipt not found");
                        _b.label = 3;
                    case 3:
                        convertToMySQLDateTime = function (date) {
                            if (!date)
                                return undefined;
                            if (typeof date === 'string')
                                return new Date(date).toISOString().replace('T', ' ').substring(0, 19);
                            if (date instanceof Date)
                                return date.toISOString().replace('T', ' ').substring(0, 19);
                            return undefined;
                        };
                        updateData = __assign({}, data);
                        if (data.receiptDate) {
                            updateData.receiptDate = typeof data.receiptDate === 'string'
                                ? new Date(data.receiptDate)
                                : data.receiptDate instanceof Date
                                    ? data.receiptDate
                                    : undefined;
                        }
                        return [4 /*yield*/, db.update(schema_1.receipts).set(updateData).where(drizzle_orm_1.eq(schema_1.receipts.id, id))];
                    case 4:
                        _b.sent();
                        if (!(items !== undefined)) return [3 /*break*/, 9];
                        return [4 /*yield*/, db["delete"](schema_1.lineItems).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.lineItems.documentId, id), drizzle_orm_1.eq(schema_1.lineItems.documentType, 'receipt')))];
                    case 5:
                        _b.sent();
                        if (!(items && items.length > 0)) return [3 /*break*/, 9];
                        i = 0;
                        _b.label = 6;
                    case 6:
                        if (!(i < items.length)) return [3 /*break*/, 9];
                        item = items[i];
                        return [4 /*yield*/, db.insert(schema_1.lineItems).values({
                                id: uuid_1.v4(),
                                documentId: id,
                                documentType: 'receipt',
                                description: item.description,
                                quantity: item.quantity,
                                rate: item.unitPrice,
                                amount: item.total,
                                taxRate: item.taxRate || 0,
                                lineNumber: i + 1,
                                createdBy: ctx.user.id
                            })];
                    case 7:
                        _b.sent();
                        _b.label = 8;
                    case 8:
                        i++;
                        return [3 /*break*/, 6];
                    case 9: return [2 /*return*/, { success: true }];
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
            var renderReceiptTemplate, result, db, now, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../utils/template-renderer'); })];
                    case 1:
                        renderReceiptTemplate = (_b.sent()).renderReceiptTemplate;
                        return [4 /*yield*/, renderReceiptTemplate(input.id, ctx.user.organizationId, input.templateId)];
                    case 2:
                        result = _b.sent();
                        if (!result) {
                            throw new Error('Failed to generate receipt HTML - no template found');
                        }
                        return [4 /*yield*/, db_1.getDb()];
                    case 3:
                        db = _b.sent();
                        if (!db) return [3 /*break*/, 5];
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, db.insert(activityLog).values({
                                id: uuid_1.v4(),
                                userId: ctx.user.id,
                                action: "receipt_previewed",
                                entityType: "receipt",
                                entityId: input.id,
                                description: "Previewed receipt HTML",
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
                        error_2 = _b.sent();
                        throw new Error("Failed to generate receipt HTML: " + error_2);
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    "delete": deleteProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, existing;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        orgId = ctx.user.organizationId;
                        if (!orgId) return [3 /*break*/, 3];
                        return [4 /*yield*/, db.select({ orgId: schema_1.receipts.organizationId }).from(schema_1.receipts).where(drizzle_orm_1.eq(schema_1.receipts.id, input)).limit(1)];
                    case 2:
                        existing = _b.sent();
                        if (!existing.length || existing[0].orgId !== orgId)
                            throw new Error("Receipt not found");
                        _b.label = 3;
                    case 3: 
                    // Delete associated line items first
                    return [4 /*yield*/, db["delete"](schema_1.lineItems).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.lineItems.documentId, input), drizzle_orm_1.eq(schema_1.lineItems.documentType, 'receipt')))];
                    case 4:
                        // Delete associated line items first
                        _b.sent();
                        return [4 /*yield*/, db["delete"](schema_1.receipts).where(drizzle_orm_1.eq(schema_1.receipts.id, input))];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    })
});
