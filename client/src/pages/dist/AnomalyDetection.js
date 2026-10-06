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
function AnomalyDetection() {
    var _a = react_1.useState("revenue"), entityType = _a[0], setEntityType = _a[1];
    var _b = react_1.useState("medium"), sensitivity = _b[0], setSensitivity = _b[1];
    var anomalyQuery = trpc_1.trpc.aiInsights.detectAnomalies.useQuery({ entityType: entityType, sensitivity: sensitivity, lookbackDays: 30 });
    var data = anomalyQuery.data ? JSON.parse(JSON.stringify(anomalyQuery.data)) : null;
    var anomalies = (data === null || data === void 0 ? void 0 : data.anomalies) || [];
    var stats = (data === null || data === void 0 ? void 0 : data.summaryStats) || { totalAnomalies: 0, criticalCount: 0, highCount: 0, mediumCount: 0, lowCount: 0 };
    var severityData = [
        { severity: "Critical", count: stats.criticalCount },
        { severity: "High", count: stats.highCount },
        { severity: "Medium", count: stats.mediumCount },
        { severity: "Low", count: stats.lowCount },
    ];
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Anomaly Detection", icon: react_1["default"].createElement(lucide_react_1.AlertTriangle, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Analytics" }, { label: "Anomaly Detection" }] },
        react_1["default"].createElement("div", { className: "flex gap-3 items-center" },
            react_1["default"].createElement(select_1.Select, { value: entityType, onValueChange: setEntityType },
                react_1["default"].createElement(select_1.SelectTrigger, { className: "w-[180px]" },
                    react_1["default"].createElement(select_1.SelectValue, null)),
                react_1["default"].createElement(select_1.SelectContent, null,
                    react_1["default"].createElement(select_1.SelectItem, { value: "revenue" }, "Revenue"),
                    react_1["default"].createElement(select_1.SelectItem, { value: "expenses" }, "Expenses"),
                    react_1["default"].createElement(select_1.SelectItem, { value: "invoices" }, "Invoices"),
                    react_1["default"].createElement(select_1.SelectItem, { value: "clients" }, "Clients"))),
            react_1["default"].createElement(select_1.Select, { value: sensitivity, onValueChange: function (v) { return setSensitivity(v); } },
                react_1["default"].createElement(select_1.SelectTrigger, { className: "w-[150px]" },
                    react_1["default"].createElement(select_1.SelectValue, null)),
                react_1["default"].createElement(select_1.SelectContent, null,
                    react_1["default"].createElement(select_1.SelectItem, { value: "low" }, "Low"),
                    react_1["default"].createElement(select_1.SelectItem, { value: "medium" }, "Medium"),
                    react_1["default"].createElement(select_1.SelectItem, { value: "high" }, "High"))),
            anomalies.length > 0 && (react_1["default"].createElement(badge_1.Badge, { variant: "destructive" },
                anomalies.length,
                " Anomalies Detected"))),
        react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" },
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Total Anomalies"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold" }, stats.totalAnomalies))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Critical"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold text-red-600" }, stats.criticalCount))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "High"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold text-orange-600" }, stats.highCount))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Sensitivity"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold capitalize" }, sensitivity)))),
        react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-6" },
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.Zap, { size: 20 }),
                        " Active Anomalies")),
                react_1["default"].createElement(card_1.CardContent, null, anomalies.length > 0 ? (react_1["default"].createElement("div", { className: "space-y-3" }, anomalies.map(function (anom) { return (react_1["default"].createElement("div", { key: anom.id, className: "p-3 border rounded-lg" },
                    react_1["default"].createElement("div", { className: "flex justify-between items-start" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("p", { className: "font-medium" }, anom.type),
                            react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, anom.description),
                            anom.recommendation && react_1["default"].createElement("p", { className: "text-sm text-blue-600 mt-1" }, anom.recommendation)),
                        react_1["default"].createElement(badge_1.Badge, { variant: anom.severity === "critical" || anom.severity === "high" ? "destructive" : "secondary" }, anom.severity)),
                    react_1["default"].createElement("p", { className: "text-xs text-muted-foreground mt-1" },
                        "Confidence: ",
                        anom.confidence,
                        "%"))); }))) : (react_1["default"].createElement("p", { className: "text-muted-foreground text-center py-8" }, "No anomalies detected for this period")))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.TrendingUp, { size: 20 }),
                        " Severity Distribution")),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                        react_1["default"].createElement(recharts_1.BarChart, { data: severityData },
                            react_1["default"].createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                            react_1["default"].createElement(recharts_1.XAxis, { dataKey: "severity" }),
                            react_1["default"].createElement(recharts_1.YAxis, null),
                            react_1["default"].createElement(recharts_1.Tooltip, null),
                            react_1["default"].createElement(recharts_1.Bar, { dataKey: "count", fill: "#ef4444" }))))))));
}
exports["default"] = AnomalyDetection;
