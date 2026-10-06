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
exports.imprestSurrenderRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_extended_1 = require("../../drizzle/schema-extended");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var readProcedure = trpc_1.createFeatureRestrictedProcedure("procurement:imprest:view");
var writeProcedure = trpc_1.createFeatureRestrictedProcedure("procurement:imprest:edit");
/**
 * Generate next imprest surrender number
 * Example: "IMPS-000001", "IMPS-000002"
 */
function generateNextSurrenderNumber(db) {
    return __awaiter(this, void 0, Promise, function () {
        var result, seq, match, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db.select({ num: schema_extended_1.imprestSurrenders.surrenderNumber })
                            .from(schema_extended_1.imprestSurrenders)
                            .orderBy(drizzle_orm_1.desc(schema_extended_1.imprestSurrenders.surrenderedAt))
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
                    return [2 /*return*/, "IMPS-" + String(seq).padStart(6, '0')];
                case 2:
                    err_1 = _a.sent();
                    console.warn("imprest surrender number generator error", err_1);
                    return [2 /*return*/, "IMPS-000001"];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.imprestSurrenderRouter = trpc_1.router({
    list: readProcedure
        .input(zod_1.z.object({ imprestId: zod_1.z.string().optional() }).optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, q;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        q = db.select().from(schema_extended_1.imprestSurrenders).orderBy(drizzle_orm_1.desc(schema_extended_1.imprestSurrenders.surrenderedAt));
                        if (input === null || input === void 0 ? void 0 : input.imprestId) {
                            q = q.where(drizzle_orm_1.eq(schema_extended_1.imprestSurrenders.imprestId, input.imprestId));
                        }
                        return [4 /*yield*/, q];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    create: writeProcedure
        .input(zod_1.z.object({ imprestId: zod_1.z.string(), amount: zod_1.z.number().positive(), notes: zod_1.z.string().optional() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, surrenderNumber;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("DB not available");
                        id = uuid_1.v4();
                        return [4 /*yield*/, generateNextSurrenderNumber(db)];
                    case 2:
                        surrenderNumber = _b.sent();
                        return [4 /*yield*/, db.insert(schema_extended_1.imprestSurrenders).values({
                                id: id,
                                surrenderNumber: surrenderNumber,
                                imprestId: input.imprestId,
                                amount: input.amount,
                                notes: input.notes || null,
                                surrenderedBy: ctx.user.id
                            })];
                    case 3:
                        _b.sent();
                        // mark imprest settled
                        return [4 /*yield*/, db.update(schema_extended_1.imprests)
                                .set({ status: 'settled', updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) })
                                .where(drizzle_orm_1.eq(schema_extended_1.imprests.id, input.imprestId))];
                    case 4:
                        // mark imprest settled
                        _b.sent();
                        return [2 /*return*/, { id: id }];
                }
            });
        });
    })
});
