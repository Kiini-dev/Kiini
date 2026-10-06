"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var spinner_1 = require("@/components/ui/spinner");
var permissions_1 = require("@/lib/permissions");
var trpc_1 = require("@/lib/trpc");
var data_table_controls_1 = require("@/components/ui/data-table-controls");
function WarrantyManagement() {
    var _a, _b;
    var _c = permissions_1.useRequireFeature("warranty:view"), allowed = _c.allowed, permissionLoading = _c.isLoading;
    var _d = wouter_1.useLocation(), navigate = _d[1];
    var _e = react_1.useState(""), searchQuery = _e[0], setSearchQuery = _e[1];
    var _f = react_1.useState("all"), statusFilter = _f[0], setStatusFilter = _f[1];
    var _g = react_1.useState("product"), sortField = _g[0], setSortField = _g[1];
    var _h = react_1.useState("asc"), sortOrder = _h[0], setSortOrder = _h[1];
    var _j = react_1.useState(new Set()), selectedWarranties = _j[0], setSelectedWarranties = _j[1];
    var _k = data_table_controls_1.usePagination(25), page = _k.page, pageSize = _k.pageSize, setPage = _k.setPage, setPageSize = _k.setPageSize, paginate = _k.paginate;
    var utils = trpc_1.trpc.useUtils();
    var _l = trpc_1.trpc.warranty.list.useQuery({}), rawData = _l.data, dataLoading = _l.isLoading;
    var deleteMutation = trpc_1.trpc.warranty["delete"].useMutation({
        onSuccess: function () { utils.warranty.list.invalidate(); sonner_1.toast.success("Warranty deleted"); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var bulkDeleteMutation = (_a = trpc_1.trpc.warranty.bulkDelete) === null || _a === void 0 ? void 0 : _a.useMutation({
        onSuccess: function (data) {
            utils.warranty.list.invalidate();
            sonner_1.toast.success(((data === null || data === void 0 ? void 0 : data.count) || 0) + " warranty(ies) deleted");
            setSelectedWarranties(new Set());
        },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    // Compute filtered warranties
    var warranties = JSON.parse(JSON.stringify((_b = rawData === null || rawData === void 0 ? void 0 : rawData.data) !== null && _b !== void 0 ? _b : []));
    var filteredWarranties = warranties.filter(function (w) {
        return (w.product || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (w.vendor || "").toLowerCase().includes(searchQuery.toLowerCase());
    });
    if (statusFilter !== "all") {
        filteredWarranties = filteredWarranties.filter(function (w) { return w.status === statusFilter; });
    }
    filteredWarranties.sort(function (a, b) {
        var aVal = a[sortField] || "";
        var bVal = b[sortField] || "";
        if (sortField === "expiryDate") {
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
    var statusColor = function (status) {
        return status === "active" ? "default" : status === "expiring_soon" ? "secondary" : "destructive";
    };
    if (permissionLoading) {
        return React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, null));
    }
    if (!allowed)
        return null;
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Warranty Management", description: "Track product warranties and coverage", icon: React.createElement(lucide_react_1.Shield, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Warranties" },
        ] },
        React.createElement("div", { className: "space-y-6 p-4 sm:p-6" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", null,
                    React.createElement("h2", { className: "text-2xl font-bold" }, "Warranties"),
                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "Manage product warranties and coverage")),
                React.createElement(button_1.Button, { onClick: function () { return navigate("/warranty/create"); } },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                    " Add Warranty")),
            React.createElement("div", { className: "flex items-center gap-2" },
                React.createElement(lucide_react_1.Search, { className: "h-4 w-4 text-muted-foreground" }),
                React.createElement(input_1.Input, { placeholder: "Search warranties...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "flex-1" })),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Warranty Registry"),
                    React.createElement(card_1.CardDescription, null,
                        filteredWarranties.length,
                        " warranties")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "overflow-x-auto" },
                        React.createElement(table_1.Table, null,
                            React.createElement(table_1.TableHeader, null,
                                React.createElement(table_1.TableRow, null,
                                    React.createElement(table_1.TableHead, null, "Product"),
                                    React.createElement(table_1.TableHead, null, "Vendor"),
                                    React.createElement(table_1.TableHead, null, "Coverage"),
                                    React.createElement(table_1.TableHead, null, "Expiry Date"),
                                    React.createElement(table_1.TableHead, null, "Status"),
                                    React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                            React.createElement(table_1.TableBody, null, dataLoading ? (React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableCell, { colSpan: 6, className: "text-center py-8" },
                                    React.createElement(spinner_1.Spinner, null)))) : filteredWarranties.length === 0 ? (React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableCell, { colSpan: 6, className: "text-center py-8 text-muted-foreground" }, "No warranties found"))) : filteredWarranties.map(function (warranty) { return (React.createElement(table_1.TableRow, { key: warranty.id },
                                React.createElement(table_1.TableCell, { className: "font-medium" }, warranty.product),
                                React.createElement(table_1.TableCell, null, warranty.vendor),
                                React.createElement(table_1.TableCell, null, warranty.coverage),
                                React.createElement(table_1.TableCell, null, warranty.expiryDate ? new Date(warranty.expiryDate).toLocaleDateString() : "-"),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(badge_1.Badge, { variant: statusColor(warranty.status || "active") }, warranty.status || "active")),
                                React.createElement(table_1.TableCell, { className: "text-right space-x-2" },
                                    React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return navigate("/warranty/" + warranty.id); } },
                                        React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                    React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return navigate("/warranty/" + warranty.id + "/edit"); } },
                                        React.createElement(lucide_react_1.Edit2, { className: "h-4 w-4" })),
                                    React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-red-500", onClick: function () { return deleteMutation.mutate(warranty.id); } },
                                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))))); })))))))));
}
exports["default"] = WarrantyManagement;
