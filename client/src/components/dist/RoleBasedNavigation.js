"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var useAuth_1 = require("@/_core/hooks/useAuth");
var wouter_1 = require("wouter");
var permissions_1 = require("@/lib/permissions");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var utils_1 = require("@/lib/utils");
// Icon map
var ICON_MAP = {
    LayoutDashboard: React.createElement(lucide_react_1.LayoutDashboard, { className: "h-5 w-5" }),
    Users: React.createElement(lucide_react_1.Users, { className: "h-5 w-5" }),
    TrendingUp: React.createElement(lucide_react_1.TrendingUp, { className: "h-5 w-5" }),
    DollarSign: React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }),
    ShoppingCart: React.createElement(lucide_react_1.ShoppingCart, { className: "h-5 w-5" }),
    Package: React.createElement(lucide_react_1.Package, { className: "h-5 w-5" }),
    BarChart3: React.createElement(lucide_react_1.BarChart3, { className: "h-5 w-5" }),
    Settings: React.createElement(lucide_react_1.Settings, { className: "h-5 w-5" }),
    User: React.createElement(lucide_react_1.User, { className: "h-5 w-5" })
};
/**
 * RoleBasedNavigation component that renders different menu items
 * based on the user's role and permissions
 */
function RoleBasedNavigation() {
    var user = useAuth_1.useAuth().user;
    var location = wouter_1.useLocation()[0];
    var _a = react_1.useState([]), expandedItems = _a[0], setExpandedItems = _a[1];
    var navigationItems = permissions_1.getNavigationForRole(user === null || user === void 0 ? void 0 : user.role);
    var toggleExpanded = function (href) {
        setExpandedItems(function (prev) {
            return prev.includes(href) ? prev.filter(function (item) { return item !== href; }) : __spreadArrays(prev, [href]);
        });
    };
    var isActive = function (href) {
        if (href === "/dashboard") {
            return location === "/" || location.startsWith("/dashboard");
        }
        if (href === "/account") {
            return location === "/account" || location.startsWith("/account");
        }
        // For parent items, check if any child is in the current route
        if (href === "/accounting") {
            return location.startsWith("/invoices") || location.startsWith("/payments") ||
                location.startsWith("/expenses") || location.startsWith("/bank-reconciliation") ||
                location.startsWith("/chart-of-accounts") || location.startsWith("/budgets");
        }
        if (href === "/procurement") {
            return location.startsWith("/lpos") || location.startsWith("/orders") ||
                location.startsWith("/imprests") || location.startsWith("/inventory");
        }
        return location.startsWith(href && href !== "#");
    };
    return (React.createElement("nav", { className: "space-y-2 px-2 py-4" }, navigationItems.map(function (item) {
        var hasChildren = item.children && item.children.length > 0;
        var itemIsActive = isActive(item.href);
        var isExpanded = expandedItems.includes(item.href);
        return (React.createElement("div", { key: item.href },
            React.createElement("button", { onClick: function () {
                    if (hasChildren) {
                        toggleExpanded(item.href);
                    }
                    else if (item.href !== "#") {
                        window.location.href = item.href;
                    }
                }, className: utils_1.cn("w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200", "hover:bg-gray-100 dark:hover:bg-gray-800", itemIsActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-semibold"
                    : "text-gray-700 dark:text-gray-300") },
                React.createElement("div", { className: "flex items-center gap-3" },
                    React.createElement("span", { className: "text-gray-500 dark:text-gray-400" }, item.icon ? ICON_MAP[item.icon] : null),
                    React.createElement("span", null, item.label)),
                hasChildren && (React.createElement("span", { className: utils_1.cn("ml-auto transition-transform duration-200", isExpanded && "rotate-180") },
                    React.createElement(lucide_react_1.ChevronDown, { className: "h-4 w-4" })))),
            hasChildren && isExpanded && (React.createElement("div", { className: "ml-2 mt-1 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-2" }, item.children.map(function (child) {
                var childIsActive = isActive(child.href);
                return (React.createElement("a", { key: child.href, href: child.href, className: utils_1.cn("block px-3 py-2 text-sm rounded-lg transition-all duration-200", "hover:bg-gray-100 dark:hover:bg-gray-800", childIsActive
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-medium"
                        : "text-gray-600 dark:text-gray-400") }, child.label));
            })))));
    })));
}
exports["default"] = RoleBasedNavigation;
