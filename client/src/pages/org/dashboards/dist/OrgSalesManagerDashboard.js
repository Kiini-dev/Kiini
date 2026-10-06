"use strict";
exports.__esModule = true;
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var currency_1 = require("@/lib/currency");
var SalesManagerDashboard = function () {
    var _a, _b, _c, _d, _e;
    var pipelineQuery = trpc_1.trpc.salesPipeline.getPipelineBoard.useQuery();
    var winLossQuery = trpc_1.trpc.salesPipeline.getWinLossStats.useQuery();
    if (pipelineQuery.isLoading || winLossQuery.isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Sales Manager Dashboard", icon: React.createElement(lucide_react_1.TrendingUp, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/" }, { label: "Sales" }] },
            React.createElement("div", { className: "flex justify-center py-12" },
                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))));
    }
    if (pipelineQuery.error) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Sales Manager Dashboard", icon: React.createElement(lucide_react_1.TrendingUp, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/" }, { label: "Sales" }] },
            React.createElement("div", { className: "bg-red-50 text-red-700 p-4 rounded-lg" },
                "Error: ",
                pipelineQuery.error.message)));
    }
    var pipeline = pipelineQuery.data;
    var winLoss = winLossQuery.data;
    var stages = ((_a = pipeline === null || pipeline === void 0 ? void 0 : pipeline.stages) !== null && _a !== void 0 ? _a : []);
    var format = currency_1.useCurrency().format;
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Sales Manager Dashboard", icon: React.createElement(lucide_react_1.TrendingUp, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/" }, { label: "Sales" }] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Total Opportunities")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" }, (_b = winLoss === null || winLoss === void 0 ? void 0 : winLoss.totalOpportunities) !== null && _b !== void 0 ? _b : 0))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Won")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold text-green-600" }, (_c = winLoss === null || winLoss === void 0 ? void 0 : winLoss.won) !== null && _c !== void 0 ? _c : 0))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Lost")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold text-red-600" }, (_d = winLoss === null || winLoss === void 0 ? void 0 : winLoss.lost) !== null && _d !== void 0 ? _d : 0))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Win Rate")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" }, (_e = winLoss === null || winLoss === void 0 ? void 0 : winLoss.winRate) !== null && _e !== void 0 ? _e : 0,
                            "%")))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-lg" }, "Sales Pipeline")),
                React.createElement(card_1.CardContent, null, stages.length === 0 ? (React.createElement("p", { className: "text-center text-gray-500 py-8" }, "No data found.")) : (React.createElement("div", { className: "space-y-4" }, stages.map(function (stage, i) {
                    var _a, _b, _c, _d, _e;
                    return (React.createElement("div", { key: (_a = stage.name) !== null && _a !== void 0 ? _a : i, className: "flex items-center justify-between p-3 bg-slate-50 rounded" },
                        React.createElement("div", { className: "flex-1" },
                            React.createElement("p", { className: "font-medium text-sm" }, (_c = (_b = stage.label) !== null && _b !== void 0 ? _b : stage.name) !== null && _c !== void 0 ? _c : "—"),
                            React.createElement("p", { className: "text-xs text-gray-600" },
                                ((_d = stage.opportunities) !== null && _d !== void 0 ? _d : []).length,
                                " opportunities")),
                        React.createElement("div", { className: "text-right" },
                            React.createElement(badge_1.Badge, { variant: "secondary" }, format(((_e = stage.opportunities) !== null && _e !== void 0 ? _e : []).reduce(function (sum, o) { var _a; return sum + ((_a = o.value) !== null && _a !== void 0 ? _a : 0); }, 0))))));
                }))))))));
};
exports["default"] = SalesManagerDashboard;
