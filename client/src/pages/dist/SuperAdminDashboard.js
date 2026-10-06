"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var useAuth_1 = require("@/_core/hooks/useAuth");
var trpc_1 = require("@/lib/trpc");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
var lucide_react_2 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var stats_card_1 = require("@/components/ui/stats-card");
function SuperAdminDashboard() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var user = useAuth_1.useAuth().user;
    var _b = react_1.useState({
        totalUsers: 0,
        activeProjects: 0,
        pendingTasks: 0,
        systemHealth: "Healthy",
        totalEmployees: 0
    }), metrics = _b[0], setMetrics = _b[1];
    // Fetch dashboard metrics
    var dashboardMetrics = trpc_1.trpc.dashboard.metrics.useQuery({}).data;
    react_1.useEffect(function () {
        var _a, _b, _c, _d;
        if (dashboardMetrics) {
            setMetrics({
                totalUsers: ((_a = dashboardMetrics) === null || _a === void 0 ? void 0 : _a.totalUsers) || 0,
                activeProjects: ((_b = dashboardMetrics) === null || _b === void 0 ? void 0 : _b.totalProjects) || 0,
                pendingTasks: ((_c = dashboardMetrics) === null || _c === void 0 ? void 0 : _c.pendingInvoices) || 0,
                systemHealth: "Healthy",
                totalEmployees: ((_d = dashboardMetrics) === null || _d === void 0 ? void 0 : _d.totalEmployees) || 0
            });
        }
    }, [dashboardMetrics]);
    var adminFeatures = [
        {
            title: "User Management",
            description: "Manage users, roles, and permissions",
            icon: React.createElement(lucide_react_1.Users, { className: "w-8 h-8" }),
            href: "/settings",
            color: "from-blue-500 to-blue-600",
            stat: { label: "Total Users", value: metrics.totalUsers }
        },
        {
            title: "Project Management",
            description: "Create, manage, and assign projects",
            icon: React.createElement(lucide_react_1.Briefcase, { className: "w-8 h-8" }),
            href: "/projects",
            color: "from-cyan-500 to-blue-600",
            stat: { label: "Active Projects", value: metrics.activeProjects }
        },
        {
            title: "HR Management",
            description: "Manage employees, payroll, and attendance",
            icon: React.createElement(lucide_react_1.Users, { className: "w-8 h-8" }),
            href: "/hr",
            color: "from-green-500 to-emerald-600",
            stat: { label: "Total Employees", value: metrics.totalEmployees }
        },
        {
            title: "Payroll Management",
            description: "Process payroll, benefits, and deductions",
            icon: React.createElement(lucide_react_1.DollarSign, { className: "w-8 h-8" }),
            href: "/payroll",
            color: "from-amber-500 to-orange-600",
            stat: { label: "Pending", value: "0" }
        },
        {
            title: "System Settings",
            description: "Configure system-wide settings",
            icon: React.createElement(lucide_react_1.Settings, { className: "w-8 h-8" }),
            href: "/settings",
            color: "from-purple-500 to-purple-600",
            stat: { label: "Active", value: "Yes" }
        },
        {
            title: "Analytics",
            description: "View system analytics and reports",
            icon: React.createElement(lucide_react_1.BarChart3, { className: "w-8 h-8" }),
            href: "/reports",
            color: "from-pink-500 to-rose-600",
            stat: { label: "Reports", value: "15+" }
        },
    ];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Super Admin", description: "Welcome back, " + (user === null || user === void 0 ? void 0 : user.name) + ". Manage your entire system from here.", icon: React.createElement(lucide_react_2.Shield, { className: "h-6 w-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Administration" },
        ] },
        React.createElement("div", { className: "space-y-8" },
            React.createElement("div", { className: "bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200" },
                React.createElement("h3", { className: "text-lg font-semibold mb-4 text-blue-900" }, "Quick Actions"),
                React.createElement("div", { className: "grid gap-3 md:grid-cols-2 lg:grid-cols-4" },
                    React.createElement(button_1.Button, { className: "bg-blue-600 hover:bg-blue-700", onClick: function () { return navigate("/projects/create"); } },
                        React.createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
                        "Create Project"),
                    React.createElement(button_1.Button, { className: "bg-green-600 hover:bg-green-700", onClick: function () { return navigate("/projects"); } },
                        React.createElement(lucide_react_1.Briefcase, { className: "mr-2 h-4 w-4" }),
                        "Manage Projects"),
                    React.createElement(button_1.Button, { className: "bg-purple-600 hover:bg-purple-700", onClick: function () { return navigate("/employees/create"); } },
                        React.createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
                        "Add Employee"),
                    React.createElement(button_1.Button, { className: "bg-orange-600 hover:bg-orange-700", onClick: function () { return navigate("/payroll/create"); } },
                        React.createElement(lucide_react_1.FileText, { className: "mr-2 h-4 w-4" }),
                        "Process Payroll"))),
            React.createElement("div", { className: "grid gap-4 md:grid-cols-4 lg:grid-cols-5" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Users", value: String(metrics.totalUsers || 0), description: "Registered users", icon: React.createElement(lucide_react_1.Users, { className: "h-5 w-5" }), color: "border-l-blue-500", onClick: function () { return navigate("/admin/management"); } }),
                React.createElement(stats_card_1.StatsCard, { label: "Active Projects", value: String(metrics.activeProjects || 0), description: "Currently running", icon: React.createElement(lucide_react_1.Briefcase, { className: "h-5 w-5" }), color: "border-l-cyan-500", onClick: function () { return navigate("/projects"); } }),
                React.createElement(stats_card_1.StatsCard, { label: "Employees", value: String(metrics.totalEmployees || 0), description: "Total staff", icon: React.createElement(lucide_react_1.Users, { className: "h-5 w-5" }), color: "border-l-green-500", onClick: function () { return navigate("/employees"); } }),
                React.createElement(stats_card_1.StatsCard, { label: "Pending Tasks", value: String(metrics.pendingTasks || 0), description: "Awaiting action", icon: React.createElement(lucide_react_1.Clock, { className: "h-5 w-5" }), color: "border-l-yellow-500", onClick: function () { return navigate("/tasks"); } }),
                React.createElement(stats_card_1.StatsCard, { label: "System Status", value: String(metrics.systemHealth || "OK"), description: "All operational", icon: React.createElement(lucide_react_1.CheckCircle2, { className: "h-5 w-5" }), color: "border-l-green-600", onClick: function () { return navigate("/admin/management"); } })),
            React.createElement("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3" }, adminFeatures.map(function (feature) { return (React.createElement(card_1.Card, { key: feature.href, className: "cursor-pointer hover:shadow-lg hover:shadow-primary/10 transition-all group hover:scale-105 border-2 hover:border-primary/50", onClick: function () { return navigate(feature.href); } },
                React.createElement(card_1.CardHeader, null,
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("div", { className: "p-3 rounded-lg bg-gradient-to-br " + feature.color + " text-white" }, feature.icon),
                        React.createElement(lucide_react_1.ArrowRight, { className: "h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" })),
                    React.createElement(card_1.CardTitle, { className: "mt-4" }, feature.title),
                    React.createElement(card_1.CardDescription, null, feature.description)),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement(button_1.Button, { variant: "ghost", className: "w-full group-hover:bg-accent" },
                            "Manage ",
                            feature.title.split(" ")[0]),
                        React.createElement("span", { className: "text-sm font-semibold text-muted-foreground" }, String(feature.stat.value || "0")))))); })),
            React.createElement("div", { className: "space-y-4" },
                React.createElement("h3", { className: "text-2xl font-bold" }, "System Status"),
                React.createElement(card_1.Card, { className: "border-l-4 border-l-green-500" },
                    React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0" },
                        React.createElement("div", { className: "flex items-center gap-3" },
                            React.createElement(lucide_react_1.CheckCircle2, { className: "h-5 w-5 text-green-500" }),
                            React.createElement("div", null,
                                React.createElement(card_1.CardTitle, { className: "text-sm" }, "All Systems Operational"),
                                React.createElement(card_1.CardDescription, null, "No critical issues detected. Database and services running smoothly.")))))))));
}
exports["default"] = SuperAdminDashboard;
