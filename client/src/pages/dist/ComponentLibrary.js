"use strict";
exports.__esModule = true;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var components = [
    { name: "Buttons", count: 18, variants: 54 },
    { name: "Inputs", count: 24, variants: 96 },
    { name: "Cards", count: 12, variants: 36 },
    { name: "Modals", count: 8, variants: 24 },
    { name: "Tables", count: 6, variants: 18 },
    { name: "Charts", count: 15, variants: 45 },
];
function ComponentLibrary() {
    var _a = react_1.useState(null), copied = _a[0], setCopied = _a[1];
    var handleCopy = function (text) {
        navigator.clipboard.writeText(text);
        setCopied(text);
        setTimeout(function () { return setCopied(null); }, 2000);
    };
    return (React.createElement("div", { className: "space-y-6 p-6 bg-gradient-to-br from-cyan-50 to-blue-50 min-h-screen" },
        React.createElement("div", { className: "flex items-center justify-between" },
            React.createElement("div", null,
                React.createElement("h1", { className: "text-4xl font-bold text-gray-900" }, "Component Library"),
                React.createElement("p", { className: "text-gray-600 mt-2" }, "Reusable components and patterns")),
            React.createElement(lucide_react_1.Package, { className: "w-12 h-12 text-cyan-600" })),
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" }, [
            { label: "Total Components", value: "83", icon: lucide_react_1.Package },
            { label: "Design Coverage", value: "94.5%", icon: lucide_react_1.Layers },
            { label: "Code Quality", value: "98.2%", icon: lucide_react_1.Copy },
        ].map(function (card, idx) { return (React.createElement("div", { key: idx, className: "bg-white p-6 rounded-lg border-2 border-cyan-200 shadow-md" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", null,
                    React.createElement("p", { className: "text-gray-600 text-sm font-semibold" }, card.label),
                    React.createElement("p", { className: "text-3xl font-bold text-gray-900 mt-2" }, card.value)),
                React.createElement(card.icon, { className: "w-10 h-10 text-cyan-600 opacity-20" })))); })),
        React.createElement("div", { className: "bg-white p-6 rounded-lg border-2 border-cyan-200 shadow-md" },
            React.createElement("h2", { className: "text-xl font-bold text-gray-900 mb-4" }, "Component Categories"),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" }, components.map(function (comp) { return (React.createElement("div", { key: comp.name, className: "p-4 border-2 border-cyan-100 rounded-lg hover:border-cyan-300 transition" },
                React.createElement("p", { className: "text-lg font-semibold text-gray-900" }, comp.name),
                React.createElement("p", { className: "text-sm text-gray-600 mt-1" },
                    comp.count,
                    " components"),
                React.createElement("p", { className: "text-xs text-gray-500 mt-1" },
                    comp.variants,
                    " variants"))); }))),
        React.createElement("div", { className: "bg-white p-6 rounded-lg border-2 border-cyan-200 shadow-md" },
            React.createElement("h2", { className: "text-xl font-bold text-gray-900 mb-4" }, "Component Usage"),
            React.createElement("div", { className: "space-y-3" }, [
                { comp: "Button", usage: 2847, lastUpdated: "2026-03-08" },
                { comp: "Input", usage: 1923, lastUpdated: "2026-03-07" },
                { comp: "Card", usage: 1456, lastUpdated: "2026-03-06" },
                { comp: "Modal", usage: 892, lastUpdated: "2026-03-05" },
                { comp: "Table", usage: 567, lastUpdated: "2026-03-04" },
            ].map(function (item) { return (React.createElement("div", { key: item.comp, className: "flex items-center justify-between p-3 bg-gray-50 rounded" },
                React.createElement("div", null,
                    React.createElement("p", { className: "font-semibold text-gray-900" }, item.comp),
                    React.createElement("p", { className: "text-xs text-gray-600" },
                        item.usage,
                        " usages")),
                React.createElement("p", { className: "text-sm text-gray-500" }, item.lastUpdated))); }))),
        React.createElement("div", { className: "bg-white p-6 rounded-lg border-2 border-cyan-200 shadow-md" },
            React.createElement("h2", { className: "text-xl font-bold text-gray-900 mb-4" }, "Copy Component Import"),
            React.createElement("div", { className: "space-y-2" }, ["Button", "Input", "Card", "Modal"].map(function (comp) { return (React.createElement("div", { key: comp, className: "flex items-center gap-2 p-3 bg-gray-900 text-gray-100 font-mono text-sm rounded" },
                React.createElement("span", null,
                    "import ",
                    "{" + comp + "}" + "} from '@/components';"),
                React.createElement("button", { onClick: function () { return handleCopy("import { " + comp + " } from '@/components';"); }, className: "ml-auto text-cyan-400 hover:text-cyan-300" }, copied === "import { " + comp + " } from '@/components';" ? "✓ Copied" : "Copy"))); })))));
}
exports["default"] = ComponentLibrary;
