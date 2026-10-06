"use strict";
exports.__esModule = true;
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var useAuthWithPersistence_1 = require("@/_core/hooks/useAuthWithPersistence");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var stats_card_1 = require("@/components/ui/stats-card");
var card_1 = require("@/components/ui/card");
var utils_1 = require("@/lib/utils");
/**
 * HR Module Hub
 *
 * Central gateway for all HR functionalities including:
 * - Employee Management
 * - Attendance Tracking
 * - Payroll Management
 * - Leave Management
 * - Department Management
 * - HR Analytics & Reports
 */
function HR() {
    var _a, _b, _c;
    var _d = wouter_1.useLocation(), navigate = _d[1];
    var _e = useAuthWithPersistence_1.useAuthWithPersistence({
        redirectOnUnauthenticated: true
    }), user = _e.user, loading = _e.loading, isAuthenticated = _e.isAuthenticated;
    var _f = permissions_1.useRequireFeature("hr:view"), allowed = _f.allowed, permissionLoading = _f.isLoading;
    // Fetch HR metrics from backend
    var _g = trpc_1.trpc.employees.list.useQuery(), _h = _g.data, employeesData = _h === void 0 ? [] : _h, employeesLoading = _g.isLoading;
    var _j = trpc_1.trpc.attendance.list.useQuery(), _k = _j.data, attendanceData = _k === void 0 ? [] : _k, attendanceLoading = _j.isLoading;
    var _l = trpc_1.trpc.payroll.list.useQuery(), _m = _l.data, payrollData = _m === void 0 ? [] : _m, payrollLoading = _l.isLoading;
    var _o = trpc_1.trpc.leave.list.useQuery(), _p = _o.data, leaveData = _p === void 0 ? [] : _p, leaveLoading = _o.isLoading;
    var _q = trpc_1.trpc.departments.list.useQuery(), _r = _q.data, departmentsData = _r === void 0 ? [] : _r, departmentsLoading = _q.isLoading;
    var _s = trpc_1.trpc.jobGroups.list.useQuery(), _t = _s.data, jobGroupsData = _t === void 0 ? [] : _t, jobGroupsLoading = _s.isLoading;
    if (loading || permissionLoading) {
        return (React.createElement("div", { className: "min-h-screen flex items-center justify-center" },
            React.createElement(spinner_1.Spinner, null)));
    }
    if (!allowed) {
        return null;
    }
    // Calculate metrics from real data
    var totalEmployees = (employeesData === null || employeesData === void 0 ? void 0 : employeesData.length) || 0;
    var activeEmployees = ((_a = employeesData === null || employeesData === void 0 ? void 0 : employeesData.filter(function (e) { return e.isActive; })) === null || _a === void 0 ? void 0 : _a.length) || 0;
    var pendingLeaveRequests = ((_b = leaveData === null || leaveData === void 0 ? void 0 : leaveData.filter(function (l) { return l.status === 'pending'; })) === null || _b === void 0 ? void 0 : _b.length) || 0;
    var totalDepartments = (departmentsData === null || departmentsData === void 0 ? void 0 : departmentsData.length) || 0;
    var absentToday = ((_c = attendanceData === null || attendanceData === void 0 ? void 0 : attendanceData.filter(function (a) {
        var today = new Date().toISOString().split('T')[0];
        return a.date === today && a.status === 'absent';
    })) === null || _c === void 0 ? void 0 : _c.length) || 0;
    // Module cards data - Unified card style
    var modules = [
        {
            title: "Employees",
            description: "Manage employee records, profiles, and information",
            icon: lucide_react_1.Users,
            href: "/employees",
            borderColor: "border-l-blue-500",
            iconBg: "bg-blue-50 dark:bg-blue-950",
            iconColor: "text-blue-600 dark:text-blue-400",
            stats: { label: "Active", value: activeEmployees }
        },
        {
            title: "Departments",
            description: "Organize and manage department structure",
            icon: lucide_react_1.Building2,
            href: "/departments",
            borderColor: "border-l-purple-500",
            iconBg: "bg-purple-50 dark:bg-purple-950",
            iconColor: "text-purple-600 dark:text-purple-400",
            stats: { label: "Departments", value: totalDepartments }
        },
        {
            title: "Attendance",
            description: "Track employee attendance and working hours",
            icon: lucide_react_1.Calendar,
            href: "/attendance",
            borderColor: "border-l-green-500",
            iconBg: "bg-green-50 dark:bg-green-950",
            iconColor: "text-green-600 dark:text-green-400",
            stats: { label: "Absent Today", value: absentToday }
        },
        {
            title: "Leave Management",
            description: "Handle leave requests, approvals, and tracking",
            icon: lucide_react_1.Clock,
            href: "/leave-management",
            borderColor: "border-l-orange-500",
            iconBg: "bg-orange-50 dark:bg-orange-950",
            iconColor: "text-orange-600 dark:text-orange-400",
            stats: { label: "Pending", value: pendingLeaveRequests }
        },
        {
            title: "Payroll",
            description: "Process salaries, allowances, and deductions",
            icon: lucide_react_1.DollarSign,
            href: "/payroll",
            borderColor: "border-l-pink-500",
            iconBg: "bg-pink-50 dark:bg-pink-950",
            iconColor: "text-pink-600 dark:text-pink-400",
            stats: { label: "Records", value: (payrollData === null || payrollData === void 0 ? void 0 : payrollData.length) || 0 }
        },
        {
            title: "Performance",
            description: "Track and manage employee performance reviews",
            icon: lucide_react_1.TrendingUp,
            href: "/performance-reviews",
            borderColor: "border-l-indigo-500",
            iconBg: "bg-indigo-50 dark:bg-indigo-950",
            iconColor: "text-indigo-600 dark:text-indigo-400",
            stats: { label: "Reviews", value: 0 }
        },
        {
            title: "Job Groups",
            description: "Manage job grades, salary structures, and classifications",
            icon: lucide_react_1.Building2,
            href: "/job-groups",
            borderColor: "border-l-cyan-500",
            iconBg: "bg-cyan-50 dark:bg-cyan-950",
            iconColor: "text-cyan-600 dark:text-cyan-400",
            stats: { label: "Groups", value: (jobGroupsData === null || jobGroupsData === void 0 ? void 0 : jobGroupsData.length) || 0 }
        },
    ];
    if (loading) {
        return (React.createElement(DashboardLayout, null,
            React.createElement("div", { className: "flex items-center justify-center min-h-screen" },
                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))));
    }
    if (!isAuthenticated) {
        return null;
    }
    var isLoading = employeesLoading || attendanceLoading || payrollLoading || leaveLoading || departmentsLoading;
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Human Resources", description: "Manage employees, departments, attendance, leave, payroll, and more", icon: React.createElement(lucide_react_1.Users, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "HR" },
        ] },
        React.createElement("div", { className: "space-y-6 p-4 sm:p-6" },
            React.createElement("div", { className: "grid gap-4 md:grid-cols-5" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Employees", value: totalEmployees, description: React.createElement(React.Fragment, null,
                        activeEmployees,
                        " active"), icon: React.createElement(lucide_react_1.Users, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Departments", value: totalDepartments, description: "Organizational units", icon: React.createElement(lucide_react_1.Building2, { className: "h-5 w-5" }), color: "border-l-purple-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Absent Today", value: absentToday, description: "Employees", icon: React.createElement(lucide_react_1.AlertCircle, { className: "h-5 w-5" }), color: "border-l-red-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Pending Leaves", value: pendingLeaveRequests, description: "Awaiting approval", icon: React.createElement(lucide_react_1.Clock, { className: "h-5 w-5" }), color: "border-l-orange-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Payroll Records", value: (payrollData === null || payrollData === void 0 ? void 0 : payrollData.length) || 0, description: "This month", icon: React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }), color: "border-l-green-500" })),
            React.createElement("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3" }, modules.map(function (module) {
                var Icon = module.icon;
                return (React.createElement("button", { key: module.href, onClick: function () { return navigate(module.href); }, className: utils_1.cn("group relative overflow-hidden rounded-xl border-l-4 p-4 sm:p-5 text-left transition-all duration-300", "bg-white dark:bg-slate-800/60 border-t border-r border-b border-slate-200 dark:border-slate-700", "hover:shadow-xl hover:-translate-y-1 cursor-pointer", module.borderColor) },
                    React.createElement("div", { className: "absolute inset-0 opacity-0 group-hover:opacity-[0.07] transition-opacity duration-300 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 pointer-events-none" }),
                    React.createElement("div", { className: "relative" },
                        React.createElement("div", { className: "flex items-center justify-between mb-3" },
                            React.createElement("div", { className: "p-2.5 rounded-lg " + module.iconBg },
                                React.createElement(Icon, { className: "h-5 w-5 " + module.iconColor })),
                            React.createElement(lucide_react_1.ArrowRight, { className: "h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" })),
                        React.createElement("h3", { className: "font-bold text-sm text-slate-900 dark:text-slate-50" }, module.title),
                        React.createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400 mt-1" }, module.description),
                        React.createElement("div", { className: "mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50" },
                            React.createElement("p", { className: "text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400" }, module.stats.label),
                            React.createElement("p", { className: "text-xl font-bold text-slate-900 dark:text-slate-50 mt-0.5" }, module.stats.value))),
                    React.createElement("div", { className: "absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-gradient-to-r from-transparent via-current to-transparent" })));
            })),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Quick Actions"),
                    React.createElement(card_1.CardDescription, null, "Common HR tasks")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid gap-2 md:grid-cols-3" },
                        React.createElement(button_1.Button, { variant: "outline", className: "w-full justify-start", onClick: function () { return navigate("/employees/create"); } },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                            "Add New Employee"),
                        React.createElement(button_1.Button, { variant: "outline", className: "w-full justify-start", onClick: function () { return navigate("/departments/create"); } },
                            React.createElement(lucide_react_1.Building2, { className: "h-4 w-4 mr-2" }),
                            "Create Department"),
                        React.createElement(button_1.Button, { variant: "outline", className: "w-full justify-start", onClick: function () { return navigate("/attendance/create"); } },
                            React.createElement(lucide_react_1.Calendar, { className: "h-4 w-4 mr-2" }),
                            "Record Attendance"),
                        React.createElement(button_1.Button, { variant: "outline", className: "w-full justify-start", onClick: function () { return navigate("/leave-management/create"); } },
                            React.createElement(lucide_react_1.Clock, { className: "h-4 w-4 mr-2" }),
                            "Process Leave Request"),
                        React.createElement(button_1.Button, { variant: "outline", className: "w-full justify-start", onClick: function () { return navigate("/payroll/create"); } },
                            React.createElement(lucide_react_1.DollarSign, { className: "h-4 w-4 mr-2" }),
                            "Process Payroll"),
                        React.createElement(button_1.Button, { variant: "outline", className: "w-full justify-start", onClick: function () { return navigate("/job-groups"); } },
                            React.createElement(lucide_react_1.Building2, { className: "h-4 w-4 mr-2" }),
                            "Manage Job Groups"),
                        React.createElement(button_1.Button, { variant: "outline", className: "w-full justify-start", onClick: function () { return navigate("/hr/analytics"); } },
                            React.createElement(lucide_react_1.TrendingUp, { className: "h-4 w-4 mr-2" }),
                            "View HR Analytics")))))));
}
exports["default"] = HR;
