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
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var card_1 = require("@/components/ui/card");
var separator_1 = require("@/components/ui/separator");
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var spinner_1 = require("@/components/ui/spinner");
var permissions_1 = require("@/lib/permissions");
var trpc_1 = require("@/lib/trpc");
var CONTRACT_TYPES = [
    { value: "service", label: "Service Agreement" },
    { value: "lease", label: "Lease Agreement" },
    { value: "supply", label: "Supply Contract" },
    { value: "maintenance", label: "Maintenance Contract" },
    { value: "consulting", label: "Consulting Agreement" },
    { value: "employment", label: "Employment Contract" },
    { value: "nda", label: "Non-Disclosure Agreement" },
    { value: "partnership", label: "Partnership Agreement" },
    { value: "licensing", label: "Licensing Agreement" },
    { value: "other", label: "Other" },
];
var emptyForm = {
    name: "", vendor: "", startDate: "", endDate: "", value: "",
    status: "draft",
    contractType: "", description: "", notes: "", templateId: ""
};
function ContractManagement() {
    var _a;
    var _b = permissions_1.useRequireFeature("contracts:view"), allowed = _b.allowed, permissionLoading = _b.isLoading;
    var _c = wouter_1.useLocation(), setLocation = _c[1];
    var _d = react_1.useState(""), searchQuery = _d[0], setSearchQuery = _d[1];
    var _e = react_1.useState(false), createOpen = _e[0], setCreateOpen = _e[1];
    var _f = react_1.useState(null), editingContract = _f[0], setEditingContract = _f[1];
    var _g = react_1.useState(__assign({}, emptyForm)), form = _g[0], setForm = _g[1];
    var utils = trpc_1.trpc.useUtils();
    var _search = wouter_1.useSearch();
    react_1.useEffect(function () { if (new URLSearchParams(_search).get("action") === "create")
        setCreateOpen(true); }, []);
    var _h = trpc_1.trpc.contracts.list.useQuery({}), rawData = _h.data, dataLoading = _h.isLoading;
    var contracts = JSON.parse(JSON.stringify((_a = rawData === null || rawData === void 0 ? void 0 : rawData.data) !== null && _a !== void 0 ? _a : []));
    var createMutation = trpc_1.trpc.contracts.create.useMutation({
        onSuccess: function () { utils.contracts.list.invalidate(); sonner_1.toast.success("Contract created"); setCreateOpen(false); setForm(__assign({}, emptyForm)); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var updateMutation = trpc_1.trpc.contracts.update.useMutation({
        onSuccess: function () { utils.contracts.list.invalidate(); sonner_1.toast.success("Contract updated"); setEditingContract(null); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var deleteMutation = trpc_1.trpc.contracts["delete"].useMutation({
        onSuccess: function () { utils.contracts.list.invalidate(); sonner_1.toast.success("Contract deleted"); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    if (permissionLoading)
        return React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, null));
    if (!allowed)
        return null;
    var filteredContracts = contracts.filter(function (c) {
        return (c.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.vendor || "").toLowerCase().includes(searchQuery.toLowerCase());
    });
    var statusColor = function (status) { return status === "active" ? "default" : status === "expired" ? "destructive" : "secondary"; };
    var openEdit = function (c) {
        setEditingContract(c);
        setForm({
            name: c.name || "", vendor: c.vendor || "", startDate: c.startDate || "",
            endDate: c.endDate || "", value: ((c.value || 0) / 100).toString(),
            status: c.status || "draft", contractType: c.contractType || "",
            description: c.description || "", notes: c.notes || ""
        });
    };
    var handleSubmit = function (isEdit) {
        if (!form.name || !form.vendor || !form.startDate || !form.endDate || !form.value) {
            sonner_1.toast.error("Please fill in all required fields");
            return;
        }
        var payload = {
            name: form.name, vendor: form.vendor, startDate: form.startDate,
            endDate: form.endDate, value: parseFloat(form.value) || 0,
            status: form.status, contractType: form.contractType || undefined,
            description: form.description || undefined, notes: form.notes || undefined
        };
        if (isEdit && editingContract) {
            updateMutation.mutate(__assign({ id: editingContract.id }, payload));
        }
        else {
            createMutation.mutate(payload);
        }
    };
    var ContractForm = function (_a) {
        var isEdit = _a.isEdit;
        return (React.createElement("div", { className: "space-y-6 max-h-[75vh] overflow-y-auto pr-1" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-3" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.FileText, { className: "h-4 w-4 text-primary" }),
                        "Contract Template"),
                    React.createElement(card_1.CardDescription, null, "Select a template to pre-populate contract terms")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Select Template (Optional)"),
                        React.createElement(select_1.Select, { value: form.templateId, onValueChange: function (v) { return setForm(function (f) { return (__assign(__assign({}, f), { templateId: v })); }); } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, { placeholder: "Choose a template..." })),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "" }, "No Template"),
                                React.createElement(select_1.SelectItem, { value: "service" }, "Service Agreement"),
                                React.createElement(select_1.SelectItem, { value: "lease" }, "Lease Agreement"),
                                React.createElement(select_1.SelectItem, { value: "maintenance" }, "Maintenance Agreement"),
                                React.createElement(select_1.SelectItem, { value: "license" }, "Software License Agreement"),
                                React.createElement(select_1.SelectItem, { value: "nda" }, "Non-Disclosure Agreement"))),
                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "Choose a template to auto-populate terms or leave blank to start from scratch")))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-3" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.FileText, { className: "h-4 w-4 text-primary" }),
                        "Contract Information")),
                React.createElement(card_1.CardContent, { className: "space-y-4" },
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null, "Contract Name *"),
                            React.createElement(input_1.Input, { value: form.name, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { name: e.target.value })); }); }, placeholder: "e.g. Office Lease 2025" })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null, "Contract Type"),
                            React.createElement(select_1.Select, { value: form.contractType, onValueChange: function (v) { return setForm(function (f) { return (__assign(__assign({}, f), { contractType: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, { placeholder: "Select type..." })),
                                React.createElement(select_1.SelectContent, null, CONTRACT_TYPES.map(function (t) { return React.createElement(select_1.SelectItem, { key: t.value, value: t.value }, t.label); }))))),
                    React.createElement("div", { className: "space-y-2 md:w-1/2" },
                        React.createElement(label_1.Label, null, "Status"),
                        React.createElement(select_1.Select, { value: form.status, onValueChange: function (v) { return setForm(function (f) { return (__assign(__assign({}, f), { status: v })); }); } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                                React.createElement(select_1.SelectItem, { value: "active" }, "Active"),
                                React.createElement(select_1.SelectItem, { value: "expired" }, "Expired"),
                                React.createElement(select_1.SelectItem, { value: "terminated" }, "Terminated")))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-3" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.Building2, { className: "h-4 w-4 text-primary" }),
                        "Vendor / Party Details")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Vendor / Party Name *"),
                        React.createElement(input_1.Input, { value: form.vendor, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { vendor: e.target.value })); }); }, placeholder: "e.g. ABC Supplies Ltd" })))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-3" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.Calendar, { className: "h-4 w-4 text-primary" }),
                        "Period & Value")),
                React.createElement(card_1.CardContent, { className: "space-y-4" },
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null, "Start Date *"),
                            React.createElement(input_1.Input, { type: "date", value: form.startDate, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { startDate: e.target.value })); }); } })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null, "End Date *"),
                            React.createElement(input_1.Input, { type: "date", value: form.endDate, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { endDate: e.target.value })); }); } }))),
                    React.createElement("div", { className: "space-y-2 md:w-1/2" },
                        React.createElement(label_1.Label, null, "Contract Value (Ksh) *"),
                        React.createElement("div", { className: "relative" },
                            React.createElement(lucide_react_1.DollarSign, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                            React.createElement(input_1.Input, { type: "number", value: form.value, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { value: e.target.value })); }); }, placeholder: "0.00", step: "0.01", min: "0", className: "pl-9" }))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-3" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.ClipboardList, { className: "h-4 w-4 text-primary" }),
                        "Description & Notes")),
                React.createElement(card_1.CardContent, { className: "space-y-4" },
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Description"),
                        React.createElement(RichTextEditor_1.RichTextEditor, { value: form.description, onChange: function (v) { return setForm(function (f) { return (__assign(__assign({}, f), { description: v })); }); }, placeholder: "Enter contract details, terms, and conditions...", minHeight: "120px" })),
                    React.createElement(separator_1.Separator, null),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Internal Notes"),
                        React.createElement(RichTextEditor_1.RichTextEditor, { value: form.notes, onChange: function (v) { return setForm(function (f) { return (__assign(__assign({}, f), { notes: v })); }); }, placeholder: "Add any internal notes...", minHeight: "100px" }))))));
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Contracts Management", description: "Manage contracts, agreements, and vendor terms", icon: React.createElement(lucide_react_1.FileText, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Contracts" }] },
        React.createElement("div", { className: "space-y-6 p-4 sm:p-6" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", null,
                    React.createElement("h2", { className: "text-2xl font-bold" }, "Contracts"),
                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "Manage all contracts and agreements")),
                React.createElement(button_1.Button, { onClick: function () { setForm(__assign({}, emptyForm)); setCreateOpen(true); } },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                    " New Contract")),
            React.createElement("div", { className: "flex items-center gap-2" },
                React.createElement(lucide_react_1.Search, { className: "h-4 w-4 text-muted-foreground" }),
                React.createElement(input_1.Input, { placeholder: "Search contracts...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "flex-1" })),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Contracts"),
                    React.createElement(card_1.CardDescription, null,
                        filteredContracts.length,
                        " contracts")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "overflow-x-auto" },
                        React.createElement(table_1.Table, null,
                            React.createElement(table_1.TableHeader, null,
                                React.createElement(table_1.TableRow, null,
                                    React.createElement(table_1.TableHead, null, "Name"),
                                    React.createElement(table_1.TableHead, null, "Type"),
                                    React.createElement(table_1.TableHead, null, "Vendor"),
                                    React.createElement(table_1.TableHead, null, "Period"),
                                    React.createElement(table_1.TableHead, null, "Value"),
                                    React.createElement(table_1.TableHead, null, "Status"),
                                    React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                            React.createElement(table_1.TableBody, null, dataLoading ? (React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableCell, { colSpan: 7, className: "text-center py-8" },
                                    React.createElement(spinner_1.Spinner, null)))) : filteredContracts.length === 0 ? (React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableCell, { colSpan: 7, className: "text-center py-8 text-muted-foreground" }, "No contracts found. Click \"New Contract\" to add one."))) : filteredContracts.map(function (contract) {
                                var _a;
                                return (React.createElement(table_1.TableRow, { key: contract.id },
                                    React.createElement(table_1.TableCell, { className: "font-medium" }, contract.name),
                                    React.createElement(table_1.TableCell, { className: "text-sm" }, ((_a = CONTRACT_TYPES.find(function (t) { return t.value === contract.contractType; })) === null || _a === void 0 ? void 0 : _a.label) || contract.contractType || "-"),
                                    React.createElement(table_1.TableCell, null, contract.vendor),
                                    React.createElement(table_1.TableCell, { className: "text-sm text-muted-foreground" },
                                        contract.startDate ? new Date(contract.startDate).toLocaleDateString() : "-",
                                        " \u2192 ",
                                        contract.endDate ? new Date(contract.endDate).toLocaleDateString() : "-"),
                                    React.createElement(table_1.TableCell, null,
                                        "Ksh ",
                                        ((contract.value || 0) / 100).toLocaleString()),
                                    React.createElement(table_1.TableCell, null,
                                        React.createElement(badge_1.Badge, { variant: statusColor(contract.status || "draft") }, contract.status || "draft")),
                                    React.createElement(table_1.TableCell, { className: "text-right space-x-1" },
                                        React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return setLocation("/contracts/" + contract.id); } },
                                            React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                        React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return openEdit(contract); } },
                                            React.createElement(lucide_react_1.Edit2, { className: "h-4 w-4" })),
                                        React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-red-500", onClick: function () { if (confirm("Delete this contract?"))
                                                deleteMutation.mutate(contract.id); } },
                                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))));
                            }))))))),
        React.createElement(dialog_1.Dialog, { open: createOpen, onOpenChange: function (v) { setCreateOpen(v); if (!v)
                setForm(__assign({}, emptyForm)); } },
            React.createElement(dialog_1.DialogContent, { className: "max-w-3xl" },
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "New Contract")),
                React.createElement(ContractForm, { isEdit: false }),
                React.createElement(dialog_1.DialogFooter, { className: "gap-2 sm:gap-0" },
                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setCreateOpen(false); } },
                        React.createElement(lucide_react_1.X, { className: "h-4 w-4 mr-2" }),
                        "Cancel"),
                    React.createElement(button_1.Button, { onClick: function () { return handleSubmit(false); }, disabled: createMutation.isPending || !form.name || !form.vendor || !form.startDate || !form.endDate || !form.value },
                        React.createElement(lucide_react_1.Save, { className: "h-4 w-4 mr-2" }),
                        createMutation.isPending ? "Saving..." : "Create Contract")))),
        React.createElement(dialog_1.Dialog, { open: !!editingContract, onOpenChange: function (v) { if (!v)
                setEditingContract(null); } },
            React.createElement(dialog_1.DialogContent, { className: "max-w-3xl" },
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "Edit Contract")),
                React.createElement(ContractForm, { isEdit: true }),
                React.createElement(dialog_1.DialogFooter, { className: "gap-2 sm:gap-0" },
                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setEditingContract(null); } },
                        React.createElement(lucide_react_1.X, { className: "h-4 w-4 mr-2" }),
                        "Cancel"),
                    React.createElement(button_1.Button, { onClick: function () { return handleSubmit(true); }, disabled: updateMutation.isPending },
                        React.createElement(lucide_react_1.Save, { className: "h-4 w-4 mr-2" }),
                        updateMutation.isPending ? "Saving..." : "Save Changes"))))));
}
exports["default"] = ContractManagement;
