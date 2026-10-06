"use strict";
/**
 * Utility functions for exporting financial reports in various formats
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
exports.__esModule = true;
exports.generateFinancialReportJSON = exports.generateFinancialReportTXT = exports.generateFinancialReportCSV = exports.fetchFinancialData = void 0;
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var company_info_1 = require("./company-info");
/**
 * Fetch financial data from database
 */
function fetchFinancialData(config) {
    return __awaiter(this, void 0, Promise, function () {
        var db, invoicesQuery, expensesQuery, invoiceData, expenseData, totalInvoiced, paidInvoices, outstandingAmount, totalExpenses, netProfit, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        throw new Error('Database connection not available');
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 6]);
                    invoicesQuery = db.select({
                        id: schema_1.invoices.id,
                        invoiceNumber: schema_1.invoices.invoiceNumber,
                        total: schema_1.invoices.total,
                        paidAmount: schema_1.invoices.paidAmount,
                        status: schema_1.invoices.status,
                        issueDate: schema_1.invoices.issueDate
                    }).from(schema_1.invoices);
                    expensesQuery = db.select({
                        id: schema_1.expenses.id,
                        amount: schema_1.expenses.amount,
                        expenseDate: schema_1.expenses.expenseDate,
                        status: schema_1.expenses.status
                    }).from(schema_1.expenses);
                    if (config.startDate) {
                        invoicesQuery = invoicesQuery.where(drizzle_orm_1.gte(schema_1.invoices.issueDate, config.startDate));
                        expensesQuery = expensesQuery.where(drizzle_orm_1.gte(schema_1.expenses.expenseDate, config.startDate));
                    }
                    if (config.endDate) {
                        invoicesQuery = invoicesQuery.where(drizzle_orm_1.lte(schema_1.invoices.issueDate, config.endDate));
                        expensesQuery = expensesQuery.where(drizzle_orm_1.lte(schema_1.expenses.expenseDate, config.endDate));
                    }
                    return [4 /*yield*/, invoicesQuery];
                case 3:
                    invoiceData = _a.sent();
                    return [4 /*yield*/, expensesQuery];
                case 4:
                    expenseData = _a.sent();
                    totalInvoiced = invoiceData.reduce(function (sum, inv) { return sum + (inv.total || 0); }, 0);
                    paidInvoices = invoiceData
                        .filter(function (inv) { return inv.status === 'paid'; })
                        .reduce(function (sum, inv) { return sum + (inv.total || 0); }, 0);
                    outstandingAmount = invoiceData.reduce(function (sum, inv) { return sum + ((inv.total || 0) - (inv.paidAmount || 0)); }, 0);
                    totalExpenses = expenseData.reduce(function (sum, exp) { return sum + (exp.amount || 0); }, 0);
                    netProfit = totalInvoiced - totalExpenses;
                    return [2 /*return*/, {
                            invoiceData: invoiceData,
                            expenseData: expenseData,
                            totalInvoiced: totalInvoiced,
                            paidInvoices: paidInvoices,
                            outstandingAmount: outstandingAmount,
                            totalExpenses: totalExpenses,
                            netProfit: netProfit
                        }];
                case 5:
                    error_1 = _a.sent();
                    console.error("Error fetching financial data:", error_1);
                    throw new Error("Failed to fetch financial data: " + (error_1 instanceof Error ? error_1.message : 'Unknown error'));
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.fetchFinancialData = fetchFinancialData;
var formatCurrency = function (amount) {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES'
    }).format(amount / 100);
};
/**
 * Generate financial report as CSV
 */
