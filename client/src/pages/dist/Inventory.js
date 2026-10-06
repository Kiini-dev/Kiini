"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var tabs_1 = require("@/components/ui/tabs");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var alert_1 = require("@/components/ui/alert");
var progress_1 = require("@/components/ui/progress");
var dialog_1 = require("@/components/ui/dialog");
var lucide_react_1 = require("lucide-react");
var stats_card_1 = require("@/components/ui/stats-card");
var currency_1 = require("@/lib/currency");
function InventoryManagement() {
    var _this = this;
    var formatMoney = currency_1.useCurrency().format;
    var _a = react_1.useState('overview'), activeTab = _a[0], setActiveTab = _a[1];
    var _b = react_1.useState(''), searchTerm = _b[0], setSearchTerm = _b[1];
    var _c = react_1.useState(false), adjustmentDialogOpen = _c[0], setAdjustmentDialogOpen = _c[1];
    var _d = react_1.useState(null), selectedProduct = _d[0], setSelectedProduct = _d[1];
    var _e = react_1.useState({
        quantity: 0,
        reason: 'adjustment',
        notes: ''
    }), adjustmentData = _e[0], setAdjustmentData = _e[1];
    // Fetch inventories with products
    var _f = trpc_1.trpc.inventory.list.useQuery(), inventories = _f.data, inventoriesLoading = _f.isLoading, refetchInventories = _f.refetch;
    // Create/Update mutations
    var createInventoryMutation = trpc_1.trpc.inventory.create.useMutation({
        onSuccess: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sonner_1.toast.success('Inventory created successfully');
                        return [4 /*yield*/, refetchInventories()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onError: function (error) {
            sonner_1.toast.error("Failed: " + error.message);
        }
    });
    var adjustStockMutation = trpc_1.trpc.inventory.adjustStock.useMutation({
        onSuccess: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sonner_1.toast.success('Stock adjusted successfully');
                        setAdjustmentDialogOpen(false);
                        setSelectedProduct(null);
                        return [4 /*yield*/, refetchInventories()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onError: function (error) {
            sonner_1.toast.error("Failed: " + error.message);
        }
    });
    // Filter inventory
    var filteredInventories = (inventories === null || inventories === void 0 ? void 0 : inventories.filter(function (item) {
        var _a, _b;
        return ((_a = item.productName) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm.toLowerCase())) || ((_b = item.sku) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(searchTerm.toLowerCase()));
    })) || [];
    // Calculate statistics
    var stats = {
        totalItems: filteredInventories.length,
        lowStockItems: filteredInventories.filter(function (i) { return (i.quantity || 0) <= (i.reorderLevel || 0); }).length,
        totalValue: filteredInventories.reduce(function (sum, i) { return sum + ((i.quantity || 0) * (i.unitCost || 0)); }, 0),
        outOfStock: filteredInventories.filter(function (i) { return (i.quantity || 0) === 0; }).length
    };
    // Get stock status
    var getStockStatus = function (quantity, reorderLevel) {
        if (quantity === 0)
            return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
        if (quantity <= reorderLevel)
            return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
        if (quantity >= reorderLevel * 3)
            return { label: 'Optimal', color: 'bg-green-100 text-green-800' };
        return { label: 'In Stock', color: 'bg-blue-100 text-blue-800' };
    };
    var handleAdjustStock = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedProduct || adjustmentData.quantity === 0) {
                        sonner_1.toast.error('Please fill in all required fields');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, adjustStockMutation.mutateAsync({
                            productId: selectedProduct,
                            quantityChange: adjustmentData.quantity,
                            reason: adjustmentData.reason,
                            notes: adjustmentData.notes
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var exportInventory = function () {
        var csv = __spreadArrays([
            ['SKU', 'Product', 'Category', 'Quantity', 'Reorder Level', 'Unit Cost', 'Total Value'].join(',')
        ], filteredInventories.map(function (item) {
            return [
                item.sku || '',
                item.productName || '',
                item.category || '',
                item.quantity || 0,
                item.reorderLevel || 0,
                item.unitCost || 0,
                ((item.quantity || 0) * (item.unitCost || 0)).toLocaleString(),
            ].join(',');
        })).join('\n');
        var blob = new Blob([csv], { type: 'text/csv' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = "inventory-" + new Date().toISOString().split('T')[0] + ".csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        sonner_1.toast.success('Inventory exported');
    };
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Inventory & Stocks", description: "Manage product inventory, stock levels, and reorder points", icon: react_1["default"].createElement(lucide_react_1.Package, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Procurement", href: "/lpos" },
            { label: "Inventory" },
        ], actions: react_1["default"].createElement("div", { className: "flex gap-2" },
            react_1["default"].createElement(button_1.Button, { onClick: exportInventory, variant: "outline" },
                react_1["default"].createElement(lucide_react_1.Download, { className: "mr-2 h-4 w-4" }),
                "Export"),
            react_1["default"].createElement(button_1.Button, null,
                react_1["default"].createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
                "Add Product")) },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "grid grid-cols-4 gap-4" },
                react_1["default"].createElement(stats_card_1.StatsCard, { label: "Total Items", value: stats.totalItems, color: "border-l-orange-500" }),
                react_1["default"].createElement(stats_card_1.StatsCard, { label: "Low Stock Items", value: stats.lowStockItems, color: "border-l-purple-500" }),
                react_1["default"].createElement(stats_card_1.StatsCard, { label: "Out of Stock", value: stats.outOfStock, color: "border-l-green-500" }),
                react_1["default"].createElement(stats_card_1.StatsCard, { label: "Total Value", value: react_1["default"].createElement(react_1["default"].Fragment, null, formatMoney(stats.totalValue || 0)), color: "border-l-blue-500" })),
            react_1["default"].createElement(tabs_1.Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-6" },
                react_1["default"].createElement(tabs_1.TabsList, null,
                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "overview" }, "Overview"),
                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "lowstock" }, "Low Stock Alert"),
                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "movements" }, "Stock Movements")),
                react_1["default"].createElement(tabs_1.TabsContent, { value: "overview", className: "space-y-4" },
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardContent, { className: "pt-6" },
                            react_1["default"].createElement("div", { className: "flex gap-4" },
                                react_1["default"].createElement("div", { className: "flex-1" },
                                    react_1["default"].createElement(input_1.Input, { placeholder: "Search by product name or SKU...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: "pl-10" })),
                                react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () {
                                        setSearchTerm("");
                                        sonner_1.toast.success("Filters reset. Use search and tabs to narrow results.");
                                    } },
                                    react_1["default"].createElement(lucide_react_1.Filter, { className: "h-4 w-4" })),
                                react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { refetchInventories(); sonner_1.toast.success("Inventory refreshed"); } },
                                    react_1["default"].createElement(lucide_react_1.RefreshCw, { className: "h-4 w-4" }))))),
                    inventoriesLoading ? (react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardContent, { className: "pt-6 flex justify-center" },
                            react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin" })))) : filteredInventories.length > 0 ? (react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardContent, { className: "pt-6" },
                            react_1["default"].createElement("div", { className: "overflow-x-auto" },
                                react_1["default"].createElement(table_1.Table, null,
                                    react_1["default"].createElement(table_1.TableHeader, null,
                                        react_1["default"].createElement(table_1.TableRow, null,
                                            react_1["default"].createElement(table_1.TableHead, null, "SKU"),
                                            react_1["default"].createElement(table_1.TableHead, null, "Product"),
                                            react_1["default"].createElement(table_1.TableHead, { className: "hidden md:table-cell" }, "Category"),
                                            react_1["default"].createElement(table_1.TableHead, { className: "text-right" }, "Quantity"),
                                            react_1["default"].createElement(table_1.TableHead, { className: "hidden lg:table-cell text-right" }, "Reorder Level"),
                                            react_1["default"].createElement(table_1.TableHead, { className: "hidden md:table-cell text-right" }, "Unit Cost"),
                                            react_1["default"].createElement(table_1.TableHead, null, "Status"),
                                            react_1["default"].createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                                    react_1["default"].createElement(table_1.TableBody, null, filteredInventories.map(function (item) {
                                        var status = getStockStatus(item.quantity || 0, item.reorderLevel || 0);
                                        var utilizationPercent = Math.min(((item.quantity || 0) / (item.reorderLevel || 1)) * 100, 100);
                                        return (react_1["default"].createElement(table_1.TableRow, { key: item.id },
                                            react_1["default"].createElement(table_1.TableCell, { className: "font-mono text-sm" }, item.sku),
                                            react_1["default"].createElement(table_1.TableCell, { className: "font-medium" }, item.productName),
                                            react_1["default"].createElement(table_1.TableCell, { className: "hidden md:table-cell" }, item.category),
                                            react_1["default"].createElement(table_1.TableCell, { className: "text-right font-semibold" }, item.quantity || 0),
                                            react_1["default"].createElement(table_1.TableCell, { className: "hidden lg:table-cell text-right text-gray-500" }, item.reorderLevel || 0),
                                            react_1["default"].createElement(table_1.TableCell, { className: "hidden md:table-cell text-right" }, formatMoney(item.unitCost || 0)),
                                            react_1["default"].createElement(table_1.TableCell, null,
                                                react_1["default"].createElement(badge_1.Badge, { className: status.color }, status.label)),
                                            react_1["default"].createElement(table_1.TableCell, { className: "text-right" },
                                                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () {
                                                        setSelectedProduct(item.id);
                                                        setAdjustmentDialogOpen(true);
                                                    } },
                                                    react_1["default"].createElement(lucide_react_1.Edit2, { className: "h-4 w-4" })))));
                                    }))))))) : (react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardContent, { className: "pt-6 text-center text-gray-500" }, "No inventory items found")))),
                react_1["default"].createElement(tabs_1.TabsContent, { value: "lowstock", className: "space-y-4" }, filteredInventories.filter(function (i) { return (i.quantity || 0) <= (i.reorderLevel || 0); }).length > 0 ? (react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                            react_1["default"].createElement(lucide_react_1.AlertTriangle, { className: "h-5 w-5 text-yellow-600" }),
                            "Low Stock Items (",
                            stats.lowStockItems,
                            ")"),
                        react_1["default"].createElement(card_1.CardDescription, null, "Items below reorder level")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "space-y-4" }, filteredInventories
                            .filter(function (i) { return (i.quantity || 0) <= (i.reorderLevel || 0); })
                            .map(function (item) { return (react_1["default"].createElement("div", { key: item.id, className: "border rounded-lg p-4" },
                            react_1["default"].createElement("div", { className: "flex items-start justify-between mb-3" },
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "font-semibold" }, item.productName),
                                    react_1["default"].createElement("p", { className: "text-sm text-gray-500" }, item.sku)),
                                react_1["default"].createElement(badge_1.Badge, { variant: "destructive" }, "Low Stock")),
                            react_1["default"].createElement("div", { className: "grid grid-cols-3 gap-4 mb-3" },
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "text-xs text-gray-500" }, "Current"),
                                    react_1["default"].createElement("p", { className: "font-semibold" },
                                        item.quantity || 0,
                                        " units")),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "text-xs text-gray-500" }, "Reorder Level"),
                                    react_1["default"].createElement("p", { className: "font-semibold" },
                                        item.reorderLevel || 0,
                                        " units")),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "text-xs text-gray-500" }, "To Order"),
                                    react_1["default"].createElement("p", { className: "font-semibold text-blue-600" },
                                        Math.max(0, (item.reorderLevel || 0) - (item.quantity || 0)),
                                        " units"))),
                            react_1["default"].createElement(progress_1.Progress, { value: ((item.quantity || 0) / (item.reorderLevel || 1)) * 100, className: "h-2" }))); }))))) : (react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardContent, { className: "pt-6 text-center text-gray-500" }, "All items are at optimal stock levels")))),
                react_1["default"].createElement(tabs_1.TabsContent, { value: "movements", className: "space-y-4" },
                    react_1["default"].createElement(alert_1.Alert, null,
                        react_1["default"].createElement(lucide_react_1.AlertTriangle, { className: "h-4 w-4" }),
                        react_1["default"].createElement(alert_1.AlertDescription, null, "Stock movements are automatically recorded when inventory is adjusted or products are sold")))),
            react_1["default"].createElement(dialog_1.Dialog, { open: adjustmentDialogOpen, onOpenChange: setAdjustmentDialogOpen },
                react_1["default"].createElement(dialog_1.DialogContent, null,
                    react_1["default"].createElement(dialog_1.DialogHeader, null,
                        react_1["default"].createElement(dialog_1.DialogTitle, null, "Adjust Stock"),
                        react_1["default"].createElement(dialog_1.DialogDescription, null, "Adjust the stock quantity for this product")),
                    react_1["default"].createElement("div", { className: "space-y-4" },
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "adjustment-quantity" }, "Quantity Change"),
                            react_1["default"].createElement(input_1.Input, { id: "adjustment-quantity", type: "number", value: adjustmentData.quantity, onChange: function (e) {
                                    return setAdjustmentData(function (prev) { return (__assign(__assign({}, prev), { quantity: parseInt(e.target.value) || 0 })); });
                                }, placeholder: "Enter quantity (negative to reduce)" })),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "adjustment-reason" }, "Reason"),
                            react_1["default"].createElement(select_1.Select, { value: adjustmentData.reason, onValueChange: function (value) {
                                    return setAdjustmentData(function (prev) { return (__assign(__assign({}, prev), { reason: value })); });
                                } },
                                react_1["default"].createElement(select_1.SelectTrigger, { id: "adjustment-reason" },
                                    react_1["default"].createElement(select_1.SelectValue, null)),
                                react_1["default"].createElement(select_1.SelectContent, null,
                                    react_1["default"].createElement(select_1.SelectItem, { value: "adjustment" }, "Manual Adjustment"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "damage" }, "Damage"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "loss" }, "Loss/Theft"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "recount" }, "Physical Recount"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "return" }, "Customer Return")))),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "adjustment-notes" }, "Notes"),
                            react_1["default"].createElement(input_1.Input, { id: "adjustment-notes", placeholder: "Add any additional notes...", value: adjustmentData.notes, onChange: function (e) {
                                    return setAdjustmentData(function (prev) { return (__assign(__assign({}, prev), { notes: e.target.value })); });
                                } }))),
                    react_1["default"].createElement(dialog_1.DialogFooter, null,
                        react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return setAdjustmentDialogOpen(false); } }, "Cancel"),
                        react_1["default"].createElement(button_1.Button, { onClick: handleAdjustStock, disabled: adjustStockMutation.isPending }, adjustStockMutation.isPending ? (react_1["default"].createElement(react_1["default"].Fragment, null,
                            react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                            "Adjusting...")) : ('Adjust Stock'))))))));
}
exports["default"] = InventoryManagement;
