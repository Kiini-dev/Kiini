"use strict";
exports.__esModule = true;
var ModuleLayout_1 = require("@/components/ModuleLayout");
var react_1 = require("react");
var wouter_1 = require("wouter");
var permissions_1 = require("@/lib/permissions");
var trpc_1 = require("@/lib/trpc");
var card_1 = require("@/components/ui/card");
var spinner_1 = require("@/components/ui/spinner");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var pdfGenerator_1 = require("@/lib/pdfGenerator");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var checkbox_1 = require("@/components/ui/checkbox");
var date_fns_1 = require("date-fns");
var data_table_controls_1 = require("@/components/ui/data-table-controls");
var ListPageToolbar_1 = require("@/components/list-page/ListPageToolbar");
var SummaryStatCards_1 = require("@/components/list-page/SummaryStatCards");
var TableColumnSettings_1 = require("@/components/list-page/TableColumnSettings");
var RowActionsMenu_1 = require("@/components/list-page/RowActionsMenu");
var DEBIT_NOTE_COLUMNS = [
    { key: "id", label: "ID", defaultVisible: true },
    { key: "debitNoteNumber", label: "Debit Note #", defaultVisible: true },
    { key: "issueDate", label: "Issue Date", defaultVisible: true },
    { key: "supplierName", label: "Supplier", defaultVisible: true },
    { key: "reason", label: "Reason", defaultVisible: true },
    { key: "total", label: "Amount", defaultVisible: true },
    { key: "status", label: "Status", defaultVisible: true },
];
function DebitNotes() {
    var _a;
    var _b = permissions_1.useRequireFeature("accounting:debit-notes:view"), allowed = _b.allowed, permLoading = _b.isLoading;
    var _c = wouter_1.useLocation(), setLocation = _c[1];
    var _d = react_1.useState(""), searchTerm = _d[0], setSearchTerm = _d[1];
    var _e = react_1.useState("all"), statusFilter = _e[0], setStatusFilter = _e[1];
    var _f = react_1.useState("issueDate"), sortField = _f[0], setSortField = _f[1];
    var _g = react_1.useState("desc"), sortOrder = _g[0], setSortOrder = _g[1];
    var _h = react_1.useState(new Set()), selectedNotes = _h[0], setSelectedNotes = _h[1];
    var _j = data_table_controls_1.usePagination(25), page = _j.page, pageSize = _j.pageSize, setPage = _j.setPage, setPageSize = _j.setPageSize, paginate = _j.paginate;
    var _k = TableColumnSettings_1.useColumnVisibility(DEBIT_NOTE_COLUMNS, "debitnotes"), visibleColumns = _k.visibleColumns, toggleColumn = _k.toggleColumn, isVisible = _k.isVisible;
    var listQuery = trpc_1.trpc.debitNotes.list.useQuery({}, {
        onError: function (error) {
            sonner_1.toast.error("Failed to load debit notes: " + error.message);
        }
    });
    var deleteMutation = trpc_1.trpc.debitNotes["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Debit note deleted successfully");
            listQuery.refetch();
            setSelectedNotes(new Set());
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to delete: " + error.message);
        }
    });
    var bulkDeleteMutation = (_a = trpc_1.trpc.debitNotes.bulkDelete) === null || _a === void 0 ? void 0 : _a.useMutation({
        onSuccess: function (data) {
            sonner_1.toast.success(((data === null || data === void 0 ? void 0 : data.count) || 0) + " debit note(s) deleted");
            listQuery.refetch();
            setSelectedNotes(new Set());
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete debit notes");
        }
    });
    var handleDelete = function (id) {
        if (confirm("Are you sure you want to delete this debit note?")) {
            deleteMutation.mutate({ id: id });
        }
    };
    // Process and sort data
    var processedNotes = react_1.useMemo(function () {
        var filtered = (listQuery.data || []);
        if (statusFilter !== "all") {
            filtered = filtered.filter(function (note) { return note.status === statusFilter; });
        }
        if (searchTerm) {
            filtered = filtered.filter(function (note) {
                return note.debitNoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    note.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
            });
        }
        filtered.sort(function (a, b) {
            var aVal = a[sortField];
            var bVal = b[sortField];
            var cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            return sortOrder === "asc" ? cmp : -cmp;
        });
        return filtered;
    }, [listQuery.data, statusFilter, searchTerm, sortField, sortOrder]);
    // Calculate stat cards
    var statCards = react_1.useMemo(function () { return [
        {
            title: "Total Debit Notes",
            value: (listQuery.data || []).length.toString(),
            icon: "FileText",
            trend: "neutral"
        },
        {
            title: "Total Amount",
            value: "$" + (listQuery.data || []).reduce(function (sum, n) { return sum + (n.total || 0); }, 0).toLocaleString(undefined, { maximumFractionDigits: 2 }),
            icon: "DollarSign",
            trend: "up"
        },
        {
            title: "Pending Notes",
            value: (listQuery.data || []).filter(function (n) { return n.status === "draft"; }).length.toString(),
            icon: "Clock",
            trend: "neutral"
        },
    ]; }, [listQuery.data]);
    var paginatedNotes = paginate(processedNotes);
    if (permLoading)
        return React.createElement(spinner_1.Spinner, null);
    if (!allowed)
        return React.createElement("div", { className: "text-center py-10" }, "Access Denied");
    var rowActions = [
        { icon: lucide_react_1.Eye, label: "View", onClick: function (id) { return setLocation("/debit-notes/" + id); } },
        { icon: lucide_react_1.Edit, label: "Edit", onClick: function (id) { return setLocation("/debit-notes/" + id + "/edit"); } },
        { icon: lucide_react_1.Download, label: "Download", onClick: function (id) {
                var note = (listQuery.data || []).find(function (n) { return n.id === id; });
                if (note)
                    pdfGenerator_1.generateDebitNotePDF(note);
            } },
        { icon: lucide_react_1.Trash2, label: "Delete", onClick: handleDelete, destructive: true },
    ];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Debit Notes", description: "Manage supplier debit notes and claims", icon: "FileText", breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Accounting", href: "/accounting" }, { label: "Debit Notes" }] },
        React.createElement(SummaryStatCards_1.SummaryStatCards, { cards: statCards }),
        React.createElement("div", { className: "mb-6" },
            React.createElement(ListPageToolbar_1.ListPageToolbar, { searchTerm: searchTerm, onSearchChange: setSearchTerm, onNewClick: function () { return setLocation("/debit-notes/create"); }, filterOptions: [
                    { value: "all", label: "All" },
                    { value: "draft", label: "Draft" },
                    { value: "approved", label: "Approved" },
                    { value: "settled", label: "Settled" },
                ], currentFilter: statusFilter, onFilterChange: setStatusFilter })),
        listQuery.isLoading ? (React.createElement("div", { className: "flex justify-center py-10" },
            React.createElement(spinner_1.Spinner, null))) : paginatedNotes.length === 0 ? (React.createElement(card_1.Card, null,
            React.createElement(card_1.CardContent, { className: "py-10 text-center text-gray-500" }, "No debit notes found"))) : (React.createElement(card_1.Card, null,
            React.createElement("div", { className: "overflow-x-auto" },
                React.createElement(table_1.Table, null,
                    React.createElement(table_1.TableHeader, null,
                        React.createElement(table_1.TableRow, null,
                            React.createElement(table_1.TableHead, { className: "w-12" },
                                React.createElement(checkbox_1.Checkbox, { checked: selectedNotes.size === paginatedNotes.length && paginatedNotes.length > 0, onCheckedChange: function (checked) {
                                        if (checked) {
                                            setSelectedNotes(new Set(paginatedNotes.map(function (n) { return n.id; })));
                                        }
                                        else {
                                            setSelectedNotes(new Set());
                                        }
                                    } })),
                            visibleColumns.map(function (col) { return (React.createElement(table_1.TableHead, { key: col.key, className: "cursor-pointer hover:bg-gray-100" },
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    col.label,
                                    sortField === col.key && React.createElement(lucide_react_1.ArrowUpDown, { className: "w-4 h-4" })))); }),
                            React.createElement(table_1.TableHead, { className: "w-12" }, "Actions"))),
                    React.createElement(table_1.TableBody, null, paginatedNotes.map(function (note) { return (React.createElement(table_1.TableRow, { key: note.id, className: "hover:bg-gray-50" },
                        React.createElement(table_1.TableCell, null,
                            React.createElement(checkbox_1.Checkbox, { checked: selectedNotes.has(note.id), onCheckedChange: function (checked) {
                                    var newSet = new Set(selectedNotes);
                                    if (checked)
                                        newSet.add(note.id);
                                    else
                                        newSet["delete"](note.id);
                                    setSelectedNotes(newSet);
                                } })),
                        isVisible("debitNoteNumber") && React.createElement(table_1.TableCell, { className: "font-medium" }, note.debitNoteNumber),
                        isVisible("issueDate") && React.createElement(table_1.TableCell, null, date_fns_1.format(new Date(note.issueDate), "MMM dd, yyyy")),
                        isVisible("supplierName") && React.createElement(table_1.TableCell, null, note.supplierName),
                        isVisible("reason") && React.createElement(table_1.TableCell, { className: "text-sm text-gray-600" }, note.reason),
                        isVisible("total") && React.createElement(table_1.TableCell, { className: "font-semibold" },
                            "KES ",
                            note.total.toLocaleString()),
                        isVisible("status") && (React.createElement(table_1.TableCell, null,
                            React.createElement(badge_1.Badge, { variant: note.status === "draft" ? "secondary" :
                                    note.status === "approved" ? "default" :
                                        "outline" }, note.status.charAt(0).toUpperCase() + note.status.slice(1)))),
                        React.createElement(table_1.TableCell, null,
                            React.createElement(RowActionsMenu_1.RowActionsMenu, { id: note.id, actions: rowActions })))); })))),
            React.createElement("div", { className: "border-t p-4 flex justify-between items-center" },
                React.createElement(data_table_controls_1.PaginationControls, { page: page, pageSize: pageSize, totalItems: processedNotes.length, onPageChange: setPage, onPageSizeChange: setPageSize }))))));
}
exports["default"] = DebitNotes;
