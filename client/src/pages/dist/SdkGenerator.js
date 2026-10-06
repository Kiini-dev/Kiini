"use strict";
exports.__esModule = true;
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
function SdkGenerator() {
    var _a, _b, _c;
    var _d = trpc_1.trpc.developerTools.generateApiDocumentation.useQuery({ format: "openapi", version: "1.0" }), docs = _d.data, isLoading = _d.isLoading;
    var generate = trpc_1.trpc.developerTools.generateSdks.useMutation({ onSuccess: function () { return sonner_1.toast.success("SDK generation triggered"); } });
    if (isLoading)
        return React.createElement("div", { className: "flex items-center justify-center min-h-screen" },
            React.createElement(lucide_react_1.Loader2, { className: "w-8 h-8 animate-spin text-yellow-600" }));
    var d = docs ? JSON.parse(JSON.stringify(docs)) : {};
    var languages = ["JavaScript", "Python", "Java", ".NET", "Go", "Ruby", "PHP", "Swift"];
    return (React.createElement("div", { className: "space-y-6 p-6 bg-gradient-to-br from-yellow-50 to-green-50 min-h-screen" },
        React.createElement("div", { className: "flex items-center justify-between" },
            React.createElement("div", null,
                React.createElement("h1", { className: "text-4xl font-bold text-gray-900" }, "SDK Generator"),
                React.createElement("p", { className: "text-gray-600 mt-2" }, "Generate client SDKs from API documentation")),
            React.createElement(lucide_react_1.Package, { className: "w-12 h-12 text-yellow-600" })),
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" }, [
            { label: "Languages", value: String(languages.length), icon: lucide_react_1.Package },
            { label: "API Version", value: (_a = d.version) !== null && _a !== void 0 ? _a : "1.0", icon: lucide_react_1.Download },
            { label: "Format", value: (_b = d.format) !== null && _b !== void 0 ? _b : "OpenAPI", icon: lucide_react_1.Package },
            { label: "Status", value: (_c = d.status) !== null && _c !== void 0 ? _c : "Ready", icon: lucide_react_1.Package },
        ].map(function (card, idx) { return (React.createElement("div", { key: idx, className: "bg-white p-6 rounded-lg border-2 border-yellow-200 shadow-md" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", null,
                    React.createElement("p", { className: "text-gray-600 text-sm font-semibold" }, card.label),
                    React.createElement("p", { className: "text-3xl font-bold text-gray-900 mt-2" }, card.value)),
                React.createElement(card.icon, { className: "w-10 h-10 text-yellow-600 opacity-20" })))); })),
        React.createElement("div", { className: "bg-white p-6 rounded-lg border-2 border-yellow-200 shadow-md" },
            React.createElement("h2", { className: "text-xl font-bold text-gray-900 mb-4" }, "Generate SDKs"),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" }, languages.map(function (lang) {
                var _a;
                return (React.createElement("div", { key: lang, className: "p-4 border-2 border-yellow-100 rounded-lg hover:border-yellow-300 transition" },
                    React.createElement("div", { className: "flex items-center justify-between mb-2" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "font-semibold text-gray-900" },
                                lang,
                                " SDK"),
                            React.createElement("p", { className: "text-sm text-gray-600" },
                                "API v", (_a = d.version) !== null && _a !== void 0 ? _a : "1.0")),
                        React.createElement("button", { onClick: function () { var _a; return generate.mutate({ language: lang.toLowerCase(), apiVersion: (_a = d.version) !== null && _a !== void 0 ? _a : "1.0", outputFormat: "package" }); }, className: "bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded font-semibold transition" }, "Generate"))));
            })))));
}
exports["default"] = SdkGenerator;
