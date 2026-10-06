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
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var card_1 = require("@/components/ui/card");
var spinner_1 = require("@/components/ui/spinner");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var trpc_1 = require("@/lib/trpc");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var sonner_1 = require("sonner");
var PRIORITY_STYLES = {
    low: { badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", text: "Low" },
    medium: { badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300", text: "Medium" },
    high: { badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300", text: "High" },
    urgent: { badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300", text: "Urgent" }
};
var STAGE_STYLES = {
    lead: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    qualified: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    proposal: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    negotiation: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    closed_won: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    closed_lost: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
};
var STAGE_LABELS = {
    lead: "New Lead",
    qualified: "Qualified",
    proposal: "Proposal Sent",
    negotiation: "Negotiation",
    closed_won: "Converted",
    closed_lost: "Lost"
};
function LeadsDetails() {
    var _a, _b;
    var _c = wouter_1.useRoute("/leads/:id"), match = _c[0], params = _c[1];
    var _d = wouter_1.useLocation(), navigate = _d[1];
    var _e = react_1.useState(false), isEditing = _e[0], setIsEditing = _e[1];
    var _f = react_1.useState(null), editData = _f[0], setEditData = _f[1];
    var leadId = params === null || params === void 0 ? void 0 : params.id;
    // Fetch lead details
    var _g = trpc_1.trpc.leads.getById.useQuery({ id: leadId }, { enabled: !!leadId, refetchOnWindowFocus: false }), lead = _g.data, isLoading = _g.isLoading, refetch = _g.refetch;
    var updateMutation = trpc_1.trpc.leads.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Lead updated successfully");
            setIsEditing(false);
            refetch();
        },
        onError: function () {
            sonner_1.toast.error("Failed to update lead");
        }
    });
    var deleteMutation = trpc_1.trpc.leads["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Lead deleted successfully");
            navigate("/leads");
        },
        onError: function () {
            sonner_1.toast.error("Failed to delete lead");
        }
    });
    var handleEdit = function () {
        if (lead) {
            setEditData({
                id: lead.id,
                title: lead.title || "",
                clientName: lead.clientName || "",
                email: lead.email || "",
                phone: lead.phone || "",
                stage: lead.stage || "lead",
                priority: lead.priority || "medium",
                value: lead.value || 0,
                source: lead.source || "",
                notes: lead.notes || "",
                assignedTo: lead.assignedTo || ""
            });
            setIsEditing(true);
        }
    };
    var handleSave = function () {
        if (!editData)
            return;
        updateMutation.mutate(editData);
    };
    var handleDelete = function () {
        if (confirm("Are you sure you want to delete this lead?")) {
            deleteMutation.mutate({ id: leadId });
        }
    };
    if (!match || !leadId)
        return null;
    if (isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, null,
            React.createElement("div", { className: "flex items-center justify-center h-96" },
                React.createElement(spinner_1.Spinner, { className: "size-8" }))));
    }
    if (!lead) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, null,
            React.createElement("div", { className: "flex flex-col items-center justify-center h-96 gap-4" },
                React.createElement("p", { className: "text-muted-foreground" }, "Lead not found"),
                React.createElement(button_1.Button, { onClick: function () { return navigate("/leads"); } }, "Back to Leads"))));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: lead.title || "Lead Details" },
        React.createElement("div", { className: "max-w-6xl mx-auto" },
            React.createElement("div", { className: "flex items-start justify-between mb-6 gap-4 flex-wrap" },
                React.createElement("div", { className: "flex items-start gap-4 flex-1 min-w-0" },
                    React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { return navigate("/leads"); }, className: "flex-shrink-0" },
                        React.createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4" })),
                    React.createElement("div", { className: "flex-1 min-w-0" },
                        React.createElement("h1", { className: "text-3xl font-bold truncate" }, lead.title),
                        React.createElement("p", { className: "text-muted-foreground" }, lead.clientName))),
                React.createElement("div", { className: "flex gap-2 flex-wrap sm:flex-nowrap" },
                    React.createElement(button_1.Button, { onClick: handleEdit, variant: "outline", size: "sm" },
                        React.createElement(lucide_react_1.Edit, { className: "h-4 w-4 mr-2" }),
                        "Edit"),
                    React.createElement(button_1.Button, { onClick: handleDelete, variant: "destructive", size: "sm" },
                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4 mr-2" }),
                        "Delete"))),
            React.createElement("div", { className: "flex gap-2 mb-6 flex-wrap" },
                React.createElement(badge_1.Badge, { className: utils_1.cn("text-sm", STAGE_STYLES[lead.stage || "lead"]) }, STAGE_LABELS[lead.stage || "lead"]),
                lead.priority && (React.createElement(badge_1.Badge, { className: utils_1.cn("text-sm", (_a = PRIORITY_STYLES[lead.priority]) === null || _a === void 0 ? void 0 : _a.badge) }, (_b = PRIORITY_STYLES[lead.priority]) === null || _b === void 0 ? void 0 : _b.text))),
            React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6" },
                React.createElement("div", { className: "lg:col-span-2" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, { className: "text-lg" }, "Contact Information")),
                        React.createElement(card_1.CardContent, { className: "space-y-4" },
                            lead.email && (React.createElement("div", { className: "flex items-center gap-3" },
                                React.createElement(lucide_react_1.Mail, { className: "h-5 w-5 text-muted-foreground" }),
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "Email"),
                                    React.createElement("a", { href: "mailto:" + lead.email, className: "font-medium hover:text-blue-600" }, lead.email)))),
                            lead.phone && (React.createElement("div", { className: "flex items-center gap-3" },
                                React.createElement(lucide_react_1.Phone, { className: "h-5 w-5 text-muted-foreground" }),
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "Phone"),
                                    React.createElement("a", { href: "tel:" + lead.phone, className: "font-medium hover:text-blue-600" }, lead.phone)))),
                            lead.source && (React.createElement("div", { className: "flex items-center gap-3" },
                                React.createElement(lucide_react_1.Tag, { className: "h-5 w-5 text-muted-foreground" }),
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "Source"),
                                    React.createElement("p", { className: "font-medium" }, lead.source)))))),
                    lead.notes && (React.createElement(card_1.Card, { className: "mt-6" },
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, { className: "text-lg" }, "Notes")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("p", { className: "text-sm whitespace-pre-wrap" }, lead.notes))))),
                React.createElement("div", { className: "space-y-4" },
                    lead.value && (React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, { className: "pb-3" },
                            React.createElement(card_1.CardTitle, { className: "text-sm flex items-center gap-2" },
                                React.createElement(lucide_react_1.DollarSign, { className: "h-4 w-4" }),
                                "Potential Value")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("p", { className: "text-2xl font-bold" },
                                "$",
                                Number(lead.value).toLocaleString())))),
                    lead.assignedTo && (React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, { className: "pb-3" },
                            React.createElement(card_1.CardTitle, { className: "text-sm flex items-center gap-2" },
                                React.createElement(lucide_react_1.User, { className: "h-4 w-4" }),
                                "Assigned To")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("p", { className: "font-medium" }, lead.assignedTo)))),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, { className: "pb-3" },
                            React.createElement(card_1.CardTitle, { className: "text-sm flex items-center gap-2" },
                                React.createElement(lucide_react_1.Calendar, { className: "h-4 w-4" }),
                                "Created")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("p", { className: "text-sm" }, new Date(lead.createdAt || new Date()).toLocaleDateString())))))),
        React.createElement(dialog_1.Dialog, { open: isEditing, onOpenChange: setIsEditing },
            React.createElement(dialog_1.DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto" },
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "Edit Lead")),
                editData && (React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", null,
                        React.createElement(label_1.Label, null, "Title"),
                        React.createElement(input_1.Input, { value: editData.title, onChange: function (e) { return setEditData(__assign(__assign({}, editData), { title: e.target.value })); }, placeholder: "Lead title" })),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, null, "Client Name"),
                        React.createElement(input_1.Input, { value: editData.clientName, onChange: function (e) { return setEditData(__assign(__assign({}, editData), { clientName: e.target.value })); }, placeholder: "Client name" })),
                    React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                        React.createElement("div", null,
                            React.createElement(label_1.Label, null, "Email"),
                            React.createElement(input_1.Input, { value: editData.email, onChange: function (e) { return setEditData(__assign(__assign({}, editData), { email: e.target.value })); }, placeholder: "email@example.com" })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, null, "Phone"),
                            React.createElement(input_1.Input, { value: editData.phone, onChange: function (e) { return setEditData(__assign(__assign({}, editData), { phone: e.target.value })); }, placeholder: "+1 (555) 000-0000" }))),
                    React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                        React.createElement("div", null,
                            React.createElement(label_1.Label, null, "Stage"),
                            React.createElement(select_1.Select, { value: editData.stage, onValueChange: function (val) { return setEditData(__assign(__assign({}, editData), { stage: val })); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "lead" }, "New Lead"),
                                    React.createElement(select_1.SelectItem, { value: "qualified" }, "Qualified"),
                                    React.createElement(select_1.SelectItem, { value: "proposal" }, "Proposal Sent"),
                                    React.createElement(select_1.SelectItem, { value: "negotiation" }, "Negotiation"),
                                    React.createElement(select_1.SelectItem, { value: "closed_won" }, "Converted"),
                                    React.createElement(select_1.SelectItem, { value: "closed_lost" }, "Lost")))),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, null, "Priority"),
                            React.createElement(select_1.Select, { value: editData.priority, onValueChange: function (val) { return setEditData(__assign(__assign({}, editData), { priority: val })); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "low" }, "Low"),
                                    React.createElement(select_1.SelectItem, { value: "medium" }, "Medium"),
                                    React.createElement(select_1.SelectItem, { value: "high" }, "High"),
                                    React.createElement(select_1.SelectItem, { value: "urgent" }, "Urgent"))))),
                    React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                        React.createElement("div", null,
                            React.createElement(label_1.Label, null, "Value"),
                            React.createElement(input_1.Input, { type: "number", value: editData.value, onChange: function (e) { return setEditData(__assign(__assign({}, editData), { value: e.target.value })); }, placeholder: "0" })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, null, "Source"),
                            React.createElement(input_1.Input, { value: editData.source, onChange: function (e) { return setEditData(__assign(__assign({}, editData), { source: e.target.value })); }, placeholder: "How did you find this lead?" }))),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, null, "Notes"),
                        React.createElement(textarea_1.Textarea, { value: editData.notes, onChange: function (e) { return setEditData(__assign(__assign({}, editData), { notes: e.target.value })); }, placeholder: "Additional notes...", rows: 4 })),
                    React.createElement("div", { className: "flex gap-2 justify-end pt-4" },
                        React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setIsEditing(false); } }, "Cancel"),
                        React.createElement(button_1.Button, { onClick: handleSave, disabled: updateMutation.isPending }, updateMutation.isPending ? "Saving..." : "Save"))))))));
}
exports["default"] = LeadsDetails;
