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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var avatar_1 = require("@/components/ui/avatar");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var wouter_1 = require("wouter");
function getInitials(name) {
    return name.split(" ").map(function (w) { return w[0]; }).join("").toUpperCase().slice(0, 2);
}
function getAvatarColor(userId) {
    var colors = [
        "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500",
        "bg-pink-500", "bg-teal-500", "bg-indigo-500", "bg-rose-500",
    ];
    var hash = 0;
    for (var i = 0; i < userId.length; i++)
        hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}
var typeIcon = {
    info: React.createElement(lucide_react_1.Info, { className: "w-3.5 h-3.5 text-blue-500" }),
    success: React.createElement(lucide_react_1.CheckCircle, { className: "w-3.5 h-3.5 text-green-500" }),
    warning: React.createElement(lucide_react_1.AlertTriangle, { className: "w-3.5 h-3.5 text-amber-500" }),
    error: React.createElement(lucide_react_1.AlertTriangle, { className: "w-3.5 h-3.5 text-red-500" }),
    reminder: React.createElement(lucide_react_1.Bell, { className: "w-3.5 h-3.5 text-purple-500" }),
    payment: React.createElement(lucide_react_1.CreditCard, { className: "w-3.5 h-3.5 text-emerald-500" }),
    project: React.createElement(lucide_react_1.FolderOpen, { className: "w-3.5 h-3.5 text-indigo-500" }),
    client: React.createElement(lucide_react_1.Users, { className: "w-3.5 h-3.5 text-cyan-500" }),
    financial: React.createElement(lucide_react_1.CreditCard, { className: "w-3.5 h-3.5 text-orange-500" }),
    system: React.createElement(lucide_react_1.Settings, { className: "w-3.5 h-3.5 text-slate-500" }),
    chat: React.createElement(lucide_react_1.MessageCircle, { className: "w-3.5 h-3.5 text-blue-500" })
};
var typeBg = {
    info: "border-l-blue-500",
    success: "border-l-green-500",
    warning: "border-l-amber-500",
    error: "border-l-red-500",
    reminder: "border-l-purple-500",
    payment: "border-l-emerald-500",
    project: "border-l-indigo-500",
    client: "border-l-cyan-500",
    financial: "border-l-orange-500",
    system: "border-l-slate-500",
    chat: "border-l-blue-500"
};
var FADE_DURATION = 10000; // 10 seconds before fade-out starts
var FADE_ANIM_MS = 600; // fade animation duration
function FloatingChatNotifications() {
    var _a = react_1.useState([]), notifications = _a[0], setNotifications = _a[1];
    var _b = react_1.useState(null), expandedNotif = _b[0], setExpandedNotif = _b[1];
    var _c = react_1.useState(""), replyInput = _c[0], setReplyInput = _c[1];
    var _d = react_1.useState(""), lastSeenChatId = _d[0], setLastSeenChatId = _d[1];
    var _e = react_1.useState(new Set()), shownChatIds = _e[0], setShownChatIds = _e[1];
    var _f = react_1.useState(new Set()), lastSeenNotifIds = _f[0], setLastSeenNotifIds = _f[1];
    var _g = wouter_1.useLocation(), location = _g[0], navigate = _g[1];
    var timersRef = react_1.useRef(new Map());
    var isOnChatPage = location === "/staff-chat" || location === "/communications/staff-chat";
    var profileData = trpc_1.trpc.auth.me.useQuery({}).data;
    var currentUserId = (profileData === null || profileData === void 0 ? void 0 : profileData.id) || "";
    // Poll unread chat messages (only show notifications for unread messages)
    var _h = trpc_1.trpc.staffChat.getUnreadMessages.useQuery({ channelId: "general", limit: 10 }, { refetchInterval: 5000, enabled: !isOnChatPage }), unreadMessagesData = _h.data, refetchUnread = _h.refetch;
    // Poll system notifications (unread)
    var sysNotifs = trpc_1.trpc.notifications.unread.useQuery(undefined, {
        refetchInterval: 6000
    }).data;
    var markRead = trpc_1.trpc.notifications.markAsRead.useMutation();
    var markChatRead = trpc_1.trpc.staffChat.markChatRead.useMutation();
    var sendMut = trpc_1.trpc.staffChat.sendMessage.useMutation({
        onSuccess: function () {
            setReplyInput("");
            setExpandedNotif(null);
        }
    });
    // Schedule fade-out for a notification
    var scheduleFade = function (id) {
        if (timersRef.current.has(id))
            return;
        var t = setTimeout(function () {
            setNotifications(function (prev) {
                return prev.map(function (n) { return (n.id === id ? __assign(__assign({}, n), { fadingOut: true }) : n); });
            });
            // After animation, remove it
            setTimeout(function () {
                setNotifications(function (prev) { return prev.filter(function (n) { return n.id !== id; }); });
                timersRef.current["delete"](id);
            }, FADE_ANIM_MS);
        }, FADE_DURATION);
        timersRef.current.set(id, t);
    };
    // Track new unread chat messages
    react_1.useEffect(function () {
        if (!unreadMessagesData || isOnChatPage)
            return;
        var msgs = unreadMessagesData;
        if (msgs.length === 0)
            return;
        var latestMsg = msgs[0]; // Unread messages are already sorted by newest first by backend
        // Only show notification if we haven't already shown it for this message
        if (!shownChatIds.has(latestMsg.id) && latestMsg.userId !== currentUserId) {
            setLastSeenChatId(latestMsg.id);
            // Mark this message as shown so we don't show it again
            setShownChatIds(function (prev) {
                var next = new Set(prev);
                next.add(latestMsg.id);
                return next;
            });
            var chatNotif_1 = {
                id: "chat-" + latestMsg.id,
                type: "chat",
                title: "Message from " + latestMsg.userName,
                message: latestMsg.content,
                userName: latestMsg.userName,
                userId: latestMsg.userId,
                channelId: latestMsg.channelId || "general",
                actionUrl: "/staff-chat",
                timestamp: latestMsg.createdAt || new Date().toISOString()
            };
            setNotifications(function (prev) {
                var updated = __spreadArrays([chatNotif_1], prev.filter(function (n) { return n.id !== chatNotif_1.id; })).slice(0, 5);
                return updated;
            });
            // Immediately mark as read so it doesn't come back on next poll
            markChatRead.mutate({ channelId: latestMsg.channelId || "general", lastReadMessageId: latestMsg.id }, { onSuccess: function () { return refetchUnread(); } });
            scheduleFade(chatNotif_1.id);
        }
    }, [unreadMessagesData, shownChatIds, currentUserId, isOnChatPage]);
    // Track system notifications
    react_1.useEffect(function () {
        if (!sysNotifs || sysNotifs.length === 0)
            return;
        var newNotifs = [];
        for (var _i = 0, sysNotifs_1 = sysNotifs; _i < sysNotifs_1.length; _i++) {
            var n = sysNotifs_1[_i];
            if (!lastSeenNotifIds.has(n.id)) {
                newNotifs.push({
                    id: "sys-" + n.id,
                    type: n.type || "info",
                    title: n.title,
                    message: n.message,
                    actionUrl: n.actionUrl || undefined,
                    timestamp: n.createdAt || new Date().toISOString()
                });
            }
        }
        if (newNotifs.length > 0) {
            // Mark as read on server immediately so they don't reappear on navigation
            newNotifs.forEach(function (n) {
                var realId = n.id.replace("sys-", "");
                markRead.mutate({ id: realId });
            });
            setLastSeenNotifIds(function (prev) {
                var next = new Set(prev);
                sysNotifs.forEach(function (n) { return next.add(n.id); });
                return next;
            });
            setNotifications(function (prev) {
                var updated = __spreadArrays(newNotifs, prev).slice(0, 5);
                return updated;
            });
            newNotifs.forEach(function (n) { return scheduleFade(n.id); });
        }
    }, [sysNotifs]);
    // Cleanup timers on unmount
    react_1.useEffect(function () {
        return function () {
            timersRef.current.forEach(function (t) { return clearTimeout(t); });
        };
    }, []);
    // Auto-dismiss chat notifications when user navigates to chat page
    react_1.useEffect(function () {
        if (isOnChatPage) {
            var chatNotifs = notifications.filter(function (n) { return n.id.startsWith("chat-"); });
            chatNotifs.forEach(function (n) {
                var msgId = n.id.replace("chat-", "");
                markChatRead.mutate({ channelId: n.channelId || "general", lastReadMessageId: msgId }, { onSuccess: function () { return refetchUnread(); } });
                var t = timersRef.current.get(n.id);
                if (t) {
                    clearTimeout(t);
                    timersRef.current["delete"](n.id);
                }
            });
            if (chatNotifs.length > 0) {
                setNotifications(function (prev) { return prev.filter(function (n) { return !n.id.startsWith("chat-"); }); });
            }
        }
    }, [isOnChatPage]);
    var handleReply = function (channelId) {
        if (!replyInput.trim())
            return;
        sendMut.mutate({ content: replyInput.trim(), channelId: channelId });
    };
    var dismiss = function (id) {
        var t = timersRef.current.get(id);
        if (t) {
            clearTimeout(t);
            timersRef.current["delete"](id);
        }
        // If it's a system notification, mark as read
        if (id.startsWith("sys-")) {
            var realId = id.replace("sys-", "");
            markRead.mutate({ id: realId });
        }
        // If it's a chat notification, mark as read and refetch unread messages
        if (id.startsWith("chat-")) {
            var msgId = id.replace("chat-", "");
            var notif = notifications.find(function (n) { return n.id === id; });
            markChatRead.mutate({ channelId: (notif === null || notif === void 0 ? void 0 : notif.channelId) || "general", lastReadMessageId: msgId }, { onSuccess: function () { return refetchUnread(); } });
        }
        setNotifications(function (prev) { return prev.filter(function (n) { return n.id !== id; }); });
        if (expandedNotif === id)
            setExpandedNotif(null);
    };
    var dismissAll = function () {
        timersRef.current.forEach(function (t) { return clearTimeout(t); });
        timersRef.current.clear();
        notifications.forEach(function (n) {
            if (n.id.startsWith("sys-"))
                markRead.mutate({ id: n.id.replace("sys-", "") });
            if (n.id.startsWith("chat-")) {
                var msgId = n.id.replace("chat-", "");
                markChatRead.mutate({ channelId: n.channelId || "general", lastReadMessageId: msgId }, { onSuccess: function () { return refetchUnread(); } });
            }
        });
        setNotifications([]);
        setExpandedNotif(null);
    };
    if (notifications.length === 0)
        return null;
    return (React.createElement("div", { className: "fixed bottom-20 right-4 z-50 flex flex-col gap-2 max-w-[360px] pointer-events-none" },
        notifications.length > 1 && (React.createElement("div", { className: "flex justify-end pointer-events-auto" },
            React.createElement(button_1.Button, { variant: "secondary", size: "sm", className: "h-6 text-[10px] px-2 shadow", onClick: dismissAll }, "Clear all"))),
        notifications.map(function (notif) { return (React.createElement("div", { key: notif.id, className: utils_1.cn("border border-l-4 rounded-xl overflow-hidden transition-all pointer-events-auto", "bg-white/80 dark:bg-gray-900/80", "backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900", "hover:shadow-lg shadow-md", typeBg[notif.type] || "border-l-blue-500", notif.fadingOut
                ? "opacity-0 translate-x-8 transition-all duration-500 ease-in"
                : "animate-in slide-in-from-right-5 opacity-100") },
            React.createElement("div", { className: "flex items-center gap-2 px-3 py-2 bg-muted/50" },
                notif.type === "chat" && notif.userId ? (React.createElement(avatar_1.Avatar, { className: "w-6 h-6" },
                    React.createElement(avatar_1.AvatarFallback, { className: getAvatarColor(notif.userId) + " text-white text-[9px]" }, getInitials(notif.userName || "?")))) : (React.createElement("span", { className: "flex items-center justify-center w-6 h-6 rounded-full bg-muted" }, typeIcon[notif.type] || React.createElement(lucide_react_1.Bell, { className: "w-3.5 h-3.5" }))),
                React.createElement("div", { className: "flex-1 min-w-0" },
                    React.createElement("p", { className: "text-xs font-semibold truncate" }, notif.title),
                    React.createElement("p", { className: "text-[10px] text-muted-foreground" }, new Date(notif.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))),
                React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "h-6 w-6 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive", onClick: function () { return dismiss(notif.id); } },
                    React.createElement(lucide_react_1.X, { className: "w-4 h-4" }))),
            React.createElement("div", { className: utils_1.cn("px-3 py-2", notif.actionUrl && "cursor-pointer hover:bg-muted/30"), onClick: function () { if (notif.actionUrl) {
                    dismiss(notif.id);
                    navigate(notif.actionUrl);
                } } },
                React.createElement("p", { className: "text-sm line-clamp-2" }, notif.message)),
            notif.type === "chat" && (React.createElement("div", { className: "px-3 pb-2" }, expandedNotif === notif.id ? (React.createElement("div", { className: "flex gap-1" },
                React.createElement(input_1.Input, { placeholder: "Quick reply...", value: replyInput, onChange: function (e) { return setReplyInput(e.target.value); }, className: "h-7 text-xs", onKeyDown: function (e) {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            handleReply(notif.channelId || "general");
                        }
                    } }),
                React.createElement(button_1.Button, { size: "sm", className: "h-7 w-7 p-0", onClick: function () { return handleReply(notif.channelId || "general"); }, disabled: sendMut.isPending },
                    React.createElement(lucide_react_1.Send, { className: "w-3 h-3" })))) : (React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "h-6 text-[10px] w-full", onClick: function () { return setExpandedNotif(notif.id); } }, "Reply")))))); })));
}
exports["default"] = FloatingChatNotifications;
