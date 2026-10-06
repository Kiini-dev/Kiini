"use strict";
/**
 * Phase 10: Custom Field Dialog Component
 * Dialog for creating and editing custom fields
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
exports.CustomFieldDialog = void 0;
var react_1 = require("react");
var customFields_1 = require("@/types/customFields");
var customFieldsService_1 = require("@/services/customFieldsService");
var errorHandling_1 = require("./errorHandling");
var iconSystem_1 = require("./iconSystem");
require("../styles/customFieldsManager.css");
require("./designTokens.css");
require("./enhancedStyles.css");
var CustomFieldDialog = function (_a) {
    var mode = _a.mode, field = _a.field, entityType = _a.entityType, onSave = _a.onSave, onCancel = _a.onCancel;
    // Form state
    var _b = react_1.useState({
        organizationId: '',
        entityType: entityType || 'Contact',
        fieldName: '',
        fieldLabel: '',
        fieldType: 'text',
        fieldDescription: '',
        required: false,
        displayOrder: 0,
        options: []
    }), formData = _b[0], setFormData = _b[1];
    var _c = react_1.useState({}), errors = _c[0], setErrors = _c[1];
    var _d = react_1.useState({}), touched = _d[0], setTouched = _d[1];
    var _e = react_1.useState({}), validationFeedback = _e[0], setValidationFeedback = _e[1];
    var _f = react_1.useState([]), notifications = _f[0], setNotifications = _f[1];
    var _g = react_1.useState(false), saving = _g[0], setSaving = _g[1];
    var _h = react_1.useState([]), selectOptions = _h[0], setSelectOptions = _h[1];
    var _j = react_1.useState(''), newOption = _j[0], setNewOption = _j[1];
    /**
     * Initialize form with field data (for edit mode)
     */
    react_1.useEffect(function () {
        if (mode === 'edit' && field) {
            setFormData({
                organizationId: field.organizationId,
                entityType: field.entityType,
                fieldName: field.fieldName,
                fieldLabel: field.fieldLabel,
                fieldType: field.fieldType,
                fieldDescription: field.fieldDescription,
                required: field.required,
                displayOrder: field.displayOrder,
                options: field.options
            });
            if (field.options) {
                setSelectOptions(field.options.map(function (opt, idx) { return ({
                    value: opt,
                    label: opt,
                    order: idx
                }); }));
            }
        }
    }, [mode, field]);
    /**
     * Handle form input changes
     */
    var handleFieldNameChange = function (value) {
        setFormData(function (prev) { return (__assign(__assign({}, prev), { fieldName: value })); });
        if (touched.fieldName) {
            var result_1 = errorHandling_1.validateFieldName(value);
            if (!result_1.valid) {
                setErrors(function (prev) { return (__assign(__assign({}, prev), { fieldName: result_1.error || '' })); });
                setValidationFeedback(function (prev) { return (__assign(__assign({}, prev), { fieldName: false })); });
            }
            else {
                setErrors(function (prev) { var e = __assign({}, prev); delete e.fieldName; return e; });
                setValidationFeedback(function (prev) { return (__assign(__assign({}, prev), { fieldName: true })); });
            }
        }
    };
    var handleFieldNameBlur = function () {
        setTouched(function (prev) { return (__assign(__assign({}, prev), { fieldName: true })); });
        var result = errorHandling_1.validateFieldName(formData.fieldName);
        if (!result.valid) {
            setErrors(function (prev) { return (__assign(__assign({}, prev), { fieldName: result.error || '' })); });
            setValidationFeedback(function (prev) { return (__assign(__assign({}, prev), { fieldName: false })); });
        }
        else {
            setErrors(function (prev) { var e = __assign({}, prev); delete e.fieldName; return e; });
            setValidationFeedback(function (prev) { return (__assign(__assign({}, prev), { fieldName: true })); });
        }
    };
    var handleFieldLabelChange = function (value) {
        setFormData(function (prev) { return (__assign(__assign({}, prev), { fieldLabel: value })); });
        if (touched.fieldLabel) {
            var result_2 = errorHandling_1.validateFieldLabel(value);
            if (!result_2.valid) {
                setErrors(function (prev) { return (__assign(__assign({}, prev), { fieldLabel: result_2.error || '' })); });
                setValidationFeedback(function (prev) { return (__assign(__assign({}, prev), { fieldLabel: false })); });
            }
            else {
                setErrors(function (prev) { var e = __assign({}, prev); delete e.fieldLabel; return e; });
                setValidationFeedback(function (prev) { return (__assign(__assign({}, prev), { fieldLabel: true })); });
            }
        }
    };
    var handleFieldLabelBlur = function () {
        setTouched(function (prev) { return (__assign(__assign({}, prev), { fieldLabel: true })); });
        var result = errorHandling_1.validateFieldLabel(formData.fieldLabel);
        if (!result.valid) {
            setErrors(function (prev) { return (__assign(__assign({}, prev), { fieldLabel: result.error || '' })); });
            setValidationFeedback(function (prev) { return (__assign(__assign({}, prev), { fieldLabel: false })); });
        }
        else {
            setErrors(function (prev) { var e = __assign({}, prev); delete e.fieldLabel; return e; });
            setValidationFeedback(function (prev) { return (__assign(__assign({}, prev), { fieldLabel: true })); });
        }
    };
    var handleInputChange = function (e) {
        var _a = e.target, name = _a.name, value = _a.value, type = _a.type;
        if (name === 'fieldName') {
            handleFieldNameChange(value);
            return;
        }
        if (name === 'fieldLabel') {
            handleFieldLabelChange(value);
            return;
        }
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[name] = type === 'checkbox' ? e.target.checked : value, _a)));
        });
        if (errors[name]) {
            setErrors(function (prev) {
                var newErrors = __assign({}, prev);
                delete newErrors[name];
                return newErrors;
            });
        }
    };
    /**
     * Validate form before submission
     */
    var validateFormOnSubmit = function () {
        var newTouched = { fieldName: true, fieldLabel: true, fieldType: true, entityType: true, options: true };
        setTouched(newTouched);
        var newErrors = {};
        var nameResult = errorHandling_1.validateFieldName(formData.fieldName);
        if (!nameResult.valid)
            newErrors.fieldName = nameResult.error || '';
        var labelResult = errorHandling_1.validateFieldLabel(formData.fieldLabel);
        if (!labelResult.valid)
            newErrors.fieldLabel = labelResult.error || '';
        if (!formData.fieldType) {
            newErrors.fieldType = 'Field type is required';
        }
        if (!formData.entityType) {
            newErrors.entityType = 'Entity type is required';
        }
        if ((formData.fieldType === 'select' || formData.fieldType === 'multiSelect') && selectOptions.length === 0) {
            newErrors.options = 'At least one option is required for select fields';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    /**
     * Handle add option
     */
    var handleAddOption = function () {
        if (!newOption.trim())
            return;
        var newSelectOption = {
            value: newOption.toLowerCase().replace(/\s+/g, '_'),
            label: newOption,
            order: selectOptions.length
        };
        setSelectOptions(__spreadArrays(selectOptions, [newSelectOption]));
        setNewOption('');
    };
    /**
     * Handle remove option
     */
    var handleRemoveOption = function (index) {
        setSelectOptions(selectOptions.filter(function (_, i) { return i !== index; }));
    };
    /**
     * Handle save
     */
    var handleSave = function () { return __awaiter(void 0, void 0, void 0, function () {
        var payload, savedField, updatePayload, err_1, categorized, notification_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!validateFormOnSubmit())
                        return [2 /*return*/];
                    setSaving(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, 8, 9]);
                    payload = __assign(__assign({}, formData), { options: selectOptions.map(function (opt) { return opt.label; }) });
                    savedField = void 0;
                    if (!(mode === 'create')) return [3 /*break*/, 3];
                    return [4 /*yield*/, customFieldsService_1["default"].createField(payload)];
                case 2:
                    savedField = _a.sent();
                    return [3 /*break*/, 6];
                case 3:
                    if (!(mode === 'edit' && field)) return [3 /*break*/, 5];
                    updatePayload = {
                        fieldLabel: payload.fieldLabel,
                        fieldDescription: payload.fieldDescription,
                        required: payload.required,
                        displayOrder: payload.displayOrder,
                        options: payload.options
                    };
                    return [4 /*yield*/, customFieldsService_1["default"].updateField(field.id, updatePayload)];
                case 4:
                    savedField = _a.sent();
                    return [3 /*break*/, 6];
                case 5: throw new Error('Invalid operation');
                case 6:
                    onSave(savedField);
                    return [3 /*break*/, 9];
                case 7:
                    err_1 = _a.sent();
                    categorized = errorHandling_1.categorizeError(err_1);
                    notification_1 = errorHandling_1.createErrorNotification(categorized, mode === 'create' ? 'create' : 'update');
                    setNotifications(function (prev) { return __spreadArrays(prev, [notification_1]); });
                    setErrors({ submit: categorized.userMessage });
                    console.error('Error saving field:', err_1);
                    return [3 /*break*/, 9];
                case 8:
                    setSaving(false);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    /**
     * Render option configuration
     */
    var renderOptionsConfig = function () {
        if (formData.fieldType !== 'select' && formData.fieldType !== 'multiSelect') {
            return null;
        }
        return (react_1["default"].createElement("div", { className: "form-group" },
            react_1["default"].createElement("label", null, "Options"),
            errors.options && react_1["default"].createElement("span", { className: "error-message" }, errors.options),
            react_1["default"].createElement("div", { style: { marginBottom: '0.75rem' } }, selectOptions.map(function (option, idx) { return (react_1["default"].createElement("div", { key: idx, style: {
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    alignItems: 'center'
                } },
                react_1["default"].createElement("span", { style: { flex: 1, padding: '0.5rem', background: '#f3f4f6', borderRadius: '0.375rem' } }, option.label),
                react_1["default"].createElement("button", { type: "button", className: "btn-icon btn-danger", onClick: function () { return handleRemoveOption(idx); }, style: { width: '2rem', height: '2rem' } }, "\u2715"))); })),
            react_1["default"].createElement("div", { style: { display: 'flex', gap: '0.5rem' } },
                react_1["default"].createElement("input", { type: "text", className: "form-input", placeholder: "Add new option", value: newOption, onChange: function (e) { return setNewOption(e.target.value); }, onKeyDown: function (e) {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddOption();
                        }
                    }, style: { flex: 1 } }),
                react_1["default"].createElement("button", { type: "button", className: "btn btn-primary", onClick: handleAddOption }, "Add"))));
    };
    return (react_1["default"].createElement("div", { className: "dialog-overlay" },
        react_1["default"].createElement("div", { className: "dialog" },
            react_1["default"].createElement("div", { className: "dialog-header" },
                react_1["default"].createElement("h2", null,
                    mode === 'create' ? 'Create' : 'Edit',
                    " Custom Field"),
                react_1["default"].createElement("button", { className: "close-btn", onClick: onCancel, disabled: saving }, "\u2715")),
            react_1["default"].createElement("div", { className: "dialog-body" },
                errors.submit && (react_1["default"].createElement("div", { className: "error-banner", style: { marginBottom: '1rem' } }, errors.submit)),
                react_1["default"].createElement("div", { className: "form-group" },
                    react_1["default"].createElement("label", { htmlFor: "fieldName" }, "Field Name *"),
                    react_1["default"].createElement("div", { style: { position: 'relative', display: 'flex', alignItems: 'center' } },
                        react_1["default"].createElement("input", { id: "fieldName", type: "text", name: "fieldName", value: formData.fieldName, onChange: handleInputChange, onBlur: handleFieldNameBlur, placeholder: "e.g., customer_type", disabled: mode === 'edit', "aria-invalid": errors.fieldName ? 'true' : 'false', "aria-describedby": errors.fieldName ? 'fieldName-error' : undefined }),
                        touched.fieldName && validationFeedback.fieldName !== null && (react_1["default"].createElement("div", { style: { marginLeft: '0.5rem' } }, validationFeedback.fieldName ? (react_1["default"].createElement(iconSystem_1.IconButton, { icon: "check", variant: "ghost", tooltip: "Valid field name", role: "status", "aria-label": "Field name is valid", iconSize: 16, style: { opacity: 0.7 } })) : (react_1["default"].createElement(iconSystem_1.IconButton, { icon: "x", variant: "ghost", tooltip: "Invalid field name", role: "alert", "aria-label": "Field name is invalid", iconSize: 16, style: { opacity: 0.7 } }))))),
                    errors.fieldName && react_1["default"].createElement("span", { className: "error-message", id: "fieldName-error" }, errors.fieldName),
                    react_1["default"].createElement("p", { style: { fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' } }, "Machine-readable name (alphanumeric and underscore only)")),
                react_1["default"].createElement("div", { className: "form-group" },
                    react_1["default"].createElement("label", { htmlFor: "fieldLabel" }, "Field Label *"),
                    react_1["default"].createElement("div", { style: { position: 'relative', display: 'flex', alignItems: 'center' } },
                        react_1["default"].createElement("input", { id: "fieldLabel", type: "text", name: "fieldLabel", value: formData.fieldLabel, onChange: handleInputChange, onBlur: handleFieldLabelBlur, placeholder: "e.g., Customer Type", "aria-invalid": errors.fieldLabel ? 'true' : 'false', "aria-describedby": errors.fieldLabel ? 'fieldLabel-error' : undefined }),
                        touched.fieldLabel && validationFeedback.fieldLabel !== null && (react_1["default"].createElement("div", { style: { marginLeft: '0.5rem' } }, validationFeedback.fieldLabel ? (react_1["default"].createElement(iconSystem_1.IconButton, { icon: "check", variant: "ghost", tooltip: "Valid field label", role: "status", "aria-label": "Field label is valid", iconSize: 16, style: { opacity: 0.7 } })) : (react_1["default"].createElement(iconSystem_1.IconButton, { icon: "x", variant: "ghost", tooltip: "Invalid field label", role: "alert", "aria-label": "Field label is invalid", iconSize: 16, style: { opacity: 0.7 } }))))),
                    errors.fieldLabel && react_1["default"].createElement("span", { className: "error-message", id: "fieldLabel-error" }, errors.fieldLabel)),
                react_1["default"].createElement("div", { className: "form-group" },
                    react_1["default"].createElement("label", { htmlFor: "fieldDescription" }, "Description"),
                    react_1["default"].createElement("textarea", { id: "fieldDescription", name: "fieldDescription", value: formData.fieldDescription, onChange: handleInputChange, placeholder: "e.g., Indicates the type of customer...", style: { minHeight: '80px' } })),
                react_1["default"].createElement("div", { className: "form-group" },
                    react_1["default"].createElement("label", { htmlFor: "fieldType" }, "Field Type *"),
                    react_1["default"].createElement("select", { id: "fieldType", name: "fieldType", value: formData.fieldType, onChange: handleInputChange, disabled: mode === 'edit' }, customFields_1.FIELD_TYPES.map(function (type) { return (react_1["default"].createElement("option", { key: type, value: type }, customFields_1.FIELD_TYPE_LABELS[type])); })),
                    errors.fieldType && react_1["default"].createElement("span", { className: "error-message" }, errors.fieldType)),
                renderOptionsConfig(),
                react_1["default"].createElement("div", { className: "form-group with-checkbox" },
                    react_1["default"].createElement("input", { id: "required", type: "checkbox", name: "required", checked: formData.required, onChange: handleInputChange }),
                    react_1["default"].createElement("label", { htmlFor: "required", style: { marginBottom: 0 } }, "Required field")),
                react_1["default"].createElement("div", { className: "form-group" },
                    react_1["default"].createElement("label", { htmlFor: "displayOrder" }, "Display Order"),
                    react_1["default"].createElement("input", { id: "displayOrder", type: "number", name: "displayOrder", value: formData.displayOrder, onChange: handleInputChange, placeholder: "0" }))),
            react_1["default"].createElement("div", { className: "dialog-footer" },
                react_1["default"].createElement("button", { className: "btn btn-secondary", onClick: onCancel, disabled: saving }, "Cancel"),
                react_1["default"].createElement("button", { className: "btn btn-primary", onClick: handleSave, disabled: saving }, saving ? 'Saving...' : 'Save Field')))));
};
exports.CustomFieldDialog = CustomFieldDialog;
exports["default"] = CustomFieldDialog;
