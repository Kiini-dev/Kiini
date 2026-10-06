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
exports.ticketsRouter = void 0;
var server_1 = require("@trpc/server");
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var uuid_1 = require("uuid");
var schema_extended_1 = require("../../drizzle/schema-extended");
var drizzle_orm_1 = require("drizzle-orm");
// Feature-based procedures
var readProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("tickets:read");
var createProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("tickets:create");
var updateProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("tickets:edit");
var deleteProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("tickets:delete");
exports.ticketsRouter = trpc_1.router({
    list: readProcedure
        .input(zod_1.z.object({ clientId: zod_1.z.string().optional(), status: zod_1.z.string().optional(), limit: zod_1.z.number().optional(), offset: zod_1.z.number().optional() }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, filters, where;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        orgId = ctx.user.organizationId || "";
                        filters = [drizzle_orm_1.eq(schema_extended_1.tickets.organizationId, orgId)];
                        if (input === null || input === void 0 ? void 0 : input.clientId)
                            filters.push(drizzle_orm_1.eq(schema_extended_1.tickets.clientId, input.clientId));
                        if (input === null || input === void 0 ? void 0 : input.status)
                            filters.push(drizzle_orm_1.eq(schema_extended_1.tickets.status, input.status));
                        where = filters.length === 1 ? filters[0] : drizzle_orm_1.and.apply(void 0, filters);
                        return [4 /*yield*/, db.select().from(schema_extended_1.tickets).where(where).limit((input === null || input === void 0 ? void 0 : input.limit) || 100).offset((input === null || input === void 0 ? void 0 : input.offset) || 0)];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    getById: readProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, where, rows, ticket, comments, tasks;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        orgId = ctx.user.organizationId || "";
                        where = drizzle_orm_1.and(drizzle_orm_1.eq(schema_extended_1.tickets.id, input), drizzle_orm_1.eq(schema_extended_1.tickets.organizationId, orgId));
                        return [4 /*yield*/, db.select().from(schema_extended_1.tickets).where(where).limit(1)];
                    case 2:
                        rows = _b.sent();
                        if (rows.length === 0)
                            return [2 /*return*/, null];
                        ticket = rows[0];
                        return [4 /*yield*/, db.select().from(schema_extended_1.ticketComments).where(drizzle_orm_1.eq(schema_extended_1.ticketComments.ticketId, input))];
                    case 3:
                        comments = _b.sent();
                        return [4 /*yield*/, db.select().from(schema_extended_1.ticketTasks).where(drizzle_orm_1.eq(schema_extended_1.ticketTasks.ticketId, input))];
                    case 4:
                        tasks = _b.sent();
                        return [2 /*return*/, __assign(__assign({}, ticket), { comments: comments, tasks: tasks })];
                }
            });
        });
    }),
    create: createProcedure
        .input(zod_1.z.object({
        clientId: zod_1.z.string(),
        title: zod_1.z.string().min(3),
        description: zod_1.z.string().optional(),
        category: zod_1.z.string().optional(),
        priority: zod_1.z["enum"](["low", "medium", "high"]).optional(),
        requestedDueDate: zod_1.z.string().optional()
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
                            throw new Error("DB not available");
                        if (!ctx.user.organizationId) {
                            throw new server_1.TRPCError({ code: "FORBIDDEN", message: "Organization context required" });
                        }
                        id = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_extended_1.tickets).values({
                                id: id,
                                clientId: input.clientId,
                                title: input.title,
                                description: input.description || null,
                                category: input.category || null,
                                priority: input.priority || "medium",
                                status: "new",
                                requestedDueDate: input.requestedDueDate || null,
                                createdBy: ctx.user.id,
                                organizationId: ctx.user.organizationId
                            })];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, db_1.logActivity({
                                userId: ctx.user.id,
                                action: "ticket:create",
                                entityType: "ticket",
                                entityId: id,
                                description: "Created ticket " + input.title,
                                metadata: JSON.stringify({ clientId: input.clientId, priority: input.priority || "medium" })
                            })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { id: id }];
                }
            });
        });
    }),
    update: updateProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        title: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        category: zod_1.z.string().optional(),
        priority: zod_1.z["enum"](["low", "medium", "high"]).optional(),
        status: zod_1.z.string().optional(),
        assignedTo: zod_1.z.string().optional(),
        requestedDueDate: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, ownerCheck, existing, upd;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("DB not available");
                        if (!ctx.user.organizationId) {
                            throw new server_1.TRPCError({ code: "FORBIDDEN", message: "Organization context required" });
                        }
                        orgId = ctx.user.organizationId;
                        ownerCheck = drizzle_orm_1.and(drizzle_orm_1.eq(schema_extended_1.tickets.id, input.id), drizzle_orm_1.eq(schema_extended_1.tickets.organizationId, orgId));
                        return [4 /*yield*/, db.select().from(schema_extended_1.tickets).where(ownerCheck).limit(1)];
                    case 2:
                        existing = _b.sent();
                        if (!existing.length)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
                        upd = { updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) };
                        if (input.title !== undefined)
                            upd.title = input.title;
                        if (input.description !== undefined)
                            upd.description = input.description;
                        if (input.category !== undefined)
                            upd.category = input.category;
                        if (input.priority !== undefined)
                            upd.priority = input.priority;
                        if (input.status !== undefined)
                            upd.status = input.status;
                        if (input.assignedTo !== undefined)
                            upd.assignedTo = input.assignedTo;
                        if (input.requestedDueDate !== undefined)
                            upd.requestedDueDate = input.requestedDueDate;
                        return [4 /*yield*/, db.update(schema_extended_1.tickets).set(upd).where(ownerCheck)];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, db_1.logActivity({
                                userId: ctx.user.id,
                                action: "ticket:update",
                                entityType: "ticket",
                                entityId: input.id,
                                description: "Updated ticket " + input.id,
                                metadata: JSON.stringify({ fields: Object.keys(upd) })
                            })];
                    case 4:
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
            var db, where;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("DB not available");
                        if (!ctx.user.organizationId) {
                            throw new server_1.TRPCError({ code: "FORBIDDEN", message: "Organization context required" });
                        }
                        where = drizzle_orm_1.and(drizzle_orm_1.eq(schema_extended_1.tickets.id, input), drizzle_orm_1.eq(schema_extended_1.tickets.organizationId, ctx.user.organizationId));
                        return [4 /*yield*/, db["delete"](schema_extended_1.tickets).where(where)];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, db_1.logActivity({
                                userId: ctx.user.id,
                                action: "ticket:delete",
                                entityType: "ticket",
                                entityId: input,
                                description: "Deleted ticket " + input
                            })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    addComment: createProcedure
        .input(zod_1.z.object({ ticketId: zod_1.z.string(), body: zod_1.z.string().min(1) }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, ticket, id;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("DB not available");
                        if (!ctx.user.organizationId) {
                            throw new server_1.TRPCError({ code: "FORBIDDEN", message: "Organization context required" });
                        }
                        return [4 /*yield*/, db.select().from(schema_extended_1.tickets).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_extended_1.tickets.id, input.ticketId), drizzle_orm_1.eq(schema_extended_1.tickets.organizationId, ctx.user.organizationId))).limit(1)];
                    case 2:
                        ticket = _b.sent();
                        if (!ticket.length)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
                        id = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_extended_1.ticketComments).values({ id: id, ticketId: input.ticketId, authorId: ctx.user.id, body: input.body })];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, db_1.logActivity({
                                userId: ctx.user.id,
                                action: "ticket:addComment",
                                entityType: "ticket_comment",
                                entityId: id,
                                description: "Added comment to ticket " + input.ticketId
                            })];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, { id: id }];
                }
            });
        });
    }),
    createTask: createProcedure
        .input(zod_1.z.object({ ticketId: zod_1.z.string(), serviceType: zod_1.z.string(), details: zod_1.z.string().optional(), budget: zod_1.z.number().optional(), dueDate: zod_1.z.string().optional() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, ticket, id;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("DB not available");
                        if (!ctx.user.organizationId) {
                            throw new server_1.TRPCError({ code: "FORBIDDEN", message: "Organization context required" });
                        }
                        return [4 /*yield*/, db.select().from(schema_extended_1.tickets).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_extended_1.tickets.id, input.ticketId), drizzle_orm_1.eq(schema_extended_1.tickets.organizationId, ctx.user.organizationId))).limit(1)];
                    case 2:
                        ticket = _b.sent();
                        if (!ticket.length)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
                        id = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_extended_1.ticketTasks).values({
                                id: id,
                                ticketId: input.ticketId,
                                serviceType: input.serviceType,
                                details: input.details || null,
                                budget: input.budget || null,
                                dueDate: input.dueDate || null
                            })];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, db_1.logActivity({
                                userId: ctx.user.id,
                                action: "ticket:createTask",
                                entityType: "ticket_task",
                                entityId: id,
                                description: "Created task for ticket " + input.ticketId,
                                metadata: JSON.stringify({ serviceType: input.serviceType, dueDate: input.dueDate })
                            })];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, { id: id }];
                }
            });
        });
    })
});
