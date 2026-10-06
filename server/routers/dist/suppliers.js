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
exports.suppliersRouter = void 0;
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_extended_1 = require("../../drizzle/schema-extended");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
/**
 * Generate next supplier number (SUP-XXXX)
 */
function getNextSupplierNumber(database) {
    return __awaiter(this, void 0, Promise, function () {
        var lastSupplier, lastNumber, match, num, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, database
                            .select()
                            .from(schema_extended_1.suppliers)
                            .orderBy(drizzle_orm_1.desc(schema_extended_1.suppliers.createdAt))
                            .limit(1)];
                case 1:
                    lastSupplier = _b.sent();
                    if (!lastSupplier.length) {
                        return [2 /*return*/, "SUP-0001"];
                    }
                    lastNumber = lastSupplier[0].supplierNumber;
                    match = lastNumber === null || lastNumber === void 0 ? void 0 : lastNumber.match(/SUP-(\d+)/);
                    if (match) {
                        num = parseInt(match[1], 10) + 1;
                        return [2 /*return*/, "SUP-" + String(num).padStart(4, "0")];
                    }
                    return [2 /*return*/, "SUP-0001"];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, "SUP-0001"];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.suppliersRouter = trpc_1.router({
    // Get all suppliers with filters
    list: trpc_1.protectedProcedure
        .input(zod_1.z
        .object({
        limit: zod_1.z.number().optional(),
        offset: zod_1.z.number().optional(),
        status: zod_1.z["enum"](["pending", "pre_qualified", "qualified", "rejected", "inactive"]).optional(),
        search: zod_1.z.string().optional(),
        isActive: zod_1.z.boolean().optional()
    })
        .optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, limit, offset, orgId, query, conditions, results, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        limit = (input === null || input === void 0 ? void 0 : input.limit) || 50;
                        offset = (input === null || input === void 0 ? void 0 : input.offset) || 0;
                        orgId = ctx.user.organizationId;
                        query = database.select().from(schema_extended_1.suppliers);
                        conditions = [];
                        if (orgId) {
                            conditions.push(drizzle_orm_1.eq(schema_extended_1.suppliers.organizationId, orgId));
                        }
                        if (input === null || input === void 0 ? void 0 : input.status) {
                            conditions.push(drizzle_orm_1.eq(schema_extended_1.suppliers.qualificationStatus, input.status));
                        }
                        if (typeof (input === null || input === void 0 ? void 0 : input.isActive) === "boolean") {
                            conditions.push(drizzle_orm_1.eq(schema_extended_1.suppliers.isActive, input.isActive));
                        }
                        if (input === null || input === void 0 ? void 0 : input.search) {
                            conditions.push(drizzle_orm_1.or(drizzle_orm_1.like(schema_extended_1.suppliers.companyName, "%" + input.search + "%"), drizzle_orm_1.like(schema_extended_1.suppliers.email, "%" + input.search + "%"), drizzle_orm_1.like(schema_extended_1.suppliers.phone, "%" + input.search + "%")));
                        }
                        if (conditions.length > 0) {
                            query = query.where(drizzle_orm_1.and.apply(void 0, conditions));
                        }
                        return [4 /*yield*/, query.limit(limit).offset(offset)];
                    case 2:
                        results = _b.sent();
                        return [2 /*return*/, results];
                    case 3:
                        error_1 = _b.sent();
                        console.error("[Suppliers List Error]", error_1);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    // Get supplier by ID
    getById: trpc_1.protectedProcedure.input(zod_1.z.string()).query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, where, result, supplier, ratings, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, null];
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_extended_1.suppliers.id, input), drizzle_orm_1.eq(schema_extended_1.suppliers.organizationId, orgId)) : drizzle_orm_1.eq(schema_extended_1.suppliers.id, input);
                        return [4 /*yield*/, database.select().from(schema_extended_1.suppliers).where(where).limit(1)];
                    case 2:
                        result = _b.sent();
                        if (!result.length)
                            return [2 /*return*/, null];
                        supplier = result[0];
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_extended_1.supplierRatings)
                                .where(drizzle_orm_1.eq(schema_extended_1.supplierRatings.supplierId, input))];
                    case 3:
                        ratings = _b.sent();
                        // Parse JSON fields
                        return [2 /*return*/, __assign(__assign({}, supplier), { paymentMethods: supplier.paymentMethods ? JSON.parse(supplier.paymentMethods) : [], categories: supplier.categories ? JSON.parse(supplier.categories) : [], certifications: supplier.certifications ? JSON.parse(supplier.certifications) : [], ratings: ratings || [] })];
                    case 4:
                        error_2 = _b.sent();
                        console.error("[Suppliers GetById Error]", error_2);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    // Create new supplier
    create: enhancedRbac_1.createFeatureRestrictedProcedure("suppliers:create")
        .input(zod_1.z.object({
        companyName: zod_1.z.string().min(1),
        registrationNumber: zod_1.z.string().optional(),
        taxId: zod_1.z.string().optional(),
        contactPerson: zod_1.z.string().optional(),
        contactTitle: zod_1.z.string().optional(),
        email: zod_1.z.string().email().optional(),
        phone: zod_1.z.string().optional(),
        alternatePhone: zod_1.z.string().optional(),
        website: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        country: zod_1.z.string().optional(),
        postalCode: zod_1.z.string().optional(),
        bankName: zod_1.z.string().optional(),
        bankBranch: zod_1.z.string().optional(),
        accountNumber: zod_1.z.string().optional(),
        accountName: zod_1.z.string().optional(),
        paymentTerms: zod_1.z.string().optional(),
        paymentMethods: zod_1.z.array(zod_1.z.string()).optional(),
        industry: zod_1.z.string().optional(),
        categories: zod_1.z.array(zod_1.z.string()).optional(),
        certifications: zod_1.z.array(zod_1.z.string()).optional(),
        qualificationStatus: zod_1.z["enum"](["pending", "pre_qualified", "qualified", "rejected", "inactive"])["default"]("pending"),
        qualificationDate: zod_1.z.string().optional(),
        accountManagerId: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, supplierId, supplierNumber, newSupplier, nameParts, firstName, lastName, contactErr_1, error_3;
            var _b, _c, _d, _e, _f, _g, _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        _j.trys.push([0, 9, , 10]);
                        // Check if user has admin or procurement role
                        if (!["super_admin", "admin", "finance", "procurement"].includes(((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.role) || "")) {
                            throw new Error("Unauthorized: Admin or Procurement role required");
                        }
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _j.sent();
                        if (!database)
                            throw new Error("Database not available");
                        supplierId = uuid_1.v4();
                        return [4 /*yield*/, getNextSupplierNumber(database)];
                    case 2:
                        supplierNumber = _j.sent();
                        newSupplier = {
                            id: supplierId,
                            organizationId: (_d = (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.organizationId) !== null && _d !== void 0 ? _d : null,
                            supplierNumber: supplierNumber,
                            companyName: input.companyName,
                            registrationNumber: input.registrationNumber || null,
                            taxId: input.taxId || null,
                            contactPerson: input.contactPerson || null,
                            contactTitle: input.contactTitle || null,
                            email: input.email || null,
                            phone: input.phone || null,
                            alternatePhone: input.alternatePhone || null,
                            website: input.website || null,
                            address: input.address || null,
                            city: input.city || null,
                            country: input.country || null,
                            postalCode: input.postalCode || null,
                            bankName: input.bankName || null,
                            bankBranch: input.bankBranch || null,
                            accountNumber: input.accountNumber || null,
                            accountName: input.accountName || null,
                            paymentTerms: input.paymentTerms || null,
                            industry: input.industry || null,
                            accountManagerId: input.accountManagerId || null,
                            paymentMethods: input.paymentMethods ? JSON.stringify(input.paymentMethods) : null,
                            categories: input.categories ? JSON.stringify(input.categories) : null,
                            certifications: input.certifications ? JSON.stringify(input.certifications) : null,
                            qualificationStatus: input.qualificationStatus,
                            qualificationDate: input.qualificationDate || null,
                            notes: input.notes || null,
                            isActive: true,
                            createdBy: ((_e = ctx.user) === null || _e === void 0 ? void 0 : _e.id) || "system",
                            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        };
                        return [4 /*yield*/, database.insert(schema_extended_1.suppliers).values(newSupplier)];
                    case 3:
                        _j.sent();
                        _j.label = 4;
                    case 4:
                        _j.trys.push([4, 7, , 8]);
                        if (!(input.contactPerson || input.email)) return [3 /*break*/, 6];
                        nameParts = (input.contactPerson || input.companyName).trim().split(/\s+/);
                        firstName = nameParts[0] || input.companyName;
                        lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "-";
                        return [4 /*yield*/, database.insert(schema_1.contacts).values({
                                id: uuid_1.v4(),
                                organizationId: (_g = (_f = ctx.user) === null || _f === void 0 ? void 0 : _f.organizationId) !== null && _g !== void 0 ? _g : null,
                                firstName: firstName,
                                lastName: lastName,
                                email: input.email || null,
                                phone: input.phone || null,
                                mobile: input.alternatePhone || null,
                                jobTitle: input.contactTitle || null,
                                isPrimary: 1,
                                address: input.address || null,
                                city: input.city || null,
                                country: input.country || null,
                                postalCode: input.postalCode || null,
                                notes: "Supplier: " + input.companyName,
                                createdBy: ((_h = ctx.user) === null || _h === void 0 ? void 0 : _h.id) || "system"
                            })];
                    case 5:
                        _j.sent();
                        _j.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        contactErr_1 = _j.sent();
                        console.error("[Suppliers] Auto-create contact failed:", contactErr_1);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/, newSupplier];
                    case 9:
                        error_3 = _j.sent();
                        console.error("[Suppliers Create Error]", error_3);
                        throw error_3;
                    case 10: return [2 /*return*/];
                }
            });
        });
    }),
    // Update supplier
    update: enhancedRbac_1.createFeatureRestrictedProcedure("suppliers:edit")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        companyName: zod_1.z.string().optional(),
        contactPerson: zod_1.z.string().optional(),
        contactTitle: zod_1.z.string().optional(),
        email: zod_1.z.string().optional(),
        phone: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
        alternatePhone: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
        address: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        country: zod_1.z.string().optional(),
        industry: zod_1.z.string().optional(),
        postalCode: zod_1.z.string().optional(),
        taxId: zod_1.z.string().optional(),
        registrationNumber: zod_1.z.string().optional(),
        website: zod_1.z.string().optional(),
        bankName: zod_1.z.string().optional(),
        bankBranch: zod_1.z.string().optional(),
        accountNumber: zod_1.z.string().optional(),
        accountName: zod_1.z.string().optional(),
        paymentTerms: zod_1.z.string().optional(),
        paymentMethods: zod_1.z.array(zod_1.z.string()).optional(),
        categories: zod_1.z.array(zod_1.z.string()).optional(),
        certifications: zod_1.z.array(zod_1.z.string()).optional(),
        accountManagerId: zod_1.z.string().optional(),
        qualificationStatus: zod_1.z["enum"](["pending", "pre_qualified", "qualified", "rejected", "inactive"]).optional(),
        qualificationDate: zod_1.z.string().optional(),
        qualityRating: zod_1.z.number().min(0).max(100).optional(),
        deliveryRating: zod_1.z.number().min(0).max(100).optional(),
        priceCompetitiveness: zod_1.z.number().min(0).max(100).optional(),
        isActive: zod_1.z.boolean().optional(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, updates, orgId, existing, current, quality, delivery, price, error_4;
            var _b, _c, _d, _e, _f, _g, _h, _j;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        _k.trys.push([0, 7, , 8]);
                        if (!["super_admin", "admin", "finance", "procurement"].includes(((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.role) || "")) {
                            throw new Error("Unauthorized");
                        }
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _k.sent();
                        if (!database)
                            throw new Error("Database not available");
                        updates = {
                            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        };
                        orgId = (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.organizationId;
                        if (!orgId) return [3 /*break*/, 3];
                        return [4 /*yield*/, database.select().from(schema_extended_1.suppliers).where(drizzle_orm_1.eq(schema_extended_1.suppliers.id, input.id)).limit(1)];
                    case 2:
                        existing = _k.sent();
                        if (!existing.length || existing[0].organizationId !== orgId)
                            throw new Error("Supplier not found");
                        _k.label = 3;
                    case 3:
                        if (input.companyName)
                            updates.companyName = input.companyName;
                        if (input.contactPerson)
                            updates.contactPerson = input.contactPerson;
                        if (input.contactTitle !== undefined)
                            updates.contactTitle = input.contactTitle;
                        if (input.email)
                            updates.email = input.email;
                        if (input.phone !== undefined)
                            updates.phone = String(input.phone);
                        if (input.alternatePhone !== undefined)
                            updates.alternatePhone = String(input.alternatePhone);
                        if (input.address !== undefined)
                            updates.address = input.address;
                        if (input.city !== undefined)
                            updates.city = input.city;
                        if (input.country !== undefined)
                            updates.country = input.country;
                        if (input.industry !== undefined)
                            updates.industry = input.industry;
                        if (input.postalCode !== undefined)
                            updates.postalCode = input.postalCode;
                        if (input.taxId !== undefined)
                            updates.taxId = input.taxId;
                        if (input.registrationNumber !== undefined)
                            updates.registrationNumber = input.registrationNumber;
                        if (input.website !== undefined)
                            updates.website = input.website;
                        if (input.bankName !== undefined)
                            updates.bankName = input.bankName;
                        if (input.bankBranch !== undefined)
                            updates.bankBranch = input.bankBranch;
                        if (input.accountNumber !== undefined)
                            updates.accountNumber = input.accountNumber;
                        if (input.accountName !== undefined)
                            updates.accountName = input.accountName;
                        if (input.paymentTerms)
                            updates.paymentTerms = input.paymentTerms;
                        if (input.paymentMethods !== undefined)
                            updates.paymentMethods = JSON.stringify(input.paymentMethods);
                        if (input.categories !== undefined)
                            updates.categories = JSON.stringify(input.categories);
                        if (input.certifications !== undefined)
                            updates.certifications = JSON.stringify(input.certifications);
                        if (input.qualificationStatus)
                            updates.qualificationStatus = input.qualificationStatus;
                        if (input.qualificationDate !== undefined)
                            updates.qualificationDate = input.qualificationDate;
                        if (input.accountManagerId !== undefined)
                            updates.accountManagerId = input.accountManagerId;
                        if (typeof input.isActive === "boolean")
                            updates.isActive = input.isActive;
                        if (input.notes !== undefined)
                            updates.notes = input.notes;
                        if (!(input.qualityRating !== undefined ||
                            input.deliveryRating !== undefined ||
                            input.priceCompetitiveness !== undefined)) return [3 /*break*/, 5];
                        if (input.qualityRating !== undefined)
                            updates.qualityRating = input.qualityRating;
                        if (input.deliveryRating !== undefined)
                            updates.deliveryRating = input.deliveryRating;
                        if (input.priceCompetitiveness !== undefined)
                            updates.priceCompetitiveness = input.priceCompetitiveness;
                        return [4 /*yield*/, database.select().from(schema_extended_1.suppliers).where(drizzle_orm_1.eq(schema_extended_1.suppliers.id, input.id)).limit(1)];
                    case 4:
                        current = _k.sent();
                        if (current.length) {
                            quality = (_e = (_d = input.qualityRating) !== null && _d !== void 0 ? _d : current[0].qualityRating) !== null && _e !== void 0 ? _e : 0;
                            delivery = (_g = (_f = input.deliveryRating) !== null && _f !== void 0 ? _f : current[0].deliveryRating) !== null && _g !== void 0 ? _g : 0;
                            price = (_j = (_h = input.priceCompetitiveness) !== null && _h !== void 0 ? _h : current[0].priceCompetitiveness) !== null && _j !== void 0 ? _j : 0;
                            updates.averageRating = Math.round((quality + delivery + price) / 3);
                        }
                        _k.label = 5;
                    case 5: return [4 /*yield*/, database.update(schema_extended_1.suppliers).set(updates).where(drizzle_orm_1.eq(schema_extended_1.suppliers.id, input.id))];
                    case 6:
                        _k.sent();
                        return [2 /*return*/, { success: true }];
                    case 7:
                        error_4 = _k.sent();
                        console.error("[Suppliers Update Error]", error_4);
                        throw error_4;
                    case 8: return [2 /*return*/];
                }
            });
        });
    }),
    // Delete supplier
    "delete": enhancedRbac_1.createFeatureRestrictedProcedure("suppliers:delete").input(zod_1.z.string()).mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, existing, error_5;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 5, , 6]);
                        if (!["super_admin", "admin", "finance"].includes(((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.role) || "")) {
                            throw new Error("Unauthorized");
                        }
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _d.sent();
                        if (!database)
                            throw new Error("Database not available");
                        orgId = (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.organizationId;
                        if (!orgId) return [3 /*break*/, 3];
                        return [4 /*yield*/, database.select().from(schema_extended_1.suppliers).where(drizzle_orm_1.eq(schema_extended_1.suppliers.id, input)).limit(1)];
                    case 2:
                        existing = _d.sent();
                        if (!existing.length || existing[0].organizationId !== orgId)
                            throw new Error("Supplier not found");
                        _d.label = 3;
                    case 3: return [4 /*yield*/, database["delete"](schema_extended_1.suppliers).where(drizzle_orm_1.eq(schema_extended_1.suppliers.id, input))];
                    case 4:
                        _d.sent();
                        return [2 /*return*/, { success: true }];
                    case 5:
                        error_5 = _d.sent();
                        console.error("[Suppliers Delete Error]", error_5);
                        throw error_5;
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    // Get suppliers by status
    byStatus: trpc_1.protectedProcedure
        .input(zod_1.z["enum"](["pending", "pre_qualified", "qualified", "rejected", "inactive"]))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, where, results, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_extended_1.suppliers.qualificationStatus, input), drizzle_orm_1.eq(schema_extended_1.suppliers.organizationId, orgId)) : drizzle_orm_1.eq(schema_extended_1.suppliers.qualificationStatus, input);
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_extended_1.suppliers)
                                .where(where)];
                    case 2:
                        results = _b.sent();
                        return [2 /*return*/, results];
                    case 3:
                        error_6 = _b.sent();
                        console.error("[Suppliers ByStatus Error]", error_6);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    // Add supplier rating
    addRating: enhancedRbac_1.createFeatureRestrictedProcedure("suppliers:edit")
        .input(zod_1.z.object({
        supplierId: zod_1.z.string(),
        orderId: zod_1.z.string().optional(),
        qualityScore: zod_1.z.number().min(1).max(5),
        deliveryScore: zod_1.z.number().min(1).max(5),
        priceScore: zod_1.z.number().min(1).max(5),
        serviceScore: zod_1.z.number().min(1).max(5),
        comments: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, ratingId, averageScore, allRatings, avgQuality, avgDelivery, avgPrice, error_7;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error("Database not available");
                        ratingId = uuid_1.v4();
                        averageScore = Math.round(((input.qualityScore + input.deliveryScore + input.priceScore + input.serviceScore) / 4) * 20);
                        return [4 /*yield*/, database.insert(schema_extended_1.supplierRatings).values({
                                id: ratingId,
                                supplierId: input.supplierId,
                                orderId: input.orderId || null,
                                qualityScore: input.qualityScore,
                                deliveryScore: input.deliveryScore,
                                priceScore: input.priceScore,
                                serviceScore: input.serviceScore,
                                comments: input.comments || null,
                                ratedBy: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || "system",
                                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 2:
                        _c.sent();
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_extended_1.supplierRatings)
                                .where(drizzle_orm_1.eq(schema_extended_1.supplierRatings.supplierId, input.supplierId))];
                    case 3:
                        allRatings = _c.sent();
                        if (!(allRatings.length > 0)) return [3 /*break*/, 5];
                        avgQuality = Math.round(allRatings.reduce(function (sum, r) { return sum + r.qualityScore; }, 0) / allRatings.length * 20);
                        avgDelivery = Math.round(allRatings.reduce(function (sum, r) { return sum + r.deliveryScore; }, 0) / allRatings.length * 20);
                        avgPrice = Math.round(allRatings.reduce(function (sum, r) { return sum + r.priceScore; }, 0) / allRatings.length * 20);
                        return [4 /*yield*/, database.update(schema_extended_1.suppliers).set({
                                qualityRating: avgQuality,
                                deliveryRating: avgDelivery,
                                priceCompetitiveness: avgPrice,
                                averageRating: Math.round((avgQuality + avgDelivery + avgPrice) / 3),
                                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            }).where(drizzle_orm_1.eq(schema_extended_1.suppliers.id, input.supplierId))];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5: return [2 /*return*/, { success: true, ratingId: ratingId }];
                    case 6:
                        error_7 = _c.sent();
                        console.error("[Suppliers AddRating Error]", error_7);
                        throw error_7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    // Get supplier ratings
    getRatings: trpc_1.protectedProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, ratings, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_extended_1.supplierRatings)
                                .where(drizzle_orm_1.eq(schema_extended_1.supplierRatings.supplierId, input))];
                    case 2:
                        ratings = _b.sent();
                        return [2 /*return*/, ratings];
                    case 3:
                        error_8 = _b.sent();
                        console.error("[Suppliers GetRatings Error]", error_8);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    })
});
