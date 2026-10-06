"use strict";
exports.__esModule = true;
var wouter_1 = require("wouter");
var OrgLayout_1 = require("@/components/OrgLayout");
var OrgBreadcrumb_1 = require("@/components/OrgBreadcrumb");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var currency_1 = require("@/lib/currency");
var useOrgPermission_1 = require("@/hooks/useOrgPermission");
var priorityColors = {
    low: "bg-green-500/20 text-green-300 border-green-500/30",
    medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    normal: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    high: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    urgent: "bg-red-500/20 text-red-300 border-red-500/30"
};
var statusColors = {
    "new": "bg-blue-500/20 text-blue-300 border-blue-500/30",
    open: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    in_progress: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    on_hold: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    resolved: "bg-green-500/20 text-green-300 border-green-500/30",
    closed: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    reopened: "bg-orange-500/20 text-orange-300 border-orange-500/30"
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
function OrgTicketDetail() {
    var _a, _b;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var ticketId = params.id;
    var _c = wouter_1.useLocation(), navigate = _c[1];
    var formatAmount = currency_1.useCurrencySettings().formatAmount;
    var hasPermission = useOrgPermission_1.useOrgPermission().hasPermission;
    var canEdit = hasPermission("tickets");
    var _d = trpc_1.trpc.tickets.getById.useQuery(ticketId), data = _d.data, isLoading = _d.isLoading;
    if (isLoading) {
        return (React.createElement(OrgLayout_1["default"], null,
            React.createElement(OrgBreadcrumb_1["default"], { items: [
                    { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
                    { label: "Tickets", href: "/org/" + slug + "/tickets" },
                    { label: "Loading..." },
                ] }),
            React.createElement("div", { className: "flex justify-center items-center h-64" },
                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-blue-500" }))));
    }
    if (!data) {
        return (React.createElement(OrgLayout_1["default"], null,
            React.createElement(OrgBreadcrumb_1["default"], { items: [
                    { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
                    { label: "Tickets", href: "/org/" + slug + "/tickets" },
                    { label: "Not Found" },
                ] }),
            React.createElement("div", { className: "text-center py-12" },
                React.createElement(lucide_react_1.AlertCircle, { className: "h-16 w-16 text-red-400 mx-auto mb-4" }),
                React.createElement("h2", { className: "text-2xl font-bold text-white mb-2" }, "Ticket Not Found"),
                React.createElement("p", { className: "text-white/60 mb-6" }, "The ticket you're looking for doesn't exist or you don't have permission to view it."),
                React.createElement(button_1.Button, { onClick: function () { return navigate("/org/" + slug + "/tickets"); } },
                    React.createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-2" }),
                    "Back to Tickets"))));
    }
    var ticket = data;
    var comments = Array.isArray(ticket.comments) ? ticket.comments : [];
    var tasks = Array.isArray(ticket.tasks) ? ticket.tasks : [];
    var ticketLabel = ticket.ticketNumber || ticket.title || "Ticket";
    return (React.createElement(OrgLayout_1["default"], null,
        React.createElement(OrgBreadcrumb_1["default"], { items: [
                { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
                { label: "Tickets", href: "/org/" + slug + "/tickets" },
                { label: ticketLabel },
            ] }),
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", { className: "flex items-center gap-4" },
                    React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return navigate("/org/" + slug + "/tickets"); } },
                        React.createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-2" }),
                        "Back"),
                    React.createElement("div", null,
                        React.createElement("h1", { className: "text-2xl font-bold text-white flex items-center gap-2" },
                            React.createElement(lucide_react_1.Ticket, { className: "h-6 w-6" }),
                            ticketLabel),
                        React.createElement("p", { className: "text-white/60" }, ticket.title))),
                canEdit && (React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return navigate("/org/" + slug + "/tickets/" + ticketId + "/edit"); } },
                    React.createElement(lucide_react_1.Edit, { className: "h-4 w-4 mr-2" }),
                    "Edit"))),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                React.createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                    React.createElement(card_1.CardContent, { className: "p-4" },
                        React.createElement("div", { className: "flex items-center gap-3" },
                            React.createElement(badge_1.Badge, { className: statusColors[ticket.status] || "bg-white/10 text-white/60 border-white/20" }, ((_a = ticket.status) === null || _a === void 0 ? void 0 : _a.replace("_", " ").toUpperCase()) || "UNKNOWN")))),
                React.createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                    React.createElement(card_1.CardContent, { className: "p-4" },
                        React.createElement("div", { className: "flex items-center gap-3" },
                            React.createElement(badge_1.Badge, { className: priorityColors[ticket.priority] || "bg-white/10 text-white/60 border-white/20" }, ((_b = ticket.priority) === null || _b === void 0 ? void 0 : _b.toUpperCase()) || "UNKNOWN")))),
                React.createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                    React.createElement(card_1.CardContent, { className: "p-4" },
                        React.createElement("div", { className: "flex items-center gap-3" },
                            React.createElement(lucide_react_1.Calendar, { className: "h-5 w-5 text-blue-400" }),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-white/60" }, "Created"),
                                React.createElement("p", { className: "text-white font-medium" }, fmt(ticket.createdAt)))))),
                React.createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                    React.createElement(card_1.CardContent, { className: "p-4" },
                        React.createElement("div", { className: "flex items-center gap-3" },
                            React.createElement(lucide_react_1.MessageSquare, { className: "h-5 w-5 text-purple-400" }),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-white/60" }, "Comments"),
                                React.createElement("p", { className: "text-white font-medium" }, comments.length)))))),
            React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6" },
                React.createElement("div", { className: "lg:col-span-2 space-y-6" },
                    React.createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, { className: "text-white" }, "Ticket Details")),
                        React.createElement(card_1.CardContent, { className: "space-y-4" },
                            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                                React.createElement("div", null,
                                    React.createElement("label", { className: "text-sm text-white/60" }, "Subject"),
                                    React.createElement("p", { className: "text-white font-medium" }, ticket.title || "N/A")),
                                React.createElement("div", null,
                                    React.createElement("label", { className: "text-sm text-white/60" }, "Category"),
                                    React.createElement("p", { className: "text-white font-medium" }, ticket.category || "N/A")),
                                React.createElement("div", null,
                                    React.createElement("label", { className: "text-sm text-white/60" }, "Type"),
                                    React.createElement("p", { className: "text-white font-medium" }, ticket.type || "N/A")),
                                React.createElement("div", null,
                                    React.createElement("label", { className: "text-sm text-white/60" }, "Source"),
                                    React.createElement("p", { className: "text-white font-medium" }, ticket.source || "N/A"))),
                            ticket.description && (React.createElement("div", null,
                                React.createElement("label", { className: "text-sm text-white/60" }, "Description"),
                                React.createElement("div", { className: "mt-2 text-white whitespace-pre-wrap" }, ticket.description))),
                            ticket.tags && ticket.tags.length > 0 && (React.createElement("div", null,
                                React.createElement("label", { className: "text-sm text-white/60" }, "Tags"),
                                React.createElement("div", { className: "flex flex-wrap gap-2 mt-2" }, ticket.tags.map(function (tag, index) { return (React.createElement(badge_1.Badge, { key: index, variant: "secondary", className: "text-xs" }, tag)); })))))),
                    tasks.length > 0 && (React.createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, { className: "text-white flex items-center gap-2" },
                                React.createElement(lucide_react_1.CheckSquare, { className: "h-5 w-5" }),
                                "Tasks (",
                                tasks.length,
                                ")")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("div", { className: "space-y-3" }, tasks.map(function (task) { return (React.createElement("div", { key: task.id, className: "flex items-start gap-3 p-3 bg-white/5 rounded-lg" },
                                React.createElement(lucide_react_1.CheckSquare, { className: "h-4 w-4 text-green-400 mt-0.5 shrink-0" }),
                                React.createElement("div", { className: "flex-1" },
                                    React.createElement("p", { className: "text-white font-medium" }, task.title),
                                    task.description && (React.createElement("p", { className: "text-white/60 text-sm mt-1" }, task.description)),
                                    React.createElement("div", { className: "flex items-center gap-4 mt-2 text-xs text-white/40" },
                                        React.createElement("span", null,
                                            "Due: ",
                                            fmt(task.dueDate)),
                                        React.createElement("span", null,
                                            "Status: ",
                                            task.status))))); }))))),
                    comments.length > 0 && (React.createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, { className: "text-white flex items-center gap-2" },
                                React.createElement(lucide_react_1.MessageSquare, { className: "h-5 w-5" }),
                                "Comments (",
                                comments.length,
                                ")")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("div", { className: "space-y-4" }, comments.map(function (comment) { return (React.createElement("div", { key: comment.id, className: "border-l-2 border-white/20 pl-4" },
                                React.createElement("div", { className: "flex items-center gap-2 mb-2" },
                                    React.createElement("span", { className: "text-white font-medium" }, comment.author || "Unknown"),
                                    React.createElement("span", { className: "text-white/40 text-sm" }, fmtDateTime(comment.createdAt))),
                                React.createElement("p", { className: "text-white/80" }, comment.content))); })))))),
                React.createElement("div", { className: "space-y-6" },
                    React.createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, { className: "text-white" }, "Assignment")),
                        React.createElement(card_1.CardContent, { className: "space-y-3" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-white/60" }, "Assigned To"),
                                React.createElement("p", { className: "text-white font-medium" }, ticket.assignedTo || "Unassigned")),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-white/60" }, "Reported By"),
                                React.createElement("p", { className: "text-white font-medium" }, ticket.reportedBy || "Unknown")),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-white/60" }, "Last Updated"),
                                React.createElement("p", { className: "text-white font-medium" }, fmtDateTime(ticket.updatedAt))))),
                    React.createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, { className: "text-white" }, "Timeline")),
                        React.createElement(card_1.CardContent, { className: "space-y-3" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-white/60" }, "Created"),
                                React.createElement("p", { className: "text-white text-sm" }, fmtDateTime(ticket.createdAt))),
                            ticket.resolvedAt && (React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-white/60" }, "Resolved"),
                                React.createElement("p", { className: "text-white text-sm" }, fmtDateTime(ticket.resolvedAt)))),
                            ticket.closedAt && (React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-white/60" }, "Closed"),
                                React.createElement("p", { className: "text-white text-sm" }, fmtDateTime(ticket.closedAt)))))))))));
}
exports["default"] = OrgTicketDetail;
