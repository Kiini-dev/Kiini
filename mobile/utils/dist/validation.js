"use strict";
/**
 * Validation Utilities
 * Form validation and data validation helpers
 */
exports.__esModule = true;
exports.validateForm = exports.validators = void 0;
exports.validators = {
    email: function (email) {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    phone: function (phone) {
        var re = /^[\d\s\-\+\(\)]+$/;
        return re.test(phone) && phone.replace(/\D/g, "").length >= 10;
    },
    password: function (password) {
        return password.length >= 8;
    },
    url: function (url) {
        try {
            new URL(url);
            return true;
        }
        catch (_a) {
            return false;
        }
    },
    required: function (value) {
        if (typeof value === "string")
            return value.trim().length > 0;
        if (Array.isArray(value))
            return value.length > 0;
        return !!value;
    },
    minLength: function (value, min) {
        return value.length >= min;
    },
    maxLength: function (value, max) {
        return value.length <= max;
    }
};
function validateForm(data, rules) {
    var errors = {};
    Object.keys(rules).forEach(function (field) {
        var fieldRules = rules[field];
        for (var _i = 0, fieldRules_1 = fieldRules; _i < fieldRules_1.length; _i++) {
            var rule = fieldRules_1[_i];
            if (!rule(data[field])) {
                errors[field] = field + " is invalid";
                break;
            }
        }
    });
    return errors;
}
exports.validateForm = validateForm;
