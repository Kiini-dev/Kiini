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
    in_transit: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
    partially_delivered: "bg-yellow-100 text-yellow-800",
    failed: "bg-red-100 text-red-800",
    returned: "bg-orange-100 text-orange-800"
};
var CONDITION_COLORS = {
    good: "bg-green-100 text-green-800",
    damaged: "bg-red-100 text-red-800",
    partial: "bg-yellow-100 text-yellow-800",
    incomplete: "bg-orange-100 text-orange-800"
};
function ProcurementDeliveryNotesEnhancedPage() {
    var _this = this;
    var _a = permissions_1.useRequireFeature("procurement:lpo:view"), allowed = _a.allowed, checkingAccess = _a.isLoading;
    var _b = react_1.useState(false), isCreateOpen = _b[0], setIsCreateOpen = _b[1];
    var _c = react_1.useState("all"), statusFilter = _c[0], setStatusFilter = _c[1];
    var _d = react_1.useState(""), searchTerm = _d[0], setSearchTerm = _d[1];
    var _e = react_1.useState({
        deliveryNoteNumber: "",
        lpoId: "",
        supplierId: "",
        deliveryDate: new Date().toISOString().split("T")[0],
        driverId: "",
        vehicleNumber: "",
        condition: "good",
        receivedBy: "",
        notes: "",
        lineItems: [{ productId: "", description: "", expectedQuantity: 1, receivedQuantity: 1, unit: "pcs", batchNumber: "", expiryDate: "" }]
    }), formData = _e[0], setFormData = _e[1];
    // Fetch data
    var _f = trpc_1.trpc.procurementDeliveryNotes.list.useQuery({
        limit: 100,
        status: statusFilter !== "all" ? statusFilter : undefined
    }), _g = _f.data, deliveryNotes = _g === void 0 ? [] : _g, isLoadingNotes = _f.isLoading, refetch = _f.refetch;
    var _h = trpc_1.trpc.procurementLpo.list.useQuery({ limit: 100 }).data, lpos = _h === void 0 ? [] : _h;
    var _j = trpc_1.trpc.suppliers.list.useQuery({ limit: 100 }).data, suppliers = _j === void 0 ? [] : _j;
    // Mutations
    var createMutation = trpc_1.trpc.procurementDeliveryNotes.create.useMutation({
        onSuccess: function () {
            refetch();
            setIsCreateOpen(false);
            setFormData({
                deliveryNoteNumber: "",
                lpoId: "",
                supplierId: "",
                deliveryDate: new Date().toISOString().split("T")[0],
                driverId: "",
                vehicleNumber: "",
                condition: "good",
                receivedBy: "",
                notes: "",
                lineItems: [{ productId: "", description: "", expectedQuantity: 1, receivedQuantity: 1, unit: "pcs", batchNumber: "", expiryDate: "" }]
            });
            sonner_1.toast.success("Delivery note created successfully");
        },
        onError: function (error) {
            sonner_1.toast.error((error === null || error === void 0 ? void 0 : error.message) || "Failed to create delivery note");
        }
    });
    var deleteMutation = trpc_1.trpc.procurementDeliveryNotes["delete"].useMutation({
        onSuccess: function () {
            refetch();
            sonner_1.toast.success("Delivery note deleted successfully");
        },
        onError: function (error) {
            sonner_1.toast.error((error === null || error === void 0 ? void 0 : error.message) || "Failed to delete delivery note");
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
                    if (!formData.lpoId) {
                        sonner_1.toast.error("LPO is required");
                        return [2 /*return*/];
                    }
                    if (!formData.supplierId) {
                        sonner_1.toast.error("Supplier is required");
                        return [2 /*return*/];
                    }
                    if (!formData.deliveryDate) {
                        sonner_1.toast.error("Delivery date is required");
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
                        if (item.expectedQuantity <= 0) {
                            sonner_1.toast.error("Expected quantity must be > 0");
                            return [2 /*return*/];
                        }
                    }
                    return [4 /*yield*/, createMutation.mutateAsync({
                            deliveryNoteNumber: formData.deliveryNoteNumber || "DN-" + Date.now(),
                            lpoId: formData.lpoId,
                            supplierId: formData.supplierId,
                            deliveryDate: formData.deliveryDate,
                            driverId: formData.driverId || undefined,
                            vehicleNumber: formData.vehicleNumber || undefined,
                            receivedBy: formData.receivedBy || undefined,
                            condition: formData.condition,
                            notes: formData.notes || undefined,
                            lineItems: formData.lineItems.map(function (item) { return ({
                                productId: item.productId,
                                description: item.description,
                                expectedQuantity: item.expectedQuantity,
                                receivedQuantity: item.receivedQuantity,
                                damagedQuantity: 0,
                                unit: item.unit,
                                batchNumber: item.batchNumber || undefined,
                                expiryDate: item.expiryDate || undefined
                            }); })
                        })];
                case 1:
                    _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _b.sent();
                    console.error("Error submitting delivery note:", error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleAddLineItem = function () {
        setFormData(__assign(__assign({}, formData), { lineItems: __spreadArrays(formData.lineItems, [{ productId: "", description: "", expectedQuantity: 1, receivedQuantity: 1, unit: "pcs", batchNumber: "", expiryDate: "" }]) }));
    };
    var handleRemoveLineItem = function (index) {
        setFormData(__assign(__assign({}, formData), { lineItems: formData.lineItems.filter(function (_, i) { return i !== index; }) }));
    };
    var handleLineItemChange = function (index, field, value) {
        var newLineItems = __spreadArrays(formData.lineItems);
        newLineItems[index][field] = value;
        setFormData(__assign(__assign({}, formData), { lineItems: newLineItems }));
    };
    var filteredNotes = deliveryNotes.filter(function (dn) { var _a; return (_a = dn.deliveryNoteNumber) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm.toLowerCase()); });
    var totalNotes = deliveryNotes.length;
    var deliveredCount = deliveryNotes.filter(function (dn) { return dn.deliveryStatus === "delivered"; }).length;
    var inTransitCount = deliveryNotes.filter(function (dn) { return dn.deliveryStatus === "in_transit"; }).length;
    var problemCount = deliveryNotes.filter(function (dn) { return ["failed", "returned", "partially_delivered"].includes(dn.deliveryStatus); }).length;
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Procurement - Delivery Notes", breadcrumbs: [
            { label: "Procurement", href: "/procurement" },
            { label: "Delivery Notes", href: "/procurement-delivery-notes-enhanced" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Total Deliveries")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" }, totalNotes))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Delivered")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold text-green-600" }, deliveredCount))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "In Transit")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold text-blue-600" }, inTransitCount))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Problems")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold text-red-600" }, problemCount)))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement("div", { className: "flex justify-between items-center" },
                        React.createElement("div", { className: "flex gap-4 flex-1" },
                            React.createElement("div", { className: "flex-1 max-w-md" },
                                React.createElement(label_1.Label, { htmlFor: "search" }, "Search Delivery Notes"),
                                React.createElement(input_1.Input, { id: "search", placeholder: "Search by delivery note number...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: "mt-2" })),
                            React.createElement("div", { className: "max-w-xs" },
                                React.createElement(label_1.Label, { htmlFor: "status" }, "Status Filter"),
                                React.createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                                    React.createElement(select_1.SelectTrigger, { className: "mt-2", id: "status" },
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "all" }, "All Status"),
                                        React.createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                                        React.createElement(select_1.SelectItem, { value: "in_transit" }, "In Transit"),
                                        React.createElement(select_1.SelectItem, { value: "delivered" }, "Delivered"),
                                        React.createElement(select_1.SelectItem, { value: "partially_delivered" }, "Partially Delivered"),
                                        React.createElement(select_1.SelectItem, { value: "failed" }, "Failed"))))),
                        React.createElement(dialog_1.Dialog, { open: isCreateOpen, onOpenChange: setIsCreateOpen },
                            React.createElement(dialog_1.DialogTrigger, { asChild: true },
                                React.createElement(button_1.Button, { className: "mt-8" },
                                    React.createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
                                    "Create Delivery Note")),
                            React.createElement(dialog_1.DialogContent, { className: "max-w-4xl max-h-screen overflow-y-auto" },
                                React.createElement(dialog_1.DialogHeader, null,
                                    React.createElement(dialog_1.DialogTitle, null, "Create Delivery Note"),
                                    React.createElement(dialog_1.DialogDescription, null, "Record incoming deliveries from suppliers")),
                                React.createElement("div", { className: "grid grid-cols-2 gap-4 my-4" },
                                    React.createElement("div", null,
                                        React.createElement(label_1.Label, null, "Delivery Note Number (auto-generated if empty)"),
                                        React.createElement(input_1.Input, { value: formData.deliveryNoteNumber, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { deliveryNoteNumber: e.target.value })); }, placeholder: "DN-XXXX" })),
                                    React.createElement("div", null,
                                        React.createElement(label_1.Label, null, "LPO *"),
                                        React.createElement(select_1.Select, { value: formData.lpoId, onValueChange: function (val) { return setFormData(__assign(__assign({}, formData), { lpoId: val })); } },
                                            React.createElement(select_1.SelectTrigger, null,
                                                React.createElement(select_1.SelectValue, { placeholder: "Select LPO" })),
                                            React.createElement(select_1.SelectContent, null, lpos.map(function (l) { return (React.createElement(select_1.SelectItem, { key: l.id, value: l.id }, l.lpoNumber)); })))),
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
                                        React.createElement(label_1.Label, null, "Delivery Date *"),
                                        React.createElement(input_1.Input, { type: "date", value: formData.deliveryDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { deliveryDate: e.target.value })); } })),
                                    React.createElement("div", null,
                                        React.createElement(label_1.Label, null, "Driver ID"),
                                        React.createElement(input_1.Input, { value: formData.driverId, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { driverId: e.target.value })); }, placeholder: "Driver ID" })),
                                    React.createElement("div", null,
                                        React.createElement(label_1.Label, null, "Vehicle Number"),
                                        React.createElement(input_1.Input, { value: formData.vehicleNumber, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { vehicleNumber: e.target.value })); }, placeholder: "Vehicle registration" })),
                                    React.createElement("div", null,
                                        React.createElement(label_1.Label, null, "Received By"),
                                        React.createElement(input_1.Input, { value: formData.receivedBy, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { receivedBy: e.target.value })); }, placeholder: "Name of recipient" })),
                                    React.createElement("div", null,
                                        React.createElement(label_1.Label, null, "Overall Condition"),
                                        React.createElement(select_1.Select, { value: formData.condition, onValueChange: function (val) { return setFormData(__assign(__assign({}, formData), { condition: val })); } },
                                            React.createElement(select_1.SelectTrigger, null,
                                                React.createElement(select_1.SelectValue, null)),
                                            React.createElement(select_1.SelectContent, null,
                                                React.createElement(select_1.SelectItem, { value: "good" }, "Good"),
                                                React.createElement(select_1.SelectItem, { value: "damaged" }, "Damaged"),
                                                React.createElement(select_1.SelectItem, { value: "partial" }, "Partial"),
                                                React.createElement(select_1.SelectItem, { value: "incomplete" }, "Incomplete")))),
                                    React.createElement("div", { className: "col-span-2" },
                                        React.createElement(label_1.Label, null, "Notes"),
                                        React.createElement(input_1.Input, { value: formData.notes, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { notes: e.target.value })); }, placeholder: "Additional notes about the delivery" }))),
                                React.createElement("div", { className: "my-4" },
                                    React.createElement("h4", { className: "font-semibold mb-2" }, "Line Items *"),
                                    React.createElement("div", { className: "space-y-2 max-h-64 overflow-y-auto" }, formData.lineItems.map(function (item, idx) { return (React.createElement("div", { key: idx, className: "grid grid-cols-6 gap-2 items-end border-b pb-2" },
                                        React.createElement("div", null,
                                            React.createElement(label_1.Label, { className: "text-xs" }, "Product ID"),
                                            React.createElement(input_1.Input, { placeholder: "Product", value: item.productId, onChange: function (e) { return handleLineItemChange(idx, "productId", e.target.value); }, size: 15 })),
                                        React.createElement("div", null,
                                            React.createElement(label_1.Label, { className: "text-xs" }, "Description *"),
                                            React.createElement(input_1.Input, { placeholder: "Description", value: item.description, onChange: function (e) { return handleLineItemChange(idx, "description", e.target.value); } })),
                                        React.createElement("div", null,
                                            React.createElement(label_1.Label, { className: "text-xs" }, "Expected"),
                                            React.createElement(input_1.Input, { type: "number", placeholder: "0", value: item.expectedQuantity, onChange: function (e) { return handleLineItemChange(idx, "expectedQuantity", parseFloat(e.target.value)); } })),
                                        React.createElement("div", null,
                                            React.createElement(label_1.Label, { className: "text-xs" }, "Received"),
                                            React.createElement(input_1.Input, { type: "number", placeholder: "0", value: item.receivedQuantity, onChange: function (e) { return handleLineItemChange(idx, "receivedQuantity", parseFloat(e.target.value)); } })),
                                        React.createElement("div", null,
                                            React.createElement(label_1.Label, { className: "text-xs" }, "Batch #"),
                                            React.createElement(input_1.Input, { placeholder: "Batch", value: item.batchNumber, onChange: function (e) { return handleLineItemChange(idx, "batchNumber", e.target.value); } })),
                                        React.createElement(button_1.Button, { variant: "destructive", size: "sm", onClick: function () { return handleRemoveLineItem(idx); } }, "Remove"))); })),
                                    React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleAddLineItem, className: "mt-2" }, "+ Add Line Item")),
                                React.createElement("div", { className: "flex justify-end gap-2" },
                                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setIsCreateOpen(false); } }, "Cancel"),
                                    React.createElement(button_1.Button, { onClick: handleSubmit, disabled: createMutation.isPending },
                                        createMutation.isPending ? React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
                                        "Create Delivery Note"))))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Delivery Notes"),
                    React.createElement(card_1.CardDescription, null, "Track incoming shipments and deliveries")),
                React.createElement(card_1.CardContent, null, isLoadingNotes ? (React.createElement("div", { className: "flex justify-center py-8" },
                    React.createElement(spinner_1.Spinner, { className: "size-8" }))) : (React.createElement(table_1.Table, null,
                    React.createElement(table_1.TableHeader, null,
                        React.createElement(table_1.TableRow, null,
                            React.createElement(table_1.TableHead, null, "Delivery Note #"),
                            React.createElement(table_1.TableHead, null, "LPO"),
                            React.createElement(table_1.TableHead, null, "Delivery Date"),
                            React.createElement(table_1.TableHead, null, "Status"),
                            React.createElement(table_1.TableHead, null, "Condition"),
                            React.createElement(table_1.TableHead, { className: "text-center" }, "Items"),
                            React.createElement(table_1.TableHead, { className: "text-center" }, "Actions"))),
                    React.createElement(table_1.TableBody, null, filteredNotes.length === 0 ? (React.createElement(table_1.TableRow, null,
                        React.createElement(table_1.TableCell, { colSpan: 7, className: "text-center py-8 text-gray-500" }, "No delivery notes found"))) : (filteredNotes.map(function (dn) {
                        var _a;
                        return (React.createElement(table_1.TableRow, { key: dn.id },
                            React.createElement(table_1.TableCell, { className: "font-mono font-semibold" }, dn.deliveryNoteNumber),
                            React.createElement(table_1.TableCell, null, dn.lpoId ? (_a = lpos.find(function (l) { return l.id === dn.lpoId; })) === null || _a === void 0 ? void 0 : _a.lpoNumber : "-"),
                            React.createElement(table_1.TableCell, null, dn.deliveryDate ? new Date(dn.deliveryDate).toLocaleDateString() : "-"),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { className: STATUS_COLORS[dn.deliveryStatus] || "bg-gray-100 text-gray-800" }, dn.deliveryStatus)),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { className: CONDITION_COLORS[dn.condition] || "bg-gray-100 text-gray-800" }, dn.condition)),
                            React.createElement(table_1.TableCell, { className: "text-center" }, dn.totalItems || 0),
                            React.createElement(table_1.TableCell, { className: "text-center" },
                                React.createElement("div", { className: "flex gap-2 justify-center" },
                                    React.createElement(button_1.Button, { variant: "outline", size: "sm" },
                                        React.createElement(lucide_react_1.Edit2, { className: "h-4 w-4" })),
                                    React.createElement(button_1.Button, { variant: "destructive", size: "sm", onClick: function () { return deleteMutation.mutate(dn.id); }, disabled: deleteMutation.isPending },
                                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))))));
                    }))))))))));
}
exports["default"] = ProcurementDeliveryNotesEnhancedPage;
