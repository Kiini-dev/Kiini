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
var checkbox_1 = require("@/components/ui/checkbox");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
function EditDepartment() {
    var id = wouter_1.useParams().id;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var utils = trpc_1.trpc.useUtils();
    var _b = react_1.useState({
        name: "",
        description: "",
        budget: "",
        isActive: true
    }), formData = _b[0], setFormData = _b[1];
    var _c = react_1.useState(true), isLoading = _c[0], setIsLoading = _c[1];
    // Fetch department data
    var department = trpc_1.trpc.departments.getById.useQuery(id || "", { enabled: !!id }).data;
    // Update form when department data loads
    react_1.useEffect(function () {
        if (department) {
            setFormData({
                name: department.name || "",
                description: department.description || "",
                budget: department.budget ? department.budget.toString() : "",
                isActive: department.isActive !== false
            });
            setIsLoading(false);
        }
    }, [department]);
    var updateDepartmentMutation = trpc_1.trpc.departments.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Department updated successfully!");
            utils.departments.list.invalidate();
            utils.departments.getById.invalidate(id || "");
            navigate("/departments");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to update department: " + error.message);
        }
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!formData.name) {
            sonner_1.toast.error("Department name is required");
            return;
        }
        updateDepartmentMutation.mutate({
            id: id || "",
            name: formData.name,
            description: formData.description || undefined,
            budget: formData.budget ? Math.round(parseFloat(formData.budget) * 100) : undefined,
            isActive: formData.isActive
        });
    };
    if (isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Department", description: "Update department details", icon: React.createElement(lucide_react_1.Building2, { className: "w-6 h-6" }), breadcrumbs: [
                { label: "Dashboard", href: "/crm-home" },
                { label: "HR", href: "/hr" },
                { label: "Departments", href: "/departments" },
                { label: "Edit Department" },
            ] },
            React.createElement("div", { className: "flex items-center justify-center p-8" },
                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Department", description: "Update department details", icon: React.createElement(lucide_react_1.Building2, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "HR", href: "/hr" },
            { label: "Departments", href: "/departments" },
            { label: "Edit Department" },
        ] },
        React.createElement("div", { className: "max-w-2xl" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Edit Department"),
                    React.createElement(card_1.CardDescription, null, "Update the department details below")),
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
                            React.createElement(label_1.Label, { htmlFor: "budget" }, "Annual Budget (Ksh)"),
                            React.createElement(input_1.Input, { id: "budget", type: "number", placeholder: "0.00", value: formData.budget, onChange: function (e) {
                                    return setFormData(__assign(__assign({}, formData), { budget: e.target.value }));
                                }, step: "0.01", min: "0" })),
                        React.createElement("div", { className: "flex items-center space-x-2" },
                            React.createElement(checkbox_1.Checkbox, { id: "isActive", checked: formData.isActive, onCheckedChange: function (checked) {
                                    return setFormData(__assign(__assign({}, formData), { isActive: checked }));
                                } }),
                            React.createElement(label_1.Label, { htmlFor: "isActive", className: "font-normal cursor-pointer" }, "Active Department")),
                        React.createElement("div", { className: "flex gap-2" },
                            React.createElement(button_1.Button, { type: "submit", disabled: updateDepartmentMutation.isPending },
                                updateDepartmentMutation.isPending && (React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                                "Update Department"),
                            React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return navigate("/departments"); } },
                                React.createElement(lucide_react_1.ArrowLeft, { className: "mr-2 h-4 w-4" }),
                                "Cancel"))))))));
}
exports["default"] = EditDepartment;
