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
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var label_1 = require("@/components/ui/label");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var separator_1 = require("@/components/ui/separator");
var currency_1 = require("@/lib/currency");
var ListPageToolbar_1 = require("@/components/list-page/ListPageToolbar");
var RowActionsMenu_1 = require("@/components/list-page/RowActionsMenu");
var TableColumnSettings_1 = require("@/components/list-page/TableColumnSettings");
var EnhancedBulkActions_1 = require("@/components/list-page/EnhancedBulkActions");
var checkbox_1 = require("@/components/ui/checkbox");
var stats_card_1 = require("@/components/ui/stats-card");
function OrdersPage() {
    var _this = this;
    var _a;
    var _b = react_1.useState(false), isCreateOpen = _b[0], setIsCreateOpen = _b[1];
    var formatMoney = currency_1.useCurrency().format;
    var _c = react_1.useState(false), isExporting = _c[0], setIsExporting = _c[1];
    var _d = react_1.useState(false), isImporting = _d[0], setIsImporting = _d[1];
    var _e = react_1.useState(""), searchTerm = _e[0], setSearchTerm = _e[1];
    var _f = react_1.useState("all"), statusFilter = _f[0], setStatusFilter = _f[1];
    var _g = react_1.useState(new Set()), selectedOrders = _g[0], setSelectedOrders = _g[1];
    var orderColumns = [
        { key: "orderNumber", label: "Order Number" },
        { key: "supplier", label: "Supplier" },
        { key: "amount", label: "Amount" },
        { key: "deliveryDate", label: "Delivery Date" },
        { key: "deliveryAddress", label: "Delivery Address" },
        { key: "poDate", label: "PO Date" },
        { key: "status", label: "Status" },
    ];
    var _h = TableColumnSettings_1.useColumnVisibility(orderColumns, "orders"), visibleColumns = _h.visibleColumns, toggleColumn = _h.toggleColumn, isVisible = _h.isVisible, pageSize = _h.pageSize, updatePageSize = _h.updatePageSize, reset = _h.reset;
    var _j = wouter_1.useLocation(), navigate = _j[1];
    var _k = react_1.useState(null), viewOrder = _k[0], setViewOrder = _k[1];
    var _l = react_1.useState({
        orderNumber: "",
        supplierId: "",
        supplierName: "",
        description: "",
        totalAmount: 0,
        status: "draft",
        deliveryDate: "",
        deliveryAddress: "",
        poDate: new Date().toISOString().split("T")[0],
        notes: ""
    }), formData = _l[0], setFormData = _l[1];
    // Queries
    var _m = trpc_1.trpc.procurementMgmt.orderList.useQuery(), _o = _m.data, orders = _o === void 0 ? [] : _o, isLoading = _m.isLoading, refetch = _m.refetch;
    var _p = trpc_1.trpc.suppliers.list.useQuery({ limit: 100 }).data, suppliers = _p === void 0 ? [] : _p;
    // Mutations
    var createMutation = trpc_1.trpc.procurementMgmt.orderCreate.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Order created successfully");
            setIsCreateOpen(false);
            resetForm();
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to create order");
        }
    });
    var updateMutation = trpc_1.trpc.procurementMgmt.orderUpdate.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Order updated successfully");
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to update order");
        }
    });
    var deleteMutation = trpc_1.trpc.procurementMgmt.orderDelete.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Order deleted successfully");
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete order");
        }
    });
    var resetForm = function () {
        setFormData({
            orderNumber: "",
            supplierId: "",
            supplierName: "",
            description: "",
            totalAmount: 0,
            status: "draft",
            deliveryDate: "",
            deliveryAddress: "",
            poDate: new Date().toISOString().split("T")[0],
            notes: ""
        });
    };
    var handleInputChange = function (e) {
        var _a = e.target, name = _a.name, value = _a.value;
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[name] = name === "totalAmount" ? Number(value) : value, _a)));
        });
    };
    var handleSupplierSelect = function (supplierId) {
        var selectedSupplier = suppliers.find(function (s) { return s.id === supplierId; });
        setFormData(function (prev) { return (__assign(__assign({}, prev), { supplierId: supplierId, supplierName: (selectedSupplier === null || selectedSupplier === void 0 ? void 0 : selectedSupplier.companyName) || "" })); });
    };
    var handleCreateOrder = function () {
        if (!formData.orderNumber.trim() || !formData.supplierId || formData.totalAmount <= 0) {
            sonner_1.toast.error("Order Number, Supplier, and Amount are required");
            return;
        }
        createMutation.mutate({
            orderNumber: formData.orderNumber,
            supplierId: formData.supplierId,
            supplierName: formData.supplierName,
            description: formData.description,
            items: [],
            totalAmount: formData.totalAmount * 100,
            status: formData.status,
            deliveryDate: formData.deliveryDate || undefined,
            deliveryAddress: formData.deliveryAddress,
            poDate: formData.poDate || undefined,
            notes: formData.notes || undefined
        });
    };
    var handleExport = function () { return __awaiter(_this, void 0, void 0, function () {
        var csv, element, file;
        return __generator(this, function (_a) {
            setIsExporting(true);
            try {
                csv = __spreadArrays([
                    ["Order Number", "Supplier", "Amount", "Status", "Delivery Date", "Delivery Address", "PO Date"]
                ], filteredOrders.map(function (order) { return [
                    order.orderNumber,
                    order.supplierName,
                    order.totalAmount / 100,
                    order.status,
                    order.deliveryDate || "",
                    order.deliveryAddress || "",
                    order.poDate || "",
                ]; })).map(function (row) { return row.join(","); })
                    .join("\n");
                element = document.createElement("a");
                file = new Blob([csv], { type: "text/csv" });
                element.href = URL.createObjectURL(file);
                element.download = "orders-" + new Date().toISOString().split("T")[0] + ".csv";
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
                sonner_1.toast.success("Orders exported successfully");
            }
            catch (error) {
                sonner_1.toast.error("Failed to export orders");
            }
            finally {
                setIsExporting(false);
            }
            return [2 /*return*/];
        });
    }); };
    var handleImport = function () {
        var input = document.createElement("input");
        input.type = "file";
        input.accept = ".csv";
        input.onchange = function (e) { return __awaiter(_this, void 0, void 0, function () {
            var file, text, lines, imported, _i, lines_1, line, _a, orderNumber, supplierId, totalAmount, status, err_1, error_1;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        file = (_b = e.target.files) === null || _b === void 0 ? void 0 : _b[0];
                        if (!file)
                            return [2 /*return*/];
                        setIsImporting(true);
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 9, 10, 11]);
                        return [4 /*yield*/, file.text()];
                    case 2:
                        text = _c.sent();
                        lines = text.split("\n").slice(1);
                        imported = 0;
                        _i = 0, lines_1 = lines;
                        _c.label = 3;
                    case 3:
                        if (!(_i < lines_1.length)) return [3 /*break*/, 8];
                        line = lines_1[_i];
                        if (!line.trim())
                            return [3 /*break*/, 7];
                        _a = line.split(","), orderNumber = _a[0], supplierId = _a[1], totalAmount = _a[2], status = _a[3];
                        if (!(orderNumber && supplierId && totalAmount)) return [3 /*break*/, 7];
                        _c.label = 4;
                    case 4:
                        _c.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, createMutation.mutateAsync({
                                orderNumber: orderNumber,
                                supplierId: supplierId,
                                supplierName: "",
                                description: "",
                                items: [],
                                totalAmount: Number(totalAmount) * 100,
                                status: status || "draft"
                            })];
                    case 5:
                        _c.sent();
                        imported++;
                        return [3 /*break*/, 7];
                    case 6:
                        err_1 = _c.sent();
                        console.error("Error importing row:", err_1);
                        return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 3];
                    case 8:
                        sonner_1.toast.success("Imported " + imported + " orders successfully");
                        refetch();
                        return [3 /*break*/, 11];
                    case 9:
                        error_1 = _c.sent();
                        sonner_1.toast.error("Failed to import orders");
                        return [3 /*break*/, 11];
                    case 10:
                        setIsImporting(false);
                        return [7 /*endfinally*/];
                    case 11: return [2 /*return*/];
                }
            });
        }); };
        input.click();
    };
    var filteredOrders = react_1.useMemo(function () {
        return (Array.isArray(orders) ? orders : []).filter(function (order) {
            var _a, _b, _c;
            var matchesSearch = ((_a = order.orderNumber) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm.toLowerCase())) || ((_b = order.supplierName) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(searchTerm.toLowerCase())) || ((_c = order.description) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(searchTerm.toLowerCase()));
            var matchesStatus = statusFilter === "all" || order.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [orders, searchTerm, statusFilter]);
    var getStatusColor = function (status) {
        switch (status) {
            case "draft":
                return "bg-gray-100 text-gray-800";
            case "sent":
                return "bg-yellow-100 text-yellow-800";
            case "confirmed":
                return "bg-blue-100 text-blue-800";
            case "delivered":
                return "bg-green-100 text-green-800";
            case "invoiced":
                return "bg-purple-100 text-purple-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Purchase Orders", description: "Create and manage purchase orders from selected suppliers", icon: React.createElement(lucide_react_1.Package, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Procurement", href: "/procurement" },
            { label: "Orders" },
        ], actions: React.createElement("div", { className: "flex gap-2" },
            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleImport, disabled: isImporting, className: "gap-2" },
                isImporting ? React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin" }) : React.createElement(lucide_react_1.Upload, { className: "h-4 w-4" }),
                "Import"),
            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleExport, disabled: isExporting, className: "gap-2" },
                isExporting ? React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin" }) : React.createElement(lucide_react_1.Download, { className: "h-4 w-4" }),
                "Export"),
            React.createElement(button_1.Button, { onClick: function () { resetForm(); setIsCreateOpen(true); }, className: "gap-2" },
                React.createElement(lucide_react_1.Plus, { className: "w-4 h-4" }),
                "New Order")) },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Orders", value: filteredOrders.length, icon: React.createElement(lucide_react_1.Package, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Total Value", value: React.createElement(React.Fragment, null, formatMoney(filteredOrders.reduce(function (s, o) { return s + (o.totalAmount || 0); }, 0))), icon: React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }), color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Pending", value: filteredOrders.filter(function (o) { return ["draft", "sent"].includes(o.status); }).length, icon: React.createElement(lucide_react_1.Clock, { className: "h-5 w-5" }), color: "border-l-yellow-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Delivered", value: filteredOrders.filter(function (o) { return o.status === "delivered"; }).length, icon: React.createElement(lucide_react_1.CheckCircle2, { className: "h-5 w-5" }), color: "border-l-emerald-500" })),
            React.createElement(ListPageToolbar_1.ListPageToolbar, { searchValue: searchTerm, onSearchChange: setSearchTerm, searchPlaceholder: "Search orders...", onCreateClick: function () { resetForm(); setIsCreateOpen(true); }, createLabel: "New Order", onExportClick: handleExport, onImportClick: handleImport, onPrintClick: function () { return window.print(); }, filterContent: React.createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                    React.createElement(select_1.SelectTrigger, { className: "w-40" },
                        React.createElement(select_1.SelectValue, { placeholder: "Filter by status" })),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "all" }, "All Status"),
                        React.createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                        React.createElement(select_1.SelectItem, { value: "sent" }, "Sent"),
                        React.createElement(select_1.SelectItem, { value: "confirmed" }, "Confirmed"),
                        React.createElement(select_1.SelectItem, { value: "delivered" }, "Delivered"),
                        React.createElement(select_1.SelectItem, { value: "invoiced" }, "Invoiced"))) }),
            React.createElement(EnhancedBulkActions_1.EnhancedBulkActions, { selectedCount: selectedOrders.size, onClear: function () { return setSelectedOrders(new Set()); }, actions: [
                    { id: "updateStatus", label: "Update Status", icon: React.createElement(lucide_react_1.RefreshCw, { className: "h-3.5 w-3.5" }), onClick: function () { return __awaiter(_this, void 0, void 0, function () { var status, count, _i, selectedOrders_1, id, _a; return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    status = prompt("Enter new status (draft, sent, confirmed, delivered, invoiced):");
                                    if (!status || !['draft', 'sent', 'confirmed', 'delivered', 'invoiced'].includes(status)) {
                                        sonner_1.toast.error("Invalid status");
                                        return [2 /*return*/];
                                    }
                                    count = 0;
                                    _i = 0, selectedOrders_1 = selectedOrders;
                                    _b.label = 1;
                                case 1:
                                    if (!(_i < selectedOrders_1.length)) return [3 /*break*/, 6];
                                    id = selectedOrders_1[_i];
                                    _b.label = 2;
                                case 2:
                                    _b.trys.push([2, 4, , 5]);
                                    return [4 /*yield*/, updateMutation.mutateAsync({ id: id, status: status })];
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
                                    sonner_1.toast.success("Updated " + count + " orders to " + status);
                                    setSelectedOrders(new Set());
                                    return [2 /*return*/];
                            }
                        }); }); } },
                    EnhancedBulkActions_1.bulkExportAction(selectedOrders, orders, orderColumns, "orders"),
                    EnhancedBulkActions_1.bulkCopyIdsAction(selectedOrders),
                    EnhancedBulkActions_1.bulkEmailAction(navigate),
                    EnhancedBulkActions_1.bulkDeleteAction(selectedOrders, function (ids) { return __awaiter(_this, void 0, void 0, function () { var count, _i, ids_1, id, _a; return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                count = 0;
                                _i = 0, ids_1 = ids;
                                _b.label = 1;
                            case 1:
                                if (!(_i < ids_1.length)) return [3 /*break*/, 6];
                                id = ids_1[_i];
                                _b.label = 2;
                            case 2:
                                _b.trys.push([2, 4, , 5]);
                                return [4 /*yield*/, deleteMutation.mutateAsync(id)];
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
                                sonner_1.toast.success("Deleted " + count + " orders");
                                setSelectedOrders(new Set());
                                return [2 /*return*/];
                        }
                    }); }); }),
                ] }),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "p-0" },
                    React.createElement("div", { className: "flex items-center justify-between px-4 py-3 border-b" },
                        React.createElement("span", { className: "text-sm text-muted-foreground" },
                            filteredOrders.length,
                            " orders"),
                        React.createElement(TableColumnSettings_1.TableColumnSettings, { columns: orderColumns, visibleColumns: visibleColumns, onToggleColumn: toggleColumn, onReset: reset, pageSize: pageSize, onPageSizeChange: updatePageSize })),
                    isLoading ? (React.createElement("div", { className: "flex justify-center py-8" },
                        React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-muted-foreground" }))) : filteredOrders.length === 0 ? (React.createElement("div", { className: "text-center py-8 text-muted-foreground" }, "No orders found. Click \"+\" to get started.")) : (React.createElement("div", { className: "overflow-x-auto" },
                        React.createElement(table_1.Table, null,
                            React.createElement(table_1.TableHeader, null,
                                React.createElement(table_1.TableRow, null,
                                    React.createElement(table_1.TableHead, { className: "w-10" },
                                        React.createElement(checkbox_1.Checkbox, { checked: selectedOrders.size === filteredOrders.length && filteredOrders.length > 0, onCheckedChange: function () { if (selectedOrders.size === filteredOrders.length)
                                                setSelectedOrders(new Set());
                                            else
                                                setSelectedOrders(new Set(filteredOrders.map(function (o) { return o.id; }))); } })),
                                    isVisible("orderNumber") && React.createElement(table_1.TableHead, null, "Order Number"),
                                    isVisible("supplier") && React.createElement(table_1.TableHead, null, "Supplier"),
                                    isVisible("amount") && React.createElement(table_1.TableHead, { className: "text-right" }, "Amount"),
                                    isVisible("deliveryDate") && React.createElement(table_1.TableHead, null, "Delivery Date"),
                                    isVisible("deliveryAddress") && React.createElement(table_1.TableHead, null, "Delivery Address"),
                                    isVisible("status") && React.createElement(table_1.TableHead, null, "Status"),
                                    React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                            React.createElement(table_1.TableBody, null, filteredOrders.map(function (order) {
                                var _a;
                                return (React.createElement(table_1.TableRow, { key: order.id, className: selectedOrders.has(order.id) ? "bg-primary/5" : "" },
                                    React.createElement(table_1.TableCell, null,
                                        React.createElement(checkbox_1.Checkbox, { checked: selectedOrders.has(order.id), onCheckedChange: function () { var next = new Set(selectedOrders); if (next.has(order.id))
                                                next["delete"](order.id);
                                            else
                                                next.add(order.id); setSelectedOrders(next); } })),
                                    isVisible("orderNumber") && React.createElement(table_1.TableCell, { className: "font-medium" }, order.orderNumber),
                                    isVisible("supplier") && React.createElement(table_1.TableCell, null, order.supplierName),
                                    isVisible("amount") && React.createElement(table_1.TableCell, { className: "text-right" }, formatMoney(order.totalAmount || 0)),
                                    isVisible("deliveryDate") && React.createElement(table_1.TableCell, null, order.deliveryDate || "N/A"),
                                    isVisible("deliveryAddress") && React.createElement(table_1.TableCell, { className: "max-w-xs truncate" }, order.deliveryAddress || "N/A"),
                                    isVisible("status") && React.createElement(table_1.TableCell, null,
                                        React.createElement(badge_1.Badge, { className: getStatusColor(order.status) }, (_a = order.status) === null || _a === void 0 ? void 0 : _a.toUpperCase())),
                                    React.createElement(table_1.TableCell, { className: "text-right" },
                                        React.createElement(RowActionsMenu_1.RowActionsMenu, { primaryActions: [
                                                { label: "View Details", icon: RowActionsMenu_1.actionIcons.view, onClick: function () { return navigate("/orders/" + order.id); } },
                                                { label: "Delete", icon: RowActionsMenu_1.actionIcons["delete"], onClick: function () { if (confirm("Delete this order?"))
                                                        deleteMutation.mutate(order.id); }, variant: "destructive" },
                                            ], menuActions: [
                                                { label: "Duplicate Order", icon: RowActionsMenu_1.actionIcons.copy, onClick: function () {
                                                        createMutation.mutate({ orderNumber: order.orderNumber + "-COPY", supplierId: order.supplierId || '', supplierName: order.supplierName || '', description: order.description || '', items: [], totalAmount: order.totalAmount || 0, status: 'draft', deliveryAddress: order.deliveryAddress || '' });
                                                    } },
                                                { label: "Download PDF", icon: RowActionsMenu_1.actionIcons.download, onClick: function () { setViewOrder(order); setTimeout(function () { return window.print(); }, 300); }, separator: true },
                                                { label: "Update Status", icon: React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" }), onClick: function () {
                                                        var status = prompt("Enter status (draft, sent, confirmed, delivered, invoiced):", order.status);
                                                        if (status && ['draft', 'sent', 'confirmed', 'delivered', 'invoiced'].includes(status))
                                                            updateMutation.mutate({ id: order.id, status: status });
                                                    } },
                                            ] }))));
                            }))))))),
            React.createElement(dialog_1.Dialog, { open: isCreateOpen, onOpenChange: setIsCreateOpen },
                React.createElement(dialog_1.DialogContent, { className: "max-w-2xl max-h-[85vh] overflow-y-auto" },
                    React.createElement(dialog_1.DialogHeader, null,
                        React.createElement(dialog_1.DialogTitle, null, "Create New Purchase Order"),
                        React.createElement(dialog_1.DialogDescription, null, "Fill in the details to create a new purchase order")),
                    React.createElement("div", { className: "space-y-6" },
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, { className: "pb-4" },
                                React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                                    React.createElement(lucide_react_1.Building2, { className: "w-4 h-4 text-blue-600" }),
                                    "Order Identification")),
                            React.createElement(card_1.CardContent, null,
                                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, { htmlFor: "orderNumber" }, "Order Number *"),
                                        React.createElement(input_1.Input, { id: "orderNumber", name: "orderNumber", value: formData.orderNumber, onChange: handleInputChange, placeholder: "e.g., PO-2026-001" })),
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, { htmlFor: "supplierId" }, "Select Supplier *"),
                                        React.createElement(select_1.Select, { value: formData.supplierId, onValueChange: handleSupplierSelect },
                                            React.createElement(select_1.SelectTrigger, { id: "supplierId" },
                                                React.createElement(select_1.SelectValue, { placeholder: "Select a supplier" })),
                                            React.createElement(select_1.SelectContent, null, suppliers.map(function (supplier) { return (React.createElement(select_1.SelectItem, { key: supplier.id, value: supplier.id }, supplier.companyName)); }))))))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, { className: "pb-4" },
                                React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                                    React.createElement(lucide_react_1.Coins, { className: "w-4 h-4 text-green-600" }),
                                    "Financial & Schedule")),
                            React.createElement(card_1.CardContent, { className: "space-y-4" },
                                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, { htmlFor: "totalAmount" }, "Total Amount (KES) *"),
                                        React.createElement("div", { className: "relative" },
                                            React.createElement(lucide_react_1.Coins, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }),
                                            React.createElement(input_1.Input, { id: "totalAmount", name: "totalAmount", type: "number", value: formData.totalAmount, onChange: handleInputChange, placeholder: "0.00", step: "0.01", className: "pl-8" }))),
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, { htmlFor: "poDate" }, "PO Date"),
                                        React.createElement(input_1.Input, { id: "poDate", name: "poDate", type: "date", value: formData.poDate, onChange: handleInputChange }))),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "status" }, "Status"),
                                    React.createElement(select_1.Select, { value: formData.status, onValueChange: function (val) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { status: val })); }); } },
                                        React.createElement(select_1.SelectTrigger, { id: "status" },
                                            React.createElement(select_1.SelectValue, { placeholder: "Select status" })),
                                        React.createElement(select_1.SelectContent, null,
                                            React.createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                                            React.createElement(select_1.SelectItem, { value: "sent" }, "Sent"),
                                            React.createElement(select_1.SelectItem, { value: "confirmed" }, "Confirmed"),
                                            React.createElement(select_1.SelectItem, { value: "delivered" }, "Delivered"),
                                            React.createElement(select_1.SelectItem, { value: "invoiced" }, "Invoiced")))))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, { className: "pb-4" },
                                React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                                    React.createElement(lucide_react_1.Truck, { className: "w-4 h-4 text-orange-600" }),
                                    "Delivery Details")),
                            React.createElement(card_1.CardContent, null,
                                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, { htmlFor: "deliveryDate" }, "Delivery Date"),
                                        React.createElement(input_1.Input, { id: "deliveryDate", name: "deliveryDate", type: "date", value: formData.deliveryDate, onChange: handleInputChange })),
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, { htmlFor: "deliveryAddress" }, "Delivery Address *"),
                                        React.createElement("div", { className: "relative" },
                                            React.createElement(lucide_react_1.MapPin, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }),
                                            React.createElement(input_1.Input, { id: "deliveryAddress", name: "deliveryAddress", value: formData.deliveryAddress, onChange: handleInputChange, placeholder: "e.g., Warehouse 1, Nairobi", className: "pl-8" })))))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, { className: "pb-4" },
                                React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                                    React.createElement(lucide_react_1.StickyNote, { className: "w-4 h-4 text-purple-600" }),
                                    "Description & Notes")),
                            React.createElement(card_1.CardContent, { className: "space-y-4" },
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "description" }, "Description / Items"),
                                    React.createElement(RichTextEditor_1.RichTextEditor, { value: formData.description, onChange: function (html) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { description: html })); }); }, placeholder: "List items or services included in this order", minHeight: "100px" })),
                                React.createElement(separator_1.Separator, null),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "notes" }, "Notes"),
                                    React.createElement(RichTextEditor_1.RichTextEditor, { value: formData.notes, onChange: function (html) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { notes: html })); }); }, placeholder: "Additional notes or special instructions", minHeight: "80px" }))))),
                    React.createElement("div", { className: "flex justify-end gap-3 pt-2" },
                        React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setIsCreateOpen(false); } }, "Cancel"),
                        React.createElement(button_1.Button, { onClick: handleCreateOrder, disabled: createMutation.isPending }, createMutation.isPending ? "Creating..." : "Create Order")))),
            React.createElement(dialog_1.Dialog, { open: !!viewOrder, onOpenChange: function (open) { return !open && setViewOrder(null); } },
                React.createElement(dialog_1.DialogContent, { className: "max-w-lg" },
                    React.createElement(dialog_1.DialogHeader, null,
                        React.createElement(dialog_1.DialogTitle, null, "Order Details")),
                    viewOrder && (React.createElement("div", { className: "space-y-3 text-sm" },
                        React.createElement("div", { className: "grid grid-cols-2 gap-2" },
                            React.createElement("div", null,
                                React.createElement("span", { className: "font-medium" }, "Order #:"),
                                " ",
                                viewOrder.orderNumber),
                            React.createElement("div", null,
                                React.createElement("span", { className: "font-medium" }, "Status:"),
                                " ",
                                React.createElement(badge_1.Badge, { className: getStatusColor(viewOrder.status) }, (_a = viewOrder.status) === null || _a === void 0 ? void 0 : _a.toUpperCase())),
                            React.createElement("div", null,
                                React.createElement("span", { className: "font-medium" }, "Supplier:"),
                                " ",
                                viewOrder.supplierName),
                            React.createElement("div", null,
                                React.createElement("span", { className: "font-medium" }, "Amount:"),
                                " ",
                                formatMoney(viewOrder.totalAmount || 0)),
                            React.createElement("div", null,
                                React.createElement("span", { className: "font-medium" }, "PO Date:"),
                                " ",
                                viewOrder.poDate || "N/A"),
                            React.createElement("div", null,
                                React.createElement("span", { className: "font-medium" }, "Delivery:"),
                                " ",
                                viewOrder.deliveryDate || "N/A")),
                        viewOrder.deliveryAddress && React.createElement("div", null,
                            React.createElement("span", { className: "font-medium" }, "Address:"),
                            " ",
                            viewOrder.deliveryAddress),
                        viewOrder.description && React.createElement("div", null,
                            React.createElement("span", { className: "font-medium" }, "Description:"),
                            " ",
                            viewOrder.description),
                        viewOrder.notes && React.createElement("div", null,
                            React.createElement("span", { className: "font-medium" }, "Notes:"),
                            " ",
                            viewOrder.notes))))))));
}
exports["default"] = OrdersPage;
