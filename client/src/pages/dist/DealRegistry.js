"use strict";
exports.__esModule = true;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var currency_1 = require("@/lib/currency");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
function DealRegistry() {
    var formatMoney = currency_1.useCurrency().format;
    var dealsQuery = trpc_1.trpc.opportunities.list.useQuery({ limit: 50 });
    var deals = dealsQuery.data ? JSON.parse(JSON.stringify(dealsQuery.data)) : [];
    var totalValue = deals.reduce(function (s, d) { return s + (Number(d.amount) || 0); }, 0);
    var activeDeals = deals.filter(function (d) { return d.status && d.status !== "closed_lost" && d.status !== "lost"; });
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Deal Registry", icon: react_1["default"].createElement(lucide_react_1.FileText, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Sales" }, { label: "Deal Registry" }] },
        react_1["default"].createElement("div", { className: "grid grid-cols-4 gap-4" },
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Total Deals"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold" }, deals.length))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Active Deals"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold" }, activeDeals.length))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Pipeline Value"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold" }, formatMoney(totalValue)))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Close Rate"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold" },
                        deals.length > 0
                            ? ((deals.filter(function (d) { return d.status === "closed_won" || d.status === "won"; }).length / deals.length) * 100).toFixed(0)
                            : 0,
                        "%")))),
        react_1["default"].createElement(card_1.Card, null,
            react_1["default"].createElement(card_1.CardHeader, null,
                react_1["default"].createElement(card_1.CardTitle, null, "Registered Deals")),
            react_1["default"].createElement(card_1.CardContent, null, deals.length > 0 ? (react_1["default"].createElement("div", { className: "space-y-3" }, deals.map(function (deal) { return (react_1["default"].createElement("div", { key: deal.id, className: "p-4 bg-muted/50 rounded-lg flex justify-between items-center" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("p", { className: "font-bold" }, deal.name || deal.title || "Deal #" + deal.proposalNumber),
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, deal.clientName || deal.contactName || "—")),
                react_1["default"].createElement("div", { className: "text-right" },
                    react_1["default"].createElement("p", { className: "font-bold text-purple-600" }, formatMoney(Number(deal.amount) || 0)),
                    react_1["default"].createElement(badge_1.Badge, { variant: deal.status === "closed_won" || deal.status === "won" ? "default" : deal.status === "closed_lost" || deal.status === "lost" ? "destructive" : "secondary" }, deal.status || "Unknown")))); }))) : (react_1["default"].createElement("p", { className: "text-muted-foreground text-center py-8" }, "No deals found \u2014 create opportunities to populate the deal registry"))))));
}
exports["default"] = DealRegistry;
