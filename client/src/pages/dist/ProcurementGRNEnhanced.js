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
    received: "bg-blue-100 text-blue-800",
    inspected: "bg-purple-100 text-purple-800",
    approved: "bg-green-100 text-green-800",
    posted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    partial: "bg-yellow-100 text-yellow-800"
};
var QUALITY_COLORS = {
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    partial: "bg-yellow-100 text-yellow-800",
    pending_inspection: "bg-gray-100 text-gray-800"
};
var CONDITION_COLORS = {
    good: "bg-green-100 text-green-800",
    damaged: "bg-red-100 text-red-800",
    expired: "bg-orange-100 text-orange-800",
    defective: "bg-pink-100 text-pink-800"
};
function ProcurementGRNEnhancedPage() {
    var _this = this;
    var _a = permissions_1.useRequireFeature("procurement:lpo:view"), allowed = _a.allowed, checkingAccess = _a.isLoading;
    var _b = react_1.useState(false), isCreateOpen = _b[0], setIsCreateOpen = _b[1];
    var _c = react_1.useState("all"), statusFilter = _c[0], setStatusFilter = _c[1];
    var _d = react_1.useState("all"), qualityFilter = _d[0], setQualityFilter = _d[1];
    var _e = react_1.useState(""), searchTerm = _e[0], setSearchTerm = _e[1];
    var _f = react_1.useState({
        grnNumber: "",
        lpoId: "",
        deliveryNoteId: "",
        supplierId: "",
        grnDate: new Date().toISOString().split("T")[0],
        warehouseId: "",
        receivedBy: "",
        inspectedBy: "",
        inspectionDate: "",
        qualityStatus: "pending_inspection",
        notes: "",
        lineItems: [{ productId: "", description: "", orderedQuantity: 1, receivedQuantity: 1, unit: "pcs", unitCost: 0, condition: "good" }]
    }), formData = _f[0], setFormData = _f[1];
    // Fetch data
    var _g = trpc_1.trpc.procurementGrn.list.useQuery({
        limit: 100,
        status: statusFilter !== "all" ? statusFilter : undefined,
        qualityStatus: qualityFilter !== "all" ? qualityFilter : undefined
    }), _h = _g.data, grns = _h === void 0 ? [] : _h, isLoadingGRNs = _g.isLoading, refetch = _g.refetch;
    var _j = trpc_1.trpc.procurementLpo.list.useQuery({ limit: 100 }).data, lpos = _j === void 0 ? [] : _j;
    var _k = trpc_1.trpc.suppliers.list.useQuery({ limit: 100 }).data, suppliers = _k === void 0 ? [] : _k;
    // Mutations
    var createMutation = trpc_1.trpc.procurementGrn.create.useMutation({
        onSuccess: function () {
            refetch();
            setIsCreateOpen(false);
            setFormData({
                grnNumber: "",
                lpoId: "",
                deliveryNoteId: "",
                supplierId: "",
                grnDate: new Date().toISOString().split("T")[0],
                warehouseId: "",
                receivedBy: "",
                inspectedBy: "",
                inspectionDate: "",
                qualityStatus: "pending_inspection",
                notes: "",
                lineItems: [{ productId: "", description: "", orderedQuantity: 1, receivedQuantity: 1, unit: "pcs", unitCost: 0, condition: "good" }]
            });
            sonner_1.toast.success("GRN created successfully");
        },
        onError: function (error) {
            sonner_1.toast.error((error === null || error === void 0 ? void 0 : error.message) || "Failed to create GRN");
        }
    });
    var deleteMutation = trpc_1.trpc.procurementGrn["delete"].useMutation({
        onSuccess: function () {
            refetch();
            sonner_1.toast.success("GRN deleted successfully");
        },
        onError: function (error) {
            sonner_1.toast.error((error === null || error === void 0 ? void 0 : error.message) || "Failed to delete GRN");
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
                    if (!formData.grnDate) {
                        sonner_1.toast.error("GRN date is required");
                        return [2 /*return*/];
                    }
                    if (!formData.receivedBy) {
                        sonner_1.toast.error("Received by is required");
                        return [2 /*return*/];
                    }
                    if (!formData.warehouseId) {
                        sonner_1.toast.error("Warehouse is required");
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
                        if (item.orderedQuantity <= 0) {
                            sonner_1.toast.error("Ordered quantity must be > 0");
                            return [2 /*return*/];
                        }
                    }
                    return [4 /*yield*/, createMutation.mutateAsync({
                            grnNumber: formData.grnNumber || "GRN-" + Date.now(),
                            lpoId: formData.lpoId,
                            deliveryNoteId: formData.deliveryNoteId || undefined,
                            supplierId: formData.supplierId,
                            grnDate: formData.grnDate,
                            warehouseId: formData.warehouseId,
                            receivedBy: formData.receivedBy,
                            inspectedBy: formData.inspectedBy || undefined,
                            inspectionDate: formData.inspectionDate || undefined,
                            qualityStatus: formData.qualityStatus,
                            notes: formData.notes || undefined,
                            lineItems: formData.lineItems.map(function (item) { return ({
                                productId: item.productId,
                                description: item.description,
                                orderedQuantity: item.orderedQuantity,
                                receivedQuantity: item.receivedQuantity,
                                unit: item.unit,
                                unitCost: item.unitCost,
                                condition: item.condition
                            }); })
                        })];
                case 1:
                    _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _b.sent();
                    console.error("Error submitting GRN:", error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleAddLineItem = function () {
        setFormData(__assign(__assign({}, formData), { lineItems: __spreadArrays(formData.lineItems, [{ productId: "", description: "", orderedQuantity: 1, receivedQuantity: 1, unit: "pcs", unitCost: 0, condition: "good" }]) }));
    };
    var handleRemoveLineItem = function (index) {
        setFormData(__assign(__assign({}, formData), { lineItems: formData.lineItems.filter(function (_, i) { return i !== index; }) }));
    };
    var handleLineItemChange = function (index, field, value) {
        var newLineItems = __spreadArrays(formData.lineItems);
        newLineItems[index][field] = value;
        setFormData(__assign(__assign({}, formData), { lineItems: newLineItems }));
    };
    var filteredGRNs = grns.filter(function (grn) { var _a; return (_a = grn.grnNumber) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm.toLowerCase()); });
    var totalGRNs = grns.length;
    var approvedCount = grns.filter(function (grn) { return grn.qualityStatus === "approved"; }).length;
    var rejectedCount = grns.filter(function (grn) { return grn.qualityStatus === "rejected"; }).length;
    var pendingInspection = grns.filter(function (grn) { return grn.qualityStatus === "pending_inspection"; }).length;
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Procurement - Goods Received Notes", breadcrumbs: [
            { label: "Procurement", href: "/procurement" },
            { label: "GRNs", href: "/procurement-grn-enhanced" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Total GRNs")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" }, totalGRNs))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Approved")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold text-green-600" }, approvedCount))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Pending Inspection")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold text-gray-600" }, pendingInspection))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Rejected")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold text-red-600" }, rejectedCount)))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement("div", { className: "flex justify-between items-center" },
                        React.createElement("div", { className: "flex gap-4 flex-1" },
                            React.createElement("div", { className: "flex-1 max-w-md" },
                                React.createElement(label_1.Label, { htmlFor: "search" }, "Search GRNs"),
                                React.createElement(input_1.Input, { id: "search", placeholder: "Search by GRN number...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: "mt-2" })),
                            React.createElement("div", { className: "max-w-xs" },
                                React.createElement(label_1.Label, { htmlFor: "status" }, "Status Filter"),
                                React.createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                                    React.createElement(select_1.SelectTrigger, { className: "mt-2", id: "status" },
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "all" }, "All Status"),
                                        React.createElement(select_1.SelectItem, { value: "received" }, "Received"),
                                        React.createElement(select_1.SelectItem, { value: "inspected" }, "Inspected"),
                                        React.createElement(select_1.SelectItem, { value: "approved" }, "Approved"),
                                        React.createElement(select_1.SelectItem, { value: "posted" }, "Posted"),
                                        React.createElement(select_1.SelectItem, { value: "rejected" }, "Rejected")))),
                            React.createElement("div", { className: "max-w-xs" },
                                React.createElement(label_1.Label, { htmlFor: "quality" }, "Quality Status"),
                                React.createElement(select_1.Select, { value: qualityFilter, onValueChange: setQualityFilter },
                                    React.createElement(select_1.SelectTrigger, { className: "mt-2", id: "quality" },
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "all" }, "All Quality Status"),
                                        React.createElement(select_1.SelectItem, { value: "approved" }, "Approved Quality"),
                                        React.createElement(select_1.SelectItem, { value: "rejected" }, "Rejected"),
                                        React.createElement(select_1.SelectItem, { value: "pending_inspection" }, "Pending Inspection"))))),
                        React.createElement(dialog_1.Dialog, { open: isCreateOpen, onOpenChange: setIsCreateOpen },
                            React.createElement(dialog_1.DialogTrigger, { asChild: true },
                                React.createElement(button_1.Button, { className: "mt-8" },
                                    React.createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
                                    "Create GRN")),
                            React.createElement(dialog_1.DialogContent, { className: "max-w-4xl max-h-screen overflow-y-auto" },
                                React.createElement(dialog_1.DialogHeader, null,
                                    React.createElement(dialog_1.DialogTitle, null, "Create Goods Received Note"),
                                    React.createElement(dialog_1.DialogDescription, null, "Record and inspect received goods")),
                                React.createElement("div", { className: "grid grid-cols-2 gap-4 my-4" },
                                    React.createElement("div", null,
                                        React.createElement(label_1.Label, null, "GRN Number (auto-generated if empty)"),
                                        React.createElement(input_1.Input, { value: formData.grnNumber, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { grnNumber: e.target.value })); }, placeholder: "GRN-XXXX" })),
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
                                        React.createElement(label_1.Label, null, "GRN Date *"),
                                        React.createElement(input_1.Input, { type: "date", value: formData.grnDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { grnDate: e.target.value })); } })),
                                    React.createElement("div", null,
                                        React.createElement(label_1.Label, null, "Warehouse *"),
                                        React.createElement(select_1.Select, { value: formData.warehouseId, onValueChange: function (val) { return setFormData(__assign(__assign({}, formData), { warehouseId: val })); } },
                                            React.createElement(select_1.SelectTrigger, null,
                                                React.createElement(select_1.SelectValue, { placeholder: "Select warehouse" })),
                                            React.createElement(select_1.SelectContent, null,
                                                React.createElement(select_1.SelectItem, { value: "wh1" }, "Main Warehouse"),
                                                React.createElement(select_1.SelectItem, { value: "wh2" }, "Secondary Warehouse"),
                                                React.createElement(select_1.SelectItem, { value: "wh3" }, "Branch Warehouse")))),
                                    React.createElement("div", null,
                                        React.createElement(label_1.Label, null, "Received By *"),
                                        React.createElement(input_1.Input, { value: formData.receivedBy, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { receivedBy: e.target.value })); }, placeholder: "Name of recipient" })),
                                    React.createElement("div", null,
                                        React.createElement(label_1.Label, null, "Inspected By"),
                                        React.createElement(input_1.Input, { value: formData.inspectedBy, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { inspectedBy: e.target.value })); }, placeholder: "Name of inspector" })),
                                    React.createElement("div", null,
                                        React.createElement(label_1.Label, null, "Inspection Date"),
                                        React.createElement(input_1.Input, { type: "date", value: formData.inspectionDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { inspectionDate: e.target.value })); } })),
                                    React.createElement("div", null,
                                        React.createElement(label_1.Label, null, "Quality Status"),
                                        React.createElement(select_1.Select, { value: formData.qualityStatus, onValueChange: function (val) { return setFormData(__assign(__assign({}, formData), { qualityStatus: val })); } },
                                            React.createElement(select_1.SelectTrigger, null,
                                                React.createElement(select_1.SelectValue, null)),
                                            React.createElement(select_1.SelectContent, null,
                                                React.createElement(select_1.SelectItem, { value: "pending_inspection" }, "Pending Inspection"),
                                                React.createElement(select_1.SelectItem, { value: "approved" }, "Approved"),
                                                React.createElement(select_1.SelectItem, { value: "rejected" }, "Rejected"),
                                                React.createElement(select_1.SelectItem, { value: "partial" }, "Partial")))),
                                    React.createElement("div", { className: "col-span-2" },
                                        React.createElement(label_1.Label, null, "Notes"),
                                        React.createElement(input_1.Input, { value: formData.notes, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { notes: e.target.value })); }, placeholder: "Additional notes" }))),
                                React.createElement("div", { className: "my-4" },
                                    React.createElement("h4", { className: "font-semibold mb-2" }, "Line Items *"),
                                    React.createElement("div", { className: "space-y-2 max-h-64 overflow-y-auto" }, formData.lineItems.map(function (item, idx) { return (React.createElement("div", { key: idx, className: "grid grid-cols-7 gap-2 items-end border-b pb-2" },
                                        React.createElement("div", null,
                                            React.createElement(label_1.Label, { className: "text-xs" }, "Product"),
                                            React.createElement(input_1.Input, { placeholder: "Product", value: item.productId, onChange: function (e) { return handleLineItemChange(idx, "productId", e.target.value); }, size: 12 })),
                                        React.createElement("div", null,
                                            React.createElement(label_1.Label, { className: "text-xs" }, "Description *"),
                                            React.createElement(input_1.Input, { placeholder: "Description", value: item.description, onChange: function (e) { return handleLineItemChange(idx, "description", e.target.value); } })),
                                        React.createElement("div", null,
                                            React.createElement(label_1.Label, { className: "text-xs" }, "Ordered"),
                                            React.createElement(input_1.Input, { type: "number", placeholder: "0", value: item.orderedQuantity, onChange: function (e) { return handleLineItemChange(idx, "orderedQuantity", parseFloat(e.target.value)); } })),
                                        React.createElement("div", null,
                                            React.createElement(label_1.Label, { className: "text-xs" }, "Received"),
                                            React.createElement(input_1.Input, { type: "number", placeholder: "0", value: item.receivedQuantity, onChange: function (e) { return handleLineItemChange(idx, "receivedQuantity", parseFloat(e.target.value)); } })),
                                        React.createElement("div", null,
                                            React.createElement(label_1.Label, { className: "text-xs" }, "Unit Cost"),
                                            React.createElement(input_1.Input, { type: "number", placeholder: "0", value: item.unitCost, onChange: function (e) { return handleLineItemChange(idx, "unitCost", parseFloat(e.target.value)); } })),
                                        React.createElement("div", null,
                                            React.createElement(label_1.Label, { className: "text-xs" }, "Condition"),
                                            React.createElement(select_1.Select, { value: item.condition, onValueChange: function (val) { return handleLineItemChange(idx, "condition", val); } },
                                                React.createElement(select_1.SelectTrigger, null,
                                                    React.createElement(select_1.SelectValue, null)),
                                                React.createElement(select_1.SelectContent, null,
                                                    React.createElement(select_1.SelectItem, { value: "good" }, "Good"),
                                                    React.createElement(select_1.SelectItem, { value: "damaged" }, "Damaged"),
                                                    React.createElement(select_1.SelectItem, { value: "expired" }, "Expired"),
                                                    React.createElement(select_1.SelectItem, { value: "defective" }, "Defective")))),
                                        React.createElement(button_1.Button, { variant: "destructive", size: "sm", onClick: function () { return handleRemoveLineItem(idx); } }, "Remove"))); })),
                                    React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleAddLineItem, className: "mt-2" }, "+ Add Line Item")),
                                React.createElement("div", { className: "flex justify-end gap-2" },
                                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setIsCreateOpen(false); } }, "Cancel"),
                                    React.createElement(button_1.Button, { onClick: handleSubmit, disabled: createMutation.isPending },
                                        createMutation.isPending ? React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
                                        "Create GRN"))))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Goods Received Notes"),
                    React.createElement(card_1.CardDescription, null, "Manage quality inspection and goods receipt")),
                React.createElement(card_1.CardContent, null, isLoadingGRNs ? (React.createElement("div", { className: "flex justify-center py-8" },
                    React.createElement(spinner_1.Spinner, { className: "size-8" }))) : (React.createElement(table_1.Table, null,
                    React.createElement(table_1.TableHeader, null,
                        React.createElement(table_1.TableRow, null,
                            React.createElement(table_1.TableHead, null, "GRN Number"),
                            React.createElement(table_1.TableHead, null, "LPO"),
                            React.createElement(table_1.TableHead, null, "GRN Date"),
                            React.createElement(table_1.TableHead, null, "Status"),
                            React.createElement(table_1.TableHead, null, "Quality"),
                            React.createElement(table_1.TableHead, { className: "text-right" }, "Total Cost"),
                            React.createElement(table_1.TableHead, { className: "text-center" }, "Actions"))),
                    React.createElement(table_1.TableBody, null, filteredGRNs.length === 0 ? (React.createElement(table_1.TableRow, null,
                        React.createElement(table_1.TableCell, { colSpan: 7, className: "text-center py-8 text-gray-500" }, "No GRNs found"))) : (filteredGRNs.map(function (grn) {
                        var _a;
                        return (React.createElement(table_1.TableRow, { key: grn.id },
                            React.createElement(table_1.TableCell, { className: "font-mono font-semibold" }, grn.grnNumber),
                            React.createElement(table_1.TableCell, null, grn.lpoId ? (_a = lpos.find(function (l) { return l.id === grn.lpoId; })) === null || _a === void 0 ? void 0 : _a.lpoNumber : "-"),
                            React.createElement(table_1.TableCell, null, grn.grnDate ? new Date(grn.grnDate).toLocaleDateString() : "-"),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { className: STATUS_COLORS[grn.status] || "bg-gray-100 text-gray-800" }, grn.status)),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { className: QUALITY_COLORS[grn.qualityStatus] || "bg-gray-100 text-gray-800" }, grn.qualityStatus)),
                            React.createElement(table_1.TableCell, { className: "text-right font-semibold" }, grn.totalCost ? "KES " + grn.totalCost.toLocaleString() : "-"),
                            React.createElement(table_1.TableCell, { className: "text-center" },
                                React.createElement("div", { className: "flex gap-2 justify-center" },
                                    React.createElement(button_1.Button, { variant: "outline", size: "sm" },
                                        React.createElement(lucide_react_1.Edit2, { className: "h-4 w-4" })),
                                    React.createElement(button_1.Button, { variant: "destructive", size: "sm", onClick: function () { return deleteMutation.mutate(grn.id); }, disabled: deleteMutation.isPending },
                                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))))));
                    }))))))))));
}
exports["default"] = ProcurementGRNEnhancedPage;
