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
var react_1 = require("react");
var sonner_1 = require("sonner");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var select_1 = require("@/components/ui/select");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var currency_1 = require("@/lib/currency");
function FinancialDashboard() {
    var _this = this;
    var currencyCode = currency_1.useCurrencySettings().code;
    var formatCurrency = currency_1.useCurrency().format;
    var _a = react_1.useState("month"), dateRange = _a[0], setDateRange = _a[1];
    var _b = react_1.useState("pdf"), exportFormat = _b[0], setExportFormat = _b[1];
    var _c = react_1.useState(false), isExporting = _c[0], setIsExporting = _c[1];
    // Fetch financial data
    var _d = trpc_1.trpc.dashboard.stats.useQuery(), statsData = _d.data, isStatsLoading = _d.isLoading;
    var _e = trpc_1.trpc.invoices.list.useQuery({ limit: 100 }), _f = _e.data, invoicesData = _f === void 0 ? [] : _f, isInvoicesLoading = _e.isLoading;
    var _g = trpc_1.trpc.expenses.list.useQuery({ limit: 100 }), _h = _g.data, expensesData = _h === void 0 ? [] : _h, isExpensesLoading = _g.isLoading;
    // Calculate actual expenses from expenses data
    var totalExpenses = expensesData.reduce(function (sum, expense) { return sum + (expense.amount || 0); }, 0);
    // Calculate total invoiced amount
    var totalInvoiced = invoicesData.reduce(function (sum, invoice) { return sum + (invoice.total || 0); }, 0);
    // Calculate paid invoices
    var paidInvoices = invoicesData.filter(function (inv) { return inv.status === 'paid'; }).reduce(function (sum, inv) { return sum + (inv.total || 0); }, 0);
    // Calculate outstanding invoices
    var outstandingAmount = invoicesData.filter(function (inv) { return inv.status !== 'paid'; }).reduce(function (sum, inv) { return sum + (inv.total || 0); }, 0);
    var financialMetrics = [
        {
            title: "Total Revenue",
            value: (statsData === null || statsData === void 0 ? void 0 : statsData.totalRevenue) || paidInvoices,
            formatted: formatCurrency((statsData === null || statsData === void 0 ? void 0 : statsData.totalRevenue) || paidInvoices),
            change: (statsData === null || statsData === void 0 ? void 0 : statsData.revenueGrowth) || 0,
            icon: lucide_react_1.DollarSign,
            color: "text-green-600",
            bgColor: "bg-green-50 dark:bg-green-900/20"
        },
        {
            title: "Operating Expenses",
            value: totalExpenses,
            formatted: formatCurrency(totalExpenses),
            change: 5,
            icon: lucide_react_1.TrendingUp,
            color: "text-red-600",
            bgColor: "bg-red-50 dark:bg-red-900/20"
        },
        {
            title: "Net Profit",
            value: Math.max(0, ((statsData === null || statsData === void 0 ? void 0 : statsData.totalRevenue) || paidInvoices) - totalExpenses),
            formatted: formatCurrency(Math.max(0, ((statsData === null || statsData === void 0 ? void 0 : statsData.totalRevenue) || paidInvoices) - totalExpenses)),
            change: (statsData === null || statsData === void 0 ? void 0 : statsData.revenueGrowth) || 0,
            icon: lucide_react_1.TrendingUp,
            color: "text-blue-600",
            bgColor: "bg-blue-50 dark:bg-blue-900/20"
        },
        {
            title: "Outstanding Receivables",
            value: outstandingAmount,
            formatted: formatCurrency(outstandingAmount),
            change: 0,
            icon: lucide_react_1.Calendar,
            color: "text-orange-600",
            bgColor: "bg-orange-50 dark:bg-orange-900/20"
        },
    ];
    var exportMutation = trpc_1.trpc.reportExport.generateFinancialReport.useMutation();
    var handleExportReport = function () { return __awaiter(_this, void 0, void 0, function () {
        var result, byteCharacters, byteNumbers, i, byteArray, blob, url, link, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsExporting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, exportMutation.mutateAsync({
                            title: "Financial Report - " + (dateRange === "month" ? "This Month" : dateRange === "quarter" ? "This Quarter" : dateRange === "year" ? "This Year" : "All Time"),
                            format: exportFormat,
                            includeDetails: true
                        })];
                case 2:
                    result = _a.sent();
                    if (result.success && result.data) {
                        byteCharacters = atob(result.data);
                        byteNumbers = new Array(byteCharacters.length);
                        for (i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }
                        byteArray = new Uint8Array(byteNumbers);
                        blob = new Blob([byteArray], { type: result.mimeType || 'application/octet-stream' });
                        url = URL.createObjectURL(blob);
                        link = document.createElement('a');
                        link.href = url;
                        link.download = result.filename || "financial_report." + exportFormat;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                        sonner_1.toast.success("Report exported successfully");
                    }
                    else {
                        sonner_1.toast.error("Failed to export report: " + (result.error || "Unknown error"));
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error("Export failed:", error_1);
                    sonner_1.toast.error("Export failed: " + (error_1 instanceof Error ? error_1.message : "Unknown error"));
                    return [3 /*break*/, 5];
                case 4:
                    setIsExporting(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var breadcrumbs = [
        { label: "Dashboard", href: "/crm-home" },
        { label: "Reports", href: "/reports" },
        { label: "Financial Dashboard" },
    ];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Financial Dashboard", description: "Comprehensive financial overview and analytics", icon: React.createElement(lucide_react_1.BarChart3, { className: "w-6 h-6" }), breadcrumbs: breadcrumbs },
        React.createElement("div", { className: "space-y-6 max-w-7xl" },
            React.createElement("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" },
                React.createElement("div", { className: "flex gap-2" },
                    React.createElement(select_1.Select, { value: dateRange, onValueChange: setDateRange },
                        React.createElement(select_1.SelectTrigger, { className: "w-40" },
                            React.createElement(select_1.SelectValue, null)),
                        React.createElement(select_1.SelectContent, null,
                            React.createElement(select_1.SelectItem, { value: "week" }, "This Week"),
                            React.createElement(select_1.SelectItem, { value: "month" }, "This Month"),
                            React.createElement(select_1.SelectItem, { value: "quarter" }, "This Quarter"),
                            React.createElement(select_1.SelectItem, { value: "year" }, "This Year"),
                            React.createElement(select_1.SelectItem, { value: "all" }, "All Time"))),
                    React.createElement(select_1.Select, { value: exportFormat, onValueChange: function (value) { return setExportFormat(value); } },
                        React.createElement(select_1.SelectTrigger, { className: "w-32" },
                            React.createElement(select_1.SelectValue, null)),
                        React.createElement(select_1.SelectContent, null,
                            React.createElement(select_1.SelectItem, { value: "pdf" }, "PDF Format"),
                            React.createElement(select_1.SelectItem, { value: "csv" }, "CSV Format"),
                            React.createElement(select_1.SelectItem, { value: "txt" }, "Text Format"),
                            React.createElement(select_1.SelectItem, { value: "json" }, "JSON Format")))),
                React.createElement(button_1.Button, { onClick: handleExportReport, disabled: isExporting },
                    isExporting && React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                    React.createElement(lucide_react_1.Download, { className: "mr-2 h-4 w-4" }),
                    "Export Report")),
            React.createElement("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4" }, financialMetrics.map(function (metric) {
                var Icon = metric.icon;
                var isPositive = metric.change >= 0;
                return (React.createElement(card_1.Card, { key: metric.title, className: metric.bgColor },
                    React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, metric.title),
                        React.createElement(Icon, { className: "h-4 w-4 " + metric.color })),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" }, metric.formatted),
                        React.createElement("p", { className: "text-xs mt-2 " + (isPositive ? "text-green-600" : "text-red-600") },
                            isPositive ? "+" : "",
                            metric.change,
                            "% from last period"))));
            })),
            React.createElement("div", { className: "grid gap-6 md:grid-cols-2" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Revenue Breakdown"),
                        React.createElement(card_1.CardDescription, null,
                            "Revenue sources for ",
                            dateRange === "month" ? "this month" : dateRange)),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement("div", { className: "flex justify-between text-sm" },
                                React.createElement("span", null, "Invoiced Revenue"),
                                React.createElement("span", { className: "font-medium" }, formatCurrency(totalInvoiced))),
                            React.createElement("div", { className: "h-2 w-full bg-gray-200 rounded-full" },
                                React.createElement("div", { className: "h-full bg-green-600 rounded-full", style: { width: "100%" } }))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement("div", { className: "flex justify-between text-sm" },
                                React.createElement("span", null, "Paid Amount"),
                                React.createElement("span", { className: "font-medium" }, formatCurrency(paidInvoices))),
                            React.createElement("div", { className: "h-2 w-full bg-gray-200 rounded-full" },
                                React.createElement("div", { className: "h-full bg-blue-600 rounded-full", style: { width: (totalInvoiced > 0 ? (paidInvoices / totalInvoiced) * 100 : 0) + "%" } }))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement("div", { className: "flex justify-between text-sm" },
                                React.createElement("span", null, "Outstanding"),
                                React.createElement("span", { className: "font-medium" }, formatCurrency(outstandingAmount))),
                            React.createElement("div", { className: "h-2 w-full bg-gray-200 rounded-full" },
                                React.createElement("div", { className: "h-full bg-orange-600 rounded-full", style: { width: (totalInvoiced > 0 ? (outstandingAmount / totalInvoiced) * 100 : 0) + "%" } }))))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Expense Summary"),
                        React.createElement(card_1.CardDescription, null,
                            "Expense metrics for ",
                            dateRange === "month" ? "this month" : dateRange)),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement("div", { className: "flex justify-between items-center py-2 border-b" },
                            React.createElement("span", { className: "text-sm" }, "Total Expenses"),
                            React.createElement("span", { className: "font-semibold" }, formatCurrency(totalExpenses))),
                        React.createElement("div", { className: "flex justify-between items-center py-2 border-b" },
                            React.createElement("span", { className: "text-sm" }, "Average Per Transaction"),
                            React.createElement("span", { className: "font-semibold" }, formatCurrency(expensesData && expensesData.length > 0 ? totalExpenses / expensesData.length : 0))),
                        React.createElement("div", { className: "flex justify-between items-center py-2 border-b" },
                            React.createElement("span", { className: "text-sm" }, "Highest Expense"),
                            React.createElement("span", { className: "font-semibold" }, formatCurrency(expensesData && expensesData.length > 0
                                ? Math.max.apply(Math, expensesData.map(function (e) { return e.amount || 0; })) : 0))),
                        React.createElement("div", { className: "flex justify-between items-center py-2" },
                            React.createElement("span", { className: "text-sm" }, "Number of Expenses"),
                            React.createElement("span", { className: "font-semibold" }, (expensesData === null || expensesData === void 0 ? void 0 : expensesData.length) || 0))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Cash Flow Summary"),
                    React.createElement(card_1.CardDescription, null, "Financial summary for selected period")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-3 mb-6" },
                            React.createElement("div", { className: "border-l-4 border-green-600 pl-4" },
                                React.createElement("p", { className: "text-sm text-gray-500" }, "Total Revenue"),
                                React.createElement("p", { className: "text-2xl font-bold text-green-600" }, formatCurrency(totalInvoiced))),
                            React.createElement("div", { className: "border-l-4 border-red-600 pl-4" },
                                React.createElement("p", { className: "text-sm text-gray-500" }, "Total Expenses"),
                                React.createElement("p", { className: "text-2xl font-bold text-red-600" }, formatCurrency(totalExpenses))),
                            React.createElement("div", { className: "border-l-4 " + ((totalInvoiced - totalExpenses) >= 0 ? 'border-blue-600' : 'border-orange-600') + " pl-4" },
                                React.createElement("p", { className: "text-sm text-gray-500" }, "Net Profit"),
                                React.createElement("p", { className: "text-2xl font-bold " + ((totalInvoiced - totalExpenses) >= 0 ? 'text-blue-600' : 'text-orange-600') }, formatCurrency(totalInvoiced - totalExpenses)))),
                        React.createElement("p", { className: "text-sm text-gray-500" },
                            "Last updated: ",
                            date_fns_1.formatDistanceToNow(new Date(), { addSuffix: true }))))))));
}
exports["default"] = FinancialDashboard;
