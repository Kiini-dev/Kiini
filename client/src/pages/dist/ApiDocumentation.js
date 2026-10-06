"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
function ApiDocumentation() {
    var _a, _b, _c, _d, _e;
    var _f = trpc_1.trpc.developerTools.generateApiDocumentation.useQuery({ format: "openapi", version: "1.0" }), docs = _f.data, isLoading = _f.isLoading;
    if (isLoading)
        return React.createElement("div", { className: "flex items-center justify-center min-h-screen" },
            React.createElement(lucide_react_1.Loader2, { className: "w-8 h-8 animate-spin text-green-600" }));
    var d = docs ? JSON.parse(JSON.stringify(docs)) : {};
    var endpoints = (_b = (_a = d.endpoints) !== null && _a !== void 0 ? _a : d.paths) !== null && _b !== void 0 ? _b : [];
    var endpointList = Array.isArray(endpoints) ? endpoints : Object.entries(endpoints).map(function (_a) {
        var path = _a[0], methods = _a[1];
        return (__assign({ path: path }, methods));
    });
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "API Documentation", icon: React.createElement(lucide_react_1.BookOpen, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Tools" }, { label: "API Documentation" }] },
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" }, [
            { label: "Endpoints", value: String(endpointList.length || d.totalEndpoints || 0), icon: lucide_react_1.Code },
            { label: "Format", value: (_c = d.format) !== null && _c !== void 0 ? _c : "OpenAPI", icon: lucide_react_1.Terminal },
            { label: "Version", value: (_d = d.version) !== null && _d !== void 0 ? _d : "1.0", icon: lucide_react_1.BookOpen },
            { label: "Status", value: (_e = d.status) !== null && _e !== void 0 ? _e : "Generated", icon: lucide_react_1.Zap },
        ].map(function (card, idx) { return (React.createElement("div", { key: idx, className: "bg-white p-6 rounded-lg border-2 border-green-200 shadow-md" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", null,
                    React.createElement("p", { className: "text-gray-600 text-sm font-semibold" }, card.label),
                    React.createElement("p", { className: "text-3xl font-bold text-gray-900 mt-2" }, card.value)),
                React.createElement(card.icon, { className: "w-10 h-10 text-green-600 opacity-20" })))); })),
        React.createElement("div", { className: "bg-white p-6 rounded-lg border-2 border-green-200 shadow-md" },
            React.createElement("h2", { className: "text-xl font-bold text-gray-900 mb-4" }, "API Endpoints"),
            endpointList.length === 0 ? (React.createElement("p", { className: "text-gray-500 text-center py-8" }, "No endpoint documentation available.")) : (React.createElement("div", { className: "space-y-3" }, endpointList.slice(0, 20).map(function (ep, idx) {
                var _a, _b, _c, _d, _e;
                return (React.createElement("div", { key: idx, className: "flex items-center gap-4 p-3 bg-gray-50 rounded border-l-4 border-green-500" },
                    ep.method && (React.createElement("span", { className: "px-3 py-1 rounded font-bold text-white text-sm " + (ep.method === "GET" ? "bg-blue-600" :
                            ep.method === "POST" ? "bg-green-600" :
                                ep.method === "PUT" ? "bg-orange-600" :
                                    "bg-red-600") }, ep.method)),
                    React.createElement("div", { className: "flex-1" },
                        React.createElement("p", { className: "font-mono text-sm font-semibold text-gray-900" }, (_c = (_b = (_a = ep.path) !== null && _a !== void 0 ? _a : ep.name) !== null && _b !== void 0 ? _b : ep.endpoint) !== null && _c !== void 0 ? _c : "—"),
                        React.createElement("p", { className: "text-xs text-gray-600" }, (_e = (_d = ep.description) !== null && _d !== void 0 ? _d : ep.summary) !== null && _e !== void 0 ? _e : ""))));
            })))),
        d.documentation && (React.createElement("div", { className: "bg-gray-900 text-white p-6 rounded-lg border-2 border-gray-700 shadow-md" },
            React.createElement("h2", { className: "text-xl font-bold mb-4 flex items-center gap-2" },
                React.createElement(lucide_react_1.Terminal, { className: "w-5 h-5" }),
                " Generated Documentation"),
            React.createElement("pre", { className: "bg-black p-4 rounded text-sm overflow-x-auto text-green-400 whitespace-pre-wrap" }, typeof d.documentation === "string" ? d.documentation : JSON.stringify(d.documentation, null, 2))))));
}
exports["default"] = ApiDocumentation;
