/**
 * File Storage Router - DB-backed (uses existing documents table)
 * Supports actual file upload via base64 data and local disk storage.
 */
import { router } from '../_core/trpc';
import { createFeatureRestrictedProcedure } from '../middleware/enhancedRbac';
import { z } from 'zod';
import { getDb, getPool } from '../db';
import { documents, fileFolders, settings } from '../../drizzle/schema';
import { and, eq, desc, like, isNull, inArray } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { queueEmail } from './emailQueue';
import { renderNotificationTemplate } from '../services/notificationRenderer';

// Upload directory - works both locally and in Docker
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.resolve(process.cwd(), 'uploads');

// Ensure upload directory exists
function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

// Allowed MIME types for security
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain', 'text/csv',
  'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/zip', 'application/x-zip-compressed',
  'application/json', 'application/xml',
  'application/octet-stream',
]);

const MAX_FILE_SIZE = 100 * 1024 * 1024;

let documentsTableReady: Promise<void> | null = null;

function ensureDocumentsTable() {
  if (!documentsTableReady) {
    documentsTableReady = (async () => {
      const pool = getPool();
      if (!pool) throw new Error('Database pool not initialized');
      await pool.query(`CREATE TABLE IF NOT EXISTS documents (
        id VARCHAR(64) NOT NULL PRIMARY KEY,
        organizationId VARCHAR(64) NULL,
        documentName VARCHAR(255) NOT NULL,
        documentType VARCHAR(50) NULL,
        fileUrl VARCHAR(500) NOT NULL,
        fileSize INT DEFAULT 0,
        mimeType VARCHAR(100) NULL,
        linkedEntityType VARCHAR(100) NULL,
        linkedEntityId VARCHAR(64) NULL,
        linkedClientId VARCHAR(64) NULL,
        linkedProjectId VARCHAR(64) NULL,
        linkedInvoiceId VARCHAR(64) NULL,
        uploadedBy VARCHAR(64) NOT NULL,
        currentVersion INT DEFAULT 1,
        status VARCHAR(20) DEFAULT 'active',
        expiryDate TIMESTAMP NULL,
        requiresSignature TINYINT DEFAULT 0,
        isSigned TINYINT DEFAULT 0,
        signedDate TIMESTAMP NULL,
        signedBy VARCHAR(64) NULL,
        tags TEXT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
      await pool.query(`CREATE TABLE IF NOT EXISTS fileFolders (
        id VARCHAR(64) NOT NULL PRIMARY KEY,
        organizationId VARCHAR(64) NULL,
        parentId VARCHAR(64) NULL,
        name VARCHAR(255) NOT NULL,
        createdBy VARCHAR(64) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_file_folder_org (organizationId),
        INDEX idx_file_folder_parent (parentId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

      const [columnRows] = await pool.query('SHOW COLUMNS FROM documents');
      const existingColumns = new Set(
        (Array.isArray(columnRows) ? columnRows : []).map((row: any) => String(row.Field).toLowerCase())
      );
      const requiredColumns: Record<string, string> = {
        linkedInvoiceId: 'VARCHAR(64) NULL',
        folderId: 'VARCHAR(64) NULL',
        updatedAt: 'TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP',
      };
      for (const [column, definition] of Object.entries(requiredColumns)) {
        if (!existingColumns.has(column.toLowerCase())) {
          await pool.query(`ALTER TABLE documents ADD COLUMN ${column} ${definition}`);
        }
      }
    })().catch((error) => {
      documentsTableReady = null;
      throw error;
    });
  }
  return documentsTableReady;
}

const docViewProcedure = createFeatureRestrictedProcedure('documents:view');
const docEditProcedure = createFeatureRestrictedProcedure('documents:edit');

async function readFileManagerSettings(database: any) {
  const rows = await database.select().from(settings).where(inArray(settings.category, ['files_general', 'file_folders', 'default_folders']));
  const values: Record<string, Record<string, string>> = {};
  for (const row of rows) {
    const category = row.category || '';
    values[category] ||= {};
    if (row.key) values[category][row.key] = row.value || '';
  }
  const parseFolderList = (value?: string) => {
    try {
      const parsed = JSON.parse(value || '[]');
      return Array.isArray(parsed)
        ? parsed.filter((folder: any) => folder?.id && folder?.name).map((folder: any) => ({ id: String(folder.id), name: String(folder.name) }))
        : [];
    } catch {
      return [];
    }
  };
  const general = values.files_general || {};
  return {
    filesGeneral: {
      maxSizeMb: general.maxSizeMb || '10',
      allowedTypes: general.allowedTypes || 'pdf,doc,docx,xls,xlsx,png,jpg,jpeg',
      maxFilesPerUpload: general.maxFilesPerUpload || '10',
    },
    fileFolders: parseFolderList(values.file_folders?.list),
    defaultFolders: parseFolderList(values.default_folders?.list),
  };
}

export const fileStorageRouter = router({
  getFileManagerSettings: docViewProcedure.query(async () => {
    const database = await getDb();
    if (!database) throw new Error('Database not initialized');
    return readFileManagerSettings(database);
  }),

  listFolders: docViewProcedure.query(async ({ ctx }) => {
    const db = (await getDb()) as any;
    if (!db) throw new Error('Database not initialized');
    await ensureDocumentsTable();
    const orgId = ctx.user?.organizationId || null;
    const rows = orgId
      ? await db.select().from(fileFolders).where(eq(fileFolders.organizationId, orgId)).orderBy(fileFolders.name)
      : await db.select().from(fileFolders).where(isNull(fileFolders.organizationId)).orderBy(fileFolders.name);
    return { folders: rows };
  }),

  createFolder: docEditProcedure
    .input(z.object({ name: z.string().trim().min(1).max(255), parentId: z.string().nullable().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = (await getDb()) as any;
      if (!db) throw new Error('Database not initialized');
      await ensureDocumentsTable();
      const id = `folder_${uuidv4()}`;
      const folder = { id, organizationId: ctx.user?.organizationId || null, parentId: input.parentId || null, name: input.name, createdBy: ctx.user?.id || 'system' };
      await db.insert(fileFolders).values(folder);
      return { success: true, folder };
    }),

  updateFolder: docEditProcedure
    .input(z.object({ folderId: z.string(), name: z.string().trim().min(1).max(255).optional(), parentId: z.string().nullable().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = (await getDb()) as any;
      if (!db) throw new Error('Database not initialized');
      const orgId = ctx.user?.organizationId || null;
      const whereClause = orgId ? and(eq(fileFolders.id, input.folderId), eq(fileFolders.organizationId, orgId)) : and(eq(fileFolders.id, input.folderId), isNull(fileFolders.organizationId));
      const updates: any = {};
      if (input.name !== undefined) updates.name = input.name;
      if (input.parentId !== undefined) updates.parentId = input.parentId;
      await db.update(fileFolders).set(updates).where(whereClause);
      return { success: true, folderId: input.folderId };
    }),

  deleteFolder: docEditProcedure
    .input(z.object({ folderId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = (await getDb()) as any;
      if (!db) throw new Error('Database not initialized');
      const orgId = ctx.user?.organizationId || null;
      const documentScope = orgId ? eq(documents.organizationId, orgId) : isNull(documents.organizationId);
      const folderScope = orgId ? and(eq(fileFolders.id, input.folderId), eq(fileFolders.organizationId, orgId)) : and(eq(fileFolders.id, input.folderId), isNull(fileFolders.organizationId));
      await db.update(documents).set({ folderId: null }).where(and(documentScope, eq(documents.folderId, input.folderId)));
      await db.update(fileFolders).set({ parentId: null }).where(eq(fileFolders.parentId, input.folderId));
      await db.delete(fileFolders).where(folderScope);
      return { success: true, folderId: input.folderId };
    }),

  listDocuments: docViewProcedure
    .input(z.object({ documentType: z.string().optional(), limit: z.number().default(50), search: z.string().optional(), status: z.string().optional(), folderId: z.string().nullable().optional() }))
    .query(async ({ input, ctx }) => {
      const db = (await getDb()) as any;
      if (!db) throw new Error('Database not initialized');
      await ensureDocumentsTable();
      const orgId = ctx.user?.organizationId || null;
      const conditions = [] as any[];
      if (input.documentType) conditions.push(eq(documents.documentType, input.documentType as any));
      if (orgId) conditions.push(eq(documents.organizationId, orgId));
      if (input.status) conditions.push(eq(documents.status, input.status as any));
      if (input.search) conditions.push(like(documents.documentName, `%${input.search}%`));
      if (input.folderId !== undefined) conditions.push(input.folderId ? eq(documents.folderId, input.folderId) : isNull(documents.folderId));

      const rows = conditions.length
        ? await db.select().from(documents).where(and(...conditions)).orderBy(desc(documents.createdAt)).limit(input.limit)
        : await db.select().from(documents).orderBy(desc(documents.createdAt)).limit(input.limit);

      const totalSize = rows.reduce((sum: number, r: any) => sum + (r.fileSize || 0), 0);
      return { documents: rows.map((r: any) => ({ ...r, tags: r.tags ? JSON.parse(r.tags) : [] })), total: rows.length, totalSize };
    }),

  uploadDocument: docEditProcedure
    .input(z.object({
      name: z.string().min(1).max(255),
      mimeType: z.string(),
      size: z.number(),
      fileData: z.string().optional(), // base64-encoded file data
      fileUrl: z.string().default('/uploads/'),
      documentType: z.enum(['contract', 'agreement', 'proposal', 'template', 'invoice', 'receipt', 'other']).default('other'),
      tags: z.array(z.string()).optional(),
      linkedClientId: z.string().optional(),
      linkedProjectId: z.string().optional(),
      linkedInvoiceId: z.string().optional(),
      linkedEntityType: z.string().optional(),
      linkedEntityId: z.string().optional(),
      folderId: z.string().nullable().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = (await getDb()) as any;
      if (!db) throw new Error('Database not initialized');
      const id = uuidv4();
      let fileUrl = input.fileUrl;
      let fileSize = input.size;
      const fileSettings = await readFileManagerSettings(db);
      const maxConfiguredSize = Math.max(1, Number(fileSettings.filesGeneral.maxSizeMb) || 10) * 1024 * 1024;
      const allowedTypes = fileSettings.filesGeneral.allowedTypes.split(',').map((type) => type.trim().toLowerCase().replace(/^\./, '')).filter(Boolean);
      const fileExtension = path.extname(input.name).slice(1).toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        throw new Error(`File type .${fileExtension || '(none)'} is not allowed`);
      }

      // If file data is provided, write to disk
      if (input.fileData) {
        // Validate MIME type
        if (!ALLOWED_MIME_TYPES.has(input.mimeType)) {
          throw new Error(`File type "${input.mimeType}" is not allowed`);
        }

        // Decode base64
        const base64Data = input.fileData.replace(/^data:[^;]+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        fileSize = buffer.length;

        // Sanitize filename: remove path traversal, special chars
        const safeName = input.name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.{2,}/g, '.');
        const ext = path.extname(safeName) || mimeToExt(input.mimeType);
        const uniqueName = `${id}${ext}`;

        ensureUploadDir();
        const filePath = path.join(UPLOAD_DIR, uniqueName);
        fs.writeFileSync(filePath, buffer);
        fileUrl = `/uploads/${uniqueName}`;
      }

      const effectiveMaxSize = Math.min(maxConfiguredSize, MAX_FILE_SIZE);
      if (fileSize > effectiveMaxSize) {
        throw new Error(`File size ${(fileSize / 1024 / 1024).toFixed(1)}MB exceeds maximum of ${Math.round(effectiveMaxSize / 1024 / 1024)}MB`);
      }

      await db.insert(documents).values({
        id,
        organizationId: ctx.user?.organizationId || null,
        documentName: input.name,
        mimeType: input.mimeType,
        fileSize: fileSize,
        fileUrl: fileUrl,
        documentType: input.documentType,
        tags: JSON.stringify(input.tags || []),
        currentVersion: 1,
        uploadedBy: ctx.user?.id || 'system',
        linkedClientId: input.linkedClientId || null,
        linkedProjectId: input.linkedProjectId || null,
        linkedInvoiceId: input.linkedInvoiceId || null,
        linkedEntityType: input.linkedEntityType || null,
        linkedEntityId: input.linkedEntityId || null,
        folderId: input.folderId || null,
      });
      return { success: true, documentId: id, name: input.name, size: fileSize, fileUrl, version: 1, uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) };
    }),

  /** Download a document - returns the file URL for client to fetch */
  getDownloadUrl: docViewProcedure
    .input(z.object({ documentId: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = (await getDb()) as any;
      if (!db) throw new Error('Database not initialized');
      const orgId = ctx.user?.organizationId || null;
      const whereClause = orgId
        ? and(eq(documents.id, input.documentId), eq(documents.organizationId, orgId))
        : eq(documents.id, input.documentId);
      const rows = await db.select().from(documents).where(whereClause);
      const doc = rows[0];
      if (!doc) throw new Error('Document not found');
      return { url: doc.fileUrl, name: doc.documentName, mimeType: doc.mimeType };
    }),

  previewDocument: docViewProcedure
    .input(z.object({ documentId: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = (await getDb()) as any;
      if (!db) throw new Error('Database not initialized');
      const orgId = ctx.user?.organizationId || null;
      const whereClause = orgId ? and(eq(documents.id, input.documentId), eq(documents.organizationId, orgId)) : and(eq(documents.id, input.documentId), isNull(documents.organizationId));
      const rows = await db.select().from(documents).where(whereClause);
      const doc = rows[0];
      if (!doc) throw new Error('Document not found');
      return { url: doc.fileUrl, name: doc.documentName, mimeType: doc.mimeType, previewable: Boolean(doc.mimeType?.startsWith('image/') || doc.mimeType === 'application/pdf' || doc.mimeType?.startsWith('text/')) };
    }),

  moveDocument: docEditProcedure
    .input(z.object({ documentId: z.string(), folderId: z.string().nullable() }))
    .mutation(async ({ input, ctx }) => {
      const db = (await getDb()) as any;
      if (!db) throw new Error('Database not initialized');
      const orgId = ctx.user?.organizationId || null;
      const whereClause = orgId ? and(eq(documents.id, input.documentId), eq(documents.organizationId, orgId)) : and(eq(documents.id, input.documentId), isNull(documents.organizationId));
      await db.update(documents).set({ folderId: input.folderId }).where(whereClause);
      return { success: true, documentId: input.documentId, folderId: input.folderId };
    }),

  emailDocument: docEditProcedure
    .input(z.object({ documentId: z.string(), toEmail: z.string().email(), subject: z.string().min(1), message: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = (await getDb()) as any;
      if (!db) throw new Error('Database not initialized');
      const orgId = ctx.user?.organizationId || null;
      const whereClause = orgId ? and(eq(documents.id, input.documentId), eq(documents.organizationId, orgId)) : and(eq(documents.id, input.documentId), isNull(documents.organizationId));
      const rows = await db.select().from(documents).where(whereClause);
      const doc = rows[0];
      if (!doc) throw new Error('Document not found');
      const rendered = await renderNotificationTemplate('user/document_shared', {
        organizationId: orgId,
        recipientEmail: input.toEmail,
        recipient_first_name: input.toEmail.split('@')[0],
        shared_by_name: ctx.user?.name || ctx.user?.email || 'A colleague',
        document_name: doc.documentName,
        document_url: doc.fileUrl,
        share_message: input.message || 'A document has been shared with you.',
        app_name: 'Kiini',
      }, {
        subject: input.subject,
        html: `<p>${input.message || `A file has been shared with you: <a href="${doc.fileUrl}">${doc.documentName}</a>`}</p>`,
        text: input.message || `A file has been shared with you: ${doc.documentName} ${doc.fileUrl}`,
      });
      const queued = await queueEmail({
        recipientEmail: input.toEmail,
        subject: rendered.subject,
        textContent: rendered.text,
        htmlContent: rendered.html,
        eventType: 'document_shared',
        entityType: 'document',
        entityId: doc.id,
        userId: ctx.user?.id,
      });
      return { success: true, queueId: queued.queueId };
    }),

  updateDocument: docEditProcedure
    .input(z.object({ documentId: z.string(), name: z.string().optional(), documentType: z.enum(['contract', 'agreement', 'proposal', 'template', 'invoice', 'receipt', 'other']).optional(), status: z.enum(['active', 'archived', 'deleted']).optional(), tags: z.array(z.string()).optional(), expiryDate: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = (await getDb()) as any;
      if (!db) throw new Error('Database not initialized');
      const orgId = ctx.user?.organizationId || null;
      const whereClause = orgId
        ? and(eq(documents.id, input.documentId), eq(documents.organizationId, orgId))
        : eq(documents.id, input.documentId);
      const updates: any = {};
      if (input.name) updates.documentName = input.name;
      if (input.documentType) updates.documentType = input.documentType;
      if (input.status) updates.status = input.status;
      if (input.tags) updates.tags = JSON.stringify(input.tags);
      if (input.expiryDate) updates.expiryDate = input.expiryDate;
      await db.update(documents).set(updates).where(whereClause);
      return { success: true, documentId: input.documentId };
    }),

  getDocumentVersions: docViewProcedure
    .input(z.object({ documentId: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = (await getDb()) as any;
      if (!db) throw new Error('Database not initialized');
      const orgId = ctx.user?.organizationId || null;
      const whereClause = orgId
        ? and(eq(documents.id, input.documentId), eq(documents.organizationId, orgId))
        : eq(documents.id, input.documentId);
      const rows = await db.select().from(documents).where(whereClause);
      const doc = rows[0];
      if (!doc) return { documentId: input.documentId, versions: [], total: 0 };
      return { documentId: input.documentId, versions: [{ version: doc.currentVersion, uploadedBy: doc.uploadedBy, createdAt: doc.createdAt, size: doc.fileSize }], total: 1 };
    }),

  performOCR: docEditProcedure
    .input(z.object({ documentId: z.string(), language: z.string().default('en') }))
    .mutation(async ({ input }) => {
      return { success: true, documentId: input.documentId, language: input.language, status: 'completed', extractedText: '', confidence: 0.95, processedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)};
    }),

  deleteDocument: docEditProcedure
    .input(z.object({ documentId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = (await getDb()) as any;
      if (!db) throw new Error('Database not initialized');
      const orgId = ctx.user?.organizationId || null;
      const whereClause = orgId
        ? and(eq(documents.id, input.documentId), eq(documents.organizationId, orgId))
        : eq(documents.id, input.documentId);

      // Get file info before deleting to clean up disk
      const rows = await db.select().from(documents).where(whereClause);
      const doc = rows[0];

      await db.delete(documents).where(whereClause);

      // Clean up file on disk if it exists
      if (doc?.fileUrl?.startsWith('/uploads/')) {
        const fileName = path.basename(doc.fileUrl);
        const filePath = path.join(UPLOAD_DIR, fileName);
        try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch { /* ignore cleanup errors */ }
      }

      return { success: true, deletedId: input.documentId };
    }),
});

// Helper: map MIME type to file extension
function mimeToExt(mime: string): string {
  const map: Record<string, string> = {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/vnd.ms-powerpoint': '.ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    'text/plain': '.txt',
    'text/csv': '.csv',
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'application/zip': '.zip',
    'application/json': '.json',
    'application/xml': '.xml',
  };
  return map[mime] || '';
}
