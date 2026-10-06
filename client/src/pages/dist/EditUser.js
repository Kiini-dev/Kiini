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
var react_1 = require("react");
var wouter_1 = require("wouter");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var mutationHelpers_1 = require("@/lib/mutationHelpers");
var sonner_1 = require("sonner");
var DeleteConfirmationModal_1 = require("@/components/DeleteConfirmationModal");
function EditUser() {
    var _this = this;
    var id = wouter_1.useParams().id;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var _b = react_1.useState(false), isSubmitting = _b[0], setIsSubmitting = _b[1];
    var _c = react_1.useState(false), isDeleting = _c[0], setIsDeleting = _c[1];
    var _d = react_1.useState(false), showDeleteModal = _d[0], setShowDeleteModal = _d[1];
    var _e = react_1.useState({
        name: "",
        email: "",
        role: "staff",
        isActive: true,
        newPassword: "",
        confirmPassword: ""
    }), formData = _e[0], setFormData = _e[1];
    // Fetch user data
    var _f = trpc_1.trpc.users.getById.useQuery(id || ""), userData = _f.data, isLoading = _f.isLoading;
    // Update user mutation
    var updateUserMutation = trpc_1.trpc.users.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("User updated successfully");
            setLocation("/crm/super-admin");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to update user");
            setIsSubmitting(false);
        }
    });
    // Delete user mutation
    var deleteUserMutation = trpc_1.trpc.users["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("User deleted successfully");
            setLocation("/crm/super-admin");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete user");
            setIsDeleting(false);
        }
    });
    // Populate form when user data loads
    react_1.useEffect(function () {
        if (userData) {
            setFormData({
                name: userData.name || "",
                email: userData.email || "",
                role: userData.role || "staff",
                isActive: userData.isActive !== false,
                newPassword: "",
                confirmPassword: ""
            });
        }
    }, [userData]);
    var handleChange = function (e) {
        var _a;
        var _b = e.target, name = _b.name, value = _b.value, type = _b.type, checked = _b.checked;
        setFormData(__assign(__assign({}, formData), (_a = {}, _a[name] = type === "checkbox" ? checked : value, _a)));
    };
    var handleRoleChange = function (value) {
        setFormData(__assign(__assign({}, formData), { role: value }));
    };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    // Validation
                    if (!formData.name.trim()) {
                        sonner_1.toast.error("Name is required");
                        return [2 /*return*/];
                    }
                    if (!formData.email.trim()) {
                        sonner_1.toast.error("Email is required");
                        return [2 /*return*/];
                    }
                    // Password validation if changing password
                    if (formData.newPassword || formData.confirmPassword) {
                        if (formData.newPassword !== formData.confirmPassword) {
                            sonner_1.toast.error("Passwords do not match");
                            return [2 /*return*/];
                        }
                        if (formData.newPassword.length < 8) {
                            sonner_1.toast.error("Password must be at least 8 characters");
                            return [2 /*return*/];
                        }
                    }
                    setIsSubmitting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, mutationHelpers_1["default"](updateUserMutation, {
                            id: id || "",
                            name: formData.name,
                            email: formData.email,
                            role: formData.role,
                            isActive: formData.isActive,
                            password: formData.newPassword || undefined
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleDelete = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsDeleting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, mutationHelpers_1["default"](deleteUserMutation, id || "")];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    setShowDeleteModal(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    if (isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit User", icon: React.createElement(lucide_react_1.Edit, { className: "w-5 h-5" }), backLink: { label: "Users", href: "/admin/management" }, breadcrumbs: [
                { label: "Dashboard", href: "/crm-home" },
                { label: "Admin", href: "/admin" },
                { label: "Users", href: "/admin/management" },
                { label: "Edit" },
            ] },
            React.createElement("div", { className: "flex items-center justify-center h-64" },
                React.createElement("div", { className: "flex flex-col items-center gap-3" },
                    React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-blue-600" }),
                    React.createElement("p", { className: "text-gray-600" }, "Loading user...")))));
    }
    if (!userData) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit User", icon: React.createElement(lucide_react_1.Edit, { className: "w-5 h-5" }), backLink: { label: "Users", href: "/admin/management" }, breadcrumbs: [
                { label: "Dashboard", href: "/crm-home" },
                { label: "Admin", href: "/admin" },
                { label: "Users", href: "/admin/management" },
                { label: "Edit" },
            ] },
            React.createElement("div", { className: "flex flex-col items-center justify-center h-64 gap-4" },
                React.createElement("p", null, "User not found"),
                React.createElement(button_1.Button, { onClick: function () { return setLocation("/crm/super-admin"); } }, "Back to Dashboard"))));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit User", description: "Update user details", icon: React.createElement(lucide_react_1.Edit, { className: "w-5 h-5" }), backLink: { label: "Users", href: "/admin/management" }, breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Admin", href: "/admin" },
            { label: "Users", href: "/admin/management" },
            { label: "Edit" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement(card_1.Card, { className: "max-w-2xl" },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "User Information"),
                    React.createElement(card_1.CardDescription, null, "Update the user details below")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "name" }, "Full Name *"),
                            React.createElement(input_1.Input, { id: "name", name: "name", type: "text", placeholder: "John Doe", value: formData.name, onChange: handleChange, required: true })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "email" }, "Email Address *"),
                            React.createElement(input_1.Input, { id: "email", name: "email", type: "email", placeholder: "john@example.com", value: formData.email, onChange: handleChange, required: true })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "role" }, "Role *"),
                            React.createElement(select_1.Select, { value: formData.role, onValueChange: handleRoleChange },
                                React.createElement(select_1.SelectTrigger, { id: "role" },
                                    React.createElement(select_1.SelectValue, { placeholder: "Select a role" })),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "super_admin" }, "Super Admin"),
                                    React.createElement(select_1.SelectItem, { value: "admin" }, "Admin"),
                                    React.createElement(select_1.SelectItem, { value: "hr" }, "HR Manager"),
                                    React.createElement(select_1.SelectItem, { value: "accountant" }, "Accountant"),
                                    React.createElement(select_1.SelectItem, { value: "project_manager" }, "Project Manager"),
                                    React.createElement(select_1.SelectItem, { value: "ict_manager" }, "ICT Manager"),
                                    React.createElement(select_1.SelectItem, { value: "procurement_manager" }, "Procurement Manager"),
                                    React.createElement(select_1.SelectItem, { value: "staff" }, "Staff"),
                                    React.createElement(select_1.SelectItem, { value: "user" }, "User"),
                                    React.createElement(select_1.SelectItem, { value: "client" }, "Client")))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "newPassword" }, "New Password (optional)"),
                            React.createElement(input_1.Input, { id: "newPassword", name: "newPassword", type: "password", placeholder: "Leave blank to keep current password", value: formData.newPassword, onChange: handleChange })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "confirmPassword" }, "Confirm New Password"),
                            React.createElement(input_1.Input, { id: "confirmPassword", name: "confirmPassword", type: "password", placeholder: "Confirm new password", value: formData.confirmPassword, onChange: handleChange })),
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement("input", { id: "isActive", name: "isActive", type: "checkbox", checked: formData.isActive, onChange: handleChange, className: "w-4 h-4 rounded border-gray-300" }),
                            React.createElement(label_1.Label, { htmlFor: "isActive", className: "font-normal cursor-pointer" }, "User is active")),
                        React.createElement("div", { className: "flex gap-3 pt-4" },
                            React.createElement(button_1.Button, { type: "submit", disabled: isSubmitting, className: "gap-2" },
                                isSubmitting && React.createElement(lucide_react_1.Loader2, { className: "w-4 h-4 animate-spin" }),
                                isSubmitting ? "Saving..." : "Save Changes"),
                            React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return setLocation("/crm/super-admin"); }, disabled: isSubmitting }, "Cancel"),
                            React.createElement(button_1.Button, { type: "button", variant: "destructive", className: "gap-2 ml-auto", onClick: function () { return setShowDeleteModal(true); }, disabled: isSubmitting || isDeleting },
                                React.createElement(lucide_react_1.Trash2, { className: "w-4 h-4" }),
                                "Delete User"))))),
            React.createElement(DeleteConfirmationModal_1["default"], { isOpen: showDeleteModal, title: "Delete User", description: "Are you sure you want to delete this user? This action cannot be undone.", onConfirm: handleDelete, onCancel: function () { return setShowDeleteModal(false); }, isLoading: isDeleting }))));
}
exports["default"] = EditUser;
