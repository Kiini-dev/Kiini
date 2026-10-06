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
exports.quotesRouter = void 0;
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_extended_1 = require("../../drizzle/schema-extended");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
/**
 * Generate next quote number (QT-XXXX-MM)
 */
function getNextQuoteNumber(database) {
    return __awaiter(this, void 0, Promise, function () {
        var now, month, year, lastQuote, lastNumber, match, num, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    now = new Date();
                    month = String(now.getMonth() + 1).padStart(2, "0");
                    year = String(now.getFullYear()).slice(-2);
                    return [4 /*yield*/, database
                            .select()
                            .from(schema_extended_1.quotes)
                            .where(drizzle_orm_1.like(schema_extended_1.quotes.quoteNumber, "QT-%" + month + "%"))
                            .orderBy(drizzle_orm_1.desc(schema_extended_1.quotes.createdAt))
                            .limit(1)];
                case 1:
                    lastQuote = _b.sent();
                    if (!lastQuote.length) {
                        return [2 /*return*/, "QT-0001-" + month + year];
                    }
                    lastNumber = lastQuote[0].quoteNumber;
                    match = lastNumber === null || lastNumber === void 0 ? void 0 : lastNumber.match(/QT-(\d+)/);
                    if (match) {
                        num = parseInt(match[1], 10) + 1;
                        return [2 /*return*/, "QT-" + String(num).padStart(4, "0") + "-" + month + year];
                    }
                    return [2 /*return*/, "QT-0001-" + month + year];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, "QT-0001"];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.quotesRouter = trpc_1.router({
    // Get all quotes with filters
    list: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        clientId: zod_1.z.string().optional(),
        status: zod_1.z["enum"](["draft", "sent", "accepted", "expired", "declined", "converted"]).optional(),
        search: zod_1.z.string().optional(),
        limit: zod_1.z.number().optional(),
        offset: zod_1.z.number().optional()
    }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, limit, offset, query, conditions, orgId, results, error_1;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        limit = (input === null || input === void 0 ? void 0 : input.limit) || 50;
                        offset = (input === null || input === void 0 ? void 0 : input.offset) || 0;
                        query = database.select().from(schema_extended_1.quotes);
                        conditions = [];
                        orgId = (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId;
                        if (orgId) {
                            conditions.push(drizzle_orm_1.eq(schema_extended_1.quotes.organizationId, orgId));
                        }
                        if (input === null || input === void 0 ? void 0 : input.clientId) {
                            conditions.push(drizzle_orm_1.eq(schema_extended_1.quotes.clientId, input.clientId));
                        }
                        if (input === null || input === void 0 ? void 0 : input.status) {
                            conditions.push(drizzle_orm_1.eq(schema_extended_1.quotes.status, input.status));
                        }
                        if (input === null || input === void 0 ? void 0 : input.search) {
                            conditions.push(drizzle_orm_1.or(drizzle_orm_1.like(schema_extended_1.quotes.quoteNumber, "%" + input.search + "%"), drizzle_orm_1.like(schema_extended_1.quotes.subject, "%" + input.search + "%")));
                        }
                        if (conditions.length > 0) {
                            query = query.where(drizzle_orm_1.and.apply(void 0, conditions));
                        }
                        return [4 /*yield*/, query
                                .orderBy(drizzle_orm_1.desc(schema_extended_1.quotes.createdAt))
                                .limit(limit)
                                .offset(offset)];
                    case 2:
                        results = _c.sent();
                        return [2 /*return*/, results];
                    case 3:
                        error_1 = _c.sent();
                        console.error("[Quotes List Error]", error_1);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    // Get single quote with line items
    getById: trpc_1.protectedProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, result, quote, items, logs, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_extended_1.quotes)
                                .where(drizzle_orm_1.eq(schema_extended_1.quotes.id, input))
                                .limit(1)];
                    case 2:
                        result = _b.sent();
                        if (!result.length)
                            return [2 /*return*/, null];
                        quote = result[0];
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_extended_1.lineItems)
                                .where(drizzle_orm_1.eq(schema_extended_1.lineItems.quoteId, input))];
                    case 3:
                        items = _b.sent();
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_extended_1.quoteLogs)
                                .where(drizzle_orm_1.eq(schema_extended_1.quoteLogs.quoteId, input))
                                .orderBy(drizzle_orm_1.desc(schema_extended_1.quoteLogs.createdAt))];
                    case 4:
                        logs = _b.sent();
                        return [2 /*return*/, __assign(__assign({}, quote), { items: items || [], logs: logs || [] })];
                    case 5:
                        error_2 = _b.sent();
                        console.error("[Quotes GetById Error]", error_2);
                        return [2 /*return*/, null];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    // Create new quote
    create: enhancedRbac_1.createFeatureRestrictedProcedure("quotes:create")
        .input(zod_1.z.object({
        clientId: zod_1.z.string(),
        subject: zod_1.z.string(),
        description: zod_1.z.string().optional(),
        items: zod_1.z.array(zod_1.z.object({
            description: zod_1.z.string(),
            quantity: zod_1.z.number(),
            unitPrice: zod_1.z.number(),
            taxRate: zod_1.z.number().optional()
        })).min(1),
        notes: zod_1.z.string().optional(),
        expirationDays: zod_1.z.number()["default"](30),
        template: zod_1.z.boolean().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, quoteId, quoteNumber, subtotal_1, taxAmount_1, total, expirationDate, _i, _b, item, error_3;
            var _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _g.trys.push([0, 9, , 10]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _g.sent();
                        if (!database)
                            throw new Error("Database not available");
                        quoteId = uuid_1.v4();
                        return [4 /*yield*/, getNextQuoteNumber(database)];
                    case 2:
                        quoteNumber = _g.sent();
                        subtotal_1 = 0;
                        taxAmount_1 = 0;
                        input.items.forEach(function (item) {
                            var itemTotal = item.quantity * item.unitPrice;
                            subtotal_1 += itemTotal;
                            if (item.taxRate) {
                                taxAmount_1 += itemTotal * (item.taxRate / 100);
                            }
                        });
                        total = subtotal_1 + taxAmount_1;
                        expirationDate = new Date();
                        expirationDate.setDate(expirationDate.getDate() + input.expirationDays);
                        // Insert quote
                        return [4 /*yield*/, database.insert(schema_extended_1.quotes).values({
                                id: quoteId,
                                quoteNumber: quoteNumber,
                                clientId: input.clientId,
                                subject: input.subject,
                                description: input.description || null,
                                status: "draft",
                                subtotal: subtotal_1,
                                taxAmount: taxAmount_1,
                                total: total,
                                notes: input.notes || null,
                                expirationDate: expirationDate,
                                template: input.template ? 1 : 0,
                                createdBy: ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id) || "system",
                                organizationId: (_e = (_d = ctx.user) === null || _d === void 0 ? void 0 : _d.organizationId) !== null && _e !== void 0 ? _e : null,
                                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 3:
                        // Insert quote
                        _g.sent();
                        _i = 0, _b = input.items;
                        _g.label = 4;
                    case 4:
                        if (!(_i < _b.length)) return [3 /*break*/, 7];
                        item = _b[_i];
                        return [4 /*yield*/, database.insert(schema_extended_1.lineItems).values({
                                id: uuid_1.v4(),
                                quoteId: quoteId,
                                description: item.description,
                                quantity: item.quantity,
                                unitPrice: item.unitPrice,
                                taxRate: item.taxRate || 0,
                                total: item.quantity * item.unitPrice,
                                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 5:
                        _g.sent();
                        _g.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7: 
                    // Log activity
                    return [4 /*yield*/, database.insert(schema_extended_1.quoteLogs).values({
                            id: uuid_1.v4(),
                            quoteId: quoteId,
                            action: "created",
                            description: "Quote created",
                            userId: ((_f = ctx.user) === null || _f === void 0 ? void 0 : _f.id) || "system",
                            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        })];
                    case 8:
                        // Log activity
                        _g.sent();
                        return [2 /*return*/, {
                                id: quoteId,
                                quoteNumber: quoteNumber,
                                status: "draft",
                                total: total
                            }];
                    case 9:
                        error_3 = _g.sent();
                        console.error("[Quotes Create Error]", error_3);
                        throw new Error("Failed to create quote");
                    case 10: return [2 /*return*/];
                }
            });
        });
    }),
    // Update quote
    update: enhancedRbac_1.createFeatureRestrictedProcedure("quotes:update")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        subject: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional(),
        expirationDays: zod_1.z.number().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, updateData, expirationDate, error_4;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error("Database not available");
                        updateData = {
                            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        };
                        if (input.subject)
                            updateData.subject = input.subject;
                        if (input.description)
                            updateData.description = input.description;
                        if (input.notes !== undefined)
                            updateData.notes = input.notes;
                        if (input.expirationDays) {
                            expirationDate = new Date();
                            expirationDate.setDate(expirationDate.getDate() + input.expirationDays);
                            updateData.expirationDate = expirationDate;
                        }
                        return [4 /*yield*/, database
                                .update(schema_extended_1.quotes)
                                .set(updateData)
                                .where(drizzle_orm_1.eq(schema_extended_1.quotes.id, input.id))];
                    case 2:
                        _c.sent();
                        // Log activity
                        return [4 /*yield*/, database.insert(schema_extended_1.quoteLogs).values({
                                id: uuid_1.v4(),
                                quoteId: input.id,
                                action: "updated",
                                description: "Quote updated",
                                userId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || "system",
                                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 3:
                        // Log activity
                        _c.sent();
                        return [2 /*return*/, { success: true }];
                    case 4:
                        error_4 = _c.sent();
                        console.error("[Quotes Update Error]", error_4);
                        throw new Error("Failed to update quote");
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    // Send quote to client
    send: enhancedRbac_1.createFeatureRestrictedProcedure("quotes:send")
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, error_5;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database
                                .update(schema_extended_1.quotes)
                                .set({
                                status: "sent",
                                sentDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })
                                .where(drizzle_orm_1.eq(schema_extended_1.quotes.id, input))];
                    case 2:
                        _c.sent();
                        // Log activity
                        return [4 /*yield*/, database.insert(schema_extended_1.quoteLogs).values({
                                id: uuid_1.v4(),
                                quoteId: input,
                                action: "sent",
                                description: "Quote sent to client",
                                userId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || "system",
                                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 3:
                        // Log activity
                        _c.sent();
                        return [2 /*return*/, { success: true }];
                    case 4:
                        error_5 = _c.sent();
                        console.error("[Quotes Send Error]", error_5);
                        throw new Error("Failed to send quote");
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    // Client accepts quote
    accept: enhancedRbac_1.createFeatureRestrictedProcedure("quotes:accept")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, error_6;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database
                                .update(schema_extended_1.quotes)
                                .set({
                                status: "accepted",
                                acceptedDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })
                                .where(drizzle_orm_1.eq(schema_extended_1.quotes.id, input.id))];
                    case 2:
                        _c.sent();
                        // Log activity
                        return [4 /*yield*/, database.insert(schema_extended_1.quoteLogs).values({
                                id: uuid_1.v4(),
                                quoteId: input.id,
                                action: "accepted",
                                description: "Quote accepted" + (input.notes ? ": " + input.notes : ""),
                                userId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || "system",
                                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 3:
                        // Log activity
                        _c.sent();
                        return [2 /*return*/, { success: true }];
                    case 4:
                        error_6 = _c.sent();
                        console.error("[Quotes Accept Error]", error_6);
                        throw new Error("Failed to accept quote");
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    // Client declines quote
    decline: enhancedRbac_1.createFeatureRestrictedProcedure("quotes:decline")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        reason: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, error_7;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database
                                .update(schema_extended_1.quotes)
                                .set({
                                status: "declined",
                                declinedDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })
                                .where(drizzle_orm_1.eq(schema_extended_1.quotes.id, input.id))];
                    case 2:
                        _c.sent();
                        // Log activity
                        return [4 /*yield*/, database.insert(schema_extended_1.quoteLogs).values({
                                id: uuid_1.v4(),
                                quoteId: input.id,
                                action: "declined",
                                description: "Quote declined" + (input.reason ? ": " + input.reason : ""),
                                userId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || "system",
                                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 3:
                        // Log activity
                        _c.sent();
                        return [2 /*return*/, { success: true }];
                    case 4:
                        error_7 = _c.sent();
                        console.error("[Quotes Decline Error]", error_7);
                        throw new Error("Failed to decline quote");
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    // Convert accepted quote to invoice
    convertToInvoice: enhancedRbac_1.createFeatureRestrictedProcedure("quotes:convert")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        invoiceNote: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, quoteResult, quote, invoiceId, error_8;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_extended_1.quotes)
                                .where(drizzle_orm_1.eq(schema_extended_1.quotes.id, input.id))
                                .limit(1)];
                    case 2:
                        quoteResult = _c.sent();
                        if (!quoteResult.length)
                            throw new Error("Quote not found");
                        quote = quoteResult[0];
                        if (quote.status !== "accepted") {
                            throw new Error("Only accepted quotes can be converted to invoices");
                        }
                        invoiceId = uuid_1.v4();
                        // Update quote status
                        return [4 /*yield*/, database
                                .update(schema_extended_1.quotes)
                                .set({
                                status: "converted",
                                convertedInvoiceId: invoiceId,
                                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })
                                .where(drizzle_orm_1.eq(schema_extended_1.quotes.id, input.id))];
                    case 3:
                        // Update quote status
                        _c.sent();
                        // Log activity
                        return [4 /*yield*/, database.insert(schema_extended_1.quoteLogs).values({
                                id: uuid_1.v4(),
                                quoteId: input.id,
                                action: "converted",
                                description: "Converted to invoice " + invoiceId,
                                userId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || "system",
                                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 4:
                        // Log activity
                        _c.sent();
                        return [2 /*return*/, {
                                success: true,
                                invoiceId: invoiceId
                            }];
                    case 5:
                        error_8 = _c.sent();
                        console.error("[Quotes Convert Error]", error_8);
                        throw new Error("Failed to convert quote to invoice");
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    // Expire quote
    expire: enhancedRbac_1.createFeatureRestrictedProcedure("quotes:update")
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, error_9;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database
                                .update(schema_extended_1.quotes)
                                .set({
                                status: "expired",
                                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })
                                .where(drizzle_orm_1.eq(schema_extended_1.quotes.id, input))];
                    case 2:
                        _c.sent();
                        // Log activity
                        return [4 /*yield*/, database.insert(schema_extended_1.quoteLogs).values({
                                id: uuid_1.v4(),
                                quoteId: input,
                                action: "expired",
                                description: "Quote expired",
                                userId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || "system",
                                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 3:
                        // Log activity
                        _c.sent();
                        return [2 /*return*/, { success: true }];
                    case 4:
                        error_9 = _c.sent();
                        console.error("[Quotes Expire Error]", error_9);
                        throw new Error("Failed to expire quote");
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    // Duplicate quote
    duplicate: enhancedRbac_1.createFeatureRestrictedProcedure("quotes:create")
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, originalResult, original, newQuoteId, newQuoteNumber, originalItems, _i, originalItems_1, item, error_10;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 11, , 12]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _d.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_extended_1.quotes)
                                .where(drizzle_orm_1.eq(schema_extended_1.quotes.id, input))
                                .limit(1)];
                    case 2:
                        originalResult = _d.sent();
                        if (!originalResult.length)
                            throw new Error("Quote not found");
                        original = originalResult[0];
                        newQuoteId = uuid_1.v4();
                        return [4 /*yield*/, getNextQuoteNumber(database)];
                    case 3:
                        newQuoteNumber = _d.sent();
                        // Create new quote
                        return [4 /*yield*/, database.insert(schema_extended_1.quotes).values({
                                id: newQuoteId,
                                quoteNumber: newQuoteNumber,
                                clientId: original.clientId,
                                subject: original.subject + " (Copy)",
                                description: original.description,
                                status: "draft",
                                subtotal: original.subtotal,
                                taxAmount: original.taxAmount,
                                total: original.total,
                                notes: original.notes,
                                expirationDate: new Date(new Date().setDate(new Date().getDate() + 30)),
                                template: original.template,
                                createdBy: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || "system",
                                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 4:
                        // Create new quote
                        _d.sent();
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_extended_1.lineItems)
                                .where(drizzle_orm_1.eq(schema_extended_1.lineItems.quoteId, input))];
                    case 5:
                        originalItems = _d.sent();
                        _i = 0, originalItems_1 = originalItems;
                        _d.label = 6;
                    case 6:
                        if (!(_i < originalItems_1.length)) return [3 /*break*/, 9];
                        item = originalItems_1[_i];
                        return [4 /*yield*/, database.insert(schema_extended_1.lineItems).values({
                                id: uuid_1.v4(),
                                quoteId: newQuoteId,
                                description: item.description,
                                quantity: item.quantity,
                                unitPrice: item.unitPrice,
                                taxRate: item.taxRate,
                                total: item.total,
                                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 7:
                        _d.sent();
                        _d.label = 8;
                    case 8:
                        _i++;
                        return [3 /*break*/, 6];
                    case 9: 
                    // Log activity
                    return [4 /*yield*/, database.insert(schema_extended_1.quoteLogs).values({
                            id: uuid_1.v4(),
                            quoteId: newQuoteId,
                            action: "created",
                            description: "Duplicated from quote " + original.quoteNumber,
                            userId: ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id) || "system",
                            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        })];
                    case 10:
                        // Log activity
                        _d.sent();
                        return [2 /*return*/, {
                                id: newQuoteId,
                                quoteNumber: newQuoteNumber,
                                status: "draft"
                            }];
                    case 11:
                        error_10 = _d.sent();
                        console.error("[Quotes Duplicate Error]", error_10);
                        throw new Error("Failed to duplicate quote");
                    case 12: return [2 /*return*/];
                }
            });
        });
    }),
    // Delete quote
    "delete": enhancedRbac_1.createFeatureRestrictedProcedure("quotes:delete")
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, quoteResult, error_11;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_extended_1.quotes)
                                .where(drizzle_orm_1.eq(schema_extended_1.quotes.id, input))
                                .limit(1)];
                    case 2:
                        quoteResult = _b.sent();
                        if (quoteResult.length && quoteResult[0].status === "converted") {
                            throw new Error("Cannot delete converted quotes");
                        }
                        // Delete line items
                        return [4 /*yield*/, database["delete"](schema_extended_1.lineItems)
                                .where(drizzle_orm_1.eq(schema_extended_1.lineItems.quoteId, input))];
                    case 3:
                        // Delete line items
                        _b.sent();
                        // Delete logs
                        return [4 /*yield*/, database["delete"](schema_extended_1.quoteLogs)
                                .where(drizzle_orm_1.eq(schema_extended_1.quoteLogs.quoteId, input))];
                    case 4:
                        // Delete logs
                        _b.sent();
                        // Delete quote
                        return [4 /*yield*/, database["delete"](schema_extended_1.quotes)
                                .where(drizzle_orm_1.eq(schema_extended_1.quotes.id, input))];
                    case 5:
                        // Delete quote
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 6:
                        error_11 = _b.sent();
                        console.error("[Quotes Delete Error]", error_11);
                        throw new Error("Failed to delete quote");
                    case 7: return [2 /*return*/];
                }
            });
        });
    })
});
