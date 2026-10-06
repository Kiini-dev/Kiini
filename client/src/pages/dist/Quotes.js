"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.Quotes = void 0;
var react_1 = require("react");
var wouter_1 = require("wouter");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("../utils/trpc");
var EmptyState_1 = require("../components/EmptyState");
var format_1 = require("../utils/format");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var select_1 = require("@/components/ui/select");
var checkbox_1 = require("@/components/ui/checkbox");
var sonner_1 = require("sonner");
var ListPageToolbar_1 = require("@/components/list-page/ListPageToolbar");
var RowActionsMenu_1 = require("@/components/list-page/RowActionsMenu");
var TableColumnSettings_1 = require("@/components/list-page/TableColumnSettings");
var EnhancedBulkActions_1 = require("@/components/list-page/EnhancedBulkActions");
var stats_card_1 = require("@/components/ui/stats-card");
function Quotes() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = react_1.useState([]), quotes = _b[0], setQuotes = _b[1];
    var _c = react_1.useState([]), filteredQuotes = _c[0], setFilteredQuotes = _c[1];
    var _d = react_1.useState(true), loading = _d[0], setLoading = _d[1];
    var _e = react_1.useState(""), searchTerm = _e[0], setSearchTerm = _e[1];
    var _f = react_1.useState("all"), statusFilter = _f[0], setStatusFilter = _f[1];
    var _g = react_1.useState(new Set()), selectedQuotes = _g[0], setSelectedQuotes = _g[1];
    var quoteColumns = [
        { key: "quoteNumber", label: "Quote Number" },
        { key: "subject", label: "Subject" },
        { key: "status", label: "Status" },
        { key: "total", label: "Total" },
        { key: "created", label: "Created" },
    ];
    var _h = TableColumnSettings_1.useColumnVisibility(quoteColumns, "quotes"), visibleColumns = _h.visibleColumns, toggleColumn = _h.toggleColumn, isVisible = _h.isVisible, pageSize = _h.pageSize, updatePageSize = _h.updatePageSize, reset = _h.reset;
    var listQuery = trpc_1.trpc.quotes.list.useQuery({ limit: 100 }, { enabled: true });
    var deleteQuoteMutation = trpc_1.trpc.quotes["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Quote deleted");
            listQuery.refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete quote");
        }
    });
    var sendQuoteMutation = trpc_1.trpc.quotes.send.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Quote sent");
            listQuery.refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to send quote");
        }
    });
    react_1.useEffect(function () {
        if (listQuery.data) {
            setQuotes(listQuery.data);
            setLoading(false);
        }
    }, [listQuery.data]);
    // Filter quotes
    react_1.useEffect(function () {
        var filtered = quotes;
        if (statusFilter !== "all") {
            filtered = filtered.filter(function (q) { return q.status === statusFilter; });
        }
        if (searchTerm) {
            filtered = filtered.filter(function (q) {
                return q.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    q.subject.toLowerCase().includes(searchTerm.toLowerCase());
            });
        }
        setFilteredQuotes(filtered);
    }, [quotes, statusFilter, searchTerm]);
    var handleSelectAll = function () {
        if (selectedQuotes.size === filteredQuotes.length) {
            setSelectedQuotes(new Set());
        }
        else {
            setSelectedQuotes(new Set(filteredQuotes.map(function (q) { return q.id; })));
        }
    };
    var handleSelectQuote = function (id) {
        var newSelected = new Set(selectedQuotes);
        if (newSelected.has(id)) {
            newSelected["delete"](id);
        }
        else {
            newSelected.add(id);
        }
        setSelectedQuotes(newSelected);
    };
    var getStatusColor = function (status) {
        var statusColors = {
            draft: "bg-gray-100 text-gray-800",
            sent: "bg-blue-100 text-blue-800",
            accepted: "bg-green-100 text-green-800",
            declined: "bg-red-100 text-red-800",
            expired: "bg-orange-100 text-orange-800",
            converted: "bg-purple-100 text-purple-800"
        };
        return statusColors[status] || "bg-gray-100 text-gray-800";
    };
    var getStatusLabel = function (status) {
        var labels = {
            draft: "Draft",
            sent: "Sent",
            accepted: "Accepted",
            declined: "Declined",
            expired: "Expired",
            converted: "Converted to Invoice"
        };
        return labels[status] || status;
    };
    var handleExport = function () {
        var data = filteredQuotes.map(function (q) { return ({
            "Quote #": q.quoteNumber,
            Subject: q.subject,
            Status: getStatusLabel(q.status),
            Total: "$" + q.total.toFixed(2),
            "Created": format_1.formatDate(new Date(q.createdAt))
        }); });
        var csv = __spreadArrays([
            Object.keys(data[0]).join(",")
        ], data.map(function (row) { return Object.values(row).join(","); })).join("\n");
        var blob = new Blob([csv], { type: "text/csv" });
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "quotes-" + new Date().toISOString().split("T")[0] + ".csv";
        a.click();
    };
    if (loading) {
        return (React.createElement("div", { className: "flex items-center justify-center h-96" },
            React.createElement("div", { className: "text-center" },
                React.createElement("div", { className: "inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }),
                React.createElement("p", { className: "mt-2 text-gray-600" }, "Loading quotes..."))));
    }
    if (quotes.length === 0) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Quotes & Estimates", description: "Create and manage client quotes", icon: React.createElement(lucide_react_1.FileText, { className: "h-5 w-5" }), breadcrumbs: [
                { label: "Dashboard", href: "/crm-home" },
                { label: "Sales", href: "/sales-pipeline" },
                { label: "Quotes" },
            ] },
            React.createElement("div", { className: "space-y-6" },
                React.createElement("div", { className: "flex justify-between items-center" },
                    React.createElement("div", null),
                    React.createElement(button_1.Button, { onClick: function () { return navigate("/quotes/new"); } },
                        React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                        "New Quote")),
                React.createElement(EmptyState_1.EmptyState, { title: "No Quotes Yet", description: "Create your first quote to get started", actionLabel: "Create Quote", onAction: function () { return navigate("/quotes/new"); } }))));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Quotes & Estimates", description: "Create and manage client quotes", icon: React.createElement(lucide_react_1.FileText, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Sales", href: "/sales-pipeline" },
            { label: "Quotes" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Quotes", value: quotes.length, icon: React.createElement(lucide_react_1.FileText, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Total Value", value: "$" + quotes.reduce(function (s, q) { return s + q.total; }, 0).toLocaleString(undefined, { minimumFractionDigits: 2 }), icon: React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }), color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Accepted", value: quotes.filter(function (q) { return q.status === "accepted"; }).length, icon: React.createElement(lucide_react_1.CheckCircle2, { className: "h-5 w-5" }), color: "border-l-emerald-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Pending", value: quotes.filter(function (q) { return q.status === "sent" || q.status === "draft"; }).length, icon: React.createElement(lucide_react_1.Clock, { className: "h-5 w-5" }), color: "border-l-yellow-500" })),
            React.createElement(ListPageToolbar_1.ListPageToolbar, { searchValue: searchTerm, onSearchChange: setSearchTerm, searchPlaceholder: "Search quotes...", onCreateClick: function () { return navigate("/quotes/new"); }, createLabel: "New Quote", onExportClick: handleExport, onPrintClick: function () { return window.print(); }, filterContent: React.createElement(select_1.Select, { value: statusFilter, onValueChange: function (v) { return setStatusFilter(v); } },
                    React.createElement(select_1.SelectTrigger, { className: "w-40" },
                        React.createElement(select_1.SelectValue, { placeholder: "All Statuses" })),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "all" }, "All Statuses"),
                        React.createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                        React.createElement(select_1.SelectItem, { value: "sent" }, "Sent"),
                        React.createElement(select_1.SelectItem, { value: "accepted" }, "Accepted"),
                        React.createElement(select_1.SelectItem, { value: "declined" }, "Declined"),
                        React.createElement(select_1.SelectItem, { value: "expired" }, "Expired"),
                        React.createElement(select_1.SelectItem, { value: "converted" }, "Converted"))) }),
            React.createElement(EnhancedBulkActions_1.EnhancedBulkActions, { selectedCount: selectedQuotes.size, onClear: function () { return setSelectedQuotes(new Set()); }, actions: [
                    EnhancedBulkActions_1.bulkSendAction(selectedQuotes, function (ids) { ids.forEach(function (id) { return sendQuoteMutation.mutate({ id: id }); }); setSelectedQuotes(new Set()); }),
                    EnhancedBulkActions_1.bulkExportAction(selectedQuotes, quotes, quoteColumns, "quotes"),
                    EnhancedBulkActions_1.bulkCopyIdsAction(selectedQuotes),
                    EnhancedBulkActions_1.bulkEmailAction(navigate),
                    EnhancedBulkActions_1.bulkDeleteAction(selectedQuotes, function (ids) { ids.forEach(function (id) { return deleteQuoteMutation.mutate(id); }); setSelectedQuotes(new Set()); }),
                ] }),
            filteredQuotes.length > 0 ? (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "p-0" },
                    React.createElement("div", { className: "flex items-center justify-between px-4 py-3 border-b" },
                        React.createElement("span", { className: "text-sm text-muted-foreground" },
                            filteredQuotes.length,
                            " quotes"),
                        React.createElement(TableColumnSettings_1.TableColumnSettings, { columns: quoteColumns, visibleColumns: visibleColumns, onToggleColumn: toggleColumn, onReset: reset, pageSize: pageSize, onPageSizeChange: updatePageSize })),
                    React.createElement("div", { className: "overflow-x-auto" },
                        React.createElement(table_1.Table, null,
                            React.createElement(table_1.TableHeader, null,
                                React.createElement(table_1.TableRow, null,
                                    React.createElement(table_1.TableHead, { className: "w-10" },
                                        React.createElement(checkbox_1.Checkbox, { checked: selectedQuotes.size === filteredQuotes.length && filteredQuotes.length > 0, onCheckedChange: handleSelectAll })),
                                    isVisible("quoteNumber") && React.createElement(table_1.TableHead, null, "Quote Number"),
                                    isVisible("subject") && React.createElement(table_1.TableHead, null, "Subject"),
                                    isVisible("status") && React.createElement(table_1.TableHead, null, "Status"),
                                    isVisible("total") && React.createElement(table_1.TableHead, { className: "text-right" }, "Total"),
                                    isVisible("created") && React.createElement(table_1.TableHead, null, "Created"),
                                    React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                            React.createElement(table_1.TableBody, null, filteredQuotes.map(function (quote) { return (React.createElement(table_1.TableRow, { key: quote.id, className: selectedQuotes.has(quote.id) ? "bg-primary/5" : "" },
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(checkbox_1.Checkbox, { checked: selectedQuotes.has(quote.id), onCheckedChange: function () { return handleSelectQuote(quote.id); } })),
                                isVisible("quoteNumber") && React.createElement(table_1.TableCell, { className: "font-medium font-mono text-blue-600 cursor-pointer hover:underline", onClick: function () { return navigate("/quotes/" + quote.id); } }, quote.quoteNumber),
                                isVisible("subject") && React.createElement(table_1.TableCell, null, quote.subject),
                                isVisible("status") && React.createElement(table_1.TableCell, null,
                                    React.createElement(badge_1.Badge, { className: getStatusColor(quote.status) }, getStatusLabel(quote.status))),
                                isVisible("total") && React.createElement(table_1.TableCell, { className: "text-right font-semibold" },
                                    "$",
                                    quote.total.toFixed(2)),
                                isVisible("created") && React.createElement(table_1.TableCell, { className: "text-muted-foreground" }, format_1.formatDate(new Date(quote.createdAt))),
                                React.createElement(table_1.TableCell, { className: "text-right" },
                                    React.createElement(RowActionsMenu_1.RowActionsMenu, { primaryActions: [
                                            { label: "View", icon: RowActionsMenu_1.actionIcons.view, onClick: function () { return navigate("/quotes/" + quote.id); } },
                                        ], menuActions: [
                                            { label: "Edit Quote", icon: RowActionsMenu_1.actionIcons.edit, onClick: function () { return navigate("/quotes/" + quote.id + "/edit"); } },
                                            { label: "Duplicate", icon: RowActionsMenu_1.actionIcons.copy, onClick: function () { return navigate("/quotes/" + quote.id + "/duplicate"); } },
                                            { label: "Send to Client", icon: React.createElement(lucide_react_1.Send, { className: "h-4 w-4" }), onClick: function () { return sendQuoteMutation.mutate({ id: quote.id }); }, separator: true },
                                            { label: "Convert to Invoice", icon: React.createElement(lucide_react_1.LogIn, { className: "h-4 w-4" }), onClick: function () { return navigate("/quotes/" + quote.id + "/convert"); } },
                                            { label: "Download PDF", icon: RowActionsMenu_1.actionIcons.download, onClick: function () { navigate("/quotations/" + quote.id); setTimeout(function () { return window.print(); }, 500); } },
                                        ] })))); }))))))) : (React.createElement(EmptyState_1.EmptyState, { title: "No Quotes Found", description: "Try adjusting your filters to find what you're looking for", actionLabel: "Create New Quote", onAction: function () { return navigate("/quotes/new"); } })))));
}
exports.Quotes = Quotes;
