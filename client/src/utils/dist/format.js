"use strict";
exports.__esModule = true;
exports.getRelativeTime = exports.formatNumber = exports.formatPercentage = exports.formatCurrency = exports.formatTime = exports.formatDateTime = exports.formatDate = void 0;
/**
 * Get the configured date format from SystemSettingsContext localStorage.
 * Returns a PHP-style format string (e.g. "d-m-Y", "Y-m-d", "m/d/Y").
 */
function getConfiguredDateFormat() {
    try {
        var stored = localStorage.getItem('kiini_system_settings');
        if (stored) {
            var settings = JSON.parse(stored);
            return settings.dateFormat || null;
        }
    }
    catch (_a) { }
    return null;
}
/**
 * Convert a PHP-style date format token to Intl options or manual format.
 * Supports: d-m-Y, Y-m-d, m/d/Y, d/m/Y, d M Y, M d Y, etc.
 */
function formatDateWithPattern(d, pattern) {
    var day = d.getDate();
    var dayPad = String(day).padStart(2, '0');
    var month = d.getMonth() + 1;
    var monthPad = String(month).padStart(2, '0');
    var year = d.getFullYear();
    var shortMonth = d.toLocaleDateString('en-US', { month: 'short' });
    var longMonth = d.toLocaleDateString('en-US', { month: 'long' });
    return pattern
        .replace(/dd/g, dayPad)
        .replace(/\bd\b/g, String(day))
        .replace(/MMMM/g, longMonth)
        .replace(/MMM/g, shortMonth)
        .replace(/MM/g, monthPad)
        .replace(/\bM\b/g, shortMonth)
        .replace(/yyyy/g, String(year))
        .replace(/\bY\b/g, String(year))
        .replace(/\by\b/g, String(year).slice(-2))
        .replace(/\bm\b/g, monthPad)
        .replace(/\bj\b/g, String(day))
        .replace(/\bF\b/g, longMonth)
        .replace(/\bn\b/g, String(month));
}
/**
 * Format date to readable string using configured date format.
 * Falls back to "Mar 15, 2025" if no setting configured.
 */
function formatDate(date) {
    try {
        var d = new Date(date);
        var pattern = getConfiguredDateFormat();
        if (pattern) {
            return formatDateWithPattern(d, pattern);
        }
        return d.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    }
    catch (_a) {
        return "Invalid date";
    }
}
exports.formatDate = formatDate;
/**
 * Format date and time (e.g., "Mar 15, 2025, 2:30 PM")
 */
function formatDateTime(date) {
    try {
        var d = new Date(date);
        var options = {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        };
        return d.toLocaleDateString("en-US", options);
    }
    catch (_a) {
        return "Invalid date";
    }
}
exports.formatDateTime = formatDateTime;
/**
 * Format time only (e.g., "2:30 PM")
 */
function formatTime(date) {
    try {
        var d = new Date(date);
        var options = {
            hour: "2-digit",
            minute: "2-digit"
        };
        return d.toLocaleTimeString("en-US", options);
    }
    catch (_a) {
        return "Invalid time";
    }
}
exports.formatTime = formatTime;
/**
 * Format currency (e.g., "Ksh 1,234.50")
 */
function formatCurrency(amount, currency) {
    if (currency === void 0) { currency = "KES"; }
    try {
        // Special handling for KES to match app's preferred format
        if (currency === "KES") {
            return "Ksh " + amount.toLocaleString("en-KE", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
        }
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency
        }).format(amount);
    }
    catch (_a) {
        return "Ksh " + amount.toFixed(2);
    }
}
exports.formatCurrency = formatCurrency;
/**
 * Format percentage (e.g., "12.5%")
 */
function formatPercentage(value, decimals) {
    if (decimals === void 0) { decimals = 1; }
    return (value * 100).toFixed(decimals) + "%";
}
exports.formatPercentage = formatPercentage;
/**
 * Format number with thousand separators (e.g., "1,234")
 */
function formatNumber(value, decimals) {
    if (decimals === void 0) { decimals = 0; }
    return value.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}
exports.formatNumber = formatNumber;
/**
 * Get relative time (e.g., "2 hours ago")
 */
function getRelativeTime(date) {
    try {
        var d = new Date(date);
        var now = new Date();
        var seconds = Math.floor((now.getTime() - d.getTime()) / 1000);
        if (seconds < 60)
            return "just now";
        if (seconds < 3600)
            return Math.floor(seconds / 60) + " minutes ago";
        if (seconds < 86400)
            return Math.floor(seconds / 3600) + " hours ago";
        if (seconds < 86400 * 7)
            return Math.floor(seconds / 86400) + " days ago";
        return formatDate(d);
    }
    catch (_a) {
        return "Invalid date";
    }
}
exports.getRelativeTime = getRelativeTime;
