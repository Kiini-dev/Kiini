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
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var separator_1 = require("@/components/ui/separator");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var label_1 = require("@/components/ui/label");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var export_utils_1 = require("@/lib/export-utils");
var wouter_1 = require("wouter");
var communications_1 = require("@/lib/communications");
var stats_card_1 = require("@/components/ui/stats-card");
var checkbox_1 = require("@/components/ui/checkbox");
var ListPageToolbar_1 = require("@/components/list-page/ListPageToolbar");
var RowActionsMenu_1 = require("@/components/list-page/RowActionsMenu");
var TableColumnSettings_1 = require("@/components/list-page/TableColumnSettings");
function Proposals() {
    var _a = wouter_1.useLocation(), location = _a[0], navigate = _a[1];
    var _search = wouter_1.useSearch();
    react_1.useEffect(function () { if (new URLSearchParams(_search).get("action") === "create")
        setIsCreateDialogOpen(true); }, []);
    var _b = react_1.useState(""), searchTerm = _b[0], setSearchTerm = _b[1];
    var _c = react_1.useState("all"), statusFilter = _c[0], setStatusFilter = _c[1];
    var _d = react_1.useState(false), isCreateDialogOpen = _d[0], setIsCreateDialogOpen = _d[1];
    var _e = react_1.useState(new Set()), selectedProposals = _e[0], setSelectedProposals = _e[1];
    var proposalColumns = [
        { key: "title", label: "Title" },
        { key: "client", label: "Client" },
        { key: "value", label: "Value" },
        { key: "stage", label: "Stage" },
        { key: "expectedClose", label: "Expected Close" },
    ];
    var _f = TableColumnSettings_1.useColumnVisibility(proposalColumns), visibleColumns = _f.visibleColumns, toggleColumn = _f.toggleColumn, isVisible = _f.isVisible;
    var utils = trpc_1.trpc.useUtils();
    var _g = trpc_1.trpc.opportunities.list.useQuery({}), _h = _g.data, proposals = _h === void 0 ? [] : _h, isLoading = _g.isLoading;
    var _j = trpc_1.trpc.clients.list.useQuery({}).data, clients = _j === void 0 ? [] : _j;
    var createProposalMutation = trpc_1.trpc.opportunities.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Opportunity created successfully");
            utils.opportunities.list.invalidate();
            setIsCreateDialogOpen(false);
        },
        onError: function (error) {
            sonner_1.toast.error("Error: " + error.message);
        }
    });
    var deleteProposalMutation = trpc_1.trpc.opportunities["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Opportunity deleted");
            utils.opportunities.list.invalidate();
        },
        onError: function (error) {
            sonner_1.toast.error("Error: " + error.message);
        }
    });
    var _k = react_1.useState({
        clientId: "",
        title: "",
        description: "",
        value: 0,
        stage: "proposal",
        expectedCloseDate: new Date().toISOString().split('T')[0],
        probability: 50,
        notes: "",
        templateId: ""
    }), newProposal = _k[0], setNewProposal = _k[1];
    var handleCreate = function () {
        if (!newProposal.clientId || !newProposal.title) {
            sonner_1.toast.error("Please fill in all required fields");
            return;
        }
        createProposalMutation.mutate(__assign(__assign({}, newProposal), { value: Math.round(newProposal.value * 100), expectedCloseDate: new Date(newProposal.expectedCloseDate), probability: newProposal.probability || undefined, notes: newProposal.notes || undefined }));
    };
    var getStatusBadge = function (status) {
        var styles = {
            lead: "bg-gray-100 text-gray-700",
            qualified: "bg-blue-100 text-blue-700",
            proposal: "bg-purple-100 text-purple-700",
            negotiation: "bg-orange-100 text-orange-700",
            closed_won: "bg-green-100 text-green-700",
            closed_lost: "bg-red-100 text-red-700"
        };
        return (React.createElement("span", { className: "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium " + (styles[status] || "bg-gray-100") }, status.replace('_', ' ')));
    };
    var filteredProposals = proposals.filter(function (proposal) {
        var client = clients.find(function (c) { return c.id === proposal.clientId; });
        var clientName = (client === null || client === void 0 ? void 0 : client.companyName) || "";
        var matchesSearch = proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            clientName.toLowerCase().includes(searchTerm.toLowerCase());
        var matchesStatus = statusFilter === "all" || proposal.stage === statusFilter;
        return matchesSearch && matchesStatus;
    });
    var totalValue = proposals.reduce(function (sum, p) { return sum + (p.value || 0); }, 0);
    var acceptedValue = proposals.filter(function (p) { return p.stage === "closed_won"; }).reduce(function (sum, p) { return sum + (p.value || 0); }, 0);
    var activeValue = proposals.filter(function (p) { return p.stage !== "closed_won" && p.stage !== "closed_lost"; }).reduce(function (sum, p) { return sum + (p.value || 0); }, 0);
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Opportunities", description: "Create and manage business opportunities", icon: React.createElement(lucide_react_1.FileText, { className: "w-6 h-6" }), breadcrumbs: [{ label: "Dashboard" }, { label: "Sales" }, { label: "Opportunities" }], actions: React.createElement(React.Fragment, null) },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Pipeline Value", value: React.createElement(React.Fragment, null,
                        "Ksh ",
                        (activeValue / 100).toLocaleString()), description: "Active deals", icon: React.createElement(lucide_react_1.TrendingUp, { className: "h-5 w-5" }), color: "border-l-orange-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Closed Won", value: React.createElement(React.Fragment, null,
                        "Ksh ",
                        (acceptedValue / 100).toLocaleString()), description: React.createElement(React.Fragment, null,
                        proposals.filter(function (p) { return p.stage === "closed_won"; }).length,
                        " deals"), icon: React.createElement(lucide_react_1.CheckCircle2, { className: "h-5 w-5" }), color: "border-l-purple-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Avg Value", value: React.createElement(React.Fragment, null,
                        "Ksh ",
                        (proposals.length > 0 ? totalValue / proposals.length / 100 : 0).toLocaleString()), description: "Per opportunity", icon: React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }), color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Avg Probability", value: React.createElement(React.Fragment, null,
                        proposals.length > 0 ? Math.round(proposals.reduce(function (sum, p) { return sum + (p.probability || 0); }, 0) / proposals.length) : 0,
                        "%"), description: "Win confidence", icon: React.createElement(lucide_react_1.Clock, { className: "h-5 w-5" }), color: "border-l-blue-500" })),
            React.createElement(ListPageToolbar_1.ListPageToolbar, { searchValue: searchTerm, onSearchChange: setSearchTerm, searchPlaceholder: "Search opportunities...", onCreateClick: function () { return setIsCreateDialogOpen(true); }, createLabel: "New Opportunity", onExportClick: function () { return export_utils_1.downloadCSV(filteredProposals.map(function (p) { var client = clients.find(function (c) { return c.id === p.clientId; }); return { Title: p.title, Client: (client === null || client === void 0 ? void 0 : client.companyName) || "Unknown", Value: (p.value / 100).toFixed(2), Stage: p.stage || "", ExpectedClose: p.expectedCloseDate ? new Date(p.expectedCloseDate).toLocaleDateString() : "" }; }), "opportunities"); }, onPrintClick: function () { return window.print(); }, filterContent: React.createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                    React.createElement(select_1.SelectTrigger, { className: "w-48" },
                        React.createElement(select_1.SelectValue, null)),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "all" }, "All Stages"),
                        React.createElement(select_1.SelectItem, { value: "lead" }, "Lead"),
                        React.createElement(select_1.SelectItem, { value: "qualified" }, "Qualified"),
                        React.createElement(select_1.SelectItem, { value: "proposal" }, "Proposal"),
                        React.createElement(select_1.SelectItem, { value: "negotiation" }, "Negotiation"),
                        React.createElement(select_1.SelectItem, { value: "closed_won" }, "Closed Won"),
                        React.createElement(select_1.SelectItem, { value: "closed_lost" }, "Closed Lost"))) }),
            selectedProposals.size > 0 && (React.createElement("div", { className: "flex items-center gap-3 p-3 rounded-lg border bg-primary/5" },
                React.createElement("span", { className: "text-sm font-medium" },
                    selectedProposals.size,
                    " selected"),
                React.createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { var selected = filteredProposals.filter(function (p) { return selectedProposals.has(p.id); }); export_utils_1.downloadCSV(selected.map(function (p) { var client = clients.find(function (c) { return c.id === p.clientId; }); return { Title: p.title, Client: (client === null || client === void 0 ? void 0 : client.companyName) || "Unknown", Value: (p.value / 100).toFixed(2), Stage: p.stage || "", ExpectedClose: p.expectedCloseDate ? new Date(p.expectedCloseDate).toLocaleDateString() : "" }; }), "opportunities-selected"); } },
                    React.createElement(lucide_react_1.Download, { className: "h-4 w-4 mr-1" }),
                    "Export"),
                React.createElement(button_1.Button, { size: "sm", variant: "outline", className: "text-destructive", onClick: function () { if (confirm("Delete " + selectedProposals.size + " opportunities?")) {
                        selectedProposals.forEach(function (id) { return deleteProposalMutation.mutate(id); });
                        setSelectedProposals(new Set());
                    } } }, "Delete"),
                React.createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: function () { return setSelectedProposals(new Set()); } }, "Clear"))),
            React.createElement(dialog_1.Dialog, { open: isCreateDialogOpen, onOpenChange: setIsCreateDialogOpen },
                React.createElement(dialog_1.DialogContent, { className: "max-w-3xl" },
                    React.createElement(dialog_1.DialogHeader, null,
                        React.createElement(dialog_1.DialogTitle, null, "Create New Opportunity"),
                        React.createElement(dialog_1.DialogDescription, null, "Fill in the details to create a new business opportunity")),
                    React.createElement("div", { className: "space-y-6 max-h-[75vh] overflow-y-auto pr-1" },
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, { className: "pb-3" },
                                React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                                    React.createElement(lucide_react_1.FileText, { className: "h-4 w-4 text-primary" }),
                                    "Opportunity Details")),
                            React.createElement(card_1.CardContent, { className: "space-y-4" },
                                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, { htmlFor: "client" }, "Client *"),
                                        React.createElement(select_1.Select, { onValueChange: function (val) { return setNewProposal(__assign(__assign({}, newProposal), { clientId: val })); } },
                                            React.createElement(select_1.SelectTrigger, null,
                                                React.createElement(select_1.SelectValue, { placeholder: "Select client" })),
                                            React.createElement(select_1.SelectContent, null, clients.map(function (client) { return (React.createElement(select_1.SelectItem, { key: client.id, value: client.id }, client.companyName)); })))),
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, { htmlFor: "stage" }, "Stage"),
                                        React.createElement(select_1.Select, { value: newProposal.stage, onValueChange: function (val) { return setNewProposal(__assign(__assign({}, newProposal), { stage: val })); } },
                                            React.createElement(select_1.SelectTrigger, null,
                                                React.createElement(select_1.SelectValue, null)),
                                            React.createElement(select_1.SelectContent, null,
                                                React.createElement(select_1.SelectItem, { value: "lead" }, "Lead"),
                                                React.createElement(select_1.SelectItem, { value: "qualified" }, "Qualified"),
                                                React.createElement(select_1.SelectItem, { value: "proposal" }, "Proposal"),
                                                React.createElement(select_1.SelectItem, { value: "negotiation" }, "Negotiation"),
                                                React.createElement(select_1.SelectItem, { value: "closed_won" }, "Closed Won"),
                                                React.createElement(select_1.SelectItem, { value: "closed_lost" }, "Closed Lost")))),
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, { htmlFor: "template" }, "Proposal Template (Optional)"),
                                        React.createElement(select_1.Select, { value: newProposal.templateId, onValueChange: function (val) { return setNewProposal(__assign(__assign({}, newProposal), { templateId: val })); } },
                                            React.createElement(select_1.SelectTrigger, null,
                                                React.createElement(select_1.SelectValue, { placeholder: "Choose template..." })),
                                            React.createElement(select_1.SelectContent, null,
                                                React.createElement(select_1.SelectItem, { value: "" }, "No Template"),
                                                React.createElement(select_1.SelectItem, { value: "standard" }, "Standard Proposal"),
                                                React.createElement(select_1.SelectItem, { value: "service" }, "Service Proposal"),
                                                React.createElement(select_1.SelectItem, { value: "product" }, "Product Proposal"),
                                                React.createElement(select_1.SelectItem, { value: "maintenance" }, "Maintenance Proposal"))))),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "title" }, "Opportunity Title *"),
                                    React.createElement(input_1.Input, { id: "title", placeholder: "Enter opportunity title", value: newProposal.title, onChange: function (e) { return setNewProposal(__assign(__assign({}, newProposal), { title: e.target.value })); } })))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, { className: "pb-3" },
                                React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                                    React.createElement(lucide_react_1.DollarSign, { className: "h-4 w-4 text-primary" }),
                                    "Financial Details")),
                            React.createElement(card_1.CardContent, null,
                                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, { htmlFor: "value" }, "Estimated Value (Ksh) *"),
                                        React.createElement("div", { className: "relative" },
                                            React.createElement(lucide_react_1.DollarSign, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                                            React.createElement(input_1.Input, { id: "value", type: "number", placeholder: "0.00", value: newProposal.value || "", onChange: function (e) { return setNewProposal(__assign(__assign({}, newProposal), { value: parseFloat(e.target.value) || 0 })); }, step: "0.01", min: "0", className: "pl-9" }))),
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, { htmlFor: "expectedClose" }, "Expected Close Date"),
                                        React.createElement(input_1.Input, { id: "expectedClose", type: "date", value: newProposal.expectedCloseDate, onChange: function (e) { return setNewProposal(__assign(__assign({}, newProposal), { expectedCloseDate: e.target.value })); } })),
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, { htmlFor: "probability" }, "Win Probability (%)"),
                                        React.createElement(input_1.Input, { id: "probability", type: "number", value: newProposal.probability, onChange: function (e) { return setNewProposal(__assign(__assign({}, newProposal), { probability: parseInt(e.target.value) || 0 })); }, min: "0", max: "100", placeholder: "50" }))))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, { className: "pb-3" },
                                React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                                    React.createElement(lucide_react_1.ClipboardList, { className: "h-4 w-4 text-primary" }),
                                    "Description & Notes")),
                            React.createElement(card_1.CardContent, { className: "space-y-4" },
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "description" }, "Description"),
                                    React.createElement(RichTextEditor_1.RichTextEditor, { value: newProposal.description, onChange: function (v) { return setNewProposal(__assign(__assign({}, newProposal), { description: v })); }, placeholder: "Enter proposal description...", minHeight: "120px" })),
                                React.createElement(separator_1.Separator, null),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "notes" }, "Internal Notes"),
                                    React.createElement(RichTextEditor_1.RichTextEditor, { value: newProposal.notes, onChange: function (v) { return setNewProposal(__assign(__assign({}, newProposal), { notes: v })); }, placeholder: "Add any internal notes...", minHeight: "100px" }))))),
                    React.createElement(dialog_1.DialogFooter, { className: "gap-2 sm:gap-0" },
                        React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setIsCreateDialogOpen(false); } }, "Cancel"),
                        React.createElement(button_1.Button, { onClick: handleCreate, disabled: createProposalMutation.isPending }, createProposalMutation.isPending ? "Creating..." : "Create Opportunity")))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "p-0" },
                    React.createElement("div", { className: "flex items-center justify-between px-4 py-3 border-b" },
                        React.createElement("span", { className: "text-sm text-muted-foreground" },
                            filteredProposals.length,
                            " opportunities"),
                        React.createElement(TableColumnSettings_1.TableColumnSettings, { columns: proposalColumns, visibleColumns: visibleColumns, onToggleColumn: toggleColumn })),
                    isLoading ? (React.createElement("div", { className: "flex justify-center py-8" },
                        React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-muted-foreground" }))) : filteredProposals.length === 0 ? (React.createElement("div", { className: "text-center py-8 text-muted-foreground" }, "No opportunities found. Click \"+\" to create one.")) : (React.createElement("div", { className: "overflow-x-auto" },
                        React.createElement(table_1.Table, null,
                            React.createElement(table_1.TableHeader, null,
                                React.createElement(table_1.TableRow, null,
                                    React.createElement(table_1.TableHead, { className: "w-10" },
                                        React.createElement(checkbox_1.Checkbox, { checked: selectedProposals.size === filteredProposals.length && filteredProposals.length > 0, onCheckedChange: function () { if (selectedProposals.size === filteredProposals.length)
                                                setSelectedProposals(new Set());
                                            else
                                                setSelectedProposals(new Set(filteredProposals.map(function (p) { return p.id; }))); } })),
                                    isVisible("title") && React.createElement(table_1.TableHead, null, "Title"),
                                    isVisible("client") && React.createElement(table_1.TableHead, null, "Client"),
                                    isVisible("value") && React.createElement(table_1.TableHead, null, "Value"),
                                    isVisible("stage") && React.createElement(table_1.TableHead, null, "Stage"),
                                    isVisible("expectedClose") && React.createElement(table_1.TableHead, null, "Expected Close"),
                                    React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                            React.createElement(table_1.TableBody, null, filteredProposals.map(function (proposal) {
                                var client = clients.find(function (c) { return c.id === proposal.clientId; });
                                return (React.createElement(table_1.TableRow, { key: proposal.id, className: selectedProposals.has(proposal.id) ? "bg-primary/5" : "" },
                                    React.createElement(table_1.TableCell, null,
                                        React.createElement(checkbox_1.Checkbox, { checked: selectedProposals.has(proposal.id), onCheckedChange: function () { var next = new Set(selectedProposals); if (next.has(proposal.id))
                                                next["delete"](proposal.id);
                                            else
                                                next.add(proposal.id); setSelectedProposals(next); } })),
                                    isVisible("title") && React.createElement(table_1.TableCell, { className: "font-medium" }, proposal.title),
                                    isVisible("client") && React.createElement(table_1.TableCell, null, (client === null || client === void 0 ? void 0 : client.companyName) || "Unknown Client"),
                                    isVisible("value") && React.createElement(table_1.TableCell, null,
                                        "Ksh ",
                                        (proposal.value / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })),
                                    isVisible("stage") && React.createElement(table_1.TableCell, null, getStatusBadge(proposal.stage || "proposal")),
                                    isVisible("expectedClose") && React.createElement(table_1.TableCell, null, proposal.expectedCloseDate ? new Date(proposal.expectedCloseDate).toLocaleDateString() : "N/A"),
                                    React.createElement(table_1.TableCell, { className: "text-right" },
                                        React.createElement(RowActionsMenu_1.RowActionsMenu, { primaryActions: [
                                                { label: "View", icon: RowActionsMenu_1.actionIcons.view, onClick: function () { return navigate("/proposals/" + proposal.id); } },
                                                { label: "Delete", icon: RowActionsMenu_1.actionIcons["delete"], onClick: function () { if (confirm("Delete this proposal?"))
                                                        deleteProposalMutation.mutate(proposal.id); }, variant: "destructive" },
                                            ], menuActions: [
                                                { label: "Edit", icon: RowActionsMenu_1.actionIcons.edit, onClick: function () { return navigate("/proposals/" + proposal.id + "/edit"); } },
                                                { label: "Duplicate", icon: RowActionsMenu_1.actionIcons.copy, onClick: function () { return navigate("/proposals/create?clone=" + proposal.id); } },
                                                { label: "Send to Client", icon: React.createElement(lucide_react_1.Send, { className: "h-4 w-4" }), onClick: function () { return navigate(communications_1.buildCommunicationComposePath(location, (client === null || client === void 0 ? void 0 : client.email) || "", "Proposal: " + proposal.title)); }, separator: true },
                                                { label: "Download PDF", icon: RowActionsMenu_1.actionIcons.download, onClick: function () { navigate("/proposals/" + proposal.id); setTimeout(function () { return window.print(); }, 500); } },
                                            ] }))));
                            }))))))))));
}
exports["default"] = Proposals;
