"use strict";
exports.__esModule = true;
require("@testing-library/jest-dom");
var vitest_1 = require("vitest");
// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vitest_1.vi.fn().mockImplementation(function (query) { return ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vitest_1.vi.fn(),
        removeListener: vitest_1.vi.fn(),
        addEventListener: vitest_1.vi.fn(),
        removeEventListener: vitest_1.vi.fn(),
        dispatchEvent: vitest_1.vi.fn()
    }); })
});
// Mock ResizeObserver
global.ResizeObserver = vitest_1.vi.fn().mockImplementation(function () { return ({
    observe: vitest_1.vi.fn(),
    unobserve: vitest_1.vi.fn(),
    disconnect: vitest_1.vi.fn()
}); });
// Mock IntersectionObserver
global.IntersectionObserver = vitest_1.vi.fn().mockImplementation(function () { return ({
    observe: vitest_1.vi.fn(),
    unobserve: vitest_1.vi.fn(),
    disconnect: vitest_1.vi.fn()
}); });
