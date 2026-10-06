"use strict";
exports.__esModule = true;
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var sonner_1 = require("sonner");
function ChatbotAgent() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    var agents = trpc_1.trpc.aiAgents.listAgents.useQuery({ limit: 50 });
    var createAgent = trpc_1.trpc.aiAgents.configureAutonomousAgent.useMutation({
        onSuccess: function () { sonner_1.toast.success("Agent configured"); agents.refetch(); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var chatbots = ((_b = (_a = agents.data) === null || _a === void 0 ? void 0 : _a.agents) !== null && _b !== void 0 ? _b : []).filter(function (a) { return a.agentType === "chatbot" || a.agentType === "assistant"; });
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Chatbot Agent", icon: React.createElement(lucide_react_1.MessageSquare, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "AI" }, { label: "Chatbot Agent" }] }, agents.isLoading ? (React.createElement("div", { className: "flex items-center justify-center py-20" },
        React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-violet-600" }))) : agents.error ? (React.createElement("div", { className: "bg-red-50 text-red-700 p-4 rounded-lg" }, "Failed to load agents")) : (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" },
            React.createElement("div", { className: "bg-white p-6 rounded-lg border-2 border-violet-200 shadow-md" },
                React.createElement("p", { className: "text-gray-600 text-sm font-semibold" }, "Total Agents"),
                React.createElement("p", { className: "text-3xl font-bold text-gray-900 mt-2" }, (_d = (_c = agents.data) === null || _c === void 0 ? void 0 : _c.total) !== null && _d !== void 0 ? _d : 0)),
            React.createElement("div", { className: "bg-white p-6 rounded-lg border-2 border-violet-200 shadow-md" },
                React.createElement("p", { className: "text-gray-600 text-sm font-semibold" }, "Chatbots"),
                React.createElement("p", { className: "text-3xl font-bold text-gray-900 mt-2" }, chatbots.length)),
            React.createElement("div", { className: "bg-white p-6 rounded-lg border-2 border-violet-200 shadow-md" },
                React.createElement("p", { className: "text-gray-600 text-sm font-semibold" }, "Active"),
                React.createElement("p", { className: "text-3xl font-bold text-gray-900 mt-2" }, ((_f = (_e = agents.data) === null || _e === void 0 ? void 0 : _e.agents) !== null && _f !== void 0 ? _f : []).filter(function (a) { return a.status === "ACTIVE"; }).length)),
            React.createElement("div", { className: "bg-white p-6 rounded-lg border-2 border-violet-200 shadow-md" },
                React.createElement("p", { className: "text-gray-600 text-sm font-semibold" }, "Configure New"),
                React.createElement("button", { onClick: function () { return createAgent.mutate({ agentType: "chatbot", capabilities: ["conversation", "faq", "escalation"] }); }, disabled: createAgent.isPending, className: "mt-2 px-3 py-1 bg-violet-600 text-white rounded text-sm hover:bg-violet-700 disabled:bg-gray-400" }, createAgent.isPending ? "Creating..." : "+ New Chatbot"))),
        React.createElement("div", { className: "bg-white p-6 rounded-lg border-2 border-violet-200 shadow-md" },
            React.createElement("h2", { className: "text-xl font-bold text-gray-900 mb-4" }, "Agents"),
            React.createElement("div", { className: "space-y-2" },
                ((_h = (_g = agents.data) === null || _g === void 0 ? void 0 : _g.agents) !== null && _h !== void 0 ? _h : []).map(function (agent) {
                    var _a;
                    return (React.createElement("div", { key: agent.id, className: "flex items-center justify-between p-3 bg-gray-50 rounded" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "font-semibold text-gray-900" }, agent.agentType),
                            React.createElement("p", { className: "text-sm text-gray-600" }, ((_a = agent.capabilities) !== null && _a !== void 0 ? _a : []).join(", "))),
                        React.createElement("span", { className: "px-2 py-1 rounded text-xs font-semibold " + (agent.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700") }, agent.status)));
                }),
                ((_l = (_k = (_j = agents.data) === null || _j === void 0 ? void 0 : _j.agents) === null || _k === void 0 ? void 0 : _k.length) !== null && _l !== void 0 ? _l : 0) === 0 && (React.createElement("p", { className: "text-center text-gray-500 py-8" }, "No agents configured yet"))))))));
}
exports["default"] = ChatbotAgent;
