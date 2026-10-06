"use strict";
exports.__esModule = true;
exports.useColumnVisibility = exports.TableColumnSettings = void 0;
var react_1 = require("react");
var checkbox_1 = require("@/components/ui/checkbox");
var button_1 = require("@/components/ui/button");
var sheet_1 = require("@/components/ui/sheet");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
function TableColumnSettings(_a) {
    var columns = _a.columns, visibleColumns = _a.visibleColumns, onToggleColumn = _a.onToggleColumn, onReset = _a.onReset, pageSize = _a.pageSize, onPageSizeChange = _a.onPageSizeChange;
    var _b = react_1.useState(false), open = _b[0], setOpen = _b[1];
    return (React.createElement(sheet_1.Sheet, { open: open, onOpenChange: setOpen },
        React.createElement(sheet_1.SheetTrigger, { asChild: true },
            React.createElement("button", { className: "p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors", title: "Table Settings" },
                React.createElement(lucide_react_1.Settings2, { className: "h-4 w-4" }))),
        React.createElement(sheet_1.SheetContent, { side: "right", className: "w-[320px] sm:w-[380px] flex flex-col" },
            React.createElement(sheet_1.SheetHeader, { className: "flex flex-row items-center justify-between shrink-0" },
                React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement(lucide_react_1.Settings2, { className: "h-5 w-5 text-primary" }),
                    React.createElement(sheet_1.SheetTitle, null, "Table Settings"))),
            React.createElement("div", { className: "flex-1 overflow-y-auto min-h-0 mt-2" },
                React.createElement("div", { className: "space-y-1" },
                    React.createElement("p", { className: "text-xs font-medium text-muted-foreground px-3 mb-2 sticky top-0 bg-background py-1" }, "Column Visibility"),
                    columns.map(function (col) { return (React.createElement("label", { key: col.key, className: "flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer hover:bg-muted/50 transition-colors" },
                        React.createElement(checkbox_1.Checkbox, { checked: visibleColumns.has(col.key), onCheckedChange: function () { return onToggleColumn(col.key); } }),
                        React.createElement("span", { className: "text-sm" }, col.label))); }))),
            React.createElement("div", { className: "shrink-0 border-t pt-4 space-y-4" },
                onPageSizeChange && (React.createElement("div", { className: "px-3" },
                    React.createElement("p", { className: "text-xs font-medium text-muted-foreground mb-2" }, "Rows Per Page"),
                    React.createElement("select", { className: "w-full rounded-md border bg-background px-3 py-2 text-sm", value: pageSize || 25, onChange: function (e) { return onPageSizeChange(Number(e.target.value)); } }, [10, 25, 50, 100].map(function (size) { return (React.createElement("option", { key: size, value: size },
                        size,
                        " rows")); })))),
                React.createElement("div", { className: "flex gap-2" },
                    onReset && (React.createElement(button_1.Button, { variant: "outline", className: "flex-1 gap-1", onClick: function () {
                            onReset();
                        } },
                        React.createElement(lucide_react_1.RotateCcw, { className: "h-3.5 w-3.5" }),
                        "Reset")),
                    React.createElement(button_1.Button, { variant: "outline", className: "flex-1", onClick: function () { return setOpen(false); } }, "Close"))))));
}
exports.TableColumnSettings = TableColumnSettings;
/**
 * Hook to manage column visibility state with optional backend persistence.
 * @param columns Column config definitions
 * @param tableName Optional table identifier for backend persistence. When provided,
 *   preferences are synced to the userTablePreferences table via tRPC.
 */
function useColumnVisibility(columns, tableName) {
    var getDefaults = react_1.useCallback(function () {
        var s = new Set();
        columns.forEach(function (col) {
            if (col.defaultVisible !== false)
                s.add(col.key);
        });
        return s;
    }, [columns]);
    var _a = react_1.useState(getDefaults), visibleColumns = _a[0], setVisibleColumns = _a[1];
    var _b = react_1.useState(25), pageSize = _b[0], setPageSize = _b[1];
    var initialLoadDone = react_1.useRef(false);
    var saveTimerRef = react_1.useRef(null);
    // Load preferences from backend
    var savedPrefs = trpc_1.trpc.tablePreferences.get.useQuery({ tableName: tableName || "" }, { enabled: !!tableName }).data;
    // Save mutation
    var saveMutation = trpc_1.trpc.tablePreferences.save.useMutation();
    var resetMutation = trpc_1.trpc.tablePreferences.reset.useMutation();
    // Apply saved preferences once loaded
    react_1.useEffect(function () {
        if (savedPrefs && !initialLoadDone.current) {
            initialLoadDone.current = true;
            if (savedPrefs.visibleColumns) {
                setVisibleColumns(new Set(savedPrefs.visibleColumns));
            }
            if (savedPrefs.pageSize) {
                setPageSize(savedPrefs.pageSize);
            }
        }
    }, [savedPrefs]);
    // Debounced save to backend
    var debouncedSave = react_1.useCallback(function (cols, ps) {
        if (!tableName)
            return;
        if (saveTimerRef.current)
            clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(function () {
            saveMutation.mutate({
                tableName: tableName,
                visibleColumns: Array.from(cols),
                pageSize: ps
            });
        }, 800);
    }, [tableName, saveMutation]);
    var toggleColumn = react_1.useCallback(function (key) {
        setVisibleColumns(function (prev) {
            var next = new Set(prev);
            if (next.has(key))
                next["delete"](key);
            else
                next.add(key);
            debouncedSave(next, pageSize);
            return next;
        });
    }, [debouncedSave, pageSize]);
    var updatePageSize = react_1.useCallback(function (size) {
        setPageSize(size);
        debouncedSave(visibleColumns, size);
    }, [debouncedSave, visibleColumns]);
    var isVisible = react_1.useCallback(function (key) { return visibleColumns.has(key); }, [visibleColumns]);
    var reset = react_1.useCallback(function () {
        var defaults = getDefaults();
        setVisibleColumns(defaults);
        setPageSize(25);
        if (tableName) {
            resetMutation.mutate({ tableName: tableName });
        }
    }, [getDefaults, tableName, resetMutation]);
    return { visibleColumns: visibleColumns, toggleColumn: toggleColumn, isVisible: isVisible, pageSize: pageSize, updatePageSize: updatePageSize, reset: reset };
}
exports.useColumnVisibility = useColumnVisibility;
