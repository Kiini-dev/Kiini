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
var BrandContext_1 = require("@/contexts/BrandContext");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var tabs_1 = require("@/components/ui/tabs");
var select_1 = require("@/components/ui/select");
var separator_1 = require("@/components/ui/separator");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var DEFAULT_BRAND = {
    // Primary Colors
    primaryColor: "#3B82F6",
    secondaryColor: "#10B981",
    accentColor: "#F59E0B",
    // Dark Mode Colors
    darkPrimaryColor: "#60A5FA",
    darkSecondaryColor: "#34D399",
    darkAccentColor: "#FBBF24",
    // Neutral Colors
    lightGray: "#F3F4F6",
    darkGray: "#374151",
    lightText: "#FFFFFF",
    darkText: "#1F2937",
    // Typography
    fontFamily: "Inter",
    headingFontSize: "32",
    bodyFontSize: "14",
    // Button Styles
    buttonBorderRadius: "8",
    buttonPadding: "12",
    buttonFontWeight: "500"
};
// Utility functions for color validation and formatting
var isValidHexColor = function (color) {
    return /^#[0-9A-F]{6}$/i.test(color);
};
var normalizeHexColor = function (color) {
    // Remove any spaces and convert to uppercase
    color = color.trim().toUpperCase();
    // If it doesn't start with #, add it
    if (!color.startsWith('#')) {
        color = '#' + color;
    }
    // Extract only hex characters
    var hexMatch = color.match(/#?([0-9A-F]{6})/i);
    if (hexMatch) {
        return '#' + hexMatch[1].toUpperCase();
    }
    // If invalid, return default
    return '#3B82F6';
};
var formatBrandConfig = function (config) {
    // Ensure all color fields are valid hex colors
    return {
        primaryColor: isValidHexColor(config.primaryColor) ? config.primaryColor : normalizeHexColor(config.primaryColor),
        secondaryColor: isValidHexColor(config.secondaryColor) ? config.secondaryColor : normalizeHexColor(config.secondaryColor),
        accentColor: isValidHexColor(config.accentColor) ? config.accentColor : normalizeHexColor(config.accentColor),
        darkPrimaryColor: isValidHexColor(config.darkPrimaryColor) ? config.darkPrimaryColor : normalizeHexColor(config.darkPrimaryColor),
        darkSecondaryColor: isValidHexColor(config.darkSecondaryColor) ? config.darkSecondaryColor : normalizeHexColor(config.darkSecondaryColor),
        darkAccentColor: isValidHexColor(config.darkAccentColor) ? config.darkAccentColor : normalizeHexColor(config.darkAccentColor),
        lightGray: isValidHexColor(config.lightGray) ? config.lightGray : normalizeHexColor(config.lightGray),
        darkGray: isValidHexColor(config.darkGray) ? config.darkGray : normalizeHexColor(config.darkGray),
        lightText: isValidHexColor(config.lightText) ? config.lightText : normalizeHexColor(config.lightText),
        darkText: isValidHexColor(config.darkText) ? config.darkText : normalizeHexColor(config.darkText),
        fontFamily: config.fontFamily,
        headingFontSize: config.headingFontSize,
        bodyFontSize: config.bodyFontSize,
        buttonBorderRadius: config.buttonBorderRadius,
        buttonPadding: config.buttonPadding,
        buttonFontWeight: config.buttonFontWeight
    };
};
function BrandCustomization() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var updateBrandConfig = BrandContext_1.useBrand().updateBrandConfig;
    var _b = react_1.useState(DEFAULT_BRAND), brand = _b[0], setBrand = _b[1];
    var _c = react_1.useState({
        companyName: "",
        companyDescription: "",
        website: "",
        email: "",
        phone: "",
        address: "",
        tagline: "",
        missionStatement: "",
        primaryBrandColor: "#3B82F6",
        secondaryBrandColor: "#10B981",
        accentBrandColor: "#F59E0B",
        fontFamilyBrand: "Inter",
        brandVoice: "professional"
    }), companyGuide = _c[0], setCompanyGuide = _c[1];
    var _d = react_1.useState(false), darkMode = _d[0], setDarkMode = _d[1];
    var _e = react_1.useState(false), copied = _e[0], setCopied = _e[1];
    var _f = react_1.useState(true), isLoading = _f[0], setIsLoading = _f[1];
    // Load brand config from API
    var _g = trpc_1.trpc.brandCustomization.getConfig.useQuery(), brandConfig = _g.data, isLoadingConfig = _g.isLoading;
    var saveMutation = trpc_1.trpc.brandCustomization.saveConfig.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Brand settings saved successfully!");
        },
        onError: function (error) {
            console.error("Brand save error:", error);
            var errorMessage = (error === null || error === void 0 ? void 0 : error.message) || "Failed to save brand settings";
            sonner_1.toast.error(errorMessage);
        }
    });
    var resetMutation = trpc_1.trpc.brandCustomization.resetToDefault.useMutation({
        onSuccess: function (data) {
            setBrand(data.config);
            sonner_1.toast.success(data.message);
        },
        onError: function (error) {
            console.error("Brand reset error:", error);
            var errorMessage = (error === null || error === void 0 ? void 0 : error.message) || "Failed to reset brand settings";
            sonner_1.toast.error(errorMessage);
        }
    });
    react_1.useEffect(function () {
        if (brandConfig) {
            setBrand(brandConfig);
        }
        setIsLoading(false);
    }, [brandConfig]);
    if (isLoading || isLoadingConfig) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Brand Customization", description: "Design and customize your application's visual identity", icon: React.createElement(lucide_react_1.Palette, { className: "w-6 h-6" }), breadcrumbs: [
                { label: "Dashboard", href: "/crm-home" },
                { label: "Settings", href: "/settings" },
                { label: "Brand Customization" },
            ] },
            React.createElement("div", { className: "flex items-center justify-center p-8" },
                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))));
    }
    var handleBrandChange = function (key, value) {
        // Normalize color values if the key is a color field
        var colorFields = [
            'primaryColor', 'secondaryColor', 'accentColor',
            'darkPrimaryColor', 'darkSecondaryColor', 'darkAccentColor',
            'lightGray', 'darkGray', 'lightText', 'darkText'
        ];
        var normalizedValue = colorFields.includes(key)
            ? normalizeHexColor(value)
            : value;
        setBrand(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[key] = normalizedValue, _a)));
        });
    };
    var handleSave = function () {
        try {
            // Format and validate the entire brand config before saving
            var formattedBrand_1 = formatBrandConfig(brand);
            // Validate all colors before sending
            var colorFields = [
                'primaryColor', 'secondaryColor', 'accentColor',
                'darkPrimaryColor', 'darkSecondaryColor', 'darkAccentColor',
                'lightGray', 'darkGray', 'lightText', 'darkText'
            ];
            var invalidColors = colorFields.filter(function (field) { return !isValidHexColor(formattedBrand_1[field]); });
            if (invalidColors.length > 0) {
                sonner_1.toast.error("Invalid color values: " + invalidColors.join(', '));
                return;
            }
            // Validate numeric fields
            var numericFields = ['headingFontSize', 'bodyFontSize', 'buttonBorderRadius', 'buttonPadding', 'buttonFontWeight'];
            var invalidNumbers = numericFields.filter(function (field) { return !formattedBrand_1[field] || isNaN(Number(formattedBrand_1[field])); });
            if (invalidNumbers.length > 0) {
                sonner_1.toast.error("Invalid numeric values: " + invalidNumbers.join(', '));
                return;
            }
            updateBrandConfig(formattedBrand_1);
            saveMutation.mutate(formattedBrand_1);
        }
        catch (err) {
            console.error("Save validation error:", err);
            sonner_1.toast.error((err === null || err === void 0 ? void 0 : err.message) || "Failed to validate brand settings");
        }
    };
    var handleReset = function () {
        if (confirm("Reset brand settings to defaults?")) {
            resetMutation.mutate();
        }
    };
    var handleDownloadCSS = function () {
        var css = "/* Generated Brand Customization CSS */\n:root {\n  /* Light Mode Colors */\n  --primary-color: " + brand.primaryColor + ";\n  --secondary-color: " + brand.secondaryColor + ";\n  --accent-color: " + brand.accentColor + ";\n  --light-gray: " + brand.lightGray + ";\n  --dark-gray: " + brand.darkGray + ";\n  --light-text: " + brand.lightText + ";\n  --dark-text: " + brand.darkText + ";\n  \n  /* Typography */\n  --font-family: \"" + brand.fontFamily + "\", sans-serif;\n  --heading-font-size: " + brand.headingFontSize + "px;\n  --body-font-size: " + brand.bodyFontSize + "px;\n  \n  /* Button Styles */\n  --button-border-radius: " + brand.buttonBorderRadius + "px;\n  --button-padding: " + brand.buttonPadding + "px;\n  --button-font-weight: " + brand.buttonFontWeight + ";\n}\n\n@media (prefers-color-scheme: dark) {\n  :root {\n    --primary-color: " + brand.darkPrimaryColor + ";\n    --secondary-color: " + brand.darkSecondaryColor + ";\n    --accent-color: " + brand.darkAccentColor + ";\n  }\n}\n\n/* Component Styles */\nbutton, .button {\n  font-family: var(--font-family);\n  border-radius: var(--button-border-radius);\n  padding: var(--button-padding);\n  font-weight: var(--button-font-weight);\n}\n\nh1, h2, h3, h4, h5, h6 {\n  font-family: var(--font-family);\n  font-size: var(--heading-font-size);\n  color: var(--dark-text);\n}\n\n@media (prefers-color-scheme: dark) {\n  h1, h2, h3, h4, h5, h6 {\n    color: var(--light-text);\n  }\n}\n\nbody {\n  font-family: var(--font-family);\n  font-size: var(--body-font-size);\n  color: var(--dark-text);\n  background-color: var(--light-gray);\n}\n\n@media (prefers-color-scheme: dark) {\n  body {\n    color: var(--light-text);\n    background-color: var(--dark-gray);\n  }\n}\n";
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
            { label: "Dashboard", href: "/crm-home" },
            { label: "Settings", href: "/settings" },
            { label: "Brand Customization" },
        ] },
        React.createElement("div", { className: "space-y-6 max-w-7xl" },
            React.createElement("div", { className: "flex items-center justify-between gap-4" },
                React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement(lucide_react_1.Eye, { className: "h-5 w-5 text-muted-foreground" }),
                    React.createElement("span", { className: "text-sm font-medium" }, "Preview Mode:"),
                    React.createElement(button_1.Button, { variant: darkMode ? "default" : "outline", size: "sm", onClick: function () { return setDarkMode(!darkMode); } }, darkMode ? "🌙 Dark" : "☀️ Light")),
                React.createElement("div", { className: "flex gap-2" },
                    React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleReset, disabled: resetMutation.isPending },
                        React.createElement(lucide_react_1.RotateCcw, { className: "h-4 w-4 mr-2" }),
                        "Reset to Defaults"),
                    React.createElement(button_1.Button, { size: "sm", onClick: handleSave, disabled: saveMutation.isPending }, saveMutation.isPending ? (React.createElement(React.Fragment, null,
                        React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
                        "Saving...")) : (React.createElement(React.Fragment, null,
                        React.createElement(lucide_react_1.Check, { className: "h-4 w-4 mr-2" }),
                        "Save Changes"))))),
            React.createElement("div", { className: "grid gap-6 lg:grid-cols-3" },
                React.createElement("div", { className: "lg:col-span-1 space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, { className: "text-lg" }, "Brand Configuration"),
                            React.createElement(card_1.CardDescription, null, "Customize your brand appearance")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement(tabs_1.Tabs, { defaultValue: "colors", className: "w-full" },
                                React.createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-4" },
                                    React.createElement(tabs_1.TabsTrigger, { value: "colors" }, "Colors"),
                                    React.createElement(tabs_1.TabsTrigger, { value: "typography" }, "Typography"),
                                    React.createElement(tabs_1.TabsTrigger, { value: "buttons" }, "Buttons"),
                                    React.createElement(tabs_1.TabsTrigger, { value: "company" }, "Company")),
                                React.createElement(tabs_1.TabsContent, { value: "colors", className: "space-y-4" },
                                    React.createElement("div", { className: "space-y-3" },
                                        React.createElement("div", null,
                                            React.createElement(label_1.Label, { className: "text-sm" }, "Primary Color"),
                                            React.createElement("div", { className: "flex gap-2 mt-1" },
                                                React.createElement(input_1.Input, { type: "color", value: brand.primaryColor, onChange: function (e) {
                                                        return handleBrandChange("primaryColor", e.target.value);
                                                    }, className: "w-12 h-10 cursor-pointer" }),
                                                React.createElement(input_1.Input, { type: "text", value: brand.primaryColor, onChange: function (e) {
                                                        return handleBrandChange("primaryColor", e.target.value);
                                                    }, className: "flex-1 font-mono text-xs" }))),
                                        React.createElement("div", null,
                                            React.createElement(label_1.Label, { className: "text-sm" }, "Secondary Color"),
                                            React.createElement("div", { className: "flex gap-2 mt-1" },
                                                React.createElement(input_1.Input, { type: "color", value: brand.secondaryColor, onChange: function (e) {
                                                        return handleBrandChange("secondaryColor", e.target.value);
                                                    }, className: "w-12 h-10 cursor-pointer" }),
                                                React.createElement(input_1.Input, { type: "text", value: brand.secondaryColor, onChange: function (e) {
                                                        return handleBrandChange("secondaryColor", e.target.value);
                                                    }, className: "flex-1 font-mono text-xs" }))),
                                        React.createElement("div", null,
                                            React.createElement(label_1.Label, { className: "text-sm" }, "Accent Color"),
                                            React.createElement("div", { className: "flex gap-2 mt-1" },
                                                React.createElement(input_1.Input, { type: "color", value: brand.accentColor, onChange: function (e) {
                                                        return handleBrandChange("accentColor", e.target.value);
                                                    }, className: "w-12 h-10 cursor-pointer" }),
                                                React.createElement(input_1.Input, { type: "text", value: brand.accentColor, onChange: function (e) {
                                                        return handleBrandChange("accentColor", e.target.value);
                                                    }, className: "flex-1 font-mono text-xs" }))),
                                        React.createElement(separator_1.Separator, { className: "my-2" }),
                                        React.createElement(label_1.Label, { className: "text-xs font-semibold" }, "Dark Mode"),
                                        React.createElement("div", null,
                                            React.createElement(label_1.Label, { className: "text-sm" }, "Dark Primary"),
                                            React.createElement("div", { className: "flex gap-2 mt-1" },
                                                React.createElement(input_1.Input, { type: "color", value: brand.darkPrimaryColor, onChange: function (e) {
                                                        return handleBrandChange("darkPrimaryColor", e.target.value);
                                                    }, className: "w-12 h-10 cursor-pointer" }),
                                                React.createElement(input_1.Input, { type: "text", value: brand.darkPrimaryColor, onChange: function (e) {
                                                        return handleBrandChange("darkPrimaryColor", e.target.value);
                                                    }, className: "flex-1 font-mono text-xs" }))),
                                        React.createElement("div", null,
                                            React.createElement(label_1.Label, { className: "text-sm" }, "Dark Secondary"),
                                            React.createElement("div", { className: "flex gap-2 mt-1" },
                                                React.createElement(input_1.Input, { type: "color", value: brand.darkSecondaryColor, onChange: function (e) {
                                                        return handleBrandChange("darkSecondaryColor", e.target.value);
                                                    }, className: "w-12 h-10 cursor-pointer" }),
                                                React.createElement(input_1.Input, { type: "text", value: brand.darkSecondaryColor, onChange: function (e) {
                                                        return handleBrandChange("darkSecondaryColor", e.target.value);
                                                    }, className: "flex-1 font-mono text-xs" }))),
                                        React.createElement("div", null,
                                            React.createElement(label_1.Label, { className: "text-sm" }, "Dark Accent"),
                                            React.createElement("div", { className: "flex gap-2 mt-1" },
                                                React.createElement(input_1.Input, { type: "color", value: brand.darkAccentColor, onChange: function (e) {
                                                        return handleBrandChange("darkAccentColor", e.target.value);
                                                    }, className: "w-12 h-10 cursor-pointer" }),
                                                React.createElement(input_1.Input, { type: "text", value: brand.darkAccentColor, onChange: function (e) {
                                                        return handleBrandChange("darkAccentColor", e.target.value);
                                                    }, className: "flex-1 font-mono text-xs" }))))),
                                React.createElement(tabs_1.TabsContent, { value: "typography", className: "space-y-3" },
                                    React.createElement("div", null,
                                        React.createElement(label_1.Label, { className: "text-sm" }, "Font Family"),
                                        React.createElement(select_1.Select, { value: brand.fontFamily, onValueChange: function (value) {
                                                return handleBrandChange("fontFamily", value);
                                            } },
                                            React.createElement(select_1.SelectTrigger, null,
                                                React.createElement(select_1.SelectValue, null)),
                                            React.createElement(select_1.SelectContent, null,
                                                React.createElement(select_1.SelectItem, { value: "Inter" }, "Inter"),
                                                React.createElement(select_1.SelectItem, { value: "Roboto" }, "Roboto"),
                                                React.createElement(select_1.SelectItem, { value: "Poppins" }, "Poppins"),
                                                React.createElement(select_1.SelectItem, { value: "DM Sans" }, "DM Sans"),
                                                React.createElement(select_1.SelectItem, { value: "Outfit" }, "Outfit"),
                                                React.createElement(select_1.SelectItem, { value: "Raleway" }, "Raleway"),
                                                React.createElement(select_1.SelectItem, { value: "Ubuntu" }, "Ubuntu"),
                                                React.createElement(select_1.SelectItem, { value: "Lato" }, "Lato")))),
                                    React.createElement("div", null,
                                        React.createElement(label_1.Label, { className: "text-sm" }, "Heading Font Size (px)"),
                                        React.createElement(input_1.Input, { type: "number", min: "14", max: "96", value: brand.headingFontSize, onChange: function (e) {
                                                return handleBrandChange("headingFontSize", e.target.value);
                                            } })),
                                    React.createElement("div", null,
                                        React.createElement(label_1.Label, { className: "text-sm" }, "Body Font Size (px)"),
                                        React.createElement(input_1.Input, { type: "number", min: "10", max: "24", value: brand.bodyFontSize, onChange: function (e) {
                                                return handleBrandChange("bodyFontSize", e.target.value);
                                            } }))),
                                React.createElement(tabs_1.TabsContent, { value: "buttons", className: "space-y-3" },
                                    React.createElement("div", null,
                                        React.createElement(label_1.Label, { className: "text-sm" }, "Border Radius (px)"),
                                        React.createElement(input_1.Input, { type: "number", min: "0", max: "32", value: brand.buttonBorderRadius, onChange: function (e) {
                                                return handleBrandChange("buttonBorderRadius", e.target.value);
                                            } })),
                                    React.createElement("div", null,
                                        React.createElement(label_1.Label, { className: "text-sm" }, "Padding (px)"),
                                        React.createElement(input_1.Input, { type: "number", min: "4", max: "24", value: brand.buttonPadding, onChange: function (e) {
                                                return handleBrandChange("buttonPadding", e.target.value);
                                            } })),
                                    React.createElement("div", null,
                                        React.createElement(label_1.Label, { className: "text-sm" }, "Font Weight"),
                                        React.createElement(select_1.Select, { value: brand.buttonFontWeight, onValueChange: function (value) {
                                                return handleBrandChange("buttonFontWeight", value);
                                            } },
                                            React.createElement(select_1.SelectTrigger, null,
                                                React.createElement(select_1.SelectValue, null)),
                                            React.createElement(select_1.SelectContent, null,
                                                React.createElement(select_1.SelectItem, { value: "400" }, "Regular (400)"),
                                                React.createElement(select_1.SelectItem, { value: "500" }, "Medium (500)"),
                                                React.createElement(select_1.SelectItem, { value: "600" }, "Semibold (600)"),
                                                React.createElement(select_1.SelectItem, { value: "700" }, "Bold (700)"))))),
                                React.createElement(tabs_1.TabsContent, { value: "company", className: "space-y-3" },
                                    React.createElement("div", { className: "space-y-3" },
                                        React.createElement("div", null,
                                            React.createElement(label_1.Label, { className: "text-sm" }, "Company Name"),
                                            React.createElement(input_1.Input, { placeholder: "e.g., Your Company", value: companyGuide.companyName, onChange: function (e) {
                                                    return setCompanyGuide(__assign(__assign({}, companyGuide), { companyName: e.target.value }));
                                                }, className: "mt-1" })),
                                        React.createElement("div", null,
                                            React.createElement(label_1.Label, { className: "text-sm" }, "Tagline"),
                                            React.createElement(input_1.Input, { placeholder: "e.g., Smart CRM Solutions", value: companyGuide.tagline, onChange: function (e) {
                                                    return setCompanyGuide(__assign(__assign({}, companyGuide), { tagline: e.target.value }));
                                                }, className: "mt-1" })),
                                        React.createElement("div", null,
                                            React.createElement(label_1.Label, { className: "text-sm" }, "Brand Voice"),
                                            React.createElement(select_1.Select, { value: companyGuide.brandVoice, onValueChange: function (value) {
                                                    return setCompanyGuide(__assign(__assign({}, companyGuide), { brandVoice: value }));
                                                } },
                                                React.createElement(select_1.SelectTrigger, { className: "mt-1" },
                                                    React.createElement(select_1.SelectValue, null)),
                                                React.createElement(select_1.SelectContent, null,
                                                    React.createElement(select_1.SelectItem, { value: "professional" }, "Professional"),
                                                    React.createElement(select_1.SelectItem, { value: "friendly" }, "Friendly"),
                                                    React.createElement(select_1.SelectItem, { value: "creative" }, "Creative"),
                                                    React.createElement(select_1.SelectItem, { value: "corporate" }, "Corporate")))),
                                        React.createElement("div", null,
                                            React.createElement(label_1.Label, { className: "text-sm" }, "Primary Brand Color"),
                                            React.createElement("div", { className: "flex gap-2 mt-1" },
                                                React.createElement(input_1.Input, { type: "color", value: companyGuide.primaryBrandColor, onChange: function (e) {
                                                        return setCompanyGuide(__assign(__assign({}, companyGuide), { primaryBrandColor: normalizeHexColor(e.target.value) }));
                                                    }, className: "w-12 h-10 cursor-pointer" }),
                                                React.createElement(input_1.Input, { type: "text", value: companyGuide.primaryBrandColor, onChange: function (e) {
                                                        return setCompanyGuide(__assign(__assign({}, companyGuide), { primaryBrandColor: normalizeHexColor(e.target.value) }));
                                                    }, className: "flex-1 font-mono text-xs" })))))),
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
                                    "Download CSS"))))),
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
                                    React.createElement("p", { className: "text-xs text-muted-foreground" }, primaryColor)),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement("p", { className: "text-sm font-medium text-muted-foreground" }, "Secondary"),
                                    React.createElement("div", { className: "h-24 rounded-lg border transition-all", style: {
                                            backgroundColor: secondaryColor,
                                            borderColor: secondaryColor
                                        } }),
                                    React.createElement("p", { className: "text-xs text-muted-foreground" }, secondaryColor)),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement("p", { className: "text-sm font-medium text-muted-foreground" }, "Accent"),
                                    React.createElement("div", { className: "h-24 rounded-lg border transition-all", style: {
                                            backgroundColor: accentColor,
                                            borderColor: accentColor
                                        } }),
                                    React.createElement("p", { className: "text-xs text-muted-foreground" }, accentColor))))),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                React.createElement(lucide_react_1.Zap, { className: "h-4 w-4" }),
                                "Button Styles Preview")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("div", { className: "space-y-4" },
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-sm font-medium text-muted-foreground mb-2" }, "Solid Buttons"),
                                    React.createElement("div", { className: "flex flex-wrap gap-2" },
                                        React.createElement("button", { style: {
                                                backgroundColor: primaryColor,
                                                color: "#fff",
                                                borderRadius: brand.buttonBorderRadius + "px",
                                                padding: brand.buttonPadding + "px " + brand.buttonPadding * 2 + "px",
                                                fontWeight: brand.buttonFontWeight,
                                                border: "none",
                                                cursor: "pointer"
                                            } }, "Primary"),
                                        React.createElement("button", { style: {
                                                backgroundColor: secondaryColor,
                                                color: "#fff",
                                                borderRadius: brand.buttonBorderRadius + "px",
                                                padding: brand.buttonPadding + "px " + brand.buttonPadding * 2 + "px",
                                                fontWeight: brand.buttonFontWeight,
                                                border: "none",
                                                cursor: "pointer"
                                            } }, "Secondary"),
                                        React.createElement("button", { style: {
                                                backgroundColor: accentColor,
                                                color: "#000",
                                                borderRadius: brand.buttonBorderRadius + "px",
                                                padding: brand.buttonPadding + "px " + brand.buttonPadding * 2 + "px",
                                                fontWeight: brand.buttonFontWeight,
                                                border: "none",
                                                cursor: "pointer"
                                            } }, "Accent"))),
                                React.createElement(separator_1.Separator, null),
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-sm font-medium text-muted-foreground mb-2" }, "Outline Buttons"),
                                    React.createElement("div", { className: "flex flex-wrap gap-2" },
                                        React.createElement("button", { style: {
                                                backgroundColor: "transparent",
                                                color: primaryColor,
                                                borderRadius: brand.buttonBorderRadius + "px",
                                                padding: brand.buttonPadding + "px " + brand.buttonPadding * 2 + "px",
                                                fontWeight: brand.buttonFontWeight,
                                                border: "2px solid " + primaryColor,
                                                cursor: "pointer"
                                            } }, "Primary"),
                                        React.createElement("button", { style: {
                                                backgroundColor: "transparent",
                                                color: secondaryColor,
                                                borderRadius: brand.buttonBorderRadius + "px",
                                                padding: brand.buttonPadding + "px " + brand.buttonPadding * 2 + "px",
                                                fontWeight: brand.buttonFontWeight,
                                                border: "2px solid " + secondaryColor,
                                                cursor: "pointer"
                                            } }, "Secondary"),
                                        React.createElement("button", { style: {
                                                backgroundColor: "transparent",
                                                color: accentColor,
                                                borderRadius: brand.buttonBorderRadius + "px",
                                                padding: brand.buttonPadding + "px " + brand.buttonPadding * 2 + "px",
                                                fontWeight: brand.buttonFontWeight,
                                                border: "2px solid " + accentColor,
                                                cursor: "pointer"
                                            } }, "Accent")))))),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                React.createElement(lucide_react_1.Type, { className: "h-4 w-4" }),
                                "Typography Preview")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("div", { className: "space-y-4" },
                                React.createElement("div", { style: {
                                        fontFamily: "\"" + brand.fontFamily + "\", sans-serif",
                                        fontSize: brand.headingFontSize + "px",
                                        fontWeight: brand.buttonFontWeight
                                    } }, "Heading Text (H1)"),
                                React.createElement("div", { style: {
                                        fontFamily: "\"" + brand.fontFamily + "\", sans-serif",
                                        fontSize: Math.round(Number(brand.headingFontSize) * 0.75) + "px",
                                        fontWeight: brand.buttonFontWeight
                                    } }, "Subheading Text (H3)"),
                                React.createElement("div", { style: {
                                        fontFamily: "\"" + brand.fontFamily + "\", sans-serif",
                                        fontSize: brand.bodyFontSize + "px"
                                    } },
                                    "Body text with regular font weight. This is how your content will appear to users. The font family is set to ",
                                    brand.fontFamily,
                                    ".")))))))));
}
exports["default"] = BrandCustomization;
