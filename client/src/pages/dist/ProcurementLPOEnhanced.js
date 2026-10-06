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
var useAuth_1 = require("@/_core/hooks/useAuth");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var STATUS_COLORS = {
    draft: "bg-gray-100 text-gray-800",
    approved: "bg-green-100 text-green-800",
    sent: "bg-blue-100 text-blue-800",
    partially_received: "bg-yellow-100 text-yellow-800",
    received: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    closed: "bg-gray-100 text-gray-800"
};
function ProcurementLPOEnhancedPage() {
    var _this = this;
    var _a = permissions_1.useRequireFeature("procurement:lpo:view"), allowed = _a.allowed, checkingAccess = _a.isLoading;
    var user = useAuth_1.useAuth().user;
    var _b = react_1.useState(false), isCreateOpen = _b[0], setIsCreateOpen = _b[1];
    var _c = react_1.useState("all"), statusFilter = _c[0], setStatusFilter = _c[1];
    var _d = react_1.useState(""), searchTerm = _d[0], setSearchTerm = _d[1];
    var _e = react_1.useState({
        lpoNumber: "",
        supplierId: "",
        departmentId: "",
        issueDate: new Date().toISOString().split("T")[0],
        expectedDeliveryDate: "",
        description: "",
        lineItems: [{ productId: "", description: "", quantity: 1, unit: "pcs", unitPrice: 0, taxRate: 0 }]
    }), formData = _e[0], setFormData = _e[1];
    // Fetch data
    var _f = trpc_1.trpc.procurementLpo.list.useQuery({
        limit: 100,
        status: statusFilter !== "all" ? statusFilter : undefined
    }), _g = _f.data, lpos = _g === void 0 ? [] : _g, isLoadingLpos = _f.isLoading, refetch = _f.refetch;
    var _h = trpc_1.trpc.suppliers.list.useQuery({ limit: 100 }).data, suppliers = _h === void 0 ? [] : _h;
    var _j = trpc_1.trpc.products.list.useQuery({ limit: 100 }).data, products = _j === void 0 ? [] : _j;
    // Mutations
    var createMutation = trpc_1.trpc.procurementLpo.create.useMutation({
        onSuccess: function () {
            refetch();
            setIsCreateOpen(false);
            setFormData({
                lpoNumber: "",
                supplierId: "",
                departmentId: "",
                issueDate: new Date().toISOString().split("T")[0],
                expectedDeliveryDate: "",
                description: "",
                lineItems: [{ productId: "", description: "", quantity: 1, unit: "pcs", unitPrice: 0, taxRate: 0 }]
            });
            sonner_1.toast.success("LPO created successfully");
        },
        onError: function (error) {
            sonner_1.toast.error((error === null || error === void 0 ? void 0 : error.message) || "Failed to create LPO");
        }
    });
    var deleteMutation = trpc_1.trpc.procurementLpo["delete"].useMutation({
        onSuccess: function () {
            refetch();
            sonner_1.toast.success("LPO deleted successfully");
        },
        onError: function (error) {
            sonner_1.toast.error((error === null || error === void 0 ? void 0 : error.message) || "Failed to delete LPO");
        }
    });
    if (checkingAccess)
        return React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" }));
    if (!allowed)
        return null;
    var handleSubmit = function () { return __awaiter(_this, void 0, void 0, function () {
        var _i, _a, item, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    if (!formData.supplierId) {
                        sonner_1.toast.error("Supplier is required");
                        return [2 /*return*/];
                    }
                    if (!formData.issueDate) {
                        sonner_1.toast.error("Issue date is required");
                        return [2 /*return*/];
                    }
                    if (!formData.expectedDeliveryDate) {
                        sonner_1.toast.error("Expected delivery date is required");
                        return [2 /*return*/];
                    }
                    if (formData.lineItems.length === 0) {
                        sonner_1.toast.error("At least one line item is required");
                        return [2 /*return*/];
                    }
                    // Validate line items
                    for (_i = 0, _a = formData.lineItems; _i < _a.length; _i++) {
                        item = _a[_i];
                        if (!item.description) {
                            sonner_1.toast.error("All line items must have a description");
                            return [2 /*return*/];
                        }
                        if (item.quantity <= 0) {
                            sonner_1.toast.error("All line items must have quantity > 0");
                            return [2 /*return*/];
                        }
                        if (item.unitPrice < 0) {
                            sonner_1.toast.error("Unit price cannot be negative");
                            return [2 /*return*/];
                        }
                    }
                    return [4 /*yield*/, createMutation.mutateAsync({
                            lpoNumber: formData.lpoNumber || "LPO-" + Date.now(),
                            supplierId: formData.supplierId,
                            departmentId: formData.departmentId || undefined,
                            issueDate: formData.issueDate,
                            expectedDeliveryDate: formData.expectedDeliveryDate,
                            description: formData.description || undefined,
                            lineItems: formData.lineItems.map(function (item) { return ({
                                productId: item.productId,
                                description: item.description,
                                quantity: item.quantity,
                                unit: item.unit,
                                unitPrice: item.unitPrice,
                                taxRate: item.taxRate
                            }); })
                        })];
                case 1:
                    _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _b.sent();
                    console.error("Error submitting LPO:", error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleAddLineItem = function () {
        setFormData(__assign(__assign({}, formData), { lineItems: __spreadArrays(formData.lineItems, [{ productId: "", description: "", quantity: 1, unit: "pcs", unitPrice: 0, taxRate: 0 }]) }));
    };
    var handleRemoveLineItem = function (index) {
        setFormData(__assign(__assign({}, formData), { lineItems: formData.lineItems.filter(function (_, i) { return i !== index; }) }));
    };
    var handleLineItemChange = function (index, field, value) {
        var newLineItems = __spreadArrays(formData.lineItems);
        newLineItems[index][field] = value;
        setFormData(__assign(__assign({}, formData), { lineItems: newLineItems }));
    };
    var filteredLPOs = lpos.filter(function (lpo) {
        var _a, _b;
        return ((_a = lpo.lpoNumber) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm.toLowerCase())) || ((_b = lpo.description) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(searchTerm.toLowerCase()));
    });
    var totalLPOs = lpos.length;
    var approvedCount = lpos.filter(function (l) { return l.status === "approved"; }).length;
    var sentCount = lpos.filter(function (l) { return l.status === "sent"; }).length;
    var receivedCount = lpos.filter(function (l) { return l.status === "received"; }).length;
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Procurement - Local Purchase Orders", breadcrumbs: [
            { label: "Procurement", href: "/procurement" },
            { label: "LPOs", href: "/procurement-lpo-enhanced" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Total LPOs")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" }, totalLPOs))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Approved")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold text-green-600" }, approvedCount))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Sent")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold text-blue-600" }, sentCount))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Received")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold text-green-600" }, receivedCount)))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement("div", { className: "flex justify-between items-center" },
                        React.createElement("div", { className: "flex gap-4 flex-1" },
                            React.createElement("div", { className: "flex-1 max-w-md" },
                                React.createElement(label_1.Label, { htmlFor: "search" }, "Search LPOs"),
                                React.createElement(input_1.Input, { id: "search", placeholder: "Search by LPO number or description...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: "mt-2" })),
                            React.createElement("div", { className: "max-w-xs" },
                                React.createElement(label_1.Label, { htmlFor: "status" }, "Status Filter"),
                                React.createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                                    React.createElement(select_1.SelectTrigger, { className: "mt-2", id: "status" },
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "all" }, "All Status"),
                                        React.createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                                        React.createElement(select_1.SelectItem, { value: "approved" }, "Approved"),
                                        React.createElement(select_1.SelectItem, { value: "sent" }, "Sent"),
                                        React.createElement(select_1.SelectItem, { value: "received" }, "Received"),
                                        React.createElement(select_1.SelectItem, { value: "cancelled" }, "Cancelled"))))),
                        React.createElement(dialog_1.Dialog, { open: isCreateOpen, onOpenChange: setIsCreateOpen },
                            React.createElement(dialog_1.DialogTrigger, { asChild: true },
                                React.createElement(button_1.Button, { className: "mt-8" },
                                    React.createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
                                    "Create LPO")),
                            React.createElement(dialog_1.DialogContent, { className: "max-w-4xl max-h-screen overflow-y-auto" },
                                React.createElement(dialog_1.DialogHeader, null,
                                    React.createElement(dialog_1.DialogTitle, null, "Create Local Purchase Order"),
                                    React.createElement(dialog_1.DialogDescription, null, "Fill in the details for a new LPO")),
                                React.createElement("div", { className: "grid grid-cols-2 gap-4 my-4" },
                                    React.createElement("div", null,
                                        React.createElement(label_1.Label, null, "LPO Number (auto-generated if empty)"),
                                        React.createElement(input_1.Input, { value: formData.lpoNumber, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { lpoNumber: e.target.value })); }, placeholder: "LPO-XXXX" })),
                                    React.createElement("div", null,
                                        React.createElement(label_1.Label, null, "Supplier *"),
                                        React.createElement(select_1.Select, { value: formData.supplierId, onValueChange: function (val) { return setFormData(__assign(__assign({}, formData), { supplierId: val })); } },
                                            React.createElement(select_1.SelectTrigger, null,
                                                React.createElement(select_1.SelectValue, { placeholder: "Select supplier" })),
                                            React.createElement(select_1.SelectContent, null, suppliers.map(function (s) { return (React.createElement(select_1.SelectItem, { key: s.id, value: s.id },
                                                s.supplierCode || s.id,
                                                " - ",
                                                s.supplierName || "")); })))),
                                    React.createElement("div", null,
                                        React.createElement(label_1.Label, null, "Department"),
                                        React.createElement(select_1.Select, { value: formData.departmentId, onValueChange: function (val) { return setFormData(__assign(__assign({}, formData), { departmentId: val })); } },
                                            React.createElement(select_1.SelectTrigger, null,
                                                React.createElement(select_1.SelectValue, { placeholder: "Select department" })),
                                            React.createElement(select_1.SelectContent, null,
                                                React.createElement(select_1.SelectItem, { value: "dept1" }, "Finance"),
                                                React.createElement(select_1.SelectItem, { value: "dept2" }, "Operations"),
                                                React.createElement(select_1.SelectItem, { value: "dept3" }, "HR")))),
                                    React.createElement("div", null,
                                        React.createElement(label_1.Label, null, "Issue Date *"),
                                        React.createElement(input_1.Input, { type: "date", value: formData.issueDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { issueDate: e.target.value })); } })),
                                    React.createElement("div", null,
                                        React.createElement(label_1.Label, null, "Expected Delivery Date *"),
                                        React.createElement(input_1.Input, { type: "date", value: formData.expectedDeliveryDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { expectedDeliveryDate: e.target.value })); } })),
                                    React.createElement("div", { className: "col-span-2" },
                                        React.createElement(label_1.Label, null, "Description"),
                                        React.createElement(input_1.Input, { value: formData.description, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { description: e.target.value })); }, placeholder: "Enter LPO description" }))),
                                React.createElement("div", { className: "my-4" },
                                    React.createElement("h4", { className: "font-semibold mb-2" }, "Line Items *"),
                                    React.createElement("div", { className: "space-y-2 max-h-64 overflow-y-auto" }, formData.lineItems.map(function (item, idx) { return (React.createElement("div", { key: idx, className: "grid grid-cols-5 gap-2 items-end border-b pb-2" },
                                        React.createElement("div", null,
                                            React.createElement(label_1.Label, { className: "text-xs" }, "Product"),
                                            React.createElement(input_1.Input, { placeholder: "Product ID (optional)", value: item.productId, onChange: function (e) { return handleLineItemChange(idx, "productId", e.target.value); }, size: 30 })),
                                        React.createElement("div", null,
                                            React.createElement(label_1.Label, { className: "text-xs" }, "Description *"),
                                            React.createElement(input_1.Input, { placeholder: "Description", value: item.description, onChange: function (e) { return handleLineItemChange(idx, "description", e.target.value); } })),
                                        React.createElement("div", null,
                                            React.createElement(label_1.Label, { className: "text-xs" }, "Qty *"),
                                            React.createElement(input_1.Input, { type: "number", placeholder: "0", value: item.quantity, onChange: function (e) { return handleLineItemChange(idx, "quantity", parseFloat(e.target.value)); } })),
                                        React.createElement("div", null,
                                            React.createElement(label_1.Label, { className: "text-xs" }, "Unit Price"),
                                            React.createElement(input_1.Input, { type: "number", placeholder: "0.00", value: item.unitPrice, onChange: function (e) { return handleLineItemChange(idx, "unitPrice", parseFloat(e.target.value)); } })),
                                        React.createElement(button_1.Button, { variant: "destructive", size: "sm", onClick: function () { return handleRemoveLineItem(idx); } }, "Remove"))); })),
                                    React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleAddLineItem, className: "mt-2" }, "+ Add Line Item")),
                                React.createElement("div", { className: "flex justify-end gap-2" },
                                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setIsCreateOpen(false); } }, "Cancel"),
                                    React.createElement(button_1.Button, { onClick: handleSubmit, disabled: createMutation.isPending },
                                        createMutation.isPending ? React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
                                        "Create LPO"))))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Your LPOs"),
                    React.createElement(card_1.CardDescription, null, "Manage and track local purchase orders")),
                React.createElement(card_1.CardContent, null, isLoadingLpos ? (React.createElement("div", { className: "flex justify-center py-8" },
                    React.createElement(spinner_1.Spinner, { className: "size-8" }))) : (React.createElement(table_1.Table, null,
                    React.createElement(table_1.TableHeader, null,
                        React.createElement(table_1.TableRow, null,
                            React.createElement(table_1.TableHead, null, "LPO Number"),
                            React.createElement(table_1.TableHead, null, "Supplier"),
                            React.createElement(table_1.TableHead, null, "Issue Date"),
                            React.createElement(table_1.TableHead, null, "Expected Delivery"),
                            React.createElement(table_1.TableHead, null, "Status"),
                            React.createElement(table_1.TableHead, { className: "text-right" }, "Amount"),
                            React.createElement(table_1.TableHead, { className: "text-center" }, "Actions"))),
                    React.createElement(table_1.TableBody, null, filteredLPOs.length === 0 ? (React.createElement(table_1.TableRow, null,
                        React.createElement(table_1.TableCell, { colSpan: 7, className: "text-center py-8 text-gray-500" }, "No LPOs found"))) : (filteredLPOs.map(function (lpo) {
                        var _a;
                        return (React.createElement(table_1.TableRow, { key: lpo.id },
                            React.createElement(table_1.TableCell, { className: "font-mono font-semibold" }, lpo.lpoNumber),
                            React.createElement(table_1.TableCell, null, ((_a = suppliers.find(function (s) { return s.id === lpo.supplierId; })) === null || _a === void 0 ? void 0 : _a.supplierCode) || lpo.supplierId),
                            React.createElement(table_1.TableCell, null, lpo.issueDate ? new Date(lpo.issueDate).toLocaleDateString() : "-"),
                            React.createElement(table_1.TableCell, null, lpo.expectedDeliveryDate ? new Date(lpo.expectedDeliveryDate).toLocaleDateString() : "-"),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { className: STATUS_COLORS[lpo.status] || "bg-gray-100 text-gray-800" }, lpo.status)),
                            React.createElement(table_1.TableCell, { className: "text-right font-semibold" }, lpo.netAmount ? "KES " + lpo.netAmount.toLocaleString() : "-"),
                            React.createElement(table_1.TableCell, { className: "text-center" },
                                React.createElement("div", { className: "flex gap-2 justify-center" },
                                    React.createElement(button_1.Button, { variant: "outline", size: "sm" },
                                        React.createElement(lucide_react_1.Edit2, { className: "h-4 w-4" })),
                                    React.createElement(button_1.Button, { variant: "destructive", size: "sm", onClick: function () { return deleteMutation.mutate(lpo.id); }, disabled: deleteMutation.isPending },
                                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))))));
                    }))))))))));
}
exports["default"] = ProcurementLPOEnhancedPage;
