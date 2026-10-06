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
exports.FloatingAIChat = void 0;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var scroll_area_1 = require("@/components/ui/scroll-area");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var utils_1 = require("@/lib/utils");
var wouter_1 = require("wouter");
/** Render markdown-like content with clickable links, bold, and line breaks */
function MarkdownContent(_a) {
    var content = _a.content, onNavigate = _a.onNavigate;
    var elements = react_1.useMemo(function () {
        var lines = content.split('\n');
        return lines.map(function (line, li) {
            // Parse inline: [text](url) and **bold**
            var parts = [];
            var regex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
            var lastIndex = 0;
            var match;
            var keyIdx = 0;
            var _loop_1 = function () {
                if (match.index > lastIndex) {
                    parts.push(line.slice(lastIndex, match.index));
                }
                if (match[1] && match[2]) {
                    // Link
                    var linkText = match[1];
                    var href_1 = match[2];
                    var isInternal = href_1.startsWith('/');
                    parts.push(React.createElement("a", { key: li + "-" + keyIdx++, href: href_1, onClick: isInternal ? function (e) { e.preventDefault(); onNavigate(href_1); } : undefined, target: isInternal ? undefined : '_blank', rel: isInternal ? undefined : 'noopener noreferrer', className: "text-blue-400 underline hover:text-blue-300 font-medium cursor-pointer" }, linkText));
                }
                else if (match[3]) {
                    // Bold
                    parts.push(React.createElement("strong", { key: li + "-" + keyIdx++ }, match[3]));
                }
                lastIndex = match.index + match[0].length;
            };
            while ((match = regex.exec(line)) !== null) {
                _loop_1();
            }
            if (lastIndex < line.length) {
                parts.push(line.slice(lastIndex));
            }
            // Handle bullet lines
            var trimmed = line.trimStart();
            var isBullet = trimmed.startsWith('- ') || trimmed.startsWith('• ') || /^\d+\.\s/.test(trimmed);
            return (React.createElement("span", { key: li, className: isBullet ? 'block pl-3' : undefined },
                isBullet && React.createElement("span", { className: "mr-1" }, trimmed.startsWith('-') ? '•' : ''),
                isBullet ? parts.slice(0).map(function (p, i) { return typeof p === 'string' ? p.replace(/^[-•]\s/, '').replace(/^\d+\.\s/, '') : p; }) : parts,
                li < lines.length - 1 && React.createElement("br", null)));
        });
    }, [content, onNavigate]);
    return React.createElement(React.Fragment, null, elements);
}
var CHAT_STORAGE_KEY = 'floating_ai_chat_history';
function FloatingAIChat() {
    var _this = this;
    var _a = react_1.useState(false), isOpen = _a[0], setIsOpen = _a[1];
    var _b = react_1.useState(false), isMinimized = _b[0], setIsMinimized = _b[1];
    var _c = react_1.useState([]), messages = _c[0], setMessages = _c[1];
    var _d = react_1.useState(''), input = _d[0], setInput = _d[1];
    var _e = react_1.useState(false), showHistory = _e[0], setShowHistory = _e[1];
    var scrollRef = react_1.useRef(null);
    var inputRef = react_1.useRef(null);
    var _f = wouter_1.useLocation(), navigate = _f[1];
    // Mutations
    var chatMutation = trpc_1.trpc.ai.chat.useMutation({
        onSuccess: function (data) {
            var msgId = "msg-" + Date.now() + "-assistant";
            var newMessages = __spreadArrays(messages, [
                { id: msgId, role: 'assistant', content: data.message, timestamp: Date.now() },
            ]);
            setMessages(newMessages);
            localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(newMessages));
        },
        onError: function (error) {
            sonner_1.toast.error("Chat error: " + error.message);
        }
    });
    // Load chat history on mount
    react_1.useEffect(function () {
        var storedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
        if (storedMessages) {
            try {
                setMessages(JSON.parse(storedMessages));
            }
            catch (e) {
                console.error('Failed to load chat history:', e);
            }
        }
    }, []);
    // Auto-scroll to bottom
    react_1.useEffect(function () {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);
    // Focus input when chat opens
    react_1.useEffect(function () {
        if (isOpen && !isMinimized && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen, isMinimized]);
    var handleSendMessage = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var userMessage, newMessages;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!input.trim())
                        return [2 /*return*/];
                    userMessage = {
                        id: "msg-" + Date.now() + "-user",
                        role: 'user',
                        content: input,
                        timestamp: Date.now()
                    };
                    newMessages = __spreadArrays(messages, [userMessage]);
                    setMessages(newMessages);
                    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(newMessages));
                    setInput('');
                    return [4 /*yield*/, chatMutation.mutateAsync({
                            message: input
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var clearHistory = function () {
        setMessages([]);
        localStorage.removeItem(CHAT_STORAGE_KEY);
        sonner_1.toast.success('Chat history cleared');
    };
    var loadSampleQuestions = function () {
        var samples = [
            'What are my total pending invoices?',
            'Show me revenue trends',
            'List active projects',
            'How many clients do I have?',
            'What is my cash flow status?',
        ];
        return samples;
    };
    return (React.createElement(React.Fragment, null,
        !isOpen && (React.createElement(button_1.Button, { onClick: function () { return setIsOpen(true); }, className: "fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200 z-40", size: "icon" },
            React.createElement(lucide_react_1.Sparkles, { className: "w-6 h-6" }))),
        isOpen && (React.createElement(card_1.Card, { className: utils_1.cn('fixed bottom-6 right-6 w-96 shadow-2xl z-50 flex flex-col transition-all duration-200', isMinimized ? 'h-14' : 'h-[600px]') },
            React.createElement(card_1.CardHeader, { className: "pb-3 border-b flex flex-row items-center justify-between" },
                React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement(lucide_react_1.Sparkles, { className: "w-5 h-5 text-blue-500" }),
                    React.createElement("div", null,
                        React.createElement(card_1.CardTitle, { className: "text-sm" }, "AI Assistant"),
                        React.createElement(badge_1.Badge, { variant: "outline", className: "text-xs mt-1" }, "Quick Chat"))),
                React.createElement("div", { className: "flex gap-1" },
                    React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { return setIsMinimized(!isMinimized); }, className: "h-8 w-8" }, isMinimized ? React.createElement(lucide_react_1.Maximize2, { className: "w-4 h-4" }) : React.createElement(lucide_react_1.Minimize2, { className: "w-4 h-4" })),
                    React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { return setIsOpen(false); }, className: "h-8 w-8" },
                        React.createElement(lucide_react_1.X, { className: "w-4 h-4" })))),
            !isMinimized && (React.createElement(React.Fragment, null,
                React.createElement(card_1.CardContent, { className: "flex-1 overflow-hidden flex flex-col" }, messages.length === 0 ? (React.createElement("div", { className: "flex-1 flex flex-col items-center justify-center gap-3 py-4" },
                    React.createElement(lucide_react_1.Sparkles, { className: "w-8 h-8 text-muted-foreground" }),
                    React.createElement("p", { className: "text-sm text-center text-muted-foreground" }, "Hi! I'm your AI assistant. Ask me anything about your business."),
                    React.createElement("div", { className: "space-y-2 w-full px-2" }, loadSampleQuestions().map(function (q, i) { return (React.createElement("button", { key: i, onClick: function () { return setInput(q); }, className: "w-full text-left text-xs p-2 bg-muted rounded hover:bg-muted/80 transition-colors" }, q)); })))) : (React.createElement(scroll_area_1.ScrollArea, { className: "flex-1 pr-4" },
                    React.createElement("div", { className: "space-y-4 py-4" },
                        messages.map(function (msg) { return (React.createElement("div", { key: msg.id, className: utils_1.cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start') },
                            React.createElement("div", { className: utils_1.cn('max-w-[80%] p-3 rounded-lg text-sm', msg.role === 'user'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-muted text-muted-foreground') }, msg.role === 'assistant' ? (React.createElement(MarkdownContent, { content: msg.content, onNavigate: function (path) { navigate(path); setIsOpen(false); } })) : (msg.content)))); }),
                        React.createElement("div", { ref: scrollRef }))))),
                messages.length > 0 && (React.createElement("div", { className: "flex gap-2 px-4 py-2 border-t bg-muted/30" },
                    React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return setShowHistory(!showHistory); }, className: "text-xs" },
                        React.createElement(lucide_react_1.History, { className: "w-3 h-3 mr-1" }),
                        "History"),
                    React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: clearHistory, className: "text-xs text-destructive hover:text-destructive" }, "Clear"))),
                React.createElement("form", { onSubmit: handleSendMessage, className: "border-t p-3 bg-muted/30" },
                    React.createElement("div", { className: "flex gap-2" },
                        React.createElement(input_1.Input, { ref: inputRef, placeholder: "Ask me anything...", value: input, onChange: function (e) { return setInput(e.target.value); }, disabled: chatMutation.isPending, className: "text-sm h-9" }),
                        React.createElement(button_1.Button, { type: "submit", size: "icon", disabled: chatMutation.isPending || !input.trim(), className: "h-9 w-9" },
                            React.createElement(lucide_react_1.Send, { className: "w-4 h-4" }))))))))));
}
exports.FloatingAIChat = FloatingAIChat;
