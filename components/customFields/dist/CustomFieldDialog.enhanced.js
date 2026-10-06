"use strict";
/**
 * Enhanced CustomFieldDialog Component with Real-Time Validation
 * Shows validation errors as user types, not just on submit
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
var react_1 = require("react");
var customFields_1 = require("../types/customFields");
var iconSystem_1 = require("./iconSystem");
var errorHandling_1 = require("./errorHandling");
var helpSystem_1 = require("./helpSystem");
var defaultFormData = {
    fieldName: '',
    fieldLabel: '',
    fieldType: 'text',
    description: '',
    required: false,
    displayOrder: 0,
    maxLength: 255
};
/**
 * Enhanced dialog component
 */
var CustomFieldDialog = function (_a) {
    var mode = _a.mode, field = _a.field, entityType = _a.entityType, existingFields = _a.existingFields, onSave = _a.onSave, onCancel = _a.onCancel, onError = _a.onError;
    var _b = react_1.useState(field ? __assign(__assign({}, defaultFormData), field) : defaultFormData), formData = _b[0], setFormData = _b[1];
    var _c = react_1.useState({}), errors = _c[0], setErrors = _c[1];
    var _d = react_1.useState({}), touched = _d[0], setTouched = _d[1];
    var _e = react_1.useState(field && (field.fieldType === 'select' || field.fieldType === 'multiSelect')
        ? field.options || []
        : []), selectOptions = _e[0], setSelectOptions = _e[1];
    var _f = react_1.useState(''), newOption = _f[0], setNewOption = _f[1];
    var _g = react_1.useState(false), saving = _g[0], setSaving = _g[1];
    // Get existing field names (excluding current field if editing)
    var existingFieldNames = react_1.useMemo(function () { return existingFields
        .filter(function (f) { return f.id !== (field === null || field === void 0 ? void 0 : field.id); })
        .map(function (f) { return f.fieldName; }); }, [existingFields, field === null || field === void 0 ? void 0 : field.id]);
    /**
     * Real-time validation for field name
     */
    var validateNameField = react_1.useCallback(function (name) {
        var validation = errorHandling_1.validateFieldName(name, existingFieldNames, field === null || field === void 0 ? void 0 : field.id);
        if (!validation.valid && touched.fieldName) {
            setErrors(function (prev) { return (__assign(__assign({}, prev), { fieldName: validation.error })); });
        }
        else {
            setErrors(function (prev) {
                var next = __assign({}, prev);
                delete next.fieldName;
                return next;
            });
        }
        return validation.valid;
    }, [existingFieldNames, field === null || field === void 0 ? void 0 : field.id, touched.fieldName]);
    /**
     * Real-time validation for field label
     */
    var validateLabelField = react_1.useCallback(function (label) {
        var validation = errorHandling_1.validateFieldLabel(label);
        if (!validation.valid && touched.fieldLabel) {
            setErrors(function (prev) { return (__assign(__assign({}, prev), { fieldLabel: validation.error })); });
        }
        else {
            setErrors(function (prev) {
                var next = __assign({}, prev);
                delete next.fieldLabel;
                return next;
            });
        }
        return validation.valid;
    }, [touched.fieldLabel]);
    /**
     * Real-time validation for select options
     */
    var validateOptionsField = react_1.useCallback(function (options, fieldType) {
        if (!['select', 'multiSelect'].includes(fieldType)) {
            return true;
        }
        var validation = errorHandling_1.validateSelectOptions(options, fieldType);
        if (!validation.valid && touched.options) {
            setErrors(function (prev) { return (__assign(__assign({}, prev), { options: validation.error })); });
        }
        else {
            setErrors(function (prev) {
                var next = __assign({}, prev);
                delete next.options;
                return next;
            });
        }
        return validation.valid;
    }, [touched.options]);
    /**
     * Handle field name change with real-time validation
     */
    var handleFieldNameChange = react_1.useCallback(function (value) {
        setFormData(function (prev) { return (__assign(__assign({}, prev), { fieldName: value })); });
        if (touched.fieldName) {
            validateNameField(value);
        }
    }, [touched.fieldName, validateNameField]);
    /**
     * Handle field label change with real-time validation
     */
    var handleFieldLabelChange = react_1.useCallback(function (value) {
        setFormData(function (prev) { return (__assign(__assign({}, prev), { fieldLabel: value })); });
        if (touched.fieldLabel) {
            validateLabelField(value);
        }
    }, [touched.fieldLabel, validateLabelField]);
    /**
     * Handle field blur (mark as touched)
     */
    var handleFieldBlur = react_1.useCallback(function (fieldName) {
        setTouched(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[fieldName] = true, _a)));
        });
        // Validate on blur
        if (fieldName === 'fieldName') {
            validateNameField(formData.fieldName);
        }
        else if (fieldName === 'fieldLabel') {
            validateLabelField(formData.fieldLabel);
        }
        else if (fieldName === 'options') {
            validateOptionsField(selectOptions, formData.fieldType);
        }
    }, [formData.fieldName, formData.fieldLabel, formData.fieldType, selectOptions, validateNameField, validateLabelField, validateOptionsField]);
    /**
     * Handle add option
     */
    var handleAddOption = react_1.useCallback(function () {
        if (newOption.trim()) {
            setSelectOptions(function (prev) { return __spreadArrays(prev, [newOption.trim()]); });
            setNewOption('');
            // Revalidate options on change
            validateOptionsField(__spreadArrays(selectOptions, [newOption.trim()]), formData.fieldType);
        }
    }, [newOption, selectOptions, formData.fieldType, validateOptionsField]);
    /**
     * Handle remove option
     */
    var handleRemoveOption = react_1.useCallback(function (index) {
        setSelectOptions(function (prev) { return prev.filter(function (_, i) { return i !== index; }); });
        var updated = selectOptions.filter(function (_, i) { return i !== index; });
        validateOptionsField(updated, formData.fieldType);
    }, [selectOptions, formData.fieldType, validateOptionsField]);
    /**
     * Validate entire form before save
     */
    var validateForm = react_1.useCallback(function () {
        var newErrors = {};
        // Validate field name
        var nameValidation = errorHandling_1.validateFieldName(formData.fieldName, existingFieldNames, field === null || field === void 0 ? void 0 : field.id);
        if (!nameValidation.valid) {
            newErrors.fieldName = nameValidation.error;
        }
        // Validate field label
        var labelValidation = errorHandling_1.validateFieldLabel(formData.fieldLabel);
        if (!labelValidation.valid) {
            newErrors.fieldLabel = labelValidation.error;
        }
        // Validate select options
        if (['select', 'multiSelect'].includes(formData.fieldType)) {
            var optionsValidation = errorHandling_1.validateSelectOptions(selectOptions, formData.fieldType);
            if (!optionsValidation.valid) {
                newErrors.options = optionsValidation.error;
            }
        }
        setErrors(newErrors);
        setTouched({
            fieldName: true,
            fieldLabel: true,
            options: true
        });
        return Object.keys(newErrors).length === 0;
    }, [formData, existingFieldNames, field === null || field === void 0 ? void 0 : field.id, selectOptions]);
    /**
     * Handle form save
     */
    var handleSave = react_1.useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var announcement_1, savedField;
        var _a, _b;
        return __generator(this, function (_c) {
            if (!validateForm()) {
                announcement_1 = document.createElement('div');
                announcement_1.setAttribute('role', 'alert');
                announcement_1.setAttribute('aria-live', 'assertive');
                announcement_1.textContent = "Form validation failed. Please fix " + Object.keys(errors).length + " error(s).";
                document.body.appendChild(announcement_1);
                setTimeout(function () { return announcement_1.remove(); }, 3000);
                return [2 /*return*/];
            }
            setSaving(true);
            try {
                savedField = {
                    id: (field === null || field === void 0 ? void 0 : field.id) || "field-" + Date.now(),
                    organizationId: (field === null || field === void 0 ? void 0 : field.organizationId) || 'org-1',
                    entityType: entityType,
                    fieldName: formData.fieldName,
                    fieldLabel: formData.fieldLabel,
                    fieldType: formData.fieldType,
                    required: formData.required,
                    displayOrder: formData.displayOrder,
                    isActive: (_a = field === null || field === void 0 ? void 0 : field.isActive) !== null && _a !== void 0 ? _a : true,
                    options: ['select', 'multiSelect'].includes(formData.fieldType) ? selectOptions : undefined,
                    placeholder: formData.placeholder,
                    description: formData.description,
                    minLength: formData.minLength,
                    maxLength: formData.maxLength,
                    minValue: formData.minValue,
                    maxValue: formData.maxValue,
                    minDate: formData.minDate,
                    maxDate: formData.maxDate,
                    currency: formData.currency,
                    decimalPlaces: formData.decimalPlaces,
                    allowedMimeTypes: (_b = formData.allowedMimeTypes) === null || _b === void 0 ? void 0 : _b.split(',').map(function (s) { return s.trim(); }),
                    maxFileSize: formData.maxFileSize,
                    regex: formData.regex,
                    createdAt: (field === null || field === void 0 ? void 0 : field.createdAt) || new Date(),
                    updatedAt: new Date()
                };
                onSave(savedField);
            }
            catch (error) {
                if (onError) {
                    // onError will handle the error display
                }
            }
            finally {
                setSaving(false);
            }
            return [2 /*return*/];
        });
    }); }, [validateForm, errors, field, entityType, formData, selectOptions, onSave, onError]);
    /**
     * Get validation status icon
     */
    var getFieldStatus = function (fieldName) {
        if (!touched[fieldName])
            return null;
        if (errors[fieldName]) {
            return react_1["default"].createElement(iconSystem_1["default"], { name: "x", size: 16, color: "var(--color-error)" });
        }
        return react_1["default"].createElement(iconSystem_1["default"], { name: "check", size: 16, color: "var(--color-success)" });
    };
    return (react_1["default"].createElement("div", { className: "dialog-overlay", role: "presentation", onClick: onCancel },
        react_1["default"].createElement("div", { className: "dialog", role: "dialog", onClick: function (e) { return e.stopPropagation(); } },
            react_1["default"].createElement("div", { className: "dialog-header" },
                react_1["default"].createElement("h2", null, mode === 'create' ? 'Create Custom Field' : "Edit " + (field === null || field === void 0 ? void 0 : field.fieldLabel)),
                react_1["default"].createElement("button", { className: "dialog-close", onClick: onCancel, "aria-label": "Close dialog", type: "button" }, "\u2715")),
            react_1["default"].createElement("div", { className: "dialog-body" },
                react_1["default"].createElement("div", { className: "form-group" },
                    react_1["default"].createElement("label", { htmlFor: "fieldName", className: "form-label" },
                        "Field Name",
                        react_1["default"].createElement(helpSystem_1.HelpIcon, { content: "Unique identifier (alphanumeric + underscore)" })),
                    react_1["default"].createElement("div", { style: { position: 'relative', display: 'flex', alignItems: 'center' } },
                        react_1["default"].createElement("input", { id: "fieldName", type: "text", value: formData.fieldName, onChange: function (e) { return handleFieldNameChange(e.target.value); }, onBlur: function () { return handleFieldBlur('fieldName'); }, disabled: mode === 'edit', className: "form-input " + (errors.fieldName ? 'has-error' : ''), placeholder: "field_name", "aria-invalid": !!errors.fieldName, "aria-describedby": errors.fieldName ? 'fieldName-error' : undefined }),
                        getFieldStatus('fieldName')),
                    errors.fieldName && touched.fieldName && (react_1["default"].createElement("span", { className: "error-message", id: "fieldName-error" }, errors.fieldName)),
                    !errors.fieldName && touched.fieldName && (react_1["default"].createElement("span", { className: "validation-feedback valid" },
                        react_1["default"].createElement(iconSystem_1["default"], { name: "check", size: 14 }),
                        " Field name is valid"))),
                react_1["default"].createElement("div", { className: "form-group" },
                    react_1["default"].createElement("label", { htmlFor: "fieldLabel", className: "form-label" },
                        "Label",
                        react_1["default"].createElement(helpSystem_1.HelpIcon, { content: "Display name shown to users" })),
                    react_1["default"].createElement("div", { style: { position: 'relative', display: 'flex', alignItems: 'center' } },
                        react_1["default"].createElement("input", { id: "fieldLabel", type: "text", value: formData.fieldLabel, onChange: function (e) { return handleFieldLabelChange(e.target.value); }, onBlur: function () { return handleFieldBlur('fieldLabel'); }, className: "form-input " + (errors.fieldLabel ? 'has-error' : ''), placeholder: "Field Label", "aria-invalid": !!errors.fieldLabel, "aria-describedby": errors.fieldLabel ? 'fieldLabel-error' : undefined }),
                        getFieldStatus('fieldLabel')),
                    errors.fieldLabel && touched.fieldLabel && (react_1["default"].createElement("span", { className: "error-message", id: "fieldLabel-error" }, errors.fieldLabel)),
                    !errors.fieldLabel && touched.fieldLabel && (react_1["default"].createElement("span", { className: "validation-feedback valid" },
                        react_1["default"].createElement(iconSystem_1["default"], { name: "check", size: 14 }),
                        " Label is valid"))),
                react_1["default"].createElement("div", { className: "form-group" },
                    react_1["default"].createElement("label", { htmlFor: "fieldType", className: "form-label" },
                        "Field Type",
                        react_1["default"].createElement(helpSystem_1.HelpIcon, { content: "The data type for this field" })),
                    react_1["default"].createElement("select", { id: "fieldType", value: formData.fieldType, onChange: function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { fieldType: e.target.value })); }); }, className: "form-select" }, customFields_1.FIELD_TYPES.map(function (type) { return (react_1["default"].createElement("option", { key: type, value: type }, customFields_1.FIELD_TYPE_LABELS[type])); }))),
                react_1["default"].createElement("div", { className: "form-group" },
                    react_1["default"].createElement("label", { htmlFor: "description", className: "form-label" },
                        "Description (Optional)",
                        react_1["default"].createElement(helpSystem_1.HelpIcon, { content: "Help text shown to users" })),
                    react_1["default"].createElement("textarea", { id: "description", value: formData.description, onChange: function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { description: e.target.value })); }); }, className: "form-textarea", placeholder: "Enter field description...", rows: 3 })),
                ['select', 'multiSelect'].includes(formData.fieldType) && (react_1["default"].createElement("div", { className: "form-group" },
                    react_1["default"].createElement("label", { className: "form-label" },
                        "Options",
                        react_1["default"].createElement(helpSystem_1.HelpIcon, { content: "Predefined values for this field" })),
                    selectOptions.length > 0 && (react_1["default"].createElement("div", { className: "options-list" }, selectOptions.map(function (option, index) { return (react_1["default"].createElement("div", { key: index, className: "option-item" },
                        react_1["default"].createElement("span", null, option),
                        react_1["default"].createElement(iconSystem_1.IconButton, { icon: "delete", variant: "danger", size: "small", onClick: function () { return handleRemoveOption(index); }, "aria-label": "Remove option \"" + option + "\"" }))); }))),
                    react_1["default"].createElement("div", { className: "option-input-group" },
                        react_1["default"].createElement("input", { type: "text", value: newOption, onChange: function (e) { return setNewOption(e.target.value); }, onKeyPress: function (e) {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddOption();
                                }
                            }, className: "form-input", placeholder: "Type option and press Enter or click Add", "aria-label": "New option" }),
                        react_1["default"].createElement("button", { type: "button", className: "btn btn-secondary", onClick: handleAddOption, disabled: !newOption.trim() },
                            react_1["default"].createElement(iconSystem_1["default"], { name: "plus", size: 16 }),
                            "Add")),
                    errors.options && touched.options && (react_1["default"].createElement("span", { className: "error-message" }, errors.options)))),
                react_1["default"].createElement("div", { className: "form-group" },
                    react_1["default"].createElement("label", { htmlFor: "required", className: "form-label" },
                        react_1["default"].createElement("input", { id: "required", type: "checkbox", checked: formData.required, onChange: function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { required: e.target.checked })); }); } }),
                        react_1["default"].createElement("span", { style: { marginLeft: '8px' } }, "Required field"),
                        react_1["default"].createElement(helpSystem_1.HelpIcon, { content: "Users must provide a value for this field" }))),
                react_1["default"].createElement("div", { className: "form-group" },
                    react_1["default"].createElement("label", { htmlFor: "displayOrder", className: "form-label" },
                        "Display Order",
                        react_1["default"].createElement(helpSystem_1.HelpIcon, { content: "Order in which field appears in forms" })),
                    react_1["default"].createElement("input", { id: "displayOrder", type: "number", value: formData.displayOrder, onChange: function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { displayOrder: parseInt(e.target.value, 10) })); }); }, className: "form-input", min: "0" }))),
            react_1["default"].createElement("div", { className: "dialog-footer" },
                react_1["default"].createElement("div", { className: "button-group button-group-horizontal button-group-right" },
                    react_1["default"].createElement("button", { className: "btn btn-secondary", onClick: onCancel, disabled: saving, type: "button" }, "Cancel"),
                    react_1["default"].createElement("button", { className: "btn btn-primary", onClick: handleSave, disabled: saving, "aria-busy": saving, type: "button" },
                        saving && react_1["default"].createElement(iconSystem_1["default"], { name: "loading", size: 16 }),
                        saving ? 'Saving...' : mode === 'create' ? 'Create Field' : 'Save Changes'))))));
};
exports["default"] = CustomFieldDialog;
