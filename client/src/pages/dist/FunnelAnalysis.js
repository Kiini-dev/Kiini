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
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
function FunnelAnalysis() {
    var _a, _b, _c, _d, _e;
    var _f = react_1.useState("sales"), funnelId = _f[0], setFunnelId = _f[1];
    var funnelQuery = trpc_1.trpc.cohortAnalytics.analyzeFunnels.useQuery({ funnelId: funnelId, timeRange: "30d" });
    var data = funnelQuery.data ? JSON.parse(JSON.stringify(funnelQuery.data)) : null;
    var steps = (data === null || data === void 0 ? void 0 : data.steps) || [];
    var maxUsers = steps.length > 0 ? Math.max.apply(Math, __spreadArrays(steps.map(function (s) { return s.users || 0; }), [1])) : 1;
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Funnel Analysis", icon: react_1["default"].createElement(lucide_react_1.Filter, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Analytics" }, { label: "Funnel Analysis" }] },
        react_1["default"].createElement("div", { className: "flex gap-3 items-center" },
            react_1["default"].createElement(select_1.Select, { value: funnelId, onValueChange: setFunnelId },
                react_1["default"].createElement(select_1.SelectTrigger, { className: "w-[200px]" },
                    react_1["default"].createElement(select_1.SelectValue, null)),
                react_1["default"].createElement(select_1.SelectContent, null,
                    react_1["default"].createElement(select_1.SelectItem, { value: "sales" }, "Sales Funnel"),
                    react_1["default"].createElement(select_1.SelectItem, { value: "onboarding" }, "Onboarding Funnel"),
                    react_1["default"].createElement(select_1.SelectItem, { value: "trial" }, "Trial Conversion")))),
        react_1["default"].createElement("div", { className: "grid grid-cols-4 gap-4" },
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Funnel"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold" }, (data === null || data === void 0 ? void 0 : data.funnelName) || funnelId))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Conversion Rate"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold" }, (_a = data === null || data === void 0 ? void 0 : data.overallConversionRate) !== null && _a !== void 0 ? _a : 0,
                        "%"))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Biggest Drop"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold" }, ((_b = data === null || data === void 0 ? void 0 : data.biggestDropoff) === null || _b === void 0 ? void 0 : _b.step) || "—"),
                    react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" }, (_d = (_c = data === null || data === void 0 ? void 0 : data.biggestDropoff) === null || _c === void 0 ? void 0 : _c.percentage) !== null && _d !== void 0 ? _d : 0,
                        "%"))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Avg Step Time"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold" }, (_e = data === null || data === void 0 ? void 0 : data.avgTimePerStep) !== null && _e !== void 0 ? _e : 0,
                        "s")))),
        react_1["default"].createElement(card_1.Card, null,
            react_1["default"].createElement(card_1.CardHeader, null,
                react_1["default"].createElement(card_1.CardTitle, null, "Funnel Steps")),
            react_1["default"].createElement(card_1.CardContent, null, steps.length > 0 ? (react_1["default"].createElement("div", { className: "space-y-3" }, steps.map(function (step, idx) {
                var width = ((step.users || 0) / maxUsers) * 100;
                var convRate = maxUsers > 0 ? (((step.users || 0) / maxUsers) * 100).toFixed(1) : "0";
                return (react_1["default"].createElement("div", { key: idx },
                    react_1["default"].createElement("div", { className: "flex justify-between mb-1" },
                        react_1["default"].createElement("span", { className: "font-medium" }, step.name || "Step " + (idx + 1)),
                        react_1["default"].createElement("span", { className: "text-sm text-muted-foreground" },
                            (step.users || 0).toLocaleString(),
                            " users (",
                            convRate,
                            "%)")),
                    react_1["default"].createElement("div", { className: "w-full bg-muted rounded h-8" },
                        react_1["default"].createElement("div", { className: "h-8 rounded bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-end pr-2", style: { width: Math.max(width, 2) + "%" } }, width > 15 && react_1["default"].createElement("span", { className: "text-white text-xs font-bold" },
                            convRate,
                            "%"))),
                    step.dropoff > 0 && (react_1["default"].createElement("p", { className: "text-sm text-red-600 mt-1" },
                        "\u2193 ",
                        step.dropoff.toLocaleString(),
                        " dropped off"))));
            }))) : (react_1["default"].createElement("p", { className: "text-muted-foreground text-center py-8" }, "No funnel data yet \u2014 configure funnels to see step-by-step analysis"))))));
}
exports["default"] = FunnelAnalysis;
