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
var spinner_1 = require("@/components/ui/spinner");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var checkbox_1 = require("@/components/ui/checkbox");
var card_1 = require("@/components/ui/card");
var useUserLookup_1 = require("@/hooks/useUserLookup");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var date_fns_1 = require("date-fns");
var data_table_controls_1 = require("@/components/ui/data-table-controls");
var ListPageToolbar_1 = require("@/components/list-page/ListPageToolbar");
var SummaryStatCards_1 = require("@/components/list-page/SummaryStatCards");
var TableColumnSettings_1 = require("@/components/list-page/TableColumnSettings");
var EnhancedBulkActions_1 = require("@/components/list-page/EnhancedBulkActions");
var RowActionsMenu_1 = require("@/components/list-page/RowActionsMenu");
var INVOICE_COLUMNS = [
    { key: "id", label: "ID", defaultVisible: true },
    { key: "date", label: "Date", defaultVisible: true },
    { key: "dueDate", label: "Due Date", defaultVisible: true },
    { key: "client", label: "Company Name", defaultVisible: true },
    { key: "createdBy", label: "Created By", defaultVisible: true },
    { key: "amount", label: "Amount", defaultVisible: true },
    { key: "status", label: "Status", defaultVisible: true },
    { key: "project", label: "Project", defaultVisible: false },
    { key: "approvedBy", label: "Approved By", defaultVisible: false },
    { key: "approvalDate", label: "Approval Date", defaultVisible: false },
    { key: "contact", label: "Contact", defaultVisible: false },
    { key: "tax", label: "Tax", defaultVisible: false },
    { key: "balance", label: "Balance", defaultVisible: false },
];
function Invoices() {
    // CALL ALL HOOKS UNCONDITIONALLY AT TOP LEVEL
    var getUserName = useUserLookup_1.useUserLookup().getUserName;
    var _a = permissions_1.useRequireFeature("accounting:invoices:view"), allowed = _a.allowed, isLoading = _a.isLoading;
    var _b = permissions_1.useRequireFeature("communications:email"), canEmail = _b.allowed, emailLoading = _b.isLoading;
    var _c = wouter_1.useLocation(), navigate = _c[1];
    var _d = react_1.useState(""), searchQuery = _d[0], setSearchQuery = _d[1];
    var _e = react_1.useState("all"), statusFilter = _e[0], setStatusFilter = _e[1];
    var _f = react_1.useState("issueDate"), sortField = _f[0], setSortField = _f[1];
    var _g = react_1.useState("desc"), sortOrder = _g[0], setSortOrder = _g[1];
    var _h = react_1.useState(false), isExporting = _h[0], setIsExporting = _h[1];
    var _j = react_1.useState(new Set()), selectedInvoices = _j[0], setSelectedInvoices = _j[1];
    var _k = data_table_controls_1.usePagination(25), page = _k.page, pageSize = _k.pageSize, setPage = _k.setPage, setPageSize = _k.setPageSize, paginate = _k.paginate;
    var _l = TableColumnSettings_1.useColumnVisibility(INVOICE_COLUMNS, "invoices"), visibleColumns = _l.visibleColumns, toggleColumn = _l.toggleColumn, isVisible = _l.isVisible, colPageSize = _l.pageSize, updatePageSize = _l.updatePageSize, reset = _l.reset;
    // Fetch real data from backend
    var _m = trpc_1.trpc.invoices.list.useQuery(), _o = _m.data, invoicesData = _o === void 0 ? [] : _o, isLoadingInvoices = _m.isLoading;
    var _p = trpc_1.trpc.clients.list.useQuery().data, clientsData = _p === void 0 ? [] : _p;
    var utils = trpc_1.trpc.useUtils();
    // Delete mutation
    var deleteInvoiceMutation = trpc_1.trpc.invoices["delete"].useMutation({
        onSuccess: function () {
            utils.invoices.list.invalidate();
            sonner_1.toast.success("Invoice deleted successfully");
            setSelectedInvoices(new Set());
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete invoice");
        }
    });
    var bulkDeleteInvoicesMutation = trpc_1.trpc.invoices.bulkDelete.useMutation({
        onSuccess: function (data) {
            sonner_1.toast.success(data.count + " invoice(s) deleted");
            utils.invoices.list.invalidate();
            setSelectedInvoices(new Set());
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete invoices");
        }
    });
    // email reminder mutation
    var sendReminderMutation = trpc_1.trpc.email.sendPaymentReminder.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Payment reminder sent");
        },
        onError: function (err) {
            sonner_1.toast.error(err.message || "Failed to send reminder");
        }
    });
    // Update (status/category) mutation
    var updateInvoiceMutation = trpc_1.trpc.invoices.update.useMutation({
        onSuccess: function () {
            utils.invoices.list.invalidate();
            sonner_1.toast.success("Invoice updated");
        },
        onError: function (err) { return sonner_1.toast.error(err.message || "Failed to update invoice"); }
    });
    // Download PDF mutation
    var downloadPDFMutation = trpc_1.trpc.invoices.downloadPDF.useMutation({
        onSuccess: function (data) {
            if ((data === null || data === void 0 ? void 0 : data.success) && data.data) {
                var byteChars_1 = atob(data.data);
                var byteNumbers = new Array(byteChars_1.length).fill(0).map(function (_, i) { return byteChars_1.charCodeAt(i); });
                var blob = new Blob([new Uint8Array(byteNumbers)], { type: "application/pdf" });
                var url = URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.href = url;
                a.download = data.fileName || "invoice.pdf";
                a.click();
                URL.revokeObjectURL(url);
                sonner_1.toast.success("PDF downloaded");
            }
        },
        onError: function (err) { return sonner_1.toast.error(err.message || "Failed to download PDF"); }
    });
    // Clone invoice mutation
    var cloneInvoiceMutation = trpc_1.trpc.invoices.create.useMutation({
        onSuccess: function (data) {
            utils.invoices.list.invalidate();
            sonner_1.toast.success("Invoice cloned");
            if (data === null || data === void 0 ? void 0 : data.id)
                navigate("/invoices/" + data.id + "/edit");
        },
        onError: function (err) { return sonner_1.toast.error(err.message || "Failed to clone invoice"); }
    });
    // Create recurring mutation
    var createRecurringMutation = trpc_1.trpc.invoices.payments.createRecurring.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Recurring invoice created");
        },
        onError: function (err) { return sonner_1.toast.error(err.message || "Failed to create recurring invoice"); }
    });
    var handleCloneInvoice = function (inv) {
        if (!inv.clientId) {
            sonner_1.toast.error("Cannot clone invoice without a client");
            return;
        }
        cloneInvoiceMutation.mutate({
            clientId: inv.clientId,
            title: (inv.title || inv.invoiceNumber) + " (Copy)",
            status: "draft",
            issueDate: new Date(),
            dueDate: new Date(Date.now() + 30 * 86400000),
            subtotal: inv.subtotal || inv.amount || 0,
            taxAmount: inv.taxAmount || 0,
            discountAmount: inv.discountAmount || 0,
            total: inv.amount || 0,
            notes: inv.notes || "",
            terms: inv.terms || ""
        });
    };
    var handleDownloadPDF = function (invId) {
        downloadPDFMutation.mutate(invId);
    };
    // NOW SAFE TO CHECK CONDITIONAL RETURNS (ALL HOOKS ALREADY CALLED)
    if (isLoading || emailLoading)
        return React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" }));
    if (!allowed)
        return null;
    // Safely convert frozen Drizzle objects to plain JS objects
    var plainInvoicesData = (function () {
        if (!Array.isArray(invoicesData))
            return [];
        return invoicesData.map(function (inv) {
            try {
                return JSON.parse(JSON.stringify(inv));
            }
            catch (_a) {
                return inv;
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
    var invoices = (function () {
        if (!Array.isArray(plainInvoicesData))
            return [];
        return plainInvoicesData.map(function (inv) {
            var _a, _b;
            return ({
                id: inv.id,
                invoiceNumber: inv.invoiceNumber || "INV-" + inv.id.slice(0, 8),
                client: ((_a = plainClientsData.find(function (c) { return c.id === inv.clientId; })) === null || _a === void 0 ? void 0 : _a.companyName) || "Unknown Client",
                clientEmail: (_b = plainClientsData.find(function (c) { return c.id === inv.clientId; })) === null || _b === void 0 ? void 0 : _b.email,
                amount: (inv.total || 0) / 100,
                status: inv.status || "draft",
                issueDate: inv.issueDate ? date_fns_1.format(new Date(inv.issueDate), "yyyy-MM-dd") : date_fns_1.format(new Date(), "yyyy-MM-dd"),
                dueDate: inv.dueDate ? date_fns_1.format(new Date(inv.dueDate), "yyyy-MM-dd") : date_fns_1.format(new Date(), "yyyy-MM-dd"),
                project: inv.projectId ? "Project" : undefined,
                createdBy: inv.createdBy || "System",
                createdAt: inv.createdAt ? date_fns_1.format(new Date(inv.createdAt), "yyyy-MM-dd HH:mm") : undefined,
                approvedBy: inv.approvedBy || undefined,
                approvedAt: inv.approvedAt ? date_fns_1.format(new Date(inv.approvedAt), "yyyy-MM-dd HH:mm") : undefined
            });
        });
    })();
    // Filter and sort invoices
    var filteredAndSortedInvoices = (function () {
        var result = invoices.filter(function (invoice) {
            var _a;
            var matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                invoice.client.toLowerCase().includes(searchQuery.toLowerCase()) || ((_a = invoice.project) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchQuery.toLowerCase()));
            var matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
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
            else if (sortField === "issueDate" || sortField === "dueDate") {
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
    var pagedInvoices = paginate(filteredAndSortedInvoices);
    var stats = (function () {
        var total = (invoices || []).reduce(function (sum, inv) { return sum + inv.amount; }, 0);
        var paid = (invoices || []).filter(function (inv) { return inv.status === "paid"; }).reduce(function (sum, inv) { return sum + inv.amount; }, 0);
        var pending = (invoices || []).filter(function (inv) { return inv.status === "pending" || inv.status === "sent"; }).reduce(function (sum, inv) { return sum + inv.amount; }, 0);
        var overdue = (invoices || []).filter(function (inv) { return inv.status === "overdue"; }).reduce(function (sum, inv) { return sum + inv.amount; }, 0);
        var paidCount = (invoices || []).filter(function (inv) { return inv.status === "paid"; }).length;
        var pendingCount = (invoices || []).filter(function (inv) { return inv.status === "pending" || inv.status === "sent"; }).length;
        var overdueCount = (invoices || []).filter(function (inv) { return inv.status === "overdue"; }).length;
        var fmt = function (v) { return "Ksh " + v.toLocaleString(undefined, { minimumFractionDigits: 2 }); };
        return [
            { label: "Invoices", value: fmt(total), count: invoices.length, color: "blue", progress: 100 },
            { label: "Payments", value: fmt(paid), count: paidCount, color: "green", progress: total > 0 ? (paid / total) * 100 : 0 },
            { label: "Due", value: fmt(pending), count: pendingCount, color: "orange", progress: total > 0 ? (pending / total) * 100 : 0 },
            { label: "Overdue", value: fmt(overdue), count: overdueCount, color: "red", progress: total > 0 ? (overdue / total) * 100 : 0 },
        ];
    })();
    var getStatusColor = function (status) {
        switch (status) {
            case "paid": return "bg-green-500/10 text-green-500 border-green-500/20";
            case "pending":
            case "sent": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
            case "overdue": return "bg-red-500/10 text-red-500 border-red-500/20";
            default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
        }
    };
    var toggleSort = function (field) {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        }
        else {
            setSortField(field);
            setSortOrder("asc");
        }
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Invoices", breadcrumbs: [
            { label: "App", href: "/crm-home" },
            { label: "Sales" },
            { label: "Invoices" },
        ], actions: React.createElement(ListPageToolbar_1.ListPageToolbar, { searchValue: searchQuery, onSearchChange: setSearchQuery, searchPlaceholder: "Search", onCreateClick: function () { return navigate("/invoices/create"); }, createLabel: "Create Invoice", onExportClick: function () {
                var csv = __spreadArrays([
                    ["Invoice #", "Client", "Amount", "Date", "Due Date", "Status"].join(",")
                ], filteredAndSortedInvoices.map(function (inv) { return [inv.invoiceNumber, inv.client, inv.amount, inv.issueDate, inv.dueDate, inv.status].join(","); })).join("\n");
                var blob = new Blob([csv], { type: "text/csv" });
                var url = URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.href = url;
                a.download = "invoices.csv";
                a.click();
                URL.revokeObjectURL(url);
                sonner_1.toast.success("Exported invoices");
            }, onPrintClick: function () { return window.print(); } }) },
        React.createElement("div", { className: "space-y-4" },
            React.createElement(EnhancedBulkActions_1.EnhancedBulkActions, { selectedCount: selectedInvoices.size, onClear: function () { return setSelectedInvoices(new Set()); }, actions: [
                    { id: "sendReminders", label: "Send Reminders", icon: React.createElement(lucide_react_1.Mail, { className: "h-3.5 w-3.5" }), onClick: function () { selectedInvoices.forEach(function (invId) { var inv = pagedInvoices.find(function (i) { return i.id === invId; }); if (inv && inv.clientEmail && canEmail)
                            sendReminderMutation.mutate({ invoiceId: invId, recipientEmail: inv.clientEmail }); }); } },
                    EnhancedBulkActions_1.bulkExportAction(selectedInvoices, pagedInvoices, INVOICE_COLUMNS, "invoices"),
                    EnhancedBulkActions_1.bulkCopyIdsAction(selectedInvoices),
                    EnhancedBulkActions_1.bulkEmailAction(navigate),
                    EnhancedBulkActions_1.bulkDeleteAction(selectedInvoices, function (ids) { return bulkDeleteInvoicesMutation.mutate(ids); }),
                ] }),
            React.createElement(SummaryStatCards_1.SummaryStatCards, { cards: stats }),
            React.createElement("div", { className: "flex items-center gap-2" },
                React.createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                    React.createElement(select_1.SelectTrigger, { className: "w-40 h-9" },
                        React.createElement(select_1.SelectValue, { placeholder: "All Statuses" })),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "all" }, "All Statuses"),
                        React.createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                        React.createElement(select_1.SelectItem, { value: "sent" }, "Sent"),
                        React.createElement(select_1.SelectItem, { value: "paid" }, "Paid"),
                        React.createElement(select_1.SelectItem, { value: "pending" }, "Pending"),
                        React.createElement(select_1.SelectItem, { value: "overdue" }, "Overdue")))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "p-0" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, { className: "w-10" },
                                    React.createElement(checkbox_1.Checkbox, { checked: selectedInvoices.size === pagedInvoices.length && pagedInvoices.length > 0, onCheckedChange: function (checked) {
                                            setSelectedInvoices(checked ? new Set(pagedInvoices.map(function (i) { return i.id; })) : new Set());
                                        } })),
                                isVisible("id") && (React.createElement(table_1.TableHead, { className: "cursor-pointer select-none px-2 sm:px-3 text-xs sm:text-sm", onClick: function () { return toggleSort("invoiceNumber"); } },
                                    React.createElement("span", { className: "inline-flex items-center gap-1 text-primary" },
                                        "ID ",
                                        React.createElement(lucide_react_1.ArrowUpDown, { className: "h-3 w-3" })))),
                                isVisible("date") && (React.createElement(table_1.TableHead, { className: "cursor-pointer select-none px-2 sm:px-3 text-xs sm:text-sm", onClick: function () { return toggleSort("issueDate"); } },
                                    React.createElement("span", { className: "inline-flex items-center gap-1 text-primary" },
                                        "Date ",
                                        React.createElement(lucide_react_1.ArrowUpDown, { className: "h-3 w-3" })))),
                                isVisible("dueDate") && (React.createElement(table_1.TableHead, { className: "cursor-pointer select-none px-2 sm:px-3 text-xs sm:text-sm", onClick: function () { return toggleSort("dueDate"); } },
                                    React.createElement("span", { className: "inline-flex items-center gap-1 text-primary" },
                                        "Due Date ",
                                        React.createElement(lucide_react_1.ArrowUpDown, { className: "h-3 w-3" })))),
                                isVisible("client") && (React.createElement(table_1.TableHead, { className: "cursor-pointer select-none px-2 sm:px-3 text-xs sm:text-sm", onClick: function () { return toggleSort("client"); } },
                                    React.createElement("span", { className: "inline-flex items-center gap-1 text-primary" },
                                        "Company Name ",
                                        React.createElement(lucide_react_1.ArrowUpDown, { className: "h-3 w-3" })))),
                                isVisible("createdBy") && (React.createElement(table_1.TableHead, { className: "cursor-pointer select-none px-2 sm:px-3 text-xs sm:text-sm" },
                                    React.createElement("span", { className: "inline-flex items-center gap-1 text-primary" },
                                        "Created By ",
                                        React.createElement(lucide_react_1.ArrowUpDown, { className: "h-3 w-3" })))),
                                isVisible("amount") && (React.createElement(table_1.TableHead, { className: "cursor-pointer select-none px-2 sm:px-3 text-xs sm:text-sm", onClick: function () { return toggleSort("amount"); } },
                                    React.createElement("span", { className: "inline-flex items-center gap-1 text-primary" },
                                        "Amount ",
                                        React.createElement(lucide_react_1.ArrowUpDown, { className: "h-3 w-3" })))),
                                isVisible("status") && (React.createElement(table_1.TableHead, { className: "cursor-pointer select-none px-2 sm:px-3 text-xs sm:text-sm", onClick: function () { return toggleSort("status"); } },
                                    React.createElement("span", { className: "inline-flex items-center gap-1 text-primary" },
                                        "Status ",
                                        React.createElement(lucide_react_1.ArrowUpDown, { className: "h-3 w-3" })))),
                                isVisible("project") && React.createElement(table_1.TableHead, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, "Project"),
                                isVisible("approvedBy") && React.createElement(table_1.TableHead, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, "Approved By"),
                                isVisible("approvalDate") && React.createElement(table_1.TableHead, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, "Approval Date"),
                                isVisible("contact") && React.createElement(table_1.TableHead, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, "Contact"),
                                isVisible("tax") && React.createElement(table_1.TableHead, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, "Tax"),
                                isVisible("balance") && React.createElement(table_1.TableHead, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, "Balance"),
                                React.createElement(table_1.TableHead, { className: "text-right" },
                                    React.createElement("div", { className: "flex items-center justify-end gap-1" },
                                        "Action",
                                        React.createElement(TableColumnSettings_1.TableColumnSettings, { columns: INVOICE_COLUMNS, visibleColumns: visibleColumns, onToggleColumn: toggleColumn, onReset: reset, pageSize: pageSize, onPageSizeChange: updatePageSize }))))),
                        React.createElement(table_1.TableBody, null, isLoadingInvoices ? (React.createElement(table_1.TableRow, null,
                            React.createElement(table_1.TableCell, { colSpan: 20, className: "text-center py-8" },
                                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin mx-auto text-primary" })))) : filteredAndSortedInvoices.length === 0 ? (React.createElement(table_1.TableRow, null,
                            React.createElement(table_1.TableCell, { colSpan: 20, className: "text-center py-8 text-muted-foreground" }, "No invoices found"))) : (pagedInvoices.map(function (inv) { return (React.createElement(table_1.TableRow, { key: inv.id },
                            React.createElement(table_1.TableCell, null,
                                React.createElement(checkbox_1.Checkbox, { checked: selectedInvoices.has(inv.id), onCheckedChange: function (checked) {
                                        var s = new Set(selectedInvoices);
                                        checked ? s.add(inv.id) : s["delete"](inv.id);
                                        setSelectedInvoices(s);
                                    } })),
                            isVisible("id") && (React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm" },
                                React.createElement("button", { className: "text-primary hover:underline font-medium", onClick: function () { return navigate("/invoices/" + inv.id); } }, inv.invoiceNumber))),
                            isVisible("date") && React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, inv.issueDate ? new Date(inv.issueDate).toLocaleDateString() : "-"),
                            isVisible("dueDate") && React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "-"),
                            isVisible("client") && (React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm" },
                                React.createElement("button", { className: "text-primary hover:underline", onClick: function () { } }, inv.client))),
                            isVisible("createdBy") && (React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm" },
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement("div", { className: "w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary" }, getUserName(inv.createdBy).charAt(0)),
                                    React.createElement("span", { className: "hidden sm:inline" }, getUserName(inv.createdBy))))),
                            isVisible("amount") && (React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm font-semibold" },
                                "Ksh ",
                                inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 }))),
                            isVisible("status") && (React.createElement(table_1.TableCell, { className: "px-2 sm:px-3" },
                                React.createElement(badge_1.Badge, { variant: "outline", className: getStatusColor(inv.status) }, (inv.status || "draft").charAt(0).toUpperCase() + (inv.status || "draft").slice(1)))),
                            isVisible("project") && React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, inv.project || "---"),
                            isVisible("approvedBy") && React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm text-muted-foreground" }, getUserName(inv.approvedBy)),
                            isVisible("approvalDate") && React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm text-muted-foreground" }, inv.approvedAt || "---"),
                            isVisible("contact") && React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, "---"),
                            isVisible("tax") && React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, "---"),
                            isVisible("balance") && React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, "---"),
                            React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-right" },
                                React.createElement(RowActionsMenu_1.RowActionsMenu, { primaryActions: [
                                        { label: "Delete", icon: RowActionsMenu_1.actionIcons["delete"], onClick: function () { if (confirm("Delete this invoice?"))
                                                deleteInvoiceMutation.mutate(inv.id); }, variant: "destructive" },
                                        { label: "Edit", icon: RowActionsMenu_1.actionIcons.edit, onClick: function () { return navigate("/invoices/" + inv.id + "/edit"); } },
                                        { label: "View", icon: RowActionsMenu_1.actionIcons.view, onClick: function () { return navigate("/invoices/" + inv.id); } },
                                    ], menuActions: [
                                        { label: "Invoice URL", icon: React.createElement(lucide_react_1.Link2, { className: "h-4 w-4" }), onClick: function () { navigator.clipboard.writeText(window.location.origin + "/invoices/" + inv.id); sonner_1.toast.success("URL copied"); } },
                                        { label: "Email To Client", icon: RowActionsMenu_1.actionIcons.email, onClick: function () { if (inv.clientEmail && canEmail)
                                                sendReminderMutation.mutate({ invoiceId: inv.id, recipientEmail: inv.clientEmail }); }, hidden: !inv.clientEmail },
                                        { label: "Mark as Sent", icon: React.createElement(lucide_react_1.Tag, { className: "h-4 w-4" }), onClick: function () { return updateInvoiceMutation.mutate({ id: inv.id, status: "sent" }); } },
                                        { label: "Mark as Paid", icon: React.createElement(lucide_react_1.Tag, { className: "h-4 w-4" }), onClick: function () { return updateInvoiceMutation.mutate({ id: inv.id, status: "paid" }); } },
                                        { label: "Mark as Cancelled", icon: React.createElement(lucide_react_1.Tag, { className: "h-4 w-4" }), onClick: function () { return updateInvoiceMutation.mutate({ id: inv.id, status: "cancelled" }); } },
                                        { label: "Add A New Payment", icon: React.createElement(lucide_react_1.CreditCard, { className: "h-4 w-4" }), onClick: function () { return navigate("/payments/create"); } },
                                        { label: "Clone Invoice", icon: React.createElement(lucide_react_1.Copy, { className: "h-4 w-4" }), onClick: function () { return handleCloneInvoice(inv); } },
                                        { label: "Attach To A Project", icon: React.createElement(lucide_react_1.FolderOpen, { className: "h-4 w-4" }), onClick: function () { return navigate("/invoices/" + inv.id + "/edit"); } },
                                        { label: "Set Recurring", icon: React.createElement(lucide_react_1.RotateCcw, { className: "h-4 w-4" }), onClick: function () { if (!inv.clientId) {
                                                sonner_1.toast.error("Cannot set recurring without a client");
                                                return;
                                            } createRecurringMutation.mutate({ clientId: inv.clientId, templateInvoiceId: inv.id, frequency: "monthly", startDate: new Date().toISOString() }); } },
                                        { label: "View Payments", icon: RowActionsMenu_1.actionIcons.view, onClick: function () { return navigate("/payments"); } },
                                        { label: "Download", icon: RowActionsMenu_1.actionIcons.download, onClick: function () { return handleDownloadPDF(inv.id); }, separator: true },
                                    ], showStar: true, showDownload: true, onDownload: function () { return handleDownloadPDF(inv.id); } })))); })))),
                    React.createElement("div", { className: "px-2" },
                        React.createElement(data_table_controls_1.PaginationControls, { total: filteredAndSortedInvoices.length, page: page, pageSize: pageSize, onPageChange: setPage, onPageSizeChange: setPageSize })))))));
}
exports["default"] = Invoices;
