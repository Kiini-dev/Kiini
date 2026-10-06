"use strict";
exports.__esModule = true;
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var currency_1 = require("@/lib/currency");
var ProcurementManagerDashboard = function () {
    var _a, _b, _c, _d, _e;
    var statsQuery = trpc_1.trpc.procurement.getStats.useQuery();
    var lpoQuery = trpc_1.trpc.lpo.list.useQuery();
    if (statsQuery.isLoading || lpoQuery.isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Procurement Manager Dashboard", icon: React.createElement(lucide_react_1.ShoppingCart, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/" }, { label: "Procurement" }] },
            React.createElement("div", { className: "flex justify-center py-12" },
                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))));
    }
    if (statsQuery.error) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Procurement Manager Dashboard", icon: React.createElement(lucide_react_1.ShoppingCart, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/" }, { label: "Procurement" }] },
            React.createElement("div", { className: "bg-red-50 text-red-700 p-4 rounded-lg" },
                "Error: ",
                statsQuery.error.message)));
    }
    var stats = statsQuery.data;
    var lpos = ((_a = lpoQuery.data) !== null && _a !== void 0 ? _a : []);
    var format = currency_1.useCurrency().format;
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Procurement Manager Dashboard", icon: React.createElement(lucide_react_1.ShoppingCart, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/" }, { label: "Procurement" }] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Total Requests")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" }, (_b = stats === null || stats === void 0 ? void 0 : stats.totalRequests) !== null && _b !== void 0 ? _b : 0))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Pending")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" }, (_c = stats === null || stats === void 0 ? void 0 : stats.pendingCount) !== null && _c !== void 0 ? _c : 0))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Approved")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" }, (_d = stats === null || stats === void 0 ? void 0 : stats.approvedCount) !== null && _d !== void 0 ? _d : 0))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Total Spend")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" }, format((_e = stats === null || stats === void 0 ? void 0 : stats.totalSpend) !== null && _e !== void 0 ? _e : 0))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-lg" }, "Recent LPOs")),
                React.createElement(card_1.CardContent, null, lpos.length === 0 ? (React.createElement("p", { className: "text-center text-gray-500 py-8" }, "No data found.")) : (React.createElement("div", { className: "space-y-4" }, lpos.slice(0, 5).map(function (lpo, i) {
                    var _a, _b, _c, _d, _e;
                    return (React.createElement("div", { key: (_a = lpo.id) !== null && _a !== void 0 ? _a : i, className: "flex items-center justify-between p-3 bg-slate-50 rounded" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "font-medium text-sm" }, (_b = lpo.lpoNumber) !== null && _b !== void 0 ? _b : "—"),
                            React.createElement("p", { className: "text-xs text-gray-600" }, (_c = lpo.description) !== null && _c !== void 0 ? _c : "—")),
                        React.createElement("div", { className: "text-right" },
                            React.createElement("p", { className: "font-medium text-sm" }, format((_d = lpo.amount) !== null && _d !== void 0 ? _d : 0)),
                            React.createElement(badge_1.Badge, { variant: lpo.status === "approved" ? "default" : "secondary" }, (_e = lpo.status) !== null && _e !== void 0 ? _e : "—"))));
                }))))))));
};
exports["default"] = ProcurementManagerDashboard;
