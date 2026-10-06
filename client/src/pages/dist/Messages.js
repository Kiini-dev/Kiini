"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
/**
 * Messages page - Redirects to Staff Chat
 */
function Messages() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Messages", description: "View and manage your messages", icon: react_1["default"].createElement(lucide_react_1.MessageSquare, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Messages" },
        ] },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8 text-center" },
                react_1["default"].createElement(lucide_react_1.MessageSquare, { className: "h-12 w-12 mx-auto mb-4 text-blue-500" }),
                react_1["default"].createElement("h2", { className: "text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2" }, "Staff Chat"),
                react_1["default"].createElement("p", { className: "text-slate-600 dark:text-slate-400 mb-4" }, "Use the Staff Chat for real-time team communication."),
                react_1["default"].createElement(button_1.Button, { onClick: function () { return navigate("/staff-chat"); }, className: "gap-2" },
                    "Open Staff Chat ",
                    react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "h-4 w-4" }))))));
}
exports["default"] = Messages;
