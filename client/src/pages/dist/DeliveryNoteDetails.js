"use strict";
exports.__esModule = true;
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
function DeliveryNoteDetails() {
    var _a, _b, _c;
    var params = wouter_1.useParams();
    var _d = wouter_1.useLocation(), setLocation = _d[1];
    var _e = trpc_1.trpc.deliveryNotes.getById.useQuery(params.id, {
        enabled: !!params.id
    }), dn = _e.data, isLoading = _e.isLoading;
    var statusColors = {
        pending: "bg-gray-100 text-gray-800",
        partial: "bg-yellow-100 text-yellow-800",
        delivered: "bg-green-100 text-green-800",
        cancelled: "bg-red-100 text-red-800",
        in_transit: "bg-blue-100 text-blue-800",
        partially_delivered: "bg-yellow-100 text-yellow-800",
        failed: "bg-red-100 text-red-800"
    };
    if (isLoading) {
        return (React.createElement("div", { className: "flex items-center justify-center min-h-[400px]" },
            React.createElement(lucide_react_1.Loader2, { className: "w-8 h-8 animate-spin text-muted-foreground" })));
    }
    if (!dn) {
        return (React.createElement("div", { className: "flex flex-col items-center justify-center min-h-[400px] gap-4" },
            React.createElement("p", { className: "text-muted-foreground" }, "Delivery note not found"),
            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setLocation("/delivery-notes"); } },
                React.createElement(lucide_react_1.ArrowLeft, { className: "w-4 h-4 mr-2" }),
                " Back to Delivery Notes")));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "DN " + (dn.dnNo || ""), description: "Delivery Note Details", icon: React.createElement(lucide_react_1.Truck, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Procurement", href: "/procurement" },
            { label: "Delivery Notes", href: "/delivery-notes" },
            { label: dn.dnNo || "Details" },
        ], actions: React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setLocation("/delivery-notes"); } },
            React.createElement(lucide_react_1.ArrowLeft, { className: "w-4 h-4 mr-2" }),
            " Back") },
        React.createElement("div", { className: "max-w-4xl space-y-6" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement(badge_1.Badge, { className: "text-sm px-3 py-1 " + (statusColors[dn.status] || "bg-gray-100 text-gray-800") }, (_a = dn.status) === null || _a === void 0 ? void 0 : _a.replace(/_/g, " ").toUpperCase()),
                dn.createdAt && (React.createElement("span", { className: "text-sm text-muted-foreground" },
                    "Created ",
                    new Date(dn.createdAt).toLocaleDateString()))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-4" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.Truck, { className: "w-4 h-4 text-blue-600" }),
                        "Delivery Information")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "DN Number"),
                            React.createElement("p", { className: "font-medium" }, dn.dnNo || "—")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Supplier"),
                            React.createElement("p", { className: "font-medium" }, dn.supplier || "—")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Order ID"),
                            React.createElement("p", { className: "font-medium" }, dn.orderId || "—")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Items"),
                            React.createElement("p", { className: "font-medium" }, (_b = dn.items) !== null && _b !== void 0 ? _b : "—"))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-4" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.Calendar, { className: "w-4 h-4 text-orange-600" }),
                        "Delivery Schedule")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Expected Delivery Date"),
                            React.createElement("p", { className: "font-medium" }, dn.deliveryDate ? new Date(dn.deliveryDate).toLocaleDateString() : "—")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Status"),
                            React.createElement("p", { className: "font-medium capitalize" }, ((_c = dn.status) === null || _c === void 0 ? void 0 : _c.replace(/_/g, " ")) || "—"))))),
            dn.notes && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-4" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.StickyNote, { className: "w-4 h-4 text-purple-600" }),
                        "Notes")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "prose prose-sm max-w-none", dangerouslySetInnerHTML: { __html: dn.notes } })))))));
}
exports["default"] = DeliveryNoteDetails;
