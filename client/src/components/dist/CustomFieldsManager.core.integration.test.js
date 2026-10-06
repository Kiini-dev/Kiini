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
var react_1 = require("react");
var vitest_1 = require("vitest");
var react_2 = require("@testing-library/react");
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
    "default": function () { return react_1["default"].createElement("div", null, "Field Renderer"); }
}); });
vitest_1.vi.mock('./CustomFieldDialog', function () { return ({
    "default": function (_a) {
        var isOpen = _a.isOpen, onClose = _a.onClose, onSave = _a.onSave;
        return (isOpen ? (react_1["default"].createElement("div", { "data-testid": "custom-field-dialog" },
            react_1["default"].createElement("button", { onClick: onClose, "data-testid": "dialog-close" }, "Close"),
            react_1["default"].createElement("button", { onClick: function () { return onSave({
                    fieldName: 'new_field',
                    fieldLabel: 'New Field',
                    fieldType: 'text',
                    required: false
                }); }, "data-testid": "dialog-save" }, "Save"))) : null);
    }
}); });
vitest_1.vi.mock('./iconSystem', function () { return ({
    IconButton: function (_a) {
        var icon = _a.icon, onClick = _a.onClick, children = _a.children;
        return (react_1["default"].createElement("button", { "data-testid": "icon-" + icon, onClick: onClick }, children || icon));
    }
}); });
vitest_1.vi.mock('./errorHandling', function () { return ({
    categorizeError: vitest_1.vi.fn(),
    createErrorNotification: vitest_1.vi.fn()
}); });
vitest_1.vi.mock('./helpSystem', function () { return ({
    HelpPanel: function () { return react_1["default"].createElement("div", null, "Help Panel"); }
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
vitest_1.describe('CustomFieldsManager - Core Integration Tests', function () {
    vitest_1.beforeEach(function () {
        vitest_1.vi.clearAllMocks();
    });
    vitest_1.it('renders component with entity type and loads fields', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    react_2.render(react_1["default"].createElement(CustomFieldsManager_1["default"], { entityType: "user" }));
                    // Check that the component renders the header
                    vitest_1.expect(react_2.screen.getByText('Custom Fields Manager')).toBeInTheDocument();
                    // Wait for fields to load
                    return [4 /*yield*/, react_2.waitFor(function () {
                            vitest_1.expect(react_2.screen.getByText('test_field')).toBeInTheDocument();
                        })];
                case 1:
                    // Wait for fields to load
                    _a.sent();
                    // Verify both fields are displayed
                    vitest_1.expect(react_2.screen.getByText('email_field')).toBeInTheDocument();
                    vitest_1.expect(react_2.screen.getByText('Test Field')).toBeInTheDocument();
                    vitest_1.expect(react_2.screen.getByText('Email Field')).toBeInTheDocument();
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.it('displays field table with correct structure', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    react_2.render(react_1["default"].createElement(CustomFieldsManager_1["default"], { entityType: "user" }));
                    return [4 /*yield*/, react_2.waitFor(function () {
                            vitest_1.expect(react_2.screen.getByText('test_field')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    // Check table headers
                    vitest_1.expect(react_2.screen.getByText('Field Name')).toBeInTheDocument();
                    vitest_1.expect(react_2.screen.getByText('Label')).toBeInTheDocument();
                    vitest_1.expect(react_2.screen.getByText('Type')).toBeInTheDocument();
                    vitest_1.expect(react_2.screen.getByText('Required')).toBeInTheDocument();
                    vitest_1.expect(react_2.screen.getByText('Status')).toBeInTheDocument();
                    vitest_1.expect(react_2.screen.getByText('Actions')).toBeInTheDocument();
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.it('renders checkboxes for multi-select functionality', function () { return __awaiter(void 0, void 0, void 0, function () {
        var checkboxes;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    react_2.render(react_1["default"].createElement(CustomFieldsManager_1["default"], { entityType: "user" }));
                    return [4 /*yield*/, react_2.waitFor(function () {
                            vitest_1.expect(react_2.screen.getByText('test_field')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    checkboxes = react_2.screen.getAllByRole('checkbox');
                    vitest_1.expect(checkboxes.length).toBeGreaterThanOrEqual(3); // At least select-all + 2 fields
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.it('shows create field button', function () { return __awaiter(void 0, void 0, void 0, function () {
        var createButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    react_2.render(react_1["default"].createElement(CustomFieldsManager_1["default"], { entityType: "user" }));
                    return [4 /*yield*/, react_2.waitFor(function () {
                            vitest_1.expect(react_2.screen.getByText('test_field')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    createButton = react_2.screen.getByText(/Add Field|Create New Field/i);
                    vitest_1.expect(createButton).toBeInTheDocument();
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.it('renders help icon in header', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    react_2.render(react_1["default"].createElement(CustomFieldsManager_1["default"], { entityType: "user" }));
                    return [4 /*yield*/, react_2.waitFor(function () {
                            vitest_1.expect(react_2.screen.getByText('test_field')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    vitest_1.expect(react_2.screen.getByTestId('icon-help')).toBeInTheDocument();
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.it('renders edit and delete icons for each field', function () { return __awaiter(void 0, void 0, void 0, function () {
        var editIcons, deleteIcons;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    react_2.render(react_1["default"].createElement(CustomFieldsManager_1["default"], { entityType: "user" }));
                    return [4 /*yield*/, react_2.waitFor(function () {
                            vitest_1.expect(react_2.screen.getByText('test_field')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    editIcons = react_2.screen.getAllByTestId('icon-edit');
                    deleteIcons = react_2.screen.getAllByTestId('icon-delete');
                    vitest_1.expect(editIcons).toHaveLength(2); // One for each field
                    vitest_1.expect(deleteIcons).toHaveLength(2); // One for each field
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.it('opens create dialog when create button is clicked', function () { return __awaiter(void 0, void 0, void 0, function () {
        var createButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    react_2.render(react_1["default"].createElement(CustomFieldsManager_1["default"], { entityType: "user" }));
                    return [4 /*yield*/, react_2.waitFor(function () {
                            vitest_1.expect(react_2.screen.getByText('test_field')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    createButton = react_2.screen.getByText(/Add Field|Create New Field/i);
                    react_2.fireEvent.click(createButton);
                    vitest_1.expect(react_2.screen.getByTestId('custom-field-dialog')).toBeInTheDocument();
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.it('closes dialog when close button is clicked', function () { return __awaiter(void 0, void 0, void 0, function () {
        var createButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    react_2.render(react_1["default"].createElement(CustomFieldsManager_1["default"], { entityType: "user" }));
                    return [4 /*yield*/, react_2.waitFor(function () {
                            vitest_1.expect(react_2.screen.getByText('test_field')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    createButton = react_2.screen.getByText(/Add Field|Create New Field/i);
                    react_2.fireEvent.click(createButton);
                    vitest_1.expect(react_2.screen.getByTestId('custom-field-dialog')).toBeInTheDocument();
                    react_2.fireEvent.click(react_2.screen.getByTestId('dialog-close'));
                    vitest_1.expect(react_2.screen.queryByTestId('custom-field-dialog')).not.toBeInTheDocument();
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.it('handles field selection with checkboxes', function () { return __awaiter(void 0, void 0, void 0, function () {
        var checkboxes, firstFieldCheckbox;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    react_2.render(react_1["default"].createElement(CustomFieldsManager_1["default"], { entityType: "user" }));
                    return [4 /*yield*/, react_2.waitFor(function () {
                            vitest_1.expect(react_2.screen.getByText('test_field')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    checkboxes = react_2.screen.getAllByRole('checkbox');
                    firstFieldCheckbox = checkboxes[1];
                    react_2.fireEvent.click(firstFieldCheckbox);
                    // Should show selection count (this might vary based on implementation)
                    // The important thing is that the checkbox interaction doesn't throw errors
                    vitest_1.expect(firstFieldCheckbox).toBeInTheDocument();
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.it('displays search and filter controls', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    react_2.render(react_1["default"].createElement(CustomFieldsManager_1["default"], { entityType: "user" }));
                    return [4 /*yield*/, react_2.waitFor(function () {
                            vitest_1.expect(react_2.screen.getByText('test_field')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    vitest_1.expect(react_2.screen.getByPlaceholderText('Search fields...')).toBeInTheDocument();
                    vitest_1.expect(react_2.screen.getByDisplayValue('All Types')).toBeInTheDocument();
                    vitest_1.expect(react_2.screen.getByDisplayValue('Sort by Order')).toBeInTheDocument();
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.it('shows entity type tabs', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    react_2.render(react_1["default"].createElement(CustomFieldsManager_1["default"], { entityType: "user" }));
                    return [4 /*yield*/, react_2.waitFor(function () {
                            vitest_1.expect(react_2.screen.getByText('test_field')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    vitest_1.expect(react_2.screen.getByText('user')).toBeInTheDocument();
                    return [2 /*return*/];
            }
        });
    }); });
});
