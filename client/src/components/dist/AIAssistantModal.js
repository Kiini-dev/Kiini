"use strict";
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.AIAssistantModal = void 0;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var dialog_1 = require("@/components/ui/dialog");
var scroll_area_1 = require("@/components/ui/scroll-area");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
function AIAssistantModal(_a) {
    var _this = this;
    var isOpen = _a.isOpen, onClose = _a.onClose, context = _a.context;
    var _b = react_1.useState([]), messages = _b[0], setMessages = _b[1];
    var _c = react_1.useState(""), input = _c[0], setInput = _c[1];
    var _d = react_1.useState(false), isLoading = _d[0], setIsLoading = _d[1];
    var _e = react_1.useState(false), isMinimized = _e[0], setIsMinimized = _e[1];
    var scrollRef = react_1.useRef(null);
    react_1.useEffect(function () {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);
    var handleSendMessage = function () { return __awaiter(_this, void 0, void 0, function () {
        var userMessage, aiResponse, aiMessage_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!input.trim())
                        return [2 /*return*/];
                    userMessage = {
                        id: "user-" + Date.now(),
                        sender: "user",
                        content: input,
                        timestamp: new Date()
                    };
                    setMessages(function (prev) { return __spreadArrays(prev, [userMessage]); });
                    setInput("");
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, new Promise(function (resolve) {
                            setTimeout(function () {
                                var responses = [
                                    "I can help you with that! What specific information do you need?",
                                    "That's a great question! Let me provide you with some guidance.",
                                    "I understand. Here's what I can help you with regarding that topic.",
                                    "Perfect! I can assist you with this task. Please provide more details.",
                                ];
                                resolve(responses[Math.floor(Math.random() * responses.length)]);
                            }, 1000);
                        })];
                case 2:
                    aiResponse = _a.sent();
                    aiMessage_1 = {
                        id: "ai-" + Date.now(),
                        sender: "ai",
                        content: aiResponse,
                        timestamp: new Date()
                    };
                    setMessages(function (prev) { return __spreadArrays(prev, [aiMessage_1]); });
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    sonner_1.toast.error("Failed to get AI response");
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleKeyPress = function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    if (isMinimized) {
        return (React.createElement("div", { className: "fixed bottom-4 right-4 z-50" },
            React.createElement(button_1.Button, { onClick: function () { return setIsMinimized(false); }, className: "rounded-full h-12 w-12 p-0 shadow-lg" },
                React.createElement(lucide_react_1.Sparkles, { className: "h-6 w-6" }))));
    }
    return (React.createElement(dialog_1.Dialog, { open: isOpen, onOpenChange: onClose },
        React.createElement(dialog_1.DialogContent, { className: "max-w-2xl h-[600px] flex flex-col p-0" },
            React.createElement(dialog_1.DialogHeader, { className: "border-b p-4" },
                React.createElement("div", { className: "flex items-center justify-between" },
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Sparkles, { className: "h-5 w-5 text-blue-600" }),
                        React.createElement("div", null,
                            React.createElement(dialog_1.DialogTitle, null, "AI Assistant"),
                            React.createElement(dialog_1.DialogDescription, null, "Get instant help and guidance"))),
                    React.createElement("div", { className: "flex gap-2" },
                        React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return setIsMinimized(true); }, title: "Minimize" },
                            React.createElement(lucide_react_1.Minimize2, { className: "h-4 w-4" })),
                        React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: onClose, title: "Close" },
                            React.createElement(lucide_react_1.X, { className: "h-4 w-4" }))))),
            React.createElement(scroll_area_1.ScrollArea, { className: "flex-1 p-4" },
                React.createElement("div", { className: "space-y-4" },
                    messages.length === 0 ? (React.createElement(card_1.Card, { className: "p-6 text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200" },
                        React.createElement(lucide_react_1.Sparkles, { className: "h-12 w-12 mx-auto text-blue-600 mb-4" }),
                        React.createElement("h3", { className: "font-semibold text-lg mb-2" }, "Welcome to AI Assistant"),
                        React.createElement("p", { className: "text-sm text-muted-foreground mb-4" }, "Ask me anything to get instant help with your tasks, explanations, or guidance."),
                        React.createElement("p", { className: "text-xs text-muted-foreground" }, context && "Context: " + context))) : (messages.map(function (message) { return (React.createElement("div", { key: message.id, className: "flex " + (message.sender === "user" ? "justify-end" : "justify-start") },
                        React.createElement("div", { className: "max-w-xs lg:max-w-md px-4 py-2 rounded-lg " + (message.sender === "user"
                                ? "bg-blue-600 text-white rounded-br-none"
                                : "bg-gray-200 text-gray-900 rounded-bl-none") },
                            React.createElement("p", { className: "text-sm" }, message.content),
                            React.createElement("span", { className: "text-xs opacity-70 mt-1 block" }, message.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit"
                            }))))); })),
                    isLoading && (React.createElement("div", { className: "flex justify-start" },
                        React.createElement("div", { className: "bg-gray-200 px-4 py-2 rounded-lg rounded-bl-none" },
                            React.createElement("div", { className: "flex space-x-2" },
                                React.createElement("div", { className: "h-2 w-2 bg-gray-500 rounded-full animate-bounce" }),
                                React.createElement("div", { className: "h-2 w-2 bg-gray-500 rounded-full animate-bounce delay-100" }),
                                React.createElement("div", { className: "h-2 w-2 bg-gray-500 rounded-full animate-bounce delay-200" }))))),
                    React.createElement("div", { ref: scrollRef }))),
            React.createElement("div", { className: "border-t p-4 space-y-2" },
                React.createElement("textarea", { value: input, onChange: function (e) { return setInput(e.target.value); }, onKeyPress: handleKeyPress, placeholder: "Ask me anything...", className: "w-full p-2 border rounded-lg resize-none focus:outline-none focus:border-blue-500", rows: 2 }),
                React.createElement("div", { className: "flex gap-2" },
                    React.createElement(button_1.Button, { onClick: handleSendMessage, disabled: isLoading || !input.trim(), className: "flex-1 gap-2" },
                        React.createElement(lucide_react_1.Send, { className: "h-4 w-4" }),
                        "Send"),
                    React.createElement(button_1.Button, { variant: "outline", onClick: onClose }, "Close"))))));
}
exports.AIAssistantModal = AIAssistantModal;
exports["default"] = AIAssistantModal;
