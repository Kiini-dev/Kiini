"use strict";
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
exports.BrandCustomizationModal = void 0;
var react_1 = require("react");
var dialog_1 = require("@/components/ui/dialog");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var tabs_1 = require("@/components/ui/tabs");
var sonner_1 = require("sonner");
var ThemeCustomizationContext_1 = require("@/contexts/ThemeCustomizationContext");
var select_1 = require("@/components/ui/select");
/**
 * Brand Customization Modal
 *
 * Allows users (with proper permissions) to customize:
 * - Primary brand color
 * - Secondary accent color
 * - Border radius
 * - Logo/branding assets
 *
 * Changes apply immediately across the application
 */
exports.BrandCustomizationModal = function (_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose;
    var _b = ThemeCustomizationContext_1.useThemeCustomization(), primaryColor = _b.primaryColor, secondaryColor = _b.secondaryColor, borderRadius = _b.borderRadius, updateTheme = _b.updateTheme;
    var _c = react_1.useState({
        primaryColor: primaryColor || "#3b82f6",
        secondaryColor: secondaryColor || "#6366f1",
        borderRadius: borderRadius || "0.5rem"
    }), formData = _c[0], setFormData = _c[1];
    react_1.useEffect(function () {
        setFormData({
            primaryColor: primaryColor || "#3b82f6",
            secondaryColor: secondaryColor || "#6366f1",
            borderRadius: borderRadius || "0.5rem"
        });
    }, [primaryColor, secondaryColor, borderRadius, isOpen]);
    var handleSave = function () {
        try {
            updateTheme({
                primaryColor: formData.primaryColor,
                secondaryColor: formData.secondaryColor,
                borderRadius: formData.borderRadius
            });
            sonner_1.toast.success("Brand customization applied successfully!");
            onClose();
        }
        catch (error) {
            sonner_1.toast.error("Failed to apply customization: " + error.message);
        }
    };
    var handleReset = function () {
        setFormData({
            primaryColor: "#3b82f6",
            secondaryColor: "#6366f1",
            borderRadius: "0.5rem"
        });
        updateTheme({
            primaryColor: "#3b82f6",
            secondaryColor: "#6366f1",
            borderRadius: "0.5rem"
        });
        sonner_1.toast.success("Brand customization reset to defaults");
    };
    var presetThemes = [
        { name: "Blue", primary: "#3b82f6", secondary: "#6366f1" },
        { name: "Green", primary: "#10b981", secondary: "#34d399" },
        { name: "Purple", primary: "#8b5cf6", secondary: "#d8b4fe" },
        { name: "Red", primary: "#ef4444", secondary: "#fca5a5" },
        { name: "Slate", primary: "#64748b", secondary: "#cbd5e1" },
    ];
    return (react_1["default"].createElement(dialog_1.Dialog, { open: isOpen, onOpenChange: function (open) { return !open && onClose(); } },
        react_1["default"].createElement(dialog_1.DialogContent, { className: "sm:max-w-md" },
            react_1["default"].createElement(dialog_1.DialogHeader, null,
                react_1["default"].createElement(dialog_1.DialogTitle, null, "Brand Customization"),
                react_1["default"].createElement(dialog_1.DialogDescription, null, "Customize the brand colors and styling for your application. Changes apply instantly.")),
            react_1["default"].createElement(tabs_1.Tabs, { defaultValue: "colors", className: "w-full" },
                react_1["default"].createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-2" },
                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "colors" }, "Colors"),
                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "styling" }, "Styling")),
                react_1["default"].createElement(tabs_1.TabsContent, { value: "colors", className: "space-y-4 mt-4" },
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement(label_1.Label, { htmlFor: "primaryColor" }, "Primary Brand Color"),
                        react_1["default"].createElement("div", { className: "flex gap-2" },
                            react_1["default"].createElement("div", { className: "flex-1" },
                                react_1["default"].createElement(input_1.Input, { id: "primaryColor", type: "color", value: formData.primaryColor, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { primaryColor: e.target.value }));
                                    }, className: "h-10 w-full cursor-pointer" })),
                            react_1["default"].createElement(input_1.Input, { type: "text", value: formData.primaryColor, onChange: function (e) {
                                    return setFormData(__assign(__assign({}, formData), { primaryColor: e.target.value }));
                                }, className: "flex-1", placeholder: "#3b82f6" }))),
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement(label_1.Label, { htmlFor: "secondaryColor" }, "Secondary Accent Color"),
                        react_1["default"].createElement("div", { className: "flex gap-2" },
                            react_1["default"].createElement("div", { className: "flex-1" },
                                react_1["default"].createElement(input_1.Input, { id: "secondaryColor", type: "color", value: formData.secondaryColor, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { secondaryColor: e.target.value }));
                                    }, className: "h-10 w-full cursor-pointer" })),
                            react_1["default"].createElement(input_1.Input, { type: "text", value: formData.secondaryColor, onChange: function (e) {
                                    return setFormData(__assign(__assign({}, formData), { secondaryColor: e.target.value }));
                                }, className: "flex-1", placeholder: "#6366f1" }))),
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement(label_1.Label, null, "Preset Themes"),
                        react_1["default"].createElement("div", { className: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2" }, presetThemes.map(function (theme) { return (react_1["default"].createElement("button", { key: theme.name, onClick: function () {
                                return setFormData(__assign(__assign({}, formData), { primaryColor: theme.primary, secondaryColor: theme.secondary }));
                            }, className: "flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors", title: theme.name },
                            react_1["default"].createElement("div", { className: "flex gap-1" },
                                react_1["default"].createElement("div", { className: "h-4 w-4 rounded border", style: { backgroundColor: theme.primary } }),
                                react_1["default"].createElement("div", { className: "h-4 w-4 rounded border", style: { backgroundColor: theme.secondary } })),
                            react_1["default"].createElement("span", { className: "text-xs text-gray-600 dark:text-gray-400" }, theme.name))); })))),
                react_1["default"].createElement(tabs_1.TabsContent, { value: "styling", className: "space-y-4 mt-4" },
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement(label_1.Label, { htmlFor: "borderRadius" }, "Border Radius"),
                        react_1["default"].createElement(select_1.Select, { value: formData.borderRadius, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { borderRadius: value })); } },
                            react_1["default"].createElement(select_1.SelectTrigger, null,
                                react_1["default"].createElement(select_1.SelectValue, null)),
                            react_1["default"].createElement(select_1.SelectContent, null,
                                react_1["default"].createElement(select_1.SelectItem, { value: "0px" }, "Sharp (0px)"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "0.25rem" }, "Extra Small (4px)"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "0.375rem" }, "Small (6px)"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "0.5rem" }, "Medium (8px)"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "0.75rem" }, "Large (12px)"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "1rem" }, "Extra Large (16px)")))),
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement(label_1.Label, null, "Preview"),
                        react_1["default"].createElement("div", { className: "p-4 border rounded-lg space-y-3" },
                            react_1["default"].createElement("div", { className: "p-3 text-white font-semibold", style: {
                                    backgroundColor: formData.primaryColor,
                                    borderRadius: formData.borderRadius
                                } }, "Primary Button"),
                            react_1["default"].createElement("div", { className: "p-3 text-white font-semibold", style: {
                                    backgroundColor: formData.secondaryColor,
                                    borderRadius: formData.borderRadius
                                } }, "Secondary Button"))))),
            react_1["default"].createElement("div", { className: "flex gap-2 justify-end pt-4" },
                react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: handleReset }, "Reset to Defaults"),
                react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: onClose }, "Cancel"),
                react_1["default"].createElement(button_1.Button, { onClick: handleSave }, "Apply Changes")))));
};
exports["default"] = exports.BrandCustomizationModal;
