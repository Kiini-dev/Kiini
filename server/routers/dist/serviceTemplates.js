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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.serviceTemplatesRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_extended_1 = require("../../drizzle/schema-extended");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var db = require("../db");
// Define typed procedures
var readProcedure = trpc_1.createFeatureRestrictedProcedure("services:read");
var createProcedure = trpc_1.createFeatureRestrictedProcedure("services:create");
var updateProcedure = trpc_1.createFeatureRestrictedProcedure("services:update");
var deleteProcedure = trpc_1.createFeatureRestrictedProcedure("services:delete");
exports.serviceTemplatesRouter = trpc_1.router({
    // List all service templates
    list: readProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().optional(),
        offset: zod_1.z.number().optional(),
        category: zod_1.z.string().optional(),
        search: zod_1.z.string().optional()
    }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, baseConditions, query;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        orgId = (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId;
                        baseConditions = orgId
                            ? [drizzle_orm_1.eq(schema_extended_1.serviceTemplates.isActive, true), drizzle_orm_1.eq(schema_extended_1.serviceTemplates.organizationId, orgId)]
                            : [drizzle_orm_1.eq(schema_extended_1.serviceTemplates.isActive, true)];
                        query = database
                            .select()
                            .from(schema_extended_1.serviceTemplates)
                            .where(drizzle_orm_1.and.apply(void 0, baseConditions));
                        if (input === null || input === void 0 ? void 0 : input.category) {
                            query = database
                                .select()
                                .from(schema_extended_1.serviceTemplates)
                                .where(drizzle_orm_1.and.apply(void 0, __spreadArrays(baseConditions, [drizzle_orm_1.eq(schema_extended_1.serviceTemplates.category, input.category)])));
                        }
                        if (input === null || input === void 0 ? void 0 : input.search) {
                            query = database
                                .select()
                                .from(schema_extended_1.serviceTemplates)
                                .where(drizzle_orm_1.and.apply(void 0, __spreadArrays(baseConditions, [drizzle_orm_1.like(schema_extended_1.serviceTemplates.name, "%" + input.search + "%")])));
                        }
                        return [4 /*yield*/, query
                                .orderBy(drizzle_orm_1.desc(schema_extended_1.serviceTemplates.createdAt))
                                .limit((input === null || input === void 0 ? void 0 : input.limit) || 50)
                                .offset((input === null || input === void 0 ? void 0 : input.offset) || 0)];
                    case 2: return [2 /*return*/, _c.sent()];
                }
            });
        });
    }),
    // Get single template by ID
    getById: readProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_extended_1.serviceTemplates)
                                .where(drizzle_orm_1.eq(schema_extended_1.serviceTemplates.id, input))
                                .limit(1)];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, result[0] || null];
                }
            });
        });
    }),
    // Get usage statistics for a template
    getUsageStats: readProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, usages, template, totalUsages, totalQuantity, totalDuration, hourlyRate, fixedPrice, estimatedRevenue, statusBreakdown;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_extended_1.serviceUsageTracking)
                                .where(drizzle_orm_1.eq(schema_extended_1.serviceUsageTracking.serviceTemplateId, input))];
                    case 2:
                        usages = _b.sent();
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_extended_1.serviceTemplates)
                                .where(drizzle_orm_1.eq(schema_extended_1.serviceTemplates.id, input))
                                .limit(1)];
                    case 3:
                        template = _b.sent();
                        if (!template[0])
                            return [2 /*return*/, null];
                        totalUsages = usages.length;
                        totalQuantity = usages.reduce(function (sum, u) { return sum + (u.quantity || 0); }, 0);
                        totalDuration = usages.reduce(function (sum, u) { return sum + (u.duration || 0); }, 0);
                        hourlyRate = template[0].hourlyRate || 0;
                        fixedPrice = template[0].fixedPrice || 0;
                        estimatedRevenue = (totalDuration * hourlyRate) + (totalQuantity * fixedPrice);
                        statusBreakdown = usages.reduce(function (acc, u) {
                            acc[u.status] = (acc[u.status] || 0) + 1;
                            return acc;
                        }, {});
                        return [2 /*return*/, {
                                template: template[0],
                                totalUsages: totalUsages,
                                totalQuantity: totalQuantity,
                                totalDuration: totalDuration,
                                estimatedRevenue: estimatedRevenue,
                                statusBreakdown: statusBreakdown,
                                lastUsed: usages.length > 0
                                    ? new Date(Math.max.apply(Math, usages.map(function (u) { return new Date(u.usageDate).getTime(); })))
                                    : null
                            }];
                }
            });
        });
    }),
    // Create new template
    create: createProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string().min(1, "Name required"),
        description: zod_1.z.string().optional(),
        category: zod_1.z.string().optional(),
        hourlyRate: zod_1.z.number().optional(),
        fixedPrice: zod_1.z.number().optional(),
        unit: zod_1.z.string().optional(),
        taxRate: zod_1.z.number().optional(),
        estimatedDuration: zod_1.z.number().optional(),
        deliverables: zod_1.z.array(zod_1.z.string()).optional(),
        terms: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, id, error_1;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error("Database not available");
                        id = uuid_1.v4();
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, database.insert(schema_extended_1.serviceTemplates).values({
                                id: id,
                                organizationId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || null,
                                name: input.name,
                                description: input.description,
                                category: input.category,
                                hourlyRate: input.hourlyRate ? Math.round(input.hourlyRate * 100) : null,
                                fixedPrice: input.fixedPrice ? Math.round(input.fixedPrice * 100) : null,
                                unit: input.unit || "hour",
                                taxRate: input.taxRate || 0,
                                estimatedDuration: input.estimatedDuration,
                                deliverables: input.deliverables ? JSON.stringify(input.deliverables) : null,
                                terms: input.terms,
                                isActive: true,
                                createdBy: ctx.user.id,
                                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "service_template_created",
                                entityType: "serviceTemplate",
                                entityId: id,
                                description: "Created service template: " + input.name
                            })];
                    case 4:
                        _c.sent();
                        return [2 /*return*/, { id: id }];
                    case 5:
                        error_1 = _c.sent();
                        console.error("Error creating service template:", error_1);
                        throw new Error("Failed to create service template");
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    // Update template
    update: updateProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        category: zod_1.z.string().optional(),
        hourlyRate: zod_1.z.number().optional(),
        fixedPrice: zod_1.z.number().optional(),
        taxRate: zod_1.z.number().optional(),
        estimatedDuration: zod_1.z.number().optional(),
        deliverables: zod_1.z.array(zod_1.z.string()).optional(),
        terms: zod_1.z.string().optional(),
        isActive: zod_1.z.boolean().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, updates, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        updates = {
                            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        };
                        if (input.name)
                            updates.name = input.name;
                        if (input.description !== undefined)
                            updates.description = input.description;
                        if (input.category !== undefined)
                            updates.category = input.category;
                        if (input.hourlyRate !== undefined)
                            updates.hourlyRate = input.hourlyRate ? Math.round(input.hourlyRate * 100) : null;
                        if (input.fixedPrice !== undefined)
                            updates.fixedPrice = input.fixedPrice ? Math.round(input.fixedPrice * 100) : null;
                        if (input.taxRate !== undefined)
                            updates.taxRate = input.taxRate;
                        if (input.estimatedDuration !== undefined)
                            updates.estimatedDuration = input.estimatedDuration;
                        if (input.deliverables !== undefined)
                            updates.deliverables = JSON.stringify(input.deliverables);
                        if (input.terms !== undefined)
                            updates.terms = input.terms;
                        if (input.isActive !== undefined)
                            updates.isActive = input.isActive;
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, database
                                .update(schema_extended_1.serviceTemplates)
                                .set(updates)
                                .where(drizzle_orm_1.eq(schema_extended_1.serviceTemplates.id, input.id))];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "service_template_updated",
                                entityType: "serviceTemplate",
                                entityId: input.id,
                                description: "Updated service template"
                            })];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 5:
                        error_2 = _b.sent();
                        console.error("Error updating service template:", error_2);
                        throw new Error("Failed to update service template");
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    // Delete (soft delete)
    "delete": deleteProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, error_3;
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
                        return [4 /*yield*/, database
                                .update(schema_extended_1.serviceTemplates)
                                .set({ isActive: false, updatedAt: new Date() })
                                .where(drizzle_orm_1.eq(schema_extended_1.serviceTemplates.id, input))];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "service_template_deleted",
                                entityType: "serviceTemplate",
                                entityId: input,
                                description: "Deleted service template"
                            })];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 5:
                        error_3 = _b.sent();
                        console.error("Error deleting service template:", error_3);
                        throw new Error("Failed to delete service template");
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    // Usage tracking
    trackUsage: createProcedure
        .input(zod_1.z.object({
        serviceTemplateId: zod_1.z.string(),
        invoiceId: zod_1.z.string().optional(),
        estimateId: zod_1.z.string().optional(),
        projectId: zod_1.z.string().optional(),
        clientId: zod_1.z.string(),
        quantity: zod_1.z.number()["default"](1),
        duration: zod_1.z.number().optional(),
        usageDate: zod_1.z.string(),
        status: zod_1.z["enum"](["pending", "delivered", "invoiced", "paid", "cancelled"]),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, id, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        id = uuid_1.v4();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, database.insert(schema_extended_1.serviceUsageTracking).values({
                                id: id,
                                serviceTemplateId: input.serviceTemplateId,
                                invoiceId: input.invoiceId,
                                estimateId: input.estimateId,
                                projectId: input.projectId,
                                clientId: input.clientId,
                                quantity: input.quantity,
                                duration: input.duration,
                                usageDate: new Date(input.usageDate),
                                status: input.status,
                                notes: input.notes,
                                createdBy: ctx.user.id,
                                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "service_usage_tracked",
                                entityType: "serviceUsage",
                                entityId: id,
                                description: "Tracked service usage"
                            })];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, { id: id }];
                    case 5:
                        error_4 = _b.sent();
                        console.error("Error tracking service usage:", error_4);
                        throw new Error("Failed to track service usage");
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    // Get usage history for a template
    getUsageHistory: readProcedure
        .input(zod_1.z.object({
        serviceTemplateId: zod_1.z.string(),
        limit: zod_1.z.number().optional(),
        offset: zod_1.z.number().optional(),
        dateFrom: zod_1.z.string().optional(),
        dateTo: zod_1.z.string().optional()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, query;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        query = database
                            .select()
                            .from(schema_extended_1.serviceUsageTracking)
                            .where(drizzle_orm_1.eq(schema_extended_1.serviceUsageTracking.serviceTemplateId, input.serviceTemplateId));
                        if (input.dateFrom) {
                            query = database
                                .select()
                                .from(schema_extended_1.serviceUsageTracking)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_extended_1.serviceUsageTracking.serviceTemplateId, input.serviceTemplateId), drizzle_orm_1.gte(schema_extended_1.serviceUsageTracking.usageDate, new Date(input.dateFrom))));
                        }
                        if (input.dateTo) {
                            query = database
                                .select()
                                .from(schema_extended_1.serviceUsageTracking)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_extended_1.serviceUsageTracking.serviceTemplateId, input.serviceTemplateId), drizzle_orm_1.lte(schema_extended_1.serviceUsageTracking.usageDate, new Date(input.dateTo))));
                        }
                        return [4 /*yield*/, query
                                .orderBy(drizzle_orm_1.desc(schema_extended_1.serviceUsageTracking.usageDate))
                                .limit((input === null || input === void 0 ? void 0 : input.limit) || 100)
                                .offset((input === null || input === void 0 ? void 0 : input.offset) || 0)];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    // Get templates by category
    getByCategory: readProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_extended_1.serviceTemplates)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_extended_1.serviceTemplates.category, input), drizzle_orm_1.eq(schema_extended_1.serviceTemplates.isActive, true)))
                                .orderBy(drizzle_orm_1.desc(schema_extended_1.serviceTemplates.createdAt))];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    // Get all unique categories
    getCategories: readProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, templates, catSet, categories;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, database
                            .select({ category: schema_extended_1.serviceTemplates.category })
                            .from(schema_extended_1.serviceTemplates)
                            .where(drizzle_orm_1.eq(schema_extended_1.serviceTemplates.isActive, true))];
                case 2:
                    templates = _a.sent();
                    catSet = new Set(templates.map(function (t) { return t.category; }).filter(Boolean));
                    categories = [];
                    catSet.forEach(function (c) { return categories.push(c); });
                    return [2 /*return*/, categories.sort()];
            }
        });
    }); }),
    // Bulk operations
    bulkDelete: trpc_1.createFeatureRestrictedProcedure("services:delete")
        .input(zod_1.z.array(zod_1.z.string()))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, successCount, errors, _i, input_1, id, error_5, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        successCount = 0;
                        errors = [];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 10, , 11]);
                        _i = 0, input_1 = input;
                        _b.label = 3;
                    case 3:
                        if (!(_i < input_1.length)) return [3 /*break*/, 8];
                        id = input_1[_i];
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, database
                                .update(schema_extended_1.serviceTemplates)
                                .set({ isActive: false, updatedAt: new Date() })
                                .where(drizzle_orm_1.eq(schema_extended_1.serviceTemplates.id, id))];
                    case 5:
                        _b.sent();
                        successCount++;
                        return [3 /*break*/, 7];
                    case 6:
                        error_5 = _b.sent();
                        errors.push("Failed to delete " + id);
                        return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 3];
                    case 8: return [4 /*yield*/, db.logActivity({
                            userId: ctx.user.id,
                            action: "service_templates_bulk_deleted",
                            entityType: "serviceTemplate",
                            entityId: "bulk",
                            description: "Bulk deleted " + successCount + " service templates"
                        })];
                    case 9:
                        _b.sent();
                        return [2 /*return*/, { success: true, successCount: successCount, errors: errors }];
                    case 10:
                        error_6 = _b.sent();
                        throw new Error("Bulk delete failed: " + error_6.message);
                    case 11: return [2 /*return*/];
                }
            });
        });
    })
});
