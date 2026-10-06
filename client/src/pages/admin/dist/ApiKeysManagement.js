"use strict";
exports.__esModule = true;
var react_1 = require("react");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var badge_1 = require("@/components/ui/badge");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var stats_card_1 = require("@/components/ui/stats-card");
var use_toast_1 = require("@/components/ui/use-toast");
var dialog_1 = require("@/components/ui/dialog");
var label_1 = require("@/components/ui/label");
function ApiKeysManagement() {
    var _a, _b;
    var _c = permissions_1.useRequireRole(["ict_manager", "super_admin"]), allowed = _c.allowed, roleLoading = _c.isLoading;
    var toast = use_toast_1.useToast().toast;
    var _d = react_1.useState(false), createOpen = _d[0], setCreateOpen = _d[1];
    var _e = react_1.useState(""), keyName = _e[0], setKeyName = _e[1];
    var _f = react_1.useState(1000), rateLimit = _f[0], setRateLimit = _f[1];
    var _g = react_1.useState(null), newKey = _g[0], setNewKey = _g[1];
    var _h = react_1.useState(new Set()), revealedKeys = _h[0], setRevealedKeys = _h[1];
    var keysQ = trpc_1.trpc.ictManagement.getApiKeys.useQuery({}, { refetchInterval: 30000 });
    var createMut = trpc_1.trpc.ictManagement.createApiKey.useMutation({
        onSuccess: function (data) {
            setNewKey(data.keyValue);
            toast({ title: "API Key Created", description: "Copy it now — it won't be shown again." });
            keysQ.refetch();
        },
        onError: function (err) { return toast({ title: "Failed", description: err.message, variant: "destructive" }); }
    });
    var revokeMut = trpc_1.trpc.ictManagement.revokeApiKey.useMutation({
        onSuccess: function () {
            toast({ title: "API Key Revoked" });
            keysQ.refetch();
        },
        onError: function (err) { return toast({ title: "Failed", description: err.message, variant: "destructive" }); }
    });
    var keys = (_b = (_a = keysQ.data) === null || _a === void 0 ? void 0 : _a.keys) !== null && _b !== void 0 ? _b : [];
    var activeKeys = keys.filter(function (k) { return k.isActive === 1; });
    var revokedKeys = keys.filter(function (k) { return k.isActive === 0; });
    var handleCreate = function () {
        if (!keyName.trim())
            return;
        createMut.mutate({ keyName: keyName.trim(), rateLimit: rateLimit });
    };
    var maskKey = function (key) { return key.slice(0, 8) + "•".repeat(24) + key.slice(-4); };
    var copyToClipboard = function (text) {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied to clipboard" });
    };
    if (roleLoading)
        return React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" }));
    if (!allowed)
        return null;
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "API Keys Management", description: "Create and manage API keys for external integrations", icon: React.createElement(lucide_react_1.Key, { className: "h-5 w-5" }), breadcrumbs: [{ label: "ICT", href: "/crm/ict" }, { label: "API Keys" }] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Keys", value: keys.length, icon: React.createElement(lucide_react_1.Key, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Active", value: activeKeys.length, icon: React.createElement(lucide_react_1.CheckCircle2, { className: "h-5 w-5" }), color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Revoked", value: revokedKeys.length, icon: React.createElement(lucide_react_1.XCircle, { className: "h-5 w-5" }), color: "border-l-red-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Rate Limit", value: "1000/hr", icon: React.createElement(lucide_react_1.Shield, { className: "h-5 w-5" }), color: "border-l-purple-500" })),
            React.createElement("div", { className: "flex justify-between items-center" },
                React.createElement("h3", { className: "text-lg font-semibold" }, "API Keys"),
                React.createElement(dialog_1.Dialog, { open: createOpen, onOpenChange: function (open) { setCreateOpen(open); if (!open) {
                        setNewKey(null);
                        setKeyName("");
                    } } },
                    React.createElement(dialog_1.DialogTrigger, { asChild: true },
                        React.createElement(button_1.Button, null,
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                            "Generate New Key")),
                    React.createElement(dialog_1.DialogContent, null,
                        React.createElement(dialog_1.DialogHeader, null,
                            React.createElement(dialog_1.DialogTitle, null, newKey ? "API Key Created" : "Create API Key"),
                            React.createElement(dialog_1.DialogDescription, null, newKey ? "Copy this key now. It won't be shown again." : "Give your key a name to identify its purpose.")),
                        newKey ? (React.createElement("div", { className: "space-y-4" },
                            React.createElement("div", { className: "p-3 bg-muted rounded-md font-mono text-sm break-all" }, newKey),
                            React.createElement(button_1.Button, { onClick: function () { return copyToClipboard(newKey); }, className: "w-full" },
                                React.createElement(lucide_react_1.Copy, { className: "h-4 w-4 mr-2" }),
                                "Copy Key"))) : (React.createElement("div", { className: "space-y-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Key Name"),
                                React.createElement(input_1.Input, { value: keyName, onChange: function (e) { return setKeyName(e.target.value); }, placeholder: "e.g. Production API, Mobile App" })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Rate Limit (requests/hour)"),
                                React.createElement(input_1.Input, { type: "number", value: rateLimit, onChange: function (e) { return setRateLimit(Number(e.target.value)); } })),
                            React.createElement(dialog_1.DialogFooter, null,
                                React.createElement(button_1.Button, { onClick: handleCreate, disabled: !keyName.trim() || createMut.isPending },
                                    createMut.isPending ? React.createElement(spinner_1.Spinner, { className: "size-4 mr-2" }) : null,
                                    "Generate Key"))))))),
            keysQ.isLoading ? (React.createElement("div", { className: "flex justify-center p-8" },
                React.createElement(spinner_1.Spinner, { className: "size-8" }))) : keys.length === 0 ? (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "flex flex-col items-center justify-center py-12" },
                    React.createElement(lucide_react_1.Key, { className: "h-12 w-12 text-muted-foreground mb-4" }),
                    React.createElement("p", { className: "text-muted-foreground" }, "No API keys yet. Create one to get started.")))) : (React.createElement("div", { className: "space-y-3" }, keys.map(function (key) { return (React.createElement(card_1.Card, { key: key.id, className: key.isActive === 0 ? "opacity-60" : "" },
                React.createElement(card_1.CardContent, { className: "flex items-center justify-between py-4" },
                    React.createElement("div", { className: "flex-1 min-w-0" },
                        React.createElement("div", { className: "flex items-center gap-2 mb-1" },
                            React.createElement("span", { className: "font-medium" }, key.keyName),
                            React.createElement(badge_1.Badge, { variant: key.isActive === 1 ? "default" : "secondary" }, key.isActive === 1 ? "Active" : "Revoked")),
                        React.createElement("div", { className: "flex items-center gap-2 text-sm text-muted-foreground font-mono" },
                            revealedKeys.has(key.id) ? key.keyValue : maskKey(key.keyValue || ""),
                            React.createElement("button", { onClick: function () { return setRevealedKeys(function (prev) {
                                    var s = new Set(prev);
                                    s.has(key.id) ? s["delete"](key.id) : s.add(key.id);
                                    return s;
                                }); } }, revealedKeys.has(key.id) ? React.createElement(lucide_react_1.EyeOff, { className: "h-3 w-3" }) : React.createElement(lucide_react_1.Eye, { className: "h-3 w-3" })),
                            React.createElement("button", { onClick: function () { return copyToClipboard(key.keyValue || ""); } },
                                React.createElement(lucide_react_1.Copy, { className: "h-3 w-3" }))),
                        React.createElement("div", { className: "flex gap-4 mt-1 text-xs text-muted-foreground" },
                            React.createElement("span", { className: "flex items-center gap-1" },
                                React.createElement(lucide_react_1.Clock, { className: "h-3 w-3" }),
                                "Created: ",
                                key.createdAt ? new Date(key.createdAt).toLocaleDateString() : "—"),
                            key.lastUsedAt && React.createElement("span", null,
                                "Last used: ",
                                new Date(key.lastUsedAt).toLocaleDateString()),
                            React.createElement("span", null,
                                "Rate: ",
                                key.rateLimit || 1000,
                                "/hr"))),
                    key.isActive === 1 && (React.createElement(button_1.Button, { variant: "destructive", size: "sm", onClick: function () { return revokeMut.mutate({ keyId: key.id }); }, disabled: revokeMut.isPending },
                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4 mr-1" }),
                        "Revoke"))))); }))),
            React.createElement("div", { className: "flex justify-end" },
                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return keysQ.refetch(); } },
                    React.createElement(lucide_react_1.RefreshCw, { className: "h-4 w-4 mr-2" }),
                    "Refresh")))));
}
exports["default"] = ApiKeysManagement;
