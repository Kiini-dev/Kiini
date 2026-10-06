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
exports.__esModule = true;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
function AccessibilityWidget() {
    var _a = react_1.useState(false), isOpen = _a[0], setIsOpen = _a[1];
    var _b = react_1.useState(function () {
        if (typeof window === "undefined") {
            return {
                highContrast: false,
                fontSize: "normal",
                reducedMotion: false,
                screenReaderMode: false,
                darkMode: false,
                textSpacing: false
            };
        }
        var stored = localStorage.getItem("accessibilitySettings");
        return stored
            ? JSON.parse(stored)
            : {
                highContrast: false,
                fontSize: "normal",
                reducedMotion: false,
                screenReaderMode: false,
                darkMode: false,
                textSpacing: false
            };
    }), settings = _b[0], setSettings = _b[1];
    var containerRef = react_1.useRef(null);
    // Apply accessibility settings to document
    react_1.useEffect(function () {
        localStorage.setItem("accessibilitySettings", JSON.stringify(settings));
        var html = document.documentElement;
        var body = document.body;
        // Apply high contrast
        if (settings.highContrast) {
            html.classList.add("high-contrast");
            body.style.filter = "contrast(1.2)";
        }
        else {
            html.classList.remove("high-contrast");
            body.style.filter = "";
        }
        // Apply font size
        var sizeMap = {
            normal: "16px",
            large: "18px",
            larger: "20px"
        };
        body.style.fontSize = sizeMap[settings.fontSize];
        // Apply reduced motion
        if (settings.reducedMotion) {
            html.classList.add("reduce-motion");
            html.style.setProperty("--animation-duration", "0s");
        }
        else {
            html.classList.remove("reduce-motion");
            html.style.setProperty("--animation-duration", "0.3s");
        }
        // Apply dark mode
        if (settings.darkMode) {
            html.classList.add("dark");
        }
        else {
            html.classList.remove("dark");
        }
        // Apply text spacing
        if (settings.textSpacing) {
            body.style.lineHeight = "1.8";
            body.style.letterSpacing = "0.15em";
        }
        else {
            body.style.lineHeight = "";
            body.style.letterSpacing = "";
        }
        // Screen reader mode
        if (settings.screenReaderMode) {
            html.setAttribute("aria-label", "Screen reader mode enabled");
        }
    }, [settings]);
    // Close when clicking outside
    react_1.useEffect(function () {
        function handleClickOutside(event) {
            if (containerRef.current &&
                !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return function () {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }
    }, [isOpen]);
    var toggleSetting = function (key) {
        if (key === "fontSize" || key === "fontSize") {
            // Handle font size cycle
            var sizes_1 = ["normal", "large", "larger"];
            var currentIndex = sizes_1.indexOf(settings[key]);
            var nextIndex_1 = (currentIndex + 1) % sizes_1.length;
            setSettings(function (prev) {
                var _a;
                return (__assign(__assign({}, prev), (_a = {}, _a[key] = sizes_1[nextIndex_1], _a)));
            });
        }
        else {
            setSettings(function (prev) {
                var _a;
                return (__assign(__assign({}, prev), (_a = {}, _a[key] = !prev[key], _a)));
            });
        }
    };
    var resetSettings = function () {
        setSettings({
            highContrast: false,
            fontSize: "normal",
            reducedMotion: false,
            screenReaderMode: false,
            darkMode: false,
            textSpacing: false
        });
    };
    return (React.createElement("div", { ref: containerRef, className: "fixed right-4 top-1/2 -translate-y-1/2 z-40" },
        React.createElement("div", { className: utils_1.cn("transition-all duration-300", isOpen ? "opacity-0 pointer-events-none" : "opacity-100") },
            React.createElement(button_1.Button, { variant: "outline", size: "icon", onClick: function () { return setIsOpen(true); }, className: utils_1.cn("rounded-full h-12 w-12", "border-gray-300 hover:border-gray-400", "shadow-lg hover:shadow-xl", "transition-all duration-200", "bg-white hover:bg-gray-50", "dark:bg-gray-800 dark:hover:bg-gray-700", "dark:border-gray-600"), title: "Open accessibility options", "aria-label": "Accessibility Menu" },
                React.createElement(lucide_react_1.Accessibility, { className: "h-5 w-5" }))),
        isOpen && (React.createElement("div", { className: utils_1.cn("absolute right-0 top-1/2 -translate-y-1/2", "bg-white dark:bg-gray-800", "rounded-lg shadow-2xl", "border border-gray-200 dark:border-gray-700", "p-4 w-64", "space-y-4", "animate-in fade-in zoom-in-95", "duration-200") },
            React.createElement("div", { className: "flex justify-between items-center mb-2" },
                React.createElement("h3", { className: "font-semibold text-sm text-gray-900 dark:text-white" }, "Accessibility"),
                React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { return setIsOpen(false); }, className: "h-6 w-6", title: "Close accessibility menu" },
                    React.createElement(lucide_react_1.X, { className: "h-4 w-4" }))),
            React.createElement("div", { className: "h-px bg-gray-200 dark:bg-gray-700" }),
            React.createElement("div", { className: "space-y-3" },
                React.createElement(AccessibilityOption, { icon: React.createElement(lucide_react_1.Contrast, { className: "h-4 w-4" }), label: "High Contrast", value: settings.highContrast, onChange: function () { return toggleSetting("highContrast"); } }),
                React.createElement(AccessibilityOption, { icon: React.createElement(lucide_react_1.Type, { className: "h-4 w-4" }), label: "Font Size: " + (settings.fontSize.charAt(0).toUpperCase() + settings.fontSize.slice(1)), value: true, onChange: function () { return toggleSetting("fontSize"); }, isCycle: true }),
                React.createElement(AccessibilityOption, { icon: React.createElement(lucide_react_1.Zap, { className: "h-4 w-4" }), label: "Reduce Motion", value: settings.reducedMotion, onChange: function () { return toggleSetting("reducedMotion"); } }),
                React.createElement(AccessibilityOption, { icon: React.createElement(lucide_react_1.Volume2, { className: "h-4 w-4" }), label: "Screen Reader Mode", value: settings.screenReaderMode, onChange: function () { return toggleSetting("screenReaderMode"); } }),
                React.createElement(AccessibilityOption, { icon: React.createElement(lucide_react_1.Moon, { className: "h-4 w-4" }), label: "Dark Mode", value: settings.darkMode, onChange: function () { return toggleSetting("darkMode"); } }),
                React.createElement(AccessibilityOption, { icon: React.createElement(lucide_react_1.Maximize2, { className: "h-4 w-4" }), label: "Increase Text Spacing", value: settings.textSpacing, onChange: function () { return toggleSetting("textSpacing"); } })),
            React.createElement("div", { className: "h-px bg-gray-200 dark:bg-gray-700" }),
            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: resetSettings, className: "w-full text-xs" }, "Reset to Defaults"),
            React.createElement("p", { className: "text-xs text-gray-500 dark:text-gray-400" }, "These settings are saved locally and applied across the entire app.")))));
}
exports["default"] = AccessibilityWidget;
function AccessibilityOption(_a) {
    var icon = _a.icon, label = _a.label, value = _a.value, onChange = _a.onChange, isCycle = _a.isCycle;
    return (React.createElement("button", { onClick: onChange, className: utils_1.cn("flex items-center justify-between w-full", "px-3 py-2 rounded-md", "text-sm text-left", "transition-colors duration-200", value
            ? "bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300", "hover:bg-gray-200 dark:hover:bg-gray-600"), title: "Toggle " + label },
        React.createElement("div", { className: "flex items-center gap-2" },
            React.createElement("span", { className: utils_1.cn("flex-shrink-0", value && "text-blue-600 dark:text-blue-400") }, icon),
            React.createElement("span", { className: "font-medium" }, label)),
        !isCycle && (React.createElement("span", { className: utils_1.cn("h-4 w-4 rounded border transition-colors", value
                ? "bg-blue-600 border-blue-600"
                : "border-gray-300 dark:border-gray-500") }, value && React.createElement("span", { className: "text-white text-xs flex items-center justify-center h-full" }, "\u2713")))));
}
