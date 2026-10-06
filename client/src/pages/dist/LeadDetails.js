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
var stageColors = {
    lead: "bg-blue-100 text-blue-700",
    qualified: "bg-cyan-100 text-cyan-700",
    proposal: "bg-yellow-100 text-yellow-700",
    negotiation: "bg-orange-100 text-orange-700",
    closed_won: "bg-green-100 text-green-700",
    closed_lost: "bg-red-100 text-red-700"
};
var stageLabels = {
    lead: "Lead",
    qualified: "Qualified",
    proposal: "Proposal",
    negotiation: "Negotiation",
    closed_won: "Closed Won",
    closed_lost: "Closed Lost"
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
function LeadDetails() {
    var _a, _b;
    var id = wouter_1.useParams().id;
    var _c = wouter_1.useLocation(), navigate = _c[1];
    var format = currency_1.useCurrency().format;
    var _d = trpc_1.trpc.opportunities.getById.useQuery(id || ""), raw = _d.data, isLoading = _d.isLoading;
    if (isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Lead", icon: React.createElement(lucide_react_1.Target, { className: "h-5 w-5" }), breadcrumbs: [
                { label: "Leads", href: "/leads" },
                { label: "Loading..." },
            ], backLink: "/leads" },
            React.createElement("div", { className: "flex justify-center items-center h-64" },
                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-muted-foreground" }))));
    }
    if (!raw) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Lead Not Found", icon: React.createElement(lucide_react_1.Target, { className: "h-5 w-5" }), breadcrumbs: [
                { label: "Leads", href: "/leads" },
                { label: "Not Found" },
            ], backLink: "/leads" },
            React.createElement("div", { className: "text-center py-16 text-muted-foreground" }, "Lead not found or you don't have permission to view it.")));
    }
    var lead = raw;
    var stage = lead.stage || lead.status || "lead";
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: lead.title || "Lead", icon: React.createElement(lucide_react_1.Target, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Leads", href: "/leads" },
            { label: lead.title || "Lead" },
        ], backLink: "/leads", actions: React.createElement(button_1.Button, { onClick: function () { return navigate("/opportunities/" + id + "/edit"); }, className: "flex items-center gap-2" },
            React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" }),
            "Edit") },
        React.createElement("div", { className: "space-y-6 max-w-4xl mx-auto" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" },
                        React.createElement(card_1.CardTitle, { className: "text-xl" }, lead.title),
                        React.createElement(badge_1.Badge, { className: stageColors[stage] || "bg-gray-100 text-gray-700" }, stageLabels[stage] || stage.replace(/_/g, " ")))),
                lead.description && (React.createElement(card_1.CardContent, null,
                    React.createElement("p", { className: "text-sm text-muted-foreground whitespace-pre-wrap" }, lead.description)))),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                            React.createElement(lucide_react_1.DollarSign, { className: "h-4 w-4 text-muted-foreground" }),
                            "Value")),
                    React.createElement(card_1.CardContent, { className: "space-y-3 text-sm" },
                        React.createElement("div", { className: "flex justify-between font-semibold text-base" },
                            React.createElement("span", null, "Deal Value"),
                            React.createElement("span", null, format((_b = (_a = lead.value) !== null && _a !== void 0 ? _a : lead.amount) !== null && _b !== void 0 ? _b : 0))),
                        lead.probability != null && (React.createElement(React.Fragment, null,
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", { className: "flex justify-between items-center" },
                                React.createElement("span", { className: "text-muted-foreground flex items-center gap-1" },
                                    React.createElement(lucide_react_1.Percent, { className: "h-3 w-3" }),
                                    " Probability"),
                                React.createElement("span", null,
                                    lead.probability,
                                    "%")))))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                            React.createElement(lucide_react_1.User, { className: "h-4 w-4 text-muted-foreground" }),
                            "Assignment")),
                    React.createElement(card_1.CardContent, { className: "space-y-3 text-sm" },
                        lead.assignedTo && (React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-muted-foreground" }, "Assigned To"),
                            React.createElement("span", null, lead.assignedTo))),
                        lead.source && (React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-muted-foreground" }, "Source"),
                            React.createElement("span", { className: "capitalize" }, lead.source.replace(/_/g, " "))))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.Calendar, { className: "h-4 w-4 text-muted-foreground" }),
                        "Timeline")),
                React.createElement(card_1.CardContent, { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm" },
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-muted-foreground" }, "Created"),
                        React.createElement("span", null, fmt(lead.createdAt))),
                    lead.expectedCloseDate && (React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-muted-foreground" }, "Expected Close"),
                        React.createElement("span", null, fmt(lead.expectedCloseDate)))),
                    lead.actualCloseDate && (React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-muted-foreground" }, "Actual Close"),
                        React.createElement("span", null, fmt(lead.actualCloseDate)))),
                    lead.stageMovedAt && (React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-muted-foreground" }, "Stage Updated"),
                        React.createElement("span", null, fmt(lead.stageMovedAt)))))),
            (lead.winReason || lead.lossReason) && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-base" }, "Outcome")),
                React.createElement(card_1.CardContent, { className: "space-y-3 text-sm" },
                    lead.winReason && (React.createElement("div", null,
                        React.createElement("p", { className: "text-xs font-medium text-green-600 mb-1" }, "Win Reason"),
                        React.createElement("p", { className: "text-muted-foreground" }, lead.winReason))),
                    lead.lossReason && (React.createElement("div", null,
                        React.createElement("p", { className: "text-xs font-medium text-red-600 mb-1" }, "Loss Reason"),
                        React.createElement("p", { className: "text-muted-foreground" }, lead.lossReason)))))),
            lead.notes && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-base" }, "Notes")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("p", { className: "text-sm text-muted-foreground whitespace-pre-wrap" }, lead.notes)))))));
}
exports["default"] = LeadDetails;
