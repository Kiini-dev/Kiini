"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
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
exports.salesReportsRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db = require("../db");
var drizzle_orm_1 = require("drizzle-orm");
/** Format a JS Date as a MySQL-compatible datetime string */
function toMysqlDatetime(d) {
    return d.toISOString().replace("T", " ").substring(0, 19);
}
// schema imports for type-safe query building
var schema_1 = require("../../drizzle/schema");
var dateRangeSchema = zod_1.z.object({
    from: zod_1.z.date(),
    to: zod_1.z.date()
});
exports.salesReportsRouter = trpc_1.router({
    /**
     * Revenue grouped by client for the specified period
     */
    getRevenueByClient: trpc_1.createFeatureRestrictedProcedure("reporting:view")
        .input(dateRangeSchema)
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var from, to, dbInstance, fromStr, toStr, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        from = input.from, to = input.to;
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        dbInstance = _b.sent();
                        if (!dbInstance)
                            throw new Error("Database unavailable");
                        fromStr = toMysqlDatetime(from);
                        toStr = toMysqlDatetime(to);
                        return [4 /*yield*/, dbInstance
                                .select({
                                clientId: schema_1.invoices.clientId,
                                clientName: schema_1.clients.companyName,
                                total: drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["SUM(", ")"], ["SUM(", ")"])), schema_1.invoices.total)
                            })
                                .from(schema_1.invoices)
                                .leftJoin(schema_1.clients, drizzle_orm_1.sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["", " = ", ""], ["", " = ", ""])), schema_1.invoices.clientId, schema_1.clients.id))
                                .where(drizzle_orm_1.sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["", " BETWEEN ", " AND ", ""], ["", " BETWEEN ", " AND ", ""])), schema_1.invoices.createdAt, fromStr, toStr))
                                .groupBy(schema_1.invoices.clientId, schema_1.clients.companyName)
                                .orderBy(drizzle_orm_1.sql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["total DESC"], ["total DESC"]))))];
                    case 2:
                        rows = _b.sent();
                        return [2 /*return*/, rows.map(function (r) { return ({
                                clientId: r.clientId,
                                clientName: r.clientName || "Unassigned",
                                total: r.total
                            }); })];
                }
            });
        });
    }),
    /**
     * Revenue grouped by service line items for period
     */
    getRevenueByService: trpc_1.createFeatureRestrictedProcedure("reporting:view")
        .input(dateRangeSchema)
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var from, to, dbInstance, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        from = input.from, to = input.to;
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        dbInstance = _b.sent();
                        if (!dbInstance)
                            throw new Error("Database unavailable");
                        return [4 /*yield*/, dbInstance
                                .select({
                                serviceId: schema_1.invoiceItems.itemId,
                                serviceName: schema_1.services.serviceName,
                                total: drizzle_orm_1.sql(templateObject_5 || (templateObject_5 = __makeTemplateObject(["SUM(", ")"], ["SUM(", ")"])), schema_1.invoiceItems.total)
                            })
                                .from(schema_1.invoiceItems)
                                .leftJoin(schema_1.services, drizzle_orm_1.sql(templateObject_6 || (templateObject_6 = __makeTemplateObject(["", " = ", ""], ["", " = ", ""])), schema_1.invoiceItems.itemId, schema_1.services.id))
                                .leftJoin(schema_1.invoices, drizzle_orm_1.sql(templateObject_7 || (templateObject_7 = __makeTemplateObject(["", " = ", ""], ["", " = ", ""])), schema_1.invoiceItems.invoiceId, schema_1.invoices.id))
                                .where(drizzle_orm_1.and(drizzle_orm_1.sql(templateObject_8 || (templateObject_8 = __makeTemplateObject(["", " BETWEEN ", " AND ", ""], ["", " BETWEEN ", " AND ", ""])), schema_1.invoices.createdAt, toMysqlDatetime(from), toMysqlDatetime(to)), drizzle_orm_1.sql(templateObject_9 || (templateObject_9 = __makeTemplateObject(["", " = 'service'"], ["", " = 'service'"])), schema_1.invoiceItems.itemType)))
                                .groupBy(schema_1.invoiceItems.itemId, schema_1.services.serviceName)
                                .orderBy(drizzle_orm_1.sql(templateObject_10 || (templateObject_10 = __makeTemplateObject(["total DESC"], ["total DESC"]))))];
                    case 2:
                        rows = _b.sent();
                        return [2 /*return*/, rows.map(function (r) { return ({
                                serviceId: r.serviceId,
                                serviceName: r.serviceName || "Unknown",
                                total: r.total
                            }); })];
                }
            });
        });
    }),
    /**
     * Monthly sales trends (invoiced amounts)
     */
    getSalesTrends: trpc_1.createFeatureRestrictedProcedure("reporting:view")
        .input(dateRangeSchema)
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var from, to, dbInstance, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        from = input.from, to = input.to;
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        dbInstance = _b.sent();
                        if (!dbInstance)
                            throw new Error("Database unavailable");
                        return [4 /*yield*/, dbInstance
                                .select({
                                month: drizzle_orm_1.sql(templateObject_11 || (templateObject_11 = __makeTemplateObject(["DATE_FORMAT(", ", '%Y-%m')"], ["DATE_FORMAT(", ", '%Y-%m')"])), schema_1.invoices.createdAt),
                                total: drizzle_orm_1.sql(templateObject_12 || (templateObject_12 = __makeTemplateObject(["SUM(", ")"], ["SUM(", ")"])), schema_1.invoices.total)
                            })
                                .from(schema_1.invoices)
                                .where(drizzle_orm_1.sql(templateObject_13 || (templateObject_13 = __makeTemplateObject(["", " BETWEEN ", " AND ", ""], ["", " BETWEEN ", " AND ", ""])), schema_1.invoices.createdAt, toMysqlDatetime(from), toMysqlDatetime(to)))
                                .groupBy(drizzle_orm_1.sql(templateObject_14 || (templateObject_14 = __makeTemplateObject(["month"], ["month"]))))
                                .orderBy(drizzle_orm_1.sql(templateObject_15 || (templateObject_15 = __makeTemplateObject(["month"], ["month"]))))];
                    case 2:
                        rows = _b.sent();
                        return [2 /*return*/, rows.map(function (r) { return ({ month: r.month, total: r.total }); })];
                }
            });
        });
    }),
    /**
     * Simple invoice aging buckets across all overdue/sent invoices
     */
    getInvoiceAging: trpc_1.createFeatureRestrictedProcedure("reporting:view")
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var dbInstance, allInv, today, aged, _i, allInv_1, inv, daysOld, outstanding;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db.getDb()];
                case 1:
                    dbInstance = _a.sent();
                    if (!dbInstance)
                        throw new Error("Database unavailable");
                    return [4 /*yield*/, dbInstance
                            .select()
                            .from(schema_1.invoices)
                            .where(drizzle_orm_1.sql(templateObject_16 || (templateObject_16 = __makeTemplateObject(["", " IN ('sent','partial','overdue')"], ["", " IN ('sent','partial','overdue')"])), schema_1.invoices.status))];
                case 2:
                    allInv = _a.sent();
                    today = new Date();
                    aged = {
                        current: { count: 0, amount: 0 },
                        days30: { count: 0, amount: 0 },
                        days60: { count: 0, amount: 0 },
                        days90: { count: 0, amount: 0 },
                        daysOver90: { count: 0, amount: 0 }
                    };
                    for (_i = 0, allInv_1 = allInv; _i < allInv_1.length; _i++) {
                        inv = allInv_1[_i];
                        daysOld = Math.floor((today.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24));
                        outstanding = (inv.total || 0) - (inv.paidAmount || 0);
                        if (daysOld <= 0) {
                            aged.current.count++;
                            aged.current.amount += outstanding;
                        }
                        else if (daysOld <= 30) {
                            aged.days30.count++;
                            aged.days30.amount += outstanding;
                        }
                        else if (daysOld <= 60) {
                            aged.days60.count++;
                            aged.days60.amount += outstanding;
                        }
                        else if (daysOld <= 90) {
                            aged.days90.count++;
                            aged.days90.amount += outstanding;
                        }
                        else {
                            aged.daysOver90.count++;
                            aged.daysOver90.amount += outstanding;
                        }
                    }
                    return [2 /*return*/, aged];
            }
        });
    }); }),
    /**
     * Payment collection summary within range
     */
    getPaymentCollection: trpc_1.createFeatureRestrictedProcedure("reporting:view")
        .input(dateRangeSchema)
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var from, to, dbInstance, invs, totalInvoiced, totalPaid, collectionRate;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        from = input.from, to = input.to;
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        dbInstance = _b.sent();
                        if (!dbInstance)
                            throw new Error("Database unavailable");
                        return [4 /*yield*/, dbInstance
                                .select()
                                .from(schema_1.invoices)
                                .where(drizzle_orm_1.sql(templateObject_17 || (templateObject_17 = __makeTemplateObject(["", " BETWEEN ", " AND ", ""], ["", " BETWEEN ", " AND ", ""])), schema_1.invoices.createdAt, from, to))];
                    case 2:
                        invs = _b.sent();
                        totalInvoiced = invs.reduce(function (s, inv) { return s + (inv.total || 0); }, 0);
                        totalPaid = invs.reduce(function (s, inv) { return s + (inv.paidAmount || 0); }, 0);
                        collectionRate = totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 0;
                        return [2 /*return*/, { totalInvoiced: totalInvoiced, totalPaid: totalPaid, collectionRate: collectionRate }];
                }
            });
        });
    })
});
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11, templateObject_12, templateObject_13, templateObject_14, templateObject_15, templateObject_16, templateObject_17;
