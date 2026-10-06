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
exports.__esModule = true;
exports.BulkActionsBar = void 0;
var button_1 = require("@/components/ui/button");
var checkbox_1 = require("@/components/ui/checkbox");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
function BulkActionsBar(_a) {
    var _this = this;
    var selectedCount = _a.selectedCount, onSelectAll = _a.onSelectAll, onDelete = _a.onDelete, onExport = _a.onExport, onDuplicate = _a.onDuplicate, totalCount = _a.totalCount, _b = _a.isLoading, isLoading = _b === void 0 ? false : _b;
    var _c = react_1.useState(false), deleteDialogOpen = _c[0], setDeleteDialogOpen = _c[1];
    var _d = react_1.useState(false), isDeleting = _d[0], setIsDeleting = _d[1];
    var _e = react_1.useState(false), isExporting = _e[0], setIsExporting = _e[1];
    var _f = react_1.useState(false), isDuplicating = _f[0], setIsDuplicating = _f[1];
    var handleDelete = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsDeleting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, onDelete()];
                case 2:
                    _a.sent();
                    sonner_1.toast.success(selectedCount + " item(s) deleted successfully");
                    setDeleteDialogOpen(false);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    sonner_1.toast.error("Failed to delete items");
                    return [3 /*break*/, 5];
                case 4:
                    setIsDeleting(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleExport = function (format) { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!onExport)
                        return [2 /*return*/];
                    setIsExporting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, onExport(format)];
                case 2:
                    _a.sent();
                    sonner_1.toast.success("Exported " + selectedCount + " item(s) as " + format.toUpperCase());
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    sonner_1.toast.error("Failed to export as " + format.toUpperCase());
                    return [3 /*break*/, 5];
                case 4:
                    setIsExporting(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleDuplicate = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!onDuplicate)
                        return [2 /*return*/];
                    setIsDuplicating(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, onDuplicate()];
                case 2:
                    _a.sent();
                    sonner_1.toast.success("Duplicated " + selectedCount + " item(s)");
                    return [3 /*break*/, 5];
                case 3:
                    error_3 = _a.sent();
                    sonner_1.toast.error("Failed to duplicate items");
                    return [3 /*break*/, 5];
                case 4:
                    setIsDuplicating(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    if (selectedCount === 0) {
        return null;
    }
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "sticky bottom-0 left-0 right-0 z-20 bg-primary text-primary-foreground px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2 sm:gap-4 shadow-lg rounded-t-lg" },
            React.createElement("div", { className: "flex items-center gap-3 sm:gap-4" },
                React.createElement(checkbox_1.Checkbox, { checked: selectedCount === totalCount && totalCount > 0, onCheckedChange: function (checked) { return onSelectAll(checked); }, className: "border-primary-foreground" }),
                React.createElement("span", { className: "text-sm font-medium" },
                    selectedCount,
                    " of ",
                    totalCount,
                    " selected")),
            React.createElement("div", { className: "flex flex-wrap items-center gap-1.5 sm:gap-2" },
                onExport && (React.createElement(dropdown_menu_1.DropdownMenu, null,
                    React.createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                        React.createElement(button_1.Button, { variant: "secondary", size: "sm", disabled: isExporting || isLoading, className: "gap-2" },
                            React.createElement(lucide_react_1.Download, { className: "h-4 w-4" }),
                            "Export",
                            React.createElement(lucide_react_1.ChevronDown, { className: "h-4 w-4" }))),
                    React.createElement(dropdown_menu_1.DropdownMenuContent, { align: "end" },
                        React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleExport("csv"); }, disabled: isExporting }, "Export as CSV"),
                        React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleExport("excel"); }, disabled: isExporting }, "Export as Excel"),
                        React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleExport("pdf"); }, disabled: isExporting }, "Export as PDF")))),
                onDuplicate && (React.createElement(button_1.Button, { variant: "secondary", size: "sm", onClick: handleDuplicate, disabled: isDuplicating || isLoading, className: "gap-2" }, isDuplicating ? (React.createElement(React.Fragment, null,
                    React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin" }),
                    "Duplicating...")) : (React.createElement(React.Fragment, null,
                    React.createElement(lucide_react_1.Copy, { className: "h-4 w-4" }),
                    "Duplicate")))),
                React.createElement(button_1.Button, { variant: "destructive", size: "sm", onClick: function () { return setDeleteDialogOpen(true); }, disabled: isDeleting || isLoading, className: "gap-2" }, isDeleting ? (React.createElement(React.Fragment, null,
                    React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin" }),
                    "Deleting...")) : (React.createElement(React.Fragment, null,
                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }),
                    "Delete"))),
                React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return onSelectAll(false); }, className: "gap-2" },
                    React.createElement(lucide_react_1.X, { className: "h-4 w-4" })))),
        React.createElement(alert_dialog_1.AlertDialog, { open: deleteDialogOpen, onOpenChange: setDeleteDialogOpen },
            React.createElement(alert_dialog_1.AlertDialogContent, null,
                React.createElement(alert_dialog_1.AlertDialogTitle, null,
                    "Delete ",
                    selectedCount,
                    " item(s)?"),
                React.createElement(alert_dialog_1.AlertDialogDescription, null, "This action cannot be undone. All selected items will be permanently deleted."),
                React.createElement("div", { className: "flex gap-2 justify-end" },
                    React.createElement(alert_dialog_1.AlertDialogCancel, null, "Cancel"),
                    React.createElement(alert_dialog_1.AlertDialogAction, { onClick: handleDelete, className: "bg-red-600 hover:bg-red-700", disabled: isDeleting }, isDeleting ? (React.createElement(React.Fragment, null,
                        React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
                        "Deleting...")) : ("Delete")))))));
}
exports.BulkActionsBar = BulkActionsBar;
