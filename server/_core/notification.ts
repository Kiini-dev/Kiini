import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { v4 as uuidv4 } from "uuid";
import { and, eq } from "drizzle-orm";
import { notifications, users } from "../../drizzle/schema";

export type NotificationPayload = {
  title: string;
  content: string;
};

const TITLE_MAX_LENGTH = 1200;
const CONTENT_MAX_LENGTH = 20000;

const trimValue = (value: string): string => value.trim();
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const validatePayload = (input: NotificationPayload): NotificationPayload => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required.",
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required.",
    });
  }

  const title = trimValue(input.title);
  const content = trimValue(input.content);

  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`,
    });
  }

  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`,
    });
  }

  return { title, content };
};

/**
 * Stores a notification for active Kiini platform administrators.
 */
export async function notifyOwner(
  payload: NotificationPayload
): Promise<boolean> {
  const { title, content } = validatePayload(payload);

  try {
    const database = await getDb();
    if (!database) throw new Error("Database not available");
    const owners = await database.select({ id: users.id }).from(users).where(
      and(eq(users.role, "super_admin"), eq(users.isActive, 1)),
    );
    if (!owners.length) return false;

    await Promise.all(owners.map(({ id }) => database.insert(notifications).values({
      id: uuidv4(),
      userId: id,
      type: "system",
      title,
      message: content,
      category: "system",
      priority: "high",
      deliveryStatus: "sent",
      deliveryDate: new Date().toISOString(),
    })));
    return true;
  } catch (error) {
    console.warn("[Notification] Could not notify Kiini platform administrators:", error);
    return false;
  }
}

/**
 * Create an in-app notification in the database
 */
export async function createNotification(input: {
  userId: string;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error" | "reminder" | "payment" | "project" | "client" | "financial" | "system";
  category?: string;
  entityType?: string;
  entityId?: string;
  priority?: "low" | "normal" | "medium" | "high" | "critical";
  actionUrl?: string;
  organizationId?: string;
}): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      console.error("[Notification] Database not available");
      return false;
    }

    await db.insert(notifications).values({
      id: uuidv4(),
      userId: input.userId,
      title: input.title,
      message: input.message,
      type: input.type || "info",
      category: input.category,
      entityType: input.entityType,
      entityId: input.entityId,
      priority: input.priority || "normal",
      actionUrl: input.actionUrl,
      deliveryStatus: "sent",
      deliveryDate: new Date().toISOString(),
    } as any);

    console.log(`[Notification] Created notification for user ${input.userId}`);
    return true;
  } catch (error) {
    console.error("[Notification] Error creating notification:", error);
    return false;
  }
}
