"use strict";
exports.__esModule = true;
exports.NotificationBell = void 0;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var scroll_area_1 = require("@/components/ui/scroll-area");
var tabs_1 = require("@/components/ui/tabs");
var separator_1 = require("@/components/ui/separator");
var trpc_1 = require("@/lib/trpc");
var date_fns_1 = require("date-fns");
var wouter_1 = require("wouter");
var utils_1 = require("@/lib/utils");
function NotificationBell() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var utils = trpc_1.trpc.useUtils();
    var _b = react_1.useState("all"), activeTab = _b[0], setActiveTab = _b[1];
    var _c = react_1.useState(false), isAnimating = _c[0], setIsAnimating = _c[1];
    var _d = react_1.useState(false), isOpen = _d[0], setIsOpen = _d[1];
    var containerRef = react_1.useRef(null);
    // Close on click outside
    react_1.useEffect(function () {
        if (!isOpen)
            return;
        var handler = function (e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return function () { return document.removeEventListener("mousedown", handler); };
    }, [isOpen]);
    // Fetch unread count
    var _e = trpc_1.trpc.notifications.unreadCount.useQuery(undefined, {
        refetchInterval: 30000
    }).data, unreadCount = _e === void 0 ? 0 : _e;
    // Fetch recent notifications
    var _f = trpc_1.trpc.notifications.list.useQuery({ limit: 15 }, { refetchInterval: 30000 }).data, notifications = _f === void 0 ? [] : _f;
    // Trigger animation when new notifications arrive
    react_1.useEffect(function () {
        if (unreadCount > 0) {
            setIsAnimating(true);
            var timer_1 = setTimeout(function () { return setIsAnimating(false); }, 600);
            return function () { return clearTimeout(timer_1); };
        }
    }, [unreadCount]);
    var markAsReadMutation = trpc_1.trpc.notifications.markAsRead.useMutation({
        onSuccess: function () {
            utils.notifications.unreadCount.invalidate();
            utils.notifications.list.invalidate();
            utils.notifications.unread.invalidate();
        }
    });
    var deleteMutation = trpc_1.trpc.notifications["delete"].useMutation({
        onSuccess: function () {
            utils.notifications.list.invalidate();
            utils.notifications.unreadCount.invalidate();
        }
    });
    var markAllAsReadMutation = trpc_1.trpc.notifications.markAllAsRead.useMutation({
        onSuccess: function () {
            utils.notifications.unreadCount.invalidate();
            utils.notifications.list.invalidate();
            utils.notifications.unread.invalidate();
        }
    });
    var handleNotificationClick = function (notification) {
        if (!notification.isRead) {
            markAsReadMutation.mutate({ id: notification.id });
        }
        if (notification.actionUrl) {
            navigate(notification.actionUrl);
        }
    };
    var getNotificationIcon = function (type) {
        switch (type) {
            case "success":
                return React.createElement(lucide_react_1.CheckCircle, { className: "h-5 w-5 text-green-500" });
            case "warning":
                return React.createElement(lucide_react_1.AlertTriangle, { className: "h-5 w-5 text-amber-500" });
            case "error":
                return React.createElement(lucide_react_1.AlertCircle, { className: "h-5 w-5 text-red-500" });
            case "reminder":
                return React.createElement(lucide_react_1.Zap, { className: "h-5 w-5 text-blue-500" });
            default:
                return React.createElement(lucide_react_1.Info, { className: "h-5 w-5 text-blue-500" });
        }
    };
    var getPriorityColor = function (priority) {
        switch (priority) {
            case "high":
                return "bg-red-500/10 border-red-200 dark:border-red-800";
            case "normal":
                return "bg-amber-500/10 border-amber-200 dark:border-amber-800";
            case "low":
                return "bg-blue-500/10 border-blue-200 dark:border-blue-800";
            default:
                return "bg-slate-500/10 border-slate-200 dark:border-slate-800";
        }
    };
    var getPriorityBadgeColor = function (priority) {
        switch (priority) {
            case "high":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
            case "normal":
                return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
            case "low":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
            default:
                return "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200";
        }
    };
    // Filter notifications by tab
    var filterNotifications = function (notificationList, filter) {
        switch (filter) {
            case "unread":
                return notificationList.filter(function (n) { return !n.isRead; });
            case "success":
                return notificationList.filter(function (n) { return n.type === "success"; });
            case "alerts":
                return notificationList.filter(function (n) {
                    return ["error", "warning"].includes(n.type);
                });
            case "all":
            default:
                return notificationList;
        }
    };
    var filteredNotifications = filterNotifications(notifications, activeTab);
    var unreadInTab = activeTab === "unread"
        ? filteredNotifications.length
        : filteredNotifications.filter(function (n) { return !n.isRead; }).length;
    return (React.createElement("div", { ref: containerRef, className: "relative" },
        React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { return setIsOpen(!isOpen); }, className: utils_1.cn("relative transition-all duration-300", isAnimating && "animate-pulse") },
            React.createElement(lucide_react_1.Bell, { className: utils_1.cn("h-5 w-5 transition-transform", isAnimating && "scale-110") }),
            unreadCount > 0 && (React.createElement(badge_1.Badge, { className: utils_1.cn("absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold animate-in fade-in zoom-in", unreadCount > 3 ? "bg-red-500" : "bg-blue-500") }, unreadCount > 9 ? "9+" : unreadCount))),
        isOpen && (React.createElement("div", { className: "absolute right-0 top-full mt-2 w-[90vw] sm:w-80 md:w-96 rounded-md border bg-popover text-popover-foreground shadow-lg z-[100] animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 max-h-[80vh] flex flex-col" },
            React.createElement("div", { className: "flex items-center justify-between px-3 sm:px-4 py-3 border-b flex-shrink-0" },
                React.createElement("div", { className: "min-w-0 flex items-center gap-2" },
                    React.createElement("h3", { className: "font-semibold text-sm sm:text-base" }, "Notifications"),
                    unreadCount > 0 && (React.createElement(badge_1.Badge, { className: "bg-red-500 text-white text-xs h-5 px-1.5" }, unreadCount > 9 ? "9+" : unreadCount))),
                unreadCount > 0 && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return markAllAsReadMutation.mutate(); }, className: "text-xs h-7 whitespace-nowrap flex-shrink-0 ml-2" }, "Mark read"))),
            React.createElement(tabs_1.Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full flex-1 flex flex-col overflow-hidden" },
                React.createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-4 rounded-none border-b px-2 sm:px-4 py-0 h-9 bg-transparent flex-shrink-0" },
                    React.createElement(tabs_1.TabsTrigger, { value: "all", className: "text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1" }, "All"),
                    React.createElement(tabs_1.TabsTrigger, { value: "unread", className: "text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1" },
                        "Unread",
                        unreadCount > 0 && (React.createElement(badge_1.Badge, { variant: "secondary", className: "ml-0.5 h-4 px-1 text-xs" }, unreadCount > 9 ? "9+" : unreadCount))),
                    React.createElement(tabs_1.TabsTrigger, { value: "alerts", className: "text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1" }, "Alerts"),
                    React.createElement(tabs_1.TabsTrigger, { value: "success", className: "text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1" }, "Success")),
                ["all", "unread", "alerts", "success"].map(function (tab) { return (React.createElement(tabs_1.TabsContent, { key: tab, value: tab, className: "mt-0 flex-1 overflow-hidden" },
                    React.createElement(scroll_area_1.ScrollArea, { className: "h-full" }, !filteredNotifications || filteredNotifications.length === 0 ? (React.createElement("div", { className: "px-4 py-12 text-center text-sm text-muted-foreground" },
                        React.createElement(lucide_react_1.Bell, { className: "h-12 w-12 mx-auto opacity-20 mb-2" }),
                        React.createElement("p", null, tab === "unread"
                            ? "No unread notifications"
                            : tab === "alerts"
                                ? "No alerts"
                                : tab === "success"
                                    ? "No success notifications"
                                    : "No notifications yet"))) : (React.createElement("div", { className: "space-y-2 p-2" }, filteredNotifications.map(function (notification) { return (React.createElement("div", { key: notification.id, className: utils_1.cn("group relative flex gap-2 p-2 sm:p-3 rounded-lg border transition-all hover:shadow-sm cursor-pointer", getPriorityColor(notification.priority), !notification.isRead && "border-current opacity-100", notification.isRead && "opacity-75 hover:opacity-100"), onClick: function () { return handleNotificationClick(notification); } },
                        React.createElement("div", { className: "flex-shrink-0 mt-0.5" }, getNotificationIcon(notification.type || "")),
                        React.createElement("div", { className: "flex-1 min-w-0" },
                            React.createElement("div", { className: "flex items-start justify-between gap-1 sm:gap-2" },
                                React.createElement("p", { className: "font-medium text-xs sm:text-sm truncate" }, typeof notification.title === "string"
                                    ? notification.title
                                    : "Notification"),
                                React.createElement("div", { className: "flex items-center gap-0.5 sm:gap-1 flex-shrink-0" },
                                    notification.priority && notification.priority !== "low" && (React.createElement(badge_1.Badge, { variant: "outline", className: utils_1.cn("text-xs capitalize whitespace-nowrap", getPriorityBadgeColor(notification.priority)) }, String(notification.priority).substring(0, 3))),
                                    !notification.isRead && (React.createElement("div", { className: "h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" })))),
                            React.createElement("p", { className: "text-xs text-muted-foreground line-clamp-2 mt-1" }, typeof notification.message === "string"
                                ? notification.message
                                : ""),
                            React.createElement("div", { className: "flex items-center justify-between mt-1 text-xs text-muted-foreground gap-1 flex-wrap" },
                                notification.category && (React.createElement("span", { className: "px-1.5 py-0.5 bg-muted rounded text-xs truncate" }, String(notification.category))),
                                React.createElement("span", { className: "ml-auto flex-shrink-0 whitespace-nowrap" }, notification.createdAt
                                    ? date_fns_1.formatDistanceToNow(new Date(notification.createdAt), {
                                        addSuffix: true
                                    })
                                    : ""))),
                        React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "absolute -right-1 -top-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0", onClick: function (e) {
                                e.stopPropagation();
                                deleteMutation.mutate(notification.id);
                            } },
                            React.createElement(lucide_react_1.X, { className: "h-4 w-4" })))); })))))); })),
            React.createElement(separator_1.Separator, null),
            React.createElement("div", { className: "px-2 py-2 flex gap-2" },
                React.createElement(button_1.Button, { variant: "outline", size: "sm", className: "flex-1 text-xs h-8", onClick: function () { setIsOpen(false); navigate("/notifications"); } }, "View all"),
                notifications.length > 0 && (React.createElement(button_1.Button, { variant: "outline", size: "sm", className: "px-2 h-8", onClick: function () {
                        notifications
                            .filter(function (n) { return n.isRead; })
                            .forEach(function (n) { return deleteMutation.mutate(n.id); });
                    } },
                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))))))));
}
exports.NotificationBell = NotificationBell;
