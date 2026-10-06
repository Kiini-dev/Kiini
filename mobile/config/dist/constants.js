"use strict";
/**
 * App Configuration
 * API URLs, feature flags, and environment settings
 */
exports.__esModule = true;
exports.DEBUG = exports.THEME = exports.NOTIFICATION_SETTINGS = exports.SYNC_CONFIG = exports.STORAGE_KEYS = exports.API_ENDPOINTS = exports.FEATURES = exports.APP_VERSION = exports.APP_NAME = exports.API_URL = void 0;
exports.API_URL = process.env.EXPO_PUBLIC_API_URL || "https://kiini.africa";
exports.APP_NAME = "Kiini";
exports.APP_VERSION = "1.0.0";
exports.FEATURES = {
    AUTH: true,
    OFFLINE_SYNC: true,
    PUSH_NOTIFICATIONS: true,
    BIOMETRIC_LOGIN: true,
    DARK_MODE: true,
    MULTI_LANGUAGE: false,
    ADVANCED_ANALYTICS: false
};
exports.API_ENDPOINTS = {
    AUTH_LOGIN: "/auth/login",
    AUTH_LOGOUT: "/auth/logout",
    AUTH_REFRESH: "/auth/refresh",
    USERS_ME: "/users/me",
    INVOICES_LIST: "/invoices",
    INVOICES_CREATE: "/invoices/create",
    PAYMENTS_LIST: "/payments",
    CONTACTS_LIST: "/contacts",
    PROJECTS_LIST: "/projects"
};
exports.STORAGE_KEYS = {
    AUTH_TOKEN: "auth_token",
    REFRESH_TOKEN: "refresh_token",
    USER_DATA: "user_data",
    USER_PROFILE: "user_profile",
    ORGANIZATION_SETUP: "organization_setup",
    APP_PREFERENCES: "app_preferences",
    CACHED_DATA: "cached_data",
    ONBOARDING_COMPLETED: "onboarding_completed"
};
exports.SYNC_CONFIG = {
    INTERVAL: 5 * 60 * 1000,
    BATCH_SIZE: 50,
    MAX_RETRY: 3
};
exports.NOTIFICATION_SETTINGS = {
    INVOICE_REMINDERS: true,
    PAYMENT_ALERTS: true,
    SYSTEM_NOTIFICATIONS: true
};
exports.THEME = {
    colors: {
        primary: "#3b82f6",
        secondary: "#8b5cf6",
        success: "#10b981",
        danger: "#ef4444",
        warning: "#f59e0b",
        background: "#ffffff",
        surface: "#f9fafb",
        text: "#1f2937",
        border: "#e5e7eb"
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32
    }
};
exports.DEBUG = __DEV__;
