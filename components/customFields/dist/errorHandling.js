"use strict";
/**
 * Error Handling & Categorization Utility for Custom Fields
 * Provides consistent error messaging and categorization
 */
var _a, _b;
exports.__esModule = true;
exports.createErrorBoundaryMessage = exports.validateFieldValue = exports.validateSelectOptions = exports.validateFieldLabel = exports.validateFieldName = exports.createErrorNotification = exports.getActionErrorMessage = exports.formatValidationErrors = exports.categorizeError = exports.ErrorCategory = void 0;
var ErrorCategory;
(function (ErrorCategory) {
    ErrorCategory["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCategory["NETWORK_ERROR"] = "NETWORK_ERROR";
    ErrorCategory["PERMISSION_DENIED"] = "PERMISSION_DENIED";
    ErrorCategory["DUPLICATE_FIELD"] = "DUPLICATE_FIELD";
    ErrorCategory["NOT_FOUND"] = "NOT_FOUND";
    ErrorCategory["CONFLICT"] = "CONFLICT";
    ErrorCategory["SERVER_ERROR"] = "SERVER_ERROR";
    ErrorCategory["UNKNOWN"] = "UNKNOWN";
})(ErrorCategory = exports.ErrorCategory || (exports.ErrorCategory = {}));
// User-friendly error messages
var ERROR_MESSAGE_MAP = (_a = {},
    _a[ErrorCategory.VALIDATION_ERROR] = 'Please check your input and try again',
    _a[ErrorCategory.NETWORK_ERROR] = 'Network connection failed. Please check your connection and try again',
    _a[ErrorCategory.PERMISSION_DENIED] = 'You do not have permission to perform this action',
    _a[ErrorCategory.DUPLICATE_FIELD] = 'A field with this name already exists',
    _a[ErrorCategory.NOT_FOUND] = 'The field you are looking for does not exist',
    _a[ErrorCategory.CONFLICT] = 'This field has been modified by another user. Please refresh and try again',
    _a[ErrorCategory.SERVER_ERROR] = 'Server error. Please try again later',
    _a[ErrorCategory.UNKNOWN] = 'An unexpected error occurred. Please try again',
    _a);
// Error severity classification
var ERROR_SEVERITY_MAP = (_b = {},
    _b[ErrorCategory.VALIDATION_ERROR] = 'error',
    _b[ErrorCategory.NETWORK_ERROR] = 'error',
    _b[ErrorCategory.PERMISSION_DENIED] = 'error',
    _b[ErrorCategory.DUPLICATE_FIELD] = 'error',
    _b[ErrorCategory.NOT_FOUND] = 'warning',
    _b[ErrorCategory.CONFLICT] = 'warning',
    _b[ErrorCategory.SERVER_ERROR] = 'error',
    _b[ErrorCategory.UNKNOWN] = 'error',
    _b);
// Whether error is retryable
var RETRYABLE_ERRORS = new Set([
    ErrorCategory.NETWORK_ERROR,
    ErrorCategory.SERVER_ERROR,
    ErrorCategory.CONFLICT,
]);
/**
 * Categorize and format API errors
 */
exports.categorizeError = function (error) {
    var _a, _b, _c;
    // If already categorized, return as is
    if ((error === null || error === void 0 ? void 0 : error.code) && ERROR_MESSAGE_MAP[error.code]) {
        return error;
    }
    var category = ErrorCategory.UNKNOWN;
    var message = (error === null || error === void 0 ? void 0 : error.message) || 'An unexpected error occurred';
    var details;
    // Network errors
    if (isNetworkError(error)) {
        category = ErrorCategory.NETWORK_ERROR;
    }
    // HTTP status codes
    else if ((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.status) {
        var status = error.response.status;
        if (status === 400) {
            category = ErrorCategory.VALIDATION_ERROR;
            details = (_b = error.response.data) === null || _b === void 0 ? void 0 : _b.errors;
        }
        else if (status === 401 || status === 403) {
            category = ErrorCategory.PERMISSION_DENIED;
        }
        else if (status === 404) {
            category = ErrorCategory.NOT_FOUND;
        }
        else if (status === 409) {
            category = ErrorCategory.CONFLICT;
        }
        else if (status >= 500) {
            category = ErrorCategory.SERVER_ERROR;
        }
        message = ((_c = error.response.data) === null || _c === void 0 ? void 0 : _c.message) || message;
    }
    // Network timeout
    else if ((error === null || error === void 0 ? void 0 : error.code) === 'ETIMEDOUT' || (error === null || error === void 0 ? void 0 : error.code) === 'ECONNABORTED') {
        category = ErrorCategory.NETWORK_ERROR;
        message = 'Request timeout. Please check your connection and try again';
    }
    // Connection refused
    else if ((error === null || error === void 0 ? void 0 : error.code) === 'ECONNREFUSED') {
        category = ErrorCategory.NETWORK_ERROR;
        message = 'Unable to connect to server. Please try again later';
    }
    // Check for duplicate field error
    if (message === null || message === void 0 ? void 0 : message.toLowerCase().includes('duplicate')) {
        category = ErrorCategory.DUPLICATE_FIELD;
    }
    return {
        code: category,
        message: message,
        userMessage: ERROR_MESSAGE_MAP[category],
        severity: ERROR_SEVERITY_MAP[category],
        retryable: RETRYABLE_ERRORS.has(category),
        details: details
    };
};
/**
 * Check if error is a network error
 */
var isNetworkError = function (error) {
    var _a, _b, _c;
    return (!(error === null || error === void 0 ? void 0 : error.response) &&
        (((_a = error === null || error === void 0 ? void 0 : error.message) === null || _a === void 0 ? void 0 : _a.includes('Network')) || ((_b = error === null || error === void 0 ? void 0 : error.message) === null || _b === void 0 ? void 0 : _b.includes('ENOTFOUND')) || ((_c = error === null || error === void 0 ? void 0 : error.message) === null || _c === void 0 ? void 0 : _c.includes('ERR_NETWORK'))));
};
/**
 * Format validation errors for display
 */
exports.formatValidationErrors = function (errors) {
    var formatted = {};
    for (var _i = 0, _a = Object.entries(errors); _i < _a.length; _i++) {
        var _b = _a[_i], field = _b[0], error = _b[1];
        if (Array.isArray(error)) {
            formatted[field] = error[0];
        }
        else {
            formatted[field] = error;
        }
    }
    return formatted;
};
/**
 * Get action-specific error message
 */
exports.getActionErrorMessage = function (action, error) {
    var actionLabel = {
        create: 'creating',
        update: 'updating',
        "delete": 'deleting',
        fetch: 'loading'
    }[action];
    if (error.code === ErrorCategory.DUPLICATE_FIELD) {
        return "Cannot create field: " + error.userMessage;
    }
    if (error.code === ErrorCategory.VALIDATION_ERROR) {
        return "Validation failed while " + actionLabel + " field: " + error.userMessage;
    }
    if (error.code === ErrorCategory.PERMISSION_DENIED) {
        return "You don't have permission to " + action + " this field";
    }
    if (error.code === ErrorCategory.CONFLICT) {
        return "Failed to " + action + " field: " + error.userMessage;
    }
    return "Error " + actionLabel + " field: " + error.userMessage;
};
exports.createErrorNotification = function (error, action) {
    var actionLabel = action ? " while " + action + "ing field" : '';
    return {
        id: "error-" + Date.now(),
        title: error.severity === 'error' ? 'Error' : 'Warning',
        message: action
            ? exports.getActionErrorMessage(action, error)
            : error.userMessage,
        type: error.severity,
        dismissible: true,
        action: error.retryable
            ? {
                label: 'Retry',
                onClick: function () {
                    // Retry handled by caller
                }
            }
            : undefined
    };
};
/**
 * Validate field name format
 */
exports.validateFieldName = function (fieldName, existingNames, currentFieldId) {
    if (existingNames === void 0) { existingNames = []; }
    if (!fieldName || !fieldName.trim()) {
        return { valid: false, error: 'Field name is required' };
    }
    var trimmed = fieldName.trim();
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmed)) {
        return {
            valid: false,
            error: 'Field name must start with letter or underscore and contain only alphanumeric characters and underscores'
        };
    }
    if (trimmed.length > 64) {
        return {
            valid: false,
            error: 'Field name must be 64 characters or less'
        };
    }
    // Check for duplicates (excluding current field if updating)
    var isDuplicate = existingNames.some(function (name) { return name.toLowerCase() === trimmed.toLowerCase(); });
    if (isDuplicate) {
        return {
            valid: false,
            error: 'A field with this name already exists'
        };
    }
    return { valid: true };
};
/**
 * Validate field label
 */
