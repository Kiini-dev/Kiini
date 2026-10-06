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
exports.__esModule = true;
var vitest_1 = require("vitest");
var react_1 = require("@testing-library/react");
// Mock all dependencies before importing the component
vitest_1.vi.mock('@/types/customFields', function () { return ({
    FIELD_TYPES: ['text', 'email', 'number', 'select', 'textarea'],
    FIELD_TYPE_LABELS: {
        text: 'Text',
        email: 'Email',
        number: 'Number',
        select: 'Select',
        textarea: 'Textarea'
    }
}); });
vitest_1.vi.mock('@/services/customFieldsService', function () { return ({
    "default": {
        createField: vitest_1.vi.fn(),
        updateField: vitest_1.vi.fn()
    }
}); });
vitest_1.vi.mock('./iconSystem', function () { return ({
    IconButton: function (_a) {
        var icon = _a.icon, variant = _a.variant, tooltip = _a.tooltip, ariaLabel = _a["aria-label"], onClick = _a.onClick, children = _a.children;
        return (React.createElement("button", { "data-testid": "icon-button-" + icon, "data-variant": variant, title: tooltip, "aria-label": ariaLabel, onClick: onClick }, children || icon));
    }
}); });
vitest_1.vi.mock('./errorHandling', function () { return ({
    validateFieldName: vitest_1.vi.fn(function (name) {
        if (!name || name.length === 0)
            return 'Field name is required';
        if (name.length > 64)
            return 'Field name must be 64 characters or less';
        if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name))
            return 'Field name must start with a letter and contain only letters, numbers, and underscores';
        return null;
    }),
    validateFieldLabel: vitest_1.vi.fn(function (label) {
        if (!label || label.length === 0)
            return 'Field label is required';
        if (label.length > 255)
            return 'Field label must be 255 characters or less';
        return null;
    }),
    validateSelectOptions: vitest_1.vi.fn(function () { return null; }),
    categorizeError: vitest_1.vi.fn(),
    createErrorNotification: vitest_1.vi.fn()
}); });
// Mock CSS
vitest_1.vi.mock('../styles/customFieldsManager.css', function () { return ({}); });
vitest_1.vi.mock('./designTokens.css', function () { return ({}); });
vitest_1.vi.mock('./enhancedStyles.css', function () { return ({}); });
// Now import the component after all mocks are set up
var CustomFieldDialog_1 = require("./CustomFieldDialog");
vitest_1.describe('CustomFieldDialog', function () {
    var mockOnClose = vitest_1.vi.fn();
    var mockOnSave = vitest_1.vi.fn();
    var defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        onSave: mockOnSave,
        field: null
    };
    vitest_1.beforeEach(function () {
        vitest_1.vi.clearAllMocks();
    });
    vitest_1.describe('Dialog Rendering', function () {
        vitest_1.it('renders dialog when isOpen is true', function () {
            react_1.render(React.createElement(CustomFieldDialog_1.CustomFieldDialog, __assign({}, defaultProps)));
            vitest_1.expect(react_1.screen.getByText('Create Custom Field')).toBeInTheDocument();
            vitest_1.expect(react_1.screen.getByText('Save')).toBeInTheDocument();
            vitest_1.expect(react_1.screen.getByText('Cancel')).toBeInTheDocument();
        });
        vitest_1.it('does not render when isOpen is false', function () {
            react_1.render(React.createElement(CustomFieldDialog_1.CustomFieldDialog, __assign({}, defaultProps, { isOpen: false })));
            vitest_1.expect(react_1.screen.queryByText('Create Custom Field')).not.toBeInTheDocument();
        });
        vitest_1.it('renders edit mode when field is provided', function () {
            var editField = {
                id: 'field1',
                name: 'test_field',
                label: 'Test Field',
                type: 'text',
                required: true
            };
            react_1.render(React.createElement(CustomFieldDialog_1.CustomFieldDialog, __assign({}, defaultProps, { field: editField })));
            vitest_1.expect(react_1.screen.getByText('Edit Custom Field')).toBeInTheDocument();
            vitest_1.expect(react_1.screen.getByDisplayValue('test_field')).toBeInTheDocument();
            vitest_1.expect(react_1.screen.getByDisplayValue('Test Field')).toBeInTheDocument();
        });
    });
    vitest_1.describe('Form Fields', function () {
        vitest_1.it('renders all required form fields', function () {
            react_1.render(React.createElement(CustomFieldDialog_1.CustomFieldDialog, __assign({}, defaultProps)));
            vitest_1.expect(react_1.screen.getByLabelText(/field name/i)).toBeInTheDocument();
            vitest_1.expect(react_1.screen.getByLabelText(/field label/i)).toBeInTheDocument();
            vitest_1.expect(react_1.screen.getByLabelText(/field type/i)).toBeInTheDocument();
            vitest_1.expect(react_1.screen.getByLabelText(/required/i)).toBeInTheDocument();
        });
        vitest_1.it('populates field types dropdown', function () {
            react_1.render(React.createElement(CustomFieldDialog_1.CustomFieldDialog, __assign({}, defaultProps)));
            var select = react_1.screen.getByLabelText(/field type/i);
            vitest_1.expect(select).toBeInTheDocument();
            // Should have options for each field type
            vitest_1.expect(react_1.screen.getByText('Text')).toBeInTheDocument();
            vitest_1.expect(react_1.screen.getByText('Email')).toBeInTheDocument();
            vitest_1.expect(react_1.screen.getByText('Number')).toBeInTheDocument();
        });
    });
    vitest_1.describe('Real-time Validation', function () {
        vitest_1.it('shows validation feedback for field name', function () { return __awaiter(void 0, void 0, void 0, function () {
            var nameInput;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(CustomFieldDialog_1.CustomFieldDialog, __assign({}, defaultProps)));
                        nameInput = react_1.screen.getByLabelText(/field name/i);
                        // Type invalid name (starts with number)
                        react_1.fireEvent.change(nameInput, { target: { value: '123invalid' } });
                        react_1.fireEvent.blur(nameInput);
                        return [4 /*yield*/, react_1.waitFor(function () {
                                vitest_1.expect(react_1.screen.getByText('Field name must start with a letter and contain only letters, numbers, and underscores')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('shows validation feedback for field label', function () { return __awaiter(void 0, void 0, void 0, function () {
            var labelInput;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(CustomFieldDialog_1.CustomFieldDialog, __assign({}, defaultProps)));
                        labelInput = react_1.screen.getByLabelText(/field label/i);
                        // Leave empty and blur
                        react_1.fireEvent.change(labelInput, { target: { value: '' } });
                        react_1.fireEvent.blur(labelInput);
                        return [4 /*yield*/, react_1.waitFor(function () {
                                vitest_1.expect(react_1.screen.getByText('Field label is required')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('shows success icon for valid input', function () { return __awaiter(void 0, void 0, void 0, function () {
            var nameInput;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(CustomFieldDialog_1.CustomFieldDialog, __assign({}, defaultProps)));
                        nameInput = react_1.screen.getByLabelText(/field name/i);
                        // Type valid name
                        react_1.fireEvent.change(nameInput, { target: { value: 'valid_name' } });
                        react_1.fireEvent.blur(nameInput);
                        return [4 /*yield*/, react_1.waitFor(function () {
                                var successIcon = react_1.screen.getByTestId('icon-button-checkmark');
                                vitest_1.expect(successIcon).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('shows error icon for invalid input', function () { return __awaiter(void 0, void 0, void 0, function () {
            var nameInput;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(CustomFieldDialog_1.CustomFieldDialog, __assign({}, defaultProps)));
                        nameInput = react_1.screen.getByLabelText(/field name/i);
                        // Type invalid name
                        react_1.fireEvent.change(nameInput, { target: { value: 'invalid-name' } });
                        react_1.fireEvent.blur(nameInput);
                        return [4 /*yield*/, react_1.waitFor(function () {
                                var errorIcon = react_1.screen.getByTestId('icon-button-x');
                                vitest_1.expect(errorIcon).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('only validates after field has been touched', function () {
            react_1.render(React.createElement(CustomFieldDialog_1.CustomFieldDialog, __assign({}, defaultProps)));
            var nameInput = react_1.screen.getByLabelText(/field name/i);
            // Type invalid name but don't blur
            react_1.fireEvent.change(nameInput, { target: { value: '123invalid' } });
            // Should not show validation error yet
            vitest_1.expect(react_1.screen.queryByText('Field name must start with a letter')).not.toBeInTheDocument();
        });
    });
    vitest_1.describe('Form Submission', function () {
        vitest_1.it('calls onSave with valid form data', function () { return __awaiter(void 0, void 0, void 0, function () {
            var nameInput, labelInput, typeSelect, requiredCheckbox, saveButton;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(CustomFieldDialog_1.CustomFieldDialog, __assign({}, defaultProps)));
                        nameInput = react_1.screen.getByLabelText(/field name/i);
                        labelInput = react_1.screen.getByLabelText(/field label/i);
                        typeSelect = react_1.screen.getByLabelText(/field type/i);
                        requiredCheckbox = react_1.screen.getByLabelText(/required/i);
                        saveButton = react_1.screen.getByText('Save');
                        // Fill form with valid data
                        react_1.fireEvent.change(nameInput, { target: { value: 'test_field' } });
                        react_1.fireEvent.change(labelInput, { target: { value: 'Test Field' } });
                        react_1.fireEvent.change(typeSelect, { target: { value: 'text' } });
                        react_1.fireEvent.click(requiredCheckbox);
                        // Blur fields to mark as touched
                        react_1.fireEvent.blur(nameInput);
                        react_1.fireEvent.blur(labelInput);
                        // Submit form
                        react_1.fireEvent.click(saveButton);
                        return [4 /*yield*/, react_1.waitFor(function () {
                                vitest_1.expect(mockOnSave).toHaveBeenCalledWith({
                                    name: 'test_field',
                                    label: 'Test Field',
                                    type: 'text',
                                    required: true
                                });
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('prevents submission with invalid data', function () { return __awaiter(void 0, void 0, void 0, function () {
            var saveButton;
            return __generator(this, function (_a) {
                react_1.render(React.createElement(CustomFieldDialog_1.CustomFieldDialog, __assign({}, defaultProps)));
                saveButton = react_1.screen.getByText('Save');
                // Try to submit empty form
                react_1.fireEvent.click(saveButton);
                // Should not call onSave
                vitest_1.expect(mockOnSave).not.toHaveBeenCalled();
                return [2 /*return*/];
            });
        }); });
        vitest_1.it('calls onClose when cancel button is clicked', function () {
            react_1.render(React.createElement(CustomFieldDialog_1.CustomFieldDialog, __assign({}, defaultProps)));
            var cancelButton = react_1.screen.getByText('Cancel');
            react_1.fireEvent.click(cancelButton);
            vitest_1.expect(mockOnClose).toHaveBeenCalled();
        });
    });
    vitest_1.describe('Accessibility', function () {
        vitest_1.it('has proper ARIA attributes', function () {
            react_1.render(React.createElement(CustomFieldDialog_1.CustomFieldDialog, __assign({}, defaultProps)));
            var dialog = react_1.screen.getByRole('dialog');
            vitest_1.expect(dialog).toBeInTheDocument();
            vitest_1.expect(dialog).toHaveAttribute('aria-labelledby');
        });
        vitest_1.it('supports keyboard navigation', function () {
            react_1.render(React.createElement(CustomFieldDialog_1.CustomFieldDialog, __assign({}, defaultProps)));
            var nameInput = react_1.screen.getByLabelText(/field name/i);
            nameInput.focus();
            vitest_1.expect(document.activeElement).toBe(nameInput);
        });
    });
});
