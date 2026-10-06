"use strict";
/**
 * Business Rules Engine Router
 *
 * Backed by the workflows / workflowTriggers / workflowActions / workflowExecutions tables.
 */
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
exports.businessRulesRouter = void 0;
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
// Feature-based procedures
var rulesViewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure('rules:view');
var rulesEditProcedure = enhancedRbac_1.createFeatureRestrictedProcedure('rules:edit');
exports.businessRulesRouter = trpc_1.router({
    /**
     * Get all business rules (workflows)
     */
    getRules: rulesViewProcedure
        .input(zod_1.z.object({
        entityType: zod_1.z.string().optional(),
        status: zod_1.z["enum"](['active', 'inactive', 'archived']).optional(),
        limit: zod_1.z.number().min(1).max(100)["default"](20),
        offset: zod_1.z.number().min(0)["default"](0)
    }).strict())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, conditions, mappedStatus, allWorkflows, _b, countResult, total, rules, activeCount, error_1;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _d.sent();
                        if (!db)
                            return [2 /*return*/, { rules: [], total: 0, offset: input.offset, limit: input.limit, activeRuleCount: 0, inactiveRuleCount: 0 }];
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 9, , 10]);
                        conditions = [];
                        if (input.status) {
                            mappedStatus = input.status === 'archived' ? 'inactive' : input.status;
                            conditions.push(drizzle_orm_1.eq(schema_1.workflows.status, mappedStatus));
                        }
                        if (!(conditions.length > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, db.select().from(schema_1.workflows).where(drizzle_orm_1.and.apply(void 0, conditions)).orderBy(drizzle_orm_1.desc(schema_1.workflows.createdAt)).limit(input.limit).offset(input.offset)];
                    case 3:
                        _b = _d.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, db.select().from(schema_1.workflows).orderBy(drizzle_orm_1.desc(schema_1.workflows.createdAt)).limit(input.limit).offset(input.offset)];
                    case 5:
                        _b = _d.sent();
                        _d.label = 6;
                    case 6:
                        allWorkflows = _b;
                        return [4 /*yield*/, db.select({ total: drizzle_orm_1.count() }).from(schema_1.workflows)];
                    case 7:
                        countResult = _d.sent();
                        total = ((_c = countResult[0]) === null || _c === void 0 ? void 0 : _c.total) || 0;
                        return [4 /*yield*/, Promise.all(allWorkflows.map(function (wf) { return __awaiter(void 0, void 0, void 0, function () {
                                var triggers, actions, executions, successExec, totalExec, successCount;
                                var _a, _b, _c;
                                return __generator(this, function (_d) {
                                    switch (_d.label) {
                                        case 0: return [4 /*yield*/, db.select().from(schema_1.workflowTriggers).where(drizzle_orm_1.eq(schema_1.workflowTriggers.workflowId, wf.id))];
                                        case 1:
                                            triggers = _d.sent();
                                            return [4 /*yield*/, db.select().from(schema_1.workflowActions).where(drizzle_orm_1.eq(schema_1.workflowActions.workflowId, wf.id))];
                                        case 2:
                                            actions = _d.sent();
                                            return [4 /*yield*/, db.select({ total: drizzle_orm_1.count() }).from(schema_1.workflowExecutions).where(drizzle_orm_1.eq(schema_1.workflowExecutions.workflowId, wf.id))];
                                        case 3:
                                            executions = _d.sent();
                                            return [4 /*yield*/, db.select({ total: drizzle_orm_1.count() }).from(schema_1.workflowExecutions).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.workflowExecutions.workflowId, wf.id), drizzle_orm_1.eq(schema_1.workflowExecutions.status, 'completed')))];
                                        case 4:
                                            successExec = _d.sent();
                                            totalExec = ((_a = executions[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
                                            successCount = ((_b = successExec[0]) === null || _b === void 0 ? void 0 : _b.total) || 0;
                                            return [2 /*return*/, {
                                                    id: wf.id,
                                                    name: wf.name,
                                                    description: wf.description || '',
                                                    entityType: ((_c = wf.triggerType) === null || _c === void 0 ? void 0 : _c.split('_')[0]) || 'general',
                                                    status: wf.status,
                                                    priority: 1,
                                                    createdBy: wf.createdBy || 'System',
                                                    createdAt: wf.createdAt ? new Date(wf.createdAt) : new Date(),
                                                    lastModified: wf.updatedAt ? new Date(wf.updatedAt) : new Date(),
                                                    triggers: triggers.map(function (t) { return t.triggerType; }),
                                                    conditions: triggers.length,
                                                    actions: actions.length,
                                                    isEnabled: wf.status === 'active',
                                                    executionCount: totalExec,
                                                    successRate: totalExec > 0 ? Math.round((successCount / totalExec) * 1000) / 10 : 100,
                                                    averageExecutionTime: 0
                                                }];
                                    }
                                });
                            }); }))];
                    case 8:
                        rules = _d.sent();
                        activeCount = allWorkflows.filter(function (w) { return w.status === 'active'; }).length;
                        return [2 /*return*/, {
                                rules: rules,
                                total: total,
                                offset: input.offset,
                                limit: input.limit,
                                activeRuleCount: activeCount,
                                inactiveRuleCount: total - activeCount
                            }];
                    case 9:
                        error_1 = _d.sent();
                        console.error('Error in getRules:', error_1);
                        return [2 /*return*/, { rules: [], total: 0, offset: input.offset, limit: input.limit, activeRuleCount: 0, inactiveRuleCount: 0 }];
                    case 10: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get rule detail with full condition and action definitions
     */
    getRuleDetail: rulesViewProcedure
        .input(zod_1.z.object({ ruleId: zod_1.z.string() }).strict())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, wf, triggers, actions, executions, totalExec, successExec;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _e.sent();
                        if (!db)
                            throw new Error('Database not available');
                        return [4 /*yield*/, db.select().from(schema_1.workflows).where(drizzle_orm_1.eq(schema_1.workflows.id, input.ruleId)).limit(1)];
                    case 2:
                        wf = _e.sent();
                        if (!wf.length)
                            throw new Error('Rule not found');
                        return [4 /*yield*/, db.select().from(schema_1.workflowTriggers).where(drizzle_orm_1.eq(schema_1.workflowTriggers.workflowId, input.ruleId))];
                    case 3:
                        triggers = _e.sent();
                        return [4 /*yield*/, db.select().from(schema_1.workflowActions).where(drizzle_orm_1.eq(schema_1.workflowActions.workflowId, input.ruleId))];
                    case 4:
                        actions = _e.sent();
                        return [4 /*yield*/, db.select().from(schema_1.workflowExecutions).where(drizzle_orm_1.eq(schema_1.workflowExecutions.workflowId, input.ruleId)).orderBy(drizzle_orm_1.desc(schema_1.workflowExecutions.executedAt)).limit(20)];
                    case 5:
                        executions = _e.sent();
                        totalExec = executions.length;
                        successExec = executions.filter(function (e) { return e.status === 'completed'; }).length;
                        return [2 /*return*/, {
                                ruleId: wf[0].id,
                                name: wf[0].name,
                                description: wf[0].description || '',
                                entityType: ((_b = wf[0].triggerType) === null || _b === void 0 ? void 0 : _b.split('_')[0]) || 'general',
                                status: wf[0].status,
                                isEnabled: wf[0].status === 'active',
                                priority: 1,
                                createdBy: wf[0].createdBy,
                                createdAt: wf[0].createdAt ? new Date(wf[0].createdAt) : new Date(),
                                lastModified: wf[0].updatedAt ? new Date(wf[0].updatedAt) : new Date(),
                                triggers: triggers.map(function (t) { return ({ id: t.triggerType, name: t.triggerType.replace(/_/g, ' ') }); }),
                                conditions: triggers.map(function (t, i) { return ({
                                    id: i + 1,
                                    field: t.triggerField || t.triggerType,
                                    fieldLabel: t.triggerField || t.triggerType,
                                    fieldType: 'string',
                                    operator: t.operator || 'equals',
                                    operatorLabel: t.operator || 'equals',
                                    value: t.triggerValue || '',
                                    joinWith: i < triggers.length - 1 ? 'AND' : null
                                }); }),
                                actions: actions.map(function (a, i) { return ({
                                    id: i + 1,
                                    type: a.actionType,
                                    typeLabel: a.actionName,
                                    field: a.actionTarget || '',
                                    fieldLabel: a.actionTarget || '',
                                    value: a.actionData || '',
                                    sequence: a.sequence || i + 1
                                }); }),
                                executionStats: {
                                    totalExecutions: totalExec,
                                    successfulExecutions: successExec,
                                    failedExecutions: totalExec - successExec,
                                    successRate: totalExec > 0 ? Math.round((successExec / totalExec) * 1000) / 10 : 100,
                                    averageExecutionTime: 0,
                                    lastExecution: ((_c = executions[0]) === null || _c === void 0 ? void 0 : _c.executedAt) ? new Date(executions[0].executedAt) : null,
                                    lastExecutionStatus: ((_d = executions[0]) === null || _d === void 0 ? void 0 : _d.status) || 'none'
                                }
                            }];
                }
            });
        });
    }),
    /**
     * Create a business rule (workflow)
     */
    createRule: rulesEditProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string().min(1).max(255),
        description: zod_1.z.string().optional(),
        entityType: zod_1.z.string(),
        triggers: zod_1.z.array(zod_1.z.string()),
        conditions: zod_1.z.array(zod_1.z.object({
            field: zod_1.z.string(),
            operator: zod_1.z.string(),
            value: zod_1.z.any(),
            joinWith: zod_1.z["enum"](['AND', 'OR']).optional()
        })),
        actions: zod_1.z.array(zod_1.z.object({
            type: zod_1.z.string(),
            field: zod_1.z.string().optional(),
            value: zod_1.z.any().optional(),
            recipient: zod_1.z.string().optional(),
            template: zod_1.z.string().optional()
        })),
        priority: zod_1.z.number().min(1).optional(),
        isEnabled: zod_1.z.boolean()["default"](true)
    }).strict())
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, workflowId, now, triggerMap, triggerType, _i, _b, cond, i, act, actionTypeMap;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _e.sent();
                        if (!db)
                            throw new Error('Database not available');
                        workflowId = uuid_1.v4();
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        triggerMap = {
                            invoice: 'invoice_created',
                            payment: 'payment_received',
                            task: 'task_completed',
                            reminder: 'reminder_time'
                        };
                        triggerType = triggerMap[input.entityType] || 'invoice_created';
                        return [4 /*yield*/, db.insert(schema_1.workflows).values({
                                id: workflowId,
                                name: input.name,
                                description: input.description || null,
                                status: input.isEnabled ? 'active' : 'draft',
                                triggerType: triggerType,
                                triggerCondition: JSON.stringify(input.conditions),
                                actionTypes: JSON.stringify(input.actions.map(function (a) { return a.type; })),
                                isRecurring: 0,
                                createdBy: ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id) || 'system',
                                createdAt: now,
                                updatedAt: now
                            })];
                    case 2:
                        _e.sent();
                        _i = 0, _b = input.conditions;
                        _e.label = 3;
                    case 3:
                        if (!(_i < _b.length)) return [3 /*break*/, 6];
                        cond = _b[_i];
                        return [4 /*yield*/, db.insert(schema_1.workflowTriggers).values({
                                id: uuid_1.v4(),
                                workflowId: workflowId,
                                triggerType: input.triggers[0] || triggerType,
                                triggerField: cond.field,
                                operator: (cond.operator === '<' ? 'less_than' : cond.operator === '>' ? 'greater_than' : cond.operator === '=' ? 'equals' : cond.operator === '!=' ? 'not_equals' : 'equals'),
                                triggerValue: String(cond.value),
                                isActive: 1,
                                createdAt: now
                            })];
                    case 4:
                        _e.sent();
                        _e.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6:
                        i = 0;
                        _e.label = 7;
                    case 7:
                        if (!(i < input.actions.length)) return [3 /*break*/, 10];
                        act = input.actions[i];
                        actionTypeMap = {
                            set_field: 'update_field',
                            notify_user: 'send_notification',
                            send_email: 'send_email',
                            create_task: 'create_task',
                            assign_to_user: 'update_status',
                            escalate_priority: 'update_field'
                        };
                        return [4 /*yield*/, db.insert(schema_1.workflowActions).values({
                                id: uuid_1.v4(),
                                workflowId: workflowId,
                                actionType: (actionTypeMap[act.type] || 'send_notification'),
                                actionName: act.type.replace(/_/g, ' '),
                                actionTarget: act.field || act.recipient || null,
                                actionData: JSON.stringify(act),
                                delayMinutes: 0,
                                sequence: i + 1,
                                isActive: 1,
                                createdAt: now,
                                updatedAt: now
                            })];
                    case 8:
                        _e.sent();
                        _e.label = 9;
                    case 9:
                        i++;
                        return [3 /*break*/, 7];
                    case 10: return [4 /*yield*/, db_1.logActivity({
                            userId: ((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id) || 'system',
                            action: 'business_rule_created',
                            entityType: 'workflow',
                            entityId: workflowId,
                            description: "Created business rule: " + input.name
                        })];
                    case 11:
                        _e.sent();
                        return [2 /*return*/, {
                                id: workflowId,
                                name: input.name,
                                message: 'Business rule created successfully'
                            }];
                }
            });
        });
    }),
    /**
     * Toggle rule active/inactive status
     */
    toggleRuleStatus: rulesEditProcedure
        .input(zod_1.z.object({
        ruleId: zod_1.z.string(),
        isEnabled: zod_1.z.boolean()
    }).strict())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, now;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error('Database not available');
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, db.update(schema_1.workflows).set({
                                status: input.isEnabled ? 'active' : 'inactive',
                                updatedAt: now
                            }).where(drizzle_orm_1.eq(schema_1.workflows.id, input.ruleId))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, {
                                ruleId: input.ruleId,
                                isEnabled: input.isEnabled,
                                updated: true,
                                message: "Rule " + (input.isEnabled ? 'enabled' : 'disabled') + " successfully"
                            }];
                }
            });
        });
    }),
    /**
     * Delete a business rule
     */
    deleteRule: rulesEditProcedure
        .input(zod_1.z.object({ ruleId: zod_1.z.string() }).strict())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            throw new Error('Database not available');
                        return [4 /*yield*/, db["delete"](schema_1.workflowActions).where(drizzle_orm_1.eq(schema_1.workflowActions.workflowId, input.ruleId))];
                    case 2:
                        _c.sent();
                        return [4 /*yield*/, db["delete"](schema_1.workflowTriggers).where(drizzle_orm_1.eq(schema_1.workflowTriggers.workflowId, input.ruleId))];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, db["delete"](schema_1.workflows).where(drizzle_orm_1.eq(schema_1.workflows.id, input.ruleId))];
                    case 4:
                        _c.sent();
                        return [4 /*yield*/, db_1.logActivity({
                                userId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || 'system',
                                action: 'business_rule_deleted',
                                entityType: 'workflow',
                                entityId: input.ruleId,
                                description: "Deleted business rule"
                            })];
                    case 5:
                        _c.sent();
                        return [2 /*return*/, { success: true, message: 'Rule deleted successfully' }];
                }
            });
        });
    }),
    /**
     * Get available rule triggers and actions (static reference data)
     */
    getRuleTemplates: rulesViewProcedure
        .input(zod_1.z.object({
        entityType: zod_1.z.string().optional()
    }).strict())
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, {
                    triggers: [
                        { id: 'invoice_created', name: 'When invoice is created', entityTypes: ['invoice'] },
                        { id: 'invoice_paid', name: 'When invoice is paid', entityTypes: ['invoice'] },
                        { id: 'invoice_overdue', name: 'When invoice is overdue', entityTypes: ['invoice'] },
                        { id: 'payment_received', name: 'When payment is received', entityTypes: ['payment'] },
                        { id: 'task_completed', name: 'When task is completed', entityTypes: ['task'] },
                        { id: 'reminder_time', name: 'Scheduled reminder', entityTypes: ['reminder'] },
                    ],
                    conditions: [
                        { id: 'field_value', name: 'Field value', operators: ['=', '!=', '<', '>', '<=', '>=', 'contains'] },
                        { id: 'date_range', name: 'Date is within range', operators: ['is_before', 'is_after', 'is_in_days'] },
                        { id: 'user_role', name: 'User has role', operators: ['=', '!='] },
                    ],
                    actions: [
                        { id: 'send_email', name: 'Send email notification', configurable: true },
                        { id: 'create_task', name: 'Create task', configurable: true },
                        { id: 'update_status', name: 'Update status', configurable: true },
                        { id: 'send_notification', name: 'Send in-app notification', configurable: true },
                        { id: 'update_field', name: 'Update field value', configurable: true },
                        { id: 'create_reminder', name: 'Create reminder', configurable: true },
                    ]
                }];
        });
    }); })
});