exports.validateFieldLabel = function (label) {
    if (!label || !label.trim()) {
        return { valid: false, error: 'Field label is required' };
    }
    if (label.trim().length > 255) {
        return {
            valid: false,
            error: 'Field label must be 255 characters or less'
        };
    }
    return { valid: true };
};
/**
 * Validate select options
 */
exports.validateSelectOptions = function (options, fieldType) {
    if (!['select', 'multiSelect'].includes(fieldType)) {
        return { valid: true };
    }
    if (!options || options.length === 0) {
        return {
            valid: false,
            error: 'At least one option is required for select fields'
        };
    }
    if (options.length > 100) {
        return {
            valid: false,
            error: 'Maximum 100 options allowed'
        };
    }
    // Check for duplicates
    var uniqueOptions = new Set(options.map(function (o) { return o.toLowerCase(); }));
    if (uniqueOptions.size !== options.length) {
        return {
            valid: false,
            error: 'Duplicate options are not allowed'
        };
    }
    return { valid: true };
};
/**
 * Validate field value against type constraints
 */
exports.validateFieldValue = function (value, fieldType, constraints) {
    if (value === null || value === undefined || value === '') {
        // Allow empty values - required validation happens elsewhere
        return { valid: true };
    }
    switch (fieldType) {
        case 'text':
            if (typeof value !== 'string') {
                return { valid: false, error: 'Must be text' };
            }
            if ((constraints === null || constraints === void 0 ? void 0 : constraints.minLength) && value.length < constraints.minLength) {
                return {
                    valid: false,
                    error: "Minimum " + constraints.minLength + " characters required"
                };
            }
            if ((constraints === null || constraints === void 0 ? void 0 : constraints.maxLength) && value.length > constraints.maxLength) {
                return {
                    valid: false,
                    error: "Maximum " + constraints.maxLength + " characters allowed"
                };
            }
            break;
        case 'number':
            if (isNaN(value)) {
                return { valid: false, error: 'Must be a number' };
            }
            if ((constraints === null || constraints === void 0 ? void 0 : constraints.min) !== undefined && Number(value) < constraints.min) {
                return {
                    valid: false,
                    error: "Minimum value is " + constraints.min
                };
            }
            if ((constraints === null || constraints === void 0 ? void 0 : constraints.max) !== undefined && Number(value) > constraints.max) {
                return {
                    valid: false,
                    error: "Maximum value is " + constraints.max
                };
            }
            break;
        case 'email':
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                return { valid: false, error: 'Must be a valid email address' };
            }
            break;
        case 'phone':
            if (!/^[\d\s\-\+\(\)]+$/.test(value)) {
                return { valid: false, error: 'Must be a valid phone number' };
            }
            break;
        case 'date':
            if (!(value instanceof Date) && isNaN(Date.parse(value))) {
                return { valid: false, error: 'Must be a valid date' };
            }
            break;
        case 'url':
            try {
                new URL(value);
            }
            catch (_a) {
                return { valid: false, error: 'Must be a valid URL' };
            }
            break;
    }
    return { valid: true };
};
/**
 * Create a safe error boundary message
 */
exports.createErrorBoundaryMessage = function (error) {
    var isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment) {
        return error.message;
    }
    return 'Something went wrong. Please refresh the page or contact support.';
};
