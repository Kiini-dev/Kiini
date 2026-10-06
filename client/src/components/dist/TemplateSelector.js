"use strict";
/**
 * TemplateSelector Component
 * Dropdown for selecting document templates (invoices, proposals, etc.) before export
 */
exports.__esModule = true;
exports.useTemplateSelector = exports.TemplateSelectorModal = exports.TemplateSelector = void 0;
var react_1 = require("react");
var select_1 = require("@/components/ui/select");
var dialog_1 = require("@/components/ui/dialog");
var button_1 = require("@/components/ui/button");
var responsive_utils_1 = require("@/lib/responsive-utils");
var lucide_react_1 = require("lucide-react");
/**
 * Dropdown template selector for quick selection
 */
exports.TemplateSelector = function (_a) {
    var templates = _a.templates, _b = _a.loading, loading = _b === void 0 ? false : _b, onSelect = _a.onSelect, category = _a.category, defaultTemplate = _a.defaultTemplate, _c = _a.showPreview, showPreview = _c === void 0 ? false : _c;
    var _d = react_1.useState(defaultTemplate || ""), selectedId = _d[0], setSelectedId = _d[1];
    var filtered = category
        ? templates.filter(function (t) { return t.category === category; })
        : templates;
    var selected = filtered.find(function (t) { return t.id === selectedId; });
    var handleSelect = function (id) {
        setSelectedId(id);
        onSelect(id);
    };
    return (react_1["default"].createElement("div", { className: "w-full space-y-2" },
        react_1["default"].createElement("label", { className: "text-sm font-medium" }, "Select Template"),
        react_1["default"].createElement("div", { className: "flex gap-2 items-end flex-col sm:flex-row w-full sm:w-auto" },
            react_1["default"].createElement(select_1.Select, { value: selectedId, onValueChange: handleSelect, disabled: loading },
                react_1["default"].createElement(select_1.SelectTrigger, { className: "w-full sm:w-64" },
                    react_1["default"].createElement(select_1.SelectValue, { placeholder: "Choose a template..." })),
                react_1["default"].createElement(select_1.SelectContent, null, filtered.map(function (template) { return (react_1["default"].createElement(select_1.SelectItem, { key: template.id, value: template.id },
                    react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.FileText, { className: "w-4 h-4" }),
                        template.name))); }))),
            loading && react_1["default"].createElement(lucide_react_1.Loader2, { className: "w-4 h-4 animate-spin" })),
        (selected === null || selected === void 0 ? void 0 : selected.description) && (react_1["default"].createElement("p", { className: "text-xs sm:text-sm text-muted-foreground" }, selected.description)),
        showPreview && (selected === null || selected === void 0 ? void 0 : selected.preview) && (react_1["default"].createElement("div", { className: "mt-2 p-2 sm:p-3 rounded border border-border bg-muted/50" },
            react_1["default"].createElement("img", { src: selected.preview, alt: selected.name + " preview", className: "max-h-48 w-auto" })))));
};
/**
 * Modal template selector with preview
 */
