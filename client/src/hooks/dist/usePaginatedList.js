"use strict";
exports.__esModule = true;
exports.usePaginatedList = exports.PAGE_SIZE_OPTIONS = void 0;
var react_1 = require("react");
exports.PAGE_SIZE_OPTIONS = [50, 100, 250, 500, 1000];
function usePaginatedList(items, keyField, defaultPageSize) {
    if (defaultPageSize === void 0) { defaultPageSize = 50; }
    var _a = react_1.useState(1), currentPage = _a[0], setCurrentPageInner = _a[1];
    var _b = react_1.useState(defaultPageSize), pageSize = _b[0], setPageSizeInner = _b[1];
    var _c = react_1.useState(new Set()), selectedIds = _c[0], setSelectedIds = _c[1];
    var totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    var startIndex = (currentPage - 1) * pageSize;
    var endIndex = Math.min(startIndex + pageSize, items.length);
    var paginatedItems = react_1.useMemo(function () { return items.slice(startIndex, endIndex); }, [items, startIndex, endIndex]);
    var setCurrentPage = react_1.useCallback(function (page) {
        setCurrentPageInner(Math.max(1, Math.min(page, totalPages)));
    }, [totalPages]);
    var setPageSize = react_1.useCallback(function (size) {
        setPageSizeInner(size);
        setCurrentPageInner(1);
    }, []);
    var toggleSelected = react_1.useCallback(function (id) {
        setSelectedIds(function (prev) {
            var next = new Set(prev);
            if (next.has(id))
                next["delete"](id);
            else
                next.add(id);
            return next;
        });
    }, []);
    var selectAll = react_1.useCallback(function (ids) {
        setSelectedIds(function (prev) {
            var next = new Set(prev);
            ids.forEach(function (id) { return next.add(id); });
            return next;
        });
    }, []);
    var clearSelection = react_1.useCallback(function () { return setSelectedIds(new Set()); }, []);
    var isSelected = react_1.useCallback(function (id) { return selectedIds.has(id); }, [selectedIds]);
    var isAllSelected = react_1.useCallback(function (currentPageIds) {
        return currentPageIds.length > 0 && currentPageIds.every(function (id) { return selectedIds.has(id); });
    }, [selectedIds]);
    return {
        currentPage: currentPage,
        pageSize: pageSize,
        selectedIds: selectedIds,
        paginatedItems: paginatedItems,
        totalPages: totalPages,
        startIndex: startIndex,
        endIndex: endIndex,
        setCurrentPage: setCurrentPage,
        setPageSize: setPageSize,
        toggleSelected: toggleSelected,
        selectAll: selectAll,
        clearSelection: clearSelection,
        isSelected: isSelected,
        isAllSelected: isAllSelected
    };
}
exports.usePaginatedList = usePaginatedList;
