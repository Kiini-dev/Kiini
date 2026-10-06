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
exports.serviceInvoicesRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var uuid_1 = require("uuid");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var server_1 = require("@trpc/server");
var viewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:service-invoices:view");
var createProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:service-invoices:create");
var editProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:service-invoices:edit");
var deleteProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:service-invoices:delete");
function generateNextServiceInvoiceNumber(database) {
    return __awaiter(this, void 0, Promise, function () {
        var rows, maxSeq, _i, rows_1, row, match, n, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, database
                            .select({ num: schema_1.serviceInvoices.serviceInvoiceNumber })
                            .from(schema_1.serviceInvoices)
                            .orderBy(drizzle_orm_1.desc(schema_1.serviceInvoices.serviceInvoiceNumber))];
                case 1:
                    rows = _b.sent();
                    maxSeq = 0;
                    for (_i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
                        row = rows_1[_i];
                        if (row.num && row.num.startsWith("SI-")) {
                            match = row.num.match(/(\d+)$/);
                            if (match) {
                                n = parseInt(match[1]);
                                if (n > maxSeq)
                                    maxSeq = n;
                            }
                        }
                    }
                    return [2 /*return*/, "SI-" + String(maxSeq + 1).padStart(3, "0")];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, "SI-001"];
                case 3: return [2 /*return*/];
            }
        });
    });
}
var serviceItemSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    description: zod_1.z.string(),
    quantity: zod_1.z.number().positive(),
    unitPrice: zod_1.z.number().nonnegative(),
    total: zod_1.z.number().nonnegative()
});
var createServiceInvoiceSchema = zod_1.z.object({
    serviceInvoiceNumber: zod_1.z.string().optional(),
    issueDate: zod_1.z.date(),
    dueDate: zod_1.z.date(),
    clientId: zod_1.z.string(),
    clientName: zod_1.z.string(),
    serviceDescription: zod_1.z.string(),
    serviceItems: zod_1.z.array(serviceItemSchema),
    total: zod_1.z.number().nonnegative(),
    taxAmount: zod_1.z.number().nonnegative().optional(),
    notes: zod_1.z.string().optional(),
    status: zod_1.z["enum"](["draft", "sent", "accepted", "paid", "cancelled"])["default"]("draft")
});
exports.serviceInvoicesRouter = trpc_1.router({
    list: viewProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, records, _b, error_1;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _d.sent();
                        if (!db)
                            throw new Error("Database not available");
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 7, , 8]);
                        orgId = (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.organizationId;
                        if (!orgId) return [3 /*break*/, 4];
                        return [4 /*yield*/, db.select().from(schema_1.serviceInvoices).where(drizzle_orm_1.eq(schema_1.serviceInvoices.organizationId, orgId))];
                    case 3:
                        _b = _d.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, db.select().from(schema_1.serviceInvoices)];
                    case 5:
                        _b = _d.sent();
                        _d.label = 6;
                    case 6:
                        records = _b;
                        return [2 /*return*/, records || []];
                    case 7:
                        error_1 = _d.sent();
                        console.error("Error listing service invoices:", error_1);
                        throw new Error("Failed to list service invoices");
                    case 8: return [2 /*return*/];
                }
            });
        });
    }),
    get: viewProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, whereClause, records, record, items, error_2;
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
                        _c.trys.push([2, 5, , 6]);
                        orgId = (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId;
                        whereClause = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.serviceInvoices.id, input.id), drizzle_orm_1.eq(schema_1.serviceInvoices.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_1.serviceInvoices.id, input.id);
                        return [4 /*yield*/, db.select().from(schema_1.serviceInvoices).where(whereClause).limit(1)];
                    case 3:
                        records = _c.sent();
                        record = records[0] || null;
                        if (!record) {
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Service invoice not found" });
                        }
                        return [4 /*yield*/, db.select().from(schema_1.serviceInvoiceItems).where(drizzle_orm_1.eq(schema_1.serviceInvoiceItems.serviceInvoiceId, input.id))];
                    case 4:
                        items = _c.sent();
                        return [2 /*return*/, record ? __assign(__assign({}, record), { serviceItems: items }) : null];
                    case 5:
                        error_2 = _c.sent();
                        console.error("Error fetching service invoice:", error_2);
                        throw new Error("Failed to fetch service invoice");
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    create: createProcedure
        .input(createServiceInvoiceSchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id_1, serviceInvoiceNumber, _b, createdRows, created, error_3;
            var _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _f.sent();
                        if (!db)
                            throw new Error("Database not available");
                        _f.label = 2;
                    case 2:
                        _f.trys.push([2, 9, , 10]);
                        id_1 = uuid_1.v4();
                        _b = input.serviceInvoiceNumber;
                        if (_b) return [3 /*break*/, 4];
                        return [4 /*yield*/, generateNextServiceInvoiceNumber(db)];
                    case 3:
                        _b = (_f.sent());
                        _f.label = 4;
                    case 4:
                        serviceInvoiceNumber = _b;
                        return [4 /*yield*/, db.insert(schema_1.serviceInvoices).values({
                                id: id_1,
                                organizationId: ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.organizationId) || null,
                                serviceInvoiceNumber: serviceInvoiceNumber,
                                issueDate: new Date(input.issueDate).toISOString().replace('T', ' ').substring(0, 19),
                                dueDate: new Date(input.dueDate).toISOString().replace('T', ' ').substring(0, 19),
                                clientId: input.clientId,
                                clientName: input.clientName,
                                serviceDescription: input.serviceDescription,
                                total: Math.round(input.total * 100),
                                taxAmount: input.taxAmount ? Math.round(input.taxAmount * 100) : 0,
                                notes: input.notes || null,
                                status: input.status,
                                createdBy: ((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id) || ""
                            })];
                    case 5:
                        _f.sent();
                        if (!(input.serviceItems && input.serviceItems.length > 0)) return [3 /*break*/, 7];
                        return [4 /*yield*/, Promise.all(input.serviceItems.map(function (item) {
                                return db.insert(schema_1.serviceInvoiceItems).values({
                                    id: uuid_1.v4(),
                                    serviceInvoiceId: id_1,
                                    description: item.description,
                                    quantity: item.quantity,
                                    unitPrice: Math.round(item.unitPrice * 100),
                                    total: Math.round(item.total * 100)
                                });
                            }))];
                    case 6:
                        _f.sent();
                        _f.label = 7;
                    case 7: return [4 /*yield*/, db.select().from(schema_1.serviceInvoices).where(drizzle_orm_1.eq(schema_1.serviceInvoices.id, id_1)).limit(1)];
                    case 8:
                        createdRows = _f.sent();
                        created = createdRows[0] || null;
                        return [2 /*return*/, created || __assign(__assign({ id: id_1 }, input), { createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19), createdBy: (_e = ctx.user) === null || _e === void 0 ? void 0 : _e.id })];
                    case 9:
                        error_3 = _f.sent();
                        console.error("Error creating service invoice:", error_3);
                        throw new Error("Failed to create service invoice");
                    case 10: return [2 /*return*/];
                }
            });
        });
    }),
    update: editProcedure
        .input(zod_1.z.object(__assign({ id: zod_1.z.string() }, createServiceInvoiceSchema.shape)))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id_2, serviceItems, rest, orgId, whereClause, existing, updatedRows, updated, error_4;
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
                        _c.trys.push([2, 9, , 10]);
                        id_2 = input.id, serviceItems = input.serviceItems, rest = __rest(input, ["id", "serviceItems"]);
                        orgId = (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId;
                        whereClause = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.serviceInvoices.id, id_2), drizzle_orm_1.eq(schema_1.serviceInvoices.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_1.serviceInvoices.id, id_2);
                        return [4 /*yield*/, db.select().from(schema_1.serviceInvoices).where(whereClause).limit(1)];
                    case 3:
                        existing = _c.sent();
                        if (!existing.length) {
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Service invoice not found" });
                        }
                        return [4 /*yield*/, db.update(schema_1.serviceInvoices).set(__assign(__assign({}, rest), { issueDate: new Date(rest.issueDate).toISOString().replace('T', ' ').substring(0, 19), dueDate: new Date(rest.dueDate).toISOString().replace('T', ' ').substring(0, 19), total: Math.round(rest.total * 100), taxAmount: rest.taxAmount ? Math.round(rest.taxAmount * 100) : 0 })).where(whereClause)];
                    case 4:
                        _c.sent();
                        // Delete old items and insert new ones
                        return [4 /*yield*/, db["delete"](schema_1.serviceInvoiceItems).where(drizzle_orm_1.eq(schema_1.serviceInvoiceItems.serviceInvoiceId, id_2))];
                    case 5:
                        // Delete old items and insert new ones
                        _c.sent();
                        if (!(serviceItems && serviceItems.length > 0)) return [3 /*break*/, 7];
                        return [4 /*yield*/, Promise.all(serviceItems.map(function (item) {
                                return db.insert(schema_1.serviceInvoiceItems).values({
                                    id: uuid_1.v4(),
                                    serviceInvoiceId: id_2,
                                    description: item.description,
                                    quantity: item.quantity,
                                    unitPrice: Math.round(item.unitPrice * 100),
                                    total: Math.round(item.total * 100)
                                });
                            }))];
                    case 6:
                        _c.sent();
                        _c.label = 7;
                    case 7: return [4 /*yield*/, db.select().from(schema_1.serviceInvoices).where(drizzle_orm_1.eq(schema_1.serviceInvoices.id, id_2)).limit(1)];
                    case 8:
                        updatedRows = _c.sent();
                        updated = updatedRows[0] || null;
                        return [2 /*return*/, updated || __assign({ id: id_2 }, rest)];
                    case 9:
                        error_4 = _c.sent();
                        console.error("Error updating service invoice:", error_4);
                        throw new Error("Failed to update service invoice");
                    case 10: return [2 /*return*/];
                }
            });
        });
    }),
    "delete": deleteProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, whereClause, existing, error_5;
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
                        _c.trys.push([2, 6, , 7]);
                        orgId = (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId;
                        whereClause = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.serviceInvoices.id, input.id), drizzle_orm_1.eq(schema_1.serviceInvoices.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_1.serviceInvoices.id, input.id);
                        return [4 /*yield*/, db.select().from(schema_1.serviceInvoices).where(whereClause).limit(1)];
                    case 3:
                        existing = _c.sent();
                        if (!existing.length) {
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Service invoice not found" });
                        }
                        // Delete items first
                        return [4 /*yield*/, db["delete"](schema_1.serviceInvoiceItems).where(drizzle_orm_1.eq(schema_1.serviceInvoiceItems.serviceInvoiceId, input.id))];
                    case 4:
                        // Delete items first
                        _c.sent();
                        // Delete service invoice
                        return [4 /*yield*/, db["delete"](schema_1.serviceInvoices).where(whereClause)];
                    case 5:
                        // Delete service invoice
                        _c.sent();
                        return [2 /*return*/, { success: true, id: input.id }];
                    case 6:
                        error_5 = _c.sent();
                        console.error("Error deleting service invoice:", error_5);
                        throw new Error("Failed to delete service invoice");
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    getNextNumber: viewProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, number;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, { number: "SI-001" }];
                    return [4 /*yield*/, generateNextServiceInvoiceNumber(db)];
                case 2:
                    number = _a.sent();
                    return [2 /*return*/, { number: number }];
            }
        });
    }); })
});
