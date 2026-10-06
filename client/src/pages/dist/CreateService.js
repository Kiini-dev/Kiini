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
var react_1 = require("react");
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var RichTextEditor_1 = require("@/components/RichTextEditor");
function CreateService() {
    var _a = permissions_1.useRequireFeature("services:create"), allowed = _a.allowed, isLoading = _a.isLoading;
    var _b = wouter_1.useLocation(), navigate = _b[1];
    var utils = trpc_1.trpc.useUtils();
    var _c = react_1.useState({ serviceName: "", description: "", serviceType: "", rate: "", unit: "hour", status: "active", hourlyRate: "", fixedPrice: "", taxRate: "", deliverables: [] }), formData = _c[0], setFormData = _c[1];
    var _d = react_1.useState(""), deliverableInput = _d[0], setDeliverableInput = _d[1];
    var _e = trpc_1.trpc.services.getCategories.useQuery({}).data, categories = _e === void 0 ? [] : _e;
    var _f = trpc_1.trpc.services.getUnits.useQuery({}).data, units = _f === void 0 ? [] : _f;
    var createServiceMutation = trpc_1.trpc.services.create.useMutation({ onSuccess: function () { sonner_1.toast.success("Service created successfully!"); utils.services.list.invalidate(); setFormData({ serviceName: "", description: "", serviceType: "", rate: "", unit: "hour", status: "active", hourlyRate: "", fixedPrice: "", taxRate: "", deliverables: [] }); setDeliverableInput(""); navigate("/services"); }, onError: function (error) { sonner_1.toast.error("Failed to create service: " + error.message); } });
    if (isLoading)
        return (React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" })));
    if (!allowed)
        return null;
    var handleSubmit = function (e) { e.preventDefault(); if (!formData.serviceName) {
        sonner_1.toast.error("Service name is required");
        return;
    } createServiceMutation.mutate({ serviceName: formData.serviceName, description: formData.description || undefined, serviceType: formData.serviceType || undefined, rate: formData.rate ? parseFloat(formData.rate) : undefined, unit: formData.unit || undefined, status: formData.status, hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined, fixedPrice: formData.fixedPrice ? parseFloat(formData.fixedPrice) : undefined, taxRate: formData.taxRate ? parseFloat(formData.taxRate) : undefined, deliverables: formData.deliverables.length > 0 ? formData.deliverables : undefined }); };
    var handleAddDeliverable = function () {
        var deliverable = deliverableInput.trim();
        if (!deliverable)
            return;
        setFormData(function (prev) { return (__assign(__assign({}, prev), { deliverables: __spreadArrays(prev.deliverables, [deliverable]) })); });
        setDeliverableInput("");
    };
    var handleRemoveDeliverable = function (index) {
        setFormData(function (prev) { return (__assign(__assign({}, prev), { deliverables: prev.deliverables.filter(function (_, i) { return i !== index; }) })); });
    };
    var defaultCategories = ["Consulting", "Development", "Design", "Support", "Training", "Maintenance", "Installation", "Repair", "Audit", "Assessment", "Integration", "Migration", "Other"];
    var displayCategories = categories.length > 0 ? categories : defaultCategories;
    var defaultUnits = [{ value: "hour", label: "Hour" }, { value: "day", label: "Day" }, { value: "week", label: "Week" }, { value: "month", label: "Month" }, { value: "quarter", label: "Quarter" }, { value: "year", label: "Year" }, { value: "project", label: "Project (Fixed)" }, { value: "unit", label: "Unit" }, { value: "item", label: "Item" }, { value: "session", label: "Session" }];
    var displayUnits = units.length > 0 ? units.map(function (u) { return ({ value: u, label: u.charAt(0).toUpperCase() + u.slice(1) }); }) : defaultUnits;
    var f = function (field) { return function (e) { return setFormData(function (p) {
        var _a;
        return (__assign(__assign({}, p), (_a = {}, _a[field] = e.target.value, _a)));
    }); }; };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Create Service", description: "Add a new service to your catalog", icon: React.createElement(lucide_react_1.Briefcase, { className: "w-6 h-6" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Services", href: "/services" }, { label: "Create Service" }] },
        React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6 max-w-5xl" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Basic Information")),
                React.createElement(card_1.CardContent, { className: "space-y-4" },
                    React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "serviceName" }, "Service Name *"),
                            React.createElement(input_1.Input, { id: "serviceName", placeholder: "Enter service name", value: formData.serviceName, onChange: f("serviceName") })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null, "Category"),
                            React.createElement(select_1.Select, { value: formData.serviceType, onValueChange: function (v) { return setFormData(function (p) { return (__assign(__assign({}, p), { serviceType: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, { placeholder: "Select category" })),
                                React.createElement(select_1.SelectContent, null, displayCategories.map(function (cat) { return (React.createElement(select_1.SelectItem, { key: cat, value: cat }, cat)); }))))),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Description"),
                        React.createElement(RichTextEditor_1.RichTextEditor, { value: formData.description, onChange: function (val) { return setFormData(function (p) { return (__assign(__assign({}, p), { description: val })); }); }, placeholder: "Describe the service \u2014 scope, deliverables, process..." })),
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement(label_1.Label, null, "Deliverables"),
                            React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: handleAddDeliverable, disabled: !deliverableInput.trim() },
                                React.createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
                                " Add")),
                        React.createElement("div", { className: "grid gap-2 md:grid-cols-[1fr_auto]" },
                            React.createElement(input_1.Input, { placeholder: "Enter a deliverable", value: deliverableInput, onChange: function (e) { return setDeliverableInput(e.target.value); } })),
                        formData.deliverables.length > 0 && (React.createElement("div", { className: "space-y-2" }, formData.deliverables.map(function (deliverable, index) { return (React.createElement("div", { key: index, className: "flex items-center justify-between rounded-md border p-3" },
                            React.createElement("span", { className: "text-sm text-muted-foreground" }, deliverable),
                            React.createElement(button_1.Button, { type: "button", variant: "ghost", size: "sm", onClick: function () { return handleRemoveDeliverable(index); } }, "Remove"))); })))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Pricing")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null, "Unit"),
                            React.createElement(select_1.Select, { value: formData.unit, onValueChange: function (v) { return setFormData(function (p) { return (__assign(__assign({}, p), { unit: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null, displayUnits.map(function (u) { return (React.createElement(select_1.SelectItem, { key: u.value, value: u.value }, u.label)); })))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "rate" },
                                "Rate per ",
                                formData.unit || "Unit",
                                " (Ksh)"),
                            React.createElement(input_1.Input, { id: "rate", type: "number", placeholder: "0.00", value: formData.rate, onChange: f("rate"), step: "0.01", min: "0" })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "hourlyRate" }, "Hourly Rate (Ksh)"),
                            React.createElement(input_1.Input, { id: "hourlyRate", type: "number", placeholder: "0.00", value: formData.hourlyRate, onChange: f("hourlyRate"), step: "0.01", min: "0" })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "fixedPrice" }, "Fixed Price (Ksh)"),
                            React.createElement(input_1.Input, { id: "fixedPrice", type: "number", placeholder: "0.00", value: formData.fixedPrice, onChange: f("fixedPrice"), step: "0.01", min: "0" }))),
                    React.createElement("div", { className: "grid gap-4 md:grid-cols-2 mt-4" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "taxRate" }, "Tax Rate (%)"),
                            React.createElement(input_1.Input, { id: "taxRate", type: "number", placeholder: "e.g. 16", value: formData.taxRate, onChange: f("taxRate"), step: "0.01", min: "0", max: "100" })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null, "Status"),
                            React.createElement(select_1.Select, { value: formData.status, onValueChange: function (v) { return setFormData(function (p) { return (__assign(__assign({}, p), { status: v })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "active" }, "Active"),
                                    React.createElement(select_1.SelectItem, { value: "inactive" }, "Inactive"))))))),
            React.createElement("div", { className: "flex gap-4" },
                React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return navigate("/services"); } },
                    React.createElement(lucide_react_1.ArrowLeft, { className: "mr-2 h-4 w-4" }),
                    " Cancel"),
                React.createElement(button_1.Button, { type: "submit", disabled: createServiceMutation.isPending }, createServiceMutation.isPending ? "Creating..." : "Create Service")))));
}
exports["default"] = CreateService;
