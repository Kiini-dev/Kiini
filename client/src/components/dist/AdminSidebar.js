"use strict";
exports.__esModule = true;
exports.AdminSidebar = void 0;
var react_1 = require("react");
var wouter_1 = require("wouter");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
/**
 * Responsive admin sidebar component
 * - Desktop: Fixed sidebar on the left
 * - Mobile: Collapsible overlay sidebar
 */
function AdminSidebar(_a) {
    var title = _a.title, Icon = _a.icon, items = _a.items, children = _a.children;
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    var _c = react_1.useState(false), mobileNavOpen = _c[0], setMobileNavOpen = _c[1];
    var renderSidebarContent = function () { return (React.createElement(React.Fragment, null,
        React.createElement(card_1.CardHeader, { className: "pb-3 border-b" },
            React.createElement("div", { className: "flex items-center justify-between gap-2" },
                React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                    React.createElement(Icon, { className: "w-5 h-5" }),
                    React.createElement("span", { className: "truncate" }, title)),
                mobileNavOpen && (React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-6 w-6 p-0 md:hidden", onClick: function () { return setMobileNavOpen(false); } },
                    React.createElement(lucide_react_1.X, { className: "w-4 h-4" }))))),
        React.createElement(card_1.CardContent, { className: "flex-1 overflow-y-auto p-3 space-y-1" }, items.map(function (item) {
            var ItemIcon = item.icon;
            return (React.createElement("button", { key: item.href, onClick: function () {
                    setLocation(item.href);
                    setMobileNavOpen(false);
                }, className: utils_1.cn("w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm transition", "hover:bg-muted", "group"), title: item.title },
                React.createElement("div", { className: "flex items-center gap-2 min-w-0" },
                    React.createElement(ItemIcon, { className: "w-4 h-4 flex-shrink-0" }),
                    React.createElement("span", { className: "truncate group-hover:font-medium" }, item.title)),
                item.badge && (React.createElement("span", { className: "flex-shrink-0 ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full" }, item.badge))));
        })))); };
    return (React.createElement("div", { className: "flex gap-4 h-full" },
        React.createElement(card_1.Card, { className: "hidden md:flex md:w-60 md:flex-shrink-0 md:flex-col" }, renderSidebarContent()),
        mobileNavOpen && (React.createElement("div", { className: "fixed inset-0 z-40 bg-black/50 md:hidden", onClick: function () { return setMobileNavOpen(false); } },
            React.createElement(card_1.Card, { className: "fixed left-0 top-0 h-full w-64 flex-shrink-0 flex flex-col rounded-none", onClick: function (e) { return e.stopPropagation(); } }, renderSidebarContent()))),
        React.createElement("div", { className: "flex-1 flex flex-col overflow-hidden min-w-0" },
            React.createElement("div", { className: "md:hidden flex items-center justify-between p-4 border-b bg-card" },
                React.createElement("h1", { className: "text-lg font-semibold flex items-center gap-2 truncate" },
                    React.createElement(Icon, { className: "w-5 h-5 flex-shrink-0" }),
                    title),
                React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { return setMobileNavOpen(!mobileNavOpen); }, className: "flex-shrink-0" },
                    React.createElement(lucide_react_1.Menu, { className: "h-5 w-5" }))),
            React.createElement("div", { className: "flex-1 overflow-auto" }, children))));
}
exports.AdminSidebar = AdminSidebar;
exports["default"] = AdminSidebar;
