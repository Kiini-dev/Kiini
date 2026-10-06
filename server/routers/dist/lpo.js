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
exports.__esModule = true;
exports.lpoRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var dbHelpers = require("../db");
var schema_extended_1 = require("../../drizzle/schema-extended");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var schema_2 = require("../../drizzle/schema");
var drizzle_orm_2 = require("drizzle-orm");
var budgetEnforcer_1 = require("../utils/budgetEnforcer");
// Permission-restricted procedure instances
var viewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("procurement:lpo:view");
var createProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("procurement:lpo:create");
var approveProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("procurement:lpo:approve");
var deleteProcedure = enhancedRbac_1.createRoleRestrictedProcedure(["super_admin", "admin"]);
// Settings-aware LPO number generator
function generateNextLPONumber(db) {
    return __awaiter(this, void 0, Promise, function () {
        var prefix, rows, _a, result, seq, match, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, , 7]);
                    prefix = "LPO";
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, db.select().from(schema_2.settings)
                            .where(drizzle_orm_2.and(drizzle_orm_1.eq(schema_2.settings.category, "numbering"), drizzle_orm_1.eq(schema_2.settings.key, "lpoPrefix")))
                            .limit(1)];
                case 2:
                    rows = _b.sent();
                    if (rows.length > 0 && rows[0].value)
                        prefix = rows[0].value;
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [4 /*yield*/, db.select({ num: schema_extended_1.lpos.lpoNumber })
                        .from(schema_extended_1.lpos)
                        .orderBy(drizzle_orm_1.desc(schema_extended_1.lpos.createdAt))
                        .limit(1)];
                case 5:
                    result = _b.sent();
                    seq = 0;
                    if (result && result.length > 0 && result[0].num) {
                        match = result[0].num.match(/(\d+)$/);
                        if (match)
                            seq = parseInt(match[1]);
                    }
                    seq++;
                    return [2 /*return*/, prefix + "-" + String(seq).padStart(6, '0')];
                case 6:
                    err_1 = _b.sent();
                    console.warn("lpogenerator error", err_1);
                    return [2 /*return*/, "LPO-000001"];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.lpoRouter = trpc_1.router({
    list: viewProcedure
        .query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, where, result, error_1, errorMessage;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, dbHelpers.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db) {
                            console.error("[LPO] Database connection not available");
                            return [2 /*return*/, []];
                        }
                        console.log("[LPO] Attempting to fetch LPOs");
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.eq(schema_extended_1.lpos.organizationId, orgId) : undefined;
                        return [4 /*yield*/, db.select().from(schema_extended_1.lpos).where(where).orderBy(drizzle_orm_1.desc(schema_extended_1.lpos.createdAt))];
                    case 2:
                        result = _b.sent();
                        console.log("[LPO] Successfully fetched", (result === null || result === void 0 ? void 0 : result.length) || 0, "LPOs");
                        return [2 /*return*/, result];
                    case 3:
                        error_1 = _b.sent();
                        errorMessage = error_1 instanceof Error ? error_1.message : String(error_1);
                        console.error("[LPO] Error fetching LPOs - Database Error:", errorMessage);
                        console.error("[LPO] Full error details:", error_1);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    getById: viewProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, conditions, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, dbHelpers.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        orgId = ctx.user.organizationId;
                        conditions = orgId
                            ? drizzle_orm_2.and(drizzle_orm_1.eq(schema_extended_1.lpos.id, input), drizzle_orm_1.eq(schema_extended_1.lpos.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_extended_1.lpos.id, input);
                        return [4 /*yield*/, db.select().from(schema_extended_1.lpos).where(conditions).limit(1)];
                    case 2:
                        rows = _b.sent();
                        return [2 /*return*/, rows[0] || null];
                }
            });
        });
    }),
    create: createProcedure
        .input(zod_1.z.object({
        vendorId: zod_1.z.string(),
        description: zod_1.z.string().optional(),
        amount: zod_1.z.number().positive(),
        budgetId: zod_1.z.string().optional(),
        accountId: zod_1.z.string().optional(),
        cashAccountId: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, lpoNumber, normalizedOrgId, budget;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, dbHelpers.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("DB not available");
                        id = uuid_1.v4();
                        return [4 /*yield*/, generateNextLPONumber(db)];
                    case 2:
                        lpoNumber = _b.sent();
                        normalizedOrgId = (ctx.user.organizationId || "").trim() || null;
                        return [4 /*yield*/, budgetEnforcer_1.checkBudget(db, input.amount, normalizedOrgId, {
                                budgetId: input.budgetId,
                                label: lpoNumber
                            })];
                    case 3:
                        budget = _b.sent();
                        return [4 /*yield*/, db.insert(schema_extended_1.lpos).values({
                                id: id,
                                organizationId: normalizedOrgId,
                                lpoNumber: lpoNumber,
                                vendorId: input.vendorId,
                                description: input.description || null,
                                amount: input.amount,
                                status: 'draft',
                                budgetId: (budget === null || budget === void 0 ? void 0 : budget.budgetId) || input.budgetId || null,
                                accountId: input.accountId || null,
                                cashAccountId: input.cashAccountId || null,
                                createdBy: ctx.user.id
                            })];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, { id: id }];
                }
            });
        });
    }),
    update: createProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        status: zod_1.z["enum"](["draft", "submitted", "approved", "rejected", "received"]).optional(),
        description: zod_1.z.string().optional(),
        amount: zod_1.z.number().positive().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, idCondition, existing, upd, lpo, budgetErr_1, jeId, entryNumber, expenseAccountId, payableAccountId, e_1, expenseDefault, payableDefault, e_2, vendorKeyExp, vendorKeyPay, vexp, vpay, e_3, e_4, financeRouter, e_5, err_2;
            var _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0: return [4 /*yield*/, dbHelpers.getDb()];
                    case 1:
                        db = _f.sent();
                        if (!db)
                            throw new Error("DB not available");
                        orgId = ctx.user.organizationId;
                        idCondition = orgId
                            ? drizzle_orm_2.and(drizzle_orm_1.eq(schema_extended_1.lpos.id, input.id), drizzle_orm_1.eq(schema_extended_1.lpos.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_extended_1.lpos.id, input.id);
                        return [4 /*yield*/, db.select().from(schema_extended_1.lpos).where(idCondition).limit(1)];
                    case 2:
                        existing = _f.sent();
                        if (input.status) {
                            // only allow approving a submitted LPO
                            if (input.status === 'approved' && existing.length && existing[0].status !== 'submitted') {
                                throw new Error('Can only approve submitted LPOs');
                            }
                        }
                        upd = { updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) };
                        if (!input.status) return [3 /*break*/, 39];
                        // log status change actions
                        return [4 /*yield*/, db.logActivity({ userId: ctx.user.id, action: "lpo_status_" + input.status, entityType: 'lpo', entityId: input.id, description: "LPO " + input.id + " marked " + input.status })];
                    case 3:
                        // log status change actions
                        _f.sent();
                        upd.status = input.status;
                        if (!(input.status === 'approved')) return [3 /*break*/, 39];
                        _f.label = 4;
                    case 4:
                        _f.trys.push([4, 11, , 12]);
                        lpo = existing[0];
                        if (!(lpo === null || lpo === void 0 ? void 0 : lpo.budgetId)) return [3 /*break*/, 6];
                        return [4 /*yield*/, budgetEnforcer_1.deductFromBudget(db, lpo.budgetId, lpo.amount || 0)];
                    case 5:
                        _f.sent();
                        _f.label = 6;
                    case 6:
                        if (!(lpo === null || lpo === void 0 ? void 0 : lpo.accountId)) return [3 /*break*/, 8];
                        return [4 /*yield*/, budgetEnforcer_1.updateCOAByAccountId(db, lpo.accountId, lpo.amount || 0, 'debit')];
                    case 7:
                        _f.sent();
                        _f.label = 8;
                    case 8:
                        if (!(lpo === null || lpo === void 0 ? void 0 : lpo.cashAccountId)) return [3 /*break*/, 10];
                        return [4 /*yield*/, budgetEnforcer_1.updateCOAByAccountId(db, lpo.cashAccountId, lpo.amount || 0, 'credit')];
                    case 9:
                        _f.sent();
                        _f.label = 10;
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        budgetErr_1 = _f.sent();
                        // If budget/COA update fails, propagate so approval is blocked
                        throw budgetErr_1;
                    case 12:
                        _f.trys.push([12, 38, , 39]);
                        jeId = uuid_1.v4();
                        entryNumber = "JE-" + Date.now();
                        expenseAccountId = 'expense:unallocated';
                        payableAccountId = 'liability:accounts_payable';
                        _f.label = 13;
                    case 13:
                        _f.trys.push([13, 28, , 29]);
                        if (!(typeof dbHelpers.getNextDocumentNumber === 'function')) return [3 /*break*/, 17];
                        _f.label = 14;
                    case 14:
                        _f.trys.push([14, 16, , 17]);
                        return [4 /*yield*/, dbHelpers.getNextDocumentNumber('journalEntry')];
                    case 15:
                        entryNumber = _f.sent();
                        return [3 /*break*/, 17];
                    case 16:
                        e_1 = _f.sent();
                        return [3 /*break*/, 17];
                    case 17:
                        if (!(typeof dbHelpers.getDefaultSetting === 'function')) return [3 /*break*/, 22];
                        _f.label = 18;
                    case 18:
                        _f.trys.push([18, 21, , 22]);
                        return [4 /*yield*/, dbHelpers.getDefaultSetting('accounting', 'defaultExpenseAccount')];
                    case 19:
                        expenseDefault = _f.sent();
                        return [4 /*yield*/, dbHelpers.getDefaultSetting('accounting', 'accountsPayableAccount')];
                    case 20:
                        payableDefault = _f.sent();
                        if (expenseDefault && expenseDefault.value)
                            expenseAccountId = expenseDefault.value;
                        if (payableDefault && payableDefault.value)
                            payableAccountId = payableDefault.value;
                        return [3 /*break*/, 22];
                    case 21:
                        e_2 = _f.sent();
                        return [3 /*break*/, 22];
                    case 22:
                        if (!(typeof dbHelpers.getSetting === 'function' && ((_b = existing[0]) === null || _b === void 0 ? void 0 : _b.vendorId))) return [3 /*break*/, 27];
                        _f.label = 23;
                    case 23:
                        _f.trys.push([23, 26, , 27]);
                        vendorKeyExp = "vendor_" + existing[0].vendorId + "_expenseAccount";
                        vendorKeyPay = "vendor_" + existing[0].vendorId + "_payableAccount";
                        return [4 /*yield*/, dbHelpers.getSetting(vendorKeyExp)];
                    case 24:
                        vexp = _f.sent();
                        return [4 /*yield*/, dbHelpers.getSetting(vendorKeyPay)];
                    case 25:
                        vpay = _f.sent();
                        if (vexp && vexp.value)
                            expenseAccountId = vexp.value;
                        if (vpay && vpay.value)
                            payableAccountId = vpay.value;
                        return [3 /*break*/, 27];
                    case 26:
                        e_3 = _f.sent();
                        return [3 /*break*/, 27];
                    case 27: return [3 /*break*/, 29];
                    case 28:
                        e_4 = _f.sent();
                        return [3 /*break*/, 29];
                    case 29: return [4 /*yield*/, db.insert(schema_1.journalEntries).values({
                            id: jeId,
                            entryNumber: entryNumber,
                            entryDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
                            description: "LPO " + input.id + " approved - " + (((_c = existing[0]) === null || _c === void 0 ? void 0 : _c.lpoNumber) || ''),
                            referenceType: 'lpo',
                            referenceId: input.id,
                            createdBy: ctx.user.id,
                            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        })];
                    case 30:
                        _f.sent();
                        // create two balancing lines: debit expense, credit accounts_payable
                        return [4 /*yield*/, db.insert(schema_1.journalEntryLines).values({
                                id: uuid_1.v4(),
                                journalEntryId: jeId,
                                accountId: expenseAccountId,
                                debit: ((_d = existing[0]) === null || _d === void 0 ? void 0 : _d.amount) || 0,
                                credit: 0,
                                description: "Expense for LPO " + input.id,
                                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 31:
                        // create two balancing lines: debit expense, credit accounts_payable
                        _f.sent();
                        return [4 /*yield*/, db.insert(schema_1.journalEntryLines).values({
                                id: uuid_1.v4(),
                                journalEntryId: jeId,
                                accountId: payableAccountId,
                                debit: 0,
                                credit: ((_e = existing[0]) === null || _e === void 0 ? void 0 : _e.amount) || 0,
                                description: "Accounts payable for LPO " + input.id,
                                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 32:
                        _f.sent();
                        _f.label = 33;
                    case 33:
                        _f.trys.push([33, 36, , 37]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('./finance'); })];
                    case 34:
                        financeRouter = (_f.sent()).financeRouter;
                        return [4 /*yield*/, financeRouter.createCaller({ user: ctx.user }).autoPostFromModule({ module: 'lpo', recordId: input.id })];
                    case 35:
                        _f.sent();
                        return [3 /*break*/, 37];
                    case 36:
                        e_5 = _f.sent();
                        console.debug('autoPostFromModule failed', e_5);
                        return [3 /*break*/, 37];
                    case 37: return [3 /*break*/, 39];
                    case 38:
                        err_2 = _f.sent();
                        console.warn('Failed to create journal entry for approved LPO', err_2);
                        return [3 /*break*/, 39];
                    case 39:
                        if (input.description !== undefined)
                            upd.description = input.description;
                        if (input.amount !== undefined)
                            upd.amount = input.amount;
                        return [4 /*yield*/, db.update(schema_extended_1.lpos).set(upd).where(idCondition)];
                    case 40:
                        _f.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    "delete": deleteProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, idCondition;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, dbHelpers.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            throw new Error("DB not available");
                        orgId = (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId;
                        idCondition = orgId
                            ? drizzle_orm_2.and(drizzle_orm_1.eq(schema_extended_1.lpos.id, input), drizzle_orm_1.eq(schema_extended_1.lpos.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_extended_1.lpos.id, input);
                        return [4 /*yield*/, db["delete"](schema_extended_1.lpos).where(idCondition)];
                    case 2:
                        _c.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    })
});
