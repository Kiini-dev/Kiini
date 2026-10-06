"use strict";
exports.__esModule = true;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
function ApiMarketplace() {
    var _a, _b, _c;
    var marketplaceQuery = trpc_1.trpc.apiMonetization.listApiMarketplace.useQuery({ limit: 20 });
    var dashboardQuery = trpc_1.trpc.apiMonetization.getMonetizationDashboard.useQuery({});
    var marketplace = marketplaceQuery.data ? JSON.parse(JSON.stringify(marketplaceQuery.data)) : null;
    var dashboard = dashboardQuery.data ? JSON.parse(JSON.stringify(dashboardQuery.data)) : null;
    var apis = (marketplace === null || marketplace === void 0 ? void 0 : marketplace.apis) || [];
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "API Marketplace", icon: react_1["default"].createElement(lucide_react_1.ShoppingCart, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Developer" }, { label: "API Marketplace" }] },
        react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" },
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Total APIs"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold" }, (_a = marketplace === null || marketplace === void 0 ? void 0 : marketplace.totalApis) !== null && _a !== void 0 ? _a : 0))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Active Configs"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold" }, (_b = dashboard === null || dashboard === void 0 ? void 0 : dashboard.activeApis) !== null && _b !== void 0 ? _b : 0))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Total Configs"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold" }, (_c = dashboard === null || dashboard === void 0 ? void 0 : dashboard.totalConfigs) !== null && _c !== void 0 ? _c : 0))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Status"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold" }, apis.length > 0 ? "Active" : "No APIs")))),
        react_1["default"].createElement(card_1.Card, null,
            react_1["default"].createElement(card_1.CardHeader, null,
                react_1["default"].createElement(card_1.CardTitle, null, "Available APIs")),
            react_1["default"].createElement(card_1.CardContent, null, apis.length > 0 ? (react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" }, apis.map(function (api) { return (react_1["default"].createElement("div", { key: api.id, className: "border rounded-lg p-4 hover:shadow-lg transition" },
                react_1["default"].createElement("h3", { className: "font-bold" }, api.name),
                react_1["default"].createElement(badge_1.Badge, { variant: "outline", className: "mt-1" }, api.pricingModel),
                react_1["default"].createElement("p", { className: "text-lg font-bold text-green-600 my-3" },
                    "Ksh ",
                    api.basePrice || "Free"),
                react_1["default"].createElement(badge_1.Badge, { variant: api.status === "ACTIVE" ? "default" : "secondary" }, api.status))); }))) : (react_1["default"].createElement("p", { className: "text-muted-foreground text-center py-8" }, "No APIs configured yet \u2014 create API pricing configs to populate the marketplace"))))));
}
exports["default"] = ApiMarketplace;
