"use strict";
exports.__esModule = true;
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var trpc_1 = require("@/lib/trpc");
var currency_1 = require("@/lib/currency");
var lucide_react_1 = require("lucide-react");
function AssetDetails() {
    var _a;
    var params = wouter_1.useParams();
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    var formatMoney = currency_1.useCurrency().format;
    var _c = trpc_1.trpc.assets.getById.useQuery(params.id, {
        enabled: !!params.id
    }), asset = _c.data, isLoading = _c.isLoading;
    var statusColors = {
        active: "bg-green-100 text-green-800",
        inactive: "bg-gray-100 text-gray-800",
        maintenance: "bg-yellow-100 text-yellow-800",
        disposed: "bg-red-100 text-red-800"
    };
    if (isLoading) {
        return (React.createElement("div", { className: "flex items-center justify-center min-h-[400px]" },
            React.createElement(lucide_react_1.Loader2, { className: "w-8 h-8 animate-spin text-muted-foreground" })));
    }
    if (!asset) {
        return (React.createElement("div", { className: "flex flex-col items-center justify-center min-h-[400px] gap-4" },
            React.createElement("p", { className: "text-muted-foreground" }, "Asset not found"),
            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setLocation("/assets"); } },
                React.createElement(lucide_react_1.ArrowLeft, { className: "w-4 h-4 mr-2" }),
                " Back to Assets")));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: asset.name, description: "Asset Details", icon: React.createElement(lucide_react_1.Package, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Assets", href: "/assets" },
            { label: asset.name },
        ], actions: React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setLocation("/assets"); } },
            React.createElement(lucide_react_1.ArrowLeft, { className: "w-4 h-4 mr-2" }),
            " Back") },
        React.createElement("div", { className: "max-w-4xl space-y-6" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement(badge_1.Badge, { className: "text-sm px-3 py-1 " + (statusColors[asset.status] || "bg-gray-100 text-gray-800") }, (_a = asset.status) === null || _a === void 0 ? void 0 : _a.toUpperCase()),
                asset.createdAt && (React.createElement("span", { className: "text-sm text-muted-foreground" },
                    "Registered ",
                    new Date(asset.createdAt).toLocaleDateString()))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-4" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.Package, { className: "w-4 h-4 text-blue-600" }),
                        "Asset Information")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Asset Name"),
                            React.createElement("p", { className: "font-medium" }, asset.name)),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Category"),
                            React.createElement("p", { className: "font-medium" }, asset.category)),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Location"),
                            React.createElement("p", { className: "font-medium" }, asset.location || "—"))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-4" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.Coins, { className: "w-4 h-4 text-green-600" }),
                        "Valuation")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Asset Value"),
                            React.createElement("p", { className: "font-medium text-lg" }, formatMoney(asset.value || 0))),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground flex items-center gap-1" },
                                React.createElement(lucide_react_1.Calendar, { className: "w-3 h-3" }),
                                " Purchase Date"),
                            React.createElement("p", { className: "font-medium" }, asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : "—"))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-4" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.User, { className: "w-4 h-4 text-purple-600" }),
                        "Assignment")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Assigned To"),
                            React.createElement("p", { className: "font-medium" }, asset.assignedTo || "Unassigned")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Serial Number"),
                            React.createElement("p", { className: "font-medium" }, asset.serialNumber || "—"))))),
            asset.notes && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-4" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.StickyNote, { className: "w-4 h-4 text-orange-600" }),
                        "Notes")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("p", { className: "text-sm whitespace-pre-wrap" }, asset.notes)))))));
}
exports["default"] = AssetDetails;
