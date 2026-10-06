"use strict";
exports.__esModule = true;
var react_1 = require("react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var wouter_1 = require("wouter");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var communications_1 = require("@/lib/communications");
var export_utils_1 = require("@/lib/export-utils");
var date_fns_1 = require("date-fns");
var currency_1 = require("@/lib/currency");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var ListPageToolbar_1 = require("@/components/list-page/ListPageToolbar");
var RowActionsMenu_1 = require("@/components/list-page/RowActionsMenu");
var TableColumnSettings_1 = require("@/components/list-page/TableColumnSettings");
var EnhancedBulkActions_1 = require("@/components/list-page/EnhancedBulkActions");
var checkbox_1 = require("@/components/ui/checkbox");
var iconMap = {
    DollarSign: lucide_react_1.DollarSign,
    CheckCircle2: lucide_react_1.CheckCircle2,
    Clock: lucide_react_1.Clock,
    AlertCircle: lucide_react_1.AlertCircle
};
function Estimates() {
    var _a = permissions_1.useRequireFeature("estimates:read"), allowed = _a.allowed, isLoading = _a.isLoading;
    var _b = wouter_1.useLocation(), location = _b[0], navigate = _b[1];
    var formatCurrency = currency_1.useCurrency().format;
    var _c = react_1.useState(""), searchQuery = _c[0], setSearchQuery = _c[1];
    var _d = react_1.useState("all"), statusFilter = _d[0], setStatusFilter = _d[1];
    var _e = react_1.useState("issueDate"), sortField = _e[0], setSortField = _e[1];
    var _f = react_1.useState("desc"), sortOrder = _f[0], setSortOrder = _f[1];
    var _g = react_1.useState(false), isExporting = _g[0], setIsExporting = _g[1];
    var _h = react_1.useState(new Set()), selectedEstimates = _h[0], setSelectedEstimates = _h[1];
    var estimateColumns = [
        { key: "quoteNumber", label: "Estimate #" },
        { key: "client", label: "Client" },
        { key: "amount", label: "Amount" },
        { key: "issueDate", label: "Date" },
        { key: "expiryDate", label: "Expiry Date" },
        { key: "project", label: "Project" },
        { key: "status", label: "Status" },
    ];
    var _j = TableColumnSettings_1.useColumnVisibility(estimateColumns, "estimates"), visibleColumns = _j.visibleColumns, toggleColumn = _j.toggleColumn, isVisible = _j.isVisible, pageSize = _j.pageSize, updatePageSize = _j.updatePageSize, reset = _j.reset;
    // Data fetching hooks - enabled flag prevents queries when not allowed
    var _k = trpc_1.trpc.estimates.list.useQuery(undefined, { enabled: allowed }), _l = _k.data, estimatesData = _l === void 0 ? [] : _l, estimatesLoading = _k.isLoading;
    var _m = trpc_1.trpc.clients.list.useQuery(undefined, { enabled: allowed }).data, clientsData = _m === void 0 ? [] : _m;
    var utils = trpc_1.trpc.useUtils();
    // Delete mutation - must be called unconditionally (React Rules of Hooks)
    var deleteEstimateMutation = trpc_1.trpc.estimates["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Estimate deleted successfully");
            utils.estimates.list.invalidate();
            setSelectedEstimates(new Set());
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete estimate");
        }
    });
    var submitForApprovalMutation = trpc_1.trpc.estimates.submitForApproval.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Estimate submitted for approval");
            utils.estimates.list.invalidate();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to submit estimate");
        }
    });
    // NOW we can return early with conditional content - all hooks have been called
    if (isLoading)
        return React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" }));
    if (!allowed)
        return null;
    // Deep copy frozen Drizzle objects to ensure plain JS objects for React dependencies
    var plainEstimatesData = (function () {
        if (!Array.isArray(estimatesData))
            return [];
        return estimatesData.map(function (est) {
            try {
                return JSON.parse(JSON.stringify(est));
            }
            catch (_a) {
                return est;
            }
        });
    })();
    var plainClientsData = (function () {
        if (!Array.isArray(clientsData))
            return [];
        return clientsData.map(function (client) {
            try {
                return JSON.parse(JSON.stringify(client));
            }
            catch (_a) {
                return client;
            }
        });
    })();
    // Transform backend data to display format
    var estimates = (function () {
        return plainEstimatesData.map(function (est) {
            var _a;
            return ({
                id: est.id,
                quoteNumber: est.estimateNumber || "EST-" + est.id.slice(0, 8),
                client: ((_a = plainClientsData.find(function (c) { return c.id === est.clientId; })) === null || _a === void 0 ? void 0 : _a.companyName) || "Unknown Client",
                amount: (est.total || 0),
                status: est.status || "draft",
                issueDate: est.issueDate ? date_fns_1.format(new Date(est.issueDate), "yyyy-MM-dd") : new Date().toISOString().split("T")[0],
                expiryDate: est.expiryDate ? date_fns_1.format(new Date(est.expiryDate), "yyyy-MM-dd") : "",
                project: est.projectId ? "Project" : undefined,
                validDays: 45
            });
        });
    })();
    // Filter and sort estimates
    var filteredAndSortedEstimates = (function () {
        var result = estimates.filter(function (estimate) {
            var _a;
            var matchesSearch = estimate.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                estimate.client.toLowerCase().includes(searchQuery.toLowerCase()) || ((_a = estimate.project) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchQuery.toLowerCase()));
            var matchesStatus = statusFilter === "all" || estimate.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
        // Sort
        result.sort(function (a, b) {
            var aVal = a[sortField];
            var bVal = b[sortField];
            if (sortField === "amount") {
                aVal = parseFloat(String(aVal));
                bVal = parseFloat(String(bVal));
            }
            else if (sortField === "issueDate" || sortField === "expiryDate") {
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
        return result;
    })();
    var stats = (function () { return [
        {
            title: "Total Estimates",
            value: formatCurrency(estimates.reduce(function (sum, est) { return sum + est.amount; }, 0)),
            description: "All time",
            iconName: "DollarSign"
        },
        {
            title: "Accepted",
            value: formatCurrency(estimates
                .filter(function (est) { return est.status === "accepted"; })
                .reduce(function (sum, est) { return sum + est.amount; }, 0)),
            description: estimates.filter(function (est) { return est.status === "accepted"; }).length + " estimates",
            iconName: "CheckCircle2"
        },
        {
            title: "Pending",
            value: formatCurrency(estimates
                .filter(function (est) { return est.status === "sent" || est.status === "draft"; })
                .reduce(function (sum, est) { return sum + est.amount; }, 0)),
            description: estimates.filter(function (est) { return est.status === "sent" || est.status === "draft"; }).length + " estimates",
            iconName: "Clock"
        },
        {
            title: "Expired",
            value: estimates.filter(function (est) { return est.status === "expired"; }).length,
            description: "Need renewal",
            iconName: "AlertCircle"
        },
    ]; })();
    var toggleSort = function (field) {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        }
        else {
            setSortField(field);
            setSortOrder("asc");
        }
    };
    var toggleSelectEstimate = function (id) {
        setSelectedEstimates(function (prev) {
            var next = new Set(prev);
            if (next.has(id))
                next["delete"](id);
            else
                next.add(id);
            return next;
        });
    };
    var toggleSelectAllEstimates = function () {
        if (selectedEstimates.size === filteredAndSortedEstimates.length) {
            setSelectedEstimates(new Set());
        }
        else {
            setSelectedEstimates(new Set(filteredAndSortedEstimates.map(function (e) { return e.id; })));
        }
    };
    var getStatusColor = function (status) {
        switch (status) {
            case "accepted": return "bg-green-500/10 text-green-500 border-green-500/20";
            case "sent": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case "rejected": return "bg-red-500/10 text-red-500 border-red-500/20";
            case "expired": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
            default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
        }
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Estimates", description: "Create and manage estimates", icon: React.createElement(lucide_react_1.FileText, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Sales", href: "/sales" },
            { label: "Estimates", href: "/estimates" },
        ], actions: React.createElement(button_1.Button, { onClick: function () { return navigate("/estimates/create"); } },
            React.createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
            "Create Estimate") },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid gap-4 md:grid-cols-4" }, stats.map(function (stat) {
                var Icon = iconMap[stat.iconName];
                return (React.createElement(card_1.Card, { key: stat.title },
                    React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, stat.title),
                        React.createElement(Icon, { className: "h-4 w-4 text-muted-foreground" })),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" }, stat.value),
                        React.createElement("p", { className: "text-xs text-muted-foreground" }, stat.description))));
            })),
            React.createElement(ListPageToolbar_1.ListPageToolbar, { searchValue: searchQuery, onSearchChange: setSearchQuery, searchPlaceholder: "Search estimates...", onCreateClick: function () { return navigate("/estimates/create"); }, createLabel: "Create Estimate", onExportClick: function () { return export_utils_1.downloadCSV(estimates, ["id", "quoteNumber", "client", "amount", "status", "issueDate", "expiryDate"], "estimates"); }, onImportClick: function () { return sonner_1.toast.info("CSV import is available in Settings > Data Management"); }, onPrintClick: function () { return window.print(); }, filterContent: React.createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                    React.createElement(select_1.SelectTrigger, { className: "w-40" },
                        React.createElement(select_1.SelectValue, { placeholder: "Status" })),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "all" }, "All Statuses"),
                        React.createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                        React.createElement(select_1.SelectItem, { value: "sent" }, "Sent"),
                        React.createElement(select_1.SelectItem, { value: "accepted" }, "Accepted"),
                        React.createElement(select_1.SelectItem, { value: "rejected" }, "Rejected"),
                        React.createElement(select_1.SelectItem, { value: "expired" }, "Expired"))) }),
            React.createElement(EnhancedBulkActions_1.EnhancedBulkActions, { selectedCount: selectedEstimates.size, onClear: function () { return setSelectedEstimates(new Set()); }, actions: [
                    EnhancedBulkActions_1.bulkSendAction(selectedEstimates, function (ids) { return ids.forEach(function (id) { return submitForApprovalMutation.mutate({ id: id }); }); }),
                    EnhancedBulkActions_1.bulkExportAction(selectedEstimates, estimates, estimateColumns, "estimates"),
                    EnhancedBulkActions_1.bulkCopyIdsAction(selectedEstimates),
                    EnhancedBulkActions_1.bulkEmailAction(navigate),
                    EnhancedBulkActions_1.bulkDeleteAction(selectedEstimates, function (ids) { return ids.forEach(function (id) { return deleteEstimateMutation.mutate(id); }); }),
                ] }),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "p-0" },
                    React.createElement("div", { className: "flex items-center justify-between px-4 py-3 border-b" },
                        React.createElement("span", { className: "text-sm text-muted-foreground" },
                            filteredAndSortedEstimates.length,
                            " estimates"),
                        React.createElement(TableColumnSettings_1.TableColumnSettings, { columns: estimateColumns, visibleColumns: visibleColumns, onToggleColumn: toggleColumn, onReset: reset, pageSize: pageSize, onPageSizeChange: updatePageSize })),
                    React.createElement("div", { className: "overflow-x-auto" },
                        React.createElement(table_1.Table, null,
                            React.createElement(table_1.TableHeader, null,
                                React.createElement(table_1.TableRow, null,
                                    React.createElement(table_1.TableHead, { className: "w-10" },
                                        React.createElement(checkbox_1.Checkbox, { checked: selectedEstimates.size === filteredAndSortedEstimates.length && filteredAndSortedEstimates.length > 0, onCheckedChange: toggleSelectAllEstimates })),
                                    isVisible("quoteNumber") && React.createElement(table_1.TableHead, { className: "cursor-pointer", onClick: function () { return toggleSort("quoteNumber"); } },
                                        "Estimate # ",
                                        sortField === "quoteNumber" && React.createElement(lucide_react_1.ArrowUpDown, { className: "inline h-4 w-4 ml-1" })),
                                    isVisible("client") && React.createElement(table_1.TableHead, { className: "cursor-pointer", onClick: function () { return toggleSort("client"); } },
                                        "Client ",
                                        sortField === "client" && React.createElement(lucide_react_1.ArrowUpDown, { className: "inline h-4 w-4 ml-1" })),
                                    isVisible("amount") && React.createElement(table_1.TableHead, { className: "cursor-pointer text-right", onClick: function () { return toggleSort("amount"); } },
                                        "Amount ",
                                        sortField === "amount" && React.createElement(lucide_react_1.ArrowUpDown, { className: "inline h-4 w-4 ml-1" })),
                                    isVisible("issueDate") && React.createElement(table_1.TableHead, { className: "cursor-pointer", onClick: function () { return toggleSort("issueDate"); } },
                                        "Date ",
                                        sortField === "issueDate" && React.createElement(lucide_react_1.ArrowUpDown, { className: "inline h-4 w-4 ml-1" })),
                                    isVisible("status") && React.createElement(table_1.TableHead, null, "Status"),
                                    React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                            React.createElement(table_1.TableBody, null, isLoading ? (React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableCell, { colSpan: 6, className: "text-center py-8" },
                                    React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin mx-auto text-primary" }),
                                    React.createElement("p", { className: "mt-2 text-muted-foreground" }, "Loading estimates...")))) : filteredAndSortedEstimates.length === 0 ? (React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableCell, { colSpan: 6, className: "text-center py-8 text-muted-foreground" }, "No estimates found"))) : (filteredAndSortedEstimates.map(function (est) { return (React.createElement(table_1.TableRow, { key: est.id, className: selectedEstimates.has(est.id) ? "bg-primary/5" : "" },
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(checkbox_1.Checkbox, { checked: selectedEstimates.has(est.id), onCheckedChange: function () { return toggleSelectEstimate(est.id); } })),
                                isVisible("quoteNumber") && React.createElement(table_1.TableCell, { className: "font-medium" }, est.quoteNumber),
                                isVisible("client") && React.createElement(table_1.TableCell, null, est.client),
                                isVisible("amount") && React.createElement(table_1.TableCell, { className: "text-right font-semibold" }, formatCurrency(est.amount)),
                                isVisible("issueDate") && React.createElement(table_1.TableCell, null, est.issueDate ? new Date(est.issueDate).toLocaleDateString() : "-"),
                                isVisible("status") && React.createElement(table_1.TableCell, null,
                                    React.createElement(badge_1.Badge, { variant: "outline", className: getStatusColor(est.status) }, (est.status || 'draft').toUpperCase())),
                                React.createElement(table_1.TableCell, { className: "text-right" },
                                    React.createElement(RowActionsMenu_1.RowActionsMenu, { primaryActions: [
                                            { label: "View", icon: RowActionsMenu_1.actionIcons.view, onClick: function () { return navigate("/estimates/" + est.id); } },
                                            { label: "Edit", icon: RowActionsMenu_1.actionIcons.edit, onClick: function () { return navigate("/estimates/" + est.id + "/edit"); } },
                                            { label: "Delete", icon: RowActionsMenu_1.actionIcons["delete"], onClick: function () { if (confirm("Delete this estimate?"))
                                                    deleteEstimateMutation.mutate(est.id); }, variant: "destructive" },
                                        ], menuActions: [
                                            { label: "Send to Client", icon: React.createElement(lucide_react_1.Send, { className: "h-4 w-4" }), onClick: function () { return submitForApprovalMutation.mutate({ id: est.id }); } },
                                            { label: "Duplicate Estimate", icon: RowActionsMenu_1.actionIcons.copy, onClick: function () { return navigate("/estimates/create?clone=" + est.id); } },
                                            { label: "Email Estimate", icon: RowActionsMenu_1.actionIcons.email, onClick: function () { return navigate(communications_1.buildCommunicationComposePath(location, "", "Estimate " + (est.quoteNumber || est.id))); }, separator: true },
                                            { label: "Convert to Invoice", icon: React.createElement(lucide_react_1.FileText, { className: "h-4 w-4" }), onClick: function () { return navigate("/invoices/create?fromEstimate=" + est.id); } },
                                            { label: "Download PDF", icon: RowActionsMenu_1.actionIcons.download, onClick: function () { navigate("/estimates/" + est.id); setTimeout(function () { return window.print(); }, 500); } },
                                        ] })))); }))))))))));
}
exports["default"] = Estimates;
