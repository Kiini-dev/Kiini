"use strict";
exports.__esModule = true;
exports.useApplyCustomization = void 0;
var react_1 = require("react");
var SystemSettingsContext_1 = require("@/contexts/SystemSettingsContext");
/**
 * Hook that applies system-level settings to the DOM.
 * CSS variable application (brand colors, theme colors) is handled exclusively
 * by BrandContext and ThemeCustomizationContext to avoid triple-write conflicts.
 * This hook only manages non-CSS concerns: maintenance mode, timezone, language.
 */
function useApplyCustomization() {
    var settings = SystemSettingsContext_1.useSystemSettings().settings;
    // Apply system settings — never hide body; maintenance gating is in DashboardLayout
    react_1.useEffect(function () {
        var root = document.documentElement;
        // Always ensure body is visible (guard against stale state from old code)
        document.body.style.display = '';
        if (settings === null || settings === void 0 ? void 0 : settings.maintenanceMode) {
            root.setAttribute('data-maintenance-mode', 'true');
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('maintenanceModeChanged', {
                    detail: { enabled: true, message: settings.maintenanceMessage }
                }));
            }
        }
        else {
            root.removeAttribute('data-maintenance-mode');
        }
        if (settings === null || settings === void 0 ? void 0 : settings.timezone)
            root.setAttribute('data-timezone', settings.timezone);
        if (settings === null || settings === void 0 ? void 0 : settings.defaultLanguage)
            root.setAttribute('lang', settings.defaultLanguage);
    }, [settings]);
}
exports.useApplyCustomization = useApplyCustomization;
