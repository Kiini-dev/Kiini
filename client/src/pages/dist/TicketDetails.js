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
    normal: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800"
};
var statusColors = {
    "new": "bg-blue-100 text-blue-700",
    open: "bg-blue-100 text-blue-700",
    in_progress: "bg-purple-100 text-purple-700",
    on_hold: "bg-yellow-100 text-yellow-700",
    resolved: "bg-green-100 text-green-700",
    closed: "bg-gray-100 text-gray-700",
    reopened: "bg-orange-100 text-orange-700"
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
function fmtDateTime(dateStr) {
    if (!dateStr)
        return "—";
    try {
        return new Date(dateStr).toLocaleString();
    }
    catch (_a) {
        return dateStr;
    }
}
function TicketDetails() {
    var id = wouter_1.useParams().id;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var format = currency_1.useCurrency().format;
    var _b = trpc_1.trpc.tickets.getById.useQuery(id || ""), data = _b.data, isLoading = _b.isLoading;
    if (isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Ticket", icon: React.createElement(lucide_react_1.Ticket, { className: "h-5 w-5" }), breadcrumbs: [
                { label: "Tickets", href: "/tickets" },
                { label: "Loading..." },
            ], backLink: { label: "Tickets", href: "/tickets" } },
            React.createElement("div", { className: "flex justify-center items-center h-64" },
                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-muted-foreground" }))));
    }
    if (!data) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Ticket Not Found", icon: React.createElement(lucide_react_1.Ticket, { className: "h-5 w-5" }), breadcrumbs: [
                { label: "Tickets", href: "/tickets" },
                { label: "Not Found" },
            ], backLink: { label: "Tickets", href: "/tickets" } },
            React.createElement("div", { className: "text-center py-16 text-muted-foreground" }, "Ticket not found or you don't have permission to view it.")));
    }
    var ticket = data;
    var comments = Array.isArray(ticket.comments) ? ticket.comments : [];
    var tasks = Array.isArray(ticket.tasks) ? ticket.tasks : [];
    var ticketLabel = ticket.ticketNumber || ticket.title || "Ticket";
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: ticketLabel, icon: React.createElement(lucide_react_1.Ticket, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Tickets", href: "/tickets" },
            { label: ticketLabel },
        ], backLink: { label: "Tickets", href: "/tickets" }, actions: React.createElement(button_1.Button, { onClick: function () { return navigate("/tickets/" + id + "/edit"); }, className: "flex items-center gap-2" },
            React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" }),
            "Edit") },
        React.createElement("div", { className: "space-y-6 max-w-4xl mx-auto" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3" },
                        React.createElement("div", null,
                            ticket.ticketNumber && (React.createElement("p", { className: "text-xs text-muted-foreground mb-1" }, ticket.ticketNumber)),
                            React.createElement(card_1.CardTitle, { className: "text-xl" }, ticket.title)),
                        React.createElement("div", { className: "flex flex-wrap gap-2" },
                            React.createElement(badge_1.Badge, { className: priorityColors[ticket.priority] || "bg-gray-100 text-gray-700" }, (ticket.priority || "normal").charAt(0).toUpperCase() +
                                (ticket.priority || "normal").slice(1)),
                            React.createElement(badge_1.Badge, { className: statusColors[ticket.status] || "bg-gray-100 text-gray-700" }, (ticket.status || "open").replace(/_/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); }))))),
                ticket.description && (React.createElement(card_1.CardContent, null,
                    React.createElement("p", { className: "text-sm text-muted-foreground whitespace-pre-wrap" }, ticket.description)))),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "text-base" }, "Details")),
                    React.createElement(card_1.CardContent, { className: "space-y-3 text-sm" },
                        ticket.category && (React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-muted-foreground" }, "Category"),
                            React.createElement("span", { className: "font-medium capitalize" }, ticket.category.replace(/_/g, " ")))),
                        ticket.department && (React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-muted-foreground" }, "Department"),
                            React.createElement("span", null, ticket.department))),
                        ticket.assignedTo && (React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-muted-foreground" }, "Assigned To"),
                            React.createElement("span", null, ticket.assignedTo))))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                            React.createElement(lucide_react_1.Calendar, { className: "h-4 w-4 text-muted-foreground" }),
                            "Timeline")),
                    React.createElement(card_1.CardContent, { className: "space-y-3 text-sm" },
                        React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-muted-foreground" }, "Created"),
                            React.createElement("span", null, fmtDateTime(ticket.createdAt))),
                        ticket.requestedDueDate && (React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-muted-foreground" }, "Due Date"),
                            React.createElement("span", null, fmt(ticket.requestedDueDate)))),
                        ticket.firstResponseAt && (React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-muted-foreground" }, "First Response"),
                            React.createElement("span", null, fmtDateTime(ticket.firstResponseAt)))),
                        ticket.resolvedAt && (React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-muted-foreground" }, "Resolved"),
                            React.createElement("span", null, fmtDateTime(ticket.resolvedAt))))))),
            ticket.resolution && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-base" }, "Resolution")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("p", { className: "text-sm text-muted-foreground whitespace-pre-wrap" }, ticket.resolution),
                    ticket.solutionUrl && (React.createElement("a", { href: ticket.solutionUrl, target: "_blank", rel: "noopener noreferrer", className: "text-sm text-primary hover:underline mt-2 block" }, ticket.solutionUrl))))),
            tasks.length > 0 && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.CheckSquare, { className: "h-4 w-4 text-muted-foreground" }),
                        "Tasks (",
                        tasks.length,
                        ")")),
                React.createElement(card_1.CardContent, { className: "space-y-3" }, tasks.map(function (task) { return (React.createElement("div", { key: task.id, className: "border rounded-md p-3 space-y-1" },
                    React.createElement("div", { className: "flex justify-between items-start" },
                        React.createElement("span", { className: "font-medium text-sm" }, task.serviceType),
                        task.dueDate && (React.createElement("span", { className: "text-xs text-muted-foreground" }, fmt(task.dueDate)))),
                    task.details && (React.createElement("p", { className: "text-sm text-muted-foreground" }, task.details)),
                    task.budget != null && (React.createElement("p", { className: "text-xs text-muted-foreground" },
                        "Budget: ",
                        format(task.budget))))); })))),
            comments.length > 0 && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.MessageSquare, { className: "h-4 w-4 text-muted-foreground" }),
                        "Comments (",
                        comments.length,
                        ")")),
                React.createElement(card_1.CardContent, { className: "space-y-4" }, comments.map(function (comment, i) { return (React.createElement("div", { key: comment.id || i },
                    i > 0 && React.createElement(separator_1.Separator, { className: "my-3" }),
                    React.createElement("div", { className: "space-y-1" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("span", { className: "text-xs font-medium text-muted-foreground" }, comment.authorId || "Unknown"),
                            React.createElement("span", { className: "text-xs text-muted-foreground" }, fmtDateTime(comment.createdAt))),
                        React.createElement("p", { className: "text-sm whitespace-pre-wrap" }, comment.body)))); })))))));
}
exports["default"] = TicketDetails;
