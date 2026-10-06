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
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var separator_1 = require("@/components/ui/separator");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var BrandContext_1 = require("@/contexts/BrandContext");
var isValidHexColor = function (color) {
    return /^#[0-9A-F]{6}$/i.test(color);
};
var normalizeHexColor = function (color) {
    color = color.trim().toUpperCase();
    if (!color.startsWith('#')) {
        color = '#' + color;
    }
    return color;
};
var DEFAULT_BRAND = {
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    accentColor: '#F59E0B',
    darkPrimaryColor: '#1E40AF',
    darkSecondaryColor: '#059669',
    darkAccentColor: '#D97706',
    lightGray: '#F3F4F6',
    darkGray: '#374151',
    lightText: '#000000',
    darkText: '#FFFFFF',
    fontFamily: 'Inter',
    headingFontSize: 24,
    bodyFontSize: 14,
    buttonBorderRadius: 6,
    buttonPadding: 10,
    buttonFontWeight: 600
};
function BrandCustomization() {
    var _a = BrandContext_1.useBrand(), brandConfig = _a.brandConfig, updateBrandConfig = _a.updateBrandConfig;
    var _b = react_1.useState(brandConfig || DEFAULT_BRAND), brand = _b[0], setBrand = _b[1];
    var _c = react_1.useState(false), darkMode = _c[0], setDarkMode = _c[1];
    var _d = react_1.useState(false), copied = _d[0], setCopied = _d[1];
    var _e = react_1.useState(false), isLoading = _e[0], setIsLoading = _e[1];
    // Sync context to local state when context updates
    react_1.useEffect(function () {
        if (brandConfig) {
            setBrand(brandConfig);
        }
    }, [brandConfig]);
    var handleBrandChange = function (key, value) {
        setBrand(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[key] = value, _a)));
        });
    };
    var handleSave = function () {
        try {
            setIsLoading(true);
            // Update context (which broadcasts to other tabs)
            updateBrandConfig(brand);
            sonner_1.toast.success("Brand settings saved successfully!");
            setIsLoading(false);
        }
        catch (err) {
            console.error("Save error:", err);
            sonner_1.toast.error((err === null || err === void 0 ? void 0 : err.message) || "Failed to save brand settings");
            setIsLoading(false);
        }
    };
    var handleReset = function () {
        if (confirm("Reset brand settings to defaults?")) {
            setBrand(DEFAULT_BRAND);
            updateBrandConfig(DEFAULT_BRAND);
            sonner_1.toast.success("Brand settings reset to defaults");
        }
    };
    var handleDownloadCSS = function () {
        var css = "/* Generated Brand Customization CSS */\n:root {\n  /* Light Mode Colors */\n  --primary-color: " + brand.primaryColor + ";\n  --secondary-color: " + brand.secondaryColor + ";\n  --accent-color: " + brand.accentColor + ";\n  \n  /* Typography */\n  --font-family: \"" + brand.fontFamily + "\", sans-serif;\n  --heading-font-size: " + brand.headingFontSize + "px;\n  --body-font-size: " + brand.bodyFontSize + "px;\n  \n  /* Button Styles */\n  --button-border-radius: " + brand.buttonBorderRadius + "px;\n  --button-padding: " + brand.buttonPadding + "px;\n  --button-font-weight: " + brand.buttonFontWeight + ";\n}\n\n@media (prefers-color-scheme: dark) {\n  :root {\n    --primary-color: " + brand.darkPrimaryColor + ";\n    --secondary-color: " + brand.darkSecondaryColor + ";\n    --accent-color: " + brand.darkAccentColor + ";\n  }\n}";
        var blob = new Blob([css], { type: "text/css" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "brand-customization.css";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        sonner_1.toast.success("CSS file downloaded");
    };
    var handleCopyJSON = function () {
        var json = JSON.stringify(brand, null, 2);
        navigator.clipboard.writeText(json).then(function () {
            setCopied(true);
            sonner_1.toast.success("Brand config copied to clipboard");
            setTimeout(function () { return setCopied(false); }, 2000);
        });
    };
    var handleDownloadJSON = function () {
        var json = JSON.stringify(brand, null, 2);
        var blob = new Blob([json], { type: "application/json" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "brand-config.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        sonner_1.toast.success("JSON file downloaded");
    };
    var primaryColor = darkMode ? brand.darkPrimaryColor : brand.primaryColor;
    var secondaryColor = darkMode ? brand.darkSecondaryColor : brand.secondaryColor;
    var accentColor = darkMode ? brand.darkAccentColor : brand.accentColor;
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Brand Customization", description: "Design and customize your application's visual identity", icon: React.createElement(lucide_react_1.Palette, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Tools", href: "/tools" },
            { label: "Brand Customization" },
        ] },
        React.createElement("div", { className: "space-y-6 max-w-7xl" },
            React.createElement("div", { className: "flex items-center justify-between gap-4" },
                React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement(lucide_react_1.Eye, { className: "h-5 w-5 text-muted-foreground" }),
                    React.createElement("span", { className: "text-sm font-medium" }, "Preview Mode:"),
                    React.createElement(button_1.Button, { variant: darkMode ? "default" : "outline", size: "sm", onClick: function () { return setDarkMode(!darkMode); } }, darkMode ? "🌙 Dark" : "☀️ Light")),
                React.createElement("div", { className: "flex gap-2" },
                    React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleReset, disabled: isLoading },
                        React.createElement(lucide_react_1.RotateCcw, { className: "h-4 w-4 mr-2" }),
                        "Reset to Defaults"),
                    React.createElement(button_1.Button, { size: "sm", onClick: handleSave, disabled: isLoading }, isLoading ? (React.createElement(React.Fragment, null, "Saving...")) : (React.createElement(React.Fragment, null,
                        React.createElement(lucide_react_1.Check, { className: "h-4 w-4 mr-2" }),
                        "Save Changes"))))),
            React.createElement("div", { className: "grid gap-6 lg:grid-cols-3" },
                React.createElement("div", { className: "lg:col-span-1 space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, { className: "text-lg" }, "Brand Colors"),
                            React.createElement(card_1.CardDescription, null, "Customize your brand appearance")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("div", { className: "space-y-4" },
                                React.createElement("div", null,
                                    React.createElement(label_1.Label, { className: "text-sm" }, "Primary Color"),
                                    React.createElement("div", { className: "flex gap-2 mt-1" },
                                        React.createElement(input_1.Input, { type: "color", value: brand.primaryColor, onChange: function (e) {
                                                return handleBrandChange("primaryColor", e.target.value);
                                            }, className: "w-12 h-10 cursor-pointer" }),
                                        React.createElement(input_1.Input, { type: "text", value: brand.primaryColor, onChange: function (e) {
                                                return handleBrandChange("primaryColor", normalizeHexColor(e.target.value));
                                            }, className: "flex-1 font-mono text-xs" }))),
                                React.createElement("div", null,
                                    React.createElement(label_1.Label, { className: "text-sm" }, "Secondary Color"),
                                    React.createElement("div", { className: "flex gap-2 mt-1" },
                                        React.createElement(input_1.Input, { type: "color", value: brand.secondaryColor, onChange: function (e) {
                                                return handleBrandChange("secondaryColor", e.target.value);
                                            }, className: "w-12 h-10 cursor-pointer" }),
                                        React.createElement(input_1.Input, { type: "text", value: brand.secondaryColor, onChange: function (e) {
                                                return handleBrandChange("secondaryColor", normalizeHexColor(e.target.value));
                                            }, className: "flex-1 font-mono text-xs" }))),
                                React.createElement("div", null,
                                    React.createElement(label_1.Label, { className: "text-sm" }, "Accent Color"),
                                    React.createElement("div", { className: "flex gap-2 mt-1" },
                                        React.createElement(input_1.Input, { type: "color", value: brand.accentColor, onChange: function (e) {
                                                return handleBrandChange("accentColor", e.target.value);
                                            }, className: "w-12 h-10 cursor-pointer" }),
                                        React.createElement(input_1.Input, { type: "text", value: brand.accentColor, onChange: function (e) {
                                                return handleBrandChange("accentColor", normalizeHexColor(e.target.value));
                                            }, className: "flex-1 font-mono text-xs" }))),
                                React.createElement(separator_1.Separator, { className: "my-2" }),
                                React.createElement(label_1.Label, { className: "text-xs font-semibold" }, "Dark Mode Colors"),
                                React.createElement("div", null,
                                    React.createElement(label_1.Label, { className: "text-sm" }, "Dark Primary"),
                                    React.createElement("div", { className: "flex gap-2 mt-1" },
                                        React.createElement(input_1.Input, { type: "color", value: brand.darkPrimaryColor, onChange: function (e) {
                                                return handleBrandChange("darkPrimaryColor", e.target.value);
                                            }, className: "w-12 h-10 cursor-pointer" }),
                                        React.createElement(input_1.Input, { type: "text", value: brand.darkPrimaryColor, onChange: function (e) {
                                                return handleBrandChange("darkPrimaryColor", normalizeHexColor(e.target.value));
                                            }, className: "flex-1 font-mono text-xs" }))),
                                React.createElement("div", null,
                                    React.createElement(label_1.Label, { className: "text-sm" }, "Dark Secondary"),
                                    React.createElement("div", { className: "flex gap-2 mt-1" },
                                        React.createElement(input_1.Input, { type: "color", value: brand.darkSecondaryColor, onChange: function (e) {
                                                return handleBrandChange("darkSecondaryColor", e.target.value);
                                            }, className: "w-12 h-10 cursor-pointer" }),
                                        React.createElement(input_1.Input, { type: "text", value: brand.darkSecondaryColor, onChange: function (e) {
                                                return handleBrandChange("darkSecondaryColor", normalizeHexColor(e.target.value));
                                            }, className: "flex-1 font-mono text-xs" }))),
                                React.createElement("div", null,
                                    React.createElement(label_1.Label, { className: "text-sm" }, "Dark Accent"),
                                    React.createElement("div", { className: "flex gap-2 mt-1" },
                                        React.createElement(input_1.Input, { type: "color", value: brand.darkAccentColor, onChange: function (e) {
                                                return handleBrandChange("darkAccentColor", e.target.value);
                                            }, className: "w-12 h-10 cursor-pointer" }),
                                        React.createElement(input_1.Input, { type: "text", value: brand.darkAccentColor, onChange: function (e) {
                                                return handleBrandChange("darkAccentColor", normalizeHexColor(e.target.value));
                                            }, className: "flex-1 font-mono text-xs" }))),
                                React.createElement(separator_1.Separator, { className: "my-4" }),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(button_1.Button, { onClick: handleCopyJSON, className: "w-full", variant: "outline" }, copied ? (React.createElement(React.Fragment, null,
                                        React.createElement(lucide_react_1.Check, { className: "h-4 w-4 mr-2" }),
                                        "Copied!")) : (React.createElement(React.Fragment, null,
                                        React.createElement(lucide_react_1.Copy, { className: "h-4 w-4 mr-2" }),
                                        "Copy JSON"))),
                                    React.createElement(button_1.Button, { onClick: handleDownloadJSON, className: "w-full", variant: "outline" },
                                        React.createElement(lucide_react_1.Download, { className: "h-4 w-4 mr-2" }),
                                        "Download JSON"),
                                    React.createElement(button_1.Button, { onClick: handleDownloadCSS, className: "w-full", variant: "outline" },
                                        React.createElement(lucide_react_1.Download, { className: "h-4 w-4 mr-2" }),
                                        "Download CSS")))))),
                React.createElement("div", { className: "lg:col-span-2 space-y-6" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                React.createElement(lucide_react_1.Palette, { className: "h-4 w-4" }),
                                "Color Palette Preview")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement("p", { className: "text-sm font-medium text-muted-foreground" }, "Primary"),
                                    React.createElement("div", { className: "h-24 rounded-lg border transition-all", style: {
                                            backgroundColor: primaryColor,
                                            borderColor: primaryColor
                                        } }),
                                    React.createElement("p", { className: "text-xs text-muted-foreground font-mono" }, primaryColor)),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement("p", { className: "text-sm font-medium text-muted-foreground" }, "Secondary"),
                                    React.createElement("div", { className: "h-24 rounded-lg border transition-all", style: {
                                            backgroundColor: secondaryColor,
                                            borderColor: secondaryColor
                                        } }),
                                    React.createElement("p", { className: "text-xs text-muted-foreground font-mono" }, secondaryColor)),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement("p", { className: "text-sm font-medium text-muted-foreground" }, "Accent"),
                                    React.createElement("div", { className: "h-24 rounded-lg border transition-all", style: {
                                            backgroundColor: accentColor,
                                            borderColor: accentColor
                                        } }),
                                    React.createElement("p", { className: "text-xs text-muted-foreground font-mono" }, accentColor))))),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Component Preview"),
                            React.createElement(card_1.CardDescription, null, "See how your colors work together")),
                        React.createElement(card_1.CardContent, { className: "space-y-4" },
                            React.createElement("div", { className: "flex flex-wrap gap-2" },
                                React.createElement(button_1.Button, { style: {
                                        backgroundColor: primaryColor,
                                        color: darkMode ? 'white' : 'white'
                                    } }, "Primary Button"),
                                React.createElement(button_1.Button, { variant: "outline", style: {
                                        borderColor: secondaryColor,
                                        color: secondaryColor
                                    } }, "Secondary Button"),
                                React.createElement(button_1.Button, { style: {
                                        backgroundColor: accentColor,
                                        color: 'white'
                                    } }, "Accent Button")))))))));
}
exports["default"] = BrandCustomization;
