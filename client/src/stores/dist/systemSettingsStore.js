"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.useSystemSettingsStore = void 0;
var zustand_1 = require("zustand");
var middleware_1 = require("zustand/middleware");
var customizationBroadcast_1 = require("@/hooks/customizationBroadcast");
var DEFAULT_SETTINGS = {
    applicationName: "CRM Platform",
    applicationDescription: "Enterprise CRM and Business Management System",
    maintenanceMode: false,
    maintenanceMessage: "The system is under maintenance. Please try again later.",
    autoBackupEnabled: true,
    backupFrequency: "daily",
    backupRetentionDays: 30,
    emailNotificationsEnabled: true,
    systemLogsEnabled: true,
    apiRateLimitPerMinute: 60,
    sessionTimeoutMinutes: 30,
    twoFactorAuthenticationRequired: false,
    fileUploadLimitMB: 100
};
exports.useSystemSettingsStore = zustand_1.create()(middleware_1.persist(function (set, get) { return ({
    settings: DEFAULT_SETTINGS,
    updateSettings: function (updates) {
        set(function (state) { return ({
            settings: __assign(__assign({}, state.settings), updates)
        }); });
        get().applySettingsToDOM();
        // Broadcast to all tabs
        var state = get();
        customizationBroadcast_1.broadcastSystemUpdate(state.settings);
    },
    resetSettings: function () {
        set({ settings: DEFAULT_SETTINGS });
        get().applySettingsToDOM();
    },
    getSettings: function () {
        return get().settings;
    },
    applySettingsToDOM: function () {
        var settings = get().settings;
        // Update application title in the document
        if (typeof document !== "undefined") {
            document.title = settings.applicationName;
        }
        // Apply CSS custom properties
        var root = document.documentElement;
        root.style.setProperty("--app-name", JSON.stringify(settings.applicationName));
        root.style.setProperty("--session-timeout", settings.sessionTimeoutMinutes + "m");
        // If maintenance mode is enabled, optionally show a banner
        if (settings.maintenanceMode && typeof window !== "undefined") {
            // Dispatch custom event that components can listen to
            window.dispatchEvent(new CustomEvent("maintenanceModeChanged", {
                detail: {
                    enabled: true,
                    message: settings.maintenanceMessage
                }
            }));
        }
    }
}); }, {
    name: "system-settings-store",
    version: 1
}));
// Apply settings on store initialization
if (typeof window !== "undefined") {
    exports.useSystemSettingsStore.getState().applySettingsToDOM();
}
