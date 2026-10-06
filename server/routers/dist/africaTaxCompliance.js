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
exports.taxComplianceRouter = void 0;
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var drizzle_orm_1 = require("drizzle-orm");
var server_1 = require("@trpc/server");
/**
 * Africa-focused Tax Compliance & Statutory Reporting Router
 * Supports compliance requirements for multiple African countries
 * Includes: VAT, PAYE, Corporate Tax, Housing Levy, NSSF, etc.
 */
var readProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:taxCompliance:read");
var reportProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:taxCompliance:report");
var exportProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:taxCompliance:export");
// Country-specific tax configuration
var TAX_CONFIG = {
    KE: {
        countryName: "Kenya",
        currency: "KES",
        vat: 0.16,
        vat_exempt: 0.0,
        corporate_tax: 0.30,
        paye_min: 0,
        paye_max: 0.30,
        housing_levy: 0.015,
        nssf: 0.06,
        shif: 0.005,
        regulatory_body: "KRA (Kenya Revenue Authority)",
        filing_frequency: "monthly",
        fiscal_year: "01-01 to 12-31"
    },
    UG: {
        countryName: "Uganda",
        currency: "UGX",
        vat: 0.18,
        corporate_tax: 0.30,
        paye_min: 0,
        paye_max: 0.30,
        nssf: 0.10,
        regulatory_body: "URA (Uganda Revenue Authority)",
        filing_frequency: "monthly",
        fiscal_year: "01-01 to 12-31"
    },
    NG: {
        countryName: "Nigeria",
        currency: "NGN",
        vat: 0.075,
        corporate_tax: 0.30,
        paye_min: 0,
        paye_max: 0.24,
        regulatory_body: "FIRS (Federal Inland Revenue Service)",
        filing_frequency: "quarterly",
        fiscal_year: "01-01 to 12-31"
    },
    GH: {
        countryName: "Ghana",
        currency: "GHS",
        vat: 0.125,
        corporate_tax: 0.25,
        paye_min: 0,
        paye_max: 0.21,
        regulatory_body: "GRA (Ghana Revenue Authority)",
        filing_frequency: "monthly",
        fiscal_year: "01-01 to 12-31"
    },
    TZ: {
        countryName: "Tanzania",
        currency: "TZS",
        vat: 0.18,
        corporate_tax: 0.30,
        paye_min: 0,
        paye_max: 0.30,
        nssf: 0.10,
        regulatory_body: "TRA (Tanzania Revenue Authority)",
        filing_frequency: "monthly",
        fiscal_year: "01-01 to 12-31"
    },
    ZA: {
        countryName: "South Africa",
        currency: "ZAR",
        vat: 0.15,
        corporate_tax: 0.28,
        paye_min: 0,
        paye_max: 0.45,
        regulatory_body: "SARS (South African Revenue Service)",
        filing_frequency: "monthly",
        fiscal_year: "03-01 to 02-28"
    }
};
exports.taxComplianceRouter = trpc_1.router({
    // Get tax configuration for a country
    getTaxConfig: readProcedure
        .input(zod_1.z.object({
        country: zod_1.z.string()["default"]("KE")
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                return [2 /*return*/, TAX_CONFIG[input.country] || TAX_CONFIG.KE];
            });
        });
    }),
    // Get VAT report
    getVATReport: reportProcedure
        .input(zod_1.z.object({
        startDate: zod_1.z.string(),
        endDate: zod_1.z.string(),
        country: zod_1.z.string()["default"]("KE")
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db_2, orgId, config, invoices, totalSales_1, totalVAT_1, exemptSales, vatPayable, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db_2 = _b.sent();
                        if (!db_2)
                            return [2 /*return*/, null];
                        orgId = ctx.user.organizationId;
                        config = TAX_CONFIG[input.country];
                        return [4 /*yield*/, db_2.select().from("invoices")
                                .where(drizzle_orm_1.and(orgId ? drizzle_orm_1.eq("invoices.organizationId", orgId) : undefined, drizzle_orm_1.gte("invoices.createdAt", input.startDate), drizzle_orm_1.lte("invoices.createdAt", input.endDate)))];
                    case 2:
                        invoices = _b.sent();
                        totalSales_1 = 0;
                        totalVAT_1 = 0;
                        exemptSales = 0;
                        invoices.forEach(function (inv) {
                            totalSales_1 += inv.total || 0;
                            totalVAT_1 += inv.taxAmount || 0;
                        });
                        vatPayable = totalVAT_1;
                        return [2 /*return*/, {
                                country: input.country,
                                period: { startDate: input.startDate, endDate: input.endDate },
                                totalSales: totalSales_1,
                                exemptSales: exemptSales,
                                standardRatedSales: totalSales_1 - exemptSales,
                                vatRate: (config.vat * 100) + "%",
                                totalVAT: totalVAT_1,
                                vatPayable: vatPayable,
                                dueDate: new Date(new Date(input.endDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                status: "Due for Filing"
                            }];
                    case 3:
                        error_1 = _b.sent();
                        console.error("VAT Report error:", error_1);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to generate VAT report"
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    // Get Corporate Tax report
    getCorporateTaxReport: reportProcedure
        .input(zod_1.z.object({
        startDate: zod_1.z.string(),
        endDate: zod_1.z.string(),
        country: zod_1.z.string()["default"]("KE")
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db_3, orgId, config, invoices, expenses, grossIncome, allowableExpenses, taxableIncome, corporateTax, error_2;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db_3 = _d.sent();
                        if (!db_3)
                            return [2 /*return*/, null];
                        orgId = ctx.user.organizationId;
                        config = TAX_CONFIG[input.country];
                        return [4 /*yield*/, db_3.select({ total: drizzle_orm_1.sum("invoices.total") }).from("invoices")
                                .where(drizzle_orm_1.and(orgId ? drizzle_orm_1.eq("invoices.organizationId", orgId) : undefined, drizzle_orm_1.gte("invoices.createdAt", input.startDate), drizzle_orm_1.lte("invoices.createdAt", input.endDate))).limit(1)];
                    case 2:
                        invoices = _d.sent();
                        return [4 /*yield*/, db_3.select({ total: drizzle_orm_1.sum("expenses.amount") }).from("expenses")
                                .where(drizzle_orm_1.and(orgId ? drizzle_orm_1.eq("expenses.organizationId", orgId) : undefined, drizzle_orm_1.gte("expenses.expenseDate", input.startDate), drizzle_orm_1.lte("expenses.expenseDate", input.endDate))).limit(1)];
                    case 3:
                        expenses = _d.sent();
                        grossIncome = ((_b = invoices[0]) === null || _b === void 0 ? void 0 : _b.total) || 0;
                        allowableExpenses = ((_c = expenses[0]) === null || _c === void 0 ? void 0 : _c.total) || 0;
                        taxableIncome = Math.max(0, grossIncome - allowableExpenses);
                        corporateTax = taxableIncome * config.corporate_tax;
                        return [2 /*return*/, {
                                country: input.country,
                                period: { startDate: input.startDate, endDate: input.endDate },
                                grossIncome: grossIncome,
                                allowableExpenses: allowableExpenses,
                                taxableIncome: taxableIncome,
                                taxRate: (config.corporate_tax * 100) + "%",
                                corporateTaxPayable: corporateTax,
                                dueDate: new Date(new Date(input.endDate).getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                status: "Due for Assessment"
                            }];
                    case 4:
                        error_2 = _d.sent();
                        console.error("Corporate Tax error:", error_2);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to generate corporate tax report"
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    // Get Payroll Tax Summary (PAYE, NSSF, SHIF, Housing Levy)
    getPayrollTaxSummary: reportProcedure
        .input(zod_1.z.object({
        startDate: zod_1.z.string(),
        endDate: zod_1.z.string(),
        country: zod_1.z.string()["default"]("KE")
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db_4, config, payrolls, totalPAYE_1, totalNSSF_1, totalSHIF_1, totalHousingLevy_1, totalGrossSalary_1, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db_4 = _b.sent();
                        if (!db_4)
                            return [2 /*return*/, null];
                        config = TAX_CONFIG[input.country];
                        return [4 /*yield*/, db_4.select().from("payroll")
                                .where(drizzle_orm_1.and(drizzle_orm_1.gte("payroll.date", input.startDate), drizzle_orm_1.lte("payroll.date", input.endDate)))];
                    case 2:
                        payrolls = _b.sent();
                        totalPAYE_1 = 0;
                        totalNSSF_1 = 0;
                        totalSHIF_1 = 0;
                        totalHousingLevy_1 = 0;
                        totalGrossSalary_1 = 0;
                        payrolls.forEach(function (p) {
                            totalGrossSalary_1 += p.grossSalary || 0;
                            totalPAYE_1 += p.payeeTax || 0;
                            totalNSSF_1 += p.nssfContribution || 0;
                            totalSHIF_1 += p.shifContribution || 0;
                            totalHousingLevy_1 += p.housingLevyDeduction || 0;
                        });
                        return [2 /*return*/, {
                                country: input.country,
                                period: { startDate: input.startDate, endDate: input.endDate },
                                totalGrossSalary: totalGrossSalary_1,
                                paye: {
                                    amount: totalPAYE_1,
                                    rate: (config.paye_max * 100) + "%",
                                    dueDate: new Date(new Date(input.endDate).getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                                },
                                nssf: {
                                    amount: totalNSSF_1,
                                    rate: config.nssf ? (config.nssf * 100) + "%" : "N/A",
                                    dueDate: new Date(new Date(input.endDate).getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                                },
                                shif: {
                                    amount: totalSHIF_1,
                                    rate: config.shif ? (config.shif * 100) + "%" : "N/A",
                                    dueDate: new Date(new Date(input.endDate).getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                                },
                                housingLevy: {
                                    amount: totalHousingLevy_1,
                                    rate: config.housing_levy ? (config.housing_levy * 100) + "%" : "N/A",
                                    dueDate: new Date(new Date(input.endDate).getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                                },
                                totalDeductions: totalPAYE_1 + totalNSSF_1 + totalSHIF_1 + totalHousingLevy_1
                            }];
                    case 3:
                        error_3 = _b.sent();
                        console.error("Payroll Tax Summary error:", error_3);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to generate payroll tax summary"
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    // Export compliance checklist
    getComplianceChecklist: readProcedure
        .input(zod_1.z.object({
        country: zod_1.z.string()["default"]("KE"),
        year: zod_1.z.number()["default"](new Date().getFullYear())
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var config, checklists;
            return __generator(this, function (_b) {
                config = TAX_CONFIG[input.country];
                checklists = {
                    KE: [
                        { item: "VAT Registration", frequency: "Once", status: "Completed" },
                        { item: "Monthly VAT Returns (Form 201)", frequency: "Monthly", status: "Pending" },
                        { item: "Quarterly PAYE Returns (P10)", frequency: "Quarterly", status: "Pending" },
                        { item: "Monthly NSSF Contributions", frequency: "Monthly", status: "Pending" },
                        { item: "Annual Income Tax Return (ITR)", frequency: "Annual", status: "Pending" },
                        { item: "Annual Audit (if required)", frequency: "Annual", status: "Pending" },
                        { item: "Corporation Tax Estimate", frequency: "Quarterly", status: "Pending" },
                        { item: "Housing Levy Payments", frequency: "Monthly", status: "Pending" },
                    ],
                    UG: [
                        { item: "VAT Registration", frequency: "Once", status: "Completed" },
                        { item: "Monthly VAT Returns", frequency: "Monthly", status: "Pending" },
                        { item: "Monthly PAYE Returns", frequency: "Monthly", status: "Pending" },
                        { item: "Annual Income Tax Return", frequency: "Annual", status: "Pending" },
                    ],
                    NG: [
                        { item: "VAT Registration", frequency: "Once", status: "Completed" },
                        { item: "Quarterly VAT Returns", frequency: "Quarterly", status: "Pending" },
                        { item: "Quarterly Payroll Tax Returns", frequency: "Quarterly", status: "Pending" },
                        { item: "Annual Company Income Tax Return", frequency: "Annual", status: "Pending" },
                    ]
                };
                return [2 /*return*/, {
                        country: input.country,
                        countryName: config.countryName,
                        year: input.year,
                        regulatoryBody: config.regulatory_body,
                        fiscalYear: config.fiscal_year,
                        checklist: checklists[input.country] || checklists.KE
                    }];
            });
        });
    }),
    // Auto-generate compliance report for audit trail
    generateAuditTrail: exportProcedure
        .input(zod_1.z.object({
        startDate: zod_1.z.string(),
        endDate: zod_1.z.string(),
        country: zod_1.z.string()["default"]("KE")
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db_5, orgId, invoices, payments, expenses, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db_5 = _b.sent();
                        if (!db_5)
                            return [2 /*return*/, null];
                        orgId = ctx.user.organizationId;
                        return [4 /*yield*/, db_5.select().from("invoices")
                                .where(drizzle_orm_1.and(orgId ? drizzle_orm_1.eq("invoices.organizationId", orgId) : undefined, drizzle_orm_1.gte("invoices.createdAt", input.startDate), drizzle_orm_1.lte("invoices.createdAt", input.endDate)))];
                    case 2:
                        invoices = _b.sent();
                        return [4 /*yield*/, db_5.select().from("payments")
                                .where(drizzle_orm_1.and(orgId ? drizzle_orm_1.eq("payments.organizationId", orgId) : undefined, drizzle_orm_1.gte("payments.paymentDate", input.startDate), drizzle_orm_1.lte("payments.paymentDate", input.endDate)))];
                    case 3:
                        payments = _b.sent();
                        return [4 /*yield*/, db_5.select().from("expenses")
                                .where(drizzle_orm_1.and(orgId ? drizzle_orm_1.eq("expenses.organizationId", orgId) : undefined, drizzle_orm_1.gte("expenses.expenseDate", input.startDate), drizzle_orm_1.lte("expenses.expenseDate", input.endDate)))];
                    case 4:
                        expenses = _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                auditTrail: {
                                    period: { startDate: input.startDate, endDate: input.endDate },
                                    country: input.country,
                                    totalInvoices: invoices.length,
                                    totalPayments: payments.length,
                                    totalExpenses: expenses.length,
                                    generatedAt: new Date().toISOString(),
                                    generatedBy: ctx.user.id
                                },
                                message: "Audit trail generated successfully for compliance review"
                            }];
                    case 5:
                        error_4 = _b.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to generate audit trail"
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    })
});
