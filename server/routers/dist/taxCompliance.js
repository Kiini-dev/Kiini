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
exports.taxComplianceRouter = void 0;
var zod_1 = require("zod");
var trpc_1 = require("../_core/trpc");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var kenyan_payroll_calculator_1 = require("../utils/kenyan-payroll-calculator");
// Define typed procedures
var readProcedure = trpc_1.createFeatureRestrictedProcedure("tax:read");
// Input type shared by most report procedures
var dateRangeSchema = zod_1.z.object({
    from: zod_1.z.date(),
    to: zod_1.z.date(),
    employeeId: zod_1.z.string().optional(),
    departmentId: zod_1.z.string().optional()
});
exports.taxComplianceRouter = trpc_1.router({
    /**
     * Return PAYE withholdings aggregated by month (or per record if needed)
     */
    getPAYEReport: readProcedure
        .input(dateRangeSchema)
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, from, to, employeeId, departmentId, fromStr, toStr, rows, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        from = input.from, to = input.to, employeeId = input.employeeId, departmentId = input.departmentId;
                        fromStr = typeof from === 'string' ? from : from.toISOString().slice(0, 10);
                        toStr = typeof to === 'string' ? to : to.toISOString().replace('T', ' ').substring(0, 19).slice(0, 10);
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, database
                                .select({
                                month: drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["DATE_FORMAT(", ", '%Y-%m')"], ["DATE_FORMAT(", ", '%Y-%m')"])), schema_1.payroll.date),
                                totalPayee: drizzle_orm_1.sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["SUM(CAST(", " AS DECIMAL(10,2)))"], ["SUM(CAST(", " AS DECIMAL(10,2)))"])), schema_1.payroll.payeeTax)
                            })
                                .from(schema_1.payroll)
                                .where(drizzle_orm_1.between(schema_1.payroll.date, fromStr, toStr))
                                .groupBy(drizzle_orm_1.sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["DATE_FORMAT(", ", '%Y-%m')"], ["DATE_FORMAT(", ", '%Y-%m')"])), schema_1.payroll.date))
                                .orderBy(drizzle_orm_1.sql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["DATE_FORMAT(", ", '%Y-%m')"], ["DATE_FORMAT(", ", '%Y-%m')"])), schema_1.payroll.date))];
                    case 3:
                        rows = _b.sent();
                        return [2 /*return*/, rows];
                    case 4:
                        error_1 = _b.sent();
                        console.error("PAYE Report error:", error_1);
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * NSSF contributions report
     */
    getNSSFReport: readProcedure
        .input(dateRangeSchema)
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, from, to, fromStr, toStr, rows, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        from = input.from, to = input.to;
                        fromStr = typeof from === 'string' ? from : from.toISOString().slice(0, 10);
                        toStr = typeof to === 'string' ? to : to.toISOString().replace('T', ' ').substring(0, 19).slice(0, 10);
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, database
                                .select({
                                month: drizzle_orm_1.sql(templateObject_5 || (templateObject_5 = __makeTemplateObject(["DATE_FORMAT(", ", '%Y-%m')"], ["DATE_FORMAT(", ", '%Y-%m')"])), schema_1.payroll.date),
                                totalNSSF: drizzle_orm_1.sql(templateObject_6 || (templateObject_6 = __makeTemplateObject(["SUM(CAST(", " AS DECIMAL(10,2)))"], ["SUM(CAST(", " AS DECIMAL(10,2)))"])), schema_1.payroll.nssfContribution)
                            })
                                .from(schema_1.payroll)
                                .where(drizzle_orm_1.between(schema_1.payroll.date, fromStr, toStr))
                                .groupBy(drizzle_orm_1.sql(templateObject_7 || (templateObject_7 = __makeTemplateObject(["DATE_FORMAT(", ", '%Y-%m')"], ["DATE_FORMAT(", ", '%Y-%m')"])), schema_1.payroll.date))
                                .orderBy(drizzle_orm_1.sql(templateObject_8 || (templateObject_8 = __makeTemplateObject(["DATE_FORMAT(", ", '%Y-%m')"], ["DATE_FORMAT(", ", '%Y-%m')"])), schema_1.payroll.date))];
                    case 3:
                        rows = _b.sent();
                        return [2 /*return*/, rows];
                    case 4:
                        error_2 = _b.sent();
                        console.error("NSSF Report error:", error_2);
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * SHIF contributions report
     */
    getSHIFReport: readProcedure
        .input(dateRangeSchema)
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, from, to, employeeId, departmentId, fromStr, toStr, rows, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        from = input.from, to = input.to, employeeId = input.employeeId, departmentId = input.departmentId;
                        fromStr = typeof from === 'string' ? from : from.toISOString().slice(0, 10);
                        toStr = typeof to === 'string' ? to : to.toISOString().replace('T', ' ').substring(0, 19).slice(0, 10);
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, database
                                .select({
                                month: drizzle_orm_1.sql(templateObject_9 || (templateObject_9 = __makeTemplateObject(["DATE_FORMAT(", ", '%Y-%m')"], ["DATE_FORMAT(", ", '%Y-%m')"])), schema_1.payroll.date),
                                totalSHIF: drizzle_orm_1.sql(templateObject_10 || (templateObject_10 = __makeTemplateObject(["SUM(CAST(", " AS DECIMAL(10,2)))"], ["SUM(CAST(", " AS DECIMAL(10,2)))"])), schema_1.payroll.shifContribution)
                            })
                                .from(schema_1.payroll)
                                .where(drizzle_orm_1.between(schema_1.payroll.date, fromStr, toStr))
                                .groupBy(drizzle_orm_1.sql(templateObject_11 || (templateObject_11 = __makeTemplateObject(["DATE_FORMAT(", ", '%Y-%m')"], ["DATE_FORMAT(", ", '%Y-%m')"])), schema_1.payroll.date))
                                .orderBy(drizzle_orm_1.sql(templateObject_12 || (templateObject_12 = __makeTemplateObject(["DATE_FORMAT(", ", '%Y-%m')"], ["DATE_FORMAT(", ", '%Y-%m')"])), schema_1.payroll.date))];
                    case 3:
                        rows = _b.sent();
                        return [2 /*return*/, rows];
                    case 4:
                        error_3 = _b.sent();
                        console.error("SHIF Report error:", error_3);
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Housing levy report
     */
    getHousingLevyReport: readProcedure
        .input(dateRangeSchema)
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, from, to, employeeId, departmentId, fromStr, toStr, rows, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        from = input.from, to = input.to, employeeId = input.employeeId, departmentId = input.departmentId;
                        fromStr = typeof from === 'string' ? from : from.toISOString().slice(0, 10);
                        toStr = typeof to === 'string' ? to : to.toISOString().replace('T', ' ').substring(0, 19).slice(0, 10);
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, database
                                .select({
                                month: drizzle_orm_1.sql(templateObject_13 || (templateObject_13 = __makeTemplateObject(["DATE_FORMAT(", ", '%Y-%m')"], ["DATE_FORMAT(", ", '%Y-%m')"])), schema_1.payroll.date),
                                totalHousing: drizzle_orm_1.sql(templateObject_14 || (templateObject_14 = __makeTemplateObject(["SUM(CAST(", " AS DECIMAL(10,2)))"], ["SUM(CAST(", " AS DECIMAL(10,2)))"])), schema_1.payroll.housingLevyDeduction)
                            })
                                .from(schema_1.payroll)
                                .where(drizzle_orm_1.between(schema_1.payroll.date, fromStr, toStr))
                                .groupBy(drizzle_orm_1.sql(templateObject_15 || (templateObject_15 = __makeTemplateObject(["DATE_FORMAT(", ", '%Y-%m')"], ["DATE_FORMAT(", ", '%Y-%m')"])), schema_1.payroll.date))
                                .orderBy(drizzle_orm_1.sql(templateObject_16 || (templateObject_16 = __makeTemplateObject(["DATE_FORMAT(", ", '%Y-%m')"], ["DATE_FORMAT(", ", '%Y-%m')"])), schema_1.payroll.date))];
                    case 3:
                        rows = _b.sent();
                        return [2 /*return*/, rows];
                    case 4:
                        error_4 = _b.sent();
                        console.error("Housing Levy Report error:", error_4);
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Export KRA filing format (simple CSV) - returns base64 string
     */
    getKRAFilingFormat: readProcedure
        .input(dateRangeSchema)
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, from, to, fromStr, toStr, records, header, lines, _i, records_1, rec, emp, name, csv, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, ''];
                        from = input.from, to = input.to;
                        fromStr = typeof from === 'string' ? from : from.toISOString().slice(0, 10);
                        toStr = typeof to === 'string' ? to : to.toISOString().replace('T', ' ').substring(0, 19).slice(0, 10);
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 8, , 9]);
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.payroll)
                                .where(drizzle_orm_1.between(schema_1.payroll.date, fromStr, toStr))
                                .orderBy(schema_1.payroll.employeeId)];
                    case 3:
                        records = _b.sent();
                        header = [
                            "EmployeeID",
                            "Name",
                            "GrossSalary",
                            "NSSF",
                            "PAYE",
                            "SHIF",
                            "HousingLevy",
                        ];
                        lines = [header.join(",")];
                        _i = 0, records_1 = records;
                        _b.label = 4;
                    case 4:
                        if (!(_i < records_1.length)) return [3 /*break*/, 7];
                        rec = records_1[_i];
                        return [4 /*yield*/, database
                                .select({ firstName: schema_1.employees.firstName, lastName: schema_1.employees.lastName })
                                .from(schema_1.employees)
                                .where(drizzle_orm_1.sql(templateObject_17 || (templateObject_17 = __makeTemplateObject(["", " = ", ""], ["", " = ", ""])), schema_1.employees.id, rec.employeeId))
                                .limit(1)
                                .then(function (r) { return r[0] || { firstName: "", lastName: "" }; })];
                    case 5:
                        emp = _b.sent();
                        name = ((emp.firstName || '') + " " + (emp.lastName || '')).trim();
                        lines.push([
                            rec.employeeId,
                            name,
                            rec.grossSalary,
                            rec.nssfContribution,
                            rec.payeeTax,
                            rec.shifContribution,
                            rec.housingLevyDeduction,
                        ].join(","));
                        _b.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7:
                        csv = lines.join("\n");
                        return [2 /*return*/, Buffer.from(csv).toString("base64")];
                    case 8:
                        error_5 = _b.sent();
                        console.error("KRA Filing Format error:", error_5);
                        return [2 /*return*/, ''];
                    case 9: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Year-to-date tax summary (leverages existing calculation utility)
     */
    getYearToDateSummary: trpc_1.createFeatureRestrictedProcedure("reporting:read")
        .input(zod_1.z.object({ employeeId: zod_1.z.string().optional() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, employeeId, payrolls, calculations, totals, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, {}];
                        employeeId = input.employeeId;
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.payroll)
                                .where(employeeId ? drizzle_orm_1.sql(templateObject_18 || (templateObject_18 = __makeTemplateObject(["", " = ", ""], ["", " = ", ""])), schema_1.payroll.employeeId, employeeId) : undefined)];
                    case 3:
                        payrolls = _b.sent();
                        calculations = payrolls.map(function (p) { return ({
                            grossSalary: p.grossSalary,
                            nssfContribution: p.nssfContribution,
                            payeeTax: p.payeeTax,
                            shifContribution: p.shifContribution,
                            housingLevyDeduction: p.housingLevyDeduction,
                            netSalary: p.netSalary
                        }); });
                        totals = kenyan_payroll_calculator_1.calculateYTDTotals(calculations);
                        return [2 /*return*/, totals];
                    case 4:
                        error_6 = _b.sent();
                        console.error("Year to Date Summary error:", error_6);
                        return [2 /*return*/, {}];
                    case 5: return [2 /*return*/];
                }
            });
        });
    })
});
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11, templateObject_12, templateObject_13, templateObject_14, templateObject_15, templateObject_16, templateObject_17, templateObject_18;
