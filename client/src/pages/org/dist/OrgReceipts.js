"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var trpc_1 = require("@/lib/trpc");
var OrgLayout_1 = require("@/components/OrgLayout");
var OrgBreadcrumb_1 = require("@/components/OrgBreadcrumb");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var stats_card_1 = require("@/components/ui/stats-card");
var table_1 = require("@/components/ui/table");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var useOrgPermission_1 = require("@/hooks/useOrgPermission");
var date_fns_1 = require("date-fns");
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
function OrgReceipts() {
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var hasPermission = useOrgPermission_1.useOrgPermission().hasPermission;
    var canCreate = hasPermission("receipts");
    var canEdit = hasPermission("receipts");
    var canDelete = hasPermission("receipts");
    var _b = react_1.useState(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = react_1.useState("all"), methodFilter = _c[0], setMethodFilter = _c[1];
    var _d = react_1.useState("all"), statusFilter = _d[0], setStatusFilter = _d[1];
    // Fetch receipts data
    var _e = trpc_1.trpc.receipts.list.useQuery(undefined), _f = _e.data, receiptsData = _f === void 0 ? [] : _f, isLoadingReceipts = _e.isLoading;
    var _g = trpc_1.trpc.clients.list.useQuery(undefined).data, clientsData = _g === void 0 ? [] : _g;
    var utils = trpc_1.trpc.useUtils();
    var deleteReceiptMutation = trpc_1.trpc.receipts["delete"].useMutation({
        onSuccess: function () {
            utils.receipts.list.invalidate();
            sonner_1.toast.success("Receipt deleted successfully");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete receipt");
        }
    });
    // Transform data
    var plainReceiptsData = Array.isArray(receiptsData)
        ? receiptsData.map(function (rec) { return JSON.parse(JSON.stringify(rec)); })
        : [];
    var plainClientsData = Array.isArray(clientsData)
        ? clientsData.map(function (client) { return JSON.parse(JSON.stringify(client)); })
        : [];
    var receipts = react_1.useMemo(function () {
        return plainReceiptsData.map(function (rec) {
            var _a;
            return ({
                id: rec.id,
                receiptNumber: rec.receiptNumber || "REC-" + rec.id.slice(0, 8),
                client: ((_a = plainClientsData.find(function (c) { return c.id === rec.clientId; })) === null || _a === void 0 ? void 0 : _a.companyName) || "Unknown Client",
                amount: (rec.amount || 0) / 100,
                paymentMethod: rec.paymentMethod || "cash",
                date: rec.date ? date_fns_1.format(new Date(rec.date), "yyyy-MM-dd") : new Date().toISOString().split("T")[0],
                status: rec.status || "issued"
            });
        });
    }, [plainReceiptsData, plainClientsData]);
    var filtered = react_1.useMemo(function () {
        return receipts.filter(function (receipt) {
            var matchesSearch = receipt.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                receipt.client.toLowerCase().includes(searchQuery.toLowerCase());
            var matchesMethod = methodFilter === "all" || receipt.paymentMethod === methodFilter;
            var matchesStatus = statusFilter === "all" || receipt.status === statusFilter;
            return matchesSearch && matchesMethod && matchesStatus;
        });
    }, [receipts, searchQuery, methodFilter, statusFilter]);
    var stats = react_1.useMemo(function () {
        var total = receipts.reduce(function (sum, rec) { return sum + rec.amount; }, 0);
        var issued = receipts.filter(function (rec) { return rec.status === "issued"; }).length;
        return { total: total, issued: issued, count: receipts.length };
    }, [receipts]);
    var handleView = function (id) {
        navigate("/org/" + slug + "/receipts/" + id);
    };
    var handleEdit = function (id) {
        navigate("/org/" + slug + "/receipts/" + id + "/edit");
    };
    var handleDelete = function (id) {
        if (confirm("Are you sure you want to delete this receipt?")) {
            deleteReceiptMutation.mutate(id);
        }
    };
    var handleNewReceipt = function () {
        navigate("/org/" + slug + "/receipts/new");
    };
    return (React.createElement(OrgLayout_1["default"], null,
        React.createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [
                { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
                { label: "Receipts", href: "/org/" + slug + "/receipts" },
            ] }),
        React.createElement("div", { className: "p-6 space-y-6" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", null,
                    React.createElement("h1", { className: "text-3xl font-bold" }, "Receipts"),
                    React.createElement("p", { className: "text-muted-foreground mt-2" }, "Manage your payment receipts and records")),
                canCreate && (React.createElement(button_1.Button, { onClick: handleNewReceipt },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                    "New Receipt"))),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Received", value: "Ksh " + stats.total.toLocaleString(), icon: React.createElement(lucide_react_1.DollarSign, { className: "h-4 w-4 text-violet-500" }), color: "border-l-violet-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Issued Receipts", value: stats.issued, icon: React.createElement(lucide_react_1.CheckCircle2, { className: "h-4 w-4 text-emerald-500" }), color: "border-l-emerald-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Total Count", value: stats.count, icon: React.createElement(lucide_react_1.Receipt, { className: "h-4 w-4 text-blue-500" }), color: "border-l-blue-500" })),
            React.createElement("div", { className: "flex flex-wrap gap-3 items-center" },
                React.createElement("div", { className: "relative flex-1 min-w-[200px]" },
                    React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                    React.createElement(input_1.Input, { placeholder: "Search by receipt # or client...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-9" })),
                React.createElement(select_1.Select, { value: methodFilter, onValueChange: setMethodFilter },
                    React.createElement(select_1.SelectTrigger, { className: "w-[160px]" },
                        React.createElement(select_1.SelectValue, { placeholder: "Payment Method" })),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "all" }, "All Methods"),
                        React.createElement(select_1.SelectItem, { value: "cash" }, "Cash"),
                        React.createElement(select_1.SelectItem, { value: "bank-transfer" }, "Bank Transfer"),
                        React.createElement(select_1.SelectItem, { value: "mpesa" }, "M-Pesa"),
                        React.createElement(select_1.SelectItem, { value: "cheque" }, "Cheque"),
                        React.createElement(select_1.SelectItem, { value: "card" }, "Card"))),
                React.createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                    React.createElement(select_1.SelectTrigger, { className: "w-[140px]" },
                        React.createElement(select_1.SelectValue, { placeholder: "Status" })),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "all" }, "All Statuses"),
                        React.createElement(select_1.SelectItem, { value: "issued" }, "Issued"),
                        React.createElement(select_1.SelectItem, { value: "void" }, "Void")))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Receipts List"),
                    React.createElement(card_1.CardDescription, null,
                        filtered.length,
                        " receipts")),
                React.createElement(card_1.CardContent, null, isLoadingReceipts ? (React.createElement("div", { className: "flex justify-center py-8" },
                    React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }))) : filtered.length === 0 ? (React.createElement("div", { className: "flex flex-col items-center justify-center py-8 text-muted-foreground" },
                    React.createElement(lucide_react_1.AlertCircle, { className: "h-8 w-8 mb-2 opacity-50" }),
                    React.createElement("p", null, "No receipts found"))) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Receipt #"),
                                React.createElement(table_1.TableHead, null, "Client"),
                                React.createElement(table_1.TableHead, null, "Amount"),
                                React.createElement(table_1.TableHead, null, "Payment Method"),
                                React.createElement(table_1.TableHead, null, "Date"),
                                React.createElement(table_1.TableHead, null, "Status"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, filtered.map(function (receipt) {
                            var MethodIcon = PAYMENT_METHOD_ICONS[receipt.paymentMethod] || lucide_react_1.CreditCard;
                            return (React.createElement(table_1.TableRow, { key: receipt.id },
                                React.createElement(table_1.TableCell, { className: "font-mono text-sm" }, receipt.receiptNumber),
                                React.createElement(table_1.TableCell, null, receipt.client),
                                React.createElement(table_1.TableCell, { className: "font-semibold" },
                                    "Ksh ",
                                    receipt.amount.toLocaleString()),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(badge_1.Badge, { variant: "outline", className: PAYMENT_METHOD_COLORS[receipt.paymentMethod] || "" },
                                        React.createElement(MethodIcon, { className: "h-3 w-3 mr-1" }),
                                        receipt.paymentMethod)),
                                React.createElement(table_1.TableCell, null, receipt.date),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(badge_1.Badge, { variant: receipt.status === "issued" ? "default" : "secondary" }, receipt.status)),
                                React.createElement(table_1.TableCell, { className: "text-right space-x-2" },
                                    React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleView(receipt.id); }, title: "View" },
                                        React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                    canEdit && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleEdit(receipt.id); }, title: "Edit" },
                                        React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" }))),
                                    canDelete && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleDelete(receipt.id); }, title: "Delete" },
                                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))))));
                        }))))))))));
}
exports["default"] = OrgReceipts;
