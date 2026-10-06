"use strict";
exports.__esModule = true;
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var card_1 = require("@/components/ui/card");
function MarginTracking() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    var plQuery = trpc_1.trpc.financialReports.profitLoss.useQuery({});
    var bsQuery = trpc_1.trpc.financialReports.balanceSheet.useQuery({});
    var plData = plQuery.data;
    var bsData = bsQuery.data;
    var isLoading = plQuery.isLoading || bsQuery.isLoading;
    var error = plQuery.error || bsQuery.error;
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Margin Tracking", icon: React.createElement(lucide_react_1.TrendingUp, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Finance" },
            { label: "Margin Tracking" },
        ] },
        isLoading && (React.createElement("div", { className: "flex justify-center py-8" },
            React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))),
        error && (React.createElement("div", { className: "bg-red-50 text-red-700 p-4 rounded-lg" },
            "Error: ",
            error.message)),
        !isLoading && !error && (React.createElement(React.Fragment, null,
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardContent, { className: "pt-4" },
                        React.createElement("p", { className: "text-sm text-gray-600" }, "Total Revenue"),
                        React.createElement("p", { className: "text-2xl font-bold" }, (_b = (_a = plData === null || plData === void 0 ? void 0 : plData.totalRevenue) !== null && _a !== void 0 ? _a : plData === null || plData === void 0 ? void 0 : plData.revenue) !== null && _b !== void 0 ? _b : "—"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardContent, { className: "pt-4" },
                        React.createElement("p", { className: "text-sm text-gray-600" }, "Total Expenses"),
                        React.createElement("p", { className: "text-2xl font-bold" }, (_d = (_c = plData === null || plData === void 0 ? void 0 : plData.totalExpenses) !== null && _c !== void 0 ? _c : plData === null || plData === void 0 ? void 0 : plData.expenses) !== null && _d !== void 0 ? _d : "—"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardContent, { className: "pt-4" },
                        React.createElement("p", { className: "text-sm text-gray-600" }, "Net Profit"),
                        React.createElement("p", { className: "text-2xl font-bold" }, (_f = (_e = plData === null || plData === void 0 ? void 0 : plData.netProfit) !== null && _e !== void 0 ? _e : plData === null || plData === void 0 ? void 0 : plData.profit) !== null && _f !== void 0 ? _f : "—"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardContent, { className: "pt-4" },
                        React.createElement("p", { className: "text-sm text-gray-600" }, "Margin %"),
                        React.createElement("p", { className: "text-2xl font-bold" }, (_h = (_g = plData === null || plData === void 0 ? void 0 : plData.margin) !== null && _g !== void 0 ? _g : plData === null || plData === void 0 ? void 0 : plData.profitMargin) !== null && _h !== void 0 ? _h : "—")))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Profit & Loss Summary")),
                React.createElement(card_1.CardContent, null, (plData === null || plData === void 0 ? void 0 : plData.items) || (plData === null || plData === void 0 ? void 0 : plData.lineItems) ? (React.createElement("div", { className: "space-y-2" }, ((_k = (_j = plData.items) !== null && _j !== void 0 ? _j : plData.lineItems) !== null && _k !== void 0 ? _k : []).map(function (item, idx) {
                    var _a, _b, _c, _d;
                    return (React.createElement("div", { key: idx, className: "flex justify-between p-2 border-b text-sm" },
                        React.createElement("span", null, (_b = (_a = item.name) !== null && _a !== void 0 ? _a : item.category) !== null && _b !== void 0 ? _b : "—"),
                        React.createElement("span", { className: "font-medium" }, (_d = (_c = item.amount) !== null && _c !== void 0 ? _c : item.value) !== null && _d !== void 0 ? _d : 0)));
                }))) : (React.createElement("p", { className: "text-center text-gray-500 py-4" }, "Profit/loss detail not available.")))),
            bsData && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Balance Sheet")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 text-sm" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-gray-600" }, "Total Assets"),
                            React.createElement("p", { className: "text-xl font-bold" }, (_l = bsData.totalAssets) !== null && _l !== void 0 ? _l : "—")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-gray-600" }, "Total Liabilities"),
                            React.createElement("p", { className: "text-xl font-bold" }, (_m = bsData.totalLiabilities) !== null && _m !== void 0 ? _m : "—")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-gray-600" }, "Equity"),
                            React.createElement("p", { className: "text-xl font-bold" }, (_p = (_o = bsData.equity) !== null && _o !== void 0 ? _o : bsData.totalEquity) !== null && _p !== void 0 ? _p : "—"))))))))));
}
exports["default"] = MarginTracking;
