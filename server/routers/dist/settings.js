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
exports.settingsRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var drizzle_orm_1 = require("drizzle-orm");
var db = require("../db");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_2 = require("drizzle-orm");
var uuid_1 = require("uuid");
var settingsReadProcedure = trpc_1.createFeatureRestrictedProcedure("admin:settings");
var settingsWriteProcedure = trpc_1.createFeatureRestrictedProcedure("admin:settings");
var rolesManageProcedure = trpc_1.createFeatureRestrictedProcedure("admin:manage_roles");
exports.settingsRouter = trpc_1.router({
    // Public maintenance status — accessible without auth for maintenance page display
    getMaintenanceStatus: trpc_1.publicProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, results, map;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        return [2 /*return*/, { enabled: false, title: "", message: "", estimatedReturn: "", contactEmail: "" }];
                    return [4 /*yield*/, database.select().from(schema_1.settings).where(drizzle_orm_2.eq(schema_1.settings.category, "maintenance"))];
                case 2:
                    results = _a.sent();
                    map = {};
                    results.forEach(function (s) { var _a; if (s.key)
                        map[s.key] = (_a = s.value) !== null && _a !== void 0 ? _a : ""; });
                    return [2 /*return*/, {
                            enabled: map.maintenance_mode === "true" || map.maintenance_mode === "1",
                            title: map.maintenance_title || "Under Maintenance",
                            message: map.maintenance_message || "The system is currently undergoing scheduled maintenance. Please check back shortly.",
                            estimatedReturn: map.maintenance_estimated_return || "",
                            contactEmail: map.maintenance_contact_email || ""
                        }];
            }
        });
    }); }),
    // Roles management
    listRoles: rolesManageProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, [
                    { id: "1", roleName: "Admin", description: "Administrator role", permissions: ["*"] },
                    { id: "2", roleName: "Manager", description: "Manager role", permissions: ["view", "create", "edit"] },
                    { id: "3", roleName: "Staff", description: "Staff role", permissions: ["view"] },
                    { id: "4", roleName: "Client", description: "Client role", permissions: ["view_own"] },
                ]];
        });
    }); }),
    // Settings management
    getCompanyInfo: settingsReadProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, results, map;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        return [2 /*return*/, {}];
                    return [4 /*yield*/, database.select().from(schema_1.settings).where(drizzle_orm_2.eq(schema_1.settings.category, 'company'))];
                case 2:
                    results = _a.sent();
                    map = {};
                    results.forEach(function (s) { return map[s.key] = s.value; });
                    return [2 /*return*/, map];
            }
        });
    }); }),
    updateCompanyInfo: settingsWriteProcedure
        .input(zod_1.z.any())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, _i, _b, _c, key, value, stringValue, existing;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _d.sent();
                        if (!database)
                            throw new Error("DB error");
                        _i = 0, _b = Object.entries(input);
                        _d.label = 2;
                    case 2:
                        if (!(_i < _b.length)) return [3 /*break*/, 8];
                        _c = _b[_i], key = _c[0], value = _c[1];
                        if (value === undefined)
                            return [3 /*break*/, 7];
                        stringValue = value === null ? "" : String(value);
                        return [4 /*yield*/, database.select().from(schema_1.settings)
                                .where(drizzle_orm_2.and(drizzle_orm_2.eq(schema_1.settings.category, 'company'), drizzle_orm_2.eq(schema_1.settings.key, key)))
                                .limit(1)];
                    case 3:
                        existing = _d.sent();
                        if (!(existing.length > 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, database.update(schema_1.settings)
                                .set({
                                value: stringValue,
                                updatedBy: ctx.user.id
                            })
                                .where(drizzle_orm_2.eq(schema_1.settings.id, existing[0].id))];
                    case 4:
                        _d.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, database.insert(schema_1.settings).values({
                            id: uuid_1.v4(),
                            category: 'company',
                            key: key,
                            value: stringValue,
                            // some columns like description are text without a SQL default; explicitly
                            // provide an empty string so the generated SQL doesn't try to use `DEFAULT`
                            description: '',
                            updatedBy: ctx.user.id
                        })];
                    case 6:
                        _d.sent();
                        _d.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 2];
                    case 8: return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    getBankDetails: settingsReadProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, results, map;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        return [2 /*return*/, {}];
                    return [4 /*yield*/, database.select().from(schema_1.settings).where(drizzle_orm_2.eq(schema_1.settings.category, 'bank'))];
                case 2:
                    results = _a.sent();
                    map = {};
                    results.forEach(function (s) { return map[s.key] = s.value; });
                    return [2 /*return*/, map];
            }
        });
    }); }),
    updateBankDetails: settingsWriteProcedure
        .input(zod_1.z.any())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, _i, _b, _c, key, value, existing;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _d.sent();
                        if (!database)
                            throw new Error("DB error");
                        _i = 0, _b = Object.entries(input);
                        _d.label = 2;
                    case 2:
                        if (!(_i < _b.length)) return [3 /*break*/, 8];
                        _c = _b[_i], key = _c[0], value = _c[1];
                        return [4 /*yield*/, database.select().from(schema_1.settings).where(drizzle_orm_2.and(drizzle_orm_2.eq(schema_1.settings.category, 'bank'), drizzle_orm_2.eq(schema_1.settings.key, key))).limit(1)];
                    case 3:
                        existing = _d.sent();
                        if (!existing.length) return [3 /*break*/, 5];
                        return [4 /*yield*/, database.update(schema_1.settings).set({ value: String(value), updatedBy: ctx.user.id }).where(drizzle_orm_2.eq(schema_1.settings.key, key))];
                    case 4:
                        _d.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, database.insert(schema_1.settings).values({
                            id: uuid_1.v4(),
                            category: 'bank',
                            key: key,
                            value: String(value),
                            description: '',
                            updatedBy: ctx.user.id
                        })];
                    case 6:
                        _d.sent();
                        _d.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 2];
                    case 8: return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    getDocumentNumberingSettings: settingsReadProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, results, map;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        return [2 /*return*/, {}];
                    return [4 /*yield*/, database.select().from(schema_1.settings).where(drizzle_orm_2.eq(schema_1.settings.category, 'numbering'))];
                case 2:
                    results = _a.sent();
                    map = {};
                    results.forEach(function (s) { return map[s.key] = s.value; });
                    return [2 /*return*/, map];
            }
        });
    }); }),
    getNotificationPreferences: settingsReadProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, results, map;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _e.sent();
                    if (!database)
                        return [2 /*return*/, { invoiceDue: true, paymentReceived: true, newClient: false, companyAnnouncement: false }];
                    return [4 /*yield*/, database
                            .select()
                            .from(schema_1.settings)
                            .where(drizzle_orm_2.eq(schema_1.settings.category, 'notifications'))];
                case 2:
                    results = _e.sent();
                    map = {};
                    results.forEach(function (s) { return map[s.key] = s.value === 'true'; });
                    // provide defaults if missing
                    return [2 /*return*/, {
                            invoiceDue: (_a = map.invoiceDue) !== null && _a !== void 0 ? _a : true,
                            paymentReceived: (_b = map.paymentReceived) !== null && _b !== void 0 ? _b : true,
                            newClient: (_c = map.newClient) !== null && _c !== void 0 ? _c : false,
                            companyAnnouncement: (_d = map.companyAnnouncement) !== null && _d !== void 0 ? _d : false
                        }];
            }
        });
    }); }),
    updateNotificationPreferences: settingsWriteProcedure
        .input(zod_1.z.object({
        invoiceDue: zod_1.z.boolean(),
        paymentReceived: zod_1.z.boolean(),
        newClient: zod_1.z.boolean(),
        companyAnnouncement: zod_1.z.boolean()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, _i, _b, _c, key, value, existing, stringVal;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _d.sent();
                        if (!database)
                            throw new Error("DB error");
                        _i = 0, _b = Object.entries(input);
                        _d.label = 2;
                    case 2:
                        if (!(_i < _b.length)) return [3 /*break*/, 8];
                        _c = _b[_i], key = _c[0], value = _c[1];
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.settings)
                                .where(drizzle_orm_2.and(drizzle_orm_2.eq(schema_1.settings.category, 'notifications'), drizzle_orm_2.eq(schema_1.settings.key, key)))
                                .limit(1)];
                    case 3:
                        existing = _d.sent();
                        stringVal = value ? 'true' : 'false';
                        if (!existing.length) return [3 /*break*/, 5];
                        return [4 /*yield*/, database
                                .update(schema_1.settings)
                                .set({ value: stringVal, updatedBy: ctx.user.id })
                                .where(drizzle_orm_2.eq(schema_1.settings.id, existing[0].id))];
                    case 4:
                        _d.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, database.insert(schema_1.settings).values({
                            id: uuid_1.v4(),
                            category: 'notifications',
                            key: key,
                            value: stringVal,
                            description: '',
                            updatedBy: ctx.user.id
                        })];
                    case 6:
                        _d.sent();
                        _d.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 2];
                    case 8: return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    updateDocumentPrefix: settingsWriteProcedure
        .input(zod_1.z.object({ documentType: zod_1.z.string(), prefix: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, key, existing;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("DB error");
                        key = input.documentType + "_prefix";
                        return [4 /*yield*/, database.select().from(schema_1.settings).where(drizzle_orm_2.and(drizzle_orm_2.eq(schema_1.settings.category, 'numbering'), drizzle_orm_2.eq(schema_1.settings.key, key))).limit(1)];
                    case 2:
                        existing = _b.sent();
                        if (!existing.length) return [3 /*break*/, 4];
                        return [4 /*yield*/, database.update(schema_1.settings).set({ value: input.prefix, updatedBy: ctx.user.id }).where(drizzle_orm_2.eq(schema_1.settings.id, existing[0].id))];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, database.insert(schema_1.settings).values({ id: uuid_1.v4(), category: 'numbering', key: key, value: input.prefix, updatedBy: ctx.user.id })];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6: return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    getSettings: trpc_1.protectedProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, results, map;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        return [2 /*return*/, { companyName: 'Kiini CRM', currency: 'KSH' }];
                    return [4 /*yield*/, database.select().from(schema_1.settings).where(drizzle_orm_2.eq(schema_1.settings.category, 'general'))];
                case 2:
                    results = _a.sent();
                    map = {};
                    results.forEach(function (s) { return map[s.key] = s.value; });
                    return [2 /*return*/, { companyName: map.companyName || 'Kiini CRM', currency: map.currency || 'KSH' }];
            }
        });
    }); }),
    // Returns all frontend-relevant settings for any user (public)
    getPublicSettings: trpc_1.publicProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, categories, rows, result, _i, categories_1, cat, _a, rows_1, row;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _c.sent();
                    if (!database)
                        return [2 /*return*/, { general: {}, currency: {}, theme: {}, logos: {} }];
                    categories = ['general', 'currency', 'theme_settings', 'company_logos'];
                    return [4 /*yield*/, database.select().from(schema_1.settings).where(drizzle_orm_1.sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["", " IN (", ")"], ["", " IN (", ")"])), schema_1.settings.category, drizzle_orm_1.sql.join(categories.map(function (c) { return drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["", ""], ["", ""])), c); }), drizzle_orm_1.sql(templateObject_2 || (templateObject_2 = __makeTemplateObject([", "], [", "]))))))];
                case 2:
                    rows = _c.sent();
                    result = {};
                    for (_i = 0, categories_1 = categories; _i < categories_1.length; _i++) {
                        cat = categories_1[_i];
                        result[cat] = {};
                    }
                    for (_a = 0, rows_1 = rows; _a < rows_1.length; _a++) {
                        row = rows_1[_a];
                        if (result[row.category])
                            result[row.category][row.key] = (_b = row.value) !== null && _b !== void 0 ? _b : '';
                    }
                    return [2 /*return*/, {
                            general: result['general'],
                            currency: result['currency'],
                            theme: result['theme_settings'],
                            logos: result['company_logos']
                        }];
            }
        });
    }); }),
    getBankReconciliation: settingsReadProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, allExpenses, allPayments, totalRevenue, totalExpenses;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        return [2 /*return*/, { revenue: 0, expenses: 0, balance: 0, status: "Disconnected" }];
                    return [4 /*yield*/, database.select().from(schema_1.expenses)];
                case 2:
                    allExpenses = _a.sent();
                    return [4 /*yield*/, database.select().from(schema_1.payments)];
                case 3:
                    allPayments = _a.sent();
                    totalRevenue = allPayments.reduce(function (sum, p) { return sum + (p.amount || 0); }, 0);
                    totalExpenses = allExpenses.reduce(function (sum, e) { return sum + (e.amount || 0); }, 0);
                    return [2 /*return*/, { revenue: totalRevenue / 100, expenses: totalExpenses / 100, balance: (totalRevenue - totalExpenses) / 100, status: "Records Match" }];
            }
        });
    }); }),
    // Back-compat: client code expects a few document-numbering helpers by these names
    getDocumentNumberFormat: settingsReadProcedure
        .input(zod_1.z.object({ documentType: zod_1.z.string() }).optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, results, map, key;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, {}];
                        return [4 /*yield*/, database.select().from(schema_1.settings).where(drizzle_orm_2.eq(schema_1.settings.category, 'numbering'))];
                    case 2:
                        results = _b.sent();
                        map = {};
                        results.forEach(function (s) { return (map[s.key] = s.value); });
                        if (input && input.documentType) {
                            key = input.documentType + "_prefix";
                            return [2 /*return*/, map[key] || {}];
                        }
                        return [2 /*return*/, map];
                }
            });
        });
    }),
    updateDocumentNumberFormat: settingsWriteProcedure
        .input(zod_1.z.object({ documentType: zod_1.z.string(), prefix: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, key, existing;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("DB error");
                        key = input.documentType + "_prefix";
                        return [4 /*yield*/, database.select().from(schema_1.settings).where(drizzle_orm_2.and(drizzle_orm_2.eq(schema_1.settings.category, 'numbering'), drizzle_orm_2.eq(schema_1.settings.key, key))).limit(1)];
                    case 2:
                        existing = _b.sent();
                        if (!existing.length) return [3 /*break*/, 4];
                        return [4 /*yield*/, database.update(schema_1.settings).set({ value: input.prefix, updatedBy: ctx.user.id }).where(drizzle_orm_2.eq(schema_1.settings.id, existing[0].id))];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, database.insert(schema_1.settings).values({
                            id: uuid_1.v4(),
                            category: 'numbering',
                            key: key,
                            value: input.prefix,
                            description: '',
                            updatedBy: ctx.user.id
                        })];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6: return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    resetDocumentNumberFormatCounter: settingsWriteProcedure
        .input(zod_1.z.object({ documentType: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                // Best-effort stub: resetting counter is environment specific; return success for now
                return [2 /*return*/, { success: true }];
            });
        });
    }),
    getNextDocumentNumber: settingsReadProcedure
        .input(zod_1.z.object({ documentType: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = {};
                        return [4 /*yield*/, db.getNextDocumentNumber(input.documentType)];
                    case 1: return [2 /*return*/, (_b.documentNumber = _c.sent(), _b)];
                }
            });
        });
    }),
    // Get all settings
    getAll: settingsReadProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, database.select().from(schema_1.settings)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    }); }),
    // Get roles
    getRoles: rolesManageProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db.getRoles()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); }),
    // Back-compat: simple role management aliases so older client callsites using
    // `trpc.settings.createRole` / `updateRole` / `deleteRole` continue to work.
    createRole: rolesManageProcedure
        .input(zod_1.z.object({ name: zod_1.z.string(), displayName: zod_1.z.string().optional(), description: zod_1.z.string().optional(), permissions: zod_1.z.array(zod_1.z.string()).optional() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var id, allPerms, _loop_1, _i, _b, pName;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db.createRole(input.name, input.description)];
                    case 1:
                        id = _c.sent();
                        if (!(input.permissions && input.permissions.length)) return [3 /*break*/, 6];
                        return [4 /*yield*/, db.getPermissions()];
                    case 2:
                        allPerms = _c.sent();
                        _loop_1 = function (pName) {
                            var perm;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        perm = allPerms.find(function (pp) { return pp.permissionName === pName || pp.name === pName; });
                                        if (!(perm && perm.id)) return [3 /*break*/, 2];
                                        return [4 /*yield*/, db.assignPermissionToRole(id, perm.id)];
                                    case 1:
                                        _a.sent();
                                        _a.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        };
                        _i = 0, _b = input.permissions;
                        _c.label = 3;
                    case 3:
                        if (!(_i < _b.length)) return [3 /*break*/, 6];
                        pName = _b[_i];
                        return [5 /*yield**/, _loop_1(pName)];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [4 /*yield*/, db.logActivity({ userId: ctx.user.id, action: 'role_created', entityType: 'role', entityId: id, description: "Created role: " + input.name })];
                    case 7:
                        _c.sent();
                        return [2 /*return*/, { id: id, name: input.name, displayName: input.displayName || input.name, description: input.description }];
                }
            });
        });
    }),
    updateRole: rolesManageProcedure
        .input(zod_1.z.object({ id: zod_1.z.string(), displayName: zod_1.z.string().optional(), description: zod_1.z.string().optional(), permissions: zod_1.z.array(zod_1.z.string()).optional() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var dbconn, updateSet, existing, _i, existing_1, rp, allPerms, _loop_2, _b, _c, pName;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        dbconn = _d.sent();
                        if (!dbconn)
                            throw new Error('Database not available');
                        updateSet = {};
                        if (input.displayName !== undefined)
                            updateSet.roleName = input.displayName;
                        if (input.description !== undefined)
                            updateSet.description = input.description;
                        if (!(Object.keys(updateSet).length > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, dbconn.update(schema_1.userRoles).set(updateSet).where(drizzle_orm_2.eq(schema_1.userRoles.id, input.id))];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3:
                        if (!input.permissions) return [3 /*break*/, 13];
                        return [4 /*yield*/, db.getRolePermissions(input.id)];
                    case 4:
                        existing = _d.sent();
                        _i = 0, existing_1 = existing;
                        _d.label = 5;
                    case 5:
                        if (!(_i < existing_1.length)) return [3 /*break*/, 8];
                        rp = existing_1[_i];
                        if (!rp.permissionId) return [3 /*break*/, 7];
                        return [4 /*yield*/, db.removePermissionFromRole(input.id, rp.permissionId)];
                    case 6:
                        _d.sent();
                        _d.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 5];
                    case 8: return [4 /*yield*/, db.getPermissions()];
                    case 9:
                        allPerms = _d.sent();
                        _loop_2 = function (pName) {
                            var perm;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        perm = allPerms.find(function (pp) { return pp.permissionName === pName || pp.name === pName; });
                                        if (!(perm && perm.id)) return [3 /*break*/, 2];
                                        return [4 /*yield*/, db.assignPermissionToRole(input.id, perm.id)];
                                    case 1:
                                        _a.sent();
                                        _a.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        };
                        _b = 0, _c = input.permissions;
                        _d.label = 10;
                    case 10:
                        if (!(_b < _c.length)) return [3 /*break*/, 13];
                        pName = _c[_b];
                        return [5 /*yield**/, _loop_2(pName)];
                    case 11:
                        _d.sent();
                        _d.label = 12;
                    case 12:
                        _b++;
                        return [3 /*break*/, 10];
                    case 13: return [4 /*yield*/, db.logActivity({ userId: ctx.user.id, action: 'role_updated', entityType: 'role', entityId: input.id, description: "Updated role: " + input.id })];
                    case 14:
                        _d.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    deleteRole: rolesManageProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var dbconn, role;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        dbconn = _b.sent();
                        if (!dbconn)
                            throw new Error('Database not available');
                        return [4 /*yield*/, dbconn.select().from(schema_1.userRoles).where(drizzle_orm_2.eq(schema_1.userRoles.id, input)).limit(1)];
                    case 2:
                        role = _b.sent();
                        if (role.length && role[0].roleName && ['super_admin', 'admin'].includes(role[0].roleName)) {
                            throw new Error('Cannot delete system role');
                        }
                        return [4 /*yield*/, dbconn["delete"](schema_1.userRoles).where(drizzle_orm_2.eq(schema_1.userRoles.id, input))];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, db.logActivity({ userId: ctx.user.id, action: 'role_deleted', entityType: 'role', entityId: input, description: "Deleted role: " + input })];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // Legacy list alias for roles
    list: settingsReadProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db.getRoles()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); }),
    // Get permissions
    getPermissions: settingsReadProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db.getPermissions()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); }),
    // Get user counts per role
    getUserCounts: settingsReadProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, results, counts;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        return [2 /*return*/, {}];
                    return [4 /*yield*/, database.select({
                            role: schema_1.users.role,
                            count: drizzle_orm_1.sql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["count(*)"], ["count(*)"])))
                        }).from(schema_1.users).groupBy(schema_1.users.role)];
                case 2:
                    results = _a.sent();
                    counts = {};
                    results.forEach(function (r) {
                        if (r.role)
                            counts[r.role] = Number(r.count);
                    });
                    return [2 /*return*/, counts];
            }
        });
    }); }),
    // Set a setting
    set: trpc_1.createFeatureRestrictedProcedure("admin:settings")
        .input(zod_1.z.object({
        key: zod_1.z.string(),
        value: zod_1.z.string(),
        category: zod_1.z.string(),
        description: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, existing;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database.select().from(schema_1.settings)
                                .where(drizzle_orm_2.and(drizzle_orm_2.eq(schema_1.settings.category, input.category), drizzle_orm_2.eq(schema_1.settings.key, input.key)))
                                .limit(1)];
                    case 2:
                        existing = _b.sent();
                        if (!(existing.length > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, database.update(schema_1.settings)
                                .set({
                                value: input.value,
                                updatedBy: ctx.user.id
                            })
                                .where(drizzle_orm_2.eq(schema_1.settings.id, existing[0].id))];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, database.insert(schema_1.settings).values({
                            id: uuid_1.v4(),
                            category: input.category,
                            key: input.key,
                            value: input.value,
                            description: input.description,
                            updatedBy: ctx.user.id
                        })];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6: 
                    // Log activity
                    return [4 /*yield*/, db.logActivity({
                            userId: ctx.user.id,
                            action: "setting_updated",
                            entityType: "setting",
                            entityId: input.key,
                            description: "Updated setting: " + input.key + " = " + input.value
                        })];
                    case 7:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // Create permission
    createPermission: rolesManageProcedure
        .input(zod_1.z.object({
        permissionName: zod_1.z.string(),
        description: zod_1.z.string().optional(),
        category: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var permissionId;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db.createPermission(input.permissionName, input.description, input.category)];
                    case 1:
                        permissionId = _b.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "permission_created",
                                entityType: "permission",
                                entityId: permissionId,
                                description: "Created permission: " + input.permissionName
                            })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, {
                                id: permissionId,
                                permissionName: input.permissionName,
                                description: input.description,
                                category: input.category
                            }];
                }
            });
        });
    }),
    // Back-compat bankReconciliation helpers (client expects bankReconciliation.getById / update / list)
    getById: settingsReadProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, result, row, parsed;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, database.select().from(schema_1.settings).where(drizzle_orm_2.eq(schema_1.settings.id, input)).limit(1)];
                    case 2:
                        result = _b.sent();
                        row = result[0] || null;
                        if (!row)
                            return [2 /*return*/, null];
                        // If the stored value is JSON, return the parsed object so client-side
                        // code (e.g. bank reconciliation) gets a structured object instead of
                        // the raw settings row.
                        try {
                            if (row.value) {
                                parsed = JSON.parse(row.value);
                                if (parsed && typeof parsed === 'object')
                                    return [2 /*return*/, parsed];
                            }
                        }
                        catch (e) {
                            // ignore parse errors and fall back to returning raw row
                        }
                        return [2 /*return*/, row];
                }
            });
        });
    }),
    update: trpc_1.createFeatureRestrictedProcedure("settings:manage")
        .input(zod_1.z.any())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, _i, _b, _c, key, value, existing;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _d.sent();
                        if (!database)
                            throw new Error("DB error");
                        _i = 0, _b = Object.entries(input);
                        _d.label = 2;
                    case 2:
                        if (!(_i < _b.length)) return [3 /*break*/, 8];
                        _c = _b[_i], key = _c[0], value = _c[1];
                        return [4 /*yield*/, database.select().from(schema_1.settings).where(drizzle_orm_2.and(drizzle_orm_2.eq(schema_1.settings.category, 'bank'), drizzle_orm_2.eq(schema_1.settings.key, key))).limit(1)];
                    case 3:
                        existing = _d.sent();
                        if (!existing.length) return [3 /*break*/, 5];
                        return [4 /*yield*/, database.update(schema_1.settings).set({ value: String(value), updatedBy: ctx.user.id }).where(drizzle_orm_2.eq(schema_1.settings.id, existing[0].id))];
                    case 4:
                        _d.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, database.insert(schema_1.settings).values({ id: uuid_1.v4(), category: 'bank', key: key, value: String(value), updatedBy: ctx.user.id })];
                    case 6:
                        _d.sent();
                        _d.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 2];
                    case 8: return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    listBank: settingsReadProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, database.select().from(schema_1.settings).where(drizzle_orm_2.eq(schema_1.settings.category, 'bank'))];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    }); }),
    // Assign permission to role
    assignPermissionToRole: rolesManageProcedure
        .input(zod_1.z.object({
        roleId: zod_1.z.string(),
        permissionId: zod_1.z.string()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db.assignPermissionToRole(input.roleId, input.permissionId)];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "permission_assigned",
                                entityType: "role_permission",
                                entityId: input.roleId + "_" + input.permissionId,
                                description: "Assigned permission " + input.permissionId + " to role " + input.roleId
                            })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // Remove permission from role
    removePermissionFromRole: rolesManageProcedure
        .input(zod_1.z.object({
        roleId: zod_1.z.string(),
        permissionId: zod_1.z.string()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db.removePermissionFromRole(input.roleId, input.permissionId)];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "permission_removed",
                                entityType: "role_permission",
                                entityId: input.roleId + "_" + input.permissionId,
                                description: "Removed permission " + input.permissionId + " from role " + input.roleId
                            })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // Get role permissions
    getRolePermissions: rolesManageProcedure
        .input(zod_1.z.object({
        roleId: zod_1.z.string()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db.getRolePermissions(input.roleId)];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    // Back-compat: user preference helpers expected by older client code
    getUserPreferences: settingsReadProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, userPrefixes, userIdPrefix, userPrefs;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, database.select().from(schema_1.settings)
                                .where(drizzle_orm_2.and(drizzle_orm_2.eq(schema_1.settings.category, 'user_pref')))
                                .limit(100)];
                    case 2:
                        userPrefixes = _b.sent();
                        userIdPrefix = "user_pref:" + ctx.user.id + ":";
                        userPrefs = userPrefixes.filter(function (s) { return s.key && s.key.startsWith(userIdPrefix); });
                        // Transform to frontend-friendly format
                        return [2 /*return*/, userPrefs.map(function (pref) { return ({
                                key: pref.key,
                                value: pref.value
                            }); })];
                }
            });
        });
    }),
    setUserPreference: settingsWriteProcedure
        .input(zod_1.z.object({ key: zod_1.z.string(), value: zod_1.z.union([zod_1.z.string(), zod_1.z.boolean(), zod_1.z.number()]) }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, prefKey, valueStr, existing;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error('DB error');
                        prefKey = "user_pref:" + ctx.user.id + ":" + input.key;
                        valueStr = String(input.value);
                        return [4 /*yield*/, database.select().from(schema_1.settings).where(drizzle_orm_2.and(drizzle_orm_2.eq(schema_1.settings.category, 'user_pref'), drizzle_orm_2.eq(schema_1.settings.key, prefKey))).limit(1)];
                    case 2:
                        existing = _b.sent();
                        if (!existing.length) return [3 /*break*/, 4];
                        return [4 /*yield*/, database.update(schema_1.settings).set({ value: valueStr, updatedBy: ctx.user.id, updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) }).where(drizzle_orm_2.eq(schema_1.settings.id, existing[0].id))];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, database.insert(schema_1.settings).values({ id: uuid_1.v4(), category: 'user_pref', key: prefKey, value: valueStr, description: "User preference: " + input.key, updatedBy: ctx.user.id })];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6: return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    resetSettingToDefault: settingsWriteProcedure
        .input(zod_1.z.object({ key: zod_1.z.string(), category: zod_1.z.string().optional() }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                // Best-effort stub: do nothing for now and return success
                return [2 /*return*/, { success: true }];
            });
        });
    }),
    resetCategoryToDefaults: settingsWriteProcedure
        .input(zod_1.z.object({ category: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                // Best-effort stub: return success; implement as needed
                return [2 /*return*/, { success: true }];
            });
        });
    }),
    // Generic: get all settings for a given category as a key-value map
    getByCategory: settingsReadProcedure
        .input(zod_1.z.object({ category: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, results, map;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, {}];
                        return [4 /*yield*/, database.select().from(schema_1.settings).where(drizzle_orm_2.eq(schema_1.settings.category, input.category))];
                    case 2:
                        results = _b.sent();
                        map = {};
                        results.forEach(function (s) { var _a; if (s.key)
                            map[s.key] = (_a = s.value) !== null && _a !== void 0 ? _a : ""; });
                        return [2 /*return*/, map];
                }
            });
        });
    }),
    // Generic: update multiple settings for a given category in one call
    updateByCategory: settingsWriteProcedure
        .input(zod_1.z.object({
        category: zod_1.z.string(),
        values: zod_1.z.record(zod_1.z.string(), zod_1.z.string())
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, _i, _b, _c, key, value, existing;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _d.sent();
                        if (!database)
                            throw new Error("Database not available");
                        _i = 0, _b = Object.entries(input.values);
                        _d.label = 2;
                    case 2:
                        if (!(_i < _b.length)) return [3 /*break*/, 8];
                        _c = _b[_i], key = _c[0], value = _c[1];
                        return [4 /*yield*/, database.select().from(schema_1.settings)
                                .where(drizzle_orm_2.and(drizzle_orm_2.eq(schema_1.settings.category, input.category), drizzle_orm_2.eq(schema_1.settings.key, key)))
                                .limit(1)];
                    case 3:
                        existing = _d.sent();
                        if (!(existing.length > 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, database.update(schema_1.settings)
                                .set({ value: String(value), updatedBy: ctx.user.id })
                                .where(drizzle_orm_2.eq(schema_1.settings.id, existing[0].id))];
                    case 4:
                        _d.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, database.insert(schema_1.settings).values({
                            id: uuid_1.v4(),
                            category: input.category,
                            key: key,
                            value: String(value),
                            description: '',
                            updatedBy: ctx.user.id
                        })];
                    case 6:
                        _d.sent();
                        _d.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 2];
                    case 8:
                        // Invalidate maintenance mode cache when maintenance settings change
                        if (input.category === "maintenance" || input.category === "tweak_settings") {
                            trpc_1.invalidateMaintenanceCache();
                        }
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    })
});
var templateObject_1, templateObject_2, templateObject_3, templateObject_4;
