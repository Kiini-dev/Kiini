/**
 * Organization Theme Customization Router
 * Handles org-level theme configuration similar to global themeCustomization but with org isolation
 */

import { router, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { organizations } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const orgThemeReadProcedure = createFeatureRestrictedProcedure("settings:view");
const orgThemeWriteProcedure = createFeatureRestrictedProcedure("settings:edit");

const ALLOWED_THEME_PRESETS = [
  "Light Mode",
  "Prestige",
  "Midnight",
  "Dark Mode",
  "Ocean Blue",
] as const;

// Zod schema for org theme configuration
const OrgThemeConfigSchema = z.object({
  darkModePreset: z.enum(ALLOWED_THEME_PRESETS).default("Light Mode"),
  cardBackgroundStyle: z.string().default("solid"),
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

type OrgThemeConfig = z.infer<typeof OrgThemeConfigSchema>;

const DEFAULT_ORG_THEME_CONFIG: OrgThemeConfig = {
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
};

export const orgThemeCustomizationRouter = router({
  /**
   * Get org theme configuration
   */
  getConfig: orgThemeReadProcedure
    .input(z.string())
    .query(async ({ input: orgId }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        const org = await database
          .select()
          .from(organizations)
          .where(eq(organizations.id, orgId))
          .limit(1);

        if (!org.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Organization not found",
          });
        }

        const themeConfig = (org[0].settings as any)?.themeCustomization || DEFAULT_ORG_THEME_CONFIG;
        return {
          config: themeConfig,
          success: true,
        };
      } catch (error: any) {
        console.error("[OrgTheme] Error fetching config:", error);
        if (error.code === "NOT_FOUND") throw error;
        return {
          config: DEFAULT_ORG_THEME_CONFIG,
          error: error.message,
          success: false,
        };
      }
    }),

  /**
   * Save org theme configuration
   */
  saveConfig: orgThemeWriteProcedure
    .input(
      z.object({
        orgId: z.string(),
        config: OrgThemeConfigSchema,
      })
    )
    .mutation(async ({ input }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        // Get existing org
        const org = await database
          .select()
          .from(organizations)
          .where(eq(organizations.id, input.orgId))
          .limit(1);

        if (!org.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Organization not found",
          });
        }

        // Merge with existing settings
        const currentSettings = (org[0].settings as any) || {};
        const updatedSettings = {
          ...currentSettings,
          themeCustomization: {
            ...input.config,
            lastUpdated: new Date().toISOString(),
          },
        };

        // Update org with new settings
        await database
          .update(organizations)
          .set({
            settings: updatedSettings,
          })
          .where(eq(organizations.id, input.orgId));

        return {
          success: true,
          config: updatedSettings.themeCustomization,
        };
      } catch (error: any) {
        console.error("[OrgTheme] Error saving config:", error);
        if (error.code === "NOT_FOUND") throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to save theme config: ${error.message}`,
        });
      }
    }),

  /**
   * Reset org theme to default
   */
  resetToDefault: orgThemeWriteProcedure
    .input(z.string())
    .mutation(async ({ input: orgId }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        // Get existing org
        const org = await database
          .select()
          .from(organizations)
          .where(eq(organizations.id, orgId))
          .limit(1);

        if (!org.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Organization not found",
          });
        }

        // Merge with existing settings, removing themeCustomization
        const currentSettings = (org[0].settings as any) || {};
        const updatedSettings = {
          ...currentSettings,
          themeCustomization: DEFAULT_ORG_THEME_CONFIG,
        };

        // Update org with new settings
        await database
          .update(organizations)
          .set({
            settings: updatedSettings,
          })
          .where(eq(organizations.id, orgId));

        return {
          success: true,
          config: DEFAULT_ORG_THEME_CONFIG,
        };
      } catch (error: any) {
        console.error("[OrgTheme] Error resetting to default:", error);
        if (error.code === "NOT_FOUND") throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to reset theme: ${error.message}`,
        });
      }
    }),

  /**
   * Export org theme configuration as JSON
   */
  exportConfig: orgThemeReadProcedure
    .input(z.string())
    .query(async ({ input: orgId }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        const org = await database
          .select()
          .from(organizations)
          .where(eq(organizations.id, orgId))
          .limit(1);

        if (!org.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Organization not found",
          });
        }

        const themeConfig = (org[0].settings as any)?.themeCustomization || DEFAULT_ORG_THEME_CONFIG;
        return {
          success: true,
          config: themeConfig,
          exportData: JSON.stringify(themeConfig, null, 2),
        };
      } catch (error: any) {
        console.error("[OrgTheme] Error exporting config:", error);
        if (error.code === "NOT_FOUND") throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to export theme: ${error.message}`,
        });
      }
    }),

  /**
   * Import org theme configuration from JSON
   */
  importConfig: orgThemeWriteProcedure
    .input(
      z.object({
        orgId: z.string(),
        importData: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const importedConfig = JSON.parse(input.importData);
        const validConfig = OrgThemeConfigSchema.parse(importedConfig);

        const database = await getDb();
        if (!database) throw new Error("Database not available");

        // Get existing org
        const org = await database
          .select()
          .from(organizations)
          .where(eq(organizations.id, input.orgId))
          .limit(1);

        if (!org.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Organization not found",
          });
        }

        // Merge with existing settings
        const currentSettings = (org[0].settings as any) || {};
        const updatedSettings = {
          ...currentSettings,
          themeCustomization: {
            ...validConfig,
            lastUpdated: new Date().toISOString(),
          },
        };

        // Update org with new settings
        await database
          .update(organizations)
          .set({
            settings: updatedSettings,
          })
          .where(eq(organizations.id, input.orgId));

        return {
          success: true,
          config: updatedSettings.themeCustomization,
        };
      } catch (error: any) {
        console.error("[OrgTheme] Error importing config:", error);
        if (error.code === "NOT_FOUND") throw error;
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Failed to import theme: ${error.message}`,
        });
      }
    }),
});
