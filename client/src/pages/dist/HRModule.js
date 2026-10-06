"use strict";
exports.__esModule = true;
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var wouter_1 = require("wouter");
var trpc_1 = require("@/lib/trpc");
function HRModule() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    // Fetch HR metrics from backend
    var employeesData = trpc_1.trpc.employees.list.useQuery().data;
    var departmentsData = trpc_1.trpc.departments.list.useQuery().data;
    var totalEmployees = (employeesData === null || employeesData === void 0 ? void 0 : employeesData.length) || 0;
    var totalDepartments = (departmentsData === null || departmentsData === void 0 ? void 0 : departmentsData.length) || 0;
    var hrModules = [
        {
            title: "Employees",
            description: "Manage employee information and records",
            icon: lucide_react_1.Users,
            href: "/employees",
            stats: { label: "Total Employees", value: totalEmployees.toString() }
        },
        {
            title: "Departments",
            description: "Organize employees by departments",
            icon: lucide_react_1.Building2,
            href: "/departments",
            stats: { label: "Departments", value: totalDepartments.toString() }
        },
        {
            title: "Attendance",
            description: "Track employee attendance and time",
            icon: lucide_react_1.Clock,
            href: "/attendance",
            stats: { label: "This Month", value: "0" }
        },
        {
            title: "Payroll",
            description: "Manage salaries and payroll processing",
            icon: lucide_react_1.DollarSign,
            href: "/payroll",
            stats: { label: "Payroll Records", value: "0" }
        },
        {
            title: "Leave Management",
            description: "Handle leave requests and approvals",
            icon: lucide_react_1.Calendar,
            href: "/leave-management",
            stats: { label: "Pending Requests", value: "0" }
        },
    ];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "HR", href: "/hr" },
        ], title: "Human Resources", description: "Manage employees, departments, payroll, and attendance", icon: React.createElement(lucide_react_1.UserCog, { className: "w-6 h-6" }) },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "flex gap-3 flex-wrap" },
                React.createElement(button_1.Button, { onClick: function () { return navigate("/employees/create"); }, className: "gap-2" },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
                    "Add Employee"),
                React.createElement(button_1.Button, { onClick: function () { return navigate("/departments/create"); }, variant: "outline", className: "gap-2" },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
                    "New Department"),
                React.createElement(button_1.Button, { onClick: function () { return navigate("/payroll/create"); }, variant: "outline", className: "gap-2" },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
                    "Process Payroll")),
            React.createElement("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-5" }, hrModules.map(function (module) {
                var Icon = module.icon;
                return (React.createElement(card_1.Card, { key: module.title, className: "hover:shadow-lg transition-shadow cursor-pointer", onClick: function () { return navigate(module.href); } },
                    React.createElement(card_1.CardHeader, null,
                        React.createElement("div", { className: "flex items-start justify-between" },
                            React.createElement("div", { className: "flex-1" },
                                React.createElement(card_1.CardTitle, { className: "text-base" }, module.title),
                                React.createElement(card_1.CardDescription, { className: "text-xs mt-1" }, module.description)),
                            React.createElement(Icon, { className: "h-6 w-6 text-muted-foreground" }))),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement("div", { className: "flex items-baseline gap-2" },
                            React.createElement("span", { className: "text-2xl font-bold" }, module.stats.value),
                            React.createElement("span", { className: "text-xs text-muted-foreground" }, module.stats.label)),
                        React.createElement(button_1.Button, { onClick: function (e) {
                                e.stopPropagation();
                                navigate(module.href);
                            }, variant: "outline", size: "sm", className: "w-full" }, "View"))));
            })),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "HR Summary"),
                    React.createElement(card_1.CardDescription, null, "Key HR metrics and statistics")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Total Employees"),
                            React.createElement("p", { className: "text-2xl font-bold" }, "0")),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Present Today"),
                            React.createElement("p", { className: "text-2xl font-bold" }, "0")),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Leave Requests"),
                            React.createElement("p", { className: "text-2xl font-bold" }, "0")),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Departments"),
                            React.createElement("p", { className: "text-2xl font-bold" }, "0"))))))));
}
exports["default"] = HRModule;
