"use strict";
exports.__esModule = true;
exports.FloatingActionBar = void 0;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var tooltip_1 = require("@/components/ui/tooltip");
var utils_1 = require("@/lib/utils");
var wouter_1 = require("wouter");
var DEFAULT_QUICK_ACCESS_ITEMS = [
    {
        id: "home",
        label: "Home",
        icon: React.createElement(lucide_react_1.Home, { className: "h-5 w-5" }),
        description: "Back to home",
        href: "/"
    },
    {
        id: "create-invoice",
        label: "New Invoice",
        icon: React.createElement(lucide_react_1.Plus, { className: "h-5 w-5" }),
        description: "Create a new invoice",
        href: "/invoices/create"
    },
    {
        id: "create-payment",
        label: "Record Payment",
        icon: React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }),
        description: "Record a new payment",
        href: "/payments/create"
    },
    {
        id: "view-reports",
        label: "Reports",
        icon: React.createElement(lucide_react_1.BarChart3, { className: "h-5 w-5" }),
        description: "View reports and analytics",
        href: "/reports"
    },
    {
        id: "team",
        label: "Team",
        icon: React.createElement(lucide_react_1.Users, { className: "h-5 w-5" }),
        description: "Manage team members",
        href: "/employees"
    },
    {
        id: "orders",
        label: "Orders",
        icon: React.createElement(lucide_react_1.ShoppingCart, { className: "h-5 w-5" }),
        description: "View and manage orders",
        href: "/orders"
    },
    {
        id: "pending-approvals",
        label: "Approvals",
        icon: React.createElement(lucide_react_1.CheckCircle, { className: "h-5 w-5" }),
        description: "Pending approvals",
        href: "/approvals",
        badge: 0,
        badgeColor: "warning"
    },
    {
        id: "recent-activity",
        label: "Activity",
        icon: React.createElement(lucide_react_1.Clock, { className: "h-5 w-5" }),
        description: "Recent activity",
        href: "/activity"
    },
    {
        id: "messages",
        label: "Messages",
        icon: React.createElement(lucide_react_1.MessageSquare, { className: "h-5 w-5" }),
        description: "Your messages",
        href: "/messages"
    },
];
function FloatingActionBar(_a) {
    var _b = _a.items, items = _b === void 0 ? DEFAULT_QUICK_ACCESS_ITEMS : _b, _c = _a.position, position = _c === void 0 ? "right" : _c, _d = _a.collapsed, initialCollapsed = _d === void 0 ? true : _d, onItemClick = _a.onItemClick, _e = _a.sidebarOpen, sidebarOpen = _e === void 0 ? false : _e, _f = _a.sidebarExpanded, sidebarExpanded = _f === void 0 ? false : _f;
    var _g = wouter_1.useLocation(), navigate = _g[1];
    var _h = react_1.useState(false), isExpanded = _h[0], setIsExpanded = _h[1];
    var _j = react_1.useState(false), isMobile = _j[0], setIsMobile = _j[1];
    react_1.useEffect(function () {
        // Check if mobile
        var checkMobile = function () {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return function () { return window.removeEventListener("resize", checkMobile); };
    }, []);
    var handleItemClick = function (item) {
        onItemClick === null || onItemClick === void 0 ? void 0 : onItemClick(item);
        if (item.href) {
            navigate(item.href);
        }
        else if (item.action) {
            item.action();
        }
        // Close after selection
        setIsExpanded(false);
    };
    var positionClasses = position === "right"
        ? "right-4 md:right-6"
        : sidebarExpanded
            ? "left-[272px]"
            : "left-20 lg:left-[80px]";
    return (React.createElement(tooltip_1.TooltipProvider, null,
        React.createElement("div", { className: utils_1.cn("fixed bottom-6 md:bottom-8 z-40 transition-all duration-300", positionClasses) },
            isExpanded && (React.createElement("div", { className: "mb-4 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200 w-80 max-w-[calc(100vw-2rem)]" },
                React.createElement("div", { className: utils_1.cn("bg-card border border-border shadow-lg rounded-xl p-3", "max-h-[60vh] overflow-y-auto") },
                    React.createElement("div", { className: "space-y-1" }, items.map(function (item) { return (React.createElement(tooltip_1.Tooltip, { key: item.id },
                        React.createElement(tooltip_1.TooltipTrigger, { asChild: true },
                            React.createElement(button_1.Button, { variant: "ghost", className: "w-full justify-start gap-3 text-sm h-10 hover:bg-accent text-foreground px-2", onClick: function () { return handleItemClick(item); } },
                                React.createElement("div", { className: "relative flex-shrink-0" },
                                    item.icon,
                                    item.badge && item.badge > 0 && (React.createElement("span", { className: utils_1.cn("absolute -top-2 -right-2 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white", item.badgeColor === "success" && "bg-green-500", item.badgeColor === "warning" && "bg-amber-500", item.badgeColor === "error" && "bg-red-500", !item.badgeColor && "bg-blue-500") }, item.badge > 9 ? "9+" : item.badge))),
                                React.createElement("div", { className: "flex-1 text-left min-w-0" },
                                    React.createElement("p", { className: "font-medium truncate text-foreground text-xs" }, item.label),
                                    React.createElement("p", { className: "text-xs text-muted-foreground truncate" }, item.description)))),
                        React.createElement(tooltip_1.TooltipContent, { side: position === "right" ? "left" : "right" }, item.description))); }))),
                React.createElement(button_1.Button, { size: "sm", variant: "outline", className: "w-full text-foreground border-border hover:bg-accent text-xs h-8", onClick: function () { return setIsExpanded(false); } },
                    React.createElement(lucide_react_1.X, { className: "h-4 w-4 mr-2" }),
                    "Close Quick Actions"))),
            React.createElement(tooltip_1.Tooltip, null,
                React.createElement(tooltip_1.TooltipTrigger, { asChild: true },
                    React.createElement(button_1.Button, { size: "lg", className: utils_1.cn("rounded-full h-14 w-14 md:h-16 md:w-16 shadow-lg", "flex items-center justify-center relative"), onClick: function () { return setIsExpanded(!isExpanded); }, title: isExpanded ? "Close menu" : "Open quick actions" }, isExpanded ? (React.createElement(lucide_react_1.X, { className: "h-6 w-6 md:h-7 md:w-7" })) : (React.createElement(lucide_react_1.Plus, { className: "h-6 w-6 md:h-7 md:w-7" })))),
                React.createElement(tooltip_1.TooltipContent, { side: position === "right" ? "left" : "right" }, isExpanded ? "Close menu" : "Quick Actions (" + items.length + " available)")))));
}
exports.FloatingActionBar = FloatingActionBar;
