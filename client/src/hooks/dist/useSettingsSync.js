"use strict";
exports.__esModule = true;
exports.useSettingsSync = void 0;
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var useAuth_1 = require("@/_core/hooks/useAuth");
var BrandContext_1 = require("@/contexts/BrandContext");
var SystemSettingsContext_1 = require("@/contexts/SystemSettingsContext");
var CurrencyContext_1 = require("@/pages/website/CurrencyContext");
var ThemeCustomizationContext_1 = require("@/contexts/ThemeCustomizationContext");
/**
 * Fetches settings from the DB and syncs them to the frontend contexts.
 * Should be called once inside authenticated layouts (DashboardLayout, OrgLayout).
 */
function useSettingsSync() {
    var user = useAuth_1.useAuth().user;
    var lastDataRef = react_1.useRef('');
    var _a = BrandContext_1.useBrand(), updateBrandConfig = _a.updateBrandConfig, updateCompanyBrand = _a.updateCompanyBrand;
    var updateSettings = SystemSettingsContext_1.useSystemSettings().updateSettings;
    var setCurrency = CurrencyContext_1.useCurrency().setCurrency;
    var updateThemeConfig = ThemeCustomizationContext_1.useThemeCustomization().updateThemeConfig;
    var data = trpc_1.trpc.settings.getPublicSettings.useQuery(undefined, {
        enabled: !!user,
        staleTime: 60 * 1000,
        refetchOnWindowFocus: true
    }).data;
    react_1.useEffect(function () {
        if (!data)
            return;
        // Only re-sync when data actually changes
        var dataHash = JSON.stringify(data);
        if (dataHash === lastDataRef.current)
            return;
        lastDataRef.current = dataHash;
        var general = data.general, currency = data.currency, theme = data.theme, logos = data.logos;
        // ── Company name → BrandContext ─────────────────────────
        if (general.companyName) {
            updateBrandConfig({ companyName: general.companyName, brandName: general.companyName });
            updateCompanyBrand({ companyName: general.companyName });
        }
        // ── General settings → SystemSettingsContext ─────────────
        updateSettings({
            dateFormat: general.dateFormat || undefined,
            timezone: general.timezone || undefined,
            leftMenuPosition: general.leftMenuPosition || undefined
        });
        // ── Currency → CurrencyContext ──────────────────────────
        // Settings page saves as "defaultCurrency", fallback to "currency" or general.currency
        var currCode = currency.defaultCurrency || currency.currency || general.currency;
        if (currCode) {
            var validCurrency = CurrencyContext_1.CURRENCIES.find(function (c) { return c.code === currCode; });
            if (validCurrency) {
                setCurrency(currCode);
            }
        }
        // ── Theme settings → ThemeCustomizationContext ───────────
        // Map Settings page keys to ThemeCustomizationContext keys
        if (Object.keys(theme).length > 0) {
            var mapped = {};
            if (theme.primaryColor) {
                mapped.customLightPrimary = theme.primaryColor;
                mapped.customDarkPrimary = theme.primaryColor;
                mapped.accentColor = theme.primaryColor;
            }
            if (theme.secondaryColor) {
                mapped.customLightSecondary = theme.secondaryColor;
                mapped.customDarkSecondary = theme.secondaryColor;
            }
            if (theme.sidebarColor) {
                mapped.customDarkBackground = theme.sidebarColor;
                mapped.sidebarBackgroundDark = theme.sidebarColor;
            }
            if (theme.headerColor) {
                mapped.customLightSurface = theme.headerColor;
                mapped.navBackgroundLight = theme.headerColor;
            }
            if (theme.fontFamily) {
                mapped.fontFamily = theme.fontFamily;
                mapped.bodyFont = theme.fontFamily;
                mapped.headingFont = theme.fontFamily;
            }
            if (theme.borderRadius) {
                mapped.borderRadius = theme.borderRadius;
                mapped.buttonBorderRadius = theme.borderRadius;
            }
            if (theme.compactMode !== undefined) {
                mapped.compactMode = theme.compactMode === true || theme.compactMode === 'true';
            }
            if (theme.sidebarStyle)
                mapped.sidebarStyle = theme.sidebarStyle;
            if (theme.cssStyle)
                mapped.customCSS = theme.cssStyle;
            updateThemeConfig(mapped);
        }
        // ── Logos → BrandContext ──────────────────────────────────
        // Settings page saves as "largeLogo" and "smallLogo"
        var logoUrl = logos.largeLogo || logos.smallLogo;
        if (logoUrl) {
            updateBrandConfig({ brandLogoUrl: logoUrl });
        }
    }, [data]);
    return { data: data };
}
exports.useSettingsSync = useSettingsSync;
