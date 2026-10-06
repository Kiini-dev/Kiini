"use strict";
exports.__esModule = true;
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var card_1 = require("@/components/ui/card");
function ReportBuilderPro() {
    var _a, _b, _c, _d, _e;
    var trendQuery = trpc_1.trpc.analyticsEngine.getTrendAnalysis.useQuery({
        metric: "revenue",
        period: "monthly"
    });
    var kpiQuery = trpc_1.trpc.analyticsEngine.getPerformanceMetrics.useQuery({});
    var trendData = trendQuery.data;
    var kpiData = kpiQuery.data;
    var isLoading = trendQuery.isLoading || kpiQuery.isLoading;
    var error = trendQuery.error || kpiQuery.error;
    var trends = (_a = trendData === null || trendData === void 0 ? void 0 : trendData.trends) !== null && _a !== void 0 ? _a : [];
    var kpis = (_b = kpiData === null || kpiData === void 0 ? void 0 : kpiData.kpis) !== null && _b !== void 0 ? _b : [];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Report Builder", icon: React.createElement(lucide_react_1.BarChart3, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Reports" },
            { label: "Report Builder" },
        ] },
        isLoading && (React.createElement("div", { className: "flex justify-center py-8" },
            React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))),
        error && (React.createElement("div", { className: "bg-red-50 text-red-700 p-4 rounded-lg" },
            "Error: ",
            error.message)),
        !isLoading && !error && (React.createElement(React.Fragment, null,
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardContent, { className: "pt-4" },
                        React.createElement("p", { className: "text-sm text-gray-600" }, "Average"),
                        React.createElement("p", { className: "text-2xl font-bold" }, (_c = trendData === null || trendData === void 0 ? void 0 : trendData.average) !== null && _c !== void 0 ? _c : 0))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardContent, { className: "pt-4" },
                        React.createElement("p", { className: "text-sm text-gray-600" }, "Growth"),
                        React.createElement("p", { className: "text-2xl font-bold" }, (_d = trendData === null || trendData === void 0 ? void 0 : trendData.growth) !== null && _d !== void 0 ? _d : 0,
                            "%"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardContent, { className: "pt-4" },
                        React.createElement("p", { className: "text-sm text-gray-600" }, "Volatility"),
                        React.createElement("p", { className: "text-2xl font-bold" }, (_e = trendData === null || trendData === void 0 ? void 0 : trendData.volatility) !== null && _e !== void 0 ? _e : "—")))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null,
                        "Trend Analysis (",
                        trends.length,
                        " data points)")),
                React.createElement(card_1.CardContent, null, trends.length === 0 ? (React.createElement("p", { className: "text-center text-gray-500 py-8" }, "No data found.")) : (React.createElement("div", { className: "space-y-2" }, trends.map(function (t, idx) {
                    var _a, _b;
                    return (React.createElement("div", { key: idx, className: "flex justify-between p-2 border-b text-sm" },
                        React.createElement("span", null, (_a = t.date) !== null && _a !== void 0 ? _a : "—"),
                        React.createElement("span", { className: "font-medium" }, (_b = t.value) !== null && _b !== void 0 ? _b : 0),
                        React.createElement("span", { className: t.trend === "up" ? "text-green-600" : "text-red-600" }, t.trend === "up" ? "↑" : "↓")));
                }))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null,
                        "KPI Metrics (",
                        kpis.length,
                        ")")),
                React.createElement(card_1.CardContent, null, kpis.length === 0 ? (React.createElement("p", { className: "text-center text-gray-500 py-8" }, "No data found.")) : (React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3" }, kpis.map(function (kpi, idx) {
                    var _a, _b, _c, _d;
                    return (React.createElement("div", { key: idx, className: "p-3 border rounded-lg" },
                        React.createElement("p", { className: "text-sm text-gray-600" }, (_a = kpi.name) !== null && _a !== void 0 ? _a : "—"),
                        React.createElement("p", { className: "text-xl font-bold" }, (_b = kpi.value) !== null && _b !== void 0 ? _b : 0,
                            " ", (_c = kpi.unit) !== null && _c !== void 0 ? _c : ""),
                        React.createElement("p", { className: "text-xs text-gray-500" }, (_d = kpi.change) !== null && _d !== void 0 ? _d : "—")));
                })))))))));
}
exports["default"] = ReportBuilderPro;
