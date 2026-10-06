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
exports.workflowTriggerEngine = void 0;
var db_1 = require("../db");
var drizzle_orm_1 = require("drizzle-orm");
var schema_1 = require("../../drizzle/schema");
var actionExecutor_1 = require("./actionExecutor");
// ============================================
// TRIGGER ENGINE
// ============================================
var WorkflowTriggerEngine = /** @class */ (function () {
    function WorkflowTriggerEngine() {
    }
    /**
     * Triggers workflows based on an event
     * Finds all active workflows with matching trigger type and executes them
     */
    WorkflowTriggerEngine.prototype.trigger = function (event) {
        return __awaiter(this, void 0, Promise, function () {
            var db, matchingWorkflows, activeWorkflows, results, _i, activeWorkflows_1, workflow, result, error_1, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 9, , 10]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _a.sent();
                        if (!db) {
                            console.warn("[TRIGGER_ENGINE] Database not available");
                            return [2 /*return*/, []];
                        }
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.workflows)
                                .where(drizzle_orm_1.eq(schema_1.workflows.triggerType, event.triggerType))];
                    case 2:
                        matchingWorkflows = _a.sent();
                        activeWorkflows = matchingWorkflows.filter(function (w) { return w.status === "active"; });
                        if (activeWorkflows.length === 0) {
                            console.log("[TRIGGER_ENGINE] No active workflows for trigger: " + event.triggerType);
                            return [2 /*return*/, []];
                        }
                        results = [];
                        _i = 0, activeWorkflows_1 = activeWorkflows;
                        _a.label = 3;
                    case 3:
                        if (!(_i < activeWorkflows_1.length)) return [3 /*break*/, 8];
                        workflow = activeWorkflows_1[_i];
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.executeWorkflow(db, workflow, event)];
                    case 5:
                        result = _a.sent();
                        results.push(result);
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        console.error("[TRIGGER_ENGINE] Error executing workflow " + workflow.id + ":", error_1);
                        results.push({
                            executionId: "exec_error_" + Date.now(),
                            workflowId: workflow.id,
                            status: "failed",
                            executionLog: [],
                            errorMessage: String(error_1)
                        });
                        return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 3];
                    case 8: return [2 /*return*/, results];
                    case 9:
                        error_2 = _a.sent();
                        console.error("[TRIGGER_ENGINE] Error in trigger:", error_2);
                        return [2 /*return*/, []];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute a single workflow
     */
    WorkflowTriggerEngine.prototype.executeWorkflow = function (db, workflow, event) {
        return __awaiter(this, void 0, Promise, function () {
            var executionId, executionLog, actions, sortedActions, _i, sortedActions_1, action, actionData, actionResult, actionError_1, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        executionId = "exec_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
                        executionLog = [];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 11, , 13]);
                        // Create execution record
                        return [4 /*yield*/, db.insert(schema_1.workflowExecutions).values({
                                id: executionId,
                                workflowId: workflow.id,
                                entityType: event.entityType,
                                entityId: event.entityId,
                                status: "running",
                                triggerData: JSON.stringify(event.data),
                                executionLog: JSON.stringify(executionLog),
                                executedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 2:
                        // Create execution record
                        _a.sent();
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.workflowActions)
                                .where(drizzle_orm_1.eq(schema_1.workflowActions.workflowId, workflow.id))];
                    case 3:
                        actions = _a.sent();
                        sortedActions = actions.sort(function (a, b) { return a.sequence - b.sequence; });
                        _i = 0, sortedActions_1 = sortedActions;
                        _a.label = 4;
                    case 4:
                        if (!(_i < sortedActions_1.length)) return [3 /*break*/, 9];
                        action = sortedActions_1[_i];
                        if (!action.isActive) {
                            console.log("[TRIGGER_ENGINE] Skipping inactive action: " + action.id);
                            return [3 /*break*/, 8];
                        }
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 7, , 8]);
                        actionData = JSON.parse(action.actionData || "{}");
                        return [4 /*yield*/, this.executeAction(db, action.actionType, actionData, event)];
                    case 6:
                        actionResult = _a.sent();
                        executionLog.push({
                            actionId: action.id,
                            actionType: action.actionType,
                            actionName: action.actionName,
                            status: "completed",
                            timestamp: new Date().toISOString(),
                            result: actionResult
                        });
                        return [3 /*break*/, 8];
                    case 7:
                        actionError_1 = _a.sent();
                        console.error("[TRIGGER_ENGINE] Error executing action " + action.id + ":", actionError_1);
                        executionLog.push({
                            actionId: action.id,
                            actionType: action.actionType,
                            actionName: action.actionName,
                            status: "failed",
                            timestamp: new Date().toISOString(),
                            error: String(actionError_1)
                        });
                        return [3 /*break*/, 8];
                    case 8:
                        _i++;
                        return [3 /*break*/, 4];
                    case 9: 
                    // Update execution as completed
                    return [4 /*yield*/, db
                            .update(schema_1.workflowExecutions)
                            .set({
                            status: "completed",
                            completedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                            executionLog: JSON.stringify(executionLog)
                        })
                            .where(drizzle_orm_1.eq(schema_1.workflowExecutions.id, executionId))];
                    case 10:
                        // Update execution as completed
                        _a.sent();
                        return [2 /*return*/, {
                                executionId: executionId,
                                workflowId: workflow.id,
                                status: "completed",
                                executionLog: executionLog
                            }];
                    case 11:
                        error_3 = _a.sent();
                        console.error("[TRIGGER_ENGINE] Workflow execution failed:", error_3);
                        // Update execution as failed
                        return [4 /*yield*/, db
                                .update(schema_1.workflowExecutions)
                                .set({
                                status: "failed",
                                errorMessage: String(error_3),
                                executionLog: JSON.stringify(executionLog)
                            })
                                .where(drizzle_orm_1.eq(schema_1.workflowExecutions.id, executionId))];
                    case 12:
                        // Update execution as failed
                        _a.sent();
                        return [2 /*return*/, {
                                executionId: executionId,
                                workflowId: workflow.id,
                                status: "failed",
                                executionLog: executionLog,
                                errorMessage: String(error_3)
                            }];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute a single action - delegates to actionExecutor module
     */
    WorkflowTriggerEngine.prototype.executeAction = function (db, actionType, actionData, event) {
        return __awaiter(this, void 0, Promise, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, actionExecutor_1.executeAction(actionType, actionData, {
                            entityType: event.entityType,
                            entityId: event.entityId,
                            triggerData: event.data,
                            userId: event.userId
                        })];
                    case 1:
                        result = _a.sent();
                        // Return message for logging - format as string for execution log
                        return [2 /*return*/, result.success
                                ? result.message
                                : result.message + " (Error: " + result.error + ")"];
                }
            });
        });
    };
    return WorkflowTriggerEngine;
}());
// Export singleton instance
exports.workflowTriggerEngine = new WorkflowTriggerEngine();
