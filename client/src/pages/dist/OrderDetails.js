"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var trpc_1 = require("@/lib/trpc");
var currency_1 = require("@/lib/currency");
var lucide_react_1 = require("lucide-react");
function OrderDetails() {
    var _a;
    var params = wouter_1.useParams();
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    var currencyCode = currency_1.useCurrencySettings().code;
    var _c = trpc_1.trpc.procurementMgmt.orderGetById.useQuery(params.id, {
        enabled: !!params.id
    }), order = _c.data, isLoading = _c.isLoading;
    var _d = trpc_1.trpc.suppliers.list.useQuery({ limit: 100 }).data, suppliers = _d === void 0 ? [] : _d;
    var supplierName = react_1.useMemo(function () {
        if (!(order === null || order === void 0 ? void 0 : order.supplierId))
            return (order === null || order === void 0 ? void 0 : order.supplierName) || "—";
        var supplier = suppliers.find(function (s) { return s.id === order.supplierId; });
        return (supplier === null || supplier === void 0 ? void 0 : supplier.companyName) || (supplier === null || supplier === void 0 ? void 0 : supplier.name) || order.supplierName || "—";
    }, [order === null || order === void 0 ? void 0 : order.supplierId, order === null || order === void 0 ? void 0 : order.supplierName, suppliers]);
    var statusColors = {
        draft: "bg-gray-100 text-gray-800",
        sent: "bg-blue-100 text-blue-800",
        confirmed: "bg-green-100 text-green-800",
        delivered: "bg-purple-100 text-purple-800",
        invoiced: "bg-orange-100 text-orange-800"
    };
    if (isLoading) {
        return (React.createElement("div", { className: "flex items-center justify-center min-h-[400px]" },
            React.createElement(lucide_react_1.Loader2, { className: "w-8 h-8 animate-spin text-muted-foreground" })));
    }
    if (!order) {
        return (React.createElement("div", { className: "flex flex-col items-center justify-center min-h-[400px] gap-4" },
            React.createElement("p", { className: "text-muted-foreground" }, "Order not found"),
            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setLocation("/orders"); } },
                React.createElement(lucide_react_1.ArrowLeft, { className: "w-4 h-4 mr-2" }),
                " Back to Orders")));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Order " + (order.orderNumber || ""), description: "Purchase Order Details", icon: React.createElement(lucide_react_1.ShoppingCart, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Orders", href: "/orders" },
            { label: order.orderNumber || "Details" },
        ], actions: React.createElement("div", { className: "flex gap-2" },
            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setLocation("/orders"); } },
                React.createElement(lucide_react_1.ArrowLeft, { className: "w-4 h-4 mr-2" }),
                " Back"),
            React.createElement(button_1.Button, { onClick: function () { return setLocation("/orders/" + params.id + "/edit"); } },
                React.createElement(lucide_react_1.Edit2, { className: "w-4 h-4 mr-2" }),
                " Edit")) },
        React.createElement("div", { className: "max-w-4xl space-y-6" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement(badge_1.Badge, { className: "text-sm px-3 py-1 " + (statusColors[order.status] || "") }, (_a = order.status) === null || _a === void 0 ? void 0 : _a.toUpperCase()),
                React.createElement("span", { className: "text-sm text-muted-foreground" },
                    "Created ",
                    new Date(order.createdAt).toLocaleDateString())),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-4" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.Building2, { className: "w-4 h-4 text-blue-600" }),
                        "Order Identification")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Order Number"),
                            React.createElement("p", { className: "font-medium" }, order.orderNumber || "—")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Supplier"),
                            React.createElement("p", { className: "font-medium" }, supplierName))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-4" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.Coins, { className: "w-4 h-4 text-green-600" }),
                        "Financial & Schedule")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Total Amount"),
                            React.createElement("p", { className: "font-medium text-lg" }, order.totalAmount
                                ? new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode }).format(order.totalAmount / 100)
                                : "—")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "PO Date"),
                            React.createElement("p", { className: "font-medium" }, order.poDate ? new Date(order.poDate).toLocaleDateString() : "—")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Status"),
                            React.createElement("p", { className: "font-medium capitalize" }, order.status || "—"))))),
            (order.deliveryDate || order.deliveryAddress) && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-4" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.Truck, { className: "w-4 h-4 text-orange-600" }),
                        "Delivery Details")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                        order.deliveryDate && (React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Delivery Date"),
                            React.createElement("p", { className: "font-medium" }, new Date(order.deliveryDate).toLocaleDateString()))),
                        order.deliveryAddress && (React.createElement("div", { className: "flex items-start gap-2" },
                            React.createElement(lucide_react_1.MapPin, { className: "w-4 h-4 text-muted-foreground mt-0.5" }),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Delivery Address"),
                                React.createElement("p", { className: "font-medium" }, order.deliveryAddress)))))))),
            (order.description || order.notes) && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-4" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.StickyNote, { className: "w-4 h-4 text-purple-600" }),
                        "Description & Notes")),
                React.createElement(card_1.CardContent, { className: "space-y-4" },
                    order.description && (React.createElement("div", null,
                        React.createElement("p", { className: "text-sm text-muted-foreground mb-2" }, "Description / Items"),
                        React.createElement("div", { className: "prose prose-sm max-w-none", dangerouslySetInnerHTML: { __html: order.description } }))),
                    order.description && order.notes && React.createElement(separator_1.Separator, null),
                    order.notes && (React.createElement("div", null,
                        React.createElement("p", { className: "text-sm text-muted-foreground mb-2" }, "Notes"),
                        React.createElement("div", { className: "prose prose-sm max-w-none", dangerouslySetInnerHTML: { __html: order.notes } })))))))));
}
exports["default"] = OrderDetails;
