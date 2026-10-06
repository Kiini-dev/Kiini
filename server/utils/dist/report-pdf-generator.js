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
exports.generateExpenseReportPDF = exports.generateFinancialReportPDF = void 0;
var jspdf_1 = require("jspdf");
var jspdf_autotable_1 = require("jspdf-autotable");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var company_info_1 = require("./company-info");
/**
 * Generate a financial report PDF buffer
 * @param config - Report configuration options
 * @returns Buffer containing the PDF data
 */
function generateFinancialReportPDF(config) {
    return __awaiter(this, void 0, Promise, function () {
        var db, invoicesQuery, expensesQuery, invoiceData, expenseData, totalInvoiced, paidInvoices, outstandingAmount, totalExpenses, netProfit, doc, companyInfo, periodText, formatCurrency_1, summaryData, currentY, invoiceTableData, pageCount, i, error_1;
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
                    _a.trys.push([2, 6, , 7]);
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
                    doc = new jspdf_1.jsPDF();
                    // Set font
                    doc.setFont('helvetica');
                    return [4 /*yield*/, company_info_1.getCompanyInfo()];
                case 5:
                    companyInfo = _a.sent();
                    // Add company header
                    doc.setFontSize(20);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(40, 40, 40);
                    doc.text(companyInfo.name, 20, 20);
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(100, 100, 100);
                    doc.text('Financial Report', 20, 28);
                    // Add report title
                    doc.setFontSize(16);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(40, 40, 40);
                    doc.text(config.title, 20, 40);
                    // Add report period
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(100, 100, 100);
                    periodText = config.startDate && config.endDate
                        ? "Period: " + config.startDate.toLocaleDateString() + " - " + config.endDate.toLocaleDateString()
                        : 'Period: All Time';
                    doc.text(periodText, 20, 48);
                    doc.text("Generated: " + new Date().toLocaleDateString(), 20, 54);
                    // Add summary section
                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(40, 40, 40);
                    doc.text('Financial Summary', 20, 70);
                    formatCurrency_1 = function (amount) {
                        return new Intl.NumberFormat('en-KE', {
                            style: 'currency',
                            currency: 'KES'
                        }).format(amount / 100);
                    };
                    summaryData = [
                        ['Total Revenue', formatCurrency_1(totalInvoiced)],
                        ['Paid Invoices', formatCurrency_1(paidInvoices)],
                        ['Outstanding Receivables', formatCurrency_1(outstandingAmount)],
                        ['Total Expenses', formatCurrency_1(totalExpenses)],
                        ['Net Profit', formatCurrency_1(netProfit)],
                    ];
                    jspdf_autotable_1["default"](doc, {
                        startY: 76,
                        head: [['Metric', 'Amount']],
                        body: summaryData,
                        theme: 'grid',
                        headStyles: {
                            fillColor: [40, 40, 40],
                            textColor: [255, 255, 255],
                            fontStyle: 'bold',
                            fontSize: 10
                        },
                        bodyStyles: {
                            fontSize: 10
                        },
                        columnStyles: {
                            0: { cellWidth: 120 },
                            1: { cellWidth: 70, halign: 'right' }
                        }
                    });
                    // Add invoice details if requested
                    if (config.includeDetails && invoiceData.length > 0) {
                        currentY = doc.lastAutoTable.finalY + 10;
                        doc.setFontSize(12);
                        doc.setFont('helvetica', 'bold');
                        doc.setTextColor(40, 40, 40);
                        doc.text('Invoice Details', 20, currentY);
                        invoiceTableData = invoiceData.slice(0, 20).map(function (inv) { return [
                            inv.invoiceNumber || 'N/A',
                            inv.clientId ? "Client " + inv.clientId.substring(0, 8) : 'N/A',
                            new Date(inv.issueDate).toLocaleDateString(),
                            formatCurrency_1(inv.total || 0),
                            inv.status || 'pending',
                        ]; });
                        jspdf_autotable_1["default"](doc, {
                            startY: currentY + 6,
                            head: [['Invoice #', 'Client', 'Date', 'Amount', 'Status']],
                            body: invoiceTableData,
                            theme: 'grid',
                            headStyles: {
                                fillColor: [50, 50, 50],
                                textColor: [255, 255, 255],
                                fontStyle: 'bold',
                                fontSize: 9
                            },
                            bodyStyles: {
                                fontSize: 8
                            },
                            columnStyles: {
                                0: { cellWidth: 40 },
                                1: { cellWidth: 55 },
                                2: { cellWidth: 35 },
                                3: { cellWidth: 35, halign: 'right' },
                                4: { cellWidth: 25 }
                            }
                        });
                    }
                    pageCount = doc.internal.pages.length - 1;
                    for (i = 1; i <= pageCount; i++) {
                        doc.setPage(i);
                        doc.setFontSize(8);
                        doc.setTextColor(150, 150, 150);
                        doc.text("Page " + i + " of " + pageCount, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10);
                        doc.text('Confidential - For Authorized Use Only', 20, doc.internal.pageSize.getHeight() - 10);
                    }
                    // Return PDF as buffer
                    return [2 /*return*/, Buffer.from(doc.output('arraybuffer'))];
                case 6:
                    error_1 = _a.sent();
                    console.error("Error generating financial report PDF:", error_1);
                    throw new Error("Failed to generate financial report: " + (error_1 instanceof Error ? error_1.message : 'Unknown error'));
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.generateFinancialReportPDF = generateFinancialReportPDF;
/**
 * Generate an expense report PDF buffer
 * @param config - Report configuration options
 * @returns Buffer containing the PDF data
 */
function generateExpenseReportPDF(config) {
    return __awaiter(this, void 0, Promise, function () {
        var db, expensesQuery, expenseData, totalExpenses, expensesByCategory, doc, companyInfo, periodText, formatCurrency, summaryData, currentY, categoryTableData, pageCount, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        throw new Error('Database connection not available');
                    }
                    expensesQuery = db.select().from(schema_1.expenses);
                    if (config.startDate) {
                        expensesQuery = expensesQuery.where(drizzle_orm_1.gte(schema_1.expenses.expenseDate, config.startDate));
                    }
                    if (config.endDate) {
                        expensesQuery = expensesQuery.where(drizzle_orm_1.lte(schema_1.expenses.expenseDate, config.endDate));
                    }
                    return [4 /*yield*/, expensesQuery];
                case 2:
                    expenseData = _a.sent();
                    totalExpenses = expenseData.reduce(function (sum, exp) { return sum + (exp.amount || 0); }, 0);
                    expensesByCategory = {};
                    expenseData.forEach(function (exp) {
                        var category = exp.category || 'Uncategorized';
                        expensesByCategory[category] = (expensesByCategory[category] || 0) + (exp.amount || 0);
                    });
                    doc = new jspdf_1.jsPDF();
                    // Set font
                    doc.setFont('helvetica');
                    return [4 /*yield*/, company_info_1.getCompanyInfo()];
                case 3:
                    companyInfo = _a.sent();
                    // Add company header
                    doc.setFontSize(20);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(40, 40, 40);
                    doc.text(companyInfo.name, 20, 20);
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(100, 100, 100);
                    doc.text('Expense Report', 20, 28);
                    // Add report title
                    doc.setFontSize(16);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(40, 40, 40);
                    doc.text(config.title, 20, 40);
                    // Add report period
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(100, 100, 100);
                    periodText = config.startDate && config.endDate
                        ? "Period: " + config.startDate.toLocaleDateString() + " - " + config.endDate.toLocaleDateString()
                        : 'Period: All Time';
                    doc.text(periodText, 20, 48);
                    doc.text("Generated: " + new Date().toLocaleDateString(), 20, 54);
                    // Add summary section
                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(40, 40, 40);
                    doc.text('Expense Summary', 20, 70);
                    formatCurrency = function (amount) {
                        return new Intl.NumberFormat('en-KE', {
                            style: 'currency',
                            currency: 'KES'
                        }).format(amount / 100);
                    };
                    summaryData = [
                        ['Total Expenses', formatCurrency(totalExpenses)],
                        ['Number of Expenses', String(expenseData.length)],
                        ['Average Expense', expenseData.length > 0 ? formatCurrency(totalExpenses / expenseData.length) : 'Ksh 0'],
                    ];
                    jspdf_autotable_1["default"](doc, {
                        startY: 76,
                        head: [['Metric', 'Amount']],
                        body: summaryData,
                        theme: 'grid',
                        headStyles: {
                            fillColor: [40, 40, 40],
                            textColor: [255, 255, 255],
                            fontStyle: 'bold',
                            fontSize: 10
                        },
                        bodyStyles: {
                            fontSize: 10
                        },
                        columnStyles: {
                            0: { cellWidth: 120 },
                            1: { cellWidth: 70, halign: 'right' }
                        }
                    });
                    // Add category breakdown if requested
                    if (config.includeDetails && Object.keys(expensesByCategory).length > 0) {
                        currentY = doc.lastAutoTable.finalY + 10;
                        doc.setFontSize(12);
                        doc.setFont('helvetica', 'bold');
                        doc.setTextColor(40, 40, 40);
                        doc.text('Expenses by Category', 20, currentY);
                        categoryTableData = Object.entries(expensesByCategory).map(function (_a) {
                            var category = _a[0], amount = _a[1];
                            return [
                                category,
                                formatCurrency(amount),
                                totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) + "%" : '0%',
                            ];
                        });
                        jspdf_autotable_1["default"](doc, {
                            startY: currentY + 6,
                            head: [['Category', 'Amount', 'Percentage']],
                            body: categoryTableData,
                            theme: 'grid',
                            headStyles: {
                                fillColor: [50, 50, 50],
                                textColor: [255, 255, 255],
                                fontStyle: 'bold',
                                fontSize: 9
                            },
                            bodyStyles: {
                                fontSize: 8
                            },
                            columnStyles: {
                                0: { cellWidth: 80 },
                                1: { cellWidth: 50, halign: 'right' },
                                2: { cellWidth: 30, halign: 'right' }
                            }
                        });
                    }
                    pageCount = doc.internal.pages.length - 1;
                    for (i = 1; i <= pageCount; i++) {
                        doc.setPage(i);
                        doc.setFontSize(8);
                        doc.setTextColor(150, 150, 150);
                        doc.text("Page " + i + " of " + pageCount, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10);
                        doc.text('Confidential - For Authorized Use Only', 20, doc.internal.pageSize.getHeight() - 10);
                    }
                    // Return PDF as buffer
                    return [2 /*return*/, Buffer.from(doc.output('arraybuffer'))];
            }
        });
    });
}
exports.generateExpenseReportPDF = generateExpenseReportPDF;
