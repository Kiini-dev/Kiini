"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.DataTable = void 0;
var react_1 = require("react");
var table_1 = require("@/components/ui/table");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var EmptyState_1 = require("./EmptyState");
function DataTable(_a) {
    var columns = _a.columns, data = _a.data, keyField = _a.keyField, _b = _a.pageSize, pageSize = _b === void 0 ? 50 : _b, _c = _a.searchable, searchable = _c === void 0 ? true : _c, _d = _a.searchFields, searchFields = _d === void 0 ? [] : _d, onRowClick = _a.onRowClick, emptyState = _a.emptyState, _e = _a.isLoading, isLoading = _e === void 0 ? false : _e, actions = _a.actions, onExport = _a.onExport, className = _a.className, _f = _a.striped, striped = _f === void 0 ? true : _f, _g = _a.hover, hover = _g === void 0 ? true : _g;
    var _h = react_1.useState(1), currentPage = _h[0], setCurrentPage = _h[1];
    var _j = react_1.useState(pageSize), currentPageSize = _j[0], setCurrentPageSize = _j[1];
    var _k = react_1.useState(""), searchTerm = _k[0], setSearchTerm = _k[1];
    var _l = react_1.useState(null), sortConfig = _l[0], setSortConfig = _l[1];
    // Filter data by search term
    var filteredData = react_1.useMemo(function () {
        if (!searchTerm)
            return data;
        return data.filter(function (row) {
            var searchableFields = searchFields.length > 0 ? searchFields : Object.keys(row);
            return searchableFields.some(function (field) {
                var value = row[field];
                return String(value).toLowerCase().includes(searchTerm.toLowerCase());
            });
        });
    }, [data, searchTerm, searchFields]);
    // Sort data
    var sortedData = react_1.useMemo(function () {
        if (!sortConfig)
            return filteredData;
        var sorted = __spreadArrays(filteredData).sort(function (a, b) {
            var aValue = a[sortConfig.key];
            var bValue = b[sortConfig.key];
            if (aValue < bValue) {
                return sortConfig.direction === "asc" ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === "asc" ? 1 : -1;
            }
            return 0;
        });
        return sorted;
    }, [filteredData, sortConfig]);
    // Paginate data
    var totalPages = Math.ceil(sortedData.length / currentPageSize);
    var startIndex = (currentPage - 1) * currentPageSize;
    var paginatedData = sortedData.slice(startIndex, startIndex + currentPageSize);
    var handleSort = function (columnId) {
        var column = columns.find(function (c) { return c.id === columnId; });
        if (!(column === null || column === void 0 ? void 0 : column.sortable))
            return;
        setSortConfig(function (prev) {
            if ((prev === null || prev === void 0 ? void 0 : prev.key) === columnId) {
                return {
                    key: columnId,
                    direction: prev.direction === "asc" ? "desc" : "asc"
                };
            }
            return { key: columnId, direction: "asc" };
        });
    };
    var handlePreviousPage = function () {
        setCurrentPage(function (prev) { return Math.max(1, prev - 1); });
    };
    var handleNextPage = function () {
        setCurrentPage(function (prev) { return Math.min(totalPages, prev + 1); });
    };
    var handleFirstPage = function () { return setCurrentPage(1); };
    var handleLastPage = function () { return setCurrentPage(totalPages); };
    if (isLoading) {
        return (React.createElement("div", { className: "flex items-center justify-center py-12" },
            React.createElement(lucide_react_1.Loader2, { className: "w-8 h-8 text-blue-600 animate-spin" })));
    }
    if (paginatedData.length === 0) {
        return emptyState || React.createElement(EmptyState_1["default"], { title: "No data", description: "No records found" });
    }
    return (React.createElement("div", { className: utils_1.cn("space-y-4", className) },
        React.createElement("div", { className: "flex flex-col sm:flex-row gap-3 justify-between items-center" },
            searchable && (React.createElement("div", { className: "relative flex-1 max-w-sm" },
                React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" }),
                React.createElement(input_1.Input, { placeholder: "Search...", value: searchTerm, onChange: function (e) {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1); // Reset to first page on search
                    }, className: "pl-10" }))),
            React.createElement("div", { className: "flex gap-2" }, onExport && (React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: onExport, className: "flex items-center gap-2" },
                React.createElement(lucide_react_1.Download, { className: "w-4 h-4" }),
                React.createElement("span", { className: "hidden sm:inline" }, "Export"))))),
        React.createElement("div", { className: "rounded-lg border overflow-x-auto" },
            React.createElement(table_1.Table, null,
                React.createElement(table_1.TableHeader, null,
                    React.createElement(table_1.TableRow, { className: "bg-gray-50 hover:bg-gray-50" },
                        columns.map(function (column) { return (React.createElement(table_1.TableHead, { key: column.id, className: utils_1.cn("font-semibold text-gray-700", column.width, column.headerClassName, column.sortable && "cursor-pointer hover:bg-gray-100 select-none"), onClick: function () { return column.sortable && handleSort(column.id); } },
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement("span", null, column.label),
                                column.sortable && (React.createElement("span", { className: "text-xs text-gray-400" }, (sortConfig === null || sortConfig === void 0 ? void 0 : sortConfig.key) === column.id
                                    ? sortConfig.direction === "asc"
                                        ? "↑"
                                        : "↓"
                                    : "⇅"))))); }),
                        actions && React.createElement(table_1.TableHead, { className: "w-16" }, "Actions"))),
                React.createElement(table_1.TableBody, null, paginatedData.map(function (row, index) { return (React.createElement(table_1.TableRow, { key: row[keyField], className: utils_1.cn(striped && index % 2 === 1 && "bg-gray-50", hover && "hover:bg-blue-50 cursor-pointer transition-colors", onRowClick && "cursor-pointer"), onClick: function () { return onRowClick === null || onRowClick === void 0 ? void 0 : onRowClick(row); } },
                    columns.map(function (column) { return (React.createElement(table_1.TableCell, { key: row[keyField] + "-" + column.id, className: utils_1.cn("py-3", column.className) }, column.accessor ? column.accessor(row) : row[column.id])); }),
                    actions && (React.createElement(table_1.TableCell, { onClick: function (e) { return e.stopPropagation(); }, className: "text-right" }, actions(row))))); })))),
        React.createElement("div", { className: "flex items-center justify-between px-2 py-3 bg-gray-50 rounded-lg" },
            React.createElement("div", { className: "flex flex-col sm:flex-row gap-2 items-center" },
                React.createElement("span", { className: "text-sm text-gray-600" },
                    "Showing ",
                    sortedData.length === 0 ? 0 : startIndex + 1,
                    "\u2013",
                    Math.min(startIndex + currentPageSize, sortedData.length),
                    " of",
                    " ",
                    sortedData.length),
                React.createElement("div", { className: "flex items-center gap-1.5" },
                    React.createElement("span", { className: "text-sm text-gray-500" }, "Per page:"),
                    React.createElement(select_1.Select, { value: currentPageSize.toString(), onValueChange: function (value) {
                            setCurrentPageSize(Number(value));
                            setCurrentPage(1);
                        } },
                        React.createElement(select_1.SelectTrigger, { className: "w-24 h-8" },
                            React.createElement(select_1.SelectValue, null)),
                        React.createElement(select_1.SelectContent, null,
                            React.createElement(select_1.SelectItem, { value: "50" }, "50"),
                            React.createElement(select_1.SelectItem, { value: "100" }, "100"),
                            React.createElement(select_1.SelectItem, { value: "250" }, "250"),
                            React.createElement(select_1.SelectItem, { value: "500" }, "500"),
                            React.createElement(select_1.SelectItem, { value: "1000" }, "1000"))))),
            React.createElement("div", { className: "flex items-center gap-1" },
                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleFirstPage, disabled: currentPage === 1, className: "h-8 px-2" },
                    React.createElement(lucide_react_1.ChevronsLeft, { className: "w-4 h-4" })),
                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handlePreviousPage, disabled: currentPage === 1, className: "h-8 px-2" },
                    React.createElement(lucide_react_1.ChevronLeft, { className: "w-4 h-4" })),
                React.createElement("span", { className: "text-sm text-gray-600 px-3" },
                    "Page ",
                    currentPage,
                    " of ",
                    totalPages),
                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleNextPage, disabled: currentPage === totalPages, className: "h-8 px-2" },
                    React.createElement(lucide_react_1.ChevronRight, { className: "w-4 h-4" })),
                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleLastPage, disabled: currentPage === totalPages, className: "h-8 px-2" },
                    React.createElement(lucide_react_1.ChevronsRight, { className: "w-4 h-4" }))))));
}
exports.DataTable = DataTable;
exports["default"] = DataTable;
