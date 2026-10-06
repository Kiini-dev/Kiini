"use strict";
exports.__esModule = true;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var ModuleLayout_1 = require("@/components/ModuleLayout");
function RealtimeChat() {
    var _a, _b, _c, _d, _e, _f;
    var channelId = react_1.useState("general")[0];
    var _g = react_1.useState(""), newMessage = _g[0], setNewMessage = _g[1];
    var _h = trpc_1.trpc.staffChat.getMessages.useQuery({ channelId: channelId }), msgData = _h.data, isLoading = _h.isLoading, error = _h.error;
    var memberData = trpc_1.trpc.staffChat.getMembers.useQuery().data;
    var utils = trpc_1.trpc.useUtils();
    var sendMessage = trpc_1.trpc.staffChat.sendMessage.useMutation({
        onSuccess: function () {
            setNewMessage("");
            utils.staffChat.getMessages.invalidate();
        },
        onError: function (err) { var _a; return sonner_1.toast.error((_a = err.message) !== null && _a !== void 0 ? _a : "Failed to send message"); }
    });
    var messages = (_c = (_b = (_a = msgData) === null || _a === void 0 ? void 0 : _a.messages) !== null && _b !== void 0 ? _b : msgData) !== null && _c !== void 0 ? _c : [];
    var members = (_f = (_e = (_d = memberData) === null || _d === void 0 ? void 0 : _d.members) !== null && _e !== void 0 ? _e : memberData) !== null && _f !== void 0 ? _f : [];
    var handleSendMessage = function () {
        if (!newMessage.trim())
            return;
        sendMessage.mutate({ content: newMessage, channelId: channelId });
    };
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Team Chat", icon: react_1["default"].createElement(lucide_react_1.MessageSquare, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Communication" },
            { label: "Chat" },
        ] }, isLoading ? (react_1["default"].createElement("div", { className: "flex justify-center py-12" },
        react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))) : error ? (react_1["default"].createElement("div", { className: "bg-red-50 text-red-700 p-4 rounded-lg" }, error.message)) : (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement("div", { className: "bg-white rounded-lg shadow overflow-hidden flex flex-col max-h-96" },
            react_1["default"].createElement("div", { className: "p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white" },
                react_1["default"].createElement("h2", { className: "font-semibold" },
                    "#",
                    channelId),
                react_1["default"].createElement("p", { className: "text-xs text-blue-100" },
                    members.length,
                    " members")),
            react_1["default"].createElement("div", { className: "flex-1 overflow-y-auto p-4 space-y-4" }, messages.length === 0 ? (react_1["default"].createElement("p", { className: "text-center text-gray-500 py-8" }, "No messages yet")) : (messages.map(function (msg) {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                return (react_1["default"].createElement("div", { key: msg.id, className: "flex gap-3" },
                    react_1["default"].createElement("span", { className: "text-2xl flex-shrink-0" }, (_a = msg.avatar) !== null && _a !== void 0 ? _a : "\uD83D\uDCAC"),
                    react_1["default"].createElement("div", { className: "flex-1" },
                        react_1["default"].createElement("div", { className: "flex items-baseline gap-2" },
                            react_1["default"].createElement("span", { className: "font-semibold text-sm" }, (_d = (_c = (_b = msg.user) !== null && _b !== void 0 ? _b : msg.senderName) !== null && _c !== void 0 ? _c : msg.userName) !== null && _d !== void 0 ? _d : "\u2014"),
                            react_1["default"].createElement("span", { className: "text-xs text-gray-500" }, (_f = (_e = msg.timestamp) !== null && _e !== void 0 ? _e : msg.createdAt) !== null && _f !== void 0 ? _f : "")),
                        react_1["default"].createElement("p", { className: "text-sm text-gray-700 mt-1" }, (_h = (_g = msg.message) !== null && _g !== void 0 ? _g : msg.content) !== null && _h !== void 0 ? _h : ""))));
            }))),
            react_1["default"].createElement("div", { className: "p-4 border-t" },
                react_1["default"].createElement("div", { className: "flex gap-2" },
                    react_1["default"].createElement("button", { className: "p-2 text-gray-600 hover:bg-gray-100 rounded" },
                        react_1["default"].createElement(lucide_react_1.Paperclip, { className: "w-5 h-5" })),
                    react_1["default"].createElement("input", { type: "text", value: newMessage, onChange: function (e) { return setNewMessage(e.target.value); }, onKeyDown: function (e) { return e.key === "Enter" && handleSendMessage(); }, placeholder: "Type a message...", className: "flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" }),
                    react_1["default"].createElement("button", { onClick: handleSendMessage, disabled: sendMessage.isPending || !newMessage.trim(), className: "p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50" },
                        react_1["default"].createElement(lucide_react_1.Send, { className: "w-5 h-5" }))))),
        members.length > 0 && (react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
            react_1["default"].createElement("h3", { className: "font-semibold mb-3" }, "Team Members"),
            react_1["default"].createElement("div", { className: "space-y-2" }, members.map(function (member) {
                var _a, _b;
                return (react_1["default"].createElement("div", { key: (_a = member.id) !== null && _a !== void 0 ? _a : member.name, className: "flex items-center gap-2" },
                    react_1["default"].createElement("span", { className: "w-2 h-2 rounded-full " + (member.status === "online"
                            ? "bg-green-500"
                            : member.status === "away"
                                ? "bg-yellow-500"
                                : "bg-gray-300") }),
                    react_1["default"].createElement("span", { className: "text-sm" }, (_b = member.name) !== null && _b !== void 0 ? _b : "\u2014")));
            }))))))));
}
exports["default"] = RealtimeChat;
