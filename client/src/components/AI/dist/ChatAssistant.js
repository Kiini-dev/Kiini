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
exports.AIChatAssistant = void 0;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var CHAT_STORAGE_KEY = 'ai_chat_history';
var CONTEXT_STORAGE_KEY = 'ai_chat_context';
function AIChatAssistant() {
    var _this = this;
    var _a = react_1.useState([]), messages = _a[0], setMessages = _a[1];
    var _b = react_1.useState(''), input = _b[0], setInput = _b[1];
    var _c = react_1.useState(''), context = _c[0], setContext = _c[1];
    var _d = react_1.useState(false), isLoading = _d[0], setIsLoading = _d[1];
    var sessionId = react_1.useState("session_" + Date.now())[0];
    var _e = react_1.useState(false), showChatHistory = _e[0], setShowChatHistory = _e[1];
    // Load chat history from localStorage on mount
    react_1.useEffect(function () {
        var storedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
        var storedContext = localStorage.getItem(CONTEXT_STORAGE_KEY);
        if (storedMessages) {
            try {
                var parsed = JSON.parse(storedMessages);
                setMessages(parsed.length > 0 ? parsed : getDefaultMessage());
            }
            catch (_a) {
                setMessages(getDefaultMessage());
            }
        }
        else {
            setMessages(getDefaultMessage());
        }
        if (storedContext) {
            setContext(storedContext);
        }
    }, []);
    var chatMutation = trpc_1.trpc.ai.chat.useMutation({
        onSuccess: function (data) {
            var newMessages = __spreadArrays(messages, [
                { role: 'assistant', content: data.message, timestamp: Date.now() },
            ]);
            setMessages(newMessages);
            // Save to localStorage
            localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(newMessages));
            setInput('');
            sonner_1.toast.success('Response received');
        },
        onError: function (error) {
            sonner_1.toast.error("Chat error: " + error.message);
        }
    });
    var getDefaultMessage = function () { return [
        {
            role: 'assistant',
            content: 'Hello! I\'m your CRM assistant. I can help you with questions about invoices, projects, payments, clients, and more. What would you like to know?',
            timestamp: Date.now()
        },
    ]; };
    // Save messages to localStorage whenever they change
    react_1.useEffect(function () {
        if (messages.length > 0) {
            localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
        }
    }, [messages]);
    var handleSendMessage = function () { return __awaiter(_this, void 0, void 0, function () {
        var userMessage, updatedMessages;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!input.trim()) {
                        sonner_1.toast.error('Please enter a message');
                        return [2 /*return*/];
                    }
                    // Save context to localStorage
                    if (context) {
                        localStorage.setItem(CONTEXT_STORAGE_KEY, context);
                    }
                    userMessage = { role: 'user', content: input, timestamp: Date.now() };
                    updatedMessages = __spreadArrays(messages, [userMessage]);
                    setMessages(updatedMessages);
                    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updatedMessages));
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, chatMutation.mutateAsync({
                            message: input,
                            context: context || undefined,
                            sessionId: sessionId
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleClearHistory = function () {
        var defaultMessage = getDefaultMessage();
        setMessages(defaultMessage);
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(defaultMessage));
        localStorage.removeItem(CONTEXT_STORAGE_KEY);
        setContext('');
        sonner_1.toast.success('Chat history cleared');
    };
    return (React.createElement("div", { className: "grid gap-6 md:grid-cols-3" },
        React.createElement(card_1.Card, { className: "md:col-span-2" },
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                    React.createElement(lucide_react_1.MessageSquare, { className: "w-5 h-5" }),
                    "AI Assistant Chat"),
                React.createElement(card_1.CardDescription, null, "Ask questions about your CRM data")),
            React.createElement(card_1.CardContent, { className: "space-y-4" },
                React.createElement("div", { className: "bg-gray-50 border border-gray-200 rounded-lg p-4 h-96 overflow-y-auto space-y-4" },
                    messages.map(function (message) { return (React.createElement("div", { key: message.role + "-" + message.content.substring(0, 20), className: "flex " + (message.role === 'user' ? 'justify-end' : 'justify-start') },
                        React.createElement("div", { className: "rounded-lg px-4 py-2 max-w-xs " + (message.role === 'user'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white border border-gray-200 text-gray-900') },
                            React.createElement("p", { className: "text-sm whitespace-pre-wrap" }, message.content),
                            message.timestamp && (React.createElement("p", { className: "text-xs mt-1 " + (message.role === 'user' ? 'text-blue-100' : 'text-gray-500') }, new Date(message.timestamp).toLocaleTimeString()))))); }),
                    isLoading && (React.createElement("div", { className: "flex justify-start" },
                        React.createElement("div", { className: "bg-white border border-gray-200 rounded-lg px-4 py-2" },
                            React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin text-gray-600" }))))),
                React.createElement("div", { className: "space-y-2" },
                    React.createElement(label_1.Label, { htmlFor: "message" }, "Your Question"),
                    React.createElement("div", { className: "flex gap-2" },
                        React.createElement(input_1.Input, { id: "message", placeholder: "Ask a question...", value: input, onChange: function (e) { return setInput(e.target.value); }, onKeyPress: function (e) {
                                return e.key === 'Enter' && !isLoading && handleSendMessage();
                            }, disabled: isLoading }),
                        React.createElement(button_1.Button, { onClick: handleSendMessage, disabled: isLoading || !input.trim(), size: "sm" }, isLoading ? (React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin" })) : (React.createElement(lucide_react_1.Send, { className: "h-4 w-4" }))))),
                React.createElement("div", { className: "space-y-2 flex flex-col gap-2" },
                    React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () {
                            var history = localStorage.getItem(CHAT_STORAGE_KEY);
                            if (history) {
                                var messages_1 = JSON.parse(history);
                                var historyText = messages_1
                                    .map(function (msg) {
                                    var timestamp = msg.timestamp
                                        ? new Date(msg.timestamp).toLocaleString()
                                        : 'Unknown time';
                                    return "[" + timestamp + "] " + msg.role.toUpperCase() + ": " + msg.content;
                                })
                                    .join('\n\n');
                                navigator.clipboard.writeText(historyText);
                                sonner_1.toast.success('Chat history copied to clipboard');
                            }
                            else {
                                sonner_1.toast.info('No chat history to copy');
                            }
                        }, className: "w-full flex items-center justify-center gap-2" },
                        React.createElement(lucide_react_1.Copy, { className: "h-4 w-4" }),
                        "Copy History"),
                    React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleClearHistory, className: "w-full flex items-center justify-center gap-2" },
                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }),
                        "Clear History")))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "text-base" }, "Context"),
                React.createElement(card_1.CardDescription, null, "Optional context for better answers")),
            React.createElement(card_1.CardContent, { className: "space-y-4" },
                React.createElement("div", { className: "space-y-2" },
                    React.createElement(label_1.Label, { htmlFor: "context" }, "Additional Context"),
                    React.createElement(textarea_1.Textarea, { id: "context", placeholder: "e.g., Client name: Acme Corp, Project: Website redesign", value: context, onChange: function (e) { return setContext(e.target.value); }, rows: 6, className: "resize-none text-sm" })),
                React.createElement("div", { className: "text-xs text-gray-600 space-y-2" },
                    React.createElement("p", { className: "font-semibold" }, "Quick Questions:"),
                    React.createElement("ul", { className: "list-disc list-inside space-y-1" },
                        React.createElement("li", null, "Show unpaid invoices"),
                        React.createElement("li", null, "Projects over budget"),
                        React.createElement("li", null, "Client payment stats"),
                        React.createElement("li", null, "Revenue this month"),
                        React.createElement("li", null, "Team availability")))))));
}
exports.AIChatAssistant = AIChatAssistant;
