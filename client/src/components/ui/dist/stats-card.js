"use strict";
exports.__esModule = true;
exports.StatsCard = void 0;
var React = require("react");
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
function StatsCard(_a) {
    var label = _a.label, value = _a.value, description = _a.description, icon = _a.icon, _b = _a.color, color = _b === void 0 ? "border-l-blue-500" : _b, iconBg = _a.iconBg, onClick = _a.onClick, className = _a.className, loading = _a.loading;
    var Comp = onClick ? "button" : "div";
    return (React.createElement(Comp, { onClick: onClick, className: utils_1.cn("group relative overflow-hidden rounded-xl border-l-4 p-4 sm:p-5 text-left transition-all duration-300", "bg-white dark:bg-slate-800/60 border-t border-r border-b border-slate-200 dark:border-slate-700", "hover:shadow-lg hover:-translate-y-0.5", onClick && "cursor-pointer active:scale-[0.98]", color, className) },
        React.createElement("div", { className: "absolute inset-0 opacity-0 group-hover:opacity-[0.07] transition-opacity duration-300 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 pointer-events-none" }),
        React.createElement("div", { className: "relative flex items-start justify-between" },
            React.createElement("div", { className: "space-y-1.5 flex-1 min-w-0" },
                React.createElement("p", { className: "text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400" }, label),
                loading ? (React.createElement("div", { className: "flex items-center gap-2 h-8" },
                    React.createElement(lucide_react_1.Loader2, { className: "w-5 h-5 animate-spin text-slate-400" }))) : (React.createElement("p", { className: "text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 truncate" }, value)),
                description && (React.createElement("p", { className: "text-xs sm:text-sm text-slate-500 dark:text-slate-400" }, description))),
            icon && (iconBg ? (React.createElement("div", { className: utils_1.cn("ml-3 p-2.5 rounded-lg text-white shadow-lg flex-shrink-0", iconBg) }, icon)) : (React.createElement("div", { className: "ml-3 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500 transition-colors flex-shrink-0" }, icon))))));
}
exports.StatsCard = StatsCard;
