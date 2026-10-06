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
var priorityColors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800"
};
var statusColors = {
    draft: "bg-gray-100 text-gray-700",
    open: "bg-blue-100 text-blue-700",
    "in-progress": "bg-purple-100 text-purple-700",
    completed: "bg-green-100 text-green-700",
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
function WorkOrderDetails() {
    var id = wouter_1.useParams().id;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var format = currency_1.useCurrency().format;
    var _b = trpc_1.trpc.workOrders.get.useQuery({ id: id || "" }), wo = _b.data, isLoading = _b.isLoading;
    if (isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Work Order", icon: React.createElement(lucide_react_1.ClipboardList, { className: "h-5 w-5" }), breadcrumbs: [
                { label: "Work Orders", href: "/work-orders" },
                { label: "Loading..." },
            ], backLink: { label: "Work Orders", href: "/work-orders" } },
            React.createElement("div", { className: "flex justify-center items-center h-64" },
                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-muted-foreground" }))));
    }
    if (!wo) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Work Order Not Found", icon: React.createElement(lucide_react_1.ClipboardList, { className: "h-5 w-5" }), breadcrumbs: [
                { label: "Work Orders", href: "/work-orders" },
                { label: "Not Found" },
            ], backLink: { label: "Work Orders", href: "/work-orders" } },
            React.createElement("div", { className: "text-center py-16 text-muted-foreground" }, "Work order not found or you don't have permission to view it.")));
    }
    var materials = Array.isArray(wo.materials) ? wo.materials : [];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: wo.workOrderNumber, icon: React.createElement(lucide_react_1.ClipboardList, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Work Orders", href: "/work-orders" },
            { label: wo.workOrderNumber },
        ], backLink: { label: "Work Orders", href: "/work-orders" }, actions: React.createElement(button_1.Button, { onClick: function () { return navigate("/work-orders/" + id + "/edit"); }, className: "flex items-center gap-2" },
            React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" }),
            "Edit") },
        React.createElement("div", { className: "space-y-6 max-w-4xl mx-auto" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" },
                        React.createElement(card_1.CardTitle, { className: "text-xl" }, wo.workOrderNumber),
                        React.createElement("div", { className: "flex flex-wrap gap-2" },
                            React.createElement(badge_1.Badge, { className: priorityColors[wo.priority] || "bg-gray-100 text-gray-700" },
                                wo.priority.charAt(0).toUpperCase() + wo.priority.slice(1),
                                " Priority"),
                            React.createElement(badge_1.Badge, { className: statusColors[wo.status] || "bg-gray-100 text-gray-700" }, wo.status.replace(/-/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); }))))),
                React.createElement(card_1.CardContent, null,
                    React.createElement("p", { className: "text-muted-foreground whitespace-pre-wrap" }, wo.description))),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                            React.createElement(lucide_react_1.User, { className: "h-4 w-4 text-muted-foreground" }),
                            "Assignment")),
                    React.createElement(card_1.CardContent, { className: "space-y-3 text-sm" },
                        React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-muted-foreground" }, "Assigned To"),
                            React.createElement("span", { className: "font-medium" }, wo.assignedTo || "—")))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                            React.createElement(lucide_react_1.Calendar, { className: "h-4 w-4 text-muted-foreground" }),
                            "Dates")),
                    React.createElement(card_1.CardContent, { className: "space-y-3 text-sm" },
                        React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-muted-foreground" }, "Issue Date"),
                            React.createElement("span", null, fmt(wo.issueDate))),
                        React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-muted-foreground" }, "Start Date"),
                            React.createElement("span", null, fmt(wo.startDate))),
                        React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-muted-foreground" }, "Target End Date"),
                            React.createElement("span", null, fmt(wo.targetEndDate)))))),
            materials.length > 0 && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.Package, { className: "h-4 w-4 text-muted-foreground" }),
                        "Materials")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "overflow-x-auto" },
                        React.createElement("table", { className: "w-full text-sm" },
                            React.createElement("thead", null,
                                React.createElement("tr", { className: "border-b" },
                                    React.createElement("th", { className: "text-left py-2 pr-4 font-medium text-muted-foreground" }, "Description"),
                                    React.createElement("th", { className: "text-right py-2 px-4 font-medium text-muted-foreground" }, "Qty"),
                                    React.createElement("th", { className: "text-right py-2 px-4 font-medium text-muted-foreground" }, "Unit Cost"),
                                    React.createElement("th", { className: "text-right py-2 pl-4 font-medium text-muted-foreground" }, "Total"))),
                            React.createElement("tbody", null, materials.map(function (m, i) { return (React.createElement("tr", { key: m.id || i, className: "border-b last:border-0" },
                                React.createElement("td", { className: "py-2 pr-4" }, m.description),
                                React.createElement("td", { className: "text-right py-2 px-4" }, m.quantity),
                                React.createElement("td", { className: "text-right py-2 px-4" }, format(m.unitCost)),
                                React.createElement("td", { className: "text-right py-2 pl-4" }, format(m.total)))); }))))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.DollarSign, { className: "h-4 w-4 text-muted-foreground" }),
                        "Cost Summary")),
                React.createElement(card_1.CardContent, { className: "space-y-3 text-sm" },
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-muted-foreground" }, "Labor Cost"),
                        React.createElement("span", null, format(wo.laborCost))),
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-muted-foreground" }, "Service Cost"),
                        React.createElement("span", null, format(wo.serviceCost))),
                    React.createElement(separator_1.Separator, null),
                    React.createElement("div", { className: "flex justify-between font-semibold text-base" },
                        React.createElement("span", null, "Total"),
                        React.createElement("span", null, format(wo.total))))),
            wo.notes && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-base" }, "Notes")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("p", { className: "text-sm text-muted-foreground whitespace-pre-wrap" }, wo.notes)))))));
}
exports["default"] = WorkOrderDetails;
