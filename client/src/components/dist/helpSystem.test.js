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
var helpSystem_1 = require("./helpSystem");
vitest_1.describe('Help System', function () {
    vitest_1.describe('HelpPanel Component', function () {
        vitest_1.it('renders closed panel correctly', function () {
            react_1.render(React.createElement(helpSystem_1.HelpPanel, { isOpen: false, onClose: function () { } }));
            var dialog = react_1.screen.getByRole('dialog', { name: /help and documentation/i });
            vitest_1.expect(dialog).toHaveClass('help-panel');
            vitest_1.expect(dialog).not.toHaveClass('open');
        });
        vitest_1.it('renders open panel with correct structure', function () {
            react_1.render(React.createElement(helpSystem_1.HelpPanel, { isOpen: true, onClose: function () { } }));
            var dialog = react_1.screen.getByRole('dialog', { name: /help and documentation/i });
            vitest_1.expect(dialog).toBeInTheDocument();
            vitest_1.expect(react_1.screen.getByText('Help & Documentation')).toBeInTheDocument();
        });
        vitest_1.it('shows all help topics initially', function () {
            react_1.render(React.createElement(helpSystem_1.HelpPanel, { isOpen: true, onClose: function () { } }));
            var topics = Object.values(helpSystem_1.HELP_LIBRARY);
            topics.forEach(function (topic) {
                vitest_1.expect(react_1.screen.getByText(topic.title)).toBeInTheDocument();
                vitest_1.expect(react_1.screen.getByText(topic.shortDescription)).toBeInTheDocument();
            });
        });
        vitest_1.it('filters topics based on search query', function () {
            react_1.render(React.createElement(helpSystem_1.HelpPanel, { isOpen: true, onClose: function () { } }));
            var searchInput = react_1.screen.getByPlaceholderText('Search help topics...');
            react_1.fireEvent.change(searchInput, { target: { value: 'getting started' } });
            vitest_1.expect(react_1.screen.getByText('Getting Started')).toBeInTheDocument();
            vitest_1.expect(react_1.screen.queryByText('Field Types Reference')).not.toBeInTheDocument();
        });
        vitest_1.it('shows no results message when search yields no matches', function () {
            react_1.render(React.createElement(helpSystem_1.HelpPanel, { isOpen: true, onClose: function () { } }));
            var searchInput = react_1.screen.getByPlaceholderText('Search help topics...');
            react_1.fireEvent.change(searchInput, { target: { value: 'nonexistent topic' } });
            vitest_1.expect(react_1.screen.getByText('No topics found for "nonexistent topic"')).toBeInTheDocument();
        });
        vitest_1.it('clears search when clear button is clicked', function () {
            react_1.render(React.createElement(helpSystem_1.HelpPanel, { isOpen: true, onClose: function () { } }));
            var searchInput = react_1.screen.getByPlaceholderText('Search help topics...');
            react_1.fireEvent.change(searchInput, { target: { value: 'test' } });
            vitest_1.expect(searchInput).toHaveValue('test');
            var clearButton = react_1.screen.getByLabelText('Clear search');
            react_1.fireEvent.click(clearButton);
            vitest_1.expect(searchInput).toHaveValue('');
        });
        vitest_1.it('opens topic when topic card is clicked', function () {
            react_1.render(React.createElement(helpSystem_1.HelpPanel, { isOpen: true, onClose: function () { } }));
            var gettingStartedCard = react_1.screen.getByText('Getting Started').closest('button');
            react_1.fireEvent.click(gettingStartedCard);
            vitest_1.expect(react_1.screen.getByText('What are Custom Fields?')).toBeInTheDocument();
            vitest_1.expect(react_1.screen.getByText('← Back')).toBeInTheDocument();
        });
        vitest_1.it('returns to topic list when back button is clicked', function () {
            react_1.render(React.createElement(helpSystem_1.HelpPanel, { isOpen: true, onClose: function () { } }));
            var gettingStartedCard = react_1.screen.getByText('Getting Started').closest('button');
            react_1.fireEvent.click(gettingStartedCard);
            var backButton = react_1.screen.getByText('← Back');
            react_1.fireEvent.click(backButton);
            vitest_1.expect(react_1.screen.getByText('Getting Started')).toBeInTheDocument();
            vitest_1.expect(react_1.screen.queryByText('What are Custom Fields?')).not.toBeInTheDocument();
        });
        vitest_1.it('shows related topics for current topic', function () {
            react_1.render(React.createElement(helpSystem_1.HelpPanel, { isOpen: true, onClose: function () { } }));
            var gettingStartedCard = react_1.screen.getByText('Getting Started').closest('button');
            react_1.fireEvent.click(gettingStartedCard);
            vitest_1.expect(react_1.screen.getByText('Related Topics')).toBeInTheDocument();
            vitest_1.expect(react_1.screen.getByText('Field Types Reference')).toBeInTheDocument();
        });
        vitest_1.it('navigates to related topic when clicked', function () {
            react_1.render(React.createElement(helpSystem_1.HelpPanel, { isOpen: true, onClose: function () { } }));
            var gettingStartedCard = react_1.screen.getByText('Getting Started').closest('button');
            react_1.fireEvent.click(gettingStartedCard);
            var fieldTypesLink = react_1.screen.getByText('Field Types Reference');
            react_1.fireEvent.click(fieldTypesLink);
            vitest_1.expect(react_1.screen.getByText('Available Field Types')).toBeInTheDocument();
        });
        vitest_1.it('calls onClose when close button is clicked', function () {
            var mockOnClose = vitest_1.vi.fn();
            react_1.render(React.createElement(helpSystem_1.HelpPanel, { isOpen: true, onClose: mockOnClose }));
            var closeButton = react_1.screen.getByLabelText('Close help panel');
            react_1.fireEvent.click(closeButton);
            vitest_1.expect(mockOnClose).toHaveBeenCalled();
        });
        vitest_1.it('calls onClose when overlay is clicked', function () {
            var mockOnClose = vitest_1.vi.fn();
            react_1.render(React.createElement(helpSystem_1.HelpPanel, { isOpen: true, onClose: mockOnClose }));
            var overlay = document.querySelector('.help-panel-overlay');
            react_1.fireEvent.click(overlay);
            vitest_1.expect(mockOnClose).toHaveBeenCalled();
        });
        vitest_1.it('shows keyboard shortcut hint in footer', function () {
            var _a;
            react_1.render(React.createElement(helpSystem_1.HelpPanel, { isOpen: true, onClose: function () { } }));
            var footer = document.querySelector('.help-panel-footer');
            vitest_1.expect(footer).toBeInTheDocument();
            vitest_1.expect((_a = footer === null || footer === void 0 ? void 0 : footer.textContent) === null || _a === void 0 ? void 0 : _a.trim()).toBe('Press Shift + ? to toggle help');
        });
    });
    vitest_1.describe('Tooltip Component', function () {
        vitest_1.it('renders children correctly', function () {
            react_1.render(React.createElement(helpSystem_1.Tooltip, { content: "Help text" },
                React.createElement("button", null, "Hover me")));
            vitest_1.expect(react_1.screen.getByText('Hover me')).toBeInTheDocument();
        });
        vitest_1.it('shows tooltip on mouse enter after delay', function () { return __awaiter(void 0, void 0, void 0, function () {
            var button;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(helpSystem_1.Tooltip, { content: "Help text", delay: 100 },
                            React.createElement("button", null, "Hover me")));
                        button = react_1.screen.getByText('Hover me');
                        react_1.fireEvent.mouseEnter(button);
                        return [4 /*yield*/, react_1.waitFor(function () {
                                vitest_1.expect(react_1.screen.getByRole('tooltip')).toBeInTheDocument();
                                vitest_1.expect(react_1.screen.getByText('Help text')).toBeInTheDocument();
                            }, { timeout: 200 })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('hides tooltip on mouse leave', function () { return __awaiter(void 0, void 0, void 0, function () {
            var button;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(helpSystem_1.Tooltip, { content: "Help text", delay: 50 },
                            React.createElement("button", null, "Hover me")));
                        button = react_1.screen.getByText('Hover me');
                        react_1.fireEvent.mouseEnter(button);
                        return [4 /*yield*/, react_1.waitFor(function () {
                                vitest_1.expect(react_1.screen.getByRole('tooltip')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        react_1.fireEvent.mouseLeave(button);
                        return [4 /*yield*/, react_1.waitFor(function () {
                                vitest_1.expect(react_1.screen.queryByRole('tooltip')).not.toBeInTheDocument();
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('applies correct position class', function () { return __awaiter(void 0, void 0, void 0, function () {
            var button;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(helpSystem_1.Tooltip, { content: "Help text", position: "bottom", delay: 50 },
                            React.createElement("button", null, "Hover me")));
                        button = react_1.screen.getByText('Hover me');
                        react_1.fireEvent.mouseEnter(button);
                        return [4 /*yield*/, react_1.waitFor(function () {
                                var tooltip = react_1.screen.getByRole('tooltip');
                                vitest_1.expect(tooltip).toHaveClass('tooltip-bottom');
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('cleans up timeout on unmount', function () {
            var unmount = react_1.render(React.createElement(helpSystem_1.Tooltip, { content: "Help text" },
                React.createElement("button", null, "Hover me"))).unmount;
            // Should not throw any errors
            vitest_1.expect(function () { return unmount(); }).not.toThrow();
        });
    });
    vitest_1.describe('HelpIcon Component', function () {
        vitest_1.it('renders help icon button', function () {
            react_1.render(React.createElement(helpSystem_1.HelpIcon, null));
            var button = react_1.screen.getByRole('button', { name: /help/i });
            vitest_1.expect(button).toBeInTheDocument();
        });
        vitest_1.it('shows default tooltip content', function () { return __awaiter(void 0, void 0, void 0, function () {
            var button;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(helpSystem_1.HelpIcon, null));
                        button = react_1.screen.getByRole('button', { name: /help/i });
                        react_1.fireEvent.mouseEnter(button);
                        return [4 /*yield*/, react_1.waitFor(function () {
                                vitest_1.expect(react_1.screen.getByText('Click for more information')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('shows custom tooltip content', function () { return __awaiter(void 0, void 0, void 0, function () {
            var button;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_1.render(React.createElement(helpSystem_1.HelpIcon, { content: "Custom help text" }));
                        button = react_1.screen.getByRole('button', { name: /help/i });
                        react_1.fireEvent.mouseEnter(button);
                        return [4 /*yield*/, react_1.waitFor(function () {
                                vitest_1.expect(react_1.screen.getByText('Custom help text')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('calls onHelpClick when provided', function () {
            var mockOnClick = vitest_1.vi.fn();
            react_1.render(React.createElement(helpSystem_1.HelpIcon, { onHelpClick: mockOnClick }));
            var button = react_1.screen.getByRole('button');
            react_1.fireEvent.click(button);
            vitest_1.expect(mockOnClick).toHaveBeenCalled();
        });
        vitest_1.it('has proper accessibility attributes', function () {
            react_1.render(React.createElement(helpSystem_1.HelpIcon, null));
            var button = react_1.screen.getByRole('button', { name: /help/i });
            vitest_1.expect(button).toHaveAttribute('aria-label', 'Help');
            vitest_1.expect(button).toHaveAttribute('title', 'Click for help');
        });
    });
    vitest_1.describe('HELP_LIBRARY', function () {
        vitest_1.it('contains all expected topics', function () {
            var expectedTopics = ['getting-started', 'field-types', 'validation', 'management', 'troubleshooting'];
            expectedTopics.forEach(function (topicId) {
                vitest_1.expect(helpSystem_1.HELP_LIBRARY[topicId]).toBeDefined();
                vitest_1.expect(helpSystem_1.HELP_LIBRARY[topicId].id).toBe(topicId);
            });
        });
        vitest_1.it('has valid topic structure', function () {
            Object.values(helpSystem_1.HELP_LIBRARY).forEach(function (topic) {
                vitest_1.expect(topic).toHaveProperty('id');
                vitest_1.expect(topic).toHaveProperty('title');
                vitest_1.expect(topic).toHaveProperty('shortDescription');
                vitest_1.expect(topic).toHaveProperty('category');
                vitest_1.expect(topic).toHaveProperty('fullContent');
                vitest_1.expect(['getting-started', 'field-types', 'validation', 'management', 'troubleshooting']).toContain(topic.category);
            });
        });
        vitest_1.it('has related topics that exist', function () {
            Object.values(helpSystem_1.HELP_LIBRARY).forEach(function (topic) {
                if (topic.relatedTopics) {
                    topic.relatedTopics.forEach(function (relatedId) {
                        vitest_1.expect(helpSystem_1.HELP_LIBRARY[relatedId]).toBeDefined();
                    });
                }
            });
        });
    });
});
