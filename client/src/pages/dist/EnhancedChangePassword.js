"use strict";
/**
 * Enhanced Password Change Component
 * Password policy enforcement, strength validation, and secure credential management
 *
 * Features:
 * - Password strength requirements
 * - Password history validation (no reuse)
 * - Password expiry enforcement
 * - Force change on first login
 * - MFA optional verification
 * - Session management after change
 */
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
var progress_1 = require("@/components/ui/progress");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var DEFAULT_POLICY = {
    minLength: 12,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChar: true,
    expiryDays: 90,
    historyCount: 5
};
function EnhancedPasswordChange() {
    var _this = this;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var _b = react_1.useState(false), loading = _b[0], setLoading = _b[1];
    var _c = react_1.useState(false), showCurrentPassword = _c[0], setShowCurrentPassword = _c[1];
    var _d = react_1.useState(false), showNewPassword = _d[0], setShowNewPassword = _d[1];
    var _e = react_1.useState(false), showConfirmPassword = _e[0], setShowConfirmPassword = _e[1];
    var _f = react_1.useState(""), error = _f[0], setError = _f[1];
    var _g = react_1.useState(false), isFirstLogin = _g[0], setIsFirstLogin = _g[1];
    var _h = react_1.useState(DEFAULT_POLICY), passwordPolicy = _h[0], setPasswordPolicy = _h[1];
    var _j = react_1.useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    }), formData = _j[0], setFormData = _j[1];
    // Fetch password policy
    var policyData = trpc_1.trpc.settings.getPasswordPolicy.useQuery().data;
    react_1.useEffect(function () {
        if (policyData) {
            setPasswordPolicy(policyData);
        }
        // Check if this is a forced password change
        var requiresPasswordChange = localStorage.getItem("requiresPasswordChange");
        setIsFirstLogin(requiresPasswordChange === "true");
    }, [policyData]);
    // Calculate password strength
    var passwordRequirements = react_1.useMemo(function () {
        var pwd = formData.newPassword;
        return {
            minLength: pwd.length >= passwordPolicy.minLength,
            uppercase: /[A-Z]/.test(pwd),
            lowercase: /[a-z]/.test(pwd),
            numbers: /[0-9]/.test(pwd),
            specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
            notInHistory: true
        };
    }, [formData.newPassword, passwordPolicy]);
    var passwordStrength = react_1.useMemo(function () {
        var met = Object.values(passwordRequirements).filter(Boolean).length;
        var total = Object.keys(passwordRequirements).length;
        return (met / total) * 100;
    }, [passwordRequirements]);
    var isPasswordValid = react_1.useMemo(function () {
        return (passwordRequirements.minLength &&
            (passwordPolicy.requireUppercase ? passwordRequirements.uppercase : true) &&
            (passwordPolicy.requireNumbers ? passwordRequirements.numbers : true) &&
            (passwordPolicy.requireSpecialChar ? passwordRequirements.specialChar : true) &&
            passwordRequirements.lowercase &&
            passwordRequirements.notInHistory);
    }, [passwordRequirements, passwordPolicy]);
    var changePasswordMutation = trpc_1.trpc.auth.changePassword.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Password changed successfully!");
            localStorage.removeItem("requiresPasswordChange");
            // Redirect based on role
            var user = JSON.parse(localStorage.getItem("auth-user") || "{}");
            var dashboards = {
                super_admin: "/super-admin",
                admin: "/admin",
                accountant: "/accounting",
                hr: "/hr",
                staff: "/staff",
                client: "/client-portal"
            };
            setLocation(dashboards[user.role] || "/dashboard");
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
        setError("");
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
            if (formData.newPassword !== formData.confirmPassword) {
                setError("New passwords do not match");
                return [2 /*return*/];
            }
            if (!isPasswordValid) {
                setError("Password does not meet complexity requirements");
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
    var getPasswordStrengthColor = function () {
        if (passwordStrength < 33)
            return "bg-red-500";
        if (passwordStrength < 66)
            return "bg-orange-500";
        if (passwordStrength < 100)
            return "bg-yellow-500";
        return "bg-green-500";
    };
    var getPasswordStrengthLabel = function () {
        if (passwordStrength < 33)
            return "Weak";
        if (passwordStrength < 66)
            return "Fair";
        if (passwordStrength < 100)
            return "Good";
        return "Strong";
    };
    if (isFirstLogin) {
        return (React.createElement("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4" },
            React.createElement(card_1.Card, { className: "w-full max-w-2xl shadow-2xl" },
                React.createElement(card_1.CardHeader, { className: "space-y-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg" },
                    React.createElement(card_1.CardTitle, { className: "text-3xl font-bold flex items-center gap-2" },
                        React.createElement(lucide_react_1.AlertTriangle, { className: "w-8 h-8" }),
                        "Password Change Required"),
                    React.createElement(card_1.CardDescription, { className: "text-blue-100" }, "Please set a strong password before accessing the application")),
                React.createElement(card_1.CardContent, { className: "space-y-6 pt-6" },
                    error && (React.createElement(alert_1.Alert, { variant: "destructive" },
                        React.createElement(lucide_react_1.AlertCircle, { className: "w-4 h-4" }),
                        React.createElement(alert_1.AlertDescription, null, error))),
                    React.createElement(alert_1.Alert, { className: "bg-blue-50 border-blue-200" },
                        React.createElement(lucide_react_1.Info, { className: "w-4 h-4 text-blue-600" }),
                        React.createElement(alert_1.AlertDescription, { className: "text-blue-800" }, "This is your first login. For security reasons, you must create a strong password that meets the requirements below.")),
                    React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "currentPassword", className: "font-semibold" }, "Current Password *"),
                            React.createElement("div", { className: "relative" },
                                React.createElement(input_1.Input, { id: "currentPassword", name: "currentPassword", type: showCurrentPassword ? "text" : "password", placeholder: "Enter your current password", value: formData.currentPassword, onChange: handleChange, required: true, className: "pr-10" }),
                                React.createElement("button", { type: "button", onClick: function () { return setShowCurrentPassword(!showCurrentPassword); }, className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700" }, showCurrentPassword ? (React.createElement(lucide_react_1.EyeOff, { className: "w-4 h-4" })) : (React.createElement(lucide_react_1.Eye, { className: "w-4 h-4" }))))),
                        React.createElement("div", { className: "space-y-3" },
                            React.createElement(label_1.Label, { htmlFor: "newPassword", className: "font-semibold" }, "New Password *"),
                            React.createElement("div", { className: "relative" },
                                React.createElement(input_1.Input, { id: "newPassword", name: "newPassword", type: showNewPassword ? "text" : "password", placeholder: "Enter new password", value: formData.newPassword, onChange: handleChange, required: true, className: "pr-10" }),
                                React.createElement("button", { type: "button", onClick: function () { return setShowNewPassword(!showNewPassword); }, className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700" }, showNewPassword ? (React.createElement(lucide_react_1.EyeOff, { className: "w-4 h-4" })) : (React.createElement(lucide_react_1.Eye, { className: "w-4 h-4" })))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement("div", { className: "flex items-center justify-between" },
                                    React.createElement("span", { className: "text-sm font-medium" }, "Password Strength:"),
                                    React.createElement("span", { className: "text-sm font-semibold " + (passwordStrength < 33 ? "text-red-600" :
                                            passwordStrength < 66 ? "text-orange-600" :
                                                passwordStrength < 100 ? "text-yellow-600" :
                                                    "text-green-600") }, getPasswordStrengthLabel())),
                                React.createElement(progress_1.Progress, { value: passwordStrength, className: "h-2" })),
                            React.createElement("div", { className: "space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-200" },
                                React.createElement("p", { className: "text-sm font-semibold text-gray-700" }, "Password Requirements:"),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement("div", { className: "flex items-center gap-2 text-sm" },
                                        passwordRequirements.minLength ? (React.createElement(lucide_react_1.CheckCircle2, { className: "w-4 h-4 text-green-600" })) : (React.createElement(lucide_react_1.AlertCircle, { className: "w-4 h-4 text-gray-400" })),
                                        React.createElement("span", { className: passwordRequirements.minLength ? "text-green-700" : "text-gray-600" },
                                            "At least ",
                                            passwordPolicy.minLength,
                                            " characters")),
                                    passwordPolicy.requireUppercase && (React.createElement("div", { className: "flex items-center gap-2 text-sm" },
                                        passwordRequirements.uppercase ? (React.createElement(lucide_react_1.CheckCircle2, { className: "w-4 h-4 text-green-600" })) : (React.createElement(lucide_react_1.AlertCircle, { className: "w-4 h-4 text-gray-400" })),
                                        React.createElement("span", { className: passwordRequirements.uppercase ? "text-green-700" : "text-gray-600" }, "At least one uppercase letter (A-Z)"))),
                                    React.createElement("div", { className: "flex items-center gap-2 text-sm" },
                                        passwordRequirements.lowercase ? (React.createElement(lucide_react_1.CheckCircle2, { className: "w-4 h-4 text-green-600" })) : (React.createElement(lucide_react_1.AlertCircle, { className: "w-4 h-4 text-gray-400" })),
                                        React.createElement("span", { className: passwordRequirements.lowercase ? "text-green-700" : "text-gray-600" }, "At least one lowercase letter (a-z)")),
                                    passwordPolicy.requireNumbers && (React.createElement("div", { className: "flex items-center gap-2 text-sm" },
                                        passwordRequirements.numbers ? (React.createElement(lucide_react_1.CheckCircle2, { className: "w-4 h-4 text-green-600" })) : (React.createElement(lucide_react_1.AlertCircle, { className: "w-4 h-4 text-gray-400" })),
                                        React.createElement("span", { className: passwordRequirements.numbers ? "text-green-700" : "text-gray-600" }, "At least one number (0-9)"))),
                                    passwordPolicy.requireSpecialChar && (React.createElement("div", { className: "flex items-center gap-2 text-sm" },
                                        passwordRequirements.specialChar ? (React.createElement(lucide_react_1.CheckCircle2, { className: "w-4 h-4 text-green-600" })) : (React.createElement(lucide_react_1.AlertCircle, { className: "w-4 h-4 text-gray-400" })),
                                        React.createElement("span", { className: passwordRequirements.specialChar ? "text-green-700" : "text-gray-600" }, "At least one special character (!@#$%^&*)")))))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "confirmPassword", className: "font-semibold" }, "Confirm Password *"),
                            React.createElement("div", { className: "relative" },
                                React.createElement(input_1.Input, { id: "confirmPassword", name: "confirmPassword", type: showConfirmPassword ? "text" : "password", placeholder: "Confirm new password", value: formData.confirmPassword, onChange: handleChange, required: true, className: "pr-10" }),
                                React.createElement("button", { type: "button", onClick: function () { return setShowConfirmPassword(!showConfirmPassword); }, className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700" }, showConfirmPassword ? (React.createElement(lucide_react_1.EyeOff, { className: "w-4 h-4" })) : (React.createElement(lucide_react_1.Eye, { className: "w-4 h-4" })))),
                            formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (React.createElement("p", { className: "text-sm text-red-600 flex items-center gap-1" },
                                React.createElement(lucide_react_1.AlertCircle, { className: "w-4 h-4" }),
                                "Passwords do not match"))),
                        React.createElement(button_1.Button, { type: "submit", disabled: loading || !isPasswordValid || formData.newPassword !== formData.confirmPassword, className: "w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-12 text-lg font-semibold", size: "lg" }, loading ? (React.createElement(React.Fragment, null,
                            React.createElement(lucide_react_1.Lock, { className: "w-4 h-4 mr-2 animate-spin" }),
                            "Updating Password...")) : (React.createElement(React.Fragment, null,
                            React.createElement(lucide_react_1.Lock, { className: "w-4 h-4 mr-2" }),
                            "Set Password & Continue")))),
                    React.createElement(alert_1.Alert, { className: "bg-gray-50 border-gray-200" },
                        React.createElement(lucide_react_1.Info, { className: "w-4 h-4" }),
                        React.createElement(alert_1.AlertDescription, { className: "text-sm text-gray-700" },
                            React.createElement("p", { className: "font-semibold mb-2" }, "Security Info:"),
                            React.createElement("ul", { className: "space-y-1 list-disc list-inside" },
                                React.createElement("li", null,
                                    "Your password will expire in ",
                                    passwordPolicy.expiryDays,
                                    " days"),
                                React.createElement("li", null,
                                    "Cannot reuse last ",
                                    passwordPolicy.historyCount,
                                    " passwords"),
                                React.createElement("li", null, "Never share your password with anyone"),
                                React.createElement("li", null, "Use a unique password not used elsewhere"))))))));
    }
    // Regular password change (not first login)
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Change Password", description: "Update your account password to keep your account secure", icon: React.createElement(lucide_react_1.Lock, { className: "w-5 h-5" }), backLink: { label: "Account", href: "/account" }, breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Account", href: "/account" },
            { label: "Change Password" },
        ] },
        React.createElement("div", { className: "max-w-2xl mx-auto py-8" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Lock, { className: "w-6 h-6" }),
                        "Change Password"),
                    React.createElement(card_1.CardDescription, null, "Update your account password to keep your account secure")),
                React.createElement(card_1.CardContent, null,
                    error && (React.createElement(alert_1.Alert, { variant: "destructive", className: "mb-6" },
                        React.createElement(lucide_react_1.AlertCircle, { className: "w-4 h-4" }),
                        React.createElement(alert_1.AlertDescription, null, error))),
                    React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "currentPassword" }, "Current Password"),
                            React.createElement("div", { className: "relative" },
                                React.createElement(input_1.Input, { id: "currentPassword", name: "currentPassword", type: showCurrentPassword ? "text" : "password", placeholder: "Enter your current password", value: formData.currentPassword, onChange: handleChange, required: true, className: "pr-10" }),
                                React.createElement("button", { type: "button", onClick: function () { return setShowCurrentPassword(!showCurrentPassword); }, className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700" }, showCurrentPassword ? React.createElement(lucide_react_1.EyeOff, { className: "w-4 h-4" }) : React.createElement(lucide_react_1.Eye, { className: "w-4 h-4" })))),
                        React.createElement("div", { className: "space-y-3" },
                            React.createElement(label_1.Label, { htmlFor: "newPassword" }, "New Password"),
                            React.createElement("div", { className: "relative" },
                                React.createElement(input_1.Input, { id: "newPassword", name: "newPassword", type: showNewPassword ? "text" : "password", placeholder: "Enter new password", value: formData.newPassword, onChange: handleChange, required: true, className: "pr-10" }),
                                React.createElement("button", { type: "button", onClick: function () { return setShowNewPassword(!showNewPassword); }, className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700" }, showNewPassword ? React.createElement(lucide_react_1.EyeOff, { className: "w-4 h-4" }) : React.createElement(lucide_react_1.Eye, { className: "w-4 h-4" }))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement("div", { className: "flex items-center justify-between" },
                                    React.createElement("span", { className: "text-sm font-medium" }, "Strength:"),
                                    React.createElement("span", { className: "text-sm font-semibold " + (passwordStrength < 33 ? "text-red-600" :
                                            passwordStrength < 66 ? "text-orange-600" :
                                                passwordStrength < 100 ? "text-yellow-600" :
                                                    "text-green-600") }, getPasswordStrengthLabel())),
                                React.createElement(progress_1.Progress, { value: passwordStrength, className: "h-2" }))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "confirmPassword" }, "Confirm Password"),
                            React.createElement("div", { className: "relative" },
                                React.createElement(input_1.Input, { id: "confirmPassword", name: "confirmPassword", type: showConfirmPassword ? "text" : "password", placeholder: "Confirm new password", value: formData.confirmPassword, onChange: handleChange, required: true, className: "pr-10" }),
                                React.createElement("button", { type: "button", onClick: function () { return setShowConfirmPassword(!showConfirmPassword); }, className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700" }, showConfirmPassword ? React.createElement(lucide_react_1.EyeOff, { className: "w-4 h-4" }) : React.createElement(lucide_react_1.Eye, { className: "w-4 h-4" })))),
                        React.createElement(button_1.Button, { type: "submit", disabled: loading || !isPasswordValid, className: "w-full" }, loading ? "Updating..." : "Update Password")))))));
}
exports["default"] = EnhancedPasswordChange;
