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
var OrgLayout_1 = require("@/components/OrgLayout");
var react_1 = require("react");
var wouter_1 = require("wouter");
var trpc_1 = require("@/lib/trpc");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var dialog_1 = require("@/components/ui/dialog");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var sonner_1 = require("sonner");
var useOrgPermission_1 = require("@/hooks/useOrgPermission");
var COLUMNS = [
    { id: "lead", label: "New Leads", color: "bg-slate-50 dark:bg-slate-900/50", border: "border-t-slate-400", header: "text-slate-600 dark:text-slate-400" },
    { id: "qualified", label: "Qualified", color: "bg-blue-50 dark:bg-blue-900/10", border: "border-t-blue-500", header: "text-blue-600 dark:text-blue-400" },
    { id: "proposal", label: "Proposal Sent", color: "bg-violet-50 dark:bg-violet-900/10", border: "border-t-violet-500", header: "text-violet-600 dark:text-violet-400" },
    { id: "negotiation", label: "Negotiation", color: "bg-amber-50 dark:bg-amber-900/10", border: "border-t-amber-500", header: "text-amber-600 dark:text-amber-400" },
    { id: "closed_won", label: "Converted", color: "bg-emerald-50 dark:bg-emerald-900/10", border: "border-t-emerald-500", header: "text-emerald-600 dark:text-emerald-400" },
    { id: "closed_lost", label: "Lost", color: "bg-red-50 dark:bg-red-900/10", border: "border-t-red-500", header: "text-red-600 dark:text-red-400" },
];
var emptyForm = {
    name: "",
    email: "",
    phone: "",
    company: "",
    value: 0,
    source: "",
    notes: "",
    stage: "lead"
};
function OrgLeads() {
    var slug = wouter_1.useParams().slug;
    var _a = wouter_1.useLocation(), location = _a[0], navigate = _a[1];
    var search = wouter_1.useSearch();
    var searchParams = new URLSearchParams(search);
    var initialView = searchParams.get("view") === "kanban" ? "kanban" : "list";
    var _b = react_1.useState(initialView), view = _b[0], setView = _b[1];
    var _c = react_1.useState(""), searchTerm = _c[0], setSearchTerm = _c[1];
    var _d = react_1.useState(false), showDialog = _d[0], setShowDialog = _d[1];
    var _e = react_1.useState(null), editingId = _e[0], setEditingId = _e[1];
    var _f = react_1.useState(emptyForm), form = _f[0], setForm = _f[1];
    var hasPermission = useOrgPermission_1.useOrgPermission().hasPermission;
    var utils = trpc_1.trpc.useUtils();
    var _g = trpc_1.trpc.multiTenancy.getOrgLeads.useQuery({ slug: slug }, { keepPreviousData: true }), _h = _g.data, leads = _h === void 0 ? [] : _h, isLoading = _g.isLoading;
    var createMutation = trpc_1.trpc.multiTenancy.createOrgLead.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Lead created successfully");
            utils.multiTenancy.getOrgLeads.invalidate();
            setShowDialog(false);
            setForm(emptyForm);
        },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var updateMutation = trpc_1.trpc.multiTenancy.updateOrgLead.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Lead updated successfully");
            utils.multiTenancy.getOrgLeads.invalidate();
            setShowDialog(false);
            setForm(emptyForm);
            setEditingId(null);
        },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var deleteMutation = trpc_1.trpc.multiTenancy.deleteOrgLead.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Lead deleted successfully");
            utils.multiTenancy.getOrgLeads.invalidate();
        },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var handleSubmit = function () {
        if (!form.name || !form.email) {
            sonner_1.toast.error("Name and email are required");
            return;
        }
        if (editingId) {
            updateMutation.mutate({
                slug: slug,
                id: editingId,
                data: form
            });
        }
        else {
            createMutation.mutate({
                slug: slug,
                data: form
            });
        }
    };
    var handleEdit = function (lead) {
        if (!hasPermission('leads', 'update')) {
            sonner_1.toast.error("You don't have permission to edit leads");
            return;
        }
        setEditingId(lead.id);
        setForm({
            name: lead.name || "",
            email: lead.email || "",
            phone: lead.phone || "",
            company: lead.company || "",
            value: lead.value || 0,
            source: lead.source || "",
            notes: lead.notes || "",
            stage: lead.stage || "lead"
        });
        setShowDialog(true);
    };
    var handleDelete = function (id) {
        if (!hasPermission('leads', 'delete')) {
            sonner_1.toast.error("You don't have permission to delete leads");
            return;
        }
        if (confirm("Are you sure you want to delete this lead?")) {
            deleteMutation.mutate({ slug: slug, id: id });
        }
    };
    var handleStageChange = function (leadId, newStage) {
        if (!hasPermission('leads', 'update')) {
            sonner_1.toast.error("You don't have permission to update leads");
            return;
        }
        updateMutation.mutate({
            slug: slug,
            id: leadId,
            data: { stage: newStage }
        });
    };
    var filteredLeads = react_1.useMemo(function () {
        return leads.filter(function (lead) {
            var _a, _b, _c;
            return ((_a = lead.name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm.toLowerCase())) || ((_b = lead.email) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(searchTerm.toLowerCase())) || ((_c = lead.company) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(searchTerm.toLowerCase()));
        });
    }, [leads, searchTerm]);
    var leadsByStage = react_1.useMemo(function () {
        var grouped = {
            lead: [],
            qualified: [],
            proposal: [],
            negotiation: [],
            closed_won: [],
            closed_lost: []
        };
        filteredLeads.forEach(function (lead) {
            var stage = lead.stage || "lead";
            if (grouped[stage]) {
                grouped[stage].push(lead);
            }
        });
        return grouped;
    }, [filteredLeads]);
    var totalValue = react_1.useMemo(function () {
        return filteredLeads.reduce(function (sum, lead) { return sum + (lead.value || 0); }, 0);
    }, [filteredLeads]);
    if (!hasPermission('leads', 'read')) {
        return (React.createElement(OrgLayout_1.OrgLayout, null,
            React.createElement("div", { className: "flex items-center justify-center h-64" },
                React.createElement("div", { className: "text-center" },
                    React.createElement("h2", { className: "text-lg font-semibold text-gray-900" }, "Access Denied"),
                    React.createElement("p", { className: "text-gray-600" }, "You don't have permission to view leads.")))));
    }
    return (React.createElement(OrgLayout_1.OrgLayout, null,
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", null,
                    React.createElement("h1", { className: "text-2xl font-bold" }, "Leads"),
                    React.createElement("p", { className: "text-muted-foreground" }, "Manage your sales pipeline")),
                React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement("div", { className: "flex items-center gap-2 px-3 py-1 bg-muted rounded-lg" },
                        React.createElement(lucide_react_1.DollarSign, { className: "w-4 h-4" }),
                        React.createElement("span", { className: "font-medium" },
                            "$",
                            totalValue.toLocaleString())),
                    hasPermission('leads', 'create') && (React.createElement(button_1.Button, { onClick: function () { return setShowDialog(true); } },
                        React.createElement(lucide_react_1.Plus, { className: "w-4 h-4 mr-2" }),
                        "Add Lead")))),
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", { className: "flex items-center gap-4" },
                    React.createElement("div", { className: "relative" },
                        React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" }),
                        React.createElement(input_1.Input, { placeholder: "Search leads...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: "pl-9 w-64" }))),
                React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement(button_1.Button, { variant: view === "list" ? "default" : "outline", size: "sm", onClick: function () { return setView("list"); } },
                        React.createElement(lucide_react_1.Columns, { className: "w-4 h-4 mr-2" }),
                        "List"),
                    React.createElement(button_1.Button, { variant: view === "kanban" ? "default" : "outline", size: "sm", onClick: function () { return setView("kanban"); } },
                        React.createElement(lucide_react_1.LayoutGrid, { className: "w-4 h-4 mr-2" }),
                        "Kanban"))),
            view === "kanban" ? (React.createElement("div", { className: "grid grid-cols-6 gap-4 h-[calc(100vh-300px)]" }, COLUMNS.map(function (column) { return (React.createElement("div", { key: column.id, className: utils_1.cn("flex flex-col border-t-4 rounded-lg p-4", column.color, column.border) },
                React.createElement("div", { className: "flex items-center justify-between mb-4" },
                    React.createElement("h3", { className: utils_1.cn("font-semibold", column.header) }, column.label),
                    React.createElement(badge_1.Badge, { variant: "secondary" }, leadsByStage[column.id].length)),
                React.createElement("div", { className: "flex-1 space-y-3 overflow-y-auto" }, leadsByStage[column.id].map(function (lead) { return (React.createElement("div", { key: lead.id, className: "bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border cursor-pointer hover:shadow-md transition-shadow", onClick: function () { return handleEdit(lead); } },
                    React.createElement("div", { className: "flex items-start justify-between" },
                        React.createElement("div", { className: "flex-1" },
                            React.createElement("h4", { className: "font-medium text-sm" }, lead.name),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, lead.company),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, lead.email)),
                        lead.value > 0 && (React.createElement("div", { className: "text-right" },
                            React.createElement("p", { className: "text-sm font-medium" },
                                "$",
                                lead.value.toLocaleString())))),
                    React.createElement("div", { className: "flex items-center justify-between mt-2" },
                        React.createElement("div", { className: "flex items-center gap-1" }, lead.stage !== "closed_won" && lead.stage !== "closed_lost" && (React.createElement(button_1.Button, { size: "sm", variant: "ghost", className: "h-6 w-6 p-0", onClick: function (e) {
                                var _a;
                                e.stopPropagation();
                                var currentIndex = COLUMNS.findIndex(function (c) { return c.id === lead.stage; });
                                var nextStage = (_a = COLUMNS[currentIndex + 1]) === null || _a === void 0 ? void 0 : _a.id;
                                if (nextStage) {
                                    handleStageChange(lead.id, nextStage);
                                }
                            } },
                            React.createElement(lucide_react_1.ArrowRight, { className: "w-3 h-3" })))),
                        React.createElement("div", { className: "flex items-center gap-1" },
                            React.createElement(button_1.Button, { size: "sm", variant: "ghost", className: "h-6 w-6 p-0 text-destructive", onClick: function (e) {
                                    e.stopPropagation();
                                    handleDelete(lead.id);
                                } },
                                React.createElement(lucide_react_1.XCircle, { className: "w-3 h-3" })))))); })))); }))) : (React.createElement("div", { className: "bg-white dark:bg-gray-800 rounded-lg border" },
                React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement("table", { className: "w-full" },
                        React.createElement("thead", { className: "border-b" },
                            React.createElement("tr", null,
                                React.createElement("th", { className: "text-left p-4 font-medium" }, "Name"),
                                React.createElement("th", { className: "text-left p-4 font-medium" }, "Company"),
                                React.createElement("th", { className: "text-left p-4 font-medium" }, "Email"),
                                React.createElement("th", { className: "text-left p-4 font-medium" }, "Phone"),
                                React.createElement("th", { className: "text-left p-4 font-medium" }, "Value"),
                                React.createElement("th", { className: "text-left p-4 font-medium" }, "Stage"),
                                React.createElement("th", { className: "text-left p-4 font-medium" }, "Source"),
                                React.createElement("th", { className: "text-left p-4 font-medium" }, "Actions"))),
                        React.createElement("tbody", null, filteredLeads.map(function (lead) {
                            var _a;
                            return (React.createElement("tr", { key: lead.id, className: "border-b hover:bg-muted/50" },
                                React.createElement("td", { className: "p-4 font-medium" }, lead.name),
                                React.createElement("td", { className: "p-4" }, lead.company),
                                React.createElement("td", { className: "p-4" }, lead.email),
                                React.createElement("td", { className: "p-4" }, lead.phone),
                                React.createElement("td", { className: "p-4" }, lead.value > 0 ? "$" + lead.value.toLocaleString() : "-"),
                                React.createElement("td", { className: "p-4" },
                                    React.createElement(badge_1.Badge, { variant: lead.stage === "closed_won" ? "default" :
                                            lead.stage === "closed_lost" ? "destructive" :
                                                "secondary" }, ((_a = COLUMNS.find(function (c) { return c.id === lead.stage; })) === null || _a === void 0 ? void 0 : _a.label) || lead.stage)),
                                React.createElement("td", { className: "p-4" }, lead.source),
                                React.createElement("td", { className: "p-4" },
                                    React.createElement("div", { className: "flex items-center gap-2" },
                                        React.createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: function () { return handleEdit(lead); } }, "Edit"),
                                        React.createElement(button_1.Button, { size: "sm", variant: "ghost", className: "text-destructive", onClick: function () { return handleDelete(lead.id); } }, "Delete")))));
                        })))))),
            React.createElement(dialog_1.Dialog, { open: showDialog, onOpenChange: setShowDialog },
                React.createElement(dialog_1.DialogContent, { className: "max-w-md" },
                    React.createElement(dialog_1.DialogHeader, null,
                        React.createElement(dialog_1.DialogTitle, null, editingId ? "Edit Lead" : "Add Lead")),
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "name" }, "Name *"),
                            React.createElement(input_1.Input, { id: "name", value: form.name, onChange: function (e) { return setForm(__assign(__assign({}, form), { name: e.target.value })); }, placeholder: "Enter lead name" })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "email" }, "Email *"),
                            React.createElement(input_1.Input, { id: "email", type: "email", value: form.email, onChange: function (e) { return setForm(__assign(__assign({}, form), { email: e.target.value })); }, placeholder: "Enter email address" })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "phone" }, "Phone"),
                            React.createElement(input_1.Input, { id: "phone", value: form.phone, onChange: function (e) { return setForm(__assign(__assign({}, form), { phone: e.target.value })); }, placeholder: "Enter phone number" })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "company" }, "Company"),
                            React.createElement(input_1.Input, { id: "company", value: form.company, onChange: function (e) { return setForm(__assign(__assign({}, form), { company: e.target.value })); }, placeholder: "Enter company name" })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "value" }, "Value"),
                            React.createElement(input_1.Input, { id: "value", type: "number", value: form.value, onChange: function (e) { return setForm(__assign(__assign({}, form), { value: parseFloat(e.target.value) || 0 })); }, placeholder: "Enter lead value" })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "source" }, "Source"),
                            React.createElement(input_1.Input, { id: "source", value: form.source, onChange: function (e) { return setForm(__assign(__assign({}, form), { source: e.target.value })); }, placeholder: "How did you find this lead?" })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "stage" }, "Stage"),
                            React.createElement(select_1.Select, { value: form.stage, onValueChange: function (value) { return setForm(__assign(__assign({}, form), { stage: value })); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null, COLUMNS.map(function (column) { return (React.createElement(select_1.SelectItem, { key: column.id, value: column.id }, column.label)); })))),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "notes" }, "Notes"),
                            React.createElement(textarea_1.Textarea, { id: "notes", value: form.notes, onChange: function (e) { return setForm(__assign(__assign({}, form), { notes: e.target.value })); }, placeholder: "Enter notes", rows: 3 }))),
                    React.createElement("div", { className: "flex justify-end space-x-2" },
                        React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setShowDialog(false); } }, "Cancel"),
                        React.createElement(button_1.Button, { onClick: handleSubmit, disabled: createMutation.isLoading || updateMutation.isLoading },
                            createMutation.isLoading || updateMutation.isLoading ? (React.createElement(lucide_react_1.Loader2, { className: "w-4 h-4 mr-2 animate-spin" })) : null,
                            editingId ? "Update" : "Create",
                            " Lead")))))));
}
exports["default"] = OrgLeads;
