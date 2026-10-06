"use strict";
exports.__esModule = true;
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var sonner_1 = require("sonner");
function NlpProcessor() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    var agents = trpc_1.trpc.aiAgents.listAgents.useQuery({ limit: 50 });
    var configureNlp = trpc_1.trpc.aiAgents.implementNlpProcessing.useMutation({
        onSuccess: function () { sonner_1.toast.success("NLP processing configured"); agents.refetch(); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "NLP Processor", icon: React.createElement(lucide_react_1.Brain, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "AI" }, { label: "NLP Processor" }] }, agents.isLoading ? (React.createElement("div", { className: "flex items-center justify-center py-20" },
        React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-indigo-600" }))) : agents.error ? (React.createElement("div", { className: "bg-red-50 text-red-700 p-4 rounded-lg" }, "Failed to load NLP data")) : (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" },
            React.createElement("div", { className: "bg-white p-6 rounded-lg border-2 border-indigo-200 shadow-md" },
                React.createElement("p", { className: "text-gray-600 text-sm font-semibold" }, "Total Agents"),
                React.createElement("p", { className: "text-3xl font-bold text-gray-900 mt-2" }, (_b = (_a = agents.data) === null || _a === void 0 ? void 0 : _a.total) !== null && _b !== void 0 ? _b : 0)),
            React.createElement("div", { className: "bg-white p-6 rounded-lg border-2 border-indigo-200 shadow-md" },
                React.createElement("p", { className: "text-gray-600 text-sm font-semibold" }, "Active"),
                React.createElement("p", { className: "text-3xl font-bold text-gray-900 mt-2" }, ((_d = (_c = agents.data) === null || _c === void 0 ? void 0 : _c.agents) !== null && _d !== void 0 ? _d : []).filter(function (a) { return a.status === "ACTIVE" || a.status === "OPERATIONAL"; }).length)),
            React.createElement("div", { className: "bg-white p-6 rounded-lg border-2 border-indigo-200 shadow-md" },
                React.createElement("p", { className: "text-gray-600 text-sm font-semibold" }, "NLP Tasks"),
                React.createElement("button", { onClick: function () { return configureNlp.mutate({ nlpTasks: ["sentiment_analysis", "entity_extraction", "intent_classification", "summarization"] }); }, disabled: configureNlp.isPending, className: "mt-2 px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:bg-gray-400" }, configureNlp.isPending ? "Configuring..." : "Configure NLP")),
            React.createElement("div", { className: "bg-white p-6 rounded-lg border-2 border-indigo-200 shadow-md" },
                React.createElement("p", { className: "text-gray-600 text-sm font-semibold" }, "Status"),
                React.createElement("p", { className: "text-3xl font-bold text-green-600 mt-2" }, "Ready"))),
        configureNlp.data && (React.createElement("div", { className: "bg-white p-6 rounded-lg border-2 border-green-200 shadow-md" },
            React.createElement("h2", { className: "text-xl font-bold text-gray-900 mb-4" }, "NLP Configuration Result"),
            React.createElement("div", { className: "space-y-3" },
                React.createElement("div", { className: "flex justify-between" },
                    React.createElement("span", { className: "text-gray-700" }, "Config ID"),
                    React.createElement("span", { className: "font-semibold" }, configureNlp.data.nlpConfigId)),
                React.createElement("div", { className: "flex justify-between" },
                    React.createElement("span", { className: "text-gray-700" }, "Status"),
                    React.createElement("span", { className: "font-semibold text-green-600" }, configureNlp.data.status)),
                React.createElement("div", { className: "flex justify-between" },
                    React.createElement("span", { className: "text-gray-700" }, "Tasks"),
                    React.createElement("span", { className: "font-semibold" }, (_e = configureNlp.data.tasks) === null || _e === void 0 ? void 0 : _e.join(", ")))))),
        React.createElement("div", { className: "bg-white p-6 rounded-lg border-2 border-indigo-200 shadow-md" },
            React.createElement("h2", { className: "text-xl font-bold text-gray-900 mb-4" }, "AI Agents"),
            React.createElement("div", { className: "space-y-2" },
                ((_g = (_f = agents.data) === null || _f === void 0 ? void 0 : _f.agents) !== null && _g !== void 0 ? _g : []).map(function (agent) {
                    var _a;
                    return (React.createElement("div", { key: agent.id, className: "flex items-center justify-between p-3 bg-gray-50 rounded" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "font-semibold text-gray-900" }, agent.agentType),
                            React.createElement("p", { className: "text-sm text-gray-600" }, ((_a = agent.capabilities) !== null && _a !== void 0 ? _a : []).join(", "))),
                        React.createElement("span", { className: "px-2 py-1 rounded text-xs font-semibold " + (agent.status === "ACTIVE" || agent.status === "OPERATIONAL" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700") }, agent.status)));
                }),
                ((_k = (_j = (_h = agents.data) === null || _h === void 0 ? void 0 : _h.agents) === null || _j === void 0 ? void 0 : _j.length) !== null && _k !== void 0 ? _k : 0) === 0 && (React.createElement("p", { className: "text-center text-gray-500 py-8" }, "No agents available"))))))));
}
exports["default"] = NlpProcessor;
