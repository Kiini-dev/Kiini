"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var tabs_1 = require("@/components/ui/tabs");
var button_1 = require("@/components/ui/button");
var sonner_1 = require("sonner");
var select_1 = require("@/components/ui/select");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var format_1 = require("@/utils/format");
var stats_card_1 = require("@/components/ui/stats-card");
var exportCsv_1 = require("@/utils/exportCsv");
var COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
function AdvancedReports() {
    var _a = react_1.useState("quotes"), selectedMetric = _a[0], setSelectedMetric = _a[1];
    var _b = react_1.useState("30days"), dateRange = _b[0], setDateRange = _b[1];
    // Fetch metrics
    var quoteMetrics = trpc_1.trpc.advancedReports.getQuoteMetrics.useQuery({}).data;
    var conversionAnalytics = trpc_1.trpc.advancedReports.getConversionAnalytics.useQuery({}).data;
    var revenueForecasting = trpc_1.trpc.advancedReports.getRevenueForecasting.useQuery({
        months: dateRange === "30days" ? 3 : dateRange === "90days" ? 6 : 12
    }).data;
    var clientPerformance = trpc_1.trpc.advancedReports.getClientPerformance.useQuery({}).data;
    var monthlyTrends = trpc_1.trpc.advancedReports.getMonthlyTrends.useQuery({
        months: dateRange === "30days" ? 3 : dateRange === "90days" ? 6 : 12
    }).data;
    var statusDistribution = trpc_1.trpc.advancedReports.getStatusDistribution.useQuery({}).data;
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", null,
            React.createElement("h1", { className: "text-3xl font-bold" }, "Advanced Reports & Analytics"),
            React.createElement("p", { className: "text-muted-foreground mt-2" }, "Comprehensive insights into quotes, conversions, revenue, and performance")),
        React.createElement("div", { className: "flex gap-4 items-end" },
            React.createElement("div", { className: "flex-1" },
                React.createElement("label", { className: "block text-sm font-medium mb-2" }, "Date Range"),
                React.createElement(select_1.Select, { value: dateRange, onValueChange: setDateRange },
                    React.createElement(select_1.SelectTrigger, null,
                        React.createElement(select_1.SelectValue, null)),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "30days" }, "Last 30 Days"),
                        React.createElement(select_1.SelectItem, { value: "90days" }, "Last 90 Days"),
                        React.createElement(select_1.SelectItem, { value: "12months" }, "Last 12 Months")))),
            React.createElement(button_1.Button, { variant: "outline", className: "gap-2", onClick: function () {
                    var rows = (monthlyTrends || []).map(function (row) { return ({
                        month: row.month,
                        quotes: row.quotes,
                        converted: row.converted,
                        value: row.value
                    }); });
                    if (!rows.length) {
                        sonner_1.toast.info("No report data available to export");
                        return;
                    }
                    exportCsv_1.exportToCsv("advanced-reports-" + dateRange, rows);
                    sonner_1.toast.success("Report exported");
                } },
                React.createElement(lucide_react_1.Download, { className: "w-4 h-4" }),
                "Export Report")),
        quoteMetrics && (React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4" },
            React.createElement(stats_card_1.StatsCard, { label: "Total Quotes", value: quoteMetrics.total, description: "All time", color: "border-l-orange-500" }),
            React.createElement(stats_card_1.StatsCard, { label: "Sent", value: quoteMetrics.sent, description: format_1.formatPercentage((quoteMetrics.sent / quoteMetrics.total) * 100), color: "border-l-purple-500" }),
            React.createElement(stats_card_1.StatsCard, { label: "Converted", value: quoteMetrics.converted, description: format_1.formatPercentage((quoteMetrics.converted / quoteMetrics.total) * 100), color: "border-l-green-500" }),
            React.createElement(stats_card_1.StatsCard, { label: "Total Value", value: format_1.formatCurrency(quoteMetrics.totalValue), description: React.createElement(React.Fragment, null,
                    "Avg: ",
                    format_1.formatCurrency(quoteMetrics.averageValue)), color: "border-l-blue-500" }))),
        statusDistribution && (React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Quote Status Distribution"),
                React.createElement(card_1.CardDescription, null, "Current breakdown by status")),
            React.createElement(card_1.CardContent, null,
                React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                    React.createElement(recharts_1.PieChart, null,
                        React.createElement(recharts_1.Pie, { data: [
                                { name: "Draft", value: statusDistribution.distribution.draft },
                                { name: "Sent", value: statusDistribution.distribution.sent },
                                { name: "Accepted", value: statusDistribution.distribution.accepted },
                                { name: "Declined", value: statusDistribution.distribution.declined },
                                { name: "Expired", value: statusDistribution.distribution.expired },
                                { name: "Converted", value: statusDistribution.distribution.converted },
                            ], cx: "50%", cy: "50%", labelLine: false, label: function (entry) { return entry.name + ": " + entry.value; }, outerRadius: 100, fill: "#8884d8", dataKey: "value" }, COLORS.map(function (color, index) { return (React.createElement(recharts_1.Cell, { key: "cell-" + index, fill: color })); })),
                        React.createElement(recharts_1.Tooltip, null)))))),
        React.createElement(tabs_1.Tabs, { defaultValue: "conversion", className: "w-full" },
            React.createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-4" },
                React.createElement(tabs_1.TabsTrigger, { value: "conversion" }, "Conversion"),
                React.createElement(tabs_1.TabsTrigger, { value: "revenue" }, "Revenue"),
                React.createElement(tabs_1.TabsTrigger, { value: "trends" }, "Trends"),
                React.createElement(tabs_1.TabsTrigger, { value: "clients" }, "Clients")),
            React.createElement(tabs_1.TabsContent, { value: "conversion" }, conversionAnalytics && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Quote to Invoice Conversion"),
                    React.createElement(card_1.CardDescription, null,
                        "Overall conversion rate: ",
                        format_1.formatPercentage(conversionAnalytics.overallConversionRate),
                        "%")),
                React.createElement(card_1.CardContent, { className: "space-y-6" },
                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" },
                        React.createElement("div", { className: "bg-blue-50 rounded-lg p-4" },
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Total Quotes"),
                            React.createElement("p", { className: "text-2xl font-bold text-blue-600" }, conversionAnalytics.totalQuotes)),
                        React.createElement("div", { className: "bg-green-50 rounded-lg p-4" },
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Converted"),
                            React.createElement("p", { className: "text-2xl font-bold text-green-600" }, conversionAnalytics.convertedQuotes)),
                        React.createElement("div", { className: "bg-purple-50 rounded-lg p-4" },
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Conversion Rate"),
                            React.createElement("p", { className: "text-2xl font-bold text-purple-600" },
                                format_1.formatPercentage(conversionAnalytics.overallConversionRate),
                                "%"))),
                    conversionAnalytics.monthlyTrends.length > 0 && (React.createElement("div", null,
                        React.createElement("h3", { className: "font-medium mb-4" }, "Monthly Conversion Trends"),
                        React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                            React.createElement(recharts_1.BarChart, { data: conversionAnalytics.monthlyTrends },
                                React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                                React.createElement(recharts_1.XAxis, { dataKey: "month" }),
                                React.createElement(recharts_1.YAxis, null),
                                React.createElement(recharts_1.Tooltip, null),
                                React.createElement(recharts_1.Legend, null),
                                React.createElement(recharts_1.Bar, { dataKey: "sent", fill: "#3b82f6", name: "Sent" }),
                                React.createElement(recharts_1.Bar, { dataKey: "converted", fill: "#10b981", name: "Converted" }))))))))),
            React.createElement(tabs_1.TabsContent, { value: "revenue" }, revenueForecasting && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Revenue Analysis & Forecast"),
                    React.createElement(card_1.CardDescription, null,
                        "Average monthly revenue: ",
                        format_1.formatCurrency(revenueForecasting.averageMonthlyRevenue))),
                React.createElement(card_1.CardContent, { className: "space-y-6" },
                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                        React.createElement("div", { className: "bg-blue-50 rounded-lg p-4" },
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Historical Revenue"),
                            React.createElement("p", { className: "text-2xl font-bold text-blue-600" }, format_1.formatCurrency(revenueForecasting.totalHistoricalRevenue))),
                        React.createElement("div", { className: "bg-orange-50 rounded-lg p-4" },
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Projected Revenue"),
                            React.createElement("p", { className: "text-2xl font-bold text-orange-600" }, format_1.formatCurrency(revenueForecasting.projectedRevenue)))),
                    revenueForecasting.historicalData.length > 0 && (React.createElement("div", null,
                        React.createElement("h3", { className: "font-medium mb-4" }, "Revenue Trends & Forecast"),
                        React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 350 },
                            React.createElement(recharts_1.LineChart, { data: __spreadArrays(revenueForecasting.historicalData, revenueForecasting.forecastData) },
                                React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                                React.createElement(recharts_1.XAxis, { dataKey: "month" }),
                                React.createElement(recharts_1.YAxis, null),
                                React.createElement(recharts_1.Tooltip, { formatter: function (value) { return value ? format_1.formatCurrency(value) : "-"; } }),
                                React.createElement(recharts_1.Legend, null),
                                React.createElement(recharts_1.Line, { type: "monotone", dataKey: "actual", stroke: "#3b82f6", name: "Actual Revenue", connectNulls: true }),
                                React.createElement(recharts_1.Line, { type: "monotone", dataKey: "forecast", stroke: "#f59e0b", strokeDasharray: "5 5", name: "Forecasted Revenue", connectNulls: true }))))))))),
            React.createElement(tabs_1.TabsContent, { value: "trends" }, monthlyTrends && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Monthly Activity Trends"),
                    React.createElement(card_1.CardDescription, null, "Quote creation and conversion patterns")),
                React.createElement(card_1.CardContent, null,
                    React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 350 },
                        React.createElement(recharts_1.LineChart, { data: monthlyTrends.trends },
                            React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                            React.createElement(recharts_1.XAxis, { dataKey: "month" }),
                            React.createElement(recharts_1.YAxis, null),
                            React.createElement(recharts_1.Tooltip, null),
                            React.createElement(recharts_1.Legend, null),
                            React.createElement(recharts_1.Line, { type: "monotone", dataKey: "created", stroke: "#3b82f6", name: "Created" }),
                            React.createElement(recharts_1.Line, { type: "monotone", dataKey: "sent", stroke: "#8b5cf6", name: "Sent" }),
                            React.createElement(recharts_1.Line, { type: "monotone", dataKey: "converted", stroke: "#10b981", name: "Converted" }),
                            React.createElement(recharts_1.Line, { type: "monotone", dataKey: "declined", stroke: "#ef4444", name: "Declined" }))))))),
            React.createElement(tabs_1.TabsContent, { value: "clients" }, clientPerformance && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Top Performing Clients"),
                    React.createElement(card_1.CardDescription, null,
                        "By total quote value (",
                        clientPerformance.topClients.length,
                        " shown)")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "space-y-2" }, clientPerformance.topClients.map(function (client, idx) { return (React.createElement("div", { key: client.clientId, className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg" },
                        React.createElement("div", { className: "flex-1" },
                            React.createElement("p", { className: "font-medium" },
                                "Client ",
                                idx + 1),
                            React.createElement("p", { className: "text-xs text-muted-foreground" },
                                client.totalQuotes,
                                " quotes \u2022 ",
                                format_1.formatPercentage(client.conversionRate),
                                "% conversion")),
                        React.createElement("div", { className: "text-right" },
                            React.createElement("p", { className: "font-bold" }, format_1.formatCurrency(client.totalValue)),
                            React.createElement("p", { className: "text-xs text-muted-foreground" },
                                "Avg: ",
                                format_1.formatCurrency(client.averageValue))))); })))))))));
}
exports["default"] = AdvancedReports;
