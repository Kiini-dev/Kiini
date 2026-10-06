/**
 * Notification Broadcasting System
 * 
 * Broadcasts notifications across all browser tabs using BroadcastChannel API
 * Falls back to localStorage events for cross-domain scenarios
 */

import { toast } from "sonner";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface NotificationPayload {
  type: NotificationType;
  message: string;
  title?: string;
  timestamp: number;
  id: string;
  dismissible?: boolean;
  action?: {
    label: string;
    href?: string;
  };
}

/**
 * Broadcast channel for notifications
 */
let broadcastChannel: BroadcastChannel | null = null;

/**
 * Initialize notification broadcasting system
 */
export function initNotificationBroadcasting() {
  try {
    // Try to use BroadcastChannel for same-origin cross-tab communication
    broadcastChannel = new BroadcastChannel("kiini_notifications");

    broadcastChannel.addEventListener("message", (event: MessageEvent) => {
      const payload = event.data as NotificationPayload;
      if (payload && payload.type && payload.message) {
        displayNotification(payload);
      }
    });

    console.log("✓ Notification broadcasting initialized via BroadcastChannel");
  } catch (error) {
    // BroadcastChannel not supported, use storage events as fallback
    console.warn("BroadcastChannel not available, using localStorage fallback");
    setupStorageEventFallback();
  }
}

/**
 * Fallback: Use storage events for cross-tab notification
 */
function setupStorageEventFallback() {
  window.addEventListener("storage", (event: StorageEvent) => {
    if (event.key === "kiini_notification_broadcast" && event.newValue) {
      try {
        const payload = JSON.parse(event.newValue) as NotificationPayload;
        displayNotification(payload);
      } catch (error) {
        console.error("Failed to parse notification from storage:", error);
      }
    }
  });
}

/**
 * Broadcast a notification to all tabs
 */
export function broadcastNotification(
  type: NotificationType,
  message: string,
  title?: string,
  action?: { label: string; href?: string }
) {
  const payload: NotificationPayload = {
    type,
    message,
    title,
    timestamp: Date.now(),
    id: `notif_${Date.now()}_${Math.random()}`,
    dismissible: true,
    action,
  };

  // Display in current tab
  displayNotification(payload);

  // Broadcast to other tabs
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(payload);
    } catch (error) {
      console.error("Failed to broadcast notification:", error);
    }
  } else {
    // Fallback: use localStorage
    try {
      localStorage.setItem("kiini_notification_broadcast", JSON.stringify(payload));
    } catch (error) {
      console.error("Failed to broadcast via storage:", error);
    }
  }
}

/**
 * Display notification in current tab
 */
function displayNotification(payload: NotificationPayload) {
  const options: any = {
    description: payload.title,
  };

  if (payload.action) {
    options.action = {
      label: payload.action.label,
      onClick: () => {
        if (payload.action?.href) {
          window.location.href = payload.action.href;
        }
      },
    };
  }

  switch (payload.type) {
    case "success":
      toast.success(payload.message, options);
      break;
    case "error":
      toast.error(payload.message, options);
      break;
    case "warning":
      toast.warning(payload.message, options);
      break;
    case "info":
    default:
      toast.message(payload.message, options);
  }
}

/**
 * Convenience functions
 */
export function broadcastSuccess(message: string, title?: string) {
  broadcastNotification("success", message, title);
}

export function broadcastError(message: string, title?: string) {
  broadcastNotification("error", message, title);
}

export function broadcastWarning(message: string, title?: string) {
  broadcastNotification("warning", message, title);
}

export function broadcastInfo(message: string, title?: string) {
  broadcastNotification("info", message, title);
}

/**
 * Cleanup on page unload
 */
export function cleanupNotificationBroadcasting() {
  if (broadcastChannel) {
    broadcastChannel.close();
    broadcastChannel = null;
  }
}

/**
 * Custom hook for React components
 */
export function useNotificationBroadcaster() {
  return {
    success: broadcastSuccess,
    error: broadcastError,
    warning: broadcastWarning,
    info: broadcastInfo,
    broadcast: broadcastNotification,
  };
}
