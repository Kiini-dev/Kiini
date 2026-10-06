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
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var input_1 = require("@/components/ui/input");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var stats_card_1 = require("@/components/ui/stats-card");
var table_1 = require("@/components/ui/table");
/**
 * AdminDashboard component
 *
 * Features:
 * - Organization management
 * - Department management
 * - Staff oversight
 * - Reports and analytics
 * - Content management
 */
function AdminDashboard() {
    var _this = this;
    var _a = useAuthWithPersistence_1.useAuthWithPersistence({
        redirectOnUnauthenticated: true
    }), user = _a.user, loading = _a.loading, isAuthenticated = _a.isAuthenticated, logout = _a.logout;
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    var _c = react_1.useState(""), staffSearch = _c[0], setStaffSearch = _c[1];
    var _d = react_1.useState(false), mobileNavOpen = _d[0], setMobileNavOpen = _d[1];
    // Fetch dashboard metrics from backend
    var _e = trpc_1.trpc.dashboard.metrics.useQuery({}), metrics = _e.data, metricsLoading = _e.isLoading;
    // Fetch employees/staff data
    var _f = trpc_1.trpc.employees.list.useQuery({}), employeesData = _f.data, employeesLoading = _f.isLoading;
    // Fetch departments data
    var _g = trpc_1.trpc.departments.list.useQuery({}), departmentsData = _g.data, departmentsLoading = _g.isLoading;
    // Fetch projects data
    var _h = trpc_1.trpc.projects.list.useQuery({}), projectsData = _h.data, projectsLoading = _h.isLoading;
    // Fetch leave requests for pending approvals
    var leaveData = trpc_1.trpc.leave.list.useQuery({}).data;
    // Convert frozen Drizzle objects to plain objects to avoid React error #306
    var metricsPlain = metrics ? JSON.parse(JSON.stringify(metrics)) : null;
    var employeesDataPlain = employeesData ? JSON.parse(JSON.stringify(employeesData)) : [];
    var departmentsDataPlain = departmentsData ? JSON.parse(JSON.stringify(departmentsData)) : [];
    var projectsDataPlain = projectsData ? JSON.parse(JSON.stringify(projectsData)) : [];
    var leaveDataPlain = leaveData ? JSON.parse(JSON.stringify(leaveData)) : [];
    react_1.useEffect(function () {
        // Verify user has admin role
        if (!loading && isAuthenticated && (user === null || user === void 0 ? void 0 : user.role) !== "admin") {
            setLocation("/dashboard");
        }
    }, [loading, isAuthenticated, user, setLocation]);
    if (loading || metricsLoading) {
        return (React.createElement("div", { className: "min-h-screen flex items-center justify-center" },
            React.createElement("div", { className: "flex flex-col items-center gap-3" },
                React.createElement(lucide_react_1.Loader2, { className: "h-12 w-12 animate-spin text-blue-600" }),
                React.createElement("p", { className: "text-gray-600" }, "Loading dashboard..."))));
    }
    if (!isAuthenticated || (user === null || user === void 0 ? void 0 : user.role) !== "admin") {
        return null;
    }
    var handleLogout = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, logout()];
                case 1:
                    _a.sent();
                    setLocation("/login");
                    return [2 /*return*/];
            }
        });
    }); };
    // Calculate statistics
    var totalStaff = (employeesDataPlain === null || employeesDataPlain === void 0 ? void 0 : employeesDataPlain.length) || 0;
    var activeStaff = (employeesDataPlain === null || employeesDataPlain === void 0 ? void 0 : employeesDataPlain.filter(function (e) { return e.status === "active"; }).length) || 0;
    var totalDepartments = (departmentsDataPlain === null || departmentsDataPlain === void 0 ? void 0 : departmentsDataPlain.length) || 0;
    var activeDepartments = (departmentsDataPlain === null || departmentsDataPlain === void 0 ? void 0 : departmentsDataPlain.filter(function (d) { return d.isActive !== false; }).length) || 0;
    var pendingLeaves = (leaveDataPlain === null || leaveDataPlain === void 0 ? void 0 : leaveDataPlain.filter(function (l) { return l.status === "pending"; }).length) || 0;
    var activeProjects = (projectsDataPlain === null || projectsDataPlain === void 0 ? void 0 : projectsDataPlain.filter(function (p) { return p.status === "active"; }).length) || 0;
    // Filter staff based on search
    var filteredStaff = (employeesDataPlain === null || employeesDataPlain === void 0 ? void 0 : employeesDataPlain.filter(function (e) {
        var _a, _b, _c;
        return ((_a = e.name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(staffSearch.toLowerCase())) || ((_b = e.email) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(staffSearch.toLowerCase())) || ((_c = e.department) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(staffSearch.toLowerCase()));
    })) || [];
    // Module features for navigation
    var features = [
        {
            title: "Projects",
            description: "Manage and track all your projects",
            icon: lucide_react_1.FolderKanban,
            href: "/projects",
            color: "text-blue-500",
            bgColor: "bg-blue-50 dark:bg-blue-950"
        },
        {
            title: "Clients",
            description: "Client relationship management",
            icon: lucide_react_1.Users,
            href: "/clients",
            color: "text-green-500",
            bgColor: "bg-green-50 dark:bg-green-950"
        },
        {
            title: "Invoices",
            description: "Create and manage invoices",
            icon: lucide_react_1.FileText,
            href: "/invoices",
            color: "text-purple-500",
            bgColor: "bg-purple-50 dark:bg-purple-950"
        },
        {
            title: "Estimates",
            description: "Generate quotations and estimates",
            icon: lucide_react_1.Receipt,
            href: "/estimates",
            color: "text-orange-500",
            bgColor: "bg-orange-50 dark:bg-orange-950"
        },
        {
            title: "Payments",
            description: "Track payments and transactions",
            icon: lucide_react_1.DollarSign,
            href: "/payments",
            color: "text-emerald-500",
            bgColor: "bg-emerald-50 dark:bg-emerald-950"
        },
        {
            title: "Products",
            description: "Product catalog management",
            icon: lucide_react_1.Package,
            href: "/products",
            color: "text-cyan-500",
            bgColor: "bg-cyan-50 dark:bg-cyan-950"
        },
        {
            title: "Services",
            description: "Service offerings catalog",
            icon: lucide_react_1.Briefcase,
            href: "/services",
            color: "text-indigo-500",
            bgColor: "bg-indigo-50 dark:bg-indigo-950"
        },
        {
            title: "Accounting",
            description: "Financial management and reports",
            icon: lucide_react_1.CreditCard,
            href: "/accounting",
            color: "text-pink-500",
            bgColor: "bg-pink-50 dark:bg-pink-950"
        },
        {
            title: "Reports",
            description: "Analytics and insights",
            icon: lucide_react_1.BarChart3,
            href: "/reports",
            color: "text-amber-500",
            bgColor: "bg-amber-50 dark:bg-amber-950"
        },
        {
            title: "Financial Reports",
            description: "P&L, balance sheet, and cash flow",
            icon: lucide_react_1.FileText,
            href: "/finance/reports",
            color: "text-teal-500",
            bgColor: "bg-teal-50 dark:bg-teal-950"
        },
        {
            title: "Sales Analytics",
            description: "Revenue, trends, and collections",
            icon: lucide_react_1.TrendingDown,
            href: "/reports/sales",
            color: "text-violet-500",
            bgColor: "bg-violet-50 dark:bg-violet-950"
        },
        {
            title: "Data Import",
            description: "Import clients, employees, products",
            icon: lucide_react_1.Upload,
            href: "/import-excel",
            color: "text-sky-500",
            bgColor: "bg-sky-50 dark:bg-sky-950"
        },
        {
            title: "HR",
            description: "Human resources management",
            icon: lucide_react_1.UserCog,
            href: "/hr",
            color: "text-rose-500",
            bgColor: "bg-rose-50 dark:bg-rose-950"
        },
        {
            title: "Communications",
            description: "Email, SMS, and messaging",
            icon: lucide_react_1.Mail,
            href: "/communications",
            color: "text-indigo-500",
            bgColor: "bg-indigo-50 dark:bg-indigo-950"
        },
    ];
    // Mini sidebar items for responsive design
    var sidebarItems = [
        { title: "Projects", icon: lucide_react_1.FolderKanban, href: "/projects" },
        { title: "Clients", icon: lucide_react_1.Users, href: "/clients" },
        { title: "Invoices", icon: lucide_react_1.FileText, href: "/invoices" },
        { title: "Payments", icon: lucide_react_1.DollarSign, href: "/payments" },
        { title: "HR", icon: lucide_react_1.UserCog, href: "/hr" },
        { title: "Staff Chat", icon: lucide_react_1.Mail, href: "/staff-chat" },
        { title: "Reports", icon: lucide_react_1.BarChart3, href: "/reports" },
        { title: "Settings", icon: lucide_react_1.UserCog, href: "/admin/management" },
    ];
    return (React.createElement("div", { className: "flex h-screen bg-background" },
        React.createElement("div", { className: "hidden md:flex md:w-60 md:flex-col md:border-r md:bg-card" },
            React.createElement("div", { className: "p-4 border-b" },
                React.createElement("h2", { className: "text-lg font-bold flex items-center gap-2" },
                    React.createElement(lucide_react_1.Shield, { className: "w-5 h-5" }),
                    "Admin")),
            React.createElement("nav", { className: "flex-1 overflow-y-auto p-3 space-y-1" }, sidebarItems.map(function (item) {
                var Icon = item.icon;
                return (React.createElement("button", { key: item.href, onClick: function () {
                        setLocation(item.href);
                        setMobileNavOpen(false);
                    }, className: "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition hover:bg-muted" },
                    React.createElement(Icon, { className: "w-4 h-4" }),
                    React.createElement("span", { className: "truncate" }, item.title)));
            }))),
        mobileNavOpen && (React.createElement("div", { className: "fixed inset-0 z-40 bg-black/50 md:hidden", onClick: function () { return setMobileNavOpen(false); } },
            React.createElement("div", { className: "fixed left-0 top-0 h-full w-64 bg-card flex flex-col", onClick: function (e) { return e.stopPropagation(); } },
                React.createElement("div", { className: "p-4 border-b flex items-center justify-between" },
                    React.createElement("h2", { className: "text-lg font-bold flex items-center gap-2" },
                        React.createElement(lucide_react_1.Shield, { className: "w-5 h-5" }),
                        "Admin"),
                    React.createElement("button", { onClick: function () { return setMobileNavOpen(false); } },
                        React.createElement(lucide_react_1.X, { className: "w-5 h-5" }))),
                React.createElement("nav", { className: "flex-1 overflow-y-auto p-3 space-y-1" }, sidebarItems.map(function (item) {
                    var Icon = item.icon;
                    return (React.createElement("button", { key: item.href, onClick: function () {
                            setLocation(item.href);
                            setMobileNavOpen(false);
                        }, className: "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition hover:bg-muted" },
                        React.createElement(Icon, { className: "w-4 h-4" }),
                        React.createElement("span", { className: "truncate" }, item.title)));
                }))))),
        React.createElement("div", { className: "flex-1 flex flex-col overflow-hidden" },
            React.createElement("div", { className: "md:hidden flex items-center justify-between p-4 border-b bg-card" },
                React.createElement("h1", { className: "text-lg font-semibold" }, "Admin Dashboard"),
                React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { return setMobileNavOpen(!mobileNavOpen); } },
                    React.createElement(lucide_react_1.Menu, { className: "h-5 w-5" }))),
            React.createElement("div", { className: "flex-1 overflow-auto" },
                React.createElement(ModuleLayout_1.ModuleLayout, { title: "Admin Dashboard", description: "Manage organization, departments, staff, and system settings", icon: React.createElement(lucide_react_1.Shield, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/dashboard" }, { label: "Admin" }], actions: React.createElement("div", { className: "flex gap-2" },
                        React.createElement(button_1.Button, { onClick: function () { return setLocation("/admin/management"); }, variant: "secondary", size: "sm", className: "gap-2" },
                            React.createElement(lucide_react_1.UserCog, { className: "w-4 h-4" }),
                            "Staff Management"),
                        React.createElement(button_1.Button, { variant: "secondary", size: "sm", onClick: function () { return setLocation("/crm-home"); } }, "Go to Main Dashboard")) },
                    React.createElement("div", { className: "space-y-8" },
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                            React.createElement(stats_card_1.StatsCard, { label: "Total Staff", value: totalStaff, description: React.createElement(React.Fragment, null,
                                    activeStaff,
                                    " active"), color: "border-l-orange-500" }),
                            React.createElement(stats_card_1.StatsCard, { label: "Departments", value: totalDepartments, description: React.createElement(React.Fragment, null,
                                    activeDepartments,
                                    " active"), color: "border-l-purple-500" }),
                            React.createElement(stats_card_1.StatsCard, { label: "Pending Approvals", value: pendingLeaves, description: "Leave requests", color: "border-l-green-500" }),
                            React.createElement(stats_card_1.StatsCard, { label: "Active Projects", value: activeProjects, description: "In progress", color: "border-l-blue-500" })),
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3" }, features.map(function (feature) {
                            var Icon = feature.icon;
                            return (React.createElement(card_1.Card, { key: feature.href, className: "cursor-pointer hover:shadow-lg hover:shadow-primary/10 transition-all group hover:scale-105 border-2 hover:border-primary/50" },
                                React.createElement(card_1.CardHeader, { onClick: function () { return setLocation(feature.href); } },
                                    React.createElement("div", { className: "flex items-center justify-between" },
                                        React.createElement("div", { className: "p-3 rounded-lg " + feature.bgColor },
                                            React.createElement(Icon, { className: "h-6 w-6 " + feature.color })),
                                        React.createElement(lucide_react_1.ArrowRight, { className: "h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" })),
                                    React.createElement(card_1.CardTitle, { className: "mt-4" }, feature.title),
                                    React.createElement(card_1.CardDescription, null, feature.description)),
                                React.createElement(card_1.CardContent, null,
                                    React.createElement(button_1.Button, { variant: "ghost", className: "w-full group-hover:bg-accent", onClick: function () { return setLocation(feature.href); } },
                                        "View ",
                                        feature.title))));
                        })),
                        React.createElement(tabs_1.Tabs, { defaultValue: "overview", className: "space-y-4" },
                            React.createElement(tabs_1.TabsList, null,
                                React.createElement(tabs_1.TabsTrigger, { value: "overview", className: "flex items-center gap-2" },
                                    React.createElement(lucide_react_1.TrendingUp, { className: "w-4 h-4" }),
                                    "Overview"),
                                React.createElement(tabs_1.TabsTrigger, { value: "departments", className: "flex items-center gap-2" },
                                    React.createElement(lucide_react_1.Users, { className: "w-4 h-4" }),
                                    "Departments"),
                                React.createElement(tabs_1.TabsTrigger, { value: "staff", className: "flex items-center gap-2" },
                                    React.createElement(lucide_react_1.Users, { className: "w-4 h-4" }),
                                    "Staff Management"),
                                React.createElement(tabs_1.TabsTrigger, { value: "reports", className: "flex items-center gap-2" },
                                    React.createElement(lucide_react_1.FileText, { className: "w-4 h-4" }),
                                    "Reports")),
                            React.createElement(tabs_1.TabsContent, { value: "overview", className: "space-y-4" },
                                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                                    React.createElement(card_1.Card, null,
                                        React.createElement(card_1.CardHeader, null,
                                            React.createElement(card_1.CardTitle, { className: "text-slate-900 dark:text-slate-50" }, "System Overview")),
                                        React.createElement(card_1.CardContent, null,
                                            React.createElement("div", { className: "space-y-4" },
                                                React.createElement("div", { className: "flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg" },
                                                    React.createElement("div", null,
                                                        React.createElement("p", { className: "text-sm text-slate-600 dark:text-slate-300" }, "Total Employees"),
                                                        React.createElement("p", { className: "text-2xl font-bold text-blue-600 dark:text-blue-400" }, totalStaff)),
                                                    React.createElement(lucide_react_1.Users, { className: "h-8 w-8 text-blue-600 dark:text-blue-400" })),
                                                React.createElement("div", { className: "flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg" },
                                                    React.createElement("div", null,
                                                        React.createElement("p", { className: "text-sm text-slate-600 dark:text-slate-300" }, "Active Projects"),
                                                        React.createElement("p", { className: "text-2xl font-bold text-green-600 dark:text-green-400" }, activeProjects)),
                                                    React.createElement(lucide_react_1.FileText, { className: "h-8 w-8 text-green-600 dark:text-green-400" })),
                                                React.createElement("div", { className: "flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg" },
                                                    React.createElement("div", null,
                                                        React.createElement("p", { className: "text-sm text-slate-600 dark:text-slate-300" }, "Pending Approvals"),
                                                        React.createElement("p", { className: "text-2xl font-bold text-orange-600 dark:text-orange-400" }, pendingLeaves)),
                                                    React.createElement(lucide_react_1.AlertCircle, { className: "h-8 w-8 text-orange-600 dark:text-orange-400" }))))),
                                    React.createElement(card_1.Card, null,
                                        React.createElement(card_1.CardHeader, null,
                                            React.createElement(card_1.CardTitle, { className: "text-slate-900 dark:text-slate-50" }, "Quick Actions")),
                                        React.createElement(card_1.CardContent, { className: "space-y-2" },
                                            React.createElement(button_1.Button, { className: "w-full justify-start", onClick: function () { return setLocation("/employees/create"); } }, "Add New Staff Member"),
                                            React.createElement(button_1.Button, { variant: "outline", className: "w-full justify-start", onClick: function () { return setLocation("/departments/create"); } }, "Create Department"),
                                            React.createElement(button_1.Button, { variant: "outline", className: "w-full justify-start", onClick: function () { return setLocation("/reports"); } }, "View Reports"),
                                            React.createElement(button_1.Button, { variant: "outline", className: "w-full justify-start", onClick: function () { return setLocation("/leave"); } }, "Manage Approvals"))))),
                            React.createElement(tabs_1.TabsContent, { value: "departments", className: "space-y-4" },
                                React.createElement(card_1.Card, null,
                                    React.createElement(card_1.CardHeader, null,
                                        React.createElement("div", { className: "flex justify-between items-center" },
                                            React.createElement("div", null,
                                                React.createElement(card_1.CardTitle, { className: "text-slate-900 dark:text-slate-50" }, "Department Management"),
                                                React.createElement(card_1.CardDescription, { className: "text-slate-600 dark:text-slate-300" }, "Manage organization departments")),
                                            React.createElement(button_1.Button, { onClick: function () { return setLocation("/departments/create"); } }, "Add Department"))),
                                    React.createElement(card_1.CardContent, null, departmentsLoading ? (React.createElement("div", { className: "flex items-center justify-center py-8" },
                                        React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" }))) : Array.isArray(departmentsDataPlain) && departmentsDataPlain.length > 0 ? (React.createElement("div", { className: "space-y-3" }, departmentsDataPlain.map(function (dept) { return (React.createElement("div", { key: dept.id, className: "flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/30 cursor-pointer", onClick: function () { return setLocation("/departments/" + dept.id); } },
                                        React.createElement("div", null,
                                            React.createElement("p", { className: "font-medium text-sm text-slate-900 dark:text-slate-50" }, dept.name || "Unnamed Department"),
                                            React.createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400" }, dept.description || "No description")),
                                        React.createElement("div", { className: "flex gap-2 items-center" },
                                            React.createElement("span", { className: "px-2 py-1 rounded text-xs " + (dept.isActive !== false
                                                    ? "bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-200"
                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200") }, dept.isActive !== false ? "Active" : "Inactive"),
                                            React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function (e) {
                                                    e.stopPropagation();
                                                    setLocation("/departments/" + dept.id + "/edit");
                                                } }, "Edit")))); }))) : (React.createElement("div", { className: "text-center py-8 text-slate-500 dark:text-slate-400" }, "No departments found. Create your first department to get started."))))),
                            React.createElement(tabs_1.TabsContent, { value: "staff", className: "space-y-4" },
                                React.createElement(card_1.Card, null,
                                    React.createElement(card_1.CardHeader, null,
                                        React.createElement("div", { className: "flex justify-between items-center" },
                                            React.createElement("div", null,
                                                React.createElement(card_1.CardTitle, { className: "text-slate-900 dark:text-slate-50" }, "Staff Management"),
                                                React.createElement(card_1.CardDescription, { className: "text-slate-600 dark:text-slate-300" }, "Manage organization staff members")),
                                            React.createElement(button_1.Button, { onClick: function () { return setLocation("/employees/create"); } }, "Add Staff"))),
                                    React.createElement(card_1.CardContent, null,
                                        React.createElement("div", { className: "space-y-4" },
                                            React.createElement("div", { className: "relative" },
                                                React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" }),
                                                React.createElement(input_1.Input, { placeholder: "Search staff members...", className: "pl-10", value: staffSearch, onChange: function (e) { return setStaffSearch(e.target.value); } })),
                                            employeesLoading ? (React.createElement("div", { className: "flex items-center justify-center py-8" },
                                                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" }))) : filteredStaff.length > 0 ? (React.createElement("div", { className: "border rounded-lg overflow-hidden" },
                                                React.createElement(table_1.Table, null,
                                                    React.createElement(table_1.TableHeader, null,
                                                        React.createElement(table_1.TableRow, null,
                                                            React.createElement(table_1.TableHead, null, "Name"),
                                                            React.createElement(table_1.TableHead, null, "Department"),
                                                            React.createElement(table_1.TableHead, null, "Position"),
                                                            React.createElement(table_1.TableHead, null, "Status"),
                                                            React.createElement(table_1.TableHead, null, "Actions"))),
                                                    React.createElement(table_1.TableBody, null, filteredStaff.map(function (employee) { return (React.createElement(table_1.TableRow, { key: employee.id },
                                                        React.createElement(table_1.TableCell, null, employee.name || "N/A"),
                                                        React.createElement(table_1.TableCell, null, employee.department || "Unassigned"),
                                                        React.createElement(table_1.TableCell, null, employee.position || "N/A"),
                                                        React.createElement(table_1.TableCell, null,
                                                            React.createElement("span", { className: "px-2 py-1 rounded text-xs " + (employee.status === "active"
                                                                    ? "bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-200"
                                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200") }, employee.status || "Unknown")),
                                                        React.createElement(table_1.TableCell, null,
                                                            React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return setLocation("/employees/" + employee.id); } }, "Edit")))); }))))) : (React.createElement("div", { className: "text-center py-8 text-slate-500 dark:text-slate-400" }, staffSearch
                                                ? "No staff members found matching your search"
                                                : "No staff members found. Add your first employee to get started.")))))),
                            React.createElement(tabs_1.TabsContent, { value: "reports", className: "space-y-4" },
                                React.createElement(card_1.Card, null,
                                    React.createElement(card_1.CardHeader, null,
                                        React.createElement(card_1.CardTitle, { className: "text-slate-900 dark:text-slate-50" }, "Reports"),
                                        React.createElement(card_1.CardDescription, { className: "text-slate-600 dark:text-slate-300" }, "Generate and view administrative reports")),
                                    React.createElement(card_1.CardContent, { className: "space-y-3" },
                                        React.createElement("div", { className: "p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/30 cursor-pointer", onClick: function () { return setLocation("/reports/staff"); } },
                                            React.createElement("p", { className: "font-medium text-sm text-slate-900 dark:text-slate-50" }, "Staff Report"),
                                            React.createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400" },
                                                "View staff statistics and details (",
                                                totalStaff,
                                                " employees)")),
                                        React.createElement("div", { className: "p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/30 cursor-pointer", onClick: function () { return setLocation("/reports/departments"); } },
                                            React.createElement("p", { className: "font-medium text-sm text-slate-900 dark:text-slate-50" }, "Department Report"),
                                            React.createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400" },
                                                "View department performance metrics (",
                                                totalDepartments,
                                                " departments)")),
                                        React.createElement("div", { className: "p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/30 cursor-pointer", onClick: function () { return setLocation("/reports/projects"); } },
                                            React.createElement("p", { className: "font-medium text-sm text-slate-900 dark:text-slate-50" }, "Project Report"),
                                            React.createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400" },
                                                "View project status and progress (",
                                                activeProjects,
                                                " active)")),
                                        React.createElement("div", { className: "p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/30 cursor-pointer", onClick: function () { return setLocation("/reports/leave"); } },
                                            React.createElement("p", { className: "font-medium text-sm text-slate-900 dark:text-slate-50" }, "Leave Report"),
                                            React.createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400" },
                                                "View leave requests and approvals (",
                                                pendingLeaves,
                                                " pending)"))))))))))));
}
exports["default"] = AdminDashboard;
