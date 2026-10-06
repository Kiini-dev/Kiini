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
exports.invoicesRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var schema_extended_1 = require("../../drizzle/schema-extended");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var pdf_generator_1 = require("../utils/pdf-generator");
var emailNotifications_1 = require("./emailNotifications");
var triggerEngine_1 = require("../workflows/triggerEngine");
var sse_1 = require("../sse");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var document_numbering_1 = require("../utils/document-numbering");
var company_info_1 = require("../utils/company-info");
var orgIsolation_1 = require("../middleware/orgIsolation");
var server_1 = require("@trpc/server");
// Permission-restricted procedure instances
var viewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:invoices:view");
var createProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:invoices:create");
var approveProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:invoices:approve");
var deleteProcedure = enhancedRbac_1.createRoleRestrictedProcedure(["super_admin", "admin"]);
// Use shared settings-aware document numbering
function generateNextInvoiceNumber(db) {
    return __awaiter(this, void 0, Promise, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, document_numbering_1.generateNextDocumentNumber(db, "invoice")];
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
// Helper function to send invoice notifications
function sendInvoiceNotification(db, userId, action, invoiceNumber, invoiceId) {
    return __awaiter(this, void 0, void 0, function () {
        var messages, titles, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    messages = {
                        created: "Invoice " + invoiceNumber + " has been created successfully",
                        updated: "Invoice " + invoiceNumber + " has been updated",
                        approved: "Invoice " + invoiceNumber + " has been approved",
                        sent: "Invoice " + invoiceNumber + " has been sent to client",
                        paid: "Invoice " + invoiceNumber + " has been marked as paid"
                    };
                    titles = {
                        created: "Invoice Created",
                        updated: "Invoice Updated",
                        approved: "Invoice Approved",
                        sent: "Invoice Sent",
                        paid: "Payment Received"
                    };
                    return [4 /*yield*/, db_1.createNotification({
                            userId: userId,
                            title: titles[action],
                            message: messages[action],
                            type: action === "paid" || action === "approved" ? "success" : "info",
                            category: "invoice",
                            entityType: "invoice",
                            entityId: invoiceId,
                            actionUrl: "/invoices/" + invoiceId,
                            priority: "normal"
                        })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    console.warn("Failed to create invoice notification:", err_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Helper functions for invoice analytics and aging
var advancedFilterSchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    status: zod_1.z["enum"](["draft", "sent", "paid", "partial", "overdue", "cancelled"]).optional(),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    minAmount: zod_1.z.number().optional(),
    maxAmount: zod_1.z.number().optional(),
    clientIds: zod_1.z.array(zod_1.z.string()).optional(),
    isPaid: zod_1.z.boolean().optional(),
    isOverdue: zod_1.z.boolean().optional(),
    limit: zod_1.z.number().min(1).max(500)["default"](50),
    offset: zod_1.z.number().min(0)["default"](0),
    sortBy: zod_1.z["enum"](["dueDate", "issueDate", "amount", "clientName"])["default"]("issueDate"),
    sortOrder: zod_1.z["enum"](["asc", "desc"])["default"]("desc")
});
function calculateDaysOverdue(dueDate) {
    var due = new Date(dueDate);
    var today = new Date();
    var daysOverdue = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    return daysOverdue > 0 ? daysOverdue : 0;
}
function getAgingCategory(daysOverdue) {
    if (daysOverdue <= 0)
        return "current";
    if (daysOverdue <= 30)
        return "30days";
    if (daysOverdue <= 60)
        return "60days";
    if (daysOverdue <= 90)
        return "90days";
    return "over90days";
}
function logInvoiceActivity(db, invoiceId, action, userId, metadata) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.logActivity({
                        userId: userId,
                        action: "invoice_" + action,
                        entityType: "invoice",
                        entityId: invoiceId,
                        description: "Invoice " + action + " recorded for " + invoiceId,
                        metadata: metadata ? JSON.stringify(metadata) : null
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.invoicesRouter = trpc_1.router({
    list: viewProcedure
        .input(zod_1.z.object({ limit: zod_1.z.number().optional(), offset: zod_1.z.number().optional() }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, result, _b, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db) {
                            console.error("[Invoices] Database connection not available");
                            return [2 /*return*/, []];
                        }
                        orgId = ctx.user.organizationId;
                        if (!orgId) return [3 /*break*/, 3];
                        return [4 /*yield*/, db.select().from(schema_1.invoices).where(drizzle_orm_1.eq(schema_1.invoices.organizationId, orgId)).limit((input === null || input === void 0 ? void 0 : input.limit) || 50).offset((input === null || input === void 0 ? void 0 : input.offset) || 0)];
                    case 2:
                        _b = _c.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, db.select().from(schema_1.invoices).limit((input === null || input === void 0 ? void 0 : input.limit) || 50).offset((input === null || input === void 0 ? void 0 : input.offset) || 0)];
                    case 4:
                        _b = _c.sent();
                        _c.label = 5;
                    case 5:
                        result = _b;
                        return [2 /*return*/, result];
                    case 6:
                        error_1 = _c.sent();
                        console.error("[Invoices] Error fetching invoices:", error_1);
                        throw error_1; // Re-throw so TRPC can handle it as a proper error response
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    getNextInvoiceNumber: viewProcedure
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, nextNumber;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    return [4 /*yield*/, generateNextInvoiceNumber(db)];
                case 2:
                    nextNumber = _a.sent();
                    return [2 /*return*/, { invoiceNumber: nextNumber }];
            }
        });
    }); }),
    getById: viewProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, db.select().from(schema_1.invoices).where(drizzle_orm_1.eq(schema_1.invoices.id, input)).limit(1)];
                    case 2:
                        result = _b.sent();
                        if (!result[0])
                            return [2 /*return*/, null];
                        // STRICT: Verify user owns this invoice
                        orgIsolation_1.verifyOrgOwnership(ctx, result[0].organizationId);
                        return [2 /*return*/, result[0] || null];
                }
            });
        });
    }),
    // Get invoice with all line items
    getWithItems: viewProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, invoice, items;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, db.select().from(schema_1.invoices).where(drizzle_orm_1.eq(schema_1.invoices.id, input)).limit(1)];
                    case 2:
                        invoice = _b.sent();
                        if (!invoice[0])
                            return [2 /*return*/, null];
                        // STRICT: Verify user owns this invoice
                        orgIsolation_1.verifyOrgOwnership(ctx, invoice[0].organizationId);
                        return [4 /*yield*/, db.select().from(schema_1.invoiceItems).where(drizzle_orm_1.eq(schema_1.invoiceItems.invoiceId, input))];
                    case 3:
                        items = _b.sent();
                        return [2 /*return*/, __assign(__assign({}, invoice[0]), { lineItems: items })];
                }
            });
        });
    }),
    byClient: viewProcedure
        .input(zod_1.z.object({ clientId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, clientResult, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, db.select({ organizationId: schema_1.clients.organizationId }).from(schema_1.clients).where(drizzle_orm_1.eq(schema_1.clients.id, input.clientId)).limit(1)];
                    case 2:
                        clientResult = _b.sent();
                        if (!clientResult[0])
                            return [2 /*return*/, []];
                        orgIsolation_1.verifyOrgOwnership(ctx, clientResult[0].organizationId);
                        return [4 /*yield*/, db.select().from(schema_1.invoices).where(drizzle_orm_1.eq(schema_1.invoices.clientId, input.clientId))];
                    case 3:
                        result = _b.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    }),
    create: createProcedure
        .input(zod_1.z.object({
        invoiceNumber: zod_1.z.string().optional(),
        clientId: zod_1.z.string(),
        title: zod_1.z.string().optional(),
        status: zod_1.z["enum"](["draft", "sent", "paid", "partial", "overdue", "cancelled"]).optional(),
        issueDate: zod_1.z.date(),
        dueDate: zod_1.z.date(),
        subtotal: zod_1.z.number(),
        taxAmount: zod_1.z.number().optional(),
        discountAmount: zod_1.z.number().optional(),
        total: zod_1.z.number(),
        paidAmount: zod_1.z.number()["default"](0),
        notes: zod_1.z.string().optional(),
        terms: zod_1.z.string().optional(),
        estimateId: zod_1.z.string().optional(),
        lineItems: zod_1.z.array(lineItemSchema).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, lineItems, invoiceData, invoiceNumber, convertToMySQLDateTime, issueDate, dueDate, now, clientId, total, insertValues, err_2, _i, lineItems_1, item, itemId, dateObj, dueDateFormatted, err_3, err_4;
            var _b, _c, _d, _e, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _h.sent();
                        if (!db)
                            throw new Error("Database not available");
                        id = uuid_1.v4();
                        lineItems = input.lineItems, invoiceData = __rest(input, ["lineItems"]);
                        invoiceNumber = invoiceData.invoiceNumber;
                        if (!!invoiceNumber) return [3 /*break*/, 3];
                        return [4 /*yield*/, generateNextInvoiceNumber(db)];
                    case 2:
                        invoiceNumber = _h.sent();
                        _h.label = 3;
                    case 3:
                        convertToMySQLDateTime = function (date) {
                            if (!date)
                                return new Date().toISOString().replace('T', ' ').substring(0, 19);
                            if (typeof date === 'string')
                                return new Date(date).toISOString().replace('T', ' ').substring(0, 19);
                            if (date instanceof Date)
                                return date.toISOString().replace('T', ' ').substring(0, 19);
                            return new Date().toISOString().replace('T', ' ').substring(0, 19);
                        };
                        issueDate = convertToMySQLDateTime(invoiceData.issueDate);
                        dueDate = convertToMySQLDateTime(invoiceData.dueDate);
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        clientId = invoiceData.clientId;
                        total = invoiceData.total;
                        _h.label = 4;
                    case 4:
                        _h.trys.push([4, 7, , 8]);
                        insertValues = {
                            id: id,
                            invoiceNumber: invoiceNumber,
                            invoiceSequence: parseInt(((_b = invoiceNumber.match(/-(\d+)$/)) === null || _b === void 0 ? void 0 : _b[1]) || '0') || 0,
                            clientId: clientId,
                            estimateId: invoiceData.estimateId || null,
                            title: invoiceData.title || null,
                            status: (_c = invoiceData.status) !== null && _c !== void 0 ? _c : "draft",
                            issueDate: issueDate,
                            dueDate: dueDate,
                            subtotal: invoiceData.subtotal,
                            taxAmount: (_d = invoiceData.taxAmount) !== null && _d !== void 0 ? _d : 0,
                            discountAmount: (_e = invoiceData.discountAmount) !== null && _e !== void 0 ? _e : 0,
                            total: total,
                            paidAmount: (_f = invoiceData.paidAmount) !== null && _f !== void 0 ? _f : 0,
                            notes: invoiceData.notes || null,
                            terms: invoiceData.terms || null,
                            organizationId: (_g = ctx.user.organizationId) !== null && _g !== void 0 ? _g : null,
                            createdBy: ctx.user.id,
                            createdAt: now,
                            updatedAt: now,
                            paymentPlanId: null
                        };
                        return [4 /*yield*/, db.insert(schema_1.invoices).values(insertValues)];
                    case 5:
                        _h.sent();
                        // Create activity log (inside try block so insertValues is in scope)
                        return [4 /*yield*/, db.insert(schema_1.activityLog).values({
                                id: uuid_1.v4(),
                                userId: ctx.user.id,
                                action: "invoice_created",
                                entityType: "invoice",
                                entityId: id,
                                description: "Created invoice: " + invoiceNumber,
                                createdAt: now
                            })];
                    case 6:
                        // Create activity log (inside try block so insertValues is in scope)
                        _h.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        err_2 = _h.sent();
                        console.error('Failed to insert invoice', { invoiceData: invoiceData, err: err_2 });
                        throw new Error('Failed to create invoice: ' + ((err_2 === null || err_2 === void 0 ? void 0 : err_2.message) || String(err_2)));
                    case 8:
                        if (!(lineItems && lineItems.length > 0)) return [3 /*break*/, 12];
                        _i = 0, lineItems_1 = lineItems;
                        _h.label = 9;
                    case 9:
                        if (!(_i < lineItems_1.length)) return [3 /*break*/, 12];
                        item = lineItems_1[_i];
                        itemId = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_1.invoiceItems).values({
                                id: itemId,
                                invoiceId: id,
                                itemType: item.itemType,
                                itemId: item.itemId,
                                description: item.description,
                                quantity: item.quantity,
                                unitPrice: item.unitPrice,
                                taxRate: item.taxRate,
                                discountPercent: item.discountPercent,
                                total: item.total
                            })];
                    case 10:
                        _h.sent();
                        _h.label = 11;
                    case 11:
                        _i++;
                        return [3 /*break*/, 9];
                    case 12: 
                    // Send notification
                    return [4 /*yield*/, sendInvoiceNotification(db, ctx.user.id, "created", invoiceNumber, id)];
                    case 13:
                        // Send notification
                        _h.sent();
                        // SSE: broadcast to org
                        if (ctx.user.organizationId) {
                            sse_1.notifyOrg(ctx.user.organizationId, {
                                id: "invoice-created-" + id,
                                type: "invoice_created",
                                title: "Invoice Created",
                                body: "Invoice " + invoiceNumber + " has been created",
                                href: "/org/" + (ctx.user.organizationSlug || '') + "/invoices",
                                timestamp: new Date().toISOString()
                            });
                        }
                        _h.label = 14;
                    case 14:
                        _h.trys.push([14, 16, , 17]);
                        dateObj = new Date();
                        dueDateFormatted = dueDate ? new Date(dueDate).toLocaleDateString() : 'Not set';
                        return [4 /*yield*/, emailNotifications_1.triggerEventNotification({
                                userId: ctx.user.id,
                                eventType: "invoice_created",
                                recipientEmail: ctx.user.email || "accountant@company.com",
                                recipientName: "Accountant",
                                subject: "Invoice " + invoiceNumber + " Created",
                                htmlContent: "\n            <h2>New Invoice Created</h2>\n            <p>Invoice <strong>" + invoiceNumber + "</strong> has been created.</p>\n            <ul>\n              <li><strong>Client ID:</strong> " + clientId + "</li>\n              <li><strong>Amount:</strong> Ksh " + (total / 100).toLocaleString("en-KE") + "</li>\n              <li><strong>Issue Date:</strong> " + new Date(issueDate).toLocaleDateString() + "</li>\n              <li><strong>Due Date:</strong> " + dueDateFormatted + "</li>\n            </ul>\n            <p><a href=\"/invoices/" + id + "\">View Invoice</a></p>\n          ",
                                entityType: "invoice",
                                entityId: id,
                                actionUrl: "/invoices/" + id
                            })];
                    case 15:
                        _h.sent();
                        return [3 /*break*/, 17];
                    case 16:
                        err_3 = _h.sent();
                        console.error("Failed to send invoice creation email:", err_3);
                        return [3 /*break*/, 17];
                    case 17:
                        _h.trys.push([17, 19, , 20]);
                        return [4 /*yield*/, triggerEngine_1.workflowTriggerEngine.trigger({
                                triggerType: "invoice_created",
                                entityType: "invoice",
                                entityId: id,
                                data: {
                                    id: id,
                                    invoiceNumber: invoiceNumber,
                                    clientId: clientId,
                                    total: total,
                                    issueDate: issueDate,
                                    dueDate: dueDate
                                },
                                userId: ctx.user.id
                            })];
                    case 18:
                        _h.sent();
                        return [3 /*break*/, 20];
                    case 19:
                        err_4 = _h.sent();
                        console.error("Workflow trigger (invoice_created) failed:", err_4);
                        return [3 /*break*/, 20];
                    case 20: return [2 /*return*/, { id: id }];
                }
            });
        });
    }),
    update: createProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        invoiceNumber: zod_1.z.string().optional(),
        clientId: zod_1.z.string().optional(),
        title: zod_1.z.string().optional(),
        status: zod_1.z["enum"](["draft", "sent", "paid", "partial", "overdue", "cancelled"]).optional(),
        issueDate: zod_1.z.date().optional(),
        dueDate: zod_1.z.date().optional(),
        subtotal: zod_1.z.number().optional(),
        taxAmount: zod_1.z.number().optional(),
        discountAmount: zod_1.z.number().optional(),
        total: zod_1.z.number().optional(),
        paidAmount: zod_1.z.number().optional(),
        notes: zod_1.z.string().optional(),
        terms: zod_1.z.string().optional(),
        lineItems: zod_1.z.array(lineItemSchema).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, lineItems, data, currentInvoice, oldStatus, newStatus, convertToMySQLDateTime, updateData, _i, lineItems_2, item, itemId, invoiceNumber, err_5, dueDate, _b, _c, _d, err_6;
            var _e, _f, _g, _h, _j;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _k.sent();
                        if (!db)
                            throw new Error("Database not available");
                        id = input.id, lineItems = input.lineItems, data = __rest(input, ["id", "lineItems"]);
                        return [4 /*yield*/, db.select({ organizationId: schema_1.invoices.organizationId, status: schema_1.invoices.status }).from(schema_1.invoices).where(drizzle_orm_1.eq(schema_1.invoices.id, id)).limit(1)];
                    case 2:
                        currentInvoice = _k.sent();
                        if (!currentInvoice.length)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
                        orgIsolation_1.verifyOrgOwnership(ctx, currentInvoice[0].organizationId);
                        oldStatus = (_e = currentInvoice[0]) === null || _e === void 0 ? void 0 : _e.status;
                        newStatus = data.status;
                        convertToMySQLDateTime = function (date) {
                            if (!date)
                                return undefined;
                            if (typeof date === 'string')
                                return new Date(date).toISOString().replace('T', ' ').substring(0, 19);
                            if (date instanceof Date)
                                return date.toISOString().replace('T', ' ').substring(0, 19);
                            return undefined;
                        };
                        updateData = __assign(__assign({}, data), { issueDate: convertToMySQLDateTime(data.issueDate), dueDate: convertToMySQLDateTime(data.dueDate), updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) });
                        return [4 /*yield*/, db.update(schema_1.invoices).set(updateData).where(drizzle_orm_1.eq(schema_1.invoices.id, id))];
                    case 3:
                        _k.sent();
                        if (!(lineItems !== undefined)) return [3 /*break*/, 8];
                        // Delete existing line items
                        return [4 /*yield*/, db["delete"](schema_1.invoiceItems).where(drizzle_orm_1.eq(schema_1.invoiceItems.invoiceId, id))];
                    case 4:
                        // Delete existing line items
                        _k.sent();
                        if (!(lineItems.length > 0)) return [3 /*break*/, 8];
                        _i = 0, lineItems_2 = lineItems;
                        _k.label = 5;
                    case 5:
                        if (!(_i < lineItems_2.length)) return [3 /*break*/, 8];
                        item = lineItems_2[_i];
                        itemId = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_1.invoiceItems).values({
                                id: itemId,
                                invoiceId: id,
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
                        _k.sent();
                        _k.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 5];
                    case 8: return [4 /*yield*/, db.insert(schema_1.activityLog).values({
                            id: uuid_1.v4(),
                            userId: ctx.user.id,
                            action: "invoice_updated",
                            entityType: "invoice",
                            entityId: id,
                            description: "Updated invoice: " + (data.invoiceNumber || id)
                        })];
                    case 9:
                        _k.sent();
                        if (!(newStatus && oldStatus !== newStatus)) return [3 /*break*/, 25];
                        invoiceNumber = ((_f = currentInvoice[0]) === null || _f === void 0 ? void 0 : _f.invoiceNumber) || id;
                        if (!(newStatus === "paid")) return [3 /*break*/, 15];
                        return [4 /*yield*/, sendInvoiceNotification(db, ctx.user.id, "paid", invoiceNumber, id)];
                    case 10:
                        _k.sent();
                        // SSE: broadcast payment received
                        if (ctx.user.organizationId) {
                            sse_1.notifyOrg(ctx.user.organizationId, {
                                id: "invoice-paid-" + id + "-" + Date.now(),
                                type: "invoice_paid",
                                title: "Payment Received",
                                body: "Invoice " + invoiceNumber + " has been marked as paid",
                                href: "/org/" + (ctx.user.organizationSlug || '') + "/invoices",
                                timestamp: new Date().toISOString()
                            });
                        }
                        _k.label = 11;
                    case 11:
                        _k.trys.push([11, 13, , 14]);
                        return [4 /*yield*/, triggerEngine_1.workflowTriggerEngine.trigger({
                                triggerType: "invoice_paid",
                                entityType: "invoice",
                                entityId: id,
                                data: { invoiceId: id, invoiceNumber: invoiceNumber },
                                userId: ctx.user.id
                            })];
                    case 12:
                        _k.sent();
                        return [3 /*break*/, 14];
                    case 13:
                        err_5 = _k.sent();
                        console.error("Workflow trigger (invoice_paid) failed:", err_5);
                        return [3 /*break*/, 14];
                    case 14: return [3 /*break*/, 24];
                    case 15:
                        if (!(newStatus === "sent")) return [3 /*break*/, 22];
                        return [4 /*yield*/, sendInvoiceNotification(db, ctx.user.id, "sent", invoiceNumber, id)];
                    case 16:
                        _k.sent();
                        _k.label = 17;
                    case 17:
                        _k.trys.push([17, 20, , 21]);
                        dueDate = ((_g = currentInvoice[0]) === null || _g === void 0 ? void 0 : _g.dueDate) ? new Date(currentInvoice[0].dueDate).toLocaleDateString() : 'Not set';
                        _b = emailNotifications_1.triggerEventNotification;
                        _c = {
                            userId: ctx.user.id,
                            eventType: "invoice_sent",
                            recipientEmail: "client@example.com",
                            recipientName: "Client"
                        };
                        _d = "Invoice " + invoiceNumber + " from ";
                        return [4 /*yield*/, company_info_1.getCompanyInfo()];
                    case 18: return [4 /*yield*/, _b.apply(void 0, [(_c.subject = _d + (_k.sent()).name,
                                _c.htmlContent = "\n                <h2>Invoice Sent</h2>\n                <p>Invoice <strong>" + invoiceNumber + "</strong> has been sent.</p>\n                <ul>\n                  <li><strong>Amount:</strong> Ksh " + ((((_h = currentInvoice[0]) === null || _h === void 0 ? void 0 : _h.total) / 100).toLocaleString("en-KE") || "N/A") + "</li>\n                  <li><strong>Due Date:</strong> " + dueDate + "</li>\n                </ul>\n                <p><a href=\"/invoices/" + id + "\">View Invoice</a></p>\n              ",
                                _c.entityType = "invoice",
                                _c.entityId = id,
                                _c.actionUrl = "/invoices/" + id,
                                _c)])];
                    case 19:
                        _k.sent();
                        return [3 /*break*/, 21];
                    case 20:
                        err_6 = _k.sent();
                        console.error("Failed to send invoice sent email:", err_6);
                        return [3 /*break*/, 21];
                    case 21: return [3 /*break*/, 24];
                    case 22:
                        if (!(newStatus === "approved")) return [3 /*break*/, 24];
                        return [4 /*yield*/, sendInvoiceNotification(db, ctx.user.id, "approved", invoiceNumber, id)];
                    case 23:
                        _k.sent();
                        _k.label = 24;
                    case 24: return [3 /*break*/, 27];
                    case 25:
                        if (!!oldStatus) return [3 /*break*/, 27];
                        // Regular update notification
                        return [4 /*yield*/, sendInvoiceNotification(db, ctx.user.id, "updated", ((_j = currentInvoice[0]) === null || _j === void 0 ? void 0 : _j.invoiceNumber) || id, id)];
                    case 26:
                        // Regular update notification
                        _k.sent();
                        _k.label = 27;
                    case 27: return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    "delete": deleteProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, invoice, now;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        return [4 /*yield*/, db.select({ organizationId: schema_1.invoices.organizationId }).from(schema_1.invoices).where(drizzle_orm_1.eq(schema_1.invoices.id, input)).limit(1)];
                    case 2:
                        invoice = _b.sent();
                        if (!invoice.length)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
                        orgIsolation_1.verifyOrgOwnership(ctx, invoice[0].organizationId);
                        // Delete line items first
                        return [4 /*yield*/, db["delete"](schema_1.invoiceItems).where(drizzle_orm_1.eq(schema_1.invoiceItems.invoiceId, input))];
                    case 3:
                        // Delete line items first
                        _b.sent();
                        // Delete invoice
                        return [4 /*yield*/, db["delete"](schema_1.invoices).where(drizzle_orm_1.eq(schema_1.invoices.id, input))];
                    case 4:
                        // Delete invoice
                        _b.sent();
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, db.insert(schema_1.activityLog).values({
                                id: uuid_1.v4(),
                                userId: ctx.user.id,
                                action: "invoice_deleted",
                                entityType: "invoice",
                                entityId: input,
                                description: "Deleted invoice: " + input,
                                createdAt: now
                            })];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    bulkDelete: deleteProcedure
        .input(zod_1.z.array(zod_1.z.string()).min(1))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, invoiceRecords, _i, invoiceRecords_1, invoice, verifiedIds;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        return [4 /*yield*/, db.select({ id: schema_1.invoices.id, organizationId: schema_1.invoices.organizationId }).from(schema_1.invoices).where(drizzle_orm_1.inArray(schema_1.invoices.id, input))];
                    case 2:
                        invoiceRecords = _b.sent();
                        for (_i = 0, invoiceRecords_1 = invoiceRecords; _i < invoiceRecords_1.length; _i++) {
                            invoice = invoiceRecords_1[_i];
                            orgIsolation_1.verifyOrgOwnership(ctx, invoice.organizationId);
                        }
                        verifiedIds = invoiceRecords.map(function (i) { return i.id; });
                        // Delete line items for all selected invoices first
                        return [4 /*yield*/, db["delete"](schema_1.invoiceItems).where(drizzle_orm_1.inArray(schema_1.invoiceItems.invoiceId, verifiedIds))];
                    case 3:
                        // Delete line items for all selected invoices first
                        _b.sent();
                        return [4 /*yield*/, db["delete"](schema_1.invoices).where(drizzle_orm_1.inArray(schema_1.invoices.id, verifiedIds))];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, { success: true, count: verifiedIds.length }];
                }
            });
        });
    }),
    byStatus: viewProcedure
        .input(zod_1.z.object({ status: zod_1.z.string() }))
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
                        return [4 /*yield*/, db.select().from(schema_1.invoices).where(drizzle_orm_1.eq(schema_1.invoices.status, input.status))];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    }),
    // Client-facing alias used by legacy client code
    getClientInvoices: viewProcedure
        .input(zod_1.z.object({ clientId: zod_1.z.string().optional() }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, clientId, result;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        clientId = (input === null || input === void 0 ? void 0 : input.clientId) || ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.clientId) || ctx.user.id;
                        return [4 /*yield*/, db.select().from(schema_1.invoices).where(drizzle_orm_1.eq(schema_1.invoices.clientId, clientId))];
                    case 2:
                        result = _c.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    }),
    // Get line items for an invoice
    getLineItems: viewProcedure
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
                        return [4 /*yield*/, db.select().from(schema_1.invoiceItems).where(drizzle_orm_1.eq(schema_1.invoiceItems.invoiceId, input))];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    }),
    listAdvanced: viewProcedure
        .input(advancedFilterSchema.optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, filters, orgId, today, where, limit, offset, orderByField, orderByDirection, rows, countRes, total, hasMore;
            var _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _f.sent();
                        if (!db)
                            return [2 /*return*/, { invoices: [], total: 0, hasMore: false }];
                        filters = [];
                        orgId = ctx.user.organizationId;
                        if (orgId)
                            filters.push(drizzle_orm_1.eq(schema_1.invoices.organizationId, orgId));
                        if (input === null || input === void 0 ? void 0 : input.search) {
                            filters.push(drizzle_orm_1.or(drizzle_orm_1.like(schema_1.invoices.invoiceNumber, "%" + input.search + "%"), drizzle_orm_1.like(schema_1.invoices.notes, "%" + input.search + "%"), drizzle_orm_1.like(schema_1.invoices.title, "%" + input.search + "%")));
                        }
                        if (input === null || input === void 0 ? void 0 : input.status) {
                            filters.push(drizzle_orm_1.eq(schema_1.invoices.status, input.status));
                        }
                        if ((input === null || input === void 0 ? void 0 : input.startDate) && (input === null || input === void 0 ? void 0 : input.endDate)) {
                            filters.push(drizzle_orm_1.between(schema_1.invoices.issueDate, input.startDate, input.endDate));
                        }
                        else if (input === null || input === void 0 ? void 0 : input.startDate) {
                            filters.push(gte(schema_1.invoices.issueDate, input.startDate));
                        }
                        else if (input === null || input === void 0 ? void 0 : input.endDate) {
                            filters.push(lte(schema_1.invoices.issueDate, input.endDate));
                        }
                        if ((input === null || input === void 0 ? void 0 : input.minAmount) !== undefined && (input === null || input === void 0 ? void 0 : input.maxAmount) !== undefined) {
                            filters.push(drizzle_orm_1.between(schema_1.invoices.total, input.minAmount, input.maxAmount));
                        }
                        else if ((input === null || input === void 0 ? void 0 : input.minAmount) !== undefined) {
                            filters.push(gte(schema_1.invoices.total, input.minAmount));
                        }
                        else if ((input === null || input === void 0 ? void 0 : input.maxAmount) !== undefined) {
                            filters.push(lte(schema_1.invoices.total, input.maxAmount));
                        }
                        if ((input === null || input === void 0 ? void 0 : input.clientIds) && input.clientIds.length > 0) {
                            filters.push(drizzle_orm_1.or.apply(void 0, input.clientIds.map(function (id) { return drizzle_orm_1.eq(schema_1.invoices.clientId, id); })));
                        }
                        if ((input === null || input === void 0 ? void 0 : input.isPaid) !== undefined) {
                            if (input.isPaid) {
                                filters.push(drizzle_orm_1.eq(schema_1.invoices.status, "paid"));
                            }
                            else {
                                filters.push(drizzle_orm_1.or(drizzle_orm_1.eq(schema_1.invoices.status, "draft"), drizzle_orm_1.eq(schema_1.invoices.status, "sent"), drizzle_orm_1.eq(schema_1.invoices.status, "partial"), drizzle_orm_1.eq(schema_1.invoices.status, "overdue")));
                            }
                        }
                        if (input === null || input === void 0 ? void 0 : input.isOverdue) {
                            today = new Date().toISOString().split("T")[0];
                            filters.push(drizzle_orm_1.and(lte(schema_1.invoices.dueDate, today), drizzle_orm_1.or(drizzle_orm_1.eq(schema_1.invoices.status, "sent"), drizzle_orm_1.eq(schema_1.invoices.status, "partial"), drizzle_orm_1.eq(schema_1.invoices.status, "overdue"))));
                        }
                        where = filters.length > 0 ? drizzle_orm_1.and.apply(void 0, filters) : undefined;
                        limit = (_b = input === null || input === void 0 ? void 0 : input.limit) !== null && _b !== void 0 ? _b : 50;
                        offset = (_c = input === null || input === void 0 ? void 0 : input.offset) !== null && _c !== void 0 ? _c : 0;
                        orderByField = (input === null || input === void 0 ? void 0 : input.sortBy) || "issueDate";
                        orderByDirection = (input === null || input === void 0 ? void 0 : input.sortOrder) === "asc" ? drizzle_orm_1.asc : drizzle_orm_1.desc;
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.invoices)
                                .where(where)
                                .orderBy(orderByDirection((_d = schema_1.invoices[orderByField]) !== null && _d !== void 0 ? _d : schema_1.invoices.issueDate))
                                .limit(limit)
                                .offset(offset)];
                    case 2:
                        rows = _f.sent();
                        return [4 /*yield*/, db
                                .select({ count: drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["COUNT(*)"], ["COUNT(*)"]))) })
                                .from(schema_1.invoices)
                                .where(where)];
                    case 3:
                        countRes = (_f.sent())[0];
                        total = Number((_e = countRes === null || countRes === void 0 ? void 0 : countRes.count) !== null && _e !== void 0 ? _e : rows.length);
                        hasMore = offset + limit < total;
                        return [2 /*return*/, {
                                invoices: rows,
                                total: total,
                                hasMore: hasMore,
                                limit: limit,
                                offset: offset,
                                pageCount: Math.ceil(total / limit)
                            }];
                }
            });
        });
    }),
    getAgingAnalysis: viewProcedure
        .input(zod_1.z.object({ includeDetails: zod_1.z.boolean().optional() }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, unpaidConditions, unpaidInvoices, aging, _i, unpaidInvoices_1, invoice, daysOverdue, category, outstandingAmount;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { summary: {}, details: [] }];
                        orgId = ctx.user.organizationId;
                        unpaidConditions = [
                            drizzle_orm_1.or(drizzle_orm_1.eq(schema_1.invoices.status, "sent"), drizzle_orm_1.eq(schema_1.invoices.status, "partial"), drizzle_orm_1.eq(schema_1.invoices.status, "overdue")),
                        ];
                        if (orgId) {
                            unpaidConditions.unshift(drizzle_orm_1.eq(schema_1.invoices.organizationId, orgId));
                        }
                        return [4 /*yield*/, db.select().from(schema_1.invoices).where(drizzle_orm_1.and.apply(void 0, unpaidConditions))];
                    case 2:
                        unpaidInvoices = _b.sent();
                        aging = {
                            current: { count: 0, total: 0, invoices: [] },
                            "30days": { count: 0, total: 0, invoices: [] },
                            "60days": { count: 0, total: 0, invoices: [] },
                            "90days": { count: 0, total: 0, invoices: [] },
                            over90days: { count: 0, total: 0, invoices: [] }
                        };
                        for (_i = 0, unpaidInvoices_1 = unpaidInvoices; _i < unpaidInvoices_1.length; _i++) {
                            invoice = unpaidInvoices_1[_i];
                            daysOverdue = calculateDaysOverdue(invoice.dueDate);
                            category = getAgingCategory(daysOverdue);
                            outstandingAmount = (invoice.total || 0) - (invoice.paidAmount || 0);
                            aging[category].count++;
                            aging[category].total += outstandingAmount;
                            if (input === null || input === void 0 ? void 0 : input.includeDetails) {
                                aging[category].invoices.push({
                                    id: invoice.id,
                                    invoiceNumber: invoice.invoiceNumber,
                                    dueDate: invoice.dueDate,
                                    daysOverdue: daysOverdue,
                                    total: invoice.total,
                                    paidAmount: invoice.paidAmount,
                                    outstandingAmount: outstandingAmount,
                                    clientId: invoice.clientId
                                });
                            }
                        }
                        return [2 /*return*/, {
                                summary: {
                                    totalUnpaid: unpaidInvoices.reduce(function (s, i) { return s + ((i.total || 0) - (i.paidAmount || 0)); }, 0),
                                    totalInvoices: unpaidInvoices.length,
                                    breakdown: aging
                                },
                                details: (input === null || input === void 0 ? void 0 : input.includeDetails) ? aging : undefined
                            }];
                }
            });
        });
    }),
    sendBatchReminders: approveProcedure
        .input(zod_1.z.object({
        invoiceIds: zod_1.z.array(zod_1.z.string()).min(1).max(100),
        daysBeforeDue: zod_1.z.number().optional()["default"](3),
        message: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, results, cutoffDate, _i, _b, invoiceId, invoice, error_2, successCount;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
                        results = [];
                        cutoffDate = new Date();
                        cutoffDate.setDate(cutoffDate.getDate() + input.daysBeforeDue);
                        _i = 0, _b = input.invoiceIds;
                        _c.label = 2;
                    case 2:
                        if (!(_i < _b.length)) return [3 /*break*/, 8];
                        invoiceId = _b[_i];
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 6, , 7]);
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.invoices)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.invoices.id, invoiceId), drizzle_orm_1.eq(schema_1.invoices.organizationId, ctx.user.organizationId)))
                                .limit(1)];
                    case 4:
                        invoice = (_c.sent())[0];
                        if (!invoice) {
                            results.push({ invoiceId: invoiceId, success: false, reason: "Invoice not found" });
                            return [3 /*break*/, 7];
                        }
                        if (invoice.status === "paid" || invoice.status === "cancelled") {
                            results.push({ invoiceId: invoiceId, success: false, reason: "Invoice status " + invoice.status + " - cannot send reminder" });
                            return [3 /*break*/, 7];
                        }
                        console.log("[EMAIL] Sending reminder for invoice " + invoice.invoiceNumber);
                        return [4 /*yield*/, logInvoiceActivity(db, invoiceId, "email_reminder", ctx.user.id, {
                                clientId: invoice.clientId,
                                reminderMessage: input.message,
                                dueDate: invoice.dueDate
                            })];
                    case 5:
                        _c.sent();
                        results.push({ invoiceId: invoiceId, success: true, invoiceNumber: invoice.invoiceNumber });
                        return [3 /*break*/, 7];
                    case 6:
                        error_2 = _c.sent();
                        results.push({ invoiceId: invoiceId, success: false, reason: error_2.message || String(error_2) });
                        return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 2];
                    case 8:
                        successCount = results.filter(function (r) { return r.success; }).length;
                        return [2 /*return*/, {
                                success: true,
                                sent: successCount,
                                failed: input.invoiceIds.length - successCount,
                                results: results,
                                message: "Reminders sent: " + successCount + (input.invoiceIds.length - successCount > 0 ? ", Failed: " + (input.invoiceIds.length - successCount) : "")
                            }];
                }
            });
        });
    }),
    applyPartialPayment: createProcedure
        .input(zod_1.z.object({
        invoiceId: zod_1.z.string(),
        paymentAmount: zod_1.z.number().positive(),
        paymentDate: zod_1.z.string(),
        referenceNumber: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, invoice, outstandingAmount, newPaidAmount, newStatus;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.invoices)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.invoices.id, input.invoiceId), drizzle_orm_1.eq(schema_1.invoices.organizationId, ctx.user.organizationId)))
                                .limit(1)];
                    case 2:
                        invoice = (_b.sent())[0];
                        if (!invoice) {
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
                        }
                        if (invoice.status === "paid" || invoice.status === "cancelled") {
                            throw new server_1.TRPCError({ code: "BAD_REQUEST", message: "Cannot apply payment to invoice with status: " + invoice.status });
                        }
                        outstandingAmount = (invoice.total || 0) - (invoice.paidAmount || 0);
                        if (input.paymentAmount > outstandingAmount) {
                            throw new server_1.TRPCError({ code: "BAD_REQUEST", message: "Payment amount (" + input.paymentAmount + ") exceeds outstanding amount (" + outstandingAmount + ")" });
                        }
                        newPaidAmount = (invoice.paidAmount || 0) + input.paymentAmount;
                        newStatus = newPaidAmount >= (invoice.total || 0) ? "paid" : "partial";
                        return [4 /*yield*/, db.update(schema_1.invoices).set({
                                paidAmount: newPaidAmount,
                                status: newStatus,
                                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            }).where(drizzle_orm_1.eq(schema_1.invoices.id, input.invoiceId))];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, logInvoiceActivity(db, input.invoiceId, "partial_payment", ctx.user.id, {
                                paymentAmount: input.paymentAmount,
                                totalPaid: newPaidAmount,
                                outstanding: (invoice.total || 0) - newPaidAmount,
                                referenceNumber: input.referenceNumber
                            })];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                invoiceId: input.invoiceId,
                                paymentApplied: input.paymentAmount,
                                totalPaid: newPaidAmount,
                                outstanding: (invoice.total || 0) - newPaidAmount,
                                newStatus: newStatus,
                                message: "Payment of " + input.paymentAmount + " applied successfully. Invoice status: " + newStatus
                            }];
                }
            });
        });
    }),
    markBatchAsSent: createProcedure
        .input(zod_1.z.object({ invoiceIds: zod_1.z.array(zod_1.z.string()).min(1).max(100), sentDate: zod_1.z.string().optional() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, sentDate, results, _i, _b, invoiceId, invoice, error_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
                        sentDate = input.sentDate || new Date().toISOString();
                        results = [];
                        _i = 0, _b = input.invoiceIds;
                        _c.label = 2;
                    case 2:
                        if (!(_i < _b.length)) return [3 /*break*/, 9];
                        invoiceId = _b[_i];
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 7, , 8]);
                        return [4 /*yield*/, db.select().from(schema_1.invoices).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.invoices.id, invoiceId), drizzle_orm_1.eq(schema_1.invoices.organizationId, ctx.user.organizationId))).limit(1)];
                    case 4:
                        invoice = (_c.sent())[0];
                        if (!invoice) {
                            results.push({ invoiceId: invoiceId, success: false, reason: "Invoice not found" });
                            return [3 /*break*/, 8];
                        }
                        return [4 /*yield*/, db.update(schema_1.invoices)
                                .set({ status: "sent", updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) })
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.invoices.id, invoiceId), drizzle_orm_1.eq(schema_1.invoices.organizationId, ctx.user.organizationId)))];
                    case 5:
                        _c.sent();
                        return [4 /*yield*/, logInvoiceActivity(db, invoiceId, "send", ctx.user.id, { sentDate: sentDate })];
                    case 6:
                        _c.sent();
                        results.push({ invoiceId: invoiceId, success: true, invoiceNumber: invoice.invoiceNumber });
                        return [3 /*break*/, 8];
                    case 7:
                        error_3 = _c.sent();
                        results.push({ invoiceId: invoiceId, success: false, reason: error_3.message || String(error_3) });
                        return [3 /*break*/, 8];
                    case 8:
                        _i++;
                        return [3 /*break*/, 2];
                    case 9: return [2 /*return*/, { success: true, updated: results.filter(function (r) { return r.success; }).length, failed: results.filter(function (r) { return !r.success; }).length, results: results }];
                }
            });
        });
    }),
    getExpiringInvoices: viewProcedure
        .input(zod_1.z.object({ daysThreshold: zod_1.z.number()["default"](30), includeOverdue: zod_1.z.boolean().optional()["default"](true) }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, today, threshold, filters, expiringInvoices;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { invoices: [] }];
                        orgId = ctx.user.organizationId;
                        today = new Date();
                        threshold = new Date(today.getTime() + input.daysThreshold * 24 * 60 * 60 * 1000);
                        filters = [
                            drizzle_orm_1.or(drizzle_orm_1.eq(schema_1.invoices.status, "sent"), drizzle_orm_1.eq(schema_1.invoices.status, "partial")),
                        ];
                        if (orgId)
                            filters.push(drizzle_orm_1.eq(schema_1.invoices.organizationId, orgId));
                        if (input.includeOverdue) {
                            filters.push(lte(schema_1.invoices.dueDate, threshold.toISOString().split("T")[0]));
                        }
                        else {
                            filters.push(drizzle_orm_1.between(schema_1.invoices.dueDate, today.toISOString().split("T")[0], threshold.toISOString().split("T")[0]));
                        }
                        return [4 /*yield*/, db.select().from(schema_1.invoices).where(drizzle_orm_1.and.apply(void 0, filters))];
                    case 2:
                        expiringInvoices = _b.sent();
                        return [2 /*return*/, {
                                invoices: expiringInvoices.map(function (inv) { return (__assign(__assign({}, inv), { daysUntilDue: Math.ceil((new Date(inv.dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)), outstanding: (inv.total || 0) - (inv.paidAmount || 0) })); }),
                                threshold: input.daysThreshold
                            }];
                }
            });
        });
    }),
    // Add line item to invoice
    addLineItem: createProcedure
        .input(zod_1.z.object({
        invoiceId: zod_1.z.string(),
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
            var db, id, invoiceId, itemData, now;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        id = uuid_1.v4();
                        invoiceId = input.invoiceId, itemData = __rest(input, ["invoiceId"]);
                        return [4 /*yield*/, db.insert(schema_1.invoiceItems).values(__assign({ id: id,
                                invoiceId: invoiceId }, itemData))];
                    case 2:
                        _b.sent();
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, db.insert(schema_1.activityLog).values({
                                id: uuid_1.v4(),
                                userId: ctx.user.id,
                                action: "invoice_item_added",
                                entityType: "invoiceItem",
                                entityId: id,
                                description: "Added line item to invoice: " + invoiceId,
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
    updateLineItem: createProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        invoiceId: zod_1.z.string(),
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
            var db, id, invoiceId, data, now;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        id = input.id, invoiceId = input.invoiceId, data = __rest(input, ["id", "invoiceId"]);
                        return [4 /*yield*/, db.update(schema_1.invoiceItems).set(data).where(drizzle_orm_1.eq(schema_1.invoiceItems.id, id))];
                    case 2:
                        _b.sent();
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, db.insert(schema_1.activityLog).values({
                                id: uuid_1.v4(),
                                userId: ctx.user.id,
                                action: "invoice_item_updated",
                                entityType: "invoiceItem",
                                entityId: id,
                                description: "Updated line item: " + JSON.stringify(data),
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
    deleteLineItem: deleteProcedure
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
                        return [4 /*yield*/, db["delete"](schema_1.invoiceItems).where(drizzle_orm_1.eq(schema_1.invoiceItems.id, input))];
                    case 2:
                        _b.sent();
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, db.insert(schema_1.activityLog).values({
                                id: uuid_1.v4(),
                                userId: ctx.user.id,
                                action: "invoice_item_deleted",
                                entityType: "invoiceItem",
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
    // Download invoice as PDF
    downloadPDF: viewProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pdfBuffer, db, now, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, pdf_generator_1.generateInvoicePDF(input)];
                    case 1:
                        pdfBuffer = _b.sent();
                        return [4 /*yield*/, db_1.getDb()];
                    case 2:
                        db = _b.sent();
                        if (!db) return [3 /*break*/, 4];
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, db.insert(schema_1.activityLog).values({
                                id: uuid_1.v4(),
                                userId: ctx.user.id,
                                action: "invoice_downloaded",
                                entityType: "invoice",
                                entityId: input,
                                description: "Downloaded invoice PDF",
                                createdAt: now
                            })];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4: 
                    // Return base64 encoded PDF for download
                    return [2 /*return*/, {
                            success: true,
                            data: pdfBuffer.toString('base64'),
                            fileName: "invoice-" + input + ".pdf"
                        }];
                    case 5:
                        error_4 = _b.sent();
                        throw new Error("Failed to generate invoice PDF: " + error_4);
                    case 6: return [2 /*return*/];
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
            var renderInvoiceTemplate, result, db, now, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../utils/template-renderer'); })];
                    case 1:
                        renderInvoiceTemplate = (_b.sent()).renderInvoiceTemplate;
                        return [4 /*yield*/, renderInvoiceTemplate(input.id, ctx.user.organizationId, input.templateId)];
                    case 2:
                        result = _b.sent();
                        if (!result) {
                            throw new Error('Failed to generate invoice HTML - no template found');
                        }
                        return [4 /*yield*/, db_1.getDb()];
                    case 3:
                        db = _b.sent();
                        if (!db) return [3 /*break*/, 5];
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, db.insert(schema_1.activityLog).values({
                                id: uuid_1.v4(),
                                userId: ctx.user.id,
                                action: "invoice_previewed",
                                entityType: "invoice",
                                entityId: input.id,
                                description: "Previewed invoice HTML",
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
                        error_5 = _b.sent();
                        throw new Error("Failed to generate invoice HTML: " + error_5);
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    // Payment Management
    payments: trpc_1.router({
        // List all payments for an invoice
        list: viewProcedure
            .input(zod_1.z.object({ invoiceId: zod_1.z.string() }))
            .query(function (_a) {
            var input = _a.input;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, payments, error_6;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 3, , 4]);
                            return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                return [2 /*return*/, []];
                            return [4 /*yield*/, db
                                    .select()
                                    .from(schema_extended_1.invoicePayments)
                                    .where(drizzle_orm_1.eq(schema_extended_1.invoicePayments.invoiceId, input.invoiceId))
                                    .orderBy(drizzle_orm_1.desc(schema_extended_1.invoicePayments.paymentDate))];
                        case 2:
                            payments = _b.sent();
                            return [2 /*return*/, payments];
                        case 3:
                            error_6 = _b.sent();
                            console.error("Error fetching invoice payments:", error_6);
                            return [2 /*return*/, []];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        }),
        // Record a payment for an invoice
        create: createProcedure
            .input(zod_1.z.object({
            invoiceId: zod_1.z.string(),
            paymentAmount: zod_1.z.number().positive(),
            paymentDate: zod_1.z.string().or(zod_1.z.date()),
            paymentMethod: zod_1.z["enum"](['cash', 'bank_transfer', 'check', 'mobile_money', 'credit_card', 'other']),
            reference: zod_1.z.string().optional(),
            notes: zod_1.z.string().optional(),
            receiptId: zod_1.z.string().optional(),
            accountId: zod_1.z.string().optional()
        }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, id, convertToMySQLDateTime, paymentData, err_7, invoice, totalPaid, invoiceTotal, client, remainingBalance, err_8;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                throw new Error("Database not available");
                            id = uuid_1.v4();
                            convertToMySQLDateTime = function (date) {
                                var d;
                                if (typeof date === 'string') {
                                    d = new Date(date);
                                }
                                else if (date instanceof Date) {
                                    d = date;
                                }
                                else {
                                    d = new Date();
                                }
                                return d.toISOString().replace('T', ' ').substring(0, 19);
                            };
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 4, , 5]);
                            paymentData = {
                                id: id,
                                invoiceId: input.invoiceId,
                                paymentAmount: input.paymentAmount,
                                paymentDate: typeof input.paymentDate === 'string' ? new Date(input.paymentDate) : input.paymentDate,
                                paymentMethod: input.paymentMethod,
                                recordedBy: ctx.user.id
                            };
                            // Only include optional fields if they are provided
                            if (input.reference)
                                paymentData.reference = input.reference;
                            if (input.notes)
                                paymentData.notes = input.notes;
                            if (input.receiptId)
                                paymentData.receiptId = input.receiptId;
                            return [4 /*yield*/, db.insert(schema_extended_1.invoicePayments).values(paymentData)];
                        case 3:
                            _b.sent();
                            return [3 /*break*/, 5];
                        case 4:
                            err_7 = _b.sent();
                            console.error("Error recording invoice payment:", err_7);
                            throw new Error("Failed to record payment: " + (err_7 instanceof Error ? err_7.message : "Unknown error"));
                        case 5: return [4 /*yield*/, db.select().from(schema_1.invoices).where(drizzle_orm_1.eq(schema_1.invoices.id, input.invoiceId)).limit(1)];
                        case 6:
                            invoice = _b.sent();
                            if (!(invoice.length > 0)) return [3 /*break*/, 16];
                            return [4 /*yield*/, db_1.logActivity({
                                    userId: ctx.user.id,
                                    action: "invoice_payment_recorded",
                                    entityType: "invoice",
                                    entityId: input.invoiceId,
                                    description: "Recorded payment of " + input.paymentAmount / 100 + " for invoice " + invoice[0].invoiceNumber
                                })];
                        case 7:
                            _b.sent();
                            return [4 /*yield*/, calculateInvoicePaidAmount(db, input.invoiceId)];
                        case 8:
                            totalPaid = _b.sent();
                            invoiceTotal = invoice[0].total || 0;
                            if (!(totalPaid >= invoiceTotal && invoice[0].status !== 'paid')) return [3 /*break*/, 11];
                            // Update invoice status to paid
                            return [4 /*yield*/, db.update(schema_1.invoices)
                                    .set({
                                    status: 'paid',
                                    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                                })
                                    .where(drizzle_orm_1.eq(schema_1.invoices.id, input.invoiceId))];
                        case 9:
                            // Update invoice status to paid
                            _b.sent();
                            // Send notification
                            return [4 /*yield*/, sendInvoiceNotification(db, ctx.user.id, 'paid', invoice[0].invoiceNumber, input.invoiceId)];
                        case 10:
                            // Send notification
                            _b.sent();
                            _b.label = 11;
                        case 11:
                            _b.trys.push([11, 15, , 16]);
                            return [4 /*yield*/, db.select().from(schema_1.clients).where(drizzle_orm_1.eq(schema_1.clients.id, invoice[0].clientId)).limit(1)];
                        case 12:
                            client = _b.sent();
                            if (!(client.length > 0 && client[0].email)) return [3 /*break*/, 14];
                            remainingBalance = Math.max(0, invoiceTotal - totalPaid);
                            return [4 /*yield*/, emailNotifications_1.triggerEventNotification({
                                    userId: ctx.user.id,
                                    eventType: "payment_received",
                                    recipientEmail: client[0].email,
                                    recipientName: client[0].name || "Client",
                                    subject: "Payment Receipt - Invoice " + invoice[0].invoiceNumber,
                                    htmlContent: "\n                  <h2>Payment Receipt - Invoice " + invoice[0].invoiceNumber + "</h2>\n                  <p>Dear " + client[0].name + ",</p>\n                  <p>We have received your payment. Here are the details:</p>\n                  <ul>\n                    <li><strong>Invoice Number:</strong> " + invoice[0].invoiceNumber + "</li>\n                    <li><strong>Payment Amount:</strong> Ksh " + (input.paymentAmount / 100).toLocaleString("en-KE") + "</li>\n                    <li><strong>Payment Method:</strong> " + input.paymentMethod + "</li>\n                    <li><strong>Invoice Total:</strong> Ksh " + (invoiceTotal / 100).toLocaleString("en-KE") + "</li>\n                    <li><strong>Remaining Balance:</strong> Ksh " + (remainingBalance / 100).toLocaleString("en-KE") + "</li>\n                  </ul>\n                  " + (remainingBalance === 0
                                        ? "<p style='color: green; font-weight: bold;'>Thank you! Your invoice has been settled in full.</p>"
                                        : "<p>We look forward to receiving the remaining balance of Ksh " + (remainingBalance / 100).toLocaleString("en-KE") + ".</p>") + "\n                ",
                                    entityType: "invoice",
                                    entityId: input.invoiceId,
                                    actionUrl: "/invoices/" + input.invoiceId
                                })];
                        case 13:
                            _b.sent();
                            _b.label = 14;
                        case 14: return [3 /*break*/, 16];
                        case 15:
                            err_8 = _b.sent();
                            console.warn("Failed to send payment notification:", err_8);
                            return [3 /*break*/, 16];
                        case 16: return [2 /*return*/, { success: true, id: id }];
                    }
                });
            });
        }),
        // Update a payment record
        update: createProcedure
            .input(zod_1.z.object({
            id: zod_1.z.string(),
            paymentAmount: zod_1.z.number().optional(),
            paymentDate: zod_1.z.string().or(zod_1.z.date()).optional(),
            paymentMethod: zod_1.z["enum"](['cash', 'bank_transfer', 'check', 'mobile_money', 'credit_card', 'other']).optional(),
            reference: zod_1.z.string().optional(),
            notes: zod_1.z.string().optional(),
            accountId: zod_1.z.string().optional()
        }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, convertToMySQLDateTime, updates;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                throw new Error("Database not available");
                            convertToMySQLDateTime = function (date) {
                                var d;
                                if (typeof date === 'string') {
                                    d = new Date(date);
                                }
                                else if (date instanceof Date) {
                                    d = date;
                                }
                                else {
                                    d = new Date();
                                }
                                return d.toISOString().replace('T', ' ').substring(0, 19);
                            };
                            updates = {};
                            if (input.paymentAmount !== undefined)
                                updates.paymentAmount = input.paymentAmount;
                            if (input.paymentDate !== undefined)
                                updates.paymentDate = typeof input.paymentDate === 'string' ? new Date(input.paymentDate) : input.paymentDate;
                            if (input.paymentMethod !== undefined)
                                updates.paymentMethod = input.paymentMethod;
                            if (input.reference !== undefined)
                                updates.reference = input.reference;
                            if (input.notes !== undefined)
                                updates.notes = input.notes;
                            return [4 /*yield*/, db.update(schema_extended_1.invoicePayments)
                                    .set(updates)
                                    .where(drizzle_orm_1.eq(schema_extended_1.invoicePayments.id, input.id))];
                        case 2:
                            _b.sent();
                            // Log activity
                            return [4 /*yield*/, db_1.logActivity({
                                    userId: ctx.user.id,
                                    action: "invoice_payment_updated",
                                    entityType: "invoicePayment",
                                    entityId: input.id,
                                    description: "Updated payment record"
                                })];
                        case 3:
                            // Log activity
                            _b.sent();
                            return [2 /*return*/, { success: true }];
                    }
                });
            });
        }),
        // Delete a payment record
        "delete": deleteProcedure
            .input(zod_1.z.object({ id: zod_1.z.string() }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, payment, totalPaid, invoice, newStatus;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                throw new Error("Database not available");
                            return [4 /*yield*/, db.select()
                                    .from(schema_extended_1.invoicePayments)
                                    .where(drizzle_orm_1.eq(schema_extended_1.invoicePayments.id, input.id))
                                    .limit(1)];
                        case 2:
                            payment = _b.sent();
                            if (!(payment.length > 0)) return [3 /*break*/, 8];
                            return [4 /*yield*/, db["delete"](schema_extended_1.invoicePayments)
                                    .where(drizzle_orm_1.eq(schema_extended_1.invoicePayments.id, input.id))];
                        case 3:
                            _b.sent();
                            // Log activity
                            return [4 /*yield*/, db_1.logActivity({
                                    userId: ctx.user.id,
                                    action: "invoice_payment_deleted",
                                    entityType: "invoice",
                                    entityId: payment[0].invoiceId,
                                    description: "Deleted payment record"
                                })];
                        case 4:
                            // Log activity
                            _b.sent();
                            return [4 /*yield*/, calculateInvoicePaidAmount(db, payment[0].invoiceId)];
                        case 5:
                            totalPaid = _b.sent();
                            return [4 /*yield*/, db.select().from(schema_1.invoices)
                                    .where(drizzle_orm_1.eq(schema_1.invoices.id, payment[0].invoiceId))
                                    .limit(1)];
                        case 6:
                            invoice = _b.sent();
                            if (!(invoice.length > 0 && totalPaid < (invoice[0].total || 0))) return [3 /*break*/, 8];
                            newStatus = totalPaid > 0 ? 'partial' : 'sent';
                            return [4 /*yield*/, db.update(schema_1.invoices)
                                    .set({
                                    status: newStatus,
                                    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                                })
                                    .where(drizzle_orm_1.eq(schema_1.invoices.id, payment[0].invoiceId))];
                        case 7:
                            _b.sent();
                            _b.label = 8;
                        case 8: return [2 /*return*/, { success: true }];
                    }
                });
            });
        }),
        // Get payment summary for an invoice
        getSummary: viewProcedure
            .input(zod_1.z.object({ invoiceId: zod_1.z.string() }))
            .query(function (_a) {
            var input = _a.input;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, invoice, totalPaid, invoiceTotal, remainingBalance, paymentStatus;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                return [2 /*return*/, { totalPaid: 0, invoiceTotal: 0, remainingBalance: 0, paymentStatus: 'pending' }];
                            return [4 /*yield*/, db.select().from(schema_1.invoices)
                                    .where(drizzle_orm_1.eq(schema_1.invoices.id, input.invoiceId))
                                    .limit(1)];
                        case 2:
                            invoice = _b.sent();
                            if (invoice.length === 0) {
                                return [2 /*return*/, { totalPaid: 0, invoiceTotal: 0, remainingBalance: 0, paymentStatus: 'unknown' }];
                            }
                            return [4 /*yield*/, calculateInvoicePaidAmount(db, input.invoiceId)];
                        case 3:
                            totalPaid = _b.sent();
                            invoiceTotal = invoice[0].total || 0;
                            remainingBalance = Math.max(0, invoiceTotal - totalPaid);
                            paymentStatus = 'pending';
                            if (totalPaid >= invoiceTotal) {
                                paymentStatus = 'paid';
                            }
                            else if (totalPaid > 0) {
                                paymentStatus = 'partial';
                            }
                            return [2 /*return*/, {
                                    totalPaid: totalPaid,
                                    invoiceTotal: invoiceTotal,
                                    remainingBalance: remainingBalance,
                                    paymentStatus: paymentStatus
                                }];
                    }
                });
            });
        }),
        // Get payment report for date range
        report: viewProcedure
            .input(zod_1.z.object({
            startDate: zod_1.z.string(),
            endDate: zod_1.z.string(),
            paymentMethod: zod_1.z["enum"](['cash', 'bank_transfer', 'check', 'mobile_money', 'credit_card', 'other']).optional(),
            clientId: zod_1.z.string().optional()
        }))
            .query(function (_a) {
            var input = _a.input;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, start, end, paymentsQuery, _b, gte, lte, payments, filteredPayments, enriched, _i, filteredPayments_1, payment, invoice, totalPayments, totalAmount, byMethod_1, error_7;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _c.sent();
                            if (!db)
                                return [2 /*return*/, { payments: [], summary: {} }];
                            _c.label = 2;
                        case 2:
                            _c.trys.push([2, 8, , 9]);
                            start = new Date(input.startDate).toISOString().replace('T', ' ').substring(0, 19);
                            end = new Date(input.endDate).toISOString().replace('T', ' ').substring(0, 19);
                            paymentsQuery = db
                                .select({
                                paymentId: schema_extended_1.invoicePayments.id,
                                invoiceId: schema_extended_1.invoicePayments.invoiceId,
                                paymentAmount: schema_extended_1.invoicePayments.paymentAmount,
                                paymentDate: schema_extended_1.invoicePayments.paymentDate,
                                paymentMethod: schema_extended_1.invoicePayments.paymentMethod,
                                reference: schema_extended_1.invoicePayments.reference,
                                receiptId: schema_extended_1.invoicePayments.receiptId
                            })
                                .from(schema_extended_1.invoicePayments);
                            _b = require("drizzle-orm"), gte = _b.gte, lte = _b.lte;
                            paymentsQuery = paymentsQuery.where(require("drizzle-orm").and(gte(schema_extended_1.invoicePayments.paymentDate, start), lte(schema_extended_1.invoicePayments.paymentDate, end)));
                            return [4 /*yield*/, paymentsQuery];
                        case 3:
                            payments = _c.sent();
                            filteredPayments = payments;
                            if (input.paymentMethod) {
                                filteredPayments = payments.filter(function (p) { return p.paymentMethod === input.paymentMethod; });
                            }
                            enriched = [];
                            _i = 0, filteredPayments_1 = filteredPayments;
                            _c.label = 4;
                        case 4:
                            if (!(_i < filteredPayments_1.length)) return [3 /*break*/, 7];
                            payment = filteredPayments_1[_i];
                            return [4 /*yield*/, db.select().from(schema_1.invoices)
                                    .where(drizzle_orm_1.eq(schema_1.invoices.id, payment.invoiceId))
                                    .limit(1)];
                        case 5:
                            invoice = _c.sent();
                            if (invoice.length > 0) {
                                if (!input.clientId || invoice[0].clientId === input.clientId) {
                                    enriched.push(__assign(__assign({}, payment), { invoiceNumber: invoice[0].invoiceNumber, clientId: invoice[0].clientId, invoiceTotal: invoice[0].total }));
                                }
                            }
                            _c.label = 6;
                        case 6:
                            _i++;
                            return [3 /*break*/, 4];
                        case 7:
                            totalPayments = enriched.length;
                            totalAmount = enriched.reduce(function (sum, p) { return sum + (p.paymentAmount || 0); }, 0);
                            byMethod_1 = {};
                            enriched.forEach(function (p) {
                                if (!byMethod_1[p.paymentMethod]) {
                                    byMethod_1[p.paymentMethod] = { count: 0, amount: 0 };
                                }
                                byMethod_1[p.paymentMethod].count++;
                                byMethod_1[p.paymentMethod].amount += p.paymentAmount || 0;
                            });
                            return [2 /*return*/, {
                                    payments: enriched,
                                    summary: {
                                        dateRange: { start: input.startDate, end: input.endDate },
                                        totalPayments: totalPayments,
                                        totalAmount: totalAmount,
                                        averagePayment: totalPayments > 0 ? Math.round(totalAmount / totalPayments) : 0,
                                        byMethod: Object.entries(byMethod_1).map(function (_a) {
                                            var method = _a[0], data = _a[1];
                                            return ({
                                                method: method,
                                                count: data.count,
                                                amount: data.amount
                                            });
                                        })
                                    }
                                }];
                        case 8:
                            error_7 = _c.sent();
                            console.error("Error generating payment report:", error_7);
                            return [2 /*return*/, { payments: [], summary: {} }];
                        case 9: return [2 /*return*/];
                    }
                });
            });
        }),
        // List unlinked receipts for an invoice (by client)
        availableReceipts: viewProcedure
            .input(zod_1.z.object({ invoiceId: zod_1.z.string() }))
            .query(function (_a) {
            var input = _a.input;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, invoice, receiptsTable, allReceipts, linkedReceipts, linkedIds_1, error_8;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                return [2 /*return*/, []];
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 6, , 7]);
                            return [4 /*yield*/, db.select().from(schema_1.invoices)
                                    .where(drizzle_orm_1.eq(schema_1.invoices.id, input.invoiceId))
                                    .limit(1)];
                        case 3:
                            invoice = _b.sent();
                            if (invoice.length === 0)
                                return [2 /*return*/, []];
                            receiptsTable = require("../../drizzle/schema").receipts;
                            return [4 /*yield*/, db.select().from(receiptsTable)
                                    .where(drizzle_orm_1.eq(receiptsTable.clientId, invoice[0].clientId))];
                        case 4:
                            allReceipts = _b.sent();
                            return [4 /*yield*/, db.select({
                                    receiptId: schema_extended_1.invoicePayments.receiptId
                                }).from(schema_extended_1.invoicePayments)
                                    .where(require("drizzle-orm").ne(schema_extended_1.invoicePayments.receiptId, null))];
                        case 5:
                            linkedReceipts = _b.sent();
                            linkedIds_1 = new Set(linkedReceipts.map(function (r) { return r.receiptId; }));
                            // Return unlinked receipts
                            return [2 /*return*/, allReceipts.filter(function (r) { return !linkedIds_1.has(r.id); })];
                        case 6:
                            error_8 = _b.sent();
                            console.error("Error fetching available receipts:", error_8);
                            return [2 /*return*/, []];
                        case 7: return [2 /*return*/];
                    }
                });
            });
        }),
        // Get overdue invoices with payment status
        getOverdue: viewProcedure
            .query(function () { return __awaiter(void 0, void 0, void 0, function () {
            var db, now_1, overdueInvoices, result, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _a.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        now_1 = new Date();
                        return [4 /*yield*/, db.select({
                                id: schema_1.invoices.id,
                                invoiceNumber: schema_1.invoices.invoiceNumber,
                                clientId: schema_1.invoices.clientId,
                                dueDate: schema_1.invoices.dueDate,
                                total: schema_1.invoices.total,
                                paidAmount: schema_1.invoices.paidAmount,
                                status: schema_1.invoices.status,
                                client: schema_1.clients
                            })
                                .from(schema_1.invoices)
                                .innerJoin(schema_1.clients, drizzle_orm_1.eq(schema_1.invoices.clientId, schema_1.clients.id))
                                .where(drizzle_orm_1.and(drizzle_orm_1.lt(schema_1.invoices.dueDate, now_1.toISOString().replace('T', ' ').substring(0, 19)), drizzle_orm_1.ne(schema_1.invoices.status, 'paid'), drizzle_orm_1.ne(schema_1.invoices.status, 'cancelled')))];
                    case 3:
                        overdueInvoices = _a.sent();
                        result = overdueInvoices.map(function (inv) {
                            var paid = inv.paidAmount || 0;
                            var remaining = (inv.total || 0) - paid;
                            var daysOverdue = Math.floor((now_1.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24));
                            return __assign(__assign({}, inv), { paidAmount: paid, remainingAmount: remaining, daysOverdue: daysOverdue });
                        });
                        return [2 /*return*/, result.filter(function (inv) { return inv.remainingAmount > 0; })
                                .sort(function (a, b) { return b.daysOverdue - a.daysOverdue; })];
                    case 4:
                        error_9 = _a.sent();
                        console.error("Error fetching overdue invoices:", error_9);
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        }); }),
        // Send payment reminder to client
        sendReminder: createProcedure
            .input(zod_1.z.object({
            invoiceId: zod_1.z.string(),
            reminderType: zod_1.z["enum"](['first', 'second', 'final'])["default"]('first')
        }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, invoice, inv, paid, remaining, error_10;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _c.sent();
                            if (!db)
                                throw new Error("Database not available");
                            _c.label = 2;
                        case 2:
                            _c.trys.push([2, 7, , 8]);
                            return [4 /*yield*/, db.select({
                                    id: schema_1.invoices.id,
                                    invoiceNumber: schema_1.invoices.invoiceNumber,
                                    total: schema_1.invoices.total,
                                    dueDate: schema_1.invoices.dueDate,
                                    clientId: schema_1.invoices.clientId,
                                    client: schema_1.clients
                                })
                                    .from(schema_1.invoices)
                                    .innerJoin(schema_1.clients, drizzle_orm_1.eq(schema_1.invoices.clientId, schema_1.clients.id))
                                    .where(drizzle_orm_1.eq(schema_1.invoices.id, input.invoiceId))
                                    .limit(1)];
                        case 3:
                            invoice = _c.sent();
                            if (!invoice || invoice.length === 0) {
                                throw new Error("Invoice not found");
                            }
                            inv = invoice[0];
                            return [4 /*yield*/, calculateInvoicePaidAmount(db, inv.id)];
                        case 4:
                            paid = _c.sent();
                            remaining = (inv.total || 0) - paid;
                            // Log reminder activity
                            return [4 /*yield*/, db_1.logActivity({
                                    userId: ctx.user.id,
                                    action: 'payment_reminder_sent',
                                    entityType: 'invoice',
                                    entityId: inv.id,
                                    details: {
                                        reminderType: input.reminderType,
                                        invoiceNumber: inv.invoiceNumber,
                                        remainingAmount: remaining
                                    }
                                })];
                        case 5:
                            // Log reminder activity
                            _c.sent();
                            // Trigger email notification
                            return [4 /*yield*/, emailNotifications_1.triggerEventNotification(db, {
                                    event: 'payment_reminder_sent',
                                    clientId: inv.clientId,
                                    invoiceId: inv.id,
                                    invoiceNumber: inv.invoiceNumber,
                                    reminderType: input.reminderType,
                                    remainingAmount: remaining,
                                    dueDate: inv.dueDate
                                })];
                        case 6:
                            // Trigger email notification
                            _c.sent();
                            return [2 /*return*/, {
                                    success: true,
                                    message: input.reminderType.charAt(0).toUpperCase() + input.reminderType.slice(1) + " reminder sent to " + (((_b = inv.client) === null || _b === void 0 ? void 0 : _b.name) || 'client')
                                }];
                        case 7:
                            error_10 = _c.sent();
                            console.error("Error sending payment reminder:", error_10);
                            throw error_10;
                        case 8: return [2 /*return*/];
                    }
                });
            });
        }),
        // Get invoices that need a reminder
        getRemindersNeeded: viewProcedure
            .query(function () { return __awaiter(void 0, void 0, void 0, function () {
            var db, now, sevenDaysAgo, fourteenDaysAgo, thirtyDaysAgo, _a, sql_1, ne_1, overdueInvoices, remindersNeeded, _i, overdueInvoices_1, inv, paid, daysOverdue, error_11;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 8, , 9]);
                        now = new Date();
                        sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
                        thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        _a = require("drizzle-orm"), sql_1 = _a.sql, ne_1 = _a.ne;
                        return [4 /*yield*/, db.select({
                                id: schema_1.invoices.id,
                                invoiceNumber: schema_1.invoices.invoiceNumber,
                                dueDate: schema_1.invoices.dueDate,
                                total: schema_1.invoices.total,
                                clientId: schema_1.invoices.clientId
                            })
                                .from(schema_1.invoices)
                                .where(require("drizzle-orm").and(require("drizzle-orm").lt(schema_1.invoices.dueDate, now.toISOString().replace('T', ' ').substring(0, 19)), ne_1(schema_1.invoices.status, 'paid')))];
                    case 3:
                        overdueInvoices = _b.sent();
                        remindersNeeded = [];
                        _i = 0, overdueInvoices_1 = overdueInvoices;
                        _b.label = 4;
                    case 4:
                        if (!(_i < overdueInvoices_1.length)) return [3 /*break*/, 7];
                        inv = overdueInvoices_1[_i];
                        return [4 /*yield*/, calculateInvoicePaidAmount(db, inv.id)];
                    case 5:
                        paid = _b.sent();
                        if (paid >= (inv.total || 0))
                            return [3 /*break*/, 6]; // Skip fully paid
                        daysOverdue = Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24));
                        // Check if first reminder should be sent (7+ days overdue)
                        if (daysOverdue >= 7) {
                            remindersNeeded.push({
                                invoiceId: inv.id,
                                invoiceNumber: inv.invoiceNumber,
                                daysOverdue: daysOverdue,
                                reminderType: daysOverdue >= 30 ? 'final' : (daysOverdue >= 14 ? 'second' : 'first')
                            });
                        }
                        _b.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7: return [2 /*return*/, remindersNeeded];
                    case 8:
                        error_11 = _b.sent();
                        console.error("Error getting reminders needed:", error_11);
                        return [2 /*return*/, []];
                    case 9: return [2 /*return*/];
                }
            });
        }); }),
        // Create recurring invoice + subscription
        createRecurring: createProcedure
            .input(zod_1.z.object({
            clientId: zod_1.z.string(),
            templateInvoiceId: zod_1.z.string().optional(),
            frequency: zod_1.z["enum"](["weekly", "biweekly", "monthly", "quarterly", "annually"]),
            startDate: zod_1.z.string(),
            endDate: zod_1.z.string().optional(),
            description: zod_1.z.string().optional(),
            noteToInvoice: zod_1.z.string().optional()
        }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, _b, recurringInvoices, invoices_1, clientSubscriptions_1, recurringId, subscriptionId, now, orgId, startDate, nextDueDate, frequencyDays, invoiceTotal, invoiceTitle, inv, recurringValues, error_12;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _c.sent();
                            if (!db)
                                throw new Error("Database not available");
                            _c.label = 2;
                        case 2:
                            _c.trys.push([2, 11, , 12]);
                            return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema"); })];
                        case 3:
                            _b = _c.sent(), recurringInvoices = _b.recurringInvoices, invoices_1 = _b.invoices, clientSubscriptions_1 = _b.clientSubscriptions;
                            recurringId = uuid_1.v4();
                            subscriptionId = uuid_1.v4();
                            now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                            orgId = ctx.user.organizationId || null;
                            startDate = new Date(input.startDate);
                            nextDueDate = new Date(startDate);
                            frequencyDays = {
                                weekly: 7,
                                biweekly: 14,
                                monthly: 30,
                                quarterly: 90,
                                annually: 365
                            };
                            nextDueDate.setDate(nextDueDate.getDate() + frequencyDays[input.frequency]);
                            invoiceTotal = 0;
                            invoiceTitle = "Auto-Recurring Invoice";
                            if (!input.templateInvoiceId) return [3 /*break*/, 5];
                            return [4 /*yield*/, db.select({ total: invoices_1.total, title: invoices_1.title })
                                    .from(invoices_1)
                                    .where(drizzle_orm_1.eq(invoices_1.id, input.templateInvoiceId))
                                    .limit(1)];
                        case 4:
                            inv = (_c.sent())[0];
                            if (inv) {
                                invoiceTotal = inv.total || 0;
                                invoiceTitle = inv.title || invoiceTitle;
                            }
                            _c.label = 5;
                        case 5:
                            recurringValues = {
                                id: recurringId,
                                organizationId: orgId,
                                clientId: input.clientId,
                                templateInvoiceId: input.templateInvoiceId || null,
                                clientSubscriptionId: subscriptionId,
                                frequency: input.frequency,
                                startDate: startDate.toISOString().replace('T', ' ').substring(0, 19),
                                endDate: input.endDate ? new Date(input.endDate).toISOString().replace('T', ' ').substring(0, 19) : null,
                                nextDueDate: nextDueDate.toISOString().replace('T', ' ').substring(0, 19),
                                lastGeneratedDate: null,
                                isActive: 1,
                                description: input.description || null,
                                noteToInvoice: input.noteToInvoice || null,
                                createdBy: ctx.user.id,
                                createdAt: now,
                                updatedAt: now
                            };
                            return [4 /*yield*/, db.insert(recurringInvoices).values(recurringValues)];
                        case 6:
                            _c.sent();
                            // 2. Create a client subscription
                            return [4 /*yield*/, db.insert(clientSubscriptions_1).values({
                                    id: subscriptionId,
                                    organizationId: orgId,
                                    clientId: input.clientId,
                                    name: invoiceTitle,
                                    description: input.description || "Auto-recurring subscription for " + invoiceTitle,
                                    status: 'active',
                                    frequency: input.frequency,
                                    amount: invoiceTotal,
                                    startDate: startDate.toISOString().replace('T', ' ').substring(0, 19),
                                    endDate: input.endDate ? new Date(input.endDate).toISOString().replace('T', ' ').substring(0, 19) : null,
                                    nextBillingDate: nextDueDate.toISOString().replace('T', ' ').substring(0, 19),
                                    templateInvoiceId: input.templateInvoiceId || null,
                                    recurringInvoiceId: recurringId,
                                    autoSendInvoice: 1,
                                    totalBilled: 0,
                                    invoiceCount: 0,
                                    createdBy: ctx.user.id,
                                    createdAt: now,
                                    updatedAt: now
                                })];
                        case 7:
                            // 2. Create a client subscription
                            _c.sent();
                            if (!input.templateInvoiceId) return [3 /*break*/, 9];
                            return [4 /*yield*/, db.update(invoices_1)
                                    .set({
                                    isAutoRecurring: 1,
                                    recurringInvoiceId: recurringId,
                                    clientSubscriptionId: subscriptionId
                                })
                                    .where(drizzle_orm_1.eq(invoices_1.id, input.templateInvoiceId))];
                        case 8:
                            _c.sent();
                            _c.label = 9;
                        case 9: 
                        // Log activity
                        return [4 /*yield*/, db.insert(schema_1.activityLog).values({
                                id: uuid_1.v4(),
                                userId: ctx.user.id,
                                action: "recurring_invoice_created",
                                entityType: "recurring_invoice",
                                entityId: recurringId,
                                description: "Created recurring invoice with frequency: " + input.frequency + " and subscription " + subscriptionId
                            })];
                        case 10:
                            // Log activity
                            _c.sent();
                            return [2 /*return*/, {
                                    id: recurringId,
                                    subscriptionId: subscriptionId,
                                    success: true,
                                    message: "Recurring invoice and subscription created successfully"
                                }];
                        case 11:
                            error_12 = _c.sent();
                            console.error("Error creating recurring invoice:", error_12);
                            throw new Error("Failed to create recurring invoice");
                        case 12: return [2 /*return*/];
                    }
                });
            });
        }),
        // Get recurring invoices
        getRecurring: viewProcedure
            .input(zod_1.z.object({
            clientId: zod_1.z.string().optional(),
            isActive: zod_1.z.boolean().optional()
        }).optional())
            .query(function (_a) {
            var input = _a.input;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, recurringInvoices, eq_1, query, error_13;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                return [2 /*return*/, []];
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 5, , 6]);
                            return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema"); })];
                        case 3:
                            recurringInvoices = (_b.sent()).recurringInvoices;
                            eq_1 = require("drizzle-orm").eq;
                            query = db.select().from(recurringInvoices);
                            if (input === null || input === void 0 ? void 0 : input.clientId) {
                                query = query.where(eq_1(recurringInvoices.clientId, input.clientId));
                            }
                            if ((input === null || input === void 0 ? void 0 : input.isActive) !== undefined) {
                                query = query.where(eq_1(recurringInvoices.isActive, input.isActive ? 1 : 0));
                            }
                            return [4 /*yield*/, query.orderBy(recurringInvoices.createdAt)];
                        case 4: return [2 /*return*/, _b.sent()];
                        case 5:
                            error_13 = _b.sent();
                            console.error("Error fetching recurring invoices:", error_13);
                            return [2 /*return*/, []];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        }),
        // Update recurring invoice
        updateRecurring: createProcedure
            .input(zod_1.z.object({
            id: zod_1.z.string(),
            frequency: zod_1.z["enum"](["weekly", "biweekly", "monthly", "quarterly", "annually"]).optional(),
            endDate: zod_1.z.string().optional(),
            isActive: zod_1.z.boolean().optional(),
            description: zod_1.z.string().optional(),
            noteToInvoice: zod_1.z.string().optional()
        }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, recurringInvoices, eq_2, now, updates, error_14;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                throw new Error("Database not available");
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 6, , 7]);
                            return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema"); })];
                        case 3:
                            recurringInvoices = (_b.sent()).recurringInvoices;
                            eq_2 = require("drizzle-orm").eq;
                            now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                            updates = { updatedAt: now };
                            if (input.frequency)
                                updates.frequency = input.frequency;
                            if (input.endDate !== undefined)
                                updates.endDate = input.endDate ? new Date(input.endDate).toISOString().replace('T', ' ').substring(0, 19) : null;
                            if (input.isActive !== undefined)
                                updates.isActive = input.isActive ? 1 : 0;
                            if (input.description !== undefined)
                                updates.description = input.description;
                            if (input.noteToInvoice !== undefined)
                                updates.noteToInvoice = input.noteToInvoice;
                            return [4 /*yield*/, db.update(recurringInvoices).set(updates).where(eq_2(recurringInvoices.id, input.id))];
                        case 4:
                            _b.sent();
                            // Log activity
                            return [4 /*yield*/, db.insert(schema_1.activityLog).values({
                                    id: uuid_1.v4(),
                                    userId: ctx.user.id,
                                    action: "recurring_invoice_updated",
                                    entityType: "recurring_invoice",
                                    entityId: input.id,
                                    description: "Updated recurring invoice"
                                })];
                        case 5:
                            // Log activity
                            _b.sent();
                            return [2 /*return*/, { success: true, message: "Recurring invoice updated successfully" }];
                        case 6:
                            error_14 = _b.sent();
                            console.error("Error updating recurring invoice:", error_14);
                            throw new Error("Failed to update recurring invoice");
                        case 7: return [2 /*return*/];
                    }
                });
            });
        }),
        // Delete recurring invoice
        deleteRecurring: deleteProcedure
            .input(zod_1.z.object({ id: zod_1.z.string() }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, recurringInvoices, eq_3, error_15;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                throw new Error("Database not available");
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 6, , 7]);
                            return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema"); })];
                        case 3:
                            recurringInvoices = (_b.sent()).recurringInvoices;
                            eq_3 = require("drizzle-orm").eq;
                            return [4 /*yield*/, db["delete"](recurringInvoices).where(eq_3(recurringInvoices.id, input.id))];
                        case 4:
                            _b.sent();
                            // Log activity
                            return [4 /*yield*/, db.insert(schema_1.activityLog).values({
                                    id: uuid_1.v4(),
                                    userId: ctx.user.id,
                                    action: "recurring_invoice_deleted",
                                    entityType: "recurring_invoice",
                                    entityId: input.id,
                                    description: "Deleted recurring invoice"
                                })];
                        case 5:
                            // Log activity
                            _b.sent();
                            return [2 /*return*/, { success: true, message: "Recurring invoice deleted successfully" }];
                        case 6:
                            error_15 = _b.sent();
                            console.error("Error deleting recurring invoice:", error_15);
                            throw new Error("Failed to delete recurring invoice");
                        case 7: return [2 /*return*/];
                    }
                });
            });
        }),
        // Generate invoices for due recurring patterns
        generateDueRecurring: createProcedure
            .mutation(function (_a) {
            var ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, recurringInvoices, _b, eq_4, lte, isNull, and_1, now, nowStr, dueRecurring, generatedInvoices, _i, dueRecurring_1, recurring, templateData, template, newInvoiceId, newInvoiceNumber, issueDate, dueDate, dueDateStr, newInvoiceValues, invoiceItems_1, templateItems, _c, templateItems_1, item, nextDueDate, frequencyDays, error_16, error_17;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _d.sent();
                            if (!db)
                                throw new Error("Database not available");
                            _d.label = 2;
                        case 2:
                            _d.trys.push([2, 22, , 23]);
                            return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema"); })];
                        case 3:
                            recurringInvoices = (_d.sent()).recurringInvoices;
                            _b = require("drizzle-orm"), eq_4 = _b.eq, lte = _b.lte, isNull = _b.isNull, and_1 = _b.and;
                            now = new Date();
                            nowStr = now.toISOString().replace('T', ' ').substring(0, 19);
                            return [4 /*yield*/, db.select()
                                    .from(recurringInvoices)
                                    .where(and_1(eq_4(recurringInvoices.isActive, 1), lte(recurringInvoices.nextDueDate, nowStr), isNull(recurringInvoices.endDate) // Ongoing
                                ))];
                        case 4:
                            dueRecurring = _d.sent();
                            generatedInvoices = [];
                            _i = 0, dueRecurring_1 = dueRecurring;
                            _d.label = 5;
                        case 5:
                            if (!(_i < dueRecurring_1.length)) return [3 /*break*/, 21];
                            recurring = dueRecurring_1[_i];
                            _d.label = 6;
                        case 6:
                            _d.trys.push([6, 19, , 20]);
                            templateData = null;
                            if (!recurring.templateInvoiceId) return [3 /*break*/, 8];
                            return [4 /*yield*/, db.select().from(schema_1.invoices).where(eq_4(schema_1.invoices.id, recurring.templateInvoiceId)).limit(1)];
                        case 7:
                            template = _d.sent();
                            if (template.length > 0) {
                                templateData = template[0];
                            }
                            _d.label = 8;
                        case 8:
                            newInvoiceId = uuid_1.v4();
                            return [4 /*yield*/, generateNextInvoiceNumber(db)];
                        case 9:
                            newInvoiceNumber = _d.sent();
                            issueDate = now.toISOString().replace('T', ' ').substring(0, 19);
                            dueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                            dueDateStr = dueDate.toISOString().replace('T', ' ').substring(0, 19);
                            newInvoiceValues = {
                                id: newInvoiceId,
                                invoiceNumber: newInvoiceNumber,
                                invoiceSequence: parseInt(newInvoiceNumber.match(/-(\d+)$/)[1] || '0') || 0,
                                clientId: recurring.clientId,
                                title: (templateData === null || templateData === void 0 ? void 0 : templateData.title) || "Invoice for " + recurring.clientId,
                                status: "draft",
                                issueDate: issueDate,
                                dueDate: dueDateStr,
                                subtotal: (templateData === null || templateData === void 0 ? void 0 : templateData.subtotal) || 0,
                                taxAmount: (templateData === null || templateData === void 0 ? void 0 : templateData.taxAmount) || 0,
                                discountAmount: (templateData === null || templateData === void 0 ? void 0 : templateData.discountAmount) || 0,
                                total: (templateData === null || templateData === void 0 ? void 0 : templateData.total) || 0,
                                paidAmount: 0,
                                notes: recurring.noteToInvoice || (templateData === null || templateData === void 0 ? void 0 : templateData.notes) || null,
                                terms: (templateData === null || templateData === void 0 ? void 0 : templateData.terms) || null,
                                createdBy: ctx.user.id,
                                createdAt: nowStr,
                                updatedAt: nowStr
                            };
                            return [4 /*yield*/, db.insert(schema_1.invoices).values(newInvoiceValues)];
                        case 10:
                            _d.sent();
                            if (!(recurring.templateInvoiceId && templateData)) return [3 /*break*/, 16];
                            return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema"); })];
                        case 11:
                            invoiceItems_1 = (_d.sent()).invoiceItems;
                            return [4 /*yield*/, db.select().from(invoiceItems_1).where(eq_4(invoiceItems_1.invoiceId, recurring.templateInvoiceId))];
                        case 12:
                            templateItems = _d.sent();
                            _c = 0, templateItems_1 = templateItems;
                            _d.label = 13;
                        case 13:
                            if (!(_c < templateItems_1.length)) return [3 /*break*/, 16];
                            item = templateItems_1[_c];
                            return [4 /*yield*/, db.insert(invoiceItems_1).values({
                                    id: uuid_1.v4(),
                                    invoiceId: newInvoiceId,
                                    itemType: item.itemType,
                                    itemId: item.itemId,
                                    description: item.description,
                                    quantity: item.quantity,
                                    unitPrice: item.unitPrice,
                                    total: item.total,
                                    taxRate: item.taxRate,
                                    discountPercent: item.discountPercent,
                                    createdAt: nowStr
                                })];
                        case 14:
                            _d.sent();
                            _d.label = 15;
                        case 15:
                            _c++;
                            return [3 /*break*/, 13];
                        case 16:
                            generatedInvoices.push(newInvoiceId);
                            nextDueDate = new Date(new Date(recurring.nextDueDate).getTime());
                            frequencyDays = {
                                weekly: 7,
                                biweekly: 14,
                                monthly: 30,
                                quarterly: 90,
                                annually: 365
                            };
                            nextDueDate.setDate(nextDueDate.getDate() + frequencyDays[recurring.frequency]);
                            return [4 /*yield*/, db.update(recurringInvoices)
                                    .set({
                                    nextDueDate: nextDueDate.toISOString().replace('T', ' ').substring(0, 19),
                                    lastGeneratedDate: nowStr,
                                    updatedAt: nowStr
                                })
                                    .where(eq_4(recurringInvoices.id, recurring.id))];
                        case 17:
                            _d.sent();
                            // Log activity
                            return [4 /*yield*/, db.insert(schema_1.activityLog).values({
                                    id: uuid_1.v4(),
                                    userId: ctx.user.id,
                                    action: "recurring_invoice_generated",
                                    entityType: "invoice",
                                    entityId: newInvoiceId,
                                    description: "Auto-generated invoice from recurring pattern: " + newInvoiceNumber
                                })];
                        case 18:
                            // Log activity
                            _d.sent();
                            return [3 /*break*/, 20];
                        case 19:
                            error_16 = _d.sent();
                            console.error("Error generating invoice for recurring pattern " + recurring.id + ":", error_16);
                            return [3 /*break*/, 20];
                        case 20:
                            _i++;
                            return [3 /*break*/, 5];
                        case 21: return [2 /*return*/, {
                                success: true,
                                message: "Generated " + generatedInvoices.length + " invoice(s)",
                                invoiceIds: generatedInvoices
                            }];
                        case 22:
                            error_17 = _d.sent();
                            console.error("Error in generateDueRecurring:", error_17);
                            throw new Error("Failed to generate due recurring invoices");
                        case 23: return [2 /*return*/];
                    }
                });
            });
        })
    })
});
// Helper function to calculate total paid amount for an invoice
function calculateInvoicePaidAmount(db, invoiceId) {
    return __awaiter(this, void 0, Promise, function () {
        var payments, error_18;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_extended_1.invoicePayments)
                            .where(drizzle_orm_1.eq(schema_extended_1.invoicePayments.invoiceId, invoiceId))];
                case 1:
                    payments = _a.sent();
                    return [2 /*return*/, payments.reduce(function (total, payment) { return total + (payment.paymentAmount || 0); }, 0)];
                case 2:
                    error_18 = _a.sent();
                    console.error("Error calculating invoice paid amount:", error_18.message);
                    // Return 0 if table doesn't exist or query fails
                    return [2 /*return*/, 0];
                case 3: return [2 /*return*/];
            }
        });
    });
}
var templateObject_1;
