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
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var trpc_1 = require("@/lib/trpc");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var switch_1 = require("@/components/ui/switch");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var select_1 = require("@/components/ui/select");
var badge_1 = require("@/components/ui/badge");
var TIER_ORDER = ["free", "trial", "starter", "gold", "professional", "enterprise", "custom"];
var TIER_COLORS = {
    free: "secondary",
    trial: "outline",
    starter: "default",
    gold: "default",
    professional: "default",
    enterprise: "default",
    custom: "outline"
};
function ApiRateLimiting() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    var _l = permissions_1.useRequireRole(["ict_manager", "super_admin"]), allowed = _l.allowed, authLoading = _l.isLoading;
    var utils = trpc_1.trpc.useUtils();
    var _m = trpc_1.trpc.ictManagement.getRateLimitConfig.useQuery(undefined, {
        enabled: allowed
    }), config = _m.data, configLoading = _m.isLoading;
    var stats = trpc_1.trpc.ictManagement.getRateLimitStats.useQuery(undefined, {
        enabled: allowed,
        refetchInterval: 15000
    }).data;
    var tierData = trpc_1.trpc.ictManagement.getTierRateLimits.useQuery(undefined, {
        enabled: allowed
    }).data;
    var _o = react_1.useState(null), formData = _o[0], setFormData = _o[1];
    // Per-tier override edit state: tier -> input string
    var _p = react_1.useState({}), tierEdits = _p[0], setTierEdits = _p[1];
    var form = formData !== null && formData !== void 0 ? formData : {
        globalRateLimit: (_a = config === null || config === void 0 ? void 0 : config.globalRateLimit) !== null && _a !== void 0 ? _a : 5000,
        perUserRateLimit: (_b = config === null || config === void 0 ? void 0 : config.perUserRateLimit) !== null && _b !== void 0 ? _b : 60,
        burstLimit: (_c = config === null || config === void 0 ? void 0 : config.burstLimit) !== null && _c !== void 0 ? _c : 100,
        windowMs: (_d = config === null || config === void 0 ? void 0 : config.windowMs) !== null && _d !== void 0 ? _d : 900000,
        enabled: (_e = config === null || config === void 0 ? void 0 : config.enabled) !== null && _e !== void 0 ? _e : true,
        whitelistedIPs: ((_f = config === null || config === void 0 ? void 0 : config.whitelistedIPs) !== null && _f !== void 0 ? _f : []).join(", ")
    };
    var updateMutation = trpc_1.trpc.ictManagement.updateRateLimitConfig.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Rate limit configuration updated and live");
            utils.ictManagement.getRateLimitConfig.invalidate();
            setFormData(null);
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to update: " + error.message);
        }
    });
    var updateTierMutation = trpc_1.trpc.ictManagement.updateTierRateLimit.useMutation({
        onSuccess: function (data) {
            sonner_1.toast.success(data.tier + " tier limit updated to " + data.effectiveLimit.toLocaleString() + " req/window");
            utils.ictManagement.getTierRateLimits.invalidate();
            setTierEdits(function (prev) { var n = __assign({}, prev); delete n[data.tier]; return n; });
        },
        onError: function (error) { return sonner_1.toast.error("Failed: " + error.message); }
    });
    var handleSave = function () {
        var ips = form.whitelistedIPs
            .split(",")
            .map(function (ip) { return ip.trim(); })
            .filter(Boolean);
        updateMutation.mutate({
            globalRateLimit: form.globalRateLimit,
            perUserRateLimit: form.perUserRateLimit,
            burstLimit: form.burstLimit,
            windowMs: form.windowMs,
            enabled: form.enabled,
            whitelistedIPs: ips
        });
    };
    var handleReset = function () {
        setFormData(null);
        sonner_1.toast.info("Form reset to current settings");
    };
    var handleTierSave = function (tier) {
        var val = tierEdits[tier];
        var num = val === "" || val === undefined ? null : Number(val);
        updateTierMutation.mutate({ tier: tier, requestsPerWindow: num });
    };
    var handleTierReset = function (tier) {
        updateTierMutation.mutate({ tier: tier, requestsPerWindow: null });
    };
    var setField = function (key, value) {
        var _a;
        setFormData(__assign(__assign({}, form), (_a = {}, _a[key] = value, _a)));
    };
    if (authLoading || configLoading) {
        return (React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" })));
    }
    if (!allowed)
        return null;
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "API Rate Limiting", description: "Configure API rate limits to control how users call the API", icon: React.createElement(lucide_react_1.Gauge, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "ICT", href: "/ict" },
            { label: "API Rate Limiting" },
        ], actions: React.createElement(React.Fragment, null,
            React.createElement(button_1.Button, { variant: "outline", onClick: handleReset, disabled: !formData },
                React.createElement(lucide_react_1.RotateCcw, { className: "h-4 w-4 mr-2" }),
                "Reset"),
            React.createElement(button_1.Button, { onClick: handleSave, disabled: updateMutation.isPending },
                React.createElement(lucide_react_1.Save, { className: "h-4 w-4 mr-2" }),
                "Save Changes")) },
        React.createElement("div", { className: "grid gap-6 md:grid-cols-2" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Shield, { className: "h-5 w-5" }),
                        "Global Configuration"),
                    React.createElement(card_1.CardDescription, null, "Configure system-wide API rate limiting rules. Changes take effect immediately.")),
                React.createElement(card_1.CardContent, { className: "space-y-4" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("div", null,
                            React.createElement(label_1.Label, null, "Rate Limiting Enabled"),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Toggle global rate limiting on/off")),
                        React.createElement(switch_1.Switch, { checked: form.enabled, onCheckedChange: function (v) { return setField("enabled", v); } })),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Global Requests per Window"),
                        React.createElement(input_1.Input, { type: "number", value: form.globalRateLimit, onChange: function (e) { return setField("globalRateLimit", Number(e.target.value)); }, min: 10, max: 100000, step: 100 }),
                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "IP-level ceiling \u2014 protects against brute-force from a single address")),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Per-User Requests per Minute"),
                        React.createElement(input_1.Input, { type: "number", value: form.perUserRateLimit, onChange: function (e) { return setField("perUserRateLimit", Number(e.target.value)); }, min: 5, max: 10000, step: 5 }),
                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "Informational \u2014 tier limits below govern actual per-org enforcement")),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Burst Limit"),
                        React.createElement(input_1.Input, { type: "number", value: form.burstLimit, onChange: function (e) { return setField("burstLimit", Number(e.target.value)); }, min: 5, max: 1000, step: 5 })),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Rate Limit Window"),
                        React.createElement(select_1.Select, { value: String(form.windowMs), onValueChange: function (v) { return setField("windowMs", Number(v)); } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "30000" }, "30 seconds"),
                                React.createElement(select_1.SelectItem, { value: "60000" }, "1 minute"),
                                React.createElement(select_1.SelectItem, { value: "300000" }, "5 minutes"),
                                React.createElement(select_1.SelectItem, { value: "900000" }, "15 minutes"),
                                React.createElement(select_1.SelectItem, { value: "3600000" }, "1 hour"))),
                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "Time window for counting requests (applies to both limiters)")))),
            React.createElement("div", { className: "space-y-6" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "IP Whitelist"),
                        React.createElement(card_1.CardDescription, null, "IPs exempt from rate limiting (comma-separated)")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement(input_1.Input, { value: form.whitelistedIPs, onChange: function (e) { return setField("whitelistedIPs", e.target.value); }, placeholder: "e.g. 127.0.0.1, 192.168.1.0" }),
                        React.createElement("p", { className: "text-xs text-muted-foreground mt-2" }, "Requests from these IPs bypass both the global and tier limiters"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Live Statistics"),
                        React.createElement(card_1.CardDescription, null, "Real-time API usage (refreshes every 15 s)")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                            React.createElement("div", { className: "p-3 rounded-lg bg-muted/50 text-center" },
                                React.createElement("div", { className: "text-2xl font-bold" }, (_g = stats === null || stats === void 0 ? void 0 : stats.totalRequestsLastMinute) !== null && _g !== void 0 ? _g : 0),
                                React.createElement("div", { className: "text-xs text-muted-foreground" }, "Req / window")),
                            React.createElement("div", { className: "p-3 rounded-lg bg-muted/50 text-center" },
                                React.createElement("div", { className: "text-2xl font-bold" }, (_h = stats === null || stats === void 0 ? void 0 : stats.totalTrackedUsers) !== null && _h !== void 0 ? _h : 0),
                                React.createElement("div", { className: "text-xs text-muted-foreground" }, "Tracked orgs")),
                            React.createElement("div", { className: "p-3 rounded-lg bg-muted/50 text-center" },
                                React.createElement("div", { className: "text-2xl font-bold text-destructive" }, (_j = stats === null || stats === void 0 ? void 0 : stats.blockedRequests) !== null && _j !== void 0 ? _j : 0),
                                React.createElement("div", { className: "text-xs text-muted-foreground" }, "Blocked")),
                            React.createElement("div", { className: "p-3 rounded-lg bg-muted/50 text-center" },
                                React.createElement("div", { className: "text-2xl font-bold " + (form.enabled ? "text-green-500" : "text-muted-foreground") }, form.enabled ? "ON" : "OFF"),
                                React.createElement("div", { className: "text-xs text-muted-foreground" }, "Status"))))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Current Limits Summary")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "space-y-2 text-sm" },
                            React.createElement("div", { className: "flex justify-between" },
                                React.createElement("span", { className: "text-muted-foreground" }, "Global IP limit"),
                                React.createElement("span", { className: "font-medium" },
                                    form.globalRateLimit.toLocaleString(),
                                    " req / window")),
                            React.createElement("div", { className: "flex justify-between" },
                                React.createElement("span", { className: "text-muted-foreground" }, "Window"),
                                React.createElement("span", { className: "font-medium" },
                                    form.windowMs / 1000,
                                    "s")),
                            React.createElement("div", { className: "flex justify-between" },
                                React.createElement("span", { className: "text-muted-foreground" }, "Whitelisted IPs"),
                                React.createElement("span", { className: "font-medium" }, form.whitelistedIPs.split(",").filter(function (s) { return s.trim(); }).length || 0))))))),
        React.createElement(card_1.Card, { className: "mt-6" },
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                    React.createElement(lucide_react_1.Layers, { className: "h-5 w-5" }),
                    "Subscription Tier Limits"),
                React.createElement(card_1.CardDescription, null, "Per-organisation quotas enforced by the tier-aware middleware. Override individual tiers or leave blank to use the platform default. Changes apply immediately (cached entries are flushed on save).")),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" }, ((_k = tierData === null || tierData === void 0 ? void 0 : tierData.tiers) !== null && _k !== void 0 ? _k : []).map(function (t) {
                    var _a;
                    var tier = t.tier;
                    var isEditing = tier in tierEdits;
                    var editVal = (_a = tierEdits[tier]) !== null && _a !== void 0 ? _a : "";
                    return (React.createElement("div", { key: tier, className: "border rounded-lg p-4 space-y-3" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("span", { className: "font-semibold capitalize" }, t.label),
                            React.createElement("div", { className: "flex items-center gap-1" }, t.overridden && (React.createElement(badge_1.Badge, { variant: "outline", className: "text-xs" }, "overridden")))),
                        React.createElement("div", { className: "space-y-1" },
                            React.createElement("div", { className: "text-xs text-muted-foreground" }, "Default"),
                            React.createElement("div", { className: "font-mono text-sm" },
                                t.defaultLimit.toLocaleString(),
                                " req / ",
                                t.windowMs / 60000,
                                " min")),
                        React.createElement("div", { className: "space-y-1" },
                            React.createElement("div", { className: "text-xs text-muted-foreground" }, "Effective"),
                            React.createElement("div", { className: "font-mono font-semibold text-sm " + (t.overridden ? "text-primary" : "") },
                                t.effectiveLimit.toLocaleString(),
                                " req / window")),
                        React.createElement("div", { className: "space-y-1" },
                            React.createElement(label_1.Label, { className: "text-xs" }, "Override (leave blank to use default)"),
                            React.createElement(input_1.Input, { type: "number", placeholder: String(t.defaultLimit), value: isEditing ? editVal : (t.overridden ? String(t.effectiveLimit) : ""), onChange: function (e) { return setTierEdits(function (prev) {
                                    var _a;
                                    return (__assign(__assign({}, prev), (_a = {}, _a[tier] = e.target.value, _a)));
                                }); }, min: 50, max: 100000, step: 100, className: "h-8 text-sm" })),
                        React.createElement("div", { className: "flex gap-2" },
                            React.createElement(button_1.Button, { size: "sm", variant: "default", className: "flex-1 h-7 text-xs", disabled: !isEditing || updateTierMutation.isPending, onClick: function () { return handleTierSave(tier); } },
                                React.createElement(lucide_react_1.Save, { className: "h-3 w-3 mr-1" }),
                                "Apply"),
                            t.overridden && (React.createElement(button_1.Button, { size: "sm", variant: "outline", className: "h-7 text-xs", disabled: updateTierMutation.isPending, onClick: function () { return handleTierReset(tier); }, title: "Reset to platform default" },
                                React.createElement(lucide_react_1.RotateCw, { className: "h-3 w-3" }))))));
                }))))));
}
exports["default"] = ApiRateLimiting;
