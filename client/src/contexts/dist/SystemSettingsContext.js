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
exports.useSystemSettingsStore = exports.useSystemSettings = exports.SystemSettingsProvider = void 0;
var react_1 = require("react");
var customizationBroadcast_1 = require("@/hooks/customizationBroadcast");
var SystemSettingsContext = react_1.createContext(undefined);
function SystemSettingsProvider(_a) {
    var children = _a.children;
    var _b = react_1.useState(function () {
        try {
            var stored = localStorage.getItem('kiini_system_settings');
            return stored ? JSON.parse(stored) : {};
        }
        catch (_a) {
            return {};
        }
    }), settings = _b[0], setSettings = _b[1];
    var updateSettings = function (config) {
        setSettings(function (prev) { return (__assign(__assign({}, prev), config)); });
    };
    var applySettingsToDOM = function () {
        var root = document.documentElement;
        if (settings.maintenanceMode) {
            root.setAttribute('data-maintenance-mode', 'true');
        }
        else {
            root.removeAttribute('data-maintenance-mode');
        }
        if (settings.timezone) {
            root.setAttribute('data-timezone', settings.timezone);
        }
        if (settings.defaultLanguage) {
            root.setAttribute('lang', settings.defaultLanguage);
        }
    };
    // Persist to localStorage when settings change
    react_1.useEffect(function () {
        if (Object.keys(settings).length > 0) {
            localStorage.setItem('kiini_system_settings', JSON.stringify(settings));
            applySettingsToDOM();
            customizationBroadcast_1.broadcastSystemUpdate(settings);
        }
    }, [settings]);
    return (react_1["default"].createElement(SystemSettingsContext.Provider, { value: { settings: settings, updateSettings: updateSettings, applySettingsToDOM: applySettingsToDOM } }, children));
}
exports.SystemSettingsProvider = SystemSettingsProvider;
function useSystemSettings() {
    var context = react_1.useContext(SystemSettingsContext);
    if (!context) {
        throw new Error('useSystemSettings must be used within SystemSettingsProvider');
    }
    return context;
}
exports.useSystemSettings = useSystemSettings;
// For store-like interface compatibility
exports.useSystemSettingsStore = useSystemSettings;
