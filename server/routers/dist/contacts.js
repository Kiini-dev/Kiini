"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
exports.contactsRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var server_1 = require("@trpc/server");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var uuid_1 = require("uuid");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var viewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("crm:contacts:view");
var createProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("crm:contacts:create");
var editProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("crm:contacts:edit");
var deleteProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("crm:contacts:delete");
exports.contactsRouter = trpc_1.router({
    list: viewProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().optional(),
        offset: zod_1.z.number().optional(),
        clientId: zod_1.z.string().optional(),
        search: zod_1.z.string().optional()
    }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, conditions, orgId, whereClause, all, countResult, error_1;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 5, , 6]);
                        conditions = [];
                        orgId = ctx.user.organizationId;
                        if (orgId)
                            conditions.push(drizzle_orm_1.eq(schema_1.contacts.organizationId, orgId));
                        if (input === null || input === void 0 ? void 0 : input.clientId)
                            conditions.push(drizzle_orm_1.eq(schema_1.contacts.clientId, input.clientId));
                        if (input === null || input === void 0 ? void 0 : input.search) {
                            conditions.push(drizzle_orm_1.or(drizzle_orm_1.like(schema_1.contacts.firstName, "%" + input.search + "%"), drizzle_orm_1.like(schema_1.contacts.lastName, "%" + input.search + "%"), drizzle_orm_1.like(schema_1.contacts.email, "%" + input.search + "%")));
                        }
                        whereClause = conditions.length === 1 ? conditions[0] : conditions.length > 1 ? drizzle_orm_1.and.apply(void 0, conditions) : undefined;
                        return [4 /*yield*/, db.select().from(schema_1.contacts)
                                .where(whereClause)
                                .orderBy(drizzle_orm_1.desc(schema_1.contacts.createdAt))
                                .limit((input === null || input === void 0 ? void 0 : input.limit) || 50)
                                .offset((input === null || input === void 0 ? void 0 : input.offset) || 0)];
                    case 3:
                        all = _c.sent();
                        return [4 /*yield*/, db.select({ count: drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["count(*)"], ["count(*)"]))) }).from(schema_1.contacts)
                                .where(whereClause)];
                    case 4:
                        countResult = _c.sent();
                        return [2 /*return*/, { data: all, total: ((_b = countResult[0]) === null || _b === void 0 ? void 0 : _b.count) || 0 }];
                    case 5:
                        error_1 = _c.sent();
                        console.error("Error listing contacts:", error_1);
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch contacts" });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    getById: viewProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, conditions, result, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        orgId = ctx.user.organizationId;
                        conditions = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.contacts.id, input), drizzle_orm_1.eq(schema_1.contacts.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_1.contacts.id, input);
                        return [4 /*yield*/, db.select().from(schema_1.contacts).where(conditions)];
                    case 3:
                        result = _b.sent();
                        if (!result.length)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Contact not found" });
                        return [2 /*return*/, result[0]];
                    case 4:
                        error_2 = _b.sent();
                        if (error_2 instanceof server_1.TRPCError)
                            throw error_2;
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch contact" });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    getByClient: viewProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, conditions, result, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        orgId = ctx.user.organizationId;
                        conditions = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.contacts.clientId, input), drizzle_orm_1.eq(schema_1.contacts.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_1.contacts.clientId, input);
                        return [4 /*yield*/, db.select().from(schema_1.contacts)
                                .where(conditions)
                                .orderBy(drizzle_orm_1.desc(schema_1.contacts.isPrimary), drizzle_orm_1.desc(schema_1.contacts.createdAt))];
                    case 3:
                        result = _b.sent();
                        return [2 /*return*/, result];
                    case 4:
                        error_3 = _b.sent();
                        console.error("Error fetching contacts for client:", error_3);
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch contacts" });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    create: createProcedure
        .input(zod_1.z.object({
        clientId: zod_1.z.string().optional(),
        salutation: zod_1.z.string().optional(),
        firstName: zod_1.z.string().min(1),
        lastName: zod_1.z.string().min(1),
        email: zod_1.z.string().email().optional(),
        phone: zod_1.z.string().optional(),
        mobile: zod_1.z.string().optional(),
        jobTitle: zod_1.z.string().optional(),
        department: zod_1.z.string().optional(),
        isPrimary: zod_1.z.boolean().optional(),
        notes: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        country: zod_1.z.string().optional(),
        postalCode: zod_1.z.string().optional(),
        linkedIn: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, created, error_4;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _e.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, 5, , 6]);
                        id = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_1.contacts).values({
                                id: id,
                                organizationId: (_c = (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) !== null && _c !== void 0 ? _c : null,
                                clientId: input.clientId || null,
                                salutation: input.salutation || null,
                                firstName: input.firstName,
                                lastName: input.lastName,
                                email: input.email || null,
                                phone: input.phone || null,
                                mobile: input.mobile || null,
                                jobTitle: input.jobTitle || null,
                                department: input.department || null,
                                isPrimary: input.isPrimary ? 1 : 0,
                                notes: input.notes || null,
                                address: input.address || null,
                                city: input.city || null,
                                country: input.country || null,
                                postalCode: input.postalCode || null,
                                linkedIn: input.linkedIn || null,
                                createdBy: ((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id) || ""
                            })];
                    case 3:
                        _e.sent();
                        return [4 /*yield*/, db.select().from(schema_1.contacts).where(drizzle_orm_1.eq(schema_1.contacts.id, id))];
                    case 4:
                        created = _e.sent();
                        return [2 /*return*/, created[0] || __assign({ id: id }, input)];
                    case 5:
                        error_4 = _e.sent();
                        console.error("Error creating contact:", error_4);
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create contact" });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    update: editProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        clientId: zod_1.z.string().optional(),
        firstName: zod_1.z.string().optional(),
        lastName: zod_1.z.string().optional(),
        email: zod_1.z.string().email().optional(),
        phone: zod_1.z.string().optional(),
        mobile: zod_1.z.string().optional(),
        jobTitle: zod_1.z.string().optional(),
        department: zod_1.z.string().optional(),
        isPrimary: zod_1.z.boolean().optional(),
        notes: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        country: zod_1.z.string().optional(),
        salutation: zod_1.z.string().optional(),
        postalCode: zod_1.z.string().optional(),
        linkedIn: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, idCondition, existing, id, isPrimary, rest, setObj, _i, _b, _c, key, val, updated, error_5;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _d.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 6, , 7]);
                        orgId = ctx.user.organizationId;
                        idCondition = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.contacts.id, input.id), drizzle_orm_1.eq(schema_1.contacts.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_1.contacts.id, input.id);
                        return [4 /*yield*/, db.select().from(schema_1.contacts).where(idCondition)];
                    case 3:
                        existing = _d.sent();
                        if (!existing.length)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Contact not found" });
                        id = input.id, isPrimary = input.isPrimary, rest = __rest(input, ["id", "isPrimary"]);
                        setObj = {};
                        for (_i = 0, _b = Object.entries(rest); _i < _b.length; _i++) {
                            _c = _b[_i], key = _c[0], val = _c[1];
                            if (val !== undefined)
                                setObj[key] = val;
                        }
                        if (isPrimary !== undefined)
                            setObj.isPrimary = isPrimary ? 1 : 0;
                        return [4 /*yield*/, db.update(schema_1.contacts).set(setObj).where(drizzle_orm_1.eq(schema_1.contacts.id, id))];
                    case 4:
                        _d.sent();
                        return [4 /*yield*/, db.select().from(schema_1.contacts).where(drizzle_orm_1.eq(schema_1.contacts.id, id))];
                    case 5:
                        updated = _d.sent();
                        return [2 /*return*/, updated[0]];
                    case 6:
                        error_5 = _d.sent();
                        if (error_5 instanceof server_1.TRPCError)
                            throw error_5;
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update contact" });
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    "delete": deleteProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, idCondition, existing, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        orgId = ctx.user.organizationId;
                        idCondition = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.contacts.id, input), drizzle_orm_1.eq(schema_1.contacts.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_1.contacts.id, input);
                        return [4 /*yield*/, db.select().from(schema_1.contacts).where(idCondition)];
                    case 3:
                        existing = _b.sent();
                        if (!existing.length)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Contact not found" });
                        return [4 /*yield*/, db["delete"](schema_1.contacts).where(idCondition)];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 5:
                        error_6 = _b.sent();
                        if (error_6 instanceof server_1.TRPCError)
                            throw error_6;
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete contact" });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    bulkDelete: deleteProcedure
        .input(zod_1.z.array(zod_1.z.string()).min(1))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, conditions;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        orgId = ctx.user.organizationId;
                        conditions = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.inArray(schema_1.contacts.id, input), drizzle_orm_1.eq(schema_1.contacts.organizationId, orgId))
                            : drizzle_orm_1.inArray(schema_1.contacts.id, input);
                        return [4 /*yield*/, db["delete"](schema_1.contacts).where(conditions)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true, count: input.length }];
                }
            });
        });
    })
});
var templateObject_1;
