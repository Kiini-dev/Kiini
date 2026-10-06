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
exports.payrollExportRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
// @ts-ignore
var ExcelJS = require("exceljs");
var readProcedure = trpc_1.createFeatureRestrictedProcedure("hr:payroll:view");
/**
 * Calculate Kenyan payroll taxes and deductions
 */
function calculateKenyanPayrollTaxes(basicSalary) {
    // Convert to KES if needed (assumed to be in cents, convert to whole shillings)
    var salary = Math.round(basicSalary / 100);
    // Personal Relief: 2,400 per month
    var personalRelief = 2400;
    // PAYE Calculation (Progressive Tax Brackets)
    var paye = 0;
    if (salary <= 24000) {
        paye = Math.round((salary * 0.1) - personalRelief);
    }
    else if (salary <= 32333) {
        paye = Math.round(2400 + (salary - 24000) * 0.15 - personalRelief);
    }
    else if (salary <= 500000) {
        paye = Math.round(2400 + 1250 + (salary - 32333) * 0.2 - personalRelief);
    }
    else if (salary <= 800000) {
        paye = Math.round(2400 + 1250 + 93333 + (salary - 500000) * 0.25 - personalRelief);
    }
    else {
        paye = Math.round(2400 + 1250 + 93333 + 75000 + (salary - 800000) * 0.3 - personalRelief);
    }
    paye = Math.max(0, paye);
    // NSSF Tier 1: 6% of salary, capped at 18,000
    var nssfTier1 = Math.min(Math.round(salary * 0.06), 18000);
    // NSSF Tier 2: 6% of salary above 300,000
    var nssfTier2 = salary > 300000 ? Math.round((salary - 300000) * 0.06) : 0;
    // SHIF (formerly NHIF): 2.5% capped at 15,000
    var shif = Math.min(Math.round(salary * 0.025), 15000);
    // Housing Levy: 1.5% capped at 15,000
    var housingLevy = Math.min(Math.round(salary * 0.015), 15000);
    // Total Deductions
    var totalDeductions = paye + nssfTier1 + nssfTier2 + shif + housingLevy;
    // Net Pay
    var netPay = salary - totalDeductions;
    return {
        salary: salary,
        paye: paye,
        nssfTier1: nssfTier1,
        nssfTier2: nssfTier2,
        nssf: nssfTier1 + nssfTier2,
        shif: shif,
        housingLevy: housingLevy,
        totalDeductions: totalDeductions,
        netPay: netPay
    };
}
exports.payrollExportRouter = trpc_1.router({
    /**
     * Export payroll data to Excel format
     */
    exportPayroll: readProcedure
        .input(zod_1.z.object({
        startDate: zod_1.z.string(),
        endDate: zod_1.z.string(),
        employeeId: zod_1.z.string().optional(),
        departmentId: zod_1.z.string().optional(),
        format: zod_1.z["enum"](['xlsx', 'csv'])["default"]('xlsx')
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, query, conditions, records, payrollData, workbook, worksheet_1, headerRow, summaryRow, totalSalary, totalPAYE, totalNSSF, totalSHIF, totalHousing, totalDeductions, totalNetPay, buffer, base64, csv, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 7, , 8]);
                        query = database
                            .select({
                            payrollId: schema_1.payroll.id,
                            employeeId: schema_1.payroll.employeeId,
                            employeeName: schema_1.employees.firstName,
                            employeeLast: schema_1.employees.lastName,
                            department: schema_1.departments.departmentName,
                            paymentDate: schema_1.payroll.paymentDate,
                            basicSalary: schema_1.payroll.basicSalary,
                            allowances: schema_1.payroll.allowances,
                            deductions: schema_1.payroll.deductions,
                            netPay: schema_1.payroll.netPay,
                            paymentMethod: schema_1.payroll.paymentMethod,
                            status: schema_1.payroll.status
                        })
                            .from(schema_1.payroll)
                            .leftJoin(schema_1.employees, drizzle_orm_1.eq(schema_1.payroll.employeeId, schema_1.employees.id))
                            .leftJoin(schema_1.departments, drizzle_orm_1.eq(schema_1.employees.departmentId, schema_1.departments.id));
                        conditions = [
                            drizzle_orm_1.gte(schema_1.payroll.paymentDate, input.startDate),
                            drizzle_orm_1.lte(schema_1.payroll.paymentDate, input.endDate),
                        ];
                        if (input.employeeId) {
                            conditions.push(drizzle_orm_1.eq(schema_1.payroll.employeeId, input.employeeId));
                        }
                        if (conditions.length > 0) {
                            query = query.where(drizzle_orm_1.and.apply(void 0, conditions));
                        }
                        return [4 /*yield*/, query];
                    case 3:
                        records = _b.sent();
                        if (!records || records.length === 0) {
                            return [2 /*return*/, {
                                    success: false,
                                    message: "No payroll records found for the specified criteria"
                                }];
                        }
                        payrollData = records.map(function (record) {
                            var taxes = calculateKenyanPayrollTaxes(record.basicSalary);
                            return __assign(__assign(__assign({}, record), taxes), { employeeName: (record.employeeName || '') + " " + (record.employeeLast || '') });
                        });
                        if (!(input.format === 'xlsx')) return [3 /*break*/, 5];
                        workbook = new ExcelJS.Workbook();
                        worksheet_1 = workbook.addWorksheet('Payroll');
                        // Set column widths
                        worksheet_1.columns = [
                            { header: 'Employee', key: 'employeeName', width: 20 },
                            { header: 'Department', key: 'department', width: 15 },
                            { header: 'Payment Date', key: 'paymentDate', width: 12 },
                            { header: 'Basic Salary', key: 'salary', width: 14 },
                            { header: 'Allowances', key: 'allowances', width: 12 },
                            { header: 'PAYE', key: 'paye', width: 10 },
                            { header: 'NSSF', key: 'nssf', width: 10 },
                            { header: 'SHIF', key: 'shif', width: 10 },
                            { header: 'Housing Levy', key: 'housingLevy', width: 12 },
                            { header: 'Total Deductions', key: 'totalDeductions', width: 14 },
                            { header: 'Net Pay', key: 'netPay', width: 12 },
                            { header: 'Status', key: 'status', width: 10 },
                        ];
                        headerRow = worksheet_1.getRow(1);
                        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
                        headerRow.alignment = { horizontal: 'center', vertical: 'center' };
                        // Add data rows
                        payrollData.forEach(function (row) {
                            var sheetRow = worksheet_1.addRow({
                                employeeName: row.employeeName,
                                department: row.department || 'N/A',
                                paymentDate: row.paymentDate,
                                salary: row.salary,
                                allowances: row.allowances || 0,
                                paye: row.paye,
                                nssf: row.nssf,
                                shif: row.shif,
                                housingLevy: row.housingLevy,
                                totalDeductions: row.totalDeductions,
                                netPay: row.netPay,
                                status: row.status
                            });
                            // Format currency columns
                            var currencyColumns = ['salary', 'allowances', 'paye', 'nssf', 'shif', 'housingLevy', 'totalDeductions', 'netPay'];
                            currencyColumns.forEach(function (col) {
                                var cellRef = sheetRow.getCellByHeader(col);
                                if (cellRef) {
                                    cellRef.numFmt = '_("Ksh "*) #,##0.00_);_("Ksh "*(#,##0.00);_("Ksh "* "-"??_);_(@_)';
                                }
                            });
                        });
                        summaryRow = worksheet_1.addRow({});
                        summaryRow.font = { bold: true };
                        summaryRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
                        totalSalary = payrollData.reduce(function (sum, row) { return sum + row.salary; }, 0);
                        totalPAYE = payrollData.reduce(function (sum, row) { return sum + row.paye; }, 0);
                        totalNSSF = payrollData.reduce(function (sum, row) { return sum + row.nssf; }, 0);
                        totalSHIF = payrollData.reduce(function (sum, row) { return sum + row.shif; }, 0);
                        totalHousing = payrollData.reduce(function (sum, row) { return sum + row.housingLevy; }, 0);
                        totalDeductions = payrollData.reduce(function (sum, row) { return sum + row.totalDeductions; }, 0);
                        totalNetPay = payrollData.reduce(function (sum, row) { return sum + row.netPay; }, 0);
                        worksheet_1.addRow({});
                        worksheet_1.addRow({
                            employeeName: 'TOTALS',
                            salary: totalSalary,
                            paye: totalPAYE,
                            nssf: totalNSSF,
                            shif: totalSHIF,
                            housingLevy: totalHousing,
                            totalDeductions: totalDeductions,
                            netPay: totalNetPay
                        });
                        return [4 /*yield*/, workbook.xlsx.writeBuffer()];
                    case 4:
                        buffer = _b.sent();
                        base64 = Buffer.from(buffer).toString('base64');
                        return [2 /*return*/, {
                                success: true,
                                format: 'xlsx',
                                data: base64,
                                filename: "Payroll_" + input.startDate + "_" + input.endDate + ".xlsx",
                                recordCount: payrollData.length,
                                summary: {
                                    totalEmployees: payrollData.length,
                                    totalSalary: totalSalary,
                                    totalPAYE: totalPAYE,
                                    totalNSSF: totalNSSF,
                                    totalSHIF: totalSHIF,
                                    totalHousing: totalHousing,
                                    totalDeductions: totalDeductions,
                                    totalNetPay: totalNetPay
                                }
                            }];
                    case 5:
                        csv = __spreadArrays([
                            ['PAYROLL EXPORT', input.startDate + " to " + input.endDate],
                            [],
                            ['Employee', 'Department', 'Payment Date', 'Basic Salary', 'Allowances', 'PAYE', 'NSSF', 'SHIF', 'Housing Levy', 'Total Deductions', 'Net Pay', 'Status']
                        ], payrollData.map(function (row) { return [
                            row.employeeName,
                            row.department || 'N/A',
                            row.paymentDate,
                            row.salary,
                            row.allowances || 0,
                            row.paye,
                            row.nssf,
                            row.shif,
                            row.housingLevy,
                            row.totalDeductions,
                            row.netPay,
                            row.status,
                        ]; })).map(function (row) { return row.join(','); }).join('\n');
                        return [2 /*return*/, {
                                success: true,
                                format: 'csv',
                                data: Buffer.from(csv).toString('base64'),
                                filename: "Payroll_" + input.startDate + "_" + input.endDate + ".csv",
                                recordCount: payrollData.length
                            }];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_1 = _b.sent();
                        console.error("Error exporting payroll:", error_1);
                        return [2 /*return*/, {
                                success: false,
                                message: error_1.message || "Failed to export payroll data"
                            }];
                    case 8: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get payroll summary statistics for export
     */
    getExportSummary: readProcedure
        .input(zod_1.z.object({
        startDate: zod_1.z.string(),
        endDate: zod_1.z.string()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, records, record, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, null];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, database
                                .select({
                                employeeCount: database.fn.count(database.fn.distinct(schema_1.payroll.employeeId)),
                                totalSalary: database.fn.sum(schema_1.payroll.basicSalary),
                                totalNetPay: database.fn.sum(schema_1.payroll.netPay),
                                recordCount: database.fn.count(schema_1.payroll.id)
                            })
                                .from(schema_1.payroll)
                                .where(drizzle_orm_1.and(drizzle_orm_1.gte(schema_1.payroll.paymentDate, input.startDate), drizzle_orm_1.lte(schema_1.payroll.paymentDate, input.endDate)))];
                    case 3:
                        records = _b.sent();
                        if (!records || records.length === 0) {
                            return [2 /*return*/, null];
                        }
                        record = records[0];
                        return [2 /*return*/, {
                                employeeCount: record.employeeCount || 0,
                                totalSalary: Math.round(record.totalSalary || 0),
                                totalNetPay: Math.round(record.totalNetPay || 0),
                                recordCount: record.recordCount || 0,
                                avgSalary: record.employeeCount ? Math.round((record.totalSalary || 0) / record.employeeCount) : 0
                            }];
                    case 4:
                        error_2 = _b.sent();
                        console.error("Error getting export summary:", error_2);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    })
});
