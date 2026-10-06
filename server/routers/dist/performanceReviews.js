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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.performanceReviewsRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var uuid_1 = require("uuid");
var server_1 = require("@trpc/server");
var checkModuleAccess_1 = require("../modules/checkModuleAccess");
function pool() {
    var p = db_1.getPool();
    if (!p)
        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    return p;
}
var readProcedure = trpc_1.createFeatureRestrictedProcedure("hr:view");
var writeProcedure = trpc_1.createFeatureRestrictedProcedure("hr:edit");
exports.performanceReviewsRouter = trpc_1.router({
    list: readProcedure
        .input(zod_1.z.object({
        employeeId: zod_1.z.string().optional(),
        reviewerId: zod_1.z.string().optional(),
        status: zod_1.z.string().optional(),
        limit: zod_1.z.number().optional(),
        offset: zod_1.z.number().optional()
    }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var conditions, params, where, limit, offset, rows, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, checkModuleAccess_1.checkModuleAccess(ctx, 'hr')];
                    case 1:
                        _b.sent();
                        conditions = [];
                        params = [];
                        if (input === null || input === void 0 ? void 0 : input.employeeId) {
                            conditions.push("pr.employeeId = ?");
                            params.push(input.employeeId);
                        }
                        if (input === null || input === void 0 ? void 0 : input.reviewerId) {
                            conditions.push("pr.reviewerId = ?");
                            params.push(input.reviewerId);
                        }
                        if (input === null || input === void 0 ? void 0 : input.status) {
                            conditions.push("pr.status = ?");
                            params.push(input.status);
                        }
                        where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";
                        limit = (input === null || input === void 0 ? void 0 : input.limit) || 100;
                        offset = (input === null || input === void 0 ? void 0 : input.offset) || 0;
                        return [4 /*yield*/, pool().query("SELECT pr.*, \n            CONCAT(e.firstName, ' ', e.lastName) as employeeName,\n            CONCAT(r.firstName, ' ', r.lastName) as reviewerName\n           FROM performanceReviews pr\n           LEFT JOIN employees e ON pr.employeeId = e.id\n           LEFT JOIN employees r ON pr.reviewerId = r.id\n           " + where + " ORDER BY pr.createdAt DESC LIMIT ? OFFSET ?", __spreadArrays(params, [limit, offset]))];
                    case 2:
                        rows = (_b.sent())[0];
                        return [2 /*return*/, rows];
                    case 3:
                        err_1 = _b.sent();
                        console.error('Error listing performance reviews', err_1);
                        throw err_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    getById: readProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, checkModuleAccess_1.checkModuleAccess(ctx, 'hr')];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, pool().query("SELECT pr.*, \n          CONCAT(e.firstName, ' ', e.lastName) as employeeName,\n          CONCAT(r.firstName, ' ', r.lastName) as reviewerName\n         FROM performanceReviews pr\n         LEFT JOIN employees e ON pr.employeeId = e.id\n         LEFT JOIN employees r ON pr.reviewerId = r.id\n         WHERE pr.id = ? LIMIT 1", [input])];
                    case 2:
                        rows = (_b.sent())[0];
                        return [2 /*return*/, rows[0] || null];
                }
            });
        });
    }),
    create: writeProcedure
        .input(zod_1.z.object({
        employeeId: zod_1.z.string(),
        reviewerId: zod_1.z.string(),
        overallRating: zod_1.z.number().min(1).max(5).optional(),
        comments: zod_1.z.string().optional(),
        goals: zod_1.z.string().optional(),
        status: zod_1.z["enum"](["draft", "in_progress", "completed", "archived"]).optional(),
        reviewDate: zod_1.z.date().optional(),
        period: zod_1.z.string().optional(),
        strengths: zod_1.z.string().optional(),
        improvements: zod_1.z.string().optional(),
        kpiScore: zod_1.z.number().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var id, now;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, checkModuleAccess_1.checkModuleAccess(ctx, 'hr')];
                    case 1:
                        _d.sent();
                        id = uuid_1.v4();
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, pool().query("INSERT INTO performanceReviews (id, employeeId, reviewerId, overallRating, comments, goals, status, period, reviewDate, strengths, improvements, kpiScore, createdAt, updatedAt)\n         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [id, input.employeeId, input.reviewerId, (_b = input.overallRating) !== null && _b !== void 0 ? _b : 0, input.comments || null, input.goals || null, input.status || 'draft', input.period || new Date().getFullYear().toString(), input.reviewDate ? input.reviewDate.toISOString().replace('T', ' ').substring(0, 19) : now, input.strengths || null, input.improvements || null, (_c = input.kpiScore) !== null && _c !== void 0 ? _c : null, now, now])];
                    case 2:
                        _d.sent();
                        return [4 /*yield*/, db_1.logActivity({ userId: ctx.user.id, action: 'performance_review_created', entityType: 'performanceReview', entityId: id, description: "Created performance review for " + input.employeeId })];
                    case 3:
                        _d.sent();
                        return [2 /*return*/, { id: id }];
                }
            });
        });
    }),
    update: writeProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        overallRating: zod_1.z.number().min(1).max(5).optional(),
        comments: zod_1.z.string().optional(),
        goals: zod_1.z.string().optional(),
        status: zod_1.z["enum"](["draft", "in_progress", "completed", "archived"]).optional(),
        reviewDate: zod_1.z.date().optional(),
        strengths: zod_1.z.string().optional(),
        improvements: zod_1.z.string().optional(),
        kpiScore: zod_1.z.number().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var sets, params;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, checkModuleAccess_1.checkModuleAccess(ctx, 'hr')];
                    case 1:
                        _b.sent();
                        sets = ["updatedAt = ?"];
                        params = [new Date().toISOString().replace('T', ' ').substring(0, 19)];
                        if (input.overallRating !== undefined) {
                            sets.push("overallRating = ?");
                            params.push(input.overallRating);
                        }
                        if (input.comments !== undefined) {
                            sets.push("comments = ?");
                            params.push(input.comments);
                        }
                        if (input.goals !== undefined) {
                            sets.push("goals = ?");
                            params.push(input.goals);
                        }
                        if (input.status !== undefined) {
                            sets.push("status = ?");
                            params.push(input.status);
                        }
                        if (input.reviewDate !== undefined) {
                            sets.push("reviewDate = ?");
                            params.push(input.reviewDate.toISOString().replace('T', ' ').substring(0, 19));
                        }
                        if (input.strengths !== undefined) {
                            sets.push("strengths = ?");
                            params.push(input.strengths);
                        }
                        if (input.improvements !== undefined) {
                            sets.push("improvements = ?");
                            params.push(input.improvements);
                        }
                        if (input.kpiScore !== undefined) {
                            sets.push("kpiScore = ?");
                            params.push(input.kpiScore);
                        }
                        params.push(input.id);
                        return [4 /*yield*/, pool().query("UPDATE performanceReviews SET " + sets.join(", ") + " WHERE id = ?", params)];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, db_1.logActivity({ userId: ctx.user.id, action: 'performance_review_updated', entityType: 'performanceReview', entityId: input.id, description: "Updated performance review " + input.id })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    "delete": writeProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, checkModuleAccess_1.checkModuleAccess(ctx, 'hr')];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, pool().query("DELETE FROM performanceReviews WHERE id = ?", [input])];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, db_1.logActivity({ userId: ctx.user.id, action: 'performance_review_deleted', entityType: 'performanceReview', entityId: input, description: "Deleted performance review " + input })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    stats: readProcedure
        .query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var rows, r, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, checkModuleAccess_1.checkModuleAccess(ctx, 'hr')];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, pool().query("\n          SELECT \n            COUNT(*) as total,\n            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,\n            SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as inProgress,\n            SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,\n            AVG(overallRating) as avgRating\n          FROM performanceReviews\n        ")];
                    case 2:
                        rows = (_c.sent())[0];
                        r = rows[0];
                        return [2 /*return*/, { total: Number(r.total || 0), completed: Number(r.completed || 0), inProgress: Number(r.inProgress || 0), draft: Number(r.draft || 0), avgRating: Number(r.avgRating || 0) }];
                    case 3:
                        _b = _c.sent();
                        return [2 /*return*/, { total: 0, completed: 0, inProgress: 0, draft: 0, avgRating: 0 }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    })
});
