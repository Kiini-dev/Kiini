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
exports.ChatInterface = void 0;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
exports.ChatInterface = function (_a) {
    var initialSessionId = _a.sessionId, _b = _a.title, title = _b === void 0 ? "AI Chat Assistant" : _b, onSessionChange = _a.onSessionChange;
    var _c = react_1.useState([]), messages = _c[0], setMessages = _c[1];
    var _d = react_1.useState(""), input = _d[0], setInput = _d[1];
    var _e = react_1.useState(false), isLoading = _e[0], setIsLoading = _e[1];
    var _f = react_1.useState(null), copiedId = _f[0], setCopiedId = _f[1];
    var _g = react_1.useState(initialSessionId), sessionId = _g[0], setSessionId = _g[1];
    var messagesEndRef = react_1.useRef(null);
    // TRPC mutations
    var createSessionMutation = trpc_1.trpc.ai.createChatSession.useMutation();
    var chatMutation = trpc_1.trpc.ai.chat.useMutation();
    var getChatHistoryQuery = trpc_1.trpc.ai.getChatHistory.useQuery({ sessionId: sessionId || "" }, { enabled: !!sessionId });
    // Load chat history
    react_1.useEffect(function () {
        if (getChatHistoryQuery.data) {
            setMessages(getChatHistoryQuery.data);
        }
    }, [getChatHistoryQuery.data]);
    // Auto scroll to bottom
    react_1.useEffect(function () {
        var _a;
        (_a = messagesEndRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    var handleSendMessage = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var currentSessionId, result, userMessage_1, response, assistantMessage_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!input.trim())
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    setIsLoading(true);
                    currentSessionId = sessionId;
                    if (!!currentSessionId) return [3 /*break*/, 3];
                    return [4 /*yield*/, createSessionMutation.mutateAsync({
                            title: title || "Chat Session"
                        })];
                case 2:
                    result = _a.sent();
                    currentSessionId = result.id;
                    setSessionId(currentSessionId);
                    onSessionChange === null || onSessionChange === void 0 ? void 0 : onSessionChange(currentSessionId);
                    _a.label = 3;
                case 3:
                    userMessage_1 = {
                        id: Math.random().toString(),
                        role: "user",
                        content: input,
                        createdAt: new Date().toISOString()
                    };
                    setMessages(function (prev) { return __spreadArrays(prev, [userMessage_1]); });
                    setInput("");
                    return [4 /*yield*/, chatMutation.mutateAsync({
                            message: input,
                            sessionId: currentSessionId
                        })];
                case 4:
                    response = _a.sent();
                    assistantMessage_1 = {
                        id: response.id || Math.random().toString(),
                        role: "assistant",
                        content: response.message,
                        createdAt: response.createdAt || new Date().toISOString(),
                        tokensUsed: response.tokensUsed
                    };
                    setMessages(function (prev) { return __spreadArrays(prev, [assistantMessage_1]); });
                    return [3 /*break*/, 7];
                case 5:
                    error_1 = _a.sent();
                    console.error("Error sending message:", error_1);
                    return [3 /*break*/, 7];
                case 6:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleCopyMessage = function (id, content) {
        navigator.clipboard.writeText(content);
        setCopiedId(id);
        setTimeout(function () { return setCopiedId(null); }, 2000);
    };
    return (react_1["default"].createElement("div", { className: "flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700" },
        react_1["default"].createElement("div", { className: "px-6 py-4 border-b border-gray-200 dark:border-gray-700" },
            react_1["default"].createElement("h2", { className: "text-lg font-semibold text-gray-900 dark:text-white" }, title),
            sessionId && (react_1["default"].createElement("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1" },
                "Session: ",
                sessionId.substring(0, 8),
                "..."))),
        react_1["default"].createElement("div", { className: "flex-1 overflow-y-auto p-6 space-y-4" },
            messages.length === 0 && !isLoading && (react_1["default"].createElement("div", { className: "flex items-center justify-center h-full text-center text-gray-500 dark:text-gray-400" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("p", { className: "text-lg font-medium mb-2" }, "Start a conversation"),
                    react_1["default"].createElement("p", { className: "text-sm" }, "Ask anything or describe what you need help with.")))),
            messages.map(function (msg) { return (react_1["default"].createElement("div", { key: msg.id, className: "flex " + (msg.role === "user" ? "justify-end" : "justify-start") },
                react_1["default"].createElement("div", { className: "max-w-xs lg:max-w-md px-4 py-2 rounded-lg " + (msg.role === "user"
                        ? "bg-blue-600 dark:bg-blue-700 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100") },
                    react_1["default"].createElement("p", { className: "text-sm whitespace-pre-wrap break-words" }, msg.content),
                    msg.tokensUsed && (react_1["default"].createElement("p", { className: "text-xs opacity-75 mt-1" },
                        "Tokens: ",
                        msg.tokensUsed)),
                    msg.role === "assistant" && (react_1["default"].createElement("button", { onClick: function () { return handleCopyMessage(msg.id, msg.content); }, className: "mt-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors", title: "Copy message" }, copiedId === msg.id ? (react_1["default"].createElement(lucide_react_1.Check, { className: "w-4 h-4" })) : (react_1["default"].createElement(lucide_react_1.Copy, { className: "w-4 h-4" }))))))); }),
            isLoading && (react_1["default"].createElement("div", { className: "flex justify-start" },
                react_1["default"].createElement("div", { className: "bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg" },
                    react_1["default"].createElement(lucide_react_1.Loader, { className: "w-5 h-5 animate-spin text-gray-600 dark:text-gray-400" })))),
            react_1["default"].createElement("div", { ref: messagesEndRef })),
        react_1["default"].createElement("div", { className: "border-t border-gray-200 dark:border-gray-700 p-4" },
            react_1["default"].createElement("form", { onSubmit: handleSendMessage, className: "flex gap-2" },
                react_1["default"].createElement(input_1.Input, { value: input, onChange: function (e) { return setInput(e.target.value); }, placeholder: "Type your message...", disabled: isLoading, className: "flex-1" }),
                react_1["default"].createElement(button_1.Button, { type: "submit", disabled: isLoading || !input.trim(), size: "icon" }, isLoading ? (react_1["default"].createElement(lucide_react_1.Loader, { className: "w-4 h-4 animate-spin" })) : (react_1["default"].createElement(lucide_react_1.Send, { className: "w-4 h-4" })))))));
};
exports["default"] = exports.ChatInterface;
