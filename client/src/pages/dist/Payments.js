"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var communications_1 = require("@/lib/communications");
var mutationHelpers_1 = require("@/lib/mutationHelpers");
var date_fns_1 = require("date-fns");
var paymentMethods_1 = require("@/const/paymentMethods");
var sonner_1 = require("sonner");
var export_utils_1 = require("@/lib/export-utils");
var ListPageToolbar_1 = require("@/components/list-page/ListPageToolbar");
var RowActionsMenu_1 = require("@/components/list-page/RowActionsMenu");
var TableColumnSettings_1 = require("@/components/list-page/TableColumnSettings");
var EnhancedBulkActions_1 = require("@/components/list-page/EnhancedBulkActions");
var checkbox_1 = require("@/components/ui/checkbox");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var stats_card_1 = require("@/components/ui/stats-card");
function Payments() {
    var _this = this;
    // CALL ALL HOOKS UNCONDITIONALLY AT TOP LEVEL
    var _a = permissions_1.useRequireFeature("accounting:payments:view"), allowed = _a.allowed, isLoading = _a.isLoading;
    var _b = wouter_1.useLocation(), location = _b[0], navigate = _b[1];
    var _c = react_1.useState(""), searchQuery = _c[0], setSearchQuery = _c[1];
    var _d = react_1.useState("all"), methodFilter = _d[0], setMethodFilter = _d[1];
    var _e = react_1.useState(false), deleteDialogOpen = _e[0], setDeleteDialogOpen = _e[1];
    var _f = react_1.useState(null), selectedPaymentId = _f[0], setSelectedPaymentId = _f[1];
    var _g = react_1.useState(new Set()), selectedPayments = _g[0], setSelectedPayments = _g[1];
    var paymentColumns = [
        { key: "receiptNumber", label: "Receipt #" },
        { key: "client", label: "Client" },
        { key: "amount", label: "Amount" },
        { key: "method", label: "Method" },
        { key: "status", label: "Status" },
        { key: "date", label: "Date" },
        { key: "reference", label: "Reference" },
        { key: "invoice", label: "Invoice" },
    ];
    var _h = TableColumnSettings_1.useColumnVisibility(paymentColumns, "payments"), visibleColumns = _h.visibleColumns, toggleColumn = _h.toggleColumn, isVisible = _h.isVisible, pageSize = _h.pageSize, updatePageSize = _h.updatePageSize, reset = _h.reset;
    // Fetch real data from backend
    var _j = trpc_1.trpc.payments.list.useQuery({}), _k = _j.data, paymentsData = _k === void 0 ? [] : _k, isLoadingPayments = _j.isLoading;
    var _l = trpc_1.trpc.clients.list.useQuery({}).data, clientsData = _l === void 0 ? [] : _l;
    var utils = trpc_1.trpc.useUtils();
    // Delete mutation
    var deletePaymentMutation = trpc_1.trpc.payments["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Payment deleted successfully");
            utils.payments.list.invalidate();
            setDeleteDialogOpen(false);
            setSelectedPaymentId(null);
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete payment");
        }
    });
    // Approve mutation
    var approvePaymentMutation = trpc_1.trpc.approvals.approvePayment.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Payment approved successfully");
            utils.payments.list.invalidate();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to approve payment");
        }
    });
    // NOW SAFE TO CHECK CONDITIONAL RETURNS (ALL HOOKS ALREADY CALLED)
    if (isLoading)
        return React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" }));
    if (!allowed)
        return null;
    // Transform backend data to display format
    var payments = paymentsData.map(function (payment) {
        var _a;
        return ({
            id: payment.id,
            receiptNumber: payment.receiptNumber || "REC-" + payment.id.slice(0, 8),
            client: ((_a = clientsData.find(function (c) { return c.id === payment.clientId; })) === null || _a === void 0 ? void 0 : _a.companyName) || "Unknown Client",
            amount: (payment.amount || 0) / 100,
            method: payment.paymentMethod || "cash",
            status: payment.status || "pending",
            date: payment.date ? date_fns_1.format(new Date(payment.date), "yyyy-MM-dd") : new Date().toISOString().split("T")[0],
            invoice: payment.invoiceId ? "INV" : "N/A",
            reference: payment.reference || ""
        });
    });
    var filteredPayments = payments.filter(function (payment) {
        var matchesSearch = payment.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase());
        var matchesMethod = methodFilter === "all" || payment.method === methodFilter;
        return matchesSearch && matchesMethod;
    });
    var totalAmount = payments.reduce(function (sum, p) { return sum + p.amount; }, 0);
    var completedAmount = payments
        .filter(function (p) { return p.status === "completed"; })
        .reduce(function (sum, p) { return sum + p.amount; }, 0);
    var pendingAmount = payments
        .filter(function (p) { return p.status === "pending"; })
        .reduce(function (sum, p) { return sum + p.amount; }, 0);
    var toggleSelectPayment = function (id) {
        setSelectedPayments(function (prev) {
            var next = new Set(prev);
            if (next.has(id))
                next["delete"](id);
            else
                next.add(id);
            return next;
        });
    };
    var toggleSelectAll = function () {
        if (selectedPayments.size === filteredPayments.length) {
            setSelectedPayments(new Set());
        }
        else {
            setSelectedPayments(new Set(filteredPayments.map(function (p) { return p.id; })));
        }
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Payments", href: "/payments" },
        ], title: "Payments", description: "Track and manage all payment transactions", icon: React.createElement(lucide_react_1.DollarSign, { className: "w-6 h-6" }) },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Payments", value: React.createElement(React.Fragment, null,
                        "Ksh ",
                        totalAmount.toLocaleString()), description: React.createElement(React.Fragment, null,
                        payments.length,
                        " transactions"), color: "border-l-purple-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Completed", value: React.createElement(React.Fragment, null,
                        "Ksh ",
                        completedAmount.toLocaleString()), description: React.createElement(React.Fragment, null,
                        payments.filter(function (p) { return p.status === "completed"; }).length,
                        " completed"), color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Pending", value: React.createElement(React.Fragment, null,
                        "Ksh ",
                        pendingAmount.toLocaleString()), description: React.createElement(React.Fragment, null,
                        payments.filter(function (p) { return p.status === "pending"; }).length,
                        " pending"), color: "border-l-blue-500" })),
            React.createElement(ListPageToolbar_1.ListPageToolbar, { searchValue: searchQuery, onSearchChange: setSearchQuery, searchPlaceholder: "Search by client or receipt...", onCreateClick: function () { return navigate("/payments/create"); }, createLabel: "Record Payment", onExportClick: function () { return export_utils_1.downloadCSV(payments.map(function (p) { return ({ "Receipt #": p.receiptNumber, Client: p.client, Amount: p.amount, Method: p.method, Status: p.status, Date: p.date, Reference: p.reference }); }), "payments"); }, onImportClick: function () { return sonner_1.toast.info("CSV import is available in Settings > Data Management"); }, onPrintClick: function () { return window.print(); }, filterContent: React.createElement(React.Fragment, null,
                    React.createElement(select_1.Select, { value: methodFilter, onValueChange: setMethodFilter },
                        React.createElement(select_1.SelectTrigger, { className: "w-40" },
                            React.createElement(select_1.SelectValue, { placeholder: "Payment Method" })),
                        React.createElement(select_1.SelectContent, null,
                            React.createElement(select_1.SelectItem, { value: "all" }, "All Methods"),
                            paymentMethods_1.getPaymentMethodOptions().map(function (method) { return (React.createElement(select_1.SelectItem, { key: method.value, value: method.value }, method.label)); }))),
                    React.createElement(button_1.Button, { onClick: function () { return navigate("/payments/reconciliation"); }, variant: "outline", size: "sm", className: "gap-1" },
                        React.createElement(lucide_react_1.BarChart3, { className: "h-3.5 w-3.5" }),
                        " Reconciliation")) }),
            React.createElement(EnhancedBulkActions_1.EnhancedBulkActions, { selectedCount: selectedPayments.size, onClear: function () { return setSelectedPayments(new Set()); }, actions: [
                    EnhancedBulkActions_1.bulkApproveAction(selectedPayments, function (ids) { return ids.forEach(function (id) { return approvePaymentMutation.mutate({ id: id }); }); }),
                    EnhancedBulkActions_1.bulkExportAction(selectedPayments, payments, paymentColumns, "payments"),
                    EnhancedBulkActions_1.bulkCopyIdsAction(selectedPayments),
                    EnhancedBulkActions_1.bulkEmailAction(navigate),
                    EnhancedBulkActions_1.bulkDeleteAction(selectedPayments, function (ids) { return ids.forEach(function (id) { return deletePaymentMutation.mutate(id); }); }),
                ] }),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "p-0" },
                    React.createElement("div", { className: "flex items-center justify-between px-4 py-3 border-b" },
                        React.createElement("span", { className: "text-sm text-muted-foreground" },
                            filteredPayments.length,
                            " of ",
                            payments.length,
                            " payments"),
                        React.createElement(TableColumnSettings_1.TableColumnSettings, { columns: paymentColumns, visibleColumns: visibleColumns, onToggleColumn: toggleColumn, onReset: reset, pageSize: pageSize, onPageSizeChange: updatePageSize })),
                    React.createElement("div", { className: "overflow-x-auto" },
                        React.createElement(table_1.Table, null,
                            React.createElement(table_1.TableHeader, null,
                                React.createElement(table_1.TableRow, null,
                                    React.createElement(table_1.TableHead, { className: "w-10" },
                                        React.createElement(checkbox_1.Checkbox, { checked: selectedPayments.size === filteredPayments.length && filteredPayments.length > 0, onCheckedChange: toggleSelectAll })),
                                    isVisible("receiptNumber") && React.createElement(table_1.TableHead, null, "Receipt #"),
                                    isVisible("client") && React.createElement(table_1.TableHead, null, "Client"),
                                    isVisible("amount") && React.createElement(table_1.TableHead, null, "Amount"),
                                    isVisible("method") && React.createElement(table_1.TableHead, null, "Method"),
                                    isVisible("status") && React.createElement(table_1.TableHead, null, "Status"),
                                    isVisible("date") && React.createElement(table_1.TableHead, null, "Date"),
                                    React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                            React.createElement(table_1.TableBody, null, isLoading ? (React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableCell, { colSpan: 7, className: "text-center py-8" }, "Loading payments..."))) : filteredPayments.length === 0 ? (React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableCell, { colSpan: 7, className: "text-center py-8" }, "No payments found"))) : (filteredPayments.map(function (payment) { return (React.createElement(table_1.TableRow, { key: payment.id, className: selectedPayments.has(payment.id) ? "bg-primary/5" : "" },
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(checkbox_1.Checkbox, { checked: selectedPayments.has(payment.id), onCheckedChange: function () { return toggleSelectPayment(payment.id); } })),
                                isVisible("receiptNumber") && React.createElement(table_1.TableCell, { className: "font-medium" }, (payment === null || payment === void 0 ? void 0 : payment.receiptNumber) || "N/A"),
                                isVisible("client") && React.createElement(table_1.TableCell, null, (payment === null || payment === void 0 ? void 0 : payment.client) || "N/A"),
                                isVisible("amount") && React.createElement(table_1.TableCell, null,
                                    "Ksh ",
                                    ((payment === null || payment === void 0 ? void 0 : payment.amount) || 0).toLocaleString()),
                                isVisible("method") && (React.createElement(table_1.TableCell, null,
                                    React.createElement(badge_1.Badge, { variant: "outline" }, ((payment === null || payment === void 0 ? void 0 : payment.method) || "N/A").replace("_", " ").toUpperCase()))),
                                isVisible("status") && (React.createElement(table_1.TableCell, null,
                                    React.createElement(badge_1.Badge, { variant: (payment === null || payment === void 0 ? void 0 : payment.status) === "completed"
                                            ? "default"
                                            : (payment === null || payment === void 0 ? void 0 : payment.status) === "pending"
                                                ? "secondary"
                                                : "destructive", className: "gap-1" },
                                        (payment === null || payment === void 0 ? void 0 : payment.status) === "completed" && React.createElement(lucide_react_1.CheckCircle2, { className: "h-3 w-3" }),
                                        (payment === null || payment === void 0 ? void 0 : payment.status) === "pending" && React.createElement(lucide_react_1.Clock, { className: "h-3 w-3" }),
                                        ((payment === null || payment === void 0 ? void 0 : payment.status) || "pending").charAt(0).toUpperCase() +
                                            ((payment === null || payment === void 0 ? void 0 : payment.status) || "pending").slice(1)))),
                                isVisible("date") && React.createElement(table_1.TableCell, null, (payment === null || payment === void 0 ? void 0 : payment.date) ? new Date(payment.date).toLocaleDateString() : "N/A"),
                                React.createElement(table_1.TableCell, { className: "text-right" },
                                    React.createElement(RowActionsMenu_1.RowActionsMenu, { primaryActions: [
                                            { label: "View", icon: RowActionsMenu_1.actionIcons.view, onClick: function () { return navigate("/payments/" + payment.id); } },
                                            { label: "Edit", icon: React.createElement(lucide_react_1.Pencil, { className: "h-4 w-4" }), onClick: function () { return navigate("/payments/" + payment.id + "/edit"); } },
                                            { label: "Delete", icon: RowActionsMenu_1.actionIcons["delete"], onClick: function () { setSelectedPaymentId(payment.id); setDeleteDialogOpen(true); }, variant: "destructive" },
                                        ], menuActions: __spreadArrays((payment.status === "pending" ? [{ label: "Approve Payment", icon: React.createElement(lucide_react_1.Check, { className: "h-4 w-4" }), onClick: function () { return approvePaymentMutation.mutate({ id: payment.id }); } }] : []), [
                                            { label: "Download Receipt", icon: RowActionsMenu_1.actionIcons.download, onClick: function () { navigate("/payments/" + payment.id); setTimeout(function () { return window.print(); }, 500); } },
                                            { label: "Email Receipt", icon: RowActionsMenu_1.actionIcons.email, onClick: function () { return navigate(communications_1.buildCommunicationComposePath(location, payment.clientEmail || "", "Payment Receipt " + (payment.receiptNumber || payment.id))); } },
                                            { label: "Duplicate Payment", icon: RowActionsMenu_1.actionIcons.copy, onClick: function () { return navigate("/payments/create"); }, separator: true },
                                            { label: "Link to Invoice", icon: React.createElement(lucide_react_1.Link, { className: "h-4 w-4" }), onClick: function () { return navigate("/payments/" + payment.id + "/edit"); } },
                                        ]) })))); }))))))),
            React.createElement(alert_dialog_1.AlertDialog, { open: deleteDialogOpen, onOpenChange: setDeleteDialogOpen },
                React.createElement(alert_dialog_1.AlertDialogContent, null,
                    React.createElement(alert_dialog_1.AlertDialogTitle, null, "Delete Payment"),
                    React.createElement(alert_dialog_1.AlertDialogDescription, null, "Are you sure you want to delete this payment? This action cannot be undone."),
                    React.createElement("div", { className: "flex gap-2 justify-end" },
                        React.createElement(alert_dialog_1.AlertDialogCancel, null, "Cancel"),
                        React.createElement(alert_dialog_1.AlertDialogAction, { onClick: function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!selectedPaymentId) return [3 /*break*/, 2];
                                            return [4 /*yield*/, mutationHelpers_1["default"](deletePaymentMutation, selectedPaymentId)];
                                        case 1:
                                            _a.sent();
                                            _a.label = 2;
                                        case 2: return [2 /*return*/];
                                    }
                                });
                            }); }, className: "bg-red-600 hover:bg-red-700" }, "Delete")))))));
}
exports["default"] = Payments;
