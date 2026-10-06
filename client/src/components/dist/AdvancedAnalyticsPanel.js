"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.AdvancedAnalyticsPanel = void 0;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var recharts_1 = require("recharts");
function AdvancedAnalyticsPanel() {
    var _a = react_1.useState("month"), timeRange = _a[0], setTimeRange = _a[1];
    var _b = react_1.useState(["revenue", "growth", "retention"]), selectedMetrics = _b[0], setSelectedMetrics = _b[1];
    // Sample data - replace with real API data
    var revenueData = [
        { period: "Jan", value: 45000, percentage: 100 },
        { period: "Feb", value: 52000, percentage: 115 },
        { period: "Mar", value: 48000, percentage: 106 },
        { period: "Apr", value: 61000, percentage: 135 },
        { period: "May", value: 55000, percentage: 122 },
        { period: "Jun", value: 67000, percentage: 148 },
    ];
    var growthData = [
        { period: "Week 1", value: 12, percentage: 100 },
        { period: "Week 2", value: 15, percentage: 125 },
        { period: "Week 3", value: 18, percentage: 150 },
        { period: "Week 4", value: 22, percentage: 183 },
    ];
    var categoryDistribution = [
        { name: "Products", value: 35, color: "#3b82f6" },
        { name: "Services", value: 25, color: "#8b5cf6" },
        { name: "Consulting", value: 20, color: "#ec4899" },
        { name: "Support", value: 20, color: "#f59e0b" },
    ];
    var metrics = [
        { title: "Total Revenue", value: "$287K", change: 12.5, trend: "up", color: "bg-blue-50 text-blue-700" },
        { title: "Growth Rate", value: "23.5%", change: 8.2, trend: "up", color: "bg-green-50 text-green-700" },
        { title: "Customer Count", value: "1,245", change: -2.1, trend: "down", color: "bg-purple-50 text-purple-700" },
        { title: "Avg Order Value", value: "$2,341", change: 5.3, trend: "up", color: "bg-orange-50 text-orange-700" },
    ];
    var handleExport = function () {
        // Export chart as image/CSV
        console.log("Exporting analytics...");
    };
    var handleFilterApply = function () {
        // Apply selected metrics
        console.log("Applying filters:", selectedMetrics);
    };
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "flex items-center justify-between flex-wrap gap-4" },
            React.createElement("div", null,
                React.createElement("h2", { className: "text-3xl font-bold" }, "Analytics Dashboard"),
                React.createElement("p", { className: "text-sm text-gray-600 mt-1" }, "Real-time business metrics and insights")),
            React.createElement("div", { className: "flex items-center gap-2" },
                React.createElement(select_1.Select, { value: timeRange, onValueChange: setTimeRange },
                    React.createElement(select_1.SelectTrigger, { className: "w-32" },
                        React.createElement(select_1.SelectValue, null)),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "week" }, "Last Week"),
                        React.createElement(select_1.SelectItem, { value: "month" }, "Last Month"),
                        React.createElement(select_1.SelectItem, { value: "quarter" }, "Last Quarter"),
                        React.createElement(select_1.SelectItem, { value: "year" }, "Last Year"))),
                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleExport },
                    React.createElement(lucide_react_1.Download, { className: "w-4 h-4 mr-2" }),
                    "Export"))),
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" }, metrics.map(function (metric) { return (React.createElement(card_1.Card, { key: metric.title },
            React.createElement(card_1.CardContent, { className: "p-6" },
                React.createElement("div", { className: "flex items-start justify-between" },
                    React.createElement("div", null,
                        React.createElement("p", { className: "text-sm font-medium text-gray-600" }, metric.title),
                        React.createElement("p", { className: "text-3xl font-bold mt-2" }, metric.value),
                        React.createElement("div", { className: "flex items-center gap-1 mt-2" },
                            React.createElement(lucide_react_1.TrendingUp, { className: "w-4 h-4 " + (metric.trend === "up" ? "text-green-600" : "text-red-600") }),
                            React.createElement("span", { className: "text-sm font-semibold " + (metric.trend === "up" ? "text-green-600" : "text-red-600") },
                                metric.trend === "up" ? "+" : "-",
                                Math.abs(metric.change),
                                "%"))),
                    React.createElement("div", { className: "p-3 rounded-lg " + metric.color },
                        React.createElement(lucide_react_1.TrendingUp, { className: "w-5 h-5" })))))); })),
        React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.BarChart, { className: "w-5 h-5" }),
                        "Revenue Trends"),
                    React.createElement(card_1.CardDescription, null, "Monthly revenue performance")),
                React.createElement(card_1.CardContent, null,
                    React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                        React.createElement(recharts_1.BarChart, { data: revenueData },
                            React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                            React.createElement(recharts_1.XAxis, { dataKey: "period" }),
                            React.createElement(recharts_1.YAxis, null),
                            React.createElement(recharts_1.Tooltip, { formatter: function (value) { return "$" + value.toLocaleString(); } }),
                            React.createElement(recharts_1.Bar, { dataKey: "value", fill: "#3b82f6", radius: [8, 8, 0, 0] }))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.LineChart, { className: "w-5 h-5" }),
                        "Growth Rate"),
                    React.createElement(card_1.CardDescription, null, "Weekly growth percentage")),
                React.createElement(card_1.CardContent, null,
                    React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                        React.createElement(recharts_1.LineChart, { data: growthData },
                            React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                            React.createElement(recharts_1.XAxis, { dataKey: "period" }),
                            React.createElement(recharts_1.YAxis, null),
                            React.createElement(recharts_1.Tooltip, { formatter: function (value) { return value + "%"; } }),
                            React.createElement(recharts_1.Line, { type: "monotone", dataKey: "value", stroke: "#8b5cf6", strokeWidth: 2, dot: { fill: "#8b5cf6", r: 4 } })))))),
        React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6" },
            React.createElement(card_1.Card, { className: "lg:col-span-1" },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.PieChart, { className: "w-5 h-5" }),
                        "Category Mix"),
                    React.createElement(card_1.CardDescription, null, "Revenue distribution")),
                React.createElement(card_1.CardContent, null,
                    React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                        React.createElement(recharts_1.PieChart, null,
                            React.createElement(recharts_1.Pie, { data: categoryDistribution, dataKey: "value", nameKey: "name", cx: "50%", cy: "50%", outerRadius: 100 }, categoryDistribution.map(function (entry, index) { return (React.createElement(recharts_1.Cell, { key: "cell-" + index, fill: entry.color })); })),
                            React.createElement(recharts_1.Tooltip, { formatter: function (value) { return value + "%"; } }))),
                    React.createElement("div", { className: "space-y-2 mt-4" }, categoryDistribution.map(function (cat) { return (React.createElement("div", { key: cat.name, className: "flex items-center justify-between text-sm" },
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement("div", { className: "w-3 h-3 rounded-full", style: { backgroundColor: cat.color } }),
                            React.createElement("span", null, cat.name)),
                        React.createElement("span", { className: "font-semibold" },
                            cat.value,
                            "%"))); })))),
            React.createElement(card_1.Card, { className: "lg:col-span-2" },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Key Insights & Recommendations"),
                    React.createElement(card_1.CardDescription, null, "Data-driven actionable insights")),
                React.createElement(card_1.CardContent, { className: "space-y-4" },
                    React.createElement("div", { className: "space-y-3" },
                        React.createElement("div", { className: "p-3 bg-blue-50 rounded-lg border border-blue-200" },
                            React.createElement("p", { className: "text-sm font-semibold text-blue-900" }, "\uD83D\uDCC8 Revenue Growth"),
                            React.createElement("p", { className: "text-sm text-blue-800 mt-1" }, "Revenue increased 48% compared to last quarter. Continue focus on high-margin product categories.")),
                        React.createElement("div", { className: "p-3 bg-green-50 rounded-lg border border-green-200" },
                            React.createElement("p", { className: "text-sm font-semibold text-green-900" }, "\u2705 Customer Acquisition"),
                            React.createElement("p", { className: "text-sm text-green-800 mt-1" }, "New customers acquired: 245 this month (\u219118% vs last month). Marketing campaigns are performing well.")),
                        React.createElement("div", { className: "p-3 bg-yellow-50 rounded-lg border border-yellow-200" },
                            React.createElement("p", { className: "text-sm font-semibold text-yellow-900" }, "\u26A0\uFE0F Retention Rate"),
                            React.createElement("p", { className: "text-sm text-yellow-800 mt-1" }, "Customer retention dipped 2.1%. Consider launching retention program or improving customer support.")),
                        React.createElement("div", { className: "p-3 bg-purple-50 rounded-lg border border-purple-200" },
                            React.createElement("p", { className: "text-sm font-semibold text-purple-900" }, "\uD83D\uDCA1 Opportunity"),
                            React.createElement("p", { className: "text-sm text-purple-800 mt-1" }, "Services category showing strong growth (23% this month). Consider expanding service offerings.")))))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Advanced Filtering & Export"),
                React.createElement(card_1.CardDescription, null, "Customize dashboard view and export data")),
            React.createElement(card_1.CardContent, { className: "space-y-4" },
                React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4" }, ["Revenue", "Growth", "Retention", "Costs", "Profit", "CTR", "Conversion", "CAC"].map(function (metric) { return (React.createElement("div", { key: metric, className: "flex items-center gap-2" },
                    React.createElement("input", { type: "checkbox", defaultChecked: selectedMetrics.includes(metric.toLowerCase()), onChange: function (e) {
                            if (e.target.checked) {
                                setSelectedMetrics(__spreadArrays(selectedMetrics, [metric.toLowerCase()]));
                            }
                            else {
                                setSelectedMetrics(selectedMetrics.filter(function (m) { return m !== metric.toLowerCase(); }));
                            }
                        }, className: "w-4 h-4 rounded" }),
                    React.createElement("span", { className: "text-sm" }, metric))); })),
                React.createElement("div", { className: "flex gap-2" },
                    React.createElement(button_1.Button, { onClick: handleFilterApply, className: "flex-1" },
                        React.createElement(lucide_react_1.Filter, { className: "w-4 h-4 mr-2" }),
                        "Apply Filters"),
                    React.createElement(button_1.Button, { variant: "outline", className: "flex-1" },
                        React.createElement(lucide_react_1.Download, { className: "w-4 h-4 mr-2" }),
                        "Export as CSV"),
                    React.createElement(button_1.Button, { variant: "outline", className: "flex-1" }, "Export as PDF"))))));
}
exports.AdvancedAnalyticsPanel = AdvancedAnalyticsPanel;
exports["default"] = AdvancedAnalyticsPanel;
