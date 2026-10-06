"use strict";
exports.__esModule = true;
var react_1 = require("react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var stats_card_1 = require("@/components/ui/stats-card");
var statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    sent: "bg-green-100 text-green-800",
    delivered: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    queued: "bg-blue-100 text-blue-800"
};
function SmsQueue() {
    var _a, _b, _c, _d, _e;
    var _f = react_1.useState(""), search = _f[0], setSearch = _f[1];
    var statsQuery = trpc_1.trpc.smsQueue.getQueueStats.useQuery(undefined, { retry: false });
    var retrySms = trpc_1.trpc.smsQueue.retrySms.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("SMS queued for retry");
            statsQuery.refetch();
        },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var stats = statsQuery.data;
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "SMS Queue", description: "Monitor and manage outgoing SMS delivery", icon: React.createElement(lucide_react_1.MessageSquare, { className: "h-6 w-6" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Admin" }, { label: "SMS Queue" }], actions: React.createElement(button_1.Button, { variant: "outline", onClick: function () { return statsQuery.refetch(); } },
            React.createElement(lucide_react_1.RefreshCw, { className: "mr-2 h-4 w-4" }),
            " Refresh") },
        React.createElement("div", { className: "space-y-6" },
            stats && (React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Pending", value: (_a = stats.pending) !== null && _a !== void 0 ? _a : 0, color: "border-l-orange-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Sent", value: (_c = (_b = stats.sent) !== null && _b !== void 0 ? _b : stats.delivered) !== null && _c !== void 0 ? _c : 0, color: "border-l-purple-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Failed", value: (_d = stats.failed) !== null && _d !== void 0 ? _d : 0, color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Total", value: (_e = stats.total) !== null && _e !== void 0 ? _e : 0, color: "border-l-blue-500" }))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "py-16 text-center text-muted-foreground" },
                    React.createElement(lucide_react_1.MessageSquare, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }),
                    React.createElement("h3", { className: "text-lg font-medium mb-2" }, "SMS Queue Management"),
                    React.createElement("p", null, "View delivery status and manage outgoing SMS messages from the statistics above. Failed messages can be retried from the delivery history."))))));
}
exports["default"] = SmsQueue;
