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
exports.__esModule = true;
exports.ProductForm = void 0;
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var UNIT_OPTIONS = [
    { value: "pcs", label: "Pieces" },
    { value: "unit", label: "Unit" },
    { value: "kg", label: "Kilogram" },
    { value: "g", label: "Gram" },
    { value: "l", label: "Liter" },
    { value: "m", label: "Meter" },
    { value: "box", label: "Box" },
    { value: "pack", label: "Pack" },
    { value: "roll", label: "Roll" },
    { value: "set", label: "Set" },
    { value: "pair", label: "Pair" },
];
function ProductForm(_a) {
    var formData = _a.formData, setFormData = _a.setFormData, _b = _a.errors, errors = _b === void 0 ? {} : _b, onCancel = _a.onCancel, _c = _a.isSubmitting, isSubmitting = _c === void 0 ? false : _c;
    var _d = trpc_1.trpc.products.getCategories.useQuery({}).data, categories = _d === void 0 ? [] : _d;
    var handleInputChange = function (field) { return function (e) {
        var _a;
        setFormData(__assign(__assign({}, formData), (_a = {}, _a[field] = e.target.value, _a)));
    }; };
    var handleSelectChange = function (field) { return function (value) {
        var _a;
        setFormData(__assign(__assign({}, formData), (_a = {}, _a[field] = value, _a)));
    }; };
    var handleDescriptionChange = function (value) {
        setFormData(__assign(__assign({}, formData), { description: value }));
    };
    var defaultCategories = [
        "Electronics",
        "Software",
        "Hardware",
        "Services",
        "Consulting",
        "Training",
        "Support",
        "Other",
    ];
    var displayCategories = categories.length > 0 ? categories : defaultCategories;
    var FormField = function (_a) {
        var label = _a.label, error = _a.error, children = _a.children;
        return (React.createElement("div", { className: "space-y-2" },
            React.createElement(label_1.Label, null, label),
            children,
            error && React.createElement("p", { className: "text-sm text-red-500" }, error)));
    };
    return (React.createElement("form", { className: "space-y-6 max-w-5xl" },
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                    React.createElement(lucide_react_1.Package, { className: "h-5 w-5" }),
                    "Basic Information")),
            React.createElement(card_1.CardContent, { className: "space-y-4" },
                React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                    React.createElement(FormField, { label: "Product Name *", error: errors.productName },
                        React.createElement(input_1.Input, { placeholder: "Enter product name", value: formData.productName, onChange: handleInputChange("productName") })),
                    React.createElement(FormField, { label: "SKU", error: errors.sku },
                        React.createElement(input_1.Input, { placeholder: "e.g. PROD-001", value: formData.sku, onChange: handleInputChange("sku") }))),
                React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                    React.createElement(FormField, { label: "Category", error: errors.category },
                        React.createElement(select_1.Select, { value: formData.category, onValueChange: handleSelectChange("category") },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, { placeholder: "Select category" })),
                            React.createElement(select_1.SelectContent, null, displayCategories.map(function (cat) { return (React.createElement(select_1.SelectItem, { key: cat, value: cat }, cat)); })))),
                    React.createElement(FormField, { label: "Unit", error: errors.unit },
                        React.createElement(select_1.Select, { value: formData.unit, onValueChange: handleSelectChange("unit") },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null, UNIT_OPTIONS.map(function (u) { return (React.createElement(select_1.SelectItem, { key: u.value, value: u.value }, u.label)); }))))),
                React.createElement(FormField, { label: "Description", error: errors.description },
                    React.createElement(RichTextEditor_1.RichTextEditor, { value: formData.description, onChange: handleDescriptionChange, placeholder: "Describe the product \u2014 features, specifications, usage..." })))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Pricing")),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3" },
                    React.createElement(FormField, { label: "Unit Price (Ksh) *", error: errors.unitPrice },
                        React.createElement(input_1.Input, { type: "number", placeholder: "0.00", value: formData.unitPrice, onChange: handleInputChange("unitPrice"), step: "0.01", min: "0" })),
                    React.createElement(FormField, { label: "Cost Price (Ksh)", error: errors.costPrice },
                        React.createElement(input_1.Input, { type: "number", placeholder: "0.00", value: formData.costPrice, onChange: handleInputChange("costPrice"), step: "0.01", min: "0" })),
                    React.createElement(FormField, { label: "Tax Rate (%)", error: errors.taxRate },
                        React.createElement(input_1.Input, { type: "number", placeholder: "e.g. 16", value: formData.taxRate, onChange: handleInputChange("taxRate"), step: "0.01", min: "0", max: "100" }))))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Inventory")),
            React.createElement(card_1.CardContent, { className: "space-y-4" },
                React.createElement("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3" },
                    React.createElement(FormField, { label: "Current Quantity", error: errors.quantity },
                        React.createElement(input_1.Input, { type: "number", placeholder: "0", value: formData.quantity, onChange: handleInputChange("quantity"), min: "0" })),
                    React.createElement(FormField, { label: "Min Stock Level", error: errors.minStockLevel },
                        React.createElement(input_1.Input, { type: "number", placeholder: "0", value: formData.minStockLevel, onChange: handleInputChange("minStockLevel"), min: "0" })),
                    React.createElement(FormField, { label: "Max Stock Level", error: errors.maxStockLevel },
                        React.createElement(input_1.Input, { type: "number", placeholder: "0", value: formData.maxStockLevel, onChange: handleInputChange("maxStockLevel"), min: "0" }))),
                React.createElement("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4" },
                    React.createElement(FormField, { label: "Reorder Level", error: errors.reorderLevel },
                        React.createElement(input_1.Input, { type: "number", placeholder: "0", value: formData.reorderLevel, onChange: handleInputChange("reorderLevel"), min: "0" })),
                    React.createElement(FormField, { label: "Reorder Quantity", error: errors.reorderQuantity },
                        React.createElement(input_1.Input, { type: "number", placeholder: "0", value: formData.reorderQuantity, onChange: handleInputChange("reorderQuantity"), min: "0" })),
                    React.createElement(FormField, { label: "Status", error: errors.status },
                        React.createElement(select_1.Select, { value: formData.status, onValueChange: handleSelectChange("status") },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "active" }, "Active"),
                                React.createElement(select_1.SelectItem, { value: "inactive" }, "Inactive"))))))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Supplier & Location")),
            React.createElement(card_1.CardContent, { className: "space-y-4" },
                React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                    React.createElement(FormField, { label: "Supplier", error: errors.supplier },
                        React.createElement(input_1.Input, { placeholder: "Enter supplier name", value: formData.supplier, onChange: handleInputChange("supplier") })),
                    React.createElement(FormField, { label: "Storage Location", error: errors.location },
                        React.createElement(input_1.Input, { placeholder: "e.g. Warehouse A, Shelf 3-B", value: formData.location, onChange: handleInputChange("location") }))),
                React.createElement(FormField, { label: "Image URL", error: errors.imageUrl },
                    React.createElement(input_1.Input, { placeholder: "https://example.com/product.jpg", value: formData.imageUrl, onChange: handleInputChange("imageUrl") })))),
        onCancel && (React.createElement("div", { className: "flex gap-4" },
            React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: onCancel, disabled: isSubmitting },
                React.createElement(lucide_react_1.ArrowLeft, { className: "mr-2 h-4 w-4" }),
                " Cancel")))));
}
exports.ProductForm = ProductForm;
