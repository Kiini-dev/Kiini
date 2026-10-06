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
exports.imprestRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_extended_1 = require("../../drizzle/schema-extended");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
function generateNextImprestNumber(db) {
    return __awaiter(this, void 0, Promise, function () {
        var result, seq, match, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db.select({ num: schema_extended_1.imprests.imprestNumber })
                            .from(schema_extended_1.imprests)
                            .orderBy(drizzle_orm_1.desc(schema_extended_1.imprests.createdAt))
                            .limit(1)];
                case 1:
                    result = _a.sent();
                    seq = 0;
                    if (result && result.length > 0 && result[0].num) {
                        match = result[0].num.match(/(\d+)$/);
                        if (match)
                            seq = parseInt(match[1]);
                    }
                    seq++;
                    return [2 /*return*/, "IMP-" + String(seq).padStart(6, '0')];
                case 2:
                    err_1 = _a.sent();
                    console.warn("imprest number generator error", err_1);
                    return [2 /*return*/, "IMP-000001"];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.imprestRouter = trpc_1.router({
    list: trpc_1.protectedProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db.select().from(schema_extended_1.imprests).orderBy(drizzle_orm_1.desc(schema_extended_1.imprests.createdAt))];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    }); }),
    getById: trpc_1.protectedProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, db.select().from(schema_extended_1.imprests).where(drizzle_orm_1.eq(schema_extended_1.imprests.id, input)).limit(1)];
                    case 2:
                        rows = _b.sent();
                        return [2 /*return*/, rows[0] || null];
                }
            });
        });
    }),
    create: trpc_1.protectedProcedure
        .input(zod_1.z.object({ userId: zod_1.z.string(), purpose: zod_1.z.string().optional(), amount: zod_1.z.number().positive() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, impNum;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("DB not available");
                        id = uuid_1.v4();
                        return [4 /*yield*/, generateNextImprestNumber(db)];
                    case 2:
                        impNum = _b.sent();
                        return [4 /*yield*/, db.insert(schema_extended_1.imprests).values({
                                id: id,
                                imprestNumber: impNum,
                                userId: input.userId,
                                purpose: input.purpose || null,
                                amount: input.amount,
                                status: 'requested',
                                createdBy: ctx.user.id
                            })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { id: id }];
                }
            });
        });
    }),
    update: trpc_1.protectedProcedure
        .input(zod_1.z.object({ id: zod_1.z.string(), status: zod_1.z["enum"](["requested", "approved", "rejected", "settled"]).optional(), purpose: zod_1.z.string().optional(), amount: zod_1.z.number().positive().optional() }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, upd, jeId, expenseAccountId, payableAccountId, dbHelpers, expenseDefault, payableDefault, e_1, e_2, err_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("DB not available");
                        upd = { updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) };
                        if (!input.status) return [3 /*break*/, 16];
                        upd.status = input.status;
                        if (!(input.status === 'approved')) return [3 /*break*/, 16];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 15, , 16]);
                        jeId = uuid_1.v4();
                        expenseAccountId = 'expense:unallocated';
                        payableAccountId = 'liability:accounts_payable';
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 10, , 11]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../db'); })];
                    case 4:
                        dbHelpers = _b.sent();
                        if (!(dbHelpers && typeof dbHelpers.getDefaultSetting === 'function')) return [3 /*break*/, 9];
                        _b.label = 5;
                    case 5:
                        _b.trys.push([5, 8, , 9]);
                        return [4 /*yield*/, dbHelpers.getDefaultSetting('accounting', 'defaultExpenseAccount')];
                    case 6:
                        expenseDefault = _b.sent();
                        return [4 /*yield*/, dbHelpers.getDefaultSetting('accounting', 'accountsPayableAccount')];
                    case 7:
                        payableDefault = _b.sent();
                        if (expenseDefault && expenseDefault.value)
                            expenseAccountId = expenseDefault.value;
                        if (payableDefault && payableDefault.value)
                            payableAccountId = payableDefault.value;
                        return [3 /*break*/, 9];
                    case 8:
                        e_1 = _b.sent();
                        return [3 /*break*/, 9];
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        e_2 = _b.sent();
                        return [3 /*break*/, 11];
                    case 11: return [4 /*yield*/, db.insert(schema_1.journalEntries).values({
                            id: jeId,
                            entryNumber: "JE-" + Date.now(),
                            entryDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
                            description: "Imprest approved: " + input.id,
                            referenceType: 'imprest',
                            referenceId: input.id,
                            createdBy: '',
                            createdAt: new Date().toISOString()
                        })];
                    case 12:
                        _b.sent();
                        return [4 /*yield*/, db.insert(schema_1.journalEntryLines).values({
                                id: uuid_1.v4(),
                                journalEntryId: jeId,
                                accountId: expenseAccountId,
                                debit: input.amount || 0,
                                credit: 0,
                                description: "Expense for imprest " + input.id,
                                createdAt: new Date().toISOString()
                            })];
                    case 13:
                        _b.sent();
                        return [4 /*yield*/, db.insert(schema_1.journalEntryLines).values({
                                id: uuid_1.v4(),
                                journalEntryId: jeId,
                                accountId: payableAccountId,
                                debit: 0,
                                credit: input.amount || 0,
                                description: "Accounts payable for imprest " + input.id,
                                createdAt: new Date().toISOString()
                            })];
                    case 14:
                        _b.sent();
                        return [3 /*break*/, 16];
                    case 15:
                        err_2 = _b.sent();
                        console.warn('failed to create journal entry for imprest', err_2);
                        return [3 /*break*/, 16];
                    case 16:
                        if (input.purpose !== undefined)
                            upd.purpose = input.purpose;
                        if (input.amount !== undefined)
                            upd.amount = input.amount;
                        return [4 /*yield*/, db.update(schema_extended_1.imprests).set(upd).where(drizzle_orm_1.eq(schema_extended_1.imprests.id, input.id))];
                    case 17:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    "delete": trpc_1.protectedProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("DB not available");
                        return [4 /*yield*/, db["delete"](schema_extended_1.imprests).where(drizzle_orm_1.eq(schema_extended_1.imprests.id, input))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    })
});
