"use strict";
exports.__esModule = true;
exports.ListPageHeader = void 0;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
function ListPageHeader(_a) {
    var title = _a.title, _b = _a.breadcrumbs, breadcrumbs = _b === void 0 ? [] : _b, _c = _a.searchValue, searchValue = _c === void 0 ? "" : _c, onSearchChange = _a.onSearchChange, _d = _a.searchPlaceholder, searchPlaceholder = _d === void 0 ? "Search" : _d, onCreateClick = _a.onCreateClick, createLabel = _a.createLabel, onExportClick = _a.onExportClick, onImportClick = _a.onImportClick, onFilterClick = _a.onFilterClick, onPrintClick = _a.onPrintClick, onChartToggle = _a.onChartToggle, _e = _a.showChart, showChart = _e === void 0 ? false : _e, _f = _a.showSearch, showSearch = _f === void 0 ? true : _f, _g = _a.showExport, showExport = _g === void 0 ? true : _g, _h = _a.showImport, showImport = _h === void 0 ? false : _h, _j = _a.showFilter, showFilter = _j === void 0 ? true : _j, _k = _a.showPrint, showPrint = _k === void 0 ? true : _k, _l = _a.showCreate, showCreate = _l === void 0 ? true : _l, _m = _a.showChartToggle, showChartToggle = _m === void 0 ? true : _m, filterOptions = _a.filterOptions, activeFilter = _a.activeFilter, onFilterChange = _a.onFilterChange, className = _a.className;
    var _o = react_1.useState(false), searchExpanded = _o[0], setSearchExpanded = _o[1];
    return (React.createElement("div", { className: utils_1.cn("flex flex-col gap-1 mb-4", className) },
        React.createElement("div", { className: "flex items-center justify-between" },
            React.createElement("div", null,
                React.createElement("h3", { className: "text-xl font-semibold text-primary" }, title),
                breadcrumbs.length > 0 && (React.createElement("div", { className: "flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5" }, breadcrumbs.map(function (crumb, i) { return (React.createElement("span", { key: i, className: "flex items-center gap-1.5" },
                    i > 0 && React.createElement("span", null, "\u203A"),
                    React.createElement("span", { className: i === breadcrumbs.length - 1 ? "font-medium text-foreground" : "" }, crumb))); })))),
            React.createElement("div", { className: "flex items-center gap-1.5" },
                showSearch && (React.createElement("div", { className: "relative flex items-center" },
                    React.createElement(lucide_react_1.Search, { className: "absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" }),
                    React.createElement(input_1.Input, { type: "text", placeholder: searchPlaceholder, value: searchValue, onChange: function (e) { return onSearchChange === null || onSearchChange === void 0 ? void 0 : onSearchChange(e.target.value); }, className: "h-8 w-36 md:w-44 pl-8 pr-3 text-sm" }))),
                showChartToggle && (React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: utils_1.cn("h-8 w-8 text-muted-foreground hover:text-foreground", showChart && "text-primary"), onClick: onChartToggle, title: "Toggle Charts" },
                    React.createElement(lucide_react_1.TrendingUp, { className: "h-4 w-4" }))),
                showImport && (React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 text-muted-foreground hover:text-foreground", onClick: onImportClick, title: "Import" },
                    React.createElement(lucide_react_1.Download, { className: "h-4 w-4" }))),
                showExport && (React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 text-muted-foreground hover:text-foreground", onClick: onExportClick, title: "Export" },
                    React.createElement(lucide_react_1.Upload, { className: "h-4 w-4" }))),
                showFilter && filterOptions ? (React.createElement(dropdown_menu_1.DropdownMenu, null,
                    React.createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                        React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 text-muted-foreground hover:text-foreground", title: "Filter" },
                            React.createElement(lucide_react_1.Filter, { className: "h-4 w-4" }))),
                    React.createElement(dropdown_menu_1.DropdownMenuContent, { align: "end" }, filterOptions.map(function (opt) { return (React.createElement(dropdown_menu_1.DropdownMenuItem, { key: opt.value, onClick: function () { return onFilterChange === null || onFilterChange === void 0 ? void 0 : onFilterChange(opt.value); }, className: activeFilter === opt.value ? "bg-accent" : "" }, opt.label)); })))) : showFilter ? (React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 text-muted-foreground hover:text-foreground", onClick: onFilterClick, title: "Filter" },
                    React.createElement(lucide_react_1.Filter, { className: "h-4 w-4" }))) : null,
                showPrint && (React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 text-muted-foreground hover:text-foreground", onClick: onPrintClick || (function () { return window.print(); }), title: "Print" },
                    React.createElement(lucide_react_1.Printer, { className: "h-4 w-4" }))),
                showCreate && onCreateClick && (React.createElement(button_1.Button, { size: "icon", className: "h-9 w-9 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-md", onClick: onCreateClick, title: createLabel || "Create New" },
                    React.createElement(lucide_react_1.Plus, { className: "h-5 w-5" })))))));
}
exports.ListPageHeader = ListPageHeader;
