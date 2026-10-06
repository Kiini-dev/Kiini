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
exports.importValidationRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var uuid_1 = require("uuid");
var XLSX = require("xlsx");
var db = require("../db");
var server_1 = require("@trpc/server");
// Define typed procedures
var importProcedure = trpc_1.createFeatureRestrictedProcedure("data:import");
// Enhanced validation schemas
var employeeImportSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1, "First name required"),
    lastName: zod_1.z.string().min(1, "Last name required"),
    email: zod_1.z.string().email("Invalid email format"),
    phone: zod_1.z.string().optional(),
    departmentId: zod_1.z.string().optional(),
    position: zod_1.z.string().optional(),
    hireDate: zod_1.z.string().optional(),
    salary: zod_1.z.number().optional()
});
var clientImportSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Client name required"),
    email: zod_1.z.string().email("Invalid email").optional(),
    phone: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    currency: zod_1.z.string().optional()
});
var productImportSchema = zod_1.z.object({
    productName: zod_1.z.string().min(1, "Product name required"),
    description: zod_1.z.string().optional(),
    unitPrice: zod_1.z.number().positive("Unit price must be positive"),
    quantity: zod_1.z.number().nonnegative("Quantity must be non-negative").optional(),
    sku: zod_1.z.string().optional()
});
exports.importValidationRouter = trpc_1.router({
    /**
     * Validate Excel file structure and data before import
     */
    validateFile: importProcedure
        .input(zod_1.z.object({
        fileContent: zod_1.z.string(),
        importType: zod_1.z["enum"](["employees", "clients", "products"])
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var binaryString, workbook, worksheet, data_1, errors_1, warnings_1, schema_1;
            return __generator(this, function (_b) {
                try {
                    binaryString = Buffer.from(input.fileContent, "base64").toString("binary");
                    workbook = XLSX.read(binaryString, { type: "binary" });
                    worksheet = workbook.Sheets[workbook.SheetNames[0]];
                    if (!worksheet) {
                        throw new Error("No data found in worksheet");
                    }
                    data_1 = XLSX.utils.sheet_to_json(worksheet);
                    if (!data_1 || data_1.length === 0) {
                        throw new Error("File is empty");
                    }
                    errors_1 = [];
                    warnings_1 = [];
                    schema_1 = employeeImportSchema;
                    if (input.importType === "clients") {
                        schema_1 = clientImportSchema;
                    }
                    else if (input.importType === "products") {
                        schema_1 = productImportSchema;
                    }
                    // Validate each row
                    data_1.forEach(function (row, index) {
                        var result = schema_1.safeParse(row);
                        if (!result.success) {
                            result.error.errors.forEach(function (err) {
                                errors_1.push({
                                    rowIndex: index + 1,
                                    field: err.path.join("."),
                                    value: row[err.path[0]] || "N/A",
                                    error: err.message
                                });
                            });
                        }
                        // Additional checks
                        if (input.importType === "employees" && row.email) {
                            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
                                errors_1.push({
                                    rowIndex: index + 1,
                                    field: "email",
                                    value: row.email,
                                    error: "Invalid email format"
                                });
                            }
                        }
                        // Check for duplicates in file
                        var duplicateRow = data_1.findIndex(function (r, i) {
                            return i < index && r.email === row.email && input.importType === "employees";
                        });
                        if (duplicateRow >= 0) {
                            warnings_1.push("Row " + (index + 1) + ": Duplicate email '" + row.email + "' also appears in row " + (duplicateRow + 1));
                        }
                    });
                    return [2 /*return*/, {
                            isValid: errors_1.length === 0,
                            totalRows: data_1.length,
                            errors: errors_1,
                            warnings: warnings_1,
                            data: errors_1.length > 0 ? null : data_1
                        }];
                }
                catch (error) {
                    throw new server_1.TRPCError({
                        code: "BAD_REQUEST",
                        message: "File validation failed: " + error.message
                    });
                }
                return [2 /*return*/];
            });
        });
    }),
    /**
     * Import validated data in batches
     */
    importData: importProcedure
        .input(zod_1.z.object({
        importType: zod_1.z["enum"](["employees", "clients", "products"]),
        data: zod_1.z.array(zod_1.z.record(zod_1.z.any())),
        batchSize: zod_1.z.number()["default"](100),
        skipOnError: zod_1.z.boolean()["default"](false)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, result, importId, now, i, batch, j, row, rowIndex, id, hireDate, id, id, err_1, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        result = {
                            success: 0,
                            failed: 0,
                            errors: [],
                            warnings: []
                        };
                        importId = uuid_1.v4();
                        now = new Date().toISOString().replace("T", " ").substring(0, 19);
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 17, , 18]);
                        i = 0;
                        _b.label = 3;
                    case 3:
                        if (!(i < input.data.length)) return [3 /*break*/, 15];
                        batch = input.data.slice(i, i + input.batchSize);
                        j = 0;
                        _b.label = 4;
                    case 4:
                        if (!(j < batch.length)) return [3 /*break*/, 14];
                        row = batch[j];
                        rowIndex = i + j + 1;
                        _b.label = 5;
                    case 5:
                        _b.trys.push([5, 12, , 13]);
                        if (!(input.importType === "employees")) return [3 /*break*/, 7];
                        id = uuid_1.v4();
                        hireDate = row.hireDate
                            ? new Date(row.hireDate).toISOString().replace("T", " ").substring(0, 19)
                            : now;
                        return [4 /*yield*/, database.raw("\n                  INSERT INTO employees \n                  (id, firstName, lastName, email, phone, departmentId, position, hireDate, createdAt, updatedAt)\n                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\n                  ", [
                                id,
                                row.firstName,
                                row.lastName,
                                row.email,
                                row.phone || null,
                                row.departmentId || null,
                                row.position || null,
                                hireDate,
                                now,
                                now,
                            ])];
                    case 6:
                        _b.sent();
                        result.success++;
                        return [3 /*break*/, 11];
                    case 7:
                        if (!(input.importType === "clients")) return [3 /*break*/, 9];
                        id = uuid_1.v4();
                        return [4 /*yield*/, database.raw("\n                  INSERT INTO clients \n                  (id, clientName, email, phone, address, createdAt, updatedAt)\n                  VALUES (?, ?, ?, ?, ?, ?, ?)\n                  ", [
                                id,
                                row.name,
                                row.email || null,
                                row.phone || null,
                                row.address || null,
                                now,
                                now,
                            ])];
                    case 8:
                        _b.sent();
                        result.success++;
                        return [3 /*break*/, 11];
                    case 9:
                        if (!(input.importType === "products")) return [3 /*break*/, 11];
                        id = uuid_1.v4();
                        return [4 /*yield*/, database.raw("\n                  INSERT INTO products \n                  (id, productName, description, unitPrice, quantity, sku, createdAt, updatedAt)\n                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)\n                  ", [
                                id,
                                row.productName,
                                row.description || null,
                                Math.round((row.unitPrice || 0) * 100),
                                row.quantity || 0,
                                row.sku || null,
                                now,
                                now,
                            ])];
                    case 10:
                        _b.sent();
                        result.success++;
                        _b.label = 11;
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        err_1 = _b.sent();
                        result.failed++;
                        if (!input.skipOnError) {
                            result.errors.push({
                                rowIndex: rowIndex,
                                field: "general",
                                value: JSON.stringify(row),
                                error: err_1.message || "Unknown error during import"
                            });
                        }
                        return [3 /*break*/, 13];
                    case 13:
                        j++;
                        return [3 /*break*/, 4];
                    case 14:
                        i += input.batchSize;
                        return [3 /*break*/, 3];
                    case 15: 
                    // Log import activity
                    return [4 /*yield*/, db.logActivity({
                            userId: ctx.user.id,
                            action: "import_" + input.importType,
                            entityType: "import",
                            entityId: importId,
                            description: "Imported " + result.success + " " + input.importType + ". Failed: " + result.failed
                        })];
                    case 16:
                        // Log import activity
                        _b.sent();
                        return [2 /*return*/, result];
                    case 17:
                        error_1 = _b.sent();
                        console.error("Error importing data:", error_1);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Import failed: " + error_1.message
                        });
                    case 18: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Check for duplicate entries in database before import
     */
    checkDuplicates: importProcedure
        .input(zod_1.z.object({
        importType: zod_1.z["enum"](["employees", "clients", "products"]),
        data: zod_1.z.array(zod_1.z.record(zod_1.z.any()))
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, duplicates, _i, _b, row, existing, _c, _d, row, existing, _e, _f, row, existing, error_2;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _g.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        _g.label = 2;
                    case 2:
                        _g.trys.push([2, 17, , 18]);
                        duplicates = [];
                        if (!(input.importType === "employees")) return [3 /*break*/, 7];
                        _i = 0, _b = input.data;
                        _g.label = 3;
                    case 3:
                        if (!(_i < _b.length)) return [3 /*break*/, 6];
                        row = _b[_i];
                        return [4 /*yield*/, database.raw("SELECT id, email FROM employees WHERE email = ? LIMIT 1", [row.email])];
                    case 4:
                        existing = _g.sent();
                        if (existing && existing.length > 0) {
                            duplicates.push({
                                rowData: row,
                                existingId: existing[0].id,
                                matchField: "email",
                                message: "Employee with email '" + row.email + "' already exists"
                            });
                        }
                        _g.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 16];
                    case 7:
                        if (!(input.importType === "clients")) return [3 /*break*/, 12];
                        _c = 0, _d = input.data;
                        _g.label = 8;
                    case 8:
                        if (!(_c < _d.length)) return [3 /*break*/, 11];
                        row = _d[_c];
                        return [4 /*yield*/, database.raw("SELECT id, clientName FROM clients WHERE clientName = ? LIMIT 1", [row.name])];
                    case 9:
                        existing = _g.sent();
                        if (existing && existing.length > 0) {
                            duplicates.push({
                                rowData: row,
                                existingId: existing[0].id,
                                matchField: "name",
                                message: "Client '" + row.name + "' already exists"
                            });
                        }
                        _g.label = 10;
                    case 10:
                        _c++;
                        return [3 /*break*/, 8];
                    case 11: return [3 /*break*/, 16];
                    case 12:
                        if (!(input.importType === "products")) return [3 /*break*/, 16];
                        _e = 0, _f = input.data;
                        _g.label = 13;
                    case 13:
                        if (!(_e < _f.length)) return [3 /*break*/, 16];
                        row = _f[_e];
                        return [4 /*yield*/, database.raw("SELECT id, productName FROM products WHERE productName = ? LIMIT 1", [row.productName])];
                    case 14:
                        existing = _g.sent();
                        if (existing && existing.length > 0) {
                            duplicates.push({
                                rowData: row,
                                existingId: existing[0].id,
                                matchField: "productName",
                                message: "Product '" + row.productName + "' already exists"
                            });
                        }
                        _g.label = 15;
                    case 15:
                        _e++;
                        return [3 /*break*/, 13];
                    case 16: return [2 /*return*/, duplicates];
                    case 17:
                        error_2 = _g.sent();
                        console.error("Error checking duplicates:", error_2);
                        return [2 /*return*/, []];
                    case 18: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get import history and status
     */
    getImportHistory: importProcedure
        .input(zod_1.z.object({
        importType: zod_1.z["enum"](["employees", "clients", "products"]).optional(),
        limit: zod_1.z.number()["default"](50),
        offset: zod_1.z.number()["default"](0)
    }))
        .query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, results, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, database.raw("\n          SELECT id, action, description, createdAt\n          FROM activity_logs\n          WHERE userId = ? AND action LIKE 'import_%'\n          ORDER BY createdAt DESC\n          LIMIT ? OFFSET ?\n          ", [ctx.user.id, 50, 0])];
                    case 2:
                        results = _b.sent();
                        return [2 /*return*/, results || []];
                    case 3:
                        error_3 = _b.sent();
                        console.error("Error fetching import history:", error_3);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    })
});
