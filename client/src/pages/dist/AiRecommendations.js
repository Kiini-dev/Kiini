"use strict";
exports.__esModule = true;
var react_1 = require("react");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];
function AiRecommendations() {
    var _a = react_1.useState("month"), period = _a[0], setPeriod = _a[1];
    var dashboardQuery = trpc_1.trpc.aiInsights.getAiInsightsDashboard.useQuery({ period: period });
    var recsQuery = trpc_1.trpc.aiInsights.getSmartRecommendations.useQuery({ category: "general", limit: 10 });
    var modelQuery = trpc_1.trpc.aiInsights.getModelPerformance.useQuery({});
    var dashboard = dashboardQuery.data ? JSON.parse(JSON.stringify(dashboardQuery.data)) : null;
    var recs = recsQuery.data ? JSON.parse(JSON.stringify(recsQuery.data)) : null;
    var modelPerf = modelQuery.data ? JSON.parse(JSON.stringify(modelQuery.data)) : null;
    var insights = (dashboard === null || dashboard === void 0 ? void 0 : dashboard.topInsights) || [];
    var recommendations = (recs === null || recs === void 0 ? void 0 : recs.recommendations) || [];
    var models = (modelPerf === null || modelPerf === void 0 ? void 0 : modelPerf.models) || [];
    var confidenceDistribution = [
        { name: "High (≥80%)", value: insights.filter(function (i) { return i.confidence >= 80; }).length || 0 },
        { name: "Medium (50-79%)", value: insights.filter(function (i) { return i.confidence >= 50 && i.confidence < 80; }).length || 0 },
        { name: "Low (<50%)", value: insights.filter(function (i) { return i.confidence < 50; }).length || 0 },
    ];
    var modelChartData = models.map(function (m) { return ({ name: m.name || m.type, accuracy: m.accuracy }); });
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "AI Recommendations Engine", icon: react_1["default"].createElement(lucide_react_1.Brain, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "AI & Automation" }, { label: "AI Recommendations" }] },
        react_1["default"].createElement("div", { className: "flex justify-between items-center" },
            react_1["default"].createElement(select_1.Select, { value: period, onValueChange: function (v) { return setPeriod(v); } },
                react_1["default"].createElement(select_1.SelectTrigger, { className: "w-[180px]" },
                    react_1["default"].createElement(select_1.SelectValue, null)),
                react_1["default"].createElement(select_1.SelectContent, null,
                    react_1["default"].createElement(select_1.SelectItem, { value: "today" }, "Today"),
                    react_1["default"].createElement(select_1.SelectItem, { value: "week" }, "This Week"),
                    react_1["default"].createElement(select_1.SelectItem, { value: "month" }, "This Month"),
                    react_1["default"].createElement(select_1.SelectItem, { value: "quarter" }, "This Quarter"),
                    react_1["default"].createElement(select_1.SelectItem, { value: "year" }, "This Year")))),
        react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" },
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Total Insights"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold" }, insights.length))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Recommendations"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold" }, recommendations.length))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Active Models"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold" }, models.length))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Model Health"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold capitalize" }, (modelPerf === null || modelPerf === void 0 ? void 0 : modelPerf.overallHealth) || "—")))),
        react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-6" },
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.Brain, { size: 20 }),
                        " Model Performance")),
                react_1["default"].createElement(card_1.CardContent, null, modelChartData.length > 0 ? (react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                    react_1["default"].createElement(recharts_1.BarChart, { data: modelChartData },
                        react_1["default"].createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                        react_1["default"].createElement(recharts_1.XAxis, { dataKey: "name" }),
                        react_1["default"].createElement(recharts_1.YAxis, { domain: [0, 100] }),
                        react_1["default"].createElement(recharts_1.Tooltip, null),
                        react_1["default"].createElement(recharts_1.Bar, { dataKey: "accuracy", fill: "#3b82f6", name: "Accuracy %" })))) : (react_1["default"].createElement("p", { className: "text-muted-foreground text-center py-12" }, "No model performance data yet")))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.TrendingUp, { size: 20 }),
                        " Insight Confidence Distribution")),
                react_1["default"].createElement(card_1.CardContent, null, insights.length > 0 ? (react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                    react_1["default"].createElement(recharts_1.PieChart, null,
                        react_1["default"].createElement(recharts_1.Pie, { data: confidenceDistribution, cx: "50%", cy: "50%", outerRadius: 80, label: true, dataKey: "value" }, confidenceDistribution.map(function (_, i) { return (react_1["default"].createElement(recharts_1.Cell, { key: i, fill: COLORS[i % COLORS.length] })); })),
                        react_1["default"].createElement(recharts_1.Tooltip, null)))) : (react_1["default"].createElement("p", { className: "text-muted-foreground text-center py-12" }, "No insights data yet"))))),
        react_1["default"].createElement(card_1.Card, null,
            react_1["default"].createElement(card_1.CardHeader, null,
                react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                    react_1["default"].createElement(lucide_react_1.Filter, { size: 20 }),
                    " Smart Recommendations")),
            react_1["default"].createElement(card_1.CardContent, null, recommendations.length > 0 ? (react_1["default"].createElement("div", { className: "space-y-3" }, recommendations.map(function (rec) { return (react_1["default"].createElement("div", { key: rec.id, className: "flex items-center gap-4 p-3 bg-muted/50 rounded-lg hover:bg-muted" },
                react_1["default"].createElement(lucide_react_1.Lightbulb, { className: "h-5 w-5 text-yellow-500 shrink-0" }),
                react_1["default"].createElement("div", { className: "flex-1" },
                    react_1["default"].createElement("p", { className: "font-medium" }, rec.title),
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, rec.description)),
                react_1["default"].createElement("div", { className: "text-right" },
                    react_1["default"].createElement(badge_1.Badge, { variant: rec.priority === "high" ? "destructive" : rec.priority === "medium" ? "default" : "secondary" }, rec.priority),
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground mt-1" },
                        rec.successProbability,
                        "% confidence")))); }))) : (react_1["default"].createElement("p", { className: "text-muted-foreground text-center py-8" }, "No recommendations available \u2014 add AI insight data to see suggestions"))))));
}
exports["default"] = AiRecommendations;
