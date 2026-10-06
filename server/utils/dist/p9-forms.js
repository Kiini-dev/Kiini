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
exports.generateP9Form = exports.generateP9HTML = exports.calculateP9Data = void 0;
/**
 * P9 Form Generation Utility
 * Generates annual tax forms for Kenyan employees
 */
var db_1 = require("../db");
var uuid_1 = require("uuid");
/**
 * Calculate P9 form data from payroll records
 */
function calculateP9Data(input) {
    var _a, _b, _c;
    return __awaiter(this, void 0, Promise, function () {
        var pool, empRows, emp, taxRows, taxInfo, taxNumber, payslipRows, payslips, grossIncome, paye, nssf, shif, housingLevy, reliefs, totalDeductions, netTaxPayable, error_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    pool = db_1.getPool();
                    if (!pool)
                        return [2 /*return*/, null];
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, pool.query("SELECT id, firstName, lastName, email, taxId FROM employees WHERE id = ? AND organizationId = ? LIMIT 1", [input.employeeId, input.organizationId])];
                case 2:
                    empRows = (_d.sent())[0];
                    emp = (_a = empRows) === null || _a === void 0 ? void 0 : _a[0];
                    if (!emp)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, pool.query("SELECT taxNumber FROM employeeTaxInfo WHERE employeeId = ? ORDER BY effectiveDate DESC LIMIT 1", [input.employeeId])];
                case 3:
                    taxRows = (_d.sent())[0];
                    taxInfo = (_b = taxRows) === null || _b === void 0 ? void 0 : _b[0];
                    taxNumber = (taxInfo === null || taxInfo === void 0 ? void 0 : taxInfo.taxNumber) || emp.taxId || "N/A";
                    return [4 /*yield*/, pool.query("SELECT \n        COUNT(*) as numberOfPayslips,\n        SUM(basicSalary) as totalBasic,\n        SUM(allowances) as totalAllowances,\n        SUM(grossSalary) as totalGross,\n        SUM(paye) as totalPaye,\n        SUM(nssf) as totalNssf,\n        SUM(shif) as totalShif,\n        SUM(housingLevy) as totalHousingLevy,\n        SUM(netSalary) as totalNet\n       FROM payslips\n       WHERE employeeId = ? AND organizationId = ? AND YEAR(payPeriodEnd) = ?", [input.employeeId, input.organizationId, input.taxYear])];
                case 4:
                    payslipRows = (_d.sent())[0];
                    payslips = (_c = payslipRows) === null || _c === void 0 ? void 0 : _c[0];
                    if (!payslips) {
                        console.warn("[P9-GEN] No payslips found for employee " + emp.email + " in " + input.taxYear);
                        return [2 /*return*/, null];
                    }
                    grossIncome = payslips.totalGross || 0;
                    paye = payslips.totalPaye || 0;
                    nssf = payslips.totalNssf || 0;
                    shif = payslips.totalShif || 0;
                    housingLevy = payslips.totalHousingLevy || 0;
                    reliefs = 0;
                    totalDeductions = paye + nssf + shif + housingLevy;
                    netTaxPayable = paye - reliefs;
                    return [2 /*return*/, {
                            employeeId: input.employeeId,
                            organizationId: input.organizationId,
                            taxYear: input.taxYear,
                            taxNumber: taxNumber,
                            grossIncome: grossIncome,
                            paye: paye,
                            nssf: nssf,
                            shif: shif,
                            housingLevy: housingLevy,
                            reliefs: reliefs,
                            netTaxPayable: netTaxPayable,
                            numberOfPayslips: payslips.numberOfPayslips || 0
                        }];
                case 5:
                    error_1 = _d.sent();
                    console.error("[P9-GEN] Error calculating P9 data:", error_1);
                    return [2 /*return*/, null];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.calculateP9Data = calculateP9Data;
/**
 * Generate P9 HTML content
 */
function generateP9HTML(employeeName, email, p9Data) {
    var formatAmount = function (cents) {
        return (cents / 100).toLocaleString("en-KE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };
    var formatDate = function (date) {
        return date.toLocaleDateString("en-KE", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };
    return "\n    <!DOCTYPE html>\n    <html lang=\"en\">\n    <head>\n      <meta charset=\"UTF-8\">\n      <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n      <title>P9 Tax Form - " + p9Data.taxYear + "</title>\n      <style>\n        body {\n          font-family: \"Courier New\", monospace;\n          line-height: 1.6;\n          margin: 20px;\n          color: #333;\n        }\n        .container {\n          max-width: 900px;\n          margin: 0 auto;\n          border: 2px solid #000;\n          padding: 30px;\n        }\n        .header {\n          text-align: center;\n          margin-bottom: 30px;\n          border-bottom: 2px solid #000;\n          padding-bottom: 15px;\n        }\n        .header h1 {\n          margin: 0;\n          font-size: 18px;\n          font-weight: bold;\n        }\n        .header p {\n          margin: 5px 0;\n          font-size: 14px;\n        }\n        .section {\n          margin-bottom: 20px;\n        }\n        .section-title {\n          background-color: #f5f5f5;\n          padding: 8px;\n          font-weight: bold;\n          border-bottom: 1px solid #ccc;\n          margin-bottom: 10px;\n        }\n        .form-row {\n          display: flex;\n          margin-bottom: 8px;\n          border-bottom: 1px solid #ddd;\n          padding: 5px 0;\n        }\n        .form-label {\n          flex: 0 0 60%;\n          font-weight: 500;\n        }\n        .form-value {\n          flex: 1;\n          text-align: right;\n          padding-right: 20px;\n          border-left: 1px solid #ddd;\n          padding-left: 10px;\n        }\n        .footer {\n          margin-top: 40px;\n          text-align: center;\n          font-size: 12px;\n          color: #666;\n        }\n        .total-row {\n          background-color: #f9f9f9;\n          font-weight: bold;\n        }\n        .highlight {\n          background-color: #fff9e6;\n        }\n      </style>\n    </head>\n    <body>\n      <div class=\"container\">\n        <div class=\"header\">\n          <h1>ANNUAL TAX DECLARATION (P9)</h1>\n          <p>TAX YEAR: " + p9Data.taxYear + "</p>\n          <p>Kenya Revenue Authority</p>\n        </div>\n\n        <div class=\"section\">\n          <div class=\"section-title\">EMPLOYEE INFORMATION</div>\n          <div class=\"form-row\">\n            <div class=\"form-label\">Employee Name:</div>\n            <div class=\"form-value\">" + employeeName + "</div>\n          </div>\n          <div class=\"form-row\">\n            <div class=\"form-label\">Email:</div>\n            <div class=\"form-value\">" + email + "</div>\n          </div>\n          <div class=\"form-row\">\n            <div class=\"form-label\">PIN/Tax Number:</div>\n            <div class=\"form-value\">" + p9Data.taxNumber + "</div>\n          </div>\n          <div class=\"form-row\">\n            <div class=\"form-label\">Tax Year:</div>\n            <div class=\"form-value\">" + p9Data.taxYear + "</div>\n          </div>\n        </div>\n\n        <div class=\"section\">\n          <div class=\"section-title\">INCOME SUMMARY</div>\n          <div class=\"form-row\">\n            <div class=\"form-label\">Total Gross Income:</div>\n            <div class=\"form-value\">KES " + formatAmount(p9Data.grossIncome) + "</div>\n          </div>\n          <div class=\"form-row\">\n            <div class=\"form-label\">Number of Pay Periods:</div>\n            <div class=\"form-value\">" + p9Data.numberOfPayslips + "</div>\n          </div>\n        </div>\n\n        <div class=\"section\">\n          <div class=\"section-title\">DEDUCTIONS & CONTRIBUTIONS</div>\n          <div class=\"form-row\">\n            <div class=\"form-label\">NSSF Contributions:</div>\n            <div class=\"form-value\">KES " + formatAmount(p9Data.nssf) + "</div>\n          </div>\n          <div class=\"form-row\">\n            <div class=\"form-label\">SHIF (Health Insurance):</div>\n            <div class=\"form-value\">KES " + formatAmount(p9Data.shif) + "</div>\n          </div>\n          <div class=\"form-row\">\n            <div class=\"form-label\">Housing Levy:</div>\n            <div class=\"form-value\">KES " + formatAmount(p9Data.housingLevy) + "</div>\n          </div>\n          <div class=\"form-row total-row\">\n            <div class=\"form-label\">Total Non-Tax Deductions:</div>\n            <div class=\"form-value\">KES " + formatAmount(p9Data.nssf + p9Data.shif + p9Data.housingLevy) + "</div>\n          </div>\n        </div>\n\n        <div class=\"section\">\n          <div class=\"section-title\">TAX PAYABLE</div>\n          <div class=\"form-row\">\n            <div class=\"form-label\">PAYE Tax Deducted:</div>\n            <div class=\"form-value\">KES " + formatAmount(p9Data.paye) + "</div>\n          </div>\n          <div class=\"form-row\">\n            <div class=\"form-label\">Tax Reliefs:</div>\n            <div class=\"form-value\">KES " + formatAmount(p9Data.reliefs) + "</div>\n          </div>\n          <div class=\"form-row total-row highlight\">\n            <div class=\"form-label\">NET TAX PAYABLE:</div>\n            <div class=\"form-value\">KES " + formatAmount(p9Data.netTaxPayable) + "</div>\n          </div>\n        </div>\n\n        <div class=\"footer\">\n          <p>Generated on " + formatDate(new Date()) + "</p>\n          <p>This P9 form is generated electronically and serves as an official tax declaration.</p>\n          <p>For inquiries, contact your HR department.</p>\n        </div>\n      </div>\n    </body>\n    </html>\n  ";
}
exports.generateP9HTML = generateP9HTML;
/**
 * Generate and store P9 form for an employee
 */
function generateP9Form(input, generatedBy) {
    var _a;
    return __awaiter(this, void 0, Promise, function () {
        var pool, p9Data, empRows, emp, employeeName, htmlContent, p9Id, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    pool = db_1.getPool();
                    if (!pool)
                        return [2 /*return*/, null];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, calculateP9Data(input)];
                case 2:
                    p9Data = _b.sent();
                    if (!p9Data) {
                        console.warn("[P9-GEN] Could not generate P9 data for employee " + input.employeeId);
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, pool.query("SELECT firstName, lastName, email FROM employees WHERE id = ? LIMIT 1", [input.employeeId])];
                case 3:
                    empRows = (_b.sent())[0];
                    emp = (_a = empRows) === null || _a === void 0 ? void 0 : _a[0];
                    if (!emp)
                        return [2 /*return*/, null];
                    employeeName = emp.firstName + " " + emp.lastName;
                    htmlContent = generateP9HTML(employeeName, emp.email, p9Data);
                    p9Id = uuid_1.v4();
                    return [4 /*yield*/, pool.query("INSERT INTO p9_forms (\n        id, organizationId, employeeId, taxYear, taxNumber, grossIncome,\n        totalDeductions, paye, nssf, shif, housingLevy, reliefs, netTaxPayable,\n        numberOfPayslips, htmlContent, generatedBy, generatedAt, status, createdAt, updatedAt\n      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, NOW(), NOW())", [
                            p9Id,
                            input.organizationId,
                            input.employeeId,
                            input.taxYear,
                            p9Data.taxNumber,
                            p9Data.grossIncome,
                            p9Data.paye + p9Data.nssf + p9Data.shif + p9Data.housingLevy,
                            p9Data.paye,
                            p9Data.nssf,
                            p9Data.shif,
                            p9Data.housingLevy,
                            p9Data.reliefs,
                            p9Data.netTaxPayable,
                            p9Data.numberOfPayslips,
                            htmlContent,
                            generatedBy,
                            "generated",
                        ])];
                case 4:
                    _b.sent();
                    console.log("[P9-GEN] Generated P9 form " + p9Id + " for " + emp.email + " (" + input.taxYear + ")");
                    return [2 /*return*/, { id: p9Id, status: "generated" }];
                case 5:
                    error_2 = _b.sent();
                    console.error("[P9-GEN] Error generating P9 form:", error_2);
                    return [2 /*return*/, null];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.generateP9Form = generateP9Form;
