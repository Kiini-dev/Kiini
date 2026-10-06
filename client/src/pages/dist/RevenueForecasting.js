"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var card_1 = require("@/components/ui/card");
var sonner_1 = require("sonner");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var trpc_1 = require("@/lib/trpc");
var format_1 = require("@/utils/format");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var stats_card_1 = require("@/components/ui/stats-card");
var exportCsv_1 = require("@/utils/exportCsv");
function RevenueForecasting() {
    var _a;
    var forecast = trpc_1.trpc.advancedReports.getRevenueForecasting.useQuery({
        months: 12
    }).data;
    if (!forecast)
        return React.createElement("div", null, "Loading...");
    var combinedData = __spreadArrays((forecast.historicalData || []), (forecast.forecastData || []));
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Revenue Forecasting", icon: React.createElement(lucide_react_1.TrendingUp, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Finance" }, { label: "Revenue Forecasting" }] },
        React.createElement("div", null,
            React.createElement("p", { className: "text-muted-foreground mt-2" }, "Historical revenue analysis and 12-month forecast")),
        React.createElement("div", { className: "grid grid-cols-3 gap-4" },
            React.createElement(stats_card_1.StatsCard, { label: "Avg Monthly Revenue", value: format_1.formatCurrency(forecast.averageMonthlyRevenue), description: "Based on historical data", color: "border-l-purple-500" }),
            React.createElement(stats_card_1.StatsCard, { label: "Historical Revenue", value: format_1.formatCurrency(forecast.totalHistoricalRevenue), color: "border-l-green-500" }),
            React.createElement(stats_card_1.StatsCard, { label: "Projected Revenue", value: format_1.formatCurrency(forecast.projectedRevenue), description: "Next 12 months", color: "border-l-blue-500" })),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "12-Month Revenue Forecast"),
                React.createElement(card_1.CardDescription, null, "Blue line shows actual revenue, orange dashed line shows forecast")),
            React.createElement(card_1.CardContent, null,
                React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 400 },
                    React.createElement(recharts_1.AreaChart, { data: combinedData },
                        React.createElement("defs", null,
                            React.createElement("linearGradient", { id: "colorActual", x1: "0", y1: "0", x2: "0", y2: "1" },
                                React.createElement("stop", { offset: "5%", stopColor: "#3b82f6", stopOpacity: 0.3 }),
                                React.createElement("stop", { offset: "95%", stopColor: "#3b82f6", stopOpacity: 0 })),
                            React.createElement("linearGradient", { id: "colorForecast", x1: "0", y1: "0", x2: "0", y2: "1" },
                                React.createElement("stop", { offset: "5%", stopColor: "#f59e0b", stopOpacity: 0.3 }),
                                React.createElement("stop", { offset: "95%", stopColor: "#f59e0b", stopOpacity: 0 }))),
                        React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                        React.createElement(recharts_1.XAxis, { dataKey: "month" }),
                        React.createElement(recharts_1.YAxis, null),
                        React.createElement(recharts_1.Tooltip, { formatter: function (value) { return value ? format_1.formatCurrency(value) : "-"; } }),
                        React.createElement(recharts_1.Legend, null),
                        React.createElement(recharts_1.Area, { type: "monotone", dataKey: "actual", stroke: "#3b82f6", strokeWidth: 2, fillOpacity: 1, fill: "url(#colorActual)", name: "Actual Revenue", connectNulls: true }),
                        React.createElement(recharts_1.Area, { type: "monotone", dataKey: "forecast", stroke: "#f59e0b", strokeWidth: 2, strokeDasharray: "5 5", fillOpacity: 1, fill: "url(#colorForecast)", name: "Forecasted Revenue", connectNulls: true }))))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Forecast Details"),
                React.createElement(card_1.CardDescription, null, "Month-by-month breakdown of projections")),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "space-y-2 max-h-96 overflow-y-auto" }, (_a = forecast.forecastData) === null || _a === void 0 ? void 0 : _a.map(function (month) { return (React.createElement("div", { key: month.month, className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg" },
                    React.createElement("span", { className: "font-medium" }, month.month),
                    React.createElement("span", { className: "font-bold text-orange-600" }, format_1.formatCurrency(month.forecast || 0)))); })))),
        React.createElement(card_1.Card, { className: "border-blue-200 bg-blue-50" },
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                    React.createElement(lucide_react_1.AlertCircle, { className: "w-5 h-5" }),
                    "Forecast Insights")),
            React.createElement(card_1.CardContent, { className: "text-sm space-y-2" },
                React.createElement("p", null,
                    "Based on historical trends, the forecasted revenue for the next 12 months is",
                    " ",
                    React.createElement("strong", null, format_1.formatCurrency(forecast.projectedRevenue)),
                    "."),
                React.createElement("p", null,
                    "The average monthly revenue is",
                    " ",
                    React.createElement("strong", null, format_1.formatCurrency(forecast.averageMonthlyRevenue)),
                    ", with seasonal variations accounted for in the forecast."),
                React.createElement("p", null, "This projection assumes continuation of current conversion rates and quote volumes."))),
        React.createElement(button_1.Button, { className: "gap-2", size: "lg", onClick: function () {
                var rows = combinedData.map(function (row) { return ({
                    month: row.month,
                    actual: row.actual,
                    forecast: row.forecast
                }); });
                if (!rows.length) {
                    sonner_1.toast.info("No forecast data available to export");
                    return;
                }
                exportCsv_1.exportToCsv("revenue-forecast-report", rows);
                sonner_1.toast.success("Forecast report downloaded");
            } },
            React.createElement(lucide_react_1.TrendingUp, { className: "w-4 h-4" }),
            "Download Forecast Report")));
}
exports["default"] = RevenueForecasting;
