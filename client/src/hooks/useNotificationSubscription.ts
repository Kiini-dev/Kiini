import { useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";

interface RealtimeEvent {
  type: "notification_received" | "notification_read" | "notification_deleted" | "notification_count_changed";
  data: any;
  timestamp: string;
}

interface UseNotificationSubscriptionOptions {
  onNotificationReceived?: (event: RealtimeEvent) => void;
  onNotificationRead?: (notificationId: string) => void;
  onNotificationDeleted?: (notificationId: string) => void;
  onUnreadCountChanged?: (count: number) => void;
}

/**
 * Hook to subscribe to real-time notifications
 */
export function useNotificationSubscription(
  options: UseNotificationSubscriptionOptions = {}
) {
  const { onNotificationReceived, onNotificationRead, onNotificationDeleted, onUnreadCountChanged } = options;

  // Subscribe to notification updates from server
  const subscription = trpc.notifications.onNotification.useSubscription(undefined, {
    onData: (event: RealtimeEvent) => {
      console.log("[WS] Received event:", event.type);

      // Global callback for all events
      onNotificationReceived?.(event);

      // Specific callbacks based on event type
      switch (event.type) {
        case "notification_received":
          console.log("[WS] New notification:", event.data.title);
          break;
        case "notification_read":
          onNotificationRead?.(event.data.notificationId);
          console.log("[WS] Notification read:", event.data.notificationId);
          break;
        case "notification_deleted":
          onNotificationDeleted?.(event.data.notificationId);
          console.log("[WS] Notification deleted:", event.data.notificationId);
          break;
        case "notification_count_changed":
          onUnreadCountChanged?.(event.data.unreadCount);
          console.log("[WS] Unread count changed:", event.data.unreadCount);
          break;
      }
    },
    onError: (error) => {
      console.error("[WS] Subscription error:", error);
    },
  });

  // Connection status
  const isConnected = subscription.status === "pending" || subscription.status === "connecting";

  // Manual reconnect function
  const reconnect = useCallback(() => {
    console.log("[WS] Attempting to reconnect...");
    subscription.reset?.();
  }, [subscription]);

  // Auto-reconnect with exponential backoff
  useEffect(() => {
    if (subscription.status === "error" || subscription.status === "idle") {
      const timer = setTimeout(() => {
        console.log("[WS] Auto-reconnecting after error...");
        reconnect();
      }, 5000); // Wait 5 seconds before reconnecting

      return () => clearTimeout(timer);
    }
  }, [subscription.status, reconnect]);

  return {
    isConnected,
    status: subscription.status as "connecting" | "connected" | "disconnected" | "error" | "idle",
    reconnect,
  };
}
