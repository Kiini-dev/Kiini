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
exports.leadsRouter = void 0;
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var drizzle_orm_1 = require("drizzle-orm");
var schema_extended_1 = require("../../drizzle/schema-extended");
var uuid_1 = require("uuid");
var db = require("../db");
var server_1 = require("@trpc/server");
/**
 * Leads Management Router
 * Handles sales leads and pipeline management
 * Africa-focused with multi-currency and channel tracking
 */
var viewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("sales:leads:view");
var createProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("sales:leads:create");
var updateProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("sales:leads:update");
exports.leadsRouter = trpc_1.router({
    list: viewProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().optional(),
        offset: zod_1.z.number().optional(),
        status: zod_1.z.string().optional(),
        source: zod_1.z.string().optional(),
        assignedTo: zod_1.z.string().optional()
    }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db_2, orgId, conditions, where, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db_2 = _b.sent();
                        if (!db_2)
                            return [2 /*return*/, []];
                        orgId = ctx.user.organizationId;
                        conditions = [];
                        if (orgId)
                            conditions.push(drizzle_orm_1.eq(schema_extended_1.leads.organizationId, orgId));
                        if (input === null || input === void 0 ? void 0 : input.status)
                            conditions.push(drizzle_orm_1.eq(schema_extended_1.leads.status, input.status));
                        if (input === null || input === void 0 ? void 0 : input.source)
                            conditions.push(drizzle_orm_1.eq(schema_extended_1.leads.source, input.source));
                        if (input === null || input === void 0 ? void 0 : input.assignedTo)
                            conditions.push(drizzle_orm_1.eq(schema_extended_1.leads.assignedTo, input.assignedTo));
                        where = conditions.length > 0 ? drizzle_orm_1.and.apply(void 0, conditions) : undefined;
                        return [4 /*yield*/, db_2.select().from(schema_extended_1.leads)
                                .where(where)
                                .orderBy(drizzle_orm_1.desc(schema_extended_1.leads.createdAt))
                                .limit((input === null || input === void 0 ? void 0 : input.limit) || 50)
                                .offset((input === null || input === void 0 ? void 0 : input.offset) || 0)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3:
                        error_1 = _b.sent();
                        console.error("Error listing leads:", error_1);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    getById: viewProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db_3, orgId, where, result, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db_3 = _b.sent();
                        if (!db_3)
                            return [2 /*return*/, null];
                        orgId = ctx.user.organizationId;
                        where = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_extended_1.leads.id, input), drizzle_orm_1.eq(schema_extended_1.leads.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_extended_1.leads.id, input);
                        return [4 /*yield*/, db_3.select().from(schema_extended_1.leads).where(where).limit(1)];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, result[0] || null];
                    case 3:
                        error_2 = _b.sent();
                        console.error("Error fetching lead:", error_2);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    create: createProcedure
        .input(zod_1.z.object({
        companyName: zod_1.z.string(),
        contactName: zod_1.z.string(),
        email: zod_1.z.string().email(),
        phone: zod_1.z.string(),
        source: zod_1.z["enum"](["website", "referral", "social_media", "cold_outreach", "event", "trade_show", "other"]),
        estimatedValue: zod_1.z.number().optional(),
        currency: zod_1.z.string()["default"]("KES"),
        status: zod_1.z["enum"](["new", "contacted", "qualified", "proposal_sent", "negotiating", "closed_won", "closed_lost"])["default"]("new"),
        country: zod_1.z.string()["default"]("KE"),
        industry: zod_1.z.string().optional(),
        assignedTo: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, id, now, leadNo, error_3;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error("Database not available");
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 5, , 6]);
                        id = uuid_1.v4();
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        leadNo = "LEAD-" + new Date().getFullYear() + "-" + String(Math.random() * 100000).padStart(6, '0');
                        return [4 /*yield*/, database.insert(schema_extended_1.leads).values({
                                id: id,
                                organizationId: (_b = ctx.user.organizationId) !== null && _b !== void 0 ? _b : null,
                                leadNo: leadNo,
                                companyName: input.companyName,
                                contactName: input.contactName,
                                email: input.email,
                                phone: input.phone,
                                source: input.source,
                                estimatedValue: input.estimatedValue || 0,
                                currency: input.currency,
                                country: input.country,
                                industry: input.industry || null,
                                status: input.status,
                                assignedTo: input.assignedTo || null,
                                notes: input.notes || null,
                                createdBy: ctx.user.id,
                                createdAt: now,
                                updatedAt: now
                            })];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "lead_created",
                                entityType: "lead",
                                entityId: id,
                                description: "New lead created: " + input.companyName + " (" + input.contactName + ") from " + input.source
                            })];
                    case 4:
                        _c.sent();
                        return [2 /*return*/, { id: id, leadNo: leadNo }];
                    case 5:
                        error_3 = _c.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to create lead: " + error_3.message
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    update: updateProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        status: zod_1.z.string().optional(),
        estimatedValue: zod_1.z.number().optional(),
        assignedTo: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, now, updates, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        updates = { updatedAt: now };
                        if (input.status)
                            updates.status = input.status;
                        if (input.estimatedValue !== undefined)
                            updates.estimatedValue = input.estimatedValue;
                        if (input.assignedTo)
                            updates.assignedTo = input.assignedTo;
                        if (input.notes)
                            updates.notes = input.notes;
                        return [4 /*yield*/, database.update(schema_extended_1.leads).set(updates).where(drizzle_orm_1.eq(schema_extended_1.leads.id, input.id))];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "lead_updated",
                                entityType: "lead",
                                entityId: input.id,
                                description: "Lead updated: " + JSON.stringify(input)
                            })];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 5:
                        error_4 = _b.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to update lead: " + error_4.message
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    // Convert lead to opportunity/client
    convertToOpportunity: updateProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var leadId = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, result, lead, opportunityId, now, error_5;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error("Database not available");
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 7, , 8]);
                        return [4 /*yield*/, database.select().from(schema_extended_1.leads).where(drizzle_orm_1.eq(schema_extended_1.leads.id, leadId)).limit(1)];
                    case 3:
                        result = _c.sent();
                        if (!result.length)
                            throw new Error("Lead not found");
                        lead = result[0];
                        opportunityId = uuid_1.v4();
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        // Create opportunity from lead
                        return [4 /*yield*/, database.insert("opportunities").values({
                                id: opportunityId,
                                organizationId: (_b = ctx.user.organizationId) !== null && _b !== void 0 ? _b : null,
                                leadId: leadId,
                                clientName: lead.companyName,
                                value: lead.estimatedValue || 0,
                                currency: lead.currency,
                                stage: "qualified",
                                probability: 0.25,
                                createdBy: ctx.user.id,
                                createdAt: now
                            })];
                    case 4:
                        // Create opportunity from lead
                        _c.sent();
                        // Update lead status
                        return [4 /*yield*/, database.update(schema_extended_1.leads).set({
                                status: "qualified",
                                updatedAt: now
                            }).where(drizzle_orm_1.eq(schema_extended_1.leads.id, leadId))];
                    case 5:
                        // Update lead status
                        _c.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "lead_converted",
                                entityType: "lead",
                                entityId: leadId,
                                description: "Lead " + lead.leadNo + " converted to opportunity " + opportunityId
                            })];
                    case 6:
                        _c.sent();
                        return [2 /*return*/, { success: true, opportunityId: opportunityId }];
                    case 7:
                        error_5 = _c.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to convert lead: " + error_5.message
                        });
                    case 8: return [2 /*return*/];
                }
            });
        });
    })
});
