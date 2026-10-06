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
var trpc_1 = require("@/lib/trpc");
var mutationHelpers_1 = require("@/lib/mutationHelpers");
var wouter_1 = require("wouter");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
function Signup() {
    var _this = this;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
    var planParam = searchParams.get("plan");
    var nextPath = searchParams.get("next") || (planParam ? "/checkout/" + encodeURIComponent(planParam) : "/checkout");
    var _b = react_1.useState(false), loading = _b[0], setLoading = _b[1];
    var _c = react_1.useState(false), showPassword = _c[0], setShowPassword = _c[1];
    var _d = react_1.useState(false), showConfirmPassword = _d[0], setShowConfirmPassword = _d[1];
    var _e = react_1.useState(""), error = _e[0], setError = _e[1];
    var _f = react_1.useState({
        username: "",
        email: "",
        company: "",
        slug: "",
        password: "",
        confirmPassword: ""
    }), formData = _f[0], setFormData = _f[1];
    var registerMutation = trpc_1.trpc.auth.register.useMutation();
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setError("");
                    // Validation
                    if (formData.password !== formData.confirmPassword) {
                        setError("Passwords do not match");
                        return [2 /*return*/];
                    }
                    if (!formData.company.trim()) {
                        setError("Company name is required");
                        return [2 /*return*/];
                    }
                    if (formData.password.length < 8) {
                        setError("Password must be at least 8 characters long");
                        return [2 /*return*/];
                    }
                    if (formData.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)) {
                        setError("Slug must be lowercase letters, numbers, and hyphens only");
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, mutationHelpers_1["default"](registerMutation, {
                            email: formData.email,
                            password: formData.password,
                            name: formData.username,
                            company: formData.company,
                            slug: formData.slug || undefined
                        })];
                case 2:
                    _a.sent();
                    sonner_1.toast.success("Account created successfully! Please sign in.");
                    setLocation("/login" + (nextPath ? "?next=" + encodeURIComponent(nextPath) : ""));
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    setError((err_1 === null || err_1 === void 0 ? void 0 : err_1.message) || "An error occurred during registration. Please try again.");
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement("div", { className: "min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-violet-50" },
        React.createElement("div", { className: "p-4 sm:p-6" },
            React.createElement("a", { href: "/", onClick: function (e) { e.preventDefault(); setLocation("/"); }, className: "inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors" },
                React.createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4" }),
                "Back to home")),
        React.createElement("div", { className: "flex-1 flex items-center justify-center p-4" },
            React.createElement(card_1.Card, { className: "w-full max-w-md shadow-xl border-gray-200" },
                React.createElement(card_1.CardHeader, { className: "space-y-1 text-center" },
                    React.createElement("div", { className: "flex justify-center mb-4" },
                        React.createElement("a", { href: "/", onClick: function (e) { e.preventDefault(); setLocation("/"); }, className: "flex items-center gap-2.5 no-underline" },
                            React.createElement("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200" },
                                React.createElement(lucide_react_1.Zap, { className: "h-5 w-5 text-white" })),
                            React.createElement("span", { className: "text-2xl font-bold text-gray-900 tracking-tight" },
                                "Kiini",
                                React.createElement("span", { className: "text-indigo-600" }, "360")))),
                    React.createElement(card_1.CardTitle, { className: "text-2xl font-bold" }, "Create Account"),
                    React.createElement(card_1.CardDescription, null, "Sign up to get started with Kiini")),
                React.createElement("form", { onSubmit: handleSubmit },
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        error && (React.createElement(alert_1.Alert, { variant: "destructive" },
                            React.createElement(alert_1.AlertDescription, null, error))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "username" }, "Username *"),
                            React.createElement("div", { className: "relative" },
                                React.createElement(lucide_react_1.User, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                                React.createElement(input_1.Input, { id: "username", type: "text", placeholder: "Choose a username", value: formData.username, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { username: e.target.value })); }, className: "pl-10", required: true, autoFocus: true }))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "email" }, "Email *"),
                            React.createElement("div", { className: "relative" },
                                React.createElement(lucide_react_1.Mail, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                                React.createElement(input_1.Input, { id: "email", type: "email", placeholder: "your.email@example.com", value: formData.email, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { email: e.target.value })); }, className: "pl-10", required: true }))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "company" }, "Company Name *"),
                            React.createElement("div", { className: "relative" },
                                React.createElement(lucide_react_1.Building, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                                React.createElement(input_1.Input, { id: "company", type: "text", placeholder: "Your company name", value: formData.company, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { company: e.target.value })); }, className: "pl-10", required: true }))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "slug" }, "Organization Slug"),
                            React.createElement("div", { className: "relative" },
                                React.createElement("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" }, "kiini/"),
                                React.createElement(input_1.Input, { id: "slug", type: "text", placeholder: "your-company", value: formData.slug, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { slug: e.target.value.toLowerCase() })); }, className: "pl-24" })),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Provide a URL-friendly slug for your organization access URL.")),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "password" }, "Password *"),
                            React.createElement("div", { className: "relative" },
                                React.createElement(lucide_react_1.Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                                React.createElement(input_1.Input, { id: "password", type: showPassword ? "text" : "password", placeholder: "Create a strong password", value: formData.password, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { password: e.target.value })); }, className: "pl-10 pr-10", required: true, minLength: 8 }),
                                React.createElement("button", { type: "button", onClick: function () { return setShowPassword(!showPassword); }, className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" }, showPassword ? React.createElement(lucide_react_1.EyeOff, { className: "h-4 w-4" }) : React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" }))),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Must be at least 8 characters long")),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "confirmPassword" }, "Confirm Password *"),
                            React.createElement("div", { className: "relative" },
                                React.createElement(lucide_react_1.Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                                React.createElement(input_1.Input, { id: "confirmPassword", type: showConfirmPassword ? "text" : "password", placeholder: "Confirm your password", value: formData.confirmPassword, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { confirmPassword: e.target.value })); }, className: "pl-10 pr-10", required: true }),
                                React.createElement("button", { type: "button", onClick: function () { return setShowConfirmPassword(!showConfirmPassword); }, className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" }, showConfirmPassword ? React.createElement(lucide_react_1.EyeOff, { className: "h-4 w-4" }) : React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" })))),
                        React.createElement("div", { className: "flex items-start space-x-2" },
                            React.createElement("input", { id: "agreeTerms", type: "checkbox", required: true, className: "mt-1 rounded border-gray-300" }),
                            React.createElement("label", { htmlFor: "agreeTerms", className: "text-sm text-muted-foreground" },
                                "I agree to the",
                                " ",
                                React.createElement("a", { href: "/terms-and-conditions", className: "text-indigo-600 hover:underline" }, "Terms of Service"),
                                " ",
                                "and",
                                " ",
                                React.createElement("a", { href: "/privacy-policy", className: "text-indigo-600 hover:underline" }, "Privacy Policy")))),
                    React.createElement(card_1.CardFooter, { className: "flex flex-col space-y-4" },
                        React.createElement(button_1.Button, { type: "submit", className: "w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200", disabled: loading }, loading ? "Creating account..." : "Create Account"),
                        React.createElement("div", { className: "text-center text-sm text-muted-foreground" },
                            "Already have an account?",
                            " ",
                            React.createElement("a", { href: "/login", onClick: function (e) { e.preventDefault(); setLocation("/login" + (nextPath ? "?next=" + encodeURIComponent(nextPath) : "")); }, className: "text-indigo-600 hover:text-indigo-800 hover:underline font-medium" }, "Sign in"))))))));
}
exports["default"] = Signup;
