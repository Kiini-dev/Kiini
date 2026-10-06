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
exports.recurringInvoicesRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var schema_1 = require("../../drizzle/schema");
var db_1 = require("../db");
var drizzle_orm_1 = require("drizzle-orm");
var nanoid_1 = require("nanoid");
var server_1 = require("@trpc/server");
var recurringLabels_1 = require("../utils/recurringLabels");
// Define typed procedures
var readProcedure = trpc_1.createFeatureRestrictedProcedure("invoices:read");
var createProcedure = trpc_1.createFeatureRestrictedProcedure("invoices:create");
var updateProcedure = trpc_1.createFeatureRestrictedProcedure("invoices:update");
var deleteProcedure = trpc_1.createFeatureRestrictedProcedure("invoices:delete");
// Helper to convert ISO date to MySQL format
var toMySqlDateFormat = function (isoString) {
    try {
        // Handle both ISO strings and already-formatted strings
        if (isoString.includes('T')) {
            return isoString.split('T')[0] + ' ' + isoString.split('T')[1].substring(0, 8);
        }
        return isoString; // Already in MySQL format
    }
    catch (_a) {
        return isoString; // Passthrough if conversion fails
    }
};
var createRecurringInvoiceSchema = zod_1.z.object({
    clientId: zod_1.z.string(),
    templateInvoiceId: zod_1.z.string(),
    frequency: zod_1.z["enum"](["weekly", "biweekly", "monthly", "quarterly", "annually"]),
    startDate: zod_1.z.string().datetime(),
    endDate: zod_1.z.string().datetime().optional(),
    description: zod_1.z.string().optional(),
    noteToInvoice: zod_1.z.string().optional()
});
var updateRecurringInvoiceSchema = zod_1.z.object({
    id: zod_1.z.string(),
    frequency: zod_1.z["enum"](["weekly", "biweekly", "monthly", "quarterly", "annually"]).optional(),
    endDate: zod_1.z.string().datetime().optional(),
    isActive: zod_1.z.boolean().optional(),
    description: zod_1.z.string().optional(),
    noteToInvoice: zod_1.z.string().optional()
});
function parseIsoDateInput(value) {
    var d = new Date(value);
    if (Number.isNaN(d.getTime())) {
        throw new server_1.TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid date value"
        });
    }
    return d;
}
// Calculate next due date based on frequency
function calculateNextDueDate(currentDate, frequency) {
    var nextDate = new Date(currentDate);
    switch (frequency) {
        case "weekly":
            nextDate.setDate(nextDate.getDate() + 7);
            break;
        case "biweekly":
            nextDate.setDate(nextDate.getDate() + 14);
            break;
        case "monthly":
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
        case "quarterly":
            nextDate.setMonth(nextDate.getMonth() + 3);
            break;
        case "annually":
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
    }
    return nextDate;
}
// Generate invoice number with date suffix
function generateInvoiceNumber(baseNumber) {
    var datePart = new Date().toISOString().split("T")[0].replace(/-/g, "");
    return baseNumber + "-REC-" + datePart;
}
exports.recurringInvoicesRouter = trpc_1.router({
    create: createProcedure
        .input(createRecurringInvoiceSchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, templateInvoice, id, startDateObj, nextDueDate, mysqlStartDate, mysqlEndDate, mysqlNextDueDate, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.invoices)
                                .where(drizzle_orm_1.eq(schema_1.invoices.id, input.templateInvoiceId))
                                .limit(1)];
                    case 2:
                        templateInvoice = _b.sent();
                        if (!templateInvoice.length) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Template invoice not found"
                            });
                        }
                        id = nanoid_1.nanoid();
                        startDateObj = parseIsoDateInput(input.startDate);
                        nextDueDate = calculateNextDueDate(startDateObj, input.frequency);
                        mysqlStartDate = toMySqlDateFormat(input.startDate);
                        mysqlEndDate = input.endDate ? toMySqlDateFormat(input.endDate) : undefined;
                        mysqlNextDueDate = toMySqlDateFormat(nextDueDate.toISOString());
                        return [4 /*yield*/, db.insert(schema_1.recurringInvoices).values({
                                id: id,
                                clientId: input.clientId,
                                templateInvoiceId: input.templateInvoiceId,
                                frequency: input.frequency,
                                startDate: mysqlStartDate,
                                endDate: mysqlEndDate,
                                nextDueDate: mysqlNextDueDate,
                                lastGeneratedDate: null,
                                isActive: 1,
                                description: input.description,
                                noteToInvoice: input.noteToInvoice,
                                createdBy: ctx.user.id
                            })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { id: id, success: true }];
                    case 4:
                        error_1 = _b.sent();
                        console.error("[RECURRING_INVOICES] Create error:", error_1);
                        if (error_1 instanceof server_1.TRPCError)
                            throw error_1;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to create recurring invoice"
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    list: readProcedure
        .input(zod_1.z.object({
        clientId: zod_1.z.string().optional(),
        activeOnly: zod_1.z.boolean().optional()["default"](true)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, filters, result, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        filters = [];
                        if (input.clientId) {
                            filters.push(drizzle_orm_1.eq(schema_1.recurringInvoices.clientId, input.clientId));
                        }
                        if (input.activeOnly) {
                            filters.push(drizzle_orm_1.eq(schema_1.recurringInvoices.isActive, 1));
                        }
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.recurringInvoices)
                                .where(filters.length > 0 ? drizzle_orm_1.and.apply(void 0, filters) : undefined)
                                .orderBy(drizzle_orm_1.desc(schema_1.recurringInvoices.createdAt))];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, result];
                    case 3:
                        error_2 = _b.sent();
                        console.error("[RECURRING_INVOICES] List error:", error_2);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to fetch recurring invoices"
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    getById: readProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, result, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.recurringInvoices)
                                .where(drizzle_orm_1.eq(schema_1.recurringInvoices.id, input))
                                .limit(1)];
                    case 2:
                        result = _b.sent();
                        if (!result.length) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Recurring invoice not found"
                            });
                        }
                        return [2 /*return*/, result[0]];
                    case 3:
                        error_3 = _b.sent();
                        console.error("[RECURRING_INVOICES] GetById error:", error_3);
                        if (error_3 instanceof server_1.TRPCError)
                            throw error_3;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to fetch recurring invoice"
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    update: updateProcedure
        .input(updateRecurringInvoiceSchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, updateData, existing, updates, nextDueDate, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        id = input.id, updateData = __rest(input, ["id"]);
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.recurringInvoices)
                                .where(drizzle_orm_1.eq(schema_1.recurringInvoices.id, id))
                                .limit(1)];
                    case 2:
                        existing = _b.sent();
                        if (!existing.length) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Recurring invoice not found"
                            });
                        }
                        updates = {
                            updatedAt: toMySqlDateFormat(new Date().toISOString())
                        };
                        if (updateData.frequency) {
                            updates.frequency = updateData.frequency;
                            nextDueDate = calculateNextDueDate(new Date(existing[0].nextDueDate), updateData.frequency);
                            updates.nextDueDate = toMySqlDateFormat(nextDueDate.toISOString());
                        }
                        if (updateData.endDate !== undefined) {
                            updates.endDate = toMySqlDateFormat(updateData.endDate);
                        }
                        if (updateData.isActive !== undefined) {
                            updates.isActive = updateData.isActive ? 1 : 0;
                        }
                        if (updateData.description !== undefined) {
                            updates.description = updateData.description;
                        }
                        if (updateData.noteToInvoice !== undefined) {
                            updates.noteToInvoice = updateData.noteToInvoice;
                        }
                        return [4 /*yield*/, db
                                .update(schema_1.recurringInvoices)
                                .set(updates)
                                .where(drizzle_orm_1.eq(schema_1.recurringInvoices.id, id))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 4:
                        error_4 = _b.sent();
                        console.error("[RECURRING_INVOICES] Update error:", error_4);
                        if (error_4 instanceof server_1.TRPCError)
                            throw error_4;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to update recurring invoice"
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    toggleActive: updateProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        isActive: zod_1.z.boolean()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        return [4 /*yield*/, db
                                .update(schema_1.recurringInvoices)
                                .set({
                                isActive: input.isActive ? 1 : 0,
                                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })
                                .where(drizzle_orm_1.eq(schema_1.recurringInvoices.id, input.id))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 3:
                        error_5 = _b.sent();
                        console.error("[RECURRING_INVOICES] ToggleActive error:", error_5);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to toggle recurring invoice status"
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    "delete": deleteProcedure.input(zod_1.z.string()).mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        return [4 /*yield*/, db["delete"](schema_1.recurringInvoices)
                                .where(drizzle_orm_1.eq(schema_1.recurringInvoices.id, input))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 3:
                        error_6 = _b.sent();
                        console.error("[RECURRING_INVOICES] Delete error:", error_6);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to delete recurring invoice"
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    // Manually trigger an invoice generation from recurring template
    triggerGeneration: createProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, recurringInvoice, template, templateLineItems, newInvoiceId_1, newInvoiceNumber, now, issueDate, dueDate, _b, labeledTitle, labeledNotes, nextDueDate, error_7;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 9, , 10]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.recurringInvoices)
                                .where(drizzle_orm_1.eq(schema_1.recurringInvoices.id, input))
                                .limit(1)];
                    case 2:
                        recurringInvoice = _c.sent();
                        if (!recurringInvoice.length) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Recurring invoice not found"
                            });
                        }
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.invoices)
                                .where(drizzle_orm_1.eq(schema_1.invoices.id, recurringInvoice[0].templateInvoiceId))
                                .limit(1)];
                    case 3:
                        template = _c.sent();
                        if (!template.length) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Template invoice not found"
                            });
                        }
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.lineItems)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.lineItems.documentId, template[0].id), drizzle_orm_1.eq(schema_1.lineItems.documentType, "invoice")))];
                    case 4:
                        templateLineItems = _c.sent();
                        newInvoiceId_1 = nanoid_1.nanoid();
                        newInvoiceNumber = generateInvoiceNumber(template[0].invoiceNumber);
                        now = new Date();
                        issueDate = now.toISOString().replace('T', ' ').substring(0, 19);
                        dueDate = calculateNextDueDate(now, recurringInvoice[0].frequency).toISOString().replace('T', ' ').substring(0, 19);
                        _b = recurringLabels_1.applyRecurringLabel(template[0].title || "Recurring Invoice", template[0].notes || "", recurringInvoice[0].noteToInvoice, now), labeledTitle = _b.title, labeledNotes = _b.notes;
                        // Create new invoice from template
                        return [4 /*yield*/, db.insert(schema_1.invoices).values({
                                id: newInvoiceId_1,
                                invoiceNumber: newInvoiceNumber,
                                clientId: recurringInvoice[0].clientId,
                                recurringInvoiceId: input,
                                title: labeledTitle,
                                status: "draft",
                                issueDate: issueDate,
                                dueDate: dueDate,
                                subtotal: template[0].subtotal,
                                taxAmount: template[0].taxAmount,
                                discountAmount: template[0].discountAmount,
                                total: template[0].total,
                                paidAmount: 0,
                                createdFromRecurring: 1,
                                notes: labeledNotes,
                                terms: template[0].terms,
                                createdBy: ctx.user.id
                            })];
                    case 5:
                        // Create new invoice from template
                        _c.sent();
                        if (!(templateLineItems.length > 0)) return [3 /*break*/, 7];
                        return [4 /*yield*/, db.insert(schema_1.lineItems).values(templateLineItems.map(function (item) { return ({
                                id: nanoid_1.nanoid(),
                                documentId: newInvoiceId_1,
                                documentType: "invoice",
                                description: item.description,
                                quantity: item.quantity,
                                rate: item.rate,
                                amount: item.amount,
                                productId: item.productId,
                                serviceId: item.serviceId,
                                taxRate: item.taxRate,
                                taxAmount: item.taxAmount,
                                lineNumber: item.lineNumber,
                                createdBy: ctx.user.id
                            }); }))];
                    case 6:
                        _c.sent();
                        _c.label = 7;
                    case 7:
                        nextDueDate = calculateNextDueDate(now, recurringInvoice[0].frequency);
                        return [4 /*yield*/, db
                                .update(schema_1.recurringInvoices)
                                .set({
                                nextDueDate: nextDueDate.toISOString().replace('T', ' ').substring(0, 19),
                                lastGeneratedDate: now.toISOString().replace('T', ' ').substring(0, 19),
                                updatedAt: now.toISOString().replace('T', ' ').substring(0, 19)
                            })
                                .where(drizzle_orm_1.eq(schema_1.recurringInvoices.id, input))];
                    case 8:
                        _c.sent();
                        return [2 /*return*/, {
                                success: true,
                                invoiceId: newInvoiceId_1,
                                invoiceNumber: newInvoiceNumber
                            }];
                    case 9:
                        error_7 = _c.sent();
                        console.error("[RECURRING_INVOICES] TriggerGeneration error:", error_7);
                        if (error_7 instanceof server_1.TRPCError)
                            throw error_7;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to generate invoice from recurring template"
                        });
                    case 10: return [2 /*return*/];
                }
            });
        });
    })
});
