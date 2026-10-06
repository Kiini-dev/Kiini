"use strict";
exports.__esModule = true;
exports.ModuleLayout = void 0;
var react_1 = require("react");
var wouter_1 = require("wouter");
var MaterialTailwind_1 = require("@/components/MaterialTailwind");
var PageHeader_1 = require("./PageHeader");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
function ModuleLayout(_a) {
    var title = _a.title, description = _a.description, icon = _a.icon, breadcrumbs = _a.breadcrumbs, backLink = _a.backLink, actions = _a.actions, children = _a.children, className = _a.className, contentClassName = _a.contentClassName;
    // Combine back button with custom actions
    var combinedActions = (react_1["default"].createElement("div", { className: "flex items-center gap-2 [&_button]:border-gray-300 [&_button]:text-gray-700 [&_button]:hover:bg-gray-100 dark:[&_button]:border-white/20 dark:[&_button]:text-white dark:[&_button]:hover:bg-white/10" },
        backLink && (react_1["default"].createElement(wouter_1.Link, { href: backLink.href },
            react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", className: "border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:border-white/20 dark:text-white dark:hover:bg-white/10 dark:hover:text-white" },
                react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "mr-2 h-4 w-4" }),
                "Back to ",
                backLink.label))),
        actions));
    return (react_1["default"].createElement(MaterialTailwind_1.DashboardLayout, null,
        react_1["default"].createElement("div", { className: utils_1.cn("space-y-6", className) },
            react_1["default"].createElement(PageHeader_1.PageHeader, { title: title, description: description, icon: icon, breadcrumbs: breadcrumbs, actions: combinedActions }),
            react_1["default"].createElement("div", { className: utils_1.cn("", contentClassName) }, children))));
}
exports.ModuleLayout = ModuleLayout;
exports["default"] = ModuleLayout;
