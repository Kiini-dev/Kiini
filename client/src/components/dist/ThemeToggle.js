"use strict";
/**
 * Theme Toggle Component
 * Provides UI to switch between light and dark themes with persistence
 */
exports.__esModule = true;
exports.useThemeToggle = exports.ThemeToggle = void 0;
var react_1 = require("react");
var ThemeContext_1 = require("@/contexts/ThemeContext");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
/**
 * ThemeToggle - Button to switch between light and dark themes
 * - Automatically persists theme choice to localStorage
 * - Updates document root class and colorScheme
 * - Shows appropriate icon based on current theme
 */
function ThemeToggle(_a) {
    var _b = _a.className, className = _b === void 0 ? "" : _b, _c = _a.showLabel, showLabel = _c === void 0 ? false : _c, _d = _a.variant, variant = _d === void 0 ? "ghost" : _d, _e = _a.size, size = _e === void 0 ? "icon" : _e;
    var _f = ThemeContext_1.useTheme(), theme = _f.theme, toggleTheme = _f.toggleTheme, switchable = _f.switchable;
    var _g = react_1.useState(false), isMounted = _g[0], setIsMounted = _g[1];
    // Prevent hydration mismatch by only rendering after mount
    react_1.useEffect(function () {
        setIsMounted(true);
    }, []);
    if (!isMounted || !switchable) {
        return null;
    }
    return (react_1["default"].createElement(button_1.Button, { variant: variant, size: size, onClick: toggleTheme, className: className, title: "Switch to " + (theme === "light" ? "dark" : "light") + " mode", "aria-label": "Switch to " + (theme === "light" ? "dark" : "light") + " mode" }, theme === "light" ? (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement(lucide_react_1.Moon, { className: "h-5 w-5" }),
        showLabel && react_1["default"].createElement("span", { className: "ml-2" }, "Dark Mode"))) : (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement(lucide_react_1.Sun, { className: "h-5 w-5" }),
        showLabel && react_1["default"].createElement("span", { className: "ml-2" }, "Light Mode")))));
}
exports.ThemeToggle = ThemeToggle;
/**
 * ThemeProvider with auto-detection and persistence
 * Handles:
 * - localStorage persistence
 * - System preference detection
 * - Smooth transitions
 * - Color responsiveness
 */
function useThemeToggle() {
    var _a = ThemeContext_1.useTheme(), theme = _a.theme, setTheme = _a.setTheme, switchable = _a.switchable;
    var toggleDark = function () {
        setTheme(theme === "light" ? "dark" : "light");
    };
    var setDarkMode = function () {
        setTheme("dark");
    };
    var setLightMode = function () {
        setTheme("light");
    };
    var isDark = theme === "dark";
    return {
        theme: theme,
        isDark: isDark,
        toggleDark: toggleDark,
        setDarkMode: setDarkMode,
        setLightMode: setLightMode,
        switchable: switchable
    };
}
exports.useThemeToggle = useThemeToggle;
exports["default"] = ThemeToggle;
