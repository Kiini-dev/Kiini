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
var permissions_1 = require("@/lib/permissions");
var trpc_1 = require("@/lib/trpc");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var spinner_1 = require("@/components/ui/spinner");
var select_1 = require("@/components/ui/select");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var UnifiedModuleLayout_1 = require("@/components/UnifiedModuleLayout");
var checkbox_1 = require("@/components/ui/checkbox");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var DocumentBlockEditor_1 = require("@/components/DocumentBlockEditor");
var HTMLEditor_1 = require("@/components/HTMLEditor");
function CreateServiceTemplate() {
    var _this = this;
    var params = wouter_1.useParams();
    var templateId = params === null || params === void 0 ? void 0 : params.id;
    var isEditing = !!templateId;
    var canView = permissions_1.useRequireFeature("services:read").allowed;
    var canCreate = permissions_1.useRequireFeature("services:create").allowed;
    var canEdit = permissions_1.useRequireFeature("services:update").allowed;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var _b = react_1.useState({
        name: "",
        description: "",
        category: "",
        hourlyRate: undefined,
        fixedPrice: undefined,
        unit: "hour",
        taxRate: 0,
        estimatedDuration: undefined,
        deliverables: [],
        terms: "",
        isActive: true,
        templateContent: ""
    }), form = _b[0], setForm = _b[1];
    var _c = react_1.useState(false), isLoading = _c[0], setIsLoading = _c[1];
    var _d = react_1.useState(""), deliverableInput = _d[0], setDeliverableInput = _d[1];
    var _e = react_1.useState("block"), editorMode = _e[0], setEditorMode = _e[1];
    // Fetch existing template if editing
    var getQuery = trpc_1.trpc.serviceTemplates.getById.useQuery(templateId || "", {
        enabled: isEditing,
        onSuccess: function (data) {
            if (data) {
                setForm({
                    name: data.name,
                    description: data.description || "",
                    category: data.category || "",
                    hourlyRate: data.hourlyRate ? data.hourlyRate / 100 : undefined,
                    fixedPrice: data.fixedPrice ? data.fixedPrice / 100 : undefined,
                    unit: data.unit || "hour",
                    taxRate: data.taxRate || 0,
                    estimatedDuration: data.estimatedDuration,
                    deliverables: data.deliverables ? JSON.parse(data.deliverables) : [],
                    terms: data.terms || "",
                    isActive: data.isActive,
                    templateContent: data.templateContent || ""
                });
            }
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to load template: " + error.message);
            setLocation("/service-templates");
        }
    });
    // Create mutation
    var createMutation = trpc_1.trpc.serviceTemplates.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Service template created successfully");
            setLocation("/service-templates");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to create template: " + error.message);
            setIsLoading(false);
        }
    });
    // Update mutation
    var updateMutation = trpc_1.trpc.serviceTemplates.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Service template updated successfully");
            setLocation("/service-templates");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to update template: " + error.message);
            setIsLoading(false);
        }
    });
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var payload, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    payload = {
                        name: form.name,
                        description: form.description,
                        category: form.category,
                        hourlyRate: form.hourlyRate ? Math.round(form.hourlyRate * 100) : undefined,
                        fixedPrice: form.fixedPrice ? Math.round(form.fixedPrice * 100) : undefined,
                        unit: form.unit,
                        taxRate: form.taxRate || 0,
                        estimatedDuration: form.estimatedDuration,
                        deliverables: form.deliverables,
                        terms: form.terms,
                        isActive: form.isActive,
                        templateContent: form.templateContent
                    };
                    if (!isEditing) return [3 /*break*/, 3];
                    return [4 /*yield*/, updateMutation.mutateAsync(__assign({ id: templateId }, payload))];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, createMutation.mutateAsync(payload)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error("Error:", error_1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleAddDeliverable = function () {
        if (deliverableInput.trim()) {
            setForm(function (prev) { return (__assign(__assign({}, prev), { deliverables: __spreadArrays((prev.deliverables || []), [deliverableInput]) })); });
            setDeliverableInput("");
        }
    };
    var handleRemoveDeliverable = function (index) {
        setForm(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), { deliverables: (_a = prev.deliverables) === null || _a === void 0 ? void 0 : _a.filter(function (_, i) { return i !== index; }) }));
        });
    };
    var allowed = isEditing ? canEdit : canCreate;
    if (!allowed)
        return React.createElement("div", { className: "text-center py-10 text-red-600" }, "Access Denied");
    if (isEditing && getQuery.isLoading) {
        return React.createElement(spinner_1.Spinner, null);
    }
    return (React.createElement(UnifiedModuleLayout_1["default"], { pageTitle: isEditing ? "Edit Service Template" : "New Service Template", pageDescription: isEditing ? "Update service template details" : "Create a new service template for reuse", breadcrumbs: [
            { label: "Services", href: "/services" },
            { label: "Templates", href: "/service-templates" },
            { label: isEditing ? "Edit" : "Create", href: "#" },
        ], secondaryAction: {
            label: "Back",
            icon: lucide_react_1.ArrowLeft,
            onClick: function () { return setLocation("/service-templates"); }
        } },
        React.createElement(UnifiedModuleLayout_1.ContentSection, { title: isEditing ? "Edit Template" : "Create New Template", variant: "card" },
            React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                React.createElement("div", { className: "space-y-4" },
                    React.createElement("h3", { className: "font-semibold" }, "Basic Information"),
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "name" }, "Template Name *"),
                            React.createElement(input_1.Input, { id: "name", required: true, value: form.name, onChange: function (e) { return setForm(function (prev) { return (__assign(__assign({}, prev), { name: e.target.value })); }); }, placeholder: "e.g., Web Development Services" })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "category" }, "Category"),
                            React.createElement(input_1.Input, { id: "category", value: form.category, onChange: function (e) { return setForm(function (prev) { return (__assign(__assign({}, prev), { category: e.target.value })); }); }, placeholder: "e.g., Professional Services" }))),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "description" }, "Description"),
                        React.createElement(textarea_1.Textarea, { id: "description", value: form.description, onChange: function (e) { return setForm(function (prev) { return (__assign(__assign({}, prev), { description: e.target.value })); }); }, placeholder: "Describe the service...", rows: 4 }))),
                React.createElement("div", { className: "space-y-4 border-t pt-4" },
                    React.createElement("h3", { className: "font-semibold" }, "Pricing"),
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "hourlyRate" }, "Hourly Rate (KES)"),
                            React.createElement(input_1.Input, { id: "hourlyRate", type: "number", step: "0.01", value: form.hourlyRate || "", onChange: function (e) { return setForm(function (prev) { return (__assign(__assign({}, prev), { hourlyRate: e.target.value ? parseFloat(e.target.value) : undefined })); }); }, placeholder: "0.00" })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "fixedPrice" }, "Fixed Price (KES)"),
                            React.createElement(input_1.Input, { id: "fixedPrice", type: "number", step: "0.01", value: form.fixedPrice || "", onChange: function (e) { return setForm(function (prev) { return (__assign(__assign({}, prev), { fixedPrice: e.target.value ? parseFloat(e.target.value) : undefined })); }); }, placeholder: "0.00" })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "unit" }, "Unit"),
                            React.createElement(select_1.Select, { value: form.unit || "hour", onValueChange: function (value) { return setForm(function (prev) { return (__assign(__assign({}, prev), { unit: value })); }); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "hour" }, "Hour"),
                                    React.createElement(select_1.SelectItem, { value: "day" }, "Day"),
                                    React.createElement(select_1.SelectItem, { value: "week" }, "Week"),
                                    React.createElement(select_1.SelectItem, { value: "month" }, "Month"),
                                    React.createElement(select_1.SelectItem, { value: "project" }, "Project"),
                                    React.createElement(select_1.SelectItem, { value: "item" }, "Item"))))),
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "taxRate" }, "Tax Rate (%)"),
                            React.createElement(input_1.Input, { id: "taxRate", type: "number", step: "0.01", value: form.taxRate || 0, onChange: function (e) { return setForm(function (prev) { return (__assign(__assign({}, prev), { taxRate: parseFloat(e.target.value) })); }); }, placeholder: "0.00" })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "estimatedDuration" }, "Estimated Duration (hours)"),
                            React.createElement(input_1.Input, { id: "estimatedDuration", type: "number", step: "0.5", value: form.estimatedDuration || "", onChange: function (e) { return setForm(function (prev) { return (__assign(__assign({}, prev), { estimatedDuration: e.target.value ? parseFloat(e.target.value) : undefined })); }); }, placeholder: "40" })))),
                React.createElement("div", { className: "space-y-4 border-t pt-4" },
                    React.createElement("h3", { className: "font-semibold" }, "Deliverables"),
                    React.createElement("div", { className: "flex gap-2" },
                        React.createElement(input_1.Input, { value: deliverableInput, onChange: function (e) { return setDeliverableInput(e.target.value); }, placeholder: "Add a deliverable and press Add", onKeyPress: function (e) {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddDeliverable();
                                }
                            } }),
                        React.createElement(button_1.Button, { type: "button", onClick: handleAddDeliverable, variant: "outline" }, "Add")),
                    form.deliverables && form.deliverables.length > 0 && (React.createElement("div", { className: "space-y-2" }, form.deliverables.map(function (d, i) { return (React.createElement("div", { key: i, className: "flex justify-between items-center p-2 bg-gray-100 rounded" },
                        React.createElement("span", null, d),
                        React.createElement(button_1.Button, { type: "button", variant: "ghost", size: "sm", onClick: function () { return handleRemoveDeliverable(i); } }, "Remove"))); })))),
                React.createElement("div", { className: "space-y-4 border-t pt-4" },
                    React.createElement("h3", { className: "font-semibold" }, "Terms"),
                    React.createElement(textarea_1.Textarea, { value: form.terms, onChange: function (e) { return setForm(function (prev) { return (__assign(__assign({}, prev), { terms: e.target.value })); }); }, placeholder: "Enter terms and conditions...", rows: 4 })),
                React.createElement("div", { className: "space-y-4 border-t pt-4" },
                    React.createElement("h3", { className: "font-semibold" }, "Template Content"),
                    React.createElement("p", { className: "text-sm text-gray-600" }, "Create rich content using blocks or write raw HTML. This content can be used as a template for service delivery documents."),
                    React.createElement(tabs_1.Tabs, { defaultValue: editorMode, onValueChange: function (val) { return setEditorMode(val); }, className: "w-full" },
                        React.createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-3" },
                            React.createElement(tabs_1.TabsTrigger, { value: "block", className: "flex gap-2" },
                                React.createElement(lucide_react_1.Code, { className: "h-4 w-4" }),
                                "Blocks"),
                            React.createElement(tabs_1.TabsTrigger, { value: "richtext", className: "flex gap-2" },
                                React.createElement(lucide_react_1.Code, { className: "h-4 w-4" }),
                                "Rich Text"),
                            React.createElement(tabs_1.TabsTrigger, { value: "html", className: "flex gap-2" },
                                React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" }),
                                "HTML")),
                        React.createElement(tabs_1.TabsContent, { value: "block", className: "mt-4 space-y-4" },
                            React.createElement("div", { className: "text-sm text-gray-600 mb-4" }, "Drag and drop blocks to build your template content. Changes are saved automatically."),
                            React.createElement(DocumentBlockEditor_1["default"], { value: form.templateContent || "", onChange: function (html) { return setForm(function (prev) { return (__assign(__assign({}, prev), { templateContent: html })); }); }, minHeight: "500px", variables: [
                                    { label: "Service Name", value: "{{service_name}}" },
                                    { label: "Service Description", value: "{{service_description}}" },
                                    { label: "Service Date", value: "{{service_date}}" },
                                    { label: "Service Amount", value: "{{service_amount}}" },
                                    { label: "Client Name", value: "{{client_name}}" },
                                    { label: "Client Email", value: "{{client_email}}" },
                                    { label: "Company Name", value: "{{company_name}}" },
                                ] })),
                        React.createElement(tabs_1.TabsContent, { value: "richtext", className: "mt-4 space-y-4" },
                            React.createElement("div", { className: "text-sm text-gray-600 mb-4" }, "Use rich text formatting to design your template content with full text styling options."),
                            React.createElement(RichTextEditor_1.RichTextEditor, { value: form.templateContent || "", onChange: function (html) { return setForm(function (prev) { return (__assign(__assign({}, prev), { templateContent: html })); }); }, minHeight: "500px", enhanced: true, variables: [
                                    { label: "Service Name", value: "{{service_name}}" },
                                    { label: "Service Description", value: "{{service_description}}" },
                                    { label: "Service Date", value: "{{service_date}}" },
                                    { label: "Service Amount", value: "{{service_amount}}" },
                                    { label: "Client Name", value: "{{client_name}}" },
                                    { label: "Client Email", value: "{{client_email}}" },
                                    { label: "Company Name", value: "{{company_name}}" },
                                ] })),
                        React.createElement(tabs_1.TabsContent, { value: "html", className: "mt-4 space-y-4" },
                            React.createElement("div", { className: "text-sm text-gray-600 mb-4" }, "Write raw HTML code with syntax validation and preview. Use the quick buttons to insert template variables."),
                            React.createElement(HTMLEditor_1["default"], { value: form.templateContent || "", onChange: function (html) { return setForm(function (prev) { return (__assign(__assign({}, prev), { templateContent: html })); }); }, minHeight: "500px", height: "600px", variables: [
                                    { label: "Service Name", value: "{{service_name}}" },
                                    { label: "Service Description", value: "{{service_description}}" },
                                    { label: "Service Date", value: "{{service_date}}" },
                                    { label: "Service Amount", value: "{{service_amount}}" },
                                    { label: "Client Name", value: "{{client_name}}" },
                                    { label: "Client Email", value: "{{client_email}}" },
                                    { label: "Company Name", value: "{{company_name}}" },
                                ] })))),
                React.createElement("div", { className: "space-y-4 border-t pt-4" },
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement(checkbox_1.Checkbox, { checked: form.isActive !== false, onCheckedChange: function (checked) { return setForm(function (prev) { return (__assign(__assign({}, prev), { isActive: !!checked })); }); } }),
                        React.createElement(label_1.Label, null, "Active"))),
                React.createElement("div", { className: "flex gap-4 pt-4 border-t" },
                    React.createElement(button_1.Button, { type: "submit", disabled: isLoading || createMutation.isPending || updateMutation.isPending },
                        React.createElement(lucide_react_1.Save, { className: "w-4 h-4 mr-2" }),
                        isLoading ? "Saving..." : isEditing ? "Update Template" : "Create Template"),
                    React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return setLocation("/service-templates"); } }, "Cancel"))))));
}
exports["default"] = CreateServiceTemplate;
