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
exports.disciplinaryRouter = void 0;
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
exports.disciplinaryRouter = trpc_1.router({
    list: readProc
        .input(zod_1.z.object({
        employeeId: zod_1.z.string().optional(),
        type: zod_1.z.string().optional(),
        status: zod_1.z.string().optional()
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
                            conds.push("d.employeeId = ?");
                            params.push(input.employeeId);
                        }
                        if (input === null || input === void 0 ? void 0 : input.type) {
                            conds.push("d.type = ?");
                            params.push(input.type);
                        }
                        if (input === null || input === void 0 ? void 0 : input.status) {
                            conds.push("d.status = ?");
                            params.push(input.status);
                        }
                        where = conds.length ? "WHERE " + conds.join(" AND ") : "";
                        return [4 /*yield*/, pool().query("SELECT d.*, CONCAT(e.firstName, ' ', e.lastName) as employeeName,\n            CONCAT(i.firstName, ' ', i.lastName) as issuedByName\n           FROM disciplinaryRecords d\n           LEFT JOIN employees e ON d.employeeId = e.id\n           LEFT JOIN employees i ON d.issuedBy = i.id\n           " + where + " ORDER BY d.incidentDate DESC", params)];
                    case 1:
                        rows = (_b.sent())[0];
                        return [2 /*return*/, rows];
                    case 2:
                        err_1 = _b.sent();
                        console.error("disciplinary.list error", err_1);
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
                    case 0: return [4 /*yield*/, pool().query("SELECT d.*, CONCAT(e.firstName, ' ', e.lastName) as employeeName\n       FROM disciplinaryRecords d LEFT JOIN employees e ON d.employeeId = e.id\n       WHERE d.id = ? LIMIT 1", [input])];
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
        type: zod_1.z["enum"](["verbal_warning", "written_warning", "final_warning", "suspension", "termination", "counseling"]),
        reason: zod_1.z.string(),
        description: zod_1.z.string().optional(),
        incidentDate: zod_1.z.string(),
        actionTaken: zod_1.z.string().optional(),
        followUpDate: zod_1.z.string().optional(),
        witnessName: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var id;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        id = uuid_1.v4();
                        return [4 /*yield*/, pool().query("INSERT INTO disciplinaryRecords (id, employeeId, type, reason, description, incidentDate, actionTaken, followUpDate, witnessName, issuedBy, status)\n         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')", [id, input.employeeId, input.type, input.reason, input.description || null, input.incidentDate, input.actionTaken || null, input.followUpDate || null, input.witnessName || null, ctx.user.id])];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, db_1.logActivity({ userId: ctx.user.id, action: 'disciplinary_created', entityType: 'disciplinary', entityId: id, description: "Created " + input.type + " for employee " + input.employeeId })];
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
        type: zod_1.z["enum"](["verbal_warning", "written_warning", "final_warning", "suspension", "termination", "counseling"]).optional(),
        reason: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        actionTaken: zod_1.z.string().optional(),
        followUpDate: zod_1.z.string().optional(),
        outcome: zod_1.z.string().optional(),
        status: zod_1.z["enum"](["open", "acknowledged", "resolved", "escalated", "appealed"]).optional()
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
                        if (input.type) {
                            sets.push("type = ?");
                            params.push(input.type);
                        }
                        if (input.reason) {
                            sets.push("reason = ?");
                            params.push(input.reason);
                        }
                        if (input.description !== undefined) {
                            sets.push("description = ?");
                            params.push(input.description);
                        }
                        if (input.actionTaken !== undefined) {
                            sets.push("actionTaken = ?");
                            params.push(input.actionTaken);
                        }
                        if (input.followUpDate !== undefined) {
                            sets.push("followUpDate = ?");
                            params.push(input.followUpDate || null);
                        }
                        if (input.outcome !== undefined) {
                            sets.push("outcome = ?");
                            params.push(input.outcome);
                        }
                        if (input.status) {
                            sets.push("status = ?");
                            params.push(input.status);
                        }
                        if (!sets.length)
                            return [2 /*return*/, { success: true }];
                        params.push(input.id);
                        return [4 /*yield*/, pool().query("UPDATE disciplinaryRecords SET " + sets.join(", ") + " WHERE id = ?", params)];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, db_1.logActivity({ userId: ctx.user.id, action: 'disciplinary_updated', entityType: 'disciplinary', entityId: input.id, description: "Updated disciplinary record " + input.id })];
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
                    case 0: return [4 /*yield*/, pool().query("DELETE FROM disciplinaryRecords WHERE id = ?", [input])];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, db_1.logActivity({ userId: ctx.user.id, action: 'disciplinary_deleted', entityType: 'disciplinary', entityId: input, description: "Deleted disciplinary record " + input })];
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
                    return [4 /*yield*/, pool().query("\n        SELECT \n          COUNT(*) as total,\n          SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,\n          SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,\n          SUM(CASE WHEN type = 'verbal_warning' THEN 1 ELSE 0 END) as verbalWarnings,\n          SUM(CASE WHEN type = 'written_warning' THEN 1 ELSE 0 END) as writtenWarnings,\n          SUM(CASE WHEN type = 'suspension' THEN 1 ELSE 0 END) as suspensions\n        FROM disciplinaryRecords\n      ")];
                case 1:
                    rows = (_b.sent())[0];
                    r = rows[0];
                    return [2 /*return*/, { total: Number(r.total || 0), open: Number(r.open || 0), resolved: Number(r.resolved || 0), verbalWarnings: Number(r.verbalWarnings || 0), writtenWarnings: Number(r.writtenWarnings || 0), suspensions: Number(r.suspensions || 0) }];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, { total: 0, open: 0, resolved: 0, verbalWarnings: 0, writtenWarnings: 0, suspensions: 0 }];
                case 3: return [2 /*return*/];
            }
        });
    }); })
});
