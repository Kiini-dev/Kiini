"use strict";
exports.__esModule = true;
var react_1 = require("react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var badge_1 = require("@/components/ui/badge");
var spinner_1 = require("@/components/ui/spinner");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var table_1 = require("@/components/ui/table");
var stats_card_1 = require("@/components/ui/stats-card");
var statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    sent: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    queued: "bg-blue-100 text-blue-800"
};
var statusIcons = {
    pending: lucide_react_1.Clock,
    sent: lucide_react_1.CheckCircle,
    failed: lucide_react_1.XCircle,
    queued: lucide_react_1.AlertTriangle
};
function EmailQueue() {
    var _a, _b, _c, _d, _e, _f, _g;
    var _h = react_1.useState(""), search = _h[0], setSearch = _h[1];
    var queueQuery = trpc_1.trpc.emailQueue.getQueue.useQuery({ limit: 50 }, { retry: false, refetchInterval: 30000 });
    var statsQuery = trpc_1.trpc.emailQueue.getStatus.useQuery(undefined, { retry: false });
    var processQueue = trpc_1.trpc.emailQueue.processQueue.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Queue processing started");
            queueQuery.refetch();
            statsQuery.refetch();
        },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var retryEmail = trpc_1.trpc.emailQueue.retryEmail.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Email queued for retry");
            queueQuery.refetch();
        },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var stats = statsQuery.data;
    var emails = ((_a = queueQuery.data) === null || _a === void 0 ? void 0 : _a.items) || queueQuery.data || [];
    var filteredEmails = Array.isArray(emails)
        ? emails.filter(function (e) { var _a, _b; return !search || ((_a = e.to) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(search.toLowerCase())) || ((_b = e.subject) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(search.toLowerCase())); })
        : [];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Email Queue", description: "Monitor and manage outgoing email delivery", icon: React.createElement(lucide_react_1.Mail, { className: "h-6 w-6" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Admin" }, { label: "Email Queue" }], actions: React.createElement(button_1.Button, { onClick: function () { return processQueue.mutate(); }, disabled: processQueue.isLoading },
            React.createElement(lucide_react_1.RefreshCw, { className: "mr-2 h-4 w-4 " + (processQueue.isLoading ? "animate-spin" : "") }),
            " Process Queue") },
        React.createElement("div", { className: "space-y-6" },
            stats && (React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Pending", value: (_c = (_b = stats.pending) !== null && _b !== void 0 ? _b : stats.queued) !== null && _c !== void 0 ? _c : 0, color: "border-l-orange-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Sent", value: (_e = (_d = stats.sent) !== null && _d !== void 0 ? _d : stats.delivered) !== null && _e !== void 0 ? _e : 0, color: "border-l-purple-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Failed", value: (_f = stats.failed) !== null && _f !== void 0 ? _f : 0, color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Total", value: (_g = stats.total) !== null && _g !== void 0 ? _g : 0, color: "border-l-blue-500" }))),
            React.createElement("div", { className: "relative max-w-md" },
                React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                React.createElement(input_1.Input, { placeholder: "Search by recipient or subject\u2026", value: search, onChange: function (e) { return setSearch(e.target.value); }, className: "pl-10" })),
            queueQuery.isLoading ? (React.createElement("div", { className: "flex justify-center py-20" },
                React.createElement(spinner_1.Spinner, null))) : filteredEmails.length === 0 ? (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "py-16 text-center text-muted-foreground" }, "No emails in queue."))) : (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "p-0" },
                    React.createElement("div", { className: "overflow-x-auto" },
                        React.createElement(table_1.Table, null,
                            React.createElement(table_1.TableHeader, null,
                                React.createElement(table_1.TableRow, null,
                                    React.createElement(table_1.TableHead, null, "Recipient"),
                                    React.createElement(table_1.TableHead, null, "Subject"),
                                    React.createElement(table_1.TableHead, null, "Status"),
                                    React.createElement(table_1.TableHead, null, "Created"),
                                    React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                            React.createElement(table_1.TableBody, null, filteredEmails.map(function (email) {
                                var Icon = statusIcons[email.status] || lucide_react_1.Clock;
                                return (React.createElement(table_1.TableRow, { key: email.id },
                                    React.createElement(table_1.TableCell, null, email.to || email.recipient),
                                    React.createElement(table_1.TableCell, null, email.subject),
                                    React.createElement(table_1.TableCell, null,
                                        React.createElement(badge_1.Badge, { className: statusColors[email.status] || "bg-gray-100 text-gray-800" },
                                            React.createElement(Icon, { className: "h-3 w-3 mr-1" }),
                                            " ",
                                            email.status)),
                                    React.createElement(table_1.TableCell, { className: "text-muted-foreground" }, email.createdAt ? new Date(email.createdAt).toLocaleString() : "—"),
                                    React.createElement(table_1.TableCell, { className: "text-right" }, email.status === "failed" && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return retryEmail.mutate({ emailId: email.id }); } },
                                        React.createElement(lucide_react_1.RotateCcw, { className: "h-4 w-4 mr-1" }),
                                        " Retry")))));
                            }))))))))));
}
exports["default"] = EmailQueue;
