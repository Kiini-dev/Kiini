"use strict";
/**
 * Notification Broadcasting System
 *
 * Broadcasts notifications across all browser tabs using BroadcastChannel API
 * Falls back to localStorage events for cross-domain scenarios
 */
exports.__esModule = true;
exports.useNotificationBroadcaster = exports.cleanupNotificationBroadcasting = exports.broadcastInfo = exports.broadcastWarning = exports.broadcastError = exports.broadcastSuccess = exports.broadcastNotification = exports.initNotificationBroadcasting = void 0;
var sonner_1 = require("sonner");
/**
 * Broadcast channel for notifications
 */
var broadcastChannel = null;
/**
 * Initialize notification broadcasting system
 */
function initNotificationBroadcasting() {
    try {
        // Try to use BroadcastChannel for same-origin cross-tab communication
        broadcastChannel = new BroadcastChannel("kiini_notifications");
        broadcastChannel.addEventListener("message", function (event) {
            var payload = event.data;
            if (payload && payload.type && payload.message) {
                displayNotification(payload);
            }
        });
        console.log("✓ Notification broadcasting initialized via BroadcastChannel");
    }
    catch (error) {
        // BroadcastChannel not supported, use storage events as fallback
        console.warn("BroadcastChannel not available, using localStorage fallback");
        setupStorageEventFallback();
    }
}
exports.initNotificationBroadcasting = initNotificationBroadcasting;
/**
 * Fallback: Use storage events for cross-tab notification
 */
function setupStorageEventFallback() {
    window.addEventListener("storage", function (event) {
        if (event.key === "kiini_notification_broadcast" && event.newValue) {
            try {
                var payload = JSON.parse(event.newValue);
                displayNotification(payload);
            }
            catch (error) {
                console.error("Failed to parse notification from storage:", error);
            }
        }
    });
}
/**
 * Broadcast a notification to all tabs
 */
function broadcastNotification(type, message, title, action) {
    var payload = {
        type: type,
        message: message,
        title: title,
        timestamp: Date.now(),
        id: "notif_" + Date.now() + "_" + Math.random(),
        dismissible: true,
        action: action
    };
    // Display in current tab
    displayNotification(payload);
    // Broadcast to other tabs
    if (broadcastChannel) {
        try {
            broadcastChannel.postMessage(payload);
        }
        catch (error) {
            console.error("Failed to broadcast notification:", error);
        }
    }
    else {
        // Fallback: use localStorage
        try {
            localStorage.setItem("kiini_notification_broadcast", JSON.stringify(payload));
        }
        catch (error) {
            console.error("Failed to broadcast via storage:", error);
        }
    }
}
exports.broadcastNotification = broadcastNotification;
/**
 * Display notification in current tab
 */
function displayNotification(payload) {
    var options = {
        description: payload.title
    };
    if (payload.action) {
        options.action = {
            label: payload.action.label,
            onClick: function () {
                var _a;
                if ((_a = payload.action) === null || _a === void 0 ? void 0 : _a.href) {
                    window.location.href = payload.action.href;
                }
            }
        };
    }
    switch (payload.type) {
        case "success":
            sonner_1.toast.success(payload.message, options);
            break;
        case "error":
            sonner_1.toast.error(payload.message, options);
            break;
        case "warning":
            sonner_1.toast.warning(payload.message, options);
            break;
        case "info":
        default:
            sonner_1.toast.message(payload.message, options);
    }
}
/**
 * Convenience functions
 */
function broadcastSuccess(message, title) {
    broadcastNotification("success", message, title);
}
exports.broadcastSuccess = broadcastSuccess;
function broadcastError(message, title) {
    broadcastNotification("error", message, title);
}
exports.broadcastError = broadcastError;
function broadcastWarning(message, title) {
    broadcastNotification("warning", message, title);
}
exports.broadcastWarning = broadcastWarning;
function broadcastInfo(message, title) {
    broadcastNotification("info", message, title);
}
exports.broadcastInfo = broadcastInfo;
/**
 * Cleanup on page unload
 */
function cleanupNotificationBroadcasting() {
    if (broadcastChannel) {
        broadcastChannel.close();
        broadcastChannel = null;
    }
}
exports.cleanupNotificationBroadcasting = cleanupNotificationBroadcasting;
/**
 * Custom hook for React components
 */
function useNotificationBroadcaster() {
    return {
        success: broadcastSuccess,
        error: broadcastError,
        warning: broadcastWarning,
        info: broadcastInfo,
        broadcast: broadcastNotification
    };
}
exports.useNotificationBroadcaster = useNotificationBroadcaster;
