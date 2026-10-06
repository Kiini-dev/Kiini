"use strict";
/**
 * ResponsiveButtonGroup Component
 * Mobile-first button groups that stack on mobile, arrange horizontally on desktop
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.ResponsiveActionButtons = exports.ResponsiveButtonGroup = void 0;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var responsive_utils_1 = require("@/lib/responsive-utils");
/**
 * Responsive button group component
 * - Stacks vertically on mobile
 * - Horizontal layout on desktop
 * - Responsive sizing
 */
exports.ResponsiveButtonGroup = function (_a) {
    var buttons = _a.buttons, _b = _a.orientation, orientation = _b === void 0 ? "horizontal" : _b, _c = _a.size, size = _c === void 0 ? "md" : _c, className = _a.className, _d = _a.responsive, responsive = _d === void 0 ? true : _d, _e = _a.scrollable, scrollable = _e === void 0 ? false : _e;
    var getButtonSize = function (s) {
        switch (s) {
            case "sm":
                return "text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5";
            case "lg":
                return "text-base sm:text-lg px-4 sm:px-6 py-2 sm:py-3";
            default:
                return "text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2";
        }
    };
    return (react_1["default"].createElement("div", { className: responsive_utils_1.cn(responsive
            ? "flex flex-col sm:flex-row gap-2 sm:gap-1 w-full sm:w-auto"
            : orientation === "vertical"
                ? "flex flex-col gap-2"
                : scrollable
                    ? "flex gap-2 overflow-x-auto pb-2"
                    : "flex flex-row gap-2", scrollable && "min-w-0", className) }, buttons.map(function (button) {
        var _a;
        return (react_1["default"].createElement(button_1.Button, __assign({ key: button.id || ((_a = button.label) === null || _a === void 0 ? void 0 : _a.toString()) }, button, { className: responsive_utils_1.cn(getButtonSize(size), responsive && "sm:flex-none", button.className) }), button.label));
    })));
};
/**
 * Action button group specifically for forms (Save, Cancel, etc.)
 */
exports.ResponsiveActionButtons = function (_a) {
    var onSave = _a.onSave, onCancel = _a.onCancel, onDelete = _a.onDelete, _b = _a.loading, loading = _b === void 0 ? false : _b, _c = _a.disabled, disabled = _c === void 0 ? false : _c, className = _a.className;
    var buttons = [];
    if (onDelete) {
        buttons.push({
            label: "Delete",
            id: "delete",
            variant: "destructive",
            onClick: onDelete,
            disabled: loading || disabled
        });
    }
    if (onCancel) {
        buttons.push({
            label: "Cancel",
            id: "cancel",
            variant: "outline",
            onClick: onCancel,
            disabled: loading
        });
    }
    if (onSave) {
        buttons.push({
            label: loading ? "Saving..." : "Save",
            id: "save",
            onClick: onSave,
            disabled: loading || disabled
        });
    }
    return (react_1["default"].createElement(exports.ResponsiveButtonGroup, { buttons: buttons, responsive: true, className: responsive_utils_1.cn("mt-4 sm:mt-6", className) }));
};
