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
// Simple password generator for client-side use
function generatePassword(length) {
    if (length === void 0) { length = 12; }
    var uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var lowercase = 'abcdefghijklmnopqrstuvwxyz';
    var numbers = '0123456789';
    var symbols = '!@#$%^&*()';
    var password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    var allChars = uppercase + lowercase + numbers + symbols;
    for (var i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    return password.split('').sort(function () { return Math.random() - 0.5; }).join('');
}
function CreateUser() {
    var _this = this;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var _b = react_1.useState(false), isSubmitting = _b[0], setIsSubmitting = _b[1];
    var _c = react_1.useState(false), useAutoPassword = _c[0], setUseAutoPassword = _c[1];
    var _d = react_1.useState(false), passwordCopied = _d[0], setPasswordCopied = _d[1];
    var _e = react_1.useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "staff",
        isActive: true
    }), formData = _e[0], setFormData = _e[1];
    var createUserMutation = trpc_1.trpc.users.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("User created successfully");
            setLocation("/crm/super-admin");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to create user");
            setIsSubmitting(false);
        }
    });
    var handleChange = function (e) {
        var _a;
        var _b = e.target, name = _b.name, value = _b.value, type = _b.type, checked = _b.checked;
        setFormData(__assign(__assign({}, formData), (_a = {}, _a[name] = type === "checkbox" ? checked : value, _a)));
    };
    var handleRoleChange = function (value) {
        setFormData(__assign(__assign({}, formData), { role: value }));
    };
    var handleAutoGeneratePassword = function () {
        var generated = generatePassword(14);
        setFormData(__assign(__assign({}, formData), { password: generated, confirmPassword: generated }));
        setUseAutoPassword(true);
    };
    var handleCopyPassword = function () { return __awaiter(_this, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, navigator.clipboard.writeText(formData.password)];
                case 1:
                    _a.sent();
                    setPasswordCopied(true);
                    setTimeout(function () { return setPasswordCopied(false); }, 2000);
                    sonner_1.toast.success("Password copied to clipboard!");
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    sonner_1.toast.error("Failed to copy password");
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
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
                    if (!formData.password) {
                        sonner_1.toast.error("Password is required");
                        return [2 /*return*/];
                    }
                    if (formData.password !== formData.confirmPassword) {
                        sonner_1.toast.error("Passwords do not match");
                        return [2 /*return*/];
                    }
                    if (formData.password.length < 8) {
                        sonner_1.toast.error("Password must be at least 8 characters");
                        return [2 /*return*/];
                    }
                    setIsSubmitting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, mutationHelpers_1["default"](createUserMutation, {
                            name: formData.name,
                            email: formData.email,
                            password: formData.password,
                            role: formData.role,
                            isActive: formData.isActive
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
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Create User", description: "Fill in the details below to create a new system user", icon: React.createElement(lucide_react_1.UserPlus, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Admin", href: "/admin/management" },
            { label: "Users", href: "/admin/management" },
            { label: "Create" },
        ], backLink: { label: "Users", href: "/admin/management" } },
        React.createElement("div", { className: "space-y-6" },
            React.createElement(card_1.Card, { className: "max-w-2xl" },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "User Information"),
                    React.createElement(card_1.CardDescription, null, "Fill in the details below to create a new system user")),
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
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement(label_1.Label, { htmlFor: "password" }, "Password *"),
                                React.createElement(button_1.Button, { type: "button", variant: "ghost", size: "sm", onClick: handleAutoGeneratePassword, className: "gap-1 text-blue-600 hover:text-blue-700" },
                                    React.createElement(lucide_react_1.RefreshCw, { className: "w-3 h-3" }),
                                    "Auto-Generate")),
                            React.createElement("div", { className: "flex gap-2" },
                                React.createElement(input_1.Input, { id: "password", name: "password", type: "password", placeholder: "Enter password (min. 8 characters)", value: formData.password, onChange: handleChange, required: true }),
                                formData.password && useAutoPassword && (React.createElement(button_1.Button, { type: "button", variant: "outline", size: "sm", onClick: handleCopyPassword, className: "flex-shrink-0" }, passwordCopied ? (React.createElement(lucide_react_1.Check, { className: "w-4 h-4 text-green-600" })) : (React.createElement(lucide_react_1.Copy, { className: "w-4 h-4" }))))),
                            useAutoPassword && (React.createElement("p", { className: "text-xs text-blue-600" }, "Auto-generated password ready to copy"))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "confirmPassword" }, "Confirm Password *"),
                            React.createElement(input_1.Input, { id: "confirmPassword", name: "confirmPassword", type: "password", placeholder: "Confirm password", value: formData.confirmPassword, onChange: handleChange, required: true })),
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement("input", { id: "isActive", name: "isActive", type: "checkbox", checked: formData.isActive, onChange: handleChange, className: "w-4 h-4 rounded border-gray-300" }),
                            React.createElement(label_1.Label, { htmlFor: "isActive", className: "font-normal cursor-pointer" }, "User is active")),
                        React.createElement("div", { className: "flex gap-3 pt-4" },
                            React.createElement(button_1.Button, { type: "submit", disabled: isSubmitting, className: "gap-2" },
                                isSubmitting && React.createElement(lucide_react_1.Loader2, { className: "w-4 h-4 animate-spin" }),
                                isSubmitting ? "Creating..." : "Create User"),
                            React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return setLocation("/crm/super-admin"); }, disabled: isSubmitting }, "Cancel"))))))));
}
exports["default"] = CreateUser;
