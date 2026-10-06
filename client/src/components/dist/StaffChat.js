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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.StaffChat = void 0;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var card_1 = require("@/components/ui/card");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
// Common emoji options
var EMOJI_OPTIONS = [
    "👍", "❤️", "😂", "😮", "😢", "😡", "🎉", "🔥",
    "✨", "👏", "💯", "🚀", "💡", "📝", "⏰", "✅",
    "❌", "👀", "🤔", "😴", "🤷", "😎", "🙌", "💪",
];
function StaffChat() {
    var _this = this;
    var _a = react_1.useState([]), messages = _a[0], setMessages = _a[1];
    var _b = react_1.useState(""), input = _b[0], setInput = _b[1];
    var _c = react_1.useState(), selectedEmoji = _c[0], setSelectedEmoji = _c[1];
    var _d = react_1.useState(null), replyTo = _d[0], setReplyTo = _d[1];
    var _e = react_1.useState(false), showEmojiPicker = _e[0], setShowEmojiPicker = _e[1];
    var _f = react_1.useState(""), searchQuery = _f[0], setSearchQuery = _f[1];
    var messagesEndRef = react_1.useRef(null);
    var _g = react_1.useState([]), members = _g[0], setMembers = _g[1];
    var _h = react_1.useState("chat"), activeTab = _h[0], setActiveTab = _h[1];
    var utils = trpc_1.trpc.useUtils();
    // Queries and mutations
    var _j = trpc_1.trpc.staffChat.getMessages.useQuery({
        limit: 50,
        offset: 0
    }), messagesData = _j.data, refetchMessages = _j.refetch;
    var _k = trpc_1.trpc.staffChat.getMembers.useQuery({}), membersData = _k.data, refetchMembers = _k.refetch;
    var sendMessageMutation = trpc_1.trpc.staffChat.sendMessage.useMutation({
        onSuccess: function () {
            setInput("");
            setSelectedEmoji(undefined);
            setReplyTo(null);
            refetchMessages();
            refetchMembers();
            sonner_1.toast.success("Message sent!");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to send message");
        }
    });
    var deleteMessageMutation = trpc_1.trpc.staffChat.deleteMessage.useMutation({
        onSuccess: function () {
            refetchMessages();
            sonner_1.toast.success("Message deleted");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete message");
        }
    });
    var searchMessagesMutation = trpc_1.trpc.staffChat.searchMessages.useMutation();
    // Update state from query data
    react_1.useEffect(function () {
        if (messagesData === null || messagesData === void 0 ? void 0 : messagesData.messages) {
            setMessages(messagesData.messages.map(function (m) { return (__assign(__assign({}, m), { createdAt: new Date(m.createdAt), updatedAt: new Date(m.updatedAt) })); }));
        }
    }, [messagesData]);
    react_1.useEffect(function () {
        if (membersData) {
            setMembers(membersData.map(function (m) { return (__assign(__assign({}, m), { lastSeen: new Date(m.lastSeen) })); }));
        }
    }, [membersData]);
    // Auto-scroll to latest message
    react_1.useEffect(function () {
        var _a;
        (_a = messagesEndRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    // Poll for new messages
    react_1.useEffect(function () {
        var interval = setInterval(function () {
            refetchMessages();
            refetchMembers();
        }, 3000);
        return function () { return clearInterval(interval); };
    }, [refetchMessages, refetchMembers]);
    var handleSendMessage = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!input.trim()) {
                sonner_1.toast.error("Please enter a message");
                return [2 /*return*/];
            }
            sendMessageMutation.mutate({
                content: input,
                emoji: selectedEmoji,
                replyToId: replyTo === null || replyTo === void 0 ? void 0 : replyTo.id
            });
            return [2 /*return*/];
        });
    }); };
    var handleSearch = function (query) { return __awaiter(_this, void 0, void 0, function () {
        var results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setSearchQuery(query);
                    if (!query) return [3 /*break*/, 2];
                    return [4 /*yield*/, searchMessagesMutation.mutateAsync({ query: query })];
                case 1:
                    results = _a.sent();
                    setMessages(results.map(function (m) { return (__assign(__assign({}, m), { createdAt: new Date(m.createdAt), updatedAt: new Date(m.updatedAt) })); }));
                    return [3 /*break*/, 3];
                case 2:
                    refetchMessages();
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var quotedMessage = replyTo ? messages.find(function (m) { return m.id === replyTo.id; }) : null;
    return (React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 h-screen" },
        React.createElement(card_1.Card, { className: "md:col-span-1 flex flex-col" },
            React.createElement(card_1.CardHeader, { className: "pb-3" },
                React.createElement(card_1.CardTitle, { className: "text-lg flex items-center gap-2" },
                    React.createElement(lucide_react_1.Users, { className: "w-4 h-4" }),
                    "Staff Members"),
                React.createElement(card_1.CardDescription, null,
                    members.length,
                    " online")),
            React.createElement(card_1.CardContent, { className: "flex-1 overflow-y-auto space-y-2" }, members.length === 0 ? (React.createElement("p", { className: "text-sm text-gray-500" }, "No members online")) : (members.map(function (member) { return (React.createElement("div", { key: member.userId, className: "flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100" },
                React.createElement("span", { className: "text-sm" }, member.userName),
                React.createElement("span", { className: "w-2 h-2 bg-green-500 rounded-full" }))); })))),
        React.createElement(card_1.Card, { className: "md:col-span-3 flex flex-col" },
            React.createElement(card_1.CardHeader, { className: "pb-3" },
                React.createElement("div", { className: "flex items-center justify-between" },
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.MessageCircle, { className: "w-5 h-5" }),
                        React.createElement(card_1.CardTitle, null, "Team Chat"))),
                React.createElement(card_1.CardDescription, null, "Real-time team communication")),
            React.createElement(card_1.CardContent, { className: "flex-1 flex flex-col gap-4 overflow-hidden" },
                React.createElement(input_1.Input, { placeholder: "Search messages...", value: searchQuery, onChange: function (e) { return handleSearch(e.target.value); }, className: "w-full text-sm" }),
                React.createElement("div", { className: "flex-1 overflow-y-auto space-y-3 pr-2" },
                    messages.length === 0 ? (React.createElement("div", { className: "flex items-center justify-center h-full text-gray-500" },
                        React.createElement("p", null, "No messages yet. Start the conversation!"))) : (messages.map(function (message) { return (React.createElement("div", { key: message.id, className: "group p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition" },
                        message.replyToId && message.replyToUser && (React.createElement("div", { className: "text-xs text-gray-600 mb-1 flex items-center gap-1 pl-2 border-l-2 border-blue-300" },
                            React.createElement(lucide_react_1.Reply, { className: "w-3 h-3" }),
                            "Replying to ",
                            message.replyToUser)),
                        React.createElement("div", { className: "flex items-start justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-semibold text-gray-900" }, message.userName),
                                React.createElement("p", { className: "text-xs text-gray-600" }, new Date(message.createdAt).toLocaleTimeString())),
                            message.emoji && (React.createElement("span", { className: "text-lg" }, message.emoji))),
                        React.createElement("p", { className: "text-sm text-gray-800 mt-1 break-words" }, message.content),
                        React.createElement("div", { className: "flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition" },
                            React.createElement(button_1.Button, { size: "sm", variant: "outline", className: "h-6 text-xs gap-1", onClick: function () { return setReplyTo(message); } },
                                React.createElement(lucide_react_1.Reply, { className: "w-3 h-3" }),
                                "Reply"),
                            React.createElement(button_1.Button, { size: "sm", variant: "outline", className: "h-6 text-xs gap-1", onClick: function () { return deleteMessageMutation.mutate({ id: message.id }); } },
                                React.createElement(lucide_react_1.Trash2, { className: "w-3 h-3" }),
                                "Delete")))); })),
                    React.createElement("div", { ref: messagesEndRef })),
                replyTo && (React.createElement("div", { className: "p-2 bg-blue-50 border-l-4 border-blue-400 rounded flex items-start justify-between" },
                    React.createElement("div", { className: "flex-1" },
                        React.createElement("p", { className: "text-xs font-semibold text-blue-900" },
                            "Replying to ",
                            replyTo.userName),
                        React.createElement("p", { className: "text-xs text-blue-800 truncate" }, replyTo.content)),
                    React.createElement(button_1.Button, { size: "sm", variant: "ghost", className: "h-5 w-5 p-0", onClick: function () { return setReplyTo(null); } },
                        React.createElement(lucide_react_1.X, { className: "w-4 h-4" })))),
                React.createElement("div", { className: "space-y-2 border-t pt-3" },
                    React.createElement("div", { className: "flex gap-2" },
                        React.createElement(input_1.Input, { placeholder: "Type a message...", value: input, onChange: function (e) { return setInput(e.target.value); }, onKeyPress: function (e) {
                                return e.key === "Enter" &&
                                    !e.shiftKey &&
                                    !sendMessageMutation.isPending &&
                                    handleSendMessage();
                            }, disabled: sendMessageMutation.isPending, className: "flex-1" }),
                        React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setShowEmojiPicker(!showEmojiPicker); }, className: "relative" },
                            React.createElement(lucide_react_1.Smile, { className: "w-4 h-4" }),
                            selectedEmoji && (React.createElement("span", { className: "absolute -top-2 -right-2 text-lg" }, selectedEmoji))),
                        React.createElement(button_1.Button, { onClick: handleSendMessage, disabled: sendMessageMutation.isPending || !input.trim(), size: "sm" },
                            React.createElement(lucide_react_1.Send, { className: "w-4 h-4" }))),
                    showEmojiPicker && (React.createElement("div", { className: "grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1 p-2 bg-gray-100 rounded" }, EMOJI_OPTIONS.map(function (emoji) { return (React.createElement("button", { key: emoji, onClick: function () {
                            setSelectedEmoji(emoji);
                            setShowEmojiPicker(false);
                        }, className: "text-xl p-1 rounded hover:bg-gray-200 " + (selectedEmoji === emoji ? "bg-blue-200" : "") }, emoji)); }))),
                    selectedEmoji && (React.createElement("div", { className: "flex items-center justify-between p-2 bg-gray-100 rounded" },
                        React.createElement("span", { className: "text-sm" },
                            "Selected emoji: ",
                            React.createElement("span", { className: "text-lg" }, selectedEmoji)),
                        React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return setSelectedEmoji(undefined); }, className: "h-6 w-6 p-0" },
                            React.createElement(lucide_react_1.X, { className: "w-4 h-4" })))))))));
}
exports.StaffChat = StaffChat;
exports["default"] = StaffChat;
