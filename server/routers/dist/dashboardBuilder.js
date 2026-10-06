"use strict";
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
exports.dashboardBuilderRouter = void 0;
/**
 * Dashboard Builder Router - DB-backed
 */
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var dashboardViewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure('dashboards:view');
var dashboardEditProcedure = enhancedRbac_1.createFeatureRestrictedProcedure('dashboards:edit');
exports.dashboardBuilderRouter = trpc_1.router({
    createDashboard: dashboardEditProcedure
        .input(zod_1.z.object({ name: zod_1.z.string(), description: zod_1.z.string().optional(), layout: zod_1.z["enum"](['grid', 'flex', 'column']), isPublic: zod_1.z.boolean().optional() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        db = db_1.getDb();
                        id = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_1.customDashboards).values({ id: id, name: input.name, description: input.description || null, layout: input.layout, widgets: JSON.stringify([]), isPublic: input.isPublic ? 1 : 0, createdBy: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || 'system' })];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, { success: true, dashboardId: id, name: input.name, createdAt: new Date(), status: 'active', widgetCount: 0 }];
                }
            });
        });
    }),
    addWidgetToDashboard: dashboardEditProcedure
        .input(zod_1.z.object({ dashboardId: zod_1.z.string(), type: zod_1.z["enum"](['metric', 'chart', 'table', 'gauge', 'heatmap']), config: zod_1.z.object({ title: zod_1.z.string(), dataSource: zod_1.z.string(), refreshInterval: zod_1.z.number().optional(), height: zod_1.z.number().optional(), width: zod_1.z.number().optional() }) }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rows, dash, widgets, widgetId;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        db = db_1.getDb();
                        return [4 /*yield*/, db.select().from(schema_1.customDashboards).where(drizzle_orm_1.eq(schema_1.customDashboards.id, input.dashboardId))];
                    case 1:
                        rows = _b.sent();
                        dash = rows[0];
                        widgets = (dash === null || dash === void 0 ? void 0 : dash.widgets) ? JSON.parse(dash.widgets) : [];
                        widgetId = uuid_1.v4();
                        widgets.push(__assign({ id: widgetId, type: input.type }, input.config));
                        return [4 /*yield*/, db.update(schema_1.customDashboards).set({ widgets: JSON.stringify(widgets) }).where(drizzle_orm_1.eq(schema_1.customDashboards.id, input.dashboardId))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true, widgetId: widgetId, dashboardId: input.dashboardId, type: input.type, addedAt: new Date() }];
                }
            });
        });
    }),
    getDashboardWidgets: dashboardViewProcedure
        .input(zod_1.z.object({ dashboardId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rows, dash, widgets;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        db = db_1.getDb();
                        return [4 /*yield*/, db.select().from(schema_1.customDashboards).where(drizzle_orm_1.eq(schema_1.customDashboards.id, input.dashboardId))];
                    case 1:
                        rows = _b.sent();
                        dash = rows[0];
                        if (!dash)
                            return [2 /*return*/, { dashboardId: input.dashboardId, widgets: [], total: 0 }];
                        widgets = dash.widgets ? JSON.parse(dash.widgets) : [];
                        return [2 /*return*/, { dashboardId: input.dashboardId, widgets: widgets, total: widgets.length }];
                }
            });
        });
    }),
    shareDashboard: dashboardEditProcedure
        .input(zod_1.z.object({ dashboardId: zod_1.z.string(), sharedWith: zod_1.z.array(zod_1.z.string()), permission: zod_1.z["enum"](['view', 'edit']), expiresAt: zod_1.z.string().optional() }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        db = db_1.getDb();
                        return [4 /*yield*/, db.update(schema_1.customDashboards).set({ sharedWith: JSON.stringify({ users: input.sharedWith, permission: input.permission, expiresAt: input.expiresAt }) }).where(drizzle_orm_1.eq(schema_1.customDashboards.id, input.dashboardId))];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, { success: true, dashboardId: input.dashboardId, sharedWith: input.sharedWith.length }];
                }
            });
        });
    }),
    listDashboards: dashboardViewProcedure
        .input(zod_1.z.object({ limit: zod_1.z.number()["default"](50) }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        db = db_1.getDb();
                        return [4 /*yield*/, db.select().from(schema_1.customDashboards).orderBy(drizzle_orm_1.desc(schema_1.customDashboards.createdAt)).limit(input.limit)];
                    case 1:
                        rows = _b.sent();
                        return [2 /*return*/, { dashboards: rows.map(function (r) { return (__assign(__assign({}, r), { widgets: r.widgets ? JSON.parse(r.widgets) : [], sharedWith: r.sharedWith ? JSON.parse(r.sharedWith) : null })); }), total: rows.length }];
                }
            });
        });
    }),
    deleteDashboard: dashboardEditProcedure
        .input(zod_1.z.object({ dashboardId: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        db = db_1.getDb();
                        return [4 /*yield*/, db["delete"](schema_1.customDashboards).where(drizzle_orm_1.eq(schema_1.customDashboards.id, input.dashboardId))];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, { success: true, deletedId: input.dashboardId }];
                }
            });
        });
    })
});
