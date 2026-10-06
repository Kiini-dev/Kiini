"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var OrgLayout_1 = require("@/components/OrgLayout");
var OrgBreadcrumb_1 = require("@/components/OrgBreadcrumb");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
var AI_FEATURES = [
    {
        icon: lucide_react_1.Brain,
        title: "AI Insights",
        description: "Get intelligent summaries and actionable insights from your CRM data, powered by advanced AI analysis.",
        color: "from-purple-600/20 to-purple-600/5",
        iconColor: "text-purple-400",
        href: "/ai"
    },
    {
        icon: lucide_react_1.Sparkles,
        title: "Predictive Analytics",
        description: "Forecast sales trends, predict churn, and identify high-value opportunities before they arise.",
        color: "from-blue-600/20 to-blue-600/5",
        iconColor: "text-blue-400",
        href: "/ai"
    },
    {
        icon: lucide_react_1.FileSearch,
        title: "Document Intelligence",
        description: "Automatically extract, classify, and analyze information from contracts, invoices, and documents.",
        color: "from-teal-600/20 to-teal-600/5",
        iconColor: "text-teal-400",
        href: "/ai"
    },
    {
        icon: lucide_react_1.Zap,
        title: "Smart Automation",
        description: "Automate repetitive tasks, trigger smart workflows, and let AI handle routine operations.",
        color: "from-yellow-600/20 to-yellow-600/5",
        iconColor: "text-yellow-400",
        href: "/ai"
    },
    {
        icon: lucide_react_1.Bot,
        title: "AI Assistant",
        description: "Chat with your data using natural language. Get answers, drafts, and recommendations instantly.",
        color: "from-indigo-600/20 to-indigo-600/5",
        iconColor: "text-indigo-400",
        href: "/ai"
    },
    {
        icon: lucide_react_1.Star,
        title: "Smart Recommendations",
        description: "Receive AI-powered suggestions for next steps, follow-ups, pricing, and client engagement.",
        color: "from-pink-600/20 to-pink-600/5",
        iconColor: "text-pink-400",
        href: "/ai"
    },
];
function AccessDenied(_a) {
    var slug = _a.slug;
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    return (react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
        react_1["default"].createElement(card_1.CardContent, { className: "py-20 text-center" },
            react_1["default"].createElement(lucide_react_1.Lock, { className: "h-12 w-12 text-white/20 mx-auto mb-4" }),
            react_1["default"].createElement("p", { className: "text-white font-semibold text-lg mb-2" }, "Access Restricted"),
            react_1["default"].createElement("p", { className: "text-white/50 text-sm mb-6" }, "AI Hub is not enabled for your organization plan."),
            react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "border-white/20 text-white/70 hover:text-white hover:bg-white/10", onClick: function () { return setLocation("/org/" + slug + "/dashboard"); } }, "Back to Dashboard"))));
}
function OrgAI() {
    var _a;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    var myOrgData = trpc_1.trpc.multiTenancy.getMyOrg.useQuery(undefined, { staleTime: 300000 }).data;
    var featureMap = (_a = myOrgData === null || myOrgData === void 0 ? void 0 : myOrgData.featureMap) !== null && _a !== void 0 ? _a : {};
    var accessGranted = !myOrgData || featureMap.ai_hub;
    return (react_1["default"].createElement(OrgLayout_1["default"], { title: "AI Hub" },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [{ label: "AI Hub" }] }),
                react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-white/50 hover:text-white", onClick: function () { return setLocation("/org/" + slug + "/dashboard"); } },
                    react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-1" }),
                    " Back")),
            !accessGranted ? react_1["default"].createElement(AccessDenied, { slug: slug }) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                react_1["default"].createElement(card_1.Card, { className: "bg-gradient-to-br from-purple-900/40 to-blue-900/30 border-purple-500/20" },
                    react_1["default"].createElement(card_1.CardContent, { className: "py-10 text-center" },
                        react_1["default"].createElement("div", { className: "inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 mb-4" },
                            react_1["default"].createElement(lucide_react_1.Sparkles, { className: "h-8 w-8 text-purple-400" })),
                        react_1["default"].createElement("h2", { className: "text-2xl font-bold text-white mb-2" }, "AI-Powered Intelligence"),
                        react_1["default"].createElement("p", { className: "text-white/60 max-w-lg mx-auto mb-6" }, "Supercharge your operations with advanced AI tools built directly into your CRM platform."),
                        react_1["default"].createElement(button_1.Button, { className: "bg-purple-600 hover:bg-purple-500 text-white", onClick: function () { return setLocation("/org/" + slug + "/ai"); } },
                            react_1["default"].createElement(lucide_react_1.Bot, { className: "h-4 w-4 mr-2" }),
                            " Open AI Workspace"))),
                react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" }, AI_FEATURES.map(function (feature) {
                    var Icon = feature.icon;
                    return (react_1["default"].createElement(card_1.Card, { key: feature.title, className: "bg-gradient-to-br " + feature.color + " border-white/10 hover:border-white/20 transition-colors" },
                        react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                            react_1["default"].createElement("div", { className: "flex items-center gap-3" },
                                react_1["default"].createElement("div", { className: "w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center" },
                                    react_1["default"].createElement(Icon, { className: "h-5 w-5 " + feature.iconColor })),
                                react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-semibold text-white" }, feature.title))),
                        react_1["default"].createElement(card_1.CardContent, null,
                            react_1["default"].createElement("p", { className: "text-sm text-white/60 mb-4 leading-relaxed" }, feature.description),
                            react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-white/50 hover:text-white hover:bg-white/10 px-0 text-xs", onClick: function () { return setLocation("/org/" + slug + feature.href); } },
                                "Open in CRM ",
                                react_1["default"].createElement(lucide_react_1.ExternalLink, { className: "h-3 w-3 ml-1" })))));
                })))))));
}
exports["default"] = OrgAI;
