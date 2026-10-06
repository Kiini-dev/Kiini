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
var vitest_1 = require("vitest");
var react_1 = require("@testing-library/react");
var CustomFieldsManager_1 = require("./CustomFieldsManager");
// Mock all dependencies
vitest_1.vi.mock('@/types/customFields', function () { return ({
    CustomField: {},
    CustomFieldExtended: {},
    EntityType: {},
    ENTITY_TYPES: ['user', 'organization'],
    FIELD_TYPES: ['text', 'email', 'number'],
    FIELD_TYPE_LABELS: {
        text: 'Text',
        email: 'Email',
        number: 'Number'
    }
}); });
vitest_1.vi.mock('@/services/customFieldsService', function () { return ({
    "default": {
        getFields: vitest_1.vi.fn(),
        createField: vitest_1.vi.fn(),
        updateField: vitest_1.vi.fn(),
        deleteField: vitest_1.vi.fn(),
        deleteFields: vitest_1.vi.fn()
    }
}); });
vitest_1.vi.mock('./CustomFieldRenderer', function () { return ({
    "default": function () { return React.createElement("div", { "data-testid": "custom-field-renderer" }, "Field Renderer"); }
}); });
vitest_1.vi.mock('./CustomFieldDialog', function () { return ({
    "default": function (_a) {
        var isOpen = _a.isOpen, onClose = _a.onClose, onSave = _a.onSave, field = _a.field;
        return (isOpen ? (React.createElement("div", { "data-testid": "custom-field-dialog" },
            React.createElement("h2", null,
                field ? 'Edit' : 'Create',
                " Custom Field"),
            React.createElement("form", { onSubmit: function (e) {
                    e.preventDefault();
                    onSave(__assign({ name: 'test_field', label: 'Test Field', type: 'text', required: false }, (field && { id: field.id })));
                } },
                React.createElement("button", { type: "submit", "data-testid": "dialog-save" }, "Save"),
                React.createElement("button", { type: "button", onClick: onClose, "data-testid": "dialog-cancel" }, "Cancel")))) : null);
    }
}); });
vitest_1.vi.mock('./iconSystem', function () { return ({
    IconButton: function (_a) {
        var icon = _a.icon, variant = _a.variant, tooltip = _a.tooltip, ariaLabel = _a["aria-label"], onClick = _a.onClick, children = _a.children;
        return (React.createElement("button", { "data-testid": "icon-button-" + icon, "data-variant": variant, title: tooltip, "aria-label": ariaLabel, onClick: onClick }, children || icon));
    }
}); });
vitest_1.vi.mock('./errorHandling', function () { return ({
    categorizeError: vitest_1.vi.fn(function () { return ({ category: 'NETWORK_ERROR', message: 'Network error' }); }),
    createErrorNotification: vitest_1.vi.fn(function () { return ({
        id: 'error1',
        category: 'NETWORK_ERROR',
        message: 'Network error',
        timestamp: new Date(),
        retryable: true
    }); }),
    ErrorNotification: {}
}); });
vitest_1.vi.mock('./helpSystem', function () { return ({
    HelpPanel: function (_a) {
        var isOpen = _a.isOpen, onClose = _a.onClose;
        return (isOpen ? React.createElement("div", { "data-testid": "help-panel" }, "Help Panel") : null);
    }
}); });
// Mock CSS
vitest_1.vi.mock('../styles/customFieldsManager.css', function () { return ({}); });
vitest_1.vi.mock('./designTokens.css', function () { return ({}); });
vitest_1.vi.mock('./enhancedStyles.css', function () { return ({}); });
// Mock browser APIs
global.ResizeObserver = vitest_1.vi.fn(function () { return ({ observe: vitest_1.vi.fn(), disconnect: vitest_1.vi.fn() }); });
global.IntersectionObserver = vitest_1.vi.fn(function () { return ({ observe: vitest_1.vi.fn(), disconnect: vitest_1.vi.fn() }); });
Object.defineProperty(window, 'matchMedia', {
    value: vitest_1.vi.fn(function () { return ({ matches: false, addListener: vitest_1.vi.fn(), removeListener: vitest_1.vi.fn() }); })
});
vitest_1.describe('CustomFieldsManager Integration Tests', function () {
    var mockFields = [
        {
            id: 'field1',
            name: 'test_field',
            label: 'Test Field',
            type: 'text',
            required: false,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
        },
        {
            id: 'field2',
            name: 'email_field',
            label: 'Email Field',
            type: 'email',
            required: true,
            createdAt: '2024-01-02T00:00:00Z',
            updatedAt: '2024-01-02T00:00:00Z'
        }
    ];
    var mockService;
    vitest_1.beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    vitest_1.vi.clearAllMocks();
                    _b = (_a = vitest_1.vi).mocked;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('@/services/customFieldsService'); })];
                case 1:
                    mockService = _b.apply(_a, [_c.sent()])["default"];
                    mockService.getFields.mockResolvedValue(mockFields);
                    mockService.createField.mockResolvedValue({
                        id: 'field3',
                        name: 'new_field',
                        label: 'New Field',
                        type: 'text',
                        required: false,
                        createdAt: '2024-01-03T00:00:00Z',
                        updatedAt: '2024-01-03T00:00:00Z'
                    });
                    mockService.updateField.mockResolvedValue(__assign(__assign({}, mockFields[0]), { label: 'Updated Field' }));
                    mockService.deleteField.mockResolvedValue(undefined);
                    mockService.deleteFields.mockResolvedValue(undefined);
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.afterEach(function () {
        vitest_1.vi.clearAllTimers();
    });
    vitest_1.describe('Full Component Rendering', function () {
        vitest_1.it('renders complete component with all integrated systems', function () { return __awaiter(void 0, void 0, void 0, function () {
            var editButtons, deleteButtons, checkboxes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(CustomFieldsManager_1.CustomFieldsManager, null));
                        // Wait for data to load
                        return [4 /*yield*/, react_1.waitFor(function () {
                                vitest_1.expect(react_1.screen.getByText('Custom Fields Manager')).toBeInTheDocument();
                            })];
                    case 1:
                        // Wait for data to load
                        _a.sent();
                        // Check header with title and help button
                        vitest_1.expect(react_1.screen.getByText('Custom Fields Manager')).toBeInTheDocument();
                        vitest_1.expect(react_1.screen.getByTestId('icon-button-help')).toBeInTheDocument();
                        // Check create button
                        vitest_1.expect(react_1.screen.getByText('Create New Field')).toBeInTheDocument();
                        // Check field count
                        vitest_1.expect(react_1.screen.getByText('Fields (2)')).toBeInTheDocument();
                        // Check table headers
                        vitest_1.expect(react_1.screen.getByText('Name')).toBeInTheDocument();
                        vitest_1.expect(react_1.screen.getByText('Label')).toBeInTheDocument();
                        vitest_1.expect(react_1.screen.getByText('Type')).toBeInTheDocument();
                        vitest_1.expect(react_1.screen.getByText('Required')).toBeInTheDocument();
                        vitest_1.expect(react_1.screen.getByText('Actions')).toBeInTheDocument();
                        // Check field data
                        vitest_1.expect(react_1.screen.getByText('test_field')).toBeInTheDocument();
                        vitest_1.expect(react_1.screen.getByText('Test Field')).toBeInTheDocument();
                        vitest_1.expect(react_1.screen.getByText('email_field')).toBeInTheDocument();
                        vitest_1.expect(react_1.screen.getByText('Email Field')).toBeInTheDocument();
                        editButtons = react_1.screen.getAllByTestId('icon-button-edit');
                        deleteButtons = react_1.screen.getAllByTestId('icon-button-delete');
                        vitest_1.expect(editButtons).toHaveLength(2);
                        vitest_1.expect(deleteButtons).toHaveLength(2);
                        checkboxes = react_1.screen.getAllByRole('checkbox');
                        vitest_1.expect(checkboxes).toHaveLength(3); // 1 select-all + 2 field checkboxes
                        return [2 /*return*/];
                }
            });
        }); });
    });
    vitest_1.describe('API Integration', function () {
        vitest_1.it('loads fields from API on mount', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(CustomFieldsManager_1.CustomFieldsManager, null));
                        return [4 /*yield*/, react_1.waitFor(function () {
                                vitest_1.expect(mockService.getFields).toHaveBeenCalledTimes(1);
                            })];
                    case 1:
                        _a.sent();
                        vitest_1.expect(react_1.screen.getByText('test_field')).toBeInTheDocument();
                        vitest_1.expect(react_1.screen.getByText('email_field')).toBeInTheDocument();
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('creates new field via API', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(CustomFieldsManager_1.CustomFieldsManager, null));
                        return [4 /*yield*/, react_1.waitFor(function () {
                                vitest_1.expect(react_1.screen.getByText('Create New Field')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        // Click create button
                        react_1.fireEvent.click(react_1.screen.getByText('Create New Field'));
                        // Dialog should open
                        vitest_1.expect(react_1.screen.getByTestId('custom-field-dialog')).toBeInTheDocument();
                        // Submit form
                        react_1.fireEvent.click(react_1.screen.getByTestId('dialog-save'));
                        // API should be called
                        return [4 /*yield*/, react_1.waitFor(function () {
                                vitest_1.expect(mockService.createField).toHaveBeenCalledWith({
                                    name: 'test_field',
                                    label: 'Test Field',
                                    type: 'text',
                                    required: false
                                });
                            })];
                    case 2:
                        // API should be called
                        _a.sent();
                        // Fields should be refreshed
                        vitest_1.expect(mockService.getFields).toHaveBeenCalledTimes(2);
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('updates field via API', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(CustomFieldsManager_1.CustomFieldsManager, null));
                        return [4 /*yield*/, react_1.waitFor(function () {
                                var editButtons = react_1.screen.getAllByTestId('icon-button-edit');
                                react_1.fireEvent.click(editButtons[0]);
                            })];
                    case 1:
                        _a.sent();
                        // Dialog should open in edit mode
                        vitest_1.expect(react_1.screen.getByTestId('custom-field-dialog')).toBeInTheDocument();
                        vitest_1.expect(react_1.screen.getByText('Edit Custom Field')).toBeInTheDocument();
                        // Submit form
                        react_1.fireEvent.click(react_1.screen.getByTestId('dialog-save'));
                        // API should be called with field ID
                        return [4 /*yield*/, react_1.waitFor(function () {
                                vitest_1.expect(mockService.updateField).toHaveBeenCalledWith('field1', {
                                    name: 'test_field',
                                    label: 'Test Field',
                                    type: 'text',
                                    required: false,
                                    id: 'field1'
                                });
                            })];
                    case 2:
                        // API should be called with field ID
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('deletes field via API', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(CustomFieldsManager_1.CustomFieldsManager, null));
                        return [4 /*yield*/, react_1.waitFor(function () {
                                var deleteButtons = react_1.screen.getAllByTestId('icon-button-delete');
                                react_1.fireEvent.click(deleteButtons[0]);
                            })];
                    case 1:
                        _a.sent();
                        // Confirm deletion (assuming browser confirm)
                        vitest_1.vi.spyOn(window, 'confirm').mockReturnValue(true);
                        return [4 /*yield*/, react_1.waitFor(function () {
                                vitest_1.expect(mockService.deleteField).toHaveBeenCalledWith('field1');
                            })];
                    case 2:
                        _a.sent();
                        // Fields should be refreshed
                        vitest_1.expect(mockService.getFields).toHaveBeenCalledTimes(2);
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('handles API errors gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockService.getFields.mockRejectedValue(new Error('API Error'));
                        react_1.render(React.createElement(CustomFieldsManager_1.CustomFieldsManager, null));
                        return [4 /*yield*/, react_1.waitFor(function () {
                                vitest_1.expect(react_1.screen.getByText(/failed to load custom fields/i)).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    vitest_1.describe('Multi-Select Integration', function () {
        vitest_1.it('selects individual fields and shows batch actions', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(CustomFieldsManager_1.CustomFieldsManager, null));
                        return [4 /*yield*/, react_1.waitFor(function () {
                                var checkboxes = react_1.screen.getAllByRole('checkbox');
                                react_1.fireEvent.click(checkboxes[1]); // Select first field
                            })];
                    case 1:
                        _a.sent();
                        vitest_1.expect(react_1.screen.getByText('1 field(s) selected')).toBeInTheDocument();
                        vitest_1.expect(react_1.screen.getByText('Delete Selected')).toBeInTheDocument();
                        vitest_1.expect(react_1.screen.getByText('Clear Selection')).toBeInTheDocument();
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('selects all fields with select-all checkbox', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(CustomFieldsManager_1.CustomFieldsManager, null));
                        return [4 /*yield*/, react_1.waitFor(function () {
                                var selectAllCheckbox = react_1.screen.getByRole('checkbox', { name: /select all fields/i });
                                react_1.fireEvent.click(selectAllCheckbox);
                            })];
                    case 1:
                        _a.sent();
                        vitest_1.expect(react_1.screen.getByText('2 field(s) selected')).toBeInTheDocument();
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('performs batch delete operation', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(CustomFieldsManager_1.CustomFieldsManager, null));
                        return [4 /*yield*/, react_1.waitFor(function () {
                                var checkboxes = react_1.screen.getAllByRole('checkbox');
                                react_1.fireEvent.click(checkboxes[1]); // Select first field
                                react_1.fireEvent.click(checkboxes[2]); // Select second field
                            })];
                    case 1:
                        _a.sent();
                        vitest_1.expect(react_1.screen.getByText('2 field(s) selected')).toBeInTheDocument();
                        // Click batch delete
                        react_1.fireEvent.click(react_1.screen.getByText('Delete Selected'));
                        // Confirm deletion
                        vitest_1.vi.spyOn(window, 'confirm').mockReturnValue(true);
                        return [4 /*yield*/, react_1.waitFor(function () {
                                vitest_1.expect(mockService.deleteFields).toHaveBeenCalledWith(['field1', 'field2']);
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('clears selection', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(CustomFieldsManager_1.CustomFieldsManager, null));
                        return [4 /*yield*/, react_1.waitFor(function () {
                                var checkboxes = react_1.screen.getAllByRole('checkbox');
                                react_1.fireEvent.click(checkboxes[1]); // Select first field
                            })];
                    case 1:
                        _a.sent();
                        vitest_1.expect(react_1.screen.getByText('1 field(s) selected')).toBeInTheDocument();
                        // Clear selection
                        react_1.fireEvent.click(react_1.screen.getByText('Clear Selection'));
                        vitest_1.expect(react_1.screen.queryByText('1 field(s) selected')).not.toBeInTheDocument();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    vitest_1.describe('Help System Integration', function () {
        vitest_1.it('opens help panel when help button clicked', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(CustomFieldsManager_1.CustomFieldsManager, null));
                        return [4 /*yield*/, react_1.waitFor(function () {
                                var helpButton = react_1.screen.getByTestId('icon-button-help');
                                react_1.fireEvent.click(helpButton);
                            })];
                    case 1:
                        _a.sent();
                        vitest_1.expect(react_1.screen.getByTestId('help-panel')).toBeInTheDocument();
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('toggles help with keyboard shortcut', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(CustomFieldsManager_1.CustomFieldsManager, null));
                        return [4 /*yield*/, react_1.waitFor(function () {
                                vitest_1.expect(react_1.screen.queryByTestId('help-panel')).not.toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        // Simulate Shift+? keypress
                        react_1.fireEvent.keyDown(document, { key: '?', shiftKey: true });
                        vitest_1.expect(react_1.screen.getByTestId('help-panel')).toBeInTheDocument();
                        // Toggle off
                        react_1.fireEvent.keyDown(document, { key: '?', shiftKey: true });
                        vitest_1.expect(react_1.screen.queryByTestId('help-panel')).not.toBeInTheDocument();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    vitest_1.describe('Error Handling Integration', function () {
        vitest_1.it('shows error notification on API failure', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockService.getFields.mockRejectedValue(new Error('Network error'));
                        react_1.render(React.createElement(CustomFieldsManager_1.CustomFieldsManager, null));
                        return [4 /*yield*/, react_1.waitFor(function () {
                                vitest_1.expect(react_1.screen.getByText(/failed to load custom fields/i)).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        // Should show retry suggestion
                        vitest_1.expect(react_1.screen.getByText(/try again/i)).toBeInTheDocument();
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('dismisses error notification', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockService.getFields.mockRejectedValue(new Error('Network error'));
                        react_1.render(React.createElement(CustomFieldsManager_1.CustomFieldsManager, null));
                        return [4 /*yield*/, react_1.waitFor(function () {
                                var closeButtons = react_1.screen.getAllByTestId('icon-button-x');
                                react_1.fireEvent.click(closeButtons[0]);
                            })];
                    case 1:
                        _a.sent();
                        vitest_1.expect(react_1.screen.queryByText(/failed to load custom fields/i)).not.toBeInTheDocument();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    vitest_1.describe('Form Validation Integration', function () {
        vitest_1.it('validates form data before API call', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(CustomFieldsManager_1.CustomFieldsManager, null));
                        return [4 /*yield*/, react_1.waitFor(function () {
                                react_1.fireEvent.click(react_1.screen.getByText('Create New Field'));
                            })];
                    case 1:
                        _a.sent();
                        // Dialog should open
                        vitest_1.expect(react_1.screen.getByTestId('custom-field-dialog')).toBeInTheDocument();
                        // Submit form
                        react_1.fireEvent.click(react_1.screen.getByTestId('dialog-save'));
                        // API should be called (validation passed in mock)
                        return [4 /*yield*/, react_1.waitFor(function () {
                                vitest_1.expect(mockService.createField).toHaveBeenCalled();
                            })];
                    case 2:
                        // API should be called (validation passed in mock)
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    vitest_1.describe('State Management Integration', function () {
        vitest_1.it('updates UI after successful operations', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(CustomFieldsManager_1.CustomFieldsManager, null));
                        return [4 /*yield*/, react_1.waitFor(function () {
                                vitest_1.expect(react_1.screen.getByText('Fields (2)')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        // Simulate successful creation
                        mockService.getFields.mockResolvedValue(__spreadArrays(mockFields, [{
                                id: 'field3',
                                name: 'new_field',
                                label: 'New Field',
                                type: 'text',
                                required: false,
                                createdAt: '2024-01-03T00:00:00Z',
                                updatedAt: '2024-01-03T00:00:00Z'
                            }]));
                        // Trigger a refresh (e.g., after creation)
                        return [4 /*yield*/, react_1.waitFor(function () {
                                vitest_1.expect(react_1.screen.getByText('Fields (3)')).toBeInTheDocument();
                            })];
                    case 2:
                        // Trigger a refresh (e.g., after creation)
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    vitest_1.describe('Accessibility Integration', function () {
        vitest_1.it('supports keyboard navigation', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(CustomFieldsManager_1.CustomFieldsManager, null));
                        return [4 /*yield*/, react_1.waitFor(function () {
                                var helpButton = react_1.screen.getByTestId('icon-button-help');
                                helpButton.focus();
                                vitest_1.expect(document.activeElement).toBe(helpButton);
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('has proper ARIA labels', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(CustomFieldsManager_1.CustomFieldsManager, null));
                        return [4 /*yield*/, react_1.waitFor(function () {
                                var checkboxes = react_1.screen.getAllByRole('checkbox');
                                vitest_1.expect(checkboxes[0]).toHaveAttribute('aria-label', 'Select all fields');
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
