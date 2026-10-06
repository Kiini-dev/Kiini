"use strict";
exports.__esModule = true;
exports.ICTDashboardNavMobile = exports.ICT_MENU_ITEMS = void 0;
var react_1 = require("react");
var wouter_1 = require("wouter");
var permissions_1 = require("@/lib/permissions");
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
exports.ICT_MENU_ITEMS = [
    // System Monitoring
    {
        label: "System Health",
        href: "/crm/ict/system-settings",
        icon: React.createElement(lucide_react_1.Monitor, { className: "h-4 w-4" }),
        section: "monitoring",
        requiredRoles: ["ict_manager", "super_admin", "admin"],
        description: "Monitor system performance and metrics"
    },
    {
        label: "Active Sessions",
        href: "/crm/ict/activity",
        icon: React.createElement(lucide_react_1.Users, { className: "h-4 w-4" }),
        section: "monitoring",
        requiredRoles: ["ict_manager", "super_admin", "admin"],
        description: "View and manage user sessions"
    },
    {
        label: "System Logs",
        href: "/crm/ict/analytics",
        icon: React.createElement(lucide_react_1.Activity, { className: "h-4 w-4" }),
        section: "monitoring",
        requiredRoles: ["ict_manager", "super_admin", "admin"],
        description: "View system activity and events"
    },
    {
        label: "Performance Metrics",
        href: "/crm/ict/analytics",
        icon: React.createElement(lucide_react_1.BarChart3, { className: "h-4 w-4" }),
        section: "monitoring",
        requiredRoles: ["ict_manager", "super_admin", "admin"],
        description: "Analyze system performance trends"
    },
    // System Administration
    {
        label: "Email Management",
        href: "/crm/ict/email-queue",
        icon: React.createElement(lucide_react_1.Mail, { className: "h-4 w-4" }),
        section: "administration",
        requiredRoles: ["ict_manager", "super_admin", "admin"],
        description: "Configure and monitor email systems"
    },
    {
        label: "Backup Management",
        href: "/crm/ict/database",
        icon: React.createElement(lucide_react_1.Database, { className: "h-4 w-4" }),
        section: "administration",
        requiredRoles: ["ict_manager", "super_admin", "admin"],
        description: "Manage database backups and recovery"
    },
    {
        label: "Database Management",
        href: "/crm/ict/database",
        icon: React.createElement(lucide_react_1.Server, { className: "h-4 w-4" }),
        section: "administration",
        requiredRoles: ["ict_manager", "super_admin"],
        description: "Manage database configuration"
    },
    {
        label: "Integration Management",
        href: "/crm/ict/system-settings",
        icon: React.createElement(lucide_react_1.Zap, { className: "h-4 w-4" }),
        section: "administration",
        requiredRoles: ["ict_manager", "super_admin", "admin"],
        description: "Configure third-party integrations"
    },
    {
        label: "Cron Jobs",
        href: "/crm/ict/system-settings",
        icon: React.createElement(lucide_react_1.HardDrive, { className: "h-4 w-4" }),
        section: "administration",
        requiredRoles: ["ict_manager", "super_admin"],
        description: "Manage automated background jobs"
    },
    // Security
    {
        label: "Security & Access",
        href: "/crm/ict/security",
        icon: React.createElement(lucide_react_1.Shield, { className: "h-4 w-4" }),
        section: "security",
        requiredRoles: ["ict_manager", "super_admin", "admin"],
        description: "Configure security policies and access control"
    },
    {
        label: "Audit Logs",
        href: "/crm/ict/activity",
        icon: React.createElement(lucide_react_1.FileText, { className: "h-4 w-4" }),
        section: "security",
        requiredRoles: ["ict_manager", "super_admin", "admin"],
        description: "View security audit trail"
    },
    {
        label: "Access Permissions",
        href: "/crm/ict/security",
        icon: React.createElement(lucide_react_1.Lock, { className: "h-4 w-4" }),
        section: "security",
        requiredRoles: ["ict_manager", "super_admin", "admin"],
        description: "Manage user roles and permissions"
    },
    {
        label: "API Keys",
        href: "/crm/ict/security",
        icon: React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" }),
        section: "security",
        requiredRoles: ["ict_manager", "super_admin"],
        description: "Manage API keys and authentication"
    },
    // System Settings
    {
        label: "System Settings",
        href: "/crm/ict/system-settings",
        icon: React.createElement(lucide_react_1.SettingsIcon, { className: "h-4 w-4" }),
        section: "system",
        requiredRoles: ["super_admin"],
        description: "Configure global system settings"
    },
    {
        label: "Network Configuration",
        href: "/crm/ict/system-settings",
        icon: React.createElement(lucide_react_1.Network, { className: "h-4 w-4" }),
        section: "system",
        requiredRoles: ["super_admin"],
        description: "Configure network and connection settings"
    },
];
function ICTDashboardNav(_a) {
    var _b = _a.isOpen, isOpen = _b === void 0 ? false : _b, onClose = _a.onClose;
    var _c = permissions_1.useRequireRole(["ict_manager", "super_admin", "admin"]), allowed = _c.allowed, user = _c.user;
    var location = wouter_1.useLocation()[0];
    // Filter menu items based on user roles
    var filteredMenuItems = react_1.useMemo(function () {
        if (!allowed || !user)
            return [];
        // Group items by section and user role
        var grouped = {
            monitoring: exports.ICT_MENU_ITEMS.filter(function (item) { return item.section === "monitoring" && permissions_1.hasRole(user.role, item.requiredRoles); }),
            administration: exports.ICT_MENU_ITEMS.filter(function (item) { return item.section === "administration" && permissions_1.hasRole(user.role, item.requiredRoles); }),
            security: exports.ICT_MENU_ITEMS.filter(function (item) { return item.section === "security" && permissions_1.hasRole(user.role, item.requiredRoles); }),
            system: exports.ICT_MENU_ITEMS.filter(function (item) { return item.section === "system" && permissions_1.hasRole(user.role, item.requiredRoles); })
        };
        return grouped;
    }, [allowed, user]);
    if (!allowed) {
        return null;
    }
    var sections = [
        {
            name: "Monitoring",
            icon: React.createElement(lucide_react_1.Monitor, { className: "h-4 w-4" }),
            key: "monitoring"
        },
        {
            name: "Administration",
            icon: React.createElement(lucide_react_1.Settings, { className: "h-4 w-4" }),
            key: "administration"
        },
        {
            name: "Security",
            icon: React.createElement(lucide_react_1.Shield, { className: "h-4 w-4" }),
            key: "security"
        },
        {
            name: "System",
            icon: React.createElement(lucide_react_1.Server, { className: "h-4 w-4" }),
            key: "system"
        },
    ];
    return (React.createElement("div", { className: utils_1.cn("w-64 min-h-screen bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 overflow-y-auto", "transition-all duration-300") },
        React.createElement("div", { className: "p-4 space-y-6" }, sections.map(function (section) {
            var items = filteredMenuItems[section.key] || [];
            if (items.length === 0)
                return null;
            return (React.createElement("div", { key: section.key, className: "space-y-2" },
                React.createElement("div", { className: "flex items-center gap-2 px-2 py-1" },
                    React.createElement("span", { className: "text-gray-500 dark:text-gray-400" }, section.icon),
                    React.createElement("h3", { className: "text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider" }, section.name)),
                React.createElement("nav", { className: "space-y-1" }, items.map(function (item) { return (React.createElement("a", { key: section.key + "-" + item.label, href: item.href, onClick: function () {
                        onClose === null || onClose === void 0 ? void 0 : onClose();
                    }, className: utils_1.cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors", "group relative", location === item.href
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-200 font-medium"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"), title: item.description },
                    React.createElement("span", { className: "text-gray-500 dark:text-gray-400 group-hover:text-current" }, item.icon),
                    React.createElement("span", { className: "flex-1" }, item.label),
                    location === item.href && (React.createElement("div", { className: "h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" })))); }))));
        }))));
}
exports["default"] = ICTDashboardNav;
function ICTDashboardNavMobile(_a) {
    var _b = _a.isOpen, isOpen = _b === void 0 ? false : _b, onClose = _a.onClose;
    return (React.createElement("div", { className: utils_1.cn("fixed inset-0 z-40 bg-black/50 transition-opacity", isOpen ? "opacity-100" : "opacity-0 pointer-events-none"), onClick: onClose },
        React.createElement("div", { className: utils_1.cn("fixed right-0 top-0 h-full w-72 max-w-full bg-white dark:bg-gray-900 shadow-2xl", "transform transition-transform duration-300", isOpen ? "translate-x-0" : "translate-x-full"), onClick: function (e) { return e.stopPropagation(); } },
            React.createElement(ICTDashboardNav, { isOpen: true, onClose: onClose }))));
}
exports.ICTDashboardNavMobile = ICTDashboardNavMobile;
