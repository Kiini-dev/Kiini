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
var textarea_1 = require("@/components/ui/textarea");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
function CreateDepartment() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var utils = trpc_1.trpc.useUtils();
    var _b = react_1.useState({
        name: "",
        description: "",
        budget: "",
        headId: "",
        isActive: true
    }), formData = _b[0], setFormData = _b[1];
    // Fetch employees for department head selector
    var _c = trpc_1.trpc.employees.list.useQuery({}).data, employees = _c === void 0 ? [] : _c;
    var createDepartmentMutation = trpc_1.trpc.departments.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Department created successfully!");
            utils.departments.list.invalidate();
            navigate("/departments");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to create department: " + error.message);
        }
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!formData.name) {
            sonner_1.toast.error("Department name is required");
            return;
        }
        createDepartmentMutation.mutate({
            name: formData.name,
            description: formData.description || undefined,
            budget: formData.budget ? Math.round(parseFloat(formData.budget) * 100) : undefined,
            headId: formData.headId || undefined,
            isActive: formData.isActive
        });
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Create Department", description: "Add a new department to your organization", icon: React.createElement(lucide_react_1.Building2, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "HR", href: "/hr" },
            { label: "Departments", href: "/departments" },
            { label: "Create Department" },
        ] },
        React.createElement("div", { className: "max-w-2xl" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Create Department"),
                    React.createElement(card_1.CardDescription, null, "Enter the department details below to create a new department")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "name" }, "Department Name *"),
                            React.createElement(input_1.Input, { id: "name", placeholder: "e.g., Engineering", value: formData.name, onChange: function (e) {
                                    return setFormData(__assign(__assign({}, formData), { name: e.target.value }));
                                } })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "description" }, "Description"),
                            React.createElement(textarea_1.Textarea, { id: "description", placeholder: "Enter department description", value: formData.description, onChange: function (e) {
                                    return setFormData(__assign(__assign({}, formData), { description: e.target.value }));
                                }, rows: 4 })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "headId" }, "Department Head"),
                            React.createElement(select_1.Select, { value: formData.headId, onValueChange: function (value) {
                                    return setFormData(__assign(__assign({}, formData), { headId: value }));
                                } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, { placeholder: "Select department head (optional)" })),
                                React.createElement(select_1.SelectContent, null, employees.map(function (emp) { return (React.createElement(select_1.SelectItem, { key: emp.id, value: emp.id },
                                    emp.firstName,
                                    " ",
                                    emp.lastName,
                                    " - ",
                                    emp.position || emp.department)); })))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "budget" }, "Annual Budget (Ksh)"),
                            React.createElement(input_1.Input, { id: "budget", type: "number", placeholder: "0.00", value: formData.budget, onChange: function (e) {
                                    return setFormData(__assign(__assign({}, formData), { budget: e.target.value }));
                                }, step: "0.01", min: "0" })),
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement("input", { type: "checkbox", id: "isActive", checked: formData.isActive, onChange: function (e) {
                                    return setFormData(__assign(__assign({}, formData), { isActive: e.target.checked }));
                                }, className: "rounded border-gray-300" }),
                            React.createElement(label_1.Label, { htmlFor: "isActive" }, "Active")),
                        React.createElement("div", { className: "flex gap-4" },
                            React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return navigate("/departments"); } },
                                React.createElement(lucide_react_1.ArrowLeft, { className: "mr-2 h-4 w-4" }),
                                "Cancel"),
                            React.createElement(button_1.Button, { type: "submit", disabled: createDepartmentMutation.isPending }, createDepartmentMutation.isPending
                                ? "Creating..."
                                : "Create Department"))))))));
}
exports["default"] = CreateDepartment;
