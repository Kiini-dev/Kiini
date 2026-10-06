"use strict";
exports.__esModule = true;
exports.formatDate = exports.formatCurrency = exports.cn = void 0;
var clsx_1 = require("clsx");
var tailwind_merge_1 = require("tailwind-merge");
function cn() {
    var _a, _b;
    var inputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        inputs[_i] = arguments[_i];
    }
    for (var i = 0; i < inputs.length; i++) {
        var val = inputs[i];
        if (val && typeof val === "object" && !Array.isArray(val)) {
            // Check for React elements / forwardRef objects passed to cn()
            if ("$$typeof" in val || "render" in val || "type" in val || "props" in val) {
                console.error("[cn] ERROR: React element/component object passed as argument at index " + i + ":", val, "\nStack trace:", new Error().stack);
            }
            // Check for any non-plain object (not a Record<string, unknown>)
            var proto = Object.getPrototypeOf(val);
            if (proto !== Object.prototype && proto !== null) {
                console.error("[cn] ERROR: Non-plain object passed as argument at index " + i + ":", (_b = (_a = Object.getPrototypeOf(val)) === null || _a === void 0 ? void 0 : _a.constructor) === null || _b === void 0 ? void 0 : _b.name, val, "\nStack trace:", new Error().stack);
            }
        }
    }
    return tailwind_merge_1.twMerge(clsx_1.clsx(inputs));
}
exports.cn = cn;
function formatCurrency(amount, currencyCode) {
    if (currencyCode === void 0) { currencyCode = "KES"; }
    // Amount is stored as a real number (not cents) — do NOT divide by 100
    return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: currencyCode
    }).format(amount);
}
exports.formatCurrency = formatCurrency;
function formatDate(date) {
    var dateObj = typeof date === "string" ? new Date(date) : date;
    // Use the shared formatter from utils/format.ts pattern
    try {
        var stored = localStorage.getItem('kiini_system_settings');
        if (stored) {
            var settings = JSON.parse(stored);
            if (settings.dateFormat) {
                var d = dateObj;
                var day = d.getDate();
                var dayPad = String(day).padStart(2, '0');
                var month = d.getMonth() + 1;
                var monthPad = String(month).padStart(2, '0');
                var year = d.getFullYear();
                var shortMonth = d.toLocaleDateString('en-US', { month: 'short' });
                var longMonth = d.toLocaleDateString('en-US', { month: 'long' });
                return settings.dateFormat
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
        }
    }
    catch (_a) { }
    return dateObj.toLocaleDateString("en-KE", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}
exports.formatDate = formatDate;
