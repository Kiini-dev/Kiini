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
// Mock all dependencies first
vitest_1.vi.mock('@/types/customFields', function () { return ({
    ENTITY_TYPES: ['user'],
    FIELD_TYPES: ['text'],
    FIELD_TYPE_LABELS: { text: 'Text' }
}); });
vitest_1.vi.mock('@/services/customFieldsService', function () { return ({
    "default": {
        getFields: vitest_1.vi.fn().mockResolvedValue([])
    }
}); });
vitest_1.vi.mock('./CustomFieldRenderer', function () { return ({
    "default": function () { return React.createElement("div", null, "Field Renderer"); }
}); });
vitest_1.vi.mock('./CustomFieldDialog', function () { return ({
    "default": function () { return null; }
}); });
vitest_1.vi.mock('./iconSystem', function () { return ({
    IconButton: function (_a) {
        var children = _a.children;
        return React.createElement("button", null, children || 'Icon');
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
// Now import the component
var CustomFieldsManager_1 = require("./CustomFieldsManager");
vitest_1.describe('CustomFieldsManager Integration', function () {
    vitest_1.it('renders without crashing', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    react_1.render(React.createElement(CustomFieldsManager_1.CustomFieldsManager, null));
                    return [4 /*yield*/, react_1.waitFor(function () {
                            vitest_1.expect(react_1.screen.getByText('Custom Fields Manager')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.it('shows loading state initially', function () {
        react_1.render(React.createElement(CustomFieldsManager_1.CustomFieldsManager, null));
        vitest_1.expect(react_1.screen.getByText('Loading fields...')).toBeInTheDocument();
    });
    vitest_1.it('integrates icon system', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    react_1.render(React.createElement(CustomFieldsManager_1.CustomFieldsManager, null));
                    return [4 /*yield*/, react_1.waitFor(function () {
                            // Should have some icon buttons rendered
                            var buttons = react_1.screen.getAllByRole('button');
                            vitest_1.expect(buttons.length).toBeGreaterThan(0);
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.it('integrates help system', function () { return __awaiter(void 0, void 0, void 0, function () {
        var buttons;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    react_1.render(React.createElement(CustomFieldsManager_1.CustomFieldsManager, null));
                    return [4 /*yield*/, react_1.waitFor(function () {
                            vitest_1.expect(react_1.screen.getByText('Custom Fields Manager')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    buttons = react_1.screen.getAllByRole('button');
                    vitest_1.expect(buttons.length).toBeGreaterThan(1);
                    return [2 /*return*/];
            }
        });
    }); });
});
