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
exports.useBrandStore = exports.useBrand = exports.BrandProvider = void 0;
var react_1 = require("react");
var customizationBroadcast_1 = require("@/hooks/customizationBroadcast");
/** Strip any base64 data-URL values (logos etc.) before persisting to localStorage.
 *  These belong in the DB/API, not in a ~5 MB localStorage quota. */
function stripLargeValues(obj) {
    var result = {};
    for (var _i = 0, _a = Object.keys(obj); _i < _a.length; _i++) {
        var key = _a[_i];
        var val = obj[key];
        if (typeof val === 'string' && (val.startsWith('data:') || val.length > 8192)) {
            // Skip base64 data-URLs and unexpectedly large strings
            continue;
        }
        result[key] = val;
    }
    return result;
}
function safeSetItem(key, value) {
    try {
        localStorage.setItem(key, value);
    }
    catch (e) {
        if ((e === null || e === void 0 ? void 0 : e.name) === 'QuotaExceededError' || (e === null || e === void 0 ? void 0 : e.code) === 22) {
            try {
                // Re-try with large fields stripped
                var parsed = JSON.parse(value);
                localStorage.setItem(key, JSON.stringify(stripLargeValues(parsed)));
            }
            catch (_a) {
                console.warn("[BrandContext] Could not persist \"" + key + "\" to localStorage \u2013 quota exceeded.");
            }
        }
    }
}
var BrandContext = react_1.createContext(undefined);
function BrandProvider(_a) {
    var children = _a.children;
    var _b = react_1.useState(function () {
        try {
            var stored = localStorage.getItem('kiini_brand_config');
            return stored ? JSON.parse(stored) : {};
        }
        catch (_a) {
            return {};
        }
    }), brandConfig = _b[0], setBrandConfig = _b[1];
    var _c = react_1.useState(function () {
        try {
            var stored = localStorage.getItem('kiini_company_brand');
            return stored ? JSON.parse(stored) : {};
        }
        catch (_a) {
            return {};
        }
    }), companyBrand = _c[0], setCompanyBrand = _c[1];
    var updateBrandConfig = function (config) {
        setBrandConfig(function (prev) { return (__assign(__assign({}, prev), config)); });
    };
    var updateCompanyBrand = function (brand) {
        setCompanyBrand(function (prev) { return (__assign(__assign({}, prev), brand)); });
    };
    var applyBrandToDOM = function () {
        var root = document.documentElement;
        // Brand sets only --brand-* scoped CSS vars + sidebar accent
        // Theme Customization controls --primary/--secondary/--accent (UI appearance)
        if (brandConfig.primaryColor) {
            root.style.setProperty('--brand-primary', brandConfig.primaryColor);
            root.style.setProperty('--sidebar-primary', brandConfig.primaryColor);
        }
        if (brandConfig.secondaryColor) {
            root.style.setProperty('--brand-secondary', brandConfig.secondaryColor);
        }
        if (brandConfig.accentColor) {
            root.style.setProperty('--brand-accent', brandConfig.accentColor);
        }
        if (brandConfig.fontFamily) {
            root.style.setProperty('--font-family', brandConfig.fontFamily);
            document.body.style.fontFamily = brandConfig.fontFamily;
        }
    };
    // Persist to localStorage whenever brand config changes
    react_1.useEffect(function () {
        if (Object.keys(brandConfig).length > 0) {
            safeSetItem('kiini_brand_config', JSON.stringify(brandConfig));
            applyBrandToDOM();
            customizationBroadcast_1.broadcastBrandUpdate(brandConfig, companyBrand);
        }
    }, [brandConfig]);
    // Persist company brand to localStorage
    react_1.useEffect(function () {
        safeSetItem('kiini_company_brand', JSON.stringify(companyBrand));
    }, [companyBrand]);
    return (react_1["default"].createElement(BrandContext.Provider, { value: { brandConfig: brandConfig, companyBrand: companyBrand, updateBrandConfig: updateBrandConfig, updateCompanyBrand: updateCompanyBrand, applyBrandToDOM: applyBrandToDOM } }, children));
}
exports.BrandProvider = BrandProvider;
function useBrand() {
    var context = react_1.useContext(BrandContext);
    if (!context) {
        throw new Error('useBrand must be used within BrandProvider');
    }
    return context;
}
exports.useBrand = useBrand;
// For store-like interface compatibility
exports.useBrandStore = useBrand;
