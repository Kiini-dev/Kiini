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
function GRNDetails() {
    var _a, _b;
    var params = wouter_1.useParams();
    var _c = wouter_1.useLocation(), setLocation = _c[1];
    var formatCurrency = currency_1.useCurrency().format;
    var _d = trpc_1.trpc.grn.getById.useQuery(params.id, {
        enabled: !!params.id
    }), grn = _d.data, isLoading = _d.isLoading;
    var statusColors = {
        accepted: "bg-green-100 text-green-800",
        partial: "bg-yellow-100 text-yellow-800",
        rejected: "bg-red-100 text-red-800",
        pending: "bg-gray-100 text-gray-800"
    };
    if (isLoading) {
        return (React.createElement("div", { className: "flex items-center justify-center min-h-[400px]" },
            React.createElement(lucide_react_1.Loader2, { className: "w-8 h-8 animate-spin text-muted-foreground" })));
    }
    if (!grn) {
        return (React.createElement("div", { className: "flex flex-col items-center justify-center min-h-[400px] gap-4" },
            React.createElement("p", { className: "text-muted-foreground" }, "GRN not found"),
            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setLocation("/grn"); } },
                React.createElement(lucide_react_1.ArrowLeft, { className: "w-4 h-4 mr-2" }),
                " Back to GRNs")));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "GRN " + (grn.grnNo || ""), description: "Goods Receipt Note Details", icon: React.createElement(lucide_react_1.Package, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Procurement", href: "/procurement" },
            { label: "GRNs", href: "/grn" },
            { label: grn.grnNo || "Details" },
        ], actions: React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setLocation("/grn"); } },
            React.createElement(lucide_react_1.ArrowLeft, { className: "w-4 h-4 mr-2" }),
            " Back") },
        React.createElement("div", { className: "max-w-4xl space-y-6" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement(badge_1.Badge, { className: "text-sm px-3 py-1 " + (statusColors[grn.status] || "bg-gray-100 text-gray-800") }, (_a = grn.status) === null || _a === void 0 ? void 0 : _a.toUpperCase()),
                grn.createdAt && (React.createElement("span", { className: "text-sm text-muted-foreground" },
                    "Created ",
                    new Date(grn.createdAt).toLocaleDateString()))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-4" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.Package, { className: "w-4 h-4 text-blue-600" }),
                        "Receipt Information")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "GRN Number"),
                            React.createElement("p", { className: "font-medium" }, grn.grnNo || "—")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Supplier"),
                            React.createElement("p", { className: "font-medium" }, grn.supplier || "—")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Invoice Number"),
                            React.createElement("p", { className: "font-medium" }, grn.invNo || "—")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Items Received"),
                            React.createElement("p", { className: "font-medium" }, (_b = grn.items) !== null && _b !== void 0 ? _b : "—"))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-4" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.Coins, { className: "w-4 h-4 text-green-600" }),
                        "Value & Schedule")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Value"),
                            React.createElement("p", { className: "font-medium text-lg" }, grn.value
                                ? formatCurrency(grn.value)
                                : "—")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Received Date"),
                            React.createElement("p", { className: "font-medium" }, grn.receivedDate ? new Date(grn.receivedDate).toLocaleDateString() : "—"))))),
            grn.notes && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-4" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.StickyNote, { className: "w-4 h-4 text-purple-600" }),
                        "Notes")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "prose prose-sm max-w-none", dangerouslySetInnerHTML: { __html: grn.notes } })))))));
}
exports["default"] = GRNDetails;
