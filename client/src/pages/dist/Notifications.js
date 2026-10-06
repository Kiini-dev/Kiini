"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var stats_card_1 = require("@/components/ui/stats-card");
function Notifications() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = react_1.useState(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = react_1.useState("all"), typeFilter = _c[0], setTypeFilter = _c[1];
    var _d = react_1.useState("all"), readFilter = _d[0], setReadFilter = _d[1];
    var _e = react_1.useState("all"), priorityFilter = _e[0], setPriorityFilter = _e[1];
    var queryUtils = trpc_1.trpc.useUtils();
    // Fetch notifications
    var _f = trpc_1.trpc.notifications.list.useQuery({
        limit: 100
    }), _g = _f.data, notifications = _g === void 0 ? [] : _g, isLoading = _f.isLoading, refetch = _f.refetch;
    // Mark as read mutation
    var markAsReadMutation = trpc_1.trpc.notifications.markAsRead.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Notification marked as read");
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to mark as read");
        }
    });
    // Mark as unread mutation
    var markAsUnreadMutation = trpc_1.trpc.notifications.markAsUnread.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Notification marked as unread");
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to mark as unread");
        }
    });
    // Delete notification mutation
    var deleteNotificationMutation = trpc_1.trpc.notifications["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Notification deleted");
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete notification");
        }
    });
    // Filter notifications based on criteria
    var filteredNotifications = react_1.useMemo(function () {
        return notifications.filter(function (notif) {
            var _a, _b;
            var matchesSearch = ((_a = notif.title) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchQuery.toLowerCase())) || ((_b = notif.message) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(searchQuery.toLowerCase()));
            var matchesType = typeFilter === "all" || notif.type === typeFilter;
            var matchesRead = readFilter === "all" || (readFilter === "unread" ? !notif.isRead : notif.isRead);
            var matchesPriority = priorityFilter === "all" || notif.priority === priorityFilter;
            return matchesSearch && matchesType && matchesRead && matchesPriority;
        });
    }, [notifications, searchQuery, typeFilter, readFilter, priorityFilter]);
    var unreadCount = notifications.filter(function (n) { return !n.isRead; }).length;
    var getTypeIcon = function (type) {
        switch (type) {
            case "success":
                return React.createElement(lucide_react_1.CheckCircle, { className: "h-4 w-4 text-green-600" });
            case "error":
                return React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-red-600" });
            case "warning":
                return React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-amber-600" });
            case "reminder":
                return React.createElement(lucide_react_1.Bell, { className: "h-4 w-4 text-blue-600" });
            default:
                return React.createElement(lucide_react_1.Info, { className: "h-4 w-4 text-blue-600" });
        }
    };
    var getPriorityColor = function (priority) {
        switch (priority) {
            case "high":
                return "bg-red-100 text-red-800 hover:bg-red-100";
            case "normal":
                return "bg-blue-100 text-blue-800 hover:bg-blue-100";
            case "low":
                return "bg-gray-100 text-gray-800 hover:bg-gray-100";
            default:
                return "bg-gray-100 text-gray-800 hover:bg-gray-100";
        }
    };
    var getTypeColor = function (type) {
        switch (type) {
            case "success":
                return "bg-green-100 text-green-800 hover:bg-green-100";
            case "error":
                return "bg-red-100 text-red-800 hover:bg-red-100";
            case "warning":
                return "bg-amber-100 text-amber-800 hover:bg-amber-100";
            case "reminder":
                return "bg-blue-100 text-blue-800 hover:bg-blue-100";
            default:
                return "bg-blue-100 text-blue-800 hover:bg-blue-100";
        }
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Notifications", description: "View and manage your notifications", icon: React.createElement(lucide_react_1.Bell, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Notifications" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Notifications", value: notifications.length, description: "All time", color: "border-l-purple-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Unread", value: unreadCount, description: "Need attention", color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Read", value: notifications.length - unreadCount, description: "Reviewed", color: "border-l-blue-500" })),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-lg" }, "Filters")),
                React.createElement(card_1.CardContent, { className: "space-y-4" },
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Search, { className: "h-4 w-4 text-muted-foreground" }),
                        React.createElement(input_1.Input, { placeholder: "Search notifications...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "flex-1" })),
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement("label", { className: "text-sm font-medium" }, "Type"),
                            React.createElement(select_1.Select, { value: typeFilter, onValueChange: setTypeFilter },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "all" }, "All Types"),
                                    React.createElement(select_1.SelectItem, { value: "info" }, "Info"),
                                    React.createElement(select_1.SelectItem, { value: "success" }, "Success"),
                                    React.createElement(select_1.SelectItem, { value: "warning" }, "Warning"),
                                    React.createElement(select_1.SelectItem, { value: "error" }, "Error"),
                                    React.createElement(select_1.SelectItem, { value: "reminder" }, "Reminder")))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement("label", { className: "text-sm font-medium" }, "Status"),
                            React.createElement(select_1.Select, { value: readFilter, onValueChange: setReadFilter },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "all" }, "All"),
                                    React.createElement(select_1.SelectItem, { value: "unread" }, "Unread"),
                                    React.createElement(select_1.SelectItem, { value: "read" }, "Read")))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement("label", { className: "text-sm font-medium" }, "Priority"),
                            React.createElement(select_1.Select, { value: priorityFilter, onValueChange: setPriorityFilter },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "all" }, "All"),
                                    React.createElement(select_1.SelectItem, { value: "high" }, "High"),
                                    React.createElement(select_1.SelectItem, { value: "normal" }, "Normal"),
                                    React.createElement(select_1.SelectItem, { value: "low" }, "Low"))))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Notifications"),
                    React.createElement(card_1.CardDescription, null,
                        "Showing ",
                        filteredNotifications.length,
                        " of ",
                        notifications.length,
                        " notifications")),
                React.createElement(card_1.CardContent, null, isLoading ? (React.createElement("div", { className: "text-center py-8 text-muted-foreground" }, "Loading notifications...")) : filteredNotifications.length === 0 ? (React.createElement("div", { className: "text-center py-8 text-muted-foreground" }, "No notifications found")) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, { className: "w-8" }),
                                React.createElement(table_1.TableHead, null, "Type"),
                                React.createElement(table_1.TableHead, null, "Title"),
                                React.createElement(table_1.TableHead, null, "Priority"),
                                React.createElement(table_1.TableHead, { className: "hidden md:table-cell" }, "Created"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, filteredNotifications.map(function (notif) { return (React.createElement(table_1.TableRow, { key: notif.id, className: notif.isRead ? "opacity-60" : "" },
                            React.createElement(table_1.TableCell, null, getTypeIcon(notif.type)),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { className: getTypeColor(notif.type) }, notif.type)),
                            React.createElement(table_1.TableCell, null,
                                React.createElement("div", { className: "font-medium" }, notif.title),
                                React.createElement("div", { className: "text-sm text-muted-foreground line-clamp-1" }, notif.message)),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { className: getPriorityColor(notif.priority) }, notif.priority)),
                            React.createElement(table_1.TableCell, { className: "hidden md:table-cell text-sm" }, new Date(notif.createdAt).toLocaleDateString()),
                            React.createElement(table_1.TableCell, { className: "text-right space-x-1" },
                                React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () {
                                        if (notif.isRead) {
                                            markAsUnreadMutation.mutate({ id: notif.id });
                                        }
                                        else {
                                            markAsReadMutation.mutate({ id: notif.id });
                                        }
                                    }, title: notif.isRead ? "Mark as unread" : "Mark as read" }, notif.isRead ? (React.createElement(lucide_react_1.EyeOff, { className: "h-4 w-4" })) : (React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" }))),
                                React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return deleteNotificationMutation.mutate(notif.id); }, title: "Delete notification" },
                                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4 text-red-600" }))))); }))))))))));
}
exports["default"] = Notifications;
