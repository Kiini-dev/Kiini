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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
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
var checkbox_1 = require("@/components/ui/checkbox");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var spinner_1 = require("@/components/ui/spinner");
var permissions_1 = require("@/lib/permissions");
var trpc_1 = require("@/lib/trpc");
var date_fns_1 = require("date-fns");
var SummaryStatCards_1 = require("@/components/list-page/SummaryStatCards");
var RowActionsMenu_1 = require("@/components/list-page/RowActionsMenu");
var TableColumnSettings_1 = require("@/components/list-page/TableColumnSettings");
var data_table_controls_1 = require("@/components/ui/data-table-controls");
var emptyForm = { dnNo: "", supplier: "", orderId: "", deliveryDate: "", items: "", status: "pending", notes: "" };
var DELIVERY_NOTE_COLUMNS = [
    { key: "dnNo", label: "DN #" },
    { key: "supplier", label: "Supplier" },
    { key: "items", label: "Items" },
    { key: "deliveryDate", label: "Delivery Date" },
    { key: "status", label: "Status" },
];
function DeliveryNotes() {
    var _a;
    var _b = permissions_1.useRequireFeature("delivery_notes:view"), allowed = _b.allowed, permissionLoading = _b.isLoading;
    var _c = wouter_1.useLocation(), setLocation = _c[1];
    var _d = react_1.useState(""), searchQuery = _d[0], setSearchQuery = _d[1];
    var _e = react_1.useState("all"), statusFilter = _e[0], setStatusFilter = _e[1];
    var _f = react_1.useState("dnNo"), sortField = _f[0], setSortField = _f[1];
    var _g = react_1.useState("asc"), sortOrder = _g[0], setSortOrder = _g[1];
    var _h = react_1.useState(false), createOpen = _h[0], setCreateOpen = _h[1];
    var _j = react_1.useState(null), editingDN = _j[0], setEditingDN = _j[1];
    var _k = react_1.useState(__assign({}, emptyForm)), form = _k[0], setForm = _k[1];
    var _l = react_1.useState(new Set()), selectedNotes = _l[0], setSelectedNotes = _l[1];
    var _m = data_table_controls_1.usePagination(25), page = _m.page, pageSize = _m.pageSize, setPage = _m.setPage, setPageSize = _m.setPageSize, paginate = _m.paginate;
    var utils = trpc_1.trpc.useUtils();
    var _search = wouter_1.useSearch();
    var _o = TableColumnSettings_1.useColumnVisibility(DELIVERY_NOTE_COLUMNS, "deliveryNotes"), visibleColumns = _o.visibleColumns, toggleColumn = _o.toggleColumn, isVisible = _o.isVisible;
    react_1.useEffect(function () { if (new URLSearchParams(_search).get("action") === "create")
        setCreateOpen(true); }, []);
    var _p = trpc_1.trpc.deliveryNotes.list.useQuery({ limit: 50, offset: 0 }, { enabled: allowed }), notesData = _p.data, dataLoading = _p.isLoading;
    var deliveryNotes = (notesData === null || notesData === void 0 ? void 0 : notesData.data) || [];
    var createMutation = trpc_1.trpc.deliveryNotes.create.useMutation({
        onSuccess: function () { utils.deliveryNotes.list.invalidate(); sonner_1.toast.success("Delivery note created"); setCreateOpen(false); setForm(__assign({}, emptyForm)); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var updateMutation = trpc_1.trpc.deliveryNotes.update.useMutation({
        onSuccess: function () { utils.deliveryNotes.list.invalidate(); sonner_1.toast.success("Delivery note updated"); setEditingDN(null); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var deleteMutation = trpc_1.trpc.deliveryNotes["delete"].useMutation({
        onSuccess: function () { utils.deliveryNotes.list.invalidate(); sonner_1.toast.success("Delivery note deleted"); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var bulkDeleteMutation = (_a = trpc_1.trpc.deliveryNotes.bulkDelete) === null || _a === void 0 ? void 0 : _a.useMutation({
        onSuccess: function () { utils.deliveryNotes.list.invalidate(); sonner_1.toast.success("Delivery notes deleted"); setSelectedNotes(new Set()); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var processedNotes = react_1.useMemo(function () {
        var filtered = deliveryNotes.filter(function (d) {
            var matchesSearch = d.dnNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.supplier.toLowerCase().includes(searchQuery.toLowerCase());
            var matchesStatus = statusFilter === "all" || d.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
        filtered.sort(function (a, b) {
            var aVal = a[sortField] || "";
            var bVal = b[sortField] || "";
            if (aVal < bVal)
                return sortOrder === "asc" ? -1 : 1;
            if (aVal > bVal)
                return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
        return filtered;
    }, [deliveryNotes, searchQuery, statusFilter, sortField, sortOrder]);
    var statCards = react_1.useMemo(function () {
        var totalCount = deliveryNotes.length;
        var deliveredCount = deliveryNotes.filter(function (d) { return d.status === "delivered"; }).length;
        var totalItems = deliveryNotes.reduce(function (sum, d) { return sum + (d.items || 0); }, 0);
        return [
            { label: "Total Delivery Notes", value: totalCount, icon: "📦" },
            { label: "Delivered", value: deliveredCount, icon: "✓" },
            { label: "Total Items", value: totalItems, icon: "📊" },
        ];
    }, [deliveryNotes]);
    if (permissionLoading)
        return React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, null));
    if (!allowed)
        return null;
    var paginatedNotes = processedNotes.slice((page - 1) * pageSize, page * pageSize);
    var totalPages = Math.ceil(processedNotes.length / pageSize);
    var toggleSelectAll = function () {
        if (selectedNotes.size === paginatedNotes.length) {
            setSelectedNotes(new Set());
        }
        else {
            setSelectedNotes(new Set(paginatedNotes.map(function (d) { return d.id; })));
        }
    };
    var toggleSelectNote = function (id) {
        var newSelected = new Set(selectedNotes);
        if (newSelected.has(id)) {
            newSelected["delete"](id);
        }
        else {
            newSelected.add(id);
        }
        setSelectedNotes(newSelected);
    };
    var statusColor = function (status) { return status === "delivered" ? "default" : status === "partial" ? "secondary" : "outline"; };
    var openEdit = function (d) {
        setEditingDN(d);
        setForm({ dnNo: d.dnNo || "", supplier: d.supplier || "", orderId: d.orderId || "", deliveryDate: d.deliveryDate || "", items: String(d.items || ""), status: d.status || "pending", notes: d.notes || "" });
    };
    var handleSubmit = function (isEdit) {
        var payload = { dnNo: form.dnNo, supplier: form.supplier, orderId: form.orderId || undefined, deliveryDate: form.deliveryDate, items: parseInt(form.items) || 0, status: form.status, notes: form.notes || undefined };
        if (isEdit && editingDN)
            updateMutation.mutate(__assign({ id: editingDN.id }, payload));
        else
            createMutation.mutate(payload);
    };
    var DNForm = function () { return (React.createElement("div", { className: "grid gap-4 py-2" },
        React.createElement("div", { className: "grid grid-cols-2 gap-3" },
            React.createElement("div", { className: "space-y-1" },
                React.createElement(label_1.Label, null, "DN Number *"),
                React.createElement(input_1.Input, { value: form.dnNo, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { dnNo: e.target.value })); }); }, placeholder: "DN-001" })),
            React.createElement("div", { className: "space-y-1" },
                React.createElement(label_1.Label, null, "Supplier *"),
                React.createElement(input_1.Input, { value: form.supplier, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { supplier: e.target.value })); }); }, placeholder: "Supplier name" }))),
        React.createElement("div", { className: "grid grid-cols-2 gap-3" },
            React.createElement("div", { className: "space-y-1" },
                React.createElement(label_1.Label, null, "Order Reference"),
                React.createElement(input_1.Input, { value: form.orderId, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { orderId: e.target.value })); }); }, placeholder: "PO-001" })),
            React.createElement("div", { className: "space-y-1" },
                React.createElement(label_1.Label, null, "Delivery Date *"),
                React.createElement(input_1.Input, { type: "date", value: form.deliveryDate, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { deliveryDate: e.target.value })); }); } }))),
        React.createElement("div", { className: "grid grid-cols-2 gap-3" },
            React.createElement("div", { className: "space-y-1" },
                React.createElement(label_1.Label, null, "Number of Items *"),
                React.createElement(input_1.Input, { type: "number", value: form.items, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { items: e.target.value })); }); }, placeholder: "0" })),
            React.createElement("div", { className: "space-y-1" },
                React.createElement(label_1.Label, null, "Status"),
                React.createElement(select_1.Select, { value: form.status, onValueChange: function (v) { return setForm(function (f) { return (__assign(__assign({}, f), { status: v })); }); } },
                    React.createElement(select_1.SelectTrigger, null,
                        React.createElement(select_1.SelectValue, null)),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "pending" }, "Pending"),
                        React.createElement(select_1.SelectItem, { value: "partial" }, "Partial"),
                        React.createElement(select_1.SelectItem, { value: "delivered" }, "Delivered"),
                        React.createElement(select_1.SelectItem, { value: "cancelled" }, "Cancelled"))))),
        React.createElement("div", { className: "space-y-1" },
            React.createElement(label_1.Label, null, "Notes"),
            React.createElement(textarea_1.Textarea, { rows: 2, value: form.notes, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { notes: e.target.value })); }); } })))); };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Delivery Notes", description: "Track incoming shipments and deliveries", icon: React.createElement(lucide_react_1.Package, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Procurement", href: "/procurement" }, { label: "Delivery Notes" }] },
        React.createElement("div", { className: "space-y-6 p-4 sm:p-6" },
            React.createElement("div", { className: "flex flex-col gap-2" },
                React.createElement("h2", { className: "text-2xl font-bold" }, "Delivery Notes"),
                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Track and manage incoming deliveries")),
            React.createElement(SummaryStatCards_1.SummaryStatCards, { cards: statCards }),
            React.createElement("div", { className: "space-y-4" },
                React.createElement("div", { className: "flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between" },
                    React.createElement("div", { className: "flex-1 flex items-center gap-2" },
                        React.createElement(lucide_react_1.Search, { className: "h-4 w-4 text-muted-foreground" }),
                        React.createElement(input_1.Input, { placeholder: "Search by DN # or supplier...", value: searchQuery, onChange: function (e) { setSearchQuery(e.target.value); setPage(1); ; }, className: "flex-1" })),
                    React.createElement(select_1.Select, { value: statusFilter, onValueChange: function (v) { setStatusFilter(v); setPage(1); } },
                        React.createElement(select_1.SelectTrigger, { className: "w-full sm:w-40" },
                            React.createElement(select_1.SelectValue, { placeholder: "Filter by status" })),
                        React.createElement(select_1.SelectContent, null,
                            React.createElement(select_1.SelectItem, { value: "all" }, "All Statuses"),
                            React.createElement(select_1.SelectItem, { value: "pending" }, "Pending"),
                            React.createElement(select_1.SelectItem, { value: "partial" }, "Partial"),
                            React.createElement(select_1.SelectItem, { value: "delivered" }, "Delivered"),
                            React.createElement(select_1.SelectItem, { value: "cancelled" }, "Cancelled"))),
                    React.createElement(TableColumnSettings_1.TableColumnSettings, { columns: DELIVERY_NOTE_COLUMNS, visibleColumns: visibleColumns, toggleColumn: toggleColumn }),
                    React.createElement(button_1.Button, { onClick: function () { setForm(__assign({}, emptyForm)); setCreateOpen(true); }, className: "gap-2" },
                        React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
                        " New DN")),
                selectedNotes.size > 0 && (React.createElement("div", { className: "flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md" },
                    React.createElement("span", { className: "text-sm" },
                        selectedNotes.size,
                        " selected"),
                    React.createElement(button_1.Button, { size: "sm", variant: "destructive", onClick: function () {
                            if (confirm("Delete selected delivery notes?")) {
                                bulkDeleteMutation === null || bulkDeleteMutation === void 0 ? void 0 : bulkDeleteMutation.mutate(__spreadArrays(selectedNotes));
                            }
                        } }, "Delete")))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "p-0" }, dataLoading ? (React.createElement("div", { className: "flex items-center justify-center h-32" },
                    React.createElement(spinner_1.Spinner, null))) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, { className: "w-12" },
                                    React.createElement(checkbox_1.Checkbox, { checked: selectedNotes.size === paginatedNotes.length && paginatedNotes.length > 0, onCheckedChange: toggleSelectAll })),
                                isVisible("dnNo") && React.createElement(table_1.TableHead, null, "DN #"),
                                isVisible("supplier") && React.createElement(table_1.TableHead, null, "Supplier"),
                                isVisible("items") && React.createElement(table_1.TableHead, null, "Items"),
                                isVisible("deliveryDate") && React.createElement(table_1.TableHead, null, "Delivery Date"),
                                isVisible("status") && React.createElement(table_1.TableHead, null, "Status"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, paginatedNotes.length === 0 ? (React.createElement(table_1.TableRow, null,
                            React.createElement(table_1.TableCell, { colSpan: 7, className: "text-center py-8 text-muted-foreground" }, processedNotes.length === 0 ? "No delivery notes found" : "No results for current filters"))) : (paginatedNotes.map(function (dn) { return (React.createElement(table_1.TableRow, { key: dn.id },
                            React.createElement(table_1.TableCell, null,
                                React.createElement(checkbox_1.Checkbox, { checked: selectedNotes.has(dn.id), onCheckedChange: function () { return toggleSelectNote(dn.id); } })),
                            isVisible("dnNo") && React.createElement(table_1.TableCell, { className: "font-medium" }, dn.dnNo),
                            isVisible("supplier") && React.createElement(table_1.TableCell, null, dn.supplier),
                            isVisible("items") && React.createElement(table_1.TableCell, null, dn.items),
                            isVisible("deliveryDate") && React.createElement(table_1.TableCell, null, dn.deliveryDate ? date_fns_1.format(new Date(dn.deliveryDate), "MMM dd, yyyy") : "—"),
                            isVisible("status") && React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { variant: statusColor(dn.status) }, dn.status)),
                            React.createElement(table_1.TableCell, { className: "text-right" },
                                React.createElement(RowActionsMenu_1.RowActionsMenu, { actions: [
                                        { label: "View", icon: lucide_react_1.Eye, onClick: function () { return setLocation("/delivery-notes/" + dn.id); } },
                                        { label: "Edit", icon: lucide_react_1.Edit2, onClick: function () { return openEdit(dn); } },
                                        { label: "Delete", icon: lucide_react_1.Trash2, onClick: function () { if (confirm("Delete?"))
                                                deleteMutation.mutate(dn.id); }, isDangerous: true },
                                    ] })))); })))))))),
            totalPages > 1 && (React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", { className: "text-sm text-muted-foreground" },
                    "Showing ",
                    Math.min((page - 1) * pageSize + 1, processedNotes.length),
                    " to ",
                    Math.min(page * pageSize, processedNotes.length),
                    " of ",
                    processedNotes.length),
                React.createElement("div", { className: "flex gap-2" },
                    React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setPage(function (p) { return Math.max(1, p - 1); }); }, disabled: page === 1 }, "Previous"),
                    React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setPage(function (p) { return Math.min(totalPages, p + 1); }); }, disabled: page === totalPages }, "Next")),
                React.createElement(select_1.Select, { value: pageSize.toString(), onValueChange: function (v) { setPageSize(parseInt(v)); setPage(1); } },
                    React.createElement(select_1.SelectTrigger, { className: "w-24" },
                        React.createElement(select_1.SelectValue, null)),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "5" }, "5 per page"),
                        React.createElement(select_1.SelectItem, { value: "10" }, "10 per page"),
                        React.createElement(select_1.SelectItem, { value: "25" }, "25 per page"),
                        React.createElement(select_1.SelectItem, { value: "50" }, "50 per page")))))),
        React.createElement(dialog_1.Dialog, { open: createOpen, onOpenChange: function (v) { setCreateOpen(v); if (!v)
                setForm(__assign({}, emptyForm)); } },
            React.createElement(dialog_1.DialogContent, { className: "max-w-xl" },
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "New Delivery Note")),
                React.createElement(DNForm, null),
                React.createElement(dialog_1.DialogFooter, null,
                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setCreateOpen(false); } }, "Cancel"),
                    React.createElement(button_1.Button, { onClick: function () { return handleSubmit(false); }, disabled: createMutation.isPending || !form.dnNo || !form.supplier || !form.deliveryDate || !form.items }, createMutation.isPending ? "Saving..." : "Create Delivery Note")))),
        React.createElement(dialog_1.Dialog, { open: !!editingDN, onOpenChange: function (v) { if (!v)
                setEditingDN(null); } },
            React.createElement(dialog_1.DialogContent, { className: "max-w-xl" },
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "Edit Delivery Note")),
                React.createElement(DNForm, null),
                React.createElement(dialog_1.DialogFooter, null,
                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setEditingDN(null); } }, "Cancel"),
                    React.createElement(button_1.Button, { onClick: function () { return handleSubmit(true); }, disabled: updateMutation.isPending }, updateMutation.isPending ? "Saving..." : "Save Changes"))))));
}
exports["default"] = DeliveryNotes;
