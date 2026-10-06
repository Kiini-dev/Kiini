"use strict";
exports.__esModule = true;
var wouter_1 = require("wouter");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var currency_1 = require("@/lib/currency");
var statusColors = {
    draft: "bg-gray-100 text-gray-700",
    submitted: "bg-blue-100 text-blue-700",
    approved: "bg-green-100 text-green-700",
    invoiced: "bg-purple-100 text-purple-700",
    rejected: "bg-red-100 text-red-700"
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
function formatDuration(minutes) {
    if (!minutes)
        return "0h 0m";
    var h = Math.floor(minutes / 60);
    var m = minutes % 60;
    return h > 0 ? h + "h " + m + "m" : m + "m";
}
function TimesheetDetails() {
    var id = wouter_1.useParams().id;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = currency_1.useCurrencySettings(), symbol = _b.symbol, position = _b.position;
    var _c = trpc_1.trpc.timeEntries.getById.useQuery(id || ""), entry = _c.data, isLoading = _c.isLoading;
    if (isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Time Entry", icon: React.createElement(lucide_react_1.Clock, { className: "h-5 w-5" }), breadcrumbs: [
                { label: "Timesheets", href: "/timesheets" },
                { label: "Loading..." },
            ], backLink: "/timesheets" },
            React.createElement("div", { className: "flex justify-center items-center h-64" },
                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-muted-foreground" }))));
    }
    if (!entry) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Time Entry Not Found", icon: React.createElement(lucide_react_1.Clock, { className: "h-5 w-5" }), breadcrumbs: [
                { label: "Timesheets", href: "/timesheets" },
                { label: "Not Found" },
            ], backLink: "/timesheets" },
            React.createElement("div", { className: "text-center py-16 text-muted-foreground" }, "Time entry not found or you don't have permission to view it.")));
    }
    var e = entry;
    var isBillable = e.billable === true || e.billable === 1;
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: fmt(e.entryDate), icon: React.createElement(lucide_react_1.Clock, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Timesheets", href: "/timesheets" },
            { label: fmt(e.entryDate) },
        ], backLink: "/timesheets" },
        React.createElement("div", { className: "space-y-6 max-w-3xl mx-auto" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" },
                        React.createElement(card_1.CardTitle, { className: "text-xl" }, e.description),
                        React.createElement("div", { className: "flex flex-wrap gap-2" },
                            React.createElement(badge_1.Badge, { className: statusColors[e.status] || "bg-gray-100 text-gray-700" }, (e.status || "draft").charAt(0).toUpperCase() +
                                (e.status || "draft").slice(1)),
                            isBillable && (React.createElement(badge_1.Badge, { className: "bg-green-100 text-green-700" }, "Billable")))))),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                            React.createElement(lucide_react_1.Calendar, { className: "h-4 w-4 text-muted-foreground" }),
                            "Time")),
                    React.createElement(card_1.CardContent, { className: "space-y-3 text-sm" },
                        React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-muted-foreground" }, "Entry Date"),
                            React.createElement("span", null, fmt(e.entryDate))),
                        React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-muted-foreground" }, "Duration"),
                            React.createElement("span", { className: "font-medium" }, formatDuration(e.durationMinutes))))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                            React.createElement(lucide_react_1.User, { className: "h-4 w-4 text-muted-foreground" }),
                            "Assignment")),
                    React.createElement(card_1.CardContent, { className: "space-y-3 text-sm" },
                        React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-muted-foreground" }, "Project"),
                            React.createElement("span", null, e.projectId || "—")),
                        e.projectTaskId && (React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-muted-foreground" }, "Task"),
                            React.createElement("span", null, e.projectTaskId))),
                        e.approvedBy && (React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-muted-foreground" }, "Approved By"),
                            React.createElement("span", null, e.approvedBy))),
                        e.approvedAt && (React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-muted-foreground" }, "Approved At"),
                            React.createElement("span", null, fmt(e.approvedAt))))))),
            isBillable && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.DollarSign, { className: "h-4 w-4 text-muted-foreground" }),
                        "Billing")),
                React.createElement(card_1.CardContent, { className: "space-y-3 text-sm" },
                    e.hourlyRate != null && (React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-muted-foreground" }, "Hourly Rate"),
                        React.createElement("span", null, currency_1.formatAmount(e.hourlyRate / 100, symbol, position)))),
                    e.amount != null && e.amount > 0 && (React.createElement("div", { className: "flex justify-between font-semibold" },
                        React.createElement("span", null, "Amount"),
                        React.createElement("span", null, currency_1.formatAmount(e.amount / 100, symbol, position))))))),
            e.notes && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-base" }, "Notes")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("p", { className: "text-sm text-muted-foreground whitespace-pre-wrap" }, e.notes)))))));
}
exports["default"] = TimesheetDetails;
