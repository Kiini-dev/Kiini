"use strict";
exports.__esModule = true;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var tabs_1 = require("@/components/ui/tabs");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
var recharts_1 = require("recharts");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var stats_card_1 = require("@/components/ui/stats-card");
var currency_1 = require("@/lib/currency");
var COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
function HRAnalyticsPage() {
    var currencyCode = currency_1.useCurrencySettings().code;
    var _a = react_1.useState(""), selectedDept = _a[0], setSelectedDept = _a[1];
    // Fetch all analytics data
    var headcountTrends = trpc_1.trpc.hrAnalytics.getHeadcountTrends.useQuery({}).data;
    var salaryDistribution = trpc_1.trpc.hrAnalytics.getSalaryDistribution.useQuery({}).data;
    var turnoverAnalysis = trpc_1.trpc.hrAnalytics.getTurnoverAnalysis.useQuery({}).data;
    var attendanceKPIs = trpc_1.trpc.hrAnalytics.getAttendanceKPIs.useQuery({}).data;
    var leaveUtilization = trpc_1.trpc.hrAnalytics.getLeaveUtilization.useQuery({}).data;
    var departmentAnalytics = trpc_1.trpc.hrAnalytics.getDepartmentAnalytics.useQuery({}).data;
    var performanceMetrics = trpc_1.trpc.hrAnalytics.getPerformanceMetrics.useQuery({}).data;
    var salaryExpenseTrends = trpc_1.trpc.hrAnalytics.getSalaryExpenseTrends.useQuery({}).data;
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "HR Analytics", icon: react_1["default"].createElement(lucide_react_1.BarChart3, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "HR" }, { label: "HR Analytics" }] },
        react_1["default"].createElement("div", { className: "flex justify-between items-center" }),
        react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" },
            react_1["default"].createElement(stats_card_1.StatsCard, { label: "Total Employees", value: (performanceMetrics === null || performanceMetrics === void 0 ? void 0 : performanceMetrics.totalEmployees) || 0, icon: react_1["default"].createElement(lucide_react_1.Users, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
            react_1["default"].createElement(stats_card_1.StatsCard, { label: "Active Employees", value: (turnoverAnalysis === null || turnoverAnalysis === void 0 ? void 0 : turnoverAnalysis.active) || 0, icon: react_1["default"].createElement(lucide_react_1.UserCheck, { className: "h-5 w-5" }), color: "border-l-green-500" }),
            react_1["default"].createElement(stats_card_1.StatsCard, { label: "Turnover Rate", value: react_1["default"].createElement(react_1["default"].Fragment, null,
                    ((turnoverAnalysis === null || turnoverAnalysis === void 0 ? void 0 : turnoverAnalysis.turnoverRate) || 0).toFixed(1),
                    "%"), icon: react_1["default"].createElement(lucide_react_1.TrendingUp, { className: "h-5 w-5" }), color: "border-l-orange-500" }),
            react_1["default"].createElement(stats_card_1.StatsCard, { label: "Avg Attendance", value: react_1["default"].createElement(react_1["default"].Fragment, null,
                    ((attendanceKPIs === null || attendanceKPIs === void 0 ? void 0 : attendanceKPIs.presentPercentage) || 0).toFixed(1),
                    "%"), icon: react_1["default"].createElement(lucide_react_1.Calendar, { className: "h-5 w-5" }), color: "border-l-purple-500" })),
        react_1["default"].createElement(tabs_1.Tabs, { defaultValue: "headcount", className: "space-y-4" },
            react_1["default"].createElement(tabs_1.TabsList, { className: "grid grid-cols-3 lg:grid-cols-6 w-full" },
                react_1["default"].createElement(tabs_1.TabsTrigger, { value: "headcount" }, "Headcount"),
                react_1["default"].createElement(tabs_1.TabsTrigger, { value: "salary" }, "Salary"),
                react_1["default"].createElement(tabs_1.TabsTrigger, { value: "attendance" }, "Attendance"),
                react_1["default"].createElement(tabs_1.TabsTrigger, { value: "leave" }, "Leave"),
                react_1["default"].createElement(tabs_1.TabsTrigger, { value: "departments" }, "Departments"),
                react_1["default"].createElement(tabs_1.TabsTrigger, { value: "turnover" }, "Turnover")),
            react_1["default"].createElement(tabs_1.TabsContent, { value: "headcount" },
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Headcount Trend (Last 12 Months)")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                            react_1["default"].createElement(recharts_1.LineChart, { data: headcountTrends || [] },
                                react_1["default"].createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                                react_1["default"].createElement(recharts_1.XAxis, { dataKey: "month" }),
                                react_1["default"].createElement(recharts_1.YAxis, null),
                                react_1["default"].createElement(recharts_1.Tooltip, null),
                                react_1["default"].createElement(recharts_1.Legend, null),
                                react_1["default"].createElement(recharts_1.Line, { type: "monotone", dataKey: "headcount", stroke: "#3b82f6", name: "Total Headcount" }),
                                react_1["default"].createElement(recharts_1.Line, { type: "monotone", dataKey: "newHires", stroke: "#10b981", name: "New Hires" })))))),
            react_1["default"].createElement(tabs_1.TabsContent, { value: "salary", className: "space-y-4" },
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Salary Distribution by Department")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                            react_1["default"].createElement(recharts_1.BarChart, { data: salaryDistribution || [] },
                                react_1["default"].createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                                react_1["default"].createElement(recharts_1.XAxis, { dataKey: "department" }),
                                react_1["default"].createElement(recharts_1.YAxis, null),
                                react_1["default"].createElement(recharts_1.Tooltip, { formatter: function (value) { return "Ksh " + (value / 100000).toFixed(2) + "M"; } }),
                                react_1["default"].createElement(recharts_1.Legend, null),
                                react_1["default"].createElement(recharts_1.Bar, { dataKey: "avgSalary", fill: "#3b82f6", name: "Avg Salary" }),
                                react_1["default"].createElement(recharts_1.Bar, { dataKey: "minSalary", fill: "#f59e0b", name: "Min Salary" }),
                                react_1["default"].createElement(recharts_1.Bar, { dataKey: "maxSalary", fill: "#ef4444", name: "Max Salary" }))))),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Monthly Salary Expense Trends")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                            react_1["default"].createElement(recharts_1.LineChart, { data: salaryExpenseTrends || [] },
                                react_1["default"].createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                                react_1["default"].createElement(recharts_1.XAxis, { dataKey: "month" }),
                                react_1["default"].createElement(recharts_1.YAxis, null),
                                react_1["default"].createElement(recharts_1.Tooltip, { formatter: function (value) { return "Ksh " + (value / 1000).toFixed(0) + "k"; } }),
                                react_1["default"].createElement(recharts_1.Legend, null),
                                react_1["default"].createElement(recharts_1.Line, { type: "monotone", dataKey: "totalCost", stroke: "#ef4444", name: "Total Monthly Cost" })))))),
            react_1["default"].createElement(tabs_1.TabsContent, { value: "attendance" },
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Attendance Patterns (Last 3 Months)")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                            react_1["default"].createElement(recharts_1.PieChart, null,
                                react_1["default"].createElement(recharts_1.Pie, { data: [
                                        { name: "Present", value: (attendanceKPIs === null || attendanceKPIs === void 0 ? void 0 : attendanceKPIs.present) || 0 },
                                        { name: "Absent", value: (attendanceKPIs === null || attendanceKPIs === void 0 ? void 0 : attendanceKPIs.absent) || 0 },
                                        { name: "Late", value: (attendanceKPIs === null || attendanceKPIs === void 0 ? void 0 : attendanceKPIs.late) || 0 },
                                        { name: "Half Day", value: (attendanceKPIs === null || attendanceKPIs === void 0 ? void 0 : attendanceKPIs.halfDay) || 0 },
                                    ], cx: "50%", cy: "50%", labelLine: false, label: function (_a) {
                                        var name = _a.name, percent = _a.percent;
                                        return name + " " + (percent * 100).toFixed(0) + "%";
                                    }, outerRadius: 80, fill: "#8884d8", dataKey: "value" }, COLORS.map(function (color) { return (react_1["default"].createElement(recharts_1.Cell, { key: color, fill: color })); })),
                                react_1["default"].createElement(recharts_1.Tooltip, null)))))),
            react_1["default"].createElement(tabs_1.TabsContent, { value: "leave" },
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Leave Utilization by Type")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "space-y-4" }, (leaveUtilization || []).map(function (leave, idx) { return (react_1["default"].createElement("div", { key: leave.type || "leave-" + idx, className: "border-b pb-4 last:border-b-0" },
                            react_1["default"].createElement("div", { className: "flex justify-between mb-2" },
                                react_1["default"].createElement("span", { className: "font-medium" }, leave.type),
                                react_1["default"].createElement("span", { className: "text-sm text-gray-500" },
                                    leave.count,
                                    " requests")),
                            react_1["default"].createElement("div", { className: "flex justify-between text-sm" },
                                react_1["default"].createElement("span", null,
                                    "Total Days Used: ",
                                    leave.totalDays),
                                react_1["default"].createElement("span", null,
                                    "Avg Duration: ",
                                    leave.avgDuration,
                                    " days")))); }))))),
            react_1["default"].createElement(tabs_1.TabsContent, { value: "departments" },
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Department Overview")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "space-y-4" }, (departmentAnalytics || []).map(function (dept, idx) { return (react_1["default"].createElement("div", { key: dept.name || "dept-" + idx, className: "border-b pb-4 last:border-b-0" },
                            react_1["default"].createElement("div", { className: "flex justify-between mb-2" },
                                react_1["default"].createElement("span", { className: "font-medium" }, dept.name),
                                react_1["default"].createElement("span", { className: "text-sm text-gray-500" },
                                    dept.employees,
                                    " employees")),
                            react_1["default"].createElement("div", { className: "text-sm text-gray-600" },
                                "Avg Salary: ",
                                new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: currencyCode
                                }).format(dept.avgSalary)))); }))))),
            react_1["default"].createElement(tabs_1.TabsContent, { value: "turnover" },
                react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, null, "Employee Status Distribution")),
                        react_1["default"].createElement(card_1.CardContent, null,
                            react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 250 },
                                react_1["default"].createElement(recharts_1.PieChart, null,
                                    react_1["default"].createElement(recharts_1.Pie, { data: [
                                            { name: "Active", value: (turnoverAnalysis === null || turnoverAnalysis === void 0 ? void 0 : turnoverAnalysis.active) || 0 },
                                            { name: "Inactive", value: (turnoverAnalysis === null || turnoverAnalysis === void 0 ? void 0 : turnoverAnalysis.inactive) || 0 },
                                            { name: "On Leave", value: (turnoverAnalysis === null || turnoverAnalysis === void 0 ? void 0 : turnoverAnalysis.onLeave) || 0 },
                                            { name: "Terminated", value: (turnoverAnalysis === null || turnoverAnalysis === void 0 ? void 0 : turnoverAnalysis.terminated) || 0 },
                                        ], cx: "50%", cy: "50%", labelLine: false, label: function (_a) {
                                            var name = _a.name, percent = _a.percent;
                                            return name + " " + (percent * 100).toFixed(0) + "%";
                                        }, outerRadius: 80, fill: "#8884d8", dataKey: "value" }, COLORS.map(function (color) { return (react_1["default"].createElement(recharts_1.Cell, { key: color, fill: color })); })),
                                    react_1["default"].createElement(recharts_1.Tooltip, null))))),
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, null, "Turnover Metrics")),
                        react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                            react_1["default"].createElement("div", { className: "border-b pb-3" },
                                react_1["default"].createElement("p", { className: "text-sm text-gray-500" }, "Total Employees"),
                                react_1["default"].createElement("p", { className: "text-2xl font-bold" }, (turnoverAnalysis === null || turnoverAnalysis === void 0 ? void 0 : turnoverAnalysis.totalEmployees) || 0)),
                            react_1["default"].createElement("div", { className: "border-b pb-3" },
                                react_1["default"].createElement("p", { className: "text-sm text-gray-500" }, "Active"),
                                react_1["default"].createElement("p", { className: "text-2xl font-bold text-green-600" }, (turnoverAnalysis === null || turnoverAnalysis === void 0 ? void 0 : turnoverAnalysis.active) || 0)),
                            react_1["default"].createElement("div", { className: "border-b pb-3" },
                                react_1["default"].createElement("p", { className: "text-sm text-gray-500" }, "Terminated"),
                                react_1["default"].createElement("p", { className: "text-2xl font-bold text-red-600" }, (turnoverAnalysis === null || turnoverAnalysis === void 0 ? void 0 : turnoverAnalysis.terminated) || 0)),
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("p", { className: "text-sm text-gray-500" }, "Turnover Rate"),
                                react_1["default"].createElement("p", { className: "text-2xl font-bold text-orange-600" },
                                    ((turnoverAnalysis === null || turnoverAnalysis === void 0 ? void 0 : turnoverAnalysis.turnoverRate) || 0).toFixed(2),
                                    "%")))))))));
}
exports["default"] = HRAnalyticsPage;
