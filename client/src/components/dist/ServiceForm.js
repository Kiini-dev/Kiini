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
exports.ServiceForm = void 0;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var card_1 = require("@/components/ui/card");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
function ServiceForm(_a) {
    var onSuccess = _a.onSuccess, onCancel = _a.onCancel, initialData = _a.initialData;
    var _b = react_1.useState({
        serviceName: (initialData === null || initialData === void 0 ? void 0 : initialData.serviceName) || "",
        description: (initialData === null || initialData === void 0 ? void 0 : initialData.description) || "",
        serviceType: (initialData === null || initialData === void 0 ? void 0 : initialData.serviceType) || "",
        rate: (initialData === null || initialData === void 0 ? void 0 : initialData.rate) || "",
        unit: (initialData === null || initialData === void 0 ? void 0 : initialData.unit) || "hour",
        status: (initialData === null || initialData === void 0 ? void 0 : initialData.status) || "active"
    }), formData = _b[0], setFormData = _b[1];
    var _c = trpc_1.trpc.services.getCategories.useQuery({}).data, categories = _c === void 0 ? [] : _c;
    var _d = trpc_1.trpc.services.getUnits.useQuery({}).data, units = _d === void 0 ? [] : _d;
    var createServiceMutation = trpc_1.trpc.services.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Service created successfully");
            setFormData({
                serviceName: "",
                description: "",
                serviceType: "",
                rate: "",
                unit: "hour",
                status: "active"
            });
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to create service");
        }
    });
    var updateServiceMutation = trpc_1.trpc.services.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Service updated successfully");
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to update service");
        }
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!formData.serviceName || !formData.rate) {
            sonner_1.toast.error("Please fill in all required fields");
            return;
        }
        var serviceData = {
            serviceName: formData.serviceName,
            description: formData.description,
            serviceType: formData.serviceType,
            rate: parseFloat(formData.rate),
            unit: formData.unit,
            status: formData.status
        };
        if (initialData === null || initialData === void 0 ? void 0 : initialData.id) {
            updateServiceMutation.mutate(__assign({ id: initialData.id }, serviceData));
        }
        else {
            createServiceMutation.mutate(serviceData);
        }
    };
    var isLoading = createServiceMutation.isPending || updateServiceMutation.isPending;
    return (React.createElement(card_1.Card, null,
        React.createElement(card_1.CardHeader, null,
            React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                React.createElement(lucide_react_1.Wrench, { className: "h-5 w-5" }),
                initialData ? "Edit Service" : "Create New Service"),
            React.createElement(card_1.CardDescription, null, initialData ? "Update service details" : "Add a new service to your offerings")),
        React.createElement(card_1.CardContent, null,
            React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, { htmlFor: "serviceName" }, "Service Name *"),
                        React.createElement(input_1.Input, { id: "serviceName", placeholder: "e.g., Web Development", value: formData.serviceName, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { serviceName: e.target.value })); }, required: true })),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, { htmlFor: "serviceType" }, "Category"),
                        React.createElement(select_1.Select, { value: formData.serviceType, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { serviceType: value })); } },
                            React.createElement(select_1.SelectTrigger, { id: "serviceType" },
                                React.createElement(select_1.SelectValue, { placeholder: "Select or type category" })),
                            React.createElement(select_1.SelectContent, null, categories.map(function (cat) { return (React.createElement(select_1.SelectItem, { key: cat, value: cat }, cat)); })))),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, { htmlFor: "rate" }, "Rate (Ksh) *"),
                        React.createElement(input_1.Input, { id: "rate", type: "number", placeholder: "0.00", step: "0.01", min: "0", value: formData.rate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { rate: e.target.value })); }, required: true })),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, { htmlFor: "unit" }, "Unit *"),
                        React.createElement(select_1.Select, { value: formData.unit, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { unit: value })); } },
                            React.createElement(select_1.SelectTrigger, { id: "unit" },
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null, units.map(function (u) { return (React.createElement(select_1.SelectItem, { key: u, value: u }, u.charAt(0).toUpperCase() + u.slice(1))); })))),
                    React.createElement("div", { className: "space-y-2 md:col-span-2" },
                        React.createElement(label_1.Label, { htmlFor: "status" }, "Status"),
                        React.createElement(select_1.Select, { value: formData.status, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { status: value })); } },
                            React.createElement(select_1.SelectTrigger, { id: "status" },
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "active" }, "Active"),
                                React.createElement(select_1.SelectItem, { value: "inactive" }, "Inactive"))))),
                React.createElement("div", { className: "space-y-2" },
                    React.createElement(label_1.Label, { htmlFor: "description" }, "Description"),
                    React.createElement(textarea_1.Textarea, { id: "description", placeholder: "Add service details, what's included, etc...", value: formData.description, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { description: e.target.value })); }, rows: 4 })),
                React.createElement("div", { className: "flex gap-2 justify-end pt-4 border-t" },
                    onCancel && (React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: onCancel, disabled: isLoading }, "Cancel")),
                    React.createElement(button_1.Button, { type: "submit", disabled: isLoading },
                        isLoading && React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
                        initialData ? "Update Service" : "Create Service"))))));
}
exports.ServiceForm = ServiceForm;
