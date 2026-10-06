"use strict";
exports.__esModule = true;
var card_1 = require("@/components/ui/card");
var recharts_1 = require("recharts");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var format_1 = require("@/utils/format");
function MonthlyTrends() {
    var _a = react_1.useState("12"), months = _a[0], setMonths = _a[1];
    var trends = trpc_1.trpc.advancedReports.getMonthlyTrends.useQuery({
        months: parseInt(months)
    }).data;
    if (!trends)
        return React.createElement("div", null, "Loading...");
    var chartData = trends.trends || [];
    // Calculate summary stats
    var totalCreated = chartData.reduce(function (sum, m) { return sum + m.created; }, 0);
    var totalSent = chartData.reduce(function (sum, m) { return sum + m.sent; }, 0);
    var totalConverted = chartData.reduce(function (sum, m) { return sum + m.converted; }, 0);
    var totalRevenue = chartData.reduce(function (sum, m) { return sum + (m.revenue || 0); }, 0);
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", null,
            React.createElement("h1", { className: "text-3xl font-bold" }, "Monthly Trends"),
            React.createElement("p", { className: "text-muted-foreground mt-2" }, "Track quote activity and revenue trends over time")),
        React.createElement("div", { className: "flex items-center gap-4" },
            React.createElement(select_1.Select, { value: months, onValueChange: setMonths },
                React.createElement(select_1.SelectTrigger, { className: "w-48" },
                    React.createElement(select_1.SelectValue, { placeholder: "Select period" })),
                React.createElement(select_1.SelectContent, null,
                    React.createElement(select_1.SelectItem, { value: "3" }, "Last 3 months"),
                    React.createElement(select_1.SelectItem, { value: "6" }, "Last 6 months"),
                    React.createElement(select_1.SelectItem, { value: "12" }, "Last 12 months"),
                    React.createElement(select_1.SelectItem, { value: "24" }, "Last 24 months"))),
            React.createElement("div", { className: "text-sm text-muted-foreground flex items-center gap-2" },
                React.createElement(lucide_react_1.Calendar, { className: "w-4 h-4" }),
                chartData.length,
                " months displayed")),
        React.createElement("div", { className: "grid grid-cols-4 gap-4" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-2" },
                    React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-muted-foreground" }, "Quotes Created")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("p", { className: "text-2xl font-bold" }, totalCreated),
                    React.createElement("p", { className: "text-xs text-muted-foreground mt-1" },
                        "Avg: ",
                        (totalCreated / chartData.length).toFixed(1),
                        "/month"))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-2" },
                    React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-muted-foreground" }, "Quotes Sent")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("p", { className: "text-2xl font-bold text-blue-600" }, totalSent),
                    React.createElement("p", { className: "text-xs text-muted-foreground mt-1" },
                        "Avg: ",
                        (totalSent / chartData.length).toFixed(1),
                        "/month"))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-2" },
                    React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-muted-foreground" }, "Quotes Converted")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("p", { className: "text-2xl font-bold text-green-600" }, totalConverted),
                    React.createElement("p", { className: "text-xs text-muted-foreground mt-1" },
                        "Avg: ",
                        (totalConverted / chartData.length).toFixed(1),
                        "/month"))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-2" },
                    React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-muted-foreground" }, "Total Revenue")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("p", { className: "text-2xl font-bold text-purple-600" }, format_1.formatCurrency(totalRevenue)),
                    React.createElement("p", { className: "text-xs text-muted-foreground mt-1" },
                        "Avg: ",
                        format_1.formatCurrency(totalRevenue / chartData.length),
                        "/month")))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Activity Trends"),
                React.createElement(card_1.CardDescription, null, "Quote creation, sending, and conversion activity over time")),
            React.createElement(card_1.CardContent, null,
                React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 400 },
                    React.createElement(recharts_1.ComposedChart, { data: chartData },
                        React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                        React.createElement(recharts_1.XAxis, { dataKey: "month" }),
                        React.createElement(recharts_1.YAxis, { yAxisId: "left" }),
                        React.createElement(recharts_1.YAxis, { yAxisId: "right", orientation: "right" }),
                        React.createElement(recharts_1.Tooltip, null),
                        React.createElement(recharts_1.Legend, null),
                        React.createElement(recharts_1.Bar, { yAxisId: "left", dataKey: "created", fill: "#93c5fd", name: "Created", radius: [8, 8, 0, 0] }),
                        React.createElement(recharts_1.Bar, { yAxisId: "left", dataKey: "sent", fill: "#60a5fa", name: "Sent", radius: [8, 8, 0, 0] }),
                        React.createElement(recharts_1.Bar, { yAxisId: "left", dataKey: "converted", fill: "#10b981", name: "Converted", radius: [8, 8, 0, 0] }),
                        React.createElement(recharts_1.Line, { yAxisId: "right", type: "monotone", dataKey: "revenue", stroke: "#a855f7", strokeWidth: 2, name: "Revenue ($)" }))))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Monthly Conversion Funnel"),
                React.createElement(card_1.CardDescription, null, "Percentage of quotes that progress through each stage")),
            React.createElement(card_1.CardContent, null,
                React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                    React.createElement(recharts_1.LineChart, { data: chartData },
                        React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                        React.createElement(recharts_1.XAxis, { dataKey: "month" }),
                        React.createElement(recharts_1.YAxis, { label: { value: "Percentage (%)", angle: -90, position: "insideLeft" } }),
                        React.createElement(recharts_1.Tooltip, { formatter: function (value) { return typeof value === 'number' ? value.toFixed(1) + "%" : value; } }),
                        React.createElement(recharts_1.Legend, null),
                        React.createElement(recharts_1.Line, { type: "monotone", dataKey: function (d) {
                                return d.sent > 0 ? (d.converted / d.sent) * 100 : 0;
                            }, stroke: "#06b6d4", strokeWidth: 2, name: "Sent \u2192 Converted %", dot: { fill: "#06b6d4", r: 4 } }),
                        React.createElement(recharts_1.Line, { type: "monotone", dataKey: function (d) {
                                return d.created > 0 ? (d.sent / d.created) * 100 : 0;
                            }, stroke: "#f59e0b", strokeWidth: 2, name: "Created \u2192 Sent %", dot: { fill: "#f59e0b", r: 4 } }))))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Declined Quotes Trend"),
                React.createElement(card_1.CardDescription, null, "Monitor declined quotes to identify patterns")),
            React.createElement(card_1.CardContent, null,
                React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 250 },
                    React.createElement(recharts_1.BarChart, { data: chartData },
                        React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                        React.createElement(recharts_1.XAxis, { dataKey: "month" }),
                        React.createElement(recharts_1.YAxis, null),
                        React.createElement(recharts_1.Tooltip, null),
                        React.createElement(recharts_1.Legend, null),
                        React.createElement(recharts_1.Bar, { dataKey: "declined", fill: "#ef4444", name: "Declined", radius: [8, 8, 0, 0] }))))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Detailed Monthly Breakdown"),
                React.createElement(card_1.CardDescription, null, "Complete statistics for each month")),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "space-y-2 max-h-96 overflow-y-auto" }, chartData.map(function (month) { return (React.createElement("div", { key: month.month, className: "flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50" },
                    React.createElement("div", null,
                        React.createElement("p", { className: "font-semibold text-lg" }, month.month),
                        React.createElement("p", { className: "text-sm text-muted-foreground" },
                            "Created: ",
                            month.created,
                            " | Sent: ",
                            month.sent,
                            " | Converted: ",
                            month.converted,
                            " | Declined: ",
                            month.declined)),
                    React.createElement("div", { className: "text-right" },
                        React.createElement("p", { className: "font-bold text-lg text-purple-600" }, format_1.formatCurrency(month.revenue || 0)),
                        React.createElement("p", { className: "text-xs text-muted-foreground" }, month.sent > 0 ? ((month.converted / month.sent) * 100).toFixed(1) + "% converted" : "—")))); })))),
        React.createElement("button", { className: "inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700" },
            React.createElement(lucide_react_1.TrendingUp, { className: "w-4 h-4" }),
            "Export Trend Report")));
}
exports["default"] = MonthlyTrends;
