"use strict";
/**
 * Collaboration Hub Page
 * Team chat, presence tracking, activity feed — wired to realtimeCollaboration backend
 */
exports.__esModule = true;
var react_1 = require("react");
var DashboardLayout_1 = require("@/components/DashboardLayout");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var badge_1 = require("@/components/ui/badge");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
function CollaborationHub() {
    var _a = react_1.useState(""), chatMessage = _a[0], setChatMessage = _a[1];
    var chatChannel = react_1.useState("general")[0];
    var utils = trpc_1.trpc.useUtils();
    // Notifications / messages
    var notificationsRaw = trpc_1.trpc.realtimeCollaboration.streamLiveNotifications.useQuery({ userId: "current" }, { refetchInterval: 10000 }).data;
    var notifications = (notificationsRaw === null || notificationsRaw === void 0 ? void 0 : notificationsRaw.recentNotifications) || [];
    // Team activity stream
    var activityRaw = trpc_1.trpc.realtimeCollaboration.getTeamActivityStream.useQuery({ teamId: "default", limit: 30 }).data;
    var activities = (activityRaw === null || activityRaw === void 0 ? void 0 : activityRaw.activities) || [];
    // Presence
    var presenceRaw = trpc_1.trpc.realtimeCollaboration.initializePresenceTracking.useQuery({ documentId: "hub", userId: "current" }, { refetchInterval: 15000 }).data;
    var activeUsers = (presenceRaw === null || presenceRaw === void 0 ? void 0 : presenceRaw.activeUsers) || [];
    // Send chat message
    var sendMutation = trpc_1.trpc.realtimeCollaboration.sendChatMessage.useMutation({
        onSuccess: function () {
            setChatMessage("");
            utils.realtimeCollaboration.streamLiveNotifications.invalidate();
            sonner_1.toast.success("Message sent");
        },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var handleSendMessage = function () {
        var msg = chatMessage.trim();
        if (!msg)
            return;
        sendMutation.mutate({ channelId: chatChannel, message: msg });
    };
    var onlineCount = activeUsers.filter(function (u) { return u.lastSeen && new Date(u.lastSeen).getTime() > Date.now() - 300000; }).length;
    return (React.createElement(DashboardLayout_1["default"], null,
        React.createElement("div", { className: "p-6 space-y-6" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", null,
                    React.createElement("h1", { className: "text-3xl font-bold flex items-center gap-2" },
                        React.createElement(lucide_react_1.Users, { className: "h-8 w-8 text-primary" }),
                        "Collaboration Hub"),
                    React.createElement("p", { className: "text-muted-foreground mt-1" }, "Team chat, presence and activity feed"))),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardContent, { className: "pt-4 text-center" },
                        React.createElement("p", { className: "text-3xl font-bold text-green-600" }, onlineCount),
                        React.createElement("p", { className: "text-sm text-muted-foreground" }, "Online Now"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardContent, { className: "pt-4 text-center" },
                        React.createElement("p", { className: "text-3xl font-bold text-blue-600" }, activeUsers.length),
                        React.createElement("p", { className: "text-sm text-muted-foreground" }, "Team Members"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardContent, { className: "pt-4 text-center" },
                        React.createElement("p", { className: "text-3xl font-bold text-purple-600" }, notifications.length),
                        React.createElement("p", { className: "text-sm text-muted-foreground" }, "Notifications"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardContent, { className: "pt-4 text-center" },
                        React.createElement("p", { className: "text-3xl font-bold text-orange-600" }, activities.length),
                        React.createElement("p", { className: "text-sm text-muted-foreground" }, "Recent Activities")))),
            React.createElement(tabs_1.Tabs, { defaultValue: "chat" },
                React.createElement(tabs_1.TabsList, null,
                    React.createElement(tabs_1.TabsTrigger, { value: "chat" },
                        React.createElement(lucide_react_1.MessageSquare, { className: "h-4 w-4 mr-1" }),
                        " Chat"),
                    React.createElement(tabs_1.TabsTrigger, { value: "team" },
                        React.createElement(lucide_react_1.Users, { className: "h-4 w-4 mr-1" }),
                        " Team (",
                        activeUsers.length,
                        ")"),
                    React.createElement(tabs_1.TabsTrigger, { value: "activity" },
                        React.createElement(lucide_react_1.Activity, { className: "h-4 w-4 mr-1" }),
                        " Activity")),
                React.createElement(tabs_1.TabsContent, { value: "chat", className: "mt-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, { className: "text-lg" },
                                "#",
                                chatChannel)),
                        React.createElement(card_1.CardContent, { className: "space-y-4" },
                            React.createElement("div", { className: "border rounded-md p-4 min-h-[300px] max-h-[400px] overflow-y-auto space-y-3 bg-muted/30" }, notifications.length === 0 ? (React.createElement("div", { className: "text-center text-muted-foreground py-8" },
                                React.createElement(lucide_react_1.MessageSquare, { className: "h-8 w-8 mx-auto mb-2 opacity-50" }),
                                React.createElement("p", null, "No messages yet. Start the conversation!"))) : (notifications.map(function (n) { return (React.createElement("div", { key: n.id, className: "flex gap-3 items-start" },
                                React.createElement("div", { className: "w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0" }, (n.user || "?").slice(0, 2).toUpperCase()),
                                React.createElement("div", { className: "flex-1" },
                                    React.createElement("div", { className: "flex items-center gap-2" },
                                        React.createElement("span", { className: "font-semibold text-sm" }, n.user || "System"),
                                        React.createElement("span", { className: "text-xs text-muted-foreground" }, n.timestamp ? new Date(n.timestamp).toLocaleTimeString() : ""),
                                        !n.read && (React.createElement(badge_1.Badge, { variant: "secondary", className: "text-[10px] px-1 py-0" }, "New"))),
                                    React.createElement("p", { className: "text-sm mt-0.5" }, n.text)))); }))),
                            React.createElement("div", { className: "flex gap-2" },
                                React.createElement(input_1.Input, { placeholder: "Type a message...", value: chatMessage, onChange: function (e) { return setChatMessage(e.target.value); }, onKeyDown: function (e) {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    } }),
                                React.createElement(button_1.Button, { onClick: handleSendMessage, disabled: sendMutation.isPending || !chatMessage.trim() },
                                    React.createElement(lucide_react_1.Send, { className: "h-4 w-4" })))))),
                React.createElement(tabs_1.TabsContent, { value: "team", className: "mt-4" }, activeUsers.length === 0 ? (React.createElement(card_1.Card, { className: "border-dashed" },
                    React.createElement(card_1.CardContent, { className: "pt-6 text-center text-muted-foreground" },
                        React.createElement(lucide_react_1.Users, { className: "h-8 w-8 mx-auto mb-2 opacity-50" }),
                        React.createElement("p", null, "No team presence data available yet.")))) : (React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3" }, activeUsers.map(function (user, idx) {
                    var isRecent = user.lastSeen && new Date(user.lastSeen).getTime() > Date.now() - 300000;
                    return (React.createElement(card_1.Card, { key: user.id || idx },
                        React.createElement(card_1.CardContent, { className: "pt-4" },
                            React.createElement("div", { className: "flex items-center gap-3" },
                                React.createElement("div", { className: "relative" },
                                    React.createElement("div", { className: "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white", style: { backgroundColor: user.color || "#6366f1" } }, (user.name || "?").slice(0, 2).toUpperCase()),
                                    React.createElement(lucide_react_1.Circle, { className: "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 " + (isRecent ? "fill-green-500 text-green-500" : "fill-gray-400 text-gray-400") })),
                                React.createElement("div", { className: "flex-1" },
                                    React.createElement("p", { className: "font-semibold" }, user.name || "Unknown"),
                                    React.createElement("p", { className: "text-xs text-muted-foreground" }, isRecent ? "Online" : user.lastSeen ? "Last seen " + new Date(user.lastSeen).toLocaleString() : "Offline")),
                                isRecent && (React.createElement(badge_1.Badge, { className: "bg-green-100 text-green-700" }, "Online"))))));
                })))),
                React.createElement(tabs_1.TabsContent, { value: "activity", className: "mt-4" }, activities.length === 0 ? (React.createElement(card_1.Card, { className: "border-dashed" },
                    React.createElement(card_1.CardContent, { className: "pt-6 text-center text-muted-foreground" },
                        React.createElement(lucide_react_1.Activity, { className: "h-8 w-8 mx-auto mb-2 opacity-50" }),
                        React.createElement("p", null, "No recent activity.")))) : (React.createElement("div", { className: "space-y-2" }, activities.map(function (act) { return (React.createElement(card_1.Card, { key: act.id },
                    React.createElement(card_1.CardContent, { className: "pt-3 pb-3" },
                        React.createElement("div", { className: "flex items-center gap-3" },
                            React.createElement("div", { className: "w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0" }, (act.user || "?").slice(0, 2).toUpperCase()),
                            React.createElement("div", { className: "flex-1" },
                                React.createElement("p", { className: "text-sm" },
                                    React.createElement("span", { className: "font-semibold" }, act.user || "System"),
                                    " ",
                                    act.action || act.type || "performed an action"),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, act.timestamp ? new Date(act.timestamp).toLocaleString() : "")),
                            act.type && (React.createElement(badge_1.Badge, { variant: "outline" }, act.type)))))); }))))))));
}
exports["default"] = CollaborationHub;
