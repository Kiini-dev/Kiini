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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.ProcurementFormComponent = void 0;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var separator_1 = require("@/components/ui/separator");
var card_1 = require("@/components/ui/card");
var collapsible_1 = require("@/components/ui/collapsible");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
function ProcurementFormComponent(_a) {
    var _b, _c, _d, _e;
    var title = _a.title, type = _a.type, onSubmit = _a.onSubmit;
    var _f = react_1.useState("manual"), supplierMode = _f[0], setSupplierMode = _f[1];
    var _g = react_1.useState(false), showAdditionalInfo = _g[0], setShowAdditionalInfo = _g[1];
    var suppliersData = ((_e = (_d = (_c = (_b = trpc_1.trpc.suppliers) === null || _b === void 0 ? void 0 : _b.list) === null || _c === void 0 ? void 0 : _c.useQuery) === null || _d === void 0 ? void 0 : _d.call(_c)) !== null && _e !== void 0 ? _e : { data: undefined }).data;
    var _h = react_1.useState({
        documentNumber: "",
        supplier: "",
        supplierContact: "",
        deliveryAddress: "",
        deliveryDate: "",
        notes: "",
        lineItems: [
            {
                itemNumber: "001",
                itemName: "",
                description: "",
                quantity: 0,
                unitPrice: 0,
                discount: 0,
                discountPercent: 0,
                amount: 0
            },
        ]
    }), formData = _h[0], setFormData = _h[1];
    var addLineItem = function () {
        setFormData(function (prev) { return (__assign(__assign({}, prev), { lineItems: __spreadArrays(prev.lineItems, [
                {
                    itemNumber: String(prev.lineItems.length + 1).padStart(3, "0"),
                    itemName: "",
                    description: "",
                    quantity: 0,
                    unitPrice: 0,
                    discount: 0,
                    discountPercent: 0,
                    amount: 0
                },
            ]) })); });
    };
    var removeLineItem = function (index) {
        if (formData.lineItems.length > 1) {
            setFormData(function (prev) { return (__assign(__assign({}, prev), { lineItems: prev.lineItems.filter(function (_, i) { return i !== index; }) })); });
        }
    };
    var updateLineItem = function (index, field, value) {
        setFormData(function (prev) {
            var _a;
            var items = __spreadArrays(prev.lineItems);
            var item = __assign(__assign({}, items[index]), (_a = {}, _a[field] = value, _a));
            // Calculate amount based on quantity, unit price, and discount
            if (field === "quantity" || field === "unitPrice" || field === "discountPercent") {
                var subtotal_1 = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                var discountAmount = subtotal_1 * ((Number(item.discountPercent) || 0) / 100);
                item.discount = Math.round(discountAmount * 100) / 100;
                item.amount = Math.round((subtotal_1 - item.discount) * 100) / 100;
            }
            else if (field === "discount") {
                var subtotal_2 = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                item.discount = Number(value);
                item.discountPercent = subtotal_2 > 0 ? Math.round((item.discount / subtotal_2) * 10000) / 100 : 0;
                item.amount = Math.round((subtotal_2 - item.discount) * 100) / 100;
            }
            items[index] = item;
            return __assign(__assign({}, prev), { lineItems: items });
        });
    };
    var totalAmount = formData.lineItems.reduce(function (sum, item) { return sum + (item.amount || 0); }, 0);
    var totalDiscount = formData.lineItems.reduce(function (sum, item) { return sum + (item.discount || 0); }, 0);
    var subtotal = formData.lineItems.reduce(function (sum, item) { return sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0); }, 0);
    var handleSubmit = function (e) {
        e.preventDefault();
        onSubmit(formData);
    };
    return (react_1["default"].createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
        react_1["default"].createElement(card_1.Card, { className: "p-6" },
            react_1["default"].createElement("h2", { className: "text-xl font-bold mb-6" }, title),
            react_1["default"].createElement("div", { className: "space-y-4 mb-6" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                    react_1["default"].createElement(label_1.Label, { className: "text-base font-semibold" }, "Supplier / Vendor")),
                react_1["default"].createElement("div", { className: "grid gap-4" },
                    react_1["default"].createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                        react_1["default"].createElement(label_1.Label, { className: "text-right text-sm" }, "Supplier *"),
                        react_1["default"].createElement(input_1.Input, { type: "text", value: formData.supplier, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { supplier: e.target.value })); }, placeholder: "Enter supplier / vendor name", required: true })),
                    react_1["default"].createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                        react_1["default"].createElement(label_1.Label, { className: "text-right text-sm" }, "Contact Person"),
                        react_1["default"].createElement(input_1.Input, { type: "text", value: formData.supplierContact, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { supplierContact: e.target.value })); }, placeholder: "Contact person name" })))),
            react_1["default"].createElement(separator_1.Separator, { className: "my-4" }),
            react_1["default"].createElement("div", { className: "grid gap-4" },
                react_1["default"].createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                    react_1["default"].createElement(label_1.Label, { className: "text-right text-sm" }, "Document No."),
                    react_1["default"].createElement(input_1.Input, { type: "text", value: formData.documentNumber, readOnly: true, className: "bg-muted cursor-not-allowed font-mono max-w-xs", placeholder: "Auto-generated" })),
                react_1["default"].createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                    react_1["default"].createElement(label_1.Label, { className: "text-right text-sm" }, "Delivery Date *"),
                    react_1["default"].createElement(input_1.Input, { type: "date", value: formData.deliveryDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { deliveryDate: e.target.value })); }, required: true, className: "max-w-xs" })),
                react_1["default"].createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                    react_1["default"].createElement(label_1.Label, { className: "text-right text-sm" }, "Delivery Address *"),
                    react_1["default"].createElement(input_1.Input, { type: "text", value: formData.deliveryAddress, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { deliveryAddress: e.target.value })); }, placeholder: "Complete delivery address", required: true }))),
            react_1["default"].createElement(separator_1.Separator, { className: "my-4" }),
            react_1["default"].createElement(collapsible_1.Collapsible, { open: showAdditionalInfo, onOpenChange: setShowAdditionalInfo },
                react_1["default"].createElement(collapsible_1.CollapsibleTrigger, { asChild: true },
                    react_1["default"].createElement("button", { type: "button", className: "flex items-center justify-between w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" },
                        react_1["default"].createElement("span", null, "Additional Information"),
                        showAdditionalInfo ? react_1["default"].createElement(lucide_react_1.ChevronUp, { className: "h-4 w-4" }) : react_1["default"].createElement(lucide_react_1.ChevronDown, { className: "h-4 w-4" }))),
                react_1["default"].createElement(collapsible_1.CollapsibleContent, { className: "space-y-4 pt-3" },
                    react_1["default"].createElement("div", { className: "grid grid-cols-[140px_1fr] items-start gap-3" },
                        react_1["default"].createElement(label_1.Label, { className: "text-right text-sm pt-2" }, "Notes"),
                        react_1["default"].createElement(textarea_1.Textarea, { value: formData.notes, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { notes: e.target.value })); }, placeholder: "Additional notes or special instructions", rows: 3 }))))),
        react_1["default"].createElement(card_1.Card, { className: "p-6" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between mb-4" },
                react_1["default"].createElement("h2", { className: "text-xl font-semibold" }, "Line Items"),
                react_1["default"].createElement(button_1.Button, { type: "button", onClick: addLineItem, size: "sm", variant: "outline", className: "gap-2" },
                    react_1["default"].createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
                    "Add Item")),
            react_1["default"].createElement("div", { className: "overflow-x-auto" },
                react_1["default"].createElement("table", { className: "w-full text-sm" },
                    react_1["default"].createElement("thead", null,
                        react_1["default"].createElement("tr", { className: "border-b-2 border-gray-300 dark:border-gray-600" },
                            react_1["default"].createElement("th", { className: "text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300" }, "Item #"),
                            react_1["default"].createElement("th", { className: "text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300" }, "Item Name *"),
                            react_1["default"].createElement("th", { className: "text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300" }, "Description"),
                            react_1["default"].createElement("th", { className: "text-right py-3 px-2 font-semibold text-gray-700 dark:text-gray-300" }, "Qty *"),
                            react_1["default"].createElement("th", { className: "text-right py-3 px-2 font-semibold text-gray-700 dark:text-gray-300" }, "Unit Price *"),
                            react_1["default"].createElement("th", { className: "text-right py-3 px-2 font-semibold text-gray-700 dark:text-gray-300" }, "Discount %"),
                            react_1["default"].createElement("th", { className: "text-right py-3 px-2 font-semibold text-gray-700 dark:text-gray-300" }, "Amount"),
                            react_1["default"].createElement("th", { className: "text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-300" }, "Action"))),
                    react_1["default"].createElement("tbody", null, formData.lineItems.map(function (item, idx) { return (react_1["default"].createElement("tr", { key: idx, className: "border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800" },
                        react_1["default"].createElement("td", { className: "py-3 px-2" },
                            react_1["default"].createElement("span", { className: "text-gray-600 dark:text-gray-400" }, item.itemNumber)),
                        react_1["default"].createElement("td", { className: "py-3 px-2" },
                            react_1["default"].createElement(input_1.Input, { type: "text", value: item.itemName, onChange: function (e) { return updateLineItem(idx, "itemName", e.target.value); }, placeholder: "Item name", required: true, className: "w-full" })),
                        react_1["default"].createElement("td", { className: "py-3 px-2" },
                            react_1["default"].createElement(input_1.Input, { type: "text", value: item.description, onChange: function (e) { return updateLineItem(idx, "description", e.target.value); }, placeholder: "Description", className: "w-full" })),
                        react_1["default"].createElement("td", { className: "py-3 px-2" },
                            react_1["default"].createElement(input_1.Input, { type: "number", value: item.quantity || "", onChange: function (e) { return updateLineItem(idx, "quantity", parseFloat(e.target.value) || 0); }, placeholder: "0", step: "0.01", min: "0", required: true, className: "w-full text-right" })),
                        react_1["default"].createElement("td", { className: "py-3 px-2" },
                            react_1["default"].createElement(input_1.Input, { type: "number", value: item.unitPrice || "", onChange: function (e) { return updateLineItem(idx, "unitPrice", parseFloat(e.target.value) || 0); }, placeholder: "0.00", step: "0.01", min: "0", required: true, className: "w-full text-right" })),
                        react_1["default"].createElement("td", { className: "py-3 px-2" },
                            react_1["default"].createElement(input_1.Input, { type: "number", value: item.discountPercent || "", onChange: function (e) { return updateLineItem(idx, "discountPercent", parseFloat(e.target.value) || 0); }, placeholder: "0", step: "0.01", min: "0", max: "100", className: "w-full text-right" })),
                        react_1["default"].createElement("td", { className: "py-3 px-2 text-right font-semibold text-gray-900 dark:text-white" }, item.amount.toFixed(2)),
                        react_1["default"].createElement("td", { className: "py-3 px-2 text-center" },
                            react_1["default"].createElement("button", { type: "button", onClick: function () { return removeLineItem(idx); }, className: "text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50", disabled: formData.lineItems.length === 1, title: "Remove item" },
                                react_1["default"].createElement(lucide_react_1.X, { className: "h-4 w-4" }))))); })))),
            react_1["default"].createElement("div", { className: "flex justify-end mt-6" },
                react_1["default"].createElement("div", { className: "w-80 space-y-2" },
                    react_1["default"].createElement("div", { className: "flex justify-between text-sm" },
                        react_1["default"].createElement("span", { className: "text-muted-foreground" }, "Subtotal:"),
                        react_1["default"].createElement("span", { className: "font-mono" }, subtotal.toFixed(2))),
                    react_1["default"].createElement("div", { className: "flex justify-between text-sm" },
                        react_1["default"].createElement("span", { className: "text-muted-foreground" }, "Total Discount:"),
                        react_1["default"].createElement("span", { className: "font-mono text-orange-500" },
                            "-",
                            totalDiscount.toFixed(2))),
                    react_1["default"].createElement(separator_1.Separator, null),
                    react_1["default"].createElement("div", { className: "flex justify-between text-lg font-bold" },
                        react_1["default"].createElement("span", null, "Total Amount:"),
                        react_1["default"].createElement("span", { className: "font-mono text-primary" }, totalAmount.toFixed(2)))))),
        react_1["default"].createElement("div", { className: "flex justify-between items-center" },
            react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" },
                react_1["default"].createElement("strong", null, "* Required")),
            react_1["default"].createElement("div", { className: "flex gap-2" },
                react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline" }, "Save as Draft"),
                react_1["default"].createElement(button_1.Button, { type: "submit" }, "Submit for Approval")))));
}
exports.ProcurementFormComponent = ProcurementFormComponent;
