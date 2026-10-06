import { z } from "zod";
import { protectedProcedure, router, createFeatureRestrictedProcedure } from "../_core/trpc";
import { getDb, getPool } from "../db";
import { staffChatMessages, staffChatChannels, users } from "../../drizzle/schema";
import { eq, desc, like, or, and, inArray, count } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { TRPCError } from "@trpc/server";

function normalizeMembers(members: unknown): string[] {
  if (Array.isArray(members)) {
    return members.filter((m) => typeof m === "string");
  }
  if (typeof members === "string") {
    try {
      const parsed = JSON.parse(members);
      if (Array.isArray(parsed)) {
        return parsed.filter((m) => typeof m === "string");
      }
    } catch {
      return [];
    }
  }
  return [];
}

// Define typed procedures
const createProcedure = createFeatureRestrictedProcedure("chat:send");
const readProcedure = createFeatureRestrictedProcedure("chat:read");
const deleteProcedure = createFeatureRestrictedProcedure("chat:delete");

let staffChatTableReady: Promise<void> | null = null;
let staffChatChannelsReady: Promise<void> | null = null;

function ensureStaffChatChannelsTable() {
  if (!staffChatChannelsReady) {
    staffChatChannelsReady = (async () => {
      const pool = getPool();
      if (!pool) throw new Error("Database pool not initialized");
      await pool.query(`CREATE TABLE IF NOT EXISTS staffChatChannels (
        id VARCHAR(64) NOT NULL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(20) NOT NULL DEFAULT 'team',
        description VARCHAR(255) NULL,
        members JSON NULL,
        createdBy VARCHAR(64) NOT NULL,
        isActive TINYINT NOT NULL DEFAULT 1,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    })().catch((error) => {
      staffChatChannelsReady = null;
      throw error;
    });
  }
  return staffChatChannelsReady;
}

function ensureStaffChatMessagesTable() {
  if (!staffChatTableReady) {
    staffChatTableReady = (async () => {
      const pool = getPool();
      if (!pool) throw new Error("Database pool not initialized");
      await pool.query(`CREATE TABLE IF NOT EXISTS staffChatMessages (
        id VARCHAR(64) NOT NULL PRIMARY KEY,
        channelId VARCHAR(100) NOT NULL,
        userId VARCHAR(64) NULL,
        userName VARCHAR(255) NULL,
        content TEXT NULL,
        emoji VARCHAR(10) NULL,
        replyToId VARCHAR(64) NULL,
        replyToUser VARCHAR(255) NULL,
        fileUrl VARCHAR(500) NULL,
        fileName VARCHAR(255) NULL,
        fileType VARCHAR(50) NULL,
        isEdited TINYINT NOT NULL DEFAULT 0,
        createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_channel_id (channelId),
        INDEX idx_user_id (userId),
        INDEX idx_created_at (createdAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
      const [columnRows] = await pool.query("SHOW COLUMNS FROM staffChatMessages");
      const existing = new Set((Array.isArray(columnRows) ? columnRows : []).map((row: any) => String(row.Field).toLowerCase()));
      const required: Record<string, string> = {
        userId: "VARCHAR(64) NULL",
        userName: "VARCHAR(255) NULL",
        content: "TEXT NULL",
        emoji: "VARCHAR(10) NULL",
        replyToId: "VARCHAR(64) NULL",
        replyToUser: "VARCHAR(255) NULL",
        fileUrl: "VARCHAR(500) NULL",
        fileName: "VARCHAR(255) NULL",
        fileType: "VARCHAR(50) NULL",
        isEdited: "TINYINT NOT NULL DEFAULT 0",
        createdAt: "TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP",
        updatedAt: "TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP",
        encryptedKeys: "TEXT NULL",
        encryptionNonce: "VARCHAR(64) NULL",
        encryptionVersion: "VARCHAR(10) NULL",
        senderPublicKey: "TEXT NULL",
      };
      for (const [column, definition] of Object.entries(required)) {
        if (!existing.has(column.toLowerCase())) {
          await pool.query(`ALTER TABLE staffChatMessages ADD COLUMN ${column} ${definition}`);
        }
      }
    })().catch((error) => {
      staffChatTableReady = null;
      throw error;
    });
  }
  return staffChatTableReady;
}

let staffChatPresenceReady: Promise<void> | null = null;

function ensureStaffChatPresenceTable() {
  if (!staffChatPresenceReady) {
    staffChatPresenceReady = (async () => {
      const pool = getPool();
      if (!pool) throw new Error("Database pool not initialized");
      await pool.query(`CREATE TABLE IF NOT EXISTS staffChatPresence (
        userId VARCHAR(64) NOT NULL PRIMARY KEY,
        lastSeen TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) NOT NULL DEFAULT 'online',
        publicKey TEXT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
      const [presenceColumns] = await pool.query("SHOW COLUMNS FROM staffChatPresence");
      const hasPublicKey = (Array.isArray(presenceColumns) ? presenceColumns : []).some((row: any) => String(row.Field).toLowerCase() === "publickey");
      if (!hasPublicKey) await pool.query("ALTER TABLE staffChatPresence ADD COLUMN publicKey TEXT NULL");
    })().catch((error) => {
      staffChatPresenceReady = null;
      throw error;
    });
  }
  return staffChatPresenceReady;
}

export const staffChatRouter = router({
  registerPublicKey: readProcedure
    .input(z.object({ publicKey: z.string().min(20).max(5000) }))
    .mutation(async ({ ctx, input }) => {
      await ensureStaffChatPresenceTable();
      const pool = getPool();
      if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      await pool.query("INSERT INTO staffChatPresence (userId, lastSeen, status, publicKey) VALUES (?, CURRENT_TIMESTAMP, 'online', ?) ON DUPLICATE KEY UPDATE lastSeen = CURRENT_TIMESTAMP, status = 'online', publicKey = VALUES(publicKey)", [ctx.user.id, input.publicKey]);
      return { success: true };
    }),
  getDirectory: readProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    await ensureStaffChatPresenceTable();
    const pool = getPool();
    const [userRows, employeeRows] = await Promise.all([
      db.select({ id: users.id, name: users.name, email: users.email }).from(users),
      pool
        ? pool.query("SELECT id, userId, firstName, lastName, email FROM employees").then(([rows]) => rows as any[])
        : Promise.resolve([]),
    ]);
    const usersById = new Map<string, any>();
    for (const user of userRows as any[]) {
      usersById.set(user.id, { userId: user.id, userName: user.name || user.email || user.id, email: user.email || "", source: "user" });
    }
    for (const employee of employeeRows as any[]) {
      const userId = employee.userId || employee.id;
      if (!usersById.has(userId)) {
        usersById.set(userId, { userId, userName: [employee.firstName, employee.lastName].filter(Boolean).join(" ") || employee.email || userId, email: employee.email || "", source: "employee" });
      }
    }
    const [presenceRows] = pool ? await pool.query("SELECT userId, lastSeen, status, publicKey FROM staffChatPresence") : [[]];
    const presence = new Map((Array.isArray(presenceRows) ? presenceRows : []).map((row: any) => [row.userId, row]));
    return Array.from(usersById.values()).filter((user) => user.userId !== ctx.user.id).map((user) => {
      const row: any = presence.get(user.userId);
      const online = row?.status === "online" && row?.lastSeen && Date.now() - new Date(row.lastSeen).getTime() < 90_000;
      return { ...user, publicKey: row?.publicKey || null, online: Boolean(online), lastSeen: row?.lastSeen || null };
    });
  }),

  heartbeat: readProcedure.mutation(async ({ ctx }) => {
    await ensureStaffChatPresenceTable();
    const pool = getPool();
    if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    await pool.query("INSERT INTO staffChatPresence (userId, lastSeen, status) VALUES (?, CURRENT_TIMESTAMP, 'online') ON DUPLICATE KEY UPDATE lastSeen = CURRENT_TIMESTAMP, status = 'online'", [ctx.user.id]);
    return { success: true };
  }),
  // ===== CHANNEL MANAGEMENT =====

  // Create a channel (team or private)
  createChannel: createProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      type: z.enum(["team", "private"]),
      description: z.string().max(255).optional(),
      members: z.array(z.string()).min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      await ensureStaffChatChannelsTable();

      const channelId = uuidv4();
      // Always include the creator as a member
      const memberList = Array.from(new Set([ctx.user.id, ...input.members]));

      // For private chats, check if one already exists between these two users
      if (input.type === "private" && memberList.length === 2) {
        const existing = await db.select().from(staffChatChannels).where(
          and(eq(staffChatChannels.type, "private"), eq(staffChatChannels.isActive, 1))
        );
        const found = existing.find((ch: any) => {
          const chMembers = (ch.members as string[]) || [];
          return chMembers.length === 2 && memberList.every(m => chMembers.includes(m));
        });
        if (found) return found;
      }

      await db.insert(staffChatChannels).values({
        id: channelId,
        name: input.name,
        type: input.type,
        description: input.description ?? null,
        members: memberList,
        createdBy: ctx.user.id,
        isActive: 1,
      });

      const rows = await db.select().from(staffChatChannels).where(eq(staffChatChannels.id, channelId)).limit(1);
      return rows[0];
    }),

  // List channels the user belongs to (+ "general" always)
  listChannels: readProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [
      { id: "general", name: "General Chat", type: "general", description: "Open channel for all staff", members: [], createdBy: "system", isActive: 1, createdAt: null, updatedAt: null },
    ];
    await ensureStaffChatChannelsTable();

    try {
      const allChannels = await db.select().from(staffChatChannels).where(eq(staffChatChannels.isActive, 1));
      const myChannels = allChannels.filter((ch: any) => {
        const members = normalizeMembers(ch.members);
        return ch.type === "team" || members.includes(ctx.user.id);
      });

      return [
        { id: "general", name: "General Chat", type: "general", description: "Open channel for all staff", members: [], createdBy: "system", isActive: 1, createdAt: null, updatedAt: null },
        ...myChannels,
      ];
    } catch (error) {
      console.error("staffChat.listChannels error:", error);
      return [
        { id: "general", name: "General Chat", type: "general", description: "Open channel for all staff", members: [], createdBy: "system", isActive: 1, createdAt: null, updatedAt: null },
      ];
    }
  }),

  // Update channel
  updateChannel: createProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).max(100).optional(),
      description: z.string().max(255).optional(),
      members: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const updates: any = {};
      if (input.name) updates.name = input.name;
      if (input.description !== undefined) updates.description = input.description;
      if (input.members) updates.members = input.members;

      await db.update(staffChatChannels).set(updates).where(eq(staffChatChannels.id, input.id));
      const rows = await db.select().from(staffChatChannels).where(eq(staffChatChannels.id, input.id)).limit(1);
      return rows[0];
    }),

  // Delete / archive channel
  deleteChannel: deleteProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      await db.update(staffChatChannels).set({ isActive: 0 }).where(eq(staffChatChannels.id, input.id));
      return { success: true };
    }),

  // ===== MESSAGES =====

  // Send a new message
  sendMessage: createProcedure
    .input(
      z.object({
        content: z.string().min(1).max(2000),
        encryptedKeys: z.string().optional(),
        encryptionNonce: z.string().optional(),
        encryptionVersion: z.string().optional(),
        senderPublicKey: z.string().optional(),
        channelId: z.string().default("general"),
        emoji: z.string().optional(),
        replyToId: z.string().optional(),
        fileUrl: z.string().max(2000).optional(),
        fileName: z.string().max(255).optional(),
        fileType: z.string().max(50).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      let replyToUser: string | undefined;
      if (input.replyToId) {
        const replyMsg = await db.select().from(staffChatMessages).where(eq(staffChatMessages.id, input.replyToId)).limit(1);
        replyToUser = replyMsg[0]?.userName;
      }

      const messageId = uuidv4();
      await db.insert(staffChatMessages).values({
        id: messageId,
        channelId: input.channelId,
        userId: ctx.user.id,
        userName: ctx.user.name || ctx.user.email || "Unknown",
        content: input.content,
        encryptedKeys: input.encryptedKeys ?? null,
        encryptionNonce: input.encryptionNonce ?? null,
        encryptionVersion: input.encryptionVersion ?? null,
        senderPublicKey: input.senderPublicKey ?? null,
        emoji: input.emoji ?? null,
        replyToId: input.replyToId ?? null,
        replyToUser: replyToUser ?? null,
        fileUrl: input.fileUrl ?? null,
        fileName: input.fileName ?? null,
        fileType: input.fileType ?? null,
        isEdited: 0,
      });

      const rows = await db.select().from(staffChatMessages).where(eq(staffChatMessages.id, messageId)).limit(1);
      return rows[0];
    }),

  // Get messages with pagination, filtered by channel
  getMessages: readProcedure
    .input(
      z.object({
        channelId: z.string().default("general"),
        limit: z.number().max(100).default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { messages: [], total: 0, hasMore: false };
      await ensureStaffChatMessagesTable();

      const rows = await db
        .select()
        .from(staffChatMessages)
        .where(eq(staffChatMessages.channelId, input.channelId))
        .orderBy(desc(staffChatMessages.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const countRows = await db.select({ total: count() }).from(staffChatMessages)
        .where(eq(staffChatMessages.channelId, input.channelId));
      const total = Number(countRows[0]?.total ?? 0);

      return {
        messages: rows.reverse(),
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Delete a message (only by sender or admin)
  deleteMessage: deleteProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const rows = await db.select().from(staffChatMessages).where(eq(staffChatMessages.id, input.id)).limit(1);
      if (!rows.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Message not found" });
      }

      const message = rows[0];
      if (message.userId !== ctx.user.id && ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete your own messages" });
      }

      await db.delete(staffChatMessages).where(eq(staffChatMessages.id, input.id));
      return { success: true };
    }),

  // Edit a message (only by sender)
  editMessage: createProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.string().min(1).max(2000),
        encryptedKeys: z.string().optional(),
        encryptionNonce: z.string().optional(),
        encryptionVersion: z.string().optional(),
        senderPublicKey: z.string().optional(),
        emoji: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const rows = await db.select().from(staffChatMessages).where(eq(staffChatMessages.id, input.id)).limit(1);
      if (!rows.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Message not found" });
      }

      const message = rows[0];
      if (message.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only edit your own messages" });
      }

      await db.update(staffChatMessages).set({
        content: input.content,
        encryptedKeys: input.encryptedKeys ?? message.encryptedKeys,
        encryptionNonce: input.encryptionNonce ?? message.encryptionNonce,
        encryptionVersion: input.encryptionVersion ?? message.encryptionVersion,
        senderPublicKey: input.senderPublicKey ?? message.senderPublicKey,
        emoji: input.emoji ?? message.emoji,
        isEdited: 1,
      }).where(eq(staffChatMessages.id, input.id));

      const updated = await db.select().from(staffChatMessages).where(eq(staffChatMessages.id, input.id)).limit(1);
      return updated[0];
    }),

  // Get online members (users who sent messages recently)
  getMembers: readProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    await ensureStaffChatMessagesTable();

    const rows = await db
      .select()
      .from(staffChatMessages)
      .orderBy(desc(staffChatMessages.createdAt))
      .limit(200);

    const seen = new Map<string, { userId: string; userName: string; lastSeen: string }>();
    for (const row of rows) {
      if (!seen.has(row.userId)) {
        seen.set(row.userId, { userId: row.userId, userName: row.userName, lastSeen: row.createdAt || "" });
      }
    }

    return Array.from(seen.values());
  }),

  // Search messages
  searchMessages: readProcedure
    .input(z.object({ query: z.string().min(1), channelId: z.string().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const q = `%${input.query}%`;
      const conditions = [
        or(
          like(staffChatMessages.content, q),
          like(staffChatMessages.userName, q)
        ),
      ];
      if (input.channelId) {
        conditions.push(eq(staffChatMessages.channelId, input.channelId));
      }

      return db.select().from(staffChatMessages).where(
        conditions.length > 1 ? and(...conditions) : conditions[0]
      ).orderBy(desc(staffChatMessages.createdAt)).limit(50);
    }),

  // Clear chat history (admin only)
  clearHistory: deleteProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can clear chat history" });
    }

    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    await db.delete(staffChatMessages);
    return { success: true };
  }),

  // Mark messages as read up to a given message ID
  markChatRead: createProcedure
    .input(z.object({
      channelId: z.string().default("general"),
      lastReadMessageId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const p = getPool();
      if (!p) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const id = `crs_${ctx.user.id}_${input.channelId}`;
      await p.query(
        `INSERT INTO chat_read_status (id, user_id, channel_id, last_read_message_id)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE last_read_message_id = VALUES(last_read_message_id), read_at = NOW()`,
        [id, ctx.user.id, input.channelId, input.lastReadMessageId]
      );
      return { success: true };
    }),

  // Get unread message count per channel for current user
  getUnreadCounts: readProcedure.query(async ({ ctx }) => {
    const p = getPool();
    if (!p) return [];

    const [rows] = await p.query(
      `SELECT m.channelId AS channelId, COUNT(*) AS unreadCount
       FROM staffChatMessages m
       LEFT JOIN chat_read_status crs
         ON crs.user_id = ? AND crs.channel_id = m.channelId
       WHERE m.userId != ?
         AND (crs.last_read_message_id IS NULL OR m.id > crs.last_read_message_id)
       GROUP BY m.channelId`,
      [ctx.user.id, ctx.user.id]
    );
    return rows as { channelId: string; unreadCount: number }[];
  }),

  // Get unread messages only (for floating notification popups)
  getUnreadMessages: readProcedure
    .input(
      z.object({
        channelId: z.string().optional(),
        limit: z.number().max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const p = getPool();
      if (!p) return [];

      const query = input.channelId
        ? `SELECT m.*
           FROM staffChatMessages m
           LEFT JOIN chat_read_status crs
             ON crs.user_id = ? AND crs.channel_id = m.channelId
           WHERE m.userId != ?
             AND m.channelId = ?
             AND (crs.last_read_message_id IS NULL OR m.id > crs.last_read_message_id)
           ORDER BY m.createdAt DESC
           LIMIT ?`
        : `SELECT m.*
           FROM staffChatMessages m
           LEFT JOIN chat_read_status crs
             ON crs.user_id = ? AND crs.channel_id = m.channelId
           WHERE m.userId != ?
             AND (crs.last_read_message_id IS NULL OR m.id > crs.last_read_message_id)
           ORDER BY m.createdAt DESC
           LIMIT ?`;

      const params = input.channelId
        ? [ctx.user.id, ctx.user.id, input.channelId, input.limit]
        : [ctx.user.id, ctx.user.id, input.limit];

      const [rows] = await p.query(query, params);
      return rows || [];
    }),

  // List all active system users for member selection (private chat, group channel)
  listUsers: readProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const orgId = ctx.user.organizationId;
    let rows: any[];
    if (orgId) {
      rows = await db
        .select({ id: users.id, name: users.name, email: users.email, department: users.department, role: users.role })
        .from(users)
        .where(and(eq(users.isActive, 1), eq(users.organizationId, orgId)));
    } else {
      rows = await db
        .select({ id: users.id, name: users.name, email: users.email, department: users.department, role: users.role })
        .from(users)
        .where(eq(users.isActive, 1));
    }
    return rows;
  }),
});
