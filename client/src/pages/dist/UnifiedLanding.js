"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var useAuthWithPersistence_1 = require("@/_core/hooks/useAuthWithPersistence");
var DashboardLayout_1 = require("@/components/DashboardLayout");
var trpc_1 = require("@/lib/trpc");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
function UnifiedLanding() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var user = useAuthWithPersistence_1.useAuthWithPersistence().user;
    var _b = react_1.useState({
        totalProjects: 0,
        activeClients: 0,
        pendingInvoices: 0,
        monthlyRevenue: 0,
        totalProducts: 0,
        totalServices: 0,
        totalEmployees: 0,
        totalExpenses: 0,
        budgetsCount: 0,
        lprosCount: 0
    }), metrics = _b[0], setMetrics = _b[1];
    // Fetch dashboard metrics
    var rawDashboardMetrics = trpc_1.trpc.dashboard.metrics.useQuery({}).data;
    // Convert frozen Drizzle objects to plain objects to avoid React error #306
    var dashboardMetrics = rawDashboardMetrics ? JSON.parse(JSON.stringify(rawDashboardMetrics)) : null;
    react_1.useEffect(function () {
        if (dashboardMetrics) {
            setMetrics({
                totalProjects: dashboardMetrics.totalProjects || 0,
                activeClients: dashboardMetrics.activeClients || 0,
                pendingInvoices: dashboardMetrics.pendingInvoices || 0,
                monthlyRevenue: dashboardMetrics.monthlyRevenue || 0,
                totalProducts: dashboardMetrics.totalProducts || 0,
                totalServices: dashboardMetrics.totalServices || 0,
                totalEmployees: dashboardMetrics.totalEmployees || 0,
                totalExpenses: dashboardMetrics.totalExpenses || 0,
                budgetsCount: dashboardMetrics.budgetsCount || 0,
                lprosCount: dashboardMetrics.lprosCount || 0
            });
        }
    }, [dashboardMetrics]);
    // Get role-specific welcome message
    var getRoleWelcome = function () {
        var roleMessages = {
            super_admin: {
                greeting: "System Overview",
                subtitle: "Monitor all operations and system health"
            },
            admin: { greeting: "Administration Panel", subtitle: "Manage users and system settings" },
            accountant: { greeting: "Financial Dashboard", subtitle: "Track accounting and finances" },
            hr: { greeting: "HR Management", subtitle: "Manage employees and payroll" },
            project_manager: {
                greeting: "Project Command Center",
                subtitle: "Track projects and team performance"
            },
            staff: { greeting: "Staff Dashboard", subtitle: "View your tasks and projects" },
            client: { greeting: "Client Portal", subtitle: "Access your projects and invoices" },
            user: { greeting: "Dashboard", subtitle: "Manage your work" }
        };
        return roleMessages[(user === null || user === void 0 ? void 0 : user.role) || "user"] || roleMessages.user;
    };
    // Define quick actions based on role
    var getQuickActions = function () {
        var baseActions = [
            {
                id: "clients",
                title: "Clients",
                description: "Manage client relationships",
                icon: react_1["default"].createElement(lucide_react_1.Users, { className: "w-8 h-8" }),
                href: "/clients",
                color: "from-green-500 to-green-600",
                stats: { label: "Active", value: metrics.activeClients }
            },
            {
                id: "projects",
                title: "Projects",
                description: "Track project progress",
                icon: react_1["default"].createElement(lucide_react_1.FolderKanban, { className: "w-8 h-8" }),
                href: "/projects",
                color: "from-blue-500 to-blue-600",
                stats: { label: "Total", value: metrics.totalProjects }
            },
            {
                id: "invoices",
                title: "Invoices",
                description: "Create and manage invoices",
                icon: react_1["default"].createElement(lucide_react_1.FileText, { className: "w-8 h-8" }),
                href: "/invoices",
                color: "from-purple-500 to-purple-600",
                stats: { label: "Pending", value: metrics.pendingInvoices }
            },
            {
                id: "payments",
                title: "Payments",
                description: "Track payments and receipts",
                icon: react_1["default"].createElement(lucide_react_1.DollarSign, { className: "w-8 h-8" }),
                href: "/payments",
                color: "from-emerald-500 to-emerald-600",
                stats: { label: "This Month", value: "Ksh " + (metrics.monthlyRevenue || 0).toLocaleString() }
            },
        ];
        // Role-specific actions
        var roleSpecificActions = {
            super_admin: [
                {
                    id: "admin",
                    title: "Administration",
                    description: "System settings and users",
                    icon: react_1["default"].createElement(lucide_react_1.UserCog, { className: "w-8 h-8" }),
                    href: "/admin/management",
                    color: "from-red-500 to-red-600"
                },
                {
                    id: "reports",
                    title: "Reports",
                    description: "System analytics",
                    icon: react_1["default"].createElement(lucide_react_1.BarChart3, { className: "w-8 h-8" }),
                    href: "/reports",
                    color: "from-amber-500 to-amber-600"
                },
            ],
            accountant: [
                {
                    id: "accounting",
                    title: "Accounting",
                    description: "Account management",
                    icon: react_1["default"].createElement(lucide_react_1.CreditCard, { className: "w-8 h-8" }),
                    href: "/accounting",
                    color: "from-pink-500 to-pink-600",
                    stats: { label: "Accounts", value: 0 }
                },
                {
                    id: "expenses",
                    title: "Expenses",
                    description: "Track expenses",
                    icon: react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "w-8 h-8" }),
                    href: "/expenses",
                    color: "from-orange-500 to-orange-600",
                    stats: { label: "Total", value: metrics.totalExpenses }
                },
                {
                    id: "budgets",
                    title: "Budgets",
                    description: "Budget allocation",
                    icon: react_1["default"].createElement(lucide_react_1.Target, { className: "w-8 h-8" }),
                    href: "/budgets",
                    color: "from-indigo-500 to-indigo-600",
                    stats: { label: "Active", value: metrics.budgetsCount }
                },
            ],
            hr: [
                {
                    id: "employees",
                    title: "Employees",
                    description: "Manage team members",
                    icon: react_1["default"].createElement(lucide_react_1.Users, { className: "w-8 h-8" }),
                    href: "/employees",
                    color: "from-cyan-500 to-cyan-600",
                    stats: { label: "Total", value: metrics.totalEmployees }
                },
                {
                    id: "payroll",
                    title: "Payroll",
                    description: "Process payroll",
                    icon: react_1["default"].createElement(lucide_react_1.DollarSign, { className: "w-8 h-8" }),
                    href: "/payroll",
                    color: "from-lime-500 to-lime-600"
                },
                {
                    id: "attendance",
                    title: "Attendance",
                    description: "Track attendance",
                    icon: react_1["default"].createElement(lucide_react_1.Calendar, { className: "w-8 h-8" }),
                    href: "/attendance",
                    color: "from-rose-500 to-rose-600"
                },
            ],
            project_manager: [
                {
                    id: "tasks",
                    title: "Team Tasks",
                    description: "Manage team tasks",
                    icon: react_1["default"].createElement(lucide_react_1.CheckCircle2, { className: "w-8 h-8" }),
                    href: "/projects",
                    color: "from-violet-500 to-violet-600"
                },
                {
                    id: "timeline",
                    title: "Milestones",
                    description: "Project milestones",
                    icon: react_1["default"].createElement(lucide_react_1.Zap, { className: "w-8 h-8" }),
                    href: "/project-milestones",
                    color: "from-fuchsia-500 to-fuchsia-600"
                },
            ]
        };
        return __spreadArrays(baseActions, (roleSpecificActions[(user === null || user === void 0 ? void 0 : user.role) || "user"] || []));
    };
    // Get metrics for the overview section
    var getOverviewMetrics = function () {
        var baseMetrics = [
            {
                title: "Total Projects",
                value: metrics.totalProjects,
                description: "Projects in progress",
                icon: react_1["default"].createElement(lucide_react_1.FolderKanban, { className: "w-5 h-5" }),
                color: "border-l-blue-500 bg-blue-50 dark:bg-blue-900/20",
                href: "/projects"
            },
            {
                title: "Active Clients",
                value: metrics.activeClients,
                description: "Client relationships",
                icon: react_1["default"].createElement(lucide_react_1.Users, { className: "w-5 h-5" }),
                color: "border-l-green-500 bg-green-50 dark:bg-green-900/20",
                href: "/clients"
            },
            {
                title: "Pending Invoices",
                value: metrics.pendingInvoices,
                description: "Awaiting payment",
                icon: react_1["default"].createElement(lucide_react_1.FileText, { className: "w-5 h-5" }),
                color: "border-l-purple-500 bg-purple-50 dark:bg-purple-900/20",
                href: "/invoices"
            },
            {
                title: "Monthly Revenue",
                value: "KES " + (metrics.monthlyRevenue || 0).toLocaleString(),
                description: "This month",
                icon: react_1["default"].createElement(lucide_react_1.TrendingUp, { className: "w-5 h-5" }),
                color: "border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
                href: "/payments"
            },
        ];
        // Add role-specific metrics
        if ((user === null || user === void 0 ? void 0 : user.role) === "accountant") {
            baseMetrics.push({
                title: "Total Expenses",
                value: "KES " + (metrics.totalExpenses || 0).toLocaleString(),
                description: "Current period",
                icon: react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "w-5 h-5" }),
                color: "border-l-orange-500 bg-orange-50 dark:bg-orange-900/20",
                href: "/expenses"
            });
        }
        if ((user === null || user === void 0 ? void 0 : user.role) === "hr") {
            baseMetrics.push({
                title: "Total Employees",
                value: metrics.totalEmployees,
                description: "On payroll",
                icon: react_1["default"].createElement(lucide_react_1.Users, { className: "w-5 h-5" }),
                color: "border-l-cyan-500 bg-cyan-50 dark:bg-cyan-900/20",
                href: "/employees"
            });
        }
        if ((user === null || user === void 0 ? void 0 : user.role) === "project_manager") {
            baseMetrics.push({
                title: "Active Projects",
                value: metrics.totalProjects,
                description: "Managed projects",
                icon: react_1["default"].createElement(lucide_react_1.FolderKanban, { className: "w-5 h-5" }),
                color: "border-l-violet-500 bg-violet-50 dark:bg-violet-900/20",
                href: "/projects"
            });
        }
        return baseMetrics;
    };
    var roleWelcome = getRoleWelcome();
    var quickActions = getQuickActions();
    var overviewMetrics = getOverviewMetrics();
    return (react_1["default"].createElement(DashboardLayout_1["default"], null,
        react_1["default"].createElement("div", { className: "space-y-8" },
            react_1["default"].createElement("div", { className: "space-y-3" },
                react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                    react_1["default"].createElement(lucide_react_1.Award, { className: "w-6 h-6 text-primary" }),
                    react_1["default"].createElement("h1", { className: "text-4xl font-bold tracking-tight" }, roleWelcome.greeting)),
                react_1["default"].createElement("p", { className: "text-lg text-slate-600 dark:text-slate-400" },
                    "Welcome back, ",
                    (user === null || user === void 0 ? void 0 : user.name) || "User",
                    ". ",
                    roleWelcome.subtitle)),
            react_1["default"].createElement("div", { className: "space-y-3" },
                react_1["default"].createElement("h2", { className: "text-xl font-semibold tracking-tight" }, "Quick Actions"),
                react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" }, quickActions.map(function (action) { return (react_1["default"].createElement("button", { key: action.id, onClick: function () { return navigate(action.href); }, className: "group relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 text-left transition-all hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600" },
                    react_1["default"].createElement("div", { className: utils_1.cn("absolute inset-0 opacity-0 transition-opacity group-hover:opacity-5", "bg-gradient-to-br " + action.color) }),
                    react_1["default"].createElement("div", { className: "relative space-y-4" },
                        react_1["default"].createElement("div", { className: utils_1.cn("inline-flex p-3 rounded-lg text-white", "bg-gradient-to-br " + action.color) }, action.icon),
                        react_1["default"].createElement("div", { className: "space-y-1" },
                            react_1["default"].createElement("h3", { className: "font-semibold text-slate-900 dark:text-slate-100" }, action.title),
                            react_1["default"].createElement("p", { className: "text-sm text-slate-600 dark:text-slate-400" }, action.description)),
                        action.stats && (react_1["default"].createElement("div", { className: "pt-2 border-t border-slate-100 dark:border-slate-700" },
                            react_1["default"].createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400" }, action.stats.label),
                            react_1["default"].createElement("p", { className: "text-lg font-bold text-slate-900 dark:text-slate-100" }, action.stats.value))),
                        react_1["default"].createElement("div", { className: "absolute top-6 right-6 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" },
                            react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "w-5 h-5" }))))); }))),
            react_1["default"].createElement("div", { className: "space-y-3" },
                react_1["default"].createElement("h2", { className: "text-xl font-semibold tracking-tight" }, "Key Metrics"),
                react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" }, overviewMetrics.map(function (metric) { return (react_1["default"].createElement("button", { key: metric.title, onClick: function () { return navigate(metric.href); }, className: utils_1.cn("group relative overflow-hidden rounded-lg border-l-4 p-6 text-left transition-all hover:shadow-lg cursor-pointer", metric.color) },
                    react_1["default"].createElement("div", { className: "flex items-start justify-between" },
                        react_1["default"].createElement("div", { className: "space-y-1" },
                            react_1["default"].createElement("p", { className: "text-sm font-medium text-slate-600 dark:text-slate-400" }, metric.title),
                            react_1["default"].createElement("p", { className: "text-3xl font-bold text-slate-900 dark:text-slate-100" }, metric.value),
                            react_1["default"].createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400" }, metric.description)),
                        react_1["default"].createElement("div", { className: "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" }, metric.icon)))); }))),
            react_1["default"].createElement("div", { className: "space-y-4" },
                react_1["default"].createElement("h2", { className: "text-xl font-semibold tracking-tight" }, "Getting Started"),
                react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                react_1["default"].createElement(lucide_react_1.Zap, { className: "w-4 h-4" }),
                                "Pro Tips")),
                        react_1["default"].createElement(card_1.CardContent, { className: "space-y-3" },
                            react_1["default"].createElement("p", { className: "text-sm text-slate-600 dark:text-slate-400" }, (user === null || user === void 0 ? void 0 : user.role) === "accountant"
                                ? "Streamline your financial management by setting up recurring invoices and automated payment reminders."
                                : (user === null || user === void 0 ? void 0 : user.role) === "hr"
                                    ? "Automate payroll processing and attendance tracking to save time on administrative tasks."
                                    : (user === null || user === void 0 ? void 0 : user.role) === "project_manager"
                                        ? "Use milestones to track project progress and keep your team synchronized."
                                        : (user === null || user === void 0 ? void 0 : user.role) === "super_admin"
                                            ? "Monitor system health and user activity through the administration panel."
                                            : "Use the dashboard to quickly navigate between your most-used modules."))),
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                react_1["default"].createElement(lucide_react_1.Clock, { className: "w-4 h-4" }),
                                "Quick Access")),
                        react_1["default"].createElement(card_1.CardContent, { className: "space-y-2" },
                            react_1["default"].createElement(button_1.Button, { variant: "outline", className: "w-full justify-start", onClick: function () { return navigate("/reports"); } },
                                react_1["default"].createElement(lucide_react_1.BarChart3, { className: "w-4 h-4 mr-2" }),
                                "View Reports"),
                            react_1["default"].createElement(button_1.Button, { variant: "outline", className: "w-full justify-start", onClick: function () { return navigate("/settings"); } },
                                react_1["default"].createElement(lucide_react_1.UserCog, { className: "w-4 h-4 mr-2" }),
                                "Settings"))))),
            (user === null || user === void 0 ? void 0 : user.role) === "super_admin" && (react_1["default"].createElement("div", { className: "space-y-4" },
                react_1["default"].createElement("h2", { className: "text-xl font-semibold tracking-tight" }, "System Status"),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Operational Health"),
                        react_1["default"].createElement(card_1.CardDescription, null, "All systems running normally")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "space-y-3" },
                            react_1["default"].createElement("div", { className: "flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20" },
                                react_1["default"].createElement("span", { className: "text-sm font-medium" }, "Database"),
                                react_1["default"].createElement("span", { className: "flex items-center gap-2 text-sm" },
                                    react_1["default"].createElement("div", { className: "h-2 w-2 rounded-full bg-green-500" }),
                                    "Connected")),
                            react_1["default"].createElement("div", { className: "flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20" },
                                react_1["default"].createElement("span", { className: "text-sm font-medium" }, "API Server"),
                                react_1["default"].createElement("span", { className: "flex items-center gap-2 text-sm" },
                                    react_1["default"].createElement("div", { className: "h-2 w-2 rounded-full bg-green-500" }),
                                    "Running")),
                            react_1["default"].createElement("div", { className: "flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20" },
                                react_1["default"].createElement("span", { className: "text-sm font-medium" }, "Services"),
                                react_1["default"].createElement("span", { className: "flex items-center gap-2 text-sm" },
                                    react_1["default"].createElement("div", { className: "h-2 w-2 rounded-full bg-green-500" }),
                                    "All Active"))))))))));
}
exports["default"] = UnifiedLanding;
