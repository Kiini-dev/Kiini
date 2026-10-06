"use strict";
exports.__esModule = true;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
function DarkMode() {
    var _a = react_1.useState("auto"), theme = _a[0], setTheme = _a[1];
    var modes = [
        { id: "light", name: "Light Mode", icon: lucide_react_1.Sun, bg: "bg-white", desc: "Bright interface optimal for daytime" },
        { id: "dark", name: "Dark Mode", icon: lucide_react_1.Moon, bg: "bg-gray-900", desc: "Dark interface reduces eye strain" },
        { id: "auto", name: "Auto", icon: lucide_react_1.Monitor, bg: "bg-gray-500", desc: "Switches based on system preference" },
    ];
    return (React.createElement("div", { className: "space-y-6 p-6 bg-gradient-to-br from-slate-50 to-gray-50 min-h-screen" },
        React.createElement("div", null,
            React.createElement("h1", { className: "text-4xl font-bold text-gray-900" }, "Dark Mode"),
            React.createElement("p", { className: "text-gray-600 mt-2" }, "Customize theme preferences and appearance")),
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" }, modes.map(function (mode) { return (React.createElement("button", { key: mode.id, onClick: function () { return setTheme(mode.id); }, className: "p-6 rounded-lg border-2 transition " + (theme === mode.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300") },
            React.createElement(mode.icon, { className: "w-8 h-8 text-gray-900 mb-3" }),
            React.createElement("h3", { className: "font-semibold text-gray-900" }, mode.name),
            React.createElement("p", { className: "text-sm text-gray-600 mt-1" }, mode.desc))); })),
        React.createElement("div", { className: "bg-white p-6 rounded-lg border-2 border-gray-200 shadow-md" },
            React.createElement("h2", { className: "text-xl font-bold text-gray-900 mb-4" }, "Appearance Settings"),
            React.createElement("div", { className: "space-y-4" },
                React.createElement("div", null,
                    React.createElement("label", { className: "block text-sm font-semibold text-gray-700 mb-2" }, "Sync with System"),
                    React.createElement("input", { type: "checkbox", defaultChecked: true, className: "w-4 h-4" }),
                    React.createElement("p", { className: "text-sm text-gray-500 mt-2" }, "Use system theme preference")),
                React.createElement("div", null,
                    React.createElement("label", { className: "block text-sm font-semibold text-gray-700 mb-2" }, "Brightness"),
                    React.createElement("input", { type: "range", min: "0", max: "100", defaultValue: "75", className: "w-full" })),
                React.createElement("div", null,
                    React.createElement("label", { className: "block text-sm font-semibold text-gray-700 mb-2" }, "Accent Color"),
                    React.createElement("div", { className: "flex gap-2" }, ["blue", "purple", "pink", "green"].map(function (color) { return (React.createElement("div", { key: color, className: "w-8 h-8 rounded-full cursor-pointer border-2 border-gray-300", style: { backgroundColor: "var(--color-" + color + ")" } })); }))))),
        React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
            React.createElement("div", { className: "bg-white p-6 rounded-lg border-2 border-gray-200 shadow-md" },
                React.createElement("h2", { className: "text-xl font-bold text-gray-900 mb-4" }, "Light Mode Preview"),
                React.createElement("div", { className: "bg-white border border-gray-300 rounded p-4 space-y-2" },
                    React.createElement("p", { className: "text-gray-900" }, "This is how your interface looks in light mode"),
                    React.createElement("button", { className: "bg-blue-600 text-white px-4 py-2 rounded" }, "Primary Button"))),
            React.createElement("div", { className: "bg-gray-900 p-6 rounded-lg border-2 border-gray-700 shadow-md" },
                React.createElement("h2", { className: "text-xl font-bold text-white mb-4" }, "Dark Mode Preview"),
                React.createElement("div", { className: "bg-gray-800 border border-gray-600 rounded p-4 space-y-2" },
                    React.createElement("p", { className: "text-white" }, "This is how your interface looks in dark mode"),
                    React.createElement("button", { className: "bg-blue-600 text-white px-4 py-2 rounded" }, "Primary Button")))),
        React.createElement("div", { className: "bg-white p-6 rounded-lg border-2 border-gray-200 shadow-md" },
            React.createElement("h2", { className: "text-xl font-bold text-gray-900 mb-4" }, "Usage Statistics"),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" }, [
                { label: "Light Mode", value: "45%", users: "2,847" },
                { label: "Dark Mode", value: "42%", users: "2,623" },
                { label: "Auto", value: "13%", users: "812" },
            ].map(function (stat, idx) { return (React.createElement("div", { key: idx, className: "p-4 bg-gray-50 rounded border border-gray-200" },
                React.createElement("p", { className: "text-sm font-semibold text-gray-700" }, stat.label),
                React.createElement("p", { className: "text-2xl font-bold text-gray-900 mt-2" }, stat.value),
                React.createElement("p", { className: "text-xs text-gray-600" },
                    stat.users,
                    " users"))); })))));
}
exports["default"] = DarkMode;
