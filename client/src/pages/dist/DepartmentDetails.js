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
exports.__esModule = true;
var wouter_1 = require("wouter");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var textarea_1 = require("@/components/ui/textarea");
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var DeleteConfirmationModal_1 = require("@/components/DeleteConfirmationModal");
var react_1 = require("react");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
function DepartmentDetails() {
    var _this = this;
    var id = wouter_1.useParams().id;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = react_1.useState(false), showDeleteModal = _b[0], setShowDeleteModal = _b[1];
    var _c = react_1.useState(false), showEditModal = _c[0], setShowEditModal = _c[1];
    var _d = react_1.useState(false), isSubmitting = _d[0], setIsSubmitting = _d[1];
    var _e = react_1.useState({ name: "", description: "", budget: 0 }), formData = _e[0], setFormData = _e[1];
    // Fetch department from backend
    var _f = trpc_1.trpc.departments.getById.useQuery(id || ""), departmentData = _f.data, isLoading = _f.isLoading;
    var _g = trpc_1.trpc.employees.list.useQuery({}).data, employeesData = _g === void 0 ? [] : _g;
    var utils = trpc_1.trpc.useUtils();
    var updateDepartmentMutation = trpc_1.trpc.departments.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Department updated successfully");
            utils.departments.getById.invalidate(id);
            utils.departments.list.invalidate();
            setShowEditModal(false);
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to update department");
        }
    });
    var deleteDepartmentMutation = trpc_1.trpc.departments["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Department deleted successfully");
            utils.departments.list.invalidate();
            navigate("/departments");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete department");
        }
    });
    // Count employees in this department
    var employeeCount = employeesData.filter(function (e) { var _a; return e.department === ((_a = departmentData) === null || _a === void 0 ? void 0 : _a.name); }).length;
    var department = departmentData ? {
        id: id || "1",
        name: departmentData.name || "Unknown Department",
        code: departmentData.code || "DEPT-" + (id === null || id === void 0 ? void 0 : id.slice(0, 4)),
        manager: departmentData.headId || "Not assigned",
        employeeCount: employeeCount,
        budget: departmentData.budget || 0,
        status: departmentData.status || "active",
        description: departmentData.description || ""
    } : null;
    var handleEdit = function () {
        if (department) {
            setFormData({
                name: department.name,
                description: department.description,
                budget: department.budget
            });
            setShowEditModal(true);
        }
    };
    var handleSaveEdit = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsSubmitting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, updateDepartmentMutation.mutateAsync({
                            id: id || "",
                            data: formData
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    setIsSubmitting(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleDelete = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsSubmitting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, deleteDepartmentMutation.mutateAsync(id || "")];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    setIsSubmitting(false);
                    setShowDeleteModal(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    if (isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Department Details", icon: React.createElement(lucide_react_1.Building2, { className: "h-5 w-5" }), breadcrumbs: [
                { label: "Dashboard", href: "/" },
                { label: "HR", href: "/hr" },
                { label: "Departments", href: "/departments" },
                { label: "Details" },
            ], backLink: { label: "Departments", href: "/departments" } },
            React.createElement("div", { className: "flex items-center justify-center h-64" },
                React.createElement("p", null, "Loading department..."))));
    }
    if (!department) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Department Details", icon: React.createElement(lucide_react_1.Building2, { className: "h-5 w-5" }), breadcrumbs: [
                { label: "Dashboard", href: "/" },
                { label: "HR", href: "/hr" },
                { label: "Departments", href: "/departments" },
                { label: "Details" },
            ], backLink: { label: "Departments", href: "/departments" } },
            React.createElement("div", { className: "flex flex-col items-center justify-center h-64 gap-4" },
                React.createElement("p", null, "Department not found"),
                React.createElement(button_1.Button, { onClick: function () { return navigate("/departments"); } }, "Back to Departments"))));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Department Details", icon: React.createElement(lucide_react_1.Building2, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "HR", href: "/hr" },
            { label: "Departments", href: "/departments" },
            { label: "Details" },
        ], backLink: { label: "Departments", href: "/departments" } },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "flex gap-2" },
                React.createElement(button_1.Button, { onClick: handleEdit },
                    React.createElement(lucide_react_1.Edit, { className: "mr-2 h-4 w-4" }),
                    "Edit"),
                React.createElement(button_1.Button, { variant: "destructive", onClick: function () { return setShowDeleteModal(true); } },
                    React.createElement(lucide_react_1.Trash2, { className: "mr-2 h-4 w-4" }),
                    "Delete")),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Department Information"),
                    department.description && (React.createElement(card_1.CardDescription, null, department.description))),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Manager"),
                            React.createElement("p", { className: "text-muted-foreground" }, department.manager)),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Employees"),
                            React.createElement("p", { className: "text-muted-foreground" }, department.employeeCount)),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Budget"),
                            React.createElement("p", { className: "text-muted-foreground" },
                                "Ksh ",
                                (department.budget || 0).toLocaleString())),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Status"),
                            React.createElement(badge_1.Badge, { variant: department.status === "active" ? "default" : "secondary" }, department.status))))),
            showEditModal && (React.createElement("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50" },
                React.createElement(card_1.Card, { className: "w-full max-w-md" },
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Edit Department")),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Name"),
                            React.createElement(input_1.Input, { value: formData.name, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { name: e.target.value })); }, placeholder: "Department name", className: "mt-1" })),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Description"),
                            React.createElement(textarea_1.Textarea, { value: formData.description, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { description: e.target.value })); }, placeholder: "Department description", className: "mt-1", rows: 3 })),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Budget"),
                            React.createElement(input_1.Input, { type: "number", value: formData.budget, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { budget: Number(e.target.value) })); }, placeholder: "0", className: "mt-1" })),
                        React.createElement("div", { className: "flex gap-2 justify-end" },
                            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setShowEditModal(false); } }, "Cancel"),
                            React.createElement(button_1.Button, { onClick: handleSaveEdit, disabled: isSubmitting }, isSubmitting ? "Saving..." : "Save Changes"))))))),
        React.createElement(DeleteConfirmationModal_1["default"], { isOpen: showDeleteModal, onCancel: function () { return setShowDeleteModal(false); }, onConfirm: handleDelete, isLoading: isSubmitting, title: "Delete Department", description: "Are you sure you want to delete this department? This action cannot be undone." })));
}
exports["default"] = DepartmentDetails;
