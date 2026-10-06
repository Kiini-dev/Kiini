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
exports.hrPayrollRouter = exports.generateP9TaxForm = exports.calculatePayrollBatch = void 0;
var trpc_1 = require("../_core/trpc");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var zod_1 = require("zod");
var mail_1 = require("../_core/mail");
var uuid_1 = require("uuid");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var calculatePayrollSchema = zod_1.z.object({
    organizationId: zod_1.z.string(),
    payMonth: zod_1.z.string().datetime(),
    payPeriodStart: zod_1.z.string().datetime(),
    payPeriodEnd: zod_1.z.string().datetime(),
    employeeIds: zod_1.z.array(zod_1.z.string()).optional(),
    autoProcess: zod_1.z.boolean()["default"](false)
});
var approvePayrollSchema = zod_1.z.object({
    batchId: zod_1.z.string(),
    approverComments: zod_1.z.string().optional()
});
var processPayrollSchema = zod_1.z.object({
    batchId: zod_1.z.string(),
    paymentDate: zod_1.z.string().datetime()
});
var generateP9Schema = zod_1.z.object({
    organizationId: zod_1.z.string(),
    employeeId: zod_1.z.string(),
    taxYear: zod_1.z.number().int()
});
// NSSF calculation (6% of basic salary, max KES 1,080/month as of 2024)
var calculateNSSF = function (basicSalary) {
    var maxNSSF = 1080;
    return Math.min(Math.round(basicSalary * 0.06), maxNSSF);
};
// NHIF calculation (tiered based on gross salary)
var calculateNHIF = function (grossSalary) {
    if (grossSalary < 5999)
        return 150;
    if (grossSalary < 7999)
        return 300;
    if (grossSalary < 11999)
        return 400;
    if (grossSalary < 15999)
        return 500;
    if (grossSalary < 19999)
        return 600;
    if (grossSalary < 24999)
        return 750;
    if (grossSalary < 29999)
        return 850;
    if (grossSalary < 34999)
        return 900;
    if (grossSalary < 39999)
        return 950;
    if (grossSalary < 44999)
        return 1000;
    if (grossSalary < 49999)
        return 1100;
    if (grossSalary < 59999)
        return 1200;
    if (grossSalary < 69999)
        return 1300;
    if (grossSalary < 79999)
        return 1400;
    if (grossSalary < 89999)
        return 1500;
    return 1600;
};
// PAYE calculation (progressive tax - Kenya)
var calculatePAYE = function (taxableIncome) {
    var tax = 0;
    if (taxableIncome > 0 && taxableIncome <= 24000) {
        tax = taxableIncome * 0.10;
    }
    else if (taxableIncome > 24000 && taxableIncome <= 40320) {
        tax = 2400 + (taxableIncome - 24000) * 0.25;
    }
    else if (taxableIncome > 40320) {
        tax = 2400 + 4080 + (taxableIncome - 40320) * 0.30;
    }
    return Math.round(tax);
};
var getPayrollRulesForCountry = function (countryCode) {
    if (countryCode === void 0) { countryCode = 'KE'; }
    var upperCode = countryCode.toUpperCase();
    switch (upperCode) {
        case 'NG':
            return {
                countryCode: 'NG',
                currencyLabel: 'NGN',
                payeReliefMonthly: 2000,
                nssf: { rate: 0.0 },
                nhif: function () { return 0; },
                paye: function (taxableIncome) { return Math.round(Math.max(0, taxableIncome * 0.075)); },
                statutoryTemplates: { payslip: 'NG-PAYSLIP', taxForm: 'ITF', auditTrail: 'NG-AUDIT' }
            };
        case 'ZA':
            return {
                countryCode: 'ZA',
                currencyLabel: 'ZAR',
                payeReliefMonthly: 0,
                nssf: { rate: 0.0 },
                nhif: function () { return 0; },
                paye: function (taxableIncome) { return Math.round(Math.max(0, taxableIncome * 0.18)); },
                statutoryTemplates: { payslip: 'ZA-PAYSLIP', taxForm: 'IRP5', auditTrail: 'ZA-AUDIT' }
            };
        case 'UG':
            return {
                countryCode: 'UG',
                currencyLabel: 'UGX',
                payeReliefMonthly: 10000,
                nssf: { rate: 0.0 },
                nhif: function () { return 0; },
                paye: function (taxableIncome) { return Math.round(Math.max(0, taxableIncome * 0.10)); },
                statutoryTemplates: { payslip: 'UG-PAYSLIP', taxForm: 'IT3', auditTrail: 'UG-AUDIT' }
            };
        case 'GH':
            return {
                countryCode: 'GH',
                currencyLabel: 'GHS',
                payeReliefMonthly: 100,
                nssf: { rate: 0.0 },
                nhif: function () { return 0; },
                paye: function (taxableIncome) { return Math.round(Math.max(0, taxableIncome * 0.10)); },
                statutoryTemplates: { payslip: 'GH-PAYSLIP', taxForm: 'GHS-ITF', auditTrail: 'GH-AUDIT' }
            };
        case 'TZ':
            return {
                countryCode: 'TZ',
                currencyLabel: 'TZS',
                payeReliefMonthly: 0,
                nssf: { rate: 0.0 },
                nhif: function () { return 0; },
                paye: function (taxableIncome) { return Math.round(Math.max(0, taxableIncome * 0.10)); },
                statutoryTemplates: { payslip: 'TZ-PAYSLIP', taxForm: 'TAX-FORM', auditTrail: 'TZ-AUDIT' }
            };
        case 'ET':
            return {
                countryCode: 'ET',
                currencyLabel: 'ETB',
                payeReliefMonthly: 0,
                nssf: { rate: 0.0 },
                nhif: function () { return 0; },
                paye: function (taxableIncome) { return Math.round(Math.max(0, taxableIncome * 0.15)); },
                statutoryTemplates: { payslip: 'ET-PAYSLIP', taxForm: 'ET-ITF', auditTrail: 'ET-AUDIT' }
            };
        default:
            return {
                countryCode: 'KE',
                currencyLabel: 'KES',
                payeReliefMonthly: 2400,
                nssf: { rate: 0.06, cap: 1080 },
                nhif: calculateNHIF,
                paye: calculatePAYE,
                statutoryTemplates: { payslip: 'KE-PAYSLIP', taxForm: 'P9', auditTrail: 'KE-AUDIT' }
            };
    }
};
var calculateCountryDeductions = function (rules, basicSalary, grossSalary) {
    var nssfDeduction = rules.nssf.cap ? Math.min(Math.round(basicSalary * rules.nssf.rate), rules.nssf.cap) : Math.round(basicSalary * rules.nssf.rate);
    var nhifDeduction = rules.nhif(grossSalary);
    var taxableIncome = Math.max(0, grossSalary - nssfDeduction);
    var payeDeduction = rules.paye(taxableIncome);
    var totalDeductions = nssfDeduction + nhifDeduction + payeDeduction;
    return { nssfDeduction: nssfDeduction, nhifDeduction: nhifDeduction, payeDeduction: payeDeduction, taxableIncome: taxableIncome, totalDeductions: totalDeductions };
};
var formatPayrollCurrency = function (amount, currencyLabel) { return currencyLabel + " " + amount.toLocaleString(); };
var getStatutoryTemplateContent = function (countryCode) {
    var templates = {
        KE: {
            payslip: '<h1>Kenya Payslip</h1><p>Use this template for monthly pay documentation.</p>',
            taxForm: '<h1>P9 Tax Statement</h1><p>Annual tax statement for Kenya employees.</p>',
            auditTrail: '<h1>Payroll Audit Trail</h1><p>Payroll batch audit history for Kenyan compliance.</p>'
        },
        NG: {
            payslip: '<h1>Nigeria Payslip</h1><p>Use this template for payroll disclosures.</p>',
            taxForm: '<h1>ITF Tax Form</h1><p>Nigerian annual tax form.</p>',
            auditTrail: '<h1>Payroll Audit Trail</h1><p>Nigeria payroll compliance log.</p>'
        },
        ZA: {
            payslip: '<h1>South Africa Payslip</h1><p>South Africa pay documentation template.</p>',
            taxForm: '<h1>IRP5 Tax Certificate</h1><p>South African IRP5 form.</p>',
            auditTrail: '<h1>Payroll Audit Trail</h1><p>South Africa payroll compliance audit history.</p>'
        },
        UG: {
            payslip: '<h1>Uganda Payslip</h1><p>Ugandan payroll statement.</p>',
            taxForm: '<h1>IT3 Tax Form</h1><p>Ugandan annual PAYE statement.</p>',
            auditTrail: '<h1>Payroll Audit Trail</h1><p>Uganda payroll compliance log.</p>'
        }
    };
    return templates[countryCode.toUpperCase()] || templates['KE'];
};
var resolveStatutoryTemplates = function (settings, payrollRules) {
    return __assign(__assign(__assign({}, payrollRules.statutoryTemplates), ((settings === null || settings === void 0 ? void 0 : settings.statutoryReportTemplates) || {})), { content: getStatutoryTemplateContent((settings === null || settings === void 0 ? void 0 : settings.countryCode) || payrollRules.countryCode) });
};
var getRequestIp = function (req) {
    var _a;
    return ((_a = req === null || req === void 0 ? void 0 : req.headers) === null || _a === void 0 ? void 0 : _a['x-forwarded-for']) || (req === null || req === void 0 ? void 0 : req.ip) || null;
};
function calculatePayrollBatch(input, userId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, batchNumber, batchId, empList, emps, totalGross, totalDeductions, totalNet, payrollDetailsData, orgSettings, defaultCountry, _i, empList_1, empId, employee, basicSalary, allowances, bonuses, grossSalary, employeeCountry, payrollRules, loanDeduction, otherDeductions, countryDeductions, totalDeduction, netSalary, _a, payrollDetailsData_1, detail;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        throw new Error('Database not available');
                    batchNumber = "PB-" + new Date().getFullYear() + "-" + String(new Date(input.payMonth).getMonth() + 1).padStart(2, '0') + "-" + uuid_1.v4().substring(0, 4).toUpperCase();
                    batchId = uuid_1.v4();
                    empList = input.employeeIds;
                    if (!(!empList || empList.length === 0)) return [3 /*break*/, 3];
                    return [4 /*yield*/, db.query.employees.findMany({
                            where: drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.employees.organizationId, input.organizationId), drizzle_orm_1.eq(schema_1.employees.status, 'active'))
                        })];
                case 2:
                    emps = _b.sent();
                    empList = emps.map(function (e) { return e.id; });
                    _b.label = 3;
                case 3:
                    totalGross = 0;
                    totalDeductions = 0;
                    totalNet = 0;
                    payrollDetailsData = [];
                    return [4 /*yield*/, db.query.hrSettings.findFirst({
                            where: drizzle_orm_1.eq(schema_1.hrSettings.organizationId, input.organizationId)
                        })];
                case 4:
                    orgSettings = _b.sent();
                    defaultCountry = (orgSettings === null || orgSettings === void 0 ? void 0 : orgSettings.countryCode) || 'KE';
                    _i = 0, empList_1 = empList;
                    _b.label = 5;
                case 5:
                    if (!(_i < empList_1.length)) return [3 /*break*/, 8];
                    empId = empList_1[_i];
                    return [4 /*yield*/, db.query.employees.findFirst({
                            where: drizzle_orm_1.eq(schema_1.employees.id, empId)
                        })];
                case 6:
                    employee = _b.sent();
                    if (!employee)
                        return [3 /*break*/, 7];
                    basicSalary = employee.salary || 0;
                    allowances = 0;
                    bonuses = 0;
                    grossSalary = basicSalary + allowances + bonuses;
                    employeeCountry = employee.country || defaultCountry;
                    payrollRules = getPayrollRulesForCountry(employeeCountry);
                    loanDeduction = 0;
                    otherDeductions = 0;
                    countryDeductions = calculateCountryDeductions(payrollRules, basicSalary, grossSalary);
                    totalDeduction = countryDeductions.totalDeductions + loanDeduction + otherDeductions;
                    netSalary = grossSalary - totalDeduction;
                    payrollDetailsData.push({
                        id: uuid_1.v4(),
                        organizationId: input.organizationId,
                        batchId: batchId,
                        employeeId: empId,
                        payMonth: input.payMonth,
                        basicSalary: basicSalary,
                        allowances: allowances,
                        bonuses: bonuses,
                        grossSalary: grossSalary,
                        nssfDeduction: countryDeductions.nssfDeduction,
                        nhifDeduction: countryDeductions.nhifDeduction,
                        payeDeduction: countryDeductions.payeDeduction,
                        loanDeduction: loanDeduction,
                        otherDeductions: otherDeductions,
                        totalDeductions: totalDeduction,
                        netSalary: netSalary,
                        countryCode: employeeCountry,
                        currencyLabel: payrollRules.currencyLabel,
                        status: 'draft',
                        createdAt: new Date().toISOString()
                    });
                    totalGross += grossSalary;
                    totalDeductions += totalDeduction;
                    totalNet += netSalary;
                    _b.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 5];
                case 8: return [4 /*yield*/, db.insert(schema_1.payrollBatches).values({
                        id: batchId,
                        organizationId: input.organizationId,
                        batchNumber: batchNumber,
                        payMonth: input.payMonth,
                        payPeriodStart: input.payPeriodStart,
                        payPeriodEnd: input.payPeriodEnd,
                        employeeCount: payrollDetailsData.length,
                        totalGross: totalGross,
                        totalDeductions: totalDeductions,
                        totalNet: totalNet,
                        status: 'calculated',
                        createdBy: userId,
                        createdAt: new Date().toISOString()
                    })];
                case 9:
                    _b.sent();
                    _a = 0, payrollDetailsData_1 = payrollDetailsData;
                    _b.label = 10;
                case 10:
                    if (!(_a < payrollDetailsData_1.length)) return [3 /*break*/, 13];
                    detail = payrollDetailsData_1[_a];
                    return [4 /*yield*/, db.insert(schema_1.payrollDetails).values(detail)];
                case 11:
                    _b.sent();
                    _b.label = 12;
                case 12:
                    _a++;
                    return [3 /*break*/, 10];
                case 13: return [4 /*yield*/, db.insert(schema_1.approvalWorkflows).values({
                        id: uuid_1.v4(),
                        organizationId: input.organizationId,
                        workflowType: 'payroll_batch',
                        entityId: batchId,
                        requestedBy: userId,
                        requestedAt: new Date().toISOString(),
                        status: 'pending',
                        createdAt: new Date().toISOString()
                    })];
                case 14:
                    _b.sent();
                    return [4 /*yield*/, db_1.logActivity({
                            userId: userId,
                            action: 'payroll_batch_calculated',
                            entityType: 'payrollBatch',
                            entityId: batchId,
                            description: "Payroll batch " + batchNumber + " calculated for " + payrollDetailsData.length + " employees",
                            metadata: JSON.stringify({ organizationId: input.organizationId, payMonth: input.payMonth, countryCode: defaultCountry }),
                            ipAddress: null
                        })];
                case 15:
                    _b.sent();
                    if (!(input.autoProcess && (orgSettings === null || orgSettings === void 0 ? void 0 : orgSettings.autoApprovePayroll))) return [3 /*break*/, 19];
                    return [4 /*yield*/, db.update(schema_1.payrollBatches)
                            .set({ status: 'approved', approvedBy: userId, approvalDate: new Date().toISOString() })
                            .where(drizzle_orm_1.eq(schema_1.payrollBatches.id, batchId))];
                case 16:
                    _b.sent();
                    return [4 /*yield*/, db.update(schema_1.payrollDetails)
                            .set({ status: 'approved' })
                            .where(drizzle_orm_1.eq(schema_1.payrollDetails.batchId, batchId))];
                case 17:
                    _b.sent();
                    return [4 /*yield*/, db.update(schema_1.approvalWorkflows)
                            .set({ status: 'approved', approvedBy: userId, approvedAt: new Date().toISOString() })
                            .where(drizzle_orm_1.eq(schema_1.approvalWorkflows.entityId, batchId))];
                case 18:
                    _b.sent();
                    _b.label = 19;
                case 19: return [2 /*return*/, { batchId: batchId, batchNumber: batchNumber, employeeCount: payrollDetailsData.length, totalGross: totalGross, totalDeductions: totalDeductions, totalNet: totalNet }];
            }
        });
    });
}
exports.calculatePayrollBatch = calculatePayrollBatch;
function generateP9TaxForm(input, userId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, yearStart, yearEnd, yearPayrolls, totals, employee, orgSettings, country, payrollRules, reliefs, taxableIncome, taxDue, p9Id;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error('Database not available');
                    yearStart = new Date(input.taxYear + "-01-01").toISOString();
                    yearEnd = new Date(input.taxYear + "-12-31").toISOString();
                    return [4 /*yield*/, db.query.payrollDetails.findMany({
                            where: drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.payrollDetails.employeeId, input.employeeId), drizzle_orm_1.gte(schema_1.payrollDetails.payMonth, yearStart), drizzle_orm_1.lte(schema_1.payrollDetails.payMonth, yearEnd))
                        })];
                case 2:
                    yearPayrolls = _a.sent();
                    totals = yearPayrolls.reduce(function (acc, p) { return ({
                        grossIncome: acc.grossIncome + p.grossSalary,
                        nssfAmount: acc.nssfAmount + p.nssfDeduction,
                        payeDeducted: acc.payeDeducted + p.payeDeduction,
                        nhifAmount: acc.nhifAmount + p.nhifDeduction
                    }); }, { grossIncome: 0, nssfAmount: 0, payeDeducted: 0, nhifAmount: 0 });
                    return [4 /*yield*/, db.query.employees.findFirst({
                            where: drizzle_orm_1.eq(schema_1.employees.id, input.employeeId)
                        })];
                case 3:
                    employee = _a.sent();
                    return [4 /*yield*/, db.query.hrSettings.findFirst({
                            where: drizzle_orm_1.eq(schema_1.hrSettings.organizationId, input.organizationId)
                        })];
                case 4:
                    orgSettings = _a.sent();
                    country = (employee === null || employee === void 0 ? void 0 : employee.country) || (orgSettings === null || orgSettings === void 0 ? void 0 : orgSettings.countryCode) || 'KE';
                    payrollRules = getPayrollRulesForCountry(country);
                    reliefs = payrollRules.payeReliefMonthly * 12;
                    taxableIncome = Math.max(0, totals.grossIncome - totals.nssfAmount);
                    taxDue = Math.max(0, totals.payeDeducted - reliefs);
                    p9Id = uuid_1.v4();
                    return [4 /*yield*/, db.insert(schema_1.taxCompliance).values({
                            id: p9Id,
                            organizationId: input.organizationId,
                            employeeId: input.employeeId,
                            taxYear: input.taxYear,
                            grossIncome: totals.grossIncome,
                            nssfAmount: totals.nssfAmount,
                            taxableIncome: taxableIncome,
                            payeDeducted: totals.payeDeducted,
                            nhifAmount: totals.nhifAmount,
                            reliefs: reliefs,
                            taxDue: taxDue,
                            taxPaid: totals.payeDeducted,
                            balanceDue: Math.max(0, taxDue - totals.payeDeducted),
                            p9aGenerated: 1,
                            status: 'generated',
                            createdAt: new Date().toISOString()
                        })];
                case 5:
                    _a.sent();
                    if (!(employee === null || employee === void 0 ? void 0 : employee.email)) return [3 /*break*/, 7];
                    return [4 /*yield*/, mail_1.sendEmail({
                            to: employee.email,
                            subject: payrollRules.statutoryTemplates.taxForm + " Tax Form for " + input.taxYear,
                            html: "<p>Dear " + employee.firstName + ",</p><p>Your " + payrollRules.statutoryTemplates.taxForm + " tax form for " + input.taxYear + " has been generated. Gross Income: " + formatPayrollCurrency(totals.grossIncome, payrollRules.currencyLabel) + ", PAYE Deducted: " + formatPayrollCurrency(totals.payeDeducted, payrollRules.currencyLabel) + "</p>"
                        })];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7: return [4 /*yield*/, db_1.logActivity({
                        userId: userId,
                        action: 'tax_form_generated',
                        entityType: 'taxCompliance',
                        entityId: p9Id,
                        description: "Generated " + payrollRules.statutoryTemplates.taxForm + " for employee " + input.employeeId + " for year " + input.taxYear,
                        metadata: JSON.stringify({ organizationId: input.organizationId, country: country, taxYear: input.taxYear }),
                        ipAddress: null
                    })];
                case 8:
                    _a.sent();
                    return [2 /*return*/, __assign(__assign({ p9Id: p9Id }, totals), { taxYear: input.taxYear, taxDue: taxDue, reliefs: reliefs })];
            }
        });
    });
}
exports.generateP9TaxForm = generateP9TaxForm;
exports.hrPayrollRouter = trpc_1.router({
    // Calculate payroll for a batch
    calculatePayroll: enhancedRbac_1.createFeatureRestrictedProcedure(['payroll:process', 'admin:all', 'hr:manage'])
        .input(calculatePayrollSchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                return [2 /*return*/, calculatePayrollBatch(input, ctx.user.id)];
            });
        });
    }),
    // Get payroll batch details
    getPayrollBatch: trpc_1.publicProcedure
        .input(zod_1.z.object({ batchId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, batch, details;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error('Database not available');
                        return [4 /*yield*/, db.query.payrollBatches.findFirst({
                                where: drizzle_orm_1.eq(schema_1.payrollBatches.id, input.batchId)
                            })];
                    case 2:
                        batch = _b.sent();
                        return [4 /*yield*/, db.query.payrollDetails.findMany({
                                where: drizzle_orm_1.eq(schema_1.payrollDetails.batchId, input.batchId)
                            })];
                    case 3:
                        details = _b.sent();
                        return [2 /*return*/, { batch: batch, details: details }];
                }
            });
        });
    }),
    // List payroll batches
    listPayrollBatches: trpc_1.publicProcedure
        .input(zod_1.z.object({
        organizationId: zod_1.z.string(),
        status: zod_1.z.string().optional(),
        limit: zod_1.z.number().int()["default"](50),
        offset: zod_1.z.number().int()["default"](0)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, query;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error('Database not available');
                        query = db.select().from(schema_1.payrollBatches).where(drizzle_orm_1.eq(schema_1.payrollBatches.organizationId, input.organizationId));
                        if (input.status) {
                            query = query.where(drizzle_orm_1.eq(schema_1.payrollBatches.status, input.status));
                        }
                        query = query.orderBy(drizzle_orm_1.desc(schema_1.payrollBatches.createdAt));
                        return [2 /*return*/, query.limit(input.limit).offset(input.offset)];
                }
            });
        });
    }),
    getHRSettings: enhancedRbac_1.createFeatureRestrictedProcedure(['hr:manage', 'admin:all'])
        .input(zod_1.z.object({ organizationId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error('Database not available');
                        return [2 /*return*/, db.query.hrSettings.findFirst({
                                where: drizzle_orm_1.eq(schema_1.hrSettings.organizationId, input.organizationId)
                            })];
                }
            });
        });
    }),
    updateHRSettings: enhancedRbac_1.createFeatureRestrictedProcedure(['hr:manage', 'admin:all'])
        .input(zod_1.z.object({
        organizationId: zod_1.z.string(),
        countryCode: zod_1.z.string().optional(),
        payrollRegion: zod_1.z.string().optional(),
        leavePolicy: zod_1.z.any().optional(),
        statutoryReportTemplates: zod_1.z.any().optional(),
        statutoryAuditingEnabled: zod_1.z.boolean().optional(),
        autoApprovePayroll: zod_1.z.boolean().optional(),
        autoAccrueLeave: zod_1.z.boolean().optional(),
        payrollDay: zod_1.z.number().int().optional(),
        leaveAccrualDay: zod_1.z.number().int().optional()
    }).strict())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, existing, payload, newSettingsId;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error('Database not available');
                        return [4 /*yield*/, db.query.hrSettings.findFirst({
                                where: drizzle_orm_1.eq(schema_1.hrSettings.organizationId, input.organizationId)
                            })];
                    case 2:
                        existing = _b.sent();
                        payload = {
                            organizationId: input.organizationId,
                            updatedAt: new Date().toISOString()
                        };
                        if (input.countryCode)
                            payload.countryCode = input.countryCode;
                        if (input.payrollRegion)
                            payload.payrollRegion = input.payrollRegion;
                        if (input.leavePolicy)
                            payload.leavePolicy = input.leavePolicy;
                        if (typeof input.statutoryReportTemplates !== 'undefined')
                            payload.statutoryReportTemplates = input.statutoryReportTemplates;
                        if (typeof input.statutoryAuditingEnabled !== 'undefined')
                            payload.statutoryAuditingEnabled = Number(input.statutoryAuditingEnabled);
                        if (typeof input.autoApprovePayroll !== 'undefined')
                            payload.autoApprovePayroll = Number(input.autoApprovePayroll);
                        if (typeof input.autoAccrueLeave !== 'undefined')
                            payload.autoAccrueLeave = Number(input.autoAccrueLeave);
                        if (typeof input.payrollDay !== 'undefined')
                            payload.payrollDay = input.payrollDay;
                        if (typeof input.leaveAccrualDay !== 'undefined')
                            payload.leaveAccrualDay = input.leaveAccrualDay;
                        if (!existing) return [3 /*break*/, 5];
                        return [4 /*yield*/, db.update(schema_1.hrSettings).set(payload).where(drizzle_orm_1.eq(schema_1.hrSettings.id, existing.id))];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, db_1.logActivity({
                                userId: ctx.user.id,
                                action: 'hr_settings_updated',
                                entityType: 'hrSettings',
                                entityId: existing.id,
                                description: "HR settings updated for organization " + input.organizationId,
                                metadata: JSON.stringify({ organizationId: input.organizationId, updates: payload }),
                                ipAddress: getRequestIp(ctx.req)
                            })];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, { updated: true }];
                    case 5:
                        newSettingsId = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_1.hrSettings).values(__assign({ id: newSettingsId, createdAt: new Date().toISOString() }, payload))];
                    case 6:
                        _b.sent();
                        return [4 /*yield*/, db_1.logActivity({
                                userId: ctx.user.id,
                                action: 'hr_settings_created',
                                entityType: 'hrSettings',
                                entityId: newSettingsId,
                                description: "HR settings created for organization " + input.organizationId,
                                metadata: JSON.stringify({ organizationId: input.organizationId, initialSettings: payload }),
                                ipAddress: getRequestIp(ctx.req)
                            })];
                    case 7:
                        _b.sent();
                        return [2 /*return*/, { created: true }];
                }
            });
        });
    }),
    getPayrollRules: trpc_1.publicProcedure
        .input(zod_1.z.object({ countryCode: zod_1.z.string().optional()["default"]('KE') }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                return [2 /*return*/, getPayrollRulesForCountry(input.countryCode)];
            });
        });
    }),
    generateStatutoryReport: enhancedRbac_1.createFeatureRestrictedProcedure(['tax:manage', 'hr:manage', 'admin:all'])
        .input(zod_1.z.object({ organizationId: zod_1.z.string(), payMonth: zod_1.z.string().datetime(), countryCode: zod_1.z.string().optional() }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgSettings, country, payrollRules, batch, details, _b, totals, statutoryTemplates;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _d.sent();
                        if (!db)
                            throw new Error('Database not available');
                        return [4 /*yield*/, db.query.hrSettings.findFirst({
                                where: drizzle_orm_1.eq(schema_1.hrSettings.organizationId, input.organizationId)
                            })];
                    case 2:
                        orgSettings = _d.sent();
                        country = input.countryCode || (orgSettings === null || orgSettings === void 0 ? void 0 : orgSettings.countryCode) || 'KE';
                        payrollRules = getPayrollRulesForCountry(country);
                        return [4 /*yield*/, db.query.payrollBatches.findFirst({
                                where: drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.payrollBatches.organizationId, input.organizationId), drizzle_orm_1.eq(schema_1.payrollBatches.payMonth, input.payMonth))
                            })];
                    case 3:
                        batch = _d.sent();
                        if (!batch) return [3 /*break*/, 5];
                        return [4 /*yield*/, db.query.payrollDetails.findMany({ where: drizzle_orm_1.eq(schema_1.payrollDetails.batchId, batch.id) })];
                    case 4:
                        _b = _d.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        _b = [];
                        _d.label = 6;
                    case 6:
                        details = _b;
                        totals = details.reduce(function (acc, row) { return ({
                            grossIncome: acc.grossIncome + row.grossSalary,
                            totalDeductions: acc.totalDeductions + row.totalDeductions,
                            netPay: acc.netPay + row.netSalary
                        }); }, { grossIncome: 0, totalDeductions: 0, netPay: 0 });
                        statutoryTemplates = resolveStatutoryTemplates(orgSettings, payrollRules);
                        return [4 /*yield*/, db_1.logActivity({
                                userId: ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id) || 'system',
                                action: 'statutory_report_generated',
                                entityType: 'payrollBatch',
                                entityId: (batch === null || batch === void 0 ? void 0 : batch.id) || null,
                                description: "Generated statutory report for " + country + " payroll region " + ((orgSettings === null || orgSettings === void 0 ? void 0 : orgSettings.payrollRegion) || 'east_africa'),
                                metadata: JSON.stringify({ organizationId: input.organizationId, payMonth: input.payMonth, templates: statutoryTemplates, complianceStatus: (orgSettings === null || orgSettings === void 0 ? void 0 : orgSettings.statutoryAuditingEnabled) ? 'enabled' : 'disabled' }),
                                ipAddress: getRequestIp(ctx.req)
                            })];
                    case 7:
                        _d.sent();
                        return [2 /*return*/, {
                                country: country,
                                payrollRegion: (orgSettings === null || orgSettings === void 0 ? void 0 : orgSettings.payrollRegion) || 'east_africa',
                                currencyLabel: payrollRules.currencyLabel,
                                statutoryTemplates: statutoryTemplates,
                                statutoryTemplateContent: statutoryTemplates.content,
                                totals: totals,
                                batchId: batch === null || batch === void 0 ? void 0 : batch.id,
                                employeeCount: (batch === null || batch === void 0 ? void 0 : batch.employeeCount) || 0,
                                complianceStatus: (orgSettings === null || orgSettings === void 0 ? void 0 : orgSettings.statutoryAuditingEnabled) ? 'enabled' : 'disabled'
                            }];
                }
            });
        });
    }),
    // Approve payroll
    approvePayroll: enhancedRbac_1.createFeatureRestrictedProcedure(['payroll:approve', 'admin:all', 'hr:manage'])
        .input(approvePayrollSchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error('Database not available');
                        return [4 /*yield*/, db.update(schema_1.payrollBatches)
                                .set({ status: 'approved', approvedBy: ctx.user.id, approvalDate: new Date().toISOString() })
                                .where(drizzle_orm_1.eq(schema_1.payrollBatches.id, input.batchId))
                            // Update payroll details status
                        ];
                    case 2:
                        _b.sent();
                        // Update payroll details status
                        return [4 /*yield*/, db.update(schema_1.payrollDetails)
                                .set({ status: 'approved' })
                                .where(drizzle_orm_1.eq(schema_1.payrollDetails.batchId, input.batchId))
                            // Update approval workflow
                        ];
                    case 3:
                        // Update payroll details status
                        _b.sent();
                        // Update approval workflow
                        return [4 /*yield*/, db.update(schema_1.approvalWorkflows)
                                .set({ status: 'approved', approvedBy: ctx.user.id, approvedAt: new Date().toISOString() })
                                .where(drizzle_orm_1.eq(schema_1.approvalWorkflows.entityId, input.batchId))];
                    case 4:
                        // Update approval workflow
                        _b.sent();
                        return [4 /*yield*/, db_1.logActivity({
                                userId: ctx.user.id,
                                action: 'payroll_batch_approved',
                                entityType: 'payrollBatch',
                                entityId: input.batchId,
                                description: "Payroll batch " + input.batchId + " approved",
                                metadata: JSON.stringify({ organizationId: ctx.user.organizationId }),
                                ipAddress: getRequestIp(ctx.req)
                            })];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, { batchId: input.batchId }];
                }
            });
        });
    }),
    // Process payroll (actual payment)
    processPayroll: enhancedRbac_1.createFeatureRestrictedProcedure(['payroll:process', 'admin:all', 'hr:manage'])
        .input(processPayrollSchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, batch, details, _i, details_1, detail, payslipId, payslipNumber, employee;
            var _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _f.sent();
                        if (!db)
                            throw new Error('Database not available');
                        return [4 /*yield*/, db.query.payrollBatches.findFirst({
                                where: drizzle_orm_1.eq(schema_1.payrollBatches.id, input.batchId)
                            })];
                    case 2:
                        batch = _f.sent();
                        if (!batch || batch.status !== 'approved') {
                            throw new Error('Payroll must be approved before processing');
                        }
                        // Update batch status
                        return [4 /*yield*/, db.update(schema_1.payrollBatches)
                                .set({ status: 'processed', processedBy: ctx.user.id, processedDate: input.paymentDate })
                                .where(drizzle_orm_1.eq(schema_1.payrollBatches.id, input.batchId))
                            // Update payroll details and generate payslips
                        ];
                    case 3:
                        // Update batch status
                        _f.sent();
                        return [4 /*yield*/, db.query.payrollDetails.findMany({
                                where: drizzle_orm_1.eq(schema_1.payrollDetails.batchId, input.batchId)
                            })];
                    case 4:
                        details = _f.sent();
                        _i = 0, details_1 = details;
                        _f.label = 5;
                    case 5:
                        if (!(_i < details_1.length)) return [3 /*break*/, 11];
                        detail = details_1[_i];
                        // Update detail status
                        return [4 /*yield*/, db.update(schema_1.payrollDetails)
                                .set({ status: 'paid', paidDate: input.paymentDate })
                                .where(drizzle_orm_1.eq(schema_1.payrollDetails.id, detail.id))
                            // Generate payslip
                        ];
                    case 6:
                        // Update detail status
                        _f.sent();
                        payslipId = uuid_1.v4();
                        payslipNumber = "PS-" + ((_b = batch.payMonth) === null || _b === void 0 ? void 0 : _b.substring(0, 7)) + "-" + ((_c = detail.employeeId) === null || _c === void 0 ? void 0 : _c.substring(0, 4).toUpperCase());
                        return [4 /*yield*/, db.insert(schema_1.payslips).values({
                                id: payslipId,
                                organizationId: batch.organizationId,
                                payrollDetailId: detail.id,
                                employeeId: detail.employeeId,
                                payslipNumber: payslipNumber,
                                payMonth: batch.payMonth,
                                basicSalary: detail.basicSalary,
                                allowances: detail.allowances,
                                bonuses: detail.bonuses,
                                grossSalary: detail.grossSalary,
                                nssfDeduction: detail.nssfDeduction,
                                nhifDeduction: detail.nhifDeduction,
                                payeDeduction: detail.payeDeduction,
                                loanDeduction: detail.loanDeduction,
                                otherDeductions: detail.otherDeductions,
                                totalDeductions: detail.totalDeductions,
                                netSalary: detail.netSalary,
                                status: 'generated',
                                createdAt: new Date().toISOString()
                            })
                            // Send payslip email
                        ];
                    case 7:
                        _f.sent();
                        return [4 /*yield*/, db.query.employees.findFirst({
                                where: drizzle_orm_1.eq(schema_1.employees.id, detail.employeeId)
                            })];
                    case 8:
                        employee = _f.sent();
                        if (!(employee === null || employee === void 0 ? void 0 : employee.email)) return [3 /*break*/, 10];
                        return [4 /*yield*/, mail_1.sendEmail({
                                to: employee.email,
                                subject: "Payslip for " + ((_d = batch.payMonth) === null || _d === void 0 ? void 0 : _d.substring(0, 7)),
                                html: "<p>Dear " + employee.firstName + ",</p><p>Your payslip for " + ((_e = batch.payMonth) === null || _e === void 0 ? void 0 : _e.substring(0, 7)) + " is ready. Gross: " + detail.currencyLabel + " " + detail.grossSalary.toLocaleString() + ", Net: " + detail.currencyLabel + " " + detail.netSalary.toLocaleString() + "</p>"
                            })];
                    case 9:
                        _f.sent();
                        _f.label = 10;
                    case 10:
                        _i++;
                        return [3 /*break*/, 5];
                    case 11: return [4 /*yield*/, db_1.logActivity({
                            userId: ctx.user.id,
                            action: 'payroll_batch_processed',
                            entityType: 'payrollBatch',
                            entityId: input.batchId,
                            description: "Payroll batch " + input.batchId + " processed and " + details.length + " payslips generated",
                            metadata: JSON.stringify({ paymentDate: input.paymentDate, organizationId: batch.organizationId }),
                            ipAddress: getRequestIp(ctx.req)
                        })];
                    case 12:
                        _f.sent();
                        return [2 /*return*/, { batchId: input.batchId, payslipsGenerated: details.length }];
                }
            });
        });
    }),
    // Get payslip
    getPayslip: trpc_1.publicProcedure
        .input(zod_1.z.object({ payslipId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                return [2 /*return*/, db.query.payslips.findFirst({
                        where: drizzle_orm_1.eq(schema_1.payslips.id, input.payslipId)
                    })];
            });
        });
    }),
    // List payslips for employee
    listPayslipsForEmployee: trpc_1.publicProcedure
        .input(zod_1.z.object({
        employeeId: zod_1.z.string(),
        year: zod_1.z.number().int().optional(),
        limit: zod_1.z.number().int()["default"](12),
        offset: zod_1.z.number().int()["default"](0)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var query;
            return __generator(this, function (_b) {
                query = db.select().from(schema_1.payslips).where(drizzle_orm_1.eq(schema_1.payslips.employeeId, input.employeeId));
                if (input.year) {
                    query = query.where(drizzle_orm_1.and(drizzle_orm_1.gte(schema_1.payslips.payMonth, new Date(input.year + "-01-01").toISOString()), drizzle_orm_1.lte(schema_1.payslips.payMonth, new Date(input.year + "-12-31").toISOString())));
                }
                return [2 /*return*/, query.orderBy(drizzle_orm_1.desc(schema_1.payslips.payMonth)).limit(input.limit).offset(input.offset)];
            });
        });
    }),
    // Generate P9 tax compliance form
    generateP9: enhancedRbac_1.createFeatureRestrictedProcedure(['payroll:process', 'tax:manage', 'admin:all', 'hr:manage'])
        .input(generateP9Schema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                return [2 /*return*/, generateP9TaxForm({
                        organizationId: input.organizationId,
                        employeeId: input.employeeId,
                        taxYear: input.taxYear
                    }, ctx.user.id)];
            });
        });
    }),
    // List P9 forms
    listP9Forms: trpc_1.publicProcedure
        .input(zod_1.z.object({
        organizationId: zod_1.z.string(),
        taxYear: zod_1.z.number().int().optional(),
        status: zod_1.z.string().optional(),
        limit: zod_1.z.number().int()["default"](50),
        offset: zod_1.z.number().int()["default"](0)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var query;
            return __generator(this, function (_b) {
                query = db.select().from(schema_1.taxCompliance).where(drizzle_orm_1.eq(schema_1.taxCompliance.organizationId, input.organizationId));
                if (input.taxYear) {
                    query = query.where(drizzle_orm_1.eq(schema_1.taxCompliance.taxYear, input.taxYear));
                }
                if (input.status) {
                    query = query.where(drizzle_orm_1.eq(schema_1.taxCompliance.status, input.status));
                }
                return [2 /*return*/, query.orderBy(drizzle_orm_1.desc(schema_1.taxCompliance.createdAt)).limit(input.limit).offset(input.offset)];
            });
        });
    }),
    // Get payroll analytics
    getPayrollAnalytics: trpc_1.publicProcedure
        .input(zod_1.z.object({
        organizationId: zod_1.z.string(),
        month: zod_1.z.string().datetime()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var batches, batch;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db.query.payrollBatches.findMany({
                            where: drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.payrollBatches.organizationId, input.organizationId), drizzle_orm_1.gte(schema_1.payrollBatches.payMonth, input.month), drizzle_orm_1.lte(schema_1.payrollBatches.payMonth, input.month))
                        })];
                    case 1:
                        batches = _b.sent();
                        batch = batches[0];
                        return [2 /*return*/, {
                                totalEmployees: (batch === null || batch === void 0 ? void 0 : batch.employeeCount) || 0,
                                totalGross: (batch === null || batch === void 0 ? void 0 : batch.totalGross) || 0,
                                totalDeductions: (batch === null || batch === void 0 ? void 0 : batch.totalDeductions) || 0,
                                totalNet: (batch === null || batch === void 0 ? void 0 : batch.totalNet) || 0,
                                averageSalary: (batch === null || batch === void 0 ? void 0 : batch.employeeCount) ? Math.round((batch.totalGross || 0) / batch.employeeCount) : 0
                            }];
                }
            });
        });
    })
});
