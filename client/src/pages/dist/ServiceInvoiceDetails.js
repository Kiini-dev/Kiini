"use strict";
exports.__esModule = true;
var wouter_1 = require("wouter");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var currency_1 = require("@/lib/currency");
var statusColors = {
    draft: "bg-gray-100 text-gray-700",
    sent: "bg-blue-100 text-blue-700",
    accepted: "bg-green-100 text-green-700",
    paid: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700"
};
function fmt(dateStr) {
    if (!dateStr)
        return "—";
    try {
        return new Date(dateStr).toLocaleDateString();
    }
    catch (_a) {
        return dateStr;
    }
}
function ServiceInvoiceDetails() {
    var id = wouter_1.useParams().id;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var format = currency_1.useCurrency().format;
    var _b = trpc_1.trpc.serviceInvoices.get.useQuery({ id: id || "" }), si = _b.data, isLoading = _b.isLoading;
    if (isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Service Invoice", icon: React.createElement(lucide_react_1.FileText, { className: "h-5 w-5" }), breadcrumbs: [
                { label: "Service Invoices", href: "/service-invoices" },
                { label: "Loading..." },
            ], backLink: "/service-invoices" },
            React.createElement("div", { className: "flex justify-center items-center h-64" },
                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-muted-foreground" }))));
    }
    if (!si) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Service Invoice Not Found", icon: React.createElement(lucide_react_1.FileText, { className: "h-5 w-5" }), breadcrumbs: [
                { label: "Service Invoices", href: "/service-invoices" },
                { label: "Not Found" },
            ], backLink: "/service-invoices" },
            React.createElement("div", { className: "text-center py-16 text-muted-foreground" }, "Service invoice not found or you don't have permission to view it.")));
    }
    var items = Array.isArray(si.serviceItems) ? si.serviceItems : [];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: si.serviceInvoiceNumber || "Service Invoice", icon: React.createElement(lucide_react_1.FileText, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Service Invoices", href: "/service-invoices" },
            { label: si.serviceInvoiceNumber || "Service Invoice" },
        ], backLink: "/service-invoices", actions: React.createElement(button_1.Button, { onClick: function () { return navigate("/service-invoices/" + id + "/edit"); }, className: "flex items-center gap-2" },
            React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" }),
            "Edit") },
        React.createElement("div", { className: "space-y-6 max-w-4xl mx-auto" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" },
                        React.createElement(card_1.CardTitle, { className: "text-xl" }, si.serviceInvoiceNumber),
                        React.createElement(badge_1.Badge, { className: statusColors[si.status] || "bg-gray-100 text-gray-700" }, (si.status || "draft").charAt(0).toUpperCase() +
                            (si.status || "draft").slice(1)))),
                React.createElement(card_1.CardContent, null,
                    React.createElement("p", { className: "text-muted-foreground" }, si.serviceDescription))),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                            React.createElement(lucide_react_1.User, { className: "h-4 w-4 text-muted-foreground" }),
                            "Client")),
                    React.createElement(card_1.CardContent, { className: "space-y-3 text-sm" },
                        React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-muted-foreground" }, "Client Name"),
                            React.createElement("span", { className: "font-medium" }, si.clientName || "—")))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                            React.createElement(lucide_react_1.Calendar, { className: "h-4 w-4 text-muted-foreground" }),
                            "Dates")),
                    React.createElement(card_1.CardContent, { className: "space-y-3 text-sm" },
                        React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-muted-foreground" }, "Issue Date"),
                            React.createElement("span", null, fmt(si.issueDate))),
                        React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-muted-foreground" }, "Due Date"),
                            React.createElement("span", null, fmt(si.dueDate)))))),
            items.length > 0 && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-base" }, "Service Items")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "overflow-x-auto" },
                        React.createElement("table", { className: "w-full text-sm" },
                            React.createElement("thead", null,
                                React.createElement("tr", { className: "border-b" },
                                    React.createElement("th", { className: "text-left py-2 pr-4 font-medium text-muted-foreground" }, "Description"),
                                    React.createElement("th", { className: "text-right py-2 px-4 font-medium text-muted-foreground" }, "Qty"),
                                    React.createElement("th", { className: "text-right py-2 px-4 font-medium text-muted-foreground" }, "Unit Price"),
                                    React.createElement("th", { className: "text-right py-2 pl-4 font-medium text-muted-foreground" }, "Total"))),
                            React.createElement("tbody", null, items.map(function (item, i) { return (React.createElement("tr", { key: item.id || i, className: "border-b last:border-0" },
                                React.createElement("td", { className: "py-2 pr-4" }, item.description),
                                React.createElement("td", { className: "text-right py-2 px-4" }, item.quantity),
                                React.createElement("td", { className: "text-right py-2 px-4" }, format(item.unitPrice)),
                                React.createElement("td", { className: "text-right py-2 pl-4" }, format(item.total)))); }))))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.DollarSign, { className: "h-4 w-4 text-muted-foreground" }),
                        "Summary")),
                React.createElement(card_1.CardContent, { className: "space-y-3 text-sm" },
                    si.taxAmount > 0 && (React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-muted-foreground" }, "Tax"),
                            React.createElement("span", null, format(si.taxAmount))),
                        React.createElement(separator_1.Separator, null))),
                    React.createElement("div", { className: "flex justify-between font-semibold text-base" },
                        React.createElement("span", null, "Total"),
                        React.createElement("span", null, format(si.total))))),
            si.notes && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-base" }, "Notes")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("p", { className: "text-sm text-muted-foreground whitespace-pre-wrap" }, si.notes)))))));
}
exports["default"] = ServiceInvoiceDetails;
