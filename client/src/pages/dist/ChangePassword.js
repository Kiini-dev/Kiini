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
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var designSystem_1 = require("@/lib/designSystem");
function ChangePasswordModal() {
    var _this = this;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var _b = react_1.useState(false), loading = _b[0], setLoading = _b[1];
    var _c = react_1.useState(false), showCurrentPassword = _c[0], setShowCurrentPassword = _c[1];
    var _d = react_1.useState(false), showNewPassword = _d[0], setShowNewPassword = _d[1];
    var _e = react_1.useState(false), showConfirmPassword = _e[0], setShowConfirmPassword = _e[1];
    var _f = react_1.useState(""), error = _f[0], setError = _f[1];
    var _g = react_1.useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    }), formData = _g[0], setFormData = _g[1];
    var changePasswordMutation = trpc_1.trpc.auth.changePassword.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Password changed successfully!");
            localStorage.removeItem("requiresPasswordChange");
            // Redirect to appropriate dashboard
            var user = JSON.parse(localStorage.getItem("auth-user") || "{}");
            switch (user.role) {
                case "super_admin":
                    setLocation("/crm/super-admin");
                    break;
                case "admin":
                    setLocation("/admin/management");
                    break;
                case "hr":
                    setLocation("/crm/hr");
                    break;
                case "accountant":
                    setLocation("/crm/accountant");
                    break;
                case "staff":
                    setLocation("/crm/staff");
                    break;
                case "client":
                    setLocation("/crm/client-portal");
                    break;
                default:
                    setLocation("/crm");
            }
        },
        onError: function (error) {
            setError(error.message || "Failed to change password");
            sonner_1.toast.error(error.message || "Failed to change password");
            setLoading(false);
        }
    });
    var handleChange = function (e) {
        var _a;
        var _b = e.target, name = _b.name, value = _b.value;
        setFormData(__assign(__assign({}, formData), (_a = {}, _a[name] = value, _a)));
    };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            e.preventDefault();
            setError("");
            if (!formData.currentPassword) {
                setError("Current password is required");
                return [2 /*return*/];
            }
            if (!formData.newPassword) {
                setError("New password is required");
                return [2 /*return*/];
            }
            if (formData.newPassword.length < 8) {
                setError("New password must be at least 8 characters");
                return [2 /*return*/];
            }
            if (formData.newPassword !== formData.confirmPassword) {
                setError("New passwords do not match");
                return [2 /*return*/];
            }
            if (formData.currentPassword === formData.newPassword) {
                setError("New password must be different from current password");
                return [2 /*return*/];
            }
            setLoading(true);
            try {
                changePasswordMutation.mutate({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                });
            }
            catch (err) {
                // Error handled by mutation
            }
            return [2 /*return*/];
        });
    }); };
    return (React.createElement("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 p-4" },
        React.createElement(card_1.Card, { className: "w-full max-w-md shadow-xl " + designSystem_1.getGradientCard("blue") },
            React.createElement(card_1.CardHeader, { className: "space-y-2" },
                React.createElement(card_1.CardTitle, { className: "text-2xl font-bold flex items-center gap-2 " + designSystem_1.animations.fadeIn },
                    React.createElement(lucide_react_1.AlertTriangle, { className: "w-6 h-6 text-amber-600" }),
                    "Change Your Password"),
                React.createElement(card_1.CardDescription, null, "You must change your password before proceeding to the application")),
            React.createElement(card_1.CardContent, null,
                error && (React.createElement(alert_1.Alert, { variant: "destructive", className: "mb-4" },
                    React.createElement(alert_1.AlertDescription, null, error))),
                React.createElement("form", { onSubmit: handleSubmit, className: "space-y-4" },
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, { htmlFor: "currentPassword" }, "Current Password *"),
                        React.createElement("div", { className: "relative" },
                            React.createElement(input_1.Input, { id: "currentPassword", name: "currentPassword", type: showCurrentPassword ? "text" : "password", placeholder: "Enter your current password", value: formData.currentPassword, onChange: handleChange, required: true, className: "pr-10" }),
                            React.createElement("button", { type: "button", onClick: function () { return setShowCurrentPassword(!showCurrentPassword); }, className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700" }, showCurrentPassword ? (React.createElement(lucide_react_1.EyeOff, { className: "w-4 h-4" })) : (React.createElement(lucide_react_1.Eye, { className: "w-4 h-4" }))))),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, { htmlFor: "newPassword" }, "New Password *"),
                        React.createElement("div", { className: "relative" },
                            React.createElement(input_1.Input, { id: "newPassword", name: "newPassword", type: showNewPassword ? "text" : "password", placeholder: "Enter new password (min. 8 characters)", value: formData.newPassword, onChange: handleChange, required: true, className: "pr-10" }),
                            React.createElement("button", { type: "button", onClick: function () { return setShowNewPassword(!showNewPassword); }, className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700" }, showNewPassword ? (React.createElement(lucide_react_1.EyeOff, { className: "w-4 h-4" })) : (React.createElement(lucide_react_1.Eye, { className: "w-4 h-4" })))),
                        React.createElement("p", { className: "text-xs text-gray-500" }, "Use at least 8 characters with uppercase, lowercase, and numbers")),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, { htmlFor: "confirmPassword" }, "Confirm New Password *"),
                        React.createElement("div", { className: "relative" },
                            React.createElement(input_1.Input, { id: "confirmPassword", name: "confirmPassword", type: showConfirmPassword ? "text" : "password", placeholder: "Confirm new password", value: formData.confirmPassword, onChange: handleChange, required: true, className: "pr-10" }),
                            React.createElement("button", { type: "button", onClick: function () { return setShowConfirmPassword(!showConfirmPassword); }, className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700" }, showConfirmPassword ? (React.createElement(lucide_react_1.EyeOff, { className: "w-4 h-4" })) : (React.createElement(lucide_react_1.Eye, { className: "w-4 h-4" }))))),
                    React.createElement(button_1.Button, { type: "submit", disabled: loading, className: "w-full gap-2" }, loading ? (React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" }),
                        "Changing Password...")) : (React.createElement(React.Fragment, null,
                        React.createElement(lucide_react_1.Lock, { className: "w-4 h-4" }),
                        "Change Password")))),
                React.createElement("div", { className: "mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-md" },
                    React.createElement("p", { className: "text-sm text-emerald-800 dark:text-emerald-100" },
                        React.createElement("strong", null, "Note:"),
                        " This password will be needed for all future logins. Make sure to remember it or store it securely."))))));
}
exports["default"] = ChangePasswordModal;
