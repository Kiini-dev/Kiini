"use strict";
exports.__esModule = true;
var useAuthWithPersistence_1 = require("@/_core/hooks/useAuthWithPersistence");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var lucide_react_1 = require("lucide-react");
var stats_card_1 = require("@/components/ui/stats-card");
function Home() {
    var _a = useAuthWithPersistence_1.useAuthWithPersistence(), user = _a.user, isAuthenticated = _a.isAuthenticated, logout = _a.logout;
    var _b = wouter_1.useLocation(), navigate = _b[1];
    // Show the home page for both authenticated and unauthenticated users
    // Protected pages handle their own auth checks
    // Do NOT redirect authenticated users - let them view public content freely
    var features = [
        {
            title: "Projects",
            description: "Manage and track all your projects",
            icon: lucide_react_1.FolderKanban,
            href: "/projects",
            color: "text-blue-500",
            bgColor: "bg-blue-50 dark:bg-blue-950"
        },
        {
            title: "Clients",
            description: "Client relationship management",
            icon: lucide_react_1.Users,
            href: "/clients",
            color: "text-green-500",
            bgColor: "bg-green-50 dark:bg-green-950"
        },
        {
            title: "Invoices",
            description: "Create and manage invoices",
            icon: lucide_react_1.FileText,
            href: "/invoices",
            color: "text-purple-500",
            bgColor: "bg-purple-50 dark:bg-purple-950"
        },
        {
            title: "Estimates",
            description: "Generate quotations and estimates",
            icon: lucide_react_1.Receipt,
            href: "/estimates",
            color: "text-orange-500",
            bgColor: "bg-orange-50 dark:bg-orange-950"
        },
        {
            title: "Payments",
            description: "Track payments and transactions",
            icon: lucide_react_1.DollarSign,
            href: "/payments",
            color: "text-emerald-500",
            bgColor: "bg-emerald-50 dark:bg-emerald-950"
        },
        {
            title: "Products",
            description: "Product catalog management",
            icon: lucide_react_1.Package,
            href: "/products",
            color: "text-cyan-500",
            bgColor: "bg-cyan-50 dark:bg-cyan-950"
        },
        {
            title: "Services",
            description: "Service offerings catalog",
            icon: lucide_react_1.Briefcase,
            href: "/services",
            color: "text-indigo-500",
            bgColor: "bg-indigo-50 dark:bg-indigo-950"
        },
        {
            title: "Accounting",
            description: "Financial management and reports",
            icon: lucide_react_1.CreditCard,
            href: "/accounting",
            color: "text-pink-500",
            bgColor: "bg-pink-50 dark:bg-pink-950"
        },
        {
            title: "Reports",
            description: "Analytics and insights",
            icon: lucide_react_1.BarChart3,
            href: "/reports",
            color: "text-amber-500",
            bgColor: "bg-amber-50 dark:bg-amber-950"
        },
        {
            title: "HR",
            description: "Human resources management",
            icon: lucide_react_1.UserCog,
            href: "/hr",
            color: "text-rose-500",
            bgColor: "bg-rose-50 dark:bg-rose-950"
        },
    ];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Welcome to Your CRM", description: "Manage your clients, projects, invoices, and more from one powerful platform", icon: React.createElement(lucide_react_1.FolderKanban, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
        ] },
        React.createElement("div", { className: "space-y-8" },
            React.createElement("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3" }, features.map(function (feature) {
                var Icon = feature.icon;
                return (React.createElement(card_1.Card, { key: feature.href, className: "cursor-pointer hover:shadow-lg hover:shadow-primary/10 transition-all group hover:scale-105 border-2 hover:border-primary/50", onClick: function () { return navigate(feature.href); } },
                    React.createElement(card_1.CardHeader, null,
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", { className: "p-3 rounded-lg " + feature.bgColor },
                                React.createElement(Icon, { className: "h-6 w-6 " + feature.color })),
                            React.createElement(lucide_react_1.ArrowRight, { className: "h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" })),
                        React.createElement(card_1.CardTitle, { className: "mt-4" }, feature.title),
                        React.createElement(card_1.CardDescription, null, feature.description)),
                    React.createElement(card_1.CardContent, null,
                        React.createElement(button_1.Button, { variant: "ghost", className: "w-full group-hover:bg-accent" },
                            "View ",
                            feature.title))));
            })),
            React.createElement("div", { className: "mt-12" },
                React.createElement("h3", { className: "text-2xl font-bold mb-6" }, "Quick Overview"),
                React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                    React.createElement(stats_card_1.StatsCard, { label: "Total Projects", value: "0", description: "Get started by creating a project", icon: React.createElement(lucide_react_1.FolderKanban, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
                    React.createElement(stats_card_1.StatsCard, { label: "Active Clients", value: "0", description: "Add your first client", icon: React.createElement(lucide_react_1.Users, { className: "h-5 w-5" }), color: "border-l-green-500" }),
                    React.createElement(stats_card_1.StatsCard, { label: "Pending Invoices", value: "0", description: "No pending invoices", icon: React.createElement(lucide_react_1.FileText, { className: "h-5 w-5" }), color: "border-l-purple-500" }),
                    React.createElement(stats_card_1.StatsCard, { label: "Revenue", value: "KES 0", description: "This month", icon: React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }), color: "border-l-emerald-500" }))))));
}
exports["default"] = Home;
