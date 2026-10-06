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
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var dialog_1 = require("@/components/ui/dialog");
var tabs_1 = require("@/components/ui/tabs");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var utils_1 = require("@/lib/utils");
var stats_card_1 = require("@/components/ui/stats-card");
var INTEGRATION_TYPES = [
    { value: "api", label: "API Key", icon: lucide_react_1.Key, description: "Connect via API key authentication" },
    { value: "webhook", label: "Webhook", icon: lucide_react_1.Webhook, description: "Set up webhook endpoints" },
    { value: "oauth", label: "OAuth", icon: lucide_react_1.Globe, description: "OAuth 2.0 authentication flow" },
    { value: "custom", label: "Custom", icon: lucide_react_1.Plug, description: "Custom integration configuration" },
];
var POPULAR_PROVIDERS = [
    { name: "SMTP Email", provider: "smtp", type: "custom", icon: lucide_react_1.Mail, color: "bg-blue-500" },
    { name: "Slack", provider: "slack", type: "webhook", icon: lucide_react_1.Webhook, color: "bg-purple-500" },
    { name: "Stripe", provider: "stripe", type: "api", icon: lucide_react_1.Key, color: "bg-indigo-500" },
    { name: "M-Pesa", provider: "mpesa", type: "api", icon: lucide_react_1.Key, color: "bg-green-500" },
    { name: "SendGrid", provider: "sendgrid", type: "api", icon: lucide_react_1.Mail, color: "bg-blue-600" },
    { name: "Twilio SMS", provider: "twilio", type: "api", icon: lucide_react_1.Globe, color: "bg-red-500" },
];
function Integrations() {
    var _a = react_1.useState(false), isAddOpen = _a[0], setIsAddOpen = _a[1];
    var _b = react_1.useState(""), provider = _b[0], setProvider = _b[1];
    var _c = react_1.useState("api"), integrationType = _c[0], setIntegrationType = _c[1];
    var _d = react_1.useState(""), apiKey = _d[0], setApiKey = _d[1];
    var _e = react_1.useState(""), webhookUrl = _e[0], setWebhookUrl = _e[1];
    var _f = react_1.useState(""), clientId = _f[0], setClientId = _f[1];
    var _g = react_1.useState(""), clientSecret = _g[0], setClientSecret = _g[1];
    // SMTP-specific fields
    var _h = react_1.useState(""), smtpHost = _h[0], setSmtpHost = _h[1];
    var _j = react_1.useState("587"), smtpPort = _j[0], setSmtpPort = _j[1];
    var _k = react_1.useState(""), smtpUsername = _k[0], setSmtpUsername = _k[1];
    var _l = react_1.useState(""), smtpPassword = _l[0], setSmtpPassword = _l[1];
    var _m = react_1.useState(""), smtpFromEmail = _m[0], setSmtpFromEmail = _m[1];
    var _o = react_1.useState(""), smtpFromName = _o[0], setSmtpFromName = _o[1];
    var _p = react_1.useState("tls"), smtpSecure = _p[0], setSmtpSecure = _p[1];
    var isSMTP = provider === "smtp";
    var _q = trpc_1.trpc.thirdPartyIntegrations.listIntegrations.useQuery({ limit: 50 }), data = _q.data, refetch = _q.refetch, isLoading = _q.isLoading;
    var configureMutation = trpc_1.trpc.thirdPartyIntegrations.configureIntegration.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Integration configured successfully");
            refetch();
            resetForm();
            setIsAddOpen(false);
        },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var testMutation = trpc_1.trpc.thirdPartyIntegrations.testIntegration.useMutation({
        onSuccess: function (data) {
            if (data.success)
                sonner_1.toast.success("Integration test passed (" + data.responseTime + "ms)");
            else
                sonner_1.toast.error(data.error || "Test failed");
        },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var disableMutation = trpc_1.trpc.thirdPartyIntegrations.disableIntegration.useMutation({
        onSuccess: function () { sonner_1.toast.success("Integration disabled"); refetch(); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var deleteMutation = trpc_1.trpc.thirdPartyIntegrations.deleteIntegration.useMutation({
        onSuccess: function () { sonner_1.toast.success("Integration deleted"); refetch(); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var resetForm = function () {
        setProvider("");
        setIntegrationType("api");
        setApiKey("");
        setWebhookUrl("");
        setClientId("");
        setClientSecret("");
        setSmtpHost("");
        setSmtpPort("587");
        setSmtpUsername("");
        setSmtpPassword("");
        setSmtpFromEmail("");
        setSmtpFromName("");
        setSmtpSecure("tls");
    };
    var handleConfigure = function () {
        if (!provider.trim()) {
            sonner_1.toast.error("Provider name is required");
            return;
        }
        if (isSMTP) {
            if (!smtpHost.trim()) {
                sonner_1.toast.error("SMTP host is required");
                return;
            }
            if (!smtpUsername.trim()) {
                sonner_1.toast.error("SMTP username is required");
                return;
            }
            if (!smtpPassword.trim()) {
                sonner_1.toast.error("SMTP password is required");
                return;
            }
            if (!smtpFromEmail.trim()) {
                sonner_1.toast.error("From email is required");
                return;
            }
            configureMutation.mutate({
                provider: "smtp",
                integrationType: "custom",
                config: {
                    host: smtpHost,
                    port: parseInt(smtpPort) || 587,
                    username: smtpUsername,
                    password: smtpPassword,
                    fromEmail: smtpFromEmail,
                    fromName: smtpFromName,
                    secure: smtpSecure
                }
            });
            return;
        }
        configureMutation.mutate({
            provider: provider.trim(),
            integrationType: integrationType,
            config: __assign(__assign(__assign(__assign({}, (apiKey && { apiKey: apiKey })), (webhookUrl && { webhookUrl: webhookUrl })), (clientId && { clientId: clientId })), (clientSecret && { clientSecret: clientSecret }))
        });
    };
    var integrations = (data === null || data === void 0 ? void 0 : data.integrations) || [];
    var activeCount = integrations.filter(function (i) { return i.status === "active"; }).length;
    return (React.createElement(ModuleLayout_1["default"], { title: "Integrations", description: "Connect third-party services, SMTP, webhooks, and API integrations", icon: React.createElement(lucide_react_1.Plug, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Settings", href: "/settings" },
            { label: "Integrations" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Integrations", value: integrations.length, icon: React.createElement(lucide_react_1.Plug, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Active", value: activeCount, icon: React.createElement(lucide_react_1.Power, { className: "h-5 w-5" }), color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Inactive", value: integrations.length - activeCount, icon: React.createElement(lucide_react_1.PowerOff, { className: "h-5 w-5" }), color: "border-l-amber-500" })),
            React.createElement(tabs_1.Tabs, { defaultValue: "configured" },
                React.createElement("div", { className: "flex items-center justify-between flex-wrap gap-2" },
                    React.createElement(tabs_1.TabsList, null,
                        React.createElement(tabs_1.TabsTrigger, { value: "configured" }, "Configured"),
                        React.createElement(tabs_1.TabsTrigger, { value: "available" }, "Available")),
                    React.createElement(dialog_1.Dialog, { open: isAddOpen, onOpenChange: setIsAddOpen },
                        React.createElement(dialog_1.DialogTrigger, { asChild: true },
                            React.createElement(button_1.Button, null,
                                React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                                " Add Integration")),
                        React.createElement(dialog_1.DialogContent, { className: "sm:max-w-lg" },
                            React.createElement(dialog_1.DialogHeader, null,
                                React.createElement(dialog_1.DialogTitle, null, isSMTP ? "Configure SMTP Email" : "Configure New Integration")),
                            React.createElement("div", { className: "space-y-4 py-4" },
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, null, "Provider Name"),
                                    React.createElement(input_1.Input, { placeholder: "e.g., smtp, slack, stripe...", value: provider, onChange: function (e) { return setProvider(e.target.value); } })),
                                !isSMTP && (React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, null, "Integration Type"),
                                    React.createElement(select_1.Select, { value: integrationType, onValueChange: setIntegrationType },
                                        React.createElement(select_1.SelectTrigger, null,
                                            React.createElement(select_1.SelectValue, null)),
                                        React.createElement(select_1.SelectContent, null, INTEGRATION_TYPES.map(function (t) { return (React.createElement(select_1.SelectItem, { key: t.value, value: t.value }, t.label)); }))))),
                                isSMTP && (React.createElement(React.Fragment, null,
                                    React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, null, "SMTP Host *"),
                                            React.createElement(input_1.Input, { placeholder: "smtp.gmail.com", value: smtpHost, onChange: function (e) { return setSmtpHost(e.target.value); } })),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, null, "Port"),
                                            React.createElement(input_1.Input, { type: "number", placeholder: "587", value: smtpPort, onChange: function (e) { return setSmtpPort(e.target.value); } }))),
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, null, "Encryption"),
                                        React.createElement(select_1.Select, { value: smtpSecure, onValueChange: setSmtpSecure },
                                            React.createElement(select_1.SelectTrigger, null,
                                                React.createElement(select_1.SelectValue, null)),
                                            React.createElement(select_1.SelectContent, null,
                                                React.createElement(select_1.SelectItem, { value: "tls" }, "STARTTLS (port 587)"),
                                                React.createElement(select_1.SelectItem, { value: "ssl" }, "SSL/TLS (port 465)"),
                                                React.createElement(select_1.SelectItem, { value: "none" }, "None (port 25)")))),
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, null, "Username / Email *"),
                                        React.createElement(input_1.Input, { placeholder: "your@email.com", value: smtpUsername, onChange: function (e) { return setSmtpUsername(e.target.value); } })),
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, null, "Password *"),
                                        React.createElement(input_1.Input, { type: "password", placeholder: "App password or SMTP password", value: smtpPassword, onChange: function (e) { return setSmtpPassword(e.target.value); } })),
                                    React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, null, "From Email *"),
                                            React.createElement(input_1.Input, { placeholder: "noreply@yourdomain.com", value: smtpFromEmail, onChange: function (e) { return setSmtpFromEmail(e.target.value); } })),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, null, "From Name"),
                                            React.createElement(input_1.Input, { placeholder: "Your Company Name", value: smtpFromName, onChange: function (e) { return setSmtpFromName(e.target.value); } }))))),
                                !isSMTP && (integrationType === "api" || integrationType === "custom") && (React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, null, "API Key"),
                                    React.createElement(input_1.Input, { type: "password", placeholder: "Enter API key", value: apiKey, onChange: function (e) { return setApiKey(e.target.value); } }))),
                                !isSMTP && (integrationType === "webhook" || integrationType === "custom") && (React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, null, "Webhook URL"),
                                    React.createElement(input_1.Input, { placeholder: "https://...", value: webhookUrl, onChange: function (e) { return setWebhookUrl(e.target.value); } }))),
                                !isSMTP && integrationType === "oauth" && (React.createElement(React.Fragment, null,
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, null, "Client ID"),
                                        React.createElement(input_1.Input, { value: clientId, onChange: function (e) { return setClientId(e.target.value); } })),
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, null, "Client Secret"),
                                        React.createElement(input_1.Input, { type: "password", value: clientSecret, onChange: function (e) { return setClientSecret(e.target.value); } }))))),
                            React.createElement(dialog_1.DialogFooter, null,
                                React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setIsAddOpen(false); } }, "Cancel"),
                                React.createElement(button_1.Button, { onClick: handleConfigure, disabled: configureMutation.isPending }, configureMutation.isPending ? "Configuring..." : "Configure"))))),
                React.createElement(tabs_1.TabsContent, { value: "configured", className: "mt-4" }, isLoading ? (React.createElement("div", { className: "text-center py-12 text-muted-foreground" }, "Loading integrations...")) : integrations.length === 0 ? (React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardContent, { className: "py-12 text-center" },
                        React.createElement(lucide_react_1.Plug, { className: "h-12 w-12 mx-auto text-muted-foreground/30 mb-3" }),
                        React.createElement("p", { className: "text-muted-foreground" }, "No integrations configured yet"),
                        React.createElement(button_1.Button, { className: "mt-4", onClick: function () { return setIsAddOpen(true); } },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                            " Add Your First Integration")))) : (React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" }, integrations.map(function (integration) { return (React.createElement(card_1.Card, { key: integration.id, className: utils_1.cn(integration.status !== "active" && "opacity-60") },
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement("div", { className: "flex items-start justify-between" },
                            React.createElement("div", { className: "flex items-center gap-3" },
                                React.createElement("div", { className: "p-2 bg-primary/10 rounded-lg" },
                                    React.createElement(lucide_react_1.Plug, { className: "h-5 w-5 text-primary" })),
                                React.createElement("div", null,
                                    React.createElement(card_1.CardTitle, { className: "text-base capitalize" }, integration.provider),
                                    React.createElement(card_1.CardDescription, { className: "capitalize" }, integration.integrationType))),
                            React.createElement(badge_1.Badge, { variant: integration.status === "active" ? "default" : "secondary" }, integration.status))),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "flex items-center gap-2 flex-wrap" },
                            React.createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { return testMutation.mutate({ integrationId: integration.id }); }, disabled: testMutation.isPending },
                                React.createElement(lucide_react_1.TestTube, { className: "h-3 w-3 mr-1" }),
                                " Test"),
                            integration.status === "active" ? (React.createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { return disableMutation.mutate({ integrationId: integration.id }); } },
                                React.createElement(lucide_react_1.PowerOff, { className: "h-3 w-3 mr-1" }),
                                " Disable")) : null,
                            React.createElement(button_1.Button, { size: "sm", variant: "destructive", onClick: function () { return deleteMutation.mutate({ integrationId: integration.id }); } },
                                React.createElement(lucide_react_1.Trash2, { className: "h-3 w-3 mr-1" }),
                                " Delete")),
                        integration.lastSyncAt && (React.createElement("p", { className: "text-xs text-muted-foreground mt-3" },
                            "Last tested: ",
                            new Date(integration.lastSyncAt).toLocaleString()))))); })))),
                React.createElement(tabs_1.TabsContent, { value: "available", className: "mt-4" },
                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" }, POPULAR_PROVIDERS.map(function (p) {
                        var Icon = p.icon;
                        var isConfigured = integrations.some(function (i) { return i.provider === p.provider; });
                        return (React.createElement(card_1.Card, { key: p.provider, className: "hover:shadow-md transition-shadow" },
                            React.createElement(card_1.CardContent, { className: "p-5" },
                                React.createElement("div", { className: "flex items-center gap-3 mb-3" },
                                    React.createElement("div", { className: utils_1.cn("p-2 rounded-lg text-white", p.color) },
                                        React.createElement(Icon, { className: "h-5 w-5" })),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "font-semibold" }, p.name),
                                        React.createElement("p", { className: "text-xs text-muted-foreground capitalize" }, p.type))),
                                isConfigured ? (React.createElement(badge_1.Badge, { variant: "secondary" }, "Already configured")) : (React.createElement(button_1.Button, { size: "sm", variant: "outline", className: "w-full", onClick: function () {
                                        setProvider(p.provider);
                                        setIntegrationType(p.type);
                                        if (p.provider === "smtp") {
                                            setSmtpSecure("tls");
                                            setSmtpPort("587");
                                        }
                                        setIsAddOpen(true);
                                    } },
                                    React.createElement(lucide_react_1.Plus, { className: "h-3 w-3 mr-1" }),
                                    " Configure")))));
                    })))))));
}
exports["default"] = Integrations;
