"use strict";
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
exports.__esModule = true;
var vitest_1 = require("vitest");
var react_1 = require("@testing-library/react");
var CustomFieldsManager_1 = require("./CustomFieldsManager");
// Mock all dependencies
vitest_1.vi.mock('@/types/customFields', function () { return ({
    ENTITY_TYPES: ['user'],
    FIELD_TYPES: ['text', 'email'],
    FIELD_TYPE_LABELS: { text: 'Text', email: 'Email' }
}); });
vitest_1.vi.mock('@/services/customFieldsService', function () { return ({
    "default": {
        getFields: vitest_1.vi.fn().mockResolvedValue({
            fields: [
                {
                    id: 'field1',
                    fieldName: 'test_field',
                    fieldLabel: 'Test Field',
                    fieldType: 'text',
                    required: false,
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-01T00:00:00Z'
                },
                {
                    id: 'field2',
                    fieldName: 'email_field',
                    fieldLabel: 'Email Field',
                    fieldType: 'email',
                    required: true,
                    createdAt: '2024-01-02T00:00:00Z',
                    updatedAt: '2024-01-02T00:00:00Z'
                }
            ]
        }),
        createField: vitest_1.vi.fn(),
        updateField: vitest_1.vi.fn(),
        deleteField: vitest_1.vi.fn(),
        deleteFields: vitest_1.vi.fn()
    }
}); });
vitest_1.vi.mock('./CustomFieldRenderer', function () { return ({
    "default": function () { return React.createElement("div", null, "Field Renderer"); }
}); });
vitest_1.vi.mock('./CustomFieldDialog', function () { return ({
    "default": function (_a) {
        var isOpen = _a.isOpen, onClose = _a.onClose, onSave = _a.onSave;
        return (isOpen ? (React.createElement("div", { "data-testid": "custom-field-dialog" },
            React.createElement("button", { onClick: onClose, "data-testid": "dialog-close" }, "Close"),
            React.createElement("button", { onClick: function () { return onSave({
                    name: 'new_field',
                    label: 'New Field',
                    type: 'text',
                    required: false
                }); }, "data-testid": "dialog-save" }, "Save"))) : null);
    }
}); });
vitest_1.vi.mock('./iconSystem', function () { return ({
    IconButton: function (_a) {
        var icon = _a.icon, onClick = _a.onClick, children = _a.children;
        return (React.createElement("button", { "data-testid": "icon-" + icon, onClick: onClick }, children || icon));
    }
}); });
vitest_1.vi.mock('./errorHandling', function () { return ({
    categorizeError: vitest_1.vi.fn(),
    createErrorNotification: vitest_1.vi.fn()
}); });
vitest_1.vi.mock('./helpSystem', function () { return ({
    HelpPanel: function () { return React.createElement("div", null, "Help Panel"); }
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
vitest_1.describe('CustomFieldsManager - Form Validation & Multi-Select Integration', function () {
    vitest_1.beforeEach(function () {
        vitest_1.vi.clearAllMocks();
    });
    vitest_1.describe('Multi-Select Functionality', function () {
        vitest_1.it('renders select all checkbox and individual field checkboxes', function () { return __awaiter(void 0, void 0, void 0, function () {
            var checkboxes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(CustomFieldsManager_1["default"], { entityType: "user" }));
                        return [4 /*yield*/, react_1.waitFor(function () {
                                vitest_1.expect(react_1.screen.getByText('test_field')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        checkboxes = react_1.screen.getAllByRole('checkbox');
                        vitest_1.expect(checkboxes).toHaveLength(3); // 1 select-all + 2 field checkboxes
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('selects individual fields when checkbox is clicked', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(CustomFieldsManager_1["default"], { entityType: "user" }));
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
        vitest_1.it('selects all fields when select all is clicked', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(CustomFieldsManager_1["default"], { entityType: "user" }));
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
        vitest_1.it('clears selection when clear button is clicked', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(CustomFieldsManager_1["default"], { entityType: "user" }));
                        return [4 /*yield*/, react_1.waitFor(function () {
                                var checkboxes = react_1.screen.getAllByRole('checkbox');
                                react_1.fireEvent.click(checkboxes[1]); // Select first field
                            })];
                    case 1:
                        _a.sent();
                        vitest_1.expect(react_1.screen.getByText('1 field(s) selected')).toBeInTheDocument();
                        react_1.fireEvent.click(react_1.screen.getByText('Clear Selection'));
                        vitest_1.expect(react_1.screen.queryByText('1 field(s) selected')).not.toBeInTheDocument();
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('highlights selected rows', function () { return __awaiter(void 0, void 0, void 0, function () {
            var selectedRow;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(CustomFieldsManager_1["default"], { entityType: "user" }));
                        return [4 /*yield*/, react_1.waitFor(function () {
                                var checkboxes = react_1.screen.getAllByRole('checkbox');
                                react_1.fireEvent.click(checkboxes[1]); // Select first field
                            })];
                    case 1:
                        _a.sent();
                        selectedRow = react_1.screen.getByText('test_field').closest('tr');
                        vitest_1.expect(selectedRow).toHaveClass('selected');
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('handles partial selection state in select all checkbox', function () { return __awaiter(void 0, void 0, void 0, function () {
            var selectAllCheckbox;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(CustomFieldsManager_1["default"], { entityType: "user" }));
                        return [4 /*yield*/, react_1.waitFor(function () {
                                var checkboxes = react_1.screen.getAllByRole('checkbox');
                                react_1.fireEvent.click(checkboxes[1]); // Select only first field
                            })];
                    case 1:
                        _a.sent();
                        selectAllCheckbox = react_1.screen.getByRole('checkbox', { name: /select all fields/i });
                        vitest_1.expect(selectAllCheckbox.indeterminate).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    vitest_1.describe('Form Validation Integration', function () {
        vitest_1.it('opens create dialog when create button is clicked', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(CustomFieldsManager_1["default"], { entityType: "user" }));
                        return [4 /*yield*/, react_1.waitFor(function () {
                                react_1.fireEvent.click(react_1.screen.getByText('Create New Field'));
                            })];
                    case 1:
                        _a.sent();
                        vitest_1.expect(react_1.screen.getByTestId('custom-field-dialog')).toBeInTheDocument();
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('opens edit dialog when edit button is clicked', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(CustomFieldsManager_1["default"], { entityType: "user" }));
                        return [4 /*yield*/, react_1.waitFor(function () {
                                var editButtons = react_1.screen.getAllByTestId('icon-edit');
                                react_1.fireEvent.click(editButtons[0]);
                            })];
                    case 1:
                        _a.sent();
                        vitest_1.expect(react_1.screen.getByTestId('custom-field-dialog')).toBeInTheDocument();
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('closes dialog when cancel is clicked', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(CustomFieldsManager_1["default"], { entityType: "user" }));
                        return [4 /*yield*/, react_1.waitFor(function () {
                                react_1.fireEvent.click(react_1.screen.getByText('Create New Field'));
                            })];
                    case 1:
                        _a.sent();
                        vitest_1.expect(react_1.screen.getByTestId('custom-field-dialog')).toBeInTheDocument();
                        react_1.fireEvent.click(react_1.screen.getByTestId('dialog-close'));
                        vitest_1.expect(react_1.screen.queryByTestId('custom-field-dialog')).not.toBeInTheDocument();
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('calls onSave when form is submitted', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockService, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = vitest_1.vi).mocked;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('@/services/customFieldsService'); })];
                    case 1:
                        mockService = _b.apply(_a, [_c.sent()])["default"];
                        react_1.render(React.createElement(CustomFieldsManager_1["default"], { entityType: "user" }));
                        return [4 /*yield*/, react_1.waitFor(function () {
                                react_1.fireEvent.click(react_1.screen.getByText('Create New Field'));
                            })];
                    case 2:
                        _c.sent();
                        react_1.fireEvent.click(react_1.screen.getByTestId('dialog-save'));
                        return [4 /*yield*/, react_1.waitFor(function () {
                                vitest_1.expect(mockService.createField).toHaveBeenCalledWith({
                                    name: 'new_field',
                                    label: 'New Field',
                                    type: 'text',
                                    required: false
                                });
                            })];
                    case 3:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    vitest_1.describe('Error Handling Integration', function () {
        vitest_1.it('displays error notifications on API failure', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockService, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = vitest_1.vi).mocked;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('@/services/customFieldsService'); })];
                    case 1:
                        mockService = _b.apply(_a, [_c.sent()])["default"];
                        mockService.getFields.mockRejectedValueOnce(new Error('API Error'));
                        react_1.render(React.createElement(CustomFieldsManager_1["default"], { entityType: "user" }));
                        return [4 /*yield*/, react_1.waitFor(function () {
                                vitest_1.expect(react_1.screen.getByText(/failed to load custom fields/i)).toBeInTheDocument();
                            })];
                    case 2:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('shows retry suggestions for network errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockService, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = vitest_1.vi).mocked;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('@/services/customFieldsService'); })];
                    case 1:
                        mockService = _b.apply(_a, [_c.sent()])["default"];
                        mockService.getFields.mockRejectedValueOnce(new Error('Network Error'));
                        react_1.render(React.createElement(CustomFieldsManager_1["default"], { entityType: "user" }));
                        return [4 /*yield*/, react_1.waitFor(function () {
                                vitest_1.expect(react_1.screen.getByText(/try again/i)).toBeInTheDocument();
                            })];
                    case 2:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    vitest_1.describe('Help System Integration', function () {
        vitest_1.it('opens help panel when help button is clicked', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(CustomFieldsManager_1["default"], { entityType: "user" }));
                        return [4 /*yield*/, react_1.waitFor(function () {
                                react_1.fireEvent.click(react_1.screen.getByTestId('icon-help'));
                            })];
                    case 1:
                        _a.sent();
                        // Help panel should be rendered (mocked)
                        vitest_1.expect(react_1.screen.getByText('Help Panel')).toBeInTheDocument();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    vitest_1.describe('Icon System Integration', function () {
        vitest_1.it('renders edit icons for each field', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(CustomFieldsManager_1["default"], { entityType: "user" }));
                        return [4 /*yield*/, react_1.waitFor(function () {
                                var editIcons = react_1.screen.getAllByTestId('icon-edit');
                                vitest_1.expect(editIcons).toHaveLength(2);
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('renders delete icons for each field', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(CustomFieldsManager_1["default"], { entityType: "user" }));
                        return [4 /*yield*/, react_1.waitFor(function () {
                                var deleteIcons = react_1.screen.getAllByTestId('icon-delete');
                                vitest_1.expect(deleteIcons).toHaveLength(2);
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('renders help icon in header', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(CustomFieldsManager_1["default"], { entityType: "user" }));
                        return [4 /*yield*/, react_1.waitFor(function () {
                                vitest_1.expect(react_1.screen.getByTestId('icon-help')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    vitest_1.describe('Accessibility Integration', function () {
        vitest_1.it('has proper ARIA labels on checkboxes', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(CustomFieldsManager_1["default"], { entityType: "user" }));
                        return [4 /*yield*/, react_1.waitFor(function () {
                                var selectAllCheckbox = react_1.screen.getByRole('checkbox', { name: /select all fields/i });
                                vitest_1.expect(selectAllCheckbox).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('supports keyboard navigation for checkboxes', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(CustomFieldsManager_1["default"], { entityType: "user" }));
                        return [4 /*yield*/, react_1.waitFor(function () {
                                var checkboxes = react_1.screen.getAllByRole('checkbox');
                                checkboxes[0].focus();
                                vitest_1.expect(document.activeElement).toBe(checkboxes[0]);
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
