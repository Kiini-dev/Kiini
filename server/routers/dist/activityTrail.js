"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
exports.activityTrailRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var drizzle_orm_1 = require("drizzle-orm");
exports.activityTrailRouter = trpc_1.router({
    list: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().min(1).max(200).optional()["default"](50),
        offset: zod_1.z.number().min(0).optional()["default"](0),
        page: zod_1.z.number().min(1).optional(),
        userId: zod_1.z.number().optional(),
        entityType: zod_1.z.string().optional(),
        action: zod_1.z.string().optional(),
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional(),
        search: zod_1.z.string().optional()
    }).optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, params, limit, offset, conditions, whereClause, rows, countResult, total, activities, err_1;
            var _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _g.sent();
                        params = input || {};
                        limit = (_b = params.limit) !== null && _b !== void 0 ? _b : 50;
                        offset = params.page ? (params.page - 1) * limit : ((_c = params.offset) !== null && _c !== void 0 ? _c : 0);
                        _g.label = 2;
                    case 2:
                        _g.trys.push([2, 5, , 6]);
                        conditions = [];
                        if (params.userId)
                            conditions.push(drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["userId = ", ""], ["userId = ", ""])), params.userId));
                        if (params.entityType)
                            conditions.push(drizzle_orm_1.sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["entityType = ", ""], ["entityType = ", ""])), params.entityType));
                        if (params.action)
                            conditions.push(drizzle_orm_1.sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["action = ", ""], ["action = ", ""])), params.action));
                        if (params.search)
                            conditions.push(drizzle_orm_1.sql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["description LIKE ", ""], ["description LIKE ", ""])), "%" + params.search + "%"));
                        if (params.startDate)
                            conditions.push(drizzle_orm_1.sql(templateObject_5 || (templateObject_5 = __makeTemplateObject(["createdAt >= ", ""], ["createdAt >= ", ""])), params.startDate));
                        if (params.endDate)
                            conditions.push(drizzle_orm_1.sql(templateObject_6 || (templateObject_6 = __makeTemplateObject(["createdAt <= ", ""], ["createdAt <= ", ""])), params.endDate));
                        whereClause = conditions.length > 0
                            ? drizzle_orm_1.sql(templateObject_8 || (templateObject_8 = __makeTemplateObject(["WHERE ", ""], ["WHERE ", ""])), drizzle_orm_1.sql.join(conditions, drizzle_orm_1.sql(templateObject_7 || (templateObject_7 = __makeTemplateObject([" AND "], [" AND "]))))) : drizzle_orm_1.sql(templateObject_9 || (templateObject_9 = __makeTemplateObject([""], [""])));
                        return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_10 || (templateObject_10 = __makeTemplateObject(["SELECT * FROM activityLog ", " ORDER BY createdAt DESC LIMIT ", " OFFSET ", ""], ["SELECT * FROM activityLog ", " ORDER BY createdAt DESC LIMIT ", " OFFSET ", ""])), whereClause, limit, offset))];
                    case 3:
                        rows = (_g.sent())[0];
                        return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_11 || (templateObject_11 = __makeTemplateObject(["SELECT COUNT(*) as total FROM activityLog ", ""], ["SELECT COUNT(*) as total FROM activityLog ", ""])), whereClause))];
                    case 4:
                        countResult = (_g.sent())[0];
                        total = (_f = (_e = (_d = countResult) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.total) !== null && _f !== void 0 ? _f : 0;
                        activities = (rows || []).map(function (row) { return (__assign(__assign({}, row), { timestamp: row.createdAt })); });
                        return [2 /*return*/, { activities: activities, total: total }];
                    case 5:
                        err_1 = _g.sent();
                        console.error('activityTrail.list error:', err_1);
                        return [2 /*return*/, { activities: [], total: 0 }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    getStats: trpc_1.protectedProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, actionRows, actionStats, summaryRows, summary, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _c.sent();
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_12 || (templateObject_12 = __makeTemplateObject(["SELECT action, COUNT(*) as count FROM activityLog GROUP BY action ORDER BY count DESC LIMIT 10"], ["SELECT action, COUNT(*) as count FROM activityLog GROUP BY action ORDER BY count DESC LIMIT 10"]))))];
                case 3:
                    actionRows = (_c.sent())[0];
                    actionStats = actionRows || [];
                    return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_13 || (templateObject_13 = __makeTemplateObject(["SELECT COUNT(*) as totalActivities, COUNT(DISTINCT userId) as uniqueUsers FROM activityLog"], ["SELECT COUNT(*) as totalActivities, COUNT(DISTINCT userId) as uniqueUsers FROM activityLog"]))))];
                case 4:
                    summaryRows = (_c.sent())[0];
                    summary = ((_b = summaryRows) === null || _b === void 0 ? void 0 : _b[0]) || {};
                    return [2 /*return*/, {
                            actions: actionStats,
                            totalActivities: Number(summary.totalActivities || 0),
                            successCount: Number(summary.totalActivities || 0),
                            failedCount: 0,
                            uniqueUsers: Number(summary.uniqueUsers || 0)
                        }];
                case 5:
                    _a = _c.sent();
                    return [2 /*return*/, { actions: [], totalActivities: 0, successCount: 0, failedCount: 0, uniqueUsers: 0 }];
                case 6: return [2 /*return*/];
            }
        });
    }); }),
    getEntityTypes: trpc_1.protectedProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, rows, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _b.sent();
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_14 || (templateObject_14 = __makeTemplateObject(["SELECT DISTINCT entityType FROM activityLog WHERE entityType IS NOT NULL ORDER BY entityType"], ["SELECT DISTINCT entityType FROM activityLog WHERE entityType IS NOT NULL ORDER BY entityType"]))))];
                case 3:
                    rows = (_b.sent())[0];
                    return [2 /*return*/, (rows || []).map(function (r) { return r.entityType; }).filter(Boolean)];
                case 4:
                    _a = _b.sent();
                    return [2 /*return*/, [
                            "invoice", "payment", "client", "employee",
                            "project", "expense", "report", "system",
                            "user", "payroll", "leave", "attendance",
                        ]];
                case 5: return [2 /*return*/];
            }
        });
    }); }),
    getActions: trpc_1.protectedProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, rows, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _b.sent();
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_15 || (templateObject_15 = __makeTemplateObject(["SELECT DISTINCT action FROM activityLog ORDER BY action"], ["SELECT DISTINCT action FROM activityLog ORDER BY action"]))))];
                case 3:
                    rows = (_b.sent())[0];
                    return [2 /*return*/, (rows || []).map(function (r) { return r.action; }).filter(Boolean)];
                case 4:
                    _a = _b.sent();
                    return [2 /*return*/, [
                            "created", "updated", "deleted", "approved",
                            "rejected", "exported", "login", "logout",
                            "sent", "viewed", "printed",
                        ]];
                case 5: return [2 /*return*/];
            }
        });
    }); })
});
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11, templateObject_12, templateObject_13, templateObject_14, templateObject_15;
