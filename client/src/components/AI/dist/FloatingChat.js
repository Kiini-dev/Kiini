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
var textarea_1 = require("@/components/ui/textarea");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var CHAT_STORAGE_KEY = 'ai_floating_chat_history';
var FLOAT_MINIMIZED_KEY = 'ai_float_minimized';
function FloatingAIChat(_a) {
    var _this = this;
    var onClose = _a.onClose;
    var _b = react_1.useState(true), isOpen = _b[0], setIsOpen = _b[1];
    var _c = react_1.useState(false), isMinimized = _c[0], setIsMinimized = _c[1];
    var _d = react_1.useState([]), messages = _d[0], setMessages = _d[1];
    var _e = react_1.useState(''), input = _e[0], setInput = _e[1];
    var _f = react_1.useState(''), context = _f[0], setContext = _f[1];
    var _g = react_1.useState('chat'), activeTab = _g[0], setActiveTab = _g[1];
    var _h = react_1.useState(false), isLoading = _h[0], setIsLoading = _h[1];
    var messagesEndRef = react_1.useRef(null);
    // Load chat history on mount
    react_1.useEffect(function () {
        var stored = localStorage.getItem(CHAT_STORAGE_KEY);
        var minimized = localStorage.getItem(FLOAT_MINIMIZED_KEY) === 'true';
        if (stored) {
            try {
                setMessages(JSON.parse(stored));
            }
            catch (_a) {
                setMessages(getDefaultMessage());
            }
        }
        else {
            setMessages(getDefaultMessage());
        }
        setIsMinimized(minimized);
    }, []);
    // Save chat to localStorage
    react_1.useEffect(function () {
        if (messages.length > 0) {
            localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
        }
    }, [messages]);
    // Save minimized state
    react_1.useEffect(function () {
        localStorage.setItem(FLOAT_MINIMIZED_KEY, isMinimized ? 'true' : 'false');
    }, [isMinimized]);
    var scrollToBottom = function () {
        var _a;
        (_a = messagesEndRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth' });
    };
    react_1.useEffect(function () {
        scrollToBottom();
    }, [messages]);
    var chatMutation = trpc_1.trpc.ai.chat.useMutation({
        onSuccess: function (data) {
            setMessages(function (prev) { return __spreadArrays(prev, [{ role: 'assistant', content: data.message, timestamp: Date.now() }]); });
            setIsLoading(false);
            sonner_1.toast.success('Response received');
        },
        onError: function (error) {
            sonner_1.toast.error("Error: " + error.message);
            setIsLoading(false);
        }
    });
    var summarizeMutation = trpc_1.trpc.ai.summarize.useMutation({
        onSuccess: function (data) {
            setMessages(function (prev) { return __spreadArrays(prev, [{ role: 'assistant', content: data.summary, timestamp: Date.now() }]); });
            setIsLoading(false);
            sonner_1.toast.success('Document summarized');
        },
        onError: function (error) {
            sonner_1.toast.error("Error: " + error.message);
            setIsLoading(false);
        }
    });
    var emailMutation = trpc_1.trpc.ai.generateEmail.useMutation({
        onSuccess: function (data) {
            setMessages(function (prev) { return __spreadArrays(prev, [{ role: 'assistant', content: "Email Generated:\n\n" + data.email, timestamp: Date.now() }]); });
            setIsLoading(false);
            sonner_1.toast.success('Email generated');
        },
        onError: function (error) {
            sonner_1.toast.error("Error: " + error.message);
            setIsLoading(false);
        }
    });
    var financialMutation = trpc_1.trpc.ai.analyzeFinancials.useMutation({
        onSuccess: function (data) {
            setMessages(function (prev) { return __spreadArrays(prev, [{ role: 'assistant', content: data.analysis, timestamp: Date.now() }]); });
            setIsLoading(false);
            sonner_1.toast.success('Analysis complete');
        },
        onError: function (error) {
            sonner_1.toast.error("Error: " + error.message);
            setIsLoading(false);
        }
    });
    var getDefaultMessage = function () { return [
        {
            role: 'assistant',
            content: 'Hello! I\'m your AI assistant with quick access to all tools: Chat, Document Summarization, Email Generation, and Financial Analysis. What can I help you with?',
            timestamp: Date.now()
        },
    ]; };
    var handleSendMessage = function () { return __awaiter(_this, void 0, void 0, function () {
        var userMsg, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!input.trim()) {
                        sonner_1.toast.error('Please enter a message');
                        return [2 /*return*/];
                    }
                    userMsg = { role: 'user', content: input, timestamp: Date.now() };
                    setMessages(function (prev) { return __spreadArrays(prev, [userMsg]); });
                    setIsLoading(true);
                    setInput('');
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, chatMutation.mutateAsync({
                            message: input,
                            context: context || undefined
                        })];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    setIsLoading(false);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleSummarize = function () { return __awaiter(_this, void 0, void 0, function () {
        var userMsg, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!input.trim() || input.length < 20) {
                        sonner_1.toast.error('Please provide a longer document to summarize');
                        return [2 /*return*/];
                    }
                    userMsg = { role: 'user', content: "Summarize this: " + input, timestamp: Date.now() };
                    setMessages(function (prev) { return __spreadArrays(prev, [userMsg]); });
                    setIsLoading(true);
                    setInput('');
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, summarizeMutation.mutateAsync({
                            documentContent: input
                        })];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    setIsLoading(false);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleGenerateEmail = function () { return __awaiter(_this, void 0, void 0, function () {
        var userMsg, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!input.trim()) {
                        sonner_1.toast.error('Please provide content for the email');
                        return [2 /*return*/];
                    }
                    userMsg = { role: 'user', content: "Generate email: " + input, timestamp: Date.now() };
                    setMessages(function (prev) { return __spreadArrays(prev, [userMsg]); });
                    setIsLoading(true);
                    setInput('');
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, emailMutation.mutateAsync({
                            description: input,
                            tone: 'professional'
                        })];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    setIsLoading(false);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleAnalyzeFinancials = function () { return __awaiter(_this, void 0, void 0, function () {
        var userMsg, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!input.trim()) {
                        sonner_1.toast.error('Please provide financial data description');
                        return [2 /*return*/];
                    }
                    userMsg = { role: 'user', content: "Analyze: " + input, timestamp: Date.now() };
                    setMessages(function (prev) { return __spreadArrays(prev, [userMsg]); });
                    setIsLoading(true);
                    setInput('');
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, financialMutation.mutateAsync({
                            dataDescription: input,
                            metricType: 'revenue_analysis'
                        })];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    setIsLoading(false);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    if (!isOpen) {
        return (React.createElement(button_1.Button, { onClick: function () { return setIsOpen(true); }, className: "fixed bottom-4 right-4 rounded-full h-14 w-14 shadow-lg", size: "icon" },
            React.createElement(lucide_react_1.MessageSquare, { className: "h-6 w-6" })));
    }
    return (React.createElement("div", { className: "fixed bottom-4 right-4 w-96 max-h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50" },
        React.createElement("div", { className: "bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between" },
            React.createElement("div", { className: "flex items-center gap-2" },
                React.createElement(lucide_react_1.MessageSquare, { className: "h-5 w-5" }),
                React.createElement("span", { className: "font-semibold" }, "AI Assistant")),
            React.createElement("div", { className: "flex gap-2" },
                React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return setIsMinimized(!isMinimized); }, className: "text-white hover:bg-blue-700" }, isMinimized ? React.createElement(lucide_react_1.Maximize2, { className: "h-4 w-4" }) : React.createElement(lucide_react_1.Minimize2, { className: "h-4 w-4" })),
                React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () {
                        setIsOpen(false);
                        onClose === null || onClose === void 0 ? void 0 : onClose();
                    }, className: "text-white hover:bg-blue-700" },
                    React.createElement(lucide_react_1.X, { className: "h-4 w-4" })))),
        !isMinimized && (React.createElement(React.Fragment, null,
            React.createElement("div", { className: "flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" },
                messages.map(function (msg, idx) { return (React.createElement("div", { key: idx, className: "flex " + (msg.role === 'user' ? 'justify-end' : 'justify-start') },
                    React.createElement("div", { className: "rounded-lg px-3 py-2 max-w-xs text-sm " + (msg.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white border border-gray-200 text-gray-900') },
                        React.createElement("p", { className: "whitespace-pre-wrap break-words" }, msg.content),
                        msg.timestamp && (React.createElement("p", { className: "text-xs mt-1 " + (msg.role === 'user' ? 'text-blue-100' : 'text-gray-400') }, new Date(msg.timestamp).toLocaleTimeString()))))); }),
                isLoading && (React.createElement("div", { className: "flex justify-start" },
                    React.createElement("div", { className: "bg-white border border-gray-200 rounded-lg px-3 py-2" },
                        React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin text-blue-500" })))),
                React.createElement("div", { ref: messagesEndRef })),
            React.createElement(tabs_1.Tabs, { value: activeTab, onValueChange: setActiveTab, className: "border-t" },
                React.createElement(tabs_1.TabsList, { className: "w-full grid grid-cols-4 rounded-none" },
                    React.createElement(tabs_1.TabsTrigger, { value: "chat", className: "text-xs" }, "Chat"),
                    React.createElement(tabs_1.TabsTrigger, { value: "summarize", className: "text-xs" }, "Summarize"),
                    React.createElement(tabs_1.TabsTrigger, { value: "email", className: "text-xs" }, "Email"),
                    React.createElement(tabs_1.TabsTrigger, { value: "financial", className: "text-xs" }, "Analysis")),
                React.createElement(tabs_1.TabsContent, { value: "chat", className: "p-3" },
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(textarea_1.Textarea, { placeholder: "Ask a question...", value: input, onChange: function (e) { return setInput(e.target.value); }, onKeyDown: function (e) { return e.key === 'Enter' && !e.shiftKey && handleSendMessage(); }, disabled: isLoading, className: "resize-none h-20 text-sm" }),
                        React.createElement(button_1.Button, { onClick: handleSendMessage, disabled: isLoading || !input.trim(), className: "w-full text-sm", size: "sm" },
                            isLoading ? React.createElement(lucide_react_1.Loader2, { className: "h-3 w-3 animate-spin mr-2" }) : React.createElement(lucide_react_1.Send, { className: "h-3 w-3 mr-2" }),
                            "Send"))),
                React.createElement(tabs_1.TabsContent, { value: "summarize", className: "p-3" },
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(textarea_1.Textarea, { placeholder: "Paste content to summarize...", value: input, onChange: function (e) { return setInput(e.target.value); }, disabled: isLoading, className: "resize-none h-20 text-sm" }),
                        React.createElement(button_1.Button, { onClick: handleSummarize, disabled: isLoading || input.length < 20, className: "w-full text-sm", size: "sm" },
                            isLoading ? React.createElement(lucide_react_1.Loader2, { className: "h-3 w-3 animate-spin mr-2" }) : React.createElement(lucide_react_1.FileText, { className: "h-3 w-3 mr-2" }),
                            "Summarize"))),
                React.createElement(tabs_1.TabsContent, { value: "email", className: "p-3" },
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(textarea_1.Textarea, { placeholder: "Describe the email purpose...", value: input, onChange: function (e) { return setInput(e.target.value); }, disabled: isLoading, className: "resize-none h-20 text-sm" }),
                        React.createElement(button_1.Button, { onClick: handleGenerateEmail, disabled: isLoading || !input.trim(), className: "w-full text-sm", size: "sm" },
                            isLoading ? React.createElement(lucide_react_1.Loader2, { className: "h-3 w-3 animate-spin mr-2" }) : React.createElement(lucide_react_1.Mail, { className: "h-3 w-3 mr-2" }),
                            "Generate"))),
                React.createElement(tabs_1.TabsContent, { value: "financial", className: "p-3" },
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(textarea_1.Textarea, { placeholder: "Describe financial data to analyze...", value: input, onChange: function (e) { return setInput(e.target.value); }, disabled: isLoading, className: "resize-none h-20 text-sm" }),
                        React.createElement(button_1.Button, { onClick: handleAnalyzeFinancials, disabled: isLoading || input.length < 20, className: "w-full text-sm", size: "sm" },
                            isLoading ? React.createElement(lucide_react_1.Loader2, { className: "h-3 w-3 animate-spin mr-2" }) : React.createElement(lucide_react_1.TrendingUp, { className: "h-3 w-3 mr-2" }),
                            "Analyze"))))))));
}
exports.FloatingAIChat = FloatingAIChat;
