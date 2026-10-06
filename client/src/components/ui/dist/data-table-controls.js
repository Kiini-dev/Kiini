"use strict";
exports.__esModule = true;
exports.usePagination = exports.useTableSelection = exports.BulkActionsBar = exports.PaginationControls = exports.PAGE_SIZE_OPTIONS = void 0;
var react_1 = require("react");
var select_1 = require("@/components/ui/select");
var button_1 = require("@/components/ui/button");
var checkbox_1 = require("@/components/ui/checkbox");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
exports.PAGE_SIZE_OPTIONS = [25, 50, 100, 500, 1000];
function PaginationControls(_a) {
    var total = _a.total, page = _a.page, pageSize = _a.pageSize, onPageChange = _a.onPageChange, onPageSizeChange = _a.onPageSizeChange, className = _a.className;
    var totalPages = Math.max(1, Math.ceil(total / pageSize));
    var start = total === 0 ? 0 : (page - 1) * pageSize + 1;
    var end = Math.min(page * pageSize, total);
    return (React.createElement("div", { className: utils_1.cn("flex items-center justify-between gap-4 py-3 px-1", className) },
        React.createElement("div", { className: "flex items-center gap-2 text-sm text-muted-foreground" },
            React.createElement("span", { className: "hidden sm:inline" }, "Rows per page:"),
            React.createElement(select_1.Select, { value: String(pageSize), onValueChange: function (v) {
                    onPageSizeChange(Number(v));
                    onPageChange(1);
                } },
                React.createElement(select_1.SelectTrigger, { className: "h-8 w-[70px]" },
                    React.createElement(select_1.SelectValue, null)),
                React.createElement(select_1.SelectContent, { className: "max-h-48 overflow-y-auto" }, exports.PAGE_SIZE_OPTIONS.map(function (size) { return (React.createElement(select_1.SelectItem, { key: size, value: String(size) }, size)); })))),
        React.createElement("div", { className: "flex items-center gap-1 text-sm text-muted-foreground" },
            React.createElement("span", { className: "hidden sm:inline mr-2" },
                start,
                "\u2013",
                end,
                " of ",
                total),
            React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8", disabled: page <= 1, onClick: function () { return onPageChange(1); }, title: "First page" },
                React.createElement(lucide_react_1.ChevronsLeft, { className: "h-4 w-4" })),
            React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8", disabled: page <= 1, onClick: function () { return onPageChange(page - 1); }, title: "Previous page" },
                React.createElement(lucide_react_1.ChevronLeft, { className: "h-4 w-4" })),
            React.createElement("span", { className: "px-2 text-sm font-medium" },
                page,
                " / ",
                totalPages),
            React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8", disabled: page >= totalPages, onClick: function () { return onPageChange(page + 1); }, title: "Next page" },
                React.createElement(lucide_react_1.ChevronRight, { className: "h-4 w-4" })),
            React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8", disabled: page >= totalPages, onClick: function () { return onPageChange(totalPages); }, title: "Last page" },
                React.createElement(lucide_react_1.ChevronsRight, { className: "h-4 w-4" })))));
}
exports.PaginationControls = PaginationControls;
function BulkActionsBar(_a) {
    var selectedIds = _a.selectedIds, totalCount = _a.totalCount, onSelectAll = _a.onSelectAll, allSelected = _a.allSelected, someSelected = _a.someSelected, actions = _a.actions, className = _a.className;
    var count = selectedIds.length;
    return (React.createElement("div", { className: utils_1.cn("flex items-center gap-3 px-3 py-2 rounded-lg border transition-all", count > 0
            ? "bg-primary/5 border-primary/20"
            : "bg-muted/50 border-transparent", className) },
        React.createElement(checkbox_1.Checkbox, { checked: allSelected ? true : someSelected ? "indeterminate" : false, onCheckedChange: function (v) { return onSelectAll(!!v); }, "aria-label": "Select all" }),
        React.createElement("span", { className: "text-sm text-muted-foreground" }, count > 0 ? (React.createElement("span", { className: "text-primary font-medium" },
            count,
            " selected")) : (React.createElement("span", null,
            "Select all (",
            totalCount,
            ")"))),
        count > 0 && (React.createElement("div", { className: "flex items-center gap-2 ml-2" }, actions.map(function (action) { return (React.createElement(button_1.Button, { key: action.label, size: "sm", variant: action.variant || "outline", className: "h-7 text-xs gap-1", onClick: function () { return action.onClick(selectedIds); } },
            action.icon,
            action.label)); })))));
}
exports.BulkActionsBar = BulkActionsBar;
/* ─── Hook: useTableSelection ──────────────────────────────────── */
function useTableSelection(items) {
    var _a = react_1.useState(new Set()), selectedIds = _a[0], setSelectedIds = _a[1];
    var toggle = function (id) {
        setSelectedIds(function (prev) {
            var next = new Set(prev);
            if (next.has(id))
                next["delete"](id);
            else
                next.add(id);
            return next;
        });
    };
    var selectAll = function (checked) {
        setSelectedIds(checked ? new Set(items) : new Set());
    };
    var clear = function () { return setSelectedIds(new Set()); };
    return {
        selectedIds: Array.from(selectedIds),
        selectedSet: selectedIds,
        toggle: toggle,
        selectAll: selectAll,
        clear: clear,
        allSelected: items.length > 0 && selectedIds.size === items.length,
        someSelected: selectedIds.size > 0 && selectedIds.size < items.length
    };
}
exports.useTableSelection = useTableSelection;
/* ─── Hook: usePagination ──────────────────────────────────────── */
function usePagination(defaultPageSize) {
    if (defaultPageSize === void 0) { defaultPageSize = 25; }
    var _a = react_1.useState(1), page = _a[0], setPage = _a[1];
    var _b = react_1.useState(defaultPageSize), pageSize = _b[0], setPageSize = _b[1];
    var paginate = function (items) {
        var start = (page - 1) * pageSize;
        return items.slice(start, start + pageSize);
    };
    var resetPage = function () { return setPage(1); };
    return {
        page: page,
        pageSize: pageSize,
        setPage: setPage,
        setPageSize: function (size) {
            setPageSize(size);
            setPage(1);
        },
        paginate: paginate,
        resetPage: resetPage
    };
}
exports.usePagination = usePagination;
