"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
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
exports.servicesRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var db = require("../db");
exports.servicesRouter = trpc_1.router({
    list: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().optional(),
        offset: zod_1.z.number().optional(),
        category: zod_1.z.string().optional()
    }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, query;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        orgId = ctx.user.organizationId;
                        if (orgId && (input === null || input === void 0 ? void 0 : input.category)) {
                            query = database.select().from(schema_1.services).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.services.organizationId, orgId), drizzle_orm_1.eq(schema_1.services.category, input.category)));
                        }
                        else if (orgId) {
                            query = database.select().from(schema_1.services).where(drizzle_orm_1.eq(schema_1.services.organizationId, orgId));
                        }
                        else if (input === null || input === void 0 ? void 0 : input.category) {
                            query = database.select().from(schema_1.services).where(drizzle_orm_1.eq(schema_1.services.category, input.category));
                        }
                        else {
                            query = database.select().from(schema_1.services);
                        }
                        return [4 /*yield*/, query.limit((input === null || input === void 0 ? void 0 : input.limit) || 100).offset((input === null || input === void 0 ? void 0 : input.offset) || 0)];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    getById: trpc_1.protectedProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, where, result, service;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, null];
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.services.id, input), drizzle_orm_1.eq(schema_1.services.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.services.id, input);
                        return [4 /*yield*/, database.select().from(schema_1.services).where(where).limit(1)];
                    case 2:
                        result = _b.sent();
                        service = result[0] || null;
                        if (service && service.deliverables && typeof service.deliverables === "string") {
                            try {
                                service.deliverables = JSON.parse(service.deliverables);
                            }
                            catch (_c) {
                                service.deliverables = [service.deliverables];
                            }
                        }
                        return [2 /*return*/, service];
                }
            });
        });
    }),
    create: trpc_1.createFeatureRestrictedProcedure("services:create")
        .input(zod_1.z.object({
        serviceName: zod_1.z.string().min(1).max(100).optional(),
        name: zod_1.z.string().min(1).max(100).optional(),
        description: zod_1.z.string().max(500).optional(),
        serviceType: zod_1.z.string().max(100).optional(),
        category: zod_1.z.string().max(100).optional(),
        rate: zod_1.z.number().positive().optional(),
        // Accept `hourlyRate` (in cents) from frontend for compatibility
        hourlyRate: zod_1.z.number().optional(),
        unit: zod_1.z.string().max(50).optional(),
        // Accept fixedPrice (in cents) from frontend
        fixedPrice: zod_1.z.number().optional(),
        // Accept taxRate (as integer/percent*100) for compatibility
        taxRate: zod_1.z.number().optional(),
        status: zod_1.z["enum"](['active', 'inactive']).optional(),
        deliverables: zod_1.z.array(zod_1.z.string()).optional()
    }).refine(function (v) { return !!(v.serviceName || v.name); }, { message: 'serviceName or name is required' }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, svcName, svcType, existing, id, rateInCents, now;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error("Database not available");
                        svcName = input.serviceName || input.name || '';
                        svcType = input.serviceType || input.category || undefined;
                        return [4 /*yield*/, database.select().from(schema_1.services).where(drizzle_orm_1.eq(schema_1.services.name, svcName)).limit(1)];
                    case 2:
                        existing = _c.sent();
                        if (existing.length > 0) {
                            throw new Error("Service '" + svcName + "' already exists");
                        }
                        id = uuid_1.v4();
                        rateInCents = input.hourlyRate !== undefined ? input.hourlyRate : (input.rate ? Math.round(input.rate * 100) : 0);
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, database.insert(schema_1.services).values({
                                id: id,
                                organizationId: (_b = ctx.user.organizationId) !== null && _b !== void 0 ? _b : null,
                                name: svcName,
                                description: input.description || '',
                                category: svcType,
                                hourlyRate: rateInCents,
                                fixedPrice: input.fixedPrice !== undefined ? input.fixedPrice : null,
                                unit: input.unit || 'hour',
                                taxRate: input.taxRate !== undefined ? input.taxRate : 0,
                                deliverables: input.deliverables ? JSON.stringify(input.deliverables) : null,
                                isActive: input.status === 'inactive' ? 0 : 1,
                                createdAt: now,
                                updatedAt: now,
                                createdBy: ctx.user.id
                            })];
                    case 3:
                        _c.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "service_created",
                                entityType: "service",
                                entityId: id,
                                description: "Created service: " + svcName
                            })];
                    case 4:
                        // Log activity
                        _c.sent();
                        return [2 /*return*/, { id: id }];
                }
            });
        });
    }),
    // Get units for dropdown
    getUnits: trpc_1.protectedProcedure
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, ['hour', 'day', 'week', 'month', 'project', 'unit', 'item', 'service'].sort()];
        });
    }); }),
    update: trpc_1.createFeatureRestrictedProcedure("services:edit")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        serviceName: zod_1.z.string().min(1).max(100).optional(),
        name: zod_1.z.string().min(1).max(100).optional(),
        description: zod_1.z.string().max(500).optional(),
        serviceType: zod_1.z.string().max(100).optional(),
        rate: zod_1.z.number().positive().optional(),
        // Accept taxRate for updates as well (stored as integer percent*100)
        taxRate: zod_1.z.number().optional(),
        hourlyRate: zod_1.z.number().optional(),
        fixedPrice: zod_1.z.number().optional(),
        unit: zod_1.z.string().max(50).optional(),
        status: zod_1.z["enum"](['active', 'inactive']).optional(),
        category: zod_1.z.string().max(100).optional(),
        deliverables: zod_1.z.array(zod_1.z.string()).optional()
    }).refine(function (v) { return !!(v.serviceName || v.name) || Object.keys(v).some(function (k) { return ['description', 'serviceType', 'category', 'rate', 'unit', 'status', 'deliverables'].includes(k); }); }, { message: 'Either name/serviceName or other updatable fields required' }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, service, orgId, newName, existing, updateData;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database.select().from(schema_1.services).where(drizzle_orm_1.eq(schema_1.services.id, input.id)).limit(1)];
                    case 2:
                        service = _b.sent();
                        if (!service.length)
                            throw new Error("Service not found");
                        orgId = ctx.user.organizationId;
                        if (orgId && service[0].organizationId !== orgId)
                            throw new Error("Service not found");
                        newName = input.serviceName || input.name;
                        if (!(newName && newName !== service[0].name)) return [3 /*break*/, 4];
                        return [4 /*yield*/, database.select().from(schema_1.services).where(drizzle_orm_1.eq(schema_1.services.name, newName)).limit(1)];
                    case 3:
                        existing = _b.sent();
                        if (existing.length > 0) {
                            throw new Error("Service '" + newName + "' already exists");
                        }
                        _b.label = 4;
                    case 4:
                        updateData = {};
                        if (newName)
                            updateData.name = newName;
                        if (input.description !== undefined)
                            updateData.description = input.description;
                        if (input.serviceType)
                            updateData.category = input.serviceType;
                        if (input.hourlyRate !== undefined)
                            updateData.hourlyRate = input.hourlyRate;
                        else if (input.rate)
                            updateData.hourlyRate = Math.round(input.rate * 100);
                        if (input.fixedPrice !== undefined)
                            updateData.fixedPrice = input.fixedPrice;
                        if (input.taxRate !== undefined)
                            updateData.taxRate = input.taxRate;
                        if (input.deliverables !== undefined)
                            updateData.deliverables = input.deliverables ? JSON.stringify(input.deliverables) : null;
                        if (input.unit)
                            updateData.unit = input.unit;
                        if (input.status)
                            updateData.isActive = input.status === 'inactive' ? 0 : 1;
                        return [4 /*yield*/, database.update(schema_1.services).set(updateData).where(drizzle_orm_1.eq(schema_1.services.id, input.id))];
                    case 5:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "service_updated",
                                entityType: "service",
                                entityId: input.id,
                                description: "Updated service: " + service[0].name
                            })];
                    case 6:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    "delete": trpc_1.createFeatureRestrictedProcedure("services:delete")
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, service, orgId;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database.select().from(schema_1.services).where(drizzle_orm_1.eq(schema_1.services.id, input)).limit(1)];
                    case 2:
                        service = _b.sent();
                        if (!service.length)
                            throw new Error("Service not found");
                        orgId = ctx.user.organizationId;
                        if (orgId && service[0].organizationId !== orgId)
                            throw new Error("Service not found");
                        return [4 /*yield*/, database["delete"](schema_1.services).where(drizzle_orm_1.eq(schema_1.services.id, input))];
                    case 3:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "service_deleted",
                                entityType: "service",
                                entityId: input,
                                description: "Deleted service: " + service[0].name
                            })];
                    case 4:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    getByType: trpc_1.protectedProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, where;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.services.category, input), drizzle_orm_1.eq(schema_1.services.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.services.category, input);
                        return [4 /*yield*/, database.select().from(schema_1.services).where(where)];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    getActive: trpc_1.protectedProcedure
        .query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, where;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.services.isActive, 1), drizzle_orm_1.eq(schema_1.services.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.services.isActive, 1);
                        return [4 /*yield*/, database.select().from(schema_1.services).where(where)];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    getSummary: trpc_1.protectedProcedure
        .query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, allServices, _b, activeServices, avgRate;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            return [2 /*return*/, {
                                    totalServices: 0,
                                    activeServices: 0,
                                    avgRate: 0
                                }];
                        orgId = ctx.user.organizationId;
                        if (!orgId) return [3 /*break*/, 3];
                        return [4 /*yield*/, database.select().from(schema_1.services).where(drizzle_orm_1.eq(schema_1.services.organizationId, orgId))];
                    case 2:
                        _b = _c.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, database.select().from(schema_1.services)];
                    case 4:
                        _b = _c.sent();
                        _c.label = 5;
                    case 5:
                        allServices = _b;
                        activeServices = allServices.filter(function (s) { return s.isActive === 1; }).length;
                        avgRate = allServices.length > 0
                            ? allServices.reduce(function (sum, s) { return sum + ((s.hourlyRate || 0) / 100); }, 0) / allServices.length
                            : 0;
                        return [2 /*return*/, {
                                totalServices: allServices.length,
                                activeServices: activeServices,
                                avgRate: avgRate
                            }];
                }
            });
        });
    }),
    bulkDelete: trpc_1.createFeatureRestrictedProcedure("services:delete")
        .input(zod_1.z.array(zod_1.z.string()).min(1))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, results, _i, input_1, serviceId, service, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        results = {
                            deleted: 0,
                            failed: 0,
                            errors: []
                        };
                        _i = 0, input_1 = input;
                        _b.label = 2;
                    case 2:
                        if (!(_i < input_1.length)) return [3 /*break*/, 9];
                        serviceId = input_1[_i];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 7, , 8]);
                        return [4 /*yield*/, database.select().from(schema_1.services).where(drizzle_orm_1.eq(schema_1.services.id, serviceId)).limit(1)];
                    case 4:
                        service = _b.sent();
                        if (!service.length) {
                            results.failed++;
                            results.errors.push("Service " + serviceId + " not found");
                            return [3 /*break*/, 8];
                        }
                        return [4 /*yield*/, database["delete"](schema_1.services).where(drizzle_orm_1.eq(schema_1.services.id, serviceId))];
                    case 5:
                        _b.sent();
                        results.deleted++;
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "service_deleted",
                                entityType: "service",
                                entityId: serviceId,
                                description: "Bulk deleted service: " + service[0].name
                            })];
                    case 6:
                        // Log activity
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        error_1 = _b.sent();
                        results.failed++;
                        results.errors.push("Error deleting " + serviceId + ": " + error_1);
                        return [3 /*break*/, 8];
                    case 8:
                        _i++;
                        return [3 /*break*/, 2];
                    case 9: return [2 /*return*/, results];
                }
            });
        });
    }),
    // Get categories for dropdown
    getCategories: trpc_1.protectedProcedure
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, database.selectDistinct({ category: schema_1.services.category })
                            .from(schema_1.services)
                            .where(drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["", " IS NOT NULL AND ", " != ''"], ["", " IS NOT NULL AND ", " != ''"])), schema_1.services.category, schema_1.services.category))
                            .orderBy(schema_1.services.category)];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result.map(function (r) { return r.category; }).filter(Boolean)];
                case 3:
                    error_2 = _a.sent();
                    console.error("Error fetching service categories:", error_2);
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    }); })
});
var templateObject_1;
