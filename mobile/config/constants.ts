/**
 * App Configuration
 * API URLs, feature flags, and environment settings
 */

import Constants from "expo-constants";

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://kiini.kiini.africa";

export const APP_NAME = "Kiini";
export const APP_VERSION = "1.0.0";

export const FEATURES = {
  AUTH: true,
  OFFLINE_SYNC: true,
  PUSH_NOTIFICATIONS: true,
  BIOMETRIC_LOGIN: true,
  DARK_MODE: true,
  MULTI_LANGUAGE: false, // Phase 2
  ADVANCED_ANALYTICS: false, // Phase 2
};

export const API_ENDPOINTS = {
  AUTH_LOGIN: "/auth/login",
  AUTH_LOGOUT: "/auth/logout",
  AUTH_REFRESH: "/auth/refresh",
  USERS_ME: "/users/me",
  INVOICES_LIST: "/invoices",
  INVOICES_CREATE: "/invoices/create",
  PAYMENTS_LIST: "/payments",
  CONTACTS_LIST: "/contacts",
  PROJECTS_LIST: "/projects",
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  REFRESH_TOKEN: "refresh_token",
  USER_DATA: "user_data",
  USER_PROFILE: "user_profile",
  ORGANIZATION_SETUP: "organization_setup",
  APP_PREFERENCES: "app_preferences",
  CACHED_DATA: "cached_data",
  ONBOARDING_COMPLETED: "onboarding_completed",
};

export const SYNC_CONFIG = {
  INTERVAL: 5 * 60 * 1000, // 5 minutes
  BATCH_SIZE: 50,
  MAX_RETRY: 3,
};

export const NOTIFICATION_SETTINGS = {
  INVOICE_REMINDERS: true,
  PAYMENT_ALERTS: true,
  SYSTEM_NOTIFICATIONS: true,
};

export const THEME = {
  colors: {
    primary: "#3b82f6",
    secondary: "#8b5cf6",
    success: "#10b981",
    danger: "#ef4444",
    warning: "#f59e0b",
    background: "#ffffff",
    surface: "#f9fafb",
    text: "#1f2937",
    border: "#e5e7eb",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

export const DEBUG = __DEV__;
