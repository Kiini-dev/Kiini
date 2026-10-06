"use strict";
exports.__esModule = true;
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var wouter_1 = require("wouter");
var utils_1 = require("@/lib/utils");
function Sales() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var salesModules = [
        {
            title: "Estimates",
            description: "Create and manage quotations for clients",
            icon: lucide_react_1.FileText,
            href: "/estimates",
            stats: { label: "Total Estimates", value: "0" },
            borderColor: "border-l-blue-500",
            iconBg: "bg-blue-50 dark:bg-blue-950",
            iconColor: "text-blue-500"
        },
        {
            title: "Opportunities",
            description: "Track and manage sales opportunities",
            icon: lucide_react_1.Briefcase,
            href: "/opportunities",
            stats: { label: "Active Opportunities", value: "0" },
            borderColor: "border-l-purple-500",
            iconBg: "bg-purple-50 dark:bg-purple-950",
            iconColor: "text-purple-500"
        },
        {
            title: "Receipts",
            description: "Manage payment receipts and confirmations",
            icon: lucide_react_1.Receipt,
            href: "/receipts",
            stats: { label: "Total Receipts", value: "0" },
            borderColor: "border-l-green-500",
            iconBg: "bg-green-50 dark:bg-green-950",
            iconColor: "text-green-500"
        },
    ];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { breadcrumbs: [
            { label: "Dashboard", href: "/dashboard" },
            { label: "Sales", href: "/sales" },
        ], title: "Sales", description: "Manage estimates, opportunities, and receipts", icon: React.createElement(lucide_react_1.TrendingUp, { className: "w-6 h-6" }) },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "flex gap-3" },
                React.createElement(button_1.Button, { onClick: function () { return navigate("/estimates/create"); }, className: "gap-2" },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
                    "New Estimate"),
                React.createElement(button_1.Button, { onClick: function () { return navigate("/opportunities/create"); }, variant: "outline", className: "gap-2" },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
                    "New Opportunity"),
                React.createElement(button_1.Button, { onClick: function () { return navigate("/receipts/create"); }, variant: "outline", className: "gap-2" },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
                    "New Receipt")),
            React.createElement("div", { className: "grid gap-4 md:grid-cols-3" }, salesModules.map(function (module) {
                var Icon = module.icon;
                return (React.createElement("button", { key: module.title, onClick: function () { return navigate(module.href); }, className: utils_1.cn("group relative overflow-hidden rounded-xl border-l-4 p-4 sm:p-5 text-left transition-all duration-300", "bg-white dark:bg-slate-800/60 border-t border-r border-b border-slate-200 dark:border-slate-700", "hover:shadow-xl hover:-translate-y-1 cursor-pointer", module.borderColor) },
                    React.createElement("div", { className: "absolute inset-0 opacity-0 group-hover:opacity-[0.07] transition-opacity duration-300 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 pointer-events-none" }),
                    React.createElement("div", { className: "relative" },
                        React.createElement("div", { className: "flex items-center justify-between mb-3" },
                            React.createElement("div", { className: "p-2.5 rounded-lg " + module.iconBg },
                                React.createElement(Icon, { className: "h-5 w-5 " + module.iconColor })),
                            React.createElement(lucide_react_1.ArrowRight, { className: "h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" })),
                        React.createElement("h3", { className: "font-bold text-sm text-slate-900 dark:text-slate-50" }, module.title),
                        React.createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400 mt-1" }, module.description),
                        React.createElement("div", { className: "mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50" },
                            React.createElement("p", { className: "text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400" }, module.stats.label),
                            React.createElement("p", { className: "text-xl font-bold text-slate-900 dark:text-slate-50 mt-0.5" }, module.stats.value))),
                    React.createElement("div", { className: "absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-gradient-to-r from-transparent via-current to-transparent" })));
            })))));
}
exports["default"] = Sales;
