import { router, protectedProcedure, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { systemSettings } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuid } from "uuid";

// Zod schema for homepage widget configuration
const HomepageWidgetSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.enum(["finance", "hr", "sales", "operations", "analytics"]),
  enabled: z.boolean(),
  size: z.enum(["small", "medium", "large"]),
  order: z.number(),
});

const HomepageConfigSchema = z.object({
  widgets: z.array(HomepageWidgetSchema),
  lastUpdated: z.string().optional(),
});

type HomepageConfig = z.infer<typeof HomepageConfigSchema>;

const DEFAULT_HOMEPAGE_CONFIG: HomepageConfig = {
  widgets: [
    {
      id: "revenue",
      title: "Revenue Metrics",
      description: "Monthly revenue and income summary",
      category: "finance",
      enabled: true,
      size: "medium",
      order: 1,
    },
    {
      id: "employees",
      title: "Employee Overview",
      description: "Total employees and department breakdown",
      category: "hr",
      enabled: true,
      size: "medium",
      order: 2,
    },
    {
      id: "projects",
      title: "Active Projects",
      description: "Current projects and milestones",
      category: "sales",
      enabled: true,
      size: "medium",
      order: 3,
    },
    {
      id: "activities",
      title: "Recent Activities",
      description: "Latest system activities and events",
      category: "operations",
      enabled: true,
      size: "medium",
      order: 6,
    },
  ],
  lastUpdated: new Date().toISOString(),
};

export const customHomepageRouter = router({
  /**
   * Get user's custom homepage configuration
   */
  getConfig: createFeatureRestrictedProcedure("dashboard:view").query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return DEFAULT_HOMEPAGE_CONFIG;

      const setting = await db
        .select()
        .from(systemSettings)
        .where(
          and(
            eq(systemSettings.category, "homepage"),
            eq(systemSettings.key, `user_${ctx.user.id}`)
          )
        )
        .limit(1);

      if (setting.length === 0) return DEFAULT_HOMEPAGE_CONFIG;

      if (setting[0].dataType === "json" && setting[0].value) {
        return JSON.parse(setting[0].value) as HomepageConfig;
      }

      return DEFAULT_HOMEPAGE_CONFIG;
    } catch (error) {
      console.error("Error fetching homepage config:", error);
      return DEFAULT_HOMEPAGE_CONFIG;
    }
  }),

  /**
   * Save user's custom homepage configuration
   */
  saveConfig: createFeatureRestrictedProcedure("dashboard:edit")
    .input(HomepageConfigSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        const existingSetting = await db
          .select()
          .from(systemSettings)
          .where(
            and(
              eq(systemSettings.category, "homepage"),
              eq(systemSettings.key, `user_${ctx.user.id}`)
            )
          )
          .limit(1);

        const settingId = uuid();
        const now = new Date().toISOString();
        const configWithTimestamp: HomepageConfig = {
          ...input,
          lastUpdated: now,
        };

        if (existingSetting.length === 0) {
          // Create new setting
          await db.insert(systemSettings).values({
            id: settingId,
            category: "homepage",
            key: `user_${ctx.user.id}`,
            value: JSON.stringify(configWithTimestamp),
            dataType: "json",
            description: `Custom homepage configuration for user ${ctx.user.id}`,
            isPublic: 0,
            updatedBy: ctx.user.id,
            updatedAt: now,
          });
        } else {
          // Update existing setting
          await db
            .update(systemSettings)
            .set({
              value: JSON.stringify(configWithTimestamp),
              updatedBy: ctx.user.id,
              updatedAt: now,
            })
            .where(
              and(
                eq(systemSettings.category, "homepage"),
                eq(systemSettings.key, `user_${ctx.user.id}`)
              )
            );
        }

        return {
          success: true,
          config: configWithTimestamp,
          message: "Homepage configuration saved successfully",
        };
      } catch (error) {
        console.error("Error saving homepage config:", error);
        throw new Error("Failed to save homepage configuration");
      }
    }),

  /**
   * Reset homepage configuration to default
   */
  resetToDefault: createFeatureRestrictedProcedure("dashboard:edit").mutation(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const now = new Date().toISOString();
      const configWithTimestamp: HomepageConfig = {
        ...DEFAULT_HOMEPAGE_CONFIG,
        lastUpdated: now,
      };

      const existingSetting = await db
        .select()
        .from(systemSettings)
        .where(
          and(
            eq(systemSettings.category, "homepage"),
            eq(systemSettings.key, `user_${ctx.user.id}`)
          )
        )
        .limit(1);

      if (existingSetting.length === 0) {
        const settingId = uuid();
        await db.insert(systemSettings).values({
          id: settingId,
          category: "homepage",
          key: `user_${ctx.user.id}`,
          value: JSON.stringify(configWithTimestamp),
          dataType: "json",
          description: `Custom homepage configuration for user ${ctx.user.id}`,
          isPublic: 0,
          updatedBy: ctx.user.id,
          updatedAt: now,
        });
      } else {
        await db
          .update(systemSettings)
          .set({
            value: JSON.stringify(configWithTimestamp),
            updatedBy: ctx.user.id,
            updatedAt: now,
          })
          .where(
            and(
              eq(systemSettings.category, "homepage"),
              eq(systemSettings.key, `user_${ctx.user.id}`)
            )
          );
      }

      return {
        success: true,
        config: configWithTimestamp,
        message: "Homepage configuration reset to default",
      };
    } catch (error) {
      console.error("Error resetting homepage config:", error);
      throw new Error("Failed to reset homepage configuration");
    }
  }),
});
