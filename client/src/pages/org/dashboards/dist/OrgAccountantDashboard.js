"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var useAuthWithPersistence_1 = require("@/_core/hooks/useAuthWithPersistence");
var wouter_1 = require("wouter");
var react_1 = require("react");
var currency_1 = require("@/lib/currency");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var stats_card_1 = require("@/components/ui/stats-card");
function AccountantDashboard() {
    var _a, _b;
    var _c = useAuthWithPersistence_1.useAuthWithPersistence({
        redirectOnUnauthenticated: true
    }), user = _c.user, loading = _c.loading, isAuthenticated = _c.isAuthenticated, logout = _c.logout;
    var formatCurrency = currency_1.useCurrency().format;
    var _d = wouter_1.useLocation(), setLocation = _d[1];
    var utils = trpc_1.trpc.useUtils();
    // Fetch dashboard metrics and data
    var _e = trpc_1.trpc.dashboard.metrics.useQuery(), metrics = _e.data, metricsLoading = _e.isLoading;
    var accountingMetrics = trpc_1.trpc.dashboard.accountingMetrics.useQuery().data;
    var recentInvoices = trpc_1.trpc.invoices.list.useQuery({ limit: 5 }).data;
    var recentExpenses = trpc_1.trpc.expenses.list.useQuery({ limit: 5 }).data;
    var recentPayments = trpc_1.trpc.payments.list.useQuery({ limit: 5 }).data;
    var reconciliationData = trpc_1.trpc.settings.getBankReconciliation.useQuery().data;
    var pendingApprovals = trpc_1.trpc.approvals.getPendingApprovals.useQuery().data;
    var metricsPlain = metrics !== null && metrics !== void 0 ? metrics : null;
    var recentInvoicesPlain = recentInvoices !== null && recentInvoices !== void 0 ? recentInvoices : [];
    var recentExpensesPlain = recentExpenses !== null && recentExpenses !== void 0 ? recentExpenses : [];
    var recentPaymentsPlain = recentPayments !== null && recentPayments !== void 0 ? recentPayments : [];
    var reconciliationDataPlain = reconciliationData !== null && reconciliationData !== void 0 ? reconciliationData : null;
    var pendingApprovalsPlain = pendingApprovals !== null && pendingApprovals !== void 0 ? pendingApprovals : [];
    // Mutations for approvals
    var approveInvoice = trpc_1.trpc.approvals.approveInvoice.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Invoice approved");
            utils.approvals.getPendingApprovals.invalidate();
            utils.invoices.list.invalidate();
        }
    });
    var approveExpense = trpc_1.trpc.approvals.approveExpense.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Expense approved");
            utils.approvals.getPendingApprovals.invalidate();
            utils.expenses.list.invalidate();
        }
    });
    react_1.useEffect(function () {
        if (!loading && isAuthenticated && (user === null || user === void 0 ? void 0 : user.role) !== "accountant" && (user === null || user === void 0 ? void 0 : user.role) !== "super_admin") {
            setLocation("/dashboard");
        }
    }, [loading, isAuthenticated, user, setLocation]);
    if (loading) {
        return (React.createElement("div", { className: "min-h-screen flex items-center justify-center" },
            React.createElement("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" })));
    }
    var totalRevenue = (accountingMetrics === null || accountingMetrics === void 0 ? void 0 : accountingMetrics.totalRevenue) ? Number(accountingMetrics.totalRevenue) / 100
        : 0;
    var totalExpenses = (accountingMetrics === null || accountingMetrics === void 0 ? void 0 : accountingMetrics.totalExpenses) ? Number(accountingMetrics.totalExpenses) / 100
        : 0;
    var netProfit = totalRevenue - totalExpenses;
    var recentTransactions = __spreadArrays((Array.isArray(recentInvoicesPlain) ? recentInvoicesPlain.map(function (inv) { return ({
        type: 'invoice',
        description: "Invoice " + (inv.invoiceNumber || inv.id),
        subtext: inv.clientName || 'Client Payment',
        amount: (inv.total || 0) / 100,
        date: inv.createdAt,
        isPositive: true
    }); }) : []), (Array.isArray(recentExpensesPlain) ? recentExpensesPlain.map(function (exp) { return ({
        type: 'expense',
        description: exp.description || exp.category || 'Expense',
        subtext: exp.category || 'Business Expense',
        amount: (exp.amount || 0) / 100,
        date: exp.date || exp.createdAt,
        isPositive: false
    }); }) : [])).sort(function (a, b) { return new Date(b.date).getTime() - new Date(a.date).getTime(); }).slice(0, 5);
    // Module features for navigation
    var features = [
        {
            title: "Projects",
            description: "Manage and track all your projects",
            icon: lucide_react_1.FolderKanban,
            href: "/projects",
            color: "text-blue-500",
            bgColor: "bg-blue-50 dark:bg-blue-950"
        },
        {
            title: "Clients",
            description: "Client relationship management",
            icon: lucide_react_1.Users,
            href: "/clients",
            color: "text-green-500",
            bgColor: "bg-green-50 dark:bg-green-950"
        },
        {
            title: "Invoices",
            description: "Create and manage invoices",
            icon: lucide_react_1.FileText,
            href: "/invoices",
            color: "text-purple-500",
            bgColor: "bg-purple-50 dark:bg-purple-950"
        },
        {
            title: "Estimates",
            description: "Generate quotations and estimates",
            icon: lucide_react_1.Receipt,
            href: "/estimates",
            color: "text-orange-500",
            bgColor: "bg-orange-50 dark:bg-orange-950"
        },
        {
            title: "Payments",
            description: "Track payments and transactions",
            icon: lucide_react_1.DollarSign,
            href: "/payments",
            color: "text-emerald-500",
            bgColor: "bg-emerald-50 dark:bg-emerald-950"
        },
        {
            title: "Products",
            description: "Product catalog management",
            icon: lucide_react_1.Package,
            href: "/products",
            color: "text-cyan-500",
            bgColor: "bg-cyan-50 dark:bg-cyan-950"
        },
        {
            title: "Services",
            description: "Service offerings catalog",
            icon: lucide_react_1.Briefcase,
            href: "/services",
            color: "text-indigo-500",
            bgColor: "bg-indigo-50 dark:bg-indigo-950"
        },
        {
            title: "Accounting",
            description: "Financial management and reports",
            icon: lucide_react_1.CreditCard,
            href: "/accounting",
            color: "text-pink-500",
            bgColor: "bg-pink-50 dark:bg-pink-950"
        },
        {
            title: "Reports",
            description: "Analytics and insights",
            icon: lucide_react_1.BarChart3,
            href: "/reports",
            color: "text-amber-500",
            bgColor: "bg-amber-50 dark:bg-amber-950"
        },
        {
            title: "HR",
            description: "Human resources management",
            icon: lucide_react_1.UserCog,
            href: "/hr",
            color: "text-rose-500",
            bgColor: "bg-rose-50 dark:bg-rose-950"
        },
        {
            title: "Communications",
            description: "Email, SMS, and messaging",
            icon: lucide_react_1.Mail,
            href: "/communications",
            color: "text-teal-500",
            bgColor: "bg-teal-50 dark:bg-teal-950"
        },
    ];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Accountant Dashboard", description: "Manage invoices, expenses, financial records, and approve transactions", icon: React.createElement(lucide_react_1.Calculator, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/dashboard" }, { label: "Accounting" }], actions: React.createElement("div", { className: "flex gap-2" },
            React.createElement(button_1.Button, { onClick: function () { return setLocation("/accounting/management"); }, variant: "secondary", size: "sm", className: "gap-2" },
                React.createElement(lucide_react_1.Settings, { className: "w-4 h-4" }),
                "Accounting Management"),
            React.createElement(button_1.Button, { variant: "secondary", size: "sm", onClick: function () { return setLocation("/crm-home"); } }, "Go to Main Dashboard")) },
        React.createElement("div", { className: "space-y-8" },
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Revenue", value: React.createElement(React.Fragment, null,
                        "KES ",
                        ((totalRevenue) || 0).toLocaleString()), color: "border-l-orange-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Pending Approvals", value: (((_a = pendingApprovalsPlain === null || pendingApprovalsPlain === void 0 ? void 0 : pendingApprovalsPlain.invoices) === null || _a === void 0 ? void 0 : _a.length) || 0) + (((_b = pendingApprovalsPlain === null || pendingApprovalsPlain === void 0 ? void 0 : pendingApprovalsPlain.expenses) === null || _b === void 0 ? void 0 : _b.length) || 0), color: "border-l-purple-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Total Expenses", value: React.createElement(React.Fragment, null,
                        "KES ",
                        ((totalExpenses) || 0).toLocaleString()), color: "border-l-green-500" }),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-slate-600 dark:text-slate-300" }, "Net Profit")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold " + (netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400') },
                            "KES ",
                            formatCurrency((netProfit) || 0))))),
            React.createElement("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3" }, features.map(function (feature) {
                var Icon = feature.icon;
                return (React.createElement(card_1.Card, { key: feature.href, className: "cursor-pointer hover:shadow-lg hover:shadow-primary/10 transition-all group hover:scale-105 border-2 hover:border-primary/50", onClick: function () { return setLocation(feature.href); } },
                    React.createElement(card_1.CardHeader, null,
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", { className: "p-3 rounded-lg " + feature.bgColor },
                                React.createElement(Icon, { className: "h-6 w-6 " + feature.color })),
                            React.createElement(lucide_react_1.ArrowRight, { className: "h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" })),
                        React.createElement(card_1.CardTitle, { className: "mt-4" }, feature.title),
                        React.createElement(card_1.CardDescription, null, feature.description)),
                    React.createElement(card_1.CardContent, null,
                        React.createElement(button_1.Button, { variant: "ghost", className: "w-full group-hover:bg-accent" },
                            "View ",
                            feature.title))));
            })),
            React.createElement(tabs_1.Tabs, { defaultValue: "overview", className: "space-y-4" },
                React.createElement(tabs_1.TabsList, null,
                    React.createElement(tabs_1.TabsTrigger, { value: "overview" },
                        React.createElement(lucide_react_1.BarChart3, { className: "w-4 h-4 mr-2" }),
                        "Overview"),
                    React.createElement(tabs_1.TabsTrigger, { value: "approvals" },
                        React.createElement(lucide_react_1.CheckCircle, { className: "w-4 h-4 mr-2" }),
                        "Approvals"),
                    React.createElement(tabs_1.TabsTrigger, { value: "reconciliation" },
                        React.createElement(lucide_react_1.CreditCard, { className: "w-4 h-4 mr-2" }),
                        "Bank Reconciliation")),
                React.createElement(tabs_1.TabsContent, { value: "overview", className: "space-y-4" },
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, null,
                                React.createElement(card_1.CardTitle, { className: "text-slate-900 dark:text-slate-50" }, "Recent Transactions")),
                            React.createElement(card_1.CardContent, { className: "space-y-3" }, recentTransactions.map(function (t, i) { return (React.createElement("div", { key: t.id || "trans-" + i, className: "flex justify-between items-center border-b pb-2 last:border-0" },
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-sm font-medium text-slate-900 dark:text-slate-50" }, t.description),
                                    React.createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400" }, t.subtext)),
                                React.createElement("p", { className: "text-sm font-bold " + (t.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400') },
                                    t.isPositive ? '+' : '-',
                                    "KES ",
                                    formatCurrency(((t.amount) || 0))))); }))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, null,
                                React.createElement(card_1.CardTitle, { className: "text-slate-900 dark:text-slate-50" }, "Quick Actions")),
                            React.createElement(card_1.CardContent, { className: "space-y-2" },
                                React.createElement(button_1.Button, { className: "w-full justify-start", onClick: function () { return setLocation("/invoices/create"); } }, "Create Invoice"),
                                React.createElement(button_1.Button, { variant: "outline", className: "w-full justify-start", onClick: function () { return setLocation("/expenses/create"); } }, "Record Expense"),
                                React.createElement(button_1.Button, { variant: "outline", className: "w-full justify-start", onClick: function () { return setLocation("/payments/create"); } }, "Record Payment"))))),
                React.createElement(tabs_1.TabsContent, { value: "approvals", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, { className: "text-slate-900 dark:text-slate-50" }, "Pending Approvals")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("div", { className: "space-y-4" },
                                React.createElement("h3", { className: "font-semibold text-slate-900 dark:text-slate-50" }, "Invoices"),
                                Array.isArray(pendingApprovalsPlain === null || pendingApprovalsPlain === void 0 ? void 0 : pendingApprovalsPlain.invoices) && pendingApprovalsPlain.invoices.map(function (inv) { return (React.createElement("div", { key: inv.id, className: "flex justify-between items-center p-3 border rounded-lg" },
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "font-medium text-slate-900 dark:text-slate-50" }, inv.invoiceNumber),
                                        React.createElement("p", { className: "text-sm text-slate-500 dark:text-slate-400" },
                                            "KES ",
                                            formatCurrency((inv.total || 0)))),
                                    React.createElement(button_1.Button, { size: "sm", onClick: function () { return approveInvoice.mutate({ id: inv.id }); } }, "Approve"))); }),
                                React.createElement("h3", { className: "font-semibold mt-4 text-slate-900 dark:text-slate-50" }, "Expenses"),
                                Array.isArray(pendingApprovalsPlain === null || pendingApprovalsPlain === void 0 ? void 0 : pendingApprovalsPlain.expenses) && pendingApprovalsPlain.expenses.map(function (exp) { return (React.createElement("div", { key: exp.id, className: "flex justify-between items-center p-3 border rounded-lg" },
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "font-medium text-slate-900 dark:text-slate-50" }, exp.category),
                                        React.createElement("p", { className: "text-sm text-slate-500 dark:text-slate-400" },
                                            "KES ",
                                            formatCurrency((exp.amount || 0)))),
                                    React.createElement(button_1.Button, { size: "sm", onClick: function () { return approveExpense.mutate({ id: exp.id }); } }, "Approve"))); }))))),
                React.createElement(tabs_1.TabsContent, { value: "reconciliation", className: "space-y-4" },
                    React.createElement(stats_card_1.StatsCard, { label: "Bank Reconciliation", value: React.createElement(React.Fragment, null, formatCurrency((reconciliationDataPlain === null || reconciliationDataPlain === void 0 ? void 0 : reconciliationDataPlain.revenue) || 0)), color: "border-l-blue-500" }))))));
}
exports["default"] = AccountantDashboard;
