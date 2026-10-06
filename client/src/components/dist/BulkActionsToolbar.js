"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.BulkActionCheckbox = exports.useBulkActions = exports.BulkActionsToolbar = void 0;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var checkbox_1 = require("@/components/ui/checkbox");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
function BulkActionsToolbar(_a) {
    var _this = this;
    var selectedIds = _a.selectedIds, totalCount = _a.totalCount, isSelectAllChecked = _a.isSelectAllChecked, onSelectAll = _a.onSelectAll, onClearSelection = _a.onClearSelection, actions = _a.actions, _b = _a.isLoading, isLoading = _b === void 0 ? false : _b;
    var selectedCount = selectedIds.length;
    var _c = react_1["default"].useState(null), confirmAction = _c[0], setConfirmAction = _c[1];
    var _d = react_1["default"].useState(false), isExecuting = _d[0], setIsExecuting = _d[1];
    var handleActionClick = function (action) {
        if (action.id === "delete") {
            setConfirmAction(action);
        }
        else {
            handleExecuteAction(action);
        }
    };
    var handleExecuteAction = function (action) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setIsExecuting(true);
                    return [4 /*yield*/, action.onClick(selectedIds)];
                case 1:
                    _a.sent();
                    onClearSelection();
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    console.error("Error executing action " + action.id + ":", error_1);
                    return [3 /*break*/, 4];
                case 3:
                    setIsExecuting(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    if (selectedCount === 0) {
        return null;
    }
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement("div", { className: "flex items-center justify-between gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg" },
            react_1["default"].createElement("div", { className: "flex items-center gap-3" },
                react_1["default"].createElement(checkbox_1.Checkbox, { checked: isSelectAllChecked, onCheckedChange: onSelectAll, disabled: isLoading }),
                react_1["default"].createElement("span", { className: "text-sm font-medium text-gray-700" },
                    selectedCount,
                    " selected",
                    selectedCount < totalCount && (react_1["default"].createElement("button", { onClick: function () { return onSelectAll(true); }, className: "ml-2 text-blue-600 hover:text-blue-700 underline text-xs" },
                        "(Select all ",
                        totalCount,
                        ")")))),
            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                actions.map(function (action) { return (react_1["default"].createElement(button_1.Button, { key: action.id, size: "sm", variant: action.variant || "outline", onClick: function () { return handleActionClick(action); }, disabled: isLoading || isExecuting, className: "gap-2" },
                    action.icon,
                    action.label)); }),
                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: onClearSelection, disabled: isLoading }, "Clear"))),
        confirmAction && (react_1["default"].createElement(alert_dialog_1.AlertDialog, { open: !!confirmAction, onOpenChange: function (open) { return !open && setConfirmAction(null); } },
            react_1["default"].createElement(alert_dialog_1.AlertDialogContent, null,
                react_1["default"].createElement(alert_dialog_1.AlertDialogHeader, null,
                    react_1["default"].createElement(alert_dialog_1.AlertDialogTitle, null,
                        "Confirm ",
                        confirmAction.label),
                    react_1["default"].createElement(alert_dialog_1.AlertDialogDescription, null,
                        "Are you sure you want to ",
                        confirmAction.label.toLowerCase(),
                        " ",
                        selectedCount,
                        " item",
                        selectedCount > 1 ? "s" : "",
                        "? This action cannot be undone.")),
                react_1["default"].createElement("div", { className: "flex justify-end gap-3" },
                    react_1["default"].createElement(alert_dialog_1.AlertDialogCancel, null, "Cancel"),
                    react_1["default"].createElement(alert_dialog_1.AlertDialogAction, { onClick: function () {
                            handleExecuteAction(confirmAction);
                            setConfirmAction(null);
                        } }, confirmAction.label)))))));
}
exports.BulkActionsToolbar = BulkActionsToolbar;
/**
 * Hook for managing bulk actions state
 */
function useBulkActions(items, idField) {
    if (idField === void 0) { idField = "id"; }
    var _a = react_1["default"].useState([]), selectedIds = _a[0], setSelectedIds = _a[1];
    var itemIds = items.map(function (item) { return item[idField]; });
    var isSelectAllChecked = itemIds.length > 0 && itemIds.every(function (id) { return selectedIds.includes(id); });
    var toggleId = function (id, checked) {
        setSelectedIds(function (prev) {
            return checked ? __spreadArrays(prev, [id]) : prev.filter(function (sid) { return sid !== id; });
        });
    };
    var selectAll = function (checked) {
        if (checked) {
            setSelectedIds(itemIds);
        }
        else {
            setSelectedIds([]);
        }
    };
    var clearSelection = function () {
        setSelectedIds([]);
    };
    return {
        selectedIds: selectedIds,
        isSelectAllChecked: isSelectAllChecked,
        toggleId: toggleId,
        selectAll: selectAll,
        clearSelection: clearSelection
    };
}
exports.useBulkActions = useBulkActions;
/**
 * Checkbox component for list items
 */
function BulkActionCheckbox(_a) {
    var id = _a.id, checked = _a.checked, onCheckedChange = _a.onCheckedChange, _b = _a.disabled, disabled = _b === void 0 ? false : _b;
    return (react_1["default"].createElement(checkbox_1.Checkbox, { checked: checked, onCheckedChange: onCheckedChange, disabled: disabled, className: "mr-2" }));
}
exports.BulkActionCheckbox = BulkActionCheckbox;
