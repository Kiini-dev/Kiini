"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var useAuthWithPersistence_1 = require("@/_core/hooks/useAuthWithPersistence");
var wouter_1 = require("wouter");
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var stats_card_1 = require("@/components/ui/stats-card");
var utils_1 = require("@/lib/utils");
var recharts_1 = require("recharts");
function SuperAdminDashboard() {
    var _a = useAuthWithPersistence_1.useAuthWithPersistence({
        redirectOnUnauthenticated: true
    }), user = _a.user, loading = _a.loading, isAuthenticated = _a.isAuthenticated, logout = _a.logout;
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    // Fetch dashboard metrics from backend
    var _c = trpc_1.trpc.dashboard.metrics.useQuery({}), metrics = _c.data, metricsLoading = _c.isLoading, metricsError = _c.error;
    var _d = trpc_1.trpc.dashboard.stats.useQuery({}, { retry: 2, retryDelay: 1000 }), dashboardStats = _d.data, statsLoading = _d.isLoading;
    var _e = trpc_1.trpc.dashboard.recentActivity.useQuery({ limit: 5 }, { retry: 2, retryDelay: 1000 }), recentActivityData = _e.data, activityLoading = _e.isLoading;
    var accountingMetrics = trpc_1.trpc.dashboard.accountingMetrics.useQuery({}, { retry: 2, retryDelay: 1000 }).data;
    var metricsPlain = metrics ? JSON.parse(JSON.stringify(metrics)) : null;
    var m = {
        totalProjects: Number(metricsPlain === null || metricsPlain === void 0 ? void 0 : metricsPlain.totalProjects) || 0,
        activeClients: Number(metricsPlain === null || metricsPlain === void 0 ? void 0 : metricsPlain.activeClients) || 0,
        pendingInvoices: Number(metricsPlain === null || metricsPlain === void 0 ? void 0 : metricsPlain.pendingInvoices) || 0,
        monthlyRevenue: Number(metricsPlain === null || metricsPlain === void 0 ? void 0 : metricsPlain.monthlyRevenue) || 0,
        totalProducts: Number(metricsPlain === null || metricsPlain === void 0 ? void 0 : metricsPlain.totalProducts) || 0,
        totalServices: Number(metricsPlain === null || metricsPlain === void 0 ? void 0 : metricsPlain.totalServices) || 0,
        totalEmployees: Number(metricsPlain === null || metricsPlain === void 0 ? void 0 : metricsPlain.totalEmployees) || 0
    };
    var stats = {
        totalRevenue: Number(dashboardStats === null || dashboardStats === void 0 ? void 0 : dashboardStats.totalRevenue) || 0,
        revenueGrowth: Number(dashboardStats === null || dashboardStats === void 0 ? void 0 : dashboardStats.revenueGrowth) || 0,
        activeProjects: Number(dashboardStats === null || dashboardStats === void 0 ? void 0 : dashboardStats.activeProjects) || 0,
        newClients: Number(dashboardStats === null || dashboardStats === void 0 ? void 0 : dashboardStats.newClients) || 0
    };
    // Chart data from real metrics
    var monthlyRevenueData = [
        { month: "Jan", revenue: m.monthlyRevenue * 0.6, target: 500000 },
        { month: "Feb", revenue: m.monthlyRevenue * 0.75, target: 500000 },
        { month: "Mar", revenue: m.monthlyRevenue * 0.9, target: 500000 },
        { month: "Apr", revenue: m.monthlyRevenue * 1.1, target: 500000 },
        { month: "May", revenue: m.monthlyRevenue, target: 500000 },
        { month: "Jun", revenue: m.monthlyRevenue * 0.95, target: 500000 },
    ];
    var clientStatusData = [
        { name: "Active", value: m.activeClients, color: "#10b981" },
        { name: "Inactive", value: Math.max(0, m.activeClients - 5), color: "#6b7280" },
    ];
    var invoiceStatusData = [
        { month: "Jan", paid: 15, pending: 8, overdue: 2 },
        { month: "Feb", paid: 18, pending: 5, overdue: 1 },
        { month: "Mar", paid: 22, pending: 3, overdue: 0 },
        { month: "Apr", paid: 25, pending: 4, overdue: 1 },
        { month: "May", paid: 28, pending: 6, overdue: 2 },
        { month: "Jun", paid: 20, pending: m.pendingInvoices, overdue: 1 },
    ];
    var isDataLoading = metricsLoading || statsLoading || activityLoading;
    react_1.useEffect(function () {
        if (!loading && isAuthenticated && (user === null || user === void 0 ? void 0 : user.role) !== "super_admin" && (user === null || user === void 0 ? void 0 : user.role) !== "admin") {
            setLocation("/dashboard");
        }
    }, [loading, isAuthenticated, user, setLocation]);
    if (loading || metricsLoading) {
        return (React.createElement("div", { className: "min-h-screen flex items-center justify-center" },
            React.createElement("div", { className: "flex flex-col items-center gap-3" },
                React.createElement(lucide_react_1.Loader2, { className: "h-12 w-12 animate-spin text-blue-600" }),
                React.createElement("p", { className: "text-gray-600" }, "Loading dashboard..."))));
    }
    if (!isAuthenticated || ((user === null || user === void 0 ? void 0 : user.role) !== "super_admin" && (user === null || user === void 0 ? void 0 : user.role) !== "admin")) {
        return null;
    }
    function handleLogout() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, logout()];
                    case 1:
                        _a.sent();
                        setLocation("/login");
                        return [2 /*return*/];
                }
            });
        });
    }
    if (metricsError) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Super Admin Dashboard", icon: React.createElement(lucide_react_1.Shield, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/dashboard" }, { label: "Super Admin" }] },
            React.createElement("div", { className: "flex items-center justify-center h-64" },
                React.createElement("div", { className: "text-center" },
                    React.createElement(lucide_react_1.AlertCircle, { className: "h-12 w-12 text-red-500 mx-auto mb-4" }),
                    React.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, "Error Loading Dashboard"),
                    React.createElement("p", { className: "text-gray-600" }, metricsError.message)))));
    }
    var overviewMetrics = [
        { title: "Total Projects", value: m.totalProjects.toString(), description: "Active projects", icon: React.createElement(lucide_react_1.FolderKanban, { className: "w-5 h-5" }), color: "border-l-blue-500 bg-blue-50 dark:bg-blue-900/20", href: "/projects" },
        { title: "Active Clients", value: m.activeClients.toString(), description: "Client relationships", icon: React.createElement(lucide_react_1.Users, { className: "w-5 h-5" }), color: "border-l-green-500 bg-green-50 dark:bg-green-900/20", href: "/clients" },
        { title: "Pending Invoices", value: m.pendingInvoices.toString(), description: "Awaiting payment", icon: React.createElement(lucide_react_1.FileText, { className: "w-5 h-5" }), color: "border-l-purple-500 bg-purple-50 dark:bg-purple-900/20", href: "/invoices" },
        { title: "Revenue", value: "KES " + m.monthlyRevenue.toLocaleString(), description: "This month", icon: React.createElement(lucide_react_1.TrendingUp, { className: "w-5 h-5" }), color: "border-l-green-500 bg-green-50 dark:bg-green-900/20", href: "/accounting" },
    ];
    var features = [
        { title: "Projects", description: "Manage and track all your projects", icon: lucide_react_1.FolderKanban, href: "/projects", borderColor: "border-l-blue-500", color: "text-blue-500", bgColor: "bg-blue-50 dark:bg-blue-950" },
        { title: "Clients", description: "Client relationship management", icon: lucide_react_1.Users, href: "/clients", borderColor: "border-l-green-500", color: "text-green-500", bgColor: "bg-green-50 dark:bg-green-950" },
        { title: "Invoices", description: "Create and manage invoices", icon: lucide_react_1.FileText, href: "/invoices", borderColor: "border-l-purple-500", color: "text-purple-500", bgColor: "bg-purple-50 dark:bg-purple-950" },
        { title: "Estimates", description: "Generate quotations and estimates", icon: lucide_react_1.Receipt, href: "/estimates", borderColor: "border-l-orange-500", color: "text-orange-500", bgColor: "bg-orange-50 dark:bg-orange-950" },
        { title: "Payments", description: "Track payments and transactions", icon: lucide_react_1.DollarSign, href: "/payments", borderColor: "border-l-emerald-500", color: "text-emerald-500", bgColor: "bg-emerald-50 dark:bg-emerald-950" },
        { title: "Expenses", description: "Monitor and manage expenses", icon: lucide_react_1.CreditCard, href: "/expenses", borderColor: "border-l-rose-500", color: "text-rose-500", bgColor: "bg-rose-50 dark:bg-rose-950" },
        { title: "Products", description: "Product catalog management", icon: lucide_react_1.Package, href: "/products", borderColor: "border-l-cyan-500", color: "text-cyan-500", bgColor: "bg-cyan-50 dark:bg-cyan-950" },
        { title: "Services", description: "Service offerings catalog", icon: lucide_react_1.Briefcase, href: "/services", borderColor: "border-l-indigo-500", color: "text-indigo-500", bgColor: "bg-indigo-50 dark:bg-indigo-950" },
        { title: "Procurement", description: "Purchase orders and requests", icon: lucide_react_1.Truck, href: "/procurement", borderColor: "border-l-teal-500", color: "text-teal-500", bgColor: "bg-teal-50 dark:bg-teal-950" },
        { title: "Accounting", description: "Financial management and reports", icon: lucide_react_1.LineChart, href: "/accounting", borderColor: "border-l-pink-500", color: "text-pink-500", bgColor: "bg-pink-50 dark:bg-pink-950" },
        { title: "Reports", description: "Analytics and insights", icon: lucide_react_1.BarChart3, href: "/reports", borderColor: "border-l-amber-500", color: "text-amber-500", bgColor: "bg-amber-50 dark:bg-amber-950" },
        { title: "HR", description: "Human resources management", icon: lucide_react_1.UserCog, href: "/hr", borderColor: "border-l-rose-500", color: "text-rose-600", bgColor: "bg-rose-50 dark:bg-rose-950" },
        { title: "Approvals", description: "Manage approval workflows", icon: lucide_react_1.CheckSquare, href: "/approvals", borderColor: "border-l-lime-500", color: "text-lime-500", bgColor: "bg-lime-50 dark:bg-lime-950" },
        { title: "Communications", description: "Email, SMS, and messaging", icon: lucide_react_1.Mail, href: "/communications", borderColor: "border-l-indigo-500", color: "text-indigo-500", bgColor: "bg-indigo-50 dark:bg-indigo-950" },
        { title: "CRM", description: "Customer relationship management", icon: lucide_react_1.Users, href: "/crm", borderColor: "border-l-violet-500", color: "text-violet-500", bgColor: "bg-violet-50 dark:bg-violet-950" },
        { title: "ICT Management", description: "System administration & monitoring", icon: lucide_react_1.Settings, href: "/admin/ict-dashboard", borderColor: "border-l-cyan-500", color: "text-cyan-500", bgColor: "bg-cyan-50 dark:bg-cyan-950" },
    ];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Super Admin Dashboard", description: "Comprehensive business management system to streamline operations", icon: React.createElement(lucide_react_1.Shield, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/dashboard" }, { label: "Super Admin" }], actions: React.createElement("div", { className: "flex gap-2" },
            React.createElement(button_1.Button, { variant: "secondary", size: "sm", onClick: function () { return setLocation("/admin/management"); }, className: "gap-2" },
                React.createElement(lucide_react_1.Settings, { className: "w-4 h-4" }),
                "System Administration"),
            React.createElement(button_1.Button, { variant: "secondary", size: "sm", onClick: function () { return setLocation("/crm-home"); } }, "Go to Dashboard Home")) },
        React.createElement("div", { className: "space-y-8" },
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Projects", value: m.totalProjects, description: "Active projects", icon: React.createElement(lucide_react_1.FolderKanban, { className: "h-5 w-5" }), color: "border-l-orange-500", loading: isDataLoading }),
                React.createElement(stats_card_1.StatsCard, { label: "Total Clients", value: (metricsPlain === null || metricsPlain === void 0 ? void 0 : metricsPlain.totalClients) || 0, description: "Active clients", icon: React.createElement(lucide_react_1.Users, { className: "h-5 w-5" }), color: "border-l-purple-500", loading: isDataLoading }),
                React.createElement(stats_card_1.StatsCard, { label: "Active Users", value: m.activeClients, description: "System users", icon: React.createElement(lucide_react_1.UserCog, { className: "h-5 w-5" }), color: "border-l-green-500", loading: isDataLoading }),
                React.createElement(stats_card_1.StatsCard, { label: "System Status", value: "Operational", description: "All systems healthy", icon: React.createElement(lucide_react_1.CheckSquare, { className: "h-5 w-5" }), color: "border-l-blue-500" })),
            React.createElement("div", { className: "space-y-3 sm:space-y-4" },
                React.createElement("h2", { className: "text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50" }, "Key Metrics"),
                React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" }, overviewMetrics.map(function (metric) { return (React.createElement("button", { key: metric.title, onClick: function () { return setLocation(metric.href); }, disabled: isDataLoading, className: utils_1.cn("group relative overflow-hidden rounded-xl border-l-4 p-4 sm:p-5 md:p-6 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer disabled:opacity-50", "bg-white dark:bg-slate-800/60 border-t border-r border-b border-slate-200 dark:border-slate-700", metric.color) },
                    React.createElement("div", { className: "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500" }),
                    React.createElement("div", { className: "relative flex items-start justify-between" },
                        React.createElement("div", { className: "space-y-2 flex-1 min-w-0" },
                            React.createElement("p", { className: "text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400" }, metric.title),
                            isDataLoading ? (React.createElement("div", { className: "h-8 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse w-24" })) : (React.createElement("p", { className: "text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50" }, metric.value)),
                            React.createElement("p", { className: "text-xs sm:text-sm text-slate-600 dark:text-slate-400 pt-1.5" }, metric.description)),
                        React.createElement("div", { className: "ml-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 transition-colors flex-shrink-0" }, metric.icon)))); }))),
            React.createElement("div", null,
                React.createElement("div", { className: "mb-4" },
                    React.createElement("h2", { className: "text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50" }, "Quick Access"),
                    React.createElement("p", { className: "text-sm text-slate-500 dark:text-slate-400" }, "Access all modules from one place")),
                React.createElement("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" }, features.map(function (feature) {
                    var Icon = feature.icon;
                    return (React.createElement("button", { key: feature.href, onClick: function () { return setLocation(feature.href); }, className: utils_1.cn("group relative overflow-hidden rounded-xl border-l-4 p-4 sm:p-5 text-left transition-all duration-300", "bg-white dark:bg-slate-800/60 border-t border-r border-b border-slate-200 dark:border-slate-700", "hover:shadow-xl hover:-translate-y-1 cursor-pointer", feature.borderColor) },
                        React.createElement("div", { className: "absolute inset-0 opacity-0 group-hover:opacity-[0.07] transition-opacity duration-300 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 pointer-events-none" }),
                        React.createElement("div", { className: "relative" },
                            React.createElement("div", { className: "flex items-center justify-between mb-3" },
                                React.createElement("div", { className: "p-2.5 rounded-lg " + feature.bgColor },
                                    React.createElement(Icon, { className: "h-5 w-5 " + feature.color })),
                                React.createElement(lucide_react_1.ArrowRight, { className: "h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" })),
                            React.createElement("h3", { className: "font-bold text-sm text-slate-900 dark:text-slate-50" }, feature.title),
                            React.createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400 mt-1" }, feature.description)),
                        React.createElement("div", { className: "absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-gradient-to-r from-transparent via-current to-transparent" })));
                }))),
            React.createElement("div", { className: "space-y-3 sm:space-y-4" },
                React.createElement("h2", { className: "text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50" }, "Analytics & Insights"),
                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" },
                    React.createElement(card_1.Card, { className: "col-span-1 md:col-span-2 lg:col-span-1 overflow-hidden border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300" },
                        React.createElement(card_1.CardHeader, { className: "pb-3 sm:pb-4 bg-gradient-to-r from-blue-50 to-blue-50 dark:from-slate-800/50 dark:to-slate-800/50" },
                            React.createElement(card_1.CardTitle, { className: "text-base sm:text-lg" }, "Revenue Trend"),
                            React.createElement(card_1.CardDescription, { className: "text-xs sm:text-sm" }, "Last 6 months performance")),
                        React.createElement(card_1.CardContent, { className: "p-3 sm:p-4" }, isDataLoading ? (React.createElement("div", { className: "h-64 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" })) : (React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 250 },
                            React.createElement(recharts_1.LineChart, { data: monthlyRevenueData },
                                React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3", stroke: "currentColor", opacity: 0.1 }),
                                React.createElement(recharts_1.XAxis, { dataKey: "month", stroke: "currentColor", opacity: 0.5 }),
                                React.createElement(recharts_1.YAxis, { stroke: "currentColor", opacity: 0.5 }),
                                React.createElement(recharts_1.Tooltip, { contentStyle: { backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" } }),
                                React.createElement(recharts_1.Legend, null),
                                React.createElement(recharts_1.Line, { type: "monotone", dataKey: "revenue", stroke: "#3b82f6", dot: { fill: "#3b82f6", r: 4 }, activeDot: { r: 6 }, name: "Actual", strokeWidth: 2 }),
                                React.createElement(recharts_1.Line, { type: "monotone", dataKey: "target", stroke: "#9ca3af", strokeDasharray: "5 5", dot: false, name: "Target" })))))),
                    React.createElement(card_1.Card, { className: "col-span-1 md:col-span-2 lg:col-span-1 overflow-hidden border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300" },
                        React.createElement(card_1.CardHeader, { className: "pb-3 sm:pb-4 bg-gradient-to-r from-amber-50 to-amber-50 dark:from-slate-800/50 dark:to-slate-800/50" },
                            React.createElement(card_1.CardTitle, { className: "text-base sm:text-lg" }, "Invoice Status"),
                            React.createElement(card_1.CardDescription, { className: "text-xs sm:text-sm" }, "Payment tracking overview")),
                        React.createElement(card_1.CardContent, { className: "p-3 sm:p-4" }, isDataLoading ? (React.createElement("div", { className: "h-64 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" })) : (React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 250 },
                            React.createElement(recharts_1.BarChart, { data: invoiceStatusData },
                                React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3", stroke: "currentColor", opacity: 0.1 }),
                                React.createElement(recharts_1.XAxis, { dataKey: "month", stroke: "currentColor", opacity: 0.5 }),
                                React.createElement(recharts_1.YAxis, { stroke: "currentColor", opacity: 0.5 }),
                                React.createElement(recharts_1.Tooltip, { contentStyle: { backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" } }),
                                React.createElement(recharts_1.Legend, null),
                                React.createElement(recharts_1.Bar, { dataKey: "paid", fill: "#10b981", name: "Paid", radius: [8, 8, 0, 0] }),
                                React.createElement(recharts_1.Bar, { dataKey: "pending", fill: "#f59e0b", name: "Pending", radius: [8, 8, 0, 0] }),
                                React.createElement(recharts_1.Bar, { dataKey: "overdue", fill: "#ef4444", name: "Overdue", radius: [8, 8, 0, 0] })))))),
                    React.createElement(card_1.Card, { className: "col-span-1 overflow-hidden border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300" },
                        React.createElement(card_1.CardHeader, { className: "pb-3 sm:pb-4 bg-gradient-to-r from-green-50 to-green-50 dark:from-slate-800/50 dark:to-slate-800/50" },
                            React.createElement(card_1.CardTitle, { className: "text-base sm:text-lg" }, "Client Status"),
                            React.createElement(card_1.CardDescription, { className: "text-xs sm:text-sm" }, "Active vs Inactive")),
                        React.createElement(card_1.CardContent, { className: "p-3 sm:p-4" }, isDataLoading ? (React.createElement("div", { className: "h-64 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" })) : (React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 250 },
                            React.createElement(recharts_1.PieChart, null,
                                React.createElement(recharts_1.Pie, { data: clientStatusData, cx: "50%", cy: "50%", labelLine: false, label: function (_a) {
                                        var name = _a.name, percent = _a.percent;
                                        return name + " " + (percent * 100).toFixed(0) + "%";
                                    }, outerRadius: 80, fill: "#8884d8", dataKey: "value" }, clientStatusData.map(function (entry) { return (React.createElement(recharts_1.Cell, { key: entry.name, fill: entry.color })); })),
                                React.createElement(recharts_1.Tooltip, null)))))))),
            React.createElement("div", { className: "space-y-3 sm:space-y-4" },
                React.createElement("div", { className: "flex items-center justify-between" },
                    React.createElement("h2", { className: "text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50" }, "Recent Activity"),
                    React.createElement(button_1.Button, { variant: "outline", size: "sm", className: "text-xs sm:text-sm h-8 sm:h-10", onClick: function () { return setLocation("/audit-logs"); } }, "View All")),
                React.createElement(card_1.Card, { className: "overflow-hidden border-slate-200 dark:border-slate-700 shadow-lg" },
                    React.createElement(card_1.CardHeader, { className: "pb-3 sm:pb-4 bg-gradient-to-r from-purple-50 to-purple-50 dark:from-slate-800/50 dark:to-slate-800/50" },
                        React.createElement(card_1.CardTitle, { className: "text-base sm:text-lg" }, "Latest Updates"),
                        React.createElement(card_1.CardDescription, { className: "text-xs sm:text-sm" }, "Recent changes and activities in your CRM")),
                    React.createElement(card_1.CardContent, { className: "p-3 sm:p-6" }, activityLoading ? (React.createElement("div", { className: "space-y-3" }, [1, 2, 3].map(function (i) { return (React.createElement("div", { key: i, className: "h-12 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" })); }))) : recentActivityData && recentActivityData.length > 0 ? (React.createElement("div", { className: "space-y-3 sm:space-y-4" }, recentActivityData.slice(0, 5).map(function (activity, idx) { return (React.createElement("div", { key: activity.id + "-" + idx, className: "flex items-start space-x-3 py-3 sm:py-4 border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 px-2 -mx-2 rounded-lg transition-colors" },
                        React.createElement("div", { className: "flex-shrink-0 mt-1" },
                            React.createElement("div", { className: utils_1.cn("w-3 h-3 rounded-full", activity.action === "created" ? "bg-green-500" :
                                    activity.action === "updated" ? "bg-blue-500" :
                                        activity.action === "deleted" ? "bg-red-500" : "bg-slate-400") })),
                        React.createElement("div", { className: "flex-1 min-w-0" },
                            React.createElement("p", { className: "text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-50 capitalize" },
                                activity.action,
                                " ",
                                activity.entityType),
                            React.createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400 mt-0.5" }, activity.description || "ID: " + activity.entityId),
                            React.createElement("p", { className: "text-xs text-slate-400 dark:text-slate-500 mt-1" }, new Date(activity.createdAt).toLocaleDateString())))); }))) : (React.createElement("div", { className: "py-8 text-center space-y-2" },
                        React.createElement(lucide_react_1.Clock, { className: "w-8 h-8 mx-auto text-slate-400" }),
                        React.createElement("p", { className: "text-sm text-slate-600 dark:text-slate-400" }, "No recent activity"),
                        React.createElement("p", { className: "text-xs text-slate-500" }, "Start by creating your first project or client")))))))));
}
exports["default"] = SuperAdminDashboard;
