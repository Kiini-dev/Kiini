"use strict";
/**
 * Phase 10: Custom Fields Manager Component
 * Production-ready manager for handling custom fields across the application
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
exports.CustomFieldsManager = void 0;
var react_1 = require("react");
var customFields_1 = require("@/types/customFields");
var customFieldsService_1 = require("@/services/customFieldsService");
var CustomFieldDialog_1 = require("./CustomFieldDialog");
var iconSystem_1 = require("./iconSystem");
var errorHandling_1 = require("./errorHandling");
var helpSystem_1 = require("./helpSystem");
var useAuth_1 = require("@/_core/hooks/useAuth");
require("../styles/customFieldsManager.css");
require("./designTokens.css");
require("./enhancedStyles.css");
var CustomFieldsManager = function (_a) {
    var initialEntityType = _a.entityType, onFieldsChange = _a.onFieldsChange, _b = _a.readonly, readonly = _b === void 0 ? false : _b;
    var _c = useAuth_1.useAuth(), isAuthenticated = _c.isAuthenticated, authLoading = _c.loading;
    // State
    var _d = react_1.useState(initialEntityType), selectedEntityType = _d[0], setSelectedEntityType = _d[1];
    var _e = react_1.useState([]), fields = _e[0], setFields = _e[1];
    var _f = react_1.useState(false), loading = _f[0], setLoading = _f[1];
    var _g = react_1.useState(null), error = _g[0], setError = _g[1];
    var _h = react_1.useState([]), notifications = _h[0], setNotifications = _h[1];
    var _j = react_1.useState(null), selectedField = _j[0], setSelectedField = _j[1];
    var _k = react_1.useState(false), showDialog = _k[0], setShowDialog = _k[1];
    var _l = react_1.useState('create'), dialogMode = _l[0], setDialogMode = _l[1];
    var _m = react_1.useState(''), searchQuery = _m[0], setSearchQuery = _m[1];
    var _o = react_1.useState('order'), sortBy = _o[0], setSortBy = _o[1];
    var _p = react_1.useState(''), filterByType = _p[0], setFilterByType = _p[1];
    var _q = react_1.useState(false), helpOpen = _q[0], setHelpOpen = _q[1];
    var _r = react_1.useState(new Set()), selectedFields = _r[0], setSelectedFields = _r[1];
    /**
     * Load custom fields for selected entity type
     */
    var loadFields = react_1.useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, err_1, categorized, notification_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedEntityType)
                        return [2 /*return*/];
                    // Only load if user is authenticated
                    if (!isAuthenticated) {
                        console.warn('[CustomFieldsManager] Skipping field load - user not authenticated');
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    setError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, customFieldsService_1["default"].getFields(selectedEntityType)];
                case 2:
                    response = _a.sent();
                    setFields(response.fields);
                    onFieldsChange === null || onFieldsChange === void 0 ? void 0 : onFieldsChange(response.fields);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    categorized = errorHandling_1.categorizeError(err_1);
                    setError(categorized.userMessage);
                    notification_1 = errorHandling_1.createErrorNotification(categorized, 'fetch');
                    setNotifications(function (prev) { return __spreadArrays(prev, [notification_1]); });
                    console.error('Error loading custom fields:', err_1);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [selectedEntityType, onFieldsChange, isAuthenticated]);
    /**
     * Load fields when entity type changes or user authenticates
     */
    react_1.useEffect(function () {
        // Skip loading if auth is still loading or user is not authenticated
        if (authLoading || !isAuthenticated) {
            console.log('[CustomFieldsManager] Skipping load: authLoading=' + authLoading + ', isAuthenticated=' + isAuthenticated);
            return;
        }
        loadFields();
    }, [loadFields, isAuthenticated, authLoading]);
    /**
     * Handle Shift+? keyboard shortcut for help
     */
    react_1.useEffect(function () {
        var handleKeyDown = function (e) {
            if (e.shiftKey && e.key === '?') {
                e.preventDefault();
                setHelpOpen(function (prev) { return !prev; });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return function () { return window.removeEventListener('keydown', handleKeyDown); };
    }, []);
    /**
     * Handle entity type change
     */
    var handleEntityTypeChange = function (newEntityType) {
        setSelectedEntityType(newEntityType);
        setSelectedField(null);
        setSearchQuery('');
    };
    /**
     * Handle create field
     */
    var handleCreateField = function () {
        setSelectedField(null);
        setDialogMode('create');
        setShowDialog(true);
    };
    /**
     * Handle edit field
     */
    var handleEditField = function (field) {
        setSelectedField(field);
        setDialogMode('edit');
        setShowDialog(true);
    };
    /**
     * Handle delete field
     */
    var handleDeleteField = function (fieldId) { return __awaiter(void 0, void 0, void 0, function () {
        var err_2, categorized, notification_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!window.confirm('Are you sure you want to delete this field? This action cannot be undone.')) {
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, customFieldsService_1["default"].deleteField(fieldId)];
                case 2:
                    _a.sent();
                    setFields(fields.filter(function (f) { return f.id !== fieldId; }));
                    onFieldsChange === null || onFieldsChange === void 0 ? void 0 : onFieldsChange(fields.filter(function (f) { return f.id !== fieldId; }));
                    setSelectedField(null);
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    categorized = errorHandling_1.categorizeError(err_2);
                    setError(categorized.userMessage);
                    notification_2 = errorHandling_1.createErrorNotification(categorized, 'delete');
                    setNotifications(function (prev) { return __spreadArrays(prev, [notification_2]); });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    /**
     * Handle field saved from dialog
     */
    var handleFieldSaved = function (savedField) { return __awaiter(void 0, void 0, void 0, function () {
        var newFields, newFields;
        return __generator(this, function (_a) {
            if (dialogMode === 'create') {
                newFields = __spreadArrays(fields, [savedField]);
                setFields(newFields);
                onFieldsChange === null || onFieldsChange === void 0 ? void 0 : onFieldsChange(newFields);
            }
            else {
                newFields = fields.map(function (f) { return (f.id === savedField.id ? savedField : f); });
                setFields(newFields);
                onFieldsChange === null || onFieldsChange === void 0 ? void 0 : onFieldsChange(newFields);
            }
            setShowDialog(false);
            setSelectedField(null);
            return [2 /*return*/];
        });
    }); };
    /**
     * Toggle field selection
     */
    var toggleFieldSelection = function (fieldId) {
        var newSelected = new Set(selectedFields);
        if (newSelected.has(fieldId)) {
            newSelected["delete"](fieldId);
        }
        else {
            newSelected.add(fieldId);
        }
        setSelectedFields(newSelected);
    };
    /**
     * Toggle select all
     */
    var toggleSelectAll = function () {
        if (selectedFields.size === filteredAndSortedFields.length) {
            setSelectedFields(new Set());
        }
        else {
            setSelectedFields(new Set(filteredAndSortedFields.map(function (f) { return f.id; })));
        }
    };
    /**
     * Handle batch delete
     */
    var handleBatchDelete = function () { return __awaiter(void 0, void 0, void 0, function () {
        var _i, _a, fieldId, newFields, err_3, categorized, notification_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!window.confirm("Delete " + selectedFields.size + " fields? This action cannot be undone.")) {
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, , 7]);
                    _i = 0, _a = Array.from(selectedFields);
                    _b.label = 2;
                case 2:
                    if (!(_i < _a.length)) return [3 /*break*/, 5];
                    fieldId = _a[_i];
                    return [4 /*yield*/, customFieldsService_1["default"].deleteField(fieldId)];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    newFields = fields.filter(function (f) { return !selectedFields.has(f.id); });
                    setFields(newFields);
                    onFieldsChange === null || onFieldsChange === void 0 ? void 0 : onFieldsChange(newFields);
                    setSelectedFields(new Set());
                    return [3 /*break*/, 7];
                case 6:
                    err_3 = _b.sent();
                    categorized = errorHandling_1.categorizeError(err_3);
                    setError(categorized.userMessage);
                    notification_3 = errorHandling_1.createErrorNotification(categorized, 'delete');
                    setNotifications(function (prev) { return __spreadArrays(prev, [notification_3]); });
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    /**
     * Filter and sort fields
     */
    var filteredAndSortedFields = react_1.useMemo(function () {
        var result = __spreadArrays(fields);
        // Filter by search query
        if (searchQuery) {
            var query_1 = searchQuery.toLowerCase();
            result = result.filter(function (f) {
                var _a;
                return f.fieldLabel.toLowerCase().includes(query_1) ||
                    f.fieldName.toLowerCase().includes(query_1) || ((_a = f.fieldDescription) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(query_1));
            });
        }
        // Filter by type
        if (filterByType) {
            result = result.filter(function (f) { return f.fieldType === filterByType; });
        }
        // Sort
        switch (sortBy) {
            case 'name':
                result.sort(function (a, b) { return a.fieldLabel.localeCompare(b.fieldLabel); });
                break;
            case 'type':
                result.sort(function (a, b) { return a.fieldType.localeCompare(b.fieldType); });
                break;
            case 'order':
            default:
                result.sort(function (a, b) { return a.displayOrder - b.displayOrder; });
                break;
        }
        return result;
    }, [fields, searchQuery, filterByType, sortBy]);
    /**
     * Render empty state
     */
    var renderEmptyState = function () { return (react_1["default"].createElement("div", { className: "empty-state" },
        react_1["default"].createElement("p", null, "No custom fields found."),
        react_1["default"].createElement("p", { className: "hint" }, "Create your first custom field to get started."),
        !readonly && (react_1["default"].createElement("button", { className: "btn btn-primary", onClick: handleCreateField, style: { marginTop: '1rem' } }, "Add Custom Field")))); };
    /**
     * Render fields table
     */
    var renderFieldsTable = function () { return (react_1["default"].createElement("div", { className: "fields-container" }, filteredAndSortedFields.length === 0 ? (renderEmptyState()) : (react_1["default"].createElement(react_1["default"].Fragment, null,
        selectedFields.size > 0 && !readonly && (react_1["default"].createElement("div", { style: {
                background: '#f0f9ff',
                border: '1px solid #0284c7',
                borderRadius: '0.375rem',
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            } },
            react_1["default"].createElement("span", { style: { fontWeight: 500 } },
                selectedFields.size,
                " field",
                selectedFields.size === 1 ? '' : 's',
                " selected"),
            react_1["default"].createElement("div", { style: { display: 'flex', gap: '0.5rem' } },
                react_1["default"].createElement("button", { className: "btn btn-danger", onClick: handleBatchDelete }, "Delete Selected"),
                react_1["default"].createElement("button", { className: "btn", onClick: function () { return setSelectedFields(new Set()); } }, "Clear Selection")))),
        react_1["default"].createElement("table", { className: "fields-table" },
            react_1["default"].createElement("thead", null,
                react_1["default"].createElement("tr", null,
                    !readonly && (react_1["default"].createElement("th", { style: { width: '3rem', textAlign: 'center' } },
                        react_1["default"].createElement("input", __assign({ type: "checkbox", checked: selectedFields.size === filteredAndSortedFields.length && filteredAndSortedFields.length > 0 }, { indeterminate: selectedFields.size > 0 && selectedFields.size < filteredAndSortedFields.length }, { onChange: toggleSelectAll, title: "Select all fields", "aria-label": "Select all fields" })))),
                    react_1["default"].createElement("th", null, "Field Name"),
                    react_1["default"].createElement("th", null, "Label"),
                    react_1["default"].createElement("th", null, "Type"),
                    react_1["default"].createElement("th", null, "Required"),
                    react_1["default"].createElement("th", null, "Status"),
                    !readonly && react_1["default"].createElement("th", null, "Actions"))),
            react_1["default"].createElement("tbody", null, filteredAndSortedFields.map(function (field) { return (react_1["default"].createElement("tr", { key: field.id, className: !field.isActive ? 'inactive' : '', style: selectedFields.has(field.id) ? { background: '#f0f9ff' } : {} },
                !readonly && (react_1["default"].createElement("td", { style: { textAlign: 'center' } },
                    react_1["default"].createElement("input", { type: "checkbox", checked: selectedFields.has(field.id), onChange: function () { return toggleFieldSelection(field.id); }, title: "Select " + field.fieldLabel, "aria-label": "Select field " + field.fieldLabel }))),
                react_1["default"].createElement("td", null,
                    react_1["default"].createElement("span", { className: "font-mono" }, field.fieldName)),
                react_1["default"].createElement("td", null, field.fieldLabel),
                react_1["default"].createElement("td", null, customFields_1.FIELD_TYPE_LABELS[field.fieldType]),
                react_1["default"].createElement("td", null, field.required ? '✓' : '—'),
                react_1["default"].createElement("td", null, field.isActive ? (react_1["default"].createElement("span", { style: { color: '#059669' } }, "Active")) : (react_1["default"].createElement("span", { style: { color: '#d97706' } }, "Inactive"))),
                !readonly && (react_1["default"].createElement("td", null,
                    react_1["default"].createElement("div", { className: "actions" },
                        react_1["default"].createElement(iconSystem_1.IconButton, { icon: "edit", variant: "primary", tooltip: "Edit field", "aria-label": "Edit field", onClick: function () { return handleEditField(field); } }),
                        react_1["default"].createElement(iconSystem_1.IconButton, { icon: "delete", variant: "danger", tooltip: "Delete field", "aria-label": "Delete field", onClick: function () { return handleDeleteField(field.id); } })))))); }))))))); };
    return (react_1["default"].createElement("div", { className: "custom-fields-manager" },
        react_1["default"].createElement(helpSystem_1.HelpPanel, { isOpen: helpOpen, onClose: function () { return setHelpOpen(false); } }),
        react_1["default"].createElement("div", { className: "manager-header" },
            react_1["default"].createElement("div", { style: { display: 'flex', gap: '1rem', alignItems: 'center' } },
                react_1["default"].createElement("h1", null, "Custom Fields Manager"),
                react_1["default"].createElement(iconSystem_1.IconButton, { icon: "help", variant: "ghost", tooltip: "Open help (Shift+?)", "aria-label": "Open help panel", onClick: function () { return setHelpOpen(true); }, iconSize: 20 })),
            react_1["default"].createElement("p", { className: "subtitle" }, selectedEntityType
                ? "Manage custom fields for " + selectedEntityType
                : 'Select an entity type to manage custom fields')),
        error && (react_1["default"].createElement("div", { className: "error-banner" },
            error,
            react_1["default"].createElement(iconSystem_1.IconButton, { icon: "x", variant: "ghost", tooltip: "Close error", "aria-label": "Close error notification", onClick: function () { return setError(null); }, style: { marginLeft: '1rem' } }))),
        react_1["default"].createElement("div", { className: "entity-tabs" },
            react_1["default"].createElement("div", { className: "tabs" },
                react_1["default"].createElement("button", { className: "tab " + (!selectedEntityType ? 'active' : ''), onClick: function () { return handleEntityTypeChange(undefined); } }, "All Types"),
                customFields_1.ENTITY_TYPES.map(function (type) { return (react_1["default"].createElement("button", { key: type, className: "tab " + (selectedEntityType === type ? 'active' : ''), onClick: function () { return handleEntityTypeChange(type); } }, type)); })),
            !readonly && selectedEntityType && (react_1["default"].createElement("button", { className: "btn btn-primary", onClick: handleCreateField }, "+ Add Field"))),
        react_1["default"].createElement("div", { style: { marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' } },
            react_1["default"].createElement("div", { style: { flex: 1, minWidth: '250px' } },
                react_1["default"].createElement("input", { type: "text", className: "form-input", placeholder: "Search fields...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); } })),
            react_1["default"].createElement("div", null,
                react_1["default"].createElement("select", { className: "form-select", value: filterByType, onChange: function (e) { return setFilterByType(e.target.value); } },
                    react_1["default"].createElement("option", { value: "" }, "All Types"),
                    customFields_1.FIELD_TYPES.map(function (type) { return (react_1["default"].createElement("option", { key: type, value: type }, customFields_1.FIELD_TYPE_LABELS[type])); }))),
            react_1["default"].createElement("div", null,
                react_1["default"].createElement("select", { className: "form-select", value: sortBy, onChange: function (e) { return setSortBy(e.target.value); } },
                    react_1["default"].createElement("option", { value: "order" }, "Sort by Order"),
                    react_1["default"].createElement("option", { value: "name" }, "Sort by Name"),
                    react_1["default"].createElement("option", { value: "type" }, "Sort by Type")))),
        loading ? (react_1["default"].createElement("div", { className: "loading-message" }, "Loading custom fields...")) : selectedEntityType ? (renderFieldsTable()) : (react_1["default"].createElement("div", { className: "empty-state" },
            react_1["default"].createElement("p", null, "Select an entity type to view and manage custom fields."))),
        showDialog && (react_1["default"].createElement(CustomFieldDialog_1["default"], { mode: dialogMode, field: selectedField, entityType: selectedEntityType, onSave: handleFieldSaved, onCancel: function () { return setShowDialog(false); } }))));
};
exports.CustomFieldsManager = CustomFieldsManager;
exports["default"] = CustomFieldsManager;
