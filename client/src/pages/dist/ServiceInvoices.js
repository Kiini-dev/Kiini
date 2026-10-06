"use strict";
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
var permissions_1 = require("@/lib/permissions");
var trpc_1 = require("@/lib/trpc");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var spinner_1 = require("@/components/ui/spinner");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var checkbox_1 = require("@/components/ui/checkbox");
var date_fns_1 = require("date-fns");
var data_table_controls_1 = require("@/components/ui/data-table-controls");
var ListPageToolbar_1 = require("@/components/list-page/ListPageToolbar");
var SummaryStatCards_1 = require("@/components/list-page/SummaryStatCards");
var TableColumnSettings_1 = require("@/components/list-page/TableColumnSettings");
var RowActionsMenu_1 = require("@/components/list-page/RowActionsMenu");
var SearchAndFilter_1 = require("@/components/SearchAndFilter");
var SERVICE_INVOICE_COLUMNS = [
    { key: "id", label: "ID", defaultVisible: true },
    { key: "serviceInvoiceNumber", label: "Invoice #", defaultVisible: true },
    { key: "issueDate", label: "Issue Date", defaultVisible: true },
    { key: "dueDate", label: "Due Date", defaultVisible: true },
    { key: "clientName", label: "Client", defaultVisible: true },
    { key: "serviceDescription", label: "Description", defaultVisible: true },
    { key: "total", label: "Amount", defaultVisible: true },
    { key: "status", label: "Status", defaultVisible: true },
];
function ServiceInvoices() {
    var _a = permissions_1.useRequireFeature("accounting:service-invoices:view"), allowed = _a.allowed, permLoading = _a.isLoading;
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    var _c = react_1.useState(""), searchTerm = _c[0], setSearchTerm = _c[1];
    var _d = react_1.useState("all"), statusFilter = _d[0], setStatusFilter = _d[1];
    var _e = react_1.useState("issueDate"), sortField = _e[0], setSortField = _e[1];
    var _f = react_1.useState("desc"), sortOrder = _f[0], setSortOrder = _f[1];
    var _g = react_1.useState(new Set()), selectedInvoices = _g[0], setSelectedInvoices = _g[1];
    var _h = TableColumnSettings_1.useColumnVisibility(SERVICE_INVOICE_COLUMNS, "serviceinvoices"), visibleColumns = _h.visibleColumns, toggleColumn = _h.toggleColumn, isVisible = _h.isVisible;
    var _j = data_table_controls_1.usePagination(25), page = _j.page, pageSize = _j.pageSize, setPage = _j.setPage, setPageSize = _j.setPageSize, paginate = _j.paginate;
    var setSearchQuery = setSearchTerm;
    var setFilters = function (filters) {
        if (filters.status)
            setStatusFilter(filters.status);
        if (filters.sortBy) {
            var sortMap = {
                number: "serviceInvoiceNumber",
                date: "issueDate",
                amount: "total",
                dueDate: "dueDate"
            };
            setSortField(sortMap[filters.sortBy] || "issueDate");
        }
        if (filters.sortOrder)
            setSortOrder(filters.sortOrder);
    };
    var listQuery = trpc_1.trpc.serviceInvoices.list.useQuery({}, {
        onError: function (error) {
            sonner_1.toast.error("Failed to load service invoices: " + error.message);
        }
    });
    var deleteMutation = trpc_1.trpc.serviceInvoices["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Service invoice deleted successfully");
            listQuery.refetch();
            setSelectedInvoices(new Set());
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to delete: " + error.message);
        }
    });
    var handleDelete = function (id) {
        if (confirm("Are you sure you want to delete this service invoice?")) {
            deleteMutation.mutate({ id: id });
        }
    };
    // Process and sort data
    var processedInvoices = react_1.useMemo(function () {
        var filtered = (listQuery.data || []);
        if (statusFilter !== "all") {
            filtered = filtered.filter(function (inv) { return inv.status === statusFilter; });
        }
        if (searchTerm) {
            filtered = filtered.filter(function (inv) {
                return inv.serviceInvoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    inv.clientName.toLowerCase().includes(searchTerm.toLowerCase());
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
            title: "Total Invoices",
            value: (listQuery.data || []).length.toString(),
            icon: "FileText",
            trend: "neutral"
        },
        {
            title: "Total Revenue",
            value: "$" + (listQuery.data || []).reduce(function (sum, inv) { return sum + (inv.total || 0); }, 0).toLocaleString(undefined, { maximumFractionDigits: 2 }),
            icon: "DollarSign",
            trend: "up"
        },
        {
            title: "Pending Payment",
            value: (listQuery.data || []).filter(function (inv) { return inv.status === "sent" || inv.status === "accepted"; }).length.toString(),
            icon: "Clock",
            trend: "neutral"
        },
    ]; }, [listQuery.data]);
    var paginatedInvoices = paginate(processedInvoices);
    if (permLoading)
        return React.createElement(spinner_1.Spinner, null);
    if (!allowed)
        return React.createElement("div", { className: "text-center py-10" }, "Access Denied");
    var getStatusColor = function (status) {
        switch (status) {
            case "draft": return "secondary";
            case "sent": return "default";
            case "accepted": return "outline";
            case "paid": return "default";
            case "cancelled": return "destructive";
            default: return "secondary";
        }
    };
    var rowActions = __spreadArrays([
        { icon: lucide_react_1.Eye, label: "View", onClick: function (id) { return setLocation("/service-invoices/" + id); } },
        { icon: lucide_react_1.Edit, label: "Edit", onClick: function (id) { return setLocation("/service-invoices/" + id + "/edit"); } },
        { icon: lucide_react_1.Download, label: "Download", onClick: function (id) { return sonner_1.toast.info("PDF download feature"); } }
    ], (statusFilter === "draft" ? [{ icon: lucide_react_1.Send, label: "Send", onClick: function (id) { return sonner_1.toast.info("Send functionality"); } }] : []), [
        { icon: lucide_react_1.Trash2, label: "Delete", onClick: handleDelete, destructive: true },
    ]);
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Service Invoices", description: "Invoice clients for services rendered", icon: React.createElement(lucide_react_1.Wrench, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Products & Services", href: "/services" },
            { label: "Services", href: "/services-invoices" },
        ], actions: React.createElement(button_1.Button, { onClick: function () { return setLocation("/service-invoices/create"); } },
            React.createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
            "Add Service Invoice") },
        React.createElement("div", { className: "space-y-6" },
            React.createElement(SearchAndFilter_1.InvoiceSearchFilter, { onSearch: setSearchQuery, onFilter: setFilters }),
            React.createElement(SummaryStatCards_1.SummaryStatCards, { cards: statCards }),
            React.createElement("div", { className: "mb-6" },
                React.createElement(ListPageToolbar_1.ListPageToolbar, { searchTerm: searchTerm, onSearchChange: setSearchTerm, onNewClick: function () { return setLocation("/service-invoices/create"); }, filterOptions: [
                        { value: "all", label: "All" },
                        { value: "draft", label: "Draft" },
                        { value: "sent", label: "Sent" },
                        { value: "accepted", label: "Accepted" },
                        { value: "paid", label: "Paid" },
                        { value: "cancelled", label: "Cancelled" },
                    ], currentFilter: statusFilter, onFilterChange: setStatusFilter })),
            listQuery.isLoading ? (React.createElement("div", { className: "flex justify-center py-10" },
                React.createElement(spinner_1.Spinner, null))) : paginatedInvoices.length === 0 ? (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "py-10 text-center text-gray-500" }, "No service invoices found"))) : (React.createElement(card_1.Card, null,
                React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, { className: "w-12" },
                                    React.createElement(checkbox_1.Checkbox, { checked: selectedInvoices.size === paginatedInvoices.length && paginatedInvoices.length > 0, onCheckedChange: function (checked) {
                                            if (checked) {
                                                setSelectedInvoices(new Set(paginatedInvoices.map(function (inv) { return inv.id; })));
                                            }
                                            else {
                                                setSelectedInvoices(new Set());
                                            }
                                        } })),
                                visibleColumns.map(function (col) { return (React.createElement(table_1.TableHead, { key: col.key, className: "cursor-pointer hover:bg-gray-100" },
                                    React.createElement("div", { className: "flex items-center gap-2" },
                                        col.label,
                                        sortField === col.key && React.createElement(lucide_react_1.ArrowUpDown, { className: "w-4 h-4" })))); }),
                                React.createElement(table_1.TableHead, { className: "w-12" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, paginatedInvoices.map(function (inv) {
                            var _a;
                            return (React.createElement(table_1.TableRow, { key: inv.id, className: "hover:bg-gray-50" },
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(checkbox_1.Checkbox, { checked: selectedInvoices.has(inv.id), onCheckedChange: function (checked) {
                                            var newSet = new Set(selectedInvoices);
                                            if (checked)
                                                newSet.add(inv.id);
                                            else
                                                newSet["delete"](inv.id);
                                            setSelectedInvoices(newSet);
                                        } })),
                                isVisible("serviceInvoiceNumber") && React.createElement(table_1.TableCell, { className: "font-medium" }, inv.serviceInvoiceNumber),
                                isVisible("issueDate") && React.createElement(table_1.TableCell, null, date_fns_1.format(new Date(inv.issueDate), "MMM dd, yyyy")),
                                isVisible("dueDate") && React.createElement(table_1.TableCell, null, date_fns_1.format(new Date(inv.dueDate), "MMM dd, yyyy")),
                                isVisible("clientName") && React.createElement(table_1.TableCell, null, inv.clientName),
                                isVisible("serviceDescription") && React.createElement(table_1.TableCell, { className: "text-sm text-gray-600" }, (_a = inv.serviceDescription) === null || _a === void 0 ? void 0 :
                                    _a.substring(0, 50),
                                    "..."),
                                isVisible("total") && React.createElement(table_1.TableCell, { className: "font-semibold" },
                                    "KES ",
                                    inv.total.toLocaleString()),
                                isVisible("status") && (React.createElement(table_1.TableCell, null,
                                    React.createElement(badge_1.Badge, { variant: getStatusColor(inv.status) }, inv.status.charAt(0).toUpperCase() + inv.status.slice(1)))),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(RowActionsMenu_1.RowActionsMenu, { id: inv.id, actions: rowActions }))));
                        })))),
                React.createElement("div", { className: "border-t p-4 flex justify-between items-center" },
                    React.createElement(data_table_controls_1.PaginationControls, { page: page, pageSize: pageSize, totalItems: processedInvoices.length, onPageChange: setPage, onPageSizeChange: setPageSize })))))));
}
exports["default"] = ServiceInvoices;
