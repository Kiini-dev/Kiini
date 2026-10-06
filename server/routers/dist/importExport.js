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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.importExportRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var server_1 = require("@trpc/server");
var db_1 = require("../db");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var schema_1 = require("../../drizzle/schema");
var schema_extended_1 = require("../../drizzle/schema-extended");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var backupService_1 = require("../services/backupService");
var createProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("import:create");
var viewProcedure = trpc_1.protectedProcedure;
exports.importExportRouter = trpc_1.router({
    // Import clients from CSV
    importClients: createProcedure
        .input(zod_1.z.object({
        data: zod_1.z.array(zod_1.z.object({
            companyName: zod_1.z.string(),
            contactPerson: zod_1.z.string().optional(),
            email: zod_1.z.string().email().optional(),
            phone: zod_1.z.string().optional(),
            address: zod_1.z.string().optional(),
            city: zod_1.z.string().optional(),
            country: zod_1.z.string().optional(),
            status: zod_1.z["enum"](['active', 'inactive', 'prospect', 'archived']).optional()
        })),
        skipDuplicates: zod_1.z.boolean()["default"](true)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, results, _i, _b, clientData, existing, id, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error("Database not available");
                        results = {
                            imported: 0,
                            skipped: 0,
                            errors: []
                        };
                        _i = 0, _b = input.data;
                        _c.label = 2;
                    case 2:
                        if (!(_i < _b.length)) return [3 /*break*/, 9];
                        clientData = _b[_i];
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 7, , 8]);
                        // Validate required fields
                        if (!clientData.companyName) {
                            results.errors.push("Company name is required");
                            results.skipped++;
                            return [3 /*break*/, 8];
                        }
                        if (!(input.skipDuplicates && clientData.email)) return [3 /*break*/, 5];
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.clients)
                                .where(drizzle_orm_1.eq(schema_1.clients.email, clientData.email))];
                    case 4:
                        existing = _c.sent();
                        if (existing.length > 0) {
                            results.skipped++;
                            return [3 /*break*/, 8];
                        }
                        _c.label = 5;
                    case 5:
                        id = uuid_1.v4();
                        return [4 /*yield*/, database.insert(schema_1.clients).values(__assign(__assign({ id: id }, clientData), { createdBy: ctx.user.id }))];
                    case 6:
                        _c.sent();
                        results.imported++;
                        return [3 /*break*/, 8];
                    case 7:
                        error_1 = _c.sent();
                        results.errors.push("Error importing client " + clientData.companyName + ": " + error_1);
                        return [3 /*break*/, 8];
                    case 8:
                        _i++;
                        return [3 /*break*/, 2];
                    case 9: 
                    // Log activity
                    return [4 /*yield*/, db.logActivity({
                            userId: ctx.user.id,
                            action: "clients_imported",
                            entityType: "client",
                            entityId: "bulk",
                            description: "Imported " + results.imported + " clients"
                        })];
                    case 10:
                        // Log activity
                        _c.sent();
                        return [2 /*return*/, results];
                }
            });
        });
    }),
    // Import services from CSV
    importServices: createProcedure
        .input(zod_1.z.object({
        data: zod_1.z.array(zod_1.z.object({
            serviceName: zod_1.z.string(),
            description: zod_1.z.string().max(500).optional(),
            serviceType: zod_1.z.string().optional(),
            rate: zod_1.z.number().optional(),
            unit: zod_1.z.string().optional(),
            status: zod_1.z["enum"](['active', 'inactive']).optional()
        })),
        skipDuplicates: zod_1.z.boolean()["default"](true)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, results, _i, _b, serviceData, existing, id, error_2;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _e.sent();
                        if (!database)
                            throw new Error("Database not available");
                        results = {
                            imported: 0,
                            skipped: 0,
                            errors: []
                        };
                        _i = 0, _b = input.data;
                        _e.label = 2;
                    case 2:
                        if (!(_i < _b.length)) return [3 /*break*/, 9];
                        serviceData = _b[_i];
                        _e.label = 3;
                    case 3:
                        _e.trys.push([3, 7, , 8]);
                        // Validate required fields
                        if (!serviceData.serviceName) {
                            results.errors.push("Service name is required");
                            results.skipped++;
                            return [3 /*break*/, 8];
                        }
                        if (!input.skipDuplicates) return [3 /*break*/, 5];
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.services)
                                .where(drizzle_orm_1.eq(schema_1.services.name, serviceData.serviceName))];
                    case 4:
                        existing = _e.sent();
                        if (existing.length > 0) {
                            results.skipped++;
                            return [3 /*break*/, 8];
                        }
                        _e.label = 5;
                    case 5:
                        id = uuid_1.v4();
                        return [4 /*yield*/, database.insert(schema_1.services).values({
                                id: id,
                                name: serviceData.serviceName,
                                description: serviceData.description,
                                category: serviceData.serviceType || null,
                                hourlyRate: (_c = serviceData.rate) !== null && _c !== void 0 ? _c : null,
                                unit: (_d = serviceData.unit) !== null && _d !== void 0 ? _d : null,
                                createdBy: ctx.user.id
                            })];
                    case 6:
                        _e.sent();
                        results.imported++;
                        return [3 /*break*/, 8];
                    case 7:
                        error_2 = _e.sent();
                        results.errors.push("Error importing service " + serviceData.serviceName + ": " + error_2);
                        return [3 /*break*/, 8];
                    case 8:
                        _i++;
                        return [3 /*break*/, 2];
                    case 9: 
                    // Log activity
                    return [4 /*yield*/, db.logActivity({
                            userId: ctx.user.id,
                            action: "services_imported",
                            entityType: "service",
                            entityId: "bulk",
                            description: "Imported " + results.imported + " services"
                        })];
                    case 10:
                        // Log activity
                        _e.sent();
                        return [2 /*return*/, results];
                }
            });
        });
    }),
    // Import products from CSV
    importProducts: createProcedure
        .input(zod_1.z.object({
        data: zod_1.z.array(zod_1.z.object({
            productName: zod_1.z.string(),
            description: zod_1.z.string().max(500).optional(),
            sku: zod_1.z.string().optional(),
            unitPrice: zod_1.z.number().optional(),
            quantity: zod_1.z.number().optional(),
            category: zod_1.z.string().optional(),
            status: zod_1.z["enum"](['active', 'inactive']).optional()
        })),
        skipDuplicates: zod_1.z.boolean()["default"](true)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, results, _i, _b, productData, existing, id, error_3;
            var _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _g.sent();
                        if (!database)
                            throw new Error("Database not available");
                        results = {
                            imported: 0,
                            skipped: 0,
                            errors: []
                        };
                        _i = 0, _b = input.data;
                        _g.label = 2;
                    case 2:
                        if (!(_i < _b.length)) return [3 /*break*/, 9];
                        productData = _b[_i];
                        _g.label = 3;
                    case 3:
                        _g.trys.push([3, 7, , 8]);
                        // Validate required fields
                        if (!productData.productName) {
                            results.errors.push("Product name is required");
                            results.skipped++;
                            return [3 /*break*/, 8];
                        }
                        if (!(input.skipDuplicates && productData.sku)) return [3 /*break*/, 5];
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.products)
                                .where(drizzle_orm_1.eq(schema_1.products.sku, productData.sku))];
                    case 4:
                        existing = _g.sent();
                        if (existing.length > 0) {
                            results.skipped++;
                            return [3 /*break*/, 8];
                        }
                        _g.label = 5;
                    case 5:
                        id = uuid_1.v4();
                        return [4 /*yield*/, database.insert(schema_1.products).values({
                                id: id,
                                name: productData.productName,
                                description: productData.description,
                                sku: (_c = productData.sku) !== null && _c !== void 0 ? _c : null,
                                unitPrice: (_d = productData.unitPrice) !== null && _d !== void 0 ? _d : 0,
                                stockQuantity: (_e = productData.quantity) !== null && _e !== void 0 ? _e : 0,
                                category: (_f = productData.category) !== null && _f !== void 0 ? _f : null,
                                createdBy: ctx.user.id
                            })];
                    case 6:
                        _g.sent();
                        results.imported++;
                        return [3 /*break*/, 8];
                    case 7:
                        error_3 = _g.sent();
                        results.errors.push("Error importing product " + productData.productName + ": " + error_3);
                        return [3 /*break*/, 8];
                    case 8:
                        _i++;
                        return [3 /*break*/, 2];
                    case 9: 
                    // Log activity
                    return [4 /*yield*/, db.logActivity({
                            userId: ctx.user.id,
                            action: "products_imported",
                            entityType: "product",
                            entityId: "bulk",
                            description: "Imported " + results.imported + " products"
                        })];
                    case 10:
                        // Log activity
                        _g.sent();
                        return [2 /*return*/, results];
                }
            });
        });
    }),
    // Import employees from CSV
    importEmployees: createProcedure
        .input(zod_1.z.object({
        data: zod_1.z.array(zod_1.z.object({
            firstName: zod_1.z.string(),
            lastName: zod_1.z.string(),
            email: zod_1.z.string().email(),
            phone: zod_1.z.string().optional(),
            department: zod_1.z.string().optional(),
            jobTitle: zod_1.z.string().optional(),
            salary: zod_1.z.number().optional(),
            startDate: zod_1.z.string().optional(),
            status: zod_1.z["enum"](['active', 'inactive', 'on_leave', 'terminated']).optional(),
            idNumber: zod_1.z.string().optional(),
            tin: zod_1.z.string().optional()
        })),
        skipDuplicates: zod_1.z.boolean()["default"](true)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, batchId, errors, imported, skipped, i, employeeData, rowNum, existing, emailRegex, departmentId, dept, id, error_4;
            var _b, _c, _d, _e, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _h.sent();
                        if (!database)
                            throw new Error("Database not available");
                        batchId = uuid_1.v4();
                        errors = [];
                        imported = 0;
                        skipped = 0;
                        i = 0;
                        _h.label = 2;
                    case 2:
                        if (!(i < input.data.length)) return [3 /*break*/, 11];
                        employeeData = input.data[i];
                        rowNum = i + 1;
                        _h.label = 3;
                    case 3:
                        _h.trys.push([3, 9, , 10]);
                        // Validate required fields
                        if (!employeeData.firstName) {
                            errors.push({ row: rowNum, field: "firstName", message: "First name is required", severity: "error" });
                            skipped++;
                            return [3 /*break*/, 10];
                        }
                        if (!employeeData.lastName) {
                            errors.push({ row: rowNum, field: "lastName", message: "Last name is required", severity: "error" });
                            skipped++;
                            return [3 /*break*/, 10];
                        }
                        if (!employeeData.email) {
                            errors.push({ row: rowNum, field: "email", message: "Email is required", severity: "error" });
                            skipped++;
                            return [3 /*break*/, 10];
                        }
                        if (!input.skipDuplicates) return [3 /*break*/, 5];
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.employees)
                                .where(drizzle_orm_1.eq(schema_1.employees.email, employeeData.email))];
                    case 4:
                        existing = _h.sent();
                        if (existing.length > 0) {
                            errors.push({ row: rowNum, field: "email", message: "Duplicate email found", severity: "warning" });
                            skipped++;
                            return [3 /*break*/, 10];
                        }
                        _h.label = 5;
                    case 5:
                        emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(employeeData.email)) {
                            errors.push({ row: rowNum, field: "email", message: "Invalid email format", severity: "error" });
                            skipped++;
                            return [3 /*break*/, 10];
                        }
                        departmentId = null;
                        if (!employeeData.department) return [3 /*break*/, 7];
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.departments)
                                .where(drizzle_orm_1.eq(schema_1.departments.name, employeeData.department))];
                    case 6:
                        dept = _h.sent();
                        if (dept.length === 0) {
                            errors.push({ row: rowNum, field: "department", message: "Department '" + employeeData.department + "' not found", severity: "warning" });
                        }
                        else {
                            departmentId = dept[0].id;
                        }
                        _h.label = 7;
                    case 7:
                        id = uuid_1.v4();
                        return [4 /*yield*/, database.insert(schema_1.employees).values({
                                id: id,
                                firstName: employeeData.firstName,
                                lastName: employeeData.lastName,
                                email: employeeData.email,
                                phone: (_b = employeeData.phone) !== null && _b !== void 0 ? _b : null,
                                departmentId: departmentId,
                                position: (_c = employeeData.jobTitle) !== null && _c !== void 0 ? _c : null,
                                baseSalary: (_d = employeeData.salary) !== null && _d !== void 0 ? _d : 0,
                                dateOfJoining: employeeData.startDate ? new Date(employeeData.startDate) : new Date().toISOString().replace('T', ' ').substring(0, 19),
                                status: (_e = employeeData.status) !== null && _e !== void 0 ? _e : 'active',
                                idNumber: (_f = employeeData.idNumber) !== null && _f !== void 0 ? _f : null,
                                nssf: null,
                                nhif: null,
                                tin: (_g = employeeData.tin) !== null && _g !== void 0 ? _g : null
                            })];
                    case 8:
                        _h.sent();
                        imported++;
                        return [3 /*break*/, 10];
                    case 9:
                        error_4 = _h.sent();
                        errors.push({ row: rowNum, message: "Error importing employee: " + String(error_4), severity: "error" });
                        return [3 /*break*/, 10];
                    case 10:
                        i++;
                        return [3 /*break*/, 2];
                    case 11: 
                    // Log activity
                    return [4 /*yield*/, db.logActivity({
                            userId: ctx.user.id,
                            action: "employees_imported",
                            entityType: "employee",
                            entityId: "bulk",
                            description: "Imported " + imported + " employees (" + skipped + " skipped)"
                        })];
                    case 12:
                        // Log activity
                        _h.sent();
                        return [2 /*return*/, {
                                imported: imported,
                                skipped: skipped,
                                errors: errors,
                                batchId: batchId,
                                startTime: new Date(),
                                endTime: new Date()
                            }];
                }
            });
        });
    }),
    // Get detailed import errors
    getImportErrors: viewProcedure
        .input(zod_1.z.object({
        batchId: zod_1.z.string(),
        type: zod_1.z["enum"](['error', 'warning', 'all']).optional()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                // In production, fetch from database
                // For now return structured format
                return [2 /*return*/, {
                        batchId: input.batchId,
                        errors: [],
                        totalCount: 0
                    }];
            });
        });
    }),
    // Import payroll records from JSON/parsed Excel
    importPayroll: createProcedure
        .input(zod_1.z.object({
        data: zod_1.z.array(zod_1.z.object({
            employeeId: zod_1.z.string(),
            paymentDate: zod_1.z.string(),
            basicSalary: zod_1.z.number(),
            allowances: zod_1.z.number().optional(),
            deductions: zod_1.z.number().optional(),
            netSalary: zod_1.z.number().optional(),
            status: zod_1.z["enum"](['draft', 'processed', 'paid']).optional()
        })),
        skipDuplicates: zod_1.z.boolean()["default"](true),
        batchId: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, results, importedIds, _i, _b, row, exists, id, error_5;
            var _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _f.sent();
                        if (!database)
                            throw new Error("Database not available");
                        results = {
                            imported: 0,
                            skipped: 0,
                            errors: [],
                            batchId: input.batchId || ''
                        };
                        importedIds = [];
                        _i = 0, _b = input.data;
                        _f.label = 2;
                    case 2:
                        if (!(_i < _b.length)) return [3 /*break*/, 9];
                        row = _b[_i];
                        _f.label = 3;
                    case 3:
                        _f.trys.push([3, 7, , 8]);
                        // minimal validation
                        if (!row.employeeId || !row.paymentDate) {
                            results.errors.push("employeeId and paymentDate required");
                            results.skipped++;
                            return [3 /*break*/, 8];
                        }
                        if (!input.skipDuplicates) return [3 /*break*/, 5];
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.payroll)
                                .where(drizzle_orm_1.eq(schema_1.payroll.employeeId, row.employeeId))
                                .where(drizzle_orm_1.eq(schema_1.payroll.paymentDate, row.paymentDate))];
                    case 4:
                        exists = _f.sent();
                        if (exists.length > 0) {
                            results.skipped++;
                            return [3 /*break*/, 8];
                        }
                        _f.label = 5;
                    case 5:
                        id = uuid_1.v4();
                        return [4 /*yield*/, database.insert(schema_1.payroll).values({
                                id: id,
                                employeeId: row.employeeId,
                                paymentDate: row.paymentDate,
                                basicSalary: row.basicSalary,
                                allowances: (_c = row.allowances) !== null && _c !== void 0 ? _c : 0,
                                deductions: (_d = row.deductions) !== null && _d !== void 0 ? _d : 0,
                                netSalary: (_e = row.netSalary) !== null && _e !== void 0 ? _e : 0,
                                status: row.status || 'draft'
                            })];
                    case 6:
                        _f.sent();
                        importedIds.push(id);
                        results.imported++;
                        return [3 /*break*/, 8];
                    case 7:
                        error_5 = _f.sent();
                        results.errors.push("Error importing payroll row: " + error_5);
                        return [3 /*break*/, 8];
                    case 8:
                        _i++;
                        return [3 /*break*/, 2];
                    case 9:
                        // Store batch information for potential rollback
                        if (input.batchId && importedIds.length > 0) {
                            // Store in memory for now (could be moved to database)
                            if (!(globalThis.__import_batches)) {
                                globalThis.__import_batches = new Map();
                            }
                            globalThis.__import_batches.set(input.batchId, {
                                entityType: 'payroll',
                                importedIds: importedIds,
                                userId: ctx.user.id,
                                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            });
                        }
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "payroll_imported",
                                entityType: "payroll",
                                entityId: "bulk",
                                description: "Imported " + results.imported + " payroll records (batchId: " + input.batchId + ")"
                            })];
                    case 10:
                        _f.sent();
                        return [2 /*return*/, results];
                }
            });
        });
    }),
    // Rollback import batch
    rollbackImport: createProcedure
        .input(zod_1.z.object({ batchId: zod_1.z.string() }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var batchInfo, _i, _b, id, error_6;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        batchInfo = globalThis.__import_batches.get(input.batchId);
                        if (!batchInfo) {
                            throw new Error("Batch not found or already rolled back");
                        }
                        // Verify user authorization (only user who imported can rollback)
                        if (batchInfo.userId !== ctx.user.id) {
                            throw new Error("Unauthorized to rollback this batch");
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 7, , 8]);
                        if (!(batchInfo.entityType === 'payroll')) return [3 /*break*/, 5];
                        _i = 0, _b = batchInfo.importedIds;
                        _c.label = 2;
                    case 2:
                        if (!(_i < _b.length)) return [3 /*break*/, 5];
                        id = _b[_i];
                        return [4 /*yield*/, database["delete"](schema_1.payroll).where(drizzle_orm_1.eq(schema_1.payroll.id, id))];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        // Clear batch info
                        globalThis.__import_batches["delete"](input.batchId);
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "import_rolled_back",
                                entityType: batchInfo.entityType,
                                entityId: input.batchId,
                                description: "Rolled back import of " + batchInfo.importedIds.length + " " + batchInfo.entityType + " records"
                            })];
                    case 6:
                        _c.sent();
                        return [2 /*return*/, { success: true, recordsDeleted: batchInfo.importedIds.length }];
                    case 7:
                        error_6 = _c.sent();
                        throw new Error("Rollback failed: " + error_6);
                    case 8: return [2 /*return*/];
                }
            });
        });
    }),
    // Export clients
    exportClients: viewProcedure
        .input(zod_1.z.object({
        format: zod_1.z["enum"](['json', 'csv'])["default"]('json'),
        status: zod_1.z["enum"](['all', 'active', 'inactive', 'prospect', 'archived']).optional()
    }).optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, clientsData, headers, rows, csv;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, database.select().from(schema_1.clients)];
                    case 2:
                        clientsData = _b.sent();
                        if ((input === null || input === void 0 ? void 0 : input.status) && input.status !== 'all') {
                            clientsData = clientsData.filter(function (c) { return c.status === input.status; });
                        }
                        if ((input === null || input === void 0 ? void 0 : input.format) === 'csv') {
                            headers = ['Company Name', 'Contact Person', 'Email', 'Phone', 'Address', 'City', 'Country', 'Status'];
                            rows = clientsData.map(function (c) { return [
                                c.companyName,
                                c.contactPerson || '',
                                c.email || '',
                                c.phone || '',
                                c.address || '',
                                c.city || '',
                                c.country || '',
                                c.status || 'active',
                            ]; });
                            csv = __spreadArrays([
                                headers.join(',')
                            ], rows.map(function (row) { return row.map(function (cell) { return "\"" + cell + "\""; }).join(','); })).join('\n');
                            return [2 /*return*/, { data: csv, format: 'csv', fileName: "clients_" + new Date().toISOString().split('T')[0] + ".csv" }];
                        }
                        return [2 /*return*/, { data: clientsData, format: 'json', fileName: "clients_" + new Date().toISOString().split('T')[0] + ".json" }];
                }
            });
        });
    }),
    // Export services
    exportServices: viewProcedure
        .input(zod_1.z.object({
        format: zod_1.z["enum"](['json', 'csv'])["default"]('json')
    }).optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, servicesData, headers, rows, csv;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, database.select().from(schema_1.services)];
                    case 2:
                        servicesData = _b.sent();
                        if ((input === null || input === void 0 ? void 0 : input.format) === 'csv') {
                            headers = ['Service Name', 'Description', 'Service Type', 'Rate', 'Unit', 'Status'];
                            rows = servicesData.map(function (s) {
                                var _a, _b;
                                return [
                                    s.name,
                                    s.description || '',
                                    s.category || '',
                                    (_b = (_a = s.hourlyRate) !== null && _a !== void 0 ? _a : s.fixedPrice) !== null && _b !== void 0 ? _b : '',
                                    s.unit || '',
                                    s.isActive ? 'active' : 'inactive',
                                ];
                            });
                            csv = __spreadArrays([
                                headers.join(',')
                            ], rows.map(function (row) { return row.map(function (cell) { return "\"" + cell + "\""; }).join(','); })).join('\n');
                            return [2 /*return*/, { data: csv, format: 'csv', fileName: "services_" + new Date().toISOString().split('T')[0] + ".csv" }];
                        }
                        return [2 /*return*/, { data: servicesData, format: 'json', fileName: "services_" + new Date().toISOString().split('T')[0] + ".json" }];
                }
            });
        });
    }),
    // Export products
    exportProducts: viewProcedure
        .input(zod_1.z.object({
        format: zod_1.z["enum"](['json', 'csv'])["default"]('json')
    }).optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, productsData, headers, rows, csv;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, database.select().from(schema_1.products)];
                    case 2:
                        productsData = _b.sent();
                        if ((input === null || input === void 0 ? void 0 : input.format) === 'csv') {
                            headers = ['Product Name', 'Description', 'SKU', 'Unit Price', 'Quantity', 'Category', 'Status'];
                            rows = productsData.map(function (p) {
                                var _a, _b;
                                return [
                                    p.name,
                                    p.description || '',
                                    p.sku || '',
                                    (_a = p.unitPrice) !== null && _a !== void 0 ? _a : '',
                                    (_b = p.stockQuantity) !== null && _b !== void 0 ? _b : '',
                                    p.category || '',
                                    p.isActive ? 'active' : 'inactive',
                                ];
                            });
                            csv = __spreadArrays([
                                headers.join(',')
                            ], rows.map(function (row) { return row.map(function (cell) { return "\"" + cell + "\""; }).join(','); })).join('\n');
                            return [2 /*return*/, { data: csv, format: 'csv', fileName: "products_" + new Date().toISOString().split('T')[0] + ".csv" }];
                        }
                        return [2 /*return*/, { data: productsData, format: 'json', fileName: "products_" + new Date().toISOString().split('T')[0] + ".json" }];
                }
            });
        });
    }),
    // Import suppliers from CSV
    importSuppliers: createProcedure
        .input(zod_1.z.object({
        data: zod_1.z.array(zod_1.z.object({
            companyName: zod_1.z.string(),
            contactPerson: zod_1.z.string().optional(),
            email: zod_1.z.string().email().optional(),
            phone: zod_1.z.string().optional(),
            altPhone: zod_1.z.string().optional(),
            address: zod_1.z.string().optional(),
            city: zod_1.z.string().optional(),
            postalCode: zod_1.z.string().optional(),
            taxIdPin: zod_1.z.string().optional(),
            website: zod_1.z.string().optional(),
            paymentTerms: zod_1.z.string().optional(),
            qualificationStatus: zod_1.z["enum"](['pending', 'pre_qualified', 'qualified', 'rejected', 'inactive']).optional(),
            notes: zod_1.z.string().optional()
        })),
        skipDuplicates: zod_1.z.boolean()["default"](true)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, results, _i, _b, supplierData, existing, id, error_7;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error("Database not available");
                        results = {
                            imported: 0,
                            skipped: 0,
                            errors: []
                        };
                        _i = 0, _b = input.data;
                        _c.label = 2;
                    case 2:
                        if (!(_i < _b.length)) return [3 /*break*/, 9];
                        supplierData = _b[_i];
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 7, , 8]);
                        // Validate required fields
                        if (!supplierData.companyName) {
                            results.errors.push("Company name is required");
                            results.skipped++;
                            return [3 /*break*/, 8];
                        }
                        if (!(input.skipDuplicates && supplierData.email)) return [3 /*break*/, 5];
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_extended_1.suppliers)
                                .where(drizzle_orm_1.eq(schema_extended_1.suppliers.email, supplierData.email))];
                    case 4:
                        existing = _c.sent();
                        if (existing.length > 0) {
                            results.skipped++;
                            return [3 /*break*/, 8];
                        }
                        _c.label = 5;
                    case 5:
                        id = uuid_1.v4();
                        return [4 /*yield*/, database.insert(schema_extended_1.suppliers).values({
                                id: id,
                                companyName: supplierData.companyName,
                                contactPerson: supplierData.contactPerson,
                                email: supplierData.email,
                                phone: supplierData.phone,
                                altPhone: supplierData.altPhone,
                                address: supplierData.address,
                                city: supplierData.city,
                                postalCode: supplierData.postalCode,
                                taxIdPin: supplierData.taxIdPin,
                                website: supplierData.website,
                                paymentTerms: supplierData.paymentTerms,
                                qualificationStatus: supplierData.qualificationStatus || 'pending',
                                notes: supplierData.notes,
                                isActive: true,
                                createdBy: ctx.user.id,
                                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 6:
                        _c.sent();
                        results.imported++;
                        return [3 /*break*/, 8];
                    case 7:
                        error_7 = _c.sent();
                        results.errors.push("Error importing supplier " + supplierData.companyName + ": " + error_7);
                        return [3 /*break*/, 8];
                    case 8:
                        _i++;
                        return [3 /*break*/, 2];
                    case 9: 
                    // Log activity
                    return [4 /*yield*/, db.logActivity({
                            userId: ctx.user.id,
                            action: "suppliers_imported",
                            entityType: "supplier",
                            entityId: "bulk",
                            description: "Imported " + results.imported + " suppliers"
                        })];
                    case 10:
                        // Log activity
                        _c.sent();
                        return [2 /*return*/, results];
                }
            });
        });
    }),
    // Export suppliers to CSV/JSON
    exportSuppliers: viewProcedure
        .input(zod_1.z.object({
        format: zod_1.z["enum"](['json', 'csv'])["default"]('json')
    }).optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, suppliersData, headers, rows, csv;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, database.select().from(schema_extended_1.suppliers)];
                    case 2:
                        suppliersData = _b.sent();
                        if ((input === null || input === void 0 ? void 0 : input.format) === 'csv') {
                            headers = [
                                'Company Name', 'Contact Person', 'Email', 'Phone', 'Alt Phone',
                                'Address', 'City', 'Postal Code', 'Tax ID/PIN', 'Website',
                                'Payment Terms', 'Qualification Status', 'Quality Rating',
                                'Delivery Rating', 'Price Rating', 'Average Rating', 'Notes', 'Status'
                            ];
                            rows = suppliersData.map(function (s) {
                                var _a, _b, _c, _d;
                                return [
                                    s.companyName || '',
                                    s.contactPerson || '',
                                    s.email || '',
                                    s.phone || '',
                                    s.altPhone || '',
                                    s.address || '',
                                    s.city || '',
                                    s.postalCode || '',
                                    s.taxIdPin || '',
                                    s.website || '',
                                    s.paymentTerms || '',
                                    s.qualificationStatus || '',
                                    (_a = s.qualityRating) !== null && _a !== void 0 ? _a : '',
                                    (_b = s.deliveryRating) !== null && _b !== void 0 ? _b : '',
                                    (_c = s.priceCompetitiveness) !== null && _c !== void 0 ? _c : '',
                                    (_d = s.averageRating) !== null && _d !== void 0 ? _d : '',
                                    s.notes || '',
                                    s.isActive ? 'active' : 'inactive',
                                ];
                            });
                            csv = __spreadArrays([
                                headers.join(',')
                            ], rows.map(function (row) { return row.map(function (cell) { return "\"" + String(cell || '').replace(/"/g, '""') + "\""; }).join(','); })).join('\n');
                            return [2 /*return*/, { data: csv, format: 'csv', fileName: "suppliers_" + new Date().toISOString().split('T')[0] + ".csv" }];
                        }
                        return [2 /*return*/, { data: suppliersData, format: 'json', fileName: "suppliers_" + new Date().toISOString().split('T')[0] + ".json" }];
                }
            });
        });
    }),
    // Validate import data
    validateImportData: createProcedure
        .input(zod_1.z.object({
        type: zod_1.z["enum"](['clients', 'services', 'products', 'suppliers']),
        data: zod_1.z.array(zod_1.z.record(zod_1.z.string(), zod_1.z.any()))
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var errors, warnings, i, row;
            return __generator(this, function (_b) {
                errors = [];
                warnings = [];
                for (i = 0; i < input.data.length; i++) {
                    row = input.data[i];
                    if (input.type === 'clients') {
                        if (!row.companyName) {
                            errors.push("Row " + (i + 1) + ": Company name is required");
                        }
                        if (!row.email && !row.phone) {
                            warnings.push("Row " + (i + 1) + ": No contact information provided");
                        }
                    }
                    else if (input.type === 'services') {
                        if (!row.serviceName) {
                            errors.push("Row " + (i + 1) + ": Service name is required");
                        }
                    }
                    else if (input.type === 'products') {
                        if (!row.productName) {
                            errors.push("Row " + (i + 1) + ": Product name is required");
                        }
                    }
                    else if (input.type === 'suppliers') {
                        if (!row.companyName) {
                            errors.push("Row " + (i + 1) + ": Company name is required");
                        }
                        if (!row.email && !row.phone) {
                            warnings.push("Row " + (i + 1) + ": No contact information provided");
                        }
                    }
                }
                return [2 /*return*/, {
                        isValid: errors.length === 0,
                        errors: errors,
                        warnings: warnings,
                        rowCount: input.data.length
                    }];
            });
        });
    }),
    // Create Full Database Backup
    createBackup: createProcedure
        .query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var result, database, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        // Check admin permission
                        if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
                            throw new server_1.TRPCError({ code: "FORBIDDEN", message: "Only administrators can create backups" });
                        }
                        return [4 /*yield*/, backupService_1.createBackup(ctx.user.id, {
                                scope: 'full',
                                includeSensitive: false,
                                compress: true,
                                format: 'json'
                            })];
                    case 1:
                        result = _b.sent();
                        return [4 /*yield*/, db_1.getDb()];
                    case 2:
                        database = _b.sent();
                        if (!database) return [3 /*break*/, 4];
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: 'database_backup_created',
                                entityType: 'system',
                                entityId: 'backup',
                                description: "Database backup created with " + result.recordCount + " records from " + result.tableCount + " tables"
                            })];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4: return [2 /*return*/, {
                            success: true,
                            backup: {
                                metadata: result.metadata,
                                data: {},
                                stats: {
                                    totalRecords: result.recordCount,
                                    tablesBackedUp: result.tableCount,
                                    backupSize: result.size
                                }
                            },
                            fileName: result.filename
                        }];
                    case 5:
                        error_8 = _b.sent();
                        if (error_8 instanceof server_1.TRPCError)
                            throw error_8;
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Backup failed: " + error_8.message });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    // Restore Database from Backup
    restoreBackup: createProcedure
        .input(zod_1.z.object({
        backupData: zod_1.z.string(),
        mode: zod_1.z["enum"](['merge', 'replace'])["default"]('merge'),
        skipExisting: zod_1.z.boolean()["default"](true),
        validateOnly: zod_1.z.boolean()["default"](false),
        tableWhitelist: zod_1.z.array(zod_1.z.string()).optional(),
        tableBlacklist: zod_1.z.array(zod_1.z.string()).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var backupData, result, database, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        // Check admin permission
                        if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
                            throw new server_1.TRPCError({ code: "FORBIDDEN", message: "Only administrators can restore backups" });
                        }
                        backupData = void 0;
                        try {
                            backupData = JSON.parse(input.backupData);
                        }
                        catch (e) {
                            throw new server_1.TRPCError({ code: "BAD_REQUEST", message: "Invalid backup file format" });
                        }
                        return [4 /*yield*/, backupService_1.restoreBackup(backupData, ctx.user.id, {
                                mode: input.mode,
                                skipExisting: input.skipExisting,
                                validateOnly: input.validateOnly,
                                tableWhitelist: input.tableWhitelist,
                                tableBlacklist: input.tableBlacklist
                            })];
                    case 1:
                        result = _b.sent();
                        return [4 /*yield*/, db_1.getDb()];
                    case 2:
                        database = _b.sent();
                        if (!(database && !input.validateOnly)) return [3 /*break*/, 4];
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: 'database_backup_restored',
                                entityType: 'system',
                                entityId: 'backup',
                                description: "Database backup restored: " + result.restored + " records restored, " + result.skipped + " skipped, " + result.errors.length + " errors"
                            })];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4: return [2 /*return*/, {
                            success: result.errors.length === 0,
                            results: result,
                            message: input.validateOnly
                                ? "Validation completed: " + result.restored + " records would be restored"
                                : "Restored " + result.restored + " records from " + result.tablesProcessed + " tables"
                        }];
                    case 5:
                        error_9 = _b.sent();
                        if (error_9 instanceof server_1.TRPCError)
                            throw error_9;
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Restore failed: " + error_9.message });
                    case 6: return [2 /*return*/];
                }
            });
        });
    })
});
