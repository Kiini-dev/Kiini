"use strict";
/**
 * Phase 10: CustomFieldRenderer Component
 * Dynamically renders custom fields based on their type
 * Production-ready with comprehensive field type support
 */
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.CustomFieldGroup = exports.CustomFieldRenderer = void 0;
var sonner_1 = require("sonner");
var react_1 = require("react");
var PhoneInput_1 = require("@/components/PhoneInput");
require("../styles/customFieldsManager.css");
function CustomFieldRenderer(_a) {
    var _b, _c, _d;
    var fieldProp = _a.field, value = _a.value, onChange = _a.onChange, onBlur = _a.onBlur, error = _a.error, touched = _a.touched, disabled = _a.disabled, overrideRequired = _a.required, _e = _a.readOnly, readOnly = _e === void 0 ? false : _e, _f = _a.className, className = _f === void 0 ? '' : _f;
    // Cast to extended field with type-specific properties
    var field = fieldProp;
    var isRequired = overrideRequired !== undefined ? overrideRequired : field.required;
    var showError = touched && !!error;
    var isDisabled = disabled || readOnly;
    var handleChange = react_1.useCallback(function (newValue) {
        if (!readOnly && onChange) {
            onChange(newValue);
        }
    }, [onChange, readOnly]);
    var fieldClasses = "custom-field custom-field-" + field.fieldType + " " + (error ? 'has-error' : '') + " " + (disabled ? 'disabled' : '') + " " + className;
    var labelClasses = "field-label " + (isRequired ? 'required' : '');
    switch (field.fieldType) {
        case 'text':
            return (react_1["default"].createElement("div", { className: fieldClasses },
                react_1["default"].createElement("label", { className: labelClasses }, field.fieldLabel),
                react_1["default"].createElement("input", { type: "text", value: value || '', onChange: function (e) { return handleChange(e.target.value); }, onBlur: onBlur, placeholder: field.placeholder || '', disabled: isDisabled, className: "form-input", maxLength: field.maxLength, minLength: field.minLength, "aria-label": field.fieldLabel, "aria-invalid": showError, "aria-describedby": showError ? "error-" + field.id : undefined }),
                field.maxLength && (react_1["default"].createElement("span", { style: { fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' } },
                    (value || '').length,
                    " / ",
                    field.maxLength)),
                field.fieldDescription && react_1["default"].createElement("p", { className: "field-hint" }, field.fieldDescription),
                showError && react_1["default"].createElement("span", { className: "error-message", id: "error-" + field.id }, error)));
        case 'number':
            return (react_1["default"].createElement("div", { className: fieldClasses },
                react_1["default"].createElement("label", { className: labelClasses }, field.fieldLabel),
                react_1["default"].createElement("input", { type: "number", value: value || '', onChange: function (e) { return handleChange(e.target.value === '' ? null : parseFloat(e.target.value)); }, onBlur: onBlur, placeholder: field.placeholder || '', disabled: isDisabled, className: "form-input", min: field.minValue, max: field.maxValue, step: field.decimals ? Math.pow(10, -field.decimals) : 1, "aria-label": field.fieldLabel, "aria-invalid": showError }),
                field.fieldDescription && react_1["default"].createElement("p", { className: "field-hint" }, field.fieldDescription),
                showError && react_1["default"].createElement("span", { className: "error-message", id: "error-" + field.id }, error)));
        case 'email':
            return (react_1["default"].createElement("div", { className: fieldClasses },
                react_1["default"].createElement("label", { className: labelClasses }, field.fieldLabel),
                react_1["default"].createElement("input", { type: "email", value: value || '', onChange: function (e) { return handleChange(e.target.value); }, onBlur: onBlur, placeholder: field.placeholder || '', disabled: isDisabled, className: "form-input", "aria-label": field.fieldLabel, "aria-invalid": showError }),
                field.fieldDescription && react_1["default"].createElement("p", { className: "field-hint" }, field.fieldDescription),
                showError && react_1["default"].createElement("span", { className: "error-message", id: "error-" + field.id }, error)));
        case 'phone':
            return (react_1["default"].createElement("div", { className: fieldClasses },
                react_1["default"].createElement(PhoneInput_1.PhoneInput, { id: "phone-" + field.id, label: field.fieldLabel, required: isRequired, value: value || '', onChange: handleChange, placeholder: field.placeholder || '700 000 000', className: "w-full" }),
                field.fieldDescription && react_1["default"].createElement("p", { className: "field-hint" }, field.fieldDescription),
                showError && react_1["default"].createElement("span", { className: "error-message", id: "error-" + field.id }, error)));
        case 'date':
            return (react_1["default"].createElement("div", { className: fieldClasses },
                react_1["default"].createElement("label", { className: labelClasses }, field.fieldLabel),
                react_1["default"].createElement("input", { type: "date", value: value ? (typeof value === 'string' ? value : value.toISOString().split('T')[0]) : '', onChange: function (e) { return handleChange(e.target.value ? new Date(e.target.value) : null); }, onBlur: onBlur, disabled: isDisabled, className: "form-input", min: (_b = field.minDate) === null || _b === void 0 ? void 0 : _b.toISOString().split('T')[0], max: (_c = field.maxDate) === null || _c === void 0 ? void 0 : _c.toISOString().split('T')[0], "aria-label": field.fieldLabel, "aria-invalid": showError }),
                field.fieldDescription && react_1["default"].createElement("p", { className: "field-hint" }, field.fieldDescription),
                showError && react_1["default"].createElement("span", { className: "error-message", id: "error-" + field.id }, error)));
        case 'select':
            return (react_1["default"].createElement("div", { className: fieldClasses },
                react_1["default"].createElement("label", { className: labelClasses }, field.fieldLabel),
                react_1["default"].createElement("select", { value: value || '', onChange: function (e) { return handleChange(e.target.value); }, onBlur: onBlur, disabled: isDisabled, className: "form-select", "aria-label": field.fieldLabel, "aria-invalid": showError },
                    react_1["default"].createElement("option", { value: "" }, field.placeholder || "-- Select " + field.fieldLabel + " --"),
                    (field.options || []).map(function (opt) {
                        var option = typeof opt.value !== 'undefined'
                            ? opt
                            : { value: String(opt), label: String(opt) };
                        return (react_1["default"].createElement("option", { key: option.value, value: option.value }, option.label));
                    })),
                field.fieldDescription && react_1["default"].createElement("p", { className: "field-hint" }, field.fieldDescription),
                showError && react_1["default"].createElement("span", { className: "error-message", id: "error-" + field.id }, error)));
        case 'multiSelect':
            var selectedValues_1 = Array.isArray(value) ? value : value ? [value] : [];
            return (react_1["default"].createElement("div", { className: fieldClasses },
                react_1["default"].createElement("label", { className: labelClasses }, field.fieldLabel),
                react_1["default"].createElement("div", { className: "multi-select-container" }, field.options && field.options.length > 0 ? (field.options.map(function (opt) {
                    var option = typeof opt.value !== 'undefined'
                        ? opt
                        : { value: String(opt), label: String(opt) };
                    return (react_1["default"].createElement("label", { key: option.value, className: "checkbox-label" },
                        react_1["default"].createElement("input", { type: "checkbox", checked: selectedValues_1.includes(option.value), onChange: function (e) {
                                if (e.target.checked) {
                                    handleChange(__spreadArrays(selectedValues_1, [option.value]));
                                }
                                else {
                                    handleChange(selectedValues_1.filter(function (v) { return v !== option.value; }));
                                }
                            }, disabled: isDisabled }),
                        react_1["default"].createElement("span", null, option.label)));
                })) : (react_1["default"].createElement("p", { style: { color: '#9ca3af', margin: 0 } }, "No options available"))),
                field.fieldDescription && react_1["default"].createElement("p", { className: "field-hint" }, field.fieldDescription),
                showError && react_1["default"].createElement("span", { className: "error-message", id: "error-" + field.id }, error)));
        case 'checkbox':
            return (react_1["default"].createElement("div", { className: fieldClasses },
                react_1["default"].createElement("label", { className: "checkbox-label" },
                    react_1["default"].createElement("input", { type: "checkbox", checked: !!value, onChange: function (e) { return handleChange(e.target.checked); }, onBlur: onBlur, disabled: isDisabled }),
                    react_1["default"].createElement("span", null, field.fieldLabel)),
                field.fieldDescription && react_1["default"].createElement("p", { className: "field-hint" }, field.fieldDescription),
                showError && react_1["default"].createElement("span", { className: "error-message", id: "error-" + field.id }, error)));
        case 'richText':
            return (react_1["default"].createElement("div", { className: fieldClasses },
                react_1["default"].createElement("label", { className: labelClasses }, field.fieldLabel),
                react_1["default"].createElement("textarea", { value: value || '', onChange: function (e) { return handleChange(e.target.value); }, onBlur: onBlur, placeholder: field.placeholder || '', disabled: isDisabled, className: "form-textarea", rows: 5, "aria-label": field.fieldLabel, "aria-invalid": showError }),
                field.fieldDescription && react_1["default"].createElement("p", { className: "field-hint" }, field.fieldDescription),
                showError && react_1["default"].createElement("span", { className: "error-message", id: "error-" + field.id }, error)));
        case 'file':
            return (react_1["default"].createElement("div", { className: fieldClasses },
                react_1["default"].createElement("label", { className: labelClasses }, field.fieldLabel),
                react_1["default"].createElement("input", { type: "file", onChange: function (e) {
                        var files = e.target.files;
                        if (!files)
                            return;
                        // Check file count
                        if (field.maxFiles && files.length > field.maxFiles) {
                            sonner_1.toast.error("You can only upload up to " + field.maxFiles + " file(s)");
                            return;
                        }
                        // Check file types
                        if (field.allowedMimeTypes && field.allowedMimeTypes.length > 0) {
                            for (var i = 0; i < files.length; i++) {
                                if (!field.allowedMimeTypes.includes(files[i].type)) {
                                    sonner_1.toast.error("File type not allowed: " + files[i].name);
                                    return;
                                }
                            }
                        }
                        // Check file size
                        if (field.maxFileSize) {
                            for (var i = 0; i < files.length; i++) {
                                if (files[i].size > field.maxFileSize) {
                                    sonner_1.toast.error("File too large: " + files[i].name + ". Max: " + (field.maxFileSize / 1024 / 1024).toFixed(2) + "MB");
                                    return;
                                }
                            }
                        }
                        handleChange(files);
                    }, onBlur: onBlur, disabled: isDisabled, className: "form-input-file", multiple: field.maxFiles !== 1, accept: (_d = field.allowedMimeTypes) === null || _d === void 0 ? void 0 : _d.join(','), "aria-label": field.fieldLabel, "aria-invalid": showError }),
                field.allowedMimeTypes && (react_1["default"].createElement("p", { style: { fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' } },
                    "Allowed: ",
                    field.allowedMimeTypes.join(', '))),
                field.maxFileSize && (react_1["default"].createElement("p", { style: { fontSize: '0.85rem', color: '#6b7280' } },
                    "Max: ",
                    (field.maxFileSize / 1024 / 1024).toFixed(2),
                    "MB")),
                field.fieldDescription && react_1["default"].createElement("p", { className: "field-hint" }, field.fieldDescription),
                showError && react_1["default"].createElement("span", { className: "error-message", id: "error-" + field.id }, error)));
        case 'currency':
            var currencySymbols = {
                USD: '$',
                EUR: '€',
                GBP: '£',
                JPY: '¥',
                INR: '₹',
                AUD: 'A$',
                CAD: 'C$',
                KES: 'KES'
            };
            var currency = field.currency || 'USD';
            var symbol = currencySymbols[currency] || currency;
            return (react_1["default"].createElement("div", { className: fieldClasses },
                react_1["default"].createElement("label", { className: labelClasses }, field.fieldLabel),
                react_1["default"].createElement("div", { className: "currency-input-wrapper" },
                    react_1["default"].createElement("span", { className: "currency-symbol" }, symbol),
                    react_1["default"].createElement("input", { type: "number", value: value || '', onChange: function (e) { return handleChange(e.target.value === '' ? null : parseFloat(e.target.value)); }, onBlur: onBlur, placeholder: field.placeholder || '0.00', disabled: isDisabled, className: "form-input currency-input", step: "0.01", min: "0", "aria-label": field.fieldLabel, "aria-invalid": showError })),
                field.fieldDescription && react_1["default"].createElement("p", { className: "field-hint" }, field.fieldDescription),
                showError && react_1["default"].createElement("span", { className: "error-message", id: "error-" + field.id }, error)));
        default:
            return (react_1["default"].createElement("div", { className: fieldClasses },
                react_1["default"].createElement("p", { className: "warning-message" },
                    "Unknown field type: ",
                    field.fieldType)));
    }
}
exports.CustomFieldRenderer = CustomFieldRenderer;
function CustomFieldGroup(_a) {
    var fields = _a.fields, values = _a.values, onChange = _a.onChange, onBlur = _a.onBlur, errors = _a.errors, touched = _a.touched, disabled = _a.disabled;
    var sortedFields = __spreadArrays(fields).sort(function (a, b) { return a.displayOrder - b.displayOrder; });
    return (react_1["default"].createElement("div", { className: "custom-field-group" }, sortedFields.map(function (field) { return (react_1["default"].createElement(CustomFieldRenderer, { key: field.id, field: field, value: values[field.id], onChange: function (value) { return onChange(field.id, value); }, onBlur: function () { return onBlur === null || onBlur === void 0 ? void 0 : onBlur(field.id); }, error: errors === null || errors === void 0 ? void 0 : errors[field.id], touched: touched === null || touched === void 0 ? void 0 : touched[field.id], disabled: disabled })); })));
}
exports.CustomFieldGroup = CustomFieldGroup;
