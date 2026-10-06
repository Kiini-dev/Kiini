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
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var card_1 = require("@/components/ui/card");
var designSystem_1 = require("@/lib/designSystem");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var date_fns_1 = require("date-fns");
var paymentMethods_1 = require("@/const/paymentMethods");
var iconMap = {
    DollarSign: lucide_react_1.DollarSign,
    CheckCircle2: lucide_react_1.CheckCircle2,
    Calendar: lucide_react_1.Calendar
};
var PAYMENT_METHOD_ICONS = {
    cash: lucide_react_1.Banknote,
    "bank-transfer": lucide_react_1.Building2,
    mpesa: lucide_react_1.Smartphone,
    cheque: lucide_react_1.FileText,
    card: lucide_react_1.CreditCard
};
var PAYMENT_METHOD_COLORS = {
    cash: "bg-green-500/10 text-green-500 border-green-500/20",
    "bank-transfer": "bg-blue-500/10 text-blue-500 border-blue-500/20",
    mpesa: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    cheque: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    card: "bg-orange-500/10 text-orange-500 border-orange-500/20"
};
function Receipts() {
    // CALL ALL HOOKS UNCONDITIONALLY AT TOP LEVEL
    var _a = permissions_1.useRequireFeature("accounting:receipts:view"), allowed = _a.allowed, isLoading = _a.isLoading;
    var _b = wouter_1.useLocation(), navigate = _b[1];
    var _c = react_1.useState(""), searchQuery = _c[0], setSearchQuery = _c[1];
    var _d = react_1.useState("all"), methodFilter = _d[0], setMethodFilter = _d[1];
    var _e = react_1.useState("all"), statusFilter = _e[0], setStatusFilter = _e[1];
    var _f = react_1.useState("date"), sortField = _f[0], setSortField = _f[1];
    var _g = react_1.useState("desc"), sortOrder = _g[0], setSortOrder = _g[1];
    var _h = react_1.useState(false), isExporting = _h[0], setIsExporting = _h[1];
    var _j = react_1.useState(new Set()), selectedReceipts = _j[0], setSelectedReceipts = _j[1];
    // Fetch real data from backend
    var _k = trpc_1.trpc.receipts.list.useQuery({}), _l = _k.data, receiptsData = _l === void 0 ? [] : _l, isLoadingReceipts = _k.isLoading;
    var _m = trpc_1.trpc.clients.list.useQuery({}).data, clientsData = _m === void 0 ? [] : _m;
    var utils = trpc_1.trpc.useUtils();
    // Delete mutation
    var deleteReceiptMutation = trpc_1.trpc.receipts["delete"].useMutation({
        onSuccess: function () {
            utils.receipts.list.invalidate();
            sonner_1.toast.success("Receipt deleted successfully");
            setSelectedReceipts(new Set());
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete receipt");
        }
    });
    // Convert frozen Drizzle objects to plain JS for React dependencies
    var plainReceiptsData = Array.isArray(receiptsData)
        ? receiptsData.map(function (rec) { return JSON.parse(JSON.stringify(rec)); })
        : [];
    var plainClientsData = Array.isArray(clientsData)
        ? clientsData.map(function (client) { return JSON.parse(JSON.stringify(client)); })
        : [];
    // Transform backend data to display format
    var receipts = react_1.useMemo(function () {
        return plainReceiptsData.map(function (rec) {
            var _a, _b;
            return ({
                id: rec.id,
                receiptNumber: rec.receiptNumber || "REC-" + rec.id.slice(0, 8),
                client: ((_a = plainClientsData.find(function (c) { return c.id === rec.clientId; })) === null || _a === void 0 ? void 0 : _a.companyName) || "Unknown Client",
                clientEmail: (_b = plainClientsData.find(function (c) { return c.id === rec.clientId; })) === null || _b === void 0 ? void 0 : _b.email,
                amount: (rec.amount || 0) / 100,
                paymentMethod: rec.paymentMethod || "cash",
                date: rec.date ? date_fns_1.format(new Date(rec.date), "yyyy-MM-dd") : new Date().toISOString().split("T")[0],
                invoice: rec.invoiceId ? "INV-" + rec.invoiceId.slice(0, 8) : "N/A",
                status: rec.status || "issued"
            });
        });
    }, [plainReceiptsData, plainClientsData]);
    // Filter and sort receipts
    var filteredAndSortedReceipts = react_1.useMemo(function () {
        var result = receipts.filter(function (receipt) {
            var matchesSearch = receipt.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                receipt.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                receipt.invoice.toLowerCase().includes(searchQuery.toLowerCase());
            var matchesMethod = methodFilter === "all" || receipt.paymentMethod === methodFilter;
            var matchesStatus = statusFilter === "all" || receipt.status === statusFilter;
            return matchesSearch && matchesMethod && matchesStatus;
        });
        // Sort
        result.sort(function (a, b) {
            var aVal = a[sortField];
            var bVal = b[sortField];
            if (sortField === "amount") {
                aVal = parseFloat(String(aVal));
                bVal = parseFloat(String(bVal));
            }
            else if (sortField === "date") {
                aVal = new Date(aVal).getTime();
                bVal = new Date(bVal).getTime();
            }
            if (sortOrder === "asc") {
                return aVal > bVal ? 1 : -1;
            }
            else {
                return aVal < bVal ? 1 : -1;
            }
        });
        return result;
    }, [receipts, searchQuery, methodFilter, statusFilter, sortField, sortOrder]);
    var stats = react_1.useMemo(function () { return [
        {
            title: "Total Received",
            value: "Ksh " + (receipts.reduce(function (sum, rec) { return sum + (rec.amount || 0); }, 0) / 100).toLocaleString(undefined, { maximumFractionDigits: 0 }),
            description: "All time",
            iconName: "DollarSign"
        },
        {
            title: "Issued Receipts",
            value: receipts.filter(function (rec) { return rec.status === "issued"; }).length,
            description: "Active receipts",
            iconName: "CheckCircle2"
        },
        {
            title: "This Month",
            value: "Ksh " + receipts
                .filter(function (rec) {
                var recDate = new Date(rec.date);
                var now = new Date();
                return recDate.getMonth() === now.getMonth() && recDate.getFullYear() === now.getFullYear();
            })
                .reduce(function (sum, rec) { return sum + (rec.amount || 0); }, 0) / 100
                .toLocaleString(undefined, { maximumFractionDigits: 0 }),
            description: "Current month",
            iconName: "Calendar"
        },
    ]; }, [receipts]);
    // Action handlers
    var handleView = function (id) {
        navigate("/receipts/" + id);
    };
    var handleEdit = function (id) {
        navigate("/receipts/" + id + "/edit");
    };
    var handleDelete = function (id) {
        if (confirm("Are you sure you want to delete this receipt?")) {
            deleteReceiptMutation.mutate(id);
        }
    };
    var handleToggleSelect = function (id) {
        var newSelected = new Set(selectedReceipts);
        if (newSelected.has(id)) {
            newSelected["delete"](id);
        }
        else {
            newSelected.add(id);
        }
        setSelectedReceipts(newSelected);
    };
    var handleSelectAll = function () {
        if (selectedReceipts.size === filteredAndSortedReceipts.length) {
            setSelectedReceipts(new Set());
        }
        else {
            setSelectedReceipts(new Set(filteredAndSortedReceipts.map(function (rec) { return rec.id; })));
        }
    };
    var handleExportCSV = function () {
        setIsExporting(true);
        try {
            var dataToExport = selectedReceipts.size > 0
                ? filteredAndSortedReceipts.filter(function (rec) { return selectedReceipts.has(rec.id); })
                : filteredAndSortedReceipts;
            var headers = ["Receipt #", "Client", "Amount (Ksh)", "Date", "Payment Method", "Invoice", "Status"];
            var rows = dataToExport.map(function (rec) { return [
                rec.receiptNumber,
                rec.client,
                (rec.amount / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 }),
                rec.date,
                rec.paymentMethod,
                rec.invoice,
                rec.status,
            ]; });
            var csv = __spreadArrays([
                headers.join(",")
            ], rows.map(function (row) { return row.map(function (cell) { return "\"" + cell + "\""; }).join(","); })).join("\n");
            var blob = new Blob([csv], { type: "text/csv" });
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement("a");
            a.href = url;
            a.download = "receipts_" + new Date().toISOString().split("T")[0] + ".csv";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            sonner_1.toast.success("Receipts exported successfully");
        }
        catch (error) {
            sonner_1.toast.error("Failed to export receipts");
        }
        finally {
            setIsExporting(false);
        }
    };
    var handleBulkDelete = function () {
        if (selectedReceipts.size === 0) {
            sonner_1.toast.error("No receipts selected");
            return;
        }
        if (confirm("Delete " + selectedReceipts.size + " receipt(s)? This action cannot be undone.")) {
            selectedReceipts.forEach(function (id) {
                deleteReceiptMutation.mutate(id);
            });
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
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Receipts", description: "Manage payment receipts", icon: React.createElement(lucide_react_1.Receipt, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Accounting", href: "/accounting" },
            { label: "Receipts", href: "/receipts" },
        ], actions: React.createElement(button_1.Button, { onClick: function () { return navigate("/receipts/create"); } },
            React.createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
            "Create Receipt") },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "flex gap-4 flex-wrap" },
                React.createElement("div", { className: "flex-1 min-w-64 relative" },
                    React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }),
                    React.createElement(input_1.Input, { placeholder: "Search receipts by number, client, or invoice...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-9" })),
                React.createElement(select_1.Select, { value: methodFilter, onValueChange: setMethodFilter },
                    React.createElement(select_1.SelectTrigger, { className: "w-40" },
                        React.createElement(select_1.SelectValue, { placeholder: "Payment method" })),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "all" }, "All Methods"),
                        paymentMethods_1.getPaymentMethodOptions().map(function (method) { return (React.createElement(select_1.SelectItem, { key: method.value, value: method.value }, method.label)); }))),
                React.createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                    React.createElement(select_1.SelectTrigger, { className: "w-40" },
                        React.createElement(select_1.SelectValue, { placeholder: "Status" })),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "all" }, "All Status"),
                        React.createElement(select_1.SelectItem, { value: "issued" }, "Issued"),
                        React.createElement(select_1.SelectItem, { value: "void" }, "Void"))),
                React.createElement(button_1.Button, { variant: "outline", onClick: handleExportCSV, disabled: isExporting || filteredAndSortedReceipts.length === 0 },
                    isExporting ? (React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })) : (React.createElement(lucide_react_1.Download, { className: "mr-2 h-4 w-4" })),
                    "Export")),
            React.createElement("div", { className: "grid gap-4 md:grid-cols-3" }, stats.map(function (stat, index) {
                var Icon = iconMap[stat.iconName];
                var colorSchemes = ["blue", "emerald", "purple"];
                var colorScheme = colorSchemes[index % colorSchemes.length];
                return (React.createElement(card_1.Card, { key: stat.title, className: designSystem_1.getGradientCard(colorScheme) },
                    React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, stat.title),
                        React.createElement(Icon, { className: "h-4 w-4 text-muted-foreground" })),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" }, stat.value),
                        React.createElement("p", { className: "text-xs text-muted-foreground" }, stat.description))));
            })),
            selectedReceipts.size > 0 && (React.createElement(card_1.Card, { className: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800" },
                React.createElement(card_1.CardContent, { className: "pt-6" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("span", { className: "text-sm font-medium" },
                            selectedReceipts.size,
                            " receipt(s) selected"),
                        React.createElement("div", { className: "flex gap-2" },
                            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setSelectedReceipts(new Set()); } }, "Clear Selection"),
                            React.createElement(button_1.Button, { variant: "destructive", size: "sm", onClick: handleBulkDelete },
                                React.createElement(lucide_react_1.Trash2, { className: "mr-2 h-4 w-4" }),
                                "Delete Selected")))))),
            React.createElement(card_1.Card, { className: designSystem_1.getGradientCard("slate") },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: designSystem_1.animations.fadeIn }, "All Receipts"),
                    React.createElement(card_1.CardDescription, null,
                        "Manage and track all your receipts (",
                        filteredAndSortedReceipts.length,
                        " total)")),
                React.createElement(card_1.CardContent, null, isLoadingReceipts ? (React.createElement("div", { className: "text-center py-8" },
                    React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin mx-auto mb-2" }),
                    "Loading receipts...")) : filteredAndSortedReceipts.length === 0 ? (React.createElement("div", { className: "text-center py-8 text-muted-foreground" }, "No receipts found. Create your first receipt to get started.")) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, { className: "w-12" },
                                    React.createElement("input", { type: "checkbox", checked: selectedReceipts.size === filteredAndSortedReceipts.length && filteredAndSortedReceipts.length > 0, onChange: handleSelectAll, className: "rounded border-gray-300" })),
                                React.createElement(table_1.TableHead, { className: "cursor-pointer", onClick: function () { return toggleSort("receiptNumber"); } },
                                    React.createElement("div", { className: "flex items-center gap-2" },
                                        "Receipt #",
                                        sortField === "receiptNumber" && (React.createElement(lucide_react_1.ArrowUpDown, { className: "h-4 w-4" })))),
                                React.createElement(table_1.TableHead, { className: "cursor-pointer", onClick: function () { return toggleSort("client"); } },
                                    React.createElement("div", { className: "flex items-center gap-2" },
                                        "Client",
                                        sortField === "client" && (React.createElement(lucide_react_1.ArrowUpDown, { className: "h-4 w-4" })))),
                                React.createElement(table_1.TableHead, { className: "cursor-pointer", onClick: function () { return toggleSort("amount"); } },
                                    React.createElement("div", { className: "flex items-center gap-2" },
                                        "Amount",
                                        sortField === "amount" && (React.createElement(lucide_react_1.ArrowUpDown, { className: "h-4 w-4" })))),
                                React.createElement(table_1.TableHead, { className: "cursor-pointer", onClick: function () { return toggleSort("date"); } },
                                    React.createElement("div", { className: "flex items-center gap-2" },
                                        "Date",
                                        sortField === "date" && (React.createElement(lucide_react_1.ArrowUpDown, { className: "h-4 w-4" })))),
                                React.createElement(table_1.TableHead, { className: "cursor-pointer", onClick: function () { return toggleSort("paymentMethod"); } },
                                    React.createElement("div", { className: "flex items-center gap-2" },
                                        "Payment Method",
                                        sortField === "paymentMethod" && (React.createElement(lucide_react_1.ArrowUpDown, { className: "h-4 w-4" })))),
                                React.createElement(table_1.TableHead, null, "Invoice"),
                                React.createElement(table_1.TableHead, { className: "cursor-pointer", onClick: function () { return toggleSort("status"); } },
                                    React.createElement("div", { className: "flex items-center gap-2" },
                                        "Status",
                                        sortField === "status" && (React.createElement(lucide_react_1.ArrowUpDown, { className: "h-4 w-4" })))),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, filteredAndSortedReceipts.map(function (receipt) {
                            var MethodIcon = PAYMENT_METHOD_ICONS[receipt.paymentMethod] || lucide_react_1.Banknote;
                            return (React.createElement(table_1.TableRow, { key: receipt.id, className: selectedReceipts.has(receipt.id) ? "bg-blue-50" : "" },
                                React.createElement(table_1.TableCell, null,
                                    React.createElement("input", { type: "checkbox", checked: selectedReceipts.has(receipt.id), onChange: function () { return handleToggleSelect(receipt.id); }, className: "rounded border-gray-300" })),
                                React.createElement(table_1.TableCell, { className: "font-medium" }, receipt.receiptNumber),
                                React.createElement(table_1.TableCell, null, receipt.client),
                                React.createElement(table_1.TableCell, null,
                                    "Ksh ",
                                    ((receipt.amount || 0) / 100).toLocaleString()),
                                React.createElement(table_1.TableCell, null, receipt.date ? new Date(receipt.date).toLocaleDateString() : "-"),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(badge_1.Badge, { className: PAYMENT_METHOD_COLORS[receipt.paymentMethod] },
                                        React.createElement(MethodIcon, { className: "h-3 w-3 mr-1" }),
                                        receipt.paymentMethod)),
                                React.createElement(table_1.TableCell, null, receipt.invoice),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(badge_1.Badge, { variant: "outline" },
                                        receipt.status === "issued" ? (React.createElement(lucide_react_1.CheckCircle2, { className: "h-3 w-3 mr-1 text-green-500" })) : null,
                                        receipt.status)),
                                React.createElement(table_1.TableCell, { className: "text-right" },
                                    React.createElement("div", { className: "flex gap-2 justify-end" },
                                        React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleView(receipt.id); }, title: "View" },
                                            React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                        React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleEdit(receipt.id); }, title: "Edit" },
                                            React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" })),
                                        React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleDelete(receipt.id); }, title: "Delete" },
                                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))))));
                        }))))))))));
}
exports["default"] = Receipts;
