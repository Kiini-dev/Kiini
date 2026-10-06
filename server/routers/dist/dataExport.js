"use strict";
/**
 * Data Export Router
 *
 * Handles CSV, PDF, and Excel exports for reports and data
 */
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
exports.dataExportRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
// Feature-based procedures
var exportProcedure = trpc_1.createFeatureRestrictedProcedure("data:export");
exports.dataExportRouter = trpc_1.router({
    /**
     * Export invoices to CSV
     */
    exportInvoicesCSV: trpc_1.createFeatureRestrictedProcedure("reports:export")
        .input(zod_1.z.object({
        ids: zod_1.z.array(zod_1.z.string()).optional(),
        filters: zod_1.z.object({
            status: zod_1.z.string().optional(),
            dateFrom: zod_1.z.string().optional(),
            dateTo: zod_1.z.string().optional()
        }).optional()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, query, data, headers, rows, csv, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        query = db.select().from(schema_1.invoices);
                        if (input.ids && input.ids.length > 0) {
                            query = query.where(drizzle_orm_1.inArray(schema_1.invoices.id, input.ids));
                        }
                        return [4 /*yield*/, query];
                    case 3:
                        data = _b.sent();
                        headers = [
                            "Invoice Number",
                            "Client ID",
                            "Total",
                            "Tax",
                            "Status",
                            "Invoice Date",
                            "Due Date",
                            "Created At",
                        ];
                        rows = data.map(function (inv) {
                            var _a, _b;
                            return [
                                inv.invoiceNumber,
                                inv.clientId,
                                inv.total,
                                (_b = (_a = inv.taxAmount) !== null && _a !== void 0 ? _a : inv.tax) !== null && _b !== void 0 ? _b : 0,
                                inv.status,
                                inv.issueDate,
                                inv.dueDate,
                                inv.createdAt,
                            ];
                        });
                        csv = __spreadArrays([
                            headers.join(",")
                        ], rows.map(function (row) { return row.map(function (cell) { return "\"" + cell + "\""; }).join(","); })).join("\n");
                        return [2 /*return*/, {
                                filename: "invoices_" + Date.now() + ".csv",
                                content: csv,
                                format: "csv"
                            }];
                    case 4:
                        error_1 = _b.sent();
                        console.error("Export invoices CSV error:", error_1);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Export receipts to CSV
     */
    exportReceiptsCSV: trpc_1.createFeatureRestrictedProcedure("reports:export")
        .input(zod_1.z.object({
        ids: zod_1.z.array(zod_1.z.string()).optional()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, query, data, headers, rows, csv, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        query = db.select().from(schema_1.receipts);
                        if (input.ids && input.ids.length > 0) {
                            query = query.where(drizzle_orm_1.inArray(schema_1.receipts.id, input.ids));
                        }
                        return [4 /*yield*/, query];
                    case 3:
                        data = _b.sent();
                        headers = [
                            "Receipt Number",
                            "Client ID",
                            "Total",
                            "Tax",
                            "Status",
                            "Receipt Date",
                            "Payment Method",
                            "Created At",
                        ];
                        rows = data.map(function (rec) { return [
                            rec.receiptNumber,
                            rec.clientId,
                            rec.total,
                            rec.tax,
                            rec.status,
                            rec.receiptDate,
                            rec.paymentMethod,
                            rec.createdAt,
                        ]; });
                        csv = __spreadArrays([
                            headers.join(",")
                        ], rows.map(function (row) { return row.map(function (cell) { return "\"" + cell + "\""; }).join(","); })).join("\n");
                        return [2 /*return*/, {
                                filename: "receipts_" + Date.now() + ".csv",
                                content: csv,
                                format: "csv"
                            }];
                    case 4:
                        error_2 = _b.sent();
                        console.error("Export receipts CSV error:", error_2);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Export expenses to CSV
     */
    exportExpensesCSV: trpc_1.createFeatureRestrictedProcedure("reports:export")
        .input(zod_1.z.object({
        ids: zod_1.z.array(zod_1.z.string()).optional()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, query, data, headers, rows, csv, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        query = db.select().from(schema_1.expenses);
                        if (input.ids && input.ids.length > 0) {
                            query = query.where(drizzle_orm_1.inArray(schema_1.expenses.id, input.ids));
                        }
                        return [4 /*yield*/, query];
                    case 3:
                        data = _b.sent();
                        headers = [
                            "Expense Date",
                            "Category",
                            "Amount",
                            "Description",
                            "Status",
                            "Employee ID",
                            "Created At",
                        ];
                        rows = data.map(function (exp) { return [
                            exp.expenseDate,
                            exp.category,
                            exp.amount,
                            exp.description,
                            exp.status,
                            exp.employeeId,
                            exp.createdAt,
                        ]; });
                        csv = __spreadArrays([
                            headers.join(",")
                        ], rows.map(function (row) { return row.map(function (cell) { return "\"" + cell + "\""; }).join(","); })).join("\n");
                        return [2 /*return*/, {
                                filename: "expenses_" + Date.now() + ".csv",
                                content: csv,
                                format: "csv"
                            }];
                    case 4:
                        error_3 = _b.sent();
                        console.error("Export expenses CSV error:", error_3);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Export projects to CSV
     */
    exportProjectsCSV: exportProcedure
        .input(zod_1.z.object({
        ids: zod_1.z.array(zod_1.z.string()).optional()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, query, data, headers, rows, csv, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        query = db.select().from(schema_1.projects);
                        if (input.ids && input.ids.length > 0) {
                            query = query.where(drizzle_orm_1.inArray(schema_1.projects.id, input.ids));
                        }
                        return [4 /*yield*/, query];
                    case 3:
                        data = _b.sent();
                        headers = [
                            "Project Name",
                            "Client ID",
                            "Start Date",
                            "End Date",
                            "Budget",
                            "Status",
                            "Priority",
                            "Created At",
                        ];
                        rows = data.map(function (proj) { return [
                            proj.name,
                            proj.clientId,
                            proj.startDate,
                            proj.endDate,
                            proj.budget,
                            proj.status,
                            proj.priority,
                            proj.createdAt,
                        ]; });
                        csv = __spreadArrays([
                            headers.join(",")
                        ], rows.map(function (row) { return row.map(function (cell) { return "\"" + cell + "\""; }).join(","); })).join("\n");
                        return [2 /*return*/, {
                                filename: "projects_" + Date.now() + ".csv",
                                content: csv,
                                format: "csv"
                            }];
                    case 4:
                        error_4 = _b.sent();
                        console.error("Export projects CSV error:", error_4);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Export clients to CSV
     */
    exportClientsCSV: exportProcedure
        .input(zod_1.z.object({
        ids: zod_1.z.array(zod_1.z.string()).optional()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, query, data, headers, rows, csv, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        query = db.select().from(schema_1.clients);
                        if (input.ids && input.ids.length > 0) {
                            query = query.where(drizzle_orm_1.inArray(schema_1.clients.id, input.ids));
                        }
                        return [4 /*yield*/, query];
                    case 3:
                        data = _b.sent();
                        headers = [
                            "Company Name",
                            "Contact Person",
                            "Email",
                            "Phone",
                            "Address",
                            "City",
                            "Country",
                            "Status",
                            "Industry",
                            "Created At",
                        ];
                        rows = data.map(function (client) { return [
                            client.companyName,
                            client.contactPerson,
                            client.email,
                            client.phone,
                            client.address,
                            client.city,
                            client.country,
                            client.status,
                            client.industry,
                            client.createdAt,
                        ]; });
                        csv = __spreadArrays([
                            headers.join(",")
                        ], rows.map(function (row) { return row.map(function (cell) { return "\"" + cell + "\""; }).join(","); })).join("\n");
                        return [2 /*return*/, {
                                filename: "clients_" + Date.now() + ".csv",
                                content: csv,
                                format: "csv"
                            }];
                    case 4:
                        error_5 = _b.sent();
                        console.error("Export clients CSV error:", error_5);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Export employees to CSV
     */
    exportEmployeesCSV: exportProcedure
        .input(zod_1.z.object({
        ids: zod_1.z.array(zod_1.z.string()).optional()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, query, data, headers, rows, csv, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        query = db.select().from(schema_1.employees);
                        if (input.ids && input.ids.length > 0) {
                            query = query.where(drizzle_orm_1.inArray(schema_1.employees.id, input.ids));
                        }
                        return [4 /*yield*/, query];
                    case 3:
                        data = _b.sent();
                        headers = [
                            "Employee ID",
                            "First Name",
                            "Last Name",
                            "Email",
                            "Phone",
                            "Department",
                            "Position",
                            "Salary",
                            "Status",
                            "Hire Date",
                            "Created At",
                        ];
                        rows = data.map(function (emp) { return [
                            emp.employeeNumber || emp.id,
                            emp.firstName,
                            emp.lastName,
                            emp.email,
                            emp.phone,
                            emp.department,
                            emp.position,
                            emp.salary,
                            emp.status,
                            emp.hireDate,
                            emp.createdAt,
                        ]; });
                        csv = __spreadArrays([
                            headers.join(",")
                        ], rows.map(function (row) { return row.map(function (cell) { return "\"" + cell + "\""; }).join(","); })).join("\n");
                        return [2 /*return*/, {
                                filename: "employees_" + Date.now() + ".csv",
                                content: csv,
                                format: "csv"
                            }];
                    case 4:
                        error_6 = _b.sent();
                        console.error("Export employees CSV error:", error_6);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Export document with line items
     */
    exportDocumentWithLineItems: exportProcedure
        .input(zod_1.z.object({
        documentType: zod_1.z["enum"](["invoice", "receipt", "estimate", "proposal"]),
        documentId: zod_1.z.string()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, document, _b, inv, rec, est, prop, items, csv, error_7;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _e.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, 13, , 14]);
                        document = null;
                        _b = input.documentType;
                        switch (_b) {
                            case "invoice": return [3 /*break*/, 3];
                            case "receipt": return [3 /*break*/, 5];
                            case "estimate": return [3 /*break*/, 7];
                            case "proposal": return [3 /*break*/, 9];
                        }
                        return [3 /*break*/, 11];
                    case 3: return [4 /*yield*/, db
                            .select()
                            .from(schema_1.invoices)
                            .where(drizzle_orm_1.eq(schema_1.invoices.id, input.documentId))
                            .limit(1)];
                    case 4:
                        inv = _e.sent();
                        document = inv[0];
                        return [3 /*break*/, 11];
                    case 5: return [4 /*yield*/, db
                            .select()
                            .from(schema_1.receipts)
                            .where(drizzle_orm_1.eq(schema_1.receipts.id, input.documentId))
                            .limit(1)];
                    case 6:
                        rec = _e.sent();
                        document = rec[0];
                        return [3 /*break*/, 11];
                    case 7: return [4 /*yield*/, db
                            .select()
                            .from(schema_1.estimates)
                            .where(drizzle_orm_1.eq(schema_1.estimates.id, input.documentId))
                            .limit(1)];
                    case 8:
                        est = _e.sent();
                        document = est[0];
                        return [3 /*break*/, 11];
                    case 9: return [4 /*yield*/, db
                            .select()
                            .from(schema_1.proposals)
                            .where(drizzle_orm_1.eq(schema_1.proposals.id, input.documentId))
                            .limit(1)];
                    case 10:
                        prop = _e.sent();
                        document = prop[0];
                        return [3 /*break*/, 11];
                    case 11:
                        if (!document)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.lineItems)
                                .where(drizzle_orm_1.eq(schema_1.lineItems.documentId, input.documentId))];
                    case 12:
                        items = _e.sent();
                        csv = __spreadArrays([
                            input.documentType.toUpperCase() + " EXPORT",
                            "Document ID: " + document.id,
                            "Date: " + new Date().toISOString(),
                            "",
                            "LINE ITEMS:",
                            "Item Description,Quantity,Unit Price,Tax %,Line Total"
                        ], items.map(function (item) {
                            var _a, _b, _c, _d, _e, _f;
                            return [
                                item.description,
                                item.quantity,
                                (_b = (_a = item.rate) !== null && _a !== void 0 ? _a : item.unitPrice) !== null && _b !== void 0 ? _b : '',
                                (_d = (_c = item.taxRate) !== null && _c !== void 0 ? _c : item.tax) !== null && _d !== void 0 ? _d : '',
                                (_f = (_e = item.amount) !== null && _e !== void 0 ? _e : item.lineTotal) !== null && _f !== void 0 ? _f : '',
                            ]
                                .map(function (cell) { return "\"" + cell + "\""; })
                                .join(",");
                        }), [
                            "",
                            "SUMMARY:",
                            "Total: " + document.total,
                            "Tax: " + ((_d = (_c = document.taxAmount) !== null && _c !== void 0 ? _c : document.tax) !== null && _d !== void 0 ? _d : 0),
                            "Status: " + document.status,
                        ]).join("\n");
                        return [2 /*return*/, {
                                filename: input.documentType + "_" + document.id + "_" + Date.now() + ".csv",
                                content: csv,
                                format: "csv"
                            }];
                    case 13:
                        error_7 = _e.sent();
                        console.error("Export document error:", error_7);
                        return [2 /*return*/, null];
                    case 14: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get export templates
     */
    getExportTemplates: exportProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, [
                    {
                        id: "invoice_standard",
                        name: "Invoice Standard",
                        description: "Standard invoice export with all fields",
                        format: "csv"
                    },
                    {
                        id: "invoice_detailed",
                        name: "Invoice Detailed",
                        description: "Invoice export with line items",
                        format: "csv"
                    },
                    {
                        id: "receipt_standard",
                        name: "Receipt Standard",
                        description: "Standard receipt export",
                        format: "csv"
                    },
                    {
                        id: "expense_report",
                        name: "Expense Report",
                        description: "Expense export by category",
                        format: "csv"
                    },
                    {
                        id: "project_summary",
                        name: "Project Summary",
                        description: "Project export with status",
                        format: "csv"
                    },
                    {
                        id: "client_list",
                        name: "Client List",
                        description: "Complete client information export",
                        format: "csv"
                    },
                    {
                        id: "employee_list",
                        name: "Employee List",
                        description: "Export basic employee information",
                        format: "csv"
                    },
                ]];
        });
    }); }),
    /**
     * Validate export data
     */
    validateExportData: exportProcedure
        .input(zod_1.z.object({
        documentType: zod_1.z.string(),
        ids: zod_1.z.array(zod_1.z.string())
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                return [2 /*return*/, {
                        valid: true,
                        recordCount: input.ids.length,
                        estimatedSize: (input.ids.length * 0.5).toFixed(2) + " KB",
                        canExport: true
                    }];
            });
        });
    })
});
