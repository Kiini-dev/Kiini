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
var TeamWorkloadDashboard_1 = require("@/components/TeamWorkloadDashboard");
var stats_card_1 = require("@/components/ui/stats-card");
var table_1 = require("@/components/ui/table");
/**
 * HRDashboard component
 *
 * Features:
 * - Employee management
 * - Attendance tracking
 * - Leave management
 * - Payroll overview
 * - Performance reviews
 * - Recruitment
 */
function HRDashboard() {
    var _this = this;
    var _a = useAuthWithPersistence_1.useAuthWithPersistence({
        redirectOnUnauthenticated: true
    }), user = _a.user, loading = _a.loading, isAuthenticated = _a.isAuthenticated, logout = _a.logout;
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    var _c = react_1.useState(false), mobileQuickAccessOpen = _c[0], setMobileQuickAccessOpen = _c[1];
    // Fetch employees data from backend
    var _d = trpc_1.trpc.employees.list.useQuery(), employeesData = _d.data, employeesLoading = _d.isLoading;
    // Fetch attendance data from backend
    var _e = trpc_1.trpc.attendance.list.useQuery(), attendanceData = _e.data, attendanceLoading = _e.isLoading;
    // Fetch leave requests from backend
    var _f = trpc_1.trpc.leave.list.useQuery(), leaveData = _f.data, leaveLoading = _f.isLoading;
    // Fetch payroll data from backend
    var _g = trpc_1.trpc.payroll.list.useQuery(), payrollData = _g.data, payrollLoading = _g.isLoading;
    // Convert frozen Drizzle objects to plain objects to avoid React error #306
    var employeesDataPlain = employeesData ? JSON.parse(JSON.stringify(employeesData)) : [];
    var attendanceDataPlain = attendanceData ? JSON.parse(JSON.stringify(attendanceData)) : [];
    var leaveDataPlain = leaveData ? JSON.parse(JSON.stringify(leaveData)) : [];
    var payrollDataPlain = payrollData ? JSON.parse(JSON.stringify(payrollData)) : [];
    react_1.useEffect(function () {
        // Verify user has hr role
        if (!loading && isAuthenticated && (user === null || user === void 0 ? void 0 : user.role) !== "hr") {
            setLocation("/dashboard");
        }
    }, [loading, isAuthenticated, user, setLocation]);
    if (loading || employeesLoading) {
        return (React.createElement("div", { className: "min-h-screen flex items-center justify-center" },
            React.createElement("div", { className: "flex flex-col items-center gap-3" },
                React.createElement(lucide_react_1.Loader2, { className: "h-12 w-12 animate-spin text-blue-600" }),
                React.createElement("p", { className: "text-gray-600" }, "Loading dashboard..."))));
    }
    if (!isAuthenticated || (user === null || user === void 0 ? void 0 : user.role) !== "hr") {
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
    // Calculate employee statistics
    var totalEmployees = (employeesDataPlain === null || employeesDataPlain === void 0 ? void 0 : employeesDataPlain.length) || 0;
    var activeEmployees = (employeesDataPlain === null || employeesDataPlain === void 0 ? void 0 : employeesDataPlain.filter(function (e) { return e.status === "active"; }).length) || 0;
    // Calculate today's attendance
    var today = new Date().toISOString().split('T')[0];
    var todayAttendance = (attendanceDataPlain === null || attendanceDataPlain === void 0 ? void 0 : attendanceDataPlain.filter(function (a) {
        return a.date && new Date(a.date).toISOString().split('T')[0] === today;
    })) || [];
    var presentToday = todayAttendance.filter(function (a) { return a.status === "present" || a.status === "late"; }).length;
    var absentToday = todayAttendance.filter(function (a) { return a.status === "absent"; }).length;
    var lateToday = todayAttendance.filter(function (a) { return a.status === "late"; }).length;
    var attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;
    // Calculate leave statistics
    var approvedLeaves = (leaveDataPlain === null || leaveDataPlain === void 0 ? void 0 : leaveDataPlain.filter(function (l) { return l.status === "approved"; }).length) || 0;
    var pendingLeaves = (leaveDataPlain === null || leaveDataPlain === void 0 ? void 0 : leaveDataPlain.filter(function (l) { return l.status === "pending"; }).length) || 0;
    var recentLeaveRequests = (leaveDataPlain === null || leaveDataPlain === void 0 ? void 0 : leaveDataPlain.filter(function (l) { return l.status === "pending"; }).slice(0, 5)) || [];
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
            title: "HR Analytics",
            description: "Employee metrics and trends",
            icon: lucide_react_1.TrendingUp,
            href: "/hr/analytics",
            color: "text-cyan-500",
            bgColor: "bg-cyan-50 dark:bg-cyan-950"
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
            color: "text-teal-500",
            bgColor: "bg-teal-50 dark:bg-teal-950"
        },
    ];
    // Quick access items for mobile menu
    var quickAccessItems = [
        { title: "Employees", icon: lucide_react_1.Users, href: "/employees" },
        { title: "Attendance", icon: lucide_react_1.Clock, href: "/hr/attendance" },
        { title: "Leave Requests", icon: lucide_react_1.Calendar, href: "/hr/leaves" },
        { title: "Payroll", icon: lucide_react_1.DollarSign, href: "/payroll" },
        { title: "HR Management", icon: lucide_react_1.UserCog, href: "/hr/management" },
    ];
    return (React.createElement("div", { className: "flex flex-col h-screen overflow-hidden" },
        React.createElement("div", { className: "md:hidden flex items-center justify-between p-4 border-b bg-card" },
            React.createElement("h1", { className: "text-lg font-bold flex items-center gap-2" },
                React.createElement(lucide_react_1.Users, { className: "h-5 w-5" }),
                "HR Dashboard"),
            React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { return setMobileQuickAccessOpen(!mobileQuickAccessOpen); } },
                React.createElement(lucide_react_1.Menu, { className: "h-5 w-5" }))),
        mobileQuickAccessOpen && (React.createElement("div", { className: "md:hidden p-3 border-b bg-muted space-y-2" }, quickAccessItems.map(function (item) {
            var Icon = item.icon;
            return (React.createElement("button", { key: item.href, onClick: function () {
                    setLocation(item.href);
                    setMobileQuickAccessOpen(false);
                }, className: "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-colors" },
                React.createElement(Icon, { className: "w-4 h-4" }),
                React.createElement("span", null, item.title)));
        }))),
        React.createElement("div", { className: "flex-1 overflow-auto" },
            React.createElement(ModuleLayout_1.ModuleLayout, { title: "HR Dashboard", description: "Manage employees, attendance, leave requests, and payroll operations", icon: React.createElement(lucide_react_1.Users, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/dashboard" }, { label: "HR" }], actions: React.createElement("div", { className: "flex gap-2" },
                    React.createElement(button_1.Button, { onClick: function () { return setLocation("/hr/management"); }, variant: "secondary", size: "sm", className: "gap-2 hidden sm:flex" },
                        React.createElement(lucide_react_1.Settings, { className: "w-4 h-4" }),
                        "HR Management"),
                    React.createElement(button_1.Button, { variant: "secondary", size: "sm", onClick: function () { return setLocation("/crm-home"); }, className: "hidden sm:flex" }, "Go to Main Dashboard")) },
                React.createElement("div", { className: "space-y-8" },
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                        React.createElement(stats_card_1.StatsCard, { label: "Total Employees", value: totalEmployees, description: React.createElement(React.Fragment, null,
                                activeEmployees,
                                " active"), color: "border-l-orange-500" }),
                        React.createElement(stats_card_1.StatsCard, { label: "Today's Attendance", value: React.createElement(React.Fragment, null,
                                presentToday,
                                "/",
                                React.createElement("span", { className: "text-sm text-slate-600 dark:text-slate-300" }, totalEmployees)), description: React.createElement(React.Fragment, null,
                                attendanceRate,
                                "% attendance rate"), color: "border-l-purple-500" }),
                        React.createElement(stats_card_1.StatsCard, { label: "Pending Leave Requests", value: (leaveDataPlain === null || leaveDataPlain === void 0 ? void 0 : leaveDataPlain.filter(function (l) { return l.status === "pending"; }).length) || 0, description: "Awaiting approval", color: "border-l-green-500" }),
                        React.createElement(stats_card_1.StatsCard, { label: "Payroll Cycles", value: (payrollDataPlain === null || payrollDataPlain === void 0 ? void 0 : payrollDataPlain.length) || 0, description: "Total cycles", color: "border-l-blue-500" })),
                    React.createElement("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3" }, features.map(function (feature) {
                        var Icon = feature.icon;
                        return (React.createElement(card_1.Card, { key: feature.href, className: "cursor-pointer hover:shadow-lg hover:shadow-primary/10 transition-all group hover:scale-105 border-2 hover:border-primary/50", onClick: function () { return setLocation(feature.href); } },
                            React.createElement(card_1.CardHeader, null,
                                React.createElement("div", { className: "flex items-center justify-between" },
                                    React.createElement("div", { className: "p-3 rounded-lg " + feature.bgColor },
                                        React.createElement(Icon, { className: "h-6 w-6 " + feature.color })),
                                    React.createElement(lucide_react_1.ArrowRight, { className: "h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" })),
                                React.createElement(card_1.CardTitle, { className: "mt-4" }, feature.title),
                                React.createElement(card_1.CardDescription, null, feature.description)),
                            React.createElement(card_1.CardContent, null,
                                React.createElement(button_1.Button, { variant: "ghost", className: "w-full group-hover:bg-accent" },
                                    "View ",
                                    feature.title))));
                    })),
                    React.createElement(tabs_1.Tabs, { defaultValue: "employees", className: "space-y-4" },
                        React.createElement(tabs_1.TabsList, { className: "overflow-x-auto" },
                            React.createElement(tabs_1.TabsTrigger, { value: "employees", className: "flex items-center gap-2 whitespace-nowrap" },
                                React.createElement(lucide_react_1.Users, { className: "w-4 h-4" }),
                                React.createElement("span", { className: "hidden sm:inline" }, "Employees")),
                            React.createElement(tabs_1.TabsTrigger, { value: "attendance", className: "flex items-center gap-2 whitespace-nowrap" },
                                React.createElement(lucide_react_1.Clock, { className: "w-4 h-4" }),
                                React.createElement("span", { className: "hidden sm:inline" }, "Attendance")),
                            React.createElement(tabs_1.TabsTrigger, { value: "leave", className: "flex items-center gap-2 whitespace-nowrap" },
                                React.createElement(lucide_react_1.Calendar, { className: "w-4 h-4" }),
                                React.createElement("span", { className: "hidden sm:inline" }, "Leave")),
                            React.createElement(tabs_1.TabsTrigger, { value: "payroll", className: "flex items-center gap-2 whitespace-nowrap" },
                                React.createElement(lucide_react_1.FileText, { className: "w-4 h-4" }),
                                React.createElement("span", { className: "hidden sm:inline" }, "Payroll")),
                            React.createElement(tabs_1.TabsTrigger, { value: "workload", className: "flex items-center gap-2 whitespace-nowrap" },
                                React.createElement(lucide_react_1.TrendingUp, { className: "w-4 h-4" }),
                                React.createElement("span", { className: "hidden sm:inline" }, "Workload"))),
                        React.createElement(tabs_1.TabsContent, { value: "employees", className: "space-y-4" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement("div", { className: "flex justify-between items-center" },
                                        React.createElement("div", null,
                                            React.createElement(card_1.CardTitle, { className: "text-slate-900 dark:text-slate-50" }, "Employee Management"),
                                            React.createElement(card_1.CardDescription, { className: "text-slate-600 dark:text-slate-300" }, "Manage employee information and records")),
                                        React.createElement(button_1.Button, { onClick: function () { return setLocation("/employees/create"); } }, "Add Employee"))),
                                React.createElement(card_1.CardContent, null,
                                    React.createElement("div", { className: "space-y-4" },
                                        React.createElement(input_1.Input, { placeholder: "Search employees..." }),
                                        React.createElement("div", { className: "border rounded-lg" },
                                            React.createElement(table_1.Table, null,
                                                React.createElement(table_1.TableHeader, null,
                                                    React.createElement(table_1.TableRow, null,
                                                        React.createElement(table_1.TableHead, null, "Name"),
                                                        React.createElement(table_1.TableHead, null, "Position"),
                                                        React.createElement(table_1.TableHead, null, "Department"),
                                                        React.createElement(table_1.TableHead, null, "Status"),
                                                        React.createElement(table_1.TableHead, null, "Actions"))),
                                                React.createElement(table_1.TableBody, null, Array.isArray(employeesData) && employeesData.length > 0 ? (employeesData.slice(0, 10).map(function (employee) { return (React.createElement(table_1.TableRow, { key: employee.id },
                                                    React.createElement(table_1.TableCell, null, employee.name || 'N/A'),
                                                    React.createElement(table_1.TableCell, null, employee.position || 'N/A'),
                                                    React.createElement(table_1.TableCell, null, employee.department || 'N/A'),
                                                    React.createElement(table_1.TableCell, null,
                                                        React.createElement("span", { className: "px-2 py-1 rounded text-xs " + (employee.status === 'active' ? 'bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200') }, employee.status || 'Active')),
                                                    React.createElement(table_1.TableCell, null,
                                                        React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return setLocation("/employees/" + employee.id); } }, "View")))); })) : (React.createElement(table_1.TableRow, null,
                                                    React.createElement(table_1.TableCell, { colSpan: 5, className: "text-center py-8 text-slate-500 dark:text-slate-400" }, "No employees found")))))))))),
                        React.createElement(tabs_1.TabsContent, { value: "attendance", className: "space-y-4" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement("div", { className: "flex justify-between items-center" },
                                        React.createElement("div", null,
                                            React.createElement(card_1.CardTitle, { className: "text-slate-900 dark:text-slate-50" }, "Attendance Tracking"),
                                            React.createElement(card_1.CardDescription, { className: "text-slate-600 dark:text-slate-300" }, "Monitor employee attendance records")),
                                        React.createElement(button_1.Button, { onClick: function () { return setLocation("/attendance/new"); } }, "Mark Attendance"))),
                                React.createElement(card_1.CardContent, null,
                                    React.createElement("div", { className: "space-y-4" },
                                        React.createElement("div", { className: "grid grid-cols-3 gap-4" },
                                            React.createElement("div", { className: "p-4 bg-green-50 dark:bg-green-950/30 rounded-lg" },
                                                React.createElement("p", { className: "text-sm text-slate-600 dark:text-slate-300" }, "Present"),
                                                React.createElement("p", { className: "text-2xl font-bold text-green-600 dark:text-green-400 mt-1" }, presentToday)),
                                            React.createElement("div", { className: "p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg" },
                                                React.createElement("p", { className: "text-sm text-slate-600 dark:text-slate-300" }, "Absent"),
                                                React.createElement("p", { className: "text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1" }, absentToday)),
                                            React.createElement("div", { className: "p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg" },
                                                React.createElement("p", { className: "text-sm text-slate-600 dark:text-slate-300" }, "Late"),
                                                React.createElement("p", { className: "text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1" }, lateToday))),
                                        todayAttendance.length === 0 && (React.createElement("div", { className: "text-center py-8 text-slate-500 dark:text-slate-400" },
                                            React.createElement("p", null, "No attendance records for today"),
                                            React.createElement(button_1.Button, { className: "mt-4", onClick: function () { return setLocation("/attendance/new"); } }, "Mark Attendance"))))))),
                        React.createElement(tabs_1.TabsContent, { value: "leave", className: "space-y-4" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement("div", { className: "flex justify-between items-center" },
                                        React.createElement("div", null,
                                            React.createElement(card_1.CardTitle, { className: "text-slate-900 dark:text-slate-50" }, "Leave Management"),
                                            React.createElement(card_1.CardDescription, { className: "text-slate-600 dark:text-slate-300" }, "Manage employee leave requests")),
                                        React.createElement(button_1.Button, { onClick: function () { return setLocation("/leave-management/create"); } }, "New Leave Request"))),
                                React.createElement(card_1.CardContent, null,
                                    React.createElement("div", { className: "space-y-3" }, recentLeaveRequests.length > 0 ? (recentLeaveRequests.map(function (leave) { return (React.createElement("div", { key: leave.id, className: "p-3 border rounded-lg" },
                                        React.createElement("div", { className: "flex justify-between items-start" },
                                            React.createElement("div", null,
                                                React.createElement("p", { className: "font-medium text-sm text-slate-900 dark:text-slate-50" },
                                                    leave.employeeName || 'Employee',
                                                    " - ",
                                                    leave.type || 'Leave'),
                                                React.createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400" },
                                                    leave.startDate ? new Date(leave.startDate).toLocaleDateString() : 'N/A',
                                                    " - ",
                                                    leave.endDate ? new Date(leave.endDate).toLocaleDateString() : 'N/A')),
                                            React.createElement("div", { className: "flex gap-2" },
                                                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setLocation("/leave/" + leave.id); } }, "Review"))))); })) : (React.createElement("p", { className: "text-center py-8 text-slate-500 dark:text-slate-400" }, "No pending leave requests")))))),
                        React.createElement(tabs_1.TabsContent, { value: "payroll", className: "space-y-4" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement("div", { className: "flex justify-between items-center" },
                                        React.createElement("div", null,
                                            React.createElement(card_1.CardTitle, { className: "text-slate-900 dark:text-slate-50" }, "Payroll Management"),
                                            React.createElement(card_1.CardDescription, { className: "text-slate-600 dark:text-slate-300" }, "Manage employee payroll and salaries")),
                                        React.createElement(button_1.Button, { onClick: function () { return setLocation("/payroll/create"); } }, "Process Payroll"))),
                                React.createElement(card_1.CardContent, null,
                                    React.createElement("div", { className: "space-y-3" }, Array.isArray(payrollData) && payrollData.length > 0 ? (payrollData.slice(0, 5).map(function (payroll) { return (React.createElement("div", { key: payroll.id, className: "p-3 border rounded-lg" },
                                        React.createElement("div", { className: "flex justify-between items-center" },
                                            React.createElement("div", null,
                                                React.createElement("p", { className: "font-medium text-sm text-slate-900 dark:text-slate-50" },
                                                    payroll.month || 'Month',
                                                    " ",
                                                    payroll.year || 'Year',
                                                    " Payroll"),
                                                React.createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400" }, payroll.status === 'processed' ? 'Processed' : 'Pending processing')),
                                            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setLocation("/payroll/" + payroll.id); } }, "View")))); })) : (React.createElement("div", { className: "text-center py-8 text-slate-500 dark:text-slate-400" },
                                        React.createElement("p", null, "No payroll records found"),
                                        React.createElement(button_1.Button, { className: "mt-4", onClick: function () { return setLocation("/payroll/create"); } }, "Process Payroll"))))))),
                        React.createElement(tabs_1.TabsContent, { value: "workload", className: "space-y-4" },
                            React.createElement(TeamWorkloadDashboard_1["default"], null))))))));
}
exports["default"] = HRDashboard;
