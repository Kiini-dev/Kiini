"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var trpc_1 = require("@/lib/trpc");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var stats_card_1 = require("@/components/ui/stats-card");
var ICTDashboardNav_1 = require("@/components/ICTDashboardNav");
var ICTDashboardNav_2 = require("@/components/ICTDashboardNav");
// Subpage component for ICT Dashboard pages
var ICTSubpage = function (_a) {
    var title = _a.title, description = _a.description;
    var _b = wouter_1.useLocation(), navigate = _b[1];
    var _c = react_1.useState(false), mobileNavOpen = _c[0], setMobileNavOpen = _c[1];
    return (React.createElement("div", { className: "flex min-h-screen bg-background" },
        React.createElement(ICTDashboardNav_1.ICTDashboardNavMobile, { isOpen: mobileNavOpen, onClose: function () { return setMobileNavOpen(false); } }),
        React.createElement("div", { className: "flex-1 flex flex-col min-h-0 overflow-y-auto" },
            React.createElement(ModuleLayout_1.ModuleLayout, { title: title, description: description, icon: React.createElement(lucide_react_1.Monitor, { className: "h-5 w-5" }), breadcrumbs: [
                    { label: "Dashboard", href: "/crm-home" },
                    { label: "ICT", href: "/crm/ict" },
                    { label: title },
                ], actions: (React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setMobileNavOpen(true); } },
                    React.createElement(lucide_react_1.Menu, { className: "mr-2 h-4 w-4" }),
                    "Menu")) },
                React.createElement("div", { className: "flex flex-col items-center justify-center py-16 space-y-4" },
                    React.createElement(lucide_react_1.AlertCircle, { className: "h-12 w-12 text-muted-foreground" }),
                    React.createElement("h2", { className: "text-xl font-semibold" }, title),
                    React.createElement("p", { className: "text-muted-foreground text-center max-w-md" }, description),
                    React.createElement("p", { className: "text-sm text-muted-foreground/60" }, "Under Construction - Feature coming soon"),
                    React.createElement(button_1.Button, { onClick: function () { return navigate("/crm/ict"); }, variant: "outline", className: "mt-4" }, "\u2190 Back to Dashboard"))))));
};
function ICTDashboard() {
    var _a = permissions_1.useRequireRole(["ict_manager", "super_admin", "admin"]), allowed = _a.allowed, isLoading = _a.isLoading, user = _a.user;
    var _b = wouter_1.useLocation(), location = _b[0], navigate = _b[1];
    var _c = react_1.useState(false), mobileNavOpen = _c[0], setMobileNavOpen = _c[1];
    // Handle subpage routing
    if (location.startsWith("/crm/ict/")) {
        var subpage = location.replace("/crm/ict/", "");
        var subpageConfig = {
            "system-settings": { title: "System Settings", description: "Configure system-wide settings and preferences" },
            "email-queue": { title: "Email Queue", description: "Monitor and manage pending email messages" },
            "analytics": { title: "System Analytics", description: "View system performance analytics and trends" },
            "database": { title: "Data Management", description: "Manage database operations and backups" },
            "security": { title: "Security & Access", description: "Configure security policies and access control" },
            "activity": { title: "System Activity", description: "View system activity logs and audit trails" }
        };
        var config = subpageConfig[subpage];
        if (config) {
            return React.createElement(ICTSubpage, { title: config.title, description: config.description });
        }
        else {
            return React.createElement(ICTSubpage, { title: "404 - Page Not Found", description: "The requested page does not exist. Please navigate back to the ICT Dashboard." });
        }
    }
    var _d = react_1.useState({
        systemHealth: 95,
        activeUsers: 0,
        emailQueue: 0,
        uptime: "99.9%"
    }), metrics = _d[0], setMetrics = _d[1];
    // Fetch real ICT system metrics
    var _e = trpc_1.trpc.ictManagement.getSystemHealth.useQuery(undefined, {
        enabled: allowed,
        refetchOnWindowFocus: false,
        staleTime: 60000
    }), systemHealthData = _e.data, healthLoading = _e.isLoading;
    var _f = trpc_1.trpc.ictManagement.getEmailQueueStatus.useQuery({}, {
        enabled: allowed,
        refetchOnWindowFocus: false,
        staleTime: 60000
    }), emailQueueData = _f.data, emailLoading = _f.isLoading;
    var _g = trpc_1.trpc.ictManagement.getActiveSessions.useQuery({}, {
        enabled: allowed,
        refetchOnWindowFocus: false,
        staleTime: 60000
    }), activeSessionsData = _g.data, sessionsLoading = _g.isLoading;
    // Calculate system health percentage from CPU, memory, disk usage
    react_1.useEffect(function () {
        if (systemHealthData) {
            var avgUsage = (systemHealthData.cpuUsage + systemHealthData.memoryUsage + systemHealthData.diskUsagePercent) / 3;
            var healthPercent = Math.round(100 - avgUsage);
            setMetrics({
                systemHealth: Math.max(0, healthPercent),
                activeUsers: (activeSessionsData === null || activeSessionsData === void 0 ? void 0 : activeSessionsData.length) || 0,
                emailQueue: (emailQueueData === null || emailQueueData === void 0 ? void 0 : emailQueueData.pending) || 0,
                uptime: (systemHealthData.systemUptime || 0) + "h"
            });
        }
    }, [systemHealthData, emailQueueData, activeSessionsData]);
    // Filter menu items based on user roles
    var accessibleICTItems = react_1.useMemo(function () {
        if (!user)
            return [];
        return ICTDashboardNav_2.ICT_MENU_ITEMS.filter(function (item) { return permissions_1.hasRole(user.role, item.requiredRoles); });
    }, [user]);
    if (isLoading || healthLoading || emailLoading || sessionsLoading) {
        return (React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" })));
    }
    if (!allowed) {
        return null;
    }
    var ictFeatures = [
        {
            title: "System Health",
            description: "Monitor system performance and health metrics",
            icon: React.createElement(lucide_react_1.Monitor, { className: "w-8 h-8" }),
            href: "/crm/ict/system-settings",
            color: "from-blue-500 to-blue-600",
            stat: { label: "Health", value: metrics.systemHealth + "%" }
        },
        {
            title: "Email Queue",
            description: "Monitor and manage email sending operations",
            icon: React.createElement(lucide_react_1.Mail, { className: "w-8 h-8" }),
            href: "/crm/ict/email-queue",
            color: "from-purple-500 to-purple-600",
            stat: { label: "Pending", value: metrics.emailQueue }
        },
        {
            title: "System Analytics",
            description: "View and analyze system activity and performance",
            icon: React.createElement(lucide_react_1.BarChart3, { className: "w-8 h-8" }),
            href: "/crm/ict/analytics",
            color: "from-green-500 to-green-600",
            stat: { label: "Recent", value: "12" }
        },
        {
            title: "Data Management",
            description: "Manage database operations and backups",
            icon: React.createElement(lucide_react_1.Database, { className: "w-8 h-8" }),
            href: "/crm/ict/database",
            color: "from-orange-500 to-orange-600",
            stat: { label: "Status", value: "Healthy" }
        },
        {
            title: "Security & Access",
            description: "Configure security policies and access control",
            icon: React.createElement(lucide_react_1.Shield, { className: "w-8 h-8" }),
            href: "/crm/ict/security",
            color: "from-cyan-500 to-cyan-600",
            stat: { label: "Status", value: "Secure" }
        },
        {
            title: "System Activity",
            description: "View system activity logs and audit trails",
            icon: React.createElement(lucide_react_1.Activity, { className: "w-8 h-8" }),
            href: "/crm/ict/activity",
            color: "from-red-500 to-red-600",
            stat: { label: "Status", value: "Active" }
        },
    ];
    var managementSections = [
        { key: "monitoring", label: "Monitoring" },
        { key: "administration", label: "Administration" },
        { key: "security", label: "Security" },
        { key: "system", label: "System" },
    ];
    return (React.createElement("div", { className: "flex min-h-screen bg-background" },
        React.createElement(ICTDashboardNav_1.ICTDashboardNavMobile, { isOpen: mobileNavOpen, onClose: function () { return setMobileNavOpen(false); } }),
        React.createElement("div", { className: "flex-1 flex flex-col min-h-0 overflow-y-auto" },
            React.createElement(ModuleLayout_1.ModuleLayout, { title: "ICT Dashboard", description: "System administration, monitoring, and technical management", icon: React.createElement(lucide_react_1.Monitor, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/dashboard" }, { label: "ICT" }], actions: (React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setMobileNavOpen(true); } },
                    React.createElement(lucide_react_1.Menu, { className: "mr-2 h-4 w-4" }),
                    "Menu")) },
                React.createElement("div", { className: "space-y-8" },
                    React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                        React.createElement(stats_card_1.StatsCard, { label: "System Health", value: React.createElement(React.Fragment, null,
                                metrics.systemHealth,
                                "%"), description: "Overall system status", icon: React.createElement(lucide_react_1.CheckCircle2, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
                        React.createElement(stats_card_1.StatsCard, { label: "Active Users", value: metrics.activeUsers, description: "Currently online", icon: React.createElement(lucide_react_1.TrendingUp, { className: "h-5 w-5" }), color: "border-l-green-500" }),
                        React.createElement(stats_card_1.StatsCard, { label: "Email Queue", value: metrics.emailQueue, description: "Pending emails", icon: React.createElement(lucide_react_1.Mail, { className: "h-5 w-5" }), color: "border-l-purple-500" }),
                        React.createElement(stats_card_1.StatsCard, { label: "Uptime", value: metrics.uptime, description: "System availability", icon: React.createElement(lucide_react_1.AlertCircle, { className: "h-5 w-5" }), color: "border-l-yellow-500" })),
                    React.createElement("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3" }, ictFeatures.map(function (feature) { return (React.createElement(card_1.Card, { key: feature.href, className: "cursor-pointer hover:shadow-lg hover:shadow-primary/10 transition-all group hover:scale-105 border-2 hover:border-primary/50", onClick: function () { return navigate(feature.href); } },
                        React.createElement(card_1.CardHeader, null,
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("div", { className: "p-3 rounded-lg bg-gradient-to-br " + feature.color + " text-white" }, feature.icon),
                                React.createElement(lucide_react_1.ArrowRight, { className: "h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" })),
                            React.createElement(card_1.CardTitle, { className: "mt-4" }, feature.title),
                            React.createElement(card_1.CardDescription, null, feature.description)),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement(button_1.Button, { variant: "ghost", className: "w-full group-hover:bg-accent" }, "Access"),
                                React.createElement("span", { className: "text-sm font-semibold text-muted-foreground" }, feature.stat.value))))); })),
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("h3", { className: "text-2xl font-bold" }, "ICT Management"),
                        React.createElement("p", { className: "text-sm text-muted-foreground max-w-2xl" }, "Access the same ICT monitoring, administration, security and system tools available to ICT managers, all from the ICT management hub."),
                        managementSections.map(function (section) {
                            var sectionItems = accessibleICTItems.filter(function (item) { return item.section === section.key; });
                            if (sectionItems.length === 0)
                                return null;
                            return (React.createElement("div", { key: section.key, className: "space-y-3" },
                                React.createElement("div", { className: "flex items-center justify-between" },
                                    React.createElement("div", null,
                                        React.createElement("h4", { className: "text-lg font-semibold" }, section.label),
                                        React.createElement("p", { className: "text-sm text-muted-foreground" },
                                            section.label,
                                            " tools for ICT and super admin users."))),
                                React.createElement("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3" }, sectionItems.map(function (item) { return (React.createElement(card_1.Card, { key: section.key + "-" + item.label, className: "cursor-pointer hover:shadow-lg transition-all border border-slate-200 dark:border-slate-800", onClick: function () { return navigate(item.href); } },
                                    React.createElement(card_1.CardContent, { className: "space-y-3" },
                                        React.createElement("div", { className: "flex items-center gap-3" },
                                            React.createElement("div", { className: "rounded-lg bg-slate-100 dark:bg-slate-800 p-3 text-slate-700 dark:text-slate-200" }, item.icon),
                                            React.createElement("div", null,
                                                React.createElement("p", { className: "text-sm font-semibold" }, item.label),
                                                React.createElement("p", { className: "text-xs text-muted-foreground" }, item.description))),
                                        React.createElement("div", { className: "flex items-center justify-between text-sm font-medium text-blue-600 dark:text-blue-400" },
                                            React.createElement("span", null, "Open"),
                                            React.createElement(lucide_react_1.ArrowRight, { className: "h-4 w-4" }))))); }))));
                        })),
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("h3", { className: "text-2xl font-bold" }, "Troubleshooting & Support"),
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                            React.createElement(button_1.Button, { variant: "outline", className: "h-auto p-4 justify-start", onClick: function () { return navigate("/admin/system-health"); } },
                                React.createElement(lucide_react_1.Monitor, { className: "h-5 w-5 mr-3" }),
                                React.createElement("div", { className: "text-left" },
                                    React.createElement("div", { className: "font-semibold" }, "System Health"),
                                    React.createElement("div", { className: "text-sm text-muted-foreground" }, "Monitor system performance"))),
                            React.createElement(button_1.Button, { variant: "outline", className: "h-auto p-4 justify-start", onClick: function () { return navigate("/admin/system-logs"); } },
                                React.createElement(lucide_react_1.Activity, { className: "h-5 w-5 mr-3" }),
                                React.createElement("div", { className: "text-left" },
                                    React.createElement("div", { className: "font-semibold" }, "System Logs"),
                                    React.createElement("div", { className: "text-sm text-muted-foreground" }, "View audit logs and activity"))),
                            React.createElement(button_1.Button, { variant: "outline", className: "h-auto p-4 justify-start", onClick: function () { return navigate("/admin/sessions"); } },
                                React.createElement(lucide_react_1.Network, { className: "h-5 w-5 mr-3" }),
                                React.createElement("div", { className: "text-left" },
                                    React.createElement("div", { className: "font-semibold" }, "Session Manager"),
                                    React.createElement("div", { className: "text-sm text-muted-foreground" }, "Manage active user sessions"))),
                            React.createElement(button_1.Button, { variant: "outline", className: "h-auto p-4 justify-start", onClick: function () { return navigate("/admin/backups"); } },
                                React.createElement(lucide_react_1.Database, { className: "h-5 w-5 mr-3" }),
                                React.createElement("div", { className: "text-left" },
                                    React.createElement("div", { className: "font-semibold" }, "Backup Management"),
                                    React.createElement("div", { className: "text-sm text-muted-foreground" }, "Manage system backups"))))),
                    React.createElement(card_1.Card, { className: "bg-gradient-to-r from-slate-900 to-slate-800 border-slate-700 text-white" },
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "System Information"),
                            React.createElement(card_1.CardDescription, { className: "text-slate-400" }, "Current system status and details")),
                        React.createElement(card_1.CardContent, { className: "space-y-4" },
                            React.createElement("div", { className: "grid gap-4 md:grid-cols-3" },
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-sm text-slate-400" }, "System Status"),
                                    React.createElement("p", { className: "text-lg font-semibold flex items-center gap-2" },
                                        React.createElement("span", { className: "w-2 h-2 rounded-full bg-green-500" }),
                                        "Operational")),
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-sm text-slate-400" }, "Database"),
                                    React.createElement("p", { className: "text-lg font-semibold flex items-center gap-2" },
                                        React.createElement("span", { className: "w-2 h-2 rounded-full bg-green-500" }),
                                        "Connected")),
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-sm text-slate-400" }, "API Status"),
                                    React.createElement("p", { className: "text-lg font-semibold flex items-center gap-2" },
                                        React.createElement("span", { className: "w-2 h-2 rounded-full bg-green-500" }),
                                        "Responding"))))))))));
}
exports["default"] = ICTDashboard;
