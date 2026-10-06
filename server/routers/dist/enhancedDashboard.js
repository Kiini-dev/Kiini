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
exports.enhancedDashboardRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
// Zod schemas for validation
var DashboardWidgetSchema = zod_1.z.object({
    id: zod_1.z.string(),
    widgetType: zod_1.z.string(),
    widgetTitle: zod_1.z.string().optional(),
    widgetSize: zod_1.z["enum"](["small", "medium", "large"])["default"]("medium"),
    rowIndex: zod_1.z.number()["default"](0),
    colIndex: zod_1.z.number()["default"](0),
    refreshInterval: zod_1.z.number()["default"](300),
    config: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional()
});
var DashboardLayoutSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    name: zod_1.z.string()["default"]("My Dashboard"),
    description: zod_1.z.string().optional(),
    gridColumns: zod_1.z.number().min(4).max(12)["default"](6),
    isDefault: zod_1.z.boolean()["default"](false),
    widgets: zod_1.z.array(DashboardWidgetSchema)["default"]([])
});
exports.enhancedDashboardRouter = trpc_1.router({
    /**
     * Get user's default dashboard layout
     */
    getDefault: trpc_1.createFeatureRestrictedProcedure("dashboard:view").query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, layout;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.dashboardLayouts)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.dashboardLayouts.userId, ctx.user.id), drizzle_orm_1.eq(schema_1.dashboardLayouts.isDefault, 1)))
                                .limit(1)];
                    case 2:
                        layout = _b.sent();
                        if (!layout || layout.length === 0)
                            return [2 /*return*/, null];
                        return [2 /*return*/, formatLayoutResponse(layout[0], db)];
                }
            });
        });
    }),
    /**
     * Get specific dashboard layout by ID
     */
    getLayout: trpc_1.createFeatureRestrictedProcedure("dashboard:view")
        .input(zod_1.z.string())
        .query(function (_a) {
        var layoutId = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, layout;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.dashboardLayouts)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.dashboardLayouts.id, layoutId), drizzle_orm_1.eq(schema_1.dashboardLayouts.userId, ctx.user.id)))
                                .limit(1)];
                    case 2:
                        layout = _b.sent();
                        if (!layout || layout.length === 0)
                            return [2 /*return*/, null];
                        return [2 /*return*/, formatLayoutResponse(layout[0], db)];
                }
            });
        });
    }),
    /**
     * List all dashboard layouts for current user
     */
    listLayouts: trpc_1.createFeatureRestrictedProcedure("dashboard:view").query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, layouts;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.dashboardLayouts)
                                .where(drizzle_orm_1.eq(schema_1.dashboardLayouts.userId, ctx.user.id))];
                    case 2:
                        layouts = _b.sent();
                        return [2 /*return*/, Promise.all(layouts.map(function (l) { return formatLayoutResponse(l, db); }))];
                }
            });
        });
    }),
    /**
     * Create new dashboard layout
     */
    createLayout: trpc_1.createFeatureRestrictedProcedure("dashboard:edit")
        .input(DashboardLayoutSchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, layoutId, _i, _b, widget, widgetId;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            throw new Error("Database not available");
                        layoutId = uuid_1.v4();
                        if (!input.isDefault) return [3 /*break*/, 3];
                        return [4 /*yield*/, db
                                .update(schema_1.dashboardLayouts)
                                .set({ isDefault: 0 })
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.dashboardLayouts.userId, ctx.user.id), drizzle_orm_1.eq(schema_1.dashboardLayouts.isDefault, 1)))];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3: 
                    // Create layout
                    return [4 /*yield*/, db.insert(schema_1.dashboardLayouts).values({
                            id: layoutId,
                            userId: ctx.user.id,
                            name: input.name,
                            description: input.description,
                            gridColumns: input.gridColumns,
                            isDefault: input.isDefault ? 1 : 0,
                            layoutData: {},
                            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        })];
                    case 4:
                        // Create layout
                        _c.sent();
                        _i = 0, _b = input.widgets || [];
                        _c.label = 5;
                    case 5:
                        if (!(_i < _b.length)) return [3 /*break*/, 8];
                        widget = _b[_i];
                        widgetId = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_1.dashboardWidgets).values({
                                id: widgetId,
                                layoutId: layoutId,
                                widgetType: widget.widgetType,
                                widgetTitle: widget.widgetTitle,
                                widgetSize: widget.widgetSize,
                                rowIndex: widget.rowIndex,
                                colIndex: widget.colIndex,
                                refreshInterval: widget.refreshInterval,
                                config: widget.config || {},
                                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 6:
                        _c.sent();
                        _c.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 5];
                    case 8: return [2 /*return*/, { id: layoutId, success: true }];
                }
            });
        });
    }),
    /**
     * Update dashboard layout
     */
    updateLayout: trpc_1.createFeatureRestrictedProcedure("dashboard:edit")
        .input(zod_1.z.object(__assign({ id: zod_1.z.string() }, DashboardLayoutSchema.shape)))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, layout, _i, _b, widget, widgetId;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            throw new Error("Database not available");
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.dashboardLayouts)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.dashboardLayouts.id, input.id), drizzle_orm_1.eq(schema_1.dashboardLayouts.userId, ctx.user.id)))];
                    case 2:
                        layout = _c.sent();
                        if (!layout || layout.length === 0) {
                            throw new Error("Layout not found");
                        }
                        if (!input.isDefault) return [3 /*break*/, 4];
                        return [4 /*yield*/, db
                                .update(schema_1.dashboardLayouts)
                                .set({ isDefault: 0 })
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.dashboardLayouts.userId, ctx.user.id), drizzle_orm_1.eq(schema_1.dashboardLayouts.isDefault, 1)))];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4: 
                    // Update layout
                    return [4 /*yield*/, db
                            .update(schema_1.dashboardLayouts)
                            .set({
                            name: input.name,
                            description: input.description,
                            gridColumns: input.gridColumns,
                            isDefault: input.isDefault ? 1 : 0,
                            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        })
                            .where(drizzle_orm_1.eq(schema_1.dashboardLayouts.id, input.id))];
                    case 5:
                        // Update layout
                        _c.sent();
                        // Remove old widgets and add new ones
                        return [4 /*yield*/, db["delete"](schema_1.dashboardWidgets)
                                .where(drizzle_orm_1.eq(schema_1.dashboardWidgets.layoutId, input.id))];
                    case 6:
                        // Remove old widgets and add new ones
                        _c.sent();
                        _i = 0, _b = input.widgets || [];
                        _c.label = 7;
                    case 7:
                        if (!(_i < _b.length)) return [3 /*break*/, 10];
                        widget = _b[_i];
                        widgetId = widget.id || uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_1.dashboardWidgets).values({
                                id: widgetId,
                                layoutId: input.id,
                                widgetType: widget.widgetType,
                                widgetTitle: widget.widgetTitle,
                                widgetSize: widget.widgetSize,
                                rowIndex: widget.rowIndex,
                                colIndex: widget.colIndex,
                                refreshInterval: widget.refreshInterval,
                                config: widget.config || {},
                                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 8:
                        _c.sent();
                        _c.label = 9;
                    case 9:
                        _i++;
                        return [3 /*break*/, 7];
                    case 10: return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    /**
     * Delete dashboard layout
     */
    deleteLayout: trpc_1.createFeatureRestrictedProcedure("dashboard:edit")
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, layout, allLayouts;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.dashboardLayouts)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.dashboardLayouts.id, input), drizzle_orm_1.eq(schema_1.dashboardLayouts.userId, ctx.user.id)))];
                    case 2:
                        layout = _b.sent();
                        if (!layout || layout.length === 0) {
                            throw new Error("Layout not found");
                        }
                        if (!layout[0].isDefault) return [3 /*break*/, 4];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.dashboardLayouts)
                                .where(drizzle_orm_1.eq(schema_1.dashboardLayouts.userId, ctx.user.id))];
                    case 3:
                        allLayouts = _b.sent();
                        if (allLayouts.length === 1) {
                            throw new Error("Cannot delete the only layout");
                        }
                        _b.label = 4;
                    case 4: 
                    // Delete layout (cascade deletes widgets)
                    return [4 /*yield*/, db["delete"](schema_1.dashboardLayouts)
                            .where(drizzle_orm_1.eq(schema_1.dashboardLayouts.id, input))];
                    case 5:
                        // Delete layout (cascade deletes widgets)
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    /**
     * Add widget to layout
     */
    addWidget: trpc_1.createFeatureRestrictedProcedure("dashboard:edit")
        .input(zod_1.z.object({
        layoutId: zod_1.z.string(),
        widget: DashboardWidgetSchema
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, layout, widgetId;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.dashboardLayouts)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.dashboardLayouts.id, input.layoutId), drizzle_orm_1.eq(schema_1.dashboardLayouts.userId, ctx.user.id)))];
                    case 2:
                        layout = _b.sent();
                        if (!layout || layout.length === 0) {
                            throw new Error("Layout not found");
                        }
                        widgetId = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_1.dashboardWidgets).values({
                                id: widgetId,
                                layoutId: input.layoutId,
                                widgetType: input.widget.widgetType,
                                widgetTitle: input.widget.widgetTitle,
                                widgetSize: input.widget.widgetSize,
                                rowIndex: input.widget.rowIndex,
                                colIndex: input.widget.colIndex,
                                refreshInterval: input.widget.refreshInterval,
                                config: input.widget.config || {},
                                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { id: widgetId, success: true }];
                }
            });
        });
    }),
    /**
     * Remove widget from layout
     */
    removeWidget: trpc_1.createFeatureRestrictedProcedure("dashboard:edit")
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var widgetId = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, widget, layoutId, layout;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.dashboardWidgets)
                                .where(drizzle_orm_1.eq(schema_1.dashboardWidgets.id, widgetId))];
                    case 2:
                        widget = _b.sent();
                        if (!widget || widget.length === 0) {
                            throw new Error("Widget not found");
                        }
                        layoutId = widget[0].layoutId;
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.dashboardLayouts)
                                .where(drizzle_orm_1.eq(schema_1.dashboardLayouts.id, layoutId))];
                    case 3:
                        layout = _b.sent();
                        if (!layout || layout[0].userId !== ctx.user.id) {
                            throw new Error("Unauthorized");
                        }
                        return [4 /*yield*/, db["delete"](schema_1.dashboardWidgets).where(drizzle_orm_1.eq(schema_1.dashboardWidgets.id, widgetId))];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    /**
     * Update widget position and config
     */
    updateWidget: trpc_1.createFeatureRestrictedProcedure("dashboard:edit")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        rowIndex: zod_1.z.number().optional(),
        colIndex: zod_1.z.number().optional(),
        widgetSize: zod_1.z["enum"](["small", "medium", "large"]).optional(),
        config: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, widget, layoutId, layout, updateData;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.dashboardWidgets)
                                .where(drizzle_orm_1.eq(schema_1.dashboardWidgets.id, input.id))];
                    case 2:
                        widget = _b.sent();
                        if (!widget || widget.length === 0) {
                            throw new Error("Widget not found");
                        }
                        layoutId = widget[0].layoutId;
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.dashboardLayouts)
                                .where(drizzle_orm_1.eq(schema_1.dashboardLayouts.id, layoutId))];
                    case 3:
                        layout = _b.sent();
                        if (!layout || layout[0].userId !== ctx.user.id) {
                            throw new Error("Unauthorized");
                        }
                        updateData = {
                            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        };
                        if (input.rowIndex !== undefined)
                            updateData.rowIndex = input.rowIndex;
                        if (input.colIndex !== undefined)
                            updateData.colIndex = input.colIndex;
                        if (input.widgetSize)
                            updateData.widgetSize = input.widgetSize;
                        if (input.config)
                            updateData.config = input.config;
                        return [4 /*yield*/, db
                                .update(schema_1.dashboardWidgets)
                                .set(updateData)
                                .where(drizzle_orm_1.eq(schema_1.dashboardWidgets.id, input.id))];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    /**
     * Cache widget data (for performance)
     */
    cacheWidgetData: trpc_1.createFeatureRestrictedProcedure("dashboard:edit")
        .input(zod_1.z.object({
        widgetId: zod_1.z.string(),
        dataKey: zod_1.z.string(),
        dataValue: zod_1.z.any(),
        expiresIn: zod_1.z.number()["default"](300)
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, expiresAt;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        id = uuid_1.v4();
                        expiresAt = new Date(Date.now() + input.expiresIn * 1000);
                        return [4 /*yield*/, db.insert(schema_1.dashboardWidgetData).values({
                                id: id,
                                widgetId: input.widgetId,
                                dataKey: input.dataKey,
                                dataValue: input.dataValue,
                                cachedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                expiresAt: expiresAt.toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    /**
     * Get cached widget data
     */
    getCachedData: trpc_1.createFeatureRestrictedProcedure("dashboard:view")
        .input(zod_1.z.object({
        widgetId: zod_1.z.string(),
        dataKey: zod_1.z.string().optional()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, query, data, now;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        query = db
                            .select()
                            .from(schema_1.dashboardWidgetData)
                            .where(drizzle_orm_1.eq(schema_1.dashboardWidgetData.widgetId, input.widgetId));
                        if (input.dataKey) {
                            query = query.where(drizzle_orm_1.eq(schema_1.dashboardWidgetData.dataKey, input.dataKey));
                        }
                        return [4 /*yield*/, query];
                    case 2:
                        data = _b.sent();
                        now = new Date();
                        return [2 /*return*/, data
                                .filter(function (d) { return !d.expiresAt || new Date(d.expiresAt) > now; })
                                .map(function (d) { return ({
                                key: d.dataKey,
                                value: d.dataValue,
                                cachedAt: d.cachedAt
                            }); })];
                }
            });
        });
    })
});
/**
 * Format layout response with widgets
 */
function formatLayoutResponse(layout, db) {
    return __awaiter(this, void 0, void 0, function () {
        var widgets;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db
                        .select()
                        .from(schema_1.dashboardWidgets)
                        .where(drizzle_orm_1.eq(schema_1.dashboardWidgets.layoutId, layout.id))];
                case 1:
                    widgets = _a.sent();
                    return [2 /*return*/, {
                            id: layout.id,
                            name: layout.name,
                            description: layout.description,
                            gridColumns: layout.gridColumns,
                            isDefault: !!layout.isDefault,
                            widgets: widgets.map(function (w) { return ({
                                id: w.id,
                                widgetType: w.widgetType,
                                widgetTitle: w.widgetTitle,
                                widgetSize: w.widgetSize,
                                rowIndex: w.rowIndex,
                                colIndex: w.colIndex,
                                refreshInterval: w.refreshInterval,
                                config: w.config
                            }); }),
                            createdAt: layout.createdAt,
                            updatedAt: layout.updatedAt
                        }];
            }
        });
    });
}
