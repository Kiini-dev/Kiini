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
var wouter_1 = require("wouter");
var OrgLayout_1 = require("@/components/OrgLayout");
var OrgBreadcrumb_1 = require("@/components/OrgBreadcrumb");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var skeleton_1 = require("@/components/ui/skeleton");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var textarea_1 = require("@/components/ui/textarea");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var STAGE_ORDER = ["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"];
var STAGE_META = {
    lead: { label: "Lead", color: "text-blue-400", headerBg: "bg-blue-500/10 border-blue-500/20" },
    qualified: { label: "Qualified", color: "text-cyan-400", headerBg: "bg-cyan-500/10 border-cyan-500/20" },
    proposal: { label: "Proposal", color: "text-yellow-400", headerBg: "bg-yellow-500/10 border-yellow-500/20" },
    negotiation: { label: "Negotiating", color: "text-orange-400", headerBg: "bg-orange-500/10 border-orange-500/20" },
    closed_won: { label: "Won ✓", color: "text-green-400", headerBg: "bg-green-500/10 border-green-500/20" },
    closed_lost: { label: "Lost", color: "text-red-400", headerBg: "bg-red-500/10 border-red-500/20" }
};
function formatCurrency(n) {
    if (n >= 1000000)
        return "KES " + (n / 1000000).toFixed(1) + "M";
    if (n >= 1000)
        return "KES " + (n / 1000).toFixed(1) + "K";
    return "KES " + n.toFixed(0);
}
function OrgSalesPipeline() {
    var _a, _b, _c;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _d = react_1.useState(null), draggedId = _d[0], setDraggedId = _d[1];
    var _e = react_1.useState(null), dragSource = _e[0], setDragSource = _e[1];
    var _f = react_1.useState(false), createOpen = _f[0], setCreateOpen = _f[1];
    var _g = react_1.useState(null), moveDialog = _g[0], setMoveDialog = _g[1];
    var _h = react_1.useState(""), reasonText = _h[0], setReasonText = _h[1];
    var _j = react_1.useState({
        clientId: "", title: "", description: "", value: 0,
        probability: 50, expectedCloseDate: "", source: ""
    }), form = _j[0], setForm = _j[1];
    var orgData = trpc_1.trpc.multiTenancy.getMyOrg.useQuery(undefined, { staleTime: 300000 }).data;
    var featureMap = (_a = orgData === null || orgData === void 0 ? void 0 : orgData.featureMap) !== null && _a !== void 0 ? _a : {};
    var hasAccess = !orgData || featureMap.crm;
    var boardQuery = trpc_1.trpc.salesPipeline.getPipelineBoard.useQuery(undefined, { enabled: !!hasAccess });
    var clientsQuery = trpc_1.trpc.clients.list.useQuery(undefined, { enabled: !!hasAccess });
    var createMutation = trpc_1.trpc.salesPipeline.create.useMutation({
        onSuccess: function () { sonner_1.toast.success("Opportunity created"); boardQuery.refetch(); setCreateOpen(false); setForm({ clientId: "", title: "", description: "", value: 0, probability: 50, expectedCloseDate: "", source: "" }); },
        onError: function (e) { return sonner_1.toast.error(e.message || "Failed to create"); }
    });
    var moveMutation = trpc_1.trpc.salesPipeline.moveOpportunity.useMutation({
        onSuccess: function () { sonner_1.toast.success("Deal moved"); boardQuery.refetch(); setMoveDialog(null); setReasonText(""); },
        onError: function (e) { return sonner_1.toast.error(e.message || "Failed to move"); }
    });
    var handleDragStart = function (e, oppId, stage) {
        setDraggedId(oppId);
        setDragSource(stage);
        e.dataTransfer.effectAllowed = "move";
    };
    var handleDrop = function (e, targetStage) {
        e.preventDefault();
        if (!draggedId || dragSource === targetStage) {
            setDraggedId(null);
            return;
        }
        if (targetStage === "closed_won" || targetStage === "closed_lost") {
            setMoveDialog({ oppId: draggedId, newStage: targetStage });
        }
        else {
            moveMutation.mutate({ id: draggedId, newStage: targetStage });
        }
        setDraggedId(null);
        setDragSource(null);
    };
    var handleConfirmMove = function () {
        if (!moveDialog)
            return;
        if (!reasonText) {
            sonner_1.toast.error("Please provide a reason");
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
    var board = boardQuery.data;
    var clients = clientsQuery.data || [];
    // Stats
    var allOpps = (_c = (_b = board === null || board === void 0 ? void 0 : board.stages) === null || _b === void 0 ? void 0 : _b.flatMap(function (s) { return s.opportunities; })) !== null && _c !== void 0 ? _c : [];
    var wonOpps = allOpps.filter(function (o) { return o.stage === "closed_won"; });
    var activeOpps = allOpps.filter(function (o) { return !["closed_won", "closed_lost"].includes(o.stage); });
    var totalPipeline = activeOpps.reduce(function (s, o) { return s + (o.value || 0); }, 0);
    var weightedForecast = activeOpps.reduce(function (s, o) { return s + (o.value || 0) * ((o.probability || 0) / 100); }, 0);
    if (!hasAccess) {
        return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Sales Pipeline" },
            react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                react_1["default"].createElement(card_1.CardContent, { className: "py-20 text-center" },
                    react_1["default"].createElement(lucide_react_1.Lock, { className: "h-12 w-12 text-white/20 mx-auto mb-4" }),
                    react_1["default"].createElement("p", { className: "text-white font-semibold text-lg" }, "CRM Access Required"),
                    react_1["default"].createElement("p", { className: "text-white/50 text-sm mt-2" }, "Enable the CRM module to use the sales pipeline.")))));
    }
    return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Sales Pipeline" },
        react_1["default"].createElement("div", { className: "space-y-5" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [{ label: "Sales Pipeline" }] }),
                react_1["default"].createElement(button_1.Button, { size: "sm", className: "bg-blue-600 hover:bg-blue-700 text-white", onClick: function () { return setCreateOpen(true); } },
                    react_1["default"].createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                    " Add Deal")),
            react_1["default"].createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3" }, boardQuery.isLoading ? (Array.from({ length: 4 }).map(function (_, i) { return react_1["default"].createElement(skeleton_1.Skeleton, { key: i, className: "h-20 bg-white/5 rounded-lg" }); })) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                react_1["default"].createElement(card_1.Card, { className: "bg-blue-600/10 border-blue-500/20" },
                    react_1["default"].createElement(card_1.CardContent, { className: "pt-4 pb-3" },
                        react_1["default"].createElement("p", { className: "text-xs text-blue-300/70 uppercase tracking-wide" }, "Active Deals"),
                        react_1["default"].createElement("p", { className: "text-2xl font-bold text-white mt-1" }, activeOpps.length))),
                react_1["default"].createElement(card_1.Card, { className: "bg-purple-600/10 border-purple-500/20" },
                    react_1["default"].createElement(card_1.CardContent, { className: "pt-4 pb-3" },
                        react_1["default"].createElement("p", { className: "text-xs text-purple-300/70 uppercase tracking-wide" }, "Pipeline Value"),
                        react_1["default"].createElement("p", { className: "text-2xl font-bold text-white mt-1" }, formatCurrency(totalPipeline)))),
                react_1["default"].createElement(card_1.Card, { className: "bg-teal-600/10 border-teal-500/20" },
                    react_1["default"].createElement(card_1.CardContent, { className: "pt-4 pb-3" },
                        react_1["default"].createElement("p", { className: "text-xs text-teal-300/70 uppercase tracking-wide" }, "Weighted Forecast"),
                        react_1["default"].createElement("p", { className: "text-2xl font-bold text-white mt-1" }, formatCurrency(weightedForecast)))),
                react_1["default"].createElement(card_1.Card, { className: "bg-green-600/10 border-green-500/20" },
                    react_1["default"].createElement(card_1.CardContent, { className: "pt-4 pb-3" },
                        react_1["default"].createElement("p", { className: "text-xs text-green-300/70 uppercase tracking-wide" }, "Won This Period"),
                        react_1["default"].createElement("p", { className: "text-2xl font-bold text-white mt-1" }, wonOpps.length)))))),
            boardQuery.isLoading ? (react_1["default"].createElement("div", { className: "flex gap-3 overflow-x-auto pb-2" }, Array.from({ length: 6 }).map(function (_, i) { return react_1["default"].createElement(skeleton_1.Skeleton, { key: i, className: "h-64 w-52 shrink-0 bg-white/5 rounded-lg" }); }))) : (react_1["default"].createElement("div", { className: "flex gap-3 overflow-x-auto pb-4", style: { minHeight: 400 } }, STAGE_ORDER.map(function (stageId) {
                var _a, _b;
                var meta = STAGE_META[stageId];
                var stageData = (_a = board === null || board === void 0 ? void 0 : board.stages) === null || _a === void 0 ? void 0 : _a.find(function (s) { return s.id === stageId; });
                var opps = (_b = stageData === null || stageData === void 0 ? void 0 : stageData.opportunities) !== null && _b !== void 0 ? _b : [];
                var stageValue = opps.reduce(function (s, o) { return s + (o.value || 0); }, 0);
                return (react_1["default"].createElement("div", { key: stageId, className: "shrink-0 w-52 sm:w-60 flex flex-col rounded-xl border bg-white/3 border-white/10", onDragOver: function (e) { return e.preventDefault(); }, onDrop: function (e) { return handleDrop(e, stageId); } },
                    react_1["default"].createElement("div", { className: "flex items-center justify-between px-3 py-2.5 rounded-t-xl border-b " + meta.headerBg },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("p", { className: "text-xs font-semibold uppercase tracking-wide " + meta.color }, meta.label),
                            react_1["default"].createElement("p", { className: "text-[10px] text-white/40 mt-0.5" }, formatCurrency(stageValue))),
                        react_1["default"].createElement(badge_1.Badge, { variant: "outline", className: "border-white/10 text-white/50 text-[10px] h-5" }, opps.length)),
                    react_1["default"].createElement("div", { className: "flex flex-col gap-2 p-2 flex-1 overflow-y-auto", style: { maxHeight: 480 } }, opps.length === 0 ? (react_1["default"].createElement("div", { className: "flex-1 flex flex-col items-center justify-center py-8 text-white/20 text-xs text-center gap-1" },
                        react_1["default"].createElement(lucide_react_1.Target, { className: "h-6 w-6 opacity-40" }),
                        react_1["default"].createElement("span", null, "Drop deals here"))) : (opps.map(function (opp) { return (react_1["default"].createElement("div", { key: opp.id, draggable: true, onDragStart: function (e) { return handleDragStart(e, opp.id, stageId); }, className: "group rounded-lg bg-white/5 border border-white/10 p-3 cursor-grab active:cursor-grabbing hover:bg-white/8 hover:border-white/20 transition-all " + (draggedId === opp.id ? "opacity-40 scale-95" : "") },
                        react_1["default"].createElement("div", { className: "flex items-start justify-between gap-1.5" },
                            react_1["default"].createElement("p", { className: "text-xs font-semibold text-white leading-snug line-clamp-2" }, opp.title),
                            react_1["default"].createElement(lucide_react_1.GripVertical, { className: "h-3.5 w-3.5 text-white/20 shrink-0 mt-0.5 group-hover:text-white/40" })),
                        react_1["default"].createElement("p", { className: "text-sm font-bold text-white/90 mt-1.5" }, formatCurrency(opp.value)),
                        react_1["default"].createElement("div", { className: "flex items-center justify-between mt-2" },
                            react_1["default"].createElement("span", { className: "text-[10px] text-white/40" },
                                opp.probability,
                                "% likely"),
                            opp.expectedCloseDate && (react_1["default"].createElement("span", { className: "text-[10px] text-white/40" }, new Date(opp.expectedCloseDate).toLocaleDateString("en-KE", { month: "short", day: "numeric" })))),
                        react_1["default"].createElement("div", { className: "mt-2 h-1 rounded-full bg-white/10 overflow-hidden" },
                            react_1["default"].createElement("div", { className: "h-full rounded-full bg-blue-500", style: { width: opp.probability + "%" } })))); })))));
            })))),
        react_1["default"].createElement(dialog_1.Dialog, { open: createOpen, onOpenChange: setCreateOpen },
            react_1["default"].createElement(dialog_1.DialogContent, { className: "max-w-md bg-[#1a1f2e] border-white/10" },
                react_1["default"].createElement(dialog_1.DialogHeader, null,
                    react_1["default"].createElement(dialog_1.DialogTitle, { className: "text-white" }, "New Opportunity")),
                react_1["default"].createElement("div", { className: "space-y-3 mt-2" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { className: "text-white/70 text-xs" }, "Client *"),
                        react_1["default"].createElement(select_1.Select, { value: form.clientId, onValueChange: function (v) { return setForm(__assign(__assign({}, form), { clientId: v })); } },
                            react_1["default"].createElement(select_1.SelectTrigger, { className: "mt-1 bg-white/5 border-white/10 text-white" },
                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select client..." })),
                            react_1["default"].createElement(select_1.SelectContent, null, clients.map(function (c) { return (react_1["default"].createElement(select_1.SelectItem, { key: c.id, value: c.id }, c.name || c.company)); })))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { className: "text-white/70 text-xs" }, "Deal Title *"),
                        react_1["default"].createElement(input_1.Input, { className: "mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/30", placeholder: "e.g. Website Redesign Project", value: form.title, onChange: function (e) { return setForm(__assign(__assign({}, form), { title: e.target.value })); } })),
                    react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-3" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement(label_1.Label, { className: "text-white/70 text-xs" }, "Deal Value (KES)"),
                            react_1["default"].createElement(input_1.Input, { type: "number", className: "mt-1 bg-white/5 border-white/10 text-white", value: form.value || "", onChange: function (e) { return setForm(__assign(__assign({}, form), { value: Number(e.target.value) })); } })),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement(label_1.Label, { className: "text-white/70 text-xs" }, "Probability (%)"),
                            react_1["default"].createElement(input_1.Input, { type: "number", min: 0, max: 100, className: "mt-1 bg-white/5 border-white/10 text-white", value: form.probability, onChange: function (e) { return setForm(__assign(__assign({}, form), { probability: Number(e.target.value) })); } }))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { className: "text-white/70 text-xs" }, "Expected Close Date"),
                        react_1["default"].createElement(input_1.Input, { type: "date", className: "mt-1 bg-white/5 border-white/10 text-white", value: form.expectedCloseDate, onChange: function (e) { return setForm(__assign(__assign({}, form), { expectedCloseDate: e.target.value })); } })),
                    react_1["default"].createElement("div", { className: "flex justify-end gap-2 pt-2" },
                        react_1["default"].createElement(button_1.Button, { variant: "ghost", className: "text-white/50 hover:text-white", onClick: function () { return setCreateOpen(false); } }, "Cancel"),
                        react_1["default"].createElement(button_1.Button, { className: "bg-blue-600 hover:bg-blue-700 text-white", onClick: function () {
                                if (!form.clientId || !form.title) {
                                    sonner_1.toast.error("Client and title are required");
                                    return;
                                }
                                createMutation.mutate({
                                    clientId: form.clientId,
                                    title: form.title,
                                    value: form.value,
                                    probability: form.probability,
                                    expectedCloseDate: form.expectedCloseDate ? form.expectedCloseDate + "T12:00:00Z" : undefined,
                                    source: form.source || undefined
                                });
                            }, disabled: createMutation.isPending }, createMutation.isPending ? "Creating..." : "Create Deal"))))),
        react_1["default"].createElement(dialog_1.Dialog, { open: !!moveDialog, onOpenChange: function () { setMoveDialog(null); setReasonText(""); } },
            react_1["default"].createElement(dialog_1.DialogContent, { className: "max-w-sm bg-[#1a1f2e] border-white/10" },
                react_1["default"].createElement(dialog_1.DialogHeader, null,
                    react_1["default"].createElement(dialog_1.DialogTitle, { className: "text-white" }, (moveDialog === null || moveDialog === void 0 ? void 0 : moveDialog.newStage) === "closed_won" ? "Mark as Won 🎉" : "Mark as Lost")),
                react_1["default"].createElement("div", { className: "space-y-3 mt-2" },
                    react_1["default"].createElement(label_1.Label, { className: "text-white/70 text-xs" },
                        (moveDialog === null || moveDialog === void 0 ? void 0 : moveDialog.newStage) === "closed_won" ? "Win reason" : "Loss reason",
                        " *"),
                    react_1["default"].createElement(textarea_1.Textarea, { className: "bg-white/5 border-white/10 text-white placeholder:text-white/30", placeholder: (moveDialog === null || moveDialog === void 0 ? void 0 : moveDialog.newStage) === "closed_won" ? "e.g. Strong relationship, competitive pricing" : "e.g. Budget constraints, went with competitor", value: reasonText, onChange: function (e) { return setReasonText(e.target.value); }, rows: 3 }),
                    react_1["default"].createElement("div", { className: "flex justify-end gap-2" },
                        react_1["default"].createElement(button_1.Button, { variant: "ghost", className: "text-white/50", onClick: function () { setMoveDialog(null); setReasonText(""); } }, "Cancel"),
                        react_1["default"].createElement(button_1.Button, { className: (moveDialog === null || moveDialog === void 0 ? void 0 : moveDialog.newStage) === "closed_won" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700", onClick: handleConfirmMove, disabled: moveMutation.isPending }, "Confirm")))))));
}
exports["default"] = OrgSalesPipeline;
