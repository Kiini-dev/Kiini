"use strict";
/**
 * Customization Broadcast Utilities
 *
 * Provides BroadcastChannel API functions for cross-tab customization synchronization.
 * Separated from useCustomizationListener to avoid circular dependencies with stores.
 */
exports.__esModule = true;
exports.broadcastSystemUpdate = exports.broadcastHomepageUpdate = exports.broadcastThemeUpdate = exports.broadcastBrandUpdate = void 0;
var CHANNEL_NAME = "kiini_customization";
/**
 * Get or create a BroadcastChannel for customization updates
 * Gracefully handles environments where BroadcastChannel is not available
 */
function getBroadcastChannel() {
    try {
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
            return new BroadcastChannel(CHANNEL_NAME);
        }
    }
    catch (error) {
        // Silently fail - BroadcastChannel not available
    }
    return null;
}
/**
 * Broadcast brand customization updates to other tabs
 */
function broadcastBrandUpdate(brandConfig, companyBrand) {
    var channel = getBroadcastChannel();
    if (channel) {
        try {
            channel.postMessage({
                type: "brand",
                payload: { brandConfig: brandConfig, companyBrand: companyBrand }
            });
            channel.close();
        }
        catch (error) {
            // Silently fail - broadcast not critical
        }
    }
}
exports.broadcastBrandUpdate = broadcastBrandUpdate;
/**
 * Broadcast theme customization updates to other tabs
 */
function broadcastThemeUpdate(config) {
    var channel = getBroadcastChannel();
    if (channel) {
        try {
            channel.postMessage({
                type: "theme",
                payload: { config: config }
            });
            channel.close();
        }
        catch (error) {
            // Silently fail - broadcast not critical
        }
    }
}
exports.broadcastThemeUpdate = broadcastThemeUpdate;
/**
 * Broadcast homepage builder updates to other tabs
 */
function broadcastHomepageUpdate(widgets, widgetOrder) {
    var channel = getBroadcastChannel();
    if (channel) {
        try {
            channel.postMessage({
                type: "homepage",
                payload: { widgets: widgets, widgetOrder: widgetOrder }
            });
            channel.close();
        }
        catch (error) {
            // Silently fail - broadcast not critical
        }
    }
}
exports.broadcastHomepageUpdate = broadcastHomepageUpdate;
/**
 * Broadcast system settings updates to other tabs
 */
function broadcastSystemUpdate(settings) {
    var channel = getBroadcastChannel();
    if (channel) {
        try {
            channel.postMessage({
                type: "system",
                payload: { settings: settings }
            });
            channel.close();
        }
        catch (error) {
            // Silently fail - broadcast not critical
        }
    }
}
exports.broadcastSystemUpdate = broadcastSystemUpdate;
