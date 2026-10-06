"use strict";
exports.__esModule = true;
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
function AdvancedAnalytics() {
    var _a, _b, _c, _d, _e, _f;
    var _g = react_1.useState("WEEKLY"), period = _g[0], setPeriod = _g[1];
    var trendsQuery = trpc_1.trpc.analyticsEngine.getTrendAnalysis.useQuery({ period: period });
    var metricsQuery = trpc_1.trpc.analyticsEngine.getPerformanceMetrics.useQuery({});
    var anomalyQuery = trpc_1.trpc.analyticsEngine.getAnomalyInsights.useQuery({});
    var trends = trendsQuery.data ? JSON.parse(JSON.stringify(trendsQuery.data)) : null;
    var metrics = metricsQuery.data ? JSON.parse(JSON.stringify(metricsQuery.data)) : null;
    var anomalies = anomalyQuery.data ? JSON.parse(JSON.stringify(anomalyQuery.data)) : null;
    var trendPoints = (trends === null || trends === void 0 ? void 0 : trends.trends) || [];
    var anomalyList = (anomalies === null || anomalies === void 0 ? void 0 : anomalies.anomalies) || [];
    var highSeverity = anomalyList.filter(function (a) { return a.severity === "HIGH" || a.severity === "CRITICAL"; }).length;
    var medSeverity = anomalyList.filter(function (a) { return a.severity === "MEDIUM"; }).length;
    var lowSeverity = anomalyList.filter(function (a) { return a.severity === "LOW"; }).length;
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Advanced Analytics", icon: react_1["default"].createElement(lucide_react_1.BarChart3, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Analytics" }, { label: "Advanced Analytics" }] },
        react_1["default"].createElement("div", { className: "flex justify-end" },
            react_1["default"].createElement(select_1.Select, { value: period, onValueChange: setPeriod },
                react_1["default"].createElement(select_1.SelectTrigger, { className: "w-40" },
                    react_1["default"].createElement(select_1.SelectValue, null)),
                react_1["default"].createElement(select_1.SelectContent, null,
                    react_1["default"].createElement(select_1.SelectItem, { value: "DAILY" }, "Daily"),
                    react_1["default"].createElement(select_1.SelectItem, { value: "WEEKLY" }, "Weekly"),
                    react_1["default"].createElement(select_1.SelectItem, { value: "MONTHLY" }, "Monthly")))),
        react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" },
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "KPI Score"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold" }, (_a = metrics === null || metrics === void 0 ? void 0 : metrics.kpiScore) !== null && _a !== void 0 ? _a : 0,
                        "%"))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Benchmark Delta"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold text-blue-600" }, (_b = metrics === null || metrics === void 0 ? void 0 : metrics.benchmarkDelta) !== null && _b !== void 0 ? _b : 0,
                        "%"))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Forecast Accuracy"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold text-green-600" }, (_c = metrics === null || metrics === void 0 ? void 0 : metrics.forecastAccuracy) !== null && _c !== void 0 ? _c : 0))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Anomalies Detected"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold text-red-600" }, anomalyList.length)))),
        react_1["default"].createElement(card_1.Card, null,
            react_1["default"].createElement(card_1.CardHeader, null,
                react_1["default"].createElement(card_1.CardTitle, null, "Trend Analysis & Forecast")),
            react_1["default"].createElement(card_1.CardContent, null, trendPoints.length > 0 ? (react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                react_1["default"].createElement(recharts_1.LineChart, { data: trendPoints },
                    react_1["default"].createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                    react_1["default"].createElement(recharts_1.XAxis, { dataKey: "date" }),
                    react_1["default"].createElement(recharts_1.YAxis, null),
                    react_1["default"].createElement(recharts_1.Tooltip, null),
                    react_1["default"].createElement(recharts_1.Legend, null),
                    react_1["default"].createElement(recharts_1.Line, { type: "monotone", dataKey: "value", stroke: "#3b82f6", name: "Actual" }),
                    react_1["default"].createElement(recharts_1.Line, { type: "monotone", dataKey: "forecast", stroke: "#10b981", strokeDasharray: "5 5", name: "Forecast" })))) : (react_1["default"].createElement("p", { className: "text-muted-foreground text-center py-8" }, "No trend data yet")))),
        react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, null, "Anomaly Detection")),
                react_1["default"].createElement(card_1.CardContent, { className: "space-y-2" },
                    react_1["default"].createElement("div", { className: "flex justify-between text-sm" },
                        react_1["default"].createElement("span", null, "High severity:"),
                        react_1["default"].createElement("span", { className: "font-bold text-red-600" }, highSeverity)),
                    react_1["default"].createElement("div", { className: "flex justify-between text-sm" },
                        react_1["default"].createElement("span", null, "Medium severity:"),
                        react_1["default"].createElement("span", { className: "font-bold text-yellow-600" }, medSeverity)),
                    react_1["default"].createElement("div", { className: "flex justify-between text-sm" },
                        react_1["default"].createElement("span", null, "Low severity:"),
                        react_1["default"].createElement("span", { className: "font-bold text-blue-600" }, lowSeverity)))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, null, "Performance Metrics")),
                react_1["default"].createElement(card_1.CardContent, { className: "space-y-2" },
                    react_1["default"].createElement("div", { className: "flex justify-between text-sm" },
                        react_1["default"].createElement("span", null, "Response Time:"),
                        react_1["default"].createElement("span", { className: "font-bold" }, (_d = metrics === null || metrics === void 0 ? void 0 : metrics.avgResponseTime) !== null && _d !== void 0 ? _d : 0,
                            "ms")),
                    react_1["default"].createElement("div", { className: "flex justify-between text-sm" },
                        react_1["default"].createElement("span", null, "Throughput:"),
                        react_1["default"].createElement("span", { className: "font-bold" }, (_e = metrics === null || metrics === void 0 ? void 0 : metrics.throughput) !== null && _e !== void 0 ? _e : 0,
                            "/s")),
                    react_1["default"].createElement("div", { className: "flex justify-between text-sm" },
                        react_1["default"].createElement("span", null, "Error Rate:"),
                        react_1["default"].createElement("span", { className: "font-bold text-red-600" }, (_f = metrics === null || metrics === void 0 ? void 0 : metrics.errorRate) !== null && _f !== void 0 ? _f : 0,
                            "%")))))));
}
exports["default"] = AdvancedAnalytics;
