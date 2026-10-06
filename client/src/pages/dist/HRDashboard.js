"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var useAuth_1 = require("@/_core/hooks/useAuth");
var trpc_1 = require("@/lib/trpc");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var stats_card_1 = require("@/components/ui/stats-card");
function HRDashboard() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var user = useAuth_1.useAuth().user;
    var _b = react_1.useState({
        totalEmployees: 0,
        presentToday: 0,
        onLeave: 0,
        pendingRequests: 0
    }), metrics = _b[0], setMetrics = _b[1];
    // Fetch dashboard metrics
    var dashboardMetrics = trpc_1.trpc.dashboard.metrics.useQuery().data;
    react_1.useEffect(function () {
        if (dashboardMetrics) {
            setMetrics({
                totalEmployees: dashboardMetrics.totalEmployees || 0,
                presentToday: Math.floor((dashboardMetrics.totalEmployees || 0) * 0.85),
                onLeave: Math.floor((dashboardMetrics.totalEmployees || 0) * 0.1),
                pendingRequests: 3
            });
        }
    }, [dashboardMetrics]);
    var hrFeatures = [
        {
            title: "Employees",
            description: "Manage employee records and information",
            icon: React.createElement(lucide_react_1.Users, { className: "w-8 h-8" }),
            href: "/employees",
            color: "from-blue-500 to-blue-600",
            stat: { label: "Total Employees", value: metrics.totalEmployees }
        },
        {
            title: "Attendance",
            description: "Track attendance and check-ins",
            icon: React.createElement(lucide_react_1.Calendar, { className: "w-8 h-8" }),
            href: "/attendance",
            color: "from-green-500 to-green-600",
            stat: { label: "Present Today", value: metrics.presentToday }
        },
        {
            title: "Leave Management",
            description: "Manage leave requests and approvals",
            icon: React.createElement(lucide_react_1.Clock, { className: "w-8 h-8" }),
            href: "/leave-management",
            color: "from-orange-500 to-orange-600",
            stat: { label: "On Leave", value: metrics.onLeave }
        },
        {
            title: "Payroll",
            description: "Process payroll and salary management",
            icon: React.createElement(lucide_react_1.FileText, { className: "w-8 h-8" }),
            href: "/payroll",
            color: "from-purple-500 to-purple-600",
            stat: { label: "Pending", value: 0 }
        },
    ];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "HR Dashboard", description: "Welcome, " + (user === null || user === void 0 ? void 0 : user.name) + ". Manage your human resources from here.", icon: React.createElement(lucide_react_1.Users, { className: "h-6 w-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "HR" },
        ] },
        React.createElement("div", { className: "space-y-8" },
            React.createElement("div", { className: "grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Employees", value: metrics.totalEmployees, description: "Active employees", icon: React.createElement(lucide_react_1.Users, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Present Today", value: metrics.presentToday, description: "Checked in", icon: React.createElement(lucide_react_1.CheckCircle2, { className: "h-5 w-5" }), color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "On Leave", value: metrics.onLeave, description: "Currently away", icon: React.createElement(lucide_react_1.Clock, { className: "h-5 w-5" }), color: "border-l-yellow-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Pending Requests", value: metrics.pendingRequests, description: "Awaiting approval", icon: React.createElement(lucide_react_1.AlertCircle, { className: "h-5 w-5" }), color: "border-l-red-500" })),
            React.createElement("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-2" }, hrFeatures.map(function (feature) { return (React.createElement(card_1.Card, { key: feature.href, className: "cursor-pointer hover:shadow-lg hover:shadow-primary/10 transition-all group hover:scale-105 border-2 hover:border-primary/50", onClick: function () { return navigate(feature.href); } },
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
                React.createElement("h3", { className: "text-2xl font-bold" }, "Quick Actions"),
                React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                    React.createElement(button_1.Button, { variant: "outline", className: "h-auto p-4 justify-start", onClick: function () { return navigate("/employees/create"); } },
                        React.createElement(lucide_react_1.Users, { className: "h-5 w-5 mr-3" }),
                        React.createElement("div", { className: "text-left" },
                            React.createElement("div", { className: "font-semibold" }, "Add New Employee"),
                            React.createElement("div", { className: "text-sm text-muted-foreground" }, "Create a new employee record"))),
                    React.createElement(button_1.Button, { variant: "outline", className: "h-auto p-4 justify-start", onClick: function () { return navigate("/attendance/create"); } },
                        React.createElement(lucide_react_1.Calendar, { className: "h-5 w-5 mr-3" }),
                        React.createElement("div", { className: "text-left" },
                            React.createElement("div", { className: "font-semibold" }, "Record Attendance"),
                            React.createElement("div", { className: "text-sm text-muted-foreground" }, "Mark attendance for today"))))))));
}
exports["default"] = HRDashboard;
