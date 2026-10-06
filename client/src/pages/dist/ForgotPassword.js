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
function ForgotPassword() {
    var _this = this;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var _b = react_1.useState(""), email = _b[0], setEmail = _b[1];
    var _c = react_1.useState(false), isSubmitted = _c[0], setIsSubmitted = _c[1];
    var _d = react_1.useState(false), isLoading = _d[0], setIsLoading = _d[1];
    var requestPasswordResetMutation = trpc_1.trpc.auth.requestPasswordReset.useMutation();
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var emailRegex, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!email) {
                        sonner_1.toast.error("Please enter your email address");
                        return [2 /*return*/];
                    }
                    emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(email)) {
                        sonner_1.toast.error("Please enter a valid email address");
                        return [2 /*return*/];
                    }
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, mutationHelpers_1["default"](requestPasswordResetMutation, { email: email })];
                case 2:
                    _a.sent();
                    setIsSubmitted(true);
                    sonner_1.toast.success("Password reset email sent!");
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    sonner_1.toast.error((error_1 === null || error_1 === void 0 ? void 0 : error_1.message) || "Failed to send reset email. Please try again.");
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    if (isSubmitted) {
        return (React.createElement("div", { className: "min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-violet-50" },
            React.createElement("div", { className: "p-4 sm:p-6" },
                React.createElement("a", { href: "/", onClick: function (e) { e.preventDefault(); setLocation("/"); }, className: "inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors" },
                    React.createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4" }),
                    "Back to home")),
            React.createElement("div", { className: "flex-1 flex items-center justify-center p-4" },
                React.createElement(card_1.Card, { className: "w-full max-w-md shadow-xl border-gray-200" },
                    React.createElement(card_1.CardHeader, { className: "text-center" },
                        React.createElement("div", { className: "flex justify-center mb-4" },
                            React.createElement("a", { href: "/", onClick: function (e) { e.preventDefault(); setLocation("/"); }, className: "flex items-center gap-2.5 no-underline" },
                                React.createElement("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200" },
                                    React.createElement(lucide_react_1.Zap, { className: "h-5 w-5 text-white" })),
                                React.createElement("span", { className: "text-2xl font-bold text-gray-900 tracking-tight" },
                                    "Kiini",
                                    React.createElement("span", { className: "text-indigo-600" }, "360")))),
                        React.createElement("div", { className: "flex justify-center mb-4" },
                            React.createElement("div", { className: "h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center" },
                                React.createElement(lucide_react_1.CheckCircle2, { className: "h-8 w-8 text-green-500" }))),
                        React.createElement(card_1.CardTitle, { className: "text-2xl" }, "Check Your Email"),
                        React.createElement(card_1.CardDescription, { className: "text-base mt-2" },
                            "We've sent password reset instructions to",
                            React.createElement("br", null),
                            React.createElement("span", { className: "font-semibold text-foreground" }, email))),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement("div", { className: "bg-muted p-4 rounded-lg text-sm text-muted-foreground" },
                            React.createElement("p", { className: "mb-2" },
                                React.createElement("strong", null, "Didn't receive the email?")),
                            React.createElement("ul", { className: "list-disc list-inside space-y-1" },
                                React.createElement("li", null, "Check your spam or junk folder"),
                                React.createElement("li", null, "Verify the email address is correct"),
                                React.createElement("li", null, "Wait a few minutes and check again"))),
                        React.createElement("div", { className: "flex flex-col gap-2" },
                            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setIsSubmitted(false); }, className: "w-full" }, "Try Another Email"),
                            React.createElement(button_1.Button, { variant: "ghost", onClick: function () { return setLocation("/login"); }, className: "w-full" },
                                React.createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-2" }),
                                "Back to Login")))))));
    }
    return (React.createElement("div", { className: "min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-violet-50" },
        React.createElement("div", { className: "p-4 sm:p-6" },
            React.createElement("a", { href: "/", onClick: function (e) { e.preventDefault(); setLocation("/"); }, className: "inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors" },
                React.createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4" }),
                "Back to home")),
        React.createElement("div", { className: "flex-1 flex items-center justify-center p-4" },
            React.createElement(card_1.Card, { className: "w-full max-w-md shadow-xl border-gray-200" },
                React.createElement(card_1.CardHeader, { className: "text-center" },
                    React.createElement("div", { className: "flex justify-center mb-4" },
                        React.createElement("a", { href: "/", onClick: function (e) { e.preventDefault(); setLocation("/"); }, className: "flex items-center gap-2.5 no-underline" },
                            React.createElement("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200" },
                                React.createElement(lucide_react_1.Zap, { className: "h-5 w-5 text-white" })),
                            React.createElement("span", { className: "text-2xl font-bold text-gray-900 tracking-tight" },
                                "Kiini",
                                React.createElement("span", { className: "text-indigo-600" }, "360")))),
                    React.createElement(card_1.CardTitle, { className: "text-2xl" }, "Reset Your Password"),
                    React.createElement(card_1.CardDescription, { className: "text-base mt-2" }, "Enter your email address and we'll send you instructions to reset your password")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("form", { onSubmit: handleSubmit, className: "space-y-4" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "email" }, "Email Address"),
                            React.createElement("div", { className: "relative" },
                                React.createElement(lucide_react_1.Mail, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" }),
                                React.createElement(input_1.Input, { id: "email", type: "email", placeholder: "your.email@example.com", value: email, onChange: function (e) { return setEmail(e.target.value); }, className: "pl-10", disabled: isLoading }))),
                        React.createElement(button_1.Button, { type: "submit", className: "w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200", disabled: isLoading }, isLoading ? "Sending..." : "Send Reset Instructions"),
                        React.createElement(button_1.Button, { type: "button", variant: "ghost", onClick: function () { return setLocation("/login"); }, className: "w-full" },
                            React.createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-2" }),
                            "Back to Login")),
                    React.createElement("div", { className: "mt-6 p-4 bg-muted rounded-lg text-sm text-muted-foreground" },
                        React.createElement("p", { className: "font-semibold mb-2" }, "Security Note:"),
                        React.createElement("p", null, "For your security, we'll only send reset instructions if an account exists with this email address. The link will expire after 1 hour.")))))));
}
exports["default"] = ForgotPassword;
