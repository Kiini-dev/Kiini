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
exports.leaveBalancesRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var uuid_1 = require("uuid");
var server_1 = require("@trpc/server");
function pool() {
    var p = db_1.getPool();
    if (!p)
        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    return p;
}
var readProc = trpc_1.createFeatureRestrictedProcedure("hr:view");
var writeProc = trpc_1.createFeatureRestrictedProcedure("hr:edit");
exports.leaveBalancesRouter = trpc_1.router({
    list: readProc
        .input(zod_1.z.object({
        employeeId: zod_1.z.string().optional(),
        year: zod_1.z.number().optional(),
        leaveType: zod_1.z.string().optional()
    }).optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var conds, params, year, where, rows, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        conds = [];
                        params = [];
                        year = (input === null || input === void 0 ? void 0 : input.year) || new Date().getFullYear();
                        conds.push("lb.year = ?");
                        params.push(year);
                        if (input === null || input === void 0 ? void 0 : input.employeeId) {
                            conds.push("lb.employeeId = ?");
                            params.push(input.employeeId);
                        }
                        if (input === null || input === void 0 ? void 0 : input.leaveType) {
                            conds.push("lb.leaveType = ?");
                            params.push(input.leaveType);
                        }
                        where = "WHERE " + conds.join(" AND ");
                        return [4 /*yield*/, pool().query("SELECT lb.*, CONCAT(e.firstName, ' ', e.lastName) as employeeName, e.department\n           FROM leaveBalances lb\n           LEFT JOIN employees e ON lb.employeeId = e.id\n           " + where + " ORDER BY e.firstName, lb.leaveType", params)];
                    case 1:
                        rows = (_b.sent())[0];
                        return [2 /*return*/, rows];
                    case 2:
                        err_1 = _b.sent();
                        console.error("leaveBalances.list error", err_1);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    byEmployee: readProc
        .input(zod_1.z.object({ employeeId: zod_1.z.string(), year: zod_1.z.number().optional() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var year, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        year = input.year || new Date().getFullYear();
                        return [4 /*yield*/, pool().query("SELECT * FROM leaveBalances WHERE employeeId = ? AND year = ? ORDER BY leaveType", [input.employeeId, year])];
                    case 1:
                        rows = (_b.sent())[0];
                        return [2 /*return*/, rows];
                }
            });
        });
    }),
    update: writeProc
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        entitlement: zod_1.z.number().optional(),
        used: zod_1.z.number().optional(),
        pending: zod_1.z.number().optional(),
        carriedOver: zod_1.z.number().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var sets, params;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        sets = [];
                        params = [];
                        if (input.entitlement !== undefined) {
                            sets.push("entitlement = ?");
                            params.push(input.entitlement);
                        }
                        if (input.used !== undefined) {
                            sets.push("used = ?");
                            params.push(input.used);
                        }
                        if (input.pending !== undefined) {
                            sets.push("pending = ?");
                            params.push(input.pending);
                        }
                        if (input.carriedOver !== undefined) {
                            sets.push("carriedOver = ?");
                            params.push(input.carriedOver);
                        }
                        if (!sets.length)
                            return [2 /*return*/, { success: true }];
                        params.push(input.id);
                        return [4 /*yield*/, pool().query("UPDATE leaveBalances SET " + sets.join(", ") + " WHERE id = ?", params)];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, db_1.logActivity({ userId: ctx.user.id, action: 'leave_balance_updated', entityType: 'leaveBalance', entityId: input.id, description: "Updated leave balance " + input.id })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    allocate: writeProc
        .input(zod_1.z.object({
        employeeId: zod_1.z.string(),
        leaveType: zod_1.z["enum"](["annual", "sick", "maternity", "paternity", "compassionate", "unpaid", "study"]),
        year: zod_1.z.number(),
        entitlement: zod_1.z.number(),
        carriedOver: zod_1.z.number().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var id;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        id = uuid_1.v4();
                        return [4 /*yield*/, pool().query("INSERT INTO leaveBalances (id, employeeId, leaveType, year, entitlement, carriedOver)\n         VALUES (?, ?, ?, ?, ?, ?)\n         ON DUPLICATE KEY UPDATE entitlement = VALUES(entitlement), carriedOver = VALUES(carriedOver)", [id, input.employeeId, input.leaveType, input.year, input.entitlement, input.carriedOver || 0])];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, db_1.logActivity({ userId: ctx.user.id, action: 'leave_allocated', entityType: 'leaveBalance', entityId: id, description: "Allocated " + input.entitlement + " days " + input.leaveType + " leave for " + input.employeeId })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { id: id }];
                }
            });
        });
    }),
    summary: readProc
        .input(zod_1.z.object({ year: zod_1.z.number().optional() }).optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var year, rows, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        year = (input === null || input === void 0 ? void 0 : input.year) || new Date().getFullYear();
                        return [4 /*yield*/, pool().query("\n          SELECT \n            leaveType,\n            COUNT(DISTINCT employeeId) as employees,\n            SUM(entitlement) as totalEntitlement,\n            SUM(used) as totalUsed,\n            SUM(pending) as totalPending,\n            SUM(remaining) as totalRemaining\n          FROM leaveBalances\n          WHERE year = ?\n          GROUP BY leaveType\n        ", [year])];
                    case 1:
                        rows = (_c.sent())[0];
                        return [2 /*return*/, rows];
                    case 2:
                        _b = _c.sent();
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    })
});
