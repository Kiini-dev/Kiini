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
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var dialog_1 = require("@/components/ui/dialog");
var textarea_1 = require("@/components/ui/textarea");
var lucide_react_1 = require("lucide-react");
function ProcurementOrdersPage() {
    var _this = this;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = react_1.useState(''), searchTerm = _b[0], setSearchTerm = _b[1];
    var _c = react_1.useState('__all__'), statusFilter = _c[0], setStatusFilter = _c[1];
    var _d = react_1.useState(false), createDialogOpen = _d[0], setCreateDialogOpen = _d[1];
    var _e = react_1.useState(null), editingId = _e[0], setEditingId = _e[1];
    var _f = react_1.useState(null), selectedOrder = _f[0], setSelectedOrder = _f[1];
    var _g = react_1.useState(false), viewDialogOpen = _g[0], setViewDialogOpen = _g[1];
    var _h = react_1.useState({
        supplierId: '',
        supplierName: '',
        description: '',
        items: [],
        totalAmount: 0,
        deliveryAddress: '',
        expectedDelivery: '',
        paymentTerms: '',
        status: 'draft'
    }), formData = _h[0], setFormData = _h[1];
    // Fetch orders
    var _j = trpc_1.trpc.procurementMgmt.orderList.useQuery({
        search: searchTerm,
        status: statusFilter === '__all__' ? undefined : statusFilter || undefined,
        limit: 100
    }), _k = _j.data, orders = _k === void 0 ? [] : _k, isLoading = _j.isLoading, refetch = _j.refetch;
    // Create mutation
    var createMutation = trpc_1.trpc.procurementMgmt.orderCreate.useMutation({
        onSuccess: function () {
            sonner_1.toast.success('Purchase order created successfully');
            refetch();
            setCreateDialogOpen(false);
            resetForm();
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to create order: " + error.message);
        }
    });
    // Update mutation
    var updateMutation = trpc_1.trpc.procurementMgmt.orderUpdate.useMutation({
        onSuccess: function () {
            sonner_1.toast.success('Purchase order updated successfully');
            refetch();
            setEditingId(null);
            resetForm();
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to update order: " + error.message);
        }
    });
    // Delete mutation
    var deleteMutation = trpc_1.trpc.procurementMgmt.orderDelete.useMutation({
        onSuccess: function () {
            sonner_1.toast.success('Purchase order deleted successfully');
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to delete order: " + error.message);
        }
    });
    var resetForm = function () {
        setFormData({
            supplierId: '',
            supplierName: '',
            description: '',
            items: [],
            totalAmount: 0,
            deliveryAddress: '',
            expectedDelivery: '',
            paymentTerms: '',
            status: 'draft'
        });
    };
    var handleAddItem = function () {
        setFormData(function (prev) { return (__assign(__assign({}, prev), { items: __spreadArrays(prev.items, [{ description: '', quantity: 0, unitPrice: 0, amount: 0 }]) })); });
    };
    var handleRemoveItem = function (index) {
        setFormData(function (prev) { return (__assign(__assign({}, prev), { items: prev.items.filter(function (_, i) { return i !== index; }) })); });
    };
    var handleItemChange = function (index, field, value) {
        setFormData(function (prev) {
            var newItems = __spreadArrays(prev.items);
            newItems[index][field] = value;
            if (field === 'quantity' || field === 'unitPrice') {
                newItems[index].amount = newItems[index].quantity * newItems[index].unitPrice;
            }
            var total = newItems.reduce(function (sum, item) { return sum + item.amount; }, 0);
            return __assign(__assign({}, prev), { items: newItems, totalAmount: total });
        });
    };
    var handleSave = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!formData.supplierName || formData.items.length === 0) {
                        sonner_1.toast.error('Please fill in supplier name and add at least one item');
                        return [2 /*return*/];
                    }
                    if (!editingId) return [3 /*break*/, 2];
                    return [4 /*yield*/, updateMutation.mutateAsync({
                            id: editingId,
                            supplierName: formData.supplierName,
                            description: formData.description,
                            items: formData.items,
                            totalAmount: formData.totalAmount,
                            status: formData.status,
                            expectedDelivery: formData.expectedDelivery
                        })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, createMutation.mutateAsync({
                        supplierId: formData.supplierId,
                        supplierName: formData.supplierName,
                        description: formData.description,
                        items: formData.items,
                        totalAmount: formData.totalAmount,
                        deliveryAddress: formData.deliveryAddress,
                        expectedDelivery: formData.expectedDelivery,
                        paymentTerms: formData.paymentTerms,
                        status: formData.status
                    })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var getStatusColor = function (status) {
        var colors = {
            draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100',
            sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
            confirmed: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
            delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
            invoiced: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };
    // Calculate statistics
    var stats = {
        total: orders.length,
        totalValue: orders.reduce(function (sum, o) { return sum + (o.totalAmount || 0); }, 0),
        deliveredCount: orders.filter(function (o) { return o.status === 'delivered'; }).length,
        pendingCount: orders.filter(function (o) { return ['draft', 'sent'].includes(o.status); }).length
    };
    return (react_1["default"].createElement("div", { className: "space-y-6 p-6" },
        react_1["default"].createElement("div", null,
            react_1["default"].createElement("h1", { className: "text-3xl font-bold" }, "Purchase Orders"),
            react_1["default"].createElement("p", { className: "text-gray-500 dark:text-gray-400 mt-1" }, "Create and manage purchase orders with suppliers")),
        react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" },
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-6" },
                    react_1["default"].createElement("div", { className: "text-center" },
                        react_1["default"].createElement("p", { className: "text-sm text-gray-500" }, "Total Orders"),
                        react_1["default"].createElement("p", { className: "text-3xl font-bold" }, stats.total)))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-6" },
                    react_1["default"].createElement("div", { className: "text-center" },
                        react_1["default"].createElement("p", { className: "text-sm text-gray-500" }, "Total Value"),
                        react_1["default"].createElement("p", { className: "text-2xl font-bold" },
                            "KES ",
                            (stats.totalValue / 100).toLocaleString())))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-6" },
                    react_1["default"].createElement("div", { className: "text-center" },
                        react_1["default"].createElement("p", { className: "text-sm text-gray-500" }, "Pending"),
                        react_1["default"].createElement("p", { className: "text-3xl font-bold text-blue-600" }, stats.pendingCount)))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "pt-6" },
                    react_1["default"].createElement("div", { className: "text-center" },
                        react_1["default"].createElement("p", { className: "text-sm text-gray-500" }, "Delivered"),
                        react_1["default"].createElement("p", { className: "text-3xl font-bold text-green-600" }, stats.deliveredCount))))),
        react_1["default"].createElement(card_1.Card, null,
            react_1["default"].createElement(card_1.CardHeader, null,
                react_1["default"].createElement(card_1.CardTitle, { className: "text-lg" }, "Search & Filter")),
            react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" },
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement(label_1.Label, { htmlFor: "search" }, "Search Orders"),
                        react_1["default"].createElement(input_1.Input, { id: "search", placeholder: "Search by supplier or order #", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); } })),
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement(label_1.Label, { htmlFor: "status" }, "Status"),
                        react_1["default"].createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                            react_1["default"].createElement(select_1.SelectTrigger, { id: "status" },
                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "All statuses" })),
                            react_1["default"].createElement(select_1.SelectContent, null,
                                react_1["default"].createElement(select_1.SelectItem, { value: "__all__" }, "All statuses"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "sent" }, "Sent"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "confirmed" }, "Confirmed"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "delivered" }, "Delivered"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "invoiced" }, "Invoiced")))),
                    react_1["default"].createElement("div", { className: "flex items-end gap-2" },
                        react_1["default"].createElement(button_1.Button, { onClick: function () { return setCreateDialogOpen(true); }, className: "flex-1" },
                            react_1["default"].createElement(lucide_react_1.Plus, { className: "w-4 h-4 mr-2" }),
                            "New Order"))))),
        react_1["default"].createElement(card_1.Card, null,
            react_1["default"].createElement(card_1.CardHeader, null,
                react_1["default"].createElement(card_1.CardTitle, null, "Purchase Orders"),
                react_1["default"].createElement(card_1.CardDescription, null,
                    orders.length,
                    " records found")),
            react_1["default"].createElement(card_1.CardContent, null, isLoading ? (react_1["default"].createElement("div", { className: "flex items-center justify-center py-8" },
                react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin" }))) : orders.length > 0 ? (react_1["default"].createElement("div", { className: "overflow-x-auto" },
                react_1["default"].createElement(table_1.Table, null,
                    react_1["default"].createElement(table_1.TableHeader, null,
                        react_1["default"].createElement(table_1.TableRow, null,
                            react_1["default"].createElement(table_1.TableHead, null, "Order #"),
                            react_1["default"].createElement(table_1.TableHead, null, "Supplier"),
                            react_1["default"].createElement(table_1.TableHead, null, "Description"),
                            react_1["default"].createElement(table_1.TableHead, { className: "text-right" }, "Amount"),
                            react_1["default"].createElement(table_1.TableHead, null, "Status"),
                            react_1["default"].createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                    react_1["default"].createElement(table_1.TableBody, null, orders.map(function (order) { return (react_1["default"].createElement(table_1.TableRow, { key: order.id },
                        react_1["default"].createElement(table_1.TableCell, { className: "font-mono font-semibold" }, order.orderNumber),
                        react_1["default"].createElement(table_1.TableCell, null, order.supplierName),
                        react_1["default"].createElement(table_1.TableCell, { className: "max-w-xs truncate" }, order.description),
                        react_1["default"].createElement(table_1.TableCell, { className: "text-right font-semibold" },
                            "KES ",
                            ((order.totalAmount || 0) / 100).toLocaleString()),
                        react_1["default"].createElement(table_1.TableCell, null,
                            react_1["default"].createElement(badge_1.Badge, { className: getStatusColor(order.status) }, order.status)),
                        react_1["default"].createElement(table_1.TableCell, { className: "text-right space-x-2" },
                            react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () {
                                    setSelectedOrder(order);
                                    setViewDialogOpen(true);
                                } },
                                react_1["default"].createElement(lucide_react_1.Eye, { className: "w-4 h-4" })),
                            order.status === 'draft' && (react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () {
                                    setEditingId(order.id);
                                    setFormData({
                                        supplierId: order.supplierId || '',
                                        supplierName: order.supplierName,
                                        description: order.description,
                                        items: order.items || [],
                                        totalAmount: order.totalAmount,
                                        deliveryAddress: order.deliveryAddress || '',
                                        expectedDelivery: order.expectedDelivery || '',
                                        paymentTerms: order.paymentTerms || '',
                                        status: order.status
                                    });
                                    setCreateDialogOpen(true);
                                } },
                                react_1["default"].createElement(lucide_react_1.Edit2, { className: "w-4 h-4" }))),
                            react_1["default"].createElement(button_1.Button, { size: "sm", variant: "destructive", onClick: function () {
                                    if (confirm('Are you sure you want to delete this order?')) {
                                        deleteMutation.mutate(order.id);
                                    }
                                }, disabled: deleteMutation.isPending },
                                react_1["default"].createElement(lucide_react_1.Trash2, { className: "w-4 h-4" }))))); }))))) : (react_1["default"].createElement("div", { className: "text-center py-8 text-gray-500" }, "No purchase orders found. Create one to get started.")))),
        react_1["default"].createElement(dialog_1.Dialog, { open: createDialogOpen, onOpenChange: setCreateDialogOpen },
            react_1["default"].createElement(dialog_1.DialogContent, { className: "max-w-2xl" },
                react_1["default"].createElement(dialog_1.DialogHeader, null,
                    react_1["default"].createElement(dialog_1.DialogTitle, null, editingId ? 'Edit Purchase Order' : 'Create New Purchase Order')),
                react_1["default"].createElement("div", { className: "space-y-4" },
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "supplier" }, "Supplier Name *"),
                            react_1["default"].createElement(input_1.Input, { id: "supplier", value: formData.supplierName, onChange: function (e) {
                                    return setFormData(function (prev) { return (__assign(__assign({}, prev), { supplierName: e.target.value })); });
                                }, placeholder: "Enter supplier name" })),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "supplierId" }, "Supplier ID"),
                            react_1["default"].createElement(input_1.Input, { id: "supplierId", value: formData.supplierId, onChange: function (e) {
                                    return setFormData(function (prev) { return (__assign(__assign({}, prev), { supplierId: e.target.value })); });
                                }, placeholder: "Optional supplier ID" }))),
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement(label_1.Label, { htmlFor: "description" }, "Description *"),
                        react_1["default"].createElement(textarea_1.Textarea, { id: "description", value: formData.description, onChange: function (e) {
                                return setFormData(function (prev) { return (__assign(__assign({}, prev), { description: e.target.value })); });
                            }, placeholder: "Describe the purchase", rows: 2 })),
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement(label_1.Label, { htmlFor: "deliveryAddress" }, "Delivery Address"),
                        react_1["default"].createElement(textarea_1.Textarea, { id: "deliveryAddress", value: formData.deliveryAddress, onChange: function (e) {
                                return setFormData(function (prev) { return (__assign(__assign({}, prev), { deliveryAddress: e.target.value })); });
                            }, placeholder: "Full delivery address", rows: 2 })),
                    react_1["default"].createElement("div", { className: "space-y-3" },
                        react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                            react_1["default"].createElement(label_1.Label, null, "Items *"),
                            react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", onClick: handleAddItem },
                                react_1["default"].createElement(lucide_react_1.Plus, { className: "w-4 h-4 mr-1" }),
                                "Add Item")),
                        react_1["default"].createElement("div", { className: "border rounded-lg overflow-hidden" },
                            react_1["default"].createElement(table_1.Table, null,
                                react_1["default"].createElement(table_1.TableHeader, null,
                                    react_1["default"].createElement(table_1.TableRow, null,
                                        react_1["default"].createElement(table_1.TableHead, null, "Description"),
                                        react_1["default"].createElement(table_1.TableHead, { className: "w-[80px]" }, "Qty"),
                                        react_1["default"].createElement(table_1.TableHead, { className: "w-[100px]" }, "Unit Price"),
                                        react_1["default"].createElement(table_1.TableHead, { className: "w-[100px]" }, "Amount"),
                                        react_1["default"].createElement(table_1.TableHead, { className: "w-[50px]" }))),
                                react_1["default"].createElement(table_1.TableBody, null, formData.items.map(function (item, idx) { return (react_1["default"].createElement(table_1.TableRow, { key: idx },
                                    react_1["default"].createElement(table_1.TableCell, null,
                                        react_1["default"].createElement(input_1.Input, { value: item.description, onChange: function (e) {
                                                return handleItemChange(idx, 'description', e.target.value);
                                            }, placeholder: "Item description", className: "text-xs" })),
                                    react_1["default"].createElement(table_1.TableCell, null,
                                        react_1["default"].createElement(input_1.Input, { type: "number", value: item.quantity, onChange: function (e) {
                                                return handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0);
                                            }, placeholder: "0", className: "text-xs" })),
                                    react_1["default"].createElement(table_1.TableCell, null,
                                        react_1["default"].createElement(input_1.Input, { type: "number", value: item.unitPrice, onChange: function (e) {
                                                return handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0);
                                            }, placeholder: "0", className: "text-xs" })),
                                    react_1["default"].createElement(table_1.TableCell, { className: "text-sm font-semibold" },
                                        "KES ",
                                        (item.amount).toLocaleString()),
                                    react_1["default"].createElement(table_1.TableCell, null,
                                        react_1["default"].createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: function () { return handleRemoveItem(idx); } },
                                            react_1["default"].createElement(lucide_react_1.Trash2, { className: "w-4 h-4" }))))); })))),
                        react_1["default"].createElement("div", { className: "bg-gray-50 p-3 rounded text-right" },
                            react_1["default"].createElement("span", { className: "font-semibold" },
                                "Total: KES ",
                                (formData.totalAmount).toLocaleString()))),
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "delivery" }, "Expected Delivery"),
                            react_1["default"].createElement(input_1.Input, { id: "delivery", type: "date", value: formData.expectedDelivery, onChange: function (e) {
                                    return setFormData(function (prev) { return (__assign(__assign({}, prev), { expectedDelivery: e.target.value })); });
                                } })),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "terms" }, "Payment Terms"),
                            react_1["default"].createElement(input_1.Input, { id: "terms", value: formData.paymentTerms, onChange: function (e) {
                                    return setFormData(function (prev) { return (__assign(__assign({}, prev), { paymentTerms: e.target.value })); });
                                }, placeholder: "e.g., Net 30" })))),
                react_1["default"].createElement(dialog_1.DialogFooter, null,
                    react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () {
                            setCreateDialogOpen(false);
                            setEditingId(null);
                            resetForm();
                        } }, "Cancel"),
                    react_1["default"].createElement(button_1.Button, { onClick: handleSave, disabled: createMutation.isPending || updateMutation.isPending }, createMutation.isPending || updateMutation.isPending ? (react_1["default"].createElement(react_1["default"].Fragment, null,
                        react_1["default"].createElement(lucide_react_1.Loader2, { className: "w-4 h-4 mr-2 animate-spin" }),
                        "Saving...")) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                        react_1["default"].createElement(lucide_react_1.CheckCircle2, { className: "w-4 h-4 mr-2" }),
                        "Save Order")))))),
        react_1["default"].createElement(dialog_1.Dialog, { open: viewDialogOpen, onOpenChange: setViewDialogOpen },
            react_1["default"].createElement(dialog_1.DialogContent, null,
                react_1["default"].createElement(dialog_1.DialogHeader, null,
                    react_1["default"].createElement(dialog_1.DialogTitle, null, "Purchase Order Details")),
                selectedOrder && (react_1["default"].createElement("div", { className: "space-y-4" },
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("p", { className: "text-sm text-gray-500" }, "Order Number"),
                            react_1["default"].createElement("p", { className: "font-mono font-semibold" }, selectedOrder.orderNumber)),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("p", { className: "text-sm text-gray-500" }, "Status"),
                            react_1["default"].createElement(badge_1.Badge, { className: getStatusColor(selectedOrder.status) }, selectedOrder.status))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "text-sm text-gray-500" }, "Supplier"),
                        react_1["default"].createElement("p", { className: "font-semibold" }, selectedOrder.supplierName)),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "text-sm text-gray-500" }, "Description"),
                        react_1["default"].createElement("p", null, selectedOrder.description)),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "text-sm text-gray-500" }, "Delivery Address"),
                        react_1["default"].createElement("p", { className: "font-semibold whitespace-pre-wrap" }, selectedOrder.deliveryAddress)),
                    selectedOrder.items && (react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "text-sm text-gray-500 mb-2" }, "Items"),
                        react_1["default"].createElement(table_1.Table, null,
                            react_1["default"].createElement(table_1.TableHeader, null,
                                react_1["default"].createElement(table_1.TableRow, null,
                                    react_1["default"].createElement(table_1.TableHead, null, "Description"),
                                    react_1["default"].createElement(table_1.TableHead, null, "Qty"),
                                    react_1["default"].createElement(table_1.TableHead, null, "Unit Price"),
                                    react_1["default"].createElement(table_1.TableHead, null, "Amount"))),
                            react_1["default"].createElement(table_1.TableBody, null, selectedOrder.items.map(function (item, idx) { return (react_1["default"].createElement(table_1.TableRow, { key: lineItem.id || "line-" + idx },
                                react_1["default"].createElement(table_1.TableCell, null, item.description),
                                react_1["default"].createElement(table_1.TableCell, null, item.quantity),
                                react_1["default"].createElement(table_1.TableCell, null,
                                    "KES ",
                                    (item.unitPrice).toLocaleString()),
                                react_1["default"].createElement(table_1.TableCell, null,
                                    "KES ",
                                    (item.amount).toLocaleString()))); }))))),
                    react_1["default"].createElement("div", { className: "bg-gray-50 p-3 rounded text-right" },
                        react_1["default"].createElement("span", { className: "font-semibold" },
                            "Total: KES ",
                            ((selectedOrder.totalAmount || 0) / 100).toLocaleString()))))))));
}
exports["default"] = ProcurementOrdersPage;
