"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var useAuth_1 = require("@/_core/hooks/useAuth");
var trpc_1 = require("@/lib/trpc");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var DashboardLayout_1 = require("@/components/DashboardLayout");
var lucide_react_1 = require("lucide-react");
function ClientDashboard() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var user = useAuth_1.useAuth().user;
    var _b = react_1.useState({
        activeProjects: 0,
        pendingInvoices: 0,
        totalSpent: 0,
        supportTickets: 0
    }), metrics = _b[0], setMetrics = _b[1];
    // Fetch dashboard metrics
    var dashboardMetrics = trpc_1.trpc.dashboard.metrics.useQuery().data;
    react_1.useEffect(function () {
        if (dashboardMetrics) {
            setMetrics({
                activeProjects: dashboardMetrics.totalProjects || 0,
                pendingInvoices: dashboardMetrics.pendingInvoices || 0,
                totalSpent: dashboardMetrics.monthlyRevenue || 0,
                supportTickets: 2
            });
        }
    }, [dashboardMetrics]);
    var clientFeatures = [
        {
            title: "My Projects",
            description: "View your active projects",
            icon: React.createElement(lucide_react_1.FolderKanban, { className: "w-8 h-8" }),
            href: "/projects",
            color: "from-blue-500 to-blue-600",
            stat: { label: "Active", value: metrics.activeProjects }
        },
        {
            title: "Invoices",
            description: "View and download invoices",
            icon: React.createElement(lucide_react_1.FileText, { className: "w-8 h-8" }),
            href: "/invoices",
            color: "from-green-500 to-green-600",
            stat: { label: "Pending", value: metrics.pendingInvoices }
        },
        {
            title: "Payments",
            description: "View payment history",
            icon: React.createElement(lucide_react_1.DollarSign, { className: "w-8 h-8" }),
            href: "/payments",
            color: "from-purple-500 to-purple-600",
            stat: { label: "Total Spent", value: "KES " + (metrics.totalSpent / 1000).toFixed(1) + "K" }
        },
        {
            title: "Support",
            description: "Contact support team",
            icon: React.createElement(lucide_react_1.MessageSquare, { className: "w-8 h-8" }),
            href: "#",
            color: "from-orange-500 to-orange-600",
            stat: { label: "Open Tickets", value: metrics.supportTickets }
        },
    ];
    return (React.createElement(DashboardLayout_1["default"], null,
        React.createElement("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8" },
            React.createElement("div", { className: "max-w-7xl mx-auto space-y-8" },
                React.createElement("div", { className: "text-center space-y-4 py-4" },
                    React.createElement("h2", { className: "text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" }, "Client Portal"),
                    React.createElement("p", { className: "text-xl text-muted-foreground max-w-2xl mx-auto" },
                        "Welcome back, ", user === null || user === void 0 ? void 0 :
                        user.name,
                        ". Manage your projects and invoices.")),
                React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                    React.createElement(card_1.Card, { className: "border-l-4 border-l-blue-500" },
                        React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
                            React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Active Projects"),
                            React.createElement(lucide_react_1.FolderKanban, { className: "h-4 w-4 text-blue-500" })),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("div", { className: "text-2xl font-bold" }, metrics.activeProjects),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "In progress"))),
                    React.createElement(card_1.Card, { className: "border-l-4 border-l-green-500" },
                        React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
                            React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Pending Invoices"),
                            React.createElement(lucide_react_1.FileText, { className: "h-4 w-4 text-green-500" })),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("div", { className: "text-2xl font-bold" }, metrics.pendingInvoices),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Awaiting payment"))),
                    React.createElement(card_1.Card, { className: "border-l-4 border-l-purple-500" },
                        React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
                            React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Total Spent"),
                            React.createElement(lucide_react_1.DollarSign, { className: "h-4 w-4 text-purple-500" })),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("div", { className: "text-2xl font-bold" },
                                "KES ",
                                (metrics.totalSpent / 1000).toFixed(1),
                                "K"),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "All time"))),
                    React.createElement(card_1.Card, { className: "border-l-4 border-l-orange-500" },
                        React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
                            React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Support Tickets"),
                            React.createElement(lucide_react_1.MessageSquare, { className: "h-4 w-4 text-orange-500" })),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("div", { className: "text-2xl font-bold" }, metrics.supportTickets),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Open tickets")))),
                React.createElement("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-2" }, clientFeatures.map(function (feature) { return (React.createElement(card_1.Card, { key: feature.href, className: "cursor-pointer hover:shadow-lg hover:shadow-primary/10 transition-all group hover:scale-105 border-2 hover:border-primary/50", onClick: function () { return navigate(feature.href); } },
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
                    React.createElement("h3", { className: "text-2xl font-bold" }, "Recent Activity"),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, { className: "text-sm" }, "No recent activity")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Your recent projects and invoices will appear here."))))))));
}
exports["default"] = ClientDashboard;
