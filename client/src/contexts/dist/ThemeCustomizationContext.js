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
exports.useThemeStore = exports.useThemeCustomization = exports.ThemeCustomizationProvider = void 0;
var react_1 = require("react");
var customizationBroadcast_1 = require("@/hooks/customizationBroadcast");
var trpc_1 = require("@/lib/trpc");
var ThemeCustomizationContext = react_1.createContext(undefined);
function ThemeCustomizationProvider(_a) {
    var _this = this;
    var children = _a.children;
    var _b = react_1.useState(function () {
        try {
            var stored = localStorage.getItem('kiini_theme_config');
            return stored ? JSON.parse(stored) : {};
        }
        catch (_a) {
            return {};
        }
    }), config = _b[0], setConfig = _b[1];
    var themeConfigQuery = trpc_1.trpc.themeCustomization.getConfig.useQuery(undefined, {
        staleTime: 5 * 60 * 1000,
        enabled: typeof window !== 'undefined'
    });
    react_1.useEffect(function () {
        if (themeConfigQuery.data && Object.keys(config).length === 0) {
            setConfig(function (prev) {
                var hasLocal = Object.keys(prev).length > 0;
                if (hasLocal)
                    return prev;
                return themeConfigQuery.data;
            });
        }
    }, [themeConfigQuery.data, config]);
    // Fetch saved theme settings from the legacy backend API on mount
    react_1.useEffect(function () {
        (function () { return __awaiter(_this, void 0, void 0, function () {
            var token, res, json, theme, t, mapped_1, _a;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 3, , 4]);
                        token = localStorage.getItem('auth_token') || localStorage.getItem('token');
                        if (!token)
                            return [2 /*return*/];
                        return [4 /*yield*/, fetch('/api/trpc/settings.getPublicSettings', {
                                headers: { Authorization: "Bearer " + token }
                            })];
                    case 1:
                        res = _d.sent();
                        if (!res.ok)
                            return [2 /*return*/];
                        return [4 /*yield*/, res.json()];
                    case 2:
                        json = _d.sent();
                        theme = (_c = (_b = json === null || json === void 0 ? void 0 : json.result) === null || _b === void 0 ? void 0 : _b.data) !== null && _c !== void 0 ? _c : {};
                        t = theme.theme;
                        if (!t || typeof t !== 'object')
                            return [2 /*return*/];
                        mapped_1 = {};
                        if (t.primaryColor) {
                            mapped_1.accentColor = t.primaryColor;
                            mapped_1.customLightPrimary = t.primaryColor;
                            mapped_1.customDarkPrimary = t.primaryColor;
                        }
                        if (t.sidebarColor) {
                            mapped_1.customDarkBackground = t.sidebarColor;
                            mapped_1.sidebarBackgroundDark = t.sidebarColor;
                        }
                        if (t.headerColor) {
                            mapped_1.customLightSurface = t.headerColor;
                            mapped_1.navBackgroundLight = t.headerColor;
                        }
                        if (t.fontFamily) {
                            mapped_1.fontFamily = t.fontFamily;
                            mapped_1.bodyFont = t.fontFamily;
                            mapped_1.headingFont = t.fontFamily;
                        }
                        if (t.borderRadius) {
                            mapped_1.borderRadius = t.borderRadius;
                            mapped_1.buttonBorderRadius = t.borderRadius;
                        }
                        if (t.sidebarStyle)
                            mapped_1.sidebarStyle = t.sidebarStyle;
                        if (t.compactMode === 'true')
                            mapped_1.compactMode = true;
                        if (t.cssStyle)
                            mapped_1.customCSS = t.cssStyle;
                        // Only apply if we got meaningful data
                        if (Object.keys(mapped_1).length > 0) {
                            setConfig(function (prev) {
                                var hasLocal = Object.keys(prev).length > 0;
                                if (hasLocal)
                                    return prev;
                                return __assign(__assign({}, prev), mapped_1);
                            });
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        _a = _d.sent();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); })();
    }, []);
    var updateThemeConfig = function (newConfig) {
        setConfig(function (prev) { return (__assign(__assign({}, prev), newConfig)); });
    };
    var applyThemeToDOM = function () {
        var root = document.documentElement;
        // Font Configuration
        if (config.fontFamily) {
            root.style.setProperty('--font-family', config.fontFamily);
            document.body.style.fontFamily = config.fontFamily;
        }
        if (config.headingFont) {
            root.style.setProperty('--heading-font', config.headingFont);
        }
        if (config.bodyFont) {
            root.style.setProperty('--body-font', config.bodyFont);
            document.body.style.fontFamily = config.bodyFont;
        }
        if (config.fontSize) {
            root.style.setProperty('--font-size-base', config.fontSize);
        }
        if (config.fontWeight) {
            root.style.setProperty('--font-weight', config.fontWeight);
        }
        // Respect saved theme color mode from theme configuration
        if (config.colorMode === 'dark') {
            root.classList.add('dark');
        }
        else if (config.colorMode === 'light') {
            root.classList.remove('dark');
        }
        // Accent Color (applies to both themes)
        if (config.accentColor) {
            root.style.setProperty('--theme-accent', config.accentColor);
        }
        // Light Mode Colors — theme sets scoped --theme-* vars only
        if (config.customLightBackground) {
            root.style.setProperty('--theme-light-bg', config.customLightBackground);
        }
        if (config.customLightSurface) {
            root.style.setProperty('--theme-light-surface', config.customLightSurface);
        }
        if (config.customLightText) {
            root.style.setProperty('--theme-light-text', config.customLightText);
        }
        if (config.customLightPrimary) {
            root.style.setProperty('--theme-light-primary', config.customLightPrimary);
        }
        if (config.customLightSecondary) {
            root.style.setProperty('--theme-light-secondary', config.customLightSecondary);
        }
        if (config.customLightAccent) {
            root.style.setProperty('--theme-light-accent', config.customLightAccent);
        }
        // Light Mode Typography
        if (config.h1ColorLight) {
            root.style.setProperty('--theme-h1-light', config.h1ColorLight);
        }
        if (config.h2ColorLight) {
            root.style.setProperty('--theme-h2-light', config.h2ColorLight);
        }
        if (config.h3ColorLight) {
            root.style.setProperty('--theme-h3-light', config.h3ColorLight);
        }
        if (config.h4ColorLight) {
            root.style.setProperty('--theme-h4-light', config.h4ColorLight);
        }
        if (config.h5ColorLight) {
            root.style.setProperty('--theme-h5-light', config.h5ColorLight);
        }
        if (config.h6ColorLight) {
            root.style.setProperty('--theme-h6-light', config.h6ColorLight);
        }
        if (config.bodyColorLight) {
            root.style.setProperty('--theme-body-light', config.bodyColorLight);
        }
        if (config.mutedColorLight) {
            root.style.setProperty('--theme-muted-light', config.mutedColorLight);
        }
        if (config.customDarkBackground) {
            root.style.setProperty('--theme-dark-bg', config.customDarkBackground);
        }
        if (config.customDarkSurface) {
            root.style.setProperty('--theme-dark-surface', config.customDarkSurface);
        }
        if (config.customDarkText) {
            root.style.setProperty('--theme-dark-text', config.customDarkText);
        }
        if (config.customDarkPrimary) {
            root.style.setProperty('--theme-dark-primary', config.customDarkPrimary);
        }
        if (config.customDarkSecondary) {
            root.style.setProperty('--theme-dark-secondary', config.customDarkSecondary);
        }
        if (config.customDarkAccent) {
            root.style.setProperty('--theme-dark-accent', config.customDarkAccent);
        }
        // Dark Mode Typography
        if (config.h1ColorDark) {
            root.style.setProperty('--theme-h1-dark', config.h1ColorDark);
        }
        if (config.h2ColorDark) {
            root.style.setProperty('--theme-h2-dark', config.h2ColorDark);
        }
        if (config.h3ColorDark) {
            root.style.setProperty('--theme-h3-dark', config.h3ColorDark);
        }
        if (config.h4ColorDark) {
            root.style.setProperty('--theme-h4-dark', config.h4ColorDark);
        }
        if (config.h5ColorDark) {
            root.style.setProperty('--theme-h5-dark', config.h5ColorDark);
        }
        if (config.h6ColorDark) {
            root.style.setProperty('--theme-h6-dark', config.h6ColorDark);
        }
        if (config.bodyColorDark) {
            root.style.setProperty('--theme-body-dark', config.bodyColorDark);
        }
        if (config.mutedColorDark) {
            root.style.setProperty('--theme-muted-dark', config.mutedColorDark);
        }
        // Card Background Styling
        if (config.cardBackgroundStyle) {
            root.style.setProperty('--card-bg-style', config.cardBackgroundStyle);
        }
        if (config.customCardBackground) {
            root.style.setProperty('--custom-card-bg', config.customCardBackground);
        }
        if (config.customCardForeground) {
            root.style.setProperty('--custom-card-fg', config.customCardForeground);
        }
        if (config.cardBorderColor) {
            root.style.setProperty('--card-border-color', config.cardBorderColor);
        }
        if (config.cardShadowStyle) {
            root.style.setProperty('--card-shadow-style', config.cardShadowStyle);
        }
        // ====== Bridge theme vars to Tailwind CSS variables for sitewide effect ======
        var isDark = document.documentElement.classList.contains('dark');
        // Primary color → Tailwind --primary, --sidebar-primary, --ring
        var primary = isDark ? config.customDarkPrimary : config.customLightPrimary;
        if (primary) {
            root.style.setProperty('--primary', primary);
            root.style.setProperty('--sidebar-primary', primary);
            root.style.setProperty('--ring', primary);
        }
        if (config.accentColor) {
            root.style.setProperty('--primary', config.accentColor);
            root.style.setProperty('--sidebar-primary', config.accentColor);
            root.style.setProperty('--ring', config.accentColor);
        }
        // Accent color → Tailwind --accent
        var accent = isDark ? config.customDarkAccent : config.customLightAccent;
        if (accent) {
            root.style.setProperty('--accent', accent);
            root.style.setProperty('--sidebar-accent', accent);
        }
        // Background color → Tailwind --background
        var bg = isDark ? config.customDarkBackground : config.customLightBackground;
        if (bg) {
            root.style.setProperty('--background', bg);
        }
        // Sidebar background — always apply customDarkBackground as sidebar color since
        // sidebars typically stay dark even in light mode, but respect sidebarStyle
        if (config.customDarkBackground) {
            root.style.setProperty('--sidebar', config.customDarkBackground);
            // Auto-detect if sidebar color is dark → set light foreground text
            var hex = config.customDarkBackground.replace('#', '');
            if (hex.length === 6) {
                var r = parseInt(hex.slice(0, 2), 16);
                var g = parseInt(hex.slice(2, 4), 16);
                var b = parseInt(hex.slice(4, 6), 16);
                var luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                if (luminance < 0.5) {
                    // Dark sidebar → light text
                    root.style.setProperty('--sidebar-foreground', '#e2e8f0');
                    root.style.setProperty('--sidebar-accent', hex.length === 6 ? "#" + Math.min(255, r + 30).toString(16).padStart(2, '0') + Math.min(255, g + 30).toString(16).padStart(2, '0') + Math.min(255, b + 30).toString(16).padStart(2, '0') : '#334155');
                    root.style.setProperty('--sidebar-accent-foreground', '#f1f5f9');
                    root.style.setProperty('--sidebar-border', "rgba(255,255,255,0.1)");
                }
                else {
                    // Light sidebar → dark text
                    root.style.setProperty('--sidebar-foreground', '#1e293b');
                    root.style.setProperty('--sidebar-accent-foreground', '#0f172a');
                    root.style.setProperty('--sidebar-border', "rgba(0,0,0,0.1)");
                }
            }
        }
        // Surface color → Tailwind --card, --popover
        var surface = isDark ? config.customDarkSurface : config.customLightSurface;
        if (surface) {
            root.style.setProperty('--card', surface);
            root.style.setProperty('--popover', surface);
        }
        // Text color → Tailwind --foreground
        var text = isDark ? config.customDarkText : config.customLightText;
        if (text) {
            root.style.setProperty('--foreground', text);
            root.style.setProperty('--card-foreground', text);
            root.style.setProperty('--popover-foreground', text);
            root.style.setProperty('--sidebar-foreground', text);
        }
        // Secondary color → Tailwind --secondary
        var secondary = isDark ? config.customDarkSecondary : config.customLightSecondary;
        if (secondary) {
            root.style.setProperty('--secondary', secondary);
        }
        // Border radius — convert raw number to px unit for CSS calc() compatibility
        if (config.borderRadius) {
            var val = config.borderRadius;
            // If it's a plain number (e.g. "8"), append "px"; otherwise use as-is (e.g. "0.65rem")
            var radiusValue = /^\d+(\.\d+)?$/.test(val) ? val + "px" : val;
            root.style.setProperty('--radius', radiusValue);
        }
        // ====== Button Styling ======
        if (config.buttonBgColorLight) {
            root.style.setProperty('--button-bg-light', config.buttonBgColorLight);
        }
        if (config.buttonBgColorDark) {
            root.style.setProperty('--button-bg-dark', config.buttonBgColorDark);
        }
        if (config.buttonBorderRadius) {
            root.style.setProperty('--button-radius', config.buttonBorderRadius);
        }
        if (config.buttonPadding) {
            root.style.setProperty('--button-padding', config.buttonPadding);
        }
        if (config.buttonFontSize) {
            root.style.setProperty('--button-font-size', config.buttonFontSize);
        }
        if (config.buttonBorderColor) {
            root.style.setProperty('--button-border', config.buttonBorderColor);
        }
        if (config.buttonHoverBg) {
            root.style.setProperty('--button-hover', config.buttonHoverBg);
        }
        if (config.buttonActiveBg) {
            root.style.setProperty('--button-active-bg', config.buttonActiveBg);
        }
        if (config.buttonDisabledBg) {
            root.style.setProperty('--button-disabled-bg', config.buttonDisabledBg);
        }
        if (config.buttonDisabledText) {
            root.style.setProperty('--button-disabled-text', config.buttonDisabledText);
        }
        if (config.buttonActiveText) {
            root.style.setProperty('--button-active-text', config.buttonActiveText);
        }
        // ====== Navigation Styling ======
        if (config.navBackgroundLight) {
            root.style.setProperty('--nav-bg-light', config.navBackgroundLight);
        }
        if (config.navBackgroundDark) {
            root.style.setProperty('--nav-bg-dark', config.navBackgroundDark);
        }
        if (config.navTextColorLight) {
            root.style.setProperty('--nav-text-light', config.navTextColorLight);
        }
        if (config.navTextColorDark) {
            root.style.setProperty('--nav-text-dark', config.navTextColorDark);
        }
        if (config.navBorderColor) {
            root.style.setProperty('--nav-border', config.navBorderColor);
        }
        if (config.navHoverBg) {
            root.style.setProperty('--nav-hover-bg', config.navHoverBg);
        }
        if (config.navActiveBg) {
            root.style.setProperty('--nav-active-bg', config.navActiveBg);
        }
        if (config.navHoverText) {
            root.style.setProperty('--nav-hover-text', config.navHoverText);
        }
        if (config.navActiveText) {
            root.style.setProperty('--nav-active-text', config.navActiveText);
        }
        // ====== Sidebar Styling ======
        if (config.sidebarBackgroundLight) {
            root.style.setProperty('--sidebar-bg-light', config.sidebarBackgroundLight);
        }
        if (config.sidebarBackgroundDark) {
            root.style.setProperty('--sidebar-bg-dark', config.sidebarBackgroundDark);
        }
        if (config.sidebarTextColorLight) {
            root.style.setProperty('--sidebar-text-light', config.sidebarTextColorLight);
        }
        if (config.sidebarTextColorDark) {
            root.style.setProperty('--sidebar-text-dark', config.sidebarTextColorDark);
        }
        if (config.sidebarAccentColor) {
            root.style.setProperty('--sidebar-accent-color', config.sidebarAccentColor);
        }
        if (config.sidebarWidth) {
            root.style.setProperty('--sidebar-width', config.sidebarWidth);
        }
        if (config.sidebarCollapsedWidth) {
            root.style.setProperty('--sidebar-collapsed-width', config.sidebarCollapsedWidth);
        }
        if (config.sidebarIconSize) {
            root.style.setProperty('--sidebar-icon-size', config.sidebarIconSize);
        }
        if (config.sidebarStyle) {
            root.style.setProperty('--sidebar-style', config.sidebarStyle);
        }
        if (config.compactMode !== undefined) {
            root.style.setProperty('--compact-mode', config.compactMode ? 'true' : 'false');
        }
        // ====== Border & Spacing ======
        if (config.borderColor) {
            root.style.setProperty('--border', config.borderColor);
        }
        if (config.borderColorLight) {
            root.style.setProperty('--border-light', config.borderColorLight);
        }
        if (config.borderColorDark) {
            root.style.setProperty('--border-dark', config.borderColorDark);
        }
        // ====== Background Themes ======
        if (config.backgroundGradient) {
            root.style.setProperty('--bg-gradient', config.backgroundGradient);
        }
        if (config.backgroundPattern) {
            root.style.setProperty('--bg-pattern', config.backgroundPattern);
        }
        if (config.backgroundImage) {
            root.style.setProperty('--bg-image', config.backgroundImage);
        }
        // ====== Form Input Styles ======
        if (config.formInputBg) {
            root.style.setProperty('--form-input-bg', config.formInputBg);
        }
        if (config.formInputBorder) {
            root.style.setProperty('--form-input-border', config.formInputBorder);
        }
        if (config.formInputText) {
            root.style.setProperty('--form-input-text', config.formInputText);
        }
        // ====== Table Styles ======
        if (config.tableBg) {
            root.style.setProperty('--table-bg', config.tableBg);
        }
        if (config.tableBorder) {
            root.style.setProperty('--table-border', config.tableBorder);
        }
        if (config.tableText) {
            root.style.setProperty('--table-text', config.tableText);
        }
        // ====== Modal Styles ======
        if (config.modalBg) {
            root.style.setProperty('--modal-bg', config.modalBg);
        }
        if (config.modalBorder) {
            root.style.setProperty('--modal-border', config.modalBorder);
        }
        if (config.modalText) {
            root.style.setProperty('--modal-text', config.modalText);
        }
        // ====== Tooltip Styles ======
        if (config.tooltipBg) {
            root.style.setProperty('--tooltip-bg', config.tooltipBg);
        }
        if (config.tooltipText) {
            root.style.setProperty('--tooltip-text', config.tooltipText);
        }
        // ====== Dropdown Styles ======
        if (config.dropdownBg) {
            root.style.setProperty('--dropdown-bg', config.dropdownBg);
        }
        if (config.dropdownBorder) {
            root.style.setProperty('--dropdown-border', config.dropdownBorder);
        }
        if (config.dropdownText) {
            root.style.setProperty('--dropdown-text', config.dropdownText);
        }
        if (config.customCSS) {
            var customStyle = document.getElementById('kiini-theme-custom-css');
            if (!customStyle) {
                customStyle = document.createElement('style');
                customStyle.id = 'kiini-theme-custom-css';
                document.head.appendChild(customStyle);
            }
            customStyle.textContent = config.customCSS;
        }
        else {
            var customStyle = document.getElementById('kiini-theme-custom-css');
            if (customStyle) {
                customStyle.remove();
            }
        }
    };
    // Persist to localStorage and apply when config changes
    react_1.useEffect(function () {
        if (Object.keys(config).length > 0) {
            localStorage.setItem('kiini_theme_config', JSON.stringify(config));
            applyThemeToDOM();
            customizationBroadcast_1.broadcastThemeUpdate(config);
        }
    }, [config]);
    // Re-apply theme when dark/light mode toggles (MutationObserver on html class)
    react_1.useEffect(function () {
        var observer = new MutationObserver(function (mutations) {
            for (var _i = 0, mutations_1 = mutations; _i < mutations_1.length; _i++) {
                var m = mutations_1[_i];
                if (m.type === 'attributes' && m.attributeName === 'class') {
                    applyThemeToDOM();
                }
            }
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return function () { return observer.disconnect(); };
    }, [config]);
    return (react_1["default"].createElement(ThemeCustomizationContext.Provider, { value: { config: config, updateThemeConfig: updateThemeConfig, applyThemeToDOM: applyThemeToDOM } }, children));
}
exports.ThemeCustomizationProvider = ThemeCustomizationProvider;
function useThemeCustomization() {
    var context = react_1.useContext(ThemeCustomizationContext);
    if (!context) {
        throw new Error('useThemeCustomization must be used within ThemeCustomizationProvider');
    }
    return context;
}
exports.useThemeCustomization = useThemeCustomization;
// For store-like interface compatibility
exports.useThemeStore = useThemeCustomization;
