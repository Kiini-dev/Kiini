import { router, publicProcedure, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb, getPool, getRawPool } from "../db";
import { systemSettings } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuid } from "uuid";

const readProcedure = createFeatureRestrictedProcedure(["settings:view", "client_portal:dashboard"]);
const writeProcedure = createFeatureRestrictedProcedure("settings:edit");

const ALLOWED_THEME_PRESETS = [
  "Light Mode",
  "Prestige",
  "Midnight",
  "Dark Mode",
  "Ocean Blue",
] as const;

const LEGACY_THEME_PRESET_MAP: Record<string, (typeof ALLOWED_THEME_PRESETS)[number]> = {
  default: "Light Mode",
  light: "Light Mode",
  total_dark: "Dark Mode",
  grey_black: "Dark Mode",
  navy_dark: "Midnight",
  slate_dark: "Midnight",
  forest_dark: "Ocean Blue",
};

function normalizePreset(preset?: string): (typeof ALLOWED_THEME_PRESETS)[number] {
  if (!preset) return "Light Mode";
  if ((ALLOWED_THEME_PRESETS as readonly string[]).includes(preset)) {
    return preset as (typeof ALLOWED_THEME_PRESETS)[number];
  }
  const normalized = preset.trim().toLowerCase().replace(/\s+/g, "_");
  return LEGACY_THEME_PRESET_MAP[normalized] || "Light Mode";
}

// Zod schema for theme configuration
const ThemePresetSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
  surfaceColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
  textColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
  mutedColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
});

const CardBackgroundSchema = z.object({
  id: z.string(),
  name: z.string(),
  lightMode: z.string(),
  darkMode: z.string(),
});

const ThemeConfigSchema = z.object({
  darkModePreset: z.enum(ALLOWED_THEME_PRESETS).default("Light Mode"),
  cardBackgroundStyle: z.string().default("solid"),
  customDarkPresets: z.array(ThemePresetSchema).optional(),
  customCardStyles: z.array(CardBackgroundSchema).optional(),
  customDarkBackground: z.string().optional(),
  customDarkSurface: z.string().optional(),
  customDarkText: z.string().optional(),
  customCardBackground: z.string().optional(),
  customCardForeground: z.string().optional(),
  customCSS: z.string().optional(),
  customDarkPrimary: z.string().optional(),
  customDarkSecondary: z.string().optional(),
  customDarkAccent: z.string().optional(),
  customLightBackground: z.string().optional(),
  customLightSurface: z.string().optional(),
  customLightText: z.string().optional(),
  customLightPrimary: z.string().optional(),
  customLightSecondary: z.string().optional(),
  customLightAccent: z.string().optional(),
  fontFamily: z.string().optional(),
  headingFont: z.string().optional(),
  bodyFont: z.string().optional(),
  fontSize: z.string().optional(),
  fontWeight: z.string().optional(),
  compactMode: z.boolean().optional(),
  colorMode: z.enum(["light", "dark"]).optional(),
  applyToAllUsers: z.boolean().optional(),
  accentColor: z.string().default("#3b82f6"),
  
  // Font Colors - Light Mode
  h1ColorLight: z.string().default("#000000"),
  h2ColorLight: z.string().default("#000000"),
  h3ColorLight: z.string().default("#000000"),
  h4ColorLight: z.string().default("#000000"),
  h5ColorLight: z.string().default("#000000"),
  h6ColorLight: z.string().default("#000000"),
  bodyColorLight: z.string().default("#333333"),
  mutedColorLight: z.string().default("#666666"),
  
  // Font Colors - Dark Mode
  h1ColorDark: z.string().default("#ffffff"),
  h2ColorDark: z.string().default("#ffffff"),
  h3ColorDark: z.string().default("#ffffff"),
  h4ColorDark: z.string().default("#ffffff"),
  h5ColorDark: z.string().default("#ffffff"),
  h6ColorDark: z.string().default("#ffffff"),
  bodyColorDark: z.string().default("#e5e5e5"),
  mutedColorDark: z.string().default("#999999"),
  
  // Button Styling
  buttonBgColorLight: z.string().optional(),
  buttonBgColorDark: z.string().optional(),
  buttonBorderRadius: z.string().optional(),
  buttonPadding: z.string().optional(),
  buttonFontSize: z.string().optional(),
  buttonBorderColor: z.string().optional(),
  buttonHoverBg: z.string().optional(),
  buttonActiveBg: z.string().optional(),
  buttonDisabledBg: z.string().optional(),
  buttonDisabledText: z.string().optional(),
  buttonActiveText: z.string().optional(),
  
  // Navigation & Sidebar
  navBackgroundLight: z.string().optional(),
  navBackgroundDark: z.string().optional(),
  navTextColorLight: z.string().optional(),
  navTextColorDark: z.string().optional(),
  navBorderColor: z.string().optional(),
  navHoverBg: z.string().optional(),
  navActiveBg: z.string().optional(),
  navHoverText: z.string().optional(),
  navActiveText: z.string().optional(),
  sidebarBackgroundLight: z.string().optional(),
  sidebarBackgroundDark: z.string().optional(),
  sidebarTextColorLight: z.string().optional(),
  sidebarTextColorDark: z.string().optional(),
  sidebarAccentColor: z.string().optional(),
  
  // Sidebar Styling
  sidebarStyle: z.string().optional(),
  sidebarWidth: z.string().optional(),
  sidebarCollapsedWidth: z.string().optional(),
  sidebarIconSize: z.string().optional(),
  
  // Border & Spacing
  borderRadius: z.string().optional(),
  borderColor: z.string().optional(),
  borderColorLight: z.string().optional(),
  borderColorDark: z.string().optional(),
  
  // Background Themes
  backgroundGradient: z.string().optional(),
  backgroundPattern: z.string().optional(),
  backgroundImage: z.string().optional(),
  
  // Form Input Styles
  formInputBg: z.string().optional(),
  formInputBorder: z.string().optional(),
  formInputText: z.string().optional(),
  
  // Table Styles
  tableBg: z.string().optional(),
  tableBorder: z.string().optional(),
  tableText: z.string().optional(),
  
  // Modal Styles
  modalBg: z.string().optional(),
  modalBorder: z.string().optional(),
  modalText: z.string().optional(),
  
  // Tooltip Styles
  tooltipBg: z.string().optional(),
  tooltipText: z.string().optional(),
  
  // Dropdown Styles
  dropdownBg: z.string().optional(),
  dropdownBorder: z.string().optional(),
  dropdownText: z.string().optional(),
  
  lastUpdated: z.string().optional(),
}).passthrough();

