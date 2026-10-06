"use strict";
exports.__esModule = true;
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
/**
 * SMS Queue Admin page.
 * The smsQueue router currently provides the queueSms mutation (outbound sending).
 * This page serves as the admin view for SMS activity and a gateway for future
 * queue/status procedures.
 */
function SmsQueueAdmin() {
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "SMS Queue", description: "Monitor outgoing SMS delivery and manage the SMS queue", icon: React.createElement(lucide_react_1.MessageSquare, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Admin", href: "/admin" },
            { label: "SMS Queue" },
        ], actions: React.createElement(badge_1.Badge, { variant: "secondary" }, "Admin Only") },
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "pt-6" },
                    React.createElement("p", { className: "text-xs text-muted-foreground" }, "Provider"),
                    React.createElement("p", { className: "text-lg font-semibold mt-1" }, "Africa's Talking / Custom"))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "pt-6" },
                    React.createElement("p", { className: "text-xs text-muted-foreground" }, "Max Message Length"),
                    React.createElement("p", { className: "text-lg font-semibold mt-1" }, "160 characters"))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "pt-6" },
                    React.createElement("p", { className: "text-xs text-muted-foreground" }, "Phone Format"),
                    React.createElement("p", { className: "text-lg font-semibold mt-1" }, "Kenyan (+254)")))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                    React.createElement(lucide_react_1.Info, { className: "h-5 w-5" }),
                    "SMS Queue Status")),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "rounded-md bg-muted/50 p-4 text-sm text-muted-foreground space-y-2" },
                    React.createElement("p", null, "The SMS queue system handles outbound notifications for invoices, receipts, payments, quotes, and tickets."),
                    React.createElement("p", null,
                        "Detailed queue history and delivery reports will be available here once the backend ",
                        React.createElement("code", { className: "font-mono text-xs" }, "smsQueue.getQueue"),
                        " procedure is added to the SMS router."),
                    React.createElement("p", null, "To send an SMS manually, use the Communications module or trigger from an applicable record (invoice, payment, etc.)."))))));
}
exports["default"] = SmsQueueAdmin;
