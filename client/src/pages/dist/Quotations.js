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
var spinner_1 = require("@/components/ui/spinner");
var permissions_1 = require("@/lib/permissions");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var date_fns_1 = require("date-fns");
var data_table_controls_1 = require("@/components/ui/data-table-controls");
var SummaryStatCards_1 = require("@/components/list-page/SummaryStatCards");
var TableColumnSettings_1 = require("@/components/list-page/TableColumnSettings");
var RowActionsMenu_1 = require("@/components/list-page/RowActionsMenu");
var emptyForm = { rfqNo: "", supplier: "", description: "", amount: "", dueDate: "", status: "draft" };
var QUOTATION_COLUMNS = [
    { key: "id", label: "ID", defaultVisible: true },
    { key: "rfqNo", label: "RFQ #", defaultVisible: true },
    { key: "supplier", label: "Supplier", defaultVisible: true },
    { key: "amount", label: "Amount", defaultVisible: true },
    { key: "dueDate", label: "Due Date", defaultVisible: true },
    { key: "status", label: "Status", defaultVisible: true },
    { key: "description", label: "Description", defaultVisible: false },
    { key: "submittedDate", label: "Submitted", defaultVisible: false },
];
function QuotationsPage() {
    var _a;
    var _b = permissions_1.useRequireFeature("quotations:view"), allowed = _b.allowed, permissionLoading = _b.isLoading;
    var _c = react_1.useState(""), searchQuery = _c[0], setSearchQuery = _c[1];
    var _d = react_1.useState("all"), statusFilter = _d[0], setStatusFilter = _d[1];
    var _e = react_1.useState("rfqNo"), sortField = _e[0], setSortField = _e[1];
    var _f = react_1.useState("asc"), sortOrder = _f[0], setSortOrder = _f[1];
    var _g = react_1.useState(false), createOpen = _g[0], setCreateOpen = _g[1];
    var _h = react_1.useState(null), editingRFQ = _h[0], setEditingRFQ = _h[1];
    var _j = react_1.useState(__assign({}, emptyForm)), form = _j[0], setForm = _j[1];
    var _k = react_1.useState(new Set()), selectedQuotations = _k[0], setSelectedQuotations = _k[1];
    var _l = react_1.useState(false), isExporting = _l[0], setIsExporting = _l[1];
    var _m = data_table_controls_1.usePagination(25), currentPage = _m.page, pageSize = _m.pageSize, setCurrentPage = _m.setPage, setPageSize = _m.setPageSize, paginate = _m.paginate;
    var _o = TableColumnSettings_1.useColumnVisibility(QUOTATION_COLUMNS, "quotations"), visibleColumns = _o.visibleColumns, toggleColumn = _o.toggleColumn, isVisible = _o.isVisible, colPageSize = _o.pageSize, updatePageSize = _o.updatePageSize, reset = _o.reset;
    var utils = trpc_1.trpc.useUtils();
    var _p = wouter_1.useLocation(), setLocation = _p[1];
    var _search = wouter_1.useSearch();
    react_1.useEffect(function () { if (new URLSearchParams(_search).get("action") === "create")
        setCreateOpen(true); }, []);
    var _q = trpc_1.trpc.quotations.list.useQuery({}, { enabled: allowed }), quotationsData = _q.data, dataLoading = _q.isLoading;
    var quotations = (quotationsData === null || quotationsData === void 0 ? void 0 : quotationsData.data) || [];
    var createMutation = trpc_1.trpc.quotations.create.useMutation({
        onSuccess: function () { utils.quotations.list.invalidate(); sonner_1.toast.success("RFQ created"); setCreateOpen(false); setForm(__assign({}, emptyForm)); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var updateMutation = trpc_1.trpc.quotations.update.useMutation({
        onSuccess: function () { utils.quotations.list.invalidate(); sonner_1.toast.success("RFQ updated"); setEditingRFQ(null); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var deleteMutation = trpc_1.trpc.quotations["delete"].useMutation({
        onSuccess: function () { utils.quotations.list.invalidate(); sonner_1.toast.success("RFQ deleted"); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var bulkDeleteMutation = (_a = trpc_1.trpc.quotations.bulkDelete) === null || _a === void 0 ? void 0 : _a.useMutation({
        onSuccess: function (data) { utils.quotations.list.invalidate(); sonner_1.toast.success(((data === null || data === void 0 ? void 0 : data.count) || 0) + " quotation(s) deleted"); setSelectedQuotations(new Set()); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var processedQuotations = react_1.useMemo(function () {
        var filtered = quotations.filter(function (q) {
            var matchesSearch = (q.rfqNo || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (q.supplier || "").toLowerCase().includes(searchQuery.toLowerCase());
            var matchesStatus = statusFilter === "all" || q.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
        filtered.sort(function (a, b) {
            var aVal = a[sortField] || "";
            var bVal = b[sortField] || "";
            if (sortField === "amount") {
                aVal = parseFloat(String(aVal));
                bVal = parseFloat(String(bVal));
            }
            else if (sortField === "dueDate") {
                aVal = new Date(aVal || 0).getTime();
                bVal = new Date(bVal || 0).getTime();
            }
            if (sortOrder === "asc") {
                return aVal > bVal ? 1 : -1;
            }
            else {
                return aVal < bVal ? 1 : -1;
            }
        });
        return filtered;
    }, [quotations, searchQuery, statusFilter, sortField, sortOrder]);
    var statCards = react_1.useMemo(function () {
        var totalCount = quotations.length;
        var totalAmount = quotations.reduce(function (sum, q) { return sum + (q.amount || 0); }, 0);
        var approvedCount = quotations.filter(function (q) { return q.status === "approved"; }).length;
        var draftCount = quotations.filter(function (q) { return q.status === "draft"; }).length;
        var fmt = function (v) { return "Ksh " + v.toLocaleString(undefined, { minimumFractionDigits: 2 }); };
        return [
            { label: "Total RFQs", value: fmt(totalAmount), count: totalCount, color: "blue", progress: 100 },
            { label: "Approved", value: approvedCount.toString(), count: approvedCount, color: "green", progress: totalCount > 0 ? (approvedCount / totalCount) * 100 : 0 },
            { label: "Drafts", value: draftCount.toString(), count: draftCount, color: "orange", progress: totalCount > 0 ? (draftCount / totalCount) * 100 : 0 },
        ];
    }, [quotations]);
    if (permissionLoading)
        return React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, null));
    if (!allowed)
        return null;
    var paginatedQuotations = paginate(processedQuotations);
    var totalPages = Math.ceil(processedQuotations.length / pageSize);
    var toggleSelectAll = function () {
        if (selectedQuotations.size === paginatedQuotations.length) {
            setSelectedQuotations(new Set());
        }
        else {
            setSelectedQuotations(new Set(paginatedQuotations.map(function (q) { return q.id; })));
        }
    };
    var toggleSelectQuotation = function (id) {
        var newSelected = new Set(selectedQuotations);
        if (newSelected.has(id)) {
            newSelected["delete"](id);
        }
        else {
            newSelected.add(id);
        }
        setSelectedQuotations(newSelected);
    };
    var statusColor = function (status) { return status === "approved" ? "default" : status === "under_review" ? "secondary" : "outline"; };
    var openEdit = function (q) {
        setEditingRFQ(q);
        setForm({ rfqNo: q.rfqNo || "", supplier: q.supplier || "", description: q.description || "", amount: ((q.amount || 0) / 100).toString(), dueDate: q.dueDate || "", status: q.status || "draft" });
    };
    var handleSubmit = function (isEdit) {
        var payload = { rfqNo: form.rfqNo, supplier: form.supplier, description: form.description || undefined, amount: parseFloat(form.amount) || 0, dueDate: form.dueDate || undefined, status: form.status };
        if (isEdit && editingRFQ)
            updateMutation.mutate(__assign({ id: editingRFQ.id }, payload));
        else
            createMutation.mutate(payload);
    };
    var RFQForm = function () { return (React.createElement("div", { className: "grid gap-4 py-2" },
        React.createElement("div", { className: "grid grid-cols-2 gap-3" },
            React.createElement("div", { className: "space-y-1" },
                React.createElement(label_1.Label, null, "RFQ Number *"),
                React.createElement(input_1.Input, { value: form.rfqNo, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { rfqNo: e.target.value })); }); }, placeholder: "RFQ-001" })),
            React.createElement("div", { className: "space-y-1" },
                React.createElement(label_1.Label, null, "Supplier *"),
                React.createElement(input_1.Input, { value: form.supplier, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { supplier: e.target.value })); }); }, placeholder: "Supplier name" }))),
        React.createElement("div", { className: "grid grid-cols-2 gap-3" },
            React.createElement("div", { className: "space-y-1" },
                React.createElement(label_1.Label, null, "Amount (Ksh) *"),
                React.createElement(input_1.Input, { type: "number", value: form.amount, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { amount: e.target.value })); }); }, placeholder: "0" })),
            React.createElement("div", { className: "space-y-1" },
                React.createElement(label_1.Label, null, "Due Date"),
                React.createElement(input_1.Input, { type: "date", value: form.dueDate, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { dueDate: e.target.value })); }); } }))),
        React.createElement("div", { className: "space-y-1" },
            React.createElement(label_1.Label, null, "Status"),
            React.createElement(select_1.Select, { value: form.status, onValueChange: function (v) { return setForm(function (f) { return (__assign(__assign({}, f), { status: v })); }); } },
                React.createElement(select_1.SelectTrigger, null,
                    React.createElement(select_1.SelectValue, null)),
                React.createElement(select_1.SelectContent, null,
                    React.createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                    React.createElement(select_1.SelectItem, { value: "submitted" }, "Submitted"),
                    React.createElement(select_1.SelectItem, { value: "under_review" }, "Under Review"),
                    React.createElement(select_1.SelectItem, { value: "approved" }, "Approved"),
                    React.createElement(select_1.SelectItem, { value: "rejected" }, "Rejected")))),
        React.createElement("div", { className: "space-y-1" },
            React.createElement(label_1.Label, null, "Description"),
            React.createElement(textarea_1.Textarea, { rows: 2, value: form.description, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { description: e.target.value })); }); } })))); };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Quotations & RFQs", description: "Request and manage quotations from suppliers", icon: React.createElement(lucide_react_1.FileText, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Procurement", href: "/procurement" }, { label: "Quotations" }] },
        React.createElement("div", { className: "space-y-6 p-4 sm:p-6" },
            React.createElement("div", { className: "flex flex-col gap-2" },
                React.createElement("h2", { className: "text-2xl font-bold" }, "Quotations & RFQs"),
                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Request and compare supplier quotations")),
            React.createElement(SummaryStatCards_1.SummaryStatCards, { cards: statCards }),
            React.createElement("div", { className: "space-y-4" },
                React.createElement("div", { className: "flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between" },
                    React.createElement("div", { className: "flex-1 flex items-center gap-2" },
                        React.createElement(lucide_react_1.Search, { className: "h-4 w-4 text-muted-foreground" }),
                        React.createElement(input_1.Input, { placeholder: "Search by RFQ # or supplier...", value: searchQuery, onChange: function (e) { setSearchQuery(e.target.value); setCurrentPage(1); }, className: "flex-1" })),
                    React.createElement(select_1.Select, { value: statusFilter, onValueChange: function (v) { setStatusFilter(v); setCurrentPage(1); } },
                        React.createElement(select_1.SelectTrigger, { className: "w-full sm:w-40" },
                            React.createElement(select_1.SelectValue, { placeholder: "Filter by status" })),
                        React.createElement(select_1.SelectContent, null,
                            React.createElement(select_1.SelectItem, { value: "all" }, "All Statuses"),
                            React.createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                            React.createElement(select_1.SelectItem, { value: "submitted" }, "Submitted"),
                            React.createElement(select_1.SelectItem, { value: "under_review" }, "Under Review"),
                            React.createElement(select_1.SelectItem, { value: "approved" }, "Approved"),
                            React.createElement(select_1.SelectItem, { value: "rejected" }, "Rejected"))),
                    React.createElement(TableColumnSettings_1.TableColumnSettings, { columns: QUOTATION_COLUMNS, visibleColumns: visibleColumns, toggleColumn: toggleColumn }),
                    React.createElement(button_1.Button, { onClick: function () { setForm(__assign({}, emptyForm)); setCreateOpen(true); }, className: "gap-2" },
                        React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
                        " New RFQ")),
                selectedQuotations.size > 0 && (React.createElement("div", { className: "flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md" },
                    React.createElement("span", { className: "text-sm" },
                        selectedQuotations.size,
                        " selected"),
                    React.createElement(button_1.Button, { size: "sm", variant: "destructive", onClick: function () {
                            if (confirm("Delete selected quotations?")) {
                                bulkDeleteMutation === null || bulkDeleteMutation === void 0 ? void 0 : bulkDeleteMutation.mutate(__spreadArrays(selectedQuotations));
                            }
                        } }, "Delete")))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "p-0" }, dataLoading ? (React.createElement("div", { className: "flex items-center justify-center h-32" },
                    React.createElement(spinner_1.Spinner, null))) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, { className: "w-12" },
                                    React.createElement(checkbox_1.Checkbox, { checked: selectedQuotations.size === paginatedQuotations.length && paginatedQuotations.length > 0, onCheckedChange: toggleSelectAll })),
                                isVisible("rfqNo") && (React.createElement(table_1.TableHead, { className: "cursor-pointer", onClick: function () {
                                        if (sortField === "rfqNo") {
                                            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                        }
                                        else {
                                            setSortField("rfqNo");
                                            setSortOrder("asc");
                                        }
                                    } },
                                    React.createElement("div", { className: "flex items-center gap-1" },
                                        "RFQ # ",
                                        sortField === "rfqNo" && (sortOrder === "asc" ? React.createElement(lucide_react_1.ChevronUp, { className: "h-4 w-4" }) : React.createElement(lucide_react_1.ChevronDown, { className: "h-4 w-4" }))))),
                                isVisible("supplier") && (React.createElement(table_1.TableHead, { className: "cursor-pointer", onClick: function () {
                                        if (sortField === "supplier") {
                                            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                        }
                                        else {
                                            setSortField("supplier");
                                            setSortOrder("asc");
                                        }
                                    } },
                                    React.createElement("div", { className: "flex items-center gap-1" },
                                        "Supplier ",
                                        sortField === "supplier" && (sortOrder === "asc" ? React.createElement(lucide_react_1.ChevronUp, { className: "h-4 w-4" }) : React.createElement(lucide_react_1.ChevronDown, { className: "h-4 w-4" }))))),
                                isVisible("amount") && React.createElement(table_1.TableHead, null, "Amount"),
                                isVisible("dueDate") && React.createElement(table_1.TableHead, null, "Due Date"),
                                isVisible("status") && React.createElement(table_1.TableHead, null, "Status"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, paginatedQuotations.length === 0 ? (React.createElement(table_1.TableRow, null,
                            React.createElement(table_1.TableCell, { colSpan: 7, className: "text-center py-8 text-muted-foreground" }, processedQuotations.length === 0 ? "No quotations found" : "No results for current filters"))) : (paginatedQuotations.map(function (q) { return (React.createElement(table_1.TableRow, { key: q.id },
                            React.createElement(table_1.TableCell, null,
                                React.createElement(checkbox_1.Checkbox, { checked: selectedQuotations.has(q.id), onCheckedChange: function () { return toggleSelectQuotation(q.id); } })),
                            isVisible("rfqNo") && React.createElement(table_1.TableCell, { className: "font-medium" }, q.rfqNo),
                            isVisible("supplier") && React.createElement(table_1.TableCell, null, q.supplier),
                            isVisible("amount") && React.createElement(table_1.TableCell, null,
                                "Ksh ",
                                ((q.amount || 0) / 100).toLocaleString()),
                            isVisible("dueDate") && React.createElement(table_1.TableCell, null, q.dueDate ? date_fns_1.format(new Date(q.dueDate), "MMM dd, yyyy") : "—"),
                            isVisible("status") && React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { variant: statusColor(q.status) }, q.status)),
                            React.createElement(table_1.TableCell, { className: "text-right" },
                                React.createElement(RowActionsMenu_1.RowActionsMenu, { actions: [
                                        { label: "View", icon: lucide_react_1.Eye, onClick: function () { return setLocation("/quotations/" + q.id); } },
                                        { label: "Edit", icon: lucide_react_1.Edit2, onClick: function () { return openEdit(q); } },
                                        { label: "Delete", icon: lucide_react_1.Trash2, onClick: function () { if (confirm("Delete this quotation?"))
                                                deleteMutation.mutate(q.id); }, isDangerous: true },
                                    ] })))); })))))))),
            totalPages > 1 && (React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", { className: "text-sm text-muted-foreground" },
                    "Showing ",
                    Math.min((currentPage - 1) * pageSize + 1, processedQuotations.length),
                    " to ",
                    Math.min(currentPage * pageSize, processedQuotations.length),
                    " of ",
                    processedQuotations.length),
                React.createElement("div", { className: "flex gap-2" },
                    React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setCurrentPage(function (p) { return Math.max(1, p - 1); }); }, disabled: currentPage === 1 }, "Previous"),
                    React.createElement("div", { className: "flex items-center gap-1" }, Array.from({ length: totalPages }, function (_, i) { return (React.createElement(button_1.Button, { key: i + 1, variant: currentPage === i + 1 ? "default" : "outline", size: "sm", onClick: function () { return setCurrentPage(i + 1); } }, i + 1)); })),
                    React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setCurrentPage(function (p) { return Math.min(totalPages, p + 1); }); }, disabled: currentPage === totalPages }, "Next")),
                React.createElement(select_1.Select, { value: pageSize.toString(), onValueChange: function (v) { setPageSize(parseInt(v)); setCurrentPage(1); } },
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
                    React.createElement(dialog_1.DialogTitle, null, "New RFQ / Quotation")),
                React.createElement(RFQForm, null),
                React.createElement(dialog_1.DialogFooter, null,
                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setCreateOpen(false); } }, "Cancel"),
                    React.createElement(button_1.Button, { onClick: function () { return handleSubmit(false); }, disabled: createMutation.isPending || !form.rfqNo || !form.supplier || !form.amount }, createMutation.isPending ? "Saving..." : "Create RFQ")))),
        React.createElement(dialog_1.Dialog, { open: !!editingRFQ, onOpenChange: function (v) { if (!v)
                setEditingRFQ(null); } },
            React.createElement(dialog_1.DialogContent, { className: "max-w-xl" },
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "Edit Quotation")),
                React.createElement(RFQForm, null),
                React.createElement(dialog_1.DialogFooter, null,
                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setEditingRFQ(null); } }, "Cancel"),
                    React.createElement(button_1.Button, { onClick: function () { return handleSubmit(true); }, disabled: updateMutation.isPending }, updateMutation.isPending ? "Saving..." : "Save Changes"))))));
}
exports["default"] = QuotationsPage;
