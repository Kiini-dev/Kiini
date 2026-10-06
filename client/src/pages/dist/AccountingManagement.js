"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var useAuth_1 = require("@/_core/hooks/useAuth");
var usePermissions_1 = require("@/_core/hooks/usePermissions");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
/**
 * Accounting Management Page
 * Comprehensive accounting and financial management with role-based access control
 * Filters visible items and actions based on user permissions
 */
function AccountingManagement() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var user = useAuth_1.useAuth().user;
    var hasPermission = usePermissions_1.usePermissions(user === null || user === void 0 ? void 0 : user.id).hasPermission;
    // Fetch accounting data
    var _b = trpc_1.trpc.invoices.list.useQuery({}).data, invoices = _b === void 0 ? [] : _b;
    var _c = trpc_1.trpc.payments.list.useQuery({}).data, payments = _c === void 0 ? [] : _c;
    var _d = trpc_1.trpc.expenses.list.useQuery({}).data, expenses = _d === void 0 ? [] : _d;
    var _e = trpc_1.trpc.budgets.list.useQuery({}).data, budgets = _e === void 0 ? [] : _e;
    var _f = trpc_1.trpc.receipts.list.useQuery({}).data, receipts = _f === void 0 ? [] : _f;
    // Calculate financial metrics
    var financialMetrics = react_1.useMemo(function () {
        var totalInvoices = (invoices || []).length;
        var totalPayments = (payments || []).length;
        var totalExpenses = (expenses || []).length;
        var totalBudgets = (budgets || []).length;
        var totalReceipts = (receipts || []).length;
        var invoiceRevenue = invoices.reduce(function (sum, inv) { return sum + (inv.total || 0); }, 0) / 100;
        var expenseAmount = expenses.reduce(function (sum, exp) { return sum + (exp.amount || 0); }, 0) / 100;
        var paymentsProcessed = payments.reduce(function (sum, pmt) { return sum + (pmt.amount || 0); }, 0) / 100;
        return {
            totalInvoices: totalInvoices,
            totalPayments: totalPayments,
            totalExpenses: totalExpenses,
            totalBudgets: totalBudgets,
            totalReceipts: totalReceipts,
            invoiceRevenue: invoiceRevenue,
            expenseAmount: expenseAmount,
            paymentsProcessed: paymentsProcessed,
            netProfit: invoiceRevenue - expenseAmount
        };
    }, [invoices, payments, expenses, budgets, receipts]);
    // Management modules based on permissions
    var managementModules = react_1.useMemo(function () {
        var modules = [];
        // Invoicing Module
        if (hasPermission("invoices_view") || ["super_admin", "admin", "accountant"].includes((user === null || user === void 0 ? void 0 : user.role) || "")) {
            modules.push({
                title: "Invoice Management",
                description: "Create and manage client invoices",
                icon: lucide_react_1.FileText,
                href: "/invoices",
                capability: "invoices_create",
                stats: {
                    label: "Total Invoices",
                    value: financialMetrics.totalInvoices.toString(),
                    trend: "up"
                },
                canCreate: hasPermission("invoices_create") || ["super_admin", "admin", "accountant"].includes((user === null || user === void 0 ? void 0 : user.role) || ""),
                canEdit: hasPermission("invoices_edit") || ["super_admin", "admin"].includes((user === null || user === void 0 ? void 0 : user.role) || ""),
                canDelete: hasPermission("invoices_delete") || ["super_admin"].includes((user === null || user === void 0 ? void 0 : user.role) || "")
            });
        }
        // Payments Module
        if (hasPermission("payments_view") || ["super_admin", "admin", "accountant"].includes((user === null || user === void 0 ? void 0 : user.role) || "")) {
            modules.push({
                title: "Payment Management",
                description: "Track incoming and outgoing payments",
                icon: lucide_react_1.DollarSign,
                href: "/payments",
                capability: "payments_create",
                stats: {
                    label: "Total Payments",
                    value: financialMetrics.totalPayments.toString(),
                    trend: "up"
                },
                canCreate: hasPermission("payments_create") || ["super_admin", "admin", "accountant"].includes((user === null || user === void 0 ? void 0 : user.role) || ""),
                canEdit: hasPermission("payments_edit") || ["super_admin", "admin"].includes((user === null || user === void 0 ? void 0 : user.role) || ""),
                canDelete: hasPermission("payments_delete") || ["super_admin"].includes((user === null || user === void 0 ? void 0 : user.role) || "")
            });
        }
        // Expenses Module
        if (hasPermission("expenses_view") || ["super_admin", "admin", "accountant", "staff"].includes((user === null || user === void 0 ? void 0 : user.role) || "")) {
            modules.push({
                title: "Expense Management",
                description: "Record and manage business expenses",
                icon: lucide_react_1.Receipt,
                href: "/expenses",
                capability: "expenses_create",
                stats: {
                    label: "Total Expenses",
                    value: financialMetrics.totalExpenses.toString(),
                    trend: "down"
                },
                canCreate: hasPermission("expenses_create") || ["super_admin", "admin", "accountant"].includes((user === null || user === void 0 ? void 0 : user.role) || ""),
                canEdit: hasPermission("expenses_edit") || ["super_admin", "admin", "accountant"].includes((user === null || user === void 0 ? void 0 : user.role) || ""),
                canDelete: hasPermission("expenses_delete") || ["super_admin", "admin"].includes((user === null || user === void 0 ? void 0 : user.role) || "")
            });
        }
        // Chart of Accounts Module
        if (["super_admin", "admin", "accountant"].includes((user === null || user === void 0 ? void 0 : user.role) || "")) {
            modules.push({
                title: "Chart of Accounts",
                description: "Manage your accounting structure",
                icon: lucide_react_1.BarChart3,
                href: "/chart-of-accounts",
                capability: "chart_of_accounts_manage",
                stats: {
                    label: "Accounts",
                    value: "N/A"
                },
                canCreate: hasPermission("chart_of_accounts_create") || ["super_admin", "admin"].includes((user === null || user === void 0 ? void 0 : user.role) || ""),
                canEdit: hasPermission("chart_of_accounts_edit") || ["super_admin", "admin"].includes((user === null || user === void 0 ? void 0 : user.role) || ""),
                canDelete: hasPermission("chart_of_accounts_delete") || ["super_admin"].includes((user === null || user === void 0 ? void 0 : user.role) || "")
            });
        }
        // Budgets Module
        if (hasPermission("budgets_view") || ["super_admin", "admin", "accountant", "project_manager"].includes((user === null || user === void 0 ? void 0 : user.role) || "")) {
            modules.push({
                title: "Budget Management",
                description: "Plan and monitor departmental budgets",
                icon: lucide_react_1.PiggyBank,
                href: "/budgets",
                capability: "budgets_create",
                stats: {
                    label: "Total Budgets",
                    value: financialMetrics.totalBudgets.toString()
                },
                canCreate: hasPermission("budgets_create") || ["super_admin", "admin", "accountant"].includes((user === null || user === void 0 ? void 0 : user.role) || ""),
                canEdit: hasPermission("budgets_edit") || ["super_admin", "admin"].includes((user === null || user === void 0 ? void 0 : user.role) || ""),
                canDelete: hasPermission("budgets_delete") || ["super_admin"].includes((user === null || user === void 0 ? void 0 : user.role) || "")
            });
        }
        // Receipts Module
        if (hasPermission("receipts_view") || ["super_admin", "admin", "accountant"].includes((user === null || user === void 0 ? void 0 : user.role) || "")) {
            modules.push({
                title: "Receipt Management",
                description: "Track and approve financial receipts",
                icon: lucide_react_1.Wallet,
                href: "/receipts",
                capability: "receipts_create",
                stats: {
                    label: "Total Receipts",
                    value: financialMetrics.totalReceipts.toString()
                },
                canCreate: hasPermission("receipts_create") || ["super_admin", "admin", "accountant"].includes((user === null || user === void 0 ? void 0 : user.role) || ""),
                canEdit: hasPermission("receipts_edit") || ["super_admin", "admin"].includes((user === null || user === void 0 ? void 0 : user.role) || ""),
                canDelete: hasPermission("receipts_delete") || ["super_admin"].includes((user === null || user === void 0 ? void 0 : user.role) || "")
            });
        }
        // Payment Reconciliation
        if (["super_admin", "admin", "accountant"].includes((user === null || user === void 0 ? void 0 : user.role) || "")) {
            modules.push({
                title: "Payment Reconciliation",
                description: "Reconcile bank statements and payments",
                icon: lucide_react_1.CreditCard,
                href: "/payment-reconciliation",
                capability: "payments_reconcile",
                canCreate: false,
                canEdit: true,
                canDelete: false
            });
        }
        return modules;
    }, [user === null || user === void 0 ? void 0 : user.role, hasPermission, financialMetrics]);
    // Financial Dashboard
    var canViewFinancialReports = hasPermission("financial_reports_view") || ["super_admin", "admin", "accountant"].includes((user === null || user === void 0 ? void 0 : user.role) || "");
    return (React.createElement(ModuleLayout_1.ModuleLayout, { breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Accounting", href: "/accounting" },
            { label: "Management", href: "/accounting/management" },
        ], title: "Accounting Management", description: "Manage financial operations with role-based access control" },
        canViewFinancialReports && (React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-3" },
                    React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Total Revenue")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "flex items-baseline gap-2" },
                        React.createElement("span", { className: "text-2xl font-bold" },
                            "Ksh ",
                            financialMetrics.invoiceRevenue.toLocaleString("en-KE", {
                                minimumFractionDigits: 0
                            })),
                        React.createElement(lucide_react_1.TrendingUp, { className: "w-4 h-4 text-green-600" })),
                    React.createElement("p", { className: "text-xs text-muted-foreground mt-2" },
                        "From ",
                        financialMetrics.totalInvoices,
                        " invoices"))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-3" },
                    React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Total Expenses")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "flex items-baseline gap-2" },
                        React.createElement("span", { className: "text-2xl font-bold" },
                            "Ksh ",
                            financialMetrics.expenseAmount.toLocaleString("en-KE", {
                                minimumFractionDigits: 0
                            })),
                        React.createElement(lucide_react_1.TrendingDown, { className: "w-4 h-4 text-red-600" })),
                    React.createElement("p", { className: "text-xs text-muted-foreground mt-2" },
                        "From ",
                        financialMetrics.totalExpenses,
                        " expenses"))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-3" },
                    React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Net Profit")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "flex items-baseline gap-2" },
                        React.createElement("span", { className: "text-2xl font-bold " + (financialMetrics.netProfit >= 0 ? "text-green-600" : "text-red-600") },
                            "Ksh ",
                            financialMetrics.netProfit.toLocaleString("en-KE", {
                                minimumFractionDigits: 0
                            })),
                        financialMetrics.netProfit >= 0 ? (React.createElement(lucide_react_1.CheckCircle2, { className: "w-4 h-4 text-green-600" })) : (React.createElement(lucide_react_1.AlertCircle, { className: "w-4 h-4 text-red-600" }))),
                    React.createElement("p", { className: "text-xs text-muted-foreground mt-2" }, "Revenue - Expenses"))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-3" },
                    React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Payments Processed")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "flex items-baseline gap-2" },
                        React.createElement("span", { className: "text-2xl font-bold" },
                            "Ksh ",
                            financialMetrics.paymentsProcessed.toLocaleString("en-KE", {
                                minimumFractionDigits: 0
                            }))),
                    React.createElement("p", { className: "text-xs text-muted-foreground mt-2" },
                        financialMetrics.totalPayments,
                        " transactions"))))),
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8" }, managementModules.map(function (module) { return (React.createElement(card_1.Card, { key: module.title, className: "hover:shadow-lg transition-shadow flex flex-col" },
            React.createElement(card_1.CardHeader, null,
                React.createElement("div", { className: "flex items-start justify-between" },
                    React.createElement("div", null,
                        React.createElement(card_1.CardTitle, { className: "text-base" }, module.title),
                        React.createElement(card_1.CardDescription, { className: "text-xs" }, module.description)),
                    React.createElement(module.icon, { className: "w-5 h-5 text-primary" }))),
            React.createElement(card_1.CardContent, { className: "flex-1 flex flex-col justify-between" },
                module.stats && (React.createElement("div", { className: "mb-3 p-2 bg-muted rounded" },
                    React.createElement("p", { className: "text-xs text-muted-foreground" }, module.stats.label),
                    React.createElement("p", { className: "text-lg font-semibold" }, module.stats.value))),
                React.createElement("div", { className: "flex gap-2 mt-4" },
                    React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return navigate(module.href); }, className: "flex-1" }, "Open"),
                    module.canCreate && (React.createElement(button_1.Button, { size: "sm", variant: "ghost", title: "Create new", onClick: function () { return navigate(module.href + "/create"); } },
                        React.createElement(lucide_react_1.Plus, { className: "w-4 h-4" }))))))); })),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Quick Actions")),
            React.createElement(card_1.CardContent, { className: "flex flex-wrap gap-2" },
                hasPermission("invoices_create") && (React.createElement(button_1.Button, { onClick: function () { return navigate("/invoices/create"); }, size: "sm" },
                    React.createElement(lucide_react_1.Plus, { className: "w-4 h-4 mr-2" }),
                    "Create Invoice")),
                hasPermission("payments_create") && (React.createElement(button_1.Button, { onClick: function () { return navigate("/payments/create"); }, size: "sm" },
                    React.createElement(lucide_react_1.Plus, { className: "w-4 h-4 mr-2" }),
                    "Record Payment")),
                hasPermission("expenses_create") && (React.createElement(button_1.Button, { onClick: function () { return navigate("/expenses/create"); }, size: "sm" },
                    React.createElement(lucide_react_1.Plus, { className: "w-4 h-4 mr-2" }),
                    "Add Expense")),
                hasPermission("budgets_create") && (React.createElement(button_1.Button, { onClick: function () { return navigate("/budgets/create"); }, size: "sm" },
                    React.createElement(lucide_react_1.Plus, { className: "w-4 h-4 mr-2" }),
                    "Create Budget")),
                canViewFinancialReports && (React.createElement(button_1.Button, { variant: "outline", onClick: function () { return navigate("/finance/reports"); }, size: "sm" }, "View Financial Reports"))))));
}
exports["default"] = AccountingManagement;
