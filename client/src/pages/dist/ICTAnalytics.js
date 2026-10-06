"use strict";
exports.__esModule = true;
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var ANALYTICS_ITEMS = [
    {
        title: "System Health Overview",
        description: "Monitor real-time health metrics and uptime trends.",
        href: "/system-health",
        icon: React.createElement(lucide_react_1.Activity, { className: "h-5 w-5" })
    },
    {
        title: "Performance Metrics",
        description: "Review CPU, memory, and storage performance statistics.",
        href: "/system-health",
        icon: React.createElement(lucide_react_1.TrendingUp, { className: "h-5 w-5" })
    },
    {
        title: "Security Events",
        description: "Inspect recent security events and audit trails.",
        href: "/security",
        icon: React.createElement(lucide_react_1.Shield, { className: "h-5 w-5" })
    },
];
function ICTAnalytics() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "ICT Analytics", description: "Analytics, logs, and performance insights for ICT operations", icon: React.createElement(lucide_react_1.BarChart3, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "ICT", href: "/crm/ict" },
            { label: "Analytics" },
        ], actions: (React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return navigate("/crm/ict"); } }, "Back to ICT")) },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid gap-4 md:grid-cols-3" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "text-base" }, "Total Requests")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("p", { className: "text-3xl font-semibold" }, "24.5k"),
                        React.createElement("p", { className: "text-sm text-muted-foreground" }, "Requests last 30 days"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "text-base" }, "Average Response")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("p", { className: "text-3xl font-semibold" }, "185 ms"),
                        React.createElement("p", { className: "text-sm text-muted-foreground" }, "Average latency across services"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "text-base" }, "Incident Score")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("p", { className: "text-3xl font-semibold" }, "92%"),
                        React.createElement("p", { className: "text-sm text-muted-foreground" }, "Lower is better for incident risk")))),
            React.createElement("div", { className: "grid gap-4 md:grid-cols-3" }, ANALYTICS_ITEMS.map(function (item) { return (React.createElement(card_1.Card, { key: item.title, className: "cursor-pointer border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all", onClick: function () { return navigate(item.href); } },
                React.createElement(card_1.CardHeader, null,
                    React.createElement("div", { className: "flex items-center justify-between gap-4" },
                        React.createElement("div", { className: "rounded-lg bg-slate-100 dark:bg-slate-800 p-3 text-slate-700 dark:text-slate-200" }, item.icon),
                        React.createElement(button_1.Button, { variant: "ghost", className: "text-sm" }, "Open")),
                    React.createElement(card_1.CardTitle, { className: "mt-4 text-base" }, item.title),
                    React.createElement(card_1.CardDescription, null, item.description)))); })),
            React.createElement("div", { className: "rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-sm text-muted-foreground" },
                React.createElement("p", { className: "font-semibold" }, "Note"),
                React.createElement("p", { className: "mt-2" }, "This page provides a central entry point for ICT analytics. More detailed reporting and dashboard integration will appear here as the ICT experience matures.")))));
}
exports["default"] = ICTAnalytics;
