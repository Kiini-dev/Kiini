"use strict";
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
var trpc_1 = require("@/lib/trpc");
var mutationHelpers_1 = require("@/lib/mutationHelpers");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
var wouter_1 = require("wouter");
var sonner_1 = require("sonner");
function ResetPassword() {
    var _this = this;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var searchParams = new URLSearchParams(wouter_1.useSearch());
    var token = searchParams.get("token");
    var _b = react_1.useState(""), password = _b[0], setPassword = _b[1];
    var _c = react_1.useState(""), confirmPassword = _c[0], setConfirmPassword = _c[1];
    var _d = react_1.useState(false), showPassword = _d[0], setShowPassword = _d[1];
    var _e = react_1.useState(false), showConfirmPassword = _e[0], setShowConfirmPassword = _e[1];
    var _f = react_1.useState(false), isLoading = _f[0], setIsLoading = _f[1];
    var _g = react_1.useState(false), isSuccess = _g[0], setIsSuccess = _g[1];
    var resetPasswordMutation = trpc_1.trpc.auth.resetPassword.useMutation();
    var getPasswordStrength = function (pwd) {
        if (pwd.length === 0)
            return { strength: 0, label: "", color: "" };
        if (pwd.length < 6)
            return { strength: 25, label: "Weak", color: "bg-red-500" };
        if (pwd.length < 8)
            return { strength: 50, label: "Fair", color: "bg-orange-500" };
        if (pwd.length < 12)
            return { strength: 75, label: "Good", color: "bg-yellow-500" };
        return { strength: 100, label: "Strong", color: "bg-green-500" };
    };
    var passwordStrength = getPasswordStrength(password);
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!token) {
                        sonner_1.toast.error("Invalid or missing reset token");
                        return [2 /*return*/];
                    }
                    if (!password || !confirmPassword) {
                        sonner_1.toast.error("Please fill in all fields");
                        return [2 /*return*/];
                    }
                    if (password.length < 8) {
                        sonner_1.toast.error("Password must be at least 8 characters long");
                        return [2 /*return*/];
                    }
                    if (password !== confirmPassword) {
                        sonner_1.toast.error("Passwords do not match");
                        return [2 /*return*/];
                    }
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, mutationHelpers_1["default"](resetPasswordMutation, { token: token || "", newPassword: password, confirmPassword: confirmPassword })];
                case 2:
                    _a.sent();
                    setIsSuccess(true);
                    sonner_1.toast.success("Password reset successful!");
                    // Redirect to login
                    setLocation("/login");
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    sonner_1.toast.error((error_1 === null || error_1 === void 0 ? void 0 : error_1.message) || "Failed to reset password. The link may have expired.");
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    if (!token) {
        return (React.createElement("div", { className: "min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-violet-50" },
            React.createElement("div", { className: "p-4 sm:p-6" },
                React.createElement("a", { href: "/", className: "inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors" },
                    React.createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4" }),
                    "Back to home")),
            React.createElement("div", { className: "flex-1 flex items-center justify-center p-4" },
                React.createElement(card_1.Card, { className: "w-full max-w-md shadow-xl border-gray-200" },
                    React.createElement(card_1.CardHeader, { className: "text-center" },
                        React.createElement("div", { className: "flex justify-center mb-4" },
                            React.createElement("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200" },
                                React.createElement(lucide_react_1.Zap, { className: "h-5 w-5 text-white" }))),
                        React.createElement(card_1.CardTitle, { className: "text-2xl text-destructive" }, "Invalid Reset Link"),
                        React.createElement(card_1.CardDescription, { className: "text-base mt-2" }, "This password reset link is invalid or has expired.")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement(button_1.Button, { onClick: function () { return setLocation("/forgot-password"); }, className: "w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200" }, "Request New Reset Link"))))));
    }
    if (isSuccess) {
        return (React.createElement("div", { className: "min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-violet-50" },
            React.createElement("div", { className: "p-4 sm:p-6" },
                React.createElement("a", { href: "/", className: "inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors" },
                    React.createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4" }),
                    "Back to home")),
            React.createElement("div", { className: "flex-1 flex items-center justify-center p-4" },
                React.createElement(card_1.Card, { className: "w-full max-w-md shadow-xl border-gray-200" },
                    React.createElement(card_1.CardHeader, { className: "text-center" },
                        React.createElement("div", { className: "flex justify-center mb-4" },
                            React.createElement("div", { className: "h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center" },
                                React.createElement(lucide_react_1.CheckCircle2, { className: "h-8 w-8 text-green-500" }))),
                        React.createElement(card_1.CardTitle, { className: "text-2xl" }, "Password Reset Complete!"),
                        React.createElement(card_1.CardDescription, { className: "text-base mt-2" },
                            "Your password has been successfully reset.",
                            React.createElement("br", null),
                            "Redirecting to login..."))))));
    }
    return (React.createElement("div", { className: "min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-violet-50" },
        React.createElement("div", { className: "p-4 sm:p-6" },
            React.createElement("a", { href: "/", className: "inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors" },
                React.createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4" }),
                "Back to home")),
        React.createElement("div", { className: "flex-1 flex items-center justify-center p-4" },
            React.createElement(card_1.Card, { className: "w-full max-w-md shadow-xl border-gray-200" },
                React.createElement(card_1.CardHeader, { className: "text-center" },
                    React.createElement("div", { className: "flex justify-center mb-4" },
                        React.createElement("a", { href: "/", className: "flex items-center gap-3 group" },
                            React.createElement("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200" },
                                React.createElement(lucide_react_1.Zap, { className: "h-5 w-5 text-white" })),
                            React.createElement("span", { className: "text-xl font-bold text-gray-900" },
                                "Kiini",
                                React.createElement("span", { className: "text-indigo-600" }, "360")))),
                    React.createElement(card_1.CardTitle, { className: "text-2xl" }, "Create New Password"),
                    React.createElement(card_1.CardDescription, { className: "text-base mt-2" }, "Enter your new password below")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("form", { onSubmit: handleSubmit, className: "space-y-4" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "password" }, "New Password *"),
                            React.createElement("div", { className: "relative" },
                                React.createElement(lucide_react_1.Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" }),
                                React.createElement(input_1.Input, { id: "password", type: showPassword ? "text" : "password", placeholder: "Create a strong password", value: password, onChange: function (e) { return setPassword(e.target.value); }, className: "pl-10 pr-10", disabled: isLoading }),
                                React.createElement("button", { type: "button", onClick: function () { return setShowPassword(!showPassword); }, className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" }, showPassword ? React.createElement(lucide_react_1.EyeOff, { className: "h-5 w-5" }) : React.createElement(lucide_react_1.Eye, { className: "h-5 w-5" }))),
                            password && (React.createElement("div", { className: "space-y-1" },
                                React.createElement("div", { className: "flex justify-between text-xs" },
                                    React.createElement("span", { className: "text-muted-foreground" }, "Password strength:"),
                                    React.createElement("span", { className: "font-semibold " + (passwordStrength.strength >= 75 ? "text-green-500" :
                                            passwordStrength.strength >= 50 ? "text-yellow-500" :
                                                "text-red-500") }, passwordStrength.label)),
                                React.createElement("div", { className: "h-2 bg-muted rounded-full overflow-hidden" },
                                    React.createElement("div", { className: "h-full transition-all " + passwordStrength.color, style: { width: passwordStrength.strength + "%" } })))),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Must be at least 8 characters long")),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "confirmPassword" }, "Confirm New Password *"),
                            React.createElement("div", { className: "relative" },
                                React.createElement(lucide_react_1.Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" }),
                                React.createElement(input_1.Input, { id: "confirmPassword", type: showConfirmPassword ? "text" : "password", placeholder: "Confirm your password", value: confirmPassword, onChange: function (e) { return setConfirmPassword(e.target.value); }, className: "pl-10 pr-10", disabled: isLoading }),
                                React.createElement("button", { type: "button", onClick: function () { return setShowConfirmPassword(!showConfirmPassword); }, className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" }, showConfirmPassword ? React.createElement(lucide_react_1.EyeOff, { className: "h-5 w-5" }) : React.createElement(lucide_react_1.Eye, { className: "h-5 w-5" }))),
                            confirmPassword && password !== confirmPassword && (React.createElement("p", { className: "text-xs text-destructive" }, "Passwords do not match"))),
                        React.createElement(button_1.Button, { type: "submit", className: "w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200", disabled: isLoading || !password || !confirmPassword || password !== confirmPassword }, isLoading ? "Resetting Password..." : "Reset Password")),
                    React.createElement("div", { className: "mt-6 p-4 bg-muted rounded-lg text-sm text-muted-foreground" },
                        React.createElement("p", { className: "font-semibold mb-2" }, "Password Requirements:"),
                        React.createElement("ul", { className: "list-disc list-inside space-y-1" },
                            React.createElement("li", null, "At least 8 characters long"),
                            React.createElement("li", null, "Mix of uppercase and lowercase letters (recommended)"),
                            React.createElement("li", null, "Include numbers and special characters (recommended)"))))))));
}
exports["default"] = ResetPassword;
