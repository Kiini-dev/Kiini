"use strict";
/**
 * Cross-Tab Communication Hook
 * Listens for customization changes from other tabs via BroadcastChannel
 * Automatically applies changes to local state and DOM
 */
exports.__esModule = true;
exports.useCustomizationListener = void 0;
var react_1 = require("react");
var BrandContext_1 = require("@/contexts/BrandContext");
var ThemeCustomizationContext_1 = require("@/contexts/ThemeCustomizationContext");
var HomepageBuilderContext_1 = require("@/contexts/HomepageBuilderContext");
var SystemSettingsContext_1 = require("@/contexts/SystemSettingsContext");
/**
 * Get BroadcastChannel instance for customization updates
 * Gracefully handles environments where BroadcastChannel is not available
 */
var getBroadcastChannel = function () {
    if (typeof window === "undefined")
        return null;
    try {
        return new BroadcastChannel("kiini_customization");
    }
    catch (e) {
        return null;
    }
};
/**
 * Hook to listen for customization changes from other tabs
 * Automatically updates local state when changes are broadcast
 */
exports.useCustomizationListener = function () {
    var _a = BrandContext_1.useBrand(), updateBrandConfig = _a.updateBrandConfig, updateCompanyBrand = _a.updateCompanyBrand, applyBrandToDOM = _a.applyBrandToDOM;
    var _b = ThemeCustomizationContext_1.useThemeCustomization(), updateThemeConfig = _b.updateThemeConfig, applyThemeToDOM = _b.applyThemeToDOM;
    var reorderWidgets = HomepageBuilderContext_1.useHomepageBuilder().reorderWidgets;
    var _c = SystemSettingsContext_1.useSystemSettings(), updateSettings = _c.updateSettings, applySettingsToDOM = _c.applySettingsToDOM;
    react_1.useEffect(function () {
        var channel = getBroadcastChannel();
        if (!channel)
            return;
        var handleMessage = function (event) {
            var _a = event.data, type = _a.type, payload = _a.payload;
            switch (type) {
                case "brand":
                    if (payload.brandConfig)
                        updateBrandConfig(payload.brandConfig);
                    if (payload.companyBrand)
                        updateCompanyBrand(payload.companyBrand);
                    applyBrandToDOM();
                    break;
                case "theme":
                    if (payload.config)
                        updateThemeConfig(payload.config);
                    applyThemeToDOM();
                    break;
                case "homepage":
                    if (payload.widgetOrder)
                        reorderWidgets(payload.widgetOrder);
                    break;
                case "system":
                    if (payload.settings)
                        updateSettings(payload.settings);
                    applySettingsToDOM();
                    break;
                default:
                    break;
            }
        };
        channel.addEventListener("message", handleMessage);
        return function () {
            channel.removeEventListener("message", handleMessage);
            channel.close();
        };
    }, [updateBrandConfig, updateCompanyBrand, applyBrandToDOM, updateThemeConfig, applyThemeToDOM, reorderWidgets, updateSettings, applySettingsToDOM]);
};
