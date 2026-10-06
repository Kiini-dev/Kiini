"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var trpc_1 = require("@/lib/trpc");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var ICTDashboardNav_1 = require("@/components/ICTDashboardNav");
function ICTDashboard() {
    var _a = permissions_1.useRequireRole(["ict_manager", "super_admin", "admin"]), allowed = _a.allowed, isLoading = _a.isLoading;
    var _b = wouter_1.useLocation(), navigate = _b[1];
    var _c = react_1.useState(false), menuOpen = _c[0], setMenuOpen = _c[1];
    var _d = react_1.useState({
        systemHealth: 95,
        activeUsers: 0,
        emailQueue: 0,
        uptime: "99.9%"
    }), metrics = _d[0], setMetrics = _d[1];
    // Fetch analytics and system metrics
    var dashboardMetrics = trpc_1.trpc.dashboard.metrics.useQuery({}, {
        enabled: allowed
    }).data;
    react_1.useEffect(function () {
        if (dashboardMetrics) {
            setMetrics({
                systemHealth: 95,
                activeUsers: dashboardMetrics.activeClients || 0,
                emailQueue: 0,
                uptime: "99.9%"
            });
        }
    }, [dashboardMetrics]);
    if (isLoading) {
        return (React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" })));
    }
    if (!allowed) {
        return null;
    }
    var ictFeatures = [
        {
            title: "System Settings",
            description: "Configure system-wide settings and preferences",
            icon: React.createElement(lucide_react_1.Settings, { className: "w-8 h-8" }),
            href: "/admin/management",
            color: "from-blue-500 to-blue-600",
            stat: { label: "Health", value: metrics.systemHealth + "%" }
        },
        {
            title: "Email Queue",
            description: "Monitor and manage email sending operations",
            icon: React.createElement(lucide_react_1.Mail, { className: "w-8 h-8" }),
            href: "/communications",
            color: "from-purple-500 to-purple-600",
            stat: { label: "Pending", value: metrics.emailQueue }
        },
        {
            title: "System Analytics",
            description: "View system performance and usage analytics",
            icon: React.createElement(lucide_react_1.BarChart3, { className: "w-8 h-8" }),
            href: "/reports",
            color: "from-green-500 to-green-600",
            stat: { label: "Active Users", value: metrics.activeUsers }
        },
        {
            title: "Data Management",
            description: "View dashboards and data metrics",
            icon: React.createElement(lucide_react_1.Database, { className: "w-8 h-8" }),
            href: "/dashboard",
            color: "from-orange-500 to-orange-600",
            stat: { label: "Uptime", value: metrics.uptime }
        },
        {
            title: "Security & Access",
            description: "Monitor user sessions and security",
            icon: React.createElement(lucide_react_1.Shield, { className: "w-8 h-8" }),
            href: "/admin/management",
            color: "from-red-500 to-red-600",
            stat: { label: "Status", value: "Secure" }
        },
        {
            title: "System Activity",
            description: "Review system logs and activity",
            icon: React.createElement(lucide_react_1.Activity, { className: "w-8 h-8" }),
            href: "/activity",
            color: "from-cyan-500 to-cyan-600",
            stat: { label: "Status", value: "Normal" }
        },
    ];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "ICT Manager Dashboard", description: "System administration, monitoring, and technical management", icon: React.createElement(lucide_react_1.Settings, { className: "h-5 w-5" }), actions: React.createElement(button_1.Button, { variant: "outline", className: "gap-2 lg:hidden", onClick: function () { return setMenuOpen(!menuOpen); } },
            React.createElement(lucide_react_1.Menu, { className: "h-4 w-4" }),
            "Menu") },
        React.createElement("div", { className: "grid gap-8 lg:grid-cols-[280px_1fr]" },
            React.createElement("aside", { className: "hidden lg:block" },
                React.createElement(ICTDashboardNav_1["default"], { isOpen: true })),
            React.createElement("div", { className: "space-y-8" },
                React.createElement("div", { className: "text-center space-y-4 py-4" },
                    React.createElement("h2", { className: "text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" }, "ICT Manager Dashboard"),
                    React.createElement("p", { className: "text-xl text-muted-foreground max-w-2xl mx-auto" }, "System administration, monitoring, and technical management")),
                React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                    React.createElement(card_1.Card, { className: "border-l-4 border-l-blue-500" },
                        React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
                            React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "System Health"),
                            React.createElement(lucide_react_1.CheckCircle2, { className: "h-4 w-4 text-blue-500" })),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("div", { className: "text-2xl font-bold" },
                                metrics.systemHealth,
                                "%"),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Overall system status"))),
                    React.createElement(card_1.Card, { className: "border-l-4 border-l-green-500" },
                        React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
                            React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Active Users"),
                            React.createElement(lucide_react_1.TrendingUp, { className: "h-4 w-4 text-green-500" })),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("div", { className: "text-2xl font-bold" }, metrics.activeUsers),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Currently online"))),
                    React.createElement(card_1.Card, { className: "border-l-4 border-l-purple-500" },
                        React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
                            React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Email Queue"),
                            React.createElement(lucide_react_1.Mail, { className: "h-4 w-4 text-purple-500" })),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("div", { className: "text-2xl font-bold" }, metrics.emailQueue),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Pending emails"))),
                    React.createElement(card_1.Card, { className: "border-l-4 border-l-yellow-500" },
                        React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
                            React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Uptime"),
                            React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-yellow-500" })),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("div", { className: "text-2xl font-bold" }, metrics.uptime),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "System availability")))),
                React.createElement("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3" }, ictFeatures.map(function (feature) { return (React.createElement(card_1.Card, { key: feature.href, className: "cursor-pointer hover:shadow-lg hover:shadow-primary/10 transition-all group hover:scale-105 border-2 hover:border-primary/50", onClick: function () { return navigate(feature.href); } },
                    React.createElement(card_1.CardHeader, null,
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", { className: "p-3 rounded-lg bg-gradient-to-br " + feature.color + " text-white" }, feature.icon),
                            React.createElement(lucide_react_1.ArrowRight, { className: "h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" })),
                        React.createElement(card_1.CardTitle, { className: "mt-4" }, feature.title),
                        React.createElement(card_1.CardDescription, null, feature.description)),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement(button_1.Button, { variant: "ghost", className: "w-full group-hover:bg-accent" }, "Access"),
                            React.createElement("span", { className: "text-sm font-semibold text-muted-foreground" }, feature.stat.value))))); })),
                React.createElement("div", { className: "space-y-4" },
                    React.createElement("h3", { className: "text-2xl font-bold" }, "Troubleshooting & Support"),
                    React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                        React.createElement(button_1.Button, { variant: "outline", className: "h-auto p-4 justify-start", onClick: function () { return navigate("/admin/management"); } },
                            React.createElement(lucide_react_1.Shield, { className: "h-5 w-5 mr-3" }),
                            React.createElement("div", { className: "text-left" },
                                React.createElement("div", { className: "font-semibold" }, "System Administration"),
                                React.createElement("div", { className: "text-sm text-muted-foreground" }, "Manage users, roles & permissions"))),
                        React.createElement(button_1.Button, { variant: "outline", className: "h-auto p-4 justify-start", onClick: function () { return navigate("/tools"); } },
                            React.createElement(lucide_react_1.Settings, { className: "h-5 w-5 mr-3" }),
                            React.createElement("div", { className: "text-left" },
                                React.createElement("div", { className: "font-semibold" }, "Tools & Utilities"),
                                React.createElement("div", { className: "text-sm text-muted-foreground" }, "Access system tools and utilities"))),
                        React.createElement(button_1.Button, { variant: "outline", className: "h-auto p-4 justify-start", onClick: function () { return navigate("/activity"); } },
                            React.createElement(lucide_react_1.Activity, { className: "h-5 w-5 mr-3" }),
                            React.createElement("div", { className: "text-left" },
                                React.createElement("div", { className: "font-semibold" }, "System Activity"),
                                React.createElement("div", { className: "text-sm text-muted-foreground" }, "Review system logs and events"))),
                        React.createElement(button_1.Button, { variant: "outline", className: "h-auto p-4 justify-start", onClick: function () { return navigate("/documentation"); } },
                            React.createElement(lucide_react_1.Lock, { className: "h-5 w-5 mr-3" }),
                            React.createElement("div", { className: "text-left" },
                                React.createElement("div", { className: "font-semibold" }, "Documentation"),
                                React.createElement("div", { className: "text-sm text-muted-foreground" }, "Technical documentation & guides"))))),
                React.createElement(card_1.Card, { className: "bg-gradient-to-r from-slate-900 to-slate-800 border-slate-700 text-white" },
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "System Information"),
                        React.createElement(card_1.CardDescription, { className: "text-slate-400" }, "Current system status and details")),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-3" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-slate-400" }, "System Status"),
                                React.createElement("p", { className: "text-lg font-semibold flex items-center gap-2" },
                                    React.createElement("span", { className: "w-2 h-2 rounded-full bg-green-500" }),
                                    "Operational")),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-slate-400" }, "Database"),
                                React.createElement("p", { className: "text-lg font-semibold flex items-center gap-2" },
                                    React.createElement("span", { className: "w-2 h-2 rounded-full bg-green-500" }),
                                    "Connected")),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-slate-400" }, "API Status"),
                                React.createElement("p", { className: "text-lg font-semibold flex items-center gap-2" },
                                    React.createElement("span", { className: "w-2 h-2 rounded-full bg-green-500" }),
                                    "Responding")))))))));
}
exports["default"] = ICTDashboard;
