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
var react_1 = require("react");
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var spinner_1 = require("@/components/ui/spinner");
function CreateWarranty() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = react_1.useState({
        product: "",
        vendor: "",
        expiryDate: "",
        coverage: "",
        status: "active",
        serialNumber: "",
        claimTerms: "",
        notes: ""
    }), formData = _b[0], setFormData = _b[1];
    var createMutation = trpc_1.trpc.warranty.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Warranty created successfully!");
            navigate("/warranty");
        },
        onError: function (err) { return sonner_1.toast.error("Failed to create warranty: " + err.message); }
    });
    var update = function (field, value) {
        return setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[field] = value, _a)));
        });
    };
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!formData.product || !formData.vendor) {
            sonner_1.toast.error("Product and vendor are required");
            return;
        }
        createMutation.mutate({
            product: formData.product,
            vendor: formData.vendor,
            expiryDate: formData.expiryDate,
            coverage: formData.coverage,
            status: formData.status,
            serialNumber: formData.serialNumber || undefined,
            claimTerms: formData.claimTerms || undefined,
            notes: formData.notes || undefined
        });
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Add Warranty", icon: React.createElement(lucide_react_1.Shield, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Warranties", href: "/warranty" },
            { label: "Add Warranty" },
        ], actions: React.createElement("div", { className: "flex gap-2" },
            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return navigate("/warranty"); } }, "Cancel"),
            React.createElement(button_1.Button, { onClick: handleSubmit, disabled: createMutation.isPending },
                createMutation.isPending ? React.createElement(spinner_1.Spinner, { className: "mr-2 h-4 w-4" }) : null,
                "Create Warranty")) },
        React.createElement("form", { onSubmit: handleSubmit, className: "max-w-3xl space-y-6" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Warranty Details")),
                React.createElement(card_1.CardContent, { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "product" }, "Product *"),
                        React.createElement(input_1.Input, { id: "product", value: formData.product, onChange: function (e) { return update("product", e.target.value); }, required: true })),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "vendor" }, "Vendor *"),
                        React.createElement(input_1.Input, { id: "vendor", value: formData.vendor, onChange: function (e) { return update("vendor", e.target.value); }, required: true })),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "serialNumber" }, "Serial Number"),
                        React.createElement(input_1.Input, { id: "serialNumber", value: formData.serialNumber, onChange: function (e) { return update("serialNumber", e.target.value); } })),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "expiryDate" }, "Expiry Date"),
                        React.createElement(input_1.Input, { id: "expiryDate", type: "date", value: formData.expiryDate, onChange: function (e) { return update("expiryDate", e.target.value); } })),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "coverage" }, "Coverage"),
                        React.createElement(input_1.Input, { id: "coverage", value: formData.coverage, onChange: function (e) { return update("coverage", e.target.value); }, placeholder: "e.g. Full parts & labor" })),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "status" }, "Status"),
                        React.createElement(select_1.Select, { value: formData.status, onValueChange: function (v) { return update("status", v); } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "active" }, "Active"),
                                React.createElement(select_1.SelectItem, { value: "expiring_soon" }, "Expiring Soon"),
                                React.createElement(select_1.SelectItem, { value: "expired" }, "Expired")))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Additional Information")),
                React.createElement(card_1.CardContent, { className: "space-y-4" },
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "claimTerms" }, "Claim Terms"),
                        React.createElement(RichTextEditor_1.RichTextEditor, { value: formData.claimTerms, onChange: function (html) { return update("claimTerms", html); }, minHeight: "100px" })),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "notes" }, "Notes"),
                        React.createElement(RichTextEditor_1.RichTextEditor, { value: formData.notes, onChange: function (html) { return update("notes", html); }, minHeight: "100px" })))))));
}
exports["default"] = CreateWarranty;
