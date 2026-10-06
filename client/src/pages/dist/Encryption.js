"use strict";
exports.__esModule = true;
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
function Encryption() {
    var _a, _b, _c;
    var eventsQuery = trpc_1.trpc.advancedSecurity.listSecurityEvents.useQuery({});
    var encryptMutation = trpc_1.trpc.advancedSecurity.encryptData.useMutation({
        onSuccess: function () { return sonner_1.toast.success("Encryption operation completed"); },
        onError: function (err) { var _a; return sonner_1.toast.error((_a = err.message) !== null && _a !== void 0 ? _a : "Encryption failed"); }
    });
    var keysMutation = trpc_1.trpc.advancedSecurity.manageEncryptionKeys.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Key operation completed");
            eventsQuery.refetch();
        },
        onError: function (err) { var _a; return sonner_1.toast.error((_a = err.message) !== null && _a !== void 0 ? _a : "Key operation failed"); }
    });
    var events = (_a = eventsQuery.data) !== null && _a !== void 0 ? _a : ((_c = (_b = eventsQuery.data) === null || _b === void 0 ? void 0 : _b.events) !== null && _c !== void 0 ? _c : []);
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Encryption", icon: React.createElement(lucide_react_1.Lock, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Security" },
            { label: "Encryption" },
        ] },
        React.createElement("div", { className: "flex justify-between items-center" },
            React.createElement("h2", { className: "text-xl font-bold text-slate-900" }, "Data Encryption Management"),
            React.createElement(button_1.Button, { onClick: function () { return encryptMutation.mutate({}); }, disabled: encryptMutation.isPending },
                encryptMutation.isPending ? React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin mr-2" }) : React.createElement(lucide_react_1.Key, { className: "h-4 w-4 mr-2" }),
                "Encrypt New Data")),
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Key Management")),
                React.createElement(card_1.CardContent, { className: "space-y-3" },
                    React.createElement(button_1.Button, { className: "w-full", onClick: function () { return keysMutation.mutate({ action: "generate" }); }, disabled: keysMutation.isPending },
                        React.createElement(lucide_react_1.Key, { className: "h-4 w-4 mr-2" }),
                        " Generate New Key"),
                    React.createElement(button_1.Button, { className: "w-full", variant: "secondary", onClick: function () { return keysMutation.mutate({ action: "rotate" }); }, disabled: keysMutation.isPending },
                        React.createElement(lucide_react_1.Shield, { className: "h-4 w-4 mr-2" }),
                        " Rotate All Keys"),
                    React.createElement(button_1.Button, { className: "w-full", variant: "outline", onClick: function () { return keysMutation.mutate({ action: "revoke" }); }, disabled: keysMutation.isPending },
                        React.createElement(lucide_react_1.AlertTriangle, { className: "h-4 w-4 mr-2" }),
                        " Revoke Keys"))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Security Events")),
                React.createElement(card_1.CardContent, null,
                    eventsQuery.isLoading && (React.createElement("div", { className: "flex justify-center py-8" },
                        React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))),
                    eventsQuery.error && (React.createElement("div", { className: "bg-red-50 text-red-700 p-4 rounded-lg" },
                        "Error: ",
                        eventsQuery.error.message)),
                    !eventsQuery.isLoading && !eventsQuery.error && events.length === 0 && (React.createElement("p", { className: "text-center text-gray-500 py-8" }, "No data found.")),
                    React.createElement("div", { className: "space-y-2" }, events.map(function (evt, idx) {
                        var _a, _b, _c, _d, _e, _f, _g, _h;
                        return (React.createElement("div", { key: (_a = evt.id) !== null && _a !== void 0 ? _a : idx, className: "p-3 border rounded-lg flex justify-between items-center" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "font-medium text-sm" }, (_d = (_c = (_b = evt.eventType) !== null && _b !== void 0 ? _b : evt.type) !== null && _c !== void 0 ? _c : evt.name) !== null && _d !== void 0 ? _d : "—"),
                                React.createElement("p", { className: "text-xs text-gray-500" }, (_f = (_e = evt.createdAt) !== null && _e !== void 0 ? _e : evt.timestamp) !== null && _f !== void 0 ? _f : "—")),
                            React.createElement(badge_1.Badge, { variant: evt.severity === "critical" ? "destructive" : "secondary" }, (_h = (_g = evt.severity) !== null && _g !== void 0 ? _g : evt.status) !== null && _h !== void 0 ? _h : "info")));
                    })))))));
}
exports["default"] = Encryption;