type ThemeConfig = z.infer<typeof ThemeConfigSchema>;

const DEFAULT_THEME_CONFIG: ThemeConfig = {
  darkModePreset: "Light Mode",
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

  
  lastUpdated: new Date().toISOString(),
};

export const themeCustomizationRouter = router({
  /**
   * Get current theme customization settings
   */
  getConfig: publicProcedure.query(async () => {
    try {
      const pool = getPool() || await getRawPool();
      if (pool) {
        try {
          const [rows] = await pool.execute(
            "SELECT * FROM systemSettings WHERE category = ? AND `key` = ? LIMIT 1",
            ["theme", "customization"],
          );
          const setting = (rows as any[])[0];
          if (!setting) return DEFAULT_THEME_CONFIG;
          if (setting.dataType === "json" && setting.value) {
            return { ...DEFAULT_THEME_CONFIG, ...(JSON.parse(setting.value) as ThemeConfig), lastUpdated: setting.updatedAt || DEFAULT_THEME_CONFIG.lastUpdated };
          }
          return DEFAULT_THEME_CONFIG;
        } catch (error) {
          console.warn("[Theme] Raw config lookup failed; using Drizzle:", error);
        }
      }

      const db = await getDb();
      if (!db) return DEFAULT_THEME_CONFIG;

      const setting = await db
        .select()
        .from(systemSettings)
        .where(
          and(
            eq(systemSettings.category, "theme"),
            eq(systemSettings.key, "customization")
          )
        )
        .limit(1);

      if (setting.length === 0) return DEFAULT_THEME_CONFIG;

      if (setting[0].dataType === "json" && setting[0].value) {
        const parsed = JSON.parse(setting[0].value) as ThemeConfig;
        return {
          ...parsed,
          darkModePreset: normalizePreset(parsed?.darkModePreset),
        };
      }

      return DEFAULT_THEME_CONFIG;
    } catch (error) {
      console.error("Error fetching theme config:", error);
      return DEFAULT_THEME_CONFIG;
    }
  }),

  /**
   * Save theme customization settings (admin/super_admin only)
   */
  saveConfig: writeProcedure
    .input(ThemeConfigSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin or super_admin
      if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
        throw new Error("Unauthorized: Only admins can modify theme settings");
      }

      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        const configWithTimestamp = {
          ...input,
          darkModePreset: normalizePreset(input.darkModePreset),
          lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };

        const existingSetting = await db
          .select()
          .from(systemSettings)
          .where(
            and(
              eq(systemSettings.category, "theme"),
              eq(systemSettings.key, "customization")
            )
          )
          .limit(1);

        const settingId = uuid();

        if (existingSetting.length === 0) {
          // Create new setting
          await db.insert(systemSettings).values({
            id: settingId,
            category: "theme",
            key: "customization",
            value: JSON.stringify(configWithTimestamp),
            dataType: "json",
            description: "Theme customization settings for the application",
            isPublic: 1,
            updatedBy: ctx.user.id,
          });
        } else {
          // Update existing setting
          await db
            .update(systemSettings)
            .set({
              value: JSON.stringify(configWithTimestamp),
              updatedBy: ctx.user.id,
            })
            .where(
              and(
                eq(systemSettings.category, "theme"),
                eq(systemSettings.key, "customization")
              )
            );
        }

        return {
          success: true,
          config: configWithTimestamp,
          message: "Theme settings saved successfully",
        };
      } catch (error) {
        console.error("Error saving theme config:", error);
        throw new Error("Failed to save theme settings");
      }
    }),

  /**
   * Reset theme settings to default
   */
  resetToDefault: writeProcedure.mutation(async ({ ctx }) => {
    // Check if user is admin or super_admin
    if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
      throw new Error("Unauthorized: Only admins can reset theme settings");
    }

    try {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const settingId = uuid();
      const defaultConfigWithTimestamp = {
        ...DEFAULT_THEME_CONFIG,
        darkModePreset: normalizePreset(DEFAULT_THEME_CONFIG.darkModePreset),
        lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };

      const existingSetting = await db
        .select()
        .from(systemSettings)
        .where(
          and(
            eq(systemSettings.category, "theme"),
            eq(systemSettings.key, "customization")
          )
        )
        .limit(1);

      if (existingSetting.length === 0) {
        await db.insert(systemSettings).values({
          id: settingId,
          category: "theme",
          key: "customization",
          value: JSON.stringify(defaultConfigWithTimestamp),
          dataType: "json",
          description: "Theme customization settings for the application",
          isPublic: 1,
          updatedBy: ctx.user.id,
        });
      } else {
        await db
          .update(systemSettings)
          .set({
            value: JSON.stringify(defaultConfigWithTimestamp),
            updatedBy: ctx.user.id,
          })
          .where(
            and(
              eq(systemSettings.category, "theme"),
              eq(systemSettings.key, "customization")
            )
          );
      }

      return {
        success: true,
        config: defaultConfigWithTimestamp,
        message: "Theme settings reset to default",
      };
    } catch (error) {
      console.error("Error resetting theme config:", error);
      throw new Error("Failed to reset theme settings");
    }
  }),

  /**
   * Add custom dark mode preset
   */
  addCustomPreset: writeProcedure
    .input(ThemePresetSchema)
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
        throw new Error("Unauthorized: Only admins can modify theme presets");
      }

      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        const currentConfig = await db
          .select()
          .from(systemSettings)
          .where(
            and(
              eq(systemSettings.category, "theme"),
              eq(systemSettings.key, "customization")
            )
          )
          .limit(1);

        let config: ThemeConfig = DEFAULT_THEME_CONFIG;
        if (currentConfig.length > 0 && currentConfig[0].value) {
          config = JSON.parse(currentConfig[0].value);
        }

        if (!config.customDarkPresets) {
          config.customDarkPresets = [];
        }

        config.customDarkPresets.push(input);
        config.lastUpdated = new Date().toISOString().replace('T', ' ').substring(0, 19);

        if (currentConfig.length === 0) {
          await db.insert(systemSettings).values({
            id: uuid(),
            category: "theme",
            key: "customization",
            value: JSON.stringify(config),
            dataType: "json",
            description: "Theme customization settings for the application",
            isPublic: 1,
            updatedBy: ctx.user.id,
          });
        } else {
          await db
            .update(systemSettings)
            .set({
              value: JSON.stringify(config),
              updatedBy: ctx.user.id,
            })
            .where(
              and(
                eq(systemSettings.category, "theme"),
                eq(systemSettings.key, "customization")
              )
            );
        }

        return {
          success: true,
          preset: input,
          message: "Custom preset added successfully",
        };
      } catch (error) {
        console.error("Error adding custom preset:", error);
        throw new Error("Failed to add custom preset");
      }
    }),

  /**
   * Export theme configuration as JSON
   */
  exportConfig: readProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return DEFAULT_THEME_CONFIG;

      const setting = await db
        .select()
        .from(systemSettings)
        .where(
          and(
            eq(systemSettings.category, "theme"),
            eq(systemSettings.key, "customization")
          )
        )
        .limit(1);

      if (setting.length === 0) return DEFAULT_THEME_CONFIG;

      if (setting[0].dataType === "json" && setting[0].value) {
        return JSON.parse(setting[0].value) as ThemeConfig;
      }

      return DEFAULT_THEME_CONFIG;
    } catch (error) {
      console.error("Error exporting theme config:", error);
      return DEFAULT_THEME_CONFIG;
    }
  }),
});
