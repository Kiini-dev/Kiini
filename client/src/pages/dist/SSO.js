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
function SSO() {
    var _a, _b, _c;
    var _d = react_1.useState({}), formValues = _d[0], setFormValues = _d[1];
    var ssoQuery = trpc_1.trpc.settings.getByCategory.useQuery({ category: "sso" });
    var updateMutation = trpc_1.trpc.settings.updateByCategory.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Done");
            ssoQuery.refetch();
        },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var data = (_a = ssoQuery.data) !== null && _a !== void 0 ? _a : {};
    react_1.useEffect(function () {
        if (ssoQuery.data) {
            setFormValues(__assign({}, data));
        }
    }, [ssoQuery.data]);
    var handleChange = function (key, value) {
        setFormValues(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[key] = value, _a)));
        });
    };
    var handleSave = function () {
        updateMutation.mutate({ category: "sso", values: formValues });
    };
    if (ssoQuery.isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Single Sign-On", description: "Configure SSO providers and settings", icon: React.createElement(lucide_react_1.LogIn, { className: "h-5 w-5" }), breadcrumbs: [
                { label: "Dashboard", href: "/" },
                { label: "Settings", href: "/settings" },
                { label: "SSO" },
            ] },
            React.createElement("div", { className: "flex justify-center py-16" },
                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))));
    }
    if (ssoQuery.error) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Single Sign-On", description: "Configure SSO providers and settings", icon: React.createElement(lucide_react_1.LogIn, { className: "h-5 w-5" }), breadcrumbs: [
                { label: "Dashboard", href: "/" },
                { label: "Settings", href: "/settings" },
                { label: "SSO" },
            ] },
            React.createElement("div", { className: "bg-red-50 text-red-700 p-4 rounded-lg" },
                "Error: ",
                ssoQuery.error.message)));
    }
    var knownKeys = Object.keys(data);
    var hasSettings = knownKeys.length > 0;
    var defaultFields = [
        { key: "provider", label: "SSO Provider" },
        { key: "client_id", label: "Client ID" },
        { key: "client_secret", label: "Client Secret" },
        { key: "tenant_id", label: "Tenant ID" },
        { key: "domain", label: "Domain" },
        { key: "callback_url", label: "Callback URL" },
        { key: "enabled", label: "Enabled (true/false)" },
    ];
    var fieldsToShow = hasSettings
        ? knownKeys.map(function (k) { return ({ key: k, label: k.replace(/_/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); }) }); })
        : defaultFields;
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Single Sign-On", description: "Configure SSO providers and settings", icon: React.createElement(lucide_react_1.LogIn, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Settings", href: "/settings" },
            { label: "SSO" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                            React.createElement(lucide_react_1.Shield, { className: "h-5 w-5" }),
                            "SSO Status"),
                        React.createElement(badge_1.Badge, { variant: data["enabled"] === "true" ? "default" : "secondary" }, data["enabled"] === "true" ? "Active" : "Inactive"))),
                React.createElement(card_1.CardContent, null, hasSettings ? (React.createElement("p", { className: "text-sm text-muted-foreground" },
                    "Provider: ",
                    React.createElement("strong", null, (_b = data["provider"]) !== null && _b !== void 0 ? _b : "—"),
                    " \u00B7 Domain: ",
                    React.createElement("strong", null, (_c = data["domain"]) !== null && _c !== void 0 ? _c : "—"))) : (React.createElement("p", { className: "text-center text-gray-500 py-8" }, "No data found.")))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "SSO Configuration")),
                React.createElement(card_1.CardContent, { className: "space-y-4" },
                    fieldsToShow.map(function (field) {
                        var _a;
                        return (React.createElement("div", { key: field.key, className: "space-y-1" },
                            React.createElement("label", { className: "text-sm font-medium" }, field.label),
                            React.createElement(input_1.Input, { value: (_a = formValues[field.key]) !== null && _a !== void 0 ? _a : "", onChange: function (e) { return handleChange(field.key, e.target.value); }, placeholder: field.label, type: field.key.includes("secret") ? "password" : "text" })));
                    }),
                    React.createElement(button_1.Button, { onClick: handleSave, disabled: updateMutation.isPending, className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Save, { className: "h-4 w-4" }),
                        updateMutation.isPending ? "Saving..." : "Save Configuration"))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Setup Guide")),
                React.createElement(card_1.CardContent, { className: "text-sm text-muted-foreground space-y-2" },
                    React.createElement("p", null, "1. Register your application with the SSO provider (Azure AD, Okta, Auth0, etc.)"),
                    React.createElement("p", null, "2. Obtain the Client ID, Client Secret, and Tenant ID from the provider dashboard."),
                    React.createElement("p", null, "3. Set the Callback URL to your application's authentication callback endpoint."),
                    React.createElement("p", null, "4. Enter the values above and set Enabled to \"true\" to activate SSO."))))));
}
exports["default"] = SSO;
