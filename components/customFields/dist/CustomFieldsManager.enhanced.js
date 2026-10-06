"use strict";
/**
 * Enhanced CustomFieldsManager Component with Multi-Select, Batch Operations,
 * Real-time Validation, and Improved UX
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
var CustomFieldDialog_1 = require("./CustomFieldDialog");
var helpSystem_1 = require("./helpSystem");
var iconSystem_1 = require("./iconSystem");
var errorHandling_1 = require("./errorHandling");
require("../customFields/enhancedStyles.css");
require("../customFields/designTokens.css");
/**
 * Main manager component with enhanced features
 */
var CustomFieldsManager = function (_a) {
    var onFieldsChange = _a.onFieldsChange;
    // State management
    var _b = react_1.useState('Contact'), selectedEntityType = _b[0], setSelectedEntityType = _b[1];
    var _c = react_1.useState([]), fields = _c[0], setFields = _c[1];
    var _d = react_1.useState(false), loading = _d[0], setLoading = _d[1];
    var _e = react_1.useState(''), searchQuery = _e[0], setSearchQuery = _e[1];
    var _f = react_1.useState(''), filterByType = _f[0], setFilterByType = _f[1];
    var _g = react_1.useState('name'), sortBy = _g[0], setSortBy = _g[1];
    var _h = react_1.useState(new Set()), selectedFields = _h[0], setSelectedFields = _h[1];
    var _j = react_1.useState(null), selectedField = _j[0], setSelectedField = _j[1];
    var _k = react_1.useState(false), showDialog = _k[0], setShowDialog = _k[1];
    var _l = react_1.useState('create'), dialogMode = _l[0], setDialogMode = _l[1];
    var _m = react_1.useState([]), errorNotifications = _m[0], setErrorNotifications = _m[1];
    var _o = react_1.useState(false), helpOpen = _o[0], setHelpOpen = _o[1];
    // Real-time validation state
    var _p = react_1.useState({}), validationErrors = _p[0], setValidationErrors = _p[1];
    /**
     * Load fields for selected entity type
     */
    react_1.useEffect(function () {
        loadFields();
    }, [selectedEntityType]);
    var loadFields = react_1.useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockFields, categorized;
        return __generator(this, function (_a) {
            setLoading(true);
            try {
                mockFields = [
                    {
                        id: '1',
                        organizationId: 'org-1',
                        entityType: selectedEntityType,
                        fieldName: 'custom_test',
                        fieldLabel: 'Test Field',
                        fieldType: 'text',
                        required: false,
                        displayOrder: 1,
                        isActive: true,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    },
                ];
                setFields(mockFields);
                onFieldsChange === null || onFieldsChange === void 0 ? void 0 : onFieldsChange(mockFields);
            }
            catch (error) {
                categorized = errorHandling_1.categorizeError(error);
                addErrorNotification(errorHandling_1.createErrorNotification(categorized, 'fetch'));
            }
            finally {
                setLoading(false);
            }
            return [2 /*return*/];
        });
    }); }, [selectedEntityType, onFieldsChange]);
    /**
     * Filter, search, and sort fields
     */
    var filteredAndSortedFields = react_1.useMemo(function () {
        var result = __spreadArrays(fields);
        // Search by name or label
        if (searchQuery) {
            var query_1 = searchQuery.toLowerCase();
            result = result.filter(function (field) {
                return field.fieldName.toLowerCase().includes(query_1) ||
                    field.fieldLabel.toLowerCase().includes(query_1);
            });
        }
        // Filter by type
        if (filterByType) {
            result = result.filter(function (field) { return field.fieldType === filterByType; });
        }
        // Sort
        result.sort(function (a, b) {
            switch (sortBy) {
                case 'type':
                    return a.fieldType.localeCompare(b.fieldType);
                case 'created':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'name':
                default:
                    return a.fieldLabel.localeCompare(b.fieldLabel);
            }
        });
        return result;
    }, [fields, searchQuery, filterByType, sortBy]);
    /**
     * Handle entity type tab change
     */
    var handleEntityTypeChange = react_1.useCallback(function (type) {
        setSelectedEntityType(type);
        setSelectedFields(new Set());
        setSearchQuery('');
    }, []);
    /**
     * Handle checkbox selection
     */
    var handleSelectField = react_1.useCallback(function (fieldId) {
        setSelectedFields(function (prev) {
            var next = new Set(prev);
            if (next.has(fieldId)) {
                next["delete"](fieldId);
            }
            else {
                next.add(fieldId);
            }
            return next;
        });
    }, []);
    /**
     * Select all fields
     */
    var handleSelectAll = react_1.useCallback(function () {
        if (selectedFields.size === filteredAndSortedFields.length) {
            setSelectedFields(new Set());
        }
        else {
            setSelectedFields(new Set(filteredAndSortedFields.map(function (f) { return f.id; })));
        }
    }, [selectedFields.size, filteredAndSortedFields]);
    /**
     * Create new field
     */
    var handleCreateField = react_1.useCallback(function () {
        setSelectedField(null);
        setDialogMode('create');
        setShowDialog(true);
    }, []);
    /**
     * Edit field
     */
    var handleEditField = react_1.useCallback(function (field) {
        setSelectedField(field);
        setDialogMode('edit');
        setShowDialog(true);
    }, []);
    /**
     * Delete single field
     */
    var handleDeleteField = react_1.useCallback(function (fieldId) {
        if (window.confirm('Are you sure you want to delete this field? This cannot be undone.')) {
            // Mock delete - replace with actual API call
            setFields(function (prev) { return prev.filter(function (f) { return f.id !== fieldId; }); });
            setSelectedFields(function (prev) {
                var next = new Set(prev);
                next["delete"](fieldId);
                return next;
            });
        }
    }, []);
    /**
     * Delete selected fields
     */
    var handleBatchDelete = react_1.useCallback(function () {
        var count = selectedFields.size;
        if (window.confirm("Delete " + count + " field" + (count !== 1 ? 's' : '') + "? This cannot be undone.")) {
            setFields(function (prev) { return prev.filter(function (f) { return !selectedFields.has(f.id); }); });
            setSelectedFields(new Set());
        }
    }, [selectedFields]);
    /**
     * Disable selected fields
     */
    var handleBatchDisable = react_1.useCallback(function () {
        setFields(function (prev) {
            return prev.map(function (f) {
                return selectedFields.has(f.id) ? __assign(__assign({}, f), { isActive: false }) : f;
            });
        });
    }, [selectedFields]);
    /**
     * Enable selected fields
     */
    var handleBatchEnable = react_1.useCallback(function () {
        setFields(function (prev) {
            return prev.map(function (f) {
                return selectedFields.has(f.id) ? __assign(__assign({}, f), { isActive: true }) : f;
            });
        });
    }, [selectedFields]);
    /**
     * Handle field saved from dialog
     */
    var handleFieldSaved = react_1.useCallback(function (field) {
        if (dialogMode === 'create') {
            setFields(function (prev) { return __spreadArrays(prev, [field]); });
        }
        else {
            setFields(function (prev) {
                return prev.map(function (f) { return (f.id === field.id ? field : f); });
            });
        }
        setShowDialog(false);
        onFieldsChange === null || onFieldsChange === void 0 ? void 0 : onFieldsChange.;
        (fields);
    }, [dialogMode, fields, onFieldsChange]);
    /**
     * Add error notification
     */
    var addErrorNotification = react_1.useCallback(function (notification) {
        setErrorNotifications(function (prev) { return __spreadArrays(prev, [notification]); });
        setTimeout(function () {
            setErrorNotifications(function (prev) { return prev.filter(function (n) { return n.id !== notification.id; }); });
        }, 5000);
    }, []);
    /**
     * Dismiss error notification
     */
    var dismissErrorNotification = react_1.useCallback(function (id) {
        setErrorNotifications(function (prev) { return prev.filter(function (n) { return n.id !== id; }); });
    }, []);
    return (react_1["default"].createElement("div", { className: "custom-fields-container", role: "main" },
        react_1["default"].createElement("a", { href: "#fields-table", className: "skip-link" }, "Skip to main content"),
        errorNotifications.map(function (notification) { return (react_1["default"].createElement("div", { key: notification.id, className: "notification notification-" + notification.type, role: "alert", "aria-live": "assertive" },
            react_1["default"].createElement("div", { className: "notification-content" },
                react_1["default"].createElement("strong", null, notification.title),
                react_1["default"].createElement("p", null, notification.message)),
            react_1["default"].createElement("button", { className: "notification-close", onClick: function () { return dismissErrorNotification(notification.id); }, "aria-label": "Dismiss notification" }, "\u2715"))); }),
        react_1["default"].createElement("div", { className: "custom-fields-manager" },
            react_1["default"].createElement("div", { className: "manager-header" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("h1", null, "Custom Fields Manager"),
                    react_1["default"].createElement("p", { className: "subtitle" }, "Manage custom fields for your CRM entities")),
                react_1["default"].createElement("div", { className: "header-actions" },
                    react_1["default"].createElement("button", { className: "btn btn-primary", onClick: handleCreateField },
                        react_1["default"].createElement(iconSystem_1["default"], { name: "plus", size: 16 }),
                        "Add Custom Field"),
                    react_1["default"].createElement(iconSystem_1.IconButton, { icon: "help", variant: "ghost", tooltip: "Help", onClick: function () { return setHelpOpen(!helpOpen); }, "aria-label": "Open help" }))),
            react_1["default"].createElement("div", { className: "entity-tabs" }, customFields_1.ENTITY_TYPES.map(function (type) { return (react_1["default"].createElement("button", { key: type, className: "entity-tab " + (selectedEntityType === type ? 'active' : ''), onClick: function () { return handleEntityTypeChange(type); }, "aria-selected": selectedEntityType === type, role: "tab" }, type)); })),
            react_1["default"].createElement("div", { className: "toolbar" },
                react_1["default"].createElement("div", { className: "toolbar-search" },
                    react_1["default"].createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor" },
                        react_1["default"].createElement("circle", { cx: "11", cy: "11", r: "8" }),
                        react_1["default"].createElement("path", { d: "m21 21-4.35-4.35" })),
                    react_1["default"].createElement("input", { type: "text", placeholder: "Search by name or label...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "form-input", "aria-label": "Search custom fields" })),
                react_1["default"].createElement("details", { className: "toolbar-filters" },
                    react_1["default"].createElement("summary", null,
                        react_1["default"].createElement(iconSystem_1["default"], { name: "settings", size: 16 }),
                        "Filters & Sort"),
                    react_1["default"].createElement("div", { className: "toolbar-menu" },
                        react_1["default"].createElement("select", { value: filterByType, onChange: function (e) { return setFilterByType(e.target.value); }, className: "form-select", "aria-label": "Filter by field type" },
                            react_1["default"].createElement("option", { value: "" }, "All Types"),
                            customFields_1.FIELD_TYPES.map(function (type) { return (react_1["default"].createElement("option", { key: type, value: type }, customFields_1.FIELD_TYPE_LABELS[type])); })),
                        react_1["default"].createElement("select", { value: sortBy, onChange: function (e) { return setSortBy(e.target.value); }, className: "form-select", "aria-label": "Sort by" },
                            react_1["default"].createElement("option", { value: "name" }, "Sort by Name"),
                            react_1["default"].createElement("option", { value: "type" }, "Sort by Type"),
                            react_1["default"].createElement("option", { value: "created" }, "Sort by Created Date"))))),
            selectedFields.size > 0 && (react_1["default"].createElement("div", { className: "batch-actions" },
                react_1["default"].createElement("span", null,
                    selectedFields.size,
                    " field",
                    selectedFields.size !== 1 ? 's' : '',
                    " selected"),
                react_1["default"].createElement("button", { className: "btn btn-secondary", onClick: handleBatchEnable, title: "Enable selected fields" }, "Enable"),
                react_1["default"].createElement("button", { className: "btn btn-secondary", onClick: handleBatchDisable, title: "Disable selected fields" }, "Disable"),
                react_1["default"].createElement("button", { className: "btn btn-danger", onClick: handleBatchDelete, title: "Delete selected fields" },
                    react_1["default"].createElement(iconSystem_1["default"], { name: "delete", size: 16 }),
                    "Delete"))),
            loading ? (react_1["default"].createElement("div", { className: "loading-state" },
                react_1["default"].createElement("div", { className: "spinner" }),
                react_1["default"].createElement("span", null, "Loading fields..."))) : filteredAndSortedFields.length === 0 ? (react_1["default"].createElement("div", { className: "empty-state" },
                react_1["default"].createElement("div", { className: "empty-state-icon" }, "\uD83D\uDCCB"),
                react_1["default"].createElement("h3", { className: "empty-state-title" }, "No custom fields found"),
                react_1["default"].createElement("p", { className: "empty-state-description" }, searchQuery || filterByType
                    ? 'Try adjusting your search or filter criteria'
                    : 'Create your first custom field to get started'),
                react_1["default"].createElement("button", { className: "btn btn-primary", onClick: handleCreateField },
                    react_1["default"].createElement(iconSystem_1["default"], { name: "plus", size: 16 }),
                    "Add Custom Field"))) : (react_1["default"].createElement("div", { className: "table-responsive" },
                react_1["default"].createElement("table", { className: "fields-table", role: "grid" },
                    react_1["default"].createElement("thead", null,
                        react_1["default"].createElement("tr", null,
                            react_1["default"].createElement("th", { style: { width: '40px' } },
                                react_1["default"].createElement("input", { type: "checkbox", onChange: handleSelectAll, checked: selectedFields.size === filteredAndSortedFields.length && selectedFields.size > 0, "aria-label": "Select all fields" })),
                            react_1["default"].createElement("th", { scope: "col" }, "Field Name"),
                            react_1["default"].createElement("th", { scope: "col" }, "Label"),
                            react_1["default"].createElement("th", { scope: "col" }, "Type"),
                            react_1["default"].createElement("th", { scope: "col" }, "Required"),
                            react_1["default"].createElement("th", { scope: "col" }, "Status"),
                            react_1["default"].createElement("th", { scope: "col", "aria-label": "Actions" }, "Actions"))),
                    react_1["default"].createElement("tbody", null, filteredAndSortedFields.map(function (field) { return (react_1["default"].createElement("tr", { key: field.id, className: (!field.isActive ? 'inactive' : '') + " " + (field.required ? 'required' : ''), role: "row" },
                        react_1["default"].createElement("td", null,
                            react_1["default"].createElement("input", { type: "checkbox", checked: selectedFields.has(field.id), onChange: function () { return handleSelectField(field.id); }, "aria-label": "Select " + field.fieldLabel })),
                        react_1["default"].createElement("td", null,
                            react_1["default"].createElement("code", { className: "field-name" }, field.fieldName)),
                        react_1["default"].createElement("td", null, field.fieldLabel),
                        react_1["default"].createElement("td", null,
                            react_1["default"].createElement("span", { className: "badge" }, customFields_1.FIELD_TYPE_LABELS[field.fieldType] || field.fieldType)),
                        react_1["default"].createElement("td", null, field.required ? (react_1["default"].createElement(iconSystem_1["default"], { name: "check", size: 16, color: "var(--color-success)" })) : (react_1["default"].createElement("span", { style: { color: 'var(--text-tertiary)' } }, "\u2014"))),
                        react_1["default"].createElement("td", null,
                            react_1["default"].createElement("span", { className: "status-badge " + (field.isActive ? 'active' : 'inactive') }, field.isActive ? 'Active' : 'Inactive')),
                        react_1["default"].createElement("td", null,
                            react_1["default"].createElement("div", { className: "action-buttons" },
                                react_1["default"].createElement(iconSystem_1.IconButton, { icon: "edit", variant: "secondary", tooltip: "Edit field", onClick: function () { return handleEditField(field); }, "aria-label": "Edit " + field.fieldLabel }),
                                react_1["default"].createElement(iconSystem_1.IconButton, { icon: "delete", variant: "danger", tooltip: "Delete field", onClick: function () { return handleDeleteField(field.id); }, "aria-label": "Delete " + field.fieldLabel }))))); })))))),
        showDialog && (react_1["default"].createElement(CustomFieldDialog_1["default"], { mode: dialogMode, field: selectedField, entityType: selectedEntityType, existingFields: fields, onSave: handleFieldSaved, onCancel: function () { return setShowDialog(false); }, onError: function (error) {
                var notification = errorHandling_1.createErrorNotification(error, dialogMode === 'create' ? 'create' : 'update');
                addErrorNotification(notification);
            } })),
        helpOpen && (react_1["default"].createElement(helpSystem_1.HelpPanel, { isOpen: helpOpen, onClose: function () { return setHelpOpen(false); } })),
        react_1["default"].createElement(KeyboardShortcuts, { onHelpToggle: function () { return setHelpOpen(!helpOpen); } })));
};
var KeyboardShortcuts = function (_a) {
    var onHelpToggle = _a.onHelpToggle;
    react_1.useEffect(function () {
        var handleKeyDown = function (e) {
            // Shift + ? to toggle help
            if (e.shiftKey && e.key === '?') {
                e.preventDefault();
                onHelpToggle();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return function () { return window.removeEventListener('keydown', handleKeyDown); };
    }, [onHelpToggle]);
    return null;
};
exports["default"] = CustomFieldsManager;
