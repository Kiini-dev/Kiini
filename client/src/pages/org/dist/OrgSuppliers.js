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
function OrgSuppliers() {
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var hasPermission = useOrgPermission_1.useOrgPermission().hasPermission;
    var canCreate = hasPermission("suppliers");
    var canEdit = hasPermission("suppliers");
    var canDelete = hasPermission("suppliers");
    var _b = react_1.useState(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = react_1.useState("all"), statusFilter = _c[0], setStatusFilter = _c[1];
    // Fetch suppliers data
    var _d = trpc_1.trpc.suppliers.list.useQuery({
        limit: 100,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchQuery || undefined
    }), _e = _d.data, suppliersData = _e === void 0 ? [] : _e, isLoadingSuppliers = _d.isLoading;
    var utils = trpc_1.trpc.useUtils();
    var deleteSupplierMutation = trpc_1.trpc.suppliers["delete"].useMutation({
        onSuccess: function () {
            utils.suppliers.list.invalidate();
            sonner_1.toast.success("Supplier deleted successfully");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete supplier");
        }
    });
    // Transform data
    var plainSuppliersData = Array.isArray(suppliersData)
        ? suppliersData.map(function (s) { return JSON.parse(JSON.stringify(s)); })
        : [];
    var suppliers = react_1.useMemo(function () {
        return plainSuppliersData.map(function (s) { return ({
            id: s.id,
            companyName: s.companyName || "Unknown",
            contactPerson: s.contactPerson || "",
            email: s.email || "",
            phone: s.phone || "",
            city: s.city || "",
            status: s.status || "active"
        }); });
    }, [plainSuppliersData]);
    var filtered = react_1.useMemo(function () {
        return suppliers.filter(function (supplier) {
            var matchesSearch = supplier.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                supplier.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
                supplier.email.toLowerCase().includes(searchQuery.toLowerCase());
            var matchesStatus = statusFilter === "all" || supplier.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [suppliers, searchQuery, statusFilter]);
    var stats = react_1.useMemo(function () {
        var active = suppliers.filter(function (s) { return s.status === "active"; }).length;
        var inactive = suppliers.filter(function (s) { return s.status === "inactive"; }).length;
        return { active: active, inactive: inactive, count: suppliers.length };
    }, [suppliers]);
    var handleView = function (id) {
        navigate("/org/" + slug + "/suppliers/" + id);
    };
    var handleEdit = function (id) {
        navigate("/org/" + slug + "/suppliers/" + id + "/edit");
    };
    var handleDelete = function (id) {
        if (confirm("Are you sure you want to delete this supplier?")) {
            deleteSupplierMutation.mutate(id);
        }
    };
    var handleNewSupplier = function () {
        navigate("/org/" + slug + "/suppliers/new");
    };
    return (React.createElement(OrgLayout_1["default"], null,
        React.createElement(OrgBreadcrumb_1["default"], { items: [
                { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
                { label: "Suppliers", href: "/org/" + slug + "/suppliers" },
            ] }),
        React.createElement("div", { className: "p-6 space-y-6" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", null,
                    React.createElement("h1", { className: "text-3xl font-bold" }, "Suppliers"),
                    React.createElement("p", { className: "text-muted-foreground mt-2" }, "Manage your supplier relationships and contact information")),
                canCreate && (React.createElement(button_1.Button, { onClick: handleNewSupplier },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                    "New Supplier"))),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Suppliers", value: stats.count, icon: React.createElement(lucide_react_1.Truck, { className: "h-4 w-4 text-blue-500" }), color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Active", value: stats.active, icon: React.createElement(lucide_react_1.Star, { className: "h-4 w-4 text-emerald-500" }), color: "border-l-emerald-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Inactive", value: stats.inactive, icon: React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-amber-500" }), color: "border-l-amber-500" })),
            React.createElement("div", { className: "flex flex-wrap gap-3 items-center" },
                React.createElement("div", { className: "relative flex-1 min-w-[200px]" },
                    React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                    React.createElement(input_1.Input, { placeholder: "Search by company name, contact...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-9" })),
                React.createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                    React.createElement(select_1.SelectTrigger, { className: "w-[140px]" },
                        React.createElement(select_1.SelectValue, { placeholder: "Status" })),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "all" }, "All Statuses"),
                        React.createElement(select_1.SelectItem, { value: "active" }, "Active"),
                        React.createElement(select_1.SelectItem, { value: "inactive" }, "Inactive")))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Suppliers List"),
                    React.createElement(card_1.CardDescription, null,
                        filtered.length,
                        " suppliers")),
                React.createElement(card_1.CardContent, null, isLoadingSuppliers ? (React.createElement("div", { className: "flex justify-center py-8" },
                    React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }))) : filtered.length === 0 ? (React.createElement("div", { className: "flex flex-col items-center justify-center py-8 text-muted-foreground" },
                    React.createElement(lucide_react_1.AlertCircle, { className: "h-8 w-8 mb-2 opacity-50" }),
                    React.createElement("p", null, "No suppliers found"))) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Company Name"),
                                React.createElement(table_1.TableHead, null, "Contact Person"),
                                React.createElement(table_1.TableHead, null, "Email"),
                                React.createElement(table_1.TableHead, null, "Phone"),
                                React.createElement(table_1.TableHead, null, "City"),
                                React.createElement(table_1.TableHead, null, "Status"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, filtered.map(function (supplier) { return (React.createElement(table_1.TableRow, { key: supplier.id },
                            React.createElement(table_1.TableCell, { className: "font-semibold" }, supplier.companyName),
                            React.createElement(table_1.TableCell, null, supplier.contactPerson),
                            React.createElement(table_1.TableCell, null,
                                React.createElement("a", { href: "mailto:" + supplier.email, className: "text-blue-600 hover:underline flex items-center gap-1" },
                                    React.createElement(lucide_react_1.Mail, { className: "h-3 w-3" }),
                                    supplier.email)),
                            React.createElement(table_1.TableCell, null,
                                React.createElement("a", { href: "tel:" + supplier.phone, className: "text-blue-600 hover:underline flex items-center gap-1" },
                                    React.createElement(lucide_react_1.Phone, { className: "h-3 w-3" }),
                                    supplier.phone)),
                            React.createElement(table_1.TableCell, null, supplier.city),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { variant: supplier.status === "active" ? "default" : "secondary" }, supplier.status)),
                            React.createElement(table_1.TableCell, { className: "text-right space-x-2" },
                                React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleView(supplier.id); }, title: "View" },
                                    React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                canEdit && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleEdit(supplier.id); }, title: "Edit" },
                                    React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" }))),
                                canDelete && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleDelete(supplier.id); }, title: "Delete" },
                                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))))); }))))))))));
}
exports["default"] = OrgSuppliers;
