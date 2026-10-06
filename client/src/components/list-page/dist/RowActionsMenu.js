"use strict";
exports.__esModule = true;
exports.actionIcons = exports.RowActionsMenu = void 0;
var button_1 = require("@/components/ui/button");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
function RowActionsMenu(_a) {
    var _b = _a.primaryActions, primaryActions = _b === void 0 ? [] : _b, _c = _a.menuActions, menuActions = _c === void 0 ? [] : _c, _d = _a.showStar, showStar = _d === void 0 ? false : _d, _e = _a.starred, starred = _e === void 0 ? false : _e, onToggleStar = _a.onToggleStar, _f = _a.showDownload, showDownload = _f === void 0 ? false : _f, onDownload = _a.onDownload;
    var visiblePrimary = primaryActions.filter(function (a) { return !a.hidden; });
    var visibleMenu = menuActions.filter(function (a) { return !a.hidden; });
    return (React.createElement("div", { className: "flex items-center gap-0.5 justify-end" },
        visiblePrimary.map(function (action, i) { return (React.createElement(button_1.Button, { key: i, variant: "ghost", size: "icon", className: utils_1.cn("h-8 w-8", action.variant === "destructive" && "text-destructive hover:text-destructive"), onClick: action.onClick, title: action.label }, action.icon)); }),
        visibleMenu.length > 0 && (React.createElement(dropdown_menu_1.DropdownMenu, null,
            React.createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8" },
                    React.createElement(lucide_react_1.MoreHorizontal, { className: "h-4 w-4" }))),
            React.createElement(dropdown_menu_1.DropdownMenuContent, { align: "end", className: "w-56" }, visibleMenu.map(function (action, i) { return (React.createElement("div", { key: i },
                action.separator && i > 0 && React.createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: action.onClick, className: utils_1.cn("gap-2 cursor-pointer", action.variant === "destructive" && "text-destructive focus:text-destructive") },
                    action.icon,
                    action.label))); })))),
        showStar && (React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: onToggleStar, title: starred ? "Remove from favorites" : "Add to favorites" },
            React.createElement(lucide_react_1.Star, { className: utils_1.cn("h-4 w-4", starred && "fill-yellow-400 text-yellow-400") }))),
        showDownload && (React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: onDownload, title: "Download" },
            React.createElement(lucide_react_1.Download, { className: "h-4 w-4" })))));
}
exports.RowActionsMenu = RowActionsMenu;
/** Pre-built action presets for common operations */
exports.actionIcons = {
    view: React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" }),
    edit: React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" }),
    "delete": React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }),
    download: React.createElement(lucide_react_1.Download, { className: "h-4 w-4" }),
    copy: React.createElement(lucide_react_1.Copy, { className: "h-4 w-4" }),
    email: React.createElement(lucide_react_1.Mail, { className: "h-4 w-4" }),
    externalLink: React.createElement(lucide_react_1.ExternalLink, { className: "h-4 w-4" }),
    star: React.createElement(lucide_react_1.Star, { className: "h-4 w-4" })
};
