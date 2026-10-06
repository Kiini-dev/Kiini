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
exports.useBrandStore = void 0;
var zustand_1 = require("zustand");
var middleware_1 = require("zustand/middleware");
var customizationBroadcast_1 = require("@/hooks/customizationBroadcast");
var DEFAULT_BRAND_CONFIG = {
    primaryColor: "#3B82F6",
    secondaryColor: "#10B981",
    accentColor: "#F59E0B",
    darkPrimaryColor: "#60A5FA",
    darkSecondaryColor: "#34D399",
    darkAccentColor: "#FBBF24",
    lightGray: "#F3F4F6",
    darkGray: "#374151",
    lightText: "#FFFFFF",
    darkText: "#1F2937",
    fontFamily: "Inter",
    headingFontSize: "32",
    bodyFontSize: "14",
    buttonBorderRadius: "8",
    buttonPadding: "12",
    buttonFontWeight: "500"
};
var DEFAULT_COMPANY_BRAND = {
    companyName: "Your Company",
    companyDescription: "Company description",
    website: "https://yourcompany.com",
    email: "info@yourcompany.com",
    phone: "+1 (555) 000-0000",
    address: "123 Business Street, City, State",
    tagline: "Your company tagline",
    missionStatement: "Our mission statement",
    primaryBrandColor: "#3B82F6",
    secondaryBrandColor: "#10B981",
    accentBrandColor: "#F59E0B",
    fontFamilyBrand: "Inter",
    brandVoice: "professional"
};
exports.useBrandStore = zustand_1.create()(middleware_1.persist(function (set, get) { return ({
    brandConfig: DEFAULT_BRAND_CONFIG,
    companyBrand: DEFAULT_COMPANY_BRAND,
    updateBrandConfig: function (config) {
        set(function (state) { return ({
            brandConfig: __assign(__assign({}, state.brandConfig), config)
        }); });
        get().applyBrandToDOM();
        // Broadcast to all tabs
        var state = get();
        customizationBroadcast_1.broadcastBrandUpdate(state.brandConfig, state.companyBrand);
    },
    resetBrandConfig: function () {
        set({ brandConfig: DEFAULT_BRAND_CONFIG });
        get().applyBrandToDOM();
    },
    updateCompanyBrand: function (guide) {
        set(function (state) { return ({
            companyBrand: __assign(__assign({}, state.companyBrand), guide)
        }); });
    },
    resetCompanyBrand: function () {
        set({ companyBrand: DEFAULT_COMPANY_BRAND });
    },
    applyBrandToDOM: function () {
        var brandConfig = get().brandConfig;
        var root = document.documentElement;
        // Apply CSS custom properties for brand
        root.style.setProperty("--brand-primary", brandConfig.primaryColor);
        root.style.setProperty("--brand-secondary", brandConfig.secondaryColor);
        root.style.setProperty("--brand-accent", brandConfig.accentColor);
        root.style.setProperty("--brand-primary-dark", brandConfig.darkPrimaryColor);
        root.style.setProperty("--brand-secondary-dark", brandConfig.darkSecondaryColor);
        root.style.setProperty("--brand-accent-dark", brandConfig.darkAccentColor);
        root.style.setProperty("--brand-light-gray", brandConfig.lightGray);
        root.style.setProperty("--brand-dark-gray", brandConfig.darkGray);
        root.style.setProperty("--brand-light-text", brandConfig.lightText);
        root.style.setProperty("--brand-dark-text", brandConfig.darkText);
    }
}); }, {
    name: "brand-store",
    version: 1
}));
// Apply brand on store initialization
if (typeof window !== "undefined") {
    exports.useBrandStore.getState().applyBrandToDOM();
}
