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
exports.advancedAutomationRouter = void 0;
/**
 * Advanced Automation Engine Router - DB-backed
 */
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var automationViewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure('automation:view');
var automationEditProcedure = enhancedRbac_1.createFeatureRestrictedProcedure('automation:edit');
exports.advancedAutomationRouter = trpc_1.router({
    createSmartWorkflow: automationEditProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string(),
        trigger: zod_1.z.object({ type: zod_1.z["enum"](['time', 'event', 'condition']), config: zod_1.z.record(zod_1.z.any()) }),
        actions: zod_1.z.array(zod_1.z.object({ type: zod_1.z.string(), config: zod_1.z.record(zod_1.z.any()) })),
        conditions: zod_1.z.array(zod_1.z.object({ field: zod_1.z.string(), operator: zod_1.z.string(), value: zod_1.z.any() })).optional()
    }))
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
                        return [4 /*yield*/, db.insert(schema_1.smartWorkflows).values({
                                id: id,
                                name: input.name,
                                triggerType: input.trigger.type,
                                triggerConfig: JSON.stringify(input.trigger.config),
                                actions: JSON.stringify(input.actions),
                                conditions: input.conditions ? JSON.stringify(input.conditions) : null,
                                status: 'active',
                                executionCount: 0,
                                createdBy: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || 'system'
                            })];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, { success: true, workflowId: id, name: input.name, status: 'active', createdAt: new Date(), executionCount: 0 }];
                }
            });
        });
    }),
    getWorkflowExecutionHistory: automationViewProcedure
        .input(zod_1.z.object({ workflowId: zod_1.z.string(), limit: zod_1.z.number().max(100).optional() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rows, wf;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        db = db_1.getDb();
                        return [4 /*yield*/, db.select().from(schema_1.smartWorkflows).where(drizzle_orm_1.eq(schema_1.smartWorkflows.id, input.workflowId))];
                    case 1:
                        rows = _b.sent();
                        wf = rows[0];
                        if (!wf)
                            return [2 /*return*/, { workflowId: input.workflowId, executions: [], totalExecutions: 0 }];
                        return [2 /*return*/, { workflowId: input.workflowId, executions: [], totalExecutions: wf.executionCount, lastExecuted: wf.lastExecuted, status: wf.status }];
                }
            });
        });
    }),
    listWorkflows: automationViewProcedure
        .input(zod_1.z.object({ limit: zod_1.z.number()["default"](50) }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        db = db_1.getDb();
                        return [4 /*yield*/, db.select().from(schema_1.smartWorkflows).orderBy(drizzle_orm_1.desc(schema_1.smartWorkflows.createdAt)).limit(input.limit)];
                    case 1:
                        rows = _b.sent();
                        return [2 /*return*/, {
                                workflows: rows.map(function (r) { return (__assign(__assign({}, r), { triggerConfig: r.triggerConfig ? JSON.parse(r.triggerConfig) : null, actions: r.actions ? JSON.parse(r.actions) : [], conditions: r.conditions ? JSON.parse(r.conditions) : [] })); }),
                                total: rows.length
                            }];
                }
            });
        });
    }),
    deleteWorkflow: automationEditProcedure
        .input(zod_1.z.object({ workflowId: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        db = db_1.getDb();
                        return [4 /*yield*/, db["delete"](schema_1.smartWorkflows).where(drizzle_orm_1.eq(schema_1.smartWorkflows.id, input.workflowId))];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, { success: true, deletedId: input.workflowId }];
                }
            });
        });
    })
});
