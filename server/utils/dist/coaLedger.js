"use strict";
/**
 * Chart of Accounts Ledger Utility
 *
 * Provides a helper to post double-entry journal entries and keep account
 * balances in sync.  Used by expenses, procurement, payments, and assets
 * routers whenever a financial transaction is approved / committed.
 */
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
exports.postJournalEntry = void 0;
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
/**
 * Post a double-entry journal entry.
 * Updates affected account balances as a best-effort side-effect
 * (balance update failures are non-fatal so they never roll back the entry).
 *
 * Returns the created journal entry ID.
 */
function postJournalEntry(database, input) {
    var _a, _b;
    return __awaiter(this, void 0, Promise, function () {
        var now, entryDate, entryId, ym, entryNumber, _i, _c, line, delta, rows, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    now = new Date().toISOString().replace("T", " ").substring(0, 19);
                    if (!input.date) {
                        entryDate = now;
                    }
                    else if (typeof input.date === "string") {
                        entryDate = input.date.length > 19 ? input.date.substring(0, 19) : input.date;
                    }
                    else {
                        entryDate = input.date.toISOString().replace("T", " ").substring(0, 19);
                    }
                    entryId = uuid_1.v4();
                    ym = "" + new Date().getFullYear() + String(new Date().getMonth() + 1).padStart(2, "0");
                    entryNumber = "JE-" + ym + "-" + entryId.substring(0, 8).toUpperCase();
                    // 1. Insert the journal entry header
                    return [4 /*yield*/, database.insert(schema_1.journalEntries).values({
                            id: entryId,
                            entryNumber: entryNumber,
                            entryDate: entryDate,
                            description: input.description,
                            referenceType: input.referenceType,
                            referenceId: input.referenceId,
                            createdBy: input.createdBy,
                            createdAt: now
                        })];
                case 1:
                    // 1. Insert the journal entry header
                    _e.sent();
                    _i = 0, _c = input.lines;
                    _e.label = 2;
                case 2:
                    if (!(_i < _c.length)) return [3 /*break*/, 10];
                    line = _c[_i];
                    return [4 /*yield*/, database.insert(schema_1.journalEntryLines).values({
                            id: uuid_1.v4(),
                            journalEntryId: entryId,
                            accountId: line.accountId,
                            debit: line.debit,
                            credit: line.credit,
                            description: (_a = line.description) !== null && _a !== void 0 ? _a : null,
                            createdAt: now
                        })];
                case 3:
                    _e.sent();
                    delta = line.debit - line.credit;
                    if (!(delta !== 0)) return [3 /*break*/, 9];
                    _e.label = 4;
                case 4:
                    _e.trys.push([4, 8, , 9]);
                    return [4 /*yield*/, database
                            .select({ balance: schema_1.accounts.balance })
                            .from(schema_1.accounts)
                            .where(drizzle_orm_1.eq(schema_1.accounts.id, line.accountId))
                            .limit(1)];
                case 5:
                    rows = _e.sent();
                    if (!rows.length) return [3 /*break*/, 7];
                    return [4 /*yield*/, database
                            .update(schema_1.accounts)
                            .set({ balance: ((_b = rows[0].balance) !== null && _b !== void 0 ? _b : 0) + delta })
                            .where(drizzle_orm_1.eq(schema_1.accounts.id, line.accountId))];
                case 6:
                    _e.sent();
                    _e.label = 7;
                case 7: return [3 /*break*/, 9];
                case 8:
                    _d = _e.sent();
                    return [3 /*break*/, 9];
                case 9:
                    _i++;
                    return [3 /*break*/, 2];
                case 10: return [2 /*return*/, entryId];
            }
        });
    });
}
exports.postJournalEntry = postJournalEntry;
