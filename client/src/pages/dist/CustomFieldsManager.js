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
exports.CustomFieldsManager = exports.CustomFieldsManagerInner = void 0;
var sonner_1 = require("sonner");
/**
 * Phase 10: CustomFieldsManager Component
 * Admin interface for managing custom fields per entity type
 */
var react_1 = require("react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var useCustomFields_1 = require("../hooks/useCustomFields");
var customFields_1 = require("../types/customFields");
require("../styles/customFieldsManager.css");
function CustomFieldsManagerInner() {
    var _this = this;
    var _a = react_1.useState(customFields_1.ENTITY_TYPES[0]), selectedEntity = _a[0], setSelectedEntity = _a[1];
    var _b = react_1.useState(false), showDialog = _b[0], setShowDialog = _b[1];
    var _c = react_1.useState(null), editingField = _c[0], setEditingField = _c[1];
    var _d = react_1.useState({
        fieldLabel: '',
        fieldName: '',
        fieldType: 'text',
        fieldDescription: '',
        required: false,
        displayOrder: 0,
        options: '[]'
    }), formData = _d[0], setFormData = _d[1];
    var _e = useCustomFields_1.useCustomFields(), fields = _e.fields, loading = _e.loading, error = _e.error, getFieldsByEntity = _e.getFieldsByEntity, createField = _e.createField, updateField = _e.updateField, deleteField = _e.deleteField;
    // Load fields when entity changes
    react_1.useEffect(function () {
        loadFields();
    }, [selectedEntity]);
    var loadFields = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getFieldsByEntity(selectedEntity)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var handleOpenDialog = function (field) {
        if (field) {
            setEditingField(field);
            setFormData({
                fieldLabel: field.fieldLabel,
                fieldName: field.fieldName,
                fieldType: field.fieldType,
                fieldDescription: field.fieldDescription || '',
                required: field.required,
                displayOrder: field.displayOrder,
                options: field.options ? JSON.stringify(field.options) : '[]'
            });
        }
        else {
            setEditingField(null);
            setFormData({
                fieldLabel: '',
                fieldName: '',
                fieldType: 'text',
                fieldDescription: '',
                required: false,
                displayOrder: 0,
                options: '[]'
            });
        }
        setShowDialog(true);
    };
    var handleCloseDialog = function () {
        setShowDialog(false);
        setEditingField(null);
    };
    var handleSave = function () { return __awaiter(_this, void 0, void 0, function () {
        var options, input, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    // Validate required fields
                    if (!formData.fieldLabel || !formData.fieldName || !formData.fieldType) {
                        sonner_1.toast.error('Please fill in all required fields');
                        return [2 /*return*/];
                    }
                    options = undefined;
                    if (['select', 'multiSelect'].includes(formData.fieldType)) {
                        try {
                            options = JSON.parse(formData.options);
                            if (!Array.isArray(options) || options.length === 0) {
                                sonner_1.toast.error('Please provide at least one option for select fields');
                                return [2 /*return*/];
                            }
                        }
                        catch (e) {
                            sonner_1.toast.error('Invalid JSON format for options');
                            return [2 /*return*/];
                        }
                    }
                    if (!editingField) return [3 /*break*/, 2];
                    // Update existing field
                    return [4 /*yield*/, updateField(editingField.id, {
                            fieldLabel: formData.fieldLabel,
                            fieldDescription: formData.fieldDescription,
                            required: formData.required,
                            displayOrder: parseInt(formData.displayOrder),
                            options: options
                        })];
                case 1:
                    // Update existing field
                    _a.sent();
                    return [3 /*break*/, 4];
                case 2:
                    input = {
                        organizationId: 'org-placeholder',
                        entityType: selectedEntity,
                        fieldName: formData.fieldName,
                        fieldLabel: formData.fieldLabel,
                        fieldType: formData.fieldType,
                        fieldDescription: formData.fieldDescription || undefined,
                        required: formData.required,
                        displayOrder: parseInt(formData.displayOrder),
                        options: options
                    };
                    return [4 /*yield*/, createField(input)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    handleCloseDialog();
                    return [4 /*yield*/, loadFields()];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    err_1 = _a.sent();
                    console.error('Error saving field:', err_1);
                    sonner_1.toast.error("Error: " + (err_1 instanceof Error ? err_1.message : 'Unknown error'));
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleDelete = function (fieldId) { return __awaiter(_this, void 0, void 0, function () {
        var err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!window.confirm('Are you sure you want to delete this field? This action cannot be undone.')) {
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, deleteField(fieldId)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, loadFields()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    err_2 = _a.sent();
                    console.error('Error deleting field:', err_2);
                    sonner_1.toast.error("Error: " + (err_2 instanceof Error ? err_2.message : 'Unknown error'));
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var sortedFields = __spreadArrays(fields).sort(function (a, b) { return a.displayOrder - b.displayOrder; });
    return (react_1["default"].createElement("div", { className: "custom-fields-manager" },
        react_1["default"].createElement("div", { className: "manager-header" },
            react_1["default"].createElement("h1", null, "Custom Fields Manager"),
            react_1["default"].createElement("p", { className: "subtitle" }, "Create and manage custom fields for all entity types")),
        error && react_1["default"].createElement("div", { className: "error-banner" }, error),
        react_1["default"].createElement("div", { className: "entity-tabs" },
            react_1["default"].createElement("div", { className: "tabs" }, customFields_1.ENTITY_TYPES.map(function (entity) { return (react_1["default"].createElement("button", { key: entity, className: "tab " + (selectedEntity === entity ? 'active' : ''), onClick: function () { return setSelectedEntity(entity); } }, entity)); })),
            react_1["default"].createElement("button", { className: "btn btn-primary", onClick: function () { return handleOpenDialog(); } }, "+ Add Custom Field")),
        react_1["default"].createElement("div", { className: "fields-container" },
            loading && react_1["default"].createElement("p", { className: "loading-message" }, "Loading fields..."),
            !loading && fields.length === 0 && (react_1["default"].createElement("div", { className: "empty-state" },
                react_1["default"].createElement("p", null,
                    "No custom fields yet for ",
                    selectedEntity),
                react_1["default"].createElement("p", { className: "hint" }, "Click \"Add Custom Field\" to create one"))),
            !loading && fields.length > 0 && (react_1["default"].createElement("table", { className: "fields-table" },
                react_1["default"].createElement("thead", null,
                    react_1["default"].createElement("tr", null,
                        react_1["default"].createElement("th", null, "Label"),
                        react_1["default"].createElement("th", null, "Field Name"),
                        react_1["default"].createElement("th", null, "Type"),
                        react_1["default"].createElement("th", null, "Required"),
                        react_1["default"].createElement("th", null, "Order"),
                        react_1["default"].createElement("th", null, "Actions"))),
                react_1["default"].createElement("tbody", null, sortedFields.map(function (field) { return (react_1["default"].createElement("tr", { key: field.id, className: field.isActive ? '' : 'inactive' },
                    react_1["default"].createElement("td", null, field.fieldLabel),
                    react_1["default"].createElement("td", { className: "font-mono" }, field.fieldName),
                    react_1["default"].createElement("td", null, customFields_1.FIELD_TYPE_LABELS[field.fieldType]),
                    react_1["default"].createElement("td", null, field.required ? '✓' : '—'),
                    react_1["default"].createElement("td", null, field.displayOrder),
                    react_1["default"].createElement("td", { className: "actions" },
                        react_1["default"].createElement("button", { className: "btn-icon", onClick: function () { return handleOpenDialog(field); }, title: "Edit field" }, "\u270E"),
                        react_1["default"].createElement("button", { className: "btn-icon btn-danger", onClick: function () { return handleDelete(field.id); }, title: "Delete field" }, "\u2715")))); }))))),
        showDialog && (react_1["default"].createElement("div", { className: "dialog-overlay", onClick: handleCloseDialog },
            react_1["default"].createElement("div", { className: "dialog", onClick: function (e) { return e.stopPropagation(); } },
                react_1["default"].createElement("div", { className: "dialog-header" },
                    react_1["default"].createElement("h2", null,
                        editingField ? 'Edit' : 'Add',
                        " Custom Field"),
                    react_1["default"].createElement("button", { className: "close-btn", onClick: handleCloseDialog }, "\u2715")),
                react_1["default"].createElement("div", { className: "dialog-body" },
                    react_1["default"].createElement("div", { className: "form-group" },
                        react_1["default"].createElement("label", { htmlFor: "field-label" }, "Field Label *"),
                        react_1["default"].createElement("input", { id: "field-label", type: "text", value: formData.fieldLabel, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { fieldLabel: e.target.value })); }, className: "form-input", placeholder: "e.g., Customer Preference" })),
                    react_1["default"].createElement("div", { className: "form-group" },
                        react_1["default"].createElement("label", { htmlFor: "field-name" }, "Field Name *"),
                        react_1["default"].createElement("input", { id: "field-name", type: "text", value: formData.fieldName, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { fieldName: e.target.value })); }, className: "form-input", placeholder: "e.g., customer_preference", disabled: !!editingField, pattern: "^[a-z_]+$", title: "Use lowercase letters and underscores only" }),
                        react_1["default"].createElement("p", { className: "field-hint" }, "Lowercase letters and underscores only")),
                    react_1["default"].createElement("div", { className: "form-group" },
                        react_1["default"].createElement("label", { htmlFor: "field-type" }, "Type *"),
                        react_1["default"].createElement("select", { id: "field-type", value: formData.fieldType, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { fieldType: e.target.value })); }, className: "form-select" }, customFields_1.FIELD_TYPES.map(function (type) { return (react_1["default"].createElement("option", { key: type, value: type }, customFields_1.FIELD_TYPE_LABELS[type])); }))),
                    react_1["default"].createElement("div", { className: "form-group" },
                        react_1["default"].createElement("label", { htmlFor: "field-description" }, "Description"),
                        react_1["default"].createElement("textarea", { id: "field-description", value: formData.fieldDescription, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { fieldDescription: e.target.value })); }, className: "form-textarea", placeholder: "Help text shown to users", rows: 3 })),
                    react_1["default"].createElement("div", { className: "form-group" },
                        react_1["default"].createElement("label", { htmlFor: "display-order" }, "Display Order"),
                        react_1["default"].createElement("input", { id: "display-order", type: "number", value: formData.displayOrder, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { displayOrder: e.target.value })); }, className: "form-input", min: "0" }),
                        react_1["default"].createElement("p", { className: "field-hint" }, "Lower numbers appear first")),
                    react_1["default"].createElement("div", { className: "form-group" },
                        react_1["default"].createElement("label", { htmlFor: "required" },
                            react_1["default"].createElement("input", { id: "required", type: "checkbox", checked: formData.required, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { required: e.target.checked })); } }),
                            react_1["default"].createElement("span", null, "Required field"))),
                    ['select', 'multiSelect'].includes(formData.fieldType) && (react_1["default"].createElement("div", { className: "form-group" },
                        react_1["default"].createElement("label", { htmlFor: "options" }, "Options (JSON array) *"),
                        react_1["default"].createElement("textarea", { id: "options", value: formData.options, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { options: e.target.value })); }, className: "form-textarea font-mono", placeholder: '["Option 1", "Option 2", "Option 3"]', rows: 5 }),
                        react_1["default"].createElement("p", { className: "field-hint" }, "Format: [\"Option 1\", \"Option 2\", ...]")))),
                react_1["default"].createElement("div", { className: "dialog-footer" },
                    react_1["default"].createElement("button", { className: "btn btn-secondary", onClick: handleCloseDialog }, "Cancel"),
                    react_1["default"].createElement("button", { className: "btn btn-primary", onClick: handleSave }, "Save")))))));
}
exports.CustomFieldsManagerInner = CustomFieldsManagerInner;
function CustomFieldsManager() {
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Custom Fields Manager", description: "Create and manage custom fields for all entity types", breadcrumbs: [
            { label: "Tools", href: "/tools" },
            { label: "Custom Fields" },
        ] },
        react_1["default"].createElement(CustomFieldsManagerInner, null)));
}
exports.CustomFieldsManager = CustomFieldsManager;
exports["default"] = CustomFieldsManager;
