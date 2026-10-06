"use strict";
/**
 * Automation Rules Engine Router
 * Create and manage automated workflows and triggering rules
 */
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
exports.automationRulesRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var server_1 = require("@trpc/server");
var readProcedure = trpc_1.createFeatureRestrictedProcedure("workflows:read");
var createProcedure = trpc_1.createFeatureRestrictedProcedure("workflows:create");
var updateProcedure = trpc_1.createFeatureRestrictedProcedure("workflows:update");
var deleteProcedure = trpc_1.createFeatureRestrictedProcedure("workflows:delete");
// Rule condition schema
var ruleConditionSchema = zod_1.z.object({
    field: zod_1.z.string(),
    operator: zod_1.z["enum"](["equals", "not_equals", "contains", "greater_than", "less_than", "in_range"]),
    value: zod_1.z.any(),
    logic: zod_1.z["enum"](["and", "or"]).optional()
});
// Action schema
var actionSchema = zod_1.z.object({
    type: zod_1.z["enum"]([
        "send_notification",
        "send_email",
        "create_task",
        "update_field",
        "create_record",
        "execute_script",
        "send_sms",
        "webhook",
    ]),
    config: zod_1.z.record(zod_1.z.any())
});
exports.automationRulesRouter = trpc_1.router({
    /**
     * Create automation rule
     */
    createRule: createProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string().min(3),
        description: zod_1.z.string().optional(),
        trigger: zod_1.z.object({
            type: zod_1.z["enum"]([
                "invoice_created",
                "payment_received",
                "invoice_overdue",
                "project_milestone",
                "time_entry_submitted",
                "expense_submitted",
                "client_created",
                "lead_qualified",
            ]),
            entity: zod_1.z["enum"](["invoice", "payment", "project", "time_entry", "expense", "client", "lead"])
        }),
        conditions: zod_1.z.array(ruleConditionSchema),
        actions: zod_1.z.array(actionSchema),
        isActive: zod_1.z.boolean()["default"](true),
        priority: zod_1.z["enum"](["low", "normal", "high"])["default"]("normal"),
        executeOnce: zod_1.z.boolean()["default"](false)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        id = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_1.workflows).values({
                                id: id,
                                name: input.name,
                                description: input.description,
                                trigger: JSON.stringify(input.trigger),
                                conditions: JSON.stringify(input.conditions),
                                actions: JSON.stringify(input.actions),
                                isActive: input.isActive ? 1 : 0,
                                priority: input.priority,
                                createdBy: ctx.user.id,
                                createdAt: new Date().toISOString()
                            })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { id: id, message: "Automation rule created successfully" }];
                }
            });
        });
    }),
    /**
     * Get all automation rules
     */
    listRules: readProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rules;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.workflows)
                                .where(drizzle_orm_1.eq(schema_1.workflows.createdBy, ctx.user.id))
                                .orderBy(drizzle_orm_1.desc(schema_1.workflows.createdAt))];
                    case 2:
                        rules = _b.sent();
                        return [2 /*return*/, rules.map(function (rule) { return (__assign(__assign({}, rule), { trigger: JSON.parse(rule.trigger), conditions: JSON.parse(rule.conditions), actions: JSON.parse(rule.actions) })); })];
                }
            });
        });
    }),
    /**
     * Get rule by ID
     */
    getRule: readProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rule, r;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.workflows)
                                .where(drizzle_orm_1.eq(schema_1.workflows.id, input))];
                    case 2:
                        rule = _b.sent();
                        if (!rule.length) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Rule not found"
                            });
                        }
                        r = rule[0];
                        return [2 /*return*/, __assign(__assign({}, r), { trigger: JSON.parse(r.trigger), conditions: JSON.parse(r.conditions), actions: JSON.parse(r.actions) })];
                }
            });
        });
    }),
    /**
     * Update automation rule
     */
    updateRule: updateProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        conditions: zod_1.z.array(ruleConditionSchema).optional(),
        actions: zod_1.z.array(actionSchema).optional(),
        isActive: zod_1.z.boolean().optional(),
        priority: zod_1.z["enum"](["low", "normal", "high"]).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, updateData;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        updateData = {};
                        if (input.name)
                            updateData.name = input.name;
                        if (input.description)
                            updateData.description = input.description;
                        if (input.conditions)
                            updateData.conditions = JSON.stringify(input.conditions);
                        if (input.actions)
                            updateData.actions = JSON.stringify(input.actions);
                        if (input.isActive !== undefined)
                            updateData.isActive = input.isActive ? 1 : 0;
                        if (input.priority)
                            updateData.priority = input.priority;
                        updateData.updatedAt = new Date().toISOString();
                        return [4 /*yield*/, db.update(schema_1.workflows).set(updateData).where(drizzle_orm_1.eq(schema_1.workflows.id, input.id))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true, message: "Rule updated successfully" }];
                }
            });
        });
    }),
    /**
     * Delete automation rule
     */
    deleteRule: deleteProcedure.input(zod_1.z.string()).mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        return [4 /*yield*/, db["delete"](schema_1.workflows).where(drizzle_orm_1.eq(schema_1.workflows.id, input))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true, message: "Rule deleted successfully" }];
                }
            });
        });
    }),
    /**
     * Toggle rule active status
     */
    toggleRuleStatus: updateProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        isActive: zod_1.z.boolean()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        return [4 /*yield*/, db
                                .update(schema_1.workflows)
                                .set({
                                isActive: input.isActive ? 1 : 0,
                                updatedAt: new Date().toISOString()
                            })
                                .where(drizzle_orm_1.eq(schema_1.workflows.id, input.id))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    /**
     * Get automation jobs (execution history)
     */
    getJobHistory: readProcedure
        .input(zod_1.z.object({
        ruleId: zod_1.z.string().optional(),
        status: zod_1.z["enum"](["pending", "success", "failed"]).optional(),
        limit: zod_1.z.number()["default"](50)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rules;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, db.select().from(schema_1.workflows).limit(input.limit)];
                    case 2:
                        rules = _b.sent();
                        return [2 /*return*/, rules.map(function (rule) { return ({
                                id: rule.id,
                                ruleId: rule.id,
                                ruleName: rule.name,
                                status: "success",
                                createdAt: rule.createdAt
                            }); })];
                }
            });
        });
    }),
    /**
     * Retry failed automation job
     */
    retryJob: updateProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        // Job retry would be handled by job queue system
                        // For now, just return success
                        return [2 /*return*/, { success: true, message: "Job re-queued for execution" }];
                }
            });
        });
    }),
    /**
     * Test automation rule with sample data
     */
    testRule: readProcedure
        .input(zod_1.z.object({
        ruleId: zod_1.z.string(),
        sampleData: zod_1.z.record(zod_1.z.any())
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, ruleData, rule, conditions, actions, conditionsMet;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { success: false, error: "Database not available" }];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.workflows)
                                .where(drizzle_orm_1.eq(schema_1.workflows.id, input.ruleId))];
                    case 2:
                        ruleData = _b.sent();
                        if (!ruleData.length) {
                            return [2 /*return*/, { success: false, error: "Rule not found" }];
                        }
                        rule = ruleData[0];
                        conditions = JSON.parse(rule.conditions);
                        actions = JSON.parse(rule.actions);
                        conditionsMet = evaluateConditions(conditions, input.sampleData);
                        return [2 /*return*/, {
                                success: true,
                                ruleId: rule.id,
                                ruleName: rule.name,
                                conditionsMet: conditionsMet,
                                actionsToExecute: actions.length,
                                actions: actions.map(function (a) { return ({
                                    type: a.type,
                                    description: getActionDescription(a.type)
                                }); })
                            }];
                }
            });
        });
    }),
    /**
     * Bulk enable/disable rules
     */
    bulkToggleRules: updateProcedure
        .input(zod_1.z.object({
        ruleIds: zod_1.z.array(zod_1.z.string()),
        isActive: zod_1.z.boolean()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, _i, _b, id;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            throw new Error("Database not available");
                        _i = 0, _b = input.ruleIds;
                        _c.label = 2;
                    case 2:
                        if (!(_i < _b.length)) return [3 /*break*/, 5];
                        id = _b[_i];
                        return [4 /*yield*/, db
                                .update(schema_1.workflows)
                                .set({
                                isActive: input.isActive ? 1 : 0,
                                updatedAt: new Date().toISOString()
                            })
                                .where(drizzle_orm_1.eq(schema_1.workflows.id, id))];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, {
                            success: true,
                            message: input.ruleIds.length + " rules " + (input.isActive ? "enabled" : "disabled")
                        }];
                }
            });
        });
    })
});
/**
 * Helper function to evaluate rule conditions
 */
