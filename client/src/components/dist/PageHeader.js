"use strict";
exports.__esModule = true;
exports.PageHeader = void 0;
var react_1 = require("react");
var wouter_1 = require("wouter");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
function renderHeaderIcon(icon) {
    if (!icon) {
        return null;
    }
    if (react_1["default"].isValidElement(icon)) {
        return icon;
    }
    if (typeof icon === "string") {
        return react_1["default"].createElement("span", { className: "text-sm font-semibold" }, icon);
    }
    if (typeof icon === "function") {
        var IconComponent = icon;
        return react_1["default"].createElement(IconComponent, { className: "w-6 h-6" });
    }
    if (typeof icon === "object" && icon !== null && "$$typeof" in icon && "render" in icon) {
        var IconComponent = icon;
        return react_1["default"].createElement(IconComponent, { className: "w-6 h-6" });
    }
    return null;
}
function PageHeader(_a) {
    var title = _a.title, description = _a.description, icon = _a.icon, breadcrumbs = _a.breadcrumbs, actions = _a.actions, className = _a.className;
    return (react_1["default"].createElement("div", { className: utils_1.cn("mb-6", className) },
        react_1["default"].createElement("div", { className: "relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 sm:p-8 shadow-2xl" },
            react_1["default"].createElement("div", { className: "absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" }),
            react_1["default"].createElement("div", { className: "absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" }),
            react_1["default"].createElement("div", { className: "relative" },
                breadcrumbs && breadcrumbs.length > 0 && (react_1["default"].createElement("nav", { className: "flex items-center gap-1 text-sm mb-4" }, breadcrumbs.map(function (item, index) { return (react_1["default"].createElement(react_1.Fragment, { key: index + "-" + (item.href || item.label) },
                    index > 0 && (react_1["default"].createElement(lucide_react_1.ChevronRight, { className: "w-3.5 h-3.5 text-slate-500 mx-1" })),
                    item.href ? (react_1["default"].createElement(wouter_1.Link, { href: item.href, className: "text-slate-400 hover:text-white transition-colors font-medium" }, item.label)) : (react_1["default"].createElement("span", { className: "text-white font-semibold" }, item.label)))); }))),
                react_1["default"].createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4" },
                    react_1["default"].createElement("div", { className: "flex flex-col sm:flex-row sm:items-start gap-4 w-full" },
                        icon && (react_1["default"].createElement("div", { className: "p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 text-white flex-shrink-0" }, renderHeaderIcon(icon))),
                        react_1["default"].createElement("div", { className: "min-w-0" },
                            react_1["default"].createElement("h1", { className: "text-2xl sm:text-3xl font-bold tracking-tight text-white" }, title),
                            description && (react_1["default"].createElement("p", { className: "text-slate-300 mt-1 max-w-2xl text-sm sm:text-base" }, description)))),
                    actions && (react_1["default"].createElement("div", { className: "flex flex-wrap items-center gap-2 flex-shrink-0 w-full sm:w-auto [&_button]:border-white/20 [&_button]:hover:bg-white/10" }, actions)))))));
}
exports.PageHeader = PageHeader;
