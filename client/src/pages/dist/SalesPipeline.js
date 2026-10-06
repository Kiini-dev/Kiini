"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var dialog_1 = require("@/components/ui/dialog");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var badge_1 = require("@/components/ui/badge");
var textarea_1 = require("@/components/ui/textarea");
var progress_1 = require("@/components/ui/progress");
var tabs_1 = require("@/components/ui/tabs");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var stats_card_1 = require("@/components/ui/stats-card");
var currency_1 = require("@/lib/currency");
var stageLabelMap = {
    lead: "Lead",
    qualified: "Qualified",
    proposal: "Proposal Sent",
    negotiation: "Negotiating",
    closed_won: "Won",
    closed_lost: "Lost"
};
var STAGE_ORDER = ["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"];
function SalesPipeline() {
    var formatMoney = currency_1.useCurrency().format;
    var _a = react_1.useState(null), draggedCard = _a[0], setDraggedCard = _a[1];
    var _b = react_1.useState(false), openDialog = _b[0], setOpenDialog = _b[1];
    var _c = react_1.useState(null), selectedOpp = _c[0], setSelectedOpp = _c[1];
    var _d = react_1.useState(null), moveDialog = _d[0], setMoveDialog = _d[1];
    var _e = react_1.useState(""), reasonText = _e[0], setReasonText = _e[1];
    // Form state
    var _f = react_1.useState({
        clientId: "",
        title: "",
        description: "",
        value: 0,
        probability: 50,
        expectedCloseDate: "",
        assignedTo: "",
        source: "",
        notes: ""
    }), formData = _f[0], setFormData = _f[1];
    // Queries
    var boardQuery = trpc_1.trpc.salesPipeline.getPipelineBoard.useQuery();
    var forecastQuery = trpc_1.trpc.salesPipeline.getSalesForecast.useQuery({});
    var statsQuery = trpc_1.trpc.salesPipeline.getWinLossStats.useQuery({ months: 3 });
    var clientsQuery = trpc_1.trpc.clients.list.useQuery(undefined);
    // Mutations
    var createMutation = trpc_1.trpc.salesPipeline.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Opportunity created");
            boardQuery.refetch();
            forecastQuery.refetch();
            resetForm();
            setOpenDialog(false);
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to create opportunity");
        }
    });
    var moveMutation = trpc_1.trpc.salesPipeline.moveOpportunity.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Opportunity moved");
            boardQuery.refetch();
            forecastQuery.refetch();
            statsQuery.refetch();
            setMoveDialog(null);
            setReasonText("");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to move opportunity");
        }
    });
    var updateProbability = trpc_1.trpc.salesPipeline.updateProbability.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Probability updated");
            boardQuery.refetch();
            forecastQuery.refetch();
        },
        onError: function () {
            sonner_1.toast.error("Failed to update probability");
        }
    });
    // Helper functions
    var resetForm = function () {
        setFormData({
            clientId: "",
            title: "",
            description: "",
            value: 0,
            probability: 50,
            expectedCloseDate: "",
            assignedTo: "",
            source: "",
            notes: ""
        });
    };
    var handleCreateOpportunity = function () {
        if (!formData.clientId || !formData.title) {
            sonner_1.toast.error("Please fill in all required fields");
            return;
        }
        var dateString = formData.expectedCloseDate
            ? formData.expectedCloseDate + "T12:00:00Z"
            : undefined;
        createMutation.mutate({
            clientId: formData.clientId,
            title: formData.title,
            description: formData.description || undefined,
            value: formData.value,
            probability: formData.probability,
            expectedCloseDate: dateString,
            assignedTo: formData.assignedTo || undefined,
            source: formData.source || undefined,
            notes: formData.notes || undefined
        });
    };
    var handleDragStart = function (e, oppId, stage) {
        setDraggedCard({ oppId: oppId, sourceStage: stage });
        e.dataTransfer.effectAllowed = "move";
    };
    var handleDragOver = function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };
    var handleDrop = function (e, targetStage) {
        e.preventDefault();
        if (!draggedCard)
            return;
        if (draggedCard.sourceStage === targetStage) {
            setDraggedCard(null);
            return;
        }
        // Check if moving to closed_won or closed_lost (need reason)
        if (targetStage === "closed_won" || targetStage === "closed_lost") {
            setMoveDialog({ oppId: draggedCard.oppId, newStage: targetStage });
        }
        else {
            moveMutation.mutate({
                id: draggedCard.oppId,
                newStage: targetStage
            });
        }
        setDraggedCard(null);
    };
    var handleConfirmMove = function () {
        if (!moveDialog)
            return;
        if ((moveDialog.newStage === "closed_won" || moveDialog.newStage === "closed_lost") &&
            !reasonText) {
            sonner_1.toast.error("Please provide a reason for closing this deal");
            return;
        }
        var isWon = moveDialog.newStage === "closed_won";
        moveMutation.mutate({
            id: moveDialog.oppId,
            newStage: moveDialog.newStage,
            winReason: isWon ? reasonText : undefined,
            lossReason: !isWon ? reasonText : undefined
        });
    };
    if (boardQuery.isLoading) {
        return React.createElement("div", { className: "p-6" }, "Loading pipeline...");
    }
    var board = boardQuery.data;
    var forecast = forecastQuery.data;
    var stats = statsQuery.data;
    var clients = clientsQuery.data || [];
    var sortedStages = (board === null || board === void 0 ? void 0 : board.stages.sort(function (a, b) { return STAGE_ORDER.indexOf(a.id) - STAGE_ORDER.indexOf(b.id); })) || [];
    var getCardColor = function (stage) {
        switch (stage) {
            case "lead":
                return "border-blue-200 bg-blue-50";
            case "qualified":
                return "border-purple-200 bg-purple-50";
            case "proposal":
                return "border-orange-200 bg-orange-50";
            case "negotiation":
                return "border-yellow-200 bg-yellow-50";
            case "closed_won":
                return "border-green-200 bg-green-50";
            case "closed_lost":
                return "border-red-200 bg-red-50";
            default:
                return "border-gray-200";
        }
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Sales Pipeline", icon: React.createElement(lucide_react_1.TrendingUp, { className: "h-6 w-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Sales", href: "/sales" },
            { label: "Pipeline" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement(tabs_1.Tabs, { defaultValue: "kanban", className: "w-full" },
                React.createElement("div", { className: "flex justify-between items-center mb-6" },
                    React.createElement("div", { className: "flex gap-2" },
                        React.createElement(tabs_1.TabsList, null,
                            React.createElement(tabs_1.TabsTrigger, { value: "kanban" }, "Kanban"),
                            React.createElement(tabs_1.TabsTrigger, { value: "forecast" }, "Forecast"),
                            React.createElement(tabs_1.TabsTrigger, { value: "analytics" }, "Analytics")),
                        React.createElement(dialog_1.Dialog, { open: openDialog, onOpenChange: setOpenDialog },
                            React.createElement(dialog_1.DialogTrigger, { asChild: true },
                                React.createElement(button_1.Button, { className: "gap-2" },
                                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
                                    " New Opportunity")),
                            React.createElement(dialog_1.DialogContent, { className: "max-w-md" },
                                React.createElement(dialog_1.DialogHeader, null,
                                    React.createElement(dialog_1.DialogTitle, null, "Create New Opportunity"),
                                    React.createElement(dialog_1.DialogDescription, null, "Add a new sales opportunity to your pipeline")),
                                React.createElement("div", { className: "space-y-4" },
                                    React.createElement("div", null,
                                        React.createElement(label_1.Label, { htmlFor: "client" }, "Client *"),
                                        React.createElement(select_1.Select, { value: formData.clientId, onValueChange: function (value) {
                                                return setFormData(__assign(__assign({}, formData), { clientId: value }));
                                            } },
                                            React.createElement(select_1.SelectTrigger, { id: "client" },
                                                React.createElement(select_1.SelectValue, { placeholder: "Select client" })),
                                            React.createElement(select_1.SelectContent, null, Array.isArray(clients) && clients.map(function (c) { return (React.createElement(select_1.SelectItem, { key: c.id, value: c.id }, c.companyName)); })))),
                                    React.createElement("div", null,
                                        React.createElement(label_1.Label, { htmlFor: "title" }, "Opportunity Title *"),
                                        React.createElement(input_1.Input, { id: "title", placeholder: "e.g., Website Redesign Project", value: formData.title, onChange: function (e) {
                                                return setFormData(__assign(__assign({}, formData), { title: e.target.value }));
                                            } })),
                                    React.createElement("div", null,
                                        React.createElement(label_1.Label, { htmlFor: "value" }, "Deal Value (KES) *"),
                                        React.createElement(input_1.Input, { id: "value", type: "number", min: "0", value: formData.value, onChange: function (e) {
                                                return setFormData(__assign(__assign({}, formData), { value: parseInt(e.target.value) || 0 }));
                                            } })),
                                    React.createElement("div", null,
                                        React.createElement(label_1.Label, { htmlFor: "probability" }, "Probability (%)"),
                                        React.createElement(input_1.Input, { id: "probability", type: "number", min: "0", max: "100", value: formData.probability, onChange: function (e) {
                                                return setFormData(__assign(__assign({}, formData), { probability: parseInt(e.target.value) || 0 }));
                                            } }),
                                        React.createElement("p", { className: "text-xs text-muted-foreground mt-1" },
                                            "Weighted forecast: ",
                                            formatMoney(Math.round(((formData.value || 0) * (formData.probability || 0)) / 100)))),
                                    React.createElement("div", null,
                                        React.createElement(label_1.Label, { htmlFor: "date" }, "Expected Close Date"),
                                        React.createElement(input_1.Input, { id: "date", type: "date", value: formData.expectedCloseDate, onChange: function (e) {
                                                return setFormData(__assign(__assign({}, formData), { expectedCloseDate: e.target.value }));
                                            } })),
                                    React.createElement("div", null,
                                        React.createElement(label_1.Label, { htmlFor: "description" }, "Description"),
                                        React.createElement(textarea_1.Textarea, { id: "description", placeholder: "Details about this opportunity", value: formData.description, onChange: function (e) {
                                                return setFormData(__assign(__assign({}, formData), { description: e.target.value }));
                                            }, rows: 2 })),
                                    React.createElement(button_1.Button, { onClick: handleCreateOpportunity, disabled: createMutation.isPending, className: "w-full" }, "Create Opportunity")))))),
                React.createElement(tabs_1.TabsContent, { value: "kanban", className: "space-y-4" },
                    React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-6 gap-4 pb-6" }, sortedStages.map(function (stage) { return (React.createElement("div", { key: stage.id, onDragOver: handleDragOver, onDrop: function (e) { return handleDrop(e, stage.id); }, className: "bg-muted/30 rounded-lg p-4 min-h-96" },
                        React.createElement("div", { className: "flex justify-between items-center mb-4" },
                            React.createElement("h3", { className: "font-semibold text-sm" }, stage.title),
                            React.createElement(badge_1.Badge, { variant: "outline" }, stage.count)),
                        React.createElement("div", { className: "space-y-3" }, stage.opportunities.map(function (opp) { return (React.createElement("div", { key: opp.id, draggable: true, onDragStart: function (e) { return handleDragStart(e, opp.id, stage.id); }, onClick: function () { return setSelectedOpp(opp); }, className: "p-3 rounded-lg cursor-move border-2 hover:shadow-md transition-shadow " + getCardColor(stage.id) },
                            React.createElement("div", { className: "flex gap-2 mb-2" },
                                React.createElement(lucide_react_1.GripVertical, { className: "h-4 w-4 text-muted-foreground flex-shrink-0" }),
                                React.createElement("div", { className: "flex-1 min-w-0" },
                                    React.createElement("p", { className: "font-medium text-sm truncate" }, opp.title))),
                            React.createElement("div", { className: "space-y-1 text-xs" },
                                React.createElement("div", { className: "flex justify-between items-center" },
                                    React.createElement("span", { className: "text-muted-foreground" }, "Value:"),
                                    React.createElement("span", { className: "font-semibold" }, formatMoney(opp.value || 0))),
                                opp.probability > 0 && (React.createElement("div", { className: "flex justify-between items-center" },
                                    React.createElement("span", { className: "text-muted-foreground" }, "Probability:"),
                                    React.createElement("span", { className: "font-semibold" },
                                        opp.probability,
                                        "%"))),
                                opp.expectedCloseDate && (React.createElement("div", { className: "flex justify-between items-center" },
                                    React.createElement("span", { className: "text-muted-foreground" }, "Close:"),
                                    React.createElement("span", { className: "font-semibold" }, new Date(opp.expectedCloseDate).toLocaleDateString())))))); })))); }))),
                React.createElement(tabs_1.TabsContent, { value: "forecast", className: "space-y-4" }, forecast && (React.createElement("div", { className: "space-y-6" },
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                        React.createElement(stats_card_1.StatsCard, { label: "Total Pipeline", value: React.createElement(React.Fragment, null, formatMoney(forecast.totalPipeline || 0)), description: React.createElement(React.Fragment, null,
                                forecast.opportunities.length,
                                " opportunities"), color: "border-l-cyan-500" }),
                        React.createElement(stats_card_1.StatsCard, { label: "Weighted Forecast", value: React.createElement(React.Fragment, null, formatMoney(forecast.weightedForecast || 0)), description: "Probability-weighted revenue", color: "border-l-pink-500" }),
                        React.createElement(stats_card_1.StatsCard, { label: "Confidence", value: React.createElement(React.Fragment, null,
                                forecast.totalPipeline > 0 ? Math.round((forecast.weightedForecast / forecast.totalPipeline) * 100) : 0,
                                " %"), description: "Average deal confidence", color: "border-l-emerald-500" })),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Forecast by Stage")),
                        React.createElement(card_1.CardContent, { className: "space-y-4" }, Object.entries(forecast.byStage).map(function (_a) {
                            var stage = _a[0], data = _a[1];
                            return (React.createElement("div", { key: stage },
                                React.createElement("div", { className: "flex justify-between items-center mb-2" },
                                    React.createElement("span", { className: "font-medium capitalize" }, stageLabelMap[stage]),
                                    React.createElement("span", { className: "text-sm text-muted-foreground" },
                                        data.count,
                                        " deals")),
                                React.createElement("div", { className: "space-y-1 text-sm" },
                                    React.createElement("div", { className: "flex justify-between" },
                                        React.createElement("span", null, "Pipeline:"),
                                        React.createElement("span", null, formatMoney(data.value || 0))),
                                    React.createElement("div", { className: "flex justify-between" },
                                        React.createElement("span", null, "Forecast:"),
                                        React.createElement("span", { className: "font-semibold" }, formatMoney(data.forecast || 0))),
                                    React.createElement(progress_1.Progress, { value: data.value > 0 ? (data.forecast / data.value) * 100 : 0, className: "mt-1" }))));
                        })))))),
                React.createElement(tabs_1.TabsContent, { value: "analytics", className: "space-y-4" }, stats && (React.createElement("div", { className: "space-y-6" },
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                        React.createElement(stats_card_1.StatsCard, { label: "Win Rate (3mo)", value: React.createElement(React.Fragment, null,
                                stats.winRate,
                                "%"), description: React.createElement(React.Fragment, null,
                                stats.won,
                                "/",
                                stats.total,
                                " deals"), color: "border-l-orange-500" }),
                        React.createElement(stats_card_1.StatsCard, { label: "Total Won", value: React.createElement(React.Fragment, null, formatMoney(stats.totalWon || 0)), description: React.createElement(React.Fragment, null,
                                "Avg: ",
                                formatMoney(stats.avgWonDealSize || 0)), color: "border-l-purple-500" }),
                        React.createElement(stats_card_1.StatsCard, { label: "Total Lost", value: React.createElement(React.Fragment, null, formatMoney(stats.totalLost || 0)), description: React.createElement(React.Fragment, null,
                                stats.lost,
                                " deals"), color: "border-l-green-500" }),
                        React.createElement(stats_card_1.StatsCard, { label: "Avg Closure Time", value: React.createElement(React.Fragment, null,
                                stats.closureTimeAsAvg,
                                " days"), description: "Avg deal lifecycle", color: "border-l-blue-500" })),
                    Object.keys(stats.byReason.wins).length > 0 && (React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, { className: "text-green-600 flex items-center gap-2" },
                                React.createElement(lucide_react_1.CheckCircle2, { className: "h-5 w-5" }),
                                " Top Win Reasons")),
                        React.createElement(card_1.CardContent, { className: "space-y-2" }, Object.entries(stats.byReason.wins)
                            .sort(function (_a, _b) {
                            var a = _a[1];
                            var b = _b[1];
                            return b - a;
                        })
                            .slice(0, 5)
                            .map(function (_a) {
                            var reason = _a[0], count = _a[1];
                            return (React.createElement("div", { key: reason, className: "flex justify-between items-center" },
                                React.createElement("span", null, reason),
                                React.createElement(badge_1.Badge, null, count)));
                        })))),
                    Object.keys(stats.byReason.losses).length > 0 && (React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, { className: "text-red-600 flex items-center gap-2" },
                                React.createElement(lucide_react_1.XCircle, { className: "h-5 w-5" }),
                                " Top Loss Reasons")),
                        React.createElement(card_1.CardContent, { className: "space-y-2" }, Object.entries(stats.byReason.losses)
                            .sort(function (_a, _b) {
                            var a = _a[1];
                            var b = _b[1];
                            return b - a;
                        })
                            .slice(0, 5)
                            .map(function (_a) {
                            var reason = _a[0], count = _a[1];
                            return (React.createElement("div", { key: reason, className: "flex justify-between items-center" },
                                React.createElement("span", null, reason),
                                React.createElement(badge_1.Badge, { variant: "destructive" }, count)));
                        })))))))),
            React.createElement(alert_dialog_1.AlertDialog, { open: !!moveDialog, onOpenChange: function (open) { return !open && setMoveDialog(null); } },
                React.createElement(alert_dialog_1.AlertDialogContent, null,
                    React.createElement(alert_dialog_1.AlertDialogHeader, null,
                        React.createElement(alert_dialog_1.AlertDialogTitle, null, (moveDialog === null || moveDialog === void 0 ? void 0 : moveDialog.newStage) === "closed_won" ? "Mark as Won" : "Mark as Lost"),
                        React.createElement(alert_dialog_1.AlertDialogDescription, null, (moveDialog === null || moveDialog === void 0 ? void 0 : moveDialog.newStage) === "closed_won"
                            ? "Why did we win this deal?"
                            : "Why did we lose this deal?")),
                    React.createElement(textarea_1.Textarea, { placeholder: (moveDialog === null || moveDialog === void 0 ? void 0 : moveDialog.newStage) === "closed_won"
                            ? "e.g., Best price, excellent service..."
                            : "e.g., Lost to competitor, budget constraints...", value: reasonText, onChange: function (e) { return setReasonText(e.target.value); }, rows: 3 }),
                    React.createElement("div", { className: "flex gap-2" },
                        React.createElement(alert_dialog_1.AlertDialogCancel, null, "Cancel"),
                        React.createElement(alert_dialog_1.AlertDialogAction, { onClick: handleConfirmMove, disabled: !reasonText }, "Confirm")))))));
}
exports["default"] = SalesPipeline;
