"use strict";
exports.__esModule = true;
exports.ListPagination = void 0;
var button_1 = require("@/components/ui/button");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var usePaginatedList_1 = require("@/hooks/usePaginatedList");
function ListPagination(_a) {
    var currentPage = _a.currentPage, totalPages = _a.totalPages, pageSize = _a.pageSize, totalItems = _a.totalItems, startIndex = _a.startIndex, endIndex = _a.endIndex, onPageChange = _a.onPageChange, onPageSizeChange = _a.onPageSizeChange;
    if (totalItems === 0)
        return null;
    return (React.createElement("div", { className: "flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-3 border-t bg-muted/30 rounded-b-lg" },
        React.createElement("div", { className: "flex items-center gap-3 text-sm text-muted-foreground" },
            React.createElement("span", null,
                totalItems === 0 ? "0" : startIndex + 1 + "\u2013" + endIndex,
                " of ",
                totalItems,
                " items"),
            React.createElement("div", { className: "flex items-center gap-1.5" },
                React.createElement("span", null, "Per page:"),
                React.createElement(select_1.Select, { value: pageSize.toString(), onValueChange: function (v) { return onPageSizeChange(Number(v)); } },
                    React.createElement(select_1.SelectTrigger, { className: "h-8 w-20" },
                        React.createElement(select_1.SelectValue, null)),
                    React.createElement(select_1.SelectContent, null, usePaginatedList_1.PAGE_SIZE_OPTIONS.map(function (n) { return (React.createElement(select_1.SelectItem, { key: n, value: n.toString() }, n)); }))))),
        totalPages > 1 && (React.createElement("div", { className: "flex items-center gap-1" },
            React.createElement(button_1.Button, { variant: "outline", size: "sm", className: "h-8 w-8 p-0", onClick: function () { return onPageChange(1); }, disabled: currentPage === 1 },
                React.createElement(lucide_react_1.ChevronsLeft, { className: "h-4 w-4" })),
            React.createElement(button_1.Button, { variant: "outline", size: "sm", className: "h-8 w-8 p-0", onClick: function () { return onPageChange(currentPage - 1); }, disabled: currentPage === 1 },
                React.createElement(lucide_react_1.ChevronLeft, { className: "h-4 w-4" })),
            React.createElement("span", { className: "text-sm px-3" },
                "Page ",
                currentPage,
                " / ",
                totalPages),
            React.createElement(button_1.Button, { variant: "outline", size: "sm", className: "h-8 w-8 p-0", onClick: function () { return onPageChange(currentPage + 1); }, disabled: currentPage === totalPages },
                React.createElement(lucide_react_1.ChevronRight, { className: "h-4 w-4" })),
            React.createElement(button_1.Button, { variant: "outline", size: "sm", className: "h-8 w-8 p-0", onClick: function () { return onPageChange(totalPages); }, disabled: currentPage === totalPages },
                React.createElement(lucide_react_1.ChevronsRight, { className: "h-4 w-4" }))))));
}
exports.ListPagination = ListPagination;
