"use strict";
exports.__esModule = true;
exports.Sidenav = void 0;
var react_1 = require("react");
var wouter_1 = require("wouter");
var MaterialTailwindContext_1 = require("@/contexts/MaterialTailwindContext");
var scroll_area_1 = require("@/components/ui/scroll-area");
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
var navItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: React.createElement(lucide_react_1.LayoutDashboard, { className: "w-5 h-5" })
    },
    {
        title: "Clients",
        href: "/clients",
        icon: React.createElement(lucide_react_1.Users, { className: "w-5 h-5" })
    },
    {
        title: "Projects",
        href: "/projects",
        icon: React.createElement(lucide_react_1.FolderKanban, { className: "w-5 h-5" })
    },
    {
        title: "Sales",
        href: "#",
        icon: React.createElement(lucide_react_1.FileText, { className: "w-5 h-5" }),
        submenu: [
            { title: "Invoices", href: "/invoices", icon: React.createElement(lucide_react_1.FileText, { className: "w-4 h-4" }) },
            { title: "Estimates", href: "/estimates", icon: React.createElement(lucide_react_1.FileText, { className: "w-4 h-4" }) },
            { title: "Receipts", href: "/receipts", icon: React.createElement(lucide_react_1.Receipt, { className: "w-4 h-4" }) },
            { title: "Opportunities", href: "/opportunities", icon: React.createElement(lucide_react_1.Briefcase, { className: "w-4 h-4" }) },
        ]
    },
    {
        title: "Accounting",
        href: "#",
        icon: React.createElement(lucide_react_1.DollarSign, { className: "w-5 h-5" }),
        submenu: [
            { title: "Payments", href: "/payments", icon: React.createElement(lucide_react_1.DollarSign, { className: "w-4 h-4" }) },
            { title: "Expenses", href: "/expenses", icon: React.createElement(lucide_react_1.DollarSign, { className: "w-4 h-4" }) },
            { title: "Chart of Accounts", href: "/chart-of-accounts", icon: React.createElement(lucide_react_1.BarChart3, { className: "w-4 h-4" }) },
        ]
    },
    {
        title: "Products & Services",
        href: "#",
        icon: React.createElement(lucide_react_1.Package, { className: "w-5 h-5" }),
        submenu: [
            { title: "Products", href: "/products", icon: React.createElement(lucide_react_1.Package, { className: "w-4 h-4" }) },
            { title: "Services", href: "/services", icon: React.createElement(lucide_react_1.Briefcase, { className: "w-4 h-4" }) },
        ]
    },
    {
        title: "HR",
        href: "#",
        icon: React.createElement(lucide_react_1.UserCog, { className: "w-5 h-5" }),
        submenu: [
            { title: "Employees", href: "/employees", icon: React.createElement(lucide_react_1.Users, { className: "w-4 h-4" }) },
            { title: "Departments", href: "/departments", icon: React.createElement(lucide_react_1.Briefcase, { className: "w-4 h-4" }) },
            { title: "Attendance", href: "/attendance", icon: React.createElement(lucide_react_1.BarChart3, { className: "w-4 h-4" }) },
            { title: "Payroll", href: "/payroll", icon: React.createElement(lucide_react_1.DollarSign, { className: "w-4 h-4" }) },
            { title: "Leave", href: "/leave", icon: React.createElement(lucide_react_1.BarChart3, { className: "w-4 h-4" }) },
        ]
    },
    {
        title: "Reports",
        href: "/reports",
        icon: React.createElement(lucide_react_1.BarChart3, { className: "w-5 h-5" })
    },
    {
        title: "Financial Dashboard",
        href: "/financial-dashboard",
        icon: React.createElement(lucide_react_1.DollarSign, { className: "w-5 h-5" })
    },
    {
        title: "AI Hub",
        href: "/ai-hub",
        icon: React.createElement(lucide_react_1.Sparkles, { className: "w-5 h-5" })
    },
    {
        title: "Communications",
        href: "/communications",
        icon: React.createElement(lucide_react_1.Mail, { className: "w-5 h-5" })
    },
];
function Sidenav() {
    var _a = MaterialTailwindContext_1.useMaterialTailwindController(), controller = _a[0], dispatch = _a[1];
    var openSidenav = controller.openSidenav, sidenavType = controller.sidenavType;
    var _b = wouter_1.useLocation(), location = _b[0], navigate = _b[1];
    var _c = react_1.useState(function () {
        // Load expanded menu from localStorage
        if (typeof window !== 'undefined') {
            return localStorage.getItem('expandedMenu') || null;
        }
        return null;
    }), expandedMenu = _c[0], setExpandedMenu = _c[1];
    // Persist expanded menu state
    var handleToggleSubmenu = function (title) {
        var newExpanded = expandedMenu === title ? null : title;
        setExpandedMenu(newExpanded);
        if (typeof window !== 'undefined') {
            if (newExpanded) {
                localStorage.setItem('expandedMenu', newExpanded);
            }
            else {
                localStorage.removeItem('expandedMenu');
            }
        }
    };
    // Check if a route is active
    var isActive = function (href) {
        if (href === '#')
            return false;
        return location === href || (location === null || location === void 0 ? void 0 : location.startsWith(href + '/'));
    };
    // Check if parent menu should be expanded based on current route
    var shouldExpandMenu = function (item) {
        if (!item.submenu)
            return false;
        return item.submenu.some(function (sub) { return isActive(sub.href); });
    };
    var sidenavClasses = {
        dark: "bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700",
        white: "bg-white border-slate-200 shadow-lg",
        transparent: "bg-transparent"
    };
    var handleNavClick = function (href) {
        if (href !== "#") {
            navigate(href);
            MaterialTailwindContext_1.setOpenSidenav(dispatch, false);
        }
    };
    return (React.createElement(React.Fragment, null,
        openSidenav && (React.createElement("div", { className: "fixed inset-0 z-40 bg-black/50 xl:hidden", onClick: function () { return MaterialTailwindContext_1.setOpenSidenav(dispatch, false); } })),
        React.createElement("aside", { className: utils_1.cn("fixed left-0 top-0 z-50 h-screen w-72 transition-transform duration-300", "border-r", sidenavClasses[sidenavType], openSidenav ? "translate-x-0" : "-translate-x-full xl:translate-x-0") },
            React.createElement("div", { className: "flex flex-col h-full" },
                React.createElement("div", { className: "flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700" },
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement("div", { className: utils_1.cn("w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white", "bg-gradient-to-br from-blue-600 to-blue-700") }, "M"),
                        React.createElement("span", { className: utils_1.cn("font-bold text-lg", sidenavType === "dark" ? "text-white" : "text-slate-900") }, "CRM")),
                    React.createElement("button", { onClick: function () { return MaterialTailwindContext_1.setOpenSidenav(dispatch, false); }, className: "xl:hidden p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded" },
                        React.createElement(lucide_react_1.X, { className: "w-5 h-5" }))),
                React.createElement(scroll_area_1.ScrollArea, { className: "flex-1" },
                    React.createElement("nav", { className: "p-4 space-y-2" }, navItems.map(function (item) { return (React.createElement("div", { key: item.title },
                        React.createElement("button", { onClick: function () {
                                if (item.submenu) {
                                    handleToggleSubmenu(item.title);
                                }
                                else {
                                    handleNavClick(item.href);
                                }
                            }, className: utils_1.cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors", "hover:bg-slate-100 dark:hover:bg-slate-700", isActive(item.href) || shouldExpandMenu(item)
                                ? sidenavType === "dark"
                                    ? "bg-blue-600 text-white"
                                    : "bg-blue-50 text-blue-700"
                                : sidenavType === "dark"
                                    ? "text-slate-300 hover:text-white"
                                    : "text-slate-700 hover:text-slate-900") },
                            item.icon,
                            React.createElement("span", { className: "flex-1 text-left font-medium text-sm" }, item.title),
                            item.submenu && (React.createElement(lucide_react_1.ChevronRight, { className: utils_1.cn("w-4 h-4 transition-transform", expandedMenu === item.title && "rotate-90") })),
                            item.badge && (React.createElement("span", { className: "bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full" }, item.badge))),
                        item.submenu && (expandedMenu === item.title || shouldExpandMenu(item)) && (React.createElement("div", { className: "ml-4 mt-1 space-y-1 border-l border-slate-300 dark:border-slate-600 pl-4" }, item.submenu.map(function (subitem) { return (React.createElement("button", { key: subitem.title, onClick: function () { return handleNavClick(subitem.href); }, className: utils_1.cn("w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors", "hover:bg-slate-100 dark:hover:bg-slate-700", isActive(subitem.href)
                                ? sidenavType === "dark"
                                    ? "bg-blue-600 text-white"
                                    : "bg-blue-100 text-blue-700"
                                : sidenavType === "dark"
                                    ? "text-slate-400 hover:text-slate-200"
                                    : "text-slate-600 hover:text-slate-900") },
                            subitem.icon,
                            React.createElement("span", null, subitem.title))); }))))); }))),
                React.createElement("div", { className: "p-4 border-t border-slate-200 dark:border-slate-700" },
                    React.createElement("button", { onClick: function () { return handleNavClick("/settings"); }, className: utils_1.cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors", "hover:bg-slate-100 dark:hover:bg-slate-700", sidenavType === "dark"
                            ? "text-slate-300 hover:text-white"
                            : "text-slate-700 hover:text-slate-900") },
                        React.createElement(lucide_react_1.Settings, { className: "w-5 h-5" }),
                        React.createElement("span", { className: "text-sm font-medium" }, "Settings")))))));
}
exports.Sidenav = Sidenav;