exports.TemplateSelectorModal = function (_a) {
    var templates = _a.templates, _b = _a.loading, loading = _b === void 0 ? false : _b, onSelect = _a.onSelect, category = _a.category, defaultTemplate = _a.defaultTemplate, _c = _a.open, open = _c === void 0 ? false : _c, onOpenChange = _a.onOpenChange, onConfirm = _a.onConfirm, _d = _a.title, title = _d === void 0 ? "Select Template" : _d;
    var _e = react_1.useState(defaultTemplate || ""), selectedId = _e[0], setSelectedId = _e[1];
    var _f = react_1.useState(open), isOpen = _f[0], setIsOpen = _f[1];
    react_1.useEffect(function () {
        setIsOpen(open);
    }, [open]);
    var filtered = category
        ? templates.filter(function (t) { return t.category === category; })
        : templates;
    var selected = filtered.find(function (t) { return t.id === selectedId; });
    var handleSelect = function (id) {
        setSelectedId(id);
        onSelect(id);
    };
    var handleConfirm = function () {
        if (selectedId) {
            onConfirm === null || onConfirm === void 0 ? void 0 : onConfirm(selectedId);
            setIsOpen(false);
            onOpenChange === null || onOpenChange === void 0 ? void 0 : onOpenChange(false);
        }
    };
    var handleOpenChange = function (newOpen) {
        setIsOpen(newOpen);
        onOpenChange === null || onOpenChange === void 0 ? void 0 : onOpenChange(newOpen);
    };
    return (react_1["default"].createElement(dialog_1.Dialog, { open: isOpen, onOpenChange: handleOpenChange },
        react_1["default"].createElement(dialog_1.DialogContent, { className: responsive_utils_1.cn("w-full sm:max-w-md md:max-w-lg", "max-h-[90vh] sm:max-h-[85vh] overflow-y-auto") },
            react_1["default"].createElement(dialog_1.DialogHeader, null,
                react_1["default"].createElement(dialog_1.DialogTitle, { className: "text-base sm:text-lg" }, title),
                react_1["default"].createElement(dialog_1.DialogDescription, { className: "text-xs sm:text-sm" }, "Choose a template for your document")),
            react_1["default"].createElement("div", { className: "space-y-4 py-4" },
                react_1["default"].createElement(select_1.Select, { value: selectedId, onValueChange: handleSelect, disabled: loading },
                    react_1["default"].createElement(select_1.SelectTrigger, { className: "w-full" },
                        react_1["default"].createElement(select_1.SelectValue, { placeholder: "Choose a template..." })),
                    react_1["default"].createElement(select_1.SelectContent, null, filtered.map(function (template) { return (react_1["default"].createElement(select_1.SelectItem, { key: template.id, value: template.id },
                        react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                            react_1["default"].createElement(lucide_react_1.FileText, { className: "w-4 h-4" }),
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("div", { className: "font-medium" }, template.name),
                                template.description && (react_1["default"].createElement("div", { className: "text-xs text-muted-foreground" }, template.description)))))); }))),
                (selected === null || selected === void 0 ? void 0 : selected.preview) && (react_1["default"].createElement("div", { className: "border border-border rounded-lg overflow-hidden bg-muted/50" },
                    react_1["default"].createElement("div", { className: "text-xs sm:text-sm font-medium p-2 sm:p-3 border-b border-border" }, "Preview"),
                    react_1["default"].createElement("div", { className: "p-2 sm:p-3 overflow-x-auto max-h-96" },
                        react_1["default"].createElement("img", { src: selected.preview, alt: selected.name + " preview", className: "w-full h-auto" }))))),
            react_1["default"].createElement(dialog_1.DialogFooter, { className: "gap-2 flex flex-col-reverse sm:flex-row" },
                react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return handleOpenChange(false); }, className: "w-full sm:w-auto", disabled: loading }, "Cancel"),
                react_1["default"].createElement(button_1.Button, { onClick: handleConfirm, disabled: !selectedId || loading, className: "w-full sm:w-auto" }, loading ? (react_1["default"].createElement(react_1["default"].Fragment, null,
                    react_1["default"].createElement(lucide_react_1.Loader2, { className: "w-4 h-4 mr-2 animate-spin" }),
                    "Loading...")) : ("Use Template"))))));
};
/**
 * Hook for managing template selection state
 */
function useTemplateSelector(defaultTemplate) {
    var _a = react_1.useState(defaultTemplate || ""), selectedTemplate = _a[0], setSelectedTemplate = _a[1];
    var _b = react_1.useState(false), isModalOpen = _b[0], setIsModalOpen = _b[1];
    return {
        selectedTemplate: selectedTemplate,
        setSelectedTemplate: setSelectedTemplate,
        isModalOpen: isModalOpen,
        setIsModalOpen: setIsModalOpen,
        openModal: function () { return setIsModalOpen(true); },
        closeModal: function () { return setIsModalOpen(false); }
    };
}
exports.useTemplateSelector = useTemplateSelector;
