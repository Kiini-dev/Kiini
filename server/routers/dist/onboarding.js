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
exports.onboardingRouter = void 0;
/**
 * HR Onboarding/Offboarding Router
 * Manages employee onboarding and offboarding checklists and tasks
 */
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var db = require("../db");
var uuid_1 = require("uuid");
var server_1 = require("@trpc/server");
function pool() {
    var p = db_1.getPool();
    if (!p)
        throw new server_1.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
    return p;
}
var hrProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("employees:view");
var hrWriteProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("employees:edit");
exports.onboardingRouter = trpc_1.router({
    // ── Templates ──
    listTemplates: hrProcedure
        .input(zod_1.z.object({ type: zod_1.z["enum"](["onboarding", "offboarding"]).optional() }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, orgId, type, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        p = pool();
                        orgId = ctx.user.organizationId;
                        type = input === null || input === void 0 ? void 0 : input.type;
                        return [4 /*yield*/, p.query("SELECT * FROM onboardingTemplates WHERE (organizationId = ? OR organizationId IS NULL) " + (type ? "AND type = ?" : "") + " ORDER BY name", type ? [orgId, type] : [orgId])];
                    case 1:
                        rows = (_b.sent())[0];
                        return [2 /*return*/, rows || []];
                }
            });
        });
    }),
    createTemplate: hrWriteProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string().min(1),
        description: zod_1.z.string().optional(),
        type: zod_1.z["enum"](["onboarding", "offboarding"]),
        tasks: zod_1.z.array(zod_1.z.object({
            title: zod_1.z.string(),
            description: zod_1.z.string().optional(),
            category: zod_1.z["enum"](["documentation", "equipment", "access", "training", "introduction", "other"]).optional(),
            isRequired: zod_1.z.boolean().optional(),
            sortOrder: zod_1.z.number().optional()
        })).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, id, i, task;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        p = pool();
                        id = uuid_1.v4();
                        return [4 /*yield*/, p.query("INSERT INTO onboardingTemplates (id, organizationId, name, description, type, createdBy) VALUES (?, ?, ?, ?, ?, ?)", [id, ctx.user.organizationId, input.name, input.description || null, input.type, ctx.user.id])];
                    case 1:
                        _d.sent();
                        if (!((_b = input.tasks) === null || _b === void 0 ? void 0 : _b.length)) return [3 /*break*/, 5];
                        i = 0;
                        _d.label = 2;
                    case 2:
                        if (!(i < input.tasks.length)) return [3 /*break*/, 5];
                        task = input.tasks[i];
                        return [4 /*yield*/, p.query("INSERT INTO onboardingTasks (id, organizationId, checklistId, templateId, title, description, category, sortOrder, isRequired) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [uuid_1.v4(), ctx.user.organizationId, id, id, task.title, task.description || null, task.category || "other", (_c = task.sortOrder) !== null && _c !== void 0 ? _c : i, task.isRequired !== false ? 1 : 0])];
                    case 3:
                        _d.sent();
                        _d.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, { id: id }];
                }
            });
        });
    }),
    deleteTemplate: hrWriteProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var p;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        p = pool();
                        return [4 /*yield*/, p.query("DELETE FROM onboardingTasks WHERE templateId = ?", [input.id])];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, p.query("DELETE FROM onboardingTemplates WHERE id = ?", [input.id])];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // ── Checklists ──
    listChecklists: hrProcedure
        .input(zod_1.z.object({
        type: zod_1.z["enum"](["onboarding", "offboarding"]).optional(),
        status: zod_1.z["enum"](["pending", "in_progress", "completed", "cancelled"]).optional(),
        employeeId: zod_1.z.string().optional()
    }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, orgId, query, params, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        p = pool();
                        orgId = ctx.user.organizationId;
                        query = "SELECT c.*, e.firstName, e.lastName, e.employeeNumber, e.department, e.position\n        FROM onboardingChecklists c\n        LEFT JOIN employees e ON c.employeeId = e.id\n        WHERE (c.organizationId = ? OR c.organizationId IS NULL)";
                        params = [orgId];
                        if (input === null || input === void 0 ? void 0 : input.type) {
                            query += " AND c.type = ?";
                            params.push(input.type);
                        }
                        if (input === null || input === void 0 ? void 0 : input.status) {
                            query += " AND c.status = ?";
                            params.push(input.status);
                        }
                        if (input === null || input === void 0 ? void 0 : input.employeeId) {
                            query += " AND c.employeeId = ?";
                            params.push(input.employeeId);
                        }
                        query += " ORDER BY c.createdAt DESC";
                        return [4 /*yield*/, p.query(query, params)];
                    case 1:
                        rows = (_b.sent())[0];
                        return [2 /*return*/, rows || []];
                }
            });
        });
    }),
    getChecklist: hrProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, checklists, tasks;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        p = pool();
                        return [4 /*yield*/, p.query("SELECT c.*, e.firstName, e.lastName, e.employeeNumber, e.department, e.position\n         FROM onboardingChecklists c\n         LEFT JOIN employees e ON c.employeeId = e.id\n         WHERE c.id = ?", [input.id])];
                    case 1:
                        checklists = (_b.sent())[0];
                        if (!(checklists === null || checklists === void 0 ? void 0 : checklists[0]))
                            return [2 /*return*/, null];
                        return [4 /*yield*/, p.query("SELECT * FROM onboardingTasks WHERE checklistId = ? ORDER BY sortOrder, createdAt", [input.id])];
                    case 2:
                        tasks = (_b.sent())[0];
                        return [2 /*return*/, __assign(__assign({}, checklists[0]), { tasks: tasks || [] })];
                }
            });
        });
    }),
    createChecklist: hrWriteProcedure
        .input(zod_1.z.object({
        employeeId: zod_1.z.string(),
        type: zod_1.z["enum"](["onboarding", "offboarding"]),
        templateId: zod_1.z.string().optional(),
        assignedTo: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, id, templateTasks, _i, _b, task;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        p = pool();
                        id = uuid_1.v4();
                        return [4 /*yield*/, p.query("INSERT INTO onboardingChecklists (id, organizationId, employeeId, templateId, type, status, startDate, assignedTo, notes, createdBy) VALUES (?, ?, ?, ?, ?, 'in_progress', NOW(), ?, ?, ?)", [id, ctx.user.organizationId, input.employeeId, input.templateId || null, input.type, input.assignedTo || ctx.user.id, input.notes || null, ctx.user.id])];
                    case 1:
                        _c.sent();
                        if (!input.templateId) return [3 /*break*/, 6];
                        return [4 /*yield*/, p.query("SELECT * FROM onboardingTasks WHERE templateId = ? ORDER BY sortOrder", [input.templateId])];
                    case 2:
                        templateTasks = (_c.sent())[0];
                        _i = 0, _b = (templateTasks || []);
                        _c.label = 3;
                    case 3:
                        if (!(_i < _b.length)) return [3 /*break*/, 6];
                        task = _b[_i];
                        return [4 /*yield*/, p.query("INSERT INTO onboardingTasks (id, organizationId, checklistId, templateId, title, description, category, assignedTo, sortOrder, isRequired) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [uuid_1.v4(), ctx.user.organizationId, id, input.templateId, task.title, task.description, task.category, task.assignedTo, task.sortOrder, task.isRequired])];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [4 /*yield*/, db.logActivity({
                            userId: ctx.user.id,
                            action: input.type + "_started",
                            entityType: "onboarding",
                            entityId: id,
                            description: input.type + " checklist created for employee " + input.employeeId
                        })];
                    case 7:
                        _c.sent();
                        return [2 /*return*/, { id: id }];
                }
            });
        });
    }),
    // ── Tasks ──
    updateTask: hrWriteProcedure
        .input(zod_1.z.object({
        taskId: zod_1.z.string(),
        status: zod_1.z["enum"](["pending", "in_progress", "completed", "skipped"]).optional(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, sets, params, task, checklistId, pending;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        p = pool();
                        sets = [];
                        params = [];
                        if (input.status) {
                            sets.push("status = ?");
                            params.push(input.status);
                            if (input.status === "completed") {
                                sets.push("completedAt = NOW()", "completedBy = ?");
                                params.push(ctx.user.id);
                            }
                        }
                        if (input.notes !== undefined) {
                            sets.push("notes = ?");
                            params.push(input.notes);
                        }
                        if (sets.length === 0)
                            return [2 /*return*/, { success: true }];
                        params.push(input.taskId);
                        return [4 /*yield*/, p.query("UPDATE onboardingTasks SET " + sets.join(", ") + " WHERE id = ?", params)];
                    case 1:
                        _d.sent();
                        return [4 /*yield*/, p.query("SELECT checklistId FROM onboardingTasks WHERE id = ?", [input.taskId])];
                    case 2:
                        task = (_d.sent())[0];
                        if (!((_b = task === null || task === void 0 ? void 0 : task[0]) === null || _b === void 0 ? void 0 : _b.checklistId)) return [3 /*break*/, 5];
                        checklistId = task[0].checklistId;
                        return [4 /*yield*/, p.query("SELECT COUNT(*) as cnt FROM onboardingTasks WHERE checklistId = ? AND isRequired = 1 AND status NOT IN ('completed', 'skipped')", [checklistId])];
                    case 3:
                        pending = (_d.sent())[0];
                        if (!(((_c = pending === null || pending === void 0 ? void 0 : pending[0]) === null || _c === void 0 ? void 0 : _c.cnt) === 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, p.query("UPDATE onboardingChecklists SET status = 'completed', completedDate = NOW() WHERE id = ?", [checklistId])];
                    case 4:
                        _d.sent();
                        _d.label = 5;
                    case 5: return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    addTask: hrWriteProcedure
        .input(zod_1.z.object({
        checklistId: zod_1.z.string(),
        title: zod_1.z.string(),
        description: zod_1.z.string().optional(),
        category: zod_1.z["enum"](["documentation", "equipment", "access", "training", "introduction", "other"]).optional(),
        assignedTo: zod_1.z.string().optional(),
        dueDate: zod_1.z.string().optional(),
        isRequired: zod_1.z.boolean().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, id;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        p = pool();
                        id = uuid_1.v4();
                        return [4 /*yield*/, p.query("INSERT INTO onboardingTasks (id, organizationId, checklistId, title, description, category, assignedTo, dueDate, isRequired) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [id, ctx.user.organizationId, input.checklistId, input.title, input.description || null, input.category || "other", input.assignedTo || null, input.dueDate || null, input.isRequired !== false ? 1 : 0])];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, { id: id }];
                }
            });
        });
    }),
    deleteTask: hrWriteProcedure
        .input(zod_1.z.object({ taskId: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var p;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        p = pool();
                        return [4 /*yield*/, p.query("DELETE FROM onboardingTasks WHERE id = ?", [input.taskId])];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    })
});
