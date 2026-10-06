"use strict";
exports.__esModule = true;
var react_1 = require("react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var spinner_1 = require("@/components/ui/spinner");
var lucide_react_1 = require("lucide-react");
var wouter_1 = require("wouter");
var trpc_1 = require("@/lib/trpc");
var permissions_1 = require("@/lib/permissions");
var utils_1 = require("@/lib/utils");
function Accounting() {
    // CALL ALL HOOKS UNCONDITIONALLY AT TOP LEVEL
    var _a = permissions_1.useRequireFeature("accounting:invoices:view"), allowed = _a.allowed, isLoading = _a.isLoading;
    var _b = wouter_1.useLocation(), navigate = _b[1];
    var _c = react_1.useState({
        totalInvoices: 0,
        totalPayments: 0,
        totalExpenses: 0,
        totalRevenue: 0,
        netProfit: 0
    }), financialData = _c[0], setFinancialData = _c[1];
    // Fetch accounting data from backend
    var _d = trpc_1.trpc.invoices.list.useQuery({}).data, invoices = _d === void 0 ? [] : _d;
    var _e = trpc_1.trpc.payments.list.useQuery({}).data, payments = _e === void 0 ? [] : _e;
    var _f = trpc_1.trpc.expenses.list.useQuery({}).data, expenses = _f === void 0 ? [] : _f;
    // Calculate financial metrics
    react_1.useEffect(function () {
        // Defensive check to ensure all data is available and is an array before proceeding
        if (!Array.isArray(invoices) || !Array.isArray(payments) || !Array.isArray(expenses)) {
            return;
        }
        var totalRevenue = invoices.reduce(function (sum, inv) { return sum + (inv.total || 0); }, 0) / 100;
        var totalExpensesAmount = expenses.reduce(function (sum, exp) { return sum + (exp.amount || 0); }, 0) / 100;
        var netProfit = totalRevenue - totalExpensesAmount;
        var newData = {
            totalInvoices: invoices.length,
            totalPayments: payments.length,
            totalExpenses: expenses.length,
            totalRevenue: totalRevenue,
            netProfit: netProfit
        };
        // avoid state churn if values unchanged
        setFinancialData(function (prev) {
            if (prev.totalInvoices === newData.totalInvoices &&
                prev.totalPayments === newData.totalPayments &&
                prev.totalExpenses === newData.totalExpenses &&
                prev.totalRevenue === newData.totalRevenue &&
                prev.netProfit === newData.netProfit) {
                return prev;
            }
            return newData;
        });
    }, [invoices, payments, expenses]);
    // NOW SAFE TO CHECK CONDITIONAL RETURNS (ALL HOOKS ALREADY CALLED)
    if (isLoading) {
        return (React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" })));
    }
    if (!allowed) {
        return null;
    }
    var accountingModules = [
        {
            title: "Invoices",
            description: "Create and manage client invoices",
            icon: lucide_react_1.FileText,
            href: "/invoices",
            stats: { label: "Total Invoices", value: financialData.totalInvoices.toString() },
            borderColor: "border-l-blue-500",
            iconBg: "bg-blue-50 dark:bg-blue-950",
            iconColor: "text-blue-500"
        },
        {
            title: "Payments",
            description: "Track incoming and outgoing payments",
            icon: lucide_react_1.DollarSign,
            href: "/payments",
            stats: { label: "Total Payments", value: financialData.totalPayments.toString() },
            borderColor: "border-l-green-500",
            iconBg: "bg-green-50 dark:bg-green-950",
            iconColor: "text-green-500"
        },
        {
            title: "Expenses",
            description: "Record and manage business expenses",
            icon: lucide_react_1.Receipt,
            href: "/expenses",
            stats: { label: "Total Expenses", value: financialData.totalExpenses.toString() },
            borderColor: "border-l-orange-500",
            iconBg: "bg-orange-50 dark:bg-orange-950",
            iconColor: "text-orange-500"
        },
        {
            title: "Chart of Accounts",
            description: "Manage your accounting structure",
            icon: lucide_react_1.BarChart3,
            href: "/chart-of-accounts",
            stats: { label: "Accounts", value: "0" },
            borderColor: "border-l-purple-500",
            iconBg: "bg-purple-50 dark:bg-purple-950",
            iconColor: "text-purple-500"
        },
    ];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Accounting", href: "/accounting" },
        ], title: "Accounting", description: "Manage invoices, payments, and financial records", icon: React.createElement(lucide_react_1.CreditCard, { className: "w-6 h-6" }) },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "flex gap-3 flex-wrap" },
                React.createElement(button_1.Button, { onClick: function () { return navigate("/invoices/create"); }, className: "gap-2" },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
                    "New Invoice"),
                React.createElement(button_1.Button, { onClick: function () { return navigate("/payments/create"); }, variant: "outline", className: "gap-2" },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
                    "New Payment"),
                React.createElement(button_1.Button, { onClick: function () { return navigate("/expenses/create"); }, variant: "outline", className: "gap-2" },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
                    "New Expense")),
            React.createElement("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4" }, accountingModules.map(function (module) {
                var Icon = module.icon;
                return (React.createElement("button", { key: module.title, onClick: function () { return navigate(module.href); }, className: utils_1.cn("group relative overflow-hidden rounded-xl border-l-4 p-4 sm:p-5 text-left transition-all duration-300", "bg-white dark:bg-slate-800/60 border-t border-r border-b border-slate-200 dark:border-slate-700", "hover:shadow-xl hover:-translate-y-1 cursor-pointer", module.borderColor) },
                    React.createElement("div", { className: "absolute inset-0 opacity-0 group-hover:opacity-[0.07] transition-opacity duration-300 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 pointer-events-none" }),
                    React.createElement("div", { className: "relative" },
                        React.createElement("div", { className: "flex items-center justify-between mb-3" },
                            React.createElement("div", { className: "p-2.5 rounded-lg " + module.iconBg },
                                React.createElement(Icon, { className: "h-5 w-5 " + module.iconColor })),
                            React.createElement(lucide_react_1.ArrowRight, { className: "h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" })),
                        React.createElement("h3", { className: "font-bold text-sm text-slate-900 dark:text-slate-50" }, module.title),
                        React.createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400 mt-1" }, module.description),
                        React.createElement("div", { className: "mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50" },
                            React.createElement("p", { className: "text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400" }, module.stats.label),
                            React.createElement("p", { className: "text-xl font-bold text-slate-900 dark:text-slate-50 mt-0.5" }, module.stats.value))),
                    React.createElement("div", { className: "absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-gradient-to-r from-transparent via-current to-transparent" })));
            })),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Financial Summary"),
                    React.createElement(card_1.CardDescription, null, "Overview of your financial position")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Total Revenue"),
                            React.createElement("p", { className: "text-2xl font-bold" },
                                "Ksh ",
                                financialData.totalRevenue.toLocaleString('en-KE', { maximumFractionDigits: 0 }))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Total Expenses"),
                            React.createElement("p", { className: "text-2xl font-bold" },
                                "Ksh ",
                                (financialData.totalRevenue - financialData.netProfit).toLocaleString('en-KE', { maximumFractionDigits: 0 }))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Outstanding Invoices"),
                            React.createElement("p", { className: "text-2xl font-bold" }, financialData.totalInvoices)),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Net Profit"),
                            React.createElement("p", { className: "text-2xl font-bold " + (financialData.netProfit >= 0 ? 'text-green-600' : 'text-red-600') },
                                "Ksh ",
                                financialData.netProfit.toLocaleString('en-KE', { maximumFractionDigits: 0 })))))))));
}
exports["default"] = Accounting;
