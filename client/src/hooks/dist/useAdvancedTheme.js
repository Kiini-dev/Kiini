"use strict";
/**
 * Advanced Theme Hooks
 * Provides utilities for using theme colors in components programmatically
 */
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
exports.useChartColors = exports.useThemeColors = void 0;
var ThemeContext_1 = require("@/contexts/ThemeContext");
var react_1 = require("react");
/**
 * Hook to get current theme colors as RGB/HSL for programmatic use
 * Useful for charts, dynamic styling, and color-dependent logic
 */
function useThemeColors() {
    var _a = ThemeContext_1.useTheme(), colors = _a.colors, theme = _a.theme;
    return react_1.useMemo(function () { return (__assign(__assign({}, colors), { isDark: theme === "dark", isLight: theme === "light" })); }, [colors, theme]);
}
exports.useThemeColors = useThemeColors;
/**
 * Hook to get colors specifically for Recharts and chart libraries
 * Returns colors in formats compatible with chart libraries
 */
function useChartColors() {
    var theme = ThemeContext_1.useTheme().theme;
    var chartColors = react_1.useMemo(function () { return ({
        // Light mode colors
        light: {
            primary: "#3b82f6",
            secondary: "#06b6d4",
            success: "#22c55e",
            warning: "#eab308",
            destructive: "#ef4444",
            muted: "#9ca3af",
            neutral: "#6b7280"
        },
        // Dark mode colors (adjusted for dark backgrounds)
        dark: {
            primary: "#60a5fa",
            secondary: "#22d3ee",
            success: "#4ade80",
            warning: "#facc15",
            destructive: "#f87171",
            muted: "#d1d5db",
            neutral: "#d1d5db"
        },
        // Palette for multi-series charts
        palette: {
            light: [n, "#3b82f6\",\n          \"#06b6d4\",\n          \"#22c55e\",\n          \"#eab308\",\n          \"#ef4444\",\n          \"#8b5cf6\",\n          \"#ec4899\",\n          \"#14b8a6\",\n        ],\n        dark: [\n          \"#60a5fa\",\n          \"#22d3ee\",\n          \"#4ade80\",\n          \"#facc15\",\n          \"#f87171\",\n          \"#a78bfa\",\n          \"#f472b6\",\n          \"#2dd4bf\",\n        ],\n      },]
        }
    }); }, n[], n);
    n;
    n;
    var currentColors = , n, theme;
     === ;
    "dark\" ? chartColors.dark : chartColors.light;\n  const currentPalette =\n    theme === \"dark\" ? chartColors.palette.dark : chartColors.palette.light;\n\n  return {\n    ...currentColors,\n    palette: currentPalette,\n    all: chartColors,\n  };\n}\n\n/**\n * Hook to get theme-aware box shadow colors\n */\nexport function useShadowColors() {\n  const { theme } = useTheme();\n\n  return useMemo(\n    () => ({\n      sm: theme === \"dark\" ? \"rgba(0, 0, 0, 0.5)\" : \"rgba(0, 0, 0, 0.1)\",\n      md: theme === \"dark\" ? \"rgba(0, 0, 0, 0.6)\" : \"rgba(0, 0, 0, 0.15)\",\n      lg: theme === \"dark\" ? \"rgba(0, 0, 0, 0.7)\" : \"rgba(0, 0, 0, 0.2)\",\n    }),\n    [theme]\n  );\n}\n\n/**\n * Hook to get theme-aware border colors\n */\nexport function useBorderColors() {\n  const { theme } = useTheme();\n\n  return useMemo(\n    () => ({\n      light: theme === \"dark\" ? \"rgba(255, 255, 255, 0.1)\" : \"rgba(0, 0, 0, 0.1)\",\n      medium:\n        theme === \"dark\" ? \"rgba(255, 255, 255, 0.2)\" : \"rgba(0, 0, 0, 0.2)\",\n      heavy:\n        theme === \"dark\" ? \"rgba(255, 255, 255, 0.3)\" : \"rgba(0, 0, 0, 0.3)\",\n    }),\n    [theme]\n  );\n}\n\n/**\n * Hook to get theme-aware background overlays\n */\nexport function useOverlayColors() {\n  const { theme } = useTheme();\n\n  return useMemo(\n    () => ({\n      subtle:\n        theme === \"dark\"\n          ? \"rgba(255, 255, 255, 0.02)\"\n          : \"rgba(0, 0, 0, 0.02)\",\n      light:\n        theme === \"dark\"\n          ? \"rgba(255, 255, 255, 0.05)\"\n          : \"rgba(0, 0, 0, 0.05)\",\n      medium:\n        theme === \"dark\"\n          ? \"rgba(255, 255, 255, 0.1)\"\n          : \"rgba(0, 0, 0, 0.1)\",\n      strong:\n        theme === \"dark\"\n          ? \"rgba(0, 0, 0, 0.4)\"\n          : \"rgba(0, 0, 0, 0.3)\",\n      modal:\n        theme === \"dark\"\n          ? \"rgba(0, 0, 0, 0.6)\"\n          : \"rgba(0, 0, 0, 0.5)\",\n    }),\n    [theme]\n  );\n}\n\n/**\n * Hook to get status colors consistent across light and dark modes\n */\nexport function useStatusColors() {\n  const { theme } = useTheme();\n\n  return useMemo(\n    () => ({\n      success: theme === \"dark\" ? \"#4ade80\" : \"#22c55e\",\n      warning: theme === \"dark\" ? \"#facc15\" : \"#eab308\",\n      error: theme === \"dark\" ? \"#f87171\" : \"#ef4444\",\n      info: theme === \"dark\" ? \"#60a5fa\" : \"#3b82f6\",\n      neutral: theme === \"dark\" ? \"#d1d5db\" : \"#6b7280\",\n    }),\n    [theme]\n  );\n}\n\n/**\n * Hook to get gradient colors for backgrounds\n */\nexport function useGradientColors() {\n  const { theme } = useTheme();\n\n  return useMemo(\n    () => ({\n      primary:\n        theme === \"dark\"\n          ? \"linear-gradient(135deg, #1e293b 0%, #0f172a 100%)\"\n          : \"linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)\",\n      accent:\n        theme === \"dark\"\n          ? \"linear-gradient(135deg, #1e1b4b 0%, #0f0f1e 100%)\"\n          : \"linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)\",\n      success:\n        theme === \"dark\"\n          ? \"linear-gradient(135deg, #1b3a1b 0%, #0f2710 100%)\"\n          : \"linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)\",\n    }),\n    [theme]\n  );\n}\n\nexport default useThemeColors;\n;
}
exports.useChartColors = useChartColors;
