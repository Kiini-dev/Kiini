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
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var dialog_1 = require("@/components/ui/dialog");
var label_1 = require("@/components/ui/label");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var sonner_1 = require("sonner");
var COLUMNS = [
    { id: "lead", label: "New Leads", color: "bg-slate-50 dark:bg-slate-900/50", border: "border-t-slate-400", header: "text-slate-600 dark:text-slate-400" },
    { id: "qualified", label: "Qualified", color: "bg-blue-50 dark:bg-blue-900/10", border: "border-t-blue-500", header: "text-blue-600 dark:text-blue-400" },
    { id: "proposal", label: "Proposal Sent", color: "bg-violet-50 dark:bg-violet-900/10", border: "border-t-violet-500", header: "text-violet-600 dark:text-violet-400" },
    { id: "negotiation", label: "Negotiation", color: "bg-amber-50 dark:bg-amber-900/10", border: "border-t-amber-500", header: "text-amber-600 dark:text-amber-400" },
    { id: "closed_won", label: "Converted", color: "bg-emerald-50 dark:bg-emerald-900/10", border: "border-t-emerald-500", header: "text-emerald-600 dark:text-emerald-400" },
    { id: "closed_lost", label: "Lost", color: "bg-red-50 dark:bg-red-900/10", border: "border-t-red-500", header: "text-red-600 dark:text-red-400" },
];
var NEXT_STAGE = {
    lead: "qualified",
    qualified: "proposal",
    proposal: "negotiation",
    negotiation: "closed_won"
};
var PRIORITY_STYLES = {
    low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    high: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    urgent: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
};
function fmt(v) {
    if (v >= 1000000)
        return "$" + (v / 1000).toFixed(0) + "k";
    if (v >= 1000)
        return "$" + (v / 1000).toFixed(1) + "k";
    if (v >= 1000)
        return "$" + (v / 1000).toFixed(0) + "K";
    return "$" + v.toLocaleString();
}
function Leads() {
    var _a = react_1.useState(""), search = _a[0], setSearch = _a[1];
    var _b = react_1.useState("all"), priorityFilter = _b[0], setPriorityFilter = _b[1];
    var _c = react_1.useState("board"), layoutMode = _c[0], setLayoutMode = _c[1];
    var _d = react_1.useState(false), showAdd = _d[0], setShowAdd = _d[1];
    var _search = wouter_1.useSearch();
    var _e = wouter_1.useLocation(), navigate = _e[1];
    react_1.useEffect(function () { if (new URLSearchParams(_search).get("action") === "create")
        setShowAdd(true); }, []);
    var _f = react_1.useState({ title: "", value: "", stage: "lead", priority: "medium", source: "" }), form = _f[0], setForm = _f[1];
    var _g = trpc_1.trpc.opportunities.list.useQuery({}), _h = _g.data, opps = _h === void 0 ? [] : _h, isLoading = _g.isLoading, refetch = _g.refetch;
    var updateMutation = trpc_1.trpc.opportunities.update.useMutation({
        onSuccess: function () { refetch(); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var createMutation = trpc_1.trpc.opportunities.create.useMutation({
        onSuccess: function () { refetch(); setShowAdd(false); setForm({ title: "", value: "", stage: "lead", priority: "medium", source: "" }); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var leads = react_1.useMemo(function () {
        return opps.map(function (o) { return ({
            id: o.id,
            title: o.name || o.title || "Untitled",
            clientName: o.clientName || o.contactName || "",
            value: o.value || o.amount || 0,
            stage: (o.stage || "lead"),
            priority: o.priority || "medium",
            source: o.source || "",
            assignedTo: o.assignedToName || "",
            closeDate: o.expectedCloseDate || o.closeDate || ""
        }); });
    }, [opps]);
    var filtered = react_1.useMemo(function () { return leads.filter(function (l) {
        var _a;
        if (search && !l.title.toLowerCase().includes(search.toLowerCase()) && !((_a = l.clientName) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(search.toLowerCase())))
            return false;
        if (priorityFilter !== "all" && l.priority !== priorityFilter)
            return false;
        return true;
    }); }, [leads, search, priorityFilter]);
    var byStage = react_1.useMemo(function () {
        var m = { lead: [], qualified: [], proposal: [], negotiation: [], closed_won: [], closed_lost: [] };
        filtered.forEach(function (l) { (m[l.stage] || m.lead).push(l); });
        return m;
    }, [filtered]);
    var totalValue = react_1.useMemo(function () { return leads.filter(function (l) { return l.stage !== "closed_lost"; }).reduce(function (a, l) { return a + Number(l.value || 0); }, 0); }, [leads]);
    var wonValue = react_1.useMemo(function () { return leads.filter(function (l) { return l.stage === "closed_won"; }).reduce(function (a, l) { return a + Number(l.value || 0); }, 0); }, [leads]);
    function moveStage(lead, nextStage) {
        updateMutation.mutate({ id: String(lead.id), stage: nextStage });
    }
    function handleCreate(e) {
        e.preventDefault();
        if (!form.title.trim())
            return;
        createMutation.mutate({
            title: form.title,
            value: parseFloat(form.value) || 0,
            stage: form.stage,
            source: form.source
        });
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Leads", description: "Track and manage your sales pipeline from lead to close", icon: React.createElement(lucide_react_1.Target, { className: "h-5 w-5" }) },
        React.createElement("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5" },
            React.createElement("div", { className: "bg-card border rounded-lg p-4" },
                React.createElement("p", { className: "text-xs text-muted-foreground mb-1" }, "Total Leads"),
                React.createElement("p", { className: "text-2xl font-bold" }, leads.length)),
            React.createElement("div", { className: "bg-card border rounded-lg p-4" },
                React.createElement("p", { className: "text-xs text-muted-foreground mb-1" }, "Pipeline Value"),
                React.createElement("p", { className: "text-2xl font-bold text-violet-600" }, fmt(totalValue))),
            React.createElement("div", { className: "bg-card border rounded-lg p-4" },
                React.createElement("p", { className: "text-xs text-muted-foreground mb-1" }, "Converted"),
                React.createElement("p", { className: "text-2xl font-bold text-emerald-600" }, leads.filter(function (l) { return l.stage === "closed_won"; }).length)),
            React.createElement("div", { className: "bg-card border rounded-lg p-4" },
                React.createElement("p", { className: "text-xs text-muted-foreground mb-1" }, "Revenue Won"),
                React.createElement("p", { className: "text-2xl font-bold text-emerald-600" }, fmt(wonValue)))),
        React.createElement("div", { className: "flex flex-wrap items-center gap-3 mb-5" },
            React.createElement("div", { className: "relative flex-1 min-w-[200px]" },
                React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                React.createElement(input_1.Input, { placeholder: "Search leads...", value: search, onChange: function (e) { return setSearch(e.target.value); }, className: "pl-9" })),
            React.createElement(select_1.Select, { value: priorityFilter, onValueChange: setPriorityFilter },
                React.createElement(select_1.SelectTrigger, { className: "w-36" },
                    React.createElement(select_1.SelectValue, { placeholder: "Priority" })),
                React.createElement(select_1.SelectContent, null,
                    React.createElement(select_1.SelectItem, { value: "all" }, "All Priorities"),
                    React.createElement(select_1.SelectItem, { value: "low" }, "Low"),
                    React.createElement(select_1.SelectItem, { value: "medium" }, "Medium"),
                    React.createElement(select_1.SelectItem, { value: "high" }, "High"),
                    React.createElement(select_1.SelectItem, { value: "urgent" }, "Urgent"))),
            React.createElement("div", { className: "flex gap-1 border rounded-lg p-1 bg-muted" },
                React.createElement(button_1.Button, { variant: layoutMode === "board" ? "default" : "ghost", size: "sm", onClick: function () { return setLayoutMode("board"); }, className: "h-8", title: "Board View" },
                    React.createElement(lucide_react_1.Columns, { className: "h-4 w-4" })),
                React.createElement(button_1.Button, { variant: layoutMode === "grid" ? "default" : "ghost", size: "sm", onClick: function () { return setLayoutMode("grid"); }, className: "h-8", title: "Grid View" },
                    React.createElement(lucide_react_1.LayoutGrid, { className: "h-4 w-4" }))),
            React.createElement(button_1.Button, { className: "gap-2", onClick: function () { return setShowAdd(true); } },
                React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
                " Add Lead")),
        isLoading ? (React.createElement("div", { className: "flex items-center justify-center py-20" },
            React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-muted-foreground" }))) : layoutMode === "board" ? (React.createElement("div", { className: "flex gap-3 overflow-x-auto pb-4" }, COLUMNS.map(function (col) {
            var cards = byStage[col.id] || [];
            var colValue = cards.reduce(function (a, l) { return a + Number(l.value || 0); }, 0);
            return (React.createElement("div", { key: col.id, className: utils_1.cn("flex flex-col min-w-[240px] flex-1 rounded-lg border-t-4 border", col.border, col.color) },
                React.createElement("div", { className: "p-3 border-b" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("div", null,
                            React.createElement("h3", { className: utils_1.cn("font-semibold text-sm", col.header) }, col.label),
                            React.createElement("p", { className: "text-xs text-muted-foreground mt-0.5" },
                                fmt(colValue),
                                " \u00B7 ",
                                cards.length,
                                " leads")),
                        React.createElement(badge_1.Badge, { variant: "secondary", className: "text-xs" }, cards.length))),
                React.createElement("div", { className: "flex-1 p-2 space-y-2 overflow-y-auto max-h-[520px]" },
                    cards.length === 0 && (React.createElement("p", { className: "text-xs text-muted-foreground text-center py-6" }, "No leads here")),
                    cards.map(function (lead) {
                        var _a;
                        return (React.createElement("div", { key: lead.id, className: "bg-background border rounded-lg p-3 shadow-sm space-y-2 hover:shadow-md transition-shadow cursor-pointer", onClick: function () { return navigate("/leads/" + lead.id); } },
                            React.createElement("div", { className: "flex items-start justify-between gap-1" },
                                React.createElement("p", { className: "font-medium text-sm leading-tight" }, lead.title),
                                lead.priority && (React.createElement(badge_1.Badge, { variant: "outline", className: utils_1.cn("text-[10px] border-0 shrink-0", PRIORITY_STYLES[lead.priority]) }, lead.priority))),
                            lead.clientName && (React.createElement("p", { className: "text-xs text-muted-foreground flex items-center gap-1" },
                                React.createElement(lucide_react_1.User, { className: "h-3 w-3" }),
                                " ",
                                lead.clientName)),
                            Number(lead.value) > 0 && (React.createElement("p", { className: "text-xs font-medium text-emerald-600 flex items-center gap-1" },
                                React.createElement(lucide_react_1.DollarSign, { className: "h-3 w-3" }),
                                " ",
                                fmt(Number(lead.value)))),
                            lead.source && (React.createElement("p", { className: "text-xs text-muted-foreground flex items-center gap-1" },
                                React.createElement(lucide_react_1.Tag, { className: "h-3 w-3" }),
                                " ",
                                lead.source)),
                            lead.closeDate && (React.createElement("p", { className: "text-xs text-muted-foreground flex items-center gap-1" },
                                React.createElement(lucide_react_1.Calendar, { className: "h-3 w-3" }),
                                " ",
                                new Date(lead.closeDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }))),
                            NEXT_STAGE[col.id] && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "w-full h-7 text-xs gap-1 mt-1", disabled: updateMutation.isPending, onClick: function () { return moveStage(lead, NEXT_STAGE[col.id]); } },
                                "Move to ", (_a = COLUMNS.find(function (c) { return c.id === NEXT_STAGE[col.id]; })) === null || _a === void 0 ? void 0 :
                                _a.label,
                                React.createElement(lucide_react_1.ArrowRight, { className: "h-3 w-3" }))),
                            col.id === "negotiation" && (React.createElement("div", { className: "flex gap-1 mt-1" },
                                React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "flex-1 h-7 text-xs text-emerald-600 gap-1", disabled: updateMutation.isPending, onClick: function () { return moveStage(lead, "closed_won"); } },
                                    React.createElement(lucide_react_1.CheckCircle2, { className: "h-3 w-3" }),
                                    " Won"),
                                React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "flex-1 h-7 text-xs text-red-600 gap-1", disabled: updateMutation.isPending, onClick: function () { return moveStage(lead, "closed_lost"); } },
                                    React.createElement(lucide_react_1.XCircle, { className: "h-3 w-3" }),
                                    " Lost")))));
                    }))));
        }))) : (React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" }, filtered.length === 0 ? (React.createElement("div", { className: "col-span-full text-center py-12 text-muted-foreground" },
            React.createElement(lucide_react_1.Target, { className: "h-12 w-12 mx-auto opacity-50 mb-3" }),
            React.createElement("p", null, "No leads found matching your filters"))) : (filtered.map(function (lead) {
            var _a;
            return (React.createElement("div", { key: lead.id, className: "bg-card border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer space-y-3", onClick: function () { return navigate("/leads/" + lead.id); } },
                React.createElement("div", { className: "flex items-start justify-between gap-2" },
                    React.createElement("div", { className: "flex-1" },
                        React.createElement("h3", { className: "font-medium text-sm leading-tight" }, lead.title),
                        React.createElement("p", { className: "text-xs text-muted-foreground mt-1 flex items-center gap-1" },
                            React.createElement(lucide_react_1.User, { className: "h-3 w-3" }),
                            " ",
                            lead.clientName || "No client")),
                    lead.priority && (React.createElement(badge_1.Badge, { className: utils_1.cn("text-[10px] border-0", PRIORITY_STYLES[lead.priority]) }, lead.priority))),
                React.createElement("div", { className: "grid grid-cols-2 gap-2 pt-2 border-t text-xs" },
                    React.createElement("div", null,
                        React.createElement("p", { className: "text-muted-foreground" }, "Value"),
                        React.createElement("p", { className: "font-medium text-emerald-600" }, Number(lead.value) > 0 ? fmt(Number(lead.value)) : "—")),
                    React.createElement("div", null,
                        React.createElement("p", { className: "text-muted-foreground" }, "Stage"),
                        React.createElement("p", { className: "font-medium" }, (_a = COLUMNS.find(function (c) { return c.id === lead.stage; })) === null || _a === void 0 ? void 0 : _a.label))),
                lead.source && (React.createElement("div", { className: "flex items-center gap-1 text-xs text-muted-foreground" },
                    React.createElement(lucide_react_1.Tag, { className: "h-3 w-3" }),
                    " ",
                    lead.source)),
                lead.closeDate && (React.createElement("div", { className: "flex items-center gap-1 text-xs text-muted-foreground" },
                    React.createElement(lucide_react_1.Calendar, { className: "h-3 w-3" }),
                    " ",
                    new Date(lead.closeDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }))),
                React.createElement("div", { className: "flex gap-2 pt-2" },
                    NEXT_STAGE[lead.stage] && (React.createElement(button_1.Button, { variant: "outline", size: "sm", className: "flex-1 h-7 text-xs", disabled: updateMutation.isPending, onClick: function (e) {
                            e.stopPropagation();
                            moveStage(lead, NEXT_STAGE[lead.stage]);
                        } },
                        "Move ",
                        React.createElement(lucide_react_1.ArrowRight, { className: "h-3 w-3 ml-1" }))),
                    lead.stage === "negotiation" && (React.createElement(React.Fragment, null,
                        React.createElement(button_1.Button, { size: "sm", className: "flex-1 h-7 text-xs text-white bg-emerald-600 hover:bg-emerald-700", disabled: updateMutation.isPending, onClick: function (e) {
                                e.stopPropagation();
                                moveStage(lead, "closed_won");
                            } }, "Won"),
                        React.createElement(button_1.Button, { variant: "destructive", size: "sm", className: "flex-1 h-7 text-xs", disabled: updateMutation.isPending, onClick: function (e) {
                                e.stopPropagation();
                                moveStage(lead, "closed_lost");
                            } }, "Lost"))))));
        })))),
        React.createElement(dialog_1.Dialog, { open: showAdd, onOpenChange: setShowAdd },
            React.createElement(dialog_1.DialogContent, { className: "max-w-md" },
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Target, { className: "h-5 w-5" }),
                        " Add Lead")),
                React.createElement("form", { onSubmit: handleCreate, className: "space-y-4" },
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "lead-title" }, "Lead Title *"),
                        React.createElement(input_1.Input, { id: "lead-title", value: form.title, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { title: e.target.value })); }); }, placeholder: "e.g. Website Redesign for Acme", className: "mt-1", required: true })),
                    React.createElement("div", { className: "grid grid-cols-2 gap-3" },
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "lead-value" }, "Value ($)"),
                            React.createElement(input_1.Input, { id: "lead-value", type: "number", min: "0", step: "0.01", value: form.value, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { value: e.target.value })); }); }, placeholder: "0.00", className: "mt-1" })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "lead-stage" }, "Stage"),
                            React.createElement(select_1.Select, { value: form.stage, onValueChange: function (v) { return setForm(function (f) { return (__assign(__assign({}, f), { stage: v })); }); } },
                                React.createElement(select_1.SelectTrigger, { className: "mt-1", id: "lead-stage" },
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null, COLUMNS.map(function (c) { return React.createElement(select_1.SelectItem, { key: c.id, value: c.id }, c.label); }))))),
                    React.createElement("div", { className: "grid grid-cols-2 gap-3" },
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "lead-priority" }, "Priority"),
                            React.createElement(select_1.Select, { value: form.priority, onValueChange: function (v) { return setForm(function (f) { return (__assign(__assign({}, f), { priority: v })); }); } },
                                React.createElement(select_1.SelectTrigger, { className: "mt-1", id: "lead-priority" },
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "low" }, "Low"),
                                    React.createElement(select_1.SelectItem, { value: "medium" }, "Medium"),
                                    React.createElement(select_1.SelectItem, { value: "high" }, "High"),
                                    React.createElement(select_1.SelectItem, { value: "urgent" }, "Urgent")))),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "lead-source" }, "Source"),
                            React.createElement(input_1.Input, { id: "lead-source", value: form.source, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { source: e.target.value })); }); }, placeholder: "Referral, Web, etc.", className: "mt-1" }))),
                    React.createElement("div", { className: "flex justify-end gap-2 pt-2" },
                        React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return setShowAdd(false); } }, "Cancel"),
                        React.createElement(button_1.Button, { type: "submit", disabled: createMutation.isPending, className: "gap-2" },
                            createMutation.isPending && React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin" }),
                            "Add Lead")))))));
}
exports["default"] = Leads;
