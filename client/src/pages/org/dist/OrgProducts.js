"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var trpc_1 = require("@/lib/trpc");
var OrgModuleLayout_1 = require("@/components/OrgModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var table_1 = require("@/components/ui/table");
var lucide_react_1 = require("lucide-react");
var skeleton_1 = require("@/components/ui/skeleton");
var sonner_1 = require("sonner");
var useOrgPermission_1 = require("@/hooks/useOrgPermission");
var SummaryStatCards_1 = require("@/components/list-page/SummaryStatCards");
function OrgProducts() {
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var hasPermission = useOrgPermission_1.useOrgPermission().hasPermission;
    var canCreate = hasPermission("products");
    var canEdit = hasPermission("products");
    var canDelete = hasPermission("products");
    var _b = react_1.useState(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = react_1.useState("all"), statusFilter = _c[0], setStatusFilter = _c[1];
    // Fetch products data
    var _d = trpc_1.trpc.products.list.useQuery(undefined), _e = _d.data, productsData = _e === void 0 ? [] : _e, isLoadingProducts = _d.isLoading;
    var utils = trpc_1.trpc.useUtils();
    var deleteProductMutation = trpc_1.trpc.products["delete"].useMutation({
        onSuccess: function () {
            utils.products.list.invalidate();
            sonner_1.toast.success("Product deleted successfully");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete product");
        }
    });
    // Transform data
    var plainProductsData = Array.isArray(productsData)
        ? productsData.map(function (p) { return JSON.parse(JSON.stringify(p)); })
        : [];
    var products = react_1.useMemo(function () {
        return plainProductsData.map(function (p) { return ({
            id: p.id,
            sku: p.sku || "SKU-" + p.id.slice(0, 8),
            name: p.name || "Unknown",
            category: p.category || "",
            price: (p.price || 0) / 100,
            stock: p.stock || 0,
            unit: p.unit || "units",
            status: p.status || "active"
        }); });
    }, [plainProductsData]);
    var filtered = react_1.useMemo(function () {
        return products.filter(function (product) {
            var matchesSearch = product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.category.toLowerCase().includes(searchQuery.toLowerCase());
            var matchesStatus = statusFilter === "all" || product.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [products, searchQuery, statusFilter]);
    var stats = react_1.useMemo(function () {
        var active = products.filter(function (p) { return p.status === "active"; }).length;
        var lowStock = products.filter(function (p) { return p.stock < 10; }).length;
        var totalValue = products.reduce(function (sum, p) { return sum + p.price * p.stock; }, 0);
        return { active: active, lowStock: lowStock, totalValue: totalValue, count: products.length };
    }, [products]);
    var handleView = function (id) {
        navigate("/org/" + slug + "/products/" + id);
    };
    var handleEdit = function (id) {
        navigate("/org/" + slug + "/products/" + id + "/edit");
    };
    var handleDelete = function (id) {
        if (confirm("Are you sure you want to delete this product?")) {
            deleteProductMutation.mutate(id);
        }
    };
    var handleNewProduct = function () {
        navigate("/org/" + slug + "/products/new");
    };
    // Summary stats for ModuleLayout
    var summaryStats = [
        { label: "Total Products", value: String(stats.count), trend: undefined },
        { label: "Active", value: String(stats.active), trend: undefined },
        { label: "Low Stock", value: String(stats.lowStock), trend: undefined },
        { label: "Inventory Value", value: "KES " + stats.totalValue.toLocaleString(), trend: undefined },
    ];
    return (React.createElement(OrgModuleLayout_1.OrgModuleLayout, { title: "Products", description: "Manage your product catalog and inventory", icon: lucide_react_1.Package, breadcrumbs: [
            { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
            { label: "Products" },
        ], actions: canCreate && (React.createElement(button_1.Button, { size: "sm", onClick: handleNewProduct },
            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
            " New Product")), backLink: "/org/" + slug + "/dashboard", hasAccess: canCreate || canEdit || canDelete, accessDeniedMessage: "Products module is not enabled for your organization." },
        React.createElement("div", { className: "space-y-6" },
            React.createElement(SummaryStatCards_1.SummaryStatCards, { cards: summaryStats, isLoading: isLoadingProducts }),
            React.createElement("div", { className: "flex items-center gap-3 flex-wrap" },
                React.createElement("div", { className: "relative flex-1 max-w-sm" },
                    React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                    React.createElement(input_1.Input, { placeholder: "Search by SKU, name, category...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-9" }))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "p-0" }, isLoadingProducts ? (React.createElement("div", { className: "p-6 space-y-3" }, Array.from({ length: 6 }).map(function (_, i) { return React.createElement(skeleton_1.Skeleton, { key: i, className: "h-12 rounded" }); }))) : filtered.length === 0 ? (React.createElement("div", { className: "py-16 text-center" },
                    React.createElement(lucide_react_1.Package, { className: "h-10 w-10 text-muted-foreground/20 mx-auto mb-3" }),
                    React.createElement("p", { className: "text-muted-foreground text-sm" }, searchQuery ? "No products match your search" : "No products yet"))) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "SKU"),
                                React.createElement(table_1.TableHead, null, "Name"),
                                React.createElement(table_1.TableHead, null, "Category"),
                                React.createElement(table_1.TableHead, null, "Price"),
                                React.createElement(table_1.TableHead, null, "Stock"),
                                React.createElement(table_1.TableHead, null, "Unit"),
                                React.createElement(table_1.TableHead, null, "Status"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, filtered.map(function (product) { return (React.createElement(table_1.TableRow, { key: product.id, className: "hover:bg-muted/30" },
                            React.createElement(table_1.TableCell, { className: "font-mono text-sm" }, product.sku),
                            React.createElement(table_1.TableCell, { className: "font-semibold" }, product.name),
                            React.createElement(table_1.TableCell, { className: "text-muted-foreground" }, product.category || "—"),
                            React.createElement(table_1.TableCell, null,
                                "KES ",
                                product.price.toLocaleString()),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { variant: product.stock < 10 ? "destructive" : "outline" },
                                    product.stock,
                                    " ",
                                    product.unit)),
                            React.createElement(table_1.TableCell, { className: "text-muted-foreground" }, product.unit),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { variant: product.status === "active" ? "default" : "secondary" }, product.status)),
                            React.createElement(table_1.TableCell, { className: "text-right space-x-2" },
                                React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleView(product.id); }, title: "View" },
                                    React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                canEdit && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleEdit(product.id); }, title: "Edit" },
                                    React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" }))),
                                canDelete && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleDelete(product.id); }, title: "Delete" },
                                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))))); }))))))))));
}
exports["default"] = OrgProducts;
