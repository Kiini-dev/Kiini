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
exports.importExcelRouter = void 0;
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
// Feature-based procedures
var importProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("data:import");
var importClientSchema = zod_1.z.object({
    data: zod_1.z.array(zod_1.z.record(zod_1.z.string(), zod_1.z.any())),
    fieldMap: zod_1.z.record(zod_1.z.string(), zod_1.z.string())
});
var importEmployeeSchema = zod_1.z.object({
    data: zod_1.z.array(zod_1.z.record(zod_1.z.string(), zod_1.z.any())),
    fieldMap: zod_1.z.record(zod_1.z.string(), zod_1.z.string())
});
var importServiceSchema = zod_1.z.object({
    data: zod_1.z.array(zod_1.z.record(zod_1.z.string(), zod_1.z.any())),
    fieldMap: zod_1.z.record(zod_1.z.string(), zod_1.z.string())
});
exports.importExcelRouter = trpc_1.router({
    /**
     * Validate and import clients from uploaded data
     */
    importClients: importProcedure
        .input(importClientSchema)
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, result, i, row, mappedData, existing, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        result = {
                            success: 0,
                            failed: 0,
                            errors: [],
                            warnings: []
                        };
                        i = 0;
                        _b.label = 2;
                    case 2:
                        if (!(i < input.data.length)) return [3 /*break*/, 8];
                        row = input.data[i];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 6, , 7]);
                        mappedData = {
                            companyName: row[input.fieldMap.companyName] || "",
                            email: row[input.fieldMap.email] || "",
                            phone: row[input.fieldMap.phone] || "",
                            address: row[input.fieldMap.address] || "",
                            city: row[input.fieldMap.city] || "",
                            postalCode: row[input.fieldMap.postalCode] || "",
                            country: row[input.fieldMap.country] || "",
                            industry: row[input.fieldMap.industry] || "",
                            website: row[input.fieldMap.website] || ""
                        };
                        // Validate required fields
                        if (!mappedData.companyName) {
                            result.errors.push({ row: i + 1, error: "Company name is required" });
                            result.failed++;
                            return [3 /*break*/, 7];
                        }
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.clients)
                                .where(drizzle_orm_1.eq(schema_1.clients.companyName, mappedData.companyName))
                                .limit(1)];
                    case 4:
                        existing = _b.sent();
                        if (existing.length > 0) {
                            result.warnings.push("Row " + (i + 1) + ": Client \"" + mappedData.companyName + "\" already exists");
                            result.failed++;
                            return [3 /*break*/, 7];
                        }
                        // Insert client
                        return [4 /*yield*/, db.insert(schema_1.clients).values(__assign(__assign({}, mappedData), { createdAt: new Date(), updatedAt: new Date() }))];
                    case 5:
                        // Insert client
                        _b.sent();
                        result.success++;
                        return [3 /*break*/, 7];
                    case 6:
                        err_1 = _b.sent();
                        result.errors.push({ row: i + 1, error: err_1.message || "Unknown error" });
                        result.failed++;
                        return [3 /*break*/, 7];
                    case 7:
                        i++;
                        return [3 /*break*/, 2];
                    case 8: return [2 /*return*/, result];
                }
            });
        });
    }),
    /**
     * Validate and import employees from uploaded data
     */
    importEmployees: importProcedure
        .input(importEmployeeSchema)
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, result, i, row, mappedData, existing, err_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        result = {
                            success: 0,
                            failed: 0,
                            errors: [],
                            warnings: []
                        };
                        i = 0;
                        _b.label = 2;
                    case 2:
                        if (!(i < input.data.length)) return [3 /*break*/, 9];
                        row = input.data[i];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 7, , 8]);
                        mappedData = {
                            firstName: row[input.fieldMap.firstName] || "",
                            lastName: row[input.fieldMap.lastName] || "",
                            email: row[input.fieldMap.email] || "",
                            phone: row[input.fieldMap.phone] || "",
                            department: row[input.fieldMap.department] || "",
                            position: row[input.fieldMap.position] || "",
                            salary: parseInt(row[input.fieldMap.salary] || "0"),
                            startDate: row[input.fieldMap.startDate] ? new Date(row[input.fieldMap.startDate]) : new Date(),
                            status: "active"
                        };
                        // Validate required fields
                        if (!mappedData.firstName || !mappedData.lastName) {
                            result.errors.push({ row: i + 1, error: "First name and last name are required" });
                            result.failed++;
                            return [3 /*break*/, 8];
                        }
                        if (!mappedData.email) return [3 /*break*/, 5];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.employees)
                                .where(drizzle_orm_1.eq(schema_1.employees.email, mappedData.email))
                                .limit(1)];
                    case 4:
                        existing = _b.sent();
                        if (existing.length > 0) {
                            result.warnings.push("Row " + (i + 1) + ": Employee with email \"" + mappedData.email + "\" already exists");
                            result.failed++;
                            return [3 /*break*/, 8];
                        }
                        _b.label = 5;
                    case 5: 
                    // Insert employee
                    return [4 /*yield*/, db.insert(schema_1.employees).values({
                            firstName: mappedData.firstName,
                            lastName: mappedData.lastName,
                            email: mappedData.email,
                            phone: mappedData.phone,
                            department: mappedData.department,
                            position: mappedData.position,
                            salary: mappedData.salary,
                            startDate: mappedData.startDate,
                            status: "active",
                            createdAt: new Date(),
                            updatedAt: new Date()
                        })];
                    case 6:
                        // Insert employee
                        _b.sent();
                        result.success++;
                        return [3 /*break*/, 8];
                    case 7:
                        err_2 = _b.sent();
                        result.errors.push({ row: i + 1, error: err_2.message || "Unknown error" });
                        result.failed++;
                        return [3 /*break*/, 8];
                    case 8:
                        i++;
                        return [3 /*break*/, 2];
                    case 9: return [2 /*return*/, result];
                }
            });
        });
    }),
    /**
     * Validate and import services from uploaded data
     */
    importServices: importProcedure
        .input(importServiceSchema)
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, result, i, row, mappedData, existing, err_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        result = {
                            success: 0,
                            failed: 0,
                            errors: [],
                            warnings: []
                        };
                        i = 0;
                        _b.label = 2;
                    case 2:
                        if (!(i < input.data.length)) return [3 /*break*/, 8];
                        row = input.data[i];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 6, , 7]);
                        mappedData = {
                            serviceName: row[input.fieldMap.serviceName] || "",
                            description: row[input.fieldMap.description] || "",
                            price: parseFloat(row[input.fieldMap.price] || "0") * 100,
                            category: row[input.fieldMap.category] || "General",
                            isActive: row[input.fieldMap.isActive] !== "No" && row[input.fieldMap.isActive] !== "false"
                        };
                        // Validate required fields
                        if (!mappedData.serviceName) {
                            result.errors.push({ row: i + 1, error: "Service name is required" });
                            result.failed++;
                            return [3 /*break*/, 7];
                        }
                        if (mappedData.price <= 0) {
                            result.errors.push({ row: i + 1, error: "Price must be greater than 0" });
                            result.failed++;
                            return [3 /*break*/, 7];
                        }
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.services)
                                .where(drizzle_orm_1.eq(schema_1.services.serviceName, mappedData.serviceName))
                                .limit(1)];
                    case 4:
                        existing = _b.sent();
                        if (existing.length > 0) {
                            result.warnings.push("Row " + (i + 1) + ": Service \"" + mappedData.serviceName + "\" already exists");
                            result.failed++;
                            return [3 /*break*/, 7];
                        }
                        // Insert service
                        return [4 /*yield*/, db.insert(schema_1.services).values({
                                serviceName: mappedData.serviceName,
                                description: mappedData.description,
                                price: mappedData.price,
                                category: mappedData.category,
                                isActive: mappedData.isActive,
                                createdAt: new Date(),
                                updatedAt: new Date()
                            })];
                    case 5:
                        // Insert service
                        _b.sent();
                        result.success++;
                        return [3 /*break*/, 7];
                    case 6:
                        err_3 = _b.sent();
                        result.errors.push({ row: i + 1, error: err_3.message || "Unknown error" });
                        result.failed++;
                        return [3 /*break*/, 7];
                    case 7:
                        i++;
                        return [3 /*break*/, 2];
                    case 8: return [2 /*return*/, result];
                }
            });
        });
    }),
    /**
     * Preview import data without saving - validates structure and shows unique references
     */
    previewImport: importProcedure
        .input(zod_1.z.object({
        data: zod_1.z.array(zod_1.z.record(zod_1.z.string(), zod_1.z.any())),
        type: zod_1.z["enum"](["clients", "employees", "services"])
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var preview;
            return __generator(this, function (_b) {
                preview = {
                    totalRows: input.data.length,
                    sampleRows: input.data.slice(0, 3),
                    columns: input.data.length > 0 ? Object.keys(input.data[0]) : [],
                    type: input.type
                };
                return [2 /*return*/, preview];
            });
        });
    })
});