function generateFinancialReportCSV(config) {
    return __awaiter(this, void 0, Promise, function () {
        var data, companyInfo, csv, periodText;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetchFinancialData(config)];
                case 1:
                    data = _a.sent();
                    return [4 /*yield*/, company_info_1.getCompanyInfo()];
                case 2:
                    companyInfo = _a.sent();
                    csv = '';
                    // Add header
                    csv += companyInfo.name + " - Financial Report\n";
                    csv += "Report: " + config.title + "\n";
                    periodText = config.startDate && config.endDate
                        ? "Period: " + config.startDate.toLocaleDateString() + " - " + config.endDate.toLocaleDateString()
                        : 'Period: All Time';
                    csv += periodText + "\n";
                    csv += "Generated: " + new Date().toLocaleDateString() + "\n";
                    csv += '\n';
                    // Add financial summary
                    csv += 'FINANCIAL SUMMARY\n';
                    csv += 'Metric,Amount\n';
                    csv += "Total Revenue,\"" + formatCurrency(data.totalInvoiced) + "\"\n";
                    csv += "Paid Invoices,\"" + formatCurrency(data.paidInvoices) + "\"\n";
                    csv += "Outstanding Receivables,\"" + formatCurrency(data.outstandingAmount) + "\"\n";
                    csv += "Total Expenses,\"" + formatCurrency(data.totalExpenses) + "\"\n";
                    csv += "Net Profit,\"" + formatCurrency(data.netProfit) + "\"\n";
                    csv += '\n';
                    // Add invoice details if requested
                    if (config.includeDetails && data.invoiceData.length > 0) {
                        csv += 'INVOICE DETAILS\n';
                        csv += 'Invoice #,Client,Date,Amount,Status\n';
                        data.invoiceData.forEach(function (inv) {
                            csv += "\"" + (inv.invoiceNumber || 'N/A') + "\",\"Client " + (inv.clientId ? inv.clientId.substring(0, 8) : 'N/A') + "\",\"" + new Date(inv.issueDate).toLocaleDateString() + "\",\"" + formatCurrency(inv.total || 0) + "\",\"" + (inv.status || 'pending') + "\"\n";
                        });
                        csv += '\n';
                    }
                    // Add expense details if requested
                    if (config.includeDetails && data.expenseData.length > 0) {
                        csv += 'EXPENSE DETAILS\n';
                        csv += 'Description,Category,Amount,Date,Status\n';
                        data.expenseData.forEach(function (exp) {
                            csv += "\"" + (exp.description || 'N/A') + "\",\"" + (exp.category || 'N/A') + "\",\"" + formatCurrency(exp.amount || 0) + "\",\"" + new Date(exp.expenseDate).toLocaleDateString() + "\",\"" + (exp.status || 'pending') + "\"\n";
                        });
                    }
                    return [2 /*return*/, Buffer.from(csv, 'utf-8')];
            }
        });
    });
}
exports.generateFinancialReportCSV = generateFinancialReportCSV;
/**
 * Generate financial report as TXT
 */
