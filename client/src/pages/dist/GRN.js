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
var lucide_react_2 = require("lucide-react");
var sonner_1 = require("sonner");
var spinner_1 = require("@/components/ui/spinner");
var permissions_1 = require("@/lib/permissions");
var trpc_1 = require("@/lib/trpc");
var TableColumnSettings_1 = require("@/components/list-page/TableColumnSettings");
var emptyForm = { grnNo: "", supplier: "", invNo: "", receivedDate: "", items: "", value: "", status: "pending", notes: "" };
function GRNFormFields(_a) {
    var form = _a.form, setForm = _a.setForm;
    return (react_1["default"].createElement("div", { className: "grid gap-4 py-2" },
        react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-3" },
            react_1["default"].createElement("div", { className: "space-y-1" },
                react_1["default"].createElement(label_1.Label, null, "GRN Number *"),
                react_1["default"].createElement(input_1.Input, { value: form.grnNo, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { grnNo: e.target.value })); }); }, placeholder: "GRN-001" })),
            react_1["default"].createElement("div", { className: "space-y-1" },
                react_1["default"].createElement(label_1.Label, null, "Supplier *"),
                react_1["default"].createElement(input_1.Input, { value: form.supplier, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { supplier: e.target.value })); }); }, placeholder: "Supplier name" }))),
        react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-3" },
            react_1["default"].createElement("div", { className: "space-y-1" },
                react_1["default"].createElement(label_1.Label, null, "Invoice Number"),
                react_1["default"].createElement(input_1.Input, { value: form.invNo, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { invNo: e.target.value })); }); }, placeholder: "INV-001" })),
            react_1["default"].createElement("div", { className: "space-y-1" },
                react_1["default"].createElement(label_1.Label, null, "Received Date *"),
                react_1["default"].createElement(input_1.Input, { type: "date", value: form.receivedDate, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { receivedDate: e.target.value })); }); } }))),
        react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-3" },
            react_1["default"].createElement("div", { className: "space-y-1" },
                react_1["default"].createElement(label_1.Label, null, "Number of Items *"),
                react_1["default"].createElement(input_1.Input, { type: "number", value: form.items, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { items: e.target.value })); }); }, placeholder: "0" })),
            react_1["default"].createElement("div", { className: "space-y-1" },
                react_1["default"].createElement(label_1.Label, null, "Value (Ksh) *"),
                react_1["default"].createElement(input_1.Input, { type: "number", value: form.value, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { value: e.target.value })); }); }, placeholder: "0" }))),
        react_1["default"].createElement("div", { className: "space-y-1" },
            react_1["default"].createElement(label_1.Label, null, "Status"),
            react_1["default"].createElement(select_1.Select, { value: form.status, onValueChange: function (v) { return setForm(function (f) { return (__assign(__assign({}, f), { status: v })); }); } },
                react_1["default"].createElement(select_1.SelectTrigger, null,
                    react_1["default"].createElement(select_1.SelectValue, null)),
                react_1["default"].createElement(select_1.SelectContent, null,
                    react_1["default"].createElement(select_1.SelectItem, { value: "pending" }, "Pending"),
                    react_1["default"].createElement(select_1.SelectItem, { value: "accepted" }, "Accepted"),
                    react_1["default"].createElement(select_1.SelectItem, { value: "partial" }, "Partial"),
                    react_1["default"].createElement(select_1.SelectItem, { value: "rejected" }, "Rejected")))),
        react_1["default"].createElement("div", { className: "space-y-1" },
            react_1["default"].createElement(label_1.Label, null, "Notes"),
            react_1["default"].createElement(textarea_1.Textarea, { rows: 2, value: form.notes, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { notes: e.target.value })); }); } }))));
}
function GoodsReceivedNotes() {
    var _a, _b;
    var _c = permissions_1.useRequireFeature("grn:view"), allowed = _c.allowed, permissionLoading = _c.isLoading;
    // Column configuration
    var GRN_COLUMNS = [
        { key: "grnNo", label: "GRN #" },
        { key: "supplier", label: "Supplier" },
        { key: "items", label: "Items" },
        { key: "value", label: "Value" },
        { key: "receivedDate", label: "Received Date" },
        { key: "status", label: "Status" },
    ];
    // Sorting and pagination state
    var _d = react_1.useState("grnNo"), sortField = _d[0], setSortField = _d[1];
    var _e = react_1.useState("asc"), sortOrder = _e[0], setSortOrder = _e[1];
    var _f = react_1.useState(new Set()), selectedGRNs = _f[0], setSelectedGRNs = _f[1];
    var _g = react_1.useState(1), currentPage = _g[0], setCurrentPage = _g[1];
    var _h = react_1.useState(10), pageSize = _h[0], setPageSize = _h[1];
    var _j = TableColumnSettings_1.useColumnVisibility(GRN_COLUMNS, "grn"), visibleColumns = _j.visibleColumns, toggleColumn = _j.toggleColumn, isVisible = _j.isVisible;
    var _k = react_1.useState(""), searchQuery = _k[0], setSearchQuery = _k[1];
    var _l = react_1.useState("all"), statusFilter = _l[0], setStatusFilter = _l[1];
    var _m = react_1.useState(false), createOpen = _m[0], setCreateOpen = _m[1];
    var _o = react_1.useState(null), editingGRN = _o[0], setEditingGRN = _o[1];
    var _p = react_1.useState(__assign({}, emptyForm)), form = _p[0], setForm = _p[1];
    var utils = trpc_1.trpc.useUtils();
    var _search = wouter_1.useSearch();
    react_1.useEffect(function () { if (new URLSearchParams(_search).get("action") === "create")
        setCreateOpen(true); }, []);
    var _q = wouter_1.useLocation(), setLocation = _q[1];
    var _r = trpc_1.trpc.grn.list.useQuery({ limit: 100, offset: 0 }, { enabled: allowed }), grnData = _r.data, dataLoading = _r.isLoading;
    var grnList = (grnData === null || grnData === void 0 ? void 0 : grnData.data) || [];
    var createMutation = trpc_1.trpc.grn.create.useMutation({
        onSuccess: function () { utils.grn.list.invalidate(); sonner_1.toast.success("GRN created"); setCreateOpen(false); setForm(__assign({}, emptyForm)); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var updateMutation = trpc_1.trpc.grn.update.useMutation({
        onSuccess: function () { utils.grn.list.invalidate(); sonner_1.toast.success("GRN updated"); setEditingGRN(null); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var deleteMutation = trpc_1.trpc.grn["delete"].useMutation({
        onSuccess: function () { utils.grn.list.invalidate(); sonner_1.toast.success("GRN deleted"); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var bulkDeleteMutation = ((_b = (_a = trpc_1.trpc.grn.bulkDelete) === null || _a === void 0 ? void 0 : _a.useMutation) === null || _b === void 0 ? void 0 : _b.call(_a, {
        onSuccess: function () { utils.grn.list.invalidate(); sonner_1.toast.success("GRNs deleted"); setSelectedGRNs(new Set()); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    })) || { mutate: function () { }, isPending: false };
    // Computed properties for sorting and pagination (MUST be before permission checks to follow React hooks rules)
    var processedGRNs = react_1.useMemo(function () {
        var filtered = grnList.filter(function (g) {
            var matchesSearch = (g.grnNo || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (g.supplier || "").toLowerCase().includes(searchQuery.toLowerCase());
            var matchesStatus = statusFilter === "all" || g.status === statusFilter;
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
    }, [grnList, searchQuery, statusFilter, sortField, sortOrder]);
    var statCards = react_1.useMemo(function () {
        var totalCount = grnList.length;
        var totalValue = grnList.reduce(function (sum, g) { return sum + (g.value || 0); }, 0);
        var acceptedCount = grnList.filter(function (g) { return g.status === "accepted"; }).length;
        return [
            { label: "Total GRNs", value: totalCount, icon: "📦" },
            { label: "Total Value", value: "Ksh " + (totalValue / 100).toLocaleString(), icon: "💰" },
            { label: "Accepted", value: acceptedCount, icon: "✓" },
        ];
    }, [grnList]);
    var paginatedGRNs = react_1.useMemo(function () {
        var start = (currentPage - 1) * pageSize;
        return processedGRNs.slice(start, start + pageSize);
    }, [processedGRNs, currentPage, pageSize]);
    var totalPages = Math.ceil(processedGRNs.length / pageSize);
    var statusColor = function (status) { return status === "accepted" ? "default" : status === "partial" ? "secondary" : "destructive"; };
    var openEdit = function (g) {
        setEditingGRN(g);
        setForm({ grnNo: g.grnNo || "", supplier: g.supplier || "", invNo: g.invNo || "", receivedDate: g.receivedDate || "", items: String(g.items || ""), value: ((g.value || 0) / 100).toString(), status: g.status || "pending", notes: g.notes || "" });
    };
    var handleSubmit = function (isEdit) {
        var parsedItems = parseInt(form.items);
        var parsedValue = parseFloat(form.value);
        if (!parsedItems || parsedItems <= 0) {
            sonner_1.toast.error("Number of items must be greater than 0");
            return;
        }
        if (!parsedValue || parsedValue <= 0) {
            sonner_1.toast.error("Value must be greater than 0");
            return;
        }
        var payload = { grnNo: form.grnNo, supplier: form.supplier, invNo: form.invNo || undefined, receivedDate: form.receivedDate, items: parsedItems, value: parsedValue, status: form.status, notes: form.notes || undefined };
        if (isEdit && editingGRN)
            updateMutation.mutate(__assign({ id: editingGRN.id }, payload));
        else
            createMutation.mutate(payload);
    };
    if (permissionLoading)
        return react_1["default"].createElement("div", { className: "flex items-center justify-center h-screen" },
            react_1["default"].createElement(spinner_1.Spinner, null));
    if (!allowed)
        return react_1["default"].createElement("div", { className: "text-center py-10" }, "Access Denied");
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Goods Received Notes", description: "Manage goods received and acceptance", icon: react_1["default"].createElement(lucide_react_2.BoxIcon, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Procurement", href: "/procurement" }, { label: "GRN" }] },
        react_1["default"].createElement("div", { className: "space-y-6 p-4 sm:p-6" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("h2", { className: "text-2xl font-bold" }, "Goods Received Notes"),
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Record and track received goods")),
                react_1["default"].createElement(button_1.Button, { onClick: function () { setForm(__assign({}, emptyForm)); setCreateOpen(true); } },
                    react_1["default"].createElement(lucide_react_2.Plus, { className: "h-4 w-4 mr-2" }),
                    " New GRN")),
            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                react_1["default"].createElement(lucide_react_2.Search, { className: "h-4 w-4 text-muted-foreground" }),
                react_1["default"].createElement(input_1.Input, { placeholder: "Search GRNs...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "flex-1" })),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, null, "GRN Registry"),
                    react_1["default"].createElement(card_1.CardDescription, null,
                        processedGRNs.length,
                        " goods received notes")),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("div", { className: "space-y-4" },
                        react_1["default"].createElement("div", { className: "flex items-center gap-2 justify-between" },
                            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                                react_1["default"].createElement("span", { className: "text-sm text-muted-foreground" }, "Status:"),
                                react_1["default"].createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                                    react_1["default"].createElement(select_1.SelectTrigger, { className: "w-[140px]" },
                                        react_1["default"].createElement(select_1.SelectValue, null)),
                                    react_1["default"].createElement(select_1.SelectContent, null,
                                        react_1["default"].createElement(select_1.SelectItem, { value: "all" }, "All"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "pending" }, "Pending"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "accepted" }, "Accepted"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "partial" }, "Partial"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "rejected" }, "Rejected")))),
                            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                                react_1["default"].createElement("span", { className: "text-sm text-muted-foreground" }, "Sort:"),
                                react_1["default"].createElement(select_1.Select, { value: sortField, onValueChange: setSortField },
                                    react_1["default"].createElement(select_1.SelectTrigger, { className: "w-[140px]" },
                                        react_1["default"].createElement(select_1.SelectValue, null)),
                                    react_1["default"].createElement(select_1.SelectContent, null,
                                        react_1["default"].createElement(select_1.SelectItem, { value: "grnNo" }, "GRN #"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "supplier" }, "Supplier"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "items" }, "Items"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "value" }, "Value"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "receivedDate" }, "Date"))),
                                react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setSortOrder(sortOrder === "asc" ? "desc" : "asc"); } }, sortOrder === "asc" ? react_1["default"].createElement(lucide_react_1.ChevronUp, { className: "w-4 h-4" }) : react_1["default"].createElement(lucide_react_1.ChevronDown, { className: "w-4 h-4" })))),
                        react_1["default"].createElement("div", { className: "overflow-x-auto rounded-lg border" },
                            react_1["default"].createElement(table_1.Table, null,
                                react_1["default"].createElement(table_1.TableHeader, null,
                                    react_1["default"].createElement(table_1.TableRow, { className: "bg-muted/50" },
                                        react_1["default"].createElement(table_1.TableHead, { className: "font-semibold" }, "GRN #"),
                                        react_1["default"].createElement(table_1.TableHead, { className: "font-semibold" }, "Supplier"),
                                        react_1["default"].createElement(table_1.TableHead, { className: "font-semibold" }, "Invoice #"),
                                        react_1["default"].createElement(table_1.TableHead, { className: "font-semibold text-right" }, "Items"),
                                        react_1["default"].createElement(table_1.TableHead, { className: "font-semibold text-right" }, "Value"),
                                        react_1["default"].createElement(table_1.TableHead, { className: "font-semibold" }, "Received Date"),
                                        react_1["default"].createElement(table_1.TableHead, { className: "font-semibold" }, "Status"),
                                        react_1["default"].createElement(table_1.TableHead, { className: "font-semibold text-right" }, "Actions"))),
                                react_1["default"].createElement(table_1.TableBody, null, dataLoading ? (react_1["default"].createElement(table_1.TableRow, null,
                                    react_1["default"].createElement(table_1.TableCell, { colSpan: 8, className: "text-center py-8" },
                                        react_1["default"].createElement(spinner_1.Spinner, null)))) : paginatedGRNs.length === 0 ? (react_1["default"].createElement(table_1.TableRow, null,
                                    react_1["default"].createElement(table_1.TableCell, { colSpan: 8, className: "text-center py-8 text-muted-foreground" }, processedGRNs.length === 0 ? "No GRNs found. Click \"New GRN\" to add one." : "No results for current filters"))) : (paginatedGRNs.map(function (grn, idx) { return (react_1["default"].createElement(table_1.TableRow, { key: grn.id, className: idx % 2 === 1 ? "bg-muted/30" : "" },
                                    react_1["default"].createElement(table_1.TableCell, { className: "font-medium" }, grn.grnNo),
                                    react_1["default"].createElement(table_1.TableCell, null, grn.supplier),
                                    react_1["default"].createElement(table_1.TableCell, null, grn.invNo || "—"),
                                    react_1["default"].createElement(table_1.TableCell, { className: "text-right" }, grn.items),
                                    react_1["default"].createElement(table_1.TableCell, { className: "text-right" },
                                        "Ksh ",
                                        ((grn.value || 0) / 100).toLocaleString()),
                                    react_1["default"].createElement(table_1.TableCell, null, grn.receivedDate),
                                    react_1["default"].createElement(table_1.TableCell, null,
                                        react_1["default"].createElement(badge_1.Badge, { variant: statusColor(grn.status) }, grn.status)),
                                    react_1["default"].createElement(table_1.TableCell, { className: "text-right space-x-1" },
                                        react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return setLocation("/grn/" + grn.id); } },
                                            react_1["default"].createElement(lucide_react_2.Eye, { className: "h-4 w-4" })),
                                        react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return openEdit(grn); } },
                                            react_1["default"].createElement(lucide_react_2.Edit2, { className: "h-4 w-4" })),
                                        react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-red-500 hover:text-red-700", onClick: function () { if (confirm("Delete this GRN?"))
                                                deleteMutation.mutate(grn.id); } },
                                            react_1["default"].createElement(lucide_react_2.Trash2, { className: "h-4 w-4" }))))); }))))),
                        processedGRNs.length > 0 && (react_1["default"].createElement("div", { className: "flex items-center justify-between px-2 py-3 bg-muted/40 rounded-lg" },
                            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                                react_1["default"].createElement("span", { className: "text-sm text-muted-foreground" },
                                    "Showing ",
                                    (currentPage - 1) * pageSize + 1,
                                    "\u2013",
                                    Math.min(currentPage * pageSize, processedGRNs.length),
                                    " of ",
                                    processedGRNs.length),
                                react_1["default"].createElement("div", { className: "flex items-center gap-1.5" },
                                    react_1["default"].createElement("span", { className: "text-xs text-muted-foreground" }, "Per page:"),
                                    react_1["default"].createElement(select_1.Select, { value: pageSize.toString(), onValueChange: function (v) { setPageSize(Number(v)); setCurrentPage(1); } },
                                        react_1["default"].createElement(select_1.SelectTrigger, { className: "w-20 h-8" },
                                            react_1["default"].createElement(select_1.SelectValue, null)),
                                        react_1["default"].createElement(select_1.SelectContent, null,
                                            react_1["default"].createElement(select_1.SelectItem, { value: "5" }, "5"),
                                            react_1["default"].createElement(select_1.SelectItem, { value: "10" }, "10"),
                                            react_1["default"].createElement(select_1.SelectItem, { value: "25" }, "25"),
                                            react_1["default"].createElement(select_1.SelectItem, { value: "50" }, "50"))))),
                            react_1["default"].createElement("div", { className: "flex items-center gap-1" },
                                react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setCurrentPage(1); }, disabled: currentPage === 1, className: "h-8 px-2" },
                                    react_1["default"].createElement(ChevronsLeft, { className: "w-4 h-4" })),
                                react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setCurrentPage(Math.max(1, currentPage - 1)); }, disabled: currentPage === 1, className: "h-8 px-2" },
                                    react_1["default"].createElement(lucide_react_1.ChevronUp, { className: "w-4 h-4" })),
                                react_1["default"].createElement("span", { className: "text-sm text-muted-foreground px-3" },
                                    "Page ",
                                    currentPage,
                                    " of ",
                                    totalPages),
                                react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setCurrentPage(Math.min(totalPages, currentPage + 1)); }, disabled: currentPage === totalPages, className: "h-8 px-2" },
                                    react_1["default"].createElement(lucide_react_1.ChevronDown, { className: "w-4 h-4" })),
                                react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setCurrentPage(totalPages); }, disabled: currentPage === totalPages, className: "h-8 px-2" },
                                    react_1["default"].createElement(ChevronsRight, { className: "w-4 h-4" }))))))))),
        react_1["default"].createElement(dialog_1.Dialog, { open: createOpen, onOpenChange: function (v) { setCreateOpen(v); if (!v)
                setForm(__assign({}, emptyForm)); } },
            react_1["default"].createElement(dialog_1.DialogContent, { className: "max-w-xl" },
                react_1["default"].createElement(dialog_1.DialogHeader, null,
                    react_1["default"].createElement(dialog_1.DialogTitle, null, "New Goods Received Note")),
                react_1["default"].createElement(GRNFormFields, { form: form, setForm: setForm }),
                react_1["default"].createElement(dialog_1.DialogFooter, null,
                    react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return setCreateOpen(false); } }, "Cancel"),
                    react_1["default"].createElement(button_1.Button, { onClick: function () { return handleSubmit(false); }, disabled: createMutation.isPending || !form.grnNo || !form.supplier || !form.receivedDate || !form.items || !form.value }, createMutation.isPending ? "Saving..." : "Create GRN")))),
        react_1["default"].createElement(dialog_1.Dialog, { open: !!editingGRN, onOpenChange: function (v) { if (!v)
                setEditingGRN(null); } },
            react_1["default"].createElement(dialog_1.DialogContent, { className: "max-w-xl" },
                react_1["default"].createElement(dialog_1.DialogHeader, null,
                    react_1["default"].createElement(dialog_1.DialogTitle, null, "Edit GRN")),
                react_1["default"].createElement(GRNFormFields, { form: form, setForm: setForm }),
                react_1["default"].createElement(dialog_1.DialogFooter, null,
                    react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return setEditingGRN(null); } }, "Cancel"),
                    react_1["default"].createElement(button_1.Button, { onClick: function () { return handleSubmit(true); }, disabled: updateMutation.isPending }, updateMutation.isPending ? "Saving..." : "Save Changes"))))));
}
exports["default"] = GoodsReceivedNotes;
