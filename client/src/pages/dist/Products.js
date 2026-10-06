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
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var permissions_1 = require("@/lib/permissions");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var sonner_1 = require("sonner");
var export_utils_1 = require("@/lib/export-utils");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
var stats_card_1 = require("@/components/ui/stats-card");
var ListPageToolbar_1 = require("@/components/list-page/ListPageToolbar");
var TableColumnSettings_1 = require("@/components/list-page/TableColumnSettings");
var EnhancedBulkActions_1 = require("@/components/list-page/EnhancedBulkActions");
var checkbox_1 = require("@/components/ui/checkbox");
function Products() {
    var _this = this;
    // CALL ALL HOOKS UNCONDITIONALLY AT TOP LEVEL
    var _a = permissions_1.useRequireFeature("products:view"), allowed = _a.allowed, isLoading = _a.isLoading;
    var _b = wouter_1.useLocation(), navigate = _b[1];
    var _c = react_1.useState(""), searchQuery = _c[0], setSearchQuery = _c[1];
    var _d = react_1.useState({
        status: "all",
        sortBy: "name",
        sortOrder: "asc"
    }), filters = _d[0], setFilters = _d[1];
    var _e = react_1.useState(new Set()), selectedProducts = _e[0], setSelectedProducts = _e[1];
    var productColumns = [
        { key: "sku", label: "SKU" },
        { key: "name", label: "Name" },
        { key: "category", label: "Category" },
        { key: "price", label: "Price" },
        { key: "stock", label: "Stock" },
        { key: "unit", label: "Unit" },
        { key: "status", label: "Status" },
    ];
    var _f = TableColumnSettings_1.useColumnVisibility(productColumns, "products"), visibleColumns = _f.visibleColumns, toggleColumn = _f.toggleColumn, isVisible = _f.isVisible, pageSize = _f.pageSize, updatePageSize = _f.updatePageSize, reset = _f.reset;
    // Fetch products from backend
    var _g = trpc_1.trpc.products.list.useQuery(), _h = _g.data, products = _h === void 0 ? [] : _h, isLoadingProducts = _g.isLoading;
    var utils = trpc_1.trpc.useUtils();
    // Delete mutation
    var deleteProductMutation = trpc_1.trpc.products["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Product deleted successfully");
            utils.products.list.invalidate();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete product");
        }
    });
    var bulkDeleteProductsMutation = trpc_1.trpc.products.bulkDelete.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Products deleted successfully");
            utils.products.list.invalidate();
            setSelectedProducts(new Set());
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete products");
        }
    });
    var updateProductMutation = trpc_1.trpc.products.update.useMutation({
        onSuccess: function () { utils.products.list.invalidate(); },
        onError: function (error) { sonner_1.toast.error(error.message || "Failed to update product"); }
    });
    var filteredProducts = products
        .filter(function (product) {
        return product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    })
        .sort(function (a, b) {
        var aVal = a[filters.sortBy];
        var bVal = b[filters.sortBy];
        if (typeof aVal === "string")
            aVal = aVal.toLowerCase();
        if (typeof bVal === "string")
            bVal = bVal.toLowerCase();
        var comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return filters.sortOrder === "desc" ? -comparison : comparison;
    });
    var handleDeleteProduct = function (productId, productName) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (confirm("Are you sure you want to delete product \"" + productName + "\"?")) {
                deleteProductMutation.mutate(productId);
            }
            return [2 /*return*/];
        });
    }); };
    var toggleSelectProduct = function (id) {
        setSelectedProducts(function (prev) {
            var next = new Set(prev);
            if (next.has(id))
                next["delete"](id);
            else
                next.add(id);
            return next;
        });
    };
    var toggleSelectAllProducts = function () {
        if (selectedProducts.size === filteredProducts.length) {
            setSelectedProducts(new Set());
        }
        else {
            setSelectedProducts(new Set(filteredProducts.map(function (p) { return p.id; })));
        }
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Products", description: "Manage your inventory and product catalog", icon: React.createElement(lucide_react_1.Package, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Products & Services", href: "/products" },
            { label: "Products" },
        ], actions: React.createElement(button_1.Button, { onClick: function () { return navigate("/products/create"); } },
            React.createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
            "Add Product") },
        React.createElement("div", { className: "space-y-6" },
            React.createElement(ListPageToolbar_1.ListPageToolbar, { searchValue: searchQuery, onSearchChange: setSearchQuery, searchPlaceholder: "Search products...", onCreateClick: function () { return navigate("/products/create"); }, createLabel: "Add Product", onExportClick: function () { return export_utils_1.downloadCSV(filteredProducts.map(function (p) { return ({ SKU: p.sku || "", Name: p.name, Category: p.category || "", Price: p.price, Stock: p.stockQuantity || 0, Status: p.isActive ? "Active" : "Inactive" }); }), "products"); }, onImportClick: function () { sonner_1.toast.info("Navigate to import page"); navigate("/products/import"); }, onPrintClick: function () { return window.print(); } }),
            React.createElement(EnhancedBulkActions_1.EnhancedBulkActions, { selectedCount: selectedProducts.size, onClear: function () { return setSelectedProducts(new Set()); }, actions: [
                    { id: "activate", label: "Activate", icon: React.createElement(lucide_react_1.CheckCircle2, { className: "h-3.5 w-3.5" }), onClick: function () { return __awaiter(_this, void 0, void 0, function () { var count, _i, selectedProducts_1, id, _a; return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    count = 0;
                                    _i = 0, selectedProducts_1 = selectedProducts;
                                    _b.label = 1;
                                case 1:
                                    if (!(_i < selectedProducts_1.length)) return [3 /*break*/, 6];
                                    id = selectedProducts_1[_i];
                                    _b.label = 2;
                                case 2:
                                    _b.trys.push([2, 4, , 5]);
                                    return [4 /*yield*/, updateProductMutation.mutateAsync({ id: id, status: 'active' })];
                                case 3:
                                    _b.sent();
                                    count++;
                                    return [3 /*break*/, 5];
                                case 4:
                                    _a = _b.sent();
                                    return [3 /*break*/, 5];
                                case 5:
                                    _i++;
                                    return [3 /*break*/, 1];
                                case 6:
                                    sonner_1.toast.success("Activated " + count + " products");
                                    setSelectedProducts(new Set());
                                    return [2 /*return*/];
                            }
                        }); }); } },
                    { id: "deactivate", label: "Deactivate", icon: React.createElement(lucide_react_1.XCircle, { className: "h-3.5 w-3.5" }), onClick: function () { return __awaiter(_this, void 0, void 0, function () { var count, _i, selectedProducts_2, id, _a; return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    count = 0;
                                    _i = 0, selectedProducts_2 = selectedProducts;
                                    _b.label = 1;
                                case 1:
                                    if (!(_i < selectedProducts_2.length)) return [3 /*break*/, 6];
                                    id = selectedProducts_2[_i];
                                    _b.label = 2;
                                case 2:
                                    _b.trys.push([2, 4, , 5]);
                                    return [4 /*yield*/, updateProductMutation.mutateAsync({ id: id, status: 'inactive' })];
                                case 3:
                                    _b.sent();
                                    count++;
                                    return [3 /*break*/, 5];
                                case 4:
                                    _a = _b.sent();
                                    return [3 /*break*/, 5];
                                case 5:
                                    _i++;
                                    return [3 /*break*/, 1];
                                case 6:
                                    sonner_1.toast.success("Deactivated " + count + " products");
                                    setSelectedProducts(new Set());
                                    return [2 /*return*/];
                            }
                        }); }); } },
                    EnhancedBulkActions_1.bulkExportAction(selectedProducts, products, productColumns, "products"),
                    EnhancedBulkActions_1.bulkCopyIdsAction(selectedProducts),
                    EnhancedBulkActions_1.bulkDeleteAction(selectedProducts, function (ids) { return bulkDeleteProductsMutation.mutate(ids); }),
                ] }),
            React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Products", value: products.length, icon: React.createElement(lucide_react_1.Package, { className: "h-5 w-5" }), color: "border-l-orange-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Active", value: products.filter(function (p) { return p.isActive !== 0; }).length, icon: React.createElement(lucide_react_1.CheckCircle2, { className: "h-5 w-5" }), color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Low Stock", value: products.filter(function (p) { return (p.stockQuantity || 0) <= (p.minStockLevel || 0); }).length, icon: React.createElement(lucide_react_1.AlertTriangle, { className: "h-5 w-5" }), color: "border-l-orange-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Inactive", value: products.filter(function (p) { return p.isActive === 0; }).length, icon: React.createElement(lucide_react_1.XCircle, { className: "h-5 w-5" }), color: "border-l-red-500" })),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "p-0" },
                    React.createElement("div", { className: "flex items-center justify-between px-4 py-3 border-b" },
                        React.createElement("span", { className: "text-sm text-muted-foreground" },
                            filteredProducts.length,
                            " products"),
                        React.createElement(TableColumnSettings_1.TableColumnSettings, { columns: productColumns, visibleColumns: visibleColumns, onToggleColumn: toggleColumn, onReset: reset, pageSize: pageSize, onPageSizeChange: updatePageSize })),
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, { className: "w-10" },
                                    React.createElement(checkbox_1.Checkbox, { checked: selectedProducts.size === filteredProducts.length && filteredProducts.length > 0, onCheckedChange: toggleSelectAllProducts })),
                                isVisible("sku") && React.createElement(table_1.TableHead, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, "SKU"),
                                isVisible("name") && React.createElement(table_1.TableHead, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, "Name"),
                                isVisible("category") && React.createElement(table_1.TableHead, { className: "hidden md:table-cell px-2 sm:px-3 text-xs sm:text-sm" }, "Category"),
                                isVisible("price") && React.createElement(table_1.TableHead, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, "Price"),
                                isVisible("stock") && React.createElement(table_1.TableHead, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, "Stock"),
                                isVisible("status") && React.createElement(table_1.TableHead, { className: "hidden md:table-cell px-2 sm:px-3 text-xs sm:text-sm" }, "Status"),
                                React.createElement(table_1.TableHead, { className: "text-right px-2 sm:px-3" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, isLoading ? (React.createElement(table_1.TableRow, null,
                            React.createElement(table_1.TableCell, { colSpan: 7, className: "text-center py-8 text-muted-foreground" }, "Loading products..."))) : filteredProducts.length === 0 ? (React.createElement(table_1.TableRow, null,
                            React.createElement(table_1.TableCell, { colSpan: 7, className: "text-center py-8 text-muted-foreground" }, "No products found."))) : (filteredProducts.map(function (product) { return (React.createElement(table_1.TableRow, { key: product.id },
                            React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm font-medium" }, product.sku || "N/A"),
                            React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, product.name),
                            React.createElement(table_1.TableCell, { className: "hidden md:table-cell px-2 sm:px-3 text-xs sm:text-sm" }, product.category || "Uncategorized"),
                            React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm font-semibold" },
                                "Ksh ",
                                (Number(product.unitPrice) / 100).toLocaleString()),
                            React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm" },
                                React.createElement("span", { className: (product.stockQuantity || 0) <= (product.minStockLevel || 0) ? "text-red-600 font-medium" : "" },
                                    product.stockQuantity,
                                    " ",
                                    product.unit || "pcs")),
                            React.createElement(table_1.TableCell, { className: "hidden md:table-cell px-2 sm:px-3 text-xs sm:text-sm" }, product.isActive !== 0 ? (React.createElement(badge_1.Badge, { variant: "outline", className: "bg-green-50 text-green-700 border-green-200" }, "Active")) : (React.createElement(badge_1.Badge, { variant: "outline", className: "bg-red-50 text-red-700 border-red-200" }, "Inactive"))),
                            React.createElement(table_1.TableCell, { className: "text-right" },
                                React.createElement("div", { className: "flex justify-end gap-2" },
                                    React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { return navigate("/products/" + product.id); } },
                                        React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                    React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { return navigate("/products/" + product.id + "/edit"); } },
                                        React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" })),
                                    React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "text-red-600 hover:text-red-700 hover:bg-red-50", onClick: function () { return handleDeleteProduct(product.id, product.name); } },
                                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))))); })))))))));
}
exports["default"] = Products;
