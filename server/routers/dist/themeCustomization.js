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
exports.themeCustomizationRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var readProcedure = trpc_1.createFeatureRestrictedProcedure("settings:view");
var writeProcedure = trpc_1.createFeatureRestrictedProcedure("settings:edit");
// Zod schema for theme configuration
var ThemePresetSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    backgroundColor: zod_1.z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
    surfaceColor: zod_1.z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
    textColor: zod_1.z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
    mutedColor: zod_1.z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color")
});
var CardBackgroundSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    lightMode: zod_1.z.string(),
    darkMode: zod_1.z.string()
});
var ThemeConfigSchema = zod_1.z.object({
    darkModePreset: zod_1.z.string()["default"]("slate_dark"),
    cardBackgroundStyle: zod_1.z.string()["default"]("solid"),
    customDarkPresets: zod_1.z.array(ThemePresetSchema).optional(),
    customCardStyles: zod_1.z.array(CardBackgroundSchema).optional(),
    customDarkBackground: zod_1.z.string().optional(),
    customDarkSurface: zod_1.z.string().optional(),
    customDarkText: zod_1.z.string().optional(),
    customCardBackground: zod_1.z.string().optional(),
    customCardForeground: zod_1.z.string().optional(),
    customCSS: zod_1.z.string().optional(),
    customDarkPrimary: zod_1.z.string().optional(),
    customDarkSecondary: zod_1.z.string().optional(),
    customDarkAccent: zod_1.z.string().optional(),
    customLightBackground: zod_1.z.string().optional(),
    customLightSurface: zod_1.z.string().optional(),
    customLightText: zod_1.z.string().optional(),
    customLightPrimary: zod_1.z.string().optional(),
    customLightSecondary: zod_1.z.string().optional(),
    customLightAccent: zod_1.z.string().optional(),
    fontFamily: zod_1.z.string().optional(),
    headingFont: zod_1.z.string().optional(),
    bodyFont: zod_1.z.string().optional(),
    fontSize: zod_1.z.string().optional(),
    fontWeight: zod_1.z.string().optional(),
    compactMode: zod_1.z.boolean().optional(),
    colorMode: zod_1.z["enum"](["light", "dark"]).optional(),
    applyToAllUsers: zod_1.z.boolean().optional(),
    accentColor: zod_1.z.string()["default"]("#3b82f6"),
    // Font Colors - Light Mode
    h1ColorLight: zod_1.z.string()["default"]("#000000"),
    h2ColorLight: zod_1.z.string()["default"]("#000000"),
    h3ColorLight: zod_1.z.string()["default"]("#000000"),
    h4ColorLight: zod_1.z.string()["default"]("#000000"),
    h5ColorLight: zod_1.z.string()["default"]("#000000"),
    h6ColorLight: zod_1.z.string()["default"]("#000000"),
    bodyColorLight: zod_1.z.string()["default"]("#333333"),
    mutedColorLight: zod_1.z.string()["default"]("#666666"),
    // Font Colors - Dark Mode
    h1ColorDark: zod_1.z.string()["default"]("#ffffff"),
    h2ColorDark: zod_1.z.string()["default"]("#ffffff"),
    h3ColorDark: zod_1.z.string()["default"]("#ffffff"),
    h4ColorDark: zod_1.z.string()["default"]("#ffffff"),
    h5ColorDark: zod_1.z.string()["default"]("#ffffff"),
    h6ColorDark: zod_1.z.string()["default"]("#ffffff"),
    bodyColorDark: zod_1.z.string()["default"]("#e5e5e5"),
    mutedColorDark: zod_1.z.string()["default"]("#999999"),
    // Button Styling
    buttonBgColorLight: zod_1.z.string().optional(),
    buttonBgColorDark: zod_1.z.string().optional(),
    buttonBorderRadius: zod_1.z.string().optional(),
    buttonPadding: zod_1.z.string().optional(),
    buttonFontSize: zod_1.z.string().optional(),
    buttonBorderColor: zod_1.z.string().optional(),
    buttonHoverBg: zod_1.z.string().optional(),
    buttonActiveBg: zod_1.z.string().optional(),
    buttonDisabledBg: zod_1.z.string().optional(),
    buttonDisabledText: zod_1.z.string().optional(),
    buttonActiveText: zod_1.z.string().optional(),
    // Navigation & Sidebar
    navBackgroundLight: zod_1.z.string().optional(),
    navBackgroundDark: zod_1.z.string().optional(),
    navTextColorLight: zod_1.z.string().optional(),
    navTextColorDark: zod_1.z.string().optional(),
    navBorderColor: zod_1.z.string().optional(),
    navHoverBg: zod_1.z.string().optional(),
    navActiveBg: zod_1.z.string().optional(),
    navHoverText: zod_1.z.string().optional(),
    navActiveText: zod_1.z.string().optional(),
    sidebarBackgroundLight: zod_1.z.string().optional(),
    sidebarBackgroundDark: zod_1.z.string().optional(),
    sidebarTextColorLight: zod_1.z.string().optional(),
    sidebarTextColorDark: zod_1.z.string().optional(),
    sidebarAccentColor: zod_1.z.string().optional(),
    // Sidebar Styling
    sidebarStyle: zod_1.z.string().optional(),
    sidebarWidth: zod_1.z.string().optional(),
    sidebarCollapsedWidth: zod_1.z.string().optional(),
    sidebarIconSize: zod_1.z.string().optional(),
    // Border & Spacing
    borderRadius: zod_1.z.string().optional(),
    borderColor: zod_1.z.string().optional(),
    borderColorLight: zod_1.z.string().optional(),
    borderColorDark: zod_1.z.string().optional(),
    // Background Themes
    backgroundGradient: zod_1.z.string().optional(),
    backgroundPattern: zod_1.z.string().optional(),
    backgroundImage: zod_1.z.string().optional(),
    // Form Input Styles
    formInputBg: zod_1.z.string().optional(),
    formInputBorder: zod_1.z.string().optional(),
    formInputText: zod_1.z.string().optional(),
    // Table Styles
    tableBg: zod_1.z.string().optional(),
    tableBorder: zod_1.z.string().optional(),
    tableText: zod_1.z.string().optional(),
    // Modal Styles
    modalBg: zod_1.z.string().optional(),
    modalBorder: zod_1.z.string().optional(),
    modalText: zod_1.z.string().optional(),
    // Tooltip Styles
    tooltipBg: zod_1.z.string().optional(),
    tooltipText: zod_1.z.string().optional(),
    // Dropdown Styles
    dropdownBg: zod_1.z.string().optional(),
    dropdownBorder: zod_1.z.string().optional(),
    dropdownText: zod_1.z.string().optional(),
    lastUpdated: zod_1.z.string().optional()
}).passthrough();
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
    h2ColorDark: "#ffffff",
    h3ColorDark: "#ffffff",
    h4ColorDark: "#ffffff",
    h5ColorDark: "#ffffff",
    h6ColorDark: "#ffffff",
    bodyColorDark: "#e5e5e5",
    mutedColorDark: "#999999",
    // Button defaults
    buttonBorderRadius: "6px",
    buttonPadding: "8px 16px",
    buttonFontSize: "14px",
    // Theme defaults
    fontFamily: "Inter",
    headingFont: "Inter",
    bodyFont: "Inter",
    fontSize: "16px",
    fontWeight: "400",
    compactMode: false,
    colorMode: "light",
    applyToAllUsers: false,
    lastUpdated: new Date().toISOString()
};
exports.themeCustomizationRouter = trpc_1.router({
    /**
     * Get current theme customization settings
     */
    getConfig: readProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, setting, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, DEFAULT_THEME_CONFIG];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.systemSettings)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.systemSettings.category, "theme"), drizzle_orm_1.eq(schema_1.systemSettings.key, "customization")))
                                .limit(1)];
                    case 2:
                        setting = _b.sent();
                        if (setting.length === 0)
                            return [2 /*return*/, DEFAULT_THEME_CONFIG];
                        if (setting[0].dataType === "json" && setting[0].value) {
                            return [2 /*return*/, JSON.parse(setting[0].value)];
                        }
                        return [2 /*return*/, DEFAULT_THEME_CONFIG];
                    case 3:
                        error_1 = _b.sent();
                        console.error("Error fetching theme config:", error_1);
                        return [2 /*return*/, DEFAULT_THEME_CONFIG];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Save theme customization settings (admin/super_admin only)
     */
    saveConfig: writeProcedure
        .input(ThemeConfigSchema)
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, configWithTimestamp, existingSetting, settingId, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Check if user is admin or super_admin
                        if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
                            throw new Error("Unauthorized: Only admins can modify theme settings");
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 8, , 9]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 2:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database connection failed");
                        configWithTimestamp = __assign(__assign({}, input), { lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 19) });
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.systemSettings)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.systemSettings.category, "theme"), drizzle_orm_1.eq(schema_1.systemSettings.key, "customization")))
                                .limit(1)];
                    case 3:
                        existingSetting = _b.sent();
                        settingId = uuid_1.v4();
                        if (!(existingSetting.length === 0)) return [3 /*break*/, 5];
                        // Create new setting
                        return [4 /*yield*/, db.insert(schema_1.systemSettings).values({
                                id: settingId,
                                category: "theme",
                                key: "customization",
                                value: JSON.stringify(configWithTimestamp),
                                dataType: "json",
                                description: "Theme customization settings for the application",
                                isPublic: 1,
                                updatedBy: ctx.user.id
                            })];
                    case 4:
                        // Create new setting
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 5: 
                    // Update existing setting
                    return [4 /*yield*/, db
                            .update(schema_1.systemSettings)
                            .set({
                            value: JSON.stringify(configWithTimestamp),
                            updatedBy: ctx.user.id
                        })
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.systemSettings.category, "theme"), drizzle_orm_1.eq(schema_1.systemSettings.key, "customization")))];
                    case 6:
                        // Update existing setting
                        _b.sent();
                        _b.label = 7;
                    case 7: return [2 /*return*/, {
                            success: true,
                            config: configWithTimestamp,
                            message: "Theme settings saved successfully"
                        }];
                    case 8:
                        error_2 = _b.sent();
                        console.error("Error saving theme config:", error_2);
                        throw new Error("Failed to save theme settings");
                    case 9: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Reset theme settings to default
     */
    resetToDefault: writeProcedure.mutation(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, settingId, defaultConfigWithTimestamp, existingSetting, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Check if user is admin or super_admin
                        if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
                            throw new Error("Unauthorized: Only admins can reset theme settings");
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 8, , 9]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 2:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database connection failed");
                        settingId = uuid_1.v4();
                        defaultConfigWithTimestamp = __assign(__assign({}, DEFAULT_THEME_CONFIG), { lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 19) });
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.systemSettings)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.systemSettings.category, "theme"), drizzle_orm_1.eq(schema_1.systemSettings.key, "customization")))
                                .limit(1)];
                    case 3:
                        existingSetting = _b.sent();
                        if (!(existingSetting.length === 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, db.insert(schema_1.systemSettings).values({
                                id: settingId,
                                category: "theme",
                                key: "customization",
                                value: JSON.stringify(defaultConfigWithTimestamp),
                                dataType: "json",
                                description: "Theme customization settings for the application",
                                isPublic: 1,
                                updatedBy: ctx.user.id
                            })];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, db
                            .update(schema_1.systemSettings)
                            .set({
                            value: JSON.stringify(defaultConfigWithTimestamp),
                            updatedBy: ctx.user.id
                        })
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.systemSettings.category, "theme"), drizzle_orm_1.eq(schema_1.systemSettings.key, "customization")))];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7: return [2 /*return*/, {
                            success: true,
                            config: defaultConfigWithTimestamp,
                            message: "Theme settings reset to default"
                        }];
                    case 8:
                        error_3 = _b.sent();
                        console.error("Error resetting theme config:", error_3);
                        throw new Error("Failed to reset theme settings");
                    case 9: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Add custom dark mode preset
     */
    addCustomPreset: writeProcedure
        .input(ThemePresetSchema)
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, currentConfig, config, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
                            throw new Error("Unauthorized: Only admins can modify theme presets");
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 8, , 9]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 2:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database connection failed");
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.systemSettings)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.systemSettings.category, "theme"), drizzle_orm_1.eq(schema_1.systemSettings.key, "customization")))
                                .limit(1)];
                    case 3:
                        currentConfig = _b.sent();
                        config = DEFAULT_THEME_CONFIG;
                        if (currentConfig.length > 0 && currentConfig[0].value) {
                            config = JSON.parse(currentConfig[0].value);
                        }
                        if (!config.customDarkPresets) {
                            config.customDarkPresets = [];
                        }
                        config.customDarkPresets.push(input);
                        config.lastUpdated = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        if (!(currentConfig.length === 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, db.insert(schema_1.systemSettings).values({
                                id: uuid_1.v4(),
                                category: "theme",
                                key: "customization",
                                value: JSON.stringify(config),
                                dataType: "json",
                                description: "Theme customization settings for the application",
                                isPublic: 1,
                                updatedBy: ctx.user.id
                            })];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, db
                            .update(schema_1.systemSettings)
                            .set({
                            value: JSON.stringify(config),
                            updatedBy: ctx.user.id
                        })
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.systemSettings.category, "theme"), drizzle_orm_1.eq(schema_1.systemSettings.key, "customization")))];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7: return [2 /*return*/, {
                            success: true,
                            preset: input,
                            message: "Custom preset added successfully"
                        }];
                    case 8:
                        error_4 = _b.sent();
                        console.error("Error adding custom preset:", error_4);
                        throw new Error("Failed to add custom preset");
                    case 9: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Export theme configuration as JSON
     */
    exportConfig: readProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, setting, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, DEFAULT_THEME_CONFIG];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.systemSettings)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.systemSettings.category, "theme"), drizzle_orm_1.eq(schema_1.systemSettings.key, "customization")))
                                .limit(1)];
                    case 2:
                        setting = _b.sent();
                        if (setting.length === 0)
                            return [2 /*return*/, DEFAULT_THEME_CONFIG];
                        if (setting[0].dataType === "json" && setting[0].value) {
                            return [2 /*return*/, JSON.parse(setting[0].value)];
                        }
                        return [2 /*return*/, DEFAULT_THEME_CONFIG];
                    case 3:
                        error_5 = _b.sent();
                        console.error("Error exporting theme config:", error_5);
                        return [2 /*return*/, DEFAULT_THEME_CONFIG];
                    case 4: return [2 /*return*/];
                }
            });
        });
    })
});
