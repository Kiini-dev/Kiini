"use strict";
exports.__esModule = true;
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var lucide_react_1 = require("lucide-react");
function MFA() {
    var _a, _b, _c, _d, _e;
    var _f = react_1.useState("authenticator_app"), method = _f[0], setMethod = _f[1];
    var _g = react_1.useState(""), disablePassword = _g[0], setDisablePassword = _g[1];
    var dashboardQuery = trpc_1.trpc.securityCompliance.getSecurityDashboard.useQuery({});
    var enableMutation = trpc_1.trpc.securityCompliance.enableTwoFactorAuth.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Done");
            dashboardQuery.refetch();
        },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var disableMutation = trpc_1.trpc.auth.disable2FA.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Done");
            dashboardQuery.refetch();
            setDisablePassword("");
        },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    if (dashboardQuery.isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Multi-Factor Authentication", description: "Manage two-factor authentication for your account", icon: React.createElement(lucide_react_1.KeyRound, { className: "h-5 w-5" }), breadcrumbs: [
                { label: "Dashboard", href: "/" },
                { label: "Settings", href: "/settings" },
                { label: "MFA" },
            ] },
            React.createElement("div", { className: "flex justify-center py-16" },
                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))));
    }
    if (dashboardQuery.error) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Multi-Factor Authentication", description: "Manage two-factor authentication for your account", icon: React.createElement(lucide_react_1.KeyRound, { className: "h-5 w-5" }), breadcrumbs: [
                { label: "Dashboard", href: "/" },
                { label: "Settings", href: "/settings" },
                { label: "MFA" },
            ] },
            React.createElement("div", { className: "bg-red-50 text-red-700 p-4 rounded-lg" },
                "Error: ",
                dashboardQuery.error.message)));
    }
    var dashboard = (_a = dashboardQuery.data) !== null && _a !== void 0 ? _a : {};
    var summary = (_b = dashboard.summary) !== null && _b !== void 0 ? _b : {};
    var twoFactorAdoption = (_c = summary.twoFactorAdoption) !== null && _c !== void 0 ? _c : 0;
    var mfaEnabled = twoFactorAdoption > 0;
    var handleEnable = function () {
        enableMutation.mutate({ userId: 0, method: method });
    };
    var handleDisable = function () {
        if (!disablePassword) {
            sonner_1.toast.error("Password is required to disable 2FA");
            return;
        }
        disableMutation.mutate({ password: disablePassword });
    };
    var backupCodes = (_e = (_d = enableMutation.data) === null || _d === void 0 ? void 0 : _d.backupCodes) !== null && _e !== void 0 ? _e : [];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Multi-Factor Authentication", description: "Manage two-factor authentication for your account", icon: React.createElement(lucide_react_1.KeyRound, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Settings", href: "/settings" },
            { label: "MFA" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                            React.createElement(lucide_react_1.Shield, { className: "h-5 w-5" }),
                            "MFA Status"),
                        React.createElement(badge_1.Badge, { variant: mfaEnabled ? "default" : "secondary" }, mfaEnabled ? (React.createElement("span", { className: "flex items-center gap-1" },
                            React.createElement(lucide_react_1.CheckCircle2, { className: "h-3 w-3" }),
                            " Enabled")) : (React.createElement("span", { className: "flex items-center gap-1" },
                            React.createElement(lucide_react_1.XCircle, { className: "h-3 w-3" }),
                            " Disabled"))))),
                React.createElement(card_1.CardContent, null,
                    React.createElement("p", { className: "text-sm text-muted-foreground mb-2" },
                        "2FA adoption rate: ",
                        React.createElement("strong", null,
                            twoFactorAdoption,
                            "%")),
                    mfaEnabled ? (React.createElement("p", { className: "text-sm text-green-700 bg-green-50 p-3 rounded-lg" }, "Two-factor authentication is active. Your account has an extra layer of security.")) : (React.createElement("p", { className: "text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg" }, "Two-factor authentication is not enabled. Enable it to secure your account.")))),
            !mfaEnabled && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Enable Two-Factor Authentication")),
                React.createElement(card_1.CardContent, { className: "space-y-4" },
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement("label", { className: "text-sm font-medium" }, "Method"),
                        React.createElement("select", { className: "border rounded px-3 py-2 text-sm w-full", value: method, onChange: function (e) { return setMethod(e.target.value); } },
                            React.createElement("option", { value: "authenticator_app" }, "Authenticator App"),
                            React.createElement("option", { value: "sms" }, "SMS"),
                            React.createElement("option", { value: "email" }, "Email"))),
                    React.createElement(button_1.Button, { onClick: handleEnable, disabled: enableMutation.isPending }, enableMutation.isPending ? "Enabling..." : "Enable 2FA"),
                    backupCodes.length > 0 && (React.createElement("div", { className: "mt-4 p-4 bg-muted rounded-lg" },
                        React.createElement("p", { className: "text-sm font-medium mb-2" }, "Backup Codes (save these):"),
                        React.createElement("div", { className: "grid grid-cols-2 gap-1 font-mono text-sm" }, backupCodes.map(function (code, i) { return (React.createElement("span", { key: i }, code)); }))))))),
            mfaEnabled && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Disable Two-Factor Authentication")),
                React.createElement(card_1.CardContent, { className: "space-y-4" },
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement("label", { className: "text-sm font-medium" }, "Enter your password to confirm"),
                        React.createElement(input_1.Input, { type: "password", placeholder: "Current password", value: disablePassword, onChange: function (e) { return setDisablePassword(e.target.value); } })),
                    React.createElement(button_1.Button, { variant: "destructive", onClick: handleDisable, disabled: disableMutation.isPending }, disableMutation.isPending ? "Disabling..." : "Disable 2FA")))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "How It Works")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid gap-4 md:grid-cols-3" },
                        React.createElement("div", { className: "space-y-1" },
                            React.createElement("div", { className: "flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold" }, "1"),
                            React.createElement("p", { className: "font-medium" }, "Sign in"),
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Enter your username and password")),
                        React.createElement("div", { className: "space-y-1" },
                            React.createElement("div", { className: "flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold" }, "2"),
                            React.createElement("p", { className: "font-medium" }, "Get code"),
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Open your authenticator app for a 6-digit code")),
                        React.createElement("div", { className: "space-y-1" },
                            React.createElement("div", { className: "flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold" }, "3"),
                            React.createElement("p", { className: "font-medium" }, "Verify"),
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Enter the code to complete sign-in"))))))));
}
exports["default"] = MFA;
