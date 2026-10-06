"use strict";
exports.__esModule = true;
var wouter_1 = require("wouter");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var card_1 = require("@/components/ui/card");
var separator_1 = require("@/components/ui/separator");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var utils_1 = require("@/lib/utils");
var STAGE_LABELS = {
    lead: "New Lead",
    qualified: "Qualified",
    proposal: "Proposal Sent",
    negotiation: "Negotiation",
    closed_won: "Converted",
    closed_lost: "Lost"
};
var STAGE_COLORS = {
    lead: "bg-slate-100 text-slate-700 border-slate-300",
    qualified: "bg-blue-100 text-blue-700 border-blue-300",
    proposal: "bg-violet-100 text-violet-700 border-violet-300",
    negotiation: "bg-amber-100 text-amber-700 border-amber-300",
    closed_won: "bg-emerald-100 text-emerald-700 border-emerald-300",
    closed_lost: "bg-red-100 text-red-700 border-red-300"
};
var STAGES = ["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"];
function LeadDetail() {
    var _a, _b;
    var id = wouter_1.useParams().id;
    var _c = wouter_1.useLocation(), navigate = _c[1];
    var utils = trpc_1.trpc.useUtils();
    var _d = trpc_1.trpc.opportunities.getById.useQuery(id, { enabled: !!id }), lead = _d.data, isLoading = _d.isLoading, error = _d.error;
    var updateMutation = trpc_1.trpc.opportunities.update.useMutation({
        onSuccess: function () {
            utils.opportunities.getById.invalidate(id);
            utils.opportunities.list.invalidate();
            sonner_1.toast.success("Lead updated");
        }
    });
    var advanceStage = function () {
        if (!lead)
            return;
        var currentIndex = STAGES.indexOf(lead.stage);
        if (currentIndex < STAGES.length - 2) {
            updateMutation.mutate({ id: lead.id, stage: STAGES[currentIndex + 1] });
        }
    };
    var markWon = function () {
        if (!lead)
            return;
        updateMutation.mutate({ id: lead.id, stage: "closed_won" });
    };
    var markLost = function () {
        if (!lead)
            return;
        updateMutation.mutate({ id: lead.id, stage: "closed_lost" });
    };
    if (isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Lead Details", icon: React.createElement(lucide_react_1.Target, { className: "h-5 w-5" }) },
            React.createElement("div", { className: "flex items-center justify-center py-24" },
                React.createElement("div", { className: "h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" }))));
    }
    if (!lead || error) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Lead Not Found", icon: React.createElement(lucide_react_1.Target, { className: "h-5 w-5" }) },
            React.createElement("div", { className: "text-center py-24 text-muted-foreground" },
                React.createElement(lucide_react_1.Target, { className: "mx-auto h-12 w-12 mb-4 opacity-30" }),
                React.createElement("p", null, "Lead not found or you don't have access."),
                React.createElement(button_1.Button, { variant: "outline", className: "mt-4", onClick: function () { return navigate("/leads"); } },
                    React.createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-2" }),
                    " Back to Leads"))));
    }
    var stage = lead.stage || "lead";
    var stageIndex = STAGES.indexOf(stage);
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: lead.title, description: "Lead details and pipeline stage", icon: React.createElement(lucide_react_1.Target, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Leads", href: "/leads" },
            { label: lead.title },
        ], actions: React.createElement("div", { className: "flex gap-2 flex-wrap" },
            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return navigate("/leads"); } },
                React.createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-1" }),
                " Back"),
            stage !== "closed_won" && stage !== "closed_lost" && (React.createElement(React.Fragment, null,
                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: markLost, disabled: updateMutation.isPending }, "Mark Lost"),
                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: markWon, disabled: updateMutation.isPending },
                    React.createElement(lucide_react_1.CheckCircle2, { className: "h-4 w-4 mr-1" }),
                    " Mark Won"),
                stageIndex < STAGES.length - 2 && (React.createElement(button_1.Button, { size: "sm", onClick: advanceStage, disabled: updateMutation.isPending },
                    "Advance Stage ",
                    React.createElement(lucide_react_1.ArrowRight, { className: "h-4 w-4 ml-1" })))))) },
        React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6" },
            React.createElement("div", { className: "lg:col-span-2 space-y-6" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                            React.createElement(lucide_react_1.TrendingUp, { className: "h-4 w-4" }),
                            " Pipeline Stage")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "flex items-center gap-1 flex-wrap" },
                            STAGES.filter(function (s) { return s !== "closed_lost"; }).map(function (s, i) {
                                var isActive = s === stage;
                                var isPast = stageIndex > i && stage !== "closed_lost";
                                return (React.createElement("div", { key: s, className: "flex items-center gap-1" },
                                    React.createElement("div", { className: utils_1.cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-all", isActive ? STAGE_COLORS[s] : isPast ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-muted text-muted-foreground border-border") }, STAGE_LABELS[s]),
                                    i < STAGES.filter(function (s) { return s !== "closed_lost"; }).length - 1 && (React.createElement(lucide_react_1.ArrowRight, { className: utils_1.cn("h-3 w-3 text-muted-foreground", isPast && "text-emerald-500") }))));
                            }),
                            stage === "closed_lost" && (React.createElement(badge_1.Badge, { variant: "destructive" }, "Lost"))))),
                (lead.description || lead.notes) && (React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                            React.createElement(lucide_react_1.FileText, { className: "h-4 w-4" }),
                            " Notes & Description")),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        lead.description && (React.createElement("div", null,
                            React.createElement("p", { className: "text-sm font-medium text-muted-foreground mb-1" }, "Description"),
                            React.createElement("div", { className: "text-sm prose dark:prose-invert max-w-none", dangerouslySetInnerHTML: { __html: lead.description } }))),
                        lead.description && lead.notes && React.createElement(separator_1.Separator, null),
                        lead.notes && (React.createElement("div", null,
                            React.createElement("p", { className: "text-sm font-medium text-muted-foreground mb-1" }, "Notes"),
                            React.createElement("p", { className: "text-sm whitespace-pre-wrap" }, lead.notes)))))),
                (lead.winReason || lead.lossReason) && (React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardContent, { className: "pt-6" },
                        lead.winReason && (React.createElement("div", null,
                            React.createElement("p", { className: "text-sm font-medium text-emerald-600 mb-1" }, "Win Reason"),
                            React.createElement("p", { className: "text-sm" }, lead.winReason))),
                        lead.lossReason && (React.createElement("div", null,
                            React.createElement("p", { className: "text-sm font-medium text-red-600 mb-1" }, "Loss Reason"),
                            React.createElement("p", { className: "text-sm" }, lead.lossReason))))))),
            React.createElement("div", { className: "space-y-6" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-base" }, "Lead Info")),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement("div", { className: "flex items-center gap-3" },
                            React.createElement("div", { className: "p-2 bg-primary/10 rounded-lg" },
                                React.createElement(lucide_react_1.DollarSign, { className: "h-4 w-4 text-primary" })),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Value"),
                                React.createElement("p", { className: "font-semibold" }, typeof lead.value === "number" ? "KES " + lead.value.toLocaleString() : (_a = lead.value) !== null && _a !== void 0 ? _a : "—"))),
                        React.createElement("div", { className: "flex items-center gap-3" },
                            React.createElement("div", { className: "p-2 bg-primary/10 rounded-lg" },
                                React.createElement(lucide_react_1.TrendingUp, { className: "h-4 w-4 text-primary" })),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Probability"),
                                React.createElement("p", { className: "font-semibold" }, (_b = lead.probability) !== null && _b !== void 0 ? _b : 0,
                                    "%"))),
                        lead.expectedCloseDate && (React.createElement("div", { className: "flex items-center gap-3" },
                            React.createElement("div", { className: "p-2 bg-primary/10 rounded-lg" },
                                React.createElement(lucide_react_1.Calendar, { className: "h-4 w-4 text-primary" })),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Expected Close"),
                                React.createElement("p", { className: "font-semibold" }, new Date(lead.expectedCloseDate).toLocaleDateString())))),
                        lead.source && (React.createElement("div", { className: "flex items-center gap-3" },
                            React.createElement("div", { className: "p-2 bg-primary/10 rounded-lg" },
                                React.createElement(lucide_react_1.Tag, { className: "h-4 w-4 text-primary" })),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Source"),
                                React.createElement("p", { className: "font-semibold capitalize" }, lead.source)))),
                        lead.assignedTo && (React.createElement("div", { className: "flex items-center gap-3" },
                            React.createElement("div", { className: "p-2 bg-primary/10 rounded-lg" },
                                React.createElement(lucide_react_1.User, { className: "h-4 w-4 text-primary" })),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Assigned To"),
                                React.createElement("p", { className: "font-semibold" }, lead.assignedTo)))),
                        React.createElement(separator_1.Separator, null),
                        React.createElement("div", { className: "flex items-center gap-3" },
                            React.createElement("div", { className: "p-2 bg-muted rounded-lg" },
                                React.createElement(lucide_react_1.Clock, { className: "h-4 w-4 text-muted-foreground" })),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, "Created"),
                                React.createElement("p", { className: "text-sm" }, lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "—"))),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-xs text-muted-foreground mb-1" }, "Status"),
                            React.createElement(badge_1.Badge, { className: utils_1.cn("text-xs border", STAGE_COLORS[stage] || "") }, STAGE_LABELS[stage] || stage))))))));
}
exports["default"] = LeadDetail;
