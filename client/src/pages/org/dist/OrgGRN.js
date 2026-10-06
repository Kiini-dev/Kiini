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
function OrgGRN() {
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var hasPermission = useOrgPermission_1.useOrgPermission().hasPermission;
    var canCreate = hasPermission("grn");
    var canEdit = hasPermission("grn");
    var canDelete = hasPermission("grn");
    var _b = react_1.useState(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = react_1.useState("all"), statusFilter = _c[0], setStatusFilter = _c[1];
    // Fetch GRN data
    var _d = trpc_1.trpc.grn.list.useQuery({ limit: 100, offset: 0 }), _e = _d.data, grnData = _e === void 0 ? [] : _e, isLoadingGRN = _d.isLoading;
    var _f = trpc_1.trpc.suppliers.list.useQuery({ limit: 100 }).data, suppliersData = _f === void 0 ? [] : _f;
    var utils = trpc_1.trpc.useUtils();
    var deleteGRNMutation = trpc_1.trpc.grn["delete"].useMutation({
        onSuccess: function () {
            var _a, _b;
            (_b = (_a = utils.grn.list).invalidate) === null || _b === void 0 ? void 0 : _b.call(_a);
            sonner_1.toast.success("GRN deleted successfully");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete GRN");
        }
    });
    // Transform data
    var plainGRNData = Array.isArray(grnData)
        ? grnData.map(function (g) { return JSON.parse(JSON.stringify(g)); })
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
    var grns = react_1.useMemo(function () {
        return plainGRNData.map(function (g) { return ({
            id: g.id,
            grnNumber: g.grnNumber || "GRN-" + g.id.slice(0, 8),
            supplier: supplierMap[g.supplierId] || "Unknown",
            quantity: g.quantity || 0,
            date: g.date ? date_fns_1.format(new Date(g.date), "yyyy-MM-dd") : new Date().toISOString().split("T")[0],
            status: g.status || "pending"
        }); });
    }, [plainGRNData, supplierMap]);
    var filtered = react_1.useMemo(function () {
        return grns.filter(function (grn) {
            var matchesSearch = grn.grnNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                grn.supplier.toLowerCase().includes(searchQuery.toLowerCase());
            var matchesStatus = statusFilter === "all" || grn.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [grns, searchQuery, statusFilter]);
    var stats = react_1.useMemo(function () {
        var pending = grns.filter(function (g) { return g.status === "pending"; }).length;
        var received = grns.filter(function (g) { return g.status === "received"; }).length;
        var rejected = grns.filter(function (g) { return g.status === "rejected"; }).length;
        return { pending: pending, received: received, rejected: rejected, count: grns.length };
    }, [grns]);
    var handleView = function (id) {
        navigate("/org/" + slug + "/grn/" + id);
    };
    var handleEdit = function (id) {
        navigate("/org/" + slug + "/grn/" + id + "/edit");
    };
    var handleDelete = function (id) {
        if (confirm("Are you sure you want to delete this GRN?")) {
            deleteGRNMutation.mutate(id);
        }
    };
    var handleNewGRN = function () {
        navigate("/org/" + slug + "/grn/new");
    };
    return (React.createElement(OrgLayout_1["default"], null,
        React.createElement(OrgBreadcrumb_1["default"], { items: [
                { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
                { label: "GRNs", href: "/org/" + slug + "/grn" },
            ] }),
        React.createElement("div", { className: "p-6 space-y-6" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", null,
                    React.createElement("h1", { className: "text-3xl font-bold" }, "Goods Received Notes"),
                    React.createElement("p", { className: "text-muted-foreground mt-2" }, "Track and manage goods received from suppliers")),
                canCreate && (React.createElement(button_1.Button, { onClick: handleNewGRN },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                    "New GRN"))),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total GRNs", value: stats.count, icon: React.createElement(lucide_react_1.Package, { className: "h-4 w-4 text-blue-500" }), color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Pending", value: stats.pending, icon: React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-amber-500" }), color: "border-l-amber-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Received", value: stats.received, icon: React.createElement(lucide_react_1.CheckCircle2, { className: "h-4 w-4 text-emerald-500" }), color: "border-l-emerald-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Rejected", value: stats.rejected, icon: React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-red-500" }), color: "border-l-red-500" })),
            React.createElement("div", { className: "flex flex-wrap gap-3 items-center" },
                React.createElement("div", { className: "relative flex-1 min-w-[200px]" },
                    React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                    React.createElement(input_1.Input, { placeholder: "Search by GRN # or supplier...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-9" })),
                React.createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                    React.createElement(select_1.SelectTrigger, { className: "w-[140px]" },
                        React.createElement(select_1.SelectValue, { placeholder: "Status" })),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "all" }, "All Statuses"),
                        React.createElement(select_1.SelectItem, { value: "pending" }, "Pending"),
                        React.createElement(select_1.SelectItem, { value: "received" }, "Received"),
                        React.createElement(select_1.SelectItem, { value: "rejected" }, "Rejected")))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "GRNs List"),
                    React.createElement(card_1.CardDescription, null,
                        filtered.length,
                        " GRNs")),
                React.createElement(card_1.CardContent, null, isLoadingGRN ? (React.createElement("div", { className: "flex justify-center py-8" },
                    React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }))) : filtered.length === 0 ? (React.createElement("div", { className: "flex flex-col items-center justify-center py-8 text-muted-foreground" },
                    React.createElement(lucide_react_1.AlertCircle, { className: "h-8 w-8 mb-2 opacity-50" }),
                    React.createElement("p", null, "No GRNs found"))) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "GRN #"),
                                React.createElement(table_1.TableHead, null, "Supplier"),
                                React.createElement(table_1.TableHead, null, "Quantity"),
                                React.createElement(table_1.TableHead, null, "Date"),
                                React.createElement(table_1.TableHead, null, "Status"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, filtered.map(function (grn) { return (React.createElement(table_1.TableRow, { key: grn.id },
                            React.createElement(table_1.TableCell, { className: "font-mono text-sm" }, grn.grnNumber),
                            React.createElement(table_1.TableCell, null, grn.supplier),
                            React.createElement(table_1.TableCell, null,
                                grn.quantity,
                                " units"),
                            React.createElement(table_1.TableCell, null, grn.date),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { variant: grn.status === "received"
                                        ? "default"
                                        : grn.status === "rejected"
                                            ? "destructive"
                                            : "outline" }, grn.status)),
                            React.createElement(table_1.TableCell, { className: "text-right space-x-2" },
                                React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleView(grn.id); }, title: "View" },
                                    React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                canEdit && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleEdit(grn.id); }, title: "Edit" },
                                    React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" }))),
                                canDelete && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleDelete(grn.id); }, title: "Delete" },
                                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))))); }))))))))));
}
exports["default"] = OrgGRN;