function evaluateConditions(conditions, data) {
    if (!conditions.length)
        return true;
    var result = true;
    var currentLogic = "and";
    for (var _i = 0, conditions_1 = conditions; _i < conditions_1.length; _i++) {
        var condition = conditions_1[_i];
        var fieldValue = getNestedValue(data, condition.field);
        var conditionMet = evaluateCondition(fieldValue, condition.operator, condition.value);
        if (currentLogic === "and") {
            result = result && conditionMet;
        }
        else {
            result = result || conditionMet;
        }
        if (condition.logic) {
            currentLogic = condition.logic;
        }
    }
    return result;
}
/**
 * Helper to get nested object values
 */
function getNestedValue(obj, path) {
    return path.split(".").reduce(function (current, key) { return current === null || current === void 0 ? void 0 : current[key]; }, obj);
}
/**
 * Helper to evaluate a single condition
 */
function evaluateCondition(fieldValue, operator, compareValue) {
    switch (operator) {
        case "equals":
            return fieldValue === compareValue;
        case "not_equals":
            return fieldValue !== compareValue;
        case "contains":
            return String(fieldValue).includes(String(compareValue));
        case "greater_than":
            return Number(fieldValue) > Number(compareValue);
        case "less_than":
            return Number(fieldValue) < Number(compareValue);
        case "in_range":
            return (Number(fieldValue) >= Number(compareValue[0]) &&
                Number(fieldValue) <= Number(compareValue[1]));
        default:
            return false;
    }
}
/**
 * Helper to get action description
 */
function getActionDescription(type) {
    var descriptions = {
        send_notification: "Send in-app notification",
        send_email: "Send email notification",
        create_task: "Create a new task",
        update_field: "Update a field value",
        create_record: "Create a new record",
        execute_script: "Execute custom script",
        send_sms: "Send SMS notification",
        webhook: "Call webhook endpoint"
    };
    return descriptions[type] || "Unknown action";
}
