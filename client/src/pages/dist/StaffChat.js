"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var avatar_1 = require("@/components/ui/avatar");
var dialog_1 = require("@/components/ui/dialog");
var label_1 = require("@/components/ui/label");
var separator_1 = require("@/components/ui/separator");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var EMOJI_OPTIONS = [
    "👍", "❤️", "😂", "😮", "😢", "😡", "🎉", "🔥",
    "✨", "👏", "💯", "🚀", "💡", "📝", "⏰", "✅",
    "❌", "👀", "🤔", "😴", "🤷", "😎", "🙌", "💪",
    "🌟", "🍕", "☕", "📅", "📌", "🔒", "🔑", "🎁",
    "📎", "💼", "📊", "📈", "📉", "💬", "👤", "👥",
    "🗂️", "📂", "🖼️", "🎨", "🎬", "🎤", "🎧", "🎮",
    "⚽", "🏀", "🏆", "🚗", "✈️", "🏠", "🏢", "🏥",
    "😅", "😇", "🤩", "🥳", "😜", "🤪", "🤨", "🧐",
    "😬", "😰", "😱", "😭", "😤", "😠", "🤬", "👻",
];
function getInitials(name) {
    return name
        .split(" ")
        .map(function (w) { return w[0]; })
        .join("")
        .toUpperCase()
        .slice(0, 2);
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
function getChannelIcon(type) {
    if (type === "private")
        return React.createElement(lucide_react_1.Lock, { className: "w-3.5 h-3.5" });
    if (type === "team")
        return React.createElement(lucide_react_1.Hash, { className: "w-3.5 h-3.5" });
    return React.createElement(lucide_react_1.MessageCircle, { className: "w-3.5 h-3.5" });
}
function StaffChat() {
    var _a = react_1.useState(""), input = _a[0], setInput = _a[1];
    var _b = react_1.useState(null), replyTo = _b[0], setReplyTo = _b[1];
    var _c = react_1.useState(null), editingMsg = _c[0], setEditingMsg = _c[1];
    var _d = react_1.useState(false), showEmojiPicker = _d[0], setShowEmojiPicker = _d[1];
    var _e = react_1.useState(""), searchQuery = _e[0], setSearchQuery = _e[1];
    var _f = react_1.useState(false), showSearch = _f[0], setShowSearch = _f[1];
    var _g = react_1.useState(null), mentionQuery = _g[0], setMentionQuery = _g[1];
    var _h = react_1.useState(0), mentionIndex = _h[0], setMentionIndex = _h[1];
    var _j = react_1.useState("general"), activeChannelId = _j[0], setActiveChannelId = _j[1];
    var _k = react_1.useState(false), showNewChannelDialog = _k[0], setShowNewChannelDialog = _k[1];
    var _l = react_1.useState(false), showNewPrivateDialog = _l[0], setShowNewPrivateDialog = _l[1];
    var _m = react_1.useState(""), newChannelName = _m[0], setNewChannelName = _m[1];
    var _o = react_1.useState(""), newChannelDesc = _o[0], setNewChannelDesc = _o[1];
    var _p = react_1.useState([]), newChannelMembers = _p[0], setNewChannelMembers = _p[1];
    var _q = react_1.useState(""), privateRecipient = _q[0], setPrivateRecipient = _q[1];
    var _r = react_1.useState(null), pendingFile = _r[0], setPendingFile = _r[1];
    var _s = react_1.useState(false), mobileSidebarOpen = _s[0], setMobileSidebarOpen = _s[1];
    var messagesEndRef = react_1.useRef(null);
    var inputRef = react_1.useRef(null);
    var fileInputRef = react_1.useRef(null);
    // Get current user info
    var profileData = trpc_1.trpc.auth.me.useQuery({}).data;
    var currentUserId = (profileData === null || profileData === void 0 ? void 0 : profileData.id) || "";
    var currentUserName = (profileData === null || profileData === void 0 ? void 0 : profileData.name) || (profileData === null || profileData === void 0 ? void 0 : profileData.email) || "Me";
    // Channels
    var _t = trpc_1.trpc.staffChat.listChannels.useQuery(undefined, { refetchInterval: 10000 }), channelsData = _t.data, refetchChannels = _t.refetch;
    var channels = channelsData || [];
    var activeChannel = channels.find(function (c) { return c.id === activeChannelId; }) || channels[0];
    // Messages for active channel
    var _u = trpc_1.trpc.staffChat.getMessages.useQuery({ channelId: activeChannelId, limit: 100, offset: 0 }, { refetchInterval: 3000 }), messagesData = _u.data, refetchMessages = _u.refetch;
    var membersData = trpc_1.trpc.staffChat.getMembers.useQuery(undefined, { refetchInterval: 5000 }).data;
    // Mutations
    var sendMut = trpc_1.trpc.staffChat.sendMessage.useMutation({
        onSuccess: function () {
            setInput("");
            setReplyTo(null);
            setShowEmojiPicker(false);
            setPendingFile(null);
            refetchMessages();
        },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var editMut = trpc_1.trpc.staffChat.editMessage.useMutation({
        onSuccess: function () {
            setInput("");
            setEditingMsg(null);
            refetchMessages();
            sonner_1.toast.success("Message updated");
        },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var deleteMut = trpc_1.trpc.staffChat.deleteMessage.useMutation({
        onSuccess: function () {
            refetchMessages();
            sonner_1.toast.success("Message deleted");
        },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var createChannelMut = trpc_1.trpc.staffChat.createChannel.useMutation({
        onSuccess: function (data) {
            setShowNewChannelDialog(false);
            setShowNewPrivateDialog(false);
            setNewChannelName("");
            setNewChannelDesc("");
            setNewChannelMembers([]);
            setPrivateRecipient("");
            refetchChannels();
            if (data === null || data === void 0 ? void 0 : data.id)
                setActiveChannelId(data.id);
            sonner_1.toast.success("Channel created");
        },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var messages = (messagesData === null || messagesData === void 0 ? void 0 : messagesData.messages) || [];
    var members = membersData || [];
    // Search
    var searchResults = trpc_1.trpc.staffChat.searchMessages.useQuery({ query: searchQuery, channelId: activeChannelId }, { enabled: showSearch && searchQuery.length > 0 }).data;
    var displayMessages = showSearch && searchQuery.length > 0 && searchResults
        ? JSON.parse(JSON.stringify(searchResults))
        : messages;
    // @mention filtering
    var mentionSuggestions = react_1.useMemo(function () {
        if (mentionQuery === null)
            return [];
        return members.filter(function (m) {
            return m.userName.toLowerCase().includes(mentionQuery.toLowerCase());
        }).slice(0, 6);
    }, [mentionQuery, members]);
    // Auto-scroll
    react_1.useEffect(function () {
        var _a;
        (_a = messagesEndRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);
    var handleSend = function () {
        if (!input.trim() && !pendingFile)
            return;
        if (editingMsg) {
            editMut.mutate({ id: editingMsg.id, content: input });
            return;
        }
        sendMut.mutate({
            content: input.trim() || (pendingFile ? "\uD83D\uDCCE " + pendingFile.name : ""),
            channelId: activeChannelId,
            replyToId: replyTo === null || replyTo === void 0 ? void 0 : replyTo.id,
            fileUrl: pendingFile === null || pendingFile === void 0 ? void 0 : pendingFile.url,
            fileName: pendingFile === null || pendingFile === void 0 ? void 0 : pendingFile.name,
            fileType: pendingFile === null || pendingFile === void 0 ? void 0 : pendingFile.type
        });
    };
    var handleEmojiInsert = function (emoji) {
        setInput(function (prev) { return prev + emoji; });
        setShowEmojiPicker(false);
    };
    var startEdit = function (msg) {
        setEditingMsg(msg);
        setInput(msg.content);
        setReplyTo(null);
    };
    var cancelEdit = function () {
        setEditingMsg(null);
        setInput("");
    };
    var handleFileSelect = function (e) {
        var _a;
        var file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        if (file.size > 5 * 1024 * 1024) {
            sonner_1.toast.error("File too large. Maximum size is 5MB.");
            return;
        }
        var reader = new FileReader();
        reader.onload = function () {
            setPendingFile({
                name: file.name,
                url: reader.result,
                type: file.type.startsWith("image/") ? "image" : "file"
            });
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };
    var handleCreateTeamChannel = function () {
        if (!newChannelName.trim()) {
            sonner_1.toast.error("Channel name required");
            return;
        }
        createChannelMut.mutate({
            name: newChannelName.trim(),
            type: "team",
            description: newChannelDesc.trim() || undefined,
            members: newChannelMembers
        });
    };
    var handleCreatePrivateChat = function () {
        if (!privateRecipient) {
            sonner_1.toast.error("Select a user");
            return;
        }
        var recipient = members.find(function (m) { return m.userId === privateRecipient; });
        var name = currentUserName + " & " + ((recipient === null || recipient === void 0 ? void 0 : recipient.userName) || "User");
        createChannelMut.mutate({
            name: name,
            type: "private",
            members: [privateRecipient]
        });
    };
    var getPrivateChatName = function (channel) {
        if (channel.type !== "private")
            return channel.name;
        // Ensure members is always an array
        var memberIds = [];
        if (typeof channel.members === "string") {
            memberIds = channel.members.split(",").map(function (m) { return m.trim(); }).filter(Boolean);
        }
        else if (Array.isArray(channel.members)) {
            memberIds = channel.members;
        }
        var otherId = memberIds.find(function (id) { return id !== currentUserId; });
        if (otherId) {
            var other = members.find(function (m) { return m.userId === otherId; });
            return (other === null || other === void 0 ? void 0 : other.userName) || "Private Chat";
        }
        return channel.name;
    };
    // Group channels by type
    var generalChannels = channels.filter(function (c) { return c.type === "general"; });
    var teamChannels = channels.filter(function (c) { return c.type === "team"; });
    var privateChannels = channels.filter(function (c) { return c.type === "private"; });
    // Helper to render sidebar content
    var renderSidebatContent = function () { return (React.createElement(React.Fragment, null,
        React.createElement(card_1.CardHeader, { className: "pb-2 space-y-2" },
            React.createElement(card_1.CardTitle, { className: "text-sm flex items-center justify-between" },
                React.createElement("span", { className: "flex items-center gap-2" },
                    React.createElement(lucide_react_1.MessageCircle, { className: "w-4 h-4" }),
                    " Channels"),
                mobileSidebarOpen && (React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-6 w-6 p-0", onClick: function () { return setMobileSidebarOpen(false); } },
                    React.createElement(lucide_react_1.X, { className: "w-4 h-4" })))),
            React.createElement("div", { className: "flex gap-1" },
                React.createElement(button_1.Button, { variant: "outline", size: "sm", className: "flex-1 h-7 text-xs", onClick: function () { return setShowNewChannelDialog(true); } },
                    React.createElement(lucide_react_1.Plus, { className: "w-3 h-3 mr-1" }),
                    " Team"),
                React.createElement(button_1.Button, { variant: "outline", size: "sm", className: "flex-1 h-7 text-xs", onClick: function () { return setShowNewPrivateDialog(true); } },
                    React.createElement(lucide_react_1.UserPlus, { className: "w-3 h-3 mr-1" }),
                    " Private"))),
        React.createElement(card_1.CardContent, { className: "flex-1 overflow-y-auto p-2 space-y-1" },
            generalChannels.map(function (ch) { return (React.createElement("button", { key: ch.id, onClick: function () {
                    setActiveChannelId(ch.id);
                    setMobileSidebarOpen(false);
                }, className: "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition " + (activeChannelId === ch.id ? "bg-primary text-primary-foreground" : "hover:bg-muted") },
                getChannelIcon(ch.type),
                React.createElement("span", { className: "truncate font-medium" }, ch.name))); }),
            teamChannels.length > 0 && (React.createElement(React.Fragment, null,
                React.createElement("div", { className: "px-2 pt-3" },
                    React.createElement("p", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wider" }, "Team Channels")),
                teamChannels.map(function (ch) { return (React.createElement("button", { key: ch.id, onClick: function () {
                        setActiveChannelId(ch.id);
                        setMobileSidebarOpen(false);
                    }, className: "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition " + (activeChannelId === ch.id ? "bg-primary text-primary-foreground" : "hover:bg-muted") },
                    getChannelIcon(ch.type),
                    React.createElement("span", { className: "truncate" }, ch.name))); }))),
            privateChannels.length > 0 && (React.createElement(React.Fragment, null,
                React.createElement("div", { className: "px-2 pt-3" },
                    React.createElement("p", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wider" }, "Direct Messages")),
                privateChannels.map(function (ch) { return (React.createElement("button", { key: ch.id, onClick: function () {
                        setActiveChannelId(ch.id);
                        setMobileSidebarOpen(false);
                    }, className: "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition " + (activeChannelId === ch.id ? "bg-primary text-primary-foreground" : "hover:bg-muted") },
                    getChannelIcon(ch.type),
                    React.createElement("span", { className: "truncate" }, getPrivateChatName(ch)))); }))),
            React.createElement(separator_1.Separator, { className: "my-2" }),
            React.createElement("div", { className: "px-2 pt-1" },
                React.createElement("p", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1" },
                    React.createElement(lucide_react_1.Users, { className: "w-3 h-3" }),
                    " Online (",
                    members.length,
                    ")")),
            members.map(function (m) { return (React.createElement("div", { key: m.userId, className: "flex items-center gap-2 px-3 py-1.5" },
                React.createElement("div", { className: "relative" },
                    React.createElement(avatar_1.Avatar, { className: "w-6 h-6" },
                        React.createElement(avatar_1.AvatarFallback, { className: getAvatarColor(m.userId) + " text-white text-[9px]" }, getInitials(m.userName))),
                    React.createElement("span", { className: "absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 border border-white rounded-full" })),
                React.createElement("span", { className: "text-xs truncate" }, m.userName))); })))); };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Team Chat", description: "Real-time team communication", icon: React.createElement(lucide_react_1.MessageCircle, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Communications" },
            { label: "Team Chat" },
        ] },
        React.createElement("div", { className: "flex gap-3 h-[calc(100vh-220px)] min-h-[500px]" },
            React.createElement(card_1.Card, { className: "hidden md:flex md:w-64 md:flex-shrink-0 md:flex-col" }, renderSidebatContent()),
            mobileSidebarOpen && (React.createElement("div", { className: "fixed inset-0 z-40 bg-black/50 md:hidden", onClick: function () { return setMobileSidebarOpen(false); } },
                React.createElement(card_1.Card, { className: "fixed left-0 top-0 h-full w-64 flex-shrink-0 flex flex-col rounded-none", onClick: function (e) { return e.stopPropagation(); } }, renderSidebatContent()))),
            React.createElement(card_1.Card, { className: "flex-1 flex flex-col" },
                React.createElement(card_1.CardHeader, { className: "border-b pb-3" },
                    React.createElement("div", { className: "flex items-center justify-between gap-3" },
                        React.createElement("div", { className: "flex items-center gap-2 flex-1 min-w-0" },
                            React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 p-0 md:hidden flex-shrink-0", onClick: function () { return setMobileSidebarOpen(!mobileSidebarOpen); } },
                                React.createElement(lucide_react_1.Menu, { className: "h-4 w-4" })),
                            React.createElement("div", { className: "min-w-0 flex-1" },
                                React.createElement(card_1.CardTitle, { className: "flex items-center gap-2 text-base" },
                                    activeChannel && getChannelIcon(activeChannel.type),
                                    activeChannel ? (activeChannel.type === "private" ? getPrivateChatName(activeChannel) : activeChannel.name) : "General Chat"),
                                React.createElement(card_1.CardDescription, null, (activeChannel === null || activeChannel === void 0 ? void 0 : activeChannel.description) || messages.length + " messages"))),
                        React.createElement("div", { className: "flex items-center gap-2 flex-shrink-0" }, showSearch ? (React.createElement("div", { className: "flex items-center gap-1" },
                            React.createElement(input_1.Input, { placeholder: "Search messages...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "h-8 w-40 text-sm", autoFocus: true }),
                            React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "h-8 w-8 p-0", onClick: function () { setShowSearch(false); setSearchQuery(""); } },
                                React.createElement(lucide_react_1.X, { className: "w-4 h-4" })))) : (React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "h-8 w-8 p-0", onClick: function () { return setShowSearch(true); }, title: "Search messages" },
                            React.createElement(lucide_react_1.Search, { className: "w-4 h-4" })))))),
                React.createElement(card_1.CardContent, { className: "flex-1 overflow-y-auto p-4 space-y-1" },
                    displayMessages.length === 0 ? (React.createElement("div", { className: "flex items-center justify-center h-full text-muted-foreground" },
                        React.createElement("div", { className: "text-center" },
                            React.createElement(lucide_react_1.MessageCircle, { className: "w-12 h-12 mx-auto mb-2 opacity-30" }),
                            React.createElement("p", null, "No messages yet. Start the conversation!")))) : (displayMessages.map(function (msg) {
                        var isOwn = msg.userId === currentUserId;
                        return (React.createElement("div", { key: msg.id, className: "flex " + (isOwn ? "justify-end" : "justify-start") + " mb-1" },
                            React.createElement("div", { className: "flex gap-2 max-w-[75%] " + (isOwn ? "flex-row-reverse" : "") },
                                React.createElement(avatar_1.Avatar, { className: "w-8 h-8 flex-shrink-0 mt-1" },
                                    React.createElement(avatar_1.AvatarFallback, { className: getAvatarColor(msg.userId) + " text-white text-[10px]" }, getInitials(msg.userName))),
                                React.createElement("div", { className: "group" },
                                    msg.replyToId && msg.replyToUser && (React.createElement("div", { className: "text-[10px] text-muted-foreground mb-0.5 flex items-center gap-1 " + (isOwn ? "justify-end" : "") },
                                        React.createElement(lucide_react_1.Reply, { className: "w-3 h-3" }),
                                        "Replying to ",
                                        msg.replyToUser)),
                                    React.createElement("div", { className: "px-3 py-2 rounded-2xl " + (isOwn
                                            ? "bg-primary text-primary-foreground rounded-br-md"
                                            : "bg-muted rounded-bl-md") },
                                        !isOwn && (React.createElement("p", { className: "text-xs font-semibold mb-0.5 opacity-80" }, msg.userName)),
                                        msg.fileUrl && (React.createElement("div", { className: "mb-1" }, msg.fileType === "image" ? (React.createElement("img", { src: msg.fileUrl, alt: msg.fileName || "Image", className: "max-w-[250px] max-h-[200px] rounded-lg object-cover" })) : (React.createElement("div", { className: "flex items-center gap-2 p-2 rounded-lg " + (isOwn ? "bg-primary-foreground/10" : "bg-background/50") },
                                            React.createElement(lucide_react_1.FileText, { className: "w-4 h-4 flex-shrink-0" }),
                                            React.createElement("span", { className: "text-xs truncate" }, msg.fileName || "File"),
                                            React.createElement("a", { href: msg.fileUrl, download: msg.fileName, className: "ml-auto" },
                                                React.createElement(lucide_react_1.Download, { className: "w-3.5 h-3.5" })))))),
                                        React.createElement("p", { className: "text-sm break-words whitespace-pre-wrap" }, msg.content.split(/(@\w+(?:\s\w+)?)/g).map(function (part, i) {
                                            return part.startsWith("@") ? (React.createElement("span", { key: i, className: "font-semibold " + (isOwn ? "text-primary-foreground underline" : "text-primary underline") }, part)) : part;
                                        })),
                                        msg.emoji && React.createElement("span", { className: "text-lg" }, msg.emoji),
                                        React.createElement("div", { className: "flex items-center gap-1 mt-1 " + (isOwn ? "text-primary-foreground/60" : "text-muted-foreground") },
                                            React.createElement("p", { className: "text-[10px]" }, new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })),
                                            msg.isEdited === 1 && React.createElement("span", { className: "text-[9px] italic" }, "(edited)"))),
                                    React.createElement("div", { className: "flex gap-1 mt-0.5 opacity-0 group-hover:opacity-100 transition " + (isOwn ? "justify-end" : "") },
                                        React.createElement("button", { className: "p-1 rounded hover:bg-muted text-muted-foreground", onClick: function () { setReplyTo(msg); setEditingMsg(null); }, title: "Reply" },
                                            React.createElement(lucide_react_1.Reply, { className: "w-3 h-3" })),
                                        isOwn && (React.createElement(React.Fragment, null,
                                            React.createElement("button", { className: "p-1 rounded hover:bg-muted text-muted-foreground", onClick: function () { return startEdit(msg); }, title: "Edit" },
                                                React.createElement(lucide_react_1.Pencil, { className: "w-3 h-3" })),
                                            React.createElement("button", { className: "p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive", onClick: function () { return deleteMut.mutate({ id: msg.id }); }, title: "Delete" },
                                                React.createElement(lucide_react_1.Trash2, { className: "w-3 h-3" })))))))));
                    })),
                    React.createElement("div", { ref: messagesEndRef })),
                pendingFile && (React.createElement("div", { className: "px-4 py-2 bg-blue-50 dark:bg-blue-950/30 border-t flex items-center justify-between" },
                    React.createElement("div", { className: "flex items-center gap-2 text-sm" },
                        pendingFile.type === "image" ? React.createElement(lucide_react_1.Image, { className: "w-4 h-4 text-blue-500" }) : React.createElement(lucide_react_1.FileText, { className: "w-4 h-4 text-blue-500" }),
                        React.createElement("span", { className: "font-medium truncate max-w-[300px]" }, pendingFile.name)),
                    React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "h-6 w-6 p-0", onClick: function () { return setPendingFile(null); } },
                        React.createElement(lucide_react_1.X, { className: "w-4 h-4" })))),
                (replyTo || editingMsg) && (React.createElement("div", { className: "px-4 py-2 bg-muted/50 border-t flex items-center justify-between" },
                    React.createElement("div", { className: "flex items-center gap-2 text-sm" }, editingMsg ? (React.createElement(React.Fragment, null,
                        React.createElement(lucide_react_1.Pencil, { className: "w-3 h-3 text-primary" }),
                        React.createElement("span", { className: "text-primary font-medium" }, "Editing message"))) : (React.createElement(React.Fragment, null,
                        React.createElement(lucide_react_1.Reply, { className: "w-3 h-3 text-blue-500" }),
                        React.createElement("span", { className: "text-blue-600 font-medium" },
                            "Replying to ",
                            replyTo.userName),
                        React.createElement("span", { className: "text-muted-foreground truncate max-w-[200px]" }, replyTo.content)))),
                    React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "h-6 w-6 p-0", onClick: function () { setReplyTo(null); cancelEdit(); } },
                        React.createElement(lucide_react_1.X, { className: "w-4 h-4" })))),
                React.createElement("div", { className: "p-3 border-t flex flex-col gap-2 bg-background" },
                    mentionQuery !== null && mentionSuggestions.length > 0 && (React.createElement("div", { className: "bg-popover border rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto" }, mentionSuggestions.map(function (m, idx) { return (React.createElement("button", { key: m.userId, className: "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition " + (idx === mentionIndex ? "bg-accent" : ""), onMouseDown: function (e) {
                            var _a, _b;
                            e.preventDefault();
                            var cursorPos = ((_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.selectionStart) || input.length;
                            var textBefore = input.slice(0, cursorPos);
                            var textAfter = input.slice(cursorPos);
                            var newBefore = textBefore.replace(/@(\w*)$/, "@" + m.userName + " ");
                            setInput(newBefore + textAfter);
                            setMentionQuery(null);
                            (_b = inputRef.current) === null || _b === void 0 ? void 0 : _b.focus();
                        } },
                        React.createElement(avatar_1.Avatar, { className: "w-6 h-6" },
                            React.createElement(avatar_1.AvatarFallback, { className: getAvatarColor(m.userId) + " text-white text-[9px]" }, getInitials(m.userName))),
                        React.createElement("span", { className: "font-medium" }, m.userName))); }))),
                    showEmojiPicker && (React.createElement("div", { className: "p-2 bg-muted rounded-lg grid grid-cols-8 gap-1 max-h-32 overflow-y-auto" }, EMOJI_OPTIONS.map(function (emoji) { return (React.createElement("button", { key: emoji, onClick: function () { return handleEmojiInsert(emoji); }, className: "text-xl p-1 rounded hover:bg-background transition flex-shrink-0" }, emoji)); }))),
                    React.createElement("div", { className: "flex gap-2 items-end" },
                        React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "h-9 w-9 p-0 flex-shrink-0", onClick: function () { return setShowEmojiPicker(!showEmojiPicker); } },
                            React.createElement(lucide_react_1.Smile, { className: "w-4 h-4" })),
                        React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "h-9 w-9 p-0 flex-shrink-0", onClick: function () { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }, title: "Attach file" },
                            React.createElement(lucide_react_1.Paperclip, { className: "w-4 h-4" })),
                        React.createElement("input", { ref: fileInputRef, type: "file", className: "hidden", accept: "image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip", onChange: handleFileSelect }),
                        React.createElement(input_1.Input, { ref: inputRef, placeholder: "Type a message...", value: input, onChange: function (e) {
                                var val = e.target.value;
                                setInput(val);
                                var cursorPos = e.target.selectionStart || val.length;
                                var textBefore = val.slice(0, cursorPos);
                                var atMatch = textBefore.match(/@(\w*)$/);
                                if (atMatch) {
                                    setMentionQuery(atMatch[1]);
                                    setMentionIndex(0);
                                }
                                else {
                                    setMentionQuery(null);
                                }
                            }, onKeyDown: function (e) {
                                var _a;
                                if (mentionQuery !== null && mentionSuggestions.length > 0) {
                                    if (e.key === "ArrowDown") {
                                        e.preventDefault();
                                        setMentionIndex(function (i) { return Math.min(i + 1, mentionSuggestions.length - 1); });
                                        return;
                                    }
                                    if (e.key === "ArrowUp") {
                                        e.preventDefault();
                                        setMentionIndex(function (i) { return Math.max(i - 1, 0); });
                                        return;
                                    }
                                    if (e.key === "Enter" || e.key === "Tab") {
                                        e.preventDefault();
                                        var selected = mentionSuggestions[mentionIndex];
                                        if (selected) {
                                            var cursorPos = ((_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.selectionStart) || input.length;
                                            var textBefore = input.slice(0, cursorPos);
                                            var textAfter = input.slice(cursorPos);
                                            var newBefore = textBefore.replace(/@(\w*)$/, "@" + selected.userName + " ");
                                            setInput(newBefore + textAfter);
                                            setMentionQuery(null);
                                        }
                                        return;
                                    }
                                    if (e.key === "Escape") {
                                        setMentionQuery(null);
                                        return;
                                    }
                                }
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }, disabled: sendMut.isPending || editMut.isPending, className: "flex-1" }),
                        React.createElement(button_1.Button, { onClick: handleSend, disabled: (!input.trim() && !pendingFile) || sendMut.isPending || editMut.isPending, size: "sm", className: "h-9 flex-shrink-0", title: "Send message (Ctrl+Enter)" },
                            React.createElement(lucide_react_1.Send, { className: "w-4 h-4" })))))),
        React.createElement(dialog_1.Dialog, { open: showNewChannelDialog, onOpenChange: setShowNewChannelDialog },
            React.createElement(dialog_1.DialogContent, null,
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Hash, { className: "w-4 h-4" }),
                        " Create Team Channel"),
                    React.createElement(dialog_1.DialogDescription, null, "Create a channel for a department or team (e.g., ICT, Admin, Finance)")),
                React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Channel Name"),
                        React.createElement(input_1.Input, { placeholder: "e.g. ICT Team, Finance, Admin", value: newChannelName, onChange: function (e) { return setNewChannelName(e.target.value); } })),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Description (optional)"),
                        React.createElement(input_1.Input, { placeholder: "What is this channel about?", value: newChannelDesc, onChange: function (e) { return setNewChannelDesc(e.target.value); } })),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Add Members"),
                        React.createElement("div", { className: "border rounded-lg p-2 max-h-[200px] overflow-y-auto space-y-1" }, members.length === 0 ? (React.createElement("p", { className: "text-xs text-muted-foreground p-2" }, "No members found. Start chatting to populate the member list.")) : (members.map(function (m) { return (React.createElement("label", { key: m.userId, className: "flex items-center gap-2 p-1.5 rounded hover:bg-muted cursor-pointer" },
                            React.createElement("input", { type: "checkbox", checked: newChannelMembers.includes(m.userId), onChange: function (e) {
                                    if (e.target.checked) {
                                        setNewChannelMembers(__spreadArrays(newChannelMembers, [m.userId]));
                                    }
                                    else {
                                        setNewChannelMembers(newChannelMembers.filter(function (id) { return id !== m.userId; }));
                                    }
                                }, className: "rounded" }),
                            React.createElement(avatar_1.Avatar, { className: "w-5 h-5" },
                                React.createElement(avatar_1.AvatarFallback, { className: getAvatarColor(m.userId) + " text-white text-[8px]" }, getInitials(m.userName))),
                            React.createElement("span", { className: "text-sm" }, m.userName))); }))),
                        newChannelMembers.length > 0 && (React.createElement("p", { className: "text-xs text-muted-foreground" },
                            newChannelMembers.length,
                            " member(s) selected")))),
                React.createElement(dialog_1.DialogFooter, null,
                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setShowNewChannelDialog(false); } }, "Cancel"),
                    React.createElement(button_1.Button, { onClick: handleCreateTeamChannel, disabled: createChannelMut.isPending }, createChannelMut.isPending ? "Creating..." : "Create Channel")))),
        React.createElement(dialog_1.Dialog, { open: showNewPrivateDialog, onOpenChange: setShowNewPrivateDialog },
            React.createElement(dialog_1.DialogContent, null,
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Lock, { className: "w-4 h-4" }),
                        " New Private Message"),
                    React.createElement(dialog_1.DialogDescription, null, "Start a private conversation with a team member")),
                React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Select User"),
                        React.createElement("div", { className: "border rounded-lg p-2 max-h-[300px] overflow-y-auto space-y-1" },
                            members.filter(function (m) { return m.userId !== currentUserId; }).map(function (m) { return (React.createElement("button", { key: m.userId, onClick: function () { return setPrivateRecipient(m.userId); }, className: "w-full flex items-center gap-2 p-2 rounded-md text-sm transition " + (privateRecipient === m.userId ? "bg-primary text-primary-foreground" : "hover:bg-muted") },
                                React.createElement(avatar_1.Avatar, { className: "w-6 h-6" },
                                    React.createElement(avatar_1.AvatarFallback, { className: getAvatarColor(m.userId) + " text-white text-[9px]" }, getInitials(m.userName))),
                                React.createElement("span", { className: "font-medium" }, m.userName))); }),
                            members.filter(function (m) { return m.userId !== currentUserId; }).length === 0 && (React.createElement("p", { className: "text-xs text-muted-foreground p-2" }, "No other members found. Users who have sent messages will appear here."))))),
                React.createElement(dialog_1.DialogFooter, null,
                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setShowNewPrivateDialog(false); } }, "Cancel"),
                    React.createElement(button_1.Button, { onClick: handleCreatePrivateChat, disabled: createChannelMut.isPending || !privateRecipient }, createChannelMut.isPending ? "Creating..." : "Start Chat"))))));
}
exports["default"] = StaffChat;
