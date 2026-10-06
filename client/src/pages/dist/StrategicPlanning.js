"use strict";
exports.__esModule = true;
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
function StrategicPlanning() {
    var _a, _b, _c;
    var initiativesQuery = trpc_1.trpc.executiveSuite.trackStrategicInitiatives.useQuery({});
    var dashboardQuery = trpc_1.trpc.executiveSuite.buildExecutiveDashboard.useQuery({});
    var initiativesData = initiativesQuery.data;
    var dashboardData = dashboardQuery.data;
    var initiatives = (_a = initiativesData === null || initiativesData === void 0 ? void 0 : initiativesData.initiatives) !== null && _a !== void 0 ? _a : (Array.isArray(initiativesData) ? initiativesData : []);
    var metrics = (_c = (_b = dashboardData === null || dashboardData === void 0 ? void 0 : dashboardData.metrics) !== null && _b !== void 0 ? _b : dashboardData === null || dashboardData === void 0 ? void 0 : dashboardData.kpis) !== null && _c !== void 0 ? _c : [];
    var isLoading = initiativesQuery.isLoading || dashboardQuery.isLoading;
    var error = initiativesQuery.error || dashboardQuery.error;
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Strategic Planning", icon: React.createElement(lucide_react_1.Target, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Strategy" },
            { label: "Strategic Planning" },
        ] },
        isLoading && (React.createElement("div", { className: "flex justify-center py-8" },
            React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))),
        error && (React.createElement("div", { className: "bg-red-50 text-red-700 p-4 rounded-lg" },
            "Error: ",
            error.message)),
        !isLoading && !error && (React.createElement(React.Fragment, null,
            metrics.length > 0 && (React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" }, metrics.slice(0, 4).map(function (m, idx) {
                var _a, _b, _c;
                return (React.createElement(card_1.Card, { key: idx },
                    React.createElement(card_1.CardContent, { className: "pt-4" },
                        React.createElement("p", { className: "text-sm text-gray-600" }, (_b = (_a = m.name) !== null && _a !== void 0 ? _a : m.label) !== null && _b !== void 0 ? _b : "Metric"),
                        React.createElement("p", { className: "text-2xl font-bold" }, (_c = m.value) !== null && _c !== void 0 ? _c : 0))));
            }))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null,
                        "Strategic Initiatives (",
                        initiatives.length,
                        ")")),
                React.createElement(card_1.CardContent, null, initiatives.length === 0 ? (React.createElement("p", { className: "text-center text-gray-500 py-8" }, "No data found.")) : (React.createElement("div", { className: "space-y-3" }, initiatives.map(function (item, idx) {
                    var _a, _b, _c, _d, _e, _f, _g, _h;
                    return (React.createElement("div", { key: (_a = item.id) !== null && _a !== void 0 ? _a : idx, className: "p-4 border rounded-lg" },
                        React.createElement("div", { className: "flex justify-between mb-2" },
                            React.createElement("p", { className: "font-semibold text-sm" }, (_d = (_c = (_b = item.goal) !== null && _b !== void 0 ? _b : item.name) !== null && _c !== void 0 ? _c : item.title) !== null && _d !== void 0 ? _d : "—"),
                            React.createElement(badge_1.Badge, { variant: item.status === "at-risk" ? "destructive" : "secondary" }, (_e = item.status) !== null && _e !== void 0 ? _e : "—")),
                        React.createElement("p", { className: "text-xs text-gray-600 mb-2" },
                            "Target: ", (_g = (_f = item.quarter) !== null && _f !== void 0 ? _f : item.targetDate) !== null && _g !== void 0 ? _g : "—"),
                        React.createElement("div", { className: "w-full bg-gray-200 h-2 rounded" },
                            React.createElement("div", { className: "bg-pink-600 h-2 rounded", style: { width: ((_h = item.progress) !== null && _h !== void 0 ? _h : 0) + "%" } }))));
                })))))))));
}
exports["default"] = StrategicPlanning;
