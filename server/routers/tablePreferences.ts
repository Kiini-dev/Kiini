import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb, getPool } from "../db";
import { userTablePreferences } from "../../drizzle/schema-extended";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

let preferencesTableReady: Promise<void> | null = null;

function ensurePreferencesTable() {
  if (!preferencesTableReady) {
    preferencesTableReady = (async () => {
      const pool = getPool();
      if (!pool) throw new Error("Database pool not initialized");
      await pool.query(`CREATE TABLE IF NOT EXISTS userTablePreferences (
        id VARCHAR(64) NOT NULL PRIMARY KEY,
        userId VARCHAR(64) NOT NULL,
        organizationId VARCHAR(64) NULL,
        tableName VARCHAR(100) NOT NULL,
        visibleColumns TEXT NULL,
        columnOrder TEXT NULL,
        pageSize INT DEFAULT 25,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX utp_user_table_idx (userId, tableName),
        INDEX utp_org_idx (organizationId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
      const [columnRows] = await pool.query("SHOW COLUMNS FROM userTablePreferences");
      const existingColumns = new Set(
        (Array.isArray(columnRows) ? columnRows : []).map((row: any) => String(row.Field).toLowerCase())
      );
      const missingColumns: Record<string, string> = {
        userId: "VARCHAR(64) NULL",
        organizationId: "VARCHAR(64) NULL",
        tableName: "VARCHAR(100) NULL",
        visibleColumns: "TEXT NULL",
        columnOrder: "TEXT NULL",
        pageSize: "INT NULL DEFAULT 25",
        createdAt: "TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP",
        updatedAt: "TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP",
      };
      for (const [column, definition] of Object.entries(missingColumns)) {
        if (!existingColumns.has(column.toLowerCase())) {
          await pool.query(`ALTER TABLE userTablePreferences ADD COLUMN ${column} ${definition}`);
        }
      }
    })().catch((error) => {
      preferencesTableReady = null;
      throw error;
    });
  }
  return preferencesTableReady;
}

export const tablePreferencesRouter = router({
  /** Get table preferences for the current user + table */
  get: protectedProcedure
    .input(z.object({ tableName: z.string().min(1).max(100) }))
    .query(async ({ ctx, input }) => {
      try {
        const db = (await getDb()) as any;
        if (!db) return null;
        const [pref] = await db
          .select()
          .from(userTablePreferences)
          .where(
            and(
              eq(userTablePreferences.userId, ctx.user.id),
              eq(userTablePreferences.tableName, input.tableName)
            )
          )
          .limit(1);

        if (!pref) return null;

        return {
          id: pref.id,
          tableName: pref.tableName,
          visibleColumns: pref.visibleColumns
            ? (JSON.parse(pref.visibleColumns) as string[])
            : null,
          columnOrder: pref.columnOrder
            ? (JSON.parse(pref.columnOrder) as string[])
            : null,
          pageSize: pref.pageSize ?? 25,
        };
      } catch (error) {
        console.warn("[Table Preferences] Read skipped:", error instanceof Error ? error.message : error);
        return null;
      }
    }),

  /** Upsert table preferences (create or update) */
  save: protectedProcedure
    .input(
      z.object({
        tableName: z.string().min(1).max(100),
        visibleColumns: z.array(z.string()).optional(),
        columnOrder: z.array(z.string()).optional(),
        pageSize: z.number().min(5).max(200).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = (await getDb()) as any;
      if (!db) throw new Error("Database not initialized");
      await ensurePreferencesTable();
      const [existing] = await db
        .select()
        .from(userTablePreferences)
        .where(
          and(
            eq(userTablePreferences.userId, ctx.user.id),
            eq(userTablePreferences.tableName, input.tableName)
          )
        )
        .limit(1);

      if (existing) {
        await db
          .update(userTablePreferences)
          .set({
            ...(input.visibleColumns !== undefined && {
              visibleColumns: JSON.stringify(input.visibleColumns),
            }),
            ...(input.columnOrder !== undefined && {
              columnOrder: JSON.stringify(input.columnOrder),
            }),
            ...(input.pageSize !== undefined && { pageSize: input.pageSize }),
            updatedAt: new Date(),
          })
          .where(eq(userTablePreferences.id, existing.id));

        return { id: existing.id };
      }

      const id = nanoid();
      await db.insert(userTablePreferences).values({
        id,
        userId: ctx.user.id,
        organizationId: ctx.user.organizationId ?? null,
        tableName: input.tableName,
        visibleColumns: input.visibleColumns
          ? JSON.stringify(input.visibleColumns)
          : null,
        columnOrder: input.columnOrder
          ? JSON.stringify(input.columnOrder)
          : null,
        pageSize: input.pageSize ?? 25,
      });

      return { id };
    }),

  /** Reset table preferences to defaults */
  reset: protectedProcedure
    .input(z.object({ tableName: z.string().min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const db = (await getDb()) as any;
      if (!db) throw new Error("Database not initialized");
      await ensurePreferencesTable();
      await db
        .delete(userTablePreferences)
        .where(
          and(
            eq(userTablePreferences.userId, ctx.user.id),
            eq(userTablePreferences.tableName, input.tableName)
          )
        );
      return { success: true };
    }),
});
