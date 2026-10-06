"use strict";
/**
 * UnifiedModuleCard - Reusable component for consistent card design across the app
 *
 * Applies the same styling from DashboardHome to all module cards:
 * - Gradient backgrounds
 * - Hover animations and translations
 * - Shadow effects
 * - Rounded corners
 * - Dark mode support
 */
exports.__esModule = true;
exports.UnifiedCardGrid = exports.UnifiedModuleCard = void 0;
var react_1 = require("react");
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
function UnifiedModuleCard(_a) {
    var title = _a.title, description = _a.description, icon = _a.icon, badge = _a.badge, stats = _a.stats, actionHref = _a.actionHref, _b = _a.actionLabel, actionLabel = _b === void 0 ? "View" : _b, onAction = _a.onAction, onCreateAction = _a.onCreateAction, _c = _a.color, color = _c === void 0 ? "from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-800" : _c, _d = _a.isLoading, isLoading = _d === void 0 ? false : _d, children = _a.children, className = _a.className;
    var handleActionClick = function () {
        if (onAction) {
            onAction();
        }
        else if (actionHref) {
            window.location.href = actionHref;
        }
    };
    return (react_1["default"].createElement("button", { onClick: handleActionClick, disabled: isLoading, className: utils_1.cn("group relative overflow-hidden rounded-xl border transition-all duration-300", "bg-gradient-to-br border-slate-200 dark:border-slate-700", "p-4 sm:p-5 md:p-6 text-left", "hover:shadow-xl hover:-translate-y-1.5 dark:hover:border-slate-600", "hover:border-slate-300 active:scale-95", "disabled:opacity-50 disabled:cursor-not-allowed", "backdrop-blur-sm dark:bg-slate-800/70", "bg-gradient-to-br " + color, className) },
        react_1["default"].createElement("div", { className: "absolute -top-20 -right-20 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all duration-500" }),
        react_1["default"].createElement("div", { className: "absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all duration-500" }),
        react_1["default"].createElement("div", { className: "relative z-10 space-y-3 sm:space-y-4" },
            react_1["default"].createElement("div", { className: "flex items-start justify-between gap-2" },
                react_1["default"].createElement("div", { className: "flex items-start gap-3" },
                    icon && (react_1["default"].createElement("div", { className: "inline-flex p-2 sm:p-2.5 rounded-lg bg-white/50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 shadow-sm group-hover:bg-white/70 dark:group-hover:bg-slate-600/70 transition-all duration-300" }, icon)),
                    react_1["default"].createElement("div", { className: "flex-1" },
                        react_1["default"].createElement("h3", { className: "font-semibold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-100 transition-colors" }, title),
                        description && (react_1["default"].createElement("p", { className: "text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5" }, description)))),
                badge && (react_1["default"].createElement("span", { className: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/60 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 whitespace-nowrap" }, badge))),
            stats && stats.length > 0 && (react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2" }, stats.map(function (stat, idx) { return (react_1["default"].createElement("div", { key: idx, className: "bg-white/40 dark:bg-slate-700/40 rounded-lg p-2 sm:p-2.5" },
                react_1["default"].createElement("p", { className: "text-xs text-slate-600 dark:text-slate-400" }, stat.label),
                react_1["default"].createElement("p", { className: "text-sm sm:text-base font-semibold text-slate-900 dark:text-white" }, isLoading ? react_1["default"].createElement(lucide_react_1.Loader2, { className: "w-4 h-4 animate-spin" }) : stat.value))); }))),
            children && react_1["default"].createElement("div", { className: "space-y-2" }, children),
            (actionHref || onAction || onCreateAction) && (react_1["default"].createElement("div", { className: "flex items-center gap-2 pt-1" },
                onCreateAction && (react_1["default"].createElement("button", { onClick: function (e) {
                        e.stopPropagation();
                        onCreateAction();
                    }, className: "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/70 dark:bg-slate-700/70 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600 transition-all duration-200" },
                    react_1["default"].createElement(lucide_react_1.Plus, { className: "w-3 h-3" }),
                    "Create")),
                react_1["default"].createElement("div", { className: "flex-1" }),
                (actionHref || onAction) && (react_1["default"].createElement("span", { className: "inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors" },
                    actionLabel,
                    react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "w-3 h-3 group-hover:translate-x-1 transition-transform" })))))),
        react_1["default"].createElement("div", { className: "absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-gradient-to-r from-transparent via-slate-400 dark:via-slate-600 to-transparent" })));
}
exports.UnifiedModuleCard = UnifiedModuleCard;
function UnifiedCardGrid(_a) {
    var children = _a.children, className = _a.className;
    return (react_1["default"].createElement("div", { className: utils_1.cn("grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", className) }, children));
}
exports.UnifiedCardGrid = UnifiedCardGrid;
