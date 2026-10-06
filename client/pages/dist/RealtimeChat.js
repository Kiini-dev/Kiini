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
var lucide_react_1 = require("lucide-react");
function RealtimeChat() {
    var _a = react_1.useState([
        {
            id: 1,
            user: 'Alice Johnson',
            avatar: '👩',
            message: 'Hey team, just reviewed the Q1 proposal',
            timestamp: '14:32'
        },
        {
            id: 2,
            user: 'Bob Smith',
            avatar: '👨',
            message: 'Great! Any feedback on the financial projections?',
            timestamp: '14:33'
        },
        {
            id: 3,
            user: 'Alice Johnson',
            avatar: '👩',
            message: 'Numbers look solid. I think we should increase marketing budget by 15%',
            timestamp: '14:34'
        },
        {
            id: 4,
            user: 'Charlie Brown',
            avatar: '👨‍💼',
            message: 'Agreed. Let\'s sync up tomorrow to finalize details',
            timestamp: '14:35'
        },
    ]), messages = _a[0], setMessages = _a[1];
    var _b = react_1.useState(''), newMessage = _b[0], setNewMessage = _b[1];
    var handleSendMessage = function () {
        if (newMessage.trim()) {
            setMessages(__spreadArrays(messages, [
                {
                    id: messages.length + 1,
                    user: 'You',
                    avatar: '😊',
                    message: newMessage,
                    timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                },
            ]));
            setNewMessage('');
        }
    };
    return (react_1["default"].createElement("div", { className: "space-y-6" },
        react_1["default"].createElement("h1", { className: "text-3xl font-bold tracking-tight" }, "Team Chat"),
        react_1["default"].createElement("div", { className: "bg-white rounded-lg shadow overflow-hidden flex flex-col h-screen max-h-96" },
            react_1["default"].createElement("div", { className: "p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white" },
                react_1["default"].createElement("h2", { className: "font-semibold" }, "#general"),
                react_1["default"].createElement("p", { className: "text-xs text-blue-100" }, "8 members online")),
            react_1["default"].createElement("div", { className: "flex-1 overflow-y-auto p-4 space-y-4" }, messages.map(function (msg) { return (react_1["default"].createElement("div", { key: msg.id, className: "flex gap-3" },
                react_1["default"].createElement("span", { className: "text-2xl flex-shrink-0" }, msg.avatar),
                react_1["default"].createElement("div", { className: "flex-1" },
                    react_1["default"].createElement("div", { className: "flex items-baseline gap-2" },
                        react_1["default"].createElement("span", { className: "font-semibold text-sm" }, msg.user),
                        react_1["default"].createElement("span", { className: "text-xs text-gray-500" }, msg.timestamp)),
                    react_1["default"].createElement("p", { className: "text-sm text-gray-700 mt-1" }, msg.message)))); })),
            react_1["default"].createElement("div", { className: "p-4 border-t" },
                react_1["default"].createElement("div", { className: "flex gap-2" },
                    react_1["default"].createElement("button", { className: "p-2 text-gray-600 hover:bg-gray-100 rounded" },
                        react_1["default"].createElement(lucide_react_1.Paperclip, { className: "w-5 h-5" })),
                    react_1["default"].createElement("input", { type: "text", value: newMessage, onChange: function (e) { return setNewMessage(e.target.value); }, onKeyDown: function (e) { return e.key === 'Enter' && handleSendMessage(); }, placeholder: "Type a message...", className: "flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" }),
                    react_1["default"].createElement("button", { className: "p-2 text-gray-600 hover:bg-gray-100 rounded" },
                        react_1["default"].createElement(lucide_react_1.Smile, { className: "w-5 h-5" })),
                    react_1["default"].createElement("button", { onClick: handleSendMessage, className: "p-2 bg-blue-600 text-white rounded hover:bg-blue-700" },
                        react_1["default"].createElement(lucide_react_1.Send, { className: "w-5 h-5" }))))),
        react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-4" },
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("h3", { className: "font-semibold mb-3" }, "Active Channels"),
                react_1["default"].createElement("div", { className: "space-y-2" }, ['#general', '#announcements', '#random', '#tech-support'].map(function (channel) { return (react_1["default"].createElement("button", { key: channel, className: "w-full text-left px-3 py-2 hover:bg-gray-100 rounded" }, channel)); }))),
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("h3", { className: "font-semibold mb-3" }, "Team Members"),
                react_1["default"].createElement("div", { className: "space-y-2" }, [
                    { name: 'Alice Johnson', status: 'online' },
                    { name: 'Bob Smith', status: 'online' },
                    { name: 'Charlie Brown', status: 'away' },
                    { name: 'Diana Prince', status: 'offline' },
                ].map(function (member) { return (react_1["default"].createElement("div", { key: member.name, className: "flex items-center gap-2" },
                    react_1["default"].createElement("span", { className: "w-2 h-2 rounded-full " + (member.status === 'online' ? 'bg-green-500' : member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-300') }),
                    react_1["default"].createElement("span", { className: "text-sm" }, member.name))); }))))));
}
exports["default"] = RealtimeChat;
