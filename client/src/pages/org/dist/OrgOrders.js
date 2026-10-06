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
function OrgOrders() {
    var _a, _b;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _c = wouter_1.useLocation(), navigate = _c[1];
    var hasPermission = useOrgPermission_1.useOrgPermission().hasPermission;
    var canCreate = hasPermission("orders");
    var canEdit = hasPermission("orders");
    var canDelete = hasPermission("orders");
    var _d = react_1.useState(""), searchQuery = _d[0], setSearchQuery = _d[1];
    var _e = react_1.useState("all"), statusFilter = _e[0], setStatusFilter = _e[1];
    // Fetch orders data - using procurementMgmt.orderList if available, fallback to empty
    var _f = trpc_1.trpc.procurementMgmt.orderList.useQuery(undefined), _g = _f.data, ordersData = _g === void 0 ? [] : _g, isLoadingOrders = _f.isLoading;
    var _h = trpc_1.trpc.suppliers.list.useQuery({ limit: 100 }).data, suppliersData = _h === void 0 ? [] : _h;
    var utils = trpc_1.trpc.useUtils();
    var deleteOrderMutation = ((_b = (_a = trpc_1.trpc.procurementMgmt.deleteOrder).useMutation) === null || _b === void 0 ? void 0 : _b.call(_a, {
        onSuccess: function () {
            var _a, _b;
            (_b = (_a = utils.procurementMgmt.orderList).invalidate) === null || _b === void 0 ? void 0 : _b.call(_a);
            sonner_1.toast.success("Order deleted successfully");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete order");
        }
    })) || null;
    // Transform data
    var plainOrdersData = Array.isArray(ordersData)
        ? ordersData.map(function (o) { return JSON.parse(JSON.stringify(o)); })
        : [];
    var plainSuppliersData = Array.isArray(suppliersData)
        ? suppliersData.map(function (s) { return JSON.parse(JSON.stringify(s)); })
        : [];
    var supplierMap = react_1.useMemo(function () {
        var map = {};
        plainSuppliersData.forEach(function (s) {
            map[s.id] = s.companyName || "Unknown";
        });
        return map;
    }, [plainSuppliersData]);
    var orders = react_1.useMemo(function () {
        return plainOrdersData.map(function (o) { return ({
            id: o.id,
            orderNumber: o.orderNumber || "ORD-" + o.id.slice(0, 8),
            supplier: supplierMap[o.supplierId] || o.supplierId || "Unknown",
            amount: (o.totalAmount || 0) / 100,
            deliveryDate: o.deliveryDate ? date_fns_1.format(new Date(o.deliveryDate), "yyyy-MM-dd") : "",
            status: o.status || "draft",
            poDate: o.poDate ? date_fns_1.format(new Date(o.poDate), "yyyy-MM-dd") : new Date().toISOString().split("T")[0]
        }); });
    }, [plainOrdersData, supplierMap]);
    var filtered = react_1.useMemo(function () {
        return orders.filter(function (order) {
            var matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.supplier.toLowerCase().includes(searchQuery.toLowerCase());
            var matchesStatus = statusFilter === "all" || order.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [orders, searchQuery, statusFilter]);
    var stats = react_1.useMemo(function () {
        var draft = orders.filter(function (o) { return o.status === "draft"; }).length;
        var confirmed = orders.filter(function (o) { return o.status === "confirmed"; }).length;
        var delivered = orders.filter(function (o) { return o.status === "delivered"; }).length;
        var totalValue = orders.reduce(function (sum, o) { return sum + o.amount; }, 0);
        return { draft: draft, confirmed: confirmed, delivered: delivered, totalValue: totalValue, count: orders.length };
    }, [orders]);
    var handleView = function (id) {
        navigate("/org/" + slug + "/orders/" + id);
    };
    var handleEdit = function (id) {
        navigate("/org/" + slug + "/orders/" + id + "/edit");
    };
    var handleDelete = function (id) {
        if (confirm("Are you sure you want to delete this order?")) {
            deleteOrderMutation === null || deleteOrderMutation === void 0 ? void 0 : deleteOrderMutation.mutate(id);
        }
    };
    var handleNewOrder = function () {
        navigate("/org/" + slug + "/orders/new");
    };
    return (React.createElement(OrgLayout_1["default"], null,
        React.createElement(OrgBreadcrumb_1["default"], { items: [
                { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
                { label: "Orders", href: "/org/" + slug + "/orders" },
            ] }),
        React.createElement("div", { className: "p-6 space-y-6" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", null,
                    React.createElement("h1", { className: "text-3xl font-bold" }, "Orders"),
                    React.createElement("p", { className: "text-muted-foreground mt-2" }, "Manage your purchase orders and supplier deliveries")),
                canCreate && (React.createElement(button_1.Button, { onClick: handleNewOrder },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                    "New Order"))),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Orders", value: stats.count, icon: React.createElement(lucide_react_1.Package, { className: "h-4 w-4 text-blue-500" }), color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Draft", value: stats.draft, icon: React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-slate-500" }), color: "border-l-slate-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Confirmed", value: stats.confirmed, icon: React.createElement(lucide_react_1.Truck, { className: "h-4 w-4 text-amber-500" }), color: "border-l-amber-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Total Value", value: "Ksh " + stats.totalValue.toLocaleString(), icon: React.createElement(lucide_react_1.DollarSign, { className: "h-4 w-4 text-violet-500" }), color: "border-l-violet-500" })),
            React.createElement("div", { className: "flex flex-wrap gap-3 items-center" },
                React.createElement("div", { className: "relative flex-1 min-w-[200px]" },
                    React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                    React.createElement(input_1.Input, { placeholder: "Search by order # or supplier...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-9" })),
                React.createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                    React.createElement(select_1.SelectTrigger, { className: "w-[140px]" },
                        React.createElement(select_1.SelectValue, { placeholder: "Status" })),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "all" }, "All Statuses"),
                        React.createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                        React.createElement(select_1.SelectItem, { value: "confirmed" }, "Confirmed"),
                        React.createElement(select_1.SelectItem, { value: "delivered" }, "Delivered"),
                        React.createElement(select_1.SelectItem, { value: "cancelled" }, "Cancelled")))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Orders List"),
                    React.createElement(card_1.CardDescription, null,
                        filtered.length,
                        " orders")),
                React.createElement(card_1.CardContent, null, isLoadingOrders ? (React.createElement("div", { className: "flex justify-center py-8" },
                    React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }))) : filtered.length === 0 ? (React.createElement("div", { className: "flex flex-col items-center justify-center py-8 text-muted-foreground" },
                    React.createElement(lucide_react_1.AlertCircle, { className: "h-8 w-8 mb-2 opacity-50" }),
                    React.createElement("p", null, "No orders found"))) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Order #"),
                                React.createElement(table_1.TableHead, null, "Supplier"),
                                React.createElement(table_1.TableHead, null, "Amount"),
                                React.createElement(table_1.TableHead, null, "PO Date"),
                                React.createElement(table_1.TableHead, null, "Delivery Date"),
                                React.createElement(table_1.TableHead, null, "Status"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, filtered.map(function (order) { return (React.createElement(table_1.TableRow, { key: order.id },
                            React.createElement(table_1.TableCell, { className: "font-mono text-sm" }, order.orderNumber),
                            React.createElement(table_1.TableCell, null, order.supplier),
                            React.createElement(table_1.TableCell, { className: "font-semibold" },
                                "Ksh ",
                                order.amount.toLocaleString()),
                            React.createElement(table_1.TableCell, null, order.poDate),
                            React.createElement(table_1.TableCell, null, order.deliveryDate || "-"),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { variant: order.status === "delivered"
                                        ? "default"
                                        : order.status === "confirmed"
                                            ? "secondary"
                                            : "outline" }, order.status)),
                            React.createElement(table_1.TableCell, { className: "text-right space-x-2" },
                                React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleView(order.id); }, title: "View" },
                                    React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                canEdit && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleEdit(order.id); }, title: "Edit" },
                                    React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" }))),
                                canDelete && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleDelete(order.id); }, title: "Delete" },
                                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))))); }))))))))));
}
exports["default"] = OrgOrders;
