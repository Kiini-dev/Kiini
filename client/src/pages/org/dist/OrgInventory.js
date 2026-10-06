"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var trpc_1 = require("@/lib/trpc");
var OrgLayout_1 = require("@/components/OrgLayout");
var OrgBreadcrumb_1 = require("@/components/OrgBreadcrumb");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var stats_card_1 = require("@/components/ui/stats-card");
var table_1 = require("@/components/ui/table");
var lucide_react_1 = require("lucide-react");
var useOrgPermission_1 = require("@/hooks/useOrgPermission");
function OrgInventory() {
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var hasPermission = useOrgPermission_1.useOrgPermission().hasPermission;
    var canCreate = hasPermission("inventory");
    var _b = react_1.useState(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = trpc_1.trpc.inventory.list.useQuery(undefined), _d = _c.data, inventory = _d === void 0 ? [] : _d, isLoadingInventory = _c.isLoading;
    var rows = react_1.useMemo(function () {
        return Array.isArray(inventory)
            ? inventory.map(function (item) { return ({
                id: item.id,
                sku: item.sku || item.productSKU || "N/A",
                name: item.productName || item.name || "Untitled",
                category: item.category || "Uncategorized",
                quantity: item.quantity || 0,
                reorderLevel: item.reorderLevel || 0,
                unitCost: item.unitCost || item.cost || 0,
                status: item.quantity === 0
                    ? "out_of_stock"
                    : item.quantity <= (item.reorderLevel || 0)
                        ? "low_stock"
                        : "in_stock"
            }); })
            : [];
    }, [inventory]);
    var filteredRows = react_1.useMemo(function () {
        return rows.filter(function (row) {
            var matchesSearch = row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                row.sku.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        });
    }, [rows, searchQuery]);
    var stats = react_1.useMemo(function () {
        var totalValue = rows.reduce(function (sum, row) { return sum + row.quantity * row.unitCost; }, 0);
        return {
            totalItems: rows.length,
            lowStock: rows.filter(function (row) { return row.status === "low_stock"; }).length,
            outOfStock: rows.filter(function (row) { return row.status === "out_of_stock"; }).length,
            totalValue: totalValue
        };
    }, [rows]);
    var handleView = function (id) { return navigate("/org/" + slug + "/inventory/" + id); };
    var handleNew = function () { return navigate("/org/" + slug + "/inventory/new"); };
    var statusBadge = function (status) {
        if (status === "out_of_stock")
            return "bg-red-100 text-red-800";
        if (status === "low_stock")
            return "bg-yellow-100 text-yellow-800";
        return "bg-emerald-100 text-emerald-800";
    };
    return (React.createElement(OrgLayout_1["default"], null,
        React.createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [
                { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
                { label: "Stock", href: "/org/" + slug + "/inventory" },
            ] }),
        React.createElement("div", { className: "p-6 space-y-6" },
            React.createElement("div", { className: "flex items-center justify-between gap-4 flex-wrap" },
                React.createElement("div", null,
                    React.createElement("h1", { className: "text-3xl font-bold" }, "Stock"),
                    React.createElement("p", { className: "text-muted-foreground mt-2" }, "Manage your inventory levels and reorder points.")),
                canCreate && (React.createElement(button_1.Button, { onClick: handleNew },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                    "Add Item"))),
            React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Items", value: stats.totalItems, color: "border-l-slate-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Low Stock", value: stats.lowStock, color: "border-l-orange-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Out of Stock", value: stats.outOfStock, color: "border-l-red-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Inventory Value", value: "KSh " + (stats.totalValue / 100).toLocaleString(), color: "border-l-blue-500" })),
            React.createElement("div", { className: "relative max-w-xl" },
                React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                React.createElement(input_1.Input, { placeholder: "Search stock by product or SKU...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-9" })),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Inventory"),
                    React.createElement("p", { className: "text-sm text-muted-foreground" },
                        filteredRows.length,
                        " stock items")),
                React.createElement(card_1.CardContent, null, isLoadingInventory ? (React.createElement("div", { className: "flex justify-center py-10" },
                    React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }))) : filteredRows.length === 0 ? (React.createElement("div", { className: "text-center py-10 text-muted-foreground" },
                    React.createElement(lucide_react_1.AlertCircle, { className: "h-8 w-8 mx-auto mb-2 opacity-50" }),
                    React.createElement("p", null, "No inventory items found."))) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "SKU"),
                                React.createElement(table_1.TableHead, null, "Product"),
                                React.createElement(table_1.TableHead, null, "Category"),
                                React.createElement(table_1.TableHead, null, "Qty"),
                                React.createElement(table_1.TableHead, null, "Reorder"),
                                React.createElement(table_1.TableHead, null, "Value"),
                                React.createElement(table_1.TableHead, null, "Status"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, filteredRows.map(function (item) { return (React.createElement(table_1.TableRow, { key: item.id },
                            React.createElement(table_1.TableCell, { className: "font-semibold" }, item.sku),
                            React.createElement(table_1.TableCell, null, item.name),
                            React.createElement(table_1.TableCell, null, item.category),
                            React.createElement(table_1.TableCell, null, item.quantity),
                            React.createElement(table_1.TableCell, null, item.reorderLevel),
                            React.createElement(table_1.TableCell, null,
                                "KSh ",
                                ((item.quantity * item.unitCost) / 100).toLocaleString()),
                            React.createElement(table_1.TableCell, null,
                                React.createElement("span", { className: "inline-flex rounded-full px-2 py-1 text-xs font-medium " + statusBadge(item.status) }, item.status.replace(/_/g, " "))),
                            React.createElement(table_1.TableCell, { className: "text-right" },
                                React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleView(item.id); }, title: "View" },
                                    React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" }))))); }))))))))));
}
exports["default"] = OrgInventory;
