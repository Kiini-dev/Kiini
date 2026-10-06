"use strict";
exports.__esModule = true;
var react_query_1 = require("@tanstack/react-query");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var table_1 = require("@/components/ui/table");
var lucide_react_1 = require("lucide-react");
function EmailQueueAdmin() {
    var _a;
    var queryClient = react_query_1.useQueryClient();
    var _b = trpc_1.trpc.emailQueue.getStatus.useQuery(undefined, {
        refetchInterval: 30000
    }), status = _b.data, statusLoading = _b.isLoading;
    var _c = trpc_1.trpc.emailQueue.getQueue.useQuery({}, {
        refetchInterval: 30000
    }), queueData = _c.data, queueLoading = _c.isLoading, refetch = _c.refetch;
    var processQueueMutation = trpc_1.trpc.emailQueue.processQueue.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Queue processing triggered — pending emails are being sent.");
            queryClient.invalidateQueries();
        },
        onError: function (err) {
            sonner_1.toast.error(err.message);
        }
    });
    var retryMutation = trpc_1.trpc.emailQueue.retryEmail.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Email has been queued for retry.");
            void refetch();
        },
        onError: function (err) {
            sonner_1.toast.error(err.message);
        }
    });
    var statusColor = function (s) {
        if (s === "sent" || s === "delivered")
            return "default";
        if (s === "failed" || s === "error")
            return "destructive";
        return "secondary";
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Email Queue", description: "Monitor and manage outgoing email delivery", icon: React.createElement(lucide_react_1.Mail, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Admin", href: "/admin" },
            { label: "Email Queue" },
        ], actions: React.createElement("div", { className: "flex gap-2" },
            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return refetch(); } },
                React.createElement(lucide_react_1.RefreshCw, { className: "h-4 w-4 mr-2" }),
                "Refresh"),
            React.createElement(button_1.Button, { size: "sm", onClick: function () { return processQueueMutation.mutate(); }, disabled: processQueueMutation.isPending },
                processQueueMutation.isPending ? (React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" })) : (React.createElement(lucide_react_1.Play, { className: "h-4 w-4 mr-2" })),
                "Process Queue")) },
        !statusLoading && status && (React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4" }, Object.entries(status).map(function (_a) {
            var key = _a[0], val = _a[1];
            return (React.createElement(card_1.Card, { key: key },
                React.createElement(card_1.CardContent, { className: "pt-4" },
                    React.createElement("p", { className: "text-xs text-muted-foreground capitalize" }, key.replace(/_/g, " ")),
                    React.createElement("p", { className: "text-2xl font-bold" }, val))));
        }))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Email Queue")),
            React.createElement(card_1.CardContent, null, queueLoading ? (React.createElement("div", { className: "flex justify-center py-8" },
                React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin" }))) : !((_a = queueData === null || queueData === void 0 ? void 0 : queueData.entries) === null || _a === void 0 ? void 0 : _a.length) ? (React.createElement("p", { className: "text-center text-muted-foreground py-8" }, "No emails in queue")) : (React.createElement(table_1.Table, null,
                React.createElement(table_1.TableHeader, null,
                    React.createElement(table_1.TableRow, null,
                        React.createElement(table_1.TableHead, null, "Recipient"),
                        React.createElement(table_1.TableHead, null, "Subject"),
                        React.createElement(table_1.TableHead, null, "Type"),
                        React.createElement(table_1.TableHead, null, "Status"),
                        React.createElement(table_1.TableHead, null, "Created"),
                        React.createElement(table_1.TableHead, null))),
                React.createElement(table_1.TableBody, null, queueData.entries.map(function (email) { return (React.createElement(table_1.TableRow, { key: email.id },
                    React.createElement(table_1.TableCell, { className: "font-medium" }, email.recipientEmail),
                    React.createElement(table_1.TableCell, null, email.subject),
                    React.createElement(table_1.TableCell, null, email.eventType || "—"),
                    React.createElement(table_1.TableCell, null,
                        React.createElement(badge_1.Badge, { variant: statusColor(email.status) }, email.status)),
                    React.createElement(table_1.TableCell, { className: "text-sm text-muted-foreground" }, email.createdAt ? new Date(email.createdAt).toLocaleString() : "—"),
                    React.createElement(table_1.TableCell, null, (email.status === "failed" || email.status === "error") && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return retryMutation.mutate({ emailId: email.id }); }, disabled: retryMutation.isPending }, "Retry"))))); }))))))));
}
exports["default"] = EmailQueueAdmin;
