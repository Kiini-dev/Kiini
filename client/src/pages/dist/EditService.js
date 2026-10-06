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
var textarea_1 = require("@/components/ui/textarea");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
function EditService() {
    var _a = permissions_1.useRequireFeature("services:edit"), allowed = _a.allowed, isLoading = _a.isLoading;
    var params = wouter_1.useParams();
    var _b = wouter_1.useLocation(), navigate = _b[1];
    var utils = trpc_1.trpc.useUtils();
    var serviceId = params.id;
    var _c = react_1.useState({
        name: "",
        description: "",
        category: "",
        hourlyRate: "",
        fixedPrice: "",
        unit: "hour",
        taxRate: "",
        isActive: true,
        deliverables: []
    }), formData = _c[0], setFormData = _c[1];
    var _d = react_1.useState(""), deliverableInput = _d[0], setDeliverableInput = _d[1];
    // Fetch service data
    var _e = trpc_1.trpc.services.getById.useQuery(serviceId || "", {
        enabled: !!serviceId
    }), service = _e.data, isLoadingServiceData = _e.isLoading;
    // Fetch categories and units for dropdowns
    var _f = trpc_1.trpc.services.getCategories.useQuery({}).data, categories = _f === void 0 ? [] : _f;
    var _g = trpc_1.trpc.services.getUnits.useQuery({}).data, units = _g === void 0 ? [] : _g;
    // ALL HOOKS MUST BE CALLED BEFORE PERMISSION CHECKS
    if (isLoading)
        return React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" }));
    if (!allowed)
        return null;
    // Default categories if none exist in database
    var defaultCategories = [
        "Consulting",
        "Development",
        "Design",
        "Support",
        "Training",
        "Maintenance",
        "Installation",
        "Repair",
        "Other",
    ];
    var displayCategories = categories.length > 0 ? categories : defaultCategories;
    // Default units
    var defaultUnits = [
        { value: "hour", label: "Hour" },
        { value: "day", label: "Day" },
        { value: "week", label: "Week" },
        { value: "month", label: "Month" },
        { value: "project", label: "Project" },
        { value: "unit", label: "Unit" },
        { value: "item", label: "Item" },
        { value: "service", label: "Service" },
    ];
    var displayUnits = units.length > 0
        ? units.map(function (u) { return ({ value: u, label: u.charAt(0).toUpperCase() + u.slice(1) }); })
        : defaultUnits;
    // Populate form when service data loads
    react_1.useEffect(function () {
        if (service) {
            setFormData({
                name: service.name || "",
                description: service.description || "",
                category: service.category || "",
                hourlyRate: service.hourlyRate ? (service.hourlyRate / 100).toString() : "",
                fixedPrice: service.fixedPrice ? (service.fixedPrice / 100).toString() : "",
                unit: service.unit || "hour",
                taxRate: service.taxRate ? (service.taxRate / 100).toString() : "",
                isActive: service.isActive !== 0,
                deliverables: Array.isArray(service.deliverables)
                    ? service.deliverables
                    : typeof service.deliverables === "string"
                        ? (function () {
                            try {
                                return JSON.parse(service.deliverables);
                            }
                            catch (_a) {
                                return [service.deliverables];
                            }
                        })()
                        : []
            });
        }
    }, [service]);
    var updateServiceMutation = trpc_1.trpc.services.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Service updated successfully!");
            utils.services.list.invalidate();
            utils.services.getById.invalidate(serviceId || "");
            navigate("/services");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to update service: " + error.message);
        }
    });
    var deleteServiceMutation = trpc_1.trpc.services["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Service deleted successfully!");
            utils.services.list.invalidate();
            navigate("/services");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to delete service: " + error.message);
        }
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!formData.name) {
            sonner_1.toast.error("Service name is required");
            return;
        }
        if (!serviceId) {
            sonner_1.toast.error("Service ID is missing");
            return;
        }
        updateServiceMutation.mutate({
            id: serviceId,
            name: formData.name,
            description: formData.description || undefined,
            category: formData.category || undefined,
            hourlyRate: formData.hourlyRate ? Math.round(parseFloat(formData.hourlyRate) * 100) : undefined,
            fixedPrice: formData.fixedPrice ? Math.round(parseFloat(formData.fixedPrice) * 100) : undefined,
            unit: formData.unit || "hour",
            taxRate: formData.taxRate ? Math.round(parseFloat(formData.taxRate) * 100) : undefined,
            deliverables: formData.deliverables.length > 0 ? formData.deliverables : undefined,
            // Map boolean to API `status` enum for compatibility
            status: formData.isActive ? 'active' : 'inactive'
        });
    };
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
    var handleDelete = function () {
        if (confirm("Are you sure you want to delete this service? This action cannot be undone.")) {
            deleteServiceMutation.mutate(serviceId || "");
        }
    };
    if (isLoadingServiceData) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Service", description: "Loading service details...", icon: React.createElement(lucide_react_1.Briefcase, { className: "w-6 h-6" }), breadcrumbs: [
                { label: "Dashboard", href: "/crm-home" },
                { label: "Products & Services", href: "/services" },
                { label: "Edit Service" },
            ] },
            React.createElement("div", { className: "flex items-center justify-center h-96" },
                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Service", description: "Update service details", icon: React.createElement(lucide_react_1.Briefcase, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Products & Services", href: "/services" },
            { label: "Edit Service" },
        ] },
        React.createElement("div", { className: "max-w-2xl" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Edit Service"),
                    React.createElement(card_1.CardDescription, null, "Update the service details below")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "name" }, "Service Name *"),
                            React.createElement(input_1.Input, { id: "name", placeholder: "Enter service name", value: formData.name, onChange: function (e) {
                                    return setFormData(__assign(__assign({}, formData), { name: e.target.value }));
                                } })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "description" }, "Description"),
                            React.createElement(textarea_1.Textarea, { id: "description", placeholder: "Enter service description", value: formData.description, onChange: function (e) {
                                    return setFormData(__assign(__assign({}, formData), { description: e.target.value }));
                                }, rows: 4 })),
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
                                React.createElement(button_1.Button, { type: "button", variant: "ghost", size: "sm", onClick: function () { return handleRemoveDeliverable(index); } }, "Remove"))); })))),
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "category" }, "Category"),
                                React.createElement(select_1.Select, { value: formData.category, onValueChange: function (value) {
                                        return setFormData(__assign(__assign({}, formData), { category: value }));
                                    } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Select category" })),
                                    React.createElement(select_1.SelectContent, null, displayCategories.map(function (cat) { return (React.createElement(select_1.SelectItem, { key: cat, value: cat }, cat)); })))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "unit" }, "Unit"),
                                React.createElement(select_1.Select, { value: formData.unit, onValueChange: function (value) {
                                        return setFormData(__assign(__assign({}, formData), { unit: value }));
                                    } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Select unit" })),
                                    React.createElement(select_1.SelectContent, null, displayUnits.map(function (unit) { return (React.createElement(select_1.SelectItem, { key: unit.value, value: unit.value }, unit.label)); }))))),
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "hourlyRate" }, "Hourly Rate (Ksh)"),
                                React.createElement(input_1.Input, { id: "hourlyRate", type: "number", placeholder: "0.00", value: formData.hourlyRate, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { hourlyRate: e.target.value }));
                                    }, step: "0.01", min: "0" })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "fixedPrice" }, "Fixed Price (Ksh)"),
                                React.createElement(input_1.Input, { id: "fixedPrice", type: "number", placeholder: "0.00", value: formData.fixedPrice, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { fixedPrice: e.target.value }));
                                    }, step: "0.01", min: "0" }))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "taxRate" }, "Tax Rate (%)"),
                            React.createElement(input_1.Input, { id: "taxRate", type: "number", placeholder: "0", value: formData.taxRate, onChange: function (e) {
                                    return setFormData(__assign(__assign({}, formData), { taxRate: e.target.value }));
                                }, step: "0.01", min: "0", max: "100" })),
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement("input", { type: "checkbox", id: "isActive", checked: formData.isActive, onChange: function (e) {
                                    return setFormData(__assign(__assign({}, formData), { isActive: e.target.checked }));
                                }, className: "rounded border-gray-300" }),
                            React.createElement(label_1.Label, { htmlFor: "isActive" }, "Active")),
                        React.createElement("div", { className: "flex gap-4 justify-between" },
                            React.createElement(button_1.Button, { type: "button", variant: "destructive", onClick: handleDelete, disabled: deleteServiceMutation.isPending },
                                deleteServiceMutation.isPending ? (React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })) : (React.createElement(lucide_react_1.Trash2, { className: "mr-2 h-4 w-4" })),
                                "Delete Service"),
                            React.createElement("div", { className: "flex gap-2" },
                                React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return navigate("/services"); } },
                                    React.createElement(lucide_react_1.ArrowLeft, { className: "mr-2 h-4 w-4" }),
                                    "Cancel"),
                                React.createElement(button_1.Button, { type: "submit", disabled: updateServiceMutation.isPending },
                                    updateServiceMutation.isPending ? (React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })) : (React.createElement(lucide_react_1.Save, { className: "mr-2 h-4 w-4" })),
                                    "Update Service")))))))));
}
exports["default"] = EditService;
