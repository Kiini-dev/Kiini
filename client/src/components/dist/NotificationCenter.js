"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.NotificationCenter = void 0;
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var useNotificationSubscription_1 = require("@/hooks/useNotificationSubscription");
function NotificationCenter() {
    var _a = react_1.useState(false), isOpen = _a[0], setIsOpen = _a[1];
    var _b = react_1.useState([]), displayNotifications = _b[0], setDisplayNotifications = _b[1];
    var utils = trpc_1.trpc.useUtils();
    // Fetch notifications
    var _c = trpc_1.trpc.notifications.list.useQuery({
        limit: 10
    }).data, notificationsData = _c === void 0 ? [] : _c;
    var _d = trpc_1.trpc.notifications.unreadCount.useQuery({}).data, unreadCount = _d === void 0 ? 0 : _d;
    // Subscribe to real-time notifications
    var _e = useNotificationSubscription_1.useNotificationSubscription({
        onNotificationReceived: function (event) {
            // Refetch notifications when new one arrives
            utils.notifications.list.invalidate();
            utils.notifications.unreadCount.invalidate();
        },
        onNotificationRead: function (notificationId) {
            // Update local state to mark as read
            setDisplayNotifications(function (prev) {
                return prev.map(function (n) { return (n.id === notificationId ? __assign(__assign({}, n), { isRead: 1 }) : n); });
            });
        },
        onNotificationDeleted: function (notificationId) {
            // Remove from local state
            setDisplayNotifications(function (prev) { return prev.filter(function (n) { return n.id !== notificationId; }); });
        },
        onUnreadCountChanged: function () {
            // Refetch unread count
            utils.notifications.unreadCount.invalidate();
        }
    }), isConnected = _e.isConnected, reconnect = _e.reconnect;
    var markAsReadMutation = trpc_1.trpc.notifications.markAsRead.useMutation({
        onSuccess: function () {
            utils.notifications.list.invalidate();
            utils.notifications.unreadCount.invalidate();
        }
    });
    var deleteNotificationMutation = trpc_1.trpc.notifications["delete"].useMutation({
        onSuccess: function () {
            utils.notifications.list.invalidate();
        }
    });
    var markAllAsReadMutation = trpc_1.trpc.notifications.markAllAsRead.useMutation({
        onSuccess: function () {
            utils.notifications.list.invalidate();
            utils.notifications.unreadCount.invalidate();
        }
    });
    // Update display notifications when data changes
    react_1.useEffect(function () {
        setDisplayNotifications(notificationsData);
    }, [notificationsData]);
    var handleNotificationClick = function (notification) {
        if (!notification.isRead) {
            markAsReadMutation.mutate({ id: notification.id });
        }
        if (notification.actionUrl) {
            window.location.href = notification.actionUrl;
        }
    };
    var getIcon = function (type) {
        switch (type) {
            case "error":
                return React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-red-500" });
            case "success":
                return React.createElement(lucide_react_1.CheckCircle, { className: "h-4 w-4 text-green-500" });
            case "warning":
                return React.createElement(lucide_react_1.AlertTriangle, { className: "h-4 w-4 text-yellow-500" });
            case "reminder":
                return React.createElement(lucide_react_1.Clock, { className: "h-4 w-4 text-blue-500" });
            default:
                return React.createElement(lucide_react_1.Info, { className: "h-4 w-4 text-gray-500" });
        }
    };
    return (React.createElement(dropdown_menu_1.DropdownMenu, { open: isOpen, onOpenChange: setIsOpen },
        React.createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
            React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "relative", title: "Notifications" },
                React.createElement(lucide_react_1.Bell, { className: "h-4 w-4" }),
                unreadCount > 0 && (React.createElement(badge_1.Badge, { className: "absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 flex items-center justify-center", variant: "destructive" }, unreadCount > 9 ? "9+" : unreadCount)))),
        React.createElement(dropdown_menu_1.DropdownMenuContent, { align: "end", className: "w-80 max-h-96 overflow-y-auto" },
            React.createElement(dropdown_menu_1.DropdownMenuLabel, { className: "flex justify-between items-center" },
                React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement("span", null, "Notifications"),
                    isConnected ? (React.createElement(lucide_react_1.Wifi, { className: "h-3 w-3 text-green-500", title: "Connected" })) : (React.createElement(lucide_react_1.WifiOff, { className: "h-3 w-3 text-red-500", title: "Disconnected" }))),
                unreadCount > 0 && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-xs h-auto p-0", onClick: function () { return markAllAsReadMutation.mutate(); } }, "Mark all as read"))),
            React.createElement(dropdown_menu_1.DropdownMenuSeparator, null),
            displayNotifications.length === 0 ? (React.createElement("div", { className: "p-4 text-center text-sm text-gray-500" }, "No notifications")) : (displayNotifications.map(function (notification) { return (React.createElement("div", { key: notification.id },
                React.createElement("div", { className: utils_1.cn("flex gap-3 px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors", notification.isRead === 0 && "bg-blue-50 dark:bg-blue-900/20"), onClick: function () { return handleNotificationClick(notification); } },
                    React.createElement("div", { className: "flex-shrink-0 mt-1" }, getIcon(notification.type)),
                    React.createElement("div", { className: "flex-grow min-w-0" },
                        React.createElement("p", { className: "text-sm font-medium text-gray-900 dark:text-white" }, notification.title),
                        React.createElement("p", { className: "text-sm text-gray-600 dark:text-gray-400 line-clamp-2" }, notification.message),
                        React.createElement("p", { className: "text-xs text-gray-500 dark:text-gray-500 mt-1" }, notification.createdAt ? new Date(notification.createdAt).toLocaleDateString() : 'Recently')),
                    React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "h-auto p-0 flex-shrink-0", onClick: function (e) {
                            e.stopPropagation();
                            deleteNotificationMutation.mutate({ id: notification.id });
                        } },
                        React.createElement(lucide_react_1.X, { className: "h-4 w-4" }))),
                React.createElement(dropdown_menu_1.DropdownMenuSeparator, null))); })))));
}
exports.NotificationCenter = NotificationCenter;
