"use strict";
exports.__esModule = true;
var react_1 = require("react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var stats_card_1 = require("@/components/ui/stats-card");
var recharts_1 = require("recharts");
var table_1 = require("@/components/ui/table");
var select_1 = require("@/components/ui/select");
var badge_1 = require("@/components/ui/badge");
var trpc_1 = require("@/lib/trpc");
var currency_1 = require("@/lib/currency");
var lucide_react_1 = require("lucide-react");
function HRReports() {
    var _a = react_1.useState(String(new Date().getFullYear())), yearFilter = _a[0], setYearFilter = _a[1];
    var _b = currency_1.useCurrencySettings(), symbol = _b.symbol, position = _b.position;
    // Fetch HR data
    var _c = trpc_1.trpc.employees.list.useQuery({}).data, employees = _c === void 0 ? [] : _c;
    var _d = trpc_1.trpc.leaves.list.useQuery({}).data, leaves = _d === void 0 ? [] : _d;
    var _e = trpc_1.trpc.payroll.list.useQuery({}).data, payslips = _e === void 0 ? [] : _e;
    var _f = trpc_1.trpc.attendance.list.useQuery({}).data, attendance = _f === void 0 ? [] : _f;
    var currentYear = new Date().getFullYear();
    var yearOptions = [currentYear, currentYear - 1, currentYear - 2].map(String);
    var fmt = react_1.useCallback(function (amount) {
        var value = amount / 100;
        if (position === "prefix")
            return "" + symbol + value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return "" + value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + symbol;
    }, [symbol, position]);
    // Filter data by year
    var filteredPayslips = react_1.useMemo(function () {
        return payslips.filter(function (ps) {
            var date = new Date(ps.payDate || ps.createdAt);
            return date.getFullYear() === Number(yearFilter);
        });
    }, [payslips, yearFilter]);
    var filteredLeaves = react_1.useMemo(function () {
        return leaves.filter(function (l) {
            var date = new Date(l.startDate || l.createdAt);
            return date.getFullYear() === Number(yearFilter);
        });
    }, [leaves, yearFilter]);
    // Key Metrics
    var totalEmployees = employees.length;
    var activeEmployees = employees.filter(function (e) { return e.status === "active"; }).length;
    var totalPayroll = react_1.useMemo(function () { return filteredPayslips.reduce(function (sum, ps) { return sum + (ps.netSalary || 0); }, 0); }, [filteredPayslips]);
    var avgEmployeeSalary = totalEmployees > 0 ? totalPayroll / totalEmployees : 0;
    // Leave data by type
    var leavesByType = react_1.useMemo(function () {
        var typeMap = {};
        filteredLeaves.forEach(function (l) {
            var type = l.type || "other";
            typeMap[type] = (typeMap[type] || 0) + 1;
        });
        return Object.entries(typeMap).map(function (_a) {
            var type = _a[0], count = _a[1];
            return ({
                name: type.charAt(0).toUpperCase() + type.slice(1),
                value: count
            });
        });
    }, [filteredLeaves]);
    // Department distribution
    var departmentDistribution = react_1.useMemo(function () {
        var deptMap = {};
        employees.forEach(function (e) {
            var dept = e.department || "unassigned";
            deptMap[dept] = (deptMap[dept] || 0) + 1;
        });
        return Object.entries(deptMap).map(function (_a) {
            var dept = _a[0], count = _a[1];
            return ({
                name: dept.charAt(0).toUpperCase() + dept.slice(1),
                value: count
            });
        });
    }, [employees]);
    // Attendance trend
    var attendanceTrend = react_1.useMemo(function () {
        var monthMap = {};
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        for (var i = 0; i < 12; i++) {
            var month = monthNames[i];
            monthMap[month] = { present: 0, absent: 0, late: 0 };
        }
        attendance.forEach(function (att) {
            var date = new Date(att.date || att.createdAt);
            if (date.getFullYear() === Number(yearFilter)) {
                var month = monthNames[date.getMonth()];
                if (att.status === "present")
                    monthMap[month].present += 1;
                else if (att.status === "absent")
                    monthMap[month].absent += 1;
                else if (att.status === "late")
                    monthMap[month].late += 1;
            }
        });
        return Object.entries(monthMap).map(function (_a) {
            var month = _a[0], data = _a[1];
            return ({
                month: month,
                present: data.present,
                absent: data.absent,
                late: data.late
            });
        });
    }, [attendance, yearFilter]);
    // Payroll trend
    var payrollTrend = react_1.useMemo(function () {
        var monthMap = {};
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        for (var i = 0; i < 12; i++) {
            monthMap[monthNames[i]] = 0;
        }
        filteredPayslips.forEach(function (ps) {
            var date = new Date(ps.payDate || ps.createdAt);
            var month = monthNames[date.getMonth()];
            monthMap[month] += (ps.netSalary || 0);
        });
        return Object.entries(monthMap).map(function (_a) {
            var month = _a[0], total = _a[1];
            return ({
                month: month,
                payroll: Math.round(total / 100)
            });
        });
    }, [filteredPayslips]);
    var COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "HR Reports" },
        React.createElement("div", { className: "max-w-7xl mx-auto" },
            React.createElement("div", { className: "flex gap-4 mb-6" },
                React.createElement(select_1.Select, { value: yearFilter, onValueChange: setYearFilter },
                    React.createElement(select_1.SelectTrigger, { className: "w-40" },
                        React.createElement(select_1.SelectValue, null)),
                    React.createElement(select_1.SelectContent, null, yearOptions.map(function (year) { return (React.createElement(select_1.SelectItem, { key: year, value: year }, year)); })))),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6" },
                React.createElement(stats_card_1.StatsCard, { title: "Total Employees", value: totalEmployees.toString(), icon: React.createElement(lucide_react_1.Users, { className: "h-4 w-4" }), trend: activeEmployees, trendLabel: "active" }),
                React.createElement(stats_card_1.StatsCard, { title: "Active Employees", value: activeEmployees.toString(), icon: React.createElement(lucide_react_1.TrendingUp, { className: "h-4 w-4" }), trend: Math.round((activeEmployees / totalEmployees) * 100) || 0, trendLabel: "% active" }),
                React.createElement(stats_card_1.StatsCard, { title: "Total Payroll", value: fmt(totalPayroll), icon: React.createElement(lucide_react_1.DollarSign, { className: "h-4 w-4" }), trend: filteredPayslips.length, trendLabel: "payslips" }),
                React.createElement(stats_card_1.StatsCard, { title: "Avg Salary", value: fmt(avgEmployeeSalary), icon: React.createElement(lucide_react_1.Briefcase, { className: "h-4 w-4" }), trend: 0, trendLabel: "per employee" })),
            React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Employees by Department"),
                        React.createElement(card_1.CardDescription, null, "Department distribution")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                            React.createElement(recharts_1.PieChart, null,
                                React.createElement(recharts_1.Pie, { data: departmentDistribution, cx: "50%", cy: "50%", labelLine: false, label: function (_a) {
                                        var name = _a.name, value = _a.value;
                                        return name + ": " + value;
                                    }, outerRadius: 80, fill: "#8884d8", dataKey: "value" }, departmentDistribution.map(function (_, index) { return (React.createElement(recharts_1.Cell, { key: "cell-" + index, fill: COLORS[index % COLORS.length] })); })),
                                React.createElement(recharts_1.Tooltip, null))))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Leaves by Type"),
                        React.createElement(card_1.CardDescription, null,
                            "Leave usage in ",
                            yearFilter)),
                    React.createElement(card_1.CardContent, null,
                        React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                            React.createElement(recharts_1.PieChart, null,
                                React.createElement(recharts_1.Pie, { data: leavesByType, cx: "50%", cy: "50%", labelLine: false, label: function (_a) {
                                        var name = _a.name, value = _a.value;
                                        return name + ": " + value;
                                    }, outerRadius: 80, fill: "#8884d8", dataKey: "value" }, leavesByType.map(function (_, index) { return (React.createElement(recharts_1.Cell, { key: "cell-" + index, fill: COLORS[index % COLORS.length] })); })),
                                React.createElement(recharts_1.Tooltip, null)))))),
            React.createElement(card_1.Card, { className: "mb-6" },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Attendance Trend"),
                    React.createElement(card_1.CardDescription, null,
                        "Monthly attendance summary in ",
                        yearFilter)),
                React.createElement(card_1.CardContent, null,
                    React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                        React.createElement(recharts_1.LineChart, { data: attendanceTrend },
                            React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                            React.createElement(recharts_1.XAxis, { dataKey: "month" }),
                            React.createElement(recharts_1.YAxis, null),
                            React.createElement(recharts_1.Tooltip, null),
                            React.createElement(recharts_1.Legend, null),
                            React.createElement(recharts_1.Line, { type: "monotone", dataKey: "present", stroke: "#10b981", name: "Present" }),
                            React.createElement(recharts_1.Line, { type: "monotone", dataKey: "absent", stroke: "#ef4444", name: "Absent" }),
                            React.createElement(recharts_1.Line, { type: "monotone", dataKey: "late", stroke: "#f59e0b", name: "Late" }))))),
            React.createElement(card_1.Card, { className: "mb-6" },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Payroll Trend"),
                    React.createElement(card_1.CardDescription, null,
                        "Monthly payroll expenses in ",
                        yearFilter)),
                React.createElement(card_1.CardContent, null,
                    React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                        React.createElement(recharts_1.BarChart, { data: payrollTrend },
                            React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                            React.createElement(recharts_1.XAxis, { dataKey: "month" }),
                            React.createElement(recharts_1.YAxis, null),
                            React.createElement(recharts_1.Tooltip, { formatter: function (value) { return fmt(value * 100); }, contentStyle: { backgroundColor: "rgba(0, 0, 0, 0.8)", border: "none", borderRadius: "8px" } }),
                            React.createElement(recharts_1.Bar, { dataKey: "payroll", fill: "#3b82f6", name: "Payroll" }))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Employees List"),
                    React.createElement(card_1.CardDescription, null, "All employees")),
                React.createElement(card_1.CardContent, null,
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Name"),
                                React.createElement(table_1.TableHead, null, "Department"),
                                React.createElement(table_1.TableHead, null, "Position"),
                                React.createElement(table_1.TableHead, null, "Status"),
                                React.createElement(table_1.TableHead, null, "Email"))),
                        React.createElement(table_1.TableBody, null, employees.slice(0, 10).map(function (emp) { return (React.createElement(table_1.TableRow, { key: emp.id },
                            React.createElement(table_1.TableCell, { className: "font-medium" },
                                emp.firstName,
                                " ",
                                emp.lastName),
                            React.createElement(table_1.TableCell, null, emp.department || "N/A"),
                            React.createElement(table_1.TableCell, null, emp.position || "N/A"),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { variant: "outline", className: emp.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700" }, emp.status || "active")),
                            React.createElement(table_1.TableCell, null, emp.email))); }))))))));
}
exports["default"] = HRReports;
