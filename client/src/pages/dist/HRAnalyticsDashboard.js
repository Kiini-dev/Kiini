"use strict";
exports.__esModule = true;
var ModuleLayout_1 = require("@/components/ModuleLayout");
var sonner_1 = require("sonner");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var select_1 = require("@/components/ui/select");
var tabs_1 = require("@/components/ui/tabs");
var recharts_1 = require("recharts");
var table_1 = require("@/components/ui/table");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var stats_card_1 = require("@/components/ui/stats-card");
var currency_1 = require("@/lib/currency");
function HRAnalyticsDashboard() {
    var _a, _b, _c, _d, _e, _f;
    var currencyCode = currency_1.useCurrencySettings().code;
    var _g = react_1.useState(new Date().getFullYear().toString()), selectedYear = _g[0], setSelectedYear = _g[1];
    var _h = react_1.useState("all"), selectedDepartment = _h[0], setSelectedDepartment = _h[1];
    var utils = trpc_1.trpc.useUtils();
    // Fetch analytics data
    var _j = trpc_1.trpc.hrAnalytics.getHeadcountTrends.useQuery({ months: 12 }).data, headcountTrends = _j === void 0 ? [] : _j;
    var _k = trpc_1.trpc.hrAnalytics.getSalaryDistribution.useQuery().data, salaryDistribution = _k === void 0 ? [] : _k;
    var _l = trpc_1.trpc.hrAnalytics.getTurnoverAnalysis.useQuery().data, turnoverAnalysis = _l === void 0 ? { totalEmployees: 0, active: 0, inactive: 0, onLeave: 0, terminated: 0, turnoverRate: 0 } : _l;
    var _m = trpc_1.trpc.hrAnalytics.getAttendanceKPIs.useQuery({ months: 3 }).data, attendanceKPIs = _m === void 0 ? { present: 0, absent: 0, late: 0, halfDay: 0, total: 0, presentPercentage: 0, absentPercentage: 0, latePercentage: 0 } : _m;
    var _o = trpc_1.trpc.hrAnalytics.getLeaveUtilization.useQuery().data, leaveUtilization = _o === void 0 ? [] : _o;
    var _p = trpc_1.trpc.hrAnalytics.getPerformanceMetrics.useQuery().data, performanceMetrics = _p === void 0 ? { totalEmployees: 0, avgPresenceRate: 0, highPerformers: 0, needsImprovement: 0 } : _p;
    // Fetch department list for filter
    var _q = trpc_1.trpc.departments.list.useQuery().data, departments = _q === void 0 ? [] : _q;
    var _r = trpc_1.trpc.employees.list.useQuery(), _s = _r.data, employees = _s === void 0 ? [] : _s, employeesLoading = _r.isLoading;
    var formatCurrency = function (value) {
        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: currencyCode,
            minimumFractionDigits: 0
        }).format(value);
    };
    // Calculate summary statistics
    var stats = react_1.useMemo(function () {
        var _a;
        var activeEmployees = employees.filter(function (e) { return e.isActive || e.isActive !== 0; }).length;
        var avgSalary = salaryDistribution.length > 0
            ? Math.round(salaryDistribution.reduce(function (sum, dept) { return sum + (dept.avgSalary || 0); }, 0) / salaryDistribution.length)
            : 0;
        var avgAttendance = ((_a = attendanceKPIs) === null || _a === void 0 ? void 0 : _a.presentPercentage) || 0;
        var avgLeaveUtilized = leaveUtilization.length > 0
            ? Math.round(leaveUtilization.reduce(function (sum, l) { return sum + (l.utilized || 0); }, 0) / leaveUtilization.length)
            : 0;
        return {
            activeEmployees: activeEmployees,
            avgSalary: avgSalary,
            avgAttendance: avgAttendance,
            avgLeaveUtilized: avgLeaveUtilized,
            totalDepartments: departments.length
        };
    }, [employees, salaryDistribution, attendanceKPIs, leaveUtilization, departments]);
    var COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
    var years = Array.from({ length: 5 }, function (_, i) {
        var year = new Date().getFullYear() - i;
        return year.toString();
    });
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "HR Analytics Dashboard", breadcrumbs: [
            { label: "HR", href: "/hr" },
            { label: "Analytics" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-lg" }, "Analytics Filters")),
                React.createElement(card_1.CardContent, { className: "flex gap-4" },
                    React.createElement("div", { className: "flex-1" },
                        React.createElement("label", { className: "text-sm font-medium mb-2 block" }, "Fiscal Year"),
                        React.createElement(select_1.Select, { value: selectedYear, onValueChange: setSelectedYear },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null, years.map(function (year) { return (React.createElement(select_1.SelectItem, { key: year, value: year }, year)); })))),
                    React.createElement("div", { className: "flex-1" },
                        React.createElement("label", { className: "text-sm font-medium mb-2 block" }, "Department"),
                        React.createElement(select_1.Select, { value: selectedDepartment, onValueChange: setSelectedDepartment },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "all" }, "All Departments"),
                                departments.map(function (dept) { return (React.createElement(select_1.SelectItem, { key: dept.id, value: dept.id }, dept.departmentName)); })))),
                    React.createElement("div", { className: "flex items-end" },
                        React.createElement(button_1.Button, { variant: "outline", onClick: function () { utils.hrAnalytics.invalidate(); utils.departments.invalidate(); utils.employees.invalidate(); sonner_1.toast.success("Data refreshed"); } }, "Refresh Data")))),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Employees", value: React.createElement(React.Fragment, null,
                        React.createElement(lucide_react_1.Users, { className: "h-6 w-6 text-blue-500" }),
                        " ",
                        stats.activeEmployees), description: "Active staff", icon: React.createElement(lucide_react_1.Users, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Departments", value: stats.totalDepartments, description: "Organizational units", color: "border-l-purple-500" }),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-muted-foreground" }, "Avg Salary")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-lg font-bold flex items-center gap-2" },
                            React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5 text-green-500" })),
                        React.createElement("p", { className: "text-xs text-muted-foreground mt-1" }, formatCurrency(stats.avgSalary)))),
                React.createElement(stats_card_1.StatsCard, { label: "Attendance Rate", value: React.createElement(React.Fragment, null,
                        React.createElement(lucide_react_1.Calendar, { className: "h-6 w-6 text-amber-500" }),
                        " ",
                        stats.avgAttendance,
                        "%"), description: "Average across staff", icon: React.createElement(lucide_react_1.Calendar, { className: "h-5 w-5" }), color: "border-l-amber-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Leave Utilization", value: React.createElement(React.Fragment, null,
                        React.createElement(lucide_react_1.TrendingUp, { className: "h-6 w-6 text-purple-500" }),
                        " ",
                        stats.avgLeaveUtilized,
                        "%"), description: "Days used from allocation", icon: React.createElement(lucide_react_1.TrendingUp, { className: "h-5 w-5" }), color: "border-l-purple-500" })),
            React.createElement(tabs_1.Tabs, { defaultValue: "overview", className: "w-full" },
                React.createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-4" },
                    React.createElement(tabs_1.TabsTrigger, { value: "overview" }, "Overview"),
                    React.createElement(tabs_1.TabsTrigger, { value: "financial" }, "Financial"),
                    React.createElement(tabs_1.TabsTrigger, { value: "attendance" }, "Attendance"),
                    React.createElement(tabs_1.TabsTrigger, { value: "performance" }, "Performance")),
                React.createElement(tabs_1.TabsContent, { value: "overview", className: "space-y-6" },
                    React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, null,
                                React.createElement(card_1.CardTitle, null, "Headcount Trends"),
                                React.createElement(card_1.CardDescription, null,
                                    "Year ",
                                    selectedYear)),
                            React.createElement(card_1.CardContent, null, headcountTrends.length > 0 ? (React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                                React.createElement(recharts_1.LineChart, { data: headcountTrends },
                                    React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                                    React.createElement(recharts_1.XAxis, { dataKey: "month" }),
                                    React.createElement(recharts_1.YAxis, null),
                                    React.createElement(recharts_1.Tooltip, null),
                                    React.createElement(recharts_1.Legend, null),
                                    React.createElement(recharts_1.Line, { type: "monotone", dataKey: "headcount", stroke: "#3b82f6", strokeWidth: 2, name: "Total Headcount" }),
                                    React.createElement(recharts_1.Line, { type: "monotone", dataKey: "newHires", stroke: "#10b981", strokeWidth: 2, name: "New Hires" })))) : (React.createElement("p", { className: "text-muted-foreground text-center py-8" }, "No data available")))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, null,
                                React.createElement(card_1.CardTitle, null, "Turnover Analysis"),
                                React.createElement(card_1.CardDescription, null, "Employee status breakdown")),
                            React.createElement(card_1.CardContent, null, ((_a = turnoverAnalysis) === null || _a === void 0 ? void 0 : _a.totalEmployees) > 0 ? (React.createElement("div", { className: "space-y-4" },
                                React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 250 },
                                    React.createElement(recharts_1.PieChart, null,
                                        React.createElement(recharts_1.Pie, { data: [
                                                { name: 'Active', value: turnoverAnalysis.active },
                                                { name: 'On Leave', value: turnoverAnalysis.onLeave },
                                                { name: 'Terminated', value: turnoverAnalysis.terminated },
                                                { name: 'Inactive', value: turnoverAnalysis.inactive },
                                            ], cx: "50%", cy: "50%", labelLine: false, label: function (_a) {
                                                var name = _a.name, percent = _a.percent;
                                                return name + " " + (percent * 100).toFixed(0) + "%";
                                            }, outerRadius: 80, fill: "#8884d8", dataKey: "value" }, COLORS.map(function (color, index) { return (React.createElement(recharts_1.Cell, { key: "cell-" + index, fill: color })); })),
                                        React.createElement(recharts_1.Tooltip, null))),
                                React.createElement("div", { className: "text-xs text-muted-foreground text-center" },
                                    "Turnover Rate: ",
                                    (turnoverAnalysis.turnoverRate || 0).toFixed(2),
                                    "%"))) : (React.createElement("p", { className: "text-muted-foreground text-center py-8" }, "No turnover data available")))))),
                React.createElement(tabs_1.TabsContent, { value: "financial", className: "space-y-6" },
                    React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, null,
                                React.createElement(card_1.CardTitle, null, "Salary Distribution by Department"),
                                React.createElement(card_1.CardDescription, null, "Average salary per department")),
                            React.createElement(card_1.CardContent, null, salaryDistribution.length > 0 ? (React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                                React.createElement(recharts_1.BarChart, { data: salaryDistribution },
                                    React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                                    React.createElement(recharts_1.XAxis, { dataKey: "department", angle: -45, textAnchor: "end", height: 80 }),
                                    React.createElement(recharts_1.YAxis, null),
                                    React.createElement(recharts_1.Tooltip, { formatter: function (value) { return formatCurrency(value); } }),
                                    React.createElement(recharts_1.Legend, null),
                                    React.createElement(recharts_1.Bar, { dataKey: "avgSalary", fill: "#3b82f6", name: "Avg Salary" }),
                                    React.createElement(recharts_1.Bar, { dataKey: "maxSalary", fill: "#10b981", name: "Max Salary" }),
                                    React.createElement(recharts_1.Bar, { dataKey: "minSalary", fill: "#ef4444", name: "Min Salary" })))) : (React.createElement("p", { className: "text-muted-foreground text-center py-8" }, "No data available")))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, null,
                                React.createElement(card_1.CardTitle, null, "Headcount by Department"),
                                React.createElement(card_1.CardDescription, null, "Distribution of employees")),
                            React.createElement(card_1.CardContent, null, salaryDistribution.length > 0 ? (React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                                React.createElement(recharts_1.PieChart, null,
                                    React.createElement(recharts_1.Pie, { data: salaryDistribution, dataKey: "employeeCount", nameKey: "department", cx: "50%", cy: "50%", outerRadius: 80, label: function (_a) {
                                            var department = _a.department, percent = _a.percent;
                                            return department + " " + (percent * 100).toFixed(0) + "%";
                                        } }, salaryDistribution.map(function (data, index) { return (React.createElement(recharts_1.Cell, { key: data.department + "-" + index, fill: COLORS[index % COLORS.length] })); })),
                                    React.createElement(recharts_1.Tooltip, { formatter: function (value) { return value + " employees"; } })))) : (React.createElement("p", { className: "text-muted-foreground text-center py-8" }, "No data available"))))),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Department Salary Summary"),
                            React.createElement(card_1.CardDescription, null, "Detailed salary statistics by department")),
                        React.createElement(card_1.CardContent, null, salaryDistribution.length > 0 ? (React.createElement(table_1.Table, null,
                            React.createElement(table_1.TableHeader, null,
                                React.createElement(table_1.TableRow, null,
                                    React.createElement(table_1.TableHead, null, "Department"),
                                    React.createElement(table_1.TableHead, { className: "text-right" }, "Employees"),
                                    React.createElement(table_1.TableHead, { className: "text-right" }, "Avg Salary"),
                                    React.createElement(table_1.TableHead, { className: "text-right" }, "Min Salary"),
                                    React.createElement(table_1.TableHead, { className: "text-right" }, "Max Salary"))),
                            React.createElement(table_1.TableBody, null, salaryDistribution.map(function (dept, idx) { return (React.createElement(table_1.TableRow, { key: dept.department || "dept-" + idx },
                                React.createElement(table_1.TableCell, { className: "font-medium" }, dept.department),
                                React.createElement(table_1.TableCell, { className: "text-right" }, dept.employeeCount),
                                React.createElement(table_1.TableCell, { className: "text-right" }, formatCurrency(dept.avgSalary)),
                                React.createElement(table_1.TableCell, { className: "text-right" }, formatCurrency(dept.minSalary)),
                                React.createElement(table_1.TableCell, { className: "text-right" }, formatCurrency(dept.maxSalary)))); })))) : (React.createElement("p", { className: "text-muted-foreground text-center py-8" }, "No data available"))))),
                React.createElement(tabs_1.TabsContent, { value: "attendance", className: "space-y-6" },
                    React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, null,
                                React.createElement(card_1.CardTitle, null, "Attendance Summary"),
                                React.createElement(card_1.CardDescription, null, "Last 3 months attendance breakdown")),
                            React.createElement(card_1.CardContent, null, ((_b = attendanceKPIs) === null || _b === void 0 ? void 0 : _b.total) ? (React.createElement("div", { className: "space-y-4" },
                                React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                                    React.createElement("div", { className: "p-3 bg-green-50 rounded-lg border border-green-200" },
                                        React.createElement("div", { className: "text-2xl font-bold text-green-600" }, attendanceKPIs.present),
                                        React.createElement("div", { className: "text-sm text-green-700" },
                                            "Present (", (_c = attendanceKPIs.presentPercentage) === null || _c === void 0 ? void 0 :
                                            _c.toFixed(1),
                                            "%)")),
                                    React.createElement("div", { className: "p-3 bg-red-50 rounded-lg border border-red-200" },
                                        React.createElement("div", { className: "text-2xl font-bold text-red-600" }, attendanceKPIs.absent),
                                        React.createElement("div", { className: "text-sm text-red-700" },
                                            "Absent (", (_d = attendanceKPIs.absentPercentage) === null || _d === void 0 ? void 0 :
                                            _d.toFixed(1),
                                            "%)")),
                                    React.createElement("div", { className: "p-3 bg-amber-50 rounded-lg border border-amber-200" },
                                        React.createElement("div", { className: "text-2xl font-bold text-amber-600" }, attendanceKPIs.late),
                                        React.createElement("div", { className: "text-sm text-amber-700" },
                                            "Late (", (_e = attendanceKPIs.latePercentage) === null || _e === void 0 ? void 0 :
                                            _e.toFixed(1),
                                            "%)")),
                                    React.createElement("div", { className: "p-3 bg-blue-50 rounded-lg border border-blue-200" },
                                        React.createElement("div", { className: "text-2xl font-bold text-blue-600" }, attendanceKPIs.halfDay),
                                        React.createElement("div", { className: "text-sm text-blue-700" }, "Half Day"))),
                                React.createElement("div", { className: "text-xs text-muted-foreground text-center" },
                                    "Total Records: ",
                                    attendanceKPIs.total))) : (React.createElement("p", { className: "text-muted-foreground text-center py-8" }, "No attendance data available")))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, null,
                                React.createElement(card_1.CardTitle, null, "Leave Utilization"),
                                React.createElement(card_1.CardDescription, null, "Annual leave balance breakdown")),
                            React.createElement(card_1.CardContent, null, leaveUtilization.length > 0 ? (React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                                React.createElement(recharts_1.BarChart, { data: leaveUtilization },
                                    React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                                    React.createElement(recharts_1.XAxis, { dataKey: "leaveType", angle: -45, textAnchor: "end", height: 80 }),
                                    React.createElement(recharts_1.YAxis, null),
                                    React.createElement(recharts_1.Tooltip, null),
                                    React.createElement(recharts_1.Legend, null),
                                    React.createElement(recharts_1.Bar, { dataKey: "allocated", fill: "#3b82f6", name: "Allocated" }),
                                    React.createElement(recharts_1.Bar, { dataKey: "utilized", fill: "#f59e0b", name: "Utilized" }),
                                    React.createElement(recharts_1.Bar, { dataKey: "balance", fill: "#10b981", name: "Balance" })))) : (React.createElement("p", { className: "text-muted-foreground text-center py-8" }, "No data available")))))),
                React.createElement(tabs_1.TabsContent, { value: "performance", className: "space-y-6" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Performance Metrics"),
                            React.createElement(card_1.CardDescription, null, "Employee performance summary (last 30 days)")),
                        React.createElement(card_1.CardContent, null, ((_f = performanceMetrics) === null || _f === void 0 ? void 0 : _f.totalEmployees) > 0 ? (React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                            React.createElement("div", { className: "p-4 bg-blue-50 rounded-lg border border-blue-200" },
                                React.createElement("div", { className: "text-3xl font-bold text-blue-600" }, performanceMetrics.totalEmployees),
                                React.createElement("div", { className: "text-sm text-blue-700 mt-1" }, "Total Employees")),
                            React.createElement("div", { className: "p-4 bg-green-50 rounded-lg border border-green-200" },
                                React.createElement("div", { className: "text-3xl font-bold text-green-600" },
                                    (performanceMetrics.avgPresenceRate * 100).toFixed(1),
                                    "%"),
                                React.createElement("div", { className: "text-sm text-green-700 mt-1" }, "Average Presence Rate")),
                            React.createElement("div", { className: "p-4 bg-purple-50 rounded-lg border border-purple-200" },
                                React.createElement("div", { className: "text-3xl font-bold text-purple-600" }, performanceMetrics.highPerformers),
                                React.createElement("div", { className: "text-sm text-purple-700 mt-1" }, "High Performers")),
                            React.createElement("div", { className: "p-4 bg-amber-50 rounded-lg border border-amber-200" },
                                React.createElement("div", { className: "text-3xl font-bold text-amber-600" }, performanceMetrics.needsImprovement),
                                React.createElement("div", { className: "text-sm text-amber-700 mt-1" }, "Needs Improvement")))) : (React.createElement("p", { className: "text-muted-foreground text-center py-8" }, "No performance data available")))))))));
}
exports["default"] = HRAnalyticsDashboard;
