"use strict";
exports.__esModule = true;
var card_1 = require("@/components/ui/card");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var format_1 = require("@/utils/format");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var stats_card_1 = require("@/components/ui/stats-card");
var exportCsv_1 = require("@/utils/exportCsv");
function ConversionAnalytics() {
    var conversionData = trpc_1.trpc.advancedReports.getConversionAnalytics.useQuery({}).data;
    var metrics = trpc_1.trpc.advancedReports.getQuoteMetrics.useQuery({}).data;
    if (!conversionData)
        return React.createElement("div", null, "Loading...");
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Conversion Analytics", icon: React.createElement(lucide_react_1.TrendingUp, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Analytics" }, { label: "Conversion Analytics" }] },
        React.createElement("div", null,
            React.createElement("p", { className: "text-muted-foreground mt-2" }, "Quote to invoice conversion performance and trends")),
        React.createElement("div", { className: "grid grid-cols-4 gap-4" },
            React.createElement(stats_card_1.StatsCard, { label: "Overall Rate", value: React.createElement(React.Fragment, null,
                    format_1.formatPercentage(conversionData.overallConversionRate),
                    "%"), description: React.createElement(React.Fragment, null,
                    conversionData.convertedQuotes,
                    " of ",
                    conversionData.totalQuotes), color: "border-l-orange-500" }),
            React.createElement(stats_card_1.StatsCard, { label: "Total Quotes", value: conversionData.totalQuotes, color: "border-l-purple-500" }),
            React.createElement(stats_card_1.StatsCard, { label: "Converted", value: conversionData.convertedQuotes, color: "border-l-green-500" }),
            React.createElement(stats_card_1.StatsCard, { label: "Top Amount", value: format_1.formatCurrency(conversionData.topConvertedAmount), color: "border-l-blue-500" })),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Monthly Conversion Trends"),
                React.createElement(card_1.CardDescription, null, "Sent vs Converted quotes by month")),
            React.createElement(card_1.CardContent, null,
                React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 350 },
                    React.createElement(recharts_1.BarChart, { data: conversionData.monthlyTrends },
                        React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                        React.createElement(recharts_1.XAxis, { dataKey: "month" }),
                        React.createElement(recharts_1.YAxis, null),
                        React.createElement(recharts_1.Tooltip, null),
                        React.createElement(recharts_1.Legend, null),
                        React.createElement(recharts_1.Bar, { dataKey: "sent", fill: "#3b82f6", name: "Sent" }),
                        React.createElement(recharts_1.Bar, { dataKey: "converted", fill: "#10b981", name: "Converted" }))))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Conversion Rate Trend"),
                React.createElement(card_1.CardDescription, null, "Monthly conversion rate percentage")),
            React.createElement(card_1.CardContent, null,
                React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                    React.createElement(recharts_1.LineChart, { data: conversionData.monthlyTrends },
                        React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                        React.createElement(recharts_1.XAxis, { dataKey: "month" }),
                        React.createElement(recharts_1.YAxis, null),
                        React.createElement(recharts_1.Tooltip, { formatter: function (value) { return format_1.formatPercentage(value) + "%"; } }),
                        React.createElement(recharts_1.Line, { type: "monotone", dataKey: "conversionRate", stroke: "#f59e0b", strokeWidth: 2, name: "Conversion Rate %" }))))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Status Breakdown"),
                React.createElement(card_1.CardDescription, null, "Current distribution of quotes by status")),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "space-y-3" }, Object.entries(conversionData.statusBreakdown).map(function (_a) {
                    var status = _a[0], count = _a[1];
                    var percentage = metrics
                        ? (count / metrics.total) * 100
                        : 0;
                    return (React.createElement("div", { key: status, className: "flex items-center justify-between" },
                        React.createElement("span", { className: "capitalize font-medium" }, status),
                        React.createElement("div", { className: "flex-1 mx-4 bg-gray-200 rounded-full h-2" },
                            React.createElement("div", { className: "h-2 rounded-full " + (status === "converted" ? "bg-green-500" :
                                    status === "sent" ? "bg-blue-500" :
                                        status === "accepted" ? "bg-purple-500" :
                                            status === "declined" ? "bg-red-500" :
                                                status === "expired" ? "bg-yellow-500" :
                                                    "bg-gray-500"), style: { width: percentage + "%" } })),
                        React.createElement("span", { className: "text-sm font-medium w-12 text-right" }, count)));
                })))),
        React.createElement(button_1.Button, { className: "gap-2", size: "lg", onClick: function () {
                var rows = (conversionData.monthlyTrends || []).map(function (row) { return ({
                    month: row.month,
                    sent: row.sent,
                    converted: row.converted,
                    conversionRate: row.conversionRate
                }); });
                if (!rows.length) {
                    sonner_1.toast.info("No conversion data available to export");
                    return;
                }
                exportCsv_1.exportToCsv("conversion-analytics-report", rows);
                sonner_1.toast.success("Conversion report exported");
            } },
            React.createElement(lucide_react_1.FileDown, { className: "w-4 h-4" }),
            "Export Conversion Report")));
}
exports["default"] = ConversionAnalytics;
