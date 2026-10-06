"use strict";
exports.__esModule = true;
var lucide_react_1 = require("lucide-react");
var lucide_react_2 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var ModuleLayout_1 = require("@/components/ModuleLayout");
function Webhooks() {
    var _a;
    var _b = trpc_1.trpc.developerTools.listWebhooks.useQuery({ limit: 50 }), webhookData = _b.data, isLoading = _b.isLoading, refetch = _b.refetch;
    var manage = trpc_1.trpc.developerTools.manageWebhooks.useMutation({ onSuccess: function () { sonner_1.toast.success("Webhook updated"); refetch(); } });
    if (isLoading)
        return React.createElement("div", { className: "flex items-center justify-center min-h-screen" },
            React.createElement(lucide_react_1.Loader2, { className: "w-8 h-8 animate-spin text-rose-600" }));
    var wh = webhookData ? JSON.parse(JSON.stringify(webhookData)) : { webhooks: [], total: 0 };
    var active = wh.webhooks.filter(function (w) { return w.isActive; });
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Webhooks", icon: React.createElement(lucide_react_2.Webhook, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Settings" }, { label: "Webhooks" }] },
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" }, [
            { label: "Total Webhooks", value: String((_a = wh.total) !== null && _a !== void 0 ? _a : 0), icon: lucide_react_1.Bell },
            { label: "Active", value: String(active.length), icon: lucide_react_1.CheckCircle },
            { label: "Inactive", value: String(wh.webhooks.length - active.length), icon: lucide_react_1.Bell },
            { label: "Total Registered", value: String(wh.webhooks.length), icon: lucide_react_2.Webhook },
        ].map(function (card, idx) { return (React.createElement("div", { key: idx, className: "bg-white p-6 rounded-lg border-2 border-rose-200 shadow-md" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", null,
                    React.createElement("p", { className: "text-gray-600 text-sm font-semibold" }, card.label),
                    React.createElement("p", { className: "text-3xl font-bold text-gray-900 mt-2" }, card.value)),
                React.createElement(card.icon, { className: "w-10 h-10 text-rose-600 opacity-20" })))); })),
        React.createElement("div", { className: "bg-white p-6 rounded-lg border-2 border-rose-200 shadow-md" },
            React.createElement("h2", { className: "text-xl font-bold text-gray-900 mb-4" }, "Registered Webhooks"),
            wh.webhooks.length === 0 ? (React.createElement("p", { className: "text-gray-500 text-center py-8" }, "No webhooks configured.")) : (React.createElement("div", { className: "space-y-2" }, wh.webhooks.map(function (hook, idx) {
                var _a, _b, _c, _d;
                return (React.createElement("div", { key: (_a = hook.id) !== null && _a !== void 0 ? _a : idx, className: "p-3 bg-gray-50 rounded border-l-4 border-rose-500" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "font-semibold text-gray-900 text-sm" }, (_d = (_c = (_b = hook.events) === null || _b === void 0 ? void 0 : _b.join(", ")) !== null && _c !== void 0 ? _c : hook.url) !== null && _d !== void 0 ? _d : "Webhook"),
                            React.createElement("p", { className: "text-xs text-gray-600 font-mono" }, hook.url)),
                        React.createElement("span", { className: "text-xs px-2 py-1 rounded " + (hook.isActive ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700") }, hook.isActive ? "active" : "paused"))));
            }))))));
}
exports["default"] = Webhooks;
