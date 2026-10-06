"use strict";
exports.__esModule = true;
exports.useTheme = exports.ThemeProvider = void 0;
var react_1 = require("react");
var ThemeContext = react_1.createContext(undefined);
var STORAGE_KEY = "theme";
function getStoredTheme() {
    try {
        var stored = localStorage.getItem(STORAGE_KEY);
        if (stored === "light" || stored === "dark")
            return stored;
        // Migrate old key if present
        var legacy = localStorage.getItem("theme-mode");
        if (legacy === "light" || legacy === "dark") {
            localStorage.setItem(STORAGE_KEY, legacy);
            localStorage.removeItem("theme-mode");
            return legacy;
        }
    }
    catch (_a) {
        // SSR / private browsing
    }
    return null;
}
function getSystemTheme() {
    if (typeof window !== "undefined" && window.matchMedia) {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
}
function applyThemeClass(theme) {
    var root = document.documentElement;
    if (theme === "dark") {
        root.classList.add("dark");
        root.classList.remove("light");
    }
    else {
        root.classList.remove("dark");
        root.classList.add("light");
    }
    root.style.colorScheme = theme;
}
function ThemeProvider(_a) {
    var children = _a.children, _b = _a.defaultTheme, defaultTheme = _b === void 0 ? "light" : _b, _c = _a.switchable, switchable = _c === void 0 ? true : _c;
    var _d = react_1.useState(function () {
        var stored = getStoredTheme();
        if (stored)
            return stored;
        return getSystemTheme() || defaultTheme;
    }), theme = _d[0], setThemeState = _d[1];
    // Apply class + persist on every change
    react_1.useEffect(function () {
        applyThemeClass(theme);
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        }
        catch (_a) {
            // quota exceeded
        }
    }, [theme]);
    // Listen for changes from other tabs via storage event
    react_1.useEffect(function () {
        var handleStorage = function (e) {
            if (e.key === STORAGE_KEY && (e.newValue === "light" || e.newValue === "dark")) {
                setThemeState(e.newValue);
            }
        };
        window.addEventListener("storage", handleStorage);
        return function () { return window.removeEventListener("storage", handleStorage); };
    }, []);
    // Listen for system preference changes (only if no explicit user preference)
    react_1.useEffect(function () {
        if (typeof window !== "undefined" && window.matchMedia) {
            var mediaQuery_1 = window.matchMedia("(prefers-color-scheme: dark)");
            var handleChange_1 = function (e) {
                var userPreference = localStorage.getItem(STORAGE_KEY);
                if (!userPreference) {
                    setThemeState(e.matches ? "dark" : "light");
                }
            };
            mediaQuery_1.addEventListener("change", handleChange_1);
            return function () { return mediaQuery_1.removeEventListener("change", handleChange_1); };
        }
    }, []);
    var toggleTheme = react_1.useCallback(function () {
        setThemeState(function (prev) { return (prev === "light" ? "dark" : "light"); });
    }, []);
    var setTheme = react_1.useCallback(function (newTheme) {
        setThemeState(newTheme);
    }, []);
    return (react_1["default"].createElement(ThemeContext.Provider, { value: { theme: theme, toggleTheme: toggleTheme, setTheme: setTheme, switchable: switchable } }, children));
}
exports.ThemeProvider = ThemeProvider;
function useTheme() {
    var context = react_1.useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return context;
}
exports.useTheme = useTheme;
