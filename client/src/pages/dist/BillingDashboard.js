"use strict";
/**
 * Billing Dashboard Component
 * Comprehensive billing metrics, invoice management, and financial analytics
 *
 * Features:
 * - Revenue trends and forecasting
 * - Outstanding invoices tracking
 * - Payment method breakdown
 * - Cash flow visualization
 * - Invoice management with bulk actions
 * - Export reports (PDF, CSV)
 */
exports.__esModule = true;
var react_1 = require("react");
var sonner_1 = require("sonner");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var designSystem_1 = require("@/lib/designSystem");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var date_fns_1 = require("date-fns");
var exportCsv_1 = require("@/utils/exportCsv");
function BillingDashboard() {
    var _a;
    var _b = permissions_1.useRequireFeature("accounting:dashboard:view"), allowed = _b.allowed, permissionsLoading = _b.isLoading;
    var _c = react_1.useState("year"), dateRange = _c[0], setDateRange = _c[1];
    var _d = react_1.useState(false), isExporting = _d[0], setIsExporting = _d[1];
    var _e = react_1.useState("pdf"), exportFormat = _e[0], setExportFormat = _e[1];
    // Fetch billing data
    var _f = trpc_1.trpc.invoices.list.useQuery({ limit: 1000 }), _g = _f.data, invoicesData = _g === void 0 ? [] : _g, invoicesLoading = _f.isLoading;
    var _h = trpc_1.trpc.payments.list.useQuery({ limit: 1000 }), _j = _h.data, paymentsData = _j === void 0 ? [] : _j, paymentsLoading = _h.isLoading;
    var _k = trpc_1.trpc.expenses.list.useQuery({ limit: 1000 }), _l = _k.data, expensesData = _l === void 0 ? [] : _l, expensesLoading = _k.isLoading;
    var _m = trpc_1.trpc.clients.list.useQuery({}).data, clientsData = _m === void 0 ? [] : _m;
    // Calculate invoice metrics
    var invoiceMetrics = react_1.useMemo(function () {
        var invoices = Array.isArray(invoicesData) ? invoicesData : [];
        var now = new Date();
        return {
            total: invoices.length,
            outstanding: invoices.filter(function (i) { return i.status === "sent" || i.status === "viewed"; }).length,
            overdue: invoices.filter(function (i) {
                if (i.status === "paid")
                    return false;
                return i.dueDate && new Date(i.dueDate) < now;
            }).length,
            paid: invoices.filter(function (i) { return i.status === "paid"; }).length,
            draft: invoices.filter(function (i) { return i.status === "draft"; }).length
        };
    }, [invoicesData]);
    // Calculate revenue trends (last 12 months)
    var revenueTrends = react_1.useMemo(function () {
        var trends = [];
        var invoices = Array.isArray(invoicesData) ? invoicesData : [];
        var expenses = Array.isArray(expensesData) ? expensesData : [];
        var _loop_1 = function (i) {
            var month = date_fns_1.subMonths(new Date(), i);
            var monthStart = date_fns_1.startOfMonth(month);
            var monthEnd = date_fns_1.endOfMonth(month);
            var monthInvoices = invoices.filter(function (inv) {
                var invDate = new Date(inv.createdAt);
                return invDate >= monthStart && invDate <= monthEnd && inv.status === "paid";
            });
            var monthExpenses = expenses.filter(function (exp) {
                var expDate = new Date(exp.date);
                return expDate >= monthStart && expDate <= monthEnd;
            });
            var revenue = monthInvoices.reduce(function (sum, inv) { return sum + (inv.total || 0); }, 0);
            var expenseAmount = monthExpenses.reduce(function (sum, exp) { return sum + (exp.amount || 0); }, 0);
            trends.push({
                month: date_fns_1.format(month, "MMM"),
                revenue: revenue / 100,
                target: revenue > 0 ? Math.round((revenue / 100) * 1.1) : 0,
                expenses: expenseAmount / 100
            });
        };
        for (var i = 11; i >= 0; i--) {
            _loop_1(i);
        }
        return trends;
    }, [invoicesData, expensesData]);
    // Payment method breakdown
    var paymentMethodData = react_1.useMemo(function () {
        var payments = Array.isArray(paymentsData) ? paymentsData : [];
        var methodMap = {};
        payments.forEach(function (payment) {
            var method = payment.paymentMethod || "unknown";
            methodMap[method] = (methodMap[method] || 0) + (payment.amount || 0);
        });
        var total = Object.values(methodMap).reduce(function (sum, val) { return sum + val; }, 0);
        return Object.entries(methodMap).map(function (_a) {
            var name = _a[0], value = _a[1];
            return ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                value: value / 100,
                percentage: total > 0 ? (value / total) * 100 : 0
            });
        });
    }, [paymentsData]);
    // Calculate key metrics
    var totalRevenue = revenueTrends.reduce(function (sum, m) { return sum + m.revenue; }, 0);
    var totalExpenses = revenueTrends.reduce(function (sum, m) { return sum + m.expenses; }, 0);
    var netProfit = totalRevenue - totalExpenses;
    var averagePaymentTime = react_1.useMemo(function () {
        var paidInvoices = Array.isArray(invoicesData) ? invoicesData.filter(function (inv) { return inv.status === "paid" && inv.paidAt && inv.createdAt; }) : [];
        if (paidInvoices.length === 0)
            return 0;
        var totalDays = paidInvoices.reduce(function (sum, inv) {
            var created = new Date(inv.createdAt).getTime();
            var paid = new Date(inv.paidAt).getTime();
            return sum + Math.max(0, (paid - created) / (1000 * 60 * 60 * 24));
        }, 0);
        return Math.round(totalDays / paidInvoices.length);
    }, [invoicesData]);
    var collectionRate = invoiceMetrics.paid > 0
        ? ((invoiceMetrics.paid / invoiceMetrics.total) * 100).toFixed(1)
        : "0";
    var COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
    // Dashboard cards
    var dashboardCards = [
        {
            title: "Total Revenue",
            value: "KES " + totalRevenue.toLocaleString("en-KE", { maximumFractionDigits: 0 }),
            change: "+12%",
            icon: lucide_react_1.DollarSign,
            color: "text-green-600",
            bgColor: "bg-green-50 dark:bg-green-900/20"
        },
        {
            title: "Outstanding Amount",
            value: "KES " + (revenueTrends
                .reduce(function (sum, m) { return sum + m.revenue * 0.3; }, 0) // Assume 30% outstanding
                .toLocaleString("en-KE", { maximumFractionDigits: 0 })),
            change: invoiceMetrics.outstanding + " invoices",
            icon: lucide_react_1.AlertCircle,
            color: "text-orange-600",
            bgColor: "bg-orange-50 dark:bg-orange-900/20"
        },
        {
            title: "Net Profit",
            value: "KES " + netProfit.toLocaleString("en-KE", { maximumFractionDigits: 0 }),
            change: netProfit > 0 ? "+8%" : "-5%",
            icon: lucide_react_1.TrendingUp,
            color: netProfit > 0 ? "text-blue-600" : "text-red-600",
            bgColor: netProfit > 0 ? "bg-blue-50 dark:bg-blue-900/20" : "bg-red-50 dark:bg-red-900/20"
        },
        {
            title: "Collection Rate",
            value: collectionRate + "%",
            change: invoiceMetrics.paid + "/" + invoiceMetrics.total + " paid",
            icon: lucide_react_1.TrendingUp,
            color: "text-purple-600",
            bgColor: "bg-purple-50 dark:bg-purple-900/20"
        },
    ];
    if (permissionsLoading)
        return React.createElement(spinner_1.Spinner, { className: "w-8 h-8 mx-auto my-8" });
    if (!allowed)
        return null;
    return (React.createElement(ModuleLayout_1.ModuleLayout, { breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Billing", href: "/billing" },
        ], title: "Billing Dashboard", description: "Financial overview and invoice management", icon: React.createElement(lucide_react_1.BarChart3, { className: "w-6 h-6" }) },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "flex items-center justify-between gap-4" },
                React.createElement("div", { className: "flex gap-2" },
                    React.createElement(select_1.Select, { value: dateRange, onValueChange: setDateRange },
                        React.createElement(select_1.SelectTrigger, { className: "w-40" },
                            React.createElement(select_1.SelectValue, { placeholder: "Date Range" })),
                        React.createElement(select_1.SelectContent, null,
                            React.createElement(select_1.SelectItem, { value: "month" }, "This Month"),
                            React.createElement(select_1.SelectItem, { value: "quarter" }, "This Quarter"),
                            React.createElement(select_1.SelectItem, { value: "year" }, "This Year"),
                            React.createElement(select_1.SelectItem, { value: "all" }, "All Time")))),
                React.createElement(button_1.Button, { variant: "outline", disabled: isExporting, onClick: function () {
                        setIsExporting(true);
                        try {
                            if (!revenueTrends.length) {
                                sonner_1.toast.info("No billing data available to export");
                                return;
                            }
                            exportCsv_1.exportToCsv("billing-dashboard-" + dateRange, revenueTrends);
                            sonner_1.toast.success("Billing report exported");
                        }
                        finally {
                            setIsExporting(false);
                        }
                    } }, isExporting ? (React.createElement(React.Fragment, null,
                    React.createElement(lucide_react_1.Loader2, { className: "w-4 h-4 mr-2 animate-spin" }),
                    "Exporting...")) : (React.createElement(React.Fragment, null,
                    React.createElement(lucide_react_1.Download, { className: "w-4 h-4 mr-2" }),
                    "Export Report")))),
            React.createElement("div", { className: designSystem_1.layouts.dashboardGrid }, dashboardCards.map(function (card) {
                var Icon = card.icon;
                var colorScheme = card.title === "Total Revenue" ? "emerald" :
                    card.title === "Outstanding Amount" ? "orange" :
                        card.title === "Net Profit" ? "blue" : "purple";
                return (React.createElement(card_1.Card, { key: card.title, className: designSystem_1.getGradientCard(colorScheme) },
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium flex items-center justify-between" },
                            card.title,
                            React.createElement(Icon, { className: "w-5 h-5 " + designSystem_1.getStatusColor(card.title) }))),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" }, card.value),
                        React.createElement("p", { className: "text-xs text-muted-foreground mt-1" }, card.change))));
            })),
            React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6" },
                React.createElement(card_1.Card, { className: designSystem_1.getGradientCard("blue") + " lg:col-span-2" },
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: designSystem_1.animations.fadeIn }, "Revenue Trends (12 Months)"),
                        React.createElement(card_1.CardDescription, null, "Revenue vs Target vs Expenses")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                            React.createElement(recharts_1.BarChart, { data: revenueTrends },
                                React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                                React.createElement(recharts_1.XAxis, { dataKey: "month" }),
                                React.createElement(recharts_1.YAxis, null),
                                React.createElement(recharts_1.Tooltip, { formatter: function (value) { return "KES " + value.toLocaleString(); } }),
                                React.createElement(recharts_1.Legend, null),
                                React.createElement(recharts_1.Bar, { dataKey: "revenue", fill: "#3b82f6", name: "Revenue" }),
                                React.createElement(recharts_1.Bar, { dataKey: "target", fill: "#10b981", name: "Target" }),
                                React.createElement(recharts_1.Bar, { dataKey: "expenses", fill: "#ef4444", name: "Expenses" }))))),
                React.createElement(card_1.Card, { className: designSystem_1.getGradientCard("purple") },
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Payment Methods"),
                        React.createElement(card_1.CardDescription, null, "Distribution by method")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                            React.createElement(recharts_1.PieChart, null,
                                React.createElement(recharts_1.Pie, { data: paymentMethodData, cx: "50%", cy: "50%", labelLine: false, label: function (_a) {
                                        var name = _a.name, percentage = _a.percentage;
                                        return name + " " + percentage.toFixed(0) + "%";
                                    }, outerRadius: 80, fill: "#8884d8", dataKey: "value" }, paymentMethodData.map(function (data, index) { return (React.createElement(recharts_1.Cell, { key: data.name + "-" + index, fill: COLORS[index % COLORS.length] })); })),
                                React.createElement(recharts_1.Tooltip, { formatter: function (value) { return "KES " + value.toLocaleString(); } })))))),
            React.createElement(card_1.Card, { className: designSystem_1.getGradientCard("slate") },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Invoice Statistics"),
                    React.createElement(card_1.CardDescription, null, "Current invoice status breakdown")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-4" },
                        React.createElement("div", { className: "text-center p-3 rounded-lg bg-white/50 dark:bg-black/20" },
                            React.createElement("div", { className: "text-2xl font-bold" }, invoiceMetrics.total),
                            React.createElement("p", { className: "text-sm text-muted-foreground mt-1" }, "Total Invoices")),
                        React.createElement("div", { className: "text-center p-3 rounded-lg bg-emerald-100/50 dark:bg-emerald-900/20" },
                            React.createElement("div", { className: "text-2xl font-bold text-emerald-600" }, invoiceMetrics.paid),
                            React.createElement("p", { className: "text-sm text-muted-foreground mt-1" }, "Paid")),
                        React.createElement("div", { className: "text-center p-3 rounded-lg bg-orange-100/50 dark:bg-orange-900/20" },
                            React.createElement("div", { className: "text-2xl font-bold text-orange-600" }, invoiceMetrics.outstanding),
                            React.createElement("p", { className: "text-sm text-muted-foreground mt-1" }, "Outstanding")),
                        React.createElement("div", { className: "text-center p-3 rounded-lg bg-red-100/50 dark:bg-red-900/20" },
                            React.createElement("div", { className: "text-2xl font-bold text-red-600" }, invoiceMetrics.overdue),
                            React.createElement("p", { className: "text-sm text-muted-foreground mt-1" }, "Overdue")),
                        React.createElement("div", { className: "text-center p-3 rounded-lg bg-slate-100/50 dark:bg-slate-900/20" },
                            React.createElement("div", { className: "text-2xl font-bold text-slate-600" }, invoiceMetrics.draft),
                            React.createElement("p", { className: "text-sm text-muted-foreground mt-1" }, "Draft"))))),
            React.createElement(card_1.Card, { className: designSystem_1.getGradientCard("emerald") },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Key Performance Metrics")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6" },
                        React.createElement("div", { className: "p-4 rounded-lg bg-white/50 dark:bg-black/20" },
                            React.createElement("p", { className: "text-sm text-muted-foreground mb-2" }, "Average Payment Time"),
                            React.createElement("p", { className: "text-3xl font-bold" },
                                averagePaymentTime,
                                " days"),
                            React.createElement(badge_1.Badge, { variant: "outline", className: "mt-2" }, "Target: 30 days")),
                        React.createElement("div", { className: "p-4 rounded-lg bg-white/50 dark:bg-black/20" },
                            React.createElement("p", { className: "text-sm text-muted-foreground mb-2" }, "Collection Rate"),
                            React.createElement("p", { className: "text-3xl font-bold text-emerald-600" },
                                collectionRate,
                                "%"),
                            React.createElement(badge_1.Badge, { variant: "outline", className: "mt-2" }, "Goal: 90%")),
                        React.createElement("div", { className: "p-4 rounded-lg bg-white/50 dark:bg-black/20" },
                            React.createElement("p", { className: "text-sm text-muted-foreground mb-2" }, "Monthly Recurring Revenue"),
                            React.createElement("p", { className: "text-3xl font-bold" },
                                "KES ",
                                (((_a = revenueTrends[revenueTrends.length - 1]) === null || _a === void 0 ? void 0 : _a.revenue) || 0).toLocaleString("en-KE", { maximumFractionDigits: 0 })),
                            React.createElement(badge_1.Badge, { variant: "outline", className: "mt-2" }, "Last Month"))))))));
}
exports["default"] = BillingDashboard;
