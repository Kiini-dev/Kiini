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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
exports.workflowsRouter = void 0;
var trpc_1 = require("../_core/trpc");
var db_1 = require("../db");
var zod_1 = require("zod");
var server_1 = require("@trpc/server");
var drizzle_orm_1 = require("drizzle-orm");
var schema_1 = require("../../drizzle/schema");
var readProcedure = trpc_1.createFeatureRestrictedProcedure("tools:workflows");
var writeProcedure = trpc_1.createFeatureRestrictedProcedure("tools:automation");
// ============================================
// VALIDATION SCHEMAS
// ============================================
var createWorkflowSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Workflow name required"),
    description: zod_1.z.string().optional(),
    triggerType: zod_1.z["enum"]([
        "invoice_created",
        "invoice_paid",
        "invoice_overdue",
        "payment_received",
        "opportunity_moved",
        "task_completed",
        "project_milestone_reached",
        "reminder_time",
    ]),
    triggerCondition: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    actions: zod_1.z.array(zod_1.z.object({
        actionType: zod_1.z["enum"]([
            "send_email",
            "create_task",
            "update_status",
            "send_notification",
            "create_follow_up",
            "add_invoice",
            "update_field",
            "create_reminder",
        ]),
        actionName: zod_1.z.string(),
        actionTarget: zod_1.z.string().optional(),
        actionData: zod_1.z.record(zod_1.z.string(), zod_1.z.any()),
        delayMinutes: zod_1.z.number()["default"](0),
        sequence: zod_1.z.number()["default"](1)
    })),
    isRecurring: zod_1.z.boolean()["default"](false)
});
var updateWorkflowSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    status: zod_1.z["enum"](["active", "inactive", "draft"]).optional(),
    actions: zod_1.z
        .array(zod_1.z.object({
        actionType: zod_1.z["enum"]([
            "send_email",
            "create_task",
            "update_status",
            "send_notification",
            "create_follow_up",
            "add_invoice",
            "update_field",
            "create_reminder",
        ]),
        actionName: zod_1.z.string(),
        actionTarget: zod_1.z.string().optional(),
        actionData: zod_1.z.record(zod_1.z.string(), zod_1.z.any()),
        delayMinutes: zod_1.z.number()["default"](0),
        sequence: zod_1.z.number()["default"](1)
    }))
        .optional()
});
// ============================================
// WORKFLOW ROUTER
// ============================================
exports.workflowsRouter = trpc_1.router({
    // CreatcreateFeatureRestrictedProcedure("workflows:create")
    create: writeProcedure
        .input(createWorkflowSchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, workflowId, actionTypes, newWorkflow, _i, _b, action, actionId, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            throw new Error("Database not available");
                        workflowId = "wf_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
                        actionTypes = input.actions.map(function (a) { return a.actionType; });
                        return [4 /*yield*/, db.insert(schema_1.workflows).values({
                                id: workflowId,
                                name: input.name,
                                description: input.description,
                                status: "draft",
                                triggerType: input.triggerType,
                                triggerCondition: JSON.stringify(input.triggerCondition || {}),
                                actionTypes: JSON.stringify(actionTypes),
                                isRecurring: input.isRecurring ? 1 : 0,
                                createdBy: ctx.userId,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString()
                            })];
                    case 2:
                        newWorkflow = _c.sent();
                        _i = 0, _b = input.actions;
                        _c.label = 3;
                    case 3:
                        if (!(_i < _b.length)) return [3 /*break*/, 6];
                        action = _b[_i];
                        actionId = "wfaction_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
                        return [4 /*yield*/, db.insert(schema_1.workflowActions).values({
                                id: actionId,
                                workflowId: workflowId,
                                actionType: action.actionType,
                                actionName: action.actionName,
                                actionTarget: action.actionTarget,
                                actionData: JSON.stringify(action.actionData),
                                delayMinutes: action.delayMinutes,
                                sequence: action.sequence,
                                isActive: 1,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString()
                            })];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [2 /*return*/, { success: true, workflowId: workflowId }];
                    case 7:
                        error_1 = _c.sent();
                        console.error("[WORKFLOWS] create error:", error_1);
                        if (error_1 instanceof server_1.TRPCError)
                            throw error_1;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to create workflow"
                        });
                    case 8: return [2 /*return*/];
                }
            });
        });
    }),
    // LiscreateFeatureRestrictedProcedure("workflows:read")
    list: readProcedure
        .input(zod_1.z.object({
        search: zod_1.z.string().optional(),
        status: zod_1.z["enum"](["active", "inactive", "draft"]).optional(),
        limit: zod_1.z.number()["default"](50),
        offset: zod_1.z.number()["default"](0)
    }).optional())
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, allWorkflows, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, { workflows: [], total: 0 }];
                    return [4 /*yield*/, db.select().from(schema_1.workflows)];
                case 2:
                    allWorkflows = _a.sent();
                    return [2 /*return*/, {
                            workflows: allWorkflows,
                            total: allWorkflows.length
                        }];
                case 3:
                    error_2 = _a.sent();
                    console.error("[WORKFLOWS] list error:", error_2);
                    return [2 /*return*/, { workflows: [], total: 0 }];
                case 4: return [2 /*return*/];
            }
        });
    }); }),
    // Get wocreateFeatureRestrictedProcedure("workflows:read")h actions
    getById: readProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, workflow, actions, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.workflows)
                                .where(drizzle_orm_1.eq(schema_1.workflows.id, input))
                                .limit(1)];
                    case 2:
                        workflow = _b.sent();
                        if (!workflow.length) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Workflow not found"
                            });
                        }
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.workflowActions)
                                .where(drizzle_orm_1.eq(schema_1.workflowActions.workflowId, input))];
                    case 3:
                        actions = _b.sent();
                        return [2 /*return*/, __assign(__assign({}, workflow[0]), { triggerCondition: JSON.parse(workflow[0].triggerCondition || "{}"), actionTypes: JSON.parse(workflow[0].actionTypes || "[]"), actions: actions.map(function (a) { return (__assign(__assign({}, a), { actionData: JSON.parse(a.actionData) })); }) })];
                    case 4:
                        error_3 = _b.sent();
                        console.error("[WORKFLOWS] getById error:", error_3);
                        if (error_3 instanceof server_1.TRPCError)
                            throw error_3;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to fetch workflow"
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    // UpdatcreateFeatureRestrictedProcedure("workflows:edit")
    update: writeProcedure
        .input(updateWorkflowSchema)
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, actions, updateData, _i, actions_1, action, actionId, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 8, , 9]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        id = input.id, actions = input.actions, updateData = __rest(input, ["id", "actions"]);
                        // Update workflow
                        return [4 /*yield*/, db
                                .update(schema_1.workflows)
                                .set(__assign(__assign({}, updateData), { updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) }))
                                .where(drizzle_orm_1.eq(schema_1.workflows.id, id))];
                    case 2:
                        // Update workflow
                        _b.sent();
                        if (!actions) return [3 /*break*/, 7];
                        // Delete existing actions
                        return [4 /*yield*/, db["delete"](schema_1.workflowActions)
                                .where(drizzle_orm_1.eq(schema_1.workflowActions.workflowId, id))];
                    case 3:
                        // Delete existing actions
                        _b.sent();
                        _i = 0, actions_1 = actions;
                        _b.label = 4;
                    case 4:
                        if (!(_i < actions_1.length)) return [3 /*break*/, 7];
                        action = actions_1[_i];
                        actionId = "wfaction_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
                        return [4 /*yield*/, db.insert(schema_1.workflowActions).values({
                                id: actionId,
                                workflowId: id,
                                actionType: action.actionType,
                                actionName: action.actionName,
                                actionTarget: action.actionTarget,
                                actionData: JSON.stringify(action.actionData),
                                delayMinutes: action.delayMinutes,
                                sequence: action.sequence,
                                isActive: 1,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString()
                            })];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7: return [2 /*return*/, { success: true }];
                    case 8:
                        error_4 = _b.sent();
                        console.error("[WORKFLOWS] update error:", error_4);
                        if (error_4 instanceof server_1.TRPCError)
                            throw error_4;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to update workflow"
                        });
                    case 9: return [2 /*return*/];
                }
            });
        });
    }),
    // DeletcreateFeatureRestrictedProcedure("workflows:delete")
    "delete": writeProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        // Delete actions first
                        return [4 /*yield*/, db["delete"](schema_1.workflowActions)
                                .where(drizzle_orm_1.eq(schema_1.workflowActions.workflowId, input))];
                    case 2:
                        // Delete actions first
                        _b.sent();
                        // Delete triggers
                        return [4 /*yield*/, db["delete"](schema_1.workflowTriggers)
                                .where(drizzle_orm_1.eq(schema_1.workflowTriggers.workflowId, input))];
                    case 3:
                        // Delete triggers
                        _b.sent();
                        // Delete workflow
                        return [4 /*yield*/, db["delete"](schema_1.workflows).where(drizzle_orm_1.eq(schema_1.workflows.id, input))];
                    case 4:
                        // Delete workflow
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 5:
                        error_5 = _b.sent();
                        console.error("[WORKFLOWS] delete error:", error_5);
                        if (error_5 instanceof server_1.TRPCError)
                            throw error_5;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to delete workflow"
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    // Get execution histcreateFeatureRestrictedProcedure("workflows:read")
    getExecutionHistory: readProcedure
        .input(zod_1.z.object({
        workflowId: zod_1.z.string(),
        limit: zod_1.z.number()["default"](50),
        offset: zod_1.z.number()["default"](0)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, executions, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { executions: [], total: 0 }];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.workflowExecutions)
                                .where(drizzle_orm_1.eq(schema_1.workflowExecutions.workflowId, input.workflowId))
                                .orderBy(drizzle_orm_1.desc(schema_1.workflowExecutions.createdAt))
                                .limit(input.limit)
                                .offset(input.offset)];
                    case 2:
                        executions = _b.sent();
                        return [2 /*return*/, {
                                executions: executions.map(function (e) { return (__assign(__assign({}, e), { triggerData: JSON.parse(e.triggerData || "{}"), executionLog: JSON.parse(e.executionLog || "[]") })); }),
                                total: executions.length
                            }];
                    case 3:
                        error_6 = _b.sent();
                        console.error("[WORKFLOWS] getExecutionHistory error:", error_6);
                        return [2 /*return*/, { executions: [], total: 0 }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    // Execute workflcreateFeatureRestrictedProcedure("workflows:execute")
    executeManually: writeProcedure
        .input(zod_1.z.object({
        workflowId: zod_1.z.string(),
        entityType: zod_1.z.string(),
        entityId: zod_1.z.string(),
        triggerData: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, workflow, executionId, executionLog, actions, _i, actions_2, action, actionData, execError_1, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 10, , 11]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.workflows)
                                .where(drizzle_orm_1.eq(schema_1.workflows.id, input.workflowId))
                                .limit(1)];
                    case 2:
                        workflow = _b.sent();
                        if (!workflow.length) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Workflow not found"
                            });
                        }
                        executionId = "exec_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
                        executionLog = [];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 7, , 9]);
                        // Create execution record
                        return [4 /*yield*/, db.insert(schema_1.workflowExecutions).values({
                                id: executionId,
                                workflowId: input.workflowId,
                                entityType: input.entityType,
                                entityId: input.entityId,
                                status: "running",
                                triggerData: JSON.stringify(input.triggerData || {}),
                                executionLog: JSON.stringify(executionLog)
                            })];
                    case 4:
                        // Create execution record
                        _b.sent();
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.workflowActions)
                                .where(drizzle_orm_1.eq(schema_1.workflowActions.workflowId, input.workflowId))
                                .orderBy(schema_1.workflowActions.sequence)];
                    case 5:
                        actions = _b.sent();
                        // Execute each action
                        for (_i = 0, actions_2 = actions; _i < actions_2.length; _i++) {
                            action = actions_2[_i];
                            actionData = JSON.parse(action.actionData || "{}");
                            executionLog.push({
                                actionId: action.id,
                                actionType: action.actionType,
                                status: "completed",
                                timestamp: new Date().toISOString(),
                                result: action.actionName + " executed successfully"
                            });
                        }
                        // Update execution as completed
                        return [4 /*yield*/, db
                                .update(schema_1.workflowExecutions)
                                .set({
                                status: "completed",
                                executedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                completedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                executionLog: JSON.stringify(executionLog)
                            })
                                .where(drizzle_orm_1.eq(schema_1.workflowExecutions.id, executionId))];
                    case 6:
                        // Update execution as completed
                        _b.sent();
                        return [2 /*return*/, { success: true, executionId: executionId }];
                    case 7:
                        execError_1 = _b.sent();
                        // Update execution as failed
                        return [4 /*yield*/, db
                                .update(schema_1.workflowExecutions)
                                .set({
                                status: "failed",
                                errorMessage: String(execError_1),
                                executionLog: JSON.stringify(executionLog)
                            })
                                .where(drizzle_orm_1.eq(schema_1.workflowExecutions.id, executionId))];
                    case 8:
                        // Update execution as failed
                        _b.sent();
                        throw execError_1;
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        error_7 = _b.sent();
                        console.error("[WORKFLOWS] executeManually error:", error_7);
                        if (error_7 instanceof server_1.TRPCError)
                            throw error_7;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to execute workflow"
                        });
                    case 11: return [2 /*return*/];
                }
            });
        });
    }),
    // Toggle workcreateFeatureRestrictedProcedure("workflows:edit")
    toggleStatus: writeProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        status: zod_1.z["enum"](["active", "inactive", "draft"])
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        return [4 /*yield*/, db
                                .update(schema_1.workflows)
                                .set({ status: input.status })
                                .where(drizzle_orm_1.eq(schema_1.workflows.id, input.id))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 3:
                        error_8 = _b.sent();
                        console.error("[WORKFLOWS] toggleStatus error:", error_8);
                        if (error_8 instanceof server_1.TRPCError)
                            throw error_8;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to update workflow status"
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    // Get workflocreateFeatureRestrictedProcedure("workflows:read")efined workflows)
    getTemplates: readProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, {
                    templates: [
                        {
                            id: "template_auto_follow_up",
                            name: "Auto Follow-up on Overdue Invoices",
                            description: "Automatically send reminders for overdue invoices",
                            triggerType: "invoice_overdue",
                            actions: [
                                {
                                    actionType: "send_email",
                                    actionName: "Send Overdue Reminder",
                                    actionTarget: "client",
                                    actionData: {
                                        subject: "Payment Reminder: Invoice {{invoiceNumber}}",
                                        template: "overdue_reminder"
                                    }
                                },
                                {
                                    actionType: "create_task",
                                    actionName: "Follow-up Task",
                                    actionTarget: "sales",
                                    actionData: {
                                        title: "Follow up on invoice {{invoiceNumber}}",
                                        priority: "high"
                                    },
                                    delayMinutes: 1440
                                },
                            ]
                        },
                        {
                            id: "template_auto_invoice",
                            name: "Auto Generate Invoice on Milestone",
                            description: "Automatically create invoice when project milestone is reached",
                            triggerType: "project_milestone_reached",
                            actions: [
                                {
                                    actionType: "add_invoice",
                                    actionName: "Create Milestone Invoice",
                                    actionTarget: "accounting",
                                    actionData: {
                                        invoiceType: "milestone",
                                        includeExpenses: true
                                    }
                                },
                                {
                                    actionType: "send_notification",
                                    actionName: "Notify Finance Team",
                                    actionTarget: "finance",
                                    actionData: {
                                        message: "Invoice created for milestone {{milestoneId}}"
                                    }
                                },
                            ]
                        },
                        {
                            id: "template_deal_won",
                            name: "Deal Won Follow-up",
                            description: "Automate follow-up when a deal is won",
                            triggerType: "opportunity_moved",
                            actions: [
                                {
                                    actionType: "send_email",
                                    actionName: "Send Thank You Email",
                                    actionTarget: "client",
                                    actionData: {
                                        template: "deal_won_thank_you"
                                    }
                                },
                                {
                                    actionType: "create_task",
                                    actionName: "Schedule Implementation Kickoff",
                                    actionTarget: "operations",
                                    actionData: {
                                        title: "Kickoff meeting for {{clientName}}",
                                        dueDate: "in 7 days"
                                    }
                                },
                                {
                                    actionType: "create_follow_up",
                                    actionName: "Set Followup Invoice",
                                    actionTarget: "accounting",
                                    actionData: {
                                        type: "recurring",
                                        frequency: "monthly"
                                    }
                                },
                            ]
                        },
                    ]
                }];
        });
    }); })
});
