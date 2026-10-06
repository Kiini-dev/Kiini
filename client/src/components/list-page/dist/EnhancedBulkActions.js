"use strict";
exports.__esModule = true;
exports.bulkArchiveAction = exports.bulkSendAction = exports.bulkEmailAction = exports.bulkApproveAction = exports.bulkDeleteAction = exports.bulkCopyIdsAction = exports.bulkExportAction = exports.EnhancedBulkActions = void 0;
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var export_utils_1 = require("@/lib/export-utils");
var communications_1 = require("@/lib/communications");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var react_1 = require("react");
/**
 * Standardized bulk actions bar shown when table rows are selected.
 * Displays selection count, action buttons, and a clear button.
 */
function EnhancedBulkActions(_a) {
    var _b, _c, _d, _e, _f;
    var selectedCount = _a.selectedCount, onClear = _a.onClear, actions = _a.actions;
    var _g = react_1.useState({ open: false, action: null }), confirmDialog = _g[0], setConfirmDialog = _g[1];
    if (selectedCount === 0)
        return null;
    var handleAction = function (action) {
        if (action.confirm) {
            setConfirmDialog({ open: true, action: action });
        }
        else {
            action.onClick();
        }
    };
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "flex flex-wrap items-center gap-2 sm:gap-3 p-3 rounded-lg border bg-primary/5" },
            React.createElement("span", { className: "text-sm font-medium whitespace-nowrap" },
                selectedCount,
                " selected"),
            actions.map(function (action) { return (React.createElement(button_1.Button, { key: action.id, size: "sm", variant: action.variant || "outline", className: action.variant === "destructive"
                    ? "text-destructive border-destructive/30 hover:bg-destructive/10"
                    : "", onClick: function () { return handleAction(action); } },
                action.icon,
                React.createElement("span", { className: "hidden sm:inline ml-1" }, action.label))); }),
            React.createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: onClear },
                React.createElement(lucide_react_1.X, { className: "h-3.5 w-3.5" }),
                React.createElement("span", { className: "hidden sm:inline ml-1" }, "Clear"))),
        React.createElement(alert_dialog_1.AlertDialog, { open: confirmDialog.open, onOpenChange: function (open) {
                if (!open)
                    setConfirmDialog({ open: false, action: null });
            } },
            React.createElement(alert_dialog_1.AlertDialogContent, null,
                React.createElement(alert_dialog_1.AlertDialogTitle, null, "Confirm Action"),
                React.createElement(alert_dialog_1.AlertDialogDescription, null, ((_b = confirmDialog.action) === null || _b === void 0 ? void 0 : _b.confirmMessage) ||
                    "Are you sure you want to " + ((_d = (_c = confirmDialog.action) === null || _c === void 0 ? void 0 : _c.label) === null || _d === void 0 ? void 0 : _d.toLowerCase()) + " " + selectedCount + " item(s)? This action cannot be undone."),
                React.createElement("div", { className: "flex gap-2 justify-end" },
                    React.createElement(alert_dialog_1.AlertDialogCancel, null, "Cancel"),
                    React.createElement(alert_dialog_1.AlertDialogAction, { onClick: function () {
                            var _a;
                            (_a = confirmDialog.action) === null || _a === void 0 ? void 0 : _a.onClick();
                            setConfirmDialog({ open: false, action: null });
                        }, className: ((_e = confirmDialog.action) === null || _e === void 0 ? void 0 : _e.variant) === "destructive"
                            ? "bg-red-600 hover:bg-red-700"
                            : "" }, (_f = confirmDialog.action) === null || _f === void 0 ? void 0 : _f.label))))));
}
exports.EnhancedBulkActions = EnhancedBulkActions;
// =============================================
// Bulk action factory helpers
// =============================================
/** Creates a standard "Export CSV" bulk action */
function bulkExportAction(selectedIds, items, columns, filename) {
    return {
        id: "export",
        label: "Export",
        icon: React.createElement(lucide_react_1.Download, { className: "h-3.5 w-3.5" }),
        onClick: function () {
            var selected = items.filter(function (item) { return selectedIds.has(item.id); });
            var rows = selected.map(function (item) {
                var row = {};
                columns.forEach(function (col) {
                    var _a;
                    row[col.label] = (_a = item[col.key]) !== null && _a !== void 0 ? _a : "";
                });
                return row;
            });
            export_utils_1.downloadCSV(rows, filename);
        }
    };
}
exports.bulkExportAction = bulkExportAction;
/** Creates a standard "Copy IDs" bulk action */
function bulkCopyIdsAction(selectedIds) {
    return {
        id: "copyIds",
        label: "Copy IDs",
        icon: React.createElement(lucide_react_1.Copy, { className: "h-3.5 w-3.5" }),
        onClick: function () {
            navigator.clipboard.writeText(Array.from(selectedIds).join(", "));
            sonner_1.toast.success("Copied " + selectedIds.size + " IDs to clipboard");
        }
    };
}
exports.bulkCopyIdsAction = bulkCopyIdsAction;
/** Creates a standard "Delete" bulk action with confirmation */
function bulkDeleteAction(selectedIds, onDelete, label) {
    if (label === void 0) { label = "Delete"; }
    return {
        id: "delete",
        label: label,
        icon: React.createElement(lucide_react_1.Trash2, { className: "h-3.5 w-3.5" }),
        variant: "destructive",
        confirm: true,
        confirmMessage: "Are you sure you want to delete " + selectedIds.size + " item(s)? This action cannot be undone.",
        onClick: function () { return onDelete(Array.from(selectedIds)); }
    };
}
exports.bulkDeleteAction = bulkDeleteAction;
/** Creates an "Approve" bulk action */
function bulkApproveAction(selectedIds, onApprove) {
    return {
        id: "approve",
        label: "Approve",
        icon: React.createElement(lucide_react_1.Check, { className: "h-3.5 w-3.5" }),
        onClick: function () { return onApprove(Array.from(selectedIds)); }
    };
}
exports.bulkApproveAction = bulkApproveAction;
/** Creates an "Email" bulk action */
function bulkEmailAction(navigate, currentPath) {
    if (currentPath === void 0) { currentPath = window.location.pathname; }
    return {
        id: "email",
        label: "Email",
        icon: React.createElement(lucide_react_1.Mail, { className: "h-3.5 w-3.5" }),
        onClick: function () { return navigate(communications_1.buildCommunicationComposePath(currentPath)); }
    };
}
exports.bulkEmailAction = bulkEmailAction;
/** Creates a "Send" bulk action */
function bulkSendAction(selectedIds, onSend) {
    return {
        id: "send",
        label: "Send",
        icon: React.createElement(lucide_react_1.Send, { className: "h-3.5 w-3.5" }),
        onClick: function () { return onSend(Array.from(selectedIds)); }
    };
}
exports.bulkSendAction = bulkSendAction;
/** Creates an "Archive" bulk action */
function bulkArchiveAction(selectedIds, onArchive) {
    return {
        id: "archive",
        label: "Archive",
        icon: React.createElement(lucide_react_1.Archive, { className: "h-3.5 w-3.5" }),
        confirm: true,
        confirmMessage: "Archive " + selectedIds.size + " item(s)?",
        onClick: function () { return onArchive(Array.from(selectedIds)); }
    };
}
exports.bulkArchiveAction = bulkArchiveAction;
