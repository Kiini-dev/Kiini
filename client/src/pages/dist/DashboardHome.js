"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var useAuth_1 = require("@/_core/hooks/useAuth");
var DashboardLayout_1 = require("@/components/DashboardLayout");
var trpc_1 = require("@/lib/trpc");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
function DashboardHome() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var user = useAuth_1.useAuth().user;
    var _b = react_1.useState({
        totalProjects: 0,
        activeClients: 0,
        pendingInvoices: 0,
        monthlyRevenue: 0,
        totalProducts: 0,
        totalServices: 0,
        totalEmployees: 0
    }), metrics = _b[0], setMetrics = _b[1];
    // Fetch dashboard metrics
    var dashboardMetrics = trpc_1.trpc.dashboard.metrics.useQuery({}).data;
    var financialSummary = trpc_1.trpc.dashboard.financialSummary.useQuery({}).data;
    var monthlyChart = trpc_1.trpc.dashboard.monthlyChart.useQuery({}).data;
    var accountingMetrics = trpc_1.trpc.dashboard.accountingMetrics.useQuery({}).data;
    var _c = trpc_1.trpc.dashboard.recentActivity.useQuery({ limit: 8 }).data, recentActivities = _c === void 0 ? [] : _c;
    var dashboardStats = trpc_1.trpc.dashboard.stats.useQuery({}).data;
    // Update metrics when data loads
    react_1.useEffect(function () {
        if (dashboardMetrics) {
            setMetrics({
                totalProjects: dashboardMetrics.totalProjects || 0,
                activeClients: dashboardMetrics.activeClients || 0,
                pendingInvoices: dashboardMetrics.pendingInvoices || 0,
                monthlyRevenue: dashboardMetrics.monthlyRevenue || 0,
                totalProducts: dashboardMetrics.totalProducts || 0,
                totalServices: dashboardMetrics.totalServices || 0,
                totalEmployees: dashboardMetrics.totalEmployees || 0
            });
        }
    }, [dashboardMetrics]);
    var handleCardClick = function (href) {
        navigate(href);
    };
    // Memoize quickActions to prevent unnecessary re-renders
    var quickActions = react_1.useMemo(function () { return [
        {
            id: "projects",
            title: "Projects",
            description: "Manage and track all your projects",
            icon: react_1["default"].createElement(lucide_react_1.FolderKanban, { className: "w-8 h-8" }),
            href: "/projects",
            color: "from-blue-500 to-blue-600",
            stats: { label: "Total Projects", value: metrics.totalProjects.toString() }
        },
        {
            id: "clients",
            title: "Clients",
            description: "Client relationship management",
            icon: react_1["default"].createElement(lucide_react_1.Users, { className: "w-8 h-8" }),
            href: "/clients",
            color: "from-green-500 to-green-600",
            stats: { label: "Active Clients", value: metrics.activeClients.toString() }
        },
        {
            id: "invoices",
            title: "Invoices",
            description: "Create and manage invoices",
            icon: react_1["default"].createElement(lucide_react_1.FileText, { className: "w-8 h-8" }),
            href: "/invoices",
            color: "from-purple-500 to-purple-600",
            stats: { label: "Pending Invoices", value: metrics.pendingInvoices.toString() }
        },
        {
            id: "estimates",
            title: "Estimates",
            description: "Generate quotations and estimates",
            icon: react_1["default"].createElement(lucide_react_1.Receipt, { className: "w-8 h-8" }),
            href: "/estimates",
            color: "from-orange-500 to-orange-600",
            stats: { label: "Pending Estimates", value: "0" }
        },
        {
            id: "payments",
            title: "Payments",
            description: "Track payments and transactions",
            icon: react_1["default"].createElement(lucide_react_1.DollarSign, { className: "w-8 h-8" }),
            href: "/payments",
            color: "from-green-500 to-emerald-600",
            stats: { label: "This Month", value: "KES " + ((metrics.monthlyRevenue) || 0).toLocaleString() }
        },
        {
            id: "products",
            title: "Products",
            description: "Product catalog management",
            icon: react_1["default"].createElement(lucide_react_1.Package, { className: "w-8 h-8" }),
            href: "/products",
            color: "from-cyan-500 to-cyan-600",
            stats: { label: "Total Products", value: metrics.totalProducts.toString() }
        },
        {
            id: "services",
            title: "Services",
            description: "Service offerings catalog",
            icon: react_1["default"].createElement(lucide_react_1.Briefcase, { className: "w-8 h-8" }),
            href: "/services",
            color: "from-indigo-500 to-indigo-600",
            stats: { label: "Total Services", value: metrics.totalServices.toString() }
        },
        {
            id: "accounting",
            title: "Accounting",
            description: "Financial management and reports",
            icon: react_1["default"].createElement(lucide_react_1.CreditCard, { className: "w-8 h-8" }),
            href: "/accounting",
            color: "from-pink-500 to-pink-600",
            stats: { label: "Accounts", value: "0" }
        },
        {
            id: "reports",
            title: "Reports",
            description: "Analytics and insights",
            icon: react_1["default"].createElement(lucide_react_1.BarChart3, { className: "w-8 h-8" }),
            href: "/reports",
            color: "from-amber-500 to-amber-600",
            stats: { label: "Reports", value: "0" }
        },
        {
            id: "hr",
            title: "HR",
            description: "Human resources management",
            icon: react_1["default"].createElement(lucide_react_1.UserCog, { className: "w-8 h-8" }),
            href: "/hr",
            color: "from-red-500 to-red-600",
            stats: { label: "Employees", value: metrics.totalEmployees.toString() }
        },
        {
            id: "procurement",
            title: "Procurement",
            description: "Manage suppliers, purchase orders, and budgets",
            icon: react_1["default"].createElement(lucide_react_1.Package, { className: "w-8 h-8" }),
            href: "/procurement",
            color: "from-teal-500 to-teal-600",
            stats: { label: "Modules", value: "6" }
        },
        {
            id: "suppliers",
            title: "Suppliers",
            description: "Manage your suppliers and vendor information",
            icon: react_1["default"].createElement(lucide_react_1.Briefcase, { className: "w-8 h-8" }),
            href: "/suppliers",
            color: "from-cyan-500 to-cyan-600",
            stats: { label: "Suppliers", value: "0" }
        },
        {
            id: "departments",
            title: "Departments",
            description: "Organize and manage company departments",
            icon: react_1["default"].createElement(lucide_react_1.Users, { className: "w-8 h-8" }),
            href: "/departments",
            color: "from-purple-500 to-purple-600",
            stats: { label: "Departments", value: "0" }
        },
        {
            id: "budgets",
            title: "Budgets",
            description: "Plan and track budget allocations",
            icon: react_1["default"].createElement(lucide_react_1.DollarSign, { className: "w-8 h-8" }),
            href: "/budgets",
            color: "from-green-500 to-green-600",
            stats: { label: "Budgets", value: "0" }
        },
    ]; }, [metrics]);
    // Memoize overviewMetrics to prevent unnecessary re-renders
    var overviewMetrics = react_1.useMemo(function () {
        var _a, _b, _c;
        return [
            {
                title: "Total Projects",
                value: metrics.totalProjects.toString(),
                description: "Get started by creating your first project",
                icon: react_1["default"].createElement(lucide_react_1.FolderKanban, { className: "w-5 h-5" }),
                color: "border-l-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-l-blue-400",
                href: "/projects"
            },
            {
                title: "Active Clients",
                value: metrics.activeClients.toString(),
                description: "Add your first client",
                icon: react_1["default"].createElement(lucide_react_1.Users, { className: "w-5 h-5" }),
                color: "border-l-green-500 bg-green-50 dark:bg-green-900/20 dark:border-l-green-400",
                href: "/clients"
            },
            {
                title: "Pending Invoices",
                value: metrics.pendingInvoices.toString(),
                description: "No pending invoices",
                icon: react_1["default"].createElement(lucide_react_1.FileText, { className: "w-5 h-5" }),
                color: "border-l-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:border-l-purple-400",
                href: "/invoices"
            },
            {
                title: "Revenue This Month",
                value: "KES " + ((metrics.monthlyRevenue) || 0).toLocaleString(),
                description: (dashboardStats === null || dashboardStats === void 0 ? void 0 : dashboardStats.revenueGrowth) ? "" + (dashboardStats.revenueGrowth > 0 ? "+" : "") + dashboardStats.revenueGrowth + "% vs last month"
                    : "Total payments received",
                icon: react_1["default"].createElement(lucide_react_1.TrendingUp, { className: "w-5 h-5" }),
                color: "border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 dark:border-l-emerald-400",
                href: "/accounting"
            },
            {
                title: "Payments Today",
                value: "KES " + (((_a = financialSummary === null || financialSummary === void 0 ? void 0 : financialSummary.paymentsToday) !== null && _a !== void 0 ? _a : 0) / 100).toLocaleString(),
                description: "Received today",
                icon: react_1["default"].createElement(lucide_react_1.Banknote, { className: "w-5 h-5" }),
                color: "border-l-teal-500 bg-teal-50 dark:bg-teal-900/20 dark:border-l-teal-400",
                href: "/payments"
            },
            {
                title: "Invoices Due",
                value: "KES " + (((_b = financialSummary === null || financialSummary === void 0 ? void 0 : financialSummary.invoicesDue) !== null && _b !== void 0 ? _b : 0) / 100).toLocaleString(),
                description: "Outstanding & upcoming",
                icon: react_1["default"].createElement(lucide_react_1.CalendarClock, { className: "w-5 h-5" }),
                color: "border-l-amber-500 bg-amber-50 dark:bg-amber-900/20 dark:border-l-amber-400",
                href: "/invoices"
            },
            {
                title: "Overdue Invoices",
                value: "KES " + (((_c = financialSummary === null || financialSummary === void 0 ? void 0 : financialSummary.invoicesOverdue) !== null && _c !== void 0 ? _c : 0) / 100).toLocaleString(),
                description: "Past due date",
                icon: react_1["default"].createElement(lucide_react_1.AlertTriangle, { className: "w-5 h-5" }),
                color: "border-l-red-500 bg-red-50 dark:bg-red-900/20 dark:border-l-red-400",
                href: "/invoices"
            },
        ];
    }, [metrics, financialSummary, dashboardStats]);
    return (react_1["default"].createElement(DashboardLayout_1["default"], null,
        react_1["default"].createElement("div", { className: "space-y-8" },
            react_1["default"].createElement("div", { className: "space-y-2" },
                react_1["default"].createElement("h1", { className: "text-4xl font-bold tracking-tight" }, "Welcome to Your CRM Dashboard"),
                react_1["default"].createElement("p", { className: "text-lg text-slate-600 dark:text-slate-400" }, "Manage your clients, projects, invoices, and more from one powerful platform")),
            react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4" }, quickActions.map(function (action) { return (react_1["default"].createElement("button", { key: action.id, onClick: function () { return handleCardClick(action.href); }, className: "group relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 text-left transition-all hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600" },
                react_1["default"].createElement("div", { className: utils_1.cn("absolute inset-0 opacity-0 transition-opacity group-hover:opacity-5", "bg-gradient-to-br " + action.color) }),
                react_1["default"].createElement("div", { className: "relative space-y-4" },
                    react_1["default"].createElement("div", { className: utils_1.cn("inline-flex p-3 rounded-lg text-white", "bg-gradient-to-br " + action.color) }, action.icon),
                    react_1["default"].createElement("div", { className: "space-y-1" },
                        react_1["default"].createElement("h3", { className: "font-semibold text-slate-900 dark:text-slate-100" }, action.title),
                        react_1["default"].createElement("p", { className: "text-sm text-slate-600 dark:text-slate-400" }, action.description)),
                    action.stats && action.stats.label && action.stats.value && (react_1["default"].createElement("div", { className: "pt-2 border-t border-slate-100 dark:border-slate-700" },
                        react_1["default"].createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400" }, String(action.stats.label)),
                        react_1["default"].createElement("p", { className: "text-lg font-bold text-slate-900 dark:text-slate-100" }, String(action.stats.value)))),
                    react_1["default"].createElement("div", { className: "absolute top-6 right-6 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" },
                        react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "w-5 h-5" }))))); })),
            react_1["default"].createElement("div", { className: "space-y-4" },
                react_1["default"].createElement("h2", { className: "text-2xl font-bold tracking-tight" }, "Quick Overview"),
                react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4" }, overviewMetrics.map(function (metric) { return (react_1["default"].createElement("button", { key: metric.title, onClick: function () { return handleCardClick(metric.href); }, className: utils_1.cn("group relative overflow-hidden rounded-lg border-l-4 p-6 text-left transition-all hover:shadow-lg cursor-pointer", metric.color) },
                    react_1["default"].createElement("div", { className: "flex items-start justify-between" },
                        react_1["default"].createElement("div", { className: "space-y-1" },
                            react_1["default"].createElement("p", { className: "text-sm font-medium text-slate-600 dark:text-slate-400" }, metric.title),
                            react_1["default"].createElement("p", { className: "text-3xl font-bold text-slate-900 dark:text-slate-100" }, metric.value),
                            react_1["default"].createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400" }, metric.description)),
                        react_1["default"].createElement("div", { className: "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" }, metric.icon)))); }))),
            react_1["default"].createElement("div", { className: "space-y-4" },
                react_1["default"].createElement("h2", { className: "text-2xl font-bold tracking-tight" }, "Financial Overview"),
                react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6" },
                    react_1["default"].createElement(card_1.Card, { className: "lg:col-span-2" },
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                react_1["default"].createElement(lucide_react_1.BarChart3, { className: "w-5 h-5 text-blue-600" }),
                                "Monthly Income vs Expenses"),
                            react_1["default"].createElement(card_1.CardDescription, null,
                                (monthlyChart === null || monthlyChart === void 0 ? void 0 : monthlyChart.year) || new Date().getFullYear(),
                                " financial performance")),
                        react_1["default"].createElement(card_1.CardContent, null, (monthlyChart === null || monthlyChart === void 0 ? void 0 : monthlyChart.months) && monthlyChart.months.length > 0 ? (react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                            react_1["default"].createElement(recharts_1.BarChart, { data: monthlyChart.months },
                                react_1["default"].createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3", className: "opacity-30" }),
                                react_1["default"].createElement(recharts_1.XAxis, { dataKey: "name", tick: { fontSize: 12 } }),
                                react_1["default"].createElement(recharts_1.YAxis, { tick: { fontSize: 12 }, tickFormatter: function (v) { return "" + (v / 100).toLocaleString(); } }),
                                react_1["default"].createElement(recharts_1.Tooltip, { formatter: function (value) { return ["KES " + (value / 100).toLocaleString(), undefined]; }, labelStyle: { fontWeight: "bold" } }),
                                react_1["default"].createElement(recharts_1.Legend, null),
                                react_1["default"].createElement(recharts_1.Bar, { dataKey: "income", name: "Income", fill: "#22c55e", radius: [4, 4, 0, 0] }),
                                react_1["default"].createElement(recharts_1.Bar, { dataKey: "expense", name: "Expenses", fill: "#ef4444", radius: [4, 4, 0, 0] })))) : (react_1["default"].createElement("div", { className: "flex items-center justify-center h-[300px] text-muted-foreground" }, "No data available yet")))),
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                react_1["default"].createElement(lucide_react_1.TrendingUp, { className: "w-5 h-5 text-green-600" }),
                                "Financial Breakdown"),
                            react_1["default"].createElement(card_1.CardDescription, null, "Revenue, payments, and expenses")),
                        react_1["default"].createElement(card_1.CardContent, null, accountingMetrics ? (react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                            react_1["default"].createElement(recharts_1.PieChart, null,
                                react_1["default"].createElement(recharts_1.Pie, { data: [
                                        { name: "Revenue", value: (accountingMetrics.totalRevenue || 0) / 100 },
                                        { name: "Payments", value: (accountingMetrics.totalPayments || 0) / 100 },
                                        { name: "Expenses", value: (accountingMetrics.totalExpenses || 0) / 100 },
                                    ].filter(function (d) { return d.value > 0; }), cx: "50%", cy: "50%", innerRadius: 60, outerRadius: 100, paddingAngle: 4, dataKey: "value", label: function (_a) {
                                        var name = _a.name, percent = _a.percent;
                                        return name + " " + (percent * 100).toFixed(0) + "%";
                                    } },
                                    react_1["default"].createElement(recharts_1.Cell, { fill: "#22c55e" }),
                                    react_1["default"].createElement(recharts_1.Cell, { fill: "#3b82f6" }),
                                    react_1["default"].createElement(recharts_1.Cell, { fill: "#ef4444" })),
                                react_1["default"].createElement(recharts_1.Tooltip, { formatter: function (value) { return ["KES " + value.toLocaleString(), undefined]; } })))) : (react_1["default"].createElement("div", { className: "flex items-center justify-center h-[300px] text-muted-foreground" }, "No data available yet")))))),
            react_1["default"].createElement("div", { className: "space-y-4" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                    react_1["default"].createElement("h2", { className: "text-2xl font-bold tracking-tight" }, "Recent Activity"),
                    react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return navigate("/audit-logs"); } }, "View All")),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Latest Updates"),
                        react_1["default"].createElement(card_1.CardDescription, null, "Recent changes and activities in your CRM")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "space-y-1" }, recentActivities.length === 0 ? (react_1["default"].createElement("div", { className: "flex items-center justify-between py-3" },
                            react_1["default"].createElement("div", { className: "space-y-1" },
                                react_1["default"].createElement("p", { className: "text-sm font-medium text-slate-900 dark:text-slate-100" }, "No recent activity"),
                                react_1["default"].createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400" }, "Start by creating your first project or client")))) : (recentActivities.map(function (activity) {
                            var _a;
                            return (react_1["default"].createElement("div", { key: activity.id, className: "flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 last:border-0" },
                                react_1["default"].createElement("div", { className: "flex items-center gap-3" },
                                    react_1["default"].createElement("div", { className: utils_1.cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold", activity.action === "create" ? "bg-green-100 text-green-700" :
                                            activity.action === "update" ? "bg-blue-100 text-blue-700" :
                                                activity.action === "delete" ? "bg-red-100 text-red-700" :
                                                    "bg-gray-100 text-gray-700") }, activity.action === "create" ? react_1["default"].createElement(lucide_react_1.Plus, { className: "w-4 h-4" }) :
                                        activity.action === "update" ? react_1["default"].createElement(lucide_react_1.CheckCircle2, { className: "w-4 h-4" }) :
                                            activity.action === "delete" ? react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "w-4 h-4" }) :
                                                react_1["default"].createElement(lucide_react_1.Clock, { className: "w-4 h-4" })),
                                    react_1["default"].createElement("div", { className: "space-y-0.5" },
                                        react_1["default"].createElement("p", { className: "text-sm font-medium text-slate-900 dark:text-slate-100" }, activity.description || activity.action + " " + activity.entityType),
                                        react_1["default"].createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400 capitalize" }, (_a = activity.entityType) === null || _a === void 0 ? void 0 : _a.replace(/_/g, " ")))),
                                react_1["default"].createElement("p", { className: "text-xs text-slate-400 whitespace-nowrap" }, activity.createdAt ? new Date(activity.createdAt).toLocaleDateString("en-US", {
                                    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                                }) : "")));
                        })))))),
            react_1["default"].createElement("div", { className: "space-y-4" },
                react_1["default"].createElement("h2", { className: "text-2xl font-bold tracking-tight" }, "Getting Started"),
                react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-lg" }, "Add Your First Client")),
                        react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                            react_1["default"].createElement("p", { className: "text-sm text-slate-600 dark:text-slate-400" }, "Start building your client database by adding new clients to your CRM."),
                            react_1["default"].createElement(button_1.Button, { onClick: function () { return handleCardClick("/clients"); }, className: "w-full", size: "sm" },
                                react_1["default"].createElement(lucide_react_1.Plus, { className: "w-4 h-4 mr-2" }),
                                "Add Client"))),
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-lg" }, "Create Your First Project")),
                        react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                            react_1["default"].createElement("p", { className: "text-sm text-slate-600 dark:text-slate-400" }, "Organize your work by creating projects and assigning tasks to your team."),
                            react_1["default"].createElement(button_1.Button, { onClick: function () { return handleCardClick("/projects/create"); }, className: "w-full", size: "sm" },
                                react_1["default"].createElement(lucide_react_1.Plus, { className: "w-4 h-4 mr-2" }),
                                "New Project"))),
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-lg" }, "Generate Your First Invoice")),
                        react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                            react_1["default"].createElement("p", { className: "text-sm text-slate-600 dark:text-slate-400" }, "Create professional invoices and track payments from your clients."),
                            react_1["default"].createElement(button_1.Button, { onClick: function () { return handleCardClick("/invoices"); }, className: "w-full", size: "sm" },
                                react_1["default"].createElement(lucide_react_1.Plus, { className: "w-4 h-4 mr-2" }),
                                "New Invoice"))))))));
}
exports["default"] = DashboardHome;
