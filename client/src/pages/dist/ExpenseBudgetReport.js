"use strict";
exports.__esModule = true;
var ModuleLayout_1 = require("@/components/ModuleLayout");
var sonner_1 = require("sonner");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var alert_1 = require("@/components/ui/alert");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var stats_card_1 = require("@/components/ui/stats-card");
var currency_1 = require("@/lib/currency");
function ExpenseBudgetReport() {
    var currencyCode = currency_1.useCurrencySettings().code;
    var _a = react_1.useState(new Date().getFullYear().toString()), yearFilter = _a[0], setYearFilter = _a[1];
    var _b = react_1.useState("all"), departmentFilter = _b[0], setDepartmentFilter = _b[1];
    var _c = react_1.useState(null), selectedBudgetId = _c[0], setSelectedBudgetId = _c[1];
    var utils = trpc_1.trpc.useUtils();
    // Fetch budgets for the year
    var _d = trpc_1.trpc.budget.list.useQuery({
        year: parseInt(yearFilter)
    }), _e = _d.data, budgets = _e === void 0 ? [] : _e, budgetsLoading = _d.isLoading;
    // Fetch budget allocations
    var _f = trpc_1.trpc.budget.getAllocations.useQuery({
        year: parseInt(yearFilter)
    }), _g = _f.data, allocations = _g === void 0 ? [] : _g, allocationsLoading = _f.isLoading;
    // Fetch expenses linked to budgets
    var _h = trpc_1.trpc.expenses.getByBudget.useQuery({ budgetAllocationId: selectedBudgetId || undefined }, { enabled: !!selectedBudgetId }), _j = _h.data, expenses = _j === void 0 ? [] : _j, expensesLoading = _h.isLoading;
    var isLoading = budgetsLoading || allocationsLoading || expensesLoading;
    // Calculate statistics
    var stats = react_1.useMemo(function () {
        var totalBudgeted = budgets.reduce(function (sum, b) { return sum + (b.totalAmount || 0); }, 0);
        var totalSpent = allocations.reduce(function (sum, a) { return sum + (a.spent || 0); }, 0);
        var totalRemaining = totalBudgeted - totalSpent;
        var utilizationPercent = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0;
        return {
            totalBudgeted: totalBudgeted,
            totalSpent: totalSpent,
            totalRemaining: totalRemaining,
            utilizationPercent: utilizationPercent,
            overBudgetCount: allocations.filter(function (a) { return (a.spent || 0) > (a.totalAmount || 0); }).length
        };
    }, [budgets, allocations]);
    // Prepare chart data
    var budgetTrendData = react_1.useMemo(function () {
        // Group allocations by department and month
        var groupedData = {};
        allocations.forEach(function (alloc) {
            var key = alloc.departmentName || "Unassigned";
            if (!groupedData[key]) {
                groupedData[key] = {
                    department: key,
                    budgeted: 0,
                    spent: 0,
                    remaining: 0
                };
            }
            groupedData[key].budgeted += alloc.totalAmount || 0;
            groupedData[key].spent += alloc.spent || 0;
            groupedData[key].remaining += (alloc.totalAmount || 0) - (alloc.spent || 0);
        });
        return Object.values(groupedData);
    }, [allocations]);
    var COLORS = ["#10b981", "#f59e0b", "#ef4444"];
    var departmentSummary = react_1.useMemo(function () {
        return allocations.map(function (alloc) { return ({
            department: alloc.departmentName || "Unassigned",
            budgeted: alloc.totalAmount || 0,
            spent: alloc.spent || 0,
            remaining: (alloc.totalAmount || 0) - (alloc.spent || 0),
            utilizationPercent: alloc.totalAmount > 0 ? Math.round(((alloc.spent || 0) / (alloc.totalAmount || 0)) * 100) : 0,
            status: (alloc.spent || 0) > (alloc.totalAmount || 0) ? "Over Budget" : "On Track"
        }); });
    }, [allocations]);
    var formatCurrency = function (value) {
        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: currencyCode,
            minimumFractionDigits: 0
        }).format(value);
    };
    var years = Array.from({ length: 5 }, function (_, i) {
        var year = new Date().getFullYear() - i;
        return year.toString();
    });
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Expense Budget Report", breadcrumbs: [
            { label: "Finance", href: "/accounting" },
            { label: "Budgets", href: "/budgets" },
            { label: "Report" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-lg" }, "Report Filters")),
                React.createElement(card_1.CardContent, { className: "flex gap-4" },
                    React.createElement("div", { className: "flex-1" },
                        React.createElement("label", { className: "text-sm font-medium mb-2 block" }, "Fiscal Year"),
                        React.createElement(select_1.Select, { value: yearFilter, onValueChange: setYearFilter },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null, years.map(function (year) { return (React.createElement(select_1.SelectItem, { key: year, value: year }, year)); })))),
                    React.createElement("div", { className: "flex items-end" },
                        React.createElement(button_1.Button, { variant: "outline", onClick: function () { utils.budget.invalidate(); utils.expenses.invalidate(); sonner_1.toast.success("Report regenerated"); } }, "Generate Report")))),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Budgeted", value: React.createElement(React.Fragment, null,
                        React.createElement(lucide_react_1.DollarSign, { className: "h-6 w-6 text-blue-500" }),
                        " ",
                        formatCurrency(stats.totalBudgeted)), description: React.createElement(React.Fragment, null,
                        budgets.length,
                        " Budget allocations"), icon: React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Total Spent", value: React.createElement(React.Fragment, null,
                        React.createElement(lucide_react_1.TrendingDown, { className: "h-6 w-6 text-orange-500" }),
                        " ",
                        formatCurrency(stats.totalSpent)), description: React.createElement(React.Fragment, null,
                        stats.utilizationPercent,
                        "% utilization"), icon: React.createElement(lucide_react_1.TrendingDown, { className: "h-5 w-5" }), color: "border-l-orange-500" }),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-muted-foreground" }, "Remaining")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold flex items-center gap-2 " + (stats.totalRemaining < 0 ? "text-red-600" : "text-green-600") },
                            React.createElement(lucide_react_1.TrendingUp, { className: "h-6 w-6" }),
                            formatCurrency(stats.totalRemaining)),
                        React.createElement("p", { className: "text-xs text-muted-foreground mt-1" }, "Available funds"))),
                React.createElement(stats_card_1.StatsCard, { label: "Over Budget", value: React.createElement(React.Fragment, null,
                        React.createElement(lucide_react_1.AlertTriangle, { className: "h-6 w-6 text-red-500" }),
                        " ",
                        stats.overBudgetCount), description: "Departments/allocations", icon: React.createElement(lucide_react_1.AlertTriangle, { className: "h-5 w-5" }), color: "border-l-red-500" })),
            React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Budget vs Spent by Department"),
                        React.createElement(card_1.CardDescription, null,
                            "Year: ",
                            yearFilter)),
                    React.createElement(card_1.CardContent, null, budgetTrendData.length > 0 ? (React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                        React.createElement(recharts_1.BarChart, { data: budgetTrendData },
                            React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                            React.createElement(recharts_1.XAxis, { dataKey: "department", angle: -45, textAnchor: "end", height: 80 }),
                            React.createElement(recharts_1.YAxis, null),
                            React.createElement(recharts_1.Tooltip, { formatter: function (value) { return formatCurrency(value); } }),
                            React.createElement(recharts_1.Legend, null),
                            React.createElement(recharts_1.Bar, { dataKey: "budgeted", fill: "#3b82f6", name: "Budgeted" }),
                            React.createElement(recharts_1.Bar, { dataKey: "spent", fill: "#ef4444", name: "Spent" })))) : (React.createElement("p", { className: "text-muted-foreground text-center py-8" }, "No data available")))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Budget Utilization Status"),
                        React.createElement(card_1.CardDescription, null, "Distribution of remaining budget")),
                    React.createElement(card_1.CardContent, null, stats.totalBudgeted > 0 ? (React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                        React.createElement(recharts_1.PieChart, null,
                            React.createElement(recharts_1.Pie, { data: [
                                    { name: "Spent", value: stats.totalSpent },
                                    { name: "Remaining", value: Math.max(0, stats.totalRemaining) },
                                ], cx: "50%", cy: "50%", labelLine: false, label: function (_a) {
                                    var name = _a.name, percent = _a.percent;
                                    return name + " " + (percent * 100).toFixed(0) + "%";
                                }, outerRadius: 100, fill: "#8884d8", dataKey: "value" },
                                React.createElement(recharts_1.Cell, { fill: "#ef4444" }),
                                React.createElement(recharts_1.Cell, { fill: "#10b981" })),
                            React.createElement(recharts_1.Tooltip, { formatter: function (value) { return formatCurrency(value); } })))) : (React.createElement("p", { className: "text-muted-foreground text-center py-8" }, "No budget data available"))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Department Budget Summary"),
                    React.createElement(card_1.CardDescription, null, "Detailed breakdown by department")),
                React.createElement(card_1.CardContent, null, isLoading ? (React.createElement("div", { className: "flex justify-center items-center py-8" },
                    React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }))) : departmentSummary.length > 0 ? (React.createElement(table_1.Table, null,
                    React.createElement(table_1.TableHeader, null,
                        React.createElement(table_1.TableRow, null,
                            React.createElement(table_1.TableHead, null, "Department"),
                            React.createElement(table_1.TableHead, { className: "text-right" }, "Budgeted"),
                            React.createElement(table_1.TableHead, { className: "text-right" }, "Spent"),
                            React.createElement(table_1.TableHead, { className: "text-right" }, "Remaining"),
                            React.createElement(table_1.TableHead, { className: "text-right" }, "Utilization %"),
                            React.createElement(table_1.TableHead, null, "Status"))),
                    React.createElement(table_1.TableBody, null, departmentSummary.map(function (dept, idx) { return (React.createElement(table_1.TableRow, { key: dept.department || "exp-" + idx, className: dept.status === "Over Budget" ? "bg-red-50" : "" },
                        React.createElement(table_1.TableCell, { className: "font-medium" }, dept.department),
                        React.createElement(table_1.TableCell, { className: "text-right" }, formatCurrency(dept.budgeted)),
                        React.createElement(table_1.TableCell, { className: "text-right" }, formatCurrency(dept.spent)),
                        React.createElement(table_1.TableCell, { className: "text-right font-medium " + (dept.remaining < 0 ? "text-red-600" : "text-green-600") }, formatCurrency(dept.remaining)),
                        React.createElement(table_1.TableCell, { className: "text-right" },
                            dept.utilizationPercent,
                            "%"),
                        React.createElement(table_1.TableCell, null,
                            React.createElement("span", { className: "px-2 py-1 rounded text-xs font-medium " + (dept.status === "Over Budget"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-green-100 text-green-700") }, dept.status)))); })))) : (React.createElement("p", { className: "text-muted-foreground text-center py-8" }, "No allocations found for this period")))),
            stats.overBudgetCount > 0 && (React.createElement(alert_1.Alert, { className: "border-red-200 bg-red-50" },
                React.createElement(lucide_react_1.AlertTriangle, { className: "h-4 w-4 text-red-600" }),
                React.createElement(alert_1.AlertDescription, { className: "text-red-800" },
                    React.createElement("h3", { className: "font-semibold mb-1" }, "Budget Alert"),
                    stats.overBudgetCount,
                    " department/allocation(s) have exceeded their budget limits. Review spending and consider budget reallocation."))))));
}
exports["default"] = ExpenseBudgetReport;
