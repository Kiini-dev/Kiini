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
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var ThemeCustomizationContext_1 = require("@/contexts/ThemeCustomizationContext");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var tabs_1 = require("@/components/ui/tabs");
var label_1 = require("@/components/ui/label");
var input_1 = require("@/components/ui/input");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var sonner_1 = require("sonner");
var ThemeContext_1 = require("@/contexts/ThemeContext");
var trpc_1 = require("@/lib/trpc");
// Dark mode variations
var DARK_MODE_PRESETS = {
    total_dark: {
        name: "Total Dark",
        description: "Pure black background with bright accents",
        background: "#000000",
        surface: "#1a1a1a",
        text: "#ffffff",
        muted: "#404040"
    },
    grey_black: {
        name: "Grey & Black",
        description: "Dark grey with black accents",
        background: "#111111",
        surface: "#2a2a2a",
        text: "#e5e5e5",
        muted: "#666666"
    },
    navy_dark: {
        name: "Navy Blue & Dark",
        description: "Navy blue background with dark accents",
        background: "#0f1a3f",
        surface: "#1a2f5f",
        text: "#e3f2fd",
        muted: "#546e7a"
    },
    slate_dark: {
        name: "Slate Dark",
        description: "Slate grey background",
        background: "#1e293b",
        surface: "#334155",
        text: "#f1f5f9",
        muted: "#64748b"
    },
    forest_dark: {
        name: "Forest Dark",
        description: "Forest green accents on dark",
        background: "#0d1b1f",
        surface: "#1b2928",
        text: "#e0f2f1",
        muted: "#455a64"
    }
};
var CARD_BACKGROUND_STYLES = [
    {
        id: "solid",
        name: "Solid",
        light: "#ffffff",
        dark: "#1a1a1a"
    },
    {
        id: "gradient_subtle",
        name: "Subtle Gradient",
        light: "linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)",
        dark: "linear-gradient(135deg, #1a1a1a 0%, #252525 100%)"
    },
    {
        id: "gradient_soft",
        name: "Soft Gradient",
        light: "linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)",
        dark: "linear-gradient(135deg, #0f0f0f 0%, #2a2a2a 100%)"
    },
    {
        id: "gradient_bold",
        name: "Bold Gradient",
        light: "linear-gradient(135deg, #ffffff 0%, #e8e8e8 100%)",
        dark: "linear-gradient(135deg, #2a2a2a 0%, #0f0f0f 100%)"
    },
    {
        id: "frosted",
        name: "Frosted Glass",
        light: "rgba(255, 255, 255, 0.8)",
        dark: "rgba(30, 30, 30, 0.8)"
    },
];
var LIGHT_MODE_COLORS = {
    background: "#ffffff",
    surface: "#f9fafb",
    text: "#1f2937",
    muted: "#d1d5db"
};
function ThemeCustomization() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var theme = ThemeContext_1.useTheme().theme;
    var _b = react_1.useState({
        darkModePreset: "slate_dark",
        cardBackgroundStyle: "solid",
        accentColor: "#3b82f6",
        // Light mode font colors
        h1ColorLight: "#1f2937",
        h2ColorLight: "#374151",
        h3ColorLight: "#4b5563",
        h4ColorLight: "#6b7280",
        h5ColorLight: "#9ca3af",
        h6ColorLight: "#d1d5db",
        bodyColorLight: "#1f2937",
        mutedColorLight: "#9ca3af",
        // Dark mode font colors
        h1ColorDark: "#f3f4f6",
        h2ColorDark: "#e5e7eb",
        h3ColorDark: "#d1d5db",
        h4ColorDark: "#9ca3af",
        h5ColorDark: "#6b7280",
        h6ColorDark: "#4b5563",
        bodyColorDark: "#e5e7eb",
        mutedColorDark: "#9ca3af"
    }), config = _b[0], setConfig = _b[1];
    var _c = react_1.useState("slate_dark"), selectedPreset = _c[0], setSelectedPreset = _c[1];
    var _d = react_1.useState(false), copied = _d[0], setCopied = _d[1];
    var currentDarkPreset = DARK_MODE_PRESETS[selectedPreset];
    var currentCardStyle = CARD_BACKGROUND_STYLES.find(function (s) { return s.id === config.cardBackgroundStyle; });
    var themeConfigQuery = trpc_1.trpc.themeCustomization.getConfig.useQuery(undefined, {
        staleTime: 5 * 60 * 1000
    });
    var _e = react_1.useState(false), serverThemeLoaded = _e[0], setServerThemeLoaded = _e[1];
    var handlePresetChange = function (preset) {
        setSelectedPreset(preset);
        setConfig(function (prev) { return (__assign(__assign({}, prev), { darkModePreset: preset })); });
    };
    var handleCardStyleChange = function (styleId) {
        setConfig(function (prev) { return (__assign(__assign({}, prev), { cardBackgroundStyle: styleId })); });
    };
    react_1.useEffect(function () {
        if (themeConfigQuery.data && !serverThemeLoaded) {
            setConfig(function (prev) { return (__assign(__assign({}, prev), themeConfigQuery.data)); });
            setSelectedPreset(themeConfigQuery.data.darkModePreset || "slate_dark");
            setServerThemeLoaded(true);
        }
    }, [themeConfigQuery.data, serverThemeLoaded]);
    var handleAccentColorChange = function (color) {
        setConfig(function (prev) { return (__assign(__assign({}, prev), { accentColor: color })); });
    };
    var _f = react_1.useState(false), isSaving = _f[0], setIsSaving = _f[1];
    var _g = react_1.useState(false), isResetting = _g[0], setIsResetting = _g[1];
    var saveMutation = trpc_1.trpc.themeCustomization.saveConfig.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Theme configuration saved successfully!");
            setIsSaving(false);
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to save: " + error.message);
            setIsSaving(false);
        }
    });
    var resetMutation = trpc_1.trpc.themeCustomization.resetToDefault.useMutation({
        onSuccess: function (data) {
            setConfig(data.config);
            setSelectedPreset(data.config.darkModePreset || "slate_dark");
            sonner_1.toast.success(data.message);
            setIsResetting(false);
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to reset: " + error.message);
            setIsResetting(false);
        }
    });
    var updateThemeConfig = ThemeCustomizationContext_1.useThemeCustomization().updateThemeConfig;
    var handleSave = function () {
        setIsSaving(true);
        updateThemeConfig(config);
        saveMutation.mutate(config);
    };
    var handleReset = function () {
        if (confirm("Reset theme settings to defaults? This cannot be undone.")) {
            setIsResetting(true);
            resetMutation.mutate();
        }
    };
    var handleCopyConfig = function () {
        navigator.clipboard.writeText(JSON.stringify(config, null, 2));
        setCopied(true);
        sonner_1.toast.success("Theme config copied to clipboard");
        setTimeout(function () { return setCopied(false); }, 2000);
    };
    var generateCSSVariables = function () {
        var preset = currentDarkPreset;
        var darkBg = config.customDarkBackground || preset.background;
        var darkSurface = config.customDarkSurface || preset.surface;
        var darkText = config.customDarkText || preset.text;
        var darkMuted = config.mutedColorDark || preset.muted;
        var cardLightBg = config.customCardBackground || (currentCardStyle === null || currentCardStyle === void 0 ? void 0 : currentCardStyle.light);
        var cardDarkBg = config.customCardBackground || (currentCardStyle === null || currentCardStyle === void 0 ? void 0 : currentCardStyle.dark);
        return ("\n/* Generated Theme Configuration */\n:root {\n  /* Light Mode */\n  --light-bg: " + LIGHT_MODE_COLORS.background + ";\n  --light-surface: " + LIGHT_MODE_COLORS.surface + ";\n  --light-text: " + LIGHT_MODE_COLORS.text + ";\n  --light-muted: " + LIGHT_MODE_COLORS.muted + ";\n  \n  /* Dark Mode - " + preset.name + " */\n  --dark-bg: " + darkBg + ";\n  --dark-surface: " + darkSurface + ";\n  --dark-text: " + darkText + ";\n  --dark-muted: " + darkMuted + ";\n  \n  /* Accent */\n  --accent-color: " + config.accentColor + ";\n  \n  /* Card Styles */\n  --card-background: " + cardLightBg + ";\n  --card-background-dark: " + cardDarkBg + ";\n}\n\n@media (prefers-color-scheme: dark) {\n  :root {\n    --card-background: " + cardDarkBg + ";\n  }\n}\n    ").trim();
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Theme Customization", description: "Configure light and dark mode themes, card styles, and color schemes", icon: React.createElement(lucide_react_1.Palette, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Settings", href: "/settings" },
            { label: "Theme Customization" },
        ] },
        React.createElement("div", { className: "space-y-6 max-w-6xl" },
            React.createElement("div", { className: "flex items-center justify-between gap-4" },
                React.createElement("div", { className: "flex items-center gap-4" },
                    React.createElement("div", { className: "flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg" },
                        React.createElement("span", { className: "text-sm font-medium" }, "Current Mode:"),
                        theme === "dark" ? (React.createElement(lucide_react_1.Moon, { className: "h-4 w-4 text-blue-500" })) : (React.createElement(lucide_react_1.Sun, { className: "h-4 w-4 text-orange-500" })),
                        React.createElement("span", { className: "font-semibold capitalize" }, theme))),
                React.createElement("div", { className: "flex gap-2" },
                    React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleReset, disabled: isResetting },
                        isResetting ? React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" }) : React.createElement(lucide_react_1.RotateCcw, { className: "h-4 w-4 mr-2" }),
                        "Reset"),
                    React.createElement(button_1.Button, { size: "sm", onClick: handleSave, disabled: isSaving },
                        isSaving ? React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" }) : React.createElement(lucide_react_1.Check, { className: "h-4 w-4 mr-2" }),
                        "Save Configuration"))),
            React.createElement(tabs_1.Tabs, { defaultValue: "dark-modes", className: "space-y-6" },
                React.createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-5" },
                    React.createElement(tabs_1.TabsTrigger, { value: "dark-modes" }, "Dark Mode Presets"),
                    React.createElement(tabs_1.TabsTrigger, { value: "card-styles" }, "Card Styles"),
                    React.createElement(tabs_1.TabsTrigger, { value: "colors" }, "Colors"),
                    React.createElement(tabs_1.TabsTrigger, { value: "fonts" }, "Font Colors"),
                    React.createElement(tabs_1.TabsTrigger, { value: "preview" }, "Preview")),
                React.createElement(tabs_1.TabsContent, { value: "dark-modes", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Dark Mode Variations"),
                            React.createElement(card_1.CardDescription, null, "Choose a dark mode preset that best matches your brand aesthetic")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-4" }, Object.entries(DARK_MODE_PRESETS).map(function (_a) {
                                var key = _a[0], preset = _a[1];
                                return (React.createElement("div", { key: key, className: utils_1.cn("p-4 rounded-lg border-2 cursor-pointer transition-all", selectedPreset === key
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                                        : "border-slate-200 dark:border-slate-700 hover:border-slate-400"), onClick: function () { return handlePresetChange(key); } },
                                    React.createElement("div", { className: "flex gap-2 mb-3" },
                                        React.createElement("div", { className: "w-12 h-12 rounded border border-slate-300", style: { backgroundColor: preset.background }, title: "Background" }),
                                        React.createElement("div", { className: "w-12 h-12 rounded border border-slate-300", style: { backgroundColor: preset.surface }, title: "Surface" }),
                                        React.createElement("div", { className: "w-12 h-12 rounded border border-slate-300", style: {
                                                backgroundColor: preset.muted
                                            }, title: "Muted" })),
                                    React.createElement("h4", { className: "font-semibold text-sm" }, preset.name),
                                    React.createElement("p", { className: "text-xs text-muted-foreground" }, preset.description),
                                    selectedPreset === key && (React.createElement("div", { className: "mt-3 flex items-center text-xs text-blue-600 dark:text-blue-400" },
                                        React.createElement(lucide_react_1.Check, { className: "h-4 w-4 mr-1" }),
                                        "Selected"))));
                            }))))),
                React.createElement(tabs_1.TabsContent, { value: "card-styles", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Card & Component Backgrounds"),
                            React.createElement(card_1.CardDescription, null, "Choose how cards and components should be styled")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-4" }, CARD_BACKGROUND_STYLES.map(function (style) { return (React.createElement("div", { key: style.id, className: utils_1.cn("p-4 rounded-lg border-2 cursor-pointer transition-all", config.cardBackgroundStyle === style.id
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                                    : "border-slate-200 dark:border-slate-700 hover:border-slate-400"), onClick: function () { return handleCardStyleChange(style.id); } },
                                React.createElement("div", { className: "w-full h-16 rounded mb-3 border border-slate-300 dark:border-slate-600", style: {
                                        background: theme === "dark" ? style.dark : style.light
                                    } }),
                                React.createElement("h4", { className: "font-semibold text-sm" }, style.name),
                                React.createElement("p", { className: "text-xs text-muted-foreground mb-3" },
                                    style.id === "solid" && "Clean and simple",
                                    style.id === "gradient_subtle" && "Gentle gradient effect",
                                    style.id === "gradient_soft" && "Soft, barely visible gradient",
                                    style.id === "gradient_bold" && "Noticeable gradient contrast",
                                    style.id === "frosted" && "Semi-transparent frosted glass"),
                                config.cardBackgroundStyle === style.id && (React.createElement("div", { className: "flex items-center text-xs text-blue-600 dark:text-blue-400" },
                                    React.createElement(lucide_react_1.Check, { className: "h-4 w-4 mr-1" }),
                                    "Active")))); }))))),
                React.createElement(tabs_1.TabsContent, { value: "colors", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Theme Colors"),
                            React.createElement(card_1.CardDescription, null, "Customize accent colors that work across all theme modes")),
                        React.createElement(card_1.CardContent, { className: "space-y-6" },
                            React.createElement("div", { className: "space-y-4" },
                                React.createElement("div", null,
                                    React.createElement(label_1.Label, { className: "text-base font-semibold mb-3 block" }, "Primary Accent Color"),
                                    React.createElement("p", { className: "text-sm text-muted-foreground mb-3" }, "Used for buttons, links, and interactive elements"),
                                    React.createElement("div", { className: "flex gap-4 items-end" },
                                        React.createElement("div", { className: "flex-1" },
                                            React.createElement("input", { type: "color", value: config.accentColor, onChange: function (e) { return handleAccentColorChange(e.target.value); }, className: "w-full h-12 rounded cursor-pointer border border-slate-300 dark:border-slate-600" })),
                                        React.createElement("code", { className: "px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded font-mono text-sm" }, config.accentColor))),
                                React.createElement("div", { className: "grid grid-cols-2 gap-4 pt-4 border-t" },
                                    React.createElement("div", null,
                                        React.createElement("h4", { className: "font-semibold text-sm mb-3" }, "Light Mode Palette"),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement("div", { className: "flex items-center gap-2" },
                                                React.createElement("div", { className: "w-8 h-8 rounded", style: { backgroundColor: LIGHT_MODE_COLORS.background } }),
                                                React.createElement("span", { className: "text-sm" }, "Background")),
                                            React.createElement("div", { className: "flex items-center gap-2" },
                                                React.createElement("div", { className: "w-8 h-8 rounded", style: { backgroundColor: LIGHT_MODE_COLORS.surface } }),
                                                React.createElement("span", { className: "text-sm" }, "Surface")),
                                            React.createElement("div", { className: "flex items-center gap-2" },
                                                React.createElement("div", { className: "w-8 h-8 rounded", style: { backgroundColor: config.accentColor } }),
                                                React.createElement("span", { className: "text-sm" }, "Accent")))),
                                    React.createElement("div", null,
                                        React.createElement("h4", { className: "font-semibold text-sm mb-3" }, "Dark Mode Palette"),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement("div", { className: "flex items-center gap-2" },
                                                React.createElement("div", { className: "w-8 h-8 rounded", style: { backgroundColor: currentDarkPreset.background } }),
                                                React.createElement("span", { className: "text-sm" }, "Background")),
                                            React.createElement("div", { className: "flex items-center gap-2" },
                                                React.createElement("div", { className: "w-8 h-8 rounded", style: { backgroundColor: currentDarkPreset.surface } }),
                                                React.createElement("span", { className: "text-sm" }, "Surface")),
                                            React.createElement("div", { className: "flex items-center gap-2" },
                                                React.createElement("div", { className: "w-8 h-8 rounded", style: { backgroundColor: config.accentColor } }),
                                                React.createElement("span", { className: "text-sm" }, "Accent"))))))))),
                React.createElement(tabs_1.TabsContent, { value: "fonts", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Font & Text Colors"),
                            React.createElement(card_1.CardDescription, null, "Customize text colors for different heading levels and text styles")),
                        React.createElement(card_1.CardContent, { className: "space-y-6" },
                            React.createElement("div", null,
                                React.createElement("h3", { className: "font-semibold text-base mb-4 flex items-center gap-2" },
                                    React.createElement(lucide_react_1.Sun, { className: "h-4 w-4 text-orange-500" }),
                                    "Light Mode Font Colors"),
                                React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4" }, [
                                    { key: "h1ColorLight", label: "H1 Heading", example: "H1" },
                                    { key: "h2ColorLight", label: "H2 Heading", example: "H2" },
                                    { key: "h3ColorLight", label: "H3 Heading", example: "H3" },
                                    { key: "h4ColorLight", label: "H4 Heading", example: "H4" },
                                    { key: "h5ColorLight", label: "H5 Heading", example: "H5" },
                                    { key: "h6ColorLight", label: "H6 Heading", example: "H6" },
                                    { key: "bodyColorLight", label: "Body Text", example: "Body" },
                                    { key: "mutedColorLight", label: "Muted Text", example: "Muted" },
                                ].map(function (_a) {
                                    var key = _a.key, label = _a.label, example = _a.example;
                                    return (React.createElement("div", { key: key, className: "space-y-2" },
                                        React.createElement(label_1.Label, { className: "text-sm" }, label),
                                        React.createElement("div", { className: "flex gap-2" },
                                            React.createElement(input_1.Input, { type: "color", value: config[key], onChange: function (e) {
                                                    return setConfig(function (prev) {
                                                        var _a;
                                                        return (__assign(__assign({}, prev), (_a = {}, _a[key] = e.target.value, _a)));
                                                    });
                                                }, className: "w-10 h-10 cursor-pointer rounded" }),
                                            React.createElement("div", { className: "flex-1 rounded border border-slate-300 dark:border-slate-600 flex items-center justify-center font-semibold", style: {
                                                    color: config[key],
                                                    backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff"
                                                } }, example))));
                                }))),
                            React.createElement("div", null,
                                React.createElement("h3", { className: "font-semibold text-base mb-4 flex items-center gap-2" },
                                    React.createElement(lucide_react_1.Moon, { className: "h-4 w-4 text-blue-500" }),
                                    "Dark Mode Font Colors"),
                                React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4" }, [
                                    { key: "h1ColorDark", label: "H1 Heading", example: "H1" },
                                    { key: "h2ColorDark", label: "H2 Heading", example: "H2" },
                                    { key: "h3ColorDark", label: "H3 Heading", example: "H3" },
                                    { key: "h4ColorDark", label: "H4 Heading", example: "H4" },
                                    { key: "h5ColorDark", label: "H5 Heading", example: "H5" },
                                    { key: "h6ColorDark", label: "H6 Heading", example: "H6" },
                                    { key: "bodyColorDark", label: "Body Text", example: "Body" },
                                    { key: "mutedColorDark", label: "Muted Text", example: "Muted" },
                                ].map(function (_a) {
                                    var key = _a.key, label = _a.label, example = _a.example;
                                    return (React.createElement("div", { key: key, className: "space-y-2" },
                                        React.createElement(label_1.Label, { className: "text-sm" }, label),
                                        React.createElement("div", { className: "flex gap-2" },
                                            React.createElement(input_1.Input, { type: "color", value: config[key], onChange: function (e) {
                                                    return setConfig(function (prev) {
                                                        var _a;
                                                        return (__assign(__assign({}, prev), (_a = {}, _a[key] = e.target.value, _a)));
                                                    });
                                                }, className: "w-10 h-10 cursor-pointer rounded" }),
                                            React.createElement("div", { className: "flex-1 rounded border border-slate-300 dark:border-slate-600 flex items-center justify-center font-semibold", style: {
                                                    color: config[key],
                                                    backgroundColor: theme === "dark" ? "#0f172a" : "#f8fafc"
                                                } }, example))));
                                })))))),
                React.createElement(tabs_1.TabsContent, { value: "preview", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Theme Preview"),
                            React.createElement(card_1.CardDescription, null, "See how your theme configuration will look")),
                        React.createElement(card_1.CardContent, { className: "space-y-6" },
                            React.createElement("div", { className: "grid md:grid-cols-2 gap-6" },
                                React.createElement("div", null,
                                    React.createElement("h4", { className: "font-semibold text-sm mb-3" }, "Button Styles"),
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement("button", { className: "px-4 py-2 rounded text-white w-full", style: { backgroundColor: config.accentColor } }, "Primary Button"),
                                        React.createElement("button", { className: "px-4 py-2 rounded border w-full", style: {
                                                borderColor: config.accentColor,
                                                color: config.accentColor
                                            } }, "Secondary Button"))),
                                React.createElement("div", null,
                                    React.createElement("h4", { className: "font-semibold text-sm mb-3" }, "Card Styles"),
                                    React.createElement("div", { className: "p-4 rounded-lg border", style: {
                                            background: theme === "dark"
                                                ? currentCardStyle === null || currentCardStyle === void 0 ? void 0 : currentCardStyle.dark : currentCardStyle === null || currentCardStyle === void 0 ? void 0 : currentCardStyle.light,
                                            borderColor: theme === "dark" ? "#444" : "#ddd"
                                        } },
                                        React.createElement("div", { className: "font-semibold mb-2" }, "Sample Card"),
                                        React.createElement("div", { className: "text-sm text-muted-foreground" }, "This is how cards will appear with your selected style")))),
                            React.createElement("div", { className: "border-t pt-6" },
                                React.createElement("h4", { className: "font-semibold text-sm mb-3" }, "Configuration"),
                                React.createElement("div", { className: "bg-slate-100 dark:bg-slate-900 rounded p-4 font-mono text-xs overflow-auto max-h-48" },
                                    React.createElement("pre", null, generateCSSVariables())),
                                React.createElement(button_1.Button, { variant: "outline", size: "sm", className: "mt-3", onClick: handleCopyConfig },
                                    React.createElement(lucide_react_1.Copy, { className: "h-4 w-4 mr-2" }),
                                    copied ? "Copied!" : "Copy Configuration")))))))));
}
exports["default"] = ThemeCustomization;
