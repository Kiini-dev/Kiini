"use strict";
exports.__esModule = true;
exports.ModuleCard = void 0;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
exports.ModuleCard = function (_a) {
    var title = _a.title, description = _a.description, Icon = _a.icon, onClick = _a.onClick, badge = _a.badge, _b = _a.disabled, disabled = _b === void 0 ? false : _b, _c = _a.comingSoon, comingSoon = _c === void 0 ? false : _c;
    return (react_1["default"].createElement("button", { onClick: onClick, disabled: disabled || comingSoon, className: utils_1.cn("group relative overflow-hidden rounded-lg border-2 border-gray-200 p-6 text-left transition-all duration-300", "hover:border-blue-500 hover:shadow-lg dark:border-gray-700 dark:hover:border-blue-400", "disabled:opacity-50 disabled:cursor-not-allowed dark:disabled:opacity-40", "bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800") },
        react_1["default"].createElement("div", { className: "absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none" }),
        react_1["default"].createElement("div", { className: "relative z-10" },
            react_1["default"].createElement("div", { className: "flex items-start justify-between mb-4" },
                react_1["default"].createElement("div", { className: "p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform duration-300 dark:bg-blue-950 dark:text-blue-400" },
                    react_1["default"].createElement(Icon, { size: 24 })),
                badge && (react_1["default"].createElement("span", { className: "text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" }, badge))),
            react_1["default"].createElement("h3", { className: "font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 dark:text-gray-100 dark:group-hover:text-blue-400" }, title),
            react_1["default"].createElement("p", { className: "text-sm text-gray-600 mt-1 dark:text-gray-400" }, description),
            comingSoon && (react_1["default"].createElement("p", { className: "text-xs font-medium text-orange-600 mt-3 dark:text-orange-400" }, "Coming Soon")),
            react_1["default"].createElement("div", { className: "flex items-center gap-2 mt-4 text-blue-600 group-hover:gap-3 transition-all duration-300 dark:text-blue-400" },
                react_1["default"].createElement("span", { className: "text-xs font-semibold" }, "Open"),
                react_1["default"].createElement(lucide_react_1.ArrowRight, { size: 16 })))));
};
exports["default"] = exports.ModuleCard;
