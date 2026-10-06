"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var useAuthWithPersistence_1 = require("@/_core/hooks/useAuthWithPersistence");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var AIAssistantModal_1 = require("@/components/AIAssistantModal");
/**
 * DashboardHome - Unified Role-Based Dashboard
 *
 * This is the main dashboard for all users in the CRM system.
 * Content is filtered based on user role:
 * - super_admin & admin: See all features
 * - accountant: See accounting/payments features
 * - hr: See HR/employee features
 * - All others: See general business features
 *
 * Routes accessing this component:
 * - /crm (primary unified dashboard)
 * - /dashboards/dashboardhome (direct dashboard path)
 * - /dashboard-home (legacy compatibility)
 */
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
function DashboardHome() {
    var _a, _b;
    var _c = wouter_1.useLocation(), navigate = _c[1];
    var _d = useAuthWithPersistence_1.useAuthWithPersistence(), user = _d.user, loading = _d.loading, isAuthenticated = _d.isAuthenticated;
    var _e = react_1.useState(false), aiAssistantOpen = _e[0], setAiAssistantOpen = _e[1];
    // Comprehensive tRPC queries for all dashboard sections
    var _f = trpc_1.trpc.dashboard.metrics.useQuery(undefined, {
        retry: 2,
        retryDelay: 1000
    }), dashboardMetrics = _f.data, metricsLoading = _f.isLoading;
    var _g = trpc_1.trpc.dashboard.stats.useQuery(undefined, {
        retry: 2,
        retryDelay: 1000
    }), dashboardStats = _g.data, statsLoading = _g.isLoading;
    var _h = trpc_1.trpc.dashboard.recentActivity.useQuery({ limit: 5 }, {
        retry: 2,
        retryDelay: 1000
    }), recentActivityData = _h.data, activityLoading = _h.isLoading;
    var _j = trpc_1.trpc.dashboard.accountingMetrics.useQuery(undefined, {
        retry: 2,
        retryDelay: 1000
    }), accountingMetrics = _j.data, accountingLoading = _j.isLoading;
    var monthlyChartData = trpc_1.trpc.dashboard.monthlyChart.useQuery(undefined, {
        retry: 2,
        retryDelay: 1000
    }).data;
    // Combined loading state
    var isLoading = metricsLoading || statsLoading || activityLoading || accountingLoading;
    // Normalize metrics with type safety
    var metrics = {
        totalProjects: Number(dashboardMetrics === null || dashboardMetrics === void 0 ? void 0 : dashboardMetrics.totalProjects) || 0,
        activeClients: Number(dashboardMetrics === null || dashboardMetrics === void 0 ? void 0 : dashboardMetrics.activeClients) || 0,
        pendingInvoices: Number(dashboardMetrics === null || dashboardMetrics === void 0 ? void 0 : dashboardMetrics.pendingInvoices) || 0,
        monthlyRevenue: Number(dashboardMetrics === null || dashboardMetrics === void 0 ? void 0 : dashboardMetrics.monthlyRevenue) || 0,
        totalProducts: Number(dashboardMetrics === null || dashboardMetrics === void 0 ? void 0 : dashboardMetrics.totalProducts) || 0,
        totalServices: Number(dashboardMetrics === null || dashboardMetrics === void 0 ? void 0 : dashboardMetrics.totalServices) || 0,
        totalEmployees: Number(dashboardMetrics === null || dashboardMetrics === void 0 ? void 0 : dashboardMetrics.totalEmployees) || 0
    };
    var stats = {
        totalRevenue: Number(dashboardStats === null || dashboardStats === void 0 ? void 0 : dashboardStats.totalRevenue) || 0,
        revenueGrowth: Number(dashboardStats === null || dashboardStats === void 0 ? void 0 : dashboardStats.revenueGrowth) || 0,
        activeProjects: Number(dashboardStats === null || dashboardStats === void 0 ? void 0 : dashboardStats.activeProjects) || 0,
        newProjects: Number(dashboardStats === null || dashboardStats === void 0 ? void 0 : dashboardStats.newProjects) || 0,
        totalClients: Number(dashboardStats === null || dashboardStats === void 0 ? void 0 : dashboardStats.totalClients) || 0,
        newClients: Number(dashboardStats === null || dashboardStats === void 0 ? void 0 : dashboardStats.newClients) || 0
    };
    // Chart data from real backend
    var monthlyRevenueData = ((_a = monthlyChartData === null || monthlyChartData === void 0 ? void 0 : monthlyChartData.months) !== null && _a !== void 0 ? _a : []).map(function (m) {
        var _a, _b;
        return ({
            month: m.name,
            revenue: (_a = m.income) !== null && _a !== void 0 ? _a : 0,
            target: (_b = m.expense) !== null && _b !== void 0 ? _b : 0
        });
    });
    var clientStatusData = [
        { name: "Active", value: metrics.activeClients, color: "#10b981" },
        { name: "Total Projects", value: metrics.totalProjects, color: "#6b7280" },
    ];
    var invoiceStatusData = ((_b = monthlyChartData === null || monthlyChartData === void 0 ? void 0 : monthlyChartData.months) !== null && _b !== void 0 ? _b : []).map(function (m) {
        var _a, _b;
        return ({
            month: m.name,
            income: (_a = m.income) !== null && _a !== void 0 ? _a : 0,
            expense: (_b = m.expense) !== null && _b !== void 0 ? _b : 0
        });
    });
    var handleCardClick = function (href, actionId) {
        if (actionId === "ai-assistant") {
            setAiAssistantOpen(true);
            return;
        }
        if (href && href !== "#") {
            navigate(href);
        }
    };
    // Define quick actions with dynamic metrics
    var quickActions = [
        {
            id: "ai-assistant",
            title: "AI Assistant",
            description: "Get instant help and insights",
            icon: react_1["default"].createElement("span", { className: "text-lg" }, "\u2728"),
            href: "#",
            color: "from-violet-500 to-violet-600",
            stats: { label: "Smart", value: "24/7" }
        },
        {
            id: "projects",
            title: "Projects",
            description: "Manage and track all your projects",
            icon: react_1["default"].createElement(lucide_react_1.FolderKanban, { className: "w-8 h-8" }),
            href: "/projects",
            color: "from-blue-500 to-blue-600",
            stats: { label: "Total Projects", value: metrics.totalProjects }
        },
        {
            id: "clients",
            title: "Clients",
            description: "Client relationship management",
            icon: react_1["default"].createElement(lucide_react_1.Users, { className: "w-8 h-8" }),
            href: "/clients",
            color: "from-green-500 to-green-600",
            stats: { label: "Active Clients", value: metrics.activeClients }
        },
        {
            id: "invoices",
            title: "Invoices",
            description: "Create and manage invoices",
            icon: react_1["default"].createElement(lucide_react_1.FileText, { className: "w-8 h-8" }),
            href: "/invoices",
            color: "from-purple-500 to-purple-600",
            stats: { label: "Pending Invoices", value: metrics.pendingInvoices }
        },
        {
            id: "estimates",
            title: "Estimates",
            description: "Generate quotations and estimates",
            icon: react_1["default"].createElement(lucide_react_1.Receipt, { className: "w-8 h-8" }),
            href: "/estimates",
            color: "from-orange-500 to-orange-600",
            stats: { label: "Pending Estimates", value: 0 }
        },
        {
            id: "payments",
            title: "Payments",
            description: "Track payments and transactions",
            icon: react_1["default"].createElement(lucide_react_1.DollarSign, { className: "w-8 h-8" }),
            href: "/payments",
            color: "from-green-500 to-emerald-600",
            stats: { label: "This Month", value: "KES " + metrics.monthlyRevenue.toLocaleString() },
            roles: ["super_admin", "admin", "accountant"] // Primary access for accountants
        },
        {
            id: "products",
            title: "Products",
            description: "Product catalog management",
            icon: react_1["default"].createElement(lucide_react_1.Package, { className: "w-8 h-8" }),
            href: "/products",
            color: "from-cyan-500 to-cyan-600",
            stats: { label: "Total Products", value: metrics.totalProducts }
        },
        {
            id: "services",
            title: "Services",
            description: "Service offerings catalog",
            icon: react_1["default"].createElement(lucide_react_1.Briefcase, { className: "w-8 h-8" }),
            href: "/services",
            color: "from-indigo-500 to-indigo-600",
            stats: { label: "Total Services", value: metrics.totalServices }
        },
        {
            id: "accounting",
            title: "Accounting",
            description: "Financial management and reports",
            icon: react_1["default"].createElement(lucide_react_1.CreditCard, { className: "w-8 h-8" }),
            href: "/accounting",
            color: "from-pink-500 to-pink-600",
            stats: { label: "Accounts", value: (accountingMetrics === null || accountingMetrics === void 0 ? void 0 : accountingMetrics.totalInvoices) || 0 },
            roles: ["super_admin", "admin", "accountant"] // For accounting team
        },
        {
            id: "reports",
            title: "Reports",
            description: "Analytics and insights",
            icon: react_1["default"].createElement(lucide_react_1.BarChart3, { className: "w-8 h-8" }),
            href: "/reports",
            color: "from-amber-500 to-amber-600",
            stats: { label: "Reports", value: 0 }
        },
        {
            id: "hr",
            title: "HR",
            description: "Human resources management",
            icon: react_1["default"].createElement(lucide_react_1.UserCog, { className: "w-8 h-8" }),
            href: "/hr",
            color: "from-red-500 to-red-600",
            stats: { label: "Employees", value: metrics.totalEmployees },
            roles: ["super_admin", "admin", "hr"] // Primary access for HR
        },
    ];
    // Filter quick actions based on user role
    var filteredQuickActions = quickActions.filter(function (action) {
        // Show to super_admin and admin always
        if ((user === null || user === void 0 ? void 0 : user.role) === "super_admin" || (user === null || user === void 0 ? void 0 : user.role) === "admin")
            return true;
        // If action has no role restriction, show to everyone
        if (!action.roles)
            return true;
        // Otherwise, only show if user role matches
        return action.roles.includes((user === null || user === void 0 ? void 0 : user.role) || "");
    });
    var overviewMetrics = [
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
            title: "Revenue",
            value: "KES " + metrics.monthlyRevenue.toLocaleString(),
            description: "This month",
            icon: react_1["default"].createElement(lucide_react_1.TrendingUp, { className: "w-5 h-5" }),
            color: "border-l-green-500 bg-green-50 dark:bg-green-900/20 dark:border-l-green-400",
            href: "/accounting"
        },
    ];
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Dashboard", description: "Track your performance, manage operations, and grow your business", icon: react_1["default"].createElement(lucide_react_1.LayoutDashboard, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard" }] },
        react_1["default"].createElement("div", { className: "space-y-6 md:space-y-8 pb-8" },
            react_1["default"].createElement("div", { className: "space-y-3 sm:space-y-4" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between px-1" },
                    react_1["default"].createElement("h2", { className: "text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50" }, "Quick Access"),
                    isLoading && react_1["default"].createElement(lucide_react_1.Loader2, { className: "w-4 h-4 sm:w-5 sm:h-5 animate-spin text-slate-400" })),
                react_1["default"].createElement("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4" }, filteredQuickActions.map(function (action) { return (react_1["default"].createElement("button", { key: action.id, onClick: function () { return handleCardClick(action.href, action.id); }, disabled: isLoading, className: "group relative overflow-hidden rounded-xl border transition-all duration-300 bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 p-3 sm:p-4 md:p-5 text-left hover:shadow-xl hover:-translate-y-1.5 dark:hover:border-slate-600 hover:border-slate-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm" },
                    react_1["default"].createElement("div", { className: utils_1.cn("absolute inset-0 opacity-0 transition-opacity group-hover:opacity-15 duration-300", "bg-gradient-to-br " + action.color) }),
                    react_1["default"].createElement("div", { className: "relative space-y-2.5 sm:space-y-3" },
                        react_1["default"].createElement("div", { className: utils_1.cn("inline-flex p-2.5 sm:p-3 rounded-lg text-white shadow-lg", "bg-gradient-to-br " + action.color) },
                            react_1["default"].createElement("div", { className: "w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" }, action.icon)),
                        react_1["default"].createElement("h3", { className: "font-bold text-slate-900 dark:text-slate-50 text-xs sm:text-sm md:text-base leading-tight" }, action.title),
                        action.stats && (react_1["default"].createElement("div", { className: "pt-2 border-t border-slate-100 dark:border-slate-700/50 hidden sm:block" },
                            react_1["default"].createElement("p", { className: "text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate" }, action.stats.label),
                            react_1["default"].createElement("p", { className: "text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5" }, typeof action.stats.value === "number" ? action.stats.value.toString() : action.stats.value)))),
                    react_1["default"].createElement("div", { className: "absolute top-2.5 right-2.5 sm:top-4 sm:right-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors duration-300 opacity-0 group-hover:opacity-100" },
                        react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "w-4 h-4 sm:w-5 sm:h-5" })),
                    react_1["default"].createElement("div", { className: "absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-gradient-to-r from-transparent via-current to-transparent" }))); }))),
            react_1["default"].createElement("div", { className: "space-y-3 sm:space-y-4" },
                react_1["default"].createElement("h2", { className: "text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50" }, "Getting Started"),
                react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4" },
                    react_1["default"].createElement(card_1.Card, { className: "overflow-hidden border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group" },
                        react_1["default"].createElement(card_1.CardHeader, { className: "pb-3 sm:pb-4 bg-gradient-to-r from-blue-50 to-blue-50 dark:from-slate-800/50 dark:to-slate-800/50" },
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-sm sm:text-base md:text-lg text-slate-900 dark:text-slate-50 flex items-center space-x-2" },
                                react_1["default"].createElement(lucide_react_1.Users, { className: "w-4 h-4 text-blue-600" }),
                                react_1["default"].createElement("span", null, "Add Your First Client"))),
                        react_1["default"].createElement(card_1.CardContent, { className: "space-y-3 sm:space-y-4 p-3 sm:p-6" },
                            react_1["default"].createElement("p", { className: "text-xs sm:text-sm text-slate-600 dark:text-slate-400" }, "Start building your client database by adding new clients to your CRM system."),
                            react_1["default"].createElement(button_1.Button, { onClick: function () { return handleCardClick("/clients"); }, className: "w-full text-xs sm:text-sm h-8 sm:h-10 bg-blue-600 hover:bg-blue-700 group-hover:shadow-lg transition-all", size: "sm" },
                                react_1["default"].createElement(lucide_react_1.Plus, { className: "w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" }),
                                "Add Client"))),
                    react_1["default"].createElement(card_1.Card, { className: "overflow-hidden border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group" },
                        react_1["default"].createElement(card_1.CardHeader, { className: "pb-3 sm:pb-4 bg-gradient-to-r from-purple-50 to-purple-50 dark:from-slate-800/50 dark:to-slate-800/50" },
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-sm sm:text-base md:text-lg text-slate-900 dark:text-slate-50 flex items-center space-x-2" },
                                react_1["default"].createElement(lucide_react_1.FolderKanban, { className: "w-4 h-4 text-purple-600" }),
                                react_1["default"].createElement("span", null, "Create Your First Project"))),
                        react_1["default"].createElement(card_1.CardContent, { className: "space-y-3 sm:space-y-4 p-3 sm:p-6" },
                            react_1["default"].createElement("p", { className: "text-xs sm:text-sm text-slate-600 dark:text-slate-400" }, "Organize your work by creating projects and assigning tasks to your team members."),
                            react_1["default"].createElement(button_1.Button, { onClick: function () { return handleCardClick("/projects/create"); }, className: "w-full text-xs sm:text-sm h-8 sm:h-10 bg-purple-600 hover:bg-purple-700 group-hover:shadow-lg transition-all", size: "sm" },
                                react_1["default"].createElement(lucide_react_1.Plus, { className: "w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" }),
                                "New Project"))),
                    react_1["default"].createElement(card_1.Card, { className: "overflow-hidden border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group" },
                        react_1["default"].createElement(card_1.CardHeader, { className: "pb-3 sm:pb-4 bg-gradient-to-r from-green-50 to-green-50 dark:from-slate-800/50 dark:to-slate-800/50" },
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-sm sm:text-base md:text-lg text-slate-900 dark:text-slate-50 flex items-center space-x-2" },
                                react_1["default"].createElement(lucide_react_1.FileText, { className: "w-4 h-4 text-green-600" }),
                                react_1["default"].createElement("span", null, "Generate Your First Invoice"))),
                        react_1["default"].createElement(card_1.CardContent, { className: "space-y-3 sm:space-y-4 p-3 sm:p-6" },
                            react_1["default"].createElement("p", { className: "text-xs sm:text-sm text-slate-600 dark:text-slate-400" }, "Create professional invoices and track payments from your clients efficiently."),
                            react_1["default"].createElement(button_1.Button, { onClick: function () { return handleCardClick("/invoices"); }, className: "w-full text-xs sm:text-sm h-8 sm:h-10 bg-green-600 hover:bg-green-700 group-hover:shadow-lg transition-all", size: "sm" },
                                react_1["default"].createElement(lucide_react_1.Plus, { className: "w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" }),
                                "New Invoice")))))),
        react_1["default"].createElement(AIAssistantModal_1.AIAssistantModal, { isOpen: aiAssistantOpen, onClose: function () { return setAiAssistantOpen(false); }, context: "Dashboard" })));
}
exports["default"] = DashboardHome;
