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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.projectsRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var schema_extended_1 = require("../../drizzle/schema-extended");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var emailNotifications_1 = require("./emailNotifications");
var fs_1 = require("fs");
var path_1 = require("path");
var readProcedure = trpc_1.protectedProcedure;
var createProcedure = trpc_1.protectedProcedure;
var updateProcedure = trpc_1.protectedProcedure;
var deleteProcedure = trpc_1.protectedProcedure;
exports.projectsRouter = trpc_1.router({
    list: readProcedure
        .input(zod_1.z.object({ limit: zod_1.z.number().optional(), offset: zod_1.z.number().optional() }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, result, _b;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        console.log('[Projects.list] Called. User:', ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.email) || 'NO USER', 'Input:', input);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _d.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        orgId = ctx.user.organizationId;
                        if (!orgId) return [3 /*break*/, 3];
                        return [4 /*yield*/, db.select().from(schema_1.projects).where(drizzle_orm_1.eq(schema_1.projects.organizationId, orgId)).orderBy(drizzle_orm_1.desc(schema_1.projects.createdAt)).limit((input === null || input === void 0 ? void 0 : input.limit) || 50).offset((input === null || input === void 0 ? void 0 : input.offset) || 0)];
                    case 2:
                        _b = _d.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, db.select().from(schema_1.projects).orderBy(drizzle_orm_1.desc(schema_1.projects.createdAt)).limit((input === null || input === void 0 ? void 0 : input.limit) || 50).offset((input === null || input === void 0 ? void 0 : input.offset) || 0)];
                    case 4:
                        _b = _d.sent();
                        _d.label = 5;
                    case 5:
                        result = _b;
                        // Convert frozen Drizzle objects to plain objects to avoid React error #306
                        return [2 /*return*/, result.map(function (project) { return ({
                                id: project.id,
                                clientId: project.clientId,
                                name: project.name,
                                projectNumber: project.projectNumber,
                                description: project.description,
                                status: project.status,
                                priority: project.priority,
                                startDate: project.startDate,
                                endDate: project.endDate,
                                budget: project.budget,
                                progress: project.progress,
                                createdBy: project.createdBy,
                                createdAt: project.createdAt,
                                updatedAt: project.updatedAt
                            }); })];
                }
            });
        });
    }),
    getById: readProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, where, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.projects.id, input), drizzle_orm_1.eq(schema_1.projects.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.projects.id, input);
                        return [4 /*yield*/, db.select().from(schema_1.projects).where(where).limit(1)];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, result[0] || null];
                }
            });
        });
    }),
    byClient: readProcedure
        .input(zod_1.z.object({ clientId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, where, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.projects.clientId, input.clientId), drizzle_orm_1.eq(schema_1.projects.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.projects.clientId, input.clientId);
                        return [4 /*yield*/, db.select().from(schema_1.projects).where(where)];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    }),
    byStatus: readProcedure
        .input(zod_1.z.object({ status: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, where, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.projects.status, input.status), drizzle_orm_1.eq(schema_1.projects.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.projects.status, input.status);
                        return [4 /*yield*/, db.select().from(schema_1.projects).where(where)];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    }),
    create: createProcedure
        .input(zod_1.z.object({
        clientId: zod_1.z.string(),
        name: zod_1.z.string(),
        description: zod_1.z.string().optional(),
        status: zod_1.z["enum"](["planning", "active", "on_hold", "completed", "cancelled"]).optional(),
        priority: zod_1.z["enum"](["low", "medium", "high", "urgent"]).optional(),
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional(),
        budget: zod_1.z.number().optional(),
        progress: zod_1.z.number().min(0).max(100).optional(),
        // Accept progressPercentage from some frontend forms and map to progress
        progressPercentage: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
        // Extended project fields
        assignedTo: zod_1.z.string().optional(),
        projectManager: zod_1.z.string().optional(),
        tags: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, prjPrefix, prefixRows, _b, projectNumber, notifError_1;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _e.sent();
                        if (!db)
                            throw new Error("Database not available");
                        id = uuid_1.v4();
                        prjPrefix = "PRJ";
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.select().from(schema_1.settings)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.settings.category, "numbering"), drizzle_orm_1.eq(schema_1.settings.key, "projectPrefix")))
                                .limit(1)];
                    case 3:
                        prefixRows = _e.sent();
                        if (prefixRows.length > 0 && prefixRows[0].value)
                            prjPrefix = prefixRows[0].value;
                        return [3 /*break*/, 5];
                    case 4:
                        _b = _e.sent();
                        return [3 /*break*/, 5];
                    case 5:
                        projectNumber = prjPrefix + "-" + new Date().getFullYear() + "-" + String(Math.floor(Math.random() * 1000)).padStart(3, "0");
                        return [4 /*yield*/, db.insert(schema_1.projects).values({
                                id: id,
                                projectNumber: projectNumber,
                                name: input.name,
                                clientId: input.clientId,
                                description: input.description || null,
                                status: input.status || 'planning',
                                priority: input.priority || 'medium',
                                startDate: input.startDate || null,
                                endDate: input.endDate || null,
                                budget: input.budget !== undefined ? Math.round(input.budget * 100) : 0,
                                progress: (_c = input.progress) !== null && _c !== void 0 ? _c : (input.progressPercentage != null && input.progressPercentage !== '' ? Math.min(100, Math.max(0, typeof input.progressPercentage === 'string' ? (Number.isNaN(parseInt(input.progressPercentage)) ? 0 : parseInt(input.progressPercentage)) : input.progressPercentage)) : 0),
                                assignedTo: input.assignedTo || null,
                                projectManager: input.projectManager || null,
                                tags: input.tags || null,
                                notes: input.notes || null,
                                createdBy: ctx.user.id,
                                organizationId: (_d = ctx.user.organizationId) !== null && _d !== void 0 ? _d : null
                            })];
                    case 6:
                        _e.sent();
                        _e.label = 7;
                    case 7:
                        _e.trys.push([7, 10, , 11]);
                        if (!ctx.user.email) return [3 /*break*/, 9];
                        return [4 /*yield*/, emailNotifications_1.triggerEventNotification({
                                userId: ctx.user.id,
                                eventType: "project_created",
                                recipientEmail: ctx.user.email,
                                recipientName: ctx.user.name,
                                subject: "New Project Created: " + input.name,
                                htmlContent: "<h2>New Project Created</h2><p>Project <strong>" + input.name + "</strong> (" + projectNumber + ") has been created.</p>" + (input.status ? "<p><strong>Status:</strong> " + input.status + "</p>" : '') + "<p><a href=\"/projects/" + id + "\">View Project</a></p>",
                                entityType: "project",
                                entityId: id,
                                actionUrl: "/projects/" + id
                            })];
                    case 8:
                        _e.sent();
                        _e.label = 9;
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        notifError_1 = _e.sent();
                        console.error("[Projects] Failed to send email notification:", notifError_1);
                        return [3 /*break*/, 11];
                    case 11: return [2 /*return*/, { id: id }];
                }
            });
        });
    }),
    update: updateProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        clientId: zod_1.z.string().optional(),
        name: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        status: zod_1.z["enum"](["planning", "active", "on_hold", "completed", "cancelled"]).optional(),
        priority: zod_1.z["enum"](["low", "medium", "high", "urgent"]).optional(),
        startDate: zod_1.z.date().or(zod_1.z.string()).optional(),
        endDate: zod_1.z.date().or(zod_1.z.string()).optional(),
        budget: zod_1.z.number().optional(),
        progress: zod_1.z.number().min(0).max(100).optional(),
        progressPercentage: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, data, orgId, ownerCheck, existing, updateData, dateStr, dateStr, parsed, progressValue;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        id = input.id, data = __rest(input, ["id"]);
                        orgId = ctx.user.organizationId;
                        ownerCheck = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.projects.id, id), drizzle_orm_1.eq(schema_1.projects.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.projects.id, id);
                        return [4 /*yield*/, db.select({ id: schema_1.projects.id }).from(schema_1.projects).where(ownerCheck).limit(1)];
                    case 2:
                        existing = _b.sent();
                        if (!existing.length)
                            throw new Error("Project not found");
                        updateData = __assign({}, data);
                        // Handle dates - convert to MySQL format (YYYY-MM-DD HH:MM:SS)
                        if (data.startDate) {
                            dateStr = typeof data.startDate === 'string' ? data.startDate : data.startDate.toISOString();
                            updateData.startDate = dateStr.replace('T', ' ').substring(0, 19);
                        }
                        if (data.endDate) {
                            dateStr = typeof data.endDate === 'string' ? data.endDate : data.endDate.toISOString();
                            updateData.endDate = dateStr.replace('T', ' ').substring(0, 19);
                        }
                        // Handle progress
                        if (data.progress !== undefined) {
                            updateData.progress = data.progress;
                        }
                        else if (data.progressPercentage !== undefined && data.progressPercentage !== '') {
                            parsed = typeof data.progressPercentage === 'string' ? parseInt(data.progressPercentage) : data.progressPercentage;
                            updateData.progress = Number.isNaN(parsed) ? 0 : Math.min(100, Math.max(0, parsed));
                        }
                        // Normalize budget: accept major units from client and store as cents
                        if (data.budget !== undefined) {
                            updateData.budget = Math.round(data.budget * 100);
                        }
                        progressValue = data.progress;
                        if (progressValue === 100 && !data.status) {
                            updateData.status = 'completed';
                        }
                        return [4 /*yield*/, db.update(schema_1.projects).set(updateData).where(drizzle_orm_1.eq(schema_1.projects.id, id))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    updateProgress: updateProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        progress: zod_1.z.number().min(0).max(100)
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, now, updateData, currentProject, err_1;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            throw new Error("Database not available");
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        updateData = {
                            progress: input.progress,
                            updatedAt: now
                        };
                        if (!(input.progress === 100)) return [3 /*break*/, 2];
                        updateData.status = 'completed';
                        updateData.actualEndDate = now;
                        return [3 /*break*/, 4];
                    case 2:
                        if (!(input.progress > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, db.select({ status: schema_1.projects.status }).from(schema_1.projects).where(drizzle_orm_1.eq(schema_1.projects.id, input.id)).limit(1)];
                    case 3:
                        currentProject = _c.sent();
                        if (((_b = currentProject[0]) === null || _b === void 0 ? void 0 : _b.status) === 'planning') {
                            updateData.status = 'active';
                            updateData.actualStartDate = now;
                        }
                        _c.label = 4;
                    case 4:
                        _c.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, db.update(schema_1.projects).set(updateData).where(drizzle_orm_1.eq(schema_1.projects.id, input.id))];
                    case 5:
                        _c.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        err_1 = _c.sent();
                        console.error('Failed updating project progress', { input: input, updateData: updateData, err: err_1 });
                        throw new Error('Failed updating project progress: ' + ((err_1 === null || err_1 === void 0 ? void 0 : err_1.message) || String(err_1)));
                    case 7: return [2 /*return*/, { success: true, progress: input.progress }];
                }
            });
        });
    }),
    "delete": deleteProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, where;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.projects.id, input), drizzle_orm_1.eq(schema_1.projects.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.projects.id, input);
                        return [4 /*yield*/, db["delete"](schema_1.projects).where(where)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // Client-facing alias used by legacy client code
    getClientProjects: readProcedure
        .input(zod_1.z.object({ clientId: zod_1.z.string().optional() }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, clientId, result;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        clientId = (input === null || input === void 0 ? void 0 : input.clientId) || ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.clientId) || ctx.user.id;
                        return [4 /*yield*/, db.select().from(schema_1.projects).where(drizzle_orm_1.eq(schema_1.projects.clientId, clientId))];
                    case 2:
                        result = _c.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    }),
    // Project Tasks
    tasks: trpc_1.router({
        list: readProcedure
            .input(zod_1.z.object({ projectId: zod_1.z.string() }))
            .query(function (_a) {
            var input = _a.input;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, tasks, error_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                return [2 /*return*/, []];
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, db
                                    .select()
                                    .from(schema_1.projectTasks)
                                    .where(drizzle_orm_1.eq(schema_1.projectTasks.projectId, input.projectId))
                                    .orderBy(schema_1.projectTasks.order)];
                        case 3:
                            tasks = _b.sent();
                            return [2 /*return*/, tasks];
                        case 4:
                            error_1 = _b.sent();
                            console.error("Error listing tasks:", error_1);
                            return [2 /*return*/, []];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        }),
        // List all tasks across all projects AND standalone tasks for the organization
        listAll: readProcedure
            .input(zod_1.z.object({
            status: zod_1.z["enum"](['todo', 'in_progress', 'review', 'completed', 'blocked']).optional(),
            assignedTo: zod_1.z.string().optional(),
            priority: zod_1.z["enum"](['low', 'medium', 'high', 'urgent']).optional()
        }).optional())
            .query(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, orgId, orgProjects, _b, projectIds, projectMap_1, orgClients, _c, clientMap_1, statusFilters, orgFilter, allFilters, tasks, error_2;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _d.sent();
                            if (!db)
                                return [2 /*return*/, []];
                            _d.label = 2;
                        case 2:
                            _d.trys.push([2, 12, , 13]);
                            orgId = ctx.user.organizationId;
                            if (!orgId) return [3 /*break*/, 4];
                            return [4 /*yield*/, db.select({ id: schema_1.projects.id, name: schema_1.projects.name }).from(schema_1.projects).where(drizzle_orm_1.eq(schema_1.projects.organizationId, orgId))];
                        case 3:
                            _b = _d.sent();
                            return [3 /*break*/, 6];
                        case 4: return [4 /*yield*/, db.select({ id: schema_1.projects.id, name: schema_1.projects.name }).from(schema_1.projects)];
                        case 5:
                            _b = _d.sent();
                            _d.label = 6;
                        case 6:
                            orgProjects = _b;
                            projectIds = orgProjects.map(function (p) { return p.id; });
                            projectMap_1 = {};
                            orgProjects.forEach(function (p) { projectMap_1[p.id] = p.name; });
                            if (!orgId) return [3 /*break*/, 8];
                            return [4 /*yield*/, db.select({ id: schema_1.clients.id, name: schema_1.clients.companyName }).from(schema_1.clients).where(drizzle_orm_1.eq(schema_1.clients.organizationId, orgId))];
                        case 7:
                            _c = _d.sent();
                            return [3 /*break*/, 10];
                        case 8: return [4 /*yield*/, db.select({ id: schema_1.clients.id, name: schema_1.clients.companyName }).from(schema_1.clients)];
                        case 9:
                            _c = _d.sent();
                            _d.label = 10;
                        case 10:
                            orgClients = _c;
                            clientMap_1 = {};
                            orgClients.forEach(function (c) { clientMap_1[c.id] = c.name; });
                            statusFilters = [];
                            if (input === null || input === void 0 ? void 0 : input.status)
                                statusFilters.push(drizzle_orm_1.eq(schema_1.projectTasks.status, input.status));
                            if (input === null || input === void 0 ? void 0 : input.assignedTo)
                                statusFilters.push(drizzle_orm_1.eq(schema_1.projectTasks.assignedTo, input.assignedTo));
                            if (input === null || input === void 0 ? void 0 : input.priority)
                                statusFilters.push(drizzle_orm_1.eq(schema_1.projectTasks.priority, input.priority));
                            orgFilter = projectIds.length > 0
                                ? drizzle_orm_1.or(drizzle_orm_1.inArray(schema_1.projectTasks.projectId, projectIds), drizzle_orm_1.isNull(schema_1.projectTasks.projectId))
                                : drizzle_orm_1.isNull(schema_1.projectTasks.projectId);
                            allFilters = statusFilters.length > 0
                                ? drizzle_orm_1.and.apply(void 0, __spreadArrays([orgFilter], statusFilters)) : orgFilter;
                            return [4 /*yield*/, db
                                    .select()
                                    .from(schema_1.projectTasks)
                                    .where(allFilters)
                                    .orderBy(drizzle_orm_1.desc(schema_1.projectTasks.createdAt))];
                        case 11:
                            tasks = _d.sent();
                            return [2 /*return*/, tasks.map(function (t) { return (__assign(__assign({}, t), { projectName: t.projectId ? (projectMap_1[t.projectId] || 'Unknown Project') : null, clientName: t.clientId ? (clientMap_1[t.clientId] || null) : null })); })];
                        case 12:
                            error_2 = _d.sent();
                            console.error("Error listing all tasks:", error_2);
                            return [2 /*return*/, []];
                        case 13: return [2 /*return*/];
                    }
                });
            });
        }),
        create: createProcedure
            .input(zod_1.z.object({
            projectId: zod_1.z.string().optional(),
            clientId: zod_1.z.string().optional(),
            title: zod_1.z.string(),
            description: zod_1.z.string().optional(),
            status: zod_1.z["enum"](['todo', 'in_progress', 'review', 'completed', 'blocked']).optional(),
            priority: zod_1.z["enum"](['low', 'medium', 'high', 'urgent']).optional(),
            assignedTo: zod_1.z.string().optional(),
            dueDate: zod_1.z.date().or(zod_1.z.string()).optional(),
            estimatedHours: zod_1.z.number().optional(),
            parentTaskId: zod_1.z.string().optional(),
            tags: zod_1.z.string().optional(),
            targetDate: zod_1.z.string().optional(),
            billable: zod_1.z.number().optional(),
            visibleToClient: zod_1.z.number().optional()
        }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, id, convertToMySQLDateTime, dueDate, now;
                var _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _d.sent();
                            if (!db)
                                throw new Error("Database not available");
                            id = uuid_1.v4();
                            convertToMySQLDateTime = function (date) {
                                if (!date)
                                    return null;
                                if (typeof date === 'string')
                                    return new Date(date).toISOString().replace('T', ' ').substring(0, 19);
                                if (date instanceof Date)
                                    return date.toISOString().replace('T', ' ').substring(0, 19);
                                return null;
                            };
                            dueDate = convertToMySQLDateTime(input.dueDate);
                            now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                            return [4 /*yield*/, db.insert(schema_1.projectTasks).values({
                                    id: id,
                                    projectId: input.projectId || null,
                                    clientId: input.clientId || null,
                                    title: input.title,
                                    description: input.description || null,
                                    status: input.status || 'todo',
                                    priority: input.priority || 'medium',
                                    assignedTo: input.assignedTo || null,
                                    dueDate: dueDate,
                                    estimatedHours: input.estimatedHours || null,
                                    parentTaskId: input.parentTaskId || null,
                                    tags: input.tags || null,
                                    targetDate: input.targetDate ? convertToMySQLDateTime(input.targetDate) : null,
                                    billable: (_b = input.billable) !== null && _b !== void 0 ? _b : 1,
                                    visibleToClient: (_c = input.visibleToClient) !== null && _c !== void 0 ? _c : 1,
                                    order: 0,
                                    createdBy: ctx.user.id,
                                    createdAt: now,
                                    updatedAt: now
                                })];
                        case 2:
                            _d.sent();
                            // Log activity
                            return [4 /*yield*/, db_1.logActivity({
                                    userId: ctx.user.id,
                                    action: "task_created",
                                    entityType: "projectTask",
                                    entityId: id,
                                    description: "Created task: " + input.title
                                })];
                        case 3:
                            // Log activity
                            _d.sent();
                            return [2 /*return*/, { id: id }];
                    }
                });
            });
        }),
        // Upload a file attachment for a task, returns a URL
        uploadAttachment: createProcedure
            .input(zod_1.z.object({
            filename: zod_1.z.string().max(255),
            dataUrl: zod_1.z.string().max(15000000),
            fileType: zod_1.z["enum"](['image', 'document'])["default"]('document')
        }))
            .mutation(function (_a) {
            var input = _a.input;
            return __awaiter(void 0, void 0, void 0, function () {
                var uploadDir, tasksDir, safeName, ext, newFilename, base64Data;
                return __generator(this, function (_b) {
                    uploadDir = process.env.UPLOAD_DIR || path_1["default"].resolve(process.cwd(), 'uploads');
                    tasksDir = path_1["default"].join(uploadDir, 'tasks');
                    if (!fs_1["default"].existsSync(tasksDir))
                        fs_1["default"].mkdirSync(tasksDir, { recursive: true });
                    safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
                    ext = path_1["default"].extname(safeName) || '.bin';
                    newFilename = "" + uuid_1.v4() + ext;
                    base64Data = input.dataUrl.replace(/^data:[^;]+;base64,/, '');
                    fs_1["default"].writeFileSync(path_1["default"].join(tasksDir, newFilename), Buffer.from(base64Data, 'base64'));
                    return [2 /*return*/, { url: "/uploads/tasks/" + newFilename, filename: input.filename }];
                });
            });
        }),
        update: updateProcedure
            .input(zod_1.z.object({
            id: zod_1.z.string(),
            projectId: zod_1.z.string().optional().nullable(),
            clientId: zod_1.z.string().optional().nullable(),
            title: zod_1.z.string().optional(),
            description: zod_1.z.string().optional(),
            status: zod_1.z["enum"](['todo', 'in_progress', 'review', 'completed', 'blocked']).optional(),
            priority: zod_1.z["enum"](['low', 'medium', 'high', 'urgent']).optional(),
            assignedTo: zod_1.z.string().optional(),
            dueDate: zod_1.z.date().or(zod_1.z.string()).optional(),
            estimatedHours: zod_1.z.number().optional(),
            actualHours: zod_1.z.number().optional(),
            parentTaskId: zod_1.z.string().optional(),
            tags: zod_1.z.string().optional(),
            targetDate: zod_1.z.string().optional(),
            billable: zod_1.z.number().optional(),
            visibleToClient: zod_1.z.number().optional()
        }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, id, updates, updateData, dateStr;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                throw new Error("Database not available");
                            id = input.id, updates = __rest(input, ["id"]);
                            updateData = __assign({}, updates);
                            // Handle date conversion to MySQL format
                            if (updates.dueDate) {
                                dateStr = typeof updates.dueDate === 'string' ? updates.dueDate : updates.dueDate.toISOString().replace('T', ' ').substring(0, 19);
                                updateData.dueDate = dateStr.replace('T', ' ').substring(0, 19);
                            }
                            // If task is being marked as completed, set completedDate
                            if (updates.status === 'completed') {
                                updateData.completedDate = new Date().toISOString().replace('T', ' ').substring(0, 19);
                            }
                            updateData.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
                            return [4 /*yield*/, db.update(schema_1.projectTasks).set(updateData).where(drizzle_orm_1.eq(schema_1.projectTasks.id, id))];
                        case 2:
                            _b.sent();
                            // Log activity
                            return [4 /*yield*/, db_1.logActivity({
                                    userId: ctx.user.id,
                                    action: "task_updated",
                                    entityType: "projectTask",
                                    entityId: id,
                                    description: "Updated task" + (updates.status ? " status to " + updates.status : '')
                                })];
                        case 3:
                            // Log activity
                            _b.sent();
                            return [2 /*return*/, { success: true }];
                    }
                });
            });
        }),
        "delete": deleteProcedure
            .input(zod_1.z.string())
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var db;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                throw new Error("Database not available");
                            return [4 /*yield*/, db["delete"](schema_1.projectTasks).where(drizzle_orm_1.eq(schema_1.projectTasks.id, input))];
                        case 2:
                            _b.sent();
                            // Log activity
                            return [4 /*yield*/, db_1.logActivity({
                                    userId: ctx.user.id,
                                    action: "task_deleted",
                                    entityType: "projectTask",
                                    entityId: input,
                                    description: "Deleted task"
                                })];
                        case 3:
                            // Log activity
                            _b.sent();
                            return [2 /*return*/, { success: true }];
                    }
                });
            });
        }),
        // Get task by ID with all details including approval info
        getById: readProcedure
            .input(zod_1.z.string())
            .query(function (_a) {
            var input = _a.input;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, task, error_3;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                return [2 /*return*/, null];
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, db
                                    .select()
                                    .from(schema_1.projectTasks)
                                    .where(drizzle_orm_1.eq(schema_1.projectTasks.id, input))
                                    .limit(1)];
                        case 3:
                            task = _b.sent();
                            return [2 /*return*/, task[0] || null];
                        case 4:
                            error_3 = _b.sent();
                            console.error("Error fetching task:", error_3);
                            return [2 /*return*/, null];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        }),
        // List tasks filtered by team member (assignedTo)
        listByTeamMember: readProcedure
            .input(zod_1.z.object({
            projectId: zod_1.z.string(),
            teamMemberId: zod_1.z.string()
        }))
            .query(function (_a) {
            var input = _a.input;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, tasks, error_4;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                return [2 /*return*/, []];
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, db
                                    .select()
                                    .from(schema_1.projectTasks)
                                    .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.projectTasks.projectId, input.projectId), drizzle_orm_1.eq(schema_1.projectTasks.assignedTo, input.teamMemberId)))
                                    .orderBy(schema_1.projectTasks.order)];
                        case 3:
                            tasks = _b.sent();
                            return [2 /*return*/, tasks];
                        case 4:
                            error_4 = _b.sent();
                            console.error("Error listing team member tasks:", error_4);
                            return [2 /*return*/, []];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        }),
        // List tasks filtered by status
        listByStatus: readProcedure
            .input(zod_1.z.object({
            projectId: zod_1.z.string(),
            status: zod_1.z["enum"](['todo', 'in_progress', 'review', 'completed', 'blocked'])
        }))
            .query(function (_a) {
            var input = _a.input;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, tasks, error_5;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                return [2 /*return*/, []];
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, db
                                    .select()
                                    .from(schema_1.projectTasks)
                                    .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.projectTasks.projectId, input.projectId), drizzle_orm_1.eq(schema_1.projectTasks.status, input.status)))
                                    .orderBy(schema_1.projectTasks.order)];
                        case 3:
                            tasks = _b.sent();
                            return [2 /*return*/, tasks];
                        case 4:
                            error_5 = _b.sent();
                            console.error("Error listing tasks by status:", error_5);
                            return [2 /*return*/, []];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        }),
        // List tasks pending approval
        listPendingApproval: readProcedure
            .input(zod_1.z.object({
            projectId: zod_1.z.string().optional()
        }))
            .query(function (_a) {
            var input = _a.input;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, query, tasks, error_6;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                return [2 /*return*/, []];
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 4, , 5]);
                            query = db
                                .select()
                                .from(schema_1.projectTasks)
                                .where(drizzle_orm_1.eq(schema_1.projectTasks.approvalStatus, 'pending'));
                            if (input === null || input === void 0 ? void 0 : input.projectId) {
                                query = db
                                    .select()
                                    .from(schema_1.projectTasks)
                                    .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.projectTasks.projectId, input.projectId), drizzle_orm_1.eq(schema_1.projectTasks.approvalStatus, 'pending')));
                            }
                            return [4 /*yield*/, query.orderBy(schema_1.projectTasks.updatedAt)];
                        case 3:
                            tasks = _b.sent();
                            return [2 /*return*/, tasks];
                        case 4:
                            error_6 = _b.sent();
                            console.error("Error listing pending approval tasks:", error_6);
                            return [2 /*return*/, []];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        }),
        // Approve task
        approve: updateProcedure
            .input(zod_1.z.object({
            id: zod_1.z.string(),
            adminRemarks: zod_1.z.string().optional()
        }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, now, error_7;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                throw new Error("Database not available");
                            now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 5, , 6]);
                            return [4 /*yield*/, db.update(schema_1.projectTasks).set({
                                    approvalStatus: 'approved',
                                    approvedBy: ctx.user.id,
                                    approvedAt: now,
                                    adminRemarks: input.adminRemarks || null,
                                    updatedAt: now
                                }).where(drizzle_orm_1.eq(schema_1.projectTasks.id, input.id))];
                        case 3:
                            _b.sent();
                            // Log activity
                            return [4 /*yield*/, db_1.logActivity({
                                    userId: ctx.user.id,
                                    action: "task_approved",
                                    entityType: "projectTask",
                                    entityId: input.id,
                                    description: "Approved task" + (input.adminRemarks ? " with remarks: " + input.adminRemarks : '')
                                })];
                        case 4:
                            // Log activity
                            _b.sent();
                            return [2 /*return*/, { success: true, message: "Task approved successfully" }];
                        case 5:
                            error_7 = _b.sent();
                            console.error("Error approving task:", error_7);
                            throw new Error("Failed to approve task");
                        case 6: return [2 /*return*/];
                    }
                });
            });
        }),
        // Reject task with reason
        reject: updateProcedure
            .input(zod_1.z.object({
            id: zod_1.z.string(),
            rejectionReason: zod_1.z.string(),
            adminRemarks: zod_1.z.string().optional()
        }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, now, error_8;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                throw new Error("Database not available");
                            now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 5, , 6]);
                            return [4 /*yield*/, db.update(schema_1.projectTasks).set({
                                    approvalStatus: 'rejected',
                                    approvedBy: ctx.user.id,
                                    approvedAt: now,
                                    rejectionReason: input.rejectionReason,
                                    adminRemarks: input.adminRemarks || null,
                                    updatedAt: now
                                }).where(drizzle_orm_1.eq(schema_1.projectTasks.id, input.id))];
                        case 3:
                            _b.sent();
                            // Log activity
                            return [4 /*yield*/, db_1.logActivity({
                                    userId: ctx.user.id,
                                    action: "task_rejected",
                                    entityType: "projectTask",
                                    entityId: input.id,
                                    description: "Rejected task - Reason: " + input.rejectionReason
                                })];
                        case 4:
                            // Log activity
                            _b.sent();
                            return [2 /*return*/, { success: true, message: "Task rejected with reason" }];
                        case 5:
                            error_8 = _b.sent();
                            console.error("Error rejecting task:", error_8);
                            throw new Error("Failed to reject task");
                        case 6: return [2 /*return*/];
                    }
                });
            });
        }),
        // Request revision on task
        requestRevision: updateProcedure
            .input(zod_1.z.object({
            id: zod_1.z.string(),
            revisionRemarks: zod_1.z.string()
        }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, now, error_9;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                throw new Error("Database not available");
                            now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 5, , 6]);
                            return [4 /*yield*/, db.update(schema_1.projectTasks).set({
                                    approvalStatus: 'revision_requested',
                                    approvedBy: ctx.user.id,
                                    approvedAt: now,
                                    adminRemarks: input.revisionRemarks,
                                    updatedAt: now
                                }).where(drizzle_orm_1.eq(schema_1.projectTasks.id, input.id))];
                        case 3:
                            _b.sent();
                            // Log activity
                            return [4 /*yield*/, db_1.logActivity({
                                    userId: ctx.user.id,
                                    action: "task_revision_requested",
                                    entityType: "projectTask",
                                    entityId: input.id,
                                    description: "Revision requested: " + input.revisionRemarks
                                })];
                        case 4:
                            // Log activity
                            _b.sent();
                            return [2 /*return*/, { success: true, message: "Revision requested" }];
                        case 5:
                            error_9 = _b.sent();
                            console.error("Error requesting revision:", error_9);
                            throw new Error("Failed to request revision");
                        case 6: return [2 /*return*/];
                    }
                });
            });
        })
    }),
    // Project Manager Assignment
    assignManager: updateProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        projectManagerId: zod_1.z.string()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        return [4 /*yield*/, db.update(schema_1.projects)
                                .set({
                                projectManager: input.projectManagerId,
                                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })
                                .where(drizzle_orm_1.eq(schema_1.projects.id, input.id))];
                    case 2:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db_1.logActivity({
                                userId: ctx.user.id,
                                action: "project_manager_assigned",
                                entityType: "project",
                                entityId: input.id,
                                description: "Assigned Project Manager"
                            })];
                    case 3:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // Team Member Management
    teamMembers: trpc_1.router({
        list: readProcedure
            .input(zod_1.z.object({ projectId: zod_1.z.string() }))
            .query(function (_a) {
            var input = _a.input;
            return __awaiter(void 0, void 0, void 0, function () {
                var database, results, error_10;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            database = _b.sent();
                            if (!database)
                                return [2 /*return*/, []];
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, database
                                    .select({
                                    id: schema_extended_1.projectTeamMembers.id,
                                    projectId: schema_extended_1.projectTeamMembers.projectId,
                                    employeeId: schema_extended_1.projectTeamMembers.employeeId,
                                    role: schema_extended_1.projectTeamMembers.role,
                                    hoursAllocated: schema_extended_1.projectTeamMembers.hoursAllocated,
                                    startDate: schema_extended_1.projectTeamMembers.startDate,
                                    endDate: schema_extended_1.projectTeamMembers.endDate,
                                    isActive: schema_extended_1.projectTeamMembers.isActive,
                                    createdAt: schema_extended_1.projectTeamMembers.createdAt
                                })
                                    .from(schema_extended_1.projectTeamMembers)
                                    .where(drizzle_orm_1.eq(schema_extended_1.projectTeamMembers.projectId, input.projectId))];
                        case 3:
                            results = _b.sent();
                            return [2 /*return*/, results];
                        case 4:
                            error_10 = _b.sent();
                            console.error("Error fetching team members:", error_10);
                            // Table may not exist yet, return empty array
                            return [2 /*return*/, []];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        }),
        create: createProcedure
            .input(zod_1.z.object({
            projectId: zod_1.z.string(),
            employeeId: zod_1.z.string(),
            role: zod_1.z.string().optional(),
            hoursAllocated: zod_1.z.number().optional(),
            startDate: zod_1.z.string().optional(),
            endDate: zod_1.z.string().optional()
        }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var database, id, now, err_2, error_11, msg;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            database = _b.sent();
                            if (!database)
                                throw new Error("Database not available");
                            id = uuid_1.v4();
                            now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 8, , 9]);
                            return [4 /*yield*/, database.insert(schema_extended_1.projectTeamMembers).values({
                                    id: id,
                                    projectId: input.projectId,
                                    employeeId: input.employeeId,
                                    role: input.role || undefined,
                                    hoursAllocated: input.hoursAllocated || undefined,
                                    startDate: input.startDate ? new Date(input.startDate).toISOString().replace('T', ' ').substring(0, 19) : undefined,
                                    endDate: input.endDate ? new Date(input.endDate).toISOString().replace('T', ' ').substring(0, 19) : undefined,
                                    isActive: true,
                                    createdBy: ctx.user.id,
                                    createdAt: now
                                })];
                        case 3:
                            _b.sent();
                            _b.label = 4;
                        case 4:
                            _b.trys.push([4, 6, , 7]);
                            return [4 /*yield*/, database.logActivity({
                                    userId: ctx.user.id,
                                    action: "team_member_added",
                                    entityType: "project",
                                    entityId: input.projectId,
                                    description: "Added staff member to project team"
                                })];
                        case 5:
                            _b.sent();
                            return [3 /*break*/, 7];
                        case 6:
                            err_2 = _b.sent();
                            console.warn("Could not log activity:", err_2);
                            return [3 /*break*/, 7];
                        case 7: return [2 /*return*/, { success: true, id: id }];
                        case 8:
                            error_11 = _b.sent();
                            console.error("Error creating team member:", error_11);
                            msg = error_11 instanceof Error ? error_11.message : String(error_11);
                            throw new Error("Failed to add team member: " + msg);
                        case 9: return [2 /*return*/];
                    }
                });
            });
        }),
        update: updateProcedure
            .input(zod_1.z.object({
            id: zod_1.z.string(),
            role: zod_1.z.string().optional(),
            hoursAllocated: zod_1.z.number().optional(),
            startDate: zod_1.z.string().optional(),
            endDate: zod_1.z.string().optional(),
            isActive: zod_1.z.boolean().optional()
        }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var database, updates, err_3, error_12;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            database = _b.sent();
                            if (!database)
                                throw new Error("Database not available");
                            updates = {};
                            if (input.role !== undefined)
                                updates.role = input.role;
                            if (input.hoursAllocated !== undefined)
                                updates.hoursAllocated = input.hoursAllocated;
                            if (input.startDate !== undefined)
                                updates.startDate = new Date(input.startDate).toISOString().replace('T', ' ').substring(0, 19);
                            if (input.endDate !== undefined)
                                updates.endDate = new Date(input.endDate).toISOString().replace('T', ' ').substring(0, 19);
                            if (input.isActive !== undefined)
                                updates.isActive = input.isActive;
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 8, , 9]);
                            return [4 /*yield*/, database.update(schema_extended_1.projectTeamMembers)
                                    .set(updates)
                                    .where(drizzle_orm_1.eq(schema_extended_1.projectTeamMembers.id, input.id))];
                        case 3:
                            _b.sent();
                            _b.label = 4;
                        case 4:
                            _b.trys.push([4, 6, , 7]);
                            return [4 /*yield*/, database.logActivity({
                                    userId: ctx.user.id,
                                    action: "team_member_updated",
                                    entityType: "projectTeamMember",
                                    entityId: input.id,
                                    description: "Updated team member assignment"
                                })];
                        case 5:
                            _b.sent();
                            return [3 /*break*/, 7];
                        case 6:
                            err_3 = _b.sent();
                            console.warn("Could not log activity:", err_3);
                            return [3 /*break*/, 7];
                        case 7: return [2 /*return*/, { success: true }];
                        case 8:
                            error_12 = _b.sent();
                            console.error("Error updating team member:", error_12);
                            throw new Error("Failed to update team member. Please ensure database is migrated.");
                        case 9: return [2 /*return*/];
                    }
                });
            });
        }),
        "delete": deleteProcedure
            .input(zod_1.z.object({ id: zod_1.z.string() }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var database, teamMember, err_4, error_13;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            database = _b.sent();
                            if (!database)
                                throw new Error("Database not available");
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 9, , 10]);
                            return [4 /*yield*/, database.select()
                                    .from(schema_extended_1.projectTeamMembers)
                                    .where(drizzle_orm_1.eq(schema_extended_1.projectTeamMembers.id, input.id))
                                    .limit(1)];
                        case 3:
                            teamMember = _b.sent();
                            return [4 /*yield*/, database["delete"](schema_extended_1.projectTeamMembers)
                                    .where(drizzle_orm_1.eq(schema_extended_1.projectTeamMembers.id, input.id))];
                        case 4:
                            _b.sent();
                            if (!(teamMember.length > 0)) return [3 /*break*/, 8];
                            _b.label = 5;
                        case 5:
                            _b.trys.push([5, 7, , 8]);
                            return [4 /*yield*/, database.logActivity({
                                    userId: ctx.user.id,
                                    action: "team_member_removed",
                                    entityType: "project",
                                    entityId: teamMember[0].projectId,
                                    description: "Removed staff member from project team"
                                })];
                        case 6:
                            _b.sent();
                            return [3 /*break*/, 8];
                        case 7:
                            err_4 = _b.sent();
                            console.warn("Could not log activity:", err_4);
                            return [3 /*break*/, 8];
                        case 8: return [2 /*return*/, { success: true }];
                        case 9:
                            error_13 = _b.sent();
                            console.error("Error deleting team member:", error_13);
                            throw new Error("Failed to delete team member. Please ensure database is migrated.");
                        case 10: return [2 /*return*/];
                    }
                });
            });
        }),
        // Bulk reassign team members to different projects
        bulkReassign: updateProcedure
            .input(zod_1.z.object({
            memberIds: zod_1.z.array(zod_1.z.string()),
            newProjectId: zod_1.z.string()
        }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var database, successCount, errors, _i, _b, memberId, member, oldProjectId, err_5, error_14, error_15;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            database = _c.sent();
                            if (!database)
                                throw new Error("Database not available");
                            successCount = 0;
                            errors = [];
                            _c.label = 2;
                        case 2:
                            _c.trys.push([2, 14, , 15]);
                            _i = 0, _b = input.memberIds;
                            _c.label = 3;
                        case 3:
                            if (!(_i < _b.length)) return [3 /*break*/, 13];
                            memberId = _b[_i];
                            _c.label = 4;
                        case 4:
                            _c.trys.push([4, 11, , 12]);
                            return [4 /*yield*/, database
                                    .select()
                                    .from(schema_extended_1.projectTeamMembers)
                                    .where(drizzle_orm_1.eq(schema_extended_1.projectTeamMembers.id, memberId))
                                    .limit(1)];
                        case 5:
                            member = _c.sent();
                            if (member.length === 0) {
                                errors.push("Team member " + memberId + " not found");
                                return [3 /*break*/, 12];
                            }
                            oldProjectId = member[0].projectId;
                            // Update project
                            return [4 /*yield*/, database
                                    .update(schema_extended_1.projectTeamMembers)
                                    .set({
                                    projectId: input.newProjectId,
                                    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                                })
                                    .where(drizzle_orm_1.eq(schema_extended_1.projectTeamMembers.id, memberId))];
                        case 6:
                            // Update project
                            _c.sent();
                            _c.label = 7;
                        case 7:
                            _c.trys.push([7, 9, , 10]);
                            return [4 /*yield*/, database.logActivity({
                                    userId: ctx.user.id,
                                    action: "team_member_reassigned",
                                    entityType: "projectTeamMember",
                                    entityId: memberId,
                                    description: "Reassigned from project " + oldProjectId + " to " + input.newProjectId
                                })];
                        case 8:
                            _c.sent();
                            return [3 /*break*/, 10];
                        case 9:
                            err_5 = _c.sent();
                            console.warn("Could not log activity:", err_5);
                            return [3 /*break*/, 10];
                        case 10:
                            successCount++;
                            return [3 /*break*/, 12];
                        case 11:
                            error_14 = _c.sent();
                            errors.push("Failed to reassign member " + memberId + ": " + error_14.message);
                            return [3 /*break*/, 12];
                        case 12:
                            _i++;
                            return [3 /*break*/, 3];
                        case 13: return [2 /*return*/, { success: true, successCount: successCount, errors: errors, totalRequested: input.memberIds.length }];
                        case 14:
                            error_15 = _c.sent();
                            throw new Error("Bulk reassign failed: " + error_15.message);
                        case 15: return [2 /*return*/];
                    }
                });
            });
        }),
        // Bulk update team members (role, hours, dates)
        bulkUpdate: updateProcedure
            .input(zod_1.z.object({
            memberIds: zod_1.z.array(zod_1.z.string()),
            updates: zod_1.z.object({
                role: zod_1.z.string().optional(),
                hoursAllocated: zod_1.z.number().optional(),
                startDate: zod_1.z.string().optional(),
                endDate: zod_1.z.string().optional(),
                isActive: zod_1.z.boolean().optional()
            })
        }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var database, successCount, errors, updateObj, _i, _b, memberId, member, err_6, error_16, error_17;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            database = _c.sent();
                            if (!database)
                                throw new Error("Database not available");
                            successCount = 0;
                            errors = [];
                            _c.label = 2;
                        case 2:
                            _c.trys.push([2, 14, , 15]);
                            updateObj = {
                                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            };
                            if (input.updates.role !== undefined)
                                updateObj.role = input.updates.role;
                            if (input.updates.hoursAllocated !== undefined)
                                updateObj.hoursAllocated = input.updates.hoursAllocated;
                            if (input.updates.startDate !== undefined)
                                updateObj.startDate = new Date(input.updates.startDate).toISOString().replace('T', ' ').substring(0, 19);
                            if (input.updates.endDate !== undefined)
                                updateObj.endDate = new Date(input.updates.endDate).toISOString().replace('T', ' ').substring(0, 19);
                            if (input.updates.isActive !== undefined)
                                updateObj.isActive = input.updates.isActive;
                            _i = 0, _b = input.memberIds;
                            _c.label = 3;
                        case 3:
                            if (!(_i < _b.length)) return [3 /*break*/, 13];
                            memberId = _b[_i];
                            _c.label = 4;
                        case 4:
                            _c.trys.push([4, 11, , 12]);
                            return [4 /*yield*/, database
                                    .select()
                                    .from(schema_extended_1.projectTeamMembers)
                                    .where(drizzle_orm_1.eq(schema_extended_1.projectTeamMembers.id, memberId))
                                    .limit(1)];
                        case 5:
                            member = _c.sent();
                            if (member.length === 0) {
                                errors.push("Team member " + memberId + " not found");
                                return [3 /*break*/, 12];
                            }
                            // Update
                            return [4 /*yield*/, database
                                    .update(schema_extended_1.projectTeamMembers)
                                    .set(updateObj)
                                    .where(drizzle_orm_1.eq(schema_extended_1.projectTeamMembers.id, memberId))];
                        case 6:
                            // Update
                            _c.sent();
                            _c.label = 7;
                        case 7:
                            _c.trys.push([7, 9, , 10]);
                            return [4 /*yield*/, database.logActivity({
                                    userId: ctx.user.id,
                                    action: "team_member_bulk_updated",
                                    entityType: "projectTeamMember",
                                    entityId: memberId,
                                    description: "Updated team member assignment fields"
                                })];
                        case 8:
                            _c.sent();
                            return [3 /*break*/, 10];
                        case 9:
                            err_6 = _c.sent();
                            console.warn("Could not log activity:", err_6);
                            return [3 /*break*/, 10];
                        case 10:
                            successCount++;
                            return [3 /*break*/, 12];
                        case 11:
                            error_16 = _c.sent();
                            errors.push("Failed to update member " + memberId + ": " + error_16.message);
                            return [3 /*break*/, 12];
                        case 12:
                            _i++;
                            return [3 /*break*/, 3];
                        case 13: return [2 /*return*/, { success: true, successCount: successCount, errors: errors, totalRequested: input.memberIds.length }];
                        case 14:
                            error_17 = _c.sent();
                            throw new Error("Bulk update failed: " + error_17.message);
                        case 15: return [2 /*return*/];
                    }
                });
            });
        }),
        // Bulk delete team members
        bulkDelete: trpc_1.createFeatureRestrictedProcedure("projects:edit")
            .input(zod_1.z.object({ memberIds: zod_1.z.array(zod_1.z.string()) }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var database, successCount, errors, _i, _b, memberId, member, err_7, error_18, error_19;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            database = _c.sent();
                            if (!database)
                                throw new Error("Database not available");
                            successCount = 0;
                            errors = [];
                            _c.label = 2;
                        case 2:
                            _c.trys.push([2, 14, , 15]);
                            _i = 0, _b = input.memberIds;
                            _c.label = 3;
                        case 3:
                            if (!(_i < _b.length)) return [3 /*break*/, 13];
                            memberId = _b[_i];
                            _c.label = 4;
                        case 4:
                            _c.trys.push([4, 11, , 12]);
                            return [4 /*yield*/, database
                                    .select()
                                    .from(schema_extended_1.projectTeamMembers)
                                    .where(drizzle_orm_1.eq(schema_extended_1.projectTeamMembers.id, memberId))
                                    .limit(1)];
                        case 5:
                            member = _c.sent();
                            if (member.length === 0) {
                                errors.push("Team member " + memberId + " not found");
                                return [3 /*break*/, 12];
                            }
                            // Delete
                            return [4 /*yield*/, database["delete"](schema_extended_1.projectTeamMembers).where(drizzle_orm_1.eq(schema_extended_1.projectTeamMembers.id, memberId))];
                        case 6:
                            // Delete
                            _c.sent();
                            _c.label = 7;
                        case 7:
                            _c.trys.push([7, 9, , 10]);
                            return [4 /*yield*/, database.logActivity({
                                    userId: ctx.user.id,
                                    action: "team_member_deleted",
                                    entityType: "project",
                                    entityId: member[0].projectId,
                                    description: "Bulk removed staff member from project team"
                                })];
                        case 8:
                            _c.sent();
                            return [3 /*break*/, 10];
                        case 9:
                            err_7 = _c.sent();
                            console.warn("Could not log activity:", err_7);
                            return [3 /*break*/, 10];
                        case 10:
                            successCount++;
                            return [3 /*break*/, 12];
                        case 11:
                            error_18 = _c.sent();
                            errors.push("Failed to delete member " + memberId + ": " + error_18.message);
                            return [3 /*break*/, 12];
                        case 12:
                            _i++;
                            return [3 /*break*/, 3];
                        case 13: return [2 /*return*/, { success: true, successCount: successCount, errors: errors, totalRequested: input.memberIds.length }];
                        case 14:
                            error_19 = _c.sent();
                            throw new Error("Bulk delete failed: " + error_19.message);
                        case 15: return [2 /*return*/];
                    }
                });
            });
        }),
        // Get team workload summary for dashboard
        teamWorkloadSummary: readProcedure.query(function (_a) {
            var ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var database, teamMembers, allEmployees, employeeMap, allProjects, projectMap, workloadByEmployee, _i, teamMembers_1, member, employee, project, empId, hours, standardWeeklyHours_1, result, error_20;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            database = _b.sent();
                            if (!database)
                                return [2 /*return*/, []];
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 6, , 7]);
                            return [4 /*yield*/, database
                                    .select()
                                    .from(schema_extended_1.projectTeamMembers)
                                    .where(drizzle_orm_1.eq(schema_extended_1.projectTeamMembers.isActive, true))];
                        case 3:
                            teamMembers = _b.sent();
                            if (teamMembers.length === 0)
                                return [2 /*return*/, []];
                            return [4 /*yield*/, database.select().from(schema_1.employees)];
                        case 4:
                            allEmployees = _b.sent();
                            employeeMap = new Map(allEmployees.map(function (e) { return [e.id, e]; }));
                            return [4 /*yield*/, database.select().from(schema_1.projects)];
                        case 5:
                            allProjects = _b.sent();
                            projectMap = new Map(allProjects.map(function (p) { return [p.id, p]; }));
                            workloadByEmployee = {};
                            for (_i = 0, teamMembers_1 = teamMembers; _i < teamMembers_1.length; _i++) {
                                member = teamMembers_1[_i];
                                employee = employeeMap.get(member.employeeId);
                                project = projectMap.get(member.projectId);
                                if (!employee)
                                    continue; // Skip if employee doesn't exist
                                empId = member.employeeId;
                                if (!workloadByEmployee[empId]) {
                                    workloadByEmployee[empId] = {
                                        employeeId: empId,
                                        name: ((employee.firstName || '') + " " + (employee.lastName || '')).trim(),
                                        firstName: employee.firstName,
                                        lastName: employee.lastName,
                                        department: employee.department || '',
                                        position: employee.position || '',
                                        status: employee.status,
                                        totalHoursAllocated: 0,
                                        projects: [],
                                        utilizationPercentage: 0
                                    };
                                }
                                hours = member.hoursAllocated || 0;
                                workloadByEmployee[empId].totalHoursAllocated += hours;
                                workloadByEmployee[empId].projects.push({
                                    teamMemberId: member.id,
                                    projectId: member.projectId,
                                    projectName: (project === null || project === void 0 ? void 0 : project.name) || 'Unknown Project',
                                    projectStatus: (project === null || project === void 0 ? void 0 : project.status) || 'pending',
                                    hoursAllocated: hours,
                                    role: member.role,
                                    startDate: member.startDate,
                                    endDate: member.endDate
                                });
                            }
                            standardWeeklyHours_1 = 40;
                            result = Object.values(workloadByEmployee)
                                .map(function (emp) { return (__assign(__assign({}, emp), { utilizationPercentage: Math.min(100, Math.round((emp.totalHoursAllocated / standardWeeklyHours_1) * 100)) })); })
                                .sort(function (a, b) {
                                // Sort by utilization descending, then by name
                                if (b.utilizationPercentage !== a.utilizationPercentage) {
                                    return b.utilizationPercentage - a.utilizationPercentage;
                                }
                                return a.name.localeCompare(b.name);
                            });
                            return [2 /*return*/, result];
                        case 6:
                            error_20 = _b.sent();
                            console.error("Error fetching team workload summary:", error_20);
                            return [2 /*return*/, []];
                        case 7: return [2 /*return*/];
                    }
                });
            });
        })
    })
});
