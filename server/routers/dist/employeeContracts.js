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
exports.employeeContractsRouter = void 0;
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
exports.employeeContractsRouter = trpc_1.router({
    list: readProc
        .input(zod_1.z.object({
        employeeId: zod_1.z.string().optional(),
        status: zod_1.z.string().optional(),
        contractType: zod_1.z.string().optional()
    }).optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var conds, params, where, rows, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        conds = [];
                        params = [];
                        if (input === null || input === void 0 ? void 0 : input.employeeId) {
                            conds.push("c.employeeId = ?");
                            params.push(input.employeeId);
                        }
                        if (input === null || input === void 0 ? void 0 : input.status) {
                            conds.push("c.status = ?");
                            params.push(input.status);
                        }
                        if (input === null || input === void 0 ? void 0 : input.contractType) {
                            conds.push("c.contractType = ?");
                            params.push(input.contractType);
                        }
                        where = conds.length ? "WHERE " + conds.join(" AND ") : "";
                        return [4 /*yield*/, pool().query("SELECT c.*, CONCAT(e.firstName, ' ', e.lastName) as employeeName\n           FROM employeeContracts c\n           LEFT JOIN employees e ON c.employeeId = e.id\n           " + where + " ORDER BY c.createdAt DESC", params)];
                    case 1:
                        rows = (_b.sent())[0];
                        return [2 /*return*/, rows];
                    case 2:
                        err_1 = _b.sent();
                        console.error("employeeContracts.list error", err_1);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    getById: readProc.input(zod_1.z.string()).query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, pool().query("SELECT c.*, CONCAT(e.firstName, ' ', e.lastName) as employeeName\n       FROM employeeContracts c LEFT JOIN employees e ON c.employeeId = e.id\n       WHERE c.id = ? LIMIT 1", [input])];
                    case 1:
                        rows = (_b.sent())[0];
                        return [2 /*return*/, rows[0] || null];
                }
            });
        });
    }),
    create: writeProc
        .input(zod_1.z.object({
        employeeId: zod_1.z.string(),
        contractType: zod_1.z["enum"](["permanent", "fixed_term", "probation", "casual", "internship"]),
        title: zod_1.z.string().optional(),
        startDate: zod_1.z.string(),
        endDate: zod_1.z.string().optional(),
        salary: zod_1.z.number().optional(),
        currency: zod_1.z.string().optional(),
        terms: zod_1.z.string().optional(),
        renewalDate: zod_1.z.string().optional(),
        noticePeriod: zod_1.z.number().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var id;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        id = uuid_1.v4();
                        return [4 /*yield*/, pool().query("INSERT INTO employeeContracts (id, employeeId, contractType, title, startDate, endDate, salary, currency, terms, renewalDate, noticePeriod, status, createdBy)\n         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)", [id, input.employeeId, input.contractType, input.title || null, input.startDate, input.endDate || null, input.salary || null, input.currency || 'KES', input.terms || null, input.renewalDate || null, input.noticePeriod || 30, ctx.user.id])];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, db_1.logActivity({ userId: ctx.user.id, action: 'contract_created', entityType: 'employeeContract', entityId: id, description: "Created contract for employee " + input.employeeId })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { id: id }];
                }
            });
        });
    }),
    update: writeProc
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        contractType: zod_1.z["enum"](["permanent", "fixed_term", "probation", "casual", "internship"]).optional(),
        title: zod_1.z.string().optional(),
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional(),
        salary: zod_1.z.number().optional(),
        terms: zod_1.z.string().optional(),
        renewalDate: zod_1.z.string().optional(),
        noticePeriod: zod_1.z.number().optional(),
        status: zod_1.z["enum"](["active", "expired", "terminated", "renewed", "pending"]).optional()
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
                        if (input.contractType) {
                            sets.push("contractType = ?");
                            params.push(input.contractType);
                        }
                        if (input.title !== undefined) {
                            sets.push("title = ?");
                            params.push(input.title);
                        }
                        if (input.startDate) {
                            sets.push("startDate = ?");
                            params.push(input.startDate);
                        }
                        if (input.endDate !== undefined) {
                            sets.push("endDate = ?");
                            params.push(input.endDate || null);
                        }
                        if (input.salary !== undefined) {
                            sets.push("salary = ?");
                            params.push(input.salary);
                        }
                        if (input.terms !== undefined) {
                            sets.push("terms = ?");
                            params.push(input.terms);
                        }
                        if (input.renewalDate !== undefined) {
                            sets.push("renewalDate = ?");
                            params.push(input.renewalDate || null);
                        }
                        if (input.noticePeriod !== undefined) {
                            sets.push("noticePeriod = ?");
                            params.push(input.noticePeriod);
                        }
                        if (input.status) {
                            sets.push("status = ?");
                            params.push(input.status);
                        }
                        if (!sets.length)
                            return [2 /*return*/, { success: true }];
                        params.push(input.id);
                        return [4 /*yield*/, pool().query("UPDATE employeeContracts SET " + sets.join(", ") + " WHERE id = ?", params)];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, db_1.logActivity({ userId: ctx.user.id, action: 'contract_updated', entityType: 'employeeContract', entityId: input.id, description: "Updated contract " + input.id })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    "delete": writeProc.input(zod_1.z.string()).mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, pool().query("DELETE FROM employeeContracts WHERE id = ?", [input])];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, db_1.logActivity({ userId: ctx.user.id, action: 'contract_deleted', entityType: 'employeeContract', entityId: input, description: "Deleted contract " + input })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    stats: readProc.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var rows, r, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, pool().query("\n        SELECT \n          COUNT(*) as total,\n          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,\n          SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expired,\n          SUM(CASE WHEN endDate IS NOT NULL AND endDate <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND status = 'active' THEN 1 ELSE 0 END) as expiringSoon\n        FROM employeeContracts\n      ")];
                case 1:
                    rows = (_b.sent())[0];
                    r = rows[0];
                    return [2 /*return*/, { total: Number(r.total || 0), active: Number(r.active || 0), expired: Number(r.expired || 0), expiringSoon: Number(r.expiringSoon || 0) }];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, { total: 0, active: 0, expired: 0, expiringSoon: 0 }];
                case 3: return [2 /*return*/];
            }
        });
    }); })
});
