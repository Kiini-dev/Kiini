import { observable } from "@trpc/server/observable";
import { protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { EventEmitter } from "events";

// Global event emitter for broadcasting notifications
const notificationEmitter = new EventEmitter();
notificationEmitter.setMaxListeners(1000); // Support many concurrent subscribers

// Types for real-time events
export interface RealtimeNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "reminder";
  category: string;
  entityType: string;
  entityId: string;
  actionUrl?: string;
  isRead: number;
  createdAt: string;
}

export interface RealtimeEvent {
  type: "notification_received" | "notification_read" | "notification_deleted" | "notification_count_changed";
  data: any;
  timestamp: string;
}

/**
 * Broadcast a notification to subscribed clients
 */
export async function broadcastNotification(userId: string, notification: RealtimeNotification) {
  const event: RealtimeEvent = {
    type: "notification_received",
    data: notification,
    timestamp: new Date().toISOString(),
  };
  
  console.log(`[BROADCAST] Notification to user ${userId}:`, notification.title);
  notificationEmitter.emit(`user:${userId}:notifications`, event);
}

/**
 * Broadcast notification read event
 */
export function broadcastNotificationRead(userId: string, notificationId: string) {
  const event: RealtimeEvent = {
    type: "notification_read",
    data: { notificationId },
    timestamp: new Date().toISOString(),
  };
  
  notificationEmitter.emit(`user:${userId}:notifications`, event);
}

/**
 * Broadcast notification deleted event
 */
export function broadcastNotificationDeleted(userId: string, notificationId: string) {
  const event: RealtimeEvent = {
    type: "notification_deleted",
    data: { notificationId },
    timestamp: new Date().toISOString(),
  };
  
  notificationEmitter.emit(`user:${userId}:notifications`, event);
}

/**
 * Broadcast unread count change
 */
export function broadcastUnreadCountChanged(userId: string, count: number) {
  const event: RealtimeEvent = {
    type: "notification_count_changed",
    data: { unreadCount: count },
    timestamp: new Date().toISOString(),
  };
  
  notificationEmitter.emit(`user:${userId}:notifications`, event);
}

/**
 * TRPC subscription for real-time notifications
 */
export const notificationsSubscription = protectedProcedure.subscription(({ ctx }) => {
  return observable<RealtimeEvent>((emit) => {
    // Handler for notification events
    const onNotification = (event: RealtimeEvent) => {
      emit.next(event);
    };

    // Subscribe to user-specific notification channel
    const channelName = `user:${ctx.user.id}:notifications`;
    notificationEmitter.on(channelName, onNotification);

    console.log(`[WS] User ${ctx.user.id} subscribed to notifications`);

    // Cleanup on disconnect
    return () => {
      notificationEmitter.off(channelName, onNotification);
      console.log(`[WS] User ${ctx.user.id} unsubscribed from notifications`);
    };
  });
});

/**
 * Remove the notification emitter listener to prevent memory leaks
 */
export function cleanupNotificationListener(userId: string, callback: Function) {
  const channelName = `user:${userId}:notifications`;
  notificationEmitter.removeListener(channelName, callback as any);
}
