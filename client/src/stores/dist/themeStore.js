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
exports.useThemeStore = void 0;
var zustand_1 = require("zustand");
var middleware_1 = require("zustand/middleware");
var customizationBroadcast_1 = require("@/hooks/customizationBroadcast");
var DEFAULT_THEME_CONFIG = {
    darkModePreset: "slate_dark",
    cardBackgroundStyle: "solid",
    accentColor: "#3b82f6",
    // Light Mode Colors
    h1ColorLight: "#000000",
    h2ColorLight: "#000000",
    h3ColorLight: "#000000",
    h4ColorLight: "#000000",
    h5ColorLight: "#000000",
    h6ColorLight: "#000000",
    bodyColorLight: "#333333",
    mutedColorLight: "#666666",
    // Dark Mode Colors
    h1ColorDark: "#ffffff",
    h2ColorDark: "#e5e5e5",
    h3ColorDark: "#d4d4d4",
    h4ColorDark: "#d4d4d4",
    h5ColorDark: "#a3a3a3",
    h6ColorDark: "#737373",
    bodyColorDark: "#d4d4d4",
    mutedColorDark: "#737373"
};
exports.useThemeStore = zustand_1.create()(middleware_1.persist(function (set, get) { return ({
    config: DEFAULT_THEME_CONFIG,
    updateThemeConfig: function (config) {
        set(function (state) { return ({
            config: __assign(__assign({}, state.config), config)
        }); });
        get().applyThemeToDOM();
        // Broadcast to all tabs
        var state = get();
        customizationBroadcast_1.broadcastThemeUpdate(state.config);
    },
    resetThemeConfig: function () {
        set({ config: DEFAULT_THEME_CONFIG });
        get().applyThemeToDOM();
    },
    applyThemeToDOM: function () {
        var config = get().config;
        var root = document.documentElement;
        // Apply CSS custom properties for theme
        root.style.setProperty("--theme-accent", config.accentColor);
        // Light Mode
        root.style.setProperty("--theme-h1-light", config.h1ColorLight);
        root.style.setProperty("--theme-h2-light", config.h2ColorLight);
        root.style.setProperty("--theme-h3-light", config.h3ColorLight);
        root.style.setProperty("--theme-h4-light", config.h4ColorLight);
        root.style.setProperty("--theme-h5-light", config.h5ColorLight);
        root.style.setProperty("--theme-h6-light", config.h6ColorLight);
        root.style.setProperty("--theme-body-light", config.bodyColorLight);
        root.style.setProperty("--theme-muted-light", config.mutedColorLight);
        // Dark Mode
        root.style.setProperty("--theme-h1-dark", config.h1ColorDark);
        root.style.setProperty("--theme-h2-dark", config.h2ColorDark);
        root.style.setProperty("--theme-h3-dark", config.h3ColorDark);
        root.style.setProperty("--theme-h4-dark", config.h4ColorDark);
        root.style.setProperty("--theme-h5-dark", config.h5ColorDark);
        root.style.setProperty("--theme-h6-dark", config.h6ColorDark);
        root.style.setProperty("--theme-body-dark", config.bodyColorDark);
        root.style.setProperty("--theme-muted-dark", config.mutedColorDark);
        // Apply card background styles
        if (config.cardBackgroundStyle && config.cardBackgroundStyle !== "solid") {
            root.style.setProperty("--card-background", "var(--card-" + config.cardBackgroundStyle + ")");
        }
    }
}); }, {
    name: "theme-store",
    version: 1
}));
// Apply theme on store initialization
if (typeof window !== "undefined") {
    exports.useThemeStore.getState().applyThemeToDOM();
}
