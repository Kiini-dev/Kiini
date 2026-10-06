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
var useAuthWithPersistence_1 = require("@/_core/hooks/useAuthWithPersistence");
var permissions_1 = require("@/lib/permissions");
/**
 * Login component with proper authentication flow
 *
 * Features:
 * - Stores auth token in localStorage for Docker/HTTP environments
 * - Redirects to role-based dashboard after successful login
 * - Handles authentication errors gracefully
 * - Persists login state across page reloads
 */
function Login() {
    var _this = this;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
    var nextPath = searchParams.get("next") || "";
    var _b = react_1.useState(false), loading = _b[0], setLoading = _b[1];
    var _c = react_1.useState(false), showPassword = _c[0], setShowPassword = _c[1];
    var _d = react_1.useState(""), error = _d[0], setError = _d[1];
    var _e = react_1.useState({ email: "", password: "" }), formData = _e[0], setFormData = _e[1];
    var _f = useAuthWithPersistence_1.useAuthWithPersistence(), user = _f.user, isAuthenticated = _f.isAuthenticated, authLoading = _f.loading;
    // If already authenticated, redirect immediately
    react_1.useEffect(function () {
        if (authLoading || !isAuthenticated || !user)
            return;
        if (nextPath) {
            window.location.replace(nextPath);
            return;
        }
        var orgSlug = user.organizationSlug;
        if (user.organizationId && orgSlug) {
            window.location.replace("/org/" + orgSlug + "/dashboard");
        }
        else {
            window.location.replace(permissions_1.getDashboardUrl(user.role));
        }
    }, [authLoading, isAuthenticated, nextPath, user]);
    var loginMutation = trpc_1.trpc.auth.login.useMutation({
        onSuccess: function (data) {
            var userRole = data.user.role;
            var organizationId = data.user.organizationId;
            var organizationSlug = data.user.organizationSlug;
            // Store token in localStorage for fallback when cookies fail
            if (data.token) {
                localStorage.setItem("auth-token", data.token);
                console.log('[Login] Token stored to localStorage:', data.token.substring(0, 20) + '...');
            }
            // Store user data in localStorage
            localStorage.setItem("auth-user", JSON.stringify(data.user));
            console.log('[Login] User stored to localStorage:', data.user.email);
            sonner_1.toast.success("Login successful!");
            // Check if user needs to change password on first login
            if ("requiresPasswordChange" in data.user && data.user.requiresPasswordChange) {
                localStorage.setItem("requiresPasswordChange", "true");
                window.location.replace("/change-password");
                return;
            }
            // If user belongs to an organization, route to org-scoped dashboard
            if (organizationId && organizationSlug) {
                // Use a tiny delay to ensure localStorage is flushed before navigation
                setTimeout(function () {
                    console.log('[Login] Navigating to org dashboard:', "/org/" + organizationSlug + "/dashboard");
                    window.location.replace("/org/" + organizationSlug + "/dashboard?v=" + Date.now());
                }, 100);
                return;
            }
            if (nextPath) {
                setTimeout(function () {
                    console.log('[Login] Navigating to next path:', nextPath);
                    // Add cache-bust param if nextPath doesn't already have query params
                    var separator = nextPath.includes('?') ? '&' : '?';
                    window.location.replace("" + nextPath + separator + "v=" + Date.now());
                }, 100);
                return;
            }
            // Use a tiny delay to ensure localStorage is flushed before navigation
            setTimeout(function () {
                var dashboardUrl = permissions_1.getDashboardUrl(userRole);
                console.log('[Login] Navigating to dashboard:', dashboardUrl);
                // Add cache-bust param
                var separator = dashboardUrl.includes('?') ? '&' : '?';
                window.location.replace("" + dashboardUrl + separator + "v=" + Date.now());
            }, 100);
        },
        onError: function (error) {
            setError(error.message || "Login failed. Please check your credentials.");
            sonner_1.toast.error(error.message || "Login failed");
        },
        onSettled: function () {
            setLoading(false);
        }
    });
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            e.preventDefault();
            setError("");
            setLoading(true);
            loginMutation.mutate({
                email: formData.email,
                password: formData.password
            });
            return [2 /*return*/];
        });
    }); };
    return (React.createElement("div", { className: "min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-violet-50" },
        React.createElement("div", { className: "p-4 sm:p-6" },
            React.createElement("a", { href: "/", onClick: function (e) { e.preventDefault(); setLocation("/"); }, className: "inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors" },
                React.createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4" }),
                "Back to home")),
        React.createElement("div", { className: "flex-1 flex items-center justify-center p-4" },
            React.createElement(card_1.Card, { className: "w-full max-w-md shadow-xl border-gray-200" },
                React.createElement(card_1.CardHeader, { className: "space-y-4" },
                    React.createElement("div", { className: "flex justify-center" },
                        React.createElement("a", { href: "/", onClick: function (e) { e.preventDefault(); setLocation("/"); }, className: "flex items-center gap-2.5 no-underline" },
                            React.createElement("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200" },
                                React.createElement(lucide_react_1.Zap, { className: "h-5 w-5 text-white" })),
                            React.createElement("span", { className: "text-2xl font-bold text-gray-900 tracking-tight" },
                                "Kiini",
                                React.createElement("span", { className: "text-indigo-600" }, "360")))),
                    React.createElement("div", { className: "text-center" },
                        React.createElement(card_1.CardTitle, { className: "text-2xl font-bold" }, "Welcome Back"),
                        React.createElement(card_1.CardDescription, null, "Sign in to your account to continue"))),
                React.createElement("form", { onSubmit: handleSubmit },
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        error && (React.createElement(alert_1.Alert, { variant: "destructive" },
                            React.createElement(alert_1.AlertDescription, null, error))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "email" }, "Email"),
                            React.createElement("div", { className: "relative" },
                                React.createElement(lucide_react_1.Mail, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                                React.createElement(input_1.Input, { id: "email", type: "email", placeholder: "Enter your email", value: formData.email, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { email: e.target.value })); }, className: "pl-10", required: true, autoFocus: true, disabled: loading }))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "password" }, "Password"),
                            React.createElement("div", { className: "relative" },
                                React.createElement(lucide_react_1.Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                                React.createElement(input_1.Input, { id: "password", type: showPassword ? "text" : "password", placeholder: "Enter your password", value: formData.password, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { password: e.target.value })); }, className: "pl-10 pr-10", required: true, disabled: loading }),
                                React.createElement("button", { type: "button", onClick: function () { return setShowPassword(!showPassword); }, className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground", disabled: loading }, showPassword ? React.createElement(lucide_react_1.EyeOff, { className: "h-4 w-4" }) : React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" }))))),
                    React.createElement(card_1.CardFooter, { className: "flex flex-col space-y-4" },
                        React.createElement(button_1.Button, { type: "submit", className: "w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200", disabled: loading }, loading ? "Signing in..." : "Sign In"),
                        React.createElement("div", { className: "flex items-center justify-between w-full" },
                            React.createElement("a", { href: "/forgot-password", onClick: function (e) { e.preventDefault(); setLocation("/forgot-password"); }, className: "text-xs text-indigo-600 hover:text-indigo-800 hover:underline" }, "Forgot password?"),
                            React.createElement("span", { className: "text-xs text-muted-foreground" },
                                "No account?",
                                " ",
                                React.createElement("a", { href: "/signup", onClick: function (e) { e.preventDefault(); setLocation("/signup"); }, className: "text-indigo-600 hover:text-indigo-800 hover:underline font-medium" }, "Sign up")))))))));
}
exports["default"] = Login;
