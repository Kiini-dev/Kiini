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
function OrgWarranty() {
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var hasPermission = useOrgPermission_1.useOrgPermission().hasPermission;
    var canCreate = hasPermission("warranty");
    var canEdit = hasPermission("warranty");
    var canDelete = hasPermission("warranty");
    var _b = react_1.useState(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = react_1.useState("all"), statusFilter = _c[0], setStatusFilter = _c[1];
    // Fetch warranty data
    var _d = trpc_1.trpc.warranty.list.useQuery(undefined), _e = _d.data, warrantyData = _e === void 0 ? [] : _e, isLoadingWarranty = _d.isLoading;
    var utils = trpc_1.trpc.useUtils();
    var deleteWarrantyMutation = trpc_1.trpc.warranty["delete"].useMutation({
        onSuccess: function () {
            var _a, _b;
            (_b = (_a = utils.warranty.list).invalidate) === null || _b === void 0 ? void 0 : _b.call(_a);
            sonner_1.toast.success("Warranty deleted successfully");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete warranty");
        }
    });
    // Transform data
    var plainWarrantyData = Array.isArray(warrantyData)
        ? warrantyData.map(function (w) { return JSON.parse(JSON.stringify(w)); })
        : [];
    var warranties = react_1.useMemo(function () {
        return plainWarrantyData.map(function (w) { return ({
            id: w.id,
            warrantyNumber: w.warrantyNumber || "WRN-" + w.id.slice(0, 8),
            product: w.product || w.productName || "Unknown",
            status: w.status || "active",
            startDate: w.startDate ? date_fns_1.format(new Date(w.startDate), "yyyy-MM-dd") : "",
            endDate: w.endDate ? date_fns_1.format(new Date(w.endDate), "yyyy-MM-dd") : ""
        }); });
    }, [plainWarrantyData]);
    var filtered = react_1.useMemo(function () {
        return warranties.filter(function (warranty) {
            var matchesSearch = warranty.warrantyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                warranty.product.toLowerCase().includes(searchQuery.toLowerCase());
            var matchesStatus = statusFilter === "all" || warranty.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [warranties, searchQuery, statusFilter]);
    var stats = react_1.useMemo(function () {
        var active = warranties.filter(function (w) { return w.status === "active"; }).length;
        var expired = warranties.filter(function (w) { return w.status === "expired"; }).length;
        var voided = warranties.filter(function (w) { return w.status === "voided"; }).length;
        return { active: active, expired: expired, voided: voided, count: warranties.length };
    }, [warranties]);
    var handleView = function (id) {
        navigate("/org/" + slug + "/warranty/" + id);
    };
    var handleEdit = function (id) {
        navigate("/org/" + slug + "/warranty/" + id + "/edit");
    };
    var handleDelete = function (id) {
        if (confirm("Are you sure you want to delete this warranty?")) {
            deleteWarrantyMutation.mutate(id);
        }
    };
    var handleNewWarranty = function () {
        navigate("/org/" + slug + "/warranty/new");
    };
    return (React.createElement(OrgLayout_1["default"], null,
        React.createElement(OrgBreadcrumb_1["default"], { items: [
                { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
                { label: "Warranty", href: "/org/" + slug + "/warranty" },
            ] }),
        React.createElement("div", { className: "p-6 space-y-6" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", null,
                    React.createElement("h1", { className: "text-3xl font-bold" }, "Warranty Management"),
                    React.createElement("p", { className: "text-muted-foreground mt-2" }, "Track and manage product warranties")),
                canCreate && (React.createElement(button_1.Button, { onClick: handleNewWarranty },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                    "New Warranty"))),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Warranties", value: stats.count, icon: React.createElement(lucide_react_1.Shield, { className: "h-4 w-4 text-blue-500" }), color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Active", value: stats.active, icon: React.createElement(lucide_react_1.CheckCircle2, { className: "h-4 w-4 text-emerald-500" }), color: "border-l-emerald-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Expired", value: stats.expired, icon: React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-amber-500" }), color: "border-l-amber-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Voided", value: stats.voided, icon: React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-red-500" }), color: "border-l-red-500" })),
            React.createElement("div", { className: "flex flex-wrap gap-3 items-center" },
                React.createElement("div", { className: "relative flex-1 min-w-[200px]" },
                    React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                    React.createElement(input_1.Input, { placeholder: "Search by warranty # or product...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-9" })),
                React.createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                    React.createElement(select_1.SelectTrigger, { className: "w-[140px]" },
                        React.createElement(select_1.SelectValue, { placeholder: "Status" })),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "all" }, "All Statuses"),
                        React.createElement(select_1.SelectItem, { value: "active" }, "Active"),
                        React.createElement(select_1.SelectItem, { value: "expired" }, "Expired"),
                        React.createElement(select_1.SelectItem, { value: "voided" }, "Voided")))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Warranties List"),
                    React.createElement(card_1.CardDescription, null,
                        filtered.length,
                        " warranties")),
                React.createElement(card_1.CardContent, null, isLoadingWarranty ? (React.createElement("div", { className: "flex justify-center py-8" },
                    React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }))) : filtered.length === 0 ? (React.createElement("div", { className: "flex flex-col items-center justify-center py-8 text-muted-foreground" },
                    React.createElement(lucide_react_1.AlertCircle, { className: "h-8 w-8 mb-2 opacity-50" }),
                    React.createElement("p", null, "No warranties found"))) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Warranty #"),
                                React.createElement(table_1.TableHead, null, "Product"),
                                React.createElement(table_1.TableHead, null, "Start Date"),
                                React.createElement(table_1.TableHead, null, "End Date"),
                                React.createElement(table_1.TableHead, null, "Status"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, filtered.map(function (warranty) { return (React.createElement(table_1.TableRow, { key: warranty.id },
                            React.createElement(table_1.TableCell, { className: "font-mono text-sm" }, warranty.warrantyNumber),
                            React.createElement(table_1.TableCell, null, warranty.product),
                            React.createElement(table_1.TableCell, null, warranty.startDate),
                            React.createElement(table_1.TableCell, null, warranty.endDate),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { variant: warranty.status === "active"
                                        ? "default"
                                        : warranty.status === "expired"
                                            ? "secondary"
                                            : "destructive" }, warranty.status)),
                            React.createElement(table_1.TableCell, { className: "text-right space-x-2" },
                                React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleView(warranty.id); }, title: "View" },
                                    React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                canEdit && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleEdit(warranty.id); }, title: "Edit" },
                                    React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" }))),
                                canDelete && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleDelete(warranty.id); }, title: "Delete" },
                                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))))); }))))))))));
}
exports["default"] = OrgWarranty;
