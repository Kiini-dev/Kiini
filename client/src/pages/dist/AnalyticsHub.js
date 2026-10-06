"use strict";
exports.__esModule = true;
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var card_1 = require("@/components/ui/card");
var tabs_1 = require("@/components/ui/tabs");
var button_1 = require("@/components/ui/button");
var select_1 = require("@/components/ui/select");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
function KPICard(_a) {
    var title = _a.title, value = _a.value, subtitle = _a.subtitle, status = _a.status, change = _a.change;
    var isDanger = status === 'negative';
    var isPositive = status === 'positive';
    return (React.createElement(card_1.Card, null,
        React.createElement(card_1.CardHeader, { className: "pb-2" },
            React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-muted-foreground" }, title)),
        React.createElement(card_1.CardContent, null,
            React.createElement("div", { className: "text-2xl font-bold" },
                "Ksh ",
                typeof value === 'number' ? value.toLocaleString() : value),
            React.createElement("div", { className: "flex items-center gap-2 text-xs text-muted-foreground mt-1" },
                isPositive && React.createElement(lucide_react_1.TrendingUp, { className: "w-4 h-4 text-green-600" }),
                isDanger && React.createElement(lucide_react_1.TrendingDown, { className: "w-4 h-4 text-red-600" }),
                subtitle),
            change && (React.createElement("div", { className: "text-xs font-semibold mt-2 " + (isPositive ? 'text-green-600' : isDanger ? 'text-red-600' : 'text-gray-600') },
                change > 0 ? '+' : '',
                change,
                "%")))));
}
function AnalyticsHub() {
    var _a = react_1.useState('current'), selectedPeriod = _a[0], setPeriod = _a[1];
    var _b = react_1.useState(false), compareMode = _b[0], setCompareMode = _b[1];
    // Fetch analytics data from tRPC
    var financialOverview = trpc_1.trpc.advancedAnalytics.getFinancialOverview.useQuery({});
    var revenueAnalytics = trpc_1.trpc.advancedAnalytics.getRevenueAnalytics.useQuery({});
    var expenseAnalytics = trpc_1.trpc.advancedAnalytics.getExpenseAnalytics.useQuery({});
    var cashFlowAnalytics = trpc_1.trpc.advancedAnalytics.getCashFlowAnalytics.useQuery({});
    var profitabilityAnalytics = trpc_1.trpc.advancedAnalytics.getProfitabilityAnalytics.useQuery({});
    var inventoryAnalytics = trpc_1.trpc.advancedAnalytics.getInventoryAnalytics.useQuery({});
    var receivablesAnalytics = trpc_1.trpc.advancedAnalytics.getReceivablesAnalytics.useQuery({});
    var employeeAnalytics = trpc_1.trpc.advancedAnalytics.getEmployeeAnalytics.useQuery({});
    var assetAnalytics = trpc_1.trpc.advancedAnalytics.getAssetAnalytics.useQuery({});
    var departmentAnalytics = trpc_1.trpc.advancedAnalytics.getDepartmentAnalytics.useQuery({});
    var comparativeAnalytics = trpc_1.trpc.advancedAnalytics.getComparativeAnalytics.useQuery({});
    var isLoading = financialOverview.isLoading ||
        revenueAnalytics.isLoading ||
        expenseAnalytics.isLoading;
    var handleExport = function () {
        var overview = financialOverview.data;
        var revenue = revenueAnalytics.data;
        if (!overview && !revenue) {
            sonner_1.toast.info("No data to export");
            return;
        }
        var lines = ["Analytics Report", "Generated: " + new Date().toLocaleString(), ""];
        if (overview) {
            lines.push("=== Financial Overview ===");
            Object.entries(overview).forEach(function (_a) {
                var k = _a[0], v = _a[1];
                return lines.push(k + ": " + JSON.stringify(v));
            });
        }
        if (revenue) {
            lines.push("", "=== Revenue Analytics ===");
            Object.entries(revenue).forEach(function (_a) {
                var k = _a[0], v = _a[1];
                return lines.push(k + ": " + JSON.stringify(v));
            });
        }
        var blob = new Blob([lines.join("\n")], { type: "text/plain" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "analytics-report.txt";
        a.click();
        URL.revokeObjectURL(url);
        sonner_1.toast.success("Analytics report exported");
    };
    return (React.createElement("div", { className: "p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen" },
        React.createElement("div", { className: "mb-8" },
            React.createElement("div", { className: "flex justify-between items-center mb-4" },
                React.createElement("div", null,
                    React.createElement("h1", { className: "text-3xl font-bold text-gray-900" }, "Analytics Hub"),
                    React.createElement("p", { className: "text-gray-600 mt-1" }, "Comprehensive Business Intelligence Dashboard")),
                React.createElement("div", { className: "flex gap-4" },
                    React.createElement(select_1.Select, { value: selectedPeriod, onValueChange: setPeriod },
                        React.createElement(select_1.SelectTrigger, { className: "w-[180px]" },
                            React.createElement(select_1.SelectValue, { placeholder: "Select period" })),
                        React.createElement(select_1.SelectContent, null,
                            React.createElement(select_1.SelectItem, { value: "current" }, "Current Month"),
                            React.createElement(select_1.SelectItem, { value: "quarter" }, "This Quarter"),
                            React.createElement(select_1.SelectItem, { value: "year" }, "This Year"),
                            React.createElement(select_1.SelectItem, { value: "custom" }, "Custom Range"))),
                    React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleExport },
                        React.createElement(lucide_react_1.Download, { className: "w-4 h-4 mr-2" }),
                        "Export PDF")))),
        React.createElement(tabs_1.Tabs, { defaultValue: "overview", className: "w-full" },
            React.createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-5 mb-8 bg-white" },
                React.createElement(tabs_1.TabsTrigger, { value: "overview" }, "Overview"),
                React.createElement(tabs_1.TabsTrigger, { value: "revenue" }, "Revenue"),
                React.createElement(tabs_1.TabsTrigger, { value: "expenses" }, "Expenses"),
                React.createElement(tabs_1.TabsTrigger, { value: "cash" }, "Cash Flow"),
                React.createElement(tabs_1.TabsTrigger, { value: "departments" }, "Departments")),
            React.createElement(tabs_1.TabsContent, { value: "overview", className: "space-y-6" },
                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" }, financialOverview.data && (React.createElement(React.Fragment, null,
                    React.createElement(KPICard, { title: "Revenue (YTD)", value: financialOverview.data.revenue.ytd, subtitle: "vs prior year: " + (financialOverview.data.revenue.variance > 0 ? '+' : '') + financialOverview.data.revenue.variance.toFixed(1) + "%", status: financialOverview.data.revenue.status, change: financialOverview.data.revenue.variance }),
                    React.createElement(KPICard, { title: "Expenses (YTD)", value: financialOverview.data.expenses.ytd, subtitle: "vs budget: " + financialOverview.data.expenses.variance.toFixed(1) + "%", status: financialOverview.data.expenses.status, change: -financialOverview.data.expenses.variance }),
                    React.createElement(KPICard, { title: "Net Income", value: financialOverview.data.netIncome.ytd, subtitle: "Margin: " + financialOverview.data.netIncome.margin.toFixed(1) + "%", status: financialOverview.data.netIncome.status }),
                    React.createElement(KPICard, { title: "Current Ratio", value: financialOverview.data.ratios.currentRatio, subtitle: "Target: 1.5-2.0", status: financialOverview.data.ratios.currentRatio > 1.5 ? 'positive' : 'neutral' })))),
                React.createElement(card_1.Card, { className: "bg-white" },
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Financial Health Indicators")),
                    React.createElement(card_1.CardContent, { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" }, financialOverview.data && (React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200" },
                            React.createElement("p", { className: "text-sm font-medium text-gray-600" }, "Profit Margin"),
                            React.createElement("p", { className: "text-2xl font-bold text-blue-600 mt-2" },
                                financialOverview.data.ratios.profitMargin.toFixed(1),
                                "%")),
                        React.createElement("div", { className: "p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200" },
                            React.createElement("p", { className: "text-sm font-medium text-gray-600" }, "ROA"),
                            React.createElement("p", { className: "text-2xl font-bold text-green-600 mt-2" },
                                financialOverview.data.ratios.returnOnAssets,
                                "%")),
                        React.createElement("div", { className: "p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200" },
                            React.createElement("p", { className: "text-sm font-medium text-gray-600" }, "Debt/Equity"),
                            React.createElement("p", { className: "text-2xl font-bold text-purple-600 mt-2" }, financialOverview.data.ratios.debtToEquity)),
                        React.createElement("div", { className: "p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200" },
                            React.createElement("p", { className: "text-sm font-medium text-gray-600" }, "Current Ratio"),
                            React.createElement("p", { className: "text-2xl font-bold text-orange-600 mt-2" }, financialOverview.data.ratios.currentRatio)))))),
                React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
                    React.createElement(card_1.Card, { className: "bg-white" },
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Revenue Trend (12 Months)"),
                            React.createElement(card_1.CardDescription, null, "Monthly revenue with transactions")),
                        React.createElement(card_1.CardContent, null, revenueAnalytics.data && (React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                            React.createElement(recharts_1.LineChart, { data: revenueAnalytics.data.monthlyTrend },
                                React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3", stroke: "#e5e7eb" }),
                                React.createElement(recharts_1.XAxis, { dataKey: "month", stroke: "#6b7280" }),
                                React.createElement(recharts_1.YAxis, { stroke: "#6b7280" }),
                                React.createElement(recharts_1.Tooltip, { contentStyle: { backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }, formatter: function (value) { return "$" + value.toLocaleString(); } }),
                                React.createElement(recharts_1.Legend, null),
                                React.createElement(recharts_1.Line, { type: "monotone", dataKey: "revenue", stroke: "#3b82f6", strokeWidth: 2, dot: { fill: '#3b82f6', r: 4 }, activeDot: { r: 6 } })))))),
                    React.createElement(card_1.Card, { className: "bg-white" },
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Expense Breakdown"),
                            React.createElement(card_1.CardDescription, null, "By category")),
                        React.createElement(card_1.CardContent, null, expenseAnalytics.data && (React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                            React.createElement(recharts_1.PieChart, null,
                                React.createElement(recharts_1.Pie, { data: expenseAnalytics.data.byCategory, cx: "50%", cy: "50%", labelLine: false, label: function (entry) { return entry.category + ": " + entry.percentage.toFixed(0) + "%"; }, outerRadius: 80, fill: "#8884d8", dataKey: "amount" }, expenseAnalytics.data.byCategory.map(function (entry, index) { return (React.createElement(recharts_1.Cell, { key: "cell-" + index, fill: COLORS[index % COLORS.length] })); })),
                                React.createElement(recharts_1.Tooltip, { formatter: function (value) { return "$" + value.toLocaleString(); } })))))))),
            React.createElement(tabs_1.TabsContent, { value: "revenue", className: "space-y-6" },
                React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" }, revenueAnalytics.data && (React.createElement(React.Fragment, null,
                    React.createElement(KPICard, { title: "Total Revenue", value: revenueAnalytics.data.metrics.totalRevenue, subtitle: "All time", status: "positive" }),
                    React.createElement(KPICard, { title: "Avg Transaction", value: revenueAnalytics.data.metrics.averageTransactionValue, subtitle: revenueAnalytics.data.metrics.transactionCount + " transactions", status: "neutral" }),
                    React.createElement(KPICard, { title: "Transaction Count", value: revenueAnalytics.data.metrics.transactionCount, subtitle: "Total invoices", status: "positive" })))),
                React.createElement(card_1.Card, { className: "bg-white" },
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Monthly Revenue Trend")),
                    React.createElement(card_1.CardContent, null, revenueAnalytics.data && (React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 400 },
                        React.createElement(recharts_1.BarChart, { data: revenueAnalytics.data.monthlyTrend },
                            React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3", stroke: "#e5e7eb" }),
                            React.createElement(recharts_1.XAxis, { dataKey: "month", stroke: "#6b7280" }),
                            React.createElement(recharts_1.YAxis, { stroke: "#6b7280" }),
                            React.createElement(recharts_1.Tooltip, { contentStyle: { backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }, formatter: function (value) { return "$" + value.toLocaleString(); } }),
                            React.createElement(recharts_1.Legend, null),
                            React.createElement(recharts_1.Bar, { dataKey: "revenue", fill: "#3b82f6", radius: [8, 8, 0, 0] }))))))),
            React.createElement(tabs_1.TabsContent, { value: "expenses", className: "space-y-6" },
                React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" }, expenseAnalytics.data && (React.createElement(React.Fragment, null,
                    React.createElement(KPICard, { title: "Total Expenses", value: expenseAnalytics.data.metrics.totalExpenses, subtitle: "All time", status: "neutral" }),
                    React.createElement(KPICard, { title: "Avg Monthly", value: expenseAnalytics.data.metrics.averageExpense, subtitle: "Monthly average", status: "neutral" })))),
                React.createElement(card_1.Card, { className: "bg-white" },
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Expenses by Category")),
                    React.createElement(card_1.CardContent, null, expenseAnalytics.data && (React.createElement("div", { className: "space-y-3" }, expenseAnalytics.data.byCategory.map(function (cat) { return (React.createElement("div", { key: cat.category, className: "flex items-center justify-between" },
                        React.createElement("div", { className: "flex-1" },
                            React.createElement("div", { className: "flex justify-between mb-1" },
                                React.createElement("span", { className: "text-sm font-medium" }, cat.category),
                                React.createElement("span", { className: "text-sm text-gray-600" },
                                    "Ksh ",
                                    cat.amount.toLocaleString())),
                            React.createElement("div", { className: "w-full bg-gray-200 rounded-full h-2" },
                                React.createElement("div", { className: "bg-blue-600 h-2 rounded-full", style: { width: cat.percentage + "%" } }))),
                        React.createElement("span", { className: "ml-4 text-sm font-semibold text-gray-700" },
                            cat.percentage.toFixed(0),
                            "%"))); })))))),
            React.createElement(tabs_1.TabsContent, { value: "cash", className: "space-y-6" }, cashFlowAnalytics.data && (React.createElement(React.Fragment, null,
                React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" },
                    React.createElement(KPICard, { title: "Opening Balance", value: cashFlowAnalytics.data.current.openingBalance, subtitle: "Start of period", status: "neutral" }),
                    React.createElement(KPICard, { title: "Receipts", value: cashFlowAnalytics.data.current.receipts, subtitle: "Cash In", status: "positive" }),
                    React.createElement(KPICard, { title: "Disbursements", value: cashFlowAnalytics.data.current.disbursements, subtitle: "Cash Out", status: "neutral" }),
                    React.createElement(KPICard, { title: "Closing Balance", value: cashFlowAnalytics.data.current.closingBalance, subtitle: "End of period", status: "positive" })),
                React.createElement(card_1.Card, { className: "bg-white" },
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Cash Flow Forecast"),
                        React.createElement(card_1.CardDescription, null, "30/60/90-day projection")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" },
                            React.createElement("div", { className: "p-4 bg-blue-50 rounded-lg border border-blue-200" },
                                React.createElement("p", { className: "text-sm font-medium text-gray-600" }, "30 Days"),
                                React.createElement("p", { className: "text-2xl font-bold text-blue-600 mt-2" },
                                    "$",
                                    cashFlowAnalytics.data.forecast.day30.toLocaleString())),
                            React.createElement("div", { className: "p-4 bg-blue-50 rounded-lg border border-blue-200" },
                                React.createElement("p", { className: "text-sm font-medium text-gray-600" }, "60 Days"),
                                React.createElement("p", { className: "text-2xl font-bold text-blue-600 mt-2" },
                                    "$",
                                    cashFlowAnalytics.data.forecast.day60.toLocaleString())),
                            React.createElement("div", { className: "p-4 bg-blue-50 rounded-lg border border-blue-200" },
                                React.createElement("p", { className: "text-sm font-medium text-gray-600" }, "90 Days"),
                                React.createElement("p", { className: "text-2xl font-bold text-blue-600 mt-2" },
                                    "$",
                                    cashFlowAnalytics.data.forecast.day90.toLocaleString()))))),
                cashFlowAnalytics.data.alerts.length > 0 && (React.createElement(card_1.Card, { className: "bg-red-50 border-red-200" },
                    React.createElement(card_1.CardHeader, null,
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement(lucide_react_1.AlertCircle, { className: "w-5 h-5 text-red-600" }),
                            React.createElement(card_1.CardTitle, { className: "text-red-600" }, "Alerts"))),
                    React.createElement(card_1.CardContent, null, cashFlowAnalytics.data.alerts.map(function (alert, idx) { return (React.createElement("p", { key: idx, className: "text-sm text-red-600" }, alert)); }))))))),
            React.createElement(tabs_1.TabsContent, { value: "departments", className: "space-y-6" },
                React.createElement(card_1.Card, { className: "bg-white" },
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Department Performance")),
                    React.createElement(card_1.CardContent, null, departmentAnalytics.data && (React.createElement("div", { className: "space-y-4" }, departmentAnalytics.data.departments.map(function (dept) { return (React.createElement("div", { key: dept.departmentId, className: "p-4 border rounded-lg" },
                        React.createElement("div", { className: "flex justify-between items-center mb-2" },
                            React.createElement("h3", { className: "font-semibold" },
                                "Department ",
                                dept.departmentId),
                            React.createElement("span", { className: "text-lg font-bold text-blue-600" },
                                "$",
                                dept.expense.toLocaleString())),
                        React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-gray-600" }, "Margin"),
                                React.createElement("p", { className: "font-semibold" },
                                    dept.profitMargin.toFixed(2),
                                    "%")),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-gray-600" }, "Headcount"),
                                React.createElement("p", { className: "font-semibold" },
                                    dept.headcount,
                                    " employees")),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-gray-600" }, "Cost/Employee"),
                                React.createElement("p", { className: "font-semibold" },
                                    "Ksh ",
                                    dept.costPerEmployee.toLocaleString()))))); })))))))));
}
exports["default"] = AnalyticsHub;
