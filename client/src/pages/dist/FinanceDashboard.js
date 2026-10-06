"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var useAuth_1 = require("@/_core/hooks/useAuth");
var trpc_1 = require("@/lib/trpc");
var currency_1 = require("@/lib/currency");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var stats_card_1 = require("@/components/ui/stats-card");
function FinanceDashboard() {
    var _a = currency_1.useCurrency(), formatShort = _a.formatShort, format = _a.format;
    var _b = wouter_1.useLocation(), navigate = _b[1];
    var user = useAuth_1.useAuth().user;
    var _c = react_1.useState({
        totalRevenue: 0,
        pendingInvoices: 0,
        totalExpenses: 0,
        accountBalance: 0
    }), metrics = _c[0], setMetrics = _c[1];
    // Fetch dashboard metrics
    var dashboardMetrics = trpc_1.trpc.dashboard.metrics.useQuery().data;
    react_1.useEffect(function () {
        if (dashboardMetrics) {
            setMetrics({
                totalRevenue: dashboardMetrics.monthlyRevenue || 0,
                pendingInvoices: dashboardMetrics.pendingInvoices || 0,
                totalExpenses: 0,
                accountBalance: (dashboardMetrics.monthlyRevenue || 0) * 0.75
            });
        }
    }, [dashboardMetrics]);
    var financeFeatures = [
        {
            title: "Invoices",
            description: "Create and manage invoices",
            icon: React.createElement(lucide_react_1.FileText, { className: "w-8 h-8" }),
            href: "/invoices",
            color: "from-blue-500 to-blue-600",
            stat: { label: "Pending", value: metrics.pendingInvoices }
        },
        {
            title: "Payments",
            description: "Track payments and transactions",
            icon: React.createElement(lucide_react_1.DollarSign, { className: "w-8 h-8" }),
            href: "/payments",
            color: "from-green-500 to-green-600",
            stat: { label: "This Month", value: formatShort(metrics.totalRevenue) }
        },
        {
            title: "Expenses",
            description: "Manage expenses and costs",
            icon: React.createElement(lucide_react_1.TrendingDown, { className: "w-8 h-8" }),
            href: "/expenses",
            color: "from-orange-500 to-orange-600",
            stat: { label: "Total", value: formatShort(0) }
        },
        {
            title: "Reports",
            description: "Financial reports and analytics",
            icon: React.createElement(lucide_react_1.BarChart3, { className: "w-8 h-8" }),
            href: "/reports",
            color: "from-purple-500 to-purple-600",
            stat: { label: "Balance", value: formatShort((metrics.accountBalance || 0)) }
        },
    ];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Finance Dashboard", description: "Welcome, " + (user === null || user === void 0 ? void 0 : user.name) + ". Monitor your financial performance.", icon: React.createElement(lucide_react_1.DollarSign, { className: "h-6 w-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Finance" },
        ] },
        React.createElement("div", { className: "space-y-8" },
            React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Revenue", value: React.createElement(React.Fragment, null, formatShort(metrics.totalRevenue)), description: "This month", icon: React.createElement(lucide_react_1.TrendingUp, { className: "h-5 w-5" }), color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Pending Invoices", value: metrics.pendingInvoices, description: "Awaiting payment", icon: React.createElement(lucide_react_1.FileText, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Total Expenses", value: formatShort(0), description: "This month", icon: React.createElement(lucide_react_1.TrendingDown, { className: "h-5 w-5" }), color: "border-l-orange-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Account Balance", value: React.createElement(React.Fragment, null, formatShort(metrics.accountBalance)), description: "Available balance", icon: React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }), color: "border-l-purple-500" })),
            React.createElement("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-2" }, financeFeatures.map(function (feature) { return (React.createElement(card_1.Card, { key: feature.href, className: "cursor-pointer hover:shadow-lg hover:shadow-primary/10 transition-all group hover:scale-105 border-2 hover:border-primary/50", onClick: function () { return navigate(feature.href); } },
                React.createElement(card_1.CardHeader, null,
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("div", { className: "p-3 rounded-lg bg-gradient-to-br " + feature.color + " text-white" }, feature.icon),
                        React.createElement(lucide_react_1.ArrowRight, { className: "h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" })),
                    React.createElement(card_1.CardTitle, { className: "mt-4" }, feature.title),
                    React.createElement(card_1.CardDescription, null, feature.description)),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement(button_1.Button, { variant: "ghost", className: "w-full group-hover:bg-accent" },
                            "View ",
                            feature.title),
                        React.createElement("span", { className: "text-sm font-semibold text-muted-foreground" }, feature.stat.value))))); })),
            React.createElement("div", { className: "space-y-4" },
                React.createElement("h3", { className: "text-2xl font-bold" }, "Financial Alerts"),
                React.createElement(card_1.Card, { className: "border-l-4 border-l-blue-500" },
                    React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0" },
                        React.createElement("div", { className: "flex items-center gap-3" },
                            React.createElement(lucide_react_1.AlertCircle, { className: "h-5 w-5 text-blue-500" }),
                            React.createElement("div", null,
                                React.createElement(card_1.CardTitle, { className: "text-sm" }, "Invoices Due Soon"),
                                React.createElement(card_1.CardDescription, null,
                                    metrics.pendingInvoices,
                                    " invoices pending payment")))))))));
}
exports["default"] = FinanceDashboard;
