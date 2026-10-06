"use strict";
exports.__esModule = true;
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var SETTINGS_ITEMS = [
    {
        title: "Network Configuration",
        description: "Set up network rules, DNS, and connectivity controls.",
        href: "/admin/maintenance",
        icon: React.createElement(lucide_react_1.Network, { className: "h-5 w-5" })
    },
    {
        title: "Integration Management",
        description: "Register and monitor third-party integrations.",
        href: "/admin/website",
        icon: React.createElement(lucide_react_1.Zap, { className: "h-5 w-5" })
    },
    {
        title: "Cron Jobs",
        description: "Review scheduled jobs and automated system tasks.",
        href: "/admin/cron-jobs",
        icon: React.createElement(lucide_react_1.HardDrive, { className: "h-5 w-5" })
    },
    {
        title: "Backup Management",
        description: "Manage backups, snapshots and recovery workflows.",
        href: "/admin/backups",
        icon: React.createElement(lucide_react_1.Server, { className: "h-5 w-5" })
    },
    {
        title: "Security Policy",
        description: "Review access controls, permissions, and audit settings.",
        href: "/security",
        icon: React.createElement(lucide_react_1.Shield, { className: "h-5 w-5" })
    },
];
function ICTSystemSettings() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "ICT System Settings", description: "Central ICT settings and system-level configuration tasks", icon: React.createElement(lucide_react_1.Server, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "ICT", href: "/crm/ict" },
            { label: "System Settings" },
        ], actions: (React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return navigate("/crm/ict"); } }, "Back to ICT")) },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3" }, SETTINGS_ITEMS.map(function (item) { return (React.createElement(card_1.Card, { key: item.title, className: "cursor-pointer border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all", onClick: function () { return navigate(item.href); } },
                React.createElement(card_1.CardHeader, null,
                    React.createElement("div", { className: "flex items-center justify-between gap-4" },
                        React.createElement("div", { className: "rounded-lg bg-slate-100 dark:bg-slate-800 p-3 text-slate-700 dark:text-slate-200" }, item.icon),
                        React.createElement(button_1.Button, { variant: "ghost", className: "text-sm" }, "Open")),
                    React.createElement(card_1.CardTitle, { className: "mt-4 text-base" }, item.title),
                    React.createElement(card_1.CardDescription, null, item.description)),
                React.createElement(card_1.CardContent, null,
                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "This space is reserved for ICT system configuration and service controls.")))); })),
            React.createElement("div", { className: "rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-sm text-muted-foreground" },
                React.createElement("p", { className: "font-semibold" }, "Note"),
                React.createElement("p", { className: "mt-2" }, "These controls are provided for ICT managers and system administrators. If you require deeper configuration, use the linked system pages.")))));
}
exports["default"] = ICTSystemSettings;
