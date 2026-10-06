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
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var spinner_1 = require("@/components/ui/spinner");
function EditOrder() {
    var _this = this;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var orderId = new URLSearchParams(window.location.search).get("id") || "";
    var _b = react_1.useState(""), orderNumber = _b[0], setOrderNumber = _b[1];
    var _c = react_1.useState(""), vendorId = _c[0], setVendorId = _c[1];
    var _d = react_1.useState(""), orderDate = _d[0], setOrderDate = _d[1];
    var _e = react_1.useState(""), dueDate = _e[0], setDueDate = _e[1];
    var _f = react_1.useState("draft"), status = _f[0], setStatus = _f[1];
    var _g = react_1.useState(""), notes = _g[0], setNotes = _g[1];
    var _h = react_1.useState([]), lineItems = _h[0], setLineItems = _h[1];
    var _j = react_1.useState(false), isLoading = _j[0], setIsLoading = _j[1];
    var _k = trpc_1.trpc.suppliers.list.useQuery().data, rawSuppliers = _k === void 0 ? [] : _k;
    var suppliers = JSON.parse(JSON.stringify(rawSuppliers));
    var _l = trpc_1.trpc.lpo.getById.useQuery(orderId, { enabled: !!orderId }), rawOrder = _l.data, isFetching = _l.isLoading;
    var order = rawOrder ? JSON.parse(JSON.stringify(rawOrder)) : null;
    var updateMutation = trpc_1.trpc.lpo.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Purchase order updated successfully");
            navigate("/procurement");
        },
        onError: function () { return sonner_1.toast.error("Failed to update purchase order"); }
    });
    react_1.useEffect(function () {
        if (order) {
            setOrderNumber(order.lpoNumber || "");
            setVendorId(order.vendorId || "");
            setStatus(order.status || "draft");
            setNotes(order.description || "");
        }
    }, [order]);
    var handleAddLineItem = function () {
        var newItem = {
            id: String(Date.now()),
            description: "",
            quantity: 1,
            unitPrice: 0,
            total: 0
        };
        setLineItems(__spreadArrays(lineItems, [newItem]));
    };
    var handleRemoveLineItem = function (id) {
        if (lineItems.length > 1) {
            setLineItems(lineItems.filter(function (item) { return item.id !== id; }));
        }
        else {
            sonner_1.toast.error("Order must have at least one line item");
        }
    };
    var handleUpdateLineItem = function (id, field, value) {
        var updatedItems = lineItems.map(function (item) {
            var _a;
            if (item.id === id) {
                var updated = __assign(__assign({}, item), (_a = {}, _a[field] = value, _a));
                if (field === "quantity" || field === "unitPrice") {
                    updated.total = (updated.quantity || 0) * (updated.unitPrice || 0);
                }
                return updated;
            }
            return item;
        });
        setLineItems(updatedItems);
    };
    var getTotalAmount = function () {
        return lineItems.reduce(function (sum, item) { return sum + (item.total || 0); }, 0);
    };
    var handleSave = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!orderNumber.trim()) {
                        sonner_1.toast.error("Order number is required");
                        return [2 /*return*/];
                    }
                    if (!vendorId) {
                        sonner_1.toast.error("Please select a vendor");
                        return [2 /*return*/];
                    }
                    if (lineItems.some(function (item) { return !item.description; })) {
                        sonner_1.toast.error("All line items must have a description");
                        return [2 /*return*/];
                    }
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, updateMutation.mutateAsync({
                            id: orderId,
                            status: status,
                            description: notes || undefined,
                            amount: getTotalAmount() > 0 ? getTotalAmount() : undefined
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    if (isFetching) {
        return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Purchase Order", description: "Modify purchase order details", breadcrumbs: [
                { label: "Dashboard", href: "/crm-home" },
                { label: "Procurement", href: "/procurement" },
                { label: "Orders", href: "/orders" },
                { label: "Edit Order" },
            ] },
            react_1["default"].createElement("div", { className: "flex items-center justify-center h-screen" },
                react_1["default"].createElement(spinner_1.Spinner, { className: "size-8" }))));
    }
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Purchase Order", description: "Modify purchase order details and line items", breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Procurement", href: "/procurement" },
            { label: "Orders", href: "/orders" },
            { label: "Edit Order" },
        ] },
        react_1["default"].createElement("div", { className: "space-y-6 max-w-5xl" },
            react_1["default"].createElement("div", { className: "flex items-center gap-4" },
                react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return navigate("/orders"); }, className: "gap-2" },
                    react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "w-4 h-4" }),
                    "Back")),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, null, "Order Details")),
                react_1["default"].createElement(card_1.CardContent, { className: "space-y-6" },
                    react_1["default"].createElement("div", { className: "grid md:grid-cols-2 gap-4" },
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "orderNumber" }, "Order Number *"),
                            react_1["default"].createElement(input_1.Input, { id: "orderNumber", value: orderNumber, onChange: function (e) { return setOrderNumber(e.target.value); }, placeholder: "e.g., PO-2024-001" })),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "vendor" }, "Vendor *"),
                            react_1["default"].createElement(select_1.Select, { value: vendorId, onValueChange: setVendorId },
                                react_1["default"].createElement(select_1.SelectTrigger, { id: "vendor" },
                                    react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select vendor" })),
                                react_1["default"].createElement(select_1.SelectContent, null, suppliers.map(function (supplier) { return (react_1["default"].createElement(select_1.SelectItem, { key: supplier.id, value: supplier.id }, supplier.name || supplier.companyName)); })))),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "orderDate" }, "Order Date"),
                            react_1["default"].createElement(input_1.Input, { id: "orderDate", type: "date", value: orderDate, onChange: function (e) { return setOrderDate(e.target.value); } })),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "dueDate" }, "Due Date"),
                            react_1["default"].createElement(input_1.Input, { id: "dueDate", type: "date", value: dueDate, onChange: function (e) { return setDueDate(e.target.value); } })),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "status" }, "Status"),
                            react_1["default"].createElement(select_1.Select, { value: status, onValueChange: setStatus },
                                react_1["default"].createElement(select_1.SelectTrigger, { id: "status" },
                                    react_1["default"].createElement(select_1.SelectValue, null)),
                                react_1["default"].createElement(select_1.SelectContent, null,
                                    react_1["default"].createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "sent" }, "Sent"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "confirmed" }, "Confirmed"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "received" }, "Received"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "cancelled" }, "Cancelled"))))),
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement(label_1.Label, { htmlFor: "notes" }, "Notes"),
                        react_1["default"].createElement(textarea_1.Textarea, { id: "notes", value: notes, onChange: function (e) { return setNotes(e.target.value); }, placeholder: "Additional notes or special instructions", rows: 3 })))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between" },
                    react_1["default"].createElement(card_1.CardTitle, null, "Line Items"),
                    react_1["default"].createElement(button_1.Button, { size: "sm", onClick: handleAddLineItem, variant: "outline" },
                        react_1["default"].createElement(lucide_react_1.Plus, { className: "w-4 h-4 mr-2" }),
                        "Add Item")),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("div", { className: "space-y-4" }, lineItems.map(function (item) { return (react_1["default"].createElement("div", { key: item.id, className: "grid md:grid-cols-5 gap-4 p-4 border rounded-lg" },
                        react_1["default"].createElement("div", { className: "space-y-2 md:col-span-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "desc-" + item.id }, "Description"),
                            react_1["default"].createElement(input_1.Input, { id: "desc-" + item.id, value: item.description, onChange: function (e) {
                                    return handleUpdateLineItem(item.id, "description", e.target.value);
                                }, placeholder: "Item description" })),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "qty-" + item.id }, "Quantity"),
                            react_1["default"].createElement(input_1.Input, { id: "qty-" + item.id, type: "number", value: item.quantity, onChange: function (e) {
                                    return handleUpdateLineItem(item.id, "quantity", Number(e.target.value));
                                }, min: "1" })),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "price-" + item.id }, "Unit Price"),
                            react_1["default"].createElement(input_1.Input, { id: "price-" + item.id, type: "number", value: item.unitPrice, onChange: function (e) {
                                    return handleUpdateLineItem(item.id, "unitPrice", Number(e.target.value));
                                }, min: "0", step: "0.01" })),
                        react_1["default"].createElement("div", { className: "space-y-2 flex flex-col justify-end" },
                            react_1["default"].createElement("div", { className: "text-sm font-semibold" },
                                "Total: KES ",
                                item.total.toFixed(2)),
                            react_1["default"].createElement(button_1.Button, { size: "sm", variant: "destructive", onClick: function () { return handleRemoveLineItem(item.id); } },
                                react_1["default"].createElement(lucide_react_1.Trash2, { className: "w-4 h-4" }))))); })),
                    react_1["default"].createElement("div", { className: "mt-6 pt-4 border-t" },
                        react_1["default"].createElement("div", { className: "flex justify-end" },
                            react_1["default"].createElement("div", { className: "text-right" },
                                react_1["default"].createElement("p", { className: "text-gray-600 mb-2" }, "Order Total"),
                                react_1["default"].createElement("p", { className: "text-3xl font-bold text-blue-600" },
                                    "KES ",
                                    getTotalAmount().toFixed(2))))))),
            react_1["default"].createElement("div", { className: "flex gap-4 justify-end" },
                react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return navigate("/orders"); }, disabled: isLoading }, "Cancel"),
                react_1["default"].createElement(button_1.Button, { onClick: handleSave, disabled: isLoading }, isLoading ? (react_1["default"].createElement(react_1["default"].Fragment, null,
                    react_1["default"].createElement(lucide_react_1.Loader2, { className: "w-4 h-4 mr-2 animate-spin" }),
                    "Saving...")) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                    react_1["default"].createElement(lucide_react_1.SaveIcon, { className: "w-4 h-4 mr-2" }),
                    "Update Order")))))));
}
exports["default"] = EditOrder;
