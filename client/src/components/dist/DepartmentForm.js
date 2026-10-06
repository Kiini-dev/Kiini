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
exports.DepartmentForm = void 0;
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
function DepartmentForm(_a) {
    var onSuccess = _a.onSuccess, onCancel = _a.onCancel, initialData = _a.initialData, _b = _a.isModal, isModal = _b === void 0 ? false : _b;
    var _c = react_1.useState({
        departmentName: (initialData === null || initialData === void 0 ? void 0 : initialData.departmentName) || "",
        description: (initialData === null || initialData === void 0 ? void 0 : initialData.description) || "",
        headId: (initialData === null || initialData === void 0 ? void 0 : initialData.headId) || "",
        budget: (initialData === null || initialData === void 0 ? void 0 : initialData.budget) || "",
        status: (initialData === null || initialData === void 0 ? void 0 : initialData.status) || "active"
    }), formData = _c[0], setFormData = _c[1];
    var _d = trpc_1.trpc.employees.list.useQuery({}).data, employees = _d === void 0 ? [] : _d;
    var createDepartmentMutation = trpc_1.trpc.departments.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Department created successfully");
            setFormData({
                departmentName: "",
                description: "",
                headId: "",
                budget: "",
                status: "active"
            });
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to create department");
        }
    });
    var updateDepartmentMutation = trpc_1.trpc.departments.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Department updated successfully");
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to update department");
        }
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!formData.departmentName) {
            sonner_1.toast.error("Please fill in all required fields");
            return;
        }
        var departmentData = {
            departmentName: formData.departmentName,
            description: formData.description,
            headId: formData.headId || undefined,
            budget: formData.budget ? parseFloat(formData.budget) : 0,
            status: formData.status
        };
        if (initialData === null || initialData === void 0 ? void 0 : initialData.id) {
            updateDepartmentMutation.mutate(__assign({ id: initialData.id }, departmentData));
        }
        else {
            createDepartmentMutation.mutate(departmentData);
        }
    };
    var isLoading = createDepartmentMutation.isPending || updateDepartmentMutation.isPending;
    var formContent = (React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
            React.createElement("div", { className: "space-y-2" },
                React.createElement(label_1.Label, { htmlFor: "departmentName" }, "Department Name *"),
                React.createElement(input_1.Input, { id: "departmentName", placeholder: "e.g., Engineering, Sales, HR", value: formData.departmentName, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { departmentName: e.target.value })); }, required: true })),
            React.createElement("div", { className: "space-y-2" },
                React.createElement(label_1.Label, { htmlFor: "headId" }, "Department Head"),
                React.createElement(select_1.Select, { value: formData.headId, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { headId: value })); } },
                    React.createElement(select_1.SelectTrigger, { id: "headId" },
                        React.createElement(select_1.SelectValue, { placeholder: "Select department head" })),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "none" }, "None"),
                        employees.map(function (emp) { return (React.createElement(select_1.SelectItem, { key: emp.id, value: emp.id },
                            emp.firstName,
                            " ",
                            emp.lastName)); })))),
            React.createElement("div", { className: "space-y-2" },
                React.createElement(label_1.Label, { htmlFor: "budget" }, "Annual Budget (Ksh)"),
                React.createElement(input_1.Input, { id: "budget", type: "number", placeholder: "0.00", step: "0.01", min: "0", value: formData.budget, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { budget: e.target.value })); } })),
            React.createElement("div", { className: "space-y-2" },
                React.createElement(label_1.Label, { htmlFor: "status" }, "Status"),
                React.createElement(select_1.Select, { value: formData.status, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { status: value })); } },
                    React.createElement(select_1.SelectTrigger, { id: "status" },
                        React.createElement(select_1.SelectValue, null)),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "active" }, "Active"),
                        React.createElement(select_1.SelectItem, { value: "inactive" }, "Inactive"))))),
        React.createElement("div", { className: "space-y-2" },
            React.createElement(label_1.Label, { htmlFor: "description" }, "Description"),
            React.createElement(textarea_1.Textarea, { id: "description", placeholder: "Add department details, responsibilities, etc...", value: formData.description, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { description: e.target.value })); }, rows: 4 })),
        React.createElement("div", { className: "flex gap-2 " + (isModal ? "justify-end" : "justify-end pt-4 border-t") },
            onCancel && (React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: onCancel, disabled: isLoading }, "Cancel")),
            React.createElement(button_1.Button, { type: "submit", disabled: isLoading },
                isLoading && React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
                initialData ? "Update Department" : "Create Department"))));
    if (isModal) {
        return formContent;
    }
    return (React.createElement(card_1.Card, null,
        React.createElement(card_1.CardHeader, null,
            React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                React.createElement(lucide_react_1.Building2, { className: "h-5 w-5" }),
                initialData ? "Edit Department" : "Create New Department"),
            React.createElement(card_1.CardDescription, null, initialData ? "Update department details" : "Add a new department to your organization")),
        React.createElement(card_1.CardContent, null, formContent)));
}
exports.DepartmentForm = DepartmentForm;
