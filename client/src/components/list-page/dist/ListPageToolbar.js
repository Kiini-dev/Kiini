"use strict";
exports.__esModule = true;
exports.ListPageToolbar = void 0;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
function ListPageToolbar(_a) {
    var searchValue = _a.searchValue, onSearchChange = _a.onSearchChange, _b = _a.searchPlaceholder, searchPlaceholder = _b === void 0 ? "Search" : _b, onCreateClick = _a.onCreateClick, _c = _a.createLabel, createLabel = _c === void 0 ? "Create" : _c, onExportClick = _a.onExportClick, onImportClick = _a.onImportClick, onFilterClick = _a.onFilterClick, onPrintClick = _a.onPrintClick, onChartClick = _a.onChartClick, onGridViewClick = _a.onGridViewClick, filterContent = _a.filterContent, _d = _a.showGridView, showGridView = _d === void 0 ? false : _d, _e = _a.showChart, showChart = _e === void 0 ? !!onChartClick : _e, _f = _a.showExport, showExport = _f === void 0 ? !!onExportClick : _f, _g = _a.showImport, showImport = _g === void 0 ? !!onImportClick : _g, _h = _a.showFilter, showFilter = _h === void 0 ? !!filterContent || !!onFilterClick : _h, _j = _a.showPrint, showPrint = _j === void 0 ? true : _j, _k = _a.showCreate, showCreate = _k === void 0 ? true : _k, className = _a.className;
    var _l = react_1.useState(false), showFilterPanel = _l[0], setShowFilterPanel = _l[1];
    return (React.createElement("div", { className: utils_1.cn("flex flex-col gap-3", className) },
        React.createElement("div", { className: "flex items-center gap-2 flex-wrap" },
            React.createElement("div", { className: "relative flex-1 min-w-[180px] max-w-[280px]" },
                React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                React.createElement(input_1.Input, { placeholder: searchPlaceholder, value: searchValue, onChange: function (e) { return onSearchChange(e.target.value); }, className: "pl-9 h-9" })),
            React.createElement("div", { className: "flex items-center gap-1" },
                showGridView && (React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-9 w-9 text-muted-foreground hover:text-foreground", onClick: onGridViewClick, title: "Grid View" },
                    React.createElement(lucide_react_1.LayoutGrid, { className: "h-4 w-4" }))),
                showChart && (React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-9 w-9 text-muted-foreground hover:text-foreground", onClick: onChartClick, title: "Analytics" },
                    React.createElement(lucide_react_1.BarChart3, { className: "h-4 w-4" }))),
                showImport && (React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-9 w-9 text-muted-foreground hover:text-foreground", onClick: onImportClick, title: "Import" },
                    React.createElement(lucide_react_1.Download, { className: "h-4 w-4" }))),
                showExport && (React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-9 w-9 text-muted-foreground hover:text-foreground", onClick: onExportClick, title: "Export" },
                    React.createElement(lucide_react_1.Upload, { className: "h-4 w-4" }))),
                showFilter && (React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-9 w-9 text-muted-foreground hover:text-foreground", onClick: function () {
                        setShowFilterPanel(!showFilterPanel);
                        onFilterClick === null || onFilterClick === void 0 ? void 0 : onFilterClick();
                    }, title: "Filter" },
                    React.createElement(lucide_react_1.Filter, { className: "h-4 w-4" }))),
                showPrint && (React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-9 w-9 text-muted-foreground hover:text-foreground", onClick: onPrintClick !== null && onPrintClick !== void 0 ? onPrintClick : (function () { return window.print(); }), title: "Print" },
                    React.createElement(lucide_react_1.Printer, { className: "h-4 w-4" })))),
            showCreate && onCreateClick && (React.createElement(button_1.Button, { onClick: onCreateClick, size: "icon", className: "h-10 w-10 rounded-full bg-primary hover:bg-primary/90 shadow-lg ml-1", title: createLabel },
                React.createElement(lucide_react_1.Plus, { className: "h-5 w-5" })))),
        showFilterPanel && filterContent && (React.createElement("div", { className: "flex items-center gap-2 flex-wrap p-3 rounded-lg border bg-muted/30" }, filterContent))));
}
exports.ListPageToolbar = ListPageToolbar;
