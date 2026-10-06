"use strict";
exports.__esModule = true;
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
function MpesaConfig() {
    var _a, _b;
    var statusQuery = trpc_1.trpc.mpesa.getStatus.useQuery();
    var historyQuery = trpc_1.trpc.mpesa.getTransactionHistory.useQuery({ limit: 10 });
    if (statusQuery.isLoading || historyQuery.isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "M-Pesa Configuration", icon: React.createElement(lucide_react_1.Smartphone, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/" }, { label: "Payments" }, { label: "M-Pesa Config" }] },
            React.createElement("div", { className: "flex justify-center py-12" },
                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))));
    }
    if (statusQuery.error) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "M-Pesa Configuration", icon: React.createElement(lucide_react_1.Smartphone, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/" }, { label: "Payments" }, { label: "M-Pesa Config" }] },
            React.createElement("div", { className: "bg-red-50 text-red-700 p-4 rounded-lg" },
                "Error: ",
                statusQuery.error.message)));
    }
    var status = statusQuery.data;
    var transactions = ((_a = historyQuery.data) !== null && _a !== void 0 ? _a : []);
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "M-Pesa Configuration", icon: React.createElement(lucide_react_1.Smartphone, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/" }, { label: "Payments" }, { label: "M-Pesa Config" }] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Integration Status")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                        React.createElement("div", null,
                            React.createElement("span", { className: "text-sm text-gray-600" }, "Environment"),
                            React.createElement("p", { className: "font-medium" }, (_b = status === null || status === void 0 ? void 0 : status.environment) !== null && _b !== void 0 ? _b : "—")),
                        React.createElement("div", null,
                            React.createElement("span", { className: "text-sm text-gray-600" }, "Connected"),
                            React.createElement(badge_1.Badge, { variant: (status === null || status === void 0 ? void 0 : status.configured) ? "default" : "secondary" }, (status === null || status === void 0 ? void 0 : status.configured) ? "Yes" : "No"))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Recent Transactions")),
                React.createElement(card_1.CardContent, null, transactions.length === 0 ? (React.createElement("p", { className: "text-center text-gray-500 py-8" }, "No data found.")) : (React.createElement("div", { className: "space-y-2 max-h-96 overflow-y-auto" }, transactions.map(function (tx, i) {
                    var _a, _b, _c, _d, _e, _f;
                    return (React.createElement("div", { key: (_a = tx.checkoutRequestId) !== null && _a !== void 0 ? _a : i, className: "flex justify-between items-center p-3 border rounded" },
                        React.createElement("div", null,
                            React.createElement("div", { className: "font-medium" }, (_c = (_b = tx.mpesaReceiptNumber) !== null && _b !== void 0 ? _b : tx.checkoutRequestId) !== null && _c !== void 0 ? _c : "—"),
                            React.createElement("div", { className: "text-xs text-gray-600" }, (_d = tx.transactionDate) !== null && _d !== void 0 ? _d : "—")),
                        React.createElement("div", { className: "text-right" },
                            React.createElement("div", { className: "font-semibold" },
                                "KES ", (_e = tx.amount) !== null && _e !== void 0 ? _e : 0),
                            React.createElement(badge_1.Badge, { variant: tx.status === "completed" ? "default" : "secondary" }, (_f = tx.status) !== null && _f !== void 0 ? _f : "—"))));
                }))))))));
}
exports["default"] = MpesaConfig;
