"use strict";
exports.__esModule = true;
var react_1 = require("react");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
function ChurnPrediction() {
    var _a, _b, _c, _d, _e;
    var today = new Date();
    var startDate = new Date(today.getFullYear(), today.getMonth() - 6, 1).toISOString().split("T")[0];
    var endDate = today.toISOString().split("T")[0];
    var retentionQuery = trpc_1.trpc.cohortAnalytics.runCohortRetention.useQuery({ startDate: startDate, endDate: endDate });
    var cohortQuery = trpc_1.trpc.cohortAnalytics.getCohortAnalysis.useQuery({ cohortType: "SIGNUP_DATE", period: "MONTHLY" });
    var retention = retentionQuery.data ? JSON.parse(JSON.stringify(retentionQuery.data)) : null;
    var cohort = cohortQuery.data ? JSON.parse(JSON.stringify(cohortQuery.data)) : null;
    var insights = (retention === null || retention === void 0 ? void 0 : retention.retentionInsights) || {};
    var cohorts = (cohort === null || cohort === void 0 ? void 0 : cohort.cohorts) || [];
    // Build churn risk chart from cohort churn rates
    var churnChartData = cohorts.slice(0, 10).map(function (c) { return ({
        cohort: c.cohort,
        churnRate: c.churnRate || 0
    }); });
    // Categorize cohorts by churn risk
    var highRisk = cohorts.filter(function (c) { return (c.churnRate || 0) > 30; });
    var medRisk = cohorts.filter(function (c) { return (c.churnRate || 0) > 15 && (c.churnRate || 0) <= 30; });
    var lowRisk = cohorts.filter(function (c) { return (c.churnRate || 0) <= 15; });
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Churn Prediction", icon: react_1["default"].createElement(lucide_react_1.TrendingDown, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Analytics" }, { label: "Churn Prediction" }] },
        react_1["default"].createElement("div", { className: "grid grid-cols-4 gap-4" },
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "High Risk Cohorts"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold text-red-600" }, highRisk.length))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Medium Risk"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold text-orange-600" }, medRisk.length))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Low Risk"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold text-green-600" }, lowRisk.length))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Cumulative Churn"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold text-purple-600" }, (_a = retention === null || retention === void 0 ? void 0 : retention.cumulativeChurn) !== null && _a !== void 0 ? _a : 0,
                        "%")))),
        react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-6" },
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.TrendingDown, { size: 20 }),
                        " Retention Insights")),
                react_1["default"].createElement(card_1.CardContent, { className: "space-y-3" },
                    react_1["default"].createElement("div", { className: "flex justify-between" },
                        react_1["default"].createElement("span", { className: "text-muted-foreground" }, "Day 1 Retention"),
                        react_1["default"].createElement("span", { className: "font-semibold" }, (_b = insights.d1Retention) !== null && _b !== void 0 ? _b : 0,
                            "%")),
                    react_1["default"].createElement("div", { className: "flex justify-between" },
                        react_1["default"].createElement("span", { className: "text-muted-foreground" }, "Day 7 Retention"),
                        react_1["default"].createElement("span", { className: "font-semibold" }, (_c = insights.d7Retention) !== null && _c !== void 0 ? _c : 0,
                            "%")),
                    react_1["default"].createElement("div", { className: "flex justify-between" },
                        react_1["default"].createElement("span", { className: "text-muted-foreground" }, "Day 30 Retention"),
                        react_1["default"].createElement("span", { className: "font-semibold" }, (_d = insights.d30Retention) !== null && _d !== void 0 ? _d : 0,
                            "%")),
                    react_1["default"].createElement("div", { className: "flex justify-between" },
                        react_1["default"].createElement("span", { className: "text-muted-foreground" }, "Day 90 Retention"),
                        react_1["default"].createElement("span", { className: "font-semibold" }, (_e = insights.d90Retention) !== null && _e !== void 0 ? _e : 0,
                            "%")),
                    react_1["default"].createElement("div", { className: "flex justify-between" },
                        react_1["default"].createElement("span", { className: "text-muted-foreground" }, "Retention Trend"),
                        react_1["default"].createElement(badge_1.Badge, { variant: (retention === null || retention === void 0 ? void 0 : retention.retentionTrend) === "IMPROVING" ? "default" : (retention === null || retention === void 0 ? void 0 : retention.retentionTrend) === "DECLINING" ? "destructive" : "secondary" }, (retention === null || retention === void 0 ? void 0 : retention.retentionTrend) || "STABLE")))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, null, "Churn Rate by Cohort")),
                react_1["default"].createElement(card_1.CardContent, null, churnChartData.length > 0 ? (react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                    react_1["default"].createElement(recharts_1.BarChart, { data: churnChartData },
                        react_1["default"].createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                        react_1["default"].createElement(recharts_1.XAxis, { dataKey: "cohort", angle: -45, textAnchor: "end", height: 80 }),
                        react_1["default"].createElement(recharts_1.YAxis, null),
                        react_1["default"].createElement(recharts_1.Tooltip, null),
                        react_1["default"].createElement(recharts_1.Bar, { dataKey: "churnRate", fill: "#ef4444", name: "Churn %" })))) : (react_1["default"].createElement("p", { className: "text-muted-foreground text-center py-8" }, "No cohort churn data yet"))))),
        react_1["default"].createElement(card_1.Card, null,
            react_1["default"].createElement(card_1.CardHeader, null,
                react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                    react_1["default"].createElement(lucide_react_1.Users, { size: 20 }),
                    " High-Risk Cohorts")),
            react_1["default"].createElement(card_1.CardContent, null, highRisk.length > 0 ? (react_1["default"].createElement("div", { className: "space-y-2" }, highRisk.map(function (coh, idx) { return (react_1["default"].createElement("div", { key: idx, className: "flex items-center justify-between p-3 border rounded-lg" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("p", { className: "font-medium" }, coh.cohort),
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" },
                        coh.users,
                        " users | LTV: $",
                        (coh.avgLifetimeValue || 0).toLocaleString())),
                react_1["default"].createElement("div", { className: "text-right" },
                    react_1["default"].createElement("p", { className: "text-lg font-bold text-red-600" },
                        coh.churnRate,
                        "%"),
                    react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" },
                        "Avg Retention: ",
                        coh.avgRetentionDays,
                        "d")))); }))) : (react_1["default"].createElement("p", { className: "text-muted-foreground text-center py-8" }, "No high-risk cohorts detected \u2014 churn data will populate once cohort analyses are available"))))));
}
exports["default"] = ChurnPrediction;
