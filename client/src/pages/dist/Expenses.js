"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var ModuleLayout_1 = require("@/components/ModuleLayout");
var wouter_1 = require("wouter");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var trpc_1 = require("@/lib/trpc");
var communications_1 = require("@/lib/communications");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var sonner_1 = require("sonner");
var export_utils_1 = require("@/lib/export-utils");
var ListPageToolbar_1 = require("@/components/list-page/ListPageToolbar");
var RowActionsMenu_1 = require("@/components/list-page/RowActionsMenu");
var TableColumnSettings_1 = require("@/components/list-page/TableColumnSettings");
var EnhancedBulkActions_1 = require("@/components/list-page/EnhancedBulkActions");
var checkbox_1 = require("@/components/ui/checkbox");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var ExpenseBudgetReport_1 = require("@/components/ExpenseBudgetReport");
var stats_card_1 = require("@/components/ui/stats-card");
function Expenses() {
    // All hooks must be called at the top, before any conditional returns
    var _a = permissions_1.useRequireFeature("accounting:expenses:view"), allowed = _a.allowed, isLoading = _a.isLoading;
    var _b = wouter_1.useLocation(), location = _b[0], navigate = _b[1];
    var _c = react_1.useState(""), searchTerm = _c[0], setSearchTerm = _c[1];
    var _d = react_1.useState("all"), categoryFilter = _d[0], setCategoryFilter = _d[1];
    var _e = react_1.useState(false), deleteDialogOpen = _e[0], setDeleteDialogOpen = _e[1];
    var _f = react_1.useState(null), selectedExpenseId = _f[0], setSelectedExpenseId = _f[1];
    var _g = react_1.useState("list"), activeTab = _g[0], setActiveTab = _g[1];
    var _h = react_1.useState(new Set()), selectedExpenses = _h[0], setSelectedExpenses = _h[1];
    var expenseColumns = [
        { key: "date", label: "Date" },
        { key: "category", label: "Category" },
        { key: "vendor", label: "Vendor" },
        { key: "description", label: "Description" },
        { key: "amount", label: "Amount" },
        { key: "paymentMethod", label: "Payment Method" },
        { key: "status", label: "Status" },
        { key: "receipt", label: "Receipt" },
    ];
    var _j = TableColumnSettings_1.useColumnVisibility(expenseColumns, "expenses"), visibleColumns = _j.visibleColumns, toggleColumn = _j.toggleColumn, isVisible = _j.isVisible, pageSize = _j.pageSize, updatePageSize = _j.updatePageSize, reset = _j.reset;
    // Fetch real data from backend
    var _k = trpc_1.trpc.expenses.list.useQuery(), _l = _k.data, expensesData = _l === void 0 ? [] : _l, isLoadingExpenses = _k.isLoading;
    var utils = trpc_1.trpc.useUtils();
    // Delete mutation
    var deleteExpenseMutation = trpc_1.trpc.expenses["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Expense deleted successfully");
            utils.expenses.list.invalidate();
            setDeleteDialogOpen(false);
            setSelectedExpenseId(null);
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete expense");
        }
    });
    // Approve mutation (using centralized approvals system)
    var approveExpenseMutation = trpc_1.trpc.approvals.approveExpense.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Expense approved successfully");
            utils.expenses.list.invalidate();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to approve expense");
        }
    });
    // Bulk approve mutation
    var bulkApproveMutation = trpc_1.trpc.expenses.bulkApprove.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Expenses approved successfully");
            utils.expenses.list.invalidate();
            setSelectedExpenses(new Set());
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to bulk approve expenses");
        }
    });
    // Early returns after all hooks are declared
    if (isLoading)
        return React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" }));
    if (!allowed)
        return null;
    // Safely convert frozen Drizzle objects to plain JS objects
    var plainExpensesData = (function () {
        if (!Array.isArray(expensesData))
            return [];
        return expensesData.map(function (exp) {
            try {
                return JSON.parse(JSON.stringify(exp));
            }
            catch (_a) {
                return exp;
            }
        });
    })();
    // Transform backend data to display format
    var expenses = (function () {
        if (!Array.isArray(plainExpensesData))
            return [];
        return plainExpensesData.map(function (expense) { return ({
            id: expense.id,
            date: expense.expenseDate ? new Date(expense.expenseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            category: expense.category || "General",
            description: expense.description || "",
            amount: (expense.amount || 0) / 100,
            vendor: expense.vendor || "Unknown",
            paymentMethod: expense.paymentMethod || "cash",
            status: expense.status || "pending",
            receipt: expense.receiptUrl || null
        }); });
    })();
    var getStatusBadge = function (status) {
        var styles = {
            pending: "bg-yellow-100 text-yellow-700",
            approved: "bg-green-100 text-green-700",
            rejected: "bg-red-100 text-red-700",
            paid: "bg-blue-100 text-blue-700"
        };
        return (React.createElement("span", { className: "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium " + (styles[status] || "bg-gray-100 text-gray-700") }, status.toUpperCase()));
    };
    var filteredExpenses = (function () {
        return expenses.filter(function (expense) {
            var matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                expense.category.toLowerCase().includes(searchTerm.toLowerCase());
            var matchesCategory = categoryFilter === "all" || expense.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    })();
    var summary = (function () {
        return {
            total: expenses.reduce(function (sum, e) { return sum + e.amount; }, 0),
            approved: expenses.filter(function (e) { return e.status === "approved"; }).reduce(function (sum, e) { return sum + e.amount; }, 0),
            pending: expenses.filter(function (e) { return e.status === "pending"; }).reduce(function (sum, e) { return sum + e.amount; }, 0),
            categories: new Set(expenses.map(function (e) { return e.category; })).size
        };
    })();
    var handleDeleteClick = function (id) {
        setSelectedExpenseId(id);
        setDeleteDialogOpen(true);
    };
    var toggleSelectExpense = function (id) {
        setSelectedExpenses(function (prev) {
            var next = new Set(prev);
            if (next.has(id))
                next["delete"](id);
            else
                next.add(id);
            return next;
        });
    };
    var toggleSelectAll = function () {
        if (selectedExpenses.size === filteredExpenses.length) {
            setSelectedExpenses(new Set());
        }
        else {
            setSelectedExpenses(new Set(filteredExpenses.map(function (e) { return e.id; })));
        }
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Expenses", description: "Track and manage business expenses", icon: React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Finance", href: "/accounting" },
            { label: "Expenses" },
        ], actions: React.createElement(button_1.Button, { onClick: function () { return navigate("/expenses/create"); } },
            React.createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
            "Record Expense") },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "flex items-center gap-2 border-b" },
                React.createElement(button_1.Button, { variant: activeTab === "list" ? "default" : "ghost", onClick: function () { return setActiveTab("list"); }, className: "rounded-none border-b-2 border-b-transparent data-[active=true]:border-b-blue-500", "data-active": activeTab === "list" },
                    React.createElement(lucide_react_1.Receipt, { className: "w-4 h-4 mr-2" }),
                    "Expense List"),
                React.createElement(button_1.Button, { variant: activeTab === "budget" ? "default" : "ghost", onClick: function () { return setActiveTab("budget"); }, className: "rounded-none border-b-2 border-b-transparent data-[active=true]:border-b-blue-500", "data-active": activeTab === "budget" },
                    React.createElement(lucide_react_1.BarChart3, { className: "w-4 h-4 mr-2" }),
                    "Budget Report")),
            activeTab === "list" && (React.createElement(React.Fragment, null,
                React.createElement("div", { className: "space-y-6" },
                    React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                        React.createElement(stats_card_1.StatsCard, { label: "Total Expenses", value: React.createElement(React.Fragment, null,
                                "Ksh ",
                                (summary.total || 0).toLocaleString()), description: "All time", icon: React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }), color: "border-l-red-500" }),
                        React.createElement(stats_card_1.StatsCard, { label: "Approved", value: React.createElement(React.Fragment, null,
                                "Ksh ",
                                (summary.approved || 0).toLocaleString()), description: React.createElement(React.Fragment, null,
                                expenses.filter(function (e) { return e.status === "approved"; }).length,
                                " expenses"), icon: React.createElement(lucide_react_1.TrendingUp, { className: "h-5 w-5" }), color: "border-l-green-500" }),
                        React.createElement(stats_card_1.StatsCard, { label: "Pending Approval", value: React.createElement(React.Fragment, null,
                                "Ksh ",
                                (summary.pending || 0).toLocaleString()), description: React.createElement(React.Fragment, null,
                                expenses.filter(function (e) { return e.status === "pending"; }).length,
                                " expenses"), icon: React.createElement(lucide_react_1.Receipt, { className: "h-5 w-5" }), color: "border-l-yellow-500" }),
                        React.createElement(stats_card_1.StatsCard, { label: "Categories", value: summary.categories, description: "Expense categories", icon: React.createElement(lucide_react_1.Receipt, { className: "h-5 w-5" }), color: "border-l-blue-500" })),
                    React.createElement(ListPageToolbar_1.ListPageToolbar, { searchValue: searchTerm, onSearchChange: setSearchTerm, searchPlaceholder: "Search expenses...", onCreateClick: function () { return navigate("/expenses/create"); }, createLabel: "Record Expense", onExportClick: function () { return export_utils_1.downloadCSV(expenses.map(function (e) { return ({ Date: e.date, Category: e.category, Vendor: e.vendor, Description: e.description, Amount: e.amount, "Payment Method": e.paymentMethod, Status: e.status }); }), "expenses"); }, onImportClick: function () { return sonner_1.toast.info("CSV import is available in Settings > Data Management"); }, onPrintClick: function () { return window.print(); }, filterContent: React.createElement(select_1.Select, { value: categoryFilter, onValueChange: setCategoryFilter },
                            React.createElement(select_1.SelectTrigger, { className: "w-48" },
                                React.createElement(select_1.SelectValue, { placeholder: "All Categories" })),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "all" }, "All Categories"),
                                Array.from(new Set(expenses.map(function (e) { return e.category; }))).map(function (cat) { return (React.createElement(select_1.SelectItem, { key: cat, value: cat }, cat)); }))) }),
                    React.createElement(EnhancedBulkActions_1.EnhancedBulkActions, { selectedCount: selectedExpenses.size, onClear: function () { return setSelectedExpenses(new Set()); }, actions: [
                            EnhancedBulkActions_1.bulkApproveAction(selectedExpenses, function (ids) { return bulkApproveMutation.mutate({ ids: ids }); }),
                            EnhancedBulkActions_1.bulkExportAction(selectedExpenses, expenses, expenseColumns, "expenses"),
                            EnhancedBulkActions_1.bulkCopyIdsAction(selectedExpenses),
                            EnhancedBulkActions_1.bulkEmailAction(navigate),
                            EnhancedBulkActions_1.bulkDeleteAction(selectedExpenses, function (ids) { return ids.forEach(function (id) { return deleteExpenseMutation.mutate(id); }); }),
                        ] }),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardContent, { className: "p-0" },
                            React.createElement("div", { className: "flex items-center justify-between px-4 py-3 border-b" },
                                React.createElement("span", { className: "text-sm text-muted-foreground" },
                                    filteredExpenses.length,
                                    " expenses"),
                                React.createElement(TableColumnSettings_1.TableColumnSettings, { columns: expenseColumns, visibleColumns: visibleColumns, onToggleColumn: toggleColumn, onReset: reset, pageSize: pageSize, onPageSizeChange: updatePageSize })),
                            React.createElement("div", { className: "rounded-md border" },
                                React.createElement(table_1.Table, null,
                                    React.createElement(table_1.TableHeader, null,
                                        React.createElement(table_1.TableRow, null,
                                            React.createElement(table_1.TableHead, { className: "w-10" },
                                                React.createElement(checkbox_1.Checkbox, { checked: selectedExpenses.size === filteredExpenses.length && filteredExpenses.length > 0, onCheckedChange: toggleSelectAll })),
                                            isVisible("date") && React.createElement(table_1.TableHead, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, "Date"),
                                            isVisible("category") && React.createElement(table_1.TableHead, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, "Category"),
                                            isVisible("vendor") && React.createElement(table_1.TableHead, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, "Vendor"),
                                            isVisible("description") && React.createElement(table_1.TableHead, { className: "hidden md:table-cell px-2 sm:px-3 text-xs sm:text-sm" }, "Description"),
                                            isVisible("amount") && React.createElement(table_1.TableHead, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, "Amount"),
                                            isVisible("status") && React.createElement(table_1.TableHead, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, "Status"),
                                            React.createElement(table_1.TableHead, { className: "text-right px-2 sm:px-3" }, "Actions"))),
                                    React.createElement(table_1.TableBody, null, isLoadingExpenses ? (React.createElement(table_1.TableRow, null,
                                        React.createElement(table_1.TableCell, { colSpan: 7, className: "text-center py-8" },
                                            React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin mx-auto mb-2" }),
                                            "Loading expenses..."))) : filteredExpenses.length === 0 ? (React.createElement(table_1.TableRow, null,
                                        React.createElement(table_1.TableCell, { colSpan: 7, className: "text-center py-8 text-muted-foreground" }, "No expenses found"))) : (filteredExpenses.map(function (expense) { return (React.createElement(table_1.TableRow, { key: expense.id, className: selectedExpenses.has(expense.id) ? "bg-primary/5" : "" },
                                        React.createElement(table_1.TableCell, null,
                                            React.createElement(checkbox_1.Checkbox, { checked: selectedExpenses.has(expense.id), onCheckedChange: function () { return toggleSelectExpense(expense.id); } })),
                                        isVisible("date") && React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, expense.date ? new Date(expense.date).toLocaleDateString() : "-"),
                                        isVisible("category") && React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, expense.category),
                                        isVisible("vendor") && React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, expense.vendor),
                                        isVisible("description") && React.createElement(table_1.TableCell, { className: "hidden md:table-cell px-2 sm:px-3 text-xs sm:text-sm max-w-[200px] truncate" }, expense.description),
                                        isVisible("amount") && React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm font-semibold" },
                                            "Ksh ",
                                            (expense.amount || 0).toLocaleString()),
                                        isVisible("status") && React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, getStatusBadge(expense.status)),
                                        React.createElement(table_1.TableCell, { className: "text-right px-2 sm:px-3" },
                                            React.createElement(RowActionsMenu_1.RowActionsMenu, { primaryActions: [
                                                    { label: "View", icon: RowActionsMenu_1.actionIcons.view, onClick: function () { return navigate("/expenses/" + expense.id); } },
                                                    { label: "Edit", icon: RowActionsMenu_1.actionIcons.edit, onClick: function () { return navigate("/expenses/" + expense.id + "/edit"); } },
                                                    { label: "Delete", icon: RowActionsMenu_1.actionIcons["delete"], onClick: function () { return handleDeleteClick(expense.id); }, variant: "destructive" },
                                                ], menuActions: __spreadArrays((expense.status === "pending" ? [{ label: "Approve Expense", icon: React.createElement(lucide_react_1.Check, { className: "h-4 w-4" }), onClick: function () { return approveExpenseMutation.mutate({ id: expense.id }); } }] : []), [
                                                    { label: "Duplicate Expense", icon: RowActionsMenu_1.actionIcons.copy, onClick: function () { return navigate("/expenses/create?clone=" + expense.id); } },
                                                    { label: "Email Receipt", icon: RowActionsMenu_1.actionIcons.email, onClick: function () { return navigate(communications_1.buildCommunicationComposePath(location, expense.vendorEmail || "", "Expense Receipt " + expense.id)); } },
                                                    { label: "Attach to Project", icon: React.createElement(lucide_react_1.Link, { className: "h-4 w-4" }), onClick: function () { return navigate("/expenses/" + expense.id + "/edit"); }, separator: true },
                                                    { label: "Download Receipt", icon: RowActionsMenu_1.actionIcons.download, onClick: function () { navigate("/expenses/" + expense.id); setTimeout(function () { return window.print(); }, 500); } },
                                                ]) })))); }))))))),
                    React.createElement(alert_dialog_1.AlertDialog, { open: deleteDialogOpen, onOpenChange: setDeleteDialogOpen },
                        React.createElement(alert_dialog_1.AlertDialogContent, null,
                            React.createElement(alert_dialog_1.AlertDialogTitle, null, "Delete Expense"),
                            React.createElement(alert_dialog_1.AlertDialogDescription, null, "Are you sure you want to delete this expense record? This action cannot be undone."),
                            React.createElement("div", { className: "flex gap-2 justify-end" },
                                React.createElement(alert_dialog_1.AlertDialogCancel, null, "Cancel"),
                                React.createElement(alert_dialog_1.AlertDialogAction, { onClick: function () { return selectedExpenseId && deleteExpenseMutation.mutate(selectedExpenseId); }, className: "bg-red-600 hover:bg-red-700", disabled: deleteExpenseMutation.isPending },
                                    deleteExpenseMutation.isPending ? React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
                                    "Delete"))))))),
            activeTab === "budget" && (React.createElement("div", { className: "space-y-6" },
                React.createElement(ExpenseBudgetReport_1.ExpenseBudgetReport, null))))));
}
exports["default"] = Expenses;
