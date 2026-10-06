/**
 * Version Control Router
 * Tracks document version history using the documentVersions table.
 */

import { router } from '../_core/trpc';
import { createFeatureRestrictedProcedure } from '../middleware/enhancedRbac';
import { z } from 'zod';
import { getDb, logActivity } from '../db';
import { documentVersions } from '../../drizzle/schema';
import { eq, desc, count, sql, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const viewProcedure = createFeatureRestrictedProcedure('documents:view');
const editProcedure = createFeatureRestrictedProcedure('documents:edit');

export const versionControlRouter = router({
  /** List all document versions, optionally filtered by documentId */
  list: viewProcedure
    .input(z.object({
      documentId: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { versions: [], total: 0 };

      const conditions: any[] = [];
      if (input?.documentId) conditions.push(eq(documentVersions.documentId, input.documentId));

      const rows = conditions.length > 0
        ? await db.select().from(documentVersions).where(and(...conditions)).orderBy(desc(documentVersions.createdAt)).limit(input?.limit || 50).offset(input?.offset || 0)
        : await db.select().from(documentVersions).orderBy(desc(documentVersions.createdAt)).limit(input?.limit || 50).offset(input?.offset || 0);

      const totalResult = conditions.length > 0
        ? await db.select({ total: count() }).from(documentVersions).where(and(...conditions))
        : await db.select({ total: count() }).from(documentVersions);

      return {
        versions: rows,
        total: totalResult[0]?.total || 0,
      };
    }),

  /** Get a single version by ID */
  getById: viewProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const rows = await db.select().from(documentVersions).where(eq(documentVersions.id, input)).limit(1);
      return rows[0] || null;
    }),

  /** Get stats: total versions, total storage, unique documents */
  getStats: viewProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { totalVersions: 0, totalStorage: 0, uniqueDocuments: 0, latestVersion: null };

    const [stats] = await db.select({
      totalVersions: count(),
      totalStorage: sql<number>`COALESCE(SUM(fileSize), 0)`,
      uniqueDocuments: sql<number>`COUNT(DISTINCT documentId)`,
    }).from(documentVersions);

    const latest = await db.select().from(documentVersions).orderBy(desc(documentVersions.createdAt)).limit(1);

    return {
      totalVersions: stats?.totalVersions || 0,
      totalStorage: stats?.totalStorage || 0,
      uniqueDocuments: stats?.uniqueDocuments || 0,
      latestVersion: latest[0] || null,
    };
  }),

  /** Create a new version entry */
  create: editProcedure
    .input(z.object({
      documentId: z.string(),
      fileUrl: z.string(),
      fileSize: z.number().optional(),
      changeNotes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Get next version number for this document
      const existing = await db.select({ maxVersion: sql<number>`COALESCE(MAX(versionNumber), 0)` })
        .from(documentVersions)
        .where(eq(documentVersions.documentId, input.documentId));
      const nextVersion = (existing[0]?.maxVersion || 0) + 1;

      const id = uuidv4();
      await db.insert(documentVersions).values({
        id,
        documentId: input.documentId,
        versionNumber: nextVersion,
        fileUrl: input.fileUrl,
        fileSize: input.fileSize || 0,
        uploadedBy: ctx.user.id,
        changeNotes: input.changeNotes || null,
      });

      await logActivity({
        userId: ctx.user.id,
        action: 'version_created',
        entityType: 'document_version',
        entityId: id,
        description: `Created version ${nextVersion} for document ${input.documentId}`,
      });

      return { id, versionNumber: nextVersion };
    }),

  /** Delete a version */
  delete: editProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db.delete(documentVersions).where(eq(documentVersions.id, input));

      await logActivity({
        userId: ctx.user.id,
        action: 'version_deleted',
        entityType: 'document_version',
        entityId: input,
        description: `Deleted version ${input}`,
      });

      return { success: true };
    }),
});
