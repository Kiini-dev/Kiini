"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
var recharts_1 = require("recharts");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var stats_card_1 = require("@/components/ui/stats-card");
function PayrollAnalytics() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = react_1.useState("2024"), selectedYear = _b[0], setSelectedYear = _b[1];
    var _c = react_1.useState("12"), selectedMonth = _c[0], setSelectedMonth = _c[1];
    var _d = trpc_1.trpc.payroll.list.useQuery({}).data, rawPayroll = _d === void 0 ? [] : _d;
    var payrollList = JSON.parse(JSON.stringify(rawPayroll));
    // Compute analytics from real payroll data
    var analyticsData = react_1.useMemo(function () {
        var totalPayroll = payrollList.reduce(function (s, r) { return s + (r.netSalary || 0); }, 0);
        var uniqueEmployees = new Set(payrollList.map(function (r) { return r.employeeId; })).size;
        var averageSalary = uniqueEmployees > 0 ? Math.round(totalPayroll / uniqueEmployees) : 0;
        // Department-wise
        var deptMap = {};
        for (var _i = 0, payrollList_1 = payrollList; _i < payrollList_1.length; _i++) {
            var r = payrollList_1[_i];
            var dept = r.department || "Other";
            deptMap[dept] = (deptMap[dept] || 0) + (r.netSalary || 0);
        }
        var departmentWise = Object.entries(deptMap).map(function (_a) {
            var name = _a[0], amount = _a[1];
            return ({ name: name, amount: amount });
        }).sort(function (a, b) { return b.amount - a.amount; });
        // Salary distribution
        var ranges = [
            { range: "0-30K", min: 0, max: 30000, count: 0 },
            { range: "30K-50K", min: 30000, max: 50000, count: 0 },
            { range: "50K-80K", min: 50000, max: 80000, count: 0 },
            { range: "80K+", min: 80000, max: Infinity, count: 0 },
        ];
        var empSalary = {};
        for (var _a = 0, payrollList_2 = payrollList; _a < payrollList_2.length; _a++) {
            var r = payrollList_2[_a];
            if (r.employeeId && !empSalary[r.employeeId])
                empSalary[r.employeeId] = r.netSalary || 0;
        }
        for (var _b = 0, _c = Object.values(empSalary); _b < _c.length; _b++) {
            var sal = _c[_b];
            for (var _d = 0, ranges_1 = ranges; _d < ranges_1.length; _d++) {
                var rng = ranges_1[_d];
                if (sal >= rng.min && sal < rng.max) {
                    rng.count++;
                    break;
                }
            }
        }
        var salaryDistribution = ranges.map(function (_a) {
            var range = _a.range, count = _a.count;
            return ({ range: range, count: count });
        });
        // Monthly trend from actual records
        var monthMap = {};
        for (var _e = 0, payrollList_3 = payrollList; _e < payrollList_3.length; _e++) {
            var r = payrollList_3[_e];
            var m = r.month || (r.payPeriodStart ? r.payPeriodStart.substring(0, 7) : "Unknown");
            if (!monthMap[m])
                monthMap[m] = { payroll: 0, emps: new Set() };
            monthMap[m].payroll += r.netSalary || 0;
            if (r.employeeId)
                monthMap[m].emps.add(r.employeeId);
        }
        var trend = Object.entries(monthMap)
            .sort(function (_a, _b) {
            var a = _a[0];
            var b = _b[0];
            return a.localeCompare(b);
        })
            .map(function (_a) {
            var month = _a[0], _b = _a[1], payroll = _b.payroll, emps = _b.emps;
            return ({ month: month, payroll: payroll, employees: emps.size });
        });
        return { month: selectedYear + "-" + selectedMonth, totalPayroll: totalPayroll, averageSalary: averageSalary, employeeCount: uniqueEmployees, departmentWise: departmentWise, salaryDistribution: salaryDistribution, trend: trend };
    }, [payrollList, selectedYear, selectedMonth]);
    var stats = react_1.useMemo(function () {
        var _a;
        var prevMonthPayroll = ((_a = analyticsData.trend[analyticsData.trend.length - 2]) === null || _a === void 0 ? void 0 : _a.payroll) || 0;
        var currentPayroll = analyticsData.totalPayroll;
        var payrollChange = prevMonthPayroll > 0 ? ((currentPayroll - prevMonthPayroll) / prevMonthPayroll) * 100 : 0;
        return {
            totalPayroll: analyticsData.totalPayroll,
            averageSalary: analyticsData.averageSalary,
            employeeCount: analyticsData.employeeCount,
            payrollChange: payrollChange,
            costPerDay: Math.round(analyticsData.totalPayroll / 30)
        };
    }, [analyticsData.totalPayroll, analyticsData.averageSalary, analyticsData.employeeCount]);
    var COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Payroll Analytics", description: "View payroll trends, department-wise breakdown, and salary distribution", icon: React.createElement(lucide_react_1.BarChart3, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "HR", href: "/hr" },
            { label: "Payroll", href: "/payroll" },
            { label: "Analytics" },
        ], backLink: { label: "Payroll", href: "/payroll" } },
        React.createElement("div", { className: "space-y-6" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Analysis Period")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "flex gap-4" },
                        React.createElement("div", { className: "w-[150px]" },
                            React.createElement(select_1.Select, { value: selectedYear, onValueChange: setSelectedYear },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "2022" }, "2022"),
                                    React.createElement(select_1.SelectItem, { value: "2023" }, "2023"),
                                    React.createElement(select_1.SelectItem, { value: "2024" }, "2024")))),
                        React.createElement("div", { className: "w-[200px]" },
                            React.createElement(select_1.Select, { value: selectedMonth, onValueChange: setSelectedMonth },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "1" }, "January"),
                                    React.createElement(select_1.SelectItem, { value: "2" }, "February"),
                                    React.createElement(select_1.SelectItem, { value: "3" }, "March"),
                                    React.createElement(select_1.SelectItem, { value: "4" }, "April"),
                                    React.createElement(select_1.SelectItem, { value: "5" }, "May"),
                                    React.createElement(select_1.SelectItem, { value: "6" }, "June"),
                                    React.createElement(select_1.SelectItem, { value: "7" }, "July"),
                                    React.createElement(select_1.SelectItem, { value: "8" }, "August"),
                                    React.createElement(select_1.SelectItem, { value: "9" }, "September"),
                                    React.createElement(select_1.SelectItem, { value: "10" }, "October"),
                                    React.createElement(select_1.SelectItem, { value: "11" }, "November"),
                                    React.createElement(select_1.SelectItem, { value: "12" }, "December"))))))),
            React.createElement("div", { className: "grid gap-4 md:grid-cols-5" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-600" }, "Total Payroll")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement("p", { className: "text-2xl font-bold" },
                                "Ksh ",
                                stats.totalPayroll.toLocaleString()),
                            React.createElement("div", { className: "flex items-center gap-1" }, stats.payrollChange >= 0 ? (React.createElement(React.Fragment, null,
                                React.createElement(lucide_react_1.ArrowUp, { className: "w-4 h-4 text-green-600" }),
                                React.createElement("span", { className: "text-sm text-green-600" },
                                    "+",
                                    stats.payrollChange.toFixed(1),
                                    "%"))) : (React.createElement(React.Fragment, null,
                                React.createElement(lucide_react_1.ArrowDown, { className: "w-4 h-4 text-red-600" }),
                                React.createElement("span", { className: "text-sm text-red-600" },
                                    stats.payrollChange.toFixed(1),
                                    "%"))))))),
                React.createElement(stats_card_1.StatsCard, { label: "Average Salary", value: React.createElement(React.Fragment, null,
                        "Ksh ",
                        stats.averageSalary.toLocaleString()), description: "Per employee/month", color: "border-l-orange-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Employees", value: stats.employeeCount, description: "On payroll", color: "border-l-purple-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Cost Per Day", value: React.createElement(React.Fragment, null,
                        "Ksh ",
                        stats.costPerDay.toLocaleString()), description: "Average daily cost", color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Monthly Budget", value: "Ksh 2.8M", description: "Remaining: Ksh 350K", color: "border-l-blue-500" })),
            React.createElement("div", { className: "grid gap-6 md:grid-cols-2" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Payroll Trend (YTD)"),
                        React.createElement(card_1.CardDescription, null, "Monthly payroll expense over the year")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                            React.createElement(recharts_1.LineChart, { data: analyticsData.trend },
                                React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                                React.createElement(recharts_1.XAxis, { dataKey: "month" }),
                                React.createElement(recharts_1.YAxis, null),
                                React.createElement(recharts_1.Tooltip, { formatter: function (value) { return "Ksh " + value.toLocaleString(); } }),
                                React.createElement(recharts_1.Legend, null),
                                React.createElement(recharts_1.Line, { type: "monotone", dataKey: "payroll", stroke: "#3B82F6", name: "Payroll", strokeWidth: 2 }))))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Employee Growth (YTD)"),
                        React.createElement(card_1.CardDescription, null, "Head count trends throughout the year")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                            React.createElement(recharts_1.BarChart, { data: analyticsData.trend },
                                React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                                React.createElement(recharts_1.XAxis, { dataKey: "month" }),
                                React.createElement(recharts_1.YAxis, null),
                                React.createElement(recharts_1.Tooltip, null),
                                React.createElement(recharts_1.Legend, null),
                                React.createElement(recharts_1.Bar, { dataKey: "employees", fill: "#10B981", name: "Employees" }))))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Department-wise Payroll"),
                        React.createElement(card_1.CardDescription, null, "Current month breakdown by department")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                            React.createElement(recharts_1.PieChart, null,
                                React.createElement(recharts_1.Pie, { data: analyticsData.departmentWise, cx: "50%", cy: "50%", labelLine: false, label: function (_a) {
                                        var name = _a.name, value = _a.value;
                                        return name + ": Ksh " + (value / 1000).toFixed(0) + "K";
                                    }, outerRadius: 100, fill: "#8884d8", dataKey: "amount" }, analyticsData.departmentWise.map(function (entry, index) { return (React.createElement(recharts_1.Cell, { key: "cell-" + index, fill: COLORS[index % COLORS.length] })); })),
                                React.createElement(recharts_1.Tooltip, { formatter: function (value) { return "Ksh " + value.toLocaleString(); } }))))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Salary Distribution"),
                        React.createElement(card_1.CardDescription, null, "Number of employees in each salary range")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                            React.createElement(recharts_1.BarChart, { data: analyticsData.salaryDistribution },
                                React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                                React.createElement(recharts_1.XAxis, { dataKey: "range" }),
                                React.createElement(recharts_1.YAxis, null),
                                React.createElement(recharts_1.Tooltip, null),
                                React.createElement(recharts_1.Bar, { dataKey: "count", fill: "#F59E0B", name: "Employees" })))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Department Summary"),
                    React.createElement(card_1.CardDescription, null, "Detailed breakdown by department")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "space-y-3" }, analyticsData.departmentWise.map(function (dept, idx) {
                        var percentage = ((dept.amount / analyticsData.totalPayroll) * 100).toFixed(1);
                        var avgDeptSalary = Math.round(dept.amount / 12); // Simulated average
                        return (React.createElement("div", { key: idx, className: "flex items-center justify-between p-3 border rounded-lg" },
                            React.createElement("div", { className: "flex items-center gap-3 flex-1" },
                                React.createElement("div", { className: "w-4 h-4 rounded-full", style: { backgroundColor: COLORS[idx % COLORS.length] } }),
                                React.createElement("div", null,
                                    React.createElement("p", { className: "font-medium" }, dept.name),
                                    React.createElement("p", { className: "text-sm text-gray-500" },
                                        "Avg: Ksh ",
                                        avgDeptSalary.toLocaleString()))),
                            React.createElement("div", { className: "text-right" },
                                React.createElement("p", { className: "font-bold" },
                                    "Ksh ",
                                    dept.amount.toLocaleString()),
                                React.createElement(badge_1.Badge, { variant: "outline" },
                                    percentage,
                                    "%"))));
                    })))),
            React.createElement(card_1.Card, { className: "bg-blue-50 border-blue-200" },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-blue-900 flex items-center gap-2" },
                        React.createElement(lucide_react_1.TrendingUp, { className: "w-5 h-5" }),
                        "Key Insights")),
                React.createElement(card_1.CardContent, { className: "space-y-3 text-sm text-blue-900" },
                    React.createElement("p", null,
                        "\u2713 Total payroll has increased by ",
                        React.createElement("strong", null,
                            stats.payrollChange.toFixed(1),
                            "%"),
                        " from previous month, primarily due to ",
                        stats.employeeCount > 59 ? "new hires" : "salary adjustments",
                        "."),
                    React.createElement("p", null,
                        "\u2713 ",
                        React.createElement("strong", null, "Sales Department"),
                        " consumes the highest payroll at",
                        " ",
                        React.createElement("strong", null,
                            ((analyticsData.departmentWise[0].amount / analyticsData.totalPayroll) * 100).toFixed(1),
                            "%"),
                        "."),
                    React.createElement("p", null,
                        "\u2713 Average salary range of ",
                        React.createElement("strong", null, "40K-50K"),
                        " covers the majority (",
                        React.createElement("strong", null, analyticsData.salaryDistribution[1].count),
                        ") of employees."))))));
}
exports["default"] = PayrollAnalytics;
