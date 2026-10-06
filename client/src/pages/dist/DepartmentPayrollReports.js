"use strict";
exports.__esModule = true;
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var select_1 = require("@/components/ui/select");
var tabs_1 = require("@/components/ui/tabs");
var recharts_1 = require("recharts");
var table_1 = require("@/components/ui/table");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var stats_card_1 = require("@/components/ui/stats-card");
var currency_1 = require("@/lib/currency");
function DepartmentPayrollReports() {
    var currencyCode = currency_1.useCurrencySettings().code;
    var _a = react_1.useState(new Date().getFullYear().toString()), selectedYear = _a[0], setSelectedYear = _a[1];
    var _b = react_1.useState("all"), selectedDept = _b[0], setSelectedDept = _b[1];
    var _c = react_1.useState("all"), selectedMonth = _c[0], setSelectedMonth = _c[1];
    // Fetch data
    var _d = trpc_1.trpc.departments.list.useQuery({}).data, departments = _d === void 0 ? [] : _d;
    var _e = trpc_1.trpc.payroll.list.useQuery({}), _f = _e.data, payrollData = _f === void 0 ? [] : _f, payrollLoading = _e.isLoading;
    var _g = trpc_1.trpc.employees.list.useQuery({}).data, employeeData = _g === void 0 ? [] : _g;
    // Export mutation
    var exportPayrollMutation = trpc_1.trpc.payrollExport.exportPayroll.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Payroll export started!");
        },
        onError: function (error) {
            sonner_1.toast.error("Export failed: " + ((error === null || error === void 0 ? void 0 : error.message) || "Unknown error"));
        }
    });
    var isLoading = payrollLoading;
    var years = Array.from({ length: 5 }, function (_, i) {
        var year = new Date().getFullYear() - i;
        return year.toString();
    });
    var months = [
        { value: "all", label: "All Months" },
        { value: "01", label: "January" },
        { value: "02", label: "February" },
        { value: "03", label: "March" },
        { value: "04", label: "April" },
        { value: "05", label: "May" },
        { value: "06", label: "June" },
        { value: "07", label: "July" },
        { value: "08", label: "August" },
        { value: "09", label: "September" },
        { value: "10", label: "October" },
        { value: "11", label: "November" },
        { value: "12", label: "December" },
    ];
    var formatCurrency = function (value) {
        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: currencyCode,
            minimumFractionDigits: 0
        }).format(value);
    };
    // Filter data based on selections
    var filteredPayroll = react_1.useMemo(function () {
        return payrollData.filter(function (p) {
            var _a;
            var pYear = new Date(p.payrollDate).getFullYear().toString();
            var pMonth = String(new Date(p.payrollDate).getMonth() + 1).padStart(2, "0");
            var pDept = (_a = p.employee) === null || _a === void 0 ? void 0 : _a.departmentId;
            var matches = pYear === selectedYear;
            if (selectedMonth !== "all")
                matches = matches && pMonth === selectedMonth;
            if (selectedDept !== "all")
                matches = matches && pDept === selectedDept;
            return matches;
        });
    }, [payrollData, selectedYear, selectedMonth, selectedDept]);
    // Calculate statistics
    var stats = react_1.useMemo(function () {
        var totalNetPay = filteredPayroll.reduce(function (sum, p) { return sum + (p.netSalary || 0); }, 0);
        var totalGrossSalary = filteredPayroll.reduce(function (sum, p) { return sum + (p.basicSalary || 0); }, 0);
        var totalDeductions = filteredPayroll.reduce(function (sum, p) { return sum + (p.totalDeductions || 0); }, 0);
        var totalAllowances = filteredPayroll.reduce(function (sum, p) { return sum + (p.totalAllowances || 0); }, 0);
        var employeeCount = new Set(filteredPayroll.map(function (p) { return p.employeeId; })).size;
        return {
            totalNetPay: totalNetPay,
            totalGrossSalary: totalGrossSalary,
            totalDeductions: totalDeductions,
            totalAllowances: totalAllowances,
            employeeCount: employeeCount,
            avgNetPay: employeeCount > 0 ? Math.round(totalNetPay / employeeCount) : 0
        };
    }, [filteredPayroll]);
    // Prepare department comparison data
    var departmentComparison = react_1.useMemo(function () {
        var deptMap = {};
        filteredPayroll.forEach(function (p) {
            var _a;
            var deptName = ((_a = departments.find(function (d) { var _a; return d.id === ((_a = p.employee) === null || _a === void 0 ? void 0 : _a.departmentId); })) === null || _a === void 0 ? void 0 : _a.departmentName) || "Unassigned";
            if (!deptMap[deptName]) {
                deptMap[deptName] = {
                    department: deptName,
                    grossSalary: 0,
                    netSalary: 0,
                    deductions: 0,
                    allowances: 0,
                    count: 0
                };
            }
            deptMap[deptName].grossSalary += p.basicSalary || 0;
            deptMap[deptName].netSalary += p.netSalary || 0;
            deptMap[deptName].deductions += p.totalDeductions || 0;
            deptMap[deptName].allowances += p.totalAllowances || 0;
            deptMap[deptName].count += 1;
        });
        return Object.values(deptMap);
    }, [filteredPayroll, departments]);
    var COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
    var handleExport = function () {
        exportPayrollMutation.mutate({
            year: parseInt(selectedYear),
            departmentId: selectedDept !== "all" ? selectedDept : undefined,
            month: selectedMonth !== "all" ? selectedMonth : undefined,
            format: "excel"
        });
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Department Payroll Reports", breadcrumbs: [
            { label: "HR", href: "/hr" },
            { label: "Payroll", href: "/payroll" },
            { label: "Reports" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-lg" }, "Report Filters")),
                React.createElement(card_1.CardContent, { className: "flex gap-4 flex-wrap" },
                    React.createElement("div", { className: "flex-1 min-w-48" },
                        React.createElement("label", { className: "text-sm font-medium mb-2 block" }, "Fiscal Year"),
                        React.createElement(select_1.Select, { value: selectedYear, onValueChange: setSelectedYear },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null, years.map(function (year) { return (React.createElement(select_1.SelectItem, { key: year, value: year }, year)); })))),
                    React.createElement("div", { className: "flex-1 min-w-48" },
                        React.createElement("label", { className: "text-sm font-medium mb-2 block" }, "Department"),
                        React.createElement(select_1.Select, { value: selectedDept, onValueChange: setSelectedDept },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "all" }, "All Departments"),
                                departments.map(function (dept) { return (React.createElement(select_1.SelectItem, { key: dept.id, value: dept.id }, dept.departmentName)); })))),
                    React.createElement("div", { className: "flex-1 min-w-48" },
                        React.createElement("label", { className: "text-sm font-medium mb-2 block" }, "Month"),
                        React.createElement(select_1.Select, { value: selectedMonth, onValueChange: setSelectedMonth },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null, months.map(function (month) { return (React.createElement(select_1.SelectItem, { key: month.value, value: month.value }, month.label)); })))),
                    React.createElement("div", { className: "flex items-end gap-2" },
                        React.createElement(button_1.Button, { onClick: handleExport, disabled: exportPayrollMutation.isPending, className: "flex gap-2" },
                            React.createElement(lucide_react_1.Download, { className: "h-4 w-4" }),
                            exportPayrollMutation.isPending ? "Exporting..." : "Export Excel")))),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Gross Salary", value: React.createElement(React.Fragment, null,
                        React.createElement(lucide_react_1.DollarSign, { className: "h-6 w-6 text-blue-500" })), icon: React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Total Net Pay", value: React.createElement(React.Fragment, null,
                        React.createElement(lucide_react_1.TrendingUp, { className: "h-6 w-6 text-green-500" })), icon: React.createElement(lucide_react_1.TrendingUp, { className: "h-5 w-5" }), color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Total Deductions", value: React.createElement(React.Fragment, null,
                        React.createElement(lucide_react_1.DollarSign, { className: "h-6 w-6 text-red-500" })), icon: React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }), color: "border-l-red-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Total Allowances", value: React.createElement(React.Fragment, null,
                        React.createElement(lucide_react_1.DollarSign, { className: "h-6 w-6 text-amber-500" })), icon: React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }), color: "border-l-amber-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Employees Processed", value: React.createElement(React.Fragment, null,
                        React.createElement(lucide_react_1.Users, { className: "h-6 w-6 text-purple-500" }),
                        " ",
                        stats.employeeCount), icon: React.createElement(lucide_react_1.Users, { className: "h-5 w-5" }), color: "border-l-purple-500" })),
            React.createElement(tabs_1.Tabs, { defaultValue: "overview", className: "w-full" },
                React.createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-3" },
                    React.createElement(tabs_1.TabsTrigger, { value: "overview" }, "Overview"),
                    React.createElement(tabs_1.TabsTrigger, { value: "deductions" }, "Deductions"),
                    React.createElement(tabs_1.TabsTrigger, { value: "details" }, "Details")),
                React.createElement(tabs_1.TabsContent, { value: "overview", className: "space-y-6" },
                    React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, null,
                                React.createElement(card_1.CardTitle, null, "Payroll by Department"),
                                React.createElement(card_1.CardDescription, null, "Gross salary comparison")),
                            React.createElement(card_1.CardContent, null, departmentComparison.length > 0 ? (React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                                React.createElement(recharts_1.BarChart, { data: departmentComparison },
                                    React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                                    React.createElement(recharts_1.XAxis, { dataKey: "department", angle: -45, textAnchor: "end", height: 80 }),
                                    React.createElement(recharts_1.YAxis, null),
                                    React.createElement(recharts_1.Tooltip, { formatter: function (value) { return formatCurrency(value); } }),
                                    React.createElement(recharts_1.Legend, null),
                                    React.createElement(recharts_1.Bar, { dataKey: "grossSalary", fill: "#3b82f6", name: "Gross Salary" }),
                                    React.createElement(recharts_1.Bar, { dataKey: "netSalary", fill: "#10b981", name: "Net Pay" })))) : (React.createElement("p", { className: "text-muted-foreground text-center py-8" }, "No data available")))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, null,
                                React.createElement(card_1.CardTitle, null, "Salary Composition"),
                                React.createElement(card_1.CardDescription, null, "Distribution breakdown")),
                            React.createElement(card_1.CardContent, null, stats.totalGrossSalary > 0 ? (React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                                React.createElement(recharts_1.PieChart, null,
                                    React.createElement(recharts_1.Pie, { data: [
                                            { name: "Net Pay", value: stats.totalNetPay },
                                            { name: "Deductions", value: stats.totalDeductions },
                                        ], cx: "50%", cy: "50%", labelLine: false, label: function (_a) {
                                            var name = _a.name, percent = _a.percent;
                                            return name + " " + (percent * 100).toFixed(0) + "%";
                                        }, outerRadius: 100, fill: "#8884d8", dataKey: "value" },
                                        React.createElement(recharts_1.Cell, { fill: "#10b981" }),
                                        React.createElement(recharts_1.Cell, { fill: "#ef4444" })),
                                    React.createElement(recharts_1.Tooltip, { formatter: function (value) { return formatCurrency(value); } })))) : (React.createElement("p", { className: "text-muted-foreground text-center py-8" }, "No data available")))))),
                React.createElement(tabs_1.TabsContent, { value: "deductions", className: "space-y-6" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Deductions Summary"),
                            React.createElement(card_1.CardDescription, null, "PAYE, NSSF, SHIF, and other deductions")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("p", { className: "text-muted-foreground text-center py-8" }, "Deduction details based on payroll data")))),
                React.createElement(tabs_1.TabsContent, { value: "details", className: "space-y-6" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "YTD Payroll Summary"),
                            React.createElement(card_1.CardDescription, null, "Year-to-date overview by department")),
                        React.createElement(card_1.CardContent, null, isLoading ? (React.createElement("div", { className: "flex justify-center items-center py-8" },
                            React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }))) : departmentComparison.length > 0 ? (React.createElement(table_1.Table, null,
                            React.createElement(table_1.TableHeader, null,
                                React.createElement(table_1.TableRow, null,
                                    React.createElement(table_1.TableHead, null, "Department"),
                                    React.createElement(table_1.TableHead, { className: "text-right" }, "Employees"),
                                    React.createElement(table_1.TableHead, { className: "text-right" }, "Total Gross"),
                                    React.createElement(table_1.TableHead, { className: "text-right" }, "Total Net"),
                                    React.createElement(table_1.TableHead, { className: "text-right" }, "Total Deductions"),
                                    React.createElement(table_1.TableHead, { className: "text-right" }, "Avg Net Pay"))),
                            React.createElement(table_1.TableBody, null,
                                departmentComparison.map(function (dept, idx) { return (React.createElement(table_1.TableRow, { key: dept.department || "comp-" + idx },
                                    React.createElement(table_1.TableCell, { className: "font-medium" }, dept.department),
                                    React.createElement(table_1.TableCell, { className: "text-right" }, dept.count),
                                    React.createElement(table_1.TableCell, { className: "text-right" }, formatCurrency(dept.grossSalary)),
                                    React.createElement(table_1.TableCell, { className: "text-right" }, formatCurrency(dept.netSalary)),
                                    React.createElement(table_1.TableCell, { className: "text-right" }, formatCurrency(dept.deductions)),
                                    React.createElement(table_1.TableCell, { className: "text-right" }, formatCurrency(dept.netSalary / (dept.count || 1))))); }),
                                React.createElement(table_1.TableRow, { className: "font-bold bg-gray-50" },
                                    React.createElement(table_1.TableCell, null, "TOTAL"),
                                    React.createElement(table_1.TableCell, { className: "text-right" }, stats.employeeCount),
                                    React.createElement(table_1.TableCell, { className: "text-right" }, formatCurrency(stats.totalGrossSalary)),
                                    React.createElement(table_1.TableCell, { className: "text-right" }, formatCurrency(stats.totalNetPay)),
                                    React.createElement(table_1.TableCell, { className: "text-right" }, formatCurrency(stats.totalDeductions)),
                                    React.createElement(table_1.TableCell, { className: "text-right" }, formatCurrency(stats.avgNetPay)))))) : (React.createElement("p", { className: "text-muted-foreground text-center py-8" }, "No payroll data found for the selected criteria")))))))));
}
exports["default"] = DepartmentPayrollReports;
