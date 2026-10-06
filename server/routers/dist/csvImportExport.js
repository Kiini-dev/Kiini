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
exports.csvImportExportRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var server_1 = require("@trpc/server");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var schema_extended_1 = require("../../drizzle/schema-extended");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var csvGen = require("../utils/csvGenerator");
var db = require("../db");
var parseOptionalIntString = function (value) {
    var trimmed = value.trim();
    if (trimmed === "")
        return undefined;
    var parsed = Number.parseInt(trimmed, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
};
var parseRequiredIntString = function (value) {
    var trimmed = value.trim();
    if (trimmed === "")
        return 0;
    var parsed = Number.parseInt(trimmed, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
};
/**
 * CSV Import/Export Router
 * Handles template generation, CSV parsing, and module-specific imports
 */
exports.csvImportExportRouter = trpc_1.router({
    // Get list of available modules for import
    getAvailableModules: trpc_1.createFeatureRestrictedProcedure("data:export")
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, csvGen.getAvailableModules()];
        });
    }); }),
    // Generate CSV template for a specific module
    generateTemplate: trpc_1.createFeatureRestrictedProcedure("data:export")
        .input(zod_1.z["enum"]([
        'clients', 'employees', 'departments', 'jobGroups', 'products', 'services',
        'accounts', 'bankAccounts', 'expenses', 'suppliers', 'receipts', 'payroll', 'invoices', 'estimates'
    ]))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var template;
            return __generator(this, function (_b) {
                try {
                    template = csvGen.generateCSVTemplate(input);
                    return [2 /*return*/, {
                            success: true,
                            content: template,
                            module: input,
                            timestamp: new Date()
                        }];
                }
                catch (error) {
                    throw new server_1.TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to generate template: " + error
                    });
                }
                return [2 /*return*/];
            });
        });
    }),
    // Import clients from CSV data
    importClients: trpc_1.createFeatureRestrictedProcedure("data:import")
        .input(zod_1.z.object({
        data: zod_1.z.array(zod_1.z.object({
            companyName: zod_1.z.string(),
            contactPerson: zod_1.z.string().optional(),
            email: zod_1.z.preprocess(function (v) {
                var s = String(v !== null && v !== void 0 ? v : '').trim();
                if (!s)
                    return undefined;
                // Basic email shape check — coerce clearly invalid values to undefined
                return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s) ? s : undefined;
            }, zod_1.z.string().email().optional()),
            phone: zod_1.z.string().optional(),
            address: zod_1.z.string().optional(),
            city: zod_1.z.string().optional(),
            country: zod_1.z.string().optional(),
            postalCode: zod_1.z.string().optional(),
            taxId: zod_1.z.string().optional(),
            website: zod_1.z.string().optional(),
            industry: zod_1.z.string().optional(),
            status: zod_1.z.preprocess(function (v) {
                var s = String(v !== null && v !== void 0 ? v : '').trim().toLowerCase();
                return ['active', 'inactive', 'prospect', 'archived'].includes(s) ? s : undefined;
            }, zod_1.z["enum"](['active', 'inactive', 'prospect', 'archived']).optional()),
            businessType: zod_1.z.string().optional(),
            registrationNumber: zod_1.z.string().optional(),
            creditLimit: zod_1.z.number().optional().or(zod_1.z.string().transform(parseOptionalIntString))
        })),
        skipDuplicates: zod_1.z.boolean()["default"](true)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, results, idx, row, clientData, existing, id, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        results = {
                            imported: 0,
                            skipped: 0,
                            errors: [],
                            batchId: uuid_1.v4()
                        };
                        idx = 0;
                        _b.label = 2;
                    case 2:
                        if (!(idx < input.data.length)) return [3 /*break*/, 9];
                        row = idx + 1;
                        clientData = input.data[idx];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 7, , 8]);
                        // Validate required fields
                        if (!clientData.companyName || clientData.companyName.trim() === '') {
                            results.errors.push({ row: row, field: 'companyName', message: 'Company name is required' });
                            results.skipped++;
                            return [3 /*break*/, 8];
                        }
                        if (!(input.skipDuplicates && clientData.email)) return [3 /*break*/, 5];
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.clients)
                                .where(drizzle_orm_1.eq(schema_1.clients.email, clientData.email))];
                    case 4:
                        existing = _b.sent();
                        if (existing.length > 0) {
                            results.skipped++;
                            return [3 /*break*/, 8];
                        }
                        _b.label = 5;
                    case 5:
                        id = uuid_1.v4();
                        return [4 /*yield*/, database.insert(schema_1.clients).values({
                                id: id,
                                companyName: clientData.companyName,
                                contactPerson: clientData.contactPerson || null,
                                email: clientData.email || null,
                                phone: clientData.phone || null,
                                address: clientData.address || null,
                                city: clientData.city || null,
                                country: clientData.country || null,
                                postalCode: clientData.postalCode || null,
                                taxId: clientData.taxId || null,
                                website: clientData.website || null,
                                industry: clientData.industry || null,
                                status: clientData.status || 'active',
                                businessType: clientData.businessType || null,
                                registrationNumber: clientData.registrationNumber || null,
                                creditLimit: clientData.creditLimit ? parseInt(clientData.creditLimit.toString()) : null,
                                createdBy: ctx.user.id,
                                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 6:
                        _b.sent();
                        results.imported++;
                        return [3 /*break*/, 8];
                    case 7:
                        error_1 = _b.sent();
                        results.errors.push({
                            row: row,
                            message: "Failed to import client: " + error_1
                        });
                        return [3 /*break*/, 8];
                    case 8:
                        idx++;
                        return [3 /*break*/, 2];
                    case 9: 
                    // Log activity
                    return [4 /*yield*/, db.logActivity({
                            userId: ctx.user.id,
                            action: "csv_import_clients",
                            entityType: "client",
                            entityId: "bulk",
                            description: "Imported " + results.imported + " clients via CSV (skipped: " + results.skipped + ")"
                        })];
                    case 10:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, results];
                }
            });
        });
    }),
    // Import employees from CSV data
    importEmployees: trpc_1.createFeatureRestrictedProcedure("data:import")
        .input(zod_1.z.object({
        data: zod_1.z.array(zod_1.z.object({
            employeeNumber: zod_1.z.string(),
            firstName: zod_1.z.string(),
            lastName: zod_1.z.string(),
            email: zod_1.z.string().email().optional(),
            phone: zod_1.z.string().optional(),
            dateOfBirth: zod_1.z.string().optional(),
            hireDate: zod_1.z.string(),
            department: zod_1.z.string().optional(),
            position: zod_1.z.string().optional(),
            jobGroupId: zod_1.z.string().optional(),
            salary: zod_1.z.number().optional().or(zod_1.z.string().transform(parseOptionalIntString)),
            employmentType: zod_1.z["enum"](['full_time', 'part_time', 'contract', 'intern']).optional(),
            status: zod_1.z["enum"](['active', 'on_leave', 'terminated', 'suspended']).optional(),
            address: zod_1.z.string().optional(),
            nationalId: zod_1.z.string().optional(),
            bankAccountNumber: zod_1.z.string().optional(),
            taxId: zod_1.z.string().optional()
        })),
        skipDuplicates: zod_1.z.boolean()["default"](true)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, results, idx, row, empData, existing, id, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        results = {
                            imported: 0,
                            skipped: 0,
                            errors: [],
                            batchId: uuid_1.v4()
                        };
                        idx = 0;
                        _b.label = 2;
                    case 2:
                        if (!(idx < input.data.length)) return [3 /*break*/, 9];
                        row = idx + 1;
                        empData = input.data[idx];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 7, , 8]);
                        // Validate required fields
                        if (!empData.employeeNumber || empData.employeeNumber.trim() === '') {
                            results.errors.push({ row: row, field: 'employeeNumber', message: 'Employee number is required' });
                            results.skipped++;
                            return [3 /*break*/, 8];
                        }
                        if (!empData.firstName || empData.firstName.trim() === '') {
                            results.errors.push({ row: row, field: 'firstName', message: 'First name is required' });
                            results.skipped++;
                            return [3 /*break*/, 8];
                        }
                        if (!empData.lastName || empData.lastName.trim() === '') {
                            results.errors.push({ row: row, field: 'lastName', message: 'Last name is required' });
                            results.skipped++;
                            return [3 /*break*/, 8];
                        }
                        if (!empData.hireDate || empData.hireDate.trim() === '') {
                            results.errors.push({ row: row, field: 'hireDate', message: 'Hire date is required' });
                            results.skipped++;
                            return [3 /*break*/, 8];
                        }
                        if (!input.skipDuplicates) return [3 /*break*/, 5];
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.employees)
                                .where(drizzle_orm_1.eq(schema_1.employees.employeeNumber, empData.employeeNumber))];
                    case 4:
                        existing = _b.sent();
                        if (existing.length > 0) {
                            results.skipped++;
                            return [3 /*break*/, 8];
                        }
                        _b.label = 5;
                    case 5:
                        id = uuid_1.v4();
                        return [4 /*yield*/, database.insert(schema_1.employees).values({
                                id: id,
                                employeeNumber: empData.employeeNumber,
                                firstName: empData.firstName,
                                lastName: empData.lastName,
                                email: empData.email || null,
                                phone: empData.phone || null,
                                dateOfBirth: empData.dateOfBirth ? new Date(empData.dateOfBirth).toISOString() : null,
                                hireDate: new Date(empData.hireDate).toISOString(),
                                department: empData.department || null,
                                position: empData.position || null,
                                jobGroupId: empData.jobGroupId || uuid_1.v4(),
                                salary: empData.salary ? parseInt(empData.salary.toString()) : 0,
                                employmentType: empData.employmentType || 'full_time',
                                status: empData.status || 'active',
                                address: empData.address || null,
                                nationalId: empData.nationalId || null,
                                bankAccountNumber: empData.bankAccountNumber || null,
                                taxId: empData.taxId || null,
                                createdBy: ctx.user.id,
                                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 6:
                        _b.sent();
                        results.imported++;
                        return [3 /*break*/, 8];
                    case 7:
                        error_2 = _b.sent();
                        results.errors.push({
                            row: row,
                            message: "Failed to import employee: " + error_2
                        });
                        return [3 /*break*/, 8];
                    case 8:
                        idx++;
                        return [3 /*break*/, 2];
                    case 9: return [4 /*yield*/, db.logActivity({
                            userId: ctx.user.id,
                            action: "csv_import_employees",
                            entityType: "employee",
                            entityId: "bulk",
                            description: "Imported " + results.imported + " employees via CSV"
                        })];
                    case 10:
                        _b.sent();
                        return [2 /*return*/, results];
                }
            });
        });
    }),
    // Import products from CSV data
    importProducts: trpc_1.createFeatureRestrictedProcedure("data:import")
        .input(zod_1.z.object({
        data: zod_1.z.array(zod_1.z.object({
            productName: zod_1.z.string(),
            productCode: zod_1.z.string().optional(),
            description: zod_1.z.string().optional(),
            category: zod_1.z.string().optional(),
            unitPrice: zod_1.z.number().or(zod_1.z.string().transform(parseRequiredIntString)),
            taxRate: zod_1.z.number().optional().or(zod_1.z.string().transform(parseOptionalIntString)),
            quantity: zod_1.z.number().optional().or(zod_1.z.string().transform(parseOptionalIntString)),
            reorderLevel: zod_1.z.number().optional().or(zod_1.z.string().transform(parseOptionalIntString)),
            supplier: zod_1.z.string().optional(),
            status: zod_1.z["enum"](['active', 'inactive', 'discontinued']).optional()
        })),
        skipDuplicates: zod_1.z.boolean()["default"](true)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, results, idx, row, prodData, existing, id, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        results = {
                            imported: 0,
                            skipped: 0,
                            errors: [],
                            batchId: uuid_1.v4()
                        };
                        idx = 0;
                        _b.label = 2;
                    case 2:
                        if (!(idx < input.data.length)) return [3 /*break*/, 9];
                        row = idx + 1;
                        prodData = input.data[idx];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 7, , 8]);
                        if (!prodData.productName || prodData.productName.trim() === '') {
                            results.errors.push({ row: row, field: 'productName', message: 'Product name is required' });
                            results.skipped++;
                            return [3 /*break*/, 8];
                        }
                        if (!(input.skipDuplicates && prodData.productCode)) return [3 /*break*/, 5];
                        return [4 /*yield*/, database.select().from(schema_1.products).where(drizzle_orm_1.eq(schema_1.products.productCode, prodData.productCode))];
                    case 4:
                        existing = _b.sent();
                        if (existing.length > 0) {
                            results.skipped++;
                            return [3 /*break*/, 8];
                        }
                        _b.label = 5;
                    case 5:
                        id = uuid_1.v4();
                        return [4 /*yield*/, database.insert(schema_1.products).values({
                                id: id,
                                productName: prodData.productName,
                                productCode: prodData.productCode || uuid_1.v4(),
                                description: prodData.description || null,
                                category: prodData.category || null,
                                unitPrice: parseInt(prodData.unitPrice.toString()),
                                taxRate: prodData.taxRate ? parseInt(prodData.taxRate.toString()) : 0,
                                quantity: prodData.quantity ? parseInt(prodData.quantity.toString()) : 0,
                                reorderLevel: prodData.reorderLevel ? parseInt(prodData.reorderLevel.toString()) : 0,
                                supplier: prodData.supplier || null,
                                status: prodData.status || 'active',
                                createdBy: ctx.user.id,
                                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 6:
                        _b.sent();
                        results.imported++;
                        return [3 /*break*/, 8];
                    case 7:
                        error_3 = _b.sent();
                        results.errors.push({
                            row: row,
                            message: "Failed to import product: " + error_3
                        });
                        return [3 /*break*/, 8];
                    case 8:
                        idx++;
                        return [3 /*break*/, 2];
                    case 9: return [4 /*yield*/, db.logActivity({
                            userId: ctx.user.id,
                            action: "csv_import_products",
                            entityType: "product",
                            entityId: "bulk",
                            description: "Imported " + results.imported + " products via CSV"
                        })];
                    case 10:
                        _b.sent();
                        return [2 /*return*/, results];
                }
            });
        });
    }),
    // Import accounts (Chart of Accounts) from CSV data
    importAccounts: trpc_1.createFeatureRestrictedProcedure("data:import")
        .input(zod_1.z.object({
        data: zod_1.z.array(zod_1.z.object({
            accountCode: zod_1.z.string(),
            accountName: zod_1.z.string(),
            accountType: zod_1.z["enum"](['asset', 'liability', 'equity', 'revenue', 'expense']),
            parentAccountCode: zod_1.z.string().optional(),
            description: zod_1.z.string().optional(),
            isActive: zod_1.z.boolean().optional().or(zod_1.z.string().transform(function (v) { return v === 'true'; }))
        })),
        skipDuplicates: zod_1.z.boolean()["default"](true)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, results, importedCodes, idx, row, accData, existing, parentAccountId, parentFromDb, id, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        results = {
                            imported: 0,
                            skipped: 0,
                            errors: [],
                            batchId: uuid_1.v4()
                        };
                        importedCodes = new Map();
                        idx = 0;
                        _b.label = 2;
                    case 2:
                        if (!(idx < input.data.length)) return [3 /*break*/, 11];
                        row = idx + 1;
                        accData = input.data[idx];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 9, , 10]);
                        if (!accData.accountCode || accData.accountCode.trim() === '') {
                            results.errors.push({ row: row, field: 'accountCode', message: 'Account code is required' });
                            results.skipped++;
                            return [3 /*break*/, 10];
                        }
                        if (!accData.accountName || accData.accountName.trim() === '') {
                            results.errors.push({ row: row, field: 'accountName', message: 'Account name is required' });
                            results.skipped++;
                            return [3 /*break*/, 10];
                        }
                        if (!input.skipDuplicates) return [3 /*break*/, 5];
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.accounts)
                                .where(drizzle_orm_1.eq(schema_1.accounts.accountCode, accData.accountCode))];
                    case 4:
                        existing = _b.sent();
                        if (existing.length > 0) {
                            results.skipped++;
                            return [3 /*break*/, 10];
                        }
                        _b.label = 5;
                    case 5:
                        parentAccountId = null;
                        if (!accData.parentAccountCode) return [3 /*break*/, 7];
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.accounts)
                                .where(drizzle_orm_1.eq(schema_1.accounts.accountCode, accData.parentAccountCode))];
                    case 6:
                        parentFromDb = _b.sent();
                        if (parentFromDb.length === 0) {
                            results.errors.push({
                                row: row,
                                field: 'parentAccountCode',
                                message: "Parent account with code " + accData.parentAccountCode + " not found"
                            });
                            results.skipped++;
                            return [3 /*break*/, 10];
                        }
                        parentAccountId = parentFromDb[0].id;
                        _b.label = 7;
                    case 7:
                        id = uuid_1.v4();
                        importedCodes.set(accData.accountCode, id);
                        return [4 /*yield*/, database.insert(schema_1.accounts).values({
                                id: id,
                                accountCode: accData.accountCode,
                                accountName: accData.accountName,
                                accountType: accData.accountType,
                                parentAccountId: parentAccountId,
                                description: accData.description || null,
                                isActive: accData.isActive ? 1 : 0,
                                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 8:
                        _b.sent();
                        results.imported++;
                        return [3 /*break*/, 10];
                    case 9:
                        error_4 = _b.sent();
                        results.errors.push({
                            row: row,
                            message: "Failed to import account: " + error_4
                        });
                        return [3 /*break*/, 10];
                    case 10:
                        idx++;
                        return [3 /*break*/, 2];
                    case 11: return [4 /*yield*/, db.logActivity({
                            userId: ctx.user.id,
                            action: "csv_import_accounts",
                            entityType: "account",
                            entityId: "bulk",
                            description: "Imported " + results.imported + " accounts via CSV"
                        })];
                    case 12:
                        _b.sent();
                        return [2 /*return*/, results];
                }
            });
        });
    }),
    // Import payments from CSV data
    importPayments: trpc_1.createFeatureRestrictedProcedure("data:import")
        .input(zod_1.z.object({
        data: zod_1.z.array(zod_1.z.object({
            invoiceNumber: zod_1.z.string(),
            clientName: zod_1.z.string().optional(),
            amount: zod_1.z.number().or(zod_1.z.string().transform(parseRequiredIntString)),
            paymentDate: zod_1.z.string(),
            paymentMethod: zod_1.z["enum"](['cash', 'bank_transfer', 'cheque', 'card', 'other']).optional(),
            reference: zod_1.z.string().optional(),
            description: zod_1.z.string().optional(),
            status: zod_1.z["enum"](['pending', 'completed', 'cancelled']).optional()
        })),
        skipDuplicates: zod_1.z.boolean()["default"](true)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, results, idx, row, payData, id, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        results = {
                            imported: 0,
                            skipped: 0,
                            errors: [],
                            batchId: uuid_1.v4()
                        };
                        idx = 0;
                        _b.label = 2;
                    case 2:
                        if (!(idx < input.data.length)) return [3 /*break*/, 7];
                        row = idx + 1;
                        payData = input.data[idx];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 5, , 6]);
                        if (!payData.invoiceNumber || payData.invoiceNumber.trim() === '') {
                            results.errors.push({ row: row, field: 'invoiceNumber', message: 'Invoice number is required' });
                            results.skipped++;
                            return [3 /*break*/, 6];
                        }
                        if (!payData.amount || payData.amount <= 0) {
                            results.errors.push({ row: row, field: 'amount', message: 'Amount must be greater than 0' });
                            results.skipped++;
                            return [3 /*break*/, 6];
                        }
                        id = uuid_1.v4();
                        return [4 /*yield*/, database.insert(payments).values({
                                id: id,
                                invoiceNumber: payData.invoiceNumber,
                                amount: parseInt(payData.amount.toString()),
                                paymentDate: new Date(payData.paymentDate).toISOString().replace('T', ' ').substring(0, 19),
                                paymentMethod: payData.paymentMethod || 'bank_transfer',
                                reference: payData.reference || null,
                                description: payData.description || null,
                                status: payData.status || 'completed',
                                createdBy: ctx.user.id,
                                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 4:
                        _b.sent();
                        results.imported++;
                        return [3 /*break*/, 6];
                    case 5:
                        error_5 = _b.sent();
                        results.errors.push({
                            row: row,
                            message: "Failed to import payment: " + error_5
                        });
                        return [3 /*break*/, 6];
                    case 6:
                        idx++;
                        return [3 /*break*/, 2];
                    case 7: return [4 /*yield*/, db.logActivity({
                            userId: ctx.user.id,
                            action: "csv_import_payments",
                            entityType: "payment",
                            entityId: "bulk",
                            description: "Imported " + results.imported + " payments via CSV"
                        })];
                    case 8:
                        _b.sent();
                        return [2 /*return*/, results];
                }
            });
        });
    }),
    // Import departments from CSV
    importDepartments: trpc_1.createFeatureRestrictedProcedure("data:import")
        .input(zod_1.z.object({
        data: zod_1.z.array(zod_1.z.object({
            name: zod_1.z.string(),
            description: zod_1.z.string().optional(),
            budget: zod_1.z.number().optional(),
            status: zod_1.z["enum"](['active', 'inactive']).optional(),
            defaultRole: zod_1.z.string().optional()
        })),
        skipDuplicates: zod_1.z.boolean()["default"](true)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, results, row, d, existing, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        results = { imported: 0, skipped: 0, errors: [] };
                        row = 0;
                        _b.label = 2;
                    case 2:
                        if (!(row < input.data.length)) return [3 /*break*/, 9];
                        d = input.data[row];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 7, , 8]);
                        if (!d.name) {
                            results.errors.push({ row: row + 1, message: 'Name is required' });
                            results.skipped++;
                            return [3 /*break*/, 8];
                        }
                        if (!input.skipDuplicates) return [3 /*break*/, 5];
                        return [4 /*yield*/, database.select().from(schema_1.departments).where(drizzle_orm_1.eq(schema_1.departments.name, d.name))];
                    case 4:
                        existing = _b.sent();
                        if (existing.length > 0) {
                            results.skipped++;
                            return [3 /*break*/, 8];
                        }
                        _b.label = 5;
                    case 5: return [4 /*yield*/, database.insert(schema_1.departments).values({
                            id: uuid_1.v4(), name: d.name, description: d.description || null,
                            budget: d.budget || null, status: d.status || 'active',
                            defaultRole: d.defaultRole || null, createdBy: ctx.user.id,
                            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        })];
                    case 6:
                        _b.sent();
                        results.imported++;
                        return [3 /*break*/, 8];
                    case 7:
                        error_6 = _b.sent();
                        results.errors.push({ row: row + 1, message: "Failed: " + error_6 });
                        return [3 /*break*/, 8];
                    case 8:
                        row++;
                        return [3 /*break*/, 2];
                    case 9: return [4 /*yield*/, db.logActivity({ userId: ctx.user.id, action: "csv_import_departments", entityType: "department", entityId: "bulk", description: "Imported " + results.imported + " departments via CSV" })];
                    case 10:
                        _b.sent();
                        return [2 /*return*/, results];
                }
            });
        });
    }),
    // Import job groups from CSV
    importJobGroups: trpc_1.createFeatureRestrictedProcedure("data:import")
        .input(zod_1.z.object({
        data: zod_1.z.array(zod_1.z.object({
            name: zod_1.z.string(),
            minimumGrossSalary: zod_1.z.number(),
            maximumGrossSalary: zod_1.z.number(),
            description: zod_1.z.string().optional(),
            isActive: zod_1.z.boolean().optional()
        })),
        skipDuplicates: zod_1.z.boolean()["default"](true)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, results, row, d, existing, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        results = { imported: 0, skipped: 0, errors: [] };
                        row = 0;
                        _b.label = 2;
                    case 2:
                        if (!(row < input.data.length)) return [3 /*break*/, 9];
                        d = input.data[row];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 7, , 8]);
                        if (!d.name) {
                            results.errors.push({ row: row + 1, message: 'Name is required' });
                            results.skipped++;
                            return [3 /*break*/, 8];
                        }
                        if (!input.skipDuplicates) return [3 /*break*/, 5];
                        return [4 /*yield*/, database.select().from(schema_1.jobGroups).where(drizzle_orm_1.eq(schema_1.jobGroups.name, d.name))];
                    case 4:
                        existing = _b.sent();
                        if (existing.length > 0) {
                            results.skipped++;
                            return [3 /*break*/, 8];
                        }
                        _b.label = 5;
                    case 5: return [4 /*yield*/, database.insert(schema_1.jobGroups).values({
                            id: uuid_1.v4(), name: d.name,
                            minimumGrossSalary: d.minimumGrossSalary, maximumGrossSalary: d.maximumGrossSalary,
                            description: d.description || null, isActive: d.isActive !== false ? 1 : 0,
                            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        })];
                    case 6:
                        _b.sent();
                        results.imported++;
                        return [3 /*break*/, 8];
                    case 7:
                        error_7 = _b.sent();
                        results.errors.push({ row: row + 1, message: "Failed: " + error_7 });
                        return [3 /*break*/, 8];
                    case 8:
                        row++;
                        return [3 /*break*/, 2];
                    case 9: return [4 /*yield*/, db.logActivity({ userId: ctx.user.id, action: "csv_import_jobgroups", entityType: "jobGroup", entityId: "bulk", description: "Imported " + results.imported + " job groups via CSV" })];
                    case 10:
                        _b.sent();
                        return [2 /*return*/, results];
                }
            });
        });
    }),
    // Import services from CSV
    importServices: trpc_1.createFeatureRestrictedProcedure("data:import")
        .input(zod_1.z.object({
        data: zod_1.z.array(zod_1.z.object({
            name: zod_1.z.string(),
            description: zod_1.z.string().optional(),
            category: zod_1.z.string().optional(),
            hourlyRate: zod_1.z.number().optional(),
            fixedPrice: zod_1.z.number().optional(),
            unit: zod_1.z.string().optional(),
            isActive: zod_1.z.boolean().optional()
        })),
        skipDuplicates: zod_1.z.boolean()["default"](true)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, results, row, d, existing, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        results = { imported: 0, skipped: 0, errors: [] };
                        row = 0;
                        _b.label = 2;
                    case 2:
                        if (!(row < input.data.length)) return [3 /*break*/, 9];
                        d = input.data[row];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 7, , 8]);
                        if (!d.name) {
                            results.errors.push({ row: row + 1, message: 'Name is required' });
                            results.skipped++;
                            return [3 /*break*/, 8];
                        }
                        if (!input.skipDuplicates) return [3 /*break*/, 5];
                        return [4 /*yield*/, database.select().from(schema_1.services).where(drizzle_orm_1.eq(schema_1.services.name, d.name))];
                    case 4:
                        existing = _b.sent();
                        if (existing.length > 0) {
                            results.skipped++;
                            return [3 /*break*/, 8];
                        }
                        _b.label = 5;
                    case 5: return [4 /*yield*/, database.insert(schema_1.services).values({
                            id: uuid_1.v4(), name: d.name, description: d.description || null,
                            category: d.category || null, hourlyRate: d.hourlyRate || null,
                            fixedPrice: d.fixedPrice || null, unit: d.unit || null,
                            isActive: d.isActive !== false ? 1 : 0,
                            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        })];
                    case 6:
                        _b.sent();
                        results.imported++;
                        return [3 /*break*/, 8];
                    case 7:
                        error_8 = _b.sent();
                        results.errors.push({ row: row + 1, message: "Failed: " + error_8 });
                        return [3 /*break*/, 8];
                    case 8:
                        row++;
                        return [3 /*break*/, 2];
                    case 9: return [4 /*yield*/, db.logActivity({ userId: ctx.user.id, action: "csv_import_services", entityType: "service", entityId: "bulk", description: "Imported " + results.imported + " services via CSV" })];
                    case 10:
                        _b.sent();
                        return [2 /*return*/, results];
                }
            });
        });
    }),
    // Import bank accounts from CSV
    importBankAccounts: trpc_1.createFeatureRestrictedProcedure("data:import")
        .input(zod_1.z.object({
        data: zod_1.z.array(zod_1.z.object({
            accountName: zod_1.z.string(),
            bankName: zod_1.z.string(),
            accountNumber: zod_1.z.string(),
            currency: zod_1.z.string().optional(),
            balance: zod_1.z.number().optional(),
            isActive: zod_1.z.boolean().optional()
        })),
        skipDuplicates: zod_1.z.boolean()["default"](true)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, results, row, d, existing, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        results = { imported: 0, skipped: 0, errors: [] };
                        row = 0;
                        _b.label = 2;
                    case 2:
                        if (!(row < input.data.length)) return [3 /*break*/, 9];
                        d = input.data[row];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 7, , 8]);
                        if (!d.accountName || !d.bankName || !d.accountNumber) {
                            results.errors.push({ row: row + 1, message: 'Account name, bank name, and account number are required' });
                            results.skipped++;
                            return [3 /*break*/, 8];
                        }
                        if (!input.skipDuplicates) return [3 /*break*/, 5];
                        return [4 /*yield*/, database.select().from(schema_1.bankAccounts).where(drizzle_orm_1.eq(schema_1.bankAccounts.accountNumber, d.accountNumber))];
                    case 4:
                        existing = _b.sent();
                        if (existing.length > 0) {
                            results.skipped++;
                            return [3 /*break*/, 8];
                        }
                        _b.label = 5;
                    case 5: return [4 /*yield*/, database.insert(schema_1.bankAccounts).values({
                            id: uuid_1.v4(), accountName: d.accountName, bankName: d.bankName,
                            accountNumber: d.accountNumber, currency: d.currency || 'KES',
                            balance: d.balance || 0, isActive: d.isActive !== false ? 1 : 0,
                            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        })];
                    case 6:
                        _b.sent();
                        results.imported++;
                        return [3 /*break*/, 8];
                    case 7:
                        error_9 = _b.sent();
                        results.errors.push({ row: row + 1, message: "Failed: " + error_9 });
                        return [3 /*break*/, 8];
                    case 8:
                        row++;
                        return [3 /*break*/, 2];
                    case 9: return [4 /*yield*/, db.logActivity({ userId: ctx.user.id, action: "csv_import_bankaccounts", entityType: "bankAccount", entityId: "bulk", description: "Imported " + results.imported + " bank accounts via CSV" })];
                    case 10:
                        _b.sent();
                        return [2 /*return*/, results];
                }
            });
        });
    }),
    // Import expenses from CSV
    importExpenses: trpc_1.createFeatureRestrictedProcedure("data:import")
        .input(zod_1.z.object({
        data: zod_1.z.array(zod_1.z.object({
            category: zod_1.z.string(),
            amount: zod_1.z.number(),
            expenseDate: zod_1.z.string(),
            vendor: zod_1.z.string().optional(),
            description: zod_1.z.string().optional(),
            paymentMethod: zod_1.z["enum"](['cash', 'bank_transfer', 'cheque', 'mpesa', 'card', 'other']).optional(),
            status: zod_1.z["enum"](['pending', 'approved', 'rejected', 'paid']).optional()
        })),
        skipDuplicates: zod_1.z.boolean()["default"](false)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, results, row, d, expNum, error_10;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        results = { imported: 0, skipped: 0, errors: [] };
                        row = 0;
                        _b.label = 2;
                    case 2:
                        if (!(row < input.data.length)) return [3 /*break*/, 7];
                        d = input.data[row];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 5, , 6]);
                        if (!d.category || !d.expenseDate) {
                            results.errors.push({ row: row + 1, message: 'Category and expense date are required' });
                            results.skipped++;
                            return [3 /*break*/, 6];
                        }
                        expNum = "EXP-" + Date.now() + "-" + row;
                        return [4 /*yield*/, database.insert(schema_1.expenses).values({
                                id: uuid_1.v4(), expenseNumber: expNum,
                                category: d.category, vendor: d.vendor || null,
                                amount: Math.round(d.amount), expenseDate: d.expenseDate,
                                paymentMethod: d.paymentMethod || 'cash',
                                description: d.description || null,
                                status: d.status || 'pending', createdBy: ctx.user.id,
                                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 4:
                        _b.sent();
                        results.imported++;
                        return [3 /*break*/, 6];
                    case 5:
                        error_10 = _b.sent();
                        results.errors.push({ row: row + 1, message: "Failed: " + error_10 });
                        return [3 /*break*/, 6];
                    case 6:
                        row++;
                        return [3 /*break*/, 2];
                    case 7: return [4 /*yield*/, db.logActivity({ userId: ctx.user.id, action: "csv_import_expenses", entityType: "expense", entityId: "bulk", description: "Imported " + results.imported + " expenses via CSV" })];
                    case 8:
                        _b.sent();
                        return [2 /*return*/, results];
                }
            });
        });
    }),
    // Import suppliers from CSV
    importSuppliers: trpc_1.createFeatureRestrictedProcedure("data:import")
        .input(zod_1.z.object({
        data: zod_1.z.array(zod_1.z.object({
            companyName: zod_1.z.string(),
            contactPerson: zod_1.z.string().optional(),
            email: zod_1.z.string().optional(),
            phone: zod_1.z.string().optional(),
            address: zod_1.z.string().optional(),
            city: zod_1.z.string().optional(),
            postalCode: zod_1.z.string().optional(),
            taxIdPin: zod_1.z.string().optional(),
            website: zod_1.z.string().optional(),
            paymentTerms: zod_1.z.string().optional(),
            notes: zod_1.z.string().optional()
        })),
        skipDuplicates: zod_1.z.boolean()["default"](true)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, results, row, d, existing, error_11;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        results = { imported: 0, skipped: 0, errors: [] };
                        row = 0;
                        _b.label = 2;
                    case 2:
                        if (!(row < input.data.length)) return [3 /*break*/, 9];
                        d = input.data[row];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 7, , 8]);
                        if (!d.companyName) {
                            results.errors.push({ row: row + 1, message: 'Company name is required' });
                            results.skipped++;
                            return [3 /*break*/, 8];
                        }
                        if (!(input.skipDuplicates && d.email)) return [3 /*break*/, 5];
                        return [4 /*yield*/, database.select().from(schema_extended_1.suppliers).where(drizzle_orm_1.eq(schema_extended_1.suppliers.email, d.email))];
                    case 4:
                        existing = _b.sent();
                        if (existing.length > 0) {
                            results.skipped++;
                            return [3 /*break*/, 8];
                        }
                        _b.label = 5;
                    case 5: return [4 /*yield*/, database.insert(schema_extended_1.suppliers).values({
                            id: uuid_1.v4(), companyName: d.companyName, contactPerson: d.contactPerson || null,
                            email: d.email || null, phone: d.phone || null,
                            address: d.address || null, city: d.city || null,
                            postalCode: d.postalCode || null, taxIdPin: d.taxIdPin || null,
                            website: d.website || null, paymentTerms: d.paymentTerms || null,
                            notes: d.notes || null, isActive: true,
                            qualificationStatus: 'pending', createdBy: ctx.user.id,
                            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        })];
                    case 6:
                        _b.sent();
                        results.imported++;
                        return [3 /*break*/, 8];
                    case 7:
                        error_11 = _b.sent();
                        results.errors.push({ row: row + 1, message: "Failed: " + error_11 });
                        return [3 /*break*/, 8];
                    case 8:
                        row++;
                        return [3 /*break*/, 2];
                    case 9: return [4 /*yield*/, db.logActivity({ userId: ctx.user.id, action: "csv_import_suppliers", entityType: "supplier", entityId: "bulk", description: "Imported " + results.imported + " suppliers via CSV" })];
                    case 10:
                        _b.sent();
                        return [2 /*return*/, results];
                }
            });
        });
    }),
    // Unified export — returns CSV or JSON for any module
    exportData: trpc_1.createFeatureRestrictedProcedure("data:export")
        .input(zod_1.z.object({
        module: zod_1.z["enum"](['clients', 'employees', 'departments', 'jobGroups', 'products', 'services', 'accounts', 'bankAccounts', 'expenses', 'suppliers', 'invoices', 'estimates', 'receipts', 'payroll']),
        format: zod_1.z["enum"](['csv', 'json'])["default"]('csv')
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, today, toCSV, tableMap, config, data, csvContent;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        today = new Date().toISOString().split('T')[0];
                        toCSV = function (headers, rows) {
                            return __spreadArrays([headers.join(',')], rows.map(function (r) { return r.map(function (c) { return "\"" + String(c !== null && c !== void 0 ? c : '').replace(/"/g, '""') + "\""; }).join(','); })).join('\n');
                        };
                        tableMap = {
                            clients: { schema: schema_1.clients, headers: ['Company Name', 'Contact Person', 'Email', 'Phone', 'Address', 'City', 'Country', 'Tax ID', 'Status', 'Industry', 'Currency', 'Credit Limit (cents)', 'Payment Terms'], map: function (r) { return [r.companyName, r.contactPerson, r.email, r.phone, r.address, r.city, r.country, r.taxId, r.status, r.industry, r.currency, r.creditLimit, r.paymentTerms]; } },
                            employees: { schema: schema_1.employees, headers: ['Employee Number', 'First Name', 'Last Name', 'Email', 'Phone', 'Gender', 'Department', 'Position', 'Employment Type', 'Status', 'Hire Date', 'Salary (cents)', 'National ID', 'NHIF Number', 'NSSF Number', 'Tax ID', 'Bank Name', 'Bank Account Number'], map: function (r) { return [r.employeeNumber, r.firstName, r.lastName, r.email, r.phone, r.gender, r.department, r.position, r.employmentType, r.status, r.hireDate, r.salary, r.nationalId, r.nhifNumber, r.nssfNumber, r.taxId, r.bankName, r.bankAccountNumber]; } },
                            departments: { schema: schema_1.departments, headers: ['Name', 'Description', 'Budget (cents)', 'Status', 'Default Role'], map: function (r) { return [r.name, r.description, r.budget, r.status, r.defaultRole]; } },
                            jobGroups: { schema: schema_1.jobGroups, headers: ['Name', 'Min Gross Salary (cents)', 'Max Gross Salary (cents)', 'Description', 'Is Active'], map: function (r) { return [r.name, r.minimumGrossSalary, r.maximumGrossSalary, r.description, r.isActive ? 'yes' : 'no']; } },
                            products: { schema: schema_1.products, headers: ['Name', 'Description', 'SKU', 'Unit Price (cents)', 'Stock Quantity', 'Category', 'Status'], map: function (r) { return [r.name, r.description, r.sku, r.unitPrice, r.stockQuantity, r.category, r.isActive ? 'active' : 'inactive']; } },
                            services: { schema: schema_1.services, headers: ['Name', 'Description', 'Category', 'Hourly Rate (cents)', 'Fixed Price (cents)', 'Unit', 'Status'], map: function (r) { return [r.name, r.description, r.category, r.hourlyRate, r.fixedPrice, r.unit, r.isActive ? 'active' : 'inactive']; } },
                            accounts: { schema: schema_1.accounts, headers: ['Account Code', 'Account Name', 'Account Type', 'Description', 'Is Active'], map: function (r) { return [r.accountCode, r.accountName, r.accountType, r.description, r.isActive ? 'yes' : 'no']; } },
                            bankAccounts: { schema: schema_1.bankAccounts, headers: ['Account Name', 'Bank Name', 'Account Number', 'Currency', 'Balance (cents)', 'Is Active'], map: function (r) { return [r.accountName, r.bankName, r.accountNumber, r.currency, r.balance, r.isActive ? 'yes' : 'no']; } },
                            expenses: { schema: schema_1.expenses, headers: ['Expense Number', 'Category', 'Vendor', 'Amount (cents)', 'Expense Date', 'Payment Method', 'Description', 'Status'], map: function (r) { return [r.expenseNumber, r.category, r.vendor, r.amount, r.expenseDate, r.paymentMethod, r.description, r.status]; } },
                            suppliers: { schema: schema_extended_1.suppliers, headers: ['Company Name', 'Contact Person', 'Email', 'Phone', 'Address', 'City', 'Postal Code', 'Tax ID/PIN', 'Website', 'Payment Terms', 'Qualification Status', 'Notes', 'Status'], map: function (r) { return [r.companyName, r.contactPerson, r.email, r.phone, r.address, r.city, r.postalCode, r.taxIdPin, r.website, r.paymentTerms, r.qualificationStatus, r.notes, r.isActive ? 'active' : 'inactive']; } },
                            invoices: { schema: schema_1.invoices, headers: ['Invoice Number', 'Client ID', 'Title', 'Status', 'Issue Date', 'Due Date', 'Subtotal (cents)', 'Tax (cents)', 'Discount (cents)', 'Total (cents)', 'Paid Amount (cents)', 'Notes'], map: function (r) { return [r.invoiceNumber, r.clientId, r.title, r.status, r.issueDate, r.dueDate, r.subtotal, r.taxAmount, r.discountAmount, r.total, r.paidAmount, r.notes]; } },
                            estimates: { schema: schema_1.estimates, headers: ['Estimate Number', 'Client ID', 'Title', 'Status', 'Issue Date', 'Expiry Date', 'Subtotal (cents)', 'Tax (cents)', 'Discount (cents)', 'Total (cents)', 'Notes'], map: function (r) { return [r.estimateNumber, r.clientId, r.title, r.status, r.issueDate, r.expiryDate, r.subtotal, r.taxAmount, r.discountAmount, r.total, r.notes]; } },
                            receipts: { schema: schema_1.receipts, headers: ['Receipt Number', 'Client ID', 'Amount (cents)', 'Payment Method', 'Receipt Date', 'Notes'], map: function (r) { return [r.receiptNumber, r.clientId, r.amount, r.paymentMethod, r.receiptDate, r.notes]; } },
                            payroll: { schema: schema_1.payroll, headers: ['Employee ID', 'Payment Date', 'Basic Salary (cents)', 'Allowances (cents)', 'Deductions (cents)', 'Net Salary (cents)', 'Status'], map: function (r) { return [r.employeeId, r.paymentDate, r.basicSalary, r.allowances, r.deductions, r.netSalary, r.status]; } }
                        };
                        config = tableMap[input.module];
                        return [4 /*yield*/, database.select().from(config.schema)];
                    case 2:
                        data = _b.sent();
                        if (input.format === 'csv') {
                            csvContent = toCSV(config.headers, data.map(config.map));
                            return [2 /*return*/, { content: csvContent, format: 'csv', fileName: input.module + "_" + today + ".csv", count: data.length }];
                        }
                        return [2 /*return*/, { content: JSON.stringify(data, null, 2), format: 'json', fileName: input.module + "_" + today + ".json", count: data.length }];
                }
            });
        });
    })
});
