"use strict";
exports.__esModule = true;
var react_1 = require("react");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var tabs_1 = require("@/components/ui/tabs");
var card_1 = require("@/components/ui/card");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
var DocumentSummarizer_1 = require("@/components/AI/DocumentSummarizer");
var EmailGenerator_1 = require("@/components/AI/EmailGenerator");
var FinancialAnalyzer_1 = require("@/components/AI/FinancialAnalyzer");
var ChatAssistant_1 = require("@/components/AI/ChatAssistant");
var trpc_1 = require("@/lib/trpc");
function AIHub() {
    var _a;
    var _b = react_1.useState('chat'), activeTab = _b[0], setActiveTab = _b[1];
    var _c = permissions_1.useRequireFeature('ai:access'), allowed = _c.allowed, isLoading = _c.isLoading;
    // Check if GPT-5 API is available
    var aiStatus = trpc_1.trpc.ai.checkAvailability.useQuery({}).data;
    var breadcrumbs = [
        { label: 'Dashboard', href: '/' },
        { label: 'AI Hub' },
    ];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "AI Intelligence Hub", description: "Powered by Groq AI - Automate document analysis, email generation, and financial insights", icon: React.createElement(lucide_react_1.Sparkles, { className: "w-6 h-6" }), breadcrumbs: breadcrumbs },
        React.createElement("div", { className: "space-y-6 max-w-7xl" },
            isLoading && React.createElement("div", { className: "flex items-center justify-center h-screen" },
                React.createElement(spinner_1.Spinner, { className: "size-8" })),
            !isLoading && !allowed && null,
            !(aiStatus === null || aiStatus === void 0 ? void 0 : aiStatus.available) && (React.createElement(alert_1.Alert, null,
                React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4" }),
                React.createElement(alert_1.AlertTitle, null, "AI Features Not Configured"),
                React.createElement(alert_1.AlertDescription, null, "Configure ANTHROPIC_API_KEY environment variable to unlock AI-powered features like document summarization, email generation, and financial analysis. See ENVIRONMENT_SETUP_GUIDE.md for setup details."))),
            (aiStatus === null || aiStatus === void 0 ? void 0 : aiStatus.available) && (React.createElement(alert_1.Alert, null,
                React.createElement(lucide_react_1.Sparkles, { className: "h-4 w-4" }),
                React.createElement(alert_1.AlertTitle, null, "Groq AI Ready"),
                React.createElement(alert_1.AlertDescription, null,
                    "All AI features are enabled. Model: ",
                    aiStatus.model,
                    ". Features: ", (_a = aiStatus.features) === null || _a === void 0 ? void 0 :
                    _a.join(', ')))),
            React.createElement("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Document Summarizer")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("p", { className: "text-xs text-gray-600" }, "Extract key points, action items, and financial summaries from documents"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Email Generator")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("p", { className: "text-xs text-gray-600" }, "Create professional emails in multiple tones for invoices, proposals, and follow-ups"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Financial Analyzer")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("p", { className: "text-xs text-gray-600" }, "Analyze revenue, expenses, cash flow, and profitability with AI insights"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Chat Assistant")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("p", { className: "text-xs text-gray-600" }, "Ask questions, get insights, and query CRM data conversationally")))),
            React.createElement(tabs_1.Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full" },
                React.createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-4" },
                    React.createElement(tabs_1.TabsTrigger, { value: "chat" }, "Chat"),
                    React.createElement(tabs_1.TabsTrigger, { value: "summarize" }, "Summarize"),
                    React.createElement(tabs_1.TabsTrigger, { value: "email" }, "Email"),
                    React.createElement(tabs_1.TabsTrigger, { value: "financial" }, "Financial")),
                React.createElement(tabs_1.TabsContent, { value: "chat", className: "space-y-4" },
                    React.createElement(ChatAssistant_1.AIChatAssistant, null)),
                React.createElement(tabs_1.TabsContent, { value: "summarize", className: "space-y-4" },
                    React.createElement(DocumentSummarizer_1.DocumentSummarizer, null)),
                React.createElement(tabs_1.TabsContent, { value: "email", className: "space-y-4" },
                    React.createElement(EmailGenerator_1.EmailGenerator, null)),
                React.createElement(tabs_1.TabsContent, { value: "financial", className: "space-y-4" },
                    React.createElement(FinancialAnalyzer_1.FinancialAnalyzer, null))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-base" }, "Tips for Best Results")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("ul", { className: "space-y-2 text-sm text-gray-700" },
                        React.createElement("li", null,
                            React.createElement("strong", null, "Documents:"),
                            " Use clear, well-structured text (50+ characters)"),
                        React.createElement("li", null,
                            React.createElement("strong", null, "Emails:"),
                            " Provide specific context about recipients, amounts, and dates"),
                        React.createElement("li", null,
                            React.createElement("strong", null, "Financial:"),
                            " Include numbers with context (e.g., \"January revenue: 50,000 KES\")"),
                        React.createElement("li", null,
                            React.createElement("strong", null, "Chat:"),
                            " Be specific with questions and use context sidebar for better answers")))))));
}
exports["default"] = AIHub;