function generateFinancialReportTXT(config) {
    return __awaiter(this, void 0, Promise, function () {
        var data, companyInfo, txt, headerLine, periodText;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetchFinancialData(config)];
                case 1:
                    data = _a.sent();
                    return [4 /*yield*/, company_info_1.getCompanyInfo()];
                case 2:
                    companyInfo = _a.sent();
                    txt = '';
                    headerLine = '═'.repeat(70);
                    txt += headerLine + "\n";
                    txt += companyInfo.name.toUpperCase() + " - FINANCIAL REPORT\n";
                    txt += headerLine + "\n\n";
                    txt += "Report: " + config.title + "\n";
                    periodText = config.startDate && config.endDate
                        ? "Period: " + config.startDate.toLocaleDateString() + " - " + config.endDate.toLocaleDateString()
                        : 'Period: All Time';
                    txt += periodText + "\n";
                    txt += "Generated: " + new Date().toLocaleDateString() + " at " + new Date().toLocaleTimeString() + "\n\n";
                    // Add financial summary
                    txt += '─'.repeat(70) + "\n";
                    txt += 'FINANCIAL SUMMARY\n';
                    txt += '─'.repeat(70) + "\n";
                    txt += "Total Revenue:              " + formatCurrency(data.totalInvoiced).padEnd(20) + "\n";
                    txt += "Paid Invoices:              " + formatCurrency(data.paidInvoices).padEnd(20) + "\n";
                    txt += "Outstanding Receivables:    " + formatCurrency(data.outstandingAmount).padEnd(20) + "\n";
                    txt += "Total Expenses:             " + formatCurrency(data.totalExpenses).padEnd(20) + "\n";
                    txt += '─'.repeat(70) + "\n";
                    txt += "Net Profit:                 " + formatCurrency(data.netProfit).padEnd(20) + "\n";
                    txt += headerLine + "\n\n";
                    // Add invoice details if requested
                    if (config.includeDetails && data.invoiceData.length > 0) {
                        txt += '─'.repeat(70) + "\n";
                        txt += 'INVOICE DETAILS\n';
                        txt += '─'.repeat(70) + "\n";
                        txt += "Invoice #".padEnd(15) + " | " + 'Client'.padEnd(15) + " | " + 'Date'.padEnd(12) + " | " + 'Amount'.padEnd(15) + " | Status\n";
                        txt += '-'.repeat(15) + " | " + '-'.repeat(15) + " | " + '-'.repeat(12) + " | " + '-'.repeat(15) + " | " + '-'.repeat(10) + "\n";
                        data.invoiceData.slice(0, 50).forEach(function (inv) {
                            var invNum = (inv.invoiceNumber || 'N/A').substring(0, 14).padEnd(15);
                            var client = ("Client " + (inv.clientId ? inv.clientId.substring(0, 8) : 'N/A')).padEnd(15);
                            var date = new Date(inv.issueDate).toLocaleDateString().padEnd(12);
                            var amount = formatCurrency(inv.total || 0).padEnd(15);
                            var status = (inv.status || 'pending').padEnd(10);
                            txt += invNum + " | " + client + " | " + date + " | " + amount + " | " + status + "\n";
                        });
                        txt += '\n';
                    }
                    // Add expense details if requested
                    if (config.includeDetails && data.expenseData.length > 0) {
                        txt += '─'.repeat(70) + "\n";
                        txt += 'EXPENSE DETAILS\n';
                        txt += '─'.repeat(70) + "\n";
                        txt += 'Description'.padEnd(25) + " | " + 'Category'.padEnd(15) + " | " + 'Amount'.padEnd(15) + " | " + 'Date'.padEnd(12) + " | Status\n";
                        txt += '-'.repeat(25) + " | " + '-'.repeat(15) + " | " + '-'.repeat(15) + " | " + '-'.repeat(12) + " | " + '-'.repeat(10) + "\n";
                        data.expenseData.slice(0, 50).forEach(function (exp) {
                            var desc = (exp.description || 'N/A').substring(0, 24).padEnd(25);
                            var category = (exp.category || 'N/A').substring(0, 14).padEnd(15);
                            var amount = formatCurrency(exp.amount || 0).padEnd(15);
                            var date = new Date(exp.expenseDate).toLocaleDateString().padEnd(12);
                            var status = (exp.status || 'pending').padEnd(10);
                            txt += desc + " | " + category + " | " + amount + " | " + date + " | " + status + "\n";
                        });
                        txt += '\n';
                    }
                    txt += headerLine + "\n";
                    txt += 'End of Report\n';
                    txt += headerLine + "\n";
                    return [2 /*return*/, Buffer.from(txt, 'utf-8')];
            }
        });
    });
}
exports.generateFinancialReportTXT = generateFinancialReportTXT;
/**
 * Generate financial report as JSON
 */
function generateFinancialReportJSON(config) {
    var _a, _b;
    return __awaiter(this, void 0, Promise, function () {
        var data, reportData;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, fetchFinancialData(config)];
                case 1:
                    data = _c.sent();
                    reportData = {
                        title: config.title,
                        generated: new Date().toISOString(),
                        period: {
                            startDate: ((_a = config.startDate) === null || _a === void 0 ? void 0 : _a.toISOString()) || 'all',
                            endDate: ((_b = config.endDate) === null || _b === void 0 ? void 0 : _b.toISOString()) || 'all'
                        },
                        summary: {
                            totalRevenue: data.totalInvoiced,
                            paidInvoices: data.paidInvoices,
                            outstandingReceivables: data.outstandingAmount,
                            totalExpenses: data.totalExpenses,
                            netProfit: data.netProfit
                        },
                        invoices: config.includeDetails ? data.invoiceData : undefined,
                        expenses: config.includeDetails ? data.expenseData : undefined
                    };
                    return [2 /*return*/, Buffer.from(JSON.stringify(reportData, null, 2), 'utf-8')];
            }
        });
    });
}
exports.generateFinancialReportJSON = generateFinancialReportJSON;
