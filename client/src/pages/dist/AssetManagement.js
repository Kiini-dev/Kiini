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
var textarea_1 = require("@/components/ui/textarea");
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var spinner_1 = require("@/components/ui/spinner");
var permissions_1 = require("@/lib/permissions");
var trpc_1 = require("@/lib/trpc");
var data_table_controls_1 = require("@/components/ui/data-table-controls");
var emptyForm = { name: "", category: "", location: "", value: "", assignedTo: "", serialNumber: "", purchaseDate: "", status: "active", notes: "" };
function AssetManagement() {
    var _a;
    var _b = permissions_1.useRequireFeature("assets:view"), allowed = _b.allowed, permissionLoading = _b.isLoading;
    var _c = react_1.useState(""), searchQuery = _c[0], setSearchQuery = _c[1];
    var _d = react_1.useState("all"), statusFilter = _d[0], setStatusFilter = _d[1];
    var _e = react_1.useState("name"), sortField = _e[0], setSortField = _e[1];
    var _f = react_1.useState("asc"), sortOrder = _f[0], setSortOrder = _f[1];
    var _g = react_1.useState(false), createOpen = _g[0], setCreateOpen = _g[1];
    var _h = react_1.useState(null), editingAsset = _h[0], setEditingAsset = _h[1];
    var _j = react_1.useState(__assign({}, emptyForm)), form = _j[0], setForm = _j[1];
    var _k = react_1.useState(new Set()), selectedAssets = _k[0], setSelectedAssets = _k[1];
    var _l = data_table_controls_1.usePagination(25), page = _l.page, pageSize = _l.pageSize, setPage = _l.setPage, setPageSize = _l.setPageSize, paginate = _l.paginate;
    var utils = trpc_1.trpc.useUtils();
    var _m = wouter_1.useLocation(), setLocation = _m[1];
    var _search = wouter_1.useSearch();
    react_1.useEffect(function () { if (new URLSearchParams(_search).get("action") === "create")
        setCreateOpen(true); }, []);
    var _o = trpc_1.trpc.assets.list.useQuery({}), rawData = _o.data, dataLoading = _o.isLoading;
    var assets = JSON.parse(JSON.stringify((_a = rawData === null || rawData === void 0 ? void 0 : rawData.data) !== null && _a !== void 0 ? _a : []));
    var createMutation = trpc_1.trpc.assets.create.useMutation({
        onSuccess: function () { utils.assets.list.invalidate(); sonner_1.toast.success("Asset registered"); setCreateOpen(false); setForm(__assign({}, emptyForm)); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var updateMutation = trpc_1.trpc.assets.update.useMutation({
        onSuccess: function () { utils.assets.list.invalidate(); sonner_1.toast.success("Asset updated"); setEditingAsset(null); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var deleteMutation = trpc_1.trpc.assets["delete"].useMutation({
        onSuccess: function () { utils.assets.list.invalidate(); sonner_1.toast.success("Asset deleted"); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    if (permissionLoading)
        return React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, null));
    if (!allowed)
        return null;
    var filteredAssets = assets.filter(function (a) {
        return (a.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (a.category || "").toLowerCase().includes(searchQuery.toLowerCase());
    });
    var openEdit = function (a) {
        setEditingAsset(a);
        setForm({ name: a.name || "", category: a.category || "", location: a.location || "", value: ((a.value || 0) / 100).toString(), assignedTo: a.assignedTo || "", serialNumber: a.serialNumber || "", purchaseDate: a.purchaseDate || "", status: a.status || "active", notes: a.notes || "" });
    };
    var handleSubmit = function (isEdit) {
        var payload = { name: form.name, category: form.category, location: form.location, value: parseFloat(form.value) || 0, assignedTo: form.assignedTo || undefined, serialNumber: form.serialNumber || undefined, purchaseDate: form.purchaseDate || undefined, status: form.status, notes: form.notes || undefined };
        if (isEdit && editingAsset)
            updateMutation.mutate(__assign({ id: editingAsset.id }, payload));
        else
            createMutation.mutate(payload);
    };
    var AssetForm = function () { return (React.createElement("div", { className: "grid gap-4 py-2" },
        React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" },
            React.createElement("div", { className: "space-y-1" },
                React.createElement(label_1.Label, null, "Asset Name *"),
                React.createElement(input_1.Input, { value: form.name, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { name: e.target.value })); }); }, placeholder: "e.g. Dell Laptop" })),
            React.createElement("div", { className: "space-y-1" },
                React.createElement(label_1.Label, null, "Category *"),
                React.createElement(input_1.Input, { value: form.category, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { category: e.target.value })); }); }, placeholder: "e.g. ICT, Furniture" }))),
        React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" },
            React.createElement("div", { className: "space-y-1" },
                React.createElement(label_1.Label, null, "Location *"),
                React.createElement(input_1.Input, { value: form.location, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { location: e.target.value })); }); }, placeholder: "e.g. HQ Office" })),
            React.createElement("div", { className: "space-y-1" },
                React.createElement(label_1.Label, null, "Value (Ksh) *"),
                React.createElement(input_1.Input, { type: "number", value: form.value, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { value: e.target.value })); }); }, placeholder: "0" }))),
        React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" },
            React.createElement("div", { className: "space-y-1" },
                React.createElement(label_1.Label, null, "Assigned To"),
                React.createElement(input_1.Input, { value: form.assignedTo, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { assignedTo: e.target.value })); }); }, placeholder: "Employee name" })),
            React.createElement("div", { className: "space-y-1" },
                React.createElement(label_1.Label, null, "Serial Number"),
                React.createElement(input_1.Input, { value: form.serialNumber, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { serialNumber: e.target.value })); }); }, placeholder: "SN-12345" }))),
        React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" },
            React.createElement("div", { className: "space-y-1" },
                React.createElement(label_1.Label, null, "Purchase Date"),
                React.createElement(input_1.Input, { type: "date", value: form.purchaseDate, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { purchaseDate: e.target.value })); }); } })),
            React.createElement("div", { className: "space-y-1" },
                React.createElement(label_1.Label, null, "Status"),
                React.createElement(select_1.Select, { value: form.status, onValueChange: function (v) { return setForm(function (f) { return (__assign(__assign({}, f), { status: v })); }); } },
                    React.createElement(select_1.SelectTrigger, null,
                        React.createElement(select_1.SelectValue, null)),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "active" }, "Active"),
                        React.createElement(select_1.SelectItem, { value: "inactive" }, "Inactive"),
                        React.createElement(select_1.SelectItem, { value: "maintenance" }, "Maintenance"),
                        React.createElement(select_1.SelectItem, { value: "disposed" }, "Disposed"))))),
        React.createElement("div", { className: "space-y-1" },
            React.createElement(label_1.Label, null, "Notes"),
            React.createElement(textarea_1.Textarea, { rows: 2, value: form.notes, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { notes: e.target.value })); }); } })))); };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Asset Management", description: "Track and manage company assets", icon: React.createElement(lucide_react_1.Package, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Assets" }] },
        React.createElement("div", { className: "space-y-6 p-4 sm:p-6" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", null,
                    React.createElement("h2", { className: "text-2xl font-bold" }, "Assets"),
                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "Manage company assets and equipment")),
                React.createElement(button_1.Button, { onClick: function () { setForm(__assign({}, emptyForm)); setCreateOpen(true); } },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                    " Register Asset")),
            React.createElement("div", { className: "flex items-center gap-2" },
                React.createElement(lucide_react_1.Search, { className: "h-4 w-4 text-muted-foreground" }),
                React.createElement(input_1.Input, { placeholder: "Search assets...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "flex-1" })),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Asset Inventory"),
                    React.createElement(card_1.CardDescription, null,
                        filteredAssets.length,
                        " assets registered")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "overflow-x-auto" },
                        React.createElement(table_1.Table, null,
                            React.createElement(table_1.TableHeader, null,
                                React.createElement(table_1.TableRow, null,
                                    React.createElement(table_1.TableHead, null, "Asset Name"),
                                    React.createElement(table_1.TableHead, null, "Category"),
                                    React.createElement(table_1.TableHead, null, "Location"),
                                    React.createElement(table_1.TableHead, null, "Assigned To"),
                                    React.createElement(table_1.TableHead, null, "Value"),
                                    React.createElement(table_1.TableHead, null, "Status"),
                                    React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                            React.createElement(table_1.TableBody, null, dataLoading ? (React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableCell, { colSpan: 7, className: "text-center py-8" },
                                    React.createElement(spinner_1.Spinner, null)))) : filteredAssets.length === 0 ? (React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableCell, { colSpan: 7, className: "text-center py-8 text-muted-foreground" }, "No assets found. Click \"Register Asset\" to add one."))) : filteredAssets.map(function (asset) { return (React.createElement(table_1.TableRow, { key: asset.id },
                                React.createElement(table_1.TableCell, { className: "font-medium" }, asset.name),
                                React.createElement(table_1.TableCell, null, asset.category),
                                React.createElement(table_1.TableCell, null, asset.location),
                                React.createElement(table_1.TableCell, null, asset.assignedTo || "—"),
                                React.createElement(table_1.TableCell, null,
                                    "Ksh ",
                                    ((asset.value || 0) / 100).toLocaleString()),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(badge_1.Badge, { variant: "default" }, asset.status || "active")),
                                React.createElement(table_1.TableCell, { className: "text-right space-x-1" },
                                    React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return setLocation("/assets/" + asset.id); } },
                                        React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                    React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return openEdit(asset); } },
                                        React.createElement(lucide_react_1.Edit2, { className: "h-4 w-4" })),
                                    React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-red-500", onClick: function () { if (confirm("Delete this asset?"))
                                            deleteMutation.mutate(asset.id); } },
                                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))))); }))))))),
        React.createElement(dialog_1.Dialog, { open: createOpen, onOpenChange: function (v) { setCreateOpen(v); if (!v)
                setForm(__assign({}, emptyForm)); } },
            React.createElement(dialog_1.DialogContent, { className: "max-w-xl" },
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "Register Asset")),
                React.createElement(AssetForm, null),
                React.createElement(dialog_1.DialogFooter, null,
                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setCreateOpen(false); } }, "Cancel"),
                    React.createElement(button_1.Button, { onClick: function () { return handleSubmit(false); }, disabled: createMutation.isPending || !form.name || !form.category || !form.location || !form.value }, createMutation.isPending ? "Saving..." : "Register Asset")))),
        React.createElement(dialog_1.Dialog, { open: !!editingAsset, onOpenChange: function (v) { if (!v)
                setEditingAsset(null); } },
            React.createElement(dialog_1.DialogContent, { className: "max-w-xl" },
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "Edit Asset")),
                React.createElement(AssetForm, null),
                React.createElement(dialog_1.DialogFooter, null,
                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setEditingAsset(null); } }, "Cancel"),
                    React.createElement(button_1.Button, { onClick: function () { return handleSubmit(true); }, disabled: updateMutation.isPending }, updateMutation.isPending ? "Saving..." : "Save Changes"))))));
}
exports["default"] = AssetManagement;
