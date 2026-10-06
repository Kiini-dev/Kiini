"use strict";
exports.__esModule = true;
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
function PartnerPortal() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    var dealsQuery = trpc_1.trpc.partnerChannel.listDeals.useQuery({});
    var perfQuery = trpc_1.trpc.partnerChannel.getPartnerPerformance.useQuery({});
    var registerMutation = trpc_1.trpc.partnerChannel.registerPartner.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Partner registered successfully");
            dealsQuery.refetch();
        },
        onError: function (err) { var _a; return sonner_1.toast.error((_a = err.message) !== null && _a !== void 0 ? _a : "Registration failed"); }
    });
    var deals = (_a = dealsQuery.data) !== null && _a !== void 0 ? _a : ((_c = (_b = dealsQuery.data) === null || _b === void 0 ? void 0 : _b.deals) !== null && _c !== void 0 ? _c : []);
    var perf = perfQuery.data;
    var isLoading = dealsQuery.isLoading || perfQuery.isLoading;
    var error = dealsQuery.error || perfQuery.error;
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Partner Portal", icon: React.createElement(lucide_react_1.Handshake, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Partners" },
            { label: "Portal" },
        ] },
        React.createElement("div", { className: "flex justify-between items-center" },
            React.createElement("h2", { className: "text-xl font-bold" }, "Partner Portal"),
            React.createElement(button_1.Button, { onClick: function () { return registerMutation.mutate({}); }, disabled: registerMutation.isPending },
                registerMutation.isPending ? React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin mr-2" }) : null,
                "Register Partner")),
        isLoading && (React.createElement("div", { className: "flex justify-center py-8" },
            React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))),
        error && (React.createElement("div", { className: "bg-red-50 text-red-700 p-4 rounded-lg" },
            "Error: ",
            error.message)),
        !isLoading && !error && (React.createElement(React.Fragment, null,
            perf && (React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardContent, { className: "pt-4" },
                        React.createElement("p", { className: "text-sm text-gray-600" }, "Total Partners"),
                        React.createElement("p", { className: "text-2xl font-bold" }, (_e = (_d = perf.totalPartners) !== null && _d !== void 0 ? _d : perf.partnerCount) !== null && _e !== void 0 ? _e : 0))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardContent, { className: "pt-4" },
                        React.createElement("p", { className: "text-sm text-gray-600" }, "Revenue"),
                        React.createElement("p", { className: "text-2xl font-bold" }, (_g = (_f = perf.revenue) !== null && _f !== void 0 ? _f : perf.totalRevenue) !== null && _g !== void 0 ? _g : "—"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardContent, { className: "pt-4" },
                        React.createElement("p", { className: "text-sm text-gray-600" }, "Avg Margin"),
                        React.createElement("p", { className: "text-2xl font-bold" }, (_j = (_h = perf.avgMargin) !== null && _h !== void 0 ? _h : perf.margin) !== null && _j !== void 0 ? _j : "—"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardContent, { className: "pt-4" },
                        React.createElement("p", { className: "text-sm text-gray-600" }, "Top Tier"),
                        React.createElement("p", { className: "text-2xl font-bold" }, (_l = (_k = perf.topTier) !== null && _k !== void 0 ? _k : perf.tier) !== null && _l !== void 0 ? _l : "—"))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null,
                        "Deals (",
                        deals.length,
                        ")")),
                React.createElement(card_1.CardContent, null, deals.length === 0 ? (React.createElement("p", { className: "text-center text-gray-500 py-8" }, "No data found.")) : (React.createElement("div", { className: "space-y-3" }, deals.map(function (deal, idx) {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                    return (React.createElement("div", { key: (_a = deal.id) !== null && _a !== void 0 ? _a : idx, className: "p-4 bg-slate-50 rounded-lg flex justify-between items-center" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "font-bold text-slate-900" }, (_c = (_b = deal.name) !== null && _b !== void 0 ? _b : deal.partnerName) !== null && _c !== void 0 ? _c : "—"),
                            React.createElement("p", { className: "text-sm text-slate-600" }, (_e = (_d = deal.customers) !== null && _d !== void 0 ? _d : deal.dealCount) !== null && _e !== void 0 ? _e : 0,
                                " deals")),
                        React.createElement("div", { className: "text-right" },
                            React.createElement("p", { className: "font-bold text-blue-600" }, (_g = (_f = deal.revenue) !== null && _f !== void 0 ? _f : deal.value) !== null && _g !== void 0 ? _g : "—"),
                            React.createElement(badge_1.Badge, { variant: "secondary" }, (_j = (_h = deal.tier) !== null && _h !== void 0 ? _h : deal.status) !== null && _j !== void 0 ? _j : "—"))));
                })))))))));
}
exports["default"] = PartnerPortal;
