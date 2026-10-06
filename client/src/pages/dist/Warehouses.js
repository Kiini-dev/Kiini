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
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var sonner_1 = require("sonner");
var RowActionsMenu_1 = require("@/components/list-page/RowActionsMenu");
function Warehouses() {
    var _a = react_1.useState(""), search = _a[0], setSearch = _a[1];
    var _b = react_1.useState("all"), statusFilter = _b[0], setStatusFilter = _b[1];
    var _c = react_1.useState(false), showDialog = _c[0], setShowDialog = _c[1];
    var _d = react_1.useState(null), editing = _d[0], setEditing = _d[1];
    var _e = react_1.useState({ name: "", code: "", address: "", contactPerson: "", phone: "", status: "active" }), form = _e[0], setForm = _e[1];
    var utils = trpc_1.trpc.useUtils();
    var _f = trpc_1.trpc.warehouses.list.useQuery(), _g = _f.data, rawData = _g === void 0 ? [] : _g, isLoading = _f.isLoading;
    var warehouses = JSON.parse(JSON.stringify(rawData));
    var createMut = trpc_1.trpc.warehouses.create.useMutation({ onSuccess: function () { utils.warehouses.list.invalidate(); sonner_1.toast.success("Warehouse created"); setShowDialog(false); } });
    var updateMut = trpc_1.trpc.warehouses.update.useMutation({ onSuccess: function () { utils.warehouses.list.invalidate(); sonner_1.toast.success("Warehouse updated"); setEditing(null); setShowDialog(false); } });
    var deleteMut = trpc_1.trpc.warehouses["delete"].useMutation({ onSuccess: function () { utils.warehouses.list.invalidate(); sonner_1.toast.success("Warehouse deleted"); } });
    var filtered = react_1.useMemo(function () {
        var result = warehouses;
        if (statusFilter !== "all")
            result = result.filter(function (w) { return w.status === statusFilter; });
        if (search.trim()) {
            var q_1 = search.toLowerCase();
            result = result.filter(function (w) { var _a, _b, _c; return ((_a = w.name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(q_1)) || ((_b = w.code) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(q_1)) || ((_c = w.address) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(q_1)); });
        }
        return result;
    }, [warehouses, statusFilter, search]);
    var activeCount = warehouses.filter(function (w) { return w.status === "active"; }).length;
    var openCreate = function () {
        setEditing(null);
        setForm({ name: "", code: "", address: "", contactPerson: "", phone: "", status: "active" });
        setShowDialog(true);
    };
    var openEdit = function (w) {
        setEditing(w);
        setForm({ name: w.name || "", code: w.code || "", address: w.address || "", contactPerson: w.contactPerson || "", phone: w.phone || "", status: w.status || "active" });
        setShowDialog(true);
    };
    var handleSave = function () {
        if (editing) {
            updateMut.mutate(__assign({ id: editing.id }, form));
        }
        else {
            createMut.mutate(form);
        }
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Warehouses", description: "Manage warehouse locations and stock storage", icon: React.createElement(lucide_react_1.Warehouse, { className: "h-5 w-5" }), actions: React.createElement(button_1.Button, { size: "sm", onClick: openCreate },
            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
            " Add Warehouse") },
        React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6" },
            React.createElement("div", { className: "border rounded-lg p-4" },
                React.createElement("div", { className: "text-sm text-muted-foreground" }, "Total Warehouses"),
                React.createElement("div", { className: "text-2xl font-bold mt-1" }, warehouses.length)),
            React.createElement("div", { className: "border rounded-lg p-4" },
                React.createElement("div", { className: "text-sm text-muted-foreground" }, "Active"),
                React.createElement("div", { className: "text-2xl font-bold mt-1 text-emerald-600" }, activeCount)),
            React.createElement("div", { className: "border rounded-lg p-4" },
                React.createElement("div", { className: "text-sm text-muted-foreground" }, "Inactive"),
                React.createElement("div", { className: "text-2xl font-bold mt-1 text-slate-500" }, warehouses.length - activeCount))),
        React.createElement("div", { className: "flex flex-wrap gap-3 mb-4" },
            React.createElement("div", { className: "relative flex-1 min-w-[200px] max-w-sm" },
                React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                React.createElement(input_1.Input, { className: "pl-9", placeholder: "Search warehouses...", value: search, onChange: function (e) { return setSearch(e.target.value); } })),
            React.createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                React.createElement(select_1.SelectTrigger, { className: "w-[140px]" },
                    React.createElement(select_1.SelectValue, null)),
                React.createElement(select_1.SelectContent, null,
                    React.createElement(select_1.SelectItem, { value: "all" }, "All Status"),
                    React.createElement(select_1.SelectItem, { value: "active" }, "Active"),
                    React.createElement(select_1.SelectItem, { value: "inactive" }, "Inactive")))),
        isLoading ? (React.createElement("div", { className: "flex items-center justify-center py-20" },
            React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }))) : filtered.length === 0 ? (React.createElement("div", { className: "text-center py-16 border rounded-lg" },
            React.createElement(lucide_react_1.Package, { className: "h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" }),
            React.createElement("p", { className: "text-muted-foreground" }, "No warehouses found."),
            React.createElement(button_1.Button, { size: "sm", className: "mt-3", onClick: openCreate },
                React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                " Add Warehouse"))) : (React.createElement("div", { className: "border rounded-lg overflow-hidden" },
            React.createElement(table_1.Table, null,
                React.createElement(table_1.TableHeader, null,
                    React.createElement(table_1.TableRow, null,
                        React.createElement(table_1.TableHead, null, "Name"),
                        React.createElement(table_1.TableHead, null, "Code"),
                        React.createElement(table_1.TableHead, null, "Address"),
                        React.createElement(table_1.TableHead, null, "Contact"),
                        React.createElement(table_1.TableHead, null, "Phone"),
                        React.createElement(table_1.TableHead, null, "Status"),
                        React.createElement(table_1.TableHead, { className: "w-[90px]" }, "Actions"))),
                React.createElement(table_1.TableBody, null, filtered.map(function (w) { return (React.createElement(table_1.TableRow, { key: w.id },
                    React.createElement(table_1.TableCell, { className: "font-medium" }, w.name),
                    React.createElement(table_1.TableCell, { className: "text-muted-foreground" }, w.code || "—"),
                    React.createElement(table_1.TableCell, null, w.address ? (React.createElement("span", { className: "flex items-center gap-1 text-sm" },
                        React.createElement(lucide_react_1.MapPin, { className: "h-3 w-3 text-muted-foreground" }),
                        " ",
                        w.address)) : "—"),
                    React.createElement(table_1.TableCell, null, w.contactPerson ? (React.createElement("span", { className: "flex items-center gap-1 text-sm" },
                        React.createElement(lucide_react_1.User, { className: "h-3 w-3 text-muted-foreground" }),
                        " ",
                        w.contactPerson)) : "—"),
                    React.createElement(table_1.TableCell, null, w.phone ? (React.createElement("span", { className: "flex items-center gap-1 text-sm" },
                        React.createElement(lucide_react_1.Phone, { className: "h-3 w-3 text-muted-foreground" }),
                        " ",
                        w.phone)) : "—"),
                    React.createElement(table_1.TableCell, null,
                        React.createElement(badge_1.Badge, { variant: "outline", className: utils_1.cn("text-xs border-0", w.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400") }, w.status === "active" ? "Active" : "Inactive")),
                    React.createElement(table_1.TableCell, null,
                        React.createElement(RowActionsMenu_1.RowActionsMenu, { menuActions: [{ label: "Edit", icon: React.createElement(lucide_react_1.Pencil, { className: "h-4 w-4" }), onClick: function () { return openEdit(w); } }, { label: "Delete", icon: React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }), onClick: function () { if (confirm("Delete this warehouse?"))
                                        deleteMut.mutate({ id: w.id }); }, variant: "destructive", separator: true }] })))); }))))),
        React.createElement(dialog_1.Dialog, { open: showDialog, onOpenChange: function (v) { if (!v) {
                setShowDialog(false);
                setEditing(null);
            } } },
            React.createElement(dialog_1.DialogContent, null,
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, editing ? "Edit Warehouse" : "New Warehouse"),
                    React.createElement(dialog_1.DialogDescription, null, "Manage warehouse location details and status.")),
                React.createElement("div", { className: "space-y-3" },
                    React.createElement("div", { className: "grid grid-cols-2 gap-3" },
                        React.createElement("div", null,
                            React.createElement(label_1.Label, null, "Name *"),
                            React.createElement(input_1.Input, { value: form.name, onChange: function (e) { return setForm(function (p) { return (__assign(__assign({}, p), { name: e.target.value })); }); }, placeholder: "Main Warehouse" })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, null, "Code"),
                            React.createElement(input_1.Input, { value: form.code, onChange: function (e) { return setForm(function (p) { return (__assign(__assign({}, p), { code: e.target.value })); }); }, placeholder: "WH-001" }))),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, null, "Address"),
                        React.createElement(textarea_1.Textarea, { value: form.address, onChange: function (e) { return setForm(function (p) { return (__assign(__assign({}, p), { address: e.target.value })); }); }, rows: 2, placeholder: "Full address" })),
                    React.createElement("div", { className: "grid grid-cols-2 gap-3" },
                        React.createElement("div", null,
                            React.createElement(label_1.Label, null, "Contact Person"),
                            React.createElement(input_1.Input, { value: form.contactPerson, onChange: function (e) { return setForm(function (p) { return (__assign(__assign({}, p), { contactPerson: e.target.value })); }); }, placeholder: "John Doe" })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, null, "Phone"),
                            React.createElement(input_1.Input, { value: form.phone, onChange: function (e) { return setForm(function (p) { return (__assign(__assign({}, p), { phone: e.target.value })); }); }, placeholder: "+254 700 000 000" }))),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, null, "Status"),
                        React.createElement(select_1.Select, { value: form.status, onValueChange: function (v) { return setForm(function (p) { return (__assign(__assign({}, p), { status: v })); }); } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "active" }, "Active"),
                                React.createElement(select_1.SelectItem, { value: "inactive" }, "Inactive"))))),
                React.createElement(dialog_1.DialogFooter, null,
                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { setShowDialog(false); setEditing(null); } }, "Cancel"),
                    React.createElement(button_1.Button, { disabled: !form.name || createMut.isPending || updateMut.isPending, onClick: handleSave },
                        (createMut.isPending || updateMut.isPending) && React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin mr-1" }),
                        editing ? "Update" : "Create"))))));
}
exports["default"] = Warehouses;
